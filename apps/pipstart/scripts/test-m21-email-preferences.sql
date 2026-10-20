-- Isolated fixture DB ONLY. Baseline test users 1 and 2 are created before the migration.
begin;
do $$
begin
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000001' and educational_emails and not marketing_emails) then raise exception 'Legacy true/false preference changed'; end if;
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000002' and not educational_emails and not marketing_emails) then raise exception 'Legacy opt-out changed'; end if;
  if (select count(*) from public.pipstart_email_preference_events where source='legacy_snapshot' and preference_model='legacy_unknown' and policy_text_version is null and previous_enabled is null)<>4 then raise exception 'Legacy history misrepresented'; end if;
  if not (select relrowsecurity from pg_class where oid='public.pipstart_email_preference_events'::regclass) then raise exception 'History RLS missing'; end if;
  if has_table_privilege('anon','public.pipstart_email_preference_events','SELECT,INSERT,UPDATE,DELETE') then raise exception 'Anonymous history access'; end if;
  if has_table_privilege('authenticated','public.pipstart_email_preference_events','INSERT,UPDATE,DELETE') then raise exception 'Learner can fabricate history'; end if;
  if has_function_privilege('authenticated','public.pipstart_record_email_preference_change()','EXECUTE') then raise exception 'History function exposed'; end if;
end $$;
insert into auth.users(id,raw_user_meta_data) values
('00000000-0000-4000-8000-000000000003','{"display_name":"New Learner","role":"admin"}'),
('00000000-0000-4000-8000-000000000004','{"display_name":"Opted Out","pipstart_email_preferences_version":"pipstart-optional-email-v1","pipstart_learning_emails":false,"pipstart_partner_emails":false}'),
('00000000-0000-4000-8000-000000000005','{"display_name":"Malformed Fields","pipstart_email_preferences_version":"pipstart-optional-email-v1","pipstart_learning_emails":"false","pipstart_partner_emails":0}');
do $$
begin
  if (select count(*) from public.pipstart_email_preferences where user_id in ('00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000005') and educational_emails and marketing_emails and learning_frequency='all')<>2 then raise exception 'New defaults wrong'; end if;
  if not exists(select 1 from public.pipstart_profiles where user_id='00000000-0000-4000-8000-000000000003' and role='learner') then raise exception 'Metadata escalated account role'; end if;
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000004' and not educational_emails and not marketing_emails) then raise exception 'Signup opt-out lost'; end if;
  if (select count(*) from public.pipstart_email_preference_events where source='account_creation' and preference_model='opt_out_v1')<>6 then raise exception 'New settings history missing'; end if;
end $$;
-- Later editable auth metadata must not silently resubscribe an existing user.
update auth.users set raw_user_meta_data='{"pipstart_learning_emails":true,"pipstart_partner_emails":true}' where id='00000000-0000-4000-8000-000000000004';
do $$ begin
  if not exists(select 1 from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000004' and not educational_emails and not marketing_emails) then raise exception 'Metadata edit resubscribed user'; end if;
end $$;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare n integer;
begin
  if (select count(*) from public.pipstart_email_preferences)<>1 then raise exception 'Preference ownership failed'; end if;
  if (select count(*) from public.pipstart_email_preference_events)<>2 then raise exception 'History ownership failed'; end if;
  update public.pipstart_email_preferences set marketing_emails=true where user_id='00000000-0000-4000-8000-000000000002';
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Another user preference changed'; end if;
  update public.pipstart_email_preferences set educational_emails=false,marketing_emails=false,learning_frequency='weekly' where user_id='00000000-0000-4000-8000-000000000001';
  if (select count(*) from public.pipstart_email_preference_events)<>3 then raise exception 'Expected one learning change event'; end if;
  if not exists(select 1 from public.pipstart_email_preference_events where category='learning' and previous_enabled and not enabled and previous_frequency='all' and frequency='weekly' and source='preference_change') then raise exception 'Learning audit fields wrong'; end if;
  update public.pipstart_email_preferences set educational_emails=false,marketing_emails=false,learning_frequency='weekly' where user_id='00000000-0000-4000-8000-000000000001';
  if (select count(*) from public.pipstart_email_preference_events)<>3 then raise exception 'No-op created a fake change'; end if;
  begin
    update public.pipstart_email_preferences set learning_frequency='instant' where user_id='00000000-0000-4000-8000-000000000001';
    raise exception 'Invalid frequency accepted';
  exception when check_violation then null; end;
  begin
    insert into public.pipstart_email_preference_events(user_id,category,enabled,frequency,source,preference_model) values('00000000-0000-4000-8000-000000000001','learning',true,'all','preference_change','opt_out_v1');
    raise exception 'Learner fabricated history';
  exception when insufficient_privilege then null; end;
  begin
    update public.pipstart_email_preference_events set enabled=true;
    raise exception 'Learner rewrote history';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.pipstart_email_preference_events;
    raise exception 'Learner deleted history';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);

-- Prove audit insertion and the preference update are one transaction.
create function public.m21_fixture_reject_audit() returns trigger language plpgsql as $$ begin raise exception 'fixture audit failure'; end $$;
create trigger m21_fixture_reject_audit before insert on public.pipstart_email_preference_events for each row execute function public.m21_fixture_reject_audit();
do $$ declare failed boolean:=false;
begin
  begin update public.pipstart_email_preferences set educational_emails=true where user_id='00000000-0000-4000-8000-000000000001'; exception when raise_exception then failed:=true; end;
  if not failed then raise exception 'Audit fixture did not fail'; end if;
  if (select educational_emails from public.pipstart_email_preferences where user_id='00000000-0000-4000-8000-000000000001') then raise exception 'Preference change survived failed audit'; end if;
end $$;
drop trigger m21_fixture_reject_audit on public.pipstart_email_preference_events;
drop function public.m21_fixture_reject_audit();

-- Genuine later changes still work, and account deletion retains existing cascade policy.
update public.pipstart_email_preferences set marketing_emails=true where user_id='00000000-0000-4000-8000-000000000001';
do $$ begin
  if not exists(select 1 from public.pipstart_email_preference_events where user_id='00000000-0000-4000-8000-000000000001' and category='partner' and not previous_enabled and enabled and source='system_change') then raise exception 'Partner update history missing'; end if;
end $$;
delete from auth.users where id='00000000-0000-4000-8000-000000000004';
do $$ begin
  if exists(select 1 from public.pipstart_email_preference_events where user_id='00000000-0000-4000-8000-000000000004') then raise exception 'Deleted-account history not removed'; end if;
  raise notice 'M21 opt-out preference database assertions passed (fixtures rolled back)';
end $$;
rollback;
