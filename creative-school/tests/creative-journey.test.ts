import test from "node:test";
import assert from "node:assert/strict";
import {
  briefConfig,
  buildSpark,
  readSpark,
  sparkHref,
  sparkFormats,
  sparkPalettes,
  sparkStyles,
} from "../src/platform/spark";
import { validDocument } from "../src/platform/schema";
import { practiceProject } from "../src/platform/practice-project";
import { readStory, writeStory } from "../src/platform/project-story";
import { curriculum } from "../src/platform/curriculum";

test("every live-poster variation is a valid native document with editable layers", () => {
  for (const lang of ["ru", "en", "kk"] as const)
    for (const style of sparkStyles)
      for (const palette of sparkPalettes)
        for (const format of sparkFormats) {
          const config = {
            ...briefConfig("sound", lang),
            style: style.id,
            palette: palette.id,
            format: format.id,
            seed: 17,
            density: 10,
          };
          const doc = buildSpark(config);
          assert.ok(validDocument("design", JSON.stringify(doc)));
          assert.equal(
            new Set(doc.shapes.map((s) => s.id)).size,
            doc.shapes.length,
          );
          assert.ok(doc.shapes.filter((s) => s.type === "text").length >= 4);
          for (const s of doc.shapes.filter((s) =>
            s.name?.startsWith("Headline"),
          ))
            assert.ok(s.y + s.h < doc.h! * 0.91);
        }
  const long = buildSpark({
    ...briefConfig("sound", "ru"),
    title: "one\ntwo\nthree\nfour\nfive",
  });
  assert.equal(
    long.shapes
      .filter((s) => s.name?.startsWith("Headline"))
      .map((s) => s.text)
      .join(" "),
    "ONE TWO THREE FOUR FIVE",
  );
  assert.ok(
    long.shapes
      .filter((s) => s.name?.startsWith("Headline"))
      .every((s) => s.y + s.h < long.h! * 0.91),
  );
});
test("shareable poster state round-trips across login and bounds untrusted parameters", () => {
  const original = {
    ...briefConfig("exhibition", "kk"),
    title: "Өзім & you?\nНовый <мир>",
    seed: 953,
    density: 8,
  };
  assert.deepEqual(
    readSpark(sparkHref(original).split("?")[1], "en"),
    original,
  );
  const bad = readSpark(
    "style=evil&palette=url(evil)&format=wrong&seed=Infinity&density=9000&title=" +
      "X".repeat(200),
    "ru",
  );
  assert.equal(bad.style, "rhythm");
  assert.equal(bad.seed, 0);
  assert.equal(bad.density, 10);
  assert.equal(bad.title.length, 48);
  assert.ok(validDocument("design", JSON.stringify(buildSpark(bad))));
});
test("each course opens a valid practice document in the appropriate studio", () => {
  for (const course of curriculum)
    for (const lesson of course.lessons)
      for (const lang of ["ru", "en", "kk"] as const) {
        const project = practiceProject(lesson.id, lang);
        assert.ok(validDocument(project.kind, project.content), lesson.id);
        if (course.id === "3d-basics") assert.equal(project.kind, "3d");
        if (course.id === "image") assert.equal(project.kind, "image");
        if (course.id === "video" || course.id === "motion-basics")
          assert.equal(project.kind, "video");
      }
});
test("project stories preserve authors' text and can be edited in another language", () => {
  const values = [
    "A user's original task\nWith a second line",
    "Color, rhythm & <detail>",
    "I would try another approach.",
  ];
  for (const lang of ["ru", "en", "kk"] as const)
    assert.deepEqual(readStory(writeStory(values, lang)), values);
  const legacy = "An earlier description without structured headings.";
  assert.deepEqual(readStory(legacy), [legacy, "", ""]);
  assert.deepEqual(readStory(writeStory(readStory(legacy), "ru")), [
    legacy,
    "",
    "",
  ]);
});
