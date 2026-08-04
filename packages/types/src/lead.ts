export type LeadSource = "skillcima";

export type ConsentCategory = "educational_marketing";

export interface Lead {
  id: string;
  firstName: string;
  email: string;
  source: LeadSource;
  createdAt: string;
}

export interface ConsentEvent {
  leadId: string;
  category: ConsentCategory;
  granted: boolean;
  policyVersion: string;
  occurredAt: string;
}