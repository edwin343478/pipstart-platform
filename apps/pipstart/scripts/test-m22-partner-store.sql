-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. MP09a partner store: families, Owner policy, tamper refusals,
-- publication policy checks and byte-exact Deriv parity.
begin;
create function pg_temp.pt_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Partner assertion: %',label; end if; end $$;
create function pg_temp.pt_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Partner %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Partner %: expected refusal %',label,expected;
end $$;
create function pg_temp.pt_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fd000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fd200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.pt_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('fd900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.gen() returns bigint language sql security definer set search_path='' as $$ select generation from pipstart_editorial_private.publication_pointer $$;
create function pg_temp.partner(title text,rel text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title',title,'shortName',title,'kind','forex-broker','brand','neutral'),
    'relationship',rel,'summary','Generated partner for tests.','facts','[]'::jsonb,'fees','[]'::jsonb,'support','[]'::jsonb,
    'review',jsonb_build_object('status','pending','reviewedAt',null,'expiresAt',null,'previousListingDate',null,'sources','[]'::jsonb),
    'availability',jsonb_build_object('status','unknown','allowed','[]'::jsonb,'blocked','[]'::jsonb,'source',null),
    'entities','[]'::jsonb,'payments','[]'::jsonb,'image',null) $$;
create function pg_temp.link(url text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Open account'),'url',url,'active',true,'expiresAt',null) $$;
create function pg_temp.member_owner_check() returns boolean language sql security definer set search_path='' as $$
  select (select count(*) from pipstart_editorial_private.partner_policies)=0 $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants: private helpers unreachable; policy RPCs authenticated only and volatile; tables closed.
select pg_temp.pt_ok(not has_function_privilege(r,f::regprocedure,'EXECUTE'),'private '||f||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_editorial_private.https_host(text)','pipstart_editorial_private.partner_body_ok(text,jsonb)',
    'pipstart_editorial_private.allowed(text,text,text)','pipstart_editorial_private.policy_version(text)',
    'pipstart_editorial_private.partner_revision_policy()','pipstart_editorial_private.partner_generation_guard()',
    'pipstart_editorial_private.body_ok(text,jsonb)','pipstart_editorial_private.require(text,text,text)'])f;
select pg_temp.pt_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'staff grant '||f)
  from unnest(array['public.pipstart_partner_policy_set(text,text,integer,jsonb,text)','public.pipstart_partner_policy(text)',
    'public.pipstart_editorial_create(text,text,text,text,jsonb,text)','public.pipstart_editorial_list(text,integer)'])f;
