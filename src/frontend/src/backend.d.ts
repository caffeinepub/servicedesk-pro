import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
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
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    initializeSystem(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    initSeedUsers(): Promise<void>;
    getSdUsers(): Promise<Array<SdUser>>;
    loginSdUser(email: string, password: string): Promise<Option<SdUser>>;
    createSdUser(id: string, name: string, email: string, password: string, phone: string, role: string, status: string, createdAt: string): Promise<SdUser>;
    approveSdUser(userId: string): Promise<void>;
    rejectSdUser(userId: string): Promise<void>;
    editSdUser(userId: string, name: string, email: string, phone: string, role: string, password: string): Promise<void>;
    deleteSdUser(userId: string): Promise<void>;
    updateSdUserLogin(userId: string, loginTime: string): Promise<void>;
}
