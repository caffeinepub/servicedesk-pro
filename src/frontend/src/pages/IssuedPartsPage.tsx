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
  returned_to_company: "Returned to Company",
};

export default function IssuedPartsPage() {
  const {
    partItems,
    stockCompanies,
    stockPartNames,
    technicians,
    navigate,
    markPartInstalled,
    returnPartToStore,
    returnPartToCompany,
  } = useStore();

  const [returnDialog, setReturnDialog] = useState(false);
  const [returnPartId, setReturnPartId] = useState("");
  const [returnRemarks, setReturnRemarks] = useState("");

  const [rtcDialog, setRtcDialog] = useState(false);
  const [rtcPartId, setRtcPartId] = useState("");
  const [rtcReason, setRtcReason] = useState("");
  const [rtcRemarks, setRtcRemarks] = useState("");

  const openReturn = (id: string) => {
    setReturnPartId(id);
    setReturnRemarks("");
    setReturnDialog(true);
  };
  const openRtc = (id: string) => {
    setRtcPartId(id);
    setRtcReason("");
    setRtcRemarks("");
    setRtcDialog(true);
  };

  const issuedItems = partItems.filter(
    (p) => p.status === "issued" || p.status === "installed",
  );
  const returnedItems = partItems.filter(
    (p) => p.status === "returned_to_company",
  );

  const getTechName = (id: string) =>
    technicians.find((t) => t.id === id)?.name ?? id;
  const getCompany = (id: string) =>
    stockCompanies.find((c) => c.id === id)?.name ?? "";
  const getPartName = (id: string) =>
    stockPartNames.find((p) => p.id === id)?.name ?? "";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Issued Parts</h1>
        <p className="text-sm text-slate-500">
          Track parts issued to technicians and returned to company
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="issued" className="w-full">
            <TabsList className="w-full rounded-none border-b border-slate-200 bg-slate-50 justify-start px-4 gap-2 h-12">
              <TabsTrigger value="issued" data-ocid="issued.tab">
                Issued / Installed
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {issuedItems.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="returned" data-ocid="issued.tab">
                Return to Company
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {returnedItems.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issued" className="p-0">
              {issuedItems.length === 0 ? (
                <div
                  className="text-center py-10 text-slate-400"
                  data-ocid="issued.empty_state"
                >
                  No issued parts.
                </div>
              ) : (
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
                          Issue Date
                        </th>
                        <th className="text-left px-4 py-2 text-slate-600 font-medium">
                          Status
                        </th>
                        <th className="text-left px-4 py-2 text-slate-600 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedItems.map((p, i) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                          data-ocid={`issued.row.${i + 1}`}
                        >
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                              onClick={() =>
                                navigate("part-detail", undefined, p.id)
                              }
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
                            {getTechName(p.technicianId)}
                          </td>
                          <td className="px-4 py-2 text-slate-600 font-mono text-xs">
                            {p.caseId}
                          </td>
                          <td className="px-4 py-2 text-slate-500 text-xs">
                            {p.issueDate
                              ? new Date(p.issueDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status]}`}
                            >
                              {STATUS_LABELS[p.status]}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-1 flex-wrap items-center">
                              {p.status === "issued" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                                  onClick={() => markPartInstalled(p.id)}
                                  data-ocid={`issued.primary_button.${i + 1}`}
                                >
                                  Installed
                                </Button>
                              )}
                              {p.status === "issued" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => openReturn(p.id)}
                                  data-ocid={`issued.secondary_button.${i + 1}`}
                                >
                                  Return
                                </Button>
                              )}
                              {p.status === "installed" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-red-600 border-red-200"
                                  onClick={() => openRtc(p.id)}
                                  data-ocid={`issued.delete_button.${i + 1}`}
                                >
                                  Return to Co.
                                </Button>
                              ) : (
                                p.status === "issued" && (
                                  <span className="text-xs text-slate-400 italic">
                                    Return to store first
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                          Return Date
                        </th>
                        <th className="text-left px-4 py-2 text-slate-600 font-medium">
                          Reason
                        </th>
                        <th className="text-left px-4 py-2 text-slate-600 font-medium">
                          Returned By
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnedItems.map((p, i) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                          data-ocid={`issued.row.${i + 1}`}
                        >
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                              onClick={() =>
                                navigate("part-detail", undefined, p.id)
                              }
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
                          <td className="px-4 py-2 text-slate-500 text-xs">
                            {p.returnedToCompanyAt
                              ? new Date(
                                  p.returnedToCompanyAt,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-slate-700">
                            {p.returnToCompanyReason}
                          </td>
                          <td className="px-4 py-2 text-slate-500">
                            {p.returnedToCompanyBy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Return to Store Dialog */}
      <Dialog open={returnDialog} onOpenChange={setReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Remarks / Reason</Label>
            <Textarea
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="Why is this part being returned?"
              data-ocid="issued.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnDialog(false)}
              data-ocid="issued.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                returnPartToStore(returnPartId, returnRemarks);
                setReturnDialog(false);
              }}
              data-ocid="issued.confirm_button"
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return to Company Dialog */}
      <Dialog open={rtcDialog} onOpenChange={setRtcDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Reason *</Label>
            <Input
              value={rtcReason}
              onChange={(e) => setRtcReason(e.target.value)}
              placeholder="e.g. Defective, Damaged"
              data-ocid="issued.input"
            />
            <Label>Remarks</Label>
            <Textarea
              value={rtcRemarks}
              onChange={(e) => setRtcRemarks(e.target.value)}
              placeholder="Additional remarks"
              data-ocid="issued.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRtcDialog(false)}
              data-ocid="issued.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!rtcReason.trim()) return;
                returnPartToCompany(rtcPartId, rtcReason.trim(), rtcRemarks);
                setRtcDialog(false);
              }}
              data-ocid="issued.confirm_button"
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
