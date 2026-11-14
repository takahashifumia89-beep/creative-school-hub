import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  ArrowDown,
  ArrowUp,
  Circle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Hand,
  HelpCircle,
  Layers,
  Lock,
  Maximize,
  MousePointer2,
  PanelRightClose,
  PanelRightOpen,
  Redo2,
  Settings2,
  Square,
  Trash2,
  Triangle,
  Type,
  Undo2,
  Unlock,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { L, useLocale } from "@/platform/locale";
import { download } from "@/platform/client";
import {
  boundsOf,
  clamp,
  intersects,
  localBounds,
  rotatePoint,
  round,
  sameDocument,
  textMetrics,
  visualBounds,
  type Box,
  type DesignShape,
} from "./design-geometry";
import "./design-workspace.css";
export type Shape = DesignShape;
export type DesignDoc = { bg: string; shapes: Shape[]; w?: number; h?: number };
export const emptyDesign: DesignDoc = {
  bg: "#f6f1e7",
  shapes: [],
  w: 800,
  h: 500,
};
const FONTS = [
  "Inter, sans-serif",
  "Georgia, serif",
  '"Courier New", monospace',
  "Impact, sans-serif",
];
const button = "dw-button",
  iconButton = "dw-button dw-icon",
  MAX_SHAPES = 500;
type Point = { x: number; y: number };
type Gesture =
  | { mode: "move"; before: DesignDoc; origin: Point; ids: string[]; box: Box }
  | {
      mode: "resize";
      before: DesignDoc;
      original: Shape;
      corner: string;
      anchor: Point;
    }
  | {
      mode: "rotate";
      before: DesignDoc;
      ids: string[];
      center: Point;
      angle: number;
    }
  | { mode: "marquee"; origin: Point; added: string[] }
  | { mode: "pan"; origin: Point; left: number; top: number };
