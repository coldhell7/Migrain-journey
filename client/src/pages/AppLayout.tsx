import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { api } from '../utils/api';
import { getUnlockedSections } from '../utils/xp';

const tabConfig = [
  { path: '/app/chat', icon: '💬', label: 'Chat', section: 'specialist_chat' },
  { path: '/app/analysis', icon: '📊', label: 'Analysis', section: 'analysis' },
  { path: '/app', icon: '🏠', label: 'Home', section: 'dashboard', center: true },
  { path: '/app/calendar', icon: '📅', label: 'Calendar', section: 'calendar' },
  { path: '/app/leaderboard', icon: '🏆', label: 'Leaderboard', section: 'leaderboard' },
];

export default function AppLayout() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState<any>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (user && !user.disclaimer_accepted_at) {
      navigate('/onboarding');
    }
  }, [user]);

  useEffect(() => {
    api('/api/me/progress').then(setProgress).catch(() => {});
  }, [location]);

  useEffect(() => {
    if (progress) {
      const prev = parseInt(localStorage.getItem('lastLevel') || '1');
      if (progress.level > prev) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      localStorage.setItem('lastLevel', String(progress.level));
    }
  }, [progress]);

  if (!user) return null;

  const unlocked = progress ? getUnlockedSections(progress.level) : ['dashboard', 'logging', 'daily_fact', 'specialist_chat', 'settings'];
  const xpProgress = progress ? (progress.xpInLevel / progress.xpToNextLevel) * 100 : 0;

  const isLocked = (section: string) => {
    if (['dashboard', 'logging', 'specialist_chat', 'settings'].includes(section)) return false;
    return !unlocked.includes(section);
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-gray-50 dark:bg-gray-950 relative pb-24">
      {/* Level Up celebration */}
      {showLevelUp && progress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={() => setShowLevelUp(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center animate-bounce-in mx-6 max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-1">Level Up!</h2>
            <p className="text-4xl font-bold text-primary-500 mb-2">Level {progress.level}</p>
            <p className="text-sm text-gray-500">You're making incredible progress!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary-600">Migrain2</span>
            {progress && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="font-medium text-primary-500">Lvl {progress.level}</span>
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-400 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">{dark ? '☀️' : '🌙'}</button>
            <button onClick={() => navigate('/app/settings')} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">⚙️</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4">
        <Outlet context={{ progress, unlocked }} />
      </main>

      {/* Bottom Tab Bar - redesigned */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around h-20 px-2 relative">
          {tabConfig.map(tab => {
            const locked = isLocked(tab.section);
            const isActive = tab.path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(tab.path);
            
            return tab.center ? (
              <NavLink
                key={tab.path}
                to="/app"
                className="relative -mt-4"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30 scale-110' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  <span className="text-2xl">{tab.icon}</span>
                </div>
              </NavLink>
            ) : (
              <NavLink
                key={tab.path}
                to={locked ? '#' : tab.path}
                className={`flex flex-col items-center justify-center gap-0.5 text-xs transition-all duration-200 relative w-14 ${isActive ? 'text-primary-500' : 'text-gray-400'}`}
                onClick={e => { if (locked) e.preventDefault(); }}
              >
                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {locked && <span className="absolute -top-1 -right-1 text-[8px] bg-gray-200 dark:bg-gray-700 rounded px-1">🔒</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
