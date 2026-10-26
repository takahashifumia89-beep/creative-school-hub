import { type ReactNode, useEffect, useState } from 'react';
import { LockKeyhole, LoaderCircle } from 'lucide-react';
import { getCurrentUser, type CreativeRole } from '@/lib/api';
import { fetchProfile } from '@/lib/api';

export function RoleGate({ role, children }: { role: CreativeRole; children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>('loading');
  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) {
        setState('denied');
        return;
      }
      const result = await fetchProfile(user.id);
      setState(result.data?.role === role ? 'allowed' : 'denied');
    });
  }, [role]);
  if (state === 'loading') return <div className="grid min-h-[calc(100dvh-68px)] place-items-center text-muted-foreground"><LoaderCircle className="animate-spin text-primary" size={18} /></div>;
  if (state === 'denied') return <div className="grid min-h-[calc(100dvh-68px)] place-items-center p-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 text-secondary"><LockKeyhole size={20} /></span><h1 className="mt-5 font-display text-3xl tracking-[-.06em]">Доступ только для администратора</h1><p className="mt-2 max-w-sm text-sm text-muted-foreground">В этом локальном режиме раздел доступен только профилям с ролью администратора.</p></div></div>;
  return <>{children}</>;
}