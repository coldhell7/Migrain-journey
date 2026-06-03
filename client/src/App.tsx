import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import AppLayout from './pages/AppLayout';
import Dashboard from './pages/Dashboard';
import SleepTracker from './pages/SleepTracker';
import WaterTracker from './pages/WaterTracker';
import MigraineTracker from './pages/MigraineTracker';
import DailyFact from './pages/DailyFact';
import Quizzes from './pages/Quizzes';
import Analysis from './pages/Analysis';
import Calendar from './pages/Calendar';
import Leaderboard from './pages/Leaderboard';
import SpecialistChat from './pages/SpecialistChat';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import AuthPage from './pages/AuthPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminConversations from './pages/admin/Conversations';
import AdminConversation from './pages/admin/Conversation';
import AdminUsers from './pages/admin/Users';
import AdminFacts from './pages/admin/Facts';
import AdminGamification from './pages/admin/Gamification';
import AdminAnalytics from './pages/admin/Analytics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-pulse-soft text-primary-500 text-lg">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-pulse-soft text-primary-500 text-lg">Loading...</div></div>;
  if (!user || (user.role !== 'doctor' && user.role !== 'admin')) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="sleep" element={<SleepTracker />} />
        <Route path="water" element={<WaterTracker />} />
        <Route path="attacks" element={<MigraineTracker />} />
        <Route path="fact" element={<DailyFact />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="chat" element={<SpecialistChat />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="conversations" element={<AdminConversations />} />
        <Route path="conversations/:id" element={<AdminConversation />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="facts" element={<AdminFacts />} />
        <Route path="gamification" element={<AdminGamification />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}
