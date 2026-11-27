-- Disposable SQL acceptance only (TA-a). The same cases as lib/content/trade-idea.test.ts, against
-- pipstart_editorial_private.body_ok, so the store refuses exactly what the server refuses. Rolls back.
begin;
create function pg_temp.ta_ok(v boolean,label text) returns void language plpgsql as $$begin if v is distinct from true then raise exception 'Trade idea assertion: %',label;end if;end$$;
create temp table ta_base(body jsonb);
insert into ta_base values($fx${"metadata":{"title":"EUR/USD retest","category":"technical","excerpt":"A retest."},"paragraphs":["Why this setup."],
 "trade":{"instrument":"EUR/USD","timeframe":"h4","direction":"buy-limit","entry":"1.0845","stopLoss":"1.0810","takeProfit":"1.0920",
  "chart":{"path":"eurusd-4h-2026-11-27.png","alt":"EUR/USD 4-hour chart with the 1.0845 support zone","width":1600,"height":900},
  "status":{"state":"active","reason":"pending","updatedAt":"2026-11-27T14:30:00.000Z"}}}$fx$);
create function pg_temp.ta_with(path text[],v jsonb) returns jsonb language sql as $$select jsonb_set(body,path,v) from ta_base$$;
create function pg_temp.ta_body_ok(b jsonb) returns boolean language sql as $$select pipstart_editorial_private.body_ok('analysis',b)$$;

select pg_temp.ta_ok(not has_function_privilege(r,'pipstart_editorial_private.analysis_trade_ok(jsonb)','execute'),'private helper denied to '||r)
  from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.ta_ok(pg_temp.ta_body_ok(body),'complete trade idea accepted') from ta_base;
select pg_temp.ta_ok(pg_temp.ta_body_ok(body-'trade'),'post without trade unchanged') from ta_base;
select pg_temp.ta_ok(pg_temp.ta_body_ok(pg_temp.ta_with('{metadata,category}','"fundamental"')-'trade'),'fundamental post unchanged');
select pg_temp.ta_ok(not pg_temp.ta_body_ok(pg_temp.ta_with('{metadata,category}','"fundamental"')),'trade only on technical posts');
select pg_temp.ta_ok(not pg_temp.ta_body_ok(pg_temp.ta_with('{trade}','"x"')),'trade must be an object');

select pg_temp.ta_ok(not pg_temp.ta_body_ok(pg_temp.ta_with(p,v)),label) from (values
  ('{trade,instrument}'::text[],'"eur/usd"'::jsonb,'lower-case instrument'),
  ('{trade,timeframe}','"h2"','unknown timeframe'),
  ('{trade,direction}','"long"','unknown direction'),
  ('{trade,entry}','1.0845','number price'),
  ('{trade,entry}','"1,0845"','comma price'),
  ('{trade,stopLoss}','"1.0850"','buy with stop above entry'),
  ('{trade,direction}','"sell"','sell with buy-side levels'),
  ('{trade,chart,path}','"../x.png"','chart path with ..'),
  ('{trade,chart,path}','"x.svg"','chart path svg'),
  ('{trade,chart,alt}','"  "','blank alt'),
  ('{trade,chart,thumbnailPath}','"../small.png"','invalid thumbnail path'),
  ('{trade,chart,credit}','"  "','blank chart credit'),
  ('{trade,chart,width}','10.5','fractional width'),
  ('{trade,chart,height}','"900"','text height'),
  ('{trade,status,state}','"inactive"','state not matching reason'),
  ('{trade,status,reason}','"toString"','unknown reason'),
  ('{trade,status,note}','"x"','note on a preset reason'),
  ('{trade,status,outcome}','"loss"','outcome on a preset reason'),
  ('{trade,status,updatedAt}','"2026-02-30T10:00:00Z"','impossible date'),
  ('{trade,status,updatedAt}','"2026-11-27T14:30:00"','local time'),
  ('{trade,status,updatedAt}','"2026-11-27T24:00:00Z"','hour 24')
) t(p,v,label);

select pg_temp.ta_ok(pg_temp.ta_body_ok(jsonb_set(
  pg_temp.ta_with('{trade,chart,thumbnailPath}','"eurusd-small.webp"'),
  '{trade,chart,credit}','"PipStart Editorial Team"')),'optional chart thumbnail and credit accepted');

-- A sell idea with sell-side levels, and the "other" reasons.
select pg_temp.ta_ok(pg_temp.ta_body_ok(jsonb_set(jsonb_set(jsonb_set(jsonb_set(body,'{trade,direction}','"sell-limit"'),
  '{trade,entry}','"156.20"'),'{trade,stopLoss}','"156.90"'),'{trade,takeProfit}','"154.80"')),'sell levels accepted') from ta_base;
select pg_temp.ta_ok(pg_temp.ta_body_ok(pg_temp.ta_with('{trade,status}',
  '{"state":"active","reason":"active-other","note":"Waiting for the NFP release","updatedAt":"2026-11-27T14:30:00Z"}')),'active other with note');
select pg_temp.ta_ok(not pg_temp.ta_body_ok(pg_temp.ta_with('{trade,status}',
  '{"state":"active","reason":"active-other","updatedAt":"2026-11-27T14:30:00Z"}')),'active other needs a note');
select pg_temp.ta_ok(not pg_temp.ta_body_ok(pg_temp.ta_with('{trade,status}',
  jsonb_build_object('state','active','reason','active-other','note',repeat('x',141),'updatedAt','2026-11-27T14:30:00Z'))),'other note over 140 refused');
select pg_temp.ta_ok(not pg_temp.ta_body_ok(pg_temp.ta_with('{trade,status}',
  '{"state":"inactive","reason":"inactive-other","note":"Closed by news","updatedAt":"2026-11-28T09:00:00Z"}')),'inactive other needs an outcome');
select pg_temp.ta_ok(pg_temp.ta_body_ok(pg_temp.ta_with('{trade,status}',
  '{"state":"inactive","reason":"inactive-other","note":"Closed by news","outcome":"void","updatedAt":"2026-11-28T09:00:00Z"}')),'inactive other with outcome');
select pg_temp.ta_ok(pg_temp.ta_body_ok(pg_temp.ta_with('{trade,status}',
  '{"state":"inactive","reason":"take-profit","updatedAt":"2026-11-28T09:00:00Z"}')),'take profit closes the idea');
rollback;
select 'TA_TRADE_IDEAS_SQL_PASSED_ROLLED_BACK' as status;
