# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
UstaBro is a handyman finder mobile app for Uzbekistan built with React Native (Expo SDK 54), TypeScript, and Supabase. Two user roles: **customer** (posts jobs) and **master** (handyman who accepts jobs). All UI text is in Uzbek Latin.

## Commands

```bash
npm start           # Start Expo dev server (scan QR with Expo Go)
npm run android     # Start on Android emulator/device
npm run ios         # Start on iOS simulator/device
npx tsc --noEmit    # Type-check without emitting (no test suite)
```

Package manager: **pnpm** (node_modules uses `.pnpm` flat layout). Run `npm install` with legacy peer deps — `.npmrc` sets `legacy-peer-deps=true`.

## Environment Setup

Copy `.env.example` to `.env` and fill in:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Supabase sessions are persisted via `expo-secure-store` (native) or localStorage (web). Auth uses **phone OTP** (Supabase Phone Auth must be enabled in the dashboard).

## Architecture

### Auth Flow
`app/_layout.tsx` → `AuthGate` component reads `useAuthStore` and redirects:
- No session → `/(auth)/` (phone entry)
- Session + no role → `/(auth)/role-select`
- Session + role=customer → `/(customer)/`
- Session + role=master → `/(master)/`

Auth state: `store/authStore.ts` (Zustand) holds `session`, `profile`, `role`, `isLoading`. On mount, `initialize()` fetches the Supabase session then `syncSession()` fetches the profile row. `supabase.auth.onAuthStateChange` keeps it live.

### Data Layer
```
services/      # Pure async Supabase functions (no React)
hooks/         # React Query wrappers around service functions
app/screens    # Consume hooks, never call services directly
```

Each hook file (e.g., `hooks/useOrder.ts`) calls a service function and wraps it in `useQuery`/`useMutation` from TanStack React Query v5. Cache invalidation after mutations uses `queryClient.invalidateQueries`.

### Navigation Structure
```
app/
├── _layout.tsx              # Root: fonts, auth gate, QueryClientProvider
├── index.tsx                # Redirects immediately (no UI)
├── (auth)/                  # Unauthenticated: phone → otp → role-select → create-profile
├── (customer)/
│   ├── (tabs)/              # Home, Orders, Profile tabs
│   ├── categories.tsx       # Category picker
│   ├── create-request.tsx   # New job form
│   ├── master/[id].tsx      # Master profile view
│   └── order/[id].tsx       # Order detail
└── (master)/
    ├── (tabs)/              # Home (pending requests), My Orders, Earnings, Profile tabs
    └── order/[id].tsx       # Order detail with status controls
```

### Database Schema (Supabase/PostgreSQL)
Key tables and relationships:

| Table | Purpose |
|-------|---------|
| `profiles` | All users — extends `auth.users`, has `role` (customer/master) |
| `master_profiles` | Master-only extras: `bio`, `skills[]`, `rating`, `review_count`, `verified` |
| `service_categories` | 6 seeded categories (Elektrika, Santexnika, etc.) with `icon_name` (Ionicons) |
| `orders` | Core entity — `status`: `pending → accepted → on_the_way → arrived → completed/cancelled` |
| `reviews` | One per completed order; DB trigger auto-updates `master_profiles.rating` |
| `messages` | In-order chat (`text`/`image`/`voice` types) |
| `notifications` | Push notification records |

RLS is enabled on all tables. Key policies: masters can read all `pending` orders; customers only see their own orders. Migrations in `supabase/migrations/`.

A DB trigger (`handle_new_user`) auto-creates a `profiles` row on `auth.users` insert.

## Tech Stack
- **Framework:** React Native + Expo SDK 54, Expo Router v6 (file-based routing)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **State:** Zustand (`store/authStore.ts` for auth, `i18n/index.ts` for locale), TanStack React Query v5 (server state)
- **Styling:** React Native `StyleSheet.create` — all tokens imported from `lib/theme.ts`
- **Font:** Plus Jakarta Sans (loaded via `@expo-google-fonts/plus-jakarta-sans`)
- **i18n:** `t()` from `i18n/index.ts`; strings in `i18n/uz.ts` (default) and `i18n/ru.ts`. Locale persisted in AsyncStorage. Use `t()` directly in screens or `useTranslation()` hook in components.
- **Bottom Sheets:** `@gorhom/bottom-sheet` v5 — requires `GestureHandlerRootView` at root (already in `_layout.tsx`)

## Design Philosophy — "Tactile Clarity"
- **No 1px borders.** Boundaries defined by background color shifts (tonal layering).
- **Header-Heavy layouts.** If a screen feels empty, increase typography scale.
- **One Action Per Screen.** Large buttons, generous whitespace.
- **Surface hierarchy:** `surface` → `surfaceContainerLow` → `surfaceContainerLowest` (depth via stacking).
- **Min touch target:** 48px, primary actions 56-64px.
- Never use pure black (`#000000`) — always use `colors.onSurface`.

