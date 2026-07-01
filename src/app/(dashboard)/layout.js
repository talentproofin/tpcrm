import Link from "next/link";
import { DashboardNav } from "@/features/dashboard/components/DashboardNav";
import { DashboardUserMenu } from "@/features/dashboard/components/DashboardUserMenu";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
              TalentProof CRM
            </Link>
            <DashboardNav />
          </div>
          <DashboardUserMenu />
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl p-6 sm:p-8">{children}</main>
    </div>
  );
}
