import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Hash,
  Inbox,
  Package,
  Send,
  ShoppingCart,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
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

type FilterTab = "all" | "pending" | "issued" | "rejected";

export default function PartRequestsPage() {
  const {
    partRequests,
    technicians,
    currentUser,
    issuePartRequest,
    rejectPartRequest,
    navigate,
  } = useStore();

  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [issueModal, setIssueModal] = useState<PartRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<PartRequest | null>(null);
  const [selectedTech, setSelectedTech] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [imageModal, setImageModal] = useState<string | null>(null);

  const isPrivileged =
    currentUser?.role === "admin" || currentUser?.role === "supervisor";

  // Filter: supervisors see all, backend_user sees own only
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
    toast.success("Part request issued to technician.");
    setIssueModal(null);
    setSelectedTech("");
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    rejectPartRequest(rejectModal.id, rejectReason.trim());
    toast.success("Part request rejected.");
    setRejectModal(null);
    setRejectReason("");
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
        {pendingCount > 0 && (
          <Badge className="bg-white text-blue-700 px-3 py-1 text-sm font-bold">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border)] w-fit">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">
            No {activeTab === "all" ? "" : activeTab} requests found
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((req) => {
            const tech = technicians.find((t) => t.id === req.technicianId);
            return (
              <Card
                key={req.id}
                className="border border-[var(--border)] bg-[var(--bg-surface)]"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Part image */}
                    <div className="flex-shrink-0">
                      {req.partPhotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setImageModal(req.partPhotoUrl)}
                          className="p-0 border-0 bg-transparent"
                        >
                          <img
                            src={req.partPhotoUrl}
                            alt="Part"
                            className="h-20 w-20 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                          />
                        </button>
                      ) : (
                        <div className="h-20 w-20 rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center bg-[var(--bg-base)]">
                          <Package className="h-8 w-8 text-[var(--text-muted)] opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              className="font-semibold text-blue-600 hover:underline text-sm p-0 bg-transparent border-0"
                              onClick={() =>
                                navigate("case-detail", req.caseDbId)
                              }
                            >
                              {req.caseId}
                            </button>
                            {statusBadge(req.status)}
                          </div>
                          <p className="font-medium text-[var(--text-primary)] mt-1">
                            {req.customerName}
                          </p>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(req.requestedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Package className="h-3.5 w-3.5" />
                          <span className="font-medium text-[var(--text-primary)]">
                            {req.partName || (
                              <em className="text-[var(--text-muted)]">
                                No name
                              </em>
                            )}
                          </span>
                        </div>
                        {req.partCode && (
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Hash className="h-3.5 w-3.5" />
                            <span>{req.partCode}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <User className="h-3.5 w-3.5" />
                          <span>{req.requestedByName}</span>
                        </div>
                      </div>

                      {/* Issued / rejected info */}
                      {req.status === "issued" && (
                        <div className="mt-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Issued to{" "}
                          <strong>{tech?.name ?? req.technicianId}</strong>{" "}
                          &bull;{" "}
                          {new Date(req.issuedAt).toLocaleDateString("en-IN")}
                          {" by "}
                          {req.issuedByName}
                        </div>
                      )}
                      {req.status === "rejected" && (
                        <div className="mt-2 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-md">
                          <span className="font-medium">Rejected</span> by{" "}
                          {req.rejectedByName}: {req.rejectedReason}
                        </div>
                      )}

                      {/* Supervisor actions */}
                      {isPrivileged && req.status === "pending" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                            onClick={() => {
                              setIssueModal(req);
                              setSelectedTech("");
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Issue
                            Part
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
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
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
