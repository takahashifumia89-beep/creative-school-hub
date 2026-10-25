import { useEffect, useState } from 'react';
import { ArrowRight, Box, Check, Flame, Heart, Layers3, Lightbulb, Moon, Palette, Plus, Share2, Sun, Trophy, Users } from 'lucide-react';
import { Link } from 'wouter';
import { PageIntro } from '@/features/shared/PageIntro';
import { Logo } from '@/features/shared/Logo';
import { getCurrentUser, type Profile, type Project } from '@/lib/api';
import { createProject, fetchProfile, fetchProjects } from '@/lib/api';

export function LandingPage({ isDark, onTheme }: { isDark: boolean; onTheme: () => void }) {
  return <main className={`min-h-[100dvh] overflow-hidden ${isDark ? 'bg-[#121310] text-[#f3f0e7]' : 'bg-background text-foreground'}`}>
    <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: isDark ? 'radial-gradient(circle at 72% 25%, hsl(70 80% 55% / .16), transparent 28%), linear-gradient(90deg, transparent 49.9%, hsl(42 34% 93% / .08) 50%, transparent 50.1%)' : 'radial-gradient(circle at 72% 25%, hsl(70 80% 47% / .12), transparent 28%), linear-gradient(90deg, transparent 49.9%, hsl(36 18% 13% / .06) 50%, transparent 50.1%)', backgroundSize: 'auto, 96px 96px' }} />
    <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12 lg:px-16"><Logo light={isDark} /><div className="flex items-center gap-3"><button onClick={onTheme} aria-label={isDark ? 'Включить дневной режим' : 'Включить ночной режим'} aria-pressed={isDark} className={`grid h-9 w-9 place-items-center rounded-full border ${isDark ? 'border-white/20' : 'border-border'}`}>{isDark ? <Sun size={15} /> : <Moon size={15} />}</button><Link href="/auth" className="text-sm text-muted-foreground hover:text-primary">Войти</Link><Link href="/auth?mode=up" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Начать <ArrowRight className="ml-1 inline" size={14} /></Link></div></header>
    <section className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-12 px-6 pb-20 pt-16 sm:px-12 lg:grid-cols-[1.08fr_.92fr] lg:px-16 lg:pb-32 lg:pt-24">
      <div><div className="mb-7 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary"><span className="h-px w-8 bg-primary" />Пространство для творчества</div><h1 className="max-w-3xl font-display text-[clamp(3.8rem,8vw,8.4rem)] font-medium leading-[.88] tracking-[-.08em]">Место для<br /><span className="text-primary">ваших идей.</span></h1><p className={`mt-9 max-w-md text-base leading-relaxed sm:text-lg ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>Учитесь новому, пробуйте, находите единомышленников и превращайте творческие идеи в проекты.</p><div className="mt-9 flex flex-wrap items-center gap-3"><Link href="/auth?mode=up" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Создать аккаунт <ArrowRight className="ml-2 inline" size={16} /></Link><Link href="/auth" className={`rounded-full border px-5 py-3 text-sm ${isDark ? 'border-white/20 text-white/80' : 'border-border text-muted-foreground'}`}>Открыть пространство</Link></div></div>
      <div className="relative min-h-[360px] sm:min-h-[440px]"><div className={`absolute right-2 top-4 h-[70%] w-[74%] rotate-[-6deg] border border-primary/40 p-5 shadow-[16px_18px_0_hsl(15_70%_67%/.4)] ${isDark ? 'bg-[#1b1e17]' : 'bg-card'}`}><div className="flex justify-between font-mono-ui text-[9px] uppercase tracking-widest text-primary"><span>Заметка / 01</span><span>01 / 04</span></div><div className={`mt-12 text-right font-display text-[clamp(3rem,7vw,6.5rem)] leading-[.82] tracking-[-.08em] ${isDark ? 'text-[#f3f0e7]' : 'text-foreground'}`}>смотри<br /><em className="text-secondary">внимательнее.</em></div><p className={`absolute bottom-5 left-5 right-5 border-t pt-3 text-[10px] leading-relaxed ${isDark ? 'border-white/15 text-white/55' : 'border-border text-muted-foreground'}`}>Замечайте то, мимо чего другие проходят.</p></div><div className="absolute bottom-1 left-0 w-[60%] rotate-[6deg] bg-accent/80 p-4 text-foreground shadow-[-8px_10px_0_hsl(70_80%_55%/.5)]"><div className="font-mono-ui text-[9px] uppercase">Запись в студии / 07</div><div className="mt-10 grid grid-cols-4 gap-1">{[1,2,3,4,5,6,7,8].map((item) => <div key={item} className={`h-8 ${item % 3 === 0 ? 'bg-secondary' : item % 2 ? 'bg-foreground/25' : 'bg-foreground'}`} />)}</div><div className="mt-3 font-display text-lg">Практика, а не бесконечная лента.</div></div></div>
    </section>
    <section className={`relative z-10 border-y px-6 py-10 sm:px-12 lg:px-16 ${isDark ? 'border-white/10' : 'border-border'}`}><div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-3">{[['01', 'Учитесь у практиков', 'Разбирайте идеи и осваивайте новые приёмы.'], ['02', 'Создавайте регулярно', 'Работайте над своими проектами в удобном ритме.'], ['03', 'Показывайте результат', 'Соберите портфолио из работ, которыми гордитесь.']].map(([number, title, description]) => <div key={number}><div className="font-display text-4xl tracking-[-.06em]">{number}</div><h2 className="mt-3 font-display text-xl">{title}</h2><p className={`mt-2 max-w-[240px] text-sm leading-relaxed ${isDark ? 'text-white/55' : 'text-muted-foreground'}`}>{description}</p></div>)}</div></section>
    <footer className="relative z-10 flex justify-between px-6 py-8 text-xs sm:px-12 lg:px-16"><span>© 2026 Creative School</span><span className="font-mono-ui uppercase tracking-wider">Для любознательных</span></footer>
  </main>;
}

export function PortfolioPage({ onToast }: { onToast: (text: string) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) return;
      const [p, list] = await Promise.all([fetchProfile(user.id), fetchProjects(user.id)]);
      setProfile(p.data);
      setProjects(list.data.filter((item) => item.status === 'published'));
    });
  }, []);
  const name = profile?.display_name || 'Ваше имя';
  return <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <PageIntro eyebrow="Подборка ваших работ" title="Портфолио." description="Расскажите о себе и покажите проекты, которыми хотите поделиться." action={<button onClick={() => { void navigator.clipboard?.writeText(window.location.href); onToast('Ссылка скопирована. Портфолио пока доступно только в этом браузере.'); }} className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold"><Share2 className="mr-2 inline" size={14} /> Скопировать ссылку</button>} />
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><h2 className="font-display text-3xl tracking-[-.05em]">{name}</h2><p className="mt-2 font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Творческий профиль</p><p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">{profile?.bio || 'Добавьте описание в профиле и расскажите, что вам интересно создавать.'}</p></div><div className="text-left sm:text-right"><div className="font-display text-3xl">{projects.length}</div><div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Опубликованных проектов</div></div></div></section>
    <div className="mb-4 mt-8 flex items-center justify-between"><h2 className="font-display text-2xl tracking-[-.05em]">Опубликованные проекты</h2><Link href="/projects" className="text-xs font-semibold text-primary">Управлять проектами <ArrowRight className="ml-1 inline" size={13} /></Link></div>
    {projects.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.map((project, index) => <article key={project.id} className={`min-h-56 rounded-2xl p-5 ${index % 2 ? 'bg-accent/55' : 'bg-secondary/55'}`}><div className="font-mono-ui text-[10px] uppercase tracking-widest">Проект / {String(index + 1).padStart(2, '0')}</div><h3 className="mt-20 font-display text-3xl tracking-[-.05em]">{project.title}</h3><p className="mt-2 text-xs">{project.description}</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"><p className="font-display text-xl">Портфолио пока пусто</p><p className="mt-2 text-sm text-muted-foreground">Опубликуйте проект, чтобы он появился в этой подборке.</p></div>}
  </div>;
}

export function StudioPage({ kind, onToast }: { kind: 'design' | '3d'; onToast: (text: string) => void }) {
  const is3d = kind === '3d';
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [saving, setSaving] = useState(false);
  async function saveDraft() {
    if (!title.trim()) {
      onToast('Сначала укажите название проекта.');
      return;
    }
    setSaving(true);
    const { user } = await getCurrentUser();
    if (!user) {
      setSaving(false);
      onToast('Войдите, чтобы сохранить проект.');
      return;
    }
    const result = await createProject(user.id, { title: title.trim(), description: brief.trim() || null, category: is3d ? '3D и моделирование' : 'Дизайн' });
    setSaving(false);
    if (result.error) {
      onToast(result.error);
      return;
    }
    onToast('Черновик сохранён в разделе «Проекты».');
  }
  return <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <PageIntro eyebrow={is3d ? 'Творческая студия' : 'Рабочая область'} title={is3d ? '3D-студия.' : 'Дизайн-студия.'} description={is3d ? 'Опишите будущую сцену и сохраните идею как проект. Полноценный 3D-редактор пока не входит в эту версию.' : 'Соберите идею, зафиксируйте направление и сохраните черновик на этом устройстве.'} />
    <div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
      <section className="studio-grid relative grid min-h-[440px] place-items-center overflow-hidden rounded-2xl border border-border bg-card p-8">
        {is3d ? <div className="text-center"><div className="mx-auto mb-7 grid h-36 w-36 place-items-center rounded-full border border-primary/40 bg-primary/10"><div className="h-20 w-20 rotate-45 border-2 border-primary bg-primary/20 shadow-[12px_10px_0_hsl(var(--secondary)/.4)]" /></div><div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">Предпросмотр сцены</div><h2 className="mt-3 font-display text-3xl">Идея начинается с описания.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Моделирование и 3D-рендеринг пока недоступны. Здесь можно сформулировать задачу и сохранить её для продолжения.</p></div> : <div className="relative aspect-[4/3] w-full max-w-xl border border-border bg-accent/50 p-7 text-foreground shadow-[12px_14px_0_hsl(var(--secondary)/.35)]"><div className="absolute right-7 top-7 h-24 w-24 rounded-full border-[16px] border-secondary/70" /><div className="absolute bottom-7 left-7"><div className="font-mono-ui text-[9px] uppercase tracking-widest">Визуальный этюд</div><div className="mt-3 font-display text-5xl leading-[.85] tracking-[-.08em]">Создайте<br /><em>своё.</em></div></div></div>}
      </section>
      <aside className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">{is3d ? <Box size={14} /> : <Layers3 size={14} />}{is3d ? 'Описание сцены' : 'Новый черновик'}</div><label className="mt-5 block text-xs font-medium">Название проекта<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, «Тихий свет»" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label><label className="mt-4 block text-xs font-medium">Идея и заметки<textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Что вы хотите создать?" rows={6} className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" /></label><button disabled={saving} onClick={() => void saveDraft()} className="mt-5 w-full rounded-lg bg-primary py-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Сохраняем…' : 'Сохранить в проекты'}</button><p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Черновик сохранится только в браузере этого устройства.</p></aside>
    </div>
  </div>;
}

const marketItems = [
  { id: 'textures', title: 'Материалы и фактуры', maker: 'Ния Като', price: '1 600 ₽', tag: 'Фактуры', icon: Palette },
  { id: 'type', title: 'Набор выразительных шрифтов', maker: 'Студия «Тихо»', price: '2 900 ₽', tag: 'Типографика', icon: Layers3 },
  { id: 'prompts', title: 'Неделя творческих заданий', maker: 'Джон Белл', price: '990 ₽', tag: 'Идеи', icon: Lightbulb },
  { id: 'sound', title: 'Библиотека городских звуков', maker: 'Мара М.', price: '2 200 ₽', tag: 'Звук', icon: Box },
];

export function MarketplacePage({ onToast }: { onToast: (text: string) => void }) {
  const [filter, setFilter] = useState('Все');
  const [favorites, setFavorites] = useState<string[]>([]);
  const filters = ['Все', 'Фактуры', 'Типографика', 'Идеи', 'Звук'];
  const visible = marketItems.filter((item) => filter === 'Все' || item.tag === filter);
  return <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><PageIntro eyebrow="Инструменты для творчества" title="Магазин." description="Подборка ресурсов и материалов от авторов сообщества. Покупки здесь демонстрационные — оплата не подключена." action={<button onClick={() => onToast('Приём заявок для авторов появится позже.')} className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold"><Plus className="mr-2 inline" size={14} /> Предложить ресурс</button>} /><div className="mb-6 flex gap-2 overflow-auto">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${filter === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'}`}>{item}</button>)}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{visible.map((item) => { const Icon = item.icon; return <article key={item.id} className="rounded-2xl border border-border bg-card p-3"><div className="relative grid h-40 place-items-center overflow-hidden rounded-xl bg-accent/45"><Icon size={42} className="text-foreground/70" /><button aria-label="Добавить в избранное" onClick={() => setFavorites((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80">{favorites.includes(item.id) ? <Heart size={15} fill="currentColor" className="text-secondary" /> : <Heart size={15} />}</button></div><div className="px-1 pb-1 pt-4"><h2 className="font-display text-xl leading-tight">{item.title}</h2><div className="mt-2 text-xs text-muted-foreground">Автор: {item.maker}</div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="font-mono-ui text-[10px] text-muted-foreground">{item.tag}</span><span className="font-mono-ui text-sm">{item.price}</span></div><button onClick={() => onToast('Это демонстрационный каталог: оплата не подключена.')} className="mt-3 w-full rounded-lg bg-foreground py-2.5 text-xs font-semibold text-background">Подробнее</button></div></article>; })}</div></div>;
}

export function AchievementsPage({ onToast }: { onToast: (text: string) => void }) {
  const achievements = [
    ['Первая неделя', 'Занимайтесь творчеством несколько дней подряд.', '+120 XP', Flame],
    ['Внимательный взгляд', 'Завершите упражнение по визуальному анализу.', '+80 XP', Palette],
    ['В мире идей', 'Опубликуйте свой первый проект.', '+160 XP', Share2],
    ['Щедрый коллега', 'Поделитесь полезным отзывом.', '+60 XP', Users],
  ] as const;
  return <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><PageIntro eyebrow="Ваши результаты" title="Достижения." description="Не соревнование, а заметки о шагах, которые помогают вам двигаться вперёд." action={<button onClick={() => { localStorage.setItem('creative-school:challenge', new Date().toISOString()); onToast('Задание дня отмечено. Выделите 20 минут на творчество.'); }} className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"><Trophy className="mr-2 inline" size={14} /> Задание дня</button>} /><div className="grid gap-4 sm:grid-cols-2">{achievements.map(([title, description, xp, Icon]) => <div key={title} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon size={19} /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><span className="font-mono-ui text-[10px] text-primary">{xp}</span><Check size={16} className="text-primary" /></div>)}</div><div className="mt-6 rounded-2xl border border-border bg-card p-6"><h2 className="font-display text-2xl">Практика важнее гонки.</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Прогресс сохраняется в браузере. Начните с небольшого шага и отмечайте, что получилось.</p></div></div>;
}
