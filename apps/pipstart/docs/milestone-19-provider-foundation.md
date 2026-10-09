# M19.1 provider foundation

The directory uses typed provider records and a central server-only link register.
M19 completes when its three phases and acceptance gates are approved; adding
providers over time is ongoing content work, not an indefinite milestone blocker.

## Adding a recommended broker

1. Add a stable lowercase Provider id in src/content/providers.ts. Start as draft.
2. Verify every displayed fact against dated primary sources before recommending
   and publishing the record. Record owner editorial approval separately in the
   implementation handoff. A product/platform check is not proof of licensing,
   financial safety, withdrawal reliability or eligibility in every country.
3. Set the verified review date, evidence and a review expiry. The current Deriv
   product/platform check is 2026-10-09; the internal 90-day recheck deadline is
   2027-01-07. Expiry is exclusive: on that date the visit link is disabled until
   a new documented review. "Verified" means a dated check, not continuous monitoring.
4. Add a matching server-only ProviderLink if needed. Use HTTPS and an exact
   allowed host, never a user-supplied destination. Preserve agreed attribution.
5. Keep pending/null fields for facts not yet verified. Do not invent legal entities,
   country lists, fees, payment methods or support details. The Deriv country
   allow/block lists remain unknown and empty until Phase 19.2 evidence is recorded.
   The visible "Available" fact means the service exists, not universal eligibility.
6. Review desktop/mobile and run validation before publishing. Brokers are sorted
   alphabetically, not by affiliate commission. Non-affiliates use the same card.

## Approved content correction, 2026-10-09

The owner recommends the listed broker and welcomes both learners who want an
account to follow lessons and graduates. Demo practice is encouraged; live
registration and funding are optional, not a requirement to learn or graduate.
Affiliate commissions help pay PipStart's running costs, disclosed above the
directory and next to the visit action.

The old migration warnings and historical listing-date message are removed from
the current Deriv card. Displayed products: Forex CFDs, Synthetic Indices, Binary
Options and Crypto Exchange. Platforms: MT5, cTrader, TradingView and Deriv Trader.
Demo account and service availability: Available. The adjacent qualification
states that availability depends on country, account and chosen product. Deriv's
terms explicitly restrict services by residence and product; this is retained.

Primary sources checked:

- https://deriv.com/
- https://deriv.com/trading-platforms/deriv-mt5
- https://deriv.com/trading-platforms/deriv-exchange
- https://deriv.com/trade/options/digital-options
- https://deriv.com/help-centre/tradingview
- https://deriv.com/terms-and-conditions/general-terms-of-use

Binary Options refers to Deriv's fixed-outcome Digital Options offering, not a
promise that every contract type is available in every jurisdiction. Crypto
Exchange refers to Deriv Exchange, not merely a crypto CFD. Products/platforms
are a provider-level list, not an assertion that every product is on every platform.

## Central controls and remaining phases

active:false, passed link expiry, draft/suspended state or an overdue verified
review prevents redirect and removes the card visit action. Both card and
/go/[id] use the same resolver. Redirects are temporary and no-store; input query
parameters never choose a destination. Unavailable links return a noindex,
no-store 404 with a directory return link.

Phase 1 controls require deployment. This is not an instantaneous runtime kill
switch, affiliate admin UI or continuous verification service. The route records
no clicks, IP addresses, country hints or cookies.

19.2: verified entities/country availability/fees/payments/support, country
selection, review templates, exchange directory and honest comparisons.
19.3: operational controls, link/review monitoring, tracking/privacy decisions,
and consolidated accessibility/security/CI/release acceptance.
