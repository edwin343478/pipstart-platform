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
  v_processing_at timestamptz;
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
    ej.attempt_count,
    ej.processing_at
  into
    v_job_type,
    v_status,
    v_attempt_count,
    v_processing_at
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
    if v_processing_at is not null
       and v_processing_at > now() - interval '15 minutes' then
      return query
      select
        'already_processing'::text,
        v_attempt_count;

      return;
    end if;

    -- A missing or stale processing timestamp means the
    -- previous consumer is treated as abandoned. The job
    -- may be safely reclaimed as a new processing attempt.
  elsif v_status not in (
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

comment on function public.skillcima_claim_email_job(uuid, text) is
  'Atomically claims a Skillcima email job. Fresh processing leases reject concurrent consumers; processing leases stale for at least 15 minutes may be reclaimed after an abandoned consumer.';

revoke all
  on function public.skillcima_claim_email_job(uuid, text)
  from public, anon, authenticated;

grant execute
  on function public.skillcima_claim_email_job(uuid, text)
  to service_role;
