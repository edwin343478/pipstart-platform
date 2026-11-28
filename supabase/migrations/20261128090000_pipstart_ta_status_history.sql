-- TA-c (28 November 2026): a trade idea may carry its status history.
-- `trade.history` is optional: 1 to 50 earlier statuses, oldest first, each following the same rule
-- as the current status (reason, matching state, note and outcome rules) with its time in `at`.
-- The status rule moves into `analysis_trade_status_ok`, shared by the current status (`updatedAt`)
-- and every history entry (`at`). Everything else in `analysis_trade_ok` is unchanged from
-- 20261127090000. Identical rule for rule to tradeIdeaProblem in apps/pipstart/src/lib/content/
-- trade-idea.ts. No table, grant or bucket change. Apply after 20261127090000 and before TA-c code.
begin;

create function pipstart_editorial_private.analysis_trade_status_ok(p_status jsonb,p_time_key text) returns boolean
language plpgsql immutable set search_path='' as $$
declare
  v_rule text;
  v_state text;
  v_outcome text;
begin
  if p_time_key is null or p_time_key not in ('updatedAt','at') then return false; end if;
  if coalesce(jsonb_typeof(p_status)<>'object' or jsonb_typeof(p_status->'reason')<>'string'
   or jsonb_typeof(p_status->'state')<>'string',true) then return false; end if;
  v_rule := p_status->>'reason';
  v_state := case
    when v_rule in ('pending','triggered','breakeven-stop','partial-profit','active-other') then 'active'
    when v_rule in ('take-profit','stop-loss','breakeven','closed-early-profit','closed-early-loss',
                    'missed-entry','conditions-changed','expired','inactive-other') then 'inactive'
  end;
  if v_state is null or p_status->>'state'<>v_state then return false; end if;
  if v_rule in ('active-other','inactive-other') then
    if coalesce(jsonb_typeof(p_status->'note')<>'string' or char_length(btrim(p_status->>'note'))<1
     or char_length(p_status->>'note')>140,true) then return false; end if;
  elsif p_status ? 'note' then return false;
  end if;
  if v_rule='inactive-other' then
    v_outcome := case when jsonb_typeof(p_status->'outcome')='string' then p_status->>'outcome' end;
    if coalesce(v_outcome not in ('profit','loss','breakeven','void'),true) then return false; end if;
  elsif p_status ? 'outcome' then return false;
  end if;
  if coalesce(jsonb_typeof(p_status->p_time_key)<>'string'
   or not (p_status->>p_time_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{3})?Z$'),true) then
    return false;
  end if;
  -- A calendar-impossible instant (30 February) fails the cast and lands in the handler below.
  perform (p_status->>p_time_key)::timestamptz;
  return true;
exception when others then return false;
end $$;

create or replace function pipstart_editorial_private.analysis_trade_ok(p_trade jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare
  c jsonb;
  h jsonb;
  v_entry numeric;
  v_stop numeric;
  v_target numeric;
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
   or jsonb_typeof(c->'alt')<>'string' or char_length(btrim(c->>'alt'))<1 or char_length(c->>'alt')>300
   or jsonb_typeof(c->'width')<>'number' or jsonb_typeof(c->'height')<>'number'
   or (c->>'width')::numeric % 1<>0 or (c->>'height')::numeric % 1<>0
   or (c->>'width')::numeric not between 1 and 10000 or (c->>'height')::numeric not between 1 and 10000,true) then
    return false;
  end if;

  if not pipstart_editorial_private.analysis_trade_status_ok(p_trade->'status','updatedAt') then return false; end if;
  -- TA-c: optional history of 1 to 50 earlier statuses.
  if p_trade ? 'history' then
    if coalesce(jsonb_typeof(p_trade->'history')<>'array'
     or jsonb_array_length(p_trade->'history') not between 1 and 50,true) then return false; end if;
    for h in select value from jsonb_array_elements(p_trade->'history') loop
      if not pipstart_editorial_private.analysis_trade_status_ok(h,'at') then return false; end if;
    end loop;
  end if;
  return true;
-- Structural checks can meet a scalar where an object is expected; any such error means "not valid".
exception when others then return false;
end $$;

-- Private helpers, as every function in this schema.
revoke all on function pipstart_editorial_private.analysis_trade_status_ok(jsonb,text) from public,anon,authenticated,service_role;

commit;
