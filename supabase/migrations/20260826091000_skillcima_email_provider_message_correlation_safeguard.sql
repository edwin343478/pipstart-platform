create or replace function public.skillcima_mark_email_job_sent(
  p_job_id uuid,
  p_provider_message_id text
)
returns text
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_job record;
  v_now timestamptz := now();
  v_sent_at timestamptz;
  v_provider_message_id text;
begin
  if p_job_id is null then
    raise exception 'EMAIL_JOB_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_provider_message_id is null then
    raise exception 'EMAIL_PROVIDER_MESSAGE_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_provider_message_id := btrim(p_provider_message_id);

  if char_length(v_provider_message_id) not between 1 and 200 then
    raise exception 'EMAIL_PROVIDER_MESSAGE_ID_INVALID'
      using errcode = 'P0001';
  end if;

  select
    ej.status,
    ej.job_type,
    ej.enrolment_id,
    ej.sent_at,
    ej.provider_message_id
  into v_job
  from public.email_jobs ej
  where ej.id = p_job_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_job.status = 'sent' then
    if v_job.provider_message_id is not null
       and v_job.provider_message_id <> v_provider_message_id then
      return 'provider_mismatch';
    end if;

    if v_job.provider_message_id is null then
      if exists (
        select 1
        from public.email_jobs ej
        where ej.provider_message_id = v_provider_message_id
          and ej.id <> p_job_id
      ) then
        return 'provider_conflict';
      end if;

      begin
        update public.email_jobs
        set
          provider_message_id = v_provider_message_id,
          updated_at = v_now
        where id = p_job_id;
      exception
        when unique_violation then
          return 'provider_conflict';
      end;
    end if;

    if v_job.job_type = 'course_confirmation' then
      update public.course_enrolments
      set
        confirmation_sent_at =
          coalesce(
            confirmation_sent_at,
            v_job.sent_at,
            v_now
          ),
        updated_at = v_now
      where id = v_job.enrolment_id
        and confirmation_sent_at is null;
    end if;

    return 'already_sent';
  end if;

  if v_job.status <> 'processing' then
    return 'invalid_state';
  end if;

  if exists (
    select 1
    from public.email_jobs ej
    where ej.provider_message_id = v_provider_message_id
      and ej.id <> p_job_id
  ) then
    return 'provider_conflict';
  end if;

  begin
    update public.email_jobs
    set
      status = 'sent',
      processing_at = null,
      sent_at = coalesce(sent_at, v_now),
      provider_message_id = v_provider_message_id,
      last_error_code = null,
      updated_at = v_now
    where id = p_job_id
    returning sent_at
    into v_sent_at;
  exception
    when unique_violation then
      return 'provider_conflict';
  end;

  if v_job.job_type = 'course_confirmation' then
    update public.course_enrolments
    set
      confirmation_sent_at =
        coalesce(
          confirmation_sent_at,
          v_sent_at
        ),
      updated_at = v_now
    where id = v_job.enrolment_id
      and confirmation_sent_at is null;
  end if;

  return 'sent';
end;
$$;

comment on function
  public.skillcima_mark_email_job_sent(uuid, text) is
  'Atomically marks a processing Skillcima email job sent, records its provider message identifier, and preserves course-confirmation confirmation_sent_at evidence idempotently.';


revoke all
  on function public.skillcima_mark_email_job_sent(uuid, text)
  from public, anon, authenticated;

grant execute
  on function public.skillcima_mark_email_job_sent(uuid, text)
  to service_role;