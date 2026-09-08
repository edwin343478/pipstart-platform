export type CalendarImpact = "high" | "medium" | "low";

export interface CalendarEvent {
  id: string;
  startsAt: string;
  currency: string;
  name: string;
  explanation: string;
  impact: CalendarImpact;
  actual: string;
  forecast: string;
  previous: string;
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: "eur-gdp-2026-09-08",
    startsAt: "2026-09-08T07:00:00.000Z",
    currency: "EUR",
    name: "Gross domestic product",
    explanation: "Measures changes in total economic output",
    impact: "high",
    actual: "0.3%",
    forecast: "0.2%",
    previous: "0.1%",
  },
  {
    id: "usd-employment-2026-09-08",
    startsAt: "2026-09-08T12:30:00.000Z",
    currency: "USD",
    name: "Employment change",
    explanation: "Tracks changes in employed people",
    impact: "high",
    actual: "—",
    forecast: "75K",
    previous: "62K",
  },
  {
    id: "gbp-testimony-2026-09-08",
    startsAt: "2026-09-08T14:00:00.000Z",
    currency: "GBP",
    name: "Central bank testimony",
    explanation: "Policy discussion before lawmakers",
    impact: "medium",
    actual: "—",
    forecast: "—",
    previous: "—",
  },
  {
    id: "cad-credit-2026-09-08",
    startsAt: "2026-09-08T17:00:00.000Z",
    currency: "CAD",
    name: "Consumer credit",
    explanation: "Change in household borrowing",
    impact: "low",
    actual: "—",
    forecast: "8.2B",
    previous: "7.9B",
  },
];

export const calendarCurrencies = [
  ...new Set(calendarEvents.map((event) => event.currency)),
].sort();
