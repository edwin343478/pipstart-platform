create or replace function public.skillcima_claim_email_job(
  p_job_id uuid,
  p_job_type text
)
returns table (
  result_status text,
  result_attempt_count integer
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_job_type text;
  v_status text;
  v_attempt_count integer;
begin
  if p_job_id is null then
    raise exception 'EMAIL_JOB_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_job_type is null
     or char_length(btrim(p_job_type)) not between 1 and 100 then
    raise exception 'EMAIL_JOB_TYPE_INVALID'
      using errcode = 'P0001';
  end if;

  select
    ej.job_type,
    ej.status,
    ej.attempt_count
  into
    v_job_type,
    v_status,
    v_attempt_count
  from public.email_jobs ej
  where ej.id = p_job_id
  for update;

  if not found then
    return query
    select
      'not_found'::text,
      null::integer;

    return;
  end if;

  if v_job_type <> btrim(p_job_type) then
    return query
    select
      'job_type_mismatch'::text,
      v_attempt_count;

    return;
  end if;

  if v_status = 'sent' then
    return query
    select
      'already_sent'::text,
      v_attempt_count;

    return;
  end if;

  if v_status = 'dead_letter' then
    return query
    select
      'dead_letter'::text,
      v_attempt_count;

    return;
  end if;

  if v_status = 'processing' then
    return query
    select
      'already_processing'::text,
      v_attempt_count;

    return;
  end if;

  if v_status not in (
    'pending',
    'failed',
    'queued'
  ) then
    return query
    select
      'not_claimable'::text,
      v_attempt_count;

    return;
  end if;

  update public.email_jobs
  set
    status = 'processing',
    attempt_count = v_attempt_count + 1,
    processing_at = now(),
    last_error_code = null,
    updated_at = now()
  where id = p_job_id;

  return query
  select
    'claimed'::text,
    v_attempt_count + 1;
end;
$$;


create or replace function public.skillcima_release_email_job(
  p_job_id uuid,
  p_error_code text
)
returns text
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_status text;
begin
  if p_job_id is null then
    raise exception 'EMAIL_JOB_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_error_code is null
     or char_length(btrim(p_error_code)) not between 1 and 100 then
    raise exception 'EMAIL_JOB_ERROR_CODE_INVALID'
      using errcode = 'P0001';
  end if;

  select ej.status
  into v_status
  from public.email_jobs ej
  where ej.id = p_job_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_status = 'sent' then
    return 'already_sent';
  end if;

  if v_status = 'dead_letter' then
    return 'dead_letter';
  end if;

  if v_status not in (
    'processing',
    'queued'
  ) then
    return 'invalid_state';
  end if;

  update public.email_jobs
  set
    status = 'queued',
    processing_at = null,
    failed_at = now(),
    last_error_code = btrim(p_error_code),
    updated_at = now()
  where id = p_job_id;

  return 'queued';
end;
$$;


create or replace function public.skillcima_mark_email_job_sent(
  p_job_id uuid
)
returns text
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_status text;
begin
  if p_job_id is null then
    raise exception 'EMAIL_JOB_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  select ej.status
  into v_status
  from public.email_jobs ej
  where ej.id = p_job_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_status = 'sent' then
    return 'already_sent';
  end if;

  if v_status <> 'processing' then
    return 'invalid_state';
  end if;

  update public.email_jobs
  set
    status = 'sent',
    processing_at = null,
    sent_at = coalesce(sent_at, now()),
    last_error_code = null,
    updated_at = now()
  where id = p_job_id;

  return 'sent';
end;
$$;


create or replace function public.skillcima_mark_email_job_dead_letter(
  p_job_id uuid,
  p_error_code text
)
returns text
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_status text;
begin
  if p_job_id is null then
    raise exception 'EMAIL_JOB_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_error_code is null
     or char_length(btrim(p_error_code)) not between 1 and 100 then
    raise exception 'EMAIL_JOB_ERROR_CODE_INVALID'
      using errcode = 'P0001';
  end if;

  select ej.status
  into v_status
  from public.email_jobs ej
  where ej.id = p_job_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_status = 'sent' then
    return 'already_sent';
  end if;

  if v_status = 'dead_letter' then
    return 'already_dead_letter';
  end if;

  update public.email_jobs
  set
    status = 'dead_letter',
    processing_at = null,
    failed_at = now(),
    last_error_code = btrim(p_error_code),
    updated_at = now()
  where id = p_job_id;

  return 'dead_letter';
end;
$$;


comment on function public.skillcima_claim_email_job(uuid, text) is
  'Atomically claims a Skillcima email job for Queue processing and increments the application delivery-attempt counter.';

comment on function public.skillcima_release_email_job(uuid, text) is
  'Returns a temporarily failed Queue-owned email job to queued state so Cloudflare Queue retry remains the sole retry mechanism.';

comment on function public.skillcima_mark_email_job_sent(uuid) is
  'Marks a processing Skillcima email job as sent after a real email provider confirms acceptance.';

comment on function public.skillcima_mark_email_job_dead_letter(uuid, text) is
  'Marks an exhausted Skillcima email job as dead_letter when its Queue message reaches the DLQ.';


revoke all
  on function public.skillcima_claim_email_job(uuid, text)
  from public, anon, authenticated;

revoke all
  on function public.skillcima_release_email_job(uuid, text)
  from public, anon, authenticated;

revoke all
  on function public.skillcima_mark_email_job_sent(uuid)
  from public, anon, authenticated;

revoke all
  on function public.skillcima_mark_email_job_dead_letter(uuid, text)
  from public, anon, authenticated;


grant execute
  on function public.skillcima_claim_email_job(uuid, text)
  to service_role;

grant execute
  on function public.skillcima_release_email_job(uuid, text)
  to service_role;

grant execute
  on function public.skillcima_mark_email_job_sent(uuid)
  to service_role;

grant execute
  on function public.skillcima_mark_email_job_dead_letter(uuid, text)
  to service_role;
