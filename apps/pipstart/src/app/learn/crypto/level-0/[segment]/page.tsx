import { notFound } from "next/navigation";
import { CurriculumPage } from "../../../../../components/curriculum-page";
import {
  cryptoOrientationLessons,
  getCryptoOrientationHierarchy,
} from "../../../../../lib/crypto-orientation-routing";
import { createDynamicMetadata } from "../../../../../lib/seo";
import { CryptoOrientationLesson } from "../crypto-orientation-lesson";
export const dynamicParams = false;

type Props = { params: Promise<{ segment: string }> };
export function generateStaticParams() {
  return [
    { segment: "crypto-orientation" },
    ...cryptoOrientationLessons.map((lesson) => ({ segment: lesson.slug })),
  ];
}
export async function generateMetadata({ params }: Props) {
  const { segment } = await params;
  const lesson = cryptoOrientationLessons.find((item) => item.slug === segment);
  if (lesson)
    return createDynamicMetadata({
      path: lesson.href,
      title: lesson.seoTitle,
      description: lesson.seoDescription,
    });
  if (segment === "crypto-orientation")
    return createDynamicMetadata({
      path: "/learn/crypto/level-0/crypto-orientation",
      title: "Crypto Orientation and Safety",
      description: "Four beginner lessons and a knowledge quiz.",
    });
  return {};
}
export default async function CryptoOrientationSegmentPage({ params }: Props) {
  const { segment } = await params;
  if (segment === "crypto-orientation")
    return (
      <CurriculumPage {...getCryptoOrientationHierarchy()} kind="course" />
    );
  const lesson = cryptoOrientationLessons.find((item) => item.slug === segment);
  if (!lesson) notFound();
  return <CryptoOrientationLesson lesson={lesson} />;
}
