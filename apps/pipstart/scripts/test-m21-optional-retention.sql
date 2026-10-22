-- Isolated generated database only. No real content cleanup or provider sends.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Retention assertion: %',label;end if;end $$;
create function pg_temp.generated_job(u uuid,k text,s text,age_days integer) returns uuid language plpgsql as $$
declare j uuid;begin
 j:=(public.pipstart_enqueue_optional_email(u,k,'learning_lesson','Generated','Private generated content','Private generated content')->>'jobId')::uuid;
 update public.pipstart_optional_email_jobs set status=s,reason=case when s='suppressed' then 'opted_out' when s='manual' then 'attempts_exhausted' else null end,
  created_at=clock_timestamp()-age_days*interval '24 hours',updated_at=clock_timestamp()-age_days*interval '24 hours',
  provider_id=case when s='accepted' then gen_random_uuid()::text else null end,
  prepared_message=case when s='accepted' then jsonb_build_object('jobId',j::text,'to','retention-private@example.test','subject','Generated','html','Private generated content','text','Private generated content','headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('c',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click')) else null end
 where id=j;
 return j;
end $$;
do $$declare role_name text;begin
 foreach role_name in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(role_name,'public.pipstart_optional_retention_holds','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'no hold API grants');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_optional_retention_preview()','EXECUTE'),'no preview API grants');
 end loop;
