import { SessionProvider, useSession } from "@/platform/session";
import { PageLoading } from "@/platform/PageLoading";
import { LanguageSwitcher, L, useLocale } from "@/platform/locale";
import { lockScroll } from "@/platform/Dialog";
import {
  loadSpark,
  loadDashboard,
  loadProjects,
  loadPortfolio,
  loadLearning,
  loadStudio,
  loadMarket,
  prefetchRoute,
} from "@/platform/route-loading";
import "@/platform/experience.css";
import { useCopy } from "@/platform/copy";
import { type ReactNode, useRef, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  CircleCheck,
  Compass,
  Eye,
  Flame,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Palette,
  Box,
  Bell,
  Search,
  ShoppingBag,
  Camera,
  Clapperboard,
  Sparkles,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { PageIntro } from "@/features/shared/PageIntro";
import { AuthGate } from "@/components/auth-gate";
import { RoleGate } from "@/components/role-gate";
import { AuthPage } from "@/features/auth/AuthPage";
import { NotificationCenter } from "@/features/notifications/NotificationCenter";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { LandingPage } from "@/features/shared/RussianPages";
import { AchievementsPage } from "@/features/achievements/AchievementsPage";
import { LocaleProvider } from "@/platform/locale";
import { lazy, Suspense } from "react";
import { api, type User } from "@/platform/client";
import { authChanged } from "@/lib/api";
import "@/platform/platform.css";
const Settings = lazy(() =>
    import("@/platform/Account").then((m) => ({ default: m.Settings })),
  ),
  PublicPage = lazy(() =>
    import("@/platform/Pages").then((m) => ({ default: m.PublicPage })),
  );
const SparkPage = lazy(loadSpark),
  LearningPage = lazy(loadLearning),
  StudioPage = lazy(loadStudio),
  DashboardPage = lazy(() =>
    loadDashboard().then((m) => ({ default: m.DashboardPage })),
  ),
  ProjectsPage = lazy(() =>
    loadProjects().then((m) => ({ default: m.ProjectsPage })),
  ),
  PortfolioPage = lazy(() =>
    loadPortfolio().then((m) => ({ default: m.PortfolioPage })),
  ),
  MarketplacePage = lazy(loadMarket),
  CommandPalette = lazy(() => import("@/platform/CommandPalette"));
function WithUser({ children }: { children: (user: User) => ReactNode }) {
  const { user, error, refresh } = useSession(),
    { t } = useLocale();
  return user ? (
    <>{children(user)}</>
  ) : error ? (
    <div className="cs-inline-error" role="alert">
      {t(error)}
      <button onClick={() => void refresh()}>
        {t(L("Повторить", "Retry", "Қайталау"))}
      </button>
    </div>
  ) : (
    <PageLoading />
  );
}

import { fetchStats, signOut, type Stats } from "@/lib/api";
const navGroups = [
  {
    label: "Рабочее пространство",
    items: [
      { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
      { href: "/spark", label: "Искра", icon: Sparkles },
      { href: "/learn", label: "Обучение", icon: Compass },
      { href: "/projects", label: "Проекты", icon: FolderKanban },
      { href: "/portfolio", label: "Портфолио", icon: Eye },
    ],
  },
  {
    label: "Студии",
    items: [
      { href: "/studio/design", label: "Дизайн-студия", icon: Palette },
      { href: "/studio/3d", label: "3D-студия", icon: Box },
      { href: "/studio/image", label: "Фото-студия", icon: Camera },
      { href: "/studio/video", label: "Видеомонтаж", icon: Clapperboard },
      { href: "/marketplace", label: "Магазин", icon: ShoppingBag },
    ],
  },
  {
    label: "Прогресс",
    items: [
      { href: "/achievements", label: "Достижения", icon: Trophy },
      { href: "/notifications", label: "Уведомления", icon: Bell },
      { href: "/settings", label: "Настройки", icon: Menu },
    ],
  },
];
function Logo({ light = false }: { light?: boolean }) {
  const tx = useCopy();
  return (
    <Link
      href="/"
      data-testid="link-brand"
      className={`flex items-center gap-2.5 ${light ? "text-[#f2efe5]" : "text-foreground"}`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-primary text-primary-foreground shadow-sm">
        <Sparkles size={16} strokeWidth={2.5} />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-[-.04em]">
        creative school<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  const tx = useCopy();
  return (
    <button
      data-testid="button-toggle-theme"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={
        isDark ? tx("Включить дневной режим") : tx("Включить ночной режим")
      }
      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
function AppShell({
  children,
  isDark,
  onToggle,
  onToast,
  onSearch,
}: {
  children: ReactNode;
  isDark: boolean;
  onToggle: () => void;
  onToast: (text: string) => void;
  onSearch: () => void;
}) {
  const tx = useCopy(),
    { t } = useLocale(),
    { user } = useSession();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(
      () => window.matchMedia("(min-width:1024px)").matches,
    ),
    menu = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  const profileName = user?.user_metadata.display_name || tx("Мой профиль");
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    const media = window.matchMedia("(min-width:1024px)"),
      change = () => {
        setDesktop(media.matches);
        if (media.matches) setOpen(false);
      };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("cs-open-search", close);
    return () => window.removeEventListener("cs-open-search", close);
  }, []);
  useEffect(() => {
    if (!open || desktop) return;
    const release = lockScroll(),
      previous = document.activeElement as HTMLElement | null;
    const focus = requestAnimationFrame(() =>
      menu.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key !== "Tab") return;
      const elements = Array.from(
        menu.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input,select,[tabindex="0"]',
        ) ?? [],
      ).filter((e) => e.getClientRects().length);
      const first = elements[0],
        last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", key, true);
    return () => {
      cancelAnimationFrame(focus);
      release();
      window.removeEventListener("keydown", key, true);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, desktop]);
  useEffect(() => {
    const controller = new AbortController();
    if (!user) {
      setStats(null);
      return;
    }
    const load = () =>
      void api<Stats>("/stats", "GET", undefined, controller.signal)
        .then(setStats)
        .catch(() => undefined);
    load();
    window.addEventListener("creative-school-stats-change", load);
    return () => {
      controller.abort();
      window.removeEventListener("creative-school-stats-change", load);
    };
  }, [location, user?.id]);
  return (
    <div className="grain min-h-[100dvh] bg-background text-foreground">
      <a href="#workspace-content" className="skip-link">
        {t(L("К содержимому", "Skip to content", "Мазмұнға өту"))}
      </a>
      <aside
        ref={menu}
        id="workspace-menu"
        inert={!desktop && !open ? true : undefined}
        role={!desktop && open ? "dialog" : undefined}
        aria-modal={!desktop && open ? true : undefined}
        aria-label={t(L("Навигация", "Navigation", "Навигация"))}
        data-workspace-sidebar
        className={`fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button
            data-testid="button-close-sidebar"
            aria-label={t(L("Закрыть меню", "Close menu", "Мәзірді жабу"))}
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground lg:hidden"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mt-10 space-y-7 overflow-auto">
          {navGroups.map((group) => (
            <div key={tx(group.label)}>
              <div className="mb-2 px-3 font-mono-ui text-[10px] font-medium uppercase tracking-[.18em] text-muted-foreground">
                {tx(group.label)}
              </div>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    location === item.href ||
                    location.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onPointerEnter={() => prefetchRoute(item.href)}
                      onFocus={() => prefetchRoute(item.href)}
                      aria-current={active ? "page" : undefined}
                      data-testid={`link-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                        <span>{tx(item.label)}</span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-3 pt-5">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">
                {tx("Ритм недели")}
              </span>
              <span className="text-primary">
                <Flame size={14} fill="currentColor" />
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="font-display text-2xl font-semibold">
                {Math.min(stats?.weekDays ?? 0, stats?.weekGoal ?? 5)}
                <span className="text-sm text-muted-foreground">
                  /{stats?.weekGoal ?? 5}
                </span>
              </span>
              <span className="text-right text-[11px] leading-tight text-muted-foreground">
                {tx("дня в")}
                <br />
                {tx("студии")}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, ((stats?.weekDays ?? 0) / (stats?.weekGoal ?? 5)) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {tx("Уровень")}
                {stats?.level ?? 1}
              </span>
              <span>
                {stats?.xp ?? 0} / {stats?.nextLevelXp ?? 100} XP
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{
                  width: `${Math.round((stats?.levelProgress ?? 0) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-display text-xs font-semibold text-secondary-foreground">
              {profileName.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold">
                {profileName}
              </span>
              <span className="block font-mono-ui text-[10px] text-muted-foreground">
                {tx("Мой профиль")}
              </span>
            </span>
            <button
              aria-label={tx("Выйти из аккаунта")}
              onClick={() => {
                void signOut().then((error) =>
                  error ? onToast(error) : setLocation("/auth"),
                );
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          data-testid="button-sidebar-overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          aria-label={t(L("Закрыть меню", "Close menu", "Мәзірді жабу"))}
        />
      )}
      <main
        id="workspace-content"
        inert={!desktop && open ? true : undefined}
        data-workspace-main
        className="min-h-[100dvh] lg:pl-[244px]"
      >
        <header
          data-workspace-header
          className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-md sm:px-8"
        >
          <button
            ref={menuButton}
            aria-controls="workspace-menu"
            aria-expanded={open}
            data-testid="button-open-sidebar"
            onClick={() => setOpen(true)}
            aria-label={tx("Открыть меню")}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu size={19} />
          </button>
          <div className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex">
            <span className="font-mono-ui text-[10px] uppercase tracking-widest">
              {tx("ТВОРЧЕСКАЯ ШКОЛА")}
            </span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>{tx("Создавайте смело.")}</span>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              data-testid="button-search"
              onClick={onSearch}
              aria-label={tx("Поиск")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/60"
            >
              <Search size={14} />
              <span className="hidden sm:inline">{tx("Поиск")}</span>
              <span className="hidden sm:inline font-mono-ui text-[10px] opacity-60">
                ⌘ K
              </span>
            </button>
            <LanguageSwitcher />
            <ThemeToggle isDark={isDark} onToggle={onToggle} />
            <Link
              href="/notifications"
              data-testid="link-header-notifications"
              aria-label={tx("Уведомления")}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
            >
              <Bell size={16} />
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
function Admin() {
  const tx = useCopy(),
    [data, setData] = useState<Record<string, number> | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    void api<Record<string, number>>("/admin")
      .then(setData)
      .catch(() => setError(tx("Доступ только для администратора")));
  }, []);
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow="Управление"
        title="Администрирование."
        description=""
      />
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {data &&
            Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-xs text-muted-foreground">
                  {tx(
                    key === "users"
                      ? "Пользователи"
                      : key === "projects"
                        ? "Проекты"
                        : "Уроки",
                  )}
                </p>
                <p className="mt-4 font-display text-4xl">{value}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const tx = useCopy();
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  const tx = useCopy();
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("creative-school-theme");
    } catch {}
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [toast, setToast] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSearch = () => {
    window.dispatchEvent(new Event("cs-open-search"));
    setSearchOpen(true);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k" &&
        !e.isComposing
      ) {
        e.preventDefault();
        window.dispatchEvent(new Event("cs-open-search"));
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    try {
      localStorage.setItem("creative-school-theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);
  const toggleTheme = () => setIsDark((current) => !current);
  const notify = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  const publicRoute =
    location === "/" ||
    location === "/spark" ||
    location === "/auth" ||
    location.startsWith("/u/") ||
    location.startsWith("/p/");
  const content = (
    <RoutedErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <Switch>
          <Route path="/">
            {() => <LandingPage onTheme={toggleTheme} isDark={isDark} />}
          </Route>
          <Route path="/spark">
            {() => (
              <>
                <header className="spark-public-header">
                  <Logo />
                  <div>
                    <Link href="/dashboard" className="spark-workspace-link">
                      {tx("Обзор")}
                    </Link>
                    <LanguageSwitcher />
                    <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                  </div>
                </header>
                <SparkPage />
              </>
            )}
          </Route>
          <Route path="/auth">{() => <AuthPage onToast={notify} />}</Route>
          <Route path="/onboarding">
            {() => <OnboardingPage onToast={notify} />}
          </Route>
          <Route path="/dashboard">
            {() => <DashboardPage onToast={notify} />}
          </Route>
          <Route path="/u/:id">
            {(p) => (
              <div className="platform">
                <div className="cs-public-header">
                  <Logo />
                  <LanguageSwitcher />
                </div>
                <PublicPage kind="profiles" id={p.id} />
              </div>
            )}
          </Route>
          <Route path="/p/:id">
            {(p) => (
              <div className="platform">
                <div className="cs-public-header">
                  <Logo />
                  <LanguageSwitcher />
                </div>
                <PublicPage kind="projects" id={p.id} />
              </div>
            )}
          </Route>
          <Route path="/settings">
            <WithUser>
              {(user) => (
                <div className="platform">
                  <Settings user={user} onUser={() => authChanged()} />
                </div>
              )}
            </WithUser>
          </Route>
          <Route path="/learn/:course/:lesson">
            {(p) => (
              <WithUser>
                {(user) => (
                  <LearningPage
                    user={user}
                    courseId={p.course}
                    lessonId={p.lesson}
                  />
                )}
              </WithUser>
            )}
          </Route>
          <Route path="/learn/:course">
            {(p) => (
              <WithUser>
                {(user) => <LearningPage user={user} courseId={p.course} />}
              </WithUser>
            )}
          </Route>
          <Route path="/studio/image">
            <WithUser>
              {(user) => <StudioPage key="image" user={user} kind="image" />}
            </WithUser>
          </Route>
          <Route path="/studio/video">
            <WithUser>
              {(user) => <StudioPage key="video" user={user} kind="video" />}
            </WithUser>
          </Route>
          <Route path="/studio/notes">
            <WithUser>
              {(user) => <StudioPage key="notes" user={user} kind="notes" />}
            </WithUser>
          </Route>
          <Route path="/learn">
            {() => (
              <WithUser>{(user) => <LearningPage user={user} />}</WithUser>
            )}
          </Route>
          <Route path="/studio/design">
            {() => (
              <WithUser>
                {(user) => (
                  <StudioPage key="design" user={user} kind="design" />
                )}
              </WithUser>
            )}
          </Route>
          <Route path="/studio/3d">
            {() => (
              <WithUser>
                {(user) => <StudioPage key="3d" user={user} kind="3d" />}
              </WithUser>
            )}
          </Route>
          <Route path="/projects">
            {() => <ProjectsPage onToast={notify} />}
          </Route>
          <Route path="/portfolio">
            {() => <PortfolioPage onToast={notify} />}
          </Route>
          <Route path="/marketplace">{() => <MarketplacePage />}</Route>
          <Route path="/achievements">
            {() => <AchievementsPage onToast={notify} />}
          </Route>
          <Route path="/notifications">
            {() => <NotificationCenter onToast={notify} />}
          </Route>
          <Route path="/admin">
            {() => (
              <RoleGate role="admin">
                <Admin />
              </RoleGate>
            )}
          </Route>
          <Route>
            {() => (
              <div className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center">
                <div>
                  <div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">
                    {tx("404 / не та страница")}
                  </div>
                  <h1 className="mt-4 font-display text-5xl tracking-[-.08em]">
                    {tx("Продолжим искать.")}
                  </h1>
                  <Link
                    href="/dashboard"
                    className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground"
                  >
                    {tx("Вернуться в пространство")}
                  </Link>
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </Suspense>
    </RoutedErrorBoundary>
  );
  return (
    <>
      {publicRoute ? (
        content
      ) : location === "/onboarding" ? (
        <AuthGate>{content}</AuthGate>
      ) : (
        <AuthGate>
          <AppShell
            isDark={isDark}
            onToggle={toggleTheme}
            onToast={notify}
            onSearch={showSearch}
          >
            {content}
          </AppShell>
        </AuthGate>
      )}
      {searchOpen && (
        <Suspense fallback={<PageLoading />}>
          <CommandPalette onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
      {toast && (
        <div
          data-testid="status-toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-foreground px-4 py-3 text-xs text-background shadow-xl animate-rise"
        >
          <CircleCheck size={15} className="shrink-0 text-primary" />
          {toast}
        </div>
      )}
    </>
  );
}
export default function Root() {
  const tx = useCopy();
  return (
    <LocaleProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </LocaleProvider>
  );
}
