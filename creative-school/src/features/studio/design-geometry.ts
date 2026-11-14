export type DesignShape = {
  id: string;
  type:
    | "rect"
    | "ellipse"
    | "triangle"
    | "text"
    | "diamond"
    | "star"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "arrow"
    | "cross"
    | "parallelogram"
    | "trapezoid";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  hidden?: boolean;
  locked?: boolean;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  size?: number;
  rot?: number;
  op?: number;
  r?: number;
  font?: string;
  bold?: boolean;
  name?: string;
  italic?: boolean;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  starPoints?: number;
  innerRatio?: number;
};
export function polygonPoints(s: DesignShape): string {
  let points: number[][];
  switch (s.type) {
    case "diamond":
      points = [
        [0.5, 0],
        [1, 0.5],
        [0.5, 1],
        [0, 0.5],
      ];
      break;
    case "arrow":
      points = [
        [0, 0.28],
        [0.58, 0.28],
        [0.58, 0],
        [1, 0.5],
        [0.58, 1],
        [0.58, 0.72],
        [0, 0.72],
      ];
      break;
    case "cross":
      points = [
        [0.33, 0],
        [0.67, 0],
        [0.67, 0.33],
        [1, 0.33],
        [1, 0.67],
        [0.67, 0.67],
        [0.67, 1],
        [0.33, 1],
        [0.33, 0.67],
        [0, 0.67],
        [0, 0.33],
        [0.33, 0.33],
      ];
      break;
    case "parallelogram":
      points = [
        [0.25, 0],
        [1, 0],
        [0.75, 1],
        [0, 1],
      ];
      break;
    case "trapezoid":
      points = [
        [0.22, 0],
        [0.78, 0],
        [1, 1],
        [0, 1],
      ];
      break;
    case "star":
    case "pentagon":
    case "hexagon":
    case "octagon": {
      const star = s.type === "star",
        count = star
          ? Math.max(3, Math.min(12, Math.round(s.starPoints ?? 5)))
          : s.type === "pentagon"
            ? 5
            : s.type === "hexagon"
              ? 6
              : 8;
      points = Array.from({ length: star ? count * 2 : count }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / (star ? count * 2 : count);
        const r =
          star && i % 2
            ? Math.max(0.15, Math.min(0.85, s.innerRatio ?? 0.45))
            : 1;
        return [Math.cos(a) * r, Math.sin(a) * r];
      });
      const xs = points.map((p) => p[0]),
        ys = points.map((p) => p[1]),
        minX = Math.min(...xs),
        minY = Math.min(...ys),
        width = Math.max(...xs) - minX,
        height = Math.max(...ys) - minY;
      points = points.map(([x, y]) => [
        (x - minX) / width,
        (y - minY) / height,
      ]);
      break;
    }
    default:
      points = [
        [0.5, 0],
        [1, 1],
        [0, 1],
      ];
  }
  return points.map(([x, y]) => `${s.x + x * s.w},${s.y + y * s.h}`).join(" ");
}
export type Box = { x: number; y: number; w: number; h: number };
let measurement: CanvasRenderingContext2D | null = null;
export function textMetrics(s: DesignShape) {
  const lines = (s.text ?? "").split("\n"),
    size = s.size ?? 36;
  if (!measurement && typeof document !== "undefined")
    measurement = document.createElement("canvas").getContext("2d");
  if (measurement)
    measurement.font = `${s.italic ? "italic " : ""}${s.bold ? "700" : "400"} ${size}px ${s.font ?? "Inter, sans-serif"}`;
  return {
    w: Math.max(
      size * 0.4,
      ...lines.map(
        (line) =>
          (measurement
            ? measurement.measureText(line).width
            : line.length * size * 0.58) +
          Math.max(0, line.length - 1) * (s.letterSpacing ?? 0),
      ),
    ),
    h: Math.max(1, lines.length) * size * (s.lineHeight ?? 1.2),
  };
}
export function localBounds(s: DesignShape): Box {
  return {
    x: s.x,
    y: s.y,
    ...(s.type === "text" ? textMetrics(s) : { w: s.w, h: s.h }),
  };
}
export function rotatePoint(
  p: { x: number; y: number },
  center: { x: number; y: number },
  degrees: number,
) {
  const a = (degrees * Math.PI) / 180,
    c = Math.cos(a),
    s = Math.sin(a);
  return {
    x: center.x + (p.x - center.x) * c - (p.y - center.y) * s,
    y: center.y + (p.x - center.x) * s + (p.y - center.y) * c,
  };
}
export function visualBounds(s: DesignShape): Box {
  const b = localBounds(s),
    center = { x: b.x + b.w / 2, y: b.y + b.h / 2 },
    points = [
      { x: b.x, y: b.y },
      { x: b.x + b.w, y: b.y },
      { x: b.x + b.w, y: b.y + b.h },
      { x: b.x, y: b.y + b.h },
    ].map((p) => rotatePoint(p, center, s.rot ?? 0)),
    x = Math.min(...points.map((p) => p.x)),
    y = Math.min(...points.map((p) => p.y));
  return {
    x,
    y,
    w: Math.max(...points.map((p) => p.x)) - x,
    h: Math.max(...points.map((p) => p.y)) - y,
  };
}
export function boundsOf(shapes: DesignShape[]): Box | null {
  if (!shapes.length) return null;
  const boxes = shapes.map(visualBounds),
    x = Math.min(...boxes.map((b) => b.x)),
    y = Math.min(...boxes.map((b) => b.y));
  return {
    x,
    y,
    w: Math.max(...boxes.map((b) => b.x + b.w)) - x,
    h: Math.max(...boxes.map((b) => b.y + b.h)) - y,
  };
}
export const intersects = (a: Box, b: Box) =>
  a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export const round = (n: number) => Math.round(n * 100) / 100;
export const sameDocument = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
