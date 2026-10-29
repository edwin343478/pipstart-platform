-- M22 MP04a editorial store: stable content identities (courses, modules, lessons, quizzes and
-- analysis posts), immutable revisions, exact-hash decisions (reviewed or Owner single-person),
-- trash/restore/holds, a review policy switch and same-transaction audit. Staff reach it only
-- through user-context RPCs; nothing public reads it.
-- Optimistic conflicts raise PT409 (HTTP 409 Conflict), never 40001: PostgREST retries
-- serialization failures, so a deterministic stale-base refusal would retry without end.
begin;
do $$ begin
 if to_regprocedure('pipstart_staff_private.actor()') is null
  or to_regprocedure('pipstart_staff_private.has_capability(text,text,text)') is null
  or to_regprocedure('pipstart_staff_private.immutable_audit()') is null
  or to_regprocedure('public.pipstart_staff_enrolment_allowed()') is null
  or to_regnamespace('pipstart_editorial_private') is not null then
  raise exception 'Accepted staff core and enrolment gate required; editorial store must not already exist'; end if;
end $$;

create schema pipstart_editorial_private;
revoke all on schema pipstart_editorial_private from public;

-- Owner-controlled switch: when true, the single-person Publish path is closed for everyone.
create table pipstart_editorial_private.policy(
  singleton boolean primary key default true check(singleton),
  require_review boolean not null default false,
  version bigint not null default 0 check(version>=0)
);
insert into pipstart_editorial_private.policy(singleton) values(true);

