"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, ClipboardCheck, BookOpen, Cpu } from "@/lib/icons";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/oggi",     label: "Oggi",     icon: Home },
  { href: "/progetti", label: "Progetti", icon: FolderKanban },
  { href: "/review",   label: "Review",   icon: ClipboardCheck },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 border-r border-white/10 bg-black/30 backdrop-blur-md flex-col z-50">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Cpu size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">fralife</p>
            <p className="text-xs text-white/40 mt-0.5">v2.0</p>
          </div>
        </div>
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
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <Link
            href="/risorse"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all",
              pathname === "/risorse"
                ? "text-blue-400"
                : "text-white/30 hover:text-white/60"
            )}
          >
            <BookOpen size={13} />
            Risorse studio
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[hsl(222,47%,5%)]/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center">
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
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
          <Link
            href="/risorse"
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-center transition-colors",
              pathname === "/risorse" ? "text-blue-400" : "text-white/35 active:text-white/70"
            )}
          >
            <BookOpen size={20} />
            <span className="text-[9px] font-medium leading-none">Risorse</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
