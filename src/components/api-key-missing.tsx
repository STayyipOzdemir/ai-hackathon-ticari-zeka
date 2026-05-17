import { KeyRound, ExternalLink } from "lucide-react";

interface Props {
  className?: string;
}

export function ApiKeyMissing({ className }: Props) {
  return (
    <div
      className={`rounded-2xl border border-accent/30 bg-accent/5 p-5 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
          <KeyRound className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">
            Gemini API anahtarı tanımlı değil
          </h3>
          <p className="mt-1 text-sm text-muted">
            Gemini bağlı özellikler (öneriler, başlık optimizer, bütçe pilotu)
            için sunucu tarafında bir anahtar gerekli. Canlı Google Trends ve
            örnek katalog anahtar olmadan da çalışır.
          </p>
          <ol className="mt-3 list-decimal pl-4 text-sm text-foreground/85 space-y-1">
            <li>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-2 hover:underline inline-flex items-center gap-1"
              >
                aistudio.google.com/apikey
                <ExternalLink className="size-3" />
              </a>
              'den ücretsiz bir anahtar al.
            </li>
            <li>
              Proje köküne{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-xs">
                .env.local
              </code>{" "}
              dosyası oluştur, içine yaz:
              <pre className="mt-1 overflow-x-auto rounded-lg border border-card-border bg-black/40 p-2 text-xs">
                <code>GEMINI_API_KEY=...</code>
              </pre>
            </li>
            <li>
              Terminalde{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-xs">
                npm run dev
              </code>{" "}
              komutunu yeniden başlat. Sayfayı yenile.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
