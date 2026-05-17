"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Pencil,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Bot,
  LineChart,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:px-8 md:pt-24 md:pb-28">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.08 }}
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            <div className="space-y-7">
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-card-border bg-white/5 px-3 py-1 text-xs text-muted"
              >
                <Sparkles className="size-3.5 text-brand-2" />
                BTK Akademi Hackathon 2026 · Gemini ile
              </motion.div>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
              >
                KOBİ satıcının
                <br />
                <span className="gradient-text">AI reklam pilotu.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="max-w-xl text-lg text-muted"
              >
                Stoğunu yükle, Gemini sana bu hafta hangi ürünü, hangi başlıkla,
                hangi reklam bütçesiyle pazarlayacağını ve{" "}
                <strong className="text-foreground">kaç lira kâr</strong>{" "}
                bırakacağını söylesin.
              </motion.p>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/dashboard"
                  className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base"
                >
                  Demo'ya başla
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#nasil-calisir"
                  className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-white/5 px-5 py-3 text-sm text-foreground hover:bg-white/10"
                >
                  Nasıl çalışır?
                </Link>
              </motion.div>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-brand-2" />
                  Gemini 2.5 Flash + Pro
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-brand-2" />
                  Finans bacağı: ROI / kâr tahmini
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-brand-2" />
                  CSV yükle, 30 sn'de plan
                </span>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Bot className="size-4 text-brand-2" />
                    Gemini'nin bu haftaki önerisi
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-2/15 px-2.5 py-0.5 text-xs text-brand-2 border border-brand-2/30">
                    canlı
                  </span>
                </div>
                <p className="mt-4 text-lg leading-snug text-foreground">
                  "Bu hafta <strong>okul çantası</strong> aramaları{" "}
                  <span className="text-brand-2">%62 arttı</span>. Stoğunda
                  uygun 12 ürün var. <strong>P001</strong>'in başlığını şöyle
                  güncellersen tıklama{" "}
                  <span className="text-brand-2">%34 artar</span>;{" "}
                  <span className="text-accent">2.500₺</span> bütçe ile{" "}
                  <span className="text-brand-2">~9.700₺</span> ek ciro
                  beklenir."
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { k: "Trend", v: "+62%", tone: "text-brand-2" },
                    { k: "CTR Lift", v: "+34%", tone: "text-brand-2" },
                    { k: "Beklenen ROI", v: "2.9×", tone: "text-accent" },
                  ].map((s) => (
                    <div
                      key={s.k}
                      className="rounded-xl border border-card-border bg-white/[0.03] p-3 text-center"
                    >
                      <div className="text-xs text-muted">{s.k}</div>
                      <div className={`mt-1 text-xl font-semibold ${s.tone}`}>
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-brand/20 blur-3xl" />
            </motion.div>
          </motion.div>
        </section>

        {/* PROBLEM */}
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <div className="glass rounded-3xl px-6 py-10 md:px-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-brand">
                  Problem
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  KOBİ satıcı 1000 ürünle yalnız.
                </h2>
              </div>
              <div className="md:col-span-2 space-y-3 text-foreground/85">
                <p>
                  Pazaryerlerinde 1–10 kişilik satıcılar binlerce ürünü tek
                  başına yönetiyor. Hangi ürünü öne çıkarmalı? Başlığı nasıl
                  yazmalı? Reklam bütçesini hangi kelimeye vermeli? Bu kararlar
                  bugün <strong>tahminle</strong> alınıyor — ve tahminler
                  kira ödeme noktasında kayba dönüşüyor.
                </p>
                <p className="text-muted">
                  TicariZeka, Gemini'nin trend yorumlama gücüyle stok + marj
                  + trend kesişimini hesaplayıp{" "}
                  <strong className="text-foreground">
                    finansal sonuç odaklı
                  </strong>{" "}
                  bir haftalık plan üretir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NASIL ÇALIŞIR */}
        <section
          id="nasil-calisir"
          className="mx-auto max-w-7xl px-4 pb-16 md:px-8"
        >
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-brand">
                3 Adımda
              </div>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Nasıl çalışır?
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 text-sm text-brand-2 hover:underline"
            >
              Demoya geç
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: TrendingUp,
                title: "Kataloğunu yükle",
                desc: "CSV'ni yükle veya örnek kataloğumuzla başla. Gemini ürün + stok + marj + trend ısısı kesişimini analiz eder.",
              },
              {
                step: "02",
                icon: Pencil,
                title: "Başlığı yeniden yaz",
                desc: "Yükselen kelimelere göre Gemini her ürün için yeni başlık önerir. Eski vs yeni karşılaştırma + tıklama tahmini.",
              },
              {
                step: "03",
                icon: Wallet,
                title: "Bütçeyi dağıt",
                desc: "Haftalık reklam bütçeni gir, Gemini kelime başına dağıtım + beklenen ROI ve net kâr tablosu üretir.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  className="glass rounded-2xl p-6 hover:border-brand/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted">{s.step}</span>
                    <Icon className="size-5 text-brand-2" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FİNANS BACAĞI VURGUSU */}
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
                  <LineChart className="size-3.5" />
                  Finans + E-Ticaret kesişimi
                </div>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                  Sadece "şuna reklam ver" değil —{" "}
                  <span className="gradient-text">"şu kâr beklenir."</span>
                </h2>
                <p className="mt-4 text-muted">
                  Her öneri net bir finansal çıktıyla gelir: tahmini tıklama,
                  dönüşüm, ciro, brüt kâr ve ROI. KOBİ satıcı reklam harcamasını
                  bir <em>maliyet</em> değil,{" "}
                  <strong className="text-foreground">
                    geri dönen bir yatırım
                  </strong>{" "}
                  olarak görür.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { k: "Bütçe", v: "2.500₺", tone: "text-foreground" },
                  { k: "Beklenen Ciro", v: "9.720₺", tone: "text-brand-2" },
                  { k: "Beklenen Net Kâr", v: "3.180₺", tone: "text-accent" },
                  { k: "ROI", v: "2.27×", tone: "text-brand-2" },
                ].map((r) => (
                  <div
                    key={r.k}
                    className="flex items-center justify-between rounded-xl border border-card-border bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-muted">{r.k}</span>
                    <span className={`text-lg font-semibold ${r.tone}`}>
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
          <div className="glass rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              30 saniyede AI reklam planı.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Örnek kataloğu yükle, Gemini'nin önerisini canlı izle. Hiçbir
              kayıt gerekmez.
            </p>
            <Link
              href="/dashboard"
              className="btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base"
            >
              Demo'ya başla
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
