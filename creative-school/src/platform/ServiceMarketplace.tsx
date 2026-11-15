import { CreativeBrief } from "./CreativeBrief";
import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  Palette,
  Video,
  Box,
  Camera,
  PenTool,
  Presentation,
  Clapperboard,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { api, ApiError, message, type User } from "./client";
import { L, useLocale } from "./locale";
import {
  serviceCategories,
  canTransitionOrder,
  type ServiceOffer,
  type ServiceOrder,
} from "./services";
import "./service-marketplace.css";
const categories = {
  logo: L("Логотип", "Logo", "Логотип"),
  branding: L("Фирменный стиль", "Brand identity", "Фирмалық стиль"),
  video: L("Видеомонтаж", "Video editing", "Бейнемонтаж"),
  shorts: L("Reels и Shorts", "Reels and Shorts", "Reels және Shorts"),
  photo: L("Обработка фото", "Photo editing", "Фото өңдеу"),
  "3d": L("3D-моделирование", "3D modeling", "3D модельдеу"),
  presentation: L("Презентации", "Presentations", "Презентациялар"),
};
const icons = {
  logo: PenTool,
  branding: Palette,
  video: Video,
  shorts: Clapperboard,
  photo: Camera,
  "3d": Box,
  presentation: Presentation,
};
const statusLabels = {
  pending: L("Ожидает ответа", "Awaiting response", "Жауап күтілуде"),
  accepted: L("Согласовано", "Accepted", "Келісілді"),
  in_progress: L("В работе", "In progress", "Орындалуда"),
  delivered: L("Передано на проверку", "Ready for review", "Тексеруге берілді"),
  completed: L("Завершено", "Completed", "Аяқталды"),
  declined: L("Отклонено", "Declined", "Қабылданбады"),
  cancelled: L("Отменено", "Cancelled", "Бас тартылды"),
};
const actionLabels = {
  accepted: L("Принять заявку", "Accept request", "Өтінімді қабылдау"),
  in_progress: L("Начать / доработать", "Start / revise", "Бастау / түзету"),
  delivered: L("Передать результат", "Deliver work", "Нәтижені беру"),
  completed: L(
    "Подтвердить выполнение",
    "Confirm completion",
    "Орындалуын растау",
  ),
  declined: L("Отклонить", "Decline", "Қабылдамау"),
  cancelled: L("Отменить заявку", "Cancel request", "Өтінімнен бас тарту"),
};
type Draft = {
  title: string;
  description: string;
  category: (typeof serviceCategories)[number];
  price: number;
  days: number;
  revisions: number;
  deliverables: string;
  active: boolean;
};
const empty: Draft = {
  title: "",
  description: "",
  category: "logo",
  price: 10000,
  days: 3,
  revisions: 2,
  deliverables: "",
  active: true,
};
export default function ServiceMarketplace() {
  const { t, lang } = useLocale();
  const urlSearch = useSearch();
  const [user, setUser] = useState<User | null>(null),
    [offers, setOffers] = useState<ServiceOffer[]>([]),
    [mine, setMine] = useState<ServiceOffer[]>([]),
    [orders, setOrders] = useState<ServiceOrder[]>([]),
    [tab, setTab] = useState(() => {
      const tab = new URLSearchParams(window.location.search).get("tab");
      return tab && ["catalog", "mine", "orders", "inbox"].includes(tab)
        ? tab
        : "catalog";
    }),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(
      new URLSearchParams(window.location.search).get("q")?.slice(0, 120) ?? "",
    ),
    [sort, setSort] = useState("recent"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState<ServiceOffer | "new" | null>(null),
    [draft, setDraft] = useState<Draft>(empty),
    [selected, setSelected] = useState<ServiceOffer | null>(null),
    [brief, setBrief] = useState(""),
    [contact, setContact] = useState(""),
    [notice, setNotice] = useState(""),
    [delivery, setDelivery] = useState<Record<string, string>>({});
  useEffect(() => {
    setSearch(new URLSearchParams(urlSearch).get("q")?.slice(0, 120) ?? "");
    if (new URLSearchParams(urlSearch).has("q")) setTab("catalog");
  }, [urlSearch]);
  const generation = useRef(0),
    orderId = useRef(crypto.randomUUID()),
    form = useRef<HTMLElement>(null);
  const money = (n: number) =>
    new Intl.NumberFormat(
      lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-KZ" : "en-KZ",
      { style: "currency", currency: "KZT", maximumFractionDigits: 0 },
    ).format(n);
  const failure = (e: unknown) =>
    e instanceof ApiError && e.code === "CONFLICT"
      ? t(
          L(
            "Услуга или заявка изменилась. Обновите страницу и проверьте условия.",
            "This service or request changed. Refresh and review its terms.",
            "Қызмет не өтінім өзгерді. Жаңартып, шарттарын тексеріңіз.",
          ),
        )
      : e instanceof ApiError && e.code.startsWith("SERVICE_")
        ? t(
            e.code === "SERVICE_SELF"
              ? L(
                  "Выберите услугу другого исполнителя.",
                  "Choose another seller's service.",
                  "Басқа орындаушының қызметін таңдаңыз.",
                )
              : e.code === "SERVICE_QUOTA"
                ? L(
                    "Достигнут лимит предложений или открытых заявок.",
                    "Offer or open-request limit reached.",
                    "Ұсыныс не ашық өтінім шегіне жетті.",
                  )
                : L(
                    "Проверьте заполнение полей и длину описания.",
                    "Check the fields and description length.",
                    "Өрістер мен сипаттама ұзындығын тексеріңіз.",
                  ),
          )
        : t(message(e));
  async function load() {
    const seq = ++generation.current;
    setLoading(true);
    try {
      const [catalog, me] = await Promise.all([
        api<ServiceOffer[]>("/services"),
        api<{ user: User }>("/me").catch(() => null),
      ]);
      const [own, requests] = me
        ? await Promise.all([
            api<ServiceOffer[]>("/services/mine"),
            api<ServiceOrder[]>("/service-orders"),
          ])
        : [[], []];
      if (seq !== generation.current) return;
      setOffers(catalog);
      setUser(me?.user ?? null);
      setMine(own);
      setOrders(requests);
    } catch (e) {
      if (seq === generation.current) setError(failure(e));
    } finally {
      if (seq === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    const auth = () => {
      setUser(null);
      setMine([]);
      setOrders([]);
      setEditing(null);
      setSelected(null);
      void load();
    };
    window.addEventListener("creative-school-auth-change", auth);
    window.addEventListener("cs-session-expired", auth);
    return () => {
      generation.current++;
      window.removeEventListener("creative-school-auth-change", auth);
      window.removeEventListener("cs-session-expired", auth);
    };
  }, []);
  useEffect(() => {
    if (editing || selected)
      form.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editing, selected]);
  function edit(offer: ServiceOffer | "new") {
    setSelected(null);
    setEditing(offer);
    setDraft(
      offer === "new" ? { ...empty } : { ...offer, active: !!offer.active },
    );
    setError("");
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      await api(
        editing === "new"
          ? "/services"
          : `/services/${(editing as ServiceOffer).id}`,
        editing === "new" ? "POST" : "PATCH",
        {
          ...draft,
          ...(editing !== "new"
            ? { version: (editing as ServiceOffer).version }
            : {}),
        },
      );
      setEditing(null);
      setTab("mine");
      setNotice(
        t(L("Услуга сохранена.", "Service saved.", "Қызмет сақталды.")),
      );
      await load();
    } catch (e) {
      setError(failure(e));
    } finally {
      setBusy(false);
    }
  }
  async function order() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api("/service-orders", "POST", {
        clientId: orderId.current,
        offerId: selected.id,
        offerVersion: selected.version,
        brief,
        contact,
      });
      orderId.current = crypto.randomUUID();
      setSelected(null);
      setBrief("");
      setContact("");
      setTab("orders");
      setNotice(
        t(
          L(
            "Заявка отправлена исполнителю. Это ещё не оплаченный заказ.",
            "Request sent to the seller. This is not a paid order yet.",
            "Өтінім орындаушыға жіберілді. Бұл әлі төленген тапсырыс емес.",
          ),
        ),
      );
      await load();
    } catch (e) {
      setError(failure(e));
    } finally {
      setBusy(false);
    }
  }
  async function transition(o: ServiceOrder, status: string) {
    setBusy(true);
    setError("");
    try {
      await api(`/service-orders/${o.id}`, "PATCH", {
        version: o.version,
        status,
        deliveryNote: delivery[o.id] ?? "",
      });
      await load();
    } catch (e) {
      setError(failure(e));
    } finally {
      setBusy(false);
    }
  }
  const list = (tab === "mine" ? mine : offers)
    .filter(
      (o) =>
        (filter === "all" || o.category === filter) &&
        `${o.title} ${o.description} ${o.seller_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.price - b.price
        : sort === "fast"
          ? a.days - b.days
          : 0,
    );
  return (
    <div className="service-market">
      <header className="sm-intro">
        <div>
          <p className="sm-eyebrow">CREATIVE SCHOOL / SERVICES</p>
          <h1>
            {t(
              L(
                "Идея — ваша. Работа — мастера.",
                "Your idea. A creator's craft.",
                "Идея — сіздікі. Іс — шебердікі.",
              ),
            )}
          </h1>
          <p>
            {t(
              L(
                "Логотипы, монтаж, графика и 3D. Выбирайте исполнителя или предлагайте свои услуги по своей цене.",
                "Logos, editing, graphics and 3D. Find a creator or offer your own services at your own price.",
                "Логотип, монтаж, графика және 3D. Орындаушыны таңдаңыз не өз қызметіңізді өз бағаңызбен ұсыныңыз.",
              ),
            )}
          </p>
        </div>
        {user ? (
          <button className="sm-primary" onClick={() => edit("new")}>
            <Plus size={16} />
            {t(L("Предложить услугу", "Offer a service", "Қызмет ұсыну"))}
          </button>
        ) : (
          <Link className="sm-primary" href="/auth">
            {t(
              L(
                "Войти и предложить услугу",
                "Sign in to offer a service",
                "Кіріп, қызмет ұсыну",
              ),
            )}
          </Link>
        )}
      </header>
      <div className="cs-service-journey">
        {[
          L("01 / Ваша идея", "01 / Your idea", "01 / Сіздің идеяңыз"),
          L("02 / Общий замысел", "02 / A shared direction", "02 / Ортақ ой"),
          L("03 / Готовая работа", "03 / Finished work", "03 / Дайын жұмыс"),
        ].map((label, i) => (
          <div key={i}>
            <strong>{t(label)}</strong>
            <p>
              {t(
                [
                  L(
                    "Расскажите о задаче, настроении и желаемом результате.",
                    "Describe the task, mood and result you want.",
                    "Тапсырма, көңіл күй және қалаған нәтиже туралы айтыңыз.",
                  ),
                  L(
                    "Согласуйте объём и условия с выбранным автором.",
                    "Agree on scope and terms with the creator you choose.",
                    "Таңдаған автормен көлем мен шарттарды келісіңіз.",
                  ),
                  L(
                    "Получите результат, проверьте и подтвердите выполнение.",
                    "Receive the work, review it and confirm completion.",
                    "Нәтижені алып, тексеріңіз және орындалуын растаңыз.",
                  ),
                ][i],
              )}
            </p>
          </div>
        ))}
      </div>
      <div className="sm-notice">
        {t(
          L(
            "Цена указана исполнителем в тенге. Заявка бесплатная; объём, сроки и способ оплаты согласовываются отдельно. Онлайн-оплата и гарантия сделки не подключены.",
            "Prices are set by sellers in KZT. Requests are free; agree on scope, timing and payment separately. Online payments and escrow are not connected.",
            "Бағаны орындаушы теңгемен белгілейді. Өтінім тегін; жұмыс көлемі, мерзім мен төлем бөлек келісіледі. Онлайн төлем мен мәміле кепілдігі қосылмаған.",
          ),
        )}
      </div>
      {error && (
        <p role="alert" className="sm-error">
          {error}
          <button onClick={() => void load()}>
            {t(L("Обновить", "Refresh", "Жаңарту"))}
          </button>
        </p>
      )}
      {notice && (
        <p role="status" className="sm-notice">
          {notice}
        </p>
      )}
      {(editing || selected) && (
        <section ref={form} className="sm-form">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <h2>
                {t(
                  editing === "new"
                    ? L(
                        "Ваша новая услуга",
                        "Your new service",
                        "Жаңа қызметіңіз",
                      )
                    : L("Изменить услугу", "Edit service", "Қызметті өзгерту"),
                )}
              </h2>
              <label>
                {t(L("Название услуги", "Service title", "Қызмет атауы"))}
                <input
                  required
                  minLength={5}
                  maxLength={100}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </label>
              <div className="sm-fields">
                <label>
                  {t(L("Направление", "Category", "Бағыт"))}
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        category: e.target.value as Draft["category"],
                      })
                    }
                  >
                    {serviceCategories.map((c) => (
                      <option key={c} value={c}>
                        {t(categories[c])}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t(L("Стоимость, ₸", "Price, KZT", "Баға, ₸"))}
                  <input
                    type="number"
                    required
                    min={100}
                    max={10000000}
                    step={100}
                    value={draft.price}
                    onChange={(e) =>
                      setDraft({ ...draft, price: +e.target.value })
                    }
                  />
                </label>
                <label>
                  {t(L("Срок, дней", "Delivery, days", "Мерзім, күн"))}
                  <input
                    type="number"
                    required
                    min={1}
                    max={90}
                    value={draft.days}
                    onChange={(e) =>
                      setDraft({ ...draft, days: +e.target.value })
                    }
                  />
                </label>
                <label>
                  {t(L("Включено правок", "Included revisions", "Түзету саны"))}
                  <input
                    type="number"
                    required
                    min={0}
                    max={20}
                    value={draft.revisions}
                    onChange={(e) =>
                      setDraft({ ...draft, revisions: +e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                {t(
                  L(
                    "Что вы сделаете — от 40 символов",
                    "What you will do — at least 40 characters",
                    "Не жасайсыз — кемінде 40 таңба",
                  ),
                )}
                <textarea
                  required
                  minLength={40}
                  maxLength={3000}
                  rows={5}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </label>
              <label>
                {t(
                  L(
                    "Что получит заказчик: файлы и результат",
                    "Deliverables: files and result",
                    "Тапсырыс беруші алатын файлдар мен нәтиже",
                  ),
                )}
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  value={draft.deliverables}
                  onChange={(e) =>
                    setDraft({ ...draft, deliverables: e.target.value })
                  }
                />
              </label>
              <label className="sm-check">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) =>
                    setDraft({ ...draft, active: e.target.checked })
                  }
                />
                {t(
                  L(
                    "Показывать в магазине",
                    "Show in marketplace",
                    "Дүкенде көрсету",
                  ),
                )}
              </label>
              <div className="sm-actions">
                <button disabled={busy} className="sm-primary">
                  {t(L("Сохранить услугу", "Save service", "Қызметті сақтау"))}
                </button>
                <button type="button" onClick={() => setEditing(null)}>
                  {t(L("Отмена", "Cancel", "Бас тарту"))}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void order();
              }}
            >
              <h2>{selected!.title}</h2>
              <p>{selected!.description}</p>
              <p>
                <strong>{money(selected!.price)}</strong> · {selected!.days}{" "}
                {t(L("дней", "days", "күн"))} · {selected!.revisions}{" "}
                {t(L("правок", "revisions", "түзету"))}
              </p>
              <p>{selected!.deliverables}</p>
              <Link href={`/u/${selected!.seller_id}`}>
                {t(
                  L(
                    "Портфолио исполнителя",
                    "Seller's portfolio",
                    "Орындаушының портфолиосы",
                  ),
                )}{" "}
                ↗
              </Link>
              <CreativeBrief
                key={selected!.id}
                value={brief}
                onChange={setBrief}
              />
              <label>
                {t(
                  L(
                    "Опишите задачу — от 30 символов",
                    "Describe your task — at least 30 characters",
                    "Тапсырманы сипаттаңыз — кемінде 30 таңба",
                  ),
                )}
                <textarea
                  required
                  minLength={30}
                  aria-label={t(
                    L(
                      "Опишите задачу — от 30 символов",
                      "Describe your task — at least 30 characters",
                      "Тапсырманы сипаттаңыз — кемінде 30 таңба",
                    ),
                  )}
                  maxLength={4000}
                  rows={5}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
              </label>
              <label>
                {t(
                  L(
                    "Контакт для исполнителя",
                    "Contact for the seller",
                    "Орындаушыға байланыс",
                  ),
                )}
                <input
                  required
                  minLength={3}
                  maxLength={200}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </label>
              <small>
                {t(
                  L(
                    "Контакт и задание увидят только участники заявки.",
                    "Only participants can see the contact and brief.",
                    "Байланыс пен тапсырманы тек өтінім қатысушылары көреді.",
                  ),
                )}
              </small>
              <div className="sm-actions">
                {user ? (
                  <button className="sm-primary" disabled={busy}>
                    {t(L("Отправить заявку", "Send request", "Өтінім жіберу"))}
                  </button>
                ) : (
                  <Link href="/auth">
                    {t(
                      L(
                        "Войти для заявки",
                        "Sign in to request",
                        "Өтінім үшін кіру",
                      ),
                    )}
                  </Link>
                )}
                <button type="button" onClick={() => setSelected(null)}>
                  {t(L("Закрыть", "Close", "Жабу"))}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
      <button disabled={loading || busy} onClick={() => void load()}>
        {t(
          L(
            "Обновить предложения и заявки",
            "Refresh services and requests",
            "Қызмет пен өтінімді жаңарту",
          ),
        )}
      </button>
      <nav className="sm-tabs">
        {[
          ["catalog", L("Услуги", "Services", "Қызметтер")],
          ["mine", L("Мои услуги", "My services", "Қызметтерім")],
          ["orders", L("Мои заказы", "My requests", "Тапсырыстарым")],
          ["inbox", L("Заявки мне", "Incoming requests", "Маған өтінімдер")],
        ].map(([id, label]) => (
          <button
            key={id as string}
            aria-pressed={tab === id}
            onClick={() => {
              setTab(id as string);
              setSelected(null);
              setEditing(null);
            }}
          >
            {t(label as ReturnType<typeof L>)}
          </button>
        ))}
      </nav>
      {tab === "catalog" || tab === "mine" ? (
        <>
          <div className="sm-filters">
            <input
              aria-label={t(
                L("Поиск услуг", "Search services", "Қызмет іздеу"),
              )}
              placeholder={t(
                L(
                  "Поиск по услуге и исполнителю…",
                  "Search services and creators…",
                  "Қызмет пен орындаушы іздеу…",
                ),
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label={t(
                L("Фильтр направления", "Category filter", "Бағыт сүзгісі"),
              )}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">
                {t(L("Все направления", "All categories", "Барлық бағыт"))}
              </option>
              {serviceCategories.map((c) => (
                <option key={c} value={c}>
                  {t(categories[c])}
                </option>
              ))}
            </select>
            <select
              aria-label={t(L("Сортировка", "Sort", "Сұрыптау"))}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">{t(L("Новые", "Newest", "Жаңа"))}</option>
              <option value="price">
                {t(L("Сначала дешевле", "Lowest price", "Арзанынан"))}
              </option>
              <option value="fast">
                {t(L("Быстрее по сроку", "Fastest delivery", "Жылдам мерзім"))}
              </option>
            </select>
          </div>
          <div className="sm-grid">
            {list.map((o) => {
              const Icon = icons[o.category];
              return (
                <article className="sm-card" key={o.id}>
                  <div className={`sm-art sm-art-${o.category}`}>
                    <Icon size={48} strokeWidth={1.2} />
                    <span>{t(categories[o.category])}</span>
                  </div>
                  <div className="sm-card-body">
                    <Link className="sm-seller" href={`/u/${o.seller_id}`}>
                      {o.seller_name}
                    </Link>
                    <h2>{o.title}</h2>
                    <p>
                      {o.description.slice(0, 180)}
                      {o.description.length > 180 ? "…" : ""}
                    </p>
                    <small>
                      {o.days} {t(L("дней", "days", "күн"))} · {o.revisions}{" "}
                      {t(L("правок", "revisions", "түзету"))}
                      {!o.active
                        ? ` · ${t(L("Скрыто", "Hidden", "Жасырылған"))}`
                        : ""}
                    </small>
                    <div className="sm-card-footer">
                      <strong>{money(o.price)}</strong>
                      {user?.id === o.seller_id ? (
                        <button onClick={() => edit(o)}>
                          {t(L("Изменить", "Edit", "Өзгерту"))}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditing(null);
                            setSelected(o);
                            orderId.current = crypto.randomUUID();
                            setBrief("");
                            setContact("");
                          }}
                        >
                          {t(L("Подробнее", "Details", "Толығырақ"))}
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!loading && !list.length && (
            <div className="sm-empty">
              <h2>
                {t(
                  L(
                    "Здесь появятся услуги сообщества",
                    "Community services will appear here",
                    "Мұнда қауымдастық қызметтері пайда болады",
                  ),
                )}
              </h2>
              <p>
                {t(
                  L(
                    "Пока предложений по этому фильтру нет. Опубликуйте свою услугу с понятной ценой, сроком и результатом.",
                    "No offers match this filter yet. Publish your service with a clear price, timeline and deliverables.",
                    "Бұл сүзгіде ұсыныс әзірге жоқ. Бағасы, мерзімі мен нәтижесі анық қызметіңізді жариялаңыз.",
                  ),
                )}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="sm-orders">
          {!user ? (
            <Link href="/auth">
              {t(
                L(
                  "Войдите, чтобы видеть заявки",
                  "Sign in to view requests",
                  "Өтінімдерді көру үшін кіріңіз",
                ),
              )}
            </Link>
          ) : (
            orders
              .filter((o) =>
                tab === "orders"
                  ? o.buyer_id === user.id
                  : o.seller_id === user.id,
              )
              .map((o) => (
                <article className="sm-order" key={o.id}>
                  <div className="sm-order-head">
                    <h2>{o.title}</h2>
                    <span>{t(statusLabels[o.status])}</span>
                  </div>
                  <p>
                    {money(o.price)} · {o.days}{" "}
                    {t(
                      L(
                        "дней после согласования",
                        "days after agreement",
                        "күн келісілген соң",
                      ),
                    )}{" "}
                    · {tab === "orders" ? o.seller_name : o.buyer_name}
                  </p>
                  <p className="sm-pre">{o.brief}</p>
                  <p>
                    {t(L("Результат", "Deliverables", "Нәтиже"))}:{" "}
                    {o.deliverables}
                  </p>
                  <p>
                    {t(L("Контакт", "Contact", "Байланыс"))}: {o.contact}
                  </p>
                  {o.delivery_note && (
                    <p className="sm-pre sm-notice">{o.delivery_note}</p>
                  )}
                  {o.seller_id === user.id && o.status === "in_progress" && (
                    <label>
                      {t(
                        L(
                          "Результат и ссылка на файлы",
                          "Result and file link",
                          "Нәтиже мен файл сілтемесі",
                        ),
                      )}
                      <textarea
                        minLength={10}
                        maxLength={2000}
                        value={delivery[o.id] ?? ""}
                        onChange={(e) =>
                          setDelivery({ ...delivery, [o.id]: e.target.value })
                        }
                      />
                    </label>
                  )}
                  <div className="sm-actions">
                    {Object.entries(actionLabels)
                      .filter(([next]) =>
                        canTransitionOrder(
                          o.status,
                          next,
                          o.seller_id === user.id,
                        ),
                      )
                      .map(([next, label]) => (
                        <button
                          key={next}
                          disabled={
                            busy ||
                            (next === "delivered" &&
                              (delivery[o.id]?.trim().length ?? 0) < 10)
                          }
                          onClick={() => void transition(o, next)}
                        >
                          {t(label)}
                        </button>
                      ))}
                  </div>
                </article>
              ))
          )}
          {user &&
            !loading &&
            !orders.some((o) =>
              tab === "orders"
                ? o.buyer_id === user.id
                : o.seller_id === user.id,
            ) && (
              <p className="sm-empty">
                {t(
                  L(
                    "Заявок пока нет.",
                    "No requests yet.",
                    "Әзірге өтінім жоқ.",
                  ),
                )}
              </p>
            )}
        </div>
      )}
      {loading && (
        <p role="status">{t(L("Загрузка…", "Loading…", "Жүктелуде…"))}</p>
      )}
    </div>
  );
}
