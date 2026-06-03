import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xp';

const router = Router();
router.use(authMiddleware);

router.get('/next', (req: Request, res: Response) => {
  const recentAttempts = db.prepare(
    'SELECT question_id FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.user!.userId) as any[];

  const excludeIds = recentAttempts.map((a: any) => a.question_id);
  let question;

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => '?').join(',');
    question = db.prepare(
      `SELECT * FROM quiz_questions WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`
    ).get(...excludeIds) as any;
  }

  if (!question) {
    question = db.prepare('SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT 1').get() as any;
  }

  if (!question) return res.json(null);
  res.json({ ...question, options: JSON.parse(question.options) });
});

router.post('/answer', (req: Request, res: Response) => {
  const schema = z.object({ question_id: z.number(), selected_index: z.number().int() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const { question_id, selected_index } = parsed.data;
  const question = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(question_id) as any;
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const is_correct = selected_index === question.correct_index;
  db.prepare('INSERT INTO quiz_attempts (user_id, question_id, selected_index, is_correct) VALUES (?, ?, ?, ?)')
    .run(req.user!.userId, question_id, selected_index, is_correct ? 1 : 0);

  if (is_correct) {
    awardXP(req.user!.userId, 'quiz_correct', 20);
  } else {
    awardXP(req.user!.userId, 'quiz_attempt', 5);
  }

  res.json({
    is_correct,
    correct_index: question.correct_index,
    explanation: question.explanation,
  });
});

export default router;
