import { Sidebar } from "@/components/layout/sidebar";
import { SessionBanner } from "@/components/layout/session-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionBanner />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
