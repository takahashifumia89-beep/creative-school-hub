import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import {
  Palette,
  Box,
  Film,
  Image,
  BookOpen,
  Folder,
  Globe,
  ShoppingBag,
  Award,
  Settings as SettingsIcon,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Search,
  Bell,
} from "lucide-react";
import {
  LocaleProvider,
  L,
  useLocale,
  type Localized,
} from "./platform/locale";
import { api, message, type User } from "./platform/client";
import { Auth, Settings, Notifications } from "./platform/Account";
import { Projects, PublicPage, Marketplace, Progress } from "./platform/Pages";
import { ErrorBoundary } from "./components/error-boundary";
import "./platform/platform.css";
const Studio = lazy(() => import("./platform/Studio"));
const Learning = lazy(() => import("./platform/Learning"));
const items: { href: string; label: Localized; icon: typeof Palette }[] = [
  { href: "/dashboard", label: L("Обзор", "Overview", "Шолу"), icon: Award },
  { href: "/learn", label: L("Обучение", "Learning", "Оқу"), icon: BookOpen },
  {
    href: "/projects",
    label: L("Проекты", "Projects", "Жобалар"),
    icon: Folder,
  },
  {
    href: "/portfolio",
    label: L("Портфолио", "Portfolio", "Портфолио"),
    icon: Globe,
  },
  {
    href: "/studio/design",
    label: L("Дизайн", "Design", "Дизайн"),
    icon: Palette,
  },
  {
    href: "/studio/3d",
    label: L("3D-моделирование", "3D modeling", "3D модельдеу"),
    icon: Box,
  },
  {
    href: "/studio/image",
    label: L("Фото", "Image editing", "Сурет өңдеу"),
    icon: Image,
  },
  {
    href: "/studio/video",
    label: L("Видеомонтаж", "Video editing", "Бейнемонтаж"),
    icon: Film,
  },
  {
    href: "/marketplace",
    label: L("Магазин", "Resource shop", "Дүкен"),
    icon: ShoppingBag,
  },
  {
    href: "/notifications",
    label: L("Уведомления", "Notifications", "Хабарландырулар"),
    icon: Bell,
  },
  {
    href: "/settings",
    label: L("Настройки", "Settings", "Баптаулар"),
    icon: SettingsIcon,
  },
];
function Platform() {
  const { t } = useLocale(),
    [location, navigate] = useLocation(),
    [user, setUser] = useState<User | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [dark, setDark] = useState(() => {
      try {
        return localStorage.getItem("creative-school-theme") === "dark";
      } catch {
        return false;
      }
    }),
    [search, setSearch] = useState("");
  async function load() {
    setError("");
    try {
      const r = await api<{ user: User }>("/me");
      setUser(r.user);
    } catch (e) {
      if ((e as { status?: number }).status !== 401) setError(t(message(e)));
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    void load();
    const expired = () => setUser(null);
    window.addEventListener("cs-session-expired", expired);
    return () => window.removeEventListener("cs-session-expired", expired);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    try {
      localStorage.setItem("creative-school-theme", dark ? "dark" : "light");
    } catch {
      /* browser storage */
    }
  }, [dark]);
  const publicRoute =
    location === "/" ||
    location === "/auth" ||
    location.startsWith("/u/") ||
    location.startsWith("/p/");
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
    if (loaded && !user && !publicRoute && !error) navigate("/auth");
  }, [location, loaded, user, publicRoute, error]);
  const shell = user && !publicRoute;
  return (
    <div className="platform">
      <a className="skip-link" href="#main">
        {t(L("К содержимому", "Skip to content", "Мазмұнға өту"))}
      </a>
      {shell && (
        <>
          <button
            className="mobile-menu"
            aria-label={t(L("Меню", "Menu", "Мәзір"))}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          {open && (
            <button
              className="sidebar-backdrop"
              aria-label={t(L("Закрыть меню", "Close menu", "Мәзірді жабу"))}
              onClick={() => setOpen(false)}
            />
          )}
          <aside className={open ? "sidebar is-open" : "sidebar"}>
            <Link href="/dashboard" className="brand">
              ✳ creative school<span>.</span>
            </Link>
            <p className="eyebrow">YOUR CREATIVE SPACE</p>
            <nav>
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={location === href ? "page" : undefined}
                >
                  <Icon size={17} />
                  {t(label)}
                </Link>
              ))}
            </nav>
            <div className="sidebar-footer">
              <Link href="/settings">{user.user_metadata.display_name}</Link>
              <button
                aria-label={t(L("Выйти", "Sign out", "Шығу"))}
                onClick={async () => {
                  try {
                    await api("/auth/signout", "POST", {});
                    setUser(null);
                    navigate("/");
                  } catch (e) {
                    setError(t(message(e)));
                  }
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          </aside>
        </>
      )}
      <div
        className={shell ? "platform-content with-sidebar" : "platform-content"}
      >
        <header>
          {!shell && (
            <Link href="/" className="brand">
              ✳ creative school<span>.</span>
            </Link>
          )}
          <span className="header-motto">
            {t(
              L(
                "Создавайте смело.",
                "Make something that matters.",
                "Батыл жасаңыз.",
              ),
            )}
          </span>
          <div className="row">
            {shell && (
              <form
                className="header-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(`/learn?q=${encodeURIComponent(search)}`);
                }}
              >
                <label className="sr-only" htmlFor="global-search">
                  {t(L("Найти курс", "Find a course", "Курс іздеу"))}
                </label>
                <input
                  id="global-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t(
                    L("Найти курс…", "Find a course…", "Курс іздеу…"),
                  )}
                />
                <button aria-label={t(L("Поиск", "Search", "Іздеу"))}>
                  <Search size={16} />
                </button>
              </form>
            )}
            <button
              aria-label={t(
                L("Переключить тему", "Toggle theme", "Тақырыпты ауыстыру"),
              )}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {!shell && (
              <Link href={user ? "/dashboard" : "/auth"}>
                {t(
                  user
                    ? L("Мой кабинет", "My workspace", "Менің кеңістігім")
                    : L("Войти", "Sign in", "Кіру"),
                )}
              </Link>
            )}
          </div>
        </header>
        <main id="main">
          {error && (
            <div className="error" role="alert">
              {error}
              <button onClick={() => void load()}>
                {t(L("Повторить", "Retry", "Қайталау"))}
              </button>
            </div>
          )}
          {!loaded && !publicRoute ? (
            <section>{t(L("Загрузка…", "Loading…", "Жүктелуде…"))}</section>
          ) : !publicRoute && !user ? null : (
            <ErrorBoundary key={location}>
              <Suspense
                fallback={
                  <section>
                    {t(L("Загрузка…", "Loading…", "Жүктелуде…"))}
                  </section>
                }
              >
                <Switch>
                  <Route path="/">
                    <Landing />
                  </Route>
                  <Route path="/auth">
                    <Auth onUser={setUser} />
                  </Route>
                  <Route path="/u/:id">
                    {(p) => <PublicPage kind="profiles" id={p.id} />}
                  </Route>
                  <Route path="/p/:id">
                    {(p) => <PublicPage kind="projects" id={p.id} />}
                  </Route>
                  <Route path="/dashboard">
                    <Progress />
                  </Route>
                  <Route path="/achievements">
                    <Progress />
                  </Route>
                  <Route path="/learn/:course/:lesson">
                    {(p) => (
                      <Learning
                        user={user!}
                        courseId={p.course}
                        lessonId={p.lesson}
                      />
                    )}
                  </Route>
                  <Route path="/learn/:course">
                    {(p) => <Learning user={user!} courseId={p.course} />}
                  </Route>
                  <Route path="/learn">
                    <Learning user={user!} />
                  </Route>
                  <Route path="/studio/:kind">
                    {(p) =>
                      ["design", "3d", "image", "video", "notes"].includes(
                        p.kind,
                      ) ? (
                        <Studio
                          key={location + window.location.search}
                          user={user!}
                          kind={p.kind as "design"}
                        />
                      ) : (
                        <Missing />
                      )
                    }
                  </Route>
                  <Route path="/projects">
                    <Projects user={user!} />
                  </Route>
                  <Route path="/portfolio">
                    <Projects user={user!} portfolio />
                  </Route>
                  <Route path="/marketplace">
                    <Marketplace />
                  </Route>
                  <Route path="/settings">
                    <Settings user={user!} onUser={setUser} />
                  </Route>
                  <Route path="/onboarding">
                    <Settings user={user!} onUser={setUser} />
                  </Route>
                  <Route path="/notifications">
                    <Notifications />
                  </Route>
                  <Route path="/admin">
                    <Admin />
                  </Route>
                  <Route>
                    <Missing />
                  </Route>
                </Switch>
              </Suspense>
            </ErrorBoundary>
          )}
        </main>
        <footer>
          © {new Date().getFullYear()} Creative School ·{" "}
          {t(
            L(
              "Учиться. Создавать. Делиться.",
              "Learn. Create. Share.",
              "Оқу. Жасау. Бөлісу.",
            ),
          )}
        </footer>
      </div>
    </div>
  );
}
function Missing() {
  const { t } = useLocale();
  return (
    <section>
      <h1>404</h1>
      <p>{t(L("Страница не найдена", "Page not found", "Бет табылмады"))}</p>
      <Link href="/dashboard">
        {t(L("В кабинет", "Open workspace", "Кеңістікке өту"))} →
      </Link>
    </section>
  );
}
function Admin() {
  const { t } = useLocale(),
    [data, setData] = useState<Record<string, number> | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    void api<Record<string, number>>("/admin")
      .then(setData)
      .catch((e) => setError(t(message(e))));
  }, []);
  return (
    <section>
      <h1>{t(L("Администрирование", "Administration", "Әкімшілік"))}</h1>
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </section>
  );
}
function Landing() {
  const { t } = useLocale();
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">THE NEXT THING YOU MAKE STARTS HERE</p>
          <h1>
            {t(
              L(
                "Идеи становятся\nвашими работами.",
                "Turn your ideas\ninto your next work.",
                "Идеяларыңыз\nтуындыға айналсын.",
              ),
            )}
          </h1>
          <p>
            {t(
              L(
                "Практическое обучение, творческие студии и портфолио — в одном пространстве. На русском, английском и казахском.",
                "Practical learning, creative studios and your portfolio in one workspace. In Russian, English and Kazakh.",
                "Тәжірибелік оқу, шығармашылық студиялар мен портфолио — бір кеңістікте. Қазақша, орысша және ағылшынша.",
              ),
            )}
          </p>
          <div className="row">
            <Link href="/auth" className="primary-link">
              {t(L("Начать создавать", "Start creating", "Жасауды бастау"))} ↗
            </Link>
            <a href="#studios">
              {t(
                L(
                  "Посмотреть возможности",
                  "Explore the tools",
                  "Құралдарды көру",
                ),
              )}{" "}
              ↓
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>8</strong>
              {t(L("направлений", "learning paths", "оқу бағыты"))}
            </div>
            <div>
              <strong>32</strong>
              {t(L("уроков", "lessons", "сабақ"))}
            </div>
            <div>
              <strong>4</strong>
              {t(L("студии", "studios", "студия"))}
            </div>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="art-circle" />
          <div className="art-block" />
          <span className="art-label">
            YOUR NEXT
            <br />
            BIG IDEA.
          </span>
          <span className="art-note">DESIGN · MODEL · EDIT · MAKE</span>
        </div>
      </section>
      <section id="studios">
        <p className="eyebrow">FROM FIRST SKETCH TO FINISHED WORK</p>
        <h2 className="large-heading">
          {t(
            L(
              "Ваш набор инструментов.",
              "Your creative toolkit.",
              "Шығармашылық құралдарыңыз.",
            ),
          )}
        </h2>
        <div className="grid2">
          {items
            .filter((i) => i.href.startsWith("/studio/"))
            .map(({ href, label, icon: Icon }, i) => (
              <article className="card tool-card" key={href}>
                <Icon size={35} />
                <h3>{t(label)}</h3>
                <p>
                  {t(
                    [
                      L(
                        "Фигуры, текст, слои, шаблоны и экспорт PNG/SVG.",
                        "Shapes, type, layers, templates and PNG/SVG export.",
                        "Пішін, мәтін, қабат, үлгі және PNG/SVG экспорты.",
                      ),
                      L(
                        "Примитивы, трансформации, материалы, свет и экспорт сцены.",
                        "Primitives, transforms, materials, light and scene export.",
                        "Примитив, түрлендіру, материал, жарық және сахна экспорты.",
                      ),
                      L(
                        "Кадрирование, поворот, коррекция цвета и PNG.",
                        "Crop, rotation, color adjustments and PNG.",
                        "Қию, бұру, түсті түзету және PNG.",
                      ),
                      L(
                        "Обрезка, порядок клипов, титры, звук и WebM.",
                        "Trim, clip order, titles, audio and WebM.",
                        "Қию, клип реті, титр, дыбыс және WebM.",
                      ),
                    ][i],
                  )}
                </p>
                <Link href={href}>
                  {t(L("Открыть студию", "Open studio", "Студияны ашу"))} ↗
                </Link>
              </article>
            ))}
        </div>
      </section>
    </>
  );
}
export default function App() {
  return (
    <LocaleProvider>
      <Platform />
    </LocaleProvider>
  );
}
