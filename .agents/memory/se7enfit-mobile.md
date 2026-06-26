---
name: SE7ENFIT mobile app
description: Key decisions and constraints for the SE7ENFIT Expo React Native app
---

## Brand colors
- Primary green: `#20c55d` (NOT #22C55E — user confirmed)
- Background: `#050505`
- Card: `#0d0d0d`
- Border: `#1e1e1e`
- Muted: `#9ca3af`

## expo-secure-store version
Must use `~15.0.8` (expo v53 compatible). Version 56.x is incompatible. Always install with exact version range.

**Why:** expo-secure-store has a major version mismatch when installed without pinning — expo v53 needs ~15.0.8.

## Tab mapping
- `index.tsx` → Home
- `workouts.tsx` → Workout
- `nutrition.tsx` → AI Coach (repurposed file — chat screen)
- `challenges.tsx` → Health (repurposed file — health tracking)
- `profile.tsx` → Profile

**Why:** Files are named differently from their tab label — do not rename or it breaks expo-router.

## AuthContext register signature
`register(data: { name, email, phone, password })` — phone is required (10 digits).

## Backend
- Production API: `https://se7enfit-original.onrender.com`
- All requests through `src/services/apiClient.ts` with 15s timeout + 401 auto-logout handler
- JWT stored in SecureStore key `se7enfit_token`

## Mixing `||` and `??` operators
Babel parser requires parens when mixing: `(a || (b ?? 0))` not `(a || b ?? 0)`.
