import { writeFile } from "node:fs/promises";
import { curriculum } from "../src/platform/curriculum";
const catalog = curriculum.map((c) => ({
  id: c.id,
  title: c.title,
  lessons: c.lessons.map((l) => ({
    id: l.id,
    title: l.title,
    minutes: l.minutes,
  })),
}));
await writeFile(
  new URL("../src/platform/course-index.json", import.meta.url),
  JSON.stringify(catalog) + "\n",
);
