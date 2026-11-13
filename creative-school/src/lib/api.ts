import { api, message, type User } from "@/platform/client";
import { currentLang } from "@/platform/locale";
export type LocalUser = User;
export type CreativeRole = "learner" | "creator" | "admin";
export type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: CreativeRole;
  xp: number;
  level: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};
export type Project = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived" | "blocked";
  visibility: "private" | "unlisted" | "public";
  cover_url: string | null;
  category: string | null;
  kind: "notes" | "design" | "3d" | "image" | "video";
  version: number;
  created_at: string;
  updated_at: string;
  content?: string | null;
};
export type AppNotification = {
  id: string;
  user_id: string;
  type:
    | "comment"
    | "like"
    | "team_invite"
    | "message"
    | "sale"
    | "purchase"
    | "challenge"
    | "achievement";
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  created_at: string;
};
export type AuthResult = {
  user: LocalUser | null;
  error: string | null;
  recovery?: string;
};
export type Stats = {
  xp: number;
  level: number;
  levelFloorXp: number;
  nextLevelXp: number;
  levelProgress: number;
  weekDays: number;
  weekGoal: number;
  streak: number;
  projectsTotal: number;
  projectsPublished: number;
  badges: { badge: string; earned_at: string }[];
};
export function errorText(e: unknown) {
  return message(e)[
    currentLang() === "ru" ? 0 : currentLang() === "en" ? 1 : 2
  ];
}
async function result<T>(path: string, method = "GET", body?: unknown) {
  try {
    const data = await api<T>(path, method, body);
    if (method !== "GET")
      window.dispatchEvent(new Event("creative-school-stats-change"));
    return { data, error: null };
  } catch (e) {
    return { data: null, error: errorText(e) };
  }
}
export async function getCurrentUser(): Promise<AuthResult> {
  const r = await result<{ user: User }>("/me");
  return { user: r.data?.user ?? null, error: r.error };
}
export function authChanged() {
  window.dispatchEvent(new Event("creative-school-auth-change"));
}
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const r = await result<{ user: User }>("/auth/signin", "POST", {
    email,
    password,
  });
  if (r.data) authChanged();
  return { user: r.data?.user ?? null, error: r.error };
}
export async function signUpWithPassword(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  const r = await result<{ user: User; recovery: string }>(
    "/auth/signup",
    "POST",
    { email, password, displayName },
  );
  if (r.data) authChanged();
  return {
    user: r.data?.user ?? null,
    error: r.error,
    recovery: r.data?.recovery,
  };
}
export async function signOut() {
  const r = await result("/auth/signout", "POST", {});
  if (!r.error) authChanged();
  return r.error;
}
export function onAuthChange(callback: (user: LocalUser | null) => void) {
  const update = () => void getCurrentUser().then((r) => callback(r.user));
  window.addEventListener("creative-school-auth-change", update);
  window.addEventListener("cs-session-expired", update);
  return () => {
    window.removeEventListener("creative-school-auth-change", update);
    window.removeEventListener("cs-session-expired", update);
  };
}
export const fetchProfile = (_id: string) => result<Profile>("/profile");
export const updateProfile = (
  _id: string,
  values: Partial<
    Pick<
      Profile,
      | "display_name"
      | "username"
      | "bio"
      | "avatar_url"
      | "onboarding_completed"
    >
  >,
) => result<Profile>("/profile", "PATCH", values);
export async function fetchProjects(_id: string, offset = 0) {
  const r = await result<Project[]>(`/projects?offset=${offset}`);
  return { ...r, data: r.data ?? [] };
}
export const createProject = (
  _id: string,
  values: Pick<Project, "title" | "description" | "category" | "content"> & {
    kind?: Project["kind"];
  },
) =>
  result<Project>("/projects", "POST", {
    ...values,
    kind:
      values.kind ??
      (values.category === "Дизайн"
        ? "design"
        : values.category === "3D и моделирование"
          ? "3d"
          : "notes"),
  });
export const updateProject = (
  id: string,
  values: Partial<
    Pick<
      Project,
      | "title"
      | "description"
      | "category"
      | "status"
      | "visibility"
      | "content"
      | "version"
    >
  >,
) => result<Project>(`/projects/${id}`, "PATCH", values);
export const getProject = (id: string) => result<Project>(`/projects/${id}`);
export const deleteProject = (id: string, version: number) =>
  result(`/projects/${id}`, "DELETE", { version });
export const fetchStats = () => result<Stats>("/stats");
export async function markPractice() {
  const r = await result<{ awarded: boolean; xp: number }>(
    "/practice",
    "POST",
    {},
  );
  return {
    awarded: r.data?.awarded ?? false,
    xp: r.data?.xp ?? 0,
    error: r.error,
  };
}
export async function fetchProgress() {
  const r = await result<{ done: string[] }>("/progress");
  return { done: r.data?.done ?? [], error: r.error };
}
export async function completeLesson(lessonId: string, answers: number[]) {
  const r = await result<{ done: string[] }>("/progress", "POST", {
    lessonId,
    answers,
  });
  return { done: r.data?.done ?? null, error: r.error };
}
export async function fetchNotifications(_id: string) {
  const r = await result<AppNotification[]>("/notifications");
  return { ...r, data: (r.data ?? []).map((n) => ({ ...n, read: !!n.read })) };
}
export const markNotificationRead = (id: string) =>
  result(`/notifications/${id}/read`, "POST", {});
export function subscribeToNotifications(
  _id: string,
  _cb: (n: AppNotification) => void,
) {
  return () => undefined;
}
