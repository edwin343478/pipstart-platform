-- Generated fixtures only, in a disposable database; everything rolls back.
begin;
create function public.m21_generated_evidence_fault() returns trigger language plpgsql as $$
begin if new.event_id='generated-audit-fault' then raise exception using errcode='ZX002',message='generated event write failure';end if;return new;end $$;
create trigger m21_generated_evidence_fault before insert on public.pipstart_optional_delivery_events for each row execute function public.m21_generated_evidence_fault();
create function public.m21_generated_message(p_job uuid) returns jsonb language sql as $$
 select jsonb_build_object('jobId',id::text,'to','generated@example.test','subject',subject,'html','<p>Generated</p>','text','Generated','headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click')) from public.pipstart_optional_email_jobs where id=p_job;
$$;
do $$
declare u uuid:='00000000-0000-4000-8000-000000000061';provider text:='00000000-0000-4000-8000-000000000064';other_provider text:='00000000-0000-4000-8000-000000000065';j uuid;j2 uuid;pending uuid;token uuid;claim jsonb;m jsonb;d text;m2 jsonb;d2 text;receipt jsonb;evidence jsonb;summary jsonb;old_preferences jsonb;old_user jsonb;digest_fixture jsonb;
begin
 digest_fixture:=jsonb_build_object('jobId','00000000-0000-4000-8000-000000000001','to','generated@example.test','subject','Generated','html','<p>Learning '||chr(128512)||'</p>','text','Learning '||chr(128512),'headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click'));
 if public.pipstart_optional_prepared_digest(digest_fixture)<>'4b32bc5a9873d6a504c013b72cba8cce5fd885f604bd5deee767e05084763bb3' then raise exception 'JS/SQL UTF8 digest disagreement';end if;
 if public.pipstart_optional_prepared_digest('{}'::jsonb) is not null then raise exception 'invalid prepared digest accepted';end if;
 insert into auth.users(id,email,email_confirmed_at) values(u,'generated@example.test',now());
 select to_jsonb(p) into old_preferences from public.pipstart_email_preferences p where user_id=u;
 select to_jsonb(a) into old_user from auth.users a where id=u;
 j:=(public.pipstart_enqueue_optional_email(u,'generated-delivery','learning_lesson','Generated','<p>Generated</p>','Generated')->>'jobId')::uuid;
 claim:=public.pipstart_claim_optional_email(j);token:=(claim->>'token')::uuid;m:=public.m21_generated_message(j);d:=public.pipstart_optional_prepared_digest(m);
 if not public.pipstart_begin_optional_email(j,token,m) then raise exception 'fixture begin';end if;
 -- Signed callback arrives BEFORE the provider acknowledgment/queue checkpoint.
 if public.pipstart_record_optional_delivery_event('generated-delivered',j,provider,d,'GENERATED@example.test','email.delivered','2026-10-21T12:00:00Z')<>'recorded' then raise exception 'early callback';end if;
 if (select status from public.pipstart_optional_email_jobs where id=j)<>'sending' then raise exception 'callback rewrote queue';end if;
 summary:=public.pipstart_optional_provider_evidence(j);
 if summary->>'queueStatus'<>'sending' or not (summary->>'signedEvidence')::boolean or (summary->>'apiAcknowledged')::boolean or (summary->>'resendAllowed')::boolean then raise exception 'early correlation summary';end if;
 if public.pipstart_record_optional_provider_ack(j,provider,d)<>'bound' then raise exception 'API ack after callback';end if;
 select to_jsonb(r) into receipt from public.pipstart_optional_provider_receipts r where job_id=j;
 select to_jsonb(e) into evidence from public.pipstart_optional_delivery_events e where event_id='generated-delivered';
 if public.pipstart_record_optional_provider_ack(j,provider,d)<>'duplicate' then raise exception 'ack duplicate';end if;
 if public.pipstart_record_optional_delivery_event('generated-delivered',j,provider,d,'generated@example.test','email.delivered','2026-10-21T12:00:00Z')<>'duplicate' then raise exception 'event duplicate';end if;
 if (select to_jsonb(r) from public.pipstart_optional_provider_receipts r where job_id=j)<>receipt or (select to_jsonb(e) from public.pipstart_optional_delivery_events e where event_id='generated-delivered')<>evidence then raise exception 'duplicate mutated timestamps/evidence';end if;
 if public.pipstart_record_optional_delivery_event('generated-earlier',j,provider,d,'generated@example.test','email.sent','2026-10-21T10:00:00Z')<>'recorded' then raise exception 'out of order';end if;
 if not public.pipstart_finish_optional_email(j,token,'accepted',null,provider) then raise exception 'normal accepted checkpoint';end if;
 perform public.pipstart_record_optional_delivery_event('generated-failed',j,provider,d,'generated@example.test','email.failed','2026-10-21T13:00:00Z');
 summary:=public.pipstart_optional_provider_evidence(j);
 if summary->>'queueStatus'<>'accepted' or summary->'events'<>'["email.delivered","email.failed","email.sent"]'::jsonb or (summary->>'resendAllowed')::boolean then raise exception 'last event overwrote facts/queue';end if;
 -- Conflicting event IDs, recipients, digests or providers cannot overwrite evidence.
 begin perform public.pipstart_record_optional_delivery_event('generated-delivered',j,provider,d,'generated@example.test','email.sent','2026-10-21T12:00:00Z');raise exception using errcode='ZX001',message='event conflict accepted';exception when sqlstate 'P0001' then null;end;
 begin perform public.pipstart_record_optional_delivery_event('generated-other',j,provider,d,'other@example.test','email.sent',now());raise exception using errcode='ZX001',message='wrong recipient accepted';exception when sqlstate 'P0001' then null;end;
 begin perform public.pipstart_record_optional_provider_ack(j,other_provider,d);raise exception using errcode='ZX001',message='second provider accepted';exception when sqlstate 'P0001' then null;end;
 begin perform public.pipstart_record_optional_provider_ack(j,provider,repeat('b',64));raise exception using errcode='ZX001',message='wrong digest accepted';exception when sqlstate 'P0001' then null;end;
 j2:=(public.pipstart_enqueue_optional_email(u,'generated-uncertain','learning_lesson','Generated','<p>Generated</p>','Generated')->>'jobId')::uuid;
 claim:=public.pipstart_claim_optional_email(j2);token:=(claim->>'token')::uuid;m2:=public.m21_generated_message(j2);d2:=public.pipstart_optional_prepared_digest(m2);perform public.pipstart_begin_optional_email(j2,token,m2);
 begin perform public.pipstart_record_optional_delivery_event('generated-delivered',j2,other_provider,d2,'generated@example.test','email.delivered',now());raise exception using errcode='ZX001',message='event reassigned';exception when sqlstate 'P0001' then null;end;
 if exists(select 1 from public.pipstart_optional_provider_receipts where job_id=j2) then raise exception 'conflict left receipt';end if;
 begin perform public.pipstart_record_optional_delivery_event('generated-audit-fault',j2,other_provider,d2,'generated@example.test','email.sent',now());raise exception using errcode='ZX001',message='event audit failure not propagated';exception when sqlstate 'ZX002' then null;end;
 if exists(select 1 from public.pipstart_optional_provider_receipts where job_id=j2) or exists(select 1 from public.pipstart_optional_delivery_events where event_id='generated-audit-fault') then raise exception 'event failure left partial receipt';end if;
 begin perform public.pipstart_record_optional_provider_ack(j2,provider,d2);raise exception using errcode='ZX001',message='provider assigned twice';exception when unique_violation then null;end;
 -- Unknown provider response/checkpoint: later signed evidence NEVER requeues the job.
 perform public.pipstart_finish_optional_email(j2,token,'manual','provider_uncertain',null);
 if public.pipstart_record_optional_delivery_event('generated-recovered',j2,other_provider,d2,'generated@example.test','email.sent',now())<>'recorded' then raise exception 'lost acknowledgment correlation';end if;
 if public.pipstart_claim_optional_email(j2)->>'status'<>'manual' or public.pipstart_optional_provider_evidence(j2)->>'queueStatus'<>'manual' then raise exception 'evidence enabled retry';end if;
 pending:=(public.pipstart_enqueue_optional_email(u,'generated-pending','learning_lesson','Generated','<p>Generated</p>','Generated')->>'jobId')::uuid;
 if public.pipstart_record_optional_provider_ack(pending,'00000000-0000-4000-8000-000000000066',repeat('a',64))<>'ignored' then raise exception 'unsent job correlated';end if;
 claim:=public.pipstart_claim_optional_email(pending);token:=(claim->>'token')::uuid;m2:=public.m21_generated_message(pending);d2:=public.pipstart_optional_prepared_digest(m2);perform public.pipstart_begin_optional_email(pending,token,m2);
 if public.pipstart_record_optional_provider_ack(pending,'00000000-0000-4000-8000-000000000066',d2)<>'bound' then raise exception 'API-first receipt';end if;
 summary:=public.pipstart_optional_provider_evidence(pending);
 if not (summary->>'apiAcknowledged')::boolean or (summary->>'signedEvidence')::boolean or summary->'events'<>'[]'::jsonb then raise exception 'API acknowledgment falsely implied delivery';end if;
 if public.pipstart_record_optional_delivery_event('generated-api-first',pending,'00000000-0000-4000-8000-000000000066',d2,'generated@example.test','email.sent',now())<>'recorded' then raise exception 'callback after API ack';end if;
 if public.pipstart_record_optional_delivery_event('generated-missing','00000000-0000-4000-8000-000000000069',provider,d,'generated@example.test','email.sent',now())<>'ignored' then raise exception 'missing/deleted job';end if;
 if public.pipstart_optional_provider_evidence('00000000-0000-4000-8000-000000000069')<>'{"status":"missing"}'::jsonb then raise exception 'missing summary';end if;
 if (select to_jsonb(p) from public.pipstart_email_preferences p where user_id=u)<>old_preferences or (select to_jsonb(a) from auth.users a where id=u)<>old_user then raise exception 'Auth/preference mutation';end if;
 if (select count(*) from public.pipstart_optional_provider_receipts)<>3 or (select count(*) from public.pipstart_optional_delivery_events)<>5 then raise exception 'evidence cardinality';end if;
 delete from auth.users where id=u;
 if exists(select 1 from public.pipstart_optional_provider_receipts) or exists(select 1 from public.pipstart_optional_delivery_events) then raise exception 'account deletion failed to remove linked evidence';end if;
