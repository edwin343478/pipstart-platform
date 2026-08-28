import type { ConsentAction, ConsentCategory } from "@repo/types";
import type { LeadFormData } from "@repo/validation";

export const SKILLCIMA_PRIVACY_NOTICE_VERSION = "2026-08-06";
export const SKILLCIMA_LANDING_PAGE_VERSION = "1.0.0";
export const SKILLCIMA_CONSENT_WORDING_VERSION = "1.0.0";

export const COURSE_DELIVERY_WORDING =
  "Submitting the Skillcima enrolment form requests delivery of the free six-email Forex Foundations course by email.";

export const NEWSLETTER_CONSENT_WORDING =
  "Send me continuing educational emails.";

export interface PendingConsentEvent {
  category: ConsentCategory;
  action: ConsentAction;
  privacyNoticeVersion: string;
  consentWording: string;
  consentWordingVersion: string;
  landingPageVersion: string;
}

export function buildConsentEvents(lead: LeadFormData): PendingConsentEvent[] {
  const events: PendingConsentEvent[] = [
    {
      category: "course_delivery",
      action: "requested",
      privacyNoticeVersion: SKILLCIMA_PRIVACY_NOTICE_VERSION,
      consentWording: COURSE_DELIVERY_WORDING,
      consentWordingVersion: SKILLCIMA_CONSENT_WORDING_VERSION,
      landingPageVersion: SKILLCIMA_LANDING_PAGE_VERSION,
    },
  ];

  if (lead.newsletterConsent) {
    events.push({
      category: "educational_newsletter",
      action: "granted",
      privacyNoticeVersion: SKILLCIMA_PRIVACY_NOTICE_VERSION,
      consentWording: NEWSLETTER_CONSENT_WORDING,
      consentWordingVersion: SKILLCIMA_CONSENT_WORDING_VERSION,
      landingPageVersion: SKILLCIMA_LANDING_PAGE_VERSION,
    });
  }

  return events;
}
