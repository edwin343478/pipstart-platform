-- M22 MP08a publication store. A publication generation is an immutable, sealed set of exact
-- published revisions (one per published item) plus the frozen quiz versions they carry. A single
-- pointer names the live generation. Baseline (Owner, once), publish, withdraw and restore each
-- create the next generation under a stable operation identity and a compare-and-set on the live
-- generation, recheck approval, capability and dependencies at execution, and are audited. The
-- build reads the live generation's public snapshot (service role only: it contains quiz answer
-- keys for server grading) and verifies its seal. Refresh jobs track delivery of each generation.
-- Owner decision (MP08): the Owner's audited single-person approval is accepted for publication
-- while no distinct reviewer exists. Trash now refuses content that is still published.
-- No existing row changes; learner pages keep reading code until the MP08d authority switch.
begin;
do $$ begin
 if to_regprocedure('pipstart_editorial_private.quiz_published_version(text)') is null
  or to_regclass('pipstart_editorial_private.generations') is not null then
  raise exception 'Accepted quiz-version rule required; publication store must not already exist'; end if;
end $$;

alter table pipstart_editorial_private.audit drop constraint audit_operation_check;
alter table pipstart_editorial_private.audit add constraint audit_operation_check
  check(operation in ('create','save','submit','review_approve','review_changes','approve_single_person','trash','restore','hold','release','policy','import',
    'publication_baseline','publish','withdraw','publication_restore','refresh'));

create table pipstart_editorial_private.generations(
  generation bigint primary key check(generation>=1),
  kind text not null check(kind in ('baseline','publish','withdraw','restore')),
  operation_id uuid not null unique,
  actor_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check(char_length(reason) between 1 and 200 and reason=btrim(reason)),
  item_id text references pipstart_editorial_private.items(id) on delete restrict,
  revision_no integer,
  from_generation bigint references pipstart_editorial_private.generations(generation) on delete restrict,
  previous_generation bigint references pipstart_editorial_private.generations(generation) on delete restrict,
  created_at timestamptz not null default clock_timestamp(),
  check((kind='baseline')=(previous_generation is null)),
  check((kind='restore')=(from_generation is not null)),
  check((kind in ('publish','withdraw'))=(item_id is not null)),
  check((kind='publish')=(revision_no is not null))
);
create table pipstart_editorial_private.generation_entries(
  generation bigint not null references pipstart_editorial_private.generations(generation) on delete restrict,
  item_id text not null references pipstart_editorial_private.items(id) on delete restrict,
  family text not null,
  learning_path text,
  parent_id text,
  revision_no integer not null,
  body_sha256 text not null check(body_sha256 ~ '^[0-9a-f]{64}$'),
  primary key(generation,item_id),
  foreign key(item_id,revision_no) references pipstart_editorial_private.revisions(item_id,revision_no) on delete restrict
);
create table pipstart_editorial_private.generation_quiz_versions(
  generation bigint not null references pipstart_editorial_private.generations(generation) on delete restrict,
  item_id text not null,
  version integer not null check(version>=1),
  revision_no integer not null,
  body_sha256 text not null check(body_sha256 ~ '^[0-9a-f]{64}$'),
  primary key(generation,item_id,version),
  foreign key(item_id,revision_no) references pipstart_editorial_private.revisions(item_id,revision_no) on delete restrict
);
-- Written last: a generation without a seal is incomplete and is never served.
create table pipstart_editorial_private.generation_seals(
  generation bigint primary key references pipstart_editorial_private.generations(generation) on delete restrict,
  entries integer not null check(entries>=1),
  snapshot_sha256 text not null check(snapshot_sha256 ~ '^[0-9a-f]{64}$'),
  sealed_at timestamptz not null default clock_timestamp()
);
create table pipstart_editorial_private.publication_pointer(
  singleton boolean primary key default true check(singleton),
  generation bigint references pipstart_editorial_private.generation_seals(generation) on delete restrict,
  updated_at timestamptz not null default clock_timestamp()
);
insert into pipstart_editorial_private.publication_pointer(singleton) values(true);
create table pipstart_editorial_private.refresh_jobs(
  generation bigint primary key references pipstart_editorial_private.generation_seals(generation) on delete restrict,
  state text not null default 'pending' check(state in ('pending','processing','verified','failed','superseded')),
  attempts integer not null default 0 check(attempts between 0 and 20),
  note text check(note is null or char_length(note) between 1 and 200),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp()
);
create trigger pipstart_generation_immutable before update or delete on pipstart_editorial_private.generations
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_generation_entry_immutable before update or delete on pipstart_editorial_private.generation_entries
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_generation_quiz_immutable before update or delete on pipstart_editorial_private.generation_quiz_versions
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_generation_seal_immutable before update or delete on pipstart_editorial_private.generation_seals
  for each row execute function pipstart_staff_private.immutable_audit();
