import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xp';

const router = Router();
router.use(authMiddleware);

router.get('/today', (req: Request, res: Response) => {
  const factCount = db.prepare('SELECT COUNT(*) as count FROM facts').get() as any;
  if (factCount.count === 0) return res.json(null);

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const factIndex = dayOfYear % factCount.count;

  const fact = db.prepare('SELECT * FROM facts ORDER BY id LIMIT 1 OFFSET ?').get(factIndex) as any;

  const alreadyViewed = db.prepare('SELECT id FROM daily_fact_views WHERE user_id = ? AND date = date(?)').get(req.user!.userId, 'now');
  if (!alreadyViewed) {
    db.prepare('INSERT INTO daily_fact_views (user_id, fact_id, date) VALUES (?, ?, date(?))').run(req.user!.userId, fact.id, 'now');
    awardXP(req.user!.userId, 'daily_fact', 5);
  }

  res.json(fact);
});

export default router;
