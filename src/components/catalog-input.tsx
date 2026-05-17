"use client";
import { useState } from "react";
import { Plus, Trash2, Sparkles, Pencil, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type Category, type Product } from "@/lib/types";
import { fmtNum, fmtTRY, cn } from "@/lib/utils";

interface Props {
  catalog: Product[];
  onChange: (next: Product[]) => void;
  onLoadDemo: () => void;
  onLoadAhmetDemo?: () => void;
  onClear: () => void;
  persona?: {
    name: string;
    shopName: string;
    city: string;
    tagline: string;
  };
}

const CATEGORIES: Category[] = [
  "kirtasiye",
  "elektronik",
  "moda-kadin",
  "moda-erkek",
  "ev-yasam",
  "kozmetik",
  "spor",
  "anne-bebek",
  "kitap",
  "supermarket",
];

interface DraftState {
  title: string;
  category: Category;
  price: string;
  cost: string;
  stock: string;
  views30d: string;
  sales30d: string;
  rating: string;
  reviewCount: string;
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  category: "kirtasiye",
  price: "",
  cost: "",
  stock: "",
  views30d: "",
  sales30d: "",
  rating: "",
  reviewCount: "",
};

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

function validateAndDerive(
  draft: DraftState
): { product: Omit<Product, "id"> } | string {
  const title = draft.title.trim();
  if (!title) return "Başlık zorunlu.";
  const price = Number(draft.price);
  if (!price || price <= 0) return "Fiyat 0'dan büyük olmalı.";
  const stock = Number(draft.stock);
  if (!stock || stock <= 0) return "Stok 0'dan büyük olmalı.";
  const cost =
    draft.cost.trim() === "" ? Math.round(price * 0.5) : Number(draft.cost);
  if (cost <= 0 || cost >= price)
    return "Maliyet fiyattan küçük ve 0'dan büyük olmalı.";

  const views30d =
    draft.views30d.trim() === ""
      ? stock * rand(8, 25)
      : Math.max(0, Math.round(Number(draft.views30d)));
  const sales30d =
    draft.sales30d.trim() === ""
      ? Math.max(1, Math.round(stock * (0.3 + Math.random() * 1.2)))
      : Math.max(0, Math.round(Number(draft.sales30d)));
  const ratingNum =
    draft.rating.trim() === ""
      ? Math.round((4.0 + Math.random() * 0.8) * 10) / 10
      : Math.max(0, Math.min(5, Number(draft.rating)));
  const reviewCount =
    draft.reviewCount.trim() === ""
      ? Math.round(views30d * (0.2 + Math.random() * 0.4))
      : Math.max(0, Math.round(Number(draft.reviewCount)));

  if (sales30d > views30d) {
    return "30g satış, görüntülenmeden büyük olamaz.";
  }

  return {
    product: {
      title,
      category: draft.category,
      price,
      cost,
      stock,
      views30d,
      sales30d,
      rating: ratingNum,
      reviewCount,
    },
  };
}

function draftFromProduct(p: Product): DraftState {
  return {
    title: p.title,
    category: p.category,
    price: String(p.price),
    cost: String(p.cost),
    stock: String(p.stock),
    views30d: String(p.views30d),
    sales30d: String(p.sales30d),
    rating: String(p.rating),
    reviewCount: String(p.reviewCount),
  };
}

