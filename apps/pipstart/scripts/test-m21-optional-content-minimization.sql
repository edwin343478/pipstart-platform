-- Generated disposable database only. All behavioral fixtures roll back.
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Minimization assertion: %',label;end if;end $$;
create function pg_temp.content_state() returns text language sql as $$
 select md5(string_agg(v,'|' order by v)) from (
 select to_jsonb(t)::text v from public.pipstart_optional_email_jobs t union all
 select to_jsonb(t)::text from public.pipstart_optional_content_facts t) q;
$$;
create function pg_temp.protected_state() returns text language sql as $$
 select md5(string_agg(v,'|' order by v)) from (
 select to_jsonb(t)::text v from public.pipstart_email_unsubscribe_tokens t union all
 select to_jsonb(t)::text from public.pipstart_email_preferences t union all
 select to_jsonb(t)::text from public.pipstart_optional_provider_receipts t union all
 select to_jsonb(t)::text from public.pipstart_optional_delivery_events t union all
 select to_jsonb(t)::text from public.pipstart_optional_email_reservations t union all
 select to_jsonb(t)::text from public.pipstart_optional_worker_recoveries t union all
 select to_jsonb(t)::text from public.pipstart_optional_retention_holds t union all
 select to_jsonb(t)::text from public.pipstart_optional_cleanup_receipts t union all
 select to_jsonb(t)::text from public.pipstart_optional_worker_slot t) q;
$$;
create function pg_temp.fixture(u uuid,k text,t timestamptz,accepted boolean default false) returns uuid language plpgsql as $$
declare j uuid:=gen_random_uuid();m jsonb;begin
 insert into public.pipstart_optional_email_jobs(id,user_id,dedupe_key,kind,subject,html,body_text,created_at,updated_at,status)
 values(j,u,k,'learning_lesson','Generated','Generated','Generated',t,t,'suppressed');
 if accepted then
  m:=jsonb_build_object('jobId',j::text,'to','min-private@example.test','subject','Generated','html','Generated','text','Generated',
   'headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click'));
  update public.pipstart_optional_email_jobs set status='accepted',provider_id=gen_random_uuid()::text,prepared_message=m where id=j;
  update public.pipstart_optional_content_facts set envelope_recorded_at=t where job_id=j;
 end if;
 return j;
end $$;
create function pg_temp.fail_min_receipt() returns trigger language plpgsql as $$begin raise exception using errcode='ZX003',message='Generated minimization receipt fault';end $$;
create function pg_temp.fail_min_update() returns trigger language plpgsql as $$begin raise exception using errcode='ZX004',message='Generated minimization update fault';end $$;
begin;
do $$declare role_name text;begin
 foreach role_name in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(role_name,'public.pipstart_optional_minimization_receipts','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'private receipts');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_guard_optional_minimized_job()','EXECUTE'),'private guard');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_optional_content_minimization_candidates(timestamptz)','EXECUTE'),'private candidate helper');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_optional_content_minimization_plan(timestamptz)','EXECUTE'),'private plan');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_execute_optional_content_minimization(timestamptz,text,boolean,text)','EXECUTE'),'private execution');
 end loop;
