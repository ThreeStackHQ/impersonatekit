"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SessionInfo {
  targetEmail: string;
  expiresAt: number; // unix timestamp in ms
}

export function SessionBanner() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const cookieValue = getCookie("ik_impersonation_session_id");
    if (!cookieValue) return;

    // Cookie format: sessionId:targetEmail:expiresAtTimestamp
    const parts = cookieValue.split(":");
    if (parts.length >= 3) {
      setSession({
        targetEmail: parts[1],
        expiresAt: parseInt(parts[2], 10),
      });
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    function tick() {
      const diff = Math.max(0, Math.floor((session!.expiresAt - Date.now()) / 1000));
      setRemaining(diff);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-500/90 px-4 py-2 text-sm font-medium text-slate-950">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>
          Impersonating {session.targetEmail} &mdash; session expires in{" "}
          {formatCountdown(remaining)}.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/api/impersonate/exit"
          className="rounded-md bg-slate-950/20 px-3 py-1 text-xs font-semibold hover:bg-slate-950/30"
        >
          Exit &rarr;
        </a>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss banner">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
