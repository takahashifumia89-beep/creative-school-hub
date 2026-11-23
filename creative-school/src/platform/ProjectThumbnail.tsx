import { useEffect, useRef, useState } from "react";
import type { DesignDoc } from "@/features/studio/DesignEditor";
import type { Project } from "./client";
import { api } from "./client";
import { DesignArtwork } from "./DesignArtwork";
export function ProjectThumbnail({
  project,
  published = false,
}: {
  project: Pick<Project, "id" | "title" | "owner_id" | "version">;
  published?: boolean;
}) {
  const container = useRef<HTMLSpanElement>(null),
    [doc, setDoc] = useState<DesignDoc | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    setDoc(null);
    const load = () => {
      if (started) return;
      started = true;
      void api<{ preview: DesignDoc | null }>(
        `${published ? "/public" : ""}/projects/${project.id}/preview`,
        "GET",
        undefined,
        controller.signal,
      )
        .then((r) => {
          if (!controller.signal.aborted) setDoc(r.preview);
        })
        .catch(() => {
          /* The title and direct editor link remain available. */
        });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: "80px" },
    );
    if (container.current) observer.observe(container.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [project.id, project.version, project.owner_id, published]);
  return (
    <span ref={container} className="cs-project-thumbnail">
      {doc && <DesignArtwork doc={doc} label={project.title} />}
    </span>
  );
}
