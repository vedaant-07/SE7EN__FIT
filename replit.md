# SE7ENFIT — India's #1 AI Fitness App

A full-stack mobile fitness app built with Expo React Native, connecting to the SE7ENFIT production backend. Users get AI-powered workouts, nutrition tracking, health data sync, challenges, rewards, referrals, and subscription management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native), expo-router v6, expo-secure-store (JWT storage)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Backend

- Production: `https://se7enfit-original.onrender.com`
- API base path: `/api`
- JWT auth: stored in SecureStore (`se7enfit_token`)
- All requests go through `src/services/apiClient.ts`

## Where things live

- `artifacts/mobile/` — Expo React Native app
  - `app/` — expo-router screens
  - `app/(user-tabs)/` — 5 tab screens: Home, Workout, AI Coach, Health, Profile
  - `app/(gym-tabs)/` — Gym owner tabs
  - `src/services/` — API service layer (apiClient, authService, workoutService, aiService, nutritionService, userService)
  - `src/types/index.ts` — shared TypeScript types
  - `src/config/constants.ts` — API_BASE_URL and other config
  - `context/AuthContext.tsx` — auth state + SecureStore JWT
- `artifacts/api-server/` — Express API server (local, for future)

## Brand

- Primary green: `#20c55d`
- Background: `#050505`
- Card: `#0d0d0d`
- Border: `#1e1e1e`
- Muted text: `#9ca3af`

## Architecture decisions

- JWT stored in expo-secure-store (not AsyncStorage) for security
- All API calls proxy through apiClient.ts with 15s timeout + 401 auto-logout
- Tab files: index=Home, workouts=Workout, nutrition=AI Coach, challenges=Health, profile=Profile
- Gym owners see `(gym-tabs)` instead of `(user-tabs)`
- Services return empty arrays on 404/error (never crash the UI)

## Product

- Welcome screen → Login / Register (with phone number, 10 digits)
- Home dashboard: daily stats, AI tip, today's workout, water tracker
- Workout tab: AI workout plans + exercise library
- AI Coach tab: real-time Gemini-powered fitness chat
- Health tab: Apple Health / Health Connect integration
- Profile: badges, body stats, referral code, subscription management

## User preferences

- Brand color is #20c55d (green), NOT #22C55E
- Background is #050505 (near black), card is #0d0d0d
- Phone number input: 10 digits only, digits only enforced

## Gotchas

- expo-secure-store version must be ~15.0.8 (expo v53 compatible)
- expo-video version mismatch warning can be ignored (not actively used)
- Web preview works but SecureStore may not persist across browser sessions (works fine on device)
- Backend at se7enfit-original.onrender.com may be slow to wake up (cold start)
