-- Dormant handoff budget. No worker, scheduler, producer, provider request or enable switch.
begin;
lock table public.pipstart_optional_email_jobs in share row exclusive mode;
create table public.pipstart_optional_email_reservations (
 job_id uuid primary key,
 address_hash text not null check(address_hash ~ '^[a-f0-9]{64}$'),
 kind text not null check(kind in ('learning_lesson','learning_weekly','partner_offer')),
 reserved_at timestamptz not null default clock_timestamp() check(isfinite(reserved_at))
);
-- Deliberately no account/job FK: deletion must not reset address/global budgets.
create index pipstart_optional_reservations_address on public.pipstart_optional_email_reservations(address_hash,reserved_at desc);
create index pipstart_optional_reservations_time on public.pipstart_optional_email_reservations(reserved_at desc);
alter table public.pipstart_optional_email_reservations enable row level security;
revoke all on public.pipstart_optional_email_reservations from public,anon,authenticated,service_role;

-- Conservatively account for any existing durable prepared handoff, including unknown outcomes.
-- The last known checkpoint time is used, not an invented delivery timestamp.
do $$begin
 if exists(select 1 from public.pipstart_optional_email_jobs where prepared_message is not null and public.pipstart_optional_address_hash(prepared_message->>'to') is null) then
  raise exception 'Existing optional handoff has unsupported recipient; review before migration';
 end if;
end $$;
insert into public.pipstart_optional_email_reservations(job_id,address_hash,kind,reserved_at)
select id,public.pipstart_optional_address_hash(prepared_message->>'to'),kind,greatest(created_at,updated_at)
from public.pipstart_optional_email_jobs where prepared_message is not null;

alter table public.pipstart_optional_email_jobs drop constraint pipstart_optional_email_jobs_reason_check;
alter table public.pipstart_optional_email_jobs add constraint pipstart_optional_email_jobs_reason_check
 check(reason in ('account_inactive','opted_out','frequency_changed','preflight_unavailable','attempts_exhausted','eligibility_unavailable','recipient_changed','provider_uncertain','handoff_uncertain','cadence_limited'));

create or replace function public.pipstart_begin_optional_email(p_job_id uuid,p_token uuid,p_message jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;h text;t timestamptz;due timestamptz;boundary timestamptz;
begin
 -- One lock order and one global critical section protect ALL overlapping budgets.
 -- The low-volume initial global cap is 50 handoff reservations / rolling 24 hours.
 perform pg_advisory_xact_lock(hashtextextended('pipstart-optional-cadence-v1',0));
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 t:=clock_timestamp();
 if not found or j.status<>'preparing' or j.lease_token is distinct from p_token or j.lease_until<=t then return false;end if;
 if (jsonb_typeof(p_message)='object' and (select array_agg(k order by k) from jsonb_object_keys(p_message) k)=array['headers','html','jobId','subject','text','to']
  and p_message->>'jobId'=j.id::text and p_message->>'subject'=j.subject
  and jsonb_typeof(p_message->'to')='string' and char_length(p_message->>'to') between 3 and 254 and p_message->>'to' ~ '^[^[:space:]@<>,]+@[^[:space:]@<>,]+[.][^[:space:]@<>,]+$'
  and jsonb_typeof(p_message->'html')='string' and char_length(p_message->>'html') between 1 and 205000
  and jsonb_typeof(p_message->'text')='string' and char_length(p_message->>'text') between 1 and 102000
  and jsonb_typeof(p_message->'headers')='object' and (select array_agg(k order by k) from jsonb_object_keys(p_message->'headers') k)=array['List-Unsubscribe','List-Unsubscribe-Post']
  and p_message->'headers'->>'List-Unsubscribe' ~ '^<https://pipstart[.]net/unsubscribe[?]token=[a-f0-9]{64}>$'
  and p_message->'headers'->>'List-Unsubscribe-Post'='List-Unsubscribe=One-Click') is distinct from true then raise exception 'Invalid prepared optional message';end if;
 h:=public.pipstart_optional_address_hash(p_message->>'to');
 if h is null then raise exception 'Unsupported optional recipient';end if;
 due:=t;
 -- All optional categories together: at most one handoff / recipient / 24 hours.
 select max(reserved_at)+interval '24 hours' into boundary from public.pipstart_optional_email_reservations where address_hash=h;
 due:=greatest(due,boundary);
 if j.kind='partner_offer' then
  select max(reserved_at)+interval '720 hours' into boundary from public.pipstart_optional_email_reservations where address_hash=h and kind='partner_offer';
 elsif j.kind='learning_weekly' then
  -- Both learning kinds count, so changing frequency cannot reset its allowance.
  select max(reserved_at)+interval '168 hours' into boundary from public.pipstart_optional_email_reservations where address_hash=h and kind in ('learning_lesson','learning_weekly');
 else
  select reserved_at+interval '168 hours' into boundary from public.pipstart_optional_email_reservations
   where address_hash=h and kind in ('learning_lesson','learning_weekly') and reserved_at>t-interval '168 hours'
   order by reserved_at desc offset 2 limit 1;
 end if;
 due:=greatest(due,boundary);
 select reserved_at+interval '24 hours' into boundary from public.pipstart_optional_email_reservations
  where reserved_at>t-interval '24 hours' order by reserved_at desc offset 49 limit 1;
 due:=greatest(due,boundary);
 if due>t then
  -- Proven pre-handoff deferral: no SENDING marker, reservation or provider call.
  -- Do not exhaust preparation retries simply because a known cap has not elapsed.
  update public.pipstart_optional_email_jobs set status='pending',available_at=due,attempts=greatest(attempts-1,0),
   reason='cadence_limited',lease_token=null,lease_until=null,updated_at=t where id=j.id;
  return false;
 end if;
 insert into public.pipstart_optional_email_reservations(job_id,address_hash,kind,reserved_at) values(j.id,h,j.kind,t);
 update public.pipstart_optional_email_jobs set status='sending',prepared_message=p_message,lease_until=null,updated_at=t where id=j.id;
 return true;
end $$;
revoke all on function public.pipstart_begin_optional_email(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_begin_optional_email(uuid,uuid,jsonb) to service_role;
commit;
