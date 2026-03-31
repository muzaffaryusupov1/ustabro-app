# UstaBro — Engineering Task Breakdown

> Each task touches ≤5 files, is independently testable, and has clear acceptance criteria.

---

## Phase 1 — Project Setup & Foundation

### TASK-001: Initialize Expo Project with TypeScript
**Files affected:**
- `package.json`, `app.json`, `tsconfig.json`, `app/_layout.tsx`

**Work:**
- Run `npx create-expo-app@latest ./ --template expo-template-blank-typescript`
- Configure `app.json`: name `UstaBro`, slug, icons placeholder, scheme `ustabro`
- Install Expo Router: `npx expo install expo-router`
- Set up root `app/_layout.tsx` with `<Stack>` and `<Slot>`

**Acceptance Criteria:**
- `npx expo start` runs without errors
- Navigating to `/` shows a blank screen with no crashes
- TypeScript strict mode enabled, no type errors on `tsc --noEmit`

---

### TASK-002: Install & Configure Supabase Client
**Files affected:**
- `lib/supabase.ts`, `package.json`, `.env`, `.env.example`

**Work:**
- Install `@supabase/supabase-js`, `expo-secure-store`, `@react-native-async-storage/async-storage`
- Create `lib/supabase.ts` with client init using `ExpoSecureStoreAdapter` for session storage
- Create `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Create `.env.example` (no real values)

**Acceptance Criteria:**
- `supabase.from('profiles').select('id').limit(1)` executes without a 401 error
- Session persists after app reload (check via `supabase.auth.getSession()`)
- `.env` is in `.gitignore`

---

### TASK-003: Supabase DB — Profiles & Auth Tables Migration
**Files affected:**
- `supabase/migrations/001_profiles.sql`

**Work:**
- Create `profiles` table (see schema in plan)
- Create `master_profiles` table
- Enable RLS on both tables
- Policy: `profiles` — user can read/update their own row
- Trigger: auto-insert skeleton profile row on `auth.users` insert

**Acceptance Criteria:**
- Migration runs via `supabase db push` without errors
- Inserting a user in `auth.users` automatically creates a row in `profiles`
- `SELECT` on `profiles` as an anon user returns 0 rows (RLS works)

---

### TASK-004: Supabase DB — Orders, Categories, Reviews, Messages
**Files affected:**
- `supabase/migrations/002_orders_and_chat.sql`

**Work:**
- Create `service_categories`, `orders`, `reviews`, `messages`, `notifications` tables
- Seed 6 default categories (Electrical, Plumbing, Appliances, Furniture, Construction, Other) with icon names
- RLS policies:
  - `orders`: customer sees own rows; master sees `pending` + rows where `master_id = auth.uid()`
  - `messages`: only order participants can read/insert
  - `reviews`: customer inserts only if `order.status = 'completed'` and they are the customer

**Acceptance Criteria:**
- `SELECT * FROM service_categories` returns 6 rows without auth
- Authenticated customer cannot read another customer's orders
- Authenticated master can read `pending` orders

---

### TASK-005: Supabase Storage Buckets Setup
**Files affected:**
- `supabase/migrations/003_storage.sql` (or done via dashboard + notes)

**Work:**
- Create buckets: `avatars` (public), `order-photos` (private), `voice-notes` (private)
- `avatars`: anyone can read; only auth users can upload their own files
- `order-photos`, `voice-notes`: only order participants can read; auth user can upload

**Acceptance Criteria:**
- Public URL for a file in `avatars` resolves in browser without auth
- Uploading to `order-photos` without auth returns a 403 error

---

### TASK-006: Base UI Component Library
**Files affected:**
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Avatar.tsx`
- `components/ui/Badge.tsx`
- `components/ui/index.ts`

**Work:**
- `Button`: variants `primary`, `secondary`, `ghost`; min height 56px; loading spinner prop
- `Card`: shadow, rounded corners, padding presets
- `Avatar`: circular image with fallback initials
- `Badge`: status pill with color map for order statuses

**Acceptance Criteria:**
- Each component renders in Expo's component preview / Storybook without errors
- `Button` with `loading={true}` shows spinner and is disabled
- `Badge` renders correct color for all 6 order status values

---

### TASK-007: i18n Setup with Uzbek Strings
**Files affected:**
- `i18n/uz.ts`, `i18n/index.ts`, `hooks/useTranslation.ts`

