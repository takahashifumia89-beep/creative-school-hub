import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { L, useLocale } from "./locale";
import { api, ApiError, message, type Project } from "./client";
import { practiceProject } from "./practice-project";
export function PracticeLaunch({
  userId,
  lessonId,
  title,
  brief,
}: {
  userId: string;
  lessonId: string;
  title: string;
  brief: string;
}) {
  const { t, lang } = useLocale(),
    [, navigate] = useLocation(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null),
    creationId = useRef(crypto.randomUUID());
  useEffect(() => () => controller.current?.abort(), []);
  async function open() {
    if (busy) return;
    setBusy(true);
    setError("");
    const c = new AbortController();
    controller.current = c;
    const key = `cs-practice:${userId}:${lessonId}`;
    try {
      let project: Project | null = null,
        old: string | null = null;
      try {
        old = localStorage.getItem(key);
      } catch {
        /* Private browsing still allows creating a project. */
      }
      if (old && /^[a-f0-9-]{36}$/i.test(old)) {
        try {
          project = await api<Project>(
            `/projects/${old}`,
            "GET",
            undefined,
            c.signal,
          );
        } catch (e) {
          if (!(e instanceof ApiError && e.status === 404)) throw e;
        }
      }
      if (!project) {
        const starter = practiceProject(lessonId, lang);
        project = await api<Project>(
          "/projects",
          "POST",
          {
            ...starter,
            clientId: creationId.current,
            title:
              `${t(L("Практика", "Practice", "Тәжірибе"))}: ${title}`.slice(
                0,
                120,
              ),
            description: brief.slice(0, 1000),
            ...(starter.kind === "notes" ? { content: brief } : {}),
          },
          c.signal,
        );
        try {
          localStorage.setItem(key, project.id);
        } catch {
          /* The project is already saved on the server. */
        }
      }
      if (!c.signal.aborted)
        navigate(
          `/studio/${project.kind}?project=${project.id}&lesson=${lessonId}`,
        );
    } catch (e) {
      if (!c.signal.aborted) setError(t(message(e)));
    } finally {
      if (!c.signal.aborted) setBusy(false);
    }
  }
  return (
    <div className="cs-practice-launch">
      <div>
        <strong>
          {t(
            L(
              "Из урока — в вашу работу",
              "From lesson to your own work",
              "Сабақтан — өз жұмысыңызға",
            ),
          )}
        </strong>
        <p>
          {t(
            L(
              "Задание останется под рукой в студии. На этом устройстве можно вернуться к той же практике.",
              "Keep the brief beside you in the studio. On this device you can return to the same practice project.",
              "Тапсырма студияда қол астында болады. Осы құрылғыда сол тәжірибе жобасына қайта орала аласыз.",
            ),
          )}
        </p>
      </div>
      <button type="button" disabled={busy} onClick={() => void open()}>
        {busy ? <LoaderCircle size={16} /> : <ArrowUpRight size={16} />}{" "}
        {t(
          L(
            "К практике в студии",
            "Practice in the studio",
            "Студияда тәжірибе жасау",
          ),
        )}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
