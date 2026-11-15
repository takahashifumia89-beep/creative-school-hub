import { useId } from "react";
import type { DesignDoc } from "@/features/studio/DesignEditor";
import { localBounds, polygonPoints } from "@/features/studio/design-geometry";
/** A passive SVG preview: no editor bundle, scripts, remote media or document mutations. */
export function DesignArtwork({
  doc,
  label,
  className = "",
}: {
  doc: DesignDoc;
  label: string;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      role="img"
      aria-label={label}
      className={className}
      viewBox={`0 0 ${doc.w ?? 800} ${doc.h ?? 500}`}
    >
      <rect width={doc.w ?? 800} height={doc.h ?? 500} fill={doc.bg} />
      <defs>
        {doc.shapes.map((s, i) =>
          s.fill2 ? (
            <linearGradient
              key={s.id}
              id={`${id}-${i}`}
              gradientTransform={`rotate(${s.gradientAngle ?? 0} .5 .5)`}
            >
              <stop stopColor={s.fill} />
              <stop offset="1" stopColor={s.fill2} />
            </linearGradient>
          ) : null,
        )}
      </defs>
      {doc.shapes
        .filter((s) => !s.hidden)
        .map((s) => {
          const b = localBounds(s),
            fill = s.fill2 ? `url(#${id}-${doc.shapes.indexOf(s)})` : s.fill,
            x =
              s.align === "center"
                ? s.x + b.w / 2
                : s.align === "right"
                  ? s.x + b.w
                  : s.x;
          return (
            <g
              key={s.id}
              opacity={s.op ?? 1}
              stroke={s.stroke ?? "none"}
              strokeWidth={s.strokeWidth ?? 0}
              strokeDasharray={
                s.strokeDash === "dashed"
                  ? "12 7"
                  : s.strokeDash === "dotted"
                    ? "2 6"
                    : undefined
              }
              transform={`rotate(${s.rot ?? 0} ${b.x + b.w / 2} ${b.y + b.h / 2})`}
            >
              {s.type === "rect" ? (
                <rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  rx={s.r ?? 0}
                  fill={fill}
                />
              ) : s.type === "ellipse" ? (
                <ellipse
                  cx={s.x + s.w / 2}
                  cy={s.y + s.h / 2}
                  rx={s.w / 2}
                  ry={s.h / 2}
                  fill={fill}
                />
              ) : s.type === "text" ? (
                <text
                  x={x}
                  y={s.y}
                  dominantBaseline="text-before-edge"
                  fontFamily={s.font ?? "Inter, sans-serif"}
                  fontSize={s.size ?? 36}
                  fontWeight={s.bold ? 700 : 400}
                  fontStyle={s.italic ? "italic" : "normal"}
                  textAnchor={
                    s.align === "center"
                      ? "middle"
                      : s.align === "right"
                        ? "end"
                        : "start"
                  }
                  letterSpacing={s.letterSpacing ?? 0}
                  fill={fill}
                >
                  {(s.text ?? "").split("\n").map((line, i) => (
                    <tspan
                      key={i}
                      x={x}
                      y={s.y + i * (s.size ?? 36) * (s.lineHeight ?? 1.2)}
                    >
                      {line || "\u00a0"}
                    </tspan>
                  ))}
                </text>
              ) : (
                <polygon points={polygonPoints(s)} fill={fill} />
              )}
            </g>
          );
        })}
    </svg>
  );
}
