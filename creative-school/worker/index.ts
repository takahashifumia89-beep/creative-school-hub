// Cloudflare Worker: API для Creative School. Данные — в D1 (SQLite), секретов в коде нет.
interface Env { DB: D1Database }
type Json = Record<string, unknown>;

const enc = new TextEncoder();
const COOKIE = 'cs_session';
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000; // максимум, который разрешает Workers

const hex = (buf: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(buf as ArrayBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (s: string) => new Uint8Array((s.match(/.{1,2}/g) ?? []).map((h) => parseInt(h, 16)));
const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const now = () => new Date().toISOString();

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256));
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
}
const fail = (error: string, status = 400) => json({ error }, status);
const text = (v: unknown, max: number): string | null => (typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max ? v.trim() : null);

function cookie(token: string, maxAge: number) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
async function currentUser(req: Request, env: Env) {
  const m = (req.headers.get('Cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
  if (!m) return null;
  return env.DB.prepare(
    'SELECT u.id, u.email, u.display_name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?',
  ).bind(await sha256(m[1]), Date.now()).first<{ id: string; email: string; display_name: string }>();
}
async function startSession(env: Env, userId: string): Promise<string> {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(await sha256(token), userId, Date.now() + SESSION_DAYS * 86_400_000),
  ]);
  return cookie(token, SESSION_DAYS * 86_400);
}
const publicUser = (u: { id: string; email: string; display_name: string }) => ({ id: u.id, email: u.email, user_metadata: { display_name: u.display_name } });

const profileOut = (r: Json) => ({ ...r, onboarding_completed: Boolean(r.onboarding_completed) });
const notificationOut = (r: Json) => ({ ...r, read: Boolean(r.read) });

// ---- Очки опыта, уровни, ритм недели (всё считает сервер; каждое начисление записано в xp_events один раз)
const XP = { daily: 5, practice: 15, project: 20, publish: 50, onboarding: 30 } as const;
const WEEK_GOAL = 5;
const levelOf = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1; // уровень N начинается с 100·(N−1)² XP
const dayKey = (ms = Date.now()) => new Date(ms + 5 * 3_600_000).toISOString().slice(0, 10); // сутки по UTC+5 (Казахстан)

async function award(env: Env, userId: string, kind: keyof typeof XP, ref: string): Promise<boolean> {
  const t = now();
  const ins = await env.DB.prepare('INSERT OR IGNORE INTO xp_events (id, user_id, kind, ref, xp, day, created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), userId, kind, ref, XP[kind], dayKey(), t).run();
  if (!ins.meta.changes) return false;
  const row = await env.DB.prepare('SELECT COALESCE(SUM(xp), 0) AS xp FROM xp_events WHERE user_id = ?').bind(userId).first<{ xp: number }>();
  const xp = row?.xp ?? 0;
  await env.DB.prepare('UPDATE profiles SET xp = ?, level = ?, updated_at = ? WHERE user_id = ?').bind(xp, levelOf(xp), t, userId).run();
  return true;
}

async function stats(env: Env, userId: string) {
  const today = dayKey();
  const d = new Date(`${today}T00:00:00Z`);
  const weekStart = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86_400_000).toISOString().slice(0, 10);
  const [xpRow, pr, daysRes] = await Promise.all([
    env.DB.prepare('SELECT COALESCE(SUM(xp), 0) AS xp FROM xp_events WHERE user_id = ?').bind(userId).first<{ xp: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(status = 'published'), 0) AS published FROM projects WHERE owner_id = ?").bind(userId).first<{ total: number; published: number }>(),
    env.DB.prepare('SELECT DISTINCT day FROM xp_events WHERE user_id = ? AND day >= ? ORDER BY day DESC').bind(userId, dayKey(Date.now() - 60 * 86_400_000)).all<{ day: string }>(),
  ]);
  const days = new Set(daysRes.results.map((r) => r.day));
  let streak = 0;
  for (let ms = Date.now() - (days.has(today) ? 0 : 86_400_000); days.has(dayKey(ms)); ms -= 86_400_000) streak++;
  const xp = xpRow?.xp ?? 0, level = levelOf(xp);
  const floor = 100 * (level - 1) ** 2, next = 100 * level ** 2;
  return {
    xp, level, levelFloorXp: floor, nextLevelXp: next, levelProgress: (xp - floor) / (next - floor),
    weekDays: [...days].filter((x) => x >= weekStart).length, weekGoal: WEEK_GOAL, streak,
    projectsTotal: pr?.total ?? 0, projectsPublished: pr?.published ?? 0,
  };
}

