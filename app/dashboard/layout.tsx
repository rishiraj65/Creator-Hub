import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Dashboard",
  description: "Manage your orders, saved tools, and profile. Monitor live market data and account activity.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
