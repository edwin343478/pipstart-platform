-- Generated fixtures in isolated DB ONLY. Roll back all assertions/fixtures.
begin;
do $$
declare u uuid:='00000000-0000-4000-8000-000000000081';j uuid;s jsonb;changed boolean:=false;r text;
begin
 insert into auth.users(id,email,email_confirmed_at) values(u,'Address+tag@Example.test',now());
 if public.pipstart_optional_email_dispatch_state(u)->>'status'<>'active' then raise exception 'initial active';end if;
 if public.pipstart_optional_address_is_blocked('Address+tag@Example.test') then raise exception 'initial block';end if;
 if public.pipstart_optional_address_hash(' Address+tag@Example.test ')<>public.pipstart_optional_address_hash('address+tag@example.test') then raise exception 'canonicalization';end if;
 if public.pipstart_optional_address_hash('a.b@example.test')=public.pipstart_optional_address_hash('ab@example.test') or public.pipstart_optional_address_hash('a+b@example.test')=public.pipstart_optional_address_hash('a@example.test') then raise exception 'unsafe folding';end if;
 if not public.pipstart_optional_address_is_blocked(null) or not public.pipstart_optional_address_is_blocked('bad') or not public.pipstart_optional_address_is_blocked(E'a@b.test\n') then raise exception 'invalid not blocked';end if;
 if public.pipstart_optional_address_hash(chr(8490)||'@b.test') is not null then raise exception 'Unicode ASCII-fold bypass';end if;
 s:=public.pipstart_enqueue_optional_email(u,'before-block','learning_lesson','Generated','<p>Generated</p>','Generated');j:=(s->>'jobId')::uuid;
 if j is null then raise exception 'initial enqueue';end if;
 r:=public.pipstart_record_optional_address_block('generated-event','generated-provider','address+tag@example.test','hard_bounce','2026-10-21T10:00:00Z');
 if r<>'recorded' or not public.pipstart_optional_address_is_blocked(' ADDRESS+tag@EXAMPLE.TEST ') then raise exception 'record block';end if;
 if public.pipstart_optional_email_dispatch_state(u)<>'{"status":"inactive"}'::jsonb then raise exception 'current address gate';end if;
 -- Existing consumer's fresh-state read sees blocked; preexisting job is not deleted/requeued here.
 if (select status from public.pipstart_optional_email_jobs where id=j)<>'pending' then raise exception 'existing job changed';end if;
 if public.pipstart_enqueue_optional_email(u,'after-block','partner_offer','Generated','<p>Generated</p>','Generated')->>'reason'<>'account_inactive' then raise exception 'enqueue bypass';end if;
 if not (select educational_emails and marketing_emails and learning_frequency='all' from public.pipstart_email_preferences where user_id=u) then raise exception 'preferences mutated';end if;
 if public.pipstart_record_optional_address_block('generated-event','generated-provider','ADDRESS+tag@example.test','hard_bounce','2026-10-21T10:00:00Z')<>'duplicate' then raise exception 'replay';end if;
 begin
  perform public.pipstart_record_optional_address_block('generated-event','changed-provider','other@example.test','complaint','2026-10-21T10:00:00Z');
  raise exception using errcode='ZX001',message='conflict accepted';
 exception when sqlstate 'P0001' then changed:=true;
 end;
 if not changed or public.pipstart_optional_address_is_blocked('other@example.test') then raise exception 'conflicting replay changed state';end if;
 perform public.pipstart_record_optional_address_block('generated-late','generated-provider','address+tag@example.test','complaint','2026-10-21T12:00:00Z');
 perform public.pipstart_record_optional_address_block('generated-early','generated-provider','address+tag@example.test','provider_suppressed','2026-10-20T10:00:00Z');
 if not exists(select 1 from public.pipstart_optional_address_blocks where address_hash=public.pipstart_optional_address_hash('address+tag@example.test') and reason='complaint' and first_occurred_at='2026-10-20T10:00:00Z' and last_occurred_at='2026-10-21T12:00:00Z') then raise exception 'out of order';end if;
 update auth.users set email='fresh@example.test' where id=u;
 if public.pipstart_optional_email_dispatch_state(u)->>'status'<>'active' then raise exception 'changed address inherits wrong block';end if;
 update auth.users set email='address+tag@example.test' where id=u;
 if public.pipstart_optional_email_dispatch_state(u)->>'status'<>'inactive' then raise exception 'returned address bypass';end if;
 delete from auth.users where id=u;
 if not public.pipstart_optional_address_is_blocked('address+tag@example.test') then raise exception 'account deletion cleared block';end if;
 insert into auth.users(id,email,email_confirmed_at) values(u,'address+tag@example.test',now());
 if public.pipstart_optional_email_dispatch_state(u)->>'status'<>'inactive' then raise exception 're-registration bypass';end if;
 if (select count(*) from public.pipstart_optional_address_events)<>3 or (select count(*) from public.pipstart_optional_address_blocks)<>1 then raise exception 'ledger cardinality';end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name in ('pipstart_optional_address_blocks','pipstart_optional_address_events') and column_name in ('email','address','payload','subject','html')) then raise exception 'raw data storage';end if;
end $$;
do $$
declare role_name text;table_name text;signature text;
begin
 foreach table_name in array array['pipstart_optional_address_blocks','pipstart_optional_address_events'] loop
  if not (select relrowsecurity from pg_class where oid=('public.'||table_name)::regclass) then raise exception 'RLS';end if;
  foreach role_name in array array['anon','authenticated','service_role'] loop
   if has_table_privilege(role_name,'public.'||table_name,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then raise exception 'direct table grants';end if;
  end loop;
 end loop;
 foreach signature in array array['public.pipstart_record_optional_address_block(text,text,text,text,timestamptz)','public.pipstart_optional_address_is_blocked(text)','public.pipstart_optional_email_dispatch_state(uuid)'] loop
  if not has_function_privilege('service_role',signature,'EXECUTE') or has_function_privilege('anon',signature,'EXECUTE') or has_function_privilege('authenticated',signature,'EXECUTE') then raise exception 'RPC grants';end if;
  if not exists(select 1 from pg_proc where oid=signature::regprocedure and prosecdef and proconfig @> array['search_path=""']) then raise exception 'definer path';end if;
 end loop;
 if has_function_privilege('service_role','public.pipstart_optional_address_hash(text)','EXECUTE') then raise exception 'normalizer exposed';end if;
end $$;
rollback;
