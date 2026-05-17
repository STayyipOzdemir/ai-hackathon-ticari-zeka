import type { Product, CategoryTrend, TrendKeyword } from "@/contracts";
import { CATEGORY_LABELS } from "@/contracts";

export function buildBudgetPrompt(
  products: Product[],
  totalBudget: number,
  categoryTrends: CategoryTrend[],
  topKeywords: TrendKeyword[],
  suggestedKeywords: string[] = []
): string {
  const productLines = products
    .map(
      (p) =>
        `- ${p.id} | "${p.title}" | kat=${CATEGORY_LABELS[p.category]} | fiyat=${p.price}₺ | marj=${p.price - p.cost}₺ (%${Math.round(((p.price - p.cost) / p.price) * 100)}) | stok=${p.stock} | satış30g=${p.sales30d}`
    )
    .join("\n");

  const trendLines = categoryTrends
    .map(
      (t) =>
        `- ${CATEGORY_LABELS[t.category]} (kategori=${t.category}): ısı=${t.heat}, WoW=${(t.weekOverWeek * 100).toFixed(0)}%`
    )
    .join("\n");

  const keywordLines = topKeywords
    .map(
      (k) =>
        `- "${k.keyword}" (kategori=${k.category}): arama=${k.searchScore}, WoW=${(k.weekOverWeek * 100).toFixed(0)}%, rekabet=${k.competition}`
    )
    .join("\n");

  const suggestedBlock =
    suggestedKeywords.length > 0
      ? `\n# Insights ekranından gelen ÖNCELİKLİ kelimeler\nBu kelimeler bu hafta öne çıkarmaya değer ürünlerle eşleşti. Mümkünse bütçenin büyük kısmını bunlara ayır:\n${suggestedKeywords.map((k) => `- "${k}"`).join("\n")}\n`
      : "";

  return `Sen Türk e-ticaret performans pazarlama uzmanısın. KOBİ satıcının haftalık reklam bütçesi: ${totalBudget}₺. Görev: bu bütçeyi EN FAZLA 6 anahtar kelimeye dağıt. Her allocation için piyasa parametrelerini (rekabet seviyesi + dönüşüm oranı tahmini) ve hangi ürünleri tetikleyeceğini belirt — finansal çıktıyı (tıklama, ciro, kâr, ROI) ben senin parametrelerinle hesaplayacağım, sen sadece tahminlemesini yap.
${suggestedBlock}

# Kategori Trendleri (canlı Google Trends)
${trendLines}

# Yükselen Anahtar Kelimeler (curated)
${keywordLines}

# Satıcının Stoğu
${productLines}

# Her allocation için döndürmen gerekenler
- keyword: hedef anahtar kelime
- category: ürün kategorisi (sabit isim: kirtasiye | elektronik | moda-kadin | moda-erkek | ev-yasam | kozmetik | spor | anne-bebek | kitap | supermarket)
- recommendedBudget: TL olarak bu kelimeye ayrılacak bütçe (toplamları = ${totalBudget})
- competition: "dusuk" | "orta" | "yuksek" (CPC bu seviyeye göre hesaplanır)
- conversionRate: tahmini dönüşüm oranı (0.005 - 0.12 arası, ondalık. Örn: 0.03 = %3)
- matchedProductIds: bu kelime tetiklendiğinde satılma ihtimali olan ürünlerin ID'leri (katalogdan)
- rationale: 1 cümlelik gerekçe

Yalnızca satıcının stoğundaki ürünlerle eşleşen kelimeleri seç. Tüm bütçeyi dağıt. Bütçeyi yüksek-trend + yüksek-marj + düşük-rekabet kesişimine yığ.

Ayrıca summary alanında 2 cümlelik jüri-friendly özet ver.`;
}
