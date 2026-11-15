import { rememberLesson } from "./resume";
import { LessonReader as LessonContent } from "./LessonReader";
import {
  feedbackSchema,
  type QuestionFeedback,
  type SubmissionResult,
} from "./assessment";
import { coursework } from "./coursework";
import { download } from "./client";
import { PageIntro } from "@/features/shared/PageIntro";
import { Palette, Box, Film, Lightbulb, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { readingRu } from "./reading-ru";
import { curriculum, type Lesson } from "./curriculum";
import { api, ApiError, message, type User } from "./client";
import { useLocale, L } from "./locale";
type Pending = { lessonId: string; answers: number[] };
export default function Learning({
  user,
  courseId,
  lessonId,
}: {
  user: User;
  courseId?: string;
  lessonId?: string;
}) {
  const { t, lang } = useLocale(),
    [done, setDone] = useState<string[]>([]),
    [pending, setPending] = useState<Pending[]>([]),
    [query, setQuery] = useState(
      new URLSearchParams(window.location.search).get("q") ?? "",
    ),
    [status, setStatus] = useState("");
  const key = `cs-progress-queue:${user.id}`;
  const course = curriculum.find((c) => c.id === courseId),
    lesson = course?.lessons.find((l) => l.id === lessonId);
  useEffect(() => {
    if (lesson) rememberLesson(user.id, lesson.id);
  }, [user.id, lesson?.id]);
  const read = (): Pending[] => {
    try {
      const v = JSON.parse(localStorage.getItem(key) ?? "[]");
      return Array.isArray(v)
        ? v.filter(
            (x) => typeof x.lessonId === "string" && Array.isArray(x.answers),
          )
        : [];
    } catch {
      return [];
    }
  };
  const store = (p: Pending[]) => {
    setPending(p);
    try {
      localStorage.setItem(key, JSON.stringify(p));
    } catch {
      setStatus(
        t(
          L(
            "Локальная очередь не сохранена. Не закрывайте страницу до синхронизации.",
            "Cannot persist the queue. Keep the page open until synced.",
            "Кезек сақталмады. Синхрондалғанша бетті жаппаңыз.",
          ),
        ),
      );
    }
  };
  async function sync() {
    try {
      let p = read();
      setPending(p);
      for (const item of p) {
        try {
          await api("/progress", "POST", item);
          p = p.filter((x) => x.lessonId !== item.lessonId);
          store(p);
        } catch (e) {
          if (e instanceof ApiError && [404, 422].includes(e.status)) {
            p = p.filter((x) => x.lessonId !== item.lessonId);
            store(p);
            setStatus(t(message(e)));
            continue;
          }
          throw e;
        }
      }
      const r = await api<{ done: string[] }>("/progress");
      setDone(r.done);
    } catch (e) {
      setStatus(t(message(e)));
    }
  }
  useEffect(() => {
    void sync();
    const online = () => void sync();
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [user.id]);
  async function finish(
    l: Lesson,
    answers: number[],
  ): Promise<SubmissionResult> {
    try {
      const r = await api<{ done: string[]; feedback: QuestionFeedback[] }>(
        "/progress",
        "POST",
        { lessonId: l.id, answers },
      );
      setDone(r.done);
      store(read().filter((x) => x.lessonId !== l.id));
      window.dispatchEvent(new Event("creative-school-stats-change"));
      setStatus(
        t(
          L(
            "Урок подтверждён сервером.",
            "Lesson verified by the server.",
            "Сабақты сервер растады.",
          ),
        ),
      );
      return { kind: "passed", feedback: r.feedback };
    } catch (e) {
      if (e instanceof ApiError && (e.status === 0 || e.status >= 500)) {
        store([
          ...read().filter((x) => x.lessonId !== l.id),
          { lessonId: l.id, answers },
        ]);
        setStatus(
          t(
            L(
              "Ответы в очереди. XP появится после синхронизации.",
              "Answers queued. XP will update after syncing.",
              "Жауаптар кезекте. XP синхрондалған соң жаңарады.",
            ),
          ),
        );
        return { kind: "queued" };
      }
      const result =
        e instanceof ApiError ? feedbackSchema.safeParse(e.details) : null;
      const error = t(message(e));
      setStatus(error);
      return {
        kind: "failed",
        error,
        feedback: result?.success ? result.data.feedback : undefined,
      };
    }
  }
  const project = course
    ? coursework[course.id as keyof typeof coursework]
    : null;
  const iconFor = (id: string) =>
    id === "3d-basics"
      ? Box
      : id === "motion-basics" || id === "video"
        ? Film
        : id === "art-direction" || id === "portfolio"
          ? Lightbulb
          : Palette;
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow={t(
          L("Библиотека практики", "Practice library", "Тәжірибе кітапханасы"),
        )}
        title={t(
          L(
            "Учитесь с интересом.",
            "Learn with curiosity.",
            "Қызығушылықпен үйреніңіз.",
          ),
        )}
        description={`${curriculum.length} ${t(L("курсов", "courses", "курс"))}, ${curriculum.reduce((n, c) => n + c.lessons.length, 0)} ${t(L("уроков с практикой и проверкой.", "lessons with practice and assessment.", "тәжірибе мен тексеруі бар сабақ."))}`}
      />
      {status && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-border bg-card p-4 text-xs"
        >
          {status}
        </p>
      )}
      {pending.length > 0 && (
        <div className="mb-5 rounded-xl border border-primary/40 bg-primary/5 p-4 text-xs">
          {t(
            L(
              "Ожидают синхронизации:",
              "Pending sync:",
              "Синхрондалуды күтуде:",
            ),
          )}{" "}
          {pending.length}
          <button
            onClick={() => void sync()}
            className="ml-3 rounded-full border border-border px-4 py-2 font-semibold"
          >
            {t(L("Синхронизировать", "Sync now", "Синхрондау"))}
          </button>
        </div>
      )}
      {course ? (
        <>
          <Link
            href="/learn"
            className="mb-5 inline-flex text-xs font-semibold text-muted-foreground"
          >
            ← {t(L("Все курсы", "All courses", "Барлық курс"))}
          </Link>
          <h2 className="font-display text-4xl tracking-[-.05em]">
            {t(course.title)}
          </h2>
          {lesson ? (
            <LessonContent
              key={lesson.id}
              userId={user.id}
              lesson={lesson}
              done={done.includes(lesson.id)}
              pending={pending.some((p) => p.lessonId === lesson.id)}
              nextHref={
                course.lessons[course.lessons.indexOf(lesson) + 1]
                  ? `/learn/${course.id}/${course.lessons[course.lessons.indexOf(lesson) + 1].id}`
                  : undefined
              }
              onFinish={(answers) => finish(lesson, answers)}
            />
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              {t(
                L(
                  "Выберите урок и примените материал на практике.",
                  "Choose a lesson and put it into practice.",
                  "Сабақты таңдап, білімді тәжірибеде қолданыңыз.",
                ),
              )}
            </p>
          )}
          {!lesson && project && (
            <details className="mt-5 rounded-xl border border-border bg-card p-4 text-sm">
              <summary className="cursor-pointer font-semibold">
                {t(
                  L(
                    "Курсовой проект и критерии",
                    "Course project and rubric",
                    "Курстық жоба және өлшемдер",
                  ),
                )}
              </summary>
              <p className="mt-3">{t(project.brief)}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {project.criteria.map((c, i) => (
                  <li key={i}>{t(c)}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {t(
                  L(
                    "Самопроверка. Проверка преподавателем не подключена.",
                    "Self-review. Instructor grading is not connected.",
                    "Өзіндік тексеру. Мұғалім бағалауы қосылмаған.",
                  ),
                )}
              </p>
              <button
                className="mt-3 rounded-full border border-border px-4 py-2 text-xs"
                onClick={() =>
                  download(
                    `${course.id}-${lang}-brief.txt`,
                    [
                      t(course.title),
                      t(project.brief),
                      ...project.criteria.map((c) => "□ " + t(c)),
                    ].join("\n\n"),
                    "text/plain",
                  )
                }
              >
                {t(L("Скачать задание", "Download brief", "Тапсырманы жүктеу"))}
              </button>
            </details>
          )}
          {!lesson && (
            <ol className="mt-6 grid gap-2">
              {course.lessons.map((l, i) => (
                <li key={l.id}>
                  <Link
                    href={`/learn/${course.id}/${l.id}`}
                    aria-current={lessonId === l.id ? "page" : undefined}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm hover:border-primary"
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${done.includes(l.id) ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {done.includes(l.id) ? "✓" : i + 1}
                    </span>
                    <span className="flex-1">{t(l.title)}</span>
                    <span className="text-xs text-muted-foreground">
                      {l.minutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <>
          <label className="relative mb-7 block">
            <span className="sr-only">
              {t(
                L(
                  "Поиск по курсам и материалам",
                  "Search courses and materials",
                  "Курс пен материал іздеу",
                ),
              )}
            </span>
            <Search
              className="absolute left-3 top-3.5 text-muted-foreground"
              size={16}
            />
            <input
              type="search"
              autoFocus={new URLSearchParams(window.location.search).has(
                "search",
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                L(
                  "Поиск курсов и тем…",
                  "Search courses and topics…",
                  "Курс пен тақырып іздеу…",
                ),
              )}
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {curriculum
              .filter((c) =>
                [...c.title, ...c.lessons.flatMap((l) => l.title)]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c, index) => {
                const Icon = iconFor(c.id);
                return (
                  <Link
                    href={`/learn/${c.id}`}
                    key={c.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary"
                  >
                    <div
                      className={`relative h-32 overflow-hidden p-5 ${index % 2 ? "bg-accent/50" : "bg-secondary/45"}`}
                    >
                      <div className="absolute -right-4 -top-10 h-44 w-44 rounded-full border-[24px] border-foreground/10" />
                      <span className="relative grid h-10 w-10 place-items-center rounded-lg bg-background/70">
                        <Icon size={18} />
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t(L("Начальный", "Beginner", "Бастапқы"))} ·{" "}
                        {c.lessons.length} {t(L("уроков", "lessons", "сабақ"))}
                      </div>
                      <h2 className="mt-2 font-display text-2xl leading-[.95] tracking-[-.05em]">
                        {t(c.title)}
                      </h2>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {t(c.lessons[0].body)}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${(c.lessons.filter((l) => done.includes(l.id)).length / c.lessons.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {c.lessons.filter((l) => done.includes(l.id)).length}/
                          {c.lessons.length}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
