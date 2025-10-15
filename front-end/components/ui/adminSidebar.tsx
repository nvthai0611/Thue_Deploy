"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"
import {
  Users,
  BarChart3,
  Settings,
  // Shield,
  FileText,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    id: "users",
    label: "User Management",
    icon: Users,
    href: "/admin/manage/user",
  },
  {
    id: "housing-area",
    label: "Housing Area Management",
    icon: BarChart3,
    href: "/admin/manage/housing-area",
  },
  {
    id: "disputes",
    label: "Disputes",
    icon: FileText,
    href: "/admin/manage/disputes",
  },
  {
    id: "statistics", // Thêm menu item này
    label: "Statistics",
    icon: TrendingUp,
    href: "/admin/statistics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "#",
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="z-100">
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-[#181a20] border-r border-[#23272f] shadow-lg transition-all duration-300 lg:relative lg:translate-x-0",
          isCollapsed ? "-translate-x-full lg:w-16" : "translate-x-0 w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#23272f]">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">
                    Admin Panel
                  </h2>
                  <p className="text-sm text-gray-400">Management Dashboard</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 lg:hidden text-gray-300"
              >
                {isCollapsed ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center w-full h-12 px-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-[#23272f] text-white font-semibold shadow"
                      : "hover:bg-[#23272f] hover:text-white text-gray-600"
                  )}
                  onClick={() => setIsCollapsed(false)}
                >
                  <Icon className={cn("h-5 w-5", "mr-3")} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-2 text-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-[#23272f]">
              <Card className="p-3 bg-[#23272f] border-none">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      admin@example.com
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden bg-[#23272f] border-none text-gray-200 shadow-md"
        onClick={() => setIsCollapsed(false)}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
}
