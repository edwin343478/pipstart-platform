-- Generated-fixture isolated DB only; never run this against real accounts.
begin;
insert into auth.users(id,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000006','{"display_name":"Unsubscribe Fixture"}'),
('00000000-0000-4000-8000-000000000007','{"display_name":"Other Fixture"}');
update public.pipstart_email_preferences set learning_frequency='weekly' where user_id='00000000-0000-4000-8000-000000000006';
do $$ declare role_name text; fn text;
begin
  if not (select relrowsecurity from pg_class where oid='public.pipstart_email_unsubscribe_tokens'::regclass) then raise exception 'Token RLS missing'; end if;
  if not (select relrowsecurity from pg_class where oid='public.pipstart_email_unsubscribe_events'::regclass) then raise exception 'Unsubscribe history RLS missing'; end if;
  foreach role_name in array array['anon','authenticated','service_role'] loop
    if has_table_privilege(role_name,'public.pipstart_email_unsubscribe_tokens','SELECT,INSERT,UPDATE,DELETE') then raise exception 'Direct token table access'; end if;
    if has_table_privilege(role_name,'public.pipstart_email_unsubscribe_events','INSERT,UPDATE,DELETE') then raise exception 'History write access'; end if;
  end loop;
  foreach fn in array array['pipstart_issue_email_unsubscribe_token(uuid,text,text)','pipstart_lookup_email_unsubscribe_token(text)','pipstart_apply_email_unsubscribe(text)'] loop
    if has_function_privilege('anon','public.'||fn,'EXECUTE') or has_function_privilege('authenticated','public.'||fn,'EXECUTE') then raise exception 'Public unsubscribe RPC privilege'; end if;
    if not has_function_privilege('service_role','public.'||fn,'EXECUTE') then raise exception 'Service RPC privilege missing'; end if;
  end loop;
  if public.pipstart_lookup_email_unsubscribe_token('bad')->>'status'<>'invalid' or public.pipstart_apply_email_unsubscribe(repeat('b',64))<>'invalid' then raise exception 'Unknown/malformed token not invalid'; end if;
end $$;
set local role service_role;
do $$
begin
  if not public.pipstart_issue_email_unsubscribe_token('00000000-0000-4000-8000-000000000006','learning',repeat('a',64)) then raise exception 'Issue learning failed'; end if;
  if not public.pipstart_issue_email_unsubscribe_token('00000000-0000-4000-8000-000000000006','partner',repeat('c',64)) then raise exception 'Issue partner failed'; end if;
  if not public.pipstart_issue_email_unsubscribe_token('00000000-0000-4000-8000-000000000006','all',repeat('d',64)) then raise exception 'Issue all failed'; end if;
  if public.pipstart_lookup_email_unsubscribe_token(repeat('a',64))<>jsonb_build_object('status','valid','scope','learning') then raise exception 'Lookup exposed/wrong data'; end if;
  if public.pipstart_apply_email_unsubscribe(repeat('a',64))<>'unsubscribed' then raise exception 'Learning unsubscribe failed'; end if;
  if public.pipstart_apply_email_unsubscribe(repeat('a',64))<>'already_unsubscribed' then raise exception 'Repeated unsubscribe not idempotent'; end if;
  if public.pipstart_issue_email_unsubscribe_token('00000000-0000-4000-8000-000000000006','learning',repeat('e',64)) then raise exception 'Issued optional token for disabled category'; end if;
end $$;
reset role;
do $$ begin
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000006' and not educational_emails and marketing_emails and learning_frequency='weekly') then raise exception 'Category unsubscribe altered wrong setting'; end if;
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000007' and educational_emails and marketing_emails) then raise exception 'Another user changed'; end if;
  if (select count(*) from public.pipstart_email_unsubscribe_events)<>1 then raise exception 'Replay created duplicate change history'; end if;
end $$;
-- Explicit account resubscription is permitted. An old link still opts out;
-- tokens are not consumed in a way that silently ignores a later request.
update public.pipstart_email_preferences set educational_emails=true where user_id='00000000-0000-4000-8000-000000000006';
do $$ begin
  if public.pipstart_apply_email_unsubscribe(repeat('a',64))<>'unsubscribed' then raise exception 'Old link ignored after explicit resubscription'; end if;
  if public.pipstart_apply_email_unsubscribe(repeat('c',64))<>'unsubscribed' then raise exception 'Partner unsubscribe failed'; end if;
  if public.pipstart_apply_email_unsubscribe(repeat('d',64))<>'already_unsubscribed' then raise exception 'All/no-op failed'; end if;
end $$;
update public.pipstart_email_preferences set educational_emails=true,marketing_emails=true where user_id='00000000-0000-4000-8000-000000000006';
-- Reject the audit write to prove preference and existing-history writes roll back.
create function public.pipstart_m21_unsubscribe_reject_fixture() returns trigger language plpgsql as $$ begin raise exception 'unsubscribe_audit_fixture'; end $$;
create trigger pipstart_m21_unsubscribe_reject_fixture before insert on public.pipstart_email_unsubscribe_events for each row execute function public.pipstart_m21_unsubscribe_reject_fixture();
do $$ begin
  begin
    perform public.pipstart_apply_email_unsubscribe(repeat('d',64));
    raise exception 'Atomic unsubscribe incorrectly succeeded';
  exception when raise_exception then if sqlerrm<>'unsubscribe_audit_fixture' then raise; end if; end;
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000006' and educational_emails and marketing_emails) then raise exception 'Audit failure did not roll back preferences'; end if;
end $$;
drop trigger pipstart_m21_unsubscribe_reject_fixture on public.pipstart_email_unsubscribe_events;
drop function public.pipstart_m21_unsubscribe_reject_fixture();
do $$ begin
  if public.pipstart_apply_email_unsubscribe(repeat('d',64))<>'unsubscribed' then raise exception 'All unsubscribe failed'; end if;
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000006' and not educational_emails and not marketing_emails and learning_frequency='weekly') then raise exception 'All unsubscribe did not preserve frequency'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000007',true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.pipstart_email_unsubscribe_events)<>0 then raise exception 'Other learner saw unsubscribe history'; end if;
  begin perform public.pipstart_apply_email_unsubscribe(repeat('d',64)); raise exception 'Learner RPC executed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id='00000000-0000-4000-8000-000000000006';
do $$ begin
  if exists(select 1 from public.pipstart_email_unsubscribe_tokens) or exists(select 1 from public.pipstart_email_unsubscribe_events) then raise exception 'Deletion cascade failed'; end if;
  if public.pipstart_lookup_email_unsubscribe_token(repeat('a',64))->>'status'<>'invalid' then raise exception 'Deleted account token valid'; end if;
  raise notice 'M21 unsubscribe isolated assertions passed';
end $$;
rollback;
