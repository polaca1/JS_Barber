---
name: Heritage & Steel
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#c8c6c5'
  on-tertiary: '#303030'
  tertiary-container: '#a7a5a5'
  on-tertiary-container: '#3b3b3b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is crafted for a premium, masculine grooming experience. It blends **Modern Minimalism** with **Editorial Sophistication**, evoking the atmosphere of a high-end, contemporary apothecary. The aesthetic is intentionally "dark mode" first, utilizing deep charcoals and aged bronze to create a sense of exclusivity and quiet luxury.

The target audience expects precision and professionalism. Therefore, the UI avoids trendy flourishes like glassmorphism or heavy gradients in favor of structural integrity, razor-sharp alignment, and high-contrast typography. The emotional response should be one of confidence, heritage, and meticulous attention to detail.

## Colors
The palette is rooted in a "Noir" foundation. 
- **Primary (#C5A059):** An aged bronze/gold used exclusively for calls to action, active states, and premium accents. It should be used sparingly to maintain its impact.
- **Surface Layering:** The background is a true black (#0A0A0A). Secondary surfaces use #141414 to create subtle depth without breaking the dark immersion.
- **Borders:** A muted charcoal (#262626) provides structural definition for cards and dividers.
- **Typography:** Pure white is avoided to reduce eye strain; #EDEDED is used for primary headers, while #A1A1A1 serves secondary metadata.

## Typography
This design system employs a high-contrast typographic pairing to signal both "Heritage" and "Utility."

- **Playfair Display:** Used for all primary headings. It provides the "editorial" feel of a luxury magazine. Use it in large scales with tight letter-spacing for a bold, masculine impact.
- **Inter:** Used for all functional text, body copy, and navigation. It offers a technical, clean counterpoint to the serif headings.
- **Labeling:** All small labels and buttons should use Inter in Semi-Bold with uppercase styling and slight letter-spacing to ensure legibility against dark backgrounds.

## Layout & Spacing
The system follows a strict **4px grid**. All padding, margins, and component heights must be multiples of 4. 

- **Grid:** A 12-column fixed grid for desktop (max-width 1200px) and a fluid 4-column grid for mobile.
- **Rhythm:** Use "lg" (24px) for internal container padding and "xl" (40px) for vertical section spacing. 
- **Alignment:** Content should feel structured and architectural. Avoid centered text for long-form content; maintain left-alignment to reinforce the professional, technical tone.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** rather than traditional shadows. 
- **Level 0 (Background):** #0A0A0A (Canvas).
- **Level 1 (Cards/Surfaces):** #141414.
- **Level 2 (Popovers/Modals):** #1C1C1C with a 1px border of #262626.
- **Active State:** Elements may use a subtle 1px border of #C5A059 to indicate focus. 

Shadows are used only for high-level overlays (modals) and should be "Sharp & Heavy" (e.g., 20% opacity black with 12px blur, no offset) to maintain a grounded, physical feel.

## Shapes
The design system utilizes a **Soft (0.25rem)** roundedness level. This subtle rounding prevents the UI from feeling overly aggressive or "brutalist" while maintaining a sharp, precision-cut look reminiscent of professional tools.

- **Standard Elements:** 4px (0.25rem) radius for buttons and inputs.
- **Cards:** 8px (0.5rem) radius to define larger content blocks.
- **Interactive Elements:** Active indicators (pill-tabs) may use a full rounded-pill shape for high contrast against the otherwise rectilinear grid.

## Components
- **Buttons:** Primary buttons use a solid #C5A059 background with #0A0A0A text (Inter, Bold, Uppercase). Secondary buttons use a 1px border of #262626 with #EDEDED text.
- **Cards:** Use surface #141414. Padding is strictly 24px. No shadows; separation is achieved via the background color contrast and 1px borders.
- **Inputs:** Fields are dark (#0A0A0A) with a 1px border of #262626. On focus, the border changes to #C5A059. Label text is always Inter 12px Uppercase.
- **Chips:** Small, rectangular tags with 4px radius, using a #262626 background and #A1A1A1 text for service categories (e.g., "HAIRCUT", "SHAVE").
- **Lists:** Use subtle #262626 horizontal dividers (1px height). Ensure generous vertical padding (16px) between list items for a premium, uncrowded feel.
- **Service Menu:** Use Playfair Display for service titles and Inter for pricing to create a clear hierarchy between the "Experience" and the "Transaction."