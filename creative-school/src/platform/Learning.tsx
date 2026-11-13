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
  const { t } = useLocale(),
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
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">LEARN / PRACTICE / BUILD</p>
          <h1>
            {t(L("Библиотека знаний", "Learning library", "Білім кітапханасы"))}
          </h1>
          <p>
            {curriculum.length} {t(L("курсов", "courses", "курс"))} ·{" "}
            {curriculum.reduce((n, c) => n + c.lessons.length, 0)}{" "}
            {t(
              L(
                "уроков с практикой и тестами",
                "lessons with practice and quizzes",
                "тәжірибе мен тесті бар сабақ",
              ),
            )}
          </p>
        </div>
      </div>
      {status && (
        <p role="status" className="notice">
          {status}
        </p>
      )}
      {pending.length > 0 && (
        <div className="notice">
          {t(
            L(
              "Ожидают синхронизации:",
              "Pending synchronization:",
              "Синхрондалуды күтуде:",
            ),
          )}{" "}
          {pending.length}
          <button onClick={() => void sync()}>
            {t(L("Синхронизировать", "Sync now", "Синхрондау"))}
          </button>
        </div>
      )}
      {course ? (
        <>
          <Link href="/learn">
            ← {t(L("Все курсы", "All courses", "Барлық курс"))}
          </Link>
          <h2>{t(course.title)}</h2>
          {lesson ? (
            <LessonContent
              key={lesson.id}
              lesson={lesson}
              done={done.includes(lesson.id)}
              pending={pending.some((p) => p.lessonId === lesson.id)}
              onFinish={(answers) => finish(lesson, answers)}
            />
          ) : (
            <p>
              {t(
                L(
                  "Выберите урок. Каждый включает материал, практику и проверку. Практика оценивается самостоятельно.",
                  "Choose a lesson. Each includes reading, practice and assessment. Practice is self-reviewed.",
                  "Сабақты таңдаңыз. Әр сабақта материал, тәжірибе және тексеру бар. Тәжірибе өздігінен бағаланады.",
                ),
              )}
            </p>
          )}
          <ol className="lesson-list">
            {course.lessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  href={`/learn/${course.id}/${l.id}`}
                  aria-current={l.id === lessonId ? "page" : undefined}
                >
                  {done.includes(l.id) ? "✓" : i + 1}. {t(l.title)}{" "}
                  <small>{l.minutes} min</small>
                </Link>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          <label>
            {t(
              L(
                "Поиск по курсам и материалам",
                "Search courses and materials",
                "Курс пен материал іздеу",
              ),
            )}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="grid3">
            {curriculum
              .filter((c) =>
                [...c.title, ...c.lessons.flatMap((l) => l.title)]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c, i) => (
                <Link
                  className="card course-card"
                  href={`/learn/${c.id}`}
                  key={c.id}
                >
                  <span className="course-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>{t(c.title)}</h2>
                  <p>
                    {c.lessons.length} {t(L("уроков", "lessons", "сабақ"))} ·{" "}
                    {c.lessons.reduce((s, l) => s + l.minutes, 0)} min
                  </p>
                  <progress
                    max={c.lessons.length}
                    value={c.lessons.filter((l) => done.includes(l.id)).length}
                  />
                  <p>
                    {c.lessons.filter((l) => done.includes(l.id)).length} /{" "}
                    {c.lessons.length}
                  </p>
                </Link>
              ))}
          </div>
        </>
      )}
    </section>
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
    <article className="lesson card">
      <h3>{t(lesson.title)}</h3>
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
      <h4>
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
      <label className="row">
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
      <h4>{t(L("Проверка знаний", "Knowledge check", "Білімді тексеру"))}</h4>
      {lesson.questions.map((q, qi) => (
        <fieldset key={qi}>
          <legend>
            {qi + 1}. {t(q.q)}
          </legend>
          {orders[qi].map((i) => (
            <label className="answer" key={i}>
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
