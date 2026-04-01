# UstaBro — Design System Rules

## Project Overview
UstaBro is a handyman finder mobile app for Uzbekistan built with React Native (Expo SDK 54), TypeScript, and Supabase. All UI text is in Uzbek Latin.

## Tech Stack
- **Framework:** React Native + Expo SDK 54, Expo Router v6 (file-based routing)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **State:** Zustand (auth store), TanStack React Query v5 (server state)
- **Styling:** React Native `StyleSheet.create` — all tokens imported from `lib/theme.ts`
- **Font:** Plus Jakarta Sans (loaded via `@expo-google-fonts/plus-jakarta-sans`)
- **i18n:** Custom `t()` function from `i18n/index.ts`, all strings in `i18n/uz.ts`

## Design Philosophy — "Tactile Clarity"
- **No 1px borders.** Boundaries defined by background color shifts (tonal layering).
- **Header-Heavy layouts.** If a screen feels empty, increase typography scale.
- **One Action Per Screen.** Large buttons, generous whitespace.
- **Surface hierarchy:** surface → surfaceContainerLow → surfaceContainerLowest (depth via stacking).
- **Min touch target:** 48px, primary actions 56-64px.
- Never use pure black (#000000) — always use `colors.onSurface`.

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

### Shadows (ambient)
- `shadowColor: #191C1D`, opacity 6%, blur 24px — no harsh drop shadows.

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
Pill shape (`borderRadius: full`), Uzbek label, status-specific bg/text colors.

### PhoneInput
```tsx
import { PhoneInput } from "../../components/ui/PhoneInput";
<PhoneInput value={phone} onChangeText={setPhone} />
```
Fixed `+998` prefix, 9 digits only. No border — uses tonal shift (surfaceContainerHigh).

## Icon System
- Icons: **Ionicons** via `@expo/vector-icons`, stroke weight 2px
- Referenced by `icon_name` in `service_categories` table

## Project Structure
```
app/                    # Expo Router pages
├── (auth)/             # Auth flow screens
├── (customer)/         # Customer tab group
├── (master)/           # Master tab group
└── _layout.tsx         # Root layout + auth gate + font loading
components/ui/          # Reusable UI components
hooks/                  # Custom hooks (useTranslation)
i18n/                   # Uzbek translations
lib/                    # theme.ts, supabase.ts, queryClient.ts
services/               # API layer (profiles.ts, etc.)
store/                  # Zustand stores (authStore.ts)
supabase/migrations/    # SQL migration files
```

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
- `forwardRef` when ref forwarding is needed
- Error handling: `Alert.alert("", t("error.key"))` for user-facing errors
- All UI strings via `t("key")` — never hardcode Uzbek text in components
