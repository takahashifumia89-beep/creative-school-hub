import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { api, download, message, type User } from "./client";
import { L, useLocale } from "./locale";
export function Auth({ onUser }: { onUser: (u: User | null) => void }) {
  const { t } = useLocale(),
    [, navigate] = useLocation(),
    [mode, setMode] = useState<"signin" | "signup" | "recover">("signin"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [recovery, setRecovery] = useState(""),
    [key, setKey] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [newUser, setNewUser] = useState<User | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ user?: User; recovery?: string }>(
        `/auth/${mode}`,
        "POST",
        { email, password, displayName: name, recovery },
      );
      if (r.recovery) {
        setKey(r.recovery);
        setNewUser(r.user ?? null);
      } else if (r.user) {
        onUser(r.user);
        navigate("/dashboard");
      }
    } catch (e) {
      setError(t(message(e)));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-page">
      <div>
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h1>
          {t(
            L(
              "Место для ваших идей.",
              "A place for your ideas.",
              "Идеяларыңызға арналған орын.",
            ),
          )}
        </h1>
        <p>
          {t(
            L(
              "Учитесь, создавайте и собирайте портфолио.",
              "Learn, create and build your portfolio.",
              "Оқыңыз, жасаңыз және портфолио жинаңыз.",
            ),
          )}
        </p>
      </div>
      <div className="card">
        {key ? (
          <>
            <h2>
              {t(
                L(
                  "Сохраните резервный ключ",
                  "Save your recovery key",
                  "Қалпына келтіру кілтін сақтаңыз",
                ),
              )}
            </h2>
            <p>
              {t(
                L(
                  "Он показывается один раз и позволяет сменить пароль. Храните его отдельно от пароля. Письма для восстановления пока не отправляются.",
                  "Shown once. This key can reset your password. Store it separately from your password. Recovery emails are not configured.",
                  "Бір рет көрсетіледі. Кілт құпиясөзді ауыстыруға мүмкіндік береді. Оны бөлек сақтаңыз. Қалпына келтіру поштасы бапталмаған.",
                ),
              )}
            </p>
            <code className="recovery-key">{key}</code>
            <button
              onClick={() =>
                download(
                  "creative-school-recovery.txt",
                  `${email}\n${key}\n`,
                  "text/plain",
                )
              }
            >
              {t(L("Скачать ключ", "Download key", "Кілтті жүктеу"))}
            </button>
            <button
              onClick={() => {
                setKey("");
                if (newUser) {
                  onUser(newUser);
                  navigate("/dashboard");
                } else {
                  setMode("signin");
                  setPassword("");
                }
              }}
            >
              {t(
                L(
                  "Ключ сохранён, продолжить",
                  "I saved it, continue",
                  "Кілт сақталды, жалғастыру",
                ),
              )}
            </button>
          </>
        ) : (
          <>
            <div className="row">
              {(["signin", "signup", "recover"] as const).map((m, i) => (
                <button
                  key={m}
                  aria-pressed={m === mode}
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                >
                  {t(
                    [
                      L("Войти", "Sign in", "Кіру"),
                      L("Регистрация", "Sign up", "Тіркелу"),
                      L("Восстановить", "Recover", "Қалпына келтіру"),
                    ][i],
                  )}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => void submit(e)}>
              {mode === "signup" && (
                <label>
                  {t(L("Имя", "Display name", "Аты"))}
                  <input
                    required
                    maxLength={80}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                {t(
                  mode === "recover"
                    ? L("Новый пароль", "New password", "Жаңа құпиясөз")
                    : L("Пароль", "Password", "Құпиясөз"),
                )}
                <input
                  required
                  type="password"
                  minLength={mode === "signin" ? 1 : 12}
                  maxLength={200}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {mode === "recover" && (
                <label>
                  {t(
                    L(
                      "Резервный ключ",
                      "Recovery key",
                      "Қалпына келтіру кілті",
                    ),
                  )}
                  <input
                    required
                    value={recovery}
                    autoComplete="off"
                    onChange={(e) => setRecovery(e.target.value)}
                  />
                </label>
              )}
              {mode !== "signin" && (
                <p>
                  {t(
                    L(
                      "Пароль: минимум 12 символов. Почта не подтверждается; восстановление — по резервному ключу.",
                      "Password: at least 12 characters. Email is not verified; recovery uses your backup key.",
                      "Құпиясөз: кемінде 12 таңба. Пошта расталмайды; қалпына келтіру резервтік кілтпен орындалады.",
                    ),
                  )}
                </p>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="primary" disabled={busy}>
                {t(
                  busy
                    ? L("Подождите…", "Please wait…", "Күтіңіз…")
                    : L("Продолжить", "Continue", "Жалғастыру"),
                )}{" "}
                →
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
export function Settings({
  user,
  onUser,
}: {
  user: User;
  onUser: (u: User | null) => void;
}) {
  const { t } = useLocale(),
    [name, setName] = useState(user.user_metadata.display_name),
    [bio, setBio] = useState(""),
    [password, setPassword] = useState(""),
    [newPassword, setNewPassword] = useState(""),
    [status, setStatus] = useState(""),
    [key, setKey] = useState(""),
    [sessions, setSessions] = useState<
      { current: boolean; expires_at: number }[]
    >([]),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<{ bio: string }>("/profile")
      .then((p) => setBio(p.bio ?? ""))
      .catch((e) => setStatus(t(message(e))));
    void api<typeof sessions>("/security/sessions")
      .then(setSessions)
      .catch((e) => setStatus(t(message(e))));
  }, []);
  async function action(path: string) {
    if (
      path === "delete" &&
      !confirm(
        t(
          L(
            "Удалить аккаунт и все проекты навсегда? Сначала экспортируйте данные.",
            "Permanently delete your account and all projects? Export your data first.",
            "Аккаунт пен барлық жобаны біржола жою керек пе? Алдымен деректерді экспорттаңыз.",
          ),
        ),
      )
    )
      return;
    setBusy(true);
    try {
      const r = await api<{ recovery?: string }>("/security/" + path, "POST", {
        password,
        newPassword,
      });
      if (path === "export")
        download("creative-school-account.json", JSON.stringify(r, null, 2));
      if (r.recovery) setKey(r.recovery);
      if (path === "delete") {
        try {
          for (const key of Object.keys(localStorage))
            if (
              key.startsWith(`cs-draft:${user.id}:`) ||
              key === `cs-progress-queue:${user.id}`
            )
              localStorage.removeItem(key);
        } catch {
          /* restricted storage */
        }
      }
      if (["delete", "logout-all"].includes(path)) onUser(null);
      setStatus(t(L("Готово", "Done", "Дайын")));
      setPassword("");
      setNewPassword("");
    } catch (e) {
      setStatus(t(message(e)));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p className="eyebrow">ACCOUNT / PRIVACY</p>
      <h1>
        {t(
          L(
            "Профиль и безопасность",
            "Profile and security",
            "Профиль және қауіпсіздік",
          ),
        )}
      </h1>
      <p role="status">{status}</p>
      <div className="grid2">
        <form
          className="card"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("/profile", "PATCH", { display_name: name, bio });
              onUser({ ...user, user_metadata: { display_name: name } });
              setStatus(
                t(L("Профиль сохранён", "Profile saved", "Профиль сақталды")),
              );
            } catch (e) {
              setStatus(t(message(e)));
            }
          }}
        >
          <h2>{t(L("Публичный профиль", "Public profile", "Ашық профиль"))}</h2>
          <label>
            {t(L("Имя", "Name", "Аты"))}
            <input
              value={name}
              required
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            {t(L("О себе", "About you", "Өзіңіз туралы"))}
            <textarea
              value={bio}
              maxLength={500}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <button>{t(L("Сохранить", "Save", "Сақтау"))}</button>
        </form>
        <div className="card">
          <h2>
            {t(L("Активные сессии", "Active sessions", "Белсенді сеанстар"))}
          </h2>
          {sessions.map((s, i) => (
            <p key={i}>
              {s.current
                ? t(L("Это устройство", "This device", "Осы құрылғы"))
                : t(L("Другая сессия", "Another session", "Басқа сеанс"))}{" "}
              · {new Date(s.expires_at).toLocaleDateString()}
            </p>
          ))}
          <p>
            {t(
              L(
                "Выход со всех устройств требует текущий пароль.",
                "Signing out all devices requires your current password.",
                "Барлық құрылғыдан шығу үшін ағымдағы құпиясөз қажет.",
              ),
            )}
          </p>
        </div>
      </div>
      <div className="card">
        <h2>
          {t(
            L(
              "Управление доступом и данными",
              "Access and data controls",
              "Қолжетімділік пен деректерді басқару",
            ),
          )}
        </h2>
        <label>
          {t(L("Текущий пароль", "Current password", "Ағымдағы құпиясөз"))}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          {t(
            L(
              "Новый пароль — от 12 символов",
              "New password — at least 12 characters",
              "Жаңа құпиясөз — кемінде 12 таңба",
            ),
          )}
          <input
            type="password"
            minLength={12}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <div className="row">
          {(
            ["password", "recovery", "logout-all", "export", "delete"] as const
          ).map((a, i) => (
            <button
              disabled={
                busy ||
                !password ||
                (a === "password" && newPassword.length < 12)
              }
              key={a}
              onClick={() => void action(a)}
            >
              {t(
                [
                  L("Сменить пароль", "Change password", "Құпиясөзді ауыстыру"),
                  L(
                    "Новый резервный ключ",
                    "New recovery key",
                    "Жаңа резервтік кілт",
                  ),
                  L("Выйти везде", "Sign out everywhere", "Барлық жерден шығу"),
                  L("Экспорт данных", "Export data", "Деректерді экспорттау"),
                  L("Удалить аккаунт", "Delete account", "Аккаунтты жою"),
                ][i],
              )}
            </button>
          ))}
        </div>
        {key && (
          <div className="notice">
            <code className="recovery-key">{key}</code>
            <button onClick={() => download("recovery.txt", key, "text/plain")}>
              {t(
                L("Скачать и сохранить", "Download and save", "Жүктеп сақтау"),
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
export function Notifications() {
  const { t } = useLocale(),
    [list, setList] = useState<
      { id: string; title: string; body: string; read: boolean }[]
    >([]),
    [error, setError] = useState("");
  useEffect(() => {
    void api<typeof list>("/notifications")
      .then(setList)
      .catch((e) => setError(t(message(e))));
  }, []);
  return (
    <section>
      <h1>{t(L("Уведомления", "Notifications", "Хабарландырулар"))}</h1>
      <p role="alert">{error}</p>
      {list.length ? (
        list.map((n) => (
          <article className="card" key={n.id}>
            <h2>{n.title}</h2>
            <p>{n.body}</p>
            {!n.read && (
              <button
                onClick={async () => {
                  try {
                    await api(`/notifications/${n.id}/read`, "POST", {});
                    setList((l) =>
                      l.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                    );
                  } catch (e) {
                    setError(t(message(e)));
                  }
                }}
              >
                {t(L("Прочитано", "Mark read", "Оқылды"))}
              </button>
            )}
          </article>
        ))
      ) : (
        <p>
          {t(
            L(
              "Новых уведомлений нет.",
              "No new notifications.",
              "Жаңа хабарландыру жоқ.",
            ),
          )}
        </p>
      )}
    </section>
  );
}