**Work:**
- Create flat string map `uz.ts` covering all UI labels (buttons, errors, status names)
- `index.ts` exports a `t(key)` function defaulting to Uzbek Latin
- `useTranslation` hook wraps `t()` for use in components

**Acceptance Criteria:**
- `t('order.status.pending')` returns `"Kutilmoqda"`
- `t('nonexistent.key')` returns the key itself (no crash)
- All 6 category names exist in the string map

---

### TASK-008: Zustand Auth Store + React Query Setup
**Files affected:**
- `store/authStore.ts`, `lib/queryClient.ts`, `app/_layout.tsx`

**Work:**
- Zustand `authStore`: holds `session`, `profile`, `role`, actions `setProfile`, `signOut`
- React Query client with defaults: `staleTime: 60_000`, retry 3
- Wrap root `_layout.tsx` with `QueryClientProvider`
- On app start, call `supabase.auth.getSession()` and populate store

**Acceptance Criteria:**
- `useAuthStore().role` is `null` when logged out, `'customer'` or `'master'` when logged in
- After `signOut()`, navigate to auth screen and store is cleared
- React Query DevTools shows in dev builds

---

## Phase 2 — Authentication

### TASK-009: Phone Number Input Screen
**Files affected:**
- `app/(auth)/index.tsx`, `components/ui/PhoneInput.tsx`

**Work:**
- Full-screen layout with app logo, title in Uzbek
- `PhoneInput` component: `+998` prefix fixed, 9-digit number input, large font
- "Davom etish" (Continue) button calls `supabase.auth.signInWithOtp({ phone })`
- Loading state during SMS send; error shown in Uzbek

**Acceptance Criteria:**
- Entering fewer than 9 digits disables the submit button
- Valid phone triggers OTP send (verify in Supabase Auth logs)
- Network error shows Uzbek message: `"Xatolik yuz berdi. Qayta urinib ko'ring."`

---

### TASK-010: OTP Verification Screen
**Files affected:**
- `app/(auth)/otp.tsx`

**Work:**
- 6-box OTP input (one digit per box, auto-advance)
- Auto-submits when all 6 digits entered
- Calls `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`
- "Qayta yuborish" (Resend) button with 60-second cooldown timer
- On success → navigate to role selection or home

**Acceptance Criteria:**
- Entering 6 digits auto-submits without pressing a button
- Wrong OTP shows error, clears inputs
- Resend button is disabled for exactly 60 seconds after send
- Correct OTP navigates away from auth screen

---

### TASK-011: Role Selection Screen
**Files affected:**
- `app/(auth)/role-select.tsx`

**Work:**
- Two large cards: "Mijoz" (Customer) with person icon, "Usta" (Master) with tools icon
- On selection: update `profiles.role` in Supabase, update Zustand store
- Navigate to `(customer)/` or `(master)/` accordingly

**Acceptance Criteria:**
- Screen is only shown to users whose `profiles.role` is `null`
- Tapping "Usta" sets `role = 'master'` in DB and navigates to master home
- Tapping "Mijoz" sets `role = 'customer'` in DB and navigates to customer home
- Refreshing the app after role selection skips this screen

---

### TASK-012: Auth Route Guard (Root Layout)
**Files affected:**
- `app/_layout.tsx`

**Work:**
- On mount, check Supabase session
- No session → redirect to `/(auth)/`
- Session + no role → redirect to `/(auth)/role-select`
- Session + role → redirect to `/(customer)/` or `/(master)/`
- Listen to `supabase.auth.onAuthStateChange` for real-time session changes

**Acceptance Criteria:**
- Opening app without a session always lands on phone input screen
- Opening app after login always skips auth screens
- Signing out from any screen redirects to `/(auth)/` within 1 second

---

### TASK-013: Profile Creation Screen (Post Role Selection)
**Files affected:**
- `app/(auth)/create-profile.tsx`, `services/profiles.ts`

**Work:**
- Full name text input (required)
- Avatar upload via `expo-image-picker` → upload to `avatars` bucket
- For masters: multi-select skill chips (from service categories)
- Save button → upsert `profiles` + `master_profiles`

**Acceptance Criteria:**
- Cannot proceed without entering a name
- Avatar uploads successfully and URL saved to `profiles.avatar_url`
- Masters must select at least one skill
- Profile row in Supabase matches entered data after save

