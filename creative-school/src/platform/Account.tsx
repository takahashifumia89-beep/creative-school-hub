import { clearAccountMediaCache } from "./media-cache";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { api, download, message, type User } from "./client";
import { L, useLocale } from "./locale";
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
  const [securityAction, setSecurityAction] = useState("password");
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
              key.startsWith(`cs-lesson-note:${user.id}:`) ||
              key === `cs-progress-queue:${user.id}`
            )
              localStorage.removeItem(key);
        } catch {
          /* restricted storage */
        }
        try {
          await clearAccountMediaCache(user.id);
        } catch {
          /* device storage may be unavailable */
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
      <h1>{t(L("Настройки", "Settings", "Баптаулар"))}</h1>
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
      <details className="card">
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          {t(
            L(
              "Безопасность и данные",
              "Security and data",
              "Қауіпсіздік және деректер",
            ),
          )}
        </summary>
        <label>
          {t(
            L(
              "Что нужно сделать?",
              "What would you like to do?",
              "Не істегіңіз келеді?",
            ),
          )}
          <select
            aria-label={t(
              L(
                "Что нужно сделать?",
                "What would you like to do?",
                "Не істегіңіз келеді?",
              ),
            )}
            value={securityAction}
            onChange={(e) => {
              setSecurityAction(e.target.value);
              setNewPassword("");
            }}
          >
            <option value="password">
              {t(L("Изменить пароль", "Change password", "Құпиясөзді өзгерту"))}
            </option>
            <option value="recovery">
              {t(
                L(
                  "Получить резервный ключ",
                  "Get a recovery key",
                  "Резервтік кілт алу",
                ),
              )}
            </option>
            <option value="logout-all">
              {t(
                L(
                  "Выйти на всех устройствах",
                  "Sign out all devices",
                  "Барлық құрылғыдан шығу",
                ),
              )}
            </option>
            <option value="export">
              {t(
                L(
                  "Скачать мои данные",
                  "Download my data",
                  "Деректерімді жүктеу",
                ),
              )}
            </option>
            <option value="delete">
              {t(L("Удалить аккаунт", "Delete account", "Аккаунтты жою"))}
            </option>
          </select>
        </label>
        <label>
          {t(L("Текущий пароль", "Current password", "Ағымдағы құпиясөз"))}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {securityAction === "password" && (
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
        )}
        <div className="row">
          {(["password", "recovery", "logout-all", "export", "delete"] as const)
            .filter((a) => a === securityAction)
            .map((a) => (
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
                    L(
                      "Сменить пароль",
                      "Change password",
                      "Құпиясөзді ауыстыру",
                    ),
                    L(
                      "Новый резервный ключ",
                      "New recovery key",
                      "Жаңа резервтік кілт",
                    ),
                    L(
                      "Выйти везде",
                      "Sign out everywhere",
                      "Барлық жерден шығу",
                    ),
                    L("Экспорт данных", "Export data", "Деректерді экспорттау"),
                    L("Удалить аккаунт", "Delete account", "Аккаунтты жою"),
                  ][
                    [
                      "password",
                      "recovery",
                      "logout-all",
                      "export",
                      "delete",
                    ].indexOf(a)
                  ],
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
      </details>
    </section>
  );
}
