import { ProjectThumbnail } from "./ProjectThumbnail";
import { Link } from "wouter";
import {
  ArrowUpRight,
  Box,
  Camera,
  Clapperboard,
  FileText,
  Palette,
} from "lucide-react";
import type { ReactNode } from "react";
import { kindLabels, projectHref, type ProjectMeta } from "./workspace";
import { L, useLocale } from "./locale";
import { prefetchRoute } from "./route-loading";
export function ProjectTile({
  project: p,
  actions,
  publicLink = false,
}: {
  project: ProjectMeta;
  actions?: ReactNode;
  publicLink?: boolean;
}) {
  const { t, lang } = useLocale(),
    Icon = {
      design: Palette,
      "3d": Box,
      image: Camera,
      video: Clapperboard,
      notes: FileText,
    }[p.kind],
    href = publicLink ? `/p/${p.id}` : projectHref(p);
  const date = new Date(p.updated_at),
    formatted = Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(
          lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-GB",
          { day: "numeric", month: "short" },
        ).format(date)
      : "";
  return (
    <article className="cs-project-tile" data-project-id={p.id}>
      <Link
        className={`cs-project-cover cs-kind-${p.kind}`}
        href={href}
        aria-label={`${t(L("Открыть", "Open", "Ашу"))}: ${p.title}`}
        onPointerEnter={(e) => {
          if (!publicLink && e.pointerType === "mouse")
            prefetchRoute(`/studio/${p.kind}`);
        }}
      >
        <Icon size={31} />
        {p.kind === "design" && <ProjectThumbnail project={p} />}
        <span>{t(kindLabels[p.kind])}</span>
        <ArrowUpRight size={16} />
      </Link>
      <div className="cs-project-body">
        <div className="cs-project-meta">
          <span>
            {t(
              p.status === "archived"
                ? L("Архив", "Archived", "Мұрағат")
                : p.status === "published"
                  ? L("Опубликован", "Published", "Жарияланды")
                  : L("Черновик", "Draft", "Нобай"),
            )}
          </span>
          <time dateTime={p.updated_at}>{formatted}</time>
        </div>
        <h2>
          <Link href={href}>{p.title}</Link>
        </h2>
        <p>
          {p.description ||
            (publicLink
              ? ""
              : t(
                  L(
                    "Добавьте описание и продолжайте работу.",
                    "Add a description and keep creating.",
                    "Сипаттама қосып, жұмысты жалғастырыңыз.",
                  ),
                ))}
        </p>
        {actions && <div className="cs-project-actions">{actions}</div>}
      </div>
    </article>
  );
}
