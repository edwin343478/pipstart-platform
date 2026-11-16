-- M22 MP10a maintenance store (owner decisions D1-D3, D5, D6 of 16 November 2026). Review due dates
-- are computed on read from the live revision: partners from their review expiry, links from their
-- expiry, quizzes from nextReviewAt, analysis posts and lessons from their review date plus an
-- Owner-set interval per family. An item with no genuine review date is "no_review". Acknowledging
-- or rescheduling never changes a review date. A maintenance owner is a staff assignment of kind
-- 'maintenance' (MP02), set here by the Owner or an Editor in scope, with a reason. Check results are
-- recorded per reference of the live revision; a 'probe' result needs an Owner-allowlisted host and
-- never an affiliate host. Everything is append-only and audited in the same transaction.
-- Optimistic conflicts raise PT409, never 40001 (PostgREST retries serialization failures).
begin;
do $$ begin
 if to_regprocedure('pipstart_editorial_private.import_partner_item(text,text,text,jsonb,text,text)') is null
  or to_regprocedure('pipstart_staff_private.has_capability(text,text,text)') is null
  or to_regnamespace('pipstart_maintenance_private') is not null then
  raise exception 'Accepted MP09 partner import required; maintenance store must not already exist'; end if;
end $$;

create schema pipstart_maintenance_private;
revoke all on schema pipstart_maintenance_private from public,anon,authenticated,service_role;

alter table pipstart_editorial_private.audit drop constraint audit_operation_check;
alter table pipstart_editorial_private.audit add constraint audit_operation_check
  check(operation in ('create','save','submit','review_approve','review_changes','approve_single_person','trash','restore','hold','release','policy','import',
    'publication_baseline','publish','withdraw','publication_restore','refresh','maintenance'));

-- Owner interval policy for families whose content carries only a review date. Append-only versions.
create table pipstart_maintenance_private.intervals(
  family text not null check(family in ('analysis','lesson')),
  version integer not null check(version>=1),
  days integer not null check(days between 30 and 730),
  reason text not null check(char_length(reason) between 1 and 200 and reason=btrim(reason)),
  set_by uuid references auth.users(id) on delete restrict,
  set_at timestamptz not null default clock_timestamp(),
  primary key(family,version)
);
insert into pipstart_maintenance_private.intervals(family,version,days,reason) values
  ('analysis',1,180,'MP10 owner decision D1 (16 November 2026)'),
  ('lesson',1,365,'MP10 owner decision D1 (16 November 2026)');

-- Assignment, acknowledgement and rescheduling events about one live revision of one item.
create table pipstart_maintenance_private.events(
  id bigint generated always as identity primary key,
  item_id text not null references pipstart_editorial_private.items(id) on delete restrict,
  revision_no integer not null check(revision_no>=1),
  kind text not null check(kind in ('assign','unassign','acknowledge','reschedule')),
  actor_id uuid not null references auth.users(id) on delete restrict,
  assignee uuid references auth.users(id) on delete restrict,
  due_on date,
  reason text not null check(char_length(reason) between 1 and 200 and reason=btrim(reason)),
  created_at timestamptz not null default clock_timestamp(),
  check((kind='reschedule')=(due_on is not null)),
  check((kind in ('assign','unassign'))=(assignee is not null))
);
create index on pipstart_maintenance_private.events(item_id,revision_no,kind,id);

