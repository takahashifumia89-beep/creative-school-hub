ALTER TABLE projects ADD COLUMN kind TEXT NOT NULL DEFAULT 'notes';
ALTER TABLE projects ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
UPDATE projects SET kind = CASE category WHEN 'Дизайн' THEN 'design' WHEN '3D и моделирование' THEN '3d' ELSE 'notes' END;
ALTER TABLE users ADD COLUMN recovery_hash TEXT;
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX idx_limits_expiry ON rate_limits(expires);
CREATE INDEX idx_public_projects ON projects(owner_id, status, visibility);
CREATE TABLE badges (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, badge TEXT NOT NULL, earned_at TEXT NOT NULL, PRIMARY KEY(user_id,badge));
CREATE TRIGGER xp_profile AFTER INSERT ON xp_events BEGIN
 UPDATE profiles SET xp=(SELECT COALESCE(SUM(xp),0) FROM xp_events WHERE user_id=NEW.user_id), updated_at=NEW.created_at WHERE user_id=NEW.user_id;
END;
CREATE TRIGGER lesson_award AFTER INSERT ON lesson_progress BEGIN
 INSERT OR IGNORE INTO xp_events (id,user_id,kind,ref,xp,day,created_at) VALUES(lower(hex(randomblob(16))),NEW.user_id,'lesson',NEW.lesson_id,10,date('now','+5 hours'),NEW.completed_at);
END;
CREATE TRIGGER project_award AFTER INSERT ON projects WHEN (SELECT COUNT(*) FROM xp_events WHERE user_id=NEW.owner_id AND kind='project' AND day=date('now','+5 hours')) < 5 BEGIN
 INSERT OR IGNORE INTO xp_events VALUES(lower(hex(randomblob(16))),NEW.owner_id,'project',NEW.id,20,date('now','+5 hours'),NEW.created_at);
END;
CREATE TRIGGER publish_award AFTER UPDATE OF status ON projects WHEN NEW.status='published' BEGIN
 INSERT OR IGNORE INTO xp_events VALUES(lower(hex(randomblob(16))),NEW.owner_id,'publish',NEW.id,50,date('now','+5 hours'),NEW.updated_at);
 INSERT OR IGNORE INTO badges VALUES(NEW.owner_id,'publish',NEW.updated_at);
END;
CREATE TRIGGER lesson_badge AFTER INSERT ON lesson_progress BEGIN
 INSERT OR IGNORE INTO badges VALUES(NEW.user_id,'lesson',NEW.completed_at);
 INSERT OR IGNORE INTO badges SELECT NEW.user_id,'ten-lessons',NEW.completed_at WHERE (SELECT COUNT(*) FROM lesson_progress WHERE user_id=NEW.user_id)>=10;
END;
CREATE TRIGGER project_badge AFTER INSERT ON projects BEGIN
 INSERT OR IGNORE INTO badges SELECT NEW.owner_id,'projects',NEW.created_at WHERE (SELECT COUNT(*) FROM projects WHERE owner_id=NEW.owner_id)>=3;
END;
CREATE TRIGGER level_badge AFTER INSERT ON xp_events BEGIN
 INSERT OR IGNORE INTO badges SELECT NEW.user_id,'level',NEW.created_at WHERE (SELECT SUM(xp) FROM xp_events WHERE user_id=NEW.user_id)>=400;
END;
INSERT OR IGNORE INTO badges SELECT user_id,'lesson',MIN(completed_at) FROM lesson_progress GROUP BY user_id;
INSERT OR IGNORE INTO badges SELECT user_id,'ten-lessons',MAX(completed_at) FROM lesson_progress GROUP BY user_id HAVING COUNT(*)>=10;
INSERT OR IGNORE INTO badges SELECT owner_id,'projects',MAX(created_at) FROM projects GROUP BY owner_id HAVING COUNT(*)>=3;
INSERT OR IGNORE INTO badges SELECT user_id,'level',MAX(created_at) FROM xp_events GROUP BY user_id HAVING SUM(xp)>=400;
INSERT OR IGNORE INTO badges SELECT user_id,'publish',MIN(created_at) FROM xp_events WHERE kind='publish' GROUP BY user_id;
