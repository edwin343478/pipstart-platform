-- Owner-selected opt-out model. Defaults are NOT express consent.
-- No emails, resubscriptions of existing accounts, token links or jobs.
begin;
alter table public.pipstart_email_preferences
  alter column educational_emails set default true,
  alter column marketing_emails set default true;
alter table public.pipstart_email_preferences
  add column learning_frequency text not null default 'all'
    check (learning_frequency in ('all','weekly'));
grant update (learning_frequency) on public.pipstart_email_preferences to authenticated;

create table public.pipstart_email_preference_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check(category in ('learning','partner')),
  previous_enabled boolean,
  enabled boolean not null,
  previous_frequency text check(previous_frequency in ('all','weekly')),
  frequency text check(frequency in ('all','weekly')),
  source text not null check(source in ('legacy_snapshot','account_creation','preference_change','system_change')),
  preference_model text not null check(preference_model in ('legacy_unknown','opt_out_v1')),
  policy_text_version text,
  recorded_at timestamptz not null default now(),
  check((category='learning' and frequency is not null) or
    (category='partner' and frequency is null and previous_frequency is null))
);
alter table public.pipstart_email_preference_events enable row level security;
revoke all on public.pipstart_email_preference_events from public,anon,authenticated,service_role;
revoke all on sequence public.pipstart_email_preference_events_id_seq from public,anon,authenticated,service_role;
grant select on public.pipstart_email_preference_events to authenticated,service_role;
create policy "Learners read their own optional email preference history"
  on public.pipstart_email_preference_events for select to authenticated
  using ((select auth.uid())=user_id);
create index pipstart_email_preference_events_user_time
  on public.pipstart_email_preference_events(user_id,recorded_at desc,id desc);

-- Preserve every existing boolean exactly. These are legacy snapshots, not
-- backdated consent, opt-ins, or proof that any disclosure was seen.
insert into public.pipstart_email_preference_events
  (user_id,category,enabled,frequency,source,preference_model)
select user_id,'learning',educational_emails,learning_frequency,'legacy_snapshot','legacy_unknown'
from public.pipstart_email_preferences;
insert into public.pipstart_email_preference_events
  (user_id,category,enabled,source,preference_model)
select user_id,'partner',marketing_emails,'legacy_snapshot','legacy_unknown'
from public.pipstart_email_preferences;

create function public.pipstart_record_email_preference_change()
returns trigger language plpgsql security definer set search_path='' as $$
declare change_source text;
begin
  change_source := case when tg_op='INSERT' then 'account_creation'
    when (select auth.uid()) is null then 'system_change' else 'preference_change' end;
  if tg_op='INSERT' then
    insert into public.pipstart_email_preference_events
      (user_id,category,enabled,frequency,source,preference_model,policy_text_version)
    values
      (new.user_id,'learning',new.educational_emails,new.learning_frequency,change_source,'opt_out_v1','pipstart-optional-email-v1'),
      (new.user_id,'partner',new.marketing_emails,null,change_source,'opt_out_v1','pipstart-optional-email-v1');
  else
    if old.educational_emails is distinct from new.educational_emails
      or old.learning_frequency is distinct from new.learning_frequency then
      insert into public.pipstart_email_preference_events
        (user_id,category,previous_enabled,enabled,previous_frequency,frequency,source,preference_model,policy_text_version)
      values(new.user_id,'learning',old.educational_emails,new.educational_emails,
        old.learning_frequency,new.learning_frequency,change_source,'opt_out_v1','pipstart-optional-email-v1');
    end if;
    if old.marketing_emails is distinct from new.marketing_emails then
      insert into public.pipstart_email_preference_events
        (user_id,category,previous_enabled,enabled,source,preference_model,policy_text_version)
      values(new.user_id,'partner',old.marketing_emails,new.marketing_emails,
        change_source,'opt_out_v1','pipstart-optional-email-v1');
    end if;
  end if;
  return new;
end $$;
create trigger pipstart_email_preferences_record_changes
  after insert or update on public.pipstart_email_preferences
  for each row execute function public.pipstart_record_email_preference_change();
revoke all on function public.pipstart_record_email_preference_change() from public,anon,authenticated,service_role;

create or replace function public.pipstart_create_learner_account()
returns trigger language plpgsql security definer set search_path='' as $$
declare requested_name text; learning_enabled boolean := true; partner_enabled boolean := true;
begin
  requested_name := regexp_replace(btrim(coalesce(new.raw_user_meta_data->>'display_name','')),'\s+',' ','g');
  if char_length(requested_name)<2 or char_length(requested_name)>60 then requested_name:='Learner'; end if;
  -- Metadata controls only this new account's optional preferences, never role
  -- or access. Later metadata edits cannot silently resubscribe an account.
  if new.raw_user_meta_data->>'pipstart_email_preferences_version'='pipstart-optional-email-v1' then
    if jsonb_typeof(new.raw_user_meta_data->'pipstart_learning_emails')='boolean' then
      learning_enabled := (new.raw_user_meta_data->>'pipstart_learning_emails')::boolean;
    end if;
    if jsonb_typeof(new.raw_user_meta_data->'pipstart_partner_emails')='boolean' then
      partner_enabled := (new.raw_user_meta_data->>'pipstart_partner_emails')::boolean;
    end if;
  end if;
  insert into public.pipstart_profiles(user_id,display_name) values(new.id,requested_name);
  insert into public.pipstart_email_preferences(user_id,educational_emails,marketing_emails)
    values(new.id,learning_enabled,partner_enabled);
  return new;
end $$;
revoke all on function public.pipstart_create_learner_account() from public,anon,authenticated,service_role;
commit;
