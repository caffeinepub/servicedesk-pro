import { AlertTriangle } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { getAgeing, useStore } from "../store";

export default function DashboardPage() {
  const { cases, technicians, navigate } = useStore();

  const today = new Date().toISOString().split("T")[0];
  const active = cases.filter(
    (c) =>
      ![
        "closed",
        "cancelled",
        "transferred",
        "adjustment_closed",
        "replacement_done",
      ].includes(c.status),
  );

  const staleCases = cases.filter(
    (c) =>
      c.status === "on_route" &&
      c.technicianId &&
      !c.hasFirstUpdate &&
      c.onRouteDate &&
      c.onRouteDate < today,
  );

  const stats = {
    total: cases.length,
    todayPending: cases.filter(
      (c) =>
        c.status === "pending" ||
        (c.nextActionDate && c.nextActionDate.split("T")[0] === today),
    ).length,
    partPending: cases.filter((c) => c.status === "part_required").length,
    gasPending: cases.filter((c) => c.status === "gas_charge_pending").length,
    closedToday: cases.filter(
      (c) => c.closedAt && c.closedAt.split("T")[0] === today,
    ).length,
    noUpdate: staleCases.length,
  };

  const ageing = {
    a0to3: active.filter((c) => getAgeing(c.createdAt) <= 3).length,
    a4to7: active.filter(
      (c) => getAgeing(c.createdAt) >= 4 && getAgeing(c.createdAt) <= 7,
    ).length,
    a8to14: active.filter(
      (c) => getAgeing(c.createdAt) >= 8 && getAgeing(c.createdAt) <= 14,
    ).length,
    a15plus: active.filter((c) => getAgeing(c.createdAt) >= 15).length,
  };

  const recentCases = [...cases]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 8);

  const techPerf = technicians
    .map((t) => ({
      ...t,
      assigned: cases.filter((c) => c.technicianId === t.id).length,
      completed: cases.filter(
        (c) =>
          c.technicianId === t.id &&
          ["closed", "adjustment_closed", "replacement_done"].includes(
            c.status,
          ),
      ).length,
    }))
    .filter((t) => t.assigned > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Performance Overview &mdash;{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Total Cases",
            value: stats.total,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Today Pending",
            value: stats.todayPending,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
          {
            label: "Part Pending",
            value: stats.partPending,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Gas Pending",
            value: stats.gasPending,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Closed Today",
            value: stats.closedToday,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "No Update",
            value: stats.noUpdate,
            color: "text-amber-700",
            bg: "bg-amber-50",
            icon: stats.noUpdate > 0,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`${
              card.label === "No Update" && stats.noUpdate > 0
                ? "bg-amber-50 border-amber-200"
                : card.bg
            } rounded-xl p-3 sm:p-4 border border-white shadow-sm`}
          >
            <div className="flex items-center gap-1">
              {"icon" in card && card.icon && (
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              )}
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Stale Cases Warning */}
      {staleCases.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex items-center gap-2 text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold text-sm">
                Cases With No Technician Update
              </span>
            </div>
            <p className="text-xs text-amber-600 sm:ml-auto">
              These cases will auto-reset at midnight tonight. Act now or
              they'll return to Pending.
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {staleCases.slice(0, 5).map((c) => {
              const tech = technicians.find((t) => t.id === c.technicianId);
              const daysSinceRoute = c.onRouteDate
                ? Math.floor(
                    (Date.now() - new Date(c.onRouteDate).getTime()) / 86400000,
                  )
                : 0;
              return (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-blue-700 text-sm">
                      {c.caseId}
                    </span>
                    <span className="text-sm text-gray-700">
                      {c.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Tech: {tech?.name ?? "—"}</span>
                    <span className="text-amber-600 font-medium">
                      {daysSinceRoute}d on route
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("case-detail", c.id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {staleCases.length > 5 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              +{staleCases.length - 5} more stale cases
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate("cases")}
            className="mt-3 w-full text-center text-sm font-medium text-amber-700 hover:text-amber-900 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            View All No-Update Cases →
          </button>
        </div>
      )}

      {/* Ageing Buckets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Case Ageing (Active Cases)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "0–3 Days",
              value: ageing.a0to3,
              bg: "bg-green-500",
              text: "text-white",
            },
            {
              label: "4–7 Days",
              value: ageing.a4to7,
              bg: "bg-yellow-400",
              text: "text-yellow-900",
            },
            {
              label: "8–14 Days",
              value: ageing.a8to14,
              bg: "bg-orange-500",
              text: "text-white",
            },
            {
              label: "15+ Days",
              value: ageing.a15plus,
              bg: "bg-red-500",
              text: "text-white",
            },
          ].map((b) => (
            <div
              key={b.label}
              className={`${b.bg} rounded-xl p-4 sm:p-5 shadow-sm`}
            >
              <p className={`text-sm font-medium ${b.text} opacity-80`}>
                {b.label}
              </p>
              <p className={`text-3xl sm:text-4xl font-bold ${b.text} mt-1`}>
                {b.value}
              </p>
              <p className={`text-xs ${b.text} opacity-70 mt-1`}>
                active cases
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Recent Cases</h3>
            <button
              type="button"
              onClick={() => navigate("cases")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                    Case ID
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 hidden md:table-cell">
                    Product
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => {
                  const age = getAgeing(c.createdAt);
                  const isStale =
                    c.status === "on_route" &&
                    c.technicianId &&
                    !c.hasFirstUpdate &&
                    c.onRouteDate &&
                    c.onRouteDate < today;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate("case-detail", c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate("case-detail", c.id);
                      }}
                      tabIndex={0}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${
                        isStale
                          ? "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-400"
                          : age >= 8 &&
                              !["closed", "cancelled", "transferred"].includes(
                                c.status,
                              )
                            ? "bg-red-50 hover:bg-red-100"
                            : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-blue-700">
                        <div className="flex items-center gap-1">
                          {isStale && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          {c.caseId}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-700 hidden sm:table-cell">
                        {c.customerName}
                      </td>
                      <td className="px-3 py-3 text-gray-600 hidden md:table-cell">
                        {c.product}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td
                        className={`px-3 py-3 font-medium ${
                          age >= 8
                            ? "text-red-600"
                            : age >= 4
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {age}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technician Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Technician Performance
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {techPerf.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data</p>
            )}
            {techPerf.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    {t.completed}/{t.assigned}
                  </p>
                  <p className="text-xs text-gray-500">done/total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
