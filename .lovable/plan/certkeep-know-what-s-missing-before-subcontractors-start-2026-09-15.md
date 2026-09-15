# CertKeep: know what's missing before subcontractors start

Evolve the existing CertKeep app into a complete operations product. Keep today's ink/orange palette and Sora + Manrope typography; tighten density, alignment, and status clarity instead of restyling. Existing records and screens are kept and extended — no data-model rebuild.

Work runs in four stages. Each stage ends with a working app.

---

## Stage 1 — Data model, permissions, demo workspace

Extend what exists rather than replacing it:

- Per-project evaluation: a requirement can be satisfied for one project and unmet for another, using one subcontractor record and shared documents.
- Document versions: every replacement upload becomes a new version that must be reviewed again. Old versions and old decisions are preserved and viewable. A new version never inherits the previous approval.
- Coverage records: expiration tracked per coverage or license. W-9s carry no expiration.
- Assignment dates: each subcontractor assignment on a project gets its own scheduled start and end, so "expires during scheduled work" can be computed.
- Requests and reminders: request scope (which items, insurance-only vs full), owner, due date, and a notification job table carrying scheduled / sent / failed / canceled states.
- Audit events: append-only for app users.
- Upload links: store a hash of the token, not the token itself. Links become unguessable, revocable, and expiring. Links already shared will stop working.
- Roles: owner, admin, reviewer, viewer enforced in the database and on the server, not only in the UI. W-9 access limited to explicitly authorized roles.
- A clearly labelled **Demo workspace** seeded with fictional data: several commercial projects, about 20 subcontractors, pending reviews, expired documents, and upcoming starts.

## Stage 2 — Request, upload, review

- **Review Inbox**: document preview beside the requirement checklist. Approve or request changes with a specific reason. Each decision records reviewer, time, document version, and the project requirement it applies to. Moves straight to the next item.
- **Requests**: what was asked for, from whom, when it was sent, what is outstanding, and what happens next.
- **Upload page** (no account): shows the requesting contractor, the subcontractor, the project, the exact documents requested, and the deadline. Camera photos and PDFs, upload progress, retry, plain error messages, and a confirmation receipt. Broker links show insurance items only. A public page never reveals W-9s, other subcontractors, or previously uploaded private files.
- File type and size checked on the server. Downloads use short-lived authorized links.

## Stage 3 — Today, projects, reminders

- **Today** leads with "What needs attention before work starts?" and four compact metrics: upcoming starts with unresolved requirements, submissions awaiting review, expirations affecting scheduled work, overdue requests.
- A prioritized queue with columns for subcontractor, project, scheduled start, the specific issue, who is responsible, last action, and next action — e.g. "Apex Electrical · Market Street Fit-Out · Starts Monday · Workers' compensation expires during scheduled work · Broker response needed." Expired or missing items affecting active work rank above imminent starts.
- Filters for project, owner, issue, and start window, reflected in the URL so a filtered view can be shared and back navigation works.
- Each row opens a detail panel with documents, requirements, activity, and actions.
- **Projects**: dates, assigned manager, requirement templates, assignments with their own start and end dates, and a readiness view per project.
- **Subcontractors**: one record per organization, documents reused across projects.
- Statuses stay explicit and never rely on color alone: Missing, Awaiting review, Approved against checklist, Expiring during work, Expired, Changes requested. Review status stays separate from computed project readiness. No wording implies legal compliance or guaranteed coverage.
- **Reminders**: ask only for outstanding items, pause while something is awaiting review, restart after changes are requested, stop when resolved, and escalate to the assigned owner before scheduled work. Jobs are safe to re-run without sending duplicates. Dates use the organization's timezone. With no email provider configured the app shows "Delivery not configured" and never reports a send that did not happen.

## Stage 4 — Onboarding, polish, verification

- Onboarding: create organization, import subcontractors from CSV with column mapping, validation preview and duplicate detection, create the first project, choose requirements, preview requests before sending. Downloadable CSV template and a full data export.
- Navigation becomes Today, Projects, Subcontractors, Review Inbox, Requests, Settings.
- Compact readable tables, subtle borders, minimal shadow, icons paired with labels, real hover and keyboard focus states, and a genuinely easy mobile upload experience.
- Loading, empty, error, success, and permission-denied states everywhere.
- Checks before finishing: another organization's data is unreachable, public links expose only their own request, the same document evaluates differently per project, expiration during scheduled work is flagged, a replacement upload is not auto-approved, resolved requests stop receiving reminders, and re-running a reminder job sends nothing twice.

---

## Technical notes

- React 19 + TanStack Start, TypeScript strict, Tailwind v4, Lovable Cloud (Postgres, auth, private storage).
- Schema changes via migrations, each new public table with grants, RLS enabled, and role-scoped policies; `private.` helper functions for role checks.
- Reads and writes through authenticated server functions; role checks server-side. Admin/service access only after the caller's role is verified, never for ordinary reads.
- Status logic lives in one shared module used by Today, project readiness, and the review inbox, so the two never disagree.
- Public upload routes live under `src/routes/api/public/*` and `/upload/$token`, validating a hashed token, expiry, and revocation server-side on every request.
- Code organized by feature with typed data access, validated forms, and small components.
