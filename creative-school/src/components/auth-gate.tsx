import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentUser, onAuthChange } from "@/lib/api";
import { api, ApiError, message } from "@/platform/client";
import { L, useLocale } from "@/platform/locale";
export function AuthGate({ children }: { children: ReactNode }) {
  const { t } = useLocale(),
    [, navigate] = useLocation(),
    [allowed, setAllowed] = useState<boolean | null>(null),
    [error, setError] = useState("");
  async function load() {
    setError("");
    try {
      await api("/me");
      setAllowed(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setAllowed(false);
        navigate("/auth");
      } else setError(t(message(e)));
    }
  }
  useEffect(() => {
    void load();
    return onAuthChange((user) => {
      setAllowed(!!user);
      if (!user) navigate("/auth");
    });
  }, []);
  if (error)
    return (
      <div className="p-8 text-sm" role="alert">
        {error}
        <button
          onClick={() => void load()}
          className="ml-3 rounded-full border border-border px-4 py-2"
        >
          {t(L("Повторить", "Retry", "Қайталау"))}
        </button>
      </div>
    );
  if (allowed === null)
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">
        {t(
          L(
            "Загружаем рабочее пространство…",
            "Loading your workspace…",
            "Жұмыс кеңістігі жүктелуде…",
          ),
        )}
      </div>
    );
  return allowed ? <>{children}</> : null;
}
