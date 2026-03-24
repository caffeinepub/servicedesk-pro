import type { CaseStatus } from "../types";

const STATUS_CONFIG: Record<CaseStatus, { label: string; className: string }> =
  {
    new: { label: "New", className: "bg-blue-100 text-blue-800" },
    printed: { label: "Printed", className: "bg-indigo-100 text-indigo-800" },
    confirmed: { label: "Confirmed", className: "bg-cyan-100 text-cyan-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    on_route: { label: "On Route", className: "bg-purple-100 text-purple-800" },
    closed: { label: "Closed", className: "bg-green-100 text-green-800" },
    adjustment_closed: {
      label: "Adjustment Closed",
      className: "bg-teal-100 text-teal-800",
    },
    gas_charge_pending: {
      label: "Gas Charge Pending",
      className: "bg-orange-100 text-orange-800",
    },
    gas_charge_done: {
      label: "Gas Charge Done",
      className: "bg-lime-100 text-lime-800",
    },
    part_required: {
      label: "Part Required",
      className: "bg-red-100 text-red-800",
    },
    part_available: {
      label: "Part Available",
      className: "bg-teal-100 text-teal-800",
    },
    part_issued: {
      label: "Part Issued",
      className: "bg-cyan-100 text-cyan-800",
    },
    part_ordered: {
      label: "Part Ordered",
      className: "bg-orange-100 text-orange-800",
    },
    part_received: {
      label: "Part Received",
      className: "bg-amber-100 text-amber-800",
    },
    re_open: { label: "Re-Open", className: "bg-violet-100 text-violet-800" },
    rescheduled: {
      label: "Rescheduled",
      className: "bg-pink-100 text-pink-800",
    },
    cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
    transferred: {
      label: "Transferred",
      className: "bg-slate-100 text-slate-700",
    },
    replacement_done: {
      label: "Replacement Done",
      className: "bg-emerald-100 text-emerald-800",
    },
  };

export default function StatusBadge({ status }: { status: CaseStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
