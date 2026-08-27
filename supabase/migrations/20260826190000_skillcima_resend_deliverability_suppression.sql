-- Skillcima Resend deliverability suppression.
--
-- Builds on the authenticated Resend webhook event ledger.
--
-- A correlated email.bounced or email.complained event changes the
-- related course enrolment to the existing non-deliverable
-- "suppressed" state.
--
-- Explicit newsletter consent is independent and is never changed.
-- Explicit course-delivery "unsubscribed" state is preserved.
--
-- Provider-message advisory locks serialize webhook persistence and
-- sent-state correlation so a webhook arriving before provider-message
-- persistence can still be correlated and applied safely.
--
-- Historical migrations remain unchanged.


grant update (email_job_id)
  on table public.resend_webhook_events
  to service_role;


create or replace function public.skillcima_record_resend_webhook_event(
  p_provider_event_id text,
  p_event_type text,
  p_provider_message_id text,
  p_provider_created_at timestamptz
)
returns table (
  result_status text,
  result_event_id uuid,
  result_email_job_id uuid
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_provider_event_id text;
  v_event_type text;
  v_provider_message_id text;

  v_existing record;

  v_email_job_id uuid;
  v_enrolment_id uuid;
  v_inserted_id uuid;
  v_result_email_job_id uuid;

  v_now timestamptz := now();
begin
  if p_provider_event_id is null then
    raise exception 'RESEND_WEBHOOK_EVENT_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_provider_event_id :=
    btrim(p_provider_event_id);

  if char_length(v_provider_event_id)
       not between 1 and 200 then
    raise exception 'RESEND_WEBHOOK_EVENT_ID_INVALID'
      using errcode = 'P0001';
  end if;


  if p_event_type is null then
    raise exception 'RESEND_WEBHOOK_EVENT_TYPE_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_event_type :=
    btrim(p_event_type);

  if v_event_type not in (
    'email.bounced',
    'email.complained'
  ) then
    raise exception 'RESEND_WEBHOOK_EVENT_TYPE_INVALID'
      using errcode = 'P0001';
  end if;


  if p_provider_message_id is null then
    raise exception 'RESEND_PROVIDER_MESSAGE_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_provider_message_id :=
    btrim(p_provider_message_id);

  if char_length(v_provider_message_id)
       not between 1 and 200 then
    raise exception 'RESEND_PROVIDER_MESSAGE_ID_INVALID'
      using errcode = 'P0001';
  end if;


  -- Serialize webhook persistence with sent-state provider correlation.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_provider_message_id,
      0
    )
  );


  select
    ej.id,
    ej.enrolment_id
  into
    v_email_job_id,
    v_enrolment_id
  from public.email_jobs ej
  where
    ej.provider_message_id =
      v_provider_message_id
  for update of ej;


  insert into public.resend_webhook_events (
    provider_event_id,
    event_type,
    provider_message_id,
    email_job_id,
    provider_created_at
  )
  values (
    v_provider_event_id,
    v_event_type,
    v_provider_message_id,
    v_email_job_id,
    p_provider_created_at
  )
  on conflict (provider_event_id)
  do nothing
  returning id
  into v_inserted_id;


  if v_inserted_id is not null then
    if v_enrolment_id is not null then
      update public.course_enrolments
      set
        status = 'suppressed',
        updated_at = v_now
      where id = v_enrolment_id
        and status in (
          'pending_confirmation',
          'confirmed'
        );
    end if;

    return query
    select
      'recorded'::text,
      v_inserted_id,
      v_email_job_id;

    return;
  end if;


  select
    rwe.id,
    rwe.event_type,
    rwe.provider_message_id,
    rwe.email_job_id,
    rwe.provider_created_at
  into v_existing
  from public.resend_webhook_events rwe
  where
    rwe.provider_event_id =
      v_provider_event_id;


  if
    v_existing.event_type
      is distinct from
      v_event_type

    or

    v_existing.provider_message_id
      is distinct from
      v_provider_message_id

    or

    v_existing.provider_created_at
      is distinct from
      p_provider_created_at
  then
    return query
    select
      'event_mismatch'::text,
      v_existing.id,
      v_existing.email_job_id;

    return;
  end if;


  v_result_email_job_id :=
    v_existing.email_job_id;


  -- An exact replay can safely repair an earlier event that arrived
  -- before the provider message identifier was persisted.
  if v_result_email_job_id is null
     and v_email_job_id is not null then
    update public.resend_webhook_events
    set
      email_job_id = v_email_job_id
    where id = v_existing.id
      and email_job_id is null;

    v_result_email_job_id :=
      v_email_job_id;
  end if;


  -- Re-applying this guarded transition is idempotent. It also allows
  -- an event recorded before this migration to enforce suppression on
  -- an exact authenticated replay.
  if v_enrolment_id is not null
     and v_result_email_job_id = v_email_job_id then
    update public.course_enrolments
    set
      status = 'suppressed',
      updated_at = v_now
    where id = v_enrolment_id
      and status in (
        'pending_confirmation',
        'confirmed'
      );
  end if;


  return query
  select
    'already_recorded'::text,
    v_existing.id,
    v_result_email_job_id;
