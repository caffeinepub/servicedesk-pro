import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useStore } from "../store";

export default function WarehousePage() {
  const {
    racks,
    shelves,
    bins,
    partItems,
    purchaseEntries,
    stockCompanies,
    stockPartNames,
    currentUser,
    addRack,
    updateRack,
    deleteRack,
    addShelf,
    updateShelf,
    deleteShelf,
    addBin,
    deleteBin,
    assignPartLocation,
  } = useStore();

  const isAdmin = currentUser?.role === "admin";

  // Rack dialog
  const [rackDialog, setRackDialog] = useState(false);
  const [rackEdit, setRackEdit] = useState<string | null>(null);
  const [rackName, setRackName] = useState("");

  // Shelf dialog
  const [shelfDialog, setShelfDialog] = useState(false);
  const [shelfEdit, setShelfEdit] = useState<string | null>(null);
  const [shelfName, setShelfName] = useState("");
  const [shelfRackId, setShelfRackId] = useState("");

  // Bin dialog
  const [binDialog, setBinDialog] = useState(false);
  const [binName, setBinName] = useState("");
  const [binShelfId, setBinShelfId] = useState("");

  // Assign location dialog
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignPartId, setAssignPartId] = useState("");
  const [assignRack, setAssignRack] = useState("");
  const [assignShelf, setAssignShelf] = useState("");
  const [assignBin, setAssignBin] = useState("");

  const locationPending = partItems.filter(
    (p) => !p.rackId && p.status !== "returned_to_company",
  );

  const getRackName = (id: string) =>
    racks.find((r) => r.id === id)?.name ?? id;
  const getShelfName = (id: string) =>
    shelves.find((s) => s.id === id)?.name ?? id;
  const getPartName = (p: (typeof partItems)[0]) => {
    const company =
      stockCompanies.find((c) => c.id === p.companyId)?.name ?? "";
    const partName =
      stockPartNames.find((pn) => pn.id === p.partNameId)?.name ?? "";
    const purchase = purchaseEntries.find((pe) => pe.id === p.purchaseId);
    return { company, partName, purchaseDate: purchase?.invoiceDate ?? "" };
  };

  const openAssign = (partId: string) => {
    setAssignPartId(partId);
    setAssignRack("");
    setAssignShelf("");
    setAssignBin("");
    setAssignDialog(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Warehouse</h1>
        <p className="text-sm text-slate-500">
          Manage rack, shelf and bin locations
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="racks" className="w-full">
            <TabsList className="w-full rounded-none border-b border-slate-200 bg-slate-50 justify-start px-4 gap-2 h-12 overflow-x-auto">
              <TabsTrigger value="racks" data-ocid="warehouse.tab">
                Racks ({racks.length})
              </TabsTrigger>
              <TabsTrigger value="shelves" data-ocid="warehouse.tab">
                Shelves ({shelves.length})
              </TabsTrigger>
              <TabsTrigger value="bins" data-ocid="warehouse.tab">
                Bins ({bins.length})
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

            {/* Racks */}
            <TabsContent value="racks" className="p-4 space-y-3">
              {isAdmin && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setRackEdit(null);
                      setRackName("");
                      setRackDialog(true);
                    }}
                    data-ocid="warehouse.open_modal_button"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Rack
                  </Button>
                </div>
              )}
              {racks.length === 0 ? (
                <p
                  className="text-slate-400 text-center py-6"
                  data-ocid="warehouse.empty_state"
                >
                  No racks added.
                </p>
              ) : (
                <div className="space-y-2">
                  {racks.map((r, i) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg"
                      data-ocid={`warehouse.item.${i + 1}`}
                    >
                      <div>
                        <span className="font-medium text-slate-800">
                          {r.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          {shelves.filter((s) => s.rackId === r.id).length}{" "}
                          shelf(ves)
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRackEdit(r.id);
                              setRackName(r.name);
                              setRackDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => deleteRack(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Shelves */}
            <TabsContent value="shelves" className="p-4 space-y-3">
              {isAdmin && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setShelfEdit(null);
                      setShelfName("");
                      setShelfRackId("");
                      setShelfDialog(true);
                    }}
                    data-ocid="warehouse.open_modal_button"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Shelf
                  </Button>
                </div>
              )}
              {shelves.length === 0 ? (
                <p
                  className="text-slate-400 text-center py-6"
                  data-ocid="warehouse.empty_state"
                >
                  No shelves added.
                </p>
              ) : (
                <div className="space-y-2">
                  {shelves.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg"
                      data-ocid={`warehouse.item.${i + 1}`}
                    >
                      <div>
                        <span className="font-medium text-slate-800">
                          {s.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          in {getRackName(s.rackId)}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShelfEdit(s.id);
                              setShelfName(s.name);
                              setShelfRackId(s.rackId);
                              setShelfDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => deleteShelf(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Bins */}
            <TabsContent value="bins" className="p-4 space-y-3">
              {isAdmin && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setBinName("");
                      setBinShelfId("");
                      setBinDialog(true);
                    }}
                    data-ocid="warehouse.open_modal_button"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Bin
                  </Button>
                </div>
              )}
              {bins.length === 0 ? (
                <p
                  className="text-slate-400 text-center py-6"
                  data-ocid="warehouse.empty_state"
                >
                  No bins added.
                </p>
              ) : (
                <div className="space-y-2">
                  {bins.map((b, i) => {
                    const shelf = shelves.find((s) => s.id === b.shelfId);
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg"
                        data-ocid={`warehouse.item.${i + 1}`}
                      >
                        <div>
                          <span className="font-medium text-slate-800">
                            {b.name}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">
                            {shelf
                              ? `${getShelfName(b.shelfId)} › ${getRackName(shelf.rackId)}`
                              : ""}
                          </span>
                        </div>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => deleteBin(b.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Location Pending */}
            <TabsContent value="pending" className="p-4">
              {locationPending.length === 0 ? (
                <div
                  className="text-center py-10"
                  data-ocid="warehouse.empty_state"
                >
                  <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400">
                    All parts have locations assigned.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-3 py-2 text-slate-600 font-medium">
                          Part Code
                        </th>
                        <th className="text-left px-3 py-2 text-slate-600 font-medium">
                          Company
                        </th>
                        <th className="text-left px-3 py-2 text-slate-600 font-medium">
                          Part Name
                        </th>
                        <th className="text-left px-3 py-2 text-slate-600 font-medium">
                          Purchase Date
                        </th>
                        <th className="text-left px-3 py-2 text-slate-600 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationPending.map((p, i) => {
                        const { company, partName, purchaseDate } =
                          getPartName(p);
                        return (
                          <tr
                            key={p.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                            data-ocid={`warehouse.row.${i + 1}`}
                          >
                            <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-800">
                              {p.partCode}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {company}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {partName}
                            </td>
                            <td className="px-3 py-2 text-slate-500">
                              {purchaseDate}
                            </td>
                            <td className="px-3 py-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-300"
                                onClick={() => openAssign(p.id)}
                                data-ocid={`warehouse.button.${i + 1}`}
                              >
                                <MapPin className="h-3 w-3 mr-1" /> Assign
                                Location
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
              onClick={() => {
                if (!rackName.trim()) return;
                if (rackEdit) updateRack(rackEdit, rackName.trim());
                else addRack(rackName.trim());
                setRackDialog(false);
              }}
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
              onClick={() => {
                if (!shelfName.trim() || !shelfRackId) return;
                if (shelfEdit)
                  updateShelf(shelfEdit, {
                    name: shelfName.trim(),
                    rackId: shelfRackId,
                  });
                else addShelf(shelfName.trim(), shelfRackId);
                setShelfDialog(false);
              }}
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
            <DialogTitle>Add Bin</DialogTitle>
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
                {shelves.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({getRackName(s.rackId)})
                  </SelectItem>
                ))}
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
              onClick={() => {
                if (!binName.trim() || !binShelfId) return;
                addBin(binName.trim(), binShelfId);
                setBinDialog(false);
              }}
              data-ocid="warehouse.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Location Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Rack</Label>
            <Select
              value={assignRack}
              onValueChange={(v) => {
                setAssignRack(v);
                setAssignShelf("");
                setAssignBin("");
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
              value={assignShelf}
              onValueChange={(v) => {
                setAssignShelf(v);
                setAssignBin("");
              }}
              disabled={!assignRack}
            >
              <SelectTrigger data-ocid="warehouse.select">
                <SelectValue placeholder="Select shelf" />
              </SelectTrigger>
              <SelectContent>
                {shelves
                  .filter((s) => s.rackId === assignRack)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Label>Bin (optional)</Label>
            <Select
              value={assignBin}
              onValueChange={setAssignBin}
              disabled={!assignShelf}
            >
              <SelectTrigger data-ocid="warehouse.select">
                <SelectValue placeholder="Select bin" />
              </SelectTrigger>
              <SelectContent>
                {bins
                  .filter((b) => b.shelfId === assignShelf)
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
              onClick={() => setAssignDialog(false)}
              data-ocid="warehouse.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (!assignRack || !assignShelf) return;
                assignPartLocation(
                  assignPartId,
                  assignRack,
                  assignShelf,
                  assignBin,
                );
                setAssignDialog(false);
              }}
              data-ocid="warehouse.confirm_button"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
