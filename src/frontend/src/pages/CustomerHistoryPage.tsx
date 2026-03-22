import { Clock, History, Phone, Search, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { Input } from "../components/ui/input";
import { getAgeing, useStore } from "../store";

export default function CustomerHistoryPage() {
  const { cases, navigate } = useStore();
  const [query, setQuery] = useState("");

  // Group all cases by primary phone, include alt-phone matches
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? cases.filter(
          (c) =>
            c.customerName.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.altPhone.includes(q),
        )
      : cases;

    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const byPhone = new Map<string, typeof cases>();
    for (const c of sorted) {
      // Use canonical phone (smallest of phone/altPhone for grouping)
      const key = c.phone;
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key)?.push(c);
    }
    return byPhone;
  }, [cases, query]);

  const totalCustomers = grouped.size;
  const totalCasesAll = cases.length;

  return (
    <div className="space-y-5">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-2xl px-6 py-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <History className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Customer History</h1>
            <p className="text-purple-200 text-sm mt-0.5">
              All customer complaints — search by name or phone
            </p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-purple-200" />
                <span className="text-xs font-semibold">
                  Total Customers: {totalCustomers}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-purple-200" />
                <span className="text-xs font-semibold">
                  Total Cases: {totalCasesAll}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or phone number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          data-ocid="customer_history.search_input"
        />
      </div>

      {grouped.size === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {query ? `No customers found for "${query}"` : "No cases yet"}
          </p>
        </div>
      )}

      {Array.from(grouped.entries()).map(([phone, customerCases], idx) => {
        const cust = customerCases[0];
        return (
          <div
            key={phone}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            data-ocid={`customer_history.item.${idx + 1}`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {cust.customerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {cust.phone}
                    {cust.altPhone && (
                      <span className="text-gray-400 ml-1">
                        / {cust.altPhone}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">
                  {customerCases.length} case
                  {customerCases.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-400">
                  {
                    customerCases.filter((c) =>
                      [
                        "closed",
                        "adjustment_closed",
                        "replacement_done",
                      ].includes(c.status),
                    ).length
                  }{" "}
                  closed
                </p>
              </div>
            </div>
            <div className="divide-y">
              {customerCases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate("case-detail", c.id)}
                  className="w-full text-left flex items-center gap-4 px-5 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm text-blue-700">
                        {c.caseId}
                      </span>
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-gray-500 capitalize">
                        {c.complaintType.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {c.product} {c.productType} &mdash;{" "}
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    {c.remarks && (
                      <p className="text-xs text-gray-400 truncate">
                        {c.remarks}
                      </p>
                    )}
                    {c.partName && (
                      <p className="text-xs text-orange-600">
                        Part: {c.partName} ({c.partCode})
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400 flex-shrink-0">
                    <p>{getAgeing(c.createdAt)}d ago</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
