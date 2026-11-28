-- Disposable SQL acceptance only (TA-c). Status history rule on analysis bodies; rolls back.
begin;
create function pg_temp.th_ok(v boolean,label text) returns void language plpgsql as $$begin if v is distinct from true then raise exception 'Status history assertion: %',label;end if;end$$;
create temp table th_base(body jsonb);
insert into th_base values($fx${"metadata":{"title":"EUR/USD retest","category":"technical","excerpt":"A retest."},"paragraphs":["Why."],
 "trade":{"instrument":"EUR/USD","timeframe":"h4","direction":"buy-limit","entry":"1.0845","stopLoss":"1.0810","takeProfit":"1.0920",
  "chart":{"path":"2026/11/abc.png","alt":"EUR/USD chart","width":1600,"height":900},
  "status":{"state":"inactive","reason":"take-profit","updatedAt":"2026-11-29T10:00:00.000Z"},
  "history":[{"state":"active","reason":"pending","at":"2026-11-27T14:30:00.000Z"},
             {"state":"active","reason":"triggered","at":"2026-11-28T09:00:00.000Z"}]}}$fx$);
create function pg_temp.th_with(path text[],v jsonb) returns jsonb language sql as $$select jsonb_set(body,path,v) from th_base$$;
create function pg_temp.th_body_ok(b jsonb) returns boolean language sql as $$select pipstart_editorial_private.body_ok('analysis',b)$$;

select pg_temp.th_ok(not has_function_privilege(r,'pipstart_editorial_private.analysis_trade_status_ok(jsonb,text)','execute'),'status helper denied to '||r)
  from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.th_ok(pg_temp.th_body_ok(body),'trade with history accepted') from th_base;
select pg_temp.th_ok(pg_temp.th_body_ok(body #- '{trade,history}'),'trade without history accepted') from th_base;
select pg_temp.th_ok(pg_temp.th_body_ok(pg_temp.th_with('{trade,history,0}',
  '{"state":"active","reason":"active-other","note":"Waiting for NFP","at":"2026-11-27T14:30:00Z"}')),'history entry with an Other note');

select pg_temp.th_ok(not pg_temp.th_body_ok(pg_temp.th_with(p,v)),label) from (values
  ('{trade,history}'::text[],'[]'::jsonb,'empty history'),
  ('{trade,history}','{}','history not a list'),
  ('{trade,history,0,at}','"2026-02-30T10:00:00Z"','impossible history time'),
  ('{trade,history,0,state}','"inactive"','history state not matching reason'),
  ('{trade,history,0,note}','"x"','history note on a preset reason'),
  ('{trade,history,0}','{"state":"active","reason":"pending","updatedAt":"2026-11-27T14:30:00Z"}','history entry without at')
) t(p,v,label);

select pg_temp.th_ok(not pg_temp.th_body_ok(jsonb_set(body,'{trade,history}',
  (select jsonb_agg('{"state":"active","reason":"pending","at":"2026-11-27T14:30:00Z"}'::jsonb) from generate_series(1,51)))),'51 history entries refused') from th_base;
select pg_temp.th_ok(pg_temp.th_body_ok(jsonb_set(body,'{trade,history}',
  (select jsonb_agg('{"state":"active","reason":"pending","at":"2026-11-27T14:30:00Z"}'::jsonb) from generate_series(1,50)))),'50 history entries accepted') from th_base;
-- TA-a cases still hold through the shared status helper.
select pg_temp.th_ok(not pg_temp.th_body_ok(pg_temp.th_with('{trade,status,updatedAt}','"2026-11-29T24:00:00Z"')),'current status hour 24 refused');
select pg_temp.th_ok(not pg_temp.th_body_ok(pg_temp.th_with('{trade,status,outcome}','"loss"')),'current status outcome on a preset reason refused');
rollback;
select 'TA_STATUS_HISTORY_SQL_PASSED_ROLLED_BACK' as status;
