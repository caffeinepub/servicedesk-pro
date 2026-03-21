import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Download,
  Eye,
  FileText,
  Image,
  Layers,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Tag,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
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
  in_stock: "bg-green-100 text-green-700 border-green-200",
  issued: "bg-amber-100 text-amber-700 border-amber-200",
  installed: "bg-blue-100 text-blue-700 border-blue-200",
  returned_to_company: "bg-red-100 text-red-700 border-red-200",
  returned_to_store: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Warehouse",
  issued: "Issued",
  installed: "Installed",
  returned_to_company: "Returned to Company",
  returned_to_store: "Returned to Store",
};

// Lifecycle dot colors per event type
function getLifecycleDotColor(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes("purchas")) return "#3b82f6"; // blue
  if (lower.includes("stored") || lower.includes("stock")) return "#14b8a6"; // teal
  if (lower.includes("issued") || lower.includes("issue")) return "#f97316"; // orange
  if (
    lower.includes("returned unused") ||
    lower.includes("return to store") ||
    lower.includes("returned to store")
  )
    return "#22c55e"; // green
  if (lower.includes("defective")) return "#ef4444"; // red
  if (lower.includes("installed")) return "#10b981"; // emerald
  if (
    lower.includes("returned to company") ||
    lower.includes("return to company")
  )
    return "#a855f7"; // purple
  if (lower.includes("returned defective")) return "#ef4444"; // red
  if (lower.includes("returned installed")) return "#10b981"; // emerald
  if (lower.includes("relocated") || lower.includes("location"))
    return "#f59e0b"; // amber
  if (lower.includes("return")) return "#22c55e"; // green for other returns
  return "#64748b"; // slate default
}

