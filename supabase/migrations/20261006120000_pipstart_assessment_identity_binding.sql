-- M16-H1: no historical rows or lesson/progress identifiers are rewritten.
begin;

create function public.pipstart_validate_assessment_binding(
  current_attempt public.pipstart_assessment_attempts,
  requested_quiz_id text,
  requested_quiz_version integer,
  requested_public_snapshot jsonb,
  requested_answers jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  answer record;
  question jsonb;
  choice jsonb;
  known_choices jsonb;
  question_ids jsonb;
begin
  if requested_quiz_id is distinct from current_attempt.quiz_id
    or requested_quiz_version is distinct from current_attempt.quiz_version
    or requested_public_snapshot is distinct from current_attempt.public_snapshot
    or current_attempt.public_snapshot->>'id' is distinct from current_attempt.quiz_id
    or current_attempt.public_snapshot->'version' is distinct from to_jsonb(current_attempt.quiz_version)
    or current_attempt.public_snapshot->'passingPercentage' is distinct from to_jsonb(current_attempt.passing_percentage)
    or jsonb_typeof(current_attempt.public_snapshot->'questions') is distinct from 'array'
    or jsonb_typeof(requested_answers) is distinct from 'object'
  then
    raise exception 'Assessment identity or frozen snapshot mismatch.' using errcode = '22023';
  end if;

  select jsonb_agg(q->'id') into question_ids
    from jsonb_array_elements(current_attempt.public_snapshot->'questions') q;
  if question_ids is distinct from current_attempt.question_order
    or jsonb_array_length(question_ids) = 0
    or exists (
      select 1 from jsonb_array_elements(question_ids) q
      group by q having count(*) > 1
    )
  then
    raise exception 'Invalid frozen assessment questions.' using errcode = '22023';
  end if;

  for question in select * from jsonb_array_elements(current_attempt.public_snapshot->'questions') loop
    if jsonb_typeof(question->'id') is distinct from 'string'
      or jsonb_typeof(question->'choices') is distinct from 'array'
    then
      raise exception 'Invalid frozen assessment question.' using errcode = '22023';
    end if;
    select coalesce(jsonb_agg(c->'id'), '[]'::jsonb) into known_choices
      from jsonb_array_elements(question->'choices') c;
    if jsonb_array_length(known_choices) = 0
      or exists (select 1 from jsonb_array_elements(known_choices) c
        where jsonb_typeof(c) is distinct from 'string')
      or exists (select 1 from jsonb_array_elements(known_choices) c
        group by c having count(*) > 1)
      or jsonb_typeof(current_attempt.choice_order->(question->>'id')) is distinct from 'array'
      or not (current_attempt.choice_order->(question->>'id') @> known_choices
        and known_choices @> (current_attempt.choice_order->(question->>'id')))
      or jsonb_array_length(current_attempt.choice_order->(question->>'id')) <> jsonb_array_length(known_choices)
    then
      raise exception 'Invalid frozen assessment choices.' using errcode = '22023';
    end if;
  end loop;

  for answer in select * from jsonb_each(requested_answers) loop
    select q into question from jsonb_array_elements(current_attempt.public_snapshot->'questions') q
      where q->>'id' = answer.key;
    if question is null or jsonb_typeof(answer.value) is distinct from 'array' then
      raise exception 'Unknown assessment question or invalid answers.' using errcode = '22023';
    end if;
    select jsonb_agg(c->'id') into known_choices from jsonb_array_elements(question->'choices') c;
    for choice in select * from jsonb_array_elements(answer.value) loop
      if jsonb_typeof(choice) is distinct from 'string' or not (known_choices @> jsonb_build_array(choice)) then
        raise exception 'Unknown assessment choice.' using errcode = '22023';
      end if;
    end loop;
    if exists (select 1 from jsonb_array_elements(answer.value) c group by c having count(*) > 1) then
      raise exception 'Duplicate assessment choices.' using errcode = '22023';
    end if;
  end loop;
end;
$$;
revoke all on function public.pipstart_validate_assessment_binding(
  public.pipstart_assessment_attempts, text, integer, jsonb, jsonb
) from public, anon, authenticated, service_role;

-- Remove the unbound entry points, rather than retaining an unsafe overload.
drop function public.pipstart_save_assessment_draft(uuid, uuid, jsonb);
drop function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb, text, text
);

