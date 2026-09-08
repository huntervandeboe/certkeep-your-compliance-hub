# CertKeep Daily Work Queue Release

## Goal
Make the signed-in home screen the place a contractor can open each morning, understand what matters before upcoming work, and complete document follow-up and review without hunting through menus. Status language will describe whether customer-defined document requirements are satisfied, never whether a subcontractor is legally safe or cleared to work.

## What will be built

### 1. Work ownership and upcoming-work data
Extend the existing workspace model so operational work can be prioritized and assigned:

- Add an optional planned start date to each subcontractor’s project assignment
- Add an optional task owner and due date to document requests
- Record the last request/reminder and next scheduled reminder
- Keep the existing secure account-free upload links and current records working
- Add explicit grants, workspace-scoped row security, indexes, and validation for every new field/table change

### 2. Daily overview
Replace the current high-level command center with a focused daily work screen:

- Top actions: search, **Add subcontractor**, and **Send requests**
- Four live metrics: **Needs action**, **Awaiting review**, **Expiring within 30 days**, and **Document-ready subcontractors**
- Prioritized queue ordered by upcoming start date, overdue assignment, uploaded documents, rejected records, expired records, and unanswered requests
- Every row explains what is wrong, why it matters, who owns it, its due date, and the next direct action
- Filters for **Assigned to me**, project, and issue type
- Side panel for upcoming project starts and scheduled reminders
- Bottom section for this week’s real outcomes and recent completed activity

### 3. Fast review panel
Turn the Documents screen into a focused review workspace:

- Review queue on the left, selected document preview in the center, requirements/context on the right
- Approve or request a correction without leaving the queue
- Show subcontractor, project, planned start, expiration, notes, and customer-defined requirement details together
- After a decision, refresh all counts immediately and select the next submission
- Record each review decision in workspace activity

### 4. One-click and bulk requests
Upgrade the subcontractor roster into an operations table:

- Search, status/project filters, row selection, and select-all for the visible set
- Bulk **Send requests** for missing or expiring documents
- One-click request of all currently missing requirements for one subcontractor
- Assign selected subcontractors to a project and export selected records as CSV
- Create request/reminder history without implying that a reminder resolved the missing document
- Continue to expose secure upload links when email delivery is not configured

### 5. Project readiness
Add a project workspace focused on upcoming work:

- Project cards show start timing, assigned subcontractors, satisfied checklists, and open document gaps
- Project detail shows each assigned subcontractor against that project’s document checklist
- Add/edit project dates, assign subcontractors, and define project requirements
- Surface actionable language such as “Apex Electrical starts Monday — Workers’ compensation is missing”
- Use **Document requirements satisfied** for positive readiness states

### 6. Quality and verification
- Preserve the existing visual system while increasing information density and making actions easier to scan
- Keep desktop tables efficient and provide compact mobile task cards
- Add complete metadata to any new content route
- Validate permissions and run the core flow: create project → assign subcontractor/start date → define requirement → bulk request → upload → review → readiness updates
- Verify the refreshed dashboard and review workflow at desktop and mobile sizes

## Technical details
- Use one database migration for schema and policy changes; retain the existing owner-scoped records while attaching new operational records to the user’s workspace.
- Use authenticated server functions for all queue reads and mutations, with role-aware write access and immediate query invalidation after actions.
- Derive readiness from project requirements, assignments, and document status; do not store a manually editable “cleared” flag.
- Use the existing private document storage and short-lived signed document URLs.
- Email sending is not claimed in this release unless a delivery provider is already configured; “send” records the request/reminder and provides the secure upload link.
