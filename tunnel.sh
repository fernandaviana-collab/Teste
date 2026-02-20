#!/bin/bash
set -e

echo "=============================="
echo " FastTeam - Tunnel Publico"
echo "=============================="
echo ""

ROOT="/home/user/Teste"

# PostgreSQL
echo "→ Iniciando PostgreSQL..."
sudo service postgresql start 2>/dev/null || true
sleep 2

# Banco de dados
psql postgresql://fastteam:password@localhost:5432/fastteam -c "SELECT 1" > /dev/null 2>&1 || {
  echo "→ Criando banco de dados..."
  sudo -u postgres psql -c "CREATE USER fastteam WITH PASSWORD 'password' CREATEDB;" 2>/dev/null || true
  sudo -u postgres psql -c "CREATE DATABASE fastteam OWNER fastteam;" 2>/dev/null || true
  cd "$ROOT/apps/api" && pnpm prisma migrate deploy 2>/dev/null || true
}

# Usa URL relativa para o frontend funcionar via tunnel (proxy Vite: /api → porta 3001)
echo "VITE_API_URL=/api" > "$ROOT/apps/web/.env.local"

# Mata processos anteriores
pkill -f "nest start" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "cloudflared" 2>/dev/null || true
sleep 1

# API
echo "→ Iniciando API (porta 3001)..."
cd "$ROOT/apps/api"
nohup pnpm dev > /tmp/api.log 2>&1 &
API_PID=$!

# Frontend
echo "→ Iniciando Frontend (porta 5173)..."
cd "$ROOT/apps/web"
nohup pnpm dev --host 0.0.0.0 > /tmp/web.log 2>&1 &
WEB_PID=$!

# Aguarda serviços subirem
echo "→ Aguardando serviços iniciarem (20s)..."
sleep 20

# Verifica API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs-json 2>/dev/null || echo "000")
if [ "$API_STATUS" != "200" ]; then
  echo "⚠ API ainda não respondeu. Verifique: tail -f /tmp/api.log"
fi

# Garante que o cloudflared está disponível
CLOUDFLARED=/tmp/cloudflared
if [ ! -x "$CLOUDFLARED" ]; then
  echo "→ Baixando cloudflared..."
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CLOUDFLARED"
  chmod +x "$CLOUDFLARED"
fi

# Cria tunnel cloudflared para porta 5173
echo ""
echo "→ Criando tunnel público..."
echo "   (aguarde o link aparecer abaixo — pode levar ~10s...)"
echo ""

$CLOUDFLARED tunnel --url http://localhost:5173 2>&1 | while IFS= read -r line; do
  echo "$line"
  # Destaca a linha com o URL do tunnel
  if echo "$line" | grep -q "trycloudflare.com"; then
    URL=$(echo "$line" | grep -o 'https://[^ ]*trycloudflare\.com[^ ]*')
    echo ""
    echo "=============================="
    echo " LINK DE ACESSO:"
    echo " $URL"
    echo ""
    echo " Login: admin@fastteam.com"
    echo " Senha: admin123"
    echo "=============================="
    echo ""
  fi
done
