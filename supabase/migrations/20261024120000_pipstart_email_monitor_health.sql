-- Additive monitor health only. No sends, schedules, secrets, cleanup or retries.
begin;
alter table public.pipstart_email_monitor_sweeps
  add column manual_alerts bigint check (manual_alerts >= 0),
  add column overdue_alerts bigint check (overdue_alerts >= 0),
  add column stale_runs bigint check (stale_runs >= 0);
-- NULL means not assessed (historical rows and compatible old-client writes).
create index pipstart_email_sweeps_running_started
  on public.pipstart_email_monitor_sweeps(started_at) where status='running';

create function public.pipstart_email_monitor_health()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'manual_alerts',count(*) filter (where a.first_attempt_at < now()-interval '23 hours'),
    'overdue_alerts',count(*) filter (where a.created_at <= now()-interval '15 minutes'),
    'stale_runs',(select count(*) from public.pipstart_email_monitor_sweeps s
      where s.status='running' and s.started_at <= now()-interval '10 minutes'))
  from public.pipstart_account_email_alerts a
  where a.accepted_at is null and a.resolved_at is null;
$$;
revoke all on function public.pipstart_email_monitor_health() from public, anon, authenticated;
grant execute on function public.pipstart_email_monitor_health() to service_role;
commit;
