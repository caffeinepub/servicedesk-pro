import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuditEntry,
  Case,
  CasePhoto,
  CaseStatus,
  Notification,
  PageType,
  PhotoType,
  Reminder,
  Settings,
  Technician,
  User,
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
  },
  {
    id: "t2",
    name: "Suresh Singh",
    phone: "9222222222",
    specialization: "Washing Machine",
    isActive: true,
    createdAt: now(),
  },
  {
    id: "t3",
    name: "Mahesh Yadav",
    phone: "9333333333",
    specialization: "Refrigerator",
    isActive: true,
    createdAt: now(),
  },
  {
    id: "t4",
    name: "Dinesh Patel",
    phone: "9444444444",
    specialization: "General",
    isActive: false,
    createdAt: now(),
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
    customerName: "Dealer - TechMart",
    phone: "9867890123",
    altPhone: "",
    address: "Shop 4, Electronics Market",
    product: "Washing Machine",
    productType: "Top Load 8kg",
    complaintType: "stock_repair",
    status: "closed",
    technicianId: "t2",
    technicianFeedback: "Repaired and tested",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "Dealer stock repair",
    additionalNotes: "Mail sent to company",
    photos: [],
    createdAt: d(7),
    updatedAt: d(0),
    createdBy: "u1",
    closedAt: d(0),
    hasFirstUpdate: true,
    onRouteDate: "",
  },
  {
    id: "c6",
    caseId: "MD-2024-006",
    customerName: "Rekha Tiwari",
    phone: "9878901234",
    altPhone: "",
    address: "56 Gandhi Nagar, Lucknow",
    product: "AC",
    productType: "1 Ton Window",
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
    remarks: "Customer asked to call tomorrow",
    additionalNotes: "",
    photos: [],
    createdAt: d(2),
    updatedAt: d(1),
    createdBy: "u2",
    closedAt: "",
    hasFirstUpdate: false,
    onRouteDate: "",
  },
  {
    id: "c7",
    caseId: "MD-2024-007",
    customerName: "Sanjay Kapoor",
    phone: "9889012345",
    altPhone: "9890123456",
    address: "89 Model Town, Chandigarh",
    product: "Refrigerator",
    productType: "200L Single Door",
    complaintType: "installation",
    status: "confirmed",
    technicianId: "",
    technicianFeedback: "",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "Customer confirmed visit",
    additionalNotes: "",
    photos: [],
    createdAt: d(2),
    updatedAt: d(1),
    createdBy: "u1",
    closedAt: "",
    hasFirstUpdate: false,
    onRouteDate: "",
  },
  {
    id: "c8",
    caseId: "MD-2024-008",
    customerName: "Meena Joshi",
    phone: "9890123456",
    altPhone: "",
    address: "101 Vikas Nagar, Pune",
    product: "Washing Machine",
    productType: "Semi Auto 8kg",
    complaintType: "breakdown",
    status: "closed",
    technicianId: "t3",
    technicianFeedback: "Belt replaced",
    partCode: "BELT-SA-8",
    partName: "Drive Belt",
    partPhotoUrl: "",
    poNumber: "PO-2024-101",
    orderDate: d(12),
    receivedDate: d(6),
    nextActionDate: "",
    remarks: "Belt was worn out",
    additionalNotes: "",
    photos: [],
    createdAt: d(14),
    updatedAt: d(0),
    createdBy: "u2",
    closedAt: d(0),
    hasFirstUpdate: true,
    onRouteDate: "",
  },
  {
    id: "c9",
    caseId: "MD-2024-009",
    customerName: "Deepak Nair",
    phone: "9901234567",
    altPhone: "",
    address: "34 Indiranagar, Bangalore",
    product: "AC",
    productType: "1.5 Ton Inverter",
    complaintType: "breakdown",
    status: "rescheduled",
    technicianId: "t1",
    technicianFeedback: "",
    partCode: "",
    partName: "",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    remarks: "Technician could not reach",
    additionalNotes: "",
    photos: [],
    createdAt: d(6),
    updatedAt: d(0),
    createdBy: "u1",
    closedAt: "",
    hasFirstUpdate: false,
    onRouteDate: "",
  },
  {
    id: "c10",
    caseId: "MD-2024-010",
    customerName: "Kavita Singh",
    phone: "9912345678",
    altPhone: "9923456789",
    address: "67 Ashok Vihar, Delhi",
    product: "Refrigerator",
    productType: "450L French Door",
    complaintType: "breakdown",
    status: "part_required",
    technicianId: "t3",
    technicianFeedback: "PCB damaged",
    partCode: "PCB-450-FD",
    partName: "PCB Board",
    partPhotoUrl: "",
    poNumber: "",
    orderDate: "",
    receivedDate: "",
    nextActionDate: "",
    remarks: "PCB board required",
    additionalNotes: "",
    photos: [],
    createdAt: d(10),
    updatedAt: d(1),
    createdBy: "u2",
    closedAt: "",
    hasFirstUpdate: true,
    onRouteDate: "",
  },
];

