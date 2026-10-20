-- PipStart only: no sender, campaign, email, country rule or scheduled job.
begin;
create table public.pipstart_email_unsubscribe_tokens (
  token_hash text primary key check(char_length(token_hash)=64 and token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check(scope in ('learning','partner','all')),
  created_at timestamptz not null default now()
);
create index pipstart_unsubscribe_tokens_user on public.pipstart_email_unsubscribe_tokens(user_id);
alter table public.pipstart_email_unsubscribe_tokens enable row level security;
revoke all on public.pipstart_email_unsubscribe_tokens from public,anon,authenticated,service_role;

create table public.pipstart_email_unsubscribe_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check(scope in ('learning','partner','all')),
  recorded_at timestamptz not null default now()
);
create index pipstart_unsubscribe_events_user on public.pipstart_email_unsubscribe_events(user_id,recorded_at desc);
alter table public.pipstart_email_unsubscribe_events enable row level security;
revoke all on public.pipstart_email_unsubscribe_events from public,anon,authenticated,service_role;
revoke all on sequence public.pipstart_email_unsubscribe_events_id_seq from public,anon,authenticated,service_role;
grant select on public.pipstart_email_unsubscribe_events to authenticated,service_role;
create policy "Learners read their own email unsubscribe events"
  on public.pipstart_email_unsubscribe_events for select to authenticated
  using ((select auth.uid())=user_id);

create function public.pipstart_issue_email_unsubscribe_token(p_user_id uuid,p_scope text,p_token_hash text)
returns boolean language plpgsql security definer set search_path='' as $$
declare pref public.pipstart_email_preferences%rowtype;
begin
  if p_user_id is null or p_scope is null or p_scope not in ('learning','partner','all')
    or p_token_hash is null or char_length(p_token_hash)<>64 or p_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid token issue arguments'; end if;
  select * into pref from public.pipstart_email_preferences where user_id=p_user_id for update;
  if not found then return false; end if;
  if (p_scope='learning' and not pref.educational_emails)
    or (p_scope='partner' and not pref.marketing_emails)
    or (p_scope='all' and not pref.educational_emails and not pref.marketing_emails) then return false; end if;
  insert into public.pipstart_email_unsubscribe_tokens(token_hash,user_id,scope)
    values(p_token_hash,p_user_id,p_scope);
  return true;
end $$;

create function public.pipstart_lookup_email_unsubscribe_token(p_token_hash text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare token_scope text;
begin
  if p_token_hash is null or char_length(p_token_hash)<>64 or p_token_hash !~ '^[a-f0-9]{64}$' then return jsonb_build_object('status','invalid'); end if;
  select t.scope into token_scope from public.pipstart_email_unsubscribe_tokens t
    join public.pipstart_email_preferences p on p.user_id=t.user_id where t.token_hash=p_token_hash;
  if not found then return jsonb_build_object('status','invalid'); end if;
  return jsonb_build_object('status','valid','scope',token_scope);
end $$;

create function public.pipstart_apply_email_unsubscribe(p_token_hash text)
returns text language plpgsql security definer set search_path='' as $$
declare target uuid; token_scope text; pref public.pipstart_email_preferences%rowtype;
begin
  if p_token_hash is null or char_length(p_token_hash)<>64 or p_token_hash !~ '^[a-f0-9]{64}$' then return 'invalid'; end if;
  select user_id,scope into target,token_scope from public.pipstart_email_unsubscribe_tokens where token_hash=p_token_hash;
  if not found then return 'invalid'; end if;
  -- Serialize all token scopes for this learner, including different tokens.
  select * into pref from public.pipstart_email_preferences where user_id=target for update;
  if not found then return 'invalid'; end if;
  if (token_scope='learning' and not pref.educational_emails)
    or (token_scope='partner' and not pref.marketing_emails)
    or (token_scope='all' and not pref.educational_emails and not pref.marketing_emails) then return 'already_unsubscribed'; end if;
  update public.pipstart_email_preferences set
    educational_emails=case when token_scope in ('learning','all') then false else educational_emails end,
    marketing_emails=case when token_scope in ('partner','all') then false else marketing_emails end
    where user_id=target;
  -- Existing settings history records actual changes as system_change. This
  -- dedicated event attributes the bearer-link request without claiming consent.
  insert into public.pipstart_email_unsubscribe_events(user_id,scope) values(target,token_scope);
  return 'unsubscribed';
end $$;

revoke all on function public.pipstart_issue_email_unsubscribe_token(uuid,text,text) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_lookup_email_unsubscribe_token(text) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_apply_email_unsubscribe(text) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_issue_email_unsubscribe_token(uuid,text,text) to service_role;
grant execute on function public.pipstart_lookup_email_unsubscribe_token(text) to service_role;
grant execute on function public.pipstart_apply_email_unsubscribe(text) to service_role;
commit;
