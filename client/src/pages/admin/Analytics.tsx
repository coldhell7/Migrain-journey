import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4a90a0', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6'];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => { api('/api/admin/analytics').then(setAnalytics).catch(() => {}); }, []);

  if (!analytics) return <p className="text-gray-400 py-10 text-center">Loading analytics...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* User Growth */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">User Growth (30 Days)</h3>
          {analytics.userGrowth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.userGrowth}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4a90a0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </div>

        {/* XP Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">XP Distribution</h3>
          {analytics.xpDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.xpDistribution}>
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </div>

        {/* Attack Intensity Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">Attack Intensity Distribution</h3>
          {analytics.intensityDist?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.intensityDist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={70} label={({ range, count }) => `${range}: ${count}`}>
                  {analytics.intensityDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </div>

        {/* Top Triggers */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">Most Common Triggers</h3>
          {analytics.topTriggers?.length > 0 ? (
            <div className="space-y-2">
              {analytics.topTriggers.map((t: any, i: number) => {
                const maxVal = analytics.topTriggers[0]?.value || 1;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="capitalize">{t.name}</span>
                      <span className="text-gray-400">{t.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(t.value / maxVal) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </div>

        {/* Attacks by Day of Week */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">Attacks by Day of Week</h3>
          {analytics.attacksByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.attacksByDay}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </div>

        {/* Level Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">Level Distribution</h3>
          {analytics.levelDist?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.levelDist}>
                <XAxis dataKey="level" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </div>
      </div>
    </div>
  );
}
