create table public.email_jobs (
  id uuid primary key default gen_random_uuid(),

  enrolment_id uuid not null
    references public.course_enrolments (id)
    on delete cascade,

  initial_submission_id uuid not null
    references public.lead_submissions (submission_id)
    on delete cascade,

  job_type text not null default 'course_confirmation',

  status text not null default 'pending',

  attempt_count integer not null default 0,

  available_at timestamptz not null default now(),

  queued_at timestamptz,
  processing_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,

  last_error_code text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint email_jobs_job_type_check
    check (
      job_type in (
        'course_confirmation'
      )
    ),

  constraint email_jobs_status_check
    check (
      status in (
        'pending',
        'queued',
        'processing',
        'sent',
        'failed',
        'dead_letter'
      )
    ),

  constraint email_jobs_attempt_count_check
    check (attempt_count >= 0),

  constraint email_jobs_last_error_code_check
    check (
      last_error_code is null
      or char_length(btrim(last_error_code)) between 1 and 100
    ),

  constraint email_jobs_enrolment_job_unique
    unique (enrolment_id, job_type)
);

comment on table public.email_jobs is
  'Durable Skillcima asynchronous email jobs. A course confirmation job is created atomically when a lead submission completes.';

comment on column public.email_jobs.enrolment_id is
  'Course enrolment that owns this email workflow. Email addresses and raw confirmation tokens are intentionally not duplicated into this table.';

comment on column public.email_jobs.initial_submission_id is
  'Submission whose successful completion first created this email job.';

comment on column public.email_jobs.job_type is
  'Application email workflow type. Initially restricted to course_confirmation.';

comment on column public.email_jobs.status is
  'Application-level email job state: pending, queued, processing, sent, failed, or dead_letter.';

comment on column public.email_jobs.available_at is
  'Earliest time at which this job is eligible to be dispatched to asynchronous processing.';

create index email_jobs_dispatch_index
  on public.email_jobs (
    status,
    available_at,
    created_at
  )
  where status in ('pending', 'failed');

alter table public.email_jobs
  enable row level security;

grant select, insert, update
  on table public.email_jobs
  to service_role;

revoke all privileges
  on table public.email_jobs
  from anon, authenticated;


create or replace function public.skillcima_create_confirmation_email_job()
returns trigger
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  if new.enrolment_id is null then
    raise exception 'COMPLETED_SUBMISSION_MISSING_ENROLMENT'
      using errcode = 'P0001';
  end if;

  insert into public.email_jobs (
    enrolment_id,
    initial_submission_id,
    job_type,
    status
  )
  values (
    new.enrolment_id,
    new.submission_id,
    'course_confirmation',
    'pending'
  )
  on conflict (enrolment_id, job_type)
    do nothing;

  return new;
end;
$$;

comment on function public.skillcima_create_confirmation_email_job() is
  'Creates one durable course-confirmation email job when a Skillcima lead submission first reaches completed status.';

revoke all
  on function public.skillcima_create_confirmation_email_job()
  from public;

revoke all
  on function public.skillcima_create_confirmation_email_job()
  from anon, authenticated;

grant execute
  on function public.skillcima_create_confirmation_email_job()
  to service_role;


create trigger lead_submissions_create_confirmation_email_job
after update of status, enrolment_id
on public.lead_submissions
for each row
when (
  new.status = 'completed'
  and old.status is distinct from new.status
)
execute function public.skillcima_create_confirmation_email_job();
