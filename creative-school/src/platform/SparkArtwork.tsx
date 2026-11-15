import { useMemo } from "react";
import { buildSpark, type SparkConfig } from "./spark";
export function SparkArtwork({
  config,
  label,
  className = "",
}: {
  config: SparkConfig;
  label: string;
  className?: string;
}) {
  const doc = useMemo(() => buildSpark(config), [config]);
  return (
    <svg
      className={`spark-artwork ${className}`}
      viewBox={`0 0 ${doc.w} ${doc.h}`}
      role="img"
      aria-label={label}
      style={{ background: doc.bg }}
    >
      <rect width={doc.w} height={doc.h} fill={doc.bg} />
      {doc.shapes.map((s) => (
        <g
          key={s.id}
          transform={`rotate(${s.rot ?? 0} ${s.x + s.w / 2} ${s.y + s.h / 2})`}
        >
          {s.type === "text" ? (
            <text
              x={s.x}
              y={s.y}
              dominantBaseline="text-before-edge"
              fontFamily={s.font}
              fontSize={s.size}
              fontWeight={s.bold ? 700 : 400}
              fill={s.fill}
            >
              {s.text}
            </text>
          ) : s.type === "ellipse" ? (
            <ellipse
              cx={s.x + s.w / 2}
              cy={s.y + s.h / 2}
              rx={s.w / 2}
              ry={s.h / 2}
              fill={s.fill}
            />
          ) : (
            <rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={s.r ?? 0}
              fill={s.fill}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
