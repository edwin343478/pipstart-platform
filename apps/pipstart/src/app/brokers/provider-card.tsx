import Image from "next/image";
import { AffiliateDisclosure } from "../../components/affiliate-disclosure";
import {
  providerReviewState,
  type Provider,
} from "../../lib/provider-directory";
import styles from "./page.module.css";

export default function ProviderCard({
  provider,
  visitHref,
  now = new Date(),
}: {
  provider: Provider;
  visitHref: string | null;
  now?: Date;
}) {
  const affiliate = provider.relationship === "affiliate";
  const review = providerReviewState(provider, now);
  return (
    <article
      className={styles.broker}
      aria-labelledby={"provider-" + provider.id}
      style={
        provider.image ? undefined : { gridTemplateColumns: "minmax(0, 1fr)" }
      }
    >
      {provider.image && (
        <div className={styles.creative}>
          <Image
            src={provider.image.src}
            alt={provider.image.alt}
            width={provider.image.width}
            height={provider.image.height}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
      <div className={styles.brokerDetails}>
        <div className={styles.brokerHeading}>
          <div>
            <p>
              {review === "current" ? "Recommended broker" : "Provider listing"}
            </p>
            <h2
              id={"provider-" + provider.id}
              className={
                provider.brand === "deriv" ? styles.derivBrand : undefined
              }
            >
              {provider.name}
            </h2>
          </div>
          <span>{affiliate ? "Affiliate" : "Non-affiliate"}</span>
        </div>
        <p className={styles.summary}>{provider.summary}</p>
        {review !== "current" && (
          <p className={styles.tagline}>
            {review === "overdue"
              ? "Review overdue — details may be out of date. Visit link disabled pending review."
              : "Listing review required."}
          </p>
        )}
        <dl className={styles.facts}>
          {provider.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                {fact.value ?? "Not verified"}
                {fact.verification === "pending" && fact.value
                  ? " — not reverified"
                  : ""}
              </dd>
            </div>
          ))}
        </dl>
        <p className={styles.verified}>
          Availability depends on your country, account and chosen product.
          Products and platforms are not available to every user.
        </p>
        <aside className={styles.riskNotice}>
          <strong>Risk notice:</strong> {provider.riskNotice}
        </aside>
        {affiliate ? (
          <AffiliateDisclosure className={styles.disclosure}>
            The {provider.shortName} visit link is an affiliate link. PipStart
            may receive compensation if you register or use services through it,
            at no additional cost to you. This helps cover PipStart&apos;s
            running costs. Brokers are listed alphabetically, not by commission.
          </AffiliateDisclosure>
        ) : (
          <p className={styles.verified}>No affiliate relationship.</p>
        )}
        <div className={styles.actions} style={{ marginTop: "0.75rem" }}>
          {visitHref ? (
            <a
              href={visitHref}
              target="_blank"
              rel={
                affiliate
                  ? "sponsored noopener noreferrer"
                  : "noopener noreferrer"
              }
              aria-label={
                "Visit " +
                provider.shortName +
                (affiliate ? " (affiliate link)" : " (non-affiliate)")
              }
            >
              Visit{" "}
              <span
                className={
                  provider.brand === "deriv" ? styles.derivName : undefined
                }
              >
                {provider.shortName}
              </span>{" "}
              →
            </a>
          ) : (
            <span>Visit link unavailable.</span>
          )}
          <span>{affiliate ? "Affiliate link" : "Non-affiliate link"}</span>
        </div>
        <p className={styles.verified} style={{ marginTop: "0.75rem" }}>
          {review === "pending" ? (
            <>
              Review: verification pending.
              {provider.review.previousListingDate ? (
                <>
                  {" "}
                  Previous listing date:{" "}
                  <time dateTime={provider.review.previousListingDate}>
                    {provider.review.previousListingDate}
                  </time>
                  ; not a fresh verification.
                </>
              ) : null}
            </>
          ) : (
            <>
              {review === "current"
                ? "Verified listing details: "
                : "Last checked: "}
              <time dateTime={provider.review.reviewedAt!}>
                {provider.review.reviewedAt}
              </time>
              .
            </>
          )}{" "}
          Country and account restrictions apply. Terms can change.
        </p>
      </div>
    </article>
  );
}
