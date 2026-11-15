-- M22 MP09d2 partner import: operator-only, idempotent import of partners, their one link and their
-- first Owner policy, so the deployment register (content/providers.ts, content/provider-links.ts)
-- enters the store byte-exact. It mirrors the MP05 import: imported revisions are recorded as
-- approved with provenance and attributed to the single active Owner; making them live stays an
-- Owner action in the publication panel. Staff work is never overwritten: an item or policy that was
-- changed in the store reports a conflict and nothing is written. Nothing is granted to an API role.
begin;
do $$ begin
 if to_regprocedure('pipstart_editorial_private.import_item(text,text,text,text,jsonb,text,text)') is null
  or to_regprocedure('public.pipstart_partner_policy_set(text,text,integer,jsonb,text)') is null
  or to_regprocedure('pipstart_editorial_private.partner_snapshot(bigint)') is null
  or to_regprocedure('pipstart_editorial_private.import_partner_item(text,text,text,jsonb,text,text)') is not null
  or to_regprocedure('pipstart_editorial_private.import_partner_policy(text,text,jsonb,text)') is not null then
  raise exception 'Accepted MP09 partner store and snapshot required; partner import must not already exist'; end if;
end $$;

-- The single active Owner every import is attributed to; refused unless there is exactly one.
create function pipstart_editorial_private.import_owner() returns uuid
language plpgsql stable set search_path='' as $$
declare o uuid;
begin
  if (select count(*) from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner')<>1 then
    raise exception using errcode='55000',message='Import requires exactly one active Owner'; end if;
  select m.user_id into o from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner';
  return o;
end $$;

-- Identities the snapshot and /go accept: partner:<slug> and link:<slug>.
create function pipstart_editorial_private.partner_identity_ok(p_family text,p_id text) returns boolean
language sql immutable set search_path='' as $$
  select p_family in ('partner','link') and p_id is not null and p_id ~ ('^'||p_family||':[a-z0-9]+(-[a-z0-9]+)*$') and char_length(p_id)<=200
$$;

-- First Owner policy for a partner (risk notice) or link (approved hosts), from code:
--   created   - no policy yet: version 1, attributed to the Owner and audited as policy
--   unchanged - the current policy already holds exactly this value
--   conflict  - the Owner set a different policy in the store: nothing is written
create function pipstart_editorial_private.import_partner_policy(p_id text,p_kind text,p_value jsonb,p_source_ref text)
returns text language plpgsql set search_path='' as $$
declare o uuid:=pipstart_editorial_private.import_owner(); cur integer; p pipstart_editorial_private.partner_policies; fam text; notice text; hosts text[]; h text;
begin
  if not pipstart_editorial_private.partner_identity_ok(p_kind,p_id) then
    raise exception using errcode='22023',message='Invalid partner policy identity'; end if;
  if p_source_ref is null or char_length(p_source_ref) not between 1 and 180 or p_source_ref !~ '^[a-z-]+:[a-z0-9@_:/.-]+$' then
    raise exception using errcode='22023',message='Invalid import source reference'; end if;
  if p_value is null or jsonb_typeof(p_value)<>'object' then raise exception using errcode='22023',message='Invalid partner policy request'; end if;
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
      if h is null or pipstart_editorial_private.https_host('https://'||h) is distinct from h or h=any(coalesce(hosts,'{}')) then
        raise exception using errcode='22023',message='Approved hosts must be distinct lowercase public host names'; end if;
      hosts:=coalesce(hosts,'{}')||h;
    end loop;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('pipstart_partner_policy:'||p_id,0));
  select family into fam from pipstart_editorial_private.items where id=p_id;
  if fam is not null and fam<>p_kind then raise exception using errcode='22023',message='Policy kind does not match this content'; end if;
  cur:=pipstart_editorial_private.policy_version(p_id);
  if cur>0 then
    select * into p from pipstart_editorial_private.partner_policies where item_id=p_id and version=cur;
    if p.kind=p_kind and p.risk_notice is not distinct from notice and p.allowed_hosts is not distinct from hosts then return 'unchanged'; end if;
    return 'conflict';
  end if;
  insert into pipstart_editorial_private.partner_policies(item_id,version,kind,risk_notice,allowed_hosts,reason,created_by)
    values(p_id,1,p_kind,notice,hosts,'Imported from '||p_source_ref,o);
  perform pipstart_editorial_private.log(o,'policy',p_id,null,'partner policy v1: Imported from '||p_source_ref);
  return 'created';
