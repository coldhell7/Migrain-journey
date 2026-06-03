import { useState, useEffect, FormEvent } from 'react';
import { api } from '../utils/api';

const TRIGGER_OPTIONS = ['stress', 'poor sleep', 'dehydration', 'caffeine', 'screen time', 'hormonal', 'weather', 'skipped meal', 'alcohol', 'bright light', 'loud noise', 'strong smell', 'exercise', 'other'];
const SYMPTOM_OPTIONS = ['throbbing pain', 'nausea', 'vomiting', 'sensitivity to light', 'sensitivity to sound', 'aura', 'dizziness', 'blurred vision', 'neck pain', 'fatigue', 'numbness', 'difficulty speaking'];

export default function MigraineTracker() {
  const [attacks, setAttacks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: new Date().toTimeString().slice(0, 5),
    intensity: 5,
    duration_min: 60,
    triggers: [] as string[],
    symptoms: [] as string[],
    medication: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => api('/api/attacks').then(setAttacks).catch(() => {});

  useEffect(() => { load(); }, []);

  const toggleTrigger = (t: string) => {
    setForm(f => ({ ...f, triggers: f.triggers.includes(t) ? f.triggers.filter(x => x !== t) : [...f.triggers, t] }));
  };

  const toggleSymptom = (s: string) => {
    setForm(f => ({ ...f, symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s] }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api(`/api/attacks/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await api('/api/attacks', { method: 'POST', body: JSON.stringify(form) });
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ date: new Date().toISOString().split('T')[0], start_time: new Date().toTimeString().slice(0, 5), intensity: 5, duration_min: 60, triggers: [], symptoms: [], medication: '', notes: '' });
    await load();
  };

  const edit = (a: any) => {
    setForm({ date: a.date, start_time: a.start_time, intensity: a.intensity, duration_min: a.duration_min, triggers: a.triggers || [], symptoms: a.symptoms || [], medication: a.medication || '', notes: a.notes || '' });
    setEditingId(a.id);
    setShowForm(true);
  };

  const remove = async (id: number) => {
    await api(`/api/attacks/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Migraine Attacks</h1>
          <p className="text-gray-500 text-sm">Log and track your attacks</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600">
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Intensity: {form.intensity}</label>
            <input type="range" min="1" max="10" value={form.intensity} onChange={e => setForm({ ...form, intensity: parseInt(e.target.value) })}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-gray-400"><span>1 (Mild)</span><span>10 (Severe)</span></div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Duration (minutes)</label>
            <input type="number" min="0" step="15" value={form.duration_min} onChange={e => setForm({ ...form, duration_min: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Triggers</label>
            <div className="flex flex-wrap gap-1.5">
              {TRIGGER_OPTIONS.map(t => (
                <button key={t} type="button" onClick={() => toggleTrigger(t)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${form.triggers.includes(t) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Symptoms</label>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleSymptom(s)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${form.symptoms.includes(s) ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Medication Taken</label>
            <input type="text" value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" placeholder="e.g. ibuprofen 400mg" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none" />
          </div>

          <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-xl font-medium hover:bg-primary-600">
            {editingId ? 'Update' : 'Log Attack'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {attacks.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">No attacks logged yet. Start tracking to discover your patterns.</p>
          </div>
        )}
        {attacks.map((a: any) => (
          <div key={a.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-medium text-sm">{a.date}</span>
                <span className="text-gray-400 text-xs ml-2">{a.start_time}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${a.intensity <= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : a.intensity <= 6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {a.intensity}/10
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(a)} className="text-xs text-gray-400 hover:text-gray-600">✏️</button>
                <button onClick={() => remove(a.id)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
              </div>
            </div>
            {a.duration_min > 0 && <p className="text-xs text-gray-400 mb-1">Duration: {a.duration_min} min</p>}
            {a.triggers?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {a.triggers.map((t: string) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{t}</span>)}
              </div>
            )}
            {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
