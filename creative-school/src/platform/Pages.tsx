import { useEffect, useState, useId, useRef } from "react";
import { Link } from "wouter";
import { api, download, message, type Project, type User } from "./client";
import { L, useLocale } from "./locale";
import { designSchema, sceneSchema } from "./schema";
import { localBounds, polygonPoints } from "../features/studio/design-geometry";
export function Preview({ project: p }: { project: Project }) {
  const paintId = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (p.kind === "design" && p.content) {
    try {
      const d = designSchema.parse(JSON.parse(p.content));
      return (
        <svg
          role="img"
          aria-label={p.title}
          viewBox={`0 0 ${d.w ?? 800} ${d.h ?? 500}`}
          className="project-preview"
        >
          <rect width="100%" height="100%" fill={d.bg} />
          <defs>
            {d.shapes.map((s, i) =>
              s.fill2 ? (
                <linearGradient
                  key={s.id}
                  id={`${paintId}-paint-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                  gradientTransform={`rotate(${s.gradientAngle ?? 0} .5 .5)`}
                >
                  <stop offset="0%" stopColor={s.fill} />
                  <stop offset="100%" stopColor={s.fill2} />
                </linearGradient>
              ) : null,
            )}
          </defs>
          {d.shapes
            .filter((s) => !s.hidden)
            .map((s) => {
              const b = localBounds(s);
              const textX =
                s.align === "center"
                  ? s.x + b.w / 2
                  : s.align === "right"
                    ? s.x + b.w
                    : s.x;
              return (
                <g
                  key={s.id}
                  opacity={s.op ?? 1}
                  stroke={s.stroke ?? "none"}
                  strokeWidth={s.strokeWidth ?? 0}
                  strokeDasharray={
                    s.strokeDash === "dashed"
                      ? "12 7"
                      : s.strokeDash === "dotted"
                        ? "2 6"
                        : undefined
                  }
                  transform={`rotate(${s.rot ?? 0} ${b.x + b.w / 2} ${b.y + b.h / 2})`}
                >
                  {s.type === "rect" ? (
                    <rect
                      x={s.x}
                      y={s.y}
                      width={s.w}
                      height={s.h}
                      fill={
                        s.fill2
                          ? `url(#${paintId}-paint-${d.shapes.indexOf(s)})`
                          : s.fill
                      }
                      rx={s.r}
                    />
                  ) : s.type === "ellipse" ? (
                    <ellipse
                      cx={s.x + s.w / 2}
                      cy={s.y + s.h / 2}
                      rx={s.w / 2}
                      ry={s.h / 2}
                      fill={
                        s.fill2
                          ? `url(#${paintId}-paint-${d.shapes.indexOf(s)})`
                          : s.fill
                      }
                    />
                  ) : s.type === "text" ? (
                    <text
                      x={textX}
                      y={s.y}
                      dominantBaseline="text-before-edge"
                      fontSize={s.size ?? 36}
                      fill={
                        s.fill2
                          ? `url(#${paintId}-paint-${d.shapes.indexOf(s)})`
                          : s.fill
                      }
                      fontFamily={s.font ?? "Inter, sans-serif"}
                      fontWeight={s.bold ? 700 : 400}
                      fontStyle={s.italic ? "italic" : "normal"}
                      textAnchor={
                        s.align === "center"
                          ? "middle"
                          : s.align === "right"
                            ? "end"
                            : "start"
                      }
                      letterSpacing={s.letterSpacing ?? 0}
                    >
                      {(s.text ?? "").split("\n").map((line, i) => (
                        <tspan
                          key={i}
                          x={textX}
                          y={s.y + i * (s.size ?? 36) * (s.lineHeight ?? 1.2)}
                        >
                          {line || "\u00a0"}
                        </tspan>
                      ))}
                    </text>
                  ) : (
                    <polygon
                      points={polygonPoints(s)}
                      fill={
                        s.fill2
                          ? `url(#${paintId}-paint-${d.shapes.indexOf(s)})`
                          : s.fill
                      }
                    />
                  )}
                </g>
              );
            })}
        </svg>
      );
    } catch {
      /* invalid document */
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
  const { t } = useLocale(),
    [data, setData] = useState<{
      profile?: { display_name: string; bio: string };
      projects: Project[];
      total?: number;
    } | null>(null),
    [error, setError] = useState(""),
    [moreError, setMoreError] = useState(""),
    [loadingMore, setLoadingMore] = useState(false);
  const request = useRef<AbortController | null>(null),
    generation = useRef(0);
  useEffect(() => {
    const seq = ++generation.current,
      controller = new AbortController();
    request.current = controller;
    setData(null);
    setMoreError("");
    setLoadingMore(false);
    setError("");
    void api<
      | Project
      | { profile: { display_name: string; bio: string }; projects: Project[] }
    >(`/public/${kind}/${id}`, "GET", undefined, controller.signal)
      .then((r) => {
        if (seq === generation.current)
          setData("projects" in r ? r : { projects: [r] });
      })
      .catch((e) => {
        if (!controller.signal.aborted && seq === generation.current)
          setError(t(message(e)));
      });
    return () => {
      generation.current++;
      controller.abort();
    };
  }, [id, kind]);
  async function loadMore() {
    if (!data || loadingMore || kind !== "profiles") return;
    const seq = generation.current;
    setLoadingMore(true);
    setMoreError("");
    try {
      const next = await api<{ projects: Project[]; total: number }>(
        `/public/profiles/${id}?offset=${data.projects.length}`,
        "GET",
        undefined,
        request.current?.signal,
      );
      if (seq === generation.current)
        setData((current) =>
          current
            ? {
                ...current,
                total: next.total,
                projects: [
                  ...current.projects,
                  ...next.projects.filter(
                    (p) => !current.projects.some((x) => x.id === p.id),
                  ),
                ],
              }
            : current,
        );
    } catch (e) {
      if (seq === generation.current && !request.current?.signal.aborted)
        setMoreError(t(message(e)));
    } finally {
      if (seq === generation.current) setLoadingMore(false);
    }
  }
  return (
    <section>
      <p className="eyebrow">CREATIVE SCHOOL / PORTFOLIO</p>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : !data ? (
        <p>{t(L("Загрузка…", "Loading…", "Жүктелуде…"))}</p>
      ) : (
        <>
          <h1>{data.profile?.display_name ?? data.projects[0]?.title}</h1>
          <p>{data.profile?.bio}</p>
          <div
            className={
              kind === "projects" ? "cs-public-case" : "grid3 cs-public-gallery"
            }
          >
            {data.projects.map((p) => (
              <article className="card" key={p.id}>
                <Preview project={p} />
                <h2>
                  <Link href={`/p/${p.id}`}>{p.title}</Link>
                </h2>
                {p.description && (
                  <div className="cs-public-story">
                    <span className="eyebrow">
                      {t(
                        L(
                          "Слова автора",
                          "In the creator’s words",
                          "Автор сөзі",
                        ),
                      )}
                    </span>
                    <p>{p.description}</p>
                  </div>
                )}
                <p>{p.kind.toUpperCase()}</p>
                <button
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
                  {t(
                    L(
                      "Скачать опубликованный исходник",
                      "Download published source",
                      "Жарияланған түпнұсқаны жүктеу",
                    ),
                  )}
                </button>
              </article>
            ))}
          </div>
          {moreError && (
            <p className="error" role="alert">
              {moreError}
            </p>
          )}
          {(data.total ?? 0) > data.projects.length && (
            <button
              className="cs-action cs-load-more"
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              {t(
                loadingMore
                  ? L("Загружаем…", "Loading…", "Жүктелуде…")
                  : L("Показать ещё", "Show more", "Тағы көрсету"),
              )}
            </button>
          )}
          {!data.projects.length && (
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
        </>
      )}
    </section>
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
