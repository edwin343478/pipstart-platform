alter table public.email_jobs
  add column provider_message_id text;

alter table public.email_jobs
  add constraint email_jobs_provider_message_id_check
  check (
    provider_message_id is null
    or (
      provider_message_id = btrim(provider_message_id)
      and char_length(provider_message_id) between 1 and 200
    )
  );

create unique index email_jobs_provider_message_id_unique
  on public.email_jobs (provider_message_id)
  where provider_message_id is not null;

comment on column public.email_jobs.provider_message_id is
  'Provider-assigned email identifier returned after accepted delivery. Used to correlate authenticated provider webhook events back to the originating Skillcima email job.';


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
  v_status text;
  v_existing_provider_message_id text;
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
    ej.provider_message_id
  into
    v_status,
    v_existing_provider_message_id
  from public.email_jobs ej
  where ej.id = p_job_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_status = 'sent' then
    if v_existing_provider_message_id is null
       or v_existing_provider_message_id = v_provider_message_id then
      return 'already_sent';
    end if;

    return 'provider_mismatch';
  end if;

  if v_status <> 'processing' then
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
      sent_at = coalesce(sent_at, now()),
      provider_message_id = v_provider_message_id,
      last_error_code = null,
      updated_at = now()
    where id = p_job_id;
  exception
    when unique_violation then
      return 'provider_conflict';
  end;

  return 'sent';
end;
$$;

comment on function
  public.skillcima_mark_email_job_sent(uuid, text) is
  'Marks a processing Skillcima email job as sent and durably records the provider message identifier required for authenticated delivery-event correlation.';


revoke all
  on function public.skillcima_mark_email_job_sent(uuid, text)
  from public, anon, authenticated;

grant execute
  on function public.skillcima_mark_email_job_sent(uuid, text)
  to service_role;