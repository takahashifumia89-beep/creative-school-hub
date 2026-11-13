import { PageIntro } from "@/features/shared/PageIntro";
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
  const createKey = useRef(crypto.randomUUID());
  const ownCreated = useRef<string | null>(null);
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
    if (id && ownCreated.current === id) {
      ownCreated.current = null;
      return;
    }
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
        { ...snapshot, kind, clientId: createKey.current },
      );
      const d = {
        ...snapshot,
        title: p.title,
        description: p.description ?? "",
        content: p.content ?? snapshot.content,
        id: p.id,
        version: p.version,
      };
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
        ownCreated.current = p.id;
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
  const title = t(
    kind === "3d"
      ? L("3D-студия.", "3D studio.", "3D студия.")
      : kind === "design"
        ? L("Дизайн-студия.", "Design studio.", "Дизайн студия.")
        : kind === "image"
          ? L("Фото-студия.", "Photo studio.", "Фото студия.")
          : kind === "video"
            ? L("Видеомонтаж.", "Video editing.", "Бейнемонтаж.")
            : L("Заметки.", "Notes.", "Жазбалар."),
  );
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow={t(
          L("Творческая студия", "Creative studio", "Шығармашылық студия"),
        )}
        title={title}
        description={t(
          L(
            "Создавайте, сохраняйте в проекты или скачивайте исходник.",
            "Create, save to your projects or download the source.",
            "Жасаңыз, жобаға сақтаңыз немесе түпнұсқаны жүктеңіз.",
          ),
        )}
      />
      {recovery && (
        <div className="mb-5 rounded-xl border border-primary/40 bg-primary/5 p-4 text-xs">
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
            className="ml-3 rounded-full border border-border px-4 py-2"
          >
            {t(L("Восстановить", "Restore", "Қалпына келтіру"))}
          </button>
          <button
            onClick={() => {
              try {
                localStorage.removeItem(storageKey);
              } catch {}
              setRecovery(null);
            }}
            className="ml-2 px-3 py-2"
          >
            {t(L("Отбросить", "Discard", "Жою"))}
          </button>
        </div>
      )}
      {error && (
        <div
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive"
          role="alert"
        >
          {error}
          {id && (
            <button
              onClick={() => void load()}
              className="ml-3 rounded-full border border-border px-4 py-2"
            >
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
      <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          {ready ? (
            <Suspense fallback={<p className="p-8">…</p>}>
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
                  className="w-full rounded-lg border border-border bg-background p-3"
                />
              ) : (
                <div className="platform media-tools">
                  <Media
                    kind={kind}
                    value={JSON.parse(draft.content)}
                    onChange={update}
                  />
                </div>
              )}
            </Suspense>
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
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
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <div className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">
            {t(
              id
                ? L("Редактирование", "Editing", "Өңдеу")
                : L("Новый проект", "New project", "Жаңа жоба"),
            )}
          </div>
          <label className="mt-5 block text-xs font-medium">
            {t(L("Название", "Title", "Атауы"))}
            <input
              value={draft.title}
              maxLength={120}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="mt-4 block text-xs font-medium">
            {t(L("Описание", "Description", "Сипаттама"))}
            <textarea
              rows={5}
              value={draft.description}
              maxLength={1000}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            disabled={!ready || blocked || !draft.title.trim()}
            onClick={() => void save()}
            className="mt-5 w-full rounded-lg bg-primary py-3 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {t(L("Сохранить", "Save", "Сақтау"))}
          </button>
          <p className="mt-3 text-xs text-muted-foreground" role="status">
            {(lock.current ? state : "") ||
              (!dirty && ready
                ? t(L("Сохранено", "Saved", "Сақталды"))
                : t(
                    L(
                      "Есть изменения",
                      "Unsaved changes",
                      "Сақталмаған өзгерістер",
                    ),
                  ))}
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {t(
              L(
                "Автосохранение и локальное восстановление включены.",
                "Autosave and local recovery are enabled.",
                "Автосақтау және жергілікті қалпына келтіру қосылған.",
              ),
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() =>
                download(
                  `${draft.title || "project"}.json`,
                  JSON.stringify({ kind, ...draft }, null, 2),
                )
              }
              className="rounded-lg border border-border px-3 py-2 text-xs"
            >
              JSON ↓
            </button>
            <label className="relative cursor-pointer overflow-hidden rounded-lg border border-border px-3 py-2 text-xs">
              JSON ↑
              <input
                type="file"
                accept="application/json,.json"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => void importFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}
