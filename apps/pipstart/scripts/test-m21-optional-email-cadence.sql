-- Generated fixtures only. Run in the external disposable database, never an app DB.
begin;
create function public.m21_cadence_user(p_email text default null) returns uuid language plpgsql as $$
declare u uuid:=gen_random_uuid();begin
 insert into auth.users(id,email,email_confirmed_at) values(u,coalesce(p_email,u::text||'@example.test'),now());return u;
end $$;
create function public.m21_cadence_message(j uuid,e text) returns jsonb language sql as $$
 select jsonb_build_object('jobId',j::text,'to',e,'subject','Generated','html','<p>Generated</p>','text','Generated',
 'headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click'));
$$;
create function public.m21_cadence_job(u uuid,k text default 'learning_lesson') returns uuid language plpgsql as $$
declare j uuid;begin
 update public.pipstart_email_preferences set learning_frequency=case when k='learning_weekly' then 'weekly' else 'all' end where user_id=u;
 j:=(public.pipstart_enqueue_optional_email(u,gen_random_uuid()::text,k,'Generated','<p>Generated</p>','Generated')->>'jobId')::uuid;
 if j is null then raise exception 'Generated enqueue failed';end if;return j;
end $$;
create function public.m21_cadence_start(j uuid) returns boolean language plpgsql as $$
declare c jsonb;e text;begin
 c:=public.pipstart_claim_optional_email(j);if c->>'status'<>'claimed' then raise exception 'Generated claim failed';end if;
 select a.email into e from auth.users a join public.pipstart_optional_email_jobs q on q.user_id=a.id where q.id=j;
 return public.pipstart_begin_optional_email(j,(c->>'token')::uuid,public.m21_cadence_message(j,e));
