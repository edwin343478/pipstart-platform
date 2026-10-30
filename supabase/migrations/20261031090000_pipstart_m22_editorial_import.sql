-- M22 MP05a editorial import: provenance for content imported from code, an `imported`
-- decision kind and an operator-only, idempotent import function. Imported content is
-- recorded as already approved (it is live today). Nothing public reads the store.
begin;
do $$ begin
 if to_regnamespace('pipstart_editorial_private') is null
  or to_regprocedure('pipstart_editorial_private.body_ok(text,jsonb)') is null
  or to_regclass('pipstart_editorial_private.imports') is not null then
  raise exception 'Accepted editorial store required; editorial import must not already exist'; end if;
end $$;

alter table pipstart_editorial_private.decisions drop constraint decisions_kind_check;
alter table pipstart_editorial_private.decisions add constraint decisions_kind_check
  check(kind in ('reviewed','single_person','changes_requested','imported'));
alter table pipstart_editorial_private.audit drop constraint audit_operation_check;
alter table pipstart_editorial_private.audit add constraint audit_operation_check
  check(operation in ('create','save','submit','review_approve','review_changes','approve_single_person','trash','restore','hold','release','policy','import'));

-- Where each imported revision came from. Append-only.
create table pipstart_editorial_private.imports(
  item_id text not null,
  revision_no integer not null,
  source_ref text not null check(char_length(source_ref) between 1 and 300 and source_ref ~ '^[a-z-]+:[a-z0-9@_:/.-]+$'),
  body_sha256 text not null check(body_sha256 ~ '^[0-9a-f]{64}$'),
  imported_at timestamptz not null default clock_timestamp(),
  primary key(item_id,revision_no),
  foreign key(item_id,revision_no) references pipstart_editorial_private.revisions(item_id,revision_no) on delete restrict
);
alter table pipstart_editorial_private.imports enable row level security;
revoke all on pipstart_editorial_private.imports from public,anon,authenticated,service_role;
create trigger pipstart_editorial_import_immutable before update or delete on pipstart_editorial_private.imports
  for each row execute function pipstart_staff_private.immutable_audit();

-- Operator-only (never granted to an API role). One item per call, parents first:
--   created   - new identity, revision 1 recorded as imported (approved)
--   unchanged - the latest revision is the imported one with this exact body
--   updated   - code changed and nobody edited the item in the store: new imported revision
--   conflict  - the item was edited in the store (or created there) since the last import:
--               nothing is written, so staff work is never overwritten
-- p_expected_sha is the body hash computed from code; any difference is refused.
create function pipstart_editorial_private.import_item(p_id text,p_family text,p_learning_path text,p_parent text,p_body jsonb,p_source_ref text,p_expected_sha text)
returns text language plpgsql set search_path='' as $$
declare o uuid; i pipstart_editorial_private.items; p pipstart_editorial_private.items; last_import pipstart_editorial_private.imports; latest pipstart_editorial_private.revisions; n integer; got text;
begin
  select m.user_id into o from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner';
  if (select count(*) from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner')<>1 then
    raise exception using errcode='55000',message='Import requires exactly one active Owner'; end if;
  if p_family is null or p_family not in ('course','module','lesson','quiz','analysis')
   or (p_family='analysis' and p_learning_path is not null)
   or (p_family<>'analysis' and (p_learning_path is null or p_learning_path not in ('forex','crypto')))
   or (p_family in ('course','analysis'))<>(p_parent is null) then
    raise exception using errcode='22023',message='Unsupported content family, path or parent'; end if;
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then raise exception using errcode='22023',message='Invalid content identity'; end if;
  if p_expected_sha is null or p_expected_sha !~ '^[0-9a-f]{64}$' then raise exception using errcode='22023',message='Expected body hash required'; end if;
  if not pipstart_editorial_private.body_ok(p_family,p_body) then raise exception using errcode='22023',message=format('Content body is not valid for this family: %s',p_id); end if;
  got:=encode(sha256(convert_to(p_body::text,'UTF8')),'hex');
  if got<>p_expected_sha then raise exception using errcode='22023',message=format('Body hash differs from the manifest for %s',p_id); end if;
  if p_parent is not null then
    select * into p from pipstart_editorial_private.items where id=p_parent;
    if not found or p.trashed_at is not null or p.learning_path is distinct from p_learning_path
     or not ((p_family='module' and p.family='course') or (p_family='lesson' and p.family='module') or (p_family='quiz' and p.family in ('course','module','lesson'))) then
      raise exception using errcode='22023',message=format('Parent does not accept %s',p_id); end if;
  end if;

  select * into i from pipstart_editorial_private.items where id=p_id for update;
  if not found then
    insert into pipstart_editorial_private.items(id,family,learning_path,parent_id,created_by,latest_revision) values(p_id,p_family,p_learning_path,p_parent,o,1);
    n:=1;
  else
    if (i.family,i.learning_path,i.parent_id) is distinct from (p_family,p_learning_path,p_parent) then
      raise exception using errcode='22023',message=format('Import identity differs from the store for %s',p_id); end if;
    select * into latest from pipstart_editorial_private.revisions where item_id=i.id and revision_no=i.latest_revision;
    select * into last_import from pipstart_editorial_private.imports where item_id=i.id order by revision_no desc limit 1;
    if last_import.item_id is null or last_import.revision_no<>i.latest_revision or latest.state<>'approved' or i.trashed_at is not null then
      return 'conflict'; end if;
    if latest.body_sha256=got then return 'unchanged'; end if;
    n:=i.latest_revision+1;
    perform pipstart_editorial_private.supersede_open(i.id);
  end if;
  insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
    values(p_id,n,1,p_body,repeat('0',64),n-1,o,left('Imported from '||p_source_ref,200),'approved');
  if n>1 then update pipstart_editorial_private.items set latest_revision=n where id=p_id; end if;
  insert into pipstart_editorial_private.decisions(item_id,revision_no,body_sha256,actor_id,kind,note) values(p_id,n,got,o,'imported',null);
  insert into pipstart_editorial_private.imports(item_id,revision_no,source_ref,body_sha256) values(p_id,n,p_source_ref,got);
  perform pipstart_editorial_private.log(o,'import',p_id,n,p_source_ref);
  return case when n=1 then 'created' else 'updated' end;
end $$;

revoke all on function pipstart_editorial_private.import_item(text,text,text,text,jsonb,text,text) from public,anon,authenticated,service_role;
commit;
