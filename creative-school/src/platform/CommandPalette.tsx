import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  BookOpen,
  Box,
  Camera,
  Clapperboard,
  FileText,
  FolderKanban,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Dialog } from "./Dialog";
import { L, useLocale } from "./locale";
import { useWorkspace } from "./use-workspace";
import { kindLabels, projectHref, searchScore } from "./workspace";
import type { CourseSummary as Course } from "./course-index";
type Entry = {
  id: string;
  title: string;
  detail: string;
  href: string;
  keywords: string;
  group: "pages" | "lessons" | "projects" | "services";
  icon: typeof Search;
};
export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const { t } = useLocale(),
    { data, loading, error, refresh } = useWorkspace(true, true),
    [query, setQuery] = useState(""),
    [active, setActive] = useState(0),
    [courses, setCourses] = useState<Course[]>([]),
    [courseError, setCourseError] = useState(false);
  const results = useRef<HTMLDivElement>(null);
  const loadCourses = () => {
    setCourseError(false);
    void import("./course-index")
      .then((m) => setCourses(m.courseIndex))
      .catch(() => setCourseError(true));
  };
  useEffect(() => loadCourses(), []);
  const entries = useMemo(() => {
    const pages: Entry[] = [
      {
        id: "spark",
        title: t(
          L(
            "Искра — мастерская идей",
            "Spark — idea workshop",
            "Ұшқын — идея шеберханасы",
          ),
        ),
        detail: t(
          L(
            "Живые постеры и творческие задания",
            "Live posters and creative briefs",
            "Жанды постерлер мен шығармашылық тапсырмалар",
          ),
        ),
        href: "/spark",
        keywords: "spark искра ұшқын poster постер идея шаблон template",
        group: "pages",
        icon: Sparkles,
      },
      {
        id: "home",
        title: t(L("Обзор", "Overview", "Шолу")),
        detail: t(
          L(
            "Вернуться в пространство",
            "Back to your workspace",
            "Кеңістікке оралу",
          ),
        ),
        href: "/dashboard",
        keywords: "home dashboard обзор шолу",
        group: "pages",
        icon: Sparkles,
      },
      {
        id: "learn",
        title: t(L("Обучение", "Learning", "Оқу")),
        detail: t(
          L(
            "Курсы и практические задания",
            "Courses and practice",
            "Курстар мен тәжірибе",
          ),
        ),
        href: "/learn",
        keywords: "courses learn материалы курсы оқу",
        group: "pages",
        icon: BookOpen,
      },
      ...(["design", "3d", "image", "video", "notes"] as const).map(
        (kind, i) => ({
          id: kind,
          title: t(kindLabels[kind]),
          detail: t(
            L(
              "Создать новый проект",
              "Create a new project",
              "Жаңа жоба жасау",
            ),
          ),
          href: `/studio/${kind}`,
          keywords:
            kind + " " + kindLabels[kind].join(" ") + " studio студия редактор",
          group: "pages" as const,
          icon: [Sparkles, Box, Camera, Clapperboard, FileText][i],
        }),
      ),
      {
        id: "projects",
        title: t(L("Мои проекты", "My projects", "Менің жобаларым")),
        detail: t(
          L(
            "Черновики, публикации и архив",
            "Drafts, published work and archive",
            "Нобайлар, жарияланымдар мен мұрағат",
          ),
        ),
        href: "/projects",
        keywords: "projects файлы архив жоба",
        group: "pages",
        icon: FolderKanban,
      },
      {
        id: "market",
        title: t(
          L(
            "Услуги сообщества",
            "Community services",
            "Қауымдастық қызметтері",
          ),
        ),
        detail: t(
          L(
            "Найти исполнителя или предложить услугу",
            "Find a creator or offer a service",
            "Орындаушы табу не қызмет ұсыну",
          ),
        ),
        href: "/marketplace",
        keywords: "shop services магазин лого монтаж дүкен",
        group: "pages",
        icon: ShoppingBag,
      },
      {
        id: "portfolio",
        title: t(L("Портфолио", "Portfolio", "Портфолио")),
        detail: t(
          L(
            "Работы, которыми можно поделиться",
            "Work ready to share",
            "Бөлісуге дайын жұмыстар",
          ),
        ),
        href: "/portfolio",
        keywords: "portfolio портфолио жариялау",
        group: "pages",
        icon: FolderKanban,
      },
    ];
    for (const c of courses) {
      pages.push({
        id: `course:${c.id}`,
        title: t(c.title),
        detail: t(L("Курс", "Course", "Курс")),
        href: `/learn/${c.id}`,
        keywords: c.title.join(" "),
        group: "lessons",
        icon: BookOpen,
      });
      for (const l of c.lessons)
        pages.push({
          id: `lesson:${l.id}`,
          title: t(l.title),
          detail: `${t(c.title)} · ${l.minutes} ${t(L("мин", "min", "мин"))}`,
          href: `/learn/${c.id}/${l.id}`,
          keywords: c.title.join(" ") + " " + l.title.join(" "),
          group: "lessons",
          icon: BookOpen,
        });
    }
    for (const p of data?.projects ?? [])
      pages.push({
        id: `project:${p.id}`,
        title: p.title,
        detail:
          t(kindLabels[p.kind]) +
          (p.status === "archived"
            ? ` · ${t(L("Архив", "Archive", "Мұрағат"))}`
            : ""),
        href:
          p.status === "archived"
            ? `/projects?status=archived&q=${encodeURIComponent(p.title)}`
            : projectHref(p),
        keywords: (p.description ?? "") + " " + kindLabels[p.kind].join(" "),
        group: "projects",
        icon: FolderKanban,
      });
    for (const s of data?.services ?? [])
      pages.push({
        id: `service:${s.id}`,
        title: s.title,
        detail: `${s.seller_name} · ${s.price.toLocaleString()} ₸`,
        href: `/marketplace?q=${encodeURIComponent(s.title)}`,
        keywords: `${s.description} ${s.seller_name} ${s.category}`,
        group: "services",
        icon: ShoppingBag,
      });
    return pages;
  }, [data, courses, t]);
  const matches = useMemo(
    () =>
      query.trim()
        ? entries
            .map((e) => ({
              entry: e,
              score: searchScore(query, e.title, e.keywords),
            }))
            .filter((e) => e.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 30)
            .map((e) => e.entry)
        : [
            ...entries.filter((e) => e.group === "projects").slice(0, 4),
            ...entries.filter((e) => e.group === "pages"),
          ].slice(0, 13),
    [query, entries],
  );
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    results.current
      ?.querySelector<HTMLElement>(`[data-option="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const groups = {
    pages: L("Перейти или создать", "Go or create", "Өту не жасау"),
    lessons: L("Курсы и уроки", "Courses and lessons", "Курстар мен сабақтар"),
    projects: L("Ваши проекты", "Your projects", "Сіздің жобаларыңыз"),
    services: L("Услуги", "Services", "Қызметтер"),
  };
  return (
    <Dialog
      label={t(L("Поиск по сайту", "Search the site", "Сайттан іздеу"))}
      onClose={onClose}
      className="cs-command"
    >
      <div className="cs-command-input">
        <Search size={19} />
        <input
          autoFocus
          role="combobox"
          aria-label={t(
            L("Поиск по сайту", "Search the site", "Сайттан іздеу"),
          )}
          aria-expanded="true"
          aria-controls="cs-command-results"
          aria-activedescendant={
            matches.length
              ? `cs-command-${Math.min(active, matches.length - 1)}`
              : undefined
          }
          autoComplete="off"
          maxLength={120}
          placeholder={t(
            L(
              "Проект, урок, студия или услуга…",
              "Project, lesson, studio or service…",
              "Жоба, сабақ, студия не қызмет…",
            ),
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              if (matches.length)
                setActive(
                  (n) =>
                    (n + (e.key === "ArrowDown" ? 1 : -1) + matches.length) %
                    matches.length,
                );
            }
            if (e.key === "Enter") {
              e.preventDefault();
              results.current
                ?.querySelector<HTMLAnchorElement>(
                  `[data-option="${Math.min(active, matches.length - 1)}"]`,
                )
                ?.click();
            }
            if (e.key === "Home" && !e.shiftKey) {
              setActive(0);
            }
            if (e.key === "End" && !e.shiftKey) {
              setActive(Math.max(0, matches.length - 1));
            }
          }}
        />
        <button
          onClick={onClose}
          aria-label={t(L("Закрыть поиск", "Close search", "Іздеуді жабу"))}
        >
          <X size={18} />
        </button>
      </div>
      {(error || courseError) && (
        <div role="status" className="cs-inline-error">
          {error ||
            t(
              L(
                "Не удалось загрузить уроки.",
                "Could not load lessons.",
                "Сабақтар жүктелмеді.",
              ),
            )}
          <button
            onClick={() => {
              void refresh();
              loadCourses();
            }}
          >
            {t(L("Повторить", "Retry", "Қайталау"))}
          </button>
        </div>
      )}
      <div
        ref={results}
        id="cs-command-results"
        role="listbox"
        aria-label={t(
          L("Результаты поиска", "Search results", "Іздеу нәтижелері"),
        )}
        className="cs-command-results"
      >
        {matches.map((e, i) => {
          const Icon = e.icon;
          return (
            <div key={e.id}>
              {(i === 0 || matches[i - 1].group !== e.group) && (
                <p className="cs-command-group">{t(groups[e.group])}</p>
              )}
              <Link
                id={`cs-command-${i}`}
                data-option={i}
                href={e.href}
                role="option"
                aria-selected={i === active}
                tabIndex={-1}
                className="cs-command-result"
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => setActive(i)}
                onClick={onClose}
              >
                <Icon size={19} />
                <span>
                  <strong>{e.title}</strong>
                  <small>{e.detail}</small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          );
        })}
        {!matches.length && (
          <p className="cs-command-empty">
            {loading
              ? t(L("Ищем…", "Searching…", "Ізделуде…"))
              : t(
                  L(
                    "Ничего не найдено. Попробуйте другое название.",
                    "No results. Try another name.",
                    "Ештеңе табылмады. Басқа атауды іздеңіз.",
                  ),
                )}
          </p>
        )}
      </div>
      <footer className="cs-command-footer">
        <span>
          {t(
            L(
              "↑ ↓ выбрать · Enter открыть · Esc закрыть",
              "↑ ↓ select · Enter open · Esc close",
              "↑ ↓ таңдау · Enter ашу · Esc жабу",
            ),
          )}
        </span>
        {loading && (
          <span role="status">
            {t(L("Обновляем…", "Updating…", "Жаңартылуда…"))}
          </span>
        )}
      </footer>
    </Dialog>
  );
}
