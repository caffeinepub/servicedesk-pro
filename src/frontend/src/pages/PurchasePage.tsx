import {
  CheckCircle2,
  Download,
  Eye,
  IndianRupee,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
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
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useStore } from "../store";
import type {
  PartInventoryItem,
  PartItemStatus,
  PurchaseEntry,
} from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PartLine {
  id: string;
  partCode: string;
  partNameId: string;
  quantity: number;
  costPrice: number;
  partImages: string[];
}

const newPartLine = (id: string): PartLine => ({
  id,
  partCode: "",
  partNameId: "",
  quantity: 1,
  costPrice: 0,
  partImages: [],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB");
};

const downloadImage = (url: string, filename: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

const statusColors: Record<PartItemStatus, string> = {
  in_stock: "bg-green-100 text-green-700 border-green-200",
  issued: "bg-blue-100 text-blue-700 border-blue-200",
  installed: "bg-purple-100 text-purple-700 border-purple-200",
  returned_to_store: "bg-amber-100 text-amber-700 border-amber-200",
  returned_to_company: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<PartItemStatus, string> = {
  in_stock: "In Stock",
  issued: "Issued",
  installed: "Installed",
  returned_to_store: "Returned to Store",
  returned_to_company: "Returned to Company",
};

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <button
      type="button"
      className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center w-full"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
        onClick={onClose}
        data-ocid="purchase.close_button"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt="Full size preview"
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
      />
    </button>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({
  images,
  onUpload,
  onDelete,
  onDownloadFilename,
  allowEdit,
  multiple,
  label,
}: {
  images: string[];
  onUpload: (dataUrls: string[]) => void;
  onDelete: (url: string) => void;
  onDownloadFilename: (idx: number) => string;
  allowEdit: boolean;
  multiple?: boolean;
  label: string;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).map(readFileAsDataURL));
    onUpload(urls);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        {allowEdit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
            data-ocid="purchase.upload_button"
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {images.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No images uploaded</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {images.map((url, idx) => (
            <div
              key={url}
              className="relative group border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-slate-50"
            >
              <button
                type="button"
                className="block h-16 w-16 p-0 border-0 bg-transparent cursor-pointer"
                onClick={() => setLightbox(url)}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={url}
                  alt={`Part ${idx + 1}`}
                  className="h-16 w-16 object-cover"
                />
              </button>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="text-white p-1 rounded hover:bg-white/20"
                  title="View"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => downloadImage(url, onDownloadFilename(idx))}
                  className="text-white p-1 rounded hover:bg-white/20"
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </button>
                {allowEdit && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(url)}
                    className="text-red-300 p-1 rounded hover:bg-white/20"
                    title="Delete"
                    data-ocid="purchase.delete_button"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent data-ocid="purchase.dialog">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete this image? This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="purchase.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget);
                setDeleteTarget(null);
              }}
              data-ocid="purchase.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────
function InvoiceDetailModal({
  purchase,
  onClose,
}: {
  purchase: PurchaseEntry;
  onClose: () => void;
}) {
  const {
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    addPartImages,
    removePartImage,
    updatePurchaseInvoiceImage,
    removePurchaseInvoiceImage,
    vendors,
    users,
  } = useStore();

  const items: PartInventoryItem[] = partItems.filter(
    (p) => p.purchaseId === purchase.id,
  );

  const createdByUser = users?.find?.(
    (u: { id: string }) => u.id === purchase.createdBy,
  );
  const createdByName = createdByUser?.name ?? purchase.createdBy ?? "—";

  const vendorObj = vendors.find((v) => v.id === purchase.vendorId);
  const vendorName = vendorObj?.name ?? purchase.vendorName ?? "—";

  const totalUnits = items.length;

  const invoiceImages: string[] = purchase.invoiceImageUrl
    ? [purchase.invoiceImageUrl]
    : [];

  const getPartBreadcrumb = (item: PartInventoryItem) => {
    const company =
      stockCompanies.find((c) => c.id === item.companyId)?.name ??
      item.companyId;
    const category =
      stockCategories.find((c) => c.id === item.categoryId)?.name ??
      item.categoryId;
    const partName =
      stockPartNames.find((p) => p.id === item.partNameId)?.name ??
      item.partNameId;
    return `${company} > ${category} > ${partName}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        data-ocid="purchase.modal"
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Invoice: {purchase.invoiceNumber}
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {vendorName} — {formatDate(purchase.invoiceDate)}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Details Grid */}
          <Card className="bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                    Vendor
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {vendorName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                    Date
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatDate(purchase.invoiceDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                    Total Units
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {totalUnits}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                    Created By
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {createdByName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Image Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
              Invoice Image
            </h3>
            <ImageGallery
              images={invoiceImages}
              onUpload={async (urls) => {
                if (urls[0]) updatePurchaseInvoiceImage(purchase.id, urls[0]);
              }}
              onDelete={() => removePurchaseInvoiceImage(purchase.id)}
              onDownloadFilename={(i) =>
                `invoice-${purchase.invoiceNumber}-${i + 1}.jpg`
              }
              allowEdit
              label=""
            />
          </div>

          {/* Part Codes Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
              Part Codes ({items.length})
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                No parts found for this invoice.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const partImages =
                    item.partImageUrls ??
                    (item.imageUrl ? [item.imageUrl] : []);
                  return (
                    <Card
                      key={item.id}
                      className="border border-slate-200 dark:border-slate-700"
                    >
                      <CardContent className="pt-3 pb-4">
                        {/* Part code + cost row */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {item.partCode}
                          </span>
                          {purchase.costPrice != null &&
                            purchase.costPrice > 0 && (
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                ₹{purchase.costPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                        </div>
                        {/* Breadcrumb */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {getPartBreadcrumb(item)}
                        </p>
                        {/* Status badge */}
                        <span
                          className={`inline-block text-xs font-medium px-2 py-0.5 rounded border mb-3 ${statusColors[item.status as PartItemStatus] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {statusLabels[item.status as PartItemStatus] ??
                            item.status}
                        </span>
                        {/* Part images */}
                        <ImageGallery
                          images={partImages}
                          onUpload={(urls) => addPartImages(item.id, urls)}
                          onDelete={(url) => removePartImage(item.id, url)}
                          onDownloadFilename={(i) =>
                            `part-${item.partCode}-${i + 1}.jpg`
                          }
                          allowEdit
                          multiple
                          label="Part Images"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── New Purchase Modal ───────────────────────────────────────────────────────
function NewPurchaseModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    stockCompanies,
    stockCategories,
    stockPartNames,
    vendors,
    addPurchaseEntry,
  } = useStore();

  // Invoice-level state
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceImageUrl, setInvoiceImageUrl] = useState("");
  const [invoiceCompanyId, setInvoiceCompanyId] = useState("");
  const [invoiceCategoryId, setInvoiceCategoryId] = useState("");
  const [deleteInvoiceDialog, setDeleteInvoiceDialog] = useState(false);

  // Part lines state
  const [partLines, setPartLines] = useState<PartLine[]>(() => [
    newPartLine("1"),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nextId = useRef(2);

  const invoiceImageRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setVendorId("");
    setVendorName("");
    setInvoiceNumber("");
    setInvoiceDate("");
    setInvoiceImageUrl("");
    setInvoiceCompanyId("");
    setInvoiceCategoryId("");
    setPartLines([newPartLine("1")]);
    setErrors({});
    nextId.current = 2;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Part line helpers ────────────────────────────────────────────────────
  const addPartLine = () => {
    const id = String(nextId.current++);
    setPartLines((prev) => [...prev, newPartLine(id)]);
  };

  const removePartLine = (id: string) => {
    setPartLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updatePartLine = (id: string, updates: Partial<PartLine>) => {
    setPartLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    );
  };

  const addPartLineImages = async (id: string, files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).map(readFileAsDataURL));
    setPartLines((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, partImages: [...l.partImages, ...urls] } : l,
      ),
    );
  };

  const removePartLineImage = (id: string, url: string) => {
    setPartLines((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, partImages: l.partImages.filter((u) => u !== url) }
          : l,
      ),
    );
  };

  // ── Invoice image ────────────────────────────────────────────────────────
  const handleInvoiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setInvoiceImageUrl(dataUrl);
    // Reset input so same file can be re-selected
    if (invoiceImageRef.current) invoiceImageRef.current.value = "";
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!vendorName.trim()) errs.vendorName = "Select or enter a vendor";
    if (!invoiceNumber.trim()) errs.invoiceNumber = "Required";
    if (!invoiceDate) errs.invoiceDate = "Required";

    const seenCodes = new Map<string, number>();
    partLines.forEach((line, i) => {
      const code = line.partCode.trim().toLowerCase();
      if (!line.partCode.trim()) {
        errs[`partCode_${line.id}`] = "Part code is required";
      } else if (seenCodes.has(code)) {
        errs[`partCode_${line.id}`] = "Duplicate part code in this entry";
        const prevIdx = seenCodes.get(code)!;
        errs[`partCode_${partLines[prevIdx].id}`] =
          "Duplicate part code in this entry";
      } else {
        seenCodes.set(code, i);
      }
      if (!line.partNameId) errs[`partName_${line.id}`] = "Required";
      if (!line.quantity || line.quantity < 1) errs[`qty_${line.id}`] = "Min 1";
    });
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // For each part line, call addPurchaseEntry once.
    // Generate `quantity` identical part code objects per line.
    for (const line of partLines) {
      const partCodeItems = Array.from({ length: line.quantity }, (_, i) => ({
        code: line.partCode.trim(),
        rackId: "",
        shelfId: "",
        binId: "",
        imageUrl: line.partImages[i] ?? line.partImages[0] ?? "",
      }));

      addPurchaseEntry(
        {
          vendorName,
          vendorId: vendorId || undefined,
          invoiceNumber,
          invoiceDate,
          companyId: invoiceCompanyId,
          categoryId: invoiceCategoryId,
          partNameId: line.partNameId,
          quantity: line.quantity,
          invoiceImageUrl: invoiceImageUrl || undefined,
          costPrice: line.costPrice || undefined,
        },
        partCodeItems,
      );
    }

    toast.success("Purchase entry saved");
    reset();
    onSuccess();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-2xl w-full"
          style={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
          data-ocid="purchase.modal"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              New Purchase Entry
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto pr-1">
            <div className="space-y-5 py-1">
              {/* ── Section 1: Invoice Info ── */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Invoice Information
                </p>

                {/* Vendor */}
                <div>
                  <Label>Vendor *</Label>
                  {vendors.length > 0 ? (
                    <Select
                      value={vendorId || undefined}
                      onValueChange={(v) => {
                        const vObj = vendors.find((x) => x.id === v);
                        setVendorId(v);
                        setVendorName(vObj?.name ?? "");
                      }}
                    >
                      <SelectTrigger data-ocid="purchase.select">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={vendorName}
                      onChange={(e) => {
                        setVendorName(e.target.value);
                      }}
                      placeholder="Enter vendor name"
                      data-ocid="purchase.input"
                    />
                  )}
                  {errors.vendorName && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid="purchase.error_state"
                    >
                      {errors.vendorName}
                    </p>
                  )}
                </div>

                {/* Invoice Number + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Number *</Label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => {
                        setInvoiceNumber(e.target.value);
                      }}
                      placeholder="INV-2024-XXX"
                      data-ocid="purchase.input"
                    />
                    {errors.invoiceNumber && (
                      <p
                        className="text-xs text-red-500 mt-1"
                        data-ocid="purchase.error_state"
                      >
                        {errors.invoiceNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Invoice Date *</Label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => {
                        setInvoiceDate(e.target.value);
                      }}
                      data-ocid="purchase.input"
                    />
                    {errors.invoiceDate && (
                      <p
                        className="text-xs text-red-500 mt-1"
                        data-ocid="purchase.error_state"
                      >
                        {errors.invoiceDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Invoice Image */}
                <div>
                  <Label>Invoice Image (optional)</Label>
                  {!invoiceImageUrl ? (
                    <button
                      type="button"
                      onClick={() => invoiceImageRef.current?.click()}
                      className="mt-1 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors w-full justify-center"
                      data-ocid="purchase.upload_button"
                    >
                      <Upload className="h-4 w-4" /> Upload Invoice Image
                    </button>
                  ) : (
                    <div className="mt-1 flex items-center gap-3">
                      <img
                        src={invoiceImageUrl}
                        alt="Invoice preview"
                        className="h-16 w-24 rounded border border-slate-200 object-cover"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => invoiceImageRef.current?.click()}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteInvoiceDialog(true)}
                          className="text-xs text-red-500 hover:underline"
                          data-ocid="purchase.delete_button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={invoiceImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInvoiceImage}
                  />
                </div>
              </div>

              {/* ── Company + Category (invoice-level) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Company *</Label>
                  <Select
                    value={invoiceCompanyId || undefined}
                    onValueChange={(v) => {
                      setInvoiceCompanyId(v);
                      setInvoiceCategoryId("");
                    }}
                  >
                    <SelectTrigger data-ocid="purchase.select">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockCompanies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.invoiceCompany && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid="purchase.error_state"
                    >
                      {errors.invoiceCompany}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={invoiceCategoryId || undefined}
                    onValueChange={setInvoiceCategoryId}
                  >
                    <SelectTrigger data-ocid="purchase.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.invoiceCategory && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid="purchase.error_state"
                    >
                      {errors.invoiceCategory}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Section 2: Part Lines ── */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Part Lines
                  </p>
                  <span className="text-xs text-slate-400">
                    {partLines.length} part type
                    {partLines.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-4">
                  {partLines.map((line, idx) => (
                    <PartLineCard
                      key={line.id}
                      line={line}
                      index={idx}
                      totalLines={partLines.length}
                      invoiceCompanyId={invoiceCompanyId}
                      invoiceCategoryId={invoiceCategoryId}
                      stockPartNames={stockPartNames}
                      errors={errors}
                      onUpdate={(updates) => updatePartLine(line.id, updates)}
                      onRemove={() => removePartLine(line.id)}
                      onAddImages={(files) => addPartLineImages(line.id, files)}
                      onRemoveImage={(url) => removePartLineImage(line.id, url)}
                    />
                  ))}
                </div>

                {/* Add New Part button */}
                <button
                  type="button"
                  onClick={addPartLine}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2.5 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors w-full justify-center"
                  data-ocid="purchase.button"
                >
                  <Plus className="h-4 w-4" />
                  Add New Part Code
                </button>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={handleClose}
              data-ocid="purchase.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="purchase.submit_button"
            >
              Save Purchase Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Image Dialog */}
      <Dialog open={deleteInvoiceDialog} onOpenChange={setDeleteInvoiceDialog}>
        <DialogContent data-ocid="purchase.dialog">
          <DialogHeader>
            <DialogTitle>Delete Invoice Image</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete this invoice image? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteInvoiceDialog(false)}
              data-ocid="purchase.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setInvoiceImageUrl("");
                setDeleteInvoiceDialog(false);
              }}
              data-ocid="purchase.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Part Line Card ───────────────────────────────────────────────────────────
function PartLineCard({
  line,
  index,
  totalLines,
  invoiceCompanyId: _invoiceCompanyId,
  invoiceCategoryId: _invoiceCategoryId,
  stockPartNames,
  errors,
  onUpdate,
  onRemove,
  onAddImages,
  onRemoveImage,
}: {
  line: PartLine;
  index: number;
  totalLines: number;
  invoiceCompanyId: string;
  invoiceCategoryId: string;
  stockPartNames: { id: string; name: string }[];
  errors: Record<string, string>;
  onUpdate: (updates: Partial<PartLine>) => void;
  onRemove: () => void;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (url: string) => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleteImgTarget, setDeleteImgTarget] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-800/40"
      data-ocid={`purchase.item.${index + 1}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Part Line {index + 1}
          </span>
        </div>
        {totalLines > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
            title="Remove this part line"
            data-ocid="purchase.delete_button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Part Code + Quantity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Part Code *</Label>
          <Input
            value={line.partCode}
            onChange={(e) => onUpdate({ partCode: e.target.value })}
            placeholder="e.g. PCB-1234"
            className="font-mono"
            data-ocid="purchase.input"
          />
          {errors[`partCode_${line.id}`] && (
            <p
              className="text-xs text-red-500 mt-1"
              data-ocid="purchase.error_state"
            >
              {errors[`partCode_${line.id}`]}
            </p>
          )}
        </div>
        <div>
          <Label className="text-xs">Quantity *</Label>
          <Input
            type="number"
            min={1}
            max={200}
            value={line.quantity}
            onChange={(e) =>
              onUpdate({ quantity: Math.max(1, Number(e.target.value) || 1) })
            }
            data-ocid="purchase.input"
          />
          {errors[`qty_${line.id}`] && (
            <p
              className="text-xs text-red-500 mt-1"
              data-ocid="purchase.error_state"
            >
              {errors[`qty_${line.id}`]}
            </p>
          )}
        </div>
      </div>

      {/* Part Name */}
      <div>
        <Label className="text-xs">Part Name *</Label>
        <Select
          value={line.partNameId || undefined}
          onValueChange={(v) => onUpdate({ partNameId: v })}
        >
          <SelectTrigger className="h-9 text-xs" data-ocid="purchase.select">
            <SelectValue placeholder="Select part name" />
          </SelectTrigger>
          <SelectContent>
            {stockPartNames.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[`partName_${line.id}`] && (
          <p
            className="text-xs text-red-500 mt-1"
            data-ocid="purchase.error_state"
          >
            {errors[`partName_${line.id}`]}
          </p>
        )}
      </div>

      {/* Cost Price */}
      <div className="max-w-36">
        <Label className="text-xs">Cost Price per Unit (optional)</Label>
        <Input
          type="number"
          min={0}
          value={line.costPrice || ""}
          onChange={(e) => onUpdate({ costPrice: Number(e.target.value) || 0 })}
          placeholder="₹ 0"
          className="text-xs"
          data-ocid="purchase.input"
        />
      </div>

      {/* Part Images */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs">Part Images (optional)</Label>
          <button
            type="button"
            onClick={() => imgInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
            data-ocid="purchase.upload_button"
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onAddImages(e.target.files)}
          />
        </div>
        {line.partImages.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No images</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {line.partImages.map((url, i) => (
              <div
                key={url}
                className="relative group border border-slate-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="block h-14 w-14 p-0 border-0 bg-transparent cursor-pointer"
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={url}
                    alt={`Part ${i + 1}`}
                    className="h-14 w-14 object-cover"
                  />
                </button>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLightbox(url)}
                    className="text-white p-1 rounded hover:bg-white/20"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadImage(url, `part-image-${i + 1}.jpg`)
                    }
                    className="text-white p-1 rounded hover:bg-white/20"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteImgTarget(url)}
                    className="text-red-300 p-1 rounded hover:bg-white/20"
                    data-ocid="purchase.delete_button"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* Delete image confirmation */}
      <Dialog
        open={!!deleteImgTarget}
        onOpenChange={() => setDeleteImgTarget(null)}
      >
        <DialogContent data-ocid="purchase.dialog">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete this image?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteImgTarget(null)}
              data-ocid="purchase.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteImgTarget) onRemoveImage(deleteImgTarget);
                setDeleteImgTarget(null);
              }}
              data-ocid="purchase.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PurchasePage() {
  const { vendors, purchaseEntries, navVendorId, clearNavVendorId } =
    useStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Purchases List state ───────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");

  // Pre-filter by vendor when navigated from Vendors page
  useEffect(() => {
    if (navVendorId) {
      setVendorFilter(navVendorId);
      clearNavVendorId();
    }
  }, [navVendorId, clearNavVendorId]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseEntry | null>(null);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  // ── Filtered purchases ─────────────────────────────────────────────────────
  const filtered = [...purchaseEntries]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((p) => {
      if (
        search &&
        !p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (
        vendorFilter !== "all" &&
        p.vendorId !== vendorFilter &&
        p.vendorName !== vendorFilter
      )
        return false;
      if (dateFrom && p.invoiceDate < dateFrom) return false;
      if (dateTo && p.invoiceDate > dateTo) return false;
      return true;
    });

  const getVendorName = (p: PurchaseEntry) => {
    const v = vendors.find((x) => x.id === p.vendorId);
    return v?.name ?? p.vendorName ?? "—";
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Purchase Entry</h1>
            <p className="text-indigo-200 text-sm">
              Record vendor purchases and manage inventory stock
            </p>
          </div>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0 gap-2"
          data-ocid="purchase.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Add Purchase
        </Button>
      </div>

      {success && (
        <div
          className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3"
          data-ocid="purchase.success_state"
        >
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">
            Purchase entry saved successfully! Parts added to inventory.
          </span>
        </div>
      )}

      {/* ── Purchases List ───────────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Purchases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by invoice number..."
                className="pl-9"
                data-ocid="purchase.search_input"
              />
            </div>
            <div className="min-w-[150px]">
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger data-ocid="purchase.select">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36 text-xs"
                data-ocid="purchase.input"
              />
              <span className="text-slate-400 text-sm">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36 text-xs"
                data-ocid="purchase.input"
              />
            </div>
          </div>

          {/* Purchases table */}
          {filtered.length === 0 ? (
            <div
              className="text-center py-10 text-slate-400"
              data-ocid="purchase.empty_state"
            >
              <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No purchases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Invoice
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Vendor
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Units
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      data-ocid={`purchase.row.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPurchase(p)}
                          className="font-mono text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          data-ocid={`purchase.link.${idx + 1}`}
                        >
                          {p.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {getVendorName(p)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatDate(p.invoiceDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {p.quantity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPurchase(p)}
                          className="h-7 text-xs gap-1"
                          data-ocid={`purchase.button.${idx + 1}`}
                        >
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── New Purchase Modal ────────────────────────────────────────────── */}
      <NewPurchaseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* ── Invoice Detail Modal ──────────────────────────────────────────── */}
      {selectedPurchase && (
        <InvoiceDetailModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
}
