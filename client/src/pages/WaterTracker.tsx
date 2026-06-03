import { useState, useEffect, FormEvent } from 'react';
import { api } from '../utils/api';

export default function WaterTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [today, setToday] = useState({ date: new Date().toISOString().split('T')[0], glasses: 0, goal: 8 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await api<any[]>('/api/water');
      setLogs(data);
      const t = new Date().toISOString().split('T')[0];
      const existing = data.find((l: any) => l.date === t);
      if (existing) setToday({ date: t, glasses: existing.glasses, goal: existing.goal });
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const submit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    await api('/api/water', {
      method: 'PUT',
      body: JSON.stringify({ ...today, ml: today.glasses * 250 }),
    });
    await load();
    setSaving(false);
  };

  const addGlass = () => {
    setToday(t => ({ ...t, glasses: t.glasses + 1 }));
    setTimeout(() => submit(), 100);
  };

  const progress = today.goal > 0 ? Math.min((today.glasses / today.goal) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Water Intake</h1>
        <p className="text-gray-500 text-sm">Stay hydrated, stay healthy</p>
      </div>

      {/* Progress ring */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 dark:text-gray-700" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 15.5}`} strokeDashoffset={`${2 * Math.PI * 15.5 * (1 - progress / 100)}`}
              className="text-primary-500 transition-all duration-500" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{today.glasses}</span>
            <span className="text-xs text-gray-400">of {today.goal} glasses</span>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <button onClick={addGlass} disabled={saving}
        className="w-full bg-primary-500 text-white py-4 rounded-2xl text-lg font-medium hover:bg-primary-600 transition-all shadow-lg shadow-primary-200 dark:shadow-primary-900/20 disabled:opacity-50 flex items-center justify-center gap-2">
        <span className="text-2xl">💧</span> +1 Glass
      </button>

      <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Daily Goal (glasses)</label>
          <input type="number" min="1" max="20" value={today.goal} onChange={e => setToday({ ...today, goal: parseInt(e.target.value) || 8 })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700">Update Goal</button>
      </form>

      <div>
        <h2 className="font-semibold mb-3">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            const log = logs.find((l: any) => l.date === ds);
            return (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-400 mb-1">{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-medium ${log ? (log.glasses >= log.goal ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400') : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {log?.glasses || '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
