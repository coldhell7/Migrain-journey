import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ ageRange: '', typicalTriggers: [] as string[], leaderboardOptIn: true });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api('/api/me/settings').then(setSettings).catch(() => {});
  }, []);

  const saveSettings = async () => {
    await api('/api/me/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  };

  const exportData = async () => {
    const data = await api('/api/me/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migrain2-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete all your data.')) return;
    setDeleting(true);
    await api('/api/me/delete-account', { method: 'POST' });
    await logout();
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <h2 className="font-semibold text-sm">Profile</h2>
        <div>
          <label className="block text-xs font-medium mb-1">Display Name</label>
          <p className="text-sm text-gray-500">{user?.display_name}</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Email</label>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Age Range (optional)</label>
          <select value={settings.ageRange} onChange={e => setSettings({ ...settings, ageRange: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" onBlur={saveSettings}>
            <option value="">Prefer not to say</option>
            <option value="under-18">Under 18</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <h2 className="font-semibold text-sm">Privacy</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={settings.leaderboardOptIn} onChange={e => {
            setSettings({ ...settings, leaderboardOptIn: e.target.checked });
            setTimeout(saveSettings, 100);
          }} className="accent-primary-500 w-4 h-4" />
          <span className="text-sm">Show me on the leaderboard</span>
        </label>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
        <h2 className="font-semibold text-sm">Data</h2>
        <button onClick={exportData} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
          📥 Export My Data (JSON)
        </button>
        <button onClick={deleteAccount} disabled={deleting}
          className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50">
          {deleting ? 'Deleting...' : '🗑️ Delete Account & All Data'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
        <h2 className="font-semibold text-sm">Account</h2>
        <button onClick={handleLogout} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
          🚪 Log Out
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Migrain2 v1.0 | Data is stored on your server | No data shared with third parties
      </p>
    </div>
  );
}
