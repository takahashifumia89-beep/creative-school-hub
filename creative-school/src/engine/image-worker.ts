/// <reference lib="webworker" />
import {
  renderImage,
  type ImageSettings,
  type RasterWorkspace,
} from "../platform/media-image";
import { TiledColorRenderer, type ColorSettings } from "./image-color";
type Settings = ImageSettings & ColorSettings;
let original: ImageBitmap | null = null,
  sourceGeneration = 0;
const base = new OffscreenCanvas(1, 1),
  result = new OffscreenCanvas(1, 1),
  workspace: RasterWorkspace = { stage: new OffscreenCanvas(1, 1) };
let cachedGeometry = "",
  colorRenderer: TiledColorRenderer | null = null,
  gpuAttempted = false;
const bins = new Uint32Array(256 * 4),
  analysis = new OffscreenCanvas(1, 1);
function cpuColor(canvas: OffscreenCanvas, s: Settings, compare: boolean) {
  const ctx = canvas.getContext("2d")!,
    image = ctx.getImageData(0, 0, canvas.width, canvas.height),
    d = image.data,
    w = canvas.width,
    h = canvas.height;
  const linear = (n: number) =>
    n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  const srgb = (n: number) =>
    255 *
    (n <= 0.0031308 ? 12.92 * n : 1.055 * Math.max(0, n) ** (1 / 2.4) - 0.055);
  const exposure = 2 ** (compare ? 0 : (s.exposure ?? 0)),
    temperature = compare ? 0 : (s.temperature ?? 0),
    tint = compare ? 0 : (s.tint ?? 0),
    vignette = compare ? 0 : (s.vignette ?? 0) / 100;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      let r = linear(d[i] / 255) * exposure * (1 + temperature * 0.003),
        g = linear(d[i + 1] / 255) * exposure * (1 + tint * 0.003),
        b = linear(d[i + 2] / 255) * exposure * (1 - temperature * 0.003);
      if (s.linearColor && !compare) {
        r = (((r * s.brightness) / 100 - 0.18) * s.contrast) / 100 + 0.18;
        g = (((g * s.brightness) / 100 - 0.18) * s.contrast) / 100 + 0.18;
        b = (((b * s.brightness) / 100 - 0.18) * s.contrast) / 100 + 0.18;
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b,
          sat = s.grayscale ? 0 : s.saturation / 100;
        r = l + (r - l) * sat;
        g = l + (g - l) * sat;
        b = l + (b - l) * sat;
        const sep = (s.sepia ?? 0) / 100,
          rr = 0.393 * r + 0.769 * g + 0.189 * b,
          gg = 0.349 * r + 0.686 * g + 0.168 * b,
          bb = 0.272 * r + 0.534 * g + 0.131 * b;
        r += (rr - r) * sep;
        g += (gg - g) * sep;
        b += (bb - b) * sep;
      }
      let v = Math.max(
        0,
        Math.min(
          1,
          (Math.hypot((x + 0.5) / w - 0.5, (y + 0.5) / h - 0.5) - 0.15) / 0.57,
        ),
      );
      v = 1 - vignette * v * v * (3 - 2 * v);
      r = Math.max(0, r * v);
      g = Math.max(0, g * v);
      b = Math.max(0, b * v);
      if (!compare && s.toneMap === "aces") {
        r = (r * (2.51 * r + 0.03)) / (r * (2.43 * r + 0.59) + 0.14);
        g = (g * (2.51 * g + 0.03)) / (g * (2.43 * g + 0.59) + 0.14);
        b = (b * (2.51 * b + 0.03)) / (b * (2.43 * b + 0.59) + 0.14);
      }
      d[i] = srgb(Math.min(1, r));
      d[i + 1] = srgb(Math.min(1, g));
      d[i + 2] = srgb(Math.min(1, b));
    }
  ctx.putImageData(image, 0, 0);
}
function render(
  s: Settings,
  maxPreview: number | undefined,
  compare = false,
  ignoreCrop = false,
) {
  if (!original) throw Error("SOURCE_MISSING");
  const started = performance.now(),
    linear = !!s.linearColor;
  // Color-only edits reuse the oriented and cropped source stage.
  const key = JSON.stringify([
    original.width,
    original.height,
    s.rotation,
    s.flipX,
    s.flipY,
    s.crop,
    s.cropRect,
    s.exportWidth,
    maxPreview,
    ignoreCrop,
    linear ? 0 : s.brightness,
    linear ? 0 : s.contrast,
    linear ? 0 : s.saturation,
    linear ? false : s.grayscale,
    linear ? 0 : s.sepia,
    linear ? 0 : s.blur,
    compare,
  ]);
  if (key !== cachedGeometry) {
    renderImage(
      base,
      original,
      {
        ...s,
        brightness: linear ? 100 : s.brightness,
        contrast: linear ? 100 : s.contrast,
        saturation: linear ? 100 : s.saturation,
        grayscale: linear ? false : s.grayscale,
        sepia: linear ? 0 : s.sepia,
        blur: linear ? 0 : s.blur,
      },
      { compare, maxPreview, ignoreCrop, workspace },
    );
    cachedGeometry = key;
  }
  const color =
    linear ||
    !!(
      s.exposure ||
      s.temperature ||
      s.tint ||
      s.vignette ||
      s.toneMap === "aces"
    );
  if (!color || compare) {
    result.width = base.width;
    result.height = base.height;
    result.getContext("2d")!.drawImage(base, 0, 0);
  } else {
    if (!gpuAttempted) {
      gpuAttempted = true;
      try {
        colorRenderer = new TiledColorRenderer();
        if (!colorRenderer.floatingPoint) {
          colorRenderer.dispose();
          colorRenderer = null;
        }
      } catch {
        colorRenderer = null;
      }
    }
    try {
      if (!colorRenderer) throw Error("CPU");
      colorRenderer.render(base, result, s, compare);
    } catch {
      colorRenderer?.dispose();
      colorRenderer = null;
      result.width = base.width;
      result.height = base.height;
      const fallback = result.getContext("2d")!;
      fallback.filter = s.linearColor && s.blur ? `blur(${s.blur}px)` : "none";
      fallback.drawImage(base, 0, 0);
      fallback.filter = "none";
      cpuColor(result, s, compare);
    }
  }
  return {
    ms: performance.now() - started,
    renderer: colorRenderer
      ? colorRenderer.floatingPoint
        ? "WebGL2 · float16"
        : "WebGL2 · 8-bit"
      : "CPU worker",
    width: result.width,
    height: result.height,
  };
}
self.onmessage = async ({ data }) => {
  const { id, kind } = data;
  try {
    if (kind === "load") {
      const seq = ++sourceGeneration,
        blob = data.blob as Blob;
      if (blob.size > 20 * 1048576) throw Error("SOURCE_SIZE");
      const bitmap = await createImageBitmap(blob);
      if (bitmap.width * bitmap.height > 40_000_000) {
        bitmap.close();
        throw Error("PIXELS");
      }
      if (seq !== sourceGeneration) {
        bitmap.close();
        throw Error("SUPERSEDED");
      }
      original?.close();
      original = bitmap;
      cachedGeometry = "";
      self.postMessage({ id, width: bitmap.width, height: bitmap.height });
    } else if (kind === "preview") {
      const info = render(
        data.settings,
        data.maxPreview ?? 1400,
        data.compare,
        data.ignoreCrop,
      );
      bins.fill(0);
      const ctx = result.getContext("2d")!;
      // Read a bounded analysis copy so histogram work is independent of export size.
      const scale = Math.min(1, 256 / Math.max(result.width, result.height)),
        aw = Math.max(1, Math.round(result.width * scale)),
        ah = Math.max(1, Math.round(result.height * scale));
      if (analysis.width !== aw) analysis.width = aw;
      if (analysis.height !== ah) analysis.height = ah;
      const a = analysis.getContext("2d")!;
      a.drawImage(result, 0, 0, analysis.width, analysis.height);
      const pixels = a.getImageData(0, 0, analysis.width, analysis.height).data;
      for (let i = 0; i < pixels.length; i += 4) {
        if (!pixels[i + 3]) continue;
        bins[pixels[i]]++;
        bins[256 + pixels[i + 1]]++;
        bins[512 + pixels[i + 2]]++;
        bins[
          768 +
            Math.round(
              0.2126 * pixels[i] +
                0.7152 * pixels[i + 1] +
                0.0722 * pixels[i + 2],
            )
        ]++;
      }
      const histogram = bins.slice(),
        bitmap = result.transferToImageBitmap();
      self.postMessage({ id, ...info, bitmap, histogram }, [
        bitmap,
        histogram.buffer,
      ]);
    } else if (kind === "export") {
      const info = render(data.settings, undefined);
      const ctx = result.getContext("2d")!;
      if (data.format === "jpeg") {
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, result.width, result.height);
        ctx.globalCompositeOperation = "source-over";
      }
      const blob = await result.convertToBlob({
        type: `image/${data.format}`,
        quality: data.quality ?? 0.92,
      });
      self.postMessage({ id, ...info, blob });
    } else if (kind === "dispose") {
      sourceGeneration++;
      original?.close();
      original = null;
      colorRenderer?.dispose();
      colorRenderer = null;
      workspace.stage.width = 1;
      base.width = 1;
      result.width = 1;
      self.postMessage({ id });
    } else throw Error("WORKER_JOB");
  } catch (e) {
    self.postMessage({
      id,
      error: e instanceof Error ? e.message : "IMAGE_WORKER",
    });
  }
};
