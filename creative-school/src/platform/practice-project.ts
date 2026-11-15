import { briefConfig, buildSpark } from "./spark";
import type { Lang } from "./locale";
export function practiceProject(lessonId: string, lang: Lang) {
  if (lessonId.startsWith("b3d-"))
    return {
      kind: "3d" as const,
      content: JSON.stringify({
        bg: "#e6e2d6",
        ground: true,
        light: 1.6,
        objects: [
          {
            id: "study-box",
            name: "01",
            kind: "box",
            pos: [-1.5, 0.5, 0],
            rotY: 20,
            scale: 1,
            color: "#c7dc53",
            rough: 0.55,
          },
          {
            id: "study-sphere",
            name: "02",
            kind: "sphere",
            pos: [0, 0.75, 0],
            rotY: 0,
            scale: 1.4,
            color: "#e49a7b",
            rough: 0.3,
          },
          {
            id: "study-torus",
            name: "03",
            kind: "torus",
            pos: [1.7, 0.7, 0],
            rotY: 25,
            scale: 1,
            color: "#98b9be",
            metal: 0.35,
            rough: 0.25,
          },
        ],
      }),
    };
  if (lessonId.startsWith("img-"))
    return {
      kind: "image" as const,
      content: JSON.stringify({
        filename: "",
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: false,
        rotation: 0,
        crop: "original",
      }),
    };
  if (lessonId.startsWith("vid-") || lessonId.startsWith("mot-"))
    return {
      kind: "video" as const,
      content: JSON.stringify({ clips: [], width: "1280", bg: "#111111" }),
    };
  if (lessonId.startsWith("ux-"))
    return { kind: "notes" as const, content: "" };
  return {
    kind: "design" as const,
    content: JSON.stringify(
      buildSpark(
        briefConfig(
          lessonId.startsWith("pf-")
            ? "identity"
            : lessonId.startsWith("ad-")
              ? "exhibition"
              : "sound",
          lang,
        ),
      ),
    ),
  };
}
