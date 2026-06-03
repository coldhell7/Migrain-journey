import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { getStreak } from '../services/streak';

const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 850, 6: 1300,
};

function getLevelThreshold(level: number): number {
  if (level <= 6) return LEVEL_THRESHOLDS[level];
  return 1300 + (level - 6) * 500;
}

const UNLOCK_SECTIONS: Record<number, string[]> = {
  1: ['dashboard', 'logging', 'daily_fact', 'specialist_chat'],
  2: ['quizzes'],
  3: ['analysis'],
  4: ['calendar'],
  5: ['leaderboard'],
};

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(req.user!.userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  const level = user.level;
  const xp = user.xp;
  const nextLevelThreshold = getLevelThreshold(level + 1);
  const currentThreshold = getLevelThreshold(level);
  const xpToNextLevel = nextLevelThreshold - currentThreshold;
  const xpInLevel = xp - currentThreshold;
  const streak = getStreak(req.user!.userId);

  const unlockedSections: string[] = [];
  const lockedSections: { name: string; requiredLevel: number }[] = [];

  for (const [lvl, sections] of Object.entries(UNLOCK_SECTIONS)) {
    const numLevel = parseInt(lvl);
    if (level >= numLevel) {
      unlockedSections.push(...sections);
    } else {
      sections.forEach(s => lockedSections.push({ name: s, requiredLevel: numLevel }));
    }
  }

  // Always include safety-essential sections
  if (!unlockedSections.includes('specialist_chat')) unlockedSections.push('specialist_chat');
  if (!unlockedSections.includes('dashboard')) unlockedSections.push('dashboard');
  if (!unlockedSections.includes('logging')) unlockedSections.push('logging');
  if (!unlockedSections.includes('daily_fact')) unlockedSections.push('daily_fact');

  res.json({ xp, level, xpToNextLevel, xpInLevel, streak, unlockedSections, lockedSections });
});

export default router;
