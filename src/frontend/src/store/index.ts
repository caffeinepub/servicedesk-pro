import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityLog,
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
  PartRequestStatus,
  PhotoType,
  PurchaseEntry,
  Reminder,
  Settings,
  StockCategory,
  StockCompany,
  StockPartName,
  StoreNotification,
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
  {
    id: "u2",
    name: "Rahul Verma",
    email: "rahul@servicedesk.com",
    phone: "9888888888",
    password: "User@123",
    role: "backend_user",
    status: "approved",
    createdAt: now(),
    lastLogin: "",
    lastActive: "",
    isOnline: false,
  },
  {
    id: "u3",
    name: "Supervisor",
    email: "supervisor@servicedesk.com",
    phone: "9777777777",
    password: "Super@123",
    role: "supervisor" as const,
    status: "approved" as const,
    createdAt: now(),
    lastLogin: "",
    lastActive: "",
    isOnline: false,
  },
];

const SEED_TECHNICIANS: Technician[] = [
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

const SEED_CASES: Case[] = [
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

const SEED_STOCK_COMPANIES: StockCompany[] = [
  { id: "sc1", name: "Midea", createdAt: now() },
  { id: "sc2", name: "Toshiba", createdAt: now() },
  { id: "sc3", name: "Godrej", createdAt: now() },
  { id: "sc4", name: "Sansui", createdAt: now() },
];

const SEED_STOCK_CATEGORIES: StockCategory[] = [
  { id: "scat1", name: "AC", createdAt: now() },
  { id: "scat2", name: "TV", createdAt: now() },
  { id: "scat3", name: "Washing Machine", createdAt: now() },
  { id: "scat4", name: "Refrigerator", createdAt: now() },
];

const SEED_STOCK_PART_NAMES: StockPartName[] = [
  { id: "spn1", name: "Compressor", createdAt: now() },
  { id: "spn2", name: "Power Board", createdAt: now() },
  { id: "spn3", name: "Display Panel", createdAt: now() },
  { id: "spn4", name: "PCB Board", createdAt: now() },
  { id: "spn5", name: "Drive Belt", createdAt: now() },
  { id: "spn6", name: "Thermostat", createdAt: now() },
];

const SEED_WAREHOUSES: Warehouse[] = [
  {
    id: "wh1",
    name: "Main Warehouse",
    address: "Plot 12, Industrial Area, Delhi",
    createdAt: now(),
  },
];

const SEED_RACKS: WarehouseRack[] = [
  { id: "rack1", name: "Rack A", warehouseId: "wh1", createdAt: now() },
  { id: "rack2", name: "Rack B", warehouseId: "wh1", createdAt: now() },
];

const SEED_SHELVES: WarehouseShelf[] = [
  { id: "shelf1", name: "Shelf A1", rackId: "rack1", createdAt: now() },
  { id: "shelf2", name: "Shelf A2", rackId: "rack1", createdAt: now() },
  { id: "shelf3", name: "Shelf B1", rackId: "rack2", createdAt: now() },
];

const SEED_BINS: WarehouseBin[] = [
  { id: "bin1", name: "Bin A1-1", shelfId: "shelf1", createdAt: now() },
  { id: "bin2", name: "Bin A1-2", shelfId: "shelf1", createdAt: now() },
  { id: "bin3", name: "Bin B1-1", shelfId: "shelf3", createdAt: now() },
];

const SEED_VENDORS: Vendor[] = [
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

const SEED_PURCHASES: PurchaseEntry[] = [
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

const SEED_PART_ITEMS: PartInventoryItem[] = [
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

const SEED_LIFECYCLE: PartLifecycleEntry[] = [
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

const SEED_STORE_NOTIFICATIONS: StoreNotification[] = [
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

// ── StoreState interface ─────────────────────────────────────────────────────

interface StoreState {
  // Auth
  currentUser: User | null;
  currentPage: PageType;
  selectedCaseId: string | null;
  selectedPartId: string | null;
  notificationsGeneratedDate: string;
  lastMidnightResetDate: string;

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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  navigate: (page: PageType, caseId?: string, partId?: string) => void;
  registerUser: (
    user: Omit<
      User,
      "id" | "createdAt" | "status" | "lastLogin" | "lastActive" | "isOnline"
    >,
  ) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  updateUserRole: (userId: string, role: User["role"]) => void;
  createUser: (userData: {
    name: string;
    email: string;
    phone: string;
    role: User["role"];
    password: string;
  }) => void;
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
    >,
  ) => void;
  issuePartRequest: (id: string, technicianId: string) => void;
  rejectPartRequest: (id: string, reason: string) => void;
  addPartImages: (partId: string, imageUrls: string[]) => void;
  removePartImage: (partId: string, imageUrl: string) => void;
  updatePurchaseInvoiceImage: (purchaseId: string, imageUrl: string) => void;
  removePurchaseInvoiceImage: (purchaseId: string) => void;
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
        currentPage: "login" as PageType,
        selectedCaseId: null,
        selectedPartId: null,
        notificationsGeneratedDate: "",
        lastMidnightResetDate: "",
        users: SEED_USERS,
        technicians: SEED_TECHNICIANS,
        cases: SEED_CASES,
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
        stockCompanies: SEED_STOCK_COMPANIES,
        stockCategories: SEED_STOCK_CATEGORIES,
        stockPartNames: SEED_STOCK_PART_NAMES,
        warehouses: SEED_WAREHOUSES,
        racks: SEED_RACKS,
        shelves: SEED_SHELVES,
        bins: SEED_BINS,
        vendors: SEED_VENDORS,
        purchaseEntries: SEED_PURCHASES,
        partItems: SEED_PART_ITEMS,
        partLifecycle: SEED_LIFECYCLE,
        partRequests: [],
        storeNotifications: SEED_STORE_NOTIFICATIONS,

        login: (email, password) => {
          const user = get().users.find(
            (u) =>
              u.email === email &&
              u.password === password &&
              u.status === "approved",
          );
          if (!user) return false;
          const loginTime = now();
          set((s) => ({
            currentUser: { ...user, isOnline: true, lastLogin: loginTime },
            currentPage: "dashboard" as PageType,
            users: s.users.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    isOnline: true,
                    lastLogin: loginTime,
                    lastActive: loginTime,
                  }
                : u,
            ),
          }));
          logActivity(user.id, user.name, "Login", "User logged in");
          get().generateAutoNotifications();
          get().runMidnightResets();
          return true;
        },

        logout: () => {
          const cu = get().currentUser;
          if (cu) {
            logActivity(cu.id, cu.name, "Logout", "User logged out");
            set((s) => ({
              users: s.users.map((u) =>
                u.id === cu.id
                  ? { ...u, isOnline: false, lastActive: now() }
                  : u,
              ),
            }));
          }
          set({ currentUser: null, currentPage: "login" as PageType });
        },

        navigate: (page, caseId, partId) =>
          set({
            currentPage: page,
            selectedCaseId: caseId ?? get().selectedCaseId,
            selectedPartId: partId ?? get().selectedPartId,
          }),

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

        registerUser: (user) => {
          set((s) => ({
            users: [
              ...s.users,
              {
                ...user,
                id: uid(),
                createdAt: now(),
                status: "pending" as const,
                lastLogin: "",
                lastActive: "",
                isOnline: false,
              },
            ],
          }));
        },

        approveUser: (userId) => {
          const cu = get().currentUser;
          set((s) => ({
            users: s.users.map((u) =>
              u.id === userId ? { ...u, status: "approved" as const } : u,
            ),
          }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "User Approved",
              `Approved user ${userId}`,
            );
        },

        rejectUser: (userId) => {
          const cu = get().currentUser;
          set((s) => ({
            users: s.users.map((u) =>
              u.id === userId ? { ...u, status: "rejected" as const } : u,
            ),
          }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "User Rejected",
              `Rejected user ${userId}`,
            );
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

        createUser: (userData) => {
          const cu = get().currentUser;
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "User Created",
              `Created user ${userData.name} (${userData.email})`,
            );
        },

        editUser: (userId, updates) => {
          const cu = get().currentUser;
          set((s) => ({
            users: s.users.map((u) =>
              u.id === userId ? { ...u, ...updates } : u,
            ),
          }));
          if (cu)
            logActivity(cu.id, cu.name, "User Edited", `Edited user ${userId}`);
        },

        deleteUser: (userId) => {
          const cu = get().currentUser;
          set((s) => ({ users: s.users.filter((u) => u.id !== userId) }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "User Deleted",
              `Deleted user ${userId}`,
            );
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
            caseId: `MD-${new Date().getFullYear()}-${caseNum}`,
            photos: [],
            createdAt: now(),
            updatedAt: now(),
            createdBy: cu?.id ?? "",
            closedAt: "",
            hasFirstUpdate: false,
            onRouteDate: "",
          };
          set((s) => ({ cases: [newCase, ...s.cases] }));
          get().addAuditEntry({
            caseId: newCase.id,
            userId: cu?.id ?? "",
            userName: cu?.name ?? "",
            action: "Case Created",
            details: `New case created for ${c.customerName}`,
          });
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
          if (cu)
            logActivity(cu.id, cu.name, "Case Updated", `Updated case ${id}`);
        },

        deleteCase: (id) => {
          const cu = get().currentUser;
          const c = get().cases.find((x) => x.id === id);
          set((s) => ({ cases: s.cases.filter((x) => x.id !== id) }));
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Bulk Delete",
              `Deleted ${ids.length} cases`,
            );
        },

        addAuditEntry: (entry) => {
          set((s) => ({
            auditLog: [
              { ...entry, id: uid(), timestamp: now() },
              ...s.auditLog,
            ],
          }));
        },

        addTechnician: (t) => {
          const cu = get().currentUser;
          set((s) => ({
            technicians: [
              ...s.technicians,
              { ...t, id: uid(), createdAt: now() },
            ],
          }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Technician Added",
              `Added technician ${t.name}`,
            );
        },

        updateTechnician: (id, updates) => {
          const cu = get().currentUser;
          set((s) => ({
            technicians: s.technicians.map((t) =>
              t.id === id ? { ...t, ...updates } : t,
            ),
          }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Technician Updated",
              `Updated technician ${id}`,
            );
        },

        deleteTechnician: (id) => {
          const cu = get().currentUser;
          set((s) => ({
            technicians: s.technicians.filter((t) => t.id !== id),
          }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Technician Deleted",
              `Deleted technician ${id}`,
            );
        },

        addReminder: (r) => {
          set((s) => ({
            reminders: [...s.reminders, { ...r, id: uid(), createdAt: now() }],
          }));
        },

        completeReminder: (id) => {
          set((s) => ({
            reminders: s.reminders.map((r) =>
              r.id === id ? { ...r, isDone: true } : r,
            ),
          }));
        },

        markNotificationRead: (id) => {
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          }));
        },

        markAllNotificationsRead: () => {
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          }));
        },

        addNotification: (n) => {
          set((s) => ({
            notifications: [
              { ...n, id: uid(), createdAt: now() },
              ...s.notifications,
            ],
          }));
        },

        updateSettings: (s) => {
          const cu = get().currentUser;
          set((state) => ({ settings: { ...state.settings, ...s } }));
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Settings Updated",
              "Admin updated settings",
            );
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Vendor Added",
              `Added vendor: ${v.name}`,
            );
        },
        updateVendor: (id, updates) => {
          set((s) => ({
            vendors: s.vendors.map((v) =>
              v.id === id ? { ...v, ...updates } : v,
            ),
          }));
        },
        deleteVendor: (id) => {
          set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) }));
        },

        // ── Store notification actions ────────────────────────────────────────────
        addStoreNotification: (n) => {
          set((s) => ({
            storeNotifications: [
              { ...n, id: uid(), createdAt: now() },
              ...s.storeNotifications,
            ],
          }));
        },
        markStoreNotificationRead: (id) => {
          set((s) => ({
            storeNotifications: s.storeNotifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          }));
        },
        markAllStoreNotificationsRead: () => {
          set((s) => ({
            storeNotifications: s.storeNotifications.map((n) => ({
              ...n,
              isRead: true,
            })),
          }));
        },
        deleteStoreNotification: (id) => {
          set((s) => ({
            storeNotifications: s.storeNotifications.filter((n) => n.id !== id),
          }));
        },

        // ── StorePilot actions ────────────────────────────────────────────────

        addStockCompany: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            stockCompanies: [
              ...s.stockCompanies,
              { id: uid(), name, createdAt: now() },
            ],
          }));
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
        },
        deleteStockCompany: (id) => {
          set((s) => ({
            stockCompanies: s.stockCompanies.filter((c) => c.id !== id),
          }));
        },

        addStockCategory: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            stockCategories: [
              ...s.stockCategories,
              { id: uid(), name, createdAt: now() },
            ],
          }));
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
        },
        deleteStockCategory: (id) => {
          set((s) => ({
            stockCategories: s.stockCategories.filter((c) => c.id !== id),
          }));
        },

        addStockPartName: (name) => {
          const cu = get().currentUser;
          set((s) => ({
            stockPartNames: [
              ...s.stockPartNames,
              { id: uid(), name, createdAt: now() },
            ],
          }));
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
        },
        deleteStockPartName: (id) => {
          set((s) => ({
            stockPartNames: s.stockPartNames.filter((p) => p.id !== id),
          }));
        },

        addWarehouse: (name, address) => {
          set((s) => ({
            warehouses: [
              ...s.warehouses,
              { id: uid(), name, address, createdAt: now() },
            ],
          }));
        },
        updateWarehouse: (id, name, address) => {
          set((s) => ({
            warehouses: s.warehouses.map((w) =>
              w.id === id ? { ...w, name, address } : w,
            ),
          }));
        },
        deleteWarehouse: (id) => {
          set((s) => ({ warehouses: s.warehouses.filter((w) => w.id !== id) }));
        },
        addRackToWarehouse: (name, warehouseId) => {
          set((s) => ({
            racks: [
              ...s.racks,
              { id: uid(), name, warehouseId, createdAt: now() },
            ],
          }));
        },
        addRack: (name) => {
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
        },
        updateRack: (id, name) => {
          set((s) => ({
            racks: s.racks.map((r) => (r.id === id ? { ...r, name } : r)),
          }));
        },
        deleteRack: (id) => {
          set((s) => ({ racks: s.racks.filter((r) => r.id !== id) }));
        },

        addShelf: (name, rackId) => {
          set((s) => ({
            shelves: [
              ...s.shelves,
              { id: uid(), name, rackId, createdAt: now() },
            ],
          }));
        },
        updateShelf: (id, updates) => {
          set((s) => ({
            shelves: s.shelves.map((sh) =>
              sh.id === id ? { ...sh, ...updates } : sh,
            ),
          }));
        },
        deleteShelf: (id) => {
          set((s) => ({ shelves: s.shelves.filter((sh) => sh.id !== id) }));
        },

        addBin: (name, shelfId) => {
          set((s) => ({
            bins: [...s.bins, { id: uid(), name, shelfId, createdAt: now() }],
          }));
        },
        updateBin: (id, updates) => {
          set((s) => ({
            bins: s.bins.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          }));
        },
        deleteBin: (id) => {
          set((s) => ({ bins: s.bins.filter((b) => b.id !== id) }));
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Purchase Entry",
              `Purchased ${partCodes.length} parts from ${entry.vendorName}`,
            );
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
                details: "Assigned to Rack/Shelf/Bin",
                userId: cu?.id ?? "",
                userName: cu?.name ?? "",
                timestamp: now(),
              },
            ],
          }));
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Issued",
              `Part issued to ${tech?.name} for case ${caseId}`,
            );
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Installed",
              `Part ${partId} marked installed`,
            );
        },

        returnPartToStore: (partId, remarks) => {
          const cu = get().currentUser;
          const returnedAt = now();
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    status: "in_stock" as PartItemStatus,
                    technicianId: "",
                    caseId: "",
                    issueDate: "",
                    issuedBy: "",
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Returned to Store",
              `Part ${partId} returned`,
            );
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Returned to Company",
              `Part ${partId} returned to company`,
            );
        },

        // ── Part Request actions ────────────────────────────────────────────
        addPartRequest: (req) => {
          set((s) => ({
            partRequests: [
              {
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
              },
              ...s.partRequests,
            ],
          }));
        },

        issuePartRequest: (id, technicianId) => {
          const cu = get().currentUser;
          const tech = get().technicians.find((t) => t.id === technicianId);
          set((s) => ({
            partRequests: s.partRequests.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: "issued" as PartRequestStatus,
                    technicianId,
                    issuedAt: now(),
                    issuedBy: cu?.id ?? "",
                    issuedByName: cu?.name ?? "",
                  }
                : r,
            ),
          }));
          const req = get().partRequests.find((r) => r.id === id);
          if (req) {
            get().addNotification({
              userId: req.requestedBy,
              message: `Your part request for case ${req.caseId} has been approved. Part issued to ${tech?.name ?? "technician"}`,
              type: "part_request",
              isRead: false,
              caseId: req.caseDbId,
            });
          }
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Request Issued",
              `Part request ${id} issued to ${tech?.name}`,
            );
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
          if (cu)
            logActivity(
              cu.id,
              cu.name,
              "Part Request Rejected",
              `Part request ${id} rejected`,
            );
        },
        addPartImages: (partId, imageUrls) => {
          set((s) => ({
            partItems: s.partItems.map((p) =>
              p.id === partId
                ? {
                    ...p,
                    partImageUrls: [...(p.partImageUrls ?? []), ...imageUrls],
                  }
                : p,
            ),
          }));
        },
        removePartImage: (partId, imageUrl) => {
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
          }));
        },
        updatePurchaseInvoiceImage: (purchaseId, imageUrl) => {
          set((s) => ({
            purchaseEntries: s.purchaseEntries.map((pe) =>
              pe.id === purchaseId ? { ...pe, invoiceImageUrl: imageUrl } : pe,
            ),
          }));
        },
        removePurchaseInvoiceImage: (purchaseId) => {
          set((s) => ({
            purchaseEntries: s.purchaseEntries.map((pe) =>
              pe.id === purchaseId ? { ...pe, invoiceImageUrl: undefined } : pe,
            ),
          }));
        },
      };
    },
    {
      name: "servicedesk-storage",
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        cases: state.cases,
        auditLog: state.auditLog,
        activityLog: state.activityLog,
        reminders: state.reminders,
        notifications: state.notifications,
        settings: state.settings,
        stockCompanies: state.stockCompanies,
        stockCategories: state.stockCategories,
        stockPartNames: state.stockPartNames,
        warehouses: state.warehouses,
        racks: state.racks,
        shelves: state.shelves,
        bins: state.bins,
        vendors: state.vendors,
        purchaseEntries: state.purchaseEntries,
        partItems: state.partItems,
        partLifecycle: state.partLifecycle,
        partRequests: state.partRequests,
        storeNotifications: state.storeNotifications,
        technicians: state.technicians,
        notificationsGeneratedDate: state.notificationsGeneratedDate,
        lastMidnightResetDate: state.lastMidnightResetDate,
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
  part_required: ["part_ordered", "cancelled"],
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
