# Servicedesk-Pro

## Current State
Version 77+ production app. Part requests, cases, inventory, notifications all store to Motoko backend via JSON blobs. Polling every 3-5 seconds syncs data across devices.

## Requested Changes (Diff)

### Add
- Grouped collapse/expand view in IssuedPartsPage: parts with the same part code are collapsed into a group header, expandable to show all individual issue/return history entries
- Grouped collapse/expand view for the "Part Issued" section in CaseDetailPage: multiple parts issued for the same case are grouped, each expandable to show individual issue details
- ISSUE action type support in AuditLogsPage (icon + color)

### Modify
- **Part issue lag**: After `issuePartRequest` in the store, immediately call `syncPartRequests()` so the UI reflects the new status without waiting for next polling cycle
- **CaseDetailPage issued parts section**: Replace single `relatedReq` lookup with full multi-part display — find ALL part requests for the case (including partially issued multi-part requests), show each part's status, issued-by, technician, date. Group by part code if same code issued multiple times.
- **IssuedPartsPage**: Add collapse/expand grouping by part code. Each group shows: part code, total count (issued/installed/returned), expandable to see individual items with full details
- **Notification routing**: 
  - Supervisor notifications: ONLY receive `part_request` type (new part requests from backend users). Remove any notifications sent to supervisor about part issuance
  - Backend user notifications: ONLY receive `part_issued` type (their part was issued) and case-related (stale, overdue, follow_up, part_pending for their cases). NOT `part_request` type for their own requests
  - Admin notifications: receives ALL types
  - Fix: currently `addPartRequest` sends notification to `cu.id !== cu?.id` which should NOT send to the requester themselves (already correct), but need to verify supervisor filter works correctly
  - Fix: `issuePartRequest` sends `part_request` type notification — change to `part_issued` type for backend user
- **Audit logs**: 
  - Change `issuePartRequest` audit to use `action: "ISSUE"` (not `"UPDATE"`) in `storePilotAuditLogs`
  - Add audit entries for: case status changes, case creation, technician add/edit/delete, vendor add/edit/delete, warehouse/rack/shelf/bin changes, purchase entries, inventory assignments, returns to store, returns to company, user management actions, settings changes
  - Ensure `saveAppDataToBackend` is called after audit log updates so logs persist across devices
- **ReportsPage**: Remove ALL hardcoded fallback values (`|| 8`, `|| 12`, `Math.random()`, fake arrays). Replace with real computed data from store. If no data, show 0 or empty array (charts will render empty state gracefully). Remove fake `topIssuedParts`, `techPerf`, `monthlyPurchases`, `vendorSpend`, `issuesOverTime`, `casesOverTime`, `returnTypes` arrays — compute from real data.

### Remove
- Random/fake data in ReportsPage (Math.random() values, hardcoded fallback numbers)

## Implementation Plan
1. Store: After `issuePartRequest` completes state update, call `get().syncPartRequests()` to immediately re-sync
2. Store: Fix `issuePartRequest` notification type from `part_request` to `part_issued`
3. Store: Change `storePilotAuditLogs` ISSUE entry action from `UPDATE` to `ISSUE`
4. Store: Add comprehensive audit logging to all mutation actions that are missing it
5. CaseDetailPage: Replace single-req issued parts banner with full multi-part grouped display
6. IssuedPartsPage: Add groupBy partCode logic, render collapsible groups
7. ReportsPage: Rewrite all data computations using real store data only
8. AuditLogsPage: Add `ISSUE` to the ACTION_COLORS/ACTION_ICONS maps (already has it structurally, verify it renders)
