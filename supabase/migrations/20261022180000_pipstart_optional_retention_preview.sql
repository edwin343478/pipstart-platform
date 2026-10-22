-- Owner-only retention inventory/holds. No DELETE/UPDATE or cleanup capability.
begin;
create table public.pipstart_optional_retention_holds (
 entity_kind text not null check(entity_kind in ('job','recovery')),
 subject_ref text not null,
 proof_ref text not null check(proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$'),
 created_at timestamptz not null default clock_timestamp() check(isfinite(created_at)),
 primary key(entity_kind,subject_ref),
 check((entity_kind='job' and subject_ref ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')
  or (entity_kind='recovery' and subject_ref ~ '^[a-f0-9]{64}$'))
);
-- No FK or automatic expiry: deletion/account recreation must not drop a hold.
alter table public.pipstart_optional_retention_holds enable row level security;
revoke all on public.pipstart_optional_retention_holds from public,anon,authenticated,service_role;

create function public.pipstart_optional_retention_preview()
returns jsonb language sql stable set search_path='' set timezone='UTC' as $$
 with cutoff as (select statement_timestamp() as evaluated_at),
 held_jobs as (
  select subject_ref::uuid as id from public.pipstart_optional_retention_holds where entity_kind='job'
  union select unnest(r.job_ids) from public.pipstart_optional_worker_recoveries r
   join public.pipstart_optional_retention_holds h on h.entity_kind='recovery' and h.subject_ref=r.run_fingerprint
  union select unnest(s.job_ids) from public.pipstart_optional_worker_slot s where s.run_token is not null
 ),
 terminal as (
  select j.id,greatest(j.created_at,j.updated_at,p.api_ack_at,p.signed_event_at,
   (select max(greatest(e.occurred_at,e.received_at)) from public.pipstart_optional_delivery_events e where e.job_id=j.id)) as last_activity
  from public.pipstart_optional_email_jobs j left join public.pipstart_optional_provider_receipts p on p.job_id=j.id
  where j.status in ('accepted','suppressed') and not exists(select 1 from held_jobs h where h.id=j.id)
 ),
 worker as (select count(*)=1 and bool_and(singleton and run_token is null and cardinality(job_ids)=0 and started_at is null) as idle from public.pipstart_optional_worker_slot)
 select jsonb_build_object(
  'policyVersion',1,'evaluatedAt',c.evaluated_at,
  'status',case when w.idle then 'preview_only' else 'worker_review_required' end,
  'cleanupEnabled',false,'automaticDeletion',false,'resendAllowed',false,
  'limits',jsonb_build_object('terminalContentDays',90,'cadenceDays',31,'recoveryAuditDays',365),
  'unsubscribeTokenAction','retain_valid_account_links',
  'terminalContentAction','compatibility_review_required',
  'counts',jsonb_build_object(
   'retainedUnsubscribeTokens',(select count(*) from public.pipstart_email_unsubscribe_tokens),
   'unresolvedJobs',(select count(*) from public.pipstart_optional_email_jobs where status in ('pending','preparing','sending','manual')),
   'holds',(select count(*) from public.pipstart_optional_retention_holds),
   'terminalContentReview',(select count(*) from terminal where last_activity<c.evaluated_at-interval '2160 hours'),
   'cadenceReview',(select count(*) from public.pipstart_optional_email_reservations r
    where r.reserved_at<c.evaluated_at-interval '744 hours'
     and not exists(select 1 from held_jobs h where h.id=r.job_id)
     and not exists(select 1 from public.pipstart_optional_email_jobs j where j.id=r.job_id and j.status not in ('accepted','suppressed'))),
   'recoveryAuditReview',(select count(*) from public.pipstart_optional_worker_recoveries r
    where r.recovered_at<c.evaluated_at-interval '8760 hours'
     and not exists(select 1 from public.pipstart_optional_retention_holds h where h.entity_kind='recovery' and h.subject_ref=r.run_fingerprint)
     and not exists(select 1 from unnest(r.job_ids) x(id) join held_jobs h on h.id=x.id)
     and not exists(select 1 from unnest(r.job_ids) x(id) join public.pipstart_optional_email_jobs j on j.id=x.id where j.status not in ('accepted','suppressed')))
  )
 ) from cutoff c cross join worker w;
$$;
revoke all on function public.pipstart_optional_retention_preview() from public,anon,authenticated,service_role;
-- Deliberately no API grants, cleanup function, schedule or automatic hold release.
commit;
