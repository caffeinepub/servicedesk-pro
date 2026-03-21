import { BarChart2, Download, RefreshCw } from "lucide-react";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { getAgeing, useStore } from "../store";
import type { CaseStatus } from "../types";

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const {
    cases,
    technicians,
    partItems,
    stockCompanies,
    stockCategories,
    purchaseEntries,
    vendors,
  } = useStore();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTech, setFilterTech] = useState("all");
  const [lastUpdated] = useState(new Date().toLocaleTimeString());

  const filtered = cases.filter((c) => {
    const cd = new Date(c.createdAt);
    const matchFrom = !fromDate || cd >= new Date(fromDate);
    const matchTo = !toDate || cd <= new Date(`${toDate}T23:59:59`);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchTech = filterTech === "all" || c.technicianId === filterTech;
    return matchFrom && matchTo && matchStatus && matchTech;
  });

  const stats = {
    total: filtered.length,
    closed: filtered.filter((c) =>
      ["closed", "adjustment_closed", "replacement_done"].includes(c.status),
    ).length,
    pending: filtered.filter((c) => c.status === "pending").length,
    partRequired: filtered.filter((c) => c.status === "part_required").length,
    cancelled: filtered.filter((c) => c.status === "cancelled").length,
    overdue: filtered.filter(
      (c) =>
        ![
          "closed",
          "cancelled",
          "transferred",
          "adjustment_closed",
          "replacement_done",
        ].includes(c.status) && getAgeing(c.createdAt) >= 8,
    ).length,
  };

  // Inventory stats
  const invStats = {
    totalInstances: partItems.length,
    totalIssues: partItems.filter(
      (p) => p.status === "issued" || p.status === "installed" || p.issueDate,
    ).length,
    totalReturns: partItems.filter((p) => p.status === "returned_to_company")
      .length,
    totalPurchases: purchaseEntries.length,
    warehouseValue: purchaseEntries.reduce(
      (a, p) => a + (p.costPrice || 0) * (p.quantity || 0),
      0,
    ),
  };

  // Status distribution pie data
  const statusData = [
    {
      name: "In Stock",
      value: partItems.filter((p) => p.status === "in_stock").length,
    },
    {
      name: "Issued",
      value: partItems.filter((p) => p.status === "issued").length,
    },
    {
      name: "Installed",
      value: partItems.filter((p) => p.status === "installed").length,
    },
    {
      name: "Returned",
      value: partItems.filter((p) => p.status === "returned_to_company").length,
    },
  ].filter((d) => d.value > 0);

  // Company distribution bar data
  const companyData = stockCompanies.map((c) => ({
    name: c.name,
    parts: partItems.filter((p) => p.companyId === c.id).length,
  }));

  // Category distribution
  const categoryData = stockCategories.map((c) => ({
    name: c.name,
    parts: partItems.filter((p) => p.categoryId === c.id).length,
  }));

  // Vendor spend data
  const vendorData = vendors.map((v) => {
    const purchases = purchaseEntries.filter(
      (p) => p.vendorId === v.id || p.vendorName === v.name,
    );
    return {
      name: v.name.length > 12 ? `${v.name.slice(0, 12)}...` : v.name,
      spend: purchases.reduce(
        (a, p) => a + (p.costPrice || 0) * (p.quantity || 0),
        0,
      ),
    };
  });

  // Monthly purchases
  const monthlyData = (() => {
    const map: Record<string, number> = {};
    for (const p of purchaseEntries) {
      const month = p.invoiceDate?.slice(0, 7) ?? "Unknown";
      map[month] = (map[month] ?? 0) + p.quantity;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, qty]) => ({ month, qty }));
  })();

  // Case status distribution for pie
  const caseStatusData = [
    {
      name: "Closed",
      value: filtered.filter((c) =>
        ["closed", "adjustment_closed", "replacement_done"].includes(c.status),
      ).length,
    },
    {
      name: "Pending",
      value: filtered.filter((c) => c.status === "pending").length,
    },
    {
      name: "Active",
      value: filtered.filter(
        (c) =>
          ![
            "closed",
            "cancelled",
            "transferred",
            "adjustment_closed",
            "replacement_done",
          ].includes(c.status),
      ).length,
    },
    {
      name: "Cancelled",
      value: filtered.filter((c) => c.status === "cancelled").length,
    },
  ].filter((d) => d.value > 0);

  const exportCSV = () => {
    const headers = [
      "Case ID",
      "Customer",
      "Phone",
      "Address",
      "Product",
      "Product Type",
      "Complaint Type",
      "Status",
      "Technician",
      "Part Name",
      "Part Code",
      "PO Number",
      "Order Date",
      "Received Date",
      "Remarks",
      "Ageing (days)",
      "Created At",
      "Closed At",
    ];
    const rows = filtered.map((c) => [
      c.caseId,
      c.customerName,
      c.phone,
      c.address,
      c.product,
      c.productType,
      c.complaintType,
      c.status,
      technicians.find((t) => t.id === c.technicianId)?.name ?? "",
      c.partName,
      c.partCode,
      c.poNumber,
      c.orderDate,
      c.receivedDate,
      c.remarks,
      getAgeing(c.createdAt),
      new Date(c.createdAt).toLocaleDateString("en-IN"),
      c.closedAt ? new Date(c.closedAt).toLocaleDateString("en-IN") : "",
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `service-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" /> Reports
          </h1>
          <p className="text-xs text-slate-400">Last updated: {lastUpdated}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-36 text-xs"
          />
          <span className="text-slate-400 text-sm">to</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-36 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={exportCSV}
            data-ocid="reports.primary_button"
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-ocid="reports.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {[
              "new",
              "pending",
              "on_route",
              "closed",
              "part_required",
              "cancelled",
            ].map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTech} onValueChange={setFilterTech}>
          <SelectTrigger className="w-44" data-ocid="reports.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview" data-ocid="reports.tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="issues-returns" data-ocid="reports.tab">
            Issues &amp; Returns
          </TabsTrigger>
          <TabsTrigger value="inventory" data-ocid="reports.tab">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="purchases" data-ocid="reports.tab">
            Purchases
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Case KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Total Cases",
                value: stats.total,
                color: "text-slate-700",
              },
              { label: "Closed", value: stats.closed, color: "text-green-600" },
              {
                label: "Pending",
                value: stats.pending,
                color: "text-amber-600",
              },
              {
                label: "Part Required",
                value: stats.partRequired,
                color: "text-orange-600",
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                color: "text-red-600",
              },
              { label: "Overdue", value: stats.overdue, color: "text-red-700" },
            ].map((s) => (
              <Card key={s.label} className="shadow-sm">
                <CardContent className="p-3">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  Case Status Distribution
                  <button type="button" title="Download" onClick={exportCSV}>
                    <Download className="h-4 w-4 text-slate-400" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={caseStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {caseStatusData.map((entry, index) => (
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

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Parts by Company</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={companyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="parts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Filtered Cases Summary ({filtered.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {[
                        "Case ID",
                        "Customer",
                        "Product",
                        "Status",
                        "Technician",
                        "Ageing",
                        "Created",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2 text-slate-600 font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 20).map((c, i) => (
                      <tr
                        key={c.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                        data-ocid={`reports.row.${i + 1}`}
                      >
                        <td className="px-4 py-2 font-mono text-xs font-semibold text-blue-600">
                          {c.caseId}
                        </td>
                        <td className="px-4 py-2">{c.customerName}</td>
                        <td className="px-4 py-2 text-slate-600">
                          {c.product}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          {technicians.find((t) => t.id === c.technicianId)
                            ?.name ?? "-"}
                        </td>
                        <td className="px-4 py-2 text-slate-500">
                          {getAgeing(c.createdAt)}d
                        </td>
                        <td className="px-4 py-2 text-slate-500 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues & Returns Tab */}
        <TabsContent value="issues-returns" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Instances",
                value: invStats.totalInstances,
                color: "text-slate-700",
              },
              {
                label: "Total Issues",
                value: invStats.totalIssues,
                color: "text-amber-600",
              },
              {
                label: "Returns to Co.",
                value: invStats.totalReturns,
                color: "text-red-600",
              },
              {
                label: "Total Purchases",
                value: invStats.totalPurchases,
                color: "text-blue-600",
              },
            ].map((s) => (
              <Card key={s.label} className="shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Part Status Distribution
                </CardTitle>
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
                      label={({ name }) => name}
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

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Return Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: "Returned to Store",
                        count: partItems.filter((p) => p.returnedToStoreAt)
                          .length,
                      },
                      {
                        name: "Returned to Co.",
                        count: partItems.filter(
                          (p) => p.status === "returned_to_company",
                        ).length,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Warehouse Value</CardTitle>
                <p className="text-xl font-bold text-green-600">
                  ₹{invStats.warehouseValue.toLocaleString()}
                </p>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stock by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="parts" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stock by Company</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={companyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="parts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Monthly Purchases (Units)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vendor Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={vendorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="spend" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