function NumberField({
  label,
  value,
  min = -10000,
  max = 10000,
  step = 1,
  disabled = false,
  onCommit,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(round(value))),
    focused = useRef(false),
    cancelled = useRef(false);
  useEffect(() => {
    if (!focused.current) setDraft(String(round(value)));
  }, [value]);
  return (
    <label>
      {label}
      <input
        className="dw-input"
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={draft}
        onFocus={() => {
          focused.current = true;
          cancelled.current = false;
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          focused.current = false;
          const n = Number(draft);
          if (!cancelled.current && draft.trim() && Number.isFinite(n))
            onCommit(round(clamp(n, min, max)));
          else setDraft(String(round(value)));
          cancelled.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}
export function DesignEditor({
  value,
  onChange,
}: {
  value: DesignDoc;
  onChange: (doc: DesignDoc) => void;
}) {
  const { t, lang } = useLocale(),
    uid = useId(),
    W = value.w ?? 800,
    H = value.h ?? 500;
  const root = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    artboard = useRef<HTMLDivElement>(null),
    svg = useRef<SVGSVGElement>(null);
  const current = useRef(value);
  current.current = value;
  const history = useRef<{ past: DesignDoc[]; future: DesignDoc[] }>({
      past: [],
      future: [],
    }),
    transaction = useRef<DesignDoc | null>(null),
    gesture = useRef<Gesture | null>(null),
    clipboard = useRef<Shape[]>([]),
    zoomAnchor = useRef<{ point: Point; client: Point } | null>(null),
    marqueeRef = useRef<Box | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0),
    [clipboardVersion, setClipboardVersion] = useState(0),
    [ids, setIds] = useState<string[]>([]),
    [panel, setPanel] = useState<"layers" | "properties">("layers"),
    [panelOpen, setPanelOpen] = useState(true),
    [zoom, setZoom] = useState(1),
    [fitMode, setFitMode] = useState(true),
    [grid, setGrid] = useState(false),
    [snap, setSnap] = useState(true),
    [spacing, setSpacing] = useState(8),
    [hand, setHand] = useState(false),
    [space, setSpace] = useState(false),
    [marquee, setMarquee] = useState<Box | null>(null),
    [guides, setGuides] = useState<{ x?: number; y?: number }>({}),
    [help, setHelp] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [exportScale, setExportScale] = useState(2),
    [transparent, setTransparent] = useState(false),
    [exporting, setExporting] = useState(false),
    [alignTo, setAlignTo] = useState<"canvas" | "selection">("canvas"),
    [inline, setInline] = useState<{ id: string; text: string } | null>(null);
  useEffect(() => {
    setNotice("");
    setError("");
  }, [lang]);
  const selected = value.shapes.filter((s) => ids.includes(s.id)),
    editable = selected.filter((s) => !s.locked),
    visibleSelection = selected.filter((s) => !s.hidden),
    cur = selected.length === 1 ? selected[0] : null,
    selectionBox = boundsOf(visibleSelection),
    allLocked = selected.length > 0 && !editable.length,
    editableBounds = boundsOf(editable);
  const typeLabel = (type: Shape["type"]) =>
    t(
      {
        rect: L("Прямоугольник", "Rectangle", "Тіктөртбұрыш"),
        ellipse: L("Эллипс", "Ellipse", "Эллипс"),
        triangle: L("Треугольник", "Triangle", "Үшбұрыш"),
        text: L("Текст", "Text", "Мәтін"),
      }[type],
    );
  const nameFor = (s: Shape) =>
    s.name ||
    (s.type === "text"
      ? s.text?.split("\n")[0] || typeLabel("text")
      : typeLabel(s.type));
  const apply = (doc: DesignDoc) => {
    current.current = doc;
    onChange(doc);
  };
  const finish = () => {
    const before = transaction.current;
    transaction.current = null;
    if (before && !sameDocument(before, current.current)) {
      history.current.past = [...history.current.past.slice(-79), before];
      history.current.future = [];
      setHistoryVersion((n) => n + 1);
    }
  };
  const begin = () => {
    if (!transaction.current) transaction.current = current.current;
  };
  const commit = (doc: DesignDoc) => {
    finish();
    if (sameDocument(doc, current.current)) return;
    history.current.past = [
      ...history.current.past.slice(-79),
      current.current,
    ];
    history.current.future = [];
    apply(doc);
    setHistoryVersion((n) => n + 1);
    setError("");
  };
  const undo = () => {
    finish();
    const before = history.current.past.pop();
    if (!before) return;
    history.current.future.push(current.current);
    apply(before);
    setInline(null);
    setHistoryVersion((n) => n + 1);
  };
  const redo = () => {
    finish();
    const after = history.current.future.pop();
    if (!after) return;
    history.current.past.push(current.current);
    apply(after);
    setInline(null);
    setHistoryVersion((n) => n + 1);
  };
  const patch = (change: Partial<Shape>, live = false) => {
    const doc = current.current,
      next = {
        ...doc,
        shapes: doc.shapes.map((s) =>
          ids.includes(s.id) && !s.locked ? { ...s, ...change } : s,
        ),
      };
    if (live) {
      begin();
      apply(next);
    } else commit(next);
  };
  const patchOne = (id: string, change: Partial<Shape>) => {
    const doc = current.current;
    commit({
      ...doc,
      shapes: doc.shapes.map((s) => (s.id === id ? { ...s, ...change } : s)),
    });
  };
  useEffect(() => {
    setIds((old) => old.filter((id) => value.shapes.some((s) => s.id === id)));
  }, [value.shapes.length]);
  useEffect(() => {
    let active = true;
    void document.fonts?.ready.then(() => {
      if (active) setHistoryVersion((v) => v + 1);
    });
    return () => {
      active = false;
    };
  }, []);
  const fit = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    setFitMode(true);
    setZoom(
      clamp(
        Math.min((el.clientWidth - 80) / W, (el.clientHeight - 80) / H),
        0.1,
        2,
      ),
    );
    requestAnimationFrame(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    });
  }, [W, H]);
  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (fitMode) fit();
    });
    observer.observe(el);
    if (fitMode) fit();
    return () => observer.disconnect();
  }, [fitMode, fit, panelOpen]);
  const zoomAt = (next: number, client?: Point) => {
    const v = viewport.current,
      a = artboard.current;
    if (!v || !a) return;
    const r = a.getBoundingClientRect(),
      vr = v.getBoundingClientRect(),
      c = client ?? { x: vr.left + vr.width / 2, y: vr.top + vr.height / 2 };
    zoomAnchor.current = {
      point: { x: (c.x - r.left) / zoom, y: (c.y - r.top) / zoom },
      client: c,
    };
    setFitMode(false);
    setZoom(clamp(next, 0.1, 4));
  };
  useLayoutEffect(() => {
    if (!zoomAnchor.current || !artboard.current || !viewport.current) return;
    const r = artboard.current.getBoundingClientRect(),
      a = zoomAnchor.current;
    viewport.current.scrollLeft += r.left + a.point.x * zoom - a.client.x;
    viewport.current.scrollTop += r.top + a.point.y * zoom - a.client.y;
    zoomAnchor.current = null;
  }, [zoom]);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomAt(zoom * Math.exp(-e.deltaY * 0.004), {
          x: e.clientX,
          y: e.clientY,
        });
      }
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [zoom]);
  useEffect(() => {
    const release = (e: globalThis.KeyboardEvent) => {
        if (e.code === "Space") setSpace(false);
      },
      blur = () => setSpace(false);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", blur);
    };
  }, []);
  const select = (id: string, add = false) =>
    setIds((old) =>
      add
        ? old.includes(id)
          ? old.filter((x) => x !== id)
          : [...old, id]
        : [id],
    );
  const point = (e: { clientX: number; clientY: number }) => {
    const r = svg.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * W) / r.width,
      y: ((e.clientY - r.top) * H) / r.height,
    };
  };
  const capture = (e: ReactPointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };
  const startPan = (e: ReactPointerEvent) => {
    const v = viewport.current;
    if (!v) return;
    gesture.current = {
      mode: "pan",
      origin: { x: e.clientX, y: e.clientY },
      left: v.scrollLeft,
      top: v.scrollTop,
    };
    capture(e);
    e.preventDefault();
  };
  const backgroundDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (space || hand || e.button === 1) {
      startPan(e);
      return;
    }
    if (inline) return;
    const origin = point(e),
      box = { x: origin.x, y: origin.y, w: 0, h: 0 };
    gesture.current = { mode: "marquee", origin, added: e.shiftKey ? ids : [] };
    marqueeRef.current = box;
    setMarquee(box);
    if (!e.shiftKey) setIds([]);
    capture(e);
    e.preventDefault();
  };
  const shapeDown = (e: ReactPointerEvent, s: Shape) => {
    e.stopPropagation();
    if (e.button !== 0 && e.button !== 1) return;
    if (space || hand || e.button === 1) {
      startPan(e);
      return;
    }
    if (inline) return;
    if (e.shiftKey) {
      select(s.id, true);
      return;
    }
    const nextIds = ids.includes(s.id) ? ids : [s.id];
    setIds(nextIds);
    setPanel("properties");
    if (s.locked) return;
    const doc = current.current,
      moving = doc.shapes.filter(
        (x) => nextIds.includes(x.id) && !x.locked && !x.hidden,
      ),
      box = boundsOf(moving);
    if (!box) return;
    begin();
    gesture.current = {
      mode: "move",
      before: doc,
      origin: point(e),
      ids: moving.map((x) => x.id),
      box,
    };
    capture(e);
    e.preventDefault();
    root.current?.focus({ preventScroll: true });
  };
  const resizeDown = (e: ReactPointerEvent, s: Shape, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (s.locked) return;
    const b = localBounds(s),
      center = { x: b.x + b.w / 2, y: b.y + b.h / 2 },
      opposite = {
        x: corner.includes("w") ? b.x + b.w : b.x,
        y: corner.includes("n") ? b.y + b.h : b.y,
      };
    begin();
    gesture.current = {
      mode: "resize",
      before: current.current,
      original: s,
      corner,
      anchor: rotatePoint(opposite, center, s.rot ?? 0),
    };
    capture(e);
  };
  const rotateDown = (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const box = boundsOf(editable.filter((s) => !s.hidden));
    if (!box) return;
    const center = { x: box.x + box.w / 2, y: box.y + box.h / 2 },
      p = point(e);
    begin();
    gesture.current = {
      mode: "rotate",
      before: current.current,
      ids: editable.map((s) => s.id),
      center,
      angle: Math.atan2(p.y - center.y, p.x - center.x),
    };
    capture(e);
  };
  const move = (e: ReactPointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    if (g.mode === "pan") {
      if (viewport.current) {
        viewport.current.scrollLeft = g.left - (e.clientX - g.origin.x);
        viewport.current.scrollTop = g.top - (e.clientY - g.origin.y);
      }
      return;
    }
    const p = point(e);
    if (g.mode === "marquee") {
      const b = {
        x: Math.min(p.x, g.origin.x),
        y: Math.min(p.y, g.origin.y),
        w: Math.abs(p.x - g.origin.x),
        h: Math.abs(p.y - g.origin.y),
      };
      marqueeRef.current = b;
      setMarquee(b);
      return;
    }
    if (g.mode === "move") {
      let dx = p.x - g.origin.x,
        dy = p.y - g.origin.y;
      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      const lines: { x?: number; y?: number } = {};
      if (snap && !e.altKey) {
        dx = Math.round((g.box.x + dx) / spacing) * spacing - g.box.x;
        dy = Math.round((g.box.y + dy) / spacing) * spacing - g.box.y;
        const other = g.before.shapes
            .filter((s) => !g.ids.includes(s.id) && !s.hidden)
            .map(visualBounds),
          xs = [
            0,
            W / 2,
            W,
            ...other.flatMap((b) => [b.x, b.x + b.w / 2, b.x + b.w]),
          ],
          ys = [
            0,
            H / 2,
            H,
            ...other.flatMap((b) => [b.y, b.y + b.h / 2, b.y + b.h]),
          ];
        let bestX = 5 / zoom,
          bestY = 5 / zoom,
          adjustX = 0,
          adjustY = 0;
        for (const x of xs)
          for (const edge of [
            g.box.x,
            g.box.x + g.box.w / 2,
            g.box.x + g.box.w,
          ]) {
            const delta = x - (edge + dx);
            if (Math.abs(delta) < bestX) {
              bestX = Math.abs(delta);
              adjustX = delta;
              lines.x = x;
            }
          }
        for (const y of ys)
          for (const edge of [
            g.box.y,
            g.box.y + g.box.h / 2,
            g.box.y + g.box.h,
          ]) {
            const delta = y - (edge + dy);
            if (Math.abs(delta) < bestY) {
              bestY = Math.abs(delta);
              adjustY = delta;
              lines.y = y;
            }
          }
        dx += adjustX;
        dy += adjustY;
      }
      setGuides(lines);
      apply({
        ...g.before,
        shapes: g.before.shapes.map((s) =>
          g.ids.includes(s.id)
            ? {
                ...s,
                x: round(clamp(s.x + dx, -10000, 10000)),
                y: round(clamp(s.y + dy, -10000, 10000)),
              }
            : s,
        ),
      });
      return;
    }
    if (g.mode === "resize") {
      const s = g.original,
        b = localBounds(s),
        local = rotatePoint(p, g.anchor, -(s.rot ?? 0)),
        sx = g.corner.includes("w") ? -1 : 1,
        sy = g.corner.includes("n") ? -1 : 1;
      let w = clamp((local.x - g.anchor.x) * sx, 8, 10000),
        h = clamp((local.y - g.anchor.y) * sy, 8, 10000),
        extra: Partial<Shape> = {};
      if (e.shiftKey || s.type === "text") {
        const factor =
          Math.abs(w / b.w - 1) >= Math.abs(h / b.h - 1) ? w / b.w : h / b.h;
        w = clamp(b.w * factor, 8, 10000);
        h = clamp(b.h * factor, 8, 10000);
        if (s.type === "text") {
          extra = {
            size: round(clamp((s.size ?? 36) * factor, 8, 1000)),
            letterSpacing: round(
              clamp((s.letterSpacing ?? 0) * factor, -20, 100),
            ),
          };
          const measured = textMetrics({ ...s, ...extra });
          w = measured.w;
          h = measured.h;
        }
      }
      const center = rotatePoint(
        { x: g.anchor.x + (sx * w) / 2, y: g.anchor.y + (sy * h) / 2 },
        g.anchor,
        s.rot ?? 0,
      );
      apply({
        ...g.before,
        shapes: g.before.shapes.map((shape) =>
          shape.id === s.id
            ? {
                ...shape,
                ...extra,
                x: round(clamp(center.x - w / 2, -10000, 10000)),
                y: round(clamp(center.y - h / 2, -10000, 10000)),
                w: round(w),
                h: round(h),
              }
            : shape,
        ),
      });
      return;
    }
    if (g.mode === "rotate") {
      let delta =
        ((Math.atan2(p.y - g.center.y, p.x - g.center.x) - g.angle) * 180) /
        Math.PI;
      if (e.shiftKey) delta = Math.round(delta / 15) * 15;
      apply({
        ...g.before,
        shapes: g.before.shapes.map((s) => {
          if (!g.ids.includes(s.id)) return s;
          const b = localBounds(s),
            c = rotatePoint(
              { x: b.x + b.w / 2, y: b.y + b.h / 2 },
              g.center,
              delta,
            );
          return {
            ...s,
            x: round(clamp(c.x - b.w / 2, -10000, 10000)),
            y: round(clamp(c.y - b.h / 2, -10000, 10000)),
            rot: round(
              (((((s.rot ?? 0) + delta + 180) % 360) + 360) % 360) - 180,
            ),
          };
        }),
      });
    }
  };
  const end = () => {
    const g = gesture.current,
      b = marqueeRef.current;
    if (g?.mode === "marquee" && b) {
      const hit = current.current.shapes
        .filter((s) => !s.hidden && !s.locked && intersects(b, visualBounds(s)))
        .map((s) => s.id);
      setIds([...new Set([...g.added, ...hit])]);
    }
    gesture.current = null;
    marqueeRef.current = null;
    setMarquee(null);
    setGuides({});
    finish();
  };
  const cancelGesture = () => {
    const g = gesture.current;
    if (g && "before" in g) apply(g.before);
    transaction.current = null;
    gesture.current = null;
    marqueeRef.current = null;
    setMarquee(null);
    setGuides({});
  };
  const add = (type: Shape["type"]) => {
    const doc = current.current;
    if (doc.shapes.length >= MAX_SHAPES) {
      setError(
        t(L("Лимит — 500 слоёв.", "Limit: 500 layers.", "Шектеу: 500 қабат.")),
      );
      return;
    }
    const shape: Shape = {
      id: crypto.randomUUID(),
      type,
      x: round(W / 2 - 85),
      y: round(H / 2 - 55),
      w: 170,
      h: 110,
      fill: type === "text" ? "#1a1a1a" : "#e8590c",
      size: 40,
      text:
        type === "text"
          ? t(L("Ваш текст", "Your text", "Сіздің мәтініңіз"))
          : undefined,
      rot: 0,
      op: 1,
      r: type === "rect" ? 8 : 0,
      font: FONTS[0],
      bold: type === "text",
      lineHeight: 1.2,
    };
    commit({ ...doc, shapes: [...doc.shapes, shape] });
    setIds([shape.id]);
    setPanel("properties");
    setHand(false);
  };
  const duplicate = () => {
    const doc = current.current,
      copies = doc.shapes
        .filter((s) => ids.includes(s.id) && !s.locked)
        .map((s) => ({
          ...s,
          id: crypto.randomUUID(),
          x: clamp(s.x + 20, -10000, 10000),
          y: clamp(s.y + 20, -10000, 10000),
          hidden: false,
          name: s.name
            ? `${s.name} ${t(L("копия", "copy", "көшірме"))}`.slice(0, 80)
            : undefined,
        }));
    if (!copies.length) return;
    if (doc.shapes.length + copies.length > MAX_SHAPES) {
      setError(
        t(
          L("Максимум 500 слоёв.", "Maximum 500 layers.", "Ең көбі 500 қабат."),
        ),
      );
      return;
    }
    commit({ ...doc, shapes: [...doc.shapes, ...copies] });
    setIds(copies.map((s) => s.id));
  };
  const remove = () => {
    const doc = current.current,
      deleting = doc.shapes
        .filter((s) => ids.includes(s.id) && !s.locked)
        .map((s) => s.id);
    if (!deleting.length) return;
    commit({
      ...doc,
      shapes: doc.shapes.filter((s) => !deleting.includes(s.id)),
    });
    setIds(ids.filter((id) => !deleting.includes(id)));
  };
  const copy = () => {
    clipboard.current = current.current.shapes
      .filter((s) => ids.includes(s.id))
      .map((s) => ({ ...s }));
    setClipboardVersion((v) => v + 1);
    setNotice(
      t(
        L(
          "Скопировано в буфер студии.",
          "Copied to the studio clipboard.",
          "Студия буферіне көшірілді.",
        ),
      ),
    );
  };
  const paste = () => {
    const doc = current.current;
    if (!clipboard.current.length) return;
    if (doc.shapes.length + clipboard.current.length > MAX_SHAPES) {
      setError(
        t(
          L("Максимум 500 слоёв.", "Maximum 500 layers.", "Ең көбі 500 қабат."),
        ),
      );
      return;
    }
    const pasted = clipboard.current.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      locked: false,
      hidden: false,
      x: clamp(s.x + 20, -10000, 10000),
      y: clamp(s.y + 20, -10000, 10000),
    }));
    commit({ ...doc, shapes: [...doc.shapes, ...pasted] });
    clipboard.current = pasted;
    setIds(pasted.map((s) => s.id));
    setPanel("properties");
  };
  const reorder = (up: boolean, all = false) => {
    const doc = current.current,
      moving = new Set(
        doc.shapes
          .filter((s) => ids.includes(s.id) && !s.locked)
          .map((s) => s.id),
      );
    if (!moving.size) return;
    let shapes = [...doc.shapes];
    if (all) {
      const chosen = shapes.filter((s) => moving.has(s.id)),
        rest = shapes.filter((s) => !moving.has(s.id));
      shapes = up ? [...rest, ...chosen] : [...chosen, ...rest];
    } else if (up) {
      for (let i = shapes.length - 2; i >= 0; i--)
        if (moving.has(shapes[i].id) && !moving.has(shapes[i + 1].id))
          [shapes[i], shapes[i + 1]] = [shapes[i + 1], shapes[i]];
    } else {
      for (let i = 1; i < shapes.length; i++)
        if (moving.has(shapes[i].id) && !moving.has(shapes[i - 1].id))
          [shapes[i], shapes[i - 1]] = [shapes[i - 1], shapes[i]];
    }
    commit({ ...doc, shapes });
  };
  const align = (axis: "x" | "y", position: "start" | "center" | "end") => {
    const doc = current.current,
      chosen = doc.shapes.filter((s) => ids.includes(s.id) && !s.locked),
      target =
        alignTo === "canvas" ? { x: 0, y: 0, w: W, h: H } : boundsOf(chosen);
    if (!target) return;
    const length = axis === "x" ? "w" : "h";
    commit({
      ...doc,
      shapes: doc.shapes.map((s) => {
        if (!chosen.includes(s)) return s;
        const b = visualBounds(s),
          delta =
            position === "start"
              ? target[axis] - b[axis]
              : position === "center"
                ? target[axis] + target[length] / 2 - b[axis] - b[length] / 2
                : target[axis] + target[length] - b[axis] - b[length];
        return { ...s, [axis]: round(clamp(s[axis] + delta, -10000, 10000)) };
      }),
    });
  };
  const distribute = (axis: "x" | "y") => {
    const doc = current.current,
      chosen = doc.shapes
        .filter((s) => ids.includes(s.id) && !s.locked)
        .sort((a, b) => visualBounds(a)[axis] - visualBounds(b)[axis]);
    if (chosen.length < 3) return;
    const total = boundsOf(chosen)!,
      length = axis === "x" ? "w" : "h",
      gap =
        (total[length] -
          chosen.reduce((sum, s) => sum + visualBounds(s)[length], 0)) /
        (chosen.length - 1),
      changes = new Map<string, number>();
    let cursor = total[axis];
    for (const s of chosen) {
      const b = visualBounds(s);
      changes.set(
        s.id,
        round(clamp(s[axis] + cursor - b[axis], -10000, 10000)),
      );
      cursor += b[length] + gap;
    }
    commit({
      ...doc,
      shapes: doc.shapes.map((s) =>
        changes.has(s.id) ? { ...s, [axis]: changes.get(s.id)! } : s,
      ),
    });
  };
  const setPosition = (axis: "x" | "y", n: number) => {
    const doc = current.current,
      b = boundsOf(editable);
    if (!b) return;
    const delta = n - b[axis];
    commit({
      ...doc,
      shapes: doc.shapes.map((s) =>
        ids.includes(s.id) && !s.locked
          ? { ...s, [axis]: round(clamp(s[axis] + delta, -10000, 10000)) }
          : s,
      ),
    });
  };
  const template = (kind: "poster" | "card") => {
    const id = () => crypto.randomUUID(),
      base = { rot: 0, op: 1, r: 8, font: FONTS[0], bold: true },
      doc = current.current;
    commit(
      kind === "poster"
        ? {
            ...doc,
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
                text: t(
                  L("Ваш заголовок", "Your headline", "Сіздің тақырыбыңыз"),
                ),
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
                text: t(
                  L(
                    "Подзаголовок и дата",
                    "Subtitle and date",
                    "Тақырыпша және күн",
                  ),
                ),
                size: 24,
                bold: false,
              },
            ],
          }
        : {
            ...doc,
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
                text: t(L("Имя Фамилия", "Full name", "Аты-жөні")),
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
                text: t(L("Дизайнер", "Designer", "Дизайнер")),
                size: 22,
                bold: false,
              },
            ],
          },
    );
    setIds([]);
    setInline(null);
  };
  const key = (e: KeyboardEvent) => {
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement).tagName,
      ) ||
      (e.target as HTMLElement).isContentEditable
    )
      return;
    const mod = e.metaKey || e.ctrlKey,
      k = e.key.toLowerCase();
    if (
      e.code === "Space" &&
      !(e.target as HTMLElement).closest('button,a,[role="tab"]')
    ) {
      e.preventDefault();
      setSpace(true);
      return;
    }
    if (k === "escape") {
      e.preventDefault();
      if (gesture.current) cancelGesture();
      else {
        setIds([]);
        setHand(false);
      }
      return;
    }
    if (mod && k === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if (mod && k === "y") {
      e.preventDefault();
      redo();
    } else if (mod && k === "a") {
      e.preventDefault();
      setIds(
        current.current.shapes
          .filter((s) => !s.hidden && !s.locked)
          .map((s) => s.id),
      );
    } else if (mod && k === "d") {
      e.preventDefault();
      duplicate();
    } else if (mod && k === "c") {
      e.preventDefault();
      copy();
    } else if (mod && k === "v") {
      e.preventDefault();
      paste();
    } else if (k === "delete" || k === "backspace") {
      e.preventDefault();
      remove();
    } else if (k.startsWith("arrow") && editable.length) {
      e.preventDefault();
      begin();
      const n = e.shiftKey ? 10 : 1,
        doc = current.current;
      apply({
        ...doc,
        shapes: doc.shapes.map((s) =>
          ids.includes(s.id) && !s.locked
            ? {
                ...s,
                x: round(
                  clamp(
                    s.x + (k === "arrowright" ? n : k === "arrowleft" ? -n : 0),
                    -10000,
                    10000,
                  ),
                ),
                y: round(
                  clamp(
                    s.y + (k === "arrowdown" ? n : k === "arrowup" ? -n : 0),
                    -10000,
                    10000,
                  ),
                ),
              }
            : s,
        ),
      });
    } else if (!mod && k === "v") setHand(false);
    else if (!mod && k === "h") setHand(true);
    else if (!mod && k === "r") add("rect");
    else if (!mod && k === "o") add("ellipse");
    else if (!mod && k === "t") add("text");
    else if (!mod && k === "0") {
      e.preventDefault();
      fit();
    } else if (!mod && (k === "+" || k === "=")) {
      e.preventDefault();
      zoomAt(zoom * 1.2);
    } else if (!mod && k === "-") {
      e.preventDefault();
      zoomAt(zoom / 1.2);
    }
  };
  const finishInline = () => {
    if (!inline || inlineCancelled.current) {
      inlineCancelled.current = false;
      setInline(null);
      return;
    }
    const s = current.current.shapes.find((s) => s.id === inline.id);
    if (s && !s.locked) patchOne(s.id, { text: inline.text.slice(0, 2000) });
    setInline(null);
  };
  const serialize = () => {
    const el = svg.current!.cloneNode(true) as SVGSVGElement;
    el.querySelectorAll("[data-ui]").forEach((n) => n.remove());
    if (transparent) el.querySelector("[data-background]")?.remove();
    el.removeAttribute("class");
    el.removeAttribute("style");
    el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    el.setAttribute("width", String(W));
    el.setAttribute("height", String(H));
    return new XMLSerializer().serializeToString(el);
  };
  const exportPng = async () => {
    setExporting(true);
    setError("");
    try {
      await document.fonts?.ready;
      const url = URL.createObjectURL(
        new Blob([serialize()], { type: "image/svg+xml" }),
      );
      try {
        const image = new Image();
        await new Promise<void>((ok, no) => {
          image.onload = () => ok();
          image.onerror = () => no(Error("SVG"));
          image.src = url;
        });
        const scale = Math.min(exportScale, 4096 / Math.max(W, H)),
          canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(W * scale));
        canvas.height = Math.max(1, Math.round(H * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw Error("CANVAS");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const output = await new Promise<Blob>((ok, no) =>
          canvas.toBlob(
            (blob) => (blob ? ok(blob) : no(Error("PNG"))),
            "image/png",
          ),
        );
        download("design.png", output);
        setNotice(
          t(L("PNG экспортирован.", "PNG exported.", "PNG экспортталды.")),
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setError(
        t(
          L(
            "Не удалось экспортировать PNG. Попробуйте SVG или меньший размер.",
            "PNG export failed. Try SVG or a smaller size.",
            "PNG экспорты орындалмады. SVG не кіші өлшемді қолданыңыз.",
          ),
        ),
      );
    } finally {
      setExporting(false);
    }
  };
  const rotation = (s: Shape) => {
    const b = localBounds(s);
    return `rotate(${s.rot ?? 0} ${b.x + b.w / 2} ${b.y + b.h / 2})`;
  };
  const inlineCancelled = useRef(false);
  const handleSize = 14 / zoom;
  return (
    <div
      className="design-workbench"
      ref={root}
      tabIndex={0}
      onKeyDown={key}
      onKeyUp={(e) => {
        if (e.key.startsWith("Arrow")) finish();
      }}
      aria-label={t(L("Редактор дизайна", "Design editor", "Дизайн редакторы"))}
      data-history={historyVersion}
      data-clipboard={clipboardVersion}
    >
      {error && (
        <p role="alert" className="dw-error">
          {error}
        </p>
      )}
      <div
        className="dw-topbar"
        role="toolbar"
        aria-label={t(
          L("Действия документа", "Document actions", "Құжат әрекеттері"),
        )}
      >
        <button
          className={iconButton}
          onClick={undo}
          disabled={!history.current.past.length && !transaction.current}
          aria-label={t(L("Отменить", "Undo", "Болдырмау"))}
          title="Ctrl / ⌘ Z"
        >
          <Undo2 size={15} />
        </button>
        <button
          className={iconButton}
          onClick={redo}
          disabled={!history.current.future.length}
          aria-label={t(L("Вернуть", "Redo", "Қайтару"))}
          title="Ctrl / ⌘ Shift Z"
        >
          <Redo2 size={15} />
        </button>
        <span className="dw-divider" />
        <button
          className={iconButton}
          onClick={copy}
          disabled={!selected.length}
          aria-label={t(L("Копировать", "Copy", "Көшіру"))}
          title="Ctrl / ⌘ C"
        >
          <Copy size={14} />
        </button>
        <button
          className={button}
          onClick={paste}
          disabled={!clipboard.current.length}
        >
          {t(L("Вставить", "Paste", "Қою"))}
        </button>
        <span className="dw-divider" />
        <button className={button} onClick={() => template("poster")}>
          {t(L("Шаблон: постер", "Template: poster", "Үлгі: постер"))}
        </button>
        <button className={button} onClick={() => template("card")}>
          {t(L("Шаблон: визитка", "Template: card", "Үлгі: визитка"))}
        </button>
        <span className="dw-spacer" />
        <label className="dw-check">
          <input
            type="checkbox"
            checked={transparent}
            onChange={(e) => setTransparent(e.target.checked)}
          />
          {t(L("Без фона", "Transparent", "Фонсыз"))}
        </label>
        <select
          className="dw-input dw-select"
          aria-label={t(L("Масштаб PNG", "PNG scale", "PNG масштабы"))}
          value={exportScale}
          onChange={(e) => setExportScale(+e.target.value)}
        >
          {[1, 2, 4].map((n) => (
            <option value={n} key={n}>
              {n}× PNG
            </option>
          ))}
        </select>
        <button
          className={button}
          onClick={() => void exportPng()}
          disabled={exporting}
        >
          <Download size={14} />
          {exporting ? "…" : "PNG"}
        </button>
        <button
          className={button}
          onClick={() => download("design.svg", serialize(), "image/svg+xml")}
        >
          <Download size={14} />
          SVG
        </button>
      </div>
      <div className={`dw-grid ${panelOpen ? "" : "dw-no-panel"}`}>
        <div
          className="dw-tools"
          role="toolbar"
          aria-label={t(L("Инструменты", "Tools", "Құралдар"))}
        >
          <button
            className={iconButton}
            aria-label={t(L("Выделение", "Select", "Таңдау"))}
            aria-pressed={!hand}
            title="V"
            onClick={() => setHand(false)}
          >
            <MousePointer2 size={17} />
          </button>
          <button
            className={iconButton}
            aria-label={t(L("Рука", "Hand", "Қол"))}
            aria-pressed={hand}
            title="H / Space"
            onClick={() => setHand(!hand)}
          >
            <Hand size={17} />
          </button>
          <span className="dw-divider" />
          {(
            [
              ["rect", Square],
              ["ellipse", Circle],
              ["triangle", Triangle],
              ["text", Type],
            ] as const
          ).map(([type, Icon]) => (
            <button
              key={type}
              className={iconButton}
              aria-label={typeLabel(type)}
              title={typeLabel(type)}
              onClick={() => add(type)}
            >
              <Icon size={17} />
            </button>
          ))}
          <span className="dw-divider" />
          <button
            className={iconButton}
            disabled={!editable.length}
            onClick={remove}
            aria-label={t(L("Удалить", "Delete", "Жою"))}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="dw-canvas-column">
          <div
            className="dw-viewport"
            ref={viewport}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={cancelGesture}
            style={{ cursor: hand || space ? "grab" : "default" }}
          >
            <div
              className="dw-stage"
              style={{ width: W * zoom + 80, height: H * zoom + 80 }}
              onPointerDown={backgroundDown}
            >
              <div
                className="dw-artboard"
                ref={artboard}
                style={{ width: W * zoom, height: H * zoom }}
              >
                <span className="dw-artboard-label">
                  {t(L("Холст", "Artboard", "Кенеп"))} · {W} × {H}
                </span>
                <svg
                  ref={svg}
                  viewBox={`0 0 ${W} ${H}`}
                  width={W * zoom}
                  height={H * zoom}
                  aria-label={t(
                    L("Холст дизайна", "Design canvas", "Дизайн кенебі"),
                  )}
                >
                  <defs data-ui>
                    <pattern
                      id={`${uid}-grid`}
                      width={spacing}
                      height={spacing}
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
                        fill="none"
                        stroke="#777777"
                        strokeOpacity=".23"
                        strokeWidth={0.6 / zoom}
                      />
                    </pattern>
                  </defs>
                  <rect data-background width={W} height={H} fill={value.bg} />
                  {grid && (
                    <rect
                      data-ui
                      width={W}
                      height={H}
                      fill={`url(#${uid}-grid)`}
                      pointerEvents="none"
                    />
                  )}
                  {value.shapes
                    .filter((s) => !s.hidden)
                    .map((s) => {
                      const b = localBounds(s),
                        textX =
                          s.align === "center"
                            ? s.x + b.w / 2
                            : s.align === "right"
                              ? s.x + b.w
                              : s.x;
                      return (
                        <g
                          key={s.id}
                          data-shape-id={s.id}
                          transform={rotation(s)}
                          stroke={s.stroke ?? "none"}
                          strokeWidth={s.strokeWidth ?? 0}
                          onPointerDown={(e) => shapeDown(e, s)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (s.type === "text" && !s.locked) {
                              setIds([s.id]);
                              setPanel("properties");
                              inlineCancelled.current = false;
                              setInline({ id: s.id, text: s.text ?? "" });
                            }
                          }}
                          style={{
                            cursor:
                              space || hand
                                ? "grab"
                                : s.locked
                                  ? "not-allowed"
                                  : "move",
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
                              opacity={s.op ?? 1}
                            />
                          )}
                          {s.type === "ellipse" && (
                            <ellipse
                              cx={s.x + s.w / 2}
                              cy={s.y + s.h / 2}
                              rx={s.w / 2}
                              ry={s.h / 2}
                              fill={s.fill}
                              opacity={s.op ?? 1}
                            />
                          )}
                          {s.type === "triangle" && (
                            <polygon
                              points={`${s.x + s.w / 2},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`}
                              fill={s.fill}
                              opacity={s.op ?? 1}
                            />
                          )}
                          {s.type === "text" && (
                            <rect
                              data-ui
                              x={b.x}
                              y={b.y}
                              width={b.w}
                              height={b.h}
                              fill="transparent"
                              stroke="none"
                              pointerEvents="all"
                            />
                          )}
                          {s.type === "text" && (
                            <text
                              pointerEvents="bounding-box"
                              x={textX}
                              y={s.y}
                              fontSize={s.size ?? 36}
                              fill={s.fill}
                              opacity={s.op ?? 1}
                              dominantBaseline="text-before-edge"
                              fontFamily={s.font ?? FONTS[0]}
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
                            >
                              {(s.text ?? "").split("\n").map((line, i) => (
                                <tspan
                                  x={textX}
                                  y={
                                    s.y +
                                    i * (s.size ?? 36) * (s.lineHeight ?? 1.2)
                                  }
                                  key={i}
                                >
                                  {line || "\u00a0"}
                                </tspan>
                              ))}
                            </text>
                          )}
                          {ids.includes(s.id) && (
                            <rect
                              data-ui
                              x={b.x}
                              y={b.y}
                              width={b.w}
                              height={b.h}
                              fill="none"
                              stroke={s.locked ? "#888888" : "#2563eb"}
                              strokeWidth={1 / zoom}
                              strokeDasharray={
                                s.locked ? `${4 / zoom} ${3 / zoom}` : undefined
                              }
                              pointerEvents="none"
                            />
                          )}
                          {cur?.id === s.id &&
                            !s.locked &&
                            !inline &&
                            (["nw", "ne", "sw", "se"] as const).map(
                              (corner) => {
                                const x = corner.includes("w")
                                    ? b.x
                                    : b.x + b.w,
                                  y = corner.includes("n") ? b.y : b.y + b.h;
                                return (
                                  <rect
                                    key={corner}
                                    data-ui
                                    x={x - handleSize / 2}
                                    y={y - handleSize / 2}
                                    width={handleSize}
                                    height={handleSize}
                                    fill="white"
                                    stroke="#2563eb"
                                    strokeWidth={1 / zoom}
                                    style={{ cursor: `${corner}-resize` }}
                                    onPointerDown={(e) =>
                                      resizeDown(e, s, corner)
                                    }
                                  />
                                );
                              },
                            )}
                          {inline?.id === s.id && (
                            <foreignObject
                              data-ui
                              x={s.x}
                              y={s.y}
                              width={Math.max(150, b.w + 30)}
                              height={Math.max(80, b.h + 40)}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <textarea
                                className="dw-inline-text"
                                autoFocus
                                aria-label={t(
                                  L(
                                    "Текст на холсте",
                                    "Canvas text",
                                    "Кенеп мәтіні",
                                  ),
                                )}
                                value={inline.text}
                                maxLength={2000}
                                onChange={(e) =>
                                  setInline({ ...inline, text: e.target.value })
                                }
                                onBlur={finishInline}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === "Escape") {
                                    inlineCancelled.current = true;
                                    setInline(null);
                                  } else if (
                                    e.key === "Enter" &&
                                    (e.ctrlKey || e.metaKey)
                                  ) {
                                    e.preventDefault();
                                    finishInline();
                                  }
                                }}
                                style={{
                                  fontFamily: s.font ?? FONTS[0],
                                  fontSize: s.size ?? 36,
                                  fontWeight: s.bold ? 700 : 400,
                                  fontStyle: s.italic ? "italic" : "normal",
                                  lineHeight: s.lineHeight ?? 1.2,
                                  letterSpacing: s.letterSpacing ?? 0,
                                }}
                              />
                            </foreignObject>
                          )}
                        </g>
                      );
                    })}
                  {selectionBox && visibleSelection.length > 1 && (
                    <rect
                      data-ui
                      x={selectionBox.x}
                      y={selectionBox.y}
                      width={selectionBox.w}
                      height={selectionBox.h}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth={1 / zoom}
                      strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                      pointerEvents="none"
                    />
                  )}
                  {selectionBox && editable.length > 0 && !inline && (
                    <g data-ui>
                      <line
                        x1={selectionBox.x + selectionBox.w / 2}
                        y1={selectionBox.y}
                        x2={selectionBox.x + selectionBox.w / 2}
                        y2={selectionBox.y - 24 / zoom}
                        stroke="#2563eb"
                        strokeWidth={1 / zoom}
                        pointerEvents="none"
                      />
                      <circle
                        cx={selectionBox.x + selectionBox.w / 2}
                        cy={selectionBox.y - 24 / zoom}
                        r={6 / zoom}
                        fill="white"
                        stroke="#2563eb"
                        strokeWidth={1 / zoom}
                        onPointerDown={rotateDown}
                        style={{ cursor: "grab" }}
                      />
                    </g>
                  )}
                  {guides.x !== undefined && (
                    <line
                      data-ui
                      x1={guides.x}
                      y1={0}
                      x2={guides.x}
                      y2={H}
                      stroke="#f043aa"
                      strokeWidth={1 / zoom}
                      pointerEvents="none"
                    />
                  )}
                  {guides.y !== undefined && (
                    <line
                      data-ui
                      x1={0}
                      y1={guides.y}
                      x2={W}
                      y2={guides.y}
                      stroke="#f043aa"
                      strokeWidth={1 / zoom}
                      pointerEvents="none"
                    />
                  )}
                  {marquee && (
                    <rect
                      data-ui
                      x={marquee.x}
                      y={marquee.y}
                      width={marquee.w}
                      height={marquee.h}
                      fill="#2563eb"
                      fillOpacity=".08"
                      stroke="#2563eb"
                      strokeWidth={1 / zoom}
                      pointerEvents="none"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
        {panelOpen && (
          <aside className="dw-panel">
            <div className="dw-tabs" role="tablist">
              <button
                id={`${uid}-layers-tab`}
                className="dw-tab"
                role="tab"
                aria-selected={panel === "layers"}
                aria-controls={`${uid}-panel`}
                onClick={() => setPanel("layers")}
              >
                <Layers size={13} className="mr-1 inline" />
                {t(L("Слои", "Layers", "Қабаттар"))}
              </button>
              <button
                id={`${uid}-properties-tab`}
                className="dw-tab"
                role="tab"
                aria-selected={panel === "properties"}
                aria-controls={`${uid}-panel`}
                onClick={() => setPanel("properties")}
              >
                <Settings2 size={13} className="mr-1 inline" />
                {t(L("Свойства", "Properties", "Қасиеттер"))}
              </button>
            </div>
            <div
              id={`${uid}-panel`}
              role="tabpanel"
              aria-labelledby={`${uid}-${panel}-tab`}
              className="dw-panel-body"
            >
              {panel === "layers" ? (
                <>
                  <p className="dw-hint mb-3">
                    {t(
                      L(
                        "Shift + клик — несколько слоёв. Верхние слои находятся на переднем плане.",
                        "Shift-click selects several layers. Top layers appear in front.",
                        "Shift + басу — бірнеше қабат. Жоғарғы қабат алдыңғы орында.",
                      ),
                    )}
                  </p>
                  {!value.shapes.length ? (
                    <div className="dw-empty">
                      <Layers size={25} />
                      <p>
                        {t(
                          L(
                            "Добавьте фигуру или текст. Каждый объект появится здесь отдельным слоем.",
                            "Add a shape or text. Each object appears here as a layer.",
                            "Пішін не мәтін қосыңыз. Әр нысан бөлек қабат ретінде көрсетіледі.",
                          ),
                        )}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {[...value.shapes].reverse().map((s) => (
                        <div
                          key={s.id}
                          className={`dw-layer ${s.hidden ? "is-hidden" : ""}`}
                          data-selected={ids.includes(s.id)}
                        >
                          <button
                            className="dw-layer-name"
                            aria-pressed={ids.includes(s.id)}
                            onClick={(e) => select(s.id, e.shiftKey)}
                            onDoubleClick={() => {
                              setIds([s.id]);
                              setPanel("properties");
                            }}
                          >
                            {s.type === "text" ? (
                              <Type size={13} />
                            ) : s.type === "ellipse" ? (
                              <Circle size={13} />
                            ) : s.type === "triangle" ? (
                              <Triangle size={13} />
                            ) : (
                              <Square size={13} />
                            )}
                            <span>{nameFor(s)}</span>
                          </button>
                          <button
                            className="dw-layer-action"
                            aria-label={t(
                              L(
                                "Видимость слоя",
                                "Layer visibility",
                                "Қабат көрінуі",
                              ),
                            )}
                            aria-pressed={!s.hidden}
                            onClick={() =>
                              patchOne(s.id, { hidden: !s.hidden })
                            }
                          >
                            {s.hidden ? (
                              <EyeOff size={13} />
                            ) : (
                              <Eye size={13} />
                            )}
                          </button>
                          <button
                            className="dw-layer-action"
                            aria-label={t(
                              L(
                                "Блокировка слоя",
                                "Lock layer",
                                "Қабатты құлыптау",
                              ),
                            )}
                            aria-pressed={!!s.locked}
                            onClick={() =>
                              patchOne(s.id, { locked: !s.locked })
                            }
                          >
                            {s.locked ? (
                              <Lock size={13} />
                            ) : (
                              <Unlock size={13} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="dw-section mt-4">
                    <div className="dw-section-title">
                      {t(L("Порядок слоёв", "Stacking order", "Қабат реті"))}
                    </div>
                    <div className="dw-actions">
                      <button
                        className={iconButton}
                        aria-label={t(
                          L(
                            "На передний план",
                            "Bring to front",
                            "Алдыңғы орынға",
                          ),
                        )}
                        disabled={!editable.length}
                        onClick={() => reorder(true, true)}
                      >
                        <ArrowUp size={14} />
                        <ArrowUp size={10} />
                      </button>
                      <button
                        className={iconButton}
                        aria-label={t(L("Выше", "Forward", "Алға"))}
                        disabled={!editable.length}
                        onClick={() => reorder(true)}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        className={iconButton}
                        aria-label={t(L("Ниже", "Backward", "Артқа"))}
                        disabled={!editable.length}
                        onClick={() => reorder(false)}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        className={iconButton}
                        aria-label={t(
                          L("На задний план", "Send to back", "Артқы орынға"),
                        )}
                        disabled={!editable.length}
                        onClick={() => reorder(false, true)}
                      >
                        <ArrowDown size={14} />
                        <ArrowDown size={10} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {selected.length > 0 ? (
                    <>
                      <div className="dw-title">
                        <span
                          className="dw-swatch"
                          style={{
                            background: cur?.fill ?? "hsl(var(--primary))",
                          }}
                        />
                        {cur
                          ? nameFor(cur)
                          : `${selected.length} ${t(L("слоёв", "layers", "қабат"))}`}
                      </div>
                      {allLocked && (
                        <div className="dw-lock-note">
                          <Lock size={13} className="mr-1 inline" />
                          {t(
                            L(
                              "Слой заблокирован. Разблокируйте его для редактирования.",
                              "Layer locked. Unlock to edit.",
                              "Қабат құлыпталған. Өңдеу үшін ашыңыз.",
                            ),
                          )}
                          <button
                            className={`${button} mt-2`}
                            onClick={() => {
                              const doc = current.current;
                              commit({
                                ...doc,
                                shapes: doc.shapes.map((s) =>
                                  ids.includes(s.id)
                                    ? { ...s, locked: false }
                                    : s,
                                ),
                              });
                            }}
                          >
                            {t(L("Разблокировать", "Unlock", "Құлыпты ашу"))}
                          </button>
                        </div>
                      )}
                      <div className="dw-section">
                        <div className="dw-section-title">
                          {t(L("Геометрия", "Geometry", "Геометрия"))}
                        </div>
                        {cur && (
                          <label className="dw-label">
                            {t(L("Имя слоя", "Layer name", "Қабат атауы"))}
                            <input
                              className="dw-input"
                              value={cur.name ?? ""}
                              maxLength={80}
                              disabled={cur.locked}
                              placeholder={nameFor(cur)}
                              onFocus={begin}
                              onChange={(e) =>
                                patch({ name: e.target.value }, true)
                              }
                              onBlur={finish}
                            />
                          </label>
                        )}
                        <div className="dw-fields mt-3">
                          <NumberField
                            label="X"
                            value={cur?.x ?? editableBounds?.x ?? 0}
                            disabled={allLocked}
                            onCommit={(n) =>
                              cur ? patch({ x: n }) : setPosition("x", n)
                            }
                          />
                          <NumberField
                            label="Y"
                            value={cur?.y ?? editableBounds?.y ?? 0}
                            disabled={allLocked}
                            onCommit={(n) =>
                              cur ? patch({ y: n }) : setPosition("y", n)
                            }
                          />
                          {cur && cur.type !== "text" && (
                            <>
                              <NumberField
                                label={t(L("Ширина", "Width", "Ені"))}
                                value={cur.w}
                                min={1}
                                disabled={cur.locked}
                                onCommit={(n) => patch({ w: n })}
                              />
                              <NumberField
                                label={t(L("Высота", "Height", "Биіктігі"))}
                                value={cur.h}
                                min={1}
                                disabled={cur.locked}
                                onCommit={(n) => patch({ h: n })}
                              />
                            </>
                          )}
                          {cur && (
                            <NumberField
                              label={t(
                                L("Поворот, °", "Rotation, °", "Бұрылу, °"),
                              )}
                              value={cur.rot ?? 0}
                              min={-360}
                              max={360}
                              disabled={cur.locked}
                              onCommit={(n) => patch({ rot: n })}
                            />
                          )}
                          <NumberField
                            label={t(
                              L(
                                "Непрозрачность, %",
                                "Opacity, %",
                                "Мөлдірсіздік, %",
                              ),
                            )}
                            value={(cur?.op ?? 1) * 100}
                            min={0}
                            max={100}
                            disabled={allLocked}
                            onCommit={(n) => patch({ op: n / 100 })}
                          />
                        </div>
                      </div>
                      <div className="dw-section">
                        <div className="dw-section-title">
                          {t(L("Оформление", "Appearance", "Көрініс"))}
                        </div>
                        <div className="dw-fields">
                          <label>
                            {t(L("Заливка", "Fill", "Толтыру"))}
                            <input
                              type="color"
                              className="dw-input"
                              value={
                                cur?.fill ?? editable[0]?.fill ?? "#000000"
                              }
                              disabled={allLocked}
                              onFocus={begin}
                              onChange={(e) =>
                                patch({ fill: e.target.value }, true)
                              }
                              onBlur={finish}
                            />
                          </label>
                          <label>
                            {t(L("Обводка", "Stroke", "Жиек"))}
                            <input
                              type="color"
                              className="dw-input"
                              value={cur?.stroke ?? "#000000"}
                              disabled={allLocked}
                              onFocus={begin}
                              onChange={(e) =>
                                patch(
                                  {
                                    stroke: e.target.value,
                                    strokeWidth: cur?.strokeWidth || 1,
                                  },
                                  true,
                                )
                              }
                              onBlur={finish}
                            />
                          </label>
                          <NumberField
                            label={t(
                              L(
                                "Толщина обводки",
                                "Stroke width",
                                "Жиек қалыңдығы",
                              ),
                            )}
                            min={0}
                            max={30}
                            step={0.5}
                            value={cur?.strokeWidth ?? 0}
                            disabled={allLocked}
                            onCommit={(n) => patch({ strokeWidth: n })}
                          />
                          {cur?.type === "rect" && (
                            <NumberField
                              label={t(
                                L("Скругление", "Corner radius", "Дөңгелектеу"),
                              )}
                              min={0}
                              max={Math.min(cur.w, cur.h) / 2}
                              value={cur.r ?? 0}
                              disabled={cur.locked}
                              onCommit={(n) => patch({ r: n })}
                            />
                          )}
                        </div>
                      </div>
                      {cur?.type === "text" && (
                        <div className="dw-section">
                          <div className="dw-section-title">
                            {t(L("Типографика", "Typography", "Типографика"))}
                          </div>
                          <label className="dw-label">
                            {t(L("Текст", "Text", "Мәтін"))}
                            <textarea
                              className="dw-input"
                              rows={4}
                              maxLength={2000}
                              value={cur.text ?? ""}
                              disabled={cur.locked}
                              onFocus={begin}
                              onChange={(e) =>
                                patch({ text: e.target.value }, true)
                              }
                              onBlur={finish}
                            />
                          </label>
                          <label className="dw-label mt-3">
                            {t(L("Шрифт", "Typeface", "Қаріп"))}
                            <select
                              className="dw-input"
                              value={cur.font ?? FONTS[0]}
                              disabled={cur.locked}
                              onChange={(e) => patch({ font: e.target.value })}
                            >
                              {FONTS.map((f) => (
                                <option key={f} value={f}>
                                  {f.split(",")[0].replace(/"/g, "")}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="dw-fields mt-3">
                            <NumberField
                              label={t(
                                L("Размер, px", "Size, px", "Өлшем, px"),
                              )}
                              value={cur.size ?? 36}
                              min={1}
                              max={1000}
                              disabled={cur.locked}
                              onCommit={(n) => patch({ size: n })}
                            />
                            <NumberField
                              label={t(
                                L("Интерлиньяж", "Line height", "Жол биіктігі"),
                              )}
                              value={cur.lineHeight ?? 1.2}
                              min={0.8}
                              max={3}
                              step={0.1}
                              disabled={cur.locked}
                              onCommit={(n) => patch({ lineHeight: n })}
                            />
                            <NumberField
                              label={t(
                                L(
                                  "Трекинг, px",
                                  "Tracking, px",
                                  "Әріп аралығы, px",
                                ),
                              )}
                              value={cur.letterSpacing ?? 0}
                              min={-20}
                              max={100}
                              step={0.5}
                              disabled={cur.locked}
                              onCommit={(n) => patch({ letterSpacing: n })}
                            />
                          </div>
                          <div className="dw-actions mt-3">
                            <button
                              className={button}
                              aria-label={t(L("Жирный", "Bold", "Қалың"))}
                              aria-pressed={!!cur.bold}
                              disabled={cur.locked}
                              onClick={() => patch({ bold: !cur.bold })}
                            >
                              <strong>B</strong>
                            </button>
                            <button
                              className={button}
                              aria-label={t(L("Курсив", "Italic", "Көлбеу"))}
                              aria-pressed={!!cur.italic}
                              disabled={cur.locked}
                              onClick={() => patch({ italic: !cur.italic })}
                            >
                              <em>I</em>
                            </button>
                            {(
                              [
                                ["left", AlignLeft],
                                ["center", AlignCenter],
                                ["right", AlignRight],
                              ] as const
                            ).map(([align, Icon]) => (
                              <button
                                className={iconButton}
                                key={align}
                                aria-label={t(
                                  {
                                    left: L(
                                      "Текст слева",
                                      "Text left",
                                      "Мәтін солға",
                                    ),
                                    center: L(
                                      "Текст по центру",
                                      "Text centered",
                                      "Мәтін ортаға",
                                    ),
                                    right: L(
                                      "Текст справа",
                                      "Text right",
                                      "Мәтін оңға",
                                    ),
                                  }[align],
                                )}
                                aria-pressed={(cur.align ?? "left") === align}
                                disabled={cur.locked}
                                onClick={() => patch({ align })}
                              >
                                <Icon size={14} />
                              </button>
                            ))}
                          </div>
                          <p className="dw-hint mt-3">
                            {t(
                              L(
                                "Двойной клик по тексту на холсте открывает редактирование. Ctrl/⌘ + Enter — применить.",
                                "Double-click canvas text to edit. Ctrl/⌘ + Enter applies.",
                                "Кенеп мәтінін екі рет басып өңдеңіз. Ctrl/⌘ + Enter — қолдану.",
                              ),
                            )}
                          </p>
                        </div>
                      )}
                      <div className="dw-section">
                        <div className="dw-section-title">
                          {t(L("Выравнивание", "Alignment", "Туралау"))}
                        </div>
                        <select
                          className="dw-input"
                          aria-label={t(
                            L("Относительно", "Relative to", "Қатысты"),
                          )}
                          value={alignTo}
                          onChange={(e) =>
                            setAlignTo(e.target.value as "canvas" | "selection")
                          }
                        >
                          <option value="canvas">
                            {t(
                              L(
                                "Относительно холста",
                                "Relative to artboard",
                                "Кенепке қатысты",
                              ),
                            )}
                          </option>
                          <option value="selection">
                            {t(
                              L(
                                "Относительно выделения",
                                "Relative to selection",
                                "Таңдауға қатысты",
                              ),
                            )}
                          </option>
                        </select>
                        <div className="dw-actions mt-3">
                          {(["start", "center", "end"] as const).map(
                            (position, i) => (
                              <button
                                className={iconButton}
                                key={`x${position}`}
                                aria-label={t(
                                  [
                                    L(
                                      "Выровнять слева",
                                      "Align left",
                                      "Солға туралау",
                                    ),
                                    L("По центру ↔", "Center ↔", "Орталау ↔"),
                                    L(
                                      "Выровнять справа",
                                      "Align right",
                                      "Оңға туралау",
                                    ),
                                  ][i],
                                )}
                                disabled={
                                  !editable.length ||
                                  (alignTo === "selection" &&
                                    editable.length < 2)
                                }
                                onClick={() => align("x", position)}
                              >
                                {i === 0 ? (
                                  <AlignLeft size={14} />
                                ) : i === 1 ? (
                                  <AlignCenter size={14} />
                                ) : (
                                  <AlignRight size={14} />
                                )}
                              </button>
                            ),
                          )}
                          {(["start", "center", "end"] as const).map(
                            (position, i) => (
                              <button
                                className={iconButton}
                                key={`y${position}`}
                                aria-label={t(
                                  [
                                    L(
                                      "Выровнять сверху",
                                      "Align top",
                                      "Жоғары туралау",
                                    ),
                                    L("По центру ↕", "Center ↕", "Орталау ↕"),
                                    L(
                                      "Выровнять снизу",
                                      "Align bottom",
                                      "Төмен туралау",
                                    ),
                                  ][i],
                                )}
                                disabled={
                                  !editable.length ||
                                  (alignTo === "selection" &&
                                    editable.length < 2)
                                }
                                onClick={() => align("y", position)}
                              >
                                <span style={{ transform: "rotate(90deg)" }}>
                                  {i === 0 ? (
                                    <AlignLeft size={14} />
                                  ) : i === 1 ? (
                                    <AlignCenter size={14} />
                                  ) : (
                                    <AlignRight size={14} />
                                  )}
                                </span>
                              </button>
                            ),
                          )}
                          <button
                            className={iconButton}
                            aria-label={t(
                              L(
                                "Равные интервалы по горизонтали",
                                "Distribute horizontally",
                                "Көлденең аралықты теңестіру",
                              ),
                            )}
                            disabled={editable.length < 3}
                            onClick={() => distribute("x")}
                          >
                            <AlignHorizontalDistributeCenter size={15} />
                          </button>
                          <button
                            className={iconButton}
                            aria-label={t(
                              L(
                                "Равные интервалы по вертикали",
                                "Distribute vertically",
                                "Тігінен аралықты теңестіру",
                              ),
                            )}
                            disabled={editable.length < 3}
                            onClick={() => distribute("y")}
                          >
                            <AlignVerticalDistributeCenter size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="dw-actions">
                        <button
                          className={button}
                          disabled={!editable.length}
                          onClick={duplicate}
                        >
                          <Copy size={13} />
                          {t(L("Дубль", "Duplicate", "Көшірме"))}
                        </button>
                        <button
                          className={button}
                          disabled={!editable.length}
                          onClick={remove}
                        >
                          <Trash2 size={13} />
                          {t(L("Удалить", "Delete", "Жою"))}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="dw-empty">
                      <MousePointer2 size={25} />
                      <p>
                        {t(
                          L(
                            "Выберите слой на холсте или в списке. Для нескольких объектов используйте Shift или рамку выделения.",
                            "Select a layer on the canvas or in the list. Use Shift or drag a selection box for multiple objects.",
                            "Кенептен не тізімнен қабатты таңдаңыз. Бірнеше нысан үшін Shift не таңдау жақтауын қолданыңыз.",
                          ),
                        )}
                      </p>
                    </div>
                  )}
                  <div className="dw-section mt-5">
                    <div className="dw-section-title">
                      {t(L("Холст", "Artboard", "Кенеп"))}
                    </div>
                    <select
                      className="dw-input"
                      aria-label={t(
                        L("Формат холста", "Artboard preset", "Кенеп пішімі"),
                      )}
                      value={
                        [
                          [800, 500],
                          [800, 800],
                          [500, 890],
                          [1920, 1080],
                        ].some(([w, h]) => w === W && h === H)
                          ? `${W}x${H}`
                          : "custom"
                      }
                      onChange={(e) => {
                        if (e.target.value === "custom") return;
                        const [w, h] = e.target.value.split("x").map(Number);
                        commit({ ...current.current, w, h });
                      }}
                    >
                      <option value="custom">
                        {t(L("Свой размер", "Custom size", "Өз өлшемі"))}
                      </option>
                      {[
                        [800, 500],
                        [800, 800],
                        [500, 890],
                        [1920, 1080],
                      ].map(([w, h]) => (
                        <option value={`${w}x${h}`} key={`${w}x${h}`}>
                          {w} × {h}
                        </option>
                      ))}
                    </select>
                    <div className="dw-fields mt-3">
                      <NumberField
                        label={t(
                          L("Ширина холста", "Artboard width", "Кенеп ені"),
                        )}
                        min={64}
                        max={4096}
                        value={W}
                        onCommit={(w) => commit({ ...current.current, w })}
                      />
                      <NumberField
                        label={t(
                          L(
                            "Высота холста",
                            "Artboard height",
                            "Кенеп биіктігі",
                          ),
                        )}
                        min={64}
                        max={4096}
                        value={H}
                        onCommit={(h) => commit({ ...current.current, h })}
                      />
                      <label>
                        {t(L("Фон", "Background", "Фон"))}
                        <input
                          className="dw-input"
                          type="color"
                          value={value.bg}
                          onFocus={begin}
                          onChange={(e) => {
                            begin();
                            apply({ ...current.current, bg: e.target.value });
                          }}
                          onBlur={finish}
                        />
                      </label>
                    </div>
                    <p className="dw-hint mt-3">
                      {t(
                        L(
                          "Изменение формата сохраняет координаты объектов. Шаблон заменяет содержимое; его можно отменить.",
                          "Changing the format preserves object coordinates. A template replaces the content and can be undone.",
                          "Пішім өзгерсе нысан координаттары сақталады. Үлгі мазмұнды ауыстырады; оны болдырмауға болады.",
                        ),
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
      <div className="dw-status">
        <div className="dw-actions">
          <button
            className={iconButton}
            onClick={() => zoomAt(zoom / 1.2)}
            aria-label={t(L("Уменьшить", "Zoom out", "Кішірейту"))}
            disabled={zoom <= 0.1}
          >
            <ZoomOut size={14} />
          </button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button
            className={iconButton}
            onClick={() => zoomAt(zoom * 1.2)}
            aria-label={t(L("Увеличить", "Zoom in", "Үлкейту"))}
            disabled={zoom >= 4}
          >
            <ZoomIn size={14} />
          </button>
          <button className={button} onClick={fit}>
            <Maximize size={13} />
            {t(L("Вписать", "Fit", "Сыйдыру"))}
          </button>
          <label className="dw-check">
            <input
              type="checkbox"
              checked={grid}
              onChange={(e) => setGrid(e.target.checked)}
            />
            {t(L("Сетка", "Grid", "Тор"))}
          </label>
          <label className="dw-check">
            <input
              type="checkbox"
              checked={snap}
              onChange={(e) => setSnap(e.target.checked)}
            />
            {t(L("Привязка", "Snap", "Байлау"))}
          </label>
          <select
            className="dw-input dw-select"
            aria-label={t(L("Шаг сетки", "Grid spacing", "Тор қадамы"))}
            value={spacing}
            onChange={(e) => setSpacing(+e.target.value)}
          >
            {[4, 8, 16, 32].map((n) => (
              <option key={n} value={n}>
                {n} px
              </option>
            ))}
          </select>
        </div>
        <div className="dw-actions">
          <span>
            {selected.length
              ? `${selected.length} ${t(L("выбрано", "selected", "таңдалды"))}`
              : `${value.shapes.length} / ${MAX_SHAPES}`}
          </span>
          <button
            className={iconButton}
            onClick={() => setPanelOpen(!panelOpen)}
            aria-label={t(
              panelOpen
                ? L("Скрыть панели", "Hide panels", "Панельдерді жасыру")
                : L("Показать панели", "Show panels", "Панельдерді көрсету"),
            )}
          >
            {panelOpen ? (
              <PanelRightClose size={15} />
            ) : (
              <PanelRightOpen size={15} />
            )}
          </button>
          <button
            className={iconButton}
            onClick={() => setHelp(!help)}
            aria-expanded={help}
            aria-label={t(
              L("Горячие клавиши", "Keyboard shortcuts", "Пернелер тіркесімі"),
            )}
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </div>
      <div className="dw-help">
        <span className="dw-hint">
          {t(
            L(
              "Shift — добавить к выделению · Space — перемещение вида · Alt — без привязки",
              "Shift adds to selection · Space pans · Alt bypasses snapping",
              "Shift — таңдауға қосу · Space — көріністі жылжыту · Alt — байлаусыз",
            ),
          )}
        </span>
        <span className="dw-hint" role="status">
          {notice}
        </span>
      </div>
      {help && (
        <div className="dw-shortcuts">
          {[
            ["V / H", L("Выделение / рука", "Select / hand", "Таңдау / қол")],
            [
              "R / O / T",
              L(
                "Прямоугольник / эллипс / текст",
                "Rectangle / ellipse / text",
                "Тіктөртбұрыш / эллипс / мәтін",
              ),
            ],
            [
              "Ctrl / ⌘ A",
              L(
                "Все незаблокированные слои",
                "All unlocked layers",
                "Барлық ашық қабат",
              ),
            ],
            ["Ctrl / ⌘ D", L("Дублировать", "Duplicate", "Көшіру")],
            [
              "Ctrl / ⌘ C / V",
              L(
                "Буфер студии: копировать / вставить",
                "Studio clipboard: copy / paste",
                "Студия буфері: көшіру / қою",
              ),
            ],
            [
              "Ctrl / ⌘ Z",
              L(
                "Отменить; Shift — вернуть",
                "Undo; Shift to redo",
                "Болдырмау; Shift — қайтару",
              ),
            ],
            [
              "← ↑ → ↓ / Shift",
              L("Сдвиг на 1 / 10 px", "Nudge 1 / 10 px", "1 / 10 px жылжыту"),
            ],
            [
              "0 / + / −",
              L(
                "Вписать / увеличить / уменьшить",
                "Fit / zoom in / zoom out",
                "Сыйдыру / үлкейту / кішірейту",
              ),
            ],
          ].map(([keys, label]) => (
            <div key={keys as string}>
              <kbd>{keys as string}</kbd>
              {t(label as ReturnType<typeof L>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
