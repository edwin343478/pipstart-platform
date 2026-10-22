-- Operator-only diagnostic SELECT; no worker RPC, row lock, unlock or resend.
-- A single SQL statement observes one MVCC snapshot. Run with existing CLI login.
select case when (select count(*) from public.pipstart_optional_worker_slot)=1 then
 (select jsonb_build_object(
  'reportVersion',1,
  'status',case when s.run_token is null then 'idle' else 'review_required' end,
  'runFingerprint',case when s.run_token is null then null else encode(sha256(convert_to(s.run_token::text,'UTF8')),'hex') end,
  'startedAt',s.started_at,
  'automaticUnlockAllowed',false,
  'resendAllowed',false,
  'jobs',coalesce((select jsonb_agg(jsonb_build_object(
   'jobId',x.id,
   'queueStatus',coalesce(j.status,'missing'),
   'reason',j.reason,
   'attempts',j.attempts,
   'handoffMarked',coalesce(j.prepared_message is not null,false),
   'cadenceReserved',exists(select 1 from public.pipstart_optional_email_reservations r where r.job_id=x.id),
   'assessment',case
    when j.id is null then 'missing_review'
    when j.prepared_message is not null or j.status in ('sending','accepted','manual') then 'possible_handoff'
    when j.status='pending' and j.reason='cadence_limited' then 'cadence_deferred'
    else 'no_handoff_marker' end,
   'evidence',jsonb_build_object(
    'apiAcknowledged',coalesce(p.api_ack_at is not null,false),
    'signedEvidence',coalesce(p.signed_event_at is not null,false),
    'events',coalesce((select jsonb_agg(e.event_type order by e.event_type) from
     (select distinct event_type from public.pipstart_optional_delivery_events where job_id=x.id) e),'[]'::jsonb))
   ) order by x.n) from unnest(s.job_ids) with ordinality x(id,n)
    left join public.pipstart_optional_email_jobs j on j.id=x.id
    left join public.pipstart_optional_provider_receipts p on p.job_id=x.id),'[]'::jsonb)
 ) from public.pipstart_optional_worker_slot s where singleton)
 else jsonb_build_object('reportVersion',1,'status','unavailable','runFingerprint',null,'startedAt',null,'automaticUnlockAllowed',false,'resendAllowed',false,'jobs','[]'::jsonb)
 end as m21_report;
