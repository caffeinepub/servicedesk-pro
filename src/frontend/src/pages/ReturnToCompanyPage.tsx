import {
  AlertTriangle,
  Building,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";

interface ReturnRecord {
  id: string;
  partId: string;
  partCode: string;
  partName: string;
  companyName: string;
  vendorName: string;
  referenceNumber: string;
  reason: string;
  returnDate: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
}

export default function ReturnToCompanyPage() {
  const {
    partItems,
    stockCompanies,
    stockPartNames,
    purchaseEntries,
    vendors,
    currentUser,
    returnPartToCompany,
  } = useStore();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [returns, setReturns] = useState<ReturnRecord[]>(() => {
    // Generate initial returns from existing returned_to_company parts
    return partItems
      .filter((p) => p.status === "returned_to_company")
      .map((p) => {
        const partName =
          stockPartNames.find((n) => n.id === p.partNameId)?.name ?? "";
        const company =
          stockCompanies.find((c) => c.id === p.companyId)?.name ?? "";
        const purchase = purchaseEntries.find((pur) => pur.id === p.purchaseId);
        const vendor = purchase?.vendorId
          ? (vendors.find((v) => v.id === purchase.vendorId)?.name ??
            purchase.vendorName)
          : (purchase?.vendorName ?? "");
        return {
          id: p.id,
          partId: p.id,
          partCode: p.partCode,
          partName,
          companyName: company,
          vendorName: vendor,
          referenceNumber: "",
          reason: p.returnToCompanyReason,
          returnDate: p.returnedToCompanyAt?.split("T")[0] ?? "",
          recordedBy: p.returnedToCompanyBy,
          notes: p.returnToCompanyRemarks,
          createdAt: p.returnedToCompanyAt ?? "",
        };
      });
  });

  // Modal state
  const [partSearch, setPartSearch] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Eligible parts: in_stock or installed (NOT issued)
  const eligibleParts = partItems.filter(
    (p) => p.status === "in_stock" || p.status === "installed",
  );

  const searchedParts = eligibleParts.filter(
    (p) =>
      !partSearch ||
      p.partCode.toLowerCase().includes(partSearch.toLowerCase()),
  );

  const selectedPart = partItems.find((p) => p.id === selectedPartId);
  const selectedPurchase = selectedPart
    ? purchaseEntries.find((pur) => pur.id === selectedPart.purchaseId)
    : null;
  const autoVendor = selectedPurchase
    ? selectedPurchase.vendorId
      ? (vendors.find((v) => v.id === selectedPurchase.vendorId)?.name ??
        selectedPurchase.vendorName)
      : selectedPurchase.vendorName
    : "";

  const openModal = () => {
    setPartSearch("");
    setSelectedPartId("");
    setReferenceNumber("");
    setReturnDate(new Date().toISOString().split("T")[0]);
    setReason("");
    setNotes("");
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!selectedPartId) errs.part = "Please select a part";
    if (!reason.trim()) errs.reason = "Reason is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    returnPartToCompany(selectedPartId, reason, notes);
    const part = partItems.find((p) => p.id === selectedPartId)!;
    const partName =
      stockPartNames.find((n) => n.id === part.partNameId)?.name ?? "";
    const company =
      stockCompanies.find((c) => c.id === part.companyId)?.name ?? "";
    setReturns((prev) => [
      {
        id: `rtc-${Date.now()}`,
        partId: selectedPartId,
        partCode: part.partCode,
        partName,
        companyName: company,
        vendorName: autoVendor,
        referenceNumber,
        reason,
        returnDate,
        recordedBy: currentUser?.name ?? "Unknown",
        notes,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowModal(false);
  };

  const filtered = returns.filter(
    (r) =>
      !search ||
      r.partCode.toLowerCase().includes(search.toLowerCase()) ||
      r.partName.toLowerCase().includes(search.toLowerCase()) ||
      r.vendorName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Return to Company
          </h1>
          <p className="text-sm text-slate-500">
            Track defective parts returned to vendors/companies
          </p>
        </div>
        <Button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="rtc.open_modal_button"
        >
          <Plus className="h-4 w-4 mr-1" /> Record Return
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-xs">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search returns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="rtc.search_input"
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400"
              data-ocid="rtc.empty_state"
            >
              <Building className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No returns recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Part Code
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Part Name
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Vendor
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Reference
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Reason
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Return Date
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Recorded By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                      data-ocid={`rtc.row.${i + 1}`}
                    >
                      <td className="px-4 py-2 font-mono text-xs font-semibold text-blue-600">
                        {r.partCode}
                      </td>
                      <td className="px-4 py-2 text-slate-700">{r.partName}</td>
                      <td className="px-4 py-2 text-slate-600">
                        {r.vendorName || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {r.referenceNumber || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-600 max-w-[160px] truncate">
                        {r.reason}
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        {r.returnDate || "-"}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {r.recordedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm before opening form */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm" data-ocid="rtc.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Return to Company
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 my-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Are you sure you want to return this part to the company? This
              action is permanent and cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              data-ocid="rtc.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setShowConfirm(false);
                openModal();
              }}
              data-ocid="rtc.confirm_button"
            >
              Yes, Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Return Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg" data-ocid="rtc.modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-red-600" /> Record Return to
              Company
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Part Search */}
            {!selectedPartId ? (
              <div>
                <Label>Search Part Code *</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="Enter part code to search..."
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    data-ocid="rtc.search_input"
                  />
                </div>
                {errors.part && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="rtc.error_state"
                  >
                    {errors.part}
                  </p>
                )}
                {partSearch && (
                  <div className="mt-1 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                    {searchedParts.length === 0 ? (
                      <p className="text-sm text-slate-400 p-3">
                        No eligible parts found
                      </p>
                    ) : (
                      searchedParts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-slate-100 last:border-0"
                          onClick={() => {
                            setSelectedPartId(p.id);
                            setPartSearch("");
                          }}
                        >
                          <span className="font-mono font-semibold text-blue-600">
                            {p.partCode}
                          </span>
                          <span className="text-slate-400 ml-2">
                            (
                            {stockPartNames.find((n) => n.id === p.partNameId)
                              ?.name ?? ""}
                            )
                          </span>
                          <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                              p.status === "in_stock"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {p.status === "in_stock" ? "In Stock" : "Installed"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-mono text-sm font-semibold text-blue-700">
                      {selectedPart?.partCode}
                    </p>
                    <p className="text-xs text-slate-500">
                      {
                        stockPartNames.find(
                          (n) => n.id === selectedPart?.partNameId,
                        )?.name
                      }{" "}
                      •{" "}
                      <span
                        className={`${
                          selectedPart?.status === "in_stock"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {selectedPart?.status === "in_stock"
                          ? "In Stock"
                          : "Installed"}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => setSelectedPartId("")}
                >
                  <X className="h-3 w-3" /> Change
                </button>
              </div>
            )}

            {/* Vendor (auto-filled) */}
            <div>
              <Label>Vendor</Label>
              <Input
                value={autoVendor || ""}
                readOnly
                className="bg-slate-50"
                placeholder="Auto-filled from purchase record"
              />
              {autoVendor && (
                <p className="text-xs text-slate-400 mt-1">
                  Auto-filled from purchase record
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Reference / Invoice No</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ref number"
                  data-ocid="rtc.input"
                />
              </div>
              <div>
                <Label>Return Date</Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  data-ocid="rtc.input"
                />
              </div>
            </div>

            <div>
              <Label>Reason *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Defective / damaged / wrong part..."
                rows={2}
                data-ocid="rtc.textarea"
              />
              {errors.reason && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="rtc.error_state"
                >
                  {errors.reason}
                </p>
              )}
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                data-ocid="rtc.textarea"
              />
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 mx-1">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              This action is permanent and cannot be undone. The part will be
              removed from inventory permanently.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="rtc.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
              data-ocid="rtc.confirm_button"
            >
              Record Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
