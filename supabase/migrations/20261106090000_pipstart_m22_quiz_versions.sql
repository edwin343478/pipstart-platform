-- M22 MP07a quiz versions: a quiz's published versions are immutable and a draft always carries the
-- next version. The highest approved version of a quiz is the highest metadata.version among its
-- revisions holding an imported, reviewer or Owner decision for their exact body. A quiz draft (create
-- or save) must carry exactly that version plus one (1 for a new quiz). Submit, approve and Owner
-- publish accept a quiz revision only when its version is that next version, or is already approved
-- with exactly this body (for example after a restore). Two different bodies can therefore never be
-- approved under one version, and attempts keep resolving the version they were started on.
-- create, save, submit, review and approve_single_person keep their exact signatures, grants,
-- authority and behaviour; each gains one quiz check. Other families are unaffected. No rows change.
begin;
do $$ begin
 if to_regprocedure('pipstart_editorial_private.publication_sources_ok(text,jsonb)') is null
  or to_regprocedure('pipstart_editorial_private.quiz_published_version(text)') is not null then
  raise exception 'Accepted publication-sources rule required; quiz version rule must not already exist'; end if;
end $$;

-- Highest version approved for the exact body of one of the quiz's revisions; null when none is.
create function pipstart_editorial_private.quiz_published_version(p_item text) returns integer
language sql stable security definer set search_path='' as $$
  select max((r.body->'metadata'->>'version')::integer)
  from pipstart_editorial_private.revisions r
  where r.item_id=p_item and (r.body->'metadata'->>'version') ~ '^[1-9][0-9]{0,8}$'
    and exists(select 1 from pipstart_editorial_private.decisions d
      where d.item_id=r.item_id and d.revision_no=r.revision_no and d.body_sha256=r.body_sha256
        and d.kind in ('imported','reviewed','single_person'))
$$;

-- A quiz draft carries exactly the next version. Never null: a missing or malformed version is
-- simply not the next version.
create function pipstart_editorial_private.quiz_version_ok(p_item text,p_body jsonb) returns boolean
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_typeof(p_body->'metadata'->'version')='number'
    and (p_body->'metadata'->>'version') ~ '^[1-9][0-9]{0,8}$'
    and (p_body->'metadata'->>'version')::integer=coalesce(pipstart_editorial_private.quiz_published_version(p_item),0)+1,false)
$$;

-- A decision approves a quiz revision only as the next version or as an identical re-approval.
create function pipstart_editorial_private.quiz_decision_ok(p_item text,p_revision integer) returns boolean
language sql stable security definer set search_path='' as $$
  select coalesce((
    select case
      when x.v is null then false
      when x.v=coalesce(pipstart_editorial_private.quiz_published_version(p_item),0)+1 then true
      else exists(select 1 from pipstart_editorial_private.revisions r2
        join pipstart_editorial_private.decisions d on d.item_id=r2.item_id and d.revision_no=r2.revision_no and d.body_sha256=r2.body_sha256
        where r2.item_id=p_item and r2.body->'metadata'->>'version'=x.v::text and r2.body_sha256=x.sha
          and d.kind in ('imported','reviewed','single_person'))
    end
    from (select r.body_sha256 sha,
        case when (r.body->'metadata'->>'version') ~ '^[1-9][0-9]{0,8}$' then (r.body->'metadata'->>'version')::integer end v
      from pipstart_editorial_private.revisions r where r.item_id=p_item and r.revision_no=p_revision) x),false)
$$;
revoke all on function pipstart_editorial_private.quiz_published_version(text) from public,anon,authenticated,service_role;
revoke all on function pipstart_editorial_private.quiz_version_ok(text,jsonb) from public,anon,authenticated,service_role;
revoke all on function pipstart_editorial_private.quiz_decision_ok(text,integer) from public,anon,authenticated,service_role;

create or replace function public.pipstart_editorial_create(p_id text,p_family text,p_learning_path text,p_parent text,p_body jsonb,p_reason text)
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
  if p_family='quiz' and not pipstart_editorial_private.quiz_version_ok(p_id,p_body) then
    raise exception using errcode='22023',message='A quiz draft must carry the next version: one more than its highest approved version'; end if;
  insert into pipstart_editorial_private.items(id,family,learning_path,parent_id,created_by,latest_revision) values(p_id,p_family,p_learning_path,p_parent,u,1);
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(p_id,1,1,p_body,repeat('0',64),0,u,p_reason,'draft');
  perform pipstart_editorial_private.log(u,'create',p_id,1,p_reason);
  return pipstart_editorial_private.revision_result(p_id,1);
