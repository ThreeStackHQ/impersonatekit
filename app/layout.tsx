import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ImpersonateKit",
  description: "Safe user impersonation for SaaS support & debugging",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
