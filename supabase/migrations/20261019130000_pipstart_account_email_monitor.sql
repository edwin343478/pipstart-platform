-- Additive monitoring only: no changes to Auth, learner preferences or Skillcima.
begin;
create table public.pipstart_account_email_events (
  event_id text primary key check (event_id ~ '^[A-Za-z0-9_-]{1,200}$'),
  message_id text not null check (message_id ~ '^[A-Za-z0-9_-]{1,200}$'),
  event_type text not null check (event_type in ('email.sent','email.delivered','email.delivery_delayed','email.failed','email.bounced','email.complained','email.suppressed')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index pipstart_email_events_message on public.pipstart_account_email_events(message_id, occurred_at);
create index pipstart_email_events_received on public.pipstart_account_email_events(received_at);
create table public.pipstart_account_email_alerts (
  message_id text not null,
  event_type text not null check (event_type in ('email.failed','email.bounced','email.complained','email.suppressed')),
  created_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  lease_until timestamptz,
  lease_token uuid,
  attempts integer not null default 0,
  accepted_at timestamptz,
  provider_id text,
  primary key(message_id, event_type)
);
alter table public.pipstart_account_email_events enable row level security;
alter table public.pipstart_account_email_alerts enable row level security;
revoke all on public.pipstart_account_email_events, public.pipstart_account_email_alerts from public, anon, authenticated;
grant select, insert, update, delete on public.pipstart_account_email_events, public.pipstart_account_email_alerts to service_role;

create function public.pipstart_record_email_event(p_event_id text, p_message_id text, p_event_type text, p_occurred_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.pipstart_account_email_events(event_id,message_id,event_type,occurred_at)
    values(p_event_id,p_message_id,p_event_type,p_occurred_at) on conflict do nothing;
  if not exists (select 1 from public.pipstart_account_email_events where event_id=p_event_id and message_id=p_message_id and event_type=p_event_type and occurred_at=p_occurred_at) then
    raise exception 'event conflict';
  end if;
  if p_event_type in ('email.failed','email.bounced','email.complained','email.suppressed') then
    insert into public.pipstart_account_email_alerts(message_id,event_type) values(p_message_id,p_event_type) on conflict do nothing;
  end if;
end $$;

create function public.pipstart_claim_email_alert(p_message_id text, p_event_type text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare a public.pipstart_account_email_alerts%rowtype; t uuid;
begin
  select * into a from public.pipstart_account_email_alerts where message_id=p_message_id and event_type=p_event_type for update;
  if not found then raise exception 'missing alert'; end if;
  if a.accepted_at is not null then return jsonb_build_object('state','accepted','token',null); end if;
  -- Resend idempotency expires after 24h. Stop at 23h; investigate manually thereafter.
  if a.first_attempt_at < now() - interval '23 hours' then return jsonb_build_object('state','manual','token',null); end if;
  if a.lease_until > now() then return jsonb_build_object('state','busy','token',null); end if;
  t := gen_random_uuid();
  update public.pipstart_account_email_alerts set first_attempt_at=coalesce(first_attempt_at,now()), lease_until=now()+interval '1 minute', lease_token=t, attempts=attempts+1
    where message_id=p_message_id and event_type=p_event_type;
  return jsonb_build_object('state','leased','token',t);
end $$;

create function public.pipstart_accept_email_alert(p_message_id text, p_event_type text, p_token uuid, p_provider_id text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_provider_id is null or p_provider_id !~ '^[A-Za-z0-9_-]{1,200}$' then raise exception 'invalid provider id'; end if;
  update public.pipstart_account_email_alerts set accepted_at=now(), provider_id=p_provider_id, lease_until=null, lease_token=null
    where message_id=p_message_id and event_type=p_event_type and lease_token=p_token and accepted_at is null;
  return found;
end $$;

revoke all on function public.pipstart_record_email_event(text,text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.pipstart_claim_email_alert(text,text) from public, anon, authenticated;
revoke all on function public.pipstart_accept_email_alert(text,text,uuid,text) from public, anon, authenticated;
grant execute on function public.pipstart_record_email_event(text,text,text,timestamptz) to service_role;
grant execute on function public.pipstart_claim_email_alert(text,text) to service_role;
grant execute on function public.pipstart_accept_email_alert(text,text,uuid,text) to service_role;
commit;
