-- Isolated generated database only. Behavioral changes roll back.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Recovery assertion: %',label;end if;end $$;
do $$declare role_name text;begin
 foreach role_name in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(role_name,'public.pipstart_optional_worker_recoveries','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'no audit API access');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_optional_worker_recovery_snapshot()','EXECUTE'),'no snapshot API access');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_recover_optional_worker(text,text,boolean,text)','EXECUTE'),'no recovery API access');
 end loop;
end $$;
select pg_temp.assert((select relrowsecurity from pg_class where oid='public.pipstart_optional_worker_recoveries'::regclass),'audit RLS');
select pg_temp.assert(public.pipstart_optional_worker_recovery_snapshot()->>'status'='idle','initial idle');
do $$declare snap jsonb;r jsonb;u uuid:=gen_random_uuid();j uuid;legacy uuid;proof text:='M21-generated-proof';denied boolean;before_rows text;after_rows text;token uuid;begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'recovery-private@example.test',now());
 j:=(public.pipstart_enqueue_optional_email(u,'recovery-generated','learning_lesson','Private subject','Private body','Private body')->>'jobId')::uuid;
 select id into strict legacy from public.pipstart_optional_email_jobs where dedupe_key='generated-before-cadence';
 update public.pipstart_optional_email_jobs set status='manual',reason='provider_uncertain',lease_token=null,lease_until=null where id=legacy;
 update public.pipstart_optional_worker_slot set run_token=gen_random_uuid(),started_at=clock_timestamp(),job_ids=array[legacy,j] where singleton;
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 perform pg_temp.assert(snap->>'status'='review_required' and (snap->>'jobCount')::integer=2 and (snap->>'resendAllowed')::boolean=false,'bounded active snapshot');
 perform pg_temp.assert((select array_agg(k order by k)=array['jobCount','resendAllowed','runFingerprint','snapshotHash','status'] from jsonb_object_keys(snap) k),'only metadata returned');
 perform pg_temp.assert((snap->>'snapshotHash') ~ '^[a-f0-9]{64}$','hash format');
 perform pg_temp.assert(position('Private' in snap::text)=0 and position('@' in snap::text)=0,'no content leak');
 perform set_config('TimeZone','Africa/Nairobi',true);
 perform pg_temp.assert(snap=public.pipstart_optional_worker_recovery_snapshot(),'UTC stable snapshot');
 perform set_config('TimeZone','UTC',true);
 denied:=false;
 begin perform public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',false,proof);exception when others then denied:=true;end;
 perform pg_temp.assert(denied,'false attestation denied');
 denied:=false;
 begin perform public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',null,proof);exception when others then denied:=true;end;
 perform pg_temp.assert(denied,'null attestation denied');
 denied:=false;
 begin perform public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,'https://private/key');exception when others then denied:=true;end;
 perform pg_temp.assert(denied,'bad proof denied');
 perform pg_temp.assert(public.pipstart_recover_optional_worker(repeat('0',64),snap->>'snapshotHash',true,proof)->>'status'='changed','wrong run denied');
 update public.pipstart_optional_email_jobs set body_text='Changed private body' where id=j;
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','job drift denied');
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 perform public.pipstart_claim_optional_email(j);
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','preparation lease drift denied');
 -- Fixture-only return to pending to exercise later recovery paths.
 update public.pipstart_optional_email_jobs set status='pending',lease_token=null,lease_until=null where id=j;
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 update public.pipstart_optional_worker_slot set started_at=started_at-interval '1 second' where singleton;
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','slot drift denied');
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 update public.pipstart_optional_email_reservations set reserved_at=reserved_at-interval '1 second' where job_id=legacy;
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','budget drift denied');
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 perform public.pipstart_record_optional_provider_ack(legacy,'00000000-0000-4000-8000-000000000088',(select public.pipstart_optional_prepared_digest(prepared_message) from public.pipstart_optional_email_jobs where id=legacy));
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','ack drift denied');
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 perform public.pipstart_record_optional_delivery_event('recovery-event-one',legacy,'00000000-0000-4000-8000-000000000088',(select public.pipstart_optional_prepared_digest(prepared_message) from public.pipstart_optional_email_jobs where id=legacy),'legacy-cadence@example.test','email.delivered',clock_timestamp());
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','event drift denied');
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 perform public.pipstart_record_optional_delivery_event('recovery-event-two',legacy,'00000000-0000-4000-8000-000000000088',(select public.pipstart_optional_prepared_digest(prepared_message) from public.pipstart_optional_email_jobs where id=legacy),'legacy-cadence@example.test','email.delivered',clock_timestamp());
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','same-type individual event drift denied');
 perform pg_temp.assert((select count(*)=0 from public.pipstart_optional_worker_recoveries),'denied requests never audited as success');
 snap:=public.pipstart_optional_worker_recovery_snapshot();
 select md5(string_agg(v,'|' order by v)) into before_rows from (
  select to_jsonb(t)::text v from public.pipstart_optional_email_jobs t union all select to_jsonb(t)::text from public.pipstart_optional_provider_receipts t
  union all select to_jsonb(t)::text from public.pipstart_optional_delivery_events t union all select to_jsonb(t)::text from public.pipstart_optional_email_reservations t) q;
 r:=public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof);
 perform pg_temp.assert(r=jsonb_build_object('status','recovered','resendAllowed',false),'exact reviewed recovery');
 select md5(string_agg(v,'|' order by v)) into after_rows from (
  select to_jsonb(t)::text v from public.pipstart_optional_email_jobs t union all select to_jsonb(t)::text from public.pipstart_optional_provider_receipts t
  union all select to_jsonb(t)::text from public.pipstart_optional_delivery_events t union all select to_jsonb(t)::text from public.pipstart_optional_email_reservations t) q;
 perform pg_temp.assert(before_rows=after_rows,'job/evidence/budget rows unchanged');
 perform pg_temp.assert((select count(*)=1 and bool_and(run_fingerprint=snap->>'runFingerprint' and snapshot_hash=snap->>'snapshotHash' and proof_ref=proof and executor_stopped_attested and job_ids=array[legacy,j]) from public.pipstart_optional_worker_recoveries),'exact durable audit');
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='idle','repeat does not unlock again');
 r:=public.pipstart_acquire_optional_worker();token:=(r->>'token')::uuid;
 perform pg_temp.assert(r->>'status'='acquired' and jsonb_array_length(r->'jobIds')=1 and r->'jobIds'->>0=j::text,'uncertain job remains quarantined');
 perform pg_temp.assert(public.pipstart_recover_optional_worker(snap->>'runFingerprint',snap->>'snapshotHash',true,proof)->>'status'='changed','old review cannot clear new run');
 perform pg_temp.assert((select run_token=token from public.pipstart_optional_worker_slot),'new admission retained');
