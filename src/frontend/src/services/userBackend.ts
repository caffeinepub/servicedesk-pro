import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";

export interface SdUser {
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

// IDL factory for SD user methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sdUserIdlFactory = ({ IDL }: any) => {
  const SdUser = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    email: IDL.Text,
    password: IDL.Text,
    phone: IDL.Text,
    role: IDL.Text,
    status: IDL.Text,
    createdAt: IDL.Text,
    lastLogin: IDL.Text,
  });
  return IDL.Service({
    initSeedUsers: IDL.Func([], [], []),
    getSdUsers: IDL.Func([], [IDL.Vec(SdUser)], ["query"]),
    loginSdUser: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(SdUser)], ["query"]),
    createSdUser: IDL.Func(
      [
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
      ],
      [SdUser],
      [],
    ),
    approveSdUser: IDL.Func([IDL.Text], [], []),
    rejectSdUser: IDL.Func([IDL.Text], [], []),
    editSdUser: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [],
      [],
    ),
    deleteSdUser: IDL.Func([IDL.Text], [], []),
    updateSdUserLogin: IDL.Func([IDL.Text, IDL.Text], [], []),
  });
};

type SdUserActor = {
  initSeedUsers(): Promise<void>;
  getSdUsers(): Promise<SdUser[]>;
  loginSdUser(email: string, password: string): Promise<[] | [SdUser]>;
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

export async function getBackendActor(): Promise<SdUserActor> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actor = Actor.createActor(sdUserIdlFactory as any, {
    agent,
    canisterId: config.backend_canister_id,
  }) as unknown as SdUserActor;
  return actor;
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
    if (Array.isArray(result) && result.length > 0 && result[0]) {
      return mapSdUser(result[0]);
    }
    return null;
  } catch (e) {
    console.error("backendLoginUser error:", e);
    return null;
  }
}

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
  return actor.createSdUser(
    id,
    name,
    email,
    password,
    phone,
    role,
    status,
    createdAt,
  );
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

// ─── Part Request Backend ────────────────────────────────────────────────────

export interface SdPartRequest {
  id: string;
  caseId: string;
  caseDbId: string;
  customerName: string;
  partName: string;
  partCode: string;
  partPhotoUrl: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  status: string;
  technicianId: string;
  issuedAt: string;
  issuedBy: string;
  issuedByName: string;
  rejectedReason: string;
  rejectedAt: string;
  rejectedBy: string;
  rejectedByName: string;
  message: string;
  productType: string;
  companyName: string;
  priority: string;
  cancelledBy: string;
  cancelledByName: string;
  cancelledAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sdPartRequestIdlFactory = ({ IDL }: any) => {
  const SdPartRequest = IDL.Record({
    id: IDL.Text,
    caseId: IDL.Text,
    caseDbId: IDL.Text,
    customerName: IDL.Text,
    partName: IDL.Text,
    partCode: IDL.Text,
    partPhotoUrl: IDL.Text,
    requestedBy: IDL.Text,
    requestedByName: IDL.Text,
    requestedAt: IDL.Text,
    status: IDL.Text,
    technicianId: IDL.Text,
    issuedAt: IDL.Text,
    issuedBy: IDL.Text,
    issuedByName: IDL.Text,
    rejectedReason: IDL.Text,
    rejectedAt: IDL.Text,
    rejectedBy: IDL.Text,
    rejectedByName: IDL.Text,
    message: IDL.Text,
    productType: IDL.Text,
    companyName: IDL.Text,
    priority: IDL.Text,
    cancelledBy: IDL.Text,
    cancelledByName: IDL.Text,
    cancelledAt: IDL.Text,
  });
  return IDL.Service({
    getSdPartRequests: IDL.Func([], [IDL.Vec(SdPartRequest)], ["query"]),
    // 14 params: id, caseId, caseDbId, customerName, partName, partCode, partPhotoUrl,
    //            requestedBy, requestedByName, requestedAt, message, productType, companyName, priority
    createSdPartRequest: IDL.Func(
      [
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
      ],
      [SdPartRequest],
      [],
    ),
    issueSdPartRequest: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [],
      [],
    ),
    rejectSdPartRequest: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [],
      [],
    ),
    deleteSdPartRequest: IDL.Func([IDL.Text], [], []),
    // 4 params: id, cancelledBy, cancelledByName, cancelledAt
    cancelSdPartRequest: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [],
      [],
    ),
  });
};

