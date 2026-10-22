-- Compatibility facts only. No redaction/cleanup/activation or job-state changes.
begin;
lock table public.pipstart_optional_email_jobs in share row exclusive mode;
create function public.pipstart_optional_content_digest(p_kind text,p_subject text,p_html text,p_text text)
returns text language sql immutable strict set search_path='' as $$
 select encode(sha256(convert_to(string_agg(octet_length(convert_to(v,'UTF8'))::text||':'||v,'' order by n),'UTF8')),'hex')
 from unnest(array[p_kind,p_subject,p_html,p_text]) with ordinality t(v,n);
$$;
revoke all on function public.pipstart_optional_content_digest(text,text,text,text) from public,anon,authenticated,service_role;
create table public.pipstart_optional_content_facts (
 job_id uuid primary key references public.pipstart_optional_email_jobs(id) on delete cascade,
 content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 prepared_hash text check(prepared_hash ~ '^[a-f0-9]{64}$'),
 recipient_hash text check(recipient_hash ~ '^[a-f0-9]{64}$'),
 envelope_recorded_at timestamptz,
 minimized_at timestamptz check(minimized_at is null or isfinite(minimized_at)),
 check((prepared_hash is null and recipient_hash is null and envelope_recorded_at is null)
  or (prepared_hash is not null and recipient_hash is not null and envelope_recorded_at is not null and isfinite(envelope_recorded_at)))
);
alter table public.pipstart_optional_content_facts enable row level security;
revoke all on public.pipstart_optional_content_facts from public,anon,authenticated,service_role;
do $$begin
 if exists(select 1 from public.pipstart_optional_email_jobs j where j.prepared_message is not null and
  (public.pipstart_optional_prepared_digest(j.prepared_message) is null or public.pipstart_optional_address_hash(j.prepared_message->>'to') is null
   or j.prepared_message->>'jobId' is distinct from j.id::text or j.prepared_message->>'subject' is distinct from j.subject)) then
  raise exception 'Existing prepared optional job requires review';end if;
end $$;
insert into public.pipstart_optional_content_facts(job_id,content_hash,prepared_hash,recipient_hash,envelope_recorded_at)
select j.id,public.pipstart_optional_content_digest(j.kind,j.subject,j.html,j.body_text),
 case when j.prepared_message is not null then public.pipstart_optional_prepared_digest(j.prepared_message) end,
 case when j.prepared_message is not null then public.pipstart_optional_address_hash(j.prepared_message->>'to') end,
 case when j.prepared_message is not null then greatest(j.created_at,j.updated_at) end
from public.pipstart_optional_email_jobs j;
do $$begin
 if exists(select 1 from public.pipstart_optional_provider_receipts r join public.pipstart_optional_content_facts f on f.job_id=r.job_id
  where r.prepared_hash is distinct from f.prepared_hash) then raise exception 'Existing provider binding requires review';end if;
end $$;

create function public.pipstart_capture_optional_content_facts()
returns trigger language plpgsql set search_path='' as $$
declare f public.pipstart_optional_content_facts%rowtype;h text;d text;a text;
begin
 h:=public.pipstart_optional_content_digest(new.kind,new.subject,new.html,new.body_text);
 select * into f from public.pipstart_optional_content_facts where job_id=new.id for update;
 if found and f.minimized_at is not null then
  if new.status not in ('accepted','suppressed') or new.kind is distinct from old.kind
   or new.subject<>'[Content removed]' or new.html<>'<p>Content removed.</p>' or new.body_text<>'Content removed.' or new.prepared_message is not null then
   raise exception 'Invalid minimized optional job';end if;
  return new;
 end if;
 if found and f.content_hash is distinct from h then
  if f.prepared_hash is not null then raise exception 'Handed-off optional content is immutable';end if;
  -- No content-edit RPC is added. Privileged pre-handoff edits keep facts honest.
  update public.pipstart_optional_content_facts set content_hash=h where job_id=new.id;
 end if;
 if new.prepared_message is not null then
  d:=public.pipstart_optional_prepared_digest(new.prepared_message);a:=public.pipstart_optional_address_hash(new.prepared_message->>'to');
  if d is null or a is null or new.prepared_message->>'jobId' is distinct from new.id::text or new.prepared_message->>'subject' is distinct from new.subject then raise exception 'Invalid optional envelope facts';end if;
 end if;
 if tg_op='INSERT' then
  insert into public.pipstart_optional_content_facts(job_id,content_hash,prepared_hash,recipient_hash,envelope_recorded_at)
   values(new.id,h,d,a,case when d is not null then clock_timestamp() end);
 else
  if f.job_id is null then raise exception 'Optional content facts missing';end if;
  if f.prepared_hash is not null and (f.prepared_hash is distinct from d or f.recipient_hash is distinct from a) then raise exception 'Optional envelope is immutable';end if;
  if f.prepared_hash is null and d is not null then
   update public.pipstart_optional_content_facts set prepared_hash=d,recipient_hash=a,envelope_recorded_at=clock_timestamp() where job_id=new.id;
  end if;
 end if;
 return new;
end $$;
revoke all on function public.pipstart_capture_optional_content_facts() from public,anon,authenticated,service_role;
create trigger pipstart_optional_content_facts_capture after insert or update of kind,subject,html,body_text,prepared_message
 on public.pipstart_optional_email_jobs for each row execute function public.pipstart_capture_optional_content_facts();

