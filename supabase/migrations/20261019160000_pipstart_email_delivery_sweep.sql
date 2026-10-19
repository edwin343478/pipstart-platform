-- Step 2 foundation only. No cron jobs, extensions, secrets or HTTP calls.
begin;
alter table public.pipstart_account_email_alerts
  drop constraint pipstart_account_email_alerts_event_type_check;
alter table public.pipstart_account_email_alerts
  add constraint pipstart_account_email_alerts_event_type_check check
    (event_type in ('email.failed','email.bounced','email.complained','email.suppressed','email.delivery_missing'));
alter table public.pipstart_account_email_alerts add column resolved_at timestamptz;
create index pipstart_email_alerts_pending on public.pipstart_account_email_alerts(created_at)
  where accepted_at is null and resolved_at is null;

create table public.pipstart_email_monitor_sweeps (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check(status in ('running','completed','partial')),
  queued integer not null default 0 check(queued >= 0),
  accepted integer not null default 0 check(accepted >= 0),
  skipped integer not null default 0 check(skipped >= 0),
  failed integer not null default 0 check(failed >= 0),
  deferred integer not null default 0 check(deferred >= 0)
);
alter table public.pipstart_email_monitor_sweeps enable row level security;
revoke all on public.pipstart_email_monitor_sweeps from public, anon, authenticated;
grant select, insert, update, delete on public.pipstart_email_monitor_sweeps to service_role;
create index pipstart_email_sweeps_started on public.pipstart_email_monitor_sweeps(started_at);

create function public.pipstart_queue_missing_email_deliveries()
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  -- A late terminal callback resolves a warning; it never triggers another send.
  update public.pipstart_account_email_alerts a set resolved_at=now()
    where a.event_type='email.delivery_missing' and a.resolved_at is null
      and exists (select 1 from public.pipstart_account_email_events e where e.message_id=a.message_id
        and e.event_type in ('email.delivered','email.failed','email.bounced','email.complained','email.suppressed'));
  insert into public.pipstart_account_email_alerts(message_id,event_type)
    select e.message_id,'email.delivery_missing'
      from public.pipstart_account_email_events e
      where e.event_type in ('email.sent','email.delivery_delayed')
        and not exists (select 1 from public.pipstart_account_email_events t where t.message_id=e.message_id
          and t.event_type in ('email.delivered','email.failed','email.bounced','email.complained','email.suppressed'))
        and not exists (select 1 from public.pipstart_account_email_alerts a
          where a.message_id=e.message_id and a.event_type='email.delivery_missing')
      group by e.message_id
      -- Use receipt time, not the provider timestamp: old-event replays do not
      -- bypass the fifteen-minute observation period.
      having min(e.received_at) <= now()-interval '15 minutes'
      order by min(e.received_at),e.message_id limit 100
    on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function public.pipstart_claim_email_alert(p_message_id text, p_event_type text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare a public.pipstart_account_email_alerts%rowtype; t uuid;
begin
  select * into a from public.pipstart_account_email_alerts
    where message_id=p_message_id and event_type=p_event_type for update;
  if not found then raise exception 'missing alert'; end if;
  if a.accepted_at is not null then return jsonb_build_object('state','accepted','token',null); end if;
  -- Recheck evidence under the alert-row lock immediately before leasing.
  if p_event_type='email.delivery_missing' and (a.resolved_at is not null or exists
    (select 1 from public.pipstart_account_email_events e where e.message_id=p_message_id
      and e.event_type in ('email.delivered','email.failed','email.bounced','email.complained','email.suppressed'))) then
    update public.pipstart_account_email_alerts set resolved_at=coalesce(resolved_at,now())
      where message_id=p_message_id and event_type=p_event_type;
    return jsonb_build_object('state','resolved','token',null);
  end if;
  if a.first_attempt_at < now()-interval '23 hours' then return jsonb_build_object('state','manual','token',null); end if;
  if a.lease_until > now() then return jsonb_build_object('state','busy','token',null); end if;
  t := gen_random_uuid();
  update public.pipstart_account_email_alerts
    set first_attempt_at=coalesce(first_attempt_at,now()),lease_until=now()+interval '1 minute',lease_token=t,attempts=attempts+1
    where message_id=p_message_id and event_type=p_event_type;
  return jsonb_build_object('state','leased','token',t);
end $$;

create function public.pipstart_list_due_email_alerts()
returns table(message_id text,event_type text)
language sql security definer set search_path = '' as $$
  select a.message_id,a.event_type from public.pipstart_account_email_alerts a
    where a.accepted_at is null and a.resolved_at is null
      and (a.lease_until is null or a.lease_until <= now())
      and (a.first_attempt_at is null or a.first_attempt_at >= now()-interval '23 hours')
    order by a.created_at,a.message_id,a.event_type limit 5;
$$;

revoke all on function public.pipstart_queue_missing_email_deliveries() from public, anon, authenticated;
revoke all on function public.pipstart_list_due_email_alerts() from public, anon, authenticated;
revoke all on function public.pipstart_claim_email_alert(text,text) from public, anon, authenticated;
grant execute on function public.pipstart_queue_missing_email_deliveries() to service_role;
grant execute on function public.pipstart_list_due_email_alerts() to service_role;
grant execute on function public.pipstart_claim_email_alert(text,text) to service_role;
commit;
