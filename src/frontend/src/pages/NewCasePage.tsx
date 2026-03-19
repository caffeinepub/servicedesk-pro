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
  const { addCase, navigate, settings } = useStore();
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">New Complaint</h2>
        <p className="text-sm text-gray-500">
          Add a new service case from the company portal
        </p>
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
