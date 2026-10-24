import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PrivacyPolicyPage from "./page";
import ContactPage from "../../contact/page";
const repo = resolve(process.cwd(), "../..");
const inventory = () =>
  readFileSync(
    resolve(repo, "docs/milestone-21-privacy-operations.md"),
    "utf8",
  );
const plain = (markup: string) =>
  markup
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
describe("C03 factual public privacy/contact and lifecycle inventory", () => {
  it("renders both real page components with their approved public mailbox links", () => {
    for (const page of [
      <PrivacyPolicyPage key="privacy" />,
      <ContactPage key="contact" />,
    ]) {
      const html = renderToStaticMarkup(page);
      const links = [...html.matchAll(/href="mailto:([^"]+)"/g)].map(
        (m) => m[1],
      );
      expect(links.length).toBeGreaterThan(0);
      expect(new Set(links)).toEqual(new Set(["support@pipstart.net"]));
      expect(html).not.toContain("edwincharles598");
      expect(html).not.toContain("pipstartalert2026");
      expect(html).not.toContain("mailto:support@pipstart.com");
    }
  });
  it("removes stale contact availability promises and keeps safe request handling", () => {
    const text = plain(renderToStaticMarkup(<ContactPage />));
    expect(text).not.toMatch(
      /being prepared|before account creation is enabled|will be added once/,
    );
    expect(text).toContain("verify account ownership");
    expect(text).toContain("without including passwords, reset links");
    expect(text).toContain("will never need a trading password");
  });
  it("states current default-on choices, disabled campaigns and independent frequency", () => {
    const text = plain(renderToStaticMarkup(<PrivacyPolicyPage />));
    for (const phrase of [
      "ON by default",
      "Customer optional-email campaigns are currently disabled",
      "Saving a preference does not schedule an email",
      "selecting Weekly does not turn an OFF category back on",
      "not a claim that you gave express consent",
    ])
      expect(text).toContain(phrase);
    expect(renderToStaticMarkup(<PrivacyPolicyPage />)).toContain(
      'href="/account/email-preferences"',
    );
  });
  it("explains linkable hashes and account-deletion limits rather than promising permanent opt-out", () => {
    const text = plain(renderToStaticMarkup(<PrivacyPolicyPage />));
    for (const phrase of [
      "not anonymous data",
      "not all removed by account deletion",
      "the current signup defaults can apply again",
      "not an independent, permanent category unsubscribe",
      "Private prepared email content",
    ])
      expect(text).toContain(phrase);
  });
  it("distinguishes review thresholds from automatic deletion and keeps a review contact", () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />),
      text = plain(html);
    for (const phrase of [
      "90 days",
      "31 days",
      "365 days",
      "not automatic deletion dates",
      "provider logs and backups have separate lifecycles",
    ])
      expect(text).toContain(phrase);
    expect(html).not.toMatch(
      /automatically deleted after|permanently erased after|deleted within 90 days/,
    );
  });
  it("names actual provider roles without claiming all provider copies are erased", () => {
    const text = plain(renderToStaticMarkup(<PrivacyPolicyPage />));
    for (const name of [
      "Supabase",
      "Vercel",
      "Resend",
      "Zoho Mail",
      "Healthchecks",
    ])
      expect(text).toContain(name);
    expect(text).toContain("not learner message bodies or recipient addresses");
    expect(text).toContain(
      "not a promise that every provider copy is immediately erased",
    );
  });
  it("preserves calendar disclosures and the actual existing page shell", () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);
    expect(html).toContain(
      'href="https://www.tradingview.com/privacy-policy/"',
    );
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('id="main-content"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("<footer");
    expect(html).toContain("PipStart · pipstart.net");
    expect(html).not.toContain("<form");
  });
  it("records the client-date notice update without inventing registration or guarantees", () => {
    const text = plain(renderToStaticMarkup(<PrivacyPolicyPage />));
    expect(text).toContain("24 October 2026");
    expect(text).not.toMatch(
      /GDPR compliant|worldwide compliance|registered company|guaranteed inbox/,
    );
  });
  it("inventories every M21-added table from the actual migration declarations", () => {
    const names = readdirSync(resolve(repo, "supabase/migrations")).filter(
      (name) => /^202610(?:19|20|21|22|23|24).*\.sql$/.test(name),
    );
    const tables = new Set(
      names.flatMap((name) =>
        [
          ...readFileSync(
            resolve(repo, "supabase/migrations", name),
            "utf8",
          ).matchAll(/create table public\.([a-z_]+)/g),
        ].map((m) => m[1]),
      ),
    );
    expect(tables.size).toBe(22);
    for (const table of tables)
      expect(inventory()).toContain("`" + table + "`");
  });
  it("keeps receipt/hold decisions, mailbox limits and activation gates explicit", () => {
    const doc = inventory();
    expect(doc).toContain("not a legal opinion");
    expect(doc).toContain("not themselves stop account deletion");
    expect(doc).toContain("Receipt/archive/support/provider retention periods");
    expect(doc).toContain("not automatic erasure");
    expect(doc).toContain("DMARC is presently non-enforcing");
    expect(doc).toContain(
      "Keep worker OFF, permit closed and content catalogue frozen",
    );
    expect(doc).toContain("C04 - preferences accessibility");
  });
});