end $$;
do $$declare u uuid:=gen_random_uuid();t timestamptz:=clock_timestamp();j uuid;target uuid;held uuid;transitive uuid;ref uuid;p jsonb;r jsonb;h text;before_content text;before_protected text;d text;pid text;failed boolean;i integer;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'min-private@example.test',now());
 perform public.pipstart_issue_email_unsubscribe_token(u,'all',repeat('a',64));
 -- 105 eligible jobs. The accepted target is older so it is always in batch one.
 target:=pg_temp.fixture(u,'min-accepted',t-interval '120 days',true);
 for i in 1..104 loop j:=pg_temp.fixture(u,'min-batch-'||i,t-interval '91 days');end loop;
 held:=pg_temp.fixture(u,'min-held',t-interval '120 days');
 transitive:=pg_temp.fixture(u,'min-transitive',t-interval '120 days');
 insert into public.pipstart_optional_retention_holds values('job',held::text,'M21-generated-held',t);
 insert into public.pipstart_optional_worker_recoveries values(repeat('5',64),repeat('a',64),'M21-generated-linked',session_user,true,t-interval '2 days',t-interval '1 day',array[transitive]);
 insert into public.pipstart_optional_retention_holds values('recovery',repeat('5',64),'M21-generated-linked',t);
 select f.prepared_hash,q.provider_id into d,pid from public.pipstart_optional_content_facts f join public.pipstart_optional_email_jobs q on q.id=f.job_id where q.id=target;
 p:=public.pipstart_optional_content_minimization_plan(t);h:=p->>'planHash';
 perform pg_temp.assert(p->>'jobCount'='100' and p->>'maxRows'='100' and p->>'terminalContentDays'='90','bounded 90-day plan');
 perform pg_temp.assert(p->>'automaticDeletion'='false' and p->>'resendAllowed'='false' and p->>'unsubscribeTokenAction'='retain_valid_account_links','explicit non-activation flags');
 perform pg_temp.assert(position('@' in p::text)=0 and position('Generated' in p::text)=0 and position(target::text in p::text)=0,'aggregate plan contains no payloads or row IDs');
 perform set_config('TimeZone','Africa/Nairobi',true);
 perform pg_temp.assert(h=public.pipstart_optional_content_minimization_plan(t)->>'planHash','UTC canonical plan');
 perform set_config('TimeZone','UTC',true);
 failed:=false;begin perform public.pipstart_execute_optional_content_minimization(t,h,false,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'sender stop attestation required');
 failed:=false;begin perform public.pipstart_execute_optional_content_minimization(t+interval '1 day',h,true,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'future plan denied');
 failed:=false;begin perform public.pipstart_execute_optional_content_minimization(t-interval '16 minutes',h,true,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'stale plan denied');
 failed:=false;begin perform public.pipstart_execute_optional_content_minimization(t,h,true,'bad proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'invalid proof denied');
 before_content:=pg_temp.content_state();
 perform pg_temp.assert(public.pipstart_execute_optional_content_minimization(t,repeat('0',64),true,'M21-generated-proof')->>'status'='changed','wrong hash rejected');
 perform pg_temp.assert(before_content=pg_temp.content_state(),'wrong hash no writes');
 select job_id into ref from public.pipstart_optional_content_minimization_candidates(t) where job_id<>target limit 1;
 insert into public.pipstart_optional_retention_holds values('job',ref::text,'M21-generated-newhold',t);
 perform pg_temp.assert(public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof')->>'status'='changed','new hold invalidates reviewed batch');
 p:=public.pipstart_optional_content_minimization_plan(t);h:=p->>'planHash';
 -- A new signed receipt/evidence fact invalidates the plan even with old event time.
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('min-late-before',target,pid,d,'min-private@example.test','email.delivered',t-interval '119 days')='recorded','new evidence recorded');
 perform pg_temp.assert(public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof')->>'status'='changed','new evidence invalidates plan');
 -- Age ONLY generated evidence again to permit the controlled fixture.
 update public.pipstart_optional_delivery_events set received_at=t-interval '119 days' where job_id=target;
 update public.pipstart_optional_provider_receipts set signed_event_at=t-interval '119 days' where job_id=target;
 p:=public.pipstart_optional_content_minimization_plan(t);h:=p->>'planHash';
 update public.pipstart_optional_worker_slot set run_token=gen_random_uuid(),started_at=t,job_ids=array[target] where singleton;
 perform pg_temp.assert(public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof')->>'status'='worker_review_required','active worker blocks minimization');
 update public.pipstart_optional_worker_slot set run_token=null,started_at=null,job_ids='{}' where singleton;
 p:=public.pipstart_optional_content_minimization_plan(t);h:=p->>'planHash';
 before_content:=pg_temp.content_state();before_protected:=pg_temp.protected_state();
 execute 'create trigger generated_min_receipt_fault before insert on public.pipstart_optional_minimization_receipts for each row execute function pg_temp.fail_min_receipt()';
 failed:=false;begin perform public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof');exception when sqlstate 'ZX003' then failed:=true;end;
 perform pg_temp.assert(failed and before_content=pg_temp.content_state(),'receipt failure rolls payloads and markers back');
 perform pg_temp.assert((select count(*)=0 from public.pipstart_optional_minimization_receipts),'failed run no receipt');
 execute 'drop trigger generated_min_receipt_fault on public.pipstart_optional_minimization_receipts';
 execute 'create trigger generated_min_update_fault before update on public.pipstart_optional_email_jobs for each row execute function pg_temp.fail_min_update()';
 failed:=false;begin perform public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof');exception when sqlstate 'ZX004' then failed:=true;end;
 perform pg_temp.assert(failed and before_content=pg_temp.content_state(),'job failure rolls facts markers back');
 execute 'drop trigger generated_min_update_fault on public.pipstart_optional_email_jobs';
 r:=public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof');
 perform pg_temp.assert(r->>'status'='minimized' and r->>'jobCount'='100','one exact batch only');
 perform pg_temp.assert(before_protected=pg_temp.protected_state(),'tokens/preferences/provider evidence/budgets/recovery/holds/worker/old receipts untouched');
 perform pg_temp.assert((select count(*)=100 from public.pipstart_optional_content_facts where minimized_at is not null),'100 markers exactly');
 perform pg_temp.assert((select count(*)=100 from public.pipstart_optional_email_jobs where subject='[Content removed]' and html='<p>Content removed.</p>' and body_text='Content removed.' and prepared_message is null),'100 placeholders exactly');
 perform pg_temp.assert((select count(*)=1 and bool_and(plan_hash=h and plan_at=t and job_count=100) from public.pipstart_optional_minimization_receipts),'atomic audit receipt');
 before_content:=pg_temp.content_state();
 perform pg_temp.assert(public.pipstart_execute_optional_content_minimization(t,h,true,'M21-generated-proof')->>'status'='already_recorded','replay is not another batch');
 perform pg_temp.assert(before_content=pg_temp.content_state() and public.pipstart_optional_content_minimization_plan(t)->>'jobCount'='4','remaining four not automatically drained');
 perform pg_temp.assert((select bool_and(minimized_at is null) from public.pipstart_optional_content_facts where job_id in (held,transitive,ref)),'direct and transitive holds retained');
 perform pg_temp.assert(public.pipstart_enqueue_optional_email(u,'min-accepted','learning_lesson','Generated','Generated','Generated')->>'status'='duplicate','original dedupe survives real executor');
 perform pg_temp.assert(public.pipstart_enqueue_optional_email(u,'min-accepted','learning_lesson','Different','Generated','Generated')->>'status'='conflict','different body still conflicts');
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('min-after',target,pid,d,'min-private@example.test','email.failed',now())='recorded','late valid callback survives payload removal');
 perform pg_temp.assert(public.pipstart_record_optional_provider_ack(target,pid,d)='bound','late API acknowledgement binds independently');
 failed:=false;begin perform public.pipstart_record_optional_delivery_event('min-wrong',target,pid,d,'wrong@example.test','email.sent',now());exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'wrong recipient rejected');
 failed:=false;begin perform public.pipstart_record_optional_provider_ack(target,pid,repeat('b',64));exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'wrong digest rejected');
 perform pg_temp.assert(public.pipstart_lookup_email_unsubscribe_token(repeat('a',64))->>'status'='valid','valid unsubscribe remains');
 perform pg_temp.assert(public.pipstart_claim_optional_email(target)->>'status'='terminal','accepted tombstone never requeues');
 failed:=false;begin update public.pipstart_optional_email_jobs set status='pending',provider_id=null where id=target;exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'status-only reopening denied');
 failed:=false;begin
  insert into public.pipstart_optional_email_jobs(user_id,dedupe_key,kind,subject,html,body_text,status,provider_id)
  values(u,'forged-tombstone','learning_lesson','[Content removed]','<p>Content removed.</p>','Content removed.','accepted',gen_random_uuid()::text);
 exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'payload-free accepted insertion without facts denied');
