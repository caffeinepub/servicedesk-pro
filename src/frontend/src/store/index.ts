import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  backendApproveUser,
  backendCreateUser,
  backendDeleteUser,
  backendEditUser,
  backendGetUsers,
  backendInitSeedUsers,
  backendLoginUser,
  backendRejectUser,
  backendUpdateLastLogin,
} from "../services/userBackend";
import {
  backendCancelPartRequest,
  backendCreatePartRequest,
  backendGetAppDataJson,
  backendGetCasesJson,
  backendGetInventoryJson,
  backendGetNoticesJson,
  backendGetPartRequests,
  backendGetPartRequestsJson,
  backendIssuePartRequest,
  backendRejectPartRequest,
  backendSetAppDataJson,
  backendSetCasesJson,
  backendSetInventoryJson,
  backendSetNoticesJson,
  backendSetPartRequestsJson,
} from "../services/userBackend";
import type {
  ActivityLog,
  AdminNotice,
  AuditEntry,
  Case,
  CasePhoto,
  CaseStatus,
  Notification,
  PageType,
  PartInventoryItem,
  PartItemStatus,
  PartLifecycleEntry,
  PartRequest,
  PartRequestItem,
  PartRequestStatus,
  PhotoType,
  PurchaseEntry,
  Reminder,
  Settings,
  StockCategory,
  StockCompany,
  StockPartName,
  StoreNotification,
  StorePilotAuditLog,
  Technician,
  User,
  Vendor,
  Warehouse,
  WarehouseBin,
  WarehouseRack,
  WarehouseShelf,
} from "../types";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().split("T")[0];

const SEED_USERS: User[] = [
  {
    id: "u1",
    name: "Admin",
    email: "kumardsemail@gmail.com",
    phone: "9999999999",
    password: "Admin@123",
    role: "admin",
    status: "approved",
    createdAt: now(),
    lastLogin: "",
    lastActive: "",
    isOnline: false,
  },
];

const _SEED_TECHNICIANS: Technician[] = [
  {
    id: "t1",
    name: "Ramesh Kumar",
    phone: "9111111111",
    specialization: "AC",
    isActive: true,
    createdAt: now(),
    technicianCode: "TECH-001",
  },
  {
    id: "t2",
    name: "Suresh Singh",
    phone: "9222222222",
    specialization: "Washing Machine",
    isActive: true,
    createdAt: now(),
    technicianCode: "TECH-002",
  },
  {
    id: "t3",
    name: "Mahesh Yadav",
    phone: "9333333333",
    specialization: "Refrigerator",
    isActive: true,
    createdAt: now(),
    technicianCode: "TECH-003",
  },
  {
    id: "t4",
    name: "Dinesh Patel",
    phone: "9444444444",
    specialization: "General",
    isActive: false,
    createdAt: now(),
    technicianCode: "TECH-004",
  },
];

const d = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString();

const _SEED_CASES: Case[] = [
  {
    id: "c1",
    caseId: "MD-2024-001",
    customerName: "Priya Sharma",
    phone: "9812345678",
    altPhone: "",
    address: "12 MG Road, Delhi",
    product: "AC",
    productType: "1.5 Ton Split",
    complaintType: "installation",
    status: "new",
    technicianId: "",
    technicianFeedback: "",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "New AC installation",
    additionalNotes: "",
    photos: [],
    createdAt: d(1),
    updatedAt: d(1),
    createdBy: "u2",
    closedAt: "",
    hasFirstUpdate: false,
    onRouteDate: "",
  },
  {
    id: "c2",
    caseId: "MD-2024-002",
    customerName: "Amit Gupta",
    phone: "9823456789",
    altPhone: "9834567890",
    address: "45 Park Street, Mumbai",
    product: "Washing Machine",
    productType: "Front Load 7kg",
    complaintType: "breakdown",
    status: "on_route",
    technicianId: "t2",
    technicianFeedback: "",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "Not draining water",
    additionalNotes: "",
    photos: [],
    createdAt: d(3),
    updatedAt: d(2),
    createdBy: "u1",
    closedAt: "",
    hasFirstUpdate: false,
    onRouteDate: d(2).split("T")[0],
  },
  {
    id: "c3",
    caseId: "MD-2024-003",
    customerName: "Sunita Devi",
    phone: "9845678901",
    altPhone: "",
    address: "78 Civil Lines, Jaipur",
    product: "Refrigerator",
    productType: "350L Double Door",
    complaintType: "breakdown",
    status: "part_required",
    technicianId: "t3",
    technicianFeedback: "Compressor faulty",
    partCode: "COMP-350-R22",
    partName: "Compressor",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "Compressor replacement needed",
    additionalNotes: "",
    photos: [],
    createdAt: d(9),
    updatedAt: d(2),
    createdBy: "u2",
    closedAt: "",
    hasFirstUpdate: true,
    onRouteDate: "",
  },
  {
    id: "c4",
    caseId: "MD-2024-004",
    customerName: "Vijay Mehta",
    phone: "9856789012",
    altPhone: "",
    address: "23 Sector 5, Noida",
    product: "AC",
    productType: "2 Ton Cassette",
    complaintType: "breakdown",
    status: "gas_charge_pending",
    technicianId: "t1",
    technicianFeedback: "Gas leakage detected",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "Gas refill required",
    additionalNotes: "",
    photos: [],
    createdAt: d(5),
    updatedAt: d(1),
    createdBy: "u1",
    closedAt: "",
    hasFirstUpdate: true,
    onRouteDate: "",
  },
  {
    id: "c5",
    caseId: "MD-2024-005",
    customerName: "Kavita Joshi",
    phone: "9867890123",
    altPhone: "",
    address: "56 Gandhi Nagar, Bhopal",
    product: "Washing Machine",
    productType: "Top Load 6.5kg",
    complaintType: "breakdown",
    status: "closed",
    technicianId: "t2",
    technicianFeedback: "Belt replaced",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "Belt was worn out",
    additionalNotes: "",
    photos: [],
    createdAt: d(15),
    updatedAt: d(7),
    createdBy: "u2",
    closedAt: d(7),
    hasFirstUpdate: true,
    onRouteDate: "",
  },
  {
    id: "c6",
    caseId: "MD-2024-006",
    customerName: "Priya Sharma",
    phone: "9812345678",
    altPhone: "",
    address: "12 MG Road, Delhi",
    product: "AC",
    productType: "1 Ton Split",
    complaintType: "breakdown",
    status: "pending",
    technicianId: "",
    technicianFeedback: "",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    remarks: "Not cooling properly",
    additionalNotes: "",
    photos: [],
    createdAt: d(2),
    updatedAt: d(1),
    createdBy: "u1",
    closedAt: "",
    hasFirstUpdate: false,
    onRouteDate: "",
  },
];

// ── StorePilot seed data ─────────────────────────────────────────────────────

const _SEED_STOCK_COMPANIES: StockCompany[] = [
  { id: "sc1", name: "Midea", createdAt: now() },
  { id: "sc2", name: "Toshiba", createdAt: now() },
  { id: "sc3", name: "Godrej", createdAt: now() },
  { id: "sc4", name: "Sansui", createdAt: now() },
];

const _SEED_STOCK_CATEGORIES: StockCategory[] = [
  { id: "scat1", name: "AC", createdAt: now() },
  { id: "scat2", name: "TV", createdAt: now() },
  { id: "scat3", name: "Washing Machine", createdAt: now() },
  { id: "scat4", name: "Refrigerator", createdAt: now() },
];

const _SEED_STOCK_PART_NAMES: StockPartName[] = [
  { id: "spn1", name: "Compressor", createdAt: now() },
  { id: "spn2", name: "Power Board", createdAt: now() },
  { id: "spn3", name: "Display Panel", createdAt: now() },
  { id: "spn4", name: "PCB Board", createdAt: now() },
  { id: "spn5", name: "Drive Belt", createdAt: now() },
  { id: "spn6", name: "Thermostat", createdAt: now() },
];

const _SEED_WAREHOUSES: Warehouse[] = [
  {
    id: "wh1",
    name: "Main Warehouse",
    address: "Plot 12, Industrial Area, Delhi",
    createdAt: now(),
  },
];

const _SEED_RACKS: WarehouseRack[] = [
  { id: "rack1", name: "Rack A", warehouseId: "wh1", createdAt: now() },
  { id: "rack2", name: "Rack B", warehouseId: "wh1", createdAt: now() },
];

const _SEED_SHELVES: WarehouseShelf[] = [
  { id: "shelf1", name: "Shelf A1", rackId: "rack1", createdAt: now() },
  { id: "shelf2", name: "Shelf A2", rackId: "rack1", createdAt: now() },
  { id: "shelf3", name: "Shelf B1", rackId: "rack2", createdAt: now() },
];

const _SEED_BINS: WarehouseBin[] = [
  { id: "bin1", name: "Bin A1-1", shelfId: "shelf1", createdAt: now() },
  { id: "bin2", name: "Bin A1-2", shelfId: "shelf1", createdAt: now() },
  { id: "bin3", name: "Bin B1-1", shelfId: "shelf3", createdAt: now() },
];

const _SEED_VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "Star Electronics",
    phone: "9100001111",
    email: "star@electronics.com",
    address: "12 Industrial Area, Chennai",
    createdAt: d(30),
  },
  {
    id: "v2",
    name: "Metro Parts Pvt Ltd",
    phone: "9200002222",
    email: "metro@parts.com",
    address: "45 Trade Centre, Mumbai",
    createdAt: d(25),
  },
  {
    id: "v3",
    name: "Global Spares Co.",
    phone: "9300003333",
    email: "global@spares.com",
    address: "78 Electronics Market, Delhi",
    createdAt: d(20),
  },
];

const _SEED_PURCHASES: PurchaseEntry[] = [
  {
    id: "pur1",
    vendorName: "Star Electronics",
    vendorId: "v1",
    invoiceNumber: "INV-2024-001",
    invoiceDate: d(10).split("T")[0],
    companyId: "sc1",
    categoryId: "scat1",
    partNameId: "spn1",
    quantity: 3,
    createdAt: d(10),
    createdBy: "u1",
    costPrice: 2500,
  },
  {
    id: "pur2",
    vendorName: "Metro Parts Pvt Ltd",
    vendorId: "v2",
    invoiceNumber: "INV-2024-002",
    invoiceDate: d(5).split("T")[0],
    companyId: "sc2",
    categoryId: "scat2",
    partNameId: "spn2",
    quantity: 2,
    createdAt: d(5),
    createdBy: "u1",
    costPrice: 1800,
  },
  {
    id: "pur3",
    vendorName: "Global Spares Co.",
    vendorId: "v3",
    invoiceNumber: "INV-2024-003",
    invoiceDate: d(15).split("T")[0],
    companyId: "sc1",
    categoryId: "scat3",
    partNameId: "spn5",
    quantity: 4,
    createdAt: d(15),
    createdBy: "u1",
    costPrice: 650,
  },
];

const _SEED_PART_ITEMS: PartInventoryItem[] = [
  {
    id: "pi1",
    partCode: "MIDAC-COMP-001",
    purchaseId: "pur1",
    companyId: "sc1",
    categoryId: "scat1",
    partNameId: "spn1",
    rackId: "rack1",
    shelfId: "shelf1",
    binId: "bin1",
    status: "in_stock",
    technicianId: "",
    caseId: "",
    issueDate: "",
    issuedBy: "",
    installedAt: "",
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(10),
  },
  {
    id: "pi2",
    partCode: "MIDAC-COMP-002",
    purchaseId: "pur1",
    companyId: "sc1",
    categoryId: "scat1",
    partNameId: "spn1",
    rackId: "rack1",
    shelfId: "shelf1",
    binId: "bin1",
    status: "in_stock",
    technicianId: "",
    caseId: "",
    issueDate: "",
    issuedBy: "",
    installedAt: "",
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(10),
  },
  {
    id: "pi3",
    partCode: "MIDAC-COMP-003",
    purchaseId: "pur1",
    companyId: "sc1",
    categoryId: "scat1",
    partNameId: "spn1",
    rackId: "",
    shelfId: "",
    binId: "",
    status: "in_stock",
    technicianId: "",
    caseId: "",
    issueDate: "",
    issuedBy: "",
    installedAt: "",
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(10),
  },
  {
    id: "pi4",
    partCode: "TOSBTV-PWR-001",
    purchaseId: "pur2",
    companyId: "sc2",
    categoryId: "scat2",
    partNameId: "spn2",
    rackId: "rack2",
    shelfId: "shelf3",
    binId: "bin3",
    status: "in_stock",
    technicianId: "",
    caseId: "",
    issueDate: "",
    issuedBy: "",
    installedAt: "",
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(5),
  },
  {
    id: "pi5",
    partCode: "TOSBTV-PWR-002",
    purchaseId: "pur2",
    companyId: "sc2",
    categoryId: "scat2",
    partNameId: "spn2",
    rackId: "rack2",
    shelfId: "shelf3",
    binId: "bin3",
    status: "issued",
    technicianId: "t1",
    caseId: "MD-2024-004",
    issueDate: d(2),
    issuedBy: "Admin",
    installedAt: "",
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(5),
  },
  {
    id: "pi6",
    partCode: "MIDWM-BELT-001",
    purchaseId: "pur3",
    companyId: "sc1",
    categoryId: "scat3",
    partNameId: "spn5",
    rackId: "rack1",
    shelfId: "shelf2",
    binId: "bin2",
    status: "in_stock",
    technicianId: "",
    caseId: "",
    issueDate: "",
    issuedBy: "",
    installedAt: "",
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(15),
  },
  {
    id: "pi7",
    partCode: "MIDWM-BELT-002",
    purchaseId: "pur3",
    companyId: "sc1",
    categoryId: "scat3",
    partNameId: "spn5",
    rackId: "rack1",
    shelfId: "shelf2",
    binId: "bin2",
    status: "installed",
    technicianId: "t2",
    caseId: "MD-2024-005",
    issueDate: d(12),
    issuedBy: "Admin",
    installedAt: d(8),
    returnedToStoreAt: "",
    returnRemarks: "",
    returnedToCompanyAt: "",
    returnToCompanyReason: "",
    returnToCompanyRemarks: "",
    returnedToCompanyBy: "",
    createdAt: d(15),
  },
];