select pg_temp.pt_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in ('pipstart_partner_policy_set','pipstart_partner_policy') and provolatile<>'v')=0,'policy RPCs volatile');
select pg_temp.pt_ok(not has_table_privilege(r,t,'SELECT'),'table '||t||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_editorial_private.partner_policies','pipstart_editorial_private.generation_partner_policies'])t;
select pg_temp.pt_ok(pg_temp.member_owner_check(),'no policy rows before fixtures');

-- 1 Owner, 2 Affiliate Manager (assigned pt-a), 3 author, 4 editor (assigned pt-a), 5 Affiliate Manager (assigned pt-z only).
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select ('fd000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,5)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fd100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fd000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,5)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fd200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fd000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fd100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,5)n;
insert into pipstart_staff_private.members(user_id) select ('fd000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,5)n;
insert into pipstart_staff_private.roles values
 ('fd000000-0000-4000-8000-000000000001','owner'),('fd000000-0000-4000-8000-000000000002','affiliate_manager'),
 ('fd000000-0000-4000-8000-000000000003','author'),('fd000000-0000-4000-8000-000000000004','editor'),
 ('fd000000-0000-4000-8000-000000000005','affiliate_manager');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values
 ('fd000000-0000-4000-8000-000000000002','partner','partner:pt-a'),('fd000000-0000-4000-8000-000000000002','link','link:pt-a'),
 ('fd000000-0000-4000-8000-000000000004','partner','partner:pt-a'),('fd000000-0000-4000-8000-000000000004','link','link:pt-a'),
 ('fd000000-0000-4000-8000-000000000005','partner','partner:pt-z');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

-- Baseline with one ordinary course: partners are absent until published.
select pg_temp.pt_as(1);
select public.pipstart_editorial_approve_single_person('pt-course',1,(public.pipstart_editorial_create('pt-course','course','forex',null,'{"metadata":{"title":"Course"}}','first'))->>'body_sha256',null);
select pg_temp.pt_ok((public.pipstart_publication_baseline(pg_temp.op(1),'Partner baseline'))->>'generation'='1','baseline');

-- Policy: Owner only, append-only versions, compare-and-set, strict shapes.
select pg_temp.pt_as(2);
select pg_temp.pt_denied($$select public.pipstart_partner_policy_set('link:pt-a','link',0,'{"allowedHosts":["evil.example"]}','widen')$$,'42501','Affiliate Manager cannot set hosts');
select pg_temp.pt_denied($$select public.pipstart_partner_policy_set('partner:pt-a','partner',0,'{"riskNotice":"Softer"}','soften')$$,'42501','Affiliate Manager cannot set risk notice');
select pg_temp.pt_as(4);
select pg_temp.pt_denied($$select public.pipstart_partner_policy_set('link:pt-a','link',0,'{"allowedHosts":["evil.example"]}','widen')$$,'42501','Editor cannot set hosts');
select pg_temp.pt_as(1);
select pg_temp.pt_ok((public.pipstart_partner_policy_set('partner:pt-a','partner',0,'{"riskNotice":"Trading involves risk."}','Initial risk notice'))->>'version'='1','Owner sets risk notice');
select pg_temp.pt_ok((public.pipstart_partner_policy_set('link:pt-a','link',0,'{"allowedHosts":["t.example.link"]}','Initial hosts'))->>'version'='1','Owner sets hosts');
select pg_temp.pt_denied($$select public.pipstart_partner_policy_set('link:pt-a','link',0,'{"allowedHosts":["t.example.link"]}','stale')$$,'PT409','stale policy version');
select pg_temp.pt_denied($$select public.pipstart_partner_policy_set('link:pt-a','partner',1,'{"riskNotice":"x"}','kind')$$,'22023','policy kind cannot change');
select pg_temp.pt_denied(format('select public.pipstart_partner_policy_set(%L,''link'',0,%L,''bad'')','link:pt-x',v),'22023','bad hosts '||v)
  from unnest(array['{"allowedHosts":[]}','{"allowedHosts":["T.Example.link"]}','{"allowedHosts":["a.example","a.example"]}',
    '{"allowedHosts":["user@a.example"]}','{"allowedHosts":["a.example:8443"]}','{"allowedHosts":["localhost"]}',
    '{"allowedHosts":["a.example"],"extra":1}','{"riskNotice":"x"}'])v;
select pg_temp.pt_denied($$select public.pipstart_partner_policy_set('partner:pt-x','partner',0,'{"riskNotice":" padded "}','bad')$$,'22023','padded notice');
reset role;
select pg_temp.pt_denied($$update pipstart_editorial_private.partner_policies set allowed_hosts=array['evil.example']$$,'42501','policy rows immutable');
select pg_temp.pt_denied($$delete from pipstart_editorial_private.partner_policies$$,'42501','policy rows undeletable');
set local role authenticated;

-- Affiliate Manager writes only assigned partners and links, inside the approved hosts.
select pg_temp.pt_as(2);
select pg_temp.pt_ok((public.pipstart_editorial_create('partner:pt-a','partner',null,null,pg_temp.partner('Partner A','affiliate'),'first'))->>'state'='draft','AM creates assigned partner');
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''partner:pt-z'',''partner'',null,null,%L,''x'')',pg_temp.partner('Z','none')),'42501','AM unassigned partner');
select pg_temp.pt_as(1);
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''partner:pt-b'',''partner'',null,null,%L,''x'')',pg_temp.partner('B','none')||'{"riskNotice":"none"}'),'22023','partner body cannot carry a risk notice');
select pg_temp.pt_as(2);
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''partner:pt-a2'',''partner'',''forex'',null,%L,''x'')',pg_temp.partner('B','none')),'22023','partner has no learning path');
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''link:pt-a'',''link'',null,''pt-course'',%L,''x'')',pg_temp.link('https://t.example.link/a')),'42501','link under a course not permitted');
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''link:pt-a'',''link'',null,''partner:pt-a'',%L,''x'')',pg_temp.link(u)),'22023','unsafe link '||u)
  from unnest(array['https://evil.example/a','http://t.example.link/a','https://user@t.example.link/a','https://t.example.link:8443/a',
    'https://T.EXAMPLE.LINK/a','https://t.example.link/a b','javascript:alert(1)'])u;
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''link:pt-a'',''link'',null,''partner:pt-a'',%L,''x'')',pg_temp.link('https://t.example.link/a')||'{"allowedHosts":["evil.example"]}'),'22023','link body cannot carry hosts');
select pg_temp.pt_ok((public.pipstart_editorial_create('link:pt-a','link',null,'partner:pt-a',pg_temp.link('https://t.example.link/?t=A1&custom2=x-1'),'first'))->>'state'='draft','AM creates link inside hosts');
select pg_temp.pt_denied(format('select public.pipstart_editorial_save(''link:pt-a'',1,%L,''widen'')',pg_temp.link('https://evil.example/?t=A1')),'22023','AM cannot save a link outside hosts');
select pg_temp.pt_ok((public.pipstart_editorial_list('',100))@>'[{"id":"partner:pt-a"},{"id":"link:pt-a"}]'::jsonb and not ((public.pipstart_editorial_list('',100))@>'[{"id":"pt-course"}]'::jsonb),'AM lists only assigned partner content');
select pg_temp.pt_ok((public.pipstart_partner_policy('link:pt-a'))->'allowed_hosts'='["t.example.link"]'::jsonb,'AM reads assigned link hosts');
select pg_temp.pt_ok(not ((public.pipstart_partner_policy('link:pt-a'))::text ~* 'token|secret|hook|key'),'policy read carries no secrets');
select pg_temp.pt_as(5);
select pg_temp.pt_denied($$select public.pipstart_partner_policy('link:pt-a')$$,'42501','unassigned AM cannot read policy');
select pg_temp.pt_denied(format('select public.pipstart_editorial_save(''partner:pt-a'',1,%L,''x'')',pg_temp.partner('Hijack','none')),'42501','unassigned AM cannot save');
select pg_temp.pt_as(3);
select pg_temp.pt_denied(format('select public.pipstart_editorial_create(''partner:pt-a3'',''partner'',null,null,%L,''x'')',pg_temp.partner('C','none')),'42501','author cannot create partners');
select pg_temp.pt_denied($$select public.pipstart_partner_policy('partner:pt-a')$$,'42501','author cannot read partner policy');

