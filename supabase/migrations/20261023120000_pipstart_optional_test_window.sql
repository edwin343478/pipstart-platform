-- Default-closed, one-job acceptance permit. Not customer-campaign activation.
begin;
set local lock_timeout='5s';
lock table public.pipstart_optional_worker_slot in share row exclusive mode;
lock table public.pipstart_optional_email_jobs in share row exclusive mode;
do $$begin
 if exists(select 1 from public.pipstart_optional_worker_slot where run_token is not null)
 or exists(select 1 from public.pipstart_optional_email_jobs where status in ('preparing','sending')) then
  raise exception 'Optional executors/jobs require review before installing test-window controls';
 end if;
end $$;

create table public.pipstart_optional_test_window (
 singleton boolean primary key default true check(singleton),
 job_id uuid,
 allowed_until timestamptz,
 revision bigint not null default 0 check(revision>=0),
 proof_ref text not null check(proof_ref ~ '^M21-[A-Za-z0-9][A-Za-z0-9._-]{2,91}$'),
 check((job_id is null and allowed_until is null) or
       (job_id is not null and allowed_until is not null and isfinite(allowed_until)))
);
insert into public.pipstart_optional_test_window(singleton,proof_ref) values(true,'M21-installed-default-off');
create table public.pipstart_optional_test_window_audit (
 revision bigint primary key check(revision>=0),
 action text not null check(action in ('paused','armed','consumed')),
 job_id uuid,
 allowed_until timestamptz,
 proof_ref text not null check(proof_ref ~ '^M21-[A-Za-z0-9][A-Za-z0-9._-]{2,91}$'),
 database_session text not null,
 recorded_at timestamptz not null default clock_timestamp() check(isfinite(recorded_at))
);
insert into public.pipstart_optional_test_window_audit(revision,action,proof_ref,database_session)
 values(0,'paused','M21-installed-default-off',session_user);
alter table public.pipstart_optional_test_window enable row level security;
alter table public.pipstart_optional_test_window_audit enable row level security;
revoke all on public.pipstart_optional_test_window,public.pipstart_optional_test_window_audit from public,anon,authenticated,service_role;

-- Owner-only SQL tool. Null/null pauses; arming requires ONE existing due job.
-- No API grant, secret lookup, worker call, recovery/unlock or provider action.
create function public.pipstart_set_optional_test_window(p_job_id uuid,p_until timestamptz,p_proof text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare g public.pipstart_optional_test_window%rowtype;t timestamptz;action text;
begin
 if p_proof is null or p_proof !~ '^M21-[A-Za-z0-9][A-Za-z0-9._-]{2,91}$' then raise exception 'Invalid opaque proof reference';end if;
 select * into strict g from public.pipstart_optional_test_window where singleton for update;
 t:=clock_timestamp();
 if p_job_id is null and p_until is null then action:='paused';
 elsif p_job_id is null or p_until is null or not isfinite(p_until) or p_until<=t or p_until>t+interval '15 minutes' then
  raise exception 'Permit requires one job and a future window of at most 15 minutes';
 else
  if exists(select 1 from public.pipstart_optional_worker_slot where run_token is not null)
   or exists(select 1 from public.pipstart_optional_email_jobs where status in ('preparing','sending','manual')) then
   raise exception 'Review unresolved optional work before arming';
  end if;
  if not exists(select 1 from public.pipstart_optional_email_jobs where id=p_job_id and status='pending' and available_at<=t and attempts<5) then
   raise exception 'Permit target must be one existing due pending job';
  end if;
  action:='armed';
 end if;
 update public.pipstart_optional_test_window set job_id=p_job_id,allowed_until=p_until,revision=g.revision+1,proof_ref=p_proof where singleton;
 insert into public.pipstart_optional_test_window_audit(revision,action,job_id,allowed_until,proof_ref,database_session)
  values(g.revision+1,action,p_job_id,p_until,p_proof,session_user);
 return jsonb_build_object('status',action,'revision',g.revision+1);
end $$;

-- Existing/older deployments still use the original admission RPC and encounter
-- this database trigger. A mixed or unrelated selected batch fails closed.
create function public.pipstart_guard_optional_worker_window()
returns trigger language plpgsql security definer set search_path='' as $$
declare g public.pipstart_optional_test_window%rowtype;
begin
 if new.run_token is not null and
   (tg_op='INSERT' or old.run_token is distinct from new.run_token or old.job_ids is distinct from new.job_ids) then
  select * into strict g from public.pipstart_optional_test_window where singleton for share;
  if g.job_id is null or g.allowed_until<=clock_timestamp() or new.job_ids is distinct from array[g.job_id] then
   raise exception using errcode='55000',message='Optional test window closed or selected batch not permitted';
  end if;
 end if;
 return new;
end $$;

-- Consumed atomically with the existing SENDING transition. Raising here rolls
-- back that transition AND its cadence reservation/content facts. A committed
-- SENDING permit is already in flight: pause cannot recall that external send.
create function public.pipstart_guard_optional_handoff_window()
returns trigger language plpgsql security definer set search_path='' as $$
declare g public.pipstart_optional_test_window%rowtype;
begin
 if new.status='sending' and (tg_op='INSERT' or old.status is distinct from 'sending') then
  select * into strict g from public.pipstart_optional_test_window where singleton for update;
  if g.job_id is distinct from new.id or g.allowed_until<=clock_timestamp() then
   raise exception using errcode='55000',message='Optional test window closed or handoff not permitted';
  end if;
  update public.pipstart_optional_test_window set job_id=null,allowed_until=null,revision=g.revision+1 where singleton;
  insert into public.pipstart_optional_test_window_audit(revision,action,job_id,allowed_until,proof_ref,database_session)
   values(g.revision+1,'consumed',g.job_id,g.allowed_until,g.proof_ref,session_user);
 end if;
 return new;
end $$;

create trigger pipstart_optional_worker_window_guard before insert or update on public.pipstart_optional_worker_slot
 for each row execute function public.pipstart_guard_optional_worker_window();
create trigger pipstart_optional_handoff_window_guard before insert or update on public.pipstart_optional_email_jobs
 for each row execute function public.pipstart_guard_optional_handoff_window();
revoke all on function public.pipstart_set_optional_test_window(uuid,timestamptz,text) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_guard_optional_worker_window() from public,anon,authenticated,service_role;
revoke all on function public.pipstart_guard_optional_handoff_window() from public,anon,authenticated,service_role;
commit;