---

## Phase 3 — Customer Core Flow

### TASK-014: Customer Tab Layout & Home Screen
**Files affected:**
- `app/(customer)/_layout.tsx`, `app/(customer)/index.tsx`

**Work:**
- Tab bar: Home, Orders, Profile (3 tabs only, big icons)
- Home screen: large "Usta Chaqirish" CTA button (full width, 72px height)
- Below: horizontal scroll of 6 category icons for quick access
- Recent orders strip (last 3, from React Query)

**Acceptance Criteria:**
- Tab navigation works without flicker
- "Usta Chaqirish" button navigates to category picker
- Recent orders strip shows real data within 2 seconds on good connection

---

### TASK-015: Service Category Picker Screen
**Files affected:**
- `app/(customer)/categories.tsx`, `services/categories.ts`, `hooks/useCategories.ts`

**Work:**
- 2-column grid of category cards (icon + Uzbek name)
- Fetched from `service_categories` table via React Query
- Loading skeleton (6 placeholder cards)
- Tapping a category navigates to create-request with `categoryId` param

**Acceptance Criteria:**
- All 6 categories render with correct icons and Uzbek names
- Skeleton shows while data loads
- Selecting a category passes `categoryId` correctly to next screen (verify via route params)

---

### TASK-016: Create Request — Photo & Description
**Files affected:**
- `app/(customer)/create-request.tsx` (Part 1)
- `services/orders.ts`

**Work:**
- Show selected category at top
- Photo picker: up to 3 images, grid preview, remove button on each
- Text description: multiline input, optional, placeholder in Uzbek
- Validation: at least a photo OR description is required

**Acceptance Criteria:**
- Can add up to 3 photos; 4th attempt shows an error message
- Photos can be removed individually
- Submit disabled if both photo and description are empty
- Photos are compressed to ≤1MB before upload (use `expo-image-manipulator`)

---

### TASK-017: Create Request — Voice Note & Address
**Files affected:**
- `app/(customer)/create-request.tsx` (Part 2)
- `components/VoiceRecorder.tsx`

**Work:**
- `VoiceRecorder`: hold-to-record button, waveform placeholder, playback before send
- Address: text input + "Joylashuvni aniqlash" (Detect Location) button
- Detect location uses `expo-location`, fills address field with reverse-geocoded string
- On submit: upload voice note to `voice-notes` bucket; insert order row in DB

**Acceptance Criteria:**
- Recording starts on press-hold, stops on release
- Recorded audio plays back correctly before submission
- Location permission prompt shown; on grant, fills address field
- Order row inserted in Supabase with all fields after submit

---

### TASK-018: Customer Order List Screen
**Files affected:**
- `app/(customer)/orders.tsx`, `hooks/useCustomerOrders.ts`

**Work:**
- Tabs: "Faol" (Active) / "Tugallangan" (Completed)
- Each card: category icon, status badge, date, short description
- Pull-to-refresh
- Empty state illustration + Uzbek message

**Acceptance Criteria:**
- Active and completed orders show in correct tabs
- Pull-to-refresh refetches data
- Empty state shown when no orders exist
- Status badge colors match the design: pending=yellow, accepted=blue, completed=green

---

### TASK-019: Customer Order Detail Screen
**Files affected:**
- `app/(customer)/order/[id].tsx`, `hooks/useOrder.ts`

**Work:**
- Status timeline (vertical stepper): Pending → Accepted → On the Way → Arrived → Done
- Attached photos carousel, voice note playback button
- Master card (avatar, name, rating, phone icon for direct call)
- "Chat" button at bottom
- Cancel order button (only when `status = 'pending'`)

**Acceptance Criteria:**
- Current status step is highlighted in timeline
- Tapping phone icon opens native dialer with master's phone number
- Cancel button visible only for pending orders; cancels correctly in DB
- Chat button navigates to chat screen for this order

---

## Phase 4 — Master Core Flow

### TASK-020: Master Tab Layout & Incoming Requests Screen
**Files affected:**
- `app/(master)/_layout.tsx`, `app/(master)/index.tsx`
- `hooks/usePendingRequests.ts`

**Work:**
- Tab bar: Requests, My Orders, Earnings, Profile
- Requests screen: `FlatList` of pending orders matching master's skill categories
- Each card: category icon, description excerpt, distance (if location available), time ago
- Pull-to-refresh; empty state when no requests

