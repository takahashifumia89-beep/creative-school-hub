import test from "node:test";
import assert from "node:assert/strict";
import {
  visualBounds,
  boundsOf,
  localBounds,
  type DesignShape,
} from "../src/features/studio/design-geometry";
import {
  parseOBJ,
  editableGeometry,
  sceneForExport,
} from "../src/features/studio/model-geometry";
import { sceneSchema, type Obj } from "../src/platform/model-schema";
import {
  imageGeometry,
  normalizeCrop,
  type ImageSettings,
} from "../src/platform/media-image";
import {
  timelineDuration,
  locateClip,
  clipOpacity,
  type TimelineClip,
} from "../src/platform/media-timeline";
const close = (actual: number, expected: number) =>
  assert(Math.abs(actual - expected) < 0.00001, `${actual} != ${expected}`);
const box: Obj = {
  id: "box",
  kind: "box",
  pos: [2, 3, 4],
  rotY: 90,
  scale: 2,
  color: "#ffaa00",
};
test("rotated selections use visual bounds and multiline text has full height", () => {
  const shape: DesignShape = {
    id: "a",
    type: "rect",
    x: 0,
    y: 0,
    w: 100,
    h: 50,
    rot: 90,
    fill: "#000000",
  };
  const b = visualBounds(shape);
  close(b.x, 25);
  close(b.y, -25);
  close(b.w, 50);
  close(b.h, 100);
  const combined = boundsOf([shape, { ...shape, id: "b", rot: 0, x: 150 }])!;
  close(combined.x, 25);
  close(combined.w, 225);
  const text = localBounds({
    ...shape,
    type: "text",
    text: "First\nSecond\nThird",
    size: 20,
    lineHeight: 1.2,
  });
  close(text.h, 72);
});
test("OBJ importer triangulates local geometry and rejects broken face references", () => {
  const mesh = parseOBJ(
    "mtllib https://untrusted.example/remote.mtl\nv 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf -4 -3 -2 -1 # quad",
  );
  assert.deepEqual(mesh.indices, [0, 1, 2, 0, 2, 3]);
  assert.equal(mesh.vertices?.length, 12);
  assert.throws(() => parseOBJ("v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 4"));
  assert.throws(() => parseOBJ("v NaN 0 0\nf 1 2 3"));
});
test("primitive conversion welds shared vertices and export preserves scene transforms", () => {
  const mesh = editableGeometry(box);
  assert.equal(mesh.vertices?.length, 24);
  assert.equal(mesh.indices?.length, 36);
  const scene = sceneForExport({
    bg: "#ffffff",
    objects: [box, { ...box, id: "hidden", hidden: true }],
  });
  assert.equal(scene.children.length, 1);
  close(scene.children[0].position.x, 2);
  close(scene.children[0].position.y, 3);
  close(scene.children[0].scale.x, 2);
  scene.traverse((o: any) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });
});
test("mesh schema refuses invalid indices instead of allowing a broken editor document", () => {
  const valid = {
    ...box,
    kind: "mesh",
    vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0],
    indices: [0, 1, 2],
  };
  assert(sceneSchema.safeParse({ bg: "#ffffff", objects: [valid] }).success);
  assert(
    !sceneSchema.safeParse({
      bg: "#ffffff",
      objects: [{ ...valid, indices: [0, 1, 3] }],
    }).success,
  );
});
test("manual crops remain inside the image and export keeps aspect ratio below 4096px", () => {
  const crop = normalizeCrop({ x: 0.9, y: -2, w: 0.5, h: 3 });
  close(crop.x, 0.9);
  close(crop.y, 0);
  close(crop.w, 0.1);
  close(crop.h, 1);
  const settings: ImageSettings = {
    filename: "source",
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    rotation: 90,
    crop: "original",
    exportWidth: 4096,
  };
  const portrait = imageGeometry(4000, 2000, settings);
  assert.equal(portrait.exportWidth, 2048);
  assert.equal(portrait.exportHeight, 4096);
  const square = imageGeometry(4000, 2000, {
    ...settings,
    rotation: 0,
    crop: "square",
    exportWidth: 1024,
  });
  assert.equal(square.exportWidth, 1024);
  assert.equal(square.exportHeight, 1024);
});
test("timeline seeks across trimmed clips and fade opacity agrees with source time", () => {
  const a: TimelineClip = {
      id: "a",
      filename: "a",
      start: 2,
      end: 5,
      duration: 10,
      title: "",
      volume: 1,
      fade: 2,
    },
    b = { ...a, id: "b", start: 7, end: 9 };
  assert.equal(timelineDuration([a, b]), 5);
  assert.equal(locateClip([a, b], 3)?.clip.id, "b");
  assert.equal(locateClip([a, b], 3)?.local, 7);
  assert.equal(locateClip([a, b], 5)?.local, 9);
  assert.equal(locateClip([a, b], 5.1), null);
  close(clipOpacity(a, 2), 0);
  close(clipOpacity(a, 3.5), 1);
  close(clipOpacity(a, 5), 0);
});
