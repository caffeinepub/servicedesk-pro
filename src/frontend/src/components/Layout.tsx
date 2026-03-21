import {
  BarChart2,
  Bell,
  BookOpen,
  Boxes,
  Brain,
  Building2,
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

const MAIN_NAV: {
  icon: React.ElementType;
  label: string;
  page: PageType;
  adminOnly?: boolean;
  privilegedOnly?: boolean;
}[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: FileText, label: "All Cases", page: "cases" },
  { icon: PlusCircle, label: "New Case", page: "new-case" },
  { icon: Users, label: "Customer History", page: "customer-history" },
  { icon: Package, label: "Parts Tracking", page: "parts" },
  {
    icon: Package,
    label: "Part Requests",
    page: "part-requests",
    privilegedOnly: true,
  },
  { icon: Wrench, label: "Technicians", page: "technicians" },
  { icon: BarChart2, label: "Reports", page: "reports" },
  { icon: Bell, label: "Notifications", page: "notifications" },
  { icon: Settings, label: "Settings", page: "settings" },
  { icon: Shield, label: "Admin Panel", page: "admin", adminOnly: true },
  { icon: UserCircle, label: "My Profile", page: "profile" },
];

const INVENTORY_NAV: {
  icon: React.ElementType;
  label: string;
  page: PageType;
  adminOnly?: boolean;
}[] = [
  { icon: Boxes, label: "Inventory", page: "inventory" },
  { icon: ShoppingCart, label: "Purchase Entry", page: "purchase" },
  { icon: ClipboardList, label: "Issued Parts", page: "issued-parts" },
  { icon: Store, label: "Vendors", page: "vendors" },
  { icon: RotateCcw, label: "Return to Company", page: "return-to-company" },
  { icon: History, label: "Lifecycle", page: "lifecycle" },
  { icon: Brain, label: "AI Engine", page: "ai-engine" },
  { icon: Warehouse, label: "Warehouse", page: "warehouse" },
  { icon: BookOpen, label: "Masters", page: "masters", adminOnly: true },
];

const ALL_NAV = [...MAIN_NAV, ...INVENTORY_NAV];

function NavContent({
  collapsed,
  onNavigate,
}: { collapsed?: boolean; onNavigate?: () => void }) {
  const { currentUser, currentPage, navigate, partRequests } = useStore();
  const isAdmin = currentUser?.role === "admin";
  const isPrivileged =
    currentUser?.role === "admin" || currentUser?.role === "supervisor";
  const pendingPartRequests =
    partRequests?.filter((r) => r.status === "pending").length ?? 0;

  const visibleMainNav = MAIN_NAV.filter(
    (item) =>
      (!item.adminOnly || isAdmin) && (!item.privilegedOnly || isPrivileged),
  );

  return (
    <nav className="flex-1 overflow-y-auto py-2 min-h-0">
      {/* Cases section header */}
      <div className={`pt-1 pb-1 ${collapsed ? "px-3" : "px-4"}`}>
        {collapsed ? (
          <div className="border-t border-slate-700" />
        ) : (
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cases
          </span>
        )}
      </div>

      {visibleMainNav.map((item) => (
        <button
          key={item.page}
          type="button"
          onClick={() => {
            navigate(item.page);
            onNavigate?.();
          }}
          title={collapsed ? item.label : undefined}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            currentPage === item.page
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          } ${collapsed ? "justify-center" : ""}`}
          data-ocid="layout.link"
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed &&
            item.page === "part-requests" &&
            pendingPartRequests > 0 && (
              <span className="ml-auto text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                {pendingPartRequests}
              </span>
            )}
        </button>
      ))}

      {/* Inventory section - only for admin and supervisor */}
      {isPrivileged && (
        <>
          <div className={`pt-3 pb-1 ${collapsed ? "px-3" : "px-4"}`}>
            {collapsed ? (
              <div className="border-t border-slate-700" />
            ) : (
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inventory
              </span>
            )}
          </div>
          {INVENTORY_NAV.filter((item) => !item.adminOnly || isAdmin).map(
            (item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => {
                  navigate(item.page);
                  onNavigate?.();
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  currentPage === item.page
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                data-ocid="layout.link"
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            ),
          )}
        </>
      )}
    </nav>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, currentPage, navigate, logout } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const pageTitle =
    ALL_NAV.find((i) => i.page === currentPage)?.label ?? "ServiceDesk Pro";

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
            className={`flex items-center gap-3 px-4 py-4 border-b border-slate-700 flex-shrink-0 ${collapsed ? "justify-center" : ""}`}
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

          {/* Nav - scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <NavContent collapsed={collapsed} />
          </div>

          {/* Collapse + User Footer */}
          <div className="border-t border-slate-700 p-3 flex-shrink-0">
            {!collapsed && (
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
              className={`flex gap-2 ${collapsed ? "justify-center flex-col items-center" : ""}`}
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
