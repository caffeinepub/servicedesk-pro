import {
  BarChart2,
  Bell,
  BookOpen,
  Boxes,
  Brain,
  ChevronLeft,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  RotateCcw,
  Send,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  UserCircle,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useStore } from "../store";
import type { PageType } from "../types";
import NotificationPanel from "./NotificationPanel";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

// ─── Nav item type ────────────────────────────────────────────────────────────
type NavItem = {
  icon: React.ElementType;
  label: string;
  page: PageType;
};

// ─── CASES section items (admin + backend_user) ───────────────────────────────
const CASES_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: FileText, label: "All Cases", page: "cases" },
  { icon: PlusCircle, label: "New Case", page: "new-case" },
  { icon: Users, label: "Customer History", page: "customer-history" },
  { icon: Package, label: "Parts Tracking", page: "parts" },
  { icon: Send, label: "Part Requests", page: "part-requests" },
];

// ─── INVENTORY section items (admin + supervisor) ─────────────────────────────
const INVENTORY_NAV: NavItem[] = [
  { icon: Boxes, label: "Inventory", page: "inventory" },
  { icon: ShoppingCart, label: "Purchase Entry", page: "purchase" },
  { icon: ClipboardList, label: "Issued Parts", page: "issued-parts" },
  { icon: Store, label: "Vendors", page: "vendors" },
  { icon: RotateCcw, label: "Return to Company", page: "return-to-company" },
  { icon: History, label: "Lifecycle", page: "lifecycle" },
  { icon: Brain, label: "AI Engine", page: "ai-engine" },
  { icon: Warehouse, label: "Warehouse", page: "warehouse" },
  { icon: Wrench, label: "Technicians", page: "technicians" },
  { icon: BarChart2, label: "Reports", page: "reports" },
];

// ─── ADMIN section items (admin only) ────────────────────────────────────────
const ADMIN_NAV: NavItem[] = [
  { icon: Shield, label: "Admin Panel", page: "admin" },
  { icon: BookOpen, label: "Masters", page: "masters" },
  { icon: Settings, label: "Settings", page: "settings" },
];

// ─── SHARED bottom items (all roles) ─────────────────────────────────────────
const SHARED_NAV: NavItem[] = [
  { icon: Bell, label: "Notifications", page: "notifications" },
  { icon: UserCircle, label: "My Profile", page: "profile" },
];

