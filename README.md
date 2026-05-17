# TicariZeka

**KOBİ E-Ticaret Satıcıları için AI Reklam & Bütçe Pilotu** — Google Gemini ile çalışan, BTK Akademi Hackathon 2026 için geliştirilmiş açık kaynak demo.

> Stoğunu yükle, Gemini sana bu hafta hangi ürünü, hangi başlıkla, hangi reklam bütçesiyle pazarlayacağını ve **kaç lira kâr bırakacağını** söylesin.

---

## Tema uyumu (Finans + E-Ticaret)

- **E-ticaret bacağı:** trend analizi, ürün başlığı SEO optimizasyonu, kategori ısı haritası, canlı Google Trends.
- **Finans bacağı:** kelime başına bütçe dağıtımı, beklenen tıklama → dönüşüm → ciro → **net kâr ve ROI** modellemesi.

Her öneri tek bir finansal çıktıyla sunulur: "şu bütçe → şu kâr beklenir."

---

## Özellikler

1. **Landing** — problem + 3 adım + finansal vurgu.
2. **Dashboard**
   - CSV yükleme veya örnek katalog (50 ürün, 10 kategori).
   - Kategori ısı haritası (cache'lenmiş haftalık skorlar).
   - **Canlı Google Trends widget'ı:** sunucu tarafı `google-trends-api` ile gerçek zamanlı sorgu (1g / 7g / 1ay / 3ay), yükselen + en çok aranan ilgili sorgular, sparkline.
   - **Gemini önerileri:** stok + marj + trend kesişiminde top 5 ürün için yeniden başlık + öncelik skoru + tahmini CTR ve ek ciro.
3. **Başlık Optimizer**
   - Ürün seç → Gemini eski başlığı yükselen kelimelerle yeniden yazsın.
   - Eski vs yeni karşılaştırma, "neden" açıklaması, tahmini CTR artışı + 30g ek ciro.
4. **Bütçe Pilotu** (finans bacağı odak)
   - Haftalık reklam bütçesini gir.
   - Gemini kelime başına dağıtım + tıklama/dönüşüm/ciro/net kâr/ROI hesabı üretsin.
   - Recharts ile bar grafik + detaylı tablo.

---

## Teknoloji

**Çekirdek**
- **Next.js 16** + **React 19** + **TypeScript** (App Router, server-side API routes)
- **Tailwind CSS 4** (tema CSS değişkenleri)

**Tip & validasyon (her sınırda Zod)**
- **Zod 4** — `src/contracts/` altında tek tip kaynağı, `z.infer` ile TS tipleri
- Tüm API route'ları request gövdesini Zod ile validate eder
- Gemini yanıtları parse'dan sonra Zod ile doğrulanır → "AI yanlış JSON döndürdü" hatası yakalanır

**State & data**
- **TanStack Query 5** — `useMutation`/`useQuery`, otomatik retry/cache/dedup
- **Zustand 5** (`persist` middleware) — katalog localStorage'da, Gemini sonuçları sayfalar arası paylaşımlı
- **Sonner** — başarı/hata bildirimleri için toast

**UI**
- **Framer Motion** — smooth animasyonlar
- **Recharts** — finansal grafikler
- **Lucide React** — ikonlar

**AI**
- **Google Gemini API** — `@google/generative-ai` SDK
  - Model: `gemini-2.5-flash` (varsayılan), `gemini-2.5-pro` (gerektiğinde)
  - JSON şema ile `responseSchema` → yapılandırılmış çıktı
  - Custom wrapper `src/lib/gemini/` → invalid JSON'da 1 retry, hata sınıflandırması

**Trends**
- Kendi yazdığım Google Trends client'ı (`src/features/trends/client.ts`)
  - Browser-like header'lar + cookie warming
  - Exponential backoff retry
  - Circuit breaker (3 ardışık fail → 5 dk pause)
- Birleşik TTL cache (`src/lib/cache.ts`)

API anahtarı yalnızca sunucu tarafında kullanılır (`/api/*` route'larında). Tarayıcıya sızmaz.

---

## Kurulum

```bash
git clone <repo-url> ticari-zeka
cd ticari-zeka
npm install
cp .env.local.example .env.local
# .env.local dosyasına Gemini API key'inizi yapıştırın
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç.

**Gemini API key:** https://aistudio.google.com/apikey — ücretsiz, 2 dakikada alınır.

---

## Vercel ile Deploy

**Tek script ile (önerilen):**

```bash
# Bir kez kur:
git config --global user.email "you@example.com"
git config --global user.name  "Your Name"
gh auth login        # tarayıcıdan onay
npx vercel login     # tarayıcıdan onay

# Sonra her şey:
bash scripts/deploy.sh
```

`scripts/deploy.sh` şunu yapar:
1. Önkoşul kontrolleri (git/gh/vercel auth, `.env.local` içinde `GEMINI_API_KEY`)
2. Lint + test + build (kalite kapısı)
3. İlk commit (yoksa)
4. GitHub'da `ticari-zeka` repo oluştur + push
5. Vercel projesi link + `GEMINI_API_KEY` production env eklenir
6. `vercel --prod` deploy
7. 4 sayfayı smoke test eder, canlı URL'i yazar

**Manuel yol:**

```bash
npx vercel --prod
```

Vercel dashboard → Settings → Environment Variables → `GEMINI_API_KEY` ekle, redeploy.

### Neden deploy etmek Google Trends'i düzeltir?

Google Trends'in resmi API'si yoktur; biz tarayıcı benzeri istekler atarız.
Local geliştirme sırasında **tek bir IP** (sizin internet servis sağlayıcınız)
sürekli Trends'i sorgulayınca Google "HTTP 429 — Too Many Requests" döner.

Vercel'de her serverless function çağrısı farklı bir worker'dan,
büyük olasılıkla farklı bir IP'den çıkar. Bu doğal IP havuzu Google'ın
rate-limit eşiğinin altında kalır. Üretimde fallback'a düşme oranı çok
düşer; düşse bile 60 dk in-memory cache ve yumuşak "demo modu" mesajı
devreye girer.

**Hala fallback'a düşüyorsa:** Vercel Pro'da Edge Functions yerine
Serverless Functions kullan, `geo` parametresini değiştir (TR'den
EN'e), veya ücretli bir alternatif (SerpApi) entegre et.

---

## Demo akışı (7 dakika)

| Dk | Ekran | Söylenecek |
|----|-------|-----------|
| 0:00 | Landing | Problem: KOBİ satıcı 1000 ürünle yalnız. Tahminle reklam veriyor. Tahminler kayıp. |
| 0:45 | Dashboard | CSV yükle / örnek katalog. Kategori ısı haritası. **Canlı Google Trends'te "kurban bayramı" sorgula** — anlık veri akar. |
| 2:00 | Dashboard | "Gemini önerilerini üret" — 5 ürün için yeniden başlık, niye, öncelik, beklenen ciro. |
| 3:30 | Optimizer | Bir ürünü seç, eski vs yeni başlık, +CTR, +ek ciro. |
| 4:30 | Bütçe Pilotu | 2.500₺ bütçe gir → Gemini kelime başına dağıtsın. ROI tablosu, "şu kelimede harca-ma" uyarısı. **Finans bacağı kapanır.** |
| 6:00 | Mimari | İstemci → Next.js API route → Gemini (responseSchema). Google Trends arka uçta. |
| 6:30 | Yol haritası | Trendyol/Hepsiburada API entegrasyonu, otomatik kampanya başlatma, A/B simülasyonu. Soru. |

---

## Mimari

```
src/
├── app/                              Sadece sayfa girişleri ve route handler'lar
│   ├── page.tsx                      Landing
│   ├── (dashboard|optimizer|budget)/page.tsx
│   ├── not-found.tsx                 Brand'li 404
│   ├── layout.tsx                    QueryProvider + Toaster
│   └── api/
│       ├── insights/route.ts         POST · validate(Zod) → server.generateInsights
│       ├── title-optimize/route.ts   POST · validate → server.optimizeTitle
│       ├── budget-plan/route.ts      POST · validate → server.generateBudgetPlan
│       ├── trends/route.ts           GET · keyword trends (live + cache + fallback)
│       └── category-trends/route.ts  GET · 10 kategori canlı sıralı fetch
├── contracts/                        TÜM Zod şemaları — tek tip kaynağı
│   ├── category.ts, product.ts, trend.ts
│   ├── insights.ts, optimize.ts, budget.ts
│   └── index.ts                      barrel — z.infer ile TS tipleri
├── features/                         Feature-first organizasyon
│   ├── insights/  (prompt + server + hooks)
│   ├── optimizer/ (prompt + server + hooks)
│   ├── budget/    (prompt + server + hooks)
│   └── trends/    (client + server + hooks)
├── stores/                           Zustand
│   ├── catalog-store.ts              persist → localStorage
│   └── insights-store.ts             insights + budget + optimizer sonuçları
├── lib/
│   ├── gemini/                       SDK wrapper + JSON schema'ları
│   │   ├── index.ts                  generate() — Zod validate + 1 retry
│   │   └── schemas.ts                Gemini responseSchema'ları
│   ├── cache.ts                      Birleşik TTL cache (in-memory)
│   ├── fetcher.ts                    apiFetch + ApiError
│   ├── api-helpers.ts                parseBody/ok/fail
│   ├── query-client.tsx              TanStack Query provider
│   ├── use-hydrated.ts               SSR-safe hydration flag
│   ├── mock-data.ts                  50 örnek ürün + curated top keywords
│   ├── utils.ts                      cn, fmtTRY, fmtPct, fmtNum
│   └── types.ts                      contracts re-export (legacy)
├── components/                       UI ve paylaşılan bileşenler
│   ├── ui/  (button, card, badge, stat, info-tip)
│   ├── nav, footer, vercel-deploy-tip, api-key-missing
│   ├── catalog-input, category-heat, insight-list, live-trends
└── data/
    ├── products.json                 50 ürün örnek katalog
    └── trends.json                   Curated yedek (live başarısız olunca)
```

### Veri akışı

```
[Browser]
   │  useMutation/useQuery (TanStack Query)
   ▼
[Client hook]  features/*/hooks.ts
   │  apiFetch + Zod response validate
   ▼
[API route]  app/api/*/route.ts
   │  parseBody + Zod request validate
   ▼
[Feature server]  features/*/server.ts
   │  prompts/* → generate() → Zod validate → deterministic post-process
   ▼
[Gemini SDK]  lib/gemini/  ◄── lib/cache.ts (TTL)
[Google Trends]  features/trends/client.ts  ◄── circuit breaker, backoff
```

**Her sınırda Zod doğrulaması var:** istek geldiğinde, Gemini yanıt verdiğinde,
client'a dönmeden önce. `as any` veya manuel `if (!field)` kontrolleri yok.

### Tip kaynağı

Tek bir noktadan: `src/contracts/`. `z.infer<typeof XSchema>` ile TS tipi türetilir.
Hem client hem server aynı şemaları import eder — sürüm uyumsuzluğu olamaz.

### Dayanıklılık

- **Gemini:** 1 kez retry (`invalid-response` durumunda), kod sınıflandırma
  (`missing-key`/`rate-limit`/`invalid-response`/`network`)
- **Google Trends:** cookie warming + browser headers + exponential backoff
  (1s, 2s) + circuit breaker (3 ardışık fail → 5 dk pause)
- **Cache:** birleşik `lib/cache.ts` — 1 saat live, 10 dk partial
- **Catalog:** Zustand `persist` middleware → localStorage, sekmeler arası senkron

---

## Sıkça sorulanlar

**Gemini API key olmadan çalışır mı?**
Gemini bağlı endpoint'ler 503 + `code: "missing-key"` döner; client tarafında bu yakalanır ve kullanıcıya "API anahtarı tanımlı değil" paneli + 3 adımlı yönlendirme + AI Studio linki gösterilir. Google Trends widget ve katalog girişi anahtar olmadan da çalışır.

**Google Trends gerçekten canlı mı çalışıyor?**
Evet — sunucu tarafında kendi yazdığım client (`src/features/trends/client.ts`) Google'ın resmi olmayan timeline endpoint'ine browser-like header'lar + cookie warming + exponential backoff ile istek atar. 1 saat in-memory cache (`src/lib/cache.ts`) + circuit breaker (3 ardışık fail → 5 dk live skip) ile rate-limit'e karşı dayanıklı. Bağlantı koparsa UI Vercel deploy ipucu kartı + deterministik sentetik veri gösterir.

**Veri seti gerçek mi?**
Ürünler ve kategori trendleri Trendyol/Hepsiburada formatına benzer şekilde elle hazırlanmıştır (50 ürün, 10 kategori). Yarışma kuralı gereği herkese açık örnek veriler kullanıldı. Canlı Google Trends widget'ı gerçek anlık veri kullanır.

---

## Lisans & sorumluluk

MIT. Tahminler simülasyondur; gerçek pazarlama kararlarında kendi verinizle doğrulayın.

Geliştirici: BTK Akademi Hackathon 2026 katılımcısı.
