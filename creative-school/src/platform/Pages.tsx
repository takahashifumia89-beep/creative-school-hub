import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { api, download, message, type Project, type User } from "./client";
import { L, useLocale } from "./locale";
import { designSchema, sceneSchema } from "./schema";
import { DesignArtwork } from "./DesignArtwork";
import { ProjectThumbnail } from "./ProjectThumbnail";
import { PageLoading } from "./PageLoading";
import { kindLabels } from "./workspace";
import { readStory, storyLabels } from "./project-story";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Link2,
  Palette,
  Box,
  Camera,
  Clapperboard,
  FileText,
} from "lucide-react";
type GalleryProject = Omit<Project, "content">;
type Gallery = {
  profile: { display_name: string; bio: string | null };
  projects: GalleryProject[];
  total: number;
};
const galleryIcons = {
  design: Palette,
  "3d": Box,
  image: Camera,
  video: Clapperboard,
  notes: FileText,
};

export function Preview({ project: p }: { project: Project }) {
  if (p.kind === "design" && p.content) {
    try {
      const doc = designSchema.parse(JSON.parse(p.content));
      return (
        <DesignArtwork doc={doc} label={p.title} className="project-preview" />
      );
    } catch {
      // An older or invalid document can still be downloaded.
    }
  }
  if (p.kind === "3d" && p.content) {
    try {
      const d = sceneSchema.parse(JSON.parse(p.content));
      return (
        <svg
          role="img"
          aria-label={p.title}
          viewBox="0 0 400 240"
          className="project-preview"
        >
          <rect width="400" height="240" fill={d.bg} />
          {d.objects
            .filter((o) => !o.hidden)
            .map((o) => (
              <g
                key={o.id}
                transform={`translate(${200 + o.pos[0] * 20 + o.pos[2] * 8} ${150 - o.pos[1] * 25 + o.pos[2] * 5}) rotate(${o.rotY}) scale(${o.scale})`}
              >
                {o.kind === "sphere" ? (
                  <circle r="20" fill={o.color} />
                ) : o.kind === "cone" ? (
                  <polygon points="0,-25 22,20 -22,20" fill={o.color} />
                ) : (
                  <rect
                    x="-18"
                    y="-18"
                    width="36"
                    height="36"
                    rx={o.kind === "torus" ? 15 : 3}
                    fill={o.color}
                  />
                )}
              </g>
            ))}
        </svg>
      );
    } catch {
      /* invalid document */
    }
  }
  return (
    <div className="project-preview placeholder">
      <span>{p.kind.toUpperCase()}</span>
      <strong>{p.title.slice(0, 30)}</strong>
    </div>
  );
}
export function PublicPage({
  id,
  kind,
}: {
  id: string;
  kind: "profiles" | "projects";
}) {
  return kind === "profiles" ? (
    <PublicGallery key={id} id={id} />
  ) : (
    <PublicCase key={id} id={id} />
  );
}

