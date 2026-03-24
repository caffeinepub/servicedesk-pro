import {
  Building2,
  CheckCircle,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Save,
  Settings,
  Settings2,
  User,
  X,
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useStore } from "../store";

export default function SettingsPage() {
  const { settings, updateSettings, currentUser } = useStore();
  const isAdmin = currentUser?.role === "admin";
  const [saved, setSaved] = useState(false);
  const [waNumber, setWaNumber] = useState(settings.supervisorWhatsApp);
  const [supervisorName, setSupervisorName] = useState(
    settings.supervisorName ?? "Mishra",
  );
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [products, setProducts] = useState<string[]>(settings.products);
  const [newProduct, setNewProduct] = useState("");

  const save = () => {
    updateSettings({
      supervisorWhatsApp: waNumber,
      supervisorName,
      companyName,
      products,
    });
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 3000);
  };

  const addProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      setProducts([...products, newProduct.trim()]);
      setNewProduct("");
    }
  };

  const removeProduct = (p: string) =>
    setProducts(products.filter((x) => x !== p));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-gray-600 to-slate-700 text-white rounded-xl px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-300 text-sm">Configure system settings</p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg text-sm text-yellow-800">
          Only admins can modify settings.
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Company Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Supervisor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Supervisor Name (used in WhatsApp greeting)</Label>
            <Input
              placeholder="e.g. Mishra"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              disabled={!isAdmin}
            />
            <p className="text-xs text-gray-400">
              WhatsApp messages will start with: Hello {supervisorName} ji,
            </p>
          </div>
          <div className="space-y-1">
            <Label>WhatsApp Number (with country code, no spaces)</Label>
            <Input
              placeholder="e.g. 919876543210"
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              disabled={!isAdmin}
            />
            <p className="text-xs text-gray-400">
              This number will receive part availability queries.
            </p>
          </div>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline"
            >
              Test: Open WhatsApp to {waNumber}
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Product List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm"
              >
                {p}
                {isAdmin && (
                  <button type="button" onClick={() => removeProduct(p)}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Input
                placeholder="Add product..."
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProduct()}
              />
              <Button size="sm" variant="outline" onClick={addProduct}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="flex items-center gap-3">
          <Button onClick={save} data-ocid="settings.save_button">
            Save Settings
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" /> Saved!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
