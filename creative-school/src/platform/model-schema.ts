import { z } from "zod";
const coordinate = z.number().finite().min(-10000).max(10000),
  color = z.string().regex(/^#[0-9a-f]{6}$/i);
const modifierBase = { id: z.string().uuid(), enabled: z.boolean() };
export const modifierSchema = z.discriminatedUnion("type", [
  z.object({
    ...modifierBase,
    type: z.literal("mirror"),
    axis: z.enum(["x", "y", "z"]),
    offset: coordinate,
  }),
  z.object({
    ...modifierBase,
    type: z.literal("array"),
    count: z.number().int().min(2).max(20),
    offset: z.tuple([coordinate, coordinate, coordinate]),
  }),
  z.object({
    ...modifierBase,
    type: z.literal("subdivide"),
    levels: z.number().int().min(1).max(2),
    smooth: z.boolean(),
  }),
  z.object({
    ...modifierBase,
    type: z.literal("twist"),
    axis: z.enum(["x", "y", "z"]),
    angle: z.number().min(-360).max(360),
  }),
]);
export type ModelModifier = z.infer<typeof modifierSchema>;
export const modelObjectSchema = z
  .object({
    id: z.string().min(1).max(80),
    kind: z.enum(["box", "sphere", "cone", "torus", "cylinder", "mesh"]),
    name: z.string().max(80).optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
    pos: z.tuple([coordinate, coordinate, coordinate]),
    rotY: coordinate,
    rotX: coordinate.optional(),
    rotZ: coordinate.optional(),
    scale: z.number().finite().min(0.01).max(100),
    size: z
      .tuple([
        z.number().finite().min(0.01).max(100),
        z.number().finite().min(0.01).max(100),
        z.number().finite().min(0.01).max(100),
      ])
      .optional(),
    segments: z.number().int().min(3).max(64).optional(),
    color,
    metal: z.number().finite().min(0).max(1).optional(),
    rough: z.number().finite().min(0).max(1).optional(),
    flat: z.boolean().optional(),
    modifiers: z
      .array(modifierSchema)
      .max(8)
      .refine((ms) => new Set(ms.map((m) => m.id)).size === ms.length)
      .optional(),
    vertices: z.array(coordinate).max(30000).optional(),
    indices: z.array(z.number().int().min(0).max(9999)).max(60000).optional(),
  })
  .superRefine((o, c) => {
    if (o.kind !== "mesh") return;
    if (!o.vertices || o.vertices.length < 9 || o.vertices.length % 3) {
      c.addIssue({
        code: "custom",
        message: "A mesh needs complete vertex coordinates.",
        path: ["vertices"],
      });
      return;
    }
    if (
      !o.indices ||
      o.indices.length < 3 ||
      o.indices.length % 3 ||
      o.indices.some((i) => i >= o.vertices!.length / 3)
    )
      c.addIssue({
        code: "custom",
        message: "Invalid triangle indices.",
        path: ["indices"],
      });
  });
export const sceneSchema = z
  .object({
    bg: color,
    light: z.number().finite().min(0).max(10).optional(),
    ground: z.boolean().optional(),
    wireframe: z.boolean().optional(),
    objects: z.array(modelObjectSchema).max(200),
  })
  .superRefine((scene, context) => {
    if (
      new Set(scene.objects.map((object) => object.id)).size !==
      scene.objects.length
    )
      context.addIssue({
        code: "custom",
        message: "Scene object IDs must be unique.",
        path: ["objects"],
      });
  });
export type Obj = z.infer<typeof modelObjectSchema>;
export type SceneDoc = z.infer<typeof sceneSchema>;
