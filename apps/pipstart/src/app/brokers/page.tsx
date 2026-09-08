import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";

const derivAffiliateUrl =
  "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32";

export default function BrokersPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="PipStart home">
          PipStart
        </Link>
        <span>Brokers</span>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Compare Forex Brokers</h1>
          <div className={styles.disclosure}>
            <strong>Affiliate disclosure:</strong> the Deriv link below is an
            affiliate link. PipStart may receive compensation if you register or
            use services through it, at no additional cost to you. Compensation
            does not determine inclusion or future ranking.
          </div>
        </section>

        <article className={styles.broker}>
          <a
            className={styles.creative}
            href={derivAffiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label="Visit Deriv through PipStart's affiliate link"
          >
            <Image
              src="/brokers/deriv-forex-leverage.jpg"
              alt="Forex moves in pips. Leverage makes them count. Trade major currency pairs with leverage and full charting tools."
              width={928}
              height={1152}
              priority
            />
          </a>

          <div className={styles.brokerDetails}>
            <div className={styles.brokerHeading}>
              <div>
                <p>Featured broker</p>
                <h2 className={styles.derivBrand}>Deriv.com</h2>
              </div>
              <span>Affiliate</span>
            </div>

            <p className={styles.summary}>
              Currency pairs move in small steps called pips, often a fraction
              of a cent at a time. On their own those steps look tiny, but
              leverage turns a handful of pips into a real position result.
              Central bank decisions and jobs data reprice pairs fast, and Deriv
              MT5 gives you long or short access with charting and order tools
              to act on that momentum.
            </p>

            <p className={styles.tagline}>
              Forex CFDs on Deriv MT5. Direction, leverage, and tools in one
              platform.
            </p>

            <dl className={styles.facts}>
              <div>
                <dt>Product</dt>
                <dd>Forex CFDs</dd>
              </div>
              <div>
                <dt>Platform</dt>
                <dd>Deriv MT5</dd>
              </div>
              <div>
                <dt>Demo account</dt>
                <dd>Available</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>Depends on country of residence</dd>
              </div>
            </dl>

            <div className={styles.actions}>
              <a
                href={derivAffiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                Visit <span className={styles.derivName}>Deriv</span> →
              </a>
              <span>Affiliate link</span>
            </div>
          </div>
        </article>

        <aside className={styles.riskNotice}>
          <strong>Risk notice:</strong> CFDs are leveraged products. Leverage
          magnifies potential losses as well as potential gains. Verify product
          availability, the Deriv entity serving your country, current terms,
          fees, and regulatory information directly before opening or funding an
          account.
        </aside>

        <p className={styles.verified}>
          Last verified: 8 September 2026. Broker terms and availability can
          change.
        </p>
      </div>

      <footer className={styles.footer}>PipStart · pipstart.net</footer>
    </main>
  );
}
