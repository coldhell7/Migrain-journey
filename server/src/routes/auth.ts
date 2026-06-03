import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../db';
import { generateToken, authMiddleware } from '../middleware/auth';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().min(1).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/signup', (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { email, password, display_name } = parsed.data;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)').run(email, hash, display_name);

  const token = generateToken({ userId: result.lastInsertRowid as number, email, role: 'user' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ userId: result.lastInsertRowid, email, display_name, role: 'user' });
});

router.post('/login', (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ userId: user.id, email: user.email, display_name: user.display_name, role: user.role });
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, email, display_name, role, xp, level, leaderboard_opt_in, disclaimer_accepted_at, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ ...user, leaderboard_opt_in: !!user.leaderboard_opt_in });
});

export default router;
