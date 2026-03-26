# Servicedesk-Pro

## Current State
Version 70 is live. Cross-device sync is partially working for new users but broken for existing users and all inventory/technician/warehouse mutations. Several structural bugs exist around issued parts flow.

## Requested Changes (Diff)

### Add
- When `issuePartRequest` is called (supervisor issues a part request), also create a `PartInventoryItem` in `partItems` with status `issued` so the issued part appears in Inventory > Operations > Issued Parts
- Add optional `overridePartName` and `overrideCompanyName` fields to `PartInventoryItem` type for part-request-sourced items
- `saveAppDataToBackend()` call after every warehouse/rack/shelf/bin/technician/vendor/stockCompany/stockCategory/stockPartName mutation
- `saveInventoryToBackend()` call after every partItem/purchaseEntry mutation

### Modify
- `initUsers` in store: change `mergeUsers(backendUsers)` to `setUsers(backendUsers)` so backend is always authoritative, not merged with stale localStorage
- `returnPartToStore`: change resulting status from `in_stock` to `returned_to_store` so the Returned to Store tab in IssuedPartsPage actually shows data
- `IssuedPartsPage` display helpers: fall back to `overridePartName`/`overrideCompanyName` when IDs don't resolve
- `PartRequestsPage`: remove the Issued tab entirely (user wants all issued parts to show only in Inventory > Operations > Issued Parts)

### Remove
- Issued tab from PartRequestsPage tabs array and tab display

## Implementation Plan
1. Read and update `src/frontend/src/types/index.ts` - add `overridePartName?: string; overrideCompanyName?: string; partRequestId?: string;` to `PartInventoryItem`
2. Update `src/frontend/src/store/index.ts`:
   a. `initUsers`: use `setUsers` not `mergeUsers` when backend returns users
   b. Add `get().saveAppDataToBackend().catch(() => {})` after every set() in: addTechnician, updateTechnician, deleteTechnician, addVendor, updateVendor, deleteVendor, addStockCompany, updateStockCompany, deleteStockCompany, addStockCategory, updateStockCategory, deleteStockCategory, addStockPartName, updateStockPartName, deleteStockPartName, addWarehouse, updateWarehouse, deleteWarehouse, addRackToWarehouse, addRack, updateRack, deleteRack, addShelf, updateShelf, deleteShelf, addBin, updateBin, deleteBin
   c. Add `get().saveInventoryToBackend().catch(() => {})` after every set() in: addPurchaseEntry, assignPartLocation, issuePartToTechnician, markPartInstalled, returnPartToStore, returnPartToCompany, addExistingStock
   d. Change `returnPartToStore` status from `in_stock` to `returned_to_store`
   e. In `issuePartRequest`: after updating partRequests, also create a PartInventoryItem with status `issued` and call saveInventoryToBackend
3. Update `src/frontend/src/pages/PartRequestsPage.tsx`: remove Issued tab from tab definitions and filter logic
4. Update `src/frontend/src/pages/IssuedPartsPage.tsx`: use overridePartName/overrideCompanyName as fallbacks in display helpers
