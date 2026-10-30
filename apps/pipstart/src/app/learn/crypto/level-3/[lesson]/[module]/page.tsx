import { cryptoModuleRoute } from "../../../crypto-level-pages";

export const dynamicParams = false;

const route = cryptoModuleRoute("level-3");
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
