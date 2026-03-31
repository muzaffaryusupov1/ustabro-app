# 🔧 Handyman Finder — Full Development Plan
### *React Native (Expo) + Supabase | MVP for Uzbekistan*

---

## 1. Overall Project Architecture & Tech Stack

### Core Stack
| Layer | Technology |
|---|---|
| Mobile Framework | React Native + Expo SDK 51+ |
| Navigation | Expo Router v3 (file-based routing) |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| Language | TypeScript |
| State Management | Zustand (lightweight, simple) |
| Async Data | TanStack Query (React Query v5) |
| Styling | NativeWind v4 (Tailwind for RN) or StyleSheet |
| Forms | React Hook Form + Zod |
| Notifications | Expo Notifications + Supabase Edge Functions |
| Maps / Location | Expo Location + react-native-maps |
| Media | Expo ImagePicker, Expo AV (voice recording) |
| OTP Auth | Supabase Phone Auth (SMS via Twilio) |
| Build & Deploy | Expo EAS Build + EAS Submit |

### Recommended Expo Packages
```
expo-router
expo-notifications
expo-location
expo-image-picker
expo-av
expo-camera
expo-constants
expo-linking
expo-status-bar
expo-font
@supabase/supabase-js
react-native-maps
react-native-reanimated
react-native-gesture-handler
react-native-safe-area-context
react-native-phone-number-input
zustand
@tanstack/react-query
react-hook-form
zod
```

### Folder Structure (Expo Router)
```
ustabro-app/
├── app/                         # Expo Router pages
│   ├── (auth)/
│   │   ├── index.tsx            # Phone number input
│   │   └── otp.tsx              # OTP verification
│   ├── (customer)/
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Home screen
│   │   ├── categories.tsx       # Service categories
│   │   ├── create-request.tsx   # New request form
│   │   ├── orders.tsx           # My orders
│   │   ├── order/[id].tsx       # Order detail & chat
│   │   └── masters/
│   │       ├── index.tsx        # Browse masters
│   │       └── [id].tsx         # Master profile
│   ├── (master)/
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Incoming requests
│   │   ├── my-orders.tsx        # Accepted orders
│   │   ├── earnings.tsx         # Earnings overview
│   │   └── profile.tsx          # Master profile editor
│   └── _layout.tsx              # Root layout (auth gate)
├── components/
│   ├── ui/                      # Reusable: Button, Card, Avatar, Badge
│   ├── customer/
│   └── master/
├── hooks/                       # useAuth, useLocation, useOrders...
├── lib/
│   ├── supabase.ts              # Supabase client init
│   ├── queryClient.ts           # React Query client
│   └── constants.ts             # App-wide constants
├── store/                       # Zustand stores
│   ├── authStore.ts
│   └── locationStore.ts
├── services/                    # API layer functions
│   ├── orders.ts
│   ├── masters.ts
│   ├── categories.ts
│   └── chat.ts
├── types/                       # TypeScript types
├── i18n/                        # Uzbek translations (uz-latn, uz-cyrl)
├── assets/                      # Icons, images, fonts
└── supabase/
    ├── migrations/              # SQL migration files
    └── functions/               # Edge Functions (notifications)
```

---

## 2. Supabase Schema Design

### Tables

#### `profiles`
```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id)
phone         text UNIQUE NOT NULL
full_name     text
avatar_url    text
role          text CHECK (role IN ('customer', 'master'))
is_active     boolean DEFAULT true
location_lat  float8
location_lng  float8
address       text
created_at    timestamptz DEFAULT now()
```

#### `master_profiles`
```sql
id               uuid PRIMARY KEY REFERENCES profiles(id)
bio              text
skills           text[]           -- ['electrical', 'plumbing', ...]
experience_years int
is_available     boolean DEFAULT true
rating           numeric(3,2) DEFAULT 0
review_count     int DEFAULT 0
verified         boolean DEFAULT false
```

