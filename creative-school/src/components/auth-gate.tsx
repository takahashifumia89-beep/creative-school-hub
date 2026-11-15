import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useSession } from "@/platform/session";
import { L, useLocale } from "@/platform/locale";
import { safeReturnPath } from "@/platform/navigation";
import { PageLoading } from "@/platform/PageLoading";
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, error, refresh } = useSession(),
    { t } = useLocale(),
    [, navigate] = useLocation();
  useEffect(() => {
    if (!loading && !user && !error)
      navigate(
        `/auth?next=${encodeURIComponent(safeReturnPath(window.location.pathname + window.location.search))}`,
      );
  }, [user, loading, error, navigate]);
  if (user) return <>{children}</>;
  if (error)
    return (
      <div className="cs-inline-error" role="alert">
        {t(error)}
        <button onClick={() => void refresh()}>
          {t(L("Повторить", "Retry", "Қайталау"))}
        </button>
        <Link href="/">{t(L("На главную", "Home", "Басты бетке"))}</Link>
      </div>
    );
  return <PageLoading />;
}
