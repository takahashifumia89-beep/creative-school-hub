import { z } from "zod";
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
        type: z.enum(["rect", "ellipse", "triangle", "text"]),
        x: num,
        y: num,
        w: num,
        h: num,
        fill: color,
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
      }),
    )
    .max(500),
});
export const sceneSchema = z.object({
  bg: color,
  light: z.number().min(0).max(10).optional(),
  ground: z.boolean().optional(),
  objects: z
    .array(
      z.object({
        id: z.string().max(80),
        kind: z.enum(["box", "sphere", "cone", "torus", "cylinder"]),
        pos: z.tuple([num, num, num]),
        rotY: num,
        rotX: num.optional(),
        rotZ: num.optional(),
        scale: z.number().min(0.01).max(100),
        color,
        metal: z.number().min(0).max(1).optional(),
        rough: z.number().min(0).max(1).optional(),
      }),
    )
    .max(200),
});
export const imageSchema = z.object({
  brightness: z.number().min(0).max(200),
  contrast: z.number().min(0).max(200),
  saturation: z.number().min(0).max(200),
  grayscale: z.boolean(),
  rotation: z.number().int().min(0).max(270),
  crop: z.enum(["original", "square", "wide", "portrait"]),
  filename: z.string().max(200),
});
export const videoSchema = z.object({
  clips: z
    .array(
      z
        .object({
          id: z.string().max(80),
          filename: z.string().max(200),
          start: z.number().min(0),
          end: z.number().positive(),
          duration: z.number().positive().max(7200),
          title: z.string().max(100),
          volume: z.number().min(0).max(1),
        })
        .refine((c) => c.end > c.start && c.end <= c.duration),
    )
    .max(30),
  width: z.enum(["1280", "720"]),
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