alter table pipstart_editorial_private.generations enable row level security;
alter table pipstart_editorial_private.generation_entries enable row level security;
alter table pipstart_editorial_private.generation_quiz_versions enable row level security;
alter table pipstart_editorial_private.generation_seals enable row level security;
alter table pipstart_editorial_private.publication_pointer enable row level security;
alter table pipstart_editorial_private.refresh_jobs enable row level security;
revoke all on pipstart_editorial_private.generations,pipstart_editorial_private.generation_entries,pipstart_editorial_private.generation_quiz_versions,
  pipstart_editorial_private.generation_seals,pipstart_editorial_private.publication_pointer,pipstart_editorial_private.refresh_jobs
  from public,anon,authenticated,service_role;

-- The approval a publication relies on: an imported, reviewer or Owner decision for this exact body.
create function pipstart_editorial_private.revision_approved(p_item text,p_revision integer,p_sha text) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from pipstart_editorial_private.decisions d
    where d.item_id=p_item and d.revision_no=p_revision and d.body_sha256=p_sha and d.kind in ('imported','reviewed','single_person'))
$$;

-- Every approved version of each published quiz up to its published version, earliest decided
-- revision per version (immutable once decided), frozen into the generation.
create function pipstart_editorial_private.freeze_quiz_versions(p_generation bigint) returns void
language sql security definer set search_path='' as $$
  insert into pipstart_editorial_private.generation_quiz_versions(generation,item_id,version,revision_no,body_sha256)
  select distinct on (e.item_id,(r.body->'metadata'->>'version')::integer)
    p_generation,e.item_id,(r.body->'metadata'->>'version')::integer,r.revision_no,r.body_sha256
  from pipstart_editorial_private.generation_entries e
  join pipstart_editorial_private.revisions pr on pr.item_id=e.item_id and pr.revision_no=e.revision_no
  join pipstart_editorial_private.revisions r on r.item_id=e.item_id
  where e.generation=p_generation and e.family='quiz'
    and (r.body->'metadata'->>'version') ~ '^[1-9][0-9]{0,8}$'
    and (r.body->'metadata'->>'version')::integer<=(pr.body->'metadata'->>'version')::integer
    and pipstart_editorial_private.revision_approved(r.item_id,r.revision_no,r.body_sha256)
  order by e.item_id,(r.body->'metadata'->>'version')::integer,r.revision_no
$$;

