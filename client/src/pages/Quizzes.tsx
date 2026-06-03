import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Quizzes() {
  const [question, setQuestion] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setSelected(null);
    setResult(null);
    try {
      const q = await api('/api/quiz/next');
      setQuestion(q);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const answer = async (idx: number) => {
    if (!question || selected !== null) return;
    setSelected(idx);
    setLoading(true);
    try {
      const res = await api('/api/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({ question_id: question.id, selected_index: idx }),
      });
      setResult(res);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Daily Quiz</h1>
        <p className="text-gray-500 text-sm">Test your knowledge and earn XP</p>
      </div>

      {!question ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm">No questions available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 mb-1">Question</p>
          <h2 className="text-base font-semibold mb-4">{question.question}</h2>

          <div className="space-y-2">
            {question.options.map((opt: string, idx: number) => {
              let bg = 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700';
              if (result) {
                if (idx === result.correct_index) bg = 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400';
                else if (idx === selected) bg = 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
              } else if (idx === selected) {
                bg = 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800';
              }
              return (
                <button key={idx} onClick={() => answer(idx)} disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${bg}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </button>
              );
            })}
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-xl text-sm ${result.is_correct ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'}`}>
              <div className="font-medium mb-1">{result.is_correct ? '✅ Correct! +20 XP' : '❌ Not quite. +5 XP for trying!'}</div>
              <p className="text-xs opacity-80">{result.explanation}</p>
            </div>
          )}

          {result && (
            <button onClick={load} className="mt-4 w-full bg-primary-500 text-white py-2.5 rounded-xl font-medium hover:bg-primary-600">
              Next Question
            </button>
          )}
        </div>
      )}
    </div>
  );
}
