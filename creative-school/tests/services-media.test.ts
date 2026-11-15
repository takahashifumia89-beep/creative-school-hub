import test from "node:test";
import assert from "node:assert/strict";
import { canTransitionOrder, offerSchema } from "../src/platform/services";
import { parseCaptions, captionsToSrt } from "../src/platform/captions";
import {
  clipDuration,
  timelineDuration,
  locateClip,
  videoDimensions,
  clipOpacity,
} from "../src/platform/media-timeline";
import { validDocument } from "../src/platform/schema";
import { polygonPoints } from "../src/features/studio/design-geometry";
test("service transitions distinguish buyer and seller and close terminal requests", () => {
  assert(canTransitionOrder("pending", "accepted", true));
  assert(!canTransitionOrder("pending", "accepted", false));
  assert(canTransitionOrder("delivered", "completed", false));
  assert(!canTransitionOrder("delivered", "completed", true));
  assert(!canTransitionOrder("in_progress", "cancelled", false));
  for (const status of ["completed", "declined", "cancelled"])
    for (const next of [
      "pending",
      "accepted",
      "in_progress",
      "delivered",
      "completed",
    ])
      assert(!canTransitionOrder(status, next, true));
  assert(!offerSchema.safeParse({ title: "Bad", price: -1 }).success);
});
test("speed-aware timeline maps boundaries, duration and fades consistently", () => {
  const a = {
    id: "a",
    filename: "a",
    start: 2,
    end: 10,
    duration: 10,
    title: "",
    volume: 1,
    speed: 2,
    fade: 1,
  };
  const b = { ...a, id: "b", start: 0, end: 4, speed: 0.5 };
  assert.equal(clipDuration(a), 4);
  assert.equal(timelineDuration([a, b]), 12);
  assert.equal(locateClip([a, b], 1)?.local, 4);
  assert.equal(locateClip([a, b], 4)?.clip.id, "b");
  assert.equal(locateClip([a, b], 6)?.local, 1);
  assert.equal(clipOpacity(a, 3), 0.5);
  assert.deepEqual(videoDimensions(1280, "portrait"), {
    width: 720,
    height: 1280,
  });
  assert.deepEqual(videoDimensions(720, "square"), { width: 720, height: 720 });
});
test("caption import and SRT export preserve multilingual timing and reject invalid cues", () => {
  const cues = parseCaptions(
    "WEBVTT\n\n00:01.250 --> 00:03.500\n<b>Қазақша</b>\nВторая строка\n\n2\n00:00:04,000 --> 00:00:05,000\nEnglish",
  );
  assert.equal(cues.length, 2);
  assert.equal(cues[0].start, 1.25);
  assert.equal(cues[0].text, "Қазақша\nВторая строка");
  const back = parseCaptions(captionsToSrt(cues));
  assert.equal(back[0].end, 3.5);
  assert.equal(back[1].text, "English");
  assert.throws(() => parseCaptions("1\n00:00:03,000 --> 00:00:01,000\nBad"));
  assert.throws(() => parseCaptions("wrong"));
});
test("new shapes, gradients and video settings persist within validated documents", () => {
  for (const type of [
    "heart",
    "bubble",
    "chevron",
    "double-arrow",
    "lightning",
    "semicircle",
    "crescent",
    "shield",
    "tag",
    "bookmark",
    "pin",
    "burst",
    "polygon",
    "gear",
  ] as const) {
    const shape = {
      id: "s",
      type,
      x: 10,
      y: 20,
      w: 150,
      h: 80,
      fill: "#112233",
      fill2: "#ffffff",
      gradientAngle: 45,
      strokeDash: "dashed",
      polygonSides: 9,
    };
    assert(
      validDocument(
        "design",
        JSON.stringify({ bg: "#ffffff", shapes: [shape] }),
      ),
    );
    const points = polygonPoints(shape)
      .split(" ")
      .map((p) => p.split(",").map(Number));
    assert(points.length >= 3);
    assert(points.flat().every(Number.isFinite));
    assert(Math.abs(Math.max(...points.map((p) => p[0])) - 160) < 0.001);
    assert(Math.abs(Math.min(...points.map((p) => p[1])) - 20) < 0.001);
  }
  assert(
    validDocument(
      "video",
      JSON.stringify({
        width: "720",
        aspect: "portrait",
        fps: 24,
        bg: "#000000",
        clips: [
          {
            id: "a",
            filename: "a",
            start: 0,
            end: 3,
            duration: 3,
            title: "Hi",
            volume: 1,
            speed: 2,
            fit: "cover",
            titleColor: "#ff0000",
          },
        ],
        captions: parseCaptions("1\n00:00:00,000 --> 00:00:01,000\nHello"),
      }),
    ),
  );
});
