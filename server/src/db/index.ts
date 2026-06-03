import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const dbPath = config.dbPath;
const dir = path.dirname(dbPath);
if (dir !== '.' && !fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','doctor','admin')),
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      leaderboard_opt_in INTEGER NOT NULL DEFAULT 1,
      disclaimer_accepted_at TEXT,
      age_range TEXT,
      typical_triggers TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sleep_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      hours REAL NOT NULL,
      quality TEXT NOT NULL CHECK(quality IN ('poor','okay','good')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS water_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      glasses INTEGER NOT NULL DEFAULT 0,
      ml REAL NOT NULL DEFAULT 0,
      goal INTEGER NOT NULL DEFAULT 8,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS migraine_attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      intensity INTEGER NOT NULL CHECK(intensity >= 1 AND intensity <= 10),
      duration_min INTEGER NOT NULL,
      triggers TEXT NOT NULL DEFAULT '[]',
      symptoms TEXT NOT NULL DEFAULT '[]',
      medication TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS facts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fact_id INTEGER NOT NULL REFERENCES facts(id),
      question TEXT NOT NULL,
      options TEXT NOT NULL DEFAULT '[]',
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id),
      selected_index INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_fact_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      fact_id INTEGER NOT NULL REFERENCES facts(id),
      date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS xp_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      doctor_id INTEGER REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      sender_id INTEGER NOT NULL REFERENCES users(id),
      sender_role TEXT NOT NULL,
      body TEXT NOT NULL,
      read_by_user INTEGER NOT NULL DEFAULT 0,
      read_by_doctor INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_attacks_user_date ON migraine_attacks(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id);

    CREATE TABLE IF NOT EXISTS gamification_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value INTEGER NOT NULL
    );
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_sleep_log', 10);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_water_goal', 15);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_water_glass', 2);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_migraine_log', 15);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_quiz_correct', 20);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_quiz_attempt', 5);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('xp_daily_fact', 5);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('streak_bonus_base', 5);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('streak_bonus_cap', 50);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('level_2_threshold', 100);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('level_3_threshold', 250);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('level_4_threshold', 500);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('level_5_threshold', 850);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('level_6_threshold', 1300);
    INSERT OR IGNORE INTO gamification_config (key, value) VALUES ('level_beyond_increment', 500);
  `);
}

export default db;
