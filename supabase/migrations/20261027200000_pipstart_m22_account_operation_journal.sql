-- MP03 dormant operator journal. No API grants, provider call or staff activation.
begin;
do $$ begin
 if to_regclass('pipstart_staff_private.members') is null
  or to_regprocedure('pipstart_staff_private.immutable_audit()') is null
  or exists(select 1 from pipstart_staff_private.control where singleton and enabled) then
  raise exception 'Accepted default-closed staff core required'; end if;
end $$;
create table pipstart_staff_private.account_operations (
 request_id uuid primary key,
 target_id uuid not null,
 operation text not null check(operation in ('auth_suspend','auth_resume','factor_recovery','staff_retirement')),
 factor_id uuid,
 suspend_until timestamptz,
 reason_code text not null check(reason_code in ('security_response','access_change','owner_recovery','staff_retirement')),
 control_version bigint not null check(control_version>=0),
 created_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null,
 updated_at timestamptz not null default clock_timestamp(),
 revision integer not null default 1 check(revision>0),
 status text not null default 'prepared' check(status in ('prepared','dispatched','unknown','succeeded','failed','cancelled','observed_desired','observed_other')),
 dispatch_id uuid,
 provenance text not null default 'trusted_db_operator' check(provenance='trusted_db_operator'),
 check(expires_at=created_at+interval '5 minutes'),
 check((operation='factor_recovery')=(factor_id is not null)),
 check((operation='auth_suspend')=(suspend_until is not null)),
 check(suspend_until is null or (isfinite(suspend_until) and suspend_until>created_at)),
 check((status in ('prepared','cancelled'))=(dispatch_id is null))
);
-- One unresolved operation per staff identity; no FK to Auth/audit identities is
-- added merely for this historical journal. Existing staff deletion FK stays.
create unique index pipstart_staff_account_operation_pending
 on pipstart_staff_private.account_operations(target_id)
 where status in ('prepared','dispatched','unknown');
create table pipstart_staff_private.account_operation_events (
 request_id uuid not null references pipstart_staff_private.account_operations(request_id) on delete restrict,
 revision integer not null check(revision>0),
 recorded_at timestamptz not null default clock_timestamp(),
 status text not null check(status in ('prepared','dispatched','unknown','succeeded','failed','cancelled','observed_desired','observed_other')),
 primary key(request_id,revision)
);
alter table pipstart_staff_private.account_operations enable row level security;
alter table pipstart_staff_private.account_operation_events enable row level security;
revoke all on pipstart_staff_private.account_operations,pipstart_staff_private.account_operation_events from public,anon,authenticated,service_role;
create trigger pipstart_staff_account_event_immutable before update or delete
 on pipstart_staff_private.account_operation_events for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_staff_account_operation_no_delete before delete
 on pipstart_staff_private.account_operations for each row execute function pipstart_staff_private.immutable_audit();
create function pipstart_staff_private.account_operation_guard() returns trigger
language plpgsql set search_path='' as $$
begin
 if row(new.request_id,new.target_id,new.operation,new.factor_id,new.suspend_until,new.reason_code,new.control_version,new.created_at,new.expires_at,new.provenance)
  is distinct from row(old.request_id,old.target_id,old.operation,old.factor_id,old.suspend_until,old.reason_code,old.control_version,old.created_at,old.expires_at,old.provenance)
  or new.revision<>old.revision+1
  or (old.dispatch_id is not null and new.dispatch_id is distinct from old.dispatch_id)
  or not ((old.status='prepared' and new.status in ('dispatched','cancelled'))
   or (old.status='dispatched' and new.status in ('succeeded','failed','unknown'))
   or (old.status='unknown' and new.status in ('succeeded','failed','observed_desired','observed_other'))) then
  raise exception using errcode='42501',message='Invalid account journal transition'; end if;
 new.updated_at:=clock_timestamp(); return new;
end $$;
create trigger pipstart_staff_account_operation_guard before update
 on pipstart_staff_private.account_operations for each row execute function pipstart_staff_private.account_operation_guard();

