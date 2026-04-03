# Servicedesk-Pro

## Current State

A full-stack service centre management system on ICP (Motoko + React). Key relevant current state:

- **CaseDetailPage.tsx** (1606 lines): Has a status update form. When `part_required` is chosen, multi-part entries (code/name/photo) can be added. When a closing status is chosen, closing photos can be uploaded. All photos (regardless of type) go into `caseData.photos[]` as `CasePhoto` objects with types like `after`, `part`, etc. The Photos section at the bottom shows all photos without grouping.
- **Case type** in `types/index.ts`: Has `photos: CasePhoto[]` field. No separate `caseRelatedImages` field exists yet.
- **Part issuance** (`issuePartToTechnician` in store): Updates part status to `issued` and calls `saveInventoryToBackend()` async. Then calls `syncPartRequests()` with a 200ms delay. The lag issue: there is no immediate sync broadcast to other clients after inventory change. Pending location logic: parts with empty `rackId/shelfId/binId` and status `in_stock` show as pending location. When issued, `status` becomes `issued` but there is a bug -- the pending location section may still show them.
- **returnPartToStore**: Sets `status: returned_to_store` but does NOT set `rackId/shelfId/binId` back to empty -- so returned parts won't re-appear in pending location if they had no location before.
- **Lifecycle section** (`LifecyclePage.tsx`): Reads `partLifecycle` from store. Lifecycle entries ARE being written in some places (issuePartToTechnician, returnPartToStore, addPartRequest) but NOT comprehensively (missing: purchase entry, location assign, relocate, return to company, part request issue).
- **Audit logs** (`AuditLogsPage.tsx`, `storePilotAuditLogs`): Some actions ARE logged but coverage is incomplete -- missing entries for many case updates, inventory changes.
- **IssuedPartsPage.tsx**: Shows `issueDate` but not time.
- **ExistingCasesPage.tsx**: Has `partImages`, `partCode`, `partCodes`, `poNumbers` fields. No separate `caseRelatedImages` field.
- **PartRequestsPage.tsx**: Shows part images but no separate case-related images section.

## Requested Changes (Diff)

### Add

1. **`caseRelatedImages` field** to the `Case` type -- array of `{id, url, name}` objects for product photos, serial number, invoice, rating etc.
2. **Case-related images upload section** in CaseDetailPage:
   - Below the part entries section (when `part_required` is selected): add a "Case Related Images" section where multiple photos can be uploaded. These are stored as `caseRelatedImages` on the case, NOT sent with the part request.
   - When `closed` (or any closing status) is selected: show two upload areas -- (1) closing/after-work photos (existing), (2) "Case Related Images" upload to add more case-related photos.
   - In the Photos section at bottom of CaseDetailPage: split into two sub-sections -- "Part Photos" (photos with type `part`) and "Case Related Images" (`caseRelatedImages`). Both sections support view (click to open) and download.
3. **Case-related images in ExistingCasesPage**: When status is `closed`, show two upload fields -- one for part images (existing) and one for case-related images.
4. **Case-related images in PartRequestsPage**: In expanded part request cards, show two photo sections -- Part Photos and Case Related Images (read-only view + download).
5. **Lifecycle entries** must be added for ALL inventory events: purchase entry added, location assigned, part relocated, part returned to company, part request issued (currently missing).
6. **Audit log entries** must be added comprehensively for: every case status change, case create, case close, part request sent/issued/rejected/cancelled, purchase entry added, location assigned, warehouse CRUD, technician CRUD, vendor CRUD, master data changes, notice CRUD, user management actions.

### Modify

1. **Part issuance lag fix**: After `issuePartToTechnician` and `issuePartRequest`, immediately trigger `saveInventoryToBackend()` synchronously (await it or chain it directly), then trigger a fast sync. Also fix: when a part is issued from `issuePartRequest`, the part item created/updated must be immediately saved and visible.
2. **Pending location fix**:
   - When a part is issued (`issuePartToTechnician`): part with no location (empty rackId) is removed from pending location view -- already implicit since status changes from `in_stock` to `issued`.
   - When `returnPartToStore` is called: if the original part had no location (rackId/shelfId/binId were empty before issuance), clear those fields back to empty so it re-appears in pending location section.
   - The pending location section filter must be: `status === 'in_stock'` AND (`rackId` is empty OR `shelfId` is empty OR `binId` is empty). This should already work IF the return correctly clears location.
3. **IssuedPartsPage**: Format `issueDate` to show both date AND time (e.g. `15 Jan 2025, 10:30 AM`).
4. **Lifecycle completeness**: Add lifecycle entries in `addPurchaseEntry`, `assignPartLocation`, `relocatePart`, `returnPartToCompany`, and in `issuePartRequest` (for each individual part issued).
5. **Audit log completeness**: Add `addAuditEntry` and `storePilotAuditLogs` entries in `changeStatus`, `addCase`, `addPurchaseEntry`, `assignPartLocation`, all warehouse operations, all technician/vendor operations.
6. **Case type in ExistingCasesPage**: Pass `caseRelatedImages` when saving existing cases.

### Remove
- Nothing removed.

## Implementation Plan

1. **types/index.ts**: Add `caseRelatedImages?: CaseRelatedImage[]` to `Case` type. Add `CaseRelatedImage` interface `{id: string, url: string, name: string}`.
2. **store/index.ts**:
   a. Add `caseRelatedImages` to `updateCase` handling.
   b. Fix `issuePartToTechnician`: after set(), immediately await `saveInventoryToBackend()`, then `setTimeout(() => syncInventory(), 500)`.
   c. Fix `returnPartToStore`: preserve original `rackId/shelfId/binId` in the part item before issuance (save them as `originalRackId` etc), then restore them on return. Simpler: just clear `rackId/shelfId/binId` to `""` on return so unlocated parts go back to pending location.
   d. Fix `issuePartRequest`: await saveInventoryToBackend, then fast sync.
   e. Add lifecycle entries in `addPurchaseEntry`, `assignPartLocation`, `relocatePart`, `returnPartToCompany`, and `issuePartRequest` per-part.
   f. Add comprehensive audit entries in `changeStatus`, `addCase`, `addPurchaseEntry`, `assignPartLocation`, warehouse ops, technician ops, vendor ops.
3. **CaseDetailPage.tsx**:
   a. Add `caseRelatedImages` state (file array + url array).
   b. Below part entries section (when `part_required`): add "Case Related Images" upload section.
   c. When closing status selected: add second upload area for case-related images.
   d. On status save: save `caseRelatedImages` to the case via `updateCase`.
   e. Photos section: split into "Part Photos" and "Case Related Images" with view/download buttons per image.
4. **ExistingCasesPage.tsx**: When status is `closed`, add case-related images upload field alongside part images.
5. **PartRequestsPage.tsx**: In expanded card view, show two photo sections (Part Photos, Case Related Images) with view/download.
6. **IssuedPartsPage.tsx**: Update date display to include time.
