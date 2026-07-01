"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { SETTINGS_ROUTES } from "../constants/routes";

const NAV_ITEMS = [
  { href: SETTINGS_ROUTES.ORGANIZATION, label: "Organization" },
  { href: SETTINGS_ROUTES.LOOKUPS, label: "Lookup Management" },
  { href: SETTINGS_ROUTES.ARCHIVE, label: "Archive Management" },
  { href: SETTINGS_ROUTES.SYSTEM, label: "System Information" },
];

/**
 * @param {{ children: React.ReactNode }} props
 */
export function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Organization configuration, lookups, archives, and system information.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b pb-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
