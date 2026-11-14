import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  X,
  Send,
  Square,
  Trash2,
  Copy,
  Download,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { api, ApiError, download, message } from "./client";
import { L, useLocale, type Localized } from "./locale";
import {
  summarizeStudioProject,
  type AssistantReply,
} from "./assistant-context";
import type { ProjectKind } from "./schema";
import "./studio-assistant.css";

const copy = {
  title: L("ИИ-помощник", "AI assistant", "ЖИ көмекшісі"),
  close: L("Закрыть помощника", "Close assistant", "Көмекшіні жабу"),
  question: L("Вопрос помощнику", "Ask the assistant", "Көмекшіге сұрақ"),
  empty: L("С чего начнём?", "What are you working on?", "Неден бастаймыз?"),
  intro: L(
    "Помогу составить план, разобраться в инструментах и улучшить работу. Изменения в редакторе выполняете вы.",
    "I can help you plan, understand the tools and refine your work. You make the changes in the editor.",
    "Жоспар құруға, құралдарды түсінуге және жұмысты жақсартуға көмектесемін. Редактордағы өзгерістерді өзіңіз жасайсыз.",
  ),
};
const prompts: Record<ProjectKind, { label: Localized; text: Localized }[]> = {
  design: [
    {
      label: L("План макета", "Layout plan", "Макет жоспары"),
      text: L(
        "Помоги спланировать выразительный постер: иерархия, сетка, типографика и последовательность работы в этой студии.",
        "Help me plan an expressive poster: hierarchy, grid, typography and the workflow in this studio.",
        "Әсерлі постерді жоспарлауға көмектес: иерархия, тор, типографика және осы студиядағы жұмыс реті.",
      ),
    },
    {
      label: L(
        "Проверка композиции",
        "Composition checklist",
        "Композицияны тексеру",
      ),
      text: L(
        "Дай короткий чек-лист проверки композиции и читаемости моего макета. Если данных недостаточно, уточни, что нужно описать.",
        "Give me a short checklist for checking my layout's composition and readability. If information is missing, ask what I should describe.",
        "Макеттің композициясы мен оқылымдылығын тексеруге қысқа тізім бер. Ақпарат жетпесе, нені сипаттау керегін сұра.",
      ),
    },
    {
      label: L("Экспорт дизайна", "Design export", "Дизайн экспорты"),
      text: L(
        "Объясни, как выбрать SVG или PNG, размер и прозрачный фон для экспорта в этой студии.",
        "Explain how to choose SVG or PNG, output size and transparency for export in this studio.",
        "Осы студиядан экспорттау үшін SVG не PNG, өлшем және мөлдір фонды қалай таңдау керегін түсіндір.",
      ),
    },
  ],
  "3d": [
    {
      label: L("План модели", "Model plan", "Модель жоспары"),
      text: L(
        "Помоги построить простую стилизованную 3D-сцену из примитивов. Дай шаги для этой студии.",
        "Help me build a simple stylized 3D scene from primitives. Give me steps for this studio.",
        "Примитивтерден қарапайым стильденген 3D көрініс жасауға көмектес. Осы студияға сай қадамдар бер.",
      ),
    },
    {
      label: L("Материалы и свет", "Materials and light", "Материал мен жарық"),
      text: L(
        "Как настроить цвет, металличность, шероховатость и свет, чтобы объекты хорошо читались?",
        "How should I set color, metalness, roughness and light so the objects read clearly?",
        "Нысандар анық көрінуі үшін түс, металдық, кедір-бұдырлық пен жарықты қалай баптаймын?",
      ),
    },
    {
      label: L("Сетка и экспорт", "Mesh and export", "Тор және экспорт"),
      text: L(
        "Объясни преобразование примитива в сетку, редактирование вершины и выбор OBJ или GLB для экспорта.",
        "Explain converting a primitive to a mesh, editing a vertex and choosing OBJ or GLB for export.",
        "Примитивті торға айналдыруды, төбесін өңдеуді және экспорт үшін OBJ не GLB таңдауды түсіндір.",
      ),
    },
  ],
  image: [
    {
      label: L("План обработки", "Editing plan", "Өңдеу жоспары"),
      text: L(
        "Помоги составить порядок обработки фотографии: кадрирование, тон, цвет и проверка результата. Что нужно описать о снимке?",
        "Help me plan a photo edit: crop, tone, color and checking the result. What should I describe about the photo?",
        "Фото өңдеу ретін құруға көмектес: қию, реңк, түс және нәтижені тексеру. Фото туралы нені сипаттауым керек?",
      ),
    },
    {
      label: L("Цветокоррекция", "Color correction", "Түсті түзету"),
      text: L(
        "Объясни, как аккуратно настроить яркость, контраст и насыщенность и сравнить результат с оригиналом в этой студии.",
        "Explain how to adjust brightness, contrast and saturation carefully and compare with the original in this studio.",
        "Осы студияда жарықтық, контраст пен қанықтықты ұқыпты реттеп, түпнұсқамен салыстыруды түсіндір.",
      ),
    },
    {
      label: L("Размер и формат", "Size and format", "Өлшем мен пішім"),
      text: L(
        "Помоги выбрать пропорции кадра, размер и формат PNG, JPEG или WebP для публикации фотографии.",
        "Help me choose crop proportions, size and PNG, JPEG or WebP for publishing a photo.",
        "Фото жариялау үшін қию арақатынасын, өлшемін және PNG, JPEG не WebP пішімін таңдауға көмектес.",
      ),
    },
  ],
  video: [
    {
      label: L("План монтажа", "Editing plan", "Монтаж жоспары"),
      text: L(
        "Помоги спланировать короткий ролик: начало, последовательность кадров, ритм и финал. Спроси о цели и аудитории.",
        "Help me plan a short video: opening, shot sequence, pacing and ending. Ask about the goal and audience.",
        "Қысқа роликті жоспарлауға көмектес: басы, кадр реті, ырғағы мен соңы. Мақсат пен аудитория туралы сұра.",
      ),
    },
    {
      label: L("Работа на таймлайне", "Timeline workflow", "Таймлайнмен жұмыс"),
      text: L(
        "Объясни разрезание, подрезку и перестановку клипов, титры, затемнение и громкость в этой студии.",
        "Explain splitting, trimming and reordering clips, titles, fades and volume in this studio.",
        "Осы студияда клипті бөлу, қию, орнын ауыстыру, титр, қараңғылау және дыбыс деңгейін түсіндір.",
      ),
    },
    {
      label: L(
        "Проверка перед экспортом",
        "Export checklist",
        "Экспортты тексеру",
      ),
      text: L(
        "Дай чек-лист проверки титров, кадров и звука перед экспортом WebM в этой студии.",
        "Give me a checklist for reviewing titles, shots and audio before WebM export in this studio.",
        "Осы студияда WebM экспортынан бұрын титр, кадр мен дыбысты тексеру тізімін бер.",
      ),
    },
  ],
  notes: [
    {
      label: L("Творческий бриф", "Creative brief", "Шығармашылық бриф"),
      text: L(
        "Помоги составить творческий бриф: цель, аудитория, сообщение, ограничения и результат.",
        "Help me write a creative brief: goal, audience, message, constraints and deliverable.",
        "Шығармашылық бриф құруға көмектес: мақсат, аудитория, хабарлама, шектеулер мен нәтиже.",
      ),
    },
    {
      label: L("План проекта", "Project plan", "Жоба жоспары"),
      text: L(
        "Помоги разбить творческий проект на выполнимые этапы с критериями проверки.",
        "Help me divide a creative project into achievable steps with review criteria.",
        "Шығармашылық жобаны тексеру өлшемдері бар орындалатын кезеңдерге бөлуге көмектес.",
      ),
    },
    {
      label: L("Самопроверка", "Self-review", "Өзін-өзі тексеру"),
      text: L(
        "Помоги составить вопросы для самопроверки творческого проекта и его презентации.",
        "Help me prepare self-review questions for a creative project and its presentation.",
        "Шығармашылық жоба мен таныстырылымын тексеру сұрақтарын дайындауға көмектес.",
      ),
    },
  ],
};
const courses: Record<ProjectKind, { href: string; label: Localized }> = {
  design: {
    href: "/learn/visual-basics",
    label: L("Уроки дизайна", "Design lessons", "Дизайн сабақтары"),
  },
  "3d": {
    href: "/learn/3d-basics",
    label: L("Уроки 3D", "3D lessons", "3D сабақтары"),
  },
  image: {
    href: "/learn/image",
    label: L(
      "Уроки обработки фото",
      "Photo editing lessons",
      "Фото өңдеу сабақтары",
    ),
  },
  video: {
    href: "/learn/video",
    label: L(
      "Уроки видеомонтажа",
      "Video editing lessons",
      "Бейнемонтаж сабақтары",
    ),
  },
  notes: {
    href: "/learn/art-direction",
    label: L(
      "Уроки арт-дирекшна",
      "Art direction lessons",
      "Арт-дирекция сабақтары",
    ),
  },
};
const errors: Record<string, Localized> = {
  AI_NOT_CONFIGURED: L(
    "Помощник ещё не подключён владельцем сайта. Пока можно открыть уроки по теме.",
    "The site owner has not connected the assistant yet. You can explore the related lessons meanwhile.",
    "Сайт иесі көмекшіні әлі қоспады. Әзірше тақырыптық сабақтарды ашуға болады.",
  ),
  AI_UNAVAILABLE: L(
    "Помощник временно недоступен. Вопрос сохранён в поле ввода — попробуйте позже.",
    "The assistant is temporarily unavailable. Your question is still in the input — try again later.",
    "Көмекші уақытша қолжетімсіз. Сұрағыңыз енгізу өрісінде қалды — кейін қайталаңыз.",
  ),
  AI_TIMEOUT: L(
    "Ответ занял слишком много времени. Попробуйте задать более короткий вопрос.",
    "The response took too long. Try a shorter question.",
    "Жауап тым ұзақ дайындалды. Қысқарақ сұрақ қойып көріңіз.",
  ),
  AI_RATE_LIMIT: L(
    "Подождите минуту перед следующим вопросом.",
    "Wait a minute before asking another question.",
    "Келесі сұраққа дейін бір минут күтіңіз.",
  ),
  AI_DAILY_LIMIT: L(
    "Дневной лимит помощника исчерпан. Уроки и редактор доступны.",
    "The assistant's daily limit has been reached. Lessons and the editor remain available.",
    "Көмекшінің күндік шегі таусылды. Сабақтар мен редактор қолжетімді.",
  ),
  AI_BUSY: L(
    "Сервис ИИ занят или достигнут лимит API. Попробуйте позже.",
    "The AI service is busy or its API limit has been reached. Try again later.",
    "ЖИ сервисі бос емес немесе API шегіне жетті. Кейін қайталаңыз.",
  ),
  AI_INVALID_INPUT: L(
    "Сократите вопрос до 2000 символов и повторите отправку.",
    "Keep your question within 2,000 characters and send again.",
    "Сұрақты 2000 таңбадан асырмай қайта жіберіңіз.",
  ),
};
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  context?: boolean;
  truncated?: boolean;
};
export default function StudioAssistant({
  kind,
  title,
  content,
  ready,
  open,
  onClose,
  anchorTop,
}: {
  kind: ProjectKind;
  title: string;
  content: string;
  ready: boolean;
  open: boolean;
  onClose: () => void;
  anchorTop: number;
}) {
  const { t, lang } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]),
    [question, setQuestion] = useState(""),
    [includeContext, setIncludeContext] = useState(false),
    [busy, setBusy] = useState(false),
    [availability, setAvailability] = useState<boolean | null>(null),
    [statusError, setStatusError] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState<Localized | null>(null),
    [online, setOnline] = useState(navigator.onLine);
  const request = useRef<AbortController | null>(null),
    statusRequest = useRef<AbortController | null>(null),
    textarea = useRef<HTMLTextAreaElement>(null),
    log = useRef<HTMLDivElement>(null);
  const errorText = (code: string) =>
    t(errors[code] ?? message(new ApiError(code, 0)));
  async function checkStatus() {
    statusRequest.current?.abort();
    const controller = new AbortController();
    statusRequest.current = controller;
    setStatusError("");
    setAvailability(null);
    try {
      const data = await api<{ available: boolean }>(
        "/assistant",
        "GET",
        undefined,
        controller.signal,
      );
      if (!controller.signal.aborted) setAvailability(data.available === true);
    } catch (e) {
      if (!controller.signal.aborted)
        setStatusError(e instanceof ApiError ? e.code : "NETWORK");
    }
  }
  useEffect(() => {
    void checkStatus();
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      request.current?.abort();
      statusRequest.current?.abort();
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (open) textarea.current?.focus();
  }, [open, availability]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, busy, open]);
  function stop() {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setMessages((old) =>
      old.at(-1)?.role === "user" ? old.slice(0, -1) : old,
    );
    setNotice(
      L(
        "Ожидание остановлено. Вопрос можно отправить снова.",
        "Waiting stopped. You can send the question again.",
        "Күту тоқтатылды. Сұрақты қайта жіберуге болады.",
      ),
    );
  }
  async function send() {
    const text = question.trim();
    if (!text || request.current || busy || !ready || !online || !availability)
      return;
    const before = messages,
      shared = includeContext;
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 42000);
    setError("");
    setNotice(null);
    setBusy(true);
    setMessages(
      [
        ...before,
        { role: "user" as const, content: text, context: shared },
      ].slice(-20),
    );
    try {
      const result = await api<AssistantReply>(
        "/assistant",
        "POST",
        {
          kind,
          language: lang,
          message: text,
          history: before
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
          ...(shared
            ? {
                context: {
                  title,
                  summary: summarizeStudioProject(kind, content),
                },
              }
            : {}),
        },
        controller.signal,
      );
      if (request.current !== controller) return;
      if (typeof result.reply !== "string" || !result.reply.trim())
        throw new ApiError("AI_UNAVAILABLE", 502);
      setMessages(
        [
          ...before,
          { role: "user", content: text, context: shared },
          {
            role: "assistant",
            content: result.reply,
            truncated: result.truncated,
          },
        ].slice(-20) as ChatMessage[],
      );
      setQuestion("");
    } catch (e) {
      if (request.current !== controller) return;
      setMessages(before);
      setError(
        controller.signal.aborted
          ? "AI_TIMEOUT"
          : e instanceof ApiError
            ? e.code
            : "AI_UNAVAILABLE",
      );
      if (e instanceof ApiError && e.code === "AI_NOT_CONFIGURED")
        setAvailability(false);
    } finally {
      clearTimeout(timer);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
        textarea.current?.focus();
      }
    }
  }
  function clear() {
    request.current?.abort();
    request.current = null;
    setMessages([]);
    setBusy(false);
    setQuestion("");
    setError("");
    setNotice(null);
    textarea.current?.focus();
  }
  return (
    <aside
      id="studio-assistant-panel"
      className="studio-assistant"
      style={{ "--sa-top": `${anchorTop}px` } as CSSProperties}
      aria-label={t(copy.title)}
      hidden={!open}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="sa-header">
        <span className="sa-symbol">
          <Sparkles size={18} />
        </span>
        <div>
          <h2>{t(copy.title)}</h2>
          <p>
            {t(
              L(
                "Ваш творческий наставник",
                "Your creative tutor",
                "Шығармашылық тәлімгеріңіз",
              ),
            )}
          </p>
        </div>
        <button
          className="sa-icon"
          onClick={onClose}
          aria-label={t(copy.close)}
        >
          <X size={17} />
        </button>
      </header>
      <div className="sa-tools">
        <button
          className="sa-text-button"
          onClick={clear}
          disabled={!messages.length && !busy}
          aria-label={t(
            L("Очистить диалог", "Clear conversation", "Диалогты тазалау"),
          )}
        >
          <Trash2 size={13} />
          {t(L("Новый диалог", "New chat", "Жаңа диалог"))}
        </button>
        <button
          className="sa-icon"
          disabled={!messages.length || busy}
          aria-label={t(
            L("Скачать диалог", "Download conversation", "Диалогты жүктеу"),
          )}
          onClick={() =>
            download(
              "creative-school-chat.txt",
              messages
                .map(
                  (m) =>
                    `${m.role === "user" ? t(L("Вы", "You", "Сіз")) : t(copy.title)}\n${m.content}`,
                )
                .join("\n\n"),
              "text/plain",
            )
          }
        >
          <Download size={14} />
        </button>
      </div>
      <div
        className="sa-log"
        ref={log}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t(
          L(
            "Диалог с помощником",
            "Assistant conversation",
            "Көмекшімен диалог",
          ),
        )}
      >
        {!messages.length && (
          <div className="sa-welcome">
            <span className="sa-eyebrow">CREATIVE SCHOOL</span>
            <h3>{t(copy.empty)}</h3>
            <p>{t(copy.intro)}</p>
            <div className="sa-prompts">
              {prompts[kind].map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(t(p.text));
                    textarea.current?.focus();
                  }}
                >
                  {t(p.label)}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <article key={i} className={`sa-message sa-${m.role}`}>
            <span className="sa-message-label">
              {m.role === "user" ? t(L("Вы", "You", "Сіз")) : t(copy.title)}
            </span>
            <p>{m.content}</p>
            {m.context && (
              <small>
                {t(
                  L(
                    "С параметрами проекта",
                    "With project parameters",
                    "Жоба параметрлерімен",
                  ),
                )}
              </small>
            )}
            {m.truncated && (
              <small>
                {t(
                  L(
                    "Ответ сокращён. Попросите подробнее разобрать отдельный шаг.",
                    "Response shortened. Ask for details on a specific step.",
                    "Жауап қысқартылды. Жеке қадамды толығырақ түсіндіруді сұраңыз.",
                  ),
                )}
              </small>
            )}
            {m.role === "assistant" && i === messages.length - 1 && (
              <button
                className="sa-text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(m.content);
                    setNotice(
                      L(
                        "Ответ скопирован.",
                        "Response copied.",
                        "Жауап көшірілді.",
                      ),
                    );
                  } catch {
                    setNotice(
                      L(
                        "Не удалось скопировать. Можно скачать диалог.",
                        "Copy failed. You can download the conversation.",
                        "Көшіру мүмкін болмады. Диалогты жүктеуге болады.",
                      ),
                    );
                  }
                }}
              >
                <Copy size={12} />
                {t(L("Скопировать ответ", "Copy response", "Жауапты көшіру"))}
              </button>
            )}
          </article>
        ))}
        {busy && (
          <p className="sa-thinking" role="status">
            <span />
            {t(
              L(
                "Готовлю ответ…",
                "Preparing a response…",
                "Жауап дайындалуда…",
              ),
            )}
          </p>
        )}
      </div>
      <div className="sa-bottom">
        {availability === null && !statusError && (
          <p className="sa-state" role="status">
            {t(L("Подключение…", "Connecting…", "Қосылуда…"))}
          </p>
        )}
        {(availability === false || statusError) && (
          <div className="sa-state" role="status">
            <p>{errorText(statusError || "AI_NOT_CONFIGURED")}</p>
            <button
              className="sa-text-button"
              onClick={() => void checkStatus()}
            >
              <RefreshCw size={12} />
              {t(
                L(
                  "Проверить подключение",
                  "Check connection",
                  "Қосылымды тексеру",
                ),
              )}
            </button>
          </div>
        )}
        {!online && (
          <p className="sa-state" role="status">
            {t(
              L(
                "Для ИИ нужно подключение к интернету.",
                "An internet connection is needed for AI.",
                "ЖИ үшін интернет байланысы қажет.",
              ),
            )}
          </p>
        )}
        {error && (
          <p className="sa-error" role="alert">
            {errorText(error)}
          </p>
        )}
        {notice && (
          <p className="sa-state" role="status">
            {t(notice)}
          </p>
        )}
        <label className="sa-context">
          <input
            type="checkbox"
            checked={includeContext}
            disabled={busy || !ready}
            onChange={(e) => setIncludeContext(e.target.checked)}
          />
          {t(
            L(
              "Поделиться параметрами и текстом проекта",
              "Share project parameters and text",
              "Жоба параметрлері мен мәтінін бөлісу",
            ),
          )}
        </label>
        <form
          className="sa-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label className="sr-only" htmlFor="sa-question">
            {t(copy.question)}
          </label>
          <textarea
            ref={textarea}
            id="sa-question"
            value={question}
            maxLength={2000}
            rows={3}
            disabled={busy}
            placeholder={t(
              L(
                "Опишите задачу или задайте вопрос…",
                "Describe your task or ask a question…",
                "Тапсырманы сипаттаңыз не сұрақ қойыңыз…",
              ),
            )}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="sa-compose-actions">
            <span>{question.length}/2000 · Ctrl/⌘ ↵</span>
            {busy ? (
              <button
                key="stop"
                type="button"
                className="sa-submit"
                onClick={(e) => {
                  e.preventDefault();
                  stop();
                }}
              >
                <Square size={13} />
                {t(L("Остановить", "Stop", "Тоқтату"))}
              </button>
            ) : (
              <button
                key="send"
                className="sa-submit"
                type="submit"
                disabled={
                  !availability || !ready || !online || !question.trim()
                }
              >
                <Send size={14} />
                {t(L("Отправить", "Send", "Жіберу"))}
              </button>
            )}
          </div>
        </form>
        <p className="sa-privacy">
          {t(
            L(
              "Вопрос и последние 6 сообщений отправляются в OpenAI. Фото, видео и файлы не передаются. Ответы ИИ могут содержать ошибки.",
              "Your question and the last 6 messages are sent to OpenAI. Photos, videos and files are not sent. AI responses may contain errors.",
              "Сұрағыңыз бен соңғы 6 хабарлама OpenAI-ға жіберіледі. Фото, видео мен файлдар жіберілмейді. ЖИ жауаптарында қате болуы мүмкін.",
            ),
          )}
        </p>
        <Link className="sa-course" href={courses[kind].href}>
          {t(courses[kind].label)} <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
