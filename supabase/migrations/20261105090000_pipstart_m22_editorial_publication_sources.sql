-- M22 MP06d2b publication sources rule: a lesson revision can be sent to a reviewer, approved by
-- a reviewer or published by the Owner only when it cites at least one HTTPS source. The three
-- RPCs keep their exact signatures, grants, authority and behaviour; each gains one check on the
-- exact target revision. Drafts can still be created and saved without sources. Requesting
-- changes is unaffected. Other families are unaffected.
begin;
do $$ begin
 if to_regprocedure('public.pipstart_editorial_submit(text,integer,text)') is null
  or to_regprocedure('public.pipstart_editorial_review(text,integer,text,boolean,text)') is null
  or to_regprocedure('public.pipstart_editorial_approve_single_person(text,integer,text,text)') is null
  or to_regprocedure('public.pipstart_editorial_revision(text,integer)') is null
  or to_regprocedure('pipstart_editorial_private.publication_sources_ok(text,jsonb)') is not null then
  raise exception 'Accepted editorial store and revision reads required; sources rule must not already exist'; end if;
end $$;

-- 1 to 50 sources, each exactly {title, url}: a non-blank title of at most 200 characters and an
-- https:// URL of at most 2048 characters without whitespace or control characters.
create function pipstart_editorial_private.publication_sources_ok(p_family text,p_body jsonb) returns boolean
language sql immutable security definer set search_path='' as $$
  select p_family<>'lesson' or coalesce((
    select jsonb_typeof(s)='array' and jsonb_array_length(s) between 1 and 50
      and not exists(select 1 from jsonb_array_elements(s) e where not (
        jsonb_typeof(e)='object'
        and (select array_agg(k order by k) from jsonb_object_keys(e) k)=array['title','url']
        and jsonb_typeof(e->'title')='string' and jsonb_typeof(e->'url')='string'
        and char_length(e->>'title') between 1 and 200 and btrim(e->>'title')<>''
        and char_length(e->>'url') between 9 and 2048
        and (e->>'url') ~ '^https://[^\s/?#@]+([/?#][^\s]*)?$'
        and (e->>'url') !~ '[[:cntrl:]]'))
    from (select p_body->'metadata'->'sources' s) x),false)
$$;
revoke all on function pipstart_editorial_private.publication_sources_ok(text,jsonb) from public,anon,authenticated,service_role;

create or replace function public.pipstart_editorial_submit(p_id text,p_revision integer,p_sha text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  i:=pipstart_editorial_private.locked_item(p_id);
  perform pipstart_editorial_private.require('content.submit',i.family,i.id);
  r:=pipstart_editorial_private.target_revision(i,p_revision,p_sha,array['draft']);
  if not pipstart_editorial_private.publication_sources_ok(i.family,r.body) then
    raise exception using errcode='22023',message='Add at least one HTTPS source before review or publication'; end if;
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
  update pipstart_editorial_private.revisions set state='approved' where item_id=i.id and revision_no=r.revision_no;
  insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(i.id,r.revision_no,r.body_sha256,u,'single_person',nullif(btrim(p_note),''));
  perform pipstart_editorial_private.log(u,'approve_single_person',i.id,r.revision_no,null);
  return pipstart_editorial_private.revision_result(i.id,r.revision_no);
end $$;
commit;
