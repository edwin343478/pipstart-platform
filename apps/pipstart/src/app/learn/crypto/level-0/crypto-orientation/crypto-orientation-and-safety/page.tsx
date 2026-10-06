import { CurriculumPage } from "../../../../../../components/curriculum-page";
import { getCryptoOrientationHierarchy } from "../../../../../../lib/crypto-orientation-routing";
import { createDynamicMetadata } from "../../../../../../lib/seo";
export const metadata = createDynamicMetadata({
  path: "/learn/crypto/level-0/crypto-orientation/crypto-orientation-and-safety",
  title: "Crypto Orientation and Safety",
  description:
    "Four detailed beginner lessons with paper practice and a knowledge quiz.",
});
export default function CryptoOrientationModulePage() {
  return <CurriculumPage {...getCryptoOrientationHierarchy()} kind="module" />;
}
