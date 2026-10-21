-- Generated fixtures in an isolated test database only; rollback everything.
begin;
create function public.m21_generated_import_fault() returns trigger language plpgsql as $$
begin
 if new.source_record_sha256=repeat('f',64) then raise exception using errcode='ZX002',message='generated audit failure';end if;
 return new;
end $$;
create trigger m21_generated_import_fault before insert on public.pipstart_optional_address_import_items for each row execute function public.m21_generated_import_fault();
do $$
declare
 u uuid:='00000000-0000-4000-8000-000000000091';batch uuid:='00000000-0000-4000-8000-000000000092';
 h text:=public.pipstart_optional_address_hash('import-generated@example.test');
 existing_h text:=public.pipstart_optional_address_hash('existing-generated@example.test');
 items jsonb;reversed_items jsonb;bad jsonb;r jsonb;j uuid;before_block jsonb;before_auth jsonb;before_preferences jsonb;before_batch jsonb;events_before integer;blocks_before integer;first_fault_hash text;second_fault_hash text;
begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'import-generated@example.test',now());
 if public.pipstart_optional_email_dispatch_state(u)->>'status'<>'active' then raise exception 'initial eligibility';end if;
 j:=(public.pipstart_enqueue_optional_email(u,'import-before','learning_lesson','Generated','<p>Generated</p>','Generated')->>'jobId')::uuid;
 if j is null then raise exception 'generated queue setup';end if;
 perform public.pipstart_record_optional_address_block('generated-existing-import','generated-provider-import','existing-generated@example.test','complaint',now()-interval '1 day');
 select to_jsonb(b) into before_block from public.pipstart_optional_address_blocks b where address_hash=existing_h;
 select to_jsonb(a) into before_auth from auth.users a where id=u;
 select to_jsonb(p) into before_preferences from public.pipstart_email_preferences p where user_id=u;
 select count(*) into events_before from public.pipstart_optional_address_events;
 select count(*) into blocks_before from public.pipstart_optional_address_blocks;
 items:=jsonb_build_array(
  jsonb_build_object('address_hash',h,'source_record_sha256',repeat('1',64),'source_reason','bounce','source_created_at',now()-interval '2 days'),
  jsonb_build_object('address_hash',existing_h,'source_record_sha256',repeat('2',64),'source_reason','complaint','source_created_at',null));
 r:=public.pipstart_import_optional_address_snapshot(batch,repeat('a',64),'agentkibubu25','full_unfiltered_team_export',items);
 if r<>jsonb_build_object('status','imported','source_count',2,'original_new_block_count',1) then raise exception 'import result';end if;
 if not public.pipstart_optional_address_is_blocked('IMPORT-generated@EXAMPLE.TEST') then raise exception 'import not enforced';end if;
 if not exists(select 1 from public.pipstart_optional_address_blocks where address_hash=h and reason='provider_suppressed' and first_occurred_at=transaction_timestamp() and last_occurred_at=transaction_timestamp()) then raise exception 'invented bounce/time';end if;
 if (select to_jsonb(b) from public.pipstart_optional_address_blocks b where address_hash=existing_h)<>before_block then raise exception 'existing block changed';end if;
 if (select count(*) from public.pipstart_optional_address_events)<>events_before then raise exception 'fabricated webhook events';end if;
 if (select count(*) from public.pipstart_optional_address_blocks)<>blocks_before+1 then raise exception 'block count';end if;
 if (select count(*) from public.pipstart_optional_address_import_items where batch_id=batch)<>2 then raise exception 'source evidence missing';end if;
 if not exists(select 1 from public.pipstart_optional_address_import_items where batch_id=batch and address_hash=h and source_reason='bounce' and block_was_added) then raise exception 'source reason lost';end if;
 if public.pipstart_optional_email_dispatch_state(u)<>'{"status":"inactive"}'::jsonb then raise exception 'dispatch bypass';end if;
 if public.pipstart_enqueue_optional_email(u,'import-after','partner_offer','Generated','<p>Generated</p>','Generated')->>'reason'<>'account_inactive' then raise exception 'queue bypass';end if;
 if (select status from public.pipstart_optional_email_jobs where id=j)<>'pending' then raise exception 'old queue changed';end if;
 if (select to_jsonb(a) from auth.users a where id=u)<>before_auth or (select to_jsonb(p) from public.pipstart_email_preferences p where user_id=u)<>before_preferences then raise exception 'learner state changed';end if;
 select to_jsonb(b) into before_batch from public.pipstart_optional_address_import_batches b where batch_id=batch;
 reversed_items:=jsonb_build_array(items->1,items->0);
 r:=public.pipstart_import_optional_address_snapshot(batch,repeat('a',64),'agentkibubu25','full_unfiltered_team_export',reversed_items);
 if r->>'status'<>'duplicate' or (select to_jsonb(b) from public.pipstart_optional_address_import_batches b where batch_id=batch)<>before_batch then raise exception 'batch replay not stable';end if;
 -- Any changed source identity or body must fail rather than add/update evidence.
 begin
  perform public.pipstart_import_optional_address_snapshot(batch,repeat('b',64),'agentkibubu25','full_unfiltered_team_export',items);
  raise exception using errcode='ZX001',message='source conflict accepted';
 exception when sqlstate '22023' then null;end;
 begin
  perform public.pipstart_import_optional_address_snapshot(batch,repeat('a',64),'agentkibubu25','full_unfiltered_team_export',jsonb_set(items,'{0,source_reason}','"manual"'));
  raise exception using errcode='ZX001',message='manifest conflict accepted';
 exception when sqlstate '22023' then null;end;
 begin
  perform public.pipstart_import_optional_address_snapshot('00000000-0000-4000-8000-000000000093',repeat('a',64),'agentkibubu25','full_unfiltered_team_export',items);
  raise exception using errcode='ZX001',message='source reused under fresh batch';
 exception when sqlstate '22023' then null;end;
 -- Malformed later rows cannot partially import the earlier valid row.
 foreach bad in array array[
  'null'::jsonb,'{}'::jsonb,'[]'::jsonb,jsonb_build_array(items->0,items->0),
  jsonb_build_array(items->0,jsonb_set(items->1,'{address_hash}','"invalid"')),
  jsonb_build_array(items->0,jsonb_set(items->1,'{source_reason}','"unknown"')),
  jsonb_build_array(items->0,jsonb_set(items->1,'{source_created_at}','"infinity"')),
  jsonb_build_array(items->0,jsonb_set(items->1,'{source_created_at}',to_jsonb((now()+interval '1 day')::text))),
  jsonb_build_array((items->0)||'{"email":"must-not-store@example.test"}'::jsonb),
  jsonb_build_array((items->0)-'source_created_at'),
  jsonb_build_array(jsonb_set(items->0,'{source_created_at}','42'::jsonb))
 ] loop
  begin
   perform public.pipstart_import_optional_address_snapshot('00000000-0000-4000-8000-000000000094',repeat('c',64),'agentkibubu25','full_unfiltered_team_export',bad);
   raise exception using errcode='ZX001',message='invalid batch accepted';
  exception when sqlstate '22023' then null;end;
 end loop;
 begin
  perform public.pipstart_import_optional_address_snapshot('00000000-0000-4000-8000-000000000094',repeat('c',64),'other-team','full_unfiltered_team_export',items);
  raise exception using errcode='ZX001',message='wrong team';
 exception when sqlstate '22023' then null;end;
 if (select count(*) from public.pipstart_optional_address_import_batches)<>1 or (select count(*) from public.pipstart_optional_address_import_items)<>2 then raise exception 'partial evidence writes';end if;
 -- Force a failure after both blocks and the first audit row have been attempted.
 first_fault_hash:=least(public.pipstart_optional_address_hash('fault-a@example.test'),public.pipstart_optional_address_hash('fault-b@example.test'));
 second_fault_hash:=greatest(public.pipstart_optional_address_hash('fault-a@example.test'),public.pipstart_optional_address_hash('fault-b@example.test'));
 begin
  perform public.pipstart_import_optional_address_snapshot('00000000-0000-4000-8000-000000000096',repeat('e',64),'agentkibubu25','full_unfiltered_team_export',jsonb_build_array(
   jsonb_build_object('address_hash',first_fault_hash,'source_record_sha256',repeat('4',64),'source_reason','manual','source_created_at',null),
   jsonb_build_object('address_hash',second_fault_hash,'source_record_sha256',repeat('f',64),'source_reason','manual','source_created_at',null)));
  raise exception using errcode='ZX001',message='audit failure not propagated';
 exception when sqlstate 'ZX002' then null;end;
 if exists(select 1 from public.pipstart_optional_address_blocks where address_hash in (first_fault_hash,second_fault_hash)) or (select count(*) from public.pipstart_optional_address_import_batches)<>1 or (select count(*) from public.pipstart_optional_address_import_items)<>2 then raise exception 'audit failure left partial block/evidence';end if;
 -- Later authentic evidence may strengthen an imported generic block normally.
 perform public.pipstart_record_optional_address_block('generated-after-import','generated-after-provider','import-generated@example.test','complaint',now());
 if (select reason from public.pipstart_optional_address_blocks where address_hash=h)<>'complaint' then raise exception 'webhook cannot strengthen imported block';end if;
 if public.pipstart_import_optional_address_snapshot(batch,repeat('a',64),'agentkibubu25','full_unfiltered_team_export',items)->>'status'<>'duplicate' or (select reason from public.pipstart_optional_address_blocks where address_hash=h)<>'complaint' then raise exception 'reimport weakened authentic evidence';end if;
 delete from auth.users where id=u;
 insert into auth.users(id,email,email_confirmed_at) values(u,'import-generated@example.test',now());
 if public.pipstart_optional_email_dispatch_state(u)->>'status'<>'inactive' then raise exception 're-registration lost import block';end if;
end $$;
do $$
declare r text;t text;
begin
 foreach t in array array['pipstart_optional_address_import_batches','pipstart_optional_address_import_items'] loop
  if not (select relrowsecurity from pg_class where oid=('public.'||t)::regclass) then raise exception 'RLS missing';end if;
  foreach r in array array['anon','authenticated','service_role'] loop
   if has_table_privilege(r,'public.'||t,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then raise exception 'API table grant';end if;
  end loop;
 end loop;
 foreach r in array array['anon','authenticated','service_role'] loop
  if has_function_privilege(r,'public.pipstart_import_optional_address_snapshot(uuid,text,text,text,jsonb)','EXECUTE') then raise exception 'API import grant';end if;
 end loop;
 if not exists(select 1 from pg_proc where oid='public.pipstart_import_optional_address_snapshot(uuid,text,text,text,jsonb)'::regprocedure and not prosecdef and proconfig @> array['search_path=""']) then raise exception 'invoker/private path';end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name in ('pipstart_optional_address_import_batches','pipstart_optional_address_import_items') and column_name in ('email','address','payload','reason_detail','event_id','message_id')) then raise exception 'raw/fabricated evidence columns';end if;
end $$;
rollback;
