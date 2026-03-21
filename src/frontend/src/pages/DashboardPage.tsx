import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import StatusBadge from "../components/StatusBadge";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { getAgeing, useStore } from "../store";

function CaseDashboard() {
  const { cases, technicians, navigate } = useStore();

  const today = new Date().toISOString().split("T")[0];
  const active = cases.filter(
    (c) =>
      ![
        "closed",
        "cancelled",
        "transferred",
        "adjustment_closed",
        "replacement_done",
      ].includes(c.status),
  );

  const staleCases = cases.filter(
    (c) =>
      c.status === "on_route" &&
      c.technicianId &&
      !c.hasFirstUpdate &&
      c.onRouteDate &&
      c.onRouteDate < today,
  );

  const stats = {
    total: cases.length,
    todayPending: cases.filter(
      (c) =>
        c.status === "pending" ||
        (c.nextActionDate && c.nextActionDate.split("T")[0] === today),
    ).length,
    partPending: cases.filter((c) => c.status === "part_required").length,
    gasPending: cases.filter((c) => c.status === "gas_charge_pending").length,
    closedToday: cases.filter(
      (c) => c.closedAt && c.closedAt.split("T")[0] === today,
    ).length,
    noUpdate: staleCases.length,
  };

  const ageing = {
    a0to3: active.filter((c) => getAgeing(c.createdAt) <= 3).length,
    a4to7: active.filter(
      (c) => getAgeing(c.createdAt) >= 4 && getAgeing(c.createdAt) <= 7,
    ).length,
    a8to14: active.filter(
      (c) => getAgeing(c.createdAt) >= 8 && getAgeing(c.createdAt) <= 14,
    ).length,
    a15plus: active.filter((c) => getAgeing(c.createdAt) >= 15).length,
  };

  const recentCases = [...cases]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 8);

  const techPerf = technicians
    .map((t) => ({
      ...t,
      assigned: cases.filter((c) => c.technicianId === t.id).length,
      completed: cases.filter(
        (c) =>
          c.technicianId === t.id &&
          ["closed", "adjustment_closed", "replacement_done"].includes(
            c.status,
          ),
      ).length,
    }))
    .filter((t) => t.assigned > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Total Cases",
            value: stats.total,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Today Pending",
            value: stats.todayPending,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
          {
            label: "Part Pending",
            value: stats.partPending,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Gas Pending",
            value: stats.gasPending,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Closed Today",
            value: stats.closedToday,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "No Update",
            value: stats.noUpdate,
            color: "text-amber-700",
            bg: "bg-amber-50",
            icon: stats.noUpdate > 0,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`${
              card.label === "No Update" && stats.noUpdate > 0
                ? "bg-amber-50 border-amber-200"
                : card.bg
            } rounded-xl p-3 sm:p-4 border border-white shadow-sm`}
          >
            <div className="flex items-center gap-1">
              {"icon" in card && card.icon && (
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              )}
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Stale Cases Warning */}
      {staleCases.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex items-center gap-2 text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold text-sm">
                Cases With No Technician Update
              </span>
            </div>
            <p className="text-xs text-amber-600 sm:ml-auto">
              These cases will auto-reset at midnight tonight. Act now or
              they'll return to Pending.
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {staleCases.slice(0, 5).map((c) => {
              const tech = technicians.find((t) => t.id === c.technicianId);
              const daysSinceRoute = c.onRouteDate
                ? Math.floor(
                    (Date.now() - new Date(c.onRouteDate).getTime()) / 86400000,
                  )
                : 0;
              return (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-blue-700 text-sm">
                      {c.caseId}
                    </span>
                    <span className="text-sm text-gray-700">
                      {c.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Tech: {tech?.name ?? "—"}</span>
                    <span className="text-amber-600 font-medium">
                      {daysSinceRoute}d on route
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("case-detail", c.id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {staleCases.length > 5 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              +{staleCases.length - 5} more stale cases
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate("cases")}
            className="mt-3 w-full text-center text-sm font-medium text-amber-700 hover:text-amber-900 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            View All No-Update Cases →
          </button>
        </div>
      )}

      {/* Ageing Buckets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Case Ageing (Active Cases)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "0–3 Days",
              value: ageing.a0to3,
              bg: "bg-green-500",
              text: "text-white",
            },
            {
              label: "4–7 Days",
              value: ageing.a4to7,
              bg: "bg-yellow-400",
              text: "text-yellow-900",
            },
            {
              label: "8–14 Days",
              value: ageing.a8to14,
              bg: "bg-orange-500",
              text: "text-white",
            },
            {
              label: "15+ Days",
              value: ageing.a15plus,
              bg: "bg-red-500",
              text: "text-white",
            },
          ].map((b) => (
            <div
              key={b.label}
              className={`${b.bg} rounded-xl p-4 sm:p-5 shadow-sm`}
            >
              <p className={`text-sm font-medium ${b.text} opacity-80`}>
                {b.label}
              </p>
              <p className={`text-3xl sm:text-4xl font-bold ${b.text} mt-1`}>
                {b.value}
              </p>
              <p className={`text-xs ${b.text} opacity-70 mt-1`}>
                active cases
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Recent Cases</h3>
            <button
              type="button"
              onClick={() => navigate("cases")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                    Case ID
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 hidden md:table-cell">
                    Product
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => {
                  const age = getAgeing(c.createdAt);
                  const isStale =
                    c.status === "on_route" &&
                    c.technicianId &&
                    !c.hasFirstUpdate &&
                    c.onRouteDate &&
                    c.onRouteDate < today;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate("case-detail", c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate("case-detail", c.id);
                      }}
                      tabIndex={0}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${
                        isStale
                          ? "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400"
                          : age >= 8 &&
                              !["closed", "cancelled", "transferred"].includes(
                                c.status,
                              )
                            ? "bg-red-50 hover:bg-red-100"
                            : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-blue-700">
                        <div className="flex items-center gap-1">
                          {isStale && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          {c.caseId}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-700 hidden sm:table-cell">
                        {c.customerName}
                      </td>
                      <td className="px-3 py-3 text-gray-600 hidden md:table-cell">
                        {c.product}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td
                        className={`px-3 py-3 font-medium ${
                          age >= 8
                            ? "text-red-600"
                            : age >= 4
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {age}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technician Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Technician Performance
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {techPerf.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data</p>
            )}
            {techPerf.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    {t.completed}/{t.assigned}
                  </p>
                  <p className="text-xs text-gray-500">done/total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreDashboard() {
  const {
    partItems,
    purchaseEntries,
    stockCompanies,
    stockCategories,
    stockPartNames,
    technicians,
    navigate,
  } = useStore();

  const inStockItems = partItems.filter((p) => p.status === "in_stock");
  const issuedItems = partItems.filter((p) => p.status === "issued");
  const activeTechnicians = technicians.filter((t) => t.isActive);

  // Inventory value: sum costPrice from purchases for in_stock items
  const inventoryValue = inStockItems.reduce((acc, item) => {
    const purchase = purchaseEntries.find((pe) => pe.id === item.purchaseId);
    return acc + (purchase?.costPrice ?? 500);
  }, 0);

  // Low stock: partNames where in_stock count < 3
  const lowStockPartNames = stockPartNames.filter((pn) => {
    const stockCount = inStockItems.filter(
      (p) => p.partNameId === pn.id,
    ).length;
    return stockCount < 3;
  });

  // Part status distribution
  const statusDist = [
    { name: "In Stock", value: inStockItems.length, color: "#22c55e" },
    { name: "Issued", value: issuedItems.length, color: "#f59e0b" },
    {
      name: "Installed",
      value: partItems.filter((p) => p.status === "installed").length,
      color: "#3b82f6",
    },
    {
      name: "Returned to Store",
      value: partItems.filter((p) => p.status === "returned_to_store").length,
      color: "#a855f7",
    },
    {
      name: "Returned to Company",
      value: partItems.filter((p) => p.status === "returned_to_company").length,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  // Active issues (top 5)
  const activeIssues = [...issuedItems]
    .sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    )
    .slice(0, 5);

  const getPartName = (id: string) =>
    stockPartNames.find((p) => p.id === id)?.name ?? "—";
  const getCompanyName = (id: string) =>
    stockCompanies.find((c) => c.id === id)?.name ?? "—";
  const getCategoryName = (id: string) =>
    stockCategories.find((c) => c.id === id)?.name ?? "—";
  const getTechName = (id: string) =>
    technicians.find((t) => t.id === id)?.name ?? "—";

  const formatIssueDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  // AI Insights
  const topIssuedPartNameId = (() => {
    const counts: Record<string, number> = {};
    for (const p of partItems.filter((p) => p.status !== "in_stock")) {
      counts[p.partNameId] = (counts[p.partNameId] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  })();

  const aiInsights = [
    lowStockPartNames.length > 0
      ? {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          priority: "high" as const,
          text: `${lowStockPartNames.length} part${lowStockPartNames.length > 1 ? "s" : ""} running low on stock — consider reordering soon.`,
        }
      : {
          icon: <Zap className="h-4 w-4 text-green-500" />,
          priority: "low" as const,
          text: "All parts are adequately stocked. Inventory health looks good.",
        },
    topIssuedPartNameId
      ? {
          icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
          priority: "medium" as const,
          text: `"${getPartName(topIssuedPartNameId)}" is the most frequently issued part. Keep extra stock on hand.`,
        }
      : {
          icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
          priority: "medium" as const,
          text: "No parts have been issued yet. Issue parts to technicians to track demand.",
        },
    partItems.filter((p) => p.status === "installed").length > 0
      ? {
          icon: <TrendingDown className="h-4 w-4 text-purple-500" />,
          priority: "low" as const,
          text: `${partItems.filter((p) => p.status === "installed").length} parts have been installed by technicians this period.`,
        }
      : {
          icon: <Package className="h-4 w-4 text-slate-400" />,
          priority: "low" as const,
          text: "Add purchase entries to start tracking inventory value and demand.",
        },
  ];

  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-green-100 text-green-700",
    critical: "bg-red-200 text-red-800",
  };

  const kpiCards = [
    {
      label: "Parts in Warehouse",
      value: inStockItems.length.toString(),
      icon: <Package className="h-5 w-5" />,
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      page: "inventory" as const,
    },
    {
      label: "Inventory Value",
      value: `₹${inventoryValue.toLocaleString("en-IN")}`,
      icon: <Warehouse className="h-5 w-5" />,
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      page: "inventory" as const,
    },
    {
      label: "With Technician",
      value: issuedItems.length.toString(),
      icon: <Users className="h-5 w-5" />,
      bg: "bg-gradient-to-br from-amber-500 to-orange-500",
      page: "issued-parts" as const,
    },
    {
      label: "Active Technicians",
      value: activeTechnicians.length.toString(),
      icon: <Users className="h-5 w-5" />,
      bg: "bg-gradient-to-br from-violet-500 to-purple-600",
      page: "technicians" as const,
    },
    {
      label: "Total Purchases",
      value: purchaseEntries.length.toString(),
      icon: <ShoppingCart className="h-5 w-5" />,
      bg: "bg-gradient-to-br from-sky-500 to-cyan-500",
      page: "purchase" as const,
    },
    {
      label: "Low Stock Alerts",
      value: lowStockPartNames.length.toString(),
      icon: <AlertTriangle className="h-5 w-5" />,
      bg:
        lowStockPartNames.length > 0
          ? "bg-gradient-to-br from-red-500 to-rose-600"
          : "bg-gradient-to-br from-slate-400 to-slate-500",
      page: "inventory" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section 1: KPI Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
        data-ocid="store_dashboard.section"
      >
        {kpiCards.map((card) => (
          <button
            type="button"
            key={card.label}
            onClick={() => navigate(card.page)}
            className={`${card.bg} text-white rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer text-left`}
            data-ocid="store_dashboard.card"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="opacity-80">{card.icon}</div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </div>
            <p className="text-2xl font-bold leading-none">{card.value}</p>
            <p className="text-xs opacity-80 mt-1 font-medium">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Section 2: AI Insights */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          <Brain className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
          <Badge className="ml-auto bg-violet-100 text-violet-700 text-xs">
            Powered by AI
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          {aiInsights.map((insight) => (
            <div
              key={insight.text}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <div className="mt-0.5 shrink-0">{insight.icon}</div>
              <p className="text-sm text-slate-700 flex-1">{insight.text}</p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${priorityColors[insight.priority]}`}
              >
                {insight.priority.charAt(0).toUpperCase() +
                  insight.priority.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Chart + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Part Status Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Part Status Distribution
            </h3>
          </div>
          <div className="p-4">
            {statusDist.length === 0 ? (
              <div
                className="text-center py-10 text-slate-400 text-sm"
                data-ocid="store_dashboard.empty_state"
              >
                No part data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDist.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} parts`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock Parts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Low Stock Parts</h3>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {lowStockPartNames.length === 0 ? (
              <div
                className="text-center py-6 text-slate-400 text-sm"
                data-ocid="store_dashboard.empty_state"
              >
                All parts adequately stocked.
              </div>
            ) : (
              lowStockPartNames.slice(0, 5).map((pn) => {
                const stock = inStockItems.filter(
                  (p) => p.partNameId === pn.id,
                ).length;
                const companyId =
                  partItems.find((p) => p.partNameId === pn.id)?.companyId ??
                  "";
                return (
                  <div
                    key={pn.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {pn.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getCompanyName(companyId)} ·{" "}
                        {getCategoryName(
                          partItems.find((p) => p.partNameId === pn.id)
                            ?.categoryId ?? "",
                        )}
                      </p>
                    </div>
                    <span
                      className={`ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                        stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {stock} left
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => navigate("inventory")}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
              data-ocid="store_dashboard.button"
            >
              View All →
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Active Issues */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Active Issues</h3>
          <button
            type="button"
            onClick={() => navigate("issued-parts")}
            className="text-sm text-blue-600 hover:underline"
            data-ocid="store_dashboard.button"
          >
            View All
          </button>
        </div>
        {activeIssues.length === 0 ? (
          <div
            className="text-center py-10 text-slate-400 text-sm"
            data-ocid="store_dashboard.empty_state"
          >
            No active issues. All parts are in stock.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">
                    Part Code
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden sm:table-cell">
                    Part Name
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">
                    Technician
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">
                    Case ID
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden lg:table-cell">
                    Issue Date &amp; Time
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeIssues.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`store_dashboard.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                      {p.partCode}
                    </td>
                    <td className="px-3 py-3 text-slate-700 hidden sm:table-cell">
                      {getPartName(p.partNameId)}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {getTechName(p.technicianId)}
                    </td>
                    <td className="px-3 py-3 text-slate-500 font-mono text-xs hidden md:table-cell">
                      {p.caseId || "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs hidden lg:table-cell">
                      {formatIssueDate(p.issueDate)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        Issued
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useStore();
  const role = currentUser?.role;

  if (role === "supervisor") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Store Dashboard</h2>
          <p className="text-sm text-gray-500">
            Inventory &amp; Stock Overview &mdash;{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <StoreDashboard />
      </div>
    );
  }

  if (role === "backend_user") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">
            Performance Overview &mdash;{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <CaseDashboard />
      </div>
    );
  }

  // Admin: two tabs
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Tabs defaultValue="case" className="w-full">
        <TabsList className="mb-4" data-ocid="dashboard.tab">
          <TabsTrigger value="case" data-ocid="dashboard.tab">
            Case Dashboard
          </TabsTrigger>
          <TabsTrigger value="store" data-ocid="dashboard.tab">
            Store Dashboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="case">
          <CaseDashboard />
        </TabsContent>
        <TabsContent value="store">
          <StoreDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
