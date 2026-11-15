import { CommandHistory } from "@/engine/history";
import { ModelEngine, type EvaluatedMesh } from "@/engine/model-client";
import type { ModelModifier } from "@/platform/model-schema";
import { PrecisionNumber } from "@/platform/PrecisionNumber";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  OrthographicCamera,
  TransformControls,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  Vector3,
  type WebGLRenderer,
} from "three";
import {
  Box,
  Copy,
  Download,
  Eye,
  EyeOff,
  Focus,
  LockKeyhole,
  MousePointer2,
  Move3d,
  Redo2,
  Rotate3d,
  Scale3d,
  Trash2,
  Undo2,
  Unlock,
} from "lucide-react";
import { L, useLocale } from "@/platform/locale";
import { download } from "@/platform/client";
import { sceneSchema, type Obj, type SceneDoc } from "@/platform/model-schema";
import {
  baseGeometryFor,
  geometryFromBuffers,
  matrixFor,
} from "./model-geometry";
import "./model-workspace.css";
export type { Obj, SceneDoc } from "@/platform/model-schema";
export const emptyScene: SceneDoc = {
  bg: "#1b1b22",
  objects: [],
  light: 1.6,
  ground: true,
};
const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n)),
  round = (n: number) => Math.round(n * 10000) / 10000,
  rad = Math.PI / 180,
  btn = "model-button";
const kinds = ["box", "sphere", "cylinder", "cone", "torus"] as const;
type View = "iso" | "front" | "back" | "right" | "left" | "top" | "frame";
function Numeric({
  label,
  value,
  min = -10000,
  max = 10000,
  step = 0.1,
  onBegin,
  onValue,
  onEnd,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onBegin: () => void;
  onValue: (n: number) => void;
  onEnd: () => void;
}) {
  return (
    <PrecisionNumber
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      className="model-number"
      onBegin={onBegin}
      onValue={onValue}
      onEnd={onEnd}
    />
  );
}

function SceneObject({
  object: o,
  selected,
  wireframe,
  onSelect,
  register,
  engine,
  onEvaluated,
}: {
  object: Obj;
  selected: boolean;
  wireframe: boolean;
  onSelect: (id: string) => void;
  register: (id: string, mesh: Mesh | null) => void;
  engine: () => ModelEngine;
  onEvaluated: (id: string, result: EvaluatedMesh | null) => void;
}) {
  const signature = JSON.stringify([
    o.kind,
    o.segments,
    o.vertices,
    o.indices,
    o.modifiers,
  ]);
  const fallback = useMemo(
    () => baseGeometryFor({ ...o, modifiers: undefined }),
    [o.kind, o.segments, o.vertices, o.indices],
  );
  const [evaluated, setEvaluated] = useState<{
    signature: string;
    geometry: BufferGeometry;
  } | null>(null);
  const geometry =
      evaluated?.signature === signature ? evaluated.geometry : fallback,
    ref = useRef<Mesh>(null),
    s = o.size ?? [1, 1, 1];
  useEffect(() => {
    let active = true;
    void engine()
      .evaluate(o)
      .then((result) => {
        if (!active) return;
        setEvaluated({ signature, geometry: geometryFromBuffers(result) });
        onEvaluated(o.id, result);
      })
      .catch(() => {
        if (active) onEvaluated(o.id, null);
      });
    return () => {
      active = false;
    };
  }, [signature, engine, onEvaluated]);
  useEffect(() => () => fallback.dispose(), [fallback]);
  useEffect(() => () => evaluated?.geometry.dispose(), [evaluated]);
  useEffect(() => {
    register(o.id, ref.current);
    return () => register(o.id, null);
  }, [o.id, register, geometry]);
  return (
    <mesh
      ref={ref}
      name={o.id}
      geometry={geometry}
      position={o.pos}
      rotation={[(o.rotX ?? 0) * rad, o.rotY * rad, (o.rotZ ?? 0) * rad]}
      scale={[s[0] * o.scale, s[1] * o.scale, s[2] * o.scale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(o.id);
      }}
    >
      <meshStandardMaterial
        color={o.color}
        metalness={o.metal ?? 0.1}
        roughness={o.rough ?? 0.5}
        flatShading={o.flat ?? false}
        wireframe={wireframe}
        emissive={selected ? "#202020" : "#000000"}
      />
    </mesh>
  );
}
function CameraRig({
  command,
  objects,
  selected,
  controls,
}: {
  command: { view: View; serial: number };
  objects: Map<string, Mesh>;
  selected: string | null;
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size, raycaster, invalidate } = useThree();
  useEffect(() => {
    raycaster.params.Points.threshold = 0.12;
  }, [raycaster]);
  useEffect(() => {
    if (!controls.current) return;
    const bounds = new Box3(),
      active = selected ? objects.get(selected) : undefined;
    if (command.view === "frame" && active) {
      active.updateMatrixWorld(true);
      bounds.setFromObject(active);
    } else
      for (const mesh of objects.values()) {
        mesh.updateMatrixWorld(true);
        bounds.expandByObject(mesh);
      }
    if (bounds.isEmpty())
      bounds.set(new Vector3(-2, 0, -2), new Vector3(2, 3, 2));
    const center = bounds.getCenter(new Vector3()),
      radius = Math.max(0.6, bounds.getSize(new Vector3()).length() / 2),
      direction = new Vector3(1, 0.75, 1);
    if (command.view === "frame")
      direction.copy(camera.position).sub(controls.current.target);
    else if (command.view === "front") direction.set(0, 0, 1);
    else if (command.view === "back") direction.set(0, 0, -1);
    else if (command.view === "right") direction.set(1, 0, 0);
    else if (command.view === "left") direction.set(-1, 0, 0);
    else if (command.view === "top") direction.set(0, 1, 0.0001);
    if (direction.lengthSq() < 0.01) direction.set(1, 0.75, 1);
    camera.position
      .copy(center)
      .addScaledVector(direction.normalize(), radius * 3.1);
    camera.near = Math.max(0.001, radius / 1000);
    camera.far = Math.max(1000, radius * 100);
    if ("isOrthographicCamera" in camera)
      camera.zoom = Math.min(size.width, size.height) / (radius * 2.7);
    camera.updateProjectionMatrix();
    controls.current.target.copy(center);
    controls.current.update();
    invalidate();
  }, [command, camera, size.width, size.height, objects, controls]);
  return null;
}
function VertexPoints({
  object: o,
  onSelect,
}: {
  object: Obj;
  onSelect: (i: number) => void;
}) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(o.vertices ?? [], 3));
    return g;
  }, [o.vertices]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const s = o.size ?? [1, 1, 1];
  return (
    <group
      position={o.pos}
      rotation={[(o.rotX ?? 0) * rad, o.rotY * rad, (o.rotZ ?? 0) * rad]}
      scale={[s[0] * o.scale, s[1] * o.scale, s[2] * o.scale]}
    >
      <points
        geometry={geometry}
        renderOrder={10}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(e.index ?? 0);
        }}
      >
        <pointsMaterial color="#c6e755" size={0.075} depthTest={false} />
      </points>
    </group>
  );
}
function VertexMarker({
  position,
  register,
}: {
  position: [number, number, number];
  register: (m: Mesh | null) => void;
}) {
  const ref = useRef<Mesh>(null);
  useEffect(() => {
    register(ref.current);
    return () => register(null);
  }, [register]);
  return (
    <mesh ref={ref} position={position} renderOrder={20}>
      <sphereGeometry args={[0.055, 12, 8]} />
      <meshBasicMaterial color="#ffca63" depthTest={false} />
    </mesh>
  );
}

