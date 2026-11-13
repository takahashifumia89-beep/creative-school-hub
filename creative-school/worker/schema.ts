// Additive, idempotent upgrade for existing installations. Also works on an empty bound D1 database.
export const schemaStatements: string[] = [
  "CREATE TABLE IF NOT EXISTS users (\n  id TEXT PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE,\n  display_name TEXT NOT NULL,\n  pw_salt TEXT NOT NULL,\n  pw_hash TEXT NOT NULL,\n  created_at TEXT NOT NULL\n);",
  "CREATE TABLE IF NOT EXISTS sessions (\n  token_hash TEXT PRIMARY KEY,\n  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  expires_at INTEGER NOT NULL\n);",
  "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);",
  "CREATE TABLE IF NOT EXISTS profiles (\n  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,\n  display_name TEXT, username TEXT, avatar_url TEXT, bio TEXT,\n  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','creator','admin')),\n  xp INTEGER NOT NULL DEFAULT 0,\n  level INTEGER NOT NULL DEFAULT 1,\n  onboarding_completed INTEGER NOT NULL DEFAULT 0,\n  created_at TEXT NOT NULL, updated_at TEXT NOT NULL\n);",
  "CREATE TABLE IF NOT EXISTS projects (\n  id TEXT PRIMARY KEY,\n  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  title TEXT NOT NULL, description TEXT, cover_url TEXT, category TEXT,\n  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','blocked')),\n  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','unlisted','public')),\n  created_at TEXT NOT NULL, updated_at TEXT NOT NULL\n);",
  "CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id, updated_at DESC);",
  "CREATE TABLE IF NOT EXISTS notifications (\n  id TEXT PRIMARY KEY,\n  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT, href TEXT,\n  read INTEGER NOT NULL DEFAULT 0,\n  created_at TEXT NOT NULL\n);",
  "CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);",
  "CREATE TABLE IF NOT EXISTS xp_events (\n  id TEXT PRIMARY KEY,\n  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  kind TEXT NOT NULL,\n  ref TEXT NOT NULL,\n  xp INTEGER NOT NULL,\n  day TEXT NOT NULL,\n  created_at TEXT NOT NULL,\n  UNIQUE (user_id, kind, ref)\n);",
  "CREATE INDEX IF NOT EXISTS idx_xp_user_day ON xp_events(user_id, day);",
  "ALTER TABLE projects ADD COLUMN content TEXT;",
  "CREATE TABLE IF NOT EXISTS lesson_progress (\n  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  lesson_id TEXT NOT NULL,\n  course_id TEXT NOT NULL,\n  completed_at TEXT NOT NULL,\n  PRIMARY KEY (user_id, lesson_id)\n);",
  "ALTER TABLE projects ADD COLUMN kind TEXT NOT NULL DEFAULT 'notes';",
  "ALTER TABLE projects ADD COLUMN version INTEGER NOT NULL DEFAULT 1;",
  "UPDATE projects SET kind = CASE category WHEN 'Дизайн' THEN 'design' WHEN '3D и моделирование' THEN '3d' ELSE 'notes' END;",
  "ALTER TABLE users ADD COLUMN recovery_hash TEXT;",
  "CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);",
  "CREATE INDEX IF NOT EXISTS idx_limits_expiry ON rate_limits(expires);",
  "CREATE INDEX IF NOT EXISTS idx_public_projects ON projects(owner_id, status, visibility);",
  "CREATE TABLE IF NOT EXISTS badges (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, badge TEXT NOT NULL, earned_at TEXT NOT NULL, PRIMARY KEY(user_id,badge));",
  "CREATE TRIGGER IF NOT EXISTS xp_profile AFTER INSERT ON xp_events BEGIN\n UPDATE profiles SET xp=(SELECT COALESCE(SUM(xp),0) FROM xp_events WHERE user_id=NEW.user_id), updated_at=NEW.created_at WHERE user_id=NEW.user_id;\nEND;",
  "CREATE TRIGGER IF NOT EXISTS lesson_award AFTER INSERT ON lesson_progress BEGIN\n INSERT OR IGNORE INTO xp_events (id,user_id,kind,ref,xp,day,created_at) VALUES(lower(hex(randomblob(16))),NEW.user_id,'lesson',NEW.lesson_id,10,date('now','+5 hours'),NEW.completed_at);\nEND;",
  "CREATE TRIGGER IF NOT EXISTS project_award AFTER INSERT ON projects WHEN (SELECT COUNT(*) FROM xp_events WHERE user_id=NEW.owner_id AND kind='project' AND day=date('now','+5 hours')) < 5 BEGIN\n INSERT OR IGNORE INTO xp_events VALUES(lower(hex(randomblob(16))),NEW.owner_id,'project',NEW.id,20,date('now','+5 hours'),NEW.created_at);\nEND;",
  "CREATE TRIGGER IF NOT EXISTS publish_award AFTER UPDATE OF status ON projects WHEN NEW.status='published' BEGIN\n INSERT OR IGNORE INTO xp_events VALUES(lower(hex(randomblob(16))),NEW.owner_id,'publish',NEW.id,50,date('now','+5 hours'),NEW.updated_at);\n INSERT OR IGNORE INTO badges VALUES(NEW.owner_id,'publish',NEW.updated_at);\nEND;",
  "CREATE TRIGGER IF NOT EXISTS lesson_badge AFTER INSERT ON lesson_progress BEGIN\n INSERT OR IGNORE INTO badges VALUES(NEW.user_id,'lesson',NEW.completed_at);\n INSERT OR IGNORE INTO badges SELECT NEW.user_id,'ten-lessons',NEW.completed_at WHERE (SELECT COUNT(*) FROM lesson_progress WHERE user_id=NEW.user_id)>=10;\nEND;",
  "CREATE TRIGGER IF NOT EXISTS project_badge AFTER INSERT ON projects BEGIN\n INSERT OR IGNORE INTO badges SELECT NEW.owner_id,'projects',NEW.created_at WHERE (SELECT COUNT(*) FROM projects WHERE owner_id=NEW.owner_id)>=3;\nEND;",
  "CREATE TRIGGER IF NOT EXISTS level_badge AFTER INSERT ON xp_events BEGIN\n INSERT OR IGNORE INTO badges SELECT NEW.user_id,'level',NEW.created_at WHERE (SELECT SUM(xp) FROM xp_events WHERE user_id=NEW.user_id)>=400;\nEND;",
  "INSERT OR IGNORE INTO badges SELECT user_id,'lesson',MIN(completed_at) FROM lesson_progress GROUP BY user_id;",
  "INSERT OR IGNORE INTO badges SELECT user_id,'ten-lessons',MAX(completed_at) FROM lesson_progress GROUP BY user_id HAVING COUNT(*)>=10;",
  "INSERT OR IGNORE INTO badges SELECT owner_id,'projects',MAX(created_at) FROM projects GROUP BY owner_id HAVING COUNT(*)>=3;",
  "INSERT OR IGNORE INTO badges SELECT user_id,'level',MAX(created_at) FROM xp_events GROUP BY user_id HAVING SUM(xp)>=400;",
  "INSERT OR IGNORE INTO badges SELECT user_id,'publish',MIN(created_at) FROM xp_events WHERE kind='publish' GROUP BY user_id;",
];
let upgrade: Promise<void> | null = null;
export function ensureSchema(db: D1Database): Promise<void> {
  upgrade ??= apply(db).catch((error) => {
    upgrade = null;
    throw error;
  });
  return upgrade;
}
async function apply(db: D1Database) {
  try {
    const row = await db
      .prepare("SELECT version FROM cs_schema WHERE id=1")
      .first<{ version: number }>();
    if (row && row.version >= 5) return;
  } catch {
    /* existing installation */
  }
  let newKind = false;
  for (const sql of schemaStatements) {
    const alter = sql.match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)/i);
    if (alter) {
      const columns = await db
        .prepare(`PRAGMA table_info(${alter[1]})`)
        .all<{ name: string }>();
      if (columns.results.some((c) => c.name === alter[2])) continue;
      try {
        await db.prepare(sql).run();
        if (alter[2] === "kind") newKind = true;
      } catch (error) {
        // Another Worker instance may have completed the same additive ALTER.
        const retry = await db
          .prepare(`PRAGMA table_info(${alter[1]})`)
          .all<{ name: string }>();
        if (!retry.results.some((c) => c.name === alter[2])) throw error;
      }
      continue;
    }
    if (sql.startsWith("UPDATE projects SET kind") && !newKind) continue;
    await db.prepare(sql).run();
  }
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)",
    )
    .run();
  for (const name of [
    "0001_init.sql",
    "0002_xp.sql",
    "0003_content.sql",
    "0004_progress.sql",
    "0005_platform.sql",
  ])
    await db
      .prepare("INSERT OR IGNORE INTO d1_migrations(name) VALUES(?)")
      .bind(name)
      .run();
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS cs_schema(id INTEGER PRIMARY KEY,version INTEGER NOT NULL)",
    )
    .run();
  await db
    .prepare(
      "INSERT INTO cs_schema VALUES(1,5) ON CONFLICT(id) DO UPDATE SET version=5",
    )
    .run();
}
