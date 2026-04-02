import {
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Inbox,
  Package,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
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
import type { PartRequest, PartRequestItem } from "../types";

type FilterTab = "all" | "pending" | "rejected" | "cancelled";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "🔥 Urgent",
};

const STATUS_BORDER: Record<string, string> = {
  pending: "border-l-amber-400",
  issued: "border-l-emerald-400",
  rejected: "border-l-red-400",
  cancelled: "border-l-slate-300",
};

const STOCK_STATUS_COLORS = {
  inStock: "bg-emerald-50 text-emerald-700 border-emerald-200",
  notInStock: "bg-red-50 text-red-700 border-red-200",
  withTechnician: "bg-amber-50 text-amber-700 border-amber-200",
  installed: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function PartRequestsPage() {
  const {
    partRequests,
    technicians,
    partItems,
    currentUser,
    issuePartRequest,
    rejectPartRequest,
    cancelPartRequest,
    navigate,
    syncPartRequests,
    markPartRequestsSeen,
  } = useStore();

  // Stock availability helper
  const getStockStatus = (
    partCode: string,
  ): { label: string; colorClass: string; inStock: boolean } => {
    if (!partCode?.trim())
      return { label: "—", colorClass: "text-gray-400", inStock: false };

    const inStockItems = partItems.filter(
      (p) =>
        p.partCode.toLowerCase() === partCode.toLowerCase() &&
        p.status === "in_stock",
    );
    if (inStockItems.length > 0) {
      const detail =
        currentUser?.role === "backend_user"
          ? "✓ In Stock"
          : `In Stock (${inStockItems.length} unit${inStockItems.length !== 1 ? "s" : ""})`;
      return {
        label: detail,
        colorClass: STOCK_STATUS_COLORS.inStock,
        inStock: true,
      };
    }

    // For supervisor/admin: show more detail
    if (currentUser?.role !== "backend_user") {
      const withTech = partItems.find(
        (p) =>
          p.partCode.toLowerCase() === partCode.toLowerCase() &&
          p.status === "issued",
      );
      if (withTech) {
        const techName =
          technicians.find((t) => t.id === withTech.technicianId)?.name ??
          "technician";
        return {
          label: `With ${techName}`,
          colorClass: STOCK_STATUS_COLORS.withTechnician,
          inStock: false,
        };
      }
      const installed = partItems.find(
        (p) =>
          p.partCode.toLowerCase() === partCode.toLowerCase() &&
          p.status === "installed",
      );
      if (installed)
        return {
          label: "Installed",
          colorClass: STOCK_STATUS_COLORS.installed,
          inStock: false,
        };
    }
    return {
      label: "✗ Not in Stock",
      colorClass: STOCK_STATUS_COLORS.notInStock,
      inStock: false,
    };
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [issueModal, setIssueModal] = useState<PartRequest | null>(null);
  // For individual part issue
  const [issuePartModal, setIssuePartModal] = useState<{
    req: PartRequest;
    part: PartRequestItem;
  } | null>(null);
  const [rejectModal, setRejectModal] = useState<PartRequest | null>(null);
  const [selectedTech, setSelectedTech] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    syncPartRequests();
    markPartRequestsSeen();
  }, []);

  // Reset search/filter when tab changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on tab change
  useEffect(() => {
    setSearchQuery("");
    setFilterDate("");
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncPartRequests();
      toast.success("Requests refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isPrivileged =
    currentUser?.role === "admin" || currentUser?.role === "supervisor";

  // Filter: admin/supervisor see all, backend_user sees own only
  const visible = partRequests.filter((r) => {
    if (!isPrivileged && r.requestedBy !== currentUser?.id) return false;
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const filtered = visible
    .filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.caseId.toLowerCase().includes(q) ||
          r.partName.toLowerCase().includes(q) ||
          r.partCode.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.requestedByName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterDate) {
        const reqDate = r.requestedAt ? r.requestedAt.split("T")[0] : "";
        if (reqDate !== filterDate) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );

  const pendingCount = partRequests.filter(
    (r) =>
      r.status === "pending" &&
      (isPrivileged || r.requestedBy === currentUser?.id),
  ).length;

  const handleIssueAll = () => {
    if (!issueModal || !selectedTech) {
      toast.error("Please select a technician.");
      return;
    }
    // Stock check before issuing
    if (issueModal.parts && issueModal.parts.length > 0) {
      const notInStock = issueModal.parts.filter((p) => {
        if (p.status === "issued" || p.status === "rejected") return false;
        const stockItems = partItems.filter(
          (inv) =>
            inv.partCode.toLowerCase() === p.partCode.toLowerCase() &&
            inv.status === "in_stock",
        );
        return stockItems.length === 0;
      });
      if (notInStock.length > 0) {
        toast.error(
          `Cannot issue: ${notInStock.map((p) => p.partCode).join(", ")} not in stock`,
        );
        return;
      }
    } else if (issueModal.partCode) {
      const inStockItems = partItems.filter(
        (p) =>
          p.partCode.toLowerCase() === issueModal.partCode!.toLowerCase() &&
          p.status === "in_stock",
      );
      if (inStockItems.length === 0) {
        toast.error(`Cannot issue: ${issueModal.partCode} is not in stock`);
        return;
      }
    }
    issuePartRequest(issueModal.id, selectedTech);
    toast.success("Part issued successfully");
    setIssueModal(null);
    setSelectedTech("");
  };

  const handleIssueSinglePart = () => {
    if (!issuePartModal || !selectedTech) {
      toast.error("Please select a technician.");
      return;
    }
    const { req, part } = issuePartModal;
    const stockItems = partItems.filter(
      (inv) =>
        inv.partCode.toLowerCase() === part.partCode.toLowerCase() &&
        inv.status === "in_stock",
    );
    if (stockItems.length === 0) {
      toast.error(`Cannot issue: ${part.partCode} is not in stock`);
      return;
    }
    issuePartRequest(req.id, selectedTech, part.id);
    toast.success(`Part ${part.partCode} issued successfully`);
    setIssuePartModal(null);
    setSelectedTech("");
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    rejectPartRequest(rejectModal.id, rejectReason.trim());
    toast.success("Part request rejected");
    setRejectModal(null);
    setRejectReason("");
  };

  const priorityBadge = (priority?: string) => {
    const p = priority || "normal";
    return (
      <Badge
        className={`text-[10px] px-1.5 py-0.5 border font-semibold ${
          PRIORITY_COLORS[p] ?? PRIORITY_COLORS.normal
        }`}
      >
        {PRIORITY_LABEL[p] ?? p}
      </Badge>
    );
  };

  const statusBadge = (status: PartRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] px-1.5 py-0.5">
            <Clock className="h-2.5 w-2.5 mr-1" /> Pending
          </Badge>
        );
      case "issued":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.5">
            <CheckCircle className="h-2.5 w-2.5 mr-1" /> Issued
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px] px-1.5 py-0.5">
            <XCircle className="h-2.5 w-2.5 mr-1" /> Rejected
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-500 border border-gray-200 text-[10px] px-1.5 py-0.5">
            <Ban className="h-2.5 w-2.5 mr-1" /> Cancelled
          </Badge>
        );
    }
  };

  const partItemStatusBadge = (status: PartRequestItem["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </span>
        );
      case "issued":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
            ✓ Issued
          </span>
        );
      case "rejected":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
            Rejected
          </span>
        );
    }
  };

  const tabs: { key: FilterTab; label: string; icon: React.ElementType }[] = [
    {
      key: "pending",
      label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
      icon: Clock,
    },
    { key: "rejected", label: "Rejected", icon: XCircle },
    { key: "cancelled", label: "Cancelled", icon: Ban },
    { key: "all", label: "All", icon: Inbox },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Part Requests</h1>
            <p className="text-blue-200 text-sm">
              {isPrivileged
                ? "Review and action part requests from backend users"
                : "Your part requests to supervisor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
            data-ocid="part_requests.secondary_button"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {pendingCount > 0 && (
            <Badge className="bg-white text-blue-700 px-3 py-1 text-sm font-bold">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === t.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search / date filter bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Case ID, Part, Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
            data-ocid="part_requests.search_input"
          />
        </div>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-40 h-9 text-sm"
          data-ocid="part_requests.input"
        />
        {(searchQuery || filterDate) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setFilterDate("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-slate-400"
          data-ocid="part_requests.empty_state"
        >
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">
            No {activeTab === "all" ? "" : activeTab} requests found
          </p>
        </div>
      ) : (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <div className="grid gap-2">
            {filtered.map((req, idx) => {
              const tech = technicians.find((t) => t.id === req.technicianId);
              const isExpanded = expandedIds.has(req.id);
              const priority = req.priority || "normal";
              const borderColor =
                STATUS_BORDER[req.status] ?? "border-l-slate-300";
              const hasMultipleParts = req.parts && req.parts.length > 0;
              const pendingParts = hasMultipleParts
                ? req.parts!.filter((p) => p.status === "pending")
                : [];
              const allPartsInStock = hasMultipleParts
                ? pendingParts.every((p) => getStockStatus(p.partCode).inStock)
                : getStockStatus(req.partCode).inStock;

              return (
                <Card
                  key={req.id}
                  className={`border border-slate-200 border-l-4 ${borderColor} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                  data-ocid={`part_requests.item.${idx + 1}`}
                >
                  {/* ── Collapsed Row (always visible) ── */}
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => toggleExpand(req.id)}
                  >
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors gap-3">
                      {/* Left: Case ID + status badge */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-blue-600 text-sm font-mono whitespace-nowrap">
                          {req.caseId}
                        </span>
                        {statusBadge(req.status)}
                      </div>

                      {/* Center: Part code summary */}
                      <div className="flex-1 flex justify-center">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[200px]">
                          {hasMultipleParts
                            ? `${req.parts!.length} Parts`
                            : req.partCode || "—"}
                        </span>
                      </div>

                      {/* Right: Priority + chevron */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {priorityBadge(priority)}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* ── Expanded Content ── */}
                  {isExpanded && (
                    <CardContent className="px-4 pb-4 pt-0 border-t border-slate-100">
                      <div className="mt-3 space-y-3">
                        {/* Greeting banner — privileged only */}
                        {isPrivileged && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3">
                            <p className="text-sm font-semibold text-blue-800">
                              Hello {getGreeting()},{" "}
                              <span className="text-indigo-700">
                                {currentUser?.name}
                              </span>{" "}
                              ji,
                            </p>
                            <p className="text-xs text-blue-600 mt-0.5">
                              A new part request has been submitted for your
                              action.
                            </p>
                          </div>
                        )}

                        {/* ── Details table ── ALL roles see this ── */}
                        <div className="overflow-hidden rounded-lg border border-slate-200">
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr className="bg-slate-50">
                                <td className="px-3 py-2 font-semibold text-slate-500 w-[38%]">
                                  Requested By
                                </td>
                                <td className="px-3 py-2 text-slate-800 font-medium">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-indigo-400" />
                                    {req.requestedByName}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 font-semibold text-slate-500">
                                  Case ID
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    type="button"
                                    className="text-blue-600 hover:underline font-mono text-xs font-semibold"
                                    onClick={() =>
                                      navigate("case-detail", req.caseDbId)
                                    }
                                  >
                                    {req.caseId}
                                  </button>
                                </td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="px-3 py-2 font-semibold text-slate-500">
                                  Customer
                                </td>
                                <td className="px-3 py-2 text-slate-800">
                                  {req.customerName || "—"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 font-semibold text-slate-500">
                                  Product Type
                                </td>
                                <td className="px-3 py-2 text-slate-800">
                                  {req.productType || "—"}
                                </td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="px-3 py-2 font-semibold text-slate-500">
                                  Company
                                </td>
                                <td className="px-3 py-2 text-slate-800">
                                  {req.companyName || "—"}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 font-semibold text-slate-500">
                                  Requested At
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {req.requestedAt
                                    ? new Date(req.requestedAt).toLocaleString(
                                        "en-IN",
                                        {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        },
                                      )
                                    : "—"}
                                </td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="px-3 py-2 font-semibold text-slate-500">
                                  Priority
                                </td>
                                <td className="px-3 py-2">
                                  {priorityBadge(req.priority)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* ── Parts Section ── */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            {hasMultipleParts
                              ? "Parts Requested"
                              : "Part Details"}
                          </p>
                          {hasMultipleParts ? (
                            // Multi-part rows
                            <div className="space-y-2">
                              {req.parts!.map((part) => {
                                const stockSt = getStockStatus(part.partCode);
                                return (
                                  <div
                                    key={part.id}
                                    className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono text-xs font-bold text-slate-700">
                                            {part.partCode}
                                          </span>
                                          <span className="text-xs text-slate-600">
                                            {part.partName}
                                          </span>
                                          <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                              stockSt.colorClass
                                            }`}
                                          >
                                            {stockSt.label}
                                          </span>
                                          {partItemStatusBadge(part.status)}
                                        </div>
                                        {part.issuedByName &&
                                          part.status === "issued" && (
                                            <p className="text-[10px] text-emerald-600 mt-1">
                                              Issued by {part.issuedByName}
                                              {part.technicianId && (
                                                <>
                                                  {" "}
                                                  to{" "}
                                                  {technicians.find(
                                                    (t) =>
                                                      t.id ===
                                                      part.technicianId,
                                                  )?.name ?? part.technicianId}
                                                </>
                                              )}
                                            </p>
                                          )}
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {part.partPhotoUrl && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setImageModal(part.partPhotoUrl!)
                                            }
                                            className="p-1 rounded text-blue-500 hover:bg-blue-50 border border-blue-100"
                                            title="View Photo"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </button>
                                        )}
                                        {/* Individual issue button — supervisor/admin for pending part */}
                                        {isPrivileged &&
                                          part.status === "pending" && (
                                            <button
                                              type="button"
                                              disabled={!stockSt.inStock}
                                              onClick={() => {
                                                setIssuePartModal({
                                                  req,
                                                  part,
                                                });
                                                setSelectedTech("");
                                              }}
                                              className={`text-[10px] px-2 py-1 rounded border font-semibold transition-colors ${
                                                stockSt.inStock
                                                  ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                                                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                              }`}
                                              title={
                                                stockSt.inStock
                                                  ? "Issue this part"
                                                  : "Not in stock"
                                              }
                                            >
                                              Issue
                                            </button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Single part
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {req.partCode && (
                                  <span className="font-mono text-xs font-bold text-slate-700">
                                    {req.partCode}
                                  </span>
                                )}
                                {req.partName && (
                                  <span className="text-xs text-slate-600">
                                    {req.partName}
                                  </span>
                                )}
                                {req.partCode &&
                                  (() => {
                                    const st = getStockStatus(req.partCode);
                                    return (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded border ${st.colorClass}`}
                                      >
                                        {st.label}
                                      </span>
                                    );
                                  })()}
                                {req.partPhotoUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setImageModal(req.partPhotoUrl!)
                                    }
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs border border-blue-100 px-2 py-0.5 rounded bg-blue-50"
                                  >
                                    <Eye className="h-3 w-3" /> Photo
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ── Status banners ── */}
                        {req.status === "issued" && (
                          <div className="text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              Issued to{" "}
                              <strong>{tech?.name ?? req.technicianId}</strong>{" "}
                              by <strong>{req.issuedByName}</strong>
                              {req.issuedAt && (
                                <>
                                  {" "}
                                  &bull;{" "}
                                  {new Date(req.issuedAt).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                        {req.status === "rejected" && (
                          <div className="text-xs bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
                            <span className="font-semibold">Rejected</span>
                            {req.rejectedByName && (
                              <>
                                {" "}
                                by <strong>{req.rejectedByName}</strong>
                              </>
                            )}
                            : {req.rejectedReason}
                          </div>
                        )}
                        {req.status === "cancelled" && (
                          <div className="text-xs bg-gray-50 text-gray-600 px-3 py-2 rounded-lg border border-gray-200">
                            <span className="font-semibold">Cancelled</span>
                            {(req as any).cancelledByName && (
                              <>
                                {" "}
                                by{" "}
                                <strong>{(req as any).cancelledByName}</strong>
                              </>
                            )}
                            {(req as any).cancelledAt && (
                              <>
                                {" "}
                                &bull;{" "}
                                {new Date(
                                  (req as any).cancelledAt,
                                ).toLocaleDateString("en-IN")}
                              </>
                            )}
                          </div>
                        )}

                        {/* ── Action buttons ── */}
                        <div className="flex gap-2 flex-wrap pt-1">
                          {/* Backend user: cancel own pending */}
                          {!isPrivileged &&
                            req.status === "pending" &&
                            req.requestedBy === currentUser?.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-3 text-xs"
                                onClick={() => {
                                  cancelPartRequest(req.id);
                                  toast.success("Part request cancelled");
                                }}
                                data-ocid="part_requests.cancel_button"
                              >
                                <Ban className="h-3 w-3 mr-1" /> Cancel Request
                              </Button>
                            )}

                          {/* Supervisor pending: Issue All + Reject */}
                          {currentUser?.role === "supervisor" &&
                            req.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
                                  disabled={
                                    hasMultipleParts
                                      ? pendingParts.length === 0
                                      : !getStockStatus(req.partCode).inStock
                                  }
                                  onClick={() => {
                                    setIssueModal(req);
                                    setSelectedTech("");
                                  }}
                                  title={
                                    !allPartsInStock
                                      ? "Some parts not in stock"
                                      : "Issue all parts"
                                  }
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Issue All
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-xs"
                                  onClick={() => {
                                    setRejectModal(req);
                                    setRejectReason("");
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                  Reject
                                </Button>
                                {!allPartsInStock &&
                                  pendingParts.length > 0 && (
                                    <p className="text-[10px] text-amber-600 w-full mt-0.5">
                                      ⚠ Some parts not in stock. Issue available
                                      parts individually above.
                                    </p>
                                  )}
                              </>
                            )}

                          {/* Admin pending: Issue All + Reject + Cancel */}
                          {currentUser?.role === "admin" &&
                            req.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
                                  disabled={
                                    hasMultipleParts
                                      ? pendingParts.length === 0
                                      : !getStockStatus(req.partCode).inStock
                                  }
                                  onClick={() => {
                                    setIssueModal(req);
                                    setSelectedTech("");
                                  }}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Issue All
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-xs"
                                  onClick={() => {
                                    setRejectModal(req);
                                    setRejectReason("");
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 text-gray-600 hover:bg-gray-50 h-8 px-3 text-xs"
                                  onClick={() => {
                                    cancelPartRequest(req.id);
                                    toast.success("Part request cancelled");
                                  }}
                                  data-ocid="part_requests.delete_button"
                                >
                                  <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                                </Button>
                                {!allPartsInStock &&
                                  pendingParts.length > 0 && (
                                    <p className="text-[10px] text-amber-600 w-full mt-0.5">
                                      ⚠ Some parts not in stock. Issue available
                                      parts individually above.
                                    </p>
                                  )}
                              </>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Issue All Modal */}
      <Dialog open={!!issueModal} onOpenChange={() => setIssueModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Part to Technician</DialogTitle>
          </DialogHeader>
          {issueModal && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                <User className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-indigo-500">Requested by</p>
                  <p className="text-sm font-semibold text-indigo-800">
                    {issueModal.requestedByName}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Case</span>
                  <span className="font-medium font-mono">
                    {issueModal.caseId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium">{issueModal.customerName}</span>
                </div>
                {issueModal.parts && issueModal.parts.length > 0 ? (
                  <div>
                    <span className="text-slate-500 block mb-1">Parts</span>
                    <div className="space-y-1">
                      {issueModal.parts
                        .filter((p) => p.status === "pending")
                        .map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <span className="font-mono text-slate-700">
                              {p.partCode}
                            </span>
                            <span className="text-slate-600">{p.partName}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Part Name</span>
                      <span className="font-medium">{issueModal.partName}</span>
                    </div>
                    {issueModal.partCode && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Part Code</span>
                        <span className="font-mono font-medium">
                          {issueModal.partCode}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {issueModal.productType && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product</span>
                    <span className="font-medium">
                      {issueModal.productType}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Priority</span>
                  <span>{priorityBadge(issueModal.priority)}</span>
                </div>
              </div>
              {issueModal.partPhotoUrl && (
                <img
                  src={issueModal.partPhotoUrl}
                  alt="Part"
                  className="h-28 w-full object-contain rounded-lg border"
                />
              )}
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Assign to Technician *
                </Label>
                <Select value={selectedTech} onValueChange={setSelectedTech}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians
                      .filter((t) => t.isActive)
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}{" "}
                          {t.specialization ? `(${t.specialization})` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIssueModal(null)}
                  data-ocid="part_requests.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleIssueAll}
                  disabled={!selectedTech}
                  data-ocid="part_requests.confirm_button"
                >
                  Confirm Issue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual Part Issue Modal */}
      <Dialog
        open={!!issuePartModal}
        onOpenChange={() => setIssuePartModal(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Part</DialogTitle>
          </DialogHeader>
          {issuePartModal && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Part Code</span>
                  <span className="font-mono font-bold">
                    {issuePartModal.part.partCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Part Name</span>
                  <span className="font-medium">
                    {issuePartModal.part.partName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Case</span>
                  <span className="font-mono">{issuePartModal.req.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested By</span>
                  <span className="font-medium">
                    {issuePartModal.req.requestedByName}
                  </span>
                </div>
              </div>
              {issuePartModal.part.partPhotoUrl && (
                <img
                  src={issuePartModal.part.partPhotoUrl}
                  alt="Part"
                  className="h-24 w-full object-contain rounded-lg border"
                />
              )}
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Assign to Technician *
                </Label>
                <Select value={selectedTech} onValueChange={setSelectedTech}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians
                      .filter((t) => t.isActive)
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}{" "}
                          {t.specialization ? `(${t.specialization})` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIssuePartModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleIssueSinglePart}
                  disabled={!selectedTech}
                >
                  Issue This Part
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Part Request</DialogTitle>
          </DialogHeader>
          {rejectModal && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Case</span>
                  <span className="font-medium">{rejectModal.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Part</span>
                  <span className="font-medium">{rejectModal.partName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested by</span>
                  <span className="font-medium">
                    {rejectModal.requestedByName}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Rejection Reason *
                </Label>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  data-ocid="part_requests.textarea"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectModal(null)}
                  data-ocid="part_requests.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  data-ocid="part_requests.confirm_button"
                >
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image lightbox */}
      <Dialog open={!!imageModal} onOpenChange={() => setImageModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Part Photo</DialogTitle>
          </DialogHeader>
          {imageModal && (
            <img
              src={imageModal}
              alt="Part"
              className="w-full rounded-lg object-contain max-h-96"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
