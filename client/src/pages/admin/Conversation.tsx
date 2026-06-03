import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../utils/api';

export default function AdminConversation() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [reply, setReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try { setData(await api(`/api/admin/conversations/${id}`)); } catch {}
  };

  useEffect(() => { load(); const interval = setInterval(load, 5000); return () => clearInterval(interval); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [data?.messages]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await api(`/api/admin/conversations/${id}/reply`, { method: 'POST', body: JSON.stringify({ body: reply }) });
    setReply('');
    await load();
  };

  if (!data) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/admin/conversations" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-xl font-bold">{data.conversation.user_name}</h1>
      </div>

      {/* User context */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 text-xs space-y-1">
        <p className="font-medium text-gray-500 mb-1">Recent Context (read-only)</p>
        {data.userContext?.recentAttacks?.length > 0 && (
          <p>Recent attacks: {data.userContext.recentAttacks.map((a: any) => `${a.date} (${a.intensity}/10)`).join(', ')}</p>
        )}
        {data.userContext?.recentSleep?.length > 0 && (
          <p>Recent sleep: {data.userContext.recentSleep.map((s: any) => `${s.date}: ${s.hours}h`).join(', ')}</p>
        )}
        {data.userContext?.recentWater?.length > 0 && (
          <p>Recent water: {data.userContext.recentWater.map((w: any) => `${w.date}: ${w.glasses}/${w.goal}`).join(', ')}</p>
        )}
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto space-y-3">
        {data.messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender_role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender_role === 'user' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-500 text-white'}`}>
              <p>{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.sender_role === 'user' ? 'text-gray-400' : 'text-white/60'}`}>
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      <form onSubmit={sendReply} className="flex gap-2">
        <input type="text" value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..."
          className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none" />
        <button type="submit" disabled={!reply.trim()}
          className="bg-primary-500 text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-primary-600 disabled:opacity-50">
          Reply
        </button>
      </form>

      <p className="text-[10px] text-gray-400">
        This conversation is between you and the user. Replies are sent immediately.
      </p>
    </div>
  );
}
