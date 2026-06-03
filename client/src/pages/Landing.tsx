import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function Landing() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary-500">Mig</span>rain<span className="text-primary-500">2</span>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
              {dark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2">Log in</Link>
            <Link to="/login" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───── Hero ───── */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-32">
          {/* Bg decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 dark:bg-primary-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/30 dark:bg-accent-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary-100/40 to-transparent dark:from-primary-900/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 rounded-full text-sm font-medium mb-8 animate-fade-in border border-primary-100 dark:border-primary-800">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
              Understand your migraine patterns
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
              Track smarter.
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                Feel better.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A calming, gamified migraine tracker that uncovers your patterns, 
              teaches you daily science, and keeps you motivated — 
              <span className="text-gray-700 dark:text-gray-200 font-medium"> all while keeping your data yours.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login"
                className="group relative bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-full text-lg font-semibold overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                <span className="relative z-10">Open the App</span>
              </Link>
              <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <span className="text-base">📱</span> No download needed — install as PWA
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-400">
              <span className="flex items-center gap-1">🔒 HIPAA-ready privacy</span>
              <span className="flex items-center gap-1">🧠 Science-based</span>
              <span className="flex items-center gap-1">⚡ No AI black boxes</span>
              <span className="flex items-center gap-1">💬 Real specialist chat</span>
            </div>
          </div>
        </section>

        {/* ───── Features ───── */}
        <section className="relative py-32 px-6">
          <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50 -skew-y-3" />
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold text-primary-500 uppercase tracking-[0.2em]">Features</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">Everything you need</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Six thoughtfully designed tools that work together to give you a complete picture of your health.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Sleep & Hydration', desc: 'Track nightly sleep and daily water with elegant controls. Build habits that reduce attack frequency.', icon: '🌙', gradient: 'from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10' },
                { title: 'Migraine Logger', desc: 'Log attacks with triggers, symptoms, and intensity. Discover patterns you never noticed.', icon: '🧠', gradient: 'from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10' },
                { title: 'Daily Science Facts', desc: 'One curated neuroscience fact per day. Take quizzes, earn XP, and become your own best advocate.', icon: '📚', gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10' },
                { title: 'Gamified Motivation', desc: 'XP, levels, streaks, and progressive unlocks. Positive reinforcement that keeps you consistent.', icon: '⭐', gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10' },
                { title: 'Pattern Analysis', desc: 'Rule-based insights about your triggers, sleep connections, and trends — transparent and deterministic.', icon: '📊', gradient: 'from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10' },
                { title: 'Specialist Chat', desc: 'Message a real human professional who can review your logs and provide guidance (non-emergency).', icon: '💬', gradient: 'from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10' },
              ].map((f, i) => (
                <div key={i}
                  className={`group relative bg-gradient-to-br ${f.gradient} rounded-3xl p-7 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── How it works ───── */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold text-primary-500 uppercase tracking-[0.2em]">How it works</span>
              <h2 className="text-4xl sm:text-5xl font-bold mt-3">Three simple steps</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Track daily', desc: 'Log your sleep, water, and migraine attacks. Takes 30 seconds.', icon: '📝' },
                { step: '02', title: 'Discover patterns', desc: 'Our rule engine highlights connections — like sleep quality affecting attack frequency.', icon: '🔍' },
                { step: '03', title: 'Stay consistent', desc: 'Earn XP, level up, and unlock deeper insights as you build your tracking habit.', icon: '🚀' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center mx-auto mb-5 text-lg font-bold">{s.icon}</div>
                  <div className="text-xs font-semibold text-primary-500 tracking-wider mb-1">{s.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── CTA ───── */}
        <section className="relative py-32 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-600 dark:from-primary-600 dark:to-accent-700" />
          <div className="relative max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to take control?</h2>
            <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto">Join thousands of people who track smarter and feel better — all from your phone, completely free.</p>
            <Link to="/login"
              className="inline-block bg-white text-gray-900 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
              Start Tracking Free
            </Link>
            <p className="text-sm opacity-70 mt-4">No credit card. No AI. Just your data, your way.</p>
          </div>
        </section>

        {/* ───── Privacy + Disclaimer ───── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-10">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="text-lg">🔒</span> Your data stays yours</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                No third-party analytics. No AI API calls. No data sold. Your health information stays on your server. Export or delete at any time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="text-lg">⚕️</span> Medical Disclaimer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                This app is for personal tracking and educational purposes only. It does not provide medical diagnosis or treatment and is not a substitute for professional medical advice. In an emergency, contact your local emergency services immediately.
              </p>
            </div>
          </div>
        </section>

        {/* ───── Footer ───── */}
        <footer className="py-10 px-6 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-400">© 2026 Migrain2. All rights reserved.</span>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Log In</Link>
              <Link to="/app" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">App</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
