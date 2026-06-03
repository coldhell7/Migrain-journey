import { useState, useEffect, FormEvent } from 'react';
import { api } from '../utils/api';

export default function SleepTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [today, setToday] = useState({ date: new Date().toISOString().split('T')[0], hours: 7, quality: 'okay' as string });

  const load = () => api('/api/sleep').then(setLogs).catch(() => {});

  useEffect(() => {
    load();
    const t = new Date().toISOString().split('T')[0];
    api('/api/sleep').then((data: any[]) => {
      setLogs(data);
      const existing = data.find((l: any) => l.date === t);
      if (existing) setToday({ date: t, hours: existing.hours, quality: existing.quality });
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await api('/api/sleep', {
      method: 'PUT',
      body: JSON.stringify(today),
    });
    await load();
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Sleep Log</h1>
        <p className="text-gray-500 text-sm">Track your nightly rest</p>
      </div>

      <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Date</label>
          <input type="date" value={today.date} onChange={e => setToday({ ...today, date: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Hours Slept: {today.hours}h</label>
          <input type="range" min="0" max="14" step="0.5" value={today.hours} onChange={e => setToday({ ...today, hours: parseFloat(e.target.value) })}
            className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0h</span><span>14h</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Quality</label>
          <div className="flex gap-2">
            {['poor', 'okay', 'good'].map(q => (
              <button key={q} type="button" onClick={() => setToday({ ...today, quality: q })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${today.quality === q ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {q === 'poor' ? '😴 Poor' : q === 'okay' ? '😐 Okay' : '😊 Good'}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-xl font-medium hover:bg-primary-600">Save</button>
      </form>

      <div>
        <h2 className="font-semibold mb-3">Recent Logs</h2>
        <div className="space-y-2">
          {logs.slice(0, 7).map((log: any) => (
            <div key={log.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-center justify-between text-sm border border-gray-100 dark:border-gray-800">
              <div>
                <span className="font-medium">{log.date}</span>
                <span className="text-gray-400 ml-2">{log.hours}h</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${log.quality === 'good' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : log.quality === 'okay' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                {log.quality}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
