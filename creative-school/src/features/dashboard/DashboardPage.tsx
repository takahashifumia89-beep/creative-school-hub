import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  Flame,
  PenLine,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { SparkSpotlight } from "@/platform/SparkSpotlight";
import { PageIntro } from "@/features/shared/PageIntro";
import { L, useLocale } from "@/platform/locale";
import { useWorkspace } from "@/platform/use-workspace";
import { useSession } from "@/platform/session";
import { api, message } from "@/platform/client";
import type { Stats } from "@/lib/api";
import { courseIndex as curriculum } from "@/platform/course-index";
import { nextLesson, readResume } from "@/platform/resume";
import { EditorLauncher } from "@/platform/EditorLauncher";
import { ProjectTile } from "@/platform/ProjectTile";
import { PageLoading } from "@/platform/PageLoading";
export function DashboardPage({
  onToast,
}: {
  onToast: (text: string) => void;
}) {
  const { t } = useLocale(),
    { user } = useSession(),
    { data, loading, error, refresh } = useWorkspace(),
    [stats, setStats] = useState<Stats | null>(null),
    [statsError, setStatsError] = useState(""),
    [practicing, setPracticing] = useState(false),
    controller = useRef<AbortController | null>(null);
  const loadStats = async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setStatsError("");
    try {
      const next = await api<Stats>("/stats", "GET", undefined, c.signal);
      if (!c.signal.aborted) setStats(next);
    } catch (e) {
      if (!c.signal.aborted) setStatsError(t(message(e)));
    }
  };
  useEffect(() => {
    void loadStats();
    return () => controller.current?.abort();
  }, [user?.id]);
  const lessons = curriculum.flatMap((c) => c.lessons),
    known = new Set(lessons.map((l) => l.id)),
    completed = new Set((data?.done ?? []).filter((id) => known.has(id))),
    next = nextLesson([...completed], user ? readResume(user.id) : null),
    recent = (data?.projects ?? [])
      .filter((p) => p.status !== "archived" && p.status !== "blocked")
      .slice(0, 6),
    name =
      data?.profile?.displayName?.split(" ")[0] ||
      t(L("Творец", "Creator", "Жасампаз"));
  async function practice() {
    setPracticing(true);
    try {
      const r = await api<{ awarded: boolean; xp: number }>(
        "/practice",
        "POST",
        {},
      );
      onToast(
        r.awarded
          ? t(
              L(
                `Практика отмечена: +${r.xp} XP.`,
                `Practice recorded: +${r.xp} XP.`,
                `Тәжірибе белгіленді: +${r.xp} XP.`,
              ),
            )
          : t(
              L(
                "Сегодня практика уже отмечена.",
                "Today's practice is already recorded.",
                "Бүгінгі тәжірибе белгіленген.",
              ),
            ),
      );
      window.dispatchEvent(new Event("creative-school-stats-change"));
      await loadStats();
    } catch (e) {
      setStatsError(t(message(e)));
    } finally {
      setPracticing(false);
    }
  }
  return (
    <div className="cs-page">
      <PageIntro
        eyebrow={t(
          L("Ваше пространство", "Your workspace", "Сіздің кеңістігіңіз"),
        )}
        title={t(
          L(
            `Добро пожаловать, ${name}.`,
            `Welcome, ${name}.`,
            `Қош келдіңіз, ${name}.`,
          ),
        )}
        description={t(
          L(
            "Продолжайте начатое или дайте место новой идее.",
            "Pick up where you left off or make room for a new idea.",
            "Бастағаныңызды жалғастырыңыз не жаңа идеяға орын беріңіз.",
          ),
        )}
        action={
          <button
            className="cs-action cs-action-primary"
            disabled={practicing || loading}
            onClick={() => void practice()}
          >
            <PenLine size={14} />
            {t(
              L("Отметить практику", "Record practice", "Тәжірибені белгілеу"),
            )}
          </button>
        }
      />
      <SparkSpotlight />
      {error && (
        <div role="alert" className="cs-inline-error">
          {error}
          <button onClick={() => void refresh()}>
            {t(L("Повторить", "Retry", "Қайталау"))}
          </button>
        </div>
      )}
      {loading && !data ? (
        <PageLoading />
      ) : (
        data && (
          <>
            <div className="cs-home-grid">
              <section className="cs-home-hero">
                <span className="cs-eyebrow">
                  {t(
                    L(
                      "Ваш следующий шаг",
                      "Your next step",
                      "Келесі қадамыңыз",
                    ),
                  )}
                </span>
                <h2>
                  {next
                    ? t(next.lesson.title)
                    : t(
                        L(
                          "Дальше — ваша практика.",
                          "Now make it your own.",
                          "Енді өз тәжірибеңізді бастаңыз.",
                        ),
                      )}
                </h2>
                <p>
                  {next
                    ? `${t(next.course.title)} · ${next.lesson.minutes} ${t(L("минут", "minutes", "минут"))}`
                    : t(
                        L(
                          "Все уроки пройдены. Примените знания в новой работе.",
                          "All lessons completed. Put what you learned into a new piece.",
                          "Барлық сабақ аяқталды. Біліміңізді жаңа жұмысқа қолданыңыз.",
                        ),
                      )}
                </p>
                <Link
                  className="cs-action cs-action-primary"
                  href={
                    next
                      ? `/learn/${next.course.id}/${next.lesson.id}`
                      : "/studio/design"
                  }
                >
                  {t(
                    next
                      ? L(
                          "Продолжить обучение",
                          "Continue learning",
                          "Оқуды жалғастыру",
                        )
                      : L("Создать проект", "Create a project", "Жоба жасау"),
                  )}
                  <ArrowRight size={15} />
                </Link>
                <div className="cs-learning-progress">
                  <span>
                    {completed.size}/{lessons.length}{" "}
                    {t(
                      L(
                        "уроков пройдено",
                        "lessons completed",
                        "сабақ аяқталды",
                      ),
                    )}
                  </span>
                  <progress max={lessons.length} value={completed.size} />
                </div>
              </section>
              <section className="cs-home-rhythm">
                <Flame size={22} />
                <h2>{t(L("Ваш ритм", "Your rhythm", "Сіздің ырғағыңыз"))}</h2>
                {stats ? (
                  <>
                    <strong>
                      {stats.weekDays}
                      <small> / {stats.weekGoal}</small>
                    </strong>
                    <p>
                      {t(
                        L(
                          "дней практики на этой неделе",
                          "practice days this week",
                          "осы аптадағы тәжірибе күндері",
                        ),
                      )}
                    </p>
                    <div
                      className="cs-week-dots"
                      aria-label={t(
                        L(
                          "Прогресс недели",
                          "Weekly progress",
                          "Апта прогресі",
                        ),
                      )}
                    >
                      {Array.from({ length: stats.weekGoal }, (_, i) => (
                        <span
                          key={i}
                          className={i < stats.weekDays ? "is-done" : ""}
                        >
                          {i < stats.weekDays ? <Check size={13} /> : "·"}
                        </span>
                      ))}
                    </div>
                    <small>
                      {t(
                        L(
                          `Уровень ${stats.level} · ${stats.xp} XP`,
                          `Level ${stats.level} · ${stats.xp} XP`,
                          `${stats.level}-деңгей · ${stats.xp} XP`,
                        ),
                      )}
                    </small>
                  </>
                ) : (
                  <p>
                    {t(
                      L(
                        "Загружаем прогресс…",
                        "Loading progress…",
                        "Прогресс жүктелуде…",
                      ),
                    )}
                  </p>
                )}
              </section>
            </div>
            {data.incomingRequests > 0 && (
              <Link href="/marketplace?tab=inbox" className="cs-inbox-callout">
                <ShoppingBag size={19} />
                <span>
                  {t(
                    L(
                      `Новых заявок на ваши услуги: ${data.incomingRequests}`,
                      `Requests waiting for your reply: ${data.incomingRequests}`,
                      `Жауабыңызды күтетін өтінімдер: ${data.incomingRequests}`,
                    ),
                  )}
                </span>
                <ArrowRight size={16} />
              </Link>
            )}
            <div className="cs-section-heading">
              <h2>
                {t(
                  L("Начните с идеи", "Start with an idea", "Идеядан бастаңыз"),
                )}
              </h2>
              <Link href="/studio/notes">
                {t(L("Записать мысль", "Write a note", "Ойды жазу"))} ↗
              </Link>
            </div>
            <EditorLauncher />
            <div className="cs-section-heading">
              <h2>
                {t(L("Последние работы", "Recent work", "Соңғы жұмыстар"))}
              </h2>
              <Link href="/projects">
                {t(L("Все проекты", "All projects", "Барлық жобалар"))} →
              </Link>
            </div>
            {recent.length ? (
              <div className="cs-project-grid">
                {recent.map((p) => (
                  <ProjectTile key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <div className="cs-home-empty">
                <Sparkles size={24} />
                <h3>
                  {t(
                    L(
                      "Здесь появятся ваши первые работы",
                      "Your first projects will appear here",
                      "Алғашқы жұмыстарыңыз осында пайда болады",
                    ),
                  )}
                </h3>
                <p>
                  {t(
                    L(
                      "Выберите студию выше. Изменения сохраняются в вашем аккаунте.",
                      "Choose a studio above. Your edits are saved to your account.",
                      "Жоғарыдағы студияны таңдаңыз. Өзгерістер аккаунтыңызда сақталады.",
                    ),
                  )}
                </p>
              </div>
            )}
            <div className="cs-home-links">
              <Link href="/portfolio">
                {t(
                  L(
                    "Собрать портфолио",
                    "Build your portfolio",
                    "Портфолио жинау",
                  ),
                )}{" "}
                ↗
              </Link>
              <Link href="/marketplace?tab=mine">
                {t(
                  L(
                    "Предложить свою услугу",
                    "Offer your service",
                    "Қызметіңізді ұсыну",
                  ),
                )}{" "}
                ↗
              </Link>
            </div>
          </>
        )
      )}
      {statsError && (
        <div role="alert" className="cs-inline-error">
          {statsError}
          <button onClick={() => void loadStats()}>
            {t(L("Обновить прогресс", "Refresh progress", "Прогресті жаңарту"))}
          </button>
        </div>
      )}
    </div>
  );
}
