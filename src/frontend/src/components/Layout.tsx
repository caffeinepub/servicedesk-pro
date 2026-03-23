import {
  Activity,
  AlertTriangle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeftRight,
  ArrowRightCircle,
  BarChart2,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FlaskConical,
  FolderOpen,
  GitBranch,
  Layers,
  LayoutDashboard,
  LineChart,
  LogOut,
  Megaphone,
  Menu,
  Package,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  ScrollText,
  Search,
  Settings,
  Settings2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  UserCircle,
  Users,
  Warehouse,
  Wrench,
  X,
  Zap,
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

type SubGroup = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
};

type SectionDef = {
  key: string;
  label: string;
  icon: React.ElementType;
  section: "CASES" | "INVENTORY" | "ADMIN";
  subGroups: SubGroup[];
  roles: string[];
};

// ── Section colors ──────────────────────────────────────────────────────────
const SECTION_COLORS = {
  CASES: {
    accent: "text-blue-400",
    activeBg: "bg-gradient-to-r from-blue-600/30 to-blue-500/20",
    activeText: "text-blue-300",
    activeBorder: "border-l-2 border-blue-400",
    hoverBg: "hover:bg-blue-500/10",
    headerColor: "text-blue-400",
    headerBg: "bg-blue-500/10",
    subHeaderBg: "bg-blue-500/5",
    subHeaderText: "text-blue-300",
    chevronColor: "text-blue-400",
  },
  INVENTORY: {
    accent: "text-emerald-400",
    activeBg: "bg-gradient-to-r from-emerald-600/30 to-emerald-500/20",
    activeText: "text-emerald-300",
    activeBorder: "border-l-2 border-emerald-400",
    hoverBg: "hover:bg-emerald-500/10",
    headerColor: "text-emerald-400",
    headerBg: "bg-emerald-500/10",
    subHeaderBg: "bg-emerald-500/5",
    subHeaderText: "text-emerald-300",
    chevronColor: "text-emerald-400",
  },
  ADMIN: {
    accent: "text-violet-400",
    activeBg: "bg-gradient-to-r from-violet-600/30 to-violet-500/20",
    activeText: "text-violet-300",
    activeBorder: "border-l-2 border-violet-400",
    hoverBg: "hover:bg-violet-500/10",
    headerColor: "text-violet-400",
    headerBg: "bg-violet-500/10",
    subHeaderBg: "bg-violet-500/5",
    subHeaderText: "text-violet-300",
    chevronColor: "text-violet-400",
  },
  DASHBOARD: {
    accent: "text-indigo-400",
    activeBg: "bg-gradient-to-r from-indigo-600/30 to-indigo-500/20",
    activeText: "text-indigo-300",
    activeBorder: "border-l-2 border-indigo-400",
    hoverBg: "hover:bg-indigo-500/10",
    headerColor: "text-indigo-400",
    headerBg: "",
    subHeaderBg: "",
    subHeaderText: "",
    chevronColor: "text-indigo-400",
  },
};

// ── Nav sections definition ─────────────────────────────────────────────────
// CASES for backend_user (includes Part Requests + Insights/Reports)
const CASES_SECTIONS_BACKEND_USER: SectionDef = {
  key: "CASES",
  label: "Cases",
  icon: FolderOpen,
  section: "CASES",
  roles: ["backend_user"],
  subGroups: [
    {
      label: "Case Management",
      icon: Briefcase,
      items: [
        { icon: FileText, label: "All Cases", page: "cases" },
        { icon: Briefcase, label: "New Case", page: "new-case" },
        { icon: Users, label: "Customer History", page: "customer-history" },
      ],
    },
    {
      label: "Tracking",
      icon: ClipboardList,
      items: [
        { icon: Wrench, label: "Parts Tracking", page: "parts" },
        { icon: ClipboardList, label: "Part Requests", page: "part-requests" },
      ],
    },
    {
      label: "Insights",
      icon: BarChart3,
      items: [{ icon: BarChart3, label: "Reports", page: "reports" }],
    },
  ],
};

