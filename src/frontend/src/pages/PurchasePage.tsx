import { CheckCircle2, Package } from "lucide-react";
import { useState } from "react";
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
import { useStore } from "../store";

interface PartCodeEntry {
  id: string;
  code: string;
  rackId: string;
  shelfId: string;
  binId: string;
}

const emptyForm = () => ({
  vendorName: "",
  invoiceNumber: "",
  invoiceDate: "",
  companyId: "",
  categoryId: "",
  partNameId: "",
  quantity: 0,
});

const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PurchasePage() {
  const {
    stockCompanies,
    stockCategories,
    stockPartNames,
    racks,
    shelves,
    bins,
    addPurchaseEntry,
  } = useStore();

  const [form, setForm] = useState(emptyForm());
  const [partCodes, setPartCodes] = useState<PartCodeEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [invoiceImageUrl, setInvoiceImageUrl] = useState("");
  const [partImages, setPartImages] = useState<Record<number, string>>({});

  const setField = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "quantity") {
      const qty = Number(value);
      if (qty > 0 && qty <= 50) {
        setPartCodes(
          Array.from(
            { length: qty },
            (_, i) =>
              partCodes[i] ?? {
                id: String(i),
                code: "",
                rackId: "",
                shelfId: "",
                binId: "",
              },
          ),
        );
      } else {
        setPartCodes([]);
      }
    }
  };

  const setPartCode = (
    idx: number,
    field: keyof PartCodeEntry,
    value: string,
  ) => {
    setPartCodes((prev) =>
      prev.map((pc, i) => {
        if (i !== idx) return pc;
        const updated = { ...pc, [field]: value };
        if (field === "rackId") {
          updated.shelfId = "";
          updated.binId = "";
        }
        if (field === "shelfId") {
          updated.binId = "";
        }
        return updated;
      }),
    );
  };

  const handleInvoiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setInvoiceImageUrl(dataUrl);
  };

  const handlePartImage = async (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setPartImages((prev) => ({ ...prev, [i]: dataUrl }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.vendorName.trim()) errs.vendorName = "Required";
    if (!form.invoiceNumber.trim()) errs.invoiceNumber = "Required";
    if (!form.invoiceDate) errs.invoiceDate = "Required";
    if (!form.companyId) errs.companyId = "Required";
    if (!form.categoryId) errs.categoryId = "Required";
    if (!form.partNameId) errs.partNameId = "Required";
    if (!form.quantity || form.quantity < 1)
      errs.quantity = "Must be at least 1";
    // Only check for duplicates within this form — same code can be purchased again from different invoices
    partCodes.forEach((pc, i) => {
      if (!pc.code.trim()) errs[`code_${i}`] = "Required";
      else {
        const dupes = partCodes.filter(
          (x, j) => j !== i && x.code.trim() === pc.code.trim(),
        );
        if (dupes.length > 0) errs[`code_${i}`] = "Duplicate in this entry";
      }
    });
    return errs;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addPurchaseEntry(
      { ...form, quantity: Number(form.quantity), invoiceImageUrl },
      partCodes.map((pc, i) => ({
        code: pc.code.trim(),
        rackId: pc.rackId,
        shelfId: pc.shelfId,
        binId: pc.binId,
        imageUrl: partImages[i] ?? "",
      })),
    );
    setForm(emptyForm());
    setPartCodes([]);
    setErrors({});
    setInvoiceImageUrl("");
    setPartImages({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Purchase Entry</h1>
        <p className="text-sm text-slate-500">
          Record a new stock purchase from vendor
        </p>
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

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" /> Purchase Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Vendor Name *</Label>
              <Input
                value={form.vendorName}
                onChange={(e) => setField("vendorName", e.target.value)}
                placeholder="Vendor name"
                data-ocid="purchase.input"
              />
              {errors.vendorName && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="purchase.error_state"
                >
                  {errors.vendorName}
                </p>
              )}
            </div>
            <div>
              <Label>Invoice Number *</Label>
              <Input
                value={form.invoiceNumber}
                onChange={(e) => setField("invoiceNumber", e.target.value)}
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
                value={form.invoiceDate}
                onChange={(e) => setField("invoiceDate", e.target.value)}
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
            <div>
              <Label>Invoice Image (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleInvoiceImage}
                className="cursor-pointer"
                data-ocid="purchase.upload_button"
              />
              {invoiceImageUrl && (
                <img
                  src={invoiceImageUrl}
                  alt="Invoice"
                  className="mt-2 h-20 rounded border object-cover w-full"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Company *</Label>
              <Select
                value={form.companyId}
                onValueChange={(v) => setField("companyId", v)}
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
              {errors.companyId && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="purchase.error_state"
                >
                  {errors.companyId}
                </p>
              )}
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setField("categoryId", v)}
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
              {errors.categoryId && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="purchase.error_state"
                >
                  {errors.categoryId}
                </p>
              )}
            </div>
            <div>
              <Label>Part Name *</Label>
              <Select
                value={form.partNameId}
                onValueChange={(v) => setField("partNameId", v)}
              >
                <SelectTrigger data-ocid="purchase.select">
                  <SelectValue placeholder="Select part" />
                </SelectTrigger>
                <SelectContent>
                  {stockPartNames.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.partNameId && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="purchase.error_state"
                >
                  {errors.partNameId}
                </p>
              )}
            </div>
          </div>

          <div className="max-w-xs">
            <Label>Quantity * (1-50)</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={form.quantity || ""}
              onChange={(e) =>
                setField(
                  "quantity",
                  e.target.value ? Number.parseInt(e.target.value) : 0,
                )
              }
              placeholder="Enter quantity"
              data-ocid="purchase.input"
            />
            {errors.quantity && (
              <p
                className="text-xs text-red-500 mt-1"
                data-ocid="purchase.error_state"
              >
                {errors.quantity}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {partCodes.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Part Codes &amp; Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {partCodes.map((pc, i) => (
              <div
                key={pc.id ?? i}
                className="border border-slate-200 rounded-lg p-4 space-y-3"
                data-ocid={`purchase.item.${i + 1}`}
              >
                <div className="font-medium text-sm text-slate-700">
                  Part {i + 1}
                </div>
                <div>
                  <Label>Part Code {i + 1} *</Label>
                  <Input
                    value={pc.code}
                    onChange={(e) => setPartCode(i, "code", e.target.value)}
                    placeholder={`e.g. MIDAC-COMP-${String(i + 4).padStart(3, "0")}`}
                    className="font-mono"
                    data-ocid="purchase.input"
                  />
                  {errors[`code_${i}`] && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid="purchase.error_state"
                    >
                      {errors[`code_${i}`]}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500">
                      Rack (optional)
                    </Label>
                    <Select
                      value={pc.rackId}
                      onValueChange={(v) => setPartCode(i, "rackId", v)}
                    >
                      <SelectTrigger
                        className="h-8 text-xs"
                        data-ocid="purchase.select"
                      >
                        <SelectValue placeholder="Rack" />
                      </SelectTrigger>
                      <SelectContent>
                        {racks.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">
                      Shelf (optional)
                    </Label>
                    <Select
                      value={pc.shelfId}
                      onValueChange={(v) => setPartCode(i, "shelfId", v)}
                      disabled={!pc.rackId}
                    >
                      <SelectTrigger
                        className="h-8 text-xs"
                        data-ocid="purchase.select"
                      >
                        <SelectValue placeholder="Shelf" />
                      </SelectTrigger>
                      <SelectContent>
                        {shelves
                          .filter((s) => s.rackId === pc.rackId)
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">
                      Bin (optional)
                    </Label>
                    <Select
                      value={pc.binId}
                      onValueChange={(v) => setPartCode(i, "binId", v)}
                      disabled={!pc.shelfId}
                    >
                      <SelectTrigger
                        className="h-8 text-xs"
                        data-ocid="purchase.select"
                      >
                        <SelectValue placeholder="Bin" />
                      </SelectTrigger>
                      <SelectContent>
                        {bins
                          .filter((b) => b.shelfId === pc.shelfId)
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Per-part image upload */}
                <div>
                  <Label className="text-xs text-slate-500">
                    Part Image (optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePartImage(i, e)}
                    className="cursor-pointer h-8 text-xs"
                    data-ocid="purchase.upload_button"
                  />
                  {partImages[i] && (
                    <img
                      src={partImages[i]}
                      alt="Part"
                      className="mt-1 h-16 rounded border object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={submit}
          disabled={partCodes.length === 0}
          data-ocid="purchase.submit_button"
        >
          Save Purchase Entry
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setForm(emptyForm());
            setPartCodes([]);
            setErrors({});
            setInvoiceImageUrl("");
            setPartImages({});
          }}
          data-ocid="purchase.secondary_button"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