type SdPartRequestActor = {
  getSdPartRequests(): Promise<SdPartRequest[]>;
  createSdPartRequest(
    id: string,
    caseId: string,
    caseDbId: string,
    customerName: string,
    partName: string,
    partCode: string,
    partPhotoUrl: string,
    requestedBy: string,
    requestedByName: string,
    requestedAt: string,
    message: string,
    productType: string,
    companyName: string,
    priority: string,
  ): Promise<SdPartRequest>;
  issueSdPartRequest(
    id: string,
    technicianId: string,
    issuedAt: string,
    issuedBy: string,
    issuedByName: string,
  ): Promise<void>;
  rejectSdPartRequest(
    id: string,
    reason: string,
    rejectedAt: string,
    rejectedBy: string,
    rejectedByName: string,
  ): Promise<void>;
  deleteSdPartRequest(id: string): Promise<void>;
  cancelSdPartRequest(
    id: string,
    cancelledBy: string,
    cancelledByName: string,
    cancelledAt: string,
  ): Promise<void>;
};

async function getPartReqActor(): Promise<SdPartRequestActor> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actor = Actor.createActor(sdPartRequestIdlFactory as any, {
    agent,
    canisterId: config.backend_canister_id,
  }) as unknown as SdPartRequestActor;
  return actor;
}

export async function backendGetPartRequests(): Promise<SdPartRequest[]> {
  try {
    const actor = await getPartReqActor();
    return await actor.getSdPartRequests();
  } catch (e) {
    console.error("backendGetPartRequests error:", e);
    return [];
  }
}

export async function backendCreatePartRequest(
  id: string,
  caseId: string,
  caseDbId: string,
  customerName: string,
  partName: string,
  partCode: string,
  partPhotoUrl: string,
  requestedBy: string,
  requestedByName: string,
  requestedAt: string,
  message: string,
  productType: string,
  companyName: string,
  priority: string,
): Promise<SdPartRequest> {
  const actor = await getPartReqActor();
  return actor.createSdPartRequest(
    id,
    caseId,
    caseDbId,
    customerName,
    partName,
    partCode,
    partPhotoUrl,
    requestedBy,
    requestedByName,
    requestedAt,
    message,
    productType,
    companyName,
    priority,
  );
}

export async function backendIssuePartRequest(
  id: string,
  technicianId: string,
  issuedAt: string,
  issuedBy: string,
  issuedByName: string,
): Promise<void> {
  try {
    const actor = await getPartReqActor();
    await actor.issueSdPartRequest(
      id,
      technicianId,
      issuedAt,
      issuedBy,
      issuedByName,
    );
  } catch (e) {
    console.error("backendIssuePartRequest error:", e);
  }
}

export async function backendRejectPartRequest(
  id: string,
  reason: string,
  rejectedAt: string,
  rejectedBy: string,
  rejectedByName: string,
): Promise<void> {
  try {
    const actor = await getPartReqActor();
    await actor.rejectSdPartRequest(
      id,
      reason,
      rejectedAt,
      rejectedBy,
      rejectedByName,
    );
  } catch (e) {
    console.error("backendRejectPartRequest error:", e);
  }
}

export async function backendDeletePartRequest(id: string): Promise<void> {
  try {
    const actor = await getPartReqActor();
    await actor.deleteSdPartRequest(id);
  } catch (e) {
    console.error("backendDeletePartRequest error:", e);
  }
}

export async function backendCancelPartRequest(
  id: string,
  cancelledBy: string,
  cancelledByName: string,
  cancelledAt: string,
): Promise<void> {
  try {
    const actor = await getPartReqActor();
    await actor.cancelSdPartRequest(
      id,
      cancelledBy,
      cancelledByName,
      cancelledAt,
    );
  } catch (e) {
    console.error("backendCancelPartRequest error:", e);
  }
}

