import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  History,
  PlusCircle,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
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
import type { Case, CaseStatus, ComplaintType } from "../types";

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

// ---- CSV Import Dialog ----
type ImportRow = {
  customerName: string;
  phone: string;
  altPhone: string;
  address: string;
  product: string;
  productType: string;
  complaintType: ComplaintType;
  status: CaseStatus;
  remarks: string;
  partCode: string;
  partName: string;
  nextActionDate: string;
};

function parseCSV(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

  const col = (row: string[], names: string[]): string => {
    for (const name of names) {
      const idx = header.indexOf(name);
      if (idx >= 0 && row[idx]) return row[idx].replace(/^"|"$/g, "").trim();
    }
    return "";
  };

  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Basic CSV split (handles quoted commas)
    const cells: string[] = [];
    let current = "";
    let inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);

    const name = col(cells, ["customer name", "customer", "name"]);
    const phone = col(cells, ["phone", "mobile", "contact"]);
    if (!name || !phone) continue;

    const rawType = col(cells, ["complaint type", "type"])
      .toLowerCase()
      .replace(/\s+/g, "_");
    const complaintType: ComplaintType =
      rawType === "installation"
        ? "installation"
        : rawType === "stock_repair"
          ? "stock_repair"
          : "breakdown";

    const rawStatus = col(cells, ["status"]).toLowerCase().replace(/\s+/g, "_");
    const validStatuses: CaseStatus[] = [
      "new",
      "printed",
      "confirmed",
      "pending",
      "on_route",
      "cancelled",
      "transferred",
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
    ];
    const status: CaseStatus = validStatuses.includes(rawStatus as CaseStatus)
      ? (rawStatus as CaseStatus)
      : "new";

    const followUp = col(cells, [
      "follow-up date",
      "follow up date",
      "followup",
      "next action",
    ]);
    let nextActionDate = "";
    if (followUp) {
      try {
        const parsed = new Date(followUp);
        if (!Number.isNaN(parsed.getTime()))
          nextActionDate = parsed.toISOString().split("T")[0];
      } catch {
        /* ignore */
      }
    }

    rows.push({
      customerName: name,
      phone,
      altPhone: col(cells, ["alt phone", "alternate phone", "alt mobile"]),
      address: col(cells, ["address"]),
      product: col(cells, ["product"]) || "Unknown",
      productType: col(cells, ["product type", "model"]),
      complaintType,
      status,
      remarks: col(cells, ["remarks", "notes", "description"]),
      partCode: col(cells, ["part code", "partcode"]),
      partName: col(cells, ["part name", "partname"]),
      nextActionDate,
    });
  }
  return rows;
}

