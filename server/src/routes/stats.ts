import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const range = parseInt(req.query.range as string) || 30;
  const userId = req.user!.userId;

  const sleepData = db.prepare(`
    SELECT date, hours, quality FROM sleep_logs
    WHERE user_id = ? AND date >= date('now', ? || ' days')
    ORDER BY date ASC
  `).all(userId, `-${range}`);

  const waterData = db.prepare(`
    SELECT date, glasses, ml, goal FROM water_logs
    WHERE user_id = ? AND date >= date('now', ? || ' days')
    ORDER BY date ASC
  `).all(userId, `-${range}`);

  const attackData = db.prepare(`
    SELECT date, intensity, duration_min, triggers FROM migraine_attacks
    WHERE user_id = ? AND date >= date('now', ? || ' days')
    ORDER BY date ASC
  `).all(userId, `-${range}`);

  const attacks = attackData.map((a: any) => ({ ...a, triggers: JSON.parse(a.triggers || '[]') }));

  // Weekly aggregation
  const weeklyAttacks: Record<string, { count: number; totalIntensity: number }> = {};
  attacks.forEach((a: any) => {
    const weekStart = getWeekStart(a.date);
    if (!weeklyAttacks[weekStart]) weeklyAttacks[weekStart] = { count: 0, totalIntensity: 0 };
    weeklyAttacks[weekStart].count++;
    weeklyAttacks[weekStart].totalIntensity += a.intensity;
  });

  const weeklyData = Object.entries(weeklyAttacks).map(([week, data]) => ({
    week,
    count: data.count,
    avgIntensity: data.count > 0 ? Math.round(data.totalIntensity / data.count * 10) / 10 : 0,
  }));

  // Trigger breakdown
  const triggerCounts: Record<string, number> = {};
  attacks.forEach((a: any) => {
    a.triggers.forEach((t: string) => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; });
  });
  const triggerBreakdown = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  res.json({
    sleep: sleepData,
    water: waterData,
    attacks,
    weekly: weeklyData,
    triggers: triggerBreakdown,
  });
});

router.get('/calendar', (req: Request, res: Response) => {
  const month = req.query.month as string || new Date().toISOString().slice(0, 7);
  const userId = req.user!.userId;

  const attacks = db.prepare(`
    SELECT date, intensity, COUNT(*) as count FROM migraine_attacks
    WHERE user_id = ? AND date LIKE ?
    GROUP BY date
  `).all(userId, `${month}%`);

  const sleepData = db.prepare(`
    SELECT date, hours, quality FROM sleep_logs
    WHERE user_id = ? AND date LIKE ?
  `).all(userId, `${month}%`);

  const waterData = db.prepare(`
    SELECT date, glasses, goal FROM water_logs
    WHERE user_id = ? AND date LIKE ?
  `).all(userId, `${month}%`);

  const sleepMap: Record<string, any> = {};
  sleepData.forEach((s: any) => { sleepMap[s.date] = s; });
  const waterMap: Record<string, any> = {};
  waterData.forEach((w: any) => { waterMap[w.date] = w; });

  const days: Record<string, any> = {};
  attacks.forEach((a: any) => {
    days[a.date] = { ...days[a.date], attacks: a, sleep: sleepMap[a.date] || null, water: waterMap[a.date] || null };
  });

  res.json({ days });
});

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export default router;
