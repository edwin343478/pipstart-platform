-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. MP09d2 partner import: operator-only grants, the single-Owner
-- rule, identities, policy and item outcomes, the approved-hosts trigger, one link per partner,
-- staff work never overwritten, publication of imported content and the sealed snapshot.
begin;
create function pg_temp.pi_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Partner import assertion: %',label; end if; end $$;
create function pg_temp.pi_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Partner import %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Partner import %: expected refusal %',label,expected;
end $$;
create function pg_temp.pi_sha(b jsonb) returns text language sql immutable as $$ select encode(sha256(convert_to(b::text,'UTF8')),'hex') $$;
create function pg_temp.pi_item(p_id text,p_family text,p_parent text,p_body jsonb,p_ref text) returns text language sql as $$
  select pipstart_editorial_private.import_partner_item(p_id,p_family,p_parent,p_body,p_ref,pg_temp.pi_sha(p_body)) $$;
create function pg_temp.pi_partner(summary text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Partner Alpha','shortName','Alpha','kind','forex-broker','brand','neutral'),
    'relationship','affiliate','summary',summary,'facts','[]'::jsonb,'fees','[]'::jsonb,'support','[]'::jsonb,
    'review',jsonb_build_object('status','pending','reviewedAt',null,'expiresAt',null,'previousListingDate',null,'sources','[]'::jsonb),
    'availability',jsonb_build_object('status','unknown','allowed','[]'::jsonb,'blocked','[]'::jsonb,'source',null),
    'entities','[]'::jsonb,'payments','[]'::jsonb,'image',jsonb_build_object('src','/brokers/alpha.jpg','alt','Generated artwork','width',928,'height',1152)) $$;
