import { AlertTriangle, Bell, CheckCheck, X } from "lucide-react";
import { useState } from "react";
import { getAgeing, useStore } from "../store";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const {
    cases,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    navigate,
  } = useStore();

  const today = new Date().toISOString().split("T")[0];

  // Auto-compute alerts from cases
  const overdueAlerts = cases.filter(
    (c) =>
      ![
        "closed",
        "cancelled",
        "transferred",
        "adjustment_closed",
        "replacement_done",
      ].includes(c.status) && getAgeing(c.createdAt) >= 8,
  );
  const followUpToday = cases.filter(
    (c) =>
      c.nextActionDate &&
      c.nextActionDate.split("T")[0] === today &&
      !["closed", "cancelled"].includes(c.status),
  );
  const partPending = cases.filter((c) => c.status === "part_required");

  const staleAlerts = cases.filter(
    (c) =>
      c.status === "on_route" &&
      c.technicianId &&
      !c.hasFirstUpdate &&
      c.onRouteDate &&
      c.onRouteDate < today,
  );

  const unreadCount =
    notifications.filter((n) => !n.isRead).length +
    overdueAlerts.length +
    followUpToday.length +
    staleAlerts.length;

  const handleCaseClick = (caseId: string) => {
    navigate("case-detail", caseId);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        data-ocid="notifications.button"
      >
        <Bell className="h-5 w-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            role="button"
            tabIndex={-1}
          />
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllNotificationsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ScrollArea className="max-h-96">
              {staleAlerts.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-amber-700 uppercase px-2 py-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    No Update ({staleAlerts.length}) — resets tonight
                  </p>
                  {staleAlerts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCaseClick(c.id)}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {c.caseId} – {c.customerName}
                      </p>
                      <p className="text-xs text-amber-600">
                        On Route with no update — resets tonight
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {overdueAlerts.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-red-600 uppercase px-2 py-1">
                    Overdue Cases ({overdueAlerts.length})
                  </p>
                  {overdueAlerts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCaseClick(c.id)}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {c.caseId} – {c.customerName}
                      </p>
                      <p className="text-xs text-red-600">
                        {getAgeing(c.createdAt)} days old
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {followUpToday.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-yellow-600 uppercase px-2 py-1">
                    Follow-up Today ({followUpToday.length})
                  </p>
                  {followUpToday.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCaseClick(c.id)}
                      className="w-full text-left px-3 py-2 hover:bg-yellow-50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {c.caseId} – {c.customerName}
                      </p>
                      <p className="text-xs text-yellow-600">
                        Follow-up scheduled today
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {partPending.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-orange-600 uppercase px-2 py-1">
                    Part Pending ({partPending.length})
                  </p>
                  {partPending.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCaseClick(c.id)}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {c.caseId} – {c.customerName}
                      </p>
                      <p className="text-xs text-orange-600">
                        Part: {c.partName || "Unknown"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {notifications.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                    Other
                  </p>
                  {notifications.slice(0, 10).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.caseId) handleCaseClick(n.caseId);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg ${!n.isRead ? "bg-blue-50" : ""}`}
                    >
                      <p className="text-sm text-gray-800">{n.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {overdueAlerts.length === 0 &&
                followUpToday.length === 0 &&
                partPending.length === 0 &&
                staleAlerts.length === 0 &&
                notifications.length === 0 && (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
