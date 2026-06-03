import db from '../db';

const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 850, 6: 1300,
};

function getLevelThreshold(level: number): number {
  if (level <= 6) return LEVEL_THRESHOLDS[level];
  return 1300 + (level - 6) * 500;
}

export function awardXP(userId: number, type: string, amount: number): { xp: number; level: number; leveledUp: boolean } {
  const insert = db.prepare('INSERT INTO xp_events (user_id, type, amount) VALUES (?, ?, ?)');
  insert.run(userId, type, amount);

  const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(userId) as { xp: number; level: number } | undefined;
  if (!user) throw new Error('User not found');

  const newXP = user.xp + amount;
  let newLevel = user.level;
  let leveledUp = false;

  while (getLevelThreshold(newLevel + 1) <= newXP) {
    newLevel++;
    leveledUp = true;
  }

  db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP, newLevel, userId);
  return { xp: newXP, level: newLevel, leveledUp };
}
