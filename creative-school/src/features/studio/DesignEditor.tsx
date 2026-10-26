import { useRef, useState } from 'react';
import { Circle, Download, Square, Trash2, Type } from 'lucide-react';

export type Shape = { id: string; type: 'rect' | 'ellipse' | 'text'; x: number; y: number; w: number; h: number; fill: string; text?: string; size?: number };
export type DesignDoc = { bg: string; shapes: Shape[] };
export const emptyDesign: DesignDoc = { bg: '#f6f1e7', shapes: [] };
const W = 800, H = 500;
const field = 'mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary';
const btn = 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:border-primary';

export function DesignEditor({ value, onChange }: { value: DesignDoc; onChange: (doc: DesignDoc) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const cur = value.shapes.find((s) => s.id === sel) ?? null;
  const patch = (p: Partial<Shape>) => cur && onChange({ ...value, shapes: value.shapes.map((s) => (s.id === cur.id ? { ...s, ...p } : s)) });
  const add = (type: Shape['type']) => {
    const s: Shape = { id: crypto.randomUUID(), type, x: 280, y: 190, w: type === 'text' ? 240 : 170, h: type === 'text' ? 48 : 110, fill: type === 'text' ? '#1a1a1a' : '#e8590c', text: 'Текст', size: 36 };
    onChange({ ...value, shapes: [...value.shapes, s] });
    setSel(s.id);
  };
  const point = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = point(e);
    onChange({ ...value, shapes: value.shapes.map((s) => (s.id === d.id ? { ...s, x: Math.round(p.x - d.dx), y: Math.round(p.y - d.dy) } : s)) });
  };
  const remove = () => { if (!cur) return; onChange({ ...value, shapes: value.shapes.filter((s) => s.id !== cur.id) }); setSel(null); };
  const reorder = (toFront: boolean) => {
    if (!cur) return;
    const rest = value.shapes.filter((s) => s.id !== cur.id);
    onChange({ ...value, shapes: toFront ? [...rest, cur] : [cur, ...rest] });
  };
  const download = () => {
    const el = svg.current!.cloneNode(true) as SVGSVGElement;
    el.querySelectorAll('[data-ui]').forEach((n) => n.remove());
    el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(el)], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'design.svg'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none rounded-xl border border-border" style={{ background: value.bg }}
        onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerDown={() => setSel(null)}>
        <rect width={W} height={H} fill={value.bg} />
        {value.shapes.map((s) => (
          <g key={s.id} style={{ cursor: 'move' }} onPointerDown={(e) => {
            e.stopPropagation(); setSel(s.id);
            const p = point(e); drag.current = { id: s.id, dx: p.x - s.x, dy: p.y - s.y };
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
          }}>
            {s.type === 'rect' && <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} fill={s.fill} />}
            {s.type === 'ellipse' && <ellipse cx={s.x + s.w / 2} cy={s.y + s.h / 2} rx={s.w / 2} ry={s.h / 2} fill={s.fill} />}
            {s.type === 'text' && <text x={s.x} y={s.y} fontSize={s.size} fill={s.fill} dominantBaseline="hanging" fontFamily="Inter, sans-serif" fontWeight={600}>{s.text}</text>}
            {s.id === sel && <rect data-ui x={s.x - 3} y={s.y - 3} width={s.w + 6} height={(s.type === 'text' ? (s.size ?? 36) * 1.2 : s.h) + 6} fill="none" stroke="#2563eb" strokeDasharray="5 4" />}
          </g>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btn} onClick={() => add('rect')}><Square size={14} /> Прямоугольник</button>
        <button className={btn} onClick={() => add('ellipse')}><Circle size={14} /> Эллипс</button>
        <button className={btn} onClick={() => add('text')}><Type size={14} /> Текст</button>
        <label className={`${btn} cursor-pointer`}>Фон <input type="color" value={value.bg} onChange={(e) => onChange({ ...value, bg: e.target.value })} className="h-5 w-6 border-0 bg-transparent p-0" /></label>
        <button className={btn} onClick={download}><Download size={14} /> Скачать SVG</button>
      </div>
      {cur ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <label className="text-xs font-medium">Цвет<input type="color" value={cur.fill} onChange={(e) => patch({ fill: e.target.value })} className={field} /></label>
          {cur.type === 'text' ? (
            <>
              <label className="text-xs font-medium">Текст<input value={cur.text ?? ''} onChange={(e) => patch({ text: e.target.value })} className={field} /></label>
              <label className="text-xs font-medium">Размер: {cur.size}<input type="range" min={12} max={120} value={cur.size ?? 36} onChange={(e) => patch({ size: Number(e.target.value) })} className="mt-3 w-full" /></label>
            </>
          ) : (
            <>
              <label className="text-xs font-medium">Ширина: {cur.w}<input type="range" min={20} max={700} value={cur.w} onChange={(e) => patch({ w: Number(e.target.value) })} className="mt-3 w-full" /></label>
              <label className="text-xs font-medium">Высота: {cur.h}<input type="range" min={20} max={450} value={cur.h} onChange={(e) => patch({ h: Number(e.target.value) })} className="mt-3 w-full" /></label>
            </>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button className={btn} onClick={() => reorder(true)}>Наверх</button>
            <button className={btn} onClick={() => reorder(false)}>Вниз</button>
            <button className={`${btn} text-destructive`} onClick={remove}><Trash2 size={14} /> Удалить</button>
          </div>
        </div>
      ) : <p className="mt-4 text-xs text-muted-foreground">Добавьте фигуру или выберите её на холсте. Фигуры можно перетаскивать.</p>}
    </div>
  );
}
