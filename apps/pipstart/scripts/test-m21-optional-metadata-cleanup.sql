-- Generated isolated fixtures only. All behavioral mutations roll back.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Cleanup assertion: %',label;end if;end $$;
create function pg_temp.metadata_hash() returns text language sql as $$
 select md5(string_agg(v,'|' order by v)) from (
  select to_jsonb(t)::text v from public.pipstart_optional_email_reservations t
  union all select to_jsonb(t)::text from public.pipstart_optional_worker_recoveries t) q;
$$;
do $$declare r text;begin
 foreach r in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(r,'public.pipstart_optional_cleanup_receipts','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'no receipt API access');
  perform pg_temp.assert(not has_function_privilege(r,'public.pipstart_optional_metadata_cleanup_candidates(timestamptz)','EXECUTE'),'private candidate helper');
  perform pg_temp.assert(not has_function_privilege(r,'public.pipstart_optional_metadata_cleanup_plan(timestamptz)','EXECUTE'),'owner plan only');
  perform pg_temp.assert(not has_function_privilege(r,'public.pipstart_execute_optional_metadata_cleanup(timestamptz,text,boolean,text)','EXECUTE'),'owner execution only');
 end loop;
end $$;
create function pg_temp.fail_cleanup_receipt() returns trigger language plpgsql as $$begin raise exception 'Generated receipt failure';end $$;
do $$declare u uuid:=gen_random_uuid();j uuid;protected uuid:=gen_random_uuid();transitive uuid:=gen_random_uuid();recent uuid:=gen_random_uuid();pending uuid;legacy uuid;t timestamptz:=clock_timestamp();p jsonb;r jsonb;old_hash text;before_meta text;before_protected text;after_protected text;ref text;failed boolean;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'cleanup-private@example.test',now());
 perform public.pipstart_issue_email_unsubscribe_token(u,'all',repeat('a',64));
 pending:=(public.pipstart_enqueue_optional_email(u,'cleanup-pending','learning_lesson','Private subject','Private body','Private body')->>'jobId')::uuid;
 select id into strict legacy from public.pipstart_optional_email_jobs where dedupe_key='generated-before-cadence';
 -- 120 eligible records, plus held/recent/unresolved records that must survive.
 insert into public.pipstart_optional_email_reservations(job_id,address_hash,kind,reserved_at)
 select gen_random_uuid(),repeat('b',64),'partner_offer',t-interval '41 days' from generate_series(1,80);
 insert into public.pipstart_optional_email_reservations values
  (protected,repeat('c',64),'partner_offer',t-interval '41 days'),
  (transitive,repeat('c',64),'partner_offer',t-interval '41 days'),
  (recent,repeat('d',64),'partner_offer',t-interval '20 days'),
  (pending,repeat('e',64),'learning_lesson',t-interval '41 days');
 insert into public.pipstart_optional_retention_holds values('job',protected::text,'M21-generated-hold',t);
 insert into public.pipstart_optional_worker_recoveries(run_fingerprint,snapshot_hash,proof_ref,database_session,executor_stopped_attested,started_at,recovered_at,job_ids)
 select encode(sha256(convert_to('generated-cleanup-'||i,'UTF8')),'hex'),repeat('a',64),'M21-generated-audit',session_user,true,t-interval '401 days',t-interval '400 days',array[gen_random_uuid()] from generate_series(1,40) i;
 insert into public.pipstart_optional_worker_recoveries values
  (repeat('1',64),repeat('a',64),'M21-generated-held',session_user,true,t-interval '401 days',t-interval '400 days',array[protected]),
  (repeat('2',64),repeat('a',64),'M21-generated-young',session_user,true,t-interval '21 days',t-interval '20 days',array[recent]),
  (repeat('3',64),repeat('a',64),'M21-generated-pending',session_user,true,t-interval '401 days',t-interval '400 days',array[pending]),
  (repeat('4',64),repeat('a',64),'M21-generated-sending',session_user,true,t-interval '401 days',t-interval '400 days',array[legacy]);
 insert into public.pipstart_optional_worker_recoveries values(repeat('5',64),repeat('a',64),'M21-generated-linked',session_user,true,t-interval '401 days',t-interval '400 days',array[transitive]);
 insert into public.pipstart_optional_retention_holds values('recovery',repeat('5',64),'M21-generated-linked',t);
 p:=public.pipstart_optional_metadata_cleanup_plan(t);
 perform pg_temp.assert((p->>'cadenceCount')::integer+(p->>'recoveryAuditCount')::integer=100 and p->>'maxRows'='100','combined hard limit');
 perform pg_temp.assert(p->>'status'='review_required' and p->>'automaticDeletion'='false' and p->>'payloadCleanupEnabled'='false' and p->>'resendAllowed'='false','explicit review only');
 perform pg_temp.assert(position('@' in p::text)=0 and position('Private' in p::text)=0 and position(pending::text in p::text)=0,'plan aggregate metadata only');
 old_hash:=p->>'planHash';perform set_config('TimeZone','Africa/Nairobi',true);
 perform pg_temp.assert(old_hash=public.pipstart_optional_metadata_cleanup_plan(t)->>'planHash','UTC canonical plan');
 perform set_config('TimeZone','UTC',true);
 failed:=false;begin perform public.pipstart_execute_optional_metadata_cleanup(t,old_hash,false,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'sender stop assertion required');
 failed:=false;begin perform public.pipstart_execute_optional_metadata_cleanup(t+interval '1 day',old_hash,true,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'future plan denied');
 failed:=false;begin perform public.pipstart_execute_optional_metadata_cleanup(t-interval '16 minutes',old_hash,true,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'stale plan denied');
 failed:=false;begin perform public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'bad proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'invalid proof denied');
 before_meta:=pg_temp.metadata_hash();
 perform pg_temp.assert(public.pipstart_execute_optional_metadata_cleanup(t,repeat('0',64),true,'M21-generated-proof')->>'status'='changed','wrong hash denied');
 perform pg_temp.assert(before_meta=pg_temp.metadata_hash(),'wrong hash deletes nothing');
 -- A newly added hold invalidates the exact reviewed batch even with 100 remaining.
 select entity_ref into ref from public.pipstart_optional_metadata_cleanup_candidates(t) where entity_kind='recovery' limit 1;
 insert into public.pipstart_optional_retention_holds values('recovery',ref,'M21-generated-hold',t);
 before_meta:=pg_temp.metadata_hash();
 perform pg_temp.assert(public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'M21-generated-proof')->>'status'='changed','new hold invalidates plan');
 perform pg_temp.assert(before_meta=pg_temp.metadata_hash(),'held plan deletes nothing');
 p:=public.pipstart_optional_metadata_cleanup_plan(t);old_hash:=p->>'planHash';
 select entity_ref into ref from public.pipstart_optional_metadata_cleanup_candidates(t) where entity_kind='cadence' limit 1;
 update public.pipstart_optional_email_reservations set reserved_at=reserved_at-interval '1 second' where job_id=ref::uuid;
 perform pg_temp.assert(public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'M21-generated-proof')->>'status'='changed','selected row drift denied');
 p:=public.pipstart_optional_metadata_cleanup_plan(t);old_hash:=p->>'planHash';
 update public.pipstart_optional_worker_slot set run_token=gen_random_uuid(),started_at=t,job_ids=array[legacy] where singleton;
 before_meta:=pg_temp.metadata_hash();
 perform pg_temp.assert(public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'M21-generated-proof')->>'status'='worker_review_required','active worker blocks deletion');
 perform pg_temp.assert(before_meta=pg_temp.metadata_hash(),'active worker deletes nothing');
 update public.pipstart_optional_worker_slot set run_token=null,started_at=null,job_ids='{}' where singleton;
 p:=public.pipstart_optional_metadata_cleanup_plan(t);old_hash:=p->>'planHash';
 before_meta:=pg_temp.metadata_hash();
 -- Receipt failure rolls both kinds of deletion back in the same subtransaction.
 execute 'create trigger generated_cleanup_receipt_failure before insert on public.pipstart_optional_cleanup_receipts for each row execute function pg_temp.fail_cleanup_receipt()';
 failed:=false;begin perform public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'M21-generated-proof');exception when others then failed:=true;end;
 perform pg_temp.assert(failed and before_meta=pg_temp.metadata_hash(),'audit failure rolls deletions back');
 perform pg_temp.assert((select count(*)=0 from public.pipstart_optional_cleanup_receipts),'audit failure leaves no success receipt');
 execute 'drop trigger generated_cleanup_receipt_failure on public.pipstart_optional_cleanup_receipts';
 select md5(string_agg(v,'|' order by v)) into before_protected from (
  select to_jsonb(q)::text v from public.pipstart_optional_email_jobs q union all select to_jsonb(q)::text from public.pipstart_email_unsubscribe_tokens q
  union all select to_jsonb(q)::text from public.pipstart_email_preferences q union all select to_jsonb(q)::text from public.pipstart_optional_provider_receipts q
  union all select to_jsonb(q)::text from public.pipstart_optional_delivery_events q union all select to_jsonb(q)::text from public.pipstart_optional_retention_holds q
  union all select to_jsonb(q)::text from public.pipstart_optional_worker_slot q) z;
 r:=public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'M21-generated-proof');
 perform pg_temp.assert(r->>'status'='cleaned' and (r->>'cadenceCount')::integer+(r->>'recoveryAuditCount')::integer=100,'one bounded cleanup');
 perform pg_temp.assert((select count(*)=1 and bool_and(plan_hash=old_hash and plan_at=t and cadence_count+recovery_count=100) from public.pipstart_optional_cleanup_receipts),'exact atomic receipt');
 select md5(string_agg(v,'|' order by v)) into after_protected from (
  select to_jsonb(q)::text v from public.pipstart_optional_email_jobs q union all select to_jsonb(q)::text from public.pipstart_email_unsubscribe_tokens q
  union all select to_jsonb(q)::text from public.pipstart_email_preferences q union all select to_jsonb(q)::text from public.pipstart_optional_provider_receipts q
  union all select to_jsonb(q)::text from public.pipstart_optional_delivery_events q union all select to_jsonb(q)::text from public.pipstart_optional_retention_holds q
  union all select to_jsonb(q)::text from public.pipstart_optional_worker_slot q) z;
 perform pg_temp.assert(before_protected=after_protected,'content/tokens/preferences/provider evidence/holds/admission untouched');
 perform pg_temp.assert((select count(*)=4 from public.pipstart_optional_email_reservations where job_id in (protected,transitive,recent,pending)),'direct/transitive held/recent/unresolved budgets retained');
 perform pg_temp.assert((select count(*)=5 from public.pipstart_optional_worker_recoveries where run_fingerprint in (repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64),repeat('5',64))),'held/recent/unresolved audits retained');
 before_meta:=pg_temp.metadata_hash();
 perform pg_temp.assert(public.pipstart_execute_optional_metadata_cleanup(t,old_hash,true,'M21-generated-proof')->>'status'='already_recorded','lost acknowledgement is not another batch');
 perform pg_temp.assert(before_meta=pg_temp.metadata_hash(),'replay deletes nothing more');
 p:=public.pipstart_optional_metadata_cleanup_plan(t);
 perform pg_temp.assert((p->>'cadenceCount')::integer+(p->>'recoveryAuditCount')::integer=19,'remaining candidates not auto-drained');
 perform pg_temp.assert(public.pipstart_lookup_email_unsubscribe_token(repeat('a',64))->>'status'='valid','unsubscribe link survives cleanup');
