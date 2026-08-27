-- Skillcima five-day course email job-type foundation.
--
-- M4F.1A deliberately changes only the allowed email-job types.
--
-- Existing course-confirmation behavior is preserved.
-- No five-day jobs are created by this migration.
-- No scheduling trigger or delivery behavior is introduced here.
-- Historical migrations remain unchanged.

alter table public.email_jobs
  drop constraint email_jobs_job_type_check;

alter table public.email_jobs
  add constraint email_jobs_job_type_check
  check (
    job_type in (
      'course_confirmation',
      'course_day_1',
      'course_day_2',
      'course_day_3',
      'course_day_4',
      'course_day_5'
    )
  );

comment on column public.email_jobs.job_type is
  'Application email workflow type: course confirmation or one of the five confirmed-course lesson deliveries.';