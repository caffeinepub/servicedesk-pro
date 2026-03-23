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
  MapPin,
  Minus,
  Package,
  PackagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "../store";

interface StockEntry {
  id: string;
  partCode: string;
  companyId: string;
  categoryId: string;
  partNameId: string;
  quantity: number;
  rackId: string;
  shelfId: string;
  binId: string;
  notes: string;
}

function newEntry(): StockEntry {
  return {
    id: Math.random().toString(36).slice(2),
    partCode: "",
    companyId: "",
    categoryId: "",
    partNameId: "",
    quantity: 1,
    rackId: "",
    shelfId: "",
    binId: "",
    notes: "",
  };
}

export default function ExistingStockPage() {
  const {
    currentUser,
    stockCompanies,
    stockCategories,
    stockPartNames,
    racks,
    shelves,
    bins,
    addExistingStock,
    navigate,
  } = useStore();

  const [entries, setEntries] = useState<StockEntry[]>([newEntry()]);
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

  const updateEntry = (
    id: string,
    field: keyof StockEntry,
    value: string | number,
  ) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, [field]: value };
        // Reset chained fields
        if (field === "companyId") {
          updated.categoryId = "";
          updated.partNameId = "";
        }
        if (field === "categoryId") {
          updated.partNameId = "";
        }
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
    setErrors((prev) => {
      const n = { ...prev };
      delete n[`${id}-${field}`];
      return n;
    });
  };

  const addRow = () => setEntries((prev) => [...prev, newEntry()]);

  const removeRow = (id: string) => {
    if (entries.length === 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const e of entries) {
      if (!e.partCode.trim()) errs[`${e.id}-partCode`] = "Required";
      if (!e.companyId) errs[`${e.id}-companyId`] = "Required";
      if (!e.categoryId) errs[`${e.id}-categoryId`] = "Required";
      if (!e.partNameId) errs[`${e.id}-partNameId`] = "Required";
      if (e.quantity < 1) errs[`${e.id}-quantity`] = "Min 1";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addExistingStock(
      entries.map((e) => ({
        partCode: e.partCode.trim(),
        companyId: e.companyId,
        categoryId: e.categoryId,
        partNameId: e.partNameId,
        quantity: e.quantity,
        rackId: e.rackId || undefined,
        shelfId: e.shelfId || undefined,
        binId: e.binId || undefined,
        notes: e.notes || undefined,
      })),
    );
    setSavedCount(entries.length);
    setSaved(true);
  };

  const handleAddMore = () => {
    setEntries([newEntry()]);
    setErrors({});
    setSaved(false);
    setSavedCount(0);
  };

  if (saved) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <PackagePlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Existing Stock Entry</h1>
              <p className="text-teal-100 text-sm">
                Add parts already in your store before this system was set up
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto mb-4">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Stock Added Successfully!
          </h2>
          <p className="text-muted-foreground mb-6">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-base px-4 py-1">
              {savedCount} part{savedCount !== 1 ? "s" : ""} added
            </Badge>
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAddMore}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" /> Add More Stock
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("inventory")}
              className="gap-2"
            >
              Go to Inventory <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <PackagePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Existing Stock Entry</h1>
            <p className="text-teal-100 text-sm">
              Add parts that were already in your store before this system was
              set up
            </p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-white/20 text-white border-white/30">
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Entry rows */}
      <div className="space-y-4">
        {entries.map((entry, idx) => {
          const filteredCategories = stockCategories;
          const filteredPartNames = stockPartNames;
          const filteredShelves = shelves.filter(
            (s) => s.rackId === entry.rackId,
          );
          const filteredBins = bins.filter((b) => b.shelfId === entry.shelfId);

          return (
            <div
              key={entry.id}
              className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Row header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-600 text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-foreground text-sm">
                    Part Entry #{idx + 1}
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
                {/* Part Code */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-teal-600" /> Part Code{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. A-01928"
                    value={entry.partCode}
                    onChange={(e) =>
                      updateEntry(entry.id, "partCode", e.target.value)
                    }
                    className={
                      errors[`${entry.id}-partCode`] ? "border-rose-500" : ""
                    }
                    data-ocid="existing-stock.input"
                  />
                  {errors[`${entry.id}-partCode`] && (
                    <p className="text-xs text-rose-500">
                      {errors[`${entry.id}-partCode`]}
                    </p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-teal-600" /> Company{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={entry.companyId}
                    onValueChange={(v) => updateEntry(entry.id, "companyId", v)}
                  >
                    <SelectTrigger
                      className={
                        errors[`${entry.id}-companyId`] ? "border-rose-500" : ""
                      }
                    >
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
                  {errors[`${entry.id}-companyId`] && (
                    <p className="text-xs text-rose-500">
                      {errors[`${entry.id}-companyId`]}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-teal-600" /> Category{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={entry.categoryId}
                    onValueChange={(v) =>
                      updateEntry(entry.id, "categoryId", v)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors[`${entry.id}-categoryId`]
                          ? "border-rose-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder={"Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`${entry.id}-categoryId`] && (
                    <p className="text-xs text-rose-500">
                      {errors[`${entry.id}-categoryId`]}
                    </p>
                  )}
                </div>

                {/* Part Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-teal-600" /> Part Name{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={entry.partNameId}
                    onValueChange={(v) =>
                      updateEntry(entry.id, "partNameId", v)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors[`${entry.id}-partNameId`]
                          ? "border-rose-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder={"Select part name"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPartNames.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`${entry.id}-partNameId`] && (
                    <p className="text-xs text-rose-500">
                      {errors[`${entry.id}-partNameId`]}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-teal-600" /> Quantity{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() =>
                        updateEntry(
                          entry.id,
                          "quantity",
                          Math.max(1, entry.quantity - 1),
                        )
                      }
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      value={entry.quantity}
                      onChange={(e) =>
                        updateEntry(
                          entry.id,
                          "quantity",
                          Math.max(1, Number.parseInt(e.target.value) || 1),
                        )
                      }
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() =>
                        updateEntry(entry.id, "quantity", entry.quantity + 1)
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {errors[`${entry.id}-quantity`] && (
                    <p className="text-xs text-rose-500">
                      {errors[`${entry.id}-quantity`]}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Notes (optional)
                  </Label>
                  <Input
                    placeholder="Any notes about this part..."
                    value={entry.notes}
                    onChange={(e) =>
                      updateEntry(entry.id, "notes", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Location section */}
              <div className="px-5 pb-5">
                <div className="border border-dashed border-teal-300 dark:border-teal-700 rounded-xl p-4 bg-teal-50/50 dark:bg-teal-900/10">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                      Location (optional)
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-teal-300 text-teal-600"
                    >
                      Assign to warehouse
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Rack
                      </Label>
                      <Select
                        value={entry.rackId}
                        onValueChange={(v) =>
                          updateEntry(entry.id, "rackId", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rack" />
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
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Shelf
                      </Label>
                      <Select
                        value={entry.shelfId}
                        onValueChange={(v) =>
                          updateEntry(entry.id, "shelfId", v)
                        }
                        disabled={!entry.rackId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              entry.rackId
                                ? "Select shelf"
                                : "Select rack first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredShelves.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Bin
                      </Label>
                      <Select
                        value={entry.binId}
                        onValueChange={(v) => updateEntry(entry.id, "binId", v)}
                        disabled={!entry.shelfId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              entry.shelfId
                                ? "Select bin"
                                : "Select shelf first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBins.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <Button
          variant="outline"
          onClick={addRow}
          className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
          data-ocid="existing-stock.primary_button"
        >
          <Plus className="h-4 w-4" /> Add Another Part
        </Button>
        <Button
          onClick={handleSave}
          className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8"
          data-ocid="existing-stock.submit_button"
        >
          <Save className="h-4 w-4" /> Save All Entries ({entries.length})
        </Button>
      </div>
    </div>
  );
}
