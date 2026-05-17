"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, BarChart3, Pencil, Wallet, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Ana sayfa", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/optimizer", label: "Başlık Optimizer", icon: Pencil },
  { href: "/budget", label: "Bütçe Pilotu", icon: Wallet },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-card-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8 h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-background">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Ticari<span className="gradient-text">Zeka</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            const active =
              it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/5 text-foreground"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="size-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/dashboard"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
        >
          <Sparkles className="size-4" />
          Demo'ya başla
        </Link>
      </div>
    </header>
  );
}
