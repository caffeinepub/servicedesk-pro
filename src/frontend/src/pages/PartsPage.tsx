import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getAgeing, useStore } from "../store";

type PartTab = "part_required" | "part_ordered" | "part_received";

const CLOSED_STATUSES = [
  "closed",
  "cancelled",
  "transferred",
  "adjustment_closed",
  "replacement_done",
  "gas_charge_done",
];

export default function PartsPage() {
  const {
    cases,
    technicians,
    navigate,
    updateCase,
    changeStatus,
    addAuditEntry,
    currentUser,
  } = useStore();
  const [tab, setTab] = useState<PartTab>("part_required");
  const [poDialog, setPoDialog] = useState<string | null>(null);
  const [poNumber, setPoNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");

  const partCases = cases
    .filter((c) => {
      if (tab === "part_required") return c.status === "part_required";
      if (tab === "part_ordered") return c.status === "part_ordered";
      // Part Received: only show cases that are NOT closed
      if (tab === "part_received")
        return (
          c.status === "part_received" && !CLOSED_STATUSES.includes(c.status)
        );
      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const markOrdered = (caseId: string) => {
    changeStatus(caseId, "part_ordered", "Part ordered");
  };

  const markReceived = (caseId: string) => {
    changeStatus(caseId, "part_received", "Part received");
  };

  const markReopen = (caseId: string) => {
    changeStatus(caseId, "re_open", "Case re-opened after part received");
    changeStatus(caseId, "on_route", "Back on route after part arrived");
  };

  const savePO = (caseId: string) => {
    updateCase(caseId, { poNumber, orderDate });
    addAuditEntry({
      caseId,
      userId: currentUser?.id ?? "",
      userName: currentUser?.name ?? "",
      action: "PO Updated",
      details: `PO: ${poNumber}, Order Date: ${orderDate}`,
    });
    setPoDialog(null);
    setPoNumber("");
    setOrderDate("");
  };

  const tabs: { key: PartTab; label: string; color: string; count: number }[] =
    [
      {
        key: "part_required",
        label: "Part Required",
        color: "bg-red-600",
        count: cases.filter((c) => c.status === "part_required").length,
      },
      {
        key: "part_ordered",
        label: "Part Ordered",
        color: "bg-blue-600",
        count: cases.filter((c) => c.status === "part_ordered").length,
      },
      {
        key: "part_received",
        label: "Part Received",
        color: "bg-green-600",
        count: cases.filter(
          (c) =>
            c.status === "part_received" && !CLOSED_STATUSES.includes(c.status),
        ).length,
      },
    ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Parts Tracking</h2>
        <p className="text-sm text-gray-500">
          Track part requirements and delivery status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Part Required",
            value: cases.filter((c) => c.status === "part_required").length,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Part Ordered",
            value: cases.filter((c) => c.status === "part_ordered").length,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Part Received",
            value: cases.filter(
              (c) =>
                c.status === "part_received" &&
                !CLOSED_STATUSES.includes(c.status),
            ).length,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`${c.bg} rounded-xl p-4 border border-white shadow-sm`}
          >
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 3 Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-2 ${
              tab === t.key
                ? `${t.color} text-white shadow-sm`
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {t.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {[
                  "Case ID",
                  "Customer",
                  "Product",
                  "Part Name",
                  "Part Code",
                  "PO Number",
                  "Order Date",
                  "Technician",
                  "Age",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-3 text-xs font-semibold text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partCases.map((c) => {
                const tech = technicians.find((t) => t.id === c.technicianId);
                const age = getAgeing(c.createdAt);
                return (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate("case-detail", c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate("case-detail", c.id);
                    }}
                  >
                    <td className="px-3 py-3 font-medium text-blue-700">
                      {c.caseId}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {c.customerName}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{c.product}</td>
                    <td className="px-3 py-3 font-medium text-orange-700">
                      {c.partName || "—"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 font-mono text-xs">
                      {c.partCode || "—"}
                    </td>
                    <td
                      className="px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {c.poNumber ? (
                        <span className="text-gray-700">{c.poNumber}</span>
                      ) : tab === "part_ordered" ? (
                        <button
                          type="button"
                          onClick={() => setPoDialog(c.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Enter PO
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs">
                      {c.orderDate
                        ? new Date(c.orderDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {tech?.name ?? "—"}
                    </td>
                    <td
                      className={`px-3 py-3 font-medium text-xs ${age >= 8 ? "text-red-600" : "text-yellow-600"}`}
                    >
                      {age}d
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td
                      className="px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {c.status === "part_required" && (
                        <Button
                          size="sm"
                          onClick={() => markOrdered(c.id)}
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Ordered
                        </Button>
                      )}
                      {c.status === "part_ordered" && (
                        <Button
                          size="sm"
                          onClick={() => markReceived(c.id)}
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        >
                          Mark Received
                        </Button>
                      )}
                      {c.status === "part_received" && (
                        <Button
                          size="sm"
                          onClick={() => markReopen(c.id)}
                          className="h-7 text-xs bg-violet-600 hover:bg-violet-700"
                        >
                          Re-open Case
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {partCases.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-gray-400">
                    No cases in this section
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Dialog */}
      <Dialog open={!!poDialog} onOpenChange={() => setPoDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PO Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>PO Number</Label>
              <Input
                placeholder="e.g. PO-2024-123"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Order Date</Label>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <Button
              onClick={() => poDialog && savePO(poDialog)}
              className="w-full"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
