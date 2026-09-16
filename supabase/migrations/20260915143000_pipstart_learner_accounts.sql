begin;

create type public.pipstart_account_role as enum ('learner', 'admin');

create table public.pipstart_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (
    char_length(display_name) between 2 and 60
    and display_name = btrim(display_name)
  ),
  role public.pipstart_account_role not null default 'learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pipstart_email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  educational_emails boolean not null default true,
  marketing_emails boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.pipstart_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pipstart_profiles_set_updated_at
before update on public.pipstart_profiles
for each row execute function public.pipstart_set_updated_at();

create trigger pipstart_email_preferences_set_updated_at
before update on public.pipstart_email_preferences
for each row execute function public.pipstart_set_updated_at();

create function public.pipstart_create_learner_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := regexp_replace(
    btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')),
    '\s+',
    ' ',
    'g'
  );

  if char_length(requested_name) < 2 or char_length(requested_name) > 60 then
    requested_name := 'Learner';
  end if;

  insert into public.pipstart_profiles (user_id, display_name)
  values (new.id, requested_name);

  insert into public.pipstart_email_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger pipstart_auth_user_created
after insert on auth.users
for each row execute function public.pipstart_create_learner_account();

alter table public.pipstart_profiles enable row level security;
alter table public.pipstart_email_preferences enable row level security;

create policy "Learners read their own PipStart profile"
on public.pipstart_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners update their own PipStart profile"
on public.pipstart_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Learners read their own PipStart email preferences"
on public.pipstart_email_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners update their own PipStart email preferences"
on public.pipstart_email_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.pipstart_profiles from anon, authenticated;
revoke all on public.pipstart_email_preferences from anon, authenticated;
grant select on public.pipstart_profiles to authenticated;
grant update (display_name) on public.pipstart_profiles to authenticated;
grant select on public.pipstart_email_preferences to authenticated;
grant update (educational_emails, marketing_emails)
  on public.pipstart_email_preferences to authenticated;

revoke all on function public.pipstart_set_updated_at() from public, anon, authenticated;
revoke all on function public.pipstart_create_learner_account() from public, anon, authenticated;

commit;
