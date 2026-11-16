-- M22 MP10f audit filters (owner decision D7 of 16 November 2026). Two read-only, minimized,
-- cursor-paged views for staff holding audit.read (the Owner, or an Administrator with the explicit
-- delegation): the staff-governance audit filtered by action, actor, resource and time range (the
-- same columns as pipstart_staff_audit_page, which stays unchanged), and the editorial audit, which
-- records content, publication, partner and maintenance changes. The editorial view returns time,
-- actor, operation, item and revision, plus for maintenance rows only the action word; free-text
-- reasons and details are never returned. No table is changed except one ordering index.
begin;
do $$ begin
 if to_regprocedure('public.pipstart_maintenance_worklist(text,text,text,text,integer)') is null
  or to_regprocedure('public.pipstart_staff_audit_page(timestamptz,uuid,integer)') is null
  or to_regprocedure('public.pipstart_content_audit_page(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz)') is not null then
  raise exception 'Accepted MP10a maintenance store required; audit filters must not already exist'; end if;
end $$;

create index pipstart_editorial_audit_time_idx on pipstart_editorial_private.audit(created_at desc,id desc);

-- Shared argument rules: a complete cursor or none, 1 to 101 rows, a time range with from < to.
create function pipstart_staff_private.audit_page_ok(p_before timestamptz,p_before_id uuid,p_limit integer,p_from timestamptz,p_to timestamptz)
returns boolean language sql immutable set search_path='' as $$
  select p_limit is not null and p_limit between 1 and 101 and (p_before is null)=(p_before_id is null)
    and (p_from is null or p_to is null or p_from<p_to)
$$;

create function public.pipstart_staff_audit_page_filtered(p_before timestamptz,p_before_id uuid,p_limit integer,
  p_operation text,p_actor uuid,p_resource text,p_from timestamptz,p_to timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  perform pipstart_staff_private.require_capability('audit.read');
  if not pipstart_staff_private.audit_page_ok(p_before,p_before_id,p_limit,p_from,p_to)
   or (p_operation is not null and p_operation not in ('bootstrap','control','grant_role','revoke_role','grant_delegation','revoke_delegation','assign','unassign','suspend','resume'))
   or (p_resource is not null and p_resource !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$') then
    raise exception using errcode='22023',message='Invalid audit page'; end if;
  select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc,a.id desc),'[]'::jsonb) into result from (
    select id,created_at,actor_id,request_id,operation,target_id,value,resource_kind,resource_id,reason_code,outcome
    from pipstart_staff_private.audit
    where (p_before is null or (created_at,id)<(p_before,p_before_id))
      and (p_operation is null or operation=p_operation)
      and (p_actor is null or actor_id=p_actor)
      and (p_resource is null or resource_id=p_resource)
      and (p_from is null or created_at>=p_from) and (p_to is null or created_at<p_to)
    order by created_at desc,id desc limit p_limit
  ) a;
  return result;
end $$;

create function public.pipstart_content_audit_page(p_before timestamptz,p_before_id uuid,p_limit integer,
  p_operation text,p_actor uuid,p_item text,p_from timestamptz,p_to timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  perform pipstart_staff_private.require_capability('audit.read');
  if not pipstart_staff_private.audit_page_ok(p_before,p_before_id,p_limit,p_from,p_to)
   or (p_operation is not null and p_operation not in ('create','save','submit','review_approve','review_changes','approve_single_person','trash','restore','hold','release','policy','import',
      'publication_baseline','publish','withdraw','publication_restore','refresh','maintenance'))
   or (p_item is not null and p_item !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$') then
    raise exception using errcode='22023',message='Invalid audit page'; end if;
  select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc,a.id desc),'[]'::jsonb) into result from (
    select id,created_at,actor_id,operation,item_id,revision_no,
      case when operation='maintenance' and split_part(split_part(detail,':',1),' ',1) in
        ('assign','reassign','unassign','acknowledge','reschedule','result','interval','allowlist')
        then split_part(split_part(detail,':',1),' ',1) end as action
    from pipstart_editorial_private.audit
    where (p_before is null or (created_at,id)<(p_before,p_before_id))
      and (p_operation is null or operation=p_operation)
      and (p_actor is null or actor_id=p_actor)
      and (p_item is null or item_id=p_item)
      and (p_from is null or created_at>=p_from) and (p_to is null or created_at<p_to)
    order by created_at desc,id desc limit p_limit
  ) a;
  return result;
end $$;

revoke all on function pipstart_staff_private.audit_page_ok(timestamptz,uuid,integer,timestamptz,timestamptz) from public,anon,authenticated,service_role;
revoke all on function public.pipstart_staff_audit_page_filtered(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz),
  public.pipstart_content_audit_page(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_audit_page_filtered(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz),
  public.pipstart_content_audit_page(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz) to authenticated;
commit;
