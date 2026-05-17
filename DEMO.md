# TicariZeka — Demo Script

7 dakikalık jüri sunumu + 1 dakikalık submission video çekimi için.

---

## 1 dakikalık submission video (form için)

> **Çekim:** Loom veya QuickTime ekran kaydı. 1080p. Sesli.
> Ekrana sırayla şunlar gelir, ses üstte anlatım.

| 00:00–00:10 | **Landing** | "Türkiye'deki KOBİ e-ticaret satıcısı bin ürünle yalnız. Hangi ürünü öne çıkarsın, hangi başlığı yazsın, hangi kelimeye reklam versin — tahminle karar veriyor. **TicariZeka**, Gemini ile bu kararları kâr odaklı veriye dönüştürür." |
| 00:10–00:25 | **Dashboard** | "Kataloğunu gir. Canlı Google Trends 10 kategoriyi sıralıyor. Mor butona basıyorum — Gemini cevap akarken karakter sayacı çalışıyor. 12 saniyede 5 ürün için yeni başlık, niye, öncelik, beklenen ek ciro." |
| 00:25–00:40 | **Optimizer + Bulk** | "Tek tek de çalışır — eski vs yeni başlık + 2 alternatif. Ya da insights'tan **'Tüm başlıkları üret'** ile hepsini sıralı oluştur." |
| 00:40–00:55 | **Bütçe Pilotu** | "Insights'taki kelimeler buraya geliyor. 2500₺ → Gemini dağıt → her satırda **bizim hesabımız**: tıklama, dönüşüm, ciro, net kâr, ROI. Hangi kelimede para kazanacağını, hangisinde zarar edeceğini parayı vermeden görüyorsun." |
| 00:55–01:00 | **AI Chat** | "Sağdaki butondan Gemini ile sohbet — 'ROI 0.5x ne demek?' sor, hemen açıklar." |

---

## 7 dakikalık jüri sunumu

> **Hazırlık:** demo verisi yüklü, dev server / production link açık, AI Chat panel kapalı. Sayfayı yenile, "Örnek Katalog" basılı.

### 0:00–0:45 — Problem & ürün (Landing)

> "Türkiye'de yüz binlerce KOBİ Trendyol, Hepsiburada, Amazon TR'de satış yapıyor. Bir satıcı kataloğunda **1000 ürün**, ekibinde **1-3 kişi** olabiliyor.
>
> Sorunlar:
> - 'Bu hafta hangi 5 ürünümü öne çıkarayım?' — sezgisel karar
> - 'Başlığımı nasıl yazayım?' — copy-paste rakip
> - 'Reklam bütçesi 2500₺ — hangi kelimeye ver?' — körlüğüne
>
> Hepsi tahmin → tahmin kayıp → kayıp kira ödenemez.
>
> **TicariZeka** Gemini ile bu üç soruyu — *finansal sonuçlu* — cevaplar. Hemen göstereyim."

### 0:45–1:30 — Catalog input + Canlı Trends (Dashboard üst yarısı)

