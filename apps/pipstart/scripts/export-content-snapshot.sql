-- M22 MP05c-3: export the approved editorial store as a sealed content snapshot
-- (lib/content/source.ts, PIPSTART_CONTENT_SOURCE=snapshot). Operator-only and read-only.
-- Never used in Production, which reads code. Run with psql in unaligned tuples-only mode
-- (psql -X -qAt -f ...) and save the single output value as the snapshot file.
--
-- Each item is exported at its approved revision. Items that are trashed or on hold are left
-- out, and so is everything below them. Items are ordered depth-first in curriculum order:
-- learning path (forex, crypto), level, course, module, then item placement. Analysis posts
-- follow, by section (fundamental first) and newest first. The loader verifies every body
-- against the store's own body_sha256 and the whole list against itemsSha256.
--
-- MP07a (format 2): quizVersions also lists every approved version of every quiz that is not
-- trashed or on hold: for each version, its latest revision holding an imported, reviewer or Owner
-- decision for that exact body. Grading resolves an attempt's own version from it, so attempts
-- started on version N still finish after N+1, and while N+1 is being edited.
begin transaction read only;

with recursive approved as (
  select i.id, i.family, i.learning_path, i.parent_id, r.revision_no, r.body, r.body_sha256
  from pipstart_editorial_private.items i
  join lateral (
    select revision_no, body, body_sha256
    from pipstart_editorial_private.revisions
    where item_id = i.id and state = 'approved'
    order by revision_no desc
    limit 1
  ) r on true
  where i.trashed_at is null and i.hold_reason is null
),
tree as (
  select a.*,
    array[
      '0',
      case a.learning_path when 'forex' then '0' else '1' end,
      lpad(coalesce(substring(a.body->'metadata'->>'level' from '^level-(\d+)$'), '999999'), 6, '0'),
      lpad((a.body->'metadata'->'placement'->>'order'), 9, '0'),
      a.id
    ] as sort_key
  from approved a
  where a.family = 'course'
  union all
  select a.*,
    t.sort_key || array[lpad((a.body->'metadata'->'placement'->>'order'), 9, '0'), a.id]
  from approved a
  join tree t on a.parent_id = t.id
),
snapshot_items as (
  select id, family, learning_path, parent_id, revision_no, body, body_sha256,
    row_number() over (order by sort_key) as n
  from tree
  union all
  select id, family, learning_path, parent_id, revision_no, body, body_sha256,
    (select count(*) from tree) + row_number() over (
      order by (body->'metadata'->>'category') = 'technical',
        body->'metadata'->>'publishedAt' desc, id
    )
  from approved
  where family = 'analysis'
),
quiz_versions as (
  select distinct on (i.id, (r.body->'metadata'->>'version')::integer)
    i.id, (r.body->'metadata'->>'version')::integer as version, r.revision_no, r.body, r.body_sha256
  from pipstart_editorial_private.items i
  join pipstart_editorial_private.revisions r on r.item_id = i.id
  where i.family = 'quiz' and i.trashed_at is null and i.hold_reason is null
    and (r.body->'metadata'->>'version') ~ '^[1-9][0-9]{0,8}$'
    and exists (
      select 1 from pipstart_editorial_private.decisions d
      where d.item_id = r.item_id and d.revision_no = r.revision_no and d.body_sha256 = r.body_sha256
        and d.kind in ('imported', 'reviewed', 'single_person')
    )
  order by i.id, (r.body->'metadata'->>'version')::integer, r.revision_no desc
)
select json_build_object(
  'format', 'pipstart-content-snapshot',
  'version', 2,
  'exportedAt', to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'items', json_agg(
    json_build_object(
      'id', id,
      'family', family,
      'learningPath', learning_path,
      'parentId', parent_id,
      'revisionNo', revision_no,
      'state', 'approved',
      'bodySha256', body_sha256,
      'body', body
    ) order by n
  ),
  'itemsSha256', encode(sha256(convert_to(string_agg(
    id || ' ' || family || ' ' || revision_no || ' ' || body_sha256 || chr(10), '' order by n
  ), 'UTF8')), 'hex'),
  'quizVersions', (
    select coalesce(json_agg(json_build_object(
      'id', id, 'version', version, 'revisionNo', revision_no, 'bodySha256', body_sha256, 'body', body
    ) order by id, version), '[]'::json)
    from quiz_versions
  ),
  'quizVersionsSha256', (
    select encode(sha256(convert_to(coalesce(string_agg(
      id || ' ' || version || ' ' || revision_no || ' ' || body_sha256 || chr(10), '' order by id, version
    ), ''), 'UTF8')), 'hex')
    from quiz_versions
  )
)
from snapshot_items;

commit;
