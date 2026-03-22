# Servicedesk-Pro

## Current State
All data including users is stored in Zustand + localStorage (frontend-only). This means user accounts created/approved by admin on one device are not visible when a different user opens the app on their own device. Admin can log in (hardcoded SEED_USERS), but newly created or approved users cannot sign in from a different browser/device.

## Requested Changes (Diff)

### Add
- Motoko backend: user management canister with functions to create, list, approve, reject, edit, delete users and verify login credentials
- Backend initialization: seed admin user (kumardsemail@gmail.com / Admin@123) and default seed users on first deploy
- Frontend: on app startup, fetch users from backend and populate Zustand store (replacing SEED_USERS as source of truth)
- Frontend: login now calls backend to verify credentials
- Frontend: createUser, approveUser, rejectUser, editUser, deleteUser all write to backend first, then update Zustand cache

### Modify
- store/index.ts: login, createUser, approveUser, rejectUser, editUser, deleteUser, registerUser become async and call backend
- App.tsx: add loading state while fetching users from backend on init

### Remove
- SEED_USERS dependency as the sole source of user truth (backend becomes source of truth)

## Implementation Plan
1. Generate Motoko actor with user management: User type (id, name, email, password, phone, role, status, createdAt, lastLogin), functions: initSeedUsers, loginUser, createUser, getUsers, approveUser, rejectUser, editUser, deleteUser
2. Update frontend store: add async initUsers() that fetches from backend, make auth mutations call backend
3. App.tsx: show loading spinner until initUsers() completes
4. Validate and deploy
