import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('doctor', 'admin'));

// Conversations
router.get('/conversations', (req: Request, res: Response) => {
  const conversations = db.prepare(`
    SELECT c.*, u.display_name as user_name, u.email as user_email,
      (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_by_doctor = 0 AND sender_role = 'user') as unread_count
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    ORDER BY unread_count DESC, c.updated_at DESC
  `).all();

  res.json(conversations);
});

router.get('/conversations/:id', (req: Request, res: Response) => {
  const conv = db.prepare(`
    SELECT c.*, u.display_name as user_name, u.email as user_email FROM conversations c
    JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(req.params.id) as any;

  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  // Get user context for doctor
  const recentAttacks = db.prepare(`
    SELECT date, intensity, duration_min, triggers FROM migraine_attacks
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
  `).all(conv.user_id) as any[];

  const recentSleep = db.prepare(`
    SELECT date, hours, quality FROM sleep_logs
    WHERE user_id = ? ORDER BY date DESC LIMIT 7
  `).all(conv.user_id);

  const recentWater = db.prepare(`
    SELECT date, glasses, goal FROM water_logs
    WHERE user_id = ? ORDER BY date DESC LIMIT 7
  `).all(conv.user_id);

  const messages = db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `).all(conv.id) as any[];

  // Mark as read by doctor
  db.prepare('UPDATE messages SET read_by_doctor = 1 WHERE conversation_id = ? AND sender_role = ?').run(conv.id, 'user');

  res.json({
    conversation: conv,
    messages: messages.map((m: any) => ({
      ...m,
      userContext: m.sender_role === 'user' ? { recentAttacks, recentSleep, recentWater } : null,
    })),
    userContext: { recentAttacks, recentSleep, recentWater },
  });
});

