import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { api('/api/admin/stats').then(setStats).catch(() => {}); }, []);

  if (!stats) return <p className="text-gray-400 py-10 text-center">Loading...</p>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-400 to-blue-500' },
    { label: 'Active Today', value: stats.usersToday, icon: '⚡', color: 'from-emerald-400 to-emerald-500' },
    { label: 'Conversations', value: stats.totalConversations, icon: '💬', color: 'from-violet-400 to-violet-500' },
    { label: 'Messages', value: stats.totalMessages, icon: '✉️', color: 'from-amber-400 to-amber-500' },
    { label: 'Migraines Logged', value: stats.totalAttacks, icon: '🧠', color: 'from-rose-400 to-rose-500' },
    { label: 'Sleep Entries', value: stats.totalSleep, icon: '🌙', color: 'from-indigo-400 to-indigo-500' },
    { label: 'Water Entries', value: stats.totalWater, icon: '💧', color: 'from-cyan-400 to-cyan-500' },
    { label: 'Total XP Earned', value: stats.totalXP.toLocaleString(), icon: '⭐', color: 'from-yellow-400 to-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <span className="text-xs text-gray-400">{new Date().toLocaleString()}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-lg`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity chart + recent registrations */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">Activity (Last 7 Days)</h3>
          {stats.activity?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.activity}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4a90a0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data yet</p>}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">New Registrations (7 Days)</h3>
          {stats.recentRegistrations?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.recentRegistrations}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data yet</p>}
        </div>
      </div>

      {/* Top users + quick links */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Top Users by XP</h3>
            <Link to="/admin/users" className="text-xs text-primary-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {stats.topUsers?.length > 0 ? stats.topUsers.map((u: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-400'}`}>
                    {['🥇', '🥈', '🥉', `#${i + 1}`][i]}
                  </span>
                  <span className="font-medium">{u.display_name}</span>
                </div>
                <div className="text-xs text-gray-400">Lvl {u.level} · {u.xp} XP</div>
              </div>
            )) : <p className="text-xs text-gray-400 py-4 text-center">No users yet</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
          <div className="space-y-2">
            {[
              { to: '/admin/conversations', label: '💬  Inbox — View conversations', sub: `${stats.totalConversations} conversations, ${stats.totalMessages} messages` },
              { to: '/admin/users', label: '👥  Users — Manage accounts', sub: `${stats.totalUsers} regular users` },
              { to: '/admin/facts', label: '📚  Facts — Manage science facts', sub: `${stats.totalFacts} daily fact views` },
              { to: '/admin/gamification', label: '⭐  XP Config — Tune rewards', sub: `${stats.totalQuizzes} quiz attempts` },
              { to: '/admin/analytics', label: '📈  Analytics — Deep dive', sub: 'User growth, triggers, distributions' },
            ].map((l, i) => (
              <Link key={i} to={l.to}
                className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="text-sm font-medium">{l.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{l.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
