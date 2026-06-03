import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const CONFIG_LABELS: Record<string, string> = {
  xp_sleep_log: 'Sleep Log',
  xp_water_goal: 'Water Goal Reached',
  xp_water_glass: 'Per Water Glass',
  xp_migraine_log: 'Migraine Logged',
  xp_quiz_correct: 'Quiz Correct',
  xp_quiz_attempt: 'Quiz Attempt (wrong)',
  xp_daily_fact: 'Daily Fact Viewed',
  streak_bonus_base: 'Streak Bonus (per day)',
  streak_bonus_cap: 'Streak Bonus Cap',
  level_2_threshold: 'Level 2 Threshold',
  level_3_threshold: 'Level 3 Threshold',
  level_4_threshold: 'Level 4 Threshold',
  level_5_threshold: 'Level 5 Threshold',
  level_6_threshold: 'Level 6 Threshold',
  level_beyond_increment: 'Level 7+ Increment',
};

const CONFIG_CATEGORIES: Record<string, string[]> = {
  'XP Awards': ['xp_sleep_log', 'xp_water_goal', 'xp_water_glass', 'xp_migraine_log', 'xp_quiz_correct', 'xp_quiz_attempt', 'xp_daily_fact', 'streak_bonus_base', 'streak_bonus_cap'],
  'Level Thresholds': ['level_2_threshold', 'level_3_threshold', 'level_4_threshold', 'level_5_threshold', 'level_6_threshold', 'level_beyond_increment'],
};

export default function AdminGamification() {
  const [config, setConfig] = useState<Record<string, number>>({});
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/api/admin/gamification').then(data => {
      setConfig(data);
      setEdited({ ...data });
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api('/api/admin/gamification', { method: 'PUT', body: JSON.stringify(edited) });
      setConfig({ ...edited });
      setMsg('Saved successfully!');
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Save failed'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(edited);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">XP & Levels Configuration</h1>
        <button onClick={save} disabled={!hasChanges || saving}
          className="bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
        </button>
      </div>

      {msg && <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm p-3 rounded-xl">{msg}</div>}

      <p className="text-xs text-gray-400">Tune XP rewards and level progression. Changes take effect for new actions.</p>

      {Object.entries(CONFIG_CATEGORIES).map(([category, keys]) => (
        <div key={category} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-sm mb-4">{category}</h2>
          <div className="space-y-4">
            {keys.map(key => (
              <div key={key}>
                <label className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{CONFIG_LABELS[key] || key}</span>
                  <span className="text-xs text-gray-400 font-mono">{key}</span>
                </label>
                <input type="number" min="0" max="9999" value={edited[key] ?? 0} onChange={e => setEdited({ ...edited, [key]: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-4">
        <h3 className="font-semibold text-sm mb-2">📐 How Levels Work</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          Levels 1-6 use the custom thresholds above. Level 7+ uses the "Level 7+ Increment" as the XP gap between each level.
          The base level thresholds are cumulative: to reach Level 5, a user needs the Level 5 threshold value in total XP.
        </p>
      </div>
    </div>
  );
}
