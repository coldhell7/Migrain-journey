import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function AdminConversations() {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    api('/api/admin/conversations').then(setConversations).catch(() => {});
    const interval = setInterval(() => {
      api('/api/admin/conversations').then(setConversations).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inbox</h1>

      {conversations.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">No conversations yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {conversations.map((c: any) => (
          <Link key={c.id} to={`/admin/conversations/${c.id}`}
            className="block bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{c.user_name}</span>
                  {c.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{c.unread_count}</span>
                  )}
                </div>
                {c.last_message && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{c.last_message}</p>}
              </div>
              <span className="text-[10px] text-gray-400">{new Date(c.updated_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
