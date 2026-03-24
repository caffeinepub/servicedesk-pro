import {
  AlignJustify,
  Box,
  Building2,
  Folder,
  FolderOpen,
  Layers,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Server,
  Tag,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useStore } from "../store";
import type {
  PartInventoryItem,
  Warehouse,
  WarehouseBin,
  WarehouseRack,
  WarehouseShelf,
} from "../types";

// ── Delete Confirmation Dialog ────────────────────────────────────────────────
function DeleteConfirm({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">{message}</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            data-ocid="warehouse.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            data-ocid="warehouse.confirm_button"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign Location Dialog ────────────────────────────────────────────────────
function AssignLocationDialog({
  open,
  partId,
  partCode,
  allPartItems,
  racks,
  shelves,
  bins,
  onAssign,
  onClose,
}: {
  open: boolean;
  partId: string;
  partCode: string;
  allPartItems: PartInventoryItem[];
  racks: WarehouseRack[];
  shelves: WarehouseShelf[];
  bins: WarehouseBin[];
  onAssign: (
    partId: string,
    rackId: string,
    shelfId: string,
    binId: string,
  ) => void;
  onClose: () => void;
}) {
  const [rack, setRack] = useState("");
  const [shelf, setShelf] = useState("");
  const [bin, setBin] = useState("");

  // Find other parts with same partCode that already have a location assigned
  const sameCodeLocations = (() => {
    const seen = new Set<string>();
    const results: { rackName: string; shelfName: string; binName: string }[] =
      [];
    for (const p of allPartItems) {
      if (p.partCode === partCode && p.id !== partId && p.rackId) {
        const key = `${p.rackId}-${p.shelfId}-${p.binId}`;
        if (!seen.has(key)) {
          seen.add(key);
          const rackName =
            racks.find((r) => r.id === p.rackId)?.name ?? p.rackId;
          const shelfName = shelves.find((s) => s.id === p.shelfId)?.name ?? "";
          const binName = bins.find((b) => b.id === p.binId)?.name ?? "";
          results.push({ rackName, shelfName, binName });
        }
      }
    }
    return results;
  })();

  const handleClose = () => {
    setRack("");
    setShelf("");
    setBin("");
    onClose();
  };

  const selectedRackName = racks.find((r) => r.id === rack)?.name;
  const selectedShelfName = shelves.find((s) => s.id === shelf)?.name;
  const selectedBinName = bins.find((b) => b.id === bin)?.name;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Assign Location</h2>
              <p className="text-indigo-200 text-xs mt-0.5">
                Select a rack, shelf and bin for this part
              </p>
            </div>
          </div>
          {/* Visual location path */}
          <div className="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5">
            <span
              className={`text-sm font-semibold ${selectedRackName ? "text-white" : "text-indigo-300"}`}
            >
              {selectedRackName ?? "Rack"}
            </span>
            <span className="text-indigo-300 text-sm">›</span>
            <span
              className={`text-sm font-semibold ${selectedShelfName ? "text-white" : "text-indigo-300"}`}
            >
              {selectedShelfName ?? "Shelf"}
            </span>
            <span className="text-indigo-300 text-sm">›</span>
            <span
              className={`text-sm font-semibold ${selectedBinName ? "text-white" : "text-indigo-300"}`}
            >
              {selectedBinName ?? "Bin"}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Suggestion: same part code already assigned to a location */}
          {sameCodeLocations.length > 0 && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-yellow-200 rounded-md mt-0.5 shrink-0">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-yellow-800 mb-1.5">
                    Same part code already assigned to:
                  </p>
                  <div className="space-y-1">
                    {sameCodeLocations.map((loc) => (
                      <div
                        key={`${loc.rackName}-${loc.shelfName}-${loc.binName}`}
                        className="text-xs text-yellow-700 bg-yellow-100 rounded-lg px-2.5 py-1.5 font-mono"
                      >
                        {loc.rackName}
                        {loc.shelfName ? ` › ${loc.shelfName}` : ""}
                        {loc.binName ? ` › ${loc.binName}` : ""}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-600 mt-1.5 italic">
                    You can assign this part to the same location for easy
                    tracking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rack */}
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <div className="p-1 bg-amber-200 rounded-md">
                <Server className="h-3.5 w-3.5 text-amber-700" />
              </div>
              Rack
            </div>
            <Select
              value={rack}
              onValueChange={(v) => {
                setRack(v);
                setShelf("");
                setBin("");
              }}
            >
              <SelectTrigger
                className="bg-white border-amber-200 focus:ring-amber-400"
                data-ocid="warehouse.select"
              >
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

          {/* Shelf */}
          <div
            className={`rounded-xl border px-4 py-3 space-y-2 transition-opacity ${rack ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 opacity-60"}`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <div className="p-1 bg-emerald-200 rounded-md">
                <AlignJustify className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              Shelf
            </div>
            <Select
              value={shelf}
              onValueChange={(v) => {
                setShelf(v);
                setBin("");
              }}
              disabled={!rack}
            >
              <SelectTrigger
                className="bg-white border-emerald-200 focus:ring-emerald-400"
                data-ocid="warehouse.select"
              >
                <SelectValue placeholder="Select shelf" />
              </SelectTrigger>
              <SelectContent>
                {shelves
                  .filter((s) => s.rackId === rack)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bin */}
          <div
            className={`rounded-xl border px-4 py-3 space-y-2 transition-opacity ${shelf ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100 opacity-60"}`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <div className="p-1 bg-blue-200 rounded-md">
                <Box className="h-3.5 w-3.5 text-blue-700" />
              </div>
              Bin <span className="text-slate-400 font-normal">(optional)</span>
            </div>
            <Select value={bin} onValueChange={setBin} disabled={!shelf}>
              <SelectTrigger
                className="bg-white border-blue-200 focus:ring-blue-400"
                data-ocid="warehouse.select"
              >
                <SelectValue placeholder="Select bin" />
              </SelectTrigger>
              <SelectContent>
                {bins
                  .filter((b) => b.shelfId === shelf)
                  .map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary card */}
          {rack && shelf && (
            <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 px-4 py-3 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <MapPin className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-indigo-500 font-medium">
                  Selected path
                </p>
                <p className="text-sm font-bold text-indigo-700">
                  {selectedRackName} › {selectedShelfName}
                  {selectedBinName ? ` › ${selectedBinName}` : ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-ocid="warehouse.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md"
              disabled={!rack || !shelf}
              onClick={() => {
                onAssign(partId, rack, shelf, bin);
                handleClose();
              }}
              data-ocid="warehouse.confirm_button"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Assign Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Warehouse Layout View ─────────────────────────────────────────────────────
function WarehouseLayoutView({
  warehouse,
  racks,
  shelves,
  bins,
  partItems,
  stockPartNames,
  isAdmin,
  onBack,
  onAddRack,
  onEditRack,
  onDeleteRack,
  onAddShelf,
  onEditShelf,
  onDeleteShelf,
  onAddBin,
  onEditBin,
  onDeleteBin,
  onPartClick,
}: {
  warehouse: Warehouse;
  racks: WarehouseRack[];
  shelves: WarehouseShelf[];
  bins: WarehouseBin[];
  partItems: Array<{
    id: string;
    partCode: string;
    rackId: string;
    shelfId: string;
    binId: string;
    partNameId: string;
    status: string;
  }>;
  stockPartNames: Array<{ id: string; name: string }>;
  isAdmin: boolean;
  onBack: () => void;
  onAddRack: () => void;
  onEditRack: (rack: WarehouseRack) => void;
  onDeleteRack: (rack: WarehouseRack) => void;
  onAddShelf: (rackId: string) => void;
  onEditShelf: (shelf: WarehouseShelf) => void;
  onDeleteShelf: (shelf: WarehouseShelf) => void;
  onAddBin: (shelfId: string) => void;
  onEditBin: (bin: WarehouseBin) => void;
  onDeleteBin: (bin: WarehouseBin) => void;
  onPartClick: (partCode: string) => void;
}) {
  const warehouseRacks = racks.filter(
    (r) => r.warehouseId === warehouse.id || !r.warehouseId,
  );
  const [expandedRacks, setExpandedRacks] = useState<Set<string>>(new Set());
  const [expandedShelves, setExpandedShelves] = useState<Set<string>>(
    new Set(),
  );
  const [expandedLocRacks, setExpandedLocRacks] = useState<Set<string>>(
    new Set(),
  );
  const [expandedLocShelves, setExpandedLocShelves] = useState<Set<string>>(
    new Set(),
  );
  const [expandedLocBins, setExpandedLocBins] = useState<Set<string>>(
    new Set(),
  );

  const toggleRack = (id: string) =>
    setExpandedRacks((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  const toggleShelf = (id: string) =>
    setExpandedShelves((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  const toggleLocRack = (id: string) =>
    setExpandedLocRacks((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  const toggleLocShelf = (id: string) =>
    setExpandedLocShelves((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  const toggleLocBin = (id: string) =>
    setExpandedLocBins((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const getPartName = (id: string) =>
    stockPartNames.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          data-ocid="warehouse.button"
        >
          ← Warehouses
        </button>
        <span className="text-slate-300">/</span>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-slate-500" />
          <div>
            <h2 className="font-bold text-slate-900">{warehouse.name}</h2>
            <p className="text-xs text-slate-500">{warehouse.address}</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            className="ml-auto bg-blue-600 hover:bg-blue-700"
            onClick={onAddRack}
            data-ocid="warehouse.open_modal_button"
          >
            <Server className="h-4 w-4 mr-1" /> Add Rack
          </Button>
        )}
      </div>

      {/* Rack/Shelf/Bin Tree */}
      <div className="space-y-2">
        {warehouseRacks.length === 0 ? (
          <div
            className="text-center py-8 text-slate-400 text-sm"
            data-ocid="warehouse.empty_state"
          >
            No racks in this warehouse.
          </div>
        ) : (
          warehouseRacks.map((rack, ri) => {
            const rackShelves = shelves.filter((s) => s.rackId === rack.id);
            const isExpanded = expandedRacks.has(rack.id);
            return (
              <div
                key={rack.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
                data-ocid={`warehouse.item.${ri + 1}`}
              >
                {/* Rack Row */}
                <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRack(rack.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {isExpanded ? (
                      <FolderOpen className="h-5 w-5 text-white/80" />
                    ) : (
                      <Folder className="h-5 w-5 text-blue-200" />
                    )}
                    <div className="p-1 bg-white/20 rounded-md">
                      <Server className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-white">{rack.name}</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {rackShelves.length} shelf(ves)
                    </span>
                  </button>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/20"
                        onClick={() => onEditRack(rack)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-200 hover:text-white hover:bg-red-500/30"
                        onClick={() => onDeleteRack(rack)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Shelves */}
                {isExpanded && (
                  <div className="pl-6 pr-4 pb-3 space-y-2 mt-2">
                    {rackShelves.map((shelf, si) => {
                      const shelfBins = bins.filter(
                        (b) => b.shelfId === shelf.id,
                      );
                      const isShelfExpanded = expandedShelves.has(shelf.id);
                      return (
                        <div
                          key={shelf.id}
                          className="border border-slate-200 rounded-md overflow-hidden"
                          data-ocid={`warehouse.item.${si + 1}`}
                        >
                          <div className="flex items-center px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 gap-2">
                            <button
                              type="button"
                              onClick={() => toggleShelf(shelf.id)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              {isShelfExpanded ? (
                                <FolderOpen className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Folder className="h-4 w-4 text-emerald-300" />
                              )}
                              <div className="p-0.5 bg-emerald-100 rounded">
                                <AlignJustify className="h-3.5 w-3.5 text-emerald-600" />
                              </div>
                              <span className="text-sm font-semibold text-emerald-800">
                                {shelf.name}
                              </span>
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {shelfBins.length} bin(s)
                              </span>
                            </button>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-600 hover:bg-emerald-100"
                                  onClick={() => onEditShelf(shelf)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:bg-red-50"
                                  onClick={() => onDeleteShelf(shelf)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {/* Bins */}
                          {isShelfExpanded && (
                            <div className="px-4 pb-2 pt-1">
                              <div className="flex flex-wrap gap-1.5">
                                {shelfBins.map((bin) => (
                                  <div
                                    key={bin.id}
                                    className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 text-xs text-amber-800 font-medium"
                                  >
                                    <Box className="h-3 w-3 text-amber-500" />
                                    {bin.name}
                                    {isAdmin && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => onEditBin(bin)}
                                          className="text-slate-400 hover:text-slate-700"
                                        >
                                          <Pencil className="h-2.5 w-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => onDeleteBin(bin)}
                                          className="text-red-400 hover:text-red-600"
                                        >
                                          <Trash2 className="h-2.5 w-2.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => onAddBin(shelf.id)}
                                  className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                                  data-ocid="warehouse.open_modal_button"
                                >
                                  <Box className="h-3 w-3" />
                                  <Plus className="h-3 w-3" /> Add Bin
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onAddShelf(rack.id)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        data-ocid="warehouse.open_modal_button"
                      >
                        <AlignJustify className="h-3 w-3" />
                        <Plus className="h-3 w-3" /> Add Shelf
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Parts by Location */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Package className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-indigo-900 text-sm">
            Parts by Location
          </h3>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-auto font-medium">
            {
              partItems.filter(
                (p) => p.rackId && p.status !== "returned_to_company",
              ).length
            }{" "}
            Parts
          </span>
        </div>
        <div className="space-y-2">
          {warehouseRacks.map((rack, ri) => {
            const rackParts = partItems.filter(
              (p) => p.rackId === rack.id && p.status !== "returned_to_company",
            );
            const rackShelves = shelves.filter((s) => s.rackId === rack.id);
            const isExpanded = expandedLocRacks.has(rack.id);
            return (
              <div
                key={rack.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
                data-ocid={`warehouse.item.${ri + 1}`}
              >
                <button
                  type="button"
                  onClick={() => toggleLocRack(rack.id)}
                  className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 gap-2 text-left"
                >
                  {isExpanded ? (
                    <FolderOpen className="h-5 w-5 text-white/80" />
                  ) : (
                    <Folder className="h-5 w-5 text-blue-200" />
                  )}
                  <div className="p-1 bg-white/20 rounded-md">
                    <Server className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-white">{rack.name}</span>
                  <div className="ml-auto flex gap-1.5">
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {rackShelves.length} Shelves
                    </span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {rackParts.length} Parts
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="pl-6 pr-4 pb-3 space-y-2 mt-2">
                    {rackShelves.map((shelf, si) => {
                      const shelfBins = bins.filter(
                        (b) => b.shelfId === shelf.id,
                      );
                      const shelfBinIds = shelfBins.map((b) => b.id);
                      const shelfParts = partItems.filter(
                        (p) =>
                          p.shelfId === shelf.id &&
                          p.binId &&
                          shelfBinIds.includes(p.binId) &&
                          p.status !== "returned_to_company",
                      );
                      const isShelfExpanded = expandedLocShelves.has(shelf.id);
                      return (
                        <div
                          key={shelf.id}
                          className="border border-slate-200 rounded-md overflow-hidden"
                          data-ocid={`warehouse.item.${si + 1}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleLocShelf(shelf.id)}
                            className="w-full flex items-center px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 gap-2 text-left"
                          >
                            {isShelfExpanded ? (
                              <FolderOpen className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Folder className="h-4 w-4 text-emerald-300" />
                            )}
                            <div className="p-0.5 bg-emerald-100 rounded">
                              <AlignJustify className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-semibold text-emerald-800">
                              {shelf.name}
                            </span>
                            <div className="ml-auto flex gap-1.5">
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {shelfBins.length} Bins
                              </span>
                              {shelfParts.length > 0 && (
                                <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  {shelfParts.length} Parts
                                </span>
                              )}
                            </div>
                          </button>
                          {isShelfExpanded && (
                            <div className="px-4 pb-3 pt-1 space-y-2">
                              {shelfBins.map((bin) => {
                                const binParts = partItems.filter(
                                  (p) =>
                                    p.binId &&
                                    bin.id &&
                                    p.binId === bin.id &&
                                    p.status !== "returned_to_company",
                                );
                                const isBinExpanded = expandedLocBins.has(
                                  bin.id,
                                );
                                return (
                                  <div
                                    key={bin.id}
                                    className="border border-slate-100 rounded"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleLocBin(bin.id)}
                                      className="w-full flex items-center px-2 py-1.5 bg-amber-50 border-b border-amber-100 gap-2 text-left"
                                    >
                                      {isBinExpanded ? (
                                        <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                                      ) : (
                                        <Folder className="h-3.5 w-3.5 text-amber-300" />
                                      )}
                                      <Box className="h-3 w-3 text-amber-500" />
                                      <span className="text-xs font-semibold text-amber-800">
                                        {bin.name}
                                      </span>
                                      {binParts.length > 0 && (
                                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium ml-auto">
                                          {binParts.length} Parts
                                        </span>
                                      )}
                                    </button>
                                    {isBinExpanded && (
                                      <div className="px-3 pb-2 space-y-1">
                                        {binParts.length === 0 ? (
                                          <p className="text-xs text-slate-400">
                                            No parts
                                          </p>
                                        ) : (
                                          binParts.map((part) => (
                                            <div
                                              key={part.id}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              <Tag className="h-3 w-3 text-blue-400" />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  onPartClick(part.partCode)
                                                }
                                                className="font-mono text-blue-700 font-semibold hover:underline"
                                              >
                                                {part.partCode}
                                              </button>
                                              <span className="text-slate-600">
                                                {getPartName(part.partNameId)}
                                              </span>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {/* Parts not in any bin */}
                              {(() => {
                                const noBinParts = shelfParts.filter(
                                  (p) => !p.binId,
                                );
                                if (noBinParts.length === 0) return null;
                                return (
                                  <div className="space-y-1">
                                    {noBinParts.map((part) => (
                                      <div
                                        key={part.id}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        <Tag className="h-3 w-3 text-blue-400" />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onPartClick(part.partCode)
                                          }
                                          className="font-mono text-blue-700 font-semibold hover:underline"
                                        >
                                          {part.partCode}
                                        </button>
                                        <span className="text-slate-600">
                                          {getPartName(part.partNameId)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main WarehousePage ────────────────────────────────────────────────────────
export default function WarehousePage() {
  const {
    warehouses,
    racks,
    shelves,
    bins,
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    currentUser,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addRackToWarehouse,
    updateRack,
    deleteRack,
    addShelf,
    updateShelf,
    deleteShelf,
    addBin,
    updateBin,
    deleteBin,
    assignPartLocation,
    navigate,
  } = useStore();

  const isAdmin = currentUser?.role === "admin";

  // Warehouse list view or selected warehouse
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null,
  );

  // Warehouse dialog
  const [whDialog, setWhDialog] = useState(false);
  const [whEdit, setWhEdit] = useState<Warehouse | null>(null);
  const [whName, setWhName] = useState("");
  const [whAddress, setWhAddress] = useState("");

  // Rack dialog
  const [rackDialog, setRackDialog] = useState(false);
  const [rackEdit, setRackEdit] = useState<WarehouseRack | null>(null);
  const [rackName, setRackName] = useState("");
  const [rackWhId, setRackWhId] = useState("");

  // Shelf dialog
  const [shelfDialog, setShelfDialog] = useState(false);
  const [shelfEdit, setShelfEdit] = useState<WarehouseShelf | null>(null);
  const [shelfName, setShelfName] = useState("");
  const [shelfRackId, setShelfRackId] = useState("");

  // Bin dialog
  const [binDialog, setBinDialog] = useState(false);
  const [binEdit, setBinEdit] = useState<WarehouseBin | null>(null);
  const [binName, setBinName] = useState("");
  const [binShelfId, setBinShelfId] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  // Assign location
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignPartId, setAssignPartId] = useState("");

  // Search for location pending
  const [pendingSearch, setPendingSearch] = useState("");

  const locationPending = partItems.filter(
    (p) =>
      !p.rackId && p.status !== "returned_to_company" && p.status !== "issued",
  );

  const filteredPending = pendingSearch.trim()
    ? locationPending.filter((p) => {
        const partName =
          stockPartNames.find((pn) => pn.id === p.partNameId)?.name ?? "";
        const q = pendingSearch.toLowerCase();
        return (
          p.partCode.toLowerCase().includes(q) ||
          partName.toLowerCase().includes(q)
        );
      })
    : locationPending;

  const confirmDelete = (title: string, message: string, fn: () => void) => {
    setDeleteConfirm({ open: true, title, message, onConfirm: fn });
  };

  const handlePartClick = (partCode: string) => {
    const item = partItems.find((p) => p.partCode === partCode);
    if (item) navigate("part-detail", undefined, item.id);
  };

  // Warehouse handlers
  const openAddWarehouse = () => {
    setWhEdit(null);
    setWhName("");
    setWhAddress("");
    setWhDialog(true);
  };
  const openEditWarehouse = (wh: Warehouse) => {
    setWhEdit(wh);
    setWhName(wh.name);
    setWhAddress(wh.address);
    setWhDialog(true);
  };
  const saveWarehouse = () => {
    if (!whName.trim()) return;
    if (whEdit) updateWarehouse(whEdit.id, whName.trim(), whAddress.trim());
    else {
      addWarehouse(whName.trim(), whAddress.trim());
      toast.success(
        whEdit ? "Warehouse updated" : "Warehouse added successfully",
      );
    }
    setWhDialog(false);
  };

  // Rack handlers
  const openAddRack = (warehouseId: string) => {
    setRackEdit(null);
    setRackName("");
    setRackWhId(warehouseId);
    setRackDialog(true);
  };
  const openEditRack = (rack: WarehouseRack) => {
    setRackEdit(rack);
    setRackName(rack.name);
    setRackWhId(rack.warehouseId ?? "");
    setRackDialog(true);
  };
  const saveRack = () => {
    if (!rackName.trim()) return;
    if (rackEdit) updateRack(rackEdit.id, rackName.trim());
    else {
      addRackToWarehouse(rackName.trim(), rackWhId);
      toast.success(rackEdit ? "Rack updated" : "Rack added successfully");
    }
    setRackDialog(false);
  };

  // Shelf handlers
  const openAddShelf = (rackId: string) => {
    setShelfEdit(null);
    setShelfName("");
    setShelfRackId(rackId);
    setShelfDialog(true);
  };
  const openEditShelf = (shelf: WarehouseShelf) => {
    setShelfEdit(shelf);
    setShelfName(shelf.name);
    setShelfRackId(shelf.rackId);
    setShelfDialog(true);
  };
  const saveShelf = () => {
    if (!shelfName.trim() || !shelfRackId) return;
    if (shelfEdit)
      updateShelf(shelfEdit.id, {
        name: shelfName.trim(),
        rackId: shelfRackId,
      });
    else {
      addShelf(shelfName.trim(), shelfRackId);
      toast.success(shelfEdit ? "Shelf updated" : "Shelf added successfully");
    }
    setShelfDialog(false);
  };

  // Bin handlers
  const openAddBin = (shelfId: string) => {
    setBinEdit(null);
    setBinName("");
    setBinShelfId(shelfId);
    setBinDialog(true);
  };
  const openEditBin = (bin: WarehouseBin) => {
    setBinEdit(bin);
    setBinName(bin.name);
    setBinShelfId(bin.shelfId);
    setBinDialog(true);
  };
  const saveBin = () => {
    if (!binName.trim() || !binShelfId) return;
    if (binEdit)
      updateBin(binEdit.id, { name: binName.trim(), shelfId: binShelfId });
    else {
      addBin(binName.trim(), binShelfId);
      toast.success(binEdit ? "Bin updated" : "Bin added successfully");
    }
    setBinDialog(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 text-white rounded-2xl px-6 py-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Warehouse Management
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Manage warehouse locations and track stock placement
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/20">
              <Server className="h-4 w-4 text-blue-200" />
              <div className="text-center">
                <div className="text-lg font-bold leading-none">
                  {racks.length}
                </div>
                <div className="text-[10px] text-blue-200 mt-0.5">Racks</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/20">
              <AlignJustify className="h-4 w-4 text-emerald-200" />
              <div className="text-center">
                <div className="text-lg font-bold leading-none">
                  {shelves.length}
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5">
                  Shelves
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/20">
              <Box className="h-4 w-4 text-amber-200" />
              <div className="text-center">
                <div className="text-lg font-bold leading-none">
                  {bins.length}
                </div>
                <div className="text-[10px] text-amber-200 mt-0.5">Bins</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/20">
              <Package className="h-4 w-4 text-cyan-200" />
              <div className="text-center">
                <div className="text-lg font-bold leading-none">
                  {locationPending.length}
                </div>
                <div className="text-[10px] text-cyan-200 mt-0.5">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="mb-4" data-ocid="warehouse.tab">
          <TabsTrigger value="layout" data-ocid="warehouse.tab">
            <LayoutGrid className="h-4 w-4 mr-1.5" /> Layout
          </TabsTrigger>
          <TabsTrigger value="pending" data-ocid="warehouse.tab">
            <MapPin className="h-4 w-4 mr-1.5" /> Location Pending
            {locationPending.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {locationPending.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout">
          {selectedWarehouse ? (
            <WarehouseLayoutView
              warehouse={selectedWarehouse}
              racks={racks.filter(
                (r) => r.warehouseId === selectedWarehouse.id || !r.warehouseId,
              )}
              shelves={shelves}
              bins={bins}
              partItems={partItems}
              stockPartNames={stockPartNames}
              isAdmin={isAdmin}
              onBack={() => setSelectedWarehouse(null)}
              onAddRack={() => openAddRack(selectedWarehouse.id)}
              onEditRack={openEditRack}
              onDeleteRack={(rack) =>
                confirmDelete(
                  "Delete Rack",
                  `Are you sure you want to delete "${rack.name}"? All shelves and bins inside will also be removed.`,
                  () => deleteRack(rack.id),
                )
              }
              onAddShelf={openAddShelf}
              onEditShelf={openEditShelf}
              onDeleteShelf={(shelf) =>
                confirmDelete(
                  "Delete Shelf",
                  `Are you sure you want to delete "${shelf.name}"? All bins inside will also be removed.`,
                  () => deleteShelf(shelf.id),
                )
              }
              onAddBin={openAddBin}
              onEditBin={openEditBin}
              onDeleteBin={(bin) =>
                confirmDelete(
                  "Delete Bin",
                  `Are you sure you want to delete bin "${bin.name}"?`,
                  () => deleteBin(bin.id),
                )
              }
              onPartClick={handlePartClick}
            />
          ) : (
            <div className="space-y-4">
              {/* Warehouse List Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-base">
                    Warehouses
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                    {(warehouses ?? []).length}
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 ml-1"
                    onClick={openAddWarehouse}
                    data-ocid="warehouse.open_modal_button"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Warehouse
                  </Button>
                )}
              </div>

              {(warehouses ?? []).length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="warehouse.empty_state"
                >
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No warehouses added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(warehouses ?? []).map((wh, i) => {
                    const whRacks = racks.filter(
                      (r) => r.warehouseId === wh.id || !r.warehouseId,
                    );
                    return (
                      <div
                        key={wh.id}
                        className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all group"
                        data-ocid={`warehouse.item.${i + 1}`}
                      >
                        <button
                          type="button"
                          className="cursor-pointer text-left w-full bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white"
                          onClick={() => setSelectedWarehouse(wh)}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2.5 bg-white/20 rounded-xl">
                              <Building2 className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg group-hover:text-blue-100 transition-colors truncate">
                                {wh.name}
                              </h3>
                              <p className="text-blue-200 text-sm mt-0.5 truncate">
                                {wh.address || "No address"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1">
                              <Server className="h-3.5 w-3.5 text-blue-200" />
                              <span className="text-xs font-semibold text-white">
                                {whRacks.length} Rack(s)
                              </span>
                            </div>
                            <span className="text-blue-200 text-xs ml-auto">
                              Click to explore →
                            </span>
                          </div>
                        </button>
                        {isAdmin && (
                          <div className="flex gap-2 p-3 bg-slate-50">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => openEditWarehouse(wh)}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() =>
                                confirmDelete(
                                  "Delete Warehouse",
                                  `Are you sure you want to delete "${wh.name}"? This action cannot be undone.`,
                                  () => deleteWarehouse(wh.id),
                                )
                              }
                              data-ocid="warehouse.delete_button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Location Pending Tab */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {/* Section Title */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl px-6 py-5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Location Pending Parts</h2>
                  <p className="text-amber-100 text-sm mt-0.5">
                    Parts that have not been assigned a warehouse location yet.
                  </p>
                </div>
                {locationPending.length > 0 && (
                  <span className="bg-white/20 text-white font-bold text-lg px-3 py-1 rounded-xl">
                    {locationPending.length}
                  </span>
                )}
              </div>
            </div>

            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by part code or part name..."
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="pl-9"
                data-ocid="warehouse.search_input"
              />
            </div>

            {filteredPending.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="warehouse.empty_state"
              >
                <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400">
                  {pendingSearch
                    ? "No parts match your search."
                    : "All parts have locations assigned."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <Tag className="h-3 w-3" />
                          Part Code
                        </span>
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        Part Name
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3" />
                          Company
                        </span>
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3" />
                          Category
                        </span>
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-bold text-amber-800 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredPending.map((p, i) => {
                      const partName =
                        stockPartNames.find((pn) => pn.id === p.partNameId)
                          ?.name ?? "—";
                      const company =
                        stockCompanies.find((c) => c.id === p.companyId)
                          ?.name ?? "—";
                      const category =
                        stockCategories.find((c) => c.id === p.categoryId)
                          ?.name ?? "—";
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-slate-100 hover:bg-amber-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                          data-ocid={`warehouse.row.${i + 1}`}
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handlePartClick(p.partCode)}
                              className="font-mono text-xs font-semibold text-blue-600 hover:underline hover:text-blue-800"
                            >
                              {p.partCode}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-slate-700 font-medium">
                            {partName}
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {company}
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {category}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                p.status === "issued"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {p.status === "issued" ? "Issued" : "In Stock"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 border-emerald-300 text-xs hover:bg-emerald-50"
                              onClick={() => {
                                setAssignPartId(p.id);
                                setAssignDialog(true);
                              }}
                              data-ocid={`warehouse.button.${i + 1}`}
                            >
                              <MapPin className="h-3 w-3 mr-1" /> Assign
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}

      {/* Warehouse Dialog */}
      <Dialog open={whDialog} onOpenChange={setWhDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{whEdit ? "Edit" : "Add"} Warehouse</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Warehouse Name</Label>
            <Input
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              placeholder="e.g. Main Warehouse"
              data-ocid="warehouse.input"
            />
            <Label>Address</Label>
            <Input
              value={whAddress}
              onChange={(e) => setWhAddress(e.target.value)}
              placeholder="e.g. Plot 12, Industrial Area, Delhi"
              data-ocid="warehouse.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWhDialog(false)}
              data-ocid="warehouse.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveWarehouse}
              data-ocid="warehouse.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rack Dialog */}
      <Dialog open={rackDialog} onOpenChange={setRackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rackEdit ? "Edit" : "Add"} Rack</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Rack Name</Label>
            <Input
              value={rackName}
              onChange={(e) => setRackName(e.target.value)}
              placeholder="e.g. Rack C"
              data-ocid="warehouse.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRackDialog(false)}
              data-ocid="warehouse.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveRack}
              data-ocid="warehouse.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shelf Dialog */}
      <Dialog open={shelfDialog} onOpenChange={setShelfDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shelfEdit ? "Edit" : "Add"} Shelf</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Shelf Name</Label>
            <Input
              value={shelfName}
              onChange={(e) => setShelfName(e.target.value)}
              placeholder="e.g. Shelf C1"
              data-ocid="warehouse.input"
            />
            <Label>Rack</Label>
            <Select value={shelfRackId} onValueChange={setShelfRackId}>
              <SelectTrigger data-ocid="warehouse.select">
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShelfDialog(false)}
              data-ocid="warehouse.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveShelf}
              data-ocid="warehouse.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bin Dialog */}
      <Dialog open={binDialog} onOpenChange={setBinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{binEdit ? "Edit" : "Add"} Bin</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Bin Name</Label>
            <Input
              value={binName}
              onChange={(e) => setBinName(e.target.value)}
              placeholder="e.g. Bin C1-1"
              data-ocid="warehouse.input"
            />
            <Label>Shelf</Label>
            <Select value={binShelfId} onValueChange={setBinShelfId}>
              <SelectTrigger data-ocid="warehouse.select">
                <SelectValue placeholder="Select shelf" />
              </SelectTrigger>
              <SelectContent>
                {shelves.map((s) => {
                  const rack = racks.find((r) => r.id === s.rackId);
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({rack?.name ?? ""})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBinDialog(false)}
              data-ocid="warehouse.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveBin}
              data-ocid="warehouse.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirm
        open={deleteConfirm.open}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={() => {
          deleteConfirm.onConfirm();
          setDeleteConfirm((d) => ({ ...d, open: false }));
        }}
        onCancel={() => setDeleteConfirm((d) => ({ ...d, open: false }))}
      />

      {/* Assign Location Dialog */}
      <AssignLocationDialog
        open={assignDialog}
        partId={assignPartId}
        partCode={partItems.find((p) => p.id === assignPartId)?.partCode ?? ""}
        allPartItems={partItems}
        racks={racks}
        shelves={shelves}
        bins={bins}
        onAssign={assignPartLocation}
        onClose={() => setAssignDialog(false)}
      />
    </div>
  );
}
