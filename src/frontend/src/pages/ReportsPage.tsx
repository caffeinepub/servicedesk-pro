import { BarChart2, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getAgeing, useStore } from "../store";
import type { CaseStatus } from "../types";

export default function ReportsPage() {
  const { cases, technicians } = useStore();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTech, setFilterTech] = useState("all");

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
    a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const STATUSES: CaseStatus[] = [
    "new",
    "printed",
    "confirmed",
    "pending",
    "on_route",
    "cancelled",
    "transferred",
    "rescheduled",
    "part_required",
    "part_received",
    "re_open",
    "gas_charge_pending",
    "gas_charge_done",
    "adjustment_closed",
    "replacement_done",
    "closed",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500">Export and analyze case data</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Filter Data
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Technician</Label>
            <Select value={filterTech} onValueChange={setFilterTech}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-blue-600" },
          { label: "Closed", value: stats.closed, color: "text-green-600" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600" },
          {
            label: "Part Required",
            value: stats.partRequired,
            color: "text-red-600",
          },
          {
            label: "Cancelled",
            value: stats.cancelled,
            color: "text-gray-600",
          },
          { label: "Overdue", value: stats.overdue, color: "text-red-700" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Technician Breakdown */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Technician Performance
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {[
                "Technician",
                "Specialization",
                "Total Assigned",
                "Completed",
                "Pending",
                "Part Required",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => {
              const tCases = filtered.filter((c) => c.technicianId === t.id);
              if (tCases.length === 0) return null;
              return (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.specialization}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-bold">
                    {tCases.length}
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    {
                      tCases.filter((c) =>
                        [
                          "closed",
                          "adjustment_closed",
                          "replacement_done",
                        ].includes(c.status),
                      ).length
                    }
                  </td>
                  <td className="px-4 py-3 text-yellow-600">
                    {tCases.filter((c) => c.status === "pending").length}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    {tCases.filter((c) => c.status === "part_required").length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Button onClick={exportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export {filtered.length} Cases to CSV
        </Button>
        <p className="text-sm text-gray-500 self-center">
          {filtered.length} cases in current filter
        </p>
      </div>
    </div>
  );
}
