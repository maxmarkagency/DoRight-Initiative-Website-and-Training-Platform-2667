---
name: DoRight Foundation
description: Bold, dignified institutional brand for a community-rooted foundation — black-and-gold authority, not charity-cliché or SaaS gloss.
colors:
  ink-authority: "#0D0E16"
  civic-gold: "#FFC107"
  neutral-surface: "#FAFAFA"
  neutral-surface-alt: "#F5F5F5"
  neutral-border: "#E5E5E5"
  neutral-muted: "#666666"
  neutral-dark-surface: "#1A1A1A"
  success: "#16A34A"
  danger: "#DC2626"
  warning: "#FFC107"
  info: "#17A2B8"
typography:
  display:
    fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  md: "12px"
  lg: "20px"
  full: "9999px"
spacing:
  container: "1200px"
  section-y-sm: "3rem"
  section-y-lg: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.civic-gold}"
    textColor: "{colors.ink-authority}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.civic-gold}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  nav-link-active:
    textColor: "{colors.civic-gold}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: DoRight Foundation

## 1. Overview

**Creative North Star: "The Civic Standard-Bearer"**

DoRight reads as an institution that sets the bar for its sector, not one asking for sympathy. The palette is black and gold: near-black as the seat of authority, gold as the mark of distinction earned rather than decorated with. Where charity-sector design defaults to soft pastels and pleading, and startup design defaults to gradients and gloss, this system commits to high-contrast confidence — an organization that has already arrived, not one still trying to convince you it's legitimate.

