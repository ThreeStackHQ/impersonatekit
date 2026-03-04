import Link from "next/link";
import {
  ClipboardList,
  KeyRound,
  Users,
  ArrowRight,
} from "lucide-react";

const quickLinks = [
  {
    href: "/dashboard/sessions",
    icon: ClipboardList,
    title: "Sessions",
    description: "View impersonation audit trail",
  },
  {
    href: "/dashboard/api-keys",
    icon: KeyRound,
    title: "API Keys",
    description: "Manage SDK authentication keys",
  },
  {
    href: "/dashboard/team",
    icon: Users,
    title: "Team",
    description: "Invite members and manage roles",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">
        Manage impersonation sessions and API keys.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/5"
          >
            <link.icon className="h-6 w-6 text-indigo-500" />
            <h2 className="mt-3 font-semibold text-slate-100">{link.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{link.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 group-hover:text-indigo-300">
              Open
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
