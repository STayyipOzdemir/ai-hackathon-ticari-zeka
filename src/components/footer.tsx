import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-card-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-background">
            <Sparkles className="size-3.5" />
          </span>
          <span>
            <strong className="text-foreground">TicariZeka</strong> · Gemini ile
            geliştirildi
          </span>
        </div>
        <div>
          BTK Akademi Hackathon 2026 · Finans + E-Ticaret · Demo amaçlıdır,
          gerçek pazarlama kararlarında doğrulayın.
        </div>
      </div>
    </footer>
  );
}
