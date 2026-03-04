'use client'
import { useState } from 'react'

interface SessionBannerProps {
  targetEmail?: string
  sessionId?: string
}

export function SessionBanner({ targetEmail, sessionId }: SessionBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (!sessionId || dismissed) return null
  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm font-medium">
      <span>⚠️ Impersonating {targetEmail ?? 'user'} — this session will expire in 30 minutes</span>
      <div className="flex items-center gap-3">
        <button
          onClick={async () => {
            await fetch('/api/impersonate/exit', { method: 'POST' })
            window.location.href = '/dashboard'
          }}
          className="bg-amber-950 text-amber-100 px-3 py-1 rounded text-xs hover:bg-amber-900"
        >
          Exit Impersonation →
        </button>
        <button onClick={() => setDismissed(true)} className="opacity-70 hover:opacity-100">✕</button>
      </div>
    </div>
  )
}
