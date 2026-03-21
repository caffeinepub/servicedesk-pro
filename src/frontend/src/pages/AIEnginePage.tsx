import { Brain, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function AIEnginePage() {
  const {
    partItems,
    partLifecycle,
    stockPartNames,
    stockCompanies,

    technicians,
  } = useStore();

  const [lastUpdated] = useState(new Date().toLocaleTimeString());

  const refresh = () => {};

  // ── Derived AI data ────────────────────────────────────────────────────────
  const inStock = partItems.filter((p) => p.status === "in_stock");
  const issued = partItems.filter((p) => p.status === "issued");
  const installed = partItems.filter((p) => p.status === "installed");
  const returnedToCompany = partItems.filter(
    (p) => p.status === "returned_to_company",
  );

  // Parts issued per part name (demand)
  const demandByPart = stockPartNames.map((pn) => {
    const allItems = partItems.filter((p) => p.partNameId === pn.id);
    const issuedItems = partLifecycle.filter((lc) => {
      const item = partItems.find((p) => p.id === lc.partId);
      return item?.partNameId === pn.id && lc.action === "Issued";
    });
    const now = Date.now();
    const last30 = issuedItems.filter(
      (lc) => now - new Date(lc.timestamp).getTime() <= 30 * 86400000,
    ).length;
    const last60 = issuedItems.filter(
      (lc) => now - new Date(lc.timestamp).getTime() <= 60 * 86400000,
    ).length;
    const last90 = issuedItems.filter(
      (lc) => now - new Date(lc.timestamp).getTime() <= 90 * 86400000,
    ).length;
    const stockCount = allItems.filter((p) => p.status === "in_stock").length;
    return {
      id: pn.id,
      name: pn.name,
      last30,
      last60,
      last90,
      predicted: Math.max(0, Math.round(last30 * 1.1)),
      trend: last60 > 0 ? (last30 / Math.max(last60 / 2, 0.1) - 1) * 100 : 0,
      stockCount,
      needsReorder: stockCount <= 2,
    };
  });

  const needsReorder = demandByPart.filter((d) => d.needsReorder);
  const deadStock = demandByPart.filter(
    (d) => d.last90 === 0 && d.stockCount > 0,
  );
  const activeDemand = demandByPart.filter((d) => d.last30 > 0);

  // Inventory health score
  const totalParts = partItems.length;
  const healthScore =
    totalParts === 0
      ? 100
      : Math.round(((inStock.length + installed.length) / totalParts) * 100);

  // Technician insights
  const techInsights = technicians
    .filter((t) => t.isActive)
    .map((tech) => {
      const techIssues = partLifecycle.filter(
        (lc) =>
          lc.action === "Issued" &&
          partItems.find((p) => p.id === lc.partId)?.technicianId === tech.id,
      );
      const now = Date.now();
      const last30 = techIssues.filter(
        (lc) => now - new Date(lc.timestamp).getTime() <= 30 * 86400000,
      ).length;
      const totalIssued = techIssues.length;
      const returnedCount = partItems.filter(
        (p) =>
          p.technicianId === tech.id &&
          (p.status === "returned_to_store" || p.status === "in_stock") &&
          p.returnedToStoreAt,
      ).length;
      const returnRate =
        totalIssued > 0 ? Math.round((returnedCount / totalIssued) * 100) : 0;

      // Most used part
      const partCounts: Record<string, number> = {};
      for (const p of partItems.filter((p) => p.technicianId === tech.id)) {
        partCounts[p.partNameId] = (partCounts[p.partNameId] ?? 0) + 1;
      }
      const mostUsedId = Object.entries(partCounts).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0];
      const mostUsedPart =
        stockPartNames.find((pn) => pn.id === mostUsedId)?.name ?? "N/A";

      return {
        ...tech,
        totalIssued,
        last30,
        avgPerWeek: Math.round((totalIssued / 52) * 10) / 10,
        mostUsedPart,
        returnRate,
        activityLevel: last30 >= 3 ? "High" : last30 >= 1 ? "Medium" : "Low",
      };
    });

  const topTech = [...techInsights].sort(
    (a, b) => b.totalIssued - a.totalIssued,
  )[0];

  // Status distribution for pie
  const statusData = [
    { name: "In Stock", value: inStock.length },
    { name: "Issued", value: issued.length },
    { name: "Installed", value: installed.length },
    { name: "Returned", value: returnedToCompany.length },
  ].filter((d) => d.value > 0);

  // Company distribution
  const companyData = stockCompanies.map((c) => ({
    name: c.name,
    stock: partItems.filter(
      (p) => p.companyId === c.id && p.status === "in_stock",
    ).length,
  }));

  // AI alerts
  const aiAlerts = [
    ...needsReorder.map((d) => ({
      type: "reorder" as const,
      message: `${d.name} is below reorder threshold (${d.stockCount} units left)`,
      color: "border-l-red-500 bg-red-50",
      label: "Low Stock",
      labelColor: "bg-red-100 text-red-700",
    })),
    ...deadStock.map((d) => ({
      type: "dead" as const,
      message: `${d.name} has ${d.stockCount} units in stock with no demand in 90 days`,
      color: "border-l-amber-500 bg-amber-50",
      label: "Dead Stock",
      labelColor: "bg-amber-100 text-amber-700",
    })),
    ...activeDemand.slice(0, 2).map((d) => ({
      type: "demand" as const,
      message: `${d.name} has strong demand: ${d.last30} issues in last 30 days`,
      color: "border-l-green-500 bg-green-50",
      label: "High Demand",
      labelColor: "bg-green-100 text-green-700",
    })),
  ];

  // Health ring SVG
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (healthScore / 100) * circumference;
  const healthColor =
    healthScore >= 80 ? "#10b981" : healthScore >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" /> AI Intelligence Engine
          </h1>
          <p className="text-sm text-slate-500">
            Powered by historical usage analysis • Last updated: {lastUpdated}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="demand">Demand</TabsTrigger>
          <TabsTrigger value="dead-stock">Dead Stock</TabsTrigger>
          <TabsTrigger value="reorder">Reorder</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Parts Need Reorder",
                value: needsReorder.length,
                color: "text-red-600",
                bg: "bg-red-50",
              },
              {
                label: "Dead Stock Items",
                value: deadStock.length,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Active Demand",
                value: activeDemand.length,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Inventory Health",
                value: `${healthScore}/100`,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
            ].map((kpi) => (
              <Card key={kpi.label} className={`shadow-sm ${kpi.bg}`}>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>
                    {kpi.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {topTech && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Most Active Technician
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {topTech.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {topTech.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {topTech.totalIssued} parts issued •{" "}
                      {topTech.mostUsedPart}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        topTech.activityLevel === "High"
                          ? "bg-green-100 text-green-700"
                          : topTech.activityLevel === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {topTech.activityLevel} Activity
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {aiAlerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">AI Alerts</p>
              {aiAlerts.map((alert) => (
                <div
                  key={alert.message.slice(0, 20)}
                  className={`border-l-4 ${alert.color} rounded-r-lg p-3 flex items-start gap-2`}
                >
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      alert.labelColor
                    }`}
                  >
                    {alert.label}
                  </span>
                  <span className="text-sm text-slate-700">
                    {alert.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Demand Tab */}
        <TabsContent value="demand" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demandByPart.map((d) => (
              <Card key={d.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{d.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "30 days", value: d.last30 },
                      { label: "60 days", value: d.last60 },
                      { label: "90 days", value: d.last90 },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-lg font-bold text-slate-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        Predicted next month
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {d.predicted}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {d.trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : d.trend < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                      <span
                        className={`text-xs font-medium ${
                          d.trend > 0
                            ? "text-green-600"
                            : d.trend < 0
                              ? "text-red-600"
                              : "text-slate-400"
                        }`}
                      >
                        {d.trend === 0
                          ? "Stable"
                          : `${d.trend > 0 ? "+" : ""}${d.trend.toFixed(0)}%`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Dead Stock Tab */}
        <TabsContent value="dead-stock" className="mt-4 space-y-4">
          {deadStock.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-800">
                {deadStock.length} part type{deadStock.length !== 1 ? "s" : ""}{" "}
                with no demand in 90 days. Consider returning to vendor or
                discounting.
              </p>
            </div>
          )}
          {deadStock.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No dead stock found. Great job!
            </p>
          ) : (
            <div className="space-y-2">
              {deadStock.map((d) => (
                <Card key={d.id} className="shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{d.name}</p>
                      <p className="text-xs text-slate-500">
                        {d.stockCount} unit{d.stockCount !== 1 ? "s" : ""} in
                        stock • 0 issues in 90 days
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                      Dead Stock
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reorder Tab */}
        <TabsContent value="reorder" className="mt-4 space-y-3">
          {needsReorder.length === 0 ? (
            <p className="text-slate-500 text-sm">
              All parts are above minimum stock levels.
            </p>
          ) : (
            needsReorder.map((d) => {
              const urgency =
                d.stockCount === 0
                  ? "critical"
                  : d.stockCount <= 1
                    ? "high"
                    : "medium";
              const urgencyStyle = {
                critical: "bg-red-100 text-red-700",
                high: "bg-orange-100 text-orange-700",
                medium: "bg-amber-100 text-amber-700",
              }[urgency];
              return (
                <Card key={d.id} className="shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{d.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            urgencyStyle
                          }`}
                        >
                          {urgency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current stock: {d.stockCount} • Suggested order:{" "}
                        {Math.max(5 - d.stockCount, 3)} units
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      Order {Math.max(5 - d.stockCount, 3)}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Technicians Tab */}
        <TabsContent value="technicians" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techInsights.map((tech) => (
              <Card key={tech.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {tech.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {tech.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tech.activityLevel === "High"
                            ? "bg-green-100 text-green-700"
                            : tech.activityLevel === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tech.activityLevel} Activity
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Total Issued</p>
                      <p className="font-semibold">{tech.totalIssued}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Last 30 Days</p>
                      <p className="font-semibold">{tech.last30}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Avg/Week</p>
                      <p className="font-semibold">{tech.avgPerWeek}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Return Rate</p>
                      <p className="font-semibold">{tech.returnRate}%</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400">Most Used Part</p>
                    <p className="text-sm font-medium text-blue-600">
                      {tech.mostUsedPart}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center">
                <p className="text-sm font-semibold text-slate-600 mb-4">
                  Inventory Health Score
                </p>
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 140 140"
                  role="img"
                  aria-label="Inventory health score"
                >
                  <title>Inventory Health Score</title>
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                  />
                  <text
                    x="70"
                    y="74"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill={healthColor}
                  >
                    {healthScore}
                  </text>
                  <text
                    x="70"
                    y="90"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#94a3b8"
                  >
                    out of 100
                  </text>
                </svg>
                <div className="grid grid-cols-2 gap-3 mt-4 w-full text-sm">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-600">
                      {inStock.length}
                    </p>
                    <p className="text-xs text-slate-500">In Stock</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-amber-600">
                      {issued.length}
                    </p>
                    <p className="text-xs text-slate-500">Issued</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {installed.length}
                    </p>
                    <p className="text-xs text-slate-500">Installed</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-red-600">
                      {returnedToCompany.length}
                    </p>
                    <p className="text-xs text-slate-500">Returned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stock by Company</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={companyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
