import type { LessonMaterial } from "./lesson-types";
import { foundationLessons } from "./lesson-foundations";
import { portfolioLessons } from "./lesson-portfolio";
import { artDirectionLessons } from "./lesson-art-direction";
import { modelMotionLessons } from "./lesson-3d-motion";
import { imageLessons } from "./lesson-image";
import { videoLessons } from "./lesson-video";
export const lessonMaterials: Record<string, LessonMaterial> = {
  ...foundationLessons,
  ...portfolioLessons,
  ...artDirectionLessons,
  ...modelMotionLessons,
  ...imageLessons,
  ...videoLessons,
};
