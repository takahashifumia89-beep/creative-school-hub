import { SparkLanding } from "@/platform/SparkSpotlight";
import { EditorLauncher } from "@/platform/EditorLauncher";
import { LanguageSwitcher, L, useLocale } from "@/platform/locale";
import { useCopy } from "@/platform/copy";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { Logo } from "@/features/shared/Logo";
export function LandingPage({
  isDark,
  onTheme,
}: {
  isDark: boolean;
  onTheme: () => void;
}) {
  const tx = useCopy(),
    { t } = useLocale();
  return (
    <main
      className={`min-h-[100dvh] overflow-hidden ${isDark ? "bg-[#121310] text-[#f3f0e7]" : "bg-background text-foreground"}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle at 72% 25%, hsl(70 80% 55% / .16), transparent 28%), linear-gradient(90deg, transparent 49.9%, hsl(42 34% 93% / .08) 50%, transparent 50.1%)"
            : "radial-gradient(circle at 72% 25%, hsl(70 80% 47% / .12), transparent 28%), linear-gradient(90deg, transparent 49.9%, hsl(36 18% 13% / .06) 50%, transparent 50.1%)",
          backgroundSize: "auto, 96px 96px",
        }}
      />
      <header className="cs-landing-header relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-12 lg:px-16">
        <Logo light={isDark} />
        <LanguageSwitcher />
        <div className="cs-landing-actions flex items-center gap-3">
          <button
            onClick={onTheme}
            aria-label={
              isDark
                ? tx("Включить дневной режим")
                : tx("Включить ночной режим")
            }
            aria-pressed={isDark}
            className={`grid h-9 w-9 place-items-center rounded-full border ${isDark ? "border-white/20" : "border-border"}`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link
            href="/auth"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {tx("Войти")}
          </Link>
          <Link
            href="/auth?mode=up"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            {tx("Начать")}
            <ArrowRight className="ml-1 inline" size={14} />
          </Link>
        </div>
      </header>
      <section className="cs-landing-hero relative z-10 mx-auto grid max-w-[1280px] items-center gap-12 px-6 pb-20 pt-16 sm:px-12 lg:grid-cols-[1.08fr_.92fr] lg:px-16 lg:pb-32 lg:pt-24">
        <div>
          <div className="mb-7 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary">
            <span className="h-px w-8 bg-primary" />
            {tx("Пространство для творчества")}
          </div>
          <h1 className="max-w-3xl font-display text-[clamp(3.8rem,8vw,8.4rem)] font-medium leading-[.88] tracking-[-.08em]">
            {tx("Место для")}
            <br />
            <span className="text-primary">{tx("ваших идей.")}</span>
          </h1>
          <p
            className={`mt-9 max-w-md text-base leading-relaxed sm:text-lg ${isDark ? "text-white/60" : "text-muted-foreground"}`}
          >
            {t(
              L(
                "Начните с одной искры. Соберите выразительную работу, узнайте, как она устроена, и сделайте по-своему.",
                "Start with a spark. Make something striking, discover how it works, then make it your own.",
                "Бір ұшқыннан бастаңыз. Ерекше жұмыс жасаңыз, оның құрылымын түсініп, өзіңізше өзгертіңіз.",
              ),
            )}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/spark"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t(L("Зажечь идею", "Make a spark", "Идеяны тұтату"))}
              <ArrowRight className="ml-2 inline" size={16} />
            </Link>
            <Link
              href="/auth"
              className={`rounded-full border px-5 py-3 text-sm ${isDark ? "border-white/20 text-white/80" : "border-border text-muted-foreground"}`}
            >
              {tx("Открыть пространство")}
            </Link>
          </div>
        </div>
        <SparkLanding />
      </section>
      <section
        className={`relative z-10 border-y px-6 py-10 sm:px-12 lg:px-16 ${isDark ? "border-white/10" : "border-border"}`}
      >
        <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-3">
          {[
            [
              "01",
              t(L("Понятные уроки", "Clear lessons", "Түсінікті сабақтар")),
              tx("Разбирайте идеи и осваивайте новые приёмы."),
            ],
            [
              "02",
              tx("Создавайте регулярно"),
              tx("Работайте над своими проектами в удобном ритме."),
            ],
            [
              "03",
              tx("Показывайте результат"),
              tx("Соберите портфолио из работ, которыми гордитесь."),
            ],
          ].map(([number, title, description]) => (
            <div key={number}>
              <div className="font-display text-4xl tracking-[-.06em]">
                {number}
              </div>
              <h2 className="mt-3 font-display text-xl">{title}</h2>
              <p
                className={`mt-2 max-w-[240px] text-sm leading-relaxed ${isDark ? "text-white/55" : "text-muted-foreground"}`}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-[1280px] px-6 py-12 sm:px-12 lg:px-16">
        <div className="cs-section-heading">
          <h2>
            {t(
              L(
                "Одна идея — четыре студии",
                "One idea, four studios",
                "Бір идея — төрт студия",
              ),
            )}
          </h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          {t(
            L(
              "Учитесь, создавайте и собирайте портфолио в одном пространстве.",
              "Learn, create and build a portfolio in one workspace.",
              "Бір кеңістікте оқыңыз, жасаңыз және портфолио жинаңыз.",
            ),
          )}
        </p>
        <EditorLauncher />
      </section>
      <footer className="relative z-10 flex justify-between px-6 py-8 text-xs sm:px-12 lg:px-16">
        <span>© 2026 Creative School</span>
        <span className="font-mono-ui uppercase tracking-wider">
          {tx("Для любознательных")}
        </span>
      </footer>
    </main>
  );
}