end;
$$;


comment on function
  public.skillcima_record_resend_webhook_event(
    text,
    text,
    text,
    timestamptz
  ) is
  'Idempotently records authenticated Resend bounce or complaint evidence and suppresses the correlated course-delivery enrolment. Exact replays remain recognizable, late provider correlation is repairable, and newsletter consent is never changed.';


revoke all
  on function
    public.skillcima_record_resend_webhook_event(
      text,
      text,
      text,
      timestamptz
    )
  from public, anon, authenticated;

grant execute
  on function
    public.skillcima_record_resend_webhook_event(
      text,
      text,
      text,
      timestamptz
    )
  to service_role;


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

  v_provider_message_id :=
    btrim(p_provider_message_id);

  if char_length(v_provider_message_id)
       not between 1 and 200 then
    raise exception 'EMAIL_PROVIDER_MESSAGE_ID_INVALID'
      using errcode = 'P0001';
  end if;


  -- Serialize sent-state persistence with webhook correlation.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_provider_message_id,
      0
    )
  );


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
       and v_job.provider_message_id
         <> v_provider_message_id then
      return 'provider_mismatch';
    end if;

    if v_job.provider_message_id is null then
      if exists (
        select 1
        from public.email_jobs ej
        where
          ej.provider_message_id =
            v_provider_message_id
          and ej.id <> p_job_id
      ) then
        return 'provider_conflict';
      end if;

      begin
        update public.email_jobs
        set
          provider_message_id =
            v_provider_message_id,
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


    update public.resend_webhook_events
    set
      email_job_id = p_job_id
    where
      provider_message_id =
        v_provider_message_id
      and email_job_id is null;


    if exists (
      select 1
      from public.resend_webhook_events rwe
      where
        rwe.provider_message_id =
          v_provider_message_id
        and rwe.email_job_id =
          p_job_id
        and rwe.event_type in (
          'email.bounced',
          'email.complained'
        )
    ) then
      update public.course_enrolments
      set
        status = 'suppressed',
        updated_at = v_now
      where id = v_job.enrolment_id
        and status in (
          'pending_confirmation',
          'confirmed'
        );
    end if;


    return 'already_sent';
  end if;


  if v_job.status <> 'processing' then
    return 'invalid_state';
  end if;


  if exists (
    select 1
    from public.email_jobs ej
    where
      ej.provider_message_id =
        v_provider_message_id
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
      provider_message_id =
        v_provider_message_id,
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


  update public.resend_webhook_events
  set
    email_job_id = p_job_id
  where
    provider_message_id =
      v_provider_message_id
    and email_job_id is null;


  if exists (
    select 1
    from public.resend_webhook_events rwe
    where
      rwe.provider_message_id =
        v_provider_message_id
      and rwe.email_job_id =
        p_job_id
      and rwe.event_type in (
        'email.bounced',
        'email.complained'
      )
  ) then
    update public.course_enrolments
    set
      status = 'suppressed',
      updated_at = v_now
    where id = v_job.enrolment_id
      and status in (
        'pending_confirmation',
        'confirmed'
      );
  end if;


  return 'sent';
end;
$$;


comment on function
  public.skillcima_mark_email_job_sent(uuid, text) is
  'Atomically marks a processing Skillcima email job sent, records its provider message identifier, repairs earlier Resend webhook correlation, and suppresses the enrolment when authenticated bounce or complaint evidence already exists.';


revoke all
  on function
    public.skillcima_mark_email_job_sent(uuid, text)
  from public, anon, authenticated;

grant execute
  on function
    public.skillcima_mark_email_job_sent(uuid, text)
  to service_role;
