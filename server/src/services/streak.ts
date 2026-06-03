import db from '../db';

export function getStreak(userId: number): number {
  const logs = db.prepare(`
    SELECT date FROM (
      SELECT date FROM sleep_logs WHERE user_id = ?
      UNION
      SELECT date FROM water_logs WHERE user_id = ?
      UNION
      SELECT date FROM migraine_attacks WHERE user_id = ?
    ) GROUP BY date ORDER BY date DESC
  `).all(userId, userId, userId) as { date: string }[];

  if (logs.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const found = logs.some(l => l.date === dateStr);
    if (found) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      return 0;
    } else {
      break;
    }
  }
  return streak;
}