const _SEED_LIFECYCLE: PartLifecycleEntry[] = [
  {
    id: "lc1",
    partId: "pi1",
    action: "Purchased",
    details: "Received from Star Electronics, Invoice INV-2024-001",
    userId: "u1",
    userName: "Admin",
    timestamp: d(10),
  },
  {
    id: "lc2",
    partId: "pi2",
    action: "Purchased",
    details: "Received from Star Electronics, Invoice INV-2024-001",
    userId: "u1",
    userName: "Admin",
    timestamp: d(10),
  },
  {
    id: "lc3",
    partId: "pi3",
    action: "Purchased",
    details: "Received from Star Electronics, Invoice INV-2024-001",
    userId: "u1",
    userName: "Admin",
    timestamp: d(10),
  },
  {
    id: "lc4",
    partId: "pi4",
    action: "Purchased",
    details: "Received from Metro Parts Pvt Ltd, Invoice INV-2024-002",
    userId: "u1",
    userName: "Admin",
    timestamp: d(5),
  },
  {
    id: "lc5",
    partId: "pi5",
    action: "Purchased",
    details: "Received from Metro Parts Pvt Ltd, Invoice INV-2024-002",
    userId: "u1",
    userName: "Admin",
    timestamp: d(5),
  },
  {
    id: "lc6",
    partId: "pi5",
    action: "Issued",
    details: "Issued to Ramesh Kumar for Case MD-2024-004",
    userId: "u1",
    userName: "Admin",
    timestamp: d(2),
  },
  {
    id: "lc7",
    partId: "pi6",
    action: "Purchased",
    details: "Received from Global Spares Co., Invoice INV-2024-003",
    userId: "u1",
    userName: "Admin",
    timestamp: d(15),
  },
  {
    id: "lc8",
    partId: "pi7",
    action: "Purchased",
    details: "Received from Global Spares Co., Invoice INV-2024-003",
    userId: "u1",
    userName: "Admin",
    timestamp: d(15),
  },
  {
    id: "lc9",
    partId: "pi7",
    action: "Issued",
    details: "Issued to Suresh Singh for Case MD-2024-005",
    userId: "u1",
    userName: "Admin",
    timestamp: d(12),
  },
  {
    id: "lc10",
    partId: "pi7",
    action: "Installed",
    details: "Part marked as installed by supervisor",
    userId: "u1",
    userName: "Admin",
    timestamp: d(8),
  },
];

const _SEED_STORE_NOTIFICATIONS: StoreNotification[] = [
  {
    id: "sn1",
    title: "Part Issued",
    message: "TOSBTV-PWR-002 issued to Ramesh Kumar for case MD-2024-004",
    type: "part_issued",
    priority: "medium",
    isRead: false,
    relatedPartCode: "TOSBTV-PWR-002",
    createdAt: d(2),
  },
  {
    id: "sn2",
    title: "Part Installed",
    message: "MIDWM-BELT-002 marked as installed for case MD-2024-005",
    type: "part_returned",
    priority: "low",
    isRead: true,
    relatedPartCode: "MIDWM-BELT-002",
    createdAt: d(8),
  },
  {
    id: "sn3",
    title: "Low Stock Alert",
    message: "Toshiba Power Board stock is running low (2 units remaining)",
    type: "low_stock",
    priority: "high",
    isRead: false,
    relatedPartCode: "TOSBTV-PWR",
    createdAt: d(1),
  },
];

// ── Seed Admin Notices ───────────────────────────────────────────────────────
const _SEED_ADMIN_NOTICES: AdminNotice[] = [
  {
    id: "notice1",
    title: "System Maintenance",
    message:
      "Scheduled maintenance on Sunday 22 March from 2AM-4AM IST. System may be unavailable.",
    expiryDate: "2026-03-22T23:59:00.000Z",
    isActive: true,
    createdAt: d(1),
    createdBy: "Store Admin",
    direction: "rtl",
    color: "amber",
    speed: "normal",
  },
];

// ── Seed StorePilot Audit Logs ───────────────────────────────────────────────
const _SEED_STOREPILOT_AUDIT_LOGS: StorePilotAuditLog[] = [
  {
    id: "sal1",
    action: "CREATE",
    module: "Purchase",
    recordId: "#9",
    details: "Invoice 88888 from Midea Pvt.ltd. Parts: 888888 (Main Motor)",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T13:03:23.000Z",
    partCodes: ["888888"],
  },
  {
    id: "sal2",
    action: "UPDATE",
    module: "PartInstance",
    recordId: "#33",
    details: "Part C-82733 (Main Motor) relocated to A › A-1 › Bin-2",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T10:10:01.000Z",
    partCodes: ["C-82733"],
  },
  {
    id: "sal3",
    action: "RETURN",
    module: "PartIssue",
    recordId: "#7",
    details:
      "Part A-01928 (Main Motor) returned to store. Case: 6532543. Reason: Not required",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T09:59:52.000Z",
    partCodes: ["A-01928"],
  },
  {
    id: "sal4",
    action: "ISSUE",
    module: "PartIssue",
    recordId: "#7",
    details: "Part A-01928 (Main Motor) issued to Sonu. Case: 6532543",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T09:59:11.000Z",
    partCodes: ["A-01928"],
  },
  {
    id: "sal5",
    action: "CREATE",
    module: "Purchase",
    recordId: "#8",
    details:
      "Invoice in-01 from Midea Pvt.ltd. Parts: A-01928 (Main Motor), B-37276 (Main Motor), C-82733 (Main Motor)",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T09:57:03.000Z",
    partCodes: ["A-01928", "B-37276", "C-82733"],
  },
  {
    id: "sal6",
    action: "ISSUE",
    module: "PartIssue",
    recordId: "#6",
    details: "Part F-753 (Compressor) issued to Sonu. Case: 154343",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T09:52:42.000Z",
    partCodes: ["F-753"],
  },
  {
    id: "sal7",
    action: "CREATE",
    module: "Purchase",
    recordId: "#7",
    details: "Invoice in-1245 from Midea Pvt.ltd. Parts: F-753 (Compressor)",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T09:51:36.000Z",
    partCodes: ["F-753"],
  },
  {
    id: "sal8",
    action: "LOGIN",
    module: "Auth",
    recordId: "#1",
    details: "User Store Admin logged in",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-16T09:00:00.000Z",
  },
  {
    id: "sal9",
    action: "UPDATE",
    module: "PartInstance",
    recordId: "#21",
    details: "Part B-37276 (Main Motor) location assigned to A › A-1 › Bin-1",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-18T08:14:28.000Z",
    partCodes: ["B-37276"],
  },
  {
    id: "sal10",
    action: "RETURN",
    module: "PartInstance",
    recordId: "#12",
    details:
      "Part A-01928 (Main Motor) returned to company Midea Pvt.ltd. Ref: 1246",
    userId: "admin1",
    userName: "Store Admin",
    userRole: "admin",
    timestamp: "2026-03-21T09:05:02.000Z",
    partCodes: ["A-01928"],
  },
];

// ── StoreState interface ─────────────────────────────────────────────────────

interface StoreState {
  // Auth
  currentUser: User | null;
  isInitializing: boolean;
  currentPage: PageType;
  selectedCaseId: string | null;
  selectedPartId: string | null;
  navVendorId: string | null;
  previousPage: PageType | null;
  adminNotices: AdminNotice[];
  storePilotAuditLogs: StorePilotAuditLog[];
  notificationsGeneratedDate: string;
  lastMidnightResetDate: string;
  sessionExpired: boolean;
  seenPartRequestsCount: number;
  seenApprovalsCount: number;

  // Data
  users: User[];
  technicians: Technician[];
  cases: Case[];
  auditLog: AuditEntry[];
  activityLog: ActivityLog[];
  reminders: Reminder[];
  notifications: Notification[];
  settings: Settings;

  // StorePilot data
  stockCompanies: StockCompany[];
  stockCategories: StockCategory[];
  stockPartNames: StockPartName[];
  warehouses: Warehouse[];
  racks: WarehouseRack[];
  shelves: WarehouseShelf[];
  bins: WarehouseBin[];
  vendors: Vendor[];
  purchaseEntries: PurchaseEntry[];
  partItems: PartInventoryItem[];
  partLifecycle: PartLifecycleEntry[];
  partRequests: PartRequest[];
  storeNotifications: StoreNotification[];

  // Actions
  setInitializing: (val: boolean) => void;
  setUsers: (users: User[]) => void;
  mergeUsers: (backendUsers: User[]) => void;
  initUsers: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setSessionExpired: (val: boolean) => void;
  markPartRequestsSeen: () => void;
  markApprovalsSeen: () => void;
  navigate: (
    page: PageType,
    caseId?: string,
    partId?: string,
    vendorId?: string,
  ) => void;
  clearNavVendorId: () => void;
  addAdminNotice: (notice: Omit<AdminNotice, "id" | "createdAt">) => void;
  deleteAdminNotice: (id: string) => void;
  updateAdminNotice: (id: string, updates: Partial<AdminNotice>) => void;
  registerUser: (
    user: Omit<
      User,
      "id" | "createdAt" | "status" | "lastLogin" | "lastActive" | "isOnline"
    >,
  ) => Promise<{ success: boolean; message?: string; reason?: string }>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  updateUserRole: (userId: string, role: User["role"]) => void;
  createUser: (userData: {
    name: string;
    email: string;
    phone: string;
    role: User["role"];
    password: string;
  }) => Promise<void>;
  editUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  addCase: (
    c: Omit<
      Case,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "closedAt"
      | "photos"
      | "hasFirstUpdate"
      | "onRouteDate"
    >,
  ) => Case;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  deleteCases: (ids: string[]) => void;
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  addTechnician: (t: Omit<Technician, "id" | "createdAt">) => void;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => void;
  completeReminder: (id: string) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void;
  updateSettings: (s: Partial<Settings>) => void;
  addPhotoToCase: (caseId: string, photo: Omit<CasePhoto, "id">) => void;
  changeStatus: (
    caseId: string,
    newStatus: CaseStatus,
    details: string,
  ) => void;
  generateAutoNotifications: () => void;
  runMidnightResets: () => void;
  resetStaleTechnician: (caseId: string) => void;
  importCases: (
    newCases: Omit<
      Case,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "closedAt"
      | "photos"
      | "hasFirstUpdate"
      | "onRouteDate"
    >[],
  ) => number;

  // Vendor actions
  addVendor: (v: Omit<Vendor, "id" | "createdAt">) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  // Store notification actions
  addStoreNotification: (
    n: Omit<StoreNotification, "id" | "createdAt">,
  ) => void;
  markStoreNotificationRead: (id: string) => void;
  markAllStoreNotificationsRead: () => void;
  deleteStoreNotification: (id: string) => void;

