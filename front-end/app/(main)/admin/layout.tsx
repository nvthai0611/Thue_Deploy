"use client";

import { Sidebar } from "@/components/ui/adminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-auto bg-neutral-900">
      <Sidebar />
      <main className="flex-1">
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">{children}</div>
      </main>
    </div>
  );
}
