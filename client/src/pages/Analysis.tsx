import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analysis() {
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    api('/api/stats').then(setData).catch(() => {});
    api('/api/analysis').then(d => setInsights(d.insights || [])).catch(() => {});
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Loading analysis...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Analysis</h1>
        <p className="text-gray-500 text-sm">Pattern recognition from your logged data</p>
      </div>

      {/* Insights */}
      {insights.map((insight, i) => (
        <div key={i} className={`rounded-2xl p-4 text-sm border ${insight.type === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'}`}>
          <div className="font-medium mb-1">{insight.title}</div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">{insight.body}</p>
        </div>
      ))}

      {/* Sleep chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-sm mb-3">Sleep Hours</h3>
        {data.sleep?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.sleep}>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#4a90a0" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">No sleep data yet</p>}
      </div>

      {/* Water chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-sm mb-3">Water Intake vs Goal</h3>
        {data.water?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.water}>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="glasses" fill="#4a90a0" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">No water data yet</p>}
      </div>

      {/* Weekly attacks */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-sm mb-3">Migraine Attacks per Week</h3>
        {data.weekly?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="avgIntensity" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">No attack data yet</p>}
      </div>

      {/* Trigger breakdown */}
      {data.triggers?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-3">Trigger Breakdown</h3>
          <div className="space-y-2">
            {data.triggers.map((t: any, i: number) => {
              const maxVal = data.triggers[0]?.value || 1;
              const pct = (t.value / maxVal) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{t.name}</span>
                    <span className="text-gray-400">{t.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Medical disclaimer */}
      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        These insights are based on observed patterns in your logged data. Correlation does not imply causation. This is not a medical diagnosis. Please discuss any health concerns with a qualified healthcare professional.
      </p>
    </div>
  );
}
