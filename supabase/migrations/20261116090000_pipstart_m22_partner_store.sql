-- M22 MP09a partner store: partners and their affiliate links become editorial families, so they reuse
-- revisions, exact review, the Owner single-person policy, sealed generations and restore. The
-- Owner alone sets protected policy (each partner's risk notice; each link's approved hosts) as
-- append-only versions; a link revision outside its approved hosts is refused, and every publication
-- rechecks the current policy and freezes the versions it relied on. Affiliate Managers act through
-- the partner capabilities. No public read changes here: the build adapter is MP09b.
-- Optimistic conflicts raise PT409, never 40001 (PostgREST retries serialization failures).
begin;
do $$ begin
 if to_regprocedure('public.pipstart_publication_verify_observed(bigint,text,text,integer)') is null
  or to_regprocedure('pipstart_editorial_private.require(text,text,text)') is null
  or to_regclass('pipstart_editorial_private.partner_policies') is not null then
  raise exception 'Accepted MP08 publication store required; partner store must not already exist'; end if;
end $$;

-- Families, paths and parents: a partner stands alone; a link belongs to exactly one partner.
do $$ declare c record; begin
 for c in select conname,pg_get_constraintdef(oid) d from pg_constraint
   where conrelid='pipstart_editorial_private.items'::regclass and contype='c' loop
  if c.d like '%family = ANY%course%analysis%' and c.d like '%module%' and c.d not like '%parent_id%' and c.d not like '%learning_path%' then
    execute format('alter table pipstart_editorial_private.items drop constraint %I',c.conname);
  elsif c.d like '%parent_id IS NULL%' or c.d like '%learning_path IS NULL%' then
    execute format('alter table pipstart_editorial_private.items drop constraint %I',c.conname);
  end if;
 end loop;
 if (select count(*) from pg_constraint where conrelid='pipstart_editorial_private.items'::regclass and contype='c'
     and (pg_get_constraintdef(oid) like '%parent_id IS NULL%' or pg_get_constraintdef(oid) like '%learning_path IS NULL%' or pg_get_constraintdef(oid) like '%family = ANY%')) <> 0 then
  raise exception 'Unexpected editorial item constraints'; end if;
end $$;
alter table pipstart_editorial_private.items add constraint items_family_check
  check(family in ('course','module','lesson','quiz','analysis','partner','link'));
alter table pipstart_editorial_private.items add constraint items_parent_check
  check((family in ('course','analysis','partner'))=(parent_id is null));
alter table pipstart_editorial_private.items add constraint items_path_check
  check((family in ('analysis','partner','link'))=(learning_path is null));

