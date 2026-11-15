import type { Caption } from "./captions";
export type TimelineClip = {
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
  return Math.max(0, c.end - c.start) / (c.speed ?? 1);
}
export function videoDimensions(width: number, aspect = "wide") {
  return aspect === "portrait"
    ? { width: Math.round((width * 9) / 16), height: width }
    : aspect === "square"
      ? { width, height: width }
      : { width, height: Math.round((width * 9) / 16) };
}
export function timelineDuration(clips: TimelineClip[]) {
  return clips.reduce((n, c) => n + clipDuration(c), 0);
}
export function locateClip(clips: TimelineClip[], seconds: number) {
  let offset = 0;
  for (let index = 0; index < clips.length; index++) {
    const clip = clips[index],
      length = clipDuration(clip);
    if (
      seconds < offset + length ||
      (index === clips.length - 1 && seconds <= offset + length + 0.00001)
    )
      return {
        clip,
        index,
        offset,
        local:
          clip.start +
          Math.max(0, Math.min(length, seconds - offset)) * (clip.speed ?? 1),
      };
    offset += length;
  }
  return null;
}
export function clipOpacity(clip: TimelineClip, local: number) {
  const length = clipDuration(clip),
    elapsed = (local - clip.start) / (clip.speed ?? 1),
    fade = Math.min(clip.fade ?? 0, length / 2);
  return fade > 0
    ? Math.max(0, Math.min(1, elapsed / fade, (length - elapsed) / fade))
    : 1;
}
function drawText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  size: number,
  y: number,
  color: string,
  background: boolean,
  align: "left" | "center" | "right" = "left",
) {
  const max = canvas.width * 0.9,
    lines: string[] = [];
  ctx.font = `600 ${size}px Inter,Arial,sans-serif`;
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > max && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  const shown = lines.slice(0, 6),
    height = shown.length * size * 1.3,
    top = Math.max(
      size * 0.4,
      Math.min(canvas.height - height - size * 0.4, y - height / 2),
    );
  if (background) {
    ctx.fillStyle = "rgba(0,0,0,.68)";
    ctx.fillRect(
      canvas.width * 0.02,
      top - size * 0.3,
      canvas.width * 0.96,
      height + size * 0.6,
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
  shown.forEach((line, i) => ctx.fillText(line, x, top + i * size * 1.3, max));
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
  const scale =
      (clip.fit === "cover" ? Math.max : Math.min)(
        canvas.width / video.videoWidth,
        canvas.height / video.videoHeight,
      ) * (clip.zoom ?? 1),
    w = video.videoWidth * scale,
    h = video.videoHeight * scale;
  ctx.globalAlpha = clipOpacity(clip, local);
  ctx.filter = `brightness(${clip.brightness ?? 100}%) contrast(${clip.contrast ?? 100}%) saturate(${clip.saturation ?? 100}%)`;
  ctx.save();
  ctx.translate(
    canvas.width / 2 + (clip.panX ?? 0) * canvas.width * 0.5,
    canvas.height / 2 + (clip.panY ?? 0) * canvas.height * 0.5,
  );
  ctx.scale(clip.flipX ? -1 : 1, clip.flipY ? -1 : 1);
  ctx.drawImage(video, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.filter = "none";
  let at = (local - clip.start) / (clip.speed ?? 1);
  if (project) {
    for (const c of project.clips) {
      if (c.id === clip.id) break;
      at += clipDuration(c);
    }
  }
  const caption = project?.captions
    ?.filter((c) => at >= c.start && at < c.end)
    .map((c) => c.text)
    .join("\n");
  if (clip.title) {
    const y =
      clip.titlePosition === "top"
        ? 0.12
        : clip.titlePosition === "center"
          ? 0.5
          : caption
            ? 0.72
            : 0.88;
    drawText(
      ctx,
      canvas,
      clip.title,
      ((clip.titleSize ?? 44) * canvas.width) / 1280,
      canvas.height * y,
      clip.titleColor ?? "#ffffff",
      clip.titleBackground !== false,
      clip.titleAlign ?? "left",
    );
  }
  ctx.globalAlpha = 1;
  if (caption)
    drawText(
      ctx,
      canvas,
      caption,
      canvas.width / 26,
      canvas.height * 0.92,
      "#ffffff",
      true,
      "center",
    );
  ctx.globalAlpha = 1;
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
