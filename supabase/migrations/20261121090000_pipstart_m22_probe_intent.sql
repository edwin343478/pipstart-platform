-- M22 audit follow-up (17 November 2026), findings F1 and F5.
-- F1: the automatic link check contacted the outside host before the store had confirmed that the caller may
--     act on the item and that the link is in its live revision. pipstart_maintenance_probe_intent now authorizes
--     the exact (actor, item, live revision, reference, host) BEFORE any DNS or HTTP; record_result keeps its own
--     write-time checks. Each cleared intent is kept in an append-only table, which also gives a per-actor quota
--     shared by every server instance (at most 20 checks per actor per rolling hour).
-- F5: revoke the unused service_role EXECUTE on pipstart_set_lesson_completion (a Supabase default the September
--     migration did not revoke; only the learner's own session calls it).
begin;
do $$
begin
 if to_regprocedure('public.pipstart_maintenance_record_result(text,integer,text,text,text,text)') is null
  or to_regprocedure('pipstart_maintenance_private.target(text,integer)') is null
  or to_regprocedure('pipstart_maintenance_private.may_act(uuid,text)') is null
  or to_regprocedure('pipstart_maintenance_private.host_listed(text)') is null
  or to_regprocedure('pipstart_maintenance_private.affiliate_host(text)') is null
  or to_regprocedure('pipstart_editorial_private.https_host(text)') is null
  or to_regprocedure('public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)') is null
  or to_regprocedure('public.pipstart_maintenance_probe_intent(text,integer,text)') is not null then
  raise exception 'Maintenance store and learner progress schema required; probe intent not yet present'; end if;
end $$;

create table pipstart_maintenance_private.probe_intents(
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id) on delete restrict,
  item_id text not null references pipstart_editorial_private.items(id) on delete restrict,
  revision_no integer not null check(revision_no>=1),
  reference text not null check(char_length(reference) between 1 and 2048 and reference !~ '[[:cntrl:]]'),
  created_at timestamptz not null default clock_timestamp()
);
create index on pipstart_maintenance_private.probe_intents(actor_id,created_at);
create trigger pipstart_maintenance_probe_intents_immutable before update or delete on pipstart_maintenance_private.probe_intents
  for each row execute function pipstart_staff_private.immutable_audit();
alter table pipstart_maintenance_private.probe_intents enable row level security;
revoke all on pipstart_maintenance_private.probe_intents from public,anon,authenticated,service_role;

-- Clears one automatic check before any network contact. Answers:
--   {"status":"cleared",...}      the check may run now (one intent row written);
--   {"status":"not-allowed"}      host not on the Owner allowlist, or an affiliate host (nothing written);
--   PT429                         this actor's quota for the rolling hour is used up (nothing written);
--   42501 / 22023 / PT409         not this caller's item, not live or link not in the live revision, revision changed.
create function public.pipstart_maintenance_probe_intent(p_item text,p_expected_revision integer,p_reference text)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare u uuid; t record; body text; h text; used integer;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if p_expected_revision is null or p_reference is null or char_length(p_reference) not between 1 and 2048 or p_reference ~ '[[:cntrl:]]' then
    raise exception using errcode='22023',message='Invalid maintenance check'; end if;
  select * into t from pipstart_maintenance_private.target(p_item,p_expected_revision);
  if not pipstart_maintenance_private.may_act(u,p_item) then
    raise exception using errcode='42501',message='Only the assigned staff member or the Owner may act'; end if;
  select r.body::text into body from pipstart_editorial_private.revisions r where r.item_id=p_item and r.revision_no=t.revision_no;
  if position(p_reference in body)=0 then
    raise exception using errcode='22023',message='The reference is not in the live revision'; end if;
  h:=pipstart_editorial_private.https_host(p_reference);
  if h is null or not pipstart_maintenance_private.host_listed(h) or pipstart_maintenance_private.affiliate_host(h) then
    return jsonb_build_object('status','not-allowed'); end if;
  perform pg_advisory_xact_lock(hashtextextended('pipstart_probe_quota:'||u::text,0));
  select count(*) into used from pipstart_maintenance_private.probe_intents
    where actor_id=u and created_at>clock_timestamp()-interval '1 hour';
  if used>=20 then
    raise exception using errcode='PT429',message='Automatic check limit reached; try again later'; end if;
  insert into pipstart_maintenance_private.probe_intents(actor_id,item_id,revision_no,reference)
    values(u,p_item,t.revision_no,p_reference);
  return jsonb_build_object('status','cleared','item_id',p_item,'revision',t.revision_no,'remaining',19-used);
end $$;
revoke all on function public.pipstart_maintenance_probe_intent(text,integer,text) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_maintenance_probe_intent(text,integer,text) to authenticated;

revoke execute on function public.pipstart_set_lesson_completion(text,text,text,boolean,bigint) from service_role;

do $$
begin
 if not has_function_privilege('authenticated','public.pipstart_maintenance_probe_intent(text,integer,text)','execute')
  or has_function_privilege('anon','public.pipstart_maintenance_probe_intent(text,integer,text)','execute')
  or has_function_privilege('service_role','public.pipstart_maintenance_probe_intent(text,integer,text)','execute')
  or (select provolatile from pg_proc where oid='public.pipstart_maintenance_probe_intent(text,integer,text)'::regprocedure)<>'v'
  or has_function_privilege('service_role','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute')
  or not has_function_privilege('authenticated','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute')
  or exists(select 1 from unnest(array['anon','authenticated','service_role']) r
    where has_table_privilege(r,'pipstart_maintenance_private.probe_intents','select')
       or has_table_privilege(r,'pipstart_maintenance_private.probe_intents','insert')) then
  raise exception 'Probe intent migration verification failed'; end if;
end $$;
commit;
