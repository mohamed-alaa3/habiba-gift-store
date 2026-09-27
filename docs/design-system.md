# Habiba — Design System

Source of truth for visual identity across the store.

## Brand Assets

- Logo: frontend/src/assets/logo/habiba-logo.png
- Favicon: derived from logo icon (square)
- Dark-mode variant: frontend/src/assets/logo/habiba-logo-dark.png (to be provided later)

## Brand Colors

Extracted from the logo:

| Token | Value | Usage |
|---|---|---|
| --brand-primary | #F58220 | Primary CTAs, links, active states, "STORE" wordmark |
| --brand-primary-hover | #E0700E | Hover state for primary CTAs |
| --brand-ink | #2E2E2E | Body text, headings, "Habiba" wordmark, borders |
| --brand-bg-light | #FFFFFF | Page background (light mode) |
| --brand-bg-dark | #1A1A1A | Page background (dark mode) |

Supporting semantic tokens will be defined in frontend/src/styles/_variables.scss.

## Typography

Not yet finalized. Will be selected during the frontend phase.
Suggested pairings:
- Headings: a bold geometric sans (e.g. Poppins, Inter, or similar) that matches the logo wordmark.
- Body: a clean readable sans (e.g. Inter, IBM Plex Sans).

Arabic requires a compatible Arabic font (e.g. Cairo, Tajawal, IBM Plex Sans Arabic).

## Logo Usage Rules

- Do NOT redesign or modify the original logo file.
- Do NOT generate an alternative logo.
- Use the uploaded PNG as-is.
- For dark mode, if the logo's dark frame is not visible on the dark background,
  use a "pill" container with background: var(--brand-bg-light) around the logo
  (temporary solution) until an official dark variant is provided.
- The icon (without the wordmark) is used for:
  - Favicon
  - Cart drawer header
  - Loading screens
  - Mobile compact header

## Language & Direction

- English -> dir="ltr"
- Arabic -> dir="rtl"
- All CSS must use logical properties (margin-inline, padding-inline,
  inset-inline, border-start, border-end) instead of physical
  (margin-left, padding-right, etc.).

## Modes

- Light mode and dark mode are both first-class.
- Implemented via CSS variables, not duplicated styles.
- User choice persisted in localStorage.

## Files

- Frontend tokens: frontend/src/styles/_variables.scss
- Themes: frontend/src/styles/_themes.scss
- RTL helpers: frontend/src/styles/_rtl.scss