-- Approval is the Owner's (single-person policy); publication is Editor or Owner, never the AM.
select pg_temp.pt_as(2);
select pg_temp.pt_denied(format('select public.pipstart_editorial_approve_single_person(''link:pt-a'',1,%L,null)',pg_temp.pt_sha('link:pt-a')),'42501','AM cannot approve');
select pg_temp.pt_as(1);
select public.pipstart_editorial_approve_single_person(x,1,pg_temp.pt_sha(x),null) from unnest(array['partner:pt-a','link:pt-a'])x;
select pg_temp.pt_as(2);
select pg_temp.pt_denied(format('select public.pipstart_publication_publish(%L,1,''partner:pt-a'',1,%L,''x'')',pg_temp.op(2),pg_temp.pt_sha('partner:pt-a')),'42501','AM cannot publish');
select pg_temp.pt_as(4);
select pg_temp.pt_denied(format('select public.pipstart_publication_publish(%L,1,''link:pt-a'',1,%L,''x'')',pg_temp.op(3),pg_temp.pt_sha('link:pt-a')),'55000','link needs its partner live');
select pg_temp.pt_ok((public.pipstart_publication_publish(pg_temp.op(4),1,'partner:pt-a',1,pg_temp.pt_sha('partner:pt-a'),'Partner live'))->>'generation'='2','editor publishes partner');
select pg_temp.pt_ok((public.pipstart_publication_publish(pg_temp.op(5),2,'link:pt-a',1,pg_temp.pt_sha('link:pt-a'),'Link live'))->>'generation'='3','editor publishes link');
reset role;
select pg_temp.pt_ok((select count(*) from pipstart_editorial_private.generation_partner_policies where generation=3)=2
  and (select policy_version from pipstart_editorial_private.generation_partner_policies where generation=3 and item_id='link:pt-a')=1,'generation freezes policy versions');
