export type CaseStatus =
  | "new"
  | "printed"
  | "confirmed"
  | "pending"
  | "on_route"
  | "cancelled"
  | "transferred"
  | "rescheduled"
  | "part_required"
  | "part_ordered"
  | "part_received"
  | "re_open"
  | "gas_charge_pending"
  | "gas_charge_done"
  | "adjustment_closed"
  | "replacement_done"
  | "closed";

export type ComplaintType = "installation" | "breakdown" | "stock_repair";
export type UserRole = "admin" | "supervisor" | "backend_user";
export type UserStatus = "pending" | "approved" | "rejected";
export type PhotoType =
  | "product"
  | "serial"
  | "invoice"
  | "before"
  | "after"
  | "part";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
  lastActive: string;
  isOnline: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  isActive: boolean;
  createdAt: string;
  technicianCode?: string;
}

export interface CasePhoto {
  id: string;
  url: string;
  type: PhotoType;
  name: string;
}

export interface AuditEntry {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Reminder {
  id: string;
  caseId: string;
  userId: string;
  reminderDate: string;
  note: string;
  isDone: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type:
    | "follow_up"
    | "overdue"
    | "part_pending"
    | "general"
    | "stale_case"
    | "part_request"
    | "low_stock"
    | "part_issued"
    | "part_returned"
    | "ai_insight";
  isRead: boolean;
  caseId?: string;
  createdAt: string;
  relatedPartCode?: string;
}

export interface Case {
  id: string;
  caseId: string;
  customerName: string;
  phone: string;
  altPhone: string;
  address: string;
  product: string;
  productType: string;
  complaintType: ComplaintType;
  status: CaseStatus;
  technicianId: string;
  technicianFeedback: string;
  partCode: string;
  partName: string;
  partPhotoUrl: string;
  poNumber: string;
  orderDate: string;
  receivedDate: string;
  nextActionDate: string;
  remarks: string;
  additionalNotes: string;
  photos: CasePhoto[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  direction?: "ltr" | "rtl";
  color?: string;
  speed?: "slow" | "normal" | "fast";
  closedAt: string;
  hasFirstUpdate: boolean;
  onRouteDate: string;
}

export interface Settings {
  supervisorWhatsApp: string;
  supervisorName: string;
  companyName: string;
  products: string[];
}

export type PageType =
  | "login"
  | "register"
  | "dashboard"
  | "cases"
  | "new-case"
  | "case-detail"
  | "customer-history"
  | "parts"
  | "technicians"
  | "reports"
  | "settings"
  | "admin"
  | "profile"
  | "inventory"
  | "purchase"
  | "part-detail"
  | "issued-parts"
  | "warehouse"
  | "masters"
  | "part-requests"
  | "vendors"
  | "return-to-company"
  | "lifecycle"
  | "ai-engine"
  | "notifications"
  | "audit-logs"
  | "notices"
  | "data-management";

// ── StorePilot Types ────────────────────────────────────────────────────────

export interface StockCompany {
  id: string;
  name: string;
  createdAt: string;
}

export interface StockCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface StockPartName {
  id: string;
  name: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface WarehouseRack {
  id: string;
  name: string;
  warehouseId: string;
  createdAt: string;
}

export interface WarehouseShelf {
  id: string;
  name: string;
  rackId: string;
  createdAt: string;
}

export interface WarehouseBin {
  id: string;
  name: string;
  shelfId: string;
  createdAt: string;
}

export type PartItemStatus =
  | "in_stock"
  | "issued"
  | "installed"
  | "returned_to_store"
  | "returned_to_company";

export interface PartInventoryItem {
  id: string;
  partCode: string;
  purchaseId: string;
  companyId: string;
  categoryId: string;
  partNameId: string;
  rackId: string;
  shelfId: string;
  binId: string;
  status: PartItemStatus;
  technicianId: string;
  caseId: string;
  issueDate: string;
  issuedBy: string;
  installedAt: string;
  returnedToStoreAt: string;
  returnRemarks: string;
  returnedToCompanyAt: string;
  returnToCompanyReason: string;
  returnToCompanyRemarks: string;
  returnedToCompanyBy: string;
  createdAt: string;
  imageUrl?: string;
  partImageUrls?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface PurchaseEntry {
  id: string;
  vendorName: string;
  vendorId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  companyId: string;
  categoryId: string;
  partNameId: string;
  quantity: number;
  createdAt: string;
  createdBy: string;
  direction?: "ltr" | "rtl";
  color?: string;
  speed?: "slow" | "normal" | "fast";
  invoiceImageUrl?: string;
  costPrice?: number;
}

export interface PartLifecycleEntry {
  id: string;
  partId: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface StoreNotification {
  id: string;
  title: string;
  message: string;
  type: "part_issued" | "part_returned" | "low_stock" | "reminder" | "ai";
  priority: "low" | "medium" | "high" | "critical";
  isRead: boolean;
  relatedPartCode?: string;
  createdAt: string;
  reminderAt?: string;
}

// ── Part Request Types ────────────────────────────────────────────────────────

export type PartRequestStatus = "pending" | "issued" | "rejected";

export interface PartRequest {
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
  status: PartRequestStatus;
  technicianId: string;
  issuedAt: string;
  issuedBy: string;
  issuedByName: string;
  rejectedReason: string;
  rejectedAt: string;
  rejectedBy: string;
  rejectedByName: string;
}

// ── Admin Notices ────────────────────────────────────────────────────────────
export interface AdminNotice {
  id: string;
  title: string;
  message: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  direction?: "ltr" | "rtl";
  color?: string;
  speed?: "slow" | "normal" | "fast";
}

// ── StorePilotAuditLog ────────────────────────────────────────────────────────
export interface StorePilotAuditLog {
  id: string;
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "ISSUE"
    | "RETURN"
    | "LOGIN"
    | "LOGOUT";
  module: string;
  recordId: string;
  details: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  partCodes?: string[];
}