const SEED_AUDIT: AuditEntry[] = [
  {
    id: "a1",
    caseId: "c1",
    userId: "u2",
    userName: "Rahul Verma",
    action: "Case Created",
    details: "Status set to New",
    timestamp: d(1),
  },
  {
    id: "a2",
    caseId: "c2",
    userId: "u2",
    userName: "Rahul Verma",
    action: "Case Created",
    details: "Status set to New",
    timestamp: d(3),
  },
  {
    id: "a3",
    caseId: "c2",
    userId: "u1",
    userName: "Admin",
    action: "Status Changed",
    details: "New → On Route. Assigned to Suresh Singh",
    timestamp: d(2),
  },
  {
    id: "a4",
    caseId: "c3",
    userId: "u2",
    userName: "Rahul Verma",
    action: "Case Created",
    details: "Status set to New",
    timestamp: d(9),
  },
  {
    id: "a5",
    caseId: "c3",
    userId: "u1",
    userName: "Admin",
    action: "Status Changed",
    details: "New → On Route",
    timestamp: d(5),
  },
  {
    id: "a6",
    caseId: "c3",
    userId: "u1",
    userName: "Admin",
    action: "Status Changed",
    details: "On Route → Part Required. Part: Compressor COMP-350-R22",
    timestamp: d(2),
  },
];

const SEED_SETTINGS: Settings = {
  supervisorWhatsApp: "919999999999",
  supervisorName: "Mishra",
  companyName: "Midea/Toshiba Service Centre",
  products: [
    "AC",
    "Washing Machine",
    "Refrigerator",
    "Microwave",
    "Water Heater",
    "Air Cooler",
  ],
};

const CLOSED_STATUSES = [
  "closed",
  "cancelled",
  "transferred",
  "adjustment_closed",
  "replacement_done",
  "gas_charge_done",
];

interface StoreState {
  // Auth
  currentUser: User | null;
  currentPage: PageType;
  selectedCaseId: string | null;
  notificationsGenerated: boolean;
  lastMidnightResetDate: string;

  // Data
  users: User[];
  technicians: Technician[];
  cases: Case[];
  auditLog: AuditEntry[];
  reminders: Reminder[];
  notifications: Notification[];
  settings: Settings;

  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  navigate: (page: PageType, caseId?: string) => void;
  registerUser: (user: Omit<User, "id" | "createdAt" | "status">) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  updateUserRole: (userId: string, role: User["role"]) => void;
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
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentPage: "login",
      selectedCaseId: null,
      notificationsGenerated: false,
      lastMidnightResetDate: "",
      users: SEED_USERS,
      technicians: SEED_TECHNICIANS,
      cases: SEED_CASES,
      auditLog: SEED_AUDIT,
      reminders: [],
      notifications: [],
      settings: { ...SEED_SETTINGS },

      runMidnightResets: () => {
        const today = todayStr();
        if (get().lastMidnightResetDate === today) return;
        const { cases, currentUser } = get();
        const staleCases = cases.filter(
          (c) =>
            c.status === "on_route" &&
            c.technicianId &&
            !c.hasFirstUpdate &&
            c.onRouteDate &&
            c.onRouteDate < today,
        );
        if (staleCases.length === 0) {
          set({ lastMidnightResetDate: today });
          return;
        }
        const resetAt = now();
        set((s) => ({
          lastMidnightResetDate: today,
          cases: s.cases.map((c) =>
            staleCases.find((sc) => sc.id === c.id)
              ? {
                  ...c,
                  status: "pending" as CaseStatus,
                  technicianId: "",
                  updatedAt: resetAt,
                }
              : c,
          ),
          auditLog: [
            ...staleCases.map((c) => ({
              id: uid(),
              caseId: c.id,
              userId: "system",
              userName: "System (Auto)",
              action: "Auto Reset",
              details:
                "No technician update received. Technician unassigned and case reset to Pending at midnight.",
              timestamp: resetAt,
            })),
            ...s.auditLog,
          ],
        }));
        const newNotifs: Notification[] = staleCases.map((c) => ({
          id: uid(),
          userId: currentUser?.id ?? "",
          message: `Case ${c.caseId} (${c.customerName}) was auto-reset — no technician update received.`,
          type: "stale_case" as const,
          isRead: false,
          caseId: c.id,
          createdAt: resetAt,
        }));
        if (newNotifs.length > 0) {
          set((s) => ({ notifications: [...newNotifs, ...s.notifications] }));
        }
      },

