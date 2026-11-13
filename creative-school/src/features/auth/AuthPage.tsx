import { useCopy } from "@/platform/copy";
import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/features/shared/Logo";
import { signInWithPassword, signUpWithPassword, errorText } from "@/lib/api";
import { api, download } from "@/platform/client";
export function AuthPage({ onToast }: { onToast: (s: string) => void }) {
  const tx = useCopy();
  const [, setLocation] = useLocation(),
    [mode, setMode] = useState<"in" | "up" | "recover">(() =>
      new URLSearchParams(window.location.search).get("mode") === "up"
        ? "up"
        : "in",
    ),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [recovery, setRecovery] = useState(""),
    [backup, setBackup] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function submit() {
    setError("");
    setPending(true);
    try {
      if (mode === "recover") {
        const r = await api<{
          recovery: string;
        }>("/auth/recover", "POST", { email, password, recovery });
        setBackup(r.recovery);
        return;
      }
      const r =
        mode === "in"
          ? await signInWithPassword(email, password)
          : await signUpWithPassword(email, password, name);
      if (r.error) {
        setError(r.error);
        return;
      }
      if (r.recovery) {
        setBackup(r.recovery);
        return;
      }
      onToast(tx("С возвращением!"));
      setLocation("/dashboard");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="paper-grid min-h-[100dvh] bg-background px-5 py-6 sm:px-10">
      <header className="flex items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
        >
          {tx("На главную")}
        </Link>
      </header>
      <div className="mx-auto grid max-w-5xl items-center gap-14 py-16 lg:grid-cols-[.9fr_1.1fr] lg:py-24">
        <div>
          <div className="mb-5 font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">
            {tx("Пространство для практики")}
          </div>
          <h1 className="font-display text-5xl leading-[.9] tracking-[-.08em] sm:text-7xl">
            {tx("Создавайте")}
            <br />
            <span className="text-secondary">{tx("своё.")}</span>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {tx(
              "Творческая школа — пространство, где можно учиться, находить единомышленников и превращать идеи в проекты.",
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[8px_8px_0_hsl(var(--primary)/.16)] sm:p-8">
          {backup ? (
            <>
              <h2 className="font-display text-3xl tracking-[-.06em]">
                {tx("Сохраните резервный ключ")}
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                {tx(
                  "Ключ показывается один раз. Он позволяет восстановить доступ без почтового сервиса. Храните его отдельно от пароля.",
                )}
              </p>
              <code className="my-5 block break-all rounded-lg bg-muted p-4">
                {backup}
              </code>
              <button
                onClick={() =>
                  download(
                    "creative-school-recovery.txt",
                    `${email}\n${backup}\n`,
                    "text/plain",
                  )
                }
                className="rounded-full border border-border px-4 py-2 text-xs"
              >
                {tx("Скачать ключ")}
              </button>
              <button
                onClick={() => {
                  setBackup("");
                  if (mode === "recover") {
                    setMode("in");
                    setPassword("");
                  } else setLocation("/onboarding");
                }}
                className="ml-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                {tx("Ключ сохранён, продолжить")}
              </button>
            </>
          ) : (
            <>
              <div className="mb-8 flex gap-5 border-b border-border">
                <button
                  onClick={() => {
                    setMode("in");
                    setError("");
                  }}
                  className={`pb-3 text-sm font-semibold ${mode === "in" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
                >
                  {tx("Войти")}
                </button>
                <button
                  onClick={() => {
                    setMode("up");
                    setError("");
                  }}
                  className={`pb-3 text-sm font-semibold ${mode === "up" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
                >
                  {tx("Регистрация")}
                </button>
              </div>
              <h2 className="font-display text-3xl tracking-[-.06em]">
                {mode === "in"
                  ? tx("С возвращением.")
                  : mode === "up"
                    ? tx("Начните творить.")
                    : tx("Восстановление доступа")}
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                {mode === "in"
                  ? tx("Продолжите с того места, где остановились.")
                  : tx("Профиль и проекты хранятся в вашем аккаунте.")}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="mt-7 space-y-4"
              >
                {mode === "up" && (
                  <label className="block text-xs font-medium">
                    {tx("Ваше имя")}
                    <input
                      required
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                )}
                <label className="block text-xs font-medium">
                  {tx("Электронная почта")}
                  <input
                    required
                    maxLength={254}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-xs font-medium">
                  {mode === "recover" ? tx("Новый пароль") : tx("Пароль")}
                  <input
                    required
                    type="password"
                    minLength={mode === "in" ? 1 : 12}
                    maxLength={200}
                    autoComplete={
                      mode === "in" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "in" ? tx("Пароль") : tx("Не менее 12 символов")
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                {mode === "recover" && (
                  <label className="block text-xs font-medium">
                    {tx("Резервный ключ")}
                    <input
                      required
                      autoComplete="off"
                      value={recovery}
                      onChange={(e) => setRecovery(e.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                )}
                <button
                  disabled={pending}
                  type="submit"
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                >
                  {pending ? (
                    <LoaderCircle
                      className="mr-2 inline animate-spin"
                      size={15}
                    />
                  ) : null}
                  {mode === "in"
                    ? tx("Войти в школу")
                    : mode === "up"
                      ? tx("Создать аккаунт")
                      : tx("Восстановить")}
                  <ArrowRight className="ml-2 inline" size={15} />
                </button>
              </form>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </p>
              )}
              <button
                onClick={() => {
                  setMode(mode === "recover" ? "in" : "recover");
                  setError("");
                }}
                className="mt-5 text-xs text-primary"
              >
                {mode === "recover"
                  ? tx("Вернуться ко входу")
                  : tx("Забыли пароль?")}
              </button>
              <p className="mt-5 text-center text-[11px] text-muted-foreground">
                {tx(
                  "Восстановление доступа работает по резервному ключу. Подтверждение почты пока не подключено.",
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
