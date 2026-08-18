import { describe, expect, it } from "vitest";

import { buildConsentEvents } from "./consent";

describe("buildConsentEvents", () => {
  it("always records the requested course delivery", () => {
    const events = buildConsentEvents({
      firstName: "Amina",
      email: "amina@example.com",
      privacyAcknowledged: true,
      newsletterConsent: false,
    });

    expect(events).toHaveLength(1);

    expect(events[0]).toMatchObject({
      category: "course_delivery",
      action: "requested",
    });
  });

  it("records newsletter consent only when explicitly selected", () => {
    const events = buildConsentEvents({
      email: "amina@example.com",
      privacyAcknowledged: true,
      newsletterConsent: true,
    });

    expect(events).toHaveLength(2);

    expect(events[1]).toMatchObject({
      category: "educational_newsletter",
      action: "granted",
    });
  });

  it("does not manufacture partner communications consent", () => {
    const events = buildConsentEvents({
      email: "amina@example.com",
      privacyAcknowledged: true,
      newsletterConsent: true,
    });

    expect(
      events.some((event) => event.category === "partner_communications"),
    ).toBe(false);
  });

  it("attaches versioned consent evidence", () => {
    const events = buildConsentEvents({
      email: "amina@example.com",
      privacyAcknowledged: true,
      newsletterConsent: false,
    });

    expect(events[0]?.privacyNoticeVersion).toBe("2026-08-06");
    expect(events[0]?.consentWordingVersion).toBe("1.0.0");
    expect(events[0]?.landingPageVersion).toBe("1.0.0");
    expect(events[0]?.consentWording.length).toBeGreaterThan(0);
  });
});