// Convert base64/url to a download
function downloadImage(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

// File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
    vendors,
    navigate,
    issuePartToTechnician,
    markPartInstalled,
    returnPartToStore,
    returnPartToCompany,
    assignPartLocation,
    addPartImages,
    removePartImage,
    updatePurchaseInvoiceImage,
    removePurchaseInvoiceImage,
  } = useStore();

  const part = partItems.find((p) => p.id === selectedPartId);

  // Lifecycle sorted oldest first (chronological)
  const lifecycle = partLifecycle
    .filter((l) => l.partId === selectedPartId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

  // Issue dialog
  const [issueDialog, setIssueDialog] = useState(false);
  const [issueTechId, setIssueTechId] = useState("");
  const [issueCaseId, setIssueCaseId] = useState("");
  const [issueNotes, setIssueNotes] = useState("");

  // Return to store dialog
  const [returnDialog, setReturnDialog] = useState(false);
  const [returnRemarks, setReturnRemarks] = useState("");

  // Return to company form state (inline in left col)
  const [rtcVendorId, setRtcVendorId] = useState("");
  const [rtcRef, setRtcRef] = useState("");
  const [rtcDate, setRtcDate] = useState(new Date().toISOString().slice(0, 10));
  const [rtcReason, setRtcReason] = useState("");
  const [rtcNotes, setRtcNotes] = useState("");

  // Relocate inline form
  const [showRtcConfirm, setShowRtcConfirm] = useState(false);

  // Relocate inline form
  const [showRelocate, setShowRelocate] = useState(false);
  const [relRack, setRelRack] = useState("");
  const [relShelf, setRelShelf] = useState("");
  const [relBin, setRelBin] = useState("");

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    open: boolean;
    type: "part" | "invoice";
    url?: string;
    purchaseId?: string;
  }>({ open: false, type: "part" });
  const partImageInputRef = useRef<HTMLInputElement>(null);
  const invoiceImageInputRef = useRef<HTMLInputElement>(null);

  // Derive values (must be before early return to satisfy hooks rules)
  const purchase = purchaseEntries.find((pe) => pe.id === part?.purchaseId);
  const company =
    stockCompanies.find((c) => c.id === part?.companyId)?.name ?? "";
  const category =
    stockCategories.find((c) => c.id === part?.categoryId)?.name ?? "";
  const partName =
    stockPartNames.find((p) => p.id === part?.partNameId)?.name ?? "";
  const tech = technicians.find((t) => t.id === part?.technicianId);
  const rack = racks.find((r) => r.id === part?.rackId);
  const shelf = shelves.find((s) => s.id === part?.shelfId);
  const bin = bins.find((b) => b.id === part?.binId);

  const aggregateStockCount = useMemo(
    () =>
      partItems.filter(
        (p) => p.partCode === part?.partCode && p.status === "in_stock",
      ).length,
    [partItems, part],
  );

  const uniqueVendors = useMemo(() => {
    if (!part) return [];
    const purchasesForPart = purchaseEntries.filter((pe) =>
      partItems.some(
        (pi) => pi.purchaseId === pe.id && pi.partCode === part.partCode,
      ),
    );
    const seen = new Set<string>();
    return purchasesForPart.filter((pe) => {
      const key = pe.vendorId ?? pe.vendorName;
      if (seen.has(key ?? "")) return false;
      seen.add(key ?? "");
      return true;
    });
  }, [purchaseEntries, partItems, part]);

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

  const singleVendorName =
    uniqueVendors.length === 1
      ? ((uniqueVendors[0].vendorId
          ? vendors.find((v) => v.id === uniqueVendors[0].vendorId)?.name
          : uniqueVendors[0].vendorName) ?? "—")
      : null;

  // Relocate selects
  const filteredShelves = shelves.filter((s) => s.rackId === relRack);
  const filteredBins = bins.filter((b) => b.shelfId === relShelf);

  const handleRelocateConfirm = () => {
    if (!relRack) return;
    assignPartLocation(part.id, relRack, relShelf, relBin);
    setShowRelocate(false);
    setRelRack("");
    setRelShelf("");
    setRelBin("");
  };

  const handleRtcSubmit = () => {
    if (!rtcReason.trim()) return;
    returnPartToCompany(part.id, rtcReason.trim(), rtcNotes);
    setRtcReason("");
    setRtcNotes("");
  };

  const handlePartImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const base64s = await Promise.all(
        Array.from(files).map((f) => fileToBase64(f)),
      );
      addPartImages(part.id, base64s);
    } finally {
      setUploadingImages(false);
      if (partImageInputRef.current) partImageInputRef.current.value = "";
    }
  };

  const handleInvoiceImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!purchase) return;
    setUploadingInvoice(true);
    try {
      const base64 = await fileToBase64(files[0]);
      updatePurchaseInvoiceImage(purchase.id, base64);
    } finally {
      setUploadingInvoice(false);
      if (invoiceImageInputRef.current) invoiceImageInputRef.current.value = "";
    }
  };

  const formattedDate = new Date(part.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // All part images (combine partImageUrls and legacy imageUrl)
  const allPartImages: string[] = [
    ...(part.partImageUrls ?? []),
    ...(part.imageUrl && !(part.partImageUrls ?? []).includes(part.imageUrl)
      ? [part.imageUrl]
      : []),
  ];

  const isReturnedToCompany = part.status === "returned_to_company";

  return (
    <div className="space-y-4 pb-8">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("inventory")}
          data-ocid="part.button"
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              {part.partCode}
            </h1>
            {part.status !== "in_stock" && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  STATUS_STYLES[part.status]
                }`}
              >
                {STATUS_LABELS[part.status]}
              </span>
            )}
            {part.status === "in_stock" &&
              !part.rackId &&
              !part.shelfId &&
              !part.binId && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-semibold">
                  Pending Location
                </span>
              )}
            {part.status === "in_stock" &&
              (part.rackId || part.shelfId || part.binId) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                  In Warehouse
                </span>
              )}
            {part.status === "in_stock" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {aggregateStockCount} in stock
              </span>
            )}
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 flex-wrap">
            <Building2 className="h-3 w-3" />
            <span>{company}</span>
            <span className="text-slate-300">›</span>
            <Layers className="h-3 w-3" />
            <span>{category}</span>
            <span className="text-slate-300">›</span>
            <Package className="h-3 w-3" />
            <span>{partName}</span>
          </div>
        </div>
      </div>

      {/* ── Returned to Company Banner ── */}
      {isReturnedToCompany && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span className="font-semibold text-red-700 text-base">
              Returned to Company
            </span>
          </div>
          <div className="text-xs text-slate-500 ml-7">
            {company} › {category} › {partName}
          </div>
          <p className="text-xs text-red-400 mt-1 ml-7">
            No further actions available
          </p>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── LEFT column (2/3) ── */}
        <div className="md:col-span-2 space-y-4">
          {/* Part Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-500" />
                Part Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-slate-100">
                {(
                  [
                    [
                      "Part Code",
                      <span
                        key="code"
                        className="font-mono font-semibold text-blue-600"
                      >
                        {part.partCode}
                      </span>,
                    ],
                    ["Part Name", partName],
                    [
                      "Stock",
                      <span
                        key="stock"
                        className="font-semibold text-green-700"
                      >
                        {aggregateStockCount} units
                      </span>,
                    ],
                    ["Company", company],
                    ["Category", category],
                    ["Added", formattedDate],
                  ] as [string, React.ReactNode][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location - hidden if returned to company */}
          {!isReturnedToCompany && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {rack ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-700">
                      {rack.name}
                    </span>
                    {shelf && (
                      <>
                        <span className="text-slate-400 text-xs">›</span>
                        <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-700">
                          {shelf.name}
                        </span>
                      </>
                    )}
                    {bin && (
                      <>
                        <span className="text-slate-400 text-xs">›</span>
                        <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-700">
                          {bin.name}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Location Pending</span>
                  </div>
                )}

                {part.status === "in_stock" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    onClick={() => {
                      setShowRelocate(!showRelocate);
                      setRelRack(part.rackId ?? "");
                      setRelShelf(part.shelfId ?? "");
                      setRelBin(part.binId ?? "");
                    }}
                    data-ocid="part.secondary_button"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {rack ? "Relocate" : "Assign Location"}
                  </Button>
                )}

                {showRelocate && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                    <div>
                      <label
                        htmlFor="rel-rack"
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Rack
                      </label>
                      <select
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="rel-rack"
                        value={relRack}
                        onChange={(e) => {
                          setRelRack(e.target.value);
                          setRelShelf("");
                          setRelBin("");
                        }}
                        data-ocid="part.select"
                      >
                        <option value="">— Select Rack —</option>
                        {racks.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="rel-shelf"
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Shelf
                      </label>
                      <select
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        id="rel-shelf"
                        value={relShelf}
                        onChange={(e) => {
                          setRelShelf(e.target.value);
                          setRelBin("");
                        }}
                        disabled={!relRack}
                        data-ocid="part.select"
                      >
                        <option value="">— Select Shelf —</option>
                        {filteredShelves.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="rel-bin"
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Bin
                      </label>
                      <select
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        id="rel-bin"
                        value={relBin}
                        onChange={(e) => setRelBin(e.target.value)}
                        disabled={!relShelf}
                        data-ocid="part.select"
                      >
                        <option value="">— Select Bin —</option>
                        {filteredBins.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowRelocate(false)}
                        data-ocid="part.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRelocateConfirm}
                        disabled={!relRack}
                        data-ocid="part.confirm_button"
                      >
                        Confirm Relocation
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Part Images */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Image className="h-4 w-4 text-blue-500" />
                Part Images
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Hidden file input */}
              <input
                ref={partImageInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePartImagesUpload(e.target.files)}
              />

              {allPartImages.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {allPartImages.map((url, i) => (
                      <div
                        key={url || i}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                        data-ocid={`part.item.${i + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Part ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="View"
                            className="bg-white/90 hover:bg-white rounded-lg p-1.5 text-slate-700 transition-colors"
                            onClick={() => setLightboxUrl(url)}
                            data-ocid="part.button"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Download"
                            className="bg-white/90 hover:bg-white rounded-lg p-1.5 text-slate-700 transition-colors"
                            onClick={() =>
                              downloadImage(
                                url,
                                `part-${part.partCode}-${i + 1}.jpg`,
                              )
                            }
                            data-ocid="part.button"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {!isReturnedToCompany && (
                            <button
                              type="button"
                              title="Delete"
                              className="bg-red-500/90 hover:bg-red-500 rounded-lg p-1.5 text-white transition-colors"
                              onClick={() =>
                                setDeleteConfirmState({
                                  open: true,
                                  type: "part",
                                  url,
                                })
                              }
                              data-ocid="part.delete_button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {allPartImages.length} image
                    {allPartImages.length !== 1 ? "s" : ""} — hover to
                    view/download/delete
                  </p>
                </div>
              ) : (
                <div
                  className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg"
                  data-ocid="part.empty_state"
                >
                  <Image className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No images uploaded</p>
                </div>
              )}

              {!isReturnedToCompany && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => partImageInputRef.current?.click()}
                    disabled={uploadingImages}
                    data-ocid="part.upload_button"
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {uploadingImages ? "Uploading..." : "Upload Images"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Purchase Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-slate-100">
                {(
                  [
                    ["Vendor", purchase?.vendorName ?? "—"],
                    ["Invoice No.", purchase?.invoiceNumber ?? "—"],
                    ["Purchase Date", purchase?.invoiceDate ?? "—"],
                    [
                      "Cost",
                      purchase?.costPrice != null
                        ? `₹${purchase.costPrice.toLocaleString()}`
                        : "—",
                    ],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              {/* Invoice image section */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-600 mb-2">
                  Invoice Image
                </p>
                {/* Hidden file input */}
                <input
                  ref={invoiceImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleInvoiceImageUpload(e.target.files)}
                />

                {purchase?.invoiceImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                      <img
                        src={purchase.invoiceImageUrl}
                        alt="Invoice"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="View"
                          className="bg-white/90 hover:bg-white rounded-lg p-1.5 text-slate-700"
                          onClick={() =>
                            setLightboxUrl(purchase.invoiceImageUrl!)
                          }
                          data-ocid="part.button"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Download"
                          className="bg-white/90 hover:bg-white rounded-lg p-1.5 text-slate-700"
                          onClick={() =>
                            downloadImage(
                              purchase.invoiceImageUrl!,
                              `invoice-${purchase.invoiceNumber}.jpg`,
                            )
                          }
                          data-ocid="part.button"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {!isReturnedToCompany && (
                          <button
                            type="button"
                            title="Delete"
                            className="bg-red-500/90 hover:bg-red-500 rounded-lg p-1.5 text-white"
                            onClick={() =>
                              setDeleteConfirmState({
                                open: true,
                                type: "invoice",
                                purchaseId: purchase.id,
                              })
                            }
                            data-ocid="part.delete_button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {!isReturnedToCompany && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1.5 text-xs"
                        onClick={() => invoiceImageInputRef.current?.click()}
                        disabled={uploadingInvoice}
                        data-ocid="part.upload_button"
                      >
                        <Plus className="h-3 w-3" />
                        {uploadingInvoice
                          ? "Uploading..."
                          : "Replace Invoice Image"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">No invoice image</p>
                    {!isReturnedToCompany && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1.5 text-xs"
                        onClick={() => invoiceImageInputRef.current?.click()}
                        disabled={uploadingInvoice || !purchase}
                        data-ocid="part.upload_button"
                      >
                        <Plus className="h-3 w-3" />
                        {uploadingInvoice
                          ? "Uploading..."
                          : "Upload Invoice Image"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Return to Company (only in_stock, not returned_to_company) */}
          {part.status === "in_stock" && (
            <Card className="shadow-sm border-red-100">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Return to Company
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    This action is permanent and cannot be undone. Once a part
                    is returned to company, it cannot be reissued or relocated.
                  </p>
                </div>
                {/* Vendor */}
                {singleVendorName ? (
                  <div>
                    <Label className="text-xs text-slate-500">Vendor</Label>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {singleVendorName}
                    </p>
                  </div>
                ) : uniqueVendors.length > 1 ? (
                  <div>
                    <Label
                      className="text-xs text-slate-500"
                      htmlFor="rtc-vendor"
                    >
                      Vendor
                    </Label>
                    <select
                      id="rtc-vendor"
                      className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      value={rtcVendorId}
                      onChange={(e) => setRtcVendorId(e.target.value)}
                      data-ocid="part.select"
                    >
                      <option value="">— Select Vendor —</option>
                      {uniqueVendors.map((pe) => {
                        const vName = pe.vendorId
                          ? vendors.find((v) => v.id === pe.vendorId)?.name
                          : pe.vendorName;
                        return (
                          <option
                            key={pe.vendorId ?? pe.vendorName}
                            value={pe.vendorId ?? pe.vendorName ?? ""}
                          >
                            {vName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : null}

                <div>
                  <Label className="text-xs text-slate-500" htmlFor="rtc-ref">
                    Reference No.{" "}
                    <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Input
                    id="rtc-ref"
                    className="mt-1 text-sm"
                    placeholder="e.g. RTN-001"
                    value={rtcRef}
                    onChange={(e) => setRtcRef(e.target.value)}
                    data-ocid="part.input"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-500" htmlFor="rtc-date">
                    Date
                  </Label>
                  <Input
                    id="rtc-date"
                    type="date"
                    className="mt-1 text-sm"
                    value={rtcDate}
                    onChange={(e) => setRtcDate(e.target.value)}
                    data-ocid="part.input"
                  />
                </div>

                <div>
                  <Label
                    className="text-xs text-slate-500"
                    htmlFor="rtc-reason"
                  >
                    Reason <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rtc-reason"
                    className="mt-1 text-sm"
                    placeholder="e.g. Defective, Damaged"
                    value={rtcReason}
                    onChange={(e) => setRtcReason(e.target.value)}
                    data-ocid="part.input"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-500" htmlFor="rtc-notes">
                    Notes <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="rtc-notes"
                    className="mt-1 text-sm"
                    rows={2}
                    placeholder="Additional notes"
                    value={rtcNotes}
                    onChange={(e) => setRtcNotes(e.target.value)}
                    data-ocid="part.textarea"
                  />
                </div>

                <Button
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  size="sm"
                  onClick={() => setShowRtcConfirm(true)}
                  disabled={!rtcReason.trim()}
                  data-ocid="part.delete_button"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Record Return
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT column (1/3) ── */}
        <div className="space-y-4">
          {/* Action Buttons (only for actionable states) */}
          {!isReturnedToCompany &&
            (part.status === "in_stock" || part.status === "issued") && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {part.status === "in_stock" && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                      size="sm"
                      onClick={() => {
                        setIssueTechId("");
                        setIssueCaseId("");
                        setIssueNotes("");
                        setIssueDialog(true);
                      }}
                      data-ocid="part.primary_button"
                    >
                      Issue to Technician
                    </Button>
                  )}
                  {part.status === "issued" && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700 w-full"
                        size="sm"
                        onClick={() => markPartInstalled(part.id)}
                        data-ocid="part.primary_button"
                      >
                        Mark Installed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setReturnRemarks("");
                          setReturnDialog(true);
                        }}
                        data-ocid="part.secondary_button"
                      >
                        Return to Store
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Issued details if applicable */}
          {part.status === "issued" && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Issue Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm divide-y divide-slate-100">
                  {(
                    [
                      ["Technician", tech?.name ?? part.technicianId],
                      ["Case ID", part.caseId],
                      [
                        "Issue Date",
                        part.issueDate
                          ? new Date(part.issueDate).toLocaleDateString()
                          : "—",
                      ],
                      ["Issued By", part.issuedBy],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium text-slate-800 text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lifecycle Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {lifecycle.length === 0 ? (
                <p className="text-slate-400 text-sm">No history yet.</p>
              ) : (
                <div className="space-y-0">
                  {lifecycle.map((entry, i) => {
                    const dotColor = getLifecycleDotColor(entry.action);
                    return (
                      <div key={entry.id} className="flex gap-3">
                        {/* Dot + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: dotColor }}
                          />
                          {i < lifecycle.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-4 min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {entry.action}
                            </span>
                            <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {entry.details && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {entry.details}
                            </p>
                          )}
                          <p className="text-xs text-slate-400">
                            by {entry.userName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Issue to Technician Dialog ── */}
      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue to Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Technician *</Label>
              <Select value={issueTechId} onValueChange={setIssueTechId}>
                <SelectTrigger data-ocid="part.select" className="mt-1">
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
            </div>
            <div>
              <Label>Case ID *</Label>
              <Input
                className="mt-1"
                value={issueCaseId}
                onChange={(e) => setIssueCaseId(e.target.value)}
                placeholder="e.g. MD-2024-001"
                data-ocid="part.input"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                placeholder="Optional notes"
                rows={2}
                data-ocid="part.textarea"
              />
            </div>
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

      {/* ── Return to Store Dialog ── */}
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

      {/* ── Return to Company Confirmation ── */}
      <AlertDialog open={showRtcConfirm} onOpenChange={setShowRtcConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Return to Company
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to return this part to the company? This
              action is permanent and cannot be undone. The part will be removed
              from inventory permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="part.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              data-ocid="part.confirm_button"
              onClick={() => {
                handleRtcSubmit();
                setShowRtcConfirm(false);
              }}
            >
              Yes, Return to Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Image Confirmation ── */}
      <AlertDialog
        open={deleteConfirmState.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirmState((s) => ({ ...s, open: false }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="part.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              data-ocid="part.confirm_button"
              onClick={() => {
                if (
                  deleteConfirmState.type === "part" &&
                  deleteConfirmState.url
                ) {
                  removePartImage(part.id, deleteConfirmState.url);
                } else if (
                  deleteConfirmState.type === "invoice" &&
                  deleteConfirmState.purchaseId
                ) {
                  removePurchaseInvoiceImage(deleteConfirmState.purchaseId);
                }
                setDeleteConfirmState((s) => ({ ...s, open: false }));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Image Lightbox ── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          role="presentation"
          data-ocid="part.modal"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxUrl}
              alt="Full size"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 text-slate-700"
              onClick={() => setLightboxUrl(null)}
              data-ocid="part.close_button"
            >
              ✕
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                size="sm"
                className="bg-white/90 text-slate-800 hover:bg-white"
                onClick={() => downloadImage(lightboxUrl, "part-image.jpg")}
                data-ocid="part.button"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
