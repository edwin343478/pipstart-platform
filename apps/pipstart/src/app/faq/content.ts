import { selectPublishedContent } from "../../lib/public-content";

type FaqEntry = {
  answer: string;
  question: string;
  status: "draft" | "published";
};

const allFaqEntries: FaqEntry[] = [
  {
    question: "What is PipStart?",
    answer:
      "PipStart is a structured Forex and cryptocurrency education platform. It explains market concepts, terminology and risk in a learning order designed for beginners.",
    status: "published",
  },
  {
    question: "Is PipStart free?",
    answer:
      "Yes. PipStart's core lessons, glossaries and calculators are available without payment. Additional features may be introduced later and will be clearly described before use.",
    status: "published",
  },
  {
    question: "Does PipStart provide trading signals or financial advice?",
    answer:
      "No. PipStart provides general education only. It does not give personal financial advice, trading signals, guaranteed strategies or promises of profit.",
    status: "published",
  },
  {
    question: "Should I begin with Forex or cryptocurrency?",
    answer:
      "Choose the subject you want to understand first. The Start Here page introduces both learning paths, and each path begins with foundational concepts before advanced material.",
    status: "published",
  },
  {
    question: "How is lesson progress saved?",
    answer:
      "Available Forex lesson progress is stored locally in your browser. It is not currently connected to an account and may not follow you to another browser or device.",
    status: "published",
  },
  {
    question: "Are calculator results exact market prices?",
    answer:
      "No. Calculator results are educational estimates based on the information and reference rates provided. Verify current prices, contract details and costs with an appropriate independent source before making a decision.",
    status: "published",
  },
  {
    question: "Does PipStart use affiliate links?",
    answer:
      "Some broker links are affiliate links. PipStart may receive compensation if you use one, without increasing the price you pay. Affiliate relationships do not guarantee or endorse an outcome.",
    status: "published",
  },
  {
    question: "Why are some lessons marked Coming soon?",
    answer:
      "PipStart is being released in stages. Coming soon labels identify planned material that is not yet available, so unfinished lessons are not presented as complete.",
    status: "published",
  },
];

export const faqEntries = selectPublishedContent(allFaqEntries);
