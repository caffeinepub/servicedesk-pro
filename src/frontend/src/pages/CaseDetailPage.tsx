import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  History,
  Image,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import {
  STATUS_TRANSITIONS,
  getAgeing,
  photoTypeLabel,
  useStore,
} from "../store";
import type { CaseStatus, PhotoType } from "../types";

// Convert file to base64 data URL (no external storage needed for in-app photos)
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Local component for collapsible part status groups
type PartStatusEntry = {
  reqId: string;
  status: string;
  issuedByName: string;
  technicianName: string;
  issuedAt: string;
  rejectedReason?: string;
  cancelledByName?: string;
  partPhotoUrl?: string;
};
type PartStatusGroup = {
  partCode: string;
  partName: string;
  entries: PartStatusEntry[];
};

function PartStatusSection({
  groups,
  statusColor,
}: {
  groups: PartStatusGroup[];
  statusColor: (s: string) => string;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const toggle = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getStatusLabel = (s: string) => {
    if (s === "issued") return "Issued";
    if (s === "pending") return "Pending";
    if (s === "rejected") return "Rejected";
    if (s === "cancelled") return "Cancelled";
    return s;
  };

  return (
    <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-3 py-2 font-semibold text-xs text-slate-600 flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5 text-blue-500" />
        Parts Status ({groups.length} part code{groups.length !== 1 ? "s" : ""})
      </div>
      {groups.map((group) => {
        const isExpanded = expandedKeys.has(group.partCode);
        const hasIssued = group.entries.some((e) => e.status === "issued");
        const hasPending = group.entries.some((e) => e.status === "pending");
        const dominantStatus = hasIssued
          ? "issued"
          : hasPending
            ? "pending"
            : (group.entries[0]?.status ?? "pending");
        return (
          <div
            key={group.partCode}
            className="border-t border-slate-100 first:border-t-0"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors text-left"
              onClick={() => toggle(group.partCode)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  {group.partCode}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {group.partName}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColor(dominantStatus)}`}
                >
                  {getStatusLabel(dominantStatus)}
                </span>
                {group.entries.length > 1 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                    ×{group.entries.length}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 space-y-2">
                {group.entries.map((entry, idx) => (
                  <div
                    key={`${entry.reqId}-${idx}`}
                    className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(entry.status)}`}
                      >
                        {getStatusLabel(entry.status)}
                      </span>
                      {entry.issuedAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(entry.issuedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>
                    {entry.status === "issued" && (
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {entry.issuedByName && (
                          <div>
                            <span className="text-slate-400">Issued by: </span>
                            <span className="font-medium text-slate-700">
                              {entry.issuedByName}
                            </span>
                          </div>
                        )}
                        {entry.technicianName && (
                          <div>
                            <span className="text-slate-400">To: </span>
                            <span className="font-medium text-slate-700">
                              {entry.technicianName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {entry.status === "rejected" && entry.rejectedReason && (
                      <div className="text-xs text-red-600">
                        <span className="font-medium">Reason: </span>
                        {entry.rejectedReason}
                      </div>
                    )}
                    {entry.status === "cancelled" && entry.cancelledByName && (
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">Cancelled by: </span>
                        {entry.cancelledByName}
                      </div>
                    )}
                    {entry.partPhotoUrl && (
                      <img
                        src={entry.partPhotoUrl}
                        alt="Part"
                        className="h-10 w-10 object-cover rounded border border-slate-200"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CaseDetailPage() {
  const {
    cases,
    technicians,
    partItems,
    auditLog,
    reminders,
    selectedCaseId,
    navigate,
    changeStatus,
    updateCase,
    addReminder,
    addAuditEntry,
    addPhotoToCase,
    currentUser,
    settings,
    deleteCase,
    resetStaleTechnician,
    addPartRequest,
    partRequests,
    syncPartRequests,
  } = useStore();

  const caseData = cases.find((c) => c.id === selectedCaseId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync part requests on mount
  useEffect(() => {
    syncPartRequests();
  }, []);

  const [newStatus, setNewStatus] = useState<CaseStatus | "">("");
  const [statusDetails, setStatusDetails] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [techId, setTechId] = useState("");
  const [partEntries, setPartEntries] = useState<
    Array<{
      id: string;
      partCode: string;
      partName: string;
      partPhotoUrl: string;
      partPhotoFile: File | null;
      stockStatus?: string;
    }>
  >([
    {
      id: Math.random().toString(36).slice(2),
      partCode: "",
      partName: "",
      partPhotoUrl: "",
      partPhotoFile: null,
    },
  ]);
  const [partPriority, setPartPriority] = useState("normal");
  const [poNumbers, setPoNumbers] = useState<
    Array<{ id: string; value: string }>
  >([{ id: Math.random().toString(36).slice(2), value: "" }]);
  const [orderDate, setOrderDate] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [closingPhotoFiles, setClosingPhotoFiles] = useState<File[]>([]);
  const [closingPhotoUrls, setClosingPhotoUrls] = useState<string[]>([]);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [remarks, setRemarks] = useState(caseData?.remarks ?? "");
  const [notes, setNotes] = useState(caseData?.additionalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const closingPhotoRef = useRef<HTMLInputElement>(null);

  const [editingCaseId, setEditingCaseId] = useState(false);
  const [newCaseIdValue, setNewCaseIdValue] = useState("");

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Case not found.</p>
        <Button className="mt-4" onClick={() => navigate("cases")}>
          Back to Cases
        </Button>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Stale detection
  const isStale =
    caseData.status === "on_route" &&
    !!caseData.technicianId &&
    !caseData.hasFirstUpdate &&
    !!caseData.onRouteDate &&
    caseData.onRouteDate < today;

  // Auto-load customer history using normalized phone matching
  const normalizePhone = (ph: string) => ph.replace(/\D/g, "");
  const myPhones = [caseData.phone, caseData.altPhone]
    .filter(Boolean)
    .map(normalizePhone)
    .filter((p) => p.length >= 7);

  const previousCases = cases.filter(
    (c) =>
      c.id !== caseData.id &&
      myPhones.some((ph) => {
        const op = normalizePhone(c.phone);
        const oap = c.altPhone ? normalizePhone(c.altPhone) : "";
        return op === ph || (oap !== "" && oap === ph);
      }),
  );

  const nextStatuses = STATUS_TRANSITIONS[caseData.status] ?? [];
  const assignedTech = technicians.find((t) => t.id === caseData.technicianId);
  const caseAudit = auditLog
    .filter((a) => a.caseId === caseData.id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  const caseReminders = reminders.filter(
    (r) => r.caseId === caseData.id && !r.isDone,
  );
  const age = getAgeing(caseData.createdAt);

  const handlePartPhotoSelect = async (entryId: string, file: File) => {
    const url = await fileToDataUrl(file);
    setPartEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, partPhotoFile: file, partPhotoUrl: url } : e,
      ),
    );
  };

  const getPartStockStatus = (
    partCode: string,
  ): { label: string; color: string } => {
    if (!partCode.trim()) return { label: "", color: "" };
    const matching = partItems.filter(
      (p) =>
        p.partCode.toLowerCase() === partCode.toLowerCase() &&
        p.status === "in_stock",
    );
    const isAdmin = currentUser?.role === "admin";
    const isSupervisor = currentUser?.role === "supervisor";
    if (matching.length > 0) {
      if (isAdmin || isSupervisor) {
        return {
          label: `In Stock (${matching.length} unit${matching.length !== 1 ? "s" : ""})`,
          color: "text-green-600 bg-green-50 border-green-200",
        };
      }
      return {
        label: "✓ In Stock",
        color: "text-green-600 bg-green-50 border-green-200",
      };
    }
    // Check with technician or installed (only for admin/supervisor)
    if (isAdmin || isSupervisor) {
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
          label: `With Technician: ${techName}`,
          color: "text-amber-600 bg-amber-50 border-amber-200",
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
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
    }
    return {
      label: "✗ Not in Stock",
      color: "text-red-600 bg-red-50 border-red-200",
    };
  };

  const handleClosingPhotoSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const newUrls = await Promise.all(newFiles.map(fileToDataUrl));
    setClosingPhotoFiles((prev) => [...prev, ...newFiles]);
    setClosingPhotoUrls((prev) => [...prev, ...newUrls]);
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    // Mandatory part code/name validation for part_required
    if (newStatus === "part_required") {
      const hasValidEntry = partEntries.some(
        (e) => e.partCode.trim() && e.partName.trim(),
      );
      if (!hasValidEntry) {
        toast.error("At least one Part Name and Part Code are required.");
        return;
      }
    }
    setSaving(true);
    const updates: Record<string, string> = {};
    let details = statusDetails;

    if (newStatus === "pending" || newStatus === "rescheduled") {
      if (nextAction) {
        updates.nextActionDate = nextAction;
        details += ` Next action: ${nextAction}`;
      }
    }
    if (newStatus === "on_route" && techId) {
      const tech = technicians.find((t) => t.id === techId);
      updates.technicianId = techId;
      details += ` Assigned to: ${tech?.name ?? techId}`;
    }
    if (newStatus === "part_required") {
      const firstPart = partEntries[0];
      if (firstPart?.partName) updates.partName = firstPart.partName;
      if (firstPart?.partCode) updates.partCode = firstPart.partCode;
      if (firstPart?.partPhotoUrl)
        updates.partPhotoUrl = firstPart.partPhotoUrl;
      details += ` Parts: ${partEntries
        .filter((e) => e.partCode)
        .map((e) => `${e.partName} (${e.partCode})`)
        .join(", ")}`;
    }
    if (newStatus === "part_ordered") {
      const validPOs = poNumbers.map((p) => p.value).filter(Boolean);
      if (validPOs.length > 0) {
        updates.poNumber = validPOs[0];
        (updates as any).poNumbers = validPOs;
      }
      if (orderDate) updates.orderDate = orderDate;
      if (validPOs.length > 0) details += ` PO: ${validPOs.join(", ")}`;
    }
    if (feedbackText) updates.technicianFeedback = feedbackText;

    if (Object.keys(updates).length > 0) updateCase(caseData.id, updates);
    changeStatus(caseData.id, newStatus, details);
    toast.success(`Case status updated to ${newStatus.replace(/_/g, " ")}`);

    // Add closing photos if present
    if (
      closingPhotoUrls.length > 0 &&
      [
        "closed",
        "adjustment_closed",
        "replacement_done",
        "gas_charge_done",
      ].includes(newStatus)
    ) {
      for (let i = 0; i < closingPhotoUrls.length; i++) {
        addPhotoToCase(caseData.id, {
          url: closingPhotoUrls[i],
          type: "after",
          name: closingPhotoFiles[i]?.name ?? `After work photo ${i + 1}`,
        });
      }
    }

    // Reset form
    setClosingPhotoFiles([]);
    setClosingPhotoUrls([]);
    setNewStatus("");
    setStatusDetails("");
    setNextAction("");
    setTechId("");
    setPartEntries([
      {
        id: Math.random().toString(36).slice(2),
        partCode: "",
        partName: "",
        partPhotoUrl: "",
        partPhotoFile: null,
      },
    ]);
    setPartPriority("normal");
    setPoNumbers([{ id: Math.random().toString(36).slice(2), value: "" }]);
    setOrderDate("");
    setFeedbackText("");
    setClosingPhotoFiles([]);
    setClosingPhotoUrls([]);
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
  };

  const saveNotes = () => {
    updateCase(caseData.id, { remarks, additionalNotes: notes });
    addAuditEntry({
      caseId: caseData.id,
      userId: currentUser?.id ?? "",
      userName: currentUser?.name ?? "",
      action: "Notes Updated",
      details: "Remarks/notes updated",
    });
  };

  const addReminderHandler = () => {
    if (!reminderDate) return;
    addReminder({
      caseId: caseData.id,
      userId: currentUser?.id ?? "",
      reminderDate,
      note: reminderNote,
      isDone: false,
    });
    setReminderDate("");
    setReminderNote("");
  };

  const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

  const waPartQuery = () => {
    const supervisorName = settings.supervisorName ?? "Mishra";
    const firstPart = partEntries[0];
    const hasPhoto = !!(caseData.partPhotoUrl || firstPart?.partPhotoUrl);
    const msg = encodeURIComponent(
      `Hello ${supervisorName} ji,\nCase ID: ${caseData.caseId}\nCustomer: ${caseData.customerName}\nProduct: ${caseData.product} ${caseData.productType}\nRequired Part: ${caseData.partName || firstPart?.partName || ""}\nPart Code: ${caseData.partCode || firstPart?.partCode || ""}\n${hasPhoto ? "Part photo available.\n" : ""}Please confirm availability.`,
    );
    return `https://wa.me/${settings.supervisorWhatsApp}?text=${msg}`;
  };

  const isClosingStatus = [
    "closed",
    "adjustment_closed",
    "replacement_done",
    "gas_charge_done",
  ].includes(newStatus);

  const isAdmin = currentUser?.role === "admin";

  const handleResetStale = () => {
    resetStaleTechnician(caseData.id);
    toast.success(
      `Technician unassigned. Case ${caseData.caseId} reset to Pending.`,
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Stale Warning Banner */}
      {isStale && (
        <div
          className="bg-amber-50 border border-amber-400 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
          data-ocid="case_detail.panel"
        >
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              No technician update received — this case will auto-reset at
              midnight unless you take action.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-500 text-amber-700 hover:bg-amber-100"
            onClick={handleResetStale}
            data-ocid="case_detail.button"
          >
            Reset Technician Now
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <button
          type="button"
          onClick={() => navigate("cases")}
          className="p-2 hover:bg-gray-100 rounded-lg self-start"
          data-ocid="case_detail.link"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              {caseData.caseId}
            </h2>
            <StatusBadge status={caseData.status} />
            {age >= 8 &&
              ![
                "closed",
                "cancelled",
                "transferred",
                "adjustment_closed",
                "replacement_done",
                "gas_charge_done",
              ].includes(caseData.status) && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> Overdue ({age} days)
                </span>
              )}
            {/* Customer history badge */}
            {previousCases.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100"
                data-ocid="case_detail.toggle"
              >
                <History className="h-3 w-3" />
                {previousCases.length} previous complaint
                {previousCases.length !== 1 ? "s" : ""}
                {showHistory ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {caseData.customerName} &mdash; {caseData.product} &mdash;{" "}
            {caseData.complaintType.replace("_", " ")}
          </p>
        </div>
        {/* Quick Actions + Admin Delete */}
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${caseData.phone}`}
            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100"
          >
            <Phone className="h-3 w-3" /> Call
          </a>
          <a
            href={waLink(caseData.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            <MessageSquare className="h-3 w-3" /> WhatsApp
          </a>
          {caseData.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(caseData.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              <MapPin className="h-3 w-3" /> Navigate
            </a>
          )}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-auto py-1.5"
                  data-ocid="case_detail.open_modal_button"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete Case {caseData.caseId}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The case, audit trail, and all
                    attached data will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="case_detail.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      deleteCase(caseData.id);
                      navigate("cases");
                    }}
                    data-ocid="case_detail.confirm_button"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Customer Previous History (inline) */}
      {showHistory && previousCases.length > 0 && (
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-xs text-amber-800 flex items-center gap-2">
              <History className="h-3.5 w-3.5" /> Previous Complaints for{" "}
              {caseData.customerName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-3">
            {previousCases
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((pc) => (
                <button
                  key={pc.id}
                  type="button"
                  onClick={() => navigate("case-detail", pc.id)}
                  className="w-full text-left flex items-center gap-3 bg-white border border-amber-200 rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-amber-800">
                        {pc.caseId}
                      </span>
                      <StatusBadge status={pc.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {pc.product} &mdash;{" "}
                      {new Date(pc.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-amber-600 rotate-[-90deg]" />
                </button>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Stock Repair Note */}
      {caseData.complaintType === "stock_repair" && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm text-purple-700">
          Dealer Stock Repair — No customer call needed. Send mail to company
          after completion.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Case Info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Case Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {/* Editable Case ID (admin only) */}
            <div className="flex gap-2">
              <span className="text-gray-500 min-w-[100px] shrink-0">
                Case ID:
              </span>
              <div className="flex items-center gap-1 flex-1">
                {editingCaseId && isAdmin ? (
                  <>
                    <input
                      type="text"
                      value={newCaseIdValue}
                      onChange={(e) => setNewCaseIdValue(e.target.value)}
                      className="text-sm font-medium border rounded px-2 py-0.5 flex-1"
                      data-ocid="case_detail.input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCaseIdValue.trim()) {
                          updateCase(caseData.id, {
                            caseId: newCaseIdValue.trim(),
                          });
                          toast.success("Case ID updated");
                        }
                        setEditingCaseId(false);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCaseId(false);
                        setNewCaseIdValue(caseData.caseId);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-900 font-medium">
                      {caseData.caseId}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCaseId(true);
                          setNewCaseIdValue(caseData.caseId);
                        }}
                        className="text-gray-400 hover:text-blue-600 ml-1"
                        title="Edit Case ID"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {[
              ["Customer", caseData.customerName],
              ["Phone", caseData.phone],
              ["Alt Phone", caseData.altPhone || "—"],
              ["Address", caseData.address || "—"],
              ["Product", `${caseData.product} ${caseData.productType}`],
              ["Technician", assignedTech?.name ?? "Not assigned"],
              ["Created", new Date(caseData.createdAt).toLocaleString("en-IN")],
              [
                "Last Updated",
                new Date(caseData.updatedAt).toLocaleString("en-IN"),
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-gray-500 min-w-[100px] shrink-0">
                  {k}:
                </span>
                <span className="text-gray-900 font-medium break-words">
                  {v}
                </span>
              </div>
            ))}
            {caseData.partCode && (
              <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                <p className="text-xs font-semibold text-orange-700">
                  Part Info
                </p>
                <p className="text-xs text-orange-600">
                  {caseData.partName} ({caseData.partCode})
                </p>
                {caseData.poNumber && (
                  <p className="text-xs text-orange-600">
                    PO: {caseData.poNumber}
                  </p>
                )}
                {caseData.orderDate && (
                  <p className="text-xs text-orange-600">
                    Ordered:{" "}
                    {new Date(caseData.orderDate).toLocaleDateString("en-IN")}
                  </p>
                )}
                {caseData.partPhotoUrl && (
                  <div className="mt-1">
                    <img
                      src={caseData.partPhotoUrl}
                      alt="Part"
                      className="h-16 w-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            )}
            {/* Parts Status - comprehensive multi-part display */}
            {(() => {
              const caseReqs = partRequests.filter(
                (r) => r.caseDbId === caseData.id,
              );
              if (caseReqs.length === 0) return null;

              // Build a unified list of all part entries grouped by partCode
              type PartEntry = {
                partCode: string;
                partName: string;
                entries: Array<{
                  reqId: string;
                  status: string;
                  issuedByName: string;
                  technicianName: string;
                  issuedAt: string;
                  rejectedReason?: string;
                  cancelledByName?: string;
                  partPhotoUrl?: string;
                }>;
              };
              const groupMap = new Map<string, PartEntry>();

              for (const req of caseReqs) {
                if (req.parts && req.parts.length > 0) {
                  for (const p of req.parts) {
                    const key = p.partCode || p.partName || "Unknown";
                    const existing = groupMap.get(key) ?? {
                      partCode: key,
                      partName: p.partName || key,
                      entries: [],
                    };
                    const tech = technicians.find(
                      (t) => t.id === (p.technicianId || req.technicianId),
                    );
                    existing.entries.push({
                      reqId: req.id,
                      status: p.status || req.status,
                      issuedByName: p.issuedByName || req.issuedByName || "",
                      technicianName: tech?.name || req.issuedByName || "",
                      issuedAt: p.issuedAt || req.issuedAt || "",
                      rejectedReason: req.rejectedReason || "",
                      cancelledByName: req.cancelledByName || "",
                      partPhotoUrl: p.partPhotoUrl || "",
                    });
                    groupMap.set(key, existing);
                  }
                } else {
                  const key = req.partCode || req.partName || "Unknown";
                  const existing = groupMap.get(key) ?? {
                    partCode: key,
                    partName: req.partName || key,
                    entries: [],
                  };
                  const tech = technicians.find(
                    (t) => t.id === req.technicianId,
                  );
                  existing.entries.push({
                    reqId: req.id,
                    status: req.status,
                    issuedByName: req.issuedByName || "",
                    technicianName: tech?.name || "",
                    issuedAt: req.issuedAt || "",
                    rejectedReason: req.rejectedReason || "",
                    cancelledByName: req.cancelledByName || "",
                    partPhotoUrl: req.partPhotoUrl || "",
                  });
                  groupMap.set(key, existing);
                }
              }

              const groups = [...groupMap.values()];

              const statusColor = (s: string) => {
                if (s === "issued") return "bg-green-100 text-green-700";
                if (s === "pending") return "bg-amber-100 text-amber-700";
                if (s === "rejected") return "bg-red-100 text-red-700";
                if (s === "cancelled") return "bg-slate-100 text-slate-600";
                return "bg-blue-100 text-blue-700";
              };

              return (
                <PartStatusSection groups={groups} statusColor={statusColor} />
              );
            })()}
          </CardContent>
        </Card>

        {/* Status Change */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Case is in final state:{" "}
                <strong>{caseData.status.replace(/_/g, " ")}</strong>
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">New Status</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(v: CaseStatus) => setNewStatus(v)}
                  >
                    <SelectTrigger data-ocid="case_detail.select">
                      <SelectValue placeholder="Select next status" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pending / Rescheduled */}
                {(newStatus === "pending" || newStatus === "rescheduled") && (
                  <div className="space-y-1">
                    <Label className="text-xs">Next Action Date *</Label>
                    <Input
                      type="date"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      required
                      data-ocid="case_detail.input"
                    />
                  </div>
                )}

                {/* On Route → Assign tech */}
                {newStatus === "on_route" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Assign Technician *</Label>
                    <Select value={techId} onValueChange={setTechId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians
                          .filter((t) => t.isActive)
                          .map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.specialization})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Part Required — multi-part entry */}
                {newStatus === "part_required" && (
                  <div className="space-y-3">
                    {partEntries.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">
                            Part {idx + 1}
                          </span>
                          {partEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setPartEntries((prev) =>
                                  prev.filter((e) => e.id !== entry.id),
                                )
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Part Name *</Label>
                            <Input
                              placeholder="e.g. Compressor"
                              value={entry.partName}
                              onChange={(e) =>
                                setPartEntries((prev) =>
                                  prev.map((p) =>
                                    p.id === entry.id
                                      ? { ...p, partName: e.target.value }
                                      : p,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Part Code *</Label>
                            <Input
                              placeholder="e.g. COMP-350"
                              value={entry.partCode}
                              onChange={(e) =>
                                setPartEntries((prev) =>
                                  prev.map((p) =>
                                    p.id === entry.id
                                      ? {
                                          ...p,
                                          partCode: e.target.value,
                                          stockStatus: undefined,
                                        }
                                      : p,
                                  ),
                                )
                              }
                              onBlur={(e) => {
                                const status = getPartStockStatus(
                                  e.target.value,
                                );
                                setPartEntries((prev) =>
                                  prev.map((p) =>
                                    p.id === entry.id
                                      ? { ...p, stockStatus: status.label }
                                      : p,
                                  ),
                                );
                              }}
                            />
                            {entry.partCode &&
                              (() => {
                                const st = getPartStockStatus(entry.partCode);
                                return st.label ? (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded border ${st.color}`}
                                  >
                                    {st.label}
                                  </span>
                                ) : null;
                              })()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Part Photo (optional)
                          </Label>
                          <label className="flex items-center gap-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 w-full hover:bg-gray-100 cursor-pointer">
                            <Upload className="h-3 w-3 text-gray-400" />
                            {entry.partPhotoFile
                              ? entry.partPhotoFile.name
                              : "Upload part photo"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handlePartPhotoSelect(entry.id, f);
                              }}
                            />
                          </label>
                          {entry.partPhotoUrl && (
                            <img
                              src={entry.partPhotoUrl}
                              alt="Part"
                              className="h-16 w-16 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setPartEntries((prev) => [
                          ...prev,
                          {
                            id: Math.random().toString(36).slice(2),
                            partCode: "",
                            partName: "",
                            partPhotoUrl: "",
                            partPhotoFile: null,
                          },
                        ])
                      }
                      className="flex items-center gap-2 text-xs text-blue-600 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-50 w-full justify-center"
                      data-ocid="case_detail.button"
                    >
                      <Plus className="h-3 w-3" /> Add Another Part
                    </button>
                    {/* Priority Dropdown */}
                    <div className="space-y-1">
                      <label
                        htmlFor="partPriority"
                        className="text-xs font-medium text-gray-600"
                      >
                        Request Priority
                      </label>
                      <select
                        id="partPriority"
                        value={partPriority}
                        onChange={(e) => setPartPriority(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <a
                      href={waPartQuery()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-100 w-full justify-center"
                    >
                      <MessageSquare className="h-3 w-3" /> Check Part
                      Availability (WhatsApp Supervisor)
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const validParts = partEntries.filter(
                          (e) => e.partCode.trim() && e.partName.trim(),
                        );
                        if (validParts.length === 0) {
                          toast.error(
                            "At least one Part Name and Part Code are required.",
                          );
                          return;
                        }
                        addPartRequest({
                          caseId: caseData.caseId,
                          caseDbId: caseData.id,
                          customerName: caseData.customerName,
                          partName: validParts[0].partName,
                          partCode: validParts[0].partCode,
                          partPhotoUrl:
                            validParts[0].partPhotoUrl || caseData.partPhotoUrl,
                          requestedBy: currentUser?.id ?? "",
                          requestedByName: currentUser?.name ?? "",
                          productType:
                            (caseData as any).product ||
                            (caseData as any).productType ||
                            "",
                          companyName:
                            (caseData as any).companyName ||
                            (caseData as any).company ||
                            "",
                          priority: partPriority,
                          parts: validParts.map((e) => ({
                            id: Math.random().toString(36).slice(2),
                            partCode: e.partCode,
                            partName: e.partName,
                            partPhotoUrl: e.partPhotoUrl,
                            status: "pending" as const,
                          })),
                        } as any);
                        toast.success("Part requested successfully");
                      }}
                      className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 w-full justify-center"
                      data-ocid="case_detail.primary_button"
                    >
                      <span>📦</span> Request Part from Supervisor
                    </button>
                  </div>
                )}

                {/* Part Ordered — multi-PO entry */}
                {newStatus === "part_ordered" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                      Enter PO details (optional)
                    </p>
                    {poNumbers.map((po, idx) => (
                      <div key={po.id} className="flex gap-2 items-center">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">
                            PO Number {idx + 1} (optional)
                          </Label>
                          <Input
                            placeholder="e.g. PO-2024-001"
                            value={po.value}
                            onChange={(e) =>
                              setPoNumbers((prev) =>
                                prev.map((p) =>
                                  p.id === po.id
                                    ? { ...p, value: e.target.value }
                                    : p,
                                ),
                              )
                            }
                          />
                        </div>
                        {poNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPoNumbers((prev) =>
                                prev.filter((p) => p.id !== po.id),
                              )
                            }
                            className="mt-5 text-red-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setPoNumbers((prev) => [
                          ...prev,
                          {
                            id: Math.random().toString(36).slice(2),
                            value: "",
                          },
                        ])
                      }
                      className="flex items-center gap-2 text-xs text-blue-600 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-50 w-full justify-center"
                    >
                      <Plus className="h-3 w-3" /> Add PO Number
                    </button>
                    <div className="space-y-1">
                      <Label className="text-xs">Order Date (optional)</Label>
                      <Input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Closing statuses — feedback + optional photo */}
                {isClosingStatus && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Technician Feedback</Label>
                      <Textarea
                        placeholder="Work done details..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={2}
                      />
                    </div>
                    {/* Optional closing photo */}
                    <div className="space-y-1">
                      <Label className="text-xs">
                        After-work Photo (optional)
                      </Label>
                      <input
                        ref={closingPhotoRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleClosingPhotoSelect(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => closingPhotoRef.current?.click()}
                        className="flex items-center gap-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 w-full hover:bg-gray-50"
                        data-ocid="case_detail.dropzone"
                      >
                        <Image className="h-3 w-3 text-gray-400" />
                        {closingPhotoFiles.length > 0
                          ? `${closingPhotoFiles.length} photo${closingPhotoFiles.length > 1 ? "s" : ""} selected`
                          : "Upload closing photos (optional, multiple)"}
                      </button>
                      {closingPhotoUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {closingPhotoUrls.map((url, idx) => (
                            <img
                              key={url.slice(-20)}
                              src={url}
                              alt={`Closing preview ${idx + 1}`}
                              className="h-20 w-20 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancel / Transfer reason */}
                {(newStatus === "cancelled" || newStatus === "transferred") && (
                  <div className="space-y-1">
                    <Label className="text-xs">Reason *</Label>
                    <Input
                      placeholder="Reason for cancellation/transfer"
                      value={statusDetails}
                      onChange={(e) => setStatusDetails(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Generic additional details for remaining statuses */}
                {![
                  "pending",
                  "rescheduled",
                  "cancelled",
                  "transferred",
                  "part_required",
                  "part_ordered",
                  ...[
                    "closed",
                    "adjustment_closed",
                    "replacement_done",
                    "gas_charge_done",
                  ],
                ].includes(newStatus) &&
                  newStatus !== "" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Additional Details</Label>
                      <Input
                        placeholder="Optional notes"
                        value={statusDetails}
                        onChange={(e) => setStatusDetails(e.target.value)}
                      />
                    </div>
                  )}

                <Button
                  onClick={handleStatusChange}
                  disabled={!newStatus || saving}
                  className="w-full"
                  data-ocid="case_detail.submit_button"
                >
                  {saving ? "Saving..." : "Update Status"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remarks & Notes */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Remarks &amp; Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Remarks</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Remarks..."
                data-ocid="case_detail.textarea"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes..."
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={saveNotes}
            variant="outline"
            data-ocid="case_detail.save_button"
          >
            Save Notes
          </Button>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" /> Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {caseReminders.length > 0 && (
            <div className="space-y-2 mb-3">
              {caseReminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-sm"
                >
                  <div>
                    <p className="font-medium text-yellow-800">
                      {new Date(r.reminderDate).toLocaleDateString("en-IN")}
                    </p>
                    {r.note && (
                      <p className="text-xs text-yellow-600">{r.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="sm:w-40"
              data-ocid="case_detail.input"
            />
            <Input
              placeholder="Reminder note"
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={addReminderHandler}
              disabled={!reminderDate}
              data-ocid="case_detail.button"
            >
              Set Reminder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.photos.length === 0 ? (
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center"
              data-ocid="case_detail.dropzone"
            >
              <p className="text-sm text-gray-400">No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {caseData.photos.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={p.url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    {photoTypeLabel[p.type as PhotoType]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Timeline */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caseAudit.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  {i < caseAudit.length - 1 && (
                    <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {entry.action}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {entry.details}
                  </p>
                  <p className="text-xs text-gray-400">by {entry.userName}</p>
                </div>
              </div>
            ))}
            {caseAudit.length === 0 && (
              <p className="text-sm text-gray-400">No activity yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
