import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/settings', (req: Request, res: Response) => {
  const user = db.prepare('SELECT age_range, typical_triggers, leaderboard_opt_in FROM users WHERE id = ?').get(req.user!.userId) as any;
  res.json({
    ageRange: user.age_range || '',
    typicalTriggers: user.typical_triggers ? JSON.parse(user.typical_triggers) : [],
    leaderboardOptIn: !!user.leaderboard_opt_in,
  });
});

router.post('/settings', (req: Request, res: Response) => {
  const schema = z.object({
    ageRange: z.string().optional(),
    typicalTriggers: z.array(z.string()).optional(),
    leaderboardOptIn: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { ageRange, typicalTriggers, leaderboardOptIn } = parsed.data;
  if (ageRange !== undefined) {
    db.prepare('UPDATE users SET age_range = ? WHERE id = ?').run(ageRange, req.user!.userId);
  }
  if (typicalTriggers !== undefined) {
    db.prepare('UPDATE users SET typical_triggers = ? WHERE id = ?').run(JSON.stringify(typicalTriggers), req.user!.userId);
  }
  if (leaderboardOptIn !== undefined) {
    db.prepare('UPDATE users SET leaderboard_opt_in = ? WHERE id = ?').run(leaderboardOptIn ? 1 : 0, req.user!.userId);
  }

  res.json({ ok: true });
});

router.post('/disclaimer', (req: Request, res: Response) => {
  db.prepare('UPDATE users SET disclaimer_accepted_at = datetime(?) WHERE id = ?').run('now', req.user!.userId);
  res.json({ ok: true });
});

router.get('/export', (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = db.prepare('SELECT id, email, display_name, xp, level, created_at FROM users WHERE id = ?').get(userId);
  const sleep = db.prepare('SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY date').all(userId);
  const water = db.prepare('SELECT * FROM water_logs WHERE user_id = ? ORDER BY date').all(userId);
  const attacks = db.prepare('SELECT * FROM migraine_attacks WHERE user_id = ? ORDER BY date').all(userId);
  const xpEvents = db.prepare('SELECT * FROM xp_events WHERE user_id = ? ORDER BY created_at').all(userId);
  res.json({ user, sleep, water, attacks, xpEvents });
});

router.post('/delete-account', (req: Request, res: Response) => {
  const userId = req.user!.userId;
  db.prepare('DELETE FROM xp_events WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = ?)').run(userId);
  db.prepare('DELETE FROM conversations WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM quiz_attempts WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM daily_fact_views WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM migraine_attacks WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM water_logs WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM sleep_logs WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;
