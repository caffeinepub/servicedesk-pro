# Servicedesk-Pro — Version 74 Feature Update

## Current State
Full-stack ICP app with Motoko backend + React/Zustand frontend. Cases, users, part requests, inventory, and notices are backend-persisted. Part requests currently support a single part (partCode + partName + partPhotoUrl) per request. Part ordering only supports a single PO number. The Returned to Store tab in IssuedPartsPage does not retain original issuance details. Notifications are stored in state but not always accurately role-filtered. Dashboard/Reports/AI Engine use hardcoded seed data in many places. Audit logs are partially recorded.

## Requested Changes (Diff)

### Add
- `PartRequestItem` type: `{id, partCode, partName, partPhotoUrl, status, issuedAt, issuedBy, issuedByName, technicianId}` for per-part tracking within a single request
- `parts?: PartRequestItem[]` optional field on `PartRequest` — if present, represents multiple parts; single partCode/partName fields remain for backwards compat
- `poNumbers?: string[]` on `Case` type for multiple PO numbers
- Multiple part entries UI in CaseDetailPage when status = `part_required` (add/remove rows dynamically)
- Multiple PO number entries UI in CaseDetailPage when status = `part_ordered`
- Same multi-part and multi-PO UI in ExistingCasesPage
- Part availability indicator in CaseDetailPage `part_required` form: backend_user sees "In Stock" / "Not in Stock" badge per part code entered; supervisor/admin sees "In Stock" / "With Technician: [name]" / "Installed" / "Not in Inventory"
- Per-part status rows in PartRequestsPage expanded view for privileged users
- "Issue All" button in PartRequestsPage when all parts in a multi-part request are in inventory; otherwise individual "Issue" button per available part
- Stock availability shown in PartRequestsPage expanded view per part row: supervisor/admin sees full detail (in stock / with technician / installed / not in inventory); backend_user does NOT see this detail (they only see their request status)
- Block issue if part not in inventory (show warning toast), still allow reject
- Edit Case ID field in CaseDetailPage (admin only — small edit icon next to the case ID display)
- Returned to Store tab in IssuedPartsPage: restore and display original issuance details — technician name, company name, issue date, case ID — from the data preserved in `PartInventoryItem`
- New backend stable var `stable var sdPartRequestsJson : Text = "[]";` with `setSdPartRequestsJson(blob: Text)` and `getSdPartRequestsJson()` query methods for flexible JSON-based part request storage
- StorePilot audit log entries for every write action (create, update, delete, issue, return, relocate, approve, reject, cancel) with actor name, role, timestamp

### Modify
- `addPartRequest` store action: support `parts` array; save to new JSON blob backend; create one part request record supporting multi-part
- `issuePartRequest` store action: accept optional `partItemId` parameter so individual parts within a request can be issued; mark that specific `PartRequestItem` as issued; still create `PartInventoryItem` for each issued part
- `syncPartRequests`: use new `getSdPartRequestsJson` backend method; fall back to structured `getSdPartRequests` for older data
- `returnPartToStore` store action: preserve technicianId, caseId, issueDate, issuedBy fields in the part item (do NOT clear them — add new `originalTechnicianId`, `originalCaseId`, `originalIssueDate`, `originalIssuedBy` fields OR just don't zero them out and read them for display in Returned to Store tab)
- CaseDetailPage `part_required` form: add dynamic multi-part rows, show stock availability per part code
- CaseDetailPage `part_ordered` form: support multiple PO numbers
- CaseDetailPage status update: ensure immediate update with no perceived lag (already calls `saveCasesToBackend` async — confirm state update is synchronous)
- PartRequestsPage expanded view: show per-part rows with status, issue buttons
- ExistingCasesPage: multi-part support for `part_required` status, multi-PO for `part_ordered`
- IssuedPartsPage Returned to Store tab: display technician name, company, case ID, issue date from preserved part item fields
- NotificationsPage + store: ensure `generateAutoNotifications` creates real notifications from real case/part data; role-filter them: supervisor sees inventory/store notifications only (part_request, low_stock, part_issued, part_returned), backend_user sees their own case notifications + part_issued for their own requests, admin sees all
- Sidebar notification badge counts must reflect role-filtered counts
- DashboardPage: remove hardcoded numbers; compute from real `cases`, `partItems`, `technicians` arrays
- ReportsPage: remove hardcoded chart data; build from real store data
- AIEnginePage: remove hardcoded seed metrics; compute from real inventory
- AuditLogsPage: display `storePilotAuditLogs` which should be populated on every write action

### Remove
- Hardcoded/seed data from DashboardPage, ReportsPage, AIEnginePage metrics (replace with real computed values)
- Clearing of technicianId/caseId/issueDate when returning a part to store (preserve originals for display)

## Implementation Plan

1. **Backend (main.mo)**: Add `stable var sdPartRequestsJson` + two new public functions. No migration needed — additive only.

2. **Types (types/index.ts)**: Add `PartRequestItem` interface, add `parts?: PartRequestItem[]` to `PartRequest`, add `poNumbers?: string[]` to `Case`.

3. **Store (store/index.ts)**:
   - Update `addPartRequest` to accept `parts` array and store them in the request
   - Update `issuePartRequest` to accept optional `partId` to issue a specific part within a multi-part request
   - Add `issueAllPartRequest(requestId, technicianId)` for the "Issue All" case
   - Update `syncPartRequests` to use new JSON blob backend
   - Update `returnPartToStore` to NOT clear originalTechnicianId, issueDate, issuedBy, caseId
   - Ensure all write actions add a `StorePilotAuditLog` entry

4. **CaseDetailPage.tsx**:
   - When `newStatus === 'part_required'`, render dynamic multi-part list (add row / remove row); each row has partCode + partName + photo upload
   - Per-part availability badge when partCode is entered (backend_user: "In Stock"/"Not in Stock"; supervisor/admin: full detail)
   - When `newStatus === 'part_ordered'`, render dynamic PO number list
   - Admin-only Edit Case ID: small pencil icon next to caseId in the case header; clicking opens an inline edit field

5. **PartRequestsPage.tsx**:
   - Expanded view: if request has `parts` array, render per-part rows with status badge, stock availability (supervisor/admin only), and individual Issue/Already-Issued buttons
   - If all parts are available in inventory, show "Issue All" button
   - If a part is not in inventory, Issue button is disabled with tooltip; reject still enabled

6. **ExistingCasesPage.tsx**: Multi-part UI for `part_required`, multi-PO for `part_ordered`

7. **IssuedPartsPage.tsx**: Returned to Store tab — show technician name (from originalTechnicianId or technicianId), company, case ID, issue date from the preserved part item fields

8. **DashboardPage.tsx / ReportsPage.tsx / AIEnginePage.tsx**: Replace hardcoded numbers with computed values from real store data

9. **Notifications**: Fix `generateAutoNotifications` to produce real notifications; fix role-filtering everywhere (sidebar badge, NotificationsPage)
