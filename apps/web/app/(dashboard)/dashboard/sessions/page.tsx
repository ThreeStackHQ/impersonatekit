"use client";

import { useState } from "react";
import {
  ClipboardList,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SessionStatus = "active" | "expired" | "exited";

interface Session {
  id: string;
  adminEmail: string;
  targetEmail: string;
  ipAddress: string;
  startedAt: string;
  duration: string;
  exitReason: string | null;
  status: SessionStatus;
}

const statusConfig: Record<
  SessionStatus,
  { label: string; variant: "success" | "muted" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  expired: { label: "Expired", variant: "muted" },
  exited: { label: "Exited", variant: "default" },
};

// Demo data for skeleton/placeholder
const demoSessions: Session[] = [
  {
    id: "1",
    adminEmail: "admin@acme.com",
    targetEmail: "jane@customer.com",
    ipAddress: "192.168.1.42",
    startedAt: "2025-03-04T14:32:00Z",
    duration: "12m 34s",
    exitReason: null,
    status: "active",
  },
  {
    id: "2",
    adminEmail: "admin@acme.com",
    targetEmail: "bob@customer.com",
    ipAddress: "10.0.0.5",
    startedAt: "2025-03-04T10:15:00Z",
    duration: "30m 00s",
    exitReason: "Auto-expired",
    status: "expired",
  },
  {
    id: "3",
    adminEmail: "support@acme.com",
    targetEmail: "alice@enterprise.io",
    ipAddress: "172.16.0.1",
    startedAt: "2025-03-03T16:45:00Z",
    duration: "8m 12s",
    exitReason: "Manual exit",
    status: "exited",
  },
];

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
        </td>
      ))}
    </tr>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsPage() {
  const [adminFilter, setAdminFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [isLoading] = useState(false);

  const sessions = demoSessions;

  const filtered = sessions.filter((s) => {
    if (adminFilter && !s.adminEmail.toLowerCase().includes(adminFilter.toLowerCase())) {
      return false;
    }
    if (targetFilter && !s.targetEmail.toLowerCase().includes(targetFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <ClipboardList className="h-6 w-6 text-indigo-500" />
            Sessions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Audit trail of all impersonation sessions.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/workspace/sessions/export">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by admin email..."
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by target email..."
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" size="default" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Date range
        </Button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-4 py-3 font-medium text-slate-400">Admin</th>
              <th className="px-4 py-3 font-medium text-slate-400">
                Target User
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">IP</th>
              <th className="px-4 py-3 font-medium text-slate-400">Started</th>
              <th className="px-4 py-3 font-medium text-slate-400">Duration</th>
              <th className="px-4 py-3 font-medium text-slate-400">
                Exit Reason
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-slate-700" />
                  <p className="mt-3 text-sm font-medium text-slate-400">
                    No sessions found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Impersonation sessions will appear here once created via the
                    API.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((session) => {
                const cfg = statusConfig[session.status];
                return (
                  <tr
                    key={session.id}
                    className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3 text-slate-200">
                      {session.adminEmail}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {session.targetEmail}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {session.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(session.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {session.duration}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {session.exitReason ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filtered.length} session{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
