-- MP03 additive, Owner-capability read only. No seed, grant of staff membership,
-- control transition, existing-function replacement or account operation.
begin;
do $$ begin
  if to_regprocedure('pipstart_staff_private.require_capability(text,text,text)') is null
     or to_regprocedure('public.pipstart_staff_receipt(uuid,text,text,text,text,text)') is null
     or to_regclass('pipstart_staff_private.assignments') is null then
    raise exception 'Accepted MP02/MP03 staff prerequisites are required';
  end if;
end $$;

create function public.pipstart_staff_governance(
  p_target uuid,p_after_kind text default null,p_after_id text default null,p_limit integer default 25
) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  -- roles.manage is Owner-only in the accepted capability model. people.read
  -- and delegated roles.delegate do not authorize these governance details.
  perform pipstart_staff_private.require_capability('roles.manage');
  if p_target is null or p_limit is null or p_limit<1 or p_limit>50
     or (p_after_kind is null)<>(p_after_id is null)
     or (p_after_kind is not null and (p_after_kind not in ('course','module','lesson','quiz','partner','link','maintenance')
         or p_after_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$')) then
    raise exception using errcode='22023',message='Invalid governance page';
  end if;
  -- One statement supplies a coherent target/role/delegation/assignment snapshot.
  -- Explicit C collation makes the keyset order identical to ASCII DTO ordering.
  with page as (
    select a.resource_kind,a.resource_id from pipstart_staff_private.assignments a
    where a.user_id=p_target and (p_after_kind is null or
      (a.resource_kind collate pg_catalog."C",a.resource_id collate pg_catalog."C")>
      (p_after_kind collate pg_catalog."C",p_after_id collate pg_catalog."C"))
    order by a.resource_kind collate pg_catalog."C",a.resource_id collate pg_catalog."C" limit p_limit+1
  ), visible as (
    select * from page order by resource_kind collate pg_catalog."C",resource_id collate pg_catalog."C" limit p_limit
  )
  select jsonb_build_object(
    'target_id',p.user_id,'staff_active',m.active,
    'staff_roles',coalesce((select jsonb_agg(r.role_name order by r.role_name collate pg_catalog."C") from pipstart_staff_private.roles r where r.user_id=p.user_id),'[]'::jsonb),
    'delegations',coalesce((select jsonb_agg(d.capability order by d.capability collate pg_catalog."C") from pipstart_staff_private.delegations d where d.user_id=p.user_id),'[]'::jsonb),
    'assignments',coalesce((select jsonb_agg(to_jsonb(v) order by v.resource_kind collate pg_catalog."C",v.resource_id collate pg_catalog."C") from visible v),'[]'::jsonb),
    'next_after',case when (select count(*) from page)>p_limit then
      (select to_jsonb(v) from visible v order by resource_kind collate pg_catalog."C" desc,resource_id collate pg_catalog."C" desc limit 1) else null end
  ) into result
  from public.pipstart_profiles p left join pipstart_staff_private.members m on m.user_id=p.user_id where p.user_id=p_target;
  if result is null then raise exception using errcode='22023',message='Staff target unavailable'; end if;
  return result;
end;
$$;
revoke all on function public.pipstart_staff_governance(uuid,text,text,integer) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_governance(uuid,text,text,integer) to authenticated;
commit;
