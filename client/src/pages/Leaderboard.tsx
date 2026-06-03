import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Leaderboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { api('/api/leaderboard').then(setData).catch(() => {}); }, []);

  if (!data) return <p className="text-gray-400 text-center py-20">Loading...</p>;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-gray-500 text-sm">See how you rank among other trackers</p>
      </div>

      {data.currentUserRank && (
        <div className="bg-gradient-to-r from-amber-50 to-primary-50 dark:from-amber-900/10 dark:to-primary-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
          <span className="text-sm text-gray-500">Your Rank: </span>
          <span className="text-lg font-bold text-primary-500">#{data.currentUserRank}</span>
        </div>
      )}

      <div className="space-y-2">
        {data.leaderboard.map((entry: any) => (
          <div key={entry.rank} className={`bg-white dark:bg-gray-900 rounded-xl p-4 border text-sm ${entry.isCurrentUser ? 'border-primary-300 dark:border-primary-700 ring-1 ring-primary-200 dark:ring-primary-800' : 'border-gray-100 dark:border-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${entry.rank <= 3 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div>
                  <span className="font-medium">{entry.display_name}{entry.isCurrentUser ? ' (you)' : ''}</span>
                  <span className="text-gray-400 text-xs ml-2">Lvl {entry.level}</span>
                </div>
              </div>
              <span className="font-bold text-primary-500">{entry.xp.toLocaleString()} XP</span>
            </div>
          </div>
        ))}
      </div>

      {data.leaderboard.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-sm">No participants yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
