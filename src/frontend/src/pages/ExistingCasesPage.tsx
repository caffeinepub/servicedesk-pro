import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardPlus,
  FileText,
  Image,
  Minus,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "../store";
import type { CaseStatus, ComplaintType } from "../types";

const COMPLAINT_TYPES: { value: ComplaintType; label: string }[] = [
  { value: "installation", label: "Installation" },
  { value: "breakdown", label: "Breakdown" },
  { value: "stock_repair", label: "Stock Repair" },
];

const CASE_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "printed", label: "Printed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "on_route", label: "On Route" },
  { value: "cancelled", label: "Cancelled" },
  { value: "transferred", label: "Transferred" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "part_required", label: "Part Required" },
  { value: "part_ordered", label: "Part Ordered" },
  { value: "part_received", label: "Part Received" },
  { value: "re_open", label: "Re-Open" },
  { value: "gas_charge_pending", label: "Gas Charge Pending" },
  { value: "gas_charge_done", label: "Gas Charge Done" },
  { value: "adjustment_closed", label: "Adjustment Closed" },
  { value: "replacement_done", label: "Replacement Done" },
  { value: "closed", label: "Closed" },
];

interface CaseEntry {
  id: string;
  caseId: string;
  customerName: string;
  phone: string;
  altPhone: string;
  address: string;
  product: string;
  productType: string;
  complaintType: ComplaintType | "";
  status: CaseStatus | "";
  remarks: string;
  createdDate: string;
  closedDate: string;
  partImages: string[];
  caseRelatedImages: string[];
  partCode: string;
  partCodes: Array<{ id: string; value: string }>;
  poNumber: string;
  poNumbers: Array<{ id: string; value: string }>;
}

function newCaseEntry(): CaseEntry {
  return {
    id: Math.random().toString(36).slice(2),
    caseId: "",
    customerName: "",
    phone: "",
    altPhone: "",
    address: "",
    product: "",
    productType: "",
    complaintType: "",
    status: "",
    remarks: "",
    createdDate: new Date().toISOString().split("T")[0],
    closedDate: "",
    partImages: [],
    caseRelatedImages: [],
    partCode: "",
    partCodes: [{ id: Math.random().toString(36).slice(2), value: "" }],
    poNumber: "",
    poNumbers: [{ id: Math.random().toString(36).slice(2), value: "" }],
  };
}

