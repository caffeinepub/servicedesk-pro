import { ArrowLeft, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  in_stock: "In Stock",
  issued: "Issued",
  installed: "Installed",
  returned_to_company: "Returned to Company",
  returned_to_store: "Returned to Store",
};

export default function PartDetailPage() {
  const {
    selectedPartId,
    partItems,
    partLifecycle,
    purchaseEntries,
    stockCompanies,
    stockCategories,
    stockPartNames,
    racks,
    shelves,
    bins,
    technicians,
    navigate,
    issuePartToTechnician,
    markPartInstalled,
    returnPartToStore,
    returnPartToCompany,
  } = useStore();

  const part = partItems.find((p) => p.id === selectedPartId);
  const lifecycle = partLifecycle
    .filter((l) => l.partId === selectedPartId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const [issueDialog, setIssueDialog] = useState(false);
  const [issueTechId, setIssueTechId] = useState("");
  const [issueCaseId, setIssueCaseId] = useState("");

  const [returnDialog, setReturnDialog] = useState(false);
  const [returnRemarks, setReturnRemarks] = useState("");

  const [rtcDialog, setRtcDialog] = useState(false);
  const [rtcReason, setRtcReason] = useState("");
  const [rtcRemarks, setRtcRemarks] = useState("");

  if (!part) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Part not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("inventory")}
          data-ocid="part.button"
        >
          Back to Inventory
        </Button>
      </div>
    );
  }

  const purchase = purchaseEntries.find((pe) => pe.id === part.purchaseId);
  const company =
    stockCompanies.find((c) => c.id === part.companyId)?.name ?? "";
  const category =
    stockCategories.find((c) => c.id === part.categoryId)?.name ?? "";
  const partName =
    stockPartNames.find((p) => p.id === part.partNameId)?.name ?? "";
  const tech = technicians.find((t) => t.id === part.technicianId);
  const rack = racks.find((r) => r.id === part.rackId);
  const shelf = shelves.find((s) => s.id === part.shelfId);
  const bin = bins.find((b) => b.id === part.binId);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("inventory")}
          data-ocid="part.button"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 font-mono">
            {part.partCode}
          </h1>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLES[part.status]}`}
          >
            {STATUS_LABELS[part.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Item Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Company</span>
              <span className="font-medium">{company}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-medium">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Part Name</span>
              <span className="font-medium">{partName}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Purchase Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Vendor</span>
              <span className="font-medium">{purchase?.vendorName ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice</span>
              <span className="font-medium">
                {purchase?.invoiceNumber ?? "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">
                {purchase?.invoiceDate ?? "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Location</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {rack ? (
              <div className="flex gap-2 items-center">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {rack.name}
                </span>
                {shelf && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {shelf.name}
                    </span>
                  </>
                )}
                {bin && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {bin.name}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-amber-600 font-medium">
                No Location Assigned
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              <span
                className={`text-sm px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[part.status]}`}
              >
                {STATUS_LABELS[part.status]}
              </span>
            </div>
            {part.status === "issued" && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Technician</span>
                  <span className="font-medium">
                    {tech?.name ?? part.technicianId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Case ID</span>
                  <span className="font-medium">{part.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issue Date</span>
                  <span className="font-medium">
                    {new Date(part.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued By</span>
                  <span className="font-medium">{part.issuedBy}</span>
                </div>
              </>
            )}
            {part.status === "returned_to_company" && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reason</span>
                  <span className="font-medium">
                    {part.returnToCompanyReason}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">By</span>
                  <span className="font-medium">
                    {part.returnedToCompanyBy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium">
                    {new Date(part.returnedToCompanyAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {part.status === "in_stock" && (
          <>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setIssueTechId("");
                setIssueCaseId("");
                setIssueDialog(true);
              }}
              data-ocid="part.primary_button"
            >
              Issue to Technician
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-300"
              onClick={() => {
                setRtcReason("");
                setRtcRemarks("");
                setRtcDialog(true);
              }}
              data-ocid="part.delete_button"
            >
              Return to Company
            </Button>
          </>
        )}
        {part.status === "issued" && (
          <>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => markPartInstalled(part.id)}
              data-ocid="part.primary_button"
            >
              Mark Installed
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setReturnRemarks("");
                setReturnDialog(true);
              }}
              data-ocid="part.secondary_button"
            >
              Return to Store
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-300"
              onClick={() => {
                setRtcReason("");
                setRtcRemarks("");
                setRtcDialog(true);
              }}
              data-ocid="part.delete_button"
            >
              Return to Company
            </Button>
          </>
        )}
      </div>

      {/* Timeline */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" /> Lifecycle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lifecycle.length === 0 ? (
            <p className="text-slate-400 text-sm">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {lifecycle.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">
                        {entry.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{entry.details}</p>
                    <p className="text-xs text-slate-400">
                      by {entry.userName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Dialog */}
      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue to Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Technician *</Label>
            <Select value={issueTechId} onValueChange={setIssueTechId}>
              <SelectTrigger data-ocid="part.select">
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
            <Label>Case ID *</Label>
            <Input
              value={issueCaseId}
              onChange={(e) => setIssueCaseId(e.target.value)}
              placeholder="e.g. MD-2024-001"
              data-ocid="part.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIssueDialog(false)}
              data-ocid="part.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (!issueTechId || !issueCaseId.trim()) return;
                issuePartToTechnician(part.id, issueTechId, issueCaseId.trim());
                setIssueDialog(false);
              }}
              data-ocid="part.confirm_button"
            >
              Issue Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return to Store Dialog */}
      <Dialog open={returnDialog} onOpenChange={setReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Remarks / Reason</Label>
            <Textarea
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="Why is this part being returned?"
              data-ocid="part.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnDialog(false)}
              data-ocid="part.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                returnPartToStore(part.id, returnRemarks);
                setReturnDialog(false);
              }}
              data-ocid="part.confirm_button"
            >
              Return to Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return to Company Dialog */}
      <Dialog open={rtcDialog} onOpenChange={setRtcDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Reason *</Label>
            <Input
              value={rtcReason}
              onChange={(e) => setRtcReason(e.target.value)}
              placeholder="e.g. Defective, Damaged"
              data-ocid="part.input"
            />
            <Label>Remarks</Label>
            <Textarea
              value={rtcRemarks}
              onChange={(e) => setRtcRemarks(e.target.value)}
              placeholder="Additional remarks"
              data-ocid="part.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRtcDialog(false)}
              data-ocid="part.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!rtcReason.trim()) return;
                returnPartToCompany(part.id, rtcReason.trim(), rtcRemarks);
                setRtcDialog(false);
              }}
              data-ocid="part.confirm_button"
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
