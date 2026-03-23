# Servicedesk-Pro

## Current State
The app is a full service centre management system with StorePilot inventory integration. Version 63 is live. Key issues remain:
- Registration requests not appearing in admin approval tab (backendCreateUser silently swallowed errors; Motoko loginSdUser did case-sensitive email check)
- Admin-created users unable to login (same root cause)
- Badge counts for approvals only show on ADMIN group header when collapsed; no Part Requests counts on groups/sub-groups
- Favicon already linked but might not be rendering properly

## Requested Changes (Diff)

### Add
- `pendingPartRequests` prop to `CollapsibleSection` component
- Badge counts (number) on INVENTORY group header (collapsed + expanded) when there are pending part requests
- Badge counts on Operations sub-group header when there are pending part requests
- Badge counts on Part Requests nav items inside groups (for supervisor)
- Badge count on Administration sub-group header when there are pending approvals
- Show pendingApprovals badge on ADMIN group header ALWAYS (not just when collapsed)

### Modify
- `store/index.ts` `registerUser`: wrap backendCreateUser in try/catch, retry once on failure, add aggressive polling trigger
- `store/index.ts` `createUser`: same robustness improvements
- `store/index.ts` `approveUser`: after approving, force immediate re-fetch and merge
- `store/index.ts` login: after step 3, also try case-insensitive match on raw fresh backend users
- `Layout.tsx` `CollapsibleSection`: add `pendingPartRequests` prop, wire badges to INVENTORY group + Operations sub-group + Part Requests nav items; show approvals badge on Administration sub-group; always show ADMIN badge regardless of groupOpen
- `Layout.tsx` pass `pendingPartRequests` to INVENTORY CollapsibleSection renders (admin and supervisor)
- `AdminPage.tsx` polling: after mount fetch, also trigger every 3 seconds (not just 5s)
- `index.html`: ensure favicon is properly set

### Remove
- Old test seed users (Rahul Verma, supervisor@servicedesk.com) from initSeedUsers — already done in Motoko

## Implementation Plan
1. Fix `store/index.ts`:
   - `registerUser` and `createUser`: after backendCreateUser fails, retry after 1s delay; if both fail, keep local and show warning in console
   - Add `triggerAdminPoll` helper that does immediate backendGetUsers fetch + mergeUsers
   - Call `triggerAdminPoll` after every user creation/registration
   - Fix `approveUser` to immediately re-fetch after approval so approved users can login right away
2. Fix `Layout.tsx`:
   - Add `pendingPartRequests?: number` to CollapsibleSection props
   - In collapsed sidebar: show orange badge on INVENTORY icon if pendingPartRequests > 0
   - In group header: show badge for ADMIN (pendingApprovals) always (not just !groupOpen); show badge for INVENTORY (pendingPartRequests)
   - In sub-group headers: show violet badge on 'Administration' sub-group if pendingApprovals > 0; show orange badge on 'Operations' sub-group if pendingPartRequests > 0
   - In nav items: add part-requests badge using pendingPartRequests
   - Pass pendingPartRequests to all INVENTORY CollapsibleSection renders
3. Fix `AdminPage.tsx`: shorten poll interval to 3s for faster live updates
4. Ensure favicon is set in index.html (already done)
