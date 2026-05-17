import { ExternalLink, Cloud } from "lucide-react";

interface Props {
  className?: string;
}

export function VercelDeployTip({ className }: Props) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm ${className ?? ""}`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
        <Cloud className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground/90">
          Production'da bu sorun yok
        </div>
        <p className="mt-0.5 text-xs text-muted">
          Google Trends sunucumuzun IP'sine geçici limit verdi. Vercel'e deploy
          ettiğinde her serverless function farklı IP'den çıkar → rate-limit
          dağılır.
        </p>
        <a
          href="https://vercel.com/new"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-brand-2 hover:underline"
        >
          vercel.com/new
          <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
