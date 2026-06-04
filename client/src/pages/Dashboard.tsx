import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function Migrainy({ mood, size = 80 }: { mood: 'happy' | 'excited' | 'neutral' | 'sleepy'; size?: number }) {
  const eyeOffset = size * 0.18;
  const mouthOffset = size * 0.1;
  const p = size / 80;

  const mouth = mood === 'happy' ? (
    <path d={`M${28*p} ${44*p} Q${40*p} ${54*p} ${52*p} ${44*p}`} stroke="#3a9a90" strokeWidth={2.5*p} fill="none" strokeLinecap="round" />
  ) : mood === 'excited' ? (
    <path d={`M${26*p} ${44*p} Q${40*p} ${58*p} ${54*p} ${44*p}`} stroke="#3a9a90" strokeWidth={2.5*p} fill="none" strokeLinecap="round" />
  ) : mood === 'sleepy' ? (
    <path d={`M${30*p} ${46*p} Q${40*p} ${50*p} ${50*p} ${46*p}`} stroke="#3a9a90" strokeWidth={2*p} fill="none" strokeLinecap="round" />
  ) : (
    <path d={`M${30*p} ${44*p} Q${40*p} ${48*p} ${50*p} ${44*p}`} stroke="#3a9a90" strokeWidth={2*p} fill="none" strokeLinecap="round" />
  );

  const blush = mood === 'happy' || mood === 'excited' ? (
    <>
      <ellipse cx={22*p} cy={46*p} rx={5*p} ry={3*p} fill="#f0b4b4" opacity={0.5} />
      <ellipse cx={58*p} cy={46*p} rx={5*p} ry={3*p} fill="#f0b4b4" opacity={0.5} />
    </>
  ) : null;

  const eyes = mood === 'sleepy' ? (
    <>
      <line x1={24*p} y1={36*p} x2={32*p} y2={36*p} stroke="#2d7e76" strokeWidth={2.5*p} strokeLinecap="round" />
      <line x1={48*p} y1={36*p} x2={56*p} y2={36*p} stroke="#2d7e76" strokeWidth={2.5*p} strokeLinecap="round" />
    </>
  ) : (
    <>
      <circle cx={28*p} cy={36*p} r={4.5*p} fill="#2d7e76" />
      <circle cx={52*p} cy={36*p} r={4.5*p} fill="#2d7e76" />
      <circle cx={30*p} cy={34*p} r={1.5*p} fill="white" />
      <circle cx={54*p} cy={34*p} r={1.5*p} fill="white" />
    </>
  );

  const blink = mood === 'excited' ? (
    <>
      <line x1={23*p} y1={32*p} x2={33*p} y2={28*p} stroke="#2d7e76" strokeWidth={1.5*p} strokeLinecap="round" opacity={0.4} />
      <line x1={47*p} y1={28*p} x2={57*p} y2={32*p} stroke="#2d7e76" strokeWidth={1.5*p} strokeLinecap="round" opacity={0.4} />
    </>
  ) : null;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx={40*p} cy={72*p} rx={22*p} ry={4*p} fill="black" opacity={0.06} />
      {/* Brain body */}
      <path d={`M40 ${8*p}
        C22 ${8*p} 8 ${20*p} 8 ${36*p}
        C8 ${44*p} 11 ${51*p} 16 ${56*p}
        C14 ${60*p} 14 ${64*p} 18 ${66*p}
        C22 ${68*p} 26 ${66*p} 28 ${62*p}
        C30 ${64*p} 34 ${66*p} 40 ${66*p}
        C46 ${66*p} 50 ${64*p} 52 ${62*p}
        C54 ${66*p} 58 ${68*p} 62 ${66*p}
        C66 ${64*p} 66 ${60*p} 64 ${56*p}
        C69 ${51*p} 72 ${44*p} 72 ${36*p}
        C72 ${20*p} 58 ${8*p} 40 ${8*p}Z`}
        fill="url(#brainGrad)" />
      {/* Brain wrinkles */}
      <path d={`M16 ${32*p} Q22 ${28*p} 28 ${32*p}`} stroke="#b3e1db" strokeWidth={1.5*p} fill="none" opacity={0.5} />
      <path d={`M52 ${32*p} Q58 ${28*p} 64 ${32*p}`} stroke="#b3e1db" strokeWidth={1.5*p} fill="none" opacity={0.5} />
      <path d={`M22 ${24*p} Q30 ${20*p} 38 ${24*p}`} stroke="#b3e1db" strokeWidth={1.5*p} fill="none" opacity={0.4} />
      <path d={`M42 ${24*p} Q50 ${20*p} 58 ${24*p}`} stroke="#b3e1db" strokeWidth={1.5*p} fill="none" opacity={0.4} />
      {/* Eyes */}
      {eyes}
      {blink}
      {/* Blush */}
      {blush}
      {/* Mouth */}
      {mouth}
      {/* Gradient */}
      <defs>
        <linearGradient id="brainGrad" x1="40" y1="8" x2="40" y2="68">
          <stop stopColor="#e0f2ef" />
          <stop offset="1" stopColor="#b3e1db" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [fact, setFact] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [waterSpots, setWaterSpots] = useState<number>(0);
  const [animatingWater, setAnimatingWater] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; emoji: string }>({ show: false, msg: '', emoji: '' });
  const [greetingDismissed, setGreetingDismissed] = useState(false);
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
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const streak = stats?.streak || 0;

  const mood = streak >= 7 ? 'excited' : streak >= 3 ? 'happy' : streak > 0 ? 'neutral' : 'sleepy';

  return (
    <div className="space-y-5 pb-6 relative">
      {/* Toast notification */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-2 text-sm font-medium">
          <span>{toast.emoji}</span> {toast.msg}
        </div>
      )}

      {/* Greeting Card with Character */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-gray-900 dark:via-primary-900/5 dark:to-gray-900 rounded-3xl p-5 shadow-sm border border-primary-100/30 dark:border-primary-800/20">
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-primary-200/20 dark:bg-primary-400/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center transition-all duration-500 ${mood === 'excited' ? 'animate-bounce-in' : ''}`}>
              <Migrainy mood={mood} />
            </div>
            {streak >= 7 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-[10px] shadow-lg animate-bounce-in">⭐</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight">{greeting}!</h1>
            <p className="text-gray-400 text-xs">{dateStr}</p>
            {stats && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-full">
                  Level {stats.level}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  🔥 {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XP Card — glassmorphism premium */}
      {stats && (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-5 shadow-lg">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.15em]">Total XP</div>
              <div className="text-3xl font-bold tracking-tight text-white">
                {stats.xp.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">XP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all duration-700" style={{ width: `${(stats.xpInLevel / stats.xpToNextLevel) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">{stats.xpInLevel} / {stats.xpToNextLevel}</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-3xl">🏆</span>
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