// ─── Generic JSON Blob actor factory ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeJsonBlobIdlFactory(setMethod: string, getMethod: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ IDL }: any) =>
    IDL.Service({
      [setMethod]: IDL.Func([IDL.Text], [], []),
      [getMethod]: IDL.Func([], [IDL.Text], ["query"]),
    });
}

type JsonBlobActor = {
  [key: string]: (arg?: string) => Promise<string | undefined>;
};

async function makeJsonBlobActor(
  setMethod: string,
  getMethod: string,
): Promise<JsonBlobActor> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  const factory = makeJsonBlobIdlFactory(setMethod, getMethod);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Actor.createActor(factory as any, {
    agent,
    canisterId: config.backend_canister_id,
  }) as unknown as JsonBlobActor;
}

// ─── Cases JSON blob ─────────────────────────────────────────────────────────
async function getCasesActor() {
  return makeJsonBlobActor("setSdCases", "getSdCasesJson");
}
export async function backendGetCasesJson(): Promise<string> {
  try {
    return (await (await getCasesActor()).getSdCasesJson()) as string;
  } catch (e) {
    console.error("backendGetCasesJson error:", e);
    return "[]";
  }
}
export async function backendSetCasesJson(json: string): Promise<void> {
  try {
    await (await getCasesActor()).setSdCases(json);
  } catch (e) {
    console.error("backendSetCasesJson error:", e);
  }
}

// ─── Notices JSON blob ─────────────────────────────────────────────────────────
async function getNoticesActor() {
  return makeJsonBlobActor("setSdNotices", "getSdNoticesJson");
}
export async function backendGetNoticesJson(): Promise<string> {
  try {
    return (await (await getNoticesActor()).getSdNoticesJson()) as string;
  } catch (e) {
    console.error("backendGetNoticesJson error:", e);
    return "[]";
  }
}
export async function backendSetNoticesJson(json: string): Promise<void> {
  try {
    await (await getNoticesActor()).setSdNotices(json);
  } catch (e) {
    console.error("backendSetNoticesJson error:", e);
  }
}

// ─── Inventory JSON blob ─────────────────────────────────────────────────────
async function getInventoryActor() {
  return makeJsonBlobActor("setSdInventory", "getSdInventoryJson");
}
export async function backendGetInventoryJson(): Promise<string> {
  try {
    return (await (await getInventoryActor()).getSdInventoryJson()) as string;
  } catch (e) {
    console.error("backendGetInventoryJson error:", e);
    return "{}";
  }
}
export async function backendSetInventoryJson(json: string): Promise<void> {
  try {
    await (await getInventoryActor()).setSdInventory(json);
  } catch (e) {
    console.error("backendSetInventoryJson error:", e);
  }
}

// ─── App Data JSON blob (warehouse, technicians, vendors, masters, etc.) ─────
async function getAppDataActor() {
  return makeJsonBlobActor("setSdAppData", "getSdAppDataJson");
}
export async function backendGetAppDataJson(): Promise<string> {
  try {
    return (await (await getAppDataActor()).getSdAppDataJson()) as string;
  } catch (e) {
    console.error("backendGetAppDataJson error:", e);
    return "{}";
  }
}
export async function backendSetAppDataJson(json: string): Promise<void> {
  try {
    await (await getAppDataActor()).setSdAppData(json);
  } catch (e) {
    console.error("backendSetAppDataJson error:", e);
  }
}

// ─── Part Requests JSON blob ──────────────────────────────────────────────────
async function getPartRequestsJsonActor() {
  return makeJsonBlobActor("setSdPartRequestsJson", "getSdPartRequestsJson");
}
export async function backendGetPartRequestsJson(): Promise<string> {
  try {
    return (await (
      await getPartRequestsJsonActor()
    ).getSdPartRequestsJson()) as string;
  } catch (e) {
    console.error("backendGetPartRequestsJson error:", e);
    return "[]";
  }
}
export async function backendSetPartRequestsJson(json: string): Promise<void> {
  try {
    await (await getPartRequestsJsonActor()).setSdPartRequestsJson(json);
  } catch (e) {
    console.error("backendSetPartRequestsJson error:", e);
  }
}
