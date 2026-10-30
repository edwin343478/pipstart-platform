import { cryptoSegmentRoute } from "../../crypto-level-pages";
import { CryptoLessonPage } from "../crypto-lesson";

// A course page or a later lesson page, both resolved from data.
export const dynamicParams = false;

const route = cryptoSegmentRoute("level-2", CryptoLessonPage);
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
