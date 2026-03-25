import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellDot,
  BellOff,
  Bot,
  CheckCheck,
  Clock,
  Info,
  Package,
  Plus,
  Repeat,
  RotateCcw,
  Send,
  Trash2,
  TrendingDown,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
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

type Filter =
  | "all"
  | "unread"
  | "low_stock"
  | "issued"
  | "returned"
  | "reminders"
  | "ai";
type Priority = "all" | "high" | "medium" | "low";

const TYPE_STYLES: Record<
  string,
  {
    border: string;
    bg: string;
    icon: React.ReactElement;
    label: string;
    priority: Priority;
    filter: Filter;
  }
> = {
  follow_up: {
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    icon: <Info className="h-4 w-4 text-blue-500" />,
    label: "Follow-up",
    priority: "medium",
    filter: "all",
  },
  overdue: {
    border: "border-l-red-500",
    bg: "bg-red-50",
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    label: "Overdue",
    priority: "high",
    filter: "all",
  },
  part_pending: {
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    icon: <Package className="h-4 w-4 text-amber-500" />,
    label: "Parts",
    priority: "medium",
    filter: "all",
  },
  general: {
    border: "border-l-slate-400",
    bg: "bg-slate-50",
    icon: <Bell className="h-4 w-4 text-slate-500" />,
    label: "General",
    priority: "low",
    filter: "all",
  },
  stale_case: {
    border: "border-l-orange-500",
    bg: "bg-orange-50",
    icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    label: "Stale",
    priority: "high",
    filter: "all",
  },
  part_request: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50",
    icon: <Package className="h-4 w-4 text-emerald-500" />,
    label: "Part Request",
    priority: "medium",
    filter: "issued",
  },
  low_stock: {
    border: "border-l-red-400",
    bg: "bg-red-50",
    icon: <TrendingDown className="h-4 w-4 text-red-500" />,
    label: "Low Stock",
    priority: "high",
    filter: "low_stock",
  },
  part_issued: {
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    icon: <Package className="h-4 w-4 text-amber-500" />,
    label: "Part Issued",
    priority: "medium",
    filter: "issued",
  },
  part_returned: {
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    icon: <Package className="h-4 w-4 text-blue-500" />,
    label: "Part Returned",
    priority: "low",
    filter: "returned",
  },
  ai_insight: {
    border: "border-l-violet-500",
    bg: "bg-violet-50",
    icon: <Bot className="h-4 w-4 text-violet-500" />,
    label: "AI Insight",
    priority: "low",
    filter: "ai",
  },
};

const PRIORITY_BADGE: Record<Priority, string> = {
  all: "",
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-blue-100 text-blue-700 border border-blue-200",
};

