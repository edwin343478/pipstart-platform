-- Run on LOCAL Supabase AFTER applying the migration. Always rolls back fixtures.
-- psql -v ON_ERROR_STOP=1 -f apps/pipstart/scripts/test-m21-email-monitor.sql
begin;
do $$
declare c jsonb; n integer; ok boolean;
begin
  if has_table_privilege('anon','public.pipstart_account_email_events','SELECT')
    or has_table_privilege('authenticated','public.pipstart_account_email_alerts','SELECT')
    or has_function_privilege('anon','public.pipstart_claim_email_alert(text,text)','EXECUTE')
    or has_function_privilege('authenticated','public.pipstart_record_email_event(text,text,text,timestamp with time zone)','EXECUTE') then
    raise exception 'public permissions leaked';
  end if;
  if (select count(*) from pg_class where oid in ('public.pipstart_account_email_events'::regclass,'public.pipstart_account_email_alerts'::regclass) and relrowsecurity) <> 2 then
    raise exception 'RLS not enabled';
  end if;
  perform public.pipstart_record_email_event('m21_test_failed','m21_test_message','email.failed',now());
  perform public.pipstart_record_email_event('m21_test_failed','m21_test_message','email.failed',now());
  perform public.pipstart_record_email_event('m21_test_another_event','m21_test_message','email.failed',now());
  select count(*) into n from public.pipstart_account_email_alerts where message_id='m21_test_message';
  if n <> 1 then raise exception 'duplicate alert queued'; end if;
  c := public.pipstart_claim_email_alert('m21_test_message','email.failed');
  if c->>'state' <> 'leased' then raise exception 'claim failed'; end if;
  if public.pipstart_claim_email_alert('m21_test_message','email.failed')->>'state' <> 'busy' then raise exception 'lease not exclusive'; end if;
  ok := public.pipstart_accept_email_alert('m21_test_message','email.failed',gen_random_uuid(),'test-provider-id');
  if ok then raise exception 'wrong lease accepted'; end if;
  ok := public.pipstart_accept_email_alert('m21_test_message','email.failed',(c->>'token')::uuid,'test-provider-id');
  if not ok then raise exception 'accept failed'; end if;
  if public.pipstart_claim_email_alert('m21_test_message','email.failed')->>'state' <> 'accepted' then raise exception 'accepted state lost'; end if;
  begin
    perform public.pipstart_record_email_event('m21_test_failed','different-message','email.failed',now());
    raise exception 'expected conflict';
  exception when raise_exception then
    if sqlerrm <> 'event conflict' then raise; end if;
  end;
  perform public.pipstart_record_email_event('m21_test_sent','m21_test_sent_message','email.sent',now());
  if exists(select 1 from public.pipstart_account_email_alerts where message_id='m21_test_sent_message') then raise exception 'success alerted'; end if;
  perform public.pipstart_record_email_event('m21_test_retry','m21_test_retry_message','email.bounced',now());
  c := public.pipstart_claim_email_alert('m21_test_retry_message','email.bounced');
  update public.pipstart_account_email_alerts set lease_until=now()-interval '1 second' where message_id='m21_test_retry_message';
  if public.pipstart_claim_email_alert('m21_test_retry_message','email.bounced')->>'state' <> 'leased' then raise exception 'crashed claim not recoverable'; end if;
  update public.pipstart_account_email_alerts set first_attempt_at=now()-interval '24 hours', lease_until=now()-interval '1 second' where message_id='m21_test_retry_message';
  if public.pipstart_claim_email_alert('m21_test_retry_message','email.bounced')->>'state' <> 'manual' then raise exception 'unsafe late retry'; end if;
  raise notice 'M21 database assertions passed (fixtures rolled back)';
end $$;
rollback;
