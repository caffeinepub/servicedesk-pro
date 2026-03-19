import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  History,
  Image,
  MapPin,
  MessageSquare,
  Phone,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
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

export default function CaseDetailPage() {
  const {
    cases,
    technicians,
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
  } = useStore();

  const caseData = cases.find((c) => c.id === selectedCaseId);

  const [newStatus, setNewStatus] = useState<CaseStatus | "">("");
  const [statusDetails, setStatusDetails] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [techId, setTechId] = useState("");
  const [partName, setPartName] = useState("");
  const [partCode, setPartCode] = useState("");
  const [partPhotoUrl, setPartPhotoUrl] = useState("");
  const [partPhotoFile, setPartPhotoFile] = useState<File | null>(null);
  const [poNumber, setPoNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [closingPhotoFile, setClosingPhotoFile] = useState<File | null>(null);
  const [closingPhotoUrl, setClosingPhotoUrl] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [remarks, setRemarks] = useState(caseData?.remarks ?? "");
  const [notes, setNotes] = useState(caseData?.additionalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const partPhotoRef = useRef<HTMLInputElement>(null);
  const closingPhotoRef = useRef<HTMLInputElement>(null);

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

  const handlePartPhotoSelect = async (file: File) => {
    setPartPhotoFile(file);
    const url = await fileToDataUrl(file);
    setPartPhotoUrl(url);
  };

  const handleClosingPhotoSelect = async (file: File) => {
    setClosingPhotoFile(file);
    const url = await fileToDataUrl(file);
    setClosingPhotoUrl(url);
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
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
      if (partName) updates.partName = partName;
      if (partCode) updates.partCode = partCode;
      if (partPhotoUrl) updates.partPhotoUrl = partPhotoUrl;
      details += ` Part: ${partName} (${partCode})`;
    }
    if (newStatus === "part_ordered") {
      if (poNumber) updates.poNumber = poNumber;
      if (orderDate) updates.orderDate = orderDate;
      if (poNumber) details += ` PO: ${poNumber}`;
    }
    if (feedbackText) updates.technicianFeedback = feedbackText;

    if (Object.keys(updates).length > 0) updateCase(caseData.id, updates);
    changeStatus(caseData.id, newStatus, details);

    // Add closing photo if present
    if (
      closingPhotoUrl &&
      [
        "closed",
        "adjustment_closed",
        "replacement_done",
        "gas_charge_done",
      ].includes(newStatus)
    ) {
      addPhotoToCase(caseData.id, {
        url: closingPhotoUrl,
        type: "after",
        name: closingPhotoFile?.name ?? "After work photo",
      });
    }

    // Reset form
    setNewStatus("");
    setStatusDetails("");
    setNextAction("");
    setTechId("");
    setPartName("");
    setPartCode("");
    setPartPhotoUrl("");
    setPartPhotoFile(null);
    setPoNumber("");
    setOrderDate("");
    setFeedbackText("");
    setClosingPhotoFile(null);
    setClosingPhotoUrl("");
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
    const hasPhoto = !!(caseData.partPhotoUrl || partPhotoUrl);
    const msg = encodeURIComponent(
      `Hello ${supervisorName} ji,\nCase ID: ${caseData.caseId}\nCustomer: ${caseData.customerName}\nProduct: ${caseData.product} ${caseData.productType}\nRequired Part: ${caseData.partName || partName}\nPart Code: ${caseData.partCode || partCode}\n${hasPhoto ? "Part photo available.\n" : ""}Please confirm availability.`,
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

  return (
    <div className="max-w-4xl mx-auto space-y-4">
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
            {[
              ["Case ID", caseData.caseId],
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
                <span className="text-gray-500 min-w-[100px]">{k}:</span>
                <span className="text-gray-900 font-medium">{v}</span>
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

                {/* Part Required — enter part details + photo */}
                {newStatus === "part_required" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Part Name</Label>
                        <Input
                          placeholder="e.g. Compressor"
                          value={partName}
                          onChange={(e) => setPartName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Part Code</Label>
                        <Input
                          placeholder="e.g. COMP-350"
                          value={partCode}
                          onChange={(e) => setPartCode(e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Part Photo */}
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Part Photo (for WhatsApp)
                      </Label>
                      <input
                        ref={partPhotoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePartPhotoSelect(f);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => partPhotoRef.current?.click()}
                        className="flex items-center gap-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 w-full hover:bg-gray-50"
                        data-ocid="case_detail.upload_button"
                      >
                        <Upload className="h-3 w-3 text-gray-400" />
                        {partPhotoFile
                          ? partPhotoFile.name
                          : "Upload part photo (optional)"}
                      </button>
                      {partPhotoUrl && (
                        <div className="relative inline-block">
                          <img
                            src={partPhotoUrl}
                            alt="Part preview"
                            className="h-20 w-20 object-cover rounded border"
                          />
                        </div>
                      )}
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
                  </div>
                )}

                {/* Part Ordered — enter PO number (optional) */}
                {newStatus === "part_ordered" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                      Enter PO details if available (both optional)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">PO Number (optional)</Label>
                        <Input
                          placeholder="e.g. PO-2024-001"
                          value={poNumber}
                          onChange={(e) => setPoNumber(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Order Date (optional)</Label>
                        <Input
                          type="date"
                          value={orderDate}
                          onChange={(e) => setOrderDate(e.target.value)}
                        />
                      </div>
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
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleClosingPhotoSelect(f);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => closingPhotoRef.current?.click()}
                        className="flex items-center gap-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 w-full hover:bg-gray-50"
                        data-ocid="case_detail.dropzone"
                      >
                        <Image className="h-3 w-3 text-gray-400" />
                        {closingPhotoFile
                          ? closingPhotoFile.name
                          : "Upload closing photo (optional)"}
                      </button>
                      {closingPhotoUrl && (
                        <img
                          src={closingPhotoUrl}
                          alt="Closing preview"
                          className="h-20 w-20 object-cover rounded border"
                        />
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
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
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
