# Sub-Committee Responsibilities Page (Phase 3)

Status: Implemented
Date: 2026-07-18
Source: Phase 3 of `docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md`

## Background

The onboarding pipeline design names Phase 3 as "the public info page both email templates link to" — a page a prospective member (arriving from a future welcome email, Phase 6, not yet built) can read to understand what each of the five sub-committees does before or while filling out the join form. The content source is `sub_committees.name` + `.description`, seeded in Phase 1 and already exposed read-only to `anon`/`authenticated` via RLS. Phase 2 (join-form wiring) already fetches `id, name` for the form's `<select>` via `leadsService.getActiveSubCommittees()`.

No human was available for the usual brainstorm-before-build conversation, so this document records the decisions a careful engineer would have made after that conversation, compressed.

## Scope

Build a single public route rendering the five active sub-committees' names and descriptions, reachable from the header nav and cross-linked from the join form.

## Decisions

**Route path: `/sub-committees`.** Existing content-only public pages use plural-noun paths (`/trustees`, `/programs`, `/webinars`), not verb-phrase paths. `/get-involved` was considered but rejected — it reads as a CTA slug inconsistent with the rest of the route list, and the page's job is informational (what each committee does), not a conversion page in its own right; `/join` already owns the CTA register.

**Data access: extend `leadsService.js` with `getSubCommitteeDetails()`** rather than a new service file. `leadsService.js` already owns the `sub_committees` table's read path (`getActiveSubCommittees`); a second exported function for the same table, differing only by one extra selected column (`description`), is a smaller diff than a new module and keeps all `sub_committees` queries in one place. Followed the file's existing try/catch + `console.error` + `[]` fallback convention exactly — no new error-handling pattern introduced.

**Page component: `src/pages/SubCommittees.jsx`.** Structure mirrors `Trustees.jsx` / `Join.jsx`: solid `bg-primary` hero band (no gradient), then a content section, then a `bg-primary` CTA band linking to `/join`. Chose a single-column stacked list over a grid — with only five items and descriptions of uneven length (currently one sentence each, but the schema allows arbitrarily longer prose later), a stacked list reads better than a grid that would either clip long entries or leave short ones looking sparse. Each row is a flat `bg-neutral-50` card with a `rounded-lg` border and no shadow (per DESIGN.md's Flat-by-Default rule — these cards aren't clickable, so they don't earn a hover-lift shadow). One `bg-primary` icon roundel per row for visual rhythm, not decoration.

**Loading and empty states.** `loading` boolean state (same pattern as `About.jsx`/`Webinars.jsx`) renders five pulsing skeleton rows while the fetch is in flight. If the fetch resolves to `[]` (RLS misconfiguration, all committees deactivated, etc.), the page shows a plain-language message pointing to `/contact` instead of rendering an empty section or throwing.

**Nav link: added "Sub-Committees" to the header's "About Us" dropdown**, alongside "Our Story" and "Our Trustees" — same register (explaining who/what the organization is structurally), not a restructuring of the nav. It sits third, after the two existing items.

**Join-form cross-link:** added a "What does each do?" link next to the "Sub-Committee Preference" label in `Join.jsx`, opening `/sub-committees` in a new tab (`target="_blank"`). New tab specifically because this is a client-side SPA route with in-memory form state — navigating away in the same tab would discard whatever the visitor had already typed into the join form.

## Non-goals

- No admin UI for editing `sub_committees` rows (separate CMS concern, not part of this 6-phase decomposition).
- No changes to email templates (Phase 6).
- No changes to the join form's submission logic beyond the one small link described above.
- No new migrations — Phase 1's schema already covers everything this page reads.
