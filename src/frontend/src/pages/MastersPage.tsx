import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";

function MasterList({
  items,
  onAdd,
  onEdit,
  onDelete,
  isAdmin,
  label,
  partItems,
}: {
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  label: string;
  partItems?: { id: string }[];
}) {
  const [dialog, setDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const open = (item?: { id: string; name: string }) => {
    setEditId(item?.id ?? null);
    setName(item?.name ?? "");
    setDialog(true);
  };

  const save = () => {
    if (!name.trim()) return;
    if (editId) onEdit(editId, name.trim());
    else onAdd(name.trim());
    setDialog(false);
    setName("");
    setEditId(null);
  };

  const bulkImport = () => {
    const names = bulkText
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    for (const n of names) onAdd(n);
    setBulkDialog(false);
    setBulkText("");
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkDialog(true)}
            data-ocid="masters.secondary_button"
          >
            Bulk Import
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => open()}
            data-ocid="masters.open_modal_button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add {label}
          </Button>
        </div>
      )}
      {items.length === 0 ? (
        <div
          className="text-center text-slate-400 py-8"
          data-ocid="masters.empty_state"
        >
          No {label.toLowerCase()}s added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const usageCount = partItems?.length ?? 0;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                data-ocid={`masters.item.${idx + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">
                    {item.name}
                  </span>
                  {usageCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {usageCount} parts
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => open(item)}
                      data-ocid={`masters.edit_button.${idx + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDelete(item.id)}
                      data-ocid={`masters.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit" : "Add"} {label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()} name`}
              onKeyDown={(e) => e.key === "Enter" && save()}
              data-ocid="masters.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="masters.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="masters.save_button"
            >
              {editId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import {label}s</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Paste comma-separated names</Label>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`e.g. ${label} A, ${label} B, ${label} C`}
              rows={4}
              data-ocid="masters.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDialog(false)}
              data-ocid="masters.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={bulkImport}
              data-ocid="masters.confirm_button"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MastersPage() {
  const {
    stockCompanies,
    stockCategories,
    stockPartNames,
    partItems,
    purchaseEntries,
    currentUser,
    addStockCompany,
    updateStockCompany,
    deleteStockCompany,
    addStockCategory,
    updateStockCategory,
    deleteStockCategory,
    addStockPartName,
    updateStockPartName,
    deleteStockPartName,
  } = useStore();
  const isAdmin = currentUser?.role === "admin";

  const totalSpend = purchaseEntries.reduce(
    (a, p) => a + (p.costPrice || 0) * (p.quantity || 0),
    0,
  );

  // Part status by company
  const companyStats = stockCompanies.map((c) => {
    const parts = partItems.filter((p) => p.companyId === c.id);
    return {
      name: c.name,
      inWarehouse: parts.filter((p) => p.status === "in_stock").length,
      issued: parts.filter((p) => p.status === "issued").length,
      installed: parts.filter((p) => p.status === "installed").length,
      defective: parts.filter((p) => p.status === "returned_to_company").length,
      total: parts.length,
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Master Categories
          </h1>
          <p className="text-sm text-slate-500">
            Manage companies, categories and part names used in inventory
          </p>
        </div>
        {!isAdmin && <Badge variant="secondary">View Only</Badge>}
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Companies",
            value: stockCompanies.length,
            color: "text-blue-600",
          },
          {
            label: "Categories",
            value: stockCategories.length,
            color: "text-purple-600",
          },
          {
            label: "Part Names",
            value: stockPartNames.length,
            color: "text-green-600",
          },
          {
            label: "Total Spend",
            value: `₹${totalSpend.toLocaleString()}`,
            color: "text-amber-600",
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Part Status by Company */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Part Status by Company
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    Company
                  </th>
                  <th className="text-left px-4 py-2 text-green-600 font-medium">
                    In Stock
                  </th>
                  <th className="text-left px-4 py-2 text-amber-600 font-medium">
                    Issued
                  </th>
                  <th className="text-left px-4 py-2 text-blue-600 font-medium">
                    Installed
                  </th>
                  <th className="text-left px-4 py-2 text-red-600 font-medium">
                    Returned
                  </th>
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {companyStats.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-2 text-green-600 font-semibold">
                      {s.inWarehouse}
                    </td>
                    <td className="px-4 py-2 text-amber-600 font-semibold">
                      {s.issued}
                    </td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">
                      {s.installed}
                    </td>
                    <td className="px-4 py-2 text-red-600 font-semibold">
                      {s.defective}
                    </td>
                    <td className="px-4 py-2 text-slate-700 font-semibold">
                      {s.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="companies" className="w-full">
            <TabsList className="w-full rounded-none border-b border-slate-200 bg-slate-50 justify-start px-4 gap-2 h-12">
              <TabsTrigger value="companies" data-ocid="masters.tab">
                Companies ({stockCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="categories" data-ocid="masters.tab">
                Categories ({stockCategories.length})
              </TabsTrigger>
              <TabsTrigger value="partnames" data-ocid="masters.tab">
                Part Names ({stockPartNames.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="companies" className="p-4">
              <MasterList
                items={stockCompanies}
                onAdd={addStockCompany}
                onEdit={updateStockCompany}
                onDelete={deleteStockCompany}
                isAdmin={isAdmin}
                label="Company"
              />
            </TabsContent>
            <TabsContent value="categories" className="p-4">
              <MasterList
                items={stockCategories}
                onAdd={addStockCategory}
                onEdit={updateStockCategory}
                onDelete={deleteStockCategory}
                isAdmin={isAdmin}
                label="Category"
              />
            </TabsContent>
            <TabsContent value="partnames" className="p-4">
              <MasterList
                items={stockPartNames}
                onAdd={addStockPartName}
                onEdit={updateStockPartName}
                onDelete={deleteStockPartName}
                isAdmin={isAdmin}
                label="Part Name"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
