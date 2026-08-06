export type LeadSource = "skillcima";

export type ConsentCategory =
  "course_delivery" | "educational_newsletter" | "partner_communications";

export type ConsentAction = "requested" | "granted" | "withdrawn";

export type ConsentWithdrawalMethod =
  "unsubscribe_link" | "preference_center" | "support_request";

export interface Lead {
  id: string;
  firstName?: string;
  email: string;
  source: LeadSource;
  createdAt: string;
}

export interface ConsentEvent {
  id: string;
  leadId: string;
  category: ConsentCategory;
  action: ConsentAction;
  privacyNoticeVersion: string;
  consentWording: string;
  consentWordingVersion: string;
  landingPageVersion: string;
  sourceCampaign?: string;
  occurredAt: string;
  withdrawalMethod?: ConsentWithdrawalMethod;
}
