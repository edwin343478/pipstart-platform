-- M22 MP06d1 editorial revision reads: staff may read an earlier revision of an item they can
-- read, and a bounded history of its revisions with their decisions, so editors can compare a
-- draft with the last approved or imported revision. Read-only: no table, state, grant or write
-- path changes. Same user-context authority as pipstart_editorial_item.
begin;
do $$ begin
 if to_regprocedure('public.pipstart_editorial_item(text)') is null
  or to_regclass('pipstart_editorial_private.imports') is null
  or to_regprocedure('public.pipstart_editorial_revision(text,integer)') is not null
  or to_regprocedure('public.pipstart_editorial_history(text,integer,integer)') is not null then
  raise exception 'Accepted editorial store and import required; revision reads must not already exist'; end if;
end $$;

create function pipstart_editorial_private.decisions_for(p_item text,p_revision integer,p_actor uuid) returns jsonb
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('kind',d.kind,'note',d.note,'by_me',d.actor_id=p_actor,'at',d.created_at) order by d.created_at),'[]'::jsonb)
  from pipstart_editorial_private.decisions d where d.item_id=p_item and d.revision_no=p_revision
$$;

-- One exact revision, body included. Volatile for the same reason as pipstart_editorial_item:
-- the staff actor check takes FOR SHARE locks that a read-only transaction refuses.
create function public.pipstart_editorial_revision(p_id text,p_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
begin
  select * into i from pipstart_editorial_private.items where id=p_id;
  if not found then raise exception using errcode='22023',message='Unknown content identity'; end if;
  perform pipstart_editorial_private.require('content.read',i.family,i.id);
  select * into r from pipstart_editorial_private.revisions where item_id=i.id and revision_no=p_revision;
  if not found then raise exception using errcode='22023',message='Unknown revision'; end if;
  return jsonb_build_object(
    'item_id',i.id,'latest_revision',i.latest_revision,
    'revision',jsonb_build_object('revision_no',r.revision_no,'schema_version',r.schema_version,'body',r.body,'body_sha256',r.body_sha256,'base_revision',r.base_revision,'author_is_me',r.author_id=u,'state',r.state,'created_at',r.created_at),
    'decisions',pipstart_editorial_private.decisions_for(i.id,r.revision_no,u),
    'imported',exists(select 1 from pipstart_editorial_private.imports m where m.item_id=i.id and m.revision_no=r.revision_no));
end $$;

-- Newest first, keyset on revision number: revisions below p_before (null: from the latest).
-- No bodies; the reason is the author's own short save reason.
create function public.pipstart_editorial_history(p_id text,p_before integer default null,p_limit integer default 20)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=pipstart_editorial_private.actor_required(); i pipstart_editorial_private.items;
begin
  if p_limit is null or p_limit not between 1 and 50 or (p_before is not null and p_before<2) then
    raise exception using errcode='22023',message='Invalid page'; end if;
  select * into i from pipstart_editorial_private.items where id=p_id;
  if not found then raise exception using errcode='22023',message='Unknown content identity'; end if;
  perform pipstart_editorial_private.require('content.read',i.family,i.id);
  return jsonb_build_object('item_id',i.id,'latest_revision',i.latest_revision,'revisions',coalesce((
    select jsonb_agg(jsonb_build_object('revision_no',x.revision_no,'body_sha256',x.body_sha256,'base_revision',x.base_revision,'author_is_me',x.author_id=u,'state',x.state,'reason',x.reason,'created_at',x.created_at,
      'decisions',pipstart_editorial_private.decisions_for(i.id,x.revision_no,u),
      'imported',exists(select 1 from pipstart_editorial_private.imports m where m.item_id=i.id and m.revision_no=x.revision_no)) order by x.revision_no desc)
    from (select * from pipstart_editorial_private.revisions r where r.item_id=i.id and (p_before is null or r.revision_no<p_before)
      order by r.revision_no desc limit p_limit) x),'[]'::jsonb));
end $$;

revoke all on function pipstart_editorial_private.decisions_for(text,integer,uuid) from public,anon,authenticated,service_role;
do $$ declare f text; begin
  foreach f in array array['public.pipstart_editorial_revision(text,integer)','public.pipstart_editorial_history(text,integer,integer)'] loop
    execute format('revoke all on function %s from public,anon,authenticated,service_role',f);
    execute format('grant execute on function %s to authenticated',f);
  end loop;
end $$;
commit;
