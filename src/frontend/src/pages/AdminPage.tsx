import {
  Activity,
  CheckCircle,
  Circle,
  Clock,
  Eye,
  Key,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Shield as ShieldIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { backendGetUsers } from "../services/userBackend";
import { useStore } from "../store";
import type { User, UserRole } from "../types";

function formatRelativeTime(ts: string): string {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatDateTime(ts: string): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLogDateTime(ts: string): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isActiveNow(u: User): boolean {
  if (u.isOnline) return true;
  if (!u.lastActive) return false;
  return Date.now() - new Date(u.lastActive).getTime() < 10 * 60 * 1000;
}

const ACTION_COLORS: Record<string, string> = {
  Login: "bg-green-50 text-green-800",
  Logout: "bg-gray-50 text-gray-700",
  "User Deleted": "bg-red-50 text-red-800",
  "Case Deleted": "bg-red-50 text-red-800",
  "User Rejected": "bg-red-50 text-red-800",
  "User Created": "bg-blue-50 text-blue-800",
  "User Approved": "bg-blue-50 text-blue-800",
  "Case Created": "bg-blue-50 text-blue-800",
  "Technician Added": "bg-blue-50 text-blue-800",
};

function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? "bg-white text-gray-700";
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
}

const EMPTY_FORM: UserFormData = {
  name: "",
  email: "",
  phone: "",
  role: "backend_user",
  password: "",
};

export default function AdminPage() {
  const {
    users,
    currentUser,
    activityLog,
    approveUser,
    rejectUser,
    createUser,
    editUser,
    deleteUser,
    mergeUsers,
    markApprovalsSeen,
  } = useStore();

  const isAdmin = currentUser?.role === "admin";

  // Live polling: update users list every 5 seconds to catch new registrations live
  // biome-ignore lint/correctness/useExhaustiveDependencies: markApprovalsSeen is stable
  useEffect(() => {
    if (!isAdmin) return;
    markApprovalsSeen();
    const fetchUsers = () => {
      backendGetUsers()
        .then((freshUsers) => {
          if (freshUsers.length > 0) {
            mergeUsers(freshUsers);
          }
        })
        .catch(() => {});
    };
    fetchUsers(); // immediate fetch on mount
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, [isAdmin, mergeUsers]);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetUser, setRejectTargetUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Activity log filters
  const [logSearch, setLogSearch] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("all");
  const [refreshingApprovals, setRefreshingApprovals] = useState(false);

  if (!isAdmin) {
    return (
      <div className="text-center py-20 text-gray-500">
        Access denied. Admins only.
      </div>
    );
  }

  const handleRefreshApprovals = async () => {
    setRefreshingApprovals(true);
    try {
      const fresh = await backendGetUsers();
      if (fresh.length > 0) mergeUsers(fresh);
      toast.success("Approvals refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshingApprovals(false);
    }
  };

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      toast.error("Mobile number is required and must be exactly 10 digits");
      return;
    }
    if (!editingUser && !form.password) {
      toast.error("Password is required for new users");
      return;
    }
    if (editingUser) {
      const updates: Partial<User> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
      };
      if (form.password) updates.password = form.password;
      try {
        editUser(editingUser.id, updates);
        toast.success("User updated successfully");
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "email_exists")
            toast.error("A user with this email already exists");
          else if (err.message === "phone_exists")
            toast.error("This mobile number is already registered");
          else toast.error("Failed to update user");
        }
        return;
      }
    } else {
      try {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          password: form.password,
        });
        toast.success("User created successfully");
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === "email_exists")
            toast.error("A user with this email already exists");
          else if (err.message === "phone_exists")
            toast.error("This mobile number is already registered");
          else toast.error("Failed to create user");
        }
        return;
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    toast.success(`User ${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const uniqueActions = Array.from(new Set(activityLog.map((l) => l.action)));

  const filteredLog = activityLog
    .filter((l) => {
      const matchSearch =
        !logSearch ||
        l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.details.toLowerCase().includes(logSearch.toLowerCase());
      const matchAction =
        logActionFilter === "all" || l.action === logActionFilter;
      return matchSearch && matchAction;
    })
    .slice(0, 200);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-violet-700 to-purple-700 text-white rounded-xl px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-violet-200 text-sm">
              Manage users, approvals, and activity
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Pending Approval",
            value: pending.length,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            Icon: Users,
          },
          {
            label: "Approved Users",
            value: approved.length,
            color: "text-green-600",
            bg: "bg-green-50",
            Icon: UserCheck,
          },
          {
            label: "Rejected",
            value: rejected.length,
            color: "text-red-600",
            bg: "bg-red-50",
            Icon: XCircle,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl p-4 border border-white shadow-sm flex items-center gap-3`}
          >
            <s.Icon className={`h-8 w-8 ${s.color} opacity-70`} />
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="approvals">
        <TabsList className="mb-4">
          <TabsTrigger value="approvals" data-ocid="admin.tab">
            Approvals{" "}
            {pending.length > 0 && (
              <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-1.5">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.tab">
            Users
          </TabsTrigger>
          <TabsTrigger value="activity" data-ocid="admin.tab">
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Approvals */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshApprovals}
              disabled={refreshingApprovals}
              className="gap-2"
              data-ocid="admin.secondary_button"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshingApprovals ? "animate-spin" : ""}`}
              />
              {refreshingApprovals ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          {pending.length === 0 ? (
            <div
              className="text-center py-12 text-gray-400 text-sm"
              data-ocid="admin.empty_state"
            >
              No pending approvals
            </div>
          ) : (
            <Card className="shadow-sm border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-yellow-700 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Pending Approvals (
                  {pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pending.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-yellow-50 border border-yellow-100 px-4 py-3 rounded-lg gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">
                        {u.email} &middot; {u.phone}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {u.role.replace("_", " ")} &middot; Requested{" "}
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await approveUser(u.id);
                          toast.success("User approved");
                        }}
                        className="bg-green-600 hover:bg-green-700 h-8"
                        data-ocid="admin.confirm_button"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRejectTargetUser(u);
                          setRejectReason("");
                          setRejectDialogOpen(true);
                        }}
                        className="h-8"
                        data-ocid="admin.delete_button"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{users.length} total users</p>
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 h-8"
              data-ocid="admin.primary_button"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Add User
            </Button>
          </div>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {[
                        "Name",
                        "Email",
                        "Phone",
                        "Role",
                        "Status",
                        "Online Status",
                        "Last Login",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.status !== "rejected")
                      .map((u) => {
                        const active = isActiveNow(u);
                        return (
                          <tr
                            key={u.id}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >
                            <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                              {u.name}
                            </td>
                            <td className="px-3 py-3 text-gray-500 text-xs">
                              {u.email}
                            </td>
                            <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                              {u.phone || "—"}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                                  u.role === "admin"
                                    ? "bg-violet-100 text-violet-700"
                                    : u.role === "supervisor"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {u.role.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                  u.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : u.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-green-500" : "bg-gray-300"}`}
                                />
                                <span
                                  className={`text-xs ${active ? "text-green-700 font-medium" : "text-gray-500"}`}
                                >
                                  {active
                                    ? "Active"
                                    : u.lastActive
                                      ? `Last seen: ${formatRelativeTime(u.lastActive)}`
                                      : "Never"}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {formatDateTime(u.lastLogin)}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1">
                                {u.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        await approveUser(u.id);
                                        toast.success("User approved");
                                      }}
                                      className="h-6 text-xs bg-green-600 hover:bg-green-700"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setRejectTargetUser(u);
                                        setRejectReason("");
                                        setRejectDialogOpen(true);
                                      }}
                                      className="h-6 text-xs"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {u.id !== currentUser?.id && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEdit(u)}
                                      className="p-1 rounded hover:bg-blue-50 text-blue-600"
                                      title="Edit user"
                                      data-ocid="admin.edit_button"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTarget(u)}
                                      className="p-1 rounded hover:bg-red-50 text-red-500"
                                      title="Delete user"
                                      data-ocid="admin.delete_button"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                                {u.id === currentUser?.id && (
                                  <span className="text-xs text-gray-400">
                                    Current user
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Activity Log */}
        <TabsContent value="activity" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by user or details..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="max-w-xs h-8 text-sm"
              data-ocid="admin.search_input"
            />
            <Select value={logActionFilter} onValueChange={setLogActionFilter}>
              <SelectTrigger
                className="w-48 h-8 text-xs"
                data-ocid="admin.select"
              >
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredLog.length === 0 ? (
            <div
              className="text-center py-12 text-gray-400 text-sm"
              data-ocid="admin.empty_state"
            >
              No activity logs found
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <p className="text-xs text-gray-400 px-3 pt-3 pb-1">
                  Showing last {filteredLog.length} activities
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-[600px] w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        {["Timestamp", "User", "Action", "Details"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-3 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLog.map((log, idx) => (
                        <tr
                          key={log.id}
                          className={`border-b last:border-0 ${getActionColor(log.action)}`}
                          data-ocid={`admin.row.item.${idx + 1}`}
                        >
                          <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                            {formatLogDateTime(log.timestamp)}
                          </td>
                          <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                            {log.userName}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-xs font-medium">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-600">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create / Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Enter full name"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-1">
              <Label>
                Phone *{" "}
                <span className="text-xs font-normal text-gray-500">
                  (10 digits)
                </span>
              </Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v: UserRole) =>
                  setForm((f) => ({ ...f, role: v }))
                }
              >
                <SelectTrigger data-ocid="admin.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="backend_user">Backend User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>
                {editingUser
                  ? "Password (leave blank to keep current)"
                  : "Password *"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder={
                  editingUser ? "Leave blank to keep current" : "Set password"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="admin.submit_button"
            >
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-ocid="admin.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Application Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogOpen(false);
            setRejectTargetUser(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="h-5 w-5" />
              Reject Application
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {rejectTargetUser && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                <p className="font-semibold text-gray-900">
                  {rejectTargetUser.name}
                </p>
                <p className="text-sm text-gray-500">
                  {rejectTargetUser.email}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Rejection Reason <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder="Enter reason for rejection (minimum 5 characters)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="resize-none focus-visible:ring-rose-500"
                rows={3}
              />
              {rejectReason.length > 0 && rejectReason.trim().length < 5 && (
                <p className="text-xs text-rose-500">
                  Please enter at least 5 characters.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectTargetUser(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={rejectReason.trim().length < 5}
              onClick={() => {
                if (rejectTargetUser) {
                  rejectUser(rejectTargetUser.id, rejectReason.trim());
                  toast.success("Application rejected");
                }
                setRejectDialogOpen(false);
                setRejectTargetUser(null);
                setRejectReason("");
              }}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
