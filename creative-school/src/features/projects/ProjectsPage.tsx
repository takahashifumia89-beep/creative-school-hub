import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  Archive,
  ArrowUpRight,
  Copy,
  EyeOff,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageIntro } from "@/features/shared/PageIntro";
import { ProjectStory } from "@/platform/ProjectStory";
import { Dialog } from "@/platform/Dialog";
import { EditorLauncher } from "@/platform/EditorLauncher";
import { PageLoading } from "@/platform/PageLoading";
import { ProjectTile } from "@/platform/ProjectTile";
import { api, message } from "@/platform/client";
import type { Project } from "@/lib/api";
import { L, useLocale } from "@/platform/locale";
import { useWorkspace } from "@/platform/use-workspace";
import {
  copyTitle,
  kindLabels,
  projectHref,
  sortProjects,
  type ProjectMeta,
} from "@/platform/workspace";
export function ProjectsPage({ onToast }: { onToast: (text: string) => void }) {
  const { t, lang } = useLocale(),
    { data, loading, error, refresh, updateProjects } = useWorkspace(),
    search = useSearch(),
    [, navigate] = useLocation(),
    params = new URLSearchParams(search);
  const query = (params.get("q") ?? "").slice(0, 120),
    kind = Object.keys(kindLabels).includes(params.get("kind") ?? "")
      ? params.get("kind")!
      : "all",
    status = ["draft", "published", "archived"].includes(
      params.get("status") ?? "",
    )
      ? params.get("status")!
      : "all",
    sort = ["title", "oldest"].includes(params.get("sort") ?? "")
      ? params.get("sort")!
      : "recent";
  const [creating, setCreating] = useState(false),
    [editing, setEditing] = useState<ProjectMeta | null>(null),
    [story, setStory] = useState<ProjectMeta | null>(null),
    [deleting, setDeleting] = useState<ProjectMeta | null>(null),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [busy, setBusy] = useState<string | null>(null),
    [actionError, setActionError] = useState(""),
    [visible, setVisible] = useState(24);
  const controller = useRef(new AbortController()),
    copyIds = useRef(new Map<string, string>());
  useEffect(() => () => controller.current.abort(), []);
  useEffect(() => setVisible(24), [query, kind, status, sort]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      document
        .querySelectorAll<HTMLDetailsElement>(".cs-project-menu[open]")
        .forEach((menu) => {
          if (!menu.contains(e.target as Node)) menu.open = false;
        });
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const projects = sortProjects(
    data?.projects ?? [],
    query,
    kind,
    status,
    sort,
  );
  function filter(name: string, value: string) {
    const next = new URLSearchParams(search);
    if (!value || value === "all" || value === "recent") next.delete(name);
    else next.set(name, value);
    navigate(`/projects${next.size ? `?${next}` : ""}`, { replace: true });
  }
  function merge(project: Project) {
    if (data?.userId)
      updateProjects(data.userId, (items) => {
        const existing = items.some((p) => p.id === project.id);
        const { content: _, ...meta } = project;
        return existing
          ? items.map((p) => (p.id === project.id ? meta : p))
          : [meta, ...items];
      });
    window.dispatchEvent(new Event("creative-school-stats-change"));
  }
  async function run(p: ProjectMeta, work: () => Promise<void>) {
    if (busy) return;
    setBusy(p.id);
    setActionError("");
    try {
      await work();
    } catch (e) {
      if (!controller.current.signal.aborted) setActionError(t(message(e)));
    } finally {
      if (!controller.current.signal.aborted) setBusy(null);
    }
  }
  async function patch(
    p: ProjectMeta,
    values: Record<string, unknown>,
    notice: string,
  ) {
    await run(p, async () => {
      const next = await api<Project>(
        `/projects/${p.id}`,
        "PATCH",
        { ...values, version: p.version },
        controller.current.signal,
      );
      if (controller.current.signal.aborted) return;
      merge(next);
      setEditing(null);
      setStory(null);
      onToast(notice);
    });
  }
  async function duplicate(p: ProjectMeta) {
    await run(p, async () => {
      const source = await api<Project>(
        `/projects/${p.id}`,
        "GET",
        undefined,
        controller.current.signal,
      );
      let clientId = copyIds.current.get(p.id);
      if (!clientId) {
        clientId = crypto.randomUUID();
        copyIds.current.set(p.id, clientId);
      }
      const copy = await api<Project>(
        "/projects",
        "POST",
        {
          clientId,
          kind: source.kind,
          title: copyTitle(source.title, lang),
          description: source.description,
          content: source.content,
        },
        controller.current.signal,
      );
      if (controller.current.signal.aborted) return;
      copyIds.current.delete(p.id);
      merge(copy);
      onToast(
        t(
          L(
            "Копия создана как личный черновик.",
            "Copy created as a private draft.",
            "Көшірме жеке нобай ретінде жасалды.",
          ),
        ),
      );
    });
  }
  async function publish(p: ProjectMeta) {
    if (
      !confirm(
        t(
          L(
            "Опубликовать проект и его редактируемый исходник? Они станут доступны по публичной ссылке. Права на работу остаются у вас.",
            "Publish this project and its editable source? They will be available through a public link. You retain ownership.",
            "Жоба мен өңделетін түпнұсқаны жариялау керек пе? Олар ашық сілтеме арқылы қолжетімді болады. Авторлық құқық сізде қалады.",
          ),
        ),
      )
    )
      return;
    await patch(
      p,
      { status: "published", visibility: "public" },
      t(
        L(
          "Проект опубликован в портфолио.",
          "Project published in your portfolio.",
          "Жоба портфолиода жарияланды.",
        ),
      ),
    );
  }
  async function remove() {
    if (!deleting) return;
    const p = deleting,
      uid = data?.userId;
    await run(p, async () => {
      await api(
        `/projects/${p.id}`,
        "DELETE",
        { version: p.version },
        controller.current.signal,
      );
      if (controller.current.signal.aborted) return;
      if (uid)
        updateProjects(uid, (items) => items.filter((x) => x.id !== p.id));
      setDeleting(null);
      window.dispatchEvent(new Event("creative-school-stats-change"));
      onToast(t(L("Проект удалён.", "Project deleted.", "Жоба жойылды.")));
    });
  }
  const menuAction = (e: React.MouseEvent, action: () => void) => {
    const details = e.currentTarget.closest("details");
    if (details) details.open = false;
    action();
  };
  return (
    <div className="cs-page">
      <PageIntro
        eyebrow={t(L("Ваши работы", "Your work", "Сіздің жұмыстарыңыз"))}
        title={t(L("Проекты.", "Projects.", "Жобалар."))}
        description={t(
          L(
            "От первой идеи до готовой работы — всё под рукой.",
            "From first idea to finished work, all within reach.",
            "Алғашқы идеядан дайын жұмысқа дейін — бәрі қол астында.",
          ),
        )}
        action={
          <button
            className="cs-action cs-action-primary"
            onClick={() => setCreating(true)}
          >
            <Plus size={15} />
            {t(L("Новый проект", "New project", "Жаңа жоба"))}
          </button>
        }
      />
      <div className="cs-project-filters">
        <input
          type="search"
          aria-label={t(
            L("Поиск проектов", "Search projects", "Жобаларды іздеу"),
          )}
          placeholder={t(
            L(
              "Найти по названию или описанию…",
              "Find by title or description…",
              "Атауы не сипаттамасы бойынша іздеу…",
            ),
          )}
          maxLength={120}
          value={query}
          onChange={(e) => filter("q", e.target.value)}
        />
        <select
          aria-label={t(L("Тип проекта", "Project type", "Жоба түрі"))}
          value={kind}
          onChange={(e) => filter("kind", e.target.value)}
        >
          <option value="all">
            {t(L("Все студии", "All studios", "Барлық студиялар"))}
          </option>
          {Object.entries(kindLabels).map(([k, l]) => (
            <option key={k} value={k}>
              {t(l)}
            </option>
          ))}
        </select>
        <select
          aria-label={t(
            L("Сортировка проектов", "Sort projects", "Жобаларды сұрыптау"),
          )}
          value={sort}
          onChange={(e) => filter("sort", e.target.value)}
        >
          <option value="recent">
            {t(
              L("Недавно изменённые", "Recently edited", "Жақында өзгертілген"),
            )}
          </option>
          <option value="oldest">
            {t(L("Сначала старые", "Oldest first", "Алдымен ескілері"))}
          </option>
          <option value="title">
            {t(L("По названию", "By name", "Атауы бойынша"))}
          </option>
        </select>
      </div>
      <div
        className="cs-project-tabs"
        role="group"
        aria-label={t(L("Статус проектов", "Project status", "Жоба күйі"))}
      >
        {(["all", "draft", "published", "archived"] as const).map((s, i) => (
          <button
            key={s}
            aria-pressed={status === s}
            onClick={() => filter("status", s)}
          >
            {t(
              [
                L("Все работы", "All work", "Барлық жұмыстар"),
                L("Черновики", "Drafts", "Нобайлар"),
                L("Опубликованные", "Published", "Жарияланған"),
                L("Архив", "Archive", "Мұрағат"),
              ][i],
            )}
          </button>
        ))}
      </div>
      {(error || actionError) && (
        <div role="alert" className="cs-inline-error">
          {error || actionError}
          <button
            onClick={() => {
              setActionError("");
              void refresh();
            }}
          >
            {t(L("Обновить список", "Refresh list", "Тізімді жаңарту"))}
          </button>
        </div>
      )}
      {loading && !data ? (
        <PageLoading />
      ) : error && !data ? null : (
        <>
          <p className="cs-result-count" role="status">
            {t(
              L(
                `Найдено проектов: ${projects.length}`,
                `Projects found: ${projects.length}`,
                `Табылған жобалар: ${projects.length}`,
              ),
            )}
          </p>
          {projects.length ? (
            <div className="cs-project-grid" aria-busy={!!busy}>
              {projects.slice(0, visible).map((p) => (
                <ProjectTile
                  key={p.id}
                  project={p}
                  actions={
                    <>
                      <Link href={projectHref(p)}>
                        {t(L("Открыть", "Open", "Ашу"))}
                        <ArrowUpRight size={13} />
                      </Link>
                      <details
                        className="cs-project-menu"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            e.currentTarget.open = false;
                            e.currentTarget.querySelector("summary")?.focus();
                          }
                        }}
                      >
                        <summary
                          aria-label={`${t(L("Действия с проектом", "Project actions", "Жоба әрекеттері"))}: ${p.title}`}
                        >
                          <MoreHorizontal size={18} />
                        </summary>
                        <div>
                          {p.status !== "archived" && (
                            <>
                              <button
                                disabled={!!busy}
                                onClick={(e) =>
                                  menuAction(e, () => void duplicate(p))
                                }
                              >
                                <Copy size={14} />
                                {t(
                                  L(
                                    "Создать копию",
                                    "Make a copy",
                                    "Көшірме жасау",
                                  ),
                                )}
                              </button>
                              <button
                                disabled={!!busy}
                                onClick={(e) =>
                                  menuAction(e, () => {
                                    setActionError("");
                                    setTitle(p.title);
                                    setDescription(p.description ?? "");
                                    setEditing(p);
                                  })
                                }
                              >
                                <Pencil size={14} />
                                {t(
                                  L(
                                    "Название и описание",
                                    "Title and description",
                                    "Атауы мен сипаттамасы",
                                  ),
                                )}
                              </button>
                              <button
                                disabled={!!busy}
                                onClick={(e) =>
                                  menuAction(e, () => {
                                    setActionError("");
                                    setStory(p);
                                  })
                                }
                              >
                                <FileText size={14} />
                                {t(
                                  L(
                                    "История работы",
                                    "Story behind the work",
                                    "Жұмыс тарихы",
                                  ),
                                )}
                              </button>
                              {p.status === "published" ? (
                                <button
                                  disabled={!!busy}
                                  onClick={(e) =>
                                    menuAction(
                                      e,
                                      () =>
                                        void patch(
                                          p,
                                          {
                                            status: "draft",
                                            visibility: "private",
                                          },
                                          t(
                                            L(
                                              "Проект снова черновик.",
                                              "Project is a draft again.",
                                              "Жоба қайтадан нобай болды.",
                                            ),
                                          ),
                                        ),
                                    )
                                  }
                                >
                                  <EyeOff size={14} />
                                  {t(
                                    L(
                                      "Снять с публикации",
                                      "Unpublish",
                                      "Жариялаудан алу",
                                    ),
                                  )}
                                </button>
                              ) : (
                                <button
                                  disabled={!!busy}
                                  onClick={(e) =>
                                    menuAction(e, () => void publish(p))
                                  }
                                >
                                  <Upload size={14} />
                                  {t(
                                    L(
                                      "Опубликовать проект",
                                      "Publish project",
                                      "Жобаны жариялау",
                                    ),
                                  )}
                                </button>
                              )}
                              <button
                                disabled={!!busy}
                                onClick={(e) =>
                                  menuAction(
                                    e,
                                    () =>
                                      void patch(
                                        p,
                                        {
                                          status: "archived",
                                          visibility: "private",
                                        },
                                        t(
                                          L(
                                            "Проект перемещён в архив.",
                                            "Project archived.",
                                            "Жоба мұрағатқа көшірілді.",
                                          ),
                                        ),
                                      ),
                                  )
                                }
                              >
                                <Archive size={14} />
                                {t(L("В архив", "Archive", "Мұрағатқа"))}
                              </button>
                            </>
                          )}
                          {p.status === "archived" && (
                            <button
                              disabled={!!busy}
                              onClick={(e) =>
                                menuAction(
                                  e,
                                  () =>
                                    void patch(
                                      p,
                                      {
                                        status: "draft",
                                        visibility: "private",
                                      },
                                      t(
                                        L(
                                          "Проект восстановлен как личный черновик.",
                                          "Project restored as a private draft.",
                                          "Жоба жеке нобай ретінде қалпына келтірілді.",
                                        ),
                                      ),
                                    ),
                                )
                              }
                            >
                              <RotateCcw size={14} />
                              {t(
                                L("Восстановить", "Restore", "Қалпына келтіру"),
                              )}
                            </button>
                          )}
                          <button
                            disabled={!!busy}
                            className="cs-danger"
                            onClick={(e) =>
                              menuAction(e, () => {
                                setActionError("");
                                setDeleting(p);
                              })
                            }
                          >
                            <Trash2 size={14} />
                            {t(
                              L(
                                "Удалить проект",
                                "Delete project",
                                "Жобаны жою",
                              ),
                            )}
                          </button>
                        </div>
                      </details>
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="cs-home-empty">
              <FileText size={25} />
              <h2>
                {t(
                  L(
                    "Пока ничего не найдено",
                    "Nothing here yet",
                    "Әзірге ештеңе табылмады",
                  ),
                )}
              </h2>
              <p>
                {t(
                  query || kind !== "all"
                    ? L(
                        "Измените условия поиска или выберите другую студию.",
                        "Adjust the search or choose another studio.",
                        "Іздеу шарттарын өзгертіңіз не басқа студияны таңдаңыз.",
                      )
                    : status === "archived"
                      ? L(
                          "Здесь будут работы, которые вы отложите на потом.",
                          "Work you set aside will appear here.",
                          "Кейінге қалдырған жұмыстарыңыз осында пайда болады.",
                        )
                      : L(
                          "Создайте первую работу в одной из студий.",
                          "Create your first piece in a studio.",
                          "Студиялардың бірінде алғашқы жұмысыңызды жасаңыз.",
                        ),
                )}
              </p>
              <button className="cs-action" onClick={() => setCreating(true)}>
                {t(L("Выбрать студию", "Choose a studio", "Студия таңдау"))}
              </button>
            </div>
          )}
          {projects.length > visible && (
            <button
              className="cs-action cs-load-more"
              onClick={() => setVisible((n) => n + 24)}
            >
              {t(L("Показать ещё", "Show more", "Тағы көрсету"))} ·{" "}
              {projects.length - visible}
            </button>
          )}
        </>
      )}
      {story && (
        <ProjectStory
          description={story.description ?? ""}
          busy={!!busy}
          error={actionError}
          onClose={() => setStory(null)}
          onSave={(description) =>
            void patch(
              story,
              { description },
              t(L("История сохранена.", "Story saved.", "Тарих сақталды.")),
            )
          }
        />
      )}
      {creating && (
        <Dialog
          label={t(L("Новый проект", "New project", "Жаңа жоба"))}
          onClose={() => setCreating(false)}
        >
          <div className="cs-dialog-heading">
            <h2>
              {t(
                L(
                  "Что хотите создать?",
                  "What would you like to create?",
                  "Не жасағыңыз келеді?",
                ),
              )}
            </h2>
            <button
              onClick={() => setCreating(false)}
              aria-label={t(L("Закрыть", "Close", "Жабу"))}
            >
              <X size={20} />
            </button>
          </div>
          <EditorLauncher />
          <Link className="cs-note-link" href="/studio/notes">
            <FileText size={17} />
            {t(L("Начать с заметки", "Start with a note", "Жазбадан бастау"))}
          </Link>
        </Dialog>
      )}
      {editing && (
        <Dialog
          label={t(L("Изменить проект", "Edit project", "Жобаны өзгерту"))}
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form
            className="cs-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              void patch(
                editing,
                { title: title.trim(), description: description.trim() },
                t(
                  L(
                    "Изменения сохранены.",
                    "Changes saved.",
                    "Өзгерістер сақталды.",
                  ),
                ),
              );
            }}
          >
            <h2>
              {t(
                L(
                  "Название и описание",
                  "Title and description",
                  "Атауы мен сипаттамасы",
                ),
              )}
            </h2>
            <label>
              {t(L("Название проекта", "Project title", "Жоба атауы"))}
              <input
                autoFocus
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              {t(L("Краткое описание", "Description", "Қысқаша сипаттама"))}
              <textarea
                maxLength={1000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            {actionError && (
              <p role="alert" className="cs-inline-error">
                {actionError}
              </p>
            )}
            <div className="cs-dialog-actions">
              <button
                type="button"
                className="cs-action"
                disabled={!!busy}
                onClick={() => setEditing(null)}
              >
                {t(L("Отмена", "Cancel", "Бас тарту"))}
              </button>
              <button
                className="cs-action cs-action-primary"
                disabled={!!busy || !title.trim()}
              >
                {t(L("Сохранить", "Save", "Сақтау"))}
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {deleting && (
        <Dialog
          label={t(
            L("Удалить проект?", "Delete project?", "Жобаны жою керек пе?"),
          )}
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <div className="cs-edit-form">
            <h2>
              {t(
                L("Удалить проект?", "Delete project?", "Жобаны жою керек пе?"),
              )}
            </h2>
            <p>{deleting.title}</p>
            <p>
              {t(
                L(
                  "Удаление нельзя отменить. Если хотите вернуться к работе позже, используйте архив.",
                  "Deletion cannot be undone. Use Archive if you may return to this work.",
                  "Жоюды болдырмау мүмкін емес. Жұмысқа кейін оралғыңыз келсе, мұрағатты пайдаланыңыз.",
                ),
              )}
            </p>
            {actionError && (
              <p role="alert" className="cs-inline-error">
                {actionError}
              </p>
            )}
            <div className="cs-dialog-actions">
              <button
                className="cs-action"
                disabled={!!busy}
                onClick={() => setDeleting(null)}
              >
                {t(L("Отмена", "Cancel", "Бас тарту"))}
              </button>
              <button
                className="cs-action cs-danger"
                disabled={!!busy}
                onClick={() => void remove()}
              >
                {t(L("Удалить навсегда", "Delete permanently", "Біржола жою"))}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