**Acceptance Criteria:**
- Only orders matching master's `skills[]` appear in the list
- Distance shown if master has location set; hidden otherwise
- Pull-to-refresh fetches new data
- Empty state shown when no matching pending orders exist

---

### TASK-021: Request Detail & Accept/Reject
**Files affected:**
- `app/(master)/request/[id].tsx`, `services/orders.ts`

**Work:**
- Full order detail: photos, voice playback, description, customer address
- Two large buttons: "Qabul qilish" (Accept) / "Rad etish" (Reject) with confirmation dialog
- Accept → update `orders.master_id = uid`, `status = 'accepted'`
- Reject → navigate back (master does not reject in DB, just ignores)

**Acceptance Criteria:**
- Confirmation dialog appears before accepting
- After accept, order disappears from the pending feed and appears in master's "My Orders"
- `orders.master_id` and `orders.status` updated correctly in DB after accept

---

### TASK-022: Master Order Status Update
**Files affected:**
- `app/(master)/my-orders.tsx`, `app/(master)/order/[id].tsx`
- `services/orders.ts`

**Work:**
- My Orders list: active / completed tabs
- Order detail for master: single large status-update button that advances status
  - Accepted → "Yo'lda" (On the Way) → "Yetib keldim" (Arrived) → "Bajardim" (Done)
- Each transition updates `orders.status` and `orders.updated_at`

**Acceptance Criteria:**
- Button label changes correctly at each status step
- After "Done", order moves to completed tab
- Status changes reflected immediately in customer's order detail screen (optimistic update)
- Cannot go backwards in status

---

### TASK-023: Master Earnings Screen
**Files affected:**
- `app/(master)/earnings.tsx`, `hooks/useEarnings.ts`

**Work:**
- Summary cards: total completed orders, this month count, total agreed price sum
- List of completed orders with price and date
- Data from React Query (query `orders` where `master_id = uid` and `status = 'completed'`)

**Acceptance Criteria:**
- Summary counts match the actual DB records
- If `price_agreed` is null (not set), row shows `"Kelishilmagan"` (No price set)
- Empty state shows when no completed orders

---

## Phase 5 — Profiles & Browse Masters

### TASK-024: Master Public Profile Screen
**Files affected:**
- `app/(customer)/masters/[id].tsx`, `services/masters.ts`

**Work:**
- Avatar, full name, rating (stars), review count, skills chips, bio
- List of recent reviews (last 5)
- "Qo'ng'iroq qilish" (Call) button → `tel://` deep link

**Acceptance Criteria:**
- Profile loads from `profiles` + `master_profiles` join
- Rating stars render correctly for fractional values (e.g., 4.3 stars)
- Call button opens native dialer
- Reviews section hidden if review count is 0

---

### TASK-025: Browse Masters Screen
**Files affected:**
- `app/(customer)/masters/index.tsx`, `hooks/useMasters.ts`

**Work:**
- Filter bar: category chips at top
- `FlatList` of master cards: avatar, name, rating, skills, distance
- Sorted by rating descending by default
- Filter by selected category: query `master_profiles` where `skills ⊇ [categoryId]`

**Acceptance Criteria:**
- All active masters appear in list
- Selecting a category chip filters list correctly
- Distance shown only if customer has location permission granted
- Tapping a card navigates to master profile

---

### TASK-026: Master Self-Profile Editor
**Files affected:**
- `app/(master)/profile.tsx`, `services/profiles.ts`

**Work:**
- Edit name, avatar, bio, experience years
- Multi-select skill categories
- Availability toggle (switch): goes available/unavailable for new requests
- Save → upsert `profiles` and `master_profiles`

**Acceptance Criteria:**
- All fields pre-filled with existing data on load
- Avatar can be changed and new URL saved
- Toggling availability updates `master_profiles.is_available` in DB
- Save shows loading state; success shows Uzbek toast

---

### TASK-027: Rating & Review Submission
**Files affected:**
- `app/(customer)/order/[id].tsx` (add review section), `services/reviews.ts`

**Work:**
- After order `status = 'completed'`: show star rating widget + optional comment
- Submit → insert into `reviews`, trigger DB function to recalculate `master_profiles.rating`
- DB function: `UPDATE master_profiles SET rating = AVG(reviews.rating) WHERE master_id = NEW.master_id`

