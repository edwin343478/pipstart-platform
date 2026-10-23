-- Generated isolated database only. Behavioral fixture changes roll back.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Test-window assertion: %',label;end if;end $$;
select pg_temp.assert((select job_id is null and allowed_until is null and revision=0 from public.pipstart_optional_test_window),'installed closed');
select pg_temp.assert((select bool_and(relrowsecurity) from pg_class where oid in ('public.pipstart_optional_test_window'::regclass,'public.pipstart_optional_test_window_audit'::regclass)),'RLS');
do $$declare r text;f text;begin
 foreach r in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(r,'public.pipstart_optional_test_window','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'private control');
  perform pg_temp.assert(not has_table_privilege(r,'public.pipstart_optional_test_window_audit','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'private audit');
  foreach f in array array['public.pipstart_set_optional_test_window(uuid,timestamptz,text)','public.pipstart_guard_optional_worker_window()','public.pipstart_guard_optional_handoff_window()'] loop
   perform pg_temp.assert(not has_function_privilege(r,f,'EXECUTE'),'owner/trigger only functions');
  end loop;
 end loop;
end $$;
do $$declare u uuid:=gen_random_uuid();j uuid;k uuid;c jsonb;a jsonb;m jsonb;rev bigint;n bigint;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'window-generated@example.test',now());
 j:=(public.pipstart_enqueue_optional_email(u,'window-one','learning_lesson','Generated','Generated','Generated')->>'jobId')::uuid;
 m:=jsonb_build_object('jobId',j::text,'to','window-generated@example.test','subject','Generated','html','Generated','text','Generated',
  'headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click'));
 begin perform public.pipstart_acquire_optional_worker();raise exception 'Closed acquisition unexpectedly succeeded';exception when sqlstate '55000' then null;end;
 perform pg_temp.assert((select run_token is null from public.pipstart_optional_worker_slot),'closed acquisition rolls back');
 c:=public.pipstart_claim_optional_email(j);
 begin perform public.pipstart_begin_optional_email(j,(c->>'token')::uuid,m);raise exception 'Closed handoff unexpectedly succeeded';exception when sqlstate '55000' then null;end;
 perform pg_temp.assert((select count(*)=0 from public.pipstart_optional_email_reservations),'closed handoff reserves nothing');
 perform pg_temp.assert((select status='preparing' and prepared_message is null from public.pipstart_optional_email_jobs where id=j),'closed handoff retains preparation');
 perform pg_temp.assert(public.pipstart_release_optional_email(j,(c->>'token')::uuid),'fixture release');
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 begin perform public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '16 minutes','M21-invalid-window');raise exception 'Long permit accepted';exception when raise_exception then
  if sqlerrm='Long permit accepted' then raise;end if;end;
 begin perform public.pipstart_set_optional_test_window(gen_random_uuid(),clock_timestamp()+interval '1 minute','M21-missing-job');raise exception 'Missing job accepted';exception when raise_exception then
  if sqlerrm='Missing job accepted' then raise;end if;end;
 perform pg_temp.assert((select revision=0 from public.pipstart_optional_test_window),'invalid arms atomic');
 a:=public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '5 minutes','M21-generated-stop');
 perform pg_temp.assert(a->>'status'='armed','owner arms one job');
 a:=public.pipstart_acquire_optional_worker();
 perform pg_temp.assert(a->>'status'='acquired' and a->'jobIds'=jsonb_build_array(j),'one exact selected job');
 perform public.pipstart_set_optional_test_window(null,null,'M21-generated-pause');
 c:=public.pipstart_claim_optional_email(j);
 begin perform public.pipstart_begin_optional_email(j,(c->>'token')::uuid,m);raise exception 'Paused admitted handoff succeeded';exception when sqlstate '55000' then null;end;
 perform pg_temp.assert((select run_token=(a->>'token')::uuid from public.pipstart_optional_worker_slot),'pause never unlocks');
 perform pg_temp.assert((select count(*)=0 from public.pipstart_optional_email_reservations),'pause rollback keeps budgets');
 perform public.pipstart_release_optional_email(j,(c->>'token')::uuid);
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second' where id=j;
 perform pg_temp.assert(public.pipstart_finish_optional_worker((a->>'token')::uuid),'existing safe finish works');
 perform public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '5 minutes','M21-generated-expiry');
 update public.pipstart_optional_test_window set allowed_until=clock_timestamp()-interval '1 second' where singleton;
 begin perform public.pipstart_acquire_optional_worker();raise exception 'Expired acquisition succeeded';exception when sqlstate '55000' then null;end;
 perform public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '5 minutes','M21-generated-mixed');
 k:=(public.pipstart_enqueue_optional_email(u,'window-other','learning_lesson','Generated','Generated','Generated')->>'jobId')::uuid;
 begin perform public.pipstart_acquire_optional_worker();raise exception 'Mixed batch succeeded';exception when sqlstate '55000' then null;end;
 c:=public.pipstart_claim_optional_email(k);
 begin perform public.pipstart_begin_optional_email(k,(c->>'token')::uuid,jsonb_set(m,'{jobId}',to_jsonb(k::text)));raise exception 'Wrong job handoff succeeded';exception when sqlstate '55000' then null;end;
 perform public.pipstart_release_optional_email(k,(c->>'token')::uuid);
 update public.pipstart_optional_email_jobs set status='suppressed' where id=k;
 a:=public.pipstart_acquire_optional_worker();c:=public.pipstart_claim_optional_email(j);
 select revision into rev from public.pipstart_optional_test_window;
 perform pg_temp.assert(public.pipstart_begin_optional_email(j,(c->>'token')::uuid,m),'one permitted SENDING transition');
 perform pg_temp.assert((select job_id is null and allowed_until is null and revision=rev+1 from public.pipstart_optional_test_window),'permit automatically consumed');
 perform pg_temp.assert((select count(*)=1 from public.pipstart_optional_email_reservations where job_id=j),'one cadence reservation');
 perform pg_temp.assert((select count(*)=1 from public.pipstart_optional_test_window_audit where action='consumed' and job_id=j),'one consumption audit');
 perform pg_temp.assert(not public.pipstart_begin_optional_email(j,(c->>'token')::uuid,m),'repeat begin cannot resend');
 perform pg_temp.assert(not public.pipstart_finish_optional_worker((a->>'token')::uuid),'SENDING retains admission');
 select count(*) into n from public.pipstart_optional_test_window_audit;
 perform public.pipstart_set_optional_test_window(null,null,'M21-generated-after-handoff');
 perform pg_temp.assert((select status='sending' and prepared_message=m from public.pipstart_optional_email_jobs where id=j),'pause does not recall committed handoff');
 perform pg_temp.assert((select count(*)=n+1 from public.pipstart_optional_test_window_audit),'pause audited');
 begin perform public.pipstart_set_optional_test_window(k,clock_timestamp()+interval '1 minute','M21-unresolved-denied');raise exception 'Unresolved work allowed rearm';exception when raise_exception then
  if sqlerrm='Unresolved work allowed rearm' then raise;end if;end;
end $$;
rollback;
