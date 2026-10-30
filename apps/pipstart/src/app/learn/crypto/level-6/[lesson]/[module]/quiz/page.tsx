import { cryptoModuleQuizRoute } from "../../../../crypto-level-pages";

// A quiz added under its module; modules without one return not found.
export const dynamicParams = false;

const route = cryptoModuleQuizRoute("level-6");
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
