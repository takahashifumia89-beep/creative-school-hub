import { useEffect, useState } from 'react';
import { ArrowRight, Flame, FolderKanban, PenLine, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'wouter';
import { PageIntro } from '@/features/shared/PageIntro';
import { getCurrentUser, type Profile, type Project } from '@/lib/api';
import { fetchProfile, fetchProjects, fetchStats, markPractice, type Stats } from '@/lib/api';

export function DashboardPage({ onToast }: { onToast: (text: string) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) return;
      const [profileResult, projectResult, statsResult] = await Promise.all([fetchProfile(user.id), fetchProjects(user.id), fetchStats()]);
      setStats(statsResult.data);
      setProfile(profileResult.data);
      setProjects(projectResult.data);
    });
  }, []);
  const name = profile?.display_name?.split(' ')[0] || 'Творец';
  async function practice() {
    const r = await markPractice();
    if (r.error) { onToast(r.error); return; }
    onToast(r.awarded ? `Практика отмечена: +${r.xp} XP.` : 'Сегодня практика уже отмечена.');
    setStats((await fetchStats()).data);
  }
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro eyebrow="Ваше пространство" title={`Добро пожаловать, ${name}.`} description="Ваши идеи, планы и проекты — в одном месте." action={<button onClick={() => void practice()} className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"><PenLine className="mr-2 inline" size={14} /> Отметить практику</button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <section className="relative overflow-hidden rounded-2xl bg-foreground p-6 text-background md:col-span-2">
          <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border-[24px] border-primary/70" />
          <div className="relative"><div className="font-mono-ui text-[10px] uppercase tracking-widest text-background/55">Ваш следующий шаг</div><h2 className="mt-6 max-w-lg font-display text-4xl leading-[.95] tracking-[-.06em]">Учитесь, пробуйте,<br /><span className="text-primary">создавайте своё.</span></h2><p className="mt-4 max-w-md text-sm text-background/65">Выберите короткий урок и примените новую идею в собственном проекте.</p><Link href="/learn" className="mt-7 inline-flex items-center rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Перейти к обучению <ArrowRight className="ml-2" size={14} /></Link></div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">Ваши проекты</span><FolderKanban className="text-primary" size={17} /></div><div className="mt-7 font-display text-6xl tracking-[-.08em]">{stats?.projectsTotal ?? projects.length}</div><p className="mt-2 text-xs text-muted-foreground">{`Опубликовано: ${stats?.projectsPublished ?? 0} · черновиков: ${(stats?.projectsTotal ?? projects.length) - (stats?.projectsPublished ?? 0)}`}</p><Link href="/projects" className="mt-6 inline-flex items-center text-xs font-semibold text-primary">Открыть проекты <ArrowRight className="ml-2" size={13} /></Link></section>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Link href="/studio/design" className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary"><Sparkles className="text-primary" size={19} /><h3 className="mt-5 font-display text-xl">Дизайн-студия</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Соберите визуальную идею и сохраните направление.</p></Link>
        <Link href="/achievements" className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary"><Trophy className="text-secondary" size={19} /><h3 className="mt-5 font-display text-xl">Достижения</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Отмечайте шаги и продолжайте практику.</p></Link>
        <div className="rounded-2xl border border-border bg-card p-5"><Flame className="text-secondary" size={19} /><h3 className="mt-5 font-display text-xl">Творческий ритм</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{stats ? `Уровень ${stats.level} · ${stats.xp} XP · серия ${stats.streak} дн. До следующего уровня: ${stats.nextLevelXp - stats.xp} XP. На этой неделе: ${stats.weekDays} из ${stats.weekGoal} дней.` : 'Небольшая регулярная практика помогает идеям расти.'}</p></div>
      </div>
      {profile?.bio && <div className="mt-5 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">{profile.bio}</div>}
    </div>
  );
}