end $$;

-- One partner or link per call, partner first, with the same outcomes as the MP05 import_item:
--   created / unchanged / updated (code changed and nobody edited it in the store) / conflict.
-- p_expected_sha is the body hash computed from code; any difference is refused. A link's
-- destination must already be on its Owner-approved hosts (the MP09a revision trigger).
create function pipstart_editorial_private.import_partner_item(p_id text,p_family text,p_parent text,p_body jsonb,p_source_ref text,p_expected_sha text)
returns text language plpgsql set search_path='' as $$
declare o uuid:=pipstart_editorial_private.import_owner(); i pipstart_editorial_private.items; p pipstart_editorial_private.items;
  last_import pipstart_editorial_private.imports; latest pipstart_editorial_private.revisions; n integer; got text;
begin
  if p_family is null or p_family not in ('partner','link') or (p_family='partner')<>(p_parent is null) then
    raise exception using errcode='22023',message='Unsupported partner family or parent'; end if;
  if not pipstart_editorial_private.partner_identity_ok(p_family,p_id) then raise exception using errcode='22023',message='Invalid partner identity'; end if;
  if p_source_ref is null or char_length(p_source_ref) not between 1 and 180 or p_source_ref !~ '^[a-z-]+:[a-z0-9@_:/.-]+$' then
    raise exception using errcode='22023',message='Invalid import source reference'; end if;
  if p_expected_sha is null or p_expected_sha !~ '^[0-9a-f]{64}$' then raise exception using errcode='22023',message='Expected body hash required'; end if;
  if not pipstart_editorial_private.body_ok(p_family,p_body) then raise exception using errcode='22023',message=format('Content body is not valid for this family: %s',p_id); end if;
  got:=encode(sha256(convert_to(p_body::text,'UTF8')),'hex');
  if got<>p_expected_sha then raise exception using errcode='22023',message=format('Body hash differs from the manifest for %s',p_id); end if;
  if p_parent is not null then
    select * into p from pipstart_editorial_private.items where id=p_parent;
    if not found or p.family<>'partner' or p.trashed_at is not null then
      raise exception using errcode='22023',message=format('Parent does not accept %s',p_id); end if;
    if exists(select 1 from pipstart_editorial_private.items where parent_id=p_parent and family='link' and id<>p_id) then
      raise exception using errcode='22023',message=format('Partner %s already has another link',p_parent); end if;
  end if;

  select * into i from pipstart_editorial_private.items where id=p_id for update;
  if not found then
    insert into pipstart_editorial_private.items(id,family,learning_path,parent_id,created_by,latest_revision) values(p_id,p_family,null,p_parent,o,1);
    n:=1;
  else
    if (i.family,i.learning_path,i.parent_id) is distinct from (p_family,null::text,p_parent) then
      raise exception using errcode='22023',message=format('Import identity differs from the store for %s',p_id); end if;
    select * into latest from pipstart_editorial_private.revisions where item_id=i.id and revision_no=i.latest_revision;
    select * into last_import from pipstart_editorial_private.imports where item_id=i.id order by revision_no desc limit 1;
    if last_import.item_id is null or last_import.revision_no<>i.latest_revision or latest.state<>'approved' or i.trashed_at is not null then
      return 'conflict'; end if;
    if latest.body_sha256=got then return 'unchanged'; end if;
    n:=i.latest_revision+1;
    perform pipstart_editorial_private.supersede_open(i.id);
  end if;
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(p_id,n,1,p_body,repeat('0',64),n-1,o,left('Imported from '||p_source_ref,200),'approved');
  if n>1 then update pipstart_editorial_private.items set latest_revision=n where id=p_id; end if;
  insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(p_id,n,got,o,'imported',null);
  insert into pipstart_editorial_private.imports(item_id,revision_no,source_ref,body_sha256) values(p_id,n,p_source_ref,got);
  perform pipstart_editorial_private.log(o,'import',p_id,n,p_source_ref);
  return case when n=1 then 'created' else 'updated' end;
end $$;

revoke all on function pipstart_editorial_private.import_owner() from public,anon,authenticated,service_role;
revoke all on function pipstart_editorial_private.partner_identity_ok(text,text) from public,anon,authenticated,service_role;
revoke all on function pipstart_editorial_private.import_partner_policy(text,text,jsonb,text) from public,anon,authenticated,service_role;
revoke all on function pipstart_editorial_private.import_partner_item(text,text,text,jsonb,text,text) from public,anon,authenticated,service_role;
commit;
