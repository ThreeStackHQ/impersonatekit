import { ReactNode } from 'react'

interface BadgeProps {
  className?: string
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'muted' | 'secondary'
}

const variantStyles: Record<string, string> = {
  default: 'bg-indigo-500/20 text-indigo-300',
  success: 'bg-green-500/20 text-green-300',
  warning: 'bg-yellow-500/20 text-yellow-300',
  destructive: 'bg-red-500/20 text-red-300',
  outline: 'border border-slate-600 text-slate-400',
  muted: 'bg-slate-700 text-slate-400',
  secondary: 'bg-slate-700 text-slate-300',
}

export function Badge({ className = '', children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant] ?? variantStyles.default} ${className}`}>
      {children}
    </span>
  )
}
