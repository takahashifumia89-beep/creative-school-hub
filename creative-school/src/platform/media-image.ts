/** Geometry and raster rendering shared by image preview and export. */
export type CropRect = { x: number; y: number; w: number; h: number };
export type CropPreset = "original" | "square" | "wide" | "portrait";
export type ImageSettings = {
  filename: string;
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  rotation: number;
  crop: CropPreset;
  flipX?: boolean;
  flipY?: boolean;
  sepia?: number;
  blur?: number;
  cropRect?: CropRect;
  exportWidth?: number;
};
export type ImageSource = CanvasImageSource & {
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
  videoWidth?: number;
  videoHeight?: number;
};
export type RasterCanvas = HTMLCanvasElement | OffscreenCanvas;
export type RasterWorkspace = { stage: RasterCanvas };
export const rasterCanvas = (w = 1, h = 1): RasterCanvas => {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
export type ImageRenderOptions = {
  workspace?: RasterWorkspace;
  /** Compare keeps the same geometry; only color/filter adjustments are bypassed. */
  compare?: boolean;
  /** Cap preview's longest side independently from the intended export size. */
  maxPreview?: number;
  /** Show the full oriented frame while positioning a manual crop. */
  ignoreCrop?: boolean;
};
export type ImageGeometry = {
  orientedWidth: number;
  orientedHeight: number;
  cropRect: CropRect;
  exportWidth: number;
  exportHeight: number;
};
export type RenderedImage = ImageGeometry & { width: number; height: number };

const MAX_EDGE = 4096;
const MIN_CROP = 0.001;
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
const rotationOf = (rotation: number) =>
  (((Number.isFinite(rotation) ? rotation : 0) % 360) + 360) % 360;

/** Rotation is clockwise, matching Canvas and the editor's 90-degree control. */
export function orientedDimensions(
  sourceWidth: number,
  sourceHeight: number,
  rotation: number,
): { width: number; height: number } {
  const w = Math.max(1, Number.isFinite(sourceWidth) ? sourceWidth : 1);
  const h = Math.max(1, Number.isFinite(sourceHeight) ? sourceHeight : 1);
  const angle = (rotationOf(rotation) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  return {
    width: Math.max(1, Math.ceil(w * cos + h * sin - 1e-9)),
    height: Math.max(1, Math.ceil(w * sin + h * cos - 1e-9)),
  };
}

/** Constrain a normalized crop entirely inside the oriented source frame. */
export function normalizeCrop(rect: CropRect): CropRect {
  const x = clamp(rect.x, 0, 1 - MIN_CROP);
  const y = clamp(rect.y, 0, 1 - MIN_CROP);
  return {
    x,
    y,
    w: clamp(rect.w, MIN_CROP, 1 - x),
    h: clamp(rect.h, MIN_CROP, 1 - y),
  };
}

export function presetCrop(
  sourceWidth: number,
  sourceHeight: number,
  rotation: number,
  preset: CropPreset,
): CropRect {
  const { width, height } = orientedDimensions(
    sourceWidth,
    sourceHeight,
    rotation,
  );
  if (preset === "original") return { x: 0, y: 0, w: 1, h: 1 };
  const ratio = preset === "square" ? 1 : preset === "wide" ? 16 / 9 : 9 / 16;
  if (width / height > ratio) {
    const w = (height * ratio) / width;
    return { x: (1 - w) / 2, y: 0, w, h: 1 };
  }
  const h = width / ratio / height;
  return { x: 0, y: (1 - h) / 2, w: 1, h };
}

export function imageGeometry(
  sourceWidth: number,
  sourceHeight: number,
  settings: ImageSettings,
  ignoreCrop = false,
): ImageGeometry {
  const dimensions = orientedDimensions(
    sourceWidth,
    sourceHeight,
    settings.rotation,
  );
  const cropRect = ignoreCrop
    ? { x: 0, y: 0, w: 1, h: 1 }
    : settings.cropRect
      ? normalizeCrop(settings.cropRect)
      : presetCrop(sourceWidth, sourceHeight, settings.rotation, settings.crop);
  const naturalWidth = dimensions.width * cropRect.w;
  const naturalHeight = dimensions.height * cropRect.h;
  const targetWidth = settings.exportWidth
    ? clamp(settings.exportWidth, 16, MAX_EDGE)
    : naturalWidth;
  const requestedScale = targetWidth / naturalWidth;
  const scale = Math.min(
    requestedScale,
    MAX_EDGE / naturalWidth,
    MAX_EDGE / naturalHeight,
  );
  return {
    orientedWidth: dimensions.width,
    orientedHeight: dimensions.height,
    cropRect,
    exportWidth: Math.max(1, Math.round(naturalWidth * scale)),
    exportHeight: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

function sourceDimensions(source: ImageSource) {
  const width = source.naturalWidth || source.videoWidth || source.width;
  const height = source.naturalHeight || source.videoHeight || source.height;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  )
    throw new Error("IMAGE_NOT_READY");
  return { width, height };
}

/**
 * Preview and export share the exact crop/transform/filter path. Temporary raster
 * memory is bounded at 4096 on its longest side, even for very large originals.
 * Export dimensions are returned separately when a preview cap is requested.
 */
export function renderImage(
  canvas: RasterCanvas,
  source: ImageSource,
  settings: ImageSettings,
  options: ImageRenderOptions = {},
): RenderedImage {
  const sourceSize = sourceDimensions(source);
  const geometry = imageGeometry(
    sourceSize.width,
    sourceSize.height,
    settings,
    options.ignoreCrop,
  );
  const stageScale = Math.min(
    1,
    MAX_EDGE / geometry.orientedWidth,
    MAX_EDGE / geometry.orientedHeight,
  );
  const stage = options.workspace?.stage ?? rasterCanvas();
  stage.width = Math.max(1, Math.round(geometry.orientedWidth * stageScale));
  stage.height = Math.max(1, Math.round(geometry.orientedHeight * stageScale));
  const stageContext = stage.getContext("2d");
  const context = canvas.getContext("2d");
  if (!stageContext || !context) throw new Error("CANVAS_UNAVAILABLE");
  try {
    stageContext.save();
    stageContext.translate(stage.width / 2, stage.height / 2);
    stageContext.scale(
      stageScale * (settings.flipX ? -1 : 1),
      stageScale * (settings.flipY ? -1 : 1),
    );
    stageContext.rotate((rotationOf(settings.rotation) * Math.PI) / 180);
    stageContext.filter = options.compare
      ? "none"
      : `brightness(${clamp(settings.brightness, 0, 200)}%) contrast(${clamp(settings.contrast, 0, 200)}%) saturate(${clamp(settings.saturation, 0, 200)}%) grayscale(${settings.grayscale ? 1 : 0}) sepia(${clamp(settings.sepia ?? 0, 0, 100)}%) blur(${clamp(settings.blur ?? 0, 0, 10) * stageScale}px)`;
    stageContext.imageSmoothingEnabled = true;
    stageContext.imageSmoothingQuality = "high";
    stageContext.drawImage(
      source,
      -sourceSize.width / 2,
      -sourceSize.height / 2,
      sourceSize.width,
      sourceSize.height,
    );
    stageContext.restore();

    const previewScale = options.maxPreview
      ? Math.min(
          1,
          clamp(options.maxPreview, 1, MAX_EDGE) /
            Math.max(geometry.exportWidth, geometry.exportHeight),
        )
      : 1;
    canvas.width = Math.max(1, Math.round(geometry.exportWidth * previewScale));
    canvas.height = Math.max(
      1,
      Math.round(geometry.exportHeight * previewScale),
    );
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const crop = geometry.cropRect;
    context.drawImage(
      stage,
      crop.x * stage.width,
      crop.y * stage.height,
      crop.w * stage.width,
      crop.h * stage.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    return { ...geometry, width: canvas.width, height: canvas.height };
  } finally {
    if (!options.workspace) {
      stage.width = 1;
      stage.height = 1;
    }
  }
}