create function pg_temp.pi_link(url text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Visit Alpha'),'url',url,'active',true,'expiresAt',null) $$;
create function pg_temp.pi_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('f7000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('f7200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.pi_op(n integer) returns uuid language sql immutable as $$ select ('f7900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.pi_rev_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;
-- Fixed text, so later steps can repeat it exactly.
create function pg_temp.pi_url() returns text language sql immutable as $$ select 'https://t.example.link/?t=A1&custom2=f7-generated'::text $$;

-- Grants: no API role reaches any import function.
select pg_temp.pi_ok(not has_function_privilege(r,f::regprocedure,'EXECUTE'),'no '||f||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_editorial_private.import_owner()','pipstart_editorial_private.partner_identity_ok(text,text)',
    'pipstart_editorial_private.import_partner_policy(text,text,jsonb,text)',
    'pipstart_editorial_private.import_partner_item(text,text,text,jsonb,text,text)'])f;

-- Earlier runner stages leave staff fixtures behind; start from no active member (rolled back).
update pipstart_staff_private.members set active=false where active;
select pg_temp.pi_denied($q$select pipstart_editorial_private.import_partner_policy('partner:im-alpha','partner','{"riskNotice":"Trading involves risk."}','provider-registry:im-alpha/risk-notice')$q$,'55000','policy import without an Owner');
select pg_temp.pi_denied($q$select pg_temp.pi_item('partner:im-alpha','partner',null,pg_temp.pi_partner('One'),'provider-registry:im-alpha')$q$,'55000','item import without an Owner');

-- 1 Owner, 2 second Owner (added at the end).
insert into auth.users(id,raw_user_meta_data) select ('f7000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,2)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) values('f7100000-0000-4000-8000-000000000001','f7000000-0000-4000-8000-000000000001','totp','verified');
insert into auth.sessions(id,user_id,factor_id,aal) values('f7200000-0000-4000-8000-000000000001','f7000000-0000-4000-8000-000000000001','f7100000-0000-4000-8000-000000000001','aal2');
insert into pipstart_staff_private.members(user_id) values('f7000000-0000-4000-8000-000000000001');
insert into pipstart_staff_private.roles values('f7000000-0000-4000-8000-000000000001','owner');
-- Baseline before any import: partners then go live only through an explicit publication.
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;
select pg_temp.pi_as(1);
select public.pipstart_editorial_approve_single_person('pi-course',1,(public.pipstart_editorial_create('pi-course','course','forex',null,'{"metadata":{"title":"Course"}}','first'))->>'body_sha256',null);
select pg_temp.pi_ok((public.pipstart_publication_baseline(pg_temp.pi_op(1),'Import baseline'))->>'generation'='1','baseline');
reset role;

-- Identity, source and shape refusals.
select pg_temp.pi_denied(format('select pipstart_editorial_private.import_partner_policy(%L,%L,%L,%L)',x.id,x.kind,x.v,x.ref),'22023','policy refusal '||x.label)
  from (values ('im-alpha','partner','{"riskNotice":"Risk."}','provider-registry:im-alpha/risk-notice','bare identity'),
    ('partner:Im-Alpha','partner','{"riskNotice":"Risk."}','provider-registry:im-alpha/risk-notice','uppercase identity'),
    ('partner:im-alpha','link','{"allowedHosts":["t.example.link"]}','provider-link-registry:im-alpha','kind differs from identity'),
    ('partner:im-alpha','partner','{"riskNotice":" Risk. "}','provider-registry:im-alpha/risk-notice','padded notice'),
    ('partner:im-alpha','partner','{"riskNotice":"Risk.","allowedHosts":["a.example"]}','provider-registry:im-alpha/risk-notice','extra key'),
    ('partner:im-alpha','partner','{"riskNotice":"Risk."}','Provider Registry','bad source'),
    ('link:im-alpha','link','{"allowedHosts":["T.Example.link"]}','provider-link-registry:im-alpha/allowed-hosts','uppercase host'),
    ('link:im-alpha','link','{"allowedHosts":["a.example","a.example"]}','provider-link-registry:im-alpha/allowed-hosts','duplicate host'),
    ('link:im-alpha','link','{"allowedHosts":["a.example:8443"]}','provider-link-registry:im-alpha/allowed-hosts','host with port'),
    ('link:im-alpha','link','{"allowedHosts":["a.b","c.d","e.f","g.h","i.j","k.l"]}','provider-link-registry:im-alpha/allowed-hosts','six hosts'))
  x(id,kind,v,ref,label);
select pg_temp.pi_denied(format('select pg_temp.pi_item(%L,%L,%L,%L::jsonb,%L)',x.id,x.fam,x.parent,x.body,'provider-registry:im-alpha'),'22023','item refusal '||x.label)
  from (values ('im-alpha','partner',null,pg_temp.pi_partner('One')::text,'bare identity'),
    ('partner:im-alpha','course',null,'{"metadata":{"title":"C"}}','curriculum family'),
    ('partner:im-alpha','partner','partner:im-other',pg_temp.pi_partner('One')::text,'partner with a parent'),
    ('link:im-alpha','link',null,pg_temp.pi_link('https://t.example.link/')::text,'link without a partner'),
    ('partner:im-alpha','partner',null,(pg_temp.pi_partner('One')||'{"riskNotice":"x"}')::text,'risk notice in a body'),
    ('link:im-alpha','link','partner:im-alpha',(pg_temp.pi_link('https://t.example.link/')||'{"allowedHosts":["x.example"]}')::text,'hosts in a body'))
  x(id,fam,parent,body,label);
select pg_temp.pi_denied($q$select pipstart_editorial_private.import_partner_item('partner:im-alpha','partner',null,pg_temp.pi_partner('One'),'provider-registry:im-alpha',repeat('0',64))$q$,'22023','body hash differs from the manifest');
select pg_temp.pi_ok(not exists(select 1 from pipstart_editorial_private.items where family in ('partner','link')) and not exists(select 1 from pipstart_editorial_private.partner_policies),'refusals wrote nothing');

-- Policy, partner, then the link: a link before its approved hosts is refused by the MP09a trigger.
select pg_temp.pi_ok(pipstart_editorial_private.import_partner_policy('partner:im-alpha','partner','{"riskNotice":"Trading involves risk."}','provider-registry:im-alpha/risk-notice')='created','risk notice imported');
select pg_temp.pi_ok(pg_temp.pi_item('partner:im-alpha','partner',null,pg_temp.pi_partner('One'),'provider-registry:im-alpha')='created','partner imported');
select pg_temp.pi_denied($q$select pg_temp.pi_item('link:im-alpha','link','partner:im-alpha',pg_temp.pi_link(pg_temp.pi_url()),'provider-link-registry:im-alpha')$q$,'22023','link before its approved hosts');
select pg_temp.pi_ok(not exists(select 1 from pipstart_editorial_private.items where id='link:im-alpha'),'refused link left no item');
select pg_temp.pi_ok(pipstart_editorial_private.import_partner_policy('link:im-alpha','link','{"allowedHosts":["t.example.link"]}','provider-link-registry:im-alpha/allowed-hosts')='created','approved hosts imported');
select pg_temp.pi_denied($q$select pg_temp.pi_item('link:im-alpha','link','partner:im-alpha',pg_temp.pi_link('https://evil.example/?t=A1'),'provider-link-registry:im-alpha')$q$,'22023','link outside its approved hosts');
select pg_temp.pi_denied($q$select pg_temp.pi_item('link:im-alpha','link','link:im-alpha',pg_temp.pi_link(pg_temp.pi_url()),'provider-link-registry:im-alpha')$q$,'22023','link under a missing parent');
select pg_temp.pi_ok(pg_temp.pi_item('link:im-alpha','link','partner:im-alpha',pg_temp.pi_link(pg_temp.pi_url()),'provider-link-registry:im-alpha')='created','link imported');
select pg_temp.pi_ok(pipstart_editorial_private.import_partner_policy('link:im-beta','link','{"allowedHosts":["t.example.link"]}','provider-link-registry:im-beta/allowed-hosts')='created','second link hosts');
select pg_temp.pi_denied($q$select pg_temp.pi_item('link:im-beta','link','partner:im-alpha',pg_temp.pi_link(pg_temp.pi_url()),'provider-link-registry:im-beta')$q$,'22023','a second link for one partner');

-- Recorded exactly like the MP05 import: approved, Owner-attributed, decided, provenance, audit.
select pg_temp.pi_ok((select bool_and(r.state='approved' and r.author_id='f7000000-0000-4000-8000-000000000001' and r.body_sha256=pg_temp.pi_sha(r.body))
  from pipstart_editorial_private.revisions r where r.item_id in ('partner:im-alpha','link:im-alpha')),'imported revisions approved, attributed and hashed');
select pg_temp.pi_ok((select count(*) from pipstart_editorial_private.decisions where kind='imported' and item_id in ('partner:im-alpha','link:im-alpha'))=2
  and (select count(*) from pipstart_editorial_private.imports where item_id in ('partner:im-alpha','link:im-alpha'))=2,'one decision and one provenance row per item');
select pg_temp.pi_ok((select body->>'url' from pipstart_editorial_private.revisions where item_id='link:im-alpha' and revision_no=1)=pg_temp.pi_url(),'attribution URL byte-exact');
select pg_temp.pi_ok((select string_agg(item_id||':'||version||':'||reason,'|' order by item_id) from pipstart_editorial_private.partner_policies)
  ='link:im-alpha:1:Imported from provider-link-registry:im-alpha/allowed-hosts|link:im-beta:1:Imported from provider-link-registry:im-beta/allowed-hosts|partner:im-alpha:1:Imported from provider-registry:im-alpha/risk-notice','policy versions and reasons');

-- Repeats are no-ops.
select pg_temp.pi_ok(pipstart_editorial_private.import_partner_policy('partner:im-alpha','partner','{"riskNotice":"Trading involves risk."}','provider-registry:im-alpha/risk-notice')='unchanged','policy repeat');
select pg_temp.pi_ok(pg_temp.pi_item('partner:im-alpha','partner',null,pg_temp.pi_partner('One'),'provider-registry:im-alpha')='unchanged','partner repeat');
select pg_temp.pi_ok(pg_temp.pi_item('link:im-alpha','link','partner:im-alpha',pg_temp.pi_link(pg_temp.pi_url()),'provider-link-registry:im-alpha')='unchanged','link repeat');
select pg_temp.pi_ok((select count(*) from pipstart_editorial_private.revisions where item_id in ('partner:im-alpha','link:im-alpha'))=2
  and (select count(*) from pipstart_editorial_private.partner_policies)=3,'repeats wrote nothing');

-- Drift: code changed and nobody edited it in the store.
select pg_temp.pi_ok(pg_temp.pi_item('partner:im-alpha','partner',null,pg_temp.pi_partner('Two'),'provider-registry:im-alpha')='updated','partner drift');
select pg_temp.pi_ok((select latest_revision=2 from pipstart_editorial_private.items where id='partner:im-alpha')
  and (select state from pipstart_editorial_private.revisions where item_id='partner:im-alpha' and revision_no=1)='superseded','drift supersedes the earlier import');

-- Imported content is publishable by the Owner and sealed with its frozen policy.
set local role authenticated;
select pg_temp.pi_as(1);
select pg_temp.pi_ok((public.pipstart_publication_publish(pg_temp.pi_op(2),1,'partner:im-alpha',2,pg_temp.pi_rev_sha('partner:im-alpha'),'Alpha live'))->>'generation'='2','imported partner live');
select pg_temp.pi_ok((public.pipstart_publication_publish(pg_temp.pi_op(3),2,'link:im-alpha',1,pg_temp.pi_rev_sha('link:im-alpha'),'Alpha link live'))->>'generation'='3','imported link live');
set local role service_role;
select pg_temp.pi_ok((select (s->>'generation')='3' and s->'snapshot'->'partners'->0->>'riskNotice'='Trading involves risk.'
  and s->'snapshot'->'partners'->0->'links'->0->'body'->>'url'=pg_temp.pi_url()
  and s->'snapshot'->'partners'->0->'links'->0->'allowedHosts'='["t.example.link"]'::jsonb
  from (select public.pipstart_publication_snapshot() s) x),'sealed snapshot carries the imported partner, policy and URL');
set local role authenticated;

-- Staff work is never overwritten: an Owner policy change or a store edit makes the next import a conflict.
select public.pipstart_partner_policy_set('partner:im-alpha','partner',1,'{"riskNotice":"Owner revised notice."}','Owner revision');
select public.pipstart_editorial_save('link:im-alpha',1,pg_temp.pi_link(pg_temp.pi_url()||'&x=1'),'staff edit');
reset role;
select pg_temp.pi_ok(pipstart_editorial_private.import_partner_policy('partner:im-alpha','partner','{"riskNotice":"Trading involves risk."}','provider-registry:im-alpha/risk-notice')='conflict','Owner policy not overwritten');
select pg_temp.pi_ok(pg_temp.pi_item('link:im-alpha','link','partner:im-alpha',pg_temp.pi_link(pg_temp.pi_url()),'provider-link-registry:im-alpha')='conflict','staff link edit not overwritten');
select pg_temp.pi_ok(pipstart_editorial_private.import_partner_policy('partner:im-alpha','partner','{"riskNotice":"Owner revised notice."}','provider-registry:im-alpha/risk-notice')='unchanged','matching Owner policy is unchanged');
select pg_temp.pi_ok((select risk_notice from pipstart_editorial_private.partner_policies where item_id='partner:im-alpha' and version=2)='Owner revised notice.'
  and (select latest_revision from pipstart_editorial_private.items where id='link:im-alpha')=2,'staff work survives');

-- Exactly one active Owner.
insert into pipstart_staff_private.members(user_id) values('f7000000-0000-4000-8000-000000000002');
insert into pipstart_staff_private.roles values('f7000000-0000-4000-8000-000000000002','owner');
select pg_temp.pi_denied($q$select pg_temp.pi_item('partner:im-alpha','partner',null,pg_temp.pi_partner('Two'),'provider-registry:im-alpha')$q$,'55000','two active Owners');

-- Audit: three imported policies plus the Owner revision; three item imports (two created, one drift).
select pg_temp.pi_ok((select count(*) from pipstart_editorial_private.audit where operation='policy' and actor_id='f7000000-0000-4000-8000-000000000001')=4
  and (select count(*) from pipstart_editorial_private.audit where operation='import' and item_id in ('partner:im-alpha','link:im-alpha'))=3
  and (select count(*) from pipstart_editorial_private.imports)=(select count(*) from pipstart_editorial_private.decisions where kind='imported'),'imports and policies audited exactly');
rollback;