**Acceptance Criteria:**
- Review form only visible when order is completed and no review exists yet
- Submitting review inserts correct row in `reviews` table
- `master_profiles.rating` updated within 1 second (DB trigger)
- After submission, form is replaced with "Bahoyingiz qabul qilindi" (Review received)

---

## Phase 6 — Chat & Realtime

### TASK-028: Chat Screen UI
**Files affected:**
- `app/(customer)/order/[id]/chat.tsx` (or shared route), `components/ChatBubble.tsx`

**Work:**
- `FlatList` of messages, inverted, newest at bottom
- `ChatBubble`: sender/receiver aligned left/right, timestamp, read status dot
- Text input + send button at bottom
- Image attachment picker button

**Acceptance Criteria:**
- Messages render with correct alignment for sender vs. receiver
- Input clears after send
- Keyboard avoidance works (message list scrolls above keyboard)
- Tapping image attachment opens picker

---

### TASK-029: Chat — Send & Receive Messages
**Files affected:**
- `services/chat.ts`, `hooks/useMessages.ts`

**Work:**
- `useMessages(orderId)`: React Query fetch of messages, sorted by `created_at`
- Send text: insert into `messages` table
- Send image: upload to `order-photos`, insert row with `type = 'image'`, `media_url`
- Optimistic update: message appears immediately before DB confirms

**Acceptance Criteria:**
- Sent message appears instantly (optimistic) then confirmed from DB
- Received image opens in full-screen viewer on tap
- Both customer and master can send/receive in the same order chat

---

### TASK-030: Realtime — Chat Messages Subscription
**Files affected:**
- `hooks/useMessages.ts` (add realtime)

**Work:**
- Subscribe to `messages` table changes for `order_id = current`
- On INSERT → append message to React Query cache
- Cleanup subscription on unmount
- Show unread badge on chat button in order detail screen

**Acceptance Criteria:**
- Message sent from master appears on customer's screen without refresh (and vice versa)
- Subscription cleaned up when navigating away (no memory leaks)
- Unread badge count is accurate

---

### TASK-031: Realtime — Order Status Changes
**Files affected:**
- `hooks/useOrder.ts` (add realtime), `hooks/usePendingRequests.ts`

**Work:**
- Customer: subscribe to `orders` row change for their order → timeline updates live
- Master: subscribe to new `pending` orders → feed auto-refreshes
- On new request matching master's skills → row appears at top of feed

**Acceptance Criteria:**
- Master accepting order causes customer's status timeline to update in <2 seconds
- New matching request appears in master feed without manual refresh
- Stale subscriptions do not fire after user signs out

---

## Phase 7 — Push Notifications

### TASK-032: Push Token Registration
**Files affected:**
- `hooks/usePushNotifications.ts`, `services/profiles.ts`

**Work:**
- On login: call `Notifications.getExpoPushTokenAsync()`
- Request permission; if denied, skip gracefully
- Store token in `profiles.push_token` field (add column to migration)
- Re-register token on each app launch (token can change)

**Acceptance Criteria:**
- `profiles.push_token` updated in DB after login on a real device
- No crash if user denies notification permission
- Token updates if the device token changes

---

### TASK-033: Supabase Edge Function — Notify Masters on New Order
**Files affected:**
- `supabase/functions/notify-on-new-order/index.ts`

**Work:**
- Triggered via Supabase Webhook on `INSERT` into `orders`
- Query masters whose `skills ⊇ [order.category_id]` and `is_available = true`
- Send Expo push notifications to all matching masters
- Use Expo Push API (`https://exp.host/--/api/v2/push/send`)

**Acceptance Criteria:**
- Function deploys via `supabase functions deploy`
- Inserting a test order triggers notification on a master's real device
- Masters with non-matching skills do NOT receive the notification

---

### TASK-034: Supabase Edge Function — Notify Customer on Status Change
**Files affected:**
- `supabase/functions/notify-on-status-change/index.ts`

**Work:**
- Triggered via Webhook on `UPDATE` of `orders.status`
- Compose Uzbek notification message per status:
  - `accepted` → "Ustangiz so'rovingizni qabul qildi!"
  - `on_the_way` → "Usta yo'lda!"
  - `arrived` → "Usta yetib keldi!"
  - `completed` → "Ish bajarildi! Baholang."
