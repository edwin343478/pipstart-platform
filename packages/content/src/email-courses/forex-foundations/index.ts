import { defineSixDayEmailCourse } from "../../email-course";
import { forexFoundationsEmailDay1 } from "./day-1";
import { forexFoundationsEmailDay2 } from "./day-2";
import { forexFoundationsEmailDay3 } from "./day-3";
import { forexFoundationsEmailDay4 } from "./day-4";
import { forexFoundationsEmailDay5 } from "./day-5";
import { forexFoundationsEmailDay6 } from "./day-6";

export {
  forexFoundationsEmailDay1,
  forexFoundationsEmailDay2,
  forexFoundationsEmailDay3,
  forexFoundationsEmailDay4,
  forexFoundationsEmailDay5,
  forexFoundationsEmailDay6,
};

export const forexFoundationsEmailCourse = defineSixDayEmailCourse({
  courseSlug: "forex-foundations",
  courseName: "Forex Foundations",

  /*
   * Change this when the copy receives a meaningful
   * revision before or after launch.
   */
  contentVersion: "v3",

  status: "approved",

  lessons: [
    forexFoundationsEmailDay1,
    forexFoundationsEmailDay2,
    forexFoundationsEmailDay3,
    forexFoundationsEmailDay4,
    forexFoundationsEmailDay5,
    forexFoundationsEmailDay6,
  ],
});
