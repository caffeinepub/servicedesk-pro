import { Package, Plus, Search, X } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";

const STATUS_STYLES: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700",
  issued: "bg-amber-100 text-amber-700",
  installed: "bg-blue-100 text-blue-700",
  returned_to_company: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  issued: "Issued",
  installed: "Installed",
  returned_to_company: "Returned to Co.",
  in_stock: "In Stock",
};

export default function IssuedPartsPage() {
  const {
    partItems,
    stockCompanies,
    stockPartNames,
    technicians,
    racks,
    shelves,
    bins,
    navigate,
    markPartInstalled,
    returnPartToStore,
    // returnPartToCompany,
    issuePartToTechnician,
    // currentUser,
  } = useStore();

  // Action dialogs for existing issued parts
  const [actionDialog, setActionDialog] = useState(false);
  const [actionPartId, setActionPartId] = useState("");
  const [actionType, setActionType] = useState<"install" | "return" | "">("");
  const [actionRemarks, setActionRemarks] = useState("");

  // Issue Part modal
  const [issueModal, setIssueModal] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [issueTechId, setIssueTechId] = useState("");
  const [issueCaseId, setIssueCaseId] = useState("");
  const [issueNotes, setIssueNotes] = useState("");
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({});

  const openAction = (id: string, type: "install" | "return") => {
    setActionPartId(id);
    setActionType(type);
    setActionRemarks("");
    setActionDialog(true);
  };

  const confirmAction = () => {
    if (actionType === "install") markPartInstalled(actionPartId);
    else if (actionType === "return")
      returnPartToStore(actionPartId, actionRemarks);
    setActionDialog(false);
  };

  const openIssueModal = () => {
    setPartSearch("");
    setSelectedPartId("");
    setIssueTechId("");
    setIssueCaseId("");
    setIssueNotes("");
    setIssueErrors({});
    setIssueModal(true);
  };

  const handleIssue = () => {
    const errs: Record<string, string> = {};
    if (!selectedPartId) errs.part = "Select a part";
    if (!issueTechId) errs.tech = "Select a technician";
    if (Object.keys(errs).length > 0) {
      setIssueErrors(errs);
      return;
    }
    issuePartToTechnician(selectedPartId, issueTechId, issueCaseId);
    setIssueModal(false);
  };

  const issuedItems = partItems.filter((p) => p.status === "issued");
  const installedItems = partItems.filter((p) => p.status === "installed");
  const returnedItems = partItems.filter(
    (p) => p.status === "returned_to_company",
  );
  const allTracked = partItems.filter(
    (p) =>
      p.status === "issued" ||
      p.status === "installed" ||
      p.status === "returned_to_company",
  );

  const inStockParts = partItems.filter((p) => p.status === "in_stock");
  const searchedInStock = inStockParts.filter(
    (p) =>
      !partSearch ||
      p.partCode.toLowerCase().includes(partSearch.toLowerCase()),
  );

  const selectedPart = partItems.find((p) => p.id === selectedPartId);

  const getTechName = (id: string) =>
    technicians.find((t) => t.id === id)?.name ?? id;
  const getCompany = (id: string) =>
    stockCompanies.find((c) => c.id === id)?.name ?? "";
  const getPartName = (id: string) =>
    stockPartNames.find((p) => p.id === id)?.name ?? "";
  const getLocation = (p: (typeof partItems)[number]) => {
    const rack = racks.find((r) => r.id === p.rackId);
    const shelf = shelves.find((s) => s.id === p.shelfId);
    const bin = bins.find((b) => b.id === p.binId);
    if (!rack) return null;
    return [rack.name, shelf?.name, bin?.name].filter(Boolean).join(" / ");
  };

  const PartTable = ({
    items,
    showActions,
  }: {
    items: typeof partItems;
    showActions: boolean;
  }) => (
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
              Technician
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Case ID
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Issued By
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Date
            </th>
            <th className="text-left px-4 py-2 text-slate-600 font-medium">
              Status
            </th>
            {showActions && (
              <th className="text-left px-4 py-2 text-slate-600 font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => (
            <tr
              key={p.id}
              className="border-b border-slate-100 hover:bg-slate-50"
              data-ocid={`issued.row.${i + 1}`}
            >
              <td className="px-4 py-2">
                <button
                  type="button"
                  className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                  onClick={() => navigate("part-detail", undefined, p.id)}
                  data-ocid={`issued.link.${i + 1}`}
                >
                  {p.partCode}
                </button>
              </td>
              <td className="px-4 py-2 text-slate-700">
                {getCompany(p.companyId)}
              </td>
              <td className="px-4 py-2 text-slate-700">
                {getPartName(p.partNameId)}
              </td>
              <td className="px-4 py-2 text-slate-700">
                {p.technicianId ? getTechName(p.technicianId) : "-"}
              </td>
              <td className="px-4 py-2 text-slate-600 font-mono text-xs">
                {p.caseId || "-"}
              </td>
              <td className="px-4 py-2 text-slate-600">{p.issuedBy || "-"}</td>
              <td className="px-4 py-2 text-slate-500 text-xs">
                {p.issueDate ? new Date(p.issueDate).toLocaleDateString() : "-"}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    STATUS_STYLES[p.status]
                  }`}
                >
                  {STATUS_LABELS[p.status]}
                </span>
              </td>
              {showActions && (
                <td className="px-4 py-2">
                  <div className="flex gap-1 flex-wrap items-center">
                    {p.status === "issued" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                          onClick={() => openAction(p.id, "install")}
                          data-ocid={`issued.primary_button.${i + 1}`}
                        >
                          Installed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => openAction(p.id, "return")}
                          data-ocid={`issued.secondary_button.${i + 1}`}
                        >
                          Return to Store
                        </Button>
                      </>
                    )}
                    {p.status === "installed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => navigate("return-to-company")}
                        data-ocid={`issued.secondary_button.${i + 1}`}
                      >
                        Return to Co.
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Issued Parts</h1>
          <p className="text-sm text-slate-500">
            Track parts issued to technicians
          </p>
        </div>
        <Button
          onClick={openIssueModal}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="issued.open_modal_button"
        >
          <Plus className="h-4 w-4 mr-1" /> Issue Part
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full rounded-none border-b border-slate-200 bg-slate-50 justify-start px-4 gap-2 h-12">
              <TabsTrigger value="active" data-ocid="issued.tab">
                Active
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {issuedItems.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="installed" data-ocid="issued.tab">
                Installed
                <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {installedItems.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="returned" data-ocid="issued.tab">
                Returned to Co.
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {returnedItems.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="all" data-ocid="issued.tab">
                All ({allTracked.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="p-0">
              {issuedItems.length === 0 ? (
                <div
                  className="text-center py-10 text-slate-400"
                  data-ocid="issued.empty_state"
                >
                  No active issued parts.
                </div>
              ) : (
                <PartTable items={issuedItems} showActions={true} />
              )}
            </TabsContent>

            <TabsContent value="installed" className="p-0">
              {installedItems.length === 0 ? (
                <div
                  className="text-center py-10 text-slate-400"
                  data-ocid="issued.empty_state"
                >
                  No installed parts.
                </div>
              ) : (
                <PartTable items={installedItems} showActions={true} />
              )}
            </TabsContent>

            <TabsContent value="returned" className="p-0">
              {returnedItems.length === 0 ? (
                <div
                  className="text-center py-10 text-slate-400"
                  data-ocid="issued.empty_state"
                >
                  No parts returned to company.
                </div>
              ) : (
                <PartTable items={returnedItems} showActions={false} />
              )}
            </TabsContent>

            <TabsContent value="all" className="p-0">
              {allTracked.length === 0 ? (
                <div
                  className="text-center py-10 text-slate-400"
                  data-ocid="issued.empty_state"
                >
                  No parts tracked yet.
                </div>
              ) : (
                <PartTable items={allTracked} showActions={true} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent data-ocid="issued.dialog">
          <DialogHeader>
            <DialogTitle>
              {actionType === "install"
                ? "Mark as Installed"
                : "Return to Store"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Remarks</Label>
            <Textarea
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              placeholder="Optional remarks..."
              rows={2}
              data-ocid="issued.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog(false)}
              data-ocid="issued.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className={`${
                actionType === "install"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
              onClick={confirmAction}
              data-ocid="issued.confirm_button"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Part Modal */}
      <Dialog open={issueModal} onOpenChange={setIssueModal}>
        <DialogContent className="max-w-lg" data-ocid="issued.modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> Issue Part to
              Technician
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Part Search */}
            {!selectedPartId ? (
              <div>
                <Label>Search Part Code (In Stock Only) *</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="Enter part code..."
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    data-ocid="issued.search_input"
                  />
                </div>
                {issueErrors.part && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="issued.error_state"
                  >
                    {issueErrors.part}
                  </p>
                )}
                {partSearch && (
                  <div className="mt-1 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                    {searchedInStock.length === 0 ? (
                      <p className="text-sm text-slate-400 p-3">
                        No in-stock parts found
                      </p>
                    ) : (
                      searchedInStock.map((p) => {
                        const loc = getLocation(p);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-slate-100 last:border-0"
                            onClick={() => {
                              setSelectedPartId(p.id);
                              setPartSearch("");
                            }}
                          >
                            <span className="font-mono font-semibold text-blue-600">
                              {p.partCode}
                            </span>
                            <span className="text-slate-500 ml-2">
                              {getCompany(p.companyId)} •{" "}
                              {getPartName(p.partNameId)}
                            </span>
                            {!loc && (
                              <span className="ml-2 text-xs text-amber-500">
                                ⚠ No location
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-mono text-sm font-semibold text-blue-700">
                      {selectedPart?.partCode}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getCompany(selectedPart?.companyId ?? "")} •{" "}
                      {getPartName(selectedPart?.partNameId ?? "")} •{" "}
                      <span className="text-green-600 font-medium">
                        In Stock
                      </span>
                    </p>
                    {getLocation(selectedPart!) ? (
                      <p className="text-xs text-slate-400">
                        {getLocation(selectedPart!)}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-500">
                        ⚠ No location assigned
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => setSelectedPartId("")}
                >
                  <X className="h-3 w-3" /> Change
                </button>
              </div>
            )}

            {/* Technician */}
            <div>
              <Label>Technician *</Label>
              <Select value={issueTechId} onValueChange={setIssueTechId}>
                <SelectTrigger data-ocid="issued.select">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians
                    .filter((t) => t.isActive)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.technicianCode ? ` (${t.technicianCode})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {issueErrors.tech && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="issued.error_state"
                >
                  {issueErrors.tech}
                </p>
              )}
            </div>

            {/* Case ID */}
            <div>
              <Label>Case ID (optional)</Label>
              <Input
                value={issueCaseId}
                onChange={(e) => setIssueCaseId(e.target.value)}
                placeholder="e.g. MD-2024-001"
                data-ocid="issued.input"
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                data-ocid="issued.textarea"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIssueModal(false)}
              data-ocid="issued.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleIssue}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="issued.confirm_button"
            >
              Issue Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
