-- MP03 learner-only durable intents. No provider dispatch, activation or identity mutation.
begin;
do $$ begin
 if to_regprocedure('pipstart_staff_private.actor()') is null
  or to_regprocedure('pipstart_staff_private.issue_receipt(uuid,uuid,text,uuid,text,text,text,bytea,timestamptz)') is null
  or to_regclass('pipstart_staff_private.proof_uses') is null
  or not exists(select 1 from information_schema.columns where table_schema='auth' and table_name='users' and column_name='deleted_at' and data_type='timestamp with time zone') then
  raise exception 'Accepted MP03 authorization and provider schema required'; end if;
 if not exists(select 1 from pipstart_staff_private.control where singleton and not enabled) then
  raise exception 'Install learner intents while staff remains paused'; end if;
end $$;
create table pipstart_staff_private.learner_requests (
 request_id uuid primary key,
 actor_id uuid not null,
 target_id uuid not null,
 operation text not null check(operation in ('auth_suspend','auth_resume')),
 suspend_until timestamptz,
 reason_code text not null check(reason_code in ('security_response','access_change')),
 command_value text not null,
 proof_token_hash bytea not null unique references pipstart_staff_private.receipts(token_hash) on delete restrict,
 verified_at timestamptz not null,
 expires_at timestamptz not null,
 recorded_at timestamptz not null default clock_timestamp(),
 control_version bigint not null check(control_version>=0),
 check(actor_id<>target_id),
 check((operation='auth_suspend')=(suspend_until is not null)),
 check(suspend_until is null or isfinite(suspend_until)),
 check(expires_at=verified_at+interval '5 minutes')
);
create index pipstart_learner_request_target on pipstart_staff_private.learner_requests(target_id,expires_at);
create table pipstart_staff_private.learner_request_events (
 request_id uuid primary key references pipstart_staff_private.learner_requests(request_id) on delete restrict,
 event text not null default 'intent_recorded' check(event='intent_recorded'),
 recorded_at timestamptz not null default clock_timestamp()
);
alter table pipstart_staff_private.learner_requests enable row level security;
alter table pipstart_staff_private.learner_request_events enable row level security;
revoke all on pipstart_staff_private.learner_requests,pipstart_staff_private.learner_request_events from public,anon,authenticated,service_role;
create trigger pipstart_learner_request_immutable before update or delete on pipstart_staff_private.learner_requests
 for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_learner_request_event_immutable before update or delete on pipstart_staff_private.learner_request_events
 for each row execute function pipstart_staff_private.immutable_audit();

