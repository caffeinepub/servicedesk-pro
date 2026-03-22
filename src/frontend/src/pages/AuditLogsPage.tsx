import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Filter,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  ScrollText,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Input } from "../components/ui/input";
import { useStore } from "../store";

type ActionType =
  | "ALL"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ISSUE"
  | "RETURN"
  | "LOGIN"
  | "LOGOUT";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border border-blue-200",
  DELETE: "bg-red-100 text-red-700 border border-red-200",
  ISSUE: "bg-amber-100 text-amber-700 border border-amber-200",
  RETURN: "bg-slate-100 text-slate-600 border border-slate-200",
  LOGIN: "bg-violet-100 text-violet-700 border border-violet-200",
  LOGOUT: "bg-gray-100 text-gray-600 border border-gray-200",
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  ISSUE: Send,
  RETURN: RotateCcw,
  LOGIN: LogIn,
  LOGOUT: LogOut,
};

const ACTIONS: ActionType[] = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "ISSUE",
  "RETURN",
  "LOGIN",
  "LOGOUT",
];

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return ts;
  }
}

function formatDateGroup(ts: string) {
  try {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return ts;
  }
}

function getDateGroupKey(ts: string) {
  try {
    return new Date(ts).toDateString();
  } catch {
    return ts;
  }
}

