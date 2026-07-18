# Join Form Wiring (Phase 2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire `src/pages/Join.jsx`'s currently-fake submit handler to actually persist a lead into the Phase 1 `leads`/`sub_committees` schema, with a real photo upload to the `lead-photos` Storage bucket.

**Architecture:** One new service module (`src/services/leadsService.js`, matching the existing `pageContentService.js` pattern) holding the two Supabase calls this feature needs — fetching active sub-committees and submitting a lead (photo upload + table insert) — so `Join.jsx` stays focused on form state and rendering. `Join.jsx` gains: a sub-committee `<select>` populated from the service, a required photo `<input type="file">`, an async submit handler with loading/error states, and scroll-to-form wiring on the three "Ways to Get Involved" CTA buttons (currently dead — no `onClick` at all).

**Tech Stack:** React (hooks), Supabase JS client (`@supabase/supabase-js`, already configured in `src/lib/supabase.js`), Supabase Storage.

**Testing note:** This repo has no automated test suite; `npm run build` is the verification bar throughout, same as every other phase in this project. Where a step says "verify," it means a careful manual read-back or a build check, not a test run.

---

### Task 1: Create the leads service module

**Files:**
- Create: `src/services/leadsService.js`

**Step 1: Read the reference service this follows**

Read `src/services/pageContentService.js` in full (it's short — under 20 lines) to see this project's service-module convention: a plain object/named exports, `supabase` imported from `../lib/supabase`, try/catch with `console.error` + a safe fallback return on read paths.

Also read `src/components/admin/MediaUpload.jsx` lines 105–161 (the `uploadFiles` function) to see the existing Storage upload convention: `supabase.storage.from(bucket).upload(filePath, file, { cacheControl: '3600', upsert: false })`, with `filePath` built as `` `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}` `` to avoid collisions.

**Step 2: Write the service file**

Create `src/services/leadsService.js` with exactly this content:

```javascript
import supabase from '../lib/supabase';

export const getActiveSubCommittees = async () => {
  try {
    const { data, error } = await supabase
      .from('sub_committees')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading sub-committees:', error);
    return [];
  }
};

const buildAdminNotes = (interest, message) => {
  const lines = [];
  if (interest) lines.push(`Interest: ${interest}`);
  if (message) lines.push(`Message: ${message}`);
  return lines.length > 0 ? lines.join('\n') : null;
};

export const submitLead = async ({ fullName, email, phone, interest, message, subCommitteeId, photoFile }) => {
  const fileExt = photoFile.name.split('.').pop();
  const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('lead-photos')
    .upload(filePath, photoFile, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase
    .from('leads')
    .insert({
      full_name: fullName,
      email,
      phone,
      photo_url: filePath,
      sub_committee_id: subCommitteeId,
      source: 'website',
      admin_notes: buildAdminNotes(interest, message)
    });

  if (insertError) throw insertError;
};
```

Notes on why this shape:
- `getActiveSubCommittees` follows the read-path convention exactly (try/catch, log, safe `[]` fallback) since it feeds a dropdown — a failed fetch should render an empty (or "Select an option" only) dropdown, not crash the page.
- `submitLead` intentionally does **not** catch its own errors — it lets them propagate. The caller (`Join.jsx`) needs to know submission failed so it can show an inline error and keep the form filled in; swallowing the error here would make that impossible.
- `admin_notes` is only built from `interest`/`message` when at least one is present, per the approved spec (`docs/superpowers/specs/2026-07-18-join-form-wiring-design.md`).

**Step 3: Review the file against the spec**

Read the file back and confirm:
- [ ] `getActiveSubCommittees` filters `is_active = true` and orders by `name`
- [ ] `submitLead` uploads to the `lead-photos` bucket before inserting into `leads` (upload first, matching the spec's ordering — insert only happens if upload succeeds)
- [ ] The inserted row sets `source: 'website'` literally (not a variable/prop) and does **not** set `status` at all (must default to `'new'` at the database level per the Phase 1 migration)
- [ ] `admin_notes` composition matches the spec's three cases (both/interest-only/message-only/neither → `null`)

**Step 4: Commit**

```bash
git add src/services/leadsService.js
git commit -m "feat: add leadsService for sub-committee lookup and lead submission"
```

---

### Task 2: Wire Join.jsx to the leads service

**Files:**
- Modify: `src/pages/Join.jsx`

**Step 1: Read the current file**

Read `src/pages/Join.jsx` in full (it's ~210 lines). The relevant pieces you'll change:
- Line 1: imports
- Lines 8–21: component state and the fake `handleSubmit`
- Lines 23–27: the `ways` array (Volunteer/Donate/Partner cards) and their CTA buttons around line 92
- Lines 104–149: the form itself and its submitted/not-submitted branches

**Step 2: Add imports and new state**

Replace:

```javascript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiHeart, FiHandshake, FiCheck, FiArrowRight, FiMail, FiPhone, FiMapPin } = FiIcons;

const Join = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };
```

With:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getActiveSubCommittees, submitLead } from '../services/leadsService';

const { FiUsers, FiHeart, FiHandshake, FiCheck, FiArrowRight, FiMail, FiPhone, FiMapPin, FiAlertCircle } = FiIcons;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const Join = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '', message: '', subCommitteeId: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [subCommittees, setSubCommittees] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formSectionRef = useRef(null);

  useEffect(() => {
    getActiveSubCommittees().then(setSubCommittees);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      setPhotoFile(null);
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('Image must be under 5MB.');
      setPhotoFile(null);
      return;
    }
    setPhotoError('');
    setPhotoFile(file);
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError('A photo is required.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await submitLead({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message,
        subCommitteeId: formData.subCommitteeId,
        photoFile
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      setSubmitError('Something went wrong submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
```

**Step 3: Wire the CTA buttons to scroll to the form**

The `ways.map(...)` block (around line 76–98 in the original) renders each card's button as:

```javascript
<button className={`w-full ${way.title === 'Donate' ? 'bg-accent text-neutral-900 hover:brightness-90' : 'bg-primary text-white hover:bg-primary-600'} px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center`}>
  {way.ctaText}
  <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
</button>
```

Add `onClick={scrollToForm}` to this button (it currently has no `onClick` at all).

**Step 4: Give the form section a ref**

Find the `<section className="py-20 bg-white">` that wraps the "Contact Form" comment (around original line 104) and add the ref:

```javascript
<section ref={formSectionRef} className="py-20 bg-white">
```

**Step 5: Add the sub-committee select and photo input to the form**

Inside the `<form onSubmit={handleSubmit} className="space-y-6">` block, after the existing "Area of Interest" `<div>` (the one with the `interest` select, ending around original line 135) and before the "Message" `<div>`, insert:

```javascript
                  <div>
                    <label htmlFor="subCommitteeId" className="block text-sm font-medium text-neutral-700 mb-2"> Sub-Committee Preference * </label>
                    <select id="subCommitteeId" name="subCommitteeId" value={formData.subCommitteeId} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select a sub-committee</option>
                      {subCommittees.map((committee) => (
                        <option key={committee.id} value={committee.id}>
                          {committee.name}
                        </option>
                      ))}
                    </select>
                  </div>
```

After the "Message" `<div>` and before the submit `<button>`, insert:

```javascript
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-neutral-700 mb-2"> Photo * </label>
                    <input type="file" id="photo" name="photo" accept="image/*" onChange={handlePhotoChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    {photoError && <p className="text-red-600 text-sm mt-2">{photoError}</p>}
                  </div>
```

**Step 6: Add the error banner and loading state to the submit button**

Replace:

```javascript
                  <button type="submit" className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors"> Submit Application </button>
```

With:

```javascript
                  {submitError && (
                    <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-4">
                      <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{submitError}</p>
                    </div>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
```

**Step 7: Update the confirmation copy's SLA claim**

Find (original line 146):

```javascript
                  <p className="text-neutral-700"> We've received your application and will get back to you within 48 hours. </p>
```

Replace `48 hours` with `24 hours`:

```javascript
                  <p className="text-neutral-700"> We've received your application and will get back to you within 24 hours. </p>
```

**Step 8: Verify with a build**

```bash
npm run build
```

Expected: build succeeds with no new errors or warnings beyond the pre-existing `framer-motion` "use client" directive notices (present before this change too).

**Step 9: Manual review against the spec**

Read the modified file back and check against `docs/superpowers/specs/2026-07-18-join-form-wiring-design.md`:

- [ ] Full Name / Email / Phone still map straight to `submitLead`'s `fullName`/`email`/`phone` params, unchanged from before
- [ ] Sub-committee select is required and populated from `getActiveSubCommittees()`
- [ ] Photo input is required, client-validated for type and 5MB size, and blocks submission via `photoError` when invalid or missing
- [ ] `source` is never taken from user input — `leadsService.submitLead` hardcodes it
- [ ] All three "Ways to Get Involved" buttons now call `scrollToForm` on click
- [ ] The confirmation message says 24 hours, not 48
- [ ] A failed submission shows the red error banner and does **not** clear `formData`, `photoFile`, or flip `isSubmitted`

**Step 10: Commit**

```bash
git add src/pages/Join.jsx
git commit -m "feat: wire Join.jsx form to leadsService (persist real leads)"
```