#### `service_categories`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
name_uz    text NOT NULL       -- Uzbek Latin
name_uz_cy text               -- Uzbek Cyrillic
icon_name  text               -- Ionicons key
icon_url   text               -- fallback image
sort_order int DEFAULT 0
is_active  boolean DEFAULT true
```

#### `orders`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
customer_id     uuid REFERENCES profiles(id)
master_id       uuid REFERENCES profiles(id)
category_id     uuid REFERENCES service_categories(id)
description     text
voice_note_url  text
photo_urls      text[]
address         text
location_lat    float8
location_lng    float8
status          text CHECK (status IN (
                  'pending', 'accepted', 'on_the_way',
                  'arrived', 'completed', 'cancelled'))
                DEFAULT 'pending'
price_agreed    numeric(12,2)
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

#### `reviews`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
order_id    uuid UNIQUE REFERENCES orders(id)
customer_id uuid REFERENCES profiles(id)
master_id   uuid REFERENCES profiles(id)
rating      int CHECK (rating BETWEEN 1 AND 5)
comment     text
created_at  timestamptz DEFAULT now()
```

#### `messages`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
order_id    uuid REFERENCES orders(id)
sender_id   uuid REFERENCES profiles(id)
content     text
type        text CHECK (type IN ('text', 'image', 'voice')) DEFAULT 'text'
media_url   text
is_read     boolean DEFAULT false
created_at  timestamptz DEFAULT now()
```

#### `notifications`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid REFERENCES profiles(id)
title       text
body        text
data        jsonb
is_read     boolean DEFAULT false
created_at  timestamptz DEFAULT now()
```

### RLS Policies (Key Examples)

```sql
-- profiles: users can only read/update their own profile
-- orders: customers see their own orders; masters see pending + assigned to them
-- messages: only participants of the order can read/write
-- reviews: only the customer of a completed order can create a review
```

> **All tables have RLS enabled by default. Service role key is only used in Edge Functions.**

### Storage Buckets
| Bucket | Purpose | Access |
|---|---|---|
| `avatars` | User profile photos | Public read, auth write |
| `order-photos` | Photos attached to orders | Auth read (participants), auth write |
| `voice-notes` | Voice messages in orders/chat | Auth read (participants), auth write |

---

## 3. Authentication Flow

### Phone OTP (Supabase Auth)

```
1. User opens app → Root layout checks session
2. No session → Redirect to (auth)/index
3. User enters phone number (UZ format: +998XXXXXXXXX)
4. App calls supabase.auth.signInWithOtp({ phone })
5. Twilio/Supabase sends SMS with 6-digit code
6. User enters code on otp.tsx screen
7. App calls supabase.auth.verifyOtp({ phone, token, type: 'sms' })
8. On success → session created
9. Check if profile exists in `profiles` table:
   - New user → show role selection screen (Customer / Master)
   - Existing user → redirect to appropriate role's home
10. Role saved to profiles.role → redirect to (customer)/ or (master)/
```

**Key Points:**
- No email/password — phone only
- Role is stored in `profiles.role`, not Supabase custom claims (simpler)
- Session is persisted with `AsyncStorage` via `@supabase/supabase-js`
- Auto-refresh tokens are enabled
- Phone input uses country picker pre-set to `+998` (Uzbekistan)

---

## 4. Phase-by-Phase Development Roadmap

### Phase 1 — Project Setup & Foundation *(~3–4 days)*
**Focus:** Scaffolding, Supabase connection, base navigation
- Initialize Expo project with TypeScript template
- Configure Expo Router root layout with auth guard
- Set up Supabase project: create tables, RLS, buckets
- Create `lib/supabase.ts` client with AsyncStorage session
- Set up Zustand auth store + React Query client
- Configure `i18n` with Uzbek strings (both scripts)
- Create base UI components: `Button`, `Card`, `Avatar`, `StatusBadge`

### Phase 2 — Authentication *(~3–4 days)*
**Focus:** Phone OTP login, role selection, profile creation
- Phone number input screen with `+998` prefix
- OTP code input (6-digit with auto-submit)
- Role selection screen: Customer / Master (big icons, no text jargon)
- Profile creation: name, photo upload (Supabase Storage)
- Master extras: select skills (categories), bio, experience
- Session persistence and auto-redirect on app reopen

### Phase 3 — Customer Core Flow *(~5–6 days)*
**Focus:** Create and track orders
- Home screen: large "Usta Chaqirish" (Call a Master) button
- Service category picker (grid with big icons)
- Create request form:
  - Text description (optional)
  - Voice message recording (Expo AV)
  - Photo upload up to 3 images (Expo ImagePicker)
  - Address input + optional map pin (Expo Location)
- Order list screen with status badges
- Order detail screen with status timeline

