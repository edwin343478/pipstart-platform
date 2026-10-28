-- MP03 learner provider bridge. No bootstrap, activation or provider call.
begin;
do $$ begin
 if to_regclass('pipstart_staff_private.learner_requests') is null or to_regprocedure('pipstart_staff_private.learner_fresh(uuid)') is null
  or not exists(select 1 from pipstart_staff_private.control where singleton and not enabled) then
  raise exception 'Accepted paused learner-intent schema required'; end if;
end $$;
create table pipstart_staff_private.learner_deliveries (
 request_id uuid primary key references pipstart_staff_private.learner_requests(request_id) on delete restrict,
 target_id uuid not null, dispatch_id uuid not null unique,
 state text not null default 'prepared' check(state in ('prepared','dispatched','succeeded','unknown','cancelled','observed_desired','observed_other')),
 created_at timestamptz not null default clock_timestamp(),updated_at timestamptz not null default clock_timestamp()
);
create unique index pipstart_learner_delivery_unresolved on pipstart_staff_private.learner_deliveries(target_id) where state in ('prepared','dispatched','unknown');
create table pipstart_staff_private.learner_provider_permits (
 id uuid primary key default gen_random_uuid(),request_id uuid not null references pipstart_staff_private.learner_deliveries(request_id) on delete restrict,
 dispatch_id uuid not null,mode text not null check(mode in ('dispatch','inspect')),
 actor_id uuid not null,session_id uuid not null,verified_at timestamptz not null,expires_at timestamptz not null,
 control_version bigint not null,permit_hash bytea not null unique check(octet_length(permit_hash)=32),consumed_at timestamptz,
 check(expires_at=verified_at+interval '5 minutes')
);
create table pipstart_staff_private.learner_provider_events (
 id uuid primary key default gen_random_uuid(),request_id uuid not null references pipstart_staff_private.learner_deliveries(request_id) on delete restrict,
 authorized_actor_id uuid,permit_id uuid references pipstart_staff_private.learner_provider_permits(id) on delete restrict,
 event text not null check(event in ('prepared','dispatched','succeeded','unknown','inspected','cancelled','observed_desired','observed_other')),
 provenance text not null check(provenance in ('verified_staff','provider_executor','trusted_db_operator')),
 recorded_at timestamptz not null default clock_timestamp()
);
create index pipstart_learner_provider_event_page on pipstart_staff_private.learner_provider_events(request_id,recorded_at,id);
alter table pipstart_staff_private.learner_deliveries enable row level security;
alter table pipstart_staff_private.learner_provider_permits enable row level security;
alter table pipstart_staff_private.learner_provider_events enable row level security;
revoke all on pipstart_staff_private.learner_deliveries,pipstart_staff_private.learner_provider_permits,pipstart_staff_private.learner_provider_events from public,anon,authenticated,service_role;
create trigger pipstart_learner_provider_event_immutable before update or delete on pipstart_staff_private.learner_provider_events for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_learner_delivery_no_delete before delete on pipstart_staff_private.learner_deliveries for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_learner_permit_no_delete before delete on pipstart_staff_private.learner_provider_permits for each row execute function pipstart_staff_private.immutable_audit();
create function pipstart_staff_private.learner_delivery_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if row(new.request_id,new.target_id,new.dispatch_id,new.created_at) is distinct from row(old.request_id,old.target_id,old.dispatch_id,old.created_at)
  or not ((old.state='prepared' and new.state in ('dispatched','cancelled')) or (old.state='dispatched' and new.state in ('succeeded','unknown')) or (old.state='unknown' and new.state in ('succeeded','observed_desired','observed_other'))) then
  raise exception using errcode='42501',message='Invalid learner delivery transition'; end if;
 new.updated_at:=clock_timestamp();return new;
end $$;
create trigger pipstart_learner_delivery_guard before update on pipstart_staff_private.learner_deliveries for each row execute function pipstart_staff_private.learner_delivery_guard();
create function pipstart_staff_private.learner_permit_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if row(new.id,new.request_id,new.dispatch_id,new.mode,new.actor_id,new.session_id,new.verified_at,new.expires_at,new.control_version,new.permit_hash)
  is distinct from row(old.id,old.request_id,old.dispatch_id,old.mode,old.actor_id,old.session_id,old.verified_at,old.expires_at,old.control_version,old.permit_hash)
  or old.consumed_at is not null or new.consumed_at is null then raise exception using errcode='42501',message='Invalid learner permit change'; end if;return new;
