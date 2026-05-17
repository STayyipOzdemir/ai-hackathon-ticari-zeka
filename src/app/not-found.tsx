import Link from "next/link";
import { Sparkles, Home, ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="glass relative w-full max-w-xl rounded-3xl p-10 text-center">
          <div className="pointer-events-none absolute -inset-12 -z-10 rounded-full bg-brand/20 blur-3xl" />
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-background">
            <Sparkles className="size-6" />
          </div>
          <h1 className="mt-6 text-6xl font-semibold tracking-tight gradient-text">
            404
          </h1>
          <p className="mt-3 text-lg text-foreground">
            Burada bir reklam bütçesi yok.
          </p>
          <p className="mt-2 text-sm text-muted">
            Aradığın sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              <Home className="size-4" />
              Ana sayfa
            </Link>
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm"
            >
              Dashboard'a git
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