  // StorePilot actions
  addStockCompany: (name: string) => void;
  updateStockCompany: (id: string, name: string) => void;
  deleteStockCompany: (id: string) => void;
  addStockCategory: (name: string) => void;
  updateStockCategory: (id: string, name: string) => void;
  deleteStockCategory: (id: string) => void;
  addStockPartName: (name: string) => void;
  updateStockPartName: (id: string, name: string) => void;
  deleteStockPartName: (id: string) => void;
  addWarehouse: (name: string, address: string) => void;
  updateWarehouse: (id: string, name: string, address: string) => void;
  deleteWarehouse: (id: string) => void;
  addRackToWarehouse: (name: string, warehouseId: string) => void;
  addRack: (name: string) => void;
  updateRack: (id: string, name: string) => void;
  deleteRack: (id: string) => void;
  addShelf: (name: string, rackId: string) => void;
  updateShelf: (id: string, updates: Partial<WarehouseShelf>) => void;
  deleteShelf: (id: string) => void;
  addBin: (name: string, shelfId: string) => void;
  updateBin: (id: string, updates: Partial<WarehouseBin>) => void;
  deleteBin: (id: string) => void;
  addPurchaseEntry: (
    entry: Omit<PurchaseEntry, "id" | "createdAt" | "createdBy">,
    partCodes: Array<{
      code: string;
      rackId: string;
      shelfId: string;
      binId: string;
      imageUrl?: string;
    }>,
  ) => void;
  assignPartLocation: (
    partId: string,
    rackId: string,
    shelfId: string,
    binId: string,
  ) => void;
  issuePartToTechnician: (
    partId: string,
    technicianId: string,
    caseId: string,
  ) => void;
  markPartInstalled: (partId: string) => void;
  returnPartToStore: (partId: string, remarks: string) => void;
  returnPartToCompany: (
    partId: string,
    reason: string,
    remarks: string,
  ) => void;

  // Part Request actions
  addPartRequest: (
    req: Omit<
      PartRequest,
      | "id"
      | "requestedAt"
      | "status"
      | "technicianId"
      | "issuedAt"
      | "issuedBy"
      | "issuedByName"
      | "rejectedReason"
      | "rejectedAt"
      | "rejectedBy"
      | "rejectedByName"
      | "message"
    >,
  ) => void;
  issuePartRequest: (
    id: string,
    technicianId: string,
    partItemId?: string,
  ) => void;
  rejectPartRequest: (id: string, reason: string) => void;
  cancelPartRequest: (id: string) => void;
  syncPartRequests: () => Promise<void>;
  syncCases: () => Promise<void>;
  syncNotices: () => Promise<void>;
  saveCasesToBackend: () => Promise<void>;
  saveNoticesToBackend: () => Promise<void>;
  syncInventory: () => Promise<void>;
  syncAppData: () => Promise<void>;
  saveInventoryToBackend: () => Promise<void>;
  saveAppDataToBackend: () => Promise<void>;
  addPartImages: (partId: string, imageUrls: string[]) => void;
  removePartImage: (partId: string, imageUrl: string) => void;
  updatePurchaseInvoiceImage: (purchaseId: string, imageUrl: string) => void;
  removePurchaseInvoiceImage: (purchaseId: string) => void;
  addExistingStock: (
    entries: Array<{
      partCode: string;
      companyId: string;
      categoryId: string;
      partNameId: string;
      quantity: number;
      costPrice?: number;
      rackId?: string;
      shelfId?: string;
      binId?: string;
      notes?: string;
    }>,
  ) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      const logActivity = (
        userId: string,
        userName: string,
        action: string,
        details: string,
      ) => {
        set((s) => ({
          activityLog: [
            {
              id: uid(),
              userId,
              userName,
              action,
              details,
              timestamp: now(),
            },
            ...s.activityLog,
          ],
        }));
      };

