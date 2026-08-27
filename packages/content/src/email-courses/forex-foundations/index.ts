import { defineFiveDayEmailCourse } from "../../email-course";
import { forexFoundationsEmailDay1 } from "./day-1";
import { forexFoundationsEmailDay2 } from "./day-2";
import { forexFoundationsEmailDay3 } from "./day-3";
import { forexFoundationsEmailDay4 } from "./day-4";
import { forexFoundationsEmailDay5 } from "./day-5";

export {
  forexFoundationsEmailDay1,
  forexFoundationsEmailDay2,
  forexFoundationsEmailDay3,
  forexFoundationsEmailDay4,
  forexFoundationsEmailDay5,
};

export const forexFoundationsEmailCourse = defineFiveDayEmailCourse({
  courseSlug: "forex-foundations",
  courseName: "Forex Foundations",

  /*
   * Change this when the copy receives a meaningful
   * revision before or after launch.
   */
  contentVersion: "draft-1",

  status: "draft",

  lessons: [
    forexFoundationsEmailDay1,
    forexFoundationsEmailDay2,
    forexFoundationsEmailDay3,
    forexFoundationsEmailDay4,
    forexFoundationsEmailDay5,
  ],
});
