import { useCopy } from "@/platform/copy";
import { useEffect, useState } from "react";
import {
  EyeOff,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { PageIntro } from "@/features/shared/PageIntro";
import { getCurrentUser, type Project } from "@/lib/api";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "@/lib/api";
const studioHref = (p: Project) => `/studio/${p.kind}?project=${p.id}`;
export function ProjectsPage({ onToast }: { onToast: (text: string) => void }) {
  const tx = useCopy();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [more, setMore] = useState(false);
  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) return;
      const result = await fetchProjects(user.id);
      setProjects(result.data);
      setMore(result.data.length === 24);
      if (result.error) setError(result.error);
    });
  }, []);
  async function save() {
    if (!title.trim()) return;
    setPending(true);
    const { user } = await getCurrentUser();
    const result = user
      ? await createProject(user.id, {
          title: title.trim(),
          description: description.trim() || null,
          category: tx("Творческая практика"),
          content: "",
        })
      : { data: null, error: tx("Сессия завершилась. Войдите ещё раз.") };
    setPending(false);
    if (result.error || !result.data) {
      setError(result.error ?? tx("Не удалось создать проект."));
      return;
    }
    setProjects((current) => [result.data as Project, ...current]);
    setTitle("");
    setDescription("");
    setShowForm(false);
    onToast(tx("Проект сохранён как черновик."));
  }
  async function publish(project: Project) {
    if (
      !window.confirm(
        tx(
          "Опубликовать проект и его редактируемый исходник? Они станут доступны по публичной ссылке. Права на работу остаются у вас.",
        ),
      )
    )
      return;
    const result = await updateProject(project.id, {
      status: "published",
      visibility: "public",
      version: project.version,
    });
    if (result.error || !result.data) {
      onToast(result.error ?? tx("Не удалось опубликовать проект."));
      return;
    }
    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? (result.data as Project) : item,
      ),
    );
    onToast(tx("Проект опубликован в портфолио."));
  }
  async function unpublish(project: Project) {
    const result = await updateProject(project.id, {
      status: "draft",
      visibility: "private",
      version: project.version,
    });
    if (result.error || !result.data) {
      onToast(result.error ?? tx("Не удалось снять с публикации."));
      return;
    }
    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? (result.data as Project) : item,
      ),
    );
    onToast(tx("Проект снова черновик."));
  }
  async function remove(project: Project) {
    if (
      !window.confirm(
        tx("Удалить проект «{0}»? Это нельзя отменить.", [project.title]),
      )
    )
      return;
    const result = await deleteProject(project.id, project.version);
    if (result.error) {
      onToast(result.error);
      return;
    }
    setProjects((current) => current.filter((item) => item.id !== project.id));
    onToast(tx("Проект удалён."));
  }
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow={tx("Ваши работы")}
        title={tx("Проекты.")}
        description={tx(
          "Храните здесь эксперименты и черновики, а готовые работы публикуйте в портфолио.",
        )}
        action={
          <button
            onClick={() => setShowForm((value) => !value)}
            className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="mr-2 inline" size={14} />
            {tx("Новый проект")}
          </button>
        }
      />
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/50 bg-primary/5 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">
                {tx("Новый проект")}
              </div>
              <h2 className="mt-1 font-display text-2xl tracking-[-.05em]">
                {tx("Дайте идее пространство.")}
              </h2>
            </div>
            <button
              onClick={() => setShowForm(false)}
              aria-label={tx("Закрыть форму")}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <X size={17} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium">
              {tx("Название проекта")}
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={tx("Название вашей идеи")}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="text-xs font-medium">
              {tx("Краткое описание")}
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={tx("Во что это может вырасти?")}
                rows={2}
                className="mt-2 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              disabled={pending || !title.trim()}
              onClick={() => void save()}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              {pending && (
                <LoaderCircle className="mr-2 inline animate-spin" size={14} />
              )}
              {tx("Сохранить проект")}
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          {error}
        </div>
      )}
      {projects.length === 0 && !error ? (
        <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div>
            <FolderKanban className="mx-auto text-primary" size={22} />
            <h2 className="mt-5 font-display text-2xl tracking-[-.05em]">
              {tx("Создайте свой первый проект.")}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {tx(
                "Сохраните идею как черновик, а когда она будет готова — опубликуйте в портфолио. Данные хранятся в вашем аккаунте.",
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div
                className={`relative h-52 overflow-hidden ${index % 3 === 0 ? "bg-secondary/60" : index % 3 === 1 ? "bg-accent/55" : "bg-primary/55"}`}
              >
                <div className="absolute inset-5 border border-foreground/20" />
                <span className="absolute left-5 top-5 rounded-full bg-background/70 px-2 py-1 font-mono-ui text-[9px] uppercase">
                  {project.visibility === "public"
                    ? tx("Открытый")
                    : project.visibility === "private"
                      ? tx("Личный")
                      : tx("По ссылке")}
                </span>
                <span className="absolute bottom-5 left-5 font-mono-ui text-[10px] uppercase tracking-widest opacity-70">
                  {tx("Проект / 0")}
                  {index + 1}
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl leading-[.95] tracking-[-.05em]">
                  {project.title}
                </h2>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.description || tx("Описания пока нет.")}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                    {project.status === "published"
                      ? tx("Опубликован")
                      : tx("Черновик")}
                  </span>
                  <div className="flex items-center">
                    {studioHref(project) && (
                      <Link
                        href={studioHref(project) as string}
                        aria-label={tx("Открыть в студии")}
                        className="rounded-md p-2 hover:bg-muted"
                      >
                        <Pencil size={14} />
                      </Link>
                    )}
                    {project.status === "published" ? (
                      <button
                        onClick={() => void unpublish(project)}
                        aria-label={tx("Снять с публикации")}
                        className="rounded-md p-2 hover:bg-muted"
                      >
                        <EyeOff size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => void publish(project)}
                        aria-label={tx("Опубликовать проект")}
                        className="rounded-md p-2 text-primary hover:bg-primary/15"
                      >
                        <Upload size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => void remove(project)}
                      aria-label={tx("Удалить проект")}
                      className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
