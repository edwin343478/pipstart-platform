-- Generated fixtures only: intended for the isolated temporary DB, NOT hosted.
begin;
create function pg_temp.assert_queue(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'M21 queue assertion: %',label;end if;end $$;
select pg_temp.assert_queue(not has_table_privilege('anon','public.pipstart_optional_email_jobs','SELECT,INSERT,UPDATE,DELETE')
 and not has_table_privilege('authenticated','public.pipstart_optional_email_jobs','SELECT,INSERT,UPDATE,DELETE')
 and not has_table_privilege('service_role','public.pipstart_optional_email_jobs','SELECT,INSERT,UPDATE,DELETE'),'no direct API table privileges');
select pg_temp.assert_queue((select relrowsecurity from pg_class where oid='public.pipstart_optional_email_jobs'::regclass),'RLS enabled');
select pg_temp.assert_queue((select count(*)=5 and bool_and(prosecdef and proconfig @> array['search_path=""']
 and has_function_privilege('service_role',oid,'EXECUTE') and not has_function_privilege('anon',oid,'EXECUTE')
 and not has_function_privilege('authenticated',oid,'EXECUTE')) from pg_proc where pronamespace='public'::regnamespace
 and proname in ('pipstart_enqueue_optional_email','pipstart_claim_optional_email','pipstart_begin_optional_email','pipstart_finish_optional_email','pipstart_release_optional_email')),'five service-only private-path RPCs');
insert into auth.users(id,email,email_confirmed_at) values
 ('00000000-0000-4000-8000-000000000091','queue-generated@example.test',now()),
 ('00000000-0000-4000-8000-000000000092','queue-cascade@example.test',now());
do $$
declare u uuid:='00000000-0000-4000-8000-000000000091';j uuid;t1 uuid;t2 uuid;r jsonb;m jsonb;k uuid;
begin
 r:=public.pipstart_enqueue_optional_email(u,'stable','learning_lesson','Generated','<p>Generated</p>','Generated');j:=(r->>'jobId')::uuid;
 perform pg_temp.assert_queue(r->>'status'='queued','first enqueue');
 r:=public.pipstart_enqueue_optional_email(u,'stable','learning_lesson','Generated','<p>Generated</p>','Generated',now()+interval '1 day');
 perform pg_temp.assert_queue(r->>'status'='duplicate' and (r->>'jobId')::uuid=j,'dedupe same payload, first schedule wins');
 r:=public.pipstart_enqueue_optional_email(u,'stable','learning_lesson','Different','<p>Generated</p>','Generated');
 perform pg_temp.assert_queue(r->>'status'='conflict' and (select subject='Generated' from public.pipstart_optional_email_jobs where id=j),'conflicting payload never overwrites');
 r:=public.pipstart_claim_optional_email(j);t1:=(r->>'token')::uuid;
 perform pg_temp.assert_queue(r->>'status'='claimed' and r->'job'->>'jobId'=j::text,'first claim');
 perform pg_temp.assert_queue(public.pipstart_claim_optional_email(j)->>'status'='busy' and (select attempts=1 from public.pipstart_optional_email_jobs where id=j),'busy claim does not increment');
 perform pg_temp.assert_queue(not public.pipstart_release_optional_email(j,gen_random_uuid()),'wrong release token');
 update public.pipstart_optional_email_jobs set lease_until=clock_timestamp()-interval '1 second' where id=j;
 r:=public.pipstart_claim_optional_email(j);t2:=(r->>'token')::uuid;
 perform pg_temp.assert_queue(r->>'status'='claimed' and t1<>t2 and (select attempts=2 from public.pipstart_optional_email_jobs where id=j),'stale preparation reclaimed with new fence');
 m:=jsonb_build_object('jobId',j,'to','queue-generated@example.test','subject','Generated','html','<p>Generated</p>','text','Generated','headers',jsonb_build_object('List-Unsubscribe','<https://pipstart.net/unsubscribe?token='||repeat('a',64)||'>','List-Unsubscribe-Post','List-Unsubscribe=One-Click'));
 perform pg_temp.assert_queue(not public.pipstart_begin_optional_email(j,t1,m),'stale owner cannot start');
 perform pg_temp.assert_queue(not public.pipstart_release_optional_email(j,t1),'stale owner cannot release');
 begin
  perform public.pipstart_begin_optional_email(j,t2,m||'{"headers":{}}'::jsonb);
  raise exception 'EXPECTED INVALID PREPARED ENVELOPE';
 exception when raise_exception then
  if sqlerrm='EXPECTED INVALID PREPARED ENVELOPE' then raise;end if;
 end;
 perform pg_temp.assert_queue((select status='preparing' and prepared_message is null from public.pipstart_optional_email_jobs where id=j),'invalid payload leaves no send marker');
 perform pg_temp.assert_queue(public.pipstart_begin_optional_email(j,t2,m),'send marker committed');
 perform pg_temp.assert_queue(not public.pipstart_begin_optional_email(j,t2,m||'{"text":"changed"}'::jsonb),'prepared message cannot be replaced or repeated');
 perform pg_temp.assert_queue(not public.pipstart_release_optional_email(j,t2),'sending cannot return to pending');
 update public.pipstart_optional_email_jobs set updated_at=clock_timestamp()-interval '1 day' where id=j;
 perform pg_temp.assert_queue(public.pipstart_claim_optional_email(j)->>'status'='manual','sending is never reclaimed even after long delay');
 perform pg_temp.assert_queue(not public.pipstart_finish_optional_email(j,t1,'accepted',null,'generated-provider'),'stale finish denied');
 perform pg_temp.assert_queue(public.pipstart_finish_optional_email(j,t2,'accepted',null,'generated-provider'),'acceptance checkpoint');
 perform pg_temp.assert_queue(public.pipstart_claim_optional_email(j)->>'status'='terminal' and (select prepared_message=m from public.pipstart_optional_email_jobs where id=j),'accepted terminal, immutable payload retained');

 r:=public.pipstart_enqueue_optional_email(u,'uncertain','learning_lesson','Generated','<p>Generated</p>','Generated');k:=(r->>'jobId')::uuid;
 r:=public.pipstart_claim_optional_email(k);t1:=(r->>'token')::uuid;m:=jsonb_set(m,'{jobId}',to_jsonb(k));
 perform pg_temp.assert_queue(public.pipstart_begin_optional_email(k,t1,m),'second send marker');
 perform pg_temp.assert_queue(public.pipstart_finish_optional_email(k,t1,'manual','provider_uncertain',null),'uncertain quarantined');
 perform pg_temp.assert_queue(public.pipstart_claim_optional_email(k)->>'status'='manual','uncertain never retried');

 r:=public.pipstart_enqueue_optional_email(u,'retry','learning_lesson','Generated','<p>Generated</p>','Generated');k:=(r->>'jobId')::uuid;
 r:=public.pipstart_claim_optional_email(k);t1:=(r->>'token')::uuid;
 perform pg_temp.assert_queue(public.pipstart_release_optional_email(k,t1),'safe preflight release');
 perform pg_temp.assert_queue(public.pipstart_claim_optional_email(k)->>'status'='not_due','preflight backoff enforced');
 update public.pipstart_optional_email_jobs set available_at=clock_timestamp()-interval '1 second',attempts=4 where id=k;
 r:=public.pipstart_claim_optional_email(k);t1:=(r->>'token')::uuid;
 perform pg_temp.assert_queue(public.pipstart_release_optional_email(k,t1),'fifth preflight release');
 perform pg_temp.assert_queue(public.pipstart_claim_optional_email(k)->>'status'='manual','bounded attempts exhausted');

 update public.pipstart_email_preferences set educational_emails=false where user_id=u;
 perform pg_temp.assert_queue(public.pipstart_enqueue_optional_email(u,'off','learning_lesson','Generated','<p>Generated</p>','Generated')->>'reason'='opted_out','OFF not newly queued');
 update public.pipstart_email_preferences set educational_emails=true,learning_frequency='weekly' where user_id=u;
 perform pg_temp.assert_queue(public.pipstart_enqueue_optional_email(u,'cadence','learning_lesson','Generated','<p>Generated</p>','Generated')->>'reason'='frequency_changed','cadence checked at enqueue');
 r:=public.pipstart_enqueue_optional_email('00000000-0000-4000-8000-000000000092','cascade','partner_offer','Generated','<p>Generated</p>','Generated');k:=(r->>'jobId')::uuid;
 delete from auth.users where id='00000000-0000-4000-8000-000000000092';
 perform pg_temp.assert_queue(not exists(select 1 from public.pipstart_optional_email_jobs where id=k),'account deletion cascades jobs');
end $$;
rollback;
