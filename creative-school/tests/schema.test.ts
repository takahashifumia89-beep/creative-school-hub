import test from "node:test";
import assert from "node:assert/strict";
import { validDocument } from "../src/platform/schema";
import { curriculum, lessonMap } from "../src/platform/curriculum";
test("untrusted documents cannot contain NaN, remote images or unbounded objects", () => {
  assert.equal(
    validDocument("design", JSON.stringify({ bg: "#fff", shapes: [] })),
    false,
  );
  assert.equal(
    validDocument(
      "design",
      JSON.stringify({
        bg: "#ffffff",
        shapes: [{ id: "a", type: "image", href: "javascript:alert(1)" }],
      }),
    ),
    false,
  );
  assert.equal(
    validDocument(
      "3d",
      JSON.stringify({
        bg: "#ffffff",
        objects: [
          {
            id: "a",
            kind: "box",
            pos: [0, null, 0],
            rotY: 0,
            scale: 1,
            color: "#ffffff",
          },
        ],
      }),
    ),
    false,
  );
  assert.equal(
    validDocument(
      "video",
      JSON.stringify({
        clips: [
          {
            id: "a",
            filename: "a.mp4",
            start: 10,
            end: 5,
            duration: 20,
            title: "",
            volume: 1,
          },
        ],
        width: "1280",
        bg: "#111111",
      }),
    ),
    false,
  );
  assert.equal(validDocument("notes", "a".repeat(200001)), false);
});
test("valid legacy design and scene documents remain editable", () => {
  assert.equal(
    validDocument(
      "design",
      JSON.stringify({
        bg: "#ffffff",
        shapes: [
          {
            id: "a",
            type: "text",
            x: 1,
            y: 2,
            w: 30,
            h: 20,
            fill: "#000000",
            text: "Қазақша <script>",
            size: 24,
          },
        ],
      }),
    ),
    true,
  );
  assert.equal(
    validDocument("3d", JSON.stringify({ bg: "#111111", objects: [] })),
    true,
  );
});
test("curriculum IDs are unique, translations complete and answer keys valid", () => {
  const ids = curriculum.flatMap((c) => c.lessons.map((l) => l.id));
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(lessonMap.size, 32);
  for (const c of curriculum) {
    assert.equal(c.title.length, 3);
    for (const l of c.lessons) {
      assert(l.body.every((x) => x.length > 60));
      assert(l.task.every((x) => x.length > 60));
      assert(l.questions.length >= 2);
      for (const q of l.questions) {
        assert(q.q.every(Boolean));
        assert(q.options.every((o) => o.length === 3 && o.every(Boolean)));
        assert(q.answer >= 0 && q.answer < q.options.length);
      }
    }
  }
});
