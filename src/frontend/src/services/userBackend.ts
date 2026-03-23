import { createActorWithConfig } from "../config";

interface SdUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

// Extended actor type for SD user management
type ExtendedActor = {
  initSeedUsers(): Promise<void>;
  getSdUsers(): Promise<SdUser[]>;
  loginSdUser(
    email: string,
    password: string,
  ): Promise<{ __kind__: "Some"; value: SdUser } | { __kind__: "None" }>;
  createSdUser(
    id: string,
    name: string,
    email: string,
    password: string,
    phone: string,
    role: string,
    status: string,
    createdAt: string,
  ): Promise<SdUser>;
  approveSdUser(userId: string): Promise<void>;
  rejectSdUser(userId: string): Promise<void>;
  editSdUser(
    userId: string,
    name: string,
    email: string,
    phone: string,
    role: string,
    password: string,
  ): Promise<void>;
  deleteSdUser(userId: string): Promise<void>;
  updateSdUserLogin(userId: string, loginTime: string): Promise<void>;
};

export async function getBackendActor() {
  const actor = await createActorWithConfig();
  return actor as unknown as ExtendedActor;
}

function mapSdUser(u: SdUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    phone: u.phone,
    role: u.role as "admin" | "backend_user" | "supervisor",
    status: u.status as "approved" | "pending" | "rejected",
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    lastActive: u.lastLogin,
    isOnline: false,
  };
}

export async function backendInitSeedUsers(): Promise<void> {
  try {
    const actor = await getBackendActor();
    await actor.initSeedUsers();
  } catch (e) {
    console.error("backendInitSeedUsers error:", e);
  }
}

export async function backendGetUsers() {
  try {
    const actor = await getBackendActor();
    const users = await actor.getSdUsers();
    return users.map(mapSdUser);
  } catch (e) {
    console.error("backendGetUsers error:", e);
    return [];
  }
}

export async function backendLoginUser(email: string, password: string) {
  try {
    const actor = await getBackendActor();
    const result = await actor.loginSdUser(email, password);
    if (result.__kind__ === "Some") {
      return mapSdUser(result.value);
    }
    return null;
  } catch (e) {
    console.error("backendLoginUser error:", e);
    return null;
  }
}

/**
 * Creates a user in the backend canister.
 * THROWS on failure so callers can detect and handle errors.
 * Returns the created user on success.
 */
export async function backendCreateUser(
  id: string,
  name: string,
  email: string,
  password: string,
  phone: string,
  role: string,
  status: string,
  createdAt: string,
): Promise<SdUser> {
  const actor = await getBackendActor();
  const result = await actor.createSdUser(
    id,
    name,
    email,
    password,
    phone,
    role,
    status,
    createdAt,
  );
  return result;
}

export async function backendApproveUser(userId: string): Promise<void> {
  try {
    const actor = await getBackendActor();
    await actor.approveSdUser(userId);
  } catch (e) {
    console.error("backendApproveUser error:", e);
  }
}

export async function backendRejectUser(userId: string): Promise<void> {
  try {
    const actor = await getBackendActor();
    await actor.rejectSdUser(userId);
  } catch (e) {
    console.error("backendRejectUser error:", e);
  }
}

export async function backendEditUser(
  userId: string,
  name: string,
  email: string,
  phone: string,
  role: string,
  password: string,
): Promise<void> {
  try {
    const actor = await getBackendActor();
    await actor.editSdUser(userId, name, email, phone, role, password);
  } catch (e) {
    console.error("backendEditUser error:", e);
  }
}

export async function backendDeleteUser(userId: string): Promise<void> {
  try {
    const actor = await getBackendActor();
    await actor.deleteSdUser(userId);
  } catch (e) {
    console.error("backendDeleteUser error:", e);
  }
}

export async function backendUpdateLastLogin(
  userId: string,
  time: string,
): Promise<void> {
  try {
    const actor = await getBackendActor();
    await actor.updateSdUserLogin(userId, time);
  } catch (e) {
    console.error("backendUpdateLastLogin error:", e);
  }
}
