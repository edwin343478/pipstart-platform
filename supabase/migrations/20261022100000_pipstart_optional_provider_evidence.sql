-- Dormant provider integration. No worker, send, activation or queue-state rewrite.
begin;
create table public.pipstart_optional_provider_receipts (
 job_id uuid primary key references public.pipstart_optional_email_jobs(id) on delete cascade,
 provider_id text not null unique check(provider_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'),
 prepared_hash text not null check(prepared_hash ~ '^[a-f0-9]{64}$'),
 api_ack_at timestamptz,signed_event_at timestamptz,
 unique(job_id,provider_id),check(api_ack_at is not null or signed_event_at is not null)
);
create table public.pipstart_optional_delivery_events (
 event_id text primary key check(event_id ~ '^[A-Za-z0-9_-]{1,200}$'),
 job_id uuid not null,provider_id text not null,
 event_type text not null check(event_type in ('email.sent','email.delivered','email.delivery_delayed','email.failed','email.bounced','email.complained','email.suppressed')),
 occurred_at timestamptz not null check(isfinite(occurred_at)),received_at timestamptz not null default clock_timestamp(),
 foreign key(job_id,provider_id) references public.pipstart_optional_provider_receipts(job_id,provider_id) on delete cascade
);
create index pipstart_optional_delivery_job on public.pipstart_optional_delivery_events(job_id,event_type);
alter table public.pipstart_optional_provider_receipts enable row level security;
alter table public.pipstart_optional_delivery_events enable row level security;
revoke all on public.pipstart_optional_provider_receipts,public.pipstart_optional_delivery_events from public,anon,authenticated,service_role;

create function public.pipstart_optional_prepared_digest(p_message jsonb)
returns text language sql immutable strict set search_path='' as $$
 select case when jsonb_typeof(p_message)='object' and jsonb_typeof(p_message->'headers')='object'
  and not exists(select 1 from unnest(array[jsonb_typeof(p_message->'jobId'),jsonb_typeof(p_message->'to'),jsonb_typeof(p_message->'subject'),jsonb_typeof(p_message->'html'),jsonb_typeof(p_message->'text'),jsonb_typeof(p_message->'headers'->'List-Unsubscribe'),jsonb_typeof(p_message->'headers'->'List-Unsubscribe-Post')]) t(v) where v is distinct from 'string')
 then (select encode(sha256(convert_to(string_agg(octet_length(convert_to(v,'UTF8'))::text||':'||v,'' order by n),'UTF8')),'hex') from unnest(array[p_message->>'jobId',p_message->>'to',p_message->>'subject',p_message->>'html',p_message->>'text',p_message->'headers'->>'List-Unsubscribe',p_message->'headers'->>'List-Unsubscribe-Post']) with ordinality t(v,n)) else null end;
$$;
revoke all on function public.pipstart_optional_prepared_digest(jsonb) from public,anon,authenticated,service_role;

-- Private invoker helper; only the owner-definer wrappers can call it.
create function public.pipstart_bind_optional_provider(p_job_id uuid,p_provider_id text,p_digest text,p_source text)
returns text language plpgsql set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;r public.pipstart_optional_provider_receipts%rowtype;
begin
 if (p_job_id is not null and p_provider_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' and p_digest ~ '^[a-f0-9]{64}$' and p_source in ('api','signed')) is distinct from true then raise exception 'Invalid optional receipt';end if;
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found then return 'ignored';end if;
 if j.status not in ('sending','accepted','manual') or j.prepared_message is null then return 'ignored';end if;
 if j.status='manual' and (j.reason is null or j.reason not in ('provider_uncertain','handoff_uncertain')) then return 'ignored';end if;
 if j.prepared_message->>'jobId' is distinct from j.id::text or public.pipstart_optional_prepared_digest(j.prepared_message) is distinct from p_digest or (j.provider_id is not null and j.provider_id<>p_provider_id) then raise exception 'Optional receipt conflict';end if;
 select * into r from public.pipstart_optional_provider_receipts where job_id=p_job_id;
 if found then
  if r.provider_id<>p_provider_id or r.prepared_hash<>p_digest then raise exception 'Optional receipt conflict';end if;
  if p_source='api' and r.api_ack_at is null then update public.pipstart_optional_provider_receipts set api_ack_at=clock_timestamp() where job_id=p_job_id;
  elsif p_source='signed' and r.signed_event_at is null then update public.pipstart_optional_provider_receipts set signed_event_at=clock_timestamp() where job_id=p_job_id;
  else return 'duplicate';end if;
  return 'bound';
 end if;
 insert into public.pipstart_optional_provider_receipts(job_id,provider_id,prepared_hash,api_ack_at,signed_event_at)
 values(p_job_id,p_provider_id,p_digest,case when p_source='api' then clock_timestamp() end,case when p_source='signed' then clock_timestamp() end);
 return 'bound';
end $$;
revoke all on function public.pipstart_bind_optional_provider(uuid,text,text,text) from public,anon,authenticated,service_role;

create function public.pipstart_record_optional_provider_ack(p_job_id uuid,p_provider_id text,p_digest text)
returns text language sql security definer set search_path='' as $$
 select public.pipstart_bind_optional_provider(p_job_id,p_provider_id,p_digest,'api');
$$;
revoke all on function public.pipstart_record_optional_provider_ack(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_record_optional_provider_ack(uuid,text,text) to service_role;

create function public.pipstart_record_optional_delivery_event(p_event_id text,p_job_id uuid,p_provider_id text,p_digest text,p_recipient text,p_type text,p_occurred_at timestamptz)
returns text language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;e public.pipstart_optional_delivery_events%rowtype;r text;
begin
 if (p_event_id ~ '^[A-Za-z0-9_-]{1,200}$' and p_job_id is not null and p_provider_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' and p_digest ~ '^[a-f0-9]{64}$'
  and public.pipstart_optional_address_hash(p_recipient) is not null and p_type in ('email.sent','email.delivered','email.delivery_delayed','email.failed','email.bounced','email.complained','email.suppressed') and p_occurred_at is not null and isfinite(p_occurred_at)) is distinct from true then raise exception 'Invalid optional delivery evidence';end if;
 perform pg_advisory_xact_lock(hashtextextended('pipstart-opt-delivery:'||p_event_id,0));
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found then return 'ignored';end if;
 if j.prepared_message is null then return 'ignored';end if;
 if j.provider_id is not null and j.provider_id<>p_provider_id then raise exception 'Optional delivery provider conflict';end if;
 if public.pipstart_optional_prepared_digest(j.prepared_message) is distinct from p_digest or public.pipstart_optional_address_hash(j.prepared_message->>'to') is distinct from public.pipstart_optional_address_hash(p_recipient) then raise exception 'Optional delivery evidence conflict';end if;
 select * into e from public.pipstart_optional_delivery_events where event_id=p_event_id;
 if found then
  if e.job_id=p_job_id and e.provider_id=p_provider_id and e.event_type=p_type and e.occurred_at=p_occurred_at then return 'duplicate';end if;
  raise exception 'Optional delivery evidence conflict';
 end if;
 r:=public.pipstart_bind_optional_provider(p_job_id,p_provider_id,p_digest,'signed');
 if r='ignored' then return 'ignored';end if;
 insert into public.pipstart_optional_delivery_events(event_id,job_id,provider_id,event_type,occurred_at) values(p_event_id,p_job_id,p_provider_id,p_type,p_occurred_at);
 return 'recorded';
end $$;
revoke all on function public.pipstart_record_optional_delivery_event(text,uuid,text,text,text,text,timestamptz) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_record_optional_delivery_event(text,uuid,text,text,text,text,timestamptz) to service_role;

create function public.pipstart_optional_provider_evidence(p_job_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce((select jsonb_build_object('status','known','queueStatus',j.status,'providerId',coalesce(r.provider_id,j.provider_id),'apiAcknowledged',r.api_ack_at is not null,'signedEvidence',r.signed_event_at is not null,'events',coalesce((select jsonb_agg(t.event_type order by t.event_type) from (select distinct event_type from public.pipstart_optional_delivery_events where job_id=j.id) t),'[]'::jsonb),'resendAllowed',false) from public.pipstart_optional_email_jobs j left join public.pipstart_optional_provider_receipts r on r.job_id=j.id where j.id=p_job_id),'{"status":"missing"}'::jsonb);
$$;
revoke all on function public.pipstart_optional_provider_evidence(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_optional_provider_evidence(uuid) to service_role;
commit;
