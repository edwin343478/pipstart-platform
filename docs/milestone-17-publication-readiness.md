> Current checkpoint — 8 October 2026: the consolidated review covers all 380 meanings, the 18 approved corrections are applied, and the 118 previous pending checks are reconciled. There are no outstanding wording corrections in this review. Evidence limits remain. Expanded publication, integration tests and release approval are still gated. Counts and pending statements below describe earlier checkpoints; the source-closure section is the current result.

# Milestone 17 - Source verification and publication readiness

Review date: 7 October 2026. Verdict: **not ready for publication**.

## What this patch changes

The initial audit patch added review records and a verifier only. The subsequent approved correction patch changes only five catalogue definitions and the audit/verifier records. Public pages, lesson content, fonts, layouts, Supabase, CI and publication flags remain unchanged. It does not commit or push.

## Coverage and honest limits

All 378 entries and 380 meanings are accounted for and bound to the current approved editorial catalogue. There are 242 Forex entries and 136 Crypto entries. The two extra meanings belong to Slashing and Wash trading and retain their separate lesson contexts.

The ledger contains 90 scoped primary-source records. Meaning dispositions: core-evidence-mapped: 149, targeted-source-check-pending: 118, targeted-source-supported: 30, arithmetic-verified: 20, course-context-aligned: 58, correction-applied: 5.

Core evidence mapped means a primary excerpt supports the named concept within its scope. It does not certify every sentence, analogy or confusion note. Indexed excerpts are labeled separately; inaccessible pages are not treated as successfully read. Course labels and arithmetic need lesson-specific checks rather than a borrowed external authority. No meaning is marked publication eligible in this patch. Existing inherited links are not all independently verified.

## Approved editorial corrections

### crypto:active-addresses

Original: The number of unique addresses that sent or received coins on a blockchain during a set period, such as a day. Each address is counted once per period.

Applied: A count of unique blockchain addresses meeting a data provider's activity rule during a stated period. That rule may include transfers or other ledger activity. Repeated activity by one address is counted once under the metric; an address count is not a count of people.

Reason: A transfer-only definition excludes activity counted by some established provider metrics. Sources: V60. Approved and applied on 7 October 2026. Publication is not approved.

### crypto:rehypothecation

Original: When a custodian uses customer assets for its own purposes, such as lending them out or pledging them as collateral.

Applied: Using collateral received from a customer as collateral for the recipient's own borrowing or other obligations. The agreement and applicable rules determine whether this is allowed. Lending or reusing customer assets is a broader category.

Reason: General customer-asset reuse is broader than repledging collateral. Sources: V61. Approved and applied on 7 October 2026. Publication is not approved.

### crypto:broker-crypto

Original: A firm or app that quotes you a price and fills your order itself, instead of showing you other customers' orders. Its quoted price usually includes a markup over the market price.

Applied: A service that arranges or executes crypto purchases or sales for customers. Some quote their own dealing prices; others route orders. Check who acts as the counterparty and how spreads and fees are charged.

Reason: The current wording treats one dealer-style service model as the definition of all brokers. The source supports the role distinction, not the legal status of every crypto service. Sources: V69, V01. Approved and applied on 7 October 2026. Publication is not approved.

### crypto:audit-scope

Original: The exact contracts, code version and features an auditor agreed to review. Anything outside it, including later upgrades, was not checked.

Applied: The contracts, code version and features an auditor agreed to review. That report does not establish that anything outside its scope was checked. Later upgrades need review evidence covering the relevant version.

Reason: An upgrade could have a separate audit or fix review; absence from one scope does not prove no review occurred. Sources: V68. Approved and applied on 7 October 2026. Publication is not approved.

### crypto:watch-only-wallet

Original: A wallet that tracks addresses using public information only; it can show balances and incoming payments but cannot sign or send transactions.

Applied: A wallet that tracks addresses using public information without holding their signing keys. It can display activity and, in some implementations, prepare transactions or broadcast transactions signed elsewhere. It cannot independently authorise spending from those addresses.

