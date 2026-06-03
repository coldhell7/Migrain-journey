import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/conversations', label: 'Inbox', icon: '💬' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/facts', label: 'Facts', icon: '📚' },
    { path: '/admin/gamification', label: 'XP Config', icon: '⭐' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-primary-600">Admin Panel</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 uppercase">{user?.role}</span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/app" className="text-xs text-gray-400 hover:text-gray-600">← Back to App</NavLink>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        <nav className="w-48 shrink-0 p-4 space-y-1 hidden md:block">
          {tabs.map(tab => (
            <NavLink key={tab.path} to={tab.path} end={tab.path === '/admin'}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
        {/* Mobile tabs */}
        <div className="md:hidden w-full overflow-x-auto px-4 pt-3 pb-1">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <NavLink key={tab.path} to={tab.path} end={tab.path === '/admin'}
                className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-xl text-xs ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-500'}`}>
                {tab.icon} {tab.label}
              </NavLink>
            ))}
          </div>
        </div>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