create table pipstart_editorial_private.items(
  id text primary key check(id ~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$'),
  family text not null check(family in ('course','module','lesson','quiz','analysis')),
  -- Learning content belongs to one path; analysis posts are not path content.
  learning_path text check(learning_path in ('forex','crypto')),
  parent_id text references pipstart_editorial_private.items(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default clock_timestamp(),
  latest_revision integer not null default 0 check(latest_revision>=0),
  trashed_at timestamptz,
  trashed_by uuid references auth.users(id) on delete restrict,
  hold_reason text check(hold_reason is null or char_length(hold_reason) between 1 and 200),
  check((family in ('course','analysis'))=(parent_id is null)),
  check((family='analysis')=(learning_path is null)),
  check((trashed_at is null)=(trashed_by is null))
);

create table pipstart_editorial_private.revisions(
  item_id text not null references pipstart_editorial_private.items(id) on delete restrict,
  revision_no integer not null check(revision_no>=1),
  schema_version integer not null check(schema_version=1),
  body jsonb not null,
  body_sha256 text not null check(body_sha256 ~ '^[0-9a-f]{64}$'),
  base_revision integer not null check(base_revision>=0 and base_revision<revision_no),
  author_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check(char_length(reason) between 1 and 200),
  state text not null check(state in ('draft','submitted','changes_requested','approved','superseded')),
  created_at timestamptz not null default clock_timestamp(),
  primary key(item_id,revision_no)
);

create table pipstart_editorial_private.decisions(
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  revision_no integer not null,
  body_sha256 text not null check(body_sha256 ~ '^[0-9a-f]{64}$'),
  actor_id uuid not null references auth.users(id) on delete restrict,
  kind text not null check(kind in ('reviewed','single_person','changes_requested')),
  note text check(note is null or char_length(note) between 1 and 1000),
  created_at timestamptz not null default clock_timestamp(),
  foreign key(item_id,revision_no) references pipstart_editorial_private.revisions(item_id,revision_no) on delete restrict,
  check(kind<>'changes_requested' or note is not null)
);

-- Minimized: who, what, which item/revision and a short reason. Never a content body.
create table pipstart_editorial_private.audit(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default clock_timestamp(),
  actor_id uuid not null,
  operation text not null check(operation in ('create','save','submit','review_approve','review_changes','approve_single_person','trash','restore','hold','release','policy')),
  item_id text,
  revision_no integer,
  detail text check(detail is null or char_length(detail)<=200)
);

alter table pipstart_editorial_private.policy enable row level security;
alter table pipstart_editorial_private.items enable row level security;
alter table pipstart_editorial_private.revisions enable row level security;
alter table pipstart_editorial_private.decisions enable row level security;
alter table pipstart_editorial_private.audit enable row level security;
revoke all on all tables in schema pipstart_editorial_private from public,anon,authenticated,service_role;

-- Structural invariants enforced even when an RPC is called directly; deep validation is in
-- the server validator (MP04b) and publication rechecks everything (MP08).
create function pipstart_editorial_private.body_ok(p_family text,p_body jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare b jsonb;
begin
  if coalesce(p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>262144
   or jsonb_typeof(p_body->'metadata')<>'object'
   or jsonb_typeof(p_body->'metadata'->'title')<>'string'
   or char_length(btrim(p_body->'metadata'->>'title')) not between 1 and 200,true) then return false; end if;
  if p_family='lesson' then
    if coalesce(jsonb_typeof(p_body->'blocks')<>'array' or jsonb_array_length(p_body->'blocks') not between 1 and 500,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'blocks') loop
      if coalesce(jsonb_typeof(b)<>'object' or coalesce(b->>'type','') not in (
        'heading','paragraph','learningLink','section','references','riskStatement','list','quote','reflection',
        'takeaway','definition','example','warning','keyPoint','formula','exercise','practice','diagram',
        'comparisonTable','riskNotice','affiliateDisclosure','quizPreview'),true) then return false; end if;
    end loop;
    if p_body ? 'sections' and jsonb_typeof(p_body->'sections')<>'array' then return false; end if;
  elsif p_family='analysis' then
    -- Exactly one section per post: a single string, never a list or both.
    if coalesce(jsonb_typeof(p_body->'metadata'->'category')<>'string' or p_body->'metadata'->>'category' not in ('fundamental','technical')
     or jsonb_typeof(p_body->'metadata'->'excerpt')<>'string' or char_length(btrim(p_body->'metadata'->>'excerpt')) not between 1 and 300
     or jsonb_typeof(p_body->'paragraphs')<>'array' or jsonb_array_length(p_body->'paragraphs') not between 1 and 200,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'paragraphs') loop
      if coalesce(jsonb_typeof(b)<>'string' or btrim(b#>>'{}')='',true) then return false; end if;
    end loop;
  elsif p_family='quiz' then
    if coalesce(jsonb_typeof(p_body->'questions')<>'array' or jsonb_array_length(p_body->'questions') not between 1 and 100,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'questions') loop
      if coalesce(jsonb_typeof(b)<>'object' or jsonb_typeof(b->'choices')<>'array' or jsonb_typeof(b->'correctChoiceIds')<>'array'
       or jsonb_array_length(b->'choices') not between 2 and 10 or jsonb_array_length(b->'correctChoiceIds')<1,true) then return false; end if;
    end loop;
  end if;
  return true;
end $$;

create function pipstart_editorial_private.revision_guard() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception using errcode='42501',message='Editorial revisions are immutable'; end if;
  if tg_op='INSERT' then
    new.body_sha256:=encode(sha256(convert_to(new.body::text,'UTF8')),'hex');
    return new;
  end if;
  if (new.item_id,new.revision_no,new.schema_version,new.body,new.body_sha256,new.base_revision,new.author_id,new.reason,new.created_at)
     is distinct from (old.item_id,old.revision_no,old.schema_version,old.body,old.body_sha256,old.base_revision,old.author_id,old.reason,old.created_at) then
    raise exception using errcode='42501',message='Editorial revisions are immutable'; end if;
  if not ((old.state='draft' and new.state in ('submitted','approved','superseded'))
       or (old.state='submitted' and new.state in ('approved','changes_requested','superseded'))
       or (old.state in ('changes_requested','approved') and new.state='superseded')) then
    raise exception using errcode='55000',message='Invalid editorial state transition'; end if;
  return new;
end $$;
create trigger pipstart_editorial_revision_guard before insert or update or delete on pipstart_editorial_private.revisions
  for each row execute function pipstart_editorial_private.revision_guard();

create function pipstart_editorial_private.item_guard() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception using errcode='42501',message='Editorial identities are permanent'; end if;
  if (new.id,new.family,new.learning_path,new.parent_id,new.created_by,new.created_at)
     is distinct from (old.id,old.family,old.learning_path,old.parent_id,old.created_by,old.created_at) then
    raise exception using errcode='42501',message='Editorial identity fields are immutable'; end if;
  if new.latest_revision<old.latest_revision then raise exception using errcode='42501',message='Revision pointer cannot move backwards'; end if;
  return new;
end $$;
create trigger pipstart_editorial_item_guard before update or delete on pipstart_editorial_private.items
  for each row execute function pipstart_editorial_private.item_guard();
create trigger pipstart_editorial_decision_immutable before update or delete on pipstart_editorial_private.decisions
  for each row execute function pipstart_staff_private.immutable_audit();
create trigger pipstart_editorial_audit_immutable before update or delete on pipstart_editorial_private.audit
  for each row execute function pipstart_staff_private.immutable_audit();

create function pipstart_editorial_private.actor_required() returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_staff_private.actor();
begin
  if u is null then raise exception using errcode='42501',message='Verified staff session required'; end if;
  return u;
end $$;

create function pipstart_editorial_private.is_owner(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id)
    where m.user_id=p_user and m.active and r.role_name='owner')
$$;

create function pipstart_editorial_private.require(p_capability text,p_family text,p_id text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not pipstart_staff_private.has_capability(p_capability,p_family,p_id) then
    raise exception using errcode='42501',message='Not permitted for this content'; end if;
end $$;

create function pipstart_editorial_private.log(p_actor uuid,p_operation text,p_item text,p_revision integer,p_detail text) returns void
language sql security definer set search_path='' as $$
  insert into pipstart_editorial_private.audit(actor_id,operation,item_id,revision_no,detail)
  values(p_actor,p_operation,p_item,p_revision,left(p_detail,200))
$$;

create function pipstart_editorial_private.locked_item(p_id text) returns pipstart_editorial_private.items
language plpgsql security definer set search_path='' as $$
declare i pipstart_editorial_private.items;
begin
  select * into i from pipstart_editorial_private.items where id=p_id for update;
  if not found then raise exception using errcode='22023',message='Unknown content identity'; end if;
  return i;
end $$;

create function pipstart_editorial_private.supersede_open(p_item text) returns void
language sql security definer set search_path='' as $$
  update pipstart_editorial_private.revisions set state='superseded'
  where item_id=p_item and state in ('draft','submitted','changes_requested','approved')
$$;

create function pipstart_editorial_private.revision_result(p_item text,p_revision integer) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('item_id',item_id,'revision_no',revision_no,'body_sha256',body_sha256,'state',state)
  from pipstart_editorial_private.revisions where item_id=p_item and revision_no=p_revision
$$;

-- The exact revision a decision applies to: latest, matching hash, in an allowed state.
create function pipstart_editorial_private.target_revision(p_item pipstart_editorial_private.items,p_revision integer,p_sha text,p_states text[])
returns pipstart_editorial_private.revisions language plpgsql security definer set search_path='' as $$
declare r pipstart_editorial_private.revisions;
begin
  if p_item.trashed_at is not null then raise exception using errcode='55000',message='Content is in trash'; end if;
  if p_revision is distinct from p_item.latest_revision then raise exception using errcode='PT409',message='A newer revision exists'; end if;
  select * into r from pipstart_editorial_private.revisions where item_id=p_item.id and revision_no=p_revision for update;
  if r.body_sha256 is distinct from p_sha then raise exception using errcode='PT409',message='Revision content changed'; end if;
  if not (r.state=any(p_states)) then raise exception using errcode='55000',message='Revision is not in a state for this action'; end if;
  return r;
end $$;

create function public.pipstart_editorial_create(p_id text,p_family text,p_learning_path text,p_parent text,p_body jsonb,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); p pipstart_editorial_private.items;
begin
  if p_family is null or p_family not in ('course','module','lesson','quiz','analysis')
   or (p_family='analysis' and p_learning_path is not null)
   or (p_family<>'analysis' and (p_learning_path is null or p_learning_path not in ('forex','crypto'))) then
    raise exception using errcode='22023',message='Unsupported content family or path'; end if;
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then raise exception using errcode='22023',message='Invalid content identity'; end if;
  if p_parent is null then
    if p_family not in ('course','analysis') then raise exception using errcode='22023',message='Only courses and analysis posts have no parent'; end if;
    perform pipstart_editorial_private.require('content.write',p_family,p_id);
  else
    p:=pipstart_editorial_private.locked_item(p_parent);
    perform pipstart_editorial_private.require('content.write',p.family,p.id);
    if p_family='analysis' or p.trashed_at is not null or p.learning_path is distinct from p_learning_path
     or not ((p_family='module' and p.family='course') or (p_family='lesson' and p.family='module') or (p_family='quiz' and p.family in ('course','module','lesson'))) then
      raise exception using errcode='22023',message='Parent does not accept this content'; end if;
  end if;
  if exists(select 1 from pipstart_editorial_private.items where id=p_id) then raise exception using errcode='22023',message='Content identity already exists'; end if;
  if not pipstart_editorial_private.body_ok(p_family,p_body) then raise exception using errcode='22023',message='Content body is not valid for this family'; end if;
  insert into pipstart_editorial_private.items(id,family,learning_path,parent_id,created_by,latest_revision) values(p_id,p_family,p_learning_path,p_parent,u,1);
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(p_id,1,1,p_body,repeat('0',64),0,u,p_reason,'draft');
  perform pipstart_editorial_private.log(u,'create',p_id,1,p_reason);
  return pipstart_editorial_private.revision_result(p_id,1);
end $$;

create function public.pipstart_editorial_save(p_id text,p_base_revision integer,p_body jsonb,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; n integer;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.write',i.family,i.id);
  if i.trashed_at is not null then raise exception using errcode='55000',message='Content is in trash'; end if;
  if p_base_revision is distinct from i.latest_revision then raise exception using errcode='PT409',message='A newer revision exists; reload before saving'; end if;
  if not pipstart_editorial_private.body_ok(i.family,p_body) then raise exception using errcode='22023',message='Content body is not valid for this family'; end if;
  n:=i.latest_revision+1;
  perform pipstart_editorial_private.supersede_open(i.id);
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(i.id,n,1,p_body,repeat('0',64),p_base_revision,u,p_reason,'draft');
  update pipstart_editorial_private.items set latest_revision=n where id=i.id;
  perform pipstart_editorial_private.log(u,'save',i.id,n,p_reason);
  return pipstart_editorial_private.revision_result(i.id,n);
end $$;

-- "Send to reviewer".
create function public.pipstart_editorial_submit(p_id text,p_revision integer,p_sha text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.submit',i.family,i.id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['draft']);
  update pipstart_editorial_private.revisions set state='submitted' where item_id=i.id and revision_no=r.revision_no;
  perform pipstart_editorial_private.log(u,'submit',i.id,r.revision_no,null);
  return pipstart_editorial_private.revision_result(i.id,r.revision_no);
end $$;

-- Ordinary review: a different person approves the exact submitted revision or asks for changes.
create function public.pipstart_editorial_review(p_id text,p_revision integer,p_sha text,p_approve boolean,p_note text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  if p_approve is null then raise exception using errcode='22023',message='Choose approve or request changes'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.review',i.family,i.id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['submitted']);
  if r.author_id=u then raise exception using errcode='42501',message='A reviewer cannot review their own revision'; end if;
  if p_approve then
    update pipstart_editorial_private.revisions set state='approved' where item_id=i.id and revision_no=r.revision_no;
    insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(i.id,r.revision_no,r.body_sha256,u,'reviewed',nullif(btrim(p_note),''));
    perform pipstart_editorial_private.log(u,'review_approve',i.id,r.revision_no,null);
  else
    if p_note is null or btrim(p_note)='' then raise exception using errcode='22023',message='Say what needs to change'; end if;
    update pipstart_editorial_private.revisions set state='changes_requested' where item_id=i.id and revision_no=r.revision_no;
    insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(i.id,r.revision_no,r.body_sha256,u,'changes_requested',btrim(p_note));
    perform pipstart_editorial_private.log(u,'review_changes',i.id,r.revision_no,null);
  end if;
  return pipstart_editorial_private.revision_result(i.id,r.revision_no);
end $$;

-- "Publish": the Owner's single-person decision on the exact revision, while review is optional.
create function public.pipstart_editorial_approve_single_person(p_id text,p_revision integer,p_sha text,p_note text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner can publish without review'; end if;
  perform 1 from pipstart_editorial_private.policy where singleton and not require_review for share;
  if not found then raise exception using errcode='42501',message='Review is required by policy'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['draft','submitted']);
  update pipstart_editorial_private.revisions set state='approved' where item_id=i.id and revision_no=r.revision_no;
  insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(i.id,r.revision_no,r.body_sha256,u,'single_person',nullif(btrim(p_note),''));
  perform pipstart_editorial_private.log(u,'approve_single_person',i.id,r.revision_no,null);
  return pipstart_editorial_private.revision_result(i.id,r.revision_no);
end $$;

create function public.pipstart_editorial_trash(p_id text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.trash',i.family,i.id);
  if p_reason is null or char_length(btrim(p_reason)) not between 1 and 200 then raise exception using errcode='22023',message='Give a reason'; end if;
  if i.trashed_at is not null then raise exception using errcode='55000',message='Content is already in trash'; end if;
  if i.hold_reason is not null then raise exception using errcode='55000',message='Content is on hold'; end if;
  if exists(select 1 from pipstart_editorial_private.items where parent_id=i.id and trashed_at is null) then
    raise exception using errcode='55000',message='Move the contents to trash first'; end if;
  update pipstart_editorial_private.items set trashed_at=clock_timestamp(),trashed_by=u where id=i.id;
  perform pipstart_editorial_private.log(u,'trash',i.id,i.latest_revision,btrim(p_reason));
  return jsonb_build_object('item_id',i.id,'trashed',true);
end $$;

-- Restore never reinstates approval: it creates a new draft from the latest revision.
create function public.pipstart_editorial_restore(p_id text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; prev pipstart_editorial_private.revisions; n integer;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.restore',i.family,i.id);
  if p_reason is null or char_length(btrim(p_reason)) not between 1 and 200 then raise exception using errcode='22023',message='Give a reason'; end if;
  if i.trashed_at is null then raise exception using errcode='55000',message='Content is not in trash'; end if;
  if i.parent_id is not null and exists(select 1 from pipstart_editorial_private.items where id=i.parent_id and trashed_at is not null) then
    raise exception using errcode='55000',message='Restore the parent first'; end if;
  select * into prev from pipstart_editorial_private.revisions where item_id=i.id and revision_no=i.latest_revision;
  n:=i.latest_revision+1;
  perform pipstart_editorial_private.supersede_open(i.id);
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(i.id,n,prev.schema_version,prev.body,repeat('0',64),i.latest_revision,u,btrim(p_reason),'draft');
  update pipstart_editorial_private.items set trashed_at=null,trashed_by=null,latest_revision=n where id=i.id;
  perform pipstart_editorial_private.log(u,'restore',i.id,n,btrim(p_reason));
  return pipstart_editorial_private.revision_result(i.id,n);
end $$;

-- Owner-only hold that blocks trash; a null reason releases it.
create function public.pipstart_editorial_hold(p_id text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items;
begin
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner can set holds'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  if p_reason is not null and char_length(btrim(p_reason)) not between 1 and 200 then raise exception using errcode='22023',message='Give a short reason'; end if;
  update pipstart_editorial_private.items set hold_reason=nullif(btrim(p_reason),'') where id=i.id;
  perform pipstart_editorial_private.log(u,case when p_reason is null then 'release' else 'hold' end,i.id,null,p_reason);
  return jsonb_build_object('item_id',i.id,'held',p_reason is not null);
end $$;

-- Future switch: require review for everyone (closes "Publish"); version-checked and audited.
create function public.pipstart_editorial_set_review_policy(p_require_review boolean,p_expected_version bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); v bigint;
begin
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner can change the review policy'; end if;
  if p_require_review is null then raise exception using errcode='22023',message='Choose the policy'; end if;
  select version into v from pipstart_editorial_private.policy where singleton for update;
  if p_expected_version is distinct from v then raise exception using errcode='PT409',message='Policy changed; reload'; end if;
  update pipstart_editorial_private.policy set require_review=p_require_review,version=version+1 where singleton;
  perform pipstart_editorial_private.log(u,'policy',null,null,case when p_require_review then 'require_review' else 'single_person_allowed' end);
  return jsonb_build_object('require_review',p_require_review,'version',v+1);
end $$;

-- Staff private read of one item: identity, latest revision (body included) and its decisions.
-- Volatile on purpose: the staff actor check takes FOR SHARE locks, which PostgREST's read-only
-- transaction for stable functions would refuse (25006).
create function public.pipstart_editorial_item(p_id text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; res jsonb;
begin
  select * into i from pipstart_editorial_private.items where id=p_id;
  if not found then raise exception using errcode='22023',message='Unknown content identity'; end if;
  perform pipstart_editorial_private.require('content.read',i.family,i.id);
  select jsonb_build_object(
    'item',jsonb_build_object('id',i.id,'family',i.family,'learning_path',i.learning_path,'parent_id',i.parent_id,'latest_revision',i.latest_revision,'trashed',i.trashed_at is not null,'on_hold',i.hold_reason is not null),
    'revision',jsonb_build_object('revision_no',r.revision_no,'schema_version',r.schema_version,'body',r.body,'body_sha256',r.body_sha256,'base_revision',r.base_revision,'author_is_me',r.author_id=u,'state',r.state,'created_at',r.created_at),
    'decisions',coalesce((select jsonb_agg(jsonb_build_object('kind',d.kind,'note',d.note,'by_me',d.actor_id=u,'at',d.created_at) order by d.created_at)
      from pipstart_editorial_private.decisions d where d.item_id=i.id and d.revision_no=r.revision_no),'[]'::jsonb),
    'review_required',(select require_review from pipstart_editorial_private.policy where singleton))
  into res from pipstart_editorial_private.revisions r where r.item_id=i.id and r.revision_no=i.latest_revision;
  return res;
end $$;

-- Bounded keyset list of items the caller may read (Owner: all; others: assigned items).
create function public.pipstart_editorial_list(p_after text default '',p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); sees_all boolean;
begin
  if p_after is null or p_limit is null or p_limit not between 1 and 100 then raise exception using errcode='22023',message='Invalid page'; end if;
  sees_all:=pipstart_editorial_private.is_owner(u);
  return coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'family',x.family,'learning_path',x.learning_path,'category',x.category,'parent_id',x.parent_id,'latest_revision',x.latest_revision,'state',x.state,'trashed',x.trashed) order by x.id)
    from (select i.id,i.family,i.learning_path,case when i.family='analysis' then r.body->'metadata'->>'category' end as category,i.parent_id,i.latest_revision,r.state,i.trashed_at is not null as trashed
      from pipstart_editorial_private.items i join pipstart_editorial_private.revisions r on r.item_id=i.id and r.revision_no=i.latest_revision
      where i.id>p_after and (sees_all or pipstart_staff_private.has_capability('content.read',i.family,i.id))
      order by i.id limit p_limit) x),'[]'::jsonb);
end $$;

revoke all on all functions in schema pipstart_editorial_private from public,anon,authenticated,service_role;
do $$ declare f text; begin
  foreach f in array array[
    'public.pipstart_editorial_create(text,text,text,text,jsonb,text)','public.pipstart_editorial_save(text,integer,jsonb,text)',
    'public.pipstart_editorial_submit(text,integer,text)','public.pipstart_editorial_review(text,integer,text,boolean,text)',
    'public.pipstart_editorial_approve_single_person(text,integer,text,text)','public.pipstart_editorial_trash(text,text)',
    'public.pipstart_editorial_restore(text,text)','public.pipstart_editorial_hold(text,text)',
    'public.pipstart_editorial_set_review_policy(boolean,bigint)','public.pipstart_editorial_item(text)','public.pipstart_editorial_list(text,integer)'] loop
    execute format('revoke all on function %s from public,anon,authenticated,service_role',f);
    execute format('grant execute on function %s to authenticated',f);
  end loop;
end $$;
commit;