// CASES for admin (no Part Requests, no Insights sub-group — those are standalone at top)
const CASES_SECTIONS_ADMIN: SectionDef = {
  key: "CASES",
  label: "Cases",
  icon: FolderOpen,
  section: "CASES",
  roles: ["admin"],
  subGroups: [
    {
      label: "Case Management",
      icon: Briefcase,
      items: [
        { icon: FileText, label: "All Cases", page: "cases" },
        { icon: Briefcase, label: "New Case", page: "new-case" },
        { icon: Users, label: "Customer History", page: "customer-history" },
      ],
    },
    {
      label: "Tracking",
      icon: ClipboardList,
      items: [{ icon: Wrench, label: "Parts Tracking", page: "parts" }],
    },
  ],
};

// INVENTORY for admin (no Part Requests in Operations, no Masters & Config sub-group)
const INVENTORY_SECTIONS_ADMIN: SectionDef = {
  key: "INVENTORY",
  label: "Inventory",
  icon: Package,
  section: "INVENTORY",
  roles: ["admin"],
  subGroups: [
    {
      label: "Stock Management",
      icon: Boxes,
      items: [
        { icon: Warehouse, label: "Warehouse", page: "warehouse" },
        { icon: Package, label: "Inventory", page: "inventory" },
        { icon: ShoppingCart, label: "Purchase Entry", page: "purchase" },
      ],
    },
    {
      label: "Operations",
      icon: ArrowLeftRight,
      items: [
        { icon: ArrowRightCircle, label: "Issued Parts", page: "issued-parts" },
        {
          icon: RotateCcw,
          label: "Return to Company",
          page: "return-to-company",
        },
      ],
    },
  ],
};

// INVENTORY for supervisor (with Part Requests in Operations, with Insights/Reports sub-group)
const INVENTORY_SECTIONS_SUPERVISOR: SectionDef = {
  key: "INVENTORY",
  label: "Inventory",
  icon: Package,
  section: "INVENTORY",
  roles: ["supervisor"],
  subGroups: [
    {
      label: "Stock Management",
      icon: Boxes,
      items: [
        { icon: Warehouse, label: "Warehouse", page: "warehouse" },
        { icon: Package, label: "Inventory", page: "inventory" },
        { icon: ShoppingCart, label: "Purchase Entry", page: "purchase" },
      ],
    },
    {
      label: "Operations",
      icon: ArrowLeftRight,
      items: [
        { icon: ArrowRightCircle, label: "Issued Parts", page: "issued-parts" },
        {
          icon: RotateCcw,
          label: "Return to Company",
          page: "return-to-company",
        },
        { icon: ClipboardList, label: "Part Requests", page: "part-requests" },
      ],
    },
    {
      label: "Insights",
      icon: BarChart3,
      items: [{ icon: BarChart2, label: "Reports", page: "reports" }],
    },
  ],
};

const ADMIN_SECTIONS: SectionDef = {
  key: "ADMIN",
  label: "Admin",
  icon: Shield,
  section: "ADMIN",
  roles: ["admin"],
  subGroups: [
    {
      label: "Analytics",
      icon: LineChart,
      items: [
        { icon: Brain, label: "AI Engine", page: "ai-engine" },
        { icon: ScrollText, label: "Audit Logs", page: "audit-logs" },
      ],
    },
    {
      label: "Inventory Control",
      icon: PackageSearch,
      items: [
        { icon: GitBranch, label: "Lifecycle", page: "lifecycle" },
        { icon: Store, label: "Vendors", page: "vendors" },
        { icon: Users, label: "Technicians", page: "technicians" },
        { icon: Layers, label: "Masters", page: "masters" },
      ],
    },
    {
      label: "Administration",
      icon: SlidersHorizontal,
      items: [
        { icon: Settings2, label: "Admin Panel", page: "admin" },
        { icon: Megaphone, label: "Notices", page: "notices" },
        { icon: Trash2, label: "Data Management", page: "data-management" },
        { icon: Settings, label: "Settings", page: "settings" },
      ],
    },
  ],
};

