"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInsightsStore } from "@/stores/insights-store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRESET_QUESTIONS = [
  "Bu hafta en yüksek öncelikli ürünüm neden bu?",
  "ROI 0.5x ne anlama geliyor, ne yapmalıyım?",
  "Düşük rekabetli kelimelere mi yatırım yapayım?",
  "Bütçemi nasıl artırırsam kâr katlanır?",
];

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const insights = useInsightsStore((s) => s.insights);
  const headline = useInsightsStore((s) => s.weeklyHeadline);
  const budgetPlan = useInsightsStore((s) => s.budgetPlan);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const buildContext = () => {
    const parts: string[] = [];
    if (headline) parts.push(`Bu haftanın başlığı: ${headline}`);
    if (insights.length > 0) {
      parts.push(
        `Top öneriler (${insights.length}):\n` +
          insights
            .slice(0, 5)
            .map(
              (i) =>
                `- ${i.productId} öncelik=${Math.round(i.priorityScore)} CTR=+${(i.estimatedCtrLift * 100).toFixed(0)}% ek ciro=${i.estimatedRevenueLift}₺ kelimeler=${i.matchedKeywords.join(", ")}`
            )
            .join("\n")
      );
    }
    if (budgetPlan) {
      parts.push(
        `Bütçe planı: toplam ${budgetPlan.totalBudget}₺ → kâr ${budgetPlan.expectedTotalProfit}₺ (ROI ${budgetPlan.expectedRoi.toFixed(2)}x). En iyi ROI: ${budgetPlan.allocations[0]?.keyword} (${budgetPlan.allocations[0]?.roi.toFixed(2)}x).`
      );
    }
    return parts.join("\n\n");
  };

  const ask = async (question: string) => {
    if (!question.trim() || streaming) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: buildContext() }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: `Hata: ${text}` };
          return next;
        });
        return;
      }
      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }
    } catch (err) {
      if (err instanceof Error && !err.message.includes("abort")) {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: `Hata: ${err.message}`,
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm shadow-2xl"
        aria-label="AI Asistanı"
      >
        <MessageCircle className="size-4" />
        AI Asistanı
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md flex flex-col border-l border-card-border bg-background transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between border-b border-card-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-background">
              <Sparkles className="size-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">AI Asistanı</div>
              <div className="text-xs text-muted">Gemini 2.5 Flash</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Ekrandaki verilerin üstüne soru sor. Cevap için Gemini, mevcut
                kataloğunu, son insights'larını ve bütçe planını bağlam olarak
                görür.
              </p>
              <div className="space-y-2">
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="block w-full rounded-xl border border-card-border bg-white/[0.02] px-3 py-2 text-left text-xs text-foreground/80 hover:bg-white/5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                m.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "size-7 shrink-0 rounded-full grid place-items-center text-xs",
                  m.role === "user"
                    ? "bg-brand/20 text-brand"
                    : "bg-brand-2/20 text-brand-2"
                )}
              >
                {m.role === "user" ? "Sen" : <Bot className="size-3.5" />}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-brand/10 border border-brand/30"
                    : "bg-white/5 border border-card-border"
                )}
              >
                {m.content || (
                  <span className="inline-block size-2 animate-pulse rounded-full bg-brand-2" />
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="border-t border-card-border p-4"
        >
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir şey sor..."
              disabled={streaming}
              className="flex-1 rounded-xl border border-card-border bg-white/5 px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="btn-primary inline-flex size-10 items-center justify-center rounded-xl disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
