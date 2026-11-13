import { useLocale, L } from "@/platform/locale";
import { useEditorText } from "@/platform/editor-labels";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Circle,
  Copy,
  Download,
  Redo2,
  Square,
  Trash2,
  Triangle,
  Type,
  Undo2,
} from "lucide-react";
export type Shape = {
  id: string;
  type: "rect" | "ellipse" | "triangle" | "text";
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
};
export type DesignDoc = {
  bg: string;
  shapes: Shape[];
  w?: number;
  h?: number;
};
export const emptyDesign: DesignDoc = {
  bg: "#f6f1e7",
  shapes: [],
  w: 800,
  h: 500,
};
const SIZES: [string, number, number][] = [
  ["Слайд", 800, 500],
  ["Пост", 800, 800],
  ["Сторис", 500, 890],
];
const FONTS = [
  "Inter, sans-serif",
  "Georgia, serif",
  '"Courier New", monospace',
  "Impact, sans-serif",
];
const btn =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:border-primary disabled:opacity-40";
const lbl = "text-xs font-medium";
const bounds = (s: Shape) =>
  s.type === "text"
    ? {
        w: Math.max(30, (s.text?.length ?? 1) * (s.size ?? 36) * 0.58),
        h: (s.size ?? 36) * 1.2,
      }
    : { w: s.w, h: s.h };
