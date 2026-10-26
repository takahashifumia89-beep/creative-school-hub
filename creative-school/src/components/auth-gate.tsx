import { type ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getCurrentUser, onAuthChange } from '@/lib/api';

export function AuthGate({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void getCurrentUser().then(({ user }) => {
      if (!active) return;
      setAuthenticated(Boolean(user));
      if (!user) setLocation('/auth');
    });
    const unsubscribe = onAuthChange((user) => {
      if (!active) return;
      setAuthenticated(Boolean(user));
      if (!user) setLocation('/auth');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [setLocation]);

  if (authenticated === null) {
    return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">Загружаем рабочее пространство…</div>;
  }
  return authenticated ? <>{children}</> : null;
}
