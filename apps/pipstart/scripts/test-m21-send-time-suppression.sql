-- Generated fixtures ONLY: run in the isolated temporary database, never hosted.
begin;
create function pg_temp.assert_m21(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'M21 suppression assertion: %',label;end if;end $$;
select pg_temp.assert_m21(not has_function_privilege('anon','public.pipstart_optional_email_dispatch_state(uuid)','EXECUTE'),'anonymous execution denied');
select pg_temp.assert_m21(not has_function_privilege('authenticated','public.pipstart_optional_email_dispatch_state(uuid)','EXECUTE'),'authenticated execution denied');
select pg_temp.assert_m21(has_function_privilege('service_role','public.pipstart_optional_email_dispatch_state(uuid)','EXECUTE'),'service execution granted');
select pg_temp.assert_m21((select prosecdef and proconfig @> array['search_path=""'] from pg_proc where oid='public.pipstart_optional_email_dispatch_state(uuid)'::regprocedure),'definer private path');
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state(null)='{"status":"inactive"}'::jsonb,'null denied');
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000090')='{"status":"inactive"}'::jsonb,'missing denied');
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000000091','generated-first@example.test',now(),'{"display_name":"Generated Dispatch Fixture"}');
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')=
 '{"status":"active","email":"generated-first@example.test","learning":true,"partner":true,"frequency":"all"}'::jsonb,'default state/current confirmed address');
update public.pipstart_email_preferences set learning_frequency='weekly',marketing_emails=false where user_id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')=
 '{"status":"active","email":"generated-first@example.test","learning":true,"partner":false,"frequency":"weekly"}'::jsonb,'fresh booleans and cadence');
select pg_temp.assert_m21(public.pipstart_issue_email_unsubscribe_token('00000000-0000-4000-8000-000000000091','learning',repeat('a',64)),'fixture token');
select pg_temp.assert_m21(public.pipstart_apply_email_unsubscribe(repeat('a',64))='unsubscribed','unsubscribe applied');
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')=
 '{"status":"active","email":"generated-first@example.test","learning":false,"partner":false,"frequency":"weekly"}'::jsonb,'unsubscribe visible to later dispatch read');
update auth.users set email='generated-current@example.test' where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')->>'email'='generated-current@example.test','current email not stale recipient');
create temporary table m21_before as select (select count(*) from public.pipstart_email_preference_events) as history_count,
 (select jsonb_agg(to_jsonb(p) order by user_id) from public.pipstart_email_preferences p) as preferences;
set local role service_role;
select public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091');
reset role;
select pg_temp.assert_m21((select history_count=(select count(*) from public.pipstart_email_preference_events)
 and preferences=(select jsonb_agg(to_jsonb(p) order by user_id) from public.pipstart_email_preferences p) from m21_before),'read-only RPC does not alter preferences/history');
update auth.users set email_confirmed_at=null where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')='{"status":"inactive"}'::jsonb,'unconfirmed denied');
update auth.users set email_confirmed_at=now(),banned_until=now()+interval '1 day' where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')='{"status":"inactive"}'::jsonb,'banned denied');
update auth.users set banned_until=now()-interval '1 day' where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')->>'status'='active','expired ban no longer blocks');
update auth.users set deleted_at=now() where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')='{"status":"inactive"}'::jsonb,'soft deletion denied');
update auth.users set deleted_at=null,email='' where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')='{"status":"inactive"}'::jsonb,'empty address denied');
update auth.users set email='generated-current@example.test' where id='00000000-0000-4000-8000-000000000091';
delete from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')='{"status":"inactive"}'::jsonb,'missing preference row denied');
delete from auth.users where id='00000000-0000-4000-8000-000000000091';
select pg_temp.assert_m21(public.pipstart_optional_email_dispatch_state('00000000-0000-4000-8000-000000000091')='{"status":"inactive"}'::jsonb,'hard deletion denied');
rollback;
