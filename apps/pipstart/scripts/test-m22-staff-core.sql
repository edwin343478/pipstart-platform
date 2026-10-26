-- Only the runner's generated empty database. Simulated verified DB claims,
-- not a Supabase Auth/PostgREST/MFA challenge test. Everything rolls back.
begin;
create function pg_temp.ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'MP02 assertion: %',label; end if; end;
$$;
create function pg_temp.denied(command text,expected text default '42501') returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then
    if sqlstate=expected then return; end if;
    raise exception 'Unexpected MP02 SQLSTATE %',sqlstate;
  end;
  raise exception 'Expected MP02 refusal';
end;
$$;
do $$ begin execute format('grant usage on schema %I to authenticated',pg_my_temp_schema()::regnamespace::text); end; $$;
insert into auth.users(id,raw_user_meta_data)
select ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{"display_name":"Fixture"}'::jsonb
from generate_series(1,10) n;
insert into auth.sessions(id,user_id)
select ('20000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
       ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid
from generate_series(1,10) n;
update public.pipstart_profiles set role='admin' where user_id='10000000-0000-4000-8000-000000000005';
select pg_temp.ok(not (select enabled from pipstart_staff_private.control),'default closed');
select pg_temp.ok(not has_schema_privilege('authenticated','pipstart_staff_private','USAGE'),'no private API schema access');
select pg_temp.ok(not has_function_privilege('service_role','public.pipstart_staff_change(uuid,text,text,text,text,text,uuid,text)','EXECUTE'),'service key is not staff authorization');
select pg_temp.ok(not has_function_privilege('anon','public.pipstart_staff_access(text,text)','EXECUTE'),'anonymous cannot inspect staff');
select pg_temp.ok(not exists(select 1 from pg_proc p join pg_namespace n on p.pronamespace=n.oid where n.nspname='pipstart_staff_private' and (not p.prosecdef and p.proname<>'immutable_audit')),'all callable private helpers use protected context');

select pipstart_staff_private.bootstrap_owner('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001');
select pg_temp.denied($q$select pipstart_staff_private.bootstrap_owner('10000000-0000-4000-8000-000000000002',gen_random_uuid())$q$);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","session_id":"20000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok(public.pipstart_staff_access()='{"authorized":false}'::jsonb,'bootstrap does not activate');
select pg_temp.denied('select * from pipstart_staff_private.roles');
reset role;
select pipstart_staff_private.transition(true,0,'30000000-0000-4000-8000-000000000002');
insert into pipstart_staff_private.members(user_id)
select ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(2,9) n where n<>5;
insert into pipstart_staff_private.roles(user_id,role_name) values
('10000000-0000-4000-8000-000000000002','owner'),
('10000000-0000-4000-8000-000000000003','author'),
('10000000-0000-4000-8000-000000000004','administrator'),
('10000000-0000-4000-8000-000000000006','moderator'),
('10000000-0000-4000-8000-000000000007','affiliate_manager'),
('10000000-0000-4000-8000-000000000008','reviewer'),
('10000000-0000-4000-8000-000000000009','editor');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values
('10000000-0000-4000-8000-000000000003','lesson','lesson-a'),
('10000000-0000-4000-8000-000000000006','maintenance','item-a'),
('10000000-0000-4000-8000-000000000007','partner','partner-a'),
('10000000-0000-4000-8000-000000000008','lesson','lesson-a'),
('10000000-0000-4000-8000-000000000009','lesson','lesson-a'),
('10000000-0000-4000-8000-000000000008','partner','partner-a'),
('10000000-0000-4000-8000-000000000009','partner','partner-a');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","session_id":"20000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select pg_temp.ok(public.pipstart_staff_access()='{"authorized":false}'::jsonb,'AAL1 denied');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","session_id":"20000000-0000-4000-8000-000000000002","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok(public.pipstart_staff_access()='{"authorized":false}'::jsonb,'foreign session denied');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000005","session_id":"20000000-0000-4000-8000-000000000005","aal":"aal2","role":"authenticated","user_metadata":{"role":"owner"}}',true);
select pg_temp.ok(public.pipstart_staff_access()='{"authorized":false}'::jsonb,'legacy admin and editable metadata confer no staff grant');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","session_id":"20000000-0000-4000-8000-000000000003","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.write','assigned author writes');
select pg_temp.ok(not ((public.pipstart_staff_access('lesson','lesson-b')->'capabilities') ? 'content.write'),'other assignment denied');
select pg_temp.ok(not ((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.review'),'author cannot self-review');
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000003','grant_role','owner','','',repeat('a',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.denied('select public.pipstart_staff_audit_page()');
select pg_temp.denied($q$select pipstart_staff_private.issue_receipt('10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','grant_role','10000000-0000-4000-8000-000000000003','owner','','',sha256(convert_to(repeat('a',64),'UTF8')),clock_timestamp())$q$);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000006","session_id":"20000000-0000-4000-8000-000000000006","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok((public.pipstart_staff_access('maintenance','item-a')->'capabilities') ? 'maintenance.assigned','moderator scoped maintenance');
select pg_temp.ok(not ((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.write'),'moderator no disclosure/content edit');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000007","session_id":"20000000-0000-4000-8000-000000000007","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok((public.pipstart_staff_access('partner','partner-a')->'capabilities') ? 'partner.write','affiliate scoped facts');
select pg_temp.ok(not ((public.pipstart_staff_access('partner','partner-a')->'capabilities') ? 'secrets.read'),'no infrastructure capability');
select pg_temp.denied('select * from pipstart_staff_private.receipts');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000008","session_id":"20000000-0000-4000-8000-000000000008","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.review','reviewer assigned review');
select pg_temp.ok(not ((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.publish'),'reviewer cannot publish');
select pg_temp.ok((public.pipstart_staff_access('partner','partner-a')->'capabilities') ? 'content.review','assigned partner review reuses distinct Reviewer role');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000009","session_id":"20000000-0000-4000-8000-000000000009","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.publish','editor assigned publication capability');
select pg_temp.ok(not ((public.pipstart_staff_access('lesson','lesson-a')->'capabilities') ? 'content.review'),'editor alone cannot review');
select pg_temp.ok((public.pipstart_staff_access('partner','partner-a')->'capabilities') ? 'content.publish','assigned partner publication reuses Editor role');
reset role;

-- Action/session/target binding, successful mutation, atomic receipt/audit and retry.
select pipstart_staff_private.issue_receipt('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','grant_role','10000000-0000-4000-8000-000000000010','author','','',sha256(convert_to(repeat('a',64),'UTF8')),clock_timestamp());
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","session_id":"20000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',true);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000009','grant_role','author','','',repeat('a',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','reviewer','','',repeat('a',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000001','grant_role','author','','',repeat('a',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.ok(public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','author','','',repeat('a',64),'30000000-0000-4000-8000-000000000003','staff_onboarding')->>'status'='changed','grant committed with receipt');
select pg_temp.ok(public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','author','','',null,'30000000-0000-4000-8000-000000000003','staff_onboarding')->>'status'='already_recorded','exact retry is read-only');
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','author','','',repeat('a',64),gen_random_uuid(),'staff_onboarding')$q$);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','reviewer','','',null,'30000000-0000-4000-8000-000000000003','staff_onboarding')$q$,'22023');
select pg_temp.ok(jsonb_array_length(public.pipstart_staff_audit_page(null,null,1))=1,'bounded audit page');
select pg_temp.denied('select public.pipstart_staff_audit_page(null,null,101)','22023');
reset role;
select pg_temp.ok((select count(*)=1 from pipstart_staff_private.audit where request_id='30000000-0000-4000-8000-000000000003'),'one mutation audit per request');
select pg_temp.ok(not exists(select 1 from pipstart_staff_private.audit where to_jsonb(audit)::text like '%'||repeat('a',64)||'%'),'audit contains no receipt token');

-- Force audit insert failure: role AND token consumption must roll back.
select pipstart_staff_private.issue_receipt('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','grant_role','10000000-0000-4000-8000-000000000010','reviewer','','',sha256(convert_to(repeat('b',64),'UTF8')),clock_timestamp());
create function pg_temp.fail_audit() returns trigger language plpgsql as $$ begin raise exception using errcode='P0001',message='fixture audit fault'; end; $$;
create trigger mp02_fixture_audit_fault before insert on pipstart_staff_private.audit for each row execute function pg_temp.fail_audit();
set local role authenticated;
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','reviewer','','',repeat('b',64),gen_random_uuid(),'access_change')$q$,'P0001');
reset role;
drop trigger mp02_fixture_audit_fault on pipstart_staff_private.audit;
select pg_temp.ok(not exists(select 1 from pipstart_staff_private.roles where user_id='10000000-0000-4000-8000-000000000010' and role_name='reviewer'),'audit failure rolls back role');
select pg_temp.ok((select consumed_at is null from pipstart_staff_private.receipts where token_hash=sha256(convert_to(repeat('b',64),'UTF8'))),'audit failure rolls back receipt');

-- Expiry and immediate revocation with an otherwise valid existing session.
update pipstart_staff_private.receipts set verified_at=verified_at-interval '6 minutes',expires_at=expires_at-interval '6 minutes' where token_hash=sha256(convert_to(repeat('b',64),'UTF8'));
set local role authenticated;
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000010','grant_role','reviewer','','',repeat('b',64),gen_random_uuid(),'access_change')$q$);
reset role;
update pipstart_staff_private.members set active=false where user_id='10000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","session_id":"20000000-0000-4000-8000-000000000003","aal":"aal2","role":"authenticated"}',true);
select pg_temp.ok(public.pipstart_staff_access()='{"authorized":false}'::jsonb,'revocation affects old session');
reset role;

-- Delegation is explicit, has a ceiling and cannot assign self or owner/admin.
insert into pipstart_staff_private.delegations(user_id,capability) values('10000000-0000-4000-8000-000000000004','roles.delegate');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000004","session_id":"20000000-0000-4000-8000-000000000004","aal":"aal2","role":"authenticated"}',true);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000005','grant_role','owner','','',repeat('c',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('c',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000001','grant_role','author','','',repeat('c',64),gen_random_uuid(),'access_change')$q$);
reset role;

select pipstart_staff_private.issue_receipt('10000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000004','grant_role','10000000-0000-4000-8000-000000000005','editor','','',sha256(convert_to(repeat('c',64),'UTF8')),clock_timestamp());
set local role authenticated;
select pg_temp.ok(public.pipstart_staff_change('10000000-0000-4000-8000-000000000005','grant_role','editor','','',repeat('c',64),'30000000-0000-4000-8000-000000000004','staff_onboarding')->>'status'='changed','explicit delegated non-owner role grant');
reset role;

update pipstart_staff_private.members set active=false where user_id='10000000-0000-4000-8000-000000000002';
select pipstart_staff_private.issue_receipt('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','revoke_role','10000000-0000-4000-8000-000000000001','owner','','',sha256(convert_to(repeat('d',64),'UTF8')),clock_timestamp());
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","session_id":"20000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',true);
select pg_temp.denied($q$select public.pipstart_staff_change('10000000-0000-4000-8000-000000000001','revoke_role','owner','','',repeat('d',64),gen_random_uuid(),'owner_transfer')$q$);
reset role;
select pg_temp.ok((select consumed_at is null from pipstart_staff_private.receipts where token_hash=sha256(convert_to(repeat('d',64),'UTF8'))),'last-owner refusal preserves receipt');

-- Audit cannot be rewritten even through a normally trusted table writer.
select pg_temp.denied('update pipstart_staff_private.audit set value=''rewritten''');
select pg_temp.denied('delete from pipstart_staff_private.audit');
rollback;
