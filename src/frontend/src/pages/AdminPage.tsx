import { CheckCircle, UserCheck, Users, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useStore } from "../store";
import type { UserRole } from "../types";

export default function AdminPage() {
  const { users, currentUser, approveUser, rejectUser, updateUserRole } =
    useStore();
  const isAdmin = currentUser?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="text-center py-20 text-gray-500">
        Access denied. Admins only.
      </div>
    );
  }

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500">Manage users and approvals</p>
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

      {/* Pending Approvals */}
      {pending.length > 0 && (
        <Card className="shadow-sm border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-700 flex items-center gap-2">
              <Users className="h-4 w-4" /> Pending Approvals ({pending.length})
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
                    onClick={() => approveUser(u.id)}
                    className="bg-green-600 hover:bg-green-700 h-8"
                    data-ocid="admin.confirm_button"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectUser(u.id)}
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

      {/* All Users */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="border-b">
                  {["Name", "Email", "Phone", "Role", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs">
                      {u.email}
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {u.phone}
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        value={u.role}
                        onValueChange={(v: UserRole) => updateUserRole(u.id, v)}
                        disabled={u.id === currentUser?.id}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="backend_user">
                            Backend User
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                    <td className="px-3 py-3">
                      {u.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => approveUser(u.id)}
                            className="h-6 text-xs bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectUser(u.id)}
                            className="h-6 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {u.id === currentUser?.id && (
                        <span className="text-xs text-gray-400">
                          Current user
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