-- The generation's public snapshot, in the export's exact format, order and seals (format 2).
create function pipstart_editorial_private.generation_snapshot(p_generation bigint) returns jsonb
language sql stable security definer set search_path='' as $$
  with recursive approved as (
    select e.item_id id,e.family,e.learning_path,e.parent_id,e.revision_no,r.body,e.body_sha256
    from pipstart_editorial_private.generation_entries e
    join pipstart_editorial_private.revisions r on r.item_id=e.item_id and r.revision_no=e.revision_no
    where e.generation=p_generation
  ),
  tree as (
    select a.*,array['0',case a.learning_path when 'forex' then '0' else '1' end,
      lpad(coalesce(substring(a.body->'metadata'->>'level' from '^level-(\d+)$'),'999999'),6,'0'),
      lpad((a.body->'metadata'->'placement'->>'order'),9,'0'),a.id] sort_key
    from approved a where a.family='course'
    union all
    select a.*,t.sort_key||array[lpad((a.body->'metadata'->'placement'->>'order'),9,'0'),a.id]
    from approved a join tree t on a.parent_id=t.id
  ),
  snapshot_items as (
    select id,family,learning_path,parent_id,revision_no,body,body_sha256,row_number() over (order by sort_key) n from tree
    union all
    select id,family,learning_path,parent_id,revision_no,body,body_sha256,
      (select count(*) from tree)+row_number() over (order by (body->'metadata'->>'category')='technical',body->'metadata'->>'publishedAt' desc,id)
    from approved where family='analysis'
  ),
  quiz_versions as (
    select q.item_id id,q.version,q.revision_no,r.body,q.body_sha256
    from pipstart_editorial_private.generation_quiz_versions q
    join pipstart_editorial_private.revisions r on r.item_id=q.item_id and r.revision_no=q.revision_no
    where q.generation=p_generation
  )
  select jsonb_build_object(
    'format','pipstart-content-snapshot','version',2,
    'exportedAt',(select to_char(g.created_at at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') from pipstart_editorial_private.generations g where g.generation=p_generation),
    'items',jsonb_agg(jsonb_build_object('id',id,'family',family,'learningPath',learning_path,'parentId',parent_id,'revisionNo',revision_no,
      'state','approved','bodySha256',body_sha256,'body',body) order by n),
    'itemsSha256',encode(sha256(convert_to(string_agg(id||' '||family||' '||revision_no||' '||body_sha256||chr(10),'' order by n),'UTF8')),'hex'),
    'quizVersions',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'version',version,'revisionNo',revision_no,'bodySha256',body_sha256,'body',body) order by id,version),'[]'::jsonb) from quiz_versions),
    'quizVersionsSha256',(select encode(sha256(convert_to(coalesce(string_agg(id||' '||version||' '||revision_no||' '||body_sha256||chr(10),'' order by id,version),''),'UTF8')),'hex') from quiz_versions))
  from snapshot_items
$$;

-- Live generation, locked: the compare-and-set point for every change.
create function pipstart_editorial_private.locked_pointer() returns bigint
language plpgsql security definer set search_path='' as $$
declare g bigint;
begin
  select generation into g from pipstart_editorial_private.publication_pointer where singleton for update;
  return g;
end $$;

