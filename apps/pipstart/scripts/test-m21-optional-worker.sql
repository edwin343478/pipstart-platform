-- Generated fixtures only; all behavioral mutations roll back.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Worker assertion: %',label;end if;end $$;
select pg_temp.assert((select count(*)=1 and bool_and(run_token is null) from public.pipstart_optional_worker_slot),'empty singleton');
select pg_temp.assert((select relrowsecurity from pg_class where oid='public.pipstart_optional_worker_slot'::regclass),'RLS');
do $$declare r text;begin
 foreach r in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(r,'public.pipstart_optional_worker_slot','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'no direct table grants');
 end loop;
 foreach r in array array['anon','authenticated'] loop
  perform pg_temp.assert(not has_function_privilege(r,'public.pipstart_acquire_optional_worker()','EXECUTE'),'private acquire');
  perform pg_temp.assert(not has_function_privilege(r,'public.pipstart_finish_optional_worker(uuid)','EXECUTE'),'private finish');
 end loop;
 perform pg_temp.assert(has_function_privilege('service_role','public.pipstart_acquire_optional_worker()','EXECUTE'),'service acquire');
end $$;
-- Existing generated legacy SENDING row must never enter the batch.
select pg_temp.assert(public.pipstart_acquire_optional_worker()=jsonb_build_object('status','empty'),'no eligible jobs');
do $$declare u uuid:=gen_random_uuid();j uuid;a jsonb;t uuid;i integer;before_hash text;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'worker-generated@example.test',now());
 for i in 1..7 loop
  j:=(public.pipstart_enqueue_optional_email(u,'worker-'||i,'learning_lesson','Generated','Generated','Generated',clock_timestamp()-interval '1 hour'+i*interval '1 second')->>'jobId')::uuid;
 end loop;
 perform public.pipstart_enqueue_optional_email(u,'worker-future','learning_lesson','Generated','Generated','Generated',clock_timestamp()+interval '1 day');
 perform public.pipstart_enqueue_optional_email(u,'worker-exhausted','learning_lesson','Generated','Generated','Generated',clock_timestamp()-interval '2 hours');
 update public.pipstart_optional_email_jobs set attempts=5 where dedupe_key='worker-exhausted';
 select md5(string_agg(to_jsonb(q)::text,'|' order by id)) into before_hash from public.pipstart_optional_email_jobs q;
 a:=public.pipstart_acquire_optional_worker();t:=(a->>'token')::uuid;
 perform pg_temp.assert(a->>'status'='acquired' and jsonb_array_length(a->'jobIds')=5,'bounded batch');
 perform pg_temp.assert((select array_agg(j.dedupe_key order by x.ordinality)=array['worker-1','worker-2','worker-3','worker-4','worker-5'] from jsonb_array_elements_text(a->'jobIds') with ordinality x(id,ordinality) join public.pipstart_optional_email_jobs j on j.id=x.id::uuid),'ordered pending due only');
 perform pg_temp.assert(public.pipstart_acquire_optional_worker()=jsonb_build_object('status','busy'),'second run busy');
 update public.pipstart_optional_worker_slot set started_at=clock_timestamp()-interval '100 days';
 perform pg_temp.assert(public.pipstart_acquire_optional_worker()=jsonb_build_object('status','busy'),'no age takeover');
 perform pg_temp.assert(not public.pipstart_finish_optional_worker(gen_random_uuid()),'wrong token denied');
 perform pg_temp.assert(not public.pipstart_finish_optional_worker(null),'null token denied');
 perform pg_temp.assert(before_hash=(select md5(string_agg(to_jsonb(q)::text,'|' order by id)) from public.pipstart_optional_email_jobs q),'admission never mutates jobs');
 j:=(a->'jobIds'->>0)::uuid;
 perform public.pipstart_claim_optional_email(j);
 perform pg_temp.assert(not public.pipstart_finish_optional_worker(t),'preparing blocks finish');
 update public.pipstart_optional_email_jobs set status='manual',reason='handoff_uncertain',lease_token=null,lease_until=null where id=j;
 perform pg_temp.assert(not public.pipstart_finish_optional_worker(t),'manual blocks finish');
 -- Fixture-only repair to exercise normal release; no production repair API.
 update public.pipstart_optional_email_jobs set status='pending',reason=null where id=j;
 perform pg_temp.assert(public.pipstart_finish_optional_worker(t),'normal token finish');
 perform pg_temp.assert(not public.pipstart_finish_optional_worker(t),'repeat finish false');
 a:=public.pipstart_acquire_optional_worker();
 perform pg_temp.assert((a->>'token')::uuid<>t,'new run token');
 perform pg_temp.assert(not public.pipstart_finish_optional_worker(t),'old token cannot clear new run');
end $$;
rollback;
