import type { Project } from "@/lib/api";
import type { Lang, Localized } from "./locale";
export type ProjectMeta = Omit<Project, "content">;
export type ServiceMeta = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  days: number;
  seller_name: string;
};
export type WorkspaceIndex = {
  userId: string | null;
  profile: { displayName: string | null; bio: string | null } | null;
  projects: ProjectMeta[];
  services: ServiceMeta[];
  done: string[];
  incomingRequests: number;
};
export const kindLabels: Record<Project["kind"], Localized> = {
  design: ["Дизайн", "Design", "Дизайн"],
  "3d": ["3D-модель", "3D model", "3D модель"],
  image: ["Фотография", "Photo", "Фотосурет"],
  video: ["Видео", "Video", "Бейне"],
  notes: ["Заметки", "Notes", "Жазбалар"],
};
export const projectHref = (p: Pick<Project, "id" | "kind">) =>
  `/studio/${p.kind}?project=${encodeURIComponent(p.id)}`;
export function normalizeSearch(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/ё/g, "е")
    .trim()
    .replace(/\s+/g, " ");
}
export function searchScore(query: string, title: string, keywords: string) {
  const q = normalizeSearch(query);
  if (!q) return 1;
  const t = normalizeSearch(title),
    all = t + " " + normalizeSearch(keywords);
  const terms = q.split(" ");
  if (!terms.every((term) => all.includes(term))) return 0;
  return (
    (t === q ? 100 : t.startsWith(q) ? 70 : t.includes(q) ? 50 : 20) +
    terms.filter((term) => t.includes(term)).length
  );
}
export function copyTitle(title: string, lang: Lang) {
  const suffix =
    lang === "ru" ? " — копия" : lang === "kk" ? " — көшірме" : " — copy";
  let text = "";
  for (const point of title) {
    if (text.length + point.length + suffix.length > 120) break;
    text += point;
  }
  return text + suffix;
}
export function sortProjects(
  projects: readonly ProjectMeta[],
  query: string,
  kind: string,
  status: string,
  sort: string,
) {
  return projects
    .filter(
      (p) =>
        (kind === "all" || p.kind === kind) &&
        (status === "archived"
          ? p.status === "archived"
          : p.status !== "archived" &&
            (status === "all" || p.status === status)) &&
        searchScore(query, p.title, p.description ?? " "),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "oldest"
          ? a.updated_at.localeCompare(b.updated_at)
          : b.updated_at.localeCompare(a.updated_at),
    );
}
