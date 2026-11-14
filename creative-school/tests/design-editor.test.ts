import test from "node:test";
import assert from "node:assert/strict";
import {
  boundsOf,
  localBounds,
  rotatePoint,
  visualBounds,
  type DesignShape,
} from "../src/features/studio/design-geometry";
const box: DesignShape = {
  id: "box",
  type: "rect",
  x: 100,
  y: 100,
  w: 200,
  h: 100,
  fill: "#ffffff",
};
const close = (actual: number, expected: number) =>
  assert(Math.abs(actual - expected) < 0.0001, `${actual} != ${expected}`);
test("rotated geometry uses visual bounds for snapping and multi-object alignment", () => {
  const visual = visualBounds({ ...box, rot: 90 });
  close(visual.x, 150);
  close(visual.y, 50);
  close(visual.w, 100);
  close(visual.h, 200);
  const total = boundsOf([
    { ...box, rot: 90 },
    { ...box, id: "second", x: 350, y: 80, w: 50, h: 60 },
  ])!;
  close(total.x, 150);
  close(total.y, 50);
  close(total.w, 250);
  close(total.h, 200);
});
test("rotation keeps its pivot and inverse rotation restores a dragged point", () => {
  const pivot = { x: 200, y: 150 },
    point = { x: 300, y: 100 },
    rotated = rotatePoint(point, pivot, 37),
    restored = rotatePoint(rotated, pivot, -37);
  close(restored.x, point.x);
  close(restored.y, point.y);
  assert.deepEqual(rotatePoint(pivot, pivot, 123), pivot);
});
test("multiline text uses intrinsic bounds while legacy zero width/height remain valid", () => {
  const legacy: DesignShape = {
    ...box,
    type: "text",
    w: 0,
    h: 0,
    text: "Қазақша",
    size: 32,
  };
  const one = localBounds(legacy),
    two = localBounds({ ...legacy, text: "Қазақша\nEnglish", lineHeight: 1.5 });
  assert(one.w > 0 && one.h > 0);
  close(two.h, 96);
  assert(two.w >= one.w);
  assert.equal(boundsOf([]), null);
});
