-- TA-a (27 November 2026): trade ideas on technical analysis posts.
-- 1. An analysis body may carry an optional `trade` object (instrument, timeframe, direction, entry,
--    stop loss, take profit, chart image and status), on technical posts only. The structural rule is
--    `analysis_trade_ok`, identical rule for rule to tradeIdeaProblem in apps/pipstart/src/lib/content/
--    trade-idea.ts. Every other family rule in body_ok is unchanged (copied from the partner store).
-- 2. A public storage bucket for chart images. This migration adds NO storage.objects policies, so
--    nobody can upload, change or delete a chart through the API yet; staff uploads arrive with TA-b.
--    Public buckets serve objects by their public URL without a select policy.
-- Apply before enabling authoring or public delivery. Re-running is refused by `create function` on purpose.
begin;

create function pipstart_editorial_private.analysis_trade_ok(p_trade jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare
  s jsonb;
  c jsonb;
  v_entry numeric;
  v_stop numeric;
  v_target numeric;
  v_rule text;
  v_state text;
  v_outcome text;
begin
  if coalesce(jsonb_typeof(p_trade)<>'object',true) then return false; end if;
  if coalesce(jsonb_typeof(p_trade->'instrument')<>'string'
   or not (p_trade->>'instrument' ~ '^[A-Z0-9][A-Z0-9/.]{0,19}$'),true) then return false; end if;
  if coalesce(jsonb_typeof(p_trade->'timeframe')<>'string'
   or p_trade->>'timeframe' not in ('m1','m5','m15','m30','h1','h4','d1','w1'),true) then return false; end if;
  if coalesce(jsonb_typeof(p_trade->'direction')<>'string'
   or p_trade->>'direction' not in ('buy','sell','buy-limit','sell-limit','buy-stop','sell-stop'),true) then return false; end if;
  if coalesce(jsonb_typeof(p_trade->'entry')<>'string' or jsonb_typeof(p_trade->'stopLoss')<>'string'
   or jsonb_typeof(p_trade->'takeProfit')<>'string'
   or not (p_trade->>'entry' ~ '^[0-9]{1,7}(\.[0-9]{1,6})?$')
   or not (p_trade->>'stopLoss' ~ '^[0-9]{1,7}(\.[0-9]{1,6})?$')
   or not (p_trade->>'takeProfit' ~ '^[0-9]{1,7}(\.[0-9]{1,6})?$'),true) then return false; end if;
  v_entry := (p_trade->>'entry')::numeric;
  v_stop := (p_trade->>'stopLoss')::numeric;
  v_target := (p_trade->>'takeProfit')::numeric;
  if left(p_trade->>'direction',3)='buy' then
    if not (v_stop<v_entry and v_entry<v_target) then return false; end if;
  elsif not (v_target<v_entry and v_entry<v_stop) then return false;
  end if;

  c := p_trade->'chart';
  if coalesce(jsonb_typeof(c)<>'object'
   or jsonb_typeof(c->'path')<>'string' or char_length(c->>'path')>200
   or not (c->>'path' ~ '^[a-z0-9]+([-_/][a-z0-9]+)*\.(png|jpg|webp)$')
   or (c ? 'thumbnailPath' and (jsonb_typeof(c->'thumbnailPath')<>'string'
     or char_length(c->>'thumbnailPath')>200
     or not (c->>'thumbnailPath' ~ '^[a-z0-9]+([-_/][a-z0-9]+)*\.(png|jpg|webp)$')))
   or (c ? 'credit' and (jsonb_typeof(c->'credit')<>'string'
     or char_length(btrim(c->>'credit'))<1 or char_length(c->>'credit')>200))
   or jsonb_typeof(c->'alt')<>'string' or char_length(btrim(c->>'alt'))<1 or char_length(c->>'alt')>300
   or jsonb_typeof(c->'width')<>'number' or jsonb_typeof(c->'height')<>'number'
   or (c->>'width')::numeric % 1<>0 or (c->>'height')::numeric % 1<>0
   or (c->>'width')::numeric not between 1 and 10000 or (c->>'height')::numeric not between 1 and 10000,true) then
    return false;
  end if;

  s := p_trade->'status';
  if coalesce(jsonb_typeof(s)<>'object' or jsonb_typeof(s->'reason')<>'string' or jsonb_typeof(s->'state')<>'string',true) then
    return false;
  end if;
  v_rule := s->>'reason';
  v_state := case
    when v_rule in ('pending','triggered','breakeven-stop','partial-profit','active-other') then 'active'
    when v_rule in ('take-profit','stop-loss','breakeven','closed-early-profit','closed-early-loss',
                    'missed-entry','conditions-changed','expired','inactive-other') then 'inactive'
  end;
  if v_state is null or s->>'state'<>v_state then return false; end if;
  if v_rule in ('active-other','inactive-other') then
    if coalesce(jsonb_typeof(s->'note')<>'string' or char_length(btrim(s->>'note'))<1
     or char_length(s->>'note')>140,true) then return false; end if;
  elsif s ? 'note' then return false;
  end if;
  if v_rule='inactive-other' then
    v_outcome := case when jsonb_typeof(s->'outcome')='string' then s->>'outcome' end;
    if coalesce(v_outcome not in ('profit','loss','breakeven','void'),true) then return false; end if;
  elsif s ? 'outcome' then return false;
  end if;
  if coalesce(jsonb_typeof(s->'updatedAt')<>'string'
   or not (s->>'updatedAt' ~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{3})?Z$'),true) then
    return false;
  end if;
  -- A calendar-impossible instant (30 February) fails the cast and lands in the handler below.
  perform (s->>'updatedAt')::timestamptz;
  return true;
-- Structural checks can meet a scalar where an object is expected; any such error means "not valid".
exception when others then return false;
end $$;

-- Unchanged from 20261116090000 except the analysis branch, which accepts the optional trade idea.
create or replace function pipstart_editorial_private.body_ok(p_family text,p_body jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare b jsonb;
begin
  if coalesce(p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>262144
   or jsonb_typeof(p_body->'metadata')<>'object'
   or jsonb_typeof(p_body->'metadata'->'title')<>'string'
   or char_length(btrim(p_body->'metadata'->>'title')) not between 1 and 200,true) then return false; end if;
  if p_family='lesson' then
    if coalesce(jsonb_typeof(p_body->'blocks')<>'array' or jsonb_array_length(p_body->'blocks') not between 1 and 500,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'blocks') loop
      if coalesce(jsonb_typeof(b)<>'object' or coalesce(b->>'type','') not in (
        'heading','paragraph','learningLink','section','references','riskStatement','list','quote','reflection',
        'takeaway','definition','example','warning','keyPoint','formula','exercise','practice','diagram',
        'comparisonTable','riskNotice','affiliateDisclosure','quizPreview'),true) then return false; end if;
    end loop;
    if p_body ? 'sections' and jsonb_typeof(p_body->'sections')<>'array' then return false; end if;
  elsif p_family='analysis' then
    -- Exactly one section per post: a single string, never a list or both.
    if coalesce(jsonb_typeof(p_body->'metadata'->'category')<>'string' or p_body->'metadata'->>'category' not in ('fundamental','technical')
     or jsonb_typeof(p_body->'metadata'->'excerpt')<>'string' or char_length(btrim(p_body->'metadata'->>'excerpt')) not between 1 and 300
     or jsonb_typeof(p_body->'paragraphs')<>'array' or jsonb_array_length(p_body->'paragraphs') not between 1 and 200,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'paragraphs') loop
      if coalesce(jsonb_typeof(b)<>'string' or btrim(b#>>'{}')='',true) then return false; end if;
    end loop;
    -- TA-a: an optional trade idea, on technical posts only.
    if p_body ? 'trade' and (p_body->'metadata'->>'category'<>'technical'
     or not pipstart_editorial_private.analysis_trade_ok(p_body->'trade')) then return false; end if;
  elsif p_family='quiz' then
    if coalesce(jsonb_typeof(p_body->'questions')<>'array' or jsonb_array_length(p_body->'questions') not between 1 and 100,true) then return false; end if;
    for b in select value from jsonb_array_elements(p_body->'questions') loop
      if coalesce(jsonb_typeof(b)<>'object' or jsonb_typeof(b->'choices')<>'array' or jsonb_typeof(b->'correctChoiceIds')<>'array'
       or jsonb_array_length(b->'choices') not between 2 and 10 or jsonb_array_length(b->'correctChoiceIds')<1,true) then return false; end if;
    end loop;
  end if;
  if p_family in ('partner','link') and not pipstart_editorial_private.partner_body_ok(p_family,p_body) then return false; end if;
  return true;
end $$;

-- Private helper, as every function in this schema (body_ok keeps its privileges on replace).
revoke all on function pipstart_editorial_private.analysis_trade_ok(jsonb) from public,anon,authenticated,service_role;

-- Chart images: public read by URL, 5 MB, PNG/JPEG/WebP only. No upload policy (TA-b adds staff uploads).
-- Supabase always has storage.buckets; the plain-Postgres CI acceptance database does not, so it skips this.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('analysis-charts', 'analysis-charts', true, 5242880, array['image/png','image/jpeg','image/webp']);
  end if;
end $$;

commit;
