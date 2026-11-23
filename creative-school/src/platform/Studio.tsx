import { courseIndex } from "./course-index";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  ArrowLeft,
  Save,
  Settings2,
  Expand,
  Minimize,
  Download,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
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
import "./studio-shell.css";
import StudioAssistant from "./StudioAssistant";
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
  notes: "",
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
  const projectId = new URLSearchParams(useSearch()).get("project");
  const [route, setRoute] = useState(() => ({ id: projectId, revision: 0 }));
  const created = useRef<{ id: string; revision: number } | null>(null);

  if (route.id !== projectId) {
    // Keep the editor and its undo/chat history only for the first save's URL update.
    const firstSave =
      route.id === null &&
      created.current?.id === projectId &&
      created.current.revision === route.revision;
    setRoute({ id: projectId, revision: route.revision + (firstSave ? 0 : 1) });
  }

  return (
    <StudioDocument
      key={`${user.id}:${kind}:${route.revision}`}
      kind={kind}
      user={user}
      id={projectId}
      onCreate={(id) => {
        created.current = { id, revision: route.revision };
      }}
    />
  );
}

function StudioDocument({
  kind,
  user,
  id,
  onCreate,
}: {
  kind: ProjectKind;
  user: User;
  id: string | null;
  onCreate: (id: string) => void;
}) {
  const { t } = useLocale(),
    [, navigate] = useLocation();
  const key = `cs-draft:${user.id}:${kind}:${id ?? "new"}`;
  const [draft, setDraft] = useState<Draft>({
    title: t(L("Без названия", "Untitled", "Атаусыз")),
    description: "",
    content: kind === "notes" ? "" : JSON.stringify(defaults[kind]),
    version: 1,
    id,
  });
  const [ready, setReady] = useState(!id),
    [error, setError] = useState(""),
    [recovery, setRecovery] = useState<Draft | null>(null),
    [blocked, setBlocked] = useState(false),
    [saving, setSaving] = useState(false),
    [focus, setFocus] = useState(false),
    [settings, setSettings] = useState(false),
    [assistantOpen, setAssistantOpen] = useState(false),
    [assistantUsed, setAssistantUsed] = useState(false);
  const saved = useRef(""),
    latest = useRef(draft),
    lock = useRef(false),
    created = useRef<string | null>(null),
    creationKey = useRef(""),
    loadRequest = useRef<AbortController | null>(null),
    saveRequest = useRef<AbortController | null>(null);
  saved.current ||= JSON.stringify(draft);
  creationKey.current ||= crypto.randomUUID();
  const [assistantConversation, setAssistantConversation] = useState(
    id ?? creationKey.current,
  );
  const assistantLauncher = useRef<HTMLButtonElement>(null);
  latest.current = draft;
  const savedDraft = useMemo(
    () => JSON.parse(saved.current) as Draft,
    [saved.current],
  );
  const dirty =
    draft.content !== savedDraft.content ||
    draft.title !== savedDraft.title ||
    draft.description !== savedDraft.description ||
    draft.id !== savedDraft.id ||
    draft.version !== savedDraft.version;
  const documentCache = useRef<{ content: string; value: unknown } | null>(
    null,
  );
  const parsedDocument = useMemo(() => {
    if (kind === "notes") return null;
    if (documentCache.current?.content === draft.content)
      return documentCache.current.value;
    const value = JSON.parse(draft.content);
    documentCache.current = { content: draft.content, value };
    return value;
  }, [draft.content, kind]);
  const load = useCallback(async () => {
    loadRequest.current?.abort();
    const controller = new AbortController();
    loadRequest.current = controller;
    setReady(false);
    setError("");
    try {
      const p = await api<Project>(
        `/projects/${id}`,
        "GET",
        undefined,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (p.kind !== kind || !validDocument(kind, p.content))
        throw new ApiError("INVALID_DOCUMENT", 400);
      const d: Draft = {
        id: p.id,
        title: p.title,
        description: p.description ?? "",
        content:
          p.content ?? (kind === "notes" ? "" : JSON.stringify(defaults[kind])),
        version: p.version,
      };
      saved.current = JSON.stringify(d);
      setDraft(d);
      setBlocked(false);
      setReady(true);
    } catch (e) {
      if (!controller.signal.aborted) setError(t(message(e)));
    }
  }, [id, kind, t]);
  useEffect(
    () => () => {
      loadRequest.current?.abort();
      saveRequest.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (id && created.current === id) {
      created.current = null;
      return;
    }
    setAssistantConversation(id ?? creationKey.current);
    try {
      const r = draftSchema.safeParse(
        JSON.parse(localStorage.getItem(key) ?? "null"),
      );
      if (r.success && validDocument(kind, r.data.content)) setRecovery(r.data);
    } catch {}
    if (id) void load();
    else {
      saved.current = JSON.stringify(latest.current);
      setReady(true);
    }
  }, [key]);
  useEffect(
    () => () => {
      const current = latest.current;
      const value = JSON.stringify(current);
      if (value !== saved.current) {
        try {
          localStorage.setItem(
            `cs-draft:${user.id}:${kind}:${current.id ?? "new"}`,
            value,
          );
        } catch {
          // The regular backup handler reports storage failures while mounted.
        }
      }
    },
    [user.id, kind],
  );
  useEffect(() => {
    if (!ready || !dirty) return;
    const write = () => {
      try {
        localStorage.setItem(key, JSON.stringify(latest.current));
      } catch {
        setError(
          t(
            L(
              "Не удалось сохранить локальный черновик. Скачайте JSON-копию.",
              "Cannot save the local draft. Download a JSON backup.",
              "Жергілікті нұсқа сақталмады. JSON көшірмесін жүктеңіз.",
            ),
          ),
        );
      }
    };
    const timer = setTimeout(write, 180);
    const flush = () => {
      clearTimeout(timer);
      write();
    };
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
    };
  }, [draft, dirty, ready, key]);
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
              "Покинуть редактор? Убедитесь, что изменения сохранены, или скачайте копию.",
              "Leave the editor? Make sure changes are saved or download a backup.",
              "Редактордан шығу керек пе? Өзгерістерді сақтаңыз немесе көшірме жүктеңіз.",
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
    if (
      lock.current ||
      blocked ||
      !ready ||
      !latest.current.title.trim() ||
      (latest.current.id && JSON.stringify(latest.current) === saved.current)
    )
      return;
    lock.current = true;
    const controller = new AbortController();
    saveRequest.current = controller;
    setSaving(true);
    const snapshot = latest.current;
    try {
      const p = await api<Project>(
        snapshot.id ? `/projects/${snapshot.id}` : "/projects",
        snapshot.id ? "PATCH" : "POST",
        { ...snapshot, kind, clientId: creationKey.current },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const d = {
        ...snapshot,
        id: p.id,
        version: p.version,
        title: p.title,
        description: p.description ?? "",
        content: p.content ?? snapshot.content,
      };
      saved.current = JSON.stringify(d);
      setDraft((current) => ({
        ...current,
        id: p.id,
        version: p.version,
        title: current.title === snapshot.title ? d.title : current.title,
        description:
          current.description === snapshot.description
            ? d.description
            : current.description,
        content:
          current.content === snapshot.content ? d.content : current.content,
      }));
      setError("");
      try {
        localStorage.removeItem(key);
      } catch {}
      if (!snapshot.id) {
        created.current = p.id;
        onCreate(p.id);
        navigate(`/studio/${kind}?project=${p.id}`, { replace: true });
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(t(message(e)));
      if (e instanceof ApiError && e.status === 409) setBlocked(true);
    } finally {
      lock.current = false;
      if (!controller.signal.aborted) setSaving(false);
    }
  }
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!dirty || !ready || blocked || !draft.title.trim()) return;
    const timer = setTimeout(() => void saveRef.current(), 1800);
    return () => clearTimeout(timer);
  }, [draft, dirty, ready, blocked]);
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current();
      }
      if (e.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("cs-studio-focus", focus);
    return () => document.body.classList.remove("cs-studio-focus");
  }, [focus]);
  const update = useCallback((doc: unknown) => {
    const content = JSON.stringify(doc);
    documentCache.current = { content, value: doc };
    setDraft((d) => ({ ...d, content }));
  }, []);
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 220000) throw Error();
      const raw = JSON.parse(await file.text());
      const content =
        typeof raw.content === "string" ? raw.content : JSON.stringify(raw);
      if ((raw.kind && raw.kind !== kind) || !validDocument(kind, content))
        throw Error();
      if (
        dirty &&
        !confirm(
          t(
            L(
              "Заменить документ? Сначала скачайте копию, если хотите сохранить обе версии.",
              "Replace the document? Download a backup first if you need both versions.",
              "Құжатты ауыстыру керек пе? Екі нұсқа қажет болса, алдымен көшірме жүктеңіз.",
            ),
          ),
        )
      )
        return;
      setDraft((d) => ({ ...d, content }));
    } catch {
      setError(
        t(
          L(
            "Неверный формат или слишком большой файл.",
            "Invalid or oversized file.",
            "Файл пішімі қате немесе тым үлкен.",
          ),
        ),
      );
    }
  }
  const name = t(
    kind === "design"
      ? L("Дизайн-студия", "Design studio", "Дизайн студия")
      : kind === "3d"
        ? L("3D-студия", "3D studio", "3D студия")
        : kind === "image"
          ? L("Фото-студия", "Photo studio", "Фото студия")
          : kind === "video"
            ? L("Видеомонтаж", "Video editing", "Бейнемонтаж")
            : L("Заметки", "Notes", "Жазбалар"),
  );
  const status = saving
    ? t(L("Сохраняем…", "Saving…", "Сақталуда…"))
    : blocked
      ? t(L("Конфликт версий", "Version conflict", "Нұсқа қайшылығы"))
      : dirty
        ? t(L("Есть изменения", "Unsaved changes", "Сақталмаған өзгерістер"))
        : t(L("Сохранено", "Saved", "Сақталды"));
  const backup = () =>
    download(
      `${draft.title || "project"}.json`,
      JSON.stringify({ kind, ...draft }, null, 2),
    );
  return (
    <div className={`studio-shell ${focus ? "is-focused" : ""}`}>
      <div className="studio-projectbar">
        <Link
          className="studio-back"
          href="/projects"
          aria-label={t(L("К проектам", "Back to projects", "Жобаларға оралу"))}
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="studio-document">
          <span className="studio-kind">{name}</span>
          <label className="sr-only" htmlFor="studio-document-title">
            {t(L("Название", "Title", "Атауы"))}
          </label>
          <input
            id="studio-document-title"
            disabled={!ready}
            maxLength={120}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </div>
        <span className="studio-save-status" role="status">
          {blocked ? (
            <AlertCircle size={13} />
          ) : !dirty && !saving ? (
            <Check size={13} />
          ) : null}
          {status}
        </span>
        <div className="studio-project-actions">
          <button
            ref={assistantLauncher}
            className="studio-action"
            aria-expanded={assistantOpen}
            aria-controls="studio-assistant-panel"
            onClick={() => {
              setAssistantUsed(true);
              setAssistantOpen(!assistantOpen);
            }}
          >
            <Sparkles size={15} />
            {t(L("ИИ-помощник", "AI assistant", "ЖИ көмекшісі"))}
          </button>
          <button
            className="studio-action studio-save"
            disabled={!ready || blocked || saving || !draft.title.trim()}
            onClick={() => void save()}
            title="Ctrl / ⌘ S"
          >
            <Save size={14} />
            {t(L("Сохранить", "Save", "Сақтау"))}
          </button>
          <button
            className="studio-action"
            aria-expanded={settings}
            aria-controls="studio-settings"
            onClick={() => setSettings(!settings)}
          >
            <Settings2 size={15} />
            {t(L("Проект", "Project", "Жоба"))}
          </button>
          <button
            className="studio-action"
            aria-pressed={focus}
            aria-label={t(
              focus
                ? L("Обычный режим", "Normal view", "Қалыпты көрініс")
                : L("Режим фокуса", "Focus mode", "Фокус режимі"),
            )}
            onClick={() => setFocus(!focus)}
            title={t(L("Выход: Esc", "Exit: Esc", "Шығу: Esc"))}
          >
            {focus ? <Minimize size={15} /> : <Expand size={15} />}
            <span>
              {t(
                focus
                  ? L("Обычный режим", "Normal view", "Қалыпты көрініс")
                  : L("Режим фокуса", "Focus mode", "Фокус режимі"),
              )}
            </span>
          </button>
        </div>
      </div>
      {settings && (
        <div className="studio-settings" id="studio-settings">
          <label>
            {t(L("Описание", "Description", "Сипаттама"))}
            <textarea
              rows={2}
              maxLength={1000}
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </label>
          <div>
            <p className="studio-settings-note">
              {t(
                L(
                  "Автосохранение · копия на устройстве · Ctrl/⌘ S",
                  "Autosave · device backup · Ctrl/⌘ S",
                  "Автосақтау · құрылғыдағы көшірме · Ctrl/⌘ S",
                ),
              )}
              {draft.id ? ` · v${draft.version}` : ""}
            </p>
            <div className="studio-file-actions">
              <button className="studio-action" onClick={backup}>
                <Download size={14} />
                {t(L("Исходник JSON", "JSON source", "JSON түпнұсқа"))}
              </button>
              <label className="studio-action studio-file-input">
                <Upload size={14} />
                {t(L("Открыть JSON", "Open JSON", "JSON ашу"))}
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => void importFile(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>
      )}
      {recovery && (
        <div className="studio-notice">
          {t(
            L(
              "Найден локальный черновик.",
              "A local draft was found.",
              "Жергілікті нұсқа табылды.",
            ),
          )}
          <button
            className="studio-action"
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
            className="studio-action"
            onClick={() => {
              try {
                localStorage.removeItem(key);
              } catch {}
              setRecovery(null);
            }}
          >
            {t(L("Отбросить", "Discard", "Жою"))}
          </button>
        </div>
      )}
      {error && (
        <div className="studio-notice is-error" role="alert">
          {error}
          {id && (
            <button
              className="studio-action"
              onClick={() => {
                if (
                  !dirty ||
                  confirm(
                    t(
                      L(
                        "Загрузить серверную версию? Сначала скачайте свою копию.",
                        "Reload the server version? Download your own copy first.",
                        "Сервер нұсқасын жүктеу керек пе? Алдымен көшірмеңізді жүктеңіз.",
                      ),
                    ),
                  )
                )
                  void load();
              }}
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
          <button className="studio-action" onClick={backup}>
            {t(L("Скачать копию", "Download backup", "Көшірмені жүктеу"))}
          </button>
        </div>
      )}
      {ready && draft.description && (
        <details className="cs-studio-brief">
          <summary>
            {t(
              L(
                "Замысел работы",
                "The idea behind this work",
                "Жұмыстың идеясы",
              ),
            )}
            <span>
              {t(
                L(
                  "Задание и авторские заметки",
                  "Brief and creator notes",
                  "Тапсырма және автор жазбалары",
                ),
              )}
            </span>
          </summary>
          <p>{draft.description}</p>
          {courseIndex
            .flatMap((c) => c.lessons.map((l) => ({ course: c.id, ...l })))
            .filter(
              (l) =>
                l.id ===
                new URLSearchParams(window.location.search).get("lesson"),
            )
            .map((l) => (
              <a key={l.id} href={`/learn/${l.course}/${l.id}`}>
                {t(
                  L(
                    "Вернуться к уроку",
                    "Return to the lesson",
                    "Сабаққа оралу",
                  ),
                )}{" "}
                → {t(l.title)}
              </a>
            ))}
        </details>
      )}
      <div
        className={`studio-work-area ${assistantOpen ? "has-assistant" : ""}`}
      >
        <section className="studio-editor-frame" aria-label={name}>
          {ready ? (
            <Suspense
              fallback={
                <p className="studio-loading">
                  {t(
                    L(
                      "Загрузка инструментов…",
                      "Loading tools…",
                      "Құралдар жүктелуде…",
                    ),
                  )}
                </p>
              }
            >
              {kind === "design" ? (
                <Design value={parsedDocument} onChange={update} />
              ) : kind === "3d" ? (
                <Model value={parsedDocument} onChange={update} />
              ) : kind === "notes" ? (
                <textarea
                  className="studio-notes"
                  value={draft.content}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, content: e.target.value }))
                  }
                />
              ) : (
                <Media
                  kind={kind}
                  value={parsedDocument}
                  onChange={update}
                  cacheScope={user.id}
                />
              )}
            </Suspense>
          ) : (
            <p className="studio-loading">
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
        {assistantUsed && (
          <StudioAssistant
            key={`${user.id}:${kind}:${assistantConversation}`}
            kind={kind}
            title={draft.title}
            content={draft.content}
            ready={ready}
            open={assistantOpen}
            onClose={() => {
              setAssistantOpen(false);
              assistantLauncher.current?.focus();
            }}
          />
        )}
      </div>
    </div>
  );
}