function ImportCSVDialog({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError(
          "No valid rows found. Make sure the CSV has Customer Name and Phone columns.",
        );
        setRows([]);
      } else {
        setRows(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (rows.length > 0) {
      onImport(rows);
      setRows([]);
      setFileName("");
      onClose();
    }
  };

  const downloadTemplate = () => {
    const headers =
      "Customer Name,Phone,Alt Phone,Address,Product,Product Type,Complaint Type,Status,Remarks,Part Code,Part Name,Follow-up Date";
    const sample =
      "Priya Sharma,9812345678,,12 MG Road Delhi,AC,1.5 Ton Split,installation,new,New installation,,, ";
    const csv = `${headers}\n${sample}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setRows([]);
          setFileName("");
          setError("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Cases from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Expected CSV columns:</p>
            <p className="text-xs text-blue-700">
              Customer Name, Phone, Alt Phone, Address, Product, Product Type,
              Complaint Type (installation/breakdown/stock_repair), Status,
              Remarks, Part Code, Part Name, Follow-up Date
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
            >
              Download template CSV
            </button>
          </div>

          <button
            type="button"
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {fileName ? (
                <span className="text-blue-700 font-medium">{fileName}</span>
              ) : (
                "Click to select CSV file"
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">Supports .csv files</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
            />
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
              <X className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {rows.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Preview — {rows.length} case{rows.length !== 1 ? "s" : ""} ready
                to import
              </p>
              <div className="overflow-x-auto max-h-48 border rounded-lg">
                <table className="min-w-max w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {[
                        "Customer",
                        "Phone",
                        "Product",
                        "Type",
                        "Status",
                        "Remarks",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((r, i) => (
                      <tr key={`${r.phone}-${i}`} className="border-t">
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {r.customerName}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {r.phone}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {r.product}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap capitalize">
                          {r.complaintType.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap capitalize">
                          {r.status.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-1.5 max-w-[150px] truncate">
                          {r.remarks}
                        </td>
                      </tr>
                    ))}
                    {rows.length > 10 && (
                      <tr className="border-t">
                        <td
                          colSpan={6}
                          className="px-3 py-1.5 text-center text-gray-400"
                        >
                          ...and {rows.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setRows([]);
                setFileName("");
                setError("");
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={rows.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import {rows.length > 0 ? `${rows.length} Cases` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Bulk Delete Confirm Dialog ----
function BulkDeleteDialog({
  open,
  count,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogContent className="max-w-sm mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete {count} Case{count !== 1 ? "s" : ""}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          This will permanently delete {count} selected case
          {count !== 1 ? "s" : ""}. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete {count} Case{count !== 1 ? "s" : ""}
          </Button>
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
    deleteCases,
    importCases,
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
  const [showImport, setShowImport] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
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
          (c.altPhone || "").includes(q) ||
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

  const handleBulkDelete = () => {
    deleteCases(Array.from(selected));
    setSelected(new Set());
    setShowBulkDelete(false);
  };

  const handleImport = (rows: ImportRow[]) => {
    const count = importCases(
      rows.map((r) => ({
        caseId: "", // will be auto-generated in store
        customerName: r.customerName,
        phone: r.phone,
        altPhone: r.altPhone,
        address: r.address,
        product: r.product,
        productType: r.productType,
        complaintType: r.complaintType,
        status: r.status,
        technicianId: "",
        technicianFeedback: "",
        partCode: r.partCode,
        partName: r.partName,
        partPhotoUrl: "",
        poNumber: "",
        orderDate: "",
        receivedDate: "",
        nextActionDate: r.nextActionDate,
        remarks: r.remarks,
        additionalNotes: "",
      })),
    );
    setImportSuccess(count);
    setTimeout(() => setImportSuccess(null), 4000);
  };

  const exportCSV = () => {
    const headers = [
      "Case ID",
      "Customer",
      "Phone",
      "Alt Phone",
      "Complaint Type",
      "Product",
      "Status",
      "Technician",
      "Follow-up Date",
      "Part Code",
      "Ageing",
      "Last Updated",
    ];
    const rows = filtered.map((c) => [
      c.caseId,
      c.customerName,
      c.phone,
      c.altPhone || "",
      c.complaintType.replace(/_/g, " "),
      c.product,
      c.status,
      technicians.find((t) => t.id === c.technicianId)?.name ?? "",
      c.nextActionDate
        ? new Date(c.nextActionDate).toLocaleDateString("en-IN")
        : "",
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

  const formatFollowUp = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    } catch {
      return "—";
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const quickFilters = [
    { label: "All", value: "all" },
    {
      label: `No Update${staleCount > 0 ? ` (${staleCount})` : ""}`,
      value: "stale",
    },
    { label: "New", value: "new" },
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
        <div className="flex gap-2 flex-wrap">
          {importSuccess !== null && (
            <span className="text-xs text-green-700 bg-green-100 border border-green-200 rounded-full px-3 py-1.5 font-medium">
              {importSuccess} cases imported successfully
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>
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
            <span className="text-sm text-gray-600 font-medium">
              {selected.size} selected
            </span>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40 text-xs">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "pending",
                  "confirmed",
                  "on_route",
                  "part_required",
                  "closed",
                  "cancelled",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus}>
              Apply
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowBulkDelete(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected ({selected.size})
              </Button>
            )}
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

      {/* Table — horizontally scrollable with all columns always visible */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
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
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Case ID
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Customer Name
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Mobile
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Complaint Type
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Product
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Status
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Technician
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Follow-up
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Age
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Cust. History
                </th>
                {isAdmin && (
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                    Del
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 12 : 11}
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
                    <td className="px-3 py-3 font-medium text-blue-700 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {stale && (
                          <span title="No technician update">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                        <span>{c.caseId}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {c.customerName}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      <div className="text-xs">
                        <div>{c.phone}</div>
                        {c.altPhone && (
                          <div className="text-gray-400">{c.altPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap capitalize text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.complaintType === "installation"
                            ? "bg-blue-100 text-blue-700"
                            : c.complaintType === "breakdown"
                              ? "bg-red-100 text-red-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {c.complaintType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {c.product}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {tech?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">
                      {c.nextActionDate ? (
                        <span
                          className={`font-medium ${
                            new Date(c.nextActionDate) < new Date(today)
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {formatFollowUp(c.nextActionDate)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-3 font-bold text-xs whitespace-nowrap ${
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
                      className="px-3 py-3 whitespace-nowrap"
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
                        className="px-3 py-3 whitespace-nowrap"
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
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} · {filtered.length} cases
            </span>
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

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      {/* Bulk Delete Confirm */}
      <BulkDeleteDialog
        open={showBulkDelete}
        count={selected.size}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDelete(false)}
      />
    </div>
  );
}