function PublicGallery({ id }: { id: string }) {
  const { t } = useLocale();
  const [data, setData] = useState<Gallery | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof message> | null>(null);
  const request = useRef<AbortController | null>(null);
  async function load(pageOffset: number) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const next = await api<Gallery>(
        `/public/profiles/${id}?view=gallery&offset=${pageOffset}`,
        "GET",
        undefined,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setData((previous) => {
        if (!pageOffset || !previous) return next;
        const seen = new Set(previous.projects.map((project) => project.id));
        return {
          ...next,
          projects: [
            ...previous.projects,
            ...next.projects.filter((project) => !seen.has(project.id)),
          ],
        };
      });
      setOffset(pageOffset + next.projects.length);
    } catch (e) {
      if (!controller.signal.aborted) setError(message(e));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  useEffect(() => {
    void load(0);
    return () => request.current?.abort();
  }, [id]);

  return (
    <section className="cs-public-portfolio">
      {data && (
        <>
          <header className="cs-gallery-intro">
            <p className="eyebrow">
              {t(
                L("Портфолио автора", "Creator portfolio", "Автор портфолиосы"),
              )}
            </p>
            <h1>{data.profile.display_name}</h1>
            {data.profile.bio && (
              <p className="cs-gallery-bio">{data.profile.bio}</p>
            )}
          </header>
          {data.projects.length ? (
            <div className="cs-gallery-grid">
              {data.projects.map((project) => {
                const Icon = galleryIcons[project.kind];
                return (
                  <article className="cs-gallery-card" key={project.id}>
                    <Link
                      href={`/p/${project.id}`}
                      className={`cs-gallery-cover cs-kind-${project.kind}`}
                      aria-label={project.title}
                    >
                      <Icon size={32} aria-hidden="true" />
                      {project.kind === "design" && (
                        <ProjectThumbnail project={project} published />
                      )}
                    </Link>
                    <div className="cs-gallery-card-body">
                      <p>{t(kindLabels[project.kind])}</p>
                      <h2>
                        <Link href={`/p/${project.id}`}>
                          {project.title}
                          <ArrowUpRight size={17} />
                        </Link>
                      </h2>
                      {project.description && (
                        <p className="cs-gallery-summary">
                          {readStory(project.description).find(Boolean)}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p>
              {t(
                L(
                  "Публичных работ пока нет.",
                  "No public work yet.",
                  "Әзірге ашық жұмыс жоқ.",
                ),
              )}
            </p>
          )}
          {offset < data.total && !error && (
            <button
              disabled={loading}
              className="cs-action cs-load-more"
              onClick={() => void load(offset)}
            >
              {t(L("Показать ещё", "Show more", "Тағы көрсету"))}
            </button>
          )}
        </>
      )}
      {loading && <PageLoading />}
      {error && (
        <PublicRetry text={t(error)} onRetry={() => void load(offset)} />
      )}
    </section>
  );
}

function PublicCase({ id }: { id: string }) {
  const { t } = useLocale();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<ReturnType<typeof message> | null>(null);
  const [retry, setRetry] = useState(0);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    void api<Project>(
      `/public/projects/${id}`,
      "GET",
      undefined,
      controller.signal,
    )
      .then((p) => {
        if (!controller.signal.aborted) setProject(p);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(message(e));
      });
    return () => controller.abort();
  }, [id, retry]);
  if (error)
    return (
      <PublicRetry text={t(error)} onRetry={() => setRetry((n) => n + 1)} />
    );
  if (!project) return <PageLoading />;
  const p = project;
  const story = readStory(p.description ?? "");
  const structured = story[0] !== p.description || story.slice(1).some(Boolean);
  async function share() {
    const url = new URL(`/p/${p.id}`, location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setLink(url);
    }
  }
  return (
    <article className="cs-public-portfolio cs-public-case">
      <Link className="cs-case-back" href={`/u/${p.owner_id}`}>
        <ArrowLeft size={16} />
        {t(L("Портфолио автора", "Creator portfolio", "Автор портфолиосы"))}
      </Link>
      <header className="cs-gallery-intro">
        <p className="eyebrow">{t(kindLabels[p.kind])}</p>
        <h1>{p.title}</h1>
      </header>
      <Preview project={p} />
      {p.description && (
        <div className="cs-public-story">
          {!structured ? (
            <>
              <h2>
                {t(L("Слова автора", "In the creator’s words", "Автор сөзі"))}
              </h2>
              <p>{p.description}</p>
            </>
          ) : (
            story.map(
              (text, index) =>
                text && (
                  <section key={index}>
                    <h2>{t(storyLabels[index])}</h2>
                    <p>{text}</p>
                  </section>
                ),
            )
          )}
        </div>
      )}
      <div className="cs-case-actions">
        <button className="cs-action" onClick={() => void share()}>
          <Link2 size={15} />
          {t(
            copied
              ? L("Ссылка скопирована", "Link copied", "Сілтеме көшірілді")
              : L("Поделиться работой", "Share this work", "Жұмыспен бөлісу"),
          )}
        </button>
        <button
          className="cs-action"
          onClick={() =>
            download(
              `${p.title}.json`,
              JSON.stringify(
                { kind: p.kind, content: p.content, title: p.title },
                null,
                2,
              ),
            )
          }
        >
          <Download size={15} />
          {t(
            L(
              "Скачать опубликованный исходник",
              "Download published source",
              "Жарияланған түпнұсқаны жүктеу",
            ),
          )}
        </button>
      </div>
      {link && (
        <label className="cs-case-link">
          {t(L("Ссылка на работу", "Project link", "Жұмыс сілтемесі"))}
          <input
            readOnly
            value={link}
            onFocus={(event) => event.target.select()}
          />
        </label>
      )}
    </article>
  );
}

function PublicRetry({ text, onRetry }: { text: string; onRetry: () => void }) {
  const { t } = useLocale();
  return (
    <div role="alert" className="cs-inline-error">
      {text}
      <button onClick={onRetry}>
        {t(L("Повторить", "Retry", "Қайталау"))}
      </button>
    </div>
  );
}
export const resources = [
  {
    id: "brief",
    title: L(
      "Бриф творческого проекта",
      "Creative project brief",
      "Шығармашылық жоба брифі",
    ),
    type: "TXT",
    text: L(
      "Цель:\nАудитория:\nГлавная мысль:\nОграничения:\nСрок:\nКритерии успеха:\nПрава на материалы:\nИтоговая проверка:\n",
      "Goal:\nAudience:\nMain message:\nConstraints:\nDeadline:\nSuccess criteria:\nMaterial rights:\nFinal review:\n",
      "Мақсат:\nАудитория:\nНегізгі ой:\nШектеулер:\nМерзім:\nТабыс өлшемдері:\nМатериал құқықтары:\nСоңғы тексеру:\n",
    ),
  },
  {
    id: "review",
    title: L(
      "Чек-лист портфолио",
      "Portfolio review checklist",
      "Портфолио тексеру тізімі",
    ),
    type: "TXT",
    text: L(
      "□ Моя роль указана\n□ Проблема и решение понятны\n□ Есть процесс и результат\n□ Права на изображения проверены\n□ Ссылка открывается без входа\n□ Проверено на телефоне\n",
      "□ My role is explicit\n□ Problem and solution are clear\n□ Process and outcome shown\n□ Image rights verified\n□ Link works signed out\n□ Tested on mobile\n",
      "□ Рөлім көрсетілген\n□ Мәселе мен шешім түсінікті\n□ Процесс пен нәтиже бар\n□ Сурет құқығы тексерілген\n□ Сілтеме кірусіз ашылады\n□ Телефонда тексерілген\n",
    ),
  },
  {
    id: "palette",
    title: L("Палитра Studio", "Studio palette", "Studio палитрасы"),
    type: "SVG",
    text: L("", "", ""),
  },
];
