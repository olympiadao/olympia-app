"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  Users,
  Landmark,
  Shield,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/proposals", label: "Proposals", icon: ScrollText },
  { href: "/members", label: "Members", icon: Users },
  { href: "/treasury", label: "Treasury", icon: Landmark },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border-default bg-bg-surface md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border-default px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green">
          <Landmark className="h-4 w-4 text-bg-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight">Olympia</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-green-subtle text-brand-green"
                  : "text-text-muted hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-default px-3 py-3">
        <Link
          href="/config"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
            pathname === "/config"
              ? "text-brand-green"
              : "text-text-subtle hover:text-text-muted"
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Demo Config
        </Link>
        <p className="mt-1 px-3 text-xs text-text-subtle">
          Demo v0.1 · Mordor Testnet
        </p>
      </div>
    </aside>
  );
}