-- Operator-only validation, not a substitute for a human approval, fresh MFA or
-- server/user-context authority in the future executor. All targets are staff
-- records; delegated learner administration is not connected by this migration.
create function pipstart_staff_private.account_operation_target(p_target uuid,p_operation text,p_factor uuid,p_until timestamptz)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users a join pipstart_staff_private.members m on m.user_id=a.id where a.id=p_target) then
  raise exception using errcode='42501',message='Reviewed staff identity required'; end if;
 if p_operation='factor_recovery' and not exists(select 1 from auth.mfa_factors where id=p_factor and user_id=p_target and factor_type::text='totp' and status::text='verified') then
  raise exception using errcode='42501',message='Exact verified staff factor required'; end if;
 if p_operation='auth_suspend' then
  if p_until is null or not isfinite(p_until) or p_until<=clock_timestamp() then
   raise exception using errcode='22023',message='Future suspension expiry required'; end if;
  if exists(select 1 from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.user_id=p_target and m.active and r.role_name='owner')
   and (select count(*) from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner')<=1 then
   raise exception using errcode='42501',message='Last active Owner must remain'; end if;
 end if;
 if p_operation='staff_retirement' and (exists(select 1 from pipstart_staff_private.members where user_id=p_target and active)
  or exists(select 1 from pipstart_staff_private.roles where user_id=p_target)
  or exists(select 1 from pipstart_staff_private.delegations where user_id=p_target)
  or exists(select 1 from pipstart_staff_private.assignments where user_id=p_target)) then
  raise exception using errcode='42501',message='Audited removal of staff access required first'; end if;
end $$;

create function pipstart_staff_private.account_operation_prepare(p_request uuid,p_target uuid,p_operation text,p_factor uuid,p_until timestamptz,p_reason text,p_version bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c pipstart_staff_private.control%rowtype; r pipstart_staff_private.account_operations%rowtype; t timestamptz;
begin
 select * into c from pipstart_staff_private.control where singleton for update;
 if p_request is null or p_target is null or p_version is null or p_version<0
  or p_operation is null or p_operation not in ('auth_suspend','auth_resume','factor_recovery','staff_retirement')
  or p_reason is null or p_reason not in ('security_response','access_change','owner_recovery','staff_retirement')
  or (p_operation='factor_recovery')<>(p_factor is not null)
  or (p_operation='auth_suspend')<>(p_until is not null)
  or (p_operation in ('auth_suspend','auth_resume') and p_reason not in ('security_response','access_change'))
  or (p_operation='factor_recovery' and p_reason not in ('security_response','owner_recovery'))
  or (p_operation='staff_retirement' and p_reason<>'staff_retirement') then
  raise exception using errcode='22023',message='Invalid account journal intent'; end if;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if found then
  if row(r.target_id,r.operation,r.factor_id,r.suspend_until,r.reason_code,r.control_version)
   is distinct from row(p_target,p_operation,p_factor,p_until,p_reason,p_version) then
   raise exception using errcode='22023',message='Account journal request conflict'; end if;
  return jsonb_build_object('request_id',r.request_id,'status','already_recorded','state',r.status);
 end if;
 if c.enabled or c.version is distinct from p_version then
  raise exception using errcode='40001',message='Default-closed staff version changed'; end if;
 perform pipstart_staff_private.account_operation_target(p_target,p_operation,p_factor,p_until);
 t:=clock_timestamp();
 insert into pipstart_staff_private.account_operations(request_id,target_id,operation,factor_id,suspend_until,reason_code,control_version,created_at,expires_at,updated_at)
  values(p_request,p_target,p_operation,p_factor,p_until,p_reason,p_version,t,t+interval '5 minutes',t);
 insert into pipstart_staff_private.account_operation_events(request_id,revision,status) values(p_request,1,'prepared');
 return jsonb_build_object('request_id',p_request,'status','prepared','state','prepared');
exception when unique_violation then
 raise exception using errcode='42501',message='Unresolved account operation already exists';
end $$;

-- A lost claim response is not a permit to repeat the provider action. A second
-- claim returns no dispatch identity or executable target, even after success.
create function pipstart_staff_private.account_operation_claim(p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c pipstart_staff_private.control%rowtype; r pipstart_staff_private.account_operations%rowtype; d uuid;
begin
 select * into c from pipstart_staff_private.control where singleton for update;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found then raise exception using errcode='22023',message='Unknown account journal request'; end if;
 if r.status<>'prepared' then return jsonb_build_object('request_id',p_request,'status','not_dispatchable','state',r.status); end if;
 if c.enabled or c.version is distinct from r.control_version then raise exception using errcode='40001',message='Default-closed staff version changed'; end if;
 if r.expires_at<=clock_timestamp() then raise exception using errcode='42501',message='Account journal preparation expired'; end if;
 perform pipstart_staff_private.account_operation_target(r.target_id,r.operation,r.factor_id,r.suspend_until);
 d:=gen_random_uuid();
 update pipstart_staff_private.account_operations set status='dispatched',dispatch_id=d,revision=revision+1 where request_id=p_request returning * into r;
 insert into pipstart_staff_private.account_operation_events(request_id,revision,status) values(p_request,r.revision,r.status);
 return jsonb_build_object('request_id',p_request,'status','dispatch_authorized','dispatch_id',d,'target_id',r.target_id,'operation',r.operation,'factor_id',r.factor_id,'suspend_until',r.suspend_until);
end $$;

-- Record an exact provider acknowledgment, definitive rejection, uncertainty or
-- a trusted operator's later observation. Observed state is not proof of causality.
-- Recording outcomes remains possible after a stop/control-version change.
create function pipstart_staff_private.account_operation_result(p_request uuid,p_dispatch uuid,p_result text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r pipstart_staff_private.account_operations%rowtype;
begin
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found or p_dispatch is null or p_dispatch is distinct from r.dispatch_id
  or p_result is null or p_result not in ('succeeded','failed','unknown','observed_desired','observed_other') then
  raise exception using errcode='22023',message='Account journal result binding mismatch'; end if;
 if r.status=p_result then return jsonb_build_object('request_id',p_request,'status','already_recorded','state',r.status); end if;
 if r.status not in ('dispatched','unknown') or (p_result in ('observed_desired','observed_other') and r.status<>'unknown') then
  raise exception using errcode='42501',message='Account journal result conflict'; end if;
 update pipstart_staff_private.account_operations set status=p_result,revision=revision+1 where request_id=p_request returning * into r;
 insert into pipstart_staff_private.account_operation_events(request_id,revision,status) values(p_request,r.revision,r.status);
 return jsonb_build_object('request_id',p_request,'status','recorded','state',r.status);
end $$;
create function pipstart_staff_private.account_operation_cancel(p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r pipstart_staff_private.account_operations%rowtype;
begin
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found then raise exception using errcode='22023',message='Unknown account journal request'; end if;
 if r.status='cancelled' then return jsonb_build_object('request_id',p_request,'status','already_recorded','state',r.status); end if;
 if r.status<>'prepared' then raise exception using errcode='42501',message='Dispatched work cannot be cancelled'; end if;
 update pipstart_staff_private.account_operations set status='cancelled',revision=revision+1 where request_id=p_request returning * into r;
 insert into pipstart_staff_private.account_operation_events(request_id,revision,status) values(p_request,r.revision,r.status);
 return jsonb_build_object('request_id',p_request,'status','recorded','state',r.status);
end $$;

create function pipstart_staff_private.account_operation_enable_guard() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.enabled and exists(select 1 from pipstart_staff_private.account_operations where status in ('prepared','dispatched','unknown')) then
  raise exception using errcode='42501',message='Unresolved account operations block staff enablement'; end if;
 return new;
end $$;
create trigger pipstart_staff_account_operation_enable_guard before update of enabled
 on pipstart_staff_private.control for each row execute function pipstart_staff_private.account_operation_enable_guard();
revoke all on function pipstart_staff_private.account_operation_guard(),pipstart_staff_private.account_operation_enable_guard(),
 pipstart_staff_private.account_operation_target(uuid,text,uuid,timestamptz),
 pipstart_staff_private.account_operation_prepare(uuid,uuid,text,uuid,timestamptz,text,bigint),
 pipstart_staff_private.account_operation_claim(uuid),pipstart_staff_private.account_operation_result(uuid,uuid,text),
 pipstart_staff_private.account_operation_cancel(uuid) from public,anon,authenticated,service_role;
commit;
