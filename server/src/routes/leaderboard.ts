import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const allUsers = db.prepare(`
    SELECT id, display_name, xp, level FROM users
    WHERE leaderboard_opt_in = 1 AND role = 'user'
    ORDER BY xp DESC
  `).all() as any[];

  const leaderboard = allUsers.map((u, i) => ({
    rank: i + 1,
    display_name: u.display_name,
    level: u.level,
    xp: u.xp,
    isCurrentUser: u.id === req.user!.userId,
  }));

  const currentUser = db.prepare('SELECT id, leaderboard_opt_in FROM users WHERE id = ?').get(req.user!.userId) as any;
  const currentUserEntry = leaderboard.find(e => e.isCurrentUser);

  res.json({
    leaderboard,
    currentUserRank: currentUserEntry?.rank || null,
    optedIn: !!currentUser?.leaderboard_opt_in,
  });
});

export default router;