router.post('/conversations/:id/reply', (req: Request, res: Response) => {
  const schema = z.object({ body: z.string().min(1).max(5000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id) as any;
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  // Assign doctor if not set
  if (!conv.doctor_id) {
    db.prepare('UPDATE conversations SET doctor_id = ? WHERE id = ?').run(req.user!.userId, conv.id);
  }

  db.prepare(
    'INSERT INTO messages (conversation_id, sender_id, sender_role, body) VALUES (?, ?, ?, ?)'
  ).run(conv.id, req.user!.userId, req.user!.role, parsed.data.body);

  db.prepare('UPDATE conversations SET updated_at = datetime(?) WHERE id = ?').run('now', conv.id);
  res.json({ ok: true });
});

// Users management
router.get('/users', (req: Request, res: Response) => {
  const users = db.prepare(`
    SELECT id, email, display_name, role, xp, level, disclaimer_accepted_at, created_at
    FROM users ORDER BY created_at DESC
  `).all();
  res.json(users);
});

router.post('/users/:id/deactivate', (req: Request, res: Response) => {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run('user', req.params.id);
  res.json({ ok: true });
});

// Facts management
router.get('/facts', (_req: Request, res: Response) => {
  const facts = db.prepare('SELECT * FROM facts ORDER BY id').all();
  res.json(facts);
});

router.post('/facts', (req: Request, res: Response) => {
  const schema = z.object({ title: z.string(), body: z.string(), category: z.string(), source: z.string().optional().default('') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const result = db.prepare('INSERT INTO facts (title, body, category, source) VALUES (?, ?, ?, ?)').run(
    parsed.data.title, parsed.data.body, parsed.data.category, parsed.data.source
  );
  res.json({ id: result.lastInsertRowid });
});

router.delete('/facts/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM facts WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Quiz management
router.get('/quiz', (_req: Request, res: Response) => {
  const questions = db.prepare('SELECT * FROM quiz_questions ORDER BY id').all();
  res.json(questions.map((q: any) => ({ ...q, options: JSON.parse(q.options) })));
});

// ─── Gamification Config ───
router.get('/gamification', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM gamification_config ORDER BY key').all() as any[];
  const config: Record<string, number> = {};
  rows.forEach((r: any) => { config[r.key] = r.value; });
  res.json(config);
});

router.put('/gamification', (req: Request, res: Response) => {
  const schema = z.record(z.string(), z.number());
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const upsert = db.prepare('INSERT INTO gamification_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  const tx = db.transaction((data: Record<string, number>) => {
    for (const [key, value] of Object.entries(data)) {
      upsert.run(key, value);
    }
  });
  tx(parsed.data);
  res.json({ ok: true });
});

// ─── Stats / Analytics ───
router.get('/stats', (_req: Request, res: Response) => {
  const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role='user'").get() as any).c;
  const totalDoctors = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role IN ('doctor','admin')").get() as any).c;
  const totalConversations = (db.prepare('SELECT COUNT(*) as c FROM conversations').get() as any).c;
  const totalMessages = (db.prepare('SELECT COUNT(*) as c FROM messages').get() as any).c;
  const totalAttacks = (db.prepare('SELECT COUNT(*) as c FROM migraine_attacks').get() as any).c;
  const totalSleep = (db.prepare('SELECT COUNT(*) as c FROM sleep_logs').get() as any).c;
  const totalWater = (db.prepare('SELECT COUNT(*) as c FROM water_logs').get() as any).c;
  const totalQuizzes = (db.prepare('SELECT COUNT(*) as c FROM quiz_attempts').get() as any).c;
  const totalFacts = (db.prepare('SELECT COUNT(*) as c FROM daily_fact_views').get() as any).c;
  const totalXP = (db.prepare('SELECT COALESCE(SUM(amount),0) as c FROM xp_events').get() as any).c;

  const usersToday = (db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM xp_events WHERE date(created_at) = date('now')").get() as any).c;

  // Recent registrations (last 7 days)
  const recentRegistrations = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count FROM users
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // Activity by day (last 7 days)
  const activity = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count FROM xp_events
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // Top users by XP
  const topUsers = db.prepare(`
    SELECT display_name, xp, level FROM users WHERE role='user' ORDER BY xp DESC LIMIT 5
  `).all();

  res.json({
    totalUsers, totalDoctors, totalConversations, totalMessages,
    totalAttacks, totalSleep, totalWater, totalQuizzes, totalFacts, totalXP,
    usersToday, recentRegistrations, activity, topUsers,
  });
});

router.get('/analytics', (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;

  // Users over time
  const userGrowth = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count FROM users
    WHERE created_at >= datetime('now', ? || ' days')
    GROUP BY date(created_at) ORDER BY date
  `).all(`-${days}`);

  // XP distribution
  const xpDistribution = db.prepare(`
    SELECT
      CASE
        WHEN xp < 100 THEN '0-99'
        WHEN xp < 500 THEN '100-499'
        WHEN xp < 1000 THEN '500-999'
        ELSE '1000+'
      END as range,
      COUNT(*) as count
    FROM users WHERE role='user'
    GROUP BY range ORDER BY range
  `).all();

  // Attack intensity distribution
  const intensityDist = db.prepare(`
    SELECT
      CASE
        WHEN intensity <= 3 THEN 'Mild (1-3)'
        WHEN intensity <= 6 THEN 'Moderate (4-6)'
        ELSE 'Severe (7-10)'
      END as range,
      COUNT(*) as count
    FROM migraine_attacks
    GROUP BY range ORDER BY range
  `).all();

  // Most common triggers
  const triggerCounts: Record<string, number> = {};
  const attacks = db.prepare('SELECT triggers FROM migraine_attacks').all() as any[];
  attacks.forEach((a: any) => {
    try { JSON.parse(a.triggers).forEach((t: string) => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; }); } catch {}
  });
  const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));

  // Level distribution
  const levelDist = db.prepare('SELECT level, COUNT(*) as count FROM users WHERE role=\'user\' GROUP BY level ORDER BY level').all();

  // Attack frequency by day of week
  const dayOfWeek = db.prepare(`
    SELECT CAST(strftime('%w', date) AS INTEGER) as day, COUNT(*) as count
    FROM migraine_attacks GROUP BY day ORDER BY day
  `).all();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const attacksByDay = (dayOfWeek as any[]).map((d: any) => ({ day: dayNames[d.day], count: d.count }));

  res.json({
    userGrowth, xpDistribution, intensityDist, topTriggers, levelDist, attacksByDay,
  });
});

export default router;