Reason: Signing and broadcasting are different operations; Bitcoin Core documents watch-only preparation and broadcasting. Sources: V67. Approved and applied on 7 October 2026. Publication is not approved.

## Public integration finding

The current published-glossary adapter takes draft aliases and category only after root and entry approval gates pass. Its definitions still come from the existing public Forex blocks and the Crypto lesson glossary inventory. That supplies 136 current public entries, compared with 378 in the expanded draft. Flipping flags alone would neither publish the expanded definitions nor add all new terms. The current pages also do not expose all draft examples, notes and related-term information.

A separate, scoped content integration must bind the exact reviewed catalogue to the public adapter, retain established routes and anchor slugs, preserve multiple meanings with their own lesson links, and render approved teaching blocks using the existing visual format. A category supplied internally is not the same as a visible category filter. Exact word matching is not typo tolerance. Check the original M17 roadmap before declaring search complete.

## Required release sequence

1. Review the five approved and applied corrections; if adopted, update only those definitions and the editorial baseline in an explicitly approved patch.
2. Complete targeted evidence and course/arithmetic checks listed per meaning, including factual examples and notes. Record primary scope and retrieval date.
3. Review cross-course consistency, including investing, and network-specific slashing wording. Preserve legitimate contextual differences.
4. Prepare the content-adapter and approved teaching-block integration with closed gates and focused compatibility tests.
5. Verify all existing public anchors, both courses, lesson return links, search/reset/category behavior, empty results, keyboard navigation, mobile overflow and desktop typography.
6. Run repository validation and fresh browser/CI checks on the release diff, obtain publication approval, then open only the approved release gates.

## Verification contract

Run `node scripts/verify-m17-publication-readiness.mjs`. It checks the catalogue hash, complete per-meaning coverage, matching definitions and digests, source ID references, the original-to-approved correction chain, and continued closed publication gates. Negative fixtures exercise missing meanings, altered content, missing evidence, invalid correction targets and premature release assertions.

Run `node scripts/verify-m17-publication-readiness.mjs --require-release-ready` only as a release check. It deliberately exits nonzero while this record is blocked. The normal installer treats a valid blocked audit as success, prints `PUBLICATION: NOT READY`, and does not attempt publication. The verifier checks record integrity; it cannot prove a source is true, current, or adequate without human claim review.

## Existing checks and remaining limits

The returned editorial execution log passed its inventory/preservation verifier, nine negative fixtures, 31 tests, formatting, production typecheck and lint. Those are prior-patch results, not browser verification of a future release. This patch needs only its own record-integrity checks and formatting because it changes no application source. Windows execution must still be confirmed by the returned transcript.

## Source register

