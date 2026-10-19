-- LOCAL/ISOLATED database only, after both M21 migrations. Fixtures roll back.
begin;
do $$
declare n integer; c jsonb; message text; terminal text; count_before integer;
begin
  if has_table_privilege('anon','public.pipstart_email_monitor_sweeps','SELECT')
    or has_table_privilege('authenticated','public.pipstart_email_monitor_sweeps','SELECT')
    or has_function_privilege('anon','public.pipstart_queue_missing_email_deliveries()','EXECUTE')
    or has_function_privilege('authenticated','public.pipstart_list_due_email_alerts()','EXECUTE') then
    raise exception 'sweep permissions leaked';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.pipstart_email_monitor_sweeps'::regclass) then raise exception 'sweep RLS disabled'; end if;
  perform public.pipstart_record_email_event('sweep_recent','sweep_recent','email.sent',now()-interval '1 day');
  -- Old provider timestamp alone must not bypass the receipt-time threshold.
  n := public.pipstart_queue_missing_email_deliveries();
  if exists(select 1 from public.pipstart_account_email_alerts where message_id='sweep_recent') then raise exception 'premature timeout'; end if;
  perform public.pipstart_record_email_event('sweep_old','sweep_old','email.sent',now());
  update public.pipstart_account_email_events set received_at=now()-interval '16 minutes' where event_id='sweep_old';
  perform public.pipstart_record_email_event('sweep_delayed','sweep_delayed','email.delivery_delayed',now());
  update public.pipstart_account_email_events set received_at=now()-interval '16 minutes' where event_id='sweep_delayed';
  foreach terminal in array array['email.delivered','email.failed','email.bounced','email.complained','email.suppressed'] loop
    message := 'sweep_terminal_' || replace(terminal,'.','_');
    perform public.pipstart_record_email_event(message || '_sent',message,'email.sent',now());
    update public.pipstart_account_email_events set received_at=now()-interval '16 minutes' where event_id=message || '_sent';
    perform public.pipstart_record_email_event(message || '_terminal',message,terminal,now());
  end loop;
  n := public.pipstart_queue_missing_email_deliveries();
  if n <> 2 then raise exception 'expected two timeout candidates; got %',n; end if;
  if exists(select 1 from public.pipstart_account_email_alerts where message_id like 'sweep_terminal_%' and event_type='email.delivery_missing') then raise exception 'terminal event not excluded'; end if;
  if public.pipstart_queue_missing_email_deliveries() <> 0 then raise exception 'duplicate timeout queued'; end if;
  -- Delivery arrives after enqueue but before claim: resolve without sending.
  perform public.pipstart_record_email_event('sweep_late_delivery','sweep_old','email.delivered',now());
  c := public.pipstart_claim_email_alert('sweep_old','email.delivery_missing');
  if c->>'state' <> 'resolved' then raise exception 'late delivery not resolved'; end if;
  if not exists(select 1 from public.pipstart_account_email_alerts where message_id='sweep_old' and resolved_at is not null and attempts=0) then raise exception 'resolved row was attempted'; end if;
  -- Outstanding missing-delivery alert has normal exclusive-lease semantics.
  c := public.pipstart_claim_email_alert('sweep_delayed','email.delivery_missing');
  if c->>'state' <> 'leased' then raise exception 'timeout claim failed'; end if;
  if public.pipstart_claim_email_alert('sweep_delayed','email.delivery_missing')->>'state' <> 'busy' then raise exception 'lease not exclusive'; end if;
  if not public.pipstart_accept_email_alert('sweep_delayed','email.delivery_missing',(c->>'token')::uuid,'sweep_provider_id') then raise exception 'accept failed'; end if;
  if public.pipstart_claim_email_alert('sweep_delayed','email.delivery_missing')->>'state' <> 'accepted' then raise exception 'accepted alert re-leased'; end if;
  perform public.pipstart_record_email_event('sweep_delayed_delivery','sweep_delayed','email.delivered',now());
  n := public.pipstart_queue_missing_email_deliveries();
  if not exists(select 1 from public.pipstart_account_email_alerts where message_id='sweep_delayed' and accepted_at is not null and resolved_at is not null) then raise exception 'late evidence not recorded after acceptance'; end if;
  -- All existing failure types remain drainable; expired windows stay manual.
  perform public.pipstart_record_email_event('sweep_retry_event','sweep_retry_message','email.failed',now());
  if not exists(select 1 from public.pipstart_list_due_email_alerts() where message_id='sweep_retry_message') then
    -- Existing fixture failure rows can fill the bounded batch. Mark them accepted
    -- only inside this rollback-only test transaction, then check retry selection.
    update public.pipstart_account_email_alerts set accepted_at=now() where message_id like 'sweep_terminal_%';
    if not exists(select 1 from public.pipstart_list_due_email_alerts() where message_id='sweep_retry_message') then raise exception 'failed alert not drainable'; end if;
  end if;
  update public.pipstart_account_email_alerts set first_attempt_at=now()-interval '24 hours' where message_id='sweep_retry_message';
  if exists(select 1 from public.pipstart_list_due_email_alerts() where message_id='sweep_retry_message') then raise exception 'expired retry window selected'; end if;
  if public.pipstart_claim_email_alert('sweep_retry_message','email.failed')->>'state' <> 'manual' then raise exception 'expired alert not manual'; end if;
  select count(*) into count_before from public.pipstart_account_email_events;
  n := public.pipstart_queue_missing_email_deliveries();
  if (select count(*) from public.pipstart_account_email_events) <> count_before then raise exception 'synthetic provider evidence created'; end if;
  -- Internal warning types must never masquerade as provider evidence.
  begin
    perform public.pipstart_record_email_event('sweep_fake_provider','sweep_fake_provider','email.delivery_missing',now());
    raise exception 'internal warning accepted as provider evidence';
  exception when check_violation then null;
  end;
  -- Bound discovery work and dispatch selection without starving later rows.
  insert into public.pipstart_account_email_events(event_id,message_id,event_type,occurred_at,received_at)
    select 'sweep_limit_' || i,'sweep_limit_' || i,'email.sent',now(),now()-interval '16 minutes'
    from generate_series(1,101) i;
  if public.pipstart_queue_missing_email_deliveries() <> 100 then raise exception 'candidate discovery not bounded at 100'; end if;
  if public.pipstart_queue_missing_email_deliveries() <> 1 then raise exception 'later candidate starved'; end if;
  if public.pipstart_queue_missing_email_deliveries() <> 0 then raise exception 'candidate replay not idempotent'; end if;
  if (select count(*) from public.pipstart_list_due_email_alerts()) <> 5 then raise exception 'dispatch batch not bounded at five'; end if;
  raise notice 'M21 delivery-sweep database assertions passed (fixtures rolled back)';
end $$;
rollback;
