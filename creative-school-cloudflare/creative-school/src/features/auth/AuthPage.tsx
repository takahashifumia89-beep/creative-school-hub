import { useState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Logo } from '@/features/shared/Logo';
import { signInWithPassword, signUpWithPassword } from '@/lib/api';

export function AuthPage({ onToast }: { onToast: (text: string) => void }) {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'in' | 'up'>(() => new URLSearchParams(window.location.search).get('mode') === 'up' ? 'up' : 'in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit() {
    setError('');
    if (!email.trim() || password.length < 8 || (mode === 'up' && !name.trim())) {
      setError(mode === 'up' ? 'Укажите имя, корректную почту и пароль не короче 8 символов.' : 'Укажите корректную почту и пароль не короче 8 символов.');
      return;
    }
    setPending(true);
    const result = mode === 'in'
      ? await signInWithPassword(email.trim(), password)
      : await signUpWithPassword(email.trim(), password, name.trim());
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onToast(mode === 'in' ? 'С возвращением!' : 'Аккаунт создан. Давайте настроим ваш профиль.');
    setLocation(mode === 'up' ? '/onboarding' : '/dashboard');
  }

  return (
    <div className="paper-grid min-h-[100dvh] bg-background px-5 py-6 sm:px-10">
      <header className="flex items-center justify-between"><Logo /><Link href="/" className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">На главную</Link></header>
      <div className="mx-auto grid max-w-5xl items-center gap-14 py-16 lg:grid-cols-[.9fr_1.1fr] lg:py-24">
        <div><div className="mb-5 font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">Пространство для практики</div><h1 className="font-display text-5xl leading-[.9] tracking-[-.08em] sm:text-7xl">Создавайте<br /><span className="text-secondary">своё.</span></h1><p className="mt-7 max-w-sm text-sm leading-relaxed text-muted-foreground">Творческая школа — пространство, где можно учиться, находить единомышленников и превращать идеи в проекты.</p></div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[8px_8px_0_hsl(var(--primary)/.16)] sm:p-8">
          <div className="mb-8 flex gap-5 border-b border-border"><button onClick={() => { setMode('in'); setError(''); }} className={`pb-3 text-sm font-semibold ${mode === 'in' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>Войти</button><button onClick={() => { setMode('up'); setError(''); }} className={`pb-3 text-sm font-semibold ${mode === 'up' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>Регистрация</button></div>
          <h2 className="font-display text-3xl tracking-[-.06em]">{mode === 'in' ? 'С возвращением.' : 'Начните творить.'}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{mode === 'in' ? 'Продолжите с того места, где остановились.' : 'Аккаунт хранится только в этом браузере.'}</p>
          <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="mt-7 space-y-4">{mode === 'up' && <label className="block text-xs font-medium">Ваше имя<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Анна Иванова" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>}<label className="block text-xs font-medium">Электронная почта<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@example.com" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label><label className="block text-xs font-medium">Пароль<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'up' ? 'new-password' : 'current-password'} placeholder="Не менее 8 символов" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
            <button disabled={pending} type="submit" className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{pending ? <><LoaderCircle className="mr-2 inline animate-spin" size={15} /> Сохраняем…</> : <>{mode === 'in' ? 'Войти в школу' : 'Создать аккаунт'} <ArrowRight className="ml-2 inline" size={15} /></>}</button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
          <p className="mt-5 text-center text-[11px] text-muted-foreground">Без подключения к серверу: профиль и проекты сохраняются в браузере этого устройства.</p>
        </div>
      </div>
    </div>
  );
}