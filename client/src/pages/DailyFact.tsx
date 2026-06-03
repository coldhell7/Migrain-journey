import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function DailyFact() {
  const [fact, setFact] = useState<any>(null);

  useEffect(() => { api('/api/facts/today').then(setFact).catch(() => {}); }, []);

  if (!fact) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">Loading today's fact...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Daily Science Fact</h1>
        <p className="text-gray-500 text-sm">Learn something new every day</p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-3xl p-6 shadow-sm border border-primary-100 dark:border-primary-800">
        <div className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-1">{fact.category}</div>
        <h2 className="text-lg font-bold mb-3">{fact.title}</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{fact.body}</p>
        {fact.source && <p className="text-xs text-gray-400 mt-4">Source: {fact.source}</p>}
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        This educational content is for informational purposes only and does not constitute medical advice.
      </p>
    </div>
  );
}
