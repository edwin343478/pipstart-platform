-- Paused Owner maintenance of operator-prepared staff requests only.
-- No request creation, bootstrap, control change, provider call or activation.
begin;
do $$ begin
 if to_regprocedure('pipstart_staff_private.account_operation_take(uuid,text,text)') is null
 or to_regprocedure('pipstart_staff_private.account_owner_session(uuid,uuid)') is null
 or not exists(select 1 from pipstart_staff_private.control where singleton and not enabled) then
 raise exception 'Accepted paused staff maintenance schema required'; end if;
end $$;
create table pipstart_staff_private.maintenance_permits (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references pipstart_staff_private.account_operations(request_id) on delete restrict,
 mode text not null check(mode in ('dispatch','inspect')),
 actor_id uuid not null, session_id uuid not null,
 receipt_hash bytea not null unique check(octet_length(receipt_hash)=32),
 permit_hash bytea not null unique check(octet_length(permit_hash)=32),
 control_version bigint not null, expires_at timestamptz not null,
 created_at timestamptz not null default clock_timestamp(), consumed_at timestamptz,
 dispatch_id uuid, check(dispatch_id is null or (mode='dispatch' and consumed_at is not null))
);
alter table pipstart_staff_private.maintenance_permits enable row level security;
revoke all on pipstart_staff_private.maintenance_permits from public,anon,authenticated,service_role;
create function pipstart_staff_private.maintenance_permit_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if row(new.id,new.request_id,new.mode,new.actor_id,new.session_id,new.receipt_hash,new.permit_hash,new.control_version,new.expires_at,new.created_at)
 is distinct from row(old.id,old.request_id,old.mode,old.actor_id,old.session_id,old.receipt_hash,old.permit_hash,old.control_version,old.expires_at,old.created_at)
 or old.consumed_at is not null or new.consumed_at is null then
 raise exception using errcode='42501',message='Immutable one-use maintenance permit'; end if; return new;
end $$;
create trigger pipstart_maintenance_permit_guard before update on pipstart_staff_private.maintenance_permits for each row execute function pipstart_staff_private.maintenance_permit_guard();
create trigger pipstart_maintenance_permit_no_delete before delete on pipstart_staff_private.maintenance_permits for each row execute function pipstart_staff_private.immutable_audit();
-- Caller identity always comes from the verified user JWT, never posted actor IDs.
create function pipstart_staff_private.maintenance_proof(p_request uuid,p_mode text,p_token text)
returns pipstart_staff_private.receipts language plpgsql security definer set search_path='' as $$
declare proof pipstart_staff_private.receipts%rowtype; s uuid; r pipstart_staff_private.account_operations%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton and not enabled for update;
 if not found or current_setting('role',true) is distinct from 'authenticated'
 or auth.jwt()->>'role' is distinct from 'authenticated' or auth.jwt()->>'aal' is distinct from 'aal2'
 or p_token is null or p_token !~ '^[a-f0-9]{64}$' or p_mode is null or p_mode not in ('dispatch','inspect') then
 raise exception using errcode='42501',message='Paused bound Owner proof required'; end if;
 begin s:=(auth.jwt()->>'session_id')::uuid; exception when invalid_text_representation then
 raise exception using errcode='42501',message='Paused bound Owner proof required'; end;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found or r.operation not in ('auth_suspend','auth_resume') or r.target_id=auth.uid() then
 raise exception using errcode='42501',message='Reviewed staff request required'; end if;
 select * into proof from pipstart_staff_private.receipts where token_hash=sha256(convert_to(p_token,'UTF8')) for update;
 if not found or proof.actor_id is distinct from auth.uid() or proof.session_id is distinct from s
 or proof.consumed_at is not null or proof.expires_at<=clock_timestamp() or proof.verified_at>clock_timestamp()
 or proof.operation is distinct from 'account_'||p_mode or proof.target_id is distinct from r.target_id
 or proof.value is distinct from r.operation or proof.resource_kind is distinct from 'maintenance'
 or proof.resource_id is distinct from p_request::text
 or not pipstart_staff_private.account_owner_session(proof.actor_id,proof.session_id)
 or not exists(select 1 from auth.mfa_amr_claims where session_id=s and authentication_method='totp' and updated_at=proof.verified_at) then
 raise exception using errcode='42501',message='Paused bound Owner proof required'; end if;
 return proof;
