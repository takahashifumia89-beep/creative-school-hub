import test from "node:test";
import assert from "node:assert/strict";
import {
  CommandHistory,
  RingBuffer,
  SnapshotCommand,
} from "../src/engine/history";
import {
  frameRate,
  frameToTicks,
  ticksPerFrame,
  toTicks,
  toSeconds,
  snapToFrame,
  TICKS_PER_SECOND,
} from "../src/engine/time";
import { CompiledTimeline } from "../src/engine/timeline";
import { KeyframeTrack } from "../src/engine/keyframes";
import {
  HalfEdgeMesh,
  applyModifier,
  evaluateModifiers,
  weldMesh,
  meshNormals,
  MeshModifierCache,
  type MeshBuffers,
} from "../src/engine/mesh";
import { baseGeometryFor } from "../src/features/studio/model-geometry";
import {
  sceneSchema,
  type Obj,
  type ModelModifier,
} from "../src/platform/model-schema";
import { videoSchema, imageSchema } from "../src/platform/schema";
import { locateClip, type TimelineClip } from "../src/platform/media-timeline";
const id = () => crypto.randomUUID();
const cube: Obj = {
  id: "cube",
  kind: "box",
  pos: [0, 0, 0],
  rotY: 0,
  scale: 1,
  color: "#ffffff",
};
function box(): MeshBuffers {
  const g = baseGeometryFor(cube),
    p = g.getAttribute("position"),
    ix = g.getIndex()!;
  const result = {
    positions: Float32Array.from(p.array),
    indices: Uint32Array.from(ix.array),
  };
  g.dispose();
  return result;
}
test("transactional commands coalesce gestures, cancel without history and preserve redo boundaries", () => {
  const h = new CommandHistory({ x: 0 }, 3);
  h.begin();
  for (let x = 1; x <= 100; x++) h.update({ x });
  assert(h.end());
  assert.equal(h.past.length, 1);
  assert.equal(h.undo().x, 0);
  assert.equal(h.redo().x, 100);
  h.begin();
  h.update({ x: 500 });
  assert.equal(h.cancel().x, 100);
  assert.equal(h.past.length, 1);
  h.commit({ x: 101 });
  h.commit({ x: 102 });
  h.commit({ x: 103 });
  assert.equal(h.past.length, 3);
  assert.equal(h.undo().x, 102);
  assert.equal(h.undo().x, 101);
  assert.equal(h.undo().x, 100);
  assert.equal(h.undo().x, 100);
  h.commit({ x: 99 });
  assert.equal(h.future.length, 0);
  const merged = new SnapshotCommand(0, 1, "move").mergeWith(
    new SnapshotCommand(1, 3, "move"),
  )!;
  assert.equal(merged.undo(), 0);
  assert.equal(merged.execute(), 3);
  assert.equal(merged.mergeWith(new SnapshotCommand(3, 4, "different")), null);
  const ring = new RingBuffer<number>(2);
  ring.push(1);
  ring.push(2);
  ring.push(3);
  assert.equal(ring.pop(), 3);
  assert.equal(ring.pop(), 2);
  assert.equal(ring.pop(), undefined);
});
test("NTSC frame ticks stay exact for hours and frame snapping is idempotent", () => {
  for (const fps of [23.976, 24, 25, 29.97, 30, 59.94, 60]) {
    const r = frameRate(fps),
      step = ticksPerFrame(r);
    assert(Number.isInteger(step));
    const frames = 108000;
    assert.equal(
      BigInt(frameToTicks(frames, r)),
      (BigInt(frames) * BigInt(TICKS_PER_SECOND) * BigInt(r.den)) /
        BigInt(r.num),
    );
    const s = snapToFrame(3627.123, fps);
    assert.equal(snapToFrame(s, fps), s);
  }
  assert.equal(toSeconds(frameToTicks(108000, frameRate(29.97))), 3603.6);
});
test("compiled integer timeline resolves decimal boundaries and writes into caller-owned state", () => {
  const clips = [
      { start: 0, end: 0.1 },
      { start: 0, end: 0.2 },
      { start: 0, end: 0.3, speed: 2 },
    ],
    timeline = new CompiledTimeline(clips),
    sample = { index: 0, offset: 0, source: 0 };
  assert.equal(timeline.duration, toTicks(0.45));
  assert(timeline.evaluate(toTicks(0.3), sample));
  assert.equal(sample.index, 2);
  assert.equal(sample.offset, toTicks(0.3));
  assert(timeline.evaluate(toTicks(0.4), sample));
  assert.equal(sample.source, toTicks(0.2));
  assert(!timeline.evaluate(toTicks(0.5), sample));
  const legacy = clips.map((c, i) => ({
    ...c,
    id: String(i),
    filename: "x",
    title: "",
    volume: 1,
    duration: 1,
  })) as TimelineClip[];
  assert.equal(locateClip(legacy, 0.3)?.index, 2);
});
test("keyframes interpolate source-time parameters without changing input or allocating output", () => {
  const keys = [
      {
        id: id(),
        tick: toTicks(0),
        zoom: 1,
        panX: 0,
        panY: 0,
        brightness: 100,
        volume: 0,
        interpolation: "smooth" as const,
      },
      {
        id: id(),
        tick: toTicks(2),
        zoom: 3,
        panX: 1,
        panY: -1,
        brightness: 200,
        volume: 1,
        interpolation: "linear" as const,
      },
    ],
    before = JSON.stringify(keys),
    track = new KeyframeTrack({ volume: 1, keyframes: keys }),
    out = new Float64Array(5);
  track.evaluate(toTicks(1), out);
  assert.deepEqual(Array.from(out), [2, 0.5, -0.5, 150, 0.5]);
  track.evaluate(toTicks(-1), out);
  assert.equal(out[0], 1);
  track.evaluate(toTicks(3), out);
  assert.equal(out[0], 3);
  assert.equal(JSON.stringify(keys), before);
  const hold = new KeyframeTrack({
    volume: 1,
    keyframes: [{ ...keys[0], interpolation: "hold" }, keys[1]],
  });
  hold.evaluate(toTicks(1.9), out);
  assert.equal(out[0], 1);
  hold.evaluate(toTicks(2), out);
  assert.equal(out[0], 3);
});
test("half-edge topology provides symmetric adjacency and recognizes boundary/non-manifold meshes", () => {
  const mesh = weldMesh(box()),
    h = new HalfEdgeMesh(mesh);
  assert.equal(mesh.positions.length / 3, 8);
  assert(!h.nonManifold);
  assert(h.twin.every((e) => e >= 0));
  for (let e = 0; e < h.twin.length; e++) assert.equal(h.twin[h.twin[e]], e);
  assert(h.boundary.every((v) => !v));
  const triangle = {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      indices: new Uint32Array([0, 1, 2]),
    },
    open = new HalfEdgeMesh(triangle);
  assert(open.boundary.every(Boolean));
  assert.equal(open.neighborStart[3], 6);
  const bad = new HalfEdgeMesh({
    ...triangle,
    indices: new Uint32Array([0, 1, 2, 0, 1, 2]),
  });
  assert(bad.nonManifold);
});
test("mesh modifiers are ordered, non-destructive, bounded and preserve mirror winding", () => {
  const source = box(),
    original = source.positions.slice();
  const array: ModelModifier = {
      id: id(),
      enabled: true,
      type: "array",
      count: 3,
      offset: [2, 0, 0],
    },
    mirror: ModelModifier = {
      id: id(),
      enabled: true,
      type: "mirror",
      axis: "x",
      offset: 0,
    };
  const a = applyModifier(source, array);
  assert.equal(a.positions.length, source.positions.length * 3);
  assert.equal(a.indices.length, source.indices.length * 3);
  assert(Math.max(...a.positions) > 4);
  const m = applyModifier(source, mirror);
  assert.equal(
    m.indices[source.indices.length + 1],
    source.indices[2] + source.positions.length / 3,
  );
  assert.deepEqual(source.positions, original);
  const first = evaluateModifiers(source, [array, mirror]),
    second = evaluateModifiers(source, [mirror, array]);
  assert.notDeepEqual(first.positions, second.positions);
  const subdiv = applyModifier(source, {
    id: id(),
    enabled: true,
    type: "subdivide",
    levels: 1,
    smooth: true,
  });
  assert.equal(subdiv.indices.length, source.indices.length * 4);
  assert(new HalfEdgeMesh(subdiv).twin.every((e) => e >= 0));
  assert(meshNormals(subdiv).every(Number.isFinite));
  assert.throws(
    () =>
      applyModifier(
        {
          positions: new Float32Array(30000),
          indices: new Uint32Array([0, 1, 2]),
        },
        { ...array, count: 20 },
      ),
    /MESH_BUDGET/,
  );
  assert.strictEqual(
    applyModifier(source, { ...array, enabled: false }),
    source,
  );
});
test("modifier caches reuse upstream geometry and evict to a bounded byte budget", () => {
  const source = box(),
    cache = new MeshModifierCache(10000),
    mod: ModelModifier = {
      id: id(),
      enabled: true,
      type: "array",
      count: 2,
      offset: [2, 0, 0],
    };
  const a = evaluateModifiers(source, [mod], cache, "source");
  assert.strictEqual(evaluateModifiers(source, [mod], cache, "source"), a);
  for (let i = 0; i < 50; i++)
    evaluateModifiers(source, [{ ...mod, offset: [i, 0, 0] }], cache, "source");
  assert(cache.usage <= 10000);
  cache.clear();
  assert.equal(cache.usage, 0);
});
test("schemas retain valid new controls and reject invalid keyframes/modifier settings", () => {
  const video = {
    clips: [
      {
        id: "clip",
        filename: "x",
        start: 0,
        end: 2,
        duration: 2,
        title: "",
        volume: 1,
        keyframes: [
          {
            id: id(),
            tick: 0,
            zoom: 1,
            panX: 0,
            panY: 0,
            brightness: 100,
            volume: 1,
            interpolation: "linear",
          },
        ],
      },
    ],
    width: "720",
    fps: 29.97,
    bg: "#000000",
  };
  assert(videoSchema.safeParse(video).success);
  assert(
    !videoSchema.safeParse({
      ...video,
      clips: [
        {
          ...video.clips[0],
          keyframes: [
            video.clips[0].keyframes[0],
            { ...video.clips[0].keyframes[0], id: id() },
          ],
        },
      ],
    }).success,
  );
  assert(
    sceneSchema.safeParse({
      bg: "#000000",
      objects: [
        {
          ...cube,
          modifiers: [
            {
              id: id(),
              type: "array",
              enabled: true,
              count: 3,
              offset: [2, 0, 0],
            },
          ],
        },
      ],
    }).success,
  );
  assert(
    !sceneSchema.safeParse({
      bg: "#000000",
      objects: [
        {
          ...cube,
          modifiers: [
            {
              id: id(),
              type: "array",
              enabled: true,
              count: 999,
              offset: [2, 0, 0],
            },
          ],
        },
      ],
    }).success,
  );
  assert(
    imageSchema.safeParse({
      filename: "x",
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: false,
      rotation: 0,
      crop: "original",
      linearColor: true,
      exposure: 1,
      toneMap: "aces",
    }).success,
  );
});
