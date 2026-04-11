"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/physical", label: "Fisico", icon: Dumbbell },
  { href: "/work", label: "Lavoro", icon: BriefcaseBusiness },
  { href: "/study", label: "Studio", icon: GraduationCap },
] as const;

export function Sidebar() {
  const pathname = usePathname();

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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-white/10 bg-[hsl(222,47%,5%)]/95 backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-center transition-colors",
                isActive ? "text-blue-400" : "text-white/35 active:text-white/70"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