create or replace function public.pipstart_enqueue_optional_email(p_user_id uuid,p_dedupe_key text,p_kind text,p_subject text,p_html text,p_text text,p_available_at timestamptz default now())
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;s jsonb;
begin
 if (p_user_id is not null and p_dedupe_key ~ '^[A-Za-z0-9_-]{1,100}$' and p_kind in ('learning_lesson','learning_weekly','partner_offer')
  and char_length(btrim(p_subject)) between 1 and 200 and p_subject !~ E'[\r\n]'
  and char_length(btrim(p_html)) between 1 and 200000 and char_length(btrim(p_text)) between 1 and 100000
  and p_available_at is not null and isfinite(p_available_at)) is distinct from true then raise exception 'Invalid optional job';end if;
 select * into j from public.pipstart_optional_email_jobs where user_id=p_user_id and dedupe_key=p_dedupe_key;
 if not found then
  s:=public.pipstart_optional_email_dispatch_state(p_user_id);
  if s->>'status'<>'active' then return jsonb_build_object('status','suppressed','reason','account_inactive');end if;
  if (p_kind='partner_offer' and not (s->>'partner')::boolean) or (p_kind<>'partner_offer' and not (s->>'learning')::boolean) then return jsonb_build_object('status','suppressed','reason','opted_out');end if;
  if p_kind<>'partner_offer' and s->>'frequency'<>(case when p_kind='learning_weekly' then 'weekly' else 'all' end) then return jsonb_build_object('status','suppressed','reason','frequency_changed');end if;
  insert into public.pipstart_optional_email_jobs(user_id,dedupe_key,kind,subject,html,body_text,available_at)
   values(p_user_id,p_dedupe_key,p_kind,p_subject,p_html,p_text,p_available_at) on conflict(user_id,dedupe_key) do nothing returning * into j;
  if found then return jsonb_build_object('status','queued','jobId',j.id);end if;
  select * into j from public.pipstart_optional_email_jobs where user_id=p_user_id and dedupe_key=p_dedupe_key;
 end if;
 if exists(select 1 from public.pipstart_optional_content_facts f where f.job_id=j.id and f.content_hash=public.pipstart_optional_content_digest(p_kind,p_subject,p_html,p_text)) then return jsonb_build_object('status','duplicate','jobId',j.id);end if;
 return jsonb_build_object('status','conflict');
end $$;
create or replace function public.pipstart_bind_optional_provider(p_job_id uuid,p_provider_id text,p_digest text,p_source text)
returns text language plpgsql set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;r public.pipstart_optional_provider_receipts%rowtype;f public.pipstart_optional_content_facts%rowtype;
begin
 if (p_job_id is not null and p_provider_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' and p_digest ~ '^[a-f0-9]{64}$' and p_source in ('api','signed')) is distinct from true then raise exception 'Invalid optional receipt';end if;
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found then return 'ignored';end if;
 if j.status not in ('sending','accepted','manual') then return 'ignored';end if;
 select * into f from public.pipstart_optional_content_facts where job_id=j.id;
 if not found or f.prepared_hash is null then return 'ignored';end if;
 if j.prepared_message is null and (j.status<>'accepted' or f.minimized_at is null) then return 'ignored';end if;
 if j.status='manual' and (j.reason is null or j.reason not in ('provider_uncertain','handoff_uncertain')) then return 'ignored';end if;
 if f.prepared_hash is distinct from p_digest or (j.provider_id is not null and j.provider_id<>p_provider_id) then raise exception 'Optional receipt conflict';end if;
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
create or replace function public.pipstart_record_optional_delivery_event(p_event_id text,p_job_id uuid,p_provider_id text,p_digest text,p_recipient text,p_type text,p_occurred_at timestamptz)
returns text language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;e public.pipstart_optional_delivery_events%rowtype;r text;f public.pipstart_optional_content_facts%rowtype;
begin
 if (p_event_id ~ '^[A-Za-z0-9_-]{1,200}$' and p_job_id is not null and p_provider_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' and p_digest ~ '^[a-f0-9]{64}$'
  and public.pipstart_optional_address_hash(p_recipient) is not null and p_type in ('email.sent','email.delivered','email.delivery_delayed','email.failed','email.bounced','email.complained','email.suppressed') and p_occurred_at is not null and isfinite(p_occurred_at)) is distinct from true then raise exception 'Invalid optional delivery evidence';end if;
 perform pg_advisory_xact_lock(hashtextextended('pipstart-opt-delivery:'||p_event_id,0));
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found then return 'ignored';end if;
 select * into f from public.pipstart_optional_content_facts where job_id=j.id;
 if not found or f.prepared_hash is null then return 'ignored';end if;
 if j.prepared_message is null and (j.status<>'accepted' or f.minimized_at is null) then return 'ignored';end if;
 if j.provider_id is not null and j.provider_id<>p_provider_id then raise exception 'Optional delivery provider conflict';end if;
 if f.prepared_hash is distinct from p_digest or f.recipient_hash is distinct from public.pipstart_optional_address_hash(p_recipient) then raise exception 'Optional delivery evidence conflict';end if;
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
-- Existing RPC ACLs/signatures remain unchanged. New helpers/table are private.
commit;
