# Admin Lead Review Workflow (Phase 4)

Status: Approved
Date: 2026-07-18
Depends on: `docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md` (Phase 1: data model, merged), `docs/plans/2026-07-17-member-onboarding-data-model.md`

## Background

Phase 2 wired the public join form to insert rows into `leads` (`source = 'website'`, `status = 'new'`). Nothing in the admin panel surfaces those rows yet — an admin has no way to see a new lead, log the outcome of the required follow-up call, or track a lead through to full membership. This phase builds that surface.

## Scope

A new admin-only page, `/admin/leads`, following the existing admin-page convention (`WebinarManagement.jsx` was the structural reference): direct `supabase.from(...)` calls in the page component, no service-layer indirection, `useEffect`-driven fetch keyed on filter/search state, and a modal for detail/edit.

### List view

- Fetches `leads` with an embedded sub-committee name: `.select('*, sub_committees(name)').order('created_at', { ascending: false })`.
- Columns: name, email, phone, sub-committee, source, status (colored badge), created date.
- Filters: status dropdown (`all` + the four `leads.status` values), matching the `publishedFilter` pattern in `WebinarManagement`. Added a name/email search box (`ilike` `.or()` across both columns) since admins will otherwise have no way to find a specific lead once volume grows — a reasonable extension per the phase brief, not a required item.
- Row click opens the detail modal (no explicit "view" button column — the whole row is the affordance, consistent with the table being read-mostly).

### Detail/status-update modal

**Decision: modal, not inline/expandable row.** `WebinarManagement` and the create/edit flow it uses establishes modal-for-detail as the existing convention in this codebase; an expandable row would be a new pattern introduced just for this page, with no clear benefit (the detail view has photo + several fields + notes + status, which is dense for an inline row expansion).

- Photo: async `supabase.storage.from('lead-photos').createSignedUrl(photo_url, 300)` fired when the modal opens, not blocking the rest of the modal from rendering. Three states: loading ("Loading..." placeholder), loaded (`<img>`), and no-photo/error (fallback user icon). A `photo_url` of `null` (e.g. a future non-website-originated lead that skipped the upload step) never calls `createSignedUrl` at all and just shows the fallback icon.
- Admin notes: a plain `<textarea>` bound to `admin_notes`. This is also where Phase 2's folded-in "Interest"/"Message" text already lives (written by `leadsService.submitLead`), so the admin sees the join-form context and appends call notes to the same field. No structured separation between "form-submitted context" and "admin's own notes" — treating both as one free-text log was judged simpler and sufficient; the phase brief explicitly allows this to be simple.
- Status: a single `<select>` with the four values in sequence order, no stepper UI and no hard restriction on skipping stages or moving backward. Rationale: the brief explicitly sanctions this ("a simple `<select>`... is sufficient — this doesn't need to be a rigid stepper"), and a real admin workflow may legitimately need to correct a mis-click (move backward) or fast-track a highly-committed lead (skip `contacted` straight to `integrated`) without the UI getting in the way.
- Timestamp stamping: on save, if the selected status differs from the lead's stored status, the matching timestamp column (`contacted_at` / `integrated_at` / `full_member_at`) is set to `now()` (client-generated ISO timestamp) in the same update. Moving `status` back to `'new'` has no timestamp column and stamps nothing. Re-entering a status the lead has already passed through (e.g. `full_member` → `contacted` → `full_member` again) re-stamps that stage's timestamp to the latest transition time rather than preserving the original — judged more useful for the SLA-tracking intent described in the Phase 1 doc (time of the *current* stage entry, not the historical first one) than a first-write-wins rule, and simpler to implement (no need to conditionally check for an existing non-null value).
- Save writes `admin_notes` and `status` (plus the timestamp column when applicable) in a single `supabase.update(...).eq('id', lead.id)` call, then closes the modal and refetches the list.

### Empty / loading / error states

- Zero leads: "No leads found" (matches `WebinarManagement`'s empty state copy pattern).
- Fetch/save failures: `alert(...)` + `console.error(...)`, matching the existing admin-page error-handling convention exactly (not silent, not a toast library that doesn't exist in this codebase).

## Non-goals (explicitly out of scope for this phase)

- No UI for admins to create a new lead (referral-path creation is Phase 5). The list/detail view makes no assumption that every lead came from the website — `source` and `referred_by` are both rendered generically, and the modal already conditionally shows `referred_by` when `source === 'referral'`, so Phase 5 can extend this same page with a "New Referral" button and creation form without restructuring anything here.
- No email sending (Phase 6).
- No bulk actions, CSV export, or analytics/reporting.
- No changes to the Phase 1 migration, RLS policies, `Join.jsx`, or `leadsService.js`.
