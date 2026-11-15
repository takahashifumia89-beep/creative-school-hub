import { PracticeLaunch } from "./PracticeLaunch";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { lessonMaterials } from "./lesson-materials";
import { readingRu } from "./reading-ru";
import type { Lesson } from "./curriculum";
import {
  shuffleIndexes,
  type QuestionFeedback,
  type SubmissionResult,
} from "./assessment";
import { L, useLocale } from "./locale";
import { download } from "./client";
import "./learning-reader.css";
export function LessonReader({
  userId,
  lesson,
  done,
  pending,
  onFinish,
  nextHref,
}: {
  userId: string;
  lesson: Lesson;
  done: boolean;
  pending: boolean;
  onFinish: (answers: number[]) => Promise<SubmissionResult>;
  nextHref?: string;
}) {
  const { t, lang } = useLocale(),
    m = lessonMaterials[lesson.id];
  const [picks, setPicks] = useState<number[]>(lesson.questions.map(() => -1)),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [feedback, setFeedback] = useState<QuestionFeedback[] | null>(null),
    [retake, setRetake] = useState(false),
    [failure, setFailure] = useState("");
  const [orders] = useState(() =>
    lesson.questions.map((q) => shuffleIndexes(q.options.length)),
  );
  const key = `cs-lesson-note:${userId}:${lesson.id}`;
  const [notes, setNotes] = useState(() => {
      try {
        return localStorage.getItem(key) ?? "";
      } catch {
        return "";
      }
    }),
    [noteError, setNoteError] = useState(false);
  useEffect(() => {
    try {
      if (notes) localStorage.setItem(key, notes);
      else localStorage.removeItem(key);
      setNoteError(false);
    } catch {
      setNoteError(true);
    }
  }, [notes, key]);
  const completed = done && !retake;
  const exportReading = () =>
    download(
      `${lesson.id}-${lang}.txt`,
      [
        t(lesson.title),
        t(lesson.body),
        ...(m?.sections.flatMap((section) => [
          t(section.title),
          ...section.paragraphs.map(t),
        ]) ?? []),
        m ? t(m.workedExample.brief) : "",
        ...(m?.workedExample.steps.map(t) ?? []),
        m ? t(m.workedExample.result) : "",
        m ? t(m.practice.brief) : t(lesson.task),
        ...(m?.practice.steps.map(t) ?? []),
        ...(m?.sources.map(
          (source) => `${source.publisher}: ${source.title} — ${source.url}`,
        ) ?? []),
      ]
        .filter(Boolean)
        .join("\n\n"),
      "text/plain",
    );
  return (
    <article className="lesson-reader">
      <header className="lesson-heading">
        <span>
          {m?.minutes ?? lesson.minutes}{" "}
          {t(L("мин с практикой", "min including practice", "мин тәжірибемен"))}{" "}
          · {lesson.questions.length} {t(L("вопроса", "questions", "сұрақ"))}
        </span>
        <h3>{t(lesson.title)}</h3>
        <p>{t(lesson.body)}</p>
        <button onClick={exportReading}>
          {t(
            L(
              "Скачать конспект",
              "Download reading notes",
              "Конспектіні жүктеу",
            ),
          )}{" "}
          ↓
        </button>
      </header>
      {m && (
        <>
          <section className="lesson-objectives">
            <h4>
              {t(
                L(
                  "После урока вы сможете",
                  "After this lesson you can",
                  "Сабақтан кейін сіз",
                ),
              )}
            </h4>
            <ul>
              {m.objectives.map((o, i) => (
                <li key={i}>{t(o)}</li>
              ))}
            </ul>
          </section>
          <nav
            className="lesson-outline"
            aria-label={t(
              L("Оглавление урока", "Lesson outline", "Сабақ мазмұны"),
            )}
          >
            {m.sections.map((section, i) => (
              <a href={`#lesson-section-${i}`} key={i}>
                {String(i + 1).padStart(2, "0")} {t(section.title)}
              </a>
            ))}
            <a href="#lesson-example">
              {t(L("Разобранный пример", "Worked example", "Талданған мысал"))}
            </a>
            <a href="#lesson-practice">
              {t(L("Практика", "Practice", "Тәжірибе"))}
            </a>
            <a href="#lesson-quiz">
              {t(L("Проверка знаний", "Knowledge check", "Білімді тексеру"))}
            </a>
          </nav>
          {m.sections.map((section, i) => (
            <section
              className="lesson-reading"
              id={`lesson-section-${i}`}
              key={i}
            >
              <h4>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {t(section.title)}
              </h4>
              {section.paragraphs.map((text, j) => (
                <p key={j}>{t(text)}</p>
              ))}
            </section>
          ))}
          <section className="lesson-example" id="lesson-example">
            <span className="lesson-kicker">
              {t(
                L("Разбираем на примере", "Worked example", "Мысалмен талдау"),
              )}
            </span>
            <h4>{t(m.workedExample.brief)}</h4>
            <ol>
              {m.workedExample.steps.map((step, i) => (
                <li key={i}>
                  <span>{i + 1}</span>
                  <p>{t(step)}</p>
                </li>
              ))}
            </ol>
            <p className="lesson-result">
              <strong>{t(L("Результат: ", "Result: ", "Нәтиже: "))}</strong>
              {t(m.workedExample.result)}
            </p>
          </section>
        </>
      )}
      <section className="lesson-practice" id="lesson-practice">
        <span className="lesson-kicker">
          {t(L("Теперь ваша очередь", "Your turn", "Енді сіздің кезегіңіз"))}
        </span>
        <h4>
          {t(
            L(
              "Практическое задание",
              "Practice assignment",
              "Тәжірибелік тапсырма",
            ),
          )}
        </h4>
        <p>{m ? t(m.practice.brief) : t(lesson.task)}</p>
        {m && (
          <>
            <ol>
              {m.practice.steps.map((step, i) => (
                <li key={i}>{t(step)}</li>
              ))}
            </ol>
            <h5>{t(L("Что сохранить", "Deliverables", "Не сақтау керек"))}</h5>
            <ul>
              {m.practice.deliverables.map((item, i) => (
                <li key={i}>{t(item)}</li>
              ))}
            </ul>
            <h5>
              {t(
                L(
                  "Проверьте перед завершением",
                  "Review before completing",
                  "Аяқтар алдында тексеріңіз",
                ),
              )}
            </h5>
            <ul className="lesson-checklist">
              {m.checklist.map((item, i) => (
                <li key={i}>
                  <span>□</span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </>
        )}
        <PracticeLaunch
          userId={userId}
          lessonId={lesson.id}
          title={t(lesson.title)}
          brief={m ? t(m.practice.brief) : t(lesson.task)}
        />
        <label className="lesson-reviewed">
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
        <small>
          {t(
            L(
              "Самостоятельная практика. Тест проверяет понимание материала, а не качество вашего проекта.",
              "Practice is self-reviewed. The quiz checks understanding, not the quality of your project.",
              "Тәжірибе өздігінен бағаланады. Тест жоба сапасын емес, материалды түсінуді тексереді.",
            ),
          )}
        </small>
      </section>
      <section className="lesson-notes">
        <label htmlFor={`notes-${lesson.id}`}>
          {t(
            L(
              "Мои заметки по уроку",
              "My lesson notes",
              "Сабақ бойынша жазбаларым",
            ),
          )}
        </label>
        <textarea
          id={`notes-${lesson.id}`}
          maxLength={8000}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t(
            L(
              "Что вы поняли? Где примените этот приём?",
              "What did you learn? Where will you use this technique?",
              "Не үйрендіңіз? Бұл тәсілді қайда қолданасыз?",
            ),
          )}
        />
        <small>
          {t(
            noteError
              ? L(
                  "Заметки не сохранены. Скачайте свою копию.",
                  "Notes could not be saved. Download a copy.",
                  "Жазбалар сақталмады. Көшірмесін жүктеңіз.",
                )
              : L(
                  "Сохраняется на этом устройстве для вашего аккаунта.",
                  "Saved on this device for your account.",
                  "Осы құрылғыда сіздің аккаунтыңыз үшін сақталады.",
                ),
          )}
        </small>
        {notes && (
          <button
            onClick={() =>
              download(`${lesson.id}-my-notes.txt`, notes, "text/plain")
            }
          >
            {t(
              L(
                "Скачать мои заметки",
                "Download my notes",
                "Жазбаларымды жүктеу",
              ),
            )}
          </button>
        )}
      </section>
      <section className="lesson-quiz" id="lesson-quiz">
        <h4>{t(L("Проверка знаний", "Knowledge check", "Білімді тексеру"))}</h4>
        <p>
          {t(
            L(
              "Ответьте на каждый вопрос. После отправки появится объяснение решения.",
              "Answer every question. Explanations appear after submission.",
              "Әр сұраққа жауап беріңіз. Жібергеннен кейін шешім түсіндірмесі көрсетіледі.",
            ),
          )}
        </p>
        {lesson.questions.map((q, qi) => (
          <fieldset
            key={qi}
            aria-describedby={
              feedback?.[qi] ? `question-feedback-${qi}` : undefined
            }
          >
            <legend>
              {qi + 1}. {t(q.q)}
            </legend>
            {orders[qi].map((i) => (
              <label key={i} className={picks[qi] === i ? "is-selected" : ""}>
                <input
                  type="radio"
                  name={`${lesson.id}-${qi}`}
                  checked={picks[qi] === i}
                  disabled={busy}
                  onChange={() => {
                    setPicks((p) => p.map((v, k) => (k === qi ? i : v)));
                    setFeedback(null);
                    setFailure("");
                  }}
                />
                {t(q.options[i])}
              </label>
            ))}
            {feedback?.[qi] && (
              <div
                id={`question-feedback-${qi}`}
                className={`lesson-feedback ${feedback[qi].correct ? "is-correct" : "is-incorrect"}`}
              >
                <strong>
                  {t(
                    feedback[qi].correct
                      ? L("Верно", "Correct", "Дұрыс")
                      : L(
                          "Разберём ответ",
                          "Review this answer",
                          "Жауапты талдайық",
                        ),
                  )}
                </strong>
                {!feedback[qi].correct && q.options[feedback[qi].answer] && (
                  <p>{t(q.options[feedback[qi].answer])}</p>
                )}
                <p>{t(feedback[qi].explanation)}</p>
              </div>
            )}
          </fieldset>
        ))}
        {failure && (
          <p role="alert" className="lesson-submit-error">
            {failure}
          </p>
        )}
        {completed ? (
          <div className="lesson-completed">
            <button disabled>
              {t(L("Пройдено", "Completed", "Аяқталды"))}
            </button>
            <button
              onClick={() => {
                setRetake(true);
                setFeedback(null);
                setPicks(lesson.questions.map(() => -1));
              }}
            >
              {t(L("Повторить тест", "Retake quiz", "Тестті қайталау"))}
            </button>
          </div>
        ) : (
          <button
            className="lesson-submit"
            disabled={pending || busy || !review || picks.some((p) => p < 0)}
            onClick={async () => {
              setBusy(true);
              setFailure("");
              try {
                const result = await onFinish(picks);
                if (result.feedback) setFeedback(result.feedback);
                if (result.kind === "failed") setFailure(result.error ?? "");
                if (result.kind === "passed") setRetake(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {pending
              ? t(L("В очереди", "Queued", "Кезекте"))
              : busy
                ? t(L("Проверяем…", "Checking…", "Тексерілуде…"))
                : t(
                    done
                      ? L(
                          "Проверить повторение",
                          "Check retake",
                          "Қайталауды тексеру",
                        )
                      : L(
                          "Проверить ответы · +10 XP",
                          "Submit answers · +10 XP",
                          "Жауапты тексеру · +10 XP",
                        ),
                  )}
          </button>
        )}
        {!review && !completed && (
          <small>
            {t(
              L(
                "Сначала выполните практику и отметьте самопроверку.",
                "Complete the practice and mark self-review first.",
                "Алдымен тәжірибені орындап, өзіндік тексеруді белгілеңіз.",
              ),
            )}
          </small>
        )}
      </section>
      {m && (
        <section className="lesson-sources">
          <h4>
            {t(
              L(
                "Источники и дальнейшее изучение",
                "Sources and further study",
                "Дереккөздер және тереңдетіп оқу",
              ),
            )}
          </h4>
          <p>
            {t(
              L(
                "Урок — самостоятельное объяснение темы. Ссылки ведут на документацию и учебные материалы издателей; язык источника может отличаться от языка сайта.",
                "This lesson is an original explanation. Links open publisher documentation and training resources; source languages may differ from this site.",
                "Сабақ — тақырыптың дербес түсіндірмесі. Сілтемелер баспагер құжаттамасы мен оқу материалдарына апарады; дереккөз тілі сайт тілінен өзгеше болуы мүмкін.",
              ),
            )}
          </p>
          <ul>
            {m.sources.map((source, i) => (
              <li key={i}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <span>{source.publisher}</span>
                  {source.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {lang === "ru" && readingRu[lesson.id] && (
        <details className="lesson-legacy">
          <summary>Дополнительное чтение из исходной версии курса</summary>
          {readingRu[lesson.id].body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </details>
      )}
      <footer className="lesson-footer">
        <a href="#lesson-quiz">
          {t(L("К проверке знаний", "Back to quiz", "Тестке оралу"))} ↑
        </a>
        {nextHref && (
          <Link
            href={nextHref}
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
          >
            {t(L("Следующий урок", "Next lesson", "Келесі сабақ"))} →
          </Link>
        )}
      </footer>
    </article>
  );
}