set local role authenticated;

-- A partner without the Owner's risk notice cannot go live.
select pg_temp.pt_as(1);
select public.pipstart_editorial_approve_single_person('partner:pt-c',1,(public.pipstart_editorial_create('partner:pt-c','partner',null,null,pg_temp.partner('C','none'),'first'))->>'body_sha256',null);
select pg_temp.pt_denied(format('select public.pipstart_publication_publish(%L,3,''partner:pt-c'',1,%L,''x'')',pg_temp.op(6),pg_temp.pt_sha('partner:pt-c')),'55000','partner needs risk notice');

-- Narrowed hosts block every publication while the old destination is live; the AM revokes the
-- link, then publication resumes. A partner with a live link cannot be withdrawn first.
select pg_temp.pt_ok((public.pipstart_partner_policy_set('link:pt-a','link',1,'{"allowedHosts":["other.example"]}','Narrow hosts'))->>'version'='2','Owner narrows hosts');
select public.pipstart_partner_policy_set('partner:pt-c','partner',0,'{"riskNotice":"Risk."}','notice');
select pg_temp.pt_denied(format('select public.pipstart_publication_publish(%L,3,''partner:pt-c'',1,%L,''x'')',pg_temp.op(7),pg_temp.pt_sha('partner:pt-c')),'55000','stale live destination blocks publication');
select pg_temp.pt_as(2);
select pg_temp.pt_denied(format('select public.pipstart_publication_withdraw(%L,3,''partner:pt-a'',''x'')',pg_temp.op(9)),'42501','AM cannot withdraw a partner');
select pg_temp.pt_ok((public.pipstart_publication_withdraw(pg_temp.op(10),3,'link:pt-a','Revoke link'))->>'generation'='4','AM revokes assigned link');
select pg_temp.pt_as(1);
select pg_temp.pt_denied(format('select public.pipstart_publication_restore(%L,4,3,''x'')',pg_temp.op(8)),'55000','restore rechecks current policy');
select pg_temp.pt_ok((public.pipstart_publication_publish(pg_temp.op(11),4,'partner:pt-c',1,pg_temp.pt_sha('partner:pt-c'),'Partner C live'))->>'generation'='5','publication resumes after revoke');
select pg_temp.pt_ok((public.pipstart_publication_status('link:pt-a'))->'published'='null'::jsonb,'revoked link is not live');