end $$;
select pg_temp.assert((select relrowsecurity from pg_class where oid='public.pipstart_optional_retention_holds'::regclass),'hold RLS');
select pg_temp.assert(not exists(select 1 from pg_constraint where conrelid='public.pipstart_optional_retention_holds'::regclass and contype='f'),'holds survive parent deletion');
do $$declare u uuid:=gen_random_uuid();j1 uuid;j2 uuid;j3 uuid;j4 uuid;j5 uuid;j6 uuid;j7 uuid;j8 uuid;boundary uuid;orphan uuid:=gen_random_uuid();v jsonb;before_rows text;after_rows text;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'retention-private@example.test',now());
 perform public.pipstart_issue_email_unsubscribe_token(u,'all',repeat('a',64));
 update public.pipstart_email_unsubscribe_tokens set created_at=clock_timestamp()-interval '1000 days' where user_id=u;
 perform pg_temp.assert(public.pipstart_lookup_email_unsubscribe_token(repeat('a',64))->>'status'='valid','old unsubscribe link remains valid');
 j1:=pg_temp.generated_job(u,'retention-old-accepted','accepted',100);
 j2:=pg_temp.generated_job(u,'retention-old-suppressed','suppressed',100);
 j3:=pg_temp.generated_job(u,'retention-held-recovery','suppressed',100);
 j4:=pg_temp.generated_job(u,'retention-recent','suppressed',20);
 j5:=pg_temp.generated_job(u,'retention-late-event','accepted',100);
 j6:=pg_temp.generated_job(u,'retention-pending','pending',100);
 j7:=pg_temp.generated_job(u,'retention-preparing','pending',100);
 perform public.pipstart_claim_optional_email(j7);
 j8:=pg_temp.generated_job(u,'retention-manual','manual',100);
 insert into public.pipstart_optional_email_reservations(job_id,address_hash,kind,reserved_at)
 select x,repeat('a',64),'learning_lesson',clock_timestamp()-interval '41 days' from unnest(array[j1,j2,j3,j6,j7,j8,orphan]) x;
 insert into public.pipstart_optional_email_reservations values(gen_random_uuid(),repeat('b',64),'partner_offer',clock_timestamp()-interval '20 days');
 insert into public.pipstart_optional_worker_recoveries(run_fingerprint,snapshot_hash,proof_ref,database_session,executor_stopped_attested,started_at,recovered_at,job_ids) values
  (repeat('1',64),repeat('a',64),'M21-generated-audit',session_user,true,clock_timestamp()-interval '401 days',clock_timestamp()-interval '400 days',array[j1,j2]),
  (repeat('2',64),repeat('a',64),'M21-generated-audit',session_user,true,clock_timestamp()-interval '401 days',clock_timestamp()-interval '400 days',array[j3]),
  (repeat('3',64),repeat('a',64),'M21-generated-audit',session_user,true,clock_timestamp()-interval '401 days',clock_timestamp()-interval '400 days',array[j6]),
  (repeat('4',64),repeat('a',64),'M21-generated-audit',session_user,true,clock_timestamp()-interval '21 days',clock_timestamp()-interval '20 days',array[j4]);
 v:=public.pipstart_optional_retention_preview();
 perform pg_temp.assert(v->>'status'='preview_only' and v->'limits'=jsonb_build_object('terminalContentDays',90,'cadenceDays',31,'recoveryAuditDays',365),'approved fixed limits');
 perform pg_temp.assert(v->'counts'->>'terminalContentReview'='4' and v->'counts'->>'cadenceReview'='4' and v->'counts'->>'recoveryAuditReview'='2','old versus recent/unresolved candidates');
 perform pg_temp.assert(v->'counts'->>'retainedUnsubscribeTokens'='1' and v->'counts'->>'unresolvedJobs'='4','tokens/unresolved retained');
 perform pg_temp.assert(v->>'cleanupEnabled'='false' and v->>'automaticDeletion'='false' and v->>'resendAllowed'='false' and v->>'terminalContentAction'='compatibility_review_required','no cleanup capability');
 perform pg_temp.assert(position('Private' in v::text)=0 and position('@' in v::text)=0 and position(j1::text in v::text)=0,'aggregate metadata only');
 -- A callback received now prevents old content from being treated as aged.
 insert into public.pipstart_optional_provider_receipts(job_id,provider_id,prepared_hash,api_ack_at)
 select id,provider_id,public.pipstart_optional_prepared_digest(prepared_message),clock_timestamp()-interval '100 days' from public.pipstart_optional_email_jobs where id=j5;
 insert into public.pipstart_optional_delivery_events(event_id,job_id,provider_id,event_type,occurred_at,received_at)
 select 'retention-late-callback',id,provider_id,'email.delivered',clock_timestamp()-interval '100 days',clock_timestamp() from public.pipstart_optional_email_jobs where id=j5;
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'terminalContentReview'='3','late received evidence postpones review');
 boundary:=pg_temp.generated_job(u,'retention-boundary','suppressed',90);
 update public.pipstart_optional_email_jobs set created_at=statement_timestamp()-interval '2160 hours',updated_at=statement_timestamp()-interval '2160 hours' where id=boundary;
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'terminalContentReview'='3','exact 90-day boundary excluded');
 update public.pipstart_optional_email_jobs set created_at=created_at-interval '1 second',updated_at=updated_at-interval '1 second' where id=boundary;
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'terminalContentReview'='4','strictly older terminal review');
 update public.pipstart_optional_email_jobs set updated_at=statement_timestamp() where id=boundary;
 insert into public.pipstart_optional_email_reservations values(boundary,repeat('b',64),'partner_offer',statement_timestamp()-interval '744 hours');
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'cadenceReview'='4','exact 31-day boundary excluded');
 update public.pipstart_optional_email_reservations set reserved_at=reserved_at-interval '1 second' where job_id=boundary;
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'cadenceReview'='5','strictly older reservation review');
 update public.pipstart_optional_email_reservations set reserved_at=statement_timestamp() where job_id=boundary;
 insert into public.pipstart_optional_worker_recoveries values(repeat('5',64),repeat('b',64),'M21-generated-boundary',session_user,true,statement_timestamp()-interval '9000 hours',statement_timestamp()-interval '8760 hours',array[boundary]);
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'recoveryAuditReview'='2','exact 365-day boundary excluded');
 update public.pipstart_optional_worker_recoveries set recovered_at=recovered_at-interval '1 second' where run_fingerprint=repeat('5',64);
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'recoveryAuditReview'='3','strictly older audit review');
 update public.pipstart_optional_worker_recoveries set recovered_at=statement_timestamp() where run_fingerprint=repeat('5',64);
 insert into public.pipstart_optional_retention_holds values('job',j1::text,'M21-generated-hold',clock_timestamp());
 v:=public.pipstart_optional_retention_preview();
 perform pg_temp.assert(v->'counts'->>'terminalContentReview'='2' and v->'counts'->>'cadenceReview'='3' and v->'counts'->>'recoveryAuditReview'='1','direct job hold protects all related data');
 insert into public.pipstart_optional_retention_holds values('recovery',repeat('2',64),'M21-generated-hold',clock_timestamp());
 v:=public.pipstart_optional_retention_preview();
 perform pg_temp.assert(v->'counts'->>'terminalContentReview'='1' and v->'counts'->>'cadenceReview'='2' and v->'counts'->>'recoveryAuditReview'='0','recovery hold protects linked content/budget');
 update public.pipstart_optional_worker_slot set run_token=gen_random_uuid(),job_ids=array[j2,orphan],started_at=clock_timestamp() where singleton;
 v:=public.pipstart_optional_retention_preview();
 perform pg_temp.assert(v->>'status'='worker_review_required' and v->'counts'->>'terminalContentReview'='0' and v->'counts'->>'cadenceReview'='0','active batch protects even missing job');
 -- Record an exact fingerprint of every fixture table involved in the preview.
 select md5(string_agg(s,'|' order by s)) into before_rows from (
  select to_jsonb(t)::text s from public.pipstart_optional_email_jobs t union all select to_jsonb(t)::text from public.pipstart_optional_provider_receipts t
  union all select to_jsonb(t)::text from public.pipstart_optional_delivery_events t union all select to_jsonb(t)::text from public.pipstart_optional_email_reservations t
  union all select to_jsonb(t)::text from public.pipstart_optional_retention_holds t union all select to_jsonb(t)::text from public.pipstart_optional_worker_recoveries t
  union all select to_jsonb(t)::text from public.pipstart_optional_worker_slot t union all select to_jsonb(t)::text from public.pipstart_email_unsubscribe_tokens t) q;
 perform public.pipstart_optional_retention_preview();perform public.pipstart_optional_retention_preview();
 select md5(string_agg(s,'|' order by s)) into after_rows from (
  select to_jsonb(t)::text s from public.pipstart_optional_email_jobs t union all select to_jsonb(t)::text from public.pipstart_optional_provider_receipts t
  union all select to_jsonb(t)::text from public.pipstart_optional_delivery_events t union all select to_jsonb(t)::text from public.pipstart_optional_email_reservations t
  union all select to_jsonb(t)::text from public.pipstart_optional_retention_holds t union all select to_jsonb(t)::text from public.pipstart_optional_worker_recoveries t
  union all select to_jsonb(t)::text from public.pipstart_optional_worker_slot t union all select to_jsonb(t)::text from public.pipstart_email_unsubscribe_tokens t) q;
 perform pg_temp.assert(before_rows=after_rows,'preview never mutates rows');
 delete from public.pipstart_optional_email_jobs where id=j1;
 perform pg_temp.assert((select count(*)=1 from public.pipstart_optional_retention_holds where entity_kind='job' and subject_ref=j1::text),'hold survives deletion');
 perform pg_temp.assert(public.pipstart_optional_retention_preview()->'counts'->>'cadenceReview'='0','deleted held job still protects reservation');
end $$;
rollback;
begin read only;
select 1/(case when public.pipstart_optional_retention_preview()->>'cleanupEnabled'='false' then 1 else 0 end) as read_only_preview;
rollback;