end $$;
rollback;
begin;
do $$declare u uuid:=gen_random_uuid();t timestamptz:=clock_timestamp();j uuid;manual_id uuid;p jsonb;r jsonb;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'min-private@example.test',now());
 j:=pg_temp.fixture(u,'min-boundary',t-interval '2160 hours',true);
 p:=public.pipstart_optional_content_minimization_plan(t);
 perform pg_temp.assert(p->>'jobCount'='0','exact 90-day boundary retained');
 r:=public.pipstart_execute_optional_content_minimization(t,p->>'planHash',true,'M21-generated-boundary');
 perform pg_temp.assert(r->>'status'='no_work' and not exists(select 1 from public.pipstart_optional_minimization_receipts),'no-work no receipt');
 update public.pipstart_optional_email_jobs set created_at=created_at-interval '1 second',updated_at=updated_at-interval '1 second' where id=j;
 update public.pipstart_optional_content_facts set envelope_recorded_at=envelope_recorded_at-interval '1 second' where job_id=j;
 perform pg_temp.assert(public.pipstart_optional_content_minimization_plan(t)->>'jobCount'='1','strictly older than cutoff qualifies');
 insert into public.pipstart_optional_provider_receipts(job_id,provider_id,prepared_hash,api_ack_at)
 select q.id,q.provider_id,f.prepared_hash,t from public.pipstart_optional_email_jobs q join public.pipstart_optional_content_facts f on f.job_id=q.id where q.id=j;
 perform pg_temp.assert(public.pipstart_optional_content_minimization_plan(t)->>'jobCount'='0','recent API ack resets age');
 update public.pipstart_optional_provider_receipts set api_ack_at=t-interval '91 days' where job_id=j;
 perform pg_temp.assert(public.pipstart_optional_content_minimization_plan(t)->>'jobCount'='1','old receipt permits old payload');
 manual_id:=pg_temp.fixture(u,'min-unresolved',t-interval '120 days');
 update public.pipstart_optional_email_jobs set status='manual',reason='provider_uncertain' where id=manual_id;
 perform pg_temp.assert(not exists(select 1 from public.pipstart_optional_content_minimization_candidates(t) where job_id=manual_id),'unknown/manual never minimizes');
 p:=public.pipstart_optional_content_minimization_plan(t);
 update public.pipstart_optional_email_jobs set updated_at=updated_at-interval '1 second' where id=j;
 perform pg_temp.assert(public.pipstart_execute_optional_content_minimization(t,p->>'planHash',true,'M21-generated-drift')->>'status'='changed','selected job drift invalidates plan');
end $$;
rollback;
begin read only;
select public.pipstart_optional_content_minimization_plan()->>'status' as read_only_plan;
rollback;