-- Check results for references in a live revision: manual observations and safe single-URL checks.
create table pipstart_maintenance_private.results(
  id bigint generated always as identity primary key,
  item_id text not null references pipstart_editorial_private.items(id) on delete restrict,
  revision_no integer not null check(revision_no>=1),
  reference text not null check(char_length(reference) between 1 and 2048 and reference !~ '[[:cntrl:]]'),
  source text not null check(source in ('manual','probe')),
  classification text not null check(classification in
    ('manual_ok','manual_broken','not_checked','ok','not_found','gone','redirect','forbidden','throttled','timeout','unreachable')),
  evidence text check(evidence is null or (octet_length(evidence)<=2048 and evidence !~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]')),
  actor_id uuid not null references auth.users(id) on delete restrict,
  checked_at timestamptz not null default clock_timestamp(),
  check((source='manual')=(classification in ('manual_ok','manual_broken','not_checked')))
);
create index on pipstart_maintenance_private.results(item_id,revision_no,reference,id);

-- Owner allowlist of hosts the safe external check may contact. Append-only add/remove.
create table pipstart_maintenance_private.allowlist(
  id bigint generated always as identity primary key,
  host text not null check(pipstart_editorial_private.https_host('https://'||host) is not distinct from host),
  action text not null check(action in ('add','remove')),
  reason text not null check(char_length(reason) between 1 and 200 and reason=btrim(reason)),
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default clock_timestamp()
);

create trigger pipstart_maintenance_intervals_immutable before update or delete on pipstart_maintenance_private.intervals
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_maintenance_events_immutable before update or delete on pipstart_maintenance_private.events
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_maintenance_results_immutable before update or delete on pipstart_maintenance_private.results
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_maintenance_allowlist_immutable before update or delete on pipstart_maintenance_private.allowlist
  for each row execute function pipstart_staff_private.immutable_audit();
alter table pipstart_maintenance_private.intervals enable row level security;
alter table pipstart_maintenance_private.events enable row level security;
alter table pipstart_maintenance_private.results enable row level security;
alter table pipstart_maintenance_private.allowlist enable row level security;
revoke all on pipstart_maintenance_private.intervals,pipstart_maintenance_private.events,
  pipstart_maintenance_private.results,pipstart_maintenance_private.allowlist from public,anon,authenticated,service_role;

-- Helpers (private).
create function pipstart_maintenance_private.today() returns date
language sql stable set search_path='' as $$ select (now() at time zone 'utc')::date $$;

create function pipstart_maintenance_private.as_date(p text) returns date
language plpgsql immutable set search_path='' as $$
begin
  if p is null or p !~ '^\d{4}-\d{2}-\d{2}' then return null; end if;
  return left(p,10)::date;
exception when others then return null;
end $$;

-- The live revision of every maintained item (lessons, quizzes, analysis posts, partners, links).
create function pipstart_maintenance_private.live_items()
returns table(item_id text,family text,revision_no integer,body jsonb)
language sql stable security definer set search_path='' as $$
  select e.item_id,e.family,e.revision_no,r.body
  from pipstart_editorial_private.publication_pointer p
  join pipstart_editorial_private.generation_entries e on e.generation=p.generation
  join pipstart_editorial_private.revisions r on r.item_id=e.item_id and r.revision_no=e.revision_no
  where e.family in ('lesson','quiz','analysis','partner','link')
$$;

create function pipstart_maintenance_private.live_revision(p_item text) returns integer
language sql stable security definer set search_path='' as $$
  select l.revision_no from pipstart_maintenance_private.live_items() l where l.item_id=p_item
$$;

-- Review and due dates written in the content itself (never the import date).
create function pipstart_maintenance_private.content_dates(p_family text,p_body jsonb,out reviewed_on date,out due_on date)
language plpgsql stable security definer set search_path='' as $$
declare d integer;
begin
  if p_family='partner' then
    if p_body#>>'{review,status}'='verified' then
      reviewed_on:=pipstart_maintenance_private.as_date(p_body#>>'{review,reviewedAt}');
      due_on:=pipstart_maintenance_private.as_date(p_body#>>'{review,expiresAt}');
    end if;
  elsif p_family='link' then
    due_on:=pipstart_maintenance_private.as_date(p_body->>'expiresAt');
  elsif p_family='quiz' then
    reviewed_on:=pipstart_maintenance_private.as_date(p_body#>>'{metadata,governance,reviewedAt}');
    due_on:=pipstart_maintenance_private.as_date(p_body#>>'{metadata,governance,nextReviewAt}');
  elsif p_family in ('analysis','lesson') then
    reviewed_on:=pipstart_maintenance_private.as_date(p_body#>>'{metadata,reviewedAt}');
    if reviewed_on is not null then
      select i.days into d from pipstart_maintenance_private.intervals i where i.family=p_family order by i.version desc limit 1;
      due_on:=reviewed_on+d;
    end if;
  end if;
end $$;

create function pipstart_maintenance_private.status(p_family text,p_due date) returns text
language sql stable set search_path='' as $$
  select case when p_due is null then case when p_family='link' then 'current' else 'no_review' end
    when p_due<=pipstart_maintenance_private.today() then 'overdue'
    when p_due<=pipstart_maintenance_private.today()+30 then 'due'
    else 'current' end
$$;

create function pipstart_maintenance_private.assignee(p_item text) returns uuid
language sql stable security definer set search_path='' as $$
  select a.user_id from pipstart_staff_private.assignments a
  where a.resource_kind='maintenance' and a.resource_id=p_item order by a.user_id limit 1
$$;

-- The assignee (current maintenance owner) or the Owner may acknowledge, reschedule and record results.
create function pipstart_maintenance_private.may_act(p_user uuid,p_item text) returns boolean
language sql stable security definer set search_path='' as $$
  select pipstart_editorial_private.is_owner(p_user)
    or pipstart_staff_private.has_capability('maintenance.assigned','maintenance',p_item)
$$;

-- The Owner, or an Editor who may publish the item, assigns its maintenance owner.
create function pipstart_maintenance_private.may_assign(p_user uuid,p_family text,p_item text) returns boolean
language sql stable security definer set search_path='' as $$
  select pipstart_editorial_private.is_owner(p_user)
    or (exists(select 1 from pipstart_staff_private.roles r where r.user_id=p_user and r.role_name='editor')
        and pipstart_editorial_private.allowed('content.publish',p_family,p_item))
$$;

create function pipstart_maintenance_private.reason_ok(p_reason text) returns boolean
language sql immutable set search_path='' as $$
  select p_reason is not null and char_length(p_reason) between 1 and 200 and p_reason=btrim(p_reason)
$$;

-- The item's family and its live revision, checked against the caller's expectation.
create function pipstart_maintenance_private.target(p_item text,p_expected integer,out family text,out revision_no integer)
language plpgsql security definer set search_path='' as $$
begin
  if p_item is null or p_item !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then
    raise exception using errcode='22023',message='Invalid content identity'; end if;
  select l.family,l.revision_no into family,revision_no from pipstart_maintenance_private.live_items() l where l.item_id=p_item;
  if not found then raise exception using errcode='22023',message='Only live content is maintained'; end if;
  if p_expected is not null and p_expected is distinct from revision_no then
    raise exception using errcode='PT409',message='The live revision changed'; end if;
  perform pg_advisory_xact_lock(hashtextextended('pipstart_maintenance:'||p_item,0));
end $$;

-- Worklist: live items in scope with their review state. Cursor-paged by item identity, at most 50.
create function public.pipstart_maintenance_worklist(p_scope text default 'mine',p_status text default null,
  p_family text default null,p_after text default '',p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); own boolean; rows jsonb; n integer;
begin
  if p_scope is null or p_scope not in ('mine','all')
   or (p_status is not null and p_status not in ('overdue','due','current','no_review'))
   or (p_family is not null and p_family not in ('lesson','quiz','analysis','partner','link'))
   or p_after is null or char_length(p_after)>200 or p_limit is null or p_limit not between 1 and 50 then
    raise exception using errcode='22023',message='Invalid maintenance request'; end if;
  own:=pipstart_editorial_private.is_owner(u);
  with live as (
    select l.item_id,l.family,l.revision_no,l.body,d.reviewed_on,d.due_on content_due,
      pipstart_maintenance_private.assignee(l.item_id) assignee,
      (select e.due_on from pipstart_maintenance_private.events e where e.item_id=l.item_id and e.revision_no=l.revision_no
        and e.kind='reschedule' order by e.id desc limit 1) override,
      (select jsonb_build_object('at',e.created_at,'reason',e.reason) from pipstart_maintenance_private.events e
        where e.item_id=l.item_id and e.revision_no=l.revision_no and e.kind='acknowledge' order by e.id desc limit 1) ack
    from pipstart_maintenance_private.live_items() l
    cross join lateral pipstart_maintenance_private.content_dates(l.family,l.body) d
    where l.item_id>p_after and (p_family is null or l.family=p_family)
  ), visible as (
    select live.*,coalesce(override,content_due) due,pipstart_maintenance_private.status(family,coalesce(override,content_due)) st
    from live
    where (p_scope='mine' and assignee=u)
       or (p_scope='all' and (own or pipstart_maintenance_private.may_assign(u,family,item_id)))
  )
  select coalesce(jsonb_agg(x.j order by x.item_id),'[]'::jsonb),count(*) into rows,n from (
    select v.item_id,jsonb_build_object('id',v.item_id,'family',v.family,'title',v.body#>>'{metadata,title}',
      'revision',v.revision_no,'reviewedOn',v.reviewed_on,'contentDue',v.content_due,'due',v.due,
      'rescheduled',v.override is not null,'status',v.st,'acknowledged',v.ack,
      'assignedToMe',v.assignee is not distinct from u,'assignee',case when own then v.assignee end) j
    from visible v where p_status is null or v.st=p_status order by v.item_id limit p_limit+1) x;
  if n>p_limit then
    rows:=rows-p_limit;
    return jsonb_build_object('items',rows,'next',rows->(p_limit-1)->>'id');
  end if;
  return jsonb_build_object('items',rows,'next',null);
end $$;

create function public.pipstart_maintenance_assign(p_item text,p_assignee uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; t record; prior uuid;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_maintenance_private.reason_ok(p_reason) or p_assignee is null then
    raise exception using errcode='22023',message='Invalid maintenance assignment'; end if;
  select * into t from pipstart_maintenance_private.target(p_item,null);
  if not pipstart_maintenance_private.may_assign(u,t.family,p_item) then
    raise exception using errcode='42501',message='Not permitted to assign this maintenance'; end if;
  if not exists(select 1 from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id)
     where m.user_id=p_assignee and m.active and r.role_name in ('owner','author','reviewer','editor','moderator','affiliate_manager')) then
    raise exception using errcode='22023',message='The assignee must be active staff'; end if;
  prior:=pipstart_maintenance_private.assignee(p_item);
  if prior=p_assignee and (select count(*) from pipstart_staff_private.assignments a where a.resource_kind='maintenance' and a.resource_id=p_item)=1 then
    return jsonb_build_object('item_id',p_item,'status','unchanged'); end if;
  delete from pipstart_staff_private.assignments a where a.resource_kind='maintenance' and a.resource_id=p_item;
  insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values(p_assignee,'maintenance',p_item);
  insert into pipstart_maintenance_private.events(item_id,revision_no,kind,actor_id,assignee,reason)
    values(p_item,t.revision_no,'assign',u,p_assignee,p_reason);
  perform pipstart_editorial_private.log(u,'maintenance',p_item,t.revision_no,
    case when prior is null then 'assign: ' else 'reassign: ' end||p_reason);
  return jsonb_build_object('item_id',p_item,'status','assigned');
end $$;

create function public.pipstart_maintenance_unassign(p_item text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; t record; prior uuid;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_maintenance_private.reason_ok(p_reason) then
    raise exception using errcode='22023',message='Invalid maintenance assignment'; end if;
  select * into t from pipstart_maintenance_private.target(p_item,null);
  if not pipstart_maintenance_private.may_assign(u,t.family,p_item) then
    raise exception using errcode='42501',message='Not permitted to assign this maintenance'; end if;
  prior:=pipstart_maintenance_private.assignee(p_item);
  if prior is null then return jsonb_build_object('item_id',p_item,'status','unchanged'); end if;
  delete from pipstart_staff_private.assignments a where a.resource_kind='maintenance' and a.resource_id=p_item;
  insert into pipstart_maintenance_private.events(item_id,revision_no,kind,actor_id,assignee,reason)
    values(p_item,t.revision_no,'unassign',u,prior,p_reason);
  perform pipstart_editorial_private.log(u,'maintenance',p_item,t.revision_no,'unassign: '||p_reason);
  return jsonb_build_object('item_id',p_item,'status','unassigned');
end $$;

-- "Seen, will handle". The item stays due; no review date changes.
create function public.pipstart_maintenance_acknowledge(p_item text,p_expected_revision integer,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; t record;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_maintenance_private.reason_ok(p_reason) or p_expected_revision is null then
    raise exception using errcode='22023',message='Invalid maintenance acknowledgement'; end if;
  select * into t from pipstart_maintenance_private.target(p_item,p_expected_revision);
  if not pipstart_maintenance_private.may_act(u,p_item) then
    raise exception using errcode='42501',message='Only the assigned staff member or the Owner may act'; end if;
  insert into pipstart_maintenance_private.events(item_id,revision_no,kind,actor_id,reason)
    values(p_item,t.revision_no,'acknowledge',u,p_reason);
  perform pipstart_editorial_private.log(u,'maintenance',p_item,t.revision_no,'acknowledge: '||p_reason);
  return jsonb_build_object('item_id',p_item,'revision',t.revision_no,'status','acknowledged');
end $$;

-- A new due date for this live revision: at most 90 days ahead, or 365 for the Owner.
create function public.pipstart_maintenance_reschedule(p_item text,p_expected_revision integer,p_due date,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; t record; limit_days integer;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_maintenance_private.reason_ok(p_reason) or p_expected_revision is null or p_due is null then
    raise exception using errcode='22023',message='Invalid maintenance reschedule'; end if;
  select * into t from pipstart_maintenance_private.target(p_item,p_expected_revision);
  if not pipstart_maintenance_private.may_act(u,p_item) then
    raise exception using errcode='42501',message='Only the assigned staff member or the Owner may act'; end if;
  limit_days:=case when pipstart_editorial_private.is_owner(u) then 365 else 90 end;
  if p_due<=pipstart_maintenance_private.today() or p_due>pipstart_maintenance_private.today()+limit_days then
    raise exception using errcode='22023',message='The new due date must be after today and within '||limit_days||' days'; end if;
  insert into pipstart_maintenance_private.events(item_id,revision_no,kind,actor_id,due_on,reason)
    values(p_item,t.revision_no,'reschedule',u,p_due,p_reason);
  perform pipstart_editorial_private.log(u,'maintenance',p_item,t.revision_no,'reschedule to '||p_due||': '||p_reason);
  return jsonb_build_object('item_id',p_item,'revision',t.revision_no,'due',p_due,'status','rescheduled');
end $$;

-- Whether a host is currently on the Owner allowlist.
create function pipstart_maintenance_private.host_listed(p_host text) returns boolean
language sql stable security definer set search_path='' as $$
  select coalesce((select a.action='add' from pipstart_maintenance_private.allowlist a where a.host=p_host order by a.id desc limit 1),false)
$$;

-- Hosts of affiliate links (any link policy version); never checked automatically.
create function pipstart_maintenance_private.affiliate_host(p_host text) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from pipstart_editorial_private.partner_policies p where p.kind='link' and p_host=any(p.allowed_hosts))
$$;

-- One observation of one reference that appears in the live revision.
create function public.pipstart_maintenance_record_result(p_item text,p_expected_revision integer,p_reference text,
  p_source text,p_classification text,p_evidence text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; t record; body text; h text;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if p_expected_revision is null or p_reference is null or char_length(p_reference) not between 1 and 2048 or p_reference ~ '[[:cntrl:]]'
   or p_source is null or p_source not in ('manual','probe') or p_classification is null
   or (p_source='manual' and p_classification not in ('manual_ok','manual_broken','not_checked'))
   or (p_source='probe' and p_classification not in ('ok','not_found','gone','redirect','forbidden','throttled','timeout','unreachable'))
   or (p_evidence is not null and (octet_length(p_evidence)>2048 or p_evidence ~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]')) then
    raise exception using errcode='22023',message='Invalid maintenance result'; end if;
  select * into t from pipstart_maintenance_private.target(p_item,p_expected_revision);
  if not pipstart_maintenance_private.may_act(u,p_item) then
    raise exception using errcode='42501',message='Only the assigned staff member or the Owner may act'; end if;
  select r.body::text into body from pipstart_editorial_private.revisions r where r.item_id=p_item and r.revision_no=t.revision_no;
  if position(p_reference in body)=0 then
    raise exception using errcode='22023',message='The reference is not in the live revision'; end if;
  if p_source='probe' then
    h:=pipstart_editorial_private.https_host(p_reference);
    if h is null or not pipstart_maintenance_private.host_listed(h) or pipstart_maintenance_private.affiliate_host(h) then
      raise exception using errcode='42501',message='Only allowlisted, non-affiliate HTTPS hosts may be checked'; end if;
  end if;
  insert into pipstart_maintenance_private.results(item_id,revision_no,reference,source,classification,evidence,actor_id)
    values(p_item,t.revision_no,p_reference,p_source,p_classification,p_evidence,u);
  perform pipstart_editorial_private.log(u,'maintenance',p_item,t.revision_no,'result '||p_source||' '||p_classification);
  return jsonb_build_object('item_id',p_item,'revision',t.revision_no,'status','recorded');
end $$;

-- The latest result per reference of the item's live revision.
create function public.pipstart_maintenance_results(p_item text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); t record;
begin
  select * into t from pipstart_maintenance_private.target(p_item,null);
  if not (pipstart_maintenance_private.may_act(u,p_item) or pipstart_maintenance_private.may_assign(u,t.family,p_item)) then
    raise exception using errcode='42501',message='Not permitted to read this maintenance'; end if;
  return jsonb_build_object('item_id',p_item,'revision',t.revision_no,'results',coalesce((
    select jsonb_agg(jsonb_build_object('reference',x.reference,'source',x.source,'classification',x.classification,
      'evidence',x.evidence,'checkedAt',x.checked_at,'byMe',x.actor_id=u) order by x.reference)
    from (select distinct on (r.reference) r.* from pipstart_maintenance_private.results r
      where r.item_id=p_item and r.revision_no=t.revision_no order by r.reference,r.id desc limit 200) x),'[]'::jsonb));
end $$;

-- Owner-only interval policy (compare-and-set on the current version).
create function public.pipstart_maintenance_interval_set(p_family text,p_expected_version integer,p_days integer,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; cur integer;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_editorial_private.is_owner(u) then
    raise exception using errcode='42501',message='Only the Owner sets review intervals'; end if;
  if p_family is null or p_family not in ('analysis','lesson') or p_days is null or p_days not between 30 and 730
   or not pipstart_maintenance_private.reason_ok(p_reason) then
    raise exception using errcode='22023',message='Invalid review interval'; end if;
  perform pg_advisory_xact_lock(hashtextextended('pipstart_maintenance_interval:'||p_family,0));
  select max(i.version) into cur from pipstart_maintenance_private.intervals i where i.family=p_family;
  if p_expected_version is distinct from cur then
    raise exception using errcode='PT409',message='A newer review interval exists'; end if;
  insert into pipstart_maintenance_private.intervals(family,version,days,reason,set_by) values(p_family,cur+1,p_days,p_reason,u);
  perform pipstart_editorial_private.log(u,'maintenance',null,null,'interval '||p_family||' v'||(cur+1)||' '||p_days||' days: '||p_reason);
  return jsonb_build_object('family',p_family,'version',cur+1,'days',p_days);
end $$;

create function public.pipstart_maintenance_intervals()
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required();
begin
  return (select jsonb_agg(jsonb_build_object('family',x.family,'version',x.version,'days',x.days,'setAt',x.set_at) order by x.family)
    from (select distinct on (i.family) i.* from pipstart_maintenance_private.intervals i order by i.family,i.version desc) x);
end $$;

-- Owner-only allowlist change; repeating the current state is unchanged and not logged.
create function public.pipstart_maintenance_allowlist_change(p_host text,p_action text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid;
begin
  perform 1 from pipstart_staff_private.control where singleton for share;
  u:=pipstart_editorial_private.actor_required();
  if not pipstart_editorial_private.is_owner(u) then
    raise exception using errcode='42501',message='Only the Owner changes the allowlist'; end if;
  if p_host is null or pipstart_editorial_private.https_host('https://'||p_host) is distinct from p_host
   or p_action is null or p_action not in ('add','remove') or not pipstart_maintenance_private.reason_ok(p_reason) then
    raise exception using errcode='22023',message='Invalid allowlist change'; end if;
  if p_action='add' and pipstart_maintenance_private.affiliate_host(p_host) then
    raise exception using errcode='22023',message='Affiliate hosts are never checked automatically'; end if;
  perform pg_advisory_xact_lock(hashtextextended('pipstart_maintenance_allowlist:'||p_host,0));
  if pipstart_maintenance_private.host_listed(p_host)=(p_action='add') then
    return jsonb_build_object('host',p_host,'status','unchanged'); end if;
  insert into pipstart_maintenance_private.allowlist(host,action,reason,actor_id) values(p_host,p_action,p_reason,u);
  perform pipstart_editorial_private.log(u,'maintenance',null,null,'allowlist '||p_action||' '||p_host||': '||p_reason);
  return jsonb_build_object('host',p_host,'status',case when p_action='add' then 'added' else 'removed' end);
end $$;

create function public.pipstart_maintenance_allowlist()
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required();
begin
  if not pipstart_editorial_private.is_owner(u) then
    raise exception using errcode='42501',message='Only the Owner reads the allowlist'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('host',x.host,'since',x.created_at) order by x.host)
    from (select distinct on (a.host) a.* from pipstart_maintenance_private.allowlist a order by a.host,a.id desc) x
    where x.action='add'),'[]'::jsonb);
end $$;

-- Whether one URL may be checked: an allowlisted, non-affiliate HTTPS host (for the safe check).
create function public.pipstart_maintenance_check_allowed(p_url text)
returns boolean language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); h text;
begin
  h:=pipstart_editorial_private.https_host(p_url);
  return h is not null and pipstart_maintenance_private.host_listed(h) and not pipstart_maintenance_private.affiliate_host(h);
end $$;

revoke all on function pipstart_maintenance_private.today(),pipstart_maintenance_private.as_date(text),
  pipstart_maintenance_private.live_items(),pipstart_maintenance_private.live_revision(text),
  pipstart_maintenance_private.content_dates(text,jsonb),pipstart_maintenance_private.status(text,date),
  pipstart_maintenance_private.assignee(text),pipstart_maintenance_private.may_act(uuid,text),
  pipstart_maintenance_private.may_assign(uuid,text,text),pipstart_maintenance_private.reason_ok(text),
  pipstart_maintenance_private.target(text,integer),pipstart_maintenance_private.host_listed(text),
  pipstart_maintenance_private.affiliate_host(text)
  from public,anon,authenticated,service_role;
revoke all on function public.pipstart_maintenance_worklist(text,text,text,text,integer),
  public.pipstart_maintenance_assign(text,uuid,text),public.pipstart_maintenance_unassign(text,text),
  public.pipstart_maintenance_acknowledge(text,integer,text),public.pipstart_maintenance_reschedule(text,integer,date,text),
  public.pipstart_maintenance_record_result(text,integer,text,text,text,text),public.pipstart_maintenance_results(text),
  public.pipstart_maintenance_interval_set(text,integer,integer,text),public.pipstart_maintenance_intervals(),
  public.pipstart_maintenance_allowlist_change(text,text,text),public.pipstart_maintenance_allowlist(),
  public.pipstart_maintenance_check_allowed(text)
  from public,anon,authenticated,service_role;
grant execute on function public.pipstart_maintenance_worklist(text,text,text,text,integer),
  public.pipstart_maintenance_assign(text,uuid,text),public.pipstart_maintenance_unassign(text,text),
  public.pipstart_maintenance_acknowledge(text,integer,text),public.pipstart_maintenance_reschedule(text,integer,date,text),
  public.pipstart_maintenance_record_result(text,integer,text,text,text,text),public.pipstart_maintenance_results(text),
  public.pipstart_maintenance_interval_set(text,integer,integer,text),public.pipstart_maintenance_intervals(),
  public.pipstart_maintenance_allowlist_change(text,text,text),public.pipstart_maintenance_allowlist(),
  public.pipstart_maintenance_check_allowed(text)
  to authenticated;
commit;
