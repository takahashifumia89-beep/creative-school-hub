import { courseIndex as curriculum } from "./course-index";
const key = (uid: string) => `cs-resume:${uid}`;
export function rememberLesson(uid: string, lessonId: string) {
  try {
    localStorage.setItem(
      key(uid),
      JSON.stringify({ lessonId, at: Date.now() }),
    );
  } catch {
    /* Reading remains available without browser storage. */
  }
}
export function readResume(uid: string) {
  try {
    const value = JSON.parse(localStorage.getItem(key(uid)) ?? "null");
    return typeof value?.lessonId === "string" ? value.lessonId : null;
  } catch {
    return null;
  }
}
export function nextLesson(done: readonly string[], last: string | null) {
  const visited = curriculum.find((c) => c.lessons.some((l) => l.id === last)),
    completed = new Set(done);
  if (visited) {
    const current = visited.lessons.find((l) => l.id === last);
    if (current && !completed.has(current.id))
      return { course: visited, lesson: current };
    const next = visited.lessons.find((l) => !completed.has(l.id));
    if (next) return { course: visited, lesson: next };
  }
  for (const course of curriculum) {
    const lesson = course.lessons.find((l) => !completed.has(l.id));
    if (lesson) return { course, lesson };
  }
  return null;
}
