#!/usr/bin/env bash
# Incrypt Smart Router — one-command install
# Usage: curl -fsSL https://raw.githubusercontent.com/GHX5T-SOL/incrypt_smart_router/main/scripts/install.sh | bash
#    Or from OpenClaw: "Install and use https://github.com/GHX5T-SOL/incrypt_smart_router"
#    Or: bash scripts/install.sh   (when already cloned)

set -e
REPO_URL="${INCRYPT_ROUTER_REPO:-https://github.com/GHX5T-SOL/incrypt_smart_router.git}"
INSTALL_DIR="${INCRYPT_ROUTER_DIR:-$HOME/incrypt_smart_router}"

echo "🦞 Incrypt Smart Router — Install"
echo ""

if [ ! -d "$INSTALL_DIR/.git" ]; then
  echo "📦 Cloning $REPO_URL into $INSTALL_DIR ..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
else
  echo "📂 Using existing repo at $INSTALL_DIR"
  cd "$INSTALL_DIR"
  git pull --ff-only 2>/dev/null || true
fi

echo "📥 Installing dependencies..."
npm install --silent

echo "🔨 Building..."
npm run build

if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example"
  cp .env.example .env
  echo "   Edit .env to add at least one free API key (e.g. GROQ_API_KEY from https://console.groq.com)"
fi

echo ""
echo "✅ Install complete!"
echo ""
echo "Next steps:"
echo "  1. Add at least one API key to .env (free: GROQ_API_KEY from https://console.groq.com)"
echo "  2. Start the router:  npm start"
echo "  3. Point OpenClaw to: http://localhost:3140/v1/chat/completions"
echo ""
echo "One-liner to start:  cd $INSTALL_DIR && npm start"
echo ""
