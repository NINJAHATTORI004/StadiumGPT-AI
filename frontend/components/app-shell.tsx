"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Bot,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDot,
  Home,
  Map,
  Menu,
  Moon,
  Shield,
  User,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard/fan", label: "Fan", icon: User },
  { href: "/dashboard/organizer", label: "Organizer", icon: ChartNoAxesCombined },
  { href: "/dashboard/security", label: "Security", icon: Shield },
  { href: "/dashboard/volunteer", label: "Volunteer", icon: Users },
  { href: "/ai-chat", label: "AI Chat", icon: Bot },
  { href: "/maps", label: "Maps", icon: Map },
  { href: "/notifications", label: "Alerts", icon: Bell }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1540px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 font-bold" aria-label="StadiumGPT AI home">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm text-white shadow-panel dark:bg-white dark:text-slate-950">
              SG
              <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-background bg-success" />
            </span>
            <span className="min-w-0">
              <span className="block truncate leading-5">StadiumGPT AI</span>
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:block">
                Matchday command OS
              </span>
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  pathname === item.href && "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold xl:flex">
              <CircleDot className="size-4 text-success" aria-hidden="true" />
              Live Ops
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
              <Moon aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-background p-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold">StadiumGPT AI</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X aria-hidden="true" />
            </Button>
          </div>
          <nav className="grid gap-2" aria-label="Mobile primary navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex h-12 items-center gap-3 rounded-lg px-3 font-semibold hover:bg-muted"
              >
                <item.icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {children}
    </div>
  );
}
