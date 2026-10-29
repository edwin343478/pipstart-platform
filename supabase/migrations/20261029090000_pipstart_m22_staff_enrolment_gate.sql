-- Staff-only TOTP enrolment and step-up (D03): reveals only whether the caller
-- is an active staff member. No grant, bootstrap, control change or activation.
begin;
do $$ begin
 if to_regclass('pipstart_staff_private.members') is null
 or to_regprocedure('public.pipstart_staff_maintenance_take(uuid,uuid,text,text)') is null then
 raise exception 'Accepted staff maintenance schema required'; end if;
end $$;
-- Works at AAL1 and while staff control is paused, so a bootstrapped Owner can
-- enrol before enablement. It never reveals another user's membership.
create function public.pipstart_staff_enrolment_allowed()
returns boolean language plpgsql stable security definer set search_path='' as $$
begin
 if current_setting('role',true) is distinct from 'authenticated'
 or auth.jwt()->>'role' is distinct from 'authenticated' or auth.uid() is null then return false; end if;
 return exists(select 1 from pipstart_staff_private.members m join auth.users a on a.id=m.user_id
  where m.user_id=auth.uid() and m.active and a.deleted_at is null
  and (a.banned_until is null or a.banned_until<=clock_timestamp()));
end $$;
revoke all on function public.pipstart_staff_enrolment_allowed() from public,anon,authenticated,service_role;
grant execute on function public.pipstart_staff_enrolment_allowed() to authenticated;
commit;
