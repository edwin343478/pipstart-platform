import { CompactFooter, CompactHeader } from "../../components/site-chrome";
import { AffiliateDisclosure } from "../../components/affiliate-disclosure";
import { providers } from "../../content/providers";
import { providerLinks } from "../../content/provider-links";
import {
  publishedProviders,
  resolveProviderLink,
  validateProviderDirectory,
} from "../../lib/provider-directory";
import ProviderCard from "./provider-card";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export default function BrokersPage() {
  validateProviderDirectory(providers, providerLinks);
  const now = new Date();
  const brokers = publishedProviders(providers, "forex-broker");
  return (
    <main className={styles.page}>
      <CompactHeader className={styles.header} section="Brokers" />
      <div className={styles.content}>
        <section className={styles.introduction}>
          <h1>Forex Broker Directory</h1>
          <AffiliateDisclosure className={styles.disclosure}>
            Affiliate commissions help cover PipStart&apos;s running costs and
            keep the website online. We may earn a commission when you use the
            affiliate links labelled on each broker card. Brokers are listed
            alphabetically, not by commission. Opening or funding a live account
            is optional.
          </AffiliateDisclosure>
        </section>
        {brokers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            now={now}
            visitHref={
              provider.linkId &&
              resolveProviderLink(
                provider.linkId,
                providers,
                providerLinks,
                now,
              )
                ? `/go/${provider.linkId}`
                : null
            }
          />
        ))}
        {brokers.length === 0 && (
          <p>No published broker listings are available yet.</p>
        )}
      </div>
      <CompactFooter className={styles.footer} />
    </main>
  );
}
