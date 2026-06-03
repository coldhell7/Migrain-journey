# Migrain Journey — Gamified Migraine Tracker PWA

A complete, lightweight gamified migraine tracking web app with a landing page, installable PWA, rule-based analytics, and a doctor/admin panel — all running off a single Node.js process with SQLite.

> **Note:** This repository was migrated from the internal project name `migrain2`.

## Medical Disclaimer

**This app is for personal tracking and educational purposes only.** It does not provide medical diagnosis or treatment and is not a substitute for professional medical advice. Always consult a qualified healthcare provider about any health concerns. In an emergency, contact your local emergency services immediately.

All insights and patterns shown in the app are based on observed correlations in your logged data. Correlation does not imply causation. Never make changes to your medication or treatment without consulting a doctor.

## Quick Start

```bash
# Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Build for production
npm run build

# Start the server (serves API + static frontend)
npm start
```

Open http://localhost:3001 to see the landing page.

### Default Accounts (first run)

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@migrain2.app  | admin123   |
| Doctor | doctor@migrain2.app | doctor123  |

These are created automatically on first run and can be changed via environment variables or the `.env` file.

## Development

```bash
npm run dev
```

This starts both the Vite dev server (with HMR) at http://localhost:5173 and the Express API server at http://localhost:3001. The Vite dev server proxies `/api` requests to the Express server.

## Architecture

```
├── client/          # React + Vite + Tailwind + PWA (installable SPA)
│   └── src/
│       ├── pages/       # All route pages including admin panel
│       ├── hooks/       # Auth context, theme
│       └── utils/       # API client, XP utilities
├── server/          # Express + SQLite API server
│   └── src/
│       ├── routes/      # REST API routes (auth, tracking, admin, etc.)
│       ├── middleware/  # Auth JWT middleware
│       ├── services/    # XP engine, streak, analysis engine
│       ├── db/          # SQLite setup + schema init
│       └── seed/        # 43 facts + 33 quizzes + default accounts
└── shared/          # Shared TypeScript types
```

### Key Design Decisions

- **Single process deployment:** The Express server serves the built frontend statically. Deploy as one unit.
- **SQLite via better-sqlite3:** No separate database server. Database is a single file (`data.db`).
- **JWT in httpOnly cookie:** Session auth stored securely (not accessible to JS).
- **REST + short polling for chat:** Keeps the server simple. No WebSocket infrastructure needed.
- **Rule-based analysis:** No external AI APIs. All "AI" insights are deterministic pattern-matching in `server/src/services/analysis.ts`.
- **PWA:** Service worker caches app shell. The app is installable on Android and iOS home screens.

## Environment Variables

Copy `.env.example` to `.env` and customize:

| Variable          | Default                 | Description                  |
|-------------------|-------------------------|------------------------------|
| `PORT`            | `3001`                  | Server port                  |
| `JWT_SECRET`      | `dev-secret...`         | JWT signing secret (change!) |
| `DB_PATH`         | `./data.db`             | SQLite database file path    |
| `ADMIN_EMAIL`     | `admin@migrain2.app`    | Default admin email          |
| `ADMIN_PASSWORD`  | `admin123`              | Default admin password       |
| `DOCTOR_EMAIL`    | `doctor@migrain2.app`   | Default doctor email         |
| `DOCTOR_PASSWORD` | `doctor123`             | Default doctor password      |

## API Endpoints

### Auth
- `POST /api/auth/signup` — Create account (email, password, display_name)
- `POST /api/auth/login` — Log in
- `POST /api/auth/logout` — Log out
- `GET /api/auth/me` — Get current user

### Tracking
- `GET /api/sleep` / `PUT /api/sleep` — Sleep logs
- `GET /api/water` / `PUT /api/water` — Water logs
- `GET /api/attacks` / `POST /api/attacks` — Migraine attacks
- `PUT /api/attacks/:id` / `DELETE /api/attacks/:id` — Edit/delete attacks