export function CatalogInput({
  catalog,
  onChange,
  onLoadDemo,
  onLoadAhmetDemo,
  onClear,
  persona,
}: Props) {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = validateAndDerive(draft);
    if (typeof result === "string") {
      setError(result);
      return;
    }

    if (editingId) {
      onChange(
        catalog.map((p) =>
          p.id === editingId ? { ...result.product, id: p.id } : p
        )
      );
      setEditingId(null);
    } else {
      const nextNum = catalog.length + 1;
      const id = `P${String(nextNum).padStart(3, "0")}`;
      onChange([...catalog, { ...result.product, id }]);
    }
    setDraft(EMPTY_DRAFT);
    setAdvancedOpen(false);
  };

  const remove = (id: string) => {
    onChange(catalog.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft(draftFromProduct(p));
    setError(null);
    setAdvancedOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
    setAdvancedOpen(false);
  };

  return (
    <div className="glass rounded-2xl p-5 md:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {persona ? (
            <>
              <h3 className="text-lg font-semibold">
                {persona.shopName} <span className="text-muted text-sm">· {persona.city}</span>
              </h3>
              <p className="text-sm text-muted max-w-2xl">{persona.tagline}</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">Ürün kataloğu</h3>
              <p className="text-sm text-muted">
                {catalog.length === 0
                  ? "Hızlı bir ürün ekle, örnek kataloğu kullan veya gerçek bir satıcı senaryosunu dene."
                  : `${fmtNum(catalog.length)} ürün yüklü.`}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onLoadAhmetDemo && (
            <Button variant="outline" onClick={onLoadAhmetDemo}>
              <Sparkles className="size-4" />
              Ahmet Abi (gerçek senaryo)
            </Button>
          )}
          <Button variant="outline" onClick={onLoadDemo}>
            <Sparkles className="size-4" />
            Örnek Katalog
          </Button>
          {catalog.length > 0 && (
            <Button variant="ghost" onClick={onClear}>
              Temizle
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.7fr_auto] md:items-end">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">
              Başlık
            </label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Örn: Okul Çantası Sırt 25L"
              className="mt-1 w-full rounded-xl border border-card-border bg-white/5 px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">
              Kategori
            </label>
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as Category })
              }
              className="mt-1 w-full rounded-xl border border-card-border bg-white/5 px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-background">
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">
              Fiyat ₺
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              placeholder="449"
              className="mt-1 w-full rounded-xl border border-card-border bg-white/5 px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">
              Maliyet ₺
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={draft.cost}
              onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
              placeholder="boş = fiyat/2"
              className="mt-1 w-full rounded-xl border border-card-border bg-white/5 px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">
              Stok
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={draft.stock}
              onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
              placeholder="120"
              className="mt-1 w-full rounded-xl border border-card-border bg-white/5 px-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            {editingId && (
              <Button type="button" variant="ghost" onClick={cancelEdit}>
                Vazgeç
              </Button>
            )}
            <Button type="submit">
              <Plus className="size-4" />
              {editingId ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "size-3 transition-transform",
              advancedOpen && "rotate-180"
            )}
          />
          İleri (satış / görüntülenme / puan)
        </button>

        {advancedOpen && (
          <div className="grid gap-3 md:grid-cols-4 rounded-xl border border-card-border bg-white/[0.02] p-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">
                30g görüntülenme
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={draft.views30d}
                onChange={(e) =>
                  setDraft({ ...draft, views30d: e.target.value })
                }
                placeholder="otomatik"
                className="mt-1 w-full rounded-lg border border-card-border bg-white/5 px-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">
                30g satış (adet)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={draft.sales30d}
                onChange={(e) =>
                  setDraft({ ...draft, sales30d: e.target.value })
                }
                placeholder="otomatik"
                className="mt-1 w-full rounded-lg border border-card-border bg-white/5 px-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">
                Puan (0-5)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                max={5}
                value={draft.rating}
                onChange={(e) =>
                  setDraft({ ...draft, rating: e.target.value })
                }
                placeholder="otomatik"
                className="mt-1 w-full rounded-lg border border-card-border bg-white/5 px-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">
                Yorum sayısı
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={draft.reviewCount}
                onChange={(e) =>
                  setDraft({ ...draft, reviewCount: e.target.value })
                }
                placeholder="otomatik"
                className="mt-1 w-full rounded-lg border border-card-border bg-white/5 px-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <p className="text-xs text-muted">
        Boş bıraktığın alanlar stok/fiyata göre otomatik türetilir. Satıcı paneline
        gerçek API ile bağlanıldığında bu alanlar otomatik dolacak.
      </p>

      {catalog.length > 0 && (
        <div className="rounded-2xl border border-card-border overflow-hidden">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.02] sticky top-0">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted [&>th]:font-normal">
                  <th>Ürün</th>
                  <th>Kategori</th>
                  <th className="text-right">Fiyat</th>
                  <th className="text-right">Marj</th>
                  <th className="text-right">Stok</th>
                  <th className="text-right">30g satış</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((p) => {
                  const margin = p.price - p.cost;
                  const marginPct = (margin / p.price) * 100;
                  const isEditing = editingId === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-card-border/60 ${
                        isEditing ? "bg-brand/5" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted">
                            {p.id}
                          </span>
                          <span className="truncate max-w-[260px]">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone="neutral">
                          {CATEGORY_LABELS[p.category]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {fmtTRY(p.price)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span
                          className={
                            marginPct >= 40
                              ? "text-brand-2"
                              : marginPct >= 25
                                ? "text-foreground"
                                : "text-accent"
                          }
                        >
                          %{Math.round(marginPct)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {fmtNum(p.stock)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                        {fmtNum(p.sales30d)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => startEdit(p)}
                            className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-white/5"
                            title="Düzenle"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => remove(p.id)}
                            className="rounded-lg p-1.5 text-muted hover:text-danger hover:bg-danger/10"
                            title="Sil"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
