import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xp';
import { getStreak } from '../services/streak';

const router = Router();
router.use(authMiddleware);

// Sleep
router.get('/sleep', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY date DESC').all(req.user!.userId);
  res.json(rows);
});

router.put('/sleep', (req: Request, res: Response) => {
  const schema = z.object({ date: z.string(), hours: z.number().min(0).max(24), quality: z.enum(['poor', 'okay', 'good']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { date, hours, quality } = parsed.data;
  const existing = db.prepare('SELECT id FROM sleep_logs WHERE user_id = ? AND date = ?').get(req.user!.userId, date);

  if (existing) {
    db.prepare('UPDATE sleep_logs SET hours = ?, quality = ? WHERE user_id = ? AND date = ?').run(hours, quality, req.user!.userId, date);
  } else {
    db.prepare('INSERT INTO sleep_logs (user_id, date, hours, quality) VALUES (?, ?, ?, ?)').run(req.user!.userId, date, hours, quality);
    awardXP(req.user!.userId, 'sleep_log', 10);
    const streak = getStreak(req.user!.userId);
    if (streak > 1) {
      const bonus = Math.min(streak * 5, 50);
      awardXP(req.user!.userId, 'streak_bonus', bonus);
    }
  }

  res.json({ ok: true });
});

// Water
router.get('/water', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM water_logs WHERE user_id = ? ORDER BY date DESC').all(req.user!.userId);
  res.json(rows);
});

router.put('/water', (req: Request, res: Response) => {
  const schema = z.object({ date: z.string(), glasses: z.number().int().min(0), ml: z.number().min(0), goal: z.number().int().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { date, glasses, ml, goal } = parsed.data;
  const existing = db.prepare('SELECT id FROM water_logs WHERE user_id = ? AND date = ?').get(req.user!.userId, date);

  if (existing) {
    const prev = db.prepare('SELECT glasses FROM water_logs WHERE user_id = ? AND date = ?').get(req.user!.userId, date) as any;
    const diff = glasses - prev.glasses;
    if (diff > 0) awardXP(req.user!.userId, 'water_glass', diff * 2);
    if (glasses >= goal && prev.glasses < goal) awardXP(req.user!.userId, 'water_goal', 15);
    db.prepare('UPDATE water_logs SET glasses = ?, ml = ?, goal = ? WHERE user_id = ? AND date = ?').run(glasses, ml, goal, req.user!.userId, date);
  } else {
    db.prepare('INSERT INTO water_logs (user_id, date, glasses, ml, goal) VALUES (?, ?, ?, ?, ?)').run(req.user!.userId, date, glasses, ml, goal);
    awardXP(req.user!.userId, 'water_glass', glasses * 2);
    if (glasses >= goal) awardXP(req.user!.userId, 'water_goal', 15);
    const streak = getStreak(req.user!.userId);
    if (streak > 1) {
      const bonus = Math.min(streak * 5, 50);
      awardXP(req.user!.userId, 'streak_bonus', bonus);
    }
  }

  res.json({ ok: true });
});

// Migraine Attacks
router.get('/attacks', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM migraine_attacks WHERE user_id = ? ORDER BY date DESC, start_time DESC').all(req.user!.userId);
  res.json(rows.map((r: any) => ({ ...r, triggers: JSON.parse(r.triggers), symptoms: JSON.parse(r.symptoms) })));
});

router.post('/attacks', (req: Request, res: Response) => {
  const schema = z.object({
    date: z.string(),
    start_time: z.string(),
    intensity: z.number().int().min(1).max(10),
    duration_min: z.number().int().min(0),
    triggers: z.array(z.string()),
    symptoms: z.array(z.string()),
    medication: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { date, start_time, intensity, duration_min, triggers, symptoms, medication, notes } = parsed.data;
  const result = db.prepare(
    'INSERT INTO migraine_attacks (user_id, date, start_time, intensity, duration_min, triggers, symptoms, medication, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user!.userId, date, start_time, intensity, duration_min, JSON.stringify(triggers), JSON.stringify(symptoms), medication, notes);

  awardXP(req.user!.userId, 'migraine_log', 15);
  const streak = getStreak(req.user!.userId);
  if (streak > 1) {
    const bonus = Math.min(streak * 5, 50);
    awardXP(req.user!.userId, 'streak_bonus', bonus);
  }

  res.json({ id: result.lastInsertRowid });
});

router.put('/attacks/:id', (req: Request, res: Response) => {
  const schema = z.object({
    date: z.string(),
    start_time: z.string(),
    intensity: z.number().int().min(1).max(10),
    duration_min: z.number().int().min(0),
    triggers: z.array(z.string()),
    symptoms: z.array(z.string()),
    medication: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { date, start_time, intensity, duration_min, triggers, symptoms, medication, notes } = parsed.data;
  db.prepare(
    'UPDATE migraine_attacks SET date=?, start_time=?, intensity=?, duration_min=?, triggers=?, symptoms=?, medication=?, notes=? WHERE id=? AND user_id=?'
  ).run(date, start_time, intensity, duration_min, JSON.stringify(triggers), JSON.stringify(symptoms), medication, notes, req.params.id, req.user!.userId);
  res.json({ ok: true });
});

router.delete('/attacks/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM migraine_attacks WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.userId);
  res.json({ ok: true });
});

export default router;