const PROJECT_COLS = 'id, owner_id, title, description, cover_url, category, status, visibility, created_at, updated_at';
const MAX_CONTENT = 200_000;

async function route(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  const method = req.method;
  if (!path.startsWith('/api')) return fail('Не найдено.', 404);

  if (method !== 'GET' && method !== 'HEAD') {
    const origin = req.headers.get('Origin');
    if (origin && origin !== url.origin) return fail('Запрос отклонён.', 403);
    if (!(req.headers.get('Content-Type') ?? '').includes('application/json')) return fail('Нужен JSON.', 415);
  }
  const body: Json = method === 'GET' ? {} : await req.json().catch(() => ({}));

  if (path === '/api/healthz') return json({ status: 'ok' });

  if (path === '/api/auth/signup' && method === 'POST') {
    const email = text(body.email, 254)?.toLowerCase();
    const name = text(body.displayName, 80);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name || password.length < 8 || password.length > 200) {
      return fail('Укажите имя, почту и пароль не короче 8 символов.');
    }
    if (await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first()) return fail('Для этой почты уже создан профиль. Войдите в него.', 409);
    const id = crypto.randomUUID(), salt = crypto.getRandomValues(new Uint8Array(16)), t = now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO users (id, email, display_name, pw_salt, pw_hash, created_at) VALUES (?,?,?,?,?,?)').bind(id, email, name, hex(salt), await pbkdf2(password, salt), t),
      env.DB.prepare('INSERT INTO profiles (user_id, display_name, username, created_at, updated_at) VALUES (?,?,?,?,?)').bind(id, name, email.split('@')[0], t, t),
      env.DB.prepare('INSERT INTO notifications (id, user_id, type, title, body, href, created_at) VALUES (?,?,?,?,?,?,?)')
        .bind(crypto.randomUUID(), id, 'achievement', 'Добро пожаловать в Creative School', 'Ваше пространство готово. Начните с первого проекта.', '/projects', t),
    ]);
    await award(env, id, 'daily', `daily:${dayKey()}`);
    return json({ user: publicUser({ id, email, display_name: name }) }, 201, { 'Set-Cookie': await startSession(env, id) });
  }

  if (path === '/api/auth/signin' && method === 'POST') {
    const email = text(body.email, 254)?.toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const u = email ? await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<{ id: string; email: string; display_name: string; pw_salt: string; pw_hash: string }>() : null;
    const ok = u ? safeEqual(await pbkdf2(password, fromHex(u.pw_salt)), u.pw_hash) : (await pbkdf2(password, new Uint8Array(16)), false);
    if (!u || !ok) return fail('Неверная почта или пароль.', 401);
    await award(env, u.id, 'daily', `daily:${dayKey()}`);
    return json({ user: publicUser(u) }, 200, { 'Set-Cookie': await startSession(env, u.id) });
  }

  if (path === '/api/auth/signout' && method === 'POST') {
    const m = (req.headers.get('Cookie') ?? '').match(new RegExp(`${COOKIE}=([a-f0-9]{64})`));
    if (m) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(m[1])).run();
    return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
  }

  const user = await currentUser(req, env);
  if (path === '/api/me' && method === 'GET') return user ? json({ user: publicUser(user) }) : fail('Не выполнен вход.', 401);
  if (!user) return fail('Не выполнен вход.', 401);

  if (path === '/api/profile' && method === 'GET') {
    const r = await env.DB.prepare('SELECT user_id AS id, display_name, username, avatar_url, bio, role, xp, level, onboarding_completed, created_at, updated_at FROM profiles WHERE user_id = ?').bind(user.id).first<Json>();
    return r ? json(profileOut(r)) : fail('Профиль не найден.', 404);
  }
  if (path === '/api/profile' && method === 'PATCH') {
    const sets: string[] = [], vals: unknown[] = [];
    for (const [k, max] of [['display_name', 80], ['username', 40], ['bio', 500], ['avatar_url', 500]] as const) {
      if (k in body) { sets.push(`${k} = ?`); vals.push(body[k] === null ? null : text(body[k], max)); }
    }
    if (typeof body.onboarding_completed === 'boolean') { sets.push('onboarding_completed = ?'); vals.push(body.onboarding_completed ? 1 : 0); }
    if (sets.length) await env.DB.prepare(`UPDATE profiles SET ${sets.join(', ')}, updated_at = ? WHERE user_id = ?`).bind(...vals, now(), user.id).run();
    if (body.onboarding_completed === true) await award(env, user.id, 'onboarding', 'onboarding');
    const r = await env.DB.prepare('SELECT user_id AS id, display_name, username, avatar_url, bio, role, xp, level, onboarding_completed, created_at, updated_at FROM profiles WHERE user_id = ?').bind(user.id).first<Json>();
    return r ? json(profileOut(r)) : fail('Профиль не найден.', 404);
  }

  if (path === '/api/projects' && method === 'GET') {
    const { results } = await env.DB.prepare(`SELECT ${PROJECT_COLS} FROM projects WHERE owner_id = ? ORDER BY updated_at DESC`).bind(user.id).all<Json>();
    return json(results);
  }
  if (path === '/api/projects' && method === 'POST') {
    const title = text(body.title, 120);
    if (!title) return fail('Укажите название проекта.');
    const content = typeof body.content === 'string' && body.content.length <= MAX_CONTENT ? body.content : null;
    const p = { id: crypto.randomUUID(), owner_id: user.id, title, description: text(body.description, 1000), category: text(body.category, 40), status: 'draft', visibility: 'private', cover_url: null, created_at: now(), updated_at: now() };
    await env.DB.prepare('INSERT INTO projects (id, owner_id, title, description, category, status, visibility, cover_url, created_at, updated_at, content) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(p.id, p.owner_id, p.title, p.description, p.category, p.status, p.visibility, p.cover_url, p.created_at, p.updated_at, content).run();
    const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM xp_events WHERE user_id = ? AND kind = 'project' AND day = ?").bind(user.id, dayKey()).first<{ n: number }>();
    if ((today?.n ?? 0) < 5) await award(env, user.id, 'project', `project:${p.id}`); // не больше 5 проектов в сутки дают XP
    return json(p, 201);
  }
  const pm = path.match(/^\/api\/projects\/([\w-]+)$/);
  if (pm && method === 'PATCH') {
    const sets: string[] = [], vals: unknown[] = [];
    if ('title' in body) { const v = text(body.title, 120); if (!v) return fail('Название не может быть пустым.'); sets.push('title = ?'); vals.push(v); }
    if ('description' in body) { sets.push('description = ?'); vals.push(text(body.description, 1000)); }
    if ('category' in body) { sets.push('category = ?'); vals.push(text(body.category, 40)); }
    if (['draft', 'published', 'archived'].includes(body.status as string)) { sets.push('status = ?'); vals.push(body.status); }
    if (['private', 'unlisted', 'public'].includes(body.visibility as string)) { sets.push('visibility = ?'); vals.push(body.visibility); }
    if ('content' in body) {
      if (typeof body.content !== 'string' || body.content.length > MAX_CONTENT) return fail('Файл проекта слишком большой.');
      sets.push('content = ?'); vals.push(body.content);
    }
    if (!sets.length) return fail('Нечего обновлять.');
    const res = await env.DB.prepare(`UPDATE projects SET ${sets.join(', ')}, updated_at = ? WHERE id = ? AND owner_id = ?`).bind(...vals, now(), pm[1], user.id).run();
    if (!res.meta.changes) return fail('Проект не найден.', 404);
    if (body.status === 'published') await award(env, user.id, 'publish', pm[1]);
    return json(await env.DB.prepare(`SELECT ${PROJECT_COLS} FROM projects WHERE id = ?`).bind(pm[1]).first<Json>());
  }
  if (pm && method === 'GET') {
    const r = await env.DB.prepare('SELECT * FROM projects WHERE id = ? AND owner_id = ?').bind(pm[1], user.id).first<Json>();
    return r ? json(r) : fail('Проект не найден.', 404);
  }
  if (pm && method === 'DELETE') {
    const res = await env.DB.prepare('DELETE FROM projects WHERE id = ? AND owner_id = ?').bind(pm[1], user.id).run();
    return res.meta.changes ? json({ ok: true }) : fail('Проект не найден.', 404);
  }

  if (path === '/api/stats' && method === 'GET') return json(await stats(env, user.id));
  if (path === '/api/practice' && method === 'POST') {
    const awarded = await award(env, user.id, 'practice', `practice:${dayKey()}`);
    return json({ awarded, xp: XP.practice });
  }

  if (path === '/api/notifications' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').bind(user.id).all<Json>();
    return json(results.map(notificationOut));
  }
  const nm = path.match(/^\/api\/notifications\/([\w-]+)\/read$/);
  if (nm && method === 'POST') {
    const res = await env.DB.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').bind(nm[1], user.id).run();
    return res.meta.changes ? json({ ok: true }) : fail('Уведомление не найдено.', 404);
  }
  return fail('Не найдено.', 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try { return await route(req, env); } catch (e) { console.error(e); return fail('Внутренняя ошибка сервера.', 500); }
  },
};
