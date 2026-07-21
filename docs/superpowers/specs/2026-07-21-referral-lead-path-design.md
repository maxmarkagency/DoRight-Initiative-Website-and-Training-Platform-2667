# Referral Lead Path (Phase 5)

Status: Approved
Date: 2026-07-21
Depends on: `docs/superpowers/specs/2026-07-17-member-onboarding-pipeline-design.md` (Phase 1: data model, merged), `docs/plans/2026-07-17-member-onboarding-data-model.md`, `docs/superpowers/specs/2026-07-18-admin-lead-review-design.md` (Phase 4, merged)

## Background

Pathway 2 of the onboarding pipeline: a referee collects a prospective lead's info in person, then an admin calls/WhatsApps the lead and eventually emails them the same public onboarding form link. Before that email goes out (Phase 6), the admin needs somewhere to record the lead the referee just handed them. Per the Phase 1 RLS design, this is an admin-entered insert through an authenticated session — not a variant of the public `Join.jsx` form.

## Scope

Extends `src/pages/admin/LeadsManagement.jsx` (Phase 4's page) with a creation flow for referral-sourced leads. No new page, no new route.

### Entry point and form

- A "New Referral" button sits next to the page's `<h1>`, opening a form.
- **Decision: separate modal, not the existing detail/edit modal.** The existing modal's state (`selectedLead`, `statusDraft`, `noteDraft`, photo signed-URL fetch) is shaped entirely around editing an existing row — reusing it for creation would mean threading a "create vs edit" branch through photo loading, status-select (which must never appear for creation, see below), and the save handler. A second modal that copies the same visual convention (`fixed inset-0` overlay, white rounded card, `motion.div` scale-in, same Cancel/primary-action button classes) keeps the visual language identical while keeping the two code paths independent and simple. This satisfies the "reuse the existing modal convention" instruction as a visual/structural convention, while avoiding a conditional mess in one component.
- Fields: Full Name, Email, Phone, Sub-committee Preference (`<select>`, backed by `getActiveSubCommittees()` from `leadsService.js` — reused as-is since it's the same active/name lookup Phase 2's `Join.jsx` already relies on and no admin-specific variant is needed), and Referred By (free text). Full Name, Email, Phone, and Referred By are `required`; sub-committee is optional (matches the schema, which allows `sub_committee_id` to be null).
- No Status field and no Photo field in this form (see decisions below).

### Submit behavior

- Inserts directly via `supabase.from('leads').insert(...)` with `source: 'referral'` hardcoded. `status` is omitted from the payload entirely so the table's `DEFAULT 'new'` applies — the admin cannot start a referral lead at any other stage.
- `photo_url` is omitted from the payload (stays `null`), see the photo decision below.
- On success: closes the modal, resets the form, and calls `fetchLeads()` so the new row appears at the top of the list immediately (list is already ordered by `created_at desc`). No separate toast/banner — matches `handleSaveLead`'s existing convention of closing + refetching as the only "success" signal in this file.
- On failure: sets an inline error string rendered in the form and leaves `referralForm` state untouched, so the admin's entered values survive a retry. Matches `handleSaveLead`'s `alert(...)` + `console.error(...)` posture, except surfaced inline in the form rather than as a browser `alert()`, since (unlike the edit modal's save, which can safely alert-and-stay-open) losing the modal to an alert would risk the admin thinking the create failed *and* closed, when the values are actually still there to retry.

### Photo: omitted entirely

The Phase 1 migration's `lead-photos` Storage bucket only grants `INSERT` to the `anon` role (public form uploads); there is no `authenticated` INSERT policy, so an admin session cannot upload a photo under existing RLS. `photo_url` is nullable, and Pathway 2's real flow ("collects info in person") doesn't guarantee a photo exists at referral-entry time anyway. Decision: skip photo capture in this phase entirely rather than add a new Storage RLS migration for a field the schema already tolerates being null. If a future phase wants admin photo upload, it needs a new migration granting `authenticated` INSERT on `storage.objects` for `bucket_id = 'lead-photos'`, mirroring the existing admin-table-insert policy's admin-role check.

## Non-goals

- No changes to `Join.jsx` or `leadsService.js`'s `submitLead`/`buildAdminNotes` — the public form path is untouched.
- No new database migration (the existing "Admins can insert leads" policy already permits this insert with no `source`/`status` restriction).
- No bulk/CSV import — one referral at a time.
- No email sending (Phase 6).
- No changes to the status-advancement or detail-view modal Phase 4 already built.

## Phase 6 note

Referral leads created here land in `leads` with `status = 'new'` and `source = 'referral'`, identical in shape to website leads except for `source` and `referred_by`. Whatever trigger Phase 6 uses for "welcome email on new lead" (a DB trigger, a scheduled poll, or a manual admin action) should already see these rows the same way it sees website submissions — no separate signal was added here to distinguish "just referred" from "website new," since `source = 'referral'` is that signal.
