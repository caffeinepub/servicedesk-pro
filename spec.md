# ServiceDesk Pro

## Current State

ServiceDesk Pro is a fully frontend (Zustand persisted state) service desk management app for Midea/Toshiba appliances. All data lives in browser localStorage via zustand-persist. The app has: Dashboard, Cases list, Case Detail, New Case, Parts Tracking, Technicians, Reports, Settings, Admin Panel, Customer History, and Notifications.

Current Case type tracks: id, caseId, customerName, phone, altPhone, address, product, complaintType, status, technicianId, technicianFeedback, parts info, photos, createdAt, updatedAt, createdBy, closedAt.

Notification types: follow_up, overdue, part_pending, general.

Audit log tracks all changes.

## Requested Changes (Diff)

### Add
- **Stale Case Tracking fields** on `Case` type: `hasFirstUpdate: boolean` (default false, set true on first post-on_route activity), `onRouteDate: string` (set when case goes on_route)
- **Midnight Reset Logic**: On login, check all cases that are `on_route`, have a technician assigned, `hasFirstUpdate === false`, and `onRouteDate` is before today's date. For each: unassign technician (`technicianId = ""`), set status to `pending`, add audit entry "Auto Reset: No technician update received. Technician unassigned and case reset to Pending."
- **`lastMidnightResetDate` in store**: string field tracking last date the reset was run, to avoid running it multiple times in a day. Reset runs once per day on login.
- **`resetStaleTechnician(caseId)` action**: Manual reset for a single case from the UI.
- **Stale cases in notifications bell**: New type `"stale_case"` - show stale cases (on_route + no first update + onRouteDate before today) in the bell panel under a "No Update" section.
- **"No Update" filter tab in CasesPage**: Add a "No Update" quick filter tab showing only stale cases.
- **Dashboard stale cases widget**: A new warning card on dashboard showing count of stale cases, clickable to go to Cases with "No Update" filter. Placed prominently near top with orange/amber styling.
- **Mobile optimization**: All pages audited for mobile. Use responsive grid patterns, collapsible table areas, better touch targets, proper padding on mobile.
- **Additional features**:
  - Empty states on all list pages (friendly message when no data)
  - Case aging badge shown inline in case detail header
  - "Quick Stats" pill row on CasesPage showing counts by status group
  - Better loading/skeleton states
  - Improved search with clear button

### Modify
- `changeStatus` in store: when newStatus is `on_route`, set `onRouteDate = today`, `hasFirstUpdate = false`. When newStatus is anything else on an `on_route` case, set `hasFirstUpdate = true`.
- `addAuditEntry` indirectly: audit entries are added for auto resets.
- `generateAutoNotifications`: add stale case notifications (type `stale_case`).
- `login` action: call `runMidnightResets()` after login.
- Notification type union: add `"stale_case"`.
- `NotificationPanel`: add stale cases section with amber styling.
- `DashboardPage`: add stale cases KPI card + dedicated warning widget.
- `CasesPage`: add "No Update" tab and highlight stale rows.
- `CaseDetailPage`: show stale warning banner + "Reset Technician" button if applicable.
- All pages: improve mobile responsive layout.

### Remove
- Nothing removed.

## Implementation Plan

1. Update `types/index.ts`: add `hasFirstUpdate`, `onRouteDate` to Case; add `stale_case` to Notification type union.
2. Update `store/index.ts`:
   - Add `lastMidnightResetDate: string` to state.
   - Add `runMidnightResets()` action.
   - Add `resetStaleTechnician(caseId: string)` action.
   - Modify `changeStatus` to set on_route tracking fields.
   - Modify `login` to call `runMidnightResets()`.
   - Modify `generateAutoNotifications` to include stale case alerts.
   - Update SEED_CASES to include hasFirstUpdate/onRouteDate defaults.
3. Update `NotificationPanel.tsx`: add "No Update" section for stale cases.
4. Update `DashboardPage.tsx`: add stale cases card + mini widget panel.
5. Update `CasesPage.tsx`: add "No Update" tab, highlight stale rows, show reset button.
6. Update `CaseDetailPage.tsx`: show stale warning banner and manual reset button when applicable.
7. Mobile audit: fix padding, grid, table overflow across Dashboard, Cases, Parts, Technicians, Reports pages.
