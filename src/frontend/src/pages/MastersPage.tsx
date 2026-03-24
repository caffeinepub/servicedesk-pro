import {
  Building2,
  Eye,
  Layers,
  Package,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";

export default function MastersPage() {
  const {
    stockCompanies,
    stockCategories,
    stockPartNames,
    partItems,
    purchaseEntries,
    currentUser,
    navigate,
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

  const [dialog, setDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"company" | "category" | "partname">(
    "company",
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: "company" | "category" | "partname";
  } | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState<"company" | "category" | "partname">(
    "company",
  );
  const [bulkText, setBulkText] = useState("");

  const openAdd = (type: "company" | "category" | "partname") => {
    setEditId(null);
    setEditName("");
    setEditType(type);
    setDialog(true);
  };
  const openEdit = (
    id: string,
    name: string,
    type: "company" | "category" | "partname",
  ) => {
    setEditId(id);
    setEditName(name);
    setEditType(type);
    setDialog(true);
  };
  const handleSave = () => {
    if (!editName.trim()) return;
    if (editType === "company") {
      if (editId) updateStockCompany(editId, editName);
      else addStockCompany(editName);
    } else if (editType === "category") {
      if (editId) updateStockCategory(editId, editName);
      else addStockCategory(editName);
    } else {
      if (editId) updateStockPartName(editId, editName);
      else addStockPartName(editName);
    }
    toast.success(editId ? "Updated successfully" : "Added successfully");
    setDialog(false);
  };
  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "company") deleteStockCompany(deleteTarget.id);
    else if (deleteTarget.type === "category")
      deleteStockCategory(deleteTarget.id);
    else deleteStockPartName(deleteTarget.id);
    setDeleteTarget(null);
  };
  const handleBulk = () => {
    const names = bulkText
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    for (const n of names) {
      if (bulkType === "company") addStockCompany(n);
      else if (bulkType === "category") addStockCategory(n);
      else addStockPartName(n);
    }
    toast.success("Items added successfully");
    setBulkOpen(false);
    setBulkText("");
  };

  const stats = useMemo(
    () => ({
      companies: stockCompanies.length,
      categories: stockCategories.length,
      partNames: stockPartNames.length,
      totalPurchases: purchaseEntries.length,
    }),
    [stockCompanies, stockCategories, stockPartNames, purchaseEntries],
  );

  const getCompanyStats = (companyId: string) => {
    const parts = partItems.filter((p) => p.companyId === companyId);
    const cats = [...new Set(parts.map((p) => p.categoryId))];
    const pnames = [...new Set(parts.map((p) => p.partNameId))];
    const purch = purchaseEntries.filter((p) => p.companyId === companyId);
    return {
      parts: parts.length,
      categories: cats.length,
      partNames: pnames.length,
      purchases: purch.length,
    };
  };

  const getCategoryStats = (catId: string) => {
    const parts = partItems.filter((p) => p.categoryId === catId);
    const pnames = [...new Set(parts.map((p) => p.partNameId))];
    const purch = purchaseEntries.filter((p) => p.categoryId === catId);
    return {
      parts: parts.length,
      partNames: pnames.length,
      purchases: purch.length,
    };
  };

  const getPartNameStats = (pnId: string) => {
    const parts = partItems.filter((p) => p.partNameId === pnId);
    const purch = purchaseEntries.filter((p) => p.partNameId === pnId);
    return { parts: parts.length, purchases: purch.length };
  };

  const kpiCards = [
    {
      label: "Companies",
      value: stats.companies,
      color: "from-blue-500 to-blue-600",
      icon: Building2,
      bg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Categories",
      value: stats.categories,
      color: "from-violet-500 to-violet-600",
      icon: Layers,
      bg: "bg-violet-50 text-violet-600",
    },
    {
      label: "Part Names",
      value: stats.partNames,
      color: "from-emerald-500 to-emerald-600",
      icon: Tag,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Purchases",
      value: stats.totalPurchases,
      color: "from-amber-500 to-amber-600",
      icon: Package,
      bg: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl px-6 py-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Masters</h1>
            <p className="text-teal-200 text-sm">Manage product hierarchy</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiCards.map((k) => (
            <div
              key={k.label}
              className={`bg-gradient-to-br ${k.color} rounded-2xl p-4 text-white shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">{k.label}</p>
                  <p className="text-3xl font-bold mt-1">{k.value}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <k.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Part Status by Company */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Part Status by Company
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-semibold text-slate-700 bg-slate-50">
                    Company
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-emerald-700 bg-emerald-50/50">
                    In Stock
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-amber-700 bg-amber-50/50">
                    Issued
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-blue-700 bg-blue-50/50">
                    Installed
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-red-700 bg-red-50/50">
                    Returned
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700 bg-slate-50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockCompanies.map((c) => {
                  const cParts = partItems.filter((p) => p.companyId === c.id);
                  const inStock = cParts.filter(
                    (p) => p.status === "in_stock",
                  ).length;
                  const issued = cParts.filter(
                    (p) => p.status === "issued",
                  ).length;
                  const installed = cParts.filter(
                    (p) => p.status === "installed",
                  ).length;
                  const returned = cParts.filter(
                    (p) => p.status === "returned_to_company",
                  ).length;
                  const total = cParts.length;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-emerald-700">
                          {inStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-amber-700">
                          {issued}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-blue-700">
                          {installed}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-red-700">
                          {returned}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-slate-800">
                          {total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {stockCompanies.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-slate-400 text-sm"
                    >
                      No companies yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabs */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <Tabs defaultValue="companies">
            <div className="border-b border-slate-200 bg-slate-50 px-4">
              <TabsList className="bg-transparent h-12 gap-1">
                <TabsTrigger
                  value="companies"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  data-ocid="masters.tab"
                >
                  <Building2 className="h-4 w-4 mr-1.5" /> Companies (
                  {stats.companies})
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  data-ocid="masters.tab"
                >
                  <Layers className="h-4 w-4 mr-1.5" /> Categories (
                  {stats.categories})
                </TabsTrigger>
                <TabsTrigger
                  value="partnames"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  data-ocid="masters.tab"
                >
                  <Tag className="h-4 w-4 mr-1.5" /> Part Names (
                  {stats.partNames})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Companies */}
            <TabsContent value="companies" className="p-4">
              {isAdmin && (
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBulkType("company");
                      setBulkOpen(true);
                    }}
                  >
                    Bulk Import
                  </Button>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => openAdd("company")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Company
                  </Button>
                </div>
              )}
              {stockCompanies.length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="masters.empty_state"
                >
                  <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No companies added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockCompanies.map((c, idx) => {
                    const s = getCompanyStats(c.id);
                    const isUnused = s.parts === 0 && s.purchases === 0;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3 transition-all shadow-sm"
                        data-ocid={`masters.item.${idx + 1}`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800">
                            {c.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {isUnused ? (
                              <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                Unused
                              </span>
                            ) : (
                              <>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {s.categories} categories
                                </span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  {s.parts} parts
                                </span>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {s.purchases} purchases
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => navigate("inventory")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() =>
                                  openEdit(c.id, c.name, "company")
                                }
                                data-ocid={`masters.edit_button.${idx + 1}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: c.id,
                                    name: c.name,
                                    type: "company",
                                  })
                                }
                                data-ocid={`masters.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Categories */}
            <TabsContent value="categories" className="p-4">
              {isAdmin && (
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBulkType("category");
                      setBulkOpen(true);
                    }}
                  >
                    Bulk Import
                  </Button>
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700"
                    onClick={() => openAdd("category")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Category
                  </Button>
                </div>
              )}
              {stockCategories.length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="masters.empty_state"
                >
                  <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No categories added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockCategories.map((cat, idx) => {
                    const s = getCategoryStats(cat.id);
                    const isUnused = s.parts === 0 && s.purchases === 0;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3 transition-all shadow-sm"
                        data-ocid={`masters.item.${idx + 1}`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                          <Layers className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800">
                            {cat.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {isUnused ? (
                              <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                Unused
                              </span>
                            ) : (
                              <>
                                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                  {s.partNames} part names
                                </span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  {s.parts} parts
                                </span>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {s.purchases} purchases
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => navigate("inventory")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() =>
                                  openEdit(cat.id, cat.name, "category")
                                }
                                data-ocid={`masters.edit_button.${idx + 1}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: cat.id,
                                    name: cat.name,
                                    type: "category",
                                  })
                                }
                                data-ocid={`masters.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Part Names */}
            <TabsContent value="partnames" className="p-4">
              {isAdmin && (
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBulkType("partname");
                      setBulkOpen(true);
                    }}
                  >
                    Bulk Import
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => openAdd("partname")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Part Name
                  </Button>
                </div>
              )}
              {stockPartNames.length === 0 ? (
                <div
                  className="text-center py-12 text-slate-400"
                  data-ocid="masters.empty_state"
                >
                  <Tag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No part names added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockPartNames.map((pn, idx) => {
                    const s = getPartNameStats(pn.id);
                    const isUnused = s.parts === 0 && s.purchases === 0;
                    return (
                      <div
                        key={pn.id}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-3 transition-all shadow-sm"
                        data-ocid={`masters.item.${idx + 1}`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Tag className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800">
                            {pn.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {isUnused ? (
                              <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                Unused
                              </span>
                            ) : (
                              <>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                  {s.parts} parts
                                </span>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  {s.purchases} purchases
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() =>
                                  openEdit(pn.id, pn.name, "partname")
                                }
                                data-ocid={`masters.edit_button.${idx + 1}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: pn.id,
                                    name: pn.name,
                                    type: "partname",
                                  })
                                }
                                data-ocid={`masters.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit" : "Add"}{" "}
              {editType === "company"
                ? "Company"
                : editType === "category"
                  ? "Category"
                  : "Part Name"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Name</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter name"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
              onClick={handleSave}
              disabled={!editName.trim()}
              data-ocid="masters.save_button"
            >
              {editId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk Import{" "}
              {bulkType === "company"
                ? "Companies"
                : bulkType === "category"
                  ? "Categories"
                  : "Part Names"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Comma-separated names</Label>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Name A, Name B, Name C"
              rows={4}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulk}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this entry. Parts using this cannot
              be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
