import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  ChevronRight,
  GitBranch,
  MapPin,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useStore } from "../store";

type FilterTab =
  | "all"
  | "purchased"
  | "issued"
  | "installed"
  | "returned_store"
  | "returned_company";

const EVENT_META: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    border: string;
    bg: string;
    label: string;
    iconColor: string;
  }
> = {
  Purchased: {
    icon: ShoppingCart,
    color: "text-green-700",
    border: "border-l-green-500",
    bg: "bg-green-50",
    label: "Purchased",
    iconColor: "text-green-600",
  },
  "Location Assigned": {
    icon: MapPin,
    color: "text-violet-700",
    border: "border-l-violet-500",
    bg: "bg-violet-50",
    label: "Location Assigned",
    iconColor: "text-violet-600",
  },
  Stored: {
    icon: Package,
    color: "text-emerald-700",
    border: "border-l-emerald-500",
    bg: "bg-emerald-50",
    label: "Stored",
    iconColor: "text-emerald-600",
  },
  Issued: {
    icon: ArrowUpRight,
    color: "text-orange-700",
    border: "border-l-orange-500",
    bg: "bg-orange-50",
    label: "Issued",
    iconColor: "text-orange-600",
  },
  Installed: {
    icon: Wrench,
    color: "text-blue-700",
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    label: "Installed",
    iconColor: "text-blue-600",
  },
  "Returned Unused": {
    icon: RotateCcw,
    color: "text-amber-700",
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    label: "Returned to Store",
    iconColor: "text-amber-600",
  },
  "Returned to Store": {
    icon: RotateCcw,
    color: "text-amber-700",
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    label: "Returned to Store",
    iconColor: "text-amber-600",
  },
  Relocated: {
    icon: MapPin,
    color: "text-cyan-700",
    border: "border-l-cyan-500",
    bg: "bg-cyan-50",
    label: "Relocated",
    iconColor: "text-cyan-600",
  },
  "Returned to Company": {
    icon: Building2,
    color: "text-red-700",
    border: "border-l-red-500",
    bg: "bg-red-50",
    label: "Returned to Company",
    iconColor: "text-red-600",
  },
  Defective: {
    icon: Building2,
    color: "text-red-700",
    border: "border-l-red-500",
    bg: "bg-red-50",
    label: "Defective",
    iconColor: "text-red-600",
  },
};

function getEventMeta(action: string) {
  for (const [key, val] of Object.entries(EVENT_META)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return {
    icon: Package,
    color: "text-slate-600",
    border: "border-l-slate-400",
    bg: "bg-slate-50",
    label: action,
    iconColor: "text-slate-500",
  };
}

const TAB_FILTER_MAP: Record<FilterTab, string[]> = {
  all: [],
  purchased: ["purchased", "stored"],
  issued: ["issued"],
  installed: ["installed"],
  returned_store: ["returned unused", "returned to store"],
  returned_company: ["returned to company", "defective"],
};

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return ts;
  }
}

const EXTRA_LIFECYCLE = [
  {
    id: "el1",
    partId: "A-01928",
    action: "Purchased",
    details:
      "Part A-01928 (Main Motor) purchased from Midea Pvt.ltd. Invoice: in-01",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:57:03.000Z",
  },
  {
    id: "el2",
    partId: "A-01928",
    action: "Issued",
    details: "Issued to Sonu for Case 6532543",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:59:11.000Z",
  },
  {
    id: "el3",
    partId: "A-01928",
    action: "Returned Unused",
    details: "Returned to store by Store Admin. Reason: Not required",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:59:52.000Z",
  },
  {
    id: "el4",
    partId: "A-01928",
    action: "Relocated",
    details: "Relocated to Main Warehouse > A > Shelf A-1 > Bin Bin-2",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-18T08:14:28.000Z",
  },
  {
    id: "el5",
    partId: "A-01928",
    action: "Returned to Company",
    details: "Returned to company Midea Pvt.ltd. Ref: 1246. Reason: Defective",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-21T09:05:02.000Z",
  },
  {
    id: "el6",
    partId: "B-37276",
    action: "Purchased",
    details:
      "Part B-37276 (Main Motor) purchased from Midea Pvt.ltd. Invoice: in-01",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:57:03.000Z",
  },
  {
    id: "el7",
    partId: "B-37276",
    action: "Location Assigned",
    details: "Location assigned to A › A-1 › Bin-1",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-18T08:14:28.000Z",
  },
  {
    id: "el8",
    partId: "C-82733",
    action: "Purchased",
    details:
      "Part C-82733 (Main Motor) purchased from Midea Pvt.ltd. Invoice: in-01",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:57:03.000Z",
  },
  {
    id: "el9",
    partId: "C-82733",
    action: "Location Assigned",
    details: "Location assigned to A › A-1 › Bin-2",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T10:00:00.000Z",
  },
  {
    id: "el10",
    partId: "C-82733",
    action: "Relocated",
    details: "Relocated from Bin-1 to A › A-1 › Bin-2",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-18T10:10:01.000Z",
  },
  {
    id: "el11",
    partId: "F-753",
    action: "Purchased",
    details:
      "Part F-753 (Compressor) purchased from Midea Pvt.ltd. Invoice: in-1245",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:21:36.000Z",
  },
  {
    id: "el12",
    partId: "F-753",
    action: "Issued",
    details: "Part F-753 issued to Sonu. Case: 154343",
    userId: "admin1",
    userName: "Store Admin",
    timestamp: "2026-03-16T09:22:42.000Z",
  },
];

