import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CircleCheck, Compass, Eye, Flame, FolderKanban, LayoutDashboard, LogOut, Menu, Moon, Palette, Box, Bell, Search, ShoppingBag, Sparkles, Sun, Trophy, X } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';
import { AuthGate } from '@/components/auth-gate';
import { RoleGate } from '@/components/role-gate';
import { AuthPage } from '@/features/auth/AuthPage';
import { NotificationCenter } from '@/features/notifications/NotificationCenter';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LearningPage } from '@/features/learn/LearningPage';
import { AchievementsPage, LandingPage, MarketplacePage, PortfolioPage, StudioPage } from '@/features/shared/RussianPages';
import { fetchStats, getCurrentUser, onAuthChange, signOut, type Stats } from '@/lib/api';

const queryClient = new QueryClient();

const navGroups = [
  { label: 'Рабочее пространство', items: [
    { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
    { href: '/learn', label: 'Обучение', icon: Compass },
    { href: '/projects', label: 'Проекты', icon: FolderKanban },
    { href: '/portfolio', label: 'Портфолио', icon: Eye },
  ]},
  { label: 'Студии', items: [
    { href: '/studio/design', label: 'Дизайн-студия', icon: Palette },
    { href: '/studio/3d', label: '3D-студия', icon: Box },
    { href: '/marketplace', label: 'Магазин', icon: ShoppingBag },
  ]},
  { label: 'Прогресс', items: [
    { href: '/achievements', label: 'Достижения', icon: Trophy },
    { href: '/notifications', label: 'Уведомления', icon: Bell },
  ]},
];

function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" data-testid="link-brand" className={`flex items-center gap-2.5 ${light ? 'text-[#f2efe5]' : 'text-foreground'}`}>
    <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-primary text-primary-foreground shadow-sm"><Sparkles size={16} strokeWidth={2.5} /></span>
    <span className="font-display text-[17px] font-semibold tracking-[-.04em]">creative school<span className="text-primary">.</span></span>
  </Link>;
}

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return <button data-testid="button-toggle-theme" onClick={onToggle} aria-pressed={isDark} aria-label={isDark ? 'Включить дневной режим' : 'Включить ночной режим'} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground">
    {isDark ? <Sun size={16} /> : <Moon size={16} />}
  </button>;
}

function AppShell({ children, isDark, onToggle, onToast }: { children: ReactNode; isDark: boolean; onToggle: () => void; onToast: (text: string) => void }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState('Мой профиль');
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    const load = () => { void getCurrentUser().then(({ user }) => { if (user) void fetchStats().then((r) => setStats(r.data)); else setStats(null); }); };
    load();
    window.addEventListener('creative-school-stats-change', load);
    return () => window.removeEventListener('creative-school-stats-change', load);
  }, [location]);
  useEffect(() => {
    const updateName = (user: { user_metadata: { display_name: string } } | null) => {
      if (user?.user_metadata.display_name) setProfileName(user.user_metadata.display_name);
    };
    void getCurrentUser().then(({ user }) => updateName(user));
    return onAuthChange(updateName);
  }, []);
  return <div className="grain min-h-[100dvh] bg-background text-foreground">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2"><Logo /><button data-testid="button-close-sidebar" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground lg:hidden"><X size={17} /></button></div>
      <div className="mt-10 space-y-7 overflow-auto">
        {navGroups.map(group => <div key={group.label}>
          <div className="mb-2 px-3 font-mono-ui text-[10px] font-medium uppercase tracking-[.18em] text-muted-foreground">{group.label}</div>
          <nav className="space-y-1">
            {group.items.map(item => { const active = location === item.href; const Icon = item.icon; return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setOpen(false)} className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
              <span className="flex items-center gap-3"><Icon size={16} strokeWidth={active ? 2.5 : 1.8} /><span>{item.label}</span></span>
            </Link>; })}
          </nav>
        </div>)}
      </div>
      <div className="mt-auto space-y-3 pt-5">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3.5">
          <div className="mb-2 flex items-center justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">Ритм недели</span><span className="text-primary"><Flame size={14} fill="currentColor" /></span></div>
          <div className="flex items-end justify-between"><span className="font-display text-2xl font-semibold">{Math.min(stats?.weekDays ?? 0, stats?.weekGoal ?? 5)}<span className="text-sm text-muted-foreground">/{stats?.weekGoal ?? 5}</span></span><span className="text-right text-[11px] leading-tight text-muted-foreground">дня в<br />студии</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, ((stats?.weekDays ?? 0) / (stats?.weekGoal ?? 5)) * 100)}%` }} /></div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground"><span>Уровень {stats?.level ?? 1}</span><span>{stats?.xp ?? 0} / {stats?.nextLevelXp ?? 100} XP</span></div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${Math.round((stats?.levelProgress ?? 0) * 100)}%` }} /></div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-display text-xs font-semibold text-secondary-foreground">{profileName.slice(0, 2).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold">{profileName}</span><span className="block font-mono-ui text-[10px] text-muted-foreground">Локальный профиль</span></span>
          <button aria-label="Выйти из аккаунта" onClick={() => { void signOut().then(() => setLocation('/auth')); }} className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
    {open && <button data-testid="button-sidebar-overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" aria-label="Close menu" />}
    <main className="min-h-[100dvh] lg:pl-[244px]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-md sm:px-8">
        <button data-testid="button-open-sidebar" onClick={() => setOpen(true)} aria-label="Открыть меню" className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"><Menu size={19} /></button>
        <div className="hidden items-center gap-2 text-[12px] text-muted-foreground sm:flex"><span className="font-mono-ui text-[10px] uppercase tracking-widest">ТВОРЧЕСКАЯ ШКОЛА</span><span className="h-1 w-1 rounded-full bg-primary" /><span>Создавайте смело.</span></div>
        <div className="ml-auto flex items-center gap-2.5"><button data-testid="button-search" onClick={() => onToast('Поиск скоро появится.')} className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/60 sm:flex"><Search size={14} /> Поиск <span className="font-mono-ui text-[10px] opacity-60">⌘ K</span></button><ThemeToggle isDark={isDark} onToggle={onToggle} /><Link href="/notifications" data-testid="link-header-notifications" aria-label="Уведомления" className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"><Bell size={16} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-secondary" /></Link></div>
      </header>
      {children}
    </main>
  </div>;
}

