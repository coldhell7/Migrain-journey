import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { initDB } from './db';
import authRoutes from './routes/auth';
import trackingRoutes from './routes/tracking';
import factsRoutes from './routes/facts';
import quizRoutes from './routes/quiz';
import progressRoutes from './routes/progress';
import statsRoutes from './routes/stats';
import leaderboardRoutes from './routes/leaderboard';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import userSettingsRoutes from './routes/userSettings';
import analysisRoutes from './routes/analysis';
import db from './db';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Initialize database
initDB();

// Seed on first run
const factsCount = db.prepare('SELECT COUNT(*) as count FROM facts').get() as any;
if (factsCount.count === 0) {
  require('./seed/index');
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', trackingRoutes);
app.use('/api/facts', factsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/me/progress', progressRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', userSettingsRoutes);
app.use('/api/analysis', analysisRoutes);

// Serve static files
const clientDist = config.clientDist;
app.use(express.static(clientDist));

// SPA fallback for /app and /admin routes
app.get(['/app/*', '/admin/*'], (req, res) => {
  // Determine which SPA to serve
  if (req.path.startsWith('/admin')) {
    res.sendFile(path.join(clientDist, 'admin/index.html'));
  } else {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(config.port, () => {
  console.log(`Migrain2 server running on http://localhost:${config.port}`);
});
