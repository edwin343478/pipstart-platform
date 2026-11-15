-- M22 MP09b partner snapshot: published partners and links, with the Owner policy versions each
-- generation froze (risk notice, approved hosts), join the sealed public snapshot under "partners".
-- The key is added only when a generation publishes partner content: every earlier generation's
-- snapshot text, and therefore its seal, is byte-for-byte unchanged.
begin;
do $$ begin
 if to_regclass('pipstart_editorial_private.generation_partner_policies') is null
  or to_regprocedure('pipstart_editorial_private.partner_snapshot(bigint)') is not null then
  raise exception 'Accepted MP09a partner store required; partner snapshot must not already exist'; end if;
end $$;

-- Null when the generation publishes no partner content.
create function pipstart_editorial_private.partner_snapshot(p_generation bigint) returns jsonb
language sql stable security definer set search_path='' as $$
  select case when count(*)=0 then null else jsonb_build_object('partners',jsonb_agg(jsonb_build_object(
    'id',e.item_id,'revisionNo',e.revision_no,'bodySha256',e.body_sha256,'body',r.body,
    'riskNotice',pp.risk_notice,'policyVersion',gp.policy_version,
    'links',(select coalesce(jsonb_agg(jsonb_build_object('id',l.item_id,'revisionNo',l.revision_no,'bodySha256',l.body_sha256,'body',lr.body,
        'allowedHosts',to_jsonb(lp.allowed_hosts),'policyVersion',lg.policy_version) order by l.item_id),'[]'::jsonb)
      from pipstart_editorial_private.generation_entries l
      join pipstart_editorial_private.revisions lr on lr.item_id=l.item_id and lr.revision_no=l.revision_no
      join pipstart_editorial_private.generation_partner_policies lg on lg.generation=l.generation and lg.item_id=l.item_id
      join pipstart_editorial_private.partner_policies lp on lp.item_id=lg.item_id and lp.version=lg.policy_version
      where l.generation=p_generation and l.family='link' and l.parent_id=e.item_id)) order by e.item_id)) end
  from pipstart_editorial_private.generation_entries e
  join pipstart_editorial_private.revisions r on r.item_id=e.item_id and r.revision_no=e.revision_no
  join pipstart_editorial_private.generation_partner_policies gp on gp.generation=e.generation and gp.item_id=e.item_id
  join pipstart_editorial_private.partner_policies pp on pp.item_id=gp.item_id and pp.version=gp.policy_version
  where e.generation=p_generation and e.family='partner'
$$;

-- Unchanged except the final line: the partners section is appended when present.
create or replace function pipstart_editorial_private.generation_snapshot(p_generation bigint) returns jsonb
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
  ||coalesce(pipstart_editorial_private.partner_snapshot(p_generation),'{}'::jsonb)
  from snapshot_items
$$;

revoke all on function pipstart_editorial_private.partner_snapshot(bigint) from public,anon,authenticated,service_role;
revoke all on function pipstart_editorial_private.generation_snapshot(bigint) from public,anon,authenticated,service_role;
commit;
