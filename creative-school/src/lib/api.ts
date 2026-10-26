// Клиент к API на Cloudflare Worker (данные хранятся в D1/SQLite, сессия — в HttpOnly-cookie).
export type LocalUser = { id: string; email: string; user_metadata: { display_name: string } };
export type CreativeRole = 'learner' | 'creator' | 'admin';
export type Profile = {
  id: string; display_name: string | null; username: string | null; avatar_url: string | null; bio: string | null;
  role: CreativeRole; xp: number; level: number; onboarding_completed: boolean; created_at: string; updated_at: string;
};
export type Project = {
  id: string; owner_id: string; title: string; description: string | null;
  status: 'draft' | 'published' | 'archived' | 'blocked'; visibility: 'private' | 'unlisted' | 'public';
  cover_url: string | null; category: string | null; created_at: string; updated_at: string;
};
export type AppNotification = {
  id: string; user_id: string;
  type: 'comment' | 'like' | 'team_invite' | 'message' | 'sale' | 'purchase' | 'challenge' | 'achievement';
  title: string; body: string | null; href: string | null; read: boolean; created_at: string;
};
export type AuthResult = { user: LocalUser | null; error: string | null };

type Result<T> = { data: T | null; error: string | null; status: number };

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<Result<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await res.json().catch(() => ({}));
    if (method !== 'GET') window.dispatchEvent(new Event('creative-school-stats-change'));
    if (!res.ok) return { data: null, error: (payload as { error?: string }).error ?? 'Ошибка запроса.', status: res.status };
    return { data: payload as T, error: null, status: res.status };
  } catch {
    return { data: null, error: 'Нет связи с сервером. Проверьте интернет.', status: 0 };
  }
}

let cachedUser: Promise<AuthResult> | null = null;
function authChanged(): void {
  cachedUser = null;
  window.dispatchEvent(new Event('creative-school-auth-change'));
}

export function getCurrentUser(): Promise<AuthResult> {
  cachedUser ??= request<{ user: LocalUser }>('/me').then((r) => ({ user: r.data?.user ?? null, error: r.status === 401 ? null : r.error }));
  return cachedUser;
}

async function authenticate(path: string, payload: Record<string, string>): Promise<AuthResult> {
  const r = await request<{ user: LocalUser }>(path, 'POST', payload);
  authChanged();
  return { user: r.data?.user ?? null, error: r.error };
}
export const signUpWithPassword = (email: string, password: string, displayName: string) =>
  authenticate('/auth/signup', { email, password, displayName });
export const signInWithPassword = (email: string, password: string) =>
  authenticate('/auth/signin', { email, password });

export async function signOut(): Promise<string | null> {
  const r = await request('/auth/signout', 'POST', {});
  authChanged();
  return r.error;
}

export function onAuthChange(callback: (user: LocalUser | null) => void): () => void {
  const update = () => { void getCurrentUser().then(({ user }) => callback(user)); };
  window.addEventListener('creative-school-auth-change', update);
  return () => window.removeEventListener('creative-school-auth-change', update);
}

// Уведомления подгружаются при открытии страницы; живой канал не нужен.
export function subscribeToNotifications(_userId: string, _onInsert: (n: AppNotification) => void): () => void {
  return () => undefined;
}

// userId принимается для совместимости: сервер определяет пользователя по сессии.
export async function fetchProfile(_userId: string) {
  const r = await request<Profile>('/profile');
  return { data: r.data, error: r.error };
}
export async function updateProfile(
  _userId: string,
  values: Partial<Pick<Profile, 'display_name' | 'username' | 'bio' | 'avatar_url' | 'onboarding_completed'>>,
) {
  const r = await request<Profile>('/profile', 'PATCH', values);
  return { data: r.data, error: r.error };
}
export async function fetchProjects(_userId: string) {
  const r = await request<Project[]>('/projects');
  return { data: r.data ?? [], error: r.error };
}
export async function createProject(_userId: string, values: Pick<Project, 'title' | 'description' | 'category'>) {
  const r = await request<Project>('/projects', 'POST', values);
  return { data: r.data, error: r.error };
}
export async function updateProject(
  projectId: string,
  values: Partial<Pick<Project, 'title' | 'description' | 'category' | 'status' | 'visibility'>>,
) {
  const r = await request<Project>(`/projects/${projectId}`, 'PATCH', values);
  return { data: r.data, error: r.error };
}
export async function fetchNotifications(_userId: string) {
  const r = await request<AppNotification[]>('/notifications');
  return { data: r.data ?? [], error: r.error };
}
export async function markNotificationRead(notificationId: string) {
  const r = await request(`/notifications/${notificationId}/read`, 'POST', {});
  return { error: r.error };
}

export type Stats = {
  xp: number; level: number; levelFloorXp: number; nextLevelXp: number; levelProgress: number;
  weekDays: number; weekGoal: number; streak: number; projectsTotal: number; projectsPublished: number;
};
export async function fetchStats() {
  const r = await request<Stats>('/stats');
  return { data: r.data, error: r.error };
}
export async function markPractice() {
  const r = await request<{ awarded: boolean; xp: number }>('/practice', 'POST', {});
  return { awarded: r.data?.awarded ?? false, xp: r.data?.xp ?? 0, error: r.error };
}