      resetStaleTechnician: (caseId) => {
        const c = get().cases.find((x) => x.id === caseId);
        if (!c) return;
        const resetAt = now();
        set((s) => ({
          cases: s.cases.map((x) =>
            x.id === caseId
              ? {
                  ...x,
                  status: "pending" as CaseStatus,
                  technicianId: "",
                  updatedAt: resetAt,
                }
              : x,
          ),
          auditLog: [
            {
              id: uid(),
              caseId,
              userId: get().currentUser?.id ?? "",
              userName: get().currentUser?.name ?? "User",
              action: "Manual Reset",
              details: "Technician manually unassigned. Case reset to Pending.",
              timestamp: resetAt,
            },
            ...s.auditLog,
          ],
        }));
      },

      login: (email, password) => {
        const user = get().users.find(
          (u) =>
            u.email === email &&
            u.password === password &&
            u.status === "approved",
        );
        if (user) {
          set({ currentUser: user, currentPage: "dashboard" });
          get().runMidnightResets();
          get().generateAutoNotifications();
          return true;
        }
        return false;
      },

      logout: () =>
        set({
          currentUser: null,
          currentPage: "login",
          selectedCaseId: null,
          notificationsGenerated: false,
        }),

      navigate: (page, caseId) =>
        set({
          currentPage: page,
          selectedCaseId: caseId ?? get().selectedCaseId,
        }),

      generateAutoNotifications: () => {
        if (get().notificationsGenerated) return;
        const { cases, currentUser } = get();
        const today = new Date().toISOString().split("T")[0];
        const newNotifications: Notification[] = [];
        const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();

        for (const c of cases) {
          if (CLOSED_STATUSES.includes(c.status)) continue;
          const ageDays = Math.floor(
            (Date.now() - new Date(c.createdAt).getTime()) / 86400000,
          );
          if (ageDays >= 8) {
            newNotifications.push({
              id: uid(),
              userId: currentUser?.id ?? "",
              message: `Case ${c.caseId} (${c.customerName}) is overdue — ${ageDays} days old`,
              type: "overdue",
              isRead: false,
              caseId: c.id,
              createdAt: now(),
            });
          }
          if (c.nextActionDate && c.nextActionDate.split("T")[0] === today) {
            newNotifications.push({
              id: uid(),
              userId: currentUser?.id ?? "",
              message: `Follow-up due today for case ${c.caseId} — ${c.customerName}`,
              type: "follow_up",
              isRead: false,
              caseId: c.id,
              createdAt: now(),
            });
          }
          if (
            (c.status === "part_required" || c.status === "part_ordered") &&
            c.updatedAt < fiveDaysAgo
          ) {
            newNotifications.push({
              id: uid(),
              userId: currentUser?.id ?? "",
              message: `Part pending >5 days for case ${c.caseId} — ${c.partName || "Unknown part"}`,
              type: "part_pending",
              isRead: false,
              caseId: c.id,
              createdAt: now(),
            });
          }
          // Stale case detection
          if (
            c.status === "on_route" &&
            c.technicianId &&
            !c.hasFirstUpdate &&
            c.onRouteDate &&
            c.onRouteDate < today
          ) {
            newNotifications.push({
              id: uid(),
              userId: currentUser?.id ?? "",
              message: `Case ${c.caseId} (${c.customerName}) is On Route with no technician update — will auto-reset at midnight`,
              type: "stale_case",
              isRead: false,
              caseId: c.id,
              createdAt: now(),
            });
          }
        }

        if (newNotifications.length > 0) {
          set((s) => ({
            notifications: [...newNotifications, ...s.notifications],
            notificationsGenerated: true,
          }));
        } else {
          set({ notificationsGenerated: true });
        }
      },

      registerUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: uid(),
          status: "pending",
          createdAt: now(),
        };
        set((s) => ({ users: [...s.users, newUser] }));
      },

      approveUser: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: "approved" } : u,
          ),
        }));
      },

      rejectUser: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: "rejected" } : u,
          ),
        }));
      },

      updateUserRole: (userId, role) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)),
        }));
      },

      addCase: (caseData) => {
        const newCase: Case = {
          ...caseData,
          id: uid(),
          photos: [],
          createdAt: now(),
          updatedAt: now(),
          createdBy: get().currentUser?.id ?? "",
          closedAt: "",
          hasFirstUpdate: false,
          onRouteDate: "",
        };
        set((s) => ({ cases: [newCase, ...s.cases] }));
        get().addAuditEntry({
          caseId: newCase.id,
          userId: get().currentUser?.id ?? "",
          userName: get().currentUser?.name ?? "",
          action: "Case Created",
          details: `Case ${newCase.caseId} created. Status: New`,
        });
        return newCase;
      },

      updateCase: (id, updates) => {
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now() } : c,
          ),
        }));
      },

      deleteCase: (id) => {
        const c = get().cases.find((x) => x.id === id);
        if (!c) return;
        get().addAuditEntry({
          caseId: id,
          userId: get().currentUser?.id ?? "",
          userName: get().currentUser?.name ?? "",
          action: "Case Deleted",
          details: `Case ${c.caseId} deleted by admin`,
        });
        set((s) => ({ cases: s.cases.filter((x) => x.id !== id) }));
      },

      addAuditEntry: (entry) => {
        const newEntry: AuditEntry = { ...entry, id: uid(), timestamp: now() };
        set((s) => ({ auditLog: [newEntry, ...s.auditLog] }));
      },

      addTechnician: (t) => {
        set((s) => ({
          technicians: [
            ...s.technicians,
            { ...t, id: uid(), createdAt: now() },
          ],
        }));
      },

      updateTechnician: (id, updates) => {
        set((s) => ({
          technicians: s.technicians.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        }));
      },

      deleteTechnician: (id) => {
        set((s) => ({ technicians: s.technicians.filter((t) => t.id !== id) }));
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
        set((state) => ({ settings: { ...state.settings, ...s } }));
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
        if (!c) return;
        const oldStatus = c.status;
        const updates: Partial<Case> = { status: newStatus, updatedAt: now() };
        if (
          newStatus === "closed" ||
          newStatus === "adjustment_closed" ||
          newStatus === "replacement_done" ||
          newStatus === "gas_charge_done"
        ) {
          updates.closedAt = now();
        }
        // Track on_route date and first update flag
        if (newStatus === "on_route") {
          updates.onRouteDate = todayStr();
          updates.hasFirstUpdate = false;
        } else if (oldStatus === "on_route") {
          // Any status change away from on_route = first update received
          updates.hasFirstUpdate = true;
        }
        get().updateCase(caseId, updates);
        get().addAuditEntry({
          caseId,
          userId: get().currentUser?.id ?? "",
          userName: get().currentUser?.name ?? "",
          action: "Status Changed",
          details: `${oldStatus.replace(/_/g, " ")} → ${newStatus.replace(/_/g, " ")}${details ? `. ${details}` : ""}`,
        });
      },
    }),
    { name: "servicedesk-storage" },
  ),
);

export const getAgeing = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / 86400000);
};

export const STATUS_TRANSITIONS: Record<string, CaseStatus[]> = {
  new: ["printed", "cancelled"],
  printed: ["confirmed", "cancelled", "transferred"],
  confirmed: ["on_route", "pending", "cancelled", "transferred"],
  pending: ["confirmed", "cancelled"],
  on_route: [
    "closed",
    "adjustment_closed",
    "gas_charge_pending",
    "part_required",
    "rescheduled",
    "cancelled",
  ],
  gas_charge_pending: ["gas_charge_done"],
  gas_charge_done: ["closed"],
  part_required: ["part_ordered"],
  part_ordered: ["part_received"],
  part_received: ["re_open"],
  re_open: ["on_route"],
  rescheduled: ["on_route", "cancelled"],
  adjustment_closed: [],
  replacement_done: [],
  closed: [],
  cancelled: [],
  transferred: [],
};

export const photoTypeLabel: Record<PhotoType, string> = {
  product: "Product",
  serial: "Serial Number",
  invoice: "Invoice",
  before: "Before Work",
  after: "After Work",
  part: "Part",
};
