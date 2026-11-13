import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
// Evaluate the generated SQL against a real SQLite engine, including triggers and upgrades.
import { schemaStatements as scripts } from "../worker/schema";
test("bootstrap upgrades the legacy schema without losing accounts or project content", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    readFileSync(
      new URL("../migrations/0001_init.sql", import.meta.url),
      "utf8",
    ),
  );
  db.exec(
    "INSERT INTO users VALUES('u','legacy@example.test','Legacy','salt','hash','2026-01-01'); INSERT INTO profiles(user_id,created_at,updated_at) VALUES('u','2026','2026'); INSERT INTO projects(id,owner_id,title,category,created_at,updated_at) VALUES('p','u','Original','Дизайн','2026','2026');",
  );
  for (const sql of scripts) {
    const alter = sql.match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)/i);
    if (
      alter &&
      db
        .prepare(`PRAGMA table_info(${alter[1]})`)
        .all()
        .some((c) => c.name === alter[2])
    )
      continue;
    db.exec(sql);
  }
  assert.equal(db.prepare("SELECT kind FROM projects").get()?.kind, "design");
  assert.equal(
    db.prepare("SELECT display_name FROM users").get()?.display_name,
    "Legacy",
  );
  db.exec(
    "INSERT INTO lesson_progress VALUES('u','vis-1','visual-basics','2026-01-01');",
  );
  assert.equal(db.prepare("SELECT SUM(xp) xp FROM xp_events").get()?.xp, 10);
  // CREATE statements are safe to repeat after a cold start or interrupted upgrade.
  for (const sql of scripts.filter((s) => s.startsWith("CREATE ")))
    db.exec(sql);
  db.close();
});
