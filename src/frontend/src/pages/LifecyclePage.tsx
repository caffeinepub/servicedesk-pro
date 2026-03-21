import { ChevronDown, ChevronRight, History } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useStore } from "../store";

const EVENT_COLORS: Record<string, string> = {
  Purchased: "bg-blue-500",
  "Location Assigned": "bg-gray-400",
  Issued: "bg-amber-500",
  Installed: "bg-green-500",
  "Returned to Store": "bg-purple-500",
  "Returned to Company": "bg-red-500",
  Defective: "bg-red-400",
  Relocated: "bg-gray-500",
};

const EVENT_TYPE_FILTERS = [
  "All Events",
  "Purchased",
  "Issued",
  "Installed",
  "Returned to Store",
  "Returned to Company",
];

const STATUS_STYLES: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700",
  issued: "bg-amber-100 text-amber-700",
  installed: "bg-blue-100 text-blue-700",
  returned_to_store: "bg-purple-100 text-purple-700",
  returned_to_company: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  issued: "Issued",
  installed: "Installed",
  returned_to_store: "Returned",
  returned_to_company: "Returned to Co.",
};

export default function LifecyclePage() {
  const { partItems, partLifecycle, stockCompanies, stockPartNames } =
    useStore();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (partId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) next.delete(partId);
      else next.add(partId);
      return next;
    });
  };

  // Group lifecycle entries by partId
  const partGroups = partItems
    .map((part) => {
      let logs = partLifecycle.filter((lc) => lc.partId === part.id);

      // Apply event type filter
      if (eventFilter !== "All Events") {
        logs = logs.filter((lc) => lc.action === eventFilter);
      }

      // Apply date filters
      if (dateFrom) {
        logs = logs.filter((lc) => lc.timestamp >= dateFrom);
      }
      if (dateTo) {
        logs = logs.filter((lc) => lc.timestamp <= `${dateTo}T23:59:59`);
      }

      return { part, logs };
    })
    .filter(({ part, logs }) => {
      // Search filter
      if (!search) return logs.length > 0;
      const partName =
        stockPartNames.find((n) => n.id === part.partNameId)?.name ?? "";
      return (
        (part.partCode.toLowerCase().includes(search.toLowerCase()) ||
          partName.toLowerCase().includes(search.toLowerCase())) &&
        logs.length > 0
      );
    });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Part Lifecycle</h1>
        <p className="text-sm text-slate-500">
          Track the complete history of every part
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by part code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          data-ocid="lifecycle.search_input"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
          />
          <span className="text-slate-400 text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
          />
        </div>
      </div>

      {/* Event Type Chips */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setEventFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              eventFilter === f
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            data-ocid="lifecycle.tab"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Part Groups */}
      {partGroups.length === 0 ? (
        <div
          className="text-center py-12 text-slate-400"
          data-ocid="lifecycle.empty_state"
        >
          <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No lifecycle data found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partGroups.map(({ part, logs }, gi) => {
            const isOpen = expanded.has(part.id);
            const company =
              stockCompanies.find((c) => c.id === part.companyId)?.name ?? "";
            const partName =
              stockPartNames.find((n) => n.id === part.partNameId)?.name ?? "";
            const sortedLogs = [...logs].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            );
            return (
              <Card
                key={part.id}
                className="shadow-sm"
                data-ocid={`lifecycle.item.${gi + 1}`}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 rounded-t-lg"
                  onClick={() => toggleExpand(part.id)}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-blue-600">
                        {part.partCode}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {company} • {partName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_STYLES[part.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABELS[part.status] ?? part.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {logs.length} event{logs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="ml-7 border-l-2 border-slate-200 pl-4 space-y-4">
                      {sortedLogs.map((log) => {
                        const dotColor =
                          EVENT_COLORS[log.action] ?? "bg-slate-400";
                        return (
                          <div key={log.id} className="relative">
                            <div
                              className={`absolute -left-[21px] w-3 h-3 rounded-full ${dotColor} border-2 border-white`}
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {log.action}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                              {log.details && (
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {log.details}
                                </p>
                              )}
                              <p className="text-xs text-slate-400">
                                By {log.userName}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