-- A repeated operation identity returns its first result when the arguments match, else refuses.
create function pipstart_editorial_private.replayed(p_operation uuid,p_kind text,p_item text,p_revision integer,p_from bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g pipstart_editorial_private.generations;
begin
  if p_operation is null then raise exception using errcode='22023',message='Operation identity required'; end if;
  select * into g from pipstart_editorial_private.generations where operation_id=p_operation;
  if not found then return null; end if;
  if (g.kind,g.item_id,g.revision_no,g.from_generation) is distinct from (p_kind,p_item,p_revision,p_from) then
    raise exception using errcode='22023',message='Operation identity already used for a different change'; end if;
  return pipstart_editorial_private.generation_result(g.generation,true);
end $$;

create function pipstart_editorial_private.generation_result(p_generation bigint,p_replayed boolean) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('generation',g.generation,'kind',g.kind,'item_id',g.item_id,'revision_no',g.revision_no,
    'entries',s.entries,'snapshot_sha256',s.snapshot_sha256,'replayed',p_replayed)
  from pipstart_editorial_private.generations g join pipstart_editorial_private.generation_seals s using(generation)
  where g.generation=p_generation
$$;

-- Completes a generation whose entries are written: coherence, quiz versions, seal, pointer,
-- refresh job and audit. Refuses any entry whose parent is absent or whose item is in trash.
create function pipstart_editorial_private.complete_generation(p_generation bigint,p_actor uuid,p_operation text,p_item text,p_revision integer,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare n integer; s jsonb;
begin
  if exists(select 1 from pipstart_editorial_private.generation_entries e where e.generation=p_generation and e.parent_id is not null
      and not exists(select 1 from pipstart_editorial_private.generation_entries p where p.generation=p_generation and p.item_id=e.parent_id)) then
    raise exception using errcode='55000',message='Published content needs its parent published'; end if;
  if exists(select 1 from pipstart_editorial_private.generation_entries e join pipstart_editorial_private.items i on i.id=e.item_id
      where e.generation=p_generation and i.trashed_at is not null) then
    raise exception using errcode='55000',message='Content in trash cannot be published'; end if;
  select count(*) into n from pipstart_editorial_private.generation_entries where generation=p_generation;
  if n<1 then raise exception using errcode='55000',message='A generation needs at least one published item'; end if;
  perform pipstart_editorial_private.freeze_quiz_versions(p_generation);
  s:=pipstart_editorial_private.generation_snapshot(p_generation);
  insert into pipstart_editorial_private.generation_seals(generation,entries,snapshot_sha256)
    values(p_generation,n,encode(sha256(convert_to(s::text,'UTF8')),'hex'));
  update pipstart_editorial_private.refresh_jobs set state='superseded',updated_at=clock_timestamp() where state in ('pending','processing','failed');
  insert into pipstart_editorial_private.refresh_jobs(generation) values(p_generation);
  update pipstart_editorial_private.publication_pointer set generation=p_generation,updated_at=clock_timestamp() where singleton;
  perform pipstart_editorial_private.log(p_actor,p_operation,p_item,p_revision,'generation '||p_generation||': '||p_reason);
  return pipstart_editorial_private.generation_result(p_generation,false);
end $$;

create function pipstart_editorial_private.reason_ok(p_reason text) returns text
language plpgsql immutable set search_path='' as $$
begin
  if p_reason is null or p_reason<>btrim(p_reason) or char_length(p_reason) not between 1 and 200 then
    raise exception using errcode='22023',message='Give a reason (1 to 200 characters)'; end if;
  return p_reason;
end $$;

-- Generation 1: every item whose latest decided revision is approved, exactly as imported or
-- approved today. Owner only, once.
create function public.pipstart_publication_baseline(p_operation uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); cur bigint; prior jsonb;
begin
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner can create the baseline'; end if;
  perform pipstart_editorial_private.reason_ok(p_reason);
  cur:=pipstart_editorial_private.locked_pointer();
  prior:=pipstart_editorial_private.replayed(p_operation,'baseline',null,null,null);
  if prior is not null then return prior; end if;
  if cur is not null or exists(select 1 from pipstart_editorial_private.generations) then
    raise exception using errcode='55000',message='The baseline already exists'; end if;
  insert into pipstart_editorial_private.generations(generation,kind,operation_id,actor_id,reason) values(1,'baseline',p_operation,u,p_reason);
  insert into pipstart_editorial_private.generation_entries(generation,item_id,family,learning_path,parent_id,revision_no,body_sha256)
  select 1,i.id,i.family,i.learning_path,i.parent_id,r.revision_no,r.body_sha256
  from pipstart_editorial_private.items i
  join lateral (select revision_no,body_sha256 from pipstart_editorial_private.revisions x
    where x.item_id=i.id and pipstart_editorial_private.revision_approved(x.item_id,x.revision_no,x.body_sha256)
    order by x.revision_no desc limit 1) r on true
  where i.trashed_at is null;
  return pipstart_editorial_private.complete_generation(1,u,'publication_baseline',null,null,p_reason);
end $$;

create function public.pipstart_publication_publish(p_operation uuid,p_expected_generation bigint,p_id text,p_revision integer,p_sha text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); cur bigint; prior jsonb; i pipstart_editorial_private.items;
  r pipstart_editorial_private.revisions; e pipstart_editorial_private.generation_entries; nxt bigint;
begin
  perform pipstart_editorial_private.reason_ok(p_reason);
  cur:=pipstart_editorial_private.locked_pointer();
  prior:=pipstart_editorial_private.replayed(p_operation,'publish',p_id,p_revision,null);
  if prior is not null then return prior; end if;
  if cur is null then raise exception using errcode='55000',message='Create the baseline generation first'; end if;
  if p_expected_generation is distinct from cur then raise exception using errcode='PT409',message='A newer publication exists'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.publish',i.family,i.id);
  if i.trashed_at is not null then raise exception using errcode='55000',message='Content is in trash'; end if;
  select * into r from pipstart_editorial_private.revisions where item_id=i.id and revision_no=p_revision;
  if not found or r.body_sha256 is distinct from p_sha then raise exception using errcode='PT409',message='Revision content changed'; end if;
  if not pipstart_editorial_private.revision_approved(i.id,r.revision_no,r.body_sha256) then
    raise exception using errcode='55000',message='Only an approved revision can be published'; end if;
  select * into e from pipstart_editorial_private.generation_entries where generation=cur and item_id=i.id;
  if found and e.body_sha256=r.body_sha256 then raise exception using errcode='55000',message='This revision is already published'; end if;
  if found and i.family='quiz' and (r.body->'metadata'->>'version')::integer<=
     (select (x.body->'metadata'->>'version')::integer from pipstart_editorial_private.revisions x where x.item_id=i.id and x.revision_no=e.revision_no) then
    raise exception using errcode='55000',message='A quiz can only be published at a later version'; end if;
  if found and r.revision_no<e.revision_no then raise exception using errcode='55000',message='A newer revision is already published; use restore to go back'; end if;
  nxt:=cur+1;
  insert into pipstart_editorial_private.generations(generation,kind,operation_id,actor_id,reason,item_id,revision_no,previous_generation)
    values(nxt,'publish',p_operation,u,p_reason,i.id,r.revision_no,cur);
  insert into pipstart_editorial_private.generation_entries(generation,item_id,family,learning_path,parent_id,revision_no,body_sha256)
  select nxt,item_id,family,learning_path,parent_id,revision_no,body_sha256 from pipstart_editorial_private.generation_entries where generation=cur and item_id<>i.id
  union all select nxt,i.id,i.family,i.learning_path,i.parent_id,r.revision_no,r.body_sha256;
  return pipstart_editorial_private.complete_generation(nxt,u,'publish',i.id,r.revision_no,p_reason);
end $$;

create function public.pipstart_publication_withdraw(p_operation uuid,p_expected_generation bigint,p_id text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); cur bigint; prior jsonb; i pipstart_editorial_private.items; nxt bigint;
begin
  perform pipstart_editorial_private.reason_ok(p_reason);
  cur:=pipstart_editorial_private.locked_pointer();
  prior:=pipstart_editorial_private.replayed(p_operation,'withdraw',p_id,null,null);
  if prior is not null then return prior; end if;
  if cur is null then raise exception using errcode='55000',message='Nothing is published'; end if;
  if p_expected_generation is distinct from cur then raise exception using errcode='PT409',message='A newer publication exists'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.withdraw',i.family,i.id);
  if not exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and item_id=i.id) then
    raise exception using errcode='55000',message='This content is not published'; end if;
  if exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and parent_id=i.id) then
    raise exception using errcode='55000',message='Withdraw the published contents first'; end if;
  nxt:=cur+1;
  insert into pipstart_editorial_private.generations(generation,kind,operation_id,actor_id,reason,item_id,previous_generation)
    values(nxt,'withdraw',p_operation,u,p_reason,i.id,cur);
  insert into pipstart_editorial_private.generation_entries(generation,item_id,family,learning_path,parent_id,revision_no,body_sha256)
  select nxt,item_id,family,learning_path,parent_id,revision_no,body_sha256 from pipstart_editorial_private.generation_entries where generation=cur and item_id<>i.id;
  return pipstart_editorial_private.complete_generation(nxt,u,'withdraw',i.id,null,p_reason);
