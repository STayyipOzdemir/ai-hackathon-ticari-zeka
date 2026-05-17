#!/usr/bin/env bash
# Demo öncesi cache ısıtma — production'da ilk istek soğuk olmasın.
#
# Kullanım:
#   bash scripts/warm-cache.sh https://ticari-zeka.vercel.app
#
# Yaptıkları:
#   - /api/category-trends → 10 kategori için Google Trends cache'i doldurur (~30sn)
#   - /api/trends?q=... → 6 popüler keyword için cache (~10sn)
#   - /api/insights → 1 dummy çağrı (Gemini cold start ısınır, ~10sn)
#
# Demo'dan 3-5 dk önce çalıştır → her widget sıcak yüklenir.

set -e

GREEN="\033[0;32m"; RED="\033[0;31m"; BLUE="\033[0;34m"; RESET="\033[0m"
step()    { printf "\n${BLUE}▶ %s${RESET}\n" "$1"; }
ok()      { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
fail()    { printf "  ${RED}✗${RESET} %s\n" "$1"; }

BASE="${1:-http://localhost:3000}"
BASE="${BASE%/}"

step "Cache hedefi: ${BASE}"

# 1) Category trends — 10 kategori sıralı sorgulanır
step "Kategori trendleri (10 kategori, ~30-60sn)"
CT_STATUS=$(curl -s -o /tmp/warm-ct.json -w "%{http_code}" --max-time 120 "${BASE}/api/category-trends")
if [ "$CT_STATUS" = "200" ]; then
  SOURCE=$(python3 -c "import json; print(json.load(open('/tmp/warm-ct.json')).get('source','?'))" 2>/dev/null || echo "?")
  ok "category-trends → ${CT_STATUS} (source: ${SOURCE})"
else
  fail "category-trends → ${CT_STATUS}"
fi

# 2) Popüler keyword'ler — paralel
step "Keyword trends (6 keyword, paralel)"
KEYWORDS=(
  "okul%20%C3%A7antas%C4%B1"
  "yazl%C4%B1k%20elbise"
  "klima"
  "g%C3%BCne%C5%9F%20kremi"
  "%C5%9Fi%C5%9Fme%20havuz"
  "kurban%20bayram%C4%B1"
)
for kw in "${KEYWORDS[@]}"; do
  curl -s -o /dev/null --max-time 30 "${BASE}/api/trends?q=${kw}&geo=TR&range=7d" &
done
wait
ok "6 keyword cache'lendi"

# 3) Gemini cold start ısıtması (dummy 1 ürün)
step "Gemini cold start (1 dummy insights çağrısı)"
INS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 60 \
  -X POST "${BASE}/api/insights" \
  -H "Content-Type: application/json" \
  -d '{"products":[{"id":"WARM","title":"Test","category":"kirtasiye","price":100,"cost":50,"stock":10,"views30d":100,"sales30d":5,"rating":4.5,"reviewCount":10}]}')
if [ "$INS_STATUS" = "200" ]; then
  ok "insights → ${INS_STATUS} (Gemini sıcak)"
else
  fail "insights → ${INS_STATUS} (GEMINI_API_KEY production'da tanımlı mı?)"
fi

# 4) Sayfa rotaları — Vercel function'larını ısıt
step "Sayfa rotaları (4 sayfa)"
for path in "/" "/dashboard" "/optimizer" "/budget"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE}${path}")
  if [ "$code" = "200" ]; then ok "${path} → ${code}"; else fail "${path} → ${code}"; fi
done

printf "\n${GREEN}✓ Cache sıcak. Demo'ya hazırsın.${RESET}\n"
printf "  Cache TTL'ları: kategori 1 saat, keyword 1 saat. Bu süreyi kullan.\n\n"
