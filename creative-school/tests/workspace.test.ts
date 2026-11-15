import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { curriculum } from "../src/platform/curriculum";
import { courseIndex } from "../src/platform/course-index";
import { nextLesson } from "../src/platform/resume";
import {
  copyTitle,
  normalizeSearch,
  searchScore,
  sortProjects,
  type ProjectMeta,
} from "../src/platform/workspace";
import { safeReturnPath } from "../src/platform/navigation";
import { AssistantReply } from "../src/platform/AssistantReply";
import { api, ApiError } from "../src/platform/client";

test("lightweight course catalog matches curriculum without shipping tests or answers", () => {
  assert.deepEqual(
    courseIndex,
    curriculum.map((c) => ({
      id: c.id,
      title: c.title,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        minutes: l.minutes,
      })),
    })),
  );
  assert.ok(JSON.stringify(courseIndex).length < 6000);
  assert.equal(
    nextLesson([], "missing")?.lesson.id,
    curriculum[0].lessons[0].id,
  );
  const course = curriculum[1];
  assert.equal(
    nextLesson([], course.lessons[1].id)?.lesson.id,
    course.lessons[1].id,
  );
  assert.equal(
    nextLesson([course.lessons[0].id], course.lessons[0].id)?.lesson.id,
    course.lessons[1].id,
  );
  assert.equal(
    nextLesson(
      curriculum.flatMap((c) => c.lessons.map((l) => l.id)),
      null,
    ),
    null,
  );
});

test("search handles Cyrillic and Kazakh, all tokens, and the entire project collection", () => {
  assert.equal(normalizeSearch("  ВСЁ   ЖАҢА  "), "все жаңа");
  assert.ok(searchScore("жоба жаңа", "Жаңа жоба", ""));
  assert.equal(searchScore("лого видео", "Лого", "дизайн"), 0);
  const projects = Array.from(
    { length: 80 },
    (_, i) =>
      ({
        id: String(i),
        title: `Work ${i}`,
        description: "",
        kind: "design",
        status: i === 79 ? "archived" : "draft",
        updated_at: new Date(2026, 0, i + 1).toISOString(),
      }) as ProjectMeta,
  );
  assert.equal(
    sortProjects(projects, "Work 78", "all", "all", "recent")[0].id,
    "78",
  );
  assert.equal(sortProjects(projects, "", "all", "all", "recent").length, 79);
  assert.equal(
    sortProjects(projects, "", "all", "archived", "recent")[0].id,
    "79",
  );
  assert.equal(sortProjects(projects, "", "video", "all", "recent").length, 0);
  assert.equal(sortProjects(projects, "", "all", "all", "oldest")[0].id, "0");
});

test("copy titles respect server length and Unicode boundaries in every language", () => {
  for (const lang of ["ru", "en", "kk"] as const) {
    const value = copyTitle("🎨".repeat(100), lang);
    assert.ok(value.length <= 120);
    assert.ok(!/\p{Surrogate}/u.test(value));
    assert.match(value, / — /);
  }
});

test("post-login destinations stay within recognized application routes", () => {
  for (const value of [
    null,
    "",
    "https://evil.test",
    "//evil.test",
    "/auth",
    "/dashboard\\evil",
    "/settings\nLocation:evil",
    "/dashboard.evil",
    "/" + "a".repeat(2100),
  ])
    assert.equal(safeReturnPath(value), "/dashboard");
  for (const value of [
    "/studio/video?project=abc",
    "/learn/visual-basics?lesson=vis-1",
    "/projects?status=archived",
    "/settings#profile",
  ])
    assert.equal(safeReturnPath(value), value);
});

test("AI responses format lists and code while escaping model-provided HTML", () => {
  const markup = renderToStaticMarkup(
    createElement(AssistantReply, {
      text: "## План\n1. **Выберите** слой\n2. Поменяйте `X`\n\n```html\n<script>alert(1)</script>\n```\n<img src=x onerror=alert(1)>",
    }),
  );
  assert.match(markup, /<ol><li><strong>Выберите<\/strong>/);
  assert.match(markup, /<code>X<\/code>/);
  assert.match(markup, /&lt;script&gt;/);
  assert.ok(!markup.includes("<script>") && !markup.includes("<img"));
});

test("API rejects invalid JSON instead of treating broken loading responses as success", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("<!doctype html>", { status: 200 }),
  );
  await assert.rejects(
    api("/me"),
    (e) => e instanceof ApiError && e.code === "SERVER_ERROR",
  );
});

test("API GET deadline and caller cancellation remain distinguishable", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(
    globalThis,
    "fetch",
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        const signal = (init as RequestInit).signal!;
        const abort = () => reject(new DOMException("Aborted", "AbortError"));
        if (signal.aborted) abort();
        else signal.addEventListener("abort", abort, { once: true });
      }),
  );
  const timeout = assert.rejects(
    api("/me"),
    (e) => e instanceof ApiError && e.code === "TIMEOUT",
  );
  t.mock.timers.tick(15000);
  await timeout;
  const controller = new AbortController();
  const canceled = assert.rejects(
    api("/me", "GET", undefined, controller.signal),
    (e) => e instanceof DOMException && e.name === "AbortError",
  );
  controller.abort();
  await canceled;
});