end $$;

-- Restore makes an earlier generation's exact set live again as a new generation. Owner only.
create function public.pipstart_publication_restore(p_operation uuid,p_expected_generation bigint,p_from_generation bigint,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); cur bigint; prior jsonb; nxt bigint;
begin
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner can restore a publication'; end if;
  perform pipstart_editorial_private.reason_ok(p_reason);
  cur:=pipstart_editorial_private.locked_pointer();
  prior:=pipstart_editorial_private.replayed(p_operation,'restore',null,null,p_from_generation);
  if prior is not null then return prior; end if;
  if cur is null then raise exception using errcode='55000',message='Nothing is published'; end if;
  if p_expected_generation is distinct from cur then raise exception using errcode='PT409',message='A newer publication exists'; end if;
  if p_from_generation is null or p_from_generation>=cur or not exists(select 1 from pipstart_editorial_private.generation_seals where generation=p_from_generation) then
    raise exception using errcode='22023',message='Choose an earlier sealed generation'; end if;
  nxt:=cur+1;
  insert into pipstart_editorial_private.generations(generation,kind,operation_id,actor_id,reason,from_generation,previous_generation)
    values(nxt,'restore',p_operation,u,p_reason,p_from_generation,cur);
  insert into pipstart_editorial_private.generation_entries(generation,item_id,family,learning_path,parent_id,revision_no,body_sha256)
  select nxt,item_id,family,learning_path,parent_id,revision_no,body_sha256 from pipstart_editorial_private.generation_entries where generation=p_from_generation;
  return pipstart_editorial_private.complete_generation(nxt,u,'publication_restore',null,null,'from generation '||p_from_generation||': '||p_reason);