-- Called only under the common governance lock. A former/paused staff member or
-- legacy administrator is never converted into a delegated learner target.
create function pipstart_staff_private.learner_command(p_request uuid,p_target uuid,p_operation text,p_until timestamptz,p_reason text)
returns text language plpgsql security definer set search_path='' as $$
begin
 if p_request is null or p_target is null or p_operation is null or p_operation not in ('auth_suspend','auth_resume')
  or p_reason is null or p_reason not in ('security_response','access_change')
  or (p_operation='auth_suspend')<>(p_until is not null)
  or (p_until is not null and (not isfinite(p_until) or p_until<=clock_timestamp() or p_until>clock_timestamp()+interval '365 days')) then
  raise exception using errcode='22023',message='Invalid learner account intent'; end if;
 if p_target=auth.uid() or exists(select 1 from pipstart_staff_private.members where user_id=p_target) then
  raise exception using errcode='42501',message='Learner-only target required'; end if;
 perform 1 from auth.users where id=p_target and deleted_at is null for share;
 if not found then raise exception using errcode='42501',message='Learner-only target required'; end if;
 perform 1 from public.pipstart_profiles where user_id=p_target and role::text='learner' for share;
 if not found then raise exception using errcode='42501',message='Learner-only target required'; end if;
 return jsonb_build_object('request',p_request,'target',p_target,'operation',p_operation,'reason',p_reason,
  'until',case when p_until is null then null else to_char(p_until at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') end)::text;
end $$;
create function pipstart_staff_private.learner_fresh(p_user uuid)
returns table(session_id uuid,amr_id uuid,verified_at timestamptz)
language plpgsql security definer set search_path='' as $$
declare s uuid; a uuid; t timestamptz; stamp text;
begin
 begin s:=(auth.jwt()->>'session_id')::uuid;
 exception when invalid_text_representation then raise exception using errcode='42501',message='Fresh provider verification required'; end;
 if p_user is null or p_user is distinct from auth.uid() or s is null then
  raise exception using errcode='42501',message='Fresh provider verification required'; end if;
 select c.id,c.updated_at into a,t from auth.mfa_amr_claims c where c.session_id=s and c.authentication_method='totp' for share;
 if not found or t>clock_timestamp() or t<=clock_timestamp()-interval '5 minutes'
  or coalesce(jsonb_typeof(auth.jwt()->'amr'),'')<>'array' then
  raise exception using errcode='42501',message='Fresh provider verification required'; end if;
 if (select count(*) from jsonb_array_elements(auth.jwt()->'amr') e where e->>'method'='totp')<>1 then
  raise exception using errcode='42501',message='Fresh provider verification required'; end if;
 select e->>'timestamp' into stamp from jsonb_array_elements(auth.jwt()->'amr') e where e->>'method'='totp';
 if stamp is null or stamp !~ '^[0-9]{1,12}$' or stamp::bigint<>floor(extract(epoch from t))::bigint then
  raise exception using errcode='42501',message='Session verification has changed'; end if;
 return query select s,a,t;
end $$;
create function public.pipstart_staff_learner_receipt(p_request uuid,p_target uuid,p_operation text,p_until timestamptz,p_reason text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; value text; fresh record; h bytea; prior pipstart_staff_private.receipts%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton for update;
 u:=pipstart_staff_private.require_capability('people.manage_learners');
 value:=pipstart_staff_private.learner_command(p_request,p_target,p_operation,p_until,p_reason);
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception using errcode='22023',message='Invalid learner proof'; end if;
 select * into fresh from pipstart_staff_private.learner_fresh(u);
 h:=sha256(convert_to(p_token,'UTF8'));
 select * into prior from pipstart_staff_private.receipts where token_hash=h for update;
 if found then
  if prior.actor_id=u and prior.session_id=fresh.session_id and prior.operation='learner_intent'
   and prior.target_id=p_target and prior.value=value and prior.resource_kind='learner'
   and prior.resource_id=p_request::text and prior.verified_at=fresh.verified_at and prior.expires_at>clock_timestamp() and prior.consumed_at is null then
   return jsonb_build_object('status','already_issued','expires_at',prior.expires_at); end if;
  raise exception using errcode='42501',message='Learner proof conflict'; end if;
 perform pipstart_staff_private.issue_receipt(u,fresh.session_id,'learner_intent',p_target,value,'learner',p_request::text,h,fresh.verified_at);
 insert into pipstart_staff_private.proof_uses(session_id,amr_id,verified_at,verification_second,token_hash)
  values(fresh.session_id,fresh.amr_id,fresh.verified_at,floor(extract(epoch from fresh.verified_at))::bigint,h);
 return jsonb_build_object('status','issued','expires_at',fresh.verified_at+interval '5 minutes');
exception when unique_violation then raise exception using errcode='42501',message='Verification evidence already used';
end $$;
create function public.pipstart_staff_learner_prepare(p_request uuid,p_target uuid,p_operation text,p_until timestamptz,p_reason text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; value text; fresh record; proof pipstart_staff_private.receipts%rowtype; prior pipstart_staff_private.learner_requests%rowtype; version_value bigint;
begin
 select version into version_value from pipstart_staff_private.control where singleton for update;
 u:=pipstart_staff_private.require_capability('people.manage_learners');
 value:=pipstart_staff_private.learner_command(p_request,p_target,p_operation,p_until,p_reason);
 select * into prior from pipstart_staff_private.learner_requests where request_id=p_request;
 if found then
  if prior.actor_id<>u or prior.command_value<>value then raise exception using errcode='22023',message='Learner request conflict'; end if;
  return jsonb_build_object('request_id',p_request,'status','intent_recorded'); end if;
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception using errcode='42501',message='Exact fresh learner proof required'; end if;
 select * into fresh from pipstart_staff_private.learner_fresh(u);
 select * into proof from pipstart_staff_private.receipts where token_hash=sha256(convert_to(p_token,'UTF8')) for update;
 if not found or proof.actor_id<>u or proof.session_id<>fresh.session_id or proof.operation<>'learner_intent'
  or proof.target_id<>p_target or proof.value<>value or proof.resource_kind<>'learner' or proof.resource_id<>p_request::text
  or proof.verified_at<>fresh.verified_at or proof.expires_at<=clock_timestamp() or proof.consumed_at is not null then
  raise exception using errcode='42501',message='Exact fresh learner proof required'; end if;
 if exists(select 1 from pipstart_staff_private.learner_requests where target_id=p_target and expires_at>clock_timestamp()) then
  raise exception using errcode='42501',message='Unexpired learner intent already exists'; end if;
 update pipstart_staff_private.receipts set consumed_at=clock_timestamp() where token_hash=proof.token_hash;
 insert into pipstart_staff_private.learner_requests(request_id,actor_id,target_id,operation,suspend_until,reason_code,command_value,proof_token_hash,verified_at,expires_at,control_version)
  values(p_request,u,p_target,p_operation,p_until,p_reason,value,proof.token_hash,proof.verified_at,proof.expires_at,version_value);
 insert into pipstart_staff_private.learner_request_events(request_id) values(p_request);
 return jsonb_build_object('request_id',p_request,'status','intent_recorded');
end $$;
create function public.pipstart_staff_learner_request(p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; r pipstart_staff_private.learner_requests%rowtype;
begin
 perform 1 from pipstart_staff_private.control where singleton for share;
 u:=pipstart_staff_private.require_capability('people.manage_learners');
 select * into r from pipstart_staff_private.learner_requests where request_id=p_request;
 if not found or (r.actor_id<>u and not pipstart_staff_private.has_capability('roles.manage')) then
  raise exception using errcode='42501',message='Learner request unavailable'; end if;
 return jsonb_build_object('request_id',r.request_id,'status','intent_recorded','target_id',r.target_id,'operation',r.operation,'suspend_until',r.suspend_until,'expires_at',r.expires_at);
end $$;
revoke all on function pipstart_staff_private.learner_command(uuid,uuid,text,timestamptz,text),pipstart_staff_private.learner_fresh(uuid),
 public.pipstart_staff_learner_receipt(uuid,uuid,text,timestamptz,text,text),public.pipstart_staff_learner_prepare(uuid,uuid,text,timestamptz,text,text),public.pipstart_staff_learner_request(uuid)
 from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_learner_receipt(uuid,uuid,text,timestamptz,text,text),public.pipstart_staff_learner_prepare(uuid,uuid,text,timestamptz,text,text),public.pipstart_staff_learner_request(uuid) to authenticated;
commit;
