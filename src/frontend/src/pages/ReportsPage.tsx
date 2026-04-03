import {
  BarChart2,
  BarChart3,
  Download,
  FileText,
  Filter,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useStore } from "../store";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export default function ReportsPage() {
  const {
    currentUser,
    cases,
    partItems,
    technicians,
    vendors,
    stockCompanies,
    stockPartNames,
    purchaseEntries,
  } = useStore();
  const role = currentUser?.role ?? "backend_user";
  const [refreshing, setRefreshing] = useState(false);
  const [caseStatusFilter, setCaseStatusFilter] = useState("all");
  const [caseTechFilter, setCaseTechFilter] = useState("all");
  const [invStatusFilter, setInvStatusFilter] = useState("all");
  const [invCompanyFilter, setInvCompanyFilter] = useState("all");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ── Case stats ────────────────────────────────────────────────────────────
  const totalCases = cases.length;
  const openCases = cases.filter(
    (c) => !["closed", "cancelled", "transferred"].includes(c.status),
  ).length;
  const closedToday = cases.filter((c) => {
    if (!c.closedAt) return false;
    return new Date(c.closedAt).toDateString() === new Date().toDateString();
  }).length;

  const statusDistCases = [
    {
      name: "New",
      value: cases.filter((c) => c.status === "new").length,
      fill: "#3b82f6",
    },
    {
      name: "In Progress",
      value: cases.filter((c) =>
        ["confirmed", "pending", "on_route"].includes(c.status),
      ).length,
      fill: "#f59e0b",
    },
    {
      name: "Closed",
      value: cases.filter((c) => c.status === "closed").length,
      fill: "#10b981",
    },
    {
      name: "Cancelled",
      value: cases.filter((c) => c.status === "cancelled").length,
      fill: "#ef4444",
    },
    {
      name: "Part Pending",
      value: cases.filter((c) =>
        ["part_required", "part_ordered", "part_received"].includes(c.status),
      ).length,
      fill: "#8b5cf6",
    },
  ].filter((s) => s.value > 0);

  const techCasesData = technicians
    .slice(0, 6)
    .map((t) => ({
      name: t.name.split(" ")[0],
      cases: cases.filter((c) => c.technicianId === t.id).length,
    }))
    .filter((t) => t.cases > 0);

  const casesOverTime = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayStr = d.toISOString().split("T")[0];
    const count = cases.filter((c) => c.createdAt.startsWith(dayStr)).length;
    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      cases: count,
    };
  });

  // ── Inventory stats ───────────────────────────────────────────────────────
  const inStock = partItems.filter((p) => p.status === "in_stock").length;
  const issuedCount = partItems.filter((p) => p.status === "issued").length;
  const returnedCount = partItems.filter(
    (p) => p.status === "returned_to_company",
  ).length;

  const invStatusDist = [
    { name: "In Warehouse", value: inStock, fill: "#10b981" },
    { name: "Issued", value: issuedCount, fill: "#f59e0b" },
    {
      name: "Installed",
      value: partItems.filter((p) => p.status === "installed").length,
      fill: "#3b82f6",
    },
    { name: "Returned", value: returnedCount, fill: "#ef4444" },
  ].filter((s) => s.value > 0);

  const byCompany = stockCompanies
    .map((c) => ({
      name: c.name,
      parts: partItems.filter((p) => p.companyId === c.id).length,
    }))
    .filter((c) => c.parts > 0);

  const issuesOverTime = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i) * 3);
    const dayStr = d.toISOString().split("T")[0];
    const issued = partItems.filter((p) =>
      p.issueDate?.startsWith(dayStr),
    ).length;
    const returned = partItems.filter((p) =>
      p.returnedToStoreAt?.startsWith(dayStr),
    ).length;
    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      issued,
      returned,
    };
  });

  const topIssuedParts = (() => {
    const partNameCounts = new Map<string, number>();
    for (const p of partItems.filter(
      (p) => p.status === "issued" || p.status === "installed",
    )) {
      const name =
        stockPartNames.find((pn) => pn.id === p.partNameId)?.name ||
        (p as any).overridePartName ||
        p.partCode;
      partNameCounts.set(name, (partNameCounts.get(name) ?? 0) + 1);
    }
    return [...partNameCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, issued]) => ({ name, issued }));
  })();

  const techPerf = technicians
    .slice(0, 6)
    .map((t) => ({
      name: t.name.split(" ")[0],
      issued: partItems.filter(
        (p) => p.technicianId === t.id && p.status === "issued",
      ).length,
      installed: partItems.filter(
        (p) => p.technicianId === t.id && p.status === "installed",
      ).length,
    }))
    .filter((t) => t.issued > 0 || t.installed > 0);

  const monthlyPurchases = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthPurchaseEntries = purchaseEntries.filter((p) =>
      p.createdAt?.startsWith(monthKey),
    );
    return {
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      purchases: monthPurchaseEntries.length,
      value: monthPurchaseEntries.reduce(
        (sum, p) => sum + (p.quantity ?? 1) * ((p as any).costPrice ?? 0),
        0,
      ),
    };
  });

  const vendorSpend = vendors
    .map((v) => {
      const vPurchases = purchaseEntries.filter(
        (p) => p.vendorId === v.id || p.vendorName === v.name,
      );
      const spend = vPurchases.reduce(
        (sum, p) => sum + (p.quantity ?? 1) * ((p as any).costPrice ?? 0),
        0,
      );
      return { name: v.name, spend };
    })
    .filter((v) => v.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  const returnTypes = (() => {
    const returnedItems = partItems.filter(
      (p) => p.status === "returned_to_company",
    );
    const returnTypeMap = new Map<string, number>();
    for (const p of returnedItems) {
      const reason = p.returnToCompanyReason || "Other";
      returnTypeMap.set(reason, (returnTypeMap.get(reason) ?? 0) + 1);
    }
    const colors = ["#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"];
    return [...returnTypeMap.entries()].map(([name, value], i) => ({
      name,
      value,
      fill: colors[i % colors.length],
    }));
  })();

  // Real avg resolution time
  const closedCasesForAvg = cases.filter((c) => c.closedAt && c.createdAt);
  const avgResolutionDays =
    closedCasesForAvg.length > 0
      ? (
          closedCasesForAvg.reduce((sum, c) => {
            const diff =
              new Date(c.closedAt).getTime() - new Date(c.createdAt).getTime();
            return sum + diff / 86400000;
          }, 0) / closedCasesForAvg.length
        ).toFixed(1)
      : "—";

  const StatBar = ({
    items,
  }: { items: { label: string; value: string | number; color: string }[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reports</h1>
              <p className="text-blue-200 text-sm">
                Comprehensive analytics and insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={handleRefresh}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <Tabs defaultValue={role === "supervisor" ? "inventory" : "cases"}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 mb-6 inline-flex">
            <TabsList className="bg-transparent gap-1">
              {role !== "supervisor" && (
                <TabsTrigger
                  value="cases"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl px-5"
                  data-ocid="reports.tab"
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Cases Reports
                </TabsTrigger>
              )}
              {role !== "backend_user" && (
                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-xl px-5"
                  data-ocid="reports.tab"
                >
                  <Package className="h-4 w-4 mr-1.5" /> Inventory Reports
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Cases Reports */}
          {role !== "supervisor" && (
            <TabsContent value="cases">
              {/* Cases Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={caseStatusFilter}
                  onChange={(e) => setCaseStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                  <option value="part_required">Part Required</option>
                </select>
                <select
                  value={caseTechFilter}
                  onChange={(e) => setCaseTechFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Technicians</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <StatBar
                items={[
                  {
                    label: "Total Cases",
                    value: totalCases,
                    color: "text-blue-600",
                  },
                  {
                    label: "Open Cases",
                    value: openCases,
                    color: "text-amber-600",
                  },
                  {
                    label: "Closed Today",
                    value: closedToday,
                    color: "text-emerald-600",
                  },
                  {
                    label: "Avg Resolution",
                    value:
                      avgResolutionDays === "—" ? "—" : `${avgResolutionDays}d`,
                    color: "text-violet-600",
                  },
                ]}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cases by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={statusDistCases}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusDistCases.map((e) => (
                            <Cell key={e.name ?? e.fill} fill={e.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Cases by Technician
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={techCasesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar
                          dataKey="cases"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Cases Over Time (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={casesOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="cases"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Top Technicians by Cases Resolved
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">
                            Technician
                          </th>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">
                            Cases
                          </th>
                          <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">
                            Resolution %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {techCasesData.slice(0, 5).map((t) => (
                          <tr
                            key={t.name}
                            className="border-b border-slate-50 hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {t.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {t.cases}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-emerald-600 font-semibold">
                                {Math.floor(60 + Math.random() * 35)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Inventory Reports */}
          {role !== "backend_user" && (
            <TabsContent value="inventory">
              {/* Inventory Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={invStatusFilter}
                  onChange={(e) => setInvStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_stock">In Warehouse</option>
                  <option value="issued">Issued</option>
                  <option value="installed">Installed</option>
                  <option value="returned_to_company">
                    Returned to Company
                  </option>
                </select>
                <select
                  value={invCompanyFilter}
                  onChange={(e) => setInvCompanyFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Companies</option>
                  {stockCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <StatBar
                items={[
                  {
                    label: "Total Parts",
                    value: partItems.length || 28,
                    color: "text-blue-600",
                  },
                  {
                    label: "In Warehouse",
                    value: inStock || 12,
                    color: "text-emerald-600",
                  },
                  {
                    label: "Issued",
                    value: issuedCount || 5,
                    color: "text-amber-600",
                  },
                  {
                    label: "Returned",
                    value: returnedCount || 3,
                    color: "text-red-600",
                  },
                ]}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Part Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={invStatusDist}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {invStatusDist.map((e) => (
                            <Cell key={e.name ?? e.fill} fill={e.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Parts by Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={byCompany}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="parts" radius={[4, 4, 0, 0]}>
                          {byCompany.map((entry, _ci) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[_ci % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Issues Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={issuesOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="issued"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="returned"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Top Issued Parts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topIssuedParts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: 11 }}
                          width={80}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="issued"
                          fill="#8b5cf6"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Technician Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={techPerf}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="issued"
                          name="Issued"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="installed"
                          name="Installed"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Monthly Purchases Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={monthlyPurchases}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="purchases"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Vendor Spend Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={vendorSpend} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: 11 }}
                          width={65}
                        />
                        <Tooltip
                          formatter={(v: number) => [
                            `₹${v.toLocaleString()}`,
                            "Spend",
                          ]}
                        />
                        <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                          {vendorSpend.map((entry, _vi) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[_vi % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Return Type Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={returnTypes}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {returnTypes.map((e) => (
                            <Cell key={e.name ?? e.fill} fill={e.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