      return {
        currentUser: null,
        isInitializing: true,
        currentPage: "login" as PageType,
        selectedCaseId: null,
        selectedPartId: null,
        navVendorId: null,
        previousPage: null,
        adminNotices: [],
        storePilotAuditLogs: [],
        notificationsGeneratedDate: "",
        lastMidnightResetDate: "",
        rejectionReason: "",
        sessionExpired: false,
        seenPartRequestsCount: 0,
        seenApprovalsCount: 0,
        users: SEED_USERS,
        technicians: [],
        cases: [],
        auditLog: [],
        activityLog: [],
        reminders: [],
        notifications: [],
        settings: {
          supervisorWhatsApp: "",
          supervisorName: "Supervisor",
          companyName: "Service Centre",
          products: [
            "AC",
            "Washing Machine",
            "Refrigerator",
            "TV",
            "Microwave",
          ],
        },
        stockCompanies: [],
        stockCategories: [],
        stockPartNames: [],
        warehouses: [],
        racks: [],
        shelves: [],
        bins: [],
        vendors: [],
        purchaseEntries: [],
        partItems: [],
        partLifecycle: [],
        partRequests: [],
        storeNotifications: [],

        setInitializing: (val) => set({ isInitializing: val }),
        mergeUsers: (backendUsers) => {
          const localUsers = get().users;
          const merged = backendUsers.map((bu) => {
            const local = localUsers.find((l) => l.id === bu.id);
            if (!local) return bu;
            return {
              ...bu,
              phone: bu.phone || local.phone,
              role: bu.role || local.role,
              password: bu.password || local.password,
            };
          });
          for (const local of localUsers) {
            if (
              !merged.find((b) => b.id === local.id || b.email === local.email)
            ) {
              merged.push(local);
            }
          }
          set({ users: merged });
        },
        setUsers: (users) => set({ users }),
        initUsers: async () => {
          try {
            await backendInitSeedUsers();
            const backendUsers = await backendGetUsers();
            // Always replace with backend data - never merge with stale localStorage users
            // This ensures cross-device consistency
            if (backendUsers.length > 0) {
              // Preserve current user's session data if they are in the backend list
              const cu = get().currentUser;
              const updatedUsers = backendUsers.map((bu) => {
                if (
                  cu &&
                  (bu.id === cu.id ||
                    bu.email.toLowerCase() === cu.email.toLowerCase())
                ) {
                  return { ...bu, isOnline: true };
                }
                return bu;
              });
              set({ users: updatedUsers });
            }
            await Promise.allSettled([
              get().syncPartRequests(),
              get().syncCases(),
              get().syncNotices(),
              get().syncInventory(),
              get().syncAppData(),
            ]);
          } catch (e) {
            console.error("initUsers error:", e);
          } finally {
            get().setInitializing(false);
          }
        },
        login: async (email, password) => {
          // 1. Try backend direct authentication first (most reliable - server-side check)
          let user: ReturnType<typeof get>["users"][0] | null | undefined;
          try {
            const backendAuthUser = await backendLoginUser(email, password);
            if (backendAuthUser) {
              // Merge with local state to preserve extra local-only fields
              const local = get().users.find(
                (u) => u.id === backendAuthUser.id,
              );
              user = local
                ? {
                    ...backendAuthUser,
                    ...local,
                    status: "approved" as const,
                    isOnline: true,
                  }
                : { ...backendAuthUser, isOnline: true };
            }
          } catch (_e) {}

          // 2. Fall back to local state check
          if (!user) {
            user = get().users.find(
              (u) =>
                u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
                u.password === password &&
                u.status === "approved",
            );
          }

          // 3. Refresh from backend and retry
          if (!user) {
            try {
              const freshUsers = await backendGetUsers();
              if (freshUsers.length > 0) {
                get().mergeUsers(freshUsers);
                user =
                  freshUsers.find(
                    (u) =>
                      u.email.toLowerCase().trim() ===
                        email.toLowerCase().trim() &&
                      u.password === password &&
                      u.status === "approved",
                  ) ??
                  get().users.find(
                    (u) =>
                      u.email.toLowerCase().trim() ===
                        email.toLowerCase().trim() &&
                      u.password === password &&
                      u.status === "approved",
                  );
              }
            } catch (_e) {}
          }

          if (!user) return false;
          const loginTime = now();
          set((s) => ({
            currentUser: { ...user!, isOnline: true, lastLogin: loginTime },
            sessionExpired: false,
            currentPage: "dashboard" as PageType,
            users: s.users.some((u) => u.id === user!.id)
              ? s.users.map((u) =>
                  u.id === user!.id
                    ? {
                        ...u,
                        isOnline: true,
                        lastLogin: loginTime,
                        lastActive: loginTime,
                      }
                    : u,
                )
              : [
                  ...s.users,
                  {
                    ...user!,
                    isOnline: true,
                    lastLogin: loginTime,
                    lastActive: loginTime,
                  },
                ],
          }));
          logActivity(user.id, user.name, "Login", "User logged in");
          // Audit log for login
          set((s) => ({
            storePilotAuditLogs: [
              {
                id: uid(),
                action: "LOGIN" as const,
                module: "Auth",
                recordId: user!.id,
                details: `User ${user!.name} logged in`,
                userId: user!.id,
                userName: user!.name,
                userRole: user!.role,
                timestamp: loginTime,
              },
              ...s.storePilotAuditLogs,
            ],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          backendUpdateLastLogin(user.id, loginTime).catch(() => {});
          get().generateAutoNotifications();
          get().runMidnightResets();
          return true;
        },

        setSessionExpired: (val) => set({ sessionExpired: val }),
        markPartRequestsSeen: () => {
          const count = get().partRequests.filter(
            (r) => r.status === "pending",
          ).length;
          set({ seenPartRequestsCount: count });
        },
        markApprovalsSeen: () => {
          const count = get().users.filter(
            (u) => u.status === "pending",
          ).length;
          set({ seenApprovalsCount: count });
        },
        logout: () => {
          const cu = get().currentUser;
          if (cu) {
            logActivity(cu.id, cu.name, "Logout", "User logged out");
            const logoutTime = now();
            set((s) => ({
              users: s.users.map((u) =>
                u.id === cu.id
                  ? { ...u, isOnline: false, lastActive: now() }
                  : u,
              ),
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "LOGOUT" as const,
                  module: "Auth",
                  recordId: cu.id,
                  details: `User ${cu.name} logged out`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: logoutTime,
                },
                ...s.storePilotAuditLogs,
              ],
            }));
            get()
              .saveInventoryToBackend()
              .catch(() => {});
          }
          set({ currentUser: null, currentPage: "login" as PageType });
        },

        navigate: (page, caseId, partId, vendorId) =>
          set((s) => ({
            previousPage: s.currentPage,
            currentPage: page,
            selectedCaseId: caseId ?? s.selectedCaseId,
            selectedPartId: partId ?? s.selectedPartId,
            navVendorId: vendorId !== undefined ? vendorId : null,
          })),

        addAdminNotice: (notice: Omit<AdminNotice, "id" | "createdAt">) => {
          const cu = get().currentUser;
          set((s) => ({
            adminNotices: [
              { ...notice, id: uid(), createdAt: now() },
              ...s.adminNotices,
            ],
          }));
          get()
            .saveNoticesToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Notice Published",
              details: `Notice published by ${cu.name} (${cu.role}): "${notice.title}"`,
            });
          }
        },

        deleteAdminNotice: (id: string) => {
          const cu = get().currentUser;
          const notice = get().adminNotices.find((n) => n.id === id);
          set((s) => ({
            adminNotices: s.adminNotices.filter((n) => n.id !== id),
          }));
          get()
            .saveNoticesToBackend()
            .catch(() => {});
          if (cu && notice) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Notice Deleted",
              details: `Notice deleted by ${cu.name} (${cu.role}): "${notice.title}"`,
            });
          }
        },

        updateAdminNotice: (id: string, updates: Partial<AdminNotice>) => {
          const cu = get().currentUser;
          set((s) => ({
            adminNotices: s.adminNotices.map((n) =>
              n.id === id ? { ...n, ...updates } : n,
            ),
          }));
          get()
            .saveNoticesToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Notice Updated",
              details: `Notice updated by ${cu.name} (${cu.role}): ID ${id}`,
            });
          }
        },

        clearNavVendorId: () => set({ navVendorId: null }),
        setRejectionReason: (reason) => set({ rejectionReason: reason }),

        generateAutoNotifications: () => {
          const today = todayStr();
          if (get().notificationsGeneratedDate === today) return;
          const cu = get().currentUser;
          if (!cu) return;
          const { cases } = get();
          const newNotifs: Omit<Notification, "id" | "createdAt">[] = [];
          for (const c of cases) {
            if (["closed", "cancelled", "transferred"].includes(c.status))
              continue;
            const ageMs = Date.now() - new Date(c.createdAt).getTime();
            const ageDays = Math.floor(ageMs / 86400000);
            if (
              ageDays > 7 &&
              ![
                "closed",
                "cancelled",
                "adjustment_closed",
                "replacement_done",
                "gas_charge_done",
              ].includes(c.status)
            ) {
              newNotifs.push({
                userId: cu.id,
                message: `Case ${c.caseId} (${c.customerName}) is ${ageDays} days old and still open`,
                type: "overdue",
                isRead: false,
                caseId: c.id,
              });
            }
            if (c.nextActionDate && c.nextActionDate === today) {
              newNotifs.push({
                userId: cu.id,
                message: `Follow-up due today for ${c.customerName} (${c.caseId})`,
                type: "follow_up",
                isRead: false,
                caseId: c.id,
              });
            }
            if (["part_required", "part_ordered"].includes(c.status)) {
              newNotifs.push({
                userId: cu.id,
                message: `Part pending for case ${c.caseId} (${c.customerName})`,
                type: "part_pending",
                isRead: false,
                caseId: c.id,
              });
            }
          }
          set((s) => ({
            notifications: [
              ...newNotifs.map((n) => ({ ...n, id: uid(), createdAt: now() })),
              ...s.notifications,
            ],
            notificationsGeneratedDate: today,
          }));
        },

        runMidnightResets: () => {
          const today = todayStr();
          if (get().lastMidnightResetDate === today) return;
          const { cases } = get();
          const cu = get().currentUser;
          for (const c of cases) {
            if (
              c.status === "on_route" &&
              c.onRouteDate &&
              c.onRouteDate < today &&
              !c.hasFirstUpdate
            ) {
              get().resetStaleTechnician(c.id);
            }
          }
          set({ lastMidnightResetDate: today });
          if (cu) {
            const staleCount = cases.filter(
              (c) =>
                c.status === "on_route" &&
                c.onRouteDate &&
                c.onRouteDate < today &&
                !c.hasFirstUpdate,
            ).length;
            if (staleCount > 0) {
              set((s) => ({
                notifications: [
                  {
                    id: uid(),
                    userId: cu.id,
                    message: `${staleCount} case(s) had no technician update overnight and have been reset`,
                    type: "stale_case" as const,
                    isRead: false,
                    createdAt: now(),
                  },
                  ...s.notifications,
                ],
              }));
            }
          }
        },

        resetStaleTechnician: (caseId) => {
          const c = get().cases.find((x) => x.id === caseId);
          if (!c) return;
          set((s) => ({
            cases: s.cases.map((x) =>
              x.id === caseId
                ? {
                    ...x,
                    technicianId: "",
                    status: "pending" as CaseStatus,
                    updatedAt: now(),
                  }
                : x,
            ),
          }));
        },

        registerUser: async (user) => {
          // Fetch fresh users from backend before checking duplicates
          try {
            const freshUsers = await backendGetUsers();
            if (freshUsers.length > 0) get().mergeUsers(freshUsers);
          } catch (e) {
            console.error("registerUser pre-check backend error:", e);
          }
          const existingUsers = get().users;
          const emailMatch = existingUsers.find(
            (u) =>
              u.email.toLowerCase().trim() === user.email.toLowerCase().trim(),
          );
          if (emailMatch) {
            if (emailMatch.status === "pending")
              return { success: false, message: "pending" };
            if (emailMatch.status === "approved")
              return { success: false, message: "approved" };
            if (emailMatch.status === "rejected")
              return {
                success: false,
                message: "rejected",
                reason: emailMatch.rejectionReason || "",
              };
          }
          const phoneMatch = existingUsers.find(
            (u) => u.phone && u.phone.trim() === user.phone.trim(),
          );
          if (phoneMatch) return { success: false, message: "phone_exists" };

          const newRegUser = {
            ...user,
            id: uid(),
            createdAt: now(),
            status: "pending" as const,
            lastLogin: "",
            lastActive: "",
            isOnline: false,
          };
          set((s) => ({ users: [...s.users, newRegUser] }));
          // Try to save to backend with retry
          let backendSuccess = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
              await backendCreateUser(
                newRegUser.id,
                newRegUser.name,
                newRegUser.email,
                newRegUser.password,
                newRegUser.phone,
                newRegUser.role,
                newRegUser.status,
                newRegUser.createdAt,
              );
              backendSuccess = true;
              break;
            } catch (e) {
              console.error(
                `registerUser backend attempt ${attempt + 1} failed:`,
                e,
              );
            }
          }
          // Always re-fetch from backend to ensure cross-device consistency
          try {
            const freshUsers = await backendGetUsers();
            if (freshUsers.length > 0) {
              // Don't replace the current user session, just update the users list
              set((s) => {
                const merged = freshUsers.map((bu) => {
                  const local = s.users.find((l) => l.id === bu.id);
                  return local
                    ? { ...bu, rejectionReason: local.rejectionReason }
                    : bu;
                });
                return { users: merged };
              });
            }
          } catch (_e) {}
          if (!backendSuccess) {
            console.warn(
              "Registration saved locally only - backend unavailable",
            );
          }
          return { success: true };
        },

        approveUser: async (userId) => {
          const cu = get().currentUser;
          const userToApprove = get().users.find((u) => u.id === userId);
          set((s) => ({
            users: s.users.map((u) =>
              u.id === userId ? { ...u, status: "approved" as const } : u,
            ),
          }));
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "User Approved",
              `Approved user ${userId}`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "User Approved",
              details: `User "${userToApprove?.name ?? userId}" approved by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "UserManagement",
                  recordId: userId,
                  details: `User "${userToApprove?.name ?? userId}" approved by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          try {
            await backendApproveUser(userId);
          } catch (e) {
            console.error("approveUser backend error:", e);
          }
          // Always re-fetch and replace so all devices see the updated status
          try {
            const freshUsers = await backendGetUsers();
            if (freshUsers.length > 0) {
              const cu2 = get().currentUser;
              const updatedUsers = freshUsers.map((u) => {
                if (
                  cu2 &&
                  (u.id === cu2.id ||
                    u.email.toLowerCase() === cu2.email.toLowerCase())
                ) {
                  return { ...u, isOnline: true };
                }
                return u;
              });
              set({ users: updatedUsers });
            }
          } catch (_e) {}
        },

        rejectUser: (userId, reason) => {
          const cu = get().currentUser;
          const userToReject = get().users.find((u) => u.id === userId);
          set((s) => ({
            users: s.users.map((u) =>
              u.id === userId
                ? { ...u, status: "rejected" as const, rejectionReason: reason }
                : u,
            ),
          }));
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "User Rejected",
              `Rejected user ${userId}. Reason: ${reason}`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "User Rejected",
              details: `User "${userToReject?.name ?? userId}" rejected by ${cu.name} (${cu.role}). Reason: ${reason}`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "UserManagement",
                  recordId: userId,
                  details: `User "${userToReject?.name ?? userId}" rejected by ${cu.name} (${cu.role}). Reason: ${reason}`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          backendRejectUser(userId).catch(() => {});
          // Persist rejection reason to backend appData so other devices can see it
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },

        updateUserRole: (userId, role) => {
          const cu = get().currentUser;
          set((s) => ({
            users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)),
          }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Role Updated",
              `Updated role for user ${userId} to ${role}`,
            );
        },

        createUser: async (userData) => {
          const cu = get().currentUser;
          const existingUsers = get().users;
          const emailMatch = existingUsers.find(
            (u) =>
              u.email.toLowerCase().trim() ===
              userData.email.toLowerCase().trim(),
          );
          if (emailMatch) throw new Error("email_exists");
          const phoneMatch = existingUsers.find(
            (u) => u.phone && u.phone.trim() === userData.phone.trim(),
          );
          if (phoneMatch) throw new Error("phone_exists");
          const newUser: User = {
            ...userData,
            id: uid(),
            createdAt: now(),
            status: "approved",
            lastLogin: "",
            lastActive: "",
            isOnline: false,
          };
          set((s) => ({ users: [...s.users, newUser] }));
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "User Created",
              `Created user ${userData.name} (${userData.email})`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "User Created",
              details: `User "${userData.name}" (${userData.email}) created by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "UserManagement",
                  recordId: newUser.id,
                  details: `User "${userData.name}" (${userData.role}) created by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          let backendSuccess = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
              await backendCreateUser(
                newUser.id,
                newUser.name,
                newUser.email,
                newUser.password,
                newUser.phone,
                newUser.role,
                newUser.status,
                newUser.createdAt,
              );
              backendSuccess = true;
              break;
            } catch (e) {
              console.error(
                `createUser backend attempt ${attempt + 1} failed:`,
                e,
              );
            }
          }
          try {
            const freshUsers = await backendGetUsers();
            if (freshUsers.length > 0) {
              const cu2 = get().currentUser;
              const updatedUsers = freshUsers.map((u) => {
                if (
                  cu2 &&
                  (u.id === cu2.id ||
                    u.email.toLowerCase() === cu2.email.toLowerCase())
                ) {
                  return { ...u, isOnline: true };
                }
                return u;
              });
              set({ users: updatedUsers });
            }
          } catch (_e) {}
          if (!backendSuccess) {
            throw new Error("Backend save failed -- please try again");
          }
        },

        editUser: (userId, updates) => {
          const cu = get().currentUser;
          const existingUsers = get().users;
          if (updates.email) {
            const emailMatch = existingUsers.find(
              (u) =>
                u.id !== userId &&
                u.email.toLowerCase().trim() ===
                  updates.email!.toLowerCase().trim(),
            );
            if (emailMatch) throw new Error("email_exists");
          }
          if (updates.phone) {
            const phoneMatch = existingUsers.find(
              (u) =>
                u.id !== userId &&
                u.phone &&
                u.phone.trim() === updates.phone!.trim(),
            );
            if (phoneMatch) throw new Error("phone_exists");
          }
          set((s) => ({
            users: s.users.map((u) =>
              u.id === userId ? { ...u, ...updates } : u,
            ),
          }));
          if (cu)
            logActivity(cu.id, cu.name, "User Edited", `Edited user ${userId}`);
          const updatedUser = get().users.find((u) => u.id === userId);
          if (updatedUser) {
            backendEditUser(
              userId,
              updatedUser.name,
              updatedUser.email,
              updatedUser.phone,
              updatedUser.role,
              updatedUser.password,
            ).catch(() => {});
          }
        },

        deleteUser: (userId) => {
          const cu = get().currentUser;
          const userToDelete = get().users.find((u) => u.id === userId);
          set((s) => ({ users: s.users.filter((u) => u.id !== userId) }));
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "User Deleted",
              `Deleted user ${userId}`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "User Deleted",
              details: `User "${userToDelete?.name ?? userId}" deleted by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "DELETE" as const,
                  module: "UserManagement",
                  recordId: userId,
                  details: `User "${userToDelete?.name ?? userId}" deleted by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          backendDeleteUser(userId).catch(() => {});
        },

        updateCurrentUser: (updates) => {
          const cu = get().currentUser;
          if (!cu) return;
          set((s) => ({
            currentUser: { ...cu, ...updates },
            users: s.users.map((u) =>
              u.id === cu.id ? { ...u, ...updates } : u,
            ),
          }));
          logActivity(
            cu.id,
            cu.name,
            "Profile Updated",
            "User updated profile",
          );
        },

        addCase: (c) => {
          const cu = get().currentUser;
          const { cases } = get();
          const existingNums = cases
            .map((x) => {
              const m = x.caseId.match(/(\d+)$/);
              return m ? Number.parseInt(m[1]) : 0;
            })
            .filter((n) => !Number.isNaN(n));
          const nextNum =
            existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
          const caseNum = String(nextNum).padStart(3, "0");
          const newCase: Case = {
            ...c,
            id: uid(),
            caseId: c.caseId?.trim()
              ? c.caseId.trim()
              : `MD-${new Date().getFullYear()}-${caseNum}`,
            photos: [],
            createdAt: now(),
            updatedAt: now(),
            createdBy: cu?.id ?? "",
            closedAt: "",
            hasFirstUpdate: false,
            onRouteDate: "",
          };
          set((s) => ({ cases: [newCase, ...s.cases] }));
          get()
            .saveCasesToBackend()
            .catch(() => {});
          get().addAuditEntry({
            caseId: newCase.id,
            userId: cu?.id ?? "",
            userName: cu?.name ?? "",
            action: "Case Created",
            details: `New case created for ${c.customerName}`,
          });
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Case",
                  recordId: newCase.id,
                  details: `Case ${newCase.caseId} created for ${c.customerName} by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Case Created",
              `Created case ${newCase.caseId} for ${c.customerName}`,
            );
          return newCase;
        },

        updateCase: (id, updates) => {
          const cu = get().currentUser;
          set((s) => ({
            cases: s.cases.map((c) =>
              c.id === id ? { ...c, ...updates, updatedAt: now() } : c,
            ),
          }));
          get()
            .saveCasesToBackend()
            .catch(() => {});
          if (cu)
            logActivity(cu.id, cu.name, "Case Updated", `Updated case ${id}`);
        },

        deleteCase: (id) => {
          const cu = get().currentUser;
          const c = get().cases.find((x) => x.id === id);
          set((s) => ({ cases: s.cases.filter((x) => x.id !== id) }));
          get()
            .saveCasesToBackend()
            .catch(() => {});
          if (cu && c)
            logActivity(
              cu.id,
              cu.name,
              "Case Deleted",
              `Deleted case ${c.caseId}`,
            );
        },

        deleteCases: (ids) => {
          const cu = get().currentUser;
          set((s) => ({ cases: s.cases.filter((x) => !ids.includes(x.id)) }));
          get()
            .saveCasesToBackend()
            .catch(() => {});
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Bulk Delete",
              `Deleted ${ids.length} cases`,
            );
        },

        addAuditEntry: (entry) =>
          set((s) => ({
            auditLog: [
              { ...entry, id: uid(), timestamp: now() },
              ...s.auditLog,
            ],
          })),

        addTechnician: (t) => {
          const cu = get().currentUser;
          set((s) => ({
            technicians: [
              ...s.technicians,
              { ...t, id: uid(), createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Technician Added",
              `Added technician ${t.name}`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Technician Added",
              details: `Technician "${t.name}" added by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Technician",
                  recordId: uid(),
                  details: `Technician "${t.name}" added by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        updateTechnician: (id, updates) => {
          const cu = get().currentUser;
          set((s) => ({
            technicians: s.technicians.map((t) =>
              t.id === id ? { ...t, ...updates } : t,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Technician Updated",
              `Updated technician ${id}`,
            );
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "Technician",
                  recordId: id,
                  details: `Technician "${id}" updated by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        deleteTechnician: (id) => {
          const cu = get().currentUser;
          const tech = get().technicians.find((t) => t.id === id);
          set((s) => ({
            technicians: s.technicians.filter((t) => t.id !== id),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Technician Deleted",
              `Deleted technician ${id}`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Technician Deleted",
              details: `Technician "${tech?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "DELETE" as const,
                  module: "Technician",
                  recordId: id,
                  details: `Technician "${tech?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        addReminder: (r) =>
          set((s) => ({
            reminders: [...s.reminders, { ...r, id: uid(), createdAt: now() }],
          })),

        completeReminder: (id) =>
          set((s) => ({
            reminders: s.reminders.map((r) =>
              r.id === id ? { ...r, isDone: true } : r,
            ),
          })),

        deleteNotification: (id) =>
          set((s) => ({
            notifications: s.notifications.filter((n) => n.id !== id),
          })),

        updateReminder: (id, updates) =>
          set((s) => ({
            reminders: s.reminders.map((r) =>
              r.id === id ? { ...r, ...updates } : r,
            ),
          })),

        markNotificationRead: (id) =>
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          })),

        markAllNotificationsRead: () =>
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          })),

        addNotification: (n) =>
          set((s) => ({
            notifications: [
              { ...n, id: uid(), createdAt: now() },
              ...s.notifications,
            ],
          })),

        updateSettings: (s) => {
          const cu = get().currentUser;
          set((state) => ({ settings: { ...state.settings, ...s } }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Settings Updated",
              "Admin updated settings",
            );
            set((state) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "Settings",
                  recordId: "settings",
                  details: `Settings updated by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...state.storePilotAuditLogs,
              ],
            }));
          }
        },

        addPhotoToCase: (caseId, photo) => {
          const newPhoto: CasePhoto = { ...photo, id: uid() };
          set((s) => ({
            cases: s.cases.map((c) =>
              c.id === caseId
                ? { ...c, photos: [...c.photos, newPhoto], updatedAt: now() }
                : c,
            ),
          }));
          get()
            .saveCasesToBackend()
            .catch(() => {});
        },

        changeStatus: (caseId, newStatus, details) => {
          const c = get().cases.find((x) => x.id === caseId);
          const cu = get().currentUser;
          if (!c) return;
          const oldStatus = c.status;
          const updates: Partial<Case> = {
            status: newStatus,
            updatedAt: now(),
          };
          if (
            newStatus === "closed" ||
            newStatus === "adjustment_closed" ||
            newStatus === "replacement_done" ||
            newStatus === "gas_charge_done"
          ) {
            updates.closedAt = now();
          }
          if (newStatus === "on_route") {
            updates.onRouteDate = todayStr();
            updates.hasFirstUpdate = false;
          } else if (oldStatus === "on_route") {
            updates.hasFirstUpdate = true;
          }
          get().updateCase(caseId, updates);
          get().addAuditEntry({
            caseId,
            userId: cu?.id ?? "",
            userName: cu?.name ?? "",
            action: "Status Changed",
            details: `${oldStatus.replace(/_/g, " ")} → ${newStatus.replace(/_/g, " ")}${details ? `. ${details}` : ""}`,
          });
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "Case",
                  recordId: caseId,
                  details: `Case ${c.caseId} status changed: ${oldStatus.replace(/_/g, " ")} → ${newStatus.replace(/_/g, " ")} by ${cu.name} (${cu.role})${details ? `. ${details}` : ""}`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Status Changed",
              `Case ${c.caseId}: ${oldStatus} → ${newStatus}`,
            );
        },

        importCases: (newCasesData) => {
          const { currentUser, cases } = get();
          const existingNums = cases
            .map((c) => {
              const m = c.caseId.match(/(\d+)$/);
              return m ? Number.parseInt(m[1]) : 0;
            })
            .filter((n) => !Number.isNaN(n));
          let nextNum =
            existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;

          const imported: Case[] = newCasesData.map((data) => {
            const caseNum = String(nextNum).padStart(3, "0");
            nextNum++;
            const createdAt = now();
            return {
              ...data,
              id: uid(),
              caseId: `MD-${new Date().getFullYear()}-${caseNum}`,
              photos: [],
              createdAt,
              updatedAt: createdAt,
              createdBy: currentUser?.id ?? "",
              closedAt: "",
              hasFirstUpdate: false,
              onRouteDate: "",
            };
          });

          const auditEntries: AuditEntry[] = imported.map((c) => ({
            id: uid(),
            caseId: c.id,
            userId: currentUser?.id ?? "",
            userName: currentUser?.name ?? "",
            action: "Case Imported",
            details: `Case imported from CSV for ${c.customerName}`,
            timestamp: now(),
          }));

          set((s) => ({
            cases: [...imported, ...s.cases],
            auditLog: [...auditEntries, ...s.auditLog],
          }));

          if (currentUser)
            logActivity(
              currentUser.id,
              currentUser.name,
              "CSV Import",
              `Imported ${imported.length} cases`,
            );

          return imported.length;
        },

        // ── Vendor actions ────────────────────────────────────────────────
        addVendor: (v) => {
          const cu = get().currentUser;
          set((s) => ({
            vendors: [...s.vendors, { ...v, id: uid(), createdAt: now() }],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Vendor Added",
              `Added vendor: ${v.name}`,
            );
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Vendor Added",
              details: `Vendor "${v.name}" added by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Vendor",
                  recordId: uid(),
                  details: `Vendor "${v.name}" added by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        updateVendor: (id, updates) => {
          const cu = get().currentUser;
          const vendor = get().vendors.find((v) => v.id === id);
          set((s) => ({
            vendors: s.vendors.map((v) =>
              v.id === id ? { ...v, ...updates } : v,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "Vendor",
                  recordId: id,
                  details: `Vendor "${vendor?.name ?? id}" updated by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        deleteVendor: (id) => {
          const cu = get().currentUser;
          const vendor = get().vendors.find((v) => v.id === id);
          set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Vendor Deleted",
              details: `Vendor "${vendor?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "DELETE" as const,
                  module: "Vendor",
                  recordId: id,
                  details: `Vendor "${vendor?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        // ── Store notification actions ────────────────────────────────────────────
        addStoreNotification: (n) =>
          set((s) => ({
            storeNotifications: [
              { ...n, id: uid(), createdAt: now() },
              ...s.storeNotifications,
            ],
          })),
        markStoreNotificationRead: (id) =>
          set((s) => ({
            storeNotifications: s.storeNotifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          })),
        markAllStoreNotificationsRead: () =>
          set((s) => ({
            storeNotifications: s.storeNotifications.map((n) => ({
              ...n,
              isRead: true,
            })),
          })),
        deleteStoreNotification: (id) =>
          set((s) => ({
            storeNotifications: s.storeNotifications.filter((n) => n.id !== id),
          })),

        // ── StorePilot actions ────────────────────────────────────────────────

        addStockCompany: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            stockCompanies: [
              ...s.stockCompanies,
              { id: uid(), name, createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Stock Company Added",
              `Added company: ${name}`,
            );
        },
        updateStockCompany: (id, name) => {
          set((s) => ({
            stockCompanies: s.stockCompanies.map((c) =>
              c.id === id ? { ...c, name } : c,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteStockCompany: (id) => {
          set((s) => ({
            stockCompanies: s.stockCompanies.filter((c) => c.id !== id),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },

        addStockCategory: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            stockCategories: [
              ...s.stockCategories,
              { id: uid(), name, createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Stock Category Added",
              `Added category: ${name}`,
            );
        },
        updateStockCategory: (id, name) => {
          set((s) => ({
            stockCategories: s.stockCategories.map((c) =>
              c.id === id ? { ...c, name } : c,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteStockCategory: (id) => {
          set((s) => ({
            stockCategories: s.stockCategories.filter((c) => c.id !== id),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },

        addStockPartName: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            stockPartNames: [
              ...s.stockPartNames,
              { id: uid(), name, createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Stock Part Name Added",
              `Added part name: ${name}`,
            );
        },
        updateStockPartName: (id, name) => {
          set((s) => ({
            stockPartNames: s.stockPartNames.map((p) =>
              p.id === id ? { ...p, name } : p,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteStockPartName: (id) => {
          set((s) => ({
            stockPartNames: s.stockPartNames.filter((p) => p.id !== id),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },

        addWarehouse: (name, address) => {
          const cu = get().currentUser;
          set((s) => ({
            warehouses: [
              ...s.warehouses,
              { id: uid(), name, address, createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Warehouse Added",
              details: `Warehouse "${name}" added by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Warehouse",
                  recordId: uid(),
                  details: `Warehouse "${name}" added by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        updateWarehouse: (id, name, address) => {
          set((s) => ({
            warehouses: s.warehouses.map((w) =>
              w.id === id ? { ...w, name, address } : w,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteWarehouse: (id) => {
          const cu = get().currentUser;
          const wh = get().warehouses.find((w) => w.id === id);
          set((s) => ({ warehouses: s.warehouses.filter((w) => w.id !== id) }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Warehouse Deleted",
              details: `Warehouse "${wh?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
            });
          }
        },
        addRackToWarehouse: (name, warehouseId) => {
          const cu = get().currentUser;
          set((s) => ({
            racks: [
              ...s.racks,
              { id: uid(), name, warehouseId, createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Warehouse",
                  recordId: uid(),
                  details: `Rack "${name}" added to warehouse by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        addRack: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            racks: [
              ...s.racks,
              {
                id: uid(),
                name,
                warehouseId: s.warehouses[0]?.id ?? "wh1",
                createdAt: now(),
              },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Rack Added",
              details: `Rack "${name}" added by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Warehouse",
                  recordId: uid(),
                  details: `Rack "${name}" added by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        updateRack: (id, name) => {
          set((s) => ({
            racks: s.racks.map((r) => (r.id === id ? { ...r, name } : r)),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteRack: (id) => {
          const cu = get().currentUser;
          const rack = get().racks.find((r) => r.id === id);
          set((s) => {
            const childShelves = s.shelves
              .filter((sh) => sh.rackId === id)
              .map((sh) => sh.id);
            const childBins = s.bins
              .filter((b) => childShelves.includes(b.shelfId))
              .map((b) => b.id);
            return {
              racks: s.racks.filter((r) => r.id !== id),
              shelves: s.shelves.filter((sh) => sh.rackId !== id),
              bins: s.bins.filter((b) => !childShelves.includes(b.shelfId)),
              partItems: s.partItems.map((p) => {
                if (p.rackId === id)
                  return { ...p, rackId: "", shelfId: "", binId: "" };
                if (childShelves.includes(p.shelfId ?? ""))
                  return { ...p, shelfId: "", binId: "", rackId: "" };
                if (childBins.includes(p.binId ?? ""))
                  return { ...p, rackId: "", shelfId: "", binId: "" };
                return p;
              }) as PartInventoryItem[],
            };
          });
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Rack Deleted",
              details: `Rack "${rack?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "DELETE" as const,
                  module: "Warehouse",
                  recordId: id,
                  details: `Rack "${rack?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        addShelf: (name, rackId) => {
          const cu = get().currentUser;
          set((s) => ({
            shelves: [
              ...s.shelves,
              { id: uid(), name, rackId, createdAt: now() },
            ],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Shelf Added",
              details: `Shelf "${name}" added by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Warehouse",
                  recordId: uid(),
                  details: `Shelf "${name}" added by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        updateShelf: (id, updates) => {
          set((s) => ({
            shelves: s.shelves.map((sh) =>
              sh.id === id ? { ...sh, ...updates } : sh,
            ),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteShelf: (id) => {
          const cu = get().currentUser;
          const shelf = get().shelves.find((s) => s.id === id);
          set((s) => {
            const childBins = s.bins
              .filter((b) => b.shelfId === id)
              .map((b) => b.id);
            return {
              shelves: s.shelves.filter((sh) => sh.id !== id),
              bins: s.bins.filter((b) => b.shelfId !== id),
              partItems: s.partItems.map((p) => {
                if (p.shelfId === id)
                  return { ...p, shelfId: "", binId: "", rackId: "" };
                if (childBins.includes(p.binId ?? ""))
                  return { ...p, rackId: "", shelfId: "", binId: "" };
                return p;
              }) as PartInventoryItem[],
            };
          });
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Shelf Deleted",
              details: `Shelf "${shelf?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "DELETE" as const,
                  module: "Warehouse",
                  recordId: id,
                  details: `Shelf "${shelf?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        addBin: (name, shelfId) => {
          const cu = get().currentUser;
          set((s) => ({
            bins: [...s.bins, { id: uid(), name, shelfId, createdAt: now() }],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Warehouse",
                  recordId: uid(),
                  details: `Bin "${name}" added by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },
        updateBin: (id, updates) => {
          set((s) => ({
            bins: s.bins.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
        },
        deleteBin: (id) => {
          const cu = get().currentUser;
          const bin = get().bins.find((b) => b.id === id);
          set((s) => ({
            bins: s.bins.filter((b) => b.id !== id),
            partItems: s.partItems.map((p) =>
              p.binId === id ? { ...p, rackId: "", shelfId: "", binId: "" } : p,
            ) as PartInventoryItem[],
          }));
          get()
            .saveAppDataToBackend()
            .catch(() => {});
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "DELETE" as const,
                  module: "Warehouse",
                  recordId: id,
                  details: `Bin "${bin?.name ?? id}" deleted by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        addPurchaseEntry: (entry, partCodes) => {
          const cu = get().currentUser;
          const purchaseId = uid();
          const purchase: PurchaseEntry = {
            ...entry,
            id: purchaseId,
            createdAt: now(),
            createdBy: cu?.id ?? "",
          };
          const items: PartInventoryItem[] = partCodes.map((pc) => ({
            id: uid(),
            partCode: pc.code,
            purchaseId,
            companyId: entry.companyId,
            categoryId: entry.categoryId,
            partNameId: entry.partNameId,
            rackId: pc.rackId,
            shelfId: pc.shelfId,
            binId: pc.binId,
            imageUrl: pc.imageUrl ?? "",
            status: "in_stock" as PartItemStatus,
            technicianId: "",
            caseId: "",
            issueDate: "",
            issuedBy: "",
            installedAt: "",
            returnedToStoreAt: "",
            returnRemarks: "",
            returnedToCompanyAt: "",
            returnToCompanyReason: "",
            returnToCompanyRemarks: "",
            returnedToCompanyBy: "",
            createdAt: now(),
          }));
          const lifecycles: PartLifecycleEntry[] = items.map((item) => ({
            id: uid(),
            partId: item.id,
            action: "Purchased",
            details: `Received from ${entry.vendorName}, Invoice ${entry.invoiceNumber}`,
            userId: cu?.id ?? "",
            userName: cu?.name ?? "",
            timestamp: now(),
          }));
          set((s) => ({
            purchaseEntries: [...s.purchaseEntries, purchase],
            partItems: [...s.partItems, ...items],
            partLifecycle: [...s.partLifecycle, ...lifecycles],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Purchase Entry",
              `Purchased ${partCodes.length} parts from ${entry.vendorName}`,
            );
            const partCodesStr = partCodes.map((pc) => pc.code).join(", ");
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Purchase Entry",
              details: `Purchased ${partCodes.length} parts [${partCodesStr}] from ${entry.vendorName}, Invoice: ${entry.invoiceNumber}. Added by ${cu.name} (${cu.role})`,
            });
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "Purchase",
                  recordId: purchaseId,
                  details: `Purchase entry: ${partCodes.length} parts [${partCodesStr}] from ${entry.vendorName}, Invoice: ${entry.invoiceNumber}`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                  partCodes: partCodes.map((pc) => pc.code),
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        assignPartLocation: (partId, rackId, shelfId, binId) => {
          const cu = get().currentUser;
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId ? { ...p, rackId, shelfId, binId } : p,
            ),
            partLifecycle: [
              ...s.partLifecycle,
              {
                id: uid(),
                partId,
                action: "Location Assigned",
                details: `Assigned to Rack/Shelf/Bin by ${cu?.name ?? "unknown"} (${cu?.role ?? ""})`,
                userId: cu?.id ?? "",
                userName: cu?.name ?? "",
                timestamp: now(),
              },
            ],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu) {
            const p = get().partItems.find((x) => x.id === partId);
            get().addAuditEntry({
              caseId: "",
              userId: cu.id,
              userName: cu.name,
              action: "Location Assigned",
              details: `Part [${p?.partCode ?? partId}] assigned to location (Rack/Shelf/Bin) by ${cu.name} (${cu.role})`,
            });
            const pForLog = get().partItems.find((x) => x.id === partId);
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "UPDATE" as const,
                  module: "PartInstance",
                  recordId: partId,
                  details: `Part [${pForLog?.partCode ?? partId}] location assigned by ${cu.name} (${cu.role})`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                  partCodes: [pForLog?.partCode ?? partId],
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
        },

        issuePartToTechnician: (partId, technicianId, caseId) => {
          const cu = get().currentUser;
          const tech = get().technicians.find((t) => t.id === technicianId);
          const issueDate = now();
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    status: "issued" as PartItemStatus,
                    technicianId,
                    caseId,
                    issueDate,
                    issuedBy: cu?.name ?? "",
                  }
                : p,
            ),
            partLifecycle: [
              ...s.partLifecycle,
              {
                id: uid(),
                partId,
                action: "Issued",
                details: `Issued to ${tech?.name ?? technicianId} for Case ${caseId}`,
                userId: cu?.id ?? "",
                userName: cu?.name ?? "",
                timestamp: issueDate,
              },
            ],
          }));
          const part = get().partItems.find((p) => p.id === partId);
          if (part) {
            get().addStoreNotification({
              title: "Part Issued",
              message: `${part.partCode} issued to ${tech?.name ?? "technician"} for case ${caseId || "N/A"}`,
              type: "part_issued",
              priority: "medium",
              isRead: false,
              relatedPartCode: part.partCode,
            });
          }
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Part Issued",
              `Part issued to ${tech?.name} for case ${caseId}`,
            );
            const partForLog = get().partItems.find((p) => p.id === partId);
            if (partForLog) {
              get().addAuditEntry({
                caseId: caseId,
                userId: cu.id,
                userName: cu.name,
                action: "Part Issued to Technician",
                details: `Part [${partForLog.partCode}] issued to ${tech?.name ?? technicianId} for Case ${caseId} by ${cu.name} (${cu.role})`,
              });
              set((s) => ({
                storePilotAuditLogs: [
                  {
                    id: uid(),
                    action: "ISSUE" as const,
                    module: "PartIssue",
                    recordId: partId,
                    details: `Part [${partForLog.partCode}] issued to ${tech?.name ?? technicianId} for Case ${caseId}`,
                    userId: cu.id,
                    userName: cu.name,
                    userRole: cu.role,
                    timestamp: now(),
                    partCodes: [partForLog.partCode],
                  },
                  ...s.storePilotAuditLogs,
                ],
              }));
            }
          }
        },

        markPartInstalled: (partId) => {
          const cu = get().currentUser;
          const installedAt = now();
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? { ...p, status: "installed" as PartItemStatus, installedAt }
                : p,
            ),
            partLifecycle: [
              ...s.partLifecycle,
              {
                id: uid(),
                partId,
                action: "Installed",
                details: "Part marked as installed by supervisor",
                userId: cu?.id ?? "",
                userName: cu?.name ?? "",
                timestamp: installedAt,
              },
            ],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Part Installed",
              `Part ${partId} marked installed`,
            );
            const partForInstall = get().partItems.find((p) => p.id === partId);
            if (partForInstall) {
              get().addAuditEntry({
                caseId: partForInstall.caseId,
                userId: cu.id,
                userName: cu.name,
                action: "Part Installed",
                details: `Part [${partForInstall.partCode}] marked installed by ${cu.name} (${cu.role})`,
              });
              set((s) => ({
                storePilotAuditLogs: [
                  {
                    id: uid(),
                    action: "UPDATE" as const,
                    module: "PartInstance",
                    recordId: partId,
                    details: `Part [${partForInstall.partCode}] marked as installed by ${cu.name} (${cu.role})`,
                    userId: cu.id,
                    userName: cu.name,
                    userRole: cu.role,
                    timestamp: now(),
                    partCodes: [partForInstall.partCode],
                  },
                  ...s.storePilotAuditLogs,
                ],
              }));
            }
          }
        },

        returnPartToStore: (partId, remarks) => {
          const cu = get().currentUser;
          const returnedAt = now();
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    status: "returned_to_store" as PartItemStatus,
                    // Preserve original issuance details for display in Returned to Store tab
                    returnedToStoreAt: returnedAt,
                    returnRemarks: remarks,
                  }
                : p,
            ),
            partLifecycle: [
              ...s.partLifecycle,
              {
                id: uid(),
                partId,
                action: "Returned to Store",
                details: remarks ? `Remarks: ${remarks}` : "Returned to store",
                userId: cu?.id ?? "",
                userName: cu?.name ?? "",
                timestamp: returnedAt,
              },
            ],
          }));
          const part = get().partItems.find((p) => p.id === partId);
          if (part) {
            get().addStoreNotification({
              title: "Part Returned to Store",
              message: `${part.partCode} returned to store`,
              type: "part_returned",
              priority: "low",
              isRead: false,
              relatedPartCode: part.partCode,
            });
          }
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Part Returned to Store",
              `Part ${partId} returned`,
            );
            const partReturned = get().partItems.find((p) => p.id === partId);
            if (partReturned) {
              get().addAuditEntry({
                caseId: partReturned.caseId,
                userId: cu.id,
                userName: cu.name,
                action: "Returned to Store",
                details: `Part [${partReturned.partCode}] returned to store by ${cu.name} (${cu.role}). Remarks: ${remarks || "None"}`,
              });
              set((s) => ({
                storePilotAuditLogs: [
                  {
                    id: uid(),
                    action: "RETURN" as const,
                    module: "PartIssue",
                    recordId: partReturned.id,
                    details: `Part [${partReturned.partCode}] returned to store by ${cu.name} (${cu.role}). Remarks: ${remarks || "None"}`,
                    userId: cu.id,
                    userName: cu.name,
                    userRole: cu.role,
                    timestamp: now(),
                    partCodes: [partReturned.partCode],
                  },
                  ...s.storePilotAuditLogs,
                ],
              }));
            }
          }
        },

        returnPartToCompany: (partId, reason, remarks) => {
          const cu = get().currentUser;
          const returnedAt = now();
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    status: "returned_to_company" as PartItemStatus,
                    returnedToCompanyAt: returnedAt,
                    returnToCompanyReason: reason,
                    returnToCompanyRemarks: remarks,
                    returnedToCompanyBy: cu?.name ?? "",
                  }
                : p,
            ),
            partLifecycle: [
              ...s.partLifecycle,
              {
                id: uid(),
                partId,
                action: "Returned to Company",
                details: `Reason: ${reason}${remarks ? `. ${remarks}` : ""}`,
                userId: cu?.id ?? "",
                userName: cu?.name ?? "",
                timestamp: returnedAt,
              },
            ],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Part Returned to Company",
              `Part ${partId} returned to company`,
            );
            const partRetComp = get().partItems.find((p) => p.id === partId);
            if (partRetComp) {
              get().addAuditEntry({
                caseId: "",
                userId: cu.id,
                userName: cu.name,
                action: "Returned to Company",
                details: `Part [${partRetComp.partCode}] returned to company by ${cu.name} (${cu.role}). Reason: ${reason}. Remarks: ${remarks || "None"}`,
              });
              set((s) => ({
                storePilotAuditLogs: [
                  {
                    id: uid(),
                    action: "RETURN" as const,
                    module: "PartInstance",
                    recordId: partId,
                    details: `Part [${partRetComp.partCode}] returned to company by ${cu.name} (${cu.role}). Reason: ${reason}`,
                    userId: cu.id,
                    userName: cu.name,
                    userRole: cu.role,
                    timestamp: now(),
                    partCodes: [partRetComp.partCode],
                  },
                  ...s.storePilotAuditLogs,
                ],
              }));
            }
          }
        },

        // ── Part Request actions ────────────────────────────────────────────
        addPartRequest: (req) => {
          const hour = new Date().getHours();
          const greeting =
            hour < 12
              ? "Good Morning"
              : hour < 17
                ? "Good Afternoon"
                : "Good Evening";
          const cu = get().currentUser;
          // Build message with multi-part support
          const partsList = (req as any).parts as PartRequestItem[] | undefined;
          const partsSummary =
            partsList && partsList.length > 0
              ? partsList.map((p) => `${p.partName} (${p.partCode})`).join(", ")
              : `${req.partName}${req.partCode ? ` (${req.partCode})` : ""}`;
          const message = `Hello ${greeting} ${req.requestedByName} ji, I am requesting a part for Case ${req.caseId} — Customer: ${req.customerName} | Product: ${req.productType || "N/A"} | Parts: ${partsSummary} | Company: ${req.companyName || "N/A"}`;
          const newReq: PartRequest = {
            ...req,
            id: uid(),
            requestedAt: now(),
            status: "pending" as PartRequestStatus,
            technicianId: "",
            issuedAt: "",
            issuedBy: "",
            issuedByName: "",
            rejectedReason: "",
            rejectedAt: "",
            rejectedBy: "",
            rejectedByName: "",
            message,
            parts: partsList && partsList.length > 0 ? partsList : undefined,
          };
          // Set partCode/partName from first part for backwards compat
          if (partsList && partsList.length > 0) {
            newReq.partCode = partsList[0].partCode;
            newReq.partName = partsList[0].partName;
            newReq.partPhotoUrl = partsList[0].partPhotoUrl || req.partPhotoUrl;
          }
          set((s) => ({
            partRequests: [newReq, ...s.partRequests],
          }));
          // Save all part requests to backend via JSON blob
          const allReqs = get().partRequests;
          backendSetPartRequestsJson(JSON.stringify(allReqs)).catch((e) =>
            console.error("addPartRequest backend save error:", e),
          );
          // Also log audit
          if (cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "CREATE" as const,
                  module: "PartRequest",
                  recordId: newReq.id,
                  details: `Part request created for case ${newReq.caseId} by ${cu.name}`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                  partCodes: partsList
                    ? partsList.map((p) => p.partCode)
                    : [newReq.partCode],
                },
                ...s.storePilotAuditLogs,
              ],
            }));
          }
          // Add lifecycle entries for each requested part
          const partCodesForLifecycle =
            partsList && partsList.length > 0
              ? partsList
              : [
                  {
                    partCode: newReq.partCode,
                    partName: newReq.partName,
                    id: newReq.id,
                  },
                ];
          const requestLifecycles = partCodesForLifecycle.map((p) => ({
            id: uid(),
            partId: (p as any).id || newReq.id,
            action: "Part Requested",
            details: `Part [${p.partCode}] requested for Case ${newReq.caseId} by ${cu?.name ?? "unknown"} (${cu?.role ?? ""})`,
            userId: cu?.id ?? "",
            userName: cu?.name ?? "",
            timestamp: now(),
          }));
          set((s) => ({
            partLifecycle: [...s.partLifecycle, ...requestLifecycles],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          // Notify all supervisors and admins of new part request (NOT the requester)
          {
            const allUsers = get().users;
            const supervisorsAndAdmins = allUsers.filter(
              (u) =>
                (u.role === "supervisor" || u.role === "admin") &&
                u.status === "approved" &&
                u.id !== cu?.id,
            );
            const partCodesSummary =
              partsList && partsList.length > 0
                ? partsList.map((p) => p.partCode).join(", ")
                : newReq.partCode;
            for (const u of supervisorsAndAdmins) {
              get().addNotification({
                userId: u.id,
                message: `New part request from ${newReq.requestedByName}: Parts [${partCodesSummary}], Case ${newReq.caseId}, Customer: ${newReq.customerName}`,
                type: "part_request",
                isRead: false,
                caseId: newReq.caseDbId,
                relatedPartCode: newReq.partCode,
              });
            }
          }
        },

        issuePartRequest: (id, technicianId, partItemId?: string) => {
          const cu = get().currentUser;
          const tech = get().technicians.find((t) => t.id === technicianId);
          const issuedAt = now();
          set((s) => ({
            partRequests: s.partRequests.map((r) => {
              if (r.id !== id) return r;
              if (partItemId && r.parts && r.parts.length > 0) {
                // Partial issue: update specific part item
                const updatedParts = r.parts.map((p) =>
                  p.id === partItemId
                    ? {
                        ...p,
                        status: "issued" as const,
                        issuedAt,
                        issuedBy: cu?.id ?? "",
                        issuedByName: cu?.name ?? "",
                        technicianId,
                      }
                    : p,
                );
                const allIssued = updatedParts.every(
                  (p) => p.status === "issued" || p.status === "rejected",
                );
                return {
                  ...r,
                  parts: updatedParts,
                  status: allIssued
                    ? ("issued" as PartRequestStatus)
                    : r.status,
                  technicianId: allIssued ? technicianId : r.technicianId,
                  issuedAt: allIssued ? issuedAt : r.issuedAt,
                  issuedBy: allIssued ? (cu?.id ?? "") : r.issuedBy,
                  issuedByName: allIssued ? (cu?.name ?? "") : r.issuedByName,
                };
              }
              // Issue all (no partItemId)
              const updatedParts = r.parts?.map((p) => ({
                ...p,
                status: "issued" as const,
                issuedAt,
                issuedBy: cu?.id ?? "",
                issuedByName: cu?.name ?? "",
                technicianId,
              }));
              return {
                ...r,
                parts: updatedParts,
                status: "issued" as PartRequestStatus,
                technicianId,
                issuedAt,
                issuedBy: cu?.id ?? "",
                issuedByName: cu?.name ?? "",
              };
            }),
          }));
          // Save to backend via JSON blob
          const allReqs = get().partRequests;
          backendSetPartRequestsJson(JSON.stringify(allReqs)).catch((e) =>
            console.error("issuePartRequest backend error:", e),
          );
          // Also call structured method for compatibility
          backendIssuePartRequest(
            id,
            technicianId,
            issuedAt,
            cu?.id ?? "",
            cu?.name ?? "",
          ).catch(() => {});
          // Also create a PartInventoryItem so it shows in Inventory > Issued Parts
          const issuedReq = get().partRequests.find((r) => r.id === id);
          if (issuedReq) {
            const company = get().stockCompanies.find(
              (c) =>
                c.name.toLowerCase() ===
                (issuedReq.companyName ?? "").toLowerCase(),
            );
            const partNameEntry = get().stockPartNames.find(
              (pn) =>
                pn.name.toLowerCase() === issuedReq.partName.toLowerCase(),
            );
            const newPartItem: PartInventoryItem = {
              id: uid(),
              partCode: issuedReq.partCode || issuedReq.partName,
              purchaseId: `req-${issuedReq.id}`,
              companyId: company?.id ?? "",
              categoryId: "",
              partNameId: partNameEntry?.id ?? "",
              rackId: "",
              shelfId: "",
              binId: "",
              imageUrl: issuedReq.partPhotoUrl || "",
              status: "issued" as PartItemStatus,
              technicianId,
              caseId: issuedReq.caseId,
              issueDate: now(),
              issuedBy: cu?.name ?? "",
              installedAt: "",
              returnedToStoreAt: "",
              returnRemarks: "",
              returnedToCompanyAt: "",
              returnToCompanyReason: "",
              returnToCompanyRemarks: "",
              returnedToCompanyBy: "",
              createdAt: now(),
              overridePartName: issuedReq.partName,
              overrideCompanyName: issuedReq.companyName ?? "",
              partRequestId: issuedReq.id,
            };
            set((s) => ({ partItems: [...s.partItems, newPartItem] }));
            get()
              .saveInventoryToBackend()
              .catch(() => {});
          }
          const req = get().partRequests.find((r) => r.id === id);
          if (req) {
            get().addNotification({
              userId: req.requestedBy,
              message: `Your part request for [${req.partCode || req.parts?.[0]?.partCode || "part"}] (Case ${req.caseId}) has been issued to technician ${tech?.name ?? "technician"} by ${cu?.name ?? "supervisor"}`,
              type: "part_issued",
              isRead: false,
              caseId: req.caseDbId,
              relatedPartCode: req.partCode || req.parts?.[0]?.partCode,
            });
          }
          // Add storePilot audit log and audit entry
          const issuedReqForLog = get().partRequests.find((r) => r.id === id);
          if (issuedReqForLog && cu) {
            set((s) => ({
              storePilotAuditLogs: [
                {
                  id: uid(),
                  action: "ISSUE" as const,
                  module: "PartRequest",
                  recordId: id,
                  details: `Part request issued: [${issuedReqForLog.partCode || issuedReqForLog.parts?.map((p) => p.partCode).join(",")}] to technician ${tech?.name ?? technicianId} for Case ${issuedReqForLog.caseId}`,
                  userId: cu.id,
                  userName: cu.name,
                  userRole: cu.role,
                  timestamp: now(),
                  partCodes: issuedReqForLog.parts
                    ? issuedReqForLog.parts.map((p) => p.partCode)
                    : [issuedReqForLog.partCode],
                },
                ...s.storePilotAuditLogs,
              ],
              auditLog: [
                {
                  id: uid(),
                  caseId: issuedReqForLog.caseDbId,
                  userId: cu.id,
                  userName: cu.name,
                  action: "Part Issued",
                  details: `Part [${issuedReqForLog.partCode || issuedReqForLog.parts?.map((p) => p.partCode).join(", ")}] issued to technician ${tech?.name ?? technicianId} for Case ${issuedReqForLog.caseId} by ${cu.name} (${cu.role})`,
                  timestamp: now(),
                },
                ...s.auditLog,
              ],
            }));
          }
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Request Issued",
              `Part request ${id} issued to ${tech?.name}`,
            );
          // Fix 1: Force re-sync so all clients see the update immediately
          setTimeout(() => {
            get()
              .syncPartRequests()
              .catch(() => {});
          }, 200);
        },

        rejectPartRequest: (id, reason) => {
          const cu = get().currentUser;
          set((s) => ({
            partRequests: s.partRequests.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: "rejected" as PartRequestStatus,
                    rejectedReason: reason,
                    rejectedAt: now(),
                    rejectedBy: cu?.id ?? "",
                    rejectedByName: cu?.name ?? "",
                  }
                : r,
            ),
          }));
          backendRejectPartRequest(
            id,
            reason,
            now(),
            cu?.id ?? "",
            cu?.name ?? "",
          ).catch(() => {});
          // Save all to JSON blob
          const allReqsR = get().partRequests;
          backendSetPartRequestsJson(JSON.stringify(allReqsR)).catch((e) =>
            console.error("rejectPartRequest backend error:", e),
          );
          const req = get().partRequests.find((r) => r.id === id);
          if (req) {
            get().addNotification({
              userId: req.requestedBy,
              message: `Your part request for case ${req.caseId} was rejected. Reason: ${reason}`,
              type: "part_request",
              isRead: false,
              caseId: req.caseDbId,
            });
          }
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Part Request Rejected",
              `Part request ${id} rejected`,
            );
            const rejReq = get().partRequests.find((r) => r.id === id);
            if (rejReq) {
              get().addAuditEntry({
                caseId: rejReq.caseDbId,
                userId: cu.id,
                userName: cu.name,
                action: "Part Request Rejected",
                details: `Part request for [${rejReq.partCode || rejReq.parts?.map((p) => p.partCode).join(", ")}] Case ${rejReq.caseId} rejected by ${cu.name} (${cu.role}). Reason: ${reason}`,
              });
              set((s) => ({
                storePilotAuditLogs: [
                  {
                    id: uid(),
                    action: "UPDATE" as const,
                    module: "PartRequest",
                    recordId: id,
                    details: `Part request [${rejReq.partCode || rejReq.parts?.map((p) => p.partCode).join(", ")}] rejected by ${cu.name} (${cu.role}). Reason: ${reason}`,
                    userId: cu.id,
                    userName: cu.name,
                    userRole: cu.role,
                    timestamp: now(),
                    partCodes: rejReq.parts
                      ? rejReq.parts.map((p) => p.partCode)
                      : [rejReq.partCode],
                  },
                  ...s.storePilotAuditLogs,
                ],
              }));
            }
          }
        },
        cancelPartRequest: (id) => {
          const cu = get().currentUser;
          const cancelNow = new Date().toISOString();
          set((s) => ({
            partRequests: s.partRequests.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: "cancelled" as PartRequestStatus,
                    cancelledBy: cu?.id ?? "",
                    cancelledByName: cu?.name ?? "",
                    cancelledAt: cancelNow,
                  }
                : r,
            ),
          }));
          backendCancelPartRequest(
            id,
            cu?.id ?? "",
            cu?.name ?? "",
            cancelNow,
          ).catch(() => {});
          // Save all to JSON blob
          const allReqsC = get().partRequests;
          backendSetPartRequestsJson(JSON.stringify(allReqsC)).catch((e) =>
            console.error("cancelPartRequest backend error:", e),
          );
          if (cu) {
            logActivity(
              cu.id,
              cu.name,
              "Part Request Cancelled",
              `Part request ${id} cancelled by user`,
            );
            const cancelReq = get().partRequests.find((r) => r.id === id);
            if (cancelReq) {
              get().addAuditEntry({
                caseId: cancelReq.caseDbId,
                userId: cu.id,
                userName: cu.name,
                action: "Part Request Cancelled",
                details: `Part request for [${cancelReq.partCode || cancelReq.parts?.map((p) => p.partCode).join(", ")}] Case ${cancelReq.caseId} cancelled by ${cu.name} (${cu.role})`,
              });
              set((s) => ({
                storePilotAuditLogs: [
                  {
                    id: uid(),
                    action: "UPDATE" as const,
                    module: "PartRequest",
                    recordId: id,
                    details: `Part request [${cancelReq.partCode || cancelReq.parts?.map((p) => p.partCode).join(", ")}] cancelled by ${cu.name} (${cu.role})`,
                    userId: cu.id,
                    userName: cu.name,
                    userRole: cu.role,
                    timestamp: now(),
                    partCodes: cancelReq.parts
                      ? cancelReq.parts.map((p) => p.partCode)
                      : [cancelReq.partCode],
                  },
                  ...s.storePilotAuditLogs,
                ],
              }));
            }
          }
        },
        syncPartRequests: async () => {
          try {
            // Try JSON blob first (preferred)
            const json = await backendGetPartRequestsJson();
            if (json && json !== "{}") {
              try {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed)) {
                  set({ partRequests: parsed });
                  return;
                }
              } catch {
                // fall through to structured method
              }
            }
            // Fallback: structured method (migration path)
            const backendReqs = await backendGetPartRequests();
            if (backendReqs.length > 0) {
              const mapped: PartRequest[] = backendReqs.map((r) => ({
                id: r.id,
                caseId: r.caseId,
                caseDbId: r.caseDbId,
                customerName: r.customerName,
                partName: r.partName,
                partCode: r.partCode,
                partPhotoUrl: r.partPhotoUrl,
                requestedBy: r.requestedBy,
                requestedByName: r.requestedByName,
                requestedAt: r.requestedAt,
                status: r.status as PartRequestStatus,
                technicianId: r.technicianId,
                issuedAt: r.issuedAt,
                issuedBy: r.issuedBy,
                issuedByName: r.issuedByName,
                rejectedReason: r.rejectedReason,
                rejectedAt: r.rejectedAt,
                rejectedBy: r.rejectedBy,
                rejectedByName: r.rejectedByName,
                message: r.message,
                productType: r.productType,
                companyName: r.companyName,
                priority: r.priority || "normal",
                cancelledBy: r.cancelledBy || "",
                cancelledByName: r.cancelledByName || "",
                cancelledAt: r.cancelledAt || "",
              }));
              set({ partRequests: mapped });
              // Migrate to JSON blob
              backendSetPartRequestsJson(JSON.stringify(mapped)).catch(
                () => {},
              );
            }
          } catch (e) {
            console.error("syncPartRequests error:", e);
          }
        },
        syncCases: async () => {
          try {
            const json = await backendGetCasesJson();
            if (json && json !== "{}") {
              try {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed)) {
                  set({ cases: parsed });
                }
              } catch {
                /* ignore parse errors */
              }
            }
          } catch (e) {
            console.error("syncCases error:", e);
          }
        },
        saveCasesToBackend: async () => {
          try {
            const { cases } = get();
            await backendSetCasesJson(JSON.stringify(cases));
          } catch (e) {
            console.error("saveCasesToBackend error:", e);
          }
        },
        syncNotices: async () => {
          try {
            const json = await backendGetNoticesJson();
            if (json && json !== "{}") {
              try {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed)) {
                  set({ adminNotices: parsed });
                }
              } catch {
                /* ignore parse errors */
              }
            }
          } catch (e) {
            console.error("syncNotices error:", e);
          }
        },
        saveNoticesToBackend: async () => {
          try {
            const { adminNotices } = get();
            await backendSetNoticesJson(JSON.stringify(adminNotices));
          } catch (e) {
            console.error("saveNoticesToBackend error:", e);
          }
        },
        syncInventory: async () => {
          try {
            const json = await backendGetInventoryJson();
            // Only skip if backend has never been written to (truly empty)
            if (!json || json === "{}") return;
            try {
              const parsed = JSON.parse(json);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                // Always apply backend data - including empty arrays (for deletions to propagate)
                const updates: Partial<ReturnType<typeof get>> = {};
                if ("parts" in parsed) updates.partItems = parsed.parts ?? [];
                if ("purchases" in parsed)
                  updates.purchaseEntries = parsed.purchases ?? [];
                if ("lifecycleEntries" in parsed)
                  updates.partLifecycle = parsed.lifecycleEntries ?? [];
                if ("auditLogs" in parsed)
                  updates.storePilotAuditLogs = parsed.auditLogs ?? [];
                if ("storeNotifications" in parsed)
                  updates.storeNotifications = parsed.storeNotifications ?? [];
                if (Object.keys(updates).length > 0) set(updates as any);
              }
            } catch {
              /* ignore parse errors */
            }
          } catch (e) {
            console.error("syncInventory error:", e);
          }
        },
        saveInventoryToBackend: async () => {
          try {
            const {
              partItems,
              purchaseEntries,
              partLifecycle,
              storePilotAuditLogs,
              storeNotifications,
            } = get();
            const json = JSON.stringify({
              parts: partItems,
              purchases: purchaseEntries,
              lifecycleEntries: partLifecycle,
              auditLogs: storePilotAuditLogs,
              storeNotifications,
            });
            await backendSetInventoryJson(json);
          } catch (e) {
            console.error("saveInventoryToBackend error:", e);
          }
        },
        syncAppData: async () => {
          try {
            const json = await backendGetAppDataJson();
            // Only skip if backend has never been written to (truly empty)
            if (!json || json === "{}") return;
            try {
              const parsed = JSON.parse(json);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                const updates: Partial<ReturnType<typeof get>> = {};
                // Always apply backend data - including empty arrays (for deletions to propagate)
                if ("warehouses" in parsed)
                  updates.warehouses = parsed.warehouses ?? [];
                if ("racks" in parsed) updates.racks = parsed.racks ?? [];
                if ("shelves" in parsed) updates.shelves = parsed.shelves ?? [];
                if ("bins" in parsed) updates.bins = parsed.bins ?? [];
                if ("technicians" in parsed)
                  updates.technicians = parsed.technicians ?? [];
                if ("vendors" in parsed) updates.vendors = parsed.vendors ?? [];
                if ("companies" in parsed)
                  updates.stockCompanies = parsed.companies ?? [];
                if ("categories" in parsed)
                  updates.stockCategories = parsed.categories ?? [];
                if ("partNames" in parsed)
                  updates.stockPartNames = parsed.partNames ?? [];
                if ("notifications" in parsed)
                  updates.notifications = parsed.notifications ?? [];
                if ("reminders" in parsed)
                  updates.reminders = parsed.reminders ?? [];
                if ("activityLog" in parsed)
                  updates.activityLog = parsed.activityLog ?? [];
                if (parsed.settings)
                  updates.settings = { ...get().settings, ...parsed.settings };
                // Restore rejection reasons for users
                if (
                  parsed.rejectionReasons &&
                  typeof parsed.rejectionReasons === "object"
                ) {
                  const reasons = parsed.rejectionReasons as Record<
                    string,
                    string
                  >;
                  set((s) => ({
                    users: s.users.map((u) =>
                      reasons[u.id]
                        ? { ...u, rejectionReason: reasons[u.id] }
                        : u,
                    ),
                  }));
                }
                if (Object.keys(updates).length > 0) set(updates as any);
              }
            } catch {
              /* ignore parse errors */
            }
          } catch (e) {
            console.error("syncAppData error:", e);
          }
        },
        saveAppDataToBackend: async () => {
          try {
            const {
              warehouses,
              racks,
              shelves,
              bins,
              technicians,
              vendors,
              stockCompanies,
              stockCategories,
              stockPartNames,
              notifications,
              reminders,
              activityLog,
              settings,
              users,
            } = get();
            // Build rejection reasons map so other devices can show rejection reason
            const rejectionReasons: Record<string, string> = {};
            for (const u of users) {
              if (u.status === "rejected" && u.rejectionReason) {
                rejectionReasons[u.id] = u.rejectionReason;
              }
            }
            const json = JSON.stringify({
              warehouses,
              racks,
              shelves,
              bins,
              technicians,
              vendors,
              companies: stockCompanies,
              categories: stockCategories,
              partNames: stockPartNames,
              notifications,
              reminders,
              activityLog,
              settings,
              rejectionReasons,
            });
            await backendSetAppDataJson(json);
          } catch (e) {
            console.error("saveAppDataToBackend error:", e);
          }
        },
        addPartImages: (partId, imageUrls) =>
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    partImageUrls: [...(p.partImageUrls ?? []), ...imageUrls],
                  }
                : p,
            ),
          })),
        removePartImage: (partId, imageUrl) =>
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    partImageUrls: (p.partImageUrls ?? []).filter(
                      (u) => u !== imageUrl,
                    ),
                  }
                : p,
            ),
          })),
        updatePurchaseInvoiceImage: (purchaseId, imageUrl) =>
          set((s) => ({
            purchaseEntries: s.purchaseEntries.map((pe) =>
              pe.id === purchaseId ? { ...pe, invoiceImageUrl: imageUrl } : pe,
            ),
          })),
        removePurchaseInvoiceImage: (purchaseId) =>
          set((s) => ({
            purchaseEntries: s.purchaseEntries.map((pe) =>
              pe.id === purchaseId ? { ...pe, invoiceImageUrl: undefined } : pe,
            ),
          })),

        addExistingStock: (entries) => {
          const cu = get().currentUser;
          const items: PartInventoryItem[] = entries.flatMap((entry) =>
            Array.from({ length: entry.quantity }, () => ({
              id: uid(),
              partCode: entry.partCode,
              purchaseId: "existing-stock",
              companyId: entry.companyId,
              categoryId: entry.categoryId,
              partNameId: entry.partNameId,
              rackId: entry.rackId ?? "",
              shelfId: entry.shelfId ?? "",
              binId: entry.binId ?? "",
              imageUrl: "",
              status: "in_stock" as PartItemStatus,
              technicianId: "",
              caseId: "",
              issueDate: "",
              issuedBy: "",
              installedAt: "",
              returnedToStoreAt: "",
              returnRemarks: "",
              returnedToCompanyAt: "",
              returnToCompanyReason: "",
              returnToCompanyRemarks: "",
              returnedToCompanyBy: "",
              createdAt: now(),
            })),
          );
          const lifecycles: PartLifecycleEntry[] = items.map((item) => ({
            id: uid(),
            partId: item.id,
            action: "Purchased",
            details: `Existing stock added${entries.find((e) => e.partCode === item.partCode)?.notes ? `: ${entries.find((e) => e.partCode === item.partCode)?.notes}` : ""}`,
            userId: cu?.id ?? "",
            userName: cu?.name ?? "",
            timestamp: now(),
          }));
          set((s) => ({
            partItems: [...s.partItems, ...items],
            partLifecycle: [...s.partLifecycle, ...lifecycles],
          }));
          get()
            .saveInventoryToBackend()
            .catch(() => {});
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Existing Stock Added",
              `Added ${items.length} existing stock item(s)`,
            );
        },
      };
    },
    {
      name: "servicedesk-storage",
      partialize: (state) => ({
        // UI preferences and session only — all application data comes from backend
        currentUser: state.currentUser,
        currentPage: state.currentPage,
        sidebarCollapsed: (state as any).sidebarCollapsed,
        seenPartRequestsCount: state.seenPartRequestsCount,
        seenApprovalsCount: state.seenApprovalsCount,
        lastMidnightResetDate: state.lastMidnightResetDate,
        notificationsGeneratedDate: state.notificationsGeneratedDate,
        settings: state.settings,
      }),
    },
  ),
);

export const getAgeing = (createdAt: string): number =>
  Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ["printed", "confirmed", "pending", "cancelled"],
  printed: ["confirmed", "pending", "cancelled"],
  confirmed: ["pending", "on_route", "cancelled"],
  pending: ["on_route", "cancelled", "rescheduled"],
  on_route: [
    "pending",
    "part_required",
    "gas_charge_pending",
    "closed",
    "adjustment_closed",
    "replacement_done",
    "re_open",
  ],
  rescheduled: ["pending", "on_route", "cancelled"],
  part_required: ["part_available", "part_ordered", "cancelled"],
  part_available: ["part_issued", "cancelled"],
  part_issued: ["on_route", "cancelled"],
  part_ordered: ["part_received", "cancelled"],
  part_received: ["on_route", "pending"],
  gas_charge_pending: ["gas_charge_done", "on_route"],
  gas_charge_done: ["closed"],
  re_open: ["on_route", "pending", "cancelled"],
  transferred: [],
  cancelled: [],
  closed: ["re_open"],
  adjustment_closed: [],
  replacement_done: [],
};

export const photoTypeLabel: Record<string, string> = {
  product: "Product Photo",
  serial: "Serial Number",
  invoice: "Invoice",
  before: "Before Repair",
  after: "After Repair",
  part: "Part Photo",
};