// All pages for title lookup
const ALL_PAGES: NavItem[] = [
  ...CASES_NAV,
  ...INVENTORY_NAV,
  ...ADMIN_NAV,
  ...SHARED_NAV,
];

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  label,
  collapsed,
}: { label: string; collapsed?: boolean }) {
  return (
    <div className={`pt-3 pb-1 ${collapsed ? "px-3" : "px-4"}`}>
      {collapsed ? (
        <div className="border-t border-slate-700" />
      ) : (
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}

// ─── Nav button ───────────────────────────────────────────────────────────────
function NavButton({
  item,
  collapsed,
  currentPage,
  badge,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  currentPage: PageType;
  badge?: number;
  onNavigate?: () => void;
}) {
  const { navigate } = useStore();
  const active = currentPage === item.page;
  return (
    <button
      key={item.page}
      type="button"
      onClick={() => {
        navigate(item.page);
        onNavigate?.();
      }}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}
      data-ocid="layout.link"
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="ml-auto text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── NavContent ───────────────────────────────────────────────────────────────
function NavContent({
  collapsed,
  onNavigate,
}: { collapsed?: boolean; onNavigate?: () => void }) {
  const { currentUser, currentPage, partRequests } = useStore();

  const role = currentUser?.role;
  const isAdmin = role === "admin";
  const isSupervisor = role === "supervisor";
  const isBackendUser = !isAdmin && !isSupervisor;

  const pendingAll =
    partRequests?.filter((r) => r.status === "pending").length ?? 0;
  const pendingMine =
    partRequests?.filter(
      (r) => r.status === "pending" && r.requestedBy === currentUser?.id,
    ).length ?? 0;

  const partRequestBadge = isBackendUser ? pendingMine : pendingAll;

  return (
    <nav className="flex-1 overflow-y-auto py-2 min-h-0">
      {/* ── CASES section: admin + backend_user ── */}
      {(isAdmin || isBackendUser) && (
        <>
          <SectionHeader label="Cases" collapsed={collapsed} />
          {CASES_NAV.map((item) => (
            <NavButton
              key={item.page}
              item={item}
              collapsed={collapsed}
              currentPage={currentPage}
              badge={
                item.page === "part-requests" ? partRequestBadge : undefined
              }
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}

      {/* ── INVENTORY section: admin + supervisor ── */}
      {(isAdmin || isSupervisor) && (
        <>
          <SectionHeader label="Inventory" collapsed={collapsed} />
          {INVENTORY_NAV.map((item) => (
            <NavButton
              key={item.page}
              item={item}
              collapsed={collapsed}
              currentPage={currentPage}
              onNavigate={onNavigate}
            />
          ))}
          {/* Part Requests for supervisor (admin sees it under CASES) */}
          {isSupervisor && (
            <NavButton
              item={{
                icon: Send,
                label: "Part Requests",
                page: "part-requests",
              }}
              collapsed={collapsed}
              currentPage={currentPage}
              badge={partRequestBadge}
              onNavigate={onNavigate}
            />
          )}
        </>
      )}

      {/* ── ADMIN section: admin only ── */}
      {isAdmin && (
        <>
          <SectionHeader label="Admin" collapsed={collapsed} />
          {ADMIN_NAV.map((item) => (
            <NavButton
              key={item.page}
              item={item}
              collapsed={collapsed}
              currentPage={currentPage}
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}

      {/* ── SHARED items: all roles ── */}
      <SectionHeader label="" collapsed={collapsed} />
      {SHARED_NAV.map((item) => (
        <NavButton
          key={item.page}
          item={item}
          collapsed={collapsed}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, currentPage, navigate, logout } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const pageTitle =
    ALL_PAGES.find((i) => i.page === currentPage)?.label ?? "ServiceDesk Pro";

  const UserFooter = ({ showName = true }: { showName?: boolean }) => (
    <div className="border-t border-slate-700 p-3 flex-shrink-0">
      {showName && !collapsed && (
        <div className="flex items-center gap-2 px-1 py-2 mb-2">
          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {currentUser?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {currentUser?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      )}
      <div
        className={`flex gap-2 ${
          collapsed ? "justify-center flex-col items-center" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center gap-1 p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={logout}
          title="Logout"
          className="flex items-center gap-1 p-2 rounded hover:bg-red-900 text-slate-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-xs">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className="flex flex-col h-full bg-slate-900 text-white transition-all duration-300 flex-shrink-0 overflow-hidden"
          style={{ width: collapsed ? "4rem" : "15rem" }}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-4 py-4 border-b border-slate-700 flex-shrink-0 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-sm text-white truncate">
                ServiceDesk Pro
              </span>
            )}
          </div>

          {/* Scrollable nav */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <NavContent collapsed={collapsed} />
          </div>

          <UserFooter />
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          {isMobile && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  data-ocid="layout.open_modal_button"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-slate-900">
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700 flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-sm text-white">
                      ServiceDesk Pro
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <NavContent onNavigate={() => setMobileOpen(false)} />
                  </div>
                  <div className="border-t border-slate-700 p-3 flex-shrink-0">
                    <div className="flex items-center gap-2 px-1 py-2 mb-2">
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {currentUser?.name?.[0] ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {currentUser?.name}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {currentUser?.role?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 w-full p-2 rounded hover:bg-red-900 text-slate-400 hover:text-red-300 transition-colors text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900">{pageTitle}</h1>
            {!isMobile && (
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            )}
          </div>
          <NotificationPanel />
          <button
            type="button"
            onClick={() => navigate("profile")}
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 hover:bg-blue-700 transition-colors"
            title="My Profile"
            data-ocid="layout.link"
          >
            {currentUser?.name?.[0] ?? "U"}
          </button>
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
