import Link from "next/link";
import { Shield, Lock, Timer, ShieldCheck, Check, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Audit Trail",
    description:
      "Every session logged. Who impersonated whom, when, and for how long.",
  },
  {
    icon: Timer,
    title: "Auto-Expire",
    description:
      "15-minute tokens, 30-minute sessions. No forgotten access ever.",
  },
  {
    icon: ShieldCheck,
    title: "RBAC",
    description:
      "Only workspace owners and admins can impersonate. Granular role control.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "For trying things out",
    features: [
      "5 sessions / month",
      "1 workspace",
      "30-day audit retention",
      "Community support",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Indie",
    price: "$9",
    period: "/mo",
    description: "For growing SaaS teams",
    badge: "MOST POPULAR",
    features: [
      "Unlimited sessions",
      "3 workspaces",
      "90-day audit retention",
      "Email support",
      "CSV export",
    ],
    cta: "Start for free",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For scaling companies",
    features: [
      "Unlimited sessions",
      "Unlimited workspaces",
      "1-year audit retention",
      "CSV + Slack integration",
      "Priority support",
      "SSO (coming soon)",
    ],
    cta: "Start for free",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <header className="border-b border-slate-800/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            <span className="text-lg font-bold text-slate-100">
              ImpersonateKit
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-24 pt-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
          Log in as any user.{" "}
          <span className="text-indigo-400">Safely.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Secure user impersonation with full audit trail, auto-expiring
          sessions, and role-based access control. Built for SaaS support teams.
        </p>

        {/* Code snippet */}
        <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-left">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-amber-500/60" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            <span className="ml-2 text-xs text-slate-500">impersonate.ts</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code>
              <span className="text-violet-400">const</span>
              <span className="text-slate-300">{" { "}</span>
              <span className="text-slate-200">url</span>
              <span className="text-slate-300">{" } = "}</span>
              <span className="text-violet-400">await</span>
              <span className="text-slate-300"> ik.</span>
              <span className="text-indigo-400">impersonate</span>
              <span className="text-slate-300">{"({"}</span>
              {"\n"}
              <span className="text-slate-300">{"  "}</span>
              <span className="text-slate-200">adminId</span>
              <span className="text-slate-300">{": "}</span>
              <span className="text-emerald-400">{`'admin_123'`}</span>
              <span className="text-slate-300">,</span>
              {"\n"}
              <span className="text-slate-300">{"  "}</span>
              <span className="text-slate-200">targetUserId</span>
              <span className="text-slate-300">{": "}</span>
              <span className="text-emerald-400">{`'user_456'`}</span>
              {"\n"}
              <span className="text-slate-300">{"})"}</span>
            </code>
          </pre>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100"
          >
            View docs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800/50 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-100">
            Built for compliance, not just convenience
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            Every impersonation session is tracked, timed, and controlled.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <feature.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor comparison */}
      <section className="border-t border-slate-800/50">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-100">
            Why ImpersonateKit?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
            Enterprise-grade impersonation without enterprise pricing.
          </p>

          <div className="mt-12 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-6 py-4 font-medium text-slate-400">
                    Feature
                  </th>
                  <th className="px-6 py-4 font-medium text-slate-400">
                    Auth0 Enterprise
                  </th>
                  <th className="px-6 py-4 font-medium text-indigo-400">
                    ImpersonateKit
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["User impersonation", "Yes", "Yes"],
                  ["Audit trail", "Basic", "Full (who, when, how long)"],
                  ["Auto-expire sessions", "No", "Yes (configurable)"],
                  ["RBAC for impersonation", "Enterprise only", "All plans"],
                  ["CSV export", "No", "Yes"],
                  ["Starting price", "$800+/mo", "$9/mo"],
                ].map(([feature, auth0, ik]) => (
                  <tr
                    key={feature}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-6 py-3 text-slate-300">{feature}</td>
                    <td className="px-6 py-3 text-slate-500">{auth0}</td>
                    <td className="px-6 py-3 font-medium text-slate-200">
                      {ik}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-slate-800/50 bg-slate-900/30"
      >
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-100">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
            Start free, upgrade when you need more.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 ${
                  plan.highlighted
                    ? "border-indigo-500 bg-indigo-500/5"
                    : "border-slate-800 bg-slate-900/50"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-100">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-100">
                    {plan.price}
                  </span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <Check className="h-4 w-4 text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-lg py-2.5 text-center text-sm font-semibold ${
                    plan.highlighted
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "border border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-400">
                ImpersonateKit
              </span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} ImpersonateKit. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
