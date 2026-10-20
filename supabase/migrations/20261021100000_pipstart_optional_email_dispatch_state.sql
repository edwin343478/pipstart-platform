-- Read-only service RPC for future optional dispatch. No queue, sender or campaign.
begin;
create function public.pipstart_optional_email_dispatch_state(p_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
  select jsonb_build_object('status','active','email',u.email,
    'learning',p.educational_emails,'partner',p.marketing_emails,'frequency',p.learning_frequency)
    into result from auth.users u join public.pipstart_email_preferences p on p.user_id=u.id
    where u.id=p_user_id and u.email is not null and btrim(u.email)<>''
      and u.email_confirmed_at is not null and u.deleted_at is null
      and (u.banned_until is null or u.banned_until<=now());
  return coalesce(result,jsonb_build_object('status','inactive'));
end $$;
revoke all on function public.pipstart_optional_email_dispatch_state(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_optional_email_dispatch_state(uuid) to service_role;
commit;