- Send to `customer.push_token`

**Acceptance Criteria:**
- Each status transition sends correct Uzbek notification to customer
- No notification sent if `customer.push_token` is null
- Function logs are viewable in Supabase dashboard

---

### TASK-035: Notification Deep Linking
**Files affected:**
- `app/_layout.tsx`, `hooks/usePushNotifications.ts`

**Work:**
- Handle `Notifications.addNotificationResponseReceivedListener`
- Parse `data.orderId` from notification payload
- Navigate to `/(customer)/order/[orderId]` or `/(master)/order/[orderId]` based on role

**Acceptance Criteria:**
- Tapping a push notification opens correct order screen even if app was closed
- Tapping notification when app is in foreground navigates without restarting app
- Works for both customer and master roles

---

## Phase 8 — Polish & Deployment

### TASK-036: Loading Skeletons for All List Screens
**Files affected:**
- `components/ui/Skeleton.tsx`
- `app/(customer)/orders.tsx`, `app/(customer)/masters/index.tsx`, `app/(master)/index.tsx`

**Work:**
- `Skeleton` component: animated shimmer rectangle with configurable size
- Replace all "loading…" text spinners with skeleton cards matching real card shape

**Acceptance Criteria:**
- Skeleton renders for the duration of data fetch (not longer, not shorter)
- Skeleton shape closely matches real card layout
- No layout shift when real data replaces skeleton

---

### TASK-037: Empty States & Error States
**Files affected:**
- `components/ui/EmptyState.tsx`, `components/ui/ErrorState.tsx`
- Applied to: orders list, masters list, chat, requests feed

**Work:**
- `EmptyState`: illustration (use a simple emoji/SVG), Uzbek message, optional CTA button
- `ErrorState`: error icon, Uzbek message, retry button that calls `refetch()`

**Acceptance Criteria:**
- Every list screen has a unique empty state message in Uzbek
- `ErrorState` retry button successfully re-fetches data
- No raw English error text visible to users

---

### TASK-038: Offline Banner
**Files affected:**
- `components/ui/OfflineBanner.tsx`, `app/_layout.tsx`

**Work:**
- Install `@react-native-community/netinfo`
- Show animated banner: `"Internet aloqasi yo'q"` when offline
- Banner dismisses automatically when connection restored

**Acceptance Criteria:**
- Banner appears within 1 second of going offline
- Banner disappears within 2 seconds of connection being restored
- Offline state does not crash any screen (React Query serves cached data)

---

### TASK-039: EAS Build Configuration
**Files affected:**
- `eas.json`, `app.json`

**Work:**
- Configure `eas.json` with `development`, `preview`, `production` profiles
- Set `android.package` and `ios.bundleIdentifier` in `app.json`
- Add environment variable groups in EAS dashboard
- Generate Android keystore; set up iOS provisioning (if applicable)

**Acceptance Criteria:**
- `eas build --platform android --profile preview` produces a working `.apk`
- APK installs on a physical Android device without errors
- App reads Supabase keys from EAS env vars (not hardcoded)

---

### TASK-040: App Store Metadata & Privacy
**Files affected:**
- `app.json` (permissions descriptions), `assets/privacy-policy.html`

**Work:**
- Add `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSLocationWhenInUseUsageDescription` in `app.json`
- Add `android.permissions` array
- Create minimal privacy policy HTML page (static, linkable from store listing)

**Acceptance Criteria:**
- App does not crash on iOS when requesting camera/mic/location (permission strings present)
- Privacy policy URL is accessible in a browser
- `eas submit` pre-flight check passes without metadata errors

---

## Task Summary

| Phase | Tasks | Count |
|---|---|---|
| 1 — Setup | TASK-001 to TASK-008 | 8 |
| 2 — Auth | TASK-009 to TASK-013 | 5 |
| 3 — Customer Flow | TASK-014 to TASK-019 | 6 |
| 4 — Master Flow | TASK-020 to TASK-023 | 4 |
| 5 — Profiles & Browse | TASK-024 to TASK-027 | 4 |
| 6 — Chat & Realtime | TASK-028 to TASK-031 | 4 |
| 7 — Push Notifications | TASK-032 to TASK-035 | 4 |
| 8 — Polish & Deploy | TASK-036 to TASK-040 | 5 |
| **Total** | | **40 tasks** |
