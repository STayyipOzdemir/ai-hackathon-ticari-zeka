import type { Product, CategoryTrend, TrendKeyword } from "@/contracts";
import { CATEGORY_LABELS } from "@/contracts";

export function buildInsightsPrompt(
  products: Product[],
  categoryTrends: CategoryTrend[],
  topKeywords: TrendKeyword[]
): string {
  const productLines = products
    .map(
      (p) =>
        `- ${p.id} | "${p.title}" | kategori=${CATEGORY_LABELS[p.category]} | fiyat=${p.price}₺ | maliyet=${p.cost}₺ | stok=${p.stock} | 30g görüntülenme=${p.views30d} | 30g satış=${p.sales30d} | puan=${p.rating}`
    )
    .join("\n");

  const trendLines = categoryTrends
    .map(
      (t) =>
        `- ${CATEGORY_LABELS[t.category]}: ısı=${t.heat}/100, WoW=${(t.weekOverWeek * 100).toFixed(0)}%, top: ${t.topKeywords.join(", ")}`
    )
    .join("\n");

  const keywordLines = topKeywords
    .map(
      (k) =>
        `- "${k.keyword}" (${CATEGORY_LABELS[k.category]}): arama skoru=${k.searchScore}, WoW=${(k.weekOverWeek * 100).toFixed(0)}%, rekabet=${k.competition}`
    )
    .join("\n");

  return `Sen bir Türk e-ticaret pazarlama stratejistisin. KOBİ satıcı bir kataloğu ve bu haftanın CANLI Google Trends + arama verisini paylaştı. Görevin: en yüksek finansal getiriyi sağlayacak EN FAZLA 5 üründe öne çıkarma önerisi üret.

# Kategori Trendleri (canlı Google Trends, son 7 gün, TR)
${trendLines}

# Pazardaki Yükselen Anahtar Kelimeler (curated)
${keywordLines}

# Satıcının Kataloğu
${productLines}

# Görev
Her seçtiğin ürün için:
- productId: katalogtaki ID (kataloğda olmayan ID'yi UYDURMA)
- newTitle: SEO uyumlu, yükselen kelimeleri içeren, marketplace stiline uygun YENİ başlık (Türkçe, en fazla 100 karakter). Spam yapma, doğal kalsın.
- rationale: Niye bu ürünü seçtin (1-2 cümle). Trend + stok + marj mantığını belirt.
- matchedKeywords: Eşleştirdiğin anahtar kelimeler listesi.
- estimatedCtrLift: Yeni başlığın eski başlığa kıyasla beklenen TIK artış oranı (0.05 = %5). Gerçekçi ol: 0.05–0.45 aralığı.
- priorityScore: 1–100 arası, hangi sırada uygulanmalı.

Ayrıca tek cümlelik bir "weeklyHeadline" döndür: "Bu hafta şuna odaklan" tarzında.

Yalnızca seçilen ürünleri döndür, hepsini değil. Önceliği yüksek stok + yüksek marj + yüksek trend kesişimine ver.`;
}
