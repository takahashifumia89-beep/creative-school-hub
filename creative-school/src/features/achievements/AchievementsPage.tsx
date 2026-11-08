import { useEffect, useState } from 'react';
import { Award, Check, Flame, FolderKanban, GraduationCap, Rocket, Trophy } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';
import { fetchProgress, fetchStats, getCurrentUser, type Stats } from '@/lib/api';

type Badge = { title: string; text: string; xp: string; icon: typeof Flame; ok: (s: Stats, lessons: number) => boolean; now: (s: Stats, lessons: number) => string };
const badges: Badge[] = [
  { title: 'Первая неделя', text: 'Занимайтесь творчеством 3 дня подряд.', xp: 'Серия', icon: Flame, ok: (s) => s.streak >= 3, now: (s) => `Серия: ${s.streak} из 3` },
  { title: 'Внимательный взгляд', text: 'Пройдите первый урок.', xp: '+10 XP', icon: GraduationCap, ok: (_, l) => l >= 1, now: (_, l) => `Уроков: ${l} из 1` },
  { title: 'Ученик', text: 'Пройдите 10 уроков.', xp: '+100 XP', icon: Trophy, ok: (_, l) => l >= 10, now: (_, l) => `Уроков: ${l} из 10` },
  { title: 'В мире идей', text: 'Опубликуйте свой первый проект.', xp: '+50 XP', icon: Rocket, ok: (s) => s.projectsPublished >= 1, now: (s) => `Опубликовано: ${s.projectsPublished} из 1` },
  { title: 'Мастерская', text: 'Создайте 3 проекта.', xp: '+60 XP', icon: FolderKanban, ok: (s) => s.projectsTotal >= 3, now: (s) => `Проектов: ${s.projectsTotal} из 3` },
  { title: 'Уровень 3', text: 'Достигните третьего уровня.', xp: '400 XP', icon: Award, ok: (s) => s.level >= 3, now: (s) => `Уровень: ${s.level} из 3` },
];

export function AchievementsPage({ onToast }: { onToast: (text: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lessons, setLessons] = useState(0);
  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) return;
      const [s, p] = await Promise.all([fetchStats(), fetchProgress()]);
      if (s.error) onToast(s.error);
      setStats(s.data); setLessons(p.done.length);
    });
  }, []);
  const got = stats ? badges.filter((b) => b.ok(stats, lessons)).length : 0;
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro eyebrow="Ваши результаты" title="Достижения." description={stats ? `Получено ${got} из ${badges.length}. Уровень ${stats.level}, ${stats.xp} XP, серия ${stats.streak} дн.` : 'Не соревнование, а заметки о шагах, которые помогают вам двигаться вперёд.'} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {badges.map((b) => { const Icon = b.icon, ok = !!stats && b.ok(stats, lessons); return (
          <article key={b.title} className={`rounded-2xl border p-5 ${ok ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${ok ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Icon size={20} /></span><span className="text-xs font-semibold text-muted-foreground">{b.xp}</span></div>
            <h2 className="mt-4 font-display text-xl">{b.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{b.text}</p>
            <p className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${ok ? 'text-green-600' : 'text-muted-foreground'}`}>{ok ? <><Check size={14} /> Получено</> : stats ? b.now(stats, lessons) : '…'}</p>
          </article>); })}
      </div>
    </div>
  );
}