### Engagement
- `GET /api/facts/today` — Daily science fact
- `GET /api/quiz/next` — Next quiz question
- `POST /api/quiz/answer` — Submit quiz answer
- `GET /api/me/progress` — XP, level, unlocked sections, streak
- `GET /api/analysis` — Rule-based insights
- `GET /api/stats` — Chart data (sleep/water/attacks/triggers)
- `GET /api/stats/calendar?month=YYYY-MM` — Calendar data
- `GET /api/leaderboard` — Ranked users

### Chat
- `GET /api/chat/messages` — Get messages + create conversation
- `POST /api/chat/messages` — Send message

### Settings
- `GET /api/me/settings` / `POST /api/me/settings` — User settings
- `POST /api/me/disclaimer` — Accept medical disclaimer
- `GET /api/me/export` — Export all user data
- `POST /api/me/delete-account` — Delete account

### Admin (requires `doctor` or `admin` role)
- `GET /api/admin/conversations` — All conversations with unread counts
- `GET /api/admin/conversations/:id` — Conversation detail + user context
- `POST /api/admin/conversations/:id/reply` — Reply as doctor/admin
- `GET /api/admin/users` — List all users
- `GET /api/admin/facts` / `POST /api/admin/facts` — Manage facts
- `DELETE /api/admin/facts/:id` — Delete fact

## Gamification

### XP Awards
| Action                        | XP    |
|-------------------------------|-------|
| Log sleep for a day           | +10   |
| Reach daily water goal        | +15   |
| Per glass logged              | +2    |
| Log a migraine attack         | +15   |
| Correct quiz answer           | +20   |
| Wrong quiz answer (attempt)   | +5    |
| View daily fact               | +5    |
| Daily streak bonus            | +5×streak day (cap 50) |

### Level Thresholds
| Level | XP Required |
|-------|-------------|
| 1     | 0           |
| 2     | 100         |
| 3     | 250         |
| 4     | 500         |
| 5     | 850         |
| 6     | 1300        |
| 7+    | 1300 + (level-6)×500 |

### Progressive Unlocking
- **Level 1:** Dashboard, Logging, Daily Fact, Specialist Chat
- **Level 2:** Quizzes
- **Level 3:** Analysis & Charts
- **Level 4:** Attack Calendar
- **Level 5:** Leaderboard

> Health safety: Specialist Chat and emergency info are NEVER locked behind levels.

## Deployment

### Simple VPS

```bash
# On your server
git clone <repo> && cd migrain2
cd server && npm install && cd ../client && npm install && cd ..
npm run build

# Set env vars
export JWT_SECRET="your-random-secret-here"
export PORT=3001

# Start (use a process manager like pm2)
npm start
```

### PaaS (Render / Railway / Fly)

1. Set build command: `npm run build`
2. Set start command: `npm start`
3. Add environment variables via the platform dashboard
4. Make sure the platform installs dependencies for both `client/` and `server/` (or use a pre-build script)

### HTTPS

For production, put a reverse proxy (Caddy, Nginx) in front of the Node server. The app is HTTPS-ready; no HTTP-specific logic in the codebase has production dependencies.

## PWA Installation

### Android
1. Open the app in Chrome
2. Tap the install prompt (or menu → "Add to Home Screen")
3. The app opens in standalone mode with offline support

### iOS
1. Open the app in Safari
2. Tap the Share button → "Add to Home Screen"
3. The app opens in standalone mode (iOS does not auto-prompt for PWA install)

## Assumptions

- **Single-server deployment:** The entire app runs on one Node process. For scale, split the API server and serve static files via Nginx.
- **Short-polling for chat:** Messages refresh every 5 seconds. This is sufficient for a health support context.
- **Daily fact rotation:** Facts are selected deterministically by day-of-year modulo fact count. All users see the same fact on the same day.
- **Doctor assignment:** When a user starts a chat, they're assigned the first available doctor. An admin can reassign in the DB.
- **Leaderboard opt-out:** Users who opt out don't appear on the leaderboard and don't see leaderboard data (they can still access the page but see an empty state).
- **No email verification:** Signup requires a valid email format but doesn't send confirmation emails.
- **Rate limiting:** Not built-in (would need to be added via middleware for production deployment).
