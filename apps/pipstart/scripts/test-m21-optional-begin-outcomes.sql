-- Generated fixtures in an EMPTY DISPOSABLE database at the complete schema head only.
-- Never run in the local app database or hosted database. All fixture changes roll back.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Begin v2 assertion: %',label;end if;end $$;
select pg_temp.assert(not exists(select 1 from public.pipstart_optional_email_jobs),'empty fixture database');
select pg_temp.assert(not exists(select 1 from public.pipstart_optional_email_reservations),'empty reservations');
select pg_temp.assert((select job_id is null and allowed_until is null from public.pipstart_optional_test_window),'default closed');
select pg_temp.assert(has_function_privilege('service_role','public.pipstart_begin_optional_email_v2(uuid,uuid,jsonb)','EXECUTE'),'service executes v2');
select pg_temp.assert(not has_function_privilege('anon','public.pipstart_begin_optional_email_v2(uuid,uuid,jsonb)','EXECUTE'),'anon denied');
select pg_temp.assert(not has_function_privilege('authenticated','public.pipstart_begin_optional_email_v2(uuid,uuid,jsonb)','EXECUTE'),'authenticated denied');
do $$declare u uuid:=gen_random_uuid();j uuid;c jsonb;a jsonb;m jsonb;r jsonb;seed uuid:=gen_random_uuid();n integer;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'begin-v2-generated@example.test',now());
 j:=(public.pipstart_enqueue_optional_email(u,'begin-v2-generated','learning_lesson','Generated','Generated','Generated')->>'jobId')::uuid;
 m:=jsonb_build_object('jobId',j::text,'to','begin-v2-generated@example.test','subject','Generated','html','Generated','text','Generated',
  'headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click'));
 c:=public.pipstart_claim_optional_email(j);
 perform pg_temp.assert(public.pipstart_begin_optional_email_v2(j,gen_random_uuid(),m)=jsonb_build_object('version',2,'status','lease_lost'),'wrong token remains lost');
 perform pg_temp.assert(not public.pipstart_begin_optional_email(j,gen_random_uuid(),m),'legacy boolean remains available');
 begin perform public.pipstart_begin_optional_email_v2(j,(c->>'token')::uuid,'{}'::jsonb);raise exception 'Invalid body accepted';exception when raise_exception then if sqlerrm='Invalid body accepted' then raise;end if;end;
 perform pg_temp.assert(not exists(select 1 from public.pipstart_optional_email_reservations),'invalid body reserves nothing');
 perform public.pipstart_release_optional_email(j,(c->>'token')::uuid);
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 insert into public.pipstart_optional_email_reservations values(seed,public.pipstart_optional_address_hash('begin-v2-generated@example.test'),'learning_lesson',clock_timestamp()-interval '1 hour');
 perform public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '5 minutes','M21-generated-v2-deferral');
 a:=public.pipstart_acquire_optional_worker();c:=public.pipstart_claim_optional_email(j);
 select attempts into n from public.pipstart_optional_email_jobs where id=j;
 r:=public.pipstart_begin_optional_email_v2(j,(c->>'token')::uuid,m);
 perform pg_temp.assert(r=jsonb_build_object('version',2,'status','cadence_deferred'),'typed safe deferral');
 perform pg_temp.assert((select status='pending' and reason='cadence_limited' and lease_token is null and lease_until is null and prepared_message is null and provider_id is null and attempts=n-1 and available_at>clock_timestamp() from public.pipstart_optional_email_jobs where id=j),'deferral is durable and uncharged');
 perform pg_temp.assert(not exists(select 1 from public.pipstart_optional_email_reservations where job_id=j),'no handoff reservation');
 perform pg_temp.assert(public.pipstart_claim_optional_email(j)->>'status'='not_due','cannot claim deferred job early');
 perform pg_temp.assert(public.pipstart_finish_optional_worker((a->>'token')::uuid),'safe worker finish succeeds');
 perform pg_temp.assert((select run_token is null from public.pipstart_optional_worker_slot),'worker no longer wedged');
 perform public.pipstart_set_optional_test_window(null,null,'M21-generated-v2-paused');
 delete from public.pipstart_optional_email_reservations where job_id=seed;
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 c:=public.pipstart_claim_optional_email(j);
 begin perform public.pipstart_begin_optional_email_v2(j,(c->>'token')::uuid,m);raise exception 'Closed window accepted';exception when sqlstate '55000' then null;end;
 perform pg_temp.assert((select status='preparing' and prepared_message is null from public.pipstart_optional_email_jobs where id=j),'closed window unchanged');
 perform pg_temp.assert(not exists(select 1 from public.pipstart_optional_email_reservations where job_id=j),'closed window no reservation');
 perform public.pipstart_release_optional_email(j,(c->>'token')::uuid);
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 perform public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '5 minutes','M21-generated-v2-start');
 a:=public.pipstart_acquire_optional_worker();c:=public.pipstart_claim_optional_email(j);
 perform pg_temp.assert(public.pipstart_begin_optional_email_v2(j,(c->>'token')::uuid,m)=jsonb_build_object('version',2,'status','started'),'typed started');
 perform pg_temp.assert((select status='sending' and prepared_message=m from public.pipstart_optional_email_jobs where id=j),'one durable marker');
 perform pg_temp.assert((select count(*)=1 from public.pipstart_optional_email_reservations where job_id=j),'one reservation only');
 perform pg_temp.assert((select job_id is null from public.pipstart_optional_test_window),'permit still consumed');
 perform pg_temp.assert(public.pipstart_begin_optional_email_v2(j,(c->>'token')::uuid,m)=jsonb_build_object('version',2,'status','lease_lost'),'no replay');
 perform pg_temp.assert(not public.pipstart_finish_optional_worker((a->>'token')::uuid),'uncertain sending retains admission');
end $$;
rollback;
