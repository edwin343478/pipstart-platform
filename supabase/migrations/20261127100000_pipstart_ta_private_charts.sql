-- TA-b: chart originals stay private. The app serves only charts referenced
-- by a published revision; Owner draft reads and uploads go through staff routes.
begin;
do $$
begin
  if to_regclass('storage.buckets') is null then
    return; -- The plain PostgreSQL CI service has no Supabase Storage schema.
  end if;
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('analysis-private-charts', 'analysis-private-charts', false, 4194304,
    array['image/png', 'image/jpeg', 'image/webp']);

  -- Future permissive Storage policies cannot grant direct API access here.
  create policy analysis_private_charts_deny_client
    on storage.objects as restrictive for all to anon, authenticated
    using (bucket_id <> 'analysis-private-charts')
    with check (bucket_id <> 'analysis-private-charts');
end
$$;
commit;