export default function AuditLogsPage() {
  const { currentUser, storePilotAuditLogs, navigate } = useStore();

  // All hooks must be at top level, before any early returns
  const [search, setSearch] = useState("");
  const [selectedActions, setSelectedActions] = useState<Set<ActionType>>(
    new Set(["ALL"]),
  );
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const q = search.toLowerCase();

  const filtered = useMemo(() => {
    return (storePilotAuditLogs ?? []).filter((log) => {
      const matchAction =
        selectedActions.has("ALL") ||
        selectedActions.has(log.action as ActionType);
      const matchSearch =
        !q ||
        log.userName.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.partCodes ?? []).some((c) => c.toLowerCase().includes(q));
      return matchAction && matchSearch;
    });
  }, [storePilotAuditLogs, selectedActions, q]);

  const dateGroups = useMemo(() => {
    const map = new Map<string, { label: string; logs: typeof filtered }>();
    for (const log of [...filtered].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )) {
      const key = getDateGroupKey(log.timestamp);
      if (!map.has(key))
        map.set(key, { label: formatDateGroup(log.timestamp), logs: [] });
      map.get(key)!.logs.push(log);
    }
    return map;
  }, [filtered]);

  const toggleAction = (a: ActionType) => {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (a === "ALL") return new Set(["ALL"]);
      next.delete("ALL");
      if (next.has(a)) next.delete(a);
      else next.add(a);
      if (next.size === 0) return new Set(["ALL"]);
      return next;
    });
  };

  const toggleDate = (key: string) =>
    setExpandedDates((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const toggleRole = (key: string) =>
    setExpandedRoles((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const toggleUser = (key: string) =>
    setExpandedUsers((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const renderDetails = (details: string, partCodes?: string[]) => {
    if (!partCodes || partCodes.length === 0) return <span>{details}</span>;
    const parts: (string | React.ReactElement)[] = [];
    let remaining = details;
    let keyIdx = 0;
    for (const code of partCodes) {
      const idx = remaining.indexOf(code);
      if (idx === -1) continue;
      if (idx > 0) parts.push(remaining.slice(0, idx));
      parts.push(
        <button
          type="button"
          key={keyIdx++}
          onClick={() => navigate("part-detail", undefined, code)}
          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          {code}
        </button>,
      );
      remaining = remaining.slice(idx + code.length);
    }
    if (remaining) parts.push(remaining);
    return <>{parts}</>;
  };

  // Early return AFTER hooks
  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-600">
            Access Restricted
          </h2>
          <p className="text-slate-400 mt-2">
            Audit logs are only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-gray-800 text-white px-6 py-6 rounded-2xl shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Audit Logs</h1>
              <p className="text-slate-300 text-sm">
                Complete record of all system activity
              </p>
            </div>
          </div>
          <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
            {filtered.length} records
          </span>
        </div>
      </div>

      <div className="max-w-6xl">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, module, details..."
                className="pl-9 border-slate-200"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Filter className="h-4 w-4 text-slate-400 self-center" />
            {ACTIONS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleAction(a)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                  selectedActions.has(a)
                    ? a === "ALL"
                      ? "bg-slate-700 text-white"
                      : `${ACTION_COLORS[a] ?? "bg-slate-200"} ring-1 ring-offset-1 ring-slate-400`
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Log groups */}
        <div className="space-y-3">
          {[...dateGroups.entries()].map(([dateKey, { label, logs }]) => {
            const isDateOpen = expandedDates.has(dateKey);
            const roleMap = new Map<string, typeof logs>();
            for (const log of logs) {
              if (!roleMap.has(log.userRole)) roleMap.set(log.userRole, []);
              roleMap.get(log.userRole)!.push(log);
            }

            return (
              <div
                key={dateKey}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleDate(dateKey)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-slate-400">
                    {isDateOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <span className="font-bold text-slate-700 flex-1">
                    {label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {roleMap.size} role{roleMap.size !== 1 ? "s" : ""}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {logs.length} {logs.length === 1 ? "entry" : "entries"}
                  </span>
                </button>

                {isDateOpen && (
                  <div className="border-t border-slate-100">
                    {[...roleMap.entries()].map(([role, roleLogs]) => {
                      const roleKey = `${dateKey}-${role}`;
                      const isRoleOpen = expandedRoles.has(roleKey);
                      const userMap = new Map<string, typeof roleLogs>();
                      for (const log of roleLogs) {
                        if (!userMap.has(log.userName))
                          userMap.set(log.userName, []);
                        userMap.get(log.userName)!.push(log);
                      }

                      return (
                        <div
                          key={role}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleRole(roleKey)}
                            className="w-full flex items-center gap-3 px-8 py-3 hover:bg-slate-50 transition-colors text-left"
                          >
                            <span className="text-slate-300">
                              {isRoleOpen ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <span className="font-semibold text-slate-600 text-sm capitalize flex-1">
                              {role}
                            </span>
                            <span className="text-xs text-slate-400">
                              {userMap.size} user{userMap.size !== 1 ? "s" : ""}
                            </span>
                            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                              {roleLogs.length} entries
                            </span>
                          </button>

                          {isRoleOpen && (
                            <div>
                              {[...userMap.entries()].map(
                                ([userName, userLogs]) => {
                                  const userKey = `${roleKey}-${userName}`;
                                  const isUserOpen = expandedUsers.has(userKey);
                                  return (
                                    <div
                                      key={userName}
                                      className="border-t border-slate-50"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => toggleUser(userKey)}
                                        className="w-full flex items-center gap-3 px-12 py-2.5 hover:bg-indigo-50/50 transition-colors text-left"
                                      >
                                        <span className="text-slate-300">
                                          {isUserOpen ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                          {userName.slice(0, 1)}
                                        </div>
                                        <span className="font-semibold text-slate-700 text-sm flex-1">
                                          {userName}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {userLogs.length} actions
                                        </span>
                                      </button>

                                      {isUserOpen && (
                                        <div className="px-12 pb-3">
                                          <table className="w-full text-xs">
                                            <thead>
                                              <tr className="text-slate-400 border-b border-slate-100">
                                                <th className="text-left py-2 font-semibold">
                                                  Action
                                                </th>
                                                <th className="text-left py-2 font-semibold">
                                                  Module
                                                </th>
                                                <th className="text-left py-2 font-semibold">
                                                  #ID
                                                </th>
                                                <th className="text-left py-2 font-semibold">
                                                  Details
                                                </th>
                                                <th className="text-right py-2 font-semibold">
                                                  Time
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {userLogs.map((log) => (
                                                <tr
                                                  key={log.id}
                                                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                                                >
                                                  <td className="py-2">
                                                    <span
                                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        ACTION_COLORS[
                                                          log.action
                                                        ] ??
                                                        "bg-slate-100 text-slate-600"
                                                      }`}
                                                    >
                                                      {(() => {
                                                        const I =
                                                          ACTION_ICONS[
                                                            log.action
                                                          ];
                                                        return I ? (
                                                          <I className="h-2.5 w-2.5" />
                                                        ) : null;
                                                      })()}
                                                      {log.action}
                                                    </span>
                                                  </td>
                                                  <td className="py-2 text-slate-600">
                                                    {log.module}
                                                  </td>
                                                  <td className="py-2 text-slate-400">
                                                    {log.recordId}
                                                  </td>
                                                  <td className="py-2 text-slate-600 max-w-xs">
                                                    {renderDetails(
                                                      log.details,
                                                      log.partCodes,
                                                    )}
                                                  </td>
                                                  <td className="py-2 text-slate-400 text-right whitespace-nowrap">
                                                    {formatTime(log.timestamp)}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {dateGroups.size === 0 && (
            <div className="text-center py-16 text-slate-400">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No audit logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
