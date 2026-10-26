import { useState } from 'react';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Logo } from '@/features/shared/Logo';
import { getCurrentUser } from '@/lib/api';
import { updateProfile } from '@/lib/api';

export function OnboardingPage({ onToast }: { onToast: (text: string) => void }) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  async function finish() {
    setPending(true);
    const { user } = await getCurrentUser();
    const result = user
      ? await updateProfile(user.id, { onboarding_completed: true, bio: `Интересы: ${selected.join(', ')}.` })
      : { error: 'Сессия завершилась. Войдите ещё раз.' };
    setPending(false);
    if (result.error) {
      onToast(result.error);
      return;
    }
    onToast('Ваше пространство готово.');
    setLocation('/dashboard');
  }

  const options = ['Визуальный дизайн', '3D и анимация', 'Тексты и идеи', 'Фотография', 'Арт-дирекшн', 'Звук'];
  const rhythms = ['Спокойный утренний ритуал', 'Вечерняя творческая практика', 'Когда приходит вдохновение'];
  return <div className="paper-grid min-h-[100dvh] bg-background px-5 py-6 sm:px-10"><header className="flex items-center justify-between"><Logo /><Link href="/auth" className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">Выйти из настройки</Link></header><div className="mx-auto max-w-2xl py-16 sm:py-24"><div className="mb-12 h-1 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full bg-primary transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} /></div>{step === 1 ? <div><div className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">С чего начнём</div><h1 className="mt-4 font-display text-5xl leading-[.9] tracking-[-.08em] sm:text-7xl">Что вы хотите<br /><span className="text-secondary">создавать?</span></h1><p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">Выберите интересы — мы подстроим пространство под ваше любопытство.</p><div className="mt-10 grid gap-2 sm:grid-cols-2">{options.map(option => <button key={option} onClick={() => setSelected((current) => current.includes(option) ? current.filter((value) => value !== option) : [...current, option])} className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm transition ${selected.includes(option) ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/50'}`}><span className="flex items-center gap-3"><span className={`grid h-5 w-5 place-items-center rounded-full border ${selected.includes(option) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{selected.includes(option) && <Check size={12} />}</span>{option}</span><ArrowRight size={15} className="opacity-50" /></button>)}</div><button onClick={() => setStep(2)} disabled={!selected.length} className="mt-8 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Далее <ArrowRight className="ml-2 inline" size={14} /></button></div> : <div><div className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">Выберите ритм</div><h1 className="mt-4 font-display text-5xl leading-[.9] tracking-[-.08em] sm:text-7xl">Как вам<br /><span className="text-secondary">удобнее?</span></h1><p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">Немного структуры помогает чаще находить время для важных идей.</p><div className="mt-10 space-y-2">{rhythms.map((option, index) => <button disabled={pending} key={option} onClick={() => void finish()} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-5 text-left text-sm transition hover:-translate-y-0.5 hover:border-primary disabled:opacity-60"><span><span className="mr-3 font-mono-ui text-[10px] text-primary">0{index + 1}</span>{option}</span>{pending ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}</button>)}</div><button onClick={() => setStep(1)} className="mt-6 text-xs text-muted-foreground hover:text-foreground">Назад к интересам</button></div>}</div></div>;
}