import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useStore } from "../store";
import type { Technician } from "../types";

export default function TechniciansPage() {
  const {
    technicians,
    cases,
    currentUser,
    addTechnician,
    updateTechnician,
    deleteTechnician,
  } = useStore();
  const isAdmin = currentUser?.role === "admin";
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Technician | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    isActive: true,
  });

  const open = (t?: Technician) => {
    if (t) {
      setEditing(t);
      setForm({
        name: t.name,
        phone: t.phone,
        specialization: t.specialization,
        isActive: t.isActive,
      });
    } else {
      setEditing(null);
      setForm({ name: "", phone: "", specialization: "", isActive: true });
    }
    setDialog(true);
  };

  const save = () => {
    if (editing) updateTechnician(editing.id, form);
    else addTechnician(form);
    setDialog(false);
  };

  const perf = (techId: string) => ({
    assigned: cases.filter((c) => c.technicianId === techId).length,
    completed: cases.filter(
      (c) =>
        c.technicianId === techId &&
        ["closed", "adjustment_closed", "replacement_done"].includes(c.status),
    ).length,
    pending: cases.filter(
      (c) =>
        c.technicianId === techId &&
        ![
          "closed",
          "cancelled",
          "transferred",
          "adjustment_closed",
          "replacement_done",
        ].includes(c.status),
    ).length,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Technicians</h2>
          <p className="text-sm text-gray-500">
            {technicians.length} technicians registered
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => open()}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Technician
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {technicians.map((t) => {
          const p = perf(t.id);
          return (
            <div
              key={t.id}
              className={`bg-white rounded-xl border shadow-sm p-5 ${!t.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.specialization}</p>
                    <p className="text-xs text-gray-400">{t.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => open(t)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Pencil className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTechnician(t.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">
                    {p.assigned}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    {p.completed}
                  </p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-600">
                    {p.pending}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Technician" : "Add Technician"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Specialization</Label>
              <Input
                placeholder="e.g. AC, Washing Machine"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Active</Label>
            </div>
            <Button onClick={save} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
