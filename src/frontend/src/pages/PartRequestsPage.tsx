import {
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Inbox,
  Package,
  RefreshCw,
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
import type { PartRequest } from "../types";

type FilterTab = "all" | "pending" | "issued" | "rejected" | "cancelled";

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
  urgent: "Urgent",
};

export default function PartRequestsPage() {
  const {
    partRequests,
    technicians,
    currentUser,
    issuePartRequest,
    rejectPartRequest,
    cancelPartRequest,
    navigate,
    syncPartRequests,
    markPartRequestsSeen,
  } = useStore();

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [issueModal, setIssueModal] = useState<PartRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<PartRequest | null>(null);
  const [selectedTech, setSelectedTech] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    syncPartRequests();
    markPartRequestsSeen();
  }, []);

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

  const pendingCount = partRequests.filter(
    (r) =>
      r.status === "pending" &&
      (isPrivileged || r.requestedBy === currentUser?.id),
  ).length;

  const handleIssue = () => {
    if (!issueModal || !selectedTech) {
      toast.error("Please select a technician.");
      return;
    }
    issuePartRequest(issueModal.id, selectedTech);
    toast.success("Part issued successfully");
    setIssueModal(null);
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
        className={`text-[10px] px-1.5 py-0.5 border ${PRIORITY_COLORS[p] ?? PRIORITY_COLORS.normal}`}
      >
        {PRIORITY_LABEL[p] ?? p}
      </Badge>
    );
  };

  const statusBadge = (status: PartRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "issued":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Issued
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
            <Ban className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
    }
  };

  const tabs: { key: FilterTab; label: string; icon: React.ElementType }[] = [
    {
      key: "pending",
      label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
      icon: Clock,
    },
    { key: "issued", label: "Issued", icon: CheckCircle },
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
      <div className="flex gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border)] w-fit">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === t.key
                ? "bg-blue-600 text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {visible.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]"
          data-ocid="part_requests.empty_state"
        >
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">
            No {activeTab === "all" ? "" : activeTab} requests found
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((req, idx) => {
            const tech = technicians.find((t) => t.id === req.technicianId);
            const expanded = expandedIds.has(req.id);
            const priority = req.priority || "normal";
            return (
              <Card
                key={req.id}
                className="border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden"
                data-ocid={`part_requests.item.${idx + 1}`}
              >
                {/* Collapsed header — always visible */}
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => toggleExpand(req.id)}
                >
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors">
                    {/* Left: Case ID + status */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-600 text-base font-mono">
                        {req.caseId}
                      </span>
                      {statusBadge(req.status)}
                    </div>
                    {/* Center: Part Code */}
                    <span className="text-sm font-medium text-[var(--text-secondary)] font-mono">
                      {req.partCode || "—"}
                    </span>
                    {/* Right: Priority + expand icon */}
                    <div className="flex items-center gap-2">
                      {priorityBadge(priority)}
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {expanded && (
                  <CardContent className="px-4 pb-4 pt-0 border-t border-[var(--border)]">
                    <div className="mt-3 space-y-3">
                      {/* Privileged: greeting + table */}
                      {isPrivileged && (
                        <div className="space-y-2">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2">
                            <p className="text-xs font-semibold text-blue-800">
                              Hello {getGreeting()},{" "}
                              <span className="text-indigo-700">
                                {currentUser?.name}
                              </span>{" "}
                              ji,
                            </p>
                            <p className="text-[11px] text-blue-600 mt-0.5">
                              A new part request has been submitted for your
                              attention.
                            </p>
                          </div>
                          <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-xs">
                              <tbody className="divide-y divide-gray-100">
                                <tr className="bg-gray-50">
                                  <td className="px-3 py-1.5 font-semibold text-gray-500 w-1/3">
                                    Requested By
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800 font-medium flex items-center gap-1">
                                    <User className="h-3 w-3 text-indigo-500" />
                                    {req.requestedByName}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Case ID
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800 font-mono">
                                    <button
                                      type="button"
                                      className="text-blue-600 hover:underline font-mono"
                                      onClick={() =>
                                        navigate("case-detail", req.caseDbId)
                                      }
                                    >
                                      {req.caseId}
                                    </button>
                                  </td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Customer
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800">
                                    {req.customerName}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Product Type
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800">
                                    {req.productType || "—"}
                                  </td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Company
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800">
                                    {req.companyName || "—"}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Part Name
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800 font-medium">
                                    {req.partName || "—"}
                                  </td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Part Code
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-800 font-mono">
                                    {req.partCode || "—"}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Priority
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {priorityBadge(req.priority)}
                                  </td>
                                </tr>
                                {req.partPhotoUrl && (
                                  <tr className="bg-gray-50">
                                    <td className="px-3 py-1.5 font-semibold text-gray-500">
                                      Part Photo
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setImageModal(req.partPhotoUrl!)
                                        }
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                      >
                                        <Package className="h-3 w-3" /> View
                                        Photo
                                      </button>
                                    </td>
                                  </tr>
                                )}
                                <tr className="bg-gray-50">
                                  <td className="px-3 py-1.5 font-semibold text-gray-500">
                                    Requested At
                                  </td>
                                  <td className="px-3 py-1.5 text-gray-600">
                                    {req.requestedAt
                                      ? new Date(
                                          req.requestedAt,
                                        ).toLocaleString("en-IN", {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        })
                                      : "—"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Backend user: own request details */}
                      {!isPrivileged && (
                        <div className="space-y-1 text-sm">
                          <div className="flex flex-wrap gap-3">
                            <span className="text-[var(--text-muted)]">
                              Part:{" "}
                              <strong className="text-[var(--text-primary)]">
                                {req.partName || "—"}
                              </strong>
                            </span>
                            {req.partCode && (
                              <span className="text-[var(--text-muted)]">
                                Code:{" "}
                                <strong className="font-mono text-[var(--text-primary)]">
                                  {req.partCode}
                                </strong>
                              </span>
                            )}
                            <span className="text-[var(--text-muted)]">
                              Requested:{" "}
                              {new Date(req.requestedAt).toLocaleString(
                                "en-IN",
                                { dateStyle: "medium", timeStyle: "short" },
                              )}
                            </span>
                          </div>
                          {req.partPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setImageModal(req.partPhotoUrl!)}
                            >
                              <img
                                src={req.partPhotoUrl}
                                alt="Part"
                                className="h-16 w-16 object-cover rounded border hover:opacity-80"
                              />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Status info for all */}
                      {req.status === "issued" && (
                        <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-md flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Issued to{" "}
                          <strong>{tech?.name ?? req.technicianId}</strong> by{" "}
                          <strong>{req.issuedByName}</strong>
                          {req.issuedAt && (
                            <>
                              {" "}
                              &bull;{" "}
                              {new Date(req.issuedAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </>
                          )}
                        </div>
                      )}
                      {req.status === "rejected" && (
                        <div className="text-xs bg-red-50 text-red-700 px-3 py-2 rounded-md">
                          <span className="font-medium">Rejected</span>
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
                        <div className="text-xs bg-gray-50 text-gray-600 px-3 py-2 rounded-md">
                          <span className="font-medium">Cancelled</span>
                          {(req as any).cancelledByName && (
                            <>
                              {" "}
                              by <strong>{(req as any).cancelledByName}</strong>
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

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {/* Backend user: cancel own pending */}
                        {!isPrivileged &&
                          req.status === "pending" &&
                          req.requestedBy === currentUser?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                cancelPartRequest(req.id);
                                toast.success("Part request cancelled");
                              }}
                              data-ocid="part_requests.cancel_button"
                            >
                              <Ban className="h-3 w-3 mr-1" /> Cancel Request
                            </Button>
                          )}

                        {/* Supervisor actions: issue + reject */}
                        {currentUser?.role === "supervisor" &&
                          req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                                onClick={() => {
                                  setIssueModal(req);
                                  setSelectedTech("");
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                Issue Part
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
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                        {/* Admin actions: issue + reject + cancel */}
                        {currentUser?.role === "admin" &&
                          req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                                onClick={() => {
                                  setIssueModal(req);
                                  setSelectedTech("");
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                Issue Part
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
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
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
      )}

      {/* Issue Modal */}
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
              <div className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border)] space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Case</span>
                  <span className="font-medium">{issueModal.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Customer</span>
                  <span className="font-medium">{issueModal.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Part Name</span>
                  <span className="font-medium">{issueModal.partName}</span>
                </div>
                {issueModal.partCode && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Part Code</span>
                    <span className="font-medium">{issueModal.partCode}</span>
                  </div>
                )}
                {issueModal.productType && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Product</span>
                    <span className="font-medium">
                      {issueModal.productType}
                    </span>
                  </div>
                )}
                {issueModal.companyName && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Company</span>
                    <span className="font-medium">
                      {issueModal.companyName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Priority</span>
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
                <Button variant="outline" onClick={() => setIssueModal(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleIssue}
                  disabled={!selectedTech}
                >
                  Confirm Issue
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
              <div className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border)] space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Case</span>
                  <span className="font-medium">{rejectModal.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Part</span>
                  <span className="font-medium">{rejectModal.partName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Requested by</span>
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
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setRejectModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
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