- **V01** CFTC - Eight things to know before trading Forex ([primary source](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html)). Checked 2026-10-07; page-excerpt. Scope: Retail OTC dealer counterparty, leverage and fee risks.
- **V02** CME - FX quote conventions ([primary source](https://www.cmegroup.com/education/courses/introduction-to-fx/understanding-fx-quote-conventions.html)). Checked 2026-10-07; page-excerpt. Scope: Base and quote orientation in currency quotations.
- **V03** Bank of England - Exchange rates ([primary source](https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates)). Checked 2026-10-07; page-excerpt. Scope: Exchange rates as prices between currencies.
- **V04** MetaQuotes - Performing deals ([primary source](https://www.metatrader5.com/en/terminal/help/trading/performing_deals)). Checked 2026-10-07; page-excerpt. Scope: MT5 balance, equity, margin and account ratio conventions.
- **V05** MetaQuotes - General trading concepts ([primary source](https://www.metatrader5.com/en/terminal/help/trading/general_concept)). Checked 2026-10-07; page-excerpt. Scope: MT5 netting and hedging account position treatment.
- **V06** SEC Investor.gov - Types of orders ([primary source](https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders)). Checked 2026-10-07; page-excerpt. Scope: Market, limit and stop execution differences; securities source.
- **V07** FCA - Clone firms ([primary source](https://www.fca.org.uk/consumers/clone-firms-individuals)). Checked 2026-10-07; page-excerpt. Scope: Checking identity and genuine registered contact details.
- **V08** BIS - FX in a higher volatility environment ([primary source](https://www.bis.org/publications/qr-202212/global-foreign-exchange-market-higher-volatility-environment)). Checked 2026-10-07; page-excerpt. Scope: Dealer market structure and principal intermediation.
- **V09** MetaQuotes - Average True Range ([primary source](https://www.metatrader5.com/en/terminal/help/indicators/oscillators/atr)). Checked 2026-10-07; page-excerpt. Scope: True range components and averaged range.
- **V10** MetaQuotes - Moving averages ([primary source](https://www.metatrader5.com/en/terminal/help/indicators/trend_indicators/ma)). Checked 2026-10-07; page-excerpt. Scope: SMA equal weights and EMA recursive weighting.
- **V11** MetaQuotes - RSI ([primary source](https://www.metatrader5.com/en/terminal/help/indicators/oscillators/rsi)). Checked 2026-10-07; page-excerpt. Scope: RSI range and common thresholds; thresholds do not ensure a turn.
- **V12** MetaQuotes - MACD ([primary source](https://www.metatrader5.com/en/terminal/help/indicators/oscillators/macd)). Checked 2026-10-07; page-excerpt. Scope: Moving average difference and signal line; platform variants exist.
- **V13** MetaQuotes - Stochastic oscillator ([primary source](https://www.metatrader5.com/en/terminal/help/indicators/oscillators/so)). Checked 2026-10-07; page-excerpt. Scope: Close relative to recent high-low range and smoothing.
- **V14** John Bollinger - Band rules ([primary source](https://www.bollingerbands.com/bollinger-band-rules)). Checked 2026-10-07; page-excerpt. Scope: Band construction and BandWidth-based squeeze.
- **V15** CME - Chart types ([primary source](https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar)). Checked 2026-10-07; page-excerpt. Scope: Candlestick OHLC, bodies and wicks.
- **V16** CME - Support and resistance ([primary source](https://www.cmegroup.com/education/courses/technical-analysis/support-and-resistance)). Checked 2026-10-07; page-excerpt. Scope: Historical price references and chart reaction areas.
- **V17** BEA - GDP ([primary source](https://www.bea.gov/resources/learning-center/what-to-know-gdp)). Checked 2026-10-07; page-excerpt. Scope: Production measure and successive estimate updates.
- **V18** BLS - Employment survey FAQ ([primary source](https://www.bls.gov/web/empsit/cesfaq.htm)). Checked 2026-10-07; page-excerpt. Scope: Jobs versus people, survey scope and revisions.
- **V19** BLS - CPI FAQ ([primary source](https://www.bls.gov/cpi/questions-and-answers.htm)). Checked 2026-10-07; page-excerpt. Scope: Price basket scope and index versus rate differences.
- **V20** Federal Reserve - Monetary and fiscal policy ([primary source](https://www.federalreserve.gov/faqs/money_12855.htm)). Checked 2026-10-07; page-excerpt. Scope: Central bank versus government policy responsibilities.
- **V21** CFTC - Commitments of Traders ([primary source](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm)). Checked 2026-10-07; page-excerpt. Scope: Covered futures positions, categories and reporting lag.
- **V22** NIST - Correlation ([primary source](https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/correlat.htm)). Checked 2026-10-07; page-excerpt. Scope: Pearson linear association and denominator requirements.
- **V23** Bailey et al. - Probability of backtest overfitting ([primary source](https://scholarworks.wmich.edu/math_pubs/42/)). Checked 2026-10-07; author-abstract. Scope: Author institutional abstract on historical selection and overfitting.
- **V24** CME - Trade log ([primary source](https://www.cmegroup.com/education/courses/building-a-trade-plan/keep-a-trade-log)). Checked 2026-10-07; page-excerpt. Scope: Recording reasons, transactions and reviewing outcomes.
- **V25** CME - Position size ([primary source](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size)). Checked 2026-10-07; page-excerpt. Scope: Cash budget and stop distance as sizing inputs.
- **V26** CME - Trading strategy in a plan ([primary source](https://www.cmegroup.com/education/courses/building-a-trade-plan/trading-strategies-in-your-trade-plan)). Checked 2026-10-07; page-excerpt. Scope: Entry, exit and trigger specification.
- **V27** NFA - Hypothetical results ([primary source](https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9)). Checked 2026-10-07; page-excerpt. Scope: Simulation assumptions and hindsight limitations; not a jurisdiction finding.
- **V28** UK government - Clock changes ([primary source](https://www.gov.uk/when-do-the-clocks-change)). Checked 2026-10-07; page-excerpt. Scope: UK clock changes demonstrate calendar-dependent local times.
- **V29** APA - Anchoring bias ([primary source](https://dictionary.apa.org/anchoring-bias)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Overweighting an initial reference; full page was inaccessible.
- **V30** APA - Confirmation bias ([primary source](https://dictionary.apa.org/confirmation-bias)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Favoring supporting evidence; indexed APA excerpt, full page inaccessible.
- **V31** APA - Hindsight research ([primary source](https://www.apa.org/news/press/releases/2000/05/hindsight)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Retrospective reconstruction of prior judgments.
- **V32** Bitcoin developer reference - Block chain ([primary source](https://developer.bitcoin.org/reference/block_chain.html)). Checked 2026-10-07; page-excerpt. Scope: Header target, nonce, proof of work and 210000-block subsidy interval.
- **V33** Bitcoin developer guide - Transactions ([primary source](https://developer.bitcoin.org/devguide/transactions.html)). Checked 2026-10-07; page-excerpt. Scope: Inputs, outputs and spending conditions in Bitcoin.
- **V34** Ethereum - Accounts ([primary source](https://ethereum.org/developers/docs/accounts/)). Checked 2026-10-07; page-excerpt. Scope: Addresses, signing keys and account roles on Ethereum.
- **V35** Ethereum - Gas ([primary source](https://ethereum.org/developers/docs/gas/)). Checked 2026-10-07; page-excerpt. Scope: Gas units, native fee payment and one gwei equals 10^-9 ETH.
- **V36** Bitcoin BIP 39 ([primary source](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)). Checked 2026-10-07; page-excerpt. Scope: Mnemonic and optional passphrase derive a seed; distinct passphrases derive distinct seeds.
- **V37** Ethereum - Proof of stake rewards and penalties ([primary source](https://ethereum.org/developers/docs/consensus-mechanisms/pos/rewards-and-penalties/)). Checked 2026-10-07; page-excerpt. Scope: Specific slashable behavior is distinct from ordinary downtime.
- **V38** Ethereum - Smart contracts ([primary source](https://ethereum.org/developers/docs/smart-contracts/)). Checked 2026-10-07; page-excerpt. Scope: Deployed program, functions and stored state.
- **V39** Ethereum - Oracles ([primary source](https://ethereum.org/developers/docs/oracles/)). Checked 2026-10-07; page-excerpt. Scope: External information for on-chain execution.
- **V40** Ethereum - Scaling ([primary source](https://ethereum.org/developers/docs/scaling/)). Checked 2026-10-07; page-excerpt. Scope: L1 versus solutions deriving security from L1; not all separate chains are L2.
- **V41** Ethereum - Pooled staking ([primary source](https://ethereum.org/staking/pools/)). Checked 2026-10-07; page-excerpt. Scope: Liquid staking token claims and design differences.
- **V42** Ethereum - Wallets ([primary source](https://ethereum.org/wallets/)). Checked 2026-10-07; page-excerpt. Scope: Wallet as interaction and account-control tool, rather than literal coin storage.
- **V43** Ethereum - Bridges ([primary source](https://ethereum.org/bridges/)). Checked 2026-10-07; page-excerpt. Scope: Cross-chain asset or information transfer and dependencies.
- **V44** Ethereum - NFTs ([primary source](https://ethereum.org/nft/)). Checked 2026-10-07; page-excerpt. Scope: Distinct token identifiers; ownership does not establish all off-chain rights.
- **V45** Ethereum - DAOs ([primary source](https://ethereum.org/dao/)). Checked 2026-10-07; page-excerpt. Scope: Collective proposal and governance mechanisms.
- **V46** Ethereum - History ([primary source](https://ethereum.org/ethereum-forks/)). Checked 2026-10-07; page-excerpt. Scope: The DAO attack and disputed 2016 fork.
- **V47** Aave - Borrowing ([primary source](https://aave.com/help/borrowing/borrow-tokens)). Checked 2026-10-07; page-excerpt. Scope: Collateral-backed borrowing and LTV; Aave-specific implementation.
- **V48** Aave - Liquidations ([primary source](https://aave.com/help/borrowing/liquidations)). Checked 2026-10-07; page-excerpt. Scope: Health factor threshold and liquidation mechanics; not every protocol.
- **V49** Aave - Flash loans ([primary source](https://aave.com/docs/aave-v3/guides/flash-loans)). Checked 2026-10-07; page-excerpt. Scope: Atomic flash borrowing and repayment, including documented variant limitations.
- **V50** Uniswap - How it works ([primary source](https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works)). Checked 2026-10-07; page-excerpt. Scope: Pool-based automated liquidity; LP representations vary by version.
- **V51** Uniswap - Price impact ([primary source](https://support.uniswap.org/hc/en-us/articles/8671539602317-What-is-price-impact)). Checked 2026-10-07; page-excerpt. Scope: A trade changing price through available liquidity.
- **V52** OpenZeppelin - ERC20 ([primary source](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20)). Checked 2026-10-07; page-excerpt. Scope: Allowance and approval, token balances, minting and burning.
- **V53** OpenZeppelin - ERC20 Permit ([primary source](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20)). Checked 2026-10-07; page-excerpt. Scope: Signed allowance authorization and spender semantics.
- **V54** Coinbase - APR and APY ([primary source](https://www.coinbase.com/learn/crypto-basics/apy-vs-apr-what-is-the-difference)). Checked 2026-10-07; page-excerpt. Scope: Compounding convention distinguishes APR and APY; offers are not guarantees.
- **V55** Coinbase - Derivatives leverage and margin ([primary source](https://help.coinbase.com/en/coinbase/derivatives/us-derivatives-leverage-margin)). Checked 2026-10-07; page-excerpt. Scope: Contract notional and venue-specific margin calculations.
- **V56** FATF - Virtual assets ([primary source](https://www.fatf-gafi.org/en/topics/virtual-assets.html)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Originator and beneficiary information standards, subject to local implementation.
- **V57** SEC staff - Tokenized securities ([primary source](https://www.sec.gov/newsroom/speeches-statements/corp-fin-statement-tokenized-securities-012826-statement-tokenized-securities)). Checked 2026-10-07; page-excerpt. Scope: Token models confer different rights; US staff statement, not global law.
- **V58** SEC Investor.gov - Proof of reserves ([primary source](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/investors)). Checked 2026-10-07; page-excerpt. Scope: Proof of reserves is not a complete financial statement audit.
- **V59** Trezor - Hardware wallets ([primary source](https://trezor.io/learn/basics/what-is-a-hardware-wallet)). Checked 2026-10-07; page-excerpt. Scope: Offline signing-key storage and residual security risks.
- **V60** Coin Metrics - Active addresses ([primary source](https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/addresses/active-addresses)). Checked 2026-10-07; page-excerpt. Scope: Provider metric may include activity beyond transfers; distinct addresses are not people.
- **V61** IMF - Rehypothecation ([primary source](https://www.imf.org/en/publications/wp/issues/2016/12/31/the-sizable-role-of-rehypothecation-in-the-shadow-banking-system-24075)). Checked 2026-10-07; page-excerpt. Scope: Received customer collateral repledged for the recipient; 2010 research, not current legal limits.
- **V62** CoinMarketCap - Supply ([primary source](https://support.coinmarketcap.com/hc/en-us/articles/360043396252-Supply-Circulating-Total-Max)). Checked 2026-10-07; page-excerpt. Scope: Provider-defined circulating, total and maximum supply; max-based FDV convention.
- **V63** CoinGecko - FDV ([primary source](https://www.coingecko.com/learn/what-is-fully-diluted-valuation-fdv-in-crypto)). Checked 2026-10-07; page-excerpt. Scope: Total-supply-based FDV convention, distinct from other providers.
- **V64** CoinMarketCap - Market capitalization ([primary source](https://support.coinmarketcap.com/hc/en-us/articles/360043836811-Market-Capitalization-Cryptoasset-Aggregate)). Checked 2026-10-07; page-excerpt. Scope: Price multiplied by provider circulating supply; not cash invested.
- **V65** IRS - Virtual currency FAQ ([primary source](https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions)). Checked 2026-10-07; page-excerpt. Scope: Basis depends on acquisition circumstances; source addresses US federal tax.
- **V66** SEC Investor.gov - Dollar cost averaging ([primary source](https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging)). Checked 2026-10-07; page-excerpt. Scope: Equal scheduled amounts regardless of price; no guaranteed return.
- **V67** Bitcoin Core - Offline signing tutorial ([primary source](https://github.com/bitcoin/bitcoin/blob/master/doc/offline-signing-tutorial.md)). Checked 2026-10-07; page-excerpt. Scope: Watch-only wallet can prepare and broadcast externally signed transactions.
- **V68** OpenZeppelin - Audit scope ([primary source](https://www.openzeppelin.com/news/what-is-a-smart-contract-audit-lessons-from-openzeppelins-1000-audits)). Checked 2026-10-07; page-excerpt. Scope: Review refers to agreed code and commit; additional review may cover an upgrade.
- **V69** SEC Investor.gov - Broker ([primary source](https://www.investor.gov/introduction-investing/investing-basics/glossary/broker)). Checked 2026-10-07; page-excerpt. Scope: Broker agency and dealer principal distinction; securities-specific legal source.
- **V70** FBI - SIM swapping ([primary source](https://www.fbi.gov/contact-us/field-offices/sanfrancisco/news/press-releases/fbi-san-francisco-warns-the-public-of-the-dangers-of-sim-swapping)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Social engineering transfers control of a phone number.
- **V71** CISA - Multifactor authentication ([primary source](https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/require-multifactor-authentication)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Independent factors and phishing-resistant options.
- **V72** Coinbase - Funding rate ([primary source](https://help.coinbase.com/en/derivatives/perpetual-style-futures/funding-rate)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Payments between long and short exposures; timing and basis are venue-specific.
- **V73** SEC Investor.gov - Allocation ([primary source](https://www.investor.gov/introduction-investing/getting-started/asset-allocation)). Checked 2026-10-07; primary-indexed-excerpt. Scope: Allocation by risk and time horizon; rebalancing restores a chosen mix.
- **V74** FINRA - Intraday trading ([primary source](https://www.finra.org/investors/insights/frequent-intraday-trading)). Checked 2026-10-07; page-excerpt. Scope: Same-day positions and trading costs; US account rules not generalized.

## Approved correction patch - 7 October 2026

The five corrections are approved and applied to the private catalogue. The file named `milestone-17-source-corrections.proposed.json` retains its name for compatibility, but now explicitly records `approved: true`, `applied: true`, the original text, the replacement and the approval scope. This does not mark all sources verified or approve publication.

The original editorial record is unchanged. Its verifier first reconstructs that approved version, then checks the five later approved corrections. The readiness verifier binds the audit to the corrected catalogue and proves that reversing only those five replacements returns the preceding catalogue digest.

## Arithmetic verification - 7 October 2026

All 20 meanings previously labeled arithmetic-check-pending have passed direct recalculation of their stated examples and a review of units, sign conventions, costs, chronological drawdowns, zero-result counts and zero-denominator limitations. No catalogue wording was changed. Proofs and review notes are in `docs/milestone-17-arithmetic-verification.json`.

This closes only the arithmetic batch. The 58 definition-to-lesson context checks now align. The 130 targeted source checks remain pending. The 149 core-evidence mappings and five applied corrections still require final claim-level source review. Publication is not ready.

## Course-context verification - 7 October 2026

All 58 course-context meanings align with the linked approved teaching. The evidence record names exact block pointers and excerpts, with an immutable reviewed snapshot and hashes of lesson inputs. This is a definition-context check only: it does not independently certify every example, confusion note, jurisdiction or market claim. No lesson or catalogue content was changed.

Remaining: 130 targeted source checks, final claim-level review of 149 core mappings and five corrected entries, and remaining example/note checks across the catalogue. Public adapter integration, rendering, browser compatibility and explicit release approval remain blocked.

## Targeted source batch 1 - 7 October 2026

18 existing Forex meanings were reviewed against primary quote, contract and order documentation, including their supplied examples and confusion notes. Ten numerical proofs were recalculated. No wording correction is required within this batch. Evidence and specific limits are recorded in `docs/milestone-17-targeted-sources-1.json`. Six new scoped source records bring the register to 80. Earlier entries are not overwritten or broadly certified.

130 targeted checks remain, together with final claim-level review of the 149 core mappings, five corrections and remaining example/note reviews outside this batch. Source support is distinct from catalogue-wide release approval. Publication remains blocked.

## Targeted source batch 2 — 7 October 2026

Twelve existing Forex meanings about contracts, practice accounts, pair classifications, costs and trading have scoped support for their definitions, supplied examples and notes. No glossary wording or application code changes are required. Ten new source records bring the register to 90; inherited source records are unchanged. Evidence is in `docs/milestone-17-targeted-sources-2.json`.

Current cumulative targeted coverage is 30 meanings; 118 targeted checks remain. Historical batch counts above describe their respective checkpoints. The 149 core mappings, five corrections and remaining catalogue-wide claims still need final review. Expanded publication remains blocked.

The current public glossary passed its production build, 58 unit/render tests and 24 browser cases in the native-fallback run `20261007-222835-ca3d4c`. This does not certify the unpublished expanded glossary. No commit/push has occurred; GitHub CI remains pending.

## Approved consolidated source closure — 8 October 2026

The owner approved all 18 exact replacements from the consolidated review. Only those 17 definitions and one financing example changed in the private draft. The root and entry publication flags, identities, anchors, category, aliases, links, lesson references and application files retain their approved state. There are 378 entries and 380 meanings.

All 380 ledger rows now record complete scoped review, with original decisions, source scopes and limitations retained in `milestone-17-source-closure.review.json`. The 118 targeted checks are no longer outstanding. Review does not assert that hypothetical examples were real transactions or that provider-specific arrangements apply universally. The register preserves all 90 prior sources and adds 69 successfully retrieved scoped records. All 18 former proposed wording issues are resolved by the exact approved replacements.

The ledger contains 302 source-reviewed-with-scope meanings, 58 course-context meanings and 20 arithmetic meanings. It records five earlier corrections and 18 new corrections separately (23 total). Both source-completion and corrections gates are complete; all other gates retain their preceding state. Entry `sourceReview` and `approved` fields remain unchanged because this patch does not open the public adapter.

Historical audit records are unchanged. A shared verifier reverses exactly the 18 approved changes in memory, validates the historical digest, and lets the six previous audits check their original evidence without rewriting history. The current catalogue and current ledger have their own exact scope and evidence validation; historical success alone is not accepted as current-content certification. All 41 additional numerical proofs are checked against the reviewed examples, and arithmetic example text is preserved.

The existing browser report covers the unchanged public app. This patch cannot claim browser certification of the expanded unpublished catalogue. The strict release-ready command must continue to fail. No cache, process, database, lesson layout, mobile design, font, CI workflow, commit or push action is included.
