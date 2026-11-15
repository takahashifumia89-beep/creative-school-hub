import { z } from "zod";
import {
  designSchema,
  imageSchema,
  sceneSchema,
  videoSchema,
  kinds,
  type ProjectKind,
} from "./schema";

export const assistantRequestSchema = z
  .object({
    kind: z.enum(kinds),
    language: z.enum(["ru", "en", "kk"]),
    message: z.string().trim().min(1).max(2000),
    history: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(4000),
          })
          .strict(),
      )
      .max(6)
      .default([]),
    context: z
      .object({ title: z.string().max(120), summary: z.string().max(8000) })
      .strict()
      .optional(),
  })
  .strict();
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
export type AssistantReply = { reply: string; truncated: boolean };
export const assistantDailyLimit = 20;

// A deliberately limited description: no media bytes, filenames, cache IDs,
// account information or mesh coordinates. Hidden objects are omitted.
export function summarizeStudioProject(
  kind: ProjectKind,
  content: string,
): string {
  let summary: Record<string, unknown>;
  if (kind === "notes") {
    let text = content.slice(0, 4000);
    while (JSON.stringify({ text, characters: content.length }).length > 7900)
      text = text.slice(0, Math.floor(text.length * 0.8));
    return JSON.stringify({ text, characters: content.length });
  }
  try {
    const raw: unknown = JSON.parse(content);
    if (kind === "design") {
      const d = designSchema.parse(raw),
        visible = d.shapes.filter((s) => !s.hidden);
      summary = {
        width: d.w ?? 800,
        height: d.h ?? 500,
        background: d.bg,
        visibleLayers: visible.length,
        layers: visible.slice(-12).map((s) => ({
          type: s.type,
          name: s.name?.slice(0, 80),
          x: s.x,
          y: s.y,
          width: s.w,
          height: s.h,
          fill: s.fill,
          rotation: s.rot,
          opacity: s.op,
          locked: s.locked,
          text: s.text?.slice(0, 250),
          font: s.font,
          fontSize: s.size,
          bold: s.bold,
          italic: s.italic,
          align: s.align,
        })),
      };
    } else if (kind === "3d") {
      const d = sceneSchema.parse(raw),
        visible = d.objects.filter((o) => !o.hidden);
      summary = {
        background: d.bg,
        light: d.light,
        ground: d.ground,
        visibleObjects: visible.length,
        objects: visible.slice(0, 16).map((o) => ({
          kind: o.kind,
          name: o.name?.slice(0, 80),
          position: o.pos,
          rotation: [o.rotX ?? 0, o.rotY, o.rotZ ?? 0],
          scale: o.scale,
          size: o.size,
          color: o.color,
          metalness: o.metal,
          roughness: o.rough,
          locked: o.locked,
          vertexCount: o.vertices ? o.vertices.length / 3 : undefined,
        })),
      };
    } else if (kind === "image") {
      const {
        filename: _filename,
        assetId: _assetId,
        ...settings
      } = imageSchema.parse(raw);
      summary = { hasSource: !!_filename, ...settings };
    } else {
      const d = videoSchema.parse(raw);
      summary = {
        exportWidth: Number(d.width),
        aspect: d.aspect,
        fps: d.fps,
        background: d.bg,
        totalSeconds: d.clips.reduce(
          (sum, c) => sum + (c.end - c.start) / (c.speed ?? 1),
          0,
        ),
        clipCount: d.clips.length,
        clips: d.clips.map((c, i) => ({
          number: i + 1,
          start: c.start,
          end: c.end,
          sourceDuration: c.duration,
          speed: c.speed,
          fit: c.fit,
          zoom: c.zoom,
          panX: c.panX,
          panY: c.panY,
          title: c.title,
          volume: c.volume,
          fade: c.fade,
          brightness: c.brightness,
          contrast: c.contrast,
          saturation: c.saturation,
        })),
        soundtrack: !!d.soundtrack,
        soundtrackVolume: d.soundtrack?.volume,
      };
    }
    // Keep valid JSON even when many long titles/layer names were supplied.
    for (const field of ["layers", "objects", "clips"]) {
      const items = summary[field];
      if (Array.isArray(items))
        while (JSON.stringify(summary).length > 7900 && items.length)
          items.pop();
    }
    return JSON.stringify(summary);
  } catch {
    return JSON.stringify({ unavailable: true });
  }
}
