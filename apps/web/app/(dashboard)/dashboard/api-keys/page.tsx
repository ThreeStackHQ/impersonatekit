"use client";

import { useState } from "react";
import { KeyRound, Plus, Copy, Check, AlertTriangle } from "lucide-react";
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

interface ApiKeyEntry {
  id: string;
  prefix: string;
  name: string;
  createdAt: string;
  status: "active" | "revoked";
}

const demoKeys: ApiKeyEntry[] = [
  {
    id: "1",
    prefix: "ik_live_abc",
    name: "Production",
    createdAt: "2025-02-15",
    status: "active",
  },
  {
    id: "2",
    prefix: "ik_live_xyz",
    name: "Staging",
    createdAt: "2025-01-10",
    status: "active",
  },
  {
    id: "3",
    prefix: "ik_live_old",
    name: "Legacy (v1)",
    createdAt: "2024-11-01",
    status: "revoked",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApiKeysPage() {
  const [keys] = useState<ApiKeyEntry[]>(demoKeys);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyEntry | null>(null);
  const [keyName, setKeyName] = useState("");

  function handleCreate() {
    // In production this would call POST /api/workspace/api-keys
    const fakeKey = `ik_live_${Math.random().toString(36).slice(2, 38)}`;
    setNewKeyValue(fakeKey);
    setKeyName("");
  }

  function handleCopy() {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <KeyRound className="h-6 w-6 text-indigo-500" />
            API Keys
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage keys for the ImpersonateKit SDK.
          </p>
        </div>

        {/* Create Key Dialog */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setNewKeyValue(null);
              setCopied(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {newKeyValue ? "Key created" : "Create API key"}
              </DialogTitle>
              <DialogDescription>
                {newKeyValue
                  ? "Copy this key now. You won't be able to see it again."
                  : "Give your key a name so you can identify it later."}
              </DialogDescription>
            </DialogHeader>

            {newKeyValue ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  This key will only be shown once. Store it securely.
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 font-mono text-sm text-emerald-400">
                    {newKeyValue}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <DialogClose asChild>
                  <Button className="w-full">Done</Button>
                </DialogClose>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="key-name"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                  >
                    Key name
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    placeholder="e.g. Production"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!keyName.trim()}
                >
                  Generate key
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Keys table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-4 py-3 font-medium text-slate-400">Prefix</th>
              <th className="px-4 py-3 font-medium text-slate-400">Name</th>
              <th className="px-4 py-3 font-medium text-slate-400">Created</th>
              <th className="px-4 py-3 font-medium text-slate-400">Status</th>
              <th className="px-4 py-3 font-medium text-slate-400" />
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr
                key={key.id}
                className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-300">
                  {key.prefix}...
                </td>
                <td className="px-4 py-3 text-slate-200">{key.name}</td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(key.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={key.status === "active" ? "success" : "muted"}
                  >
                    {key.status === "active" ? "Active" : "Revoked"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {key.status === "active" && (
                    <Dialog
                      open={revokeTarget?.id === key.id}
                      onOpenChange={(open) => {
                        if (!open) setRevokeTarget(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setRevokeTarget(key)}
                        >
                          Revoke
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Revoke API key</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to revoke{" "}
                            <strong className="text-slate-200">
                              {key.name}
                            </strong>{" "}
                            ({key.prefix}...)? This cannot be undone and any
                            applications using this key will stop working.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex justify-end gap-3">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button variant="destructive">
                              Revoke key
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
