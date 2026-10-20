-- Dormant service-only outbox. No worker route, scheduler, campaign or provider.
begin;
create table public.pipstart_optional_email_jobs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 dedupe_key text not null check(dedupe_key ~ '^[A-Za-z0-9_-]{1,100}$'),
 kind text not null check(kind in ('learning_lesson','learning_weekly','partner_offer')),
 subject text not null check(char_length(btrim(subject)) between 1 and 200 and subject !~ E'[\r\n]'),
 html text not null check(char_length(btrim(html)) between 1 and 200000),
 body_text text not null check(char_length(btrim(body_text)) between 1 and 100000),
 status text not null default 'pending' check(status in ('pending','preparing','sending','accepted','suppressed','manual')),
 available_at timestamptz not null default now(),
 attempts integer not null default 0 check(attempts between 0 and 5),
 lease_token uuid,lease_until timestamptz,
 prepared_message jsonb,
 reason text check(reason in ('account_inactive','opted_out','frequency_changed','preflight_unavailable','attempts_exhausted','eligibility_unavailable','recipient_changed','provider_uncertain','handoff_uncertain')),
 provider_id text check(provider_id ~ '^[A-Za-z0-9_-]{1,200}$'),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(user_id,dedupe_key),
 check((status='preparing' and lease_token is not null and lease_until is not null)
  or (status='sending' and lease_token is not null and lease_until is null)
  or (status in ('pending','accepted','suppressed','manual') and lease_token is null and lease_until is null)),
 check((status='accepted' and provider_id is not null) or (status<>'accepted' and provider_id is null)),
 check(status not in ('sending','accepted') or prepared_message is not null)
);
create unique index pipstart_optional_jobs_provider on public.pipstart_optional_email_jobs(provider_id) where provider_id is not null;
create index pipstart_optional_jobs_due on public.pipstart_optional_email_jobs(status,available_at);
alter table public.pipstart_optional_email_jobs enable row level security;
revoke all on public.pipstart_optional_email_jobs from public,anon,authenticated,service_role;

create function public.pipstart_enqueue_optional_email(p_user_id uuid,p_dedupe_key text,p_kind text,p_subject text,p_html text,p_text text,p_available_at timestamptz default now())
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;s jsonb;
begin
 if (p_user_id is not null and p_dedupe_key ~ '^[A-Za-z0-9_-]{1,100}$' and p_kind in ('learning_lesson','learning_weekly','partner_offer')
  and char_length(btrim(p_subject)) between 1 and 200 and p_subject !~ E'[\r\n]'
  and char_length(btrim(p_html)) between 1 and 200000 and char_length(btrim(p_text)) between 1 and 100000
  and p_available_at is not null and isfinite(p_available_at)) is distinct from true then raise exception 'Invalid optional job';end if;
 select * into j from public.pipstart_optional_email_jobs where user_id=p_user_id and dedupe_key=p_dedupe_key;
 if not found then
  s:=public.pipstart_optional_email_dispatch_state(p_user_id);
  if s->>'status'<>'active' then return jsonb_build_object('status','suppressed','reason','account_inactive');end if;
  if (p_kind='partner_offer' and not (s->>'partner')::boolean) or (p_kind<>'partner_offer' and not (s->>'learning')::boolean) then return jsonb_build_object('status','suppressed','reason','opted_out');end if;
  if p_kind<>'partner_offer' and s->>'frequency'<>(case when p_kind='learning_weekly' then 'weekly' else 'all' end) then return jsonb_build_object('status','suppressed','reason','frequency_changed');end if;
  insert into public.pipstart_optional_email_jobs(user_id,dedupe_key,kind,subject,html,body_text,available_at)
   values(p_user_id,p_dedupe_key,p_kind,p_subject,p_html,p_text,p_available_at) on conflict(user_id,dedupe_key) do nothing returning * into j;
  if found then return jsonb_build_object('status','queued','jobId',j.id);end if;
  select * into j from public.pipstart_optional_email_jobs where user_id=p_user_id and dedupe_key=p_dedupe_key;
 end if;
 if j.kind=p_kind and j.subject=p_subject and j.html=p_html and j.body_text=p_text then return jsonb_build_object('status','duplicate','jobId',j.id);end if;
 return jsonb_build_object('status','conflict');
end $$;

