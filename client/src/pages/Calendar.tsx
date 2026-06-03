import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Calendar() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [days, setDays] = useState<Record<string, any>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    api(`/api/stats/calendar?month=${month}`).then(d => setDays(d.days || {})).catch(() => {});
  }, [month]);

  const [year, m] = month.split('-').map(Number);
  const firstDay = new Date(year, m - 1, 1).getDay();
  const daysInMonth = new Date(year, m, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }

  const getDateStr = (d: number) => `${month}-${String(d).padStart(2, '0')}`;
  const getIntensityColor = (day: any) => {
    if (!day?.attacks) return '';
    const i = day.attacks.intensity;
    if (i <= 3) return 'bg-green-200 dark:bg-green-800';
    if (i <= 6) return 'bg-amber-200 dark:bg-amber-800';
    return 'bg-red-200 dark:bg-red-800';
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attack Calendar</h1>
        <div className="flex gap-2">
          <button onClick={() => {
            const d = new Date(month + '-01');
            d.setMonth(d.getMonth() - 1);
            setMonth(d.toISOString().slice(0, 7));
            setSelectedDay(null);
          }} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <span className="font-medium text-sm">{new Date(month + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => {
            const d = new Date(month + '-01');
            d.setMonth(d.getMonth() + 1);
            setMonth(d.toISOString().slice(0, 7));
            setSelectedDay(null);
          }} className="text-gray-400 hover:text-gray-600 text-lg">→</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>
        {weeks.map((w, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {w.map((d, di) => {
              const ds = d ? getDateStr(d) : '';
              const day = days[ds];
              return (
                <button key={di} onClick={() => d && setSelectedDay(ds)}
                  className={`aspect-square rounded-xl text-xs flex items-center justify-center relative ${!d ? '' : day ? `${getIntensityColor(day)} cursor-pointer` : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'} ${selectedDay === ds ? 'ring-2 ring-primary-500' : ''}`}>
                  {d && <span className={day ? 'font-medium' : ''}>{d}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDay && days[selectedDay] && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <h3 className="font-semibold">{selectedDay}</h3>
          {days[selectedDay].attacks && (
            <div className="text-sm">
              <span className="text-gray-400">Attacks:</span> {days[selectedDay].attacks.count} (intensity: {days[selectedDay].attacks.intensity}/10)
            </div>
          )}
          {days[selectedDay].sleep && (
            <div className="text-sm">
              <span className="text-gray-400">Sleep:</span> {days[selectedDay].sleep.hours}h ({days[selectedDay].sleep.quality})
            </div>
          )}
          {days[selectedDay].water && (
            <div className="text-sm">
              <span className="text-gray-400">Water:</span> {days[selectedDay].water.glasses}/{days[selectedDay].water.goal} glasses
            </div>
          )}
        </div>
      )}
    </div>
  );
}