## Design Tokens (`lib/theme.ts`)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#006B32` | CTA buttons, links, active states |
| `primaryContainer` | `#008740` | Gradient end for CTAs |
| `primaryFixedDim` | `#005A2A` | Pressed state for primary buttons |
| `secondary` | `#4B6172` | Blue-gray accent |
| `secondaryContainer` | `#D3E4F1` | Selected chips, trust badges bg |
| `onSecondaryContainer` | `#0A1E2D` | Text on secondaryContainer |
| `surface` | `#F8F9FA` | Screen background (base layer) |
| `surfaceContainerLow` | `#F3F4F5` | Section backgrounds (section layer) |
| `surfaceContainerLowest` | `#FFFFFF` | Cards (content layer) |
| `surfaceContainerHigh` | `#EDEEF0` | Input backgrounds |
| `onSurface` | `#191C1D` | Primary text |
| `onSurfaceVariant` | `#44474A` | Labels, secondary text |
| `onSurfaceMuted` | `#74777A` | Descriptions, hints |
| `onSurfacePlaceholder` | `#9A9D9F` | Input placeholders |
| `onPrimary` | `#FFFFFF` | Text on primary bg |

Status colors follow the pattern `statusXxxBg` / `statusXxxText` for: `pending`, `accepted`, `onTheWay`, `arrived`, `completed`, `cancelled`.

### Typography (Plus Jakarta Sans)
| Style | Family | Size | Line Height |
|-------|--------|------|-------------|
| `displayLg` | ExtraBold | 36 | 44 |
| `displayMd` | Bold | 28 | 36 |
| `headlineMd` | Bold | 24 | 32 |
| `headlineSm` | Bold | 20 | 28 |
| `titleLg` | SemiBold | 18 | 26 |
| `titleMd` | SemiBold | 16 | 24 |
| `bodyLg` | Medium | 16 | 24 |
| `bodyMd` | Regular | 14 | 22 |
| `labelLg` | SemiBold | 14 | 20 |
| `labelMd` | Medium | 12 | 16 |

### Spacing
| Key | Value | Usage |
|-----|-------|-------|
| 2 | 8px | Small gaps |
| 3 | 12px | Chip/badge internal |
| 4 | 16px | Card internal padding |
| 6 | 24px | Screen padding, card gaps |
| 8 | 32px | Large section gaps |

### Radii
| Key | Value | Usage |
|-----|-------|-------|
| `sm` | 8 | Small elements |
| `md` | 12 | OTP boxes |
| `lg` | 16 | — |
| `xl` | 24 | Buttons, cards, inputs |
| `full` | 9999 | Pills, chips |

### Shadows
- `shadows.ambient`: `shadowColor: #191C1D`, opacity 6%, blur 24px — no harsh drop shadows.

## Component Library (`components/ui/`)

### Button
```tsx
import { Button } from "../../components/ui";
<Button title="Davom etish" variant="primary" loading={false} />
```
Variants: `primary` (green) | `secondary` (surface) | `ghost`. Min height 64px, radius `xl`.

### Card
```tsx
import { Card } from "../../components/ui";
<Card padding="md">{children}</Card>
```
White background on surface, ambient shadow, radius `xl`. No borders.

### Avatar
```tsx
import { Avatar } from "../../components/ui";
<Avatar uri={url} name="Ism Familiya" size={48} />
```
Circular. Falls back to colored initials (color hashed from name).

### Badge
```tsx
import { Badge } from "../../components/ui";
<Badge status="pending" />
```
Pill shape, Uzbek label, status-specific bg/text colors from `colors.statusXxx*`.

### PhoneInput
```tsx
import { PhoneInput } from "../../components/ui/PhoneInput";
<PhoneInput value={phone} onChangeText={setPhone} />
```
Fixed `+998` prefix, 9 digits only. No border — uses tonal shift (surfaceContainerHigh).

## Icon System
- Icons: **Ionicons** via `@expo/vector-icons`
- Category icon names stored in `service_categories.icon_name` (e.g., `"flash-outline"`)

## Styling Rules
- **Always import from `lib/theme.ts`** — never hardcode colors or font families
- `StyleSheet.create` — no Tailwind, no styled-components
- Dynamic styles: `style={[styles.base, { backgroundColor }]}`
- Pressed feedback: `Pressable` with `({ pressed }) => [...]`, background shifts to lighter surface
- Disabled state: `opacity: 0.5`
- Input focus: background shifts from `surfaceContainerHigh` to `surfaceContainerLowest`

## Conventions
- Functional components only, named exports (screens use default exports per Expo Router)
- Props interfaces defined above each component
- Error handling: `Alert.alert("", t("error.key"))` for user-facing errors
- All UI strings via `t("key")` — never hardcode Uzbek text in components
- New translations go in both `i18n/uz.ts` and `i18n/ru.ts`