create function public.pipstart_claim_optional_email(p_job_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;t uuid;
begin
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found then return jsonb_build_object('status','missing');end if;
 if j.status in ('accepted','suppressed') then return jsonb_build_object('status','terminal');end if;
 if j.status in ('sending','manual') then return jsonb_build_object('status','manual');end if;
 if j.status='preparing' and j.lease_until>clock_timestamp() then return jsonb_build_object('status','busy');end if;
 if j.status='pending' and j.available_at>clock_timestamp() then return jsonb_build_object('status','not_due');end if;
 if j.attempts>=5 then
  update public.pipstart_optional_email_jobs set status='manual',reason='attempts_exhausted',lease_token=null,lease_until=null,updated_at=clock_timestamp() where id=j.id;
  return jsonb_build_object('status','manual');
 end if;
 t:=gen_random_uuid();
 update public.pipstart_optional_email_jobs set status='preparing',attempts=attempts+1,lease_token=t,lease_until=clock_timestamp()+interval '2 minutes',updated_at=clock_timestamp() where id=j.id;
 return jsonb_build_object('status','claimed','token',t,'job',jsonb_build_object('jobId',j.id,'userId',j.user_id,'kind',j.kind,'subject',j.subject,'html',j.html,'text',j.body_text));
end $$;

create function public.pipstart_begin_optional_email(p_job_id uuid,p_token uuid,p_message jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;
begin
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found or j.status<>'preparing' or j.lease_token is distinct from p_token or j.lease_until<=clock_timestamp() then return false;end if;
 if (jsonb_typeof(p_message)='object' and (select array_agg(k order by k) from jsonb_object_keys(p_message) k)=array['headers','html','jobId','subject','text','to']
  and p_message->>'jobId'=j.id::text and p_message->>'subject'=j.subject
  and jsonb_typeof(p_message->'to')='string' and char_length(p_message->>'to') between 3 and 254 and p_message->>'to' ~ '^[^[:space:]@<>,]+@[^[:space:]@<>,]+[.][^[:space:]@<>,]+$'
  and jsonb_typeof(p_message->'html')='string' and char_length(p_message->>'html') between 1 and 205000
  and jsonb_typeof(p_message->'text')='string' and char_length(p_message->>'text') between 1 and 102000
  and jsonb_typeof(p_message->'headers')='object' and (select array_agg(k order by k) from jsonb_object_keys(p_message->'headers') k)=array['List-Unsubscribe','List-Unsubscribe-Post']
  and p_message->'headers'->>'List-Unsubscribe' ~ '^<https://pipstart[.]net/unsubscribe[?]token=[a-f0-9]{64}>$'
  and p_message->'headers'->>'List-Unsubscribe-Post'='List-Unsubscribe=One-Click') is distinct from true then raise exception 'Invalid prepared optional message';end if;
 update public.pipstart_optional_email_jobs set status='sending',prepared_message=p_message,lease_until=null,updated_at=clock_timestamp() where id=j.id;
 return true;
end $$;

create function public.pipstart_finish_optional_email(p_job_id uuid,p_token uuid,p_outcome text,p_reason text,p_provider_id text)
returns boolean language plpgsql security definer set search_path='' as $$
declare j public.pipstart_optional_email_jobs%rowtype;
begin
 if (p_outcome in ('accepted','suppressed','manual')) is distinct from true then raise exception 'Invalid optional outcome';end if;
 if p_outcome='accepted' and (p_reason is not null or (p_provider_id ~ '^[A-Za-z0-9_-]{1,200}$') is distinct from true) then raise exception 'Invalid provider acknowledgement';end if;
 if p_outcome<>'accepted' and (p_provider_id is not null or p_reason is null) then raise exception 'Invalid optional outcome details';end if;
 if p_outcome='suppressed' and p_reason not in ('account_inactive','opted_out','frequency_changed') then raise exception 'Invalid suppression reason';end if;
 if p_outcome='manual' and p_reason not in ('eligibility_unavailable','recipient_changed','provider_uncertain','handoff_uncertain') then raise exception 'Invalid manual reason';end if;
 select * into j from public.pipstart_optional_email_jobs where id=p_job_id for update;
 if not found or j.status not in ('preparing','sending') or j.lease_token is distinct from p_token then return false;end if;
 if j.status='preparing' and (p_outcome='accepted' or j.lease_until<=clock_timestamp()) then return false;end if;
 update public.pipstart_optional_email_jobs set status=p_outcome,reason=p_reason,provider_id=p_provider_id,lease_token=null,lease_until=null,updated_at=clock_timestamp() where id=j.id;
 return true;
end $$;

create function public.pipstart_release_optional_email(p_job_id uuid,p_token uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.pipstart_optional_email_jobs set status=case when attempts>=5 then 'manual' else 'pending' end,
  reason=case when attempts>=5 then 'attempts_exhausted' else 'preflight_unavailable' end,
  available_at=clock_timestamp()+interval '30 seconds'*attempts,lease_token=null,lease_until=null,updated_at=clock_timestamp()
  where id=p_job_id and status='preparing' and lease_token=p_token and lease_until>clock_timestamp();
 return found;
end $$;
revoke all on function public.pipstart_enqueue_optional_email(uuid,text,text,text,text,text,timestamptz) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_claim_optional_email(uuid) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_begin_optional_email(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_finish_optional_email(uuid,uuid,text,text,text) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_release_optional_email(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_enqueue_optional_email(uuid,text,text,text,text,text,timestamptz) to service_role;
grant execute on function public.pipstart_claim_optional_email(uuid) to service_role;
grant execute on function public.pipstart_begin_optional_email(uuid,uuid,jsonb) to service_role;
grant execute on function public.pipstart_finish_optional_email(uuid,uuid,text,text,text) to service_role;
grant execute on function public.pipstart_release_optional_email(uuid,uuid) to service_role;
commit;
