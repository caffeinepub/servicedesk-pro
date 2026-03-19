import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  History,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getAgeing, useStore } from "../store";
import type { Case, CaseStatus } from "../types";

function CustomerHistoryDialog({
  open,
  onClose,
  relatedCases,
  currentCaseId,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  relatedCases: Case[];
  currentCaseId: string;
  onNavigate: (id: string) => void;
}) {
  const others = relatedCases.filter((c) => c.id !== currentCaseId);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Customer History ({others.length} previous complaint
            {others.length !== 1 ? "s" : ""})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {others.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No previous complaints found for this customer.
            </p>
          ) : (
            others.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  onClose();
                  onNavigate(c.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-700">{c.caseId}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {c.product} — {c.complaintType.replace("_", " ")}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleDateString("en-IN")} ·{" "}
                  {c.remarks || "No remarks"}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const normalizePhone = (ph: string) => ph.replace(/\D/g, "");

const checkStale = (c: Case, today: string) =>
  c.status === "on_route" &&
  !!c.technicianId &&
  !c.hasFirstUpdate &&
  !!c.onRouteDate &&
  c.onRouteDate < today;

export default function CasesPage() {
  const {
    cases,
    technicians,
    navigate,
    updateCase,
    addAuditEntry,
    currentUser,
    deleteCase,
  } = useStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTech, setFilterTech] = useState<string>("all");
  const [filterAgeing, setFilterAgeing] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [historyDialog, setHistoryDialog] = useState<{
    caseId: string;
    cases: Case[];
  } | null>(null);
  const PER_PAGE = 20;

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    return cases
      .filter((c) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          c.caseId.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.partCode.toLowerCase().includes(q);

        if (filterStatus === "stale") {
          return matchSearch && checkStale(c, today);
        }

        const matchStatus = filterStatus === "all" || c.status === filterStatus;
        const matchType =
          filterType === "all" || c.complaintType === filterType;
        const matchTech = filterTech === "all" || c.technicianId === filterTech;
        const age = getAgeing(c.createdAt);
        const matchAgeing =
          filterAgeing === "all" ||
          (filterAgeing === "0-3" && age <= 3) ||
          (filterAgeing === "4-7" && age >= 4 && age <= 7) ||
          (filterAgeing === "8+" && age >= 8);
        return (
          matchSearch && matchStatus && matchType && matchTech && matchAgeing
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [
    cases,
    search,
    filterStatus,
    filterType,
    filterTech,
    filterAgeing,
    today,
  ]);

  const staleCount = useMemo(
    () => cases.filter((c) => checkStale(c, today)).length,
    [cases, today],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getCustomerHistory = (c: Case) => {
    const phones = [c.phone, c.altPhone]
      .filter(Boolean)
      .map(normalizePhone)
      .filter((p) => p.length >= 7);
    if (phones.length === 0) return [];
    return cases.filter(
      (other) =>
        other.id !== c.id &&
        phones.some((ph) => {
          const op = normalizePhone(other.phone);
          const oap = other.altPhone ? normalizePhone(other.altPhone) : "";
          return op === ph || (oap !== "" && oap === ph);
        }),
    );
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((c) => c.id)));
  };

  const applyBulkStatus = () => {
    if (!bulkStatus || selected.size === 0) return;
    for (const id of selected) {
      updateCase(id, {
        status: bulkStatus as CaseStatus,
        updatedAt: new Date().toISOString(),
      });
      addAuditEntry({
        caseId: id,
        userId: currentUser?.id ?? "",
        userName: currentUser?.name ?? "",
        action: "Bulk Status Change",
        details: `Status changed to ${bulkStatus}`,
      });
    }
    setSelected(new Set());
    setBulkStatus("");
  };

  const exportCSV = () => {
    const headers = [
      "Case ID",
      "Customer",
      "Phone",
      "Product",
      "Type",
      "Status",
      "Technician",
      "Part Code",
      "Ageing",
      "Last Updated",
    ];
    const rows = filtered.map((c) => [
      c.caseId,
      c.customerName,
      c.phone,
      c.product,
      c.complaintType,
      c.status,
      technicians.find((t) => t.id === c.technicianId)?.name ?? "",
      c.partCode,
      `${getAgeing(c.createdAt)}d`,
      new Date(c.updatedAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cases-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowClass = (c: (typeof cases)[0]) => {
    if (checkStale(c, today))
      return "bg-amber-50 border-l-4 border-l-amber-400 hover:bg-amber-100";
    const age = getAgeing(c.createdAt);
    const closed = [
      "closed",
      "cancelled",
      "transferred",
      "adjustment_closed",
      "replacement_done",
    ].includes(c.status);
    if (!closed && age >= 8) return "bg-red-50 hover:bg-red-100";
    if (c.status === "pending") return "bg-yellow-50 hover:bg-yellow-100";
    if (closed) return "bg-green-50 hover:bg-green-100";
    return "hover:bg-blue-50";
  };

  const isAdmin = currentUser?.role === "admin";

  const quickFilters = [
    { label: "All", value: "all" },
    {
      label: `No Update${staleCount > 0 ? ` (${staleCount})` : ""}`,
      value: "stale",
    },
    { label: "Pending", value: "pending" },
    { label: "On Route", value: "on_route" },
    { label: "Part Required", value: "part_required" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Cases</h2>
          <p className="text-sm text-gray-500">{filtered.length} cases found</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("new-case")}
            data-ocid="cases.primary_button"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New Case
          </Button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {quickFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilterStatus(f.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              filterStatus === f.value
                ? f.value === "stale"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-blue-600 text-white shadow-sm"
                : f.value === "stale" && staleCount > 0
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
            data-ocid="cases.tab"
          >
            {f.value === "stale" && staleCount > 0 && (
              <AlertTriangle className="h-3 w-3 inline mr-1" />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search case ID, customer, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1"
            data-ocid="cases.search_input"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Filters</span>
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {[
                  "new",
                  "printed",
                  "confirmed",
                  "pending",
                  "on_route",
                  "rescheduled",
                  "part_required",
                  "part_ordered",
                  "part_received",
                  "re_open",
                  "gas_charge_pending",
                  "gas_charge_done",
                  "adjustment_closed",
                  "replacement_done",
                  "closed",
                  "cancelled",
                  "transferred",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="breakdown">Breakdown</SelectItem>
                <SelectItem value="stock_repair">Stock Repair</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterTech}
              onValueChange={(v) => {
                setFilterTech(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Technician" />
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
            <Select
              value={filterAgeing}
              onValueChange={(v) => {
                setFilterAgeing(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Ageing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-3">0–3 days</SelectItem>
                <SelectItem value="4-7">4–7 days</SelectItem>
                <SelectItem value="8+">8+ days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">
              {selected.size} selected
            </span>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40 text-xs">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {["pending", "confirmed", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus}>
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selected.size === paginated.length && paginated.length > 0
                    }
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">
                  Case ID
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                  Customer
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">
                  Product
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">
                  Type
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">
                  Status
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">
                  Technician
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                  Age
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">
                  Cust. History
                </th>
                {isAdmin && (
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500">
                    Del
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 10 : 9}
                    className="py-10 text-center text-gray-400 text-sm"
                    data-ocid="cases.empty_state"
                  >
                    No cases found
                  </td>
                </tr>
              )}
              {paginated.map((c, idx) => {
                const age = getAgeing(c.createdAt);
                const history = getCustomerHistory(c);
                const tech = technicians.find((t) => t.id === c.technicianId);
                const stale = checkStale(c, today);
                return (
                  <tr
                    key={c.id}
                    className={`border-b last:border-0 cursor-pointer transition-colors ${rowClass(c)}`}
                    onClick={() => navigate("case-detail", c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate("case-detail", c.id);
                    }}
                    tabIndex={0}
                    data-ocid={`cases.item.${idx + 1}`}
                  >
                    <td
                      className="px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-blue-700">
                      <div className="flex items-center gap-1">
                        {stale && (
                          <span title="No technician update">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                        <span>{c.caseId}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-700 hidden sm:table-cell">
                      <div>
                        <p className="font-medium">{c.customerName}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 hidden md:table-cell">
                      {c.product}
                    </td>
                    <td className="px-3 py-3 text-gray-500 hidden lg:table-cell capitalize">
                      {c.complaintType.replace("_", " ")}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs hidden md:table-cell">
                      {tech?.name ?? "—"}
                    </td>
                    <td
                      className={`px-3 py-3 font-medium text-xs hidden sm:table-cell ${
                        age >= 8
                          ? "text-red-600"
                          : age >= 4
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {age}d
                    </td>
                    <td
                      className="px-3 py-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {history.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setHistoryDialog({ caseId: c.id, cases: history })
                          }
                          className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full hover:bg-orange-200 transition-colors"
                          data-ocid={`cases.item.${idx + 1}`}
                        >
                          <History className="h-3 w-3" />
                          {history.length}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => deleteCase(c.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600"
                          title="Delete case"
                          data-ocid={`cases.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} · {filtered.length} total
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                data-ocid="cases.pagination_prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                data-ocid="cases.pagination_next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {historyDialog && (
        <CustomerHistoryDialog
          open
          onClose={() => setHistoryDialog(null)}
          relatedCases={historyDialog.cases}
          currentCaseId={historyDialog.caseId}
          onNavigate={(id) => navigate("case-detail", id)}
        />
      )}
    </div>
  );
}
