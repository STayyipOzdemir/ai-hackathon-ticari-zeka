import type { Product, CategoryTrend, TrendKeyword } from "@/contracts";
import { CATEGORY_LABELS } from "@/contracts";

export function buildTitleOptimizePrompt(
  product: Product,
  categoryTrend: CategoryTrend | undefined,
  relevantKeywords: TrendKeyword[]
): string {
  const trendBlock = categoryTrend
    ? `Bu hafta "${CATEGORY_LABELS[product.category]}" kategorisi ısı=${categoryTrend.heat}/100, WoW=${(categoryTrend.weekOverWeek * 100).toFixed(0)}%. Top kelimeler: ${categoryTrend.topKeywords.join(", ")}`
    : "Kategori trendi yok.";

  const keywordBlock =
    relevantKeywords.length > 0
      ? relevantKeywords
          .map(
            (k) =>
              `- "${k.keyword}" arama=${k.searchScore}, WoW=${(k.weekOverWeek * 100).toFixed(0)}%, rekabet=${k.competition}`
          )
          .join("\n")
      : "Kategoride yükselen kelime yok.";

  return `Sen Türk e-ticaret pazaryeri (Trendyol/Hepsiburada tarzı) için SEO başlık uzmanısın.

Ürün:
- ID: ${product.id}
- Mevcut başlık: "${product.title}"
- Kategori: ${CATEGORY_LABELS[product.category]}
- Fiyat: ${product.price}₺
- Satış (30g): ${product.sales30d}, Görüntülenme (30g): ${product.views30d}
- Puan: ${product.rating} (${product.reviewCount} yorum)

Pazar verisi:
${trendBlock}

Yükselen kelimeler (bu kategoride):
${keywordBlock}

Görev: Bu ürün için 1 ana başlık + 2 alternatif başlık öner. Her biri farklı açıdan yaklaşsın.

Kurallar:
- Türkçe, doğal, spam değil
- En fazla 100 karakter
- Yükselen bir veya iki anahtar kelimeyi başa yakın yerleştir
- Pazaryeri stiline uygun (marka olmadığından modeli/özelliği vurgula)
- Mevcut başlığın özünü kaybetme

Ana öneri için "rationale" (1-2 cümle açıklama).
Alternatifler için "angle" (kısa etiket: ör. "fayda odaklı", "demografik", "fiyat/kalite", "duygusal", "uzunluk avantajı").

Yanıt JSON:
- originalTitle (girdiyi aynen)
- newTitle (ana öneri)
- rationale (1-2 cümle, niye bu kelimeler ve sıralama)
- matchedKeywords (ana öneride kullandığın yükselen kelimeler)
- estimatedCtrLift (0.05–0.45 arası gerçekçi tıklama artış oranı)
- alternatives: 2 öğeli dizi, her birinde { title, angle, estimatedCtrLift, matchedKeywords }`;
}
