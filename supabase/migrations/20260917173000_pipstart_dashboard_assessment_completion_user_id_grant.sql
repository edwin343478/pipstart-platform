begin;

-- The learner dashboard filters assessment completions by user_id.
-- RLS still limits authenticated learners to their own rows; this column grant
-- only permits that explicit filter to reference user_id.
grant select (user_id)
  on public.pipstart_assessment_completions
  to authenticated;

commit;