end $$;
create trigger pipstart_learner_permit_guard before update on pipstart_staff_private.learner_provider_permits for each row execute function pipstart_staff_private.learner_permit_guard();
-- Block promotion while a remote learner operation might still affect the target.
create function pipstart_staff_private.learner_promotion_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from pipstart_staff_private.control where singleton for update;
 if exists(select 1 from pipstart_staff_private.learner_deliveries where target_id=new.user_id and state in ('prepared','dispatched','unknown')) then
  raise exception using errcode='42501',message='Resolve learner delivery before staff promotion'; end if;return new;
end $$;
create trigger pipstart_learner_promotion_guard before insert or update of user_id on pipstart_staff_private.members for each row execute function pipstart_staff_private.learner_promotion_guard();
create trigger pipstart_learner_legacy_promotion_guard before update of role on public.pipstart_profiles for each row when (new.role is distinct from old.role and new.role::text<>'learner') execute function pipstart_staff_private.learner_promotion_guard();
create function pipstart_staff_private.learner_enable_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.enabled and not old.enabled and exists(select 1 from pipstart_staff_private.learner_deliveries where state in ('prepared','dispatched','unknown')) then
  raise exception using errcode='42501',message='Resolve learner delivery before staff re-enable'; end if;return new;
end $$;
create trigger pipstart_learner_enable_guard before update of enabled on pipstart_staff_private.control for each row execute function pipstart_staff_private.learner_enable_guard();
-- Actor/session/time below come only from a database-bound permit, never a posted actor.
create function pipstart_staff_private.learner_provider_actor(p_actor uuid,p_session uuid,p_verified timestamptz) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_verified is null or p_verified>clock_timestamp() or p_verified<=clock_timestamp()-interval '5 minutes' then raise exception using errcode='42501',message='Fresh learner authorization required'; end if;
 perform 1 from auth.sessions s join auth.users a on a.id=s.user_id join auth.mfa_factors f on f.id=s.factor_id and f.user_id=s.user_id
 join auth.mfa_amr_claims c on c.session_id=s.id and c.authentication_method='totp' join pipstart_staff_private.members m on m.user_id=a.id
 where a.id=p_actor and s.id=p_session and m.active and a.deleted_at is null and (a.banned_until is null or a.banned_until<=clock_timestamp())
 and s.aal::text='aal2' and (s.not_after is null or s.not_after>clock_timestamp()) and f.factor_type::text='totp' and f.status::text='verified' and c.updated_at=p_verified
 and (exists(select 1 from pipstart_staff_private.roles where user_id=a.id and role_name='owner') or
  (exists(select 1 from pipstart_staff_private.roles where user_id=a.id and role_name='administrator') and exists(select 1 from pipstart_staff_private.delegations where user_id=a.id and capability='people.manage_learners')))
 for share of s,a,f,c,m;
 if not found then raise exception using errcode='42501',message='Live learner authorization required'; end if;
end $$;
create function pipstart_staff_private.learner_provider_target(p_target uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from pipstart_staff_private.members where user_id=p_target) then raise exception using errcode='42501',message='Learner-only provider target required'; end if;
 perform 1 from auth.users a join public.pipstart_profiles p on p.user_id=a.id where a.id=p_target and a.deleted_at is null and p.role::text='learner' for share of a,p;
 if not found then raise exception using errcode='42501',message='Learner-only provider target required'; end if;
