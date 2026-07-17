# New Member Onboarding Pipeline

Status: Approved (Phase 1 only)
Date: 2026-07-17
Source: "New Member Onboarding Process Plan" (DRAI operational document, July 2026)

## Background

DRAI's operational plan describes two pathways for turning a lead into a member:

- **Pathway 1 (Website)**: visitor clicks "Join Us" on doright.ng → gets an automated welcome email with onboarding links → fills a form (bio-data, photo, sub-committee preference) → admin gets notified → admin calls to welcome them → lead joins their preferred sub-committee (and, if they show high commitment/financial investment/a primary sub-committee role, is added to the members WhatsApp group as a full member).
- **Pathway 2 (Direct Referral)**: a referee collects a prospective lead's info in person → admin calls/WhatsApps them → admin sends a tailored email with the same onboarding form link → lead submits → same sub-committee/WhatsApp integration as Pathway 1.

The document also specifies two email templates (automated web welcome, direct referral welcome — both currently have placeholder links needing real destinations) and two SLA targets: 24h to first outreach, 100% onboarding form completion.

Today, `src/pages/Join.jsx` has a join form, but its submit handler only `console.log`s the data and shows a fake success message — nothing is persisted, no email sends, no admin ever sees a submission.

## Scope decomposition

This is too large for one implementation pass. It decomposes into six phases, each getting its own brainstorm → spec → plan → implement cycle:

1. **Data model** — `leads` + `sub_committees` tables (this document)
2. **Website join form** — wire `Join.jsx` to actually persist to the Phase 1 schema, matching the doc's fields
3. **Sub-committee responsibilities page** — the public info page both email templates link to
4. **Admin review workflow** — admin panel surface to see new leads, log the follow-up call, advance status, mark full member
5. **Direct-referral path** — admin-facing form for Pathway 2 (referee-collected leads), reusing the Phase 1 schema with `source = 'referral'`
6. **Automated welcome emails** — transactional email integration (no such service exists in this codebase today) sending the two templates on the appropriate triggers

Only Phase 1 is designed and approved here. Phases 2–6 are listed for roadmap context; each will be brainstormed on its own before implementation, since later phases depend on decisions made in earlier ones (e.g., the admin workflow's exact screens depend on what the join form actually captures).

## Phase 1: Data Model

### `sub_committees`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text, unique, not null | e.g. "Communication", "Community Engagement", "Fundraising", "Strategy", "Secretariat" — seeded from the doc's list |
| `description` | text, nullable | Doubles as the source content for the Phase 3 responsibilities page |
| `is_active` | boolean, default true | Lets admins retire a committee without deleting history tied to it |
| `created_at` / `updated_at` | timestamptz | |

Admin-manageable (not hardcoded in application code), matching how blog/gallery/CMS content already work in this app.

### `leads`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `full_name` | text, not null | |
| `email` | text, not null | No uniqueness constraint — see Non-goals |
| `phone` | text, nullable | |
| `photo_url` | text, nullable | Path into the new private `lead-photos` Storage bucket, not the public `media-library` bucket |
| `sub_committee_id` | uuid, nullable, fk → `sub_committees` | Single preference, not multi-select |
| `source` | text, not null, check in `('website', 'referral')` | |
| `referred_by` | text, nullable | Meaningful only when `source = 'referral'` |
| `status` | text, not null, default `'new'`, check in `('new', 'contacted', 'integrated', 'full_member')` | |
| `admin_notes` | text, nullable | Free text; where the admin logs the follow-up call outcome |
| `contacted_at` / `integrated_at` / `full_member_at` | timestamptz, nullable | Set when status advances past each stage; gives a queryable way to check the doc's own SLA targets (24h to first outreach, form-completion rate) later |
| `created_at` / `updated_at` | timestamptz | |

### Access control (RLS)

- **`sub_committees`**: public `SELECT` (needed for the join form's dropdown and the future public info page); `INSERT`/`UPDATE`/`DELETE` restricted to `is_admin()`.
- **`leads`**: this table holds real personal data (name, email, phone, photo) — `SELECT`/`UPDATE`/`DELETE` restricted to `is_admin()` only. `INSERT` is allowed for the `anon` role (the public website form has no logged-in user), but the policy's `WITH CHECK` clause constrains the inserted row to `status = 'new'` and `source = 'website'`, so an anonymous submitter cannot self-assign `full_member` status or claim `source = 'referral'` via a crafted request. Phase 5's admin-entered referral leads will insert via an authenticated admin session instead, which the RLS policy allows separately.
- **`lead-photos` Storage bucket** (new, private): `INSERT` allowed for `anon` (so the public join form can upload without a session); `SELECT` restricted to authenticated admins.

### Non-goals for this phase

- **No de-duplication logic.** If the same email submits twice, both rows persist; admins de-duplicate manually. Automatic dedup (reject vs. merge vs. flag) is a real design question deferred to whichever later phase actually needs it.
- **No email sending, no admin UI, no join-form wiring.** Those are Phases 2–6.
