import { useState, useEffect, FormEvent } from 'react';
import { api } from '../../utils/api';

export default function AdminFacts() {
  const [facts, setFacts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '', category: 'migraine', source: '' });

  useEffect(() => { api('/api/admin/facts').then(setFacts).catch(() => {}); }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    await api('/api/admin/facts', { method: 'POST', body: JSON.stringify(form) });
    setForm({ title: '', body: '', category: 'migraine', source: '' });
    const updated = await api('/api/admin/facts');
    setFacts(updated);
  };

  const remove = async (id: number) => {
    await api(`/api/admin/facts/${id}`, { method: 'DELETE' });
    setFacts(facts.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Facts & Quizzes</h1>

      <form onSubmit={add} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
        <h2 className="font-semibold text-sm">Add New Fact</h2>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Title"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={2} placeholder="Body text"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none" />
        <div className="flex gap-3">
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="migraine">Migraine</option>
            <option value="sleep">Sleep</option>
            <option value="hydration">Hydration</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="treatment">Treatment</option>
          </select>
          <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Source"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <button type="submit" className="w-full bg-primary-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-primary-600">Add Fact</button>
      </form>

      <div className="space-y-2">
        {facts.map((f: any) => (
          <div key={f.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{f.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{f.body}</p>
              </div>
              <button onClick={() => remove(f.id)} className="text-gray-400 hover:text-red-500 text-xs ml-2">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
