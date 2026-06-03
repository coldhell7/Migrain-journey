import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

export default function SpecialistChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [convId, setConvId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await api('/api/chat/messages');
      setConvId(data.conversation_id);
      setMessages(data.messages);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    await api('/api/chat/messages', { method: 'POST', body: JSON.stringify({ body }) });
    setBody('');
    await load();
  };

  return (
    <div className="space-y-4 pb-8 flex flex-col h-[calc(100vh-12rem)]">
      <div>
        <h1 className="text-2xl font-bold">Chat with Specialist</h1>
        <p className="text-gray-500 text-xs">Non-emergency communication with your care team</p>
      </div>

      {/* Emergency banner */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl p-3 text-xs text-red-700 dark:text-red-400">
        ⚠️ This is NOT for emergencies. If you are experiencing a medical emergency, call your local emergency services immediately. Replies from specialists may take time and are not a substitute for in-person medical care.
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-sm">Send a message to start the conversation.</p>
          </div>
        )}
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender_role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
              <p className="leading-relaxed">{m.body}</p>
              <p className={`text-[10px] mt-1 opacity-60 ${m.sender_role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date(m.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                {m.sender_role !== 'user' && <span className="ml-1">· {m.sender_role === 'doctor' ? 'Doctor' : 'Admin'}</span>}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2">
        <input type="text" value={body} onChange={e => setBody(e.target.value)} placeholder="Type your message..."
          className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-300 outline-none" maxLength={2000} />
        <button type="submit" disabled={!body.trim()}
          className="bg-primary-500 text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
          Send
        </button>
      </form>
    </div>
  );
}
