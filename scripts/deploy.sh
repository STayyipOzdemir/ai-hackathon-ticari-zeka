#!/usr/bin/env bash
# TicariZeka — tek-komut deploy script'i.
#
# Önkoşullar (bunlar interactive — kullanıcının bir kez yapması gerek):
#   1) git config --global user.email "..."
#   2) git config --global user.name  "..."
#   3) gh auth login           (web flow)
#   4) vercel login            (web flow)
#
# Sonra:
#   bash scripts/deploy.sh
#
# Script şunları yapar:
#   - Kontroller (auth + GEMINI_API_KEY)
#   - Build + lint + test (kalite kapısı)
#   - İlk anlamlı git commit (yoksa)
#   - GitHub repo create + push (yoksa)
#   - Vercel project link + env GEMINI_API_KEY ekle
#   - Production deploy + URL göster

set -euo pipefail

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

step()    { printf "\n${BLUE}▶ %s${RESET}\n" "$1"; }
ok()      { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
fail()    { printf "  ${RED}✗${RESET} %s\n" "$1"; }
warn()    { printf "  ${YELLOW}!${RESET} %s\n" "$1"; }

cd "$(dirname "$0")/.."

# 1) Önkoşullar
step "Önkoşulları kontrol ediyorum"

if [ -z "$(git config user.email)" ] || [ -z "$(git config user.name)" ]; then
  fail "Git kimliğin tanımlı değil"
  echo "    Çalıştır:"
  echo "    git config --global user.email \"sizin@email.com\""
  echo "    git config --global user.name  \"Sizin İsim\""
  exit 1
fi
ok "git config user.email: $(git config user.email)"

if ! gh auth status >/dev/null 2>&1; then
  fail "GitHub CLI'da giriş yapmamışsın"
  echo "    Çalıştır: gh auth login"
  exit 1
fi
GH_USER="$(gh api user --jq .login)"
ok "gh auth: $GH_USER"

if ! npx --yes vercel whoami >/dev/null 2>&1; then
  fail "Vercel'de giriş yapmamışsın"
  echo "    Çalıştır: npx vercel login"
  exit 1
fi
VERCEL_USER="$(npx --yes vercel whoami 2>/dev/null | tail -1)"
ok "vercel auth: $VERCEL_USER"

if [ ! -f .env.local ] || ! grep -q "^GEMINI_API_KEY=" .env.local; then
  fail ".env.local içinde GEMINI_API_KEY yok"
  echo "    https://aistudio.google.com/apikey adresinden anahtar al, .env.local içine yaz."
  exit 1
fi
ok ".env.local var ve GEMINI_API_KEY tanımlı"

# 2) Kalite kapısı: lint + test + build
step "Lint çalıştırıyorum"
npm run lint
ok "Lint temiz"

step "Test'leri koşturuyorum"
npm test
ok "Tüm testler geçti"

step "Production build alıyorum"
GEMINI_API_KEY=dummy_build_only npm run build
ok "Build başarılı"

# 3) Git commit
step "Git commit hazırlığı"
git add -A
if git diff --cached --quiet; then
  warn "Stage'lenecek değişiklik yok — bir önceki commit'i kullanacağız"
else
  COMMIT_MSG="feat: ilk sürüm — Next.js 16 + Gemini + Zod + Zustand + canlı Trends

- 4 sayfa (Landing, Dashboard, Optimizer, Bütçe Pilotu)
- 6 API route: insights (+stream), title-optimize, budget-plan, trends, category-trends, chat
- Zod end-to-end validation, TanStack Query, Zustand persist
- Gemini 2.5 Flash + streaming + 1 retry + responseSchema
- Google Trends server-side fetcher: browser headers + cookie warming + circuit breaker
- Deterministik finans matematiği (ROI/kâr/ciro server-side hesap)
- Sonner toasts, AI Chat panel, OG image, brand'li 404
- 28 vitest unit test, lint clean, GitHub Actions CI, husky pre-commit
- Vercel Analytics + Speed Insights + rate limiting

BTK Akademi Hackathon 2026 — Finans + E-Ticaret"
  git commit -m "$COMMIT_MSG"
  ok "İlk commit atıldı"
fi

# 4) GitHub repo
step "GitHub repo kontrolü"
if git remote get-url origin >/dev/null 2>&1; then
  REMOTE_URL="$(git remote get-url origin)"
  ok "Repo zaten bağlı: $REMOTE_URL"
  git push -u origin "$(git branch --show-current)" 2>&1 || warn "push sırasında uyarı oldu"
else
  REPO_NAME="ticari-zeka"
  step "GitHub'da repo oluşturuyorum: $GH_USER/$REPO_NAME"
  gh repo create "$REPO_NAME" \
    --public \
    --source=. \
    --remote=origin \
    --push \
    --description "KOBİ E-Ticaret için AI Reklam & Bütçe Pilotu — BTK Akademi Hackathon 2026 (Gemini 2.5 + Next.js 16)" \
    --homepage "https://${REPO_NAME}.vercel.app"
  ok "Repo açıldı + push edildi"
fi

# 5) Vercel link + env + deploy
step "Vercel projesini hazırlıyorum"

if [ ! -d .vercel ]; then
  # Yeni proje linkle (yes ile preset kabul et)
  npx vercel link --yes --project ticari-zeka >/dev/null 2>&1 || \
    npx vercel link --yes
  ok "Vercel projesi link'lendi"
else
  ok "Vercel projesi zaten bağlı (.vercel/ klasörü var)"
fi

step "GEMINI_API_KEY'i Vercel'e (production) ekliyorum"
GEMINI_KEY="$(grep "^GEMINI_API_KEY=" .env.local | cut -d= -f2- | tr -d '"' | tr -d "'")"
# Önce varsa kaldır (idempotent), sonra ekle
npx vercel env rm GEMINI_API_KEY production --yes 2>/dev/null || true
echo "$GEMINI_KEY" | npx vercel env add GEMINI_API_KEY production
ok "GEMINI_API_KEY production'a eklendi"

step "Production deploy alıyorum"
DEPLOY_URL="$(npx vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy.log | grep -E '^https?://' | tail -1)"
if [ -z "$DEPLOY_URL" ]; then
  fail "Deploy URL'i alınamadı — /tmp/vercel-deploy.log içine bak"
  exit 1
fi
ok "Deploy tamamlandı"

printf "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
printf "${GREEN}  🚀 Canlı URL:${RESET} %s\n" "$DEPLOY_URL"
printf "${GREEN}  📦 Repo:${RESET}      https://github.com/${GH_USER}/ticari-zeka\n"
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"

step "Smoke test"
sleep 5
for path in / /dashboard /optimizer /budget; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOY_URL}${path}")
  if [ "$code" = "200" ]; then
    ok "${path} → ${code}"
  else
    warn "${path} → ${code} (deploy henüz hazır olmayabilir, biraz bekleyip tekrar dene)"
  fi
done

printf "\n${GREEN}✓ Hazırsın. Bu URL'yi BTK Akademi submission formuna yapıştır.${RESET}\n\n"
