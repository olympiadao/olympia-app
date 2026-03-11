"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  Users,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/proposals", label: "Proposals", icon: ScrollText },
  { href: "/members", label: "Members", icon: Users },
  { href: "/treasury", label: "Treasury", icon: Landmark },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border-default bg-bg-surface/95 backdrop-blur-sm md:hidden">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors",
              isActive
                ? "text-brand-green"
                : "text-text-subtle hover:text-text-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
