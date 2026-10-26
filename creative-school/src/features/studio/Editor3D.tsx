import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Trash2 } from 'lucide-react';

export type Obj = { id: string; kind: 'box' | 'sphere' | 'cone' | 'torus'; pos: [number, number, number]; rotY: number; scale: number; color: string };
export type SceneDoc = { bg: string; objects: Obj[] };
export const emptyScene: SceneDoc = { bg: '#1b1b22', objects: [] };
const kinds: { kind: Obj['kind']; label: string }[] = [{ kind: 'box', label: 'Куб' }, { kind: 'sphere', label: 'Шар' }, { kind: 'cone', label: 'Конус' }, { kind: 'torus', label: 'Тор' }];
const btn = 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:border-primary';

export function Editor3D({ value, onChange }: { value: SceneDoc; onChange: (doc: SceneDoc) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const cur = value.objects.find((o) => o.id === sel) ?? null;
  const patch = (p: Partial<Obj>) => cur && onChange({ ...value, objects: value.objects.map((o) => (o.id === cur.id ? { ...o, ...p } : o)) });
  const setAxis = (i: 0 | 1 | 2, v: number) => { if (cur) { const pos = [...cur.pos] as Obj['pos']; pos[i] = v; patch({ pos }); } };
  const add = (kind: Obj['kind']) => {
    const o: Obj = { id: crypto.randomUUID(), kind, pos: [0, 0.7, 0], rotY: 0, scale: 1, color: '#e8590c' };
    onChange({ ...value, objects: [...value.objects, o] });
    setSel(o.id);
  };
  const remove = () => { if (!cur) return; onChange({ ...value, objects: value.objects.filter((o) => o.id !== cur.id) }); setSel(null); };

  return (
    <div className="w-full">
      <div className="h-[380px] overflow-hidden rounded-xl border border-border" style={{ background: value.bg }}>
        <Canvas camera={{ position: [5, 4, 6], fov: 50 }} onPointerMissed={() => setSel(null)}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 4]} intensity={1.6} />
          <gridHelper args={[20, 20, '#666', '#333']} />
          {value.objects.map((o) => (
            <mesh key={o.id} position={o.pos} rotation={[0, (o.rotY * Math.PI) / 180, 0]} scale={o.scale} onClick={(e) => { e.stopPropagation(); setSel(o.id); }}>
              {o.kind === 'box' && <boxGeometry args={[1.4, 1.4, 1.4]} />}
              {o.kind === 'sphere' && <sphereGeometry args={[0.8, 32, 32]} />}
              {o.kind === 'cone' && <coneGeometry args={[0.8, 1.6, 32]} />}
              {o.kind === 'torus' && <torusGeometry args={[0.7, 0.28, 24, 48]} />}
              <meshStandardMaterial color={o.color} emissive={o.id === sel ? '#444444' : '#000000'} />
            </mesh>
          ))}
          <OrbitControls makeDefault />
        </Canvas>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {kinds.map((k) => <button key={k.kind} className={btn} onClick={() => add(k.kind)}>+ {k.label}</button>)}
        <label className={`${btn} cursor-pointer`}>Фон <input type="color" value={value.bg} onChange={(e) => onChange({ ...value, bg: e.target.value })} className="h-5 w-6 border-0 bg-transparent p-0" /></label>
      </div>
      {cur ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <label className="text-xs font-medium">Цвет<input type="color" value={cur.color} onChange={(e) => patch({ color: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2" /></label>
          <label className="text-xs font-medium">Размер: {cur.scale.toFixed(1)}<input type="range" min={0.2} max={3} step={0.1} value={cur.scale} onChange={(e) => patch({ scale: Number(e.target.value) })} className="mt-3 w-full" /></label>
          {(['X', 'Y', 'Z'] as const).map((n, i) => (
            <label key={n} className="text-xs font-medium">{n}: {cur.pos[i].toFixed(1)}<input type="range" min={-6} max={6} step={0.1} value={cur.pos[i]} onChange={(e) => setAxis(i as 0 | 1 | 2, Number(e.target.value))} className="mt-3 w-full" /></label>
          ))}
          <label className="text-xs font-medium">Поворот: {cur.rotY}°<input type="range" min={0} max={360} value={cur.rotY} onChange={(e) => patch({ rotY: Number(e.target.value) })} className="mt-3 w-full" /></label>
          <div className="sm:col-span-2"><button className={`${btn} text-destructive`} onClick={remove}><Trash2 size={14} /> Удалить объект</button></div>
        </div>
      ) : <p className="mt-4 text-xs text-muted-foreground">Добавьте фигуру и кликните по ней. Камеру вращайте мышью или пальцем.</p>}
    </div>
  );
}