> "Satıcı buraya kataloğunu yazıyor. Form 5 alan; satış/görüntülenme otomatik türetiliyor. Şu an örnek katalog yüklü, 50 ürün, 10 kategori.
>
> Aşağıda **kategori ısı haritası**. Bu mock değil — sunucu Google Trends'e 10 ayrı sorgu atıp kendi heat skorunu hesaplıyor. Yeşil rozet 'canlı Google Trends' — bu hafta kozmetik 89, kitap 66, kırtasiye 95. Okul dönemi yaklaşıyor.
>
> *(Kategori panelinin altında Live Trends widget'ını aç:)* Burada da gerçek zamanlı tek kelime için Trends sorgulayabiliyorum. 'Kurban bayramı' yaz, son 7 gün grafiği akıyor. Rising queries: 'kurban bayramı emekli ikramiyesi'. Bunlar **gerçek** veri."

### 1:30–3:30 — Ana aksiyon: Gemini önerileri (streaming)

> "Şimdi büyük mor butona basıyorum.
>
> *(Buton basılır, alttaki kart şişer:)* **Gemini yazıyor**. Karakter sayacı canlı. Cevap parça parça akıyor — bu streaming, kullanıcı bekleme zonu görmüyor.
>
> *(10–15sn sonra:)* 5 öneri hazır. Headline'da Gemini'nin haftalık özeti, yanında **canlı Google Trends rozeti** ve fetch zamanı — sayılar gerçek veriden geldi.
>
> Her kart için:
> - **Öncelik 95** — stok + marj + trend kesişimi
> - **Yeni başlık** — 'Klima 12000 BTU A++ Inverter **Duvar Tipi**'
> - **Niye bu öneri** — Gemini'nin akıl yürütmesi
> - **+%15 CTR** + **+9.300₺ ek ciro** — son satır kritik: bu sayı Gemini'nin değil, **bizim deterministik hesabımız**: 30g satış × fiyat × CTR. Aynı ürün için tekrar çalıştırırsan hep aynı sayı.
>
> Sağ üst: **JSON indir** + **Tüm başlıkları üret**. Bulk butona basarsam 5 ürün için sıralı Gemini çağrısı; her satırın altında bulk sonuç + alternatifler düşüyor."

### 3:30–4:30 — Optimizer (tek ürün derin dalış)

> "Bir ürün için Gemini ile 'derin' optimization istersen Optimizer'a geç.
>
> *(Bir ürünü seç, 'Gemini ile yeniden yaz' bas:)*
> - **Eski başlık** vs **Gemini önerisi** yan yana
> - 'Niçin bu öneri?' — Gemini'nin gerekçesi
> - 3 metrik: CTR artışı, **30g ek ciro** (bu da deterministik), karakter sayısı/100
> - Alt bölümde **2 alternatif başlık** farklı açılardan ('fayda odaklı', 'fiyat/kalite'). A/B test edebilirsin."

### 4:30–6:00 — Bütçe Pilotu (FİNANS BACAĞI — burası en önemlisi)

> "Şimdi finans tarafına geçiyorum — bu yarışmanın iki temasından biri.
>
> *(Bütçe Pilotu'na git:)* Insights'tan gelen 8 kelime burada **öncelikli** olarak gösteriliyor — köprü kurulmuş. Bütçe input'una 5000₺ yazıyorum, 'Plan üret'.
>
> *(Sonuç gelir:)* 4 stat kartı: bütçe, beklenen ciro 95.500₺, **net kâr 32.500₺**, **ROI 6.5×**.
>
> Aşağıda grafik: kelime başına bütçe/ciro/kâr çubukları. 'Okul çantası' kelimesinde kârı kırmızı — yani **zarar**. Tabloya bak: ROI 0.46×, yani 'her 1₺ reklama 46 kuruş geri gelir'. Bu kelimede **harca-ma** sinyali.
>
> Altta açıklama: 'CPC: düşük=2.25₺, orta=5₺, yüksek=11₺. Sayılar Gemini'nin sallaması değil — biz hesaplıyoruz.' Yani Gemini *hangi kelimeye ne kadar* der; *kâr tahmini bizim modelimiz*. Bu önemli çünkü AI bazen iyimser sayılar uydurur — biz prompt'tan bu özgürlüğü aldık.
>
> Sağ üstte **CSV indir** butonu. Satıcı Excel'de açabilir."

### 6:00–6:30 — Mimari + diferansiyasyon

> "Mimari özet *(slide veya REAMDE göster)*:
> - **Next.js 16 + React 19 + TypeScript** App Router
> - **Zod** schema — request/Gemini response/client fetch, **her sınırda** runtime validation. AI saçma JSON döndürse otomatik yakalanır
> - **TanStack Query + Zustand** — state ve cache modern
> - **Gemini 2.5 Flash streaming** + 1 retry + typed errors
> - **Google Trends client** — cookie warming + circuit breaker + 1 saat cache
> - **Vitest** — 28 unit test, deterministik hesaplar dahil
>
> Diferansiyasyonum: AI'a sadece *judgment* (öncelik, başlık, allocation) yaptırıp; *finansal modelleme* kontrolde. Bu sayede ROI grafiği abartılı 12× değil, gerçekçi 2.3×."

### 6:30–7:00 — Yol haritası + soru

> "Yol haritası:
> - Trendyol/Hepsiburada API entegrasyonu — satıcı 1 tıkla bağlasın
> - Otomatik kampanya yayını — bütçe planını Google Ads'e push
> - A/B title test simulasyonu — gerçek metriklerle prompt'a feedback
> - Çoklu satıcı + benchmark
>
> Sorularınızı alabilirim."

---

## Jüri sıkça sorabilecek sorular + cevaplar

**S: Sayılar gerçek mi yoksa Gemini mi uyduruyor?**
> Iki katman: (1) Gemini *judgment* yapar — öncelik skoru, başlık, kelime seçimi, dönüşüm oranı tahmini. (2) Finansal sayılar — tıklama, ciro, net kâr, ROI — bizim deterministik formüllerimiz. Aynı ürün için Gemini'yi tekrar çalıştırsanız bu sayılar değişmez. Vitest'te `ROI = profit/budget` invariant'ı test ediliyor.

**S: Google Trends fallback'a düşmüş, neden?**
> Google Trends'in resmi API'si yok. Tek IP'den (yerel dev / aynı Vercel function) çok sorgu = HTTP 429. Vercel'de farklı invocation'lar farklı IP havuzundan çıkar, sorun büyük ölçüde dağılır. Düştüğünde deterministik sentetik fallback devreye girer — kullanıcıya kart şeklinde belirtilir, 'Vercel'e deploy et' önerilir.

**S: Daha önce kim bu işi yapmadı?**
> Trendyol Marketplace'ta 'Trendyol Akademi' tipi kurslar var, Google Ads'in kendi suggestion'ları var, ama hepsi parça parça. Tek bir ekranda *KOBİ + tek dilde + finansal sonuçlu + canlı trend* bileşimi bizim bildiğimiz kadarıyla yok.

**S: Trendyol/Hepsiburada API yok mu?**
> Trendyol Marketplace API'si var ama bireysel satıcı erişimi zor. Roadmap'te bu var; demo'da hackathon kuralı gereği sahte katalog + canlı Google Trends ile bağladık.

**S: AI Studio key'i nasıl güvence altına aldınız?**
> `.env.local`, `.gitignore`'da. API key tarayıcıya hiç gönderilmiyor — tüm Gemini çağrıları server-side `/api/*` route'larında. Rate limiting var (insights/budget için 8 req/dk, title-optimize için 20, chat için 20).

**S: Hangi modeli kullanıyorsunuz?**
> `gemini-2.5-flash` — hız için. Pro tarafında deneme yaptık ama 1.5x latency, 3x token maliyeti karşılığında demo'da gözle görülür kalite farkı yoktu.

**S: Test ediyor musunuz?**
> Vitest ile 28 unit test: Zod schemaları (geçerli/geçersiz girdiler), deterministik finansal hesaplar (`ROI = profit/budget` invariant'ı), TTL cache davranışı, rate limiter, prompt builder içeriği. CI'da her PR'da koşuyor.

---

## Demo öncesi checklist

- [ ] `npm run dev` çalışıyor, http://localhost:3000 açık
- [ ] `.env.local`'de geçerli `GEMINI_API_KEY` var
- [ ] Tarayıcı zoom %100, dark mode tetiklendi
- [ ] AI Chat panel kapalı (sağ alt buton görünür)
- [ ] Dashboard'da "Örnek Katalog" yüklü
- [ ] Insights state temiz (yeniden tetiklemek için)
- [ ] Bağlantı stabil (canlı Trends için)
- [ ] (Vercel'de demo veriyorsan: ısınmış cache için 5 dk önce 1 kez dashboard'u aç)
