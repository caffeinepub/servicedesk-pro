import {
  AlertTriangle,
  ArrowRightCircle,
  Bell,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileText,
  GitBranch,
  Package,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useStore } from "../store";

type DeleteAction = {
  title: string;
  description: string;
  count: number;
  actionKey: string;
};

type DataCard = {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  title: string;
  subtitle: string;
  getCount: () => number;
  actions: { label: string; key: string; getCount: () => number }[];
};

export default function DataManagementPage() {
  const { cases, partItems, purchaseEntries, auditLog, notifications } =
    useStore();

  const [confirmAction, setConfirmAction] = useState<DeleteAction | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [dateRanges, setDateRanges] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const getDateRange = (id: string) => dateRanges[id] ?? { from: "", to: "" };
  const setDateRange = (id: string, field: "from" | "to", value: string) => {
    setDateRanges((prev) => ({
      ...prev,
      [id]: { ...getDateRange(id), [field]: value },
    }));
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const key = confirmAction.actionKey;
    const store = useStore.getState();

    if (key === "delete_all_cases") useStore.setState({ cases: [] });
    else if (key === "delete_all_inventory")
      useStore.setState({ partItems: [] });
    else if (key === "delete_returned_inventory")
      useStore.setState({
        partItems: store.partItems.filter(
          (p) => p.status !== "returned_to_company",
        ),
      });
    else if (key === "delete_all_purchases")
      useStore.setState({ purchaseEntries: [] });
    else if (key === "delete_all_issued")
      useStore.setState({
        partItems: store.partItems.map((p) =>
          p.status === "issued"
            ? {
                ...p,
                status: "in_stock" as const,
                issuedBy: "",
                issuedTo: "",
                caseId: "",
              }
            : p,
        ),
      });
    else if (key === "delete_all_installed")
      useStore.setState({
        partItems: store.partItems.filter((p) => p.status !== "installed"),
      });
    else if (key === "clear_audit_logs") useStore.setState({ auditLog: [] });
    else if (key === "clear_notifications")
      useStore.setState({ notifications: [] });
    else if (key === "delete_all_data") {
      useStore.setState({
        cases: [],
        partItems: [],
        purchaseEntries: [],
        auditLog: [],
        notifications: [],
      });
    }

    setDone((s) => new Set([...s, key]));
    setConfirmAction(null);
  };

  const dataCards: DataCard[] = [
    {
      id: "cases",
      icon: FileText,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      accentColor: "border-l-blue-500",
      title: "Cases",
      subtitle: "Service complaints and case records",
      getCount: () => cases.length,
      actions: [
        {
          label: "Delete All Cases",
          key: "delete_all_cases",
          getCount: () => cases.length,
        },
      ],
    },
    {
      id: "inventory",
      icon: Package,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      accentColor: "border-l-emerald-500",
      title: "Inventory Parts",
      subtitle: "Spare part records and inventory items",
      getCount: () => partItems.length,
      actions: [
        {
          label: "Delete All Parts",
          key: "delete_all_inventory",
          getCount: () => partItems.length,
        },
        {
          label: "Delete Returned to Company",
          key: "delete_returned_inventory",
          getCount: () =>
            partItems.filter((p) => p.status === "returned_to_company").length,
        },
      ],
    },
    {
      id: "purchases",
      icon: ShoppingCart,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-100",
      accentColor: "border-l-violet-500",
      title: "Purchase Records",
      subtitle: "Purchase entries and invoices",
      getCount: () => purchaseEntries.length,
      actions: [
        {
          label: "Delete All Purchases",
          key: "delete_all_purchases",
          getCount: () => purchaseEntries.length,
        },
      ],
    },
    {
      id: "issued",
      icon: ArrowRightCircle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      accentColor: "border-l-amber-500",
      title: "Issued Parts History",
      subtitle: "Parts issued to technicians",
      getCount: () => partItems.filter((p) => p.status === "issued").length,
      actions: [
        {
          label: "Return All Issued to Store",
          key: "delete_all_issued",
          getCount: () => partItems.filter((p) => p.status === "issued").length,
        },
        {
          label: "Delete All Installed Parts",
          key: "delete_all_installed",
          getCount: () =>
            partItems.filter((p) => p.status === "installed").length,
        },
      ],
    },
    {
      id: "lifecycle",
      icon: GitBranch,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      accentColor: "border-l-indigo-500",
      title: "Lifecycle Events",
      subtitle: "Part movement and lifecycle history",
      getCount: () => 0,
      actions: [],
    },
    {
      id: "returns",
      icon: RotateCcw,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      accentColor: "border-l-rose-500",
      title: "Part Return Records",
      subtitle: "Parts returned to company",
      getCount: () =>
        partItems.filter((p) => p.status === "returned_to_company").length,
      actions: [],
    },
    {
      id: "audit",
      icon: ClipboardCheck,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      accentColor: "border-l-orange-500",
      title: "Audit Logs",
      subtitle: "System activity and audit trail",
      getCount: () => auditLog.length,
      actions: [
        {
          label: "Clear All Audit Logs",
          key: "clear_audit_logs",
          getCount: () => auditLog.length,
        },
      ],
    },
    {
      id: "notifications",
      icon: Bell,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
      accentColor: "border-l-slate-400",
      title: "Notifications",
      subtitle: "In-app notifications and alerts",
      getCount: () => notifications.length,
      actions: [
        {
          label: "Clear All Notifications",
          key: "clear_notifications",
          getCount: () => notifications.length,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Data Management</h1>
            <p className="text-red-200 text-sm">
              Permanently delete system data. These actions cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <div
        className="px-6 py-6 max-w-6xl mx-auto space-y-6"
        data-ocid="data_management.page"
      >
        {/* Warning Banner */}
        <div className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">
              Danger Zone — Irreversible Actions
            </p>
            <p className="text-red-700 text-sm mt-0.5">
              Deleted data cannot be recovered. All delete actions are permanent
              and irreversible. Please back up important data before proceeding.
            </p>
          </div>
        </div>

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataCards.map((card) => {
            const Icon = card.icon;
            const count = card.getCount();
            const range = getDateRange(card.id);
            return (
              <Card
                key={card.id}
                className={`shadow-sm border-l-4 ${card.accentColor} rounded-2xl overflow-hidden`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {card.title}
                        </p>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs font-bold tabular-nums"
                    >
                      {count.toLocaleString()} records
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Action buttons */}
                  {card.actions.length > 0 ? (
                    <div className="space-y-2">
                      {card.actions.map((action) => (
                        <Button
                          key={action.key}
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700"
                          disabled={done.has(action.key)}
                          onClick={() =>
                            setConfirmAction({
                              title: action.label,
                              description: `This will permanently delete ${action.getCount().toLocaleString()} record(s). This action cannot be undone.`,
                              count: action.getCount(),
                              actionKey: action.key,
                            })
                          }
                          data-ocid="data_management.delete_button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {action.label}
                          {done.has(action.key) && (
                            <span className="ml-auto flex items-center gap-1 text-xs">
                              <CheckCircle className="h-3 w-3" /> Done
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Read-only data for reference.
                    </p>
                  )}

                  {/* Date Range Filter */}
                  {card.actions.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Delete by Date
                        Range
                      </p>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block mb-1">
                            From
                          </span>
                          <Input
                            type="date"
                            value={range.from}
                            onChange={(e) =>
                              setDateRange(card.id, "from", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block mb-1">
                            To
                          </span>
                          <Input
                            type="date"
                            value={range.to}
                            onChange={(e) =>
                              setDateRange(card.id, "to", e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 flex-shrink-0"
                          disabled={!range.from || !range.to}
                          onClick={() => {
                            if (!range.from || !range.to) return;
                            setConfirmAction({
                              title: `Delete ${card.title} by Date Range`,
                              description: `This will delete all ${card.title.toLowerCase()} records between ${range.from} and ${range.to}. This action cannot be undone.`,
                              count: 0,
                              actionKey: `${card.actions[0]?.key}_range`,
                            });
                          }}
                          data-ocid="data_management.delete_button"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete Range
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bulk Operations */}
        <Card className="shadow-sm border-2 border-red-200 bg-red-50/30 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800 text-sm">
                  Bulk Operations
                </p>
                <p className="text-xs text-red-600 font-normal">
                  Delete everything at once. Use with extreme caution.
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="destructive"
                className="w-full gap-2 bg-red-700 hover:bg-red-800"
                onClick={() =>
                  setConfirmAction({
                    title: "Delete ALL System Data",
                    description:
                      "This will permanently delete ALL cases, inventory parts, purchase records, audit logs, and notifications. This action CANNOT be undone.",
                    count:
                      cases.length +
                      partItems.length +
                      purchaseEntries.length +
                      auditLog.length +
                      notifications.length,
                    actionKey: "delete_all_data",
                  })
                }
                data-ocid="data_management.delete_button"
              >
                <Trash2 className="h-4 w-4" />
                Delete ALL Data
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-300"
                onClick={() => {
                  setDone(new Set());
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Reset Completion Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent data-ocid="data_management.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {confirmAction?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              {confirmAction?.description}
              {confirmAction && confirmAction.count > 0 && (
                <span className="block mt-2 font-bold text-red-700">
                  {confirmAction.count.toLocaleString()} record(s) will be
                  deleted.
                </span>
              )}
              <span className="block mt-2 font-bold text-red-800">
                This action is permanent and cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="data_management.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirm}
              data-ocid="data_management.confirm_button"
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
