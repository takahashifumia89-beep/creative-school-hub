import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  LoaderCircle,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { api, message, type Project } from "./client";
import { L, useLocale } from "./locale";
import { useSession } from "./session";
import { SparkArtwork } from "./SparkArtwork";
import {
  briefConfig,
  buildSpark,
  readSpark,
  sparkBriefs,
  sparkFormats,
  sparkHref,
  sparkPalettes,
  sparkStyles,
  type SparkConfig,
} from "./spark";
import "./spark.css";

export default function SparkPage() {
  const { t, lang } = useLocale(),
    session = useSession(),
    [, navigate] = useLocation();
  const [config, setConfig] = useState(() =>
      readSpark(window.location.search, lang),
    ),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [share, setShare] = useState(""),
    [copied, setCopied] = useState(false),
    [checks, setChecks] = useState<boolean[]>([]);
  const request = useRef<AbortController | null>(null),
    creation = useRef({ signature: "", id: "" }),
    title = useRef<HTMLTextAreaElement>(null);
  const doc = useMemo(() => buildSpark(config), [config]),
    brief = sparkBriefs.find((b) => b.id === config.brief) ?? sparkBriefs[0];
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    request.current?.abort();
    setPending(false);
    setError("");
  }, [session.user?.id]);
  useEffect(() => {
    setChecks([]);
  }, [config.brief]);
  function change(values: Partial<SparkConfig>) {
    setConfig((c) => ({ ...c, ...values }));
    setShare("");
    setCopied(false);
    setError("");
  }
  function remix() {
    const values = new Uint32Array(3);
    crypto.getRandomValues(values);
    change({
      style:
        sparkStyles[
          (sparkStyles.findIndex((s) => s.id === config.style) +
            1 +
            (values[0] % 2)) %
            3
        ].id,
      palette:
        sparkPalettes[
          (sparkPalettes.findIndex((p) => p.id === config.palette) +
            1 +
            (values[1] % 5)) %
            6
        ].id,
      seed: values[2] % 9999,
    });
  }
  async function openEditor() {
    if (pending || !config.title.trim()) return;
    if (!session.user) {
      navigate(`/auth?next=${encodeURIComponent(sparkHref(config))}`);
      return;
    }
    const signature = session.user.id + JSON.stringify(config);
    if (creation.current.signature !== signature)
      creation.current = { signature, id: crypto.randomUUID() };
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    try {
      const project = await api<Project>(
        "/projects",
        "POST",
        {
          clientId: creation.current.id,
          title: config.title.replace(/\s+/g, " ").trim().slice(0, 120),
          kind: "design",
          content: JSON.stringify(doc),
          description: [
            t(brief.name),
            t(brief.task),
            ...brief.criteria.map((c) => "• " + t(c)),
          ]
            .join("\n")
            .slice(0, 1000),
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      window.dispatchEvent(new Event("creative-school-stats-change"));
      navigate(`/studio/design?project=${project.id}`);
    } catch (e) {
      if (!controller.signal.aborted) setError(t(message(e)));
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }
  async function shareVariation() {
    const link = window.location.origin + sparkHref(config);
    setShare(link);
    setCopied(false);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      /* The selectable link remains available. */
    }
  }
  function chooseBrief(id: string) {
    setConfig(briefConfig(id, lang));
    setError("");
    setShare("");
    setCopied(false);
    document.getElementById("spark-composer")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    title.current?.focus({ preventScroll: true });
  }
  return (
    <main className="spark-page">
      <div className="spark-page-heading">
        <div>
          <p className="spark-eyebrow">
            <Sparkles size={14} />
            {t(
              L(
                "Искра — мастерская идей",
                "Spark — an idea workshop",
                "Ұшқын — идея шеберханасы",
              ),
            )}
          </p>
          <h1>
            {t(
              L("У идеи есть форма.", "Ideas have shape.", "Идеяға пішін бер."),
            )}
          </h1>
        </div>
        <p>
          {t(
            L(
              "Дайте ей цвет. Поймайте ритм.\nСделайте что-то, чего ещё не было.",
              "Give it color. Find a rhythm.\nMake something that wasn't there before.",
              "Оған түс беріңіз. Ырғақты табыңыз.\nБұрын болмаған нәрсені жасаңыз.",
            ),
          )}
        </p>
      </div>
      <div className="spark-step-line">
        <span>
          01 — {t(L("Поймайте идею", "Find an idea", "Идеяны табыңыз"))}
        </span>
        <span>
          02 —{" "}
          {t(L("Поиграйте с формой", "Play with the form", "Пішінмен ойнаңыз"))}
        </span>
        <span>
          03 — {t(L("Сделайте своей", "Make it yours", "Өзіңізше жасаңыз"))}
        </span>
      </div>
      <section
        className="spark-composer"
        id="spark-composer"
        aria-label={t(L("Создание постера", "Poster composer", "Постер жасау"))}
      >
        <div className="spark-canvas-area">
          <div className="spark-canvas-meta">
            <span className="spark-live-dot" />
            {t(L("Живая композиция", "Live composition", "Жанды композиция"))}
            <span>
              {doc.w} × {doc.h}
            </span>
          </div>
          <div className={`spark-canvas spark-format-${config.format}`}>
            <SparkArtwork
              config={config}
              label={t(L("Ваш постер", "Your poster", "Сіздің постеріңіз"))}
            />
          </div>
          <div className="spark-canvas-footer">
            <span>
              {doc.shapes.length}{" "}
              {t(
                L("редактируемых слоёв", "editable layers", "өңделетін қабат"),
              )}
            </span>
            <span>
              {t(
                L(
                  "Всё можно изменить",
                  "Everything is editable",
                  "Бәрін өзгертуге болады",
                ),
              )}{" "}
              ↗
            </span>
          </div>
        </div>
        <div className="spark-controls">
          <fieldset disabled={pending}>
            <legend className="sr-only">
              {t(
                L(
                  "Настройки композиции",
                  "Composition settings",
                  "Композиция баптаулары",
                ),
              )}
            </legend>
            <div className="spark-control-heading">
              <h2>
                {t(L("Ваш характер.", "Your character.", "Сіздің мінезіңіз."))}
              </h2>
              <button
                className="spark-remix"
                onClick={remix}
                title={t(
                  L(
                    "Новые форма и палитра",
                    "New form and palette",
                    "Жаңа пішін және палитра",
                  ),
                )}
              >
                <Shuffle size={15} />
                {t(L("Удиви меня", "Surprise me", "Таңғалдыр"))}
              </button>
            </div>
            <label className="spark-field">
              {t(L("Главные слова", "The big words", "Басты сөздер"))}
              <textarea
                ref={title}
                aria-label={t(
                  L("Главные слова", "The big words", "Басты сөздер"),
                )}
                rows={2}
                maxLength={48}
                value={config.title}
                onChange={(e) => change({ title: e.target.value })}
              />
            </label>
            <label className="spark-field">
              {t(L("Подпись", "The small print", "Қосымша мәтін"))}
              <input
                maxLength={72}
                aria-label={t(L("Подпись", "The small print", "Қосымша мәтін"))}
                value={config.caption}
                onChange={(e) => change({ caption: e.target.value })}
              />
            </label>
            <div className="spark-option-label">
              {t(L("Форма", "Form", "Пішін"))}
            </div>
            <div
              className="spark-segments"
              role="group"
              aria-label={t(
                L("Форма композиции", "Composition form", "Композиция пішіні"),
              )}
            >
              {sparkStyles.map((s, i) => (
                <button
                  key={s.id}
                  aria-pressed={config.style === s.id}
                  onClick={() => change({ style: s.id })}
                >
                  <span aria-hidden="true">{["◎", "▥", "✳"][i]}</span>
                  {t(s.name)}
                </button>
              ))}
            </div>
            <div className="spark-option-label">
              {t(L("Палитра", "Palette", "Палитра"))}
              <span>
                {t(
                  (
                    sparkPalettes.find((p) => p.id === config.palette) ??
                    sparkPalettes[0]
                  ).name,
                )}
              </span>
            </div>
            <div
              className="spark-palette"
              role="group"
              aria-label={t(
                L("Палитра постера", "Poster palette", "Постер палитрасы"),
              )}
            >
              {sparkPalettes.map((p) => (
                <button
                  key={p.id}
                  className="spark-swatch"
                  aria-label={t(p.name)}
                  aria-pressed={config.palette === p.id}
                  style={{ background: p.bg, color: p.ink }}
                  onClick={() => change({ palette: p.id })}
                >
                  {config.palette === p.id ? <Check size={16} /> : <span />}
                </button>
              ))}
            </div>
            <div className="spark-control-row">
              <label className="spark-field">
                {t(L("Формат", "Format", "Пішім"))}
                <select
                  aria-label={t(L("Формат", "Format", "Пішім"))}
                  value={config.format}
                  onChange={(e) =>
                    change({ format: e.target.value as SparkConfig["format"] })
                  }
                >
                  {sparkFormats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {t(f.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="spark-field">
                {t(L("Плотность", "Density", "Тығыздық"))}
                <span className="spark-range">
                  <input
                    type="range"
                    aria-label={t(L("Плотность", "Density", "Тығыздық"))}
                    min="3"
                    max="10"
                    value={config.density}
                    onChange={(e) =>
                      change({ density: Number(e.target.value) })
                    }
                  />
                  <output>{config.density}</output>
                </span>
              </label>
            </div>
          </fieldset>
          {session.error && (
            <div role="alert" className="cs-inline-error">
              {t(session.error)}
              <button onClick={() => void session.refresh()}>
                {t(L("Повторить", "Retry", "Қайталау"))}
              </button>
            </div>
          )}
          {error && (
            <p role="alert" className="cs-inline-error">
              {error}
            </p>
          )}
          <button
            className="spark-button spark-open"
            onClick={() => void openEditor()}
            disabled={pending || session.loading || !config.title.trim()}
          >
            {pending ? (
              <LoaderCircle className="spark-spin" size={17} />
            ) : (
              <ArrowUpRight size={18} />
            )}{" "}
            {t(
              pending
                ? L(
                    "Сохраняем вашу версию…",
                    "Saving your version…",
                    "Нұсқаңыз сақталуда…",
                  )
                : session.user
                  ? L("Открыть в студии", "Open in the studio", "Студияда ашу")
                  : L(
                      "Войти и открыть в студии",
                      "Sign in & open in studio",
                      "Кіріп, студияда ашу",
                    ),
            )}
          </button>
          <p className="spark-save-note">
            {t(
              L(
                "В студии можно двигать каждый элемент, менять текст и экспортировать готовую работу.",
                "Move every element, edit the type and export your finished piece in the studio.",
                "Студияда әр элементті жылжытып, мәтінді өзгертіп, дайын жұмысты экспорттай аласыз.",
              ),
            )}
          </p>
          <button className="spark-share" onClick={() => void shareVariation()}>
            <Copy size={14} />
            {t(
              copied
                ? L("Ссылка скопирована", "Link copied", "Сілтеме көшірілді")
                : L(
                    "Поделиться этой версией",
                    "Share this version",
                    "Осы нұсқамен бөлісу",
                  ),
            )}
          </button>
          {share && (
            <label className="spark-share-link">
              {t(
                L(
                  "Ссылка содержит текст постера",
                  "The link includes your poster text",
                  "Сілтемеде постер мәтіні бар",
                ),
              )}
              <input
                readOnly
                value={share}
                onFocus={(e) => e.target.select()}
              />
            </label>
          )}
        </div>
      </section>
      <section
        className="spark-active-brief"
        aria-label={t(
          L("Творческое задание", "Creative brief", "Шығармашылық тапсырма"),
        )}
      >
        <div>
          <p className="spark-eyebrow">
            {t(L("Учебный бриф", "Practice brief", "Оқу брифі"))} /{" "}
            {brief.minutes} {t(L("мин", "min", "мин"))}
          </p>
          <h2>{t(brief.name)}</h2>
          <p>{t(brief.task)}</p>
          <Link href={brief.lesson}>
            {t(
              L(
                "Нужна опора? Открыть урок",
                "Need a starting point? Read the lesson",
                "Көмек керек пе? Сабақты ашу",
              ),
            )}
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <fieldset>
          <legend>
            {t(
              L(
                "Проверка перед публикацией",
                "Before you publish",
                "Жариялау алдындағы тексеріс",
              ),
            )}
          </legend>
          {brief.criteria.map((c, i) => (
            <label key={i}>
              <input
                type="checkbox"
                checked={!!checks[i]}
                onChange={(e) =>
                  setChecks((v) => {
                    const next = [...v];
                    next[i] = e.target.checked;
                    return next;
                  })
                }
              />
              <span>{t(c)}</span>
            </label>
          ))}
          <small>
            {t(
              L(
                "Отметьте сами, когда будете довольны результатом.",
                "Check these off when you're happy with the result.",
                "Нәтижеге көңіліңіз толғанда өзіңіз белгілеңіз.",
              ),
            )}
          </small>
        </fieldset>
      </section>
      <section className="spark-briefs">
        <div className="spark-section-heading">
          <div>
            <p className="spark-eyebrow">
              {t(
                L(
                  "Есть с чего начать",
                  "A place to begin",
                  "Бастауға негіз бар",
                ),
              )}
            </p>
            <h2>
              {t(
                L(
                  "Три повода создать.",
                  "Three reasons to create.",
                  "Жасауға үш себеп.",
                ),
              )}
            </h2>
          </div>
          <p>
            {t(
              L(
                "Учебные задачи. Ваши собственные решения.",
                "Practice briefs. Your own solutions.",
                "Оқу тапсырмалары. Өзіңіздің шешімдеріңіз.",
              ),
            )}
          </p>
        </div>
        <div className="spark-brief-grid">
          {sparkBriefs.map((b, i) => (
            <article key={b.id}>
              <button
                className="spark-brief-preview"
                disabled={pending}
                onClick={() => chooseBrief(b.id)}
                aria-label={`${t(L("Выбрать бриф", "Choose brief", "Бриф таңдау"))}: ${t(b.name)}`}
              >
                <SparkArtwork
                  config={briefConfig(b.id, lang)}
                  label={t(b.name)}
                />
                <span>
                  0{i + 1}
                  <ArrowUpRight size={21} />
                </span>
              </button>
              <div className="spark-brief-info">
                <small>
                  {b.minutes}{" "}
                  {t(
                    L(
                      "минут / учебный проект",
                      "minutes / practice project",
                      "минут / оқу жобасы",
                    ),
                  )}
                </small>
                <h3>{t(b.name)}</h3>
                <p>{t(b.task)}</p>
                <button disabled={pending} onClick={() => chooseBrief(b.id)}>
                  {t(
                    L(
                      "Попробовать этот бриф",
                      "Try this brief",
                      "Осы брифті байқап көру",
                    ),
                  )}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer className="spark-page-footer">
        <Link href={session.user ? "/dashboard" : "/"}>
          <ArrowLeft size={15} />
          {t(L("В пространство", "Back to the workspace", "Кеңістікке оралу"))}
        </Link>
        <span>
          CREATIVE SCHOOL /{" "}
          {t(L("Сделано вами", "Made by you", "Сіз жасадыңыз"))}
        </span>
      </footer>
    </main>
  );
}