function relativeTime(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function reminderCountdown(dateStr: string) {
  const diff = (new Date(dateStr).getTime() - Date.now()) / 86400000;
  if (diff < 0) return { label: "Overdue", cls: "bg-red-100 text-red-600" };
  if (diff < 1) return { label: "Today", cls: "bg-amber-100 text-amber-700" };
  return {
    label: `In ${Math.ceil(diff)} day${Math.ceil(diff) > 1 ? "s" : ""}`,
    cls: "bg-blue-100 text-blue-700",
  };
}

export default function NotificationsPage() {
  const {
    notifications,
    reminders,
    markNotificationRead,
    deleteNotification,
    addReminder,
    updateReminder,
    currentUser,
  } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [snoozeId, setSnoozeId] = useState<string | null>(null);
  const [dismissId, setDismissId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [rForm, setRForm] = useState({
    note: "",
    reminderDate: "",
    repeat: "none",
  });

  const unread = notifications.filter((n) => !n.isRead).length;
  const read = notifications.filter((n) => n.isRead).length;

  const markAllRead = () => {
    for (const n of notifications.filter((n) => !n.isRead))
      markNotificationRead(n.id);
  };

  const clearAllRead = () => {
    for (const n of notifications.filter((n) => n.isRead))
      deleteNotification(n.id);
    setClearAllOpen(false);
  };

  const visibleNotifications =
    currentUser?.role === "admin"
      ? notifications
      : currentUser?.role === "supervisor"
        ? notifications.filter((n) =>
            [
              "part_issued",
              "part_returned",
              "low_stock",
              "part_request",
            ].includes(n.type),
          )
        : notifications.filter(
            (n) =>
              [
                "follow_up",
                "overdue",
                "part_pending",
                "general",
                "stale_case",
                "part_issued",
              ].includes(n.type) &&
              (n.userId === currentUser?.id ||
                n.userId === "" ||
                n.userId === "all"),
          );

  const filtered = visibleNotifications.filter((n) => {
    const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.general;
    if (filter === "unread") {
      if (n.isRead) return false;
    } else if (filter === "low_stock") {
      if (n.type !== "low_stock") return false;
    } else if (filter === "issued") {
      if (!["part_request", "part_issued"].includes(n.type)) return false;
    } else if (filter === "returned") {
      if (n.type !== "part_returned") return false;
    } else if (filter === "ai") {
      if (n.type !== "ai_insight") return false;
    } else if (filter === "reminders") {
      return false;
    } // handled separately
    if (priority !== "all" && style.priority !== priority) return false;
    return true;
  });

  const userReminders = reminders.filter(
    (r) => !r.isDone && r.userId === currentUser?.id,
  );

  const handleAddReminder = () => {
    if (!rForm.note || !rForm.reminderDate) return;
    addReminder({
      caseId: "",
      userId: currentUser?.id ?? "",
      reminderDate: new Date(rForm.reminderDate).toISOString(),
      note: rForm.note,
      isDone: false,
    });
    setReminderOpen(false);
    setRForm({ note: "", reminderDate: "", repeat: "none" });
  };

  const handleSnooze = (id: string) => {
    const r = reminders.find((r) => r.id === id);
    if (!r) return;
    const newDate = new Date(r.reminderDate);
    newDate.setDate(newDate.getDate() + 1);
    updateReminder(id, { reminderDate: newDate.toISOString() });
    setSnoozeId(null);
  };

  const handleDismiss = (id: string) => {
    updateReminder(id, { isDone: true });
    setDismissId(null);
  };

  const FILTER_TABS: {
    key: Filter;
    label: string;
    color: string;
    icon: React.ElementType;
  }[] = [
    { key: "all", label: "All", color: "bg-amber-500", icon: Bell },
    { key: "unread", label: "Unread", color: "bg-red-500", icon: BellDot },
    {
      key: "low_stock",
      label: "Low Stock",
      color: "bg-rose-500",
      icon: AlertTriangle,
    },
    { key: "issued", label: "Issued", color: "bg-amber-500", icon: Send },
    {
      key: "returned",
      label: "Returned",
      color: "bg-blue-500",
      icon: RotateCcw,
    },
    {
      key: "reminders",
      label: "Reminders",
      color: "bg-purple-500",
      icon: Clock,
    },
    { key: "ai", label: "AI", color: "bg-violet-500", icon: Bot },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unread} unread
                </span>
                <span className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full">
                  {read} read
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={markAllRead}
              data-ocid="notifications.primary_button"
            >
              <CheckCheck className="h-4 w-4 mr-1" /> Mark All Read
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => setClearAllOpen(true)}
              data-ocid="notifications.delete_button"
            >
              <X className="h-4 w-4 mr-1" /> Clear Read
            </Button>
          </div>
        </div>
      </div>

      {/* Filter tabs - outside header */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((f) => (
          <button
            type="button"
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === f.key
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
            }`}
            data-ocid="notifications.tab"
          >
            <f.icon className="h-3 w-3" />
            {f.label}
            {f.key === "unread" && unread > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </button>
        ))}
        {/* Priority filter */}
        <div className="ml-auto">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="bg-white text-slate-600 text-xs rounded-full px-3 py-1.5 border border-slate-200 outline-none font-semibold cursor-pointer hover:border-amber-300"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Reminders section */}
        {(filter === "all" || filter === "reminders") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Active Reminders
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {userReminders.length}
                </span>
              </h2>
              <Button
                size="sm"
                onClick={() => setReminderOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
                data-ocid="notifications.open_modal_button"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Reminder
              </Button>
            </div>

            {userReminders.length === 0 ? (
              <Card
                className="border-dashed border-2 border-slate-200"
                data-ocid="notifications.empty_state"
              >
                <CardContent className="py-8 text-center text-slate-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active reminders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userReminders.map((r) => {
                  const cd = reminderCountdown(r.reminderDate);
                  return (
                    <Card
                      key={r.id}
                      className="border-l-4 border-l-amber-400 shadow-sm"
                    >
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {r.note}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(r.reminderDate).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${cd.cls}`}
                          >
                            {cd.label}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                            onClick={() => setSnoozeId(r.id)}
                          >
                            <Repeat className="h-3 w-3 mr-1" /> Snooze
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => setDismissId(r.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notifications list */}
        {filter !== "reminders" && (
          <div>
            <h2 className="font-bold text-slate-700 flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-amber-500" />
              Notifications
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {filtered.length}
              </span>
            </h2>

            {filtered.length === 0 && (
              <div
                className="text-center py-16 text-slate-400"
                data-ocid="notifications.empty_state"
              >
                <BellOff className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm mt-1">No notifications to show.</p>
              </div>
            )}

            <div className="space-y-3">
              {filtered.map((n) => {
                const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.general;
                const pBadge = PRIORITY_BADGE[style.priority];
                return (
                  <Card
                    key={n.id}
                    className={`border-l-4 ${style.border} shadow-sm transition-all ${
                      !n.isRead ? style.bg : "bg-white opacity-75"
                    } hover:shadow-md cursor-pointer`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.isRead ? "bg-slate-100" : style.bg}`}
                      >
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${n.isRead ? "bg-slate-100 text-slate-500" : "bg-white/80 text-slate-600"}`}
                              >
                                {style.label}
                              </span>
                              {pBadge && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${pBadge}`}
                                >
                                  {style.priority}
                                </span>
                              )}
                              {n.relatedPartCode && (
                                <span className="text-xs text-slate-400">
                                  Part: {n.relatedPartCode}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm mt-1 ${n.isRead ? "text-slate-500" : "text-slate-800 font-medium"}`}
                            >
                              {n.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            )}
                            <span className="text-xs text-slate-400">
                              {relativeTime(n.createdAt)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(n.id);
                              }}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                              data-ocid="notifications.delete_button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete notification dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This notification will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="notifications.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteTarget) deleteNotification(deleteTarget);
                setDeleteTarget(null);
              }}
              data-ocid="notifications.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all dialog */}
      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all read notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              All read notifications will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={clearAllRead}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Snooze dialog */}
      <AlertDialog open={!!snoozeId} onOpenChange={() => setSnoozeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Snooze Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This reminder will be postponed by 1 day.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (snoozeId) handleSnooze(snoozeId);
              }}
            >
              Snooze 1 Day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dismiss reminder dialog */}
      <AlertDialog open={!!dismissId} onOpenChange={() => setDismissId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This reminder will be marked as done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dismissId) handleDismiss(dismissId);
              }}
            >
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add reminder dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="max-w-md" data-ocid="notifications.dialog">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Note *</Label>
              <Textarea
                value={rForm.note}
                onChange={(e) => setRForm({ ...rForm, note: e.target.value })}
                placeholder="What do you need to remember?"
                className="mt-1"
                data-ocid="notifications.textarea"
              />
            </div>
            <div>
              <Label>Date &amp; Time *</Label>
              <Input
                type="datetime-local"
                value={rForm.reminderDate}
                onChange={(e) =>
                  setRForm({ ...rForm, reminderDate: e.target.value })
                }
                className="mt-1"
                data-ocid="notifications.input"
              />
            </div>
            <div>
              <Label>Repeat</Label>
              <Select
                value={rForm.repeat}
                onValueChange={(v) => setRForm({ ...rForm, repeat: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReminderOpen(false)}
              data-ocid="notifications.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddReminder}
              disabled={!rForm.note || !rForm.reminderDate}
              data-ocid="notifications.submit_button"
            >
              Add Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