const PART_INFO: Record<
  string,
  { company: string; partName: string; status: string; category: string }
> = {
  "A-01928": {
    company: "Midea",
    partName: "Main Motor",
    status: "returned_to_company",
    category: "Refrigerator",
  },
  "B-37276": {
    company: "Midea",
    partName: "Main Motor",
    status: "in_stock",
    category: "Refrigerator",
  },
  "C-82733": {
    company: "Midea",
    partName: "Main Motor",
    status: "in_stock",
    category: "Refrigerator",
  },
  "F-753": {
    company: "Midea",
    partName: "Compressor",
    status: "issued",
    category: "Refrigerator",
  },
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  in_stock: {
    label: "In Warehouse",
    cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  issued: {
    label: "Issued",
    cls: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  installed: {
    label: "Installed",
    cls: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  returned_to_company: {
    label: "Returned to Company",
    cls: "bg-red-100 text-red-700 border border-red-200",
  },
  returned_to_store: {
    label: "Returned to Store",
    cls: "bg-slate-100 text-slate-600 border border-slate-200",
  },
};

const FILTER_TABS: {
  key: FilterTab;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    key: "all",
    label: "All Events",
    icon: GitBranch,
    color: "text-indigo-600",
  },
  {
    key: "purchased",
    label: "Purchased",
    icon: ShoppingCart,
    color: "text-green-600",
  },
  {
    key: "issued",
    label: "Issued",
    icon: ArrowUpRight,
    color: "text-orange-600",
  },
  {
    key: "installed",
    label: "Installed",
    icon: Wrench,
    color: "text-blue-600",
  },
  {
    key: "returned_store",
    label: "Returned to Store",
    icon: RotateCcw,
    color: "text-amber-600",
  },
  {
    key: "returned_company",
    label: "Returned to Company",
    icon: Building2,
    color: "text-red-600",
  },
];

export default function LifecyclePage() {
  const { partLifecycle, partItems, stockCompanies, stockPartNames, navigate } =
    useStore();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  // Per-tab date filters
  const [dateFilters, setDateFilters] = useState<
    Record<FilterTab, { from: string; to: string }>
  >(
    Object.fromEntries(
      FILTER_TABS.map((t) => [t.key, { from: "", to: "" }]),
    ) as Record<FilterTab, { from: string; to: string }>,
  );

  const allLifecycle = useMemo(() => {
    const ids = new Set(EXTRA_LIFECYCLE.map((e) => e.id));
    return [...partLifecycle.filter((e) => !ids.has(e.id)), ...EXTRA_LIFECYCLE];
  }, [partLifecycle]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof allLifecycle>();
    for (const entry of allLifecycle) {
      const key = entry.partId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    for (const [, arr] of map) {
      arr.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    }
    return map;
  }, [allLifecycle]);

  const partCodes = useMemo(() => [...groups.keys()], [groups]);

  const getPartInfo = (code: string) => {
    if (PART_INFO[code]) return PART_INFO[code];
    const item = partItems.find((p) => p.partCode === code);
    if (!item)
      return { company: "", partName: code, status: "in_stock", category: "" };
    return {
      company: stockCompanies.find((c) => c.id === item.companyId)?.name ?? "",
      partName:
        stockPartNames.find((p) => p.id === item.partNameId)?.name ?? code,
      status: item.status,
      category: "",
    };
  };

  const currentDateFilter = dateFilters[activeTab];

  const filterEvents = (events: typeof allLifecycle) => {
    let filtered = events;
    // Filter by tab
    if (activeTab !== "all") {
      const keywords = TAB_FILTER_MAP[activeTab];
      filtered = filtered.filter((e) =>
        keywords.some((k) => e.action.toLowerCase().includes(k)),
      );
    }
    // Filter by date range
    if (currentDateFilter.from) {
      filtered = filtered.filter(
        (e) => e.timestamp >= new Date(currentDateFilter.from).toISOString(),
      );
    }
    if (currentDateFilter.to) {
      const toEnd = new Date(currentDateFilter.to);
      toEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => e.timestamp <= toEnd.toISOString());
    }
    return filtered;
  };

  const q = search.toLowerCase();
  const filtered = partCodes.filter((code) => {
    const info = getPartInfo(code);
    if (
      q &&
      !code.toLowerCase().includes(q) &&
      !info.partName.toLowerCase().includes(q)
    )
      return false;
    // Only show groups that have events in current tab
    const events = groups.get(code) ?? [];
    return filterEvents(events).length > 0;
  });

  const toggle = (code: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });

  const totalEvents = allLifecycle.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <GitBranch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Part Lifecycle</h1>
            <p className="text-indigo-200 text-sm">
              Track every movement of every part
            </p>
          </div>
          <div className="ml-auto">
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
              {totalEvents} total events
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs - outside header */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {/* Search + Date Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part code or part name..."
              className="pl-9 bg-white border-slate-200 shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 font-medium">From</span>
            <Input
              type="date"
              value={currentDateFilter.from}
              onChange={(e) =>
                setDateFilters((prev) => ({
                  ...prev,
                  [activeTab]: { ...prev[activeTab], from: e.target.value },
                }))
              }
              className="bg-white border-slate-200 shadow-sm text-sm w-36"
            />
            <span className="text-xs text-slate-500 font-medium">To</span>
            <Input
              type="date"
              value={currentDateFilter.to}
              onChange={(e) =>
                setDateFilters((prev) => ({
                  ...prev,
                  [activeTab]: { ...prev[activeTab], to: e.target.value },
                }))
              }
              className="bg-white border-slate-200 shadow-sm text-sm w-36"
            />
            {(currentDateFilter.from || currentDateFilter.to) && (
              <button
                type="button"
                onClick={() =>
                  setDateFilters((prev) => ({
                    ...prev,
                    [activeTab]: { from: "", to: "" },
                  }))
                }
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No lifecycle events found</p>
              <p className="text-sm mt-1">
                Try a different filter or search term
              </p>
            </div>
          )}
          {filtered.map((code) => {
            const allEvents = groups.get(code) ?? [];
            const events = filterEvents(allEvents);
            const info = getPartInfo(code);
            const isOpen = expanded.has(code);
            const badge = STATUS_BADGE[info.status] ?? STATUS_BADGE.in_stock;

            return (
              <Card
                key={code}
                className="overflow-hidden shadow-sm border-slate-200 hover:shadow-md transition-shadow"
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => toggle(code)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-slate-400">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("part-detail", undefined, code);
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-base"
                      >
                        {code}
                      </button>
                      <Badge
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 ${badge.cls}`}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    {info.company && (
                      <div className="text-sm text-slate-500">
                        {info.company} ›{" "}
                        {info.category && `${info.category} › `}
                        {info.partName}
                      </div>
                    )}
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                    {events.length} event{events.length !== 1 ? "s" : ""}
                  </span>
                </button>

                {/* Timeline */}
                {isOpen && (
                  <CardContent className="pt-0 pb-5 px-5">
                    <div className="border-t border-slate-100 mb-4" />
                    <div className="relative ml-3">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-slate-200" />
                      <div className="space-y-4">
                        {events.map((ev) => {
                          const meta = getEventMeta(ev.action);
                          const Icon = meta.icon;
                          return (
                            <div key={ev.id} className="relative pl-10">
                              <div
                                className={`absolute left-2 top-3 w-4 h-4 rounded-full ${meta.bg} border-2 ${meta.border.replace("border-l-", "border-")} flex items-center justify-center shadow-sm`}
                              >
                                <Icon
                                  className={`h-2.5 w-2.5 ${meta.iconColor}`}
                                />
                              </div>
                              <div
                                className={`rounded-xl border-l-4 ${meta.border} ${meta.bg} p-4`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      className={`h-4 w-4 ${meta.iconColor}`}
                                    />
                                    <span
                                      className={`font-bold text-sm ${meta.color}`}
                                    >
                                      {ev.action}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                                    {formatDate(ev.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                                  {ev.details}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  By {ev.userName}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
