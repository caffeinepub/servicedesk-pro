import { ClipboardList, FolderPlus, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";
import type { ComplaintType } from "../types";

export default function NewCasePage() {
  const { addCase, navigate, settings, cases } = useStore();
  const [form, setForm] = useState({
    caseId: "",
    customerName: "",
    phone: "",
    altPhone: "",
    address: "",
    product: "",
    productType: "",
    complaintType: "installation" as ComplaintType,
    remarks: "",
  });

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase = addCase({
      ...form,
      status: "new",
      technicianId: "",
      technicianFeedback: "",
      partCode: "",
      partName: "",
      partPhotoUrl: "",
      poNumber: "",
      orderDate: "",
      receivedDate: "",
      nextActionDate: "",
      additionalNotes: "",
    });
    navigate("case-detail", newCase.id);
  };

  const todayCases = cases.filter((c) => {
    const today = new Date().toDateString();
    return new Date(c.createdAt).toDateString() === today;
  }).length;
  const openCases = cases.filter(
    (c) =>
      ![
        "closed",
        "cancelled",
        "transferred",
        "adjustment_closed",
        "replacement_done",
        "gas_charge_done",
      ].includes(c.status),
  ).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0 space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl px-6 py-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FolderPlus className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">New Complaint</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              Add a new service case from the company portal
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <ClipboardList className="h-3.5 w-3.5 text-blue-200" />
                <span className="text-xs font-semibold">
                  Today: {todayCases}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-200" />
                <span className="text-xs font-semibold">Open: {openCases}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-blue-200" />
                <span className="text-xs font-semibold">
                  Total: {cases.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Case Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Case ID (from portal) *</Label>
                <Input
                  placeholder="e.g. MD-2024-123"
                  value={form.caseId}
                  onChange={(e) => setField("caseId", e.target.value)}
                  required
                  data-ocid="new_case.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Complaint Type *</Label>
                <Select
                  value={form.complaintType}
                  onValueChange={(v: ComplaintType) =>
                    setField("complaintType", v)
                  }
                >
                  <SelectTrigger data-ocid="new_case.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="installation">
                      Installation (Customer)
                    </SelectItem>
                    <SelectItem value="breakdown">
                      Breakdown (Customer)
                    </SelectItem>
                    <SelectItem value="stock_repair">
                      Stock Machine Repair (Dealer)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Customer Name *</Label>
                <Input
                  placeholder="Full name"
                  value={form.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                  required
                  data-ocid="new_case.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input
                  placeholder="Primary mobile"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  required
                  data-ocid="new_case.input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Alternate Phone</Label>
                <Input
                  placeholder="Alternate mobile"
                  value={form.altPhone}
                  onChange={(e) => setField("altPhone", e.target.value)}
                  data-ocid="new_case.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Product *</Label>
                <Select
                  value={form.product}
                  onValueChange={(v) => setField("product", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.products.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Product Type / Model</Label>
                <Input
                  placeholder="e.g. 1.5 Ton Split"
                  value={form.productType}
                  onChange={(e) => setField("productType", e.target.value)}
                  data-ocid="new_case.input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Address</Label>
              <Input
                placeholder="Full address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                data-ocid="new_case.input"
              />
            </div>

            <div className="space-y-1">
              <Label>Remarks</Label>
              <Textarea
                placeholder="Initial complaint notes..."
                value={form.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
                rows={3}
                data-ocid="new_case.textarea"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                data-ocid="new_case.submit_button"
              >
                Create Case
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("cases")}
                data-ocid="new_case.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
