import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "TicariZeka — KOBİ E-Ticaret için AI Reklam & Bütçe Pilotu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(800px 500px at 85% -10%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(700px 400px at -10% 110%, rgba(0,212,168,0.25), transparent 60%), #0a0b14",
          color: "#f5f6fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #7c5cff 0%, #00d4a8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              color: "#0a0b14",
              fontWeight: 700,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
            Ticari
            <span
              style={{
                background:
                  "linear-gradient(90deg, #b09bff 0%, #00d4a8 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Zeka
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 28,
              color: "#9aa0b4",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            KOBİ E-Ticaret · Gemini · ROI Pilotu
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            Bu hafta hangi ürünü,{"\n"}hangi başlıkla,{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #b09bff 0%, #00d4a8 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              hangi bütçeyle?
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
          }}
        >
          <div style={{ color: "#9aa0b4" }}>
            BTK Akademi Hackathon 2026 · Finans + E-Ticaret
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
            }}
          >
            <span
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(124,92,255,0.18)",
                border: "1px solid rgba(124,92,255,0.4)",
                color: "#b09bff",
              }}
            >
              Gemini 2.5
            </span>
            <span
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(0,212,168,0.18)",
                border: "1px solid rgba(0,212,168,0.4)",
                color: "#00d4a8",
              }}
            >
              Google Trends
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
