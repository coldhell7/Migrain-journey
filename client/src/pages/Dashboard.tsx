import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [fact, setFact] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [waterSpots, setWaterSpots] = useState<number>(0);
  const [animatingWater, setAnimatingWater] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; emoji: string }>({ show: false, msg: '', emoji: '' });
  const navigate = useNavigate();

  const showToast = (emoji: string, msg: string) => {
    setToast({ show: true, msg, emoji });
    setTimeout(() => setToast({ show: false, msg: '', emoji: '' }), 2000);
  };

  useEffect(() => {
    api('/api/me/progress').then(setStats).catch(() => {});
    api('/api/facts/today').then(setFact).catch(() => {});
    api('/api/analysis').then(d => {
      if (d.insights?.length > 0) setInsight(d.insights[0]);
    }).catch(() => {});
  }, []);

  const addWater = useCallback(async () => {
    setAnimatingWater(true);
    setWaterSpots(s => s + 1);
    const today = new Date().toISOString().split('T')[0];
    try {
      const existing = await api<any[]>('/api/water');
      const todayLog = existing.find((l: any) => l.date === today);
      const prevGlasses = todayLog?.glasses || 0;
      await api('/api/water', {
        method: 'PUT',
        body: JSON.stringify({ date: today, glasses: prevGlasses + 1, ml: (prevGlasses + 1) * 250, goal: todayLog?.goal || 8 }),
      });
      setTimeout(() => { setAnimatingWater(false); }, 600);
      showToast('💧', 'Water logged! +1 glass');
    } catch {
      setAnimatingWater(false);
    }
  }, []);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5 pb-6 relative">
      {/* Toast notification */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-2 text-sm font-medium">
          <span>{toast.emoji}</span> {toast.msg}
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">{greeting}!</h1>
          <p className="text-gray-400 text-xs">{dateStr}</p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-primary-500">{stats?.level || 1}</span>
            <span className="text-xs text-gray-400 font-medium">LVL</span>
          </div>
          <div className="h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1 ml-auto">
            <div className="h-full bg-primary-400 rounded-full transition-all duration-700" style={{ width: stats ? `${(stats.xpInLevel / stats.xpToNextLevel) * 100}%` : '0%' }} />
          </div>
        </div>
      </div>

      {/* XP + Streak Card — glassmorphism */}
      {stats && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50/40 to-white dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-900 rounded-3xl p-6 shadow-sm border border-primary-100/50 dark:border-primary-800/30">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-200/20 dark:bg-primary-400/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-200/20 dark:bg-accent-400/5 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total XP</div>
              <div className="text-3xl font-bold tracking-tight">
                {stats.xp.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">XP</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-400 rounded-full transition-all duration-700" style={{ width: `${(stats.xpInLevel / stats.xpToNextLevel) * 100}%` }} />
                </div>
                <span>{stats.xpInLevel} / {stats.xpToNextLevel}</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-lg">🔥</span>
                <span className="text-2xl font-bold">{stats.streak}</span>
              </div>
              <div className="text-xs text-gray-400">day streak</div>
              <div className="text-[10px] text-gray-400">Level {stats.level} · {stats.unlockedSections?.length || 0} features</div>
            </div>
          </div>
        </div>
      )}

      {/* Track Cards — Sleep, Water, Attacks */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate('/app/sleep')}
          className="group relative bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl p-4 text-white overflow-hidden hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🌙</div>
          <div className="text-sm font-medium opacity-90">Sleep</div>
          <div className="text-[10px] opacity-60 mt-0.5">Tap to log</div>
        </button>

        <button onClick={addWater} disabled={animatingWater}
          className="group relative bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white overflow-hidden hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-80">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
          <div className={`text-2xl mb-2 transition-all duration-300 ${animatingWater ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>
            {animatingWater ? '💦' : '💧'}
          </div>
          <div className="text-sm font-medium opacity-90">Water</div>
          <div className="text-[10px] opacity-60 mt-0.5">+1 glass</div>
          {animatingWater && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 animate-ping" />
            </div>
          )}
        </button>

        <button onClick={() => navigate('/app/attacks')}
          className="group relative bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl p-4 text-white overflow-hidden hover:shadow-lg hover:shadow-rose-200/50 dark:hover:shadow-rose-900/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🧠</div>
          <div className="text-sm font-medium opacity-90">Migraine</div>
          <div className="text-[10px] opacity-60 mt-0.5">Tap to log</div>
        </button>
      </div>

      {/* Daily Fact — calm card */}
      {fact && (
        <div onClick={() => navigate('/app/fact')}
          className="group relative bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200">
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary-100/50 to-transparent dark:from-primary-900/10 rounded-bl-full" />
          <div className="relative flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              📖
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-[0.15em]">Daily Science Fact</span>
              <h3 className="text-sm font-semibold mt-0.5 line-clamp-1">{fact.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">{fact.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* Insight */}
      {insight && (
        <div className={`rounded-3xl p-5 border ${insight.type === 'positive'
          ? 'bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-gray-900 border-emerald-100 dark:border-emerald-800/50'
          : insight.type === 'warning'
          ? 'bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-900/10 dark:to-gray-900 border-amber-100 dark:border-amber-800/50'
          : 'bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-900/10 dark:to-gray-900 border-blue-100 dark:border-blue-800/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{insight.type === 'positive' ? '✨' : insight.type === 'warning' ? '💡' : '📌'}</span>
            <span className="font-semibold text-sm">{insight.title}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{insight.body}</p>
        </div>
      )}

      {/* Quick Actions Row — rounded pill buttons */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-0.5">Quick Actions</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {[
            { label: 'Sleep', icon: '🌙', action: () => navigate('/app/sleep') },
            { label: 'Log Water', icon: '💧', action: addWater },
            { label: 'Attack', icon: '🧠', action: () => navigate('/app/attacks') },
            { label: 'Quiz', icon: '📝', action: () => navigate('/app/quizzes') },
            { label: 'Fact', icon: '📖', action: () => navigate('/app/fact') },
            { label: 'Chat', icon: '💬', action: () => navigate('/app/chat') },
          ].map((a, i) => (
            <button key={i} onClick={a.action}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm shrink-0">
              <span className="text-base">{a.icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Medical disclaimer */}
      <p className="text-[9px] text-gray-300 dark:text-gray-600 text-center leading-relaxed px-4 pt-2">
        This app is for personal tracking and educational purposes only. Not a substitute for professional medical advice. In an emergency, contact your local emergency services.
      </p>
    </div>
  );
}
