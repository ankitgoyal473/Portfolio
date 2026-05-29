import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | AGentX",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
