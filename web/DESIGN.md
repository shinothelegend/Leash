# Leash UI Design System

**Goal:** Establish concrete design constraints to prevent "AI slop" (ungeneric blue/purple gradients, Inter-on-Inter typography, 24px corner radii everywhere, pure #000 backgrounds).

## 1. Typography
- **Display / Heading Font:** Space Grotesk (Techy, confident, fintech/security edge)
- **Body / Data Font:** Inter (Reserved *strictly* for body text and tables for its superior tabular numbers)
- *Rule:* Never use Inter at weight 700 for headings. Let the display font and size carry the hierarchy.

## 2. Color Palette (OKLCH)
Avoid pure `#000` (which causes OLED smudging and kills elevation) and generic cyan/purple pairings.
- **Surface 0 (App Background):** `oklch(0.16 0.02 265)` (~ `#0B0E13` deep navy-gray)
- **Surface 1 (Cards):** `oklch(0.19 0.02 265)`
- **Surface 2 (Menus/Popovers):** `oklch(0.23 0.025 265)`
- **Accent Primary (Brand Blue):** `oklch(0.70 0.13 250)` (desaturated slightly for dark mode)
- **Accent Secondary (Brand Pink):** `oklch(0.62 0.19 28)`
- **Border Subtle:** `color-mix(in oklch, white 8%, var(--surface-1))`

## 3. Borders & Corner Radius
- **Cards/Panels:** `12px` (restrained, no default 24px)
- **Pills/Tags:** `999px` (only where semantically a pill)
- **Borders:** Borderless-first for cards. Use subtle `color-mix` borders when needed, avoiding 1px gray borders on every element.

## 4. Depth & Texture (Dark Mode)
- **Elevation:** Driven by surface lightness ramps + soft stacked box-shadows. Shadows alone are invisible on dark.
- **Glassmorphism:** Use `backdrop-filter: blur(16px) saturate(180%)`. Limit to 5-8 elements per page for performance.
- **Texture:** Apply an inline SVG `feTurbulence` grain overlay at low opacity to break up banding and add a premium "rendered" feel.

## 5. Motion
- **Scroll:** `lenis` for smooth inertial scrolling.
- **Reveals:** `framer-motion` staggered `whileInView` reveals.
- **Transitions:** `app/template.tsx` remounts for enter animations.
- **Hero/Scrub:** `gsap` + `ScrollTrigger` for complex pinned storytelling.
- *Rule:* ALL motion and transparency must respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
