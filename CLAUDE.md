# CLAUDE.md

## Design Context

This project has `PRODUCT.md` and `DESIGN.md` at the repo root — read both before any frontend design work.

- **Register:** brand (the public site is the primary surface; the admin/student LMS dashboard is product-register and governed separately per DESIGN.md).
- **Platform:** web.
- **North Star:** "The Civic Standard-Bearer" — bold, dignified, black-and-gold institutional confidence, not charity-cliché or SaaS gloss.
- Current known departures from doctrine (see DESIGN.md's Do's and Don'ts for detail): `src/pages/Home.jsx` still has a gradient hero, color-cycling text, and a hero-metric stat row; `src/pages/BlogPost.jsx` has side-stripe (`border-l-4`) section headings; `src/components/Header.jsx` uses raw Tailwind `yellow-400`/`yellow-500` instead of the `accent` token. None of these are fixed yet — treat DESIGN.md as the target, not the current state.

Use the `impeccable` skill (`/impeccable <command>`) for any UI design, critique, or polish work on this project.
