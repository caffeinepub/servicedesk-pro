import {
  Building2,
  Edit,
  IndianRupee,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { useStore } from "../store";
import type { Vendor } from "../types";

const emptyForm = () => ({ name: "", phone: "", email: "", address: "" });

export default function VendorsPage() {
  const {
    vendors,
    purchaseEntries,
    addVendor,
    updateVendor,
    deleteVendor,
    navigate,
  } = useStore();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getVendorStats = (v: Vendor) => {
    const purchases = purchaseEntries.filter(
      (p) => p.vendorId === v.id || p.vendorName === v.name,
    );
    const totalUnits = purchases.reduce((a, p) => a + (p.quantity || 0), 0);
    const totalSpend = purchases.reduce(
      (a, p) => a + (p.costPrice || 0) * (p.quantity || 0),
      0,
    );
    return {
      purchases: purchases.length,
      units: totalUnits,
      spend: totalSpend,
    };
  };

  const totalPurchases = purchaseEntries.length;
  const totalUnits = purchaseEntries.reduce((a, p) => a + (p.quantity || 0), 0);
  const totalSpend = purchaseEntries.reduce(
    (a, p) => a + (p.costPrice || 0) * (p.quantity || 0),
    0,
  );

  let filtered = vendors.filter(
    (v) =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (sort === "name")
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "spend") {
    filtered = [...filtered].sort(
      (a, b) => getVendorStats(b).spend - getVendorStats(a).spend,
    );
  } else if (sort === "purchases") {
    filtered = [...filtered].sort(
      (a, b) => getVendorStats(b).purchases - getVendorStats(a).purchases,
    );
  }

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (v: Vendor) => {
    setEditId(v.id);
    setForm({
      name: v.name,
      phone: v.phone,
      email: v.email,
      address: v.address,
    });
    setShowModal(true);
  };

  const saveVendor = () => {
    if (!form.name.trim()) return;
    if (editId) {
      updateVendor(editId, form);
      toast.success("Vendor updated");
    } else {
      addVendor(form);
      toast.success("Vendor added successfully");
    }
    setShowModal(false);
  };

  const rankedVendors = [...vendors]
    .map((v) => ({ ...v, ...getVendorStats(v) }))
    .sort((a, b) => b.spend - a.spend);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Vendors</h1>
            <p className="text-emerald-200 text-sm">
              Manage your spare parts vendors
            </p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          className="bg-white text-emerald-700 hover:bg-emerald-50"
          data-ocid="vendors.open_modal_button"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Vendor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Vendors",
            value: vendors.length,
            color: "text-blue-600",
            icon: Users,
            bg: "bg-blue-100",
            gradient: "from-blue-50 to-white",
          },
          {
            label: "Total Purchases",
            value: totalPurchases,
            color: "text-purple-600",
            icon: ShoppingCart,
            bg: "bg-purple-100",
            gradient: "from-purple-50 to-white",
          },
          {
            label: "Total Units",
            value: totalUnits,
            color: "text-green-600",
            icon: Package,
            bg: "bg-green-100",
            gradient: "from-green-50 to-white",
          },
          {
            label: "Total Spend",
            value: `₹${totalSpend.toLocaleString()}`,
            color: "text-amber-600",
            icon: IndianRupee,
            bg: "bg-amber-100",
            gradient: "from-amber-50 to-white",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className={`shadow-sm border-0 bg-gradient-to-br ${s.gradient}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}
              >
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          data-ocid="vendors.search_input"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          data-ocid="vendors.select"
        >
          <option value="name">Name A-Z</option>
          <option value="spend">Spend High-Low</option>
          <option value="purchases">Most Purchases</option>
        </select>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v, i) => {
          const stats = getVendorStats(v);
          return (
            <Card
              key={v.id}
              className="shadow-sm hover:shadow-md transition-shadow"
              data-ocid={`vendors.card.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{v.name}</p>
                      <p className="text-xs text-slate-400">
                        Since {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      data-ocid={`vendors.edit_button.${i + 1}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(v.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      data-ocid={`vendors.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-slate-600 mb-3">
                  {v.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {v.phone}
                    </div>
                  )}
                  {v.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {v.email}
                    </div>
                  )}
                  {v.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{v.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      {stats.purchases}
                    </p>
                    <p className="text-xs text-slate-400">Purchases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      {stats.units}
                    </p>
                    <p className="text-xs text-slate-400">Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      ₹{stats.spend.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Spend</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() =>
                    navigate("purchase", undefined, undefined, v.id)
                  }
                  data-ocid={`vendors.link.${i + 1}`}
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" /> View Purchases →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-12 text-slate-400"
          data-ocid="vendors.empty_state"
        >
          No vendors found
        </div>
      )}

      {/* Spend Ranking Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vendor Spend Ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    #
                  </th>
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    Vendor
                  </th>
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    Purchases
                  </th>
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    Units
                  </th>
                  <th className="text-left px-4 py-2 text-slate-600 font-medium">
                    Total Spend
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankedVendors.map((v, i) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                    data-ocid={`vendors.row.${i + 1}`}
                  >
                    <td className="px-4 py-2 text-slate-500 font-medium">
                      #{i + 1}
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {v.name}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{v.purchases}</td>
                    <td className="px-4 py-2 text-slate-600">{v.units}</td>
                    <td className="px-4 py-2 font-semibold text-green-600">
                      ₹{v.spend.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="vendors.modal">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Vendor" : "Add New Vendor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Vendor Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Company name"
                data-ocid="vendors.input"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Contact number"
                data-ocid="vendors.input"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="email@example.com"
                data-ocid="vendors.input"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Business address"
                data-ocid="vendors.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="vendors.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveVendor}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="vendors.save_button"
            >
              {editId ? "Save Changes" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent data-ocid="vendors.dialog">
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this vendor? This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="vendors.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) deleteVendor(deleteId);
                setDeleteId(null);
              }}
              data-ocid="vendors.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
