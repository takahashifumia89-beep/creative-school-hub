import { curriculum, lessonMap } from "../src/platform/curriculum";
import { kinds, validDocument, type ProjectKind } from "../src/platform/schema";
interface Env {
  DB: D1Database;
}
type Row = Record<string, unknown>;
const encoder = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(b), (v) => v.toString(16).padStart(2, "0")).join(
    "",
  );
const hash = async (s: string) =>
  hex(await crypto.subtle.digest("SHA-256", encoder.encode(s)));
const now = () => new Date().toISOString();
const day = () => new Date(Date.now() + 18000000).toISOString().slice(0, 10);
const text = (v: unknown, max: number) =>
  typeof v === "string" && v.trim().length <= max ? v.trim() : "";
const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
const fail = (error: string, status = 400) => json({ error }, status);
const cookie = (token: string, seconds = 2592000) =>
  `cs_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;
const tokenFrom = (r: Request) =>
  (r.headers.get("Cookie") ?? "").match(
    /(?:^|;\s*)cs_session=([a-f0-9]{64})(?:;|$)/,
  )?.[1];
async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
// Legacy salts were decoded bytes. Keep existing accounts working through a version prefix.
async function verify(password: string, salt: string, expected: string) {
  const bytes = salt.startsWith("v2:")
    ? encoder.encode(salt)
    : new Uint8Array((salt.match(/../g) ?? []).map((v) => parseInt(v, 16)));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const actual = hex(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: bytes, iterations: 100000, hash: "SHA-256" },
      key,
      256,
    ),
  );
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++)
    diff |= actual.charCodeAt(i) ^ (expected.charCodeAt(i) || 0);
  return diff === 0;
}
async function session(db: D1Database, uid: string) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Date.now()),
    db
      .prepare("INSERT INTO sessions VALUES(?,?,?)")
      .bind(await hash(token), uid, Date.now() + 2592000000),
  ]);
  return cookie(token);
}
async function limit(
  db: D1Database,
  key: string,
  max: number,
  seconds: number,
) {
  const slot = Math.floor(Date.now() / (seconds * 1000)),
    k = await hash(`${key}:${slot}`);
  const r = await db
    .prepare(
      "INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(k, (slot + 1) * seconds * 1000)
    .first<{ count: number }>();
  if (Math.random() < 0.02)
    await db
      .prepare("DELETE FROM rate_limits WHERE expires < ?")
      .bind(Date.now())
      .run();
  return (r?.count ?? max + 1) <= max;
}
const publicUser = (u: Row) => ({
  id: u.id,
  email: u.email,
  user_metadata: { display_name: u.display_name },
});
async function stats(db: D1Database, uid: string) {
  const [sum, ps, ds, badges] = await Promise.all([
    db
      .prepare("SELECT COALESCE(SUM(xp),0) xp FROM xp_events WHERE user_id=?")
      .bind(uid)
      .first<{ xp: number }>(),
    db
      .prepare(
        "SELECT COUNT(*) total, COALESCE(SUM(status='published'),0) published FROM projects WHERE owner_id=?",
      )
      .bind(uid)
      .first<{ total: number; published: number }>(),
    db
      .prepare(
        "SELECT DISTINCT day FROM xp_events WHERE user_id=? AND kind!='daily' ORDER BY day DESC",
      )
      .bind(uid)
      .all<{ day: string }>(),
    db
      .prepare("SELECT badge,earned_at FROM badges WHERE user_id=?")
      .bind(uid)
      .all(),
  ]);
  const days = new Set(ds.results.map((r) => r.day));
  let streak = 0;
  let d = new Date(`${day()}T00:00:00Z`);
  if (!days.has(day())) d = new Date(+d - 86400000);
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d = new Date(+d - 86400000);
  }
  if (streak >= 3)
    await db
      .prepare("INSERT OR IGNORE INTO badges VALUES(?,'streak',?)")
      .bind(uid, now())
      .run();
  const xp = sum?.xp ?? 0,
    level = Math.floor(Math.sqrt(xp / 100)) + 1,
    floor = 100 * (level - 1) ** 2,
    next = 100 * level ** 2;
  const today = new Date(`${day()}T00:00:00Z`),
    monday = new Date(+today - ((today.getUTCDay() + 6) % 7) * 86400000)
      .toISOString()
      .slice(0, 10);
  return {
    xp,
    level,
    levelFloorXp: floor,
    nextLevelXp: next,
    levelProgress: (xp - floor) / (next - floor),
    streak,
    weekDays: [...days].filter((x) => x >= monday).length,
    weekGoal: 5,
    projectsTotal: ps?.total ?? 0,
    projectsPublished: ps?.published ?? 0,
    badges: [
      ...badges.results,
      ...(streak >= 3 ? [{ badge: "streak", earned_at: now() }] : []),
    ],
  };
}
async function bodyOf(req: Request): Promise<Row> {
  if (!req.body) return {};
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 260000) {
      await reader.cancel();
      throw new Error("BODY_TOO_LARGE");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let pos = 0;
  for (const c of chunks) {
    all.set(c, pos);
    pos += c.length;
  }
  const parsed = JSON.parse(new TextDecoder().decode(all));
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object")
    throw new Error("INVALID_JSON");
  return parsed;
}
const projectCols =
  "id,owner_id,title,description,status,visibility,cover_url,category,kind,version,created_at,updated_at";
async function route(req: Request, env: Env): Promise<Response> {
  const db = env.DB,
    url = new URL(req.url),
    path = url.pathname.replace(/\/+$/, ""),
    method = req.method;
  if (!path.startsWith("/api/")) return fail("NOT_FOUND", 404);
  if (path === "/api/healthz") return json({ status: "ok" });
  const ip = req.headers.get("CF-Connecting-IP") ?? "local";
  if (!(await limit(db, `api:${ip}`, 300, 60))) return fail("RATE_LIMIT", 429);
  const write = !["GET", "HEAD"].includes(method);
  if (write) {
    if (req.headers.get("Origin") && req.headers.get("Origin") !== url.origin)
      return fail("ORIGIN", 403);
    if (!req.headers.get("Content-Type")?.includes("application/json"))
      return fail("JSON_REQUIRED", 415);
  }
  let b: Row = {};
  if (write) {
    try {
      b = await bodyOf(req);
    } catch (e) {
      return fail(
        (e as Error).message === "BODY_TOO_LARGE"
          ? "BODY_TOO_LARGE"
          : "INVALID_JSON",
        (e as Error).message === "BODY_TOO_LARGE" ? 413 : 400,
      );
    }
  }
  if (
    ["/api/auth/signup", "/api/auth/signin", "/api/auth/recover"].includes(
      path,
    ) &&
    method === "POST"
  ) {
    const email = text(b.email, 254).toLowerCase(),
      password = typeof b.password === "string" ? b.password : "";
    if (
      !(await limit(db, `auth:${ip}`, 15, 900)) ||
      !(await limit(db, `email:${email}`, 10, 900))
    )
      return fail("RATE_LIMIT", 429);
    if (path === "/api/auth/signup") {
      const name = text(b.displayName, 80);
      if (
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
        !name ||
        password.length < 12 ||
        password.length > 200
      )
        return fail("SIGNUP_INVALID");
      const id = crypto.randomUUID(),
        salt = "v2:" + hex(crypto.getRandomValues(new Uint8Array(16))),
        recovery = hex(crypto.getRandomValues(new Uint8Array(24))),
        t = now();
      try {
        await db.batch([
          db
            .prepare(
              "INSERT INTO users(id,email,display_name,pw_salt,pw_hash,created_at,recovery_hash) VALUES(?,?,?,?,?,?,?)",
            )
            .bind(
              id,
              email,
              name,
              salt,
              await passwordHash(password, salt),
              t,
              await hash(recovery),
            ),
          db
            .prepare(
              "INSERT INTO profiles(user_id,display_name,username,created_at,updated_at) VALUES(?,?,?,?,?)",
            )
            .bind(id, name, id, t, t),
        ]);
      } catch (e) {
        if (String(e).includes("UNIQUE"))
          return fail("ACCOUNT_UNAVAILABLE", 409);
        throw e;
      }
      return json(
        { user: publicUser({ id, email, display_name: name }), recovery },
        201,
        { "Set-Cookie": await session(db, id) },
      );
    }
    if (path === "/api/auth/signin") {
      if (password.length > 200) return fail("LOGIN_INVALID", 401);
      const u = await db
        .prepare("SELECT * FROM users WHERE email=?")
        .bind(email)
        .first<Row>();
      const ok = await verify(
        password,
        String(u?.pw_salt ?? "v2:dummy"),
        String(u?.pw_hash ?? "0".repeat(64)),
      );
      if (!u || !ok) return fail("LOGIN_INVALID", 401);
      return json({ user: publicUser(u) }, 200, {
        "Set-Cookie": await session(db, String(u.id)),
      });
    }
    if (path === "/api/auth/recover") {
      if (password.length < 12 || password.length > 200)
        return fail("SIGNUP_INVALID");
      const u = await db
        .prepare("SELECT id FROM users WHERE email=? AND recovery_hash=?")
        .bind(email, await hash(text(b.recovery, 100)))
        .first<{ id: string }>();
      if (!u) return fail("LOGIN_INVALID", 401);
      const salt = "v2:" + hex(crypto.getRandomValues(new Uint8Array(16))),
        recovery = hex(crypto.getRandomValues(new Uint8Array(24)));
      await db.batch([
        db
          .prepare(
            "UPDATE users SET pw_salt=?,pw_hash=?,recovery_hash=? WHERE id=?",
          )
          .bind(
            salt,
            await passwordHash(password, salt),
            await hash(recovery),
            u.id,
          ),
        db.prepare("DELETE FROM sessions WHERE user_id=?").bind(u.id),
      ]);
      return json({ recovery });
    }
  }
  const raw = tokenFrom(req),
    token = raw ? await hash(raw) : "";
  const user = await db
    .prepare(
      "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?",
    )
    .bind(token, Date.now())
    .first<Row>();
  if (path === "/api/me")
    return user ? json({ user: publicUser(user) }) : fail("UNAUTHORIZED", 401);
  const publicMatch = path.match(
    /^\/api\/public\/(profiles|projects)\/([\w-]+)$/,
  );
  if (publicMatch && method === "GET") {
    if (publicMatch[1] === "profiles") {
      const p = await db
        .prepare(
          "SELECT user_id id, display_name,bio,avatar_url FROM profiles WHERE user_id=?",
        )
        .bind(publicMatch[2])
        .first();
      if (!p) return fail("NOT_FOUND", 404);
      const projects = await db
        .prepare(
          `SELECT ${projectCols},content FROM projects WHERE owner_id=? AND status='published' AND visibility='public' ORDER BY updated_at DESC LIMIT 100`,
        )
        .bind(publicMatch[2])
        .all();
      return json({ profile: p, projects: projects.results });
    }
    const p = await db
      .prepare(
        `SELECT ${projectCols},content FROM projects WHERE id=? AND status='published' AND visibility IN ('public','unlisted')`,
      )
      .bind(publicMatch[2])
      .first();
    return p ? json(p) : fail("NOT_FOUND", 404);
  }
  if (!user) return fail("UNAUTHORIZED", 401);
  const uid = String(user.id);
  if (write && !(await limit(db, `write:${uid}`, 120, 60)))
    return fail("RATE_LIMIT", 429);
  if (path === "/api/auth/signout" && method === "POST") {
    await db
      .prepare("DELETE FROM sessions WHERE token_hash=?")
      .bind(token)
      .run();
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
  }
  if (path === "/api/profile" && method === "GET") {
    const r = await db
      .prepare(
        "SELECT user_id id,display_name,username,avatar_url,bio,role,onboarding_completed,created_at,updated_at FROM profiles WHERE user_id=?",
      )
      .bind(uid)
      .first<Row>();
    return json({
      ...r,
      onboarding_completed: !!r?.onboarding_completed,
      ...(await stats(db, uid)),
    });
  }
  if (path === "/api/profile" && method === "PATCH") {
    const name =
      "display_name" in b
        ? text(b.display_name, 80)
        : String(user.display_name);
    if (!name) return fail("INVALID_INPUT");
    const old = await db
      .prepare("SELECT bio FROM profiles WHERE user_id=?")
      .bind(uid)
      .first<{ bio: string }>();
    await db.batch([
      db
        .prepare(
          "UPDATE profiles SET display_name=?,bio=?,onboarding_completed=1,updated_at=? WHERE user_id=?",
        )
        .bind(
          name,
          "bio" in b ? text(b.bio, 500) : (old?.bio ?? ""),
          now(),
          uid,
        ),
      db.prepare("UPDATE users SET display_name=? WHERE id=?").bind(name, uid),
    ]);
    return json({ ok: true });
  }
  if (path === "/api/stats" && method === "GET")
    return json(await stats(db, uid));
  if (path === "/api/progress" && method === "GET") {
    const r = await db
      .prepare("SELECT lesson_id FROM lesson_progress WHERE user_id=?")
      .bind(uid)
      .all<{ lesson_id: string }>();
    return json({ done: r.results.map((x) => x.lesson_id) });
  }
  if (path === "/api/progress" && method === "POST") {
    const lesson = lessonMap.get(String(b.lessonId));
    if (!lesson) return fail("NOT_FOUND", 404);
    if (
      !Array.isArray(b.answers) ||
      lesson.questions.some(
        (q, i) => b.answers instanceof Array && b.answers[i] !== q.answer,
      ) ||
      b.answers.length !== lesson.questions.length
    )
      return fail("QUIZ_FAILED", 422);
    const t = now(),
      course = curriculum.find((c) => c.id === lesson.courseId)!;
    await db.batch([
      db
        .prepare("INSERT OR IGNORE INTO lesson_progress VALUES(?,?,?,?)")
        .bind(uid, lesson.id, lesson.courseId, t),
      db
        .prepare(
          "INSERT OR IGNORE INTO xp_events SELECT ?,?,'course',?,50,?,? WHERE (SELECT COUNT(*) FROM lesson_progress WHERE user_id=? AND course_id=?)>=?",
        )
        .bind(
          crypto.randomUUID(),
          uid,
          lesson.courseId,
          day(),
          t,
          uid,
          lesson.courseId,
          course.lessons.length,
        ),
    ]);
    const r = await db
      .prepare("SELECT lesson_id FROM lesson_progress WHERE user_id=?")
      .bind(uid)
      .all<{ lesson_id: string }>();
    return json({ done: r.results.map((x) => x.lesson_id) });
  }
  if (path === "/api/projects" && method === "GET") {
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
    const r = await db
      .prepare(
        `SELECT ${projectCols},content FROM projects WHERE owner_id=? ORDER BY updated_at DESC LIMIT 24 OFFSET ?`,
      )
      .bind(uid, offset)
      .all();
    return json(r.results);
  }
  if (path === "/api/projects" && method === "POST") {
    const title = text(b.title, 120),
      kind = kinds.includes(b.kind as ProjectKind)
        ? (b.kind as ProjectKind)
        : "notes",
      content =
        b.content == null
          ? null
          : typeof b.content === "string"
            ? b.content
            : undefined;
    if (!title || content === undefined || !validDocument(kind, content))
      return fail("INVALID_DOCUMENT");
    const count = await db
      .prepare("SELECT COUNT(*) n FROM projects WHERE owner_id=?")
      .bind(uid)
      .first<{ n: number }>();
    if ((count?.n ?? 0) >= 500) return fail("QUOTA", 409);
    const id = crypto.randomUUID(),
      t = now();
    await db
      .prepare(
        "INSERT INTO projects(id,owner_id,title,description,category,kind,content,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        id,
        uid,
        title,
        text(b.description, 1000),
        kind,
        kind,
        content,
        t,
        t,
      )
      .run();
    return json(
      await db.prepare("SELECT * FROM projects WHERE id=?").bind(id).first(),
      201,
    );
  }
  const pm = path.match(/^\/api\/projects\/([\w-]+)$/);
  if (pm) {
    const p = await db
      .prepare("SELECT * FROM projects WHERE id=? AND owner_id=?")
      .bind(pm[1], uid)
      .first<Row>();
    if (!p) return fail("NOT_FOUND", 404);
    if (method === "GET") return json(p);
    if (method === "DELETE") {
      await db
        .prepare("DELETE FROM projects WHERE id=? AND owner_id=? AND version=?")
        .bind(pm[1], uid, Number(b.version))
        .run();
      const remaining = await db
        .prepare("SELECT id FROM projects WHERE id=?")
        .bind(pm[1])
        .first();
      return remaining ? fail("CONFLICT", 409) : json({ ok: true });
    }
    if (method === "PATCH") {
      const title = "title" in b ? text(b.title, 120) : String(p.title),
        content = "content" in b ? b.content : p.content;
      if (
        !title ||
        (content !== null && typeof content !== "string") ||
        !validDocument(p.kind as ProjectKind, content as string | null)
      )
        return fail("INVALID_DOCUMENT");
      const status = ["draft", "published", "archived"].includes(
          String(b.status),
        )
          ? b.status
          : p.status,
        visibility = ["private", "public", "unlisted"].includes(
          String(b.visibility),
        )
          ? b.visibility
          : p.visibility;
      const r = await db
        .prepare(
          "UPDATE projects SET title=?,description=?,content=?,status=?,visibility=?,version=version+1,updated_at=? WHERE id=? AND owner_id=? AND version=?",
        )
        .bind(
          title,
          "description" in b ? text(b.description, 1000) : p.description,
          content,
          status,
          visibility,
          now(),
          pm[1],
          uid,
          Number(b.version),
        )
        .run();
      if (!r.meta.changes) return fail("CONFLICT", 409);
      return json(
        await db
          .prepare("SELECT * FROM projects WHERE id=?")
          .bind(pm[1])
          .first(),
      );
    }
  }
  if (path === "/api/security/sessions" && method === "GET") {
    const r = await db
      .prepare(
        "SELECT token_hash,expires_at FROM sessions WHERE user_id=? AND expires_at>?",
      )
      .bind(uid, Date.now())
      .all<{ token_hash: string; expires_at: number }>();
    return json(
      r.results.map((s) => ({
        current: s.token_hash === token,
        expires_at: s.expires_at,
      })),
    );
  }
  if (path.startsWith("/api/security/") && method === "POST") {
    if (!(await limit(db, `security:${uid}`, 10, 900)))
      return fail("RATE_LIMIT", 429);
    if (
      !(await verify(
        typeof b.password === "string" ? b.password : "",
        String(user.pw_salt),
        String(user.pw_hash),
      ))
    )
      return fail("LOGIN_INVALID", 401);
    if (path === "/api/security/logout-all") {
      await db.prepare("DELETE FROM sessions WHERE user_id=?").bind(uid).run();
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (path === "/api/security/delete") {
      await db.prepare("DELETE FROM users WHERE id=?").bind(uid).run();
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (path === "/api/security/password") {
      const password = text(b.newPassword, 200);
      if (password.length < 12) return fail("SIGNUP_INVALID");
      const salt = "v2:" + hex(crypto.getRandomValues(new Uint8Array(16)));
      await db.batch([
        db
          .prepare("UPDATE users SET pw_salt=?,pw_hash=? WHERE id=?")
          .bind(salt, await passwordHash(password, salt), uid),
        db.prepare("DELETE FROM sessions WHERE user_id=?").bind(uid),
      ]);
      return json({ ok: true }, 200, { "Set-Cookie": await session(db, uid) });
    }
    if (path === "/api/security/recovery") {
      const recovery = hex(crypto.getRandomValues(new Uint8Array(24)));
      await db
        .prepare("UPDATE users SET recovery_hash=? WHERE id=?")
        .bind(await hash(recovery), uid)
        .run();
      return json({ recovery });
    }
    if (path === "/api/security/export") {
      const [p, x, l] = await Promise.all(
        ["projects", "xp_events", "lesson_progress"].map((table) =>
          db
            .prepare(
              `SELECT * FROM ${table} WHERE ${table === "projects" ? "owner_id" : "user_id"}=?`,
            )
            .bind(uid)
            .all(),
        ),
      );
      return json({
        user: publicUser(user),
        projects: p.results,
        xp: x.results,
        lessons: l.results,
      });
    }
  }
  if (path === "/api/notifications" && method === "GET") {
    const r = await db
      .prepare(
        "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100",
      )
      .bind(uid)
      .all();
    return json(r.results);
  }
  const nm = path.match(/^\/api\/notifications\/([\w-]+)\/read$/);
  if (nm && method === "POST") {
    await db
      .prepare("UPDATE notifications SET read=1 WHERE user_id=? AND id=?")
      .bind(uid, nm[1])
      .run();
    return json({ ok: true });
  }
  if (path === "/api/admin" && method === "GET") {
    const role = await db
      .prepare("SELECT role FROM profiles WHERE user_id=?")
      .bind(uid)
      .first<{ role: string }>();
    if (role?.role !== "admin") return fail("FORBIDDEN", 403);
    return json(
      await db
        .prepare(
          "SELECT (SELECT COUNT(*) FROM users) users,(SELECT COUNT(*) FROM projects) projects,(SELECT COUNT(*) FROM lesson_progress) lessons",
        )
        .first(),
    );
  }
  return fail("NOT_FOUND", 404);
}
export default {
  async fetch(req: Request, env: Env) {
    try {
      return await route(req, env);
    } catch (e) {
      console.error("API error", e instanceof Error ? e.message : "unknown");
      return fail("SERVER_ERROR", 500);
    }
  },
};
