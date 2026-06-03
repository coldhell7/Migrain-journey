export type Role = 'user' | 'doctor' | 'admin';

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  xp: number;
  level: number;
  leaderboard_opt_in: boolean;
  disclaimer_accepted_at: string | null;
  created_at: string;
}

export interface SleepLog {
  id: number;
  user_id: number;
  date: string;
  hours: number;
  quality: 'poor' | 'okay' | 'good';
  created_at: string;
}

export interface WaterLog {
  id: number;
  user_id: number;
  date: string;
  glasses: number;
  ml: number;
  goal: number;
  created_at: string;
}

export interface MigraineAttack {
  id: number;
  user_id: number;
  date: string;
  start_time: string;
  intensity: number;
  duration_min: number;
  triggers: string[];
  symptoms: string[];
  medication: string;
  notes: string;
  created_at: string;
}

export interface Fact {
  id: number;
  title: string;
  body: string;
  category: string;
  source: string;
}

export interface QuizQuestion {
  id: number;
  fact_id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  question_id: number;
  selected_index: number;
  is_correct: boolean;
  date: string;
}

export interface XPEvent {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  doctor_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: Role;
  body: string;
  read_by_user: boolean;
  read_by_doctor: boolean;
  created_at: string;
}

export interface Insight {
  title: string;
  body: string;
  type: 'positive' | 'warning' | 'info';
  data?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpInLevel: number;
  streak: number;
  unlockedSections: string[];
  lockedSections: { name: string; requiredLevel: number }[];
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  level: number;
  xp: number;
  isCurrentUser: boolean;
}

export const XP_EVENTS = {
  SLEEP_LOG: 'sleep_log',
  WATER_GOAL: 'water_goal',
  WATER_GLASS: 'water_glass',
  MIGRAINE_LOG: 'migraine_log',
  QUIZ_CORRECT: 'quiz_correct',
  QUIZ_ATTEMPT: 'quiz_attempt',
  DAILY_FACT: 'daily_fact',
  STREAK_BONUS: 'streak_bonus',
} as const;

export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 850,
  6: 1300,
};

export function getLevelThreshold(level: number): number {
  if (level <= 6) return LEVEL_THRESHOLDS[level];
  return 1300 + (level - 6) * 500;
}

export const UNLOCK_SECTIONS: Record<number, string[]> = {
  1: ['dashboard', 'logging', 'daily_fact', 'specialist_chat'],
  2: ['quizzes'],
  3: ['analysis'],
  4: ['calendar'],
  5: ['leaderboard'],
};

export const TRIGGER_OPTIONS = [
  'stress', 'poor sleep', 'dehydration', 'caffeine', 'screen time',
  'hormonal', 'weather', 'skipped meal', 'alcohol', 'bright light',
  'loud noise', 'strong smell', 'exercise', 'other'
];

export const SYMPTOM_OPTIONS = [
  'throbbing pain', 'nausea', 'vomiting', 'sensitivity to light',
  'sensitivity to sound', 'aura', 'dizziness', 'blurred vision',
  'neck pain', 'fatigue', 'numbness', 'difficulty speaking'
];
