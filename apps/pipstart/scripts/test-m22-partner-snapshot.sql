-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. MP09b: the sealed snapshot's partners section.
begin;
create function pg_temp.ps_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Partner snapshot assertion: %',label; end if; end $$;
create function pg_temp.ps_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fc200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.ps_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('fc900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.snap() returns jsonb language plpgsql security definer set search_path='' as $$
begin return public.pipstart_publication_snapshot(); end $$;
create function pg_temp.partner(title text,rel text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title',title,'shortName',title,'kind','forex-broker','brand','neutral'),
    'relationship',rel,'summary','Generated partner for tests.','facts','[]'::jsonb,'fees','[]'::jsonb,'support','[]'::jsonb,
    'review',jsonb_build_object('status','pending','reviewedAt',null,'expiresAt',null,'previousListingDate',null,'sources','[]'::jsonb),
    'availability',jsonb_build_object('status','unknown','allowed','[]'::jsonb,'blocked','[]'::jsonb,'source',null),
    'entities','[]'::jsonb,'payments','[]'::jsonb,'image',null) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

select pg_temp.ps_ok(not has_function_privilege(r,'pipstart_editorial_private.partner_snapshot(bigint)','EXECUTE'),'private partner_snapshot for '||r)
  from unnest(array['anon','authenticated','service_role'])r;

update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select ('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,2)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fc100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,2)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fc200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fc100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,2)n;
insert into pipstart_staff_private.members(user_id) select ('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,2)n;
insert into pipstart_staff_private.roles values('fc000000-0000-4000-8000-000000000001','owner'),('fc000000-0000-4000-8000-000000000002','affiliate_manager');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values
 ('fc000000-0000-4000-8000-000000000002','partner','partner:deriv'),('fc000000-0000-4000-8000-000000000002','link','link:deriv');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;
select pg_temp.ps_as(1);

-- A generation without partner content has no partners key at all.
select public.pipstart_editorial_approve_single_person('ps-course',1,(public.pipstart_editorial_create('ps-course','course','forex',null,'{"metadata":{"title":"Course"}}','first'))->>'body_sha256',null);
select public.pipstart_publication_baseline(pg_temp.op(1),'Snapshot baseline');
select pg_temp.ps_ok(not ((pg_temp.snap())->'snapshot' ? 'partners'),'no partners key without partner content');

-- Deriv and a link-less partner published; their frozen policy travels in the sealed snapshot.
select public.pipstart_partner_policy_set('partner:deriv','partner',0,'{"riskNotice":"Deriv risk notice v1."}','notice');
select public.pipstart_partner_policy_set('link:deriv','link',0,'{"allowedHosts":["t.deriv.link"]}','hosts');
select public.pipstart_partner_policy_set('partner:plain','partner',0,'{"riskNotice":"Plain risk."}','notice');
select public.pipstart_editorial_approve_single_person(x.id,1,(public.pipstart_editorial_create(x.id,x.family,null,x.parent,x.body,'first'))->>'body_sha256',null)
  from (values (1,'partner:deriv','partner',null::text,pg_temp.partner('Deriv.com','affiliate')),
    (2,'link:deriv','link','partner:deriv',jsonb_build_object('metadata',jsonb_build_object('title','Open account'),
      'url','https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32','active',true,'expiresAt',null)),
    (3,'partner:plain','partner',null,pg_temp.partner('Plain','none'))) x(n,id,family,parent,body) order by x.n;
select public.pipstart_publication_publish(pg_temp.op(2),1,'partner:deriv',1,pg_temp.ps_sha('partner:deriv'),'Deriv live');
select public.pipstart_publication_publish(pg_temp.op(3),2,'link:deriv',1,pg_temp.ps_sha('link:deriv'),'Link live');
select public.pipstart_publication_publish(pg_temp.op(4),3,'partner:plain',1,pg_temp.ps_sha('partner:plain'),'Plain live');
select pg_temp.ps_ok((pg_temp.snap())->>'generation'='4','sealed generation 4 verifies');
select pg_temp.ps_ok(jsonb_array_length((pg_temp.snap())->'snapshot'->'partners')=2,'two partners');
select pg_temp.ps_ok((select bool_and(p->>'id'<p2->>'id') from (select (pg_temp.snap())->'snapshot'->'partners'->0 p,(pg_temp.snap())->'snapshot'->'partners'->1 p2) x),'partners ordered by id');
select pg_temp.ps_ok(p->>'riskNotice'='Deriv risk notice v1.' and (p->>'policyVersion')::int=1 and p->'body'->'metadata'->>'title'='Deriv.com'
   and p->>'bodySha256'=encode(sha256(convert_to((p->'body')::text,'UTF8')),'hex')
   and jsonb_array_length(p->'links')=1 and p->'links'->0->>'id'='link:deriv'
   and p->'links'->0->'body'->>'url'='https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32'
   and p->'links'->0->'allowedHosts'='["t.deriv.link"]'::jsonb and (p->'links'->0->>'policyVersion')::int=1,'Deriv section exact')
  from (select (pg_temp.snap())->'snapshot'->'partners'->0 p) x;
select pg_temp.ps_ok(p->'links'='[]'::jsonb and p->>'riskNotice'='Plain risk.','link-less partner')
  from (select (pg_temp.snap())->'snapshot'->'partners'->1 p) x;
select pg_temp.ps_ok(not ((pg_temp.snap())::text ~* 'secret|token|hook|password'),'snapshot carries no secret fields');

-- Later policy versions do not change a sealed generation; the next generation carries them.
select public.pipstart_partner_policy_set('partner:deriv','partner',1,'{"riskNotice":"Deriv risk notice v2."}','newer notice');
select pg_temp.ps_ok((pg_temp.snap())->'snapshot'->'partners'->0->>'riskNotice'='Deriv risk notice v1.','sealed generation keeps frozen policy');
-- The Affiliate Manager revokes the link: the partner stays listed with no link, under the new notice.
select pg_temp.ps_as(2);
select public.pipstart_publication_withdraw(pg_temp.op(5),4,'link:deriv','Revoke link');
select pg_temp.ps_as(1);
select pg_temp.ps_ok((pg_temp.snap())->>'generation'='5' and (pg_temp.snap())->'snapshot'->'partners'->0->'links'='[]'::jsonb
  and (pg_temp.snap())->'snapshot'->'partners'->0->>'riskNotice'='Deriv risk notice v2.','revoked link leaves the snapshot');
rollback;
