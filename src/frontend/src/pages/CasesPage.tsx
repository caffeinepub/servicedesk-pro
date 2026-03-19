import {
  Download,
  Filter,
  History,
  PlusCircle,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
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

const ALL_STATUSES: CaseStatus[] = [
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
      <DialogContent className="max-w-2xl">
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
              <div
                key={c.id}
                className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  onClose();
                  onNavigate(c.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onClose();
                    onNavigate(c.id);
                  }
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
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const normalizePhone = (ph: string) => ph.replace(/\D/g, "");

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
  }, [cases, search, filterStatus, filterType, filterTech, filterAgeing]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Get customer history count for a case — normalized phone matching
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Cases</h2>
          <p className="text-sm text-gray-500">{filtered.length} cases found</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => navigate("new-case")}>
            <PlusCircle className="h-4 w-4 mr-1" />
            New Case
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Case ID, customer, phone, part code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Upload
            className="h-8 w-8 text-gray-400 cursor-pointer hover:text-blue-600"
            onClick={() => {}}
          />
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ALL_STATUSES.map((s) => (
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
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Ageing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-3">0-3 Days</SelectItem>
                <SelectItem value="4-7">4-7 Days</SelectItem>
                <SelectItem value="8+">8+ Days (Overdue)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-blue-700">
            {selected.size} selected
          </span>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue placeholder="Change status to..." />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus}>
            Apply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={
                      selected.size === paginated.length && paginated.length > 0
                    }
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Case ID
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone
                </th>
                <th className="hidden sm:table-cell text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="hidden sm:table-cell text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Technician
                </th>
                <th className="hidden sm:table-cell text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Age
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Cust. History
                </th>
                {isAdmin && (
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => {
                const tech = technicians.find((t) => t.id === c.technicianId);
                const age = getAgeing(c.createdAt);
                const history = getCustomerHistory(c);
                return (
                  <tr
                    key={c.id}
                    className={`border-b last:border-0 transition-colors cursor-pointer ${rowClass(c)}`}
                    onClick={() => navigate("case-detail", c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate("case-detail", c.id);
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-blue-700">
                      {c.caseId}
                    </td>
                    <td className="px-3 py-3 text-gray-800">
                      {c.customerName}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{c.phone}</td>
                    <td className="hidden sm:table-cell px-3 py-3 text-gray-600">
                      {c.product}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-medium capitalize ${
                          c.complaintType === "installation"
                            ? "text-blue-600"
                            : c.complaintType === "breakdown"
                              ? "text-orange-600"
                              : "text-purple-600"
                        }`}
                      >
                        {c.complaintType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3 text-gray-500 text-xs">
                      {tech?.name ?? "—"}
                    </td>
                    <td
                      className={`hidden sm:table-cell px-3 py-3 font-medium text-xs ${
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
                            setHistoryDialog({
                              caseId: c.id,
                              cases: [c, ...history],
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold hover:bg-orange-200 transition-colors"
                          data-ocid="cases.history.button"
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              className="p-1.5 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                              title="Delete case"
                              data-ocid="cases.delete_button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Case {c.caseId}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The case and all
                                its data will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => deleteCase(c.id)}
                                data-ocid="cases.confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    )}
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 11 : 10}
                    className="text-center py-12 text-gray-400"
                    data-ocid="cases.empty_state"
                  >
                    No cases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * PER_PAGE + 1}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7"
              data-ocid="cases.pagination_prev"
            >
              Prev
            </Button>
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => i + 1,
            ).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={page === p ? "default" : "outline"}
                onClick={() => setPage(p)}
                className="h-7 w-7"
              >
                {p}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7"
              data-ocid="cases.pagination_next"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Customer History Dialog */}
      {historyDialog && (
        <CustomerHistoryDialog
          open={!!historyDialog}
          onClose={() => setHistoryDialog(null)}
          relatedCases={historyDialog.cases}
          currentCaseId={historyDialog.caseId}
          onNavigate={(id) => navigate("case-detail", id)}
        />
      )}
    </div>
  );
}