end $$;

-- Staff status: the live generation, its delivery state, and one item's published revision.
create function public.pipstart_publication_status(p_id text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; cur bigint; res jsonb;
begin
  if not pipstart_staff_private.has_capability('staff.enter','','') then raise exception using errcode='42501',message='Not permitted'; end if;
  select generation into cur from pipstart_editorial_private.publication_pointer where singleton;
  res:=jsonb_build_object('generation',cur,
    'refresh',(select jsonb_build_object('state',j.state,'attempts',j.attempts,'updated_at',j.updated_at) from pipstart_editorial_private.refresh_jobs j where j.generation=cur));
  if p_id is not null then
    select * into i from pipstart_editorial_private.items where id=p_id;
    if not found then raise exception using errcode='22023',message='Unknown content identity'; end if;
    perform pipstart_editorial_private.require('content.read',i.family,i.id);
    res:=res||jsonb_build_object('item_id',i.id,'published',(select jsonb_build_object('revision_no',e.revision_no,'body_sha256',e.body_sha256)
      from pipstart_editorial_private.generation_entries e where e.generation=cur and e.item_id=i.id));
  end if;
  return res;
end $$;

-- Build read (service role only): the live generation's sealed public snapshot.
create function public.pipstart_publication_snapshot()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare cur bigint; s jsonb; seal pipstart_editorial_private.generation_seals;
begin
  select generation into cur from pipstart_editorial_private.publication_pointer where singleton;
  if cur is null then raise exception using errcode='55000',message='Nothing is published'; end if;
  select * into seal from pipstart_editorial_private.generation_seals where generation=cur;
  s:=pipstart_editorial_private.generation_snapshot(cur);
  if encode(sha256(convert_to(s::text,'UTF8')),'hex') is distinct from seal.snapshot_sha256 then
    raise exception using errcode='XX001',message='Published generation does not match its seal'; end if;
  return jsonb_build_object('generation',cur,'snapshot_sha256',seal.snapshot_sha256,'snapshot',s);
end $$;

-- Delivery tracking (service role): pending -> processing -> verified | failed; failed -> processing.
create function public.pipstart_publication_refresh(p_generation bigint,p_state text,p_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j pipstart_editorial_private.refresh_jobs;
begin
  select * into j from pipstart_editorial_private.refresh_jobs where generation=p_generation for update;
  if not found then raise exception using errcode='22023',message='Unknown generation'; end if;
  if p_note is not null and char_length(p_note) not between 1 and 200 then raise exception using errcode='22023',message='Note is too long'; end if;
  if not ((j.state in ('pending','failed') and p_state='processing') or (j.state='processing' and p_state in ('verified','failed'))) then
    raise exception using errcode='55000',message='Invalid refresh transition'; end if;
  if p_state='processing' and j.attempts>=20 then raise exception using errcode='55000',message='Refresh attempts exhausted'; end if;
  update pipstart_editorial_private.refresh_jobs set state=p_state,note=p_note,updated_at=clock_timestamp(),
    attempts=attempts+(case when p_state='processing' then 1 else 0 end) where generation=p_generation returning * into j;
  return jsonb_build_object('generation',j.generation,'state',j.state,'attempts',j.attempts);
end $$;

revoke all on function pipstart_editorial_private.revision_approved(text,integer,text),pipstart_editorial_private.freeze_quiz_versions(bigint),
  pipstart_editorial_private.generation_snapshot(bigint),pipstart_editorial_private.locked_pointer(),
  pipstart_editorial_private.replayed(uuid,text,text,integer,bigint),pipstart_editorial_private.generation_result(bigint,boolean),
  pipstart_editorial_private.complete_generation(bigint,uuid,text,text,integer,text),pipstart_editorial_private.reason_ok(text)
  from public,anon,authenticated,service_role;
revoke all on function public.pipstart_publication_baseline(uuid,text),public.pipstart_publication_publish(uuid,bigint,text,integer,text,text),
  public.pipstart_publication_withdraw(uuid,bigint,text,text),public.pipstart_publication_restore(uuid,bigint,bigint,text),
  public.pipstart_publication_status(text),public.pipstart_publication_snapshot(),public.pipstart_publication_refresh(bigint,text,text)
  from public,anon,authenticated,service_role;
grant execute on function public.pipstart_publication_baseline(uuid,text),public.pipstart_publication_publish(uuid,bigint,text,integer,text,text),
  public.pipstart_publication_withdraw(uuid,bigint,text,text),public.pipstart_publication_restore(uuid,bigint,bigint,text),
  public.pipstart_publication_status(text) to authenticated;
grant execute on function public.pipstart_publication_snapshot(),public.pipstart_publication_refresh(bigint,text,text) to service_role;

-- Trash keeps its exact signature, grants and behaviour, plus one check.
create or replace function public.pipstart_editorial_trash(p_id text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.trash',i.family,i.id);
  if p_reason is null or char_length(btrim(p_reason)) not between 1 and 200 then raise exception using errcode='22023',message='Give a reason'; end if;
  if i.trashed_at is not null then raise exception using errcode='55000',message='Content is already in trash'; end if;
  if i.hold_reason is not null then raise exception using errcode='55000',message='Content is on hold'; end if;
  if exists(select 1 from pipstart_editorial_private.generation_entries e join pipstart_editorial_private.publication_pointer p on p.generation=e.generation where e.item_id=i.id) then
    raise exception using errcode='55000',message='Withdraw the published content first'; end if;
  if exists(select 1 from pipstart_editorial_private.items where parent_id=i.id and trashed_at is null) then
    raise exception using errcode='55000',message='Move the contents to trash first'; end if;
  update pipstart_editorial_private.items set trashed_at=clock_timestamp(),trashed_by=u where id=i.id;
  perform pipstart_editorial_private.log(u,'trash',i.id,i.latest_revision,btrim(p_reason));
  return jsonb_build_object('item_id',i.id,'trashed',true);
end $$;
commit;
