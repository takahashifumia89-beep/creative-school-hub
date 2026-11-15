import { sceneSchema } from "./model-schema";
export { sceneSchema } from "./model-schema";
import { z } from "zod";
const keyframeSchema = z.object({
  id: z.string().uuid(),
  tick: z.number().int().min(0).max(5_080_320_000_000),
  zoom: z.number().min(1).max(3),
  panX: z.number().min(-1).max(1),
  panY: z.number().min(-1).max(1),
  brightness: z.number().min(0).max(200),
  volume: z.number().min(0).max(1),
  interpolation: z.enum(["linear", "smooth", "hold"]),
});
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const num = z.number().finite().min(-10000).max(10000);
export const designSchema = z.object({
  bg: color,
  w: z.number().min(64).max(4096).optional(),
  h: z.number().min(64).max(4096).optional(),
  shapes: z
    .array(
      z.object({
        id: z.string().max(80),
        groupId: z.string().uuid().optional(),
        type: z.enum([
          "rect",
          "ellipse",
          "triangle",
          "text",
          "diamond",
          "star",
          "pentagon",
          "hexagon",
          "octagon",
          "arrow",
          "cross",
          "parallelogram",
          "trapezoid",
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
        ]),
        starPoints: z.number().int().min(3).max(12).optional(),
        polygonSides: z.number().int().min(3).max(24).optional(),
        fill2: color.optional(),
        gradientAngle: z.number().min(0).max(360).optional(),
        strokeDash: z.enum(["solid", "dashed", "dotted"]).optional(),
        innerRatio: z.number().min(0.15).max(0.85).optional(),
        x: num,
        y: num,
        w: num,
        h: num,
        fill: color,
        hidden: z.boolean().optional(),
        locked: z.boolean().optional(),
        stroke: color.optional(),
        strokeWidth: z.number().min(0).max(30).optional(),
        text: z.string().max(2000).optional(),
        size: z.number().min(1).max(1000).optional(),
        rot: num.optional(),
        op: z.number().min(0).max(1).optional(),
        r: num.optional(),
        font: z
          .enum([
            "Inter, sans-serif",
            "Georgia, serif",
            '"Courier New", monospace',
            "Impact, sans-serif",
          ])
          .optional(),
        bold: z.boolean().optional(),
        name: z.string().max(80).optional(),
        italic: z.boolean().optional(),
        align: z.enum(["left", "center", "right"]).optional(),
        lineHeight: z.number().min(0.8).max(3).optional(),
        letterSpacing: z.number().min(-20).max(100).optional(),
      }),
    )
    .max(500),
});
const cropRectSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().positive().max(1),
    h: z.number().positive().max(1),
  })
  .refine((r) => r.x + r.w <= 1.000001 && r.y + r.h <= 1.000001);
export const imageSchema = z.object({
  brightness: z.number().min(0).max(200),
  contrast: z.number().min(0).max(200),
  saturation: z.number().min(0).max(200),
  grayscale: z.boolean(),
  rotation: z.number().int().min(0).max(270),
  crop: z.enum(["original", "square", "wide", "portrait"]),
  filename: z.string().max(200),
  assetId: z.string().uuid().optional(),
  cropRect: cropRectSchema.optional(),
  exportWidth: z.number().int().min(16).max(4096).optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  sepia: z.number().min(0).max(100).optional(),
  blur: z.number().min(0).max(10).optional(),
  linearColor: z.boolean().optional(),
  exposure: z.number().min(-4).max(4).optional(),
  temperature: z.number().min(-100).max(100).optional(),
  tint: z.number().min(-100).max(100).optional(),
  vignette: z.number().min(0).max(100).optional(),
  toneMap: z.enum(["none", "aces"]).optional(),
});
export const videoSchema = z.object({
  clips: z
    .array(
      z
        .object({
          id: z.string().max(80),
          filename: z.string().max(200),
          assetId: z.string().uuid().optional(),
          start: z.number().min(0),
          end: z.number().positive(),
          duration: z.number().positive().max(7200),
          title: z.string().max(100),
          volume: z.number().min(0).max(1),
          fade: z.number().min(0).max(3).optional(),
          brightness: z.number().min(0).max(200).optional(),
          contrast: z.number().min(0).max(200).optional(),
          speed: z.number().min(0.25).max(4).optional(),
          fit: z.enum(["contain", "cover"]).optional(),
          zoom: z.number().min(1).max(3).optional(),
          panX: z.number().min(-1).max(1).optional(),
          panY: z.number().min(-1).max(1).optional(),
          flipX: z.boolean().optional(),
          flipY: z.boolean().optional(),
          saturation: z.number().min(0).max(200).optional(),
          titleColor: color.optional(),
          titleBackground: z.boolean().optional(),
          titleSize: z.number().min(20).max(100).optional(),
          titlePosition: z.enum(["top", "center", "bottom"]).optional(),
          titleAlign: z.enum(["left", "center", "right"]).optional(),
          keyframes: z
            .array(keyframeSchema)
            .max(120)
            .refine(
              (keys) =>
                new Set(keys.map((k) => k.tick)).size === keys.length &&
                new Set(keys.map((k) => k.id)).size === keys.length,
            )
            .optional(),
          audioEQ: z
            .object({
              low: z.number().min(-12).max(12),
              mid: z.number().min(-12).max(12),
              high: z.number().min(-12).max(12),
            })
            .optional(),
        })
        .refine(
          (c) =>
            c.end > c.start &&
            c.end <= c.duration &&
            (c.keyframes ?? []).every(
              (k) => k.tick <= Math.round(c.duration * 705600000),
            ),
        ),
    )
    .max(30),
  soundtrack: z
    .object({
      filename: z.string().max(200),
      volume: z.number().min(0).max(1),
      assetId: z.string().uuid().optional(),
    })
    .optional(),
  width: z.enum(["1280", "720"]),
  aspect: z.enum(["wide", "portrait", "square"]).optional(),
  fps: z
    .union([
      z.literal(23.976),
      z.literal(24),
      z.literal(25),
      z.literal(29.97),
      z.literal(30),
      z.literal(59.94),
      z.literal(60),
    ])
    .optional(),
  captions: z
    .array(
      z
        .object({
          id: z.string().uuid(),
          start: z.number().min(0).max(1000000),
          end: z.number().positive().max(1000000),
          text: z.string().min(1).max(300),
        })
        .refine((c) => c.end > c.start),
    )
    .max(200)
    .optional(),
  bg: color,
});
export type ProjectKind = "design" | "3d" | "image" | "video" | "notes";
export const kinds = ["design", "3d", "image", "video", "notes"] as const;
export function validDocument(kind: ProjectKind, content: string | null) {
  if (content === null) return true;
  if (typeof content !== "string") return false;
  if (content.length > 200000) return false;
  if (kind === "notes") return true;
  try {
    return {
      design: designSchema,
      "3d": sceneSchema,
      image: imageSchema,
      video: videoSchema,
    }[kind].safeParse(JSON.parse(content)).success;
  } catch {
    return false;
  }
}

export const draftSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(1000),
  content: z.string().max(200000),
  version: z.number().int().positive(),
  id: z.string().uuid().nullable(),
});
