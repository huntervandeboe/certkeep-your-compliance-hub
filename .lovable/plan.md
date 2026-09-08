# CertKeep Paid-Grade Product Dashboard

## Goal
Turn CertKeep from a sparse document tracker into a premium construction-compliance command center that makes daily risk, work, and value immediately visible. Keep the refined CertKeep palette (`#FAFAF8`, `#111827`, `#F05A28`, `#E5E7EB`) and Sora/Manrope typography, but replace the current lightweight app frame with a deeper, denser, high-confidence product experience.

## Product direction
The dashboard will feel like an operational control room rather than a collection of generic cards:

- Compact left navigation for **Overview, Projects, Subcontractors, Documents, Reports, Integrations**, plus Team and Settings
- Slim utility bar with workspace switcher, global search, notifications, help, and user menu
- A useful first viewport containing the compliance trend, urgent actions, project health, expirations, and recent activity
- Crisp tables, filters, saved views, status chips, charts, drawers, and dialogs instead of large empty panels
- Orange reserved for primary actions and brand moments; green, amber, and red communicate compliance risk
- Dense enough for professional use, with clear spacing and calm visual hierarchy on desktop and mobile

## Build scope

### 1. Data and permissions foundation
Add a workspace-centered data model for:

- Workspaces and workspace members
- Roles stored separately: owner, admin, project manager, reviewer, and read-only
- Projects and project assignments
- Project-specific compliance requirements
- Subcontractor-to-project assignments
- Documents, requirement results, reminder history, activity events, and integration records

Every new table will include explicit grants and owner/workspace-scoped row security. Sensitive actions will be checked on the server; roles will never be trusted from browser storage.

### 2. Premium application shell
Rebuild the signed-in shell as a full product workspace:

- Fixed collapsible navigation with clear information architecture
- Workspace and project switchers
- Global search/command menu
- Notifications center with unread states
- Account menu and responsive mobile navigation
- Reusable premium controls for tables, tabs, segmented filters, status indicators, pagination, drawers, and confirmation dialogs

### 3. Command-center overview
Replace the current four counters and empty panels with:

- Portfolio compliance score with a 30/60/90-day trend
- “Needs attention” summary for overdue, expiring, rejected, and awaiting-review items
- Action queue with inline review, reminder, assignment, and open-record actions
- Project health table showing compliance, vendor count, open gaps, and upcoming expirations
- Risk distribution and document-status charts
- Upcoming expiration timeline
- Recent team/vendor activity stream
- Quick actions for adding a project, adding a subcontractor, requesting documents, and exporting a report

Empty accounts will get a guided setup checklist instead of a mostly blank dashboard.

### 4. Projects and requirements
Create complete project workflows:

- Project list with search, filters, status, compliance score, and risk counts
- Project detail with overview, assigned subcontractors, requirements, documents, and activity
- Reusable requirement templates by trade/project
- Requirements for policy type, minimum limits, endorsements, expiry behavior, and whether the item is required or waived
- Assign and remove subcontractors from projects

### 5. Subcontractor workspace
Upgrade the flat list into a working compliance roster:

- Searchable/sortable/filterable table with company, trade, projects, compliance, missing items, next expiration, and contact
- Saved status filters and bulk selection
- Bulk request and reminder actions
- Rich detail view with summary, projects, document checklist, communication history, notes, and activity
- Clear compliant, action-needed, pending, expired, rejected, and waived states

### 6. Document operations
Turn document review into a real operations queue:

- Tabs and filters for review, missing, expiring, expired, approved, and rejected documents
- Document preview beside extracted/entered details and project requirements
- Inline approve, reject, waive, request correction, assign reviewer, and add note actions
- Bulk approve/remind/export where safe
- Full audit trail for every status change
- Improved account-free upload flow with branded request context, multi-document support, visible progress, clear correction instructions, and confirmation

The first release will provide structured manual verification. Automated COI extraction and policy-language verification will be represented as a later integration point, not falsely claimed as working AI.

### 7. Reminders and communication
Add paid-grade follow-through:

- Configurable reminder cadence for missing and expiring documents
- Manual and bulk “send reminder” actions
- Reminder history, delivery state, recipient, and next scheduled reminder
- Clear vendor-facing correction messages for rejected documents

### 8. Reports, integrations, team, and settings
Add complete platform surfaces rather than dead navigation:

- Reports for portfolio compliance, non-compliant vendors, expiring documents, missing requirements, newly compliant vendors, and audit history
- Date/project/status filters with CSV export
- Integrations directory with honest connected/available states and setup flows; no unsupported integration claims
- Team member management with role-based access
- Settings for company profile, requirement templates, reminder rules, notification preferences, and security

### 9. Quality and verification
- Preserve the existing authenticated workflow and secure upload links while migrating them into the workspace/project model
- Seed realistic demo content only where needed for development previews; do not present invented customer claims
- Verify permissions for every role and public upload boundary
- Test the full path: create project → assign subcontractor → apply requirements → request/upload → review/correct/approve → dashboard/report update
- Validate desktop and mobile layouts, keyboard use, focus states, loading/error/empty states, overflow, metadata, and browser console/network health

## Competitive position
Billy’s public product emphasizes project-level requirements, continuous tracking, automated reminders, broad reporting, integrations, and AI-assisted verification. CertKeep’s first paid-grade advantage will be a faster, cleaner operating workflow centered on one account-free vendor link, a clearer action queue, and simpler project compliance setup. AI policy verification and deep accounting/construction integrations will be designed as extension points and added only when they are genuinely functional.

## Delivery order
1. Workspace, roles, projects, requirements, and migration of current data
2. Premium shell and command-center dashboard
3. Project and subcontractor operating views
4. Document review, reminders, and audit history
5. Reports, integrations directory, team, and settings
6. Permission, workflow, and responsive testing