end $$;
create function public.pipstart_staff_learner_inspection_receipt(p_request uuid,p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; r pipstart_staff_private.learner_requests%rowtype; fresh record; h bytea; prior pipstart_staff_private.receipts%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton for update;u:=pipstart_staff_private.require_capability('people.manage_learners');
 select * into r from pipstart_staff_private.learner_requests where request_id=p_request;
 if not found or (r.actor_id<>u and not pipstart_staff_private.has_capability('roles.manage')) or not exists(select 1 from pipstart_staff_private.learner_deliveries where request_id=p_request) then raise exception using errcode='42501',message='Learner inspection unavailable'; end if;
 perform pipstart_staff_private.learner_provider_target(r.target_id);
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception using errcode='22023',message='Invalid learner inspection proof'; end if;
 select * into fresh from pipstart_staff_private.learner_fresh(u);h:=sha256(convert_to(p_token,'UTF8'));
 select * into prior from pipstart_staff_private.receipts where token_hash=h for update;
 if found then
  if prior.actor_id=u and prior.session_id=fresh.session_id and prior.operation='learner_inspect' and prior.target_id=r.target_id and prior.value=r.command_value and prior.resource_kind='learner' and prior.resource_id=p_request::text and prior.verified_at=fresh.verified_at and prior.expires_at>clock_timestamp() and prior.consumed_at is null then return jsonb_build_object('status','already_issued','expires_at',prior.expires_at);end if;
  raise exception using errcode='42501',message='Inspection proof conflict'; end if;
 perform pipstart_staff_private.issue_receipt(u,fresh.session_id,'learner_inspect',r.target_id,r.command_value,'learner',p_request::text,h,fresh.verified_at);
 insert into pipstart_staff_private.proof_uses(session_id,amr_id,verified_at,verification_second,token_hash) values(fresh.session_id,fresh.amr_id,fresh.verified_at,floor(extract(epoch from fresh.verified_at))::bigint,h);
 return jsonb_build_object('status','issued','expires_at',fresh.verified_at+interval '5 minutes');
exception when unique_violation then raise exception using errcode='42501',message='Verification evidence already used';
end $$;
create function public.pipstart_staff_learner_claim(p_request uuid,p_mode text,p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; r pipstart_staff_private.learner_requests%rowtype; proof pipstart_staff_private.receipts%rowtype; d pipstart_staff_private.learner_deliveries%rowtype; v bigint; nonce text;
begin
 select version into v from pipstart_staff_private.control where singleton for update;u:=pipstart_staff_private.require_capability('people.manage_learners');
 if p_mode is null or p_mode not in ('dispatch','inspect') or p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception using errcode='22023',message='Invalid learner claim'; end if;
 select * into r from pipstart_staff_private.learner_requests where request_id=p_request;
 if not found or (r.actor_id<>u and (p_mode='dispatch' or not pipstart_staff_private.has_capability('roles.manage'))) then raise exception using errcode='42501',message='Learner claim unavailable'; end if;
 perform pipstart_staff_private.learner_provider_target(r.target_id);
 select * into proof from pipstart_staff_private.receipts where token_hash=sha256(convert_to(p_token,'UTF8')) for update;
 if not found or proof.actor_id<>u or proof.session_id is distinct from (auth.jwt()->>'session_id')::uuid or proof.target_id<>r.target_id or proof.value<>r.command_value or proof.resource_kind<>'learner' or proof.resource_id<>p_request::text or proof.expires_at<=clock_timestamp()
  or (p_mode='dispatch' and (proof.token_hash<>r.proof_token_hash or proof.operation<>'learner_intent' or proof.consumed_at is null or r.expires_at<=clock_timestamp() or r.control_version<>v))
  or (p_mode='inspect' and (proof.operation<>'learner_inspect' or proof.consumed_at is not null)) then raise exception using errcode='42501',message='Exact learner proof required'; end if;
 perform pipstart_staff_private.learner_provider_actor(u,proof.session_id,proof.verified_at);
 select * into d from pipstart_staff_private.learner_deliveries where request_id=p_request for update;
 if p_mode='dispatch' then
  if found then return jsonb_build_object('request_id',p_request,'status','not_dispatchable','state',d.state);end if;
  if r.operation='auth_suspend' and (r.suspend_until<=clock_timestamp() or r.suspend_until>clock_timestamp()+interval '365 days') then raise exception using errcode='42501',message='Learner suspension expiry invalid'; end if;
  insert into pipstart_staff_private.learner_deliveries(request_id,target_id,dispatch_id) values(p_request,r.target_id,gen_random_uuid()) returning * into d;
  insert into pipstart_staff_private.learner_provider_events(request_id,event,provenance,authorized_actor_id) values(p_request,'prepared','verified_staff',u);
 else
  if not found then raise exception using errcode='42501',message='Delivery not recorded; do not retry dispatch';end if;
  update pipstart_staff_private.receipts set consumed_at=clock_timestamp() where token_hash=proof.token_hash;
 end if;
 nonce:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into pipstart_staff_private.learner_provider_permits(request_id,dispatch_id,mode,actor_id,session_id,verified_at,expires_at,control_version,permit_hash)
 values(p_request,d.dispatch_id,p_mode,u,proof.session_id,proof.verified_at,proof.expires_at,v,sha256(convert_to(nonce,'UTF8')));
 return jsonb_build_object('request_id',p_request,'dispatch_id',d.dispatch_id,'permit',nonce,'status','execution_permitted','expires_at',proof.expires_at);
end $$;
create function public.pipstart_staff_learner_provider_take(p_request uuid,p_dispatch uuid,p_permit text) returns jsonb language plpgsql security definer set search_path='' as $$
declare permit pipstart_staff_private.learner_provider_permits%rowtype; r pipstart_staff_private.learner_requests%rowtype; d pipstart_staff_private.learner_deliveries%rowtype; v bigint;
begin
 if current_setting('role',true) is distinct from 'service_role' then raise exception using errcode='42501',message='Provider executor required';end if;
 select version into v from pipstart_staff_private.control where singleton and enabled for update;
 if not found or p_permit is null or p_permit !~ '^[a-f0-9]{64}$' then raise exception using errcode='42501',message='Bound provider permit required';end if;
 select * into permit from pipstart_staff_private.learner_provider_permits where permit_hash=sha256(convert_to(p_permit,'UTF8')) and request_id=p_request and dispatch_id=p_dispatch for update;
 if not found or permit.consumed_at is not null or permit.expires_at<=clock_timestamp() or permit.control_version<>v then raise exception using errcode='42501',message='Bound provider permit unavailable';end if;
 perform pipstart_staff_private.learner_provider_actor(permit.actor_id,permit.session_id,permit.verified_at);
 select * into r from pipstart_staff_private.learner_requests where request_id=p_request;
 perform pipstart_staff_private.learner_provider_target(r.target_id);
 select * into d from pipstart_staff_private.learner_deliveries where request_id=p_request for update;
 if permit.mode='dispatch' and (d.state<>'prepared' or (r.operation='auth_suspend' and (r.suspend_until<=clock_timestamp() or r.suspend_until>clock_timestamp()+interval '365 days'))) then raise exception using errcode='42501',message='Learner dispatch unavailable';end if;
 update pipstart_staff_private.learner_provider_permits set consumed_at=clock_timestamp() where id=permit.id;
 if permit.mode='inspect' then
  insert into pipstart_staff_private.learner_provider_events(request_id,event,provenance,authorized_actor_id,permit_id) values(p_request,'inspected','provider_executor',permit.actor_id,permit.id);
  return jsonb_build_object('request_id',p_request,'status','inspection_authorized','target_id',r.target_id,'operation',r.operation,'suspend_until',r.suspend_until,'state',d.state);end if;
 update pipstart_staff_private.learner_deliveries set state='dispatched' where request_id=p_request;
 insert into pipstart_staff_private.learner_provider_events(request_id,event,provenance,authorized_actor_id,permit_id) values(p_request,'dispatched','provider_executor',permit.actor_id,permit.id);
 return jsonb_build_object('request_id',p_request,'status','dispatch_authorized','dispatch_id',p_dispatch,'target_id',r.target_id,'operation',r.operation,'factor_id',null,'suspend_until',r.suspend_until);
end $$;
create function public.pipstart_staff_learner_provider_result(p_request uuid,p_dispatch uuid,p_permit text,p_outcome text) returns jsonb language plpgsql security definer set search_path='' as $$
declare permit pipstart_staff_private.learner_provider_permits%rowtype;d pipstart_staff_private.learner_deliveries%rowtype;
begin
 if current_setting('role',true) is distinct from 'service_role' or p_outcome is null or p_outcome not in ('succeeded','unknown') or p_permit is null or p_permit !~ '^[a-f0-9]{64}$' then raise exception using errcode='42501',message='Bound provider result required';end if;
 select * into permit from pipstart_staff_private.learner_provider_permits where permit_hash=sha256(convert_to(p_permit,'UTF8')) and request_id=p_request and dispatch_id=p_dispatch and mode='dispatch' and consumed_at is not null;
 if not found then raise exception using errcode='42501',message='Consumed provider permit required';end if;
 select * into d from pipstart_staff_private.learner_deliveries where request_id=p_request for update;
 if d.state=p_outcome then return jsonb_build_object('request_id',p_request,'status','already_recorded','state',d.state);end if;
 if d.state not in ('dispatched','unknown') then raise exception using errcode='42501',message='Provider result conflict';end if;
 update pipstart_staff_private.learner_deliveries set state=p_outcome where request_id=p_request;
 insert into pipstart_staff_private.learner_provider_events(request_id,event,provenance,authorized_actor_id,permit_id) values(p_request,p_outcome,'provider_executor',permit.actor_id,permit.id);
 return jsonb_build_object('request_id',p_request,'status','recorded','state',p_outcome);
end $$;
create function public.pipstart_staff_learner_delivery_state(p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid;r pipstart_staff_private.learner_requests%rowtype;state_value text;
begin
 perform 1 from pipstart_staff_private.control where singleton for share;u:=pipstart_staff_private.require_capability('people.manage_learners');
 select * into r from pipstart_staff_private.learner_requests where request_id=p_request;
 if not found or (r.actor_id<>u and not pipstart_staff_private.has_capability('roles.manage')) then raise exception using errcode='42501',message='Learner state unavailable';end if;
 select state into state_value from pipstart_staff_private.learner_deliveries where request_id=p_request;
 if not found then state_value:='intent_only';end if;
 return jsonb_build_object('request_id',p_request,'status','delivery_state','target_id',r.target_id,'operation',r.operation,'suspend_until',r.suspend_until,'state',state_value);
end $$;
-- Trusted paused review only: never claim that an observation proves causality.
create function pipstart_staff_private.learner_delivery_review(p_request uuid,p_dispatch uuid,p_resolution text) returns void language plpgsql security definer set search_path='' as $$
declare d pipstart_staff_private.learner_deliveries%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton and not enabled for update;if not found then raise exception using errcode='42501',message='Pause staff before operator review';end if;
 select * into d from pipstart_staff_private.learner_deliveries where request_id=p_request for update;
 if not found or p_dispatch is null or d.dispatch_id<>p_dispatch or p_resolution is null or not ((d.state='prepared' and p_resolution='cancelled') or (d.state='dispatched' and p_resolution='unknown') or (d.state='unknown' and p_resolution in ('observed_desired','observed_other'))) then raise exception using errcode='42501',message='Exact reviewed resolution required';end if;
 update pipstart_staff_private.learner_deliveries set state=p_resolution where request_id=p_request;
 insert into pipstart_staff_private.learner_provider_events(request_id,event,provenance) values(p_request,p_resolution,'trusted_db_operator');
end $$;
revoke all on function pipstart_staff_private.learner_delivery_guard(),pipstart_staff_private.learner_permit_guard(),pipstart_staff_private.learner_promotion_guard(),pipstart_staff_private.learner_enable_guard(),pipstart_staff_private.learner_provider_actor(uuid,uuid,timestamptz),pipstart_staff_private.learner_provider_target(uuid),pipstart_staff_private.learner_delivery_review(uuid,uuid,text),
 public.pipstart_staff_learner_inspection_receipt(uuid,text),public.pipstart_staff_learner_claim(uuid,text,text),public.pipstart_staff_learner_provider_take(uuid,uuid,text),public.pipstart_staff_learner_provider_result(uuid,uuid,text,text),public.pipstart_staff_learner_delivery_state(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_learner_inspection_receipt(uuid,text),public.pipstart_staff_learner_claim(uuid,text,text),public.pipstart_staff_learner_delivery_state(uuid) to authenticated;
grant execute on function public.pipstart_staff_learner_provider_take(uuid,uuid,text),public.pipstart_staff_learner_provider_result(uuid,uuid,text,text) to service_role;
commit;
