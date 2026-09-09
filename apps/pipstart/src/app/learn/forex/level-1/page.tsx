import ForexLessonPage from "./forex-lesson";
import { forexLessons } from "./lessons";

export default function ForexLevelOnePage() {
  return <ForexLessonPage lesson={forexLessons[0]} />;
}
