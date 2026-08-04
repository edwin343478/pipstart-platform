export type CourseDay = 1 | 2 | 3 | 4 | 5;

export interface CourseLesson {
  day: CourseDay;
  slug: string;
  title: string;
  summary: string;
  objectives: readonly string[];
  riskNote: string;
}

export interface EducationalCourse {
  slug: string;
  title: string;
  shortTitle: string;
  durationDays: number;
  tagline: string;
  description: string;
  audience: readonly string[];
  notFor: readonly string[];
  lessons: readonly CourseLesson[];
}