### Phase 4 — Master Core Flow *(~4–5 days)*
**Focus:** Incoming requests and order management
- Incoming requests feed (sorted by distance / newest)
- Request card: category icon, description preview, distance, customer rating
- Accept / Reject with confirmation dialog
- Status update buttons: On the Way → Arrived → Done
- My active/past orders list
- Basic earnings summary (count & total of completed orders)

### Phase 5 — Master & Customer Profiles + Browse Masters *(~3–4 days)*
**Focus:** Profile pages and master discovery
- Master public profile: photo, name, skills, rating, reviews
- Customer browse masters screen (filtered by category, sorted by rating/distance)
- In-app calling (tap phone icon → `tel://` deep link)
- Master edits their profile
- Rating + review form shown after order completion

### Phase 6 — Chat & Realtime *(~4–5 days)*
**Focus:** In-app messaging and live updates
- Simple chat screen per order (text + image share)
- Voice note sending in chat (Expo AV)
- Supabase Realtime subscriptions for:
  - New messages in order chat
  - Order status changes (customer sees live updates)
  - New incoming requests (master feed auto-refreshes)
- Unread message badge on tab bar

### Phase 7 — Push Notifications *(~3–4 days)*
**Focus:** Expo Notifications + Supabase Edge Functions
- Register device push token on login (stored in `profiles.push_token`)
- Edge Function triggers on DB changes:
  - New order → notify available masters by category/location
  - Order accepted → notify customer
  - Status change → notify relevant party
  - New message → notify recipient
- Notification tap → deep link into order screen
- Notification preferences (can be toggled)

### Phase 8 — Polish, Testing & Deployment *(~5–7 days)*
**Focus:** QA, performance, app store submission
- Offline state handling (React Query cache + friendly error screens)
- Loading skeletons for all list screens
- Empty states with illustrations
- Form validation with user-friendly Uzbek error messages
- Performance audit (FlatList optimization, image lazy loading)
- EAS Build: development + preview + production profiles
- App Store Connect + Google Play Console setup
- Privacy policy page (required for stores)

**Total Estimated MVP Effort: ~4–7 weeks** (solo developer, part-time)

---

## 5. Main Screens & User Flows

### Customer Screens

| Screen | Key Elements |
|---|---|
| **Home** | Big "Usta Chaqirish" button, recent orders strip, category quick-pick |
| **Category Picker** | 2-column grid, big icons + Uzbek labels |
| **Create Request** | Camera/gallery pick, mic button, text area, address input, submit |
| **Order List** | Status-colored cards, pull-to-refresh |
| **Order Detail** | Status timeline, master card (call button), chat button |
| **Chat** | Bubble chat, image/voice attachments, send button |
| **Browse Masters** | List with avatar, rating stars, distance, skills chips |
| **Master Profile** | Full profile, reviews, call button |
| **Rate Order** | 1–5 stars + optional comment |

### Master Screens

| Screen | Key Elements |
|---|---|
| **Incoming Requests** | Live feed, request cards, Accept/Reject |
| **My Orders** | Active + completed tabs |
| **Order Detail** | Customer info, status update buttons, chat |
| **Earnings** | Total completed, this month, simple list |
| **My Profile** | Edit name, photo, skills, availability toggle |

---

## 6. State Management, API Layer & Realtime

### State Management (Zustand)

```
authStore       → user session, profile, role
locationStore   → current coordinates, permission state
notifStore      → unread count
```
- Keep stores minimal — most server state lives in React Query cache

### API Layer (`services/`)
- Each file exports typed async functions wrapping Supabase calls
- React Query `useQuery` / `useMutation` hooks wrap these functions
- Centralized error handler logs to console + shows Uzbek toast

### Realtime Strategy
```
Channel: orders:customer_id=eq.{uid}    → customer order status changes
Channel: orders:status=eq.pending       → master new requests feed
Channel: messages:order_id=eq.{orderId} → chat messages
```
- Subscriptions created in `useEffect` with cleanup on unmount
- Use React Query's `invalidateQueries` on Realtime events to refresh cache
- Avoid storing real-time data in Zustand — let React Query own it

---

## 7. Best Practices: Simplicity, Performance & Security

