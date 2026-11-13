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
  async function finish(l: Lesson, answers: number[]) {
    try {
      const r = await api<{ done: string[] }>("/progress", "POST", {
        lessonId: l.id,
        answers,
      });
      setDone(r.done);
      store(read().filter((x) => x.lessonId !== l.id));
      setStatus(
        t(
          L(
            "Урок подтверждён сервером.",
            "Lesson verified by the server.",
            "Сабақты сервер растады.",
          ),
        ),
      );
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
      } else setStatus(t(message(e)));
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
              lesson={lesson}
              done={done.includes(lesson.id)}
              pending={pending.some((p) => p.lessonId === lesson.id)}
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
          {project && (
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

function LessonContent({
  lesson,
  done,
  pending,
  onFinish,
}: {
  lesson: Lesson;
  done: boolean;
  pending: boolean;
  onFinish: (answers: number[]) => Promise<void>;
}) {
  const { t, lang } = useLocale(),
    [picks, setPicks] = useState<number[]>(lesson.questions.map(() => -1)),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false);
  // Shuffle displayed alternatives without changing stable server answer indexes.
  const [orders] = useState(() =>
    lesson.questions.map((q) =>
      q.options.map((_, i) => i).sort(() => Math.random() - 0.5),
    ),
  );
  return (
    <article className="my-6 max-w-[820px] space-y-5 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed sm:p-8">
      <h3 className="font-display text-3xl tracking-[-.05em]">
        {t(lesson.title)}
      </h3>
      <p>{t(lesson.body)}</p>
      {lang === "ru" && readingRu[lesson.id] && (
        <details>
          <summary>Дополнительный материал из исходного курса</summary>
          {readingRu[lesson.id].body.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
          <p>{readingRu[lesson.id].tip}</p>
          <p>{readingRu[lesson.id].task}</p>
        </details>
      )}
      <h4 className="font-display text-xl">
        {t(L("Разбор и практика", "Worked practice", "Талдау және тәжірибе"))}
      </h4>
      <p>{t(lesson.task)}</p>
      <ol>
        <li>
          {t(
            L(
              "Зафиксируйте цель и ограничение проекта.",
              "Write the project goal and constraint.",
              "Жоба мақсаты мен шектеуін жазыңыз.",
            ),
          )}
        </li>
        <li>
          {t(
            L(
              "Сделайте вариант A, затем измените один параметр для варианта B.",
              "Create version A, then change one parameter for version B.",
              "A нұсқасын жасап, B нұсқасы үшін бір параметрді өзгертіңіз.",
            ),
          )}
        </li>
        <li>
          {t(
            L(
              "Сравните читаемость, целостность и соответствие задаче. Сохраните оба результата.",
              "Compare clarity, consistency and fit to the goal. Save both results.",
              "Айқындық, тұтастық және мақсатқа сәйкестікті салыстырыңыз. Екі нәтижені сақтаңыз.",
            ),
          )}
        </li>
      </ol>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={review}
          onChange={(e) => setReview(e.target.checked)}
        />
        {t(
          L(
            "Практика выполнена и проверена мной.",
            "I completed and reviewed the practice.",
            "Тәжірибені орындап, өзім тексердім.",
          ),
        )}
      </label>
      <h4 className="font-display text-xl">
        {t(L("Проверка знаний", "Knowledge check", "Білімді тексеру"))}
      </h4>
      {lesson.questions.map((q, qi) => (
        <fieldset key={qi} className="rounded-xl border border-border p-4">
          <legend>
            {qi + 1}. {t(q.q)}
          </legend>
          {orders[qi].map((i) => (
            <label
              className="mt-3 flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-sm hover:border-primary"
              key={i}
            >
              <input
                type="radio"
                name={`${lesson.id}-${qi}`}
                checked={picks[qi] === i}
                onChange={() =>
                  setPicks((p) => p.map((v, k) => (k === qi ? i : v)))
                }
              />
              {t(q.options[i])}
            </label>
          ))}
        </fieldset>
      ))}
      <button
        className="mt-4 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        disabled={done || pending || busy || !review || picks.includes(-1)}
        onClick={async () => {
          setBusy(true);
          try {
            await onFinish(picks);
          } finally {
            setBusy(false);
          }
        }}
      >
        {done
          ? t(L("Пройдено", "Completed", "Аяқталды"))
          : pending
            ? t(L("В очереди", "Queued", "Кезекте"))
            : t(
                L(
                  "Проверить ответы · +10 XP",
                  "Submit answers · +10 XP",
                  "Жауапты тексеру · +10 XP",
                ),
              )}
      </button>
    </article>
  );
}
