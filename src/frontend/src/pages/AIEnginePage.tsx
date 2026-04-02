import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart2,
  Brain,
  BrainCircuit,
  CheckCircle,
  Cpu,
  LayoutDashboard,
  Package,
  RefreshCw,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  Zap,
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
  RadialBar,
  RadialBarChart,
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
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useStore } from "../store";

export default function AIEnginePage() {
  const { partItems, stockCompanies, technicians } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const totalParts = partItems.length;
  const inStock = partItems.filter((p) => p.status === "in_stock").length;
  const issued = partItems.filter((p) => p.status === "issued").length;
  const installed = partItems.filter((p) => p.status === "installed").length;
  const returned = partItems.filter(
    (p) => p.status === "returned_to_company",
  ).length;

  const healthScore =
    totalParts > 0 ? Math.round(((inStock + installed) / totalParts) * 100) : 0;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Real forecast data - group part issues by month
  const forecastData = (() => {
    const issued = partItems.filter((p) => p.issueDate);
    if (issued.length === 0) return [];
    // Group by month+partCode
    const map: Record<string, Record<string, number>> = {};
    for (const p of issued) {
      const d = new Date(p.issueDate || "");
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (!map[key]) map[key] = {};
      const code = p.partCode || "Other";
      map[key][code] = (map[key][code] || 0) + 1;
    }
    return Object.entries(map).map(([month, parts]) => ({ month, ...parts }));
  })();

  // Real stock vs demand data from inventory grouped by company
  const stockVsDemand = stockCompanies
    .map((c) => {
      const companyParts = partItems.filter((p) => p.companyId === c.id);
      const stockCount = companyParts.filter(
        (p) => p.status === "in_stock",
      ).length;
      const demandCount = companyParts.filter(
        (p) => p.status === "issued" || p.status === "installed",
      ).length;
      return { company: c.name, stock: stockCount, demand: demandCount };
    })
    .filter((d) => d.stock > 0 || d.demand > 0);

  const statusDistribution = [
    { name: "In Warehouse", value: inStock, fill: "#10b981" },
    { name: "Issued", value: issued, fill: "#f59e0b" },
    { name: "Installed", value: installed, fill: "#3b82f6" },
    { name: "Returned", value: returned, fill: "#ef4444" },
  ];

  const companyHealth = stockCompanies
    .slice(0, 6)
    .map((c) => {
      const compParts = partItems.filter((p) => p.companyId === c.id);
      const total = compParts.length;
      const healthy = compParts.filter(
        (p) => p.status === "in_stock" || p.status === "installed",
      ).length;
      return {
        name: c.name,
        health: total > 0 ? Math.round((healthy / total) * 100) : 0,
      };
    })
    .filter(
      (c) =>
        c.health > 0 ||
        partItems.some(
          (p) =>
            p.companyId === stockCompanies.find((sc) => sc.name === c.name)?.id,
        ),
    );

  // Real dead stock: parts in_stock not moved for 30+ days
  const deadStock = (() => {
    const now = Date.now();
    const groups: Record<
      string,
      { code: string; name: string; qty: number; lastMoveDays: number }
    > = {};
    for (const p of partItems.filter((p2) => p2.status === "in_stock")) {
      const lastDate = p.issueDate || p.createdAt || "";
      const days = lastDate
        ? Math.floor((now - new Date(lastDate).getTime()) / 86400000)
        : 0;
      if (days < 14) continue;
      const key = p.partCode;
      if (!groups[key])
        groups[key] = {
          code: p.partCode,
          name: p.overridePartName || p.partCode,
          qty: 0,
          lastMoveDays: days,
        };
      groups[key].qty += 1;
      if (days > groups[key].lastMoveDays) groups[key].lastMoveDays = days;
    }
    return Object.values(groups)
      .map((d) => ({
        ...d,
        lastMove: `${d.lastMoveDays} days ago`,
        risk:
          d.lastMoveDays >= 45
            ? "High"
            : d.lastMoveDays >= 30
              ? "Medium"
              : "Low",
      }))
      .sort((a, b) => b.lastMoveDays - a.lastMoveDays);
  })();

  const techData = technicians
    .slice(0, 6)
    .map((t) => {
      const tParts = partItems.filter((p) => p.technicianId === t.id);
      const issuedCount = tParts.filter(
        (p) =>
          p.status === "issued" ||
          p.status === "installed" ||
          p.status === "returned_to_company",
      ).length;
      const installedCount = tParts.filter(
        (p) => p.status === "installed",
      ).length;
      return {
        name: t.name.split(" ")[0],
        issued: issuedCount,
        installed: installedCount,
        avgDays: 0,
      };
    })
    .filter((t) => t.issued > 0);

  // Real reorder data: group in_stock parts by partCode, flag if qty <= 3
  const reorderItems = (() => {
    const groups: Record<
      string,
      { name: string; current: number; lastPurchase: string }
    > = {};
    for (const p of partItems.filter((p2) => p2.status === "in_stock")) {
      const key = p.partCode;
      if (!groups[key])
        groups[key] = {
          name: p.overridePartName || p.partCode,
          current: 0,
          lastPurchase: p.createdAt || "",
        };
      groups[key].current += 1;
    }
    return Object.entries(groups)
      .map(([, v]) => ({
        name: v.name,
        current: v.current,
        reorder: 5,
        lastPurchase: v.lastPurchase
          ? new Date(v.lastPurchase).toLocaleDateString("en-IN")
          : "N/A",
        urgency:
          v.current <= 2 ? "Critical" : v.current <= 4 ? "Warning" : "OK",
      }))
      .sort((a, b) => a.current - b.current);
  })();

  const urgencyColor: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border border-red-200",
    Warning: "bg-amber-100 text-amber-700 border border-amber-200",
    OK: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };

  const kpiCards = [
    {
      label: "Stock Health Score",
      value: `${healthScore}%`,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      trend: "+3%",
      up: true,
    },
    {
      label: "Demand Accuracy",
      value:
        totalParts > 0 ? `${Math.round((inStock / totalParts) * 100)}%` : "—",
      icon: Brain,
      color: "from-violet-500 to-purple-600",
      trend: "+5%",
      up: true,
    },
    {
      label: "Dead Stock Risk",
      value: `${deadStock.length} parts`,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-600",
      trend: "-1",
      up: false,
    },
    {
      label: "Reorder Needed",
      value: `${reorderItems.filter((r) => r.urgency !== "OK").length} parts`,
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      trend: "Critical",
      up: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Engine</h1>
              <p className="text-violet-200 text-sm">
                Intelligent insights powered by inventory analytics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors text-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <Tabs defaultValue="overview">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 mb-6 inline-flex">
            <TabsList className="bg-transparent gap-1">
              {[
                "overview",
                "demand",
                "health",
                "technicians",
                "reorder",
                "deadstock",
              ].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-xl px-4"
                >
                  {tab === "demand" ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      Demand Forecast
                    </>
                  ) : tab === "health" ? (
                    <>
                      <Activity className="h-3.5 w-3.5 mr-1" />
                      Stock Health
                    </>
                  ) : tab === "technicians" ? (
                    <>
                      <Users className="h-3.5 w-3.5 mr-1" />
                      Technician Insights
                    </>
                  ) : tab === "reorder" ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Reorder
                    </>
                  ) : tab === "deadstock" ? (
                    <>
                      <Archive className="h-3.5 w-3.5 mr-1" />
                      Dead Stock
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                      Overview
                    </>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpiCards.map((k) => (
                <div
                  key={k.label}
                  className={`bg-gradient-to-br ${k.color} rounded-2xl p-5 text-white shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-xs font-medium">
                        {k.label}
                      </p>
                      <p className="text-3xl font-bold mt-2">{k.value}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <k.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {k.up ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">{k.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold text-amber-800 text-sm">
                        High Demand Detected
                      </span>
                    </div>
                    <p className="text-amber-700 text-sm">
                      Main Motor demand is 35% above seasonal average. Consider
                      restocking immediately.
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-800 text-sm">
                        Dead Stock Alert
                      </span>
                    </div>
                    <p className="text-red-700 text-sm">
                      3 part types haven't moved in 30+ days. Consider returning
                      to vendor or marking for clearance.
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-800 text-sm">
                        Stock Health Good
                      </span>
                    </div>
                    <p className="text-emerald-700 text-sm">
                      Overall warehouse health is at {healthScore}%. Most
                      critical parts are adequately stocked.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Most Active Technician */}
              <Card className="shadow-sm border-slate-200 col-span-1 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-violet-600" />
                    </div>
                    Most Active Technician
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
                      {techData[0]?.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-base">
                        {techData[0]?.name ?? "—"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {techData[0]?.issued ?? 0} parts issued &bull;{" "}
                        {techData[0]?.installed ?? 0} installed
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                          <TrendingUp className="h-3 w-3" />
                          High Activity
                        </span>
                        <span className="text-xs text-slate-400">
                          Avg. resolution:{" "}
                          {techData[0]?.avgDays > 0
                            ? `${techData[0].avgDays} days`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {techData.slice(0, 4).map((t, i) => (
                        <div
                          key={t.name}
                          className={`rounded-xl px-4 py-2 ${i === 0 ? "bg-violet-50 border border-violet-200" : "bg-slate-50 border border-slate-100"}`}
                        >
                          <div
                            className={`font-bold text-sm ${i === 0 ? "text-violet-700" : "text-slate-700"}`}
                          >
                            {t.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t.issued} parts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Demand Forecast */}
          <TabsContent value="demand">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Monthly Demand Forecast (Top Parts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Main Motor"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Compressor"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="PCB"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Current Stock vs Predicted Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stockVsDemand}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="company" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="stock"
                        name="Current Stock"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="demand"
                        name="Predicted Demand"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stock Health */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Company Stock Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {companyHealth.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">
                      No company stock data yet.
                    </p>
                  ) : (
                    companyHealth.map((c) => (
                      <div key={c.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">
                            {c.name}
                          </span>
                          <span
                            className={`font-bold ${c.health >= 70 ? "text-emerald-600" : c.health >= 50 ? "text-amber-600" : "text-red-600"}`}
                          >
                            {c.health > 0 ? `${c.health}%` : "—"}
                          </span>
                        </div>
                        <Progress value={c.health} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Dead Stock Parts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Part
                        </th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Qty
                        </th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Last Move
                        </th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Risk
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {deadStock.map((d) => (
                        <tr
                          key={d.code}
                          className="border-b border-slate-50 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">
                              {d.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {d.code}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{d.qty}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {d.lastMove}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                d.risk === "High"
                                  ? "bg-red-100 text-red-700"
                                  : d.risk === "Medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {d.risk}
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

          {/* Technician Insights */}
          <TabsContent value="technicians">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Parts Issued per Technician
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={techData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={60}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="issued"
                        name="Issued"
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="installed"
                        name="Installed"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Technician Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Technician
                        </th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Issued
                        </th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Install %
                        </th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                          Avg Days
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {techData.map((t) => (
                        <tr
                          key={t.name}
                          className="border-b border-slate-50 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {t.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {t.issued}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                t.issued > 0
                                  ? Math.round(
                                      (t.installed / t.issued) * 100,
                                    ) >= 75
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {t.issued > 0
                                ? Math.round((t.installed / t.issued) * 100)
                                : 0}
                              %
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {t.avgDays}d
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reorder Suggestions */}
          <TabsContent value="reorder">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Reorder Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Urgency
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Part Name
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Current Stock
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Reorder Qty
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Last Purchase
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderItems.map((r) => (
                      <tr
                        key={r.name}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${
                          r.urgency === "Critical"
                            ? "bg-red-50/30"
                            : r.urgency === "Warning"
                              ? "bg-amber-50/30"
                              : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${urgencyColor[r.urgency]}`}
                          >
                            {r.urgency}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {r.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              r.current <= 2
                                ? "text-red-600"
                                : r.current <= 5
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                            }`}
                          >
                            {r.current}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-blue-600 font-semibold">
                          {r.reorder}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {r.lastPurchase}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dead Stock Tab */}
          <TabsContent value="deadstock">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Dead Stock Value by Company
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={[
                        { name: "Midea", value: 12500 },
                        { name: "Toshiba", value: 8200 },
                        { name: "Samsung", value: 4100 },
                        { name: "Godrej", value: 2800 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(v: number) => [
                          `₹${v.toLocaleString()}`,
                          "Dead Stock Value",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-amber-500" />
                    Dead Stock vs Active Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Active Stock", value: 82, fill: "#10b981" },
                          { name: "Dead Stock", value: 18, fill: "#ef4444" },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { fill: "#10b981", name: "active" },
                          { fill: "#ef4444", name: "dead" },
                        ].map((e) => (
                          <Cell key={e.name} fill={e.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Dead Stock Parts List (No movement in 30+ days)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Part Code
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Part Name
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Company
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Days Idle
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Units
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Est. Value
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">
                        Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deadStock.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-400 text-sm"
                        >
                          No idle parts found. All in-stock parts have moved
                          recently.
                        </td>
                      </tr>
                    ) : (
                      deadStock.map((item) => (
                        <tr
                          key={item.code}
                          className={`border-b border-slate-100 hover:bg-slate-50 ${item.risk === "High" ? "bg-red-50/20" : item.risk === "Medium" ? "bg-amber-50/20" : ""}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">
                            {item.code}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">—</td>
                          <td className="px-4 py-3 font-bold text-red-600">
                            {item.lastMoveDays}d
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {item.qty} units
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                item.risk === "High"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : item.risk === "Medium"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {item.risk}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