export function Editor3D({
  value,
  onChange,
}: {
  value: SceneDoc;
  onChange: (doc: SceneDoc) => void;
}) {
  const { t } = useLocale(),
    root = useRef<HTMLDivElement>(null),
    current = useRef(value);
  current.current = value;
  const [selected, select] = useState<string | null>(null),
    selectedRef = useRef(selected);
  selectedRef.current = selected;
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">(
      "translate",
    ),
    [grid, setGrid] = useState(true),
    [snap, setSnap] = useState(false),
    [ortho, setOrtho] = useState(false),
    [command, setCommand] = useState<{ view: View; serial: number }>({
      view: "iso",
      serial: 0,
    }),
    [error, setError] = useState(""),
    [exporting, setExporting] = useState(false),
    [space, setSpace] = useState<"world" | "local">("world"),
    [modelStats, setModelStats] = useState({
      ms: 0,
      vertices: 0,
      triangles: 0,
      cacheBytes: 0,
    }),
    [vertexMode, setVertexMode] = useState(false),
    [vertex, setVertex] = useState(0),
    [selectedMesh, setSelectedMesh] = useState<Mesh | null>(null),
    [marker, setMarker] = useState<Mesh | null>(null);
  const objectRefs = useRef(new Map<string, Mesh>()),
    gl = useRef<WebGLRenderer | null>(null),
    orbit = useRef<OrbitControlsImpl | null>(null),
    commands = useRef<CommandHistory<SceneDoc>>(null!),
    transaction = useRef<SceneDoc | null>(null),
    emitted = useRef(""),
    [, refresh] = useReducer((n) => n + 1, 0);
  commands.current ??= new CommandHistory(value, 50);
  emitted.current ||= JSON.stringify(value);
  const modelEngine = useRef<ModelEngine | null>(null),
    evaluatedStats = useRef(new Map<string, typeof modelStats>());
  const getEngine = useCallback(
    () => (modelEngine.current ??= new ModelEngine()),
    [],
  );
  useEffect(
    () => () => {
      modelEngine.current?.dispose();
      modelEngine.current = null;
    },
    [],
  );
  const onEvaluated = useCallback(
    (id: string, result: EvaluatedMesh | null) => {
      if (!result) {
        setError(
          t(
            L(
              "Не удалось вычислить модификаторы. Уменьшите число копий или подразделений; исходная геометрия сохранена.",
              "Could not evaluate modifiers. Reduce copies or subdivision; the source geometry is preserved.",
              "Модификаторлар есептелмеді. Көшірме не бөлу санын азайтыңыз; түпнұсқа геометрия сақталды.",
            ),
          ),
        );
        return;
      }
      const stats = {
        ms: result.ms,
        vertices: result.positions.length / 3,
        triangles: result.indices.length / 3,
        cacheBytes: result.cacheBytes,
      };
      evaluatedStats.current.set(id, stats);
      if (selectedRef.current === id) setModelStats(stats);
    },
    [t],
  );
  const cur = value.objects.find((o) => o.id === selected) ?? null;
  useEffect(() => {
    if (selected) {
      const stats = evaluatedStats.current.get(selected);
      if (stats) setModelStats(stats);
    }
  }, [selected]);
  const name = (kind: Obj["kind"]) =>
    t(
      kind === "box"
        ? L("Куб", "Box", "Текше")
        : kind === "sphere"
          ? L("Шар", "Sphere", "Шар")
          : kind === "cone"
            ? L("Конус", "Cone", "Конус")
            : kind === "torus"
              ? L("Тор", "Torus", "Тор")
              : kind === "cylinder"
                ? L("Цилиндр", "Cylinder", "Цилиндр")
                : L("Сетка", "Mesh", "Торлы модель"),
    );
  const title = (o: Obj, i: number) => o.name || `${name(o.kind)} ${i + 1}`;
  const register = useCallback((id: string, mesh: Mesh | null) => {
    if (mesh) objectRefs.current.set(id, mesh);
    else objectRefs.current.delete(id);
    if (selectedRef.current === id) setSelectedMesh(mesh);
  }, []);
  useEffect(() => {
    setSelectedMesh(
      selected ? (objectRefs.current.get(selected) ?? null) : null,
    );
    if (!cur || cur.kind !== "mesh" || cur.hidden || cur.locked) {
      setVertexMode(false);
      setVertex(0);
    }
  }, [selected, cur?.id, cur?.kind, cur?.hidden, cur?.locked]);
  useEffect(() => {
    const incoming = JSON.stringify(value);
    if (incoming !== emitted.current) {
      commands.current.reset(value);
      transaction.current = null;
      emitted.current = incoming;
      refresh();
    }
  }, [value]);
  const emit = (doc: SceneDoc) => {
    emitted.current = JSON.stringify(doc);
    current.current = doc;
    commands.current.update(doc);
    onChange(doc);
  };
  function checked(doc: SceneDoc) {
    if (JSON.stringify(doc).length > 200000) {
      setError(
        t(
          L(
            "Сцена превышает лимит 200 КБ. Уменьшите число полигонов или объектов.",
            "Scene exceeds the 200 KB document limit. Reduce geometry or object count.",
            "Сахна 200 КБ шегінен асты. Полигон не нысан санын азайтыңыз.",
          ),
        ),
      );
      return false;
    }
    if (!sceneSchema.safeParse(doc).success) {
      setError(
        t(
          L(
            "Параметры сцены выходят за допустимые пределы.",
            "Scene values exceed supported limits.",
            "Сахна параметрлері рұқсат етілген шектен асты.",
          ),
        ),
      );
      return false;
    }
    return true;
  }
  function begin() {
    if (!transaction.current) {
      transaction.current = current.current;
      commands.current.update(current.current);
      commands.current.begin();
    }
  }
  function finish() {
    transaction.current = null;
    if (commands.current.end()) refresh();
  }
  function commit(doc: SceneDoc) {
    if (!checked(doc)) return;
    finish();
    commands.current.update(current.current);
    if (!commands.current.commit(doc)) return;
    emit(doc);
    setError("");
    refresh();
  }
  function live(change: Partial<Obj>) {
    const doc = current.current,
      o = doc.objects.find((x) => x.id === selectedRef.current);
    if (!o || o.locked) return;
    const next = {
      ...doc,
      objects: doc.objects.map((x) =>
        x.id === o.id ? { ...x, ...change } : x,
      ),
    };
    emit(next);
  }
  function patch(change: Partial<Obj>) {
    if (cur && !cur.locked)
      commit({
        ...current.current,
        objects: current.current.objects.map((o) =>
          o.id === cur.id ? { ...o, ...change } : o,
        ),
      });
  }
  function undo() {
    finish();
    emit(commands.current.undo());
    refresh();
  }
  function redo() {
    finish();
    emit(commands.current.redo());
    refresh();
  }
  function add(kind: (typeof kinds)[number]) {
    if (current.current.objects.length >= 200) {
      setError(
        t(
          L(
            "В сцене может быть не более 200 объектов.",
            "A scene can contain at most 200 objects.",
            "Сахнада ең көбі 200 нысан болуы мүмкін.",
          ),
        ),
      );
      return;
    }
    const o: Obj = {
      id: crypto.randomUUID(),
      kind,
      name: `${name(kind)} ${current.current.objects.length + 1}`,
      pos: [0, kind === "box" ? 0.7 : kind === "torus" ? 0.98 : 0.8, 0],
      rotY: 0,
      scale: 1,
      color: "#e8590c",
      metal: 0.1,
      rough: 0.5,
      segments: kind === "torus" ? 48 : 32,
    };
    commit({ ...current.current, objects: [...current.current.objects, o] });
    select(o.id);
    setVertexMode(false);
  }
  function addModifier(type: ModelModifier["type"]) {
    if (!cur || cur.locked || (cur.modifiers?.length ?? 0) >= 8) return;
    const base = { id: crypto.randomUUID(), enabled: true };
    const modifier: ModelModifier =
      type === "mirror"
        ? { ...base, type, axis: "x", offset: 0 }
        : type === "array"
          ? { ...base, type, count: 3, offset: [2, 0, 0] }
          : type === "twist"
            ? { ...base, type, axis: "y", angle: 90 }
            : { ...base, type, levels: 1, smooth: true };
    patch({ modifiers: [...(cur.modifiers ?? []), modifier] });
    setVertexMode(false);
  }
  function changeModifier(
    id: string,
    change: Partial<ModelModifier>,
    continuous = false,
  ) {
    if (!cur) return;
    const modifiers = cur.modifiers?.map((m) =>
      m.id === id ? ({ ...m, ...change } as ModelModifier) : m,
    );
    continuous ? live({ modifiers }) : patch({ modifiers });
  }
  function moveModifier(index: number, direction: number) {
    if (!cur?.modifiers) return;
    const modifiers = [...cur.modifiers];
    const target = index + direction;
    if (target < 0 || target >= modifiers.length) return;
    [modifiers[index], modifiers[target]] = [
      modifiers[target],
      modifiers[index],
    ];
    patch({ modifiers });
  }
  function duplicate() {
    if (!cur || cur.locked) return;
    const o: Obj = {
        ...structuredClone(cur),
        id: crypto.randomUUID(),
        name: `${title(cur, value.objects.indexOf(cur))} ${t(L("копия", "copy", "көшірме"))}`.slice(
          0,
          80,
        ),
        pos: [clamp(cur.pos[0] + 0.5, -10000, 10000), cur.pos[1], cur.pos[2]],
      },
      next = { ...current.current, objects: [...current.current.objects, o] };
    if (!checked(next)) return;
    commit(next);
    select(o.id);
  }
  function remove() {
    if (cur && !cur.locked) {
      commit({
        ...current.current,
        objects: current.current.objects.filter((o) => o.id !== cur.id),
      });
      select(null);
    }
  }
  function view(v: View) {
    setCommand((p) => ({ view: v, serial: p.serial + 1 }));
  }
  function syncTransform() {
    if (cur && selectedMesh)
      live({
        pos: selectedMesh.position
          .toArray()
          .map((n) => round(clamp(n, -10000, 10000))) as Obj["pos"],
        rotX: round(selectedMesh.rotation.x / rad),
        rotY: round(selectedMesh.rotation.y / rad),
        rotZ: round(selectedMesh.rotation.z / rad),
        size: selectedMesh.scale
          .toArray()
          .map((n) => round(clamp(n / cur.scale, 0.01, 100))) as NonNullable<
          Obj["size"]
        >,
      });
    finish();
  }
  async function convert() {
    if (!cur || cur.locked) return;
    let evaluated: EvaluatedMesh;
    try {
      evaluated = await getEngine().evaluate(cur, true);
    } catch {
      setError(
        t(
          L(
            "Применение превысит лимит редактируемой сетки: 10 000 вершин и 200 КБ. Уменьшите стек.",
            "Baking exceeds editable mesh limits: 10,000 vertices and 200 KB. Reduce the stack.",
            "Қолдану өңделетін тор шегінен асады: 10 000 төбе және 200 КБ. Стекті азайтыңыз.",
          ),
        ),
      );
      return;
    }
    const data = {
        vertices: Array.from(evaluated.positions),
        indices: Array.from(evaluated.indices),
      },
      next = {
        ...current.current,
        objects: current.current.objects.map((o) =>
          o.id === cur.id
            ? {
                ...o,
                ...data,
                modifiers: undefined,
                kind: "mesh" as const,
                flat: true,
              }
            : o,
        ),
      };
    if (!checked(next)) return;
    commit(next);
    setVertex(0);
    setVertexMode(true);
  }
  const baseGeometry = useMemo(
    () => (cur ? baseGeometryFor(cur) : null),
    [cur?.kind, cur?.segments, cur?.vertices, cur?.indices],
  );
  useEffect(() => () => baseGeometry?.dispose(), [baseGeometry]);
  const displayedGeometry =
    selectedMesh?.name === cur?.id ? selectedMesh?.geometry : baseGeometry;
  const base = displayedGeometry?.boundingBox
      ?.getSize(new Vector3())
      .toArray() ?? [1, 1, 1],
    count = (cur?.vertices?.length ?? 0) / 3,
    activeVertex = clamp(vertex, 0, Math.max(0, count - 1));
  useEffect(() => {
    if (vertex !== activeVertex) setVertex(activeVertex);
  }, [activeVertex, vertex]);
  const worldVertex = cur?.vertices
    ? (new Vector3()
        .fromArray(cur.vertices, activeVertex * 3)
        .applyMatrix4(matrixFor(cur))
        .toArray() as [number, number, number])
    : ([0, 0, 0] as [number, number, number]);
  function placeOnGround() {
    if (!cur || cur.locked || !displayedGeometry) return;
    const positions = displayedGeometry.getAttribute("position"),
      matrix = matrixFor(cur),
      point = new Vector3();
    let floor = Infinity;
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(matrix);
      floor = Math.min(floor, point.y);
    }
    if (Number.isFinite(floor))
      patch({
        pos: [cur.pos[0], clamp(cur.pos[1] - floor, -10000, 10000), cur.pos[2]],
      });
  }
  function setVertexCoordinate(axis: number, n: number) {
    if (!cur?.vertices || cur.locked) return;
    const vertices = [...cur.vertices];
    vertices[activeVertex * 3 + axis] = round(clamp(n, -10000, 10000));
    live({ vertices });
  }
  function syncVertex() {
    if (cur?.vertices && marker) {
      const p = marker.position.clone().applyMatrix4(matrixFor(cur).invert()),
        vertices = [...cur.vertices];
      p.toArray().forEach(
        (n, i) =>
          (vertices[activeVertex * 3 + i] = round(clamp(n, -10000, 10000))),
      );
      live({ vertices });
    }
    finish();
  }
  async function importOBJ(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 4_000_000) throw Error("SIZE");
      const parsed = await getEngine().parse(await file.text());
      const data = {
          vertices: Array.from(parsed.positions),
          indices: Array.from(parsed.indices),
        },
        o: Obj = {
          id: crypto.randomUUID(),
          kind: "mesh",
          name: file.name.replace(/\.obj$/i, "").slice(0, 80),
          pos: [0, 0, 0],
          rotY: 0,
          scale: 1,
          color: "#b7b9bf",
          metal: 0,
          rough: 0.5,
          ...data,
        },
        next = { ...current.current, objects: [...current.current.objects, o] };
      if (!checked(next)) return;
      commit(next);
      select(o.id);
      setVertexMode(false);
      setTimeout(() => view("frame"), 50);
    } catch {
      setError(
        t(
          L(
            "OBJ не импортирован. Нужны вершины и треугольные/выпуклые грани: до 4 МБ и 10 000 вершин. Текстуры и MTL не загружаются. Итоговая сцена — до 200 КБ.",
            "OBJ import failed. Use vertices and triangle/convex faces, up to 4 MB and 10,000 vertices. Textures and MTL are not loaded. Resulting scene: up to 200 KB.",
            "OBJ импортталмады. Төбелер мен үшбұрышты/дөңес жақтар қажет: 4 МБ және 10 000 төбеге дейін. Текстура мен MTL жүктелмейді. Дайын сахна 200 КБ дейін.",
          ),
        ),
      );
    }
  }
  async function exportGeometry(format: "glb" | "obj") {
    setExporting(true);
    setError("");
    try {
      const result = await getEngine().export(current.current, format);
      if (format === "glb")
        download(
          "scene.glb",
          new Blob([result.buffer!], { type: "model/gltf-binary" }),
        );
      else download("scene.obj", result.text!, "text/plain");
    } catch {
      setError(
        t(
          L(
            "Экспорт не выполнен. Добавьте видимый объект и проверьте геометрию.",
            "Export failed. Add a visible object and check geometry.",
            "Экспорт орындалмады. Көрінетін нысан қосып, геометрияны тексеріңіз.",
          ),
        ),
      );
    } finally {
      setExporting(false);
    }
  }
  function shot() {
    gl.current?.domElement.toBlob((blob) => {
      if (blob) download("scene.png", blob);
      else
        setError(
          t(
            L(
              "Не удалось создать PNG.",
              "Could not create PNG.",
              "PNG жасалмады.",
            ),
          ),
        );
    });
  }
  function key(e: KeyboardEvent) {
    if (
      (e.target as HTMLElement).closest(".model-object-list") &&
      ["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)
    ) {
      e.preventDefault();
      if (!current.current.objects.length) return;
      const index = Math.max(
        0,
        current.current.objects.findIndex((o) => o.id === selected),
      );
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? current.current.objects.length - 1
            : clamp(
                index + (e.key === "ArrowDown" ? 1 : -1),
                0,
                current.current.objects.length - 1,
              );
      const object = current.current.objects[next];
      select(object.id);
      setVertexMode(false);
      requestAnimationFrame(() => {
        const buttons = root.current?.querySelectorAll<HTMLButtonElement>(
          "[data-model-object]",
        );
        Array.from(buttons ?? [])
          .find((button) => button.dataset.modelObject === object.id)
          ?.focus();
      });
      return;
    }
    if (
      (e.target as HTMLElement).closest(
        "input,textarea,select,[contenteditable=true]",
      )
    )
      return;
    const k = e.key.toLowerCase(),
      mod = e.ctrlKey || e.metaKey;
    if (mod && k === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if (mod && k === "y") {
      e.preventDefault();
      redo();
    } else if (mod && k === "d") {
      e.preventDefault();
      duplicate();
    } else if (k === "delete" || k === "backspace") {
      e.preventDefault();
      remove();
    } else if (k === "w") {
      setMode("translate");
      setVertexMode(false);
    } else if (k === "e") {
      setMode("rotate");
      setVertexMode(false);
    } else if (k === "r") {
      setMode("scale");
      setVertexMode(false);
    } else if (k === "f" || k === "home") {
      e.preventDefault();
      view("frame");
    } else if (k === "1") view("front");
    else if (k === "3") view("right");
    else if (k === "7") view("top");
    else if (k === "5") setOrtho((p) => !p);
    else if (k === "escape") {
      select(null);
      setVertexMode(false);
    }
  }
  return (
    <div
      className="model-workbench"
      ref={root}
      tabIndex={0}
      onKeyDown={key}
      aria-label={t(
        L("Рабочее пространство 3D", "3D workspace", "3D жұмыс кеңістігі"),
      )}
    >
      <div className="model-toolbar">
        <div className="model-toolgroup">
          <button
            className={btn}
            onClick={undo}
            disabled={!commands.current.past.length}
            title="Ctrl / ⌘ Z"
          >
            <Undo2 size={14} />
            {t(L("Отменить", "Undo", "Болдырмау"))}
          </button>
          <button
            className={btn}
            onClick={redo}
            disabled={!commands.current.future.length}
            title="Ctrl / ⌘ Shift Z"
          >
            <Redo2 size={14} />
            {t(L("Вернуть", "Redo", "Қайтару"))}
          </button>
        </div>
        <div className="model-toolgroup">
          {(
            [
              ["translate", Move3d, L("Двигать", "Move", "Жылжыту"), "W"],
              ["rotate", Rotate3d, L("Вращать", "Rotate", "Бұру"), "E"],
              ["scale", Scale3d, L("Размер", "Scale", "Масштаб"), "R"],
            ] as const
          ).map(([tool, Icon, label, shortcut]) => (
            <button
              className={btn}
              key={tool}
              aria-pressed={mode === tool && !vertexMode}
              title={shortcut}
              onClick={() => {
                setMode(tool);
                setVertexMode(false);
              }}
            >
              <Icon size={14} />
              {t(label)}
            </button>
          ))}
        </div>
        <div className="model-toolgroup model-export">
          <label className={`${btn} model-file`}>
            OBJ ↑
            <input
              type="file"
              accept=".obj,text/plain"
              onChange={(e) => {
                void importOBJ(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <button
            className={btn}
            onClick={() => void exportGeometry("glb")}
            disabled={exporting || !value.objects.some((o) => !o.hidden)}
          >
            GLB ↓
          </button>
          <button
            className={btn}
            onClick={() => void exportGeometry("obj")}
            disabled={exporting || !value.objects.some((o) => !o.hidden)}
          >
            OBJ ↓
          </button>
          <button className={btn} onClick={shot}>
            <Download size={14} />
            PNG
          </button>
        </div>
      </div>
      {error && (
        <div className="model-error" role="alert">
          {error}
          <button
            aria-label={t(
              L("Закрыть сообщение", "Dismiss message", "Хабарламаны жабу"),
            )}
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}
      <div className="model-layout">
        <aside className="model-hierarchy">
          <div className="model-panel-title">
            <Box size={14} />
            {t(L("Сцена", "Scene", "Сахна"))}
            <span>{value.objects.length}/200</span>
          </div>
          <div className="model-add-grid">
            {kinds.map((kind) => (
              <button className={btn} key={kind} onClick={() => add(kind)}>
                + {name(kind)}
              </button>
            ))}
          </div>
          <div
            className="model-object-list"
            aria-label={t(
              L("Объекты сцены", "Scene objects", "Сахна нысандары"),
            )}
          >
            {value.objects.length ? (
              value.objects.map((o, i) => (
                <div
                  className={`model-object-row ${selected === o.id ? "is-selected" : ""}`}
                  key={o.id}
                >
                  <button
                    className="model-object-name"
                    data-model-object={o.id}
                    onClick={() => {
                      select(o.id);
                      setVertexMode(false);
                    }}
                    aria-pressed={selected === o.id}
                    title={title(o, i)}
                  >
                    <Box size={12} />
                    <span>{title(o, i)}</span>
                  </button>
                  <button
                    aria-label={`${t(L("Видимость объекта", "Object visibility", "Нысан көрінуі"))}: ${title(o, i)}`}
                    aria-pressed={!o.hidden}
                    onClick={() =>
                      commit({
                        ...current.current,
                        objects: current.current.objects.map((x) =>
                          x.id === o.id ? { ...x, hidden: !x.hidden } : x,
                        ),
                      })
                    }
                  >
                    {o.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    aria-label={`${t(L("Блокировка объекта", "Lock object", "Нысанды құлыптау"))}: ${title(o, i)}`}
                    aria-pressed={!!o.locked}
                    onClick={() =>
                      commit({
                        ...current.current,
                        objects: current.current.objects.map((x) =>
                          x.id === o.id ? { ...x, locked: !x.locked } : x,
                        ),
                      })
                    }
                  >
                    {o.locked ? (
                      <LockKeyhole size={12} />
                    ) : (
                      <Unlock size={12} />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="model-empty">
                {t(
                  L(
                    "Добавьте примитив или импортируйте OBJ. Выбор объекта открывает его параметры.",
                    "Add a primitive or import OBJ. Select an object to inspect its properties.",
                    "Примитив қосыңыз немесе OBJ импорттаңыз. Параметрлерін ашу үшін нысанды таңдаңыз.",
                  ),
                )}
              </p>
            )}
          </div>
          <div className="model-scene-options">
            <label>
              {t(L("Фон сцены", "Scene background", "Сахна фоны"))}
              <input
                type="color"
                value={value.bg}
                onFocus={begin}
                onChange={(e) =>
                  emit({ ...current.current, bg: e.target.value })
                }
                onBlur={finish}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={grid}
                onChange={(e) => setGrid(e.target.checked)}
              />
              {t(L("Сетка пола", "Floor grid", "Еден торы"))}
            </label>
            <label>
              <input
                type="checkbox"
                checked={value.ground !== false}
                onChange={(e) =>
                  commit({ ...current.current, ground: e.target.checked })
                }
              />
              {t(L("Плоскость пола", "Ground plane", "Еден жазықтығы"))}
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!value.wireframe}
                onChange={(e) =>
                  commit({ ...current.current, wireframe: e.target.checked })
                }
              />
              {t(L("Каркасный вид", "Wireframe", "Қаңқалық көрініс"))}
            </label>
            <Numeric
              label={t(L("Сила света", "Light intensity", "Жарық күші"))}
              value={value.light ?? 1.6}
              min={0}
              max={10}
              step={0.1}
              onBegin={begin}
              onValue={(light) => emit({ ...current.current, light })}
              onEnd={finish}
            />
          </div>
        </aside>
        <div className="model-view">
          <div className="model-view-toolbar">
            <select
              value={command.view}
              aria-label={t(L("Ракурс", "View", "Көрініс"))}
              onChange={(e) => view(e.target.value as View)}
            >
              {(
                [
                  ["iso", L("Общий ракурс", "Overview", "Жалпы көрініс")],
                  ["front", L("Спереди · 1", "Front · 1", "Алдынан · 1")],
                  ["back", L("Сзади", "Back", "Артынан")],
                  ["right", L("Справа · 3", "Right · 3", "Оң жақтан · 3")],
                  ["left", L("Слева", "Left", "Сол жақтан")],
                  ["top", L("Сверху · 7", "Top · 7", "Үстінен · 7")],
                  [
                    "frame",
                    L(
                      "К выделению · F",
                      "Frame selection · F",
                      "Таңдауды көрсету · F",
                    ),
                  ],
                ] as const
              ).map(([v, label]) => (
                <option key={v} value={v}>
                  {t(label)}
                </option>
              ))}
            </select>
            <button className={btn} title="F" onClick={() => view("frame")}>
              <Focus size={14} />
              {t(L("Показать", "Frame", "Көрсету"))}
            </button>
            <button
              className={btn}
              title={t(
                L(
                  "Перспектива / ортография · 5",
                  "Perspective / orthographic · 5",
                  "Перспектива / ортография · 5",
                ),
              )}
              aria-label={t(
                L(
                  "Ортографическая проекция",
                  "Orthographic projection",
                  "Ортографиялық проекция",
                ),
              )}
              aria-pressed={ortho}
              onClick={() => setOrtho((p) => !p)}
            >
              {ortho ? "ORTHO" : "PERSP"}
            </button>
            <select
              aria-label={t(
                L(
                  "Координаты инструмента",
                  "Transform space",
                  "Құрал координаттары",
                ),
              )}
              value={space}
              onChange={(e) => setSpace(e.target.value as "world" | "local")}
            >
              <option value="world">
                {t(L("Мировые", "World", "Әлемдік"))}
              </option>
              <option value="local">
                {t(L("Локальные", "Local", "Жергілікті"))}
              </option>
            </select>
            <label className="model-check">
              <input
                type="checkbox"
                checked={snap}
                onChange={(e) => setSnap(e.target.checked)}
              />
              {t(L("Привязка", "Snap", "Байлау"))}
            </label>
          </div>
          <div
            className="model-canvas"
            data-testid="model-viewport"
            style={{ background: value.bg }}
            onPointerDown={() => root.current?.focus({ preventScroll: true })}
          >
            <Canvas
              frameloop="demand"
              camera={{ position: [5, 4, 6], fov: 50 }}
              gl={{ preserveDrawingBuffer: true, antialias: true }}
              onCreated={(s) => {
                gl.current = s.gl;
              }}
              onPointerMissed={(e) => {
                if (e.button === 0 && !vertexMode) select(null);
              }}
            >
              <color attach="background" args={[value.bg]} />
              {ortho && (
                <OrthographicCamera
                  makeDefault
                  position={[5, 4, 6]}
                  zoom={45}
                />
              )}
              <ambientLight intensity={0.55} />
              <directionalLight
                position={[5, 8, 4]}
                intensity={value.light ?? 1.6}
              />
              <directionalLight position={[-4, 3, -4]} intensity={0.35} />
              {grid && (
                <gridHelper args={[40, 80, "#73766e", "#393d38"]} />
              )}{" "}
              {value.ground !== false && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
                  <planeGeometry args={[100, 100]} />
                  <meshStandardMaterial color="#26292a" roughness={1} />
                </mesh>
              )}
              {value.objects
                .filter((o) => !o.hidden)
                .map((o) => (
                  <SceneObject
                    key={o.id}
                    object={o}
                    selected={o.id === selected}
                    wireframe={!!value.wireframe}
                    onSelect={select}
                    register={register}
                    engine={getEngine}
                    onEvaluated={onEvaluated}
                  />
                ))}
              {selectedMesh &&
                cur &&
                !cur.hidden &&
                !cur.locked &&
                !vertexMode && (
                  <TransformControls
                    object={selectedMesh}
                    mode={mode}
                    space={space}
                    size={0.85}
                    translationSnap={snap ? 0.25 : null}
                    rotationSnap={snap ? 15 * rad : null}
                    scaleSnap={snap ? 0.1 : null}
                    onMouseDown={begin}
                    onMouseUp={syncTransform}
                  />
                )}
              {vertexMode &&
                cur?.kind === "mesh" &&
                !cur.hidden &&
                !cur.locked && (
                  <>
                    <VertexPoints object={cur} onSelect={setVertex} />
                    <VertexMarker position={worldVertex} register={setMarker} />
                    {marker && (
                      <TransformControls
                        object={marker}
                        mode="translate"
                        translationSnap={snap ? 0.25 : null}
                        onMouseDown={begin}
                        onMouseUp={syncVertex}
                      />
                    )}
                  </>
                )}
              <OrbitControls
                ref={orbit}
                makeDefault
                enableDamping
                dampingFactor={0.12}
              />
              <CameraRig
                command={command}
                objects={objectRefs.current}
                selected={selected}
                controls={orbit}
              />
            </Canvas>
            <div className="model-canvas-label">
              {t(
                vertexMode
                  ? L(
                      "РЕДАКТИРОВАНИЕ ВЕРШИН",
                      "VERTEX EDITING",
                      "ТӨБЕЛЕРДІ ӨҢДЕУ",
                    )
                  : L("РЕЖИМ ОБЪЕКТОВ", "OBJECT MODE", "НЫСАН РЕЖИМІ"),
              )}
              {cur?.locked
                ? ` · ${t(L("ЗАБЛОКИРОВАН", "LOCKED", "ҚҰЛЫПТАЛҒАН"))}`
                : ""}
            </div>
          </div>
          <div className="model-status">
            <span>
              {value.objects.filter((o) => !o.hidden).length}{" "}
              {t(L("видимых объектов", "visible objects", "көрінетін нысан"))}
            </span>
            <span>
              {t(
                L(
                  "Орбита: мышь / касание · F — к выделению",
                  "Orbit: mouse / touch · F to frame",
                  "Орбита: тінтуір / сенсор · F — көрсету",
                ),
              )}
            </span>
          </div>
        </div>
        <aside className="model-inspector">
          <div className="model-panel-title">
            <MousePointer2 size={14} />
            {t(L("Свойства", "Inspector", "Қасиеттер"))}
          </div>
          {cur ? (
            <>
              <label className="model-name-input">
                {t(L("Имя объекта", "Object name", "Нысан атауы"))}
                <input
                  value={cur.name ?? ""}
                  maxLength={80}
                  disabled={cur.locked}
                  onFocus={begin}
                  onChange={(e) => live({ name: e.target.value })}
                  onBlur={finish}
                />
              </label>
              {cur.locked && (
                <p className="model-warning">
                  {t(
                    L(
                      "Объект заблокирован. Снимите блокировку в списке сцены, чтобы редактировать его.",
                      "Object is locked. Unlock it in the scene list to edit.",
                      "Нысан құлыпталған. Өңдеу үшін сахна тізімінен құлпын ашыңыз.",
                    ),
                  )}
                </p>
              )}
              <fieldset className="model-property-group" disabled={cur.locked}>
                <legend>{t(L("Положение", "Position", "Орны"))}</legend>
                <div className="model-number-grid">
                  {["X", "Y", "Z"].map((a, i) => (
                    <Numeric
                      key={a}
                      label={`${t(L("Положение", "Position", "Орны"))} ${a}`}
                      value={cur.pos[i]}
                      onBegin={begin}
                      onValue={(n) => {
                        const pos = [...cur.pos] as Obj["pos"];
                        pos[i] = n;
                        live({ pos });
                      }}
                      onEnd={finish}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset className="model-property-group" disabled={cur.locked}>
                <legend>
                  {t(L("Поворот, °", "Rotation, °", "Бұрылу, °"))}
                </legend>
                <div className="model-number-grid">
                  {(["rotX", "rotY", "rotZ"] as const).map((k, i) => (
                    <Numeric
                      key={k}
                      label={`${t(L("Поворот", "Rotation", "Бұрылу"))} ${["X", "Y", "Z"][i]}`}
                      value={cur[k] ?? 0}
                      step={1}
                      onBegin={begin}
                      onValue={(n) => live({ [k]: n })}
                      onEnd={finish}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset className="model-property-group" disabled={cur.locked}>
                <legend>
                  {t(L("Размеры, ед.", "Dimensions, units", "Өлшемдер, бірл."))}
                </legend>
                <div className="model-number-grid">
                  {["X", "Y", "Z"].map((a, i) => (
                    <Numeric
                      key={a}
                      label={`${t(L("Размер", "Dimension", "Өлшем"))} ${a}`}
                      value={base[i] * cur.scale * (cur.size?.[i] ?? 1)}
                      min={0.001}
                      max={10000}
                      onBegin={begin}
                      onValue={(n) => {
                        const size = [
                          ...(cur.size ?? [1, 1, 1]),
                        ] as NonNullable<Obj["size"]>;
                        size[i] = clamp(
                          n / Math.max(0.0001, base[i] * cur.scale),
                          0.01,
                          100,
                        );
                        live({ size });
                      }}
                      onEnd={finish}
                    />
                  ))}
                </div>
                <Numeric
                  label={t(
                    L("Единый масштаб", "Uniform scale", "Бірыңғай масштаб"),
                  )}
                  value={cur.scale}
                  min={0.01}
                  max={100}
                  onBegin={begin}
                  onValue={(scale) => live({ scale })}
                  onEnd={finish}
                />
                <button
                  className={btn}
                  onClick={() =>
                    patch({
                      pos: [0, 0.8, 0],
                      rotX: 0,
                      rotY: 0,
                      rotZ: 0,
                      scale: 1,
                      size: [1, 1, 1],
                    })
                  }
                >
                  {t(
                    L(
                      "Сбросить трансформации",
                      "Reset transforms",
                      "Түрлендіруді қалпына келтіру",
                    ),
                  )}
                </button>
                <button className={btn} onClick={placeOnGround}>
                  {t(L("Поставить на пол", "Place on ground", "Еденге қою"))}
                </button>
              </fieldset>
              <fieldset className="model-property-group" disabled={cur.locked}>
                <legend>{t(L("Геометрия", "Geometry", "Геометрия"))}</legend>
                {cur.kind !== "mesh" && cur.kind !== "box" && (
                  <Numeric
                    label={t(L("Сегменты", "Segments", "Сегменттер"))}
                    value={cur.segments ?? (cur.kind === "torus" ? 48 : 32)}
                    min={3}
                    max={64}
                    step={1}
                    onBegin={begin}
                    onValue={(n) => live({ segments: Math.round(n) })}
                    onEnd={finish}
                  />
                )}
                <label className="model-check">
                  <input
                    type="checkbox"
                    checked={cur.flat ?? false}
                    onChange={(e) => patch({ flat: e.target.checked })}
                  />
                  {t(
                    L("Плоское затенение", "Flat shading", "Жазық көлеңкелеу"),
                  )}
                </label>
                {cur.kind === "mesh" ? (
                  <>
                    <p className="model-small">
                      {count} {t(L("вершин", "vertices", "төбе"))} ·{" "}
                      {(cur.indices?.length ?? 0) / 3}{" "}
                      {t(L("треугольников", "triangles", "үшбұрыш"))}
                    </p>
                    <button
                      className={btn}
                      aria-pressed={vertexMode}
                      onClick={() => {
                        setVertexMode((p) => !p);
                        setVertex(0);
                      }}
                    >
                      {t(
                        vertexMode
                          ? L("Режим объектов", "Object mode", "Нысан режимі")
                          : L(
                              "Редактировать вершины",
                              "Edit vertices",
                              "Төбелерді өңдеу",
                            ),
                      )}
                    </button>
                  </>
                ) : (
                  <button className={btn} onClick={() => void convert()}>
                    {t(
                      L(
                        "Преобразовать в сетку",
                        "Convert to editable mesh",
                        "Өңделетін торға айналдыру",
                      ),
                    )}
                  </button>
                )}
              </fieldset>
              <fieldset className="model-property-group" disabled={cur.locked}>
                <legend>
                  {t(L("Модификаторы", "Modifiers", "Модификаторлар"))}
                </legend>
                <div className="model-mod-add">
                  {(["mirror", "array", "subdivide", "twist"] as const).map(
                    (type) => (
                      <button
                        className={btn}
                        key={type}
                        disabled={(cur.modifiers?.length ?? 0) >= 8}
                        onClick={() => addModifier(type)}
                      >
                        {t(
                          {
                            mirror: L("Зеркало", "Mirror", "Айна"),
                            array: L("Массив", "Array", "Массив"),
                            subdivide: L(
                              "Подразделение",
                              "Subdivision",
                              "Бөлу",
                            ),
                            twist: L("Скручивание", "Twist", "Бұрау"),
                          }[type],
                        )}{" "}
                        +
                      </button>
                    ),
                  )}
                </div>
                {cur.modifiers?.map((m, i) => (
                  <div
                    className="model-modifier"
                    key={m.id}
                    data-modifier={m.type}
                  >
                    <div className="model-mod-header">
                      <label className="model-check">
                        <input
                          type="checkbox"
                          checked={m.enabled}
                          aria-label={
                            t(
                              L(
                                "Включить модификатор",
                                "Enable modifier",
                                "Модификаторды қосу",
                              ),
                            ) + ` ${i + 1}`
                          }
                          onChange={(e) =>
                            changeModifier(m.id, { enabled: e.target.checked })
                          }
                        />
                        {t(
                          {
                            mirror: L("Зеркало", "Mirror", "Айна"),
                            array: L("Массив", "Array", "Массив"),
                            subdivide: L(
                              "Подразделение",
                              "Subdivision",
                              "Бөлу",
                            ),
                            twist: L("Скручивание", "Twist", "Бұрау"),
                          }[m.type],
                        )}
                      </label>
                      <button
                        className={btn}
                        disabled={!i}
                        aria-label={
                          t(
                            L(
                              "Модификатор выше",
                              "Move modifier up",
                              "Модификаторды жоғары жылжыту",
                            ),
                          ) + ` ${i + 1}`
                        }
                        onClick={() => moveModifier(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        className={btn}
                        disabled={i === (cur.modifiers?.length ?? 0) - 1}
                        aria-label={
                          t(
                            L(
                              "Модификатор ниже",
                              "Move modifier down",
                              "Модификаторды төмен жылжыту",
                            ),
                          ) + ` ${i + 1}`
                        }
                        onClick={() => moveModifier(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        className={btn}
                        aria-label={
                          t(
                            L(
                              "Удалить модификатор",
                              "Remove modifier",
                              "Модификаторды жою",
                            ),
                          ) + ` ${i + 1}`
                        }
                        onClick={() =>
                          patch({
                            modifiers: cur.modifiers?.filter(
                              (x) => x.id !== m.id,
                            ),
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                    {(m.type === "mirror" || m.type === "twist") && (
                      <label>
                        {t(L("Ось", "Axis", "Ось"))}
                        <select
                          aria-label={
                            t(
                              L(
                                "Ось модификатора",
                                "Modifier axis",
                                "Модификатор осі",
                              ),
                            ) + ` ${i + 1}`
                          }
                          value={m.axis}
                          onChange={(e) =>
                            changeModifier(m.id, {
                              axis: e.target.value as "x" | "y" | "z",
                            })
                          }
                        >
                          <option value="x">X</option>
                          <option value="y">Y</option>
                          <option value="z">Z</option>
                        </select>
                      </label>
                    )}
                    {m.type === "mirror" && (
                      <Numeric
                        label={t(
                          L("Смещение зеркала", "Mirror offset", "Айна ығысуы"),
                        )}
                        value={m.offset}
                        onBegin={begin}
                        onValue={(n) =>
                          changeModifier(m.id, { offset: n }, true)
                        }
                        onEnd={finish}
                      />
                    )}
                    {m.type === "twist" && (
                      <Numeric
                        label={t(
                          L("Угол скручивания", "Twist angle", "Бұрау бұрышы"),
                        )}
                        value={m.angle}
                        min={-360}
                        max={360}
                        step={1}
                        onBegin={begin}
                        onValue={(n) =>
                          changeModifier(m.id, { angle: n }, true)
                        }
                        onEnd={finish}
                      />
                    )}
                    {m.type === "array" && (
                      <>
                        <Numeric
                          label={t(
                            L("Число копий", "Copy count", "Көшірмелер саны"),
                          )}
                          value={m.count}
                          min={2}
                          max={20}
                          step={1}
                          onBegin={begin}
                          onValue={(n) =>
                            changeModifier(m.id, { count: Math.round(n) }, true)
                          }
                          onEnd={finish}
                        />
                        {["X", "Y", "Z"].map((axis, a) => (
                          <Numeric
                            key={axis}
                            label={
                              t(
                                L("Шаг массива", "Array step", "Массив қадамы"),
                              ) + ` ${axis}`
                            }
                            value={m.offset[a]}
                            step={0.1}
                            onBegin={begin}
                            onValue={(n) => {
                              const offset = [...m.offset] as [
                                number,
                                number,
                                number,
                              ];
                              offset[a] = n;
                              changeModifier(m.id, { offset }, true);
                            }}
                            onEnd={finish}
                          />
                        ))}
                      </>
                    )}
                    {m.type === "subdivide" && (
                      <>
                        <Numeric
                          label={t(
                            L(
                              "Уровни подразделения",
                              "Subdivision levels",
                              "Бөлу деңгейлері",
                            ),
                          )}
                          value={m.levels}
                          min={1}
                          max={2}
                          step={1}
                          onBegin={begin}
                          onValue={(n) =>
                            changeModifier(
                              m.id,
                              { levels: Math.round(n) },
                              true,
                            )
                          }
                          onEnd={finish}
                        />
                        <label className="model-check">
                          <input
                            type="checkbox"
                            checked={m.smooth}
                            onChange={(e) =>
                              changeModifier(m.id, { smooth: e.target.checked })
                            }
                          />
                          {t(
                            L(
                              "Сглаживание Loop",
                              "Loop smoothing",
                              "Loop тегістеу",
                            ),
                          )}
                        </label>
                      </>
                    )}
                  </div>
                ))}
                {!!cur.modifiers?.length && (
                  <button className={btn} onClick={() => void convert()}>
                    {t(
                      L(
                        "Применить стек в сетку",
                        "Bake stack to mesh",
                        "Стекті торға қолдану",
                      ),
                    )}
                  </button>
                )}
                <p className="model-small">
                  {t(
                    L(
                      "Исходная геометрия сохраняется до применения стека.",
                      "Source geometry is preserved until the stack is baked.",
                      "Стек қолданылғанша түпнұсқа геометрия сақталады.",
                    ),
                  )}
                </p>
                <output
                  className="model-small"
                  data-testid="model-engine-status"
                >
                  {modelStats.vertices} {t(L("вершин", "vertices", "төбе"))} ·{" "}
                  {modelStats.triangles} △ · {modelStats.ms.toFixed(1)} ms
                </output>
              </fieldset>
              {vertexMode && cur.kind === "mesh" && (
                <fieldset
                  className="model-property-group"
                  disabled={cur.locked}
                >
                  <legend>
                    {t(
                      L(
                        "Выбранная вершина",
                        "Selected vertex",
                        "Таңдалған төбе",
                      ),
                    )}
                  </legend>
                  <Numeric
                    label={t(
                      L("Номер вершины", "Vertex number", "Төбе нөмірі"),
                    )}
                    value={activeVertex + 1}
                    min={1}
                    max={count}
                    step={1}
                    onBegin={() => {}}
                    onValue={(n) => setVertex(Math.round(n) - 1)}
                    onEnd={() => {}}
                  />
                  <div className="model-number-grid">
                    {["X", "Y", "Z"].map((a, i) => (
                      <Numeric
                        key={a}
                        label={`${t(L("Вершина", "Vertex", "Төбе"))} ${a}`}
                        value={cur.vertices?.[activeVertex * 3 + i] ?? 0}
                        onBegin={begin}
                        onValue={(n) => setVertexCoordinate(i, n)}
                        onEnd={finish}
                      />
                    ))}
                  </div>
                  <p className="model-small">
                    {t(
                      L(
                        "Выберите точку в окне сцены или укажите её номер. Координаты вершины локальные.",
                        "Pick a point in the viewport or enter its number. Vertex coordinates are local.",
                        "Сахнадан нүктені таңдаңыз немесе нөмірін енгізіңіз. Төбе координаттары жергілікті.",
                      ),
                    )}
                  </p>
                </fieldset>
              )}
              <fieldset className="model-property-group" disabled={cur.locked}>
                <legend>{t(L("Материал", "Material", "Материал"))}</legend>
                <label className="model-color">
                  {t(L("Цвет", "Color", "Түс"))}
                  <input
                    type="color"
                    value={cur.color}
                    onFocus={begin}
                    onChange={(e) => live({ color: e.target.value })}
                    onBlur={finish}
                  />
                  <code>{cur.color}</code>
                </label>
                <div className="model-number-grid model-two">
                  <Numeric
                    label={t(L("Металличность", "Metalness", "Металлдық"))}
                    value={cur.metal ?? 0.1}
                    min={0}
                    max={1}
                    step={0.05}
                    onBegin={begin}
                    onValue={(metal) => live({ metal })}
                    onEnd={finish}
                  />
                  <Numeric
                    label={t(L("Шероховатость", "Roughness", "Кедір-бұдырлық"))}
                    value={cur.rough ?? 0.5}
                    min={0}
                    max={1}
                    step={0.05}
                    onBegin={begin}
                    onValue={(rough) => live({ rough })}
                    onEnd={finish}
                  />
                </div>
                <div className="model-materials">
                  {(
                    [
                      [L("Глина", "Clay", "Саз"), "#bd8464", 0, 0.8],
                      [L("Металл", "Metal", "Металл"), "#c1c7cf", 1, 0.2],
                      [L("Пластик", "Plastic", "Пластик"), "#e8590c", 0, 0.3],
                    ] as const
                  ).map(([label, color, metal, rough]) => (
                    <button
                      className={btn}
                      key={color}
                      onClick={() => patch({ color, metal, rough })}
                    >
                      {t(label)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="model-object-actions">
                <button
                  className={btn}
                  disabled={cur.locked}
                  onClick={duplicate}
                >
                  <Copy size={14} />
                  {t(L("Дубль", "Duplicate", "Көшірме"))}
                </button>
                <button
                  className={`${btn} model-danger`}
                  disabled={cur.locked}
                  onClick={remove}
                >
                  <Trash2 size={14} />
                  {t(L("Удалить", "Delete", "Жою"))}
                </button>
              </div>
            </>
          ) : (
            <div className="model-empty">
              <MousePointer2 size={26} />
              <p>
                {t(
                  L(
                    "Выберите объект на сцене или в списке. Здесь появятся размеры, трансформации и материалы.",
                    "Select an object in the viewport or hierarchy to edit dimensions, transforms and materials.",
                    "Өлшем, түрлендіру және материалды өңдеу үшін сахнадан не тізімнен нысанды таңдаңыз.",
                  ),
                )}
              </p>
            </div>
          )}
        </aside>
      </div>
      <div className="model-shortcuts">
        W / E / R ·{" "}
        {t(
          L(
            "двигать / вращать / масштаб",
            "move / rotate / scale",
            "жылжыту / бұру / масштаб",
          ),
        )}{" "}
        · F · 1 / 3 / 7 · Ctrl / ⌘ D · Delete · Ctrl / ⌘ Z
        <span className="model-export-note">
          {t(
            L(
              "OBJ — геометрия. GLB — геометрия и материалы. Импорт OBJ не загружает внешние файлы.",
              "OBJ: geometry. GLB: geometry and materials. OBJ import never loads external files.",
              "OBJ — геометрия. GLB — геометрия мен материалдар. OBJ импорты сыртқы файлдарды жүктемейді.",
            ),
          )}
        </span>
      </div>
    </div>
  );
}