end $$;
create function public.pipstart_staff_maintenance_review(p_request uuid,p_mode text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r pipstart_staff_private.account_operations%rowtype;
begin
 perform pipstart_staff_private.maintenance_proof(p_request,p_mode,p_token);
 select * into r from pipstart_staff_private.account_operations where request_id=p_request;
 return jsonb_build_object('request_id',r.request_id,'target_id',r.target_id,'operation',r.operation,'suspend_until',r.suspend_until,'reason',r.reason_code,'state',r.status,'status','reviewed');
end $$;
create function public.pipstart_staff_maintenance_claim(p_request uuid,p_mode text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare proof pipstart_staff_private.receipts%rowtype; nonce text; permit_id uuid; v bigint;
begin
 proof:=pipstart_staff_private.maintenance_proof(p_request,p_mode,p_token);
 select version into v from pipstart_staff_private.control where singleton;
 nonce:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into pipstart_staff_private.maintenance_permits(request_id,mode,actor_id,session_id,receipt_hash,permit_hash,control_version,expires_at)
 values(p_request,p_mode,proof.actor_id,proof.session_id,proof.token_hash,sha256(convert_to(nonce,'UTF8')),v,proof.expires_at) returning id into permit_id;
 return jsonb_build_object('request_id',p_request,'permit_id',permit_id,'permit',nonce,'expires_at',proof.expires_at,'status','execution_permitted');
exception when unique_violation then raise exception using errcode='42501',message='Maintenance proof already claimed';
end $$;
-- A service credential cannot create a user proof or mint an execution permit.
create function public.pipstart_staff_maintenance_take(p_request uuid,p_permit_id uuid,p_permit text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare permit pipstart_staff_private.maintenance_permits%rowtype; reply jsonb; c pipstart_staff_private.control%rowtype;
begin
 if current_setting('role',true) is distinct from 'service_role' or auth.jwt()->>'role' is distinct from 'service_role'
 or p_permit is null or p_permit !~ '^[a-f0-9]{64}$' or p_token is null or p_token !~ '^[a-f0-9]{64}$' then
 raise exception using errcode='42501',message='Bound maintenance service permit required'; end if;
 select * into c from pipstart_staff_private.control where singleton for update;
 select * into permit from pipstart_staff_private.maintenance_permits where id=p_permit_id for update;
 if not found or permit.request_id is distinct from p_request or permit.consumed_at is not null
 or permit.permit_hash<>sha256(convert_to(p_permit,'UTF8')) or permit.receipt_hash<>sha256(convert_to(p_token,'UTF8'))
 or permit.expires_at<=clock_timestamp() or c.enabled or c.version is distinct from permit.control_version then
 raise exception using errcode='42501',message='Bound maintenance service permit required'; end if;
 -- Serialize suspend dispatches across targets while any earlier result is unknown.
 -- Count usable Owners, not merely active membership rows for banned identities.
 if permit.mode='dispatch' and exists(select 1 from pipstart_staff_private.account_operations where request_id=p_request and operation='auth_suspend') then
  if exists(select 1 from pipstart_staff_private.account_operations where request_id<>p_request and status in ('dispatched','unknown')) then
   raise exception using errcode='42501',message='Resolve outstanding staff dispatch first'; end if;
  if exists(select 1 from pipstart_staff_private.account_operations o join pipstart_staff_private.roles r on r.user_id=o.target_id and r.role_name='owner' where o.request_id=p_request)
   and not exists(select 1 from pipstart_staff_private.roles r join pipstart_staff_private.members m using(user_id) join auth.users a on a.id=m.user_id
    where r.role_name='owner' and m.active and (a.banned_until is null or a.banned_until<=clock_timestamp())
    and m.user_id<>(select target_id from pipstart_staff_private.account_operations where request_id=p_request)) then
   raise exception using errcode='42501',message='Another usable Owner must remain'; end if;
 end if;
 -- Existing primitive rechecks live Owner/session/factor/AMR, self/last Owner,
 -- target, expiry and control version; consumption and dispatch remain atomic.
 reply:=pipstart_staff_private.account_operation_take(p_request,permit.mode,p_token);
 if (permit.mode='dispatch' and reply->>'status' is distinct from 'dispatch_authorized')
 or (permit.mode='inspect' and reply->>'status' is distinct from 'inspection_authorized') then
 raise exception using errcode='42501',message='Maintenance request no longer executable'; end if;
 update pipstart_staff_private.maintenance_permits set consumed_at=clock_timestamp(),dispatch_id=case when permit.mode='dispatch' then (reply->>'dispatch_id')::uuid else null end where id=permit.id;
 return reply;
end $$;
create function public.pipstart_staff_maintenance_result(p_request uuid,p_permit_id uuid,p_permit text,p_dispatch uuid,p_outcome text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare permit pipstart_staff_private.maintenance_permits%rowtype;
begin
 if current_setting('role',true) is distinct from 'service_role' or auth.jwt()->>'role' is distinct from 'service_role'
 or p_permit is null or p_permit !~ '^[a-f0-9]{64}$' or p_outcome is null or p_outcome not in ('succeeded','unknown') then
 raise exception using errcode='42501',message='Bound maintenance result required'; end if;
 select * into permit from pipstart_staff_private.maintenance_permits where id=p_permit_id for update;
 if not found or permit.request_id is distinct from p_request or permit.mode<>'dispatch' or permit.consumed_at is null
 or permit.permit_hash<>sha256(convert_to(p_permit,'UTF8')) or p_dispatch is null or permit.dispatch_id is distinct from p_dispatch then
 raise exception using errcode='42501',message='Bound maintenance result required'; end if;
 -- Late outcomes may be recorded after pause/version/authorization changes;
 -- this never authorizes another provider call or resolves uncertainty by observation.
 return pipstart_staff_private.account_operation_result(p_request,p_dispatch,p_outcome);
end $$;
revoke all on function pipstart_staff_private.maintenance_permit_guard(),pipstart_staff_private.maintenance_proof(uuid,text,text),public.pipstart_staff_maintenance_review(uuid,text,text),public.pipstart_staff_maintenance_claim(uuid,text,text),public.pipstart_staff_maintenance_take(uuid,uuid,text,text),public.pipstart_staff_maintenance_result(uuid,uuid,text,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_maintenance_review(uuid,text,text),public.pipstart_staff_maintenance_claim(uuid,text,text) to authenticated;
grant execute on function public.pipstart_staff_maintenance_take(uuid,uuid,text,text),public.pipstart_staff_maintenance_result(uuid,uuid,text,uuid,text) to service_role;
commit;
