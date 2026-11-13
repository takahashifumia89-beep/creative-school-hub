import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, download, message, type Project, type User } from "./client";
import { L, useLocale } from "./locale";
import { designSchema, sceneSchema } from "./schema";
export function Preview({ project: p }: { project: Project }) {
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
          {d.shapes
            .filter((s) => !s.hidden)
            .map((s) => (
              <g
                key={s.id}
                opacity={s.op ?? 1}
                stroke={s.stroke ?? "none"}
                strokeWidth={s.strokeWidth ?? 0}
                transform={`rotate(${s.rot ?? 0} ${s.x + s.w / 2} ${s.y + s.h / 2})`}
              >
                {s.type === "rect" ? (
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    fill={s.fill}
                    rx={s.r}
                  />
                ) : s.type === "ellipse" ? (
                  <ellipse
                    cx={s.x + s.w / 2}
                    cy={s.y + s.h / 2}
                    rx={s.w / 2}
                    ry={s.h / 2}
                    fill={s.fill}
                  />
                ) : s.type === "text" ? (
                  <text
                    x={s.x}
                    y={s.y}
                    dominantBaseline="hanging"
                    fontSize={s.size}
                    fill={s.fill}
                    fontFamily={s.font}
                    fontWeight={s.bold ? 700 : 400}
                  >
                    {s.text}
                  </text>
                ) : (
                  <polygon
                    points={`${s.x + s.w / 2},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`}
                    fill={s.fill}
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
    } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    setData(null);
    setError("");
    void api<
      | Project
      | { profile: { display_name: string; bio: string }; projects: Project[] }
    >(`/public/${kind}/${id}`)
      .then((r) => setData("projects" in r ? r : { projects: [r] }))
      .catch((e) => setError(t(message(e))));
  }, [id, kind]);
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
          <div className="grid3">
            {data.projects.map((p) => (
              <article className="card" key={p.id}>
                <Preview project={p} />
                <h2>
                  <Link href={`/p/${p.id}`}>{p.title}</Link>
                </h2>
                <p>{p.description}</p>
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
