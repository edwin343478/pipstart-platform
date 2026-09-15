declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { LessonBlock, LessonMetadata } from "./content/lesson-content";

  export const blocks: LessonBlock[];
  export const metadata: LessonMetadata;
  const MDXContent: ComponentType;
  export default MDXContent;
}
