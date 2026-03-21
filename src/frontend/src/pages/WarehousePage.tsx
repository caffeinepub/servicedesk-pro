import { useNavigate } from "@tanstack/react-router";
import {
  AlignJustify,
  Box,
  Building2,
  Folder,
  FolderOpen,
  MapPin,
  Pencil,
  Plus,
  Server,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
  racks,
  shelves,
  bins,
  onAssign,
  onClose,
}: {
  open: boolean;
  partId: string;
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

  const handleClose = () => {
    setRack("");
    setShelf("");
    setBin("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Rack</Label>
          <Select
            value={rack}
            onValueChange={(v) => {
              setRack(v);
              setShelf("");
              setBin("");
            }}
          >
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
          <Label>Shelf</Label>
          <Select
            value={shelf}
            onValueChange={(v) => {
              setShelf(v);
              setBin("");
            }}
            disabled={!rack}
          >
            <SelectTrigger data-ocid="warehouse.select">
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
          <Label>Bin (optional)</Label>
          <Select value={bin} onValueChange={setBin} disabled={!shelf}>
            <SelectTrigger data-ocid="warehouse.select">
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
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            data-ocid="warehouse.cancel_button"
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!rack || !shelf}
            onClick={() => {
              onAssign(partId, rack, shelf, bin);
              handleClose();
            }}
            data-ocid="warehouse.confirm_button"
          >
            Assign
          </Button>
        </DialogFooter>
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
                <div className="flex items-center px-4 py-3 bg-slate-50 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRack(rack.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {isExpanded ? (
                      <FolderOpen className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Folder className="h-5 w-5 text-slate-400" />
                    )}
                    <Server className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold text-slate-800">
                      {rack.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {rackShelves.length} shelf(ves)
                    </Badge>
                  </button>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditRack(rack)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
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
                          <div className="flex items-center px-3 py-2 bg-white gap-2">
                            <button
                              type="button"
                              onClick={() => toggleShelf(shelf.id)}
                              className="flex items-center gap-2 flex-1 text-left"
                            >
                              {isShelfExpanded ? (
                                <FolderOpen className="h-4 w-4 text-amber-400" />
                              ) : (
                                <Folder className="h-4 w-4 text-slate-300" />
                              )}
                              <AlignJustify className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">
                                {shelf.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {shelfBins.length} bin(s)
                              </Badge>
                            </button>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEditShelf(shelf)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500"
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
                                    className="flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1 text-xs text-slate-600"
                                  >
                                    <Box className="h-3 w-3 text-slate-400" />
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
        <h3 className="font-semibold text-slate-900 mb-3">Parts by Location</h3>
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
                  className="w-full flex items-center px-4 py-3 bg-slate-50 gap-2 text-left"
                >
                  {isExpanded ? (
                    <FolderOpen className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Folder className="h-5 w-5 text-slate-400" />
                  )}
                  <Server className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-800">
                    {rack.name}
                  </span>
                  <div className="ml-auto flex gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {rackShelves.length} Shelves
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rackParts.length} Parts
                    </Badge>
                  </div>
                </button>
                {isExpanded && (
                  <div className="pl-6 pr-4 pb-3 space-y-2 mt-2">
                    {rackShelves.map((shelf, si) => {
                      const shelfParts = partItems.filter(
                        (p) =>
                          p.shelfId === shelf.id &&
                          p.status !== "returned_to_company",
                      );
                      const shelfBins = bins.filter(
                        (b) => b.shelfId === shelf.id,
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
                            className="w-full flex items-center px-3 py-2 bg-white gap-2 text-left"
                          >
                            {isShelfExpanded ? (
                              <FolderOpen className="h-4 w-4 text-amber-400" />
                            ) : (
                              <Folder className="h-4 w-4 text-slate-300" />
                            )}
                            <AlignJustify className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm text-slate-700">
                              {shelf.name}
                            </span>
                            <div className="ml-auto flex gap-1.5">
                              <Badge variant="outline" className="text-xs">
                                {shelfBins.length} Bins
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {shelfParts.length} Parts
                              </Badge>
                            </div>
                          </button>
                          {isShelfExpanded && (
                            <div className="px-4 pb-3 pt-1 space-y-2">
                              {shelfBins.map((bin) => {
                                const binParts = partItems.filter(
                                  (p) =>
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
                                      className="w-full flex items-center px-2 py-1.5 bg-slate-50 gap-2 text-left"
                                    >
                                      {isBinExpanded ? (
                                        <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                                      ) : (
                                        <Folder className="h-3.5 w-3.5 text-slate-300" />
                                      )}
                                      <Box className="h-3 w-3 text-slate-400" />
                                      <span className="text-xs font-medium text-slate-600">
                                        {bin.name}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs ml-auto"
                                      >
                                        {binParts.length} Parts
                                      </Badge>
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
  const navigate = useNavigate();
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
    (p) => !p.rackId && p.status !== "returned_to_company",
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
    navigate({ to: "/inventory/part/$partCode", params: { partCode } });
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
    else addWarehouse(whName.trim(), whAddress.trim());
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
    else addRackToWarehouse(rackName.trim(), rackWhId);
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
    else addShelf(shelfName.trim(), shelfRackId);
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
    else addBin(binName.trim(), binShelfId);
    setBinDialog(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Warehouse</h1>
        <p className="text-sm text-slate-500">
          Manage warehouse locations and stock placement
        </p>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="mb-4" data-ocid="warehouse.tab">
          <TabsTrigger value="layout" data-ocid="warehouse.tab">
            Layout
          </TabsTrigger>
          <TabsTrigger value="pending" data-ocid="warehouse.tab">
            Location Pending
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
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Warehouses</h2>
                {isAdmin && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
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
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                        data-ocid={`warehouse.item.${i + 1}`}
                      >
                        <button
                          type="button"
                          className="cursor-pointer text-left w-full"
                          onClick={() => setSelectedWarehouse(wh)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            <h3 className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {wh.name}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {wh.address}
                          </p>
                          <div className="mt-3 flex items-center gap-1.5">
                            <Server className="h-3.5 w-3.5 text-slate-400" />
                            <Badge variant="outline" className="text-xs">
                              {whRacks.length} Rack(s)
                            </Badge>
                          </div>
                        </button>
                        {isAdmin && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
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
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                Location Pending Parts
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Parts that have not been assigned a warehouse location yet.
              </p>
            </div>

            <Input
              placeholder="Search by part code or part name..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="max-w-sm"
              data-ocid="warehouse.search_input"
            />

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
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                        Part Code
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">
                        Part Name
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">
                        Company
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">
                        Category
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">
                        Status
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">
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
                          className="border-b border-slate-100 hover:bg-slate-50"
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
                              className="text-blue-600 border-blue-300 text-xs"
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
        racks={racks}
        shelves={shelves}
        bins={bins}
        onAssign={assignPartLocation}
        onClose={() => setAssignDialog(false)}
      />
    </div>
  );
}
