# Servicedesk-Pro

## Current State
Version 61 is live. Core features include case management, StorePilot inventory, admin panel, warehouse, lifecycle, AI engine, reports, notifications, audit logs, notices, data management. User auth is partially working -- login/registration have ongoing issues with live updates and edge cases.

## Requested Changes (Diff)

### Add
- Stale case auto-reset: at midnight every day, cases assigned to a technician with no update since previous day get technician unassigned and flagged as 'no update'; notification generated; appears in Stale Cases tab
- Scheduled case notifications: when app loads each day, check cases with a scheduled date = today and generate reminder notifications
- Part request live update: new part requests appear without reload; dot badge on Part Requests sidebar item matching section color
- Sidebar logo/title/tagline: match login page style exactly (same font, color, logo icon style)

### Modify
- Registration live updates: when a user registers, the request appears in admin approval section live (within 5 seconds, no reload) with a dot on Admin Panel sidebar item matching the admin panel violet color
- Email uniqueness: case-insensitive comparison everywhere
- Duplicate registration handling: if email exists and is PENDING → redirect to separate RegisterPendingPage; if APPROVED → redirect to RegisterApprovedPage; if REJECTED → redirect to RegisterRejectedPage showing reason + apply again button
- Mobile number: mandatory, exactly 10 digits on both register and add-user forms
- Admin rejection: admin must provide a reason when rejecting; reason stored and shown to rejected user
- Deleted user: triggers immediate logout live (no reload) -- existing but needs to be confirmed working
- Admin delete user: confirmation dialog before deletion
- Rejected users: do NOT appear in the active user list
- Notices live updates: when admin publishes/edits/deletes/pauses/resumes a notice, the banner updates live for all users without reload (poll every 3 seconds)
- Admin user creation/approval: fix so created/approved users can immediately log in (password hashing consistency)

### Remove
- Nothing removed

## Implementation Plan
1. Fix login/auth: ensure password comparison is consistent (plain text comparison since we store plain text), fix mergeUsers not wiping existing users
2. Fix registration live update: poll registrationRequests from store every 5 seconds in AdminPage approval tab
3. Fix duplicate email check on registration: redirect to appropriate page (Pending/Approved/Rejected) based on status
4. Fix mobile validation: 10 digits mandatory on register + admin add-user
5. Fix rejection flow: require reason field, store reason, show on RegisterRejectedPage with apply again
6. Fix deleted user auto-logout: poll current user's status every 10 seconds
7. Fix rejected users hidden from user list
8. Stale case logic: on app load, check if past midnight since last check; reset cases with no update and unassign technician; add notification
9. Scheduled case notifications: on app load each day, check cases scheduled for today and generate notifications
10. Notices live: poll notices store every 3 seconds, update banner reactively
11. Part request dot badge: add pending count to sidebar Part Requests item
12. Sidebar logo: match login page style (teal/emerald gradient, same icon, tagline)
