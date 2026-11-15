import {
  CompiledTimeline,
  durationTicks,
  timelineSeconds,
} from "../engine/timeline";
import { toSeconds, toTicks } from "../engine/time";
import { keyframeTrack, type VideoKeyframe } from "../engine/keyframes";
import type { Caption } from "./captions";
export type TimelineClip = {
  keyframes?: VideoKeyframe[];
  audioEQ?: { low: number; mid: number; high: number };
  id: string;
  start: number;
  end: number;
  duration: number;
  filename: string;
  title: string;
  volume: number;
  assetId?: string;
  fade?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  speed?: number;
  fit?: "contain" | "cover";
  zoom?: number;
  panX?: number;
  panY?: number;
  flipX?: boolean;
  flipY?: boolean;
  titleColor?: string;
  titleBackground?: boolean;
  titleSize?: number;
  titlePosition?: "top" | "center" | "bottom";
  titleAlign?: "left" | "center" | "right";
};
export function clipDuration(c: TimelineClip) {
  return toSeconds(durationTicks(c));
}
export function videoDimensions(width: number, aspect = "wide") {
  return aspect === "portrait"
    ? { width: Math.round((width * 9) / 16), height: width }
    : aspect === "square"
      ? { width, height: width }
      : { width, height: Math.round((width * 9) / 16) };
}
export function timelineDuration(clips: TimelineClip[]) {
  return timelineSeconds(clips);
}
const compiledTimelines = new WeakMap<TimelineClip[], CompiledTimeline>();
export function locateClip(clips: TimelineClip[], seconds: number) {
  let timeline = compiledTimelines.get(clips);
  if (!timeline) {
    timeline = new CompiledTimeline(clips);
    compiledTimelines.set(clips, timeline);
  }
  const sample = { index: 0, offset: 0, source: 0 };
  if (!timeline.evaluate(toTicks(seconds), sample)) return null;
  return {
    clip: clips[sample.index],
    index: sample.index,
    offset: toSeconds(sample.offset),
    local: toSeconds(sample.source),
  };
}
export function clipOpacity(clip: TimelineClip, local: number) {
  const length = durationTicks(clip),
    elapsed = Math.round(
      (toTicks(local) - toTicks(clip.start)) / (clip.speed ?? 1),
    ),
    fade = Math.min(toTicks(clip.fade ?? 0), Math.floor(length / 2));
  return fade > 0
    ? Math.max(0, Math.min(1, elapsed / fade, (length - elapsed) / fade))
    : 1;
}
type TextLayout = {
  lines: string[];
  font: string;
  size: number;
  height: number;
};
type ClipPaint = {
  filters: string[];
  title: TextLayout;
  track: ReturnType<typeof keyframeTrack>;
};
type CaptionSpan = { start: number; end: number; layout: TextLayout };
type PaintPlan = {
  project: unknown;
  width: number;
  height: number;
  clips: Map<TimelineClip, ClipPaint>;
  captions: CaptionSpan[];
  values: Float64Array;
};
const paintPlans = new WeakMap<HTMLCanvasElement, PaintPlan>();
function textLayout(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  width: number,
): TextLayout {
  const font = `600 ${size}px Inter,Arial,sans-serif`,
    lines: string[] = [];
  ctx.font = font;
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > width * 0.9 && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  if (lines.length > 6) lines.length = 6;
  return { lines, font, size, height: lines.length * size * 1.3 };
}
export function prepareVideoFrame(
  canvas: HTMLCanvasElement,
  project: { clips: TimelineClip[]; captions?: Caption[] },
) {
  const cached = paintPlans.get(canvas);
  if (
    cached?.project === project &&
    cached.width === canvas.width &&
    cached.height === canvas.height
  )
    return cached;
  const ctx = canvas.getContext("2d")!;
  const plan: PaintPlan = {
    project,
    width: canvas.width,
    height: canvas.height,
    clips: new Map(),
    captions: [],
    values: new Float64Array(5),
  };
  for (const c of project.clips) {
    const filters = new Array<string>(201);
    for (let b = 0; b <= 200; b++)
      filters[b] =
        `brightness(${b}%) contrast(${c.contrast ?? 100}%) saturate(${c.saturation ?? 100}%)`;
    plan.clips.set(c, {
      filters,
      title: textLayout(
        ctx,
        c.title,
        ((c.titleSize ?? 44) * canvas.width) / 1280,
        canvas.width,
      ),
      track: keyframeTrack(c),
    });
  }
  const captions = project.captions ?? [],
    times = [
      ...new Set(captions.flatMap((c) => [toTicks(c.start), toTicks(c.end)])),
    ].sort((a, b) => a - b);
  for (let i = 0; i < times.length - 1; i++) {
    const text = captions
      .filter((c) => times[i] >= toTicks(c.start) && times[i] < toTicks(c.end))
      .map((c) => c.text)
      .join("\n");
    if (text)
      plan.captions.push({
        start: times[i],
        end: times[i + 1],
        layout: textLayout(ctx, text, canvas.width / 26, canvas.width),
      });
  }
  paintPlans.set(canvas, plan);
  return plan;
}
function drawLayout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  l: TextLayout,
  y: number,
  color: string,
  background: boolean,
  align: CanvasTextAlign,
) {
  if (!l.lines.length) return;
  ctx.font = l.font;
  const size = l.size,
    top = Math.max(
      size * 0.4,
      Math.min(canvas.height - l.height - size * 0.4, y - l.height / 2),
    );
  if (background) {
    ctx.fillStyle = "rgba(0,0,0,.68)";
    ctx.fillRect(
      canvas.width * 0.02,
      top - size * 0.3,
      canvas.width * 0.96,
      l.height + size * 0.6,
    );
  }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  const x =
    align === "center"
      ? canvas.width / 2
      : align === "right"
        ? canvas.width * 0.95
        : canvas.width * 0.05;
  for (let i = 0; i < l.lines.length; i++)
    ctx.fillText(l.lines[i], x, top + i * size * 1.3, canvas.width * 0.9);
  ctx.textAlign = "left";
}
export function paintVideoFrame(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement | null,
  clip: TimelineClip | null,
  local: number,
  bg: string,
  project?: { clips: TimelineClip[]; captions?: Caption[] },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.globalAlpha = 1;
  ctx.filter = "none";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!video || !clip || video.readyState < 2 || !video.videoWidth) return;
  let plan = paintPlans.get(canvas);
  if (
    !plan ||
    plan.project !== (project ?? clip) ||
    plan.width !== canvas.width ||
    plan.height !== canvas.height
  ) {
    plan = prepareVideoFrame(canvas, project ?? { clips: [clip] });
    if (!project) plan.project = clip;
  }
  const style = plan.clips.get(clip);
  if (!style) return;
  style.track.evaluate(toTicks(local), plan.values);
  const p = plan.values,
    scale =
      (clip.fit === "cover" ? Math.max : Math.min)(
        canvas.width / video.videoWidth,
        canvas.height / video.videoHeight,
      ) * p[0],
    w = video.videoWidth * scale,
    h = video.videoHeight * scale;
  ctx.globalAlpha = clipOpacity(clip, local);
  ctx.filter = style.filters[Math.max(0, Math.min(200, Math.round(p[3])))];
  ctx.save();
  ctx.translate(
    canvas.width / 2 + p[1] * canvas.width * 0.5,
    canvas.height / 2 + p[2] * canvas.height * 0.5,
  );
  ctx.scale(clip.flipX ? -1 : 1, clip.flipY ? -1 : 1);
  ctx.drawImage(video, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.filter = "none";
  let at = toTicks((local - clip.start) / (clip.speed ?? 1));
  if (project)
    for (let i = 0; i < project.clips.length; i++) {
      const c = project.clips[i];
      if (c.id === clip.id) break;
      at += durationTicks(c);
    }
  let caption: TextLayout | null = null,
    left = 0,
    right = plan.captions.length;
  while (left < right) {
    const m = (left + right) >>> 1;
    if (plan.captions[m].end <= at) left = m + 1;
    else right = m;
  }
  if (left < plan.captions.length && at >= plan.captions[left].start)
    caption = plan.captions[left].layout;
  if (clip.title) {
    const y =
      clip.titlePosition === "top"
        ? 0.12
        : clip.titlePosition === "center"
          ? 0.5
          : caption
            ? 0.72
            : 0.88;
    drawLayout(
      ctx,
      canvas,
      style.title,
      canvas.height * y,
      clip.titleColor ?? "#ffffff",
      clip.titleBackground !== false,
      clip.titleAlign ?? "left",
    );
  }
  ctx.globalAlpha = 1;
  if (caption)
    drawLayout(
      ctx,
      canvas,
      caption,
      canvas.height * 0.92,
      "#ffffff",
      true,
      "center",
    );
}
export async function mediaReady(
  element: HTMLMediaElement,
  signal?: AbortSignal,
  timeout = 15000,
) {
  if (element.readyState >= 1) return;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      element.removeEventListener("loadedmetadata", ok);
      element.removeEventListener("error", bad);
      signal?.removeEventListener("abort", abort);
    };
    const ok = () => {
        cleanup();
        resolve();
      },
      bad = () => {
        cleanup();
        reject(Error("DECODE"));
      },
      abort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };
    const timer = setTimeout(() => {
      cleanup();
      reject(Error("TIMEOUT"));
    }, timeout);
    element.addEventListener("loadedmetadata", ok, { once: true });
    element.addEventListener("error", bad, { once: true });
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}
export async function seekMedia(
  element: HTMLMediaElement,
  time: number,
  signal?: AbortSignal,
) {
  if (Math.abs(element.currentTime - time) < 0.015 && element.readyState >= 2)
    return;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      element.removeEventListener("seeked", done);
      element.removeEventListener("loadeddata", data);
      element.removeEventListener("error", bad);
      signal?.removeEventListener("abort", abort);
    };
    const done = () => {
        cleanup();
        resolve();
      },
      data = () => {
        if (Math.abs(element.currentTime - time) < 0.02) done();
      },
      bad = () => {
        cleanup();
        reject(Error("DECODE"));
      },
      abort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };
    const timer = setTimeout(() => {
      cleanup();
      reject(Error("TIMEOUT"));
    }, 10000);
    element.addEventListener("seeked", done, { once: true });
    element.addEventListener("loadeddata", data);
    element.addEventListener("error", bad, { once: true });
    signal?.addEventListener("abort", abort, { once: true });
    element.currentTime = Math.max(0, time);
    if (signal?.aborted) abort();
  });
}
