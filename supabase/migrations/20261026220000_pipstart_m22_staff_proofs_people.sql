-- MP03 additive proof ledger/read model. No bootstrap, grants to people, activation or Auth write.
begin;

-- These provider-owned columns were inspected locally. A missing/incompatible
-- hosted Auth schema must stop acceptance, not fall back to browser timestamps.
do $$
begin
  if to_regclass('auth.mfa_amr_claims') is null or to_regclass('auth.mfa_factors') is null
     or not exists(select 1 from information_schema.columns where table_schema='auth' and table_name='sessions' and column_name='factor_id' and data_type='uuid')
     or not exists(select 1 from information_schema.columns where table_schema='auth' and table_name='sessions' and column_name='not_after' and data_type='timestamp with time zone') then
    raise exception 'Compatible provider Auth session/AMR schema required';
  end if;
end;
$$;

-- Tighten all existing MP02 RPCs too, including direct PostgREST calls. An old
-- signed AAL2 token does not revive a removed factor or downgraded session.
create or replace function pipstart_staff_private.actor() returns uuid
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
  if not exists(select 1 from pipstart_staff_private.control where singleton and enabled)
     or not exists(select 1 from pipstart_staff_private.members where user_id=u and active)
     or not exists(select 1 from pipstart_staff_private.roles where user_id=u) then return null; end if;
  perform 1 from auth.sessions a join auth.mfa_factors f on f.id=a.factor_id and f.user_id=a.user_id
    where a.id=s and a.user_id=u and a.aal::text='aal2'
      and (a.not_after is null or a.not_after>clock_timestamp())
      and f.factor_type::text='totp' and f.status::text='verified'
    for share of a,f;
  if not found then return null; end if;
  return u;
end;
$$;

create table pipstart_staff_private.proof_uses (
  session_id uuid not null,
  amr_id uuid not null,
  verified_at timestamptz not null,
  verification_second bigint not null check (verification_second=floor(extract(epoch from verified_at))::bigint),
  token_hash bytea not null unique references pipstart_staff_private.receipts(token_hash) on delete restrict,
  -- JWT AMR time has integer-second precision. Two provider updates inside one
  -- second must not turn one signed proof into two usable receipts.
  primary key(session_id,verification_second)
);
alter table pipstart_staff_private.proof_uses enable row level security;
revoke all on pipstart_staff_private.proof_uses from public,anon,authenticated,service_role;
create trigger pipstart_staff_proof_immutable before update or delete on pipstart_staff_private.proof_uses
for each row execute function pipstart_staff_private.immutable_audit();

