import {
  ArrowLeftRight,
  Building2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Folder,
  FolderOpen,
  Layers,
  MapPin,
  Package,
  PackageOpen,
  Search,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useStore } from "../store";
import type { PartInventoryItem } from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700 border-green-200",
  issued: "bg-amber-100 text-amber-700 border-amber-200",
  installed: "bg-blue-100 text-blue-700 border-blue-200",
  returned_to_company: "bg-red-100 text-red-700 border-red-200",
  returned_to_store: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  issued: "Issued",
  installed: "Installed",
  returned_to_company: "Returned to Co.",
  returned_to_store: "Returned to Store",
};

function useLocationHelpers() {
  const { racks, shelves, bins } = useStore();
  const getRack = (id: string) => racks.find((r) => r.id === id)?.name ?? "";
  const getShelf = (id: string) => shelves.find((s) => s.id === id)?.name ?? "";
  const getBin = (id: string) => bins.find((b) => b.id === id)?.name ?? "";
  const locationStr = (p: PartInventoryItem) => {
    if (!p.rackId) return "Location Pending";
    return [getRack(p.rackId), getShelf(p.shelfId), getBin(p.binId)]
      .filter(Boolean)
      .join(" > ");
  };
  return { getRack, getShelf, getBin, locationStr };
}

// ── Part Code Modal (Tab 1) ─────────────────────────────────────────────────

interface PartCodeModalProps {
  companyId: string;
  categoryId: string;
  partNameId: string;
  onClose: () => void;
}

