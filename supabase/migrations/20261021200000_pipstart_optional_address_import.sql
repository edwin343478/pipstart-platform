-- Separate export evidence. Never fabricate webhook event or provider message IDs.
begin;
create table public.pipstart_optional_address_import_batches (
 batch_id uuid primary key,
 provider_team text not null check(provider_team='agentkibubu25'),
 source_sha256 text not null check(source_sha256 ~ '^[a-f0-9]{64}$'),
 manifest_sha256 text not null check(manifest_sha256 ~ '^[a-f0-9]{64}$'),
 source_kind text not null default 'resend_team_suppression_export' check(source_kind='resend_team_suppression_export'),
 operator_attestation text not null check(operator_attestation='full_unfiltered_team_export'),
 source_count integer not null check(source_count between 1 and 10000),
 new_block_count integer not null default 0 check(new_block_count between 0 and source_count),
 imported_at timestamptz not null default transaction_timestamp(),
 unique(provider_team,source_sha256)
);
create table public.pipstart_optional_address_import_items (
 batch_id uuid not null references public.pipstart_optional_address_import_batches(batch_id),
 address_hash text not null references public.pipstart_optional_address_blocks(address_hash),
 source_record_sha256 text not null check(source_record_sha256 ~ '^[a-f0-9]{64}$'),
 source_reason text not null check(source_reason in ('bounce','complaint','manual','suppressed')),
 source_created_at timestamptz check(source_created_at is null or isfinite(source_created_at)),
 block_was_added boolean not null,
 primary key(batch_id,address_hash),unique(batch_id,source_record_sha256)
);
alter table public.pipstart_optional_address_import_batches enable row level security;
alter table public.pipstart_optional_address_import_items enable row level security;
revoke all on public.pipstart_optional_address_import_batches,public.pipstart_optional_address_import_items from public,anon,authenticated,service_role;

-- Invoker rights: database operator only. No service-role or application RPC grant.
create function public.pipstart_import_optional_address_snapshot(
 p_batch_id uuid,p_source_sha256 text,p_provider_team text,p_attestation text,p_items jsonb
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 item jsonb;manifest jsonb;manifest_hash text;source_time timestamptz;
 previous public.pipstart_optional_address_import_batches%rowtype;
 item_count integer;added integer;added_total integer:=0;observed_at timestamptz:=transaction_timestamp();
begin
 if (p_batch_id is not null and p_source_sha256 ~ '^[a-f0-9]{64}$' and p_provider_team='agentkibubu25' and p_attestation='full_unfiltered_team_export' and jsonb_typeof(p_items)='array') is distinct from true then
  raise exception using errcode='22023',message='Invalid import provenance';
 end if;
 if jsonb_array_length(p_items) not between 1 and 10000 or pg_column_size(p_items)>8000000 then
  raise exception using errcode='22023',message='Invalid import size';
 end if;
 item_count:=jsonb_array_length(p_items);
 -- Fully validate the batch before touching any durable table.
 for item in select value from jsonb_array_elements(p_items) loop
  if jsonb_typeof(item) is distinct from 'object' then raise exception using errcode='22023',message='Invalid import row';end if;
  if not(item ?& array['address_hash','source_record_sha256','source_reason','source_created_at']) or exists(select 1 from jsonb_object_keys(item) k where k not in ('address_hash','source_record_sha256','source_reason','source_created_at')) then
   raise exception using errcode='22023',message='Invalid import row keys';
  end if;
  if (jsonb_typeof(item->'address_hash')='string' and item->>'address_hash' ~ '^[a-f0-9]{64}$'
   and jsonb_typeof(item->'source_record_sha256')='string' and item->>'source_record_sha256' ~ '^[a-f0-9]{64}$'
   and jsonb_typeof(item->'source_reason')='string' and item->>'source_reason' in ('bounce','complaint','manual','suppressed')
   and jsonb_typeof(item->'source_created_at') in ('string','null')) is distinct from true then
   raise exception using errcode='22023',message='Invalid import row fields';
  end if;
  if item->>'source_created_at' is not null then
   begin source_time:=(item->>'source_created_at')::timestamptz;
   exception when others then raise exception using errcode='22023',message='Invalid source timestamp';end;
   if not isfinite(source_time) or source_time>observed_at+interval '5 minutes' then raise exception using errcode='22023',message='Invalid source timestamp';end if;
  end if;
 end loop;
 if (select count(distinct value->>'address_hash') from jsonb_array_elements(p_items))<>item_count
  or (select count(distinct value->>'source_record_sha256') from jsonb_array_elements(p_items))<>item_count then
  raise exception using errcode='22023',message='Duplicate import rows';
 end if;
 select jsonb_agg(value order by value->>'address_hash') into manifest from jsonb_array_elements(p_items);
 manifest_hash:=encode(sha256(convert_to(manifest::text,'UTF8')),'hex');
 -- Source and batch identity are independently fenced. Reordered identical rows are idempotent.
 perform pg_advisory_xact_lock(hashtextextended('pipstart-import-source:'||p_provider_team||':'||p_source_sha256,0));
 perform pg_advisory_xact_lock(hashtextextended('pipstart-import-batch:'||p_batch_id::text,0));
 select * into previous from public.pipstart_optional_address_import_batches where batch_id=p_batch_id;
 if found then
  if previous.source_sha256<>p_source_sha256 or previous.provider_team<>p_provider_team or previous.operator_attestation<>p_attestation or previous.manifest_sha256<>manifest_hash or previous.source_count<>item_count then
   raise exception using errcode='22023',message='Import identity conflict';
  end if;
  return jsonb_build_object('status','duplicate','source_count',previous.source_count,'original_new_block_count',previous.new_block_count);
 end if;
 if exists(select 1 from public.pipstart_optional_address_import_batches where provider_team=p_provider_team and source_sha256=p_source_sha256) then
  raise exception using errcode='22023',message='Source already imported under another batch';
 end if;
 insert into public.pipstart_optional_address_import_batches(batch_id,provider_team,source_sha256,manifest_sha256,operator_attestation,source_count)
 values(p_batch_id,p_provider_team,p_source_sha256,manifest_hash,p_attestation,item_count);
 for item in select value from jsonb_array_elements(manifest) order by value->>'address_hash' loop
  -- Existing blocks (including reason/timestamps) stay byte-for-byte unchanged.
  -- New block times describe observation at import, NOT the historical bounce time.
  insert into public.pipstart_optional_address_blocks(address_hash,reason,first_occurred_at,last_occurred_at)
  values(item->>'address_hash','provider_suppressed',observed_at,observed_at) on conflict(address_hash) do nothing;
  get diagnostics added=ROW_COUNT;added_total:=added_total+added;
  insert into public.pipstart_optional_address_import_items(batch_id,address_hash,source_record_sha256,source_reason,source_created_at,block_was_added)
  values(p_batch_id,item->>'address_hash',item->>'source_record_sha256',item->>'source_reason',(item->>'source_created_at')::timestamptz,added=1);
 end loop;
 update public.pipstart_optional_address_import_batches set new_block_count=added_total where batch_id=p_batch_id;
 return jsonb_build_object('status','imported','source_count',item_count,'original_new_block_count',added_total);
end $$;
revoke all on function public.pipstart_import_optional_address_snapshot(uuid,text,text,text,jsonb) from public,anon,authenticated,service_role;
commit;
