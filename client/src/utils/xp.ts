export function getLevelThreshold(level: number): number {
  const thresholds: Record<number, number> = {
    1: 0, 2: 100, 3: 250, 4: 500, 5: 850, 6: 1300,
  };
  if (level <= 6) return thresholds[level];
  return 1300 + (level - 6) * 500;
}

export function getUnlockedSections(level: number): string[] {
  const always: string[] = ['dashboard', 'logging', 'daily_fact', 'specialist_chat', 'settings'];
  const unlocks: Record<number, string[]> = {
    1: [],
    2: ['quizzes'],
    3: ['analysis'],
    4: ['calendar'],
    5: ['leaderboard'],
  };
  const sections = [...always];
  for (const [lvl, sects] of Object.entries(unlocks)) {
    if (level >= parseInt(lvl)) sections.push(...sects);
  }
  return sections;
}
