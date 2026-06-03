import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/messages', (req: Request, res: Response) => {
  let conv = db.prepare('SELECT * FROM conversations WHERE user_id = ?').get(req.user!.userId) as any;

  if (!conv) {
    const doctor = db.prepare("SELECT id FROM users WHERE role = 'doctor' LIMIT 1").get() as any;
    const result = db.prepare('INSERT INTO conversations (user_id, doctor_id) VALUES (?, ?)').run(req.user!.userId, doctor?.id || null);
    conv = { id: result.lastInsertRowid };
  }

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(conv.id) as any[];

  // Mark as read by user
  db.prepare('UPDATE messages SET read_by_user = 1 WHERE conversation_id = ? AND sender_role != ?').run(conv.id, 'user');

  res.json({ conversation_id: conv.id, messages });
});

router.post('/messages', (req: Request, res: Response) => {
  const schema = z.object({ body: z.string().min(1).max(2000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  let conv = db.prepare('SELECT * FROM conversations WHERE user_id = ?').get(req.user!.userId) as any;
  if (!conv) {
    const doctor = db.prepare("SELECT id FROM users WHERE role = 'doctor' LIMIT 1").get() as any;
    const result = db.prepare('INSERT INTO conversations (user_id, doctor_id) VALUES (?, ?)').run(req.user!.userId, doctor?.id || null);
    conv = { id: result.lastInsertRowid };
  }

  db.prepare(
    'INSERT INTO messages (conversation_id, sender_id, sender_role, body) VALUES (?, ?, ?, ?)'
  ).run(conv.id, req.user!.userId, 'user', parsed.data.body);

  db.prepare('UPDATE conversations SET updated_at = datetime(?) WHERE id = ?').run('now', conv.id);

  res.json({ ok: true });
});

export default router;
