# ServiceDesk Pro

## Current State
Fully functional service desk with cases, parts tracking, customer history badge in cases list, admin panel, notifications. No delete functionality for cases. Customer history phone matching may miss edge cases. NewCasePage uses 2-column grid not responsive on mobile.

## Requested Changes (Diff)

### Add
- `deleteCase(id: string)` action in store
- `deleteCase` in store state interface
- Delete button (with confirmation dialog) on each case row in CasesPage — admin only
- Delete button in CaseDetailPage header — admin only
- Audit log entry when case is deleted (log who deleted it before removal)

### Modify
- Customer history matching: normalize phone numbers (trim, remove spaces/dashes) before comparing, ensuring at least one number matches between cases
- NewCasePage: all `grid-cols-2` changed to `grid-cols-1 sm:grid-cols-2` so form fields stack on mobile
- CasesPage: hide less-important columns on mobile (product, technician, age) — keep Case ID, Customer, Phone, Status, Cust. History visible

### Remove
- Nothing removed

## Implementation Plan
1. Add `deleteCase` to store interface and implementation (filters out the case from state)
2. Update CasesPage: add delete icon button per row (admin only), with AlertDialog confirmation
3. Update CaseDetailPage: add Delete Case button in header (admin only), with AlertDialog confirmation, navigate to cases after delete
4. Fix phone normalization in `getCustomerHistory` in CasesPage — strip non-digits before comparing
5. Fix NewCasePage grid to be `grid-cols-1 sm:grid-cols-2`
6. Improve CasesPage table mobile view with hidden columns
