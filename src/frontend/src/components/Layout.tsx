import {
  Activity,
  AlertTriangle,
  ArrowRightCircle,
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  RotateCcw,
  Search,
  Settings,
  Settings2,
  Shield,
  ShoppingCart,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  UserCircle,
  Users,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useStore } from "../store";
import type { PageType } from "../types";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

type NavItem = {
  icon: React.ElementType;
  label: string;
  page: PageType;
  badge?: number;
};

const CASES_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: FileText, label: "All Cases", page: "cases" },
  { icon: Briefcase, label: "New Case", page: "new-case" },
  { icon: Users, label: "Customer History", page: "customer-history" },
  { icon: Wrench, label: "Parts Tracking", page: "parts" },
  { icon: ClipboardList, label: "Part Requests", page: "part-requests" },
];

const INVENTORY_NAV: NavItem[] = [
  { icon: Package, label: "Inventory", page: "inventory" },
  { icon: ShoppingCart, label: "Purchase Entry", page: "purchase" },
  { icon: ArrowRightCircle, label: "Issued Parts", page: "issued-parts" },
  { icon: Store, label: "Vendors", page: "vendors" },
  { icon: RotateCcw, label: "Return to Company", page: "return-to-company" },
  { icon: GitBranch, label: "Lifecycle", page: "lifecycle" },
  { icon: Brain, label: "AI Engine", page: "ai-engine" },
  { icon: Warehouse, label: "Warehouse", page: "warehouse" },
  { icon: Users, label: "Technicians", page: "technicians" },
  { icon: BarChart3, label: "Reports", page: "reports" },
];

const ADMIN_NAV: NavItem[] = [
  { icon: Settings2, label: "Admin Panel", page: "admin" },
  { icon: Layers, label: "Masters", page: "masters" },
  { icon: ClipboardCheck, label: "Audit Logs", page: "audit-logs" },
  { icon: Megaphone, label: "Notices", page: "notices" },
  { icon: Trash2, label: "Data Management", page: "data-management" },
  { icon: Settings, label: "Settings", page: "settings" },
];

// ── Section config ─────────────────────────────────────────────────────────
const SECTION_COLORS = {
  CASES: {
    accent: "text-blue-400",
    activeBg: "bg-gradient-to-r from-blue-600/30 to-blue-500/20",
    activeText: "text-blue-300",
    activeBorder: "border-l-2 border-blue-400",
    hoverBg: "hover:bg-blue-500/10",
    headerColor: "text-blue-400",
  },
  INVENTORY: {
    accent: "text-emerald-400",
    activeBg: "bg-gradient-to-r from-emerald-600/30 to-emerald-500/20",
    activeText: "text-emerald-300",
    activeBorder: "border-l-2 border-emerald-400",
    hoverBg: "hover:bg-emerald-500/10",
    headerColor: "text-emerald-400",
  },
  ADMIN: {
    accent: "text-violet-400",
    activeBg: "bg-gradient-to-r from-violet-600/30 to-violet-500/20",
    activeText: "text-violet-300",
    activeBorder: "border-l-2 border-violet-400",
    hoverBg: "hover:bg-violet-500/10",
    headerColor: "text-violet-400",
  },
};