-- Protected policy: append-only versions. Partner rows carry the risk notice; link rows the hosts.
create table pipstart_editorial_private.partner_policies(
  item_id text not null check(item_id ~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$'),
  version integer not null check(version>=1),
  kind text not null check(kind in ('partner','link')),
  risk_notice text check(risk_notice is null or (char_length(risk_notice) between 1 and 1000 and risk_notice=btrim(risk_notice))),
  allowed_hosts text[] check(allowed_hosts is null or cardinality(allowed_hosts) between 1 and 5),
  reason text not null check(char_length(reason) between 1 and 200 and reason=btrim(reason)),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default clock_timestamp(),
  primary key(item_id,version),
  check((kind='partner')=(risk_notice is not null)),
  check((kind='link')=(allowed_hosts is not null))
);
-- The policy versions each publication relied on, frozen with the generation.
create table pipstart_editorial_private.generation_partner_policies(
  generation bigint not null references pipstart_editorial_private.generations(generation) on delete restrict,
  item_id text not null,
  policy_version integer not null,
  primary key(generation,item_id),
  foreign key(item_id,policy_version) references pipstart_editorial_private.partner_policies(item_id,version) on delete restrict
);
create trigger pipstart_partner_policy_immutable before update or delete on pipstart_editorial_private.partner_policies
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_generation_partner_policy_immutable before update or delete on pipstart_editorial_private.generation_partner_policies
  for each row execute function pipstart_staff_private.immutable_audit();
alter table pipstart_editorial_private.partner_policies enable row level security;
alter table pipstart_editorial_private.generation_partner_policies enable row level security;
revoke all on pipstart_editorial_private.partner_policies,pipstart_editorial_private.generation_partner_policies from public,anon,authenticated,service_role;

-- Lowercase public host of an https URL with no credentials, port or whitespace; null otherwise.
create function pipstart_editorial_private.https_host(p_url text) returns text
language sql immutable set search_path='' as $$
  select case when p_url is not null and char_length(p_url) between 12 and 2048 and p_url !~ '[[:space:][:cntrl:]]'
    and p_url ~ '^https://[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+([/?#].*)?$'
    then substring(p_url from '^https://([^/?#]+)') end
$$;
create function pipstart_editorial_private.date_ok(p_value jsonb,p_nullable boolean) returns boolean
language plpgsql immutable set search_path='' as $$
begin
  if p_value is null or jsonb_typeof(p_value)='null' then return p_nullable; end if;
  if jsonb_typeof(p_value)<>'string' or (p_value#>>'{}') !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
  perform make_date(substr(p_value#>>'{}',1,4)::integer,substr(p_value#>>'{}',6,2)::integer,substr(p_value#>>'{}',9,2)::integer);
  return true;
exception when others then return false;
end $$;
create function pipstart_editorial_private.text_ok(p_value jsonb,p_max integer) returns boolean
language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(p_value)='string' and char_length(btrim(p_value#>>'{}')) between 1 and p_max,false)
$$;
create function pipstart_editorial_private.source_ok(p_value jsonb) returns boolean
language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(p_value)='object' and (select array_agg(k order by k collate "C") from jsonb_object_keys(p_value) k)=array['checkedAt','url']
    and jsonb_typeof(p_value->'url')='string' and pipstart_editorial_private.https_host(p_value->>'url') is not null
    and pipstart_editorial_private.date_ok(p_value->'checkedAt',false),false)
$$;
create function pipstart_editorial_private.facts_ok(p_value jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare f jsonb;
begin
  if coalesce(jsonb_typeof(p_value)<>'array' or jsonb_array_length(p_value)>50,true) then return false; end if;
  for f in select value from jsonb_array_elements(p_value) loop
    if coalesce(jsonb_typeof(f)<>'object'
      or (select array_agg(k order by k collate "C") from jsonb_object_keys(f) k)<>array['label','source','value','verification']
      or not pipstart_editorial_private.text_ok(f->'label',100)
      or not (jsonb_typeof(f->'value')='null' or pipstart_editorial_private.text_ok(f->'value',500))
      or f->>'verification' not in ('pending','verified')
      or not (jsonb_typeof(f->'source')='null' or pipstart_editorial_private.source_ok(f->'source'))
      or (f->>'verification'='verified' and (jsonb_typeof(f->'value')='null' or jsonb_typeof(f->'source')='null')),true) then return false; end if;
  end loop;
  return true;
end $$;
create function pipstart_editorial_private.codes_ok(p_value jsonb,p_pattern text) returns boolean
language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(p_value)='array' and jsonb_array_length(p_value)<=250
    and not exists(select 1 from jsonb_array_elements(p_value) c where jsonb_typeof(c)<>'string' or (c#>>'{}') !~ p_pattern),false)
$$;
-- Structural rules ported from the deployment-controlled provider directory. Partner bodies never
-- carry a risk notice or hosts (Owner policy supplies them); link bodies never carry hosts.
create function pipstart_editorial_private.partner_body_ok(p_family text,p_body jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare x jsonb; m jsonb:=p_body->'metadata'; r jsonb:=p_body->'review'; a jsonb:=p_body->'availability';
begin
  if p_family='link' then
    return coalesce((select array_agg(k order by k collate "C") from jsonb_object_keys(p_body) k)=array['active','expiresAt','metadata','url']
      and (select array_agg(k order by k collate "C") from jsonb_object_keys(m) k)=array['title']
      and jsonb_typeof(p_body->'url')='string' and pipstart_editorial_private.https_host(p_body->>'url') is not null
      and jsonb_typeof(p_body->'active')='boolean' and pipstart_editorial_private.date_ok(p_body->'expiresAt',true),false);
  end if;
  if p_family<>'partner' then return false; end if;
  if coalesce((select array_agg(k order by k collate "C") from jsonb_object_keys(p_body) k)<>array['availability','entities','facts','fees','image','metadata','payments','relationship','review','summary','support']
   or (select array_agg(k order by k collate "C") from jsonb_object_keys(m) k)<>array['brand','kind','shortName','title']
   or not pipstart_editorial_private.text_ok(m->'shortName',60) or m->>'kind' not in ('forex-broker','crypto-exchange')
   or m->>'brand' not in ('deriv','neutral') or p_body->>'relationship' not in ('affiliate','none')
   or not pipstart_editorial_private.text_ok(p_body->'summary',2000)
   or not pipstart_editorial_private.facts_ok(p_body->'facts') or not pipstart_editorial_private.facts_ok(p_body->'fees')
   or not pipstart_editorial_private.facts_ok(p_body->'support'),true) then return false; end if;
  if coalesce(jsonb_typeof(r)<>'object'
   or (select array_agg(k order by k collate "C") from jsonb_object_keys(r) k)<>array['expiresAt','previousListingDate','reviewedAt','sources','status']
   or r->>'status' not in ('pending','verified')
   or not pipstart_editorial_private.date_ok(r->'reviewedAt',true) or not pipstart_editorial_private.date_ok(r->'expiresAt',true)
   or not pipstart_editorial_private.date_ok(r->'previousListingDate',true)
   or jsonb_typeof(r->'sources')<>'array' or jsonb_array_length(r->'sources')>50
   or exists(select 1 from jsonb_array_elements(r->'sources') s where not pipstart_editorial_private.source_ok(s))
   or (r->>'status'='verified' and (jsonb_typeof(r->'reviewedAt')<>'string' or jsonb_typeof(r->'expiresAt')<>'string'
       or r->>'expiresAt'<=r->>'reviewedAt' or jsonb_array_length(r->'sources')=0)),true) then return false; end if;
  if coalesce(jsonb_typeof(a)<>'object'
   or (select array_agg(k order by k collate "C") from jsonb_object_keys(a) k)<>array['allowed','blocked','source','status']
   or a->>'status' not in ('unknown','verified')
   or not pipstart_editorial_private.codes_ok(a->'allowed','^[A-Z]{2}$') or not pipstart_editorial_private.codes_ok(a->'blocked','^[A-Z]{2}$')
   or exists(select 1 from jsonb_array_elements_text(a->'allowed') c where (a->'blocked') ? c)
   or (a->>'status'='unknown' and (jsonb_array_length(a->'allowed')>0 or jsonb_array_length(a->'blocked')>0))
   or not (jsonb_typeof(a->'source')='null' or pipstart_editorial_private.source_ok(a->'source'))
   or (a->>'status'='verified' and jsonb_typeof(a->'source')='null'),true) then return false; end if;
  if coalesce(jsonb_typeof(p_body->'entities')<>'array' or jsonb_array_length(p_body->'entities')>50
   or jsonb_typeof(p_body->'payments')<>'array' or jsonb_array_length(p_body->'payments')>50,true) then return false; end if;
  for x in select value from jsonb_array_elements(p_body->'entities') loop
    if coalesce(jsonb_typeof(x)<>'object' or (select array_agg(k order by k collate "C") from jsonb_object_keys(x) k)<>array['licence','name','regulator','source']
     or not pipstart_editorial_private.text_ok(x->'name',200) or not pipstart_editorial_private.source_ok(x->'source')
     or not (jsonb_typeof(x->'regulator')='null' or pipstart_editorial_private.text_ok(x->'regulator',200))
     or not (jsonb_typeof(x->'licence')='null' or pipstart_editorial_private.text_ok(x->'licence',200)),true) then return false; end if;
  end loop;
  for x in select value from jsonb_array_elements(p_body->'payments') loop
    if coalesce(jsonb_typeof(x)<>'object' or (select array_agg(k order by k collate "C") from jsonb_object_keys(x) k)<>array['countries','currencies','method','source']
     or not pipstart_editorial_private.text_ok(x->'method',100) or not pipstart_editorial_private.source_ok(x->'source')
     or not pipstart_editorial_private.codes_ok(x->'countries','^[A-Z]{2}$') or not pipstart_editorial_private.codes_ok(x->'currencies','^[A-Z]{3}$'),true) then return false; end if;
  end loop;
  x:=p_body->'image';
  return coalesce(jsonb_typeof(x)='null' or (jsonb_typeof(x)='object'
    and (select array_agg(k order by k collate "C") from jsonb_object_keys(x) k)=array['alt','height','src','width']
    and jsonb_typeof(x->'src')='string' and (x->>'src') ~ '^/brokers/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp|svg)$'
    and pipstart_editorial_private.text_ok(x->'alt',300)
    and jsonb_typeof(x->'width')='number' and jsonb_typeof(x->'height')='number'
    and (x->>'width')::numeric between 1 and 10000 and (x->>'height')::numeric between 1 and 10000),false);
-- Structural checks can meet a scalar where an object is expected; any such error means "not valid".
exception when others then return false;
end $$;

-- Existing family rules unchanged; partner and link bodies add the structural rules above.
create or replace function pipstart_editorial_private.body_ok(p_family text,p_body jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare b jsonb;
begin
  if coalesce(p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>262144
   or jsonb_typeof(p_body->'metadata')<>'object'
   or jsonb_typeof(p_body->'metadata'->'title')<>'string'
   or char_length(btrim(p_body->'metadata'->>'title')) not between 1 and 200,true) then return false; end if;
  if p_family='lesson' then
    if coalesce(jsonb_typeof(p_body->'blocks')<>'array' or jsonb_array_length(p_body->'blocks') not between 1 and 500,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'blocks') loop
      if coalesce(jsonb_typeof(b)<>'object' or coalesce(b->>'type','') not in (
        'heading','paragraph','learningLink','section','references','riskStatement','list','quote','reflection',
        'takeaway','definition','example','warning','keyPoint','formula','exercise','practice','diagram',
        'comparisonTable','riskNotice','affiliateDisclosure','quizPreview'),true) then return false; end if;
    end loop;
    if p_body ? 'sections' and jsonb_typeof(p_body->'sections')<>'array' then return false; end if;
  elsif p_family='analysis' then
    -- Exactly one section per post: a single string, never a list or both.
    if coalesce(jsonb_typeof(p_body->'metadata'->'category')<>'string' or p_body->'metadata'->>'category' not in ('fundamental','technical')
     or jsonb_typeof(p_body->'metadata'->'excerpt')<>'string' or char_length(btrim(p_body->'metadata'->>'excerpt')) not between 1 and 300
     or jsonb_typeof(p_body->'paragraphs')<>'array' or jsonb_array_length(p_body->'paragraphs') not between 1 and 200,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'paragraphs') loop
      if coalesce(jsonb_typeof(b)<>'string' or btrim(b#>>'{}')='',true) then return false; end if;
    end loop;
  elsif p_family='quiz' then
    if coalesce(jsonb_typeof(p_body->'questions')<>'array' or jsonb_array_length(p_body->'questions') not between 1 and 100,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'questions') loop
      if coalesce(jsonb_typeof(b)<>'object' or jsonb_typeof(b->'choices')<>'array' or jsonb_typeof(b->'correctChoiceIds')<>'array'
       or jsonb_array_length(b->'choices') not between 2 and 10 or jsonb_array_length(b->'correctChoiceIds')<1,true) then return false; end if;
    end loop;
  end if;
  if p_family in ('partner','link') and not pipstart_editorial_private.partner_body_ok(p_family,p_body) then return false; end if;
  return true;
end $$;

-- One mapping from editorial actions to the partner capabilities. Owner holds every capability.
-- Affiliate Managers revoke assigned links; publishing a partner/link remains Editor or Owner.
create function pipstart_editorial_private.allowed(p_capability text,p_family text,p_id text) returns boolean
language plpgsql security definer set search_path='' as $$
begin
  if p_family in ('partner','link') then
    return case p_capability
      when 'content.read' then pipstart_staff_private.has_capability('partner.read',p_family,p_id)
      when 'content.write' then pipstart_staff_private.has_capability('partner.write',p_family,p_id)
      when 'content.submit' then pipstart_staff_private.has_capability('partner.write',p_family,p_id)
      when 'content.trash' then pipstart_staff_private.has_capability('partner.trash',p_family,p_id)
      when 'content.restore' then pipstart_staff_private.has_capability('partner.restore',p_family,p_id)
      when 'content.withdraw' then pipstart_staff_private.has_capability('content.withdraw',p_family,p_id)
        or (p_family='link' and pipstart_staff_private.has_capability('link.revoke',p_family,p_id))
      else pipstart_staff_private.has_capability(p_capability,p_family,p_id) end;
  end if;
  return pipstart_staff_private.has_capability(p_capability,p_family,p_id);
end $$;
create or replace function pipstart_editorial_private.require(p_capability text,p_family text,p_id text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not pipstart_editorial_private.allowed(p_capability,p_family,p_id) then
    raise exception using errcode='42501',message='Not permitted for this content'; end if;
end $$;

create or replace function public.pipstart_editorial_list(p_after text default '',p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); sees_all boolean;
begin
  if p_after is null or p_limit is null or p_limit not between 1 and 100 then raise exception using errcode='22023',message='Invalid page'; end if;
  sees_all:=pipstart_editorial_private.is_owner(u);
  return coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'family',x.family,'learning_path',x.learning_path,'category',x.category,'parent_id',x.parent_id,'latest_revision',x.latest_revision,'state',x.state,'trashed',x.trashed) order by x.id)
    from (select i.id,i.family,i.learning_path,case when i.family='analysis' then r.body->'metadata'->>'category' end as category,i.parent_id,i.latest_revision,r.state,i.trashed_at is not null as trashed
      from pipstart_editorial_private.items i join pipstart_editorial_private.revisions r on r.item_id=i.id and r.revision_no=i.latest_revision
      where i.id>p_after and (sees_all or pipstart_editorial_private.allowed('content.read',i.family,i.id))
      order by i.id limit p_limit) x),'[]'::jsonb);
end $$;

create or replace function public.pipstart_editorial_create(p_id text,p_family text,p_learning_path text,p_parent text,p_body jsonb,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); p pipstart_editorial_private.items;
begin
  if p_family is null or p_family not in ('course','module','lesson','quiz','analysis','partner','link')
   or (p_family in ('analysis','partner','link') and p_learning_path is not null)
   or (p_family not in ('analysis','partner','link') and (p_learning_path is null or p_learning_path not in ('forex','crypto'))) then
    raise exception using errcode='22023',message='Unsupported content family or path'; end if;
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then raise exception using errcode='22023',message='Invalid content identity'; end if;
  if p_parent is null then
    if p_family not in ('course','analysis','partner') then raise exception using errcode='22023',message='Only courses, analysis posts and partners have no parent'; end if;
    perform pipstart_editorial_private.require('content.write',p_family,p_id);
  else
    p:=pipstart_editorial_private.locked_item(p_parent);
    perform pipstart_editorial_private.require('content.write',p.family,p.id);
    if p_family in ('analysis','partner') or p.trashed_at is not null or p.learning_path is distinct from p_learning_path
     or not ((p_family='module' and p.family='course') or (p_family='lesson' and p.family='module') or (p_family='quiz' and p.family in ('course','module','lesson'))
       or (p_family='link' and p.family='partner')) then
      raise exception using errcode='22023',message='Parent does not accept this content'; end if;
  end if;
  if exists(select 1 from pipstart_editorial_private.items where id=p_id) then raise exception using errcode='22023',message='Content identity already exists'; end if;
  if not pipstart_editorial_private.body_ok(p_family,p_body) then raise exception using errcode='22023',message='Content body is not valid for this family'; end if;
  if p_family='quiz' and not pipstart_editorial_private.quiz_version_ok(p_id,p_body) then
    raise exception using errcode='22023',message='A quiz draft must carry the next version: one more than its highest approved version'; end if;
  insert into pipstart_editorial_private.items(id,family,learning_path,parent_id,created_by,latest_revision) values(p_id,p_family,p_learning_path,p_parent,u,1);
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(p_id,1,1,p_body,repeat('0',64),0,u,p_reason,'draft');
  perform pipstart_editorial_private.log(u,'create',p_id,1,p_reason);
  return pipstart_editorial_private.revision_result(p_id,1);
end $$;

-- Current policy version for an identity (0 when none).
create function pipstart_editorial_private.policy_version(p_id text) returns integer
language sql stable security definer set search_path='' as $$
  select coalesce(max(version),0) from pipstart_editorial_private.partner_policies where item_id=p_id
$$;

-- Every link revision must point inside its Owner-approved hosts at the moment it is written.
create function pipstart_editorial_private.partner_revision_policy() returns trigger
language plpgsql security definer set search_path='' as $$
declare fam text; hosts text[];
begin
  select family into fam from pipstart_editorial_private.items where id=new.item_id;
  if fam='link' then
    select allowed_hosts into hosts from pipstart_editorial_private.partner_policies
      where item_id=new.item_id and version=pipstart_editorial_private.policy_version(new.item_id);
    if hosts is null or not (pipstart_editorial_private.https_host(new.body->>'url')=any(hosts)) then
      raise exception using errcode='22023',message='Link destination is not on its Owner-approved hosts'; end if;
  end if;
  return new;
end $$;
create trigger pipstart_partner_revision_policy before insert on pipstart_editorial_private.revisions
  for each row execute function pipstart_editorial_private.partner_revision_policy();

-- Every publication (publish, withdraw, restore, baseline) rechecks partner content against the
-- current policy and freezes the versions it relied on.
create function pipstart_editorial_private.partner_generation_guard() returns trigger
language plpgsql security definer set search_path='' as $$
declare g bigint;
begin
  for g in select distinct generation from new_entries loop
    if exists(select 1 from new_entries e where e.generation=g and e.family='link'
        and not exists(select 1 from pipstart_editorial_private.generation_entries p where p.generation=g and p.item_id=e.parent_id and p.family='partner')) then
      raise exception using errcode='55000',message='A link can only be live while its partner is live'; end if;
    if exists(select 1 from new_entries e where e.generation=g and e.family='partner'
        and pipstart_editorial_private.policy_version(e.item_id)=0) then
      raise exception using errcode='55000',message='The Owner must set this partner''s risk notice first'; end if;
    if exists(select 1 from new_entries e join pipstart_editorial_private.revisions r on r.item_id=e.item_id and r.revision_no=e.revision_no
        left join pipstart_editorial_private.partner_policies p on p.item_id=e.item_id and p.version=pipstart_editorial_private.policy_version(e.item_id)
        where e.generation=g and e.family='link' and (p.allowed_hosts is null or not (pipstart_editorial_private.https_host(r.body->>'url')=any(p.allowed_hosts)))) then
      raise exception using errcode='55000',message='A link destination is no longer on its Owner-approved hosts'; end if;
    insert into pipstart_editorial_private.generation_partner_policies(generation,item_id,policy_version)
      select g,e.item_id,pipstart_editorial_private.policy_version(e.item_id) from new_entries e
      where e.generation=g and e.family in ('partner','link');
  end loop;
  return null;
end $$;
create trigger pipstart_partner_generation_guard after insert on pipstart_editorial_private.generation_entries
  referencing new table as new_entries for each statement execute function pipstart_editorial_private.partner_generation_guard();

-- Owner-only protected policy. A new version never edits an earlier one.
create function public.pipstart_partner_policy_set(p_id text,p_kind text,p_expected_version integer,p_value jsonb,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; cur integer; prior text; fam text; hosts text[]; notice text; h text;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner sets partner policy'; end if;
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' or p_kind is null or p_kind not in ('partner','link')
   or p_reason is null or char_length(p_reason) not between 1 and 200 or p_reason<>btrim(p_reason)
   or p_value is null or jsonb_typeof(p_value)<>'object' then
    raise exception using errcode='22023',message='Invalid partner policy request'; end if;
  perform pg_advisory_xact_lock(hashtextextended('pipstart_partner_policy:'||p_id,0));
  cur:=pipstart_editorial_private.policy_version(p_id);
  select kind into prior from pipstart_editorial_private.partner_policies where item_id=p_id and version=cur;
  select family into fam from pipstart_editorial_private.items where id=p_id;
  if (prior is not null and prior<>p_kind) or (fam is not null and fam<>p_kind) then
    raise exception using errcode='22023',message='Policy kind does not match this content'; end if;
  if p_expected_version is distinct from cur then raise exception using errcode='PT409',message='A newer partner policy exists'; end if;
  if p_kind='partner' then
    if (select array_agg(k) from jsonb_object_keys(p_value) k)<>array['riskNotice'] or jsonb_typeof(p_value->'riskNotice')<>'string'
     or char_length(p_value->>'riskNotice') not between 1 and 1000 or p_value->>'riskNotice'<>btrim(p_value->>'riskNotice') then
      raise exception using errcode='22023',message='A partner policy needs only a risk notice'; end if;
    notice:=p_value->>'riskNotice';
  else
    if (select array_agg(k) from jsonb_object_keys(p_value) k)<>array['allowedHosts'] or jsonb_typeof(p_value->'allowedHosts')<>'array'
     or jsonb_array_length(p_value->'allowedHosts') not between 1 and 5 then
      raise exception using errcode='22023',message='A link policy needs one to five approved hosts'; end if;
    for h in select value#>>'{}' from jsonb_array_elements(p_value->'allowedHosts') loop
      if h is null or pipstart_editorial_private.https_host('https://'||h)is distinct from h or h=any(coalesce(hosts,'{}')) then
        raise exception using errcode='22023',message='Approved hosts must be distinct lowercase public host names'; end if;
      hosts:=coalesce(hosts,'{}')||h;
    end loop;
  end if;
  insert into pipstart_editorial_private.partner_policies(item_id,version,kind,risk_notice,allowed_hosts,reason,created_by)
    values(p_id,cur+1,p_kind,notice,hosts,p_reason,u);
  perform pipstart_editorial_private.log(u,'policy',p_id,null,'partner policy v'||(cur+1)||': '||p_reason);
  return jsonb_build_object('item_id',p_id,'kind',p_kind,'version',cur+1);
end $$;

-- Current protected policy for one identity: Owner, or staff who may read that partner/link.
create function public.pipstart_partner_policy(p_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); p pipstart_editorial_private.partner_policies; fam text;
begin
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then raise exception using errcode='22023',message='Invalid content identity'; end if;
  select * into p from pipstart_editorial_private.partner_policies where item_id=p_id and version=pipstart_editorial_private.policy_version(p_id);
  select family into fam from pipstart_editorial_private.items where id=p_id;
  if not pipstart_editorial_private.is_owner(u)
   and not pipstart_editorial_private.allowed('content.read',coalesce(fam,p.kind,'partner'),p_id) then
    raise exception using errcode='42501',message='Not permitted for this content'; end if;
  if p.item_id is null then return jsonb_build_object('item_id',p_id,'version',0); end if;
  return jsonb_build_object('item_id',p.item_id,'kind',p.kind,'version',p.version,'risk_notice',p.risk_notice,
    'allowed_hosts',to_jsonb(p.allowed_hosts),'updated_at',p.created_at);
end $$;

revoke all on all functions in schema pipstart_editorial_private from public,anon,authenticated,service_role;
do $$ declare f text; begin
  foreach f in array array['public.pipstart_partner_policy_set(text,text,integer,jsonb,text)','public.pipstart_partner_policy(text)',
    'public.pipstart_editorial_create(text,text,text,text,jsonb,text)','public.pipstart_editorial_list(text,integer)'] loop
    execute format('revoke all on function %s from public,anon,authenticated,service_role',f);
    execute format('grant execute on function %s to authenticated',f);
  end loop;
end $$;
commit;
