# Servicedesk-Pro

## Current State
- Full backend with Motoko canister storing users, part requests, cases, notices, inventory, app data as stable vars
- Live user-delete polling in App.tsx (every 8s), but NO live polling for cases/notices/partRequests/inventory
- Role-based sidebar but notifications are shown to ALL roles equally (no filtering)
- Part code+part name are mandatory ONLY before sending part request, but not enforced on status update itself
- ExistingCasesPage: no Case ID field, no Part Image upload, no Closed Date
- CaseDetailPage: 'Closed' status has single photo upload, not multiple
- PartRequestsPage: list not sorted by most recent first
- No automatic notifications created when: supervisor issues part (for backend user) or backend user requests part (for supervisor)

## Requested Changes (Diff)

### Add
- Global live polling in App.tsx every 8s: syncCases, syncPartRequests, syncNotices, syncInventory, syncAppData
- Role-based notification filtering in NotificationsPage (admin=all, supervisor=store-only, backend_user=case+their-part-request)
- Auto-create in-app notification for supervisor when backend user sends a part request
- Auto-create in-app notification for backend user when supervisor issues their part request
- Case ID field (manual text input) in ExistingCasesPage
- Part Image upload (multiple, optional) in ExistingCasesPage
- Closed Date field in ExistingCasesPage (only shows when status='closed')
- Multiple image upload on CaseDetailPage when status='closed' is selected

### Modify
- App.tsx: add polling interval for all data types (cases, notices, partRequests, inventory, appData)
- NotificationsPage: filter notifications list based on currentUser.role
- PartRequestsPage: sort all tab lists by requestedAt descending (most recent first)
- CaseDetailPage: enforce part code + part name mandatory both for status save AND part request; also allow multiple closing photos
- ExistingCasesPage: add new fields (caseId, partImages, closedDate)

### Remove
- Nothing

## Implementation Plan
1. App.tsx: add useEffect with setInterval polling all backend sync functions every 8 seconds (in addition to existing user-delete check)
2. PartRequestsPage: sort each tab's list by requestedAt descending
3. PartRequestsPage / store: when a part request is created, add a notification for supervisors/admins; when issued, add notification for the requesting backend user
4. NotificationsPage: add role-based filter - supervisor sees only store-type notifications (issued, returned, low_stock, part_request types), backend_user sees only case/reminder types + notifications tagged with their userId
5. CaseDetailPage: ensure part code + part name validation blocks status save (not just part request), add multiple photo upload support for 'closed' status
6. ExistingCasesPage: add caseId text field, partImages multi-upload (optional), closedDate date picker (conditional on status=closed), update the CaseEntry type and addCase logic