// ── InlineSearch ─────────────────────────────────────────────────────────────
function InlineSearch() {
  const {
    stockCompanies,
    stockCategories,
    stockPartNames,
    vendors,
    partItems,
    navigate,
  } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = query.toLowerCase().trim();

  type SearchResult = {
    type: "part" | "vendor" | "company" | "category" | "partname";
    label: string;
    sub: string;
    status?: string;
    partCode?: string;
    page: PageType;
  };

  const results: SearchResult[] = [];

  if (q.length >= 1) {
    const uniqueCodes = [...new Set(partItems.map((p) => p.partCode))];
    for (const code of uniqueCodes) {
      if (!code.toLowerCase().includes(q)) continue;
      const item = partItems.find((p) => p.partCode === code);
      if (!item) continue;
      const co =
        stockCompanies.find((c) => c.id === item.companyId)?.name ?? "";
      const pn =
        stockPartNames.find((p) => p.id === item.partNameId)?.name ?? "";
      const statusLabel =
        item.status === "in_stock"
          ? "In Warehouse"
          : item.status === "issued"
            ? "Issued"
            : item.status === "installed"
              ? "Installed"
              : item.status === "returned_to_company"
                ? "Returned to Company"
                : "Returned to Store";
      results.push({
        type: "part",
        label: code,
        sub: `${co} › ${pn}`,
        status: statusLabel,
        partCode: code,
        page: "part-detail",
      });
      if (results.filter((r) => r.type === "part").length >= 5) break;
    }
    for (const v of vendors) {
      if (v.name.toLowerCase().includes(q) || v.phone.includes(q)) {
        results.push({
          type: "vendor",
          label: v.name,
          sub: v.phone,
          page: "vendors",
        });
        if (results.filter((r) => r.type === "vendor").length >= 3) break;
      }
    }
    for (const c of stockCompanies) {
      if (c.name.toLowerCase().includes(q)) {
        results.push({
          type: "company",
          label: c.name,
          sub: "Company",
          page: "masters",
        });
      }
    }
    for (const c of stockCategories) {
      if (c.name.toLowerCase().includes(q)) {
        results.push({
          type: "category",
          label: c.name,
          sub: "Category",
          page: "masters",
        });
      }
    }
    for (const p of stockPartNames) {
      if (p.name.toLowerCase().includes(q)) {
        results.push({
          type: "partname",
          label: p.name,
          sub: "Part Name",
          page: "masters",
        });
      }
    }
  }

  const handleSelect = (r: SearchResult) => {
    if (r.type === "part" && r.partCode) {
      navigate("part-detail", undefined, r.partCode);
    } else {
      navigate(r.page);
    }
    setQuery("");
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      handleSelect(results[selectedIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  const typeIcon: Record<string, string> = {
    part: "🔧",
    vendor: "🏪",
    company: "🏢",
    category: "🗂️",
    partname: "🔩",
  };

  const statusColor: Record<string, string> = {
    "In Warehouse": "bg-emerald-100 text-emerald-700",
    Issued: "bg-amber-100 text-amber-700",
    Installed: "bg-blue-100 text-blue-700",
    "Returned to Company": "bg-red-100 text-red-700",
    "Returned to Store": "bg-slate-100 text-slate-600",
  };

  const grouped: Record<string, SearchResult[]> = {};
  for (const r of results) {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  }

  const groupLabels: Record<string, string> = {
    part: "Parts",
    vendor: "Vendors",
    company: "Companies",
    category: "Categories",
    partname: "Part Names",
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg px-3 py-1.5 text-sm transition-colors">
        <Search className="h-4 w-4 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIdx(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search..."
          className="bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm w-36 md:w-48"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden md:inline text-xs bg-white text-slate-400 border border-slate-300 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        )}
      </div>

      {open && query.length >= 1 && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {results.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No results for "{query}"
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    {groupLabels[type]}
                  </div>
                  {items.map((r) => {
                    const globalIdx = results.indexOf(r);
                    return (
                      <button
                        type="button"
                        key={`${r.type}-${r.label}`}
                        onClick={() => handleSelect(r)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          globalIdx === selectedIdx
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-lg">{typeIcon[r.type]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 text-sm">
                            {r.label}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {r.sub}
                          </div>
                        </div>
                        {r.status && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[r.status] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {r.status}
                          </span>
                        )}
                        <span className="text-slate-300 text-xs">↵</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>Esc close</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NoticeBanner ─────────────────────────────────────────────────────────────
const NOTICE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  amber: {
    bg: "bg-gradient-to-r from-amber-500 to-orange-500",
    text: "text-white",
    border: "",
  },
  blue: {
    bg: "bg-gradient-to-r from-blue-600 to-blue-500",
    text: "text-white",
    border: "",
  },
  rose: {
    bg: "bg-gradient-to-r from-rose-600 to-pink-600",
    text: "text-white",
    border: "",
  },
  emerald: {
    bg: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
    border: "",
  },
  purple: {
    bg: "bg-gradient-to-r from-violet-600 to-purple-600",
    text: "text-white",
    border: "",
  },
  orange: {
    bg: "bg-gradient-to-r from-orange-500 to-amber-600",
    text: "text-white",
    border: "",
  },
};

function NoticeBanner() {
  const { adminNotices } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);

  const now = new Date();
  const active = adminNotices.filter(
    (n) => n.isActive && (!n.expiryDate || new Date(n.expiryDate) > now),
  );

  if (active.length === 0) return null;
  const notice = active[Math.min(currentIdx, active.length - 1)];

  const colorKey = notice.color ?? "amber";
  const colors = NOTICE_COLORS[colorKey] ?? NOTICE_COLORS.amber;
  const direction = notice.direction ?? "rtl";
  const speedMap = { slow: "30s", normal: "18s", fast: "10s" };
  const duration = speedMap[notice.speed ?? "normal"];

  const marqueeStyle: React.CSSProperties = {
    display: "inline-block",
    animation: `marquee-${direction} ${duration} linear infinite`,
    whiteSpace: "nowrap",
    paddingLeft: direction === "rtl" ? "100%" : "0",
  };

  return (
    <>
      <style>{`
        @keyframes marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-ltr {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div
        className={`${colors.bg} ${colors.text} px-4 py-2 flex items-center gap-3 relative z-40 overflow-hidden`}
      >
        <Megaphone className="h-4 w-4 flex-shrink-0" />
        <span className="font-semibold text-sm flex-shrink-0">
          {notice.title}:
        </span>
        <div className="flex-1 overflow-hidden">
          <span style={marqueeStyle} className="text-sm">
            {notice.message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{notice.message}
          </span>
        </div>
        {active.length > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="hover:bg-white/20 rounded p-0.5"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-xs">
              {Math.min(currentIdx, active.length - 1) + 1} of {active.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentIdx((i) => Math.min(active.length - 1, i + 1))
              }
              className="hover:bg-white/20 rounded p-0.5"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── NavButton ─────────────────────────────────────────────────────────────────
function NavButton({
  item,
  collapsed,
  currentPage,
  badge,
  section,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  currentPage: PageType;
  badge?: number;
  section: "CASES" | "INVENTORY" | "ADMIN";
  onNavigate?: () => void;
}) {
  const { navigate } = useStore();
  const colors = SECTION_COLORS[section];
  const isActive = currentPage === item.page;

  return (
    <button
      type="button"
      onClick={() => {
        navigate(item.page);
        onNavigate?.();
      }}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
      } ${
        isActive
          ? `${colors.activeBg} ${colors.activeText} ${colors.activeBorder} shadow-sm`
          : `text-slate-400 ${colors.hoverBg} hover:text-white border-l-2 border-transparent`
      }`}
    >
      <item.icon
        className={`flex-shrink-0 h-4 w-4 ${isActive ? colors.activeText : ""}`}
      />
      {!collapsed && (
        <span className="flex-1 text-left truncate">{item.label}</span>
      )}
      {!collapsed && badge && badge > 0 ? (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {badge}
        </span>
      ) : null}
      {collapsed && badge && badge > 0 ? (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({
  label,
  collapsed,
  Icon,
  section,
}: {
  label: string;
  collapsed?: boolean;
  Icon: React.ElementType;
  section: "CASES" | "INVENTORY" | "ADMIN";
}) {
  const colors = SECTION_COLORS[section];
  return (
    <div
      className={`flex items-center gap-2 pt-4 pb-1.5 ${collapsed ? "px-2 justify-center" : "px-3"}`}
    >
      {collapsed ? (
        <Icon className={`h-3.5 w-3.5 ${colors.headerColor}`} />
      ) : (
        <>
          <Icon className={`h-3.5 w-3.5 ${colors.headerColor}`} />
          <span
            className={`text-[10px] font-bold ${colors.headerColor} uppercase tracking-widest`}
          >
            {label}
          </span>
        </>
      )}
    </div>
  );
}

// ── Sidebar content ────────────────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  onNavigate,
  setCollapsed,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentUser, currentPage, notifications, logout } = useStore();
  const role = currentUser?.role ?? "backend_user";
  const unread = notifications.filter((n) => !n.isRead).length;

  const initials = (currentUser?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    supervisor: "Supervisor",
    backend_user: "Backend User",
  };
  const roleColor: Record<string, string> = {
    admin: "bg-violet-500/20 text-violet-300",
    supervisor: "bg-emerald-500/20 text-emerald-300",
    backend_user: "bg-blue-500/20 text-blue-300",
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Logo area */}
      <div
        className={`flex items-center gap-3 border-b border-slate-800 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"}`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Tag className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm text-white leading-tight">
              Servicedesk Pro
            </div>
            <div className="text-[10px] text-slate-400">v37.0</div>
          </div>
        )}
      </div>

      {/* Collapse toggle - TOP */}
      {setCollapsed && (
        <div
          className={`flex ${collapsed ? "justify-center px-3" : "justify-end px-3"} py-2 border-b border-slate-800/50`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c: boolean) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-full transition-all duration-200 text-xs font-medium"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin">
        {/* CASES section */}
        {(role === "admin" || role === "backend_user") && (
          <>
            <SectionHeader
              label="Cases"
              collapsed={collapsed}
              Icon={Briefcase}
              section="CASES"
            />
            {CASES_NAV.map((item) => (
              <NavButton
                key={item.page}
                item={item}
                collapsed={collapsed}
                currentPage={currentPage}
                section="CASES"
                onNavigate={onNavigate}
              />
            ))}
          </>
        )}

        {/* INVENTORY section */}
        {(role === "admin" || role === "supervisor") && (
          <>
            <SectionHeader
              label="Inventory"
              collapsed={collapsed}
              Icon={Package}
              section="INVENTORY"
            />
            {role === "supervisor" && (
              <NavButton
                item={{
                  icon: ClipboardList,
                  label: "Part Requests",
                  page: "part-requests",
                }}
                collapsed={collapsed}
                currentPage={currentPage}
                section="INVENTORY"
                onNavigate={onNavigate}
              />
            )}
            {INVENTORY_NAV.map((item) => (
              <NavButton
                key={item.page + item.label}
                item={item}
                collapsed={collapsed}
                currentPage={currentPage}
                section="INVENTORY"
                onNavigate={onNavigate}
              />
            ))}
          </>
        )}

        {/* ADMIN section */}
        {role === "admin" && (
          <>
            <SectionHeader
              label="Admin"
              collapsed={collapsed}
              Icon={Shield}
              section="ADMIN"
            />
            {ADMIN_NAV.map((item) => (
              <NavButton
                key={item.page}
                item={item}
                collapsed={collapsed}
                currentPage={currentPage}
                section="ADMIN"
                onNavigate={onNavigate}
              />
            ))}
          </>
        )}

        {/* Notifications & Profile */}
        <div className={`pt-3 pb-1 ${collapsed ? "px-2" : "px-3"}`}>
          <div className="border-t border-slate-800" />
        </div>
        <NavButton
          item={{ icon: Bell, label: "Notifications", page: "notifications" }}
          collapsed={collapsed}
          currentPage={currentPage}
          badge={unread}
          section="CASES"
          onNavigate={onNavigate}
        />
        <NavButton
          item={{ icon: UserCircle, label: "My Profile", page: "profile" }}
          collapsed={collapsed}
          currentPage={currentPage}
          section="CASES"
          onNavigate={onNavigate}
        />
      </div>

      {/* User profile area */}
      <div className={`border-t border-slate-800 ${collapsed ? "p-2" : "p-3"}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {currentUser?.name}
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColor[role]}`}
              >
                {roleLabel[role]}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section Pill ─────────────────────────────────────────────────────────────
const PAGE_SECTION: Record<
  string,
  { label: string; icon: React.ElementType; gradient: string; text: string }
> = {
  dashboard: {
    label: "Dashboard",
    icon: LayoutDashboard,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  cases: {
    label: "Cases",
    icon: FileText,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  "new-case": {
    label: "New Case",
    icon: Briefcase,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  "case-detail": {
    label: "Case Details",
    icon: FileText,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  "customer-history": {
    label: "Customer History",
    icon: Users,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  parts: {
    label: "Parts Tracking",
    icon: Wrench,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  "part-requests": {
    label: "Part Requests",
    icon: ClipboardList,
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    text: "text-white",
  },
  inventory: {
    label: "Inventory",
    icon: Package,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  purchase: {
    label: "Purchase Entry",
    icon: ShoppingCart,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  "issued-parts": {
    label: "Issued Parts",
    icon: ArrowRightCircle,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  vendors: {
    label: "Vendors",
    icon: Store,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  "return-to-company": {
    label: "Return to Company",
    icon: RotateCcw,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  lifecycle: {
    label: "Lifecycle",
    icon: GitBranch,
    gradient: "bg-gradient-to-r from-indigo-600 to-purple-600",
    text: "text-white",
  },
  "ai-engine": {
    label: "AI Engine",
    icon: Brain,
    gradient: "bg-gradient-to-r from-violet-600 to-purple-700",
    text: "text-white",
  },
  warehouse: {
    label: "Warehouse",
    icon: Warehouse,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  technicians: {
    label: "Technicians",
    icon: Users,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  reports: {
    label: "Reports",
    icon: BarChart3,
    gradient: "bg-gradient-to-r from-blue-600 to-cyan-600",
    text: "text-white",
  },
  notifications: {
    label: "Notifications",
    icon: Bell,
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    text: "text-white",
  },
  masters: {
    label: "Masters",
    icon: Layers,
    gradient: "bg-gradient-to-r from-teal-600 to-emerald-600",
    text: "text-white",
  },
  admin: {
    label: "Admin Panel",
    icon: Settings2,
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600",
    text: "text-white",
  },
  settings: {
    label: "Settings",
    icon: Settings,
    gradient: "bg-gradient-to-r from-slate-600 to-slate-700",
    text: "text-white",
  },
  profile: {
    label: "My Profile",
    icon: UserCircle,
    gradient: "bg-gradient-to-r from-slate-600 to-slate-700",
    text: "text-white",
  },
  "part-detail": {
    label: "Part Detail",
    icon: Package,
    gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    text: "text-white",
  },
  "audit-logs": {
    label: "Audit Logs",
    icon: ClipboardCheck,
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600",
    text: "text-white",
  },
  notices: {
    label: "Notices",
    icon: Megaphone,
    gradient: "bg-gradient-to-r from-rose-600 to-pink-600",
    text: "text-white",
  },
  "data-management": {
    label: "Data Management",
    icon: Trash2,
    gradient: "bg-gradient-to-r from-red-600 to-rose-700",
    text: "text-white",
  },
};

function SectionPill({ page }: { page: string }) {
  const info = PAGE_SECTION[page] ?? {
    label: page,
    icon: Activity,
    gradient: "bg-gradient-to-r from-slate-600 to-slate-700",
    text: "text-white",
  };
  const Icon = info.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${info.gradient} ${info.text} text-xs font-bold px-3 py-1.5 rounded-full shadow-sm`}
    >
      <Icon className="h-3 w-3" />
      {info.label}
    </span>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, notifications, navigate } = useStore();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const unread = notifications.filter((n) => !n.isRead).length;

  const currentPageStr = useStore.getState().currentPage as string;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <NoticeBanner />
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-0">
              <SidebarContent onNavigate={() => {}} />
            </SheetContent>
          </Sheet>
          <SectionPill page={currentPageStr} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("notifications")}
              className="p-1.5 rounded-lg hover:bg-white/10 relative"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-60"} overflow-hidden`}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <NoticeBanner />
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <SectionPill page={currentPageStr} />
          </div>
          <div className="flex items-center gap-3">
            <InlineSearch />
            {/* Bell */}
            <button
              type="button"
              onClick={() => navigate("notifications")}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("profile")}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                {(currentUser?.name ?? "U")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">
                {currentUser?.name}
              </span>
            </button>
          </div>
        </header>

        {/* Page content with padding */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
