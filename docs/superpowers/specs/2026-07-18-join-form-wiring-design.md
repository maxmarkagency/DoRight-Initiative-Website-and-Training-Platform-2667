# Website Join Form Wiring (Phase 2)

Status: Approved
Date: 2026-07-18
Depends on: `docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md` (Phase 1: data model, merged)

## Background

Phase 1 added the `sub_committees` and `leads` tables plus the private `lead-photos` Storage bucket. Nothing in the application references them yet. `src/pages/Join.jsx` has a form (Full Name, Email, Phone, Area of Interest, Message) whose submit handler only `console.log`s the data and flips a local `isSubmitted` flag — nothing is persisted.

This phase wires that form to the real schema, matching Pathway 1 from the source DRAI plan (website self-serve: visitor fills a form with bio-data, photo, and one sub-committee preference).

## Scope

### Form fields

- **Unchanged, now persisted:** Full Name → `full_name`, Email → `email`, Phone → `phone`.
- **Unchanged UI, new persistence path:** "Area of Interest" dropdown and the free-text "Message" textarea are kept (per explicit decision — the page's broader volunteer/donate/partner framing stays). Neither has a column in `leads`. On submit, whichever of the two are filled in are composed into a single string and written to `admin_notes`:
  - Both present: `"Interest: <value>\nMessage: <text>"`
  - Only interest present: `"Interest: <value>"`
  - Only message present: `"Message: <text>"`
  - Neither present: `admin_notes` is left `null` (message is optional; interest remains required as it is today)
- **New, required: Sub-committee.** A `<select>` populated from `sub_committees` (`SELECT ... WHERE is_active = true ORDER BY name`, allowed by Phase 1's public RLS policy) → `leads.sub_committee_id`.
- **New, required: Photo.** A file input (`accept="image/*"`, 5MB client-side cap) uploaded to the `lead-photos` bucket; the returned storage object path → `leads.photo_url`.
- **Hardcoded, not user-editable:** `source = 'website'` on every insert (matches the Phase 1 anonymous `WITH CHECK` policy, which requires exactly this). `status` is not set by the client — it defaults to `'new'` at the database level.

### Other CTAs on the page

The three "Ways to Get Involved" cards (Volunteer / Donate / Partner) currently render a `<button>` with no `onClick` at all — dead buttons today. This phase wires all three to scroll down to the form section (`scrollIntoView`) and does nothing else with them. Donation processing has no backing feature or schema anywhere in this codebase; it stays out of scope.

## Submit flow

1. **Client-side validation:** Full Name, Email, Phone, Area of Interest, Sub-committee, and Photo are all `required` in the form (Interest was already required; Message stays optional as today). The browser's native HTML5 validation handles this, same mechanism the form already uses.
2. **Photo upload first.** Generate a collision-safe object path (`crypto.randomUUID()` + the file's original extension) and upload to `lead-photos` via the Supabase client. If this fails, stop and show an inline error banner; do not attempt the lead insert.
3. **Insert the lead row** with the mapped fields above. If this fails, show an inline error banner and leave the form filled in so the user can retry without re-entering everything. The already-uploaded photo from step 2 is orphaned in storage in this failure case — accepted as out of scope (see Non-goals).
4. **On success:** show the same "Thank You" confirmation card the page has today, with one copy correction — "within 48 hours" becomes "within 24 hours," matching the source plan's stated first-outreach SLA.
5. **Loading state:** the submit button shows a disabled/spinner state while the upload + insert are in flight (today's fake submit is instantaneous; this becomes a real async round-trip).

## Non-goals for this phase

- **No de-duplication, no admin UI, no email sending.** Those remain Phases 4 and 6, per the Phase 1 spec's own phase decomposition.
- **No storage cleanup for orphaned photos** on a failed lead insert. Not worth building until it's shown to matter.
- **No rate-limiting or anti-abuse control** on the public insert path. Deferred; not part of the schema or this phase's stated scope.
- **No changes to the Donate flow.** It has no backing feature in this codebase; out of scope entirely.
