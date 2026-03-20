# Servicedesk-Pro – Version 13

## Current State
The app is live with case management and StorePilot inventory modules. DashboardPage shows only the case dashboard with no tabs. PurchasePage lacks invoice image upload and per-part image upload fields. Duplicate part codes are incorrectly blocked — same code across different purchases should be allowed (only block duplicates within the same purchase entry). In IssuedPartsPage the "Return to Company" button appears even when a part is actively issued (status=issued), which is wrong — a part must be returned to store first before it can be returned to company. The UserRole type only has "admin" and "backend_user" — no "supervisor" role exists yet, so StorePilot role-based access is not enforced.

## Requested Changes (Diff)

### Add
- `supervisor` to UserRole type and seed users (add a supervisor seed user)
- Dashboard tabs based on role: Admin sees two tabs ("Case Dashboard" and "Store Dashboard"), Supervisor sees only "Store Dashboard", Regular User (backend_user) sees only "Case Dashboard"
- Store Dashboard tab content: summary cards for total parts in stock, parts issued to technicians, total purchases, location pending count; recent issued parts list; stock by company breakdown
- Invoice image upload field in PurchasePage (optional, stores as base64 data URL or filename reference in PurchaseEntry)
- Per-part image upload field for each part code entry in PurchasePage (optional, each PartInventoryItem gets an imageUrl field)
- `invoiceImageUrl` field to PurchaseEntry type
- `imageUrl` field to PartInventoryItem type
- Seed supervisor user: name "Supervisor", email "supervisor@servicedesk.com", password "Super@123", role "supervisor"

### Modify
- UserRole type: add "supervisor" | change from `"admin" | "backend_user"` to `"admin" | "supervisor" | "backend_user"`
- Layout sidebar: Supervisor role should see StorePilot sections (Inventory, Purchase, Issued Parts, Warehouse, Masters) plus case sections; backend_user sees only case sections (no StorePilot links)
- PurchasePage validate(): remove duplicate part code check against existing `partItems` (allow same code across purchases); only block duplicates WITHIN the current purchase entry form
- IssuedPartsPage: hide/disable "Return to Co." button when part status is "issued" — only show it when status is "installed" or "returned_to_store". Show a tooltip/note: "Return to store first before returning to company"
- addPurchaseEntry store action: accept optional invoiceImageUrl and per-part imageUrl, store them in PurchaseEntry and PartInventoryItem respectively
- DashboardPage: wrap entire content in role-based tabs logic

### Remove
- Nothing removed from existing functionality

## Implementation Plan
1. Update `types/index.ts`: add `supervisor` to UserRole, add `invoiceImageUrl?: string` to PurchaseEntry, add `imageUrl?: string` to PartInventoryItem
2. Update `store/index.ts`: add supervisor seed user, update `addPurchaseEntry` signature to accept invoiceImageUrl and per-part images, store them correctly
3. Update `DashboardPage.tsx`: detect current user role, render tabs (Tabs/TabsList/TabsTrigger from shadcn). Admin gets Case tab + Store tab. Supervisor gets only Store tab. backend_user gets only Case tab. Store tab shows stat cards + recent issues + stock summary.
4. Update `PurchasePage.tsx`: add invoice image upload input (type=file, accept="image/*", convert to base64). Add per-part image upload inside each part code entry block. Pass images to `addPurchaseEntry`.
5. Update `IssuedPartsPage.tsx`: hide "Return to Co." button when `p.status === "issued"`. Show it only for `installed` status. Add small note text for issued parts.
6. Update `Layout.tsx`: add supervisor to sidebar StorePilot section visibility check (currently likely only admin sees it — extend to supervisor too).
