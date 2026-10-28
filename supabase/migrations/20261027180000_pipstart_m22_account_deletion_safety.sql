-- MP03 own-account eligibility only. No retirement, deletion or activation.
begin;
do $$ begin
 if to_regclass('pipstart_staff_private.members') is null or not exists(select 1 from information_schema.columns where table_schema='auth' and table_name='sessions' and column_name='not_after' and data_type='timestamp with time zone') then
  raise exception 'Accepted staff core and compatible Auth sessions required'; end if;
end $$;
-- AAL1 is sufficient for this own-account read. Password reauthentication is
-- still required by the server action. No target parameter or service-key grant.
create function public.pipstart_account_deletion_eligibility()
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; s uuid;
begin
 if current_setting('role',true) is distinct from 'authenticated'
  or auth.jwt()->>'role' is distinct from 'authenticated'
  or coalesce(auth.jwt()->>'aal','') not in ('aal1','aal2') then
  raise exception using errcode='42501',message='Account check not authorized'; end if;
 u:=auth.uid();
 begin s:=(auth.jwt()->>'session_id')::uuid;
 exception when invalid_text_representation then
  raise exception using errcode='42501',message='Account check not authorized'; end;
 if u is null or s is null or not exists(select 1 from auth.sessions a where a.id=s and a.user_id=u
  and (a.not_after is null or a.not_after>clock_timestamp())) then
  raise exception using errcode='42501',message='Account check not authorized'; end if;
 return jsonb_build_object('user_id',u,'status',case when exists(
  select 1 from pipstart_staff_private.members where user_id=u
 ) then 'staff_retirement_required' else 'eligible' end);
end;
$$;
revoke all on function public.pipstart_account_deletion_eligibility() from public,anon,authenticated,service_role;
grant execute on function public.pipstart_account_deletion_eligibility() to authenticated;
-- Existing members -> auth.users RESTRICT FK remains the final race guard.
commit;
