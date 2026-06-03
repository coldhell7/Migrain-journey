import db from '../db';

interface Insight {
  title: string;
  body: string;
  type: 'positive' | 'warning' | 'info';
}

export function generateInsights(userId: number): Insight[] {
  const insights: Insight[] = [];

  const disclaimer = 'This is an observed pattern based on your logged data. Correlation does not imply causation. Please discuss any concerns with a healthcare professional.';

  const attacks7 = db.prepare(`
    SELECT * FROM migraine_attacks WHERE user_id = ? AND date >= date('now', '-7 days')
  `).all(userId) as any[];

  const attacks30 = db.prepare(`
    SELECT * FROM migraine_attacks WHERE user_id = ? AND date >= date('now', '-30 days')
  `).all(userId) as any[];

  const sleep7 = db.prepare(`
    SELECT * FROM sleep_logs WHERE user_id = ? AND date >= date('now', '-7 days')
  `).all(userId) as any[];

  const water7 = db.prepare(`
    SELECT * FROM water_logs WHERE user_id = ? AND date >= date('now', '-7 days')
  `).all(userId) as any[];

  if (attacks30.length < 3) {
    insights.push({
      title: 'Keep logging!',
      body: 'Log at least 3 migraine attacks to unlock personalized pattern insights. Every entry helps you understand your triggers better.',
      type: 'info',
    });
    return insights;
  }

  // Sleep ↔ attacks
  if (sleep7.length > 0 && attacks7.length > 0) {
    const poorSleepDays = sleep7.filter((s: any) => s.hours < 6).map((s: any) => s.date);
    const attacksAfterPoorSleep = attacks7.filter((a: any) => poorSleepDays.includes(a.date));
    if (attacksAfterPoorSleep.length > 0) {
      insights.push({
        title: 'Sleep & Migraine Connection',
        body: `You've had ${attacksAfterPoorSleep.length} migraine attack(s) on days following less than 6 hours of sleep. Prioritizing rest may help reduce attack frequency. ${disclaimer}`,
        type: 'warning',
      });
    }
  }

  // Hydration ↔ attacks
  if (water7.length > 0 && attacks7.length > 0) {
    const missedGoalDays = water7.filter((w: any) => w.glasses < w.goal).map((w: any) => w.date);
    const attacksOnLowHydration = attacks7.filter((a: any) => missedGoalDays.includes(a.date));
    if (attacksOnLowHydration.length > 0) {
      insights.push({
        title: 'Hydration Patterns',
        body: `${attacksOnLowHydration.length} of your recent attacks occurred on days you didn't meet your water goal. Staying hydrated may help. ${disclaimer}`,
        type: 'info',
      });
    }
  }

  // Trigger frequency
  if (attacks30.length > 0) {
    const triggerCounts: Record<string, number> = {};
    attacks30.forEach((a: any) => {
      const triggers = JSON.parse(a.triggers || '[]');
      triggers.forEach((t: string) => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; });
    });
    const sorted = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topTriggers = sorted.slice(0, 3).map(([t, c]) => `${t} (${c}x)`).join(', ');
      insights.push({
        title: 'Most Common Triggers',
        body: `Your top logged triggers this month: ${topTriggers}. Being aware of these patterns can help you plan ahead. ${disclaimer}`,
        type: 'info',
      });
    }
  }

  // Time/day patterns
  if (attacks30.length >= 5) {
    const dayCounts: Record<string, number> = {};
    attacks30.forEach((a: any) => {
      const day = new Date(a.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const maxDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxDay && maxDay[1] > attacks30.length / 7) {
      insights.push({
        title: 'Day-of-Week Pattern',
        body: `${maxDay[0]} appears to be your most frequent migraine day (${maxDay[1]} attacks this month). Consider what activities or stressors are typical for that day. ${disclaimer}`,
        type: 'info',
      });
    }
  }

  // Trend comparison
  if (attacks30.length > 0) {
    const previous30 = db.prepare(`
      SELECT COUNT(*) as count, AVG(intensity) as avg_intensity FROM migraine_attacks
      WHERE user_id = ? AND date >= date('now', '-60 days') AND date < date('now', '-30 days')
    `).get(userId) as any;

    const currentCount = attacks30.length;
    const prevCount = previous30?.count || 0;

    if (prevCount > 0) {
      const diff = currentCount - prevCount;
      if (diff < 0) {
        insights.push({
          title: 'Encouraging Trend',
          body: `Your attack frequency has decreased by ${Math.abs(diff)} compared to the previous month. Keep up the great tracking work! ${disclaimer}`,
          type: 'positive',
        });
      } else if (diff > 0) {
        insights.push({
          title: 'Increasing Frequency',
          body: `Your attack frequency has increased by ${diff} compared to the previous month. Consider reviewing your recent patterns and discussing with your doctor. ${disclaimer}`,
          type: 'warning',
        });
      }
    }
  }

  // Positive reinforcement
  const waterGoalMet = water7.filter((w: any) => w.glasses >= w.goal).length;
  if (waterGoalMet >= 5) {
    insights.push({
      title: 'Great Hydration Habit!',
      body: `You met your water goal on ${waterGoalMet} out of the last 7 days. Staying consistent with hydration is a great achievement!`,
      type: 'positive',
    });
  }

  const goodSleep = sleep7.filter((s: any) => s.quality === 'good').length;
  if (goodSleep >= 4) {
    insights.push({
      title: 'Quality Sleep Streak',
      body: `You've rated ${goodSleep} of your last 7 nights as good quality sleep. Consistent rest is fantastic for overall wellness.`,
      type: 'positive',
    });
  }

  return insights;
}
