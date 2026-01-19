# ShadowRank - The Real-Life RPG

> Turn your daily habits into epic quests. Level up IRL.

A gamified habit tracker with a dark "Solo Leveling/Cyberpunk" aesthetic. Users gain XP and climb Hunter Ranks (E to S) by completing real-world tasks like studying, exercising, and coding.

## Features

- **Hunter Rank System** - Progress from E-Rank to legendary S-Rank
- **Daily Quests** - Create custom habits with XP rewards
- **XP & Leveling** - Earn experience and level up with satisfying animations
- **Live Leaderboards** - Compete with friends in real-time
- **Streak Tracking** - Build daily consistency with visual flame effects
- **Admin Analytics Dashboard** - DAU metrics, retention analysis, feedback management
- **Gamified Feedback System** - Earn +50 XP for reporting bugs and suggesting features
- **Dark Cyberpunk Theme** - Immersive "Solo Leveling" System Window aesthetic

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 (App Router) | React framework with SSR/SSG |
| Styling | Tailwind CSS v4 | Utility-first styling with dark mode |
| Auth | Supabase Auth | Email authentication, session management |
| Database | Supabase PostgreSQL | Real-time subscriptions, RLS policies |
| Charts | Recharts | Analytics dashboard visualization |
| Animations | Framer Motion | Smooth UI transitions |
| Icons | Lucide React | Modern icon library |
| Hosting | Vercel | Edge deployment, CI/CD |

## Architecture

```
Browser (Client)
    │
    ├── Next.js App Router
    │   ├── /dashboard - Quest board, XP tracking
    │   ├── /leaderboard - Hunter rankings
    │   ├── /admin - Analytics (protected)
    │   └── /login - Authentication
    │
    └── API Routes
        ├── /api/complete-quest - XP awards, level calculations
        ├── /api/quests - CRUD operations
        └── /api/feedback-reward - Gamified feedback
            │
            ▼
    Supabase Backend
        ├── PostgreSQL Database
        │   ├── profiles (user stats, ranks)
        │   ├── quests (user tasks)
        │   ├── completions (quest logs)
        │   ├── activity_logs (analytics)
        │   └── feedback (bug reports)
        │
        ├── Row Level Security (RLS)
        │   └── Users can only access their own data
        │
        └── RPC Functions
            ├── get_user_streak() - Gaps & Islands algorithm
            ├── get_weekly_retention() - Cohort analysis
            └── get_dau_stats() - Daily active users
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/shadowrank.git
   cd shadowrank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Set up the database**
   - Go to Supabase Dashboard > SQL Editor
   - Run the contents of `supabase-setup.sql` (core tables)
   - Run the contents of `supabase-phase3.sql` (analytics)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Analytics Features

### Daily Active Users (DAU)
Track user engagement with a 7-day rolling chart showing daily unique active users.

### Cohort Retention Analysis
Uses the **"Gaps and Islands"** SQL algorithm to calculate user streaks and weekly retention cohorts. This advanced SQL technique groups consecutive days of activity into "islands" to accurately track streaks even with missing days.

### Gamified Feedback
Users earn **+50 XP** for submitting bug reports or feature requests, encouraging community contributions while gathering valuable feedback.

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User stats: XP, level, rank, streak, is_admin |
| `quests` | User-created daily tasks |
| `completions` | Quest completion history |
| `activity_logs` | Event tracking for analytics |
| `feedback` | Bug reports and feature requests |

## Security

- **Row Level Security (RLS)** - Users can only access their own data
- **Server-side API routes** - Sensitive logic runs on server
- **SECURITY DEFINER functions** - Database functions run with elevated privileges
- **Admin-only routes** - Analytics dashboard requires `is_admin = true`

## Project Structure

```
shadowrank/
├── app/
│   ├── api/              # API routes
│   │   ├── complete-quest/
│   │   ├── quests/
│   │   └── feedback-reward/
│   ├── admin/            # Admin analytics dashboard
│   ├── dashboard/        # Main quest board
│   ├── leaderboard/      # Rankings page
│   └── login/            # Authentication
├── components/
│   ├── admin/            # Admin chart components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
│   ├── useAnalytics.ts   # Analytics hooks
│   ├── useProfile.ts     # Profile management
│   └── useQuests.ts      # Quest management
├── lib/                  # Utilities
│   ├── supabase.ts       # Client-side Supabase
│   ├── supabase-server.ts# Server-side Supabase
│   └── xp.ts             # XP calculations
└── types/                # TypeScript types
```

## Hunter Rank Progression

| Rank | Level Required | Color | Effect |
|------|---------------|-------|--------|
| E | 1+ | Gray | Subtle border |
| D | 5+ | Green | Soft glow |
| C | 10+ | Blue | Medium glow |
| B | 20+ | Purple | Strong glow |
| A | 30+ | Orange | Pulsing border |
| S | 50+ | Gold | Golden glow + sparkle |

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy
 
## 🔗 Live Demo

👉 **https://shadowrank.vercel.app/**

---