end $$;
do $$declare u uuid;u2 uuid;j uuid;j2 uuid;h text;t timestamptz:=clock_timestamp();e text;c jsonb;n integer;b boolean;
begin
 -- Backfill fixture was created before migration by the external harness.
 if not exists(select 1 from public.pipstart_optional_email_reservations r join public.pipstart_optional_email_jobs q on q.id=r.job_id where q.dedupe_key='generated-before-cadence' and r.address_hash=public.pipstart_optional_address_hash(q.prepared_message->>'to') and r.reserved_at=greatest(q.created_at,q.updated_at)) then raise exception 'Legacy handoff backfill missing';end if;
 delete from public.pipstart_optional_email_reservations; -- disposable generated DB only
 u:=public.m21_cadence_user();j:=public.m21_cadence_job(u);
 if not public.m21_cadence_start(j) then raise exception 'First reservation denied';end if;
 perform public.pipstart_finish_optional_email(j,(select lease_token from public.pipstart_optional_email_jobs where id=j),'manual','provider_uncertain',null);
 j2:=public.m21_cadence_job(u,'partner_offer');if public.m21_cadence_start(j2) then raise exception 'Combined 24h cap bypass';end if;
 if not exists(select 1 from public.pipstart_optional_email_jobs where id=j2 and status='pending' and attempts=0 and reason='cadence_limited' and lease_token is null and prepared_message is null and available_at>clock_timestamp()) then raise exception 'Bad safe deferral';end if;
 if public.pipstart_claim_optional_email(j2)->>'status'<>'not_due' then raise exception 'Deferred job claimable early';end if;
 if (select count(*) from public.pipstart_optional_email_reservations)<>1 then raise exception 'Deferral consumed reservation';end if;
 if public.pipstart_claim_optional_email(j)->>'status'<>'manual' then raise exception 'Sending reservation enabled retry';end if;
 -- Exact 24-hour boundary is eligible; fixed-duration UTC windows, no calendar-day reset.
 update public.pipstart_optional_email_reservations set reserved_at=clock_timestamp()-interval '24 hours' where job_id=j;
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j2;
 if not public.m21_cadence_start(j2) then raise exception '24h boundary denied';end if;
 -- All-frequency: three of EITHER learning kind in 168 hours blocks a fourth.
 delete from public.pipstart_optional_email_reservations;
 select email into e from auth.users where id=u;h:=public.pipstart_optional_address_hash(e);
 insert into public.pipstart_optional_email_reservations values(gen_random_uuid(),h,'learning_lesson',t-interval '48 hours'),(gen_random_uuid(),h,'learning_weekly',t-interval '96 hours'),(gen_random_uuid(),h,'learning_lesson',t-interval '144 hours');
 j:=public.m21_cadence_job(u);if public.m21_cadence_start(j) then raise exception 'Seven-day learning cap bypass';end if;
 if (select available_at from public.pipstart_optional_email_jobs where id=j)<>t+interval '24 hours' then raise exception 'Wrong third-most-recent release time';end if;
 -- Weekly setting counts earlier lesson attempts too; partner has its own 720-hour cap.
 delete from public.pipstart_optional_email_reservations;
 insert into public.pipstart_optional_email_reservations values(gen_random_uuid(),h,'learning_lesson',t-interval '96 hours');
 j:=public.m21_cadence_job(u,'learning_weekly');if public.m21_cadence_start(j) then raise exception 'Frequency switch reset weekly cap';end if;
 update public.pipstart_optional_email_reservations set reserved_at=clock_timestamp()-interval '168 hours';
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 if not public.m21_cadence_start(j) then raise exception 'Weekly expiry boundary denied';end if;
 delete from public.pipstart_optional_email_reservations;
 insert into public.pipstart_optional_email_reservations values(gen_random_uuid(),h,'partner_offer',t-interval '480 hours');
 j:=public.m21_cadence_job(u,'partner_offer');if public.m21_cadence_start(j) then raise exception 'Partner cap bypass';end if;
 if (select available_at from public.pipstart_optional_email_jobs where id=j)<>t+interval '240 hours' then raise exception 'Wrong partner release time';end if;
 j2:=public.m21_cadence_job(u);if not public.m21_cadence_start(j2) then raise exception 'Old partner offer wrongly blocks eligible learning';end if;
 update public.pipstart_optional_email_reservations set reserved_at=clock_timestamp()-interval '720 hours';
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 if not public.m21_cadence_start(j) then raise exception 'Partner expiry boundary denied';end if;
 -- Unknown handoffs remain charged even when the account/job is deleted and recreated.
 delete from public.pipstart_optional_email_reservations;
 u2:=public.m21_cadence_user('recreated@example.test');j:=public.m21_cadence_job(u2);
 if not public.m21_cadence_start(j) then raise exception 'Generated unknown handoff denied';end if;
 delete from auth.users where id=u2;
 if not exists(select 1 from public.pipstart_optional_email_reservations where job_id=j) then raise exception 'Account deletion reset budget';end if;
 u2:=public.m21_cadence_user('recreated@example.test');j2:=public.m21_cadence_job(u2);
 if public.m21_cadence_start(j2) then raise exception 'Recreated account bypassed address cap';end if;
 -- Platform 50/24h counts every kind/unknown reservation, not delivery callbacks.
 delete from public.pipstart_optional_email_reservations;
 insert into public.pipstart_optional_email_reservations select gen_random_uuid(),encode(sha256(convert_to('generated-'||i,'UTF8')),'hex'),'partner_offer',t-interval '2 hours' from generate_series(1,49) i;
 u:=public.m21_cadence_user();j:=public.m21_cadence_job(u);if not public.m21_cadence_start(j) then raise exception '50th reservation denied';end if;
 u2:=public.m21_cadence_user();j2:=public.m21_cadence_job(u2);if public.m21_cadence_start(j2) then raise exception 'Global cap bypass';end if;
 if (select count(*) from public.pipstart_optional_email_reservations)<>50 then raise exception 'Global denied slot consumed';end if;
 update public.pipstart_optional_email_reservations set reserved_at=clock_timestamp()-interval '24 hours';
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j2;
 if not public.m21_cadence_start(j2) then raise exception 'Global expiry boundary denied';end if;
 -- Invalid bodies cannot consume a slot or mutate a preparing job.
 delete from public.pipstart_optional_email_reservations;
 j:=public.m21_cadence_job(u2);c:=public.pipstart_claim_optional_email(j);
 begin
  perform public.pipstart_begin_optional_email(j,(c->>'token')::uuid,jsonb_build_object('jobId',j));
  raise exception 'Expected invalid body rejection';
 exception when others then if sqlerrm='Expected invalid body rejection' then raise;end if;end;
 if exists(select 1 from public.pipstart_optional_email_reservations) or (select status from public.pipstart_optional_email_jobs where id=j)<>'preparing' then raise exception 'Invalid body mutated budget/job';end if;
 -- Permission boundary: no direct service/learner table access or policy.
 if not (select relrowsecurity from pg_class where oid='public.pipstart_optional_email_reservations'::regclass) then raise exception 'Budget RLS missing';end if;
 if exists(select 1 from pg_policies where schemaname='public' and tablename='pipstart_optional_email_reservations') then raise exception 'Unexpected budget policy';end if;
 if exists(select 1 from (values('anon'),('authenticated'),('service_role')) r(n) where has_table_privilege(r.n,'public.pipstart_optional_email_reservations','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')) then raise exception 'Budget grants leaked';end if;
 if not has_function_privilege('service_role','public.pipstart_begin_optional_email(uuid,uuid,jsonb)','EXECUTE') or has_function_privilege('anon','public.pipstart_begin_optional_email(uuid,uuid,jsonb)','EXECUTE') or has_function_privilege('authenticated','public.pipstart_begin_optional_email(uuid,uuid,jsonb)','EXECUTE') then raise exception 'Begin RPC grants changed';end if;
end $$;
-- Failure after budget insert must roll back BOTH reservation and send-marker transition.
create function public.m21_cadence_abort() returns trigger language plpgsql as $$begin if new.status='sending' then raise exception 'Generated marker failure';end if;return new;end $$;
create trigger m21_cadence_abort before update on public.pipstart_optional_email_jobs for each row execute function public.m21_cadence_abort();
do $$declare u uuid;j uuid;begin
 delete from public.pipstart_optional_email_reservations;
 u:=public.m21_cadence_user();j:=public.m21_cadence_job(u);
 begin perform public.m21_cadence_start(j);raise exception 'Expected marker failure';exception when others then if sqlerrm<>'Generated marker failure' then raise;end if;end;
 if exists(select 1 from public.pipstart_optional_email_reservations) or (select status from public.pipstart_optional_email_jobs where id=j)<>'pending' then raise exception 'Partial atomic handoff reservation';end if;
end $$;
rollback;
