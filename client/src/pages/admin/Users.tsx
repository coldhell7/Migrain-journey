import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { api('/api/admin/users').then(setUsers).catch(() => {}); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="space-y-2">
        {users.map((u: any) => (
          <div key={u.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{u.display_name}</span>
                <span className="text-gray-400 ml-2">{u.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' : u.role === 'doctor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {u.role}
                </span>
                <span className="text-xs text-gray-400">Lvl {u.level} · {u.xp} XP</span>
                <span className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
