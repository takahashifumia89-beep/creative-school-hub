import { useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Box, Lightbulb, Palette, Search } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';

const lessons = [
  { title: 'Визуальный язык современности', category: 'Дизайн', level: 'Средний', count: 12, icon: Palette, description: 'Соберите цельный визуальный стиль и научитесь принимать решения, которые поддерживают вашу идею.' },
  { title: 'Объекты с характером', category: '3D и движение', level: 'Продвинутый', count: 8, icon: Box, description: 'Работайте с формой, светом и движением, чтобы создавать выразительные объекты.' },
  { title: 'Портфолио с идеей', category: 'Карьера', level: 'Для всех', count: 6, icon: Lightbulb, description: 'Превратите набор работ в понятное приглашение к сотрудничеству.' },
  { title: 'Редакционное мышление', category: 'Арт-дирекшн', level: 'Начальный', count: 10, icon: Lightbulb, description: 'Принимайте более точные творческие решения и находите сильную основу проекта.' },
];

export function LearningPage({ onToast }: { onToast: (text: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все темы');
  const categories = ['Все темы', 'Дизайн', '3D и движение', 'Карьера', 'Арт-дирекшн'];
  const visible = useMemo(() => lessons.filter((lesson) =>
    (category === 'Все темы' || lesson.category === category)
    && `${lesson.title} ${lesson.category} ${lesson.description}`.toLowerCase().includes(query.toLowerCase()),
  ), [category, query]);
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro eyebrow="Библиотека практики" title="Учитесь с интересом." description="Короткие уроки и творческие упражнения, которые помогают создавать более сильные работы." action={<button onClick={() => onToast('Сохранённые уроки появятся здесь.')} className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold"><Bookmark className="mr-2 inline" size={14} /> Сохранённое</button>} />
      <div className="mb-7 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск уроков и тем…" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary" /></div><div className="flex gap-2 overflow-auto">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-4 text-xs font-semibold transition ${category === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{item}</button>)}</div></div>
      {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"><h2 className="font-display text-2xl">Ничего не найдено</h2><p className="mt-2 text-sm text-muted-foreground">Измените запрос или выберите другую тему.</p></div> : <div className="grid gap-4 md:grid-cols-2">{visible.map((lesson, index) => { const Icon = lesson.icon; return <article key={lesson.title} className="overflow-hidden rounded-2xl border border-border bg-card"><div className={`relative h-40 overflow-hidden p-5 ${index % 2 ? 'bg-accent/50' : 'bg-secondary/45'}`}><div className="absolute -right-4 -top-10 h-44 w-44 rounded-full border-[24px] border-foreground/10" /><div className="relative flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-lg bg-background/70"><Icon size={18} /></span><span className="rounded-full bg-background/70 px-3 py-1 font-mono-ui text-[9px] uppercase">{lesson.level}</span></div><div className="relative mt-12 font-mono-ui text-[10px] uppercase tracking-widest">{lesson.category}</div></div><div className="p-5"><h2 className="font-display text-2xl tracking-[-.05em]">{lesson.title}</h2><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{lesson.description}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="font-mono-ui text-[10px] text-muted-foreground">{lesson.count} уроков · около 2 часов</span><button onClick={() => onToast(`Добавлено в ваш план: «${lesson.title}».`)} className="text-xs font-semibold text-primary">Начать <ArrowRight className="ml-1 inline" size={13} /></button></div></div></article>; })}</div>}
    </div>
  );
}