end $$;

-- An audit insertion failure must not clear admission.
create function pg_temp.deny_recovery_audit() returns trigger language plpgsql as $$begin raise exception 'Generated audit failure';end $$;
create trigger generated_audit_failure before insert on public.pipstart_optional_worker_recoveries for each row execute function pg_temp.deny_recovery_audit();
do $$declare s jsonb;denied boolean:=false;begin
 s:=public.pipstart_optional_worker_recovery_snapshot();
 begin perform public.pipstart_recover_optional_worker(s->>'runFingerprint',s->>'snapshotHash',true,'M21-generated-audit');exception when others then denied:=true;end;
 perform pg_temp.assert(denied,'audit failure aborts recovery');
 perform pg_temp.assert(s=public.pipstart_optional_worker_recovery_snapshot(),'audit failure preserves admission');
 perform pg_temp.assert((select count(*)=1 from public.pipstart_optional_worker_recoveries),'audit failure inserts nothing');
end $$;
drop trigger generated_audit_failure on public.pipstart_optional_worker_recoveries;
-- A later unlock failure must also roll back the inserted audit row.
create function pg_temp.deny_slot_clear() returns trigger language plpgsql as $$begin if new.run_token is null then raise exception 'Generated slot failure';end if;return new;end $$;
create trigger generated_slot_failure before update on public.pipstart_optional_worker_slot for each row execute function pg_temp.deny_slot_clear();
do $$declare s jsonb;denied boolean:=false;begin
 s:=public.pipstart_optional_worker_recovery_snapshot();
 begin perform public.pipstart_recover_optional_worker(s->>'runFingerprint',s->>'snapshotHash',true,'M21-generated-clear');exception when others then denied:=true;end;
 perform pg_temp.assert(denied and s=public.pipstart_optional_worker_recovery_snapshot(),'slot failure preserves admission');
 perform pg_temp.assert((select count(*)=1 from public.pipstart_optional_worker_recoveries),'slot failure rolls audit back');
end $$;
rollback;
begin read only;
select (public.pipstart_optional_worker_recovery_snapshot()->>'status'='idle') as idle_read_only;
rollback;