-- The token is 32 random bytes supplied by the client; it grants nothing alone.
-- Provider state plus the signed user-context JWT supply identity/time. No actor,
-- session, verified_at, assurance or role is accepted from a posted form.
create function public.pipstart_staff_receipt(
  p_target uuid,p_operation text,p_value text,p_kind text,p_id text,p_token text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; s uuid; a uuid; t timestamptz; stamp text; v_hash bytea;
  prior pipstart_staff_private.receipts%rowtype; owner_actor boolean;
begin
  perform 1 from pipstart_staff_private.control where singleton for update;
  u:=pipstart_staff_private.actor();
  owner_actor:=pipstart_staff_private.has_capability('roles.manage');
  if u is null or (not owner_actor and not pipstart_staff_private.has_capability('roles.delegate')) then
    raise exception using errcode='42501',message='Staff proof not authorized'; end if;
  if p_target is null or p_operation is null or p_value is null or p_kind is null or p_id is null
     or p_token is null or p_token !~ '^[a-f0-9]{64}$'
     or p_operation not in ('grant_role','revoke_role','grant_delegation','revoke_delegation','assign','unassign','suspend','resume')
     or not exists(select 1 from auth.users where id=p_target) then
    raise exception using errcode='22023',message='Invalid staff proof target'; end if;
  if not owner_actor and (p_operation not in ('grant_role','revoke_role')
     or p_value not in ('author','reviewer','editor','moderator','affiliate_manager') or p_target=u
     or exists(select 1 from pipstart_staff_private.roles where user_id=p_target and role_name in ('owner','administrator'))) then
    raise exception using errcode='42501',message='Delegation ceiling exceeded'; end if;
  if p_operation='grant_role' and p_target=u then
    raise exception using errcode='42501',message='Self-grant is not allowed'; end if;
  if p_operation in ('grant_role','revoke_role') then
    if p_value not in ('owner','administrator','author','reviewer','editor','moderator','affiliate_manager') or p_kind<>'' or p_id<>'' then
      raise exception using errcode='22023',message='Invalid role proof'; end if;
  elsif p_operation in ('grant_delegation','revoke_delegation') then
    if p_value not in ('roles.delegate','people.manage_learners','audit.read') or p_kind<>'' or p_id<>''
       or not exists(select 1 from pipstart_staff_private.roles where user_id=p_target and role_name='administrator') then
      raise exception using errcode='22023',message='Invalid delegation proof'; end if;
  elsif p_operation in ('assign','unassign') then
    if p_value<>'' or p_kind not in ('course','module','lesson','quiz','partner','link','maintenance')
       or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then
      raise exception using errcode='22023',message='Invalid assignment proof'; end if;
  elsif p_value<>'' or p_kind<>'' or p_id<>'' then
    raise exception using errcode='22023',message='Invalid membership proof';
  end if;
  s:=(auth.jwt()->>'session_id')::uuid;
  -- The provider binds this AMR row to this exact session. Supabase issues the
  -- signed AMR timestamp from UpdatedAt.Unix(), not a client clock or JWT iat.
  select c.id,c.updated_at into a,t from auth.mfa_amr_claims c
    where c.session_id=s and c.authentication_method='totp' for share;
  if not found or t>clock_timestamp() or t<=clock_timestamp()-interval '5 minutes'
     or coalesce(jsonb_typeof(auth.jwt()->'amr'),'')<>'array' then
    raise exception using errcode='42501',message='Fresh provider verification required'; end if;
  if (select count(*) from jsonb_array_elements(auth.jwt()->'amr') e where e->>'method'='totp')<>1 then
    raise exception using errcode='42501',message='Fresh provider verification required'; end if;
  select e->>'timestamp' into stamp from jsonb_array_elements(auth.jwt()->'amr') e where e->>'method'='totp';
  if stamp is null or stamp !~ '^[0-9]{1,12}$' then
    raise exception using errcode='42501',message='Fresh provider verification required'; end if;
  if stamp::bigint<>floor(extract(epoch from t))::bigint then
    raise exception using errcode='42501',message='Session verification has changed'; end if;
  v_hash:=sha256(convert_to(p_token,'UTF8'));
  select * into prior from pipstart_staff_private.receipts where token_hash=v_hash for update;
  if found then
    if prior.actor_id=u and prior.session_id=s and prior.target_id=p_target and prior.operation=p_operation
       and prior.value=p_value and prior.resource_kind=p_kind and prior.resource_id=p_id
       and prior.verified_at=t and prior.expires_at>clock_timestamp() and prior.consumed_at is null then
      return jsonb_build_object('status','already_issued','expires_at',prior.expires_at);
    end if;
    raise exception using errcode='42501',message='Staff proof conflict';
  end if;
  perform pipstart_staff_private.issue_receipt(u,s,p_operation,p_target,p_value,p_kind,p_id,v_hash,t);
  insert into pipstart_staff_private.proof_uses(session_id,amr_id,verified_at,verification_second,token_hash)
    values(s,a,t,floor(extract(epoch from t))::bigint,v_hash);
  return jsonb_build_object('status','issued','expires_at',t+interval '5 minutes');
exception when unique_violation then
  raise exception using errcode='42501',message='Verification evidence already used';
end;
$$;

-- A bounded profile read, not an Auth user export. Email, raw metadata, factors,
-- credentials, progress, IP/device/session data and ban status are not returned.
create function public.pipstart_staff_people(p_after uuid default null,p_limit integer default 25,p_query text default '',p_user uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare rows jsonb; next_id uuid;
begin
  perform pipstart_staff_private.require_capability('people.read');
  if p_limit is null or p_limit<1 or p_limit>50 or p_query is null
     or char_length(p_query)>60 or p_query<>btrim(p_query)
     or (p_query<>'' and char_length(p_query)<2)
     or (p_user is not null and (p_after is not null or p_query<>'')) then
    raise exception using errcode='22023',message='Invalid people page'; end if;
  with page as (
    select p.user_id,p.display_name,p.created_at,m.active as staff_active,
      coalesce((select jsonb_agg(r.role_name order by r.role_name) from pipstart_staff_private.roles r where r.user_id=p.user_id),'[]'::jsonb) as staff_roles
    from public.pipstart_profiles p left join pipstart_staff_private.members m on m.user_id=p.user_id
    where (p_after is null or p.user_id>p_after) and (p_user is null or p.user_id=p_user)
      and (p_query='' or left(lower(p.display_name),char_length(p_query))=lower(p_query))
    order by p.user_id limit p_limit+1
  ), visible as (select * from page order by user_id limit p_limit)
  select coalesce((select jsonb_agg(to_jsonb(v) order by v.user_id) from visible v),'[]'::jsonb),
    case when (select count(*) from page)>p_limit then (select user_id from visible order by user_id desc limit 1) else null end
    into rows,next_id;
  return jsonb_build_object('items',rows,'next_after',next_id);
end;
$$;

revoke all on function public.pipstart_staff_receipt(uuid,text,text,text,text,text) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_staff_people(uuid,integer,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_receipt(uuid,text,text,text,text,text) to authenticated;
grant execute on function public.pipstart_staff_people(uuid,integer,text,uuid) to authenticated;
commit;
