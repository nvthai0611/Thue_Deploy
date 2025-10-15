"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LayoutEditUser({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = useUserStore((state) => state.userId);
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "User Information", href: `/user/${userId}` },
    { name: "Edit profile" },
  ];

  const tabs = [
    {
      name: "Transaction History",
      href: "/user/history-transaction",
    },
    {
      name: "Property Document",
      href: "/user/property-document",
    },
  ];
  const pathname = usePathname();

  return (
    <div className="bg-primary-foreground py-6 min-h-[440px]">
      <div className="max-w-6xl mx-auto px-4">
        <SimpleBreadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 mt-6">
          <Card className="h-fit border border-primary-foreground  rounded-xl">
            <CardContent className="py-6">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  return (
                    <Link key={tab.href} href={tab.href}>
                      <div
                        className={`px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-semibold ${
                          isActive
                            ? ""
                            : "text-secondary-foreground/50 hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {tab.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-background dark:bg-zinc-900 border border-primary-foreground dark:border-zinc-700 rounded-xl shadow-sm">
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