-- Byte-exact Deriv parity with today's deployment register (attribution parameters unchanged).
select public.pipstart_partner_policy_set('partner:deriv','partner',0,jsonb_build_object('riskNotice','Trading CFDs, options and crypto involves risk, and you can lose your trading funds. Leverage can magnify losses. Check the entity serving your country, product eligibility, fees and withdrawal terms before opening or funding an account.'),'Import Deriv risk notice');
select public.pipstart_partner_policy_set('link:deriv','link',0,'{"allowedHosts":["t.deriv.link"]}','Import Deriv hosts');
select public.pipstart_editorial_approve_single_person('partner:deriv',1,(public.pipstart_editorial_create('partner:deriv','partner',null,null,$json${
  "metadata":{"title":"Deriv.com","shortName":"Deriv","kind":"forex-broker","brand":"deriv"},"relationship":"affiliate",
  "summary":"Deriv is one of PipStart's recommended brokers. If you would like an account to follow along with our lessons, you are welcome to explore Deriv. Graduates are welcome too. A demo account lets you practise without using real money; opening or funding a live account is optional.",
  "facts":[{"label":"Product","value":"Forex CFDs, Synthetic Indices, Binary Options and Crypto Exchange","verification":"verified","source":{"url":"https://deriv.com/","checkedAt":"2026-10-09"}},
    {"label":"Platform","value":"MT5, cTrader, TradingView and Deriv Trader","verification":"verified","source":{"url":"https://deriv.com/","checkedAt":"2026-10-09"}},
    {"label":"Demo account","value":"Available","verification":"verified","source":{"url":"https://deriv.com/trading-platforms/deriv-mt5","checkedAt":"2026-10-09"}},
    {"label":"Availability","value":"Available","verification":"verified","source":{"url":"https://deriv.com/terms-and-conditions/general-terms-of-use","checkedAt":"2026-10-09"}}],
  "review":{"status":"verified","reviewedAt":"2026-10-09","expiresAt":"2027-01-07","previousListingDate":null,"sources":[
    {"url":"https://deriv.com/","checkedAt":"2026-10-09"},{"url":"https://deriv.com/terms-and-conditions/general-terms-of-use","checkedAt":"2026-10-09"},
    {"url":"https://deriv.com/trading-platforms/deriv-mt5","checkedAt":"2026-10-09"},{"url":"https://deriv.com/trading-platforms/deriv-exchange","checkedAt":"2026-10-09"},
    {"url":"https://deriv.com/trade/options/digital-options","checkedAt":"2026-10-09"},{"url":"https://deriv.com/help-centre/tradingview","checkedAt":"2026-10-09"}]},
  "availability":{"status":"unknown","allowed":[],"blocked":[],"source":null},"entities":[],"fees":[],"payments":[],"support":[],
  "image":{"src":"/brokers/deriv-forex-leverage.jpg","alt":"Deriv promotional artwork: Forex moves in pips. Leverage makes them count. This is provider advertising, not PipStart advice.","width":928,"height":1152}}$json$::jsonb,'Import Deriv'))->>'body_sha256',null);
select public.pipstart_editorial_approve_single_person('link:deriv',1,(public.pipstart_editorial_create('link:deriv','link',null,'partner:deriv',
  pg_temp.link('https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32'),'Import Deriv link'))->>'body_sha256',null);
select pg_temp.pt_ok((public.pipstart_publication_publish(pg_temp.op(12),5,'partner:deriv',1,pg_temp.pt_sha('partner:deriv'),'Deriv live'))->>'generation'='6','Deriv partner live');
select pg_temp.pt_ok((public.pipstart_publication_publish(pg_temp.op(13),6,'link:deriv',1,pg_temp.pt_sha('link:deriv'),'Deriv link live'))->>'generation'='7','Deriv link live');
select pg_temp.pt_ok((public.pipstart_editorial_item('link:deriv'))->'revision'->'body'->>'url'='https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32','Deriv attribution URL byte-exact');

-- The build read is unaffected: the sealed snapshot still verifies after later policy versions.
select public.pipstart_partner_policy_set('partner:deriv','partner',1,'{"riskNotice":"Updated risk notice."}','Later notice');
set local role service_role;
select pg_temp.pt_ok((public.pipstart_publication_snapshot())->>'generation'='7','sealed snapshot still verifies');
set local role authenticated;
reset role;
select pg_temp.pt_ok((select count(*) from pipstart_editorial_private.audit where operation='policy' and actor_id='fd000000-0000-4000-8000-000000000001')=7,'every policy version audited');
select pg_temp.pt_ok(not exists(select 1 from pipstart_editorial_private.audit where actor_id in ('fd000000-0000-4000-8000-000000000002','fd000000-0000-4000-8000-000000000005') and operation='policy'),'no refused policy change audited');
rollback;
