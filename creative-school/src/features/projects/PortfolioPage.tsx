import { useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Check, Copy, UserRound } from "lucide-react";
import { PageIntro } from "@/features/shared/PageIntro";
import { L, useLocale } from "@/platform/locale";
import { useWorkspace } from "@/platform/use-workspace";
import { PageLoading } from "@/platform/PageLoading";
import { ProjectTile } from "@/platform/ProjectTile";
export function PortfolioPage({
  onToast,
}: {
  onToast: (text: string) => void;
}) {
  const { t } = useLocale(),
    { data, loading, error, refresh } = useWorkspace(),
    [copied, setCopied] = useState(false),
    [visible, setVisible] = useState(24),
    url = useRef<HTMLInputElement>(null);
  const projects = (data?.projects ?? []).filter(
      (p) => p.status === "published" && p.visibility === "public",
    ),
    link = data?.userId ? `${window.location.origin}/u/${data.userId}` : "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      onToast(
        t(L("Ссылка скопирована.", "Link copied.", "Сілтеме көшірілді.")),
      );
    } catch {
      url.current?.focus();
      url.current?.select();
      onToast(
        t(
          L(
            "Выделите и скопируйте ссылку.",
            "Select and copy the link.",
            "Сілтемені белгілеп, көшіріңіз.",
          ),
        ),
      );
    }
  }
  return (
    <div className="cs-page">
      <PageIntro
        eyebrow={t(
          L(
            "Подборка ваших работ",
            "A collection of your work",
            "Жұмыстарыңыздың жинағы",
          ),
        )}
        title={t(L("Портфолио.", "Portfolio.", "Портфолио."))}
        description={t(
          L(
            "У каждой работы есть автор. Покажите результат и расскажите, как вы к нему пришли.",
            "Every piece has a creator. Show the result and the thinking behind it.",
            "Әр жұмыстың авторы бар. Нәтижені көрсетіп, оған қалай жеткеніңізді айтып беріңіз.",
          ),
        )}
        action={
          <Link className="cs-action" href="/settings">
            {t(L("Изменить профиль", "Edit profile", "Профильді өзгерту"))}
            <ArrowUpRight size={14} />
          </Link>
        }
      />
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
            <section className="cs-portfolio-profile">
              <div className="cs-avatar" aria-hidden="true">
                {data.profile?.displayName
                  ?.trim()
                  .slice(0, 2)
                  .toUpperCase() || <UserRound size={26} />}
              </div>
              <div>
                <h2>
                  {data.profile?.displayName ||
                    t(L("Ваш профиль", "Your profile", "Сіздің профиліңіз"))}
                </h2>
                <p>
                  {data.profile?.bio ||
                    t(
                      L(
                        "Добавьте пару слов о себе в настройках — это описание увидят посетители портфолио.",
                        "Add a short bio in Settings so visitors know who is behind the work.",
                        "Баптауларда өзіңіз туралы қысқаша жазыңыз — портфолио қонақтары оны көреді.",
                      ),
                    )}
                </p>
                <span>
                  {projects.length}{" "}
                  {t(L("открытых работ", "public projects", "ашық жұмыс"))}
                </span>
              </div>
            </section>
            <section className="cs-portfolio-share">
              <label htmlFor="portfolio-link">
                {t(
                  L(
                    "Ссылка на портфолио",
                    "Portfolio link",
                    "Портфолио сілтемесі",
                  ),
                )}
              </label>
              <div>
                <input
                  ref={url}
                  id="portfolio-link"
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button className="cs-action" onClick={() => void copy()}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>
                    {t(
                      L("Скопировать ссылку", "Copy link", "Сілтемені көшіру"),
                    )}
                  </span>
                </button>
                <Link className="cs-action" href={`/u/${data.userId}`}>
                  {t(L("Посмотреть", "Preview", "Қарау"))}
                  <ArrowUpRight size={14} />
                </Link>
              </div>
              <p>
                {t(
                  L(
                    "Здесь видны только опубликованные работы с открытым доступом. Личные черновики и проекты «по ссылке» в подборку не входят.",
                    "Only published, public projects appear here. Private drafts and unlisted work stay out of this collection.",
                    "Мұнда тек ашық қолжетімді жарияланған жұмыстар көрінеді. Жеке нобайлар мен сілтеме арқылы берілетін жобалар жинаққа кірмейді.",
                  ),
                )}
              </p>
            </section>
            <div className="cs-section-heading">
              <h2>
                {t(
                  L(
                    "Опубликованные работы",
                    "Published work",
                    "Жарияланған жұмыстар",
                  ),
                )}
              </h2>
              <Link href="/projects?status=published">
                {t(
                  L(
                    "Управлять проектами",
                    "Manage projects",
                    "Жобаларды басқару",
                  ),
                )}{" "}
                →
              </Link>
            </div>
            {projects.length ? (
              <>
                <div className="cs-project-grid">
                  {projects.slice(0, visible).map((p) => (
                    <ProjectTile key={p.id} project={p} publicLink />
                  ))}
                </div>
                {projects.length > visible && (
                  <button
                    className="cs-action cs-load-more"
                    onClick={() => setVisible((n) => n + 24)}
                  >
                    {t(L("Показать ещё", "Show more", "Тағы көрсету"))}
                  </button>
                )}
              </>
            ) : (
              <div className="cs-home-empty">
                <h2>
                  {t(
                    L(
                      "Выберите работу, которой гордитесь",
                      "Choose work you are proud of",
                      "Мақтан тұтатын жұмысыңызды таңдаңыз",
                    ),
                  )}
                </h2>
                <p>
                  {t(
                    L(
                      "Опубликуйте готовый проект из своей библиотеки — он появится здесь и по вашей публичной ссылке.",
                      "Publish a finished project from your library to add it here and to your public link.",
                      "Кітапханаңыздан дайын жобаны жариялаңыз — ол осында және ашық сілтемеңізде пайда болады.",
                    ),
                  )}
                </p>
                <Link className="cs-action cs-action-primary" href="/projects">
                  {t(L("Выбрать проект", "Choose a project", "Жоба таңдау"))}
                </Link>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
