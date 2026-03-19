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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        ].map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-xl p-4 border border-white shadow-sm`}
          >
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Ageing Buckets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Case Ageing (Active Cases)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div key={b.label} className={`${b.bg} rounded-xl p-5 shadow-sm`}>
              <p className={`text-sm font-medium ${b.text} opacity-80`}>
                {b.label}
              </p>
              <p className={`text-4xl font-bold ${b.text} mt-1`}>{b.value}</p>
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
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">
                    Case ID
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">
                    Customer
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500">
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
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate("case-detail", c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate("case-detail", c.id);
                      }}
                      className={`border-b last:border-0 cursor-pointer hover:bg-blue-50 transition-colors ${
                        age >= 8 &&
                        !["closed", "cancelled", "transferred"].includes(
                          c.status,
                        )
                          ? "bg-red-50"
                          : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-medium text-blue-700">
                        {c.caseId}
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {c.customerName}
                      </td>
                      <td className="px-3 py-3 text-gray-600">{c.product}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td
                        className={`px-3 py-3 font-medium ${age >= 8 ? "text-red-600" : age >= 4 ? "text-yellow-600" : "text-green-600"}`}
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
                    {t.assigned} cases
                  </p>
                  <p className="text-xs text-green-600">{t.completed} done</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
