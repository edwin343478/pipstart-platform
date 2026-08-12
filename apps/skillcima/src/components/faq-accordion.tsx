"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DecorativeCornerShapes } from "./decorative-corner-shapes";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is the course really free?",
    answer:
      "Yes. The five-day Forex Foundations course is completely free. No credit card required, no hidden fees, and no upsells to paid content. We believe risk education should be accessible to everyone.",
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
      "One lesson per day via email for 5 days. Each lesson takes 8-12 minutes to read and includes practical exercises you can do without risking real money.",
  },
  {
    question: "Can I unsubscribe at any time?",
    answer:
      "Absolutely. Every email includes a one-click unsubscribe link. You can also manage your preferences at any time from your email preferences page.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-20 lg:py-28">
      <DecorativeCornerShapes variant="primary-accent" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.15em] text-brand-accent">
            Questions
          </span>

          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-brand-primary/70"
                open={isOpen}
                onClick={(event) => {
                  event.preventDefault();
                  setOpenIndex(isOpen ? -1 : index);
                }}
                style={{ cursor: "pointer" }}
              >
                <summary className="flex list-none items-center justify-between p-5 md:p-6">
                  <span className="pr-4 font-heading text-[15px] font-semibold text-foreground">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-accent transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </summary>

                {isOpen && (
                  <div className="px-5 pt-0 pb-5 md:px-6 md:pb-6">
                    <div className="border-t border-border pt-4">
                      <p className="text-sm leading-relaxed text-muted md:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