This system explicitly rejects the generic startup/SaaS look (gradient heroes, rounded-card grids, "trusted by" logo strips performing credibility it hasn't earned) and the generic government/bureaucratic look (dense, dry, form-heavy pages with no visual identity). It also rejects the generic NGO default of stock-photo sentimentality and guilt-driven asks — dignity and ambition over charity-cliché, per PRODUCT.md.

The current codebase does not yet fully live up to this doctrine — the homepage in particular still carries an animated gradient hero, a hero-metric stat row, and side-stripe borders on section headings, all patterns this system is moving away from (see Do's and Don'ts). DESIGN.md documents the target system; existing pages should migrate toward it over time, not be read as the standard to replicate.

**Key Characteristics:**
- Near-black authority + earned gold, not soft neutrals or gradients
- Solid, deliberate components — full-color fills and clear borders, not tentative or overly soft
- Flat by default; shadows appear only for genuine state changes, not as ambient texture
- Poppins headings paired with Inter body — a geometric/humanist contrast, not two similar sans-serifs
- Generous, consistent 20px radius as the system's signature shape

## 2. Colors

The palette is deliberately narrow: one near-black authority tone, one gold that is used sparingly enough to stay earned rather than decorative, and a quiet neutral scale underneath both.

### Primary
- **Ink Authority** (#0D0E16): The institutional base. Used as the header, footer, and hero background, and as the default body-text color on light surfaces. This is the "we are the institution" color, not a decorative dark mode.

### Secondary
- **Civic Gold** (#FFC107): The single accent, reserved for primary CTAs, active nav states, icon highlights, and the focus ring. Its rarity is what keeps it feeling earned — if gold starts appearing on more than a small fraction of any given screen, it has stopped being a mark of distinction and started being decoration.

### Neutral
- **Neutral Surface** (#FAFAFA): Default light page background.
- **Neutral Surface Alt** (#F5F5F5): Secondary light surface, subtle differentiation from the page background (alternating sections, table stripes).
- **Neutral Border** (#E5E5E5): Dividers, card borders, input borders on light surfaces.
- **Neutral Muted** (#666666): Secondary/supporting text on light surfaces — captions, metadata, timestamps.
- **Neutral Dark Surface** (#1A1A1A): The secondary dark tone alongside Ink Authority — dropdown menus, mobile nav panels, dark-surface cards.
- Full grayscale ladder available at 50/100/200/300/400/500/600/700/800/900 for finer steps than the five named above; use the named roles first and drop to a raw step only when none of them fit.

### Feedback
- **Success** (#16A34A), **Danger** (#DC2626), **Info** (#17A2B8): Standard semantic feedback colors, used only for system status (form validation, alerts), never as decorative accents.
- **Warning** (#FFC107): Note — this is the identical hex value to Civic Gold, defined as a separate semantic role in the existing Tailwind config. Because of that overlap, a "warning" treatment and a "gold accent" treatment can look identical; when building a warning state, pair the color with an icon or label, not color alone, so the two roles stay distinguishable.

### Named Rules
**The One Gold Rule.** Civic Gold is a mark of distinction, not a coat of paint. If more than one element per screen section is gold, it has stopped signaling anything.

## 3. Typography

**Display Font:** Poppins (with system-ui fallback)
**Body Font:** Inter (with system-ui fallback)

**Character:** Poppins' geometric confidence carries headlines; Inter's humanist neutrality carries everything meant to be read at length. The pairing is a real contrast (geometric display + humanist body), not two similar sans-serifs standing in for each other.

### Hierarchy
- **Display** (700, 2.5rem/40px, 1.2 line-height, -0.02em tracking): Poppins. Page-level H1s.
- **Headline** (700, 2rem/32px, 1.3): Poppins. Section headings (H2).
- **Title** (600, 1.5rem/24px, 1.4): Poppins. Subsection headings (H3), card titles.
- **Body** (400, 1rem/16px, 1.6): Inter. Cap prose measure at 65–75ch; this is already the base body treatment in `index.css`.
- **Label** (500, 0.875rem/14px, 1.5): Inter. Nav items, buttons, form labels, metadata.

Responsive scaling currently steps through Tailwind breakpoint classes (`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl`) rather than fluid `clamp()`. Either approach is legitimate; if hero headings are revisited, prefer `clamp()` with a ≤6rem ceiling and a letter-spacing floor of ≥ -0.04em to avoid overflow at in-between viewport widths that the current fixed breakpoint steps can produce.

### Named Rules
**The Two-Voice Rule.** Exactly two families system-wide: Poppins for anything that announces, Inter for anything that's read. Never introduce a third family for "just this one section."

## 4. Elevation

Going forward, this system is flat by default: shadows are a response to real state (hover, focus, an open dropdown or modal), not ambient page texture. This is a deliberate shift from the current codebase, which uses `shadow-lg`/`shadow-xl` broadly as default decoration and backdrop-blur on the header and hero badges as a glass effect. That heavier treatment should be pared back over time rather than extended to new surfaces.

### Shadow Vocabulary
- **Resting** (no shadow): The default state for cards, sections, and containers.
- **Interactive-lift** (`box-shadow: 0 4px 12px rgba(13,14,22,0.15)`): Hover/focus state for cards and primary buttons only — a subtle lift, not a glow.
- **Overlay** (`box-shadow: 0 10px 40px rgba(13,14,22,0.25)`): Reserved for genuinely elevated surfaces — dropdown menus, modals, toasts.

### Named Rules
**The Flat-by-Default Rule.** A surface earns a shadow by doing something (opening, floating above content, responding to a hover) — it doesn't get one for existing. If a shadow is present on page load with no interaction behind it, remove it or justify it in review.

## 5. Components

Components should read as solid and deliberate: confident full-color fills, clear borders where a border is the right affordance, and restraint in decoration. Nothing tentative, nothing over-softened.

### Buttons
- **Shape:** 20px radius (`rounded-lg`), the system's signature corner treatment.
- **Primary:** Civic Gold fill, Ink Authority text, 16px/32px padding. Solid, not gradient-filled.
- **Hover / Focus:** A measurable shift (darken, not just an opacity fade) plus the interactive-lift shadow; focus state additionally gets a visible gold focus ring for keyboard users (already present as the global `*:focus` outline in `index.css`, keep it).
- **Secondary / Outline:** Transparent fill, Civic Gold border and text, inverts to solid gold-on-black on hover. Used for the fallback CTA (e.g. "Contact / partner inquiry" next to a primary "Explore programs").
- **Ghost / Nav-link:** No fill or border at rest; Civic Gold text on hover/active state only.

### Cards / Containers
- **Corner Style:** 20px radius (`rounded-lg`), matching buttons — one consistent radius across the system rather than a different one per component type.
- **Background:** Neutral Surface (#FAFAFA) on light sections, Neutral Dark Surface (#1A1A1A) on dark sections.
- **Shadow Strategy:** Resting by default per the Elevation doctrine above; Interactive-lift only if the card itself is clickable.
- **Border:** Neutral Border (#E5E5E5) on light cards where a border reads more intentional than a shadow.
- **Internal Padding:** 24px as the default.

### Navigation
- **Style:** Ink Authority background (currently `bg-black bg-opacity-80 backdrop-blur-md` — the blur here is functional, keeping nav legible over scrolling content, not decorative, so it's a legitimate exception to the flat-by-default doctrine).
- **Typography:** Label scale (Inter, 500 weight).
- **States:** White text at rest, Civic Gold on hover and on the active route.
- **Mobile:** Full-width dropdown panel in Neutral Dark Surface, same active/hover color logic as desktop.
- **Dropdown menus:** Neutral Dark Surface background, 12px radius (`rounded-md`), Overlay-level shadow (this is a genuinely elevated surface, so the heavier shadow is correct here, not a violation of Flat-by-Default).

### Badge / Pill
- **Style:** `rounded-full`, used for status tags and the hero "badge" pattern. The current hero badge (`bg-white/10 backdrop-blur-sm`) is a decorative glass effect on a non-functional element — this is the kind of glassmorphism-as-default this system should retire; a solid Neutral Dark Surface or Civic Gold pill communicates the same status without the glass treatment.

## 6. Do's and Don'ts

### Do:
- **Do** keep gold to a single, deliberate use per section (The One Gold Rule) — a primary CTA or one active nav item, not a repeated decorative accent.
- **Do** use 20px radius (`rounded-lg`) as the default corner treatment for buttons and cards; reserve `rounded-full` for pills, avatars, and icon badges only.
- **Do** keep the header's `backdrop-blur-md` — it's functional (legibility over scrolling content), not decorative glass.
- **Do** pair the Warning color with an icon or label, since it shares its exact hex value with Civic Gold and can't be distinguished by color alone.
- **Do** use Civic Gold consistently via the `accent` token; don't reintroduce raw Tailwind `yellow-400`/`yellow-500` classes (currently present in `Header.jsx`) which drift slightly off the brand's actual gold (#FFC107) and break the single-source-of-truth the token exists to provide.

### Don't:
- **Don't** use gradient hero backgrounds or animated gradient overlays (the current homepage's `bg-gradient-to-br` hero and cycling radial-gradient background are the pattern to retire, per PRODUCT.md's anti-reference against generic startup/SaaS design).
- **Don't** use gradient text or color-cycling text effects (the homepage's animated `#FFD700 → #FFFFFF → #FFD700` text-color cycle on "Does Right" falls in this category) — emphasis comes from weight or size, not a moving gradient.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe (present today on section headings in `BlogPost.jsx` via `border-l-4 border-primary`) — rewrite with a full border, a background tint, or a leading icon instead.
- **Don't** use the hero-metric template (big number, small label, repeated in a stat row) as a default pattern — the homepage's "5,000+ Citizens Engaged" style stat row is the SaaS cliché this system is moving away from; if real numbers are worth featuring, integrate them into prose or a genuinely bespoke layout instead of the generic four-stat grid.
- **Don't** use decorative glassmorphism (frosted-glass badges, translucent floating cards) outside the one functional exception noted above (the nav bar). The hero's `bg-white/10 backdrop-blur-sm` badge is the pattern to retire.
- **Don't** add ambient shadows to elements that aren't doing anything (per The Flat-by-Default Rule) — a card sitting at rest on the page doesn't need `shadow-lg` just because it's a card.
- **Don't** stack more than two type families; Poppins and Inter are the whole system.
- **Don't** design toward the generic NGO/charity look (stock photography of beneficiaries, guilt-driven donation asks, cluttered cream/beige templates) or the generic government/bureaucratic look (dense, dry, form-heavy, no visual identity) — both are explicit anti-references in PRODUCT.md.
