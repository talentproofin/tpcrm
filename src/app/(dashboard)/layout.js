import Link from "next/link";
import { FOLLOWUP_ROUTES } from "@/features/followups/constants/routes";
import { LEAD_ROUTES } from "@/features/leads/constants/routes";
import { REPORT_ROUTES } from "@/features/reports/constants/routes";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
              TalentProof CRM
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:gap-4">
              <Link
                href={FOLLOWUP_ROUTES.WORKSPACE}
                className="transition-colors hover:text-foreground"
              >
                Follow-ups
              </Link>
              <Link
                href={LEAD_ROUTES.LIST}
                className="transition-colors hover:text-foreground"
              >
                Leads
              </Link>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href={REPORT_ROUTES.DAILY}
                className="transition-colors hover:text-foreground"
              >
                Daily Report
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl p-6 sm:p-8">{children}</main>
    </div>
  );
}
