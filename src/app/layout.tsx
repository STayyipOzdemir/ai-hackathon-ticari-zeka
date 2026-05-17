import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { AIChat } from "@/components/ai-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_TITLE =
  "TicariZeka — KOBİ E-Ticaret için AI Reklam & Bütçe Pilotu";
const APP_DESC =
  "Stoğunu yükle, Gemini sana bu hafta hangi ürünü, hangi başlıkla, hangi reklam bütçesiyle pazarlayacağını ve kaç lira kâr getireceğini söylesin. BTK Akademi Hackathon 2026.";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESC,
  applicationName: "TicariZeka",
  keywords: [
    "e-ticaret",
    "yapay zeka",
    "gemini",
    "btk akademi",
    "hackathon",
    "reklam optimizasyonu",
    "roi",
    "finans",
  ],
  openGraph: {
    title: APP_TITLE,
    description: APP_DESC,
    type: "website",
    locale: "tr_TR",
    siteName: "TicariZeka",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESC,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <AIChat />
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#11132f",
                border: "1px solid #1f2238",
                color: "#f5f6fb",
              },
            }}
          />
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
