import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Box, Check, Clock, ExternalLink, Film, Lightbulb, Palette, Search } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';
import { completeLesson, fetchProgress, getCurrentUser } from '@/lib/api';
import { courses, type Course, type Lesson } from './courses';

const icons = { palette: Palette, box: Box, lightbulb: Lightbulb, film: Film };
const categories = ['Все темы', 'Дизайн', '3D и движение', 'Карьера', 'Арт-дирекшн'];
const btn = 'rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:border-primary';

function LessonView({ course, lesson, index, done, onBack, onOpen, onFinish }: {
  course: Course; lesson: Lesson; index: number; done: boolean;
  onBack: () => void; onOpen: (id: string) => void; onFinish: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === lesson.quiz.a;
  const prev = course.lessons[index - 1], next = course.lessons[index + 1];
  return (
    <div className="mx-auto max-w-[820px] px-5 py-8 sm:px-8 lg:py-10">
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> {course.title}</button>
      <div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">Урок {index + 1} из {course.lessons.length} · <Clock className="inline" size={10} /> {lesson.min} мин</div>
      <h1 className="mt-2 font-display text-4xl leading-[.95] tracking-[-.05em]">{lesson.title}</h1>
      <div className="mt-6 space-y-3 text-sm leading-relaxed">
        {lesson.body.map((line, i) => line.startsWith('• ')
          ? <p key={i} className="flex gap-2 pl-2"><span className="text-primary">•</span><span>{line.slice(2)}</span></p>
          : <p key={i}>{line}</p>)}
      </div>
      {lesson.tip && <div className="mt-6 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm"><b>Совет. </b>{lesson.tip}</div>}
      <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm"><b>Практика. </b>{lesson.task}</div>
      {lesson.src && <a href={lesson.src.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-primary underline"><ExternalLink size={12} /> {lesson.src.label}</a>}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">Проверка</div>
        <h2 className="mt-2 font-display text-xl">{lesson.quiz.q}</h2>
        <div className="mt-4 grid gap-2">
          {lesson.quiz.o.map((option, i) => (
            <button key={option} onClick={() => setPicked(i)} className={`rounded-xl border px-4 py-3 text-left text-sm ${picked === i ? (i === lesson.quiz.a ? 'border-green-600 bg-green-600/10' : 'border-destructive bg-destructive/10') : 'border-border hover:border-primary'}`}>{option}</button>
          ))}
        </div>
        {picked !== null && !correct && <p className="mt-3 text-xs text-destructive">Не совсем. Перечитайте урок и попробуйте ещё раз.</p>}
        {done
          ? <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-600"><Check size={14} /> Урок пройден</p>
          : <button disabled={!correct} onClick={onFinish} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">Завершить урок · +10 XP</button>}
      </div>
      <div className="mt-6 flex justify-between gap-3">
        {prev ? <button className={btn} onClick={() => onOpen(prev.id)}><ArrowLeft className="mr-2 inline" size={13} />Назад</button> : <span />}
        {next && <button className={btn} onClick={() => onOpen(next.id)}>Дальше<ArrowRight className="ml-2 inline" size={13} /></button>}
      </div>
    </div>
  );
}

export function LearningPage({ onToast }: { onToast: (text: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все темы');
  const [done, setDone] = useState<string[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    void getCurrentUser().then(({ user }) => { if (user) void fetchProgress().then((r) => setDone(r.done)); });
  }, []);

  const visible = useMemo(() => courses.filter((c) =>
    (category === 'Все темы' || c.category === category)
    && `${c.title} ${c.category} ${c.summary}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const course = courses.find((c) => c.id === courseId) ?? null;
  const lessonIndex = course && lessonId ? course.lessons.findIndex((l) => l.id === lessonId) : -1;
  const progress = (c: Course) => c.lessons.filter((l) => done.includes(l.id)).length;

  async function finish(c: Course, l: Lesson) {
    const r = await completeLesson(l.id);
    if (r.error || !r.done) { onToast(r.error ?? 'Не удалось сохранить прогресс.'); return; }
    setDone(r.done);
    const finished = c.lessons.every((x) => r.done?.includes(x.id));
    onToast(finished && r.xp >= 60 ? `Курс пройден! +${r.xp} XP.` : r.xp > 0 ? `Урок пройден: +${r.xp} XP.` : 'Урок уже засчитан.');
  }

  if (course && lessonIndex >= 0) {
    return <LessonView key={lessonId} course={course} lesson={course.lessons[lessonIndex]} index={lessonIndex} done={done.includes(course.lessons[lessonIndex].id)}
      onBack={() => setLessonId(null)} onOpen={(id) => { setLessonId(id); window.scrollTo(0, 0); }} onFinish={() => void finish(course, course.lessons[lessonIndex])} />;
  }

  if (course) {
    const count = progress(course);
    const nextLesson = course.lessons.find((l) => !done.includes(l.id)) ?? course.lessons[0];
    return (
      <div className="mx-auto max-w-[820px] px-5 py-8 sm:px-8 lg:py-10">
        <button onClick={() => setCourseId(null)} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Все курсы</button>
        <div className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">{course.category} · {course.level}</div>
        <h1 className="mt-2 font-display text-4xl leading-[.95] tracking-[-.05em]">{course.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{course.summary}</p>
        <div className="mt-5 rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-semibold">Чему научитесь</div>
          <ul className="mt-2 grid gap-1.5 text-sm">{course.outcomes.map((o) => <li key={o} className="flex gap-2"><Check className="mt-0.5 shrink-0 text-primary" size={14} />{o}</li>)}</ul>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(count / course.lessons.length) * 100}%` }} /></div>
          <span className="text-xs text-muted-foreground">{count} / {course.lessons.length}</span>
          <button onClick={() => setLessonId(nextLesson.id)} className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground">{count === 0 ? 'Начать' : count === course.lessons.length ? 'Повторить' : 'Продолжить'}</button>
        </div>
        <ol className="mt-6 grid gap-2">
          {course.lessons.map((l, i) => (
            <li key={l.id}><button onClick={() => setLessonId(l.id)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-primary">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${done.includes(l.id) ? 'bg-green-600 text-white' : 'bg-muted'}`}>{done.includes(l.id) ? <Check size={14} /> : i + 1}</span>
              <span className="flex-1 text-sm font-medium">{l.title}</span><span className="text-xs text-muted-foreground">{l.min} мин</span>
            </button></li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro eyebrow="Библиотека практики" title="Учитесь с интересом." description={`${courses.length} курсов, ${courses.reduce((n, c) => n + c.lessons.length, 0)} уроков с практикой и проверкой. За каждый урок начисляются очки опыта.`} />
      <div className="mb-7 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск курсов и тем…" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary" /></div><div className="flex gap-2 overflow-auto">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl border px-4 text-xs font-semibold transition ${category === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{item}</button>)}</div></div>
      {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center"><h2 className="font-display text-2xl">Ничего не найдено</h2><p className="mt-2 text-sm text-muted-foreground">Измените запрос или выберите другую тему.</p></div> : (
        <div className="grid gap-4 md:grid-cols-2">{visible.map((c, index) => { const Icon = icons[c.icon]; const count = progress(c); return (
          <article key={c.id} onClick={() => setCourseId(c.id)} className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary">
            <div className={`relative h-32 overflow-hidden p-5 ${index % 2 ? 'bg-accent/50' : 'bg-secondary/45'}`}><div className="absolute -right-4 -top-10 h-44 w-44 rounded-full border-[24px] border-foreground/10" /><span className="relative grid h-10 w-10 place-items-center rounded-lg bg-background/70"><Icon size={18} /></span></div>
            <div className="p-5">
              <div className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">{c.category} · {c.level} · {c.lessons.length} уроков</div>
              <h2 className="mt-2 font-display text-2xl leading-[.95] tracking-[-.05em]">{c.title}</h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.summary}</p>
              <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(count / c.lessons.length) * 100}%` }} /></div><span className="text-[11px] text-muted-foreground">{count}/{c.lessons.length}</span></div>
            </div>
          </article>); })}</div>
      )}
    </div>
  );
}