function Admin() {
  return <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><PageIntro eyebrow="Управление" title="Администрирование." description="В автономной версии управление пользователями и модерация отключены: для них требуется сервер." /><div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-sm text-muted-foreground">Локальный профиль и данные браузера не дают безопасно назначать роли или модерировать общий контент.</div></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }

function App() {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('creative-school-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [toast, setToast] = useState('');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('creative-school-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  const toggleTheme = () => setIsDark((current) => !current);
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2800); };
  const publicRoute = location === '/' || location === '/auth';
  const content = <RoutedErrorBoundary><Switch>
    <Route path="/">{() => <LandingPage onTheme={toggleTheme} isDark={isDark} />}</Route>
    <Route path="/auth">{() => <AuthPage onToast={notify} />}</Route>
    <Route path="/onboarding">{() => <OnboardingPage onToast={notify} />}</Route>
    <Route path="/dashboard">{() => <DashboardPage onToast={notify} />}</Route>
    <Route path="/learn">{() => <LearningPage onToast={notify} />}</Route>
    <Route path="/studio/design">{() => <StudioPage kind="design" onToast={notify} />}</Route>
    <Route path="/studio/3d">{() => <StudioPage kind="3d" onToast={notify} />}</Route>
    <Route path="/projects">{() => <ProjectsPage onToast={notify} />}</Route>
    <Route path="/portfolio">{() => <PortfolioPage onToast={notify} />}</Route>
    <Route path="/marketplace">{() => <MarketplacePage onToast={notify} />}</Route>
    <Route path="/achievements">{() => <AchievementsPage onToast={notify} />}</Route>
    <Route path="/notifications">{() => <NotificationCenter onToast={notify} />}</Route>
    <Route path="/admin">{() => <RoleGate role="admin"><Admin /></RoleGate>}</Route>
    <Route>{() => <div className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center"><div><div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">404 / не та страница</div><h1 className="mt-4 font-display text-5xl tracking-[-.08em]">Продолжим искать.</h1><Link href="/dashboard" className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground">Вернуться в пространство</Link></div></div>}</Route>
  </Switch></RoutedErrorBoundary>;
  return <QueryClientProvider client={queryClient}><TooltipProvider>{publicRoute ? content : location === '/onboarding' ? <AuthGate>{content}</AuthGate> : <AuthGate><AppShell isDark={isDark} onToggle={toggleTheme} onToast={notify}>{content}</AppShell></AuthGate>}<Toaster />{toast && <div data-testid="status-toast" className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-foreground px-4 py-3 text-xs text-background shadow-xl animate-rise"><CircleCheck size={15} className="shrink-0 text-primary" />{toast}</div>}</TooltipProvider></QueryClientProvider>;
}

export default App;