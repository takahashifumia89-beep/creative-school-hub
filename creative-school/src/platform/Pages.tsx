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
          {d.shapes.map((s) => (
            <g
              key={s.id}
              opacity={s.op ?? 1}
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
          {d.objects.map((o) => (
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
export function Projects({
  portfolio = false,
  user,
}: {
  portfolio?: boolean;
  user: User;
}) {
  const { t } = useLocale(),
    [projects, setProjects] = useState<Project[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState<string | null>(null);
  async function load(offset = 0) {
    setLoading(true);
    try {
      const ps = await api<Project[]>(`/projects?offset=${offset}`);
      const full = ps;
      setProjects((old) => (offset ? [...old, ...full] : full));
      setMore(ps.length === 24);
      setError("");
    } catch (e) {
      setError(t(message(e)));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function change(p: Project, remove = false) {
    if (
      remove &&
      !confirm(
        t(
          L(
            "Удалить навсегда? Сначала скачайте копию.",
            "Delete permanently? Download a backup first.",
            "Біржола жою керек пе? Алдымен көшірмесін жүктеңіз.",
          ),
        ),
      )
    )
      return;
    if (
      !remove &&
      p.status !== "published" &&
      !confirm(
        t(
          L(
            "Опубликовать работу и её редактируемый исходник? Они будут доступны по публичной ссылке. Права на работу остаются у вас.",
            "Publish the work and its editable source? They will be available by public link. You retain ownership.",
            "Жұмыс пен өңделетін түпнұсқаны жариялау керек пе? Олар ашық сілтеме арқылы қолжетімді болады. Құқық сізде қалады.",
          ),
        ),
      )
    )
      return;
    setBusy(p.id);
    try {
      if (remove) {
        await api(`/projects/${p.id}`, "DELETE", { version: p.version });
        setProjects((ps) => ps.filter((x) => x.id !== p.id));
      } else {
        const r = await api<Project>(`/projects/${p.id}`, "PATCH", {
          version: p.version,
          status: p.status === "published" ? "draft" : "published",
          visibility: p.status === "published" ? "private" : "public",
        });
        setProjects((ps) => ps.map((x) => (x.id === p.id ? r : x)));
      }
    } catch (e) {
      setError(t(message(e)));
    } finally {
      setBusy(null);
    }
  }
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">MAKE / SAVE / SHARE</p>
          <h1>
            {t(
              portfolio
                ? L("Моё портфолио", "My portfolio", "Менің портфолиом")
                : L("Проекты", "Projects", "Жобалар"),
            )}
          </h1>
          <p>
            {t(
              L(
                "Исходники, версии и ваши опубликованные работы.",
                "Editable sources, versions and published work.",
                "Өңделетін түпнұсқа, нұсқалар және жарияланған жұмыстар.",
              ),
            )}
          </p>
        </div>
        <Link className="primary-link" href="/studio/design">
          + {t(L("Новый дизайн", "New design", "Жаңа дизайн"))}
        </Link>
      </div>
      {portfolio && (
        <div className="notice">
          <Link href={`/u/${user.id}`}>
            {t(
              L(
                "Открыть публичное портфолио",
                "Open public portfolio",
                "Ашық портфолионы көру",
              ),
            )}{" "}
            ↗
          </Link>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/u/${user.id}`,
                );
                setError(
                  t(
                    L(
                      "Ссылка скопирована.",
                      "Link copied.",
                      "Сілтеме көшірілді.",
                    ),
                  ),
                );
              } catch {
                setError(`${window.location.origin}/u/${user.id}`);
              }
            }}
          >
            {t(L("Скопировать ссылку", "Copy link", "Сілтемені көшіру"))}
          </button>
        </div>
      )}
      {error && (
        <p className="notice" role="status">
          {error}
          <button onClick={() => void load()}>
            {t(L("Обновить", "Refresh", "Жаңарту"))}
          </button>
        </p>
      )}
      <div className="grid3">
        {projects
          .filter((p) => !portfolio || p.status === "published")
          .map((p) => (
            <article key={p.id} className="card">
              <Preview project={p} />
              <small>
                {p.kind.toUpperCase()} · v{p.version} ·{" "}
                {p.status === "published"
                  ? t(L("Опубликован", "Published", "Жарияланды"))
                  : t(L("Черновик", "Draft", "Жоба нұсқасы"))}
              </small>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="row">
                <Link href={`/studio/${p.kind}?project=${p.id}`}>
                  {t(L("Редактировать", "Edit", "Өңдеу"))}
                </Link>
                <button disabled={busy === p.id} onClick={() => void change(p)}>
                  {t(
                    p.status === "published"
                      ? L("Снять с публикации", "Unpublish", "Жариялаудан алу")
                      : L("Опубликовать", "Publish", "Жариялау"),
                  )}
                </button>
                {p.status === "published" && <Link href={`/p/${p.id}`}>↗</Link>}
                <button
                  disabled={busy === p.id}
                  onClick={() => void change(p, true)}
                >
                  {t(L("Удалить", "Delete", "Жою"))}
                </button>
              </div>
            </article>
          ))}
      </div>
      {loading && (
        <p role="status">{t(L("Загрузка…", "Loading…", "Жүктелуде…"))}</p>
      )}
      {!loading && !projects.length && (
        <div className="empty">
          {t(
            L(
              "Создайте первый проект в одной из студий.",
              "Create your first project in a studio.",
              "Студияда алғашқы жобаңызды жасаңыз.",
            ),
          )}
        </div>
      )}
      {more && (
        <button onClick={() => void load(projects.length)}>
          {t(L("Загрузить ещё", "Load more", "Тағы жүктеу"))}
        </button>
      )}
    </section>
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
const resources = [
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
export function Marketplace() {
  const { t, lang } = useLocale(),
    [favorites, setFavorites] = useState<string[]>(() => {
      try {
        return JSON.parse(localStorage.getItem("cs-favorites") ?? "[]");
      } catch {
        return [];
      }
    }),
    [only, setOnly] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">RESOURCE LIBRARY</p>
          <h1>
            {t(L("Магазин ресурсов", "Resource shop", "Ресурстар дүкені"))}
          </h1>
          <p>
            {t(
              L(
                "Бесплатные авторские шаблоны Creative School. Лицензия CC0: личное и коммерческое использование.",
                "Free original Creative School templates. CC0: personal and commercial use.",
                "Creative School авторлық тегін үлгілері. CC0: жеке және коммерциялық қолдану.",
              ),
            )}
          </p>
        </div>
      </div>
      <p className="notice">
        {t(
          L(
            "Платные продажи не включены: платёжный провайдер и выплаты авторам ещё не настроены. Бесплатные файлы доступны сразу.",
            "Paid sales are unavailable until a payment provider and creator payouts are configured. Free downloads work now.",
            "Төлем провайдері мен автор төлемдері бапталмағандықтан ақылы сату қолжетімсіз. Тегін файлдарды қазір жүктеуге болады.",
          ),
        )}
      </p>
      <label className="row">
        <input
          type="checkbox"
          checked={only}
          onChange={(e) => setOnly(e.target.checked)}
        />
        {t(L("Только избранное", "Favorites only", "Тек таңдаулылар"))}
      </label>
      <div className="grid3">
        {resources
          .filter((r) => !only || favorites.includes(r.id))
          .map((r) => (
            <article className="card" key={r.id}>
              <span className="course-number">{r.type}</span>
              <h2>{t(r.title)}</h2>
              <p>
                Creative School · CC0 · {t(L("Бесплатно", "Free", "Тегін"))}
              </p>
              <div className="row">
                <button
                  onClick={() => {
                    download(
                      `${r.id}-${lang}.${r.type.toLowerCase()}`,
                      r.id === "palette"
                        ? '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">' +
                            ["#f6f1e7", "#e8590c", "#1b1b22", "#d9e7cb"]
                              .map(
                                (c, i) =>
                                  `<rect x="${i * 200}" width="200" height="200" fill="${c}"/>`,
                              )
                              .join("") +
                            "</svg>"
                        : t(r.text),
                      r.type === "SVG" ? "image/svg+xml" : "text/plain",
                    );
                    setNotice(
                      t(
                        L(
                          "Файл подготовлен.",
                          "Download ready.",
                          "Файл дайын.",
                        ),
                      ),
                    );
                  }}
                >
                  {t(L("Скачать", "Download", "Жүктеу"))} ↓
                </button>
                <button
                  aria-pressed={favorites.includes(r.id)}
                  aria-label={t(L("Избранное", "Favorite", "Таңдаулы"))}
                  onClick={() => {
                    const next = favorites.includes(r.id)
                      ? favorites.filter((x) => x !== r.id)
                      : [...favorites, r.id];
                    setFavorites(next);
                    try {
                      localStorage.setItem(
                        "cs-favorites",
                        JSON.stringify(next),
                      );
                    } catch {
                      /* local storage */
                    }
                  }}
                >
                  {favorites.includes(r.id) ? "♥" : "♡"}
                </button>
              </div>
            </article>
          ))}
      </div>
      <p role="status">{notice}</p>
    </section>
  );
}
export function Progress() {
  const { t } = useLocale(),
    [stats, setStats] = useState<{
      xp: number;
      level: number;
      streak: number;
      weekDays: number;
      projectsTotal: number;
      badges: { badge: string; earned_at: string }[];
    } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    void api<typeof stats>("/stats")
      .then(setStats)
      .catch((e) => setError(t(message(e))));
  }, []);
  const badges = [
    ["lesson", L("Первый урок", "First lesson", "Алғашқы сабақ")],
    ["ten-lessons", L("10 уроков", "10 lessons", "10 сабақ")],
    [
      "publish",
      L("Первая публикация", "First publication", "Алғашқы жарияланым"),
    ],
    ["projects", L("3 проекта", "3 projects", "3 жоба")],
    ["level", L("Уровень 3", "Level 3", "3-деңгей")],
    [
      "streak",
      L(
        "3 дня практики подряд",
        "3-day practice streak",
        "Қатарынан 3 күн тәжірибе",
      ),
    ],
  ] as const;
  return (
    <section>
      <p className="eyebrow">YOUR PROGRESS</p>
      <h1>
        {t(
          L(
            "Обзор и достижения",
            "Overview and achievements",
            "Шолу және жетістіктер",
          ),
        )}
      </h1>
      {error && <p className="error">{error}</p>}
      {stats ? (
        <>
          <div className="grid3">
            {[
              [`${stats.xp} XP`, L("Опыт", "Experience", "Тәжірибе")],
              [`${stats.level}`, L("Уровень", "Level", "Деңгей")],
              [
                `${stats.streak}`,
                L(
                  "Дней практики подряд",
                  "Consecutive practice days",
                  "Қатарынан тәжірибе күндері",
                ),
              ],
            ].map(([v, label]) => (
              <div className="card" key={String(v) + String(label)}>
                <span className="course-number">{v as string}</span>
                <p>{t(label as ReturnType<typeof L>)}</p>
              </div>
            ))}
          </div>
          <p>
            {t(
              L(
                "За вход в аккаунт серия не начисляется. Полученные награды сохраняются.",
                "Signing in does not extend your practice streak. Earned badges are permanent.",
                "Кіру тәжірибе күнін есептемейді. Алынған белгілер сақталады.",
              ),
            )}
          </p>
          <div className="grid3">
            {badges.map(([id, title]) => (
              <article className="card" key={id}>
                <h2>
                  {stats.badges.some((b) => b.badge === id) ? "✓" : "○"}{" "}
                  {t(title)}
                </h2>
                <p>
                  {t(
                    stats.badges.some((b) => b.badge === id)
                      ? L("Получено", "Earned", "Алынды")
                      : L("Впереди", "In progress", "Алда"),
                  )}
                </p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p>{t(L("Загрузка…", "Loading…", "Жүктелуде…"))}</p>
      )}
      <Link className="primary-link" href="/learn">
        {t(L("Продолжить обучение", "Continue learning", "Оқуды жалғастыру"))} →
      </Link>
    </section>
  );
}
