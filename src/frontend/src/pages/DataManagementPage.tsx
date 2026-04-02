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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useStore } from "../store";

type DeleteAction = {
  title: string;
  description: string;
  count: number;
  actionKey: string;
};

export default function DataManagementPage() {
  const {
    cases,
    partItems,
    purchaseEntries,
    auditLog,
    notifications,
    partRequests,
    storePilotAuditLogs,
  } = useStore();

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

    // Cases
    if (key === "cases_all") {
      useStore.setState({ cases: [] });
      store.saveCasesToBackend().catch(() => {});
    } else if (key === "cases_pending") {
      useStore.setState({
        cases: store.cases.filter((c) => c.status !== "pending"),
      });
      store.saveCasesToBackend().catch(() => {});
    } else if (key === "cases_closed") {
      useStore.setState({
        cases: store.cases.filter((c) => c.status !== "closed"),
      });
      store.saveCasesToBackend().catch(() => {});
    } else if (key === "cases_cancelled") {
      useStore.setState({
        cases: store.cases.filter((c) => c.status !== "cancelled"),
      });
      store.saveCasesToBackend().catch(() => {});
    }
    // Inventory
    else if (key === "inv_all") {
      useStore.setState({ partItems: [] });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "inv_instock") {
      useStore.setState({
        partItems: store.partItems.filter((p) => p.status !== "in_stock"),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "inv_issued") {
      useStore.setState({
        partItems: store.partItems.filter((p) => p.status !== "issued"),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "inv_installed") {
      useStore.setState({
        partItems: store.partItems.filter((p) => p.status !== "installed"),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "inv_returned") {
      useStore.setState({
        partItems: store.partItems.filter(
          (p) => p.status !== "returned_to_company",
        ),
      });
      store.saveInventoryToBackend().catch(() => {});
    }
    // Part Requests
    else if (key === "pr_all") {
      useStore.setState({ partRequests: [] });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "pr_pending") {
      useStore.setState({
        partRequests: store.partRequests.filter((r) => r.status !== "pending"),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "pr_rejected") {
      useStore.setState({
        partRequests: store.partRequests.filter((r) => r.status !== "rejected"),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "pr_cancelled") {
      useStore.setState({
        partRequests: store.partRequests.filter(
          (r) => r.status !== "cancelled",
        ),
      });
      store.saveInventoryToBackend().catch(() => {});
    }
    // Purchases
    else if (key === "purchase_all") {
      useStore.setState({ purchaseEntries: [] });
      store.saveInventoryToBackend().catch(() => {});
    }
    // Audit Logs
    else if (key === "audit_all") {
      useStore.setState({ auditLog: [], storePilotAuditLogs: [] });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "audit_login") {
      useStore.setState({
        storePilotAuditLogs: store.storePilotAuditLogs.filter(
          (l) => l.action !== "LOGIN" && l.action !== "LOGOUT",
        ),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "audit_creates") {
      useStore.setState({
        storePilotAuditLogs: store.storePilotAuditLogs.filter(
          (l) => l.action !== "CREATE",
        ),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "audit_updates") {
      useStore.setState({
        storePilotAuditLogs: store.storePilotAuditLogs.filter(
          (l) =>
            l.action !== "UPDATE" &&
            l.action !== "ISSUE" &&
            l.action !== "RETURN",
        ),
      });
      store.saveInventoryToBackend().catch(() => {});
    } else if (key === "audit_deletes") {
      useStore.setState({
        storePilotAuditLogs: store.storePilotAuditLogs.filter(
          (l) => l.action !== "DELETE",
        ),
      });
      store.saveInventoryToBackend().catch(() => {});
    }
    // Notifications
    else if (key === "notif_all") {
      useStore.setState({ notifications: [] });
    } else if (key === "notif_part_requests") {
      useStore.setState({
        notifications: store.notifications.filter(
          (n) => n.type !== "part_request",
        ),
      });
    } else if (key === "notif_part_issued") {
      useStore.setState({
        notifications: store.notifications.filter(
          (n) => (n.type as string) !== "part_issued",
        ),
      });
    } else if (key === "notif_general") {
      useStore.setState({
        notifications: store.notifications.filter(
          (n) =>
            n.type === "part_request" || (n.type as string) === "part_issued",
        ),
      });
    }
    // Bulk
    else if (key === "delete_all_data") {
      useStore.setState({
        cases: [],
        partItems: [],
        purchaseEntries: [],
        auditLog: [],
        storePilotAuditLogs: [],
        notifications: [],
        partRequests: [],
      });
      store.saveCasesToBackend().catch(() => {});
      store.saveInventoryToBackend().catch(() => {});
    }

    setDone((s) => new Set([...s, key]));
    setConfirmAction(null);
  };

  const confirm = (title: string, count: number, key: string) => {
    setConfirmAction({
      title,
      description: `This will permanently delete ${count.toLocaleString()} record(s). This cannot be undone.`,
      count,
      actionKey: key,
    });
  };

  const TabDeleteBtn = ({
    label,
    actionKey,
    count,
  }: {
    label: string;
    actionKey: string;
    count: number;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <Badge variant="outline" className="ml-2 text-xs">
          {count} records
        </Badge>
      </div>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700"
        disabled={done.has(actionKey) || count === 0}
        onClick={() => confirm(label, count, actionKey)}
        data-ocid="data_management.delete_button"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        {done.has(actionKey) ? "Done" : "Delete"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl px-6 py-6 shadow-lg">
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
          {/* Cases */}
          <Card className="shadow-sm border-l-4 border-l-blue-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Cases</p>
                    <p className="text-xs text-slate-500 font-normal">
                      Service complaint records
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {cases.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-8 text-xs mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="text-xs">
                    Closed
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs">
                    Cancelled
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TabDeleteBtn
                    label="Delete All Cases"
                    actionKey="cases_all"
                    count={cases.length}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Pending Cases"
                    actionKey="cases_pending"
                    count={cases.filter((c) => c.status === "pending").length}
                  />
                </TabsContent>
                <TabsContent value="closed" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Closed Cases"
                    actionKey="cases_closed"
                    count={cases.filter((c) => c.status === "closed").length}
                  />
                </TabsContent>
                <TabsContent value="cancelled" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Cancelled Cases"
                    actionKey="cases_cancelled"
                    count={cases.filter((c) => c.status === "cancelled").length}
                  />
                </TabsContent>
              </Tabs>
              <div className="border-t border-slate-100 pt-3 mt-1">
                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Delete by Date Range
                </p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      From
                    </span>
                    <Input
                      type="date"
                      value={getDateRange("cases").from}
                      onChange={(e) =>
                        setDateRange("cases", "from", e.target.value)
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
                      value={getDateRange("cases").to}
                      onChange={(e) =>
                        setDateRange("cases", "to", e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    disabled={
                      !getDateRange("cases").from || !getDateRange("cases").to
                    }
                    onClick={() =>
                      confirm(
                        "Delete Cases by Date Range",
                        cases.length,
                        "cases_range",
                      )
                    }
                    data-ocid="data_management.delete_button"
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete Range
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="shadow-sm border-l-4 border-l-emerald-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Inventory Parts
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      Spare part records
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {partItems.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-5 h-8 text-xs mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="instock" className="text-xs">
                    In Stock
                  </TabsTrigger>
                  <TabsTrigger value="issued" className="text-xs">
                    Issued
                  </TabsTrigger>
                  <TabsTrigger value="installed" className="text-xs">
                    Installed
                  </TabsTrigger>
                  <TabsTrigger value="returned" className="text-xs">
                    Returned
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TabDeleteBtn
                    label="Delete All Parts"
                    actionKey="inv_all"
                    count={partItems.length}
                  />
                </TabsContent>
                <TabsContent value="instock" className="mt-0">
                  <TabDeleteBtn
                    label="Delete In-Stock Parts"
                    actionKey="inv_instock"
                    count={
                      partItems.filter((p) => p.status === "in_stock").length
                    }
                  />
                </TabsContent>
                <TabsContent value="issued" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Issued Parts"
                    actionKey="inv_issued"
                    count={
                      partItems.filter((p) => p.status === "issued").length
                    }
                  />
                </TabsContent>
                <TabsContent value="installed" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Installed Parts"
                    actionKey="inv_installed"
                    count={
                      partItems.filter((p) => p.status === "installed").length
                    }
                  />
                </TabsContent>
                <TabsContent value="returned" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Returned Parts"
                    actionKey="inv_returned"
                    count={
                      partItems.filter(
                        (p) => p.status === "returned_to_company",
                      ).length
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Part Requests */}
          <Card className="shadow-sm border-l-4 border-l-orange-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Part Requests
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      Part request records
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {partRequests.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-8 text-xs mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs">
                    Rejected
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs">
                    Cancelled
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TabDeleteBtn
                    label="Delete All Requests"
                    actionKey="pr_all"
                    count={partRequests.length}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Pending Requests"
                    actionKey="pr_pending"
                    count={
                      partRequests.filter((r) => r.status === "pending").length
                    }
                  />
                </TabsContent>
                <TabsContent value="rejected" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Rejected Requests"
                    actionKey="pr_rejected"
                    count={
                      partRequests.filter((r) => r.status === "rejected").length
                    }
                  />
                </TabsContent>
                <TabsContent value="cancelled" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Cancelled Requests"
                    actionKey="pr_cancelled"
                    count={
                      partRequests.filter((r) => r.status === "cancelled")
                        .length
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Purchases */}
          <Card className="shadow-sm border-l-4 border-l-violet-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Purchase Records
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      Purchase entries and invoices
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {purchaseEntries.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TabDeleteBtn
                label="Delete All Purchases"
                actionKey="purchase_all"
                count={purchaseEntries.length}
              />
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="shadow-sm border-l-4 border-l-orange-400 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Audit Logs
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      System activity and audit trail
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {storePilotAuditLogs.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-5 h-8 text-xs mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="login" className="text-xs">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="creates" className="text-xs">
                    Creates
                  </TabsTrigger>
                  <TabsTrigger value="updates" className="text-xs">
                    Updates
                  </TabsTrigger>
                  <TabsTrigger value="deletes" className="text-xs">
                    Deletes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TabDeleteBtn
                    label="Clear All Logs"
                    actionKey="audit_all"
                    count={storePilotAuditLogs.length + auditLog.length}
                  />
                </TabsContent>
                <TabsContent value="login" className="mt-0">
                  <TabDeleteBtn
                    label="Clear Login/Logout Logs"
                    actionKey="audit_login"
                    count={
                      storePilotAuditLogs.filter(
                        (l) => l.action === "LOGIN" || l.action === "LOGOUT",
                      ).length
                    }
                  />
                </TabsContent>
                <TabsContent value="creates" className="mt-0">
                  <TabDeleteBtn
                    label="Clear Create Logs"
                    actionKey="audit_creates"
                    count={
                      storePilotAuditLogs.filter((l) => l.action === "CREATE")
                        .length
                    }
                  />
                </TabsContent>
                <TabsContent value="updates" className="mt-0">
                  <TabDeleteBtn
                    label="Clear Update/Issue/Return Logs"
                    actionKey="audit_updates"
                    count={
                      storePilotAuditLogs.filter(
                        (l) =>
                          l.action === "UPDATE" ||
                          l.action === "ISSUE" ||
                          l.action === "RETURN",
                      ).length
                    }
                  />
                </TabsContent>
                <TabsContent value="deletes" className="mt-0">
                  <TabDeleteBtn
                    label="Clear Delete Logs"
                    actionKey="audit_deletes"
                    count={
                      storePilotAuditLogs.filter((l) => l.action === "DELETE")
                        .length
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-sm border-l-4 border-l-slate-400 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Notifications
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      In-app alerts
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {notifications.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-8 text-xs mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="part_req" className="text-xs">
                    Part Req
                  </TabsTrigger>
                  <TabsTrigger value="part_issued" className="text-xs">
                    Issued
                  </TabsTrigger>
                  <TabsTrigger value="general" className="text-xs">
                    General
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TabDeleteBtn
                    label="Clear All Notifications"
                    actionKey="notif_all"
                    count={notifications.length}
                  />
                </TabsContent>
                <TabsContent value="part_req" className="mt-0">
                  <TabDeleteBtn
                    label="Clear Part Request Notifs"
                    actionKey="notif_part_requests"
                    count={
                      notifications.filter((n) => n.type === "part_request")
                        .length
                    }
                  />
                </TabsContent>
                <TabsContent value="part_issued" className="mt-0">
                  <TabDeleteBtn
                    label="Clear Part Issued Notifs"
                    actionKey="notif_part_issued"
                    count={
                      notifications.filter(
                        (n) => (n.type as string) === "part_issued",
                      ).length
                    }
                  />
                </TabsContent>
                <TabsContent value="general" className="mt-0">
                  <TabDeleteBtn
                    label="Clear General Notifs"
                    actionKey="notif_general"
                    count={
                      notifications.filter(
                        (n) =>
                          n.type !== "part_request" &&
                          (n.type as string) !== "part_issued",
                      ).length
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Lifecycle */}
          <Card className="shadow-sm border-l-4 border-l-indigo-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Lifecycle Events
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      Part movement history
                    </p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-slate-400 italic">
                Read-only data for reference.
              </p>
            </CardContent>
          </Card>

          {/* Returns */}
          <Card className="shadow-sm border-l-4 border-l-rose-500 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Issued Parts History
                    </p>
                    <p className="text-xs text-slate-500 font-normal">
                      Parts issued to technicians
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {
                    partItems.filter(
                      (p) => p.status === "issued" || p.status === "installed",
                    ).length
                  }{" "}
                  active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-8 text-xs mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    All Issued
                  </TabsTrigger>
                  <TabsTrigger value="returned" className="text-xs">
                    Returned to Store
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <TabDeleteBtn
                    label="Delete All Issued History"
                    actionKey="inv_issued"
                    count={
                      partItems.filter((p) => p.status === "issued").length
                    }
                  />
                </TabsContent>
                <TabsContent value="returned" className="mt-0">
                  <TabDeleteBtn
                    label="Delete Returned to Store"
                    actionKey="inv_returned"
                    count={
                      partItems.filter(
                        (p) => p.status === "returned_to_company",
                      ).length
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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
                      "This will permanently delete ALL cases, inventory parts, purchase records, part requests, audit logs, and notifications. This action CANNOT be undone.",
                    count:
                      cases.length +
                      partItems.length +
                      purchaseEntries.length +
                      auditLog.length +
                      notifications.length +
                      partRequests.length,
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
