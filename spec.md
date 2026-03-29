# Servicedesk-Pro

## Current State
- Full-stack ICP app with Motoko backend and React/Zustand frontend
- Backend stores users, part requests, cases, notices, inventory as stable vars or JSON blobs
- App polls every 8 seconds for live sync across devices
- Seed data (SEED_CASES, SEED_TECHNICIANS, SEED_PART_ITEMS, etc.) populates initial state, cluttering the app with fake data
- `addCase` always overrides user-provided caseId with auto-generated `MD-YYYY-NNN`
- `updateSettings` does not call `saveAppDataToBackend()`, so product types added in settings never persist
- Notifications are a mix of seeded fake data and real generated ones, causing incorrect unread counts
- ExistingCasesPage lacks Part Code field (for Part Required status) and PO Number field (for Part Ordered status)

## Requested Changes (Diff)

### Add
- ExistingCasesPage: Part Code field (visible only when status = "part_required")
- ExistingCasesPage: PO Number field (visible only when status = "part_ordered")
- Notification generation: real notifications from actual cases/part requests, role-filtered

### Modify
- `addCase`: if caseId is provided by user, use it as-is; only auto-generate if empty
- `updateSettings`: add `saveAppDataToBackend()` call after updating state
- Remove all seed data arrays (SEED_CASES, SEED_TECHNICIANS, SEED_PART_ITEMS, SEED_PURCHASES, SEED_STORE_NOTIFICATIONS, SEED_LIFECYCLE, SEED_VENDORS, SEED_PART_REQUESTS, SEED_ADMIN_NOTICES) — replace with empty arrays
- Notification unread count in Layout: only count notifications that are actually in the notifications array (no fake counts)
- syncAppData: also sync settings always (not just when `parsed.settings` exists)

### Remove
- All hardcoded seed data except SEED_USERS (admin only)

## Implementation Plan
1. Remove all seed arrays from store/index.ts, keep only SEED_USERS
2. Fix addCase to preserve user-provided caseId
3. Fix updateSettings to persist to backend
4. Fix ExistingCasesPage to add Part Code + PO Number conditional fields
5. Ensure notification counts only reflect real unread notifications (already correct, just fixing source data)
6. Validate frontend builds