### Simplicity for Provincial Users
- **Uzbek first**: all UI text in Uzbek Latin; add Cyrillic toggle in settings
- **Large touch targets**: minimum 56px height for all interactive buttons
- **Icons over text**: every category, status, and action has an icon
- **Minimal screens**: each screen has one primary action only
- **Optional fields**: address and photo are never required
- **Voice first**: voice note recording prominently placed for low-literacy users
- **Direct call fallback**: always offer `tel://` call alongside in-app chat

### Performance
- `FlatList` with `getItemLayout` for fixed-height order cards
- Expo Image (`expo-image`) for automatic caching and progressive loading
- Pagination: orders loaded in pages of 20 with `fetchNextPage`
- Supabase queries always select only needed columns (no `select('*')`)
- Images compressed before upload (Expo ImageManipulator)

### Security
- RLS enforced on all tables — no client-side trust
- Service role key ONLY in Edge Functions (never in app bundle)
- Input validation: Zod schemas on all forms before API calls
- Phone numbers normalized to E.164 format before storing
- Rate limiting on OTP: Supabase built-in + Twilio rate limits
- Storage bucket policies: only order participants can access order files

### Error Handling
- Network errors: React Query retry with exponential backoff (3 retries)
- Auth errors: auto sign-out on 401, redirect to login
- Upload errors: show retry button, keep local draft in state
- All errors display in Uzbek: `"Xatolik yuz berdi. Qayta urinib ko'ring."`

### Offline Considerations
- React Query staleTime / cacheTime configured for offline reads
- Order creation queued locally (simple array in AsyncStorage) if offline
- Show `"Internet yo'q"` banner using `@react-native-community/netinfo`

---

## 8. Future Enhancements (Post-MVP)

| Feature | Notes |
|---|---|
| **In-app Payments** | Click (local payment gateway), Payme, Uzum Bank integration |
| **Price Bidding** | Masters can suggest a price; customer accepts/counters |
| **Master Verification** | Admin reviews ID + skills before enabling profile |
| **Admin Panel** | Next.js web dashboard for managing masters, orders, disputes |
| **Analytics** | PostHog or Mixpanel for funnel and retention tracking |
| **Subscription for Masters** | Monthly fee model for top listing placement |
| **Multi-language** | Russian language support for mixed-population regions |
| **Service Scheduling** | Book a master for a future date/time |
| **Master Teams** | A master can have apprentices/team members |
| **AI Category Detection** | Auto-detect service category from uploaded photo |

---

## 9. Testing & Deployment Strategy

### Testing

**Unit/Integration:**
- Jest + `@testing-library/react-native` for components and hooks
- Test critical flows: auth, order creation, status updates
- Mock Supabase client with `jest.mock`

**E2E Testing (optional for MVP):**
- Maestro (simplest for React Native E2E)
- Test flows: login → create order → accept (master) → complete

**Manual QA Checklist:**
- Real device testing on Android (primary market) + iOS
- Test on low-end Android phones (2GB RAM, Android 10)
- Test on slow 3G/4G connections (common in provinces)
- Test all Uzbek text rendering (Latin + Cyrillic fonts)

### Deployment

**EAS Configuration (`eas.json`):**
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal", "android": { "buildType": "apk" } },
    "production":  { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json" },
      "ios":      { "appleId": "...", "ascAppId": "..." }
    }
  }
}
```

**Release Pipeline:**
1. `eas build --platform android --profile preview` → APK for beta testers
2. Distribute via EAS Update (OTA) for JS-only hotfixes
3. `eas build --platform all --profile production` for store releases
4. `eas submit` for automated store submission

**Environment Variables:**
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- Sensitive keys (service role) only in Supabase Edge Functions env

**App Store Requirements:**
- App Privacy declarations (location, camera, microphone)
- Privacy Policy URL (required by both stores)
- Age rating: 4+ (no mature content)
- Android: target SDK 34+; iOS: target iOS 15+

---

## Summary Timeline

```
Week 1-2:  Phase 1 + 2  (Setup + Auth)
Week 3-4:  Phase 3 + 4  (Customer + Master core)
Week 5:    Phase 5       (Profiles + Master browse)
Week 6:    Phase 6       (Chat + Realtime)
Week 7:    Phase 7       (Push Notifications)
Week 8+:   Phase 8       (Polish + Submit to stores)
```

> **MVP Goal**: A working app where a customer can post a job request, a nearby master can accept it, they can communicate, and the customer can rate the master after completion.