export function DesignEditor({
  value,
  onChange,
}: {
  value: DesignDoc;
  onChange: (doc: DesignDoc) => void;
}) {
  const tx = useEditorText();
  const { t } = useLocale();
  const W = value.w ?? 800,
    H = value.h ?? 500;
  const [sel, setSel] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const past = useRef<DesignDoc[]>([]);
  const future = useRef<DesignDoc[]>([]);
  const act = useRef<{
    mode: "move" | "resize";
    corner: string;
    sx: number;
    sy: number;
    o: Shape;
  } | null>(null);
  const cur = value.shapes.find((s) => s.id === sel) ?? null;
  const begin = () => {
    past.current = [...past.current.slice(-49), value];
    future.current = [];
  };
  const edit = (doc: DesignDoc) => {
    begin();
    onChange(doc);
  };
  const undo = () => {
    const p = past.current.pop();
    if (p) {
      future.current.push(value);
      onChange(p);
    }
  };
  const redo = () => {
    const f = future.current.pop();
    if (f) {
      past.current.push(value);
      onChange(f);
    }
  };
  const live = (p: Partial<Shape>) =>
    cur &&
    !cur.locked &&
    onChange({
      ...value,
      shapes: value.shapes.map((s) => (s.id === cur.id ? { ...s, ...p } : s)),
    });
  const add = (type: Shape["type"]) => {
    const s: Shape = {
      id: crypto.randomUUID(),
      type,
      x: W / 2 - 85,
      y: H / 2 - 55,
      w: 170,
      h: 110,
      fill: type === "text" ? "#1a1a1a" : "#e8590c",
      text: tx("Текст"),
      size: 40,
      rot: 0,
      op: 1,
      r: 8,
      font: FONTS[0],
      bold: true,
    };
    edit({ ...value, shapes: [...value.shapes, s] });
    setSel(s.id);
  };
  const duplicate = () => {
    if (!cur || cur.locked) return;
    const c = { ...cur, id: crypto.randomUUID(), x: cur.x + 20, y: cur.y + 20 };
    edit({ ...value, shapes: [...value.shapes, c] });
    setSel(c.id);
  };
  const remove = () => {
    if (!cur || cur.locked) return;
    edit({ ...value, shapes: value.shapes.filter((s) => s.id !== cur.id) });
    setSel(null);
  };
  const reorder = (up: boolean) => {
    if (!cur || cur.locked) return;
    const a = [...value.shapes],
      i = a.findIndex((s) => s.id === cur.id),
      j = i + (up ? 1 : -1);
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    edit({ ...value, shapes: a });
  };
  const center = (axis: "x" | "y") => {
    if (!cur || cur.locked) return;
    const b = bounds(cur);
    begin();
    live(
      axis === "x"
        ? { x: Math.round(W / 2 - b.w / 2) }
        : { y: Math.round(H / 2 - b.h / 2) },
    );
  };
  const template = (kind: "poster" | "card") => {
    const id = () => crypto.randomUUID();
    const base = { rot: 0, op: 1, r: 8, font: FONTS[0], bold: true };
    edit(
      kind === "poster"
        ? {
            ...value,
            bg: "#14141b",
            shapes: [
              {
                ...base,
                id: id(),
                type: "ellipse",
                x: W - 300,
                y: -80,
                w: 380,
                h: 380,
                fill: "#e8590c",
              },
              {
                ...base,
                id: id(),
                type: "text",
                x: 50,
                y: H - 190,
                w: 0,
                h: 0,
                fill: "#ffffff",
                text: tx("Твой заголовок"),
                size: 56,
              },
              {
                ...base,
                id: id(),
                type: "text",
                x: 54,
                y: H - 110,
                w: 0,
                h: 0,
                fill: "#bbbbbb",
                text: tx("Подзаголовок и дата"),
                size: 24,
                bold: false,
              },
            ],
          }
        : {
            ...value,
            bg: "#f6f1e7",
            shapes: [
              {
                ...base,
                id: id(),
                type: "rect",
                x: 0,
                y: 0,
                w: 24,
                h: H,
                fill: "#e8590c",
                r: 0,
              },
              {
                ...base,
                id: id(),
                type: "text",
                x: 60,
                y: H / 2 - 50,
                w: 0,
                h: 0,
                fill: "#1a1a1a",
                text: tx("Имя Фамилия"),
                size: 44,
              },
              {
                ...base,
                id: id(),
                type: "text",
                x: 62,
                y: H / 2 + 10,
                w: 0,
                h: 0,
                fill: "#555555",
                text: tx("Дизайнер"),
                size: 22,
                bold: false,
              },
            ],
          },
    );
    setSel(null);
  };
  const pt = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * W) / r.width,
      y: ((e.clientY - r.top) * H) / r.height,
    };
  };
  const start = (
    e: React.PointerEvent,
    s: Shape,
    mode: "move" | "resize",
    corner = "",
  ) => {
    e.stopPropagation();
    setSel(s.id);
    if (s.locked) return;
    begin();
    const p = pt(e);
    act.current = { mode, corner, sx: p.x, sy: p.y, o: s };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const a = act.current;
    if (!a) return;
    const p = pt(e),
      dx = p.x - a.sx,
      dy = p.y - a.sy,
      o = a.o;
    let n: Partial<Shape>;
    if (a.mode === "move") {
      let x = Math.round(o.x + dx),
        y = Math.round(o.y + dy);
      const b = bounds(o);
      if (Math.abs(x + b.w / 2 - W / 2) < 6) x = Math.round(W / 2 - b.w / 2);
      if (Math.abs(y + b.h / 2 - H / 2) < 6) y = Math.round(H / 2 - b.h / 2);
      n = { x, y };
    } else {
      const b = bounds(o),
        c = a.corner;
      const w = Math.max(16, Math.round(c.includes("e") ? b.w + dx : b.w - dx)),
        h = Math.max(16, Math.round(c.includes("s") ? b.h + dy : b.h - dy));
      n = {
        w,
        h,
        x: c.includes("w") ? Math.round(o.x + b.w - w) : o.x,
        y: c.includes("n") ? Math.round(o.y + b.h - h) : o.y,
      };
      if (o.type === "text")
        n = {
          size: Math.max(8, Math.round(h / 1.2)),
          x: c.includes("w") ? Math.round(o.x + b.w - w) : o.x,
          y: c.includes("n") ? Math.round(o.y + b.h - h) : o.y,
        };
    }
    onChange({
      ...value,
      shapes: value.shapes.map((s) => (s.id === o.id ? { ...s, ...n } : s)),
    });
  };
  const key = (e: React.KeyboardEvent) => {
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement).tagName,
      )
    )
      return;
    const mod = e.ctrlKey || e.metaKey,
      k = e.key.toLowerCase();
    if (mod && k === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if (mod && k === "y") {
      e.preventDefault();
      redo();
    } else if (mod && k === "d") {
      e.preventDefault();
      duplicate();
    } else if (k === "delete" || k === "backspace") remove();
    else if (cur && k.startsWith("arrow")) {
      e.preventDefault();
      begin();
      const d = e.shiftKey ? 10 : 1;
      live({
        x: cur.x + (k === "arrowright" ? d : k === "arrowleft" ? -d : 0),
        y: cur.y + (k === "arrowdown" ? d : k === "arrowup" ? -d : 0),
      });
    }
  };
  const serialize = () => {
    const el = svg.current!.cloneNode(true) as SVGSVGElement;
    el.querySelectorAll("[data-ui]").forEach((n) => n.remove());
    el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    el.setAttribute("width", String(W));
    el.setAttribute("height", String(H));
    return new XMLSerializer().serializeToString(el);
  };
  const save = (href: string, name: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  };
  const exportSvg = () => {
    const u = URL.createObjectURL(
      new Blob([serialize()], { type: "image/svg+xml" }),
    );
    save(u, "design.svg");
    URL.revokeObjectURL(u);
  };
  const exportPng = () => {
    const u = URL.createObjectURL(
        new Blob([serialize()], { type: "image/svg+xml" }),
      ),
      img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W * 2;
      c.height = H * 2;
      c.getContext("2d")!.drawImage(img, 0, 0, W * 2, H * 2);
      save(c.toDataURL("image/png"), "design.png");
      URL.revokeObjectURL(u);
    };
    img.src = u;
  };
  const corners: [string, number, number][] = cur
    ? (() => {
        const b = bounds(cur);
        return [
          ["nw", cur.x, cur.y],
          ["ne", cur.x + b.w, cur.y],
          ["sw", cur.x, cur.y + b.h],
          ["se", cur.x + b.w, cur.y + b.h],
        ] as [string, number, number][];
      })()
    : [];
  const rotT = (s: Shape) => {
    const b = bounds(s);
    return s.rot
      ? `rotate(${s.rot} ${s.x + b.w / 2} ${s.y + b.h / 2})`
      : undefined;
  };
  return (
    <div className="w-full outline-none" tabIndex={0} onKeyDown={key}>
      <div className="mb-3 flex flex-wrap gap-2">
        <button className={btn} onClick={undo} disabled={!past.current.length}>
          <Undo2 size={14} />
          {tx("Отменить")}
        </button>
        <button
          className={btn}
          onClick={redo}
          disabled={!future.current.length}
        >
          <Redo2 size={14} />
          {tx("Вернуть")}
        </button>
        <select
          className={btn}
          value={`${W}x${H}`}
          onChange={(e) => {
            const [w, h] = e.target.value.split("x").map(Number);
            edit({ ...value, w, h });
          }}
        >
          {SIZES.map(([n, w, h]) => (
            <option key={tx(n)} value={`${w}x${h}`}>
              {n} {w}×{h}
            </option>
          ))}
        </select>
        <button className={btn} onClick={() => template("poster")}>
          {tx("Шаблон: постер")}
        </button>
        <button className={btn} onClick={() => template("card")}>
          {tx("Шаблон: визитка")}
        </button>
      </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block max-h-[560px] w-full touch-none rounded-xl border border-border"
        style={{ background: value.bg, aspectRatio: `${W}/${H}` }}
        onPointerMove={move}
        onPointerUp={() => {
          act.current = null;
        }}
        onPointerDown={() => setSel(null)}
      >
        <rect width={W} height={H} fill={value.bg} />
        {value.shapes
          .filter((s) => !s.hidden)
          .map((s) => {
            const b = bounds(s);
            return (
              <g
                key={s.id}
                transform={rotT(s)}
                opacity={s.op ?? 1}
                stroke={s.stroke ?? "none"}
                strokeWidth={s.strokeWidth ?? 0}
                style={{ cursor: "move" }}
                onPointerDown={(e) => start(e, s, "move")}
                onDoubleClick={() => {
                  if (s.type !== "text" || s.locked) return;
                  const t = window.prompt(tx("Текст"), s.text);
                  if (t !== null)
                    edit({
                      ...value,
                      shapes: value.shapes.map((x) =>
                        x.id === s.id ? { ...x, text: t } : x,
                      ),
                    });
                }}
              >
                {s.type === "rect" && (
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx={s.r ?? 0}
                    fill={s.fill}
                  />
                )}
                {s.type === "ellipse" && (
                  <ellipse
                    cx={s.x + s.w / 2}
                    cy={s.y + s.h / 2}
                    rx={s.w / 2}
                    ry={s.h / 2}
                    fill={s.fill}
                  />
                )}
                {s.type === "triangle" && (
                  <polygon
                    points={`${s.x + s.w / 2},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`}
                    fill={s.fill}
                  />
                )}
                {s.type === "text" && (
                  <text
                    x={s.x}
                    y={s.y}
                    fontSize={s.size}
                    fill={s.fill}
                    dominantBaseline="hanging"
                    fontFamily={s.font ?? FONTS[0]}
                    fontWeight={s.bold ? 700 : 400}
                  >
                    {s.text}
                  </text>
                )}
                {s.id === sel && (
                  <rect
                    data-ui
                    x={s.x - 2}
                    y={s.y - 2}
                    width={b.w + 4}
                    height={b.h + 4}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={1.5}
                  />
                )}
                {s.id === sel &&
                  corners.map(([c, cx, cy]) => (
                    <rect
                      key={c}
                      data-ui
                      x={cx - 6}
                      y={cy - 6}
                      width={12}
                      height={12}
                      rx={3}
                      fill="#fff"
                      stroke="#2563eb"
                      strokeWidth={1.5}
                      style={{ cursor: `${c}-resize` }}
                      onPointerDown={(e) => start(e, s, "resize", c)}
                    />
                  ))}
              </g>
            );
          })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={btn} onClick={() => add("rect")}>
          <Square size={14} />
          {tx("Прямоугольник")}
        </button>
        <button className={btn} onClick={() => add("ellipse")}>
          <Circle size={14} />
          {tx("Эллипс")}
        </button>
        <button className={btn} onClick={() => add("triangle")}>
          <Triangle size={14} />
          {tx("Треугольник")}
        </button>
        <button className={btn} onClick={() => add("text")}>
          <Type size={14} />
          {tx("Текст")}
        </button>
        <label className={`${btn} cursor-pointer`}>
          {tx("Фон")}
          <input
            type="color"
            value={value.bg}
            onFocus={begin}
            onChange={(e) => onChange({ ...value, bg: e.target.value })}
            className="h-5 w-6 border-0 bg-transparent p-0"
          />
        </label>
        <button className={btn} onClick={exportPng}>
          <Download size={14} /> PNG
        </button>
        <button className={btn} onClick={exportSvg}>
          <Download size={14} /> SVG
        </button>
      </div>
      {cur && (
        <div className="mt-3 flex flex-wrap gap-3">
          <label className={lbl}>
            {t(L("Обводка", "Stroke", "Жиек"))}
            <input
              type="color"
              value={cur.stroke ?? "#000000"}
              onFocus={begin}
              onChange={(e) =>
                live({
                  stroke: e.target.value,
                  strokeWidth: cur.strokeWidth || 1,
                })
              }
            />
          </label>
          <label className={lbl}>
            {t(L("Толщина обводки", "Stroke width", "Жиек қалыңдығы"))}
            <input
              type="range"
              min={0}
              max={30}
              value={cur.strokeWidth ?? 0}
              onPointerDown={begin}
              onChange={(e) => live({ strokeWidth: +e.target.value })}
            />
          </label>
        </div>
      )}
      {cur ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          {(["x", "y", "w", "h"] as const).map((key) => (
            <label key={key} className={lbl}>
              {key.toUpperCase()}
              <input
                type="number"
                min={key === "w" || key === "h" ? 1 : -10000}
                max={10000}
                value={cur[key]}
                onFocus={begin}
                onChange={(e) =>
                  live({
                    [key]: Math.min(
                      10000,
                      Math.max(
                        key === "w" || key === "h" ? 1 : -10000,
                        Number(e.target.value),
                      ),
                    ),
                  })
                }
              />
            </label>
          ))}
          <label className={lbl}>
            {tx("Цвет")}
            <input
              type="color"
              value={cur.fill}
              onFocus={begin}
              onChange={(e) => live({ fill: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2"
            />
          </label>
          <label className={lbl}>
            {tx("Прозрачность:")}
            {Math.round((cur.op ?? 1) * 100)}%
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={cur.op ?? 1}
              onPointerDown={begin}
              onChange={(e) => live({ op: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <label className={lbl}>
            {tx("Поворот:")}
            {cur.rot ?? 0}°
            <input
              type="range"
              min={-180}
              max={180}
              value={cur.rot ?? 0}
              onPointerDown={begin}
              onChange={(e) => live({ rot: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          {cur.type === "text" ? (
            <>
              <label className={lbl}>
                {tx("Текст")}
                <input
                  value={cur.text ?? ""}
                  onFocus={begin}
                  onChange={(e) => live({ text: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                />
              </label>
              <label className={lbl}>
                {tx("Размер:")}
                {cur.size}
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={cur.size ?? 40}
                  onPointerDown={begin}
                  onChange={(e) => live({ size: Number(e.target.value) })}
                  className="mt-3 w-full"
                />
              </label>
              <label className={lbl}>
                {tx("Шрифт")}
                <select
                  value={cur.font ?? FONTS[0]}
                  onChange={(e) =>
                    edit({
                      ...value,
                      shapes: value.shapes.map((s) =>
                        s.id === cur.id ? { ...s, font: e.target.value } : s,
                      ),
                    })
                  }
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f.split(",")[0].replace(/"/g, "")}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${lbl} flex items-center gap-2`}>
                <input
                  type="checkbox"
                  checked={!!cur.bold}
                  onChange={(e) =>
                    edit({
                      ...value,
                      shapes: value.shapes.map((s) =>
                        s.id === cur.id ? { ...s, bold: e.target.checked } : s,
                      ),
                    })
                  }
                />
                {tx("Жирный")}
              </label>
            </>
          ) : (
            cur.type === "rect" && (
              <label className={lbl}>
                {tx("Скругление:")}
                {cur.r ?? 0}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cur.r ?? 0}
                  onPointerDown={begin}
                  onChange={(e) => live({ r: Number(e.target.value) })}
                  className="mt-3 w-full"
                />
              </label>
            )
          )}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className={btn} onClick={() => center("x")}>
              {tx("По центру ↔")}
            </button>
            <button className={btn} onClick={() => center("y")}>
              {tx("По центру ↕")}
            </button>
            <button className={btn} onClick={() => reorder(true)}>
              <ArrowUp size={14} />
              {tx("Выше")}
            </button>
            <button className={btn} onClick={() => reorder(false)}>
              <ArrowDown size={14} />
              {tx("Ниже")}
            </button>
            <button className={btn} onClick={duplicate}>
              <Copy size={14} />
              {tx("Дубль")}
            </button>
            <button className={`${btn} text-destructive`} onClick={remove}>
              <Trash2 size={14} />
              {tx("Удалить")}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          {tx(
            "Выберите фигуру, чтобы менять её. Тяните за углы, чтобы менять размер. Двойной клик по тексту редактирует его. Клавиши: Ctrl+Z, Ctrl+Y, Ctrl+D, Delete, стрелки.",
          )}
        </p>
      )}
      {value.shapes.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-background p-3">
          <div className="mb-2 text-xs font-semibold">{tx("Слои")}</div>
          <div className="grid gap-1">
            {[...value.shapes].reverse().map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSel(s.id)}
                  className={`rounded-lg px-3 py-1.5 text-left text-xs ${s.id === sel ? "bg-primary/15 text-primary" : "hover:bg-muted"}`}
                >
                  {s.type === "text"
                    ? `${tx("Текст")}: ${s.text}`
                    : {
                        rect: tx("Прямоугольник"),
                        ellipse: tx("Эллипс"),
                        triangle: tx("Треугольник"),
                      }[s.type]}
                </button>
                <button
                  className="ml-auto rounded-lg px-2 py-1.5 text-xs"
                  aria-label={t(
                    L("Видимость слоя", "Layer visibility", "Қабат көрінуі"),
                  )}
                  aria-pressed={!s.hidden}
                  onClick={() =>
                    edit({
                      ...value,
                      shapes: value.shapes.map((x) =>
                        x.id === s.id ? { ...x, hidden: !x.hidden } : x,
                      ),
                    })
                  }
                >
                  {s.hidden ? "○" : "●"}
                </button>
                <button
                  className="rounded-lg px-2 py-1.5 text-xs"
                  aria-label={t(
                    L("Блокировка слоя", "Lock layer", "Қабатты құлыптау"),
                  )}
                  aria-pressed={!!s.locked}
                  onClick={() =>
                    edit({
                      ...value,
                      shapes: value.shapes.map((x) =>
                        x.id === s.id ? { ...x, locked: !x.locked } : x,
                      ),
                    })
                  }
                >
                  {s.locked ? "🔒" : "◇"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
