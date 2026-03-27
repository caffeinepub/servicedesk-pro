# Servicedesk-Pro

## Current State
- Sidebar uses CollapsibleSection with groups and sub-groups for ALL roles (admin, supervisor, backend_user)
- Notification unread badge uses raw count of ALL notifications regardless of role
- Store uses `persist` middleware saving to localStorage, causing cross-device sync failures because on app load, localStorage data overrides backend data
- Technicians, vendors, warehouse racks/shelves/bins, categories, companies, part names, and other AppData are saved to backend via saveAppDataToBackend but on load, localStorage may serve stale/old data instead of fresh backend data

## Requested Changes (Diff)

### Add
- Flat sidebar for supervisor and backend_user: no groups, no sub-groups — direct NavButton items in order
- Role-filtered unread count for notification badge in sidebar

### Modify
- Supervisor sidebar: flat list showing Dashboard (standalone top), then directly: Warehouse, Inventory, Purchase Entry, Issued Parts, Return to Company, Part Requests, Reports — no groups/sub-groups
- Backend user sidebar: flat list showing Dashboard (standalone top), then directly: All Cases, New Case, Customer History, Parts Tracking, Part Requests, Reports — no groups/sub-groups
- Admin sidebar: keep exactly as-is (groups + sub-groups with collapse/expand)
- Notification badge `unread` count: filter by role before computing — supervisor sees only inventory/store notifications, backend user sees only their own case+part notifications, admin sees all
- Remove localStorage `persist` middleware from the store, OR ensure that on every app init and poll, backend data FULLY REPLACES local state (not merges). The backend is the source of truth. On initUsers, replace entirely. On initInventory/initCases/initNotices/initAppData, always fetch from backend and replace local state.
- In polling (every 8 seconds), always replace local state with fresh backend data for: users, partRequests, cases, notices, appData (technicians, vendors, warehouse, inventory etc.)

### Remove
- Nothing — all existing features and pages stay intact

## Implementation Plan
1. In Layout.tsx: Add flat sidebar rendering for supervisor and backend_user roles using simple NavButton lists (no CollapsibleSection)
2. In Layout.tsx SidebarContent: compute role-filtered `unreadForRole` count based on currentUser.role and pass that to the Notifications NavButton badge
3. In store/index.ts: In `initUsers`, `initCases`, `initInventory`, `initNotices`, `initAppData`, and all polling functions — use `set()` with backend data replacing local state entirely (not merging with localStorage)
4. In store/index.ts: Remove the `persist` middleware completely or ensure persist `partialize` only saves UI preferences (currentPage, collapsed state) — NOT application data
