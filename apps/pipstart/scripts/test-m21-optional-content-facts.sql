-- Disposable generated database only. Future minimization is simulated inside rollback.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Content facts assertion: %',label;end if;end $$;
create function pg_temp.message(j uuid,email text) returns jsonb language sql as $$
 select jsonb_build_object('jobId',id::text,'to',email,'subject',subject,'html',html,'text',body_text,'headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click')) from public.pipstart_optional_email_jobs where id=j;
$$;
create function pg_temp.deny_envelope_fact() returns trigger language plpgsql as $$
begin if new.prepared_hash is not null then raise exception using errcode='ZX002',message='Generated fact failure';end if;return new;end $$;
do $$declare role_name text;begin
 foreach role_name in array array['anon','authenticated','service_role'] loop
  perform pg_temp.assert(not has_table_privilege(role_name,'public.pipstart_optional_content_facts','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'private facts table');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_optional_content_digest(text,text,text,text)','EXECUTE'),'private content digest');
  perform pg_temp.assert(not has_function_privilege(role_name,'public.pipstart_capture_optional_content_facts()','EXECUTE'),'private trigger helper');
 end loop;
end $$;
do $$declare u uuid:=gen_random_uuid();u2 uuid:=gen_random_uuid();j uuid;j2 uuid;token uuid;t2 uuid;m jsonb;m2 jsonb;d text;d2 text;f jsonb;r jsonb;cname text;failed boolean;pid text:=gen_random_uuid()::text;pid2 text:=gen_random_uuid()::text;begin
 perform pg_temp.assert((select count(*) from public.pipstart_optional_content_facts)=(select count(*) from public.pipstart_optional_email_jobs),'complete backfill');
 perform pg_temp.assert(not exists(select 1 from public.pipstart_optional_email_jobs q join public.pipstart_optional_content_facts x on x.job_id=q.id where x.content_hash<>public.pipstart_optional_content_digest(q.kind,q.subject,q.html,q.body_text) or x.minimized_at is not null),'exact initial content facts');
 perform pg_temp.assert(public.pipstart_optional_content_digest('ab','c','x','y')<>public.pipstart_optional_content_digest('a','bc','x','y'),'length prefixes avoid concatenation ambiguity');
 insert into auth.users(id,email,email_confirmed_at) values(u,'facts-private@example.test',now()),(u2,'facts-second@example.test',now());
 perform public.pipstart_issue_email_unsubscribe_token(u,'all',repeat('b',64));
 r:=public.pipstart_enqueue_optional_email(u,'facts-stable','learning_lesson','Generated','<p>Unicode '||chr(128512)||'</p>','Unicode '||chr(128512));j:=(r->>'jobId')::uuid;
 perform pg_temp.assert(r->>'status'='queued' and exists(select 1 from public.pipstart_optional_content_facts where job_id=j and prepared_hash is null),'facts committed with enqueue');
 perform pg_temp.assert(public.pipstart_enqueue_optional_email(u,'facts-stable','learning_lesson','Generated','<p>Unicode '||chr(128512)||'</p>','Unicode '||chr(128512),now()+interval '1 day')->>'status'='duplicate','same payload first schedule wins');
 perform pg_temp.assert(public.pipstart_enqueue_optional_email(u,'facts-stable','learning_lesson','Changed','<p>Unicode '||chr(128512)||'</p>','Unicode '||chr(128512))->>'status'='conflict','different payload never overwrites');
 token:=(public.pipstart_claim_optional_email(j)->>'token')::uuid;m:=pg_temp.message(j,'facts-private@example.test');d:=public.pipstart_optional_prepared_digest(m);
 perform pg_temp.assert(public.pipstart_begin_optional_email(j,token,m),'normal cadence-protected begin');
 select to_jsonb(x) into f from public.pipstart_optional_content_facts x where job_id=j;
 perform pg_temp.assert(f->>'prepared_hash'=d and f->>'recipient_hash'=public.pipstart_optional_address_hash('FACTS-private@example.test'),'exact envelope and recipient facts');
 perform pg_temp.assert(position('@' in f::text)=0 and position('Unicode' in f::text)=0 and position('List-Unsubscribe' in f::text)=0,'no duplicate raw message or links');
 failed:=false;begin update public.pipstart_optional_email_jobs set prepared_message=jsonb_set(m,'{text}','"changed"') where id=j;exception when others then failed:=true;end;
 perform pg_temp.assert(failed and (select prepared_message=m from public.pipstart_optional_email_jobs where id=j),'durable envelope cannot change');
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('facts-signed-first',j,pid,d,'FACTS-private@example.test','email.delivered','2026-10-22T00:00:00Z')='recorded','signed callback before acknowledgement');
 perform pg_temp.assert(public.pipstart_record_optional_provider_ack(j,pid,d)='bound','API ack after callback');
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('facts-signed-first',j,pid,d,'facts-private@example.test','email.delivered','2026-10-22T00:00:00Z')='duplicate','duplicate event immutable');
 perform pg_temp.assert(public.pipstart_finish_optional_email(j,token,'accepted',null,pid),'normal accepted checkpoint');
 j2:=(public.pipstart_enqueue_optional_email(u2,'facts-atomic','learning_lesson','Generated','Generated','Generated')->>'jobId')::uuid;
 t2:=(public.pipstart_claim_optional_email(j2)->>'token')::uuid;m2:=pg_temp.message(j2,'facts-second@example.test');d2:=public.pipstart_optional_prepared_digest(m2);
 execute 'create trigger generated_fact_failure before update on public.pipstart_optional_content_facts for each row execute function pg_temp.deny_envelope_fact()';
 failed:=false;begin perform public.pipstart_begin_optional_email(j2,t2,m2);exception when sqlstate 'ZX002' then failed:=true;end;
 perform pg_temp.assert(failed and (select status='preparing' and prepared_message is null from public.pipstart_optional_email_jobs where id=j2) and not exists(select 1 from public.pipstart_optional_email_reservations where job_id=j2) and (select prepared_hash is null from public.pipstart_optional_content_facts where job_id=j2),'fact failure rolls marker and reservation back');
 execute 'drop trigger generated_fact_failure on public.pipstart_optional_content_facts';
 perform pg_temp.assert(public.pipstart_begin_optional_email(j2,t2,m2),'begin after generated fault removed');
 perform pg_temp.assert(public.pipstart_finish_optional_email(j2,t2,'manual','provider_uncertain',null),'uncertain outcome quarantined');
 failed:=false;begin
  update public.pipstart_optional_content_facts set minimized_at=clock_timestamp() where job_id=j2;
  update public.pipstart_optional_email_jobs set subject='[Content removed]',html='<p>Content removed.</p>',body_text='Content removed.',prepared_message=null where id=j2;
 exception when others then failed:=true;end;
 perform pg_temp.assert(failed and (select minimized_at is null from public.pipstart_optional_content_facts where job_id=j2),'manual/uncertain content cannot minimize');
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('facts-uncertain',j2,pid2,d2,'facts-second@example.test','email.sent',now())='recorded' and public.pipstart_claim_optional_email(j2)->>'status'='manual','late uncertain evidence never permits retry');
 -- The production constraint stays unchanged. Only this rollback-only simulation
 -- temporarily permits an accepted tombstone to test the future compatibility path.
 select conname into strict cname from pg_constraint where conrelid='public.pipstart_optional_email_jobs'::regclass and contype='c' and position('prepared_message IS NOT NULL' in pg_get_constraintdef(oid))>0;
 execute format('alter table public.pipstart_optional_email_jobs drop constraint %I',cname);
 update public.pipstart_optional_content_facts set minimized_at=clock_timestamp() where job_id=j;
 update public.pipstart_optional_email_jobs set subject='[Content removed]',html='<p>Content removed.</p>',body_text='Content removed.',prepared_message=null where id=j;
 perform pg_temp.assert(public.pipstart_enqueue_optional_email(u,'facts-stable','learning_lesson','Generated','<p>Unicode '||chr(128512)||'</p>','Unicode '||chr(128512))->>'status'='duplicate','dedupe survives simulated minimization');
 perform pg_temp.assert(public.pipstart_enqueue_optional_email(u,'facts-stable','learning_lesson','Changed','<p>Unicode '||chr(128512)||'</p>','Unicode '||chr(128512))->>'status'='conflict','tombstone does not accept different body');
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('facts-after-minimization',j,pid,d,'facts-private@example.test','email.failed',now())='recorded','late webhook survives removed payload');
 perform pg_temp.assert(public.pipstart_record_optional_provider_ack(j,pid,d)='duplicate','old acknowledgement still matches');
 failed:=false;begin perform public.pipstart_record_optional_delivery_event('facts-wrong-recipient',j,pid,d,'wrong@example.test','email.sent',now());exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'wrong recipient rejected after minimization');
 failed:=false;begin perform public.pipstart_record_optional_provider_ack(j,pid,repeat('c',64));exception when others then failed:=true;end;
 perform pg_temp.assert(failed,'wrong digest rejected after minimization');
 perform pg_temp.assert(public.pipstart_optional_provider_evidence(j)->>'resendAllowed'='false' and public.pipstart_claim_optional_email(j)->>'status'='terminal','minimized accepted job never requeues');
 perform pg_temp.assert(public.pipstart_lookup_email_unsubscribe_token(repeat('b',64))->>'status'='valid','valid unsubscribe link retained');
 delete from auth.users where id=u;
 perform pg_temp.assert(not exists(select 1 from public.pipstart_optional_content_facts where job_id=j),'account deletion removes linked facts');
 perform pg_temp.assert(public.pipstart_record_optional_delivery_event('facts-deleted',j,pid,d,'facts-private@example.test','email.sent',now())='ignored','deleted account/job not resurrected');
end $$;
rollback;
