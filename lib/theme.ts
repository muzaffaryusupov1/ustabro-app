/**
 * UstaBro Design System — "Tactile Clarity"
 *
 * Based on DESIGN.md: green primary, tonal layering, no 1px borders,
 * Plus Jakarta Sans, generous sizing.
 */

// ─── Colors ──────────────────────────────────────────────
export const colors = {
  // Primary
  primary: "#006B32",
  primaryContainer: "#008740",
  primaryFixedDim: "#005A2A",

  // Secondary (blue-gray accent)
  secondary: "#4B6172",
  secondaryContainer: "#D3E4F1",
  onSecondaryContainer: "#0A1E2D",

  // Surface hierarchy (light → dark layering)
  surface: "#F8F9FA",
  surfaceContainerLow: "#F3F4F5",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerHigh: "#EDEEF0",

  // Text
  onSurface: "#191C1D",
  onSurfaceVariant: "#44474A",
  onSurfaceMuted: "#74777A",
  onSurfacePlaceholder: "#9A9D9F",

  // On primary
  onPrimary: "#FFFFFF",

  // Status
  statusPendingBg: "#FEF3C7",
  statusPendingText: "#92400E",
  statusAcceptedBg: "#DBEAFE",
  statusAcceptedText: "#1E40AF",
  statusOnTheWayBg: "#E0E7FF",
  statusOnTheWayText: "#3730A3",
  statusArrivedBg: "#D1FAE5",
  statusArrivedText: "#065F46",
  statusCompletedBg: "#D1FAE5",
  statusCompletedText: "#065F46",
  statusCancelledBg: "#FEE2E2",
  statusCancelledText: "#991B1B",

  // Misc
  error: "#BA1A1A",
  outline: "#C4C6C8",
  outlineVariant: "#C4C6C820", // 20% opacity for ghost borders
} as const;

// ─── Typography ──────────────────────────────────────────
export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

export const typography = {
  displayLg: { fontFamily: fonts.extraBold, fontSize: 36, lineHeight: 44 },
  displayMd: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36 },
  headlineMd: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32 },
  headlineSm: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28 },
  titleLg: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 26 },
  titleMd: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
  bodyLg: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 },
  labelLg: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
  labelMd: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
} as const;

// ─── Spacing ─────────────────────────────────────────────
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,   // ~1.4rem — card internal padding
  5: 20,
  6: 24,   // ~2rem — screen padding, between cards
  7: 28,
  8: 32,
} as const;

// ─── Radii ───────────────────────────────────────────────
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,    // buttons, cards
  full: 9999, // pill inputs, chips
} as const;

// ─── Shadows (ambient, tinted) ───────────────────────────
export const shadows = {
  ambient: {
    shadowColor: "#191C1D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
} as const;