end $$;
do $$
declare t text;r text;f text;
begin
 foreach t in array array['pipstart_optional_provider_receipts','pipstart_optional_delivery_events'] loop
  if not (select relrowsecurity from pg_class where oid=('public.'||t)::regclass) then raise exception 'RLS missing';end if;
  foreach r in array array['anon','authenticated','service_role'] loop
   if has_table_privilege(r,'public.'||t,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then raise exception 'direct API table grant';end if;
  end loop;
 end loop;
 foreach f in array array['public.pipstart_record_optional_provider_ack(uuid,text,text)','public.pipstart_record_optional_delivery_event(text,uuid,text,text,text,text,timestamptz)','public.pipstart_optional_provider_evidence(uuid)'] loop
  if not has_function_privilege('service_role',f,'EXECUTE') or has_function_privilege('anon',f,'EXECUTE') or has_function_privilege('authenticated',f,'EXECUTE') then raise exception 'RPC grants';end if;
  if not exists(select 1 from pg_proc where oid=f::regprocedure and prosecdef and proconfig @> array['search_path=""']) then raise exception 'definer search path';end if;
 end loop;
 foreach f in array array['public.pipstart_optional_prepared_digest(jsonb)','public.pipstart_bind_optional_provider(uuid,text,text,text)'] loop
  foreach r in array array['anon','authenticated','service_role'] loop
   if has_function_privilege(r,f,'EXECUTE') then raise exception 'private helper exposed';end if;
  end loop;
 end loop;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name in ('pipstart_optional_provider_receipts','pipstart_optional_delivery_events') and column_name in ('email','recipient','subject','payload','headers','html','text','token')) then raise exception 'raw sensitive evidence columns';end if;
end $$;
rollback;
