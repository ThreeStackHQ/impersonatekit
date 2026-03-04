import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  children?: ReactNode
}

const variantStyles: Record<string, string> = {
  default: 'bg-indigo-500 text-white hover:bg-indigo-600',
  outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800',
  ghost: 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
}

const sizeStyles: Record<string, string> = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild: _asChild, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
