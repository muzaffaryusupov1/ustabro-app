# Design System Strategy: The Tactile Artisan

## 1. Overview & Creative North Star

**Creative North Star: "Tactile Clarity"**

This design system is engineered to bridge the gap between high-end editorial digital experiences and the rugged, practical world of manual labor. For the users in provincial Uzbekistan, technology should not be a barrier; it should be a reliable tool, as familiar and sturdy as a well-made wrench.

We move beyond the "generic marketplace" look by embracing **Tactile Clarity**. This means every element feels physically present. We achieve this through "The Layering Principle"—replacing thin, fragile lines with robust tonal changes and generous white space. The result is an interface that feels expansive, trustworthy, and authoritative, ensuring even the most non-tech-savvy user feels in total control.

---

## 2. Colors: Tonal Architecture

The palette is rooted in a "Fresh Green" that symbolizes growth and reliability, supported by a sophisticated "Blue-Gray" that adds a layer of professional calm.

### The Color Tokens

* **Primary:** `primary` (#006b32) – The color of action and trust.
* **Surface:** `surface` (#f8f9fa) – Our canvas.
* **On-Surface:** `on_surface` (#191c1d) – High-contrast readability.
* **Secondary:** `secondary` (#4b6172) – The accent of stability.

### The "No-Line" Rule

Standard UI relies on 1px borders to separate content. In this system, **1px solid borders are prohibited.** Boundaries must be defined by background color shifts.
* **Example:** A card (`surface_container_lowest`) sitting on a background (`surface`). The transition of the color itself defines the edge, creating a cleaner, more premium aesthetic that reduces visual noise for the user.

### Surface Hierarchy & Nesting

Treat the UI as a series of stacked physical layers. Use the `surface_container` tiers to create depth:

1. **Base Layer:** `surface` (#f8f9fa)
2. **Section Layer:** `surface_container_low` (#f3f4f5)
3. **Content Card Layer:** `surface_container_lowest` (#ffffff)

### The "Signature Texture" Rule

To avoid a "flat" feel, use a subtle linear gradient for main CTAs:
* **CTA Background:** Linear gradient from `primary` (#006b32) to `primary_container` (#008740). This adds a "soul" to the button, making it feel pressurized and ready to be pressed.

---

## 3. Typography: The Editorial Voice

We utilize **Plus Jakarta Sans** for its geometric clarity and generous x-height, which is essential for the legibility of the Uzbek Latin script (handling characters like `o‘`, `g‘`, and `sh` with ease).

* **Display (Large/Medium):** Used for "Hero" moments or high-impact welcomes. It establishes an authoritative tone.
* **Headline (Small/Medium):** Your primary navigational markers. Bold and unavoidable.
* **Body (Large/Medium):** The workhorse. Always use `body-lg` for descriptive text to ensure those with aging eyesight can read service descriptions without strain.
* **Label:** Used sparingly for metadata.

**Typographic Intent:** We favor a "Header-Heavy" layout. If a screen feels empty, increase the typography scale rather than adding decorative elements. High-contrast typography is our primary decorative tool.

---

## 4. Elevation & Depth: Tonal Layering

Instead of traditional drop shadows which can feel "muddy," we use light and tone to convey importance.

### The Layering Principle

Depth is achieved by "stacking." A `surface_container_lowest` card placed on a `surface_container_low` background creates a natural, soft lift. This mimics fine paper layering.

### Ambient Shadows

Where floating elements (like a "Request Service" FAB) are required:
* **Shadow Color:** Use a tinted version of `on_surface` at 6% opacity.
* **Blur:** Extra-diffused (e.g., 20px-30px blur).
* **The Result:** A shadow that looks like ambient light in a room, not a digital effect.

### Glassmorphism & Depth

For the Bottom Tab Bar, use a `surface` color with 80% opacity and a `backdrop-blur` of 12px. This allows the content to scroll "under" the navigation, maintaining a sense of place and preventing the UI from feeling claustrophobic.

---

## 5. Components: The Artisan’s Toolbox

### The Primary Action Block (Buttons)
* **Structure:** Extremely large height (min 64px) with `xl` (1.5rem) roundedness.
* **Typography:** `title-md` or `title-lg` for the label.
* **States:** Default uses the "Signature Texture" gradient. Pressed state shifts to `primary_fixed_dim`.

### The Handyman Card
* **Rule:** No dividers.
* **Structure:** `surface_container_lowest` background. Use `spacing.4` (1.4rem) for internal padding.
* **Separation:** Use `spacing.6` (2rem) between cards to allow the "Background Shift" to be clearly visible.

### Input Fields
* **Style:** Large, pill-shaped (`full` roundedness) or `xl`.
* **Background:** `surface_container_high`.
* **Interaction:** On focus, the background shifts to `surface_container_lowest` with a `ghost border` (outline-variant at 20% opacity).

### Floating "Trust" Chips
* **Context:** For ratings or "Verified" badges.
* **Color:** `secondary_container` with `on_secondary_container` text. This soft blue-gray provides a "calm" verification that doesn't compete with the green action buttons.

---

## 6. Do’s and Don’ts

### Do:
* **Do** use the Spacing Scale religiously. Consistent gaps (e.g., always `spacing.4` for margins) create an invisible grid that users subconsciously trust.
* **Do** use bold, line-based iconography with a stroke weight of 2px to match the weight of the `body-lg` text.
* **Do** prioritize "One Action Per Screen." Large buttons and large text require space; don't crowd the artisan’s workspace.

### Don't:
* **Don't** use 1px dividers to separate list items. Use a `surface-container-low` background on the even-numbered items or simply use `spacing.3` of vertical white space.
* **Don't** use pure black (#000000) for text. Always use `on_surface` to keep the editorial feel soft and premium.
* **Don't** use small touch targets. Every interactive element must be at least 48px tall, ideally 56px-64px for primary actions.