function PartCodeModal({
  companyId,
  categoryId,
  partNameId,
  onClose,
}: PartCodeModalProps) {
  const {
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    navigate,
  } = useStore();
  const { locationStr } = useLocationHelpers();

  const company = stockCompanies.find((c) => c.id === companyId)?.name ?? "";
  const category = stockCategories.find((c) => c.id === categoryId)?.name ?? "";
  const partName = stockPartNames.find((p) => p.id === partNameId)?.name ?? "";

  const items = partItems.filter(
    (p) =>
      p.companyId === companyId &&
      p.categoryId === categoryId &&
      p.partNameId === partNameId &&
      p.status === "in_stock",
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      data-ocid="inventory.modal"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900 text-base">
              {partName}{" "}
              <span className="text-slate-400 font-normal">— Part Codes</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            data-ocid="inventory.close_button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-5 py-2 text-xs text-slate-500 border-b border-slate-100 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          <span>{company}</span>
          <span className="text-slate-300">›</span>
          <Layers className="h-3 w-3" />
          <span>{category}</span>
          <span className="text-slate-300">›</span>
          <Package className="h-3 w-3" />
          <span>{partName}</span>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div
              className="text-center py-10 text-slate-400 text-sm"
              data-ocid="inventory.empty_state"
            >
              No in-stock items found.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  data-ocid={`inventory.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <button
                      type="button"
                      className="font-mono text-sm font-semibold text-blue-600 hover:underline"
                      onClick={() =>
                        navigate("part-detail", undefined, item.id)
                      }
                      data-ocid={`inventory.link.${i + 1}`}
                    >
                      {item.partCode}
                    </button>
                    <span className="text-xs text-slate-400">
                      {locationStr(item)}
                    </span>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                    Qty: 1
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Spare Parts ──────────────────────────────────────────────────────

type ModalTarget = {
  companyId: string;
  categoryId: string;
  partNameId: string;
};

function SparePartsTab() {
  const { partItems, stockCompanies, stockCategories, stockPartNames } =
    useStore();

  const [search, setSearch] = useState("");
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [modal, setModal] = useState<ModalTarget | null>(null);

  const inStockItems = useMemo(
    () => partItems.filter((p) => p.status === "in_stock"),
    [partItems],
  );

  const q = search.trim().toLowerCase();

  type PartNameGroup = { partNameId: string; count: number };
  type CategoryGroup = {
    categoryId: string;
    partNames: PartNameGroup[];
    count: number;
  };
  type CompanyGroup = {
    companyId: string;
    categories: CategoryGroup[];
    count: number;
  };

  const tree = useMemo((): CompanyGroup[] => {
    const companyMap = new Map<string, Map<string, Map<string, number>>>();
    for (const item of inStockItems) {
      if (!companyMap.has(item.companyId))
        companyMap.set(item.companyId, new Map());
      const catMap = companyMap.get(item.companyId)!;
      if (!catMap.has(item.categoryId)) catMap.set(item.categoryId, new Map());
      const pnMap = catMap.get(item.categoryId)!;
      pnMap.set(item.partNameId, (pnMap.get(item.partNameId) ?? 0) + 1);
    }

    const result: CompanyGroup[] = [];
    for (const [companyId, catMap] of companyMap) {
      const companyName =
        stockCompanies.find((c) => c.id === companyId)?.name ?? "";
      const categories: CategoryGroup[] = [];
      for (const [categoryId, pnMap] of catMap) {
        const catName =
          stockCategories.find((c) => c.id === categoryId)?.name ?? "";
        const partNames: PartNameGroup[] = [];
        for (const [partNameId, count] of pnMap) {
          const pnName =
            stockPartNames.find((p) => p.id === partNameId)?.name ?? "";
          if (
            !q ||
            pnName.toLowerCase().includes(q) ||
            catName.toLowerCase().includes(q) ||
            companyName.toLowerCase().includes(q) ||
            inStockItems.some(
              (it) =>
                it.partNameId === partNameId &&
                it.categoryId === categoryId &&
                it.companyId === companyId &&
                it.partCode.toLowerCase().includes(q),
            )
          ) {
            partNames.push({ partNameId, count });
          }
        }
        if (partNames.length > 0) {
          categories.push({
            categoryId,
            partNames,
            count: partNames.reduce((s, p) => s + p.count, 0),
          });
        }
      }
      if (categories.length > 0) {
        result.push({
          companyId,
          categories,
          count: categories.reduce((s, c) => s + c.count, 0),
        });
      }
    }
    return result;
  }, [inStockItems, stockCompanies, stockCategories, stockPartNames, q]);

  const toggleCompany = (id: string) =>
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCategory = (id: string) =>
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by company, category, part name or part code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="inventory.search_input"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tree */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {tree.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400 text-sm"
              data-ocid="inventory.empty_state"
            >
              {q
                ? "No matching in-stock parts found."
                : "No in-stock parts available."}
            </div>
          ) : (
            <div>
              {tree.map((company) => {
                const companyName =
                  stockCompanies.find((c) => c.id === company.companyId)
                    ?.name ?? company.companyId;
                const isCompanyOpen =
                  expandedCompanies.has(company.companyId) || !!q;
                return (
                  <div
                    key={company.companyId}
                    className="border-b border-slate-100 last:border-0"
                  >
                    {/* Company row */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                      onClick={() => toggleCompany(company.companyId)}
                      data-ocid="inventory.toggle"
                    >
                      <div className="flex items-center gap-2.5">
                        {isCompanyOpen ? (
                          <FolderOpen className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Folder className="h-4 w-4 text-slate-400" />
                        )}
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <span className="font-semibold text-slate-800">
                          {companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                          {company.categories.length}{" "}
                          {company.categories.length === 1
                            ? "category"
                            : "categories"}
                        </span>
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-medium">
                          {company.count} in stock
                        </span>
                      </div>
                    </button>

                    {/* Categories */}
                    {isCompanyOpen && (
                      <div className="border-t border-slate-100">
                        {company.categories.map((cat) => {
                          const catName =
                            stockCategories.find((c) => c.id === cat.categoryId)
                              ?.name ?? cat.categoryId;
                          const isCatOpen =
                            expandedCategories.has(cat.categoryId) || !!q;
                          return (
                            <div key={cat.categoryId}>
                              {/* Category row */}
                              <button
                                type="button"
                                className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                onClick={() => toggleCategory(cat.categoryId)}
                                data-ocid="inventory.toggle"
                              >
                                <div className="flex items-center gap-2">
                                  {isCatOpen ? (
                                    <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                                  ) : (
                                    <Folder className="h-3.5 w-3.5 text-slate-400" />
                                  )}
                                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                                  <span className="text-sm font-medium text-slate-700">
                                    {catName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                                    {cat.partNames.length}{" "}
                                    {cat.partNames.length === 1
                                      ? "part"
                                      : "parts"}
                                  </span>
                                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                    {cat.count} in stock
                                  </span>
                                </div>
                              </button>

                              {/* Part Names */}
                              {isCatOpen && (
                                <div>
                                  {cat.partNames.map((pn) => {
                                    const pnName =
                                      stockPartNames.find(
                                        (p) => p.id === pn.partNameId,
                                      )?.name ?? pn.partNameId;
                                    return (
                                      <button
                                        key={pn.partNameId}
                                        type="button"
                                        className="w-full flex items-center justify-between pl-16 pr-4 py-2 hover:bg-blue-50 transition-colors text-left group"
                                        onClick={() =>
                                          setModal({
                                            companyId: company.companyId,
                                            categoryId: cat.categoryId,
                                            partNameId: pn.partNameId,
                                          })
                                        }
                                        data-ocid="inventory.button"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Package className="h-3.5 w-3.5 text-blue-400" />
                                          <span className="text-sm text-blue-600 group-hover:underline">
                                            {pnName}
                                          </span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                          {pn.count}
                                        </span>
                                      </button>
                                    );
                                  })}
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
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {modal && (
        <PartCodeModal
          companyId={modal.companyId}
          categoryId={modal.categoryId}
          partNameId={modal.partNameId}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ── Tab 2: Part Search ─────────────────────────────────────────────────────

function PartSearchTab() {
  const {
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    purchaseEntries,
    vendors,
    navigate,
  } = useStore();
  const { locationStr } = useLocationHelpers();

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const q = search.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return partItems
      .filter((p) => {
        const pnName =
          stockPartNames.find((pn) => pn.id === p.partNameId)?.name ?? "";
        return (
          p.partCode.toLowerCase().includes(q) ||
          pnName.toLowerCase().includes(q)
        );
      })
      .slice(0, 50);
  }, [partItems, stockPartNames, q]);

  const getInfo = (item: PartInventoryItem) => {
    const company =
      stockCompanies.find((c) => c.id === item.companyId)?.name ?? "";
    const category =
      stockCategories.find((c) => c.id === item.categoryId)?.name ?? "";
    const partName =
      stockPartNames.find((p) => p.id === item.partNameId)?.name ?? "";
    const purchase = purchaseEntries.find((p) => p.id === item.purchaseId);
    const vendorId = purchase?.vendorId;
    const vendor = vendorId
      ? vendors.find((v) => v.id === vendorId)?.name
      : (purchase?.vendorName ?? "—");
    return {
      company,
      category,
      partName,
      vendor: vendor ?? purchase?.vendorName ?? "—",
    };
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-9 pr-9"
          placeholder="Search by part code or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setExpandedId(null);
          }}
          data-ocid="inventory.search_input"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setExpandedId(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            data-ocid="inventory.button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!q ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
          Search by part code or name...
        </div>
      ) : results.length === 0 ? (
        <div
          className="text-center py-16 text-slate-400 text-sm"
          data-ocid="inventory.empty_state"
        >
          No parts found for &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {results.map((item, i) => {
                const info = getInfo(item);
                const isExpanded = expandedId === item.id;
                const date = new Date(item.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                );
                return (
                  <li key={item.id} data-ocid={`inventory.item.${i + 1}`}>
                    {/* Result row */}
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      data-ocid={`inventory.row.${i + 1}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono font-semibold text-slate-800 text-sm">
                            {item.partCode}
                          </span>
                          <span className="text-xs text-slate-400">{date}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 ml-5">
                          {info.company} &rsaquo; {info.category} &rsaquo;{" "}
                          {info.partName}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            STATUS_STYLES[item.status]
                          }`}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                        <span className="text-xs text-slate-500">Qty: 1</span>
                      </div>
                    </button>

                    {/* Expanded inline card */}
                    {isExpanded && (
                      <div className="mx-4 mb-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="font-mono font-bold text-slate-900">
                              {item.partCode}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {info.company} &rsaquo; {info.category} &rsaquo;{" "}
                              {info.partName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                STATUS_STYLES[item.status]
                              }`}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId(null);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              data-ocid="inventory.close_button"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
                          <div className="text-slate-500">Vendor</div>
                          <div className="text-slate-700 font-medium">
                            {info.vendor}
                          </div>
                          <div className="text-slate-500">Location</div>
                          <div className="text-slate-700">
                            {locationStr(item)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() =>
                            navigate("part-detail", undefined, item.id)
                          }
                          data-ocid="inventory.button"
                        >
                          View Full Details →
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Tab 3: Part Relocation ─────────────────────────────────────────────────

interface RelocateModalProps {
  item: PartInventoryItem;
  onClose: () => void;
}

function RelocateModal({ item, onClose }: RelocateModalProps) {
  const { racks, shelves, bins, assignPartLocation, stockPartNames } =
    useStore();
  const { locationStr } = useLocationHelpers();

  const [selectedRack, setSelectedRack] = useState(item.rackId ?? "");
  const [selectedShelf, setSelectedShelf] = useState(item.shelfId ?? "");
  const [selectedBin, setSelectedBin] = useState(item.binId ?? "");

  const filteredShelves = shelves.filter((s) => s.rackId === selectedRack);
  const filteredBins = bins.filter((b) => b.shelfId === selectedShelf);

  const partName =
    stockPartNames.find((p) => p.id === item.partNameId)?.name ?? "—";

  const handleSave = () => {
    assignPartLocation(item.id, selectedRack, selectedShelf, selectedBin);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      data-ocid="inventory.modal"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Assign / Relocate</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            data-ocid="inventory.close_button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Part identity header */}
          <div className="bg-slate-50 rounded-lg px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Part Name
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {partName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Part Code
              </span>
              <span className="font-mono text-sm font-bold text-blue-600">
                {item.partCode}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Current location:{" "}
            <span className="font-medium text-slate-700">
              {locationStr(item)}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="relocate-rack"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Rack
              </label>
              <select
                id="relocate-rack"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRack}
                onChange={(e) => {
                  setSelectedRack(e.target.value);
                  setSelectedShelf("");
                  setSelectedBin("");
                }}
                data-ocid="inventory.select"
              >
                <option value="">— Select Rack —</option>
                {racks.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="relocate-shelf"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Shelf
              </label>
              <select
                id="relocate-shelf"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={selectedShelf}
                onChange={(e) => {
                  setSelectedShelf(e.target.value);
                  setSelectedBin("");
                }}
                disabled={!selectedRack}
                data-ocid="inventory.select"
              >
                <option value="">— Select Shelf —</option>
                {filteredShelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="relocate-bin"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Bin
              </label>
              <select
                id="relocate-bin"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={selectedBin}
                onChange={(e) => setSelectedBin(e.target.value)}
                disabled={!selectedShelf}
                data-ocid="inventory.select"
              >
                <option value="">— Select Bin —</option>
                {filteredBins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={onClose}
            data-ocid="inventory.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedRack}
            data-ocid="inventory.confirm_button"
          >
            Confirm Relocation
          </Button>
        </div>
      </div>
    </div>
  );
}

function PartRelocationTab() {
  const {
    partItems,
    stockCompanies,
    stockCategories,
    stockPartNames,
    navigate,
  } = useStore();
  const { locationStr } = useLocationHelpers();

  const [search, setSearch] = useState("");
  const [relocateItem, setRelocateItem] = useState<PartInventoryItem | null>(
    null,
  );
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    new Set(),
  );

  const q = search.trim().toLowerCase();

  const inStockItems = useMemo(
    () =>
      partItems
        .filter((p) => p.status === "in_stock")
        .filter((p) => {
          if (!q) return true;
          const pnName =
            stockPartNames.find((pn) => pn.id === p.partNameId)?.name ?? "";
          return (
            p.partCode.toLowerCase().includes(q) ||
            pnName.toLowerCase().includes(q)
          );
        }),
    [partItems, stockPartNames, q],
  );

  // Group by company, then category
  type CatGroup = { categoryId: string; items: PartInventoryItem[] };
  type CompGroup = { companyId: string; categories: CatGroup[] };

  const grouped = useMemo((): CompGroup[] => {
    const compMap = new Map<string, Map<string, PartInventoryItem[]>>();
    for (const item of inStockItems) {
      if (!compMap.has(item.companyId)) compMap.set(item.companyId, new Map());
      const catMap = compMap.get(item.companyId)!;
      if (!catMap.has(item.categoryId)) catMap.set(item.categoryId, []);
      catMap.get(item.categoryId)!.push(item);
    }
    const result: CompGroup[] = [];
    for (const [companyId, catMap] of compMap) {
      const categories: CatGroup[] = [];
      for (const [categoryId, items] of catMap) {
        categories.push({ categoryId, items });
      }
      result.push({ companyId, categories });
    }
    return result;
  }, [inStockItems]);

  const toggleCompany = (id: string) =>
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  let rowIndex = 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-9 pr-9"
          placeholder="Search in-stock parts by code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="inventory.search_input"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {inStockItems.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400 text-sm"
              data-ocid="inventory.empty_state"
            >
              {q
                ? "No matching in-stock parts."
                : "No in-stock parts available."}
            </div>
          ) : (
            <div>
              {grouped.map((compGroup) => {
                const companyName =
                  stockCompanies.find((c) => c.id === compGroup.companyId)
                    ?.name ?? compGroup.companyId;
                const totalItems = compGroup.categories.reduce(
                  (s, c) => s + c.items.length,
                  0,
                );
                const isExpanded =
                  expandedCompanies.has(compGroup.companyId) || !!q;

                return (
                  <div
                    key={compGroup.companyId}
                    className="border-b border-slate-200 last:border-0"
                  >
                    {/* Company header - clickable toggle */}
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      onClick={() => toggleCompany(compGroup.companyId)}
                      data-ocid="inventory.toggle"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800 text-sm flex-1">
                        {companyName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {totalItems} items
                      </Badge>
                    </button>

                    {/* Expanded rows */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-100 bg-white">
                              <th className="text-left pl-10 pr-4 py-2 text-slate-500 font-medium text-xs">
                                Part Code
                              </th>
                              <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                                Part Name
                              </th>
                              <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                                Category
                              </th>
                              <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                                Current Location
                              </th>
                              <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {compGroup.categories.map((catGroup) => {
                              return catGroup.items.map((item) => {
                                rowIndex += 1;
                                const currentIndex = rowIndex;
                                const pnName =
                                  stockPartNames.find(
                                    (p) => p.id === item.partNameId,
                                  )?.name ?? "";
                                const catName =
                                  stockCategories.find(
                                    (c) => c.id === item.categoryId,
                                  )?.name ?? "";
                                return (
                                  <tr
                                    key={item.id}
                                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    data-ocid={`inventory.row.${currentIndex}`}
                                  >
                                    <td className="pl-10 pr-4 py-2.5">
                                      <button
                                        type="button"
                                        className="font-mono text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                        onClick={() =>
                                          navigate(
                                            "part-detail",
                                            undefined,
                                            item.id,
                                          )
                                        }
                                        data-ocid={`inventory.link.${currentIndex}`}
                                      >
                                        <Tag className="h-3 w-3" />
                                        {item.partCode}
                                      </button>
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-700 text-xs">
                                      {pnName}
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">
                                      {catName}
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">
                                      {locationStr(item)}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs"
                                        onClick={() => setRelocateItem(item)}
                                        data-ocid={`inventory.edit_button.${currentIndex}`}
                                      >
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Relocate
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              });
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {relocateItem && (
        <RelocateModal
          item={relocateItem}
          onClose={() => setRelocateItem(null)}
        />
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

type TabId = "spare-parts" | "part-search" | "part-relocation";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "spare-parts", label: "Spare Parts", icon: PackageOpen },
  { id: "part-search", label: "Part Search", icon: Search },
  { id: "part-relocation", label: "Part Relocation", icon: ArrowLeftRight },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("spare-parts");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <p className="text-emerald-200 text-sm">
              Manage and search spare parts stock
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1" aria-label="Inventory tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
              data-ocid="inventory.tab"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "spare-parts" && <SparePartsTab />}
      {activeTab === "part-search" && <PartSearchTab />}
      {activeTab === "part-relocation" && <PartRelocationTab />}
    </div>
  );
}
