-- M22 MP11b: deterministic conflicts answer instead of retrying.
-- PostgREST retries SQLSTATE 40001 (serialization failure) itself, so a refusal that will
-- never succeed on retry must not use it. Two API-reachable functions did:
--   * public.pipstart_set_lesson_completion: a stale expected_revision (the lesson open in
--     two tabs or devices). The learner's save spun instead of getting an answer.
--   * pipstart_staff_private.account_operation_claim, reached through the service-role
--     public.pipstart_staff_maintenance_take: the staff control version changed after the
--     request was prepared (default-off transport).
-- Both now raise PT409, which PostgREST returns once as HTTP 409. Bodies are otherwise
-- unchanged; signatures, owners and grants are kept by create or replace.
begin;
do $$
begin
 if to_regprocedure('public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)') is null
  or to_regprocedure('public.pipstart_record_lesson_visit(text,text,text)') is null
  or to_regprocedure('pipstart_staff_private.account_operation_claim(uuid)') is null
  or to_regprocedure('pipstart_staff_private.account_operation_target(uuid,text,uuid,timestamptz)') is null then
  raise exception 'Learner progress and account journal schema required'; end if;
end $$;

create or replace function public.pipstart_set_lesson_completion(
  requested_course_id text, requested_module_id text, requested_lesson_id text,
  requested_complete boolean, expected_revision bigint default null
) returns table (lesson_id text, is_complete boolean, revision bigint)
language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  current_record public.pipstart_lesson_progress%rowtype;
  change_time timestamptz := now();
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  perform public.pipstart_record_lesson_visit(
    requested_course_id, requested_module_id, requested_lesson_id);
  select * into current_record from public.pipstart_lesson_progress
  where user_id = current_user_id
    and public.pipstart_lesson_progress.lesson_id = requested_lesson_id for update;
  if expected_revision is not null and current_record.revision <> expected_revision then
    raise exception 'progress conflict' using errcode = 'PT409';
  end if;
  if current_record.is_complete <> requested_complete then
    update public.pipstart_lesson_progress set
      is_complete = requested_complete,
      completed_at = case when requested_complete then change_time else null end,
      last_visited_at = change_time, revision = current_record.revision + 1
    where user_id = current_user_id
      and public.pipstart_lesson_progress.lesson_id = requested_lesson_id
    returning * into current_record;
    insert into public.pipstart_learning_events
      (user_id, event_type, course_id, module_id, lesson_id)
    values (current_user_id,
      case when requested_complete then 'lesson_completed'::public.pipstart_learning_event_type
        else 'lesson_reopened'::public.pipstart_learning_event_type end,
      requested_course_id, requested_module_id, requested_lesson_id);
  end if;
  return query select current_record.lesson_id, current_record.is_complete,
    current_record.revision;
end;
$$;

-- A lost claim response is not a permit to repeat the provider action. A second
-- claim returns no dispatch identity or executable target, even after success.
create or replace function pipstart_staff_private.account_operation_claim(p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c pipstart_staff_private.control%rowtype; r pipstart_staff_private.account_operations%rowtype; d uuid;
begin
 select * into c from pipstart_staff_private.control where singleton for update;
 select * into r from pipstart_staff_private.account_operations where request_id=p_request for update;
 if not found then raise exception using errcode='22023',message='Unknown account journal request'; end if;
 if r.status<>'prepared' then return jsonb_build_object('request_id',p_request,'status','not_dispatchable','state',r.status); end if;
 if c.enabled or c.version is distinct from r.control_version then raise exception using errcode='PT409',message='Default-closed staff version changed'; end if;
 if r.expires_at<=clock_timestamp() then raise exception using errcode='42501',message='Account journal preparation expired'; end if;
 perform pipstart_staff_private.account_operation_target(r.target_id,r.operation,r.factor_id,r.suspend_until);
 d:=gen_random_uuid();
 update pipstart_staff_private.account_operations set status='dispatched',dispatch_id=d,revision=revision+1 where request_id=p_request returning * into r;
 insert into pipstart_staff_private.account_operation_events(request_id,revision,status) values(p_request,r.revision,r.status);
 return jsonb_build_object('request_id',p_request,'status','dispatch_authorized','dispatch_id',d,'target_id',r.target_id,'operation',r.operation,'factor_id',r.factor_id,'suspend_until',r.suspend_until);
end $$;

do $$
begin
 if position('40001' in pg_get_functiondef('public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)'::regprocedure))>0
  or position('40001' in pg_get_functiondef('pipstart_staff_private.account_operation_claim(uuid)'::regprocedure))>0
  or not has_function_privilege('authenticated','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute')
  or has_function_privilege('anon','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute')
  or exists(select 1 from unnest(array['anon','authenticated','service_role']) r
   where has_function_privilege(r,'pipstart_staff_private.account_operation_claim(uuid)','execute')) then
  raise exception 'Conflict code migration verification failed'; end if;
end $$;
commit;
