---
name: Monochrome Velocity
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1c'
  surface-container: '#202020'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d1c5ad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#303030'
  outline: '#9a9079'
  outline-variant: '#4d4633'
  surface-tint: '#eec224'
  primary: '#ffd341'
  on-primary: '#3c2f00'
  primary-container: '#e2b714'
  on-primary-container: '#5c4900'
  inverse-primary: '#735c00'
  secondary: '#c8c7bc'
  on-secondary: '#303129'
  secondary-container: '#4b4c44'
  on-secondary-container: '#bdbcb1'
  tertiary: '#b7dbff'
  on-tertiary: '#003351'
  tertiary-container: '#79c2ff'
  on-tertiary-container: '#004f7a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe087'
  primary-fixed-dim: '#eec224'
  on-primary-fixed: '#231a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e4e3d8'
  secondary-fixed-dim: '#c8c7bc'
  on-secondary-fixed: '#1b1c15'
  on-secondary-fixed-variant: '#47473f'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
  sub-text: '#646669'
  surface-medium: '#323437'
  error-red: '#ca4754'
typography:
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Lexend
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Lexend
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
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
  lg: 32px
  xl: 64px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is centered around high-focus productivity and rhythmic precision. It caters to a technical audience that values performance, minimalism, and a "zen-like" state of flow. The aesthetic is rooted in **Modern Minimalism** with a hint of **Technical Brutalism**, stripping away all unnecessary embellishments to ensure the content remains the sole focus.

The emotional response should be one of calm focus. By using a dark, low-contrast foundation paired with a singular, high-energy accent, the interface guides the eye naturally to active tasks without causing visual fatigue. The style emphasizes clean lines, generous negative space, and a clear distinction between "static information" and "active interaction."

## Colors

The palette is designed for deep-focus environments. The primary background (`#1e1e1e`) provides a "near-black" canvas that minimizes screen glare. 

- **Primary (#e2b714):** Reserved strictly for active states, highlights, and primary calls to action. It acts as the "energy" of the interface.
- **Secondary (#d1d0c5):** Used for "correct" states or high-priority labels that require clarity without the intensity of the primary gold.
- **Sub-text (#646669):** The workhorse for all inactive or non-critical information. It sits quietly in the background.
- **Surface Medium (#323437):** Used for subtle UI separation, such as input fields or card backgrounds, providing just enough contrast against the primary neutral.

## Typography

This design system uses a dual-font strategy. **Lexend** provides high readability and a friendly, modern feel for UI elements and descriptive text. **JetBrains Mono** is utilized for any data-heavy, typing, or technical displays, emphasizing precision and structure.

For the core experience (e.g., typing areas or code blocks), use `data-display` with increased letter-spacing to ensure individual characters are distinct. All mono-spaced labels should be treated as functional UI components, while Lexend headlines handle the information hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain a tight, focused column of information, while transitioning to a **Fluid Grid** for mobile devices. 

- **Desktop:** Centralized container (max 1200px) with content often grouped in the vertical center of the viewport to keep the user's eye focused.
- **Mobile:** 4-column layout with 16px margins.
- **Rhythm:** An 8px base grid is used for all internal component spacing, while 32px/64px units are used to separate major sections. 

Vertical spacing is intentionally generous to prevent the "cluttered" feeling often found in data-heavy applications.

## Elevation & Depth

This system avoids traditional shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**. 

Depth is communicated through color stepping:
- **Level 0 (Background):** `#1e1e1e` — The base surface.
- **Level 1 (Cards/Inputs):** `#252525` or a 1px border of `#323437`.
- **Level 2 (Popovers/Modals):** `#323437` with a subtle 2px solid border of the primary color (`#e2b714`) to denote focus.

Interactive elements do not "lift" off the page; instead, they change color or gain a border, maintaining a flat, high-performance aesthetic.

## Shapes

The shape language is "Soft" (`0.25rem`). This provides a subtle modern touch without feeling overly "bubbly" or organic. It maintains the technical, precise nature of the system. 

Buttons and input fields should use the standard rounded corner, while the "Caret" or active cursor should remain a sharp, vertical rectangle to maximize visibility and the feeling of precision.

## Components

### Buttons
- **Primary:** No background, `#e2b714` text, transparent border. On hover, background becomes `#e2b714` with `#1e1e1e` text.
- **Secondary:** `#646669` text. On hover, text becomes `#d1d0c5`.

### Input Fields
- Understated styling. Use a simple bottom border or a subtle `#323437` background. Focus state is indicated by the primary accent color.

### Cards
- Use for grouping stats or settings. Background is slightly lighter than the main page (`#252525`) with no shadow.

### The Caret (Active Indicator)
- A 2px wide vertical bar using the primary accent color (`#e2b714`). For a "smooth" feel, implement a 100ms transition on its movement.

### Chips/Tags
- Small, uppercase `label-caps` text. Background `#323437` with `#646669` text. For active filters, use `#e2b714` text.

### Lists
- Clean rows with 1px `#323437` separators. High horizontal padding to maintain the "breathable" feel.