end $$;

create or replace function public.pipstart_editorial_save(p_id text,p_base_revision integer,p_body jsonb,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; n integer;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.write',i.family,i.id);
  if i.trashed_at is not null then raise exception using errcode='55000',message='Content is in trash'; end if;
  if p_base_revision is distinct from i.latest_revision then raise exception using errcode='PT409',message='A newer revision exists; reload before saving'; end if;
  if not pipstart_editorial_private.body_ok(i.family,p_body) then raise exception using errcode='22023',message='Content body is not valid for this family'; end if;
  if i.family='quiz' and not pipstart_editorial_private.quiz_version_ok(i.id,p_body) then
    raise exception using errcode='22023',message='A quiz draft must carry the next version: one more than its highest approved version'; end if;
  n:=i.latest_revision+1;
  perform pipstart_editorial_private.supersede_open(i.id);
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(i.id,n,1,p_body,repeat('0',64),p_base_revision,u,p_reason,'draft');
  update pipstart_editorial_private.items set latest_revision=n where id=i.id;
  perform pipstart_editorial_private.log(u,'save',i.id,n,p_reason);
  return pipstart_editorial_private.revision_result(i.id,n);
end $$;

create or replace function public.pipstart_editorial_submit(p_id text,p_revision integer,p_sha text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.submit',i.family,i.id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['draft']);
  if not pipstart_editorial_private.publication_sources_ok(i.family,r.body) then
    raise exception using errcode='22023',message='Add at least one HTTPS source before review or publication'; end if;
  if i.family='quiz' and not pipstart_editorial_private.quiz_decision_ok(i.id,r.revision_no) then
    raise exception using errcode='22023',message='This quiz version is already approved with different content, or is not the next version'; end if;
  update pipstart_editorial_private.revisions set state='submitted' where item_id=i.id and revision_no=r.revision_no;
  perform pipstart_editorial_private.log(u,'submit',i.id,r.revision_no,null);
  return pipstart_editorial_private.revision_result(i.id,r.revision_no);
end $$;

create or replace function public.pipstart_editorial_review(p_id text,p_revision integer,p_sha text,p_approve boolean,p_note text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  if p_approve is null then raise exception using errcode='22023',message='Choose approve or request changes'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.review',i.family,i.id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['submitted']);
  if r.author_id=u then raise exception using errcode='42501',message='A reviewer cannot review their own revision'; end if;
  if p_approve then
    if not pipstart_editorial_private.publication_sources_ok(i.family,r.body) then
      raise exception using errcode='22023',message='Add at least one HTTPS source before review or publication'; end if;
    if i.family='quiz' and not pipstart_editorial_private.quiz_decision_ok(i.id,r.revision_no) then
      raise exception using errcode='22023',message='This quiz version is already approved with different content, or is not the next version'; end if;
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

create or replace function public.pipstart_editorial_approve_single_person(p_id text,p_revision integer,p_sha text,p_note text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  if not pipstart_editorial_private.is_owner(u) then raise exception using errcode='42501',message='Only the Owner can publish without review'; end if;
  perform 1 from pipstart_editorial_private.policy where singleton and not require_review for share;
  if not found then raise exception using errcode='42501',message='Review is required by policy'; end if;
  i:=pipstart_editorial_private.locked_item(p_id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['draft','submitted']);
  if not pipstart_editorial_private.publication_sources_ok(i.family,r.body) then
    raise exception using errcode='22023',message='Add at least one HTTPS source before review or publication'; end if;
  if i.family='quiz' and not pipstart_editorial_private.quiz_decision_ok(i.id,r.revision_no) then
    raise exception using errcode='22023',message='This quiz version is already approved with different content, or is not the next version'; end if;
  update pipstart_editorial_private.revisions set state='approved' where item_id=i.id and revision_no=r.revision_no;
  insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(i.id,r.revision_no,r.body_sha256,u,'single_person',nullif(btrim(p_note),''));
  perform pipstart_editorial_private.log(u,'approve_single_person',i.id,r.revision_no,null);
  return pipstart_editorial_private.revision_result(i.id,r.revision_no);
end $$;
commit;
