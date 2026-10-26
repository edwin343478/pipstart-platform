-- MP02 foundation: no owner seed, activation, legacy-role change or job.
begin;

create schema pipstart_staff_private;
revoke all on schema pipstart_staff_private from public, anon, authenticated, service_role;

create table pipstart_staff_private.control (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false,
  version bigint not null default 0 check (version >= 0)
);
insert into pipstart_staff_private.control(singleton) values(true);

create table pipstart_staff_private.members (
  user_id uuid primary key references auth.users(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default clock_timestamp()
);
create table pipstart_staff_private.roles (
  user_id uuid not null references pipstart_staff_private.members(user_id) on delete restrict,
  role_name text not null check (role_name in ('owner','administrator','author','reviewer','editor','moderator','affiliate_manager')),
  primary key(user_id,role_name)
);
create table pipstart_staff_private.delegations (
  user_id uuid not null references pipstart_staff_private.members(user_id) on delete restrict,
  capability text not null check (capability in ('roles.delegate','people.manage_learners','audit.read')),
  primary key(user_id,capability)
);
create table pipstart_staff_private.assignments (
  user_id uuid not null references pipstart_staff_private.members(user_id) on delete restrict,
  resource_kind text not null check (resource_kind in ('course','module','lesson','quiz','partner','link','maintenance')),
  resource_id text not null check (resource_id ~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$'),
  primary key(user_id,resource_kind,resource_id)
);
create table pipstart_staff_private.receipts (
  token_hash bytea primary key check (octet_length(token_hash)=32),
  actor_id uuid not null references pipstart_staff_private.members(user_id) on delete restrict,
  session_id uuid not null,
  operation text not null,
  target_id uuid not null,
  value text not null,
  resource_kind text not null,
  resource_id text not null,
  verified_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  check (expires_at=verified_at+interval '5 minutes')
);
create table pipstart_staff_private.audit (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default clock_timestamp(),
  actor_id uuid,
  request_id uuid not null,
  operation text not null check (operation in ('bootstrap','control','grant_role','revoke_role','grant_delegation','revoke_delegation','assign','unassign','suspend','resume')),
  target_id uuid,
  value text not null,
  resource_kind text not null default '',
  resource_id text not null default '',
  reason_code text not null check (reason_code in ('staff_onboarding','access_change','security_response','owner_transfer','enablement')),
  outcome text not null check (outcome in ('changed','unchanged')),
  unique(request_id)
);
create index pipstart_staff_audit_page on pipstart_staff_private.audit(created_at desc,id desc);

-- No raw tables are reachable by any API role, including the service role.
alter table pipstart_staff_private.control enable row level security;
alter table pipstart_staff_private.members enable row level security;
alter table pipstart_staff_private.roles enable row level security;
alter table pipstart_staff_private.delegations enable row level security;
alter table pipstart_staff_private.assignments enable row level security;
alter table pipstart_staff_private.receipts enable row level security;
alter table pipstart_staff_private.audit enable row level security;
revoke all on all tables in schema pipstart_staff_private from public, anon, authenticated, service_role;

create function pipstart_staff_private.immutable_audit() returns trigger
language plpgsql set search_path='' as $$
begin raise exception using errcode='42501',message='Staff audit records are append-only'; end;
$$;
create trigger pipstart_staff_audit_immutable before update or delete
on pipstart_staff_private.audit for each row execute function pipstart_staff_private.immutable_audit();

-- PostgREST verifies the JWT before selecting the authenticated DB role.
-- This is not a defence against a trusted DB owner forging request settings.
create function pipstart_staff_private.actor() returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid; s uuid;
begin
  if current_setting('role',true) is distinct from 'authenticated'
     or auth.jwt()->>'role' is distinct from 'authenticated'
     or auth.jwt()->>'aal' is distinct from 'aal2' then return null; end if;
  u:=auth.uid();
  begin s:=(auth.jwt()->>'session_id')::uuid;
  exception when invalid_text_representation then return null; end;
  if u is null or s is null then return null; end if;
  if not exists(select 1 from auth.sessions where id=s and user_id=u) then return null; end if;
  if not exists(select 1 from pipstart_staff_private.control where singleton and enabled)
     or not exists(select 1 from pipstart_staff_private.members where user_id=u and active)
     or not exists(select 1 from pipstart_staff_private.roles where user_id=u) then return null; end if;
  return u;
end;
$$;

create function pipstart_staff_private.has_capability(p_capability text,p_kind text default '',p_id text default '')
returns boolean language plpgsql security definer set search_path='' as $$
declare u uuid; assigned boolean;
begin
  u:=pipstart_staff_private.actor();
  if u is null or p_capability is null or p_capability not in (
    'staff.enter','content.read','content.write','content.submit','content.review',
    'content.publish','content.withdraw','content.trash','content.restore',
    'partner.read','partner.write','partner.trash','partner.restore','link.revoke',
    'maintenance.assigned','people.read','people.manage_learners','roles.manage','roles.delegate','audit.read'
  ) then return false; end if;
  if exists(select 1 from pipstart_staff_private.roles where user_id=u and role_name='owner') then return true; end if;
  if p_capability='staff.enter' then return true; end if;
  if p_capability='people.read' then
    return exists(select 1 from pipstart_staff_private.roles where user_id=u and role_name='administrator');
  end if;
  if p_capability in ('roles.delegate','people.manage_learners','audit.read') then
    return exists(select 1 from pipstart_staff_private.roles where user_id=u and role_name='administrator')
      and exists(select 1 from pipstart_staff_private.delegations where user_id=u and capability=p_capability);
  end if;
  assigned:=exists(select 1 from pipstart_staff_private.assignments where user_id=u and resource_kind=p_kind and resource_id=p_id);
  if not assigned then return false; end if;
  if p_capability='maintenance.assigned' and p_kind='maintenance' then
    return exists(select 1 from pipstart_staff_private.roles where user_id=u and role_name in ('author','reviewer','editor','moderator','affiliate_manager'));
  end if;
  if p_kind in ('course','module','lesson','quiz') then
    return exists(select 1 from pipstart_staff_private.roles where user_id=u and (
      (role_name='author' and p_capability in ('content.read','content.write','content.submit','content.trash')) or
      (role_name='reviewer' and p_capability in ('content.read','content.review')) or
      (role_name='editor' and p_capability in ('content.read','content.write','content.submit','content.publish','content.withdraw','content.trash','content.restore'))
    ));
  end if;
  if p_kind in ('partner','link') then
    return exists(select 1 from pipstart_staff_private.roles where user_id=u and (
      (role_name='affiliate_manager' and (p_capability in ('partner.read','partner.write','partner.trash','partner.restore') or (p_capability='link.revoke' and p_kind='link'))) or
      (role_name='reviewer' and p_capability in ('partner.read','content.review')) or
      (role_name='editor' and p_capability in ('partner.read','content.publish','content.withdraw'))
    ));
  end if;
  return false;
end;
$$;

-- Subsequent feature mutation RPCs take this shared lock before checking object
-- authorship/revision/approval. Governance changes take the exclusive counterpart.
create function pipstart_staff_private.require_capability(p_capability text,p_kind text default '',p_id text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_staff_private.actor();
  if u is null or not pipstart_staff_private.has_capability(p_capability,p_kind,p_id) then
    raise exception using errcode='42501',message='Staff action not authorized';
  end if;
  return u;
end;
$$;

create function public.pipstart_staff_access(p_kind text default '',p_id text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; caps jsonb; names jsonb;
begin
  if p_kind is null or p_id is null
     or p_kind not in ('','course','module','lesson','quiz','partner','link','maintenance')
     or (p_kind='' and p_id<>'') or (p_kind<>'' and p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$') then
    raise exception using errcode='22023',message='Invalid staff resource';
  end if;
  u:=pipstart_staff_private.actor();
  if u is null then return jsonb_build_object('authorized',false); end if;
  select coalesce(jsonb_agg(role_name order by role_name),'[]'::jsonb) into names
    from pipstart_staff_private.roles where user_id=u;
  select coalesce(jsonb_agg(c order by c),'[]'::jsonb) into caps from unnest(array[
    'staff.enter','content.read','content.write','content.submit','content.review','content.publish',
    'content.withdraw','content.trash','content.restore','partner.read','partner.write',
    'partner.trash','partner.restore','link.revoke','maintenance.assigned','people.read',
    'people.manage_learners','roles.manage','roles.delegate','audit.read'
  ]) c where pipstart_staff_private.has_capability(c,p_kind,p_id);
  return jsonb_build_object('authorized',true,'user_id',u,'roles',names,'capabilities',caps);
end;
$$;

-- Operator-only bootstrap/transition/receipt primitives. No API execution grants,
-- no caller-supplied actor accepted by public mutations, no seed in this migration.
create function pipstart_staff_private.bootstrap_owner(p_user uuid,p_request uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from pipstart_staff_private.control where singleton and not enabled for update;
  if not found or exists(select 1 from pipstart_staff_private.members) then
    raise exception using errcode='42501',message='Initial staff bootstrap unavailable';
  end if;
  insert into pipstart_staff_private.members(user_id) values(p_user);
  insert into pipstart_staff_private.roles(user_id,role_name) values(p_user,'owner');
  insert into pipstart_staff_private.audit(actor_id,request_id,operation,target_id,value,reason_code,outcome)
    values(null,p_request,'bootstrap',p_user,'owner','owner_transfer','changed');
end;
$$;

create function pipstart_staff_private.transition(p_enabled boolean,p_expected_version bigint,p_request uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v bigint;
begin
  select version into v from pipstart_staff_private.control where singleton for update;
  if p_enabled is null or p_expected_version is distinct from v then
    raise exception using errcode='40001',message='Staff transition version changed';
  end if;
  if p_enabled and not exists(select 1 from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner') then
    raise exception using errcode='42501',message='Active owner required';
  end if;
  update pipstart_staff_private.control set enabled=p_enabled,version=version+1 where singleton;
  insert into pipstart_staff_private.audit(actor_id,request_id,operation,value,reason_code,outcome)
    values(null,p_request,'control',p_enabled::text,'enablement','changed');
end;
$$;

-- MP03 must connect issuance to a freshly verified provider challenge. Until then
-- only the trusted DB operator can call this primitive; no service/API grant.
create function pipstart_staff_private.issue_receipt(
  p_actor uuid,p_session uuid,p_operation text,p_target uuid,p_value text,
  p_kind text,p_id text,p_token_hash bytea,p_verified_at timestamptz
) returns void language plpgsql security definer set search_path='' as $$
begin
  if p_verified_at is null or p_verified_at>clock_timestamp()
     or p_verified_at<=clock_timestamp()-interval '5 minutes'
     or not exists(select 1 from auth.sessions where id=p_session and user_id=p_actor) then
    raise exception using errcode='42501',message='Fresh verified staff evidence required';
  end if;
  insert into pipstart_staff_private.receipts(token_hash,actor_id,session_id,operation,target_id,value,resource_kind,resource_id,verified_at,expires_at)
    values(p_token_hash,p_actor,p_session,p_operation,p_target,p_value,p_kind,p_id,p_verified_at,p_verified_at+interval '5 minutes');
end;
$$;

create function public.pipstart_staff_change(
  p_target uuid,p_operation text,p_value text,p_kind text,p_id text,
  p_token text,p_request uuid,p_reason text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; s uuid; receipt pipstart_staff_private.receipts%rowtype;
  previous pipstart_staff_private.audit%rowtype; changed_rows integer:=0; owner_actor boolean;
begin
  -- One deterministic serialization point for revocation and last-owner races.
  perform 1 from pipstart_staff_private.control where singleton for update;
  u:=pipstart_staff_private.actor();
  if u is null then raise exception using errcode='42501',message='Staff action not authorized'; end if;
  owner_actor:=pipstart_staff_private.has_capability('roles.manage');
  if not owner_actor and not pipstart_staff_private.has_capability('roles.delegate') then
    raise exception using errcode='42501',message='Staff action not authorized';
  end if;
  if p_target is null or p_request is null or p_operation is null or p_value is null or p_kind is null or p_id is null
    or p_reason is null or p_reason not in ('staff_onboarding','access_change','security_response','owner_transfer')
    or p_operation not in ('grant_role','revoke_role','grant_delegation','revoke_delegation','assign','unassign','suspend','resume') then
    raise exception using errcode='22023',message='Invalid staff command';
  end if;
  if not owner_actor and (p_operation not in ('grant_role','revoke_role')
     or p_value not in ('author','reviewer','editor','moderator','affiliate_manager') or p_target=u
     or exists(select 1 from pipstart_staff_private.roles where user_id=p_target and role_name in ('owner','administrator'))) then
    raise exception using errcode='42501',message='Delegation ceiling exceeded';
  end if;
  if p_operation='grant_role' and p_target=u then
    raise exception using errcode='42501',message='Self-grant is not allowed';
  end if;
  if p_operation in ('grant_role','revoke_role') then
    if p_value not in ('owner','administrator','author','reviewer','editor','moderator','affiliate_manager') or p_kind<>'' or p_id<>'' then
      raise exception using errcode='22023',message='Invalid role command'; end if;
  elsif p_operation in ('grant_delegation','revoke_delegation') then
    if p_value not in ('roles.delegate','people.manage_learners','audit.read') or p_kind<>'' or p_id<>''
       or not exists(select 1 from pipstart_staff_private.roles where user_id=p_target and role_name='administrator') then
      raise exception using errcode='22023',message='Invalid delegation command'; end if;
  elsif p_operation in ('assign','unassign') then
    if p_value<>'' or p_kind not in ('course','module','lesson','quiz','partner','link','maintenance') or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then
      raise exception using errcode='22023',message='Invalid assignment command'; end if;
  elsif p_value<>'' or p_kind<>'' or p_id<>'' then
    raise exception using errcode='22023',message='Invalid membership command';
  end if;
  -- A retry can discover its own committed result without another receipt or
  -- mutation. Reusing an ID for a different command/reason is a hard conflict.
  select * into previous from pipstart_staff_private.audit where request_id=p_request;
  if found then
    if previous.actor_id is distinct from u or previous.target_id is distinct from p_target
       or previous.operation<>p_operation or previous.value<>p_value or previous.resource_kind<>p_kind
       or previous.resource_id<>p_id or previous.reason_code<>p_reason then
      raise exception using errcode='22023',message='Staff request conflict'; end if;
    return jsonb_build_object('status','already_recorded','request_id',p_request);
  end if;
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then
    raise exception using errcode='42501',message='Fresh verified staff evidence required'; end if;
  s:=(auth.jwt()->>'session_id')::uuid;
  select * into receipt from pipstart_staff_private.receipts
    where token_hash=sha256(convert_to(p_token,'UTF8')) for update;
  if not found or receipt.consumed_at is not null or receipt.expires_at<=clock_timestamp()
     or receipt.verified_at>clock_timestamp() or receipt.actor_id<>u or receipt.session_id<>s
     or receipt.target_id<>p_target or receipt.operation<>p_operation or receipt.value<>p_value
     or receipt.resource_kind<>p_kind or receipt.resource_id<>p_id then
    raise exception using errcode='42501',message='Fresh verified staff evidence required'; end if;
  if (p_operation='revoke_role' and p_value='owner') or p_operation='suspend' then
    if exists(select 1 from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.user_id=p_target and m.active and r.role_name='owner')
       and (select count(*) from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner')<=1 then
      raise exception using errcode='42501',message='Last active owner must remain'; end if;
  end if;
  case p_operation
    when 'grant_role' then
      insert into pipstart_staff_private.members(user_id) values(p_target) on conflict do nothing;
      insert into pipstart_staff_private.roles(user_id,role_name) values(p_target,p_value) on conflict do nothing;
    when 'revoke_role' then delete from pipstart_staff_private.roles where user_id=p_target and role_name=p_value;
    when 'grant_delegation' then insert into pipstart_staff_private.delegations(user_id,capability) values(p_target,p_value) on conflict do nothing;
    when 'revoke_delegation' then delete from pipstart_staff_private.delegations where user_id=p_target and capability=p_value;
    when 'assign' then insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values(p_target,p_kind,p_id) on conflict do nothing;
    when 'unassign' then delete from pipstart_staff_private.assignments where user_id=p_target and resource_kind=p_kind and resource_id=p_id;
    when 'suspend' then update pipstart_staff_private.members set active=false where user_id=p_target and active;
    when 'resume' then update pipstart_staff_private.members set active=true where user_id=p_target and not active;
  end case;
  get diagnostics changed_rows=row_count;
  if p_operation='revoke_role' and changed_rows>0 then
    if p_value='administrator' then
      delete from pipstart_staff_private.delegations where user_id=p_target;
    end if;
    if not exists(select 1 from pipstart_staff_private.roles where user_id=p_target) then
      delete from pipstart_staff_private.delegations where user_id=p_target;
      delete from pipstart_staff_private.assignments where user_id=p_target;
      update pipstart_staff_private.members set active=false where user_id=p_target;
    end if;
  end if;
  update pipstart_staff_private.receipts set consumed_at=clock_timestamp() where token_hash=receipt.token_hash;
  insert into pipstart_staff_private.audit(actor_id,request_id,operation,target_id,value,resource_kind,resource_id,reason_code,outcome)
    values(u,p_request,p_operation,p_target,p_value,p_kind,p_id,p_reason,case when changed_rows>0 then 'changed' else 'unchanged' end);
  return jsonb_build_object('status',case when changed_rows>0 then 'changed' else 'unchanged' end,'request_id',p_request);
end;
$$;

create function public.pipstart_staff_audit_page(p_before timestamptz default null,p_before_id uuid default null,p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  perform pipstart_staff_private.require_capability('audit.read');
  if p_limit is null or p_limit<1 or p_limit>100 or (p_before is null)<>(p_before_id is null) then
    raise exception using errcode='22023',message='Invalid audit page'; end if;
  select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc,a.id desc),'[]'::jsonb) into result from (
    select id,created_at,actor_id,request_id,operation,target_id,value,resource_kind,resource_id,reason_code,outcome
    from pipstart_staff_private.audit where p_before is null or (created_at,id)<(p_before,p_before_id)
    order by created_at desc,id desc limit p_limit
  ) a;
  return result;
end;
$$;

revoke all on all functions in schema pipstart_staff_private from public, anon, authenticated, service_role;
revoke all on function public.pipstart_staff_access(text,text) from public, anon, authenticated, service_role;
revoke all on function public.pipstart_staff_change(uuid,text,text,text,text,text,uuid,text) from public, anon, authenticated, service_role;
revoke all on function public.pipstart_staff_audit_page(timestamptz,uuid,integer) from public, anon, authenticated, service_role;
grant execute on function public.pipstart_staff_access(text,text) to authenticated;
grant execute on function public.pipstart_staff_change(uuid,text,text,text,text,text,uuid,text) to authenticated;
grant execute on function public.pipstart_staff_audit_page(timestamptz,uuid,integer) to authenticated;
commit;
