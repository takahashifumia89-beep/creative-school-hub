import { resources } from "@/platform/Pages";
import { download } from "@/platform/client";
import { L, useLocale } from "@/platform/locale";
import { useCopy } from "@/platform/copy";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Box,
  Check,
  Flame,
  Heart,
  Layers3,
  Lightbulb,
  Moon,
  Palette,
  Plus,
  Share2,
  Sun,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { PageIntro } from "@/features/shared/PageIntro";
import { Logo } from "@/features/shared/Logo";
import { getCurrentUser, type Profile, type Project } from "@/lib/api";
import { createProject, fetchProfile, fetchProjects } from "@/lib/api";
export function LandingPage({
  isDark,
  onTheme,
}: {
  isDark: boolean;
  onTheme: () => void;
}) {
  const tx = useCopy();
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
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12 lg:px-16">
        <Logo light={isDark} />
        <div className="flex items-center gap-3">
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
      <section className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-12 px-6 pb-20 pt-16 sm:px-12 lg:grid-cols-[1.08fr_.92fr] lg:px-16 lg:pb-32 lg:pt-24">
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
            {tx(
              "Учитесь новому, пробуйте, находите единомышленников и превращайте творческие идеи в проекты.",
            )}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/auth?mode=up"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {tx("Создать аккаунт")}
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
        <div className="relative min-h-[360px] sm:min-h-[440px]">
          <div
            className={`absolute right-2 top-4 h-[70%] w-[74%] rotate-[-6deg] border border-primary/40 p-5 shadow-[16px_18px_0_hsl(15_70%_67%/.4)] ${isDark ? "bg-[#1b1e17]" : "bg-card"}`}
          >
            <div className="flex justify-between font-mono-ui text-[9px] uppercase tracking-widest text-primary">
              <span>{tx("Заметка / 01")}</span>
              <span>01 / 04</span>
            </div>
            <div
              className={`mt-12 text-right font-display text-[clamp(3rem,7vw,6.5rem)] leading-[.82] tracking-[-.08em] ${isDark ? "text-[#f3f0e7]" : "text-foreground"}`}
            >
              {tx("смотри")}
              <br />
              <em className="text-secondary text-[.6em] whitespace-nowrap">
                {tx("внимательнее.")}
              </em>
            </div>
            <p
              className={`absolute bottom-5 left-5 right-5 border-t pt-3 text-[10px] leading-relaxed ${isDark ? "border-white/15 text-white/55" : "border-border text-muted-foreground"}`}
            >
              {tx("Замечайте то, мимо чего другие проходят.")}
            </p>
          </div>
          <div className="absolute bottom-1 left-0 w-[60%] rotate-[6deg] bg-accent/80 p-4 text-foreground shadow-[-8px_10px_0_hsl(70_80%_55%/.5)]">
            <div className="font-mono-ui text-[9px] uppercase">
              {tx("Запись в студии / 07")}
            </div>
            <div className="mt-10 grid grid-cols-4 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className={`h-8 ${item % 3 === 0 ? "bg-secondary" : item % 2 ? "bg-foreground/25" : "bg-foreground"}`}
                />
              ))}
            </div>
            <div className="mt-3 font-display text-lg">
              {tx("Практика, а не бесконечная лента.")}
            </div>
          </div>
        </div>
      </section>
      <section
        className={`relative z-10 border-y px-6 py-10 sm:px-12 lg:px-16 ${isDark ? "border-white/10" : "border-border"}`}
      >
        <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-3">
          {[
            [
              "01",
              tx("Учитесь у практиков"),
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
      <footer className="relative z-10 flex justify-between px-6 py-8 text-xs sm:px-12 lg:px-16">
        <span>© 2026 Creative School</span>
        <span className="font-mono-ui uppercase tracking-wider">
          {tx("Для любознательных")}
        </span>
      </footer>
    </main>
  );
}
export function PortfolioPage({
  onToast,
}: {
  onToast: (text: string) => void;
}) {
  const tx = useCopy();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    void getCurrentUser().then(async ({ user }) => {
      if (!user) return;
      const [p, list] = await Promise.all([
        fetchProfile(user.id),
        fetchProjects(user.id),
      ]);
      setProfile(p.data);
      setProjects(list.data.filter((item) => item.status === "published"));
    });
  }, []);
  const name = profile?.display_name || tx("Ваше имя");
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow={tx("Подборка ваших работ")}
        title={tx("Портфолио.")}
        description={tx(
          "Расскажите о себе и покажите проекты, которыми хотите поделиться.",
        )}
        action={
          <button
            onClick={() => {
              void getCurrentUser().then(async ({ user }) => {
                if (user) {
                  const url = `${window.location.origin}/u/${user.id}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    onToast(tx("Ссылка скопирована."));
                  } catch {
                    onToast(url);
                  }
                }
              });
            }}
            className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold"
          >
            <Share2 className="mr-2 inline" size={14} />
            {tx("Скопировать ссылку")}
          </button>
        }
      />
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row">
          <div>
            <h2 className="font-display text-3xl tracking-[-.05em]">{name}</h2>
            <p className="mt-2 font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
              {tx("Творческий профиль")}
            </p>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {profile?.bio ||
                tx(
                  "Добавьте описание в профиле и расскажите, что вам интересно создавать.",
                )}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-display text-3xl">{projects.length}</div>
            <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
              {tx("Опубликованных проектов")}
            </div>
          </div>
        </div>
      </section>
      <div className="mb-4 mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-[-.05em]">
          {tx("Опубликованные проекты")}
        </h2>
        <Link href="/projects" className="text-xs font-semibold text-primary">
          {tx("Управлять проектами")}
          <ArrowRight className="ml-1 inline" size={13} />
        </Link>
      </div>
      {projects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className={`min-h-56 rounded-2xl p-5 ${index % 2 ? "bg-accent/55" : "bg-secondary/55"}`}
            >
              <div className="font-mono-ui text-[10px] uppercase tracking-widest">
                {tx("Проект /")}
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-20 font-display text-3xl tracking-[-.05em]">
                <Link href={`/p/${project.id}`}>{project.title}</Link>
              </h3>
              <p className="mt-2 text-xs">{project.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="font-display text-xl">{tx("Портфолио пока пусто")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tx("Опубликуйте проект, чтобы он появился в этой подборке.")}
          </p>
        </div>
      )}
    </div>
  );
}
export function MarketplacePage({ onToast }: { onToast: (s: string) => void }) {
  const { t, lang } = useLocale(),
    [filter, setFilter] = useState("all"),
    [favorites, setFavorites] = useState<string[]>(() => {
      try {
        return JSON.parse(localStorage.getItem("cs-favorites") ?? "[]");
      } catch {
        return [];
      }
    });
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageIntro
        eyebrow={t(
          L(
            "Инструменты для творчества",
            "Creative tools",
            "Шығармашылық құралдары",
          ),
        )}
        title={t(L("Магазин.", "Shop.", "Дүкен."))}
        description={t(
          L(
            "Авторские бесплатные материалы Creative School. Лицензия CC0: для личных и коммерческих проектов.",
            "Original free Creative School resources. CC0: for personal and commercial projects.",
            "Creative School авторлық тегін материалдары. CC0: жеке және коммерциялық жобаға.",
          ),
        )}
      />
      <div className="mb-6 flex gap-2 overflow-auto">
        {[
          ["all", L("Все", "All", "Барлығы")],
          ["favorites", L("Избранное", "Favorites", "Таңдаулылар")],
        ].map(([id, label]) => (
          <button
            key={id as string}
            onClick={() => setFilter(id as string)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${filter === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
          >
            {t(label as ReturnType<typeof L>)}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resources
          .filter((r) => filter !== "favorites" || favorites.includes(r.id))
          .map((item, index) => {
            const Icon =
              index === 0 ? Layers3 : index === 1 ? Lightbulb : Palette;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-card p-3"
              >
                <div className="relative grid h-40 place-items-center overflow-hidden rounded-xl bg-accent/45">
                  <Icon size={42} className="text-foreground/70" />
                  <button
                    aria-label={t(
                      L(
                        "Добавить в избранное",
                        "Add to favorites",
                        "Таңдаулыға қосу",
                      ),
                    )}
                    aria-pressed={favorites.includes(item.id)}
                    onClick={() => {
                      const next = favorites.includes(item.id)
                        ? favorites.filter((x) => x !== item.id)
                        : [...favorites, item.id];
                      setFavorites(next);
                      try {
                        localStorage.setItem(
                          "cs-favorites",
                          JSON.stringify(next),
                        );
                      } catch {}
                    }}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80"
                  >
                    <Heart
                      size={15}
                      fill={
                        favorites.includes(item.id) ? "currentColor" : "none"
                      }
                      className={
                        favorites.includes(item.id) ? "text-secondary" : ""
                      }
                    />
                  </button>
                </div>
                <div className="px-1 pb-1 pt-4">
                  <h2 className="font-display text-xl leading-tight">
                    {t(item.title)}
                  </h2>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Creative School · CC0
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-mono-ui text-[10px] text-muted-foreground">
                      {item.type}
                    </span>
                    <span className="font-mono-ui text-sm">
                      {t(L("Бесплатно", "Free", "Тегін"))}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      download(
                        `${item.id}-${lang}.${item.type.toLowerCase()}`,
                        item.id === "palette"
                          ? '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">' +
                              ["#f6f1e7", "#e8590c", "#1b1b22", "#d9e7cb"]
                                .map(
                                  (color, i) =>
                                    `<rect x="${i * 200}" width="200" height="200" fill="${color}"/>`,
                                )
                                .join("") +
                              "</svg>"
                          : t(item.text),
                        item.type === "SVG" ? "image/svg+xml" : "text/plain",
                      );
                      onToast(
                        t(
                          L(
                            "Файл подготовлен.",
                            "Download ready.",
                            "Файл дайын.",
                          ),
                        ),
                      );
                    }}
                    className="mt-3 w-full rounded-lg bg-foreground py-2.5 text-xs font-semibold text-background"
                  >
                    {t(L("Скачать", "Download", "Жүктеу"))}
                  </button>
                </div>
              </article>
            );
          })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        {t(
          L(
            "Платные продажи недоступны: платёжный провайдер и выплаты авторам не подключены.",
            "Paid sales are unavailable: payment processing and creator payouts are not connected.",
            "Ақылы сату қолжетімсіз: төлем провайдері мен автор төлемдері қосылмаған.",
          ),
        )}
      </p>
    </div>
  );
}
