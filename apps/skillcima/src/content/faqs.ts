// Shared by the visible FAQ accordion and the FAQPage structured data, so the
// two can never say different things.
export interface FAQItem {
  question: string;
  answer: string;
}

export const skillcimaFaqs: readonly FAQItem[] = [
  {
    question: "Is the course really free?",
    answer:
      "Yes. The five Forex Foundations lessons are free. Joining does not require a credit card or payment, and completing the foundation sequence does not create a paid subscription.",
  },
  {
    question: "Do I need a broker account?",
    answer:
      "No. This is purely educational content. We do not recommend any brokers and you do not need to open an account to complete the course.",
  },
  {
    question: "Will I get trading signals?",
    answer:
      "No. We do not provide trading signals, buy/sell recommendations, or investment advice. The course teaches you how to think independently about the markets.",
  },
  {
    question: "How is the course delivered?",
    answer:
      "One concise foundation lesson is delivered by email each day for five days. A final completion email will point learners to PipStart when the full learning website is ready.",
  },
  {
    question: "Can I stop optional educational emails?",
    answer:
      "Yes. Continuing educational emails are optional and separate from the five requested course lessons. If you choose them, each continuing email will include a secure unsubscribe link that asks you to confirm the change.",
  },
];
