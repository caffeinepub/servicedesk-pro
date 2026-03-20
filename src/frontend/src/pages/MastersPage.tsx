import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { useStore } from "../store";

function MasterList({
  items,
  onAdd,
  onEdit,
  onDelete,
  isAdmin,
  label,
}: {
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  label: string;
}) {
  const [dialog, setDialog] = useState(false);
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

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
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
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm"
              data-ocid={`masters.item.${idx + 1}`}
            >
              <span className="font-medium text-slate-800">{item.name}</span>
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
          ))}
        </div>
      )}

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
    </div>
  );
}

export default function MastersPage() {
  const {
    stockCompanies,
    stockCategories,
    stockPartNames,
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
