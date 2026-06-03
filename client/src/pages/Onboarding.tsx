import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

const slides = [
  { title: 'Welcome to Migrain2', desc: 'A calming, private space to track your migraine patterns and discover what helps.', icon: '🧠' },
  { title: 'Track Everything', desc: 'Log your sleep, water, and migraine attacks daily. The more you track, the more insights you unlock.', icon: '📝' },
  { title: 'Earn XP & Level Up', desc: 'Stay consistent, learn science facts, take quizzes — earn XP and unlock new features along the way.', icon: '⭐' },
  { title: 'Your Health Comes First', desc: 'This app is a tracking and educational tool. It does not replace professional medical advice.', icon: '🛡️' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const accept = async () => {
    try {
      await api('/api/me/disclaimer', { method: 'POST' });
      await refreshUser();
      navigate('/app');
    } catch { navigate('/app'); }
  };

  const s = slides[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6 animate-bounce-in">{s.icon}</div>
        <h1 className="text-2xl font-bold mb-3">{s.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{s.desc}</p>

        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-8 bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
          ))}
        </div>

        {step < slides.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="bg-primary-500 text-white px-8 py-3 rounded-2xl font-medium hover:bg-primary-600 transition-colors w-full">
            Next
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
              <strong>Medical Disclaimer:</strong> This app is for personal tracking and educational purposes only. It does not provide medical diagnosis or treatment and is not a substitute for professional medical advice. In an emergency, contact your local emergency services immediately.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">By tapping "I Understand & Continue", you acknowledge this disclaimer.</p>
            <button onClick={accept} className="bg-primary-500 text-white px-8 py-3 rounded-2xl font-medium hover:bg-primary-600 transition-colors w-full">
              I Understand & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
