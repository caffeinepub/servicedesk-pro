# Servicedesk-Pro

## Current State

- Full-stack ICP app with Motoko backend + React/Zustand frontend
- Part requests exist and are saved to backend via JSON blob; polling is 8 seconds in App.tsx
- PartRequestsPage.tsx shows collapsed cards (Case ID + Part Code + Priority) that expand to show full table details
- The expand/expand view is not unified for all roles - privileged users see a structured greeting table, backend users see a simpler layout
- The `issuePartRequest` store action correctly routes the "issued" notification to `req.requestedBy` (the backend user), but the `addPartRequest` action sends notifications to supervisors+admins AND also the requesting user gets a duplicate notification at creation time which is wrong
- Audit log (`auditLog` array) captures case creation, status changes, but many inventory and part actions only go to `storePilotAuditLogs` (a separate array) or `activityLog` - so the main audit log and storePilotAuditLogs are fragmented
- Lifecycle (`partLifecycle`) does have entries for purchased/location assigned/issued/returned etc., but LifecyclePage.tsx has hardcoded `EXTRA_LIFECYCLE` fake data that is merged with real data - so it always shows fake entries
- LifecyclePage.tsx also has a hardcoded `PART_INFO` lookup for fake part IDs and fake part names/status
- Issue part modal is at the request level only - no per-part individual issue buttons within a multi-part request card
- The part request card design (collapse/expand) is different for privileged vs backend user views

## Requested Changes (Diff)

### Add
- Per-part individual issue buttons inside expanded request card when request has multiple parts (supervisor/admin see an "Issue" button next to each part row that still has `pending` status)
- Comprehensive audit log entries for every write action site-wide: purchase entry, part issued from inventory, part relocated, location assigned, part returned to store, part returned to company, new case, case update, part request created, part request issued, part request rejected, part request cancelled, warehouse/rack/shelf/bin add/edit/delete, technician add/edit/delete, vendor add/edit/delete, company/category/partname add/edit/delete, user created/approved/rejected/deleted, notice published/edited/deleted
- All of the above actions must also add a `storePilotAuditLog` entry (for inventory-related ones) so both arrays are consistent
- Lifecycle entries for: part request created (new action type "Part Requested"), part request issued (action "Issued via Request"), part relocated (already exists but add actor name+role in details), return to company (already exists)

### Modify
- **Live sync speed**: Reduce polling interval from 8s to 3s in App.tsx for snappier updates
- **Notification routing fix**: In `addPartRequest`, the notification should go to supervisors/admins ONLY - do NOT send a notification back to the requesting user at creation time. The backend user already sees the toast. In `issuePartRequest`, notification goes to `req.requestedBy` (backend user) - this is already correct, keep it. In `rejectPartRequest`, notification goes to `req.requestedBy` (backend user) - already correct, keep it. In `cancelPartRequest`, no notification needed (user cancelled themselves). Remove any notification that goes to the current user when they are the actor.
- **Part request card redesign** (same layout for ALL roles - admin, supervisor, backend user): 
  - Collapsed row: Left=CaseID+status badge, Center=part code(s) summary (if multiple parts: "3 parts"), Right=priority badge + chevron icon
  - Expanded view: single consistent design for all roles. Header greeting ("Hello [Time] [Name] ji") only for privileged users. Then a clean table with rows: Case ID (clickable), Customer, Product Type, Company, Requested By (show for privileged), Date/Time, Priority, Status
  - Multi-part section: if `req.parts && req.parts.length > 0`, show each part as its own sub-card row with: Part Code, Part Name, Stock Status badge, Part Photo (view button), individual status badge (pending/issued/rejected), and for supervisor/admin on pending parts: individual "Issue" button + "Reject" button per part row
  - For single-part requests: show Part Code, Part Name, Stock Status, Part Photo in the table
  - Action buttons at bottom: supervisor sees Issue All (if any parts in stock) + Reject All; admin sees Issue All + Reject + Cancel; backend user sees Cancel (if pending, own request)
  - Issued/Rejected/Cancelled info banners remain the same
- **Lifecycle page**: Remove the hardcoded `EXTRA_LIFECYCLE` array and `PART_INFO` lookup entirely. Use only real `partLifecycle` from store. Enhance the part info lookup to pull from real `partItems` and `stockPartNames`/`stockCompanies` instead of the fake `PART_INFO` object.
- **Audit log completeness**: For every action in store that calls `logActivity()`, also add an `addAuditEntry()` call so the case audit log table is populated. For inventory actions, also add a `storePilotAuditLogs` entry.

### Remove
- Hardcoded `EXTRA_LIFECYCLE` constant from `LifecyclePage.tsx`
- Hardcoded `PART_INFO` constant from `LifecyclePage.tsx`
- Duplicate notification to requesting backend user at the time they create a part request

## Implementation Plan

1. **App.tsx**: Change polling interval from 8000ms to 3000ms
2. **store/index.ts**:
   a. `addPartRequest`: Remove notification that goes to the requesting user (only send to supervisors/admins). Add lifecycle entry for "Part Requested" for each part in the request.
   b. `issuePartRequest`: Add lifecycle entries for "Issued via Request" for each issued part. Add storePilotAuditLog entry. The notification to req.requestedBy is already correct.
   c. `rejectPartRequest`: Add storePilotAuditLog entry. Notification to req.requestedBy already correct.
   d. `cancelPartRequest`: Add storePilotAuditLog entry.
   e. All inventory actions (addPurchaseEntry, assignPartLocation, relocatePart, issuePartToTechnician, markPartInstalled, returnPartToStore, returnToCompany): ensure both `storePilotAuditLogs` AND `auditLog` entries are added with full details (actor name, role, timestamp, part code, action description)
   f. All case actions (createCase, updateCase, deleteCase, updateCaseStatus): already have auditEntry calls, just make the details more descriptive
   g. addTechnician/updateTechnician/deleteTechnician: add auditEntry
   h. addVendor/updateVendor/deleteVendor: add auditEntry
   i. addWarehouse/updateWarehouse/deleteWarehouse/addRack/updateRack/deleteRack/addShelf/updateShelf/deleteShelf/addBin/updateBin/deleteBin: add auditEntry
   j. addStockCompany/updateStockCompany/deleteStockCompany/addStockCategory/updateStockCategory/deleteStockCategory/addStockPartName/updateStockPartName/deleteStockPartName: add auditEntry
   k. User management (approveUser, rejectUser, deleteUser, editUser): add auditEntry
   l. Notice actions (addAdminNotice, updateAdminNotice, deleteAdminNotice): add auditEntry
3. **PartRequestsPage.tsx**: Complete redesign of the card layout:
   - Unified collapse/expand for all roles
   - Multi-part sub-rows with individual Issue/Reject buttons for supervisor/admin
   - "Issue All" only enabled when at least one pending part is in stock
   - Per-part issue modal (select technician per part or single modal for all)
4. **LifecyclePage.tsx**: Remove EXTRA_LIFECYCLE and PART_INFO, use only real store data, fix part info lookup to use partItems + stockPartNames/stockCompanies/categories
