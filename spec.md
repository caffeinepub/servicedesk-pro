# Servicedesk-Pro

## Current State
Full-stack service centre management app with StorePilot inventory system. Version 39 is deployed. Major features implemented: sidebar with role-gating, Layout with NoticeBanner, InlineSearch, SectionPill, all pages for Cases/Inventory/Admin.

## Requested Changes (Diff)

### Add
- Sidebar collapse toggle moved to TOP of sidebar (inside panel, above nav sections), using a modern ChevronLeft/ChevronRight pill button style
- Most Active Technician card in AI Engine Overview tab (below Stock Health Score and Demand Accuracy)
- Advanced features in AdminNoticesPage: scheduling (start/end date), font size control, bold/italic toggle, speed slider, direction selector, color/theme picker, preview before publishing, pause/resume toggle, active/inactive status per notice
- Data Management page: organized per-data-type cards (Cases, Inventory Parts, Purchase Records, Issued Parts History, Lifecycle Events, Audit Logs, Notifications), each card shows record count + delete all + filter by date range + confirmation dialogs with count

### Modify
- Layout.tsx: Remove X close button from NoticeBanner entirely (no user-dismissable notices)
- Layout.tsx: Move sidebar collapse/expand toggle button from bottom to TOP of sidebar content (above the nav sections, below the logo area), with modern styling
- Layout.tsx: Add proper padding to `<main>` element (p-6) so page content is not flush against edges
- All pages: Add Lucide icons consistently to every section header, card title, table column header, button, tab, form label, stat card — everywhere. Use contextually appropriate icons from Lucide.
- MastersPage: Part Status by Company table should be full-width, matching the same card/section size as the company list below it
- AIEnginePage: Add Most Active Technician card in Overview tab, positioned below Stock Health Score and Demand Accuracy metrics
- footer: Ensure no footer copyright text appears on any page

### Remove
- X (close) button from NoticeBanner in Layout.tsx — notices cannot be dismissed by users
- Sidebar collapse toggle from bottom of sidebar
- Footer copyright text from all pages

## Implementation Plan
1. Update Layout.tsx:
   - Remove X button from NoticeBanner
   - Remove `dismissed` state since no dismissal
   - Move collapse toggle to top of SidebarContent, right below the logo area
   - Style it as a modern pill/rounded button with ChevronLeft/Right
   - Add `p-6` to main content area
2. Update all page files to add Lucide icons consistently throughout:
   - Every section heading gets an icon
   - Every card title gets an icon
   - Every button gets an icon
   - Every tab gets an icon
   - Every stat card gets an icon
   - Table column headers get icons where appropriate
3. Update MastersPage: Make Part Status by Company table same width/styling as company list card
4. Update AIEnginePage: Add Most Active Technician card in Overview tab
5. Update AdminNoticesPage: Full advanced features — scheduling, font size, bold/italic, speed slider, direction, color picker, preview, pause/resume, active/inactive
6. Update DataManagementPage: Organized cards per data type with counts, date range delete, confirmation dialogs
7. Validate build