const DASHBOARD_NAV: NavItem = {
  icon: LayoutDashboard,
  label: "Dashboard",
  page: "dashboard",
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
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              statusColor[r.status] ??
                              "bg-slate-100 text-slate-600"
                            }`}
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
  teal: {
    bg: "bg-gradient-to-r from-teal-500 to-cyan-600",
    text: "text-white",
    border: "",
  },
  dark: {
    bg: "bg-gradient-to-r from-slate-800 to-slate-900",
    text: "text-white",
    border: "",
  },
  rainbow: { bg: "notice-rainbow-animated", text: "text-white", border: "" },
};

function NoticeBanner() {
  const { adminNotices, currentUser } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);

  const now = new Date();
  const active = adminNotices.filter((n) => {
    if (!n.isActive) return false;
    if (n.expiryDate && new Date(n.expiryDate) < now) return false;
    if ((n as any).startDate && new Date((n as any).startDate) > now)
      return false;
    const visibleTo = (n as any).visibleTo;
    if (!visibleTo || visibleTo === "all") return true;
    if (visibleTo === "supervisor" && currentUser?.role === "supervisor") {
      const names: string[] = (n as any).visibleToNames ?? [];
      if (names.length === 0) return true;
      return names.includes(currentUser.name);
    }
    if (visibleTo === "backend_user" && currentUser?.role === "backend_user") {
      const names: string[] = (n as any).visibleToNames ?? [];
      if (names.length === 0) return true;
      return names.includes(currentUser.name);
    }
    return false;
  });

  if (active.length === 0) return null;
  const notice = active[Math.min(currentIdx, active.length - 1)];

  const colorKey = notice.color ?? "amber";
  const colors = NOTICE_COLORS[colorKey] ?? NOTICE_COLORS.amber;
  const direction = (notice as any).direction ?? "rtl";
  const speedMap: Record<string, string> = {
    slow: "30s",
    normal: "18s",
    fast: "10s",
  };
  const duration = speedMap[notice.speed ?? "normal"] ?? "18s";
  const isPaused = (notice as any).paused ?? false;
  const fontSize = (notice as any).fontSize ?? "base";
  const isBold = (notice as any).bold ?? false;
  const isItalic = (notice as any).italic ?? false;
  const animation = (notice as any).animation ?? "none";
  const textColor = (notice as any).textColor ?? "";
  const isScrolling = direction === "rtl" || direction === "ltr";

  const getAnimationClass = () => {
    switch (animation) {
      case "pulse":
        return "animate-pulse";
      case "bounce":
        return "animate-bounce";
      default:
        return "";
    }
  };

  const textAnimation = (notice as any).textAnimation ?? "none";

  const getAnimationStyle = (): React.CSSProperties => {
    const base: React.CSSProperties =
      colorKey === "rainbow"
        ? {
            animation: "rainbowBg 1.2s linear infinite",
            backgroundSize: "400% 100%",
          }
        : {};
    switch (animation) {
      case "shimmer":
        return {
          ...base,
          backgroundSize: "200% 100%",
          animation:
            colorKey === "rainbow"
              ? base.animation
              : "shimmer 2s linear infinite",
        };
      case "blink":
        return {
          ...base,
          animation:
            colorKey === "rainbow"
              ? base.animation
              : "blink 1s step-start infinite",
        };
      case "fadein":
        return {
          ...base,
          animation:
            colorKey === "rainbow"
              ? base.animation
              : "fadeInBanner 0.6s ease forwards",
        };
      case "slidein":
        return {
          ...base,
          animation:
            colorKey === "rainbow"
              ? base.animation
              : "slideInBanner 0.5s ease forwards",
        };
      default:
        return base;
    }
  };

  const getTextAnimStyle = (): React.CSSProperties => {
    switch (textAnimation) {
      case "typewriter":
        if (isScrolling) {
          return {
            display: "inline",
            color: "inherit",
            animation: "textGlow 1.5s ease-in-out infinite",
            textShadow:
              "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)",
          };
        }
        return {
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          animation: "typewriter 3s steps(30, end) infinite",
          color: "inherit",
        };
      case "glow_pulse":
        return {
          color: "inherit",
          animation: "textGlow 2s ease-in-out infinite",
          textShadow: "0 0 8px rgba(255,255,255,0.8)",
        };
      case "text_bounce":
        return {
          display: "inline-block",
          color: "inherit",
          animation: "textBounce 0.8s ease infinite",
        };
      case "text_fadein":
        return {
          color: "inherit",
          animation: "textFadeinVisible 1.5s ease infinite",
        };
      case "text_shimmer":
        return {
          animation: "textShimmerGlow 2s ease-in-out infinite",
          textShadow:
            "0 0 8px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,200,100,0.4)",
          color: "white",
        };
      case "text_rainbow":
        return {
          animation: "textHueRotate 2s linear infinite",
          color: "#ff4444",
        };
      default:
        return {};
    }
  };

  const marqueeStyle: React.CSSProperties = isScrolling
    ? {
        display: "inline-block",
        animation: `marquee-${direction} ${duration} linear infinite`,
        animationPlayState: isPaused ? "paused" : "running",
        whiteSpace: "nowrap",
        paddingLeft: direction === "rtl" ? "100%" : "0",
      }
    : {
        display: "block",
        textAlign: direction as "center" | "left" | "right",
        whiteSpace: "normal",
        wordBreak: "break-word",
      };

  const textClass = `text-${fontSize} ${isBold ? "font-bold" : "font-normal"} ${isItalic ? "italic" : ""} ${getAnimationClass()}`;

  return (
    <>
      <style>{`
        @keyframes marquee-rtl { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
        @keyframes marquee-ltr { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeInBanner { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInBanner { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes rainbowBg {
          0%   { background-position: 0% 50%;   filter: brightness(1.1) saturate(1.5) drop-shadow(0 0 6px rgba(255,100,0,0.8)); }
          16%  { background-position: 80% 50%;  filter: brightness(1.3) saturate(2.0) drop-shadow(0 0 10px rgba(255,255,0,0.9)); }
          33%  { background-position: 160% 50%; filter: brightness(1.2) saturate(1.8) drop-shadow(0 0 8px rgba(0,255,100,0.8)); }
          50%  { background-position: 240% 50%; filter: brightness(1.4) saturate(2.2) drop-shadow(0 0 12px rgba(0,200,255,1.0)); }
          66%  { background-position: 300% 50%; filter: brightness(1.2) saturate(1.8) drop-shadow(0 0 8px rgba(100,0,255,0.9)); }
          83%  { background-position: 360% 50%; filter: brightness(1.3) saturate(2.0) drop-shadow(0 0 10px rgba(255,0,200,0.9)); }
          100% { background-position: 400% 50%; filter: brightness(1.1) saturate(1.5) drop-shadow(0 0 6px rgba(255,100,0,0.8)); }
        }
        @keyframes rainbowGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(255,100,0,0.6), 0 2px 12px rgba(255,50,0,0.4); }
          33%  { box-shadow: 0 0 12px rgba(0,255,100,0.7), 0 2px 16px rgba(0,200,255,0.5); }
          66%  { box-shadow: 0 0 10px rgba(100,0,255,0.6), 0 2px 14px rgba(255,0,200,0.5); }
        }
        @keyframes typewriter { 0% { width: 0ch; overflow: hidden; } 80% { width: 100%; overflow: hidden; } 100% { width: 100%; } }
        @keyframes textGlow { 0%, 100% { text-shadow: 0 0 4px rgba(255,255,255,0.4); } 50% { text-shadow: 0 0 16px rgba(255,255,255,1), 0 0 30px rgba(255,255,255,0.6); } }
        @keyframes textBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes textFadeinVisible { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes textShimmerGlow { 0%, 100% { text-shadow: 0 0 4px rgba(255,255,255,0.6); opacity: 0.9; } 50% { text-shadow: 0 0 12px rgba(255,255,255,1), 0 0 24px rgba(255,220,100,0.7), 0 0 36px rgba(255,180,50,0.4); opacity: 1; } }
        @keyframes textHueRotate {
          0% { filter: hue-rotate(0deg) brightness(1.1); color: #ff4444; }
          16% { filter: hue-rotate(60deg) brightness(1.2); color: #ffaa00; }
          33% { filter: hue-rotate(120deg) brightness(1.1); color: #44ff44; }
          50% { filter: hue-rotate(180deg) brightness(1.2); color: #00ccff; }
          66% { filter: hue-rotate(240deg) brightness(1.1); color: #6644ff; }
          83% { filter: hue-rotate(300deg) brightness(1.2); color: #ff44cc; }
          100% { filter: hue-rotate(360deg) brightness(1.1); color: #ff4444; }
        }
        .notice-text-rainbow { animation: textHueRotate 2s linear infinite !important; color: #ff4444 !important; text-shadow: 0 0 8px currentColor, 0 0 16px rgba(255,200,0,0.6), 0 0 24px rgba(255,100,0,0.4) !important; font-weight: bold !important; }
        .sidebar-scrollbar::-webkit-scrollbar { width: 4px; }
        .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.35); border-radius: 9999px; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
        .sidebar-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.35) transparent; }
      `}</style>
      <div
        className={`${colorKey === "rainbow" ? "" : colors.bg} ${colors.text} px-4 py-2 flex items-center gap-3 relative z-40 overflow-hidden`}
        style={{
          ...getAnimationStyle(),
          ...(colorKey === "rainbow"
            ? {
                background:
                  "linear-gradient(90deg, #ff0000, #ff5500, #ffaa00, #ffff00, #00ff88, #00ccff, #0044ff, #8800ff, #ff00cc, #ff0000)",
                backgroundSize: "400% 100%",
                animation:
                  "rainbowBg 1.2s linear infinite, rainbowGlow 0.8s linear infinite",
              }
            : (notice as any).customBannerColor
              ? { background: (notice as any).customBannerColor }
              : {}),
        }}
      >
        <Megaphone className="h-4 w-4 flex-shrink-0" />
        <span className="font-semibold text-sm flex-shrink-0">
          {notice.title}:
        </span>
        <div className={`flex-1 ${isScrolling ? "overflow-hidden" : ""}`}>
          <span
            style={{
              ...marqueeStyle,
              ...getTextAnimStyle(),
              ...(textColor &&
              textAnimation !== "text_shimmer" &&
              textAnimation !== "text_rainbow"
                ? { color: textColor }
                : {}),
            }}
            className={`${textClass} ${textAnimation === "text_rainbow" ? "notice-text-rainbow" : ""}`}
          >
            {notice.message}
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
  indent = false,
}: {
  item: NavItem;
  collapsed?: boolean;
  currentPage: PageType;
  badge?: number;
  section: "CASES" | "INVENTORY" | "ADMIN" | "DASHBOARD";
  onNavigate?: () => void;
  indent?: boolean;
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
      className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
        collapsed
          ? "justify-center px-2 py-2.5"
          : `${indent ? "pl-7 pr-3" : "px-3"} py-2`
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

// ── CollapsibleSection ────────────────────────────────────────────────────────
function CollapsibleSection({
  sectionDef,
  collapsed: sidebarCollapsed,
  currentPage,
  onNavigate,
  role: _role,
  unread,
  pendingApprovals,
}: {
  sectionDef: SectionDef;
  collapsed?: boolean;
  currentPage: PageType;
  onNavigate?: () => void;
  role: string;
  unread?: number;
  pendingApprovals?: number;
}) {
  const [groupOpen, setGroupOpen] = useState(false);
  const [subGroupOpen, setSubGroupOpen] = useState<Record<string, boolean>>({});

  const colors = SECTION_COLORS[sectionDef.section];

  const toggleSubGroup = (label: string) => {
    setSubGroupOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Check if any item in section is active to show indicator
  const allItems = sectionDef.subGroups.flatMap((sg) => sg.items);
  const hasActiveItem = allItems.some((item) => item.page === currentPage);

  if (sidebarCollapsed) {
    // Collapsed sidebar: show section icon only with tooltip
    return (
      <div className="px-2 py-1">
        <button
          type="button"
          className={`w-full flex justify-center py-2 rounded-lg ${
            hasActiveItem ? colors.headerBg : "hover:bg-slate-800/50"
          }`}
          title={sectionDef.label}
          onClick={() => setGroupOpen((o) => !o)}
        >
          <sectionDef.icon
            className={`h-4 w-4 ${hasActiveItem ? colors.headerColor : "text-slate-500"}`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-1">
      {/* Main group header */}
      <button
        type="button"
        onClick={() => setGroupOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          hasActiveItem ? `${colors.headerBg}` : "hover:bg-slate-800/40"
        }`}
      >
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-md ${colors.headerBg}`}
        >
          <sectionDef.icon className={`h-3.5 w-3.5 ${colors.headerColor}`} />
        </div>
        <span
          className={`flex-1 text-left text-[11px] font-bold uppercase tracking-widest ${colors.headerColor}`}
        >
          {sectionDef.label}
        </span>
        {hasActiveItem && !groupOpen && (
          <span
            className={`w-1.5 h-1.5 rounded-full bg-current ${colors.headerColor} mr-1`}
          />
        )}
        {groupOpen ? (
          <ChevronUp
            className={`h-3.5 w-3.5 ${colors.chevronColor} flex-shrink-0`}
          />
        ) : (
          <ChevronDown
            className={`h-3.5 w-3.5 ${colors.chevronColor} flex-shrink-0`}
          />
        )}
      </button>

      {/* Sub-groups */}
      {groupOpen && (
        <div className="mt-0.5 space-y-0.5">
          {sectionDef.subGroups.map((sg) => {
            const isSubOpen = subGroupOpen[sg.label] ?? false;
            // Filter items based on role for certain pages
            const filteredItems = sg.items.filter((item) => {
              // Part Requests in INVENTORY Operations: supervisor sees it, admin sees it
              if (item.page === "part-requests") return true;
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={sg.label} className="ml-2">
                {/* Sub-group header */}
                <button
                  type="button"
                  onClick={() => toggleSubGroup(sg.label)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    colors.subHeaderBg
                  } ${colors.subHeaderText} hover:brightness-110`}
                >
                  <sg.icon className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-1 text-left tracking-wide">
                    {sg.label}
                  </span>
                  {isSubOpen ? (
                    <ChevronUp className="h-3 w-3 flex-shrink-0 opacity-60" />
                  ) : (
                    <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-60" />
                  )}
                </button>

                {/* Items */}
                {isSubOpen && (
                  <div className="ml-1 mt-0.5 space-y-0.5">
                    {filteredItems.map((item) => (
                      <NavButton
                        key={item.page + item.label}
                        item={item}
                        currentPage={currentPage}
                        section={sectionDef.section}
                        onNavigate={onNavigate}
                        indent
                        badge={
                          item.page === "notifications"
                            ? unread
                            : item.page === "admin"
                              ? pendingApprovals && pendingApprovals > 0
                                ? pendingApprovals
                                : undefined
                              : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SidebarContent ────────────────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  onNavigate,
  setCollapsed,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentUser, currentPage, notifications, logout, users } = useStore();
  const role = currentUser?.role ?? "backend_user";
  const unread = notifications.filter((n) => !n.isRead).length;
  const pendingApprovals = users.filter((u) => u.status === "pending").length;

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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Logo area */}
      <div
        className={`flex items-center gap-3 border-b border-slate-800/80 ${
          collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"
        }`}
      >
        <div className="relative flex-shrink-0">
          <img
            src="/assets/generated/servicedesk-logo-transparent.dim_64x64.png"
            alt="ServiceDesk Pro"
            className="w-9 h-9 rounded-xl shadow-lg object-cover"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-sm leading-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent tracking-tight">
              ServiceDesk Pro
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Zap className="h-2.5 w-2.5 text-amber-400" />
              Powering Service Excellence
            </div>
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
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600/40 text-slate-400 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/50 transition-all duration-200"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 sidebar-scrollbar">
        {/* Dashboard - always on top, standalone */}
        {(role === "admin" ||
          role === "backend_user" ||
          role === "supervisor") && (
          <div
            className={`pb-2 mb-1 border-b border-slate-800/50 ${collapsed ? "px-2" : "px-1"}`}
          >
            <NavButton
              item={DASHBOARD_NAV}
              collapsed={collapsed}
              currentPage={currentPage}
              section="DASHBOARD"
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* Admin standalone: Reports + Part Requests (below Dashboard, above groups) */}
        {role === "admin" && (
          <div className={collapsed ? "px-2" : "px-1"}>
            <NavButton
              item={{ icon: BarChart3, label: "Reports", page: "reports" }}
              collapsed={collapsed}
              currentPage={currentPage}
              section="ADMIN"
              onNavigate={onNavigate}
            />
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
          </div>
        )}

        {/* CASES section */}
        {role === "admin" && (
          <CollapsibleSection
            sectionDef={CASES_SECTIONS_ADMIN}
            collapsed={collapsed}
            currentPage={currentPage}
            onNavigate={onNavigate}
            role={role}
            unread={unread}
          />
        )}
        {role === "backend_user" && (
          <CollapsibleSection
            sectionDef={CASES_SECTIONS_BACKEND_USER}
            collapsed={collapsed}
            currentPage={currentPage}
            onNavigate={onNavigate}
            role={role}
            unread={unread}
          />
        )}

        {/* INVENTORY section */}
        {role === "admin" && (
          <CollapsibleSection
            sectionDef={INVENTORY_SECTIONS_ADMIN}
            collapsed={collapsed}
            currentPage={currentPage}
            onNavigate={onNavigate}
            role={role}
            unread={unread}
          />
        )}
        {role === "supervisor" && (
          <CollapsibleSection
            sectionDef={INVENTORY_SECTIONS_SUPERVISOR}
            collapsed={collapsed}
            currentPage={currentPage}
            onNavigate={onNavigate}
            role={role}
            unread={unread}
          />
        )}

        {/* ADMIN section */}
        {role === "admin" && (
          <CollapsibleSection
            sectionDef={ADMIN_SECTIONS}
            collapsed={collapsed}
            currentPage={currentPage}
            onNavigate={onNavigate}
            role={role}
            unread={unread}
            pendingApprovals={pendingApprovals}
          />
        )}

        {/* Quick access: Notifications & Profile always at bottom */}
        <div className={`pt-3 pb-1 ${collapsed ? "px-2" : "px-3"}`}>
          <div className="border-t border-slate-800/60" />
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
      <div
        className={`border-t border-slate-800/60 ${collapsed ? "p-2" : "p-3"}`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow">
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow">
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
    gradient: "bg-gradient-to-r from-indigo-600 to-violet-600",
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
    icon: ShoppingBag,
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
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600",
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
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600",
    text: "text-white",
  },
  "ai-engine": {
    label: "AI Engine",
    icon: Sparkles,
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
    gradient: "bg-gradient-to-r from-violet-600 to-purple-600",
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
    icon: ScrollText,
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
      <aside
        className={`flex-shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-64"} overflow-hidden`}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <NoticeBanner />
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <SectionPill page={currentPageStr} />
          </div>
          <div className="flex items-center gap-3">
            <InlineSearch />
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
            <button
              type="button"
              onClick={() => navigate("profile")}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
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

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
