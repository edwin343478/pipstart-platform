-- MP03 private retirement completion. No API grant, provider call or activation.
begin;
do $$ begin
 if not exists(select 1 from information_schema.columns where table_schema='auth' and table_name='users' and column_name='deleted_at' and data_type='timestamp with time zone')
  or not exists(select 1 from pg_proc where oid=to_regprocedure('pipstart_staff_private.actor()') and encode(sha256(convert_to(replace(prosrc,E'\r\n',E'\n'),'UTF8')),'hex')='b45db8e240bf0d44732f27d62da91bb013ff93ba710cd59a8c7a6b2324f77058')
  or not exists(select 1 from pg_proc where oid=to_regprocedure('pipstart_staff_private.account_owner_session(uuid,uuid)') and encode(sha256(convert_to(replace(prosrc,E'\r\n',E'\n'),'UTF8')),'hex')='5474b3213a7a4273192fa757d1da4730d7888566108f9eb2b1eb7c4f584ebb2d')
  or exists(select 1 from pipstart_staff_private.control where singleton and enabled) then
  raise exception 'Accepted paused bridge and compatible provider deletion marker required'; end if;
end $$;
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
  perform 1 from auth.sessions a join auth.users account on account.id=a.user_id join auth.mfa_factors f on f.id=a.factor_id and f.user_id=a.user_id
    where a.id=s and a.user_id=u and a.aal::text='aal2'
      and (a.not_after is null or a.not_after>clock_timestamp())
      and account.deleted_at is null
      and (account.banned_until is null or account.banned_until<=clock_timestamp())
      and f.factor_type::text='totp' and f.status::text='verified'
    for share of a,f,account;
  if not found then return null; end if;
  return u;
end;
$$;
create or replace function pipstart_staff_private.account_owner_session(p_user uuid,p_session uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform 1 from auth.sessions s
 join auth.mfa_factors f on f.id=s.factor_id and f.user_id=s.user_id
 join auth.users a on a.id=s.user_id
 join pipstart_staff_private.members m on m.user_id=a.id
 join pipstart_staff_private.roles r on r.user_id=m.user_id and r.role_name='owner'
 where s.id=p_session and s.user_id=p_user and m.active and s.aal::text='aal2'
  and (s.not_after is null or s.not_after>clock_timestamp())
  and a.deleted_at is null
  and (a.banned_until is null or a.banned_until<=clock_timestamp())
  and f.factor_type::text='totp' and f.status::text='verified'
 for share of s,f,a,m,r;
 return found;
end $$;

-- A still-valid old JWT must not restore the identifying display name or legacy
-- administrator flag on a provider-soft-deleted staff profile.
create function pipstart_staff_private.retired_profile_guard() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from auth.users where id=old.user_id and deleted_at is not null)
  and exists(select 1 from pipstart_staff_private.members where user_id=old.user_id)
  and (new.user_id is distinct from old.user_id or new.display_name<>'Former staff member' or new.role::text<>'learner') then
  raise exception using errcode='42501',message='Retired staff profile is retained without active access'; end if;
 return new;
end $$;
create trigger pipstart_retired_profile_guard before update on public.pipstart_profiles
 for each row execute function pipstart_staff_private.retired_profile_guard();

create function pipstart_staff_private.retired_preferences_guard() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from auth.users where id=old.user_id and deleted_at is not null)
  and exists(select 1 from pipstart_staff_private.members where user_id=old.user_id)
  and (new.user_id is distinct from old.user_id or new.educational_emails or new.marketing_emails) then
  raise exception using errcode='42501',message='Retired staff optional email remains disabled'; end if;
 return new;
end $$;
create trigger pipstart_retired_preferences_guard before update on public.pipstart_email_preferences
 for each row execute function pipstart_staff_private.retired_preferences_guard();

-- Trusted offline operator only. Provider soft deletion must already be visible.
-- This updates the retained application stub and journal atomically. It neither
-- removes Auth identities nor certifies complete erasure/anonymous audit history.
create function pipstart_staff_private.account_operation_finalize_retirement(p_request uuid,p_dispatch uuid,p_resolution text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r pipstart_staff_private.account_operations%rowtype; p public.pipstart_profiles%rowtype; e public.pipstart_email_preferences%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton and not enabled for update;
 if not found then raise exception using errcode='42501',message='Staff must remain paused'; end if;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found or r.operation<>'staff_retirement' or p_dispatch is null or p_dispatch is distinct from r.dispatch_id
  or p_resolution is null or p_resolution not in ('succeeded','observed_desired') then
  raise exception using errcode='22023',message='Exact retirement request/dispatch required'; end if;
 perform 1 from auth.users where id=r.target_id and deleted_at is not null for share;
 if not found then raise exception using errcode='42501',message='Provider-disabled retained identity required'; end if;
 if not exists(select 1 from pipstart_staff_private.members where user_id=r.target_id and not active)
  or exists(select 1 from pipstart_staff_private.roles where user_id=r.target_id)
  or exists(select 1 from pipstart_staff_private.delegations where user_id=r.target_id)
  or exists(select 1 from pipstart_staff_private.assignments where user_id=r.target_id) then
  raise exception using errcode='42501',message='Staff access must be removed first'; end if;
 if not exists(select 1 from pipstart_staff_private.members m
  join pipstart_staff_private.roles g on g.user_id=m.user_id and g.role_name='owner'
  join auth.users a on a.id=m.user_id
  join auth.mfa_factors f on f.user_id=a.id and f.factor_type::text='totp' and f.status::text='verified'
  where m.active and m.user_id<>r.target_id and a.deleted_at is null and (a.banned_until is null or a.banned_until<=clock_timestamp())) then
  raise exception using errcode='42501',message='Another active verified Owner must remain'; end if;
 select * into p from public.pipstart_profiles where user_id=r.target_id for update;
 if not found then raise exception using errcode='42501',message='Retained staff profile required'; end if;
 select * into e from public.pipstart_email_preferences where user_id=r.target_id for update;
 if not found then raise exception using errcode='42501',message='Retained staff preference record required'; end if;
 if r.status in ('succeeded','observed_desired') then
  if r.status<>p_resolution or p.display_name<>'Former staff member' or p.role::text<>'learner' or e.educational_emails or e.marketing_emails then
   raise exception using errcode='22023',message='Retirement replay conflict'; end if;
  return jsonb_build_object('request_id',p_request,'status','already_finalized','outcome',r.status);
 end if;
 if r.status not in ('dispatched','unknown') or (p_resolution='observed_desired' and r.status<>'unknown') then
  raise exception using errcode='42501',message='Retirement resolution not authorized'; end if;
 update public.pipstart_profiles set display_name='Former staff member',role='learner' where user_id=r.target_id;
 update public.pipstart_email_preferences set educational_emails=false,marketing_emails=false where user_id=r.target_id;
 perform pipstart_staff_private.account_operation_result(p_request,p_dispatch,p_resolution);
 return jsonb_build_object('request_id',p_request,'status','finalized','outcome',p_resolution);
end $$;
revoke all on function pipstart_staff_private.actor(),pipstart_staff_private.account_owner_session(uuid,uuid),
 pipstart_staff_private.retired_profile_guard(),pipstart_staff_private.retired_preferences_guard(),pipstart_staff_private.account_operation_finalize_retirement(uuid,uuid,text)
 from public,anon,authenticated,service_role;
commit;
