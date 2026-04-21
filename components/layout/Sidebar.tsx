"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Dumbbell,
  BriefcaseBusiness,
  Cpu,
  BarChart3,
  GraduationCap,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/study",     label: "Studio",    icon: GraduationCap },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/calendar",  label: "Calendario", icon: Calendar },
  { href: "/physical",  label: "Fisico",    icon: Dumbbell },
  { href: "/work",      label: "Lavoro",    icon: BriefcaseBusiness },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 border-r border-white/10 bg-black/30 backdrop-blur-md flex-col z-50">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Cpu size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">PersonalOS</p>
            <p className="text-xs text-white/40 mt-0.5">v1.0.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <Icon size={16} className={isActive ? "text-blue-400" : "text-white/40"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-white/25 leading-relaxed">
            OS Personale · Dati mock locali
          </p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ─────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[hsl(222,47%,5%)]/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Log Action CTA */}
        <div className="px-4 pt-2 pb-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
          >
            Log Action
          </button>
        </div>
        <div className="flex items-center">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-center transition-colors",
                  isActive ? "text-blue-400" : "text-white/35 active:text-white/70"
                )}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
