import { useEffect, useState } from 'react';
import { Bell, CircleAlert, Heart, MessageCircle, ShoppingBag, Trophy, Users } from 'lucide-react';
import { PageIntro } from '@/features/shared/PageIntro';
import { getCurrentUser, subscribeToNotifications, type AppNotification } from '@/lib/api';
import { fetchNotifications, markNotificationRead } from '@/lib/api';

const iconFor = (type: AppNotification['type']) => ({
  comment: MessageCircle,
  like: Heart,
  team_invite: Users,
  message: MessageCircle,
  sale: ShoppingBag,
  purchase: ShoppingBag,
  challenge: CircleAlert,
  achievement: Trophy,
})[type];

export function NotificationCenter({ onToast }: { onToast: (text: string) => void }) {
  const [notes, setNotes] = useState<AppNotification[]>([]);
  const unread = notes.filter((note) => !note.read).length;

  useEffect(() => {
    let unsubscribe: () => void = () => undefined;
    let active = true;
    void getCurrentUser().then(async ({ user }) => {
      if (!user || !active) return;
      const result = await fetchNotifications(user.id);
      if (!active) return;
      setNotes(result.data);
      unsubscribe = subscribeToNotifications(user.id, (note) => setNotes((current) => [note, ...current]));
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function markRead(id: string) {
    setNotes((current) => current.map((note) => note.id === id ? { ...note, read: true } : note));
    const result = await markNotificationRead(id);
    if (result.error) onToast(result.error);
  }

  async function markAllRead() {
    await Promise.all(notes.filter((note) => !note.read).map((note) => markNotificationRead(note.id)));
    setNotes((current) => current.map((note) => ({ ...note, read: true })));
    onToast('Все уведомления отмечены как прочитанные.');
  }

  return (
    <div className="mx-auto max-w-[960px] px-5 py-8 sm:px-8 lg:py-10">
      <PageIntro eyebrow="Ваши уведомления" title="Входящие." description="Новости о ваших проектах и творческом сообществе." action={<button onClick={() => void markAllRead()} className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold">Отметить все прочитанными</button>} />
      <div className="mb-4 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground"><span className="text-primary">{unread} непрочитанных</span><span className="h-1 w-1 rounded-full bg-border" /><span>Хранятся на этом устройстве</span></div>
      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><Bell className="mx-auto text-primary" size={22} /><h2 className="mt-4 font-display text-2xl tracking-[-.05em]">Пока ничего нового.</h2><p className="mt-2 text-sm text-muted-foreground">Здесь появятся уведомления о комментариях, реакциях, приглашениях, сообщениях и достижениях.</p></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {notes.map((note) => { const Icon = iconFor(note.type); return <button key={note.id} onClick={() => void markRead(note.id)} className={`flex w-full gap-4 border-b border-border p-5 text-left transition last:border-0 hover:bg-muted/50 sm:p-6 ${note.read ? 'opacity-65' : ''}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${note.read ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'}`}><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="flex flex-col justify-between gap-1 sm:flex-row"><span className="text-sm font-semibold">{note.title}</span><span className="font-mono-ui text-[10px] text-muted-foreground">{new Date(note.created_at).toLocaleDateString('ru-RU')}</span></span><span className="mt-2 block max-w-2xl text-xs leading-relaxed text-muted-foreground">{note.body}</span></span>{!note.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" />}</button>; })}
        </div>
      )}
    </div>
  );
}
