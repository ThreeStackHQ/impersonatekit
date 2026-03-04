'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, LayoutDashboard, Key, Users, Settings, CreditCard } from 'lucide-react'

const navItems = [
  { href: '/dashboard/sessions', label: 'Sessions', icon: LayoutDashboard },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-100 font-bold text-lg">
          <ShieldCheck className="text-indigo-400" size={22} />
          ImpersonateKit
        </Link>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-1 transition-colors ${
                active
                  ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">impersonatekit.threestack.io</div>
      </div>
    </aside>
  )
}
