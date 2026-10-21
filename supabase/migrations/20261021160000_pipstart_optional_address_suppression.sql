-- Additive optional-only address gate; no Auth/preference or monitoring writes.
begin;
create table public.pipstart_optional_address_blocks (
 address_hash text primary key check(address_hash ~ '^[a-f0-9]{64}$'),
 reason text not null check(reason in ('hard_bounce','complaint','provider_suppressed')),
 first_occurred_at timestamptz not null,last_occurred_at timestamptz not null,
 created_at timestamptz not null default now(),check(first_occurred_at<=last_occurred_at)
);
create table public.pipstart_optional_address_events (
 event_id text primary key check(event_id ~ '^[A-Za-z0-9_-]{1,200}$'),
 message_id text not null check(message_id ~ '^[A-Za-z0-9_-]{1,200}$'),
 address_hash text not null references public.pipstart_optional_address_blocks(address_hash),
 reason text not null check(reason in ('hard_bounce','complaint','provider_suppressed')),
 occurred_at timestamptz not null,received_at timestamptz not null default now()
);
alter table public.pipstart_optional_address_blocks enable row level security;
alter table public.pipstart_optional_address_events enable row level security;
revoke all on public.pipstart_optional_address_blocks,public.pipstart_optional_address_events from public,anon,authenticated,service_role;

create function public.pipstart_optional_address_hash(p_email text)
returns text language sql immutable strict set search_path='' as $$
 select case when char_length(btrim(p_email))<=254 and btrim(p_email) collate "C" ~ '^[!-~]+$' and lower(btrim(p_email) collate "C") ~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'
 then encode(sha256(convert_to(lower(btrim(p_email) collate "C"),'UTF8')),'hex') else null end;
$$;
revoke all on function public.pipstart_optional_address_hash(text) from public,anon,authenticated,service_role;

create function public.pipstart_optional_address_is_blocked(p_email text)
returns boolean language sql stable security definer set search_path='' as $$
 select public.pipstart_optional_address_hash(p_email) is null or exists(select 1 from public.pipstart_optional_address_blocks where address_hash=public.pipstart_optional_address_hash(p_email));
$$;
revoke all on function public.pipstart_optional_address_is_blocked(text) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_optional_address_is_blocked(text) to service_role;

create function public.pipstart_record_optional_address_block(p_event_id text,p_message_id text,p_email text,p_reason text,p_occurred_at timestamptz)
returns text language plpgsql security definer set search_path='' as $$
declare h text:=public.pipstart_optional_address_hash(p_email);e public.pipstart_optional_address_events%rowtype;
begin
 if (h is not null and p_event_id ~ '^[A-Za-z0-9_-]{1,200}$' and p_message_id ~ '^[A-Za-z0-9_-]{1,200}$' and p_reason in ('hard_bounce','complaint','provider_suppressed') and p_occurred_at is not null and isfinite(p_occurred_at)) is distinct from true then raise exception 'Invalid address evidence';end if;
 -- Serialize the same event ID before either table is changed. Hash collisions only serialize unrelated evidence.
 perform pg_advisory_xact_lock(hashtextextended(p_event_id,0));
 select * into e from public.pipstart_optional_address_events where event_id=p_event_id;
 if found then
  if e.address_hash=h and e.message_id=p_message_id and e.reason=p_reason and e.occurred_at=p_occurred_at then return 'duplicate';end if;
  raise exception 'Address evidence conflict';
 end if;
 insert into public.pipstart_optional_address_blocks(address_hash,reason,first_occurred_at,last_occurred_at) values(h,p_reason,p_occurred_at,p_occurred_at)
 on conflict(address_hash) do update set
  reason=case when excluded.reason='complaint' or pipstart_optional_address_blocks.reason='complaint' then 'complaint' when excluded.reason='hard_bounce' or pipstart_optional_address_blocks.reason='hard_bounce' then 'hard_bounce' else 'provider_suppressed' end,
  first_occurred_at=least(pipstart_optional_address_blocks.first_occurred_at,excluded.first_occurred_at),
  last_occurred_at=greatest(pipstart_optional_address_blocks.last_occurred_at,excluded.last_occurred_at);
 insert into public.pipstart_optional_address_events(event_id,message_id,address_hash,reason,occurred_at) values(p_event_id,p_message_id,h,p_reason,p_occurred_at);
 return 'recorded';
end $$;
revoke all on function public.pipstart_record_optional_address_block(text,text,text,text,timestamptz) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_record_optional_address_block(text,text,text,text,timestamptz) to service_role;

-- Preserve the existing strict dispatch-state contract. "inactive" is deliberately
-- coarse: a blocked address is unavailable for optional mail, not a disabled Auth account.
create or replace function public.pipstart_optional_email_dispatch_state(p_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 select jsonb_build_object('status','active','email',u.email,'learning',p.educational_emails,'partner',p.marketing_emails,'frequency',p.learning_frequency)
 into result from auth.users u join public.pipstart_email_preferences p on p.user_id=u.id
 where u.id=p_user_id and u.email is not null and btrim(u.email)<>'' and u.email_confirmed_at is not null and u.deleted_at is null
 and (u.banned_until is null or u.banned_until<=now()) and not public.pipstart_optional_address_is_blocked(u.email);
 return coalesce(result,jsonb_build_object('status','inactive'));
end $$;
revoke all on function public.pipstart_optional_email_dispatch_state(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_optional_email_dispatch_state(uuid) to service_role;
commit;
