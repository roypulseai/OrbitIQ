import { AppShell } from "@/components/layout/AppShell";

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
