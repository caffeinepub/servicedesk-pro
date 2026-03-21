import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCheck,
  PackageCheck,
  PackageSearch,
  Plus,
  Trash2,
  TrendingDown,
  X,
} from "lucide-react";
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
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";
import type { StoreNotification } from "../types";

type FilterType =
  | "all"
  | "unread"
  | "low_stock"
  | "part_issued"
  | "part_returned"
  | "reminder"
  | "ai";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  part_issued: <PackageSearch className="h-4 w-4 text-amber-600" />,
  part_returned: <PackageCheck className="h-4 w-4 text-green-600" />,
  low_stock: <TrendingDown className="h-4 w-4 text-red-600" />,
  reminder: <Bell className="h-4 w-4 text-blue-600" />,
  ai: <Bot className="h-4 w-4 text-purple-600" />,
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const {
    storeNotifications,
    addStoreNotification,
    markStoreNotificationRead,
    markAllStoreNotificationsRead,
    deleteStoreNotification,
    partItems,
  } = useStore();

  const [filter, setFilter] = useState<FilterType>("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    note: "",
    reminderAt: "",
    relatedPartCode: "",
    priority: "medium" as StoreNotification["priority"],
  });

  const unreadCount = storeNotifications.filter((n) => !n.isRead).length;
  const highCriticalCount = storeNotifications.filter(
    (n) => n.priority === "high" || n.priority === "critical",
  ).length;
  const reminderCount = storeNotifications.filter(
    (n) => n.type === "reminder",
  ).length;

  const filtered = storeNotifications.filter((n) => {
    if (filter === "unread" && n.isRead) return false;
    if (filter !== "all" && filter !== "unread" && n.type !== filter)
      return false;
    if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
    return true;
  });

  const checkLowStock = () => {
    const lowStockParts = partItems.filter(
      (p) =>
        p.status === "in_stock" &&
        partItems.filter(
          (x) => x.partNameId === p.partNameId && x.status === "in_stock",
        ).length <= 2,
    );
    const unique = new Set<string>();
    for (const p of lowStockParts) {
      if (!unique.has(p.partNameId)) {
        unique.add(p.partNameId);
        addStoreNotification({
          title: "Low Stock Alert",
          message: `${p.partCode} stock is running low`,
          type: "low_stock",
          priority: "high",
          isRead: false,
          relatedPartCode: p.partCode,
        });
      }
    }
  };

  const saveReminder = () => {
    if (!reminderForm.title.trim()) return;
    addStoreNotification({
      title: reminderForm.title,
      message: reminderForm.note,
      type: "reminder",
      priority: reminderForm.priority,
      isRead: false,
      relatedPartCode: reminderForm.relatedPartCode,
      reminderAt: reminderForm.reminderAt,
    });
    setShowReminderModal(false);
    setReminderForm({
      title: "",
      note: "",
      reminderAt: "",
      relatedPartCode: "",
      priority: "medium",
    });
  };

  const FILTER_TABS: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "low_stock", label: "Low Stock" },
    { id: "part_issued", label: "Issued" },
    { id: "part_returned", label: "Returned" },
    { id: "reminder", label: "Reminders" },
    { id: "ai", label: "AI" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">
            {unreadCount} unread • {storeNotifications.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkLowStock}
            data-ocid="notifications.secondary_button"
          >
            <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" /> Check Low
            Stock
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowReminderModal(true)}
            data-ocid="notifications.open_modal_button"
          >
            <Plus className="h-4 w-4 mr-1" /> New Reminder
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: storeNotifications.length,
            color: "text-slate-700",
          },
          { label: "Unread", value: unreadCount, color: "text-blue-600" },
          {
            label: "High/Critical",
            value: highCriticalCount,
            color: "text-red-600",
          },
          {
            label: "Reminders",
            value: reminderCount,
            color: "text-purple-600",
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            data-ocid="notifications.tab"
          >
            {tab.label}
          </button>
        ))}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white"
          data-ocid="notifications.select"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllStoreNotificationsRead}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800"
            data-ocid="notifications.primary_button"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-12 text-slate-400"
          data-ocid="notifications.empty_state"
        >
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => (
            <button
              type="button"
              key={n.id}
              className={`w-full text-left flex gap-3 p-3 rounded-lg border transition-colors ${
                n.isRead
                  ? "bg-white border-slate-200"
                  : "bg-blue-50 border-blue-200"
              }`}
              onClick={() => markStoreNotificationRead(n.id)}
              data-ocid={`notifications.item.${i + 1}`}
            >
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                {TYPE_ICONS[n.type] ?? (
                  <Bell className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm font-medium ${
                        n.isRead ? "text-slate-700" : "text-slate-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        PRIORITY_STYLES[n.priority]
                      }`}
                    >
                      {n.priority}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {n.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-red-500 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStoreNotification(n.id);
                    }}
                    data-ocid={`notifications.delete_button.${i + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                {n.relatedPartCode && (
                  <p className="text-xs text-blue-600 mt-0.5 font-mono">
                    Part: {n.relatedPartCode}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Reminder Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent data-ocid="notifications.modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" /> New Reminder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input
                value={reminderForm.title}
                onChange={(e) =>
                  setReminderForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Reminder title"
                data-ocid="notifications.input"
              />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={reminderForm.note}
                onChange={(e) =>
                  setReminderForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Add details..."
                rows={2}
                data-ocid="notifications.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Remind At</Label>
                <Input
                  type="datetime-local"
                  value={reminderForm.reminderAt}
                  onChange={(e) =>
                    setReminderForm((f) => ({
                      ...f,
                      reminderAt: e.target.value,
                    }))
                  }
                  data-ocid="notifications.input"
                />
              </div>
              <div>
                <Label>Related Part Code</Label>
                <Input
                  value={reminderForm.relatedPartCode}
                  onChange={(e) =>
                    setReminderForm((f) => ({
                      ...f,
                      relatedPartCode: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                  data-ocid="notifications.input"
                />
              </div>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={reminderForm.priority}
                onValueChange={(v) =>
                  setReminderForm((f) => ({
                    ...f,
                    priority: v as StoreNotification["priority"],
                  }))
                }
              >
                <SelectTrigger data-ocid="notifications.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReminderModal(false)}
              data-ocid="notifications.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveReminder}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="notifications.save_button"
            >
              Create Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
