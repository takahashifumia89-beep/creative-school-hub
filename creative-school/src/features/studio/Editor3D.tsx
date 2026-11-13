import { useLocale, L } from "@/platform/locale";
import { useEditorText } from "@/platform/editor-labels";
import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import {
  Scene,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  SphereGeometry,
  ConeGeometry,
  TorusGeometry,
  CylinderGeometry,
  type WebGLRenderer,
} from "three";
import { download } from "@/platform/client";
import {
  Copy,
  Download,
  Move3d,
  Redo2,
  Rotate3d,
  Scale3d,
  Trash2,
  Undo2,
} from "lucide-react";
export type Obj = {
  id: string;
  kind: "box" | "sphere" | "cone" | "torus" | "cylinder";
  name?: string;
  hidden?: boolean;
  pos: [number, number, number];
  rotY: number;
  rotX?: number;
  rotZ?: number;
  scale: number;
  color: string;
  metal?: number;
  rough?: number;
};
export type SceneDoc = {
  bg: string;
  objects: Obj[];
  light?: number;
  ground?: boolean;
  wireframe?: boolean;
};
export const emptyScene: SceneDoc = {
  bg: "#1b1b22",
  objects: [],
  light: 1.6,
  ground: true,
};
const kinds: {
  kind: Obj["kind"];
  label: string;
}[] = [
  { kind: "box", label: "Куб" },
  { kind: "sphere", label: "Шар" },
  { kind: "cone", label: "Конус" },
  { kind: "torus", label: "Тор" },
  { kind: "cylinder", label: "Цилиндр" },
];
const btn =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:border-primary disabled:opacity-40";
const lbl = "text-xs font-medium";
export function Editor3D({
  value,
  onChange,
}: {
  value: SceneDoc;
  onChange: (doc: SceneDoc) => void;
}) {
  const tx = useEditorText();
  const { t } = useLocale();
  const [sel, setSel] = useState<string | null>(null);
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
    "translate",
  );
  const ref = useRef<Mesh>(null);
  const gl = useRef<WebGLRenderer | null>(null);
  const past = useRef<SceneDoc[]>([]);
  const future = useRef<SceneDoc[]>([]);
  const cur = value.objects.find((o) => o.id === sel) ?? null;
  const begin = () => {
    past.current = [...past.current.slice(-49), value];
    future.current = [];
  };
  const edit = (doc: SceneDoc) => {
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
  const live = (p: Partial<Obj>) =>
    cur &&
    onChange({
      ...value,
      objects: value.objects.map((o) => (o.id === cur.id ? { ...o, ...p } : o)),
    });
  const add = (kind: Obj["kind"]) => {
    const o: Obj = {
      id: crypto.randomUUID(),
      kind,
      pos: [0, 0.8, 0],
      rotY: 0,
      scale: 1,
      color: "#e8590c",
      metal: 0.1,
      rough: 0.5,
    };
    edit({ ...value, objects: [...value.objects, o] });
    setSel(o.id);
  };
  const duplicate = () => {
    if (!cur) return;
    const c: Obj = {
      ...cur,
      id: crypto.randomUUID(),
      pos: [cur.pos[0] + 1, cur.pos[1], cur.pos[2]],
    };
    edit({ ...value, objects: [...value.objects, c] });
    setSel(c.id);
  };
  const remove = () => {
    if (!cur) return;
    edit({ ...value, objects: value.objects.filter((o) => o.id !== cur.id) });
    setSel(null);
  };
  const setAxis = (i: 0 | 1 | 2, v: number) => {
    if (cur) {
      const pos = [...cur.pos] as Obj["pos"];
      pos[i] = v;
      live({ pos });
    }
  };
  const sync = () => {
    const m = ref.current;
    if (!m || !cur) return;
    live({
      pos: [
        +m.position.x.toFixed(2),
        +m.position.y.toFixed(2),
        +m.position.z.toFixed(2),
      ],
      rotX: (m.rotation.x * 180) / Math.PI,
      rotY: (m.rotation.y * 180) / Math.PI,
      rotZ: (m.rotation.z * 180) / Math.PI,
      scale: Math.min(3, Math.max(0.2, +m.scale.x.toFixed(2))),
    });
  };
  const exportModel = async () => {
    const { GLTFExporter } =
      await import("three/examples/jsm/exporters/GLTFExporter.js");
    const scene = new Scene();
    for (const o of value.objects.filter((o) => !o.hidden)) {
      const geometry =
        o.kind === "box"
          ? new BoxGeometry(1.4, 1.4, 1.4)
          : o.kind === "sphere"
            ? new SphereGeometry(0.8, 32, 32)
            : o.kind === "cone"
              ? new ConeGeometry(0.8, 1.6, 32)
              : o.kind === "torus"
                ? new TorusGeometry(0.7, 0.28, 24, 48)
                : new CylinderGeometry(0.6, 0.6, 1.6, 32);
      const mesh = new Mesh(
        geometry,
        new MeshStandardMaterial({
          color: o.color,
          metalness: o.metal ?? 0.1,
          roughness: o.rough ?? 0.5,
        }),
      );
      mesh.name = o.name ?? o.kind;
      mesh.position.set(...o.pos);
      mesh.rotation.set(
        ((o.rotX ?? 0) * Math.PI) / 180,
        (o.rotY * Math.PI) / 180,
        ((o.rotZ ?? 0) * Math.PI) / 180,
      );
      mesh.scale.setScalar(o.scale);
      scene.add(mesh);
    }
    try {
      const result = await new GLTFExporter().parseAsync(scene, {
        binary: true,
      });
      download(
        "scene.glb",
        new Blob([result as ArrayBuffer], { type: "model/gltf-binary" }),
      );
    } finally {
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (o.material as MeshStandardMaterial).dispose();
        }
      });
    }
  };
  const shot = () => {
    const c = gl.current?.domElement;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "scene.png";
    a.click();
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
        {(
          [
            ["translate", tx("Двигать"), Move3d],
            ["rotate", tx("Вращать"), Rotate3d],
            ["scale", tx("Размер"), Scale3d],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            className={`${btn} ${mode === m ? "border-primary bg-primary/10" : ""}`}
            onClick={() => setMode(m)}
          >
            <Icon size={14} /> {tx(label)}
          </button>
        ))}
        <button className={btn} onClick={() => void exportModel()}>
          GLB ↓
        </button>
        <button className={btn} onClick={shot}>
          <Download size={14} /> PNG
        </button>
      </div>
      <div
        className="h-[420px] overflow-hidden rounded-xl border border-border"
        style={{ background: value.bg }}
      >
        <Canvas
          camera={{ position: [5, 4, 6], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
          onCreated={(s) => {
            gl.current = s.gl;
          }}
          onPointerMissed={() => setSel(null)}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 8, 4]}
            intensity={value.light ?? 1.6}
          />
          <gridHelper args={[20, 20, "#666", "#333"]} />
          {value.ground !== false && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#2a2a33" />
            </mesh>
          )}
          {value.objects
            .filter((o) => !o.hidden)
            .map((o) => {
              const mesh = (
                <mesh
                  key={o.id}
                  ref={o.id === sel ? ref : undefined}
                  position={o.pos}
                  rotation={[
                    ((o.rotX ?? 0) * Math.PI) / 180,
                    (o.rotY * Math.PI) / 180,
                    ((o.rotZ ?? 0) * Math.PI) / 180,
                  ]}
                  scale={o.scale}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSel(o.id);
                  }}
                >
                  {o.kind === "box" && <boxGeometry args={[1.4, 1.4, 1.4]} />}
                  {o.kind === "sphere" && (
                    <sphereGeometry args={[0.8, 32, 32]} />
                  )}
                  {o.kind === "cone" && <coneGeometry args={[0.8, 1.6, 32]} />}
                  {o.kind === "torus" && (
                    <torusGeometry args={[0.7, 0.28, 24, 48]} />
                  )}
                  {o.kind === "cylinder" && (
                    <cylinderGeometry args={[0.6, 0.6, 1.6, 32]} />
                  )}
                  <meshStandardMaterial
                    color={o.color}
                    metalness={o.metal ?? 0.1}
                    roughness={o.rough ?? 0.5}
                    wireframe={!!value.wireframe}
                    emissive={o.id === sel ? "#333333" : "#000000"}
                  />
                </mesh>
              );
              return o.id === sel ? (
                <TransformControls
                  key={o.id}
                  mode={mode}
                  showX
                  showY
                  showZ
                  onMouseDown={begin}
                  onMouseUp={sync}
                >
                  {mesh}
                </TransformControls>
              ) : (
                mesh
              );
            })}
          <OrbitControls makeDefault />
        </Canvas>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button key={k.kind} className={btn} onClick={() => add(k.kind)}>
            + {tx(k.label)}
          </button>
        ))}
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
        <label className={`${btn} cursor-pointer`}>
          <input
            type="checkbox"
            checked={value.ground !== false}
            onChange={(e) => edit({ ...value, ground: e.target.checked })}
          />
          {tx("Пол")}
        </label>
        <label className={`${btn}`}>
          {tx("Свет")}
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={value.light ?? 1.6}
            onPointerDown={begin}
            onChange={(e) =>
              onChange({ ...value, light: Number(e.target.value) })
            }
            className="w-24"
          />
        </label>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-background p-3">
        <label className="mb-3 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={!!value.wireframe}
            onChange={(e) => edit({ ...value, wireframe: e.target.checked })}
          />
          {t(L("Каркасный вид", "Wireframe view", "Қаңқалық көрініс"))}
        </label>
        <div className="grid gap-1">
          {value.objects.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <button
                className={`${btn} flex-1 text-left ${o.id === sel ? "border-primary" : ""}`}
                onClick={() => setSel(o.id)}
              >
                {o.name ||
                  `${tx(kinds.find((k) => k.kind === o.kind)!.label)} ${i + 1}`}
              </button>
              <button
                className={btn}
                aria-label={t(
                  L("Видимость объекта", "Object visibility", "Нысан көрінуі"),
                )}
                aria-pressed={!o.hidden}
                onClick={() =>
                  edit({
                    ...value,
                    objects: value.objects.map((x) =>
                      x.id === o.id ? { ...x, hidden: !x.hidden } : x,
                    ),
                  })
                }
              >
                {o.hidden ? "○" : "●"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {cur && (
        <label className="mt-4 block text-xs">
          {t(L("Имя объекта", "Object name", "Нысан атауы"))}
          <input
            value={cur.name ?? ""}
            maxLength={80}
            onFocus={begin}
            onChange={(e) => live({ name: e.target.value })}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2"
          />
        </label>
      )}
      {cur ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <label className={lbl}>
            {tx("Цвет")}
            <input
              type="color"
              value={cur.color}
              onFocus={begin}
              onChange={(e) => live({ color: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2"
            />
          </label>
          <label className={lbl}>
            {tx("Размер:")}
            {cur.scale.toFixed(1)}
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.1}
              value={cur.scale}
              onPointerDown={begin}
              onChange={(e) => live({ scale: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <label className={lbl}>
            {tx("Металлик:")}
            {(cur.metal ?? 0.1).toFixed(1)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={cur.metal ?? 0.1}
              onPointerDown={begin}
              onChange={(e) => live({ metal: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <label className={lbl}>
            {tx("Шероховатость:")}
            {(cur.rough ?? 0.5).toFixed(1)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={cur.rough ?? 0.5}
              onPointerDown={begin}
              onChange={(e) => live({ rough: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          {(["X", "Y", "Z"] as const).map((n, i) => (
            <label key={n} className={lbl}>
              {n}: {cur.pos[i].toFixed(1)}
              <input
                type="range"
                min={-6}
                max={6}
                step={0.1}
                value={cur.pos[i]}
                onPointerDown={begin}
                onChange={(e) =>
                  setAxis(i as 0 | 1 | 2, Number(e.target.value))
                }
                className="mt-3 w-full"
              />
            </label>
          ))}
          <label className={lbl}>
            {tx("Поворот:")}
            {cur.rotY}°
            <input
              type="range"
              min={-360}
              max={360}
              value={cur.rotY}
              onPointerDown={begin}
              onChange={(e) => live({ rotY: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
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
            "Добавьте фигуру и кликните по ней: появится манипулятор для перемещения, вращения и размера. Камера: мышь или палец. Клавиши: Ctrl+Z, Ctrl+Y, Ctrl+D, Delete.",
          )}
        </p>
      )}
    </div>
  );
}
