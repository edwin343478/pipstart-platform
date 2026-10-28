-- MP03 private operator/provider bridge. No endpoint, provider call or enablement.
begin;
-- Accepted actor fingerprint and compatible provider column checks are appended
-- by the preparation helper before the final source manifest is sealed.
do $$ begin
 if not exists(select 1 from information_schema.columns where table_schema='auth' and table_name='users' and column_name='banned_until' and data_type='timestamp with time zone')
  or not exists(select 1 from pg_proc where oid=to_regprocedure('pipstart_staff_private.actor()') and encode(sha256(convert_to(replace(prosrc,E'\r\n',E'\n'),'UTF8')),'hex')='6db34990df30283c83a6f8c2777143b905e4fc82f9dbe784029fdbd515920b07')
  or exists(select 1 from pipstart_staff_private.control where singleton and enabled)
  or to_regprocedure('pipstart_staff_private.account_operation_claim(uuid)') is null then
  raise exception 'Accepted paused staff journal, actor and provider schema required'; end if;
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
      and (account.banned_until is null or account.banned_until<=clock_timestamp())
      and f.factor_type::text='totp' and f.status::text='verified'
    for share of a,f,account;
  if not found then return null; end if;
  return u;
end;
$$;

-- This narrowly scoped check deliberately works while staff control is paused.
-- It grants no staff navigation or general capability and accepts no public actor.
create function pipstart_staff_private.account_owner_session(p_user uuid,p_session uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform 1 from auth.sessions s
 join auth.mfa_factors f on f.id=s.factor_id and f.user_id=s.user_id
 join auth.users a on a.id=s.user_id
 join pipstart_staff_private.members m on m.user_id=a.id
 join pipstart_staff_private.roles r on r.user_id=m.user_id and r.role_name='owner'
 where s.id=p_session and s.user_id=p_user and m.active and s.aal::text='aal2'
  and (s.not_after is null or s.not_after>clock_timestamp())
  and (a.banned_until is null or a.banned_until<=clock_timestamp())
  and f.factor_type::text='totp' and f.status::text='verified'
 for share of s,f,a,m,r;
 return found;
end $$;

-- Fresh signed provider AMR is required for each request and each mode. This is
-- only a receipt issuer: authenticated callers cannot claim, execute or record
-- provider results. A service key alone cannot mint this user-context proof.
create function public.pipstart_staff_account_receipt(p_request uuid,p_mode text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; s uuid; a uuid; t timestamptz; stamp text; h bytea;
 r pipstart_staff_private.account_operations%rowtype; prior pipstart_staff_private.receipts%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton and not enabled for update;
 if not found or current_setting('role',true) is distinct from 'authenticated'
  or auth.jwt()->>'role' is distinct from 'authenticated' or auth.jwt()->>'aal' is distinct from 'aal2' then
  raise exception using errcode='42501',message='Paused Owner authorization required'; end if;
 u:=auth.uid();
 begin s:=(auth.jwt()->>'session_id')::uuid;
 exception when invalid_text_representation then raise exception using errcode='42501',message='Paused Owner authorization required'; end;
 if not pipstart_staff_private.account_owner_session(u,s) then
  raise exception using errcode='42501',message='Paused Owner authorization required'; end if;
 if p_request is null or p_mode is null or p_mode not in ('dispatch','inspect') or p_token is null or p_token !~ '^[a-f0-9]{64}$' then
  raise exception using errcode='22023',message='Invalid account authorization'; end if;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found or r.operation not in ('auth_suspend','auth_resume') or r.target_id=u
  or (p_mode='dispatch' and (r.status<>'prepared' or (r.operation='auth_suspend' and r.suspend_until>clock_timestamp()+interval '365 days'))) then
  raise exception using errcode='42501',message='Account request not authorized'; end if;
 select c.id,c.updated_at into a,t from auth.mfa_amr_claims c where c.session_id=s and c.authentication_method='totp' for share;
 if not found or t>clock_timestamp() or t<=clock_timestamp()-interval '5 minutes'
  or coalesce(jsonb_typeof(auth.jwt()->'amr'),'')<>'array' then
  raise exception using errcode='42501',message='Fresh provider verification required'; end if;
 if (select count(*) from jsonb_array_elements(auth.jwt()->'amr') e where e->>'method'='totp')<>1 then
  raise exception using errcode='42501',message='Fresh provider verification required'; end if;
 select e->>'timestamp' into stamp from jsonb_array_elements(auth.jwt()->'amr') e where e->>'method'='totp';
 if stamp is null or stamp !~ '^[0-9]{1,12}$' or stamp::bigint<>floor(extract(epoch from t))::bigint then
  raise exception using errcode='42501',message='Session verification has changed'; end if;
 h:=sha256(convert_to(p_token,'UTF8'));
 select * into prior from pipstart_staff_private.receipts where token_hash=h for update;
 if found then
  if prior.actor_id=u and prior.session_id=s and prior.operation='account_'||p_mode
   and prior.target_id=r.target_id and prior.value=r.operation and prior.resource_kind='maintenance'
   and prior.resource_id=p_request::text and prior.verified_at=t and prior.expires_at>clock_timestamp() and prior.consumed_at is null then
   return jsonb_build_object('status','already_issued','expires_at',prior.expires_at); end if;
  raise exception using errcode='42501',message='Account proof conflict';
 end if;
 perform pipstart_staff_private.issue_receipt(u,s,'account_'||p_mode,r.target_id,r.operation,'maintenance',p_request::text,h,t);
 insert into pipstart_staff_private.proof_uses(session_id,amr_id,verified_at,verification_second,token_hash)
 values(s,a,t,floor(extract(epoch from t))::bigint,h);
 return jsonb_build_object('status','issued','expires_at',t+interval '5 minutes');
exception when unique_violation then
 raise exception using errcode='42501',message='Verification evidence already used';
end $$;

-- Trusted operator transport only, never a public/service-role dispatch RPC.
-- Receipt consumption and durable dispatch claim share the same transaction.
create function pipstart_staff_private.account_operation_take(p_request uuid,p_mode text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r pipstart_staff_private.account_operations%rowtype; proof pipstart_staff_private.receipts%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton and not enabled for update;
 if not found then raise exception using errcode='42501',message='Staff must remain paused'; end if;
 if p_request is null or p_mode is null or p_mode not in ('dispatch','inspect') or p_token is null or p_token !~ '^[a-f0-9]{64}$' then
  raise exception using errcode='22023',message='Invalid account authorization'; end if;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found or r.operation not in ('auth_suspend','auth_resume') then
  raise exception using errcode='42501',message='Account request not authorized'; end if;
 select * into proof from pipstart_staff_private.receipts where token_hash=sha256(convert_to(p_token,'UTF8')) for update;
 if not found or proof.consumed_at is not null or proof.expires_at<=clock_timestamp() or proof.verified_at>clock_timestamp()
  or proof.operation<>'account_'||p_mode or proof.target_id<>r.target_id or proof.value<>r.operation
  or proof.resource_kind<>'maintenance' or proof.resource_id<>p_request::text or proof.actor_id=r.target_id
  or not pipstart_staff_private.account_owner_session(proof.actor_id,proof.session_id)
  or not exists(select 1 from auth.mfa_amr_claims where session_id=proof.session_id and authentication_method='totp' and updated_at=proof.verified_at) then
  raise exception using errcode='42501',message='Fresh bound Owner evidence required'; end if;
 update pipstart_staff_private.receipts set consumed_at=clock_timestamp() where token_hash=proof.token_hash;
 if p_mode='dispatch' then return pipstart_staff_private.account_operation_claim(p_request); end if;
 return jsonb_build_object('request_id',p_request,'status','inspection_authorized','target_id',r.target_id,'operation',r.operation,'suspend_until',r.suspend_until,'state',r.status);
end $$;
revoke all on function pipstart_staff_private.account_owner_session(uuid,uuid),pipstart_staff_private.account_operation_take(uuid,text,text) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_staff_account_receipt(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_account_receipt(uuid,text,text) to authenticated;
commit;