create function public.pipstart_save_assessment_draft(
  requested_user_id uuid,
  requested_attempt_id uuid,
  requested_answers jsonb,
  requested_quiz_id text,
  requested_quiz_version integer,
  requested_public_snapshot jsonb
)
returns setof public.pipstart_assessment_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempt public.pipstart_assessment_attempts%rowtype;
begin
  select * into current_attempt from public.pipstart_assessment_attempts
    where id = requested_attempt_id and user_id = requested_user_id for update;
  if not found then
    raise exception 'Assessment attempt not found.' using errcode = 'P0002';
  end if;
  perform public.pipstart_validate_assessment_binding(current_attempt,
    requested_quiz_id, requested_quiz_version, requested_public_snapshot, requested_answers);
  if current_attempt.status <> 'in_progress' then
    raise exception 'Submitted assessment attempts are immutable.' using errcode = '55000';
  end if;
  update public.pipstart_assessment_attempts set draft_answers = requested_answers, updated_at = now()
    where id = current_attempt.id returning * into current_attempt;
  return next current_attempt;
end;
$$;
revoke all on function public.pipstart_save_assessment_draft(uuid, uuid, jsonb, text, integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.pipstart_save_assessment_draft(uuid, uuid, jsonb, text, integer, jsonb)
  to service_role;

create function public.pipstart_submit_assessment_attempt(
  requested_user_id uuid,
  requested_attempt_id uuid,
  requested_submission_token uuid,
  requested_answers jsonb,
  requested_score integer,
  requested_max_score integer,
  requested_passed boolean,
  requested_review_snapshot jsonb,
  requested_course_id text,
  requested_module_id text,
  requested_quiz_id text,
  requested_quiz_version integer,
  requested_public_snapshot jsonb
)
returns setof public.pipstart_assessment_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempt public.pipstart_assessment_attempts%rowtype;
  change_time timestamptz := now();
  expected_passed boolean;
  review_question jsonb;
  frozen_question jsonb;
  selected_choices jsonb;
  correct_choices jsonb;
  known_choices jsonb;
  correct_count integer := 0;
  review_ids jsonb;
begin
  if requested_user_id is null
    or requested_attempt_id is null
    or requested_course_id is null
    or requested_course_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or (requested_module_id is not null
      and requested_module_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
  then
    raise exception 'Invalid assessment submission.' using errcode = '22023';
  end if;

  select *
    into current_attempt
    from public.pipstart_assessment_attempts
   where id = requested_attempt_id
     and user_id = requested_user_id
   for update;

  if not found then
    raise exception 'Assessment attempt not found.' using errcode = 'P0002';
  end if;

  perform public.pipstart_validate_assessment_binding(current_attempt,
    requested_quiz_id, requested_quiz_version, requested_public_snapshot, requested_answers);
  if requested_course_id is distinct from (current_attempt.public_snapshot->>'courseId')
    or requested_module_id is distinct from (current_attempt.public_snapshot->>'moduleId')
  then
    raise exception 'Assessment course or module mismatch.' using errcode = '22023';
  end if;

  if current_attempt.status = 'submitted' then
    return next current_attempt;
    return;
  end if;

  if requested_submission_token is null
    or jsonb_typeof(requested_answers) <> 'object'
    or requested_score is null
    or requested_max_score is null
    or requested_score < 0
    or requested_max_score <= 0
    or requested_score > requested_max_score
    or requested_max_score <> jsonb_array_length(current_attempt.question_order)
    or requested_passed is null
    or jsonb_typeof(requested_review_snapshot) is distinct from 'object'
  then
    raise exception 'Invalid assessment submission.' using errcode = '22023';
  end if;

  expected_passed :=
    requested_score * 100 >= current_attempt.passing_percentage * requested_max_score;
  if requested_passed <> expected_passed then
    raise exception 'Assessment pass result is inconsistent.' using errcode = '22023';
  end if;

  if requested_review_snapshot->>'quizId' is distinct from current_attempt.quiz_id
    or requested_review_snapshot->'quizVersion' is distinct from to_jsonb(current_attempt.quiz_version)
    or requested_review_snapshot->'score' is distinct from to_jsonb(requested_score)
    or requested_review_snapshot->'correctCount' is distinct from to_jsonb(requested_score)
    or requested_review_snapshot->'maxScore' is distinct from to_jsonb(requested_max_score)
    or requested_review_snapshot->'passed' is distinct from to_jsonb(requested_passed)
    or requested_review_snapshot->'percentage' is distinct from to_jsonb(
      round(requested_score::numeric * 100 / requested_max_score)::integer)
    or jsonb_typeof(requested_review_snapshot->'questions') is distinct from 'array'
  then
    raise exception 'Assessment review summary mismatch.' using errcode = '22023';
  end if;
  select jsonb_agg(q->'questionId') into review_ids
    from jsonb_array_elements(requested_review_snapshot->'questions') q;
  if review_ids is distinct from current_attempt.question_order then
    raise exception 'Assessment review questions mismatch.' using errcode = '22023';
  end if;
  for review_question in select * from jsonb_array_elements(requested_review_snapshot->'questions') loop
    select q into frozen_question from jsonb_array_elements(current_attempt.public_snapshot->'questions') q
      where q->>'id' = review_question->>'questionId';
    selected_choices := coalesce(requested_answers->(review_question->>'questionId'), '[]'::jsonb);
    correct_choices := review_question->'correctChoiceIds';
    if review_question->'submittedChoiceIds' is distinct from selected_choices
      or review_question->'answered' is distinct from to_jsonb(jsonb_array_length(selected_choices) > 0)
      or jsonb_typeof(correct_choices) is distinct from 'array'
      or jsonb_typeof(review_question->'explanation') is distinct from 'string'
    then
      raise exception 'Assessment review answers mismatch.' using errcode = '22023';
    end if;
    select jsonb_agg(c->'id') into known_choices from jsonb_array_elements(frozen_question->'choices') c;
    if jsonb_array_length(correct_choices) = 0
      or not (known_choices @> correct_choices)
      or exists (select 1 from jsonb_array_elements(correct_choices) c
        where jsonb_typeof(c) is distinct from 'string')
      or exists (select 1 from jsonb_array_elements(correct_choices) c
        group by c having count(*) > 1)
      or review_question->'correct' is distinct from to_jsonb(
        selected_choices @> correct_choices and correct_choices @> selected_choices)
    then
      raise exception 'Assessment review correctness mismatch.' using errcode = '22023';
    end if;
    if (review_question->>'correct')::boolean then correct_count := correct_count + 1; end if;
  end loop;
  if correct_count <> requested_score then
    raise exception 'Assessment review score mismatch.' using errcode = '22023';
  end if;

  update public.pipstart_assessment_attempts
     set status = 'submitted',
         draft_answers = requested_answers,
         submitted_answers = requested_answers,
         score = requested_score,
         max_score = requested_max_score,
         passed = requested_passed,
         submission_token = requested_submission_token,
         review_snapshot = requested_review_snapshot,
         updated_at = change_time,
         submitted_at = change_time
   where id = requested_attempt_id
  returning * into current_attempt;

  insert into public.pipstart_learning_events (
    user_id,
    event_type,
    course_id,
    module_id,
    quiz_id,
    metadata
  ) values (
    requested_user_id,
    'quiz_attempted',
    requested_course_id,
    requested_module_id,
    current_attempt.quiz_id,
    jsonb_build_object(
      'attempt_number', current_attempt.attempt_number,
      'quiz_version', current_attempt.quiz_version,
      'score', requested_score,
      'max_score', requested_max_score,
      'passed', requested_passed
    )
  );

  if requested_passed then
    insert into public.pipstart_assessment_completions (
      user_id,
      quiz_id,
      earned_at,
      highest_passed_version,
      last_passed_at
    ) values (
      requested_user_id,
      current_attempt.quiz_id,
      change_time,
      current_attempt.quiz_version,
      change_time
    )
    on conflict (user_id, quiz_id) do update set
      earned_at = least(
        public.pipstart_assessment_completions.earned_at,
        excluded.earned_at
      ),
      highest_passed_version = greatest(
        public.pipstart_assessment_completions.highest_passed_version,
        excluded.highest_passed_version
      ),
      last_passed_at = greatest(
        public.pipstart_assessment_completions.last_passed_at,
        excluded.last_passed_at
      );

    insert into public.pipstart_learning_events (
      user_id,
      event_type,
      course_id,
      module_id,
      quiz_id,
      metadata
    ) values (
      requested_user_id,
      'quiz_passed',
      requested_course_id,
      requested_module_id,
      current_attempt.quiz_id,
      jsonb_build_object(
        'attempt_number', current_attempt.attempt_number,
        'quiz_version', current_attempt.quiz_version,
        'score', requested_score,
        'max_score', requested_max_score
      )
    );
  end if;

  return next current_attempt;
end;
$$;

revoke all on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb, text, text, text, integer, jsonb
) from public, anon, authenticated;
grant execute on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb, text, text, text, integer, jsonb
) to service_role;


commit;
