-- Dormant worker admission. No expiry/takeover: crashed runs require review.
begin;
create table public.pipstart_optional_worker_slot (
 singleton boolean primary key default true check(singleton),
 run_token uuid,
 job_ids uuid[] not null default '{}',
 started_at timestamptz,
 check(cardinality(job_ids) between 0 and 5),
 check((run_token is null and started_at is null and cardinality(job_ids)=0)
  or (run_token is not null and started_at is not null and isfinite(started_at)))
);
insert into public.pipstart_optional_worker_slot(singleton) values(true);
alter table public.pipstart_optional_worker_slot enable row level security;
revoke all on public.pipstart_optional_worker_slot from public,anon,authenticated,service_role;

create function public.pipstart_acquire_optional_worker()
returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.pipstart_optional_worker_slot%rowtype; ids uuid[]; t uuid;
begin
 select * into strict s from public.pipstart_optional_worker_slot where singleton for update;
 if s.run_token is not null then return jsonb_build_object('status','busy');end if;
 -- Pending only: never automatically reclaim preparing/sending/manual jobs.
 select coalesce(array_agg(q.id order by q.available_at,q.created_at,q.id),'{}'::uuid[]) into ids
 from (select id,available_at,created_at from public.pipstart_optional_email_jobs
  where status='pending' and available_at<=clock_timestamp() and attempts<5
  order by available_at,created_at,id limit 5) q;
 if cardinality(ids)=0 then return jsonb_build_object('status','empty');end if;
 t:=gen_random_uuid();
 update public.pipstart_optional_worker_slot set run_token=t,job_ids=ids,started_at=clock_timestamp() where singleton;
 return jsonb_build_object('status','acquired','token',t,'jobIds',to_jsonb(ids));
end $$;

create function public.pipstart_finish_optional_worker(p_token uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare s public.pipstart_optional_worker_slot%rowtype;
begin
 select * into strict s from public.pipstart_optional_worker_slot where singleton for update;
 if p_token is null or s.run_token is distinct from p_token then return false;end if;
 -- No generic unlock/retry API. Outstanding/uncertain outcomes retain the lock.
 if exists(select 1 from public.pipstart_optional_email_jobs where id=any(s.job_ids)
  and status not in ('accepted','suppressed','pending')) then return false;end if;
 update public.pipstart_optional_worker_slot set run_token=null,job_ids='{}',started_at=null where singleton;
 return true;
end $$;
revoke all on function public.pipstart_acquire_optional_worker() from public,anon,authenticated,service_role;
revoke all on function public.pipstart_finish_optional_worker(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_acquire_optional_worker() to service_role;
grant execute on function public.pipstart_finish_optional_worker(uuid) to service_role;
commit;
