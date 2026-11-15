import data from "./course-index.json";
import type { Localized } from "./locale";
export type LessonSummary = { id: string; title: Localized; minutes: number };
export type CourseSummary = {
  id: string;
  title: Localized;
  lessons: LessonSummary[];
};
export const courseIndex = data as unknown as CourseSummary[];
