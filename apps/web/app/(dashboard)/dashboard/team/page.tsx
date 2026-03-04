"use client";

import { useState } from "react";
import { Users, UserPlus, Trash2, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type MemberRole = "owner" | "admin" | "member";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: MemberRole;
  sentAt: string;
}

const roleConfig: Record<MemberRole, { label: string; variant: "default" | "success" | "muted" }> = {
  owner: { label: "Owner", variant: "success" },
  admin: { label: "Admin", variant: "default" },
  member: { label: "Member", variant: "muted" },
};

const demoMembers: TeamMember[] = [
  {
    id: "1",
    name: "Anna de Vries",
    email: "anna@acme.com",
    role: "owner",
    joinedAt: "2024-06-01",
  },
  {
    id: "2",
    name: "Bob Chen",
    email: "bob@acme.com",
    role: "admin",
    joinedAt: "2024-09-15",
  },
  {
    id: "3",
    name: "Carlos Martinez",
    email: "carlos@acme.com",
    role: "member",
    joinedAt: "2025-01-20",
  },
];

const demoInvites: PendingInvite[] = [
  {
    id: "inv1",
    email: "newdev@acme.com",
    role: "member",
    sentAt: "2025-03-01",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TeamPage() {
  const [members] = useState<TeamMember[]>(demoMembers);
  const [invites] = useState<PendingInvite[]>(demoInvites);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <Users className="h-6 w-6 text-indigo-500" />
            Team
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage workspace members and roles.
          </p>
        </div>

        {/* Invite Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="invite-email"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="invite-role"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button
                className="w-full"
                disabled={!inviteEmail.trim()}
                onClick={() => {
                  setInviteOpen(false);
                  setInviteEmail("");
                  setInviteRole("member");
                }}
              >
                Send invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-4 py-3 font-medium text-slate-400">Name</th>
              <th className="px-4 py-3 font-medium text-slate-400">Email</th>
              <th className="px-4 py-3 font-medium text-slate-400">Role</th>
              <th className="px-4 py-3 font-medium text-slate-400">Joined</th>
              <th className="px-4 py-3 font-medium text-slate-400" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const cfg = roleConfig[member.role];
              return (
                <tr
                  key={member.id}
                  className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 text-slate-200">{member.name}</td>
                  <td className="px-4 py-3 text-slate-400">{member.email}</td>
                  <td className="px-4 py-3">
                    {member.role === "owner" ? (
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    ) : (
                      <select
                        value={member.role}
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                        onChange={() => {
                          // In production: PATCH /api/workspace/members/:id
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {formatDate(member.joinedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.role !== "owner" && (
                      <Dialog
                        open={removeTarget?.id === member.id}
                        onOpenChange={(open) => {
                          if (!open) setRemoveTarget(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => setRemoveTarget(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove team member</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove{" "}
                              <strong className="text-slate-200">
                                {member.name}
                              </strong>{" "}
                              ({member.email}) from this workspace? They will
                              lose access immediately.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 flex justify-end gap-3">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button variant="destructive">
                                Remove member
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-200">
            <Clock className="h-5 w-5 text-slate-500" />
            Pending invitations
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Role
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Sent
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400" />
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr
                    key={invite.id}
                    className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-slate-300">
                        <Mail className="h-4 w-4 text-slate-500" />
                        {invite.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleConfig[invite.role].variant}>
                        {roleConfig[invite.role].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(invite.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
