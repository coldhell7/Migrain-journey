import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateInsights } from '../services/analysis';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const insights = generateInsights(req.user!.userId);
  res.json({ insights });
});

export default router;