end $$;
rollback;
begin;
do $$declare t timestamptz:=clock_timestamp();j uuid:=gen_random_uuid();p jsonb;r jsonb;begin
 insert into public.pipstart_optional_email_reservations values(j,repeat('a',64),'partner_offer',t-interval '744 hours');
 insert into public.pipstart_optional_worker_recoveries values(repeat('6',64),repeat('a',64),'M21-generated-boundary',session_user,true,t-interval '9000 hours',t-interval '8760 hours',array[j]);
 p:=public.pipstart_optional_metadata_cleanup_plan(t);
 if (p->>'cadenceCount')::integer<>0 or (p->>'recoveryAuditCount')::integer<>0 then raise exception 'Exact cutoff must not delete';end if;
 r:=public.pipstart_execute_optional_metadata_cleanup(t,p->>'planHash',true,'M21-generated-boundary');
 if r->>'status'<>'no_work' or exists(select 1 from public.pipstart_optional_cleanup_receipts) then raise exception 'No-work must not create deletion receipt';end if;
 update public.pipstart_optional_email_reservations set reserved_at=reserved_at-interval '1 second' where job_id=j;
 update public.pipstart_optional_worker_recoveries set recovered_at=recovered_at-interval '1 second' where run_fingerprint=repeat('6',64);
 p:=public.pipstart_optional_metadata_cleanup_plan(t);
 if (p->>'cadenceCount')::integer<>1 or (p->>'recoveryAuditCount')::integer<>1 then raise exception 'Strictly older cutoff must select exact pair';end if;
 r:=public.pipstart_execute_optional_metadata_cleanup(t,p->>'planHash',true,'M21-generated-boundary');
 if r->>'status'<>'cleaned' or (r->>'cadenceCount')::integer+(r->>'recoveryAuditCount')::integer<>2 then raise exception 'Boundary pair not cleaned exactly';end if;
end $$;
rollback;
begin read only;
select public.pipstart_optional_metadata_cleanup_plan()->>'status' as read_only_plan;
rollback;
