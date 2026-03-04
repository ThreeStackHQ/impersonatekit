'use client'
import { ReactNode, Children, cloneElement, isValidElement } from 'react'

interface DialogProps { open?: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }
interface WithAsChild { asChild?: boolean; children?: ReactNode; className?: string; onClick?: () => void }

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function DialogTrigger({ children, asChild: _a, onClick }: WithAsChild) {
  if (_a && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick })
  }
  return <>{children}</>
}

export function DialogClose({ children, asChild: _a, onClick }: WithAsChild) {
  if (_a && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick })
  }
  return <button onClick={onClick} className="text-slate-400 hover:text-slate-200">{children}</button>
}

export function DialogContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl w-full max-w-md ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold text-slate-100 ${className}`}>{children}</h2>
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400 mt-1">{children}</p>
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-3 mt-6">{children}</div>
}
