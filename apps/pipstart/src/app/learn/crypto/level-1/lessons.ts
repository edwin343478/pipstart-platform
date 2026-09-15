import {
  type PublicationStatus,
  selectPublishedContent,
} from "../../../../lib/public-content";

export type CryptoLesson = {
  estimatedMinutes: number;
  href: `/${string}`;
  id: string;
  introduction: string;
  keyPoints: string[];
  objectives: string[];
  position: number;
  prerequisites: string[];
  relatedLessonIds: string[];
  relatedTermSlugs: string[];
  slug: string;
  status: PublicationStatus;
  title: string;
};

const allCryptoLessons: CryptoLesson[] = [
  {
    estimatedMinutes: 4,
    href: "/learn/crypto/level-1",
    id: "what-is-bitcoin",
    introduction:
      "Bitcoin is a digital asset that can be transferred between people through a decentralized network. This introductory lesson explains its purpose and provides the foundation for the rest of the Bitcoin level.",
    keyPoints: [
      "Bitcoin operates without a central bank.",
      "Transactions are recorded on a shared blockchain.",
    ],
    objectives: [
      "Explain Bitcoin's purpose and the role of its decentralized network.",
    ],
    position: 1,
    prerequisites: [],
    relatedLessonIds: [],
    relatedTermSlugs: ["bitcoin", "blockchain"],
    slug: "what-is-bitcoin",
    status: "published",
    title: "What is Bitcoin?",
  },
];

export const cryptoLessons = selectPublishedContent(allCryptoLessons);
