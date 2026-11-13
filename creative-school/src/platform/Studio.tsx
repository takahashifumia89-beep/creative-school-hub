import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import { useLocale, L } from "./locale";
import {
  api,
  download,
  message,
  ApiError,
  type Project,
  type User,
} from "./client";
import { validDocument, draftSchema, type ProjectKind } from "./schema";
const Design = lazy(() =>
  import("../features/studio/DesignEditor").then((m) => ({
    default: m.DesignEditor,
  })),
);
const Model = lazy(() =>
  import("../features/studio/Editor3D").then((m) => ({ default: m.Editor3D })),
);
const Media = lazy(() => import("./MediaEditor"));
const defaults = {
  design: { bg: "#f6f1e7", w: 800, h: 500, shapes: [] },
  "3d": { bg: "#1b1b22", objects: [], light: 1.6, ground: true },
  image: {
    filename: "",
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    rotation: 0,
    crop: "original",
  },
  video: { clips: [], width: "1280", bg: "#111111" },
  notes: {},
};
type Draft = {
  title: string;
  description: string;
  content: string;
  version: number;
  id: string | null;
};
export default function Studio({
  kind,
  user,
}: {
  kind: ProjectKind;
  user: User;
}) {
  const { t } = useLocale(),
    [, navigate] = useLocation();
  const id = new URLSearchParams(window.location.search).get("project");
  const storageKey = `cs-draft:${user.id}:${kind}:${id ?? "new"}`;
  const [draft, setDraft] = useState<Draft>({
    title: "",
    description: "",
    content: JSON.stringify(defaults[kind]),
    version: 1,
    id,
  });
  const [ready, setReady] = useState(!id),
    [error, setError] = useState(""),
    [state, setState] = useState(""),
    [blocked, setBlocked] = useState(false),
    [recovery, setRecovery] = useState<Draft | null>(null);
  const saved = useRef(""),
    latest = useRef(draft),
    lock = useRef(false);
  latest.current = draft;
  const dirty = JSON.stringify(draft) !== saved.current;
  const load = useCallback(async () => {
    setError("");
    setReady(false);
    try {
      const p = await api<Project>(`/projects/${id}`);
      if (p.kind !== kind || !validDocument(kind, p.content))
        throw new ApiError("INVALID_DOCUMENT", 400);
      const d = {
        id: p.id,
        title: p.title,
        description: p.description ?? "",
        content: p.content ?? JSON.stringify(defaults[kind]),
        version: p.version,
      };
      setDraft(d);
      saved.current = JSON.stringify(d);
      setBlocked(false);
      setReady(true);
    } catch (e) {
      setError(t(message(e)));
    }
  }, [id, kind, t]);
  useEffect(() => {
    let local: Draft | null = null;
    try {
      const parsed = draftSchema.safeParse(
        JSON.parse(localStorage.getItem(storageKey) ?? "null"),
      );
      local = parsed.success ? parsed.data : null;
    } catch {
      /* broken draft */
    }
    if (local && validDocument(kind, local.content)) setRecovery(local);
    if (id) void load();
    else {
      saved.current = JSON.stringify(latest.current);
      setReady(true);
    }
  }, [storageKey]);
  useEffect(() => {
    if (!ready || !dirty) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      setError(
        t(
          L(
            "Не хватает места для локального черновика. Скачайте JSON.",
            "Local storage is full. Download a JSON backup.",
            "Жергілікті жад толы. JSON көшірмесін жүктеңіз.",
          ),
        ),
      );
    }
  }, [draft, dirty, ready, storageKey]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== saved.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]");
      if (
        a &&
        JSON.stringify(latest.current) !== saved.current &&
        !confirm(
          t(
            L(
              "Покинуть редактор? Локальный черновик сохранён, но загрузка на сервер ещё не завершена.",
              "Leave the editor? A local draft remains, but server saving is not complete.",
              "Редактордан шығу керек пе? Жергілікті нұсқа сақталған, серверге сақтау аяқталмады.",
            ),
          ),
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", click, true);
    };
  }, [t]);
  async function save() {
    if (lock.current || blocked || !ready || !latest.current.title.trim())
      return;
    lock.current = true;
    setState(t(L("Сохраняем…", "Saving…", "Сақталуда…")));
    const snapshot = latest.current;
    try {
      const p = await api<Project>(
        snapshot.id ? `/projects/${snapshot.id}` : "/projects",
        snapshot.id ? "PATCH" : "POST",
        { ...snapshot, kind },
      );
      const d = { ...snapshot, id: p.id, version: p.version };
      saved.current = JSON.stringify(d);
      setDraft((current) => ({ ...current, id: p.id, version: p.version }));
      setState(t(L("Сохранено", "Saved", "Сақталды")));
      setError("");
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* storage blocked */
      }
      if (!snapshot.id) {
        if (
          latest.current.content !== snapshot.content ||
          latest.current.title !== snapshot.title ||
          latest.current.description !== snapshot.description
        ) {
          try {
            localStorage.setItem(
              `cs-draft:${user.id}:${kind}:${p.id}`,
              JSON.stringify({
                ...latest.current,
                id: p.id,
                version: p.version,
              }),
            );
          } catch {
            /* existing local draft still available */
          }
        }
        navigate(`/studio/${kind}?project=${p.id}`, { replace: true });
      }
    } catch (e) {
      setError(t(message(e)));
      if (e instanceof ApiError && e.status === 409) setBlocked(true);
    } finally {
      lock.current = false;
    }
  }
  useEffect(() => {
    if (!dirty || !ready || blocked || !draft.title.trim()) return;
    const timer = setTimeout(() => void save(), 1800);
    return () => clearTimeout(timer);
  }, [draft, dirty, ready, blocked]);
  const update = (value: unknown) =>
    setDraft((d) => ({ ...d, content: JSON.stringify(value) }));
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 220000) throw Error();
      const raw = JSON.parse(await file.text());
      const content =
        typeof raw.content === "string" ? raw.content : JSON.stringify(raw);
      if (!validDocument(kind, content)) throw Error();
      setDraft((d) => ({ ...d, content }));
    } catch {
      setError(
        t(
          L(
            "Неверный формат файла.",
            "Invalid file format.",
            "Файл пішімі қате.",
          ),
        ),
      );
    }
  };
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">CREATIVE WORKSPACE / {kind.toUpperCase()}</p>
          <h1>{t(L("Студия", "Studio", "Студия"))}</h1>
          <p>
            {t(
              L(
                "Автосохранение • локальное восстановление • контроль версий",
                "Autosave • local recovery • version protection",
                "Автосақтау • жергілікті қалпына келтіру • нұсқаны қорғау",
              ),
            )}
          </p>
        </div>
        <span role="status">
          {state ||
            (!dirty && ready
              ? t(L("Сохранено", "Saved", "Сақталды"))
              : t(
                  L(
                    "Есть изменения",
                    "Unsaved changes",
                    "Сақталмаған өзгерістер",
                  ),
                ))}
        </span>
      </div>
      {recovery && (
        <div className="notice">
          {t(
            L(
              "Найден локальный черновик.",
              "A local draft was found.",
              "Жергілікті нұсқа табылды.",
            ),
          )}
          <button
            onClick={() => {
              setDraft((d) => ({
                ...recovery,
                id: d.id,
                version: recovery.version,
              }));
              setRecovery(null);
            }}
          >
            {t(L("Восстановить", "Restore", "Қалпына келтіру"))}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(storageKey);
              setRecovery(null);
            }}
          >
            {t(L("Отбросить", "Discard", "Жою"))}
          </button>
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
          {id && (
            <button onClick={() => void load()}>
              {t(
                L(
                  "Загрузить с сервера",
                  "Reload server copy",
                  "Серверден қайта жүктеу",
                ),
              )}
            </button>
          )}
        </div>
      )}
      <div className="studio-meta">
        <label>
          {t(L("Название", "Title", "Атауы"))}
          <input
            value={draft.title}
            maxLength={120}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label>
          {t(L("Описание", "Description", "Сипаттама"))}
          <textarea
            value={draft.description}
            maxLength={1000}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
          />
        </label>
        <div className="row">
          <button
            disabled={!ready || blocked || !draft.title.trim()}
            onClick={() => void save()}
          >
            {t(L("Сохранить", "Save", "Сақтау"))}
          </button>
          <button
            onClick={() =>
              download(
                `${draft.title || "project"}.json`,
                JSON.stringify({ kind, ...draft }, null, 2),
              )
            }
          >
            JSON ↓
          </button>
          <label className="file-button">
            JSON ↑
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>
      {ready ? (
        <Suspense
          fallback={
            <p>
              {t(
                L(
                  "Загрузка редактора…",
                  "Loading editor…",
                  "Редактор жүктелуде…",
                ),
              )}
            </p>
          }
        >
          {kind === "design" ? (
            <Design value={JSON.parse(draft.content)} onChange={update} />
          ) : kind === "3d" ? (
            <Model value={JSON.parse(draft.content)} onChange={update} />
          ) : kind === "notes" ? (
            <textarea
              rows={20}
              value={draft.content}
              onChange={(e) =>
                setDraft((d) => ({ ...d, content: e.target.value }))
              }
            />
          ) : (
            <Media
              kind={kind}
              value={JSON.parse(draft.content)}
              onChange={update}
            />
          )}
        </Suspense>
      ) : (
        <p>
          {t(
            L(
              "Проект не загружен. Редактирование заблокировано.",
              "Project not loaded. Editing is blocked.",
              "Жоба жүктелмеді. Өңдеу бұғатталған.",
            ),
          )}
        </p>
      )}
    </section>
  );
}
