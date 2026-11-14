import { L, type Localized } from "./locale";
export const errors: Record<string, Localized> = {
  NETWORK: L(
    "Нет связи с сервером. Проверьте подключение и повторите запрос.",
    "Server connection unavailable. Check your connection and retry.",
    "Сервермен байланыс жоқ. Қосылымды тексеріп, қайталап көріңіз.",
  ),
  CONFLICT: L(
    "Проект изменён в другой вкладке. Скачайте свою копию и загрузите актуальную версию.",
    "This project changed elsewhere. Download your copy and reload the current version.",
    "Жоба басқа терезеде өзгерді. Көшірмеңізді жүктеп алып, жаңа нұсқаны ашыңыз.",
  ),
  UNAUTHORIZED: L(
    "Сессия истекла. Войдите снова.",
    "Session expired. Sign in again.",
    "Сеанс аяқталды. Қайта кіріңіз.",
  ),
  LOGIN_INVALID: L(
    "Проверьте почту, пароль или код восстановления.",
    "Check your email, password or recovery key.",
    "Пошта, құпиясөз немесе қалпына келтіру кілтін тексеріңіз.",
  ),
  SIGNUP_INVALID: L(
    "Укажите имя, корректную почту и пароль от 12 до 200 символов.",
    "Enter a name, valid email and a password of 12–200 characters.",
    "Аты-жөніңізді, дұрыс пошта мен 12–200 таңбалы құпиясөзді енгізіңіз.",
  ),
  ACCOUNT_UNAVAILABLE: L(
    "Этот адрес нельзя использовать для регистрации. Попробуйте вход или восстановление.",
    "This address cannot be registered. Try signing in or recovery.",
    "Бұл мекенжаймен тіркелу мүмкін емес. Кіру не қалпына келтіруді қолданыңыз.",
  ),
  RATE_LIMIT: L(
    "Слишком много запросов. Повторите через 15 минут.",
    "Too many requests. Retry in 15 minutes.",
    "Сұрау тым көп. 15 минуттан кейін қайталаңыз.",
  ),
  INVALID_DOCUMENT: L(
    "Неподдерживаемый или слишком большой документ.",
    "Unsupported or oversized document.",
    "Қолдау көрсетілмейтін не тым үлкен құжат.",
  ),
  NOT_FOUND: L(
    "Не найдено или доступ закрыт.",
    "Not found or access is private.",
    "Табылмады немесе қолжетімділік жабық.",
  ),
  QUIZ_FAILED: L(
    "Есть неверные ответы. Перечитайте материал и повторите тест.",
    "Some answers are incorrect. Review the material and retry.",
    "Қате жауаптар бар. Материалды оқып, қайта көріңіз.",
  ),
  SERVER_ERROR: L(
    "Ошибка сервера. Повторите запрос.",
    "Server error. Please retry.",
    "Сервер қатесі. Қайталап көріңіз.",
  ),
  QUOTA: L(
    "Лимит — 500 проектов на аккаунт.",
    "Limit: 500 projects per account.",
    "Шектеу: бір аккаунтқа 500 жоба.",
  ),
  FORBIDDEN: L(
    "Недостаточно прав.",
    "Insufficient permissions.",
    "Құқық жеткіліксіз.",
  ),
};
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public details:unknown = undefined,
  ) {
    super(code);
  }
}
export async function api<T = Record<string, unknown>>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("NETWORK", 0);
  }
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (payload.error === "UNAUTHORIZED" && path !== "/me")
      window.dispatchEvent(new Event("cs-session-expired"));
    throw new ApiError(payload.error ?? "SERVER_ERROR", res.status,payload);
  }
  return payload;
}
export function message(e: unknown): Localized {
  return (
    errors[e instanceof ApiError ? e.code : "SERVER_ERROR"] ??
    errors.SERVER_ERROR
  );
}
export type User = {
  id: string;
  email: string;
  user_metadata: { display_name: string };
};
export type Project = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  kind: "design" | "3d" | "image" | "video" | "notes";
  content: string | null;
  version: number;
  status: string;
  visibility: string;
  updated_at: string;
};
export function download(
  name: string,
  data: string | Blob,
  type = "application/json",
) {
  const url = URL.createObjectURL(
    data instanceof Blob ? data : new Blob([data], { type }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
