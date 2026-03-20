import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useStore } from "../store";
import type { PartInventoryItem } from "../types";

const STATUS_STYLES: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700",
  issued: "bg-amber-100 text-amber-700",
  installed: "bg-blue-100 text-blue-700",
  returned_to_company: "bg-red-100 text-red-700",
  returned_to_store: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  issued: "Issued",
  installed: "Installed",
  returned_to_company: "Returned to Company",
  returned_to_store: "Returned to Store",
};

type DrillKey = { companyId: string; categoryId: string; partNameId: string };

export default function InventoryPage() {
  const {
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    racks,
    shelves,
    bins,
    navigate,
  } = useStore();

  const [search, setSearch] = useState("");
  const [drill, setDrill] = useState<DrillKey | null>(null);

  const getRackName = (id: string) =>
    racks.find((r) => r.id === id)?.name ?? "";
  const getShelfName = (id: string) =>
    shelves.find((s) => s.id === id)?.name ?? "";
  const getBinName = (id: string) => bins.find((b) => b.id === id)?.name ?? "";

  const locationStr = (p: PartInventoryItem) => {
    if (!p.rackId) return "No location";
    return [getRackName(p.rackId), getShelfName(p.shelfId), getBinName(p.binId)]
      .filter(Boolean)
      .join(" › ");
  };

  // Search mode
  if (search.trim().length > 0) {
    const q = search.toLowerCase();
    const found = partItems.filter((p) => p.partCode.toLowerCase().includes(q));
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by part code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="inventory.search_input"
          />
        </div>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              {found.length} result(s) for "{search}"
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Part Code
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Company
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Part Name
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Location
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {found.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                      data-ocid={`inventory.row.${i + 1}`}
                    >
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                          onClick={() =>
                            navigate("part-detail", undefined, p.id)
                          }
                          data-ocid={`inventory.link.${i + 1}`}
                        >
                          {p.partCode}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {stockCompanies.find((c) => c.id === p.companyId)?.name}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {
                          stockPartNames.find((pn) => pn.id === p.partNameId)
                            ?.name
                        }
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        {locationStr(p)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status]}`}
                        >
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Drill-down
  if (drill) {
    const filtered = partItems.filter(
      (p) =>
        p.companyId === drill.companyId &&
        p.categoryId === drill.categoryId &&
        p.partNameId === drill.partNameId,
    );
    const company =
      stockCompanies.find((c) => c.id === drill.companyId)?.name ?? "";
    const category =
      stockCategories.find((c) => c.id === drill.categoryId)?.name ?? "";
    const partName =
      stockPartNames.find((p) => p.id === drill.partNameId)?.name ?? "";
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDrill(null)}
            data-ocid="inventory.button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {company} › {category} › {partName}
            </h1>
            <p className="text-sm text-slate-500">
              {filtered.length} part code(s)
            </p>
          </div>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Part Code
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Location
                    </th>
                    <th className="text-left px-4 py-2 text-slate-600 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                      data-ocid={`inventory.row.${i + 1}`}
                    >
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          className="font-mono text-sm font-semibold text-blue-600 hover:underline"
                          onClick={() =>
                            navigate("part-detail", undefined, p.id)
                          }
                          data-ocid={`inventory.link.${i + 1}`}
                        >
                          {p.partCode}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        {locationStr(p)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status]}`}
                        >
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Summary grouped view
  type GroupKey = string;
  const groups: Record<
    GroupKey,
    {
      companyId: string;
      categoryId: string;
      partNameId: string;
      inStock: number;
      issued: number;
      total: number;
    }
  > = {};
  for (const p of partItems) {
    const key = `${p.companyId}|||${p.categoryId}|||${p.partNameId}`;
    if (!groups[key])
      groups[key] = {
        companyId: p.companyId,
        categoryId: p.categoryId,
        partNameId: p.partNameId,
        inStock: 0,
        issued: 0,
        total: 0,
      };
    groups[key].total++;
    if (p.status === "in_stock") groups[key].inStock++;
    if (p.status === "issued") groups[key].issued++;
  }
  const rows = Object.values(groups);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">
            Stock grouped by company, category and part name
          </p>
        </div>
        <div className="flex gap-3">
          <span className="text-sm bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
            In Stock: {partItems.filter((p) => p.status === "in_stock").length}
          </span>
          <span className="text-sm bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
            Issued: {partItems.filter((p) => p.status === "issued").length}
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by part code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="inventory.search_input"
        />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div
              className="text-center py-10 text-slate-400"
              data-ocid="inventory.empty_state"
            >
              No inventory items yet. Add purchases to see stock here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">
                      Part Name
                    </th>
                    <th className="text-center px-4 py-3 text-slate-600 font-medium">
                      In Stock
                    </th>
                    <th className="text-center px-4 py-3 text-slate-600 font-medium">
                      Issued
                    </th>
                    <th className="text-center px-4 py-3 text-slate-600 font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={`${row.companyId}-${row.categoryId}-${row.partNameId}`}
                      className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => setDrill(row)}
                      onKeyDown={(e) => e.key === "Enter" && setDrill(row)}
                      tabIndex={0}
                      data-ocid={`inventory.row.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-slate-800">
                        {
                          stockCompanies.find((c) => c.id === row.companyId)
                            ?.name
                        }
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {
                          stockCategories.find((c) => c.id === row.categoryId)
                            ?.name
                        }
                      </td>
                      <td className="px-4 py-3 font-medium text-blue-700 hover:underline">
                        {
                          stockPartNames.find((p) => p.id === row.partNameId)
                            ?.name
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-green-100 text-green-700 text-xs font-semibold w-8 h-6 rounded">
                          {row.inStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 text-xs font-semibold w-8 h-6 rounded">
                          {row.issued}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700 font-medium">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
