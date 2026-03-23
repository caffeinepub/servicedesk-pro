import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  List,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";

const STATUS_STYLES: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700",
  issued: "bg-amber-100 text-amber-700",
  installed: "bg-blue-100 text-blue-700",
  returned_to_company: "bg-red-100 text-red-700",
  returned_to_store: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  issued: "Issued",
  installed: "Installed",
  returned_to_company: "Returned to Co.",
  returned_to_store: "Returned to Store",
  in_stock: "In Stock",
};

type TabValue = "all" | "issued" | "installed" | "returned";

export default function IssuedPartsPage() {
  const {
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    technicians,
    racks,
    shelves,
    bins,
    navigate,
    markPartInstalled,
    returnPartToStore,
    issuePartToTechnician,
  } = useStore();

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Update Status Popup ──
  const [statusPopupId, setStatusPopupId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "install" | "return" | null
  >(null);
  const [actionRemarks, setActionRemarks] = useState("");

  // ── Issue Part Modal ──
  const [issueModal, setIssueModal] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPartCode, setSelectedPartCode] = useState("");
  const [issueQty, setIssueQty] = useState(1);
  const [issueTechId, setIssueTechId] = useState("");
  const [issueCaseId, setIssueCaseId] = useState("");
  const [issueNotes, setIssueNotes] = useState("");
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({});

  // ── Helpers ──
  const getTechName = (id: string) =>
    technicians.find((t) => t.id === id)?.name ?? id;
  const getCompany = (companyId: string) =>
    stockCompanies.find((c) => c.id === companyId)?.name ?? "";
  const getCategory = (categoryId: string) =>
    stockCategories.find((c) => c.id === categoryId)?.name ?? "";
  const getPartName = (partNameId: string) =>
    stockPartNames.find((p) => p.id === partNameId)?.name ?? "";
  const getLocation = (p: (typeof partItems)[number]) => {
    const rack = racks.find((r) => r.id === p.rackId);
    const shelf = shelves.find((s) => s.id === p.shelfId);
    const bin = bins.find((b) => b.id === p.binId);
    if (!rack) return null;
    return [rack.name, shelf?.name, bin?.name].filter(Boolean).join(" / ");
  };

  // ── Filtered lists ──
  const trackedItems = partItems.filter(
    (p) =>
      p.status === "issued" ||
      p.status === "installed" ||
      p.status === "returned_to_store",
  );

  const filterItems = (items: typeof partItems) => {
    return items.filter((p) => {
      const matchSearch =
        !search ||
        p.partCode.toLowerCase().includes(search.toLowerCase()) ||
        getTechName(p.technicianId ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (p.caseId ?? "").toLowerCase().includes(search.toLowerCase());
      const issueDate = p.issueDate ? new Date(p.issueDate) : null;
      const matchFrom =
        !dateFrom || (issueDate && issueDate >= new Date(dateFrom));
      const matchTo =
        !dateTo || (issueDate && issueDate <= new Date(`${dateTo}T23:59:59`));
      return matchSearch && matchFrom && matchTo;
    });
  };

  const allFiltered = filterItems(trackedItems);
  const issuedFiltered = filterItems(
    trackedItems.filter((p) => p.status === "issued"),
  );
  const installedFiltered = filterItems(
    trackedItems.filter((p) => p.status === "installed"),
  );
  const returnedFiltered = filterItems(
    trackedItems.filter((p) => p.status === "returned_to_store"),
  );

  const tabItems = {
    all: allFiltered,
    issued: issuedFiltered,
    installed: installedFiltered,
    returned: returnedFiltered,
  };

  const displayItems = tabItems[activeTab];

  // ── Issue Part Modal Logic ──
  const inStockItems = partItems.filter((p) => p.status === "in_stock");

  const partCodeGroups = useMemo(() => {
    const map = new Map<string, typeof partItems>();
    for (const p of inStockItems) {
      const arr = map.get(p.partCode) ?? [];
      arr.push(p);
      map.set(p.partCode, arr);
    }
    return map;
  }, [inStockItems]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: helper fns stable
  const filteredSuggestions = useMemo(() => {
    if (!partSearch || !showSuggestions) return [];
    const q = partSearch.toLowerCase();
    const results: Array<{
      partCode: string;
      items: typeof partItems;
      sample: (typeof partItems)[0];
    }> = [];
    partCodeGroups.forEach((items, code) => {
      const sample = items[0];
      if (
        code.toLowerCase().includes(q) ||
        getPartName(sample.partNameId).toLowerCase().includes(q)
      ) {
        results.push({ partCode: code, items, sample });
      }
    });
    return results.slice(0, 8);
  }, [partSearch, partCodeGroups, showSuggestions]);

  const selectedGroup = selectedPartCode
    ? partCodeGroups.get(selectedPartCode)
    : null;
  const selectedSample = selectedGroup?.[0];
  const availableQty = selectedGroup?.length ?? 0;

  const openIssueModal = () => {
    setPartSearch("");
    setShowSuggestions(false);
    setSelectedPartCode("");
    setIssueQty(1);
    setIssueTechId("");
    setIssueCaseId("");
    setIssueNotes("");
    setIssueErrors({});
    setIssueModal(true);
  };

  const handleSelectSuggestion = (partCode: string) => {
    setSelectedPartCode(partCode);
    setPartSearch(partCode);
    setShowSuggestions(false);
    setIssueQty(1);
  };

  const handleChangePart = () => {
    setSelectedPartCode("");
    setPartSearch("");
    setShowSuggestions(false);
    setIssueQty(1);
  };

  const handleIssue = () => {
    const errs: Record<string, string> = {};
    if (!selectedPartCode) errs.part = "Select a part";
    if (!issueTechId) errs.tech = "Select a technician";
    if (!issueCaseId.trim()) errs.caseId = "Case ID is required";
    if (Object.keys(errs).length > 0) {
      setIssueErrors(errs);
      return;
    }
    const toIssue = (selectedGroup ?? []).slice(0, issueQty);
    for (const p of toIssue) {
      issuePartToTechnician(p.id, issueTechId, issueCaseId.trim());
    }
    setIssueModal(false);
  };

  // ── Status Popup ──
  const statusPart = statusPopupId
    ? partItems.find((p) => p.id === statusPopupId)
    : null;

  const confirmStatusAction = () => {
    if (!statusPopupId || !pendingAction) return;
    if (pendingAction === "install") markPartInstalled(statusPopupId);
    else returnPartToStore(statusPopupId, actionRemarks);
    setStatusPopupId(null);
    setPendingAction(null);
    setActionRemarks("");
  };

  const TAB_DEFS: {
    value: TabValue;
    label: string;
    count: number;
    color: string;
    icon: React.ElementType;
  }[] = [
    {
      value: "all",
      label: "All",
      count: allFiltered.length,
      color: "bg-slate-500",
      icon: List,
    },
    {
      value: "issued",
      label: "Issued",
      count: issuedFiltered.length,
      color: "bg-amber-500",
      icon: Send,
    },
    {
      value: "installed",
      label: "Installed",
      count: installedFiltered.length,
      color: "bg-blue-500",
      icon: CheckCircle,
    },
    {
      value: "returned",
      label: "Returned to Store",
      count: returnedFiltered.length,
      color: "bg-slate-400",
      icon: RotateCcw,
    },
  ];

  // ── Table Component ──
  const PartTable = ({ items }: { items: typeof partItems }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Part Code
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Company
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Part Name
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Technician
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Case ID
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Date
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="text-center py-10 text-slate-400"
                data-ocid="issued.empty_state"
              >
                No records found.
              </td>
            </tr>
          ) : (
            items.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-slate-100 hover:bg-slate-50"
                data-ocid={`issued.row.${i + 1}`}
              >
                <td className="px-4 py-2">
                  <button
                    type="button"
                    className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                    onClick={() => navigate("part-detail", undefined, p.id)}
                    data-ocid={`issued.link.${i + 1}`}
                  >
                    {p.partCode}
                  </button>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {getCompany(p.companyId)}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {getPartName(p.partNameId)}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {p.technicianId ? getTechName(p.technicianId) : "-"}
                </td>
                <td className="px-4 py-2 text-slate-600 font-mono text-xs">
                  {p.caseId || "-"}
                </td>
                <td className="px-4 py-2 text-slate-500 text-xs">
                  {p.issueDate
                    ? new Date(p.issueDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  {p.status === "issued" ? (
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[p.status]}`}
                      onClick={() => {
                        setStatusPopupId(p.id);
                        setPendingAction(null);
                        setActionRemarks("");
                      }}
                      data-ocid={`issued.status_button.${i + 1}`}
                    >
                      {STATUS_LABELS[p.status]}
                      {p.status === "issued" && (
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      )}
                    </button>
                  ) : (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status]}`}
                    >
                      {STATUS_LABELS[p.status]}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Send className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Issued Parts</h1>
            <p className="text-amber-200 text-sm">
              Track parts issued to technicians
            </p>
          </div>
        </div>
        <Button
          onClick={openIssueModal}
          className="bg-white text-amber-600 hover:bg-amber-50"
          data-ocid="issued.open_modal_button"
        >
          <Plus className="h-4 w-4 mr-1" /> Issue Part
        </Button>
      </div>

      {/* ── Combined Search + Tabs + Date Filter Row ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative min-w-48 w-52">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="issued.search_input"
          />
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {TAB_DEFS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              data-ocid="issued.tab"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              <span
                className={`text-white text-xs rounded-full px-1.5 py-0.5 leading-none ${tab.color}`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            From
          </span>
          <Input
            type="date"
            className="text-sm w-36 h-9"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            data-ocid="issued.date_input"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            To
          </span>
          <Input
            type="date"
            className="text-sm w-36 h-9"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            data-ocid="issued.date_input"
          />
        </div>
        {(search || dateFrom || dateTo) && (
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-500"
            onClick={() => {
              setSearch("");
              setDateFrom("");
              setDateTo("");
            }}
            data-ocid="issued.cancel_button"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <PartTable items={displayItems} />
        </CardContent>
      </Card>

      {/* ── Update Issue Status Popup ── */}
      <Dialog
        open={!!statusPopupId}
        onOpenChange={(open) => {
          if (!open) {
            setStatusPopupId(null);
            setPendingAction(null);
            setActionRemarks("");
          }
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="issued.dialog">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Update Issue Status</DialogTitle>
            </div>
          </DialogHeader>

          {statusPart && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Part Code</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {statusPart.partCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Part Name</span>
                  <span className="font-medium text-slate-800">
                    {getPartName(statusPart.partNameId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Qty Issued</span>
                  <span className="font-medium text-slate-800">1 unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Technician</span>
                  <span className="font-medium text-slate-800">
                    {statusPart.technicianId
                      ? getTechName(statusPart.technicianId)
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Case ID</span>
                  <span className="font-medium text-slate-800">
                    {statusPart.caseId || "-"}
                  </span>
                </div>
              </div>

              {!pendingAction ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setPendingAction("install")}
                    data-ocid="issued.primary_button"
                  >
                    Mark Installed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setPendingAction("return")}
                    data-ocid="issued.secondary_button"
                  >
                    Return to Store
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {pendingAction === "install"
                      ? "Mark this part as installed?"
                      : "Return this part to the store?"}
                  </div>
                  {pendingAction === "return" && (
                    <div>
                      <Label className="text-xs">Remarks (optional)</Label>
                      <Textarea
                        className="mt-1 text-sm"
                        rows={2}
                        value={actionRemarks}
                        onChange={(e) => setActionRemarks(e.target.value)}
                        placeholder="Reason for return..."
                        data-ocid="issued.textarea"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setPendingAction(null);
                        setActionRemarks("");
                      }}
                      data-ocid="issued.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className={`flex-1 ${
                        pendingAction === "install"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                      onClick={confirmStatusAction}
                      data-ocid="issued.confirm_button"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Issue Part Modal ── */}
      <Dialog open={issueModal} onOpenChange={setIssueModal}>
        <DialogContent className="max-w-lg" data-ocid="issued.modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> Issue Part to
              Technician
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Part Search */}
            <div>
              <Label>Search Part Code (In Stock Only) *</Label>
              <div className="relative mt-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9 pr-8"
                  placeholder="Enter part code or name..."
                  value={partSearch}
                  onChange={(e) => {
                    setPartSearch(e.target.value);
                    setShowSuggestions(true);
                    if (
                      selectedPartCode &&
                      e.target.value !== selectedPartCode
                    ) {
                      setSelectedPartCode("");
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  data-ocid="issued.search_input"
                />
                {partSearch && (
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setPartSearch("");
                      setSelectedPartCode("");
                      setShowSuggestions(false);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {issueErrors.part && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="issued.error_state"
                >
                  {issueErrors.part}
                </p>
              )}
              {showSuggestions &&
                partSearch &&
                filteredSuggestions.length > 0 && (
                  <div className="mt-1 border border-slate-200 rounded-lg max-h-44 overflow-y-auto shadow-sm">
                    {filteredSuggestions.map(({ partCode, items, sample }) => {
                      const loc = getLocation(sample);
                      const locLabel = loc
                        ? "In Warehouse"
                        : "Pending Location";
                      const locStyle = loc
                        ? "text-green-600"
                        : "text-amber-600";
                      return (
                        <button
                          key={partCode}
                          type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-50 text-sm border-b border-slate-100 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(partCode);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-semibold text-blue-600">
                              {partCode}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-600 text-xs">
                              {getCompany(sample.companyId)} ›{" "}
                              {getCategory(sample.categoryId)} ›{" "}
                              {getPartName(sample.partNameId)}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className={`text-xs font-medium ${locStyle}`}>
                              {locLabel}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-xs text-slate-500">
                              Qty: {items.length}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              {showSuggestions &&
                partSearch &&
                filteredSuggestions.length === 0 &&
                !selectedPartCode && (
                  <p className="text-xs text-slate-400 mt-1">
                    No in-stock parts found
                  </p>
                )}
            </div>

            {/* Selected Part Details */}
            {selectedPartCode && selectedSample && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-blue-800 text-sm font-mono">
                    {selectedPartCode}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                    onClick={handleChangePart}
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <span className="text-slate-500">Company</span>
                  <span className="font-medium text-slate-800">
                    {getCompany(selectedSample.companyId)}
                  </span>
                  <span className="text-slate-500">Part Name</span>
                  <span className="font-medium text-slate-800">
                    {getPartName(selectedSample.partNameId)}
                  </span>
                  <span className="text-slate-500">Available</span>
                  <span className="font-medium text-green-700">
                    {availableQty} unit{availableQty !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-500">Location</span>
                  <span
                    className={`font-medium text-sm ${
                      getLocation(selectedSample)
                        ? "text-slate-800"
                        : "text-amber-600"
                    }`}
                  >
                    {getLocation(selectedSample) ?? "Pending Location"}
                  </span>
                </div>

                {/* Issue Quantity - number stepper */}
                <div>
                  <Label className="text-xs text-slate-600">
                    Issue Quantity *
                  </Label>
                  <input
                    type="number"
                    min={1}
                    max={availableQty}
                    value={issueQty}
                    onChange={(e) => {
                      const val = Math.min(
                        Math.max(1, Number(e.target.value)),
                        availableQty,
                      );
                      setIssueQty(val);
                    }}
                    className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-ocid="issued.input"
                  />
                </div>
              </div>
            )}

            {/* Technician */}
            <div>
              <Label>Technician *</Label>
              <Select value={issueTechId} onValueChange={setIssueTechId}>
                <SelectTrigger className="mt-1" data-ocid="issued.select">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians
                    .filter((t) => t.isActive)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.technicianCode ? ` (${t.technicianCode})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {issueErrors.tech && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="issued.error_state"
                >
                  {issueErrors.tech}
                </p>
              )}
            </div>

            {/* Case ID - mandatory */}
            <div>
              <Label>Case ID *</Label>
              <Input
                className="mt-1"
                value={issueCaseId}
                onChange={(e) => setIssueCaseId(e.target.value)}
                placeholder="e.g. MD-2024-001"
                data-ocid="issued.input"
              />
              {issueErrors.caseId && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="issued.error_state"
                >
                  {issueErrors.caseId}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                className="mt-1"
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                data-ocid="issued.textarea"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIssueModal(false)}
              data-ocid="issued.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleIssue}
              data-ocid="issued.confirm_button"
            >
              Issue Part
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
