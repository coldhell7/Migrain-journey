import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">Migrain2</h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back' : 'Start your tracking journey'}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
                placeholder="Your name" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
              placeholder="At least 6 characters" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary-500 hover:underline font-medium">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>

          {isLogin && (
            <div className="mt-6">
              <p className="text-xs text-gray-400 text-center mb-3">Quick access for testing</p>
              <div className="flex flex-col gap-2">
                <button onClick={async () => { try { await login('admin@migrain2.app', 'admin123'); navigate('/admin'); } catch {} }}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-base">🔐</span>
                    <span className="font-medium text-violet-700 dark:text-violet-300">Admin Login</span>
                  </span>
                  <span className="text-xs text-gray-400">admin@migrain2.app</span>
                </button>
                <button onClick={async () => { try { await login('doctor@migrain2.app', 'doctor123'); navigate('/admin'); } catch {} }}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-base">🩺</span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">Doctor Login</span>
                  </span>
                  <span className="text-xs text-gray-400">doctor@migrain2.app</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-1">Regular users: sign up above with any email</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
