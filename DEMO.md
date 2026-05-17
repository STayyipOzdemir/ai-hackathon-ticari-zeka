# TicariZeka — Demo Script V2

7 dakikalık jüri sunumu + 1 dakikalık submission video çekimi için.
**Hikaye odaklı**, somut bir karakter ("Bursa'da Ahmet abi") üzerinden.

---

## Demo öncesi 5 dakikalık hazırlık

1. `bash scripts/warm-cache.sh https://senin-vercel-url.vercel.app`
   - 10 kategori + 6 keyword + Gemini cold start ısıtması (~60sn)
   - Demo'da her şey **anında** açılır
2. Tarayıcıyı temiz aç, http://localhost:3000 veya production URL'i
3. Dashboard'da **localStorage'ı temizle** (DevTools → Application → Clear)
4. AI Chat panelinin kapalı olduğundan emin ol (sağ alt buton görünür)

---

## 1 dakikalık submission video

> **Çekim:** Loom / QuickTime ekran kaydı, 1080p, sesli. Tek alış.

| 0:00–0:08 | **Landing** | "KOBİ e-ticaret satıcısı 1000 ürünle yalnız. Tahminle reklam veriyor, kira ödenmiyor. TicariZeka, Gemini ile bunu kâr odaklı veriye çevirir." |
| 0:08–0:18 | **Dashboard'da Ahmet butonu** | "Demo için Bursa'lı Ahmet abinin gerçek senaryosu yüklü. Geçen ay 8.000₺ reklam vermiş, 12.300₺ ciro yapmış — ROI 1.5x." |
| 0:18–0:35 | **Mor buton + streaming** | "Gemini'ye soruyorum. Bu hafta için 5 öneri streaming ile akıyor. Her öneri: yeni başlık + öncelik + tahmini ek ciro." |
| 0:35–0:50 | **Bütçe Pilotu → Para Masada** | "Şimdi finansa bakıyoruz. Aynı 8.000₺'yi yeni kelimelere dağıtsak — **haftada 3.700₺ masada bırakıyormuş**. Yılda 192 bin lira." |
| 0:50–0:60 | **Kredi köprüsü** | "Bütçesi yetmiyorsa Vakıfbank Esnaf Kredisi'nden 17 bin çekse — taksit 1.498₺, beklenen aylık kâr 12.500₺, net fayda **+29 bin**. Borç al, kâra geç." |

Toplam: 60 saniye, finansal sonuç odaklı. **"Masada bırakılan para" + "kredi mantıklı mı"** — bu iki cümle jüriye kalır.

---

## 7 dakikalık jüri sunumu

### 0:00 — Açılış (10 saniye, slide veya boş ekran)

Yavaş ve net konuş:

> "Selam. Ben Tayyip. Size **Bursa'da Ahmet abi**'den bahsedeceğim."

(Duraklayın, jüriye bakın. "Bir karakter geliyor" hissi yarat.)

### 0:10–0:45 — Ahmet abi hikayesi (Landing)

Landing açık, ekrana göster:

> "Ahmet abi 12 yıl kırtasiyeci. 2 yıl önce Trendyol'a açılmış. 487 ürün, kendi başına yönetiyor.
>
> Geçen ay reklam bütçesi **8.000 lira**. Reklamdan ciro **12.300 lira**. ROI 1.5x — fena değil di mi?
>
> Aslında çok kötü. Çünkü 8 binin **6.400 lirası 3 yanlış kelimede** boşa gitti — kırtasiye malzemeleri ROI 0.75, defter 1.45, kalem seti 1.61. **Tek doğru kararı boya kalemi** — ROI 2.75. Ama oraya bütçenin sadece %20'sini ayırmış.
>
> Sorunu Ahmet abinin yetkin olmaması değil. Sorun: 1000 ürün, 1 kişi, hangi ürünü öne çıkaracağını **tahminle** karar veriyor.
>
> TicariZeka, Gemini ile Ahmet abinin yerinde olsa **ne yapardı**'yı söylüyor. Şimdi göstereyim."

### 0:45–2:15 — Dashboard, Ahmet senaryosu