export default function ExistingCasesPage() {
  const { currentUser, addCase, navigate } = useStore();
  const [entries, setEntries] = useState<CaseEntry[]>([newCaseEntry()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="text-foreground font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  const updateEntry = (id: string, field: keyof CaseEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
    setErrors((prev) => {
      const n = { ...prev };
      delete n[`${id}-${field}`];
      return n;
    });
  };

  const addRow = () => setEntries((prev) => [...prev, newCaseEntry()]);

  const removeRow = (id: string) => {
    if (entries.length === 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const e of entries) {
      if (!e.customerName.trim()) errs[`${e.id}-customerName`] = "Required";
      if (!e.phone.trim()) errs[`${e.id}-phone`] = "Required";
      if (!e.complaintType) errs[`${e.id}-complaintType`] = "Required";
      if (!e.status) errs[`${e.id}-status`] = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    for (const e of entries) {
      const savedCase = addCase({
        customerName: e.customerName,
        phone: e.phone,
        altPhone: e.altPhone,
        address: e.address,
        product: e.product,
        productType: e.productType,
        complaintType: e.complaintType as ComplaintType,
        status: e.status as CaseStatus,
        technicianId: "",
        technicianFeedback: "",
        partCode:
          e.partCodes.map((p) => p.value).filter(Boolean)[0] || e.partCode,
        partName: "",
        partPhotoUrl: "",
        poNumber:
          e.poNumbers.map((p) => p.value).filter(Boolean)[0] || e.poNumber,
        poNumbers: e.poNumbers.map((p) => p.value).filter(Boolean),
        orderDate: "",
        receivedDate: "",
        nextActionDate: "",
        remarks: e.remarks,
        additionalNotes: "",
        caseId: e.caseId || "",
      });
      // Add part images as photos
      if (savedCase && e.partImages.length > 0) {
        for (let i = 0; i < e.partImages.length; i++) {
          useStore.getState().addPhotoToCase(savedCase.id, {
            url: e.partImages[i],
            type: "part" as any,
            name: `Part Image ${i + 1}`,
          });
        }
      }
      // Save case related images
      if (savedCase && e.caseRelatedImages.length > 0) {
        const relatedImgs = e.caseRelatedImages.map((url, i) => ({
          id: Math.random().toString(36).slice(2),
          url,
          name: `Case Related Image ${i + 1}`,
        }));
        useStore.getState().updateCase(savedCase.id, {
          caseRelatedImages: relatedImgs as any,
        });
      }
    }
    setSavedCount(entries.length);
    setSaved(true);
  };

  const handleAddMore = () => {
    setEntries([newCaseEntry()]);
    setErrors({});
    setSaved(false);
    setSavedCount(0);
  };

  if (saved) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <ClipboardPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Existing Cases Entry</h1>
              <p className="text-blue-100 text-sm">
                Add historical cases that existed before this system was set up
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4">
            <CheckCircle2 className="h-9 w-9 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Cases Added Successfully!
          </h2>
          <p className="text-muted-foreground mb-6">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-base px-4 py-1">
              {savedCount} case{savedCount !== 1 ? "s" : ""} added
            </Badge>
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAddMore}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" /> Add More Cases
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("cases")}
              className="gap-2"
            >
              Go to Cases <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <ClipboardPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Existing Cases Entry</h1>
            <p className="text-blue-100 text-sm">
              Add historical cases that existed before this system was set up
            </p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-white/20 text-white border-white/30">
              {entries.length} case{entries.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* Entry rows */}
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Row header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <span className="font-semibold text-foreground text-sm">
                  Case Entry #{idx + 1}
                </span>
              </div>
              {entries.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  onClick={() => removeRow(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Case ID */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> Case ID{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  placeholder="e.g. MD-2024-001"
                  value={entry.caseId}
                  onChange={(e) =>
                    updateEntry(entry.id, "caseId", e.target.value)
                  }
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-blue-600" /> Customer Name{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={entry.customerName}
                  onChange={(e) =>
                    updateEntry(entry.id, "customerName", e.target.value)
                  }
                  className={
                    errors[`${entry.id}-customerName`] ? "border-rose-500" : ""
                  }
                  data-ocid="existing-cases.input"
                />
                {errors[`${entry.id}-customerName`] && (
                  <p className="text-xs text-rose-500">
                    {errors[`${entry.id}-customerName`]}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-blue-600" /> Phone{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="10-digit number"
                  value={entry.phone}
                  onChange={(e) =>
                    updateEntry(entry.id, "phone", e.target.value)
                  }
                  className={
                    errors[`${entry.id}-phone`] ? "border-rose-500" : ""
                  }
                />
                {errors[`${entry.id}-phone`] && (
                  <p className="text-xs text-rose-500">
                    {errors[`${entry.id}-phone`]}
                  </p>
                )}
              </div>

              {/* Alt Phone */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-blue-600" /> Alt Phone
                </Label>
                <Input
                  placeholder="Alternative number"
                  value={entry.altPhone}
                  onChange={(e) =>
                    updateEntry(entry.id, "altPhone", e.target.value)
                  }
                />
              </div>

              {/* Address */}
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Address
                </Label>
                <Input
                  placeholder="Customer address"
                  value={entry.address}
                  onChange={(e) =>
                    updateEntry(entry.id, "address", e.target.value)
                  }
                />
              </div>

              {/* Product */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> Product
                </Label>
                <Input
                  placeholder="e.g. AC, Fridge"
                  value={entry.product}
                  onChange={(e) =>
                    updateEntry(entry.id, "product", e.target.value)
                  }
                />
              </div>

              {/* Product Type */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Product Type
                </Label>
                <Input
                  placeholder="e.g. 1.5 Ton Split"
                  value={entry.productType}
                  onChange={(e) =>
                    updateEntry(entry.id, "productType", e.target.value)
                  }
                />
              </div>

              {/* Complaint Type */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> Complaint
                  Type <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={entry.complaintType}
                  onValueChange={(v) =>
                    updateEntry(entry.id, "complaintType", v)
                  }
                >
                  <SelectTrigger
                    className={
                      errors[`${entry.id}-complaintType`]
                        ? "border-rose-500"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`${entry.id}-complaintType`] && (
                  <p className="text-xs text-rose-500">
                    {errors[`${entry.id}-complaintType`]}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> Status{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={entry.status}
                  onValueChange={(v) => updateEntry(entry.id, "status", v)}
                >
                  <SelectTrigger
                    className={
                      errors[`${entry.id}-status`] ? "border-rose-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`${entry.id}-status`] && (
                  <p className="text-xs text-rose-500">
                    {errors[`${entry.id}-status`]}
                  </p>
                )}
              </div>

              {/* Created Date */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Created Date
                </Label>
                <Input
                  type="date"
                  value={entry.createdDate}
                  onChange={(e) =>
                    updateEntry(entry.id, "createdDate", e.target.value)
                  }
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Remarks
                </Label>
                <Textarea
                  placeholder="Any additional remarks..."
                  value={entry.remarks}
                  onChange={(e) =>
                    updateEntry(entry.id, "remarks", e.target.value)
                  }
                  className="resize-none h-20"
                />
              </div>

              {/* Part Codes - only show for part_required status */}
              {entry.status === "part_required" && (
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label className="text-xs font-semibold text-foreground">
                    Part Codes
                  </Label>
                  {entry.partCodes.map((pc) => (
                    <div key={pc.id} className="flex gap-2 items-center">
                      <Input
                        placeholder="Part Code"
                        value={pc.value}
                        onChange={(e) => {
                          setEntries((prev) =>
                            prev.map((en) =>
                              en.id === entry.id
                                ? {
                                    ...en,
                                    partCodes: en.partCodes.map((p) =>
                                      p.id === pc.id
                                        ? { ...p, value: e.target.value }
                                        : p,
                                    ),
                                    partCode: en.partCodes[0]?.value || "",
                                  }
                                : en,
                            ),
                          );
                        }}
                        className="flex-1"
                      />
                      {entry.partCodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEntries((prev) =>
                              prev.map((en) =>
                                en.id === entry.id
                                  ? {
                                      ...en,
                                      partCodes: en.partCodes.filter(
                                        (p) => p.id !== pc.id,
                                      ),
                                      partCode:
                                        en.partCodes.filter(
                                          (p) => p.id !== pc.id,
                                        )[0]?.value || "",
                                    }
                                  : en,
                              ),
                            )
                          }
                          className="text-red-400 hover:text-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEntries((prev) =>
                        prev.map((en) =>
                          en.id === entry.id
                            ? {
                                ...en,
                                partCodes: [
                                  ...en.partCodes,
                                  {
                                    id: Math.random().toString(36).slice(2),
                                    value: "",
                                  },
                                ],
                              }
                            : en,
                        ),
                      )
                    }
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-3 w-3" /> Add Part Code
                  </button>
                </div>
              )}

              {entry.status === "part_ordered" && (
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label className="text-xs font-semibold text-foreground">
                    PO Numbers
                  </Label>
                  {entry.poNumbers.map((po) => (
                    <div key={po.id} className="flex gap-2 items-center">
                      <Input
                        placeholder="PO Number"
                        value={po.value}
                        onChange={(e) => {
                          setEntries((prev) =>
                            prev.map((en) =>
                              en.id === entry.id
                                ? {
                                    ...en,
                                    poNumbers: en.poNumbers.map((p) =>
                                      p.id === po.id
                                        ? { ...p, value: e.target.value }
                                        : p,
                                    ),
                                    poNumber: en.poNumbers[0]?.value || "",
                                  }
                                : en,
                            ),
                          );
                        }}
                        className="flex-1"
                      />
                      {entry.poNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEntries((prev) =>
                              prev.map((en) =>
                                en.id === entry.id
                                  ? {
                                      ...en,
                                      poNumbers: en.poNumbers.filter(
                                        (p) => p.id !== po.id,
                                      ),
                                      poNumber:
                                        en.poNumbers.filter(
                                          (p) => p.id !== po.id,
                                        )[0]?.value || "",
                                    }
                                  : en,
                              ),
                            )
                          }
                          className="text-red-400 hover:text-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEntries((prev) =>
                        prev.map((en) =>
                          en.id === entry.id
                            ? {
                                ...en,
                                poNumbers: [
                                  ...en.poNumbers,
                                  {
                                    id: Math.random().toString(36).slice(2),
                                    value: "",
                                  },
                                ],
                              }
                            : en,
                        ),
                      )
                    }
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-3 w-3" /> Add PO Number
                  </button>
                </div>
              )}

              {/* Closed Date - only show for closed statuses */}
              {[
                "closed",
                "adjustment_closed",
                "replacement_done",
                "gas_charge_done",
              ].includes(entry.status) && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Closed Date
                  </Label>
                  <Input
                    type="date"
                    value={entry.closedDate}
                    onChange={(e) =>
                      updateEntry(entry.id, "closedDate", e.target.value)
                    }
                  />
                </div>
              )}

              {/* Part Images - optional, multiple */}
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Image className="h-3.5 w-3.5 text-blue-600" /> Part Images{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id={`part-images-${entry.id}`}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const urls = await Promise.all(
                      files.map(
                        (f) =>
                          new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              resolve(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }),
                      ),
                    );
                    setEntries((prev) =>
                      prev.map((ent) =>
                        ent.id === entry.id
                          ? { ...ent, partImages: [...ent.partImages, ...urls] }
                          : ent,
                      ),
                    );
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`part-images-${entry.id}`)?.click()
                  }
                  className="flex items-center gap-2 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 w-full hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Image className="h-3 w-3 text-gray-400" />
                  {entry.partImages.length > 0
                    ? `${entry.partImages.length} image${entry.partImages.length > 1 ? "s" : ""} selected`
                    : "Upload Part Images (Optional, Multiple)"}
                </button>
                {entry.partImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {entry.partImages.map((url, idx) => (
                      <img
                        key={url.slice(-20)}
                        src={url}
                        alt={`Part ${idx + 1}`}
                        className="h-16 w-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Case Related Images - optional */}
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Image className="h-3.5 w-3.5 text-violet-600" /> Case Related
                  Images{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional — product photo, serial no, invoice, ratings)
                  </span>
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id={`case-related-images-${entry.id}`}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const urls = await Promise.all(
                      files.map(
                        (f) =>
                          new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              resolve(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }),
                      ),
                    );
                    setEntries((prev) =>
                      prev.map((ent) =>
                        ent.id === entry.id
                          ? {
                              ...ent,
                              caseRelatedImages: [
                                ...ent.caseRelatedImages,
                                ...urls,
                              ],
                            }
                          : ent,
                      ),
                    );
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(`case-related-images-${entry.id}`)
                      ?.click()
                  }
                  className="flex items-center gap-2 text-xs border border-dashed border-violet-300 rounded-lg px-3 py-2 w-full hover:bg-violet-50 dark:hover:bg-violet-900/20"
                >
                  <Image className="h-3 w-3 text-violet-400" />
                  {entry.caseRelatedImages.length > 0
                    ? `${entry.caseRelatedImages.length} image${entry.caseRelatedImages.length > 1 ? "s" : ""} selected`
                    : "Upload Case Related Images (Optional, Multiple)"}
                </button>
                {entry.caseRelatedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {entry.caseRelatedImages.map((url, idx) => (
                      <div key={url.slice(-20)} className="relative group">
                        <img
                          src={url}
                          alt={`Case ${idx + 1}`}
                          className="h-16 w-16 object-cover rounded border border-violet-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEntries((prev) =>
                              prev.map((ent) =>
                                ent.id === entry.id
                                  ? {
                                      ...ent,
                                      caseRelatedImages:
                                        ent.caseRelatedImages.filter(
                                          (_, i) => i !== idx,
                                        ),
                                    }
                                  : ent,
                              ),
                            )
                          }
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <Button
          variant="outline"
          onClick={addRow}
          className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
          data-ocid="existing-cases.primary_button"
        >
          <Plus className="h-4 w-4" /> Add Another Case
        </Button>
        <Button
          onClick={handleSave}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
          data-ocid="existing-cases.submit_button"
        >
          <Save className="h-4 w-4" /> Save All Cases ({entries.length})
        </Button>
      </div>
    </div>
  );
}