(Dashboard'a geç, "Ahmet Abi" butonuna bas.)

> "İşte Ahmet abinin kataloğu — 15 ürün, hepsi gerçekçi. Üstte aylık ciro, reklam harcaması, mevcut ROI gözüküyor.
>
> Tablo: geçen ay verdiği 4 kampanyadan hangisinin **zarar**, hangisinin **iyi** olduğunu rengiyle gösteriyorum. Boya kalemi yeşil — diğerleri sarı/kırmızı.
>
> (Kaydır) Altta **kategori ısı haritası** — sunucu Google Trends'e canlı sorgu atıyor, yeşil rozet 'canlı Google Trends' diyor. Bu hafta kırtasiye **95** — okul dönemi yaklaşıyor.
>
> Bir de canlı keyword arama widget'ı — 'okul çantası' yazıyorum, son 7 günün grafiği akıyor, rising queries gerçek: 'puma okul çantası', 'şeffaf okul çantası'.
>
> Şimdi Ahmet abi için Gemini ne öneriyor:"

(Mor butona bas. Streaming başlar.)

> "Gemini yazıyor. Karakter sayacı canlı — cevap parça parça akıyor, kullanıcı boş bekleme görmüyor.
>
> (10-12sn sonra sonuç gelir.)
>
> 5 öneri hazır. Headline'da Gemini'nin haftalık özeti. Yanında **'canlı Google Trends' rozeti** — Gemini bu önerileri gerçek veriden çıkardı.
>
> Her kart için 4 şey: yeni başlık (Gemini), niye seçti (Gemini), öncelik skoru, **30g ek ciro tahmini**. Son satır kritik — bu sayı Gemini'nin değil, **bizim hesabımız**: ürünün satışı × fiyatı × CTR artışı. Aynı ürün için tekrar çalıştırsak hep aynı sayı çıkar. Vitest'te bu test var."

### 2:15–3:00 — Optimizer (kısa)

> "Bir ürün için derin dalış istersen Optimizer'a geç. Eski başlık vs Gemini önerisi yan yana. Altta **2 alternatif başlık**, farklı pazarlama açılarından — A/B test edebilirsin."

(Kısa geçiş — burada uzun durma, en güçlü bölüm Bütçe.)

### 3:00–5:00 — Bütçe Pilotu (FİNANS BACAĞI)

> "Asıl iş şimdi. Bütçe Pilotu'na geçiyorum. Insights'tan gelen 8 kelime burada **öncelikli** olarak gösteriliyor — köprü kurulmuş, manuel kopyala yapıştır yok.
>
> Bütçe input'una **8.000₺** yazıyorum — Ahmet abinin gerçek bütçesi. 'Plan üret'."

(Sonuç gelir, en üstte ⚠ **Para Masada** kartı parlıyor.)

> "İşte demin söylediğim. Üst kartta:
>
> '**Şu an haftada 3.720₺ masada bırakıyorsun.**'
>
> Soldaki: Ahmet abinin mevcut reklamı, 8.000₺ → 12.300₺, ROI 1.54x.
> Ortadaki: Gemini'nin önerdiği aynı bütçeyle dağıtım, ROI 2.30x.
> Sağdaki: **Yıllık projeksiyon — 192.000₺ kayıp**.
>
> Bu sayı yüzde değil, lira. Ahmet abinin gözüne bakıp 'yılda iki yüz bin lira masada' demek — bu cümle her satıcının ilgisini çeker.
>
> Aşağıda Gemini'nin **kelime başına dağıtım tablosu**. 'Boya kalemi' ROI 5.8x — yeşil. 'Okul çantası' ROI 1.2x — sarı. Eğer 'Kırtasiye malzemeleri'ne çevirseydi ROI 0.4x'e düşerdi — kırmızı 'harca-ma' uyarısı çıkardı.
>
> **Bu sayıları Gemini sallamıyor.** Gemini sadece kelime + competition tier + dönüşüm oranı tahmini yapıyor. CPC formülünden tıklama, tıklamadan dönüşüm, dönüşümden ciro, marjdan kâr — bizim hesabımız. Düşük rekabet 2.25₺, orta 5₺, yüksek 11₺. Şeffaf.
>
> Sağ üstte **CSV indir** — Ahmet abi Excel'e açabilir."

### 5:00–5:50 — Mikro Kredi Köprüsü (BU DA YENİ)

(Sayfayı aşağı kaydır, **CreditBridge** kartı gözükür.)

> "Şimdi finans bacağının kritik anı. Ahmet abi diyor: 'eyvallah ama benim cebimde 8.000₺ var, sen 18.000₺ önerirsen yapamam.'
>
> İşte burada **Finans Köprüsü**. Elindeki para 8.000₺, önerilen 18.000₺ — eksik 10.000₺. '10.000₺ için kredi seçeneklerini gör'.
>
> 4 banka kart geliyor. Aylık taksit, toplam faiz, **net fayda**. **Vakıfbank Esnaf Kredisi**: 10 bin lira, 6 ay vade, taksit 1.835₺. Toplam faiz 1.010₺. Beklenen aylık ek kâr ~12.500₺, 6 ayda 75 bin. **Net fayda +74.000₺**. Yeşil rozet: 'öneririz'.
>
> Yani uygulama Ahmet abiye 'borç al' demiyor — **'borç al + matematik şu' diyor**. Şeffaf finansal karar.
>
> Yarışmanın iki teması **finans ve e-ticaret**. Çoğu projede bunlardan biri eklenti olarak duruyor. Bizde **finans, e-ticaret kararının doğal devamı**: Hangi ürünü öne çıkarayım → bütçemi nasıl dağıtayım → eksik kalan parayı nasıl finanse edeyim. Tek akış."

### 5:50–6:30 — Mimari (hızlı)

> "Teknik özet:
>
> - **Next.js 16 + React 19 + TypeScript** App Router
> - **Zod 4** — her sınırda (request + Gemini response + client) runtime validation. AI saçma JSON döndürse otomatik yakalanır
> - **TanStack Query + Zustand** + sayfalar arası store paylaşımı
> - **Gemini 2.5 Flash streaming** + 1 retry + responseSchema
> - **Google Trends client** — kendi yazdım, browser headers + cookie warming + circuit breaker + 1 saat cache
> - **Deterministik finans matematiği** — CPC/dönüşüm/ROI/kredi anüite formülü server-side
> - **28 Vitest test** + GitHub Actions CI
> - **Sağ alt köşede AI Chat** — Gemini ekrandaki verileri bağlam olarak görüp soruları cevaplıyor
> - Vercel Analytics, Speed Insights, rate limiting"

### 6:30–7:00 — Yol haritası + kapanış

> "Yol haritası:
> - **Trendyol/Hepsiburada API**: satıcı kataloğunu 1 tıkla bağlasın
> - **Gerçek banka API'leri** (BKM, Findeks): faiz oranlarını canlı çek
> - **Otomatik kampanya yayını**: Google Ads'e bütçe planını push
> - **Çoklu satıcı + benchmark**: 'kategorindeki diğer satıcılar şöyle yapıyor'
>
> Ahmet abi gibi 200.000 KOBİ Trendyol'da. Hepsinin haftalık 3-5 bin liralık 'masadaki para'sı var. Bu uygulama 1 lirayı bile cebine koysa ülke ekonomisine etkisi 600 milyon lira/yıl.
>
> Sorularınızı alabilirim. Teşekkürler."

---

## Jüri sorularına önceden hazırlık (V2)

**S: Ahmet abinin verisi gerçek mi?**
> Persona ve sayılar realistik bir senaryoya göre tasarlandı; Bursa'da ortalama bir kırtasiye işletmesinin Trendyol cirosu/reklam harcaması aralığında. Pilot için **gerçek bir KOBİ satıcı ile görüşüyoruz** — yarışma sonrası gerçek veriyle pilot çalışması planımız var. Tüm matematik gerçek veriyle de aynı şekilde çalışır.

**S: "Masada bırakılan para" hesabı şüpheli görünüyor.**
> Formül şeffaf: `(yeni planın ROI'si × mevcut harcama) − mevcut ciro`. ROI değerleri Gemini'nin değil bizim CPC tablomuzdan. Üstelik tüm allocation rationale'ları görünür — herhangi birinin mantığını sorgulayabilirsin. Optimistik bir tahminse, Ahmet abi 192k yerine 80k bile kazansa, bu hala çok değerli bir karar.

**S: Banka faiz oranlarını nereden aldınız?**
> Demo amaçlı `src/features/credit/products.ts` içinde — Mayıs 2026 piyasa ortalamasına göre. Production'da BKM ile veya bankaların açık API'leriyle (Vakıfbank Mobil API) canlı çekilir. Roadmap'te var. Anlık değişen şey faiz, ama mantık — anüite hesabı + net fayda — değişmez.

**S: Sayılar gerçek mi yoksa Gemini mi uyduruyor?**
> Iki katman: (1) Gemini *judgment* yapar — öncelik skoru, başlık, kelime seçimi, dönüşüm oranı tahmini. (2) Finansal sayılar — tıklama, ciro, net kâr, ROI, kredi taksiti — bizim deterministik formüllerimiz. Vitest'te `ROI = profit/budget` invariant'ı test ediliyor.

**S: Google Trends fallback'a düşmüş, neden?**
> Google Trends'in resmi API'si yok. Tek IP'den (yerel dev / aynı Vercel function) çok sorgu = HTTP 429. Vercel'de farklı invocation'lar farklı IP'den çıkar, sorun büyük ölçüde dağılır. Düştüğünde deterministik sentetik fallback devreye girer.

**S: Daha önce kim bu işi yapmadı?**
> Trendyol kendi reklam suggestion'ları var, Google Ads recommendation API var, ama hepsi **parça parça** ve İngilizce/genel. Tek bir Türkçe ekranda *KOBİ tarafı + canlı trend + finansal sonuç + kredi köprüsü* bileşimi bizim bildiğimiz kadarıyla yok.

**S: Trendyol API'si yok mu?**
> Trendyol Marketplace API'si var ama bireysel satıcı erişimi kontrollü. Demo'da hackathon kuralı gereği realistic katalog + canlı Google Trends ile bağladık. Marketplace ile resmi entegrasyon yarışma sonrası ilk hedefimiz.

**S: AI Studio key'i nasıl güvence altına aldınız?**
> `.env.local`, `.gitignore`'da. API key tarayıcıya hiç gönderilmiyor — tüm Gemini çağrıları server-side `/api/*` route'larında. Rate limiting: insights/budget 8 req/dk, title-optimize 20, chat 20.

**S: Hangi modeli kullanıyorsunuz?**
> `gemini-2.5-flash`. Pro'yu denedim ama 1.5x latency, 3x maliyet karşılığında demo'da gözle görülür kalite farkı yoktu. Streaming + responseSchema + Zod validate ile flash yeterli.

**S: Test ediyor musunuz?**
> Vitest ile 28 unit test: Zod schemaları, deterministik finansal hesaplar (`ROI = profit/budget` + kredi anüite formülü), TTL cache, rate limiter, prompt builder içeriği. CI'da her PR'da koşuyor.

**S: Eğer ben Ahmet abi olsaydım yarın ne yapardım?**
> Kataloğumu yükle (Trendyol export CSV var). Gemini önerilerini gör. Önceliği 90+ olan ürünleri uygula. Bütçe Pilotu'nda haftalık bütçemi gir, çıkan plana göre Trendyol Ads panelinde kelime bidlerimi yenile. Kredi mantıklıysa Vakıfbank'ta hesabımdan başvur. Bir hafta sonra ciroma bak. Çalışıyorsa devam, çalışmıyorsa Gemini'ye 'düşür' de.

---

## Demo öncesi son checklist

- [ ] `bash scripts/warm-cache.sh https://senin-url.vercel.app` (3 dk önce)
- [ ] `.env.local` GEMINI_API_KEY production'da tanımlı
- [ ] Tarayıcı zoom %100, koyu mod aktif
- [ ] AI Chat panel kapalı
- [ ] Dashboard'da localStorage temiz (eski insights yok)
- [ ] "Ahmet Abi" butonu görünür ve çalışıyor
- [ ] İnternet stabil
- [ ] Mikrofon test edildi
- [ ] DEMO.md ekranında değil — bilgisayar dışı (telefondan)
