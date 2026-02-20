#!/bin/bash
set -e

echo "🚀 Iniciando FastTeam..."

# PostgreSQL
echo "→ Iniciando PostgreSQL..."
sudo service postgresql start 2>/dev/null || true
sleep 2

# Verifica se o banco existe, se não cria
psql postgresql://fastteam:password@localhost:5432/fastteam -c "SELECT 1" > /dev/null 2>&1 || {
  echo "→ Criando banco de dados..."
  sudo -u postgres psql -c "CREATE USER fastteam WITH PASSWORD 'password' CREATEDB;" 2>/dev/null || true
  sudo -u postgres psql -c "CREATE DATABASE fastteam OWNER fastteam;" 2>/dev/null || true
}

# API
echo "→ Iniciando API (porta 3001)..."
pkill -f "nest start" 2>/dev/null || true
cd /home/user/Teste/apps/api
nohup pnpm dev > /tmp/api.log 2>&1 &
echo "  API PID: $!"

# Frontend
echo "→ Iniciando Frontend (porta 5173)..."
pkill -f "vite" 2>/dev/null || true
cd /home/user/Teste/apps/web
nohup pnpm dev --host 0.0.0.0 > /tmp/web.log 2>&1 &
echo "  Web PID: $!"

# Aguarda a API iniciar
echo "→ Aguardando serviços..."
sleep 12

# Verifica
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs-json 2>/dev/null || echo "000")
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")

echo ""
echo "=============================="
if [ "$API_STATUS" = "200" ]; then
  echo "✅ API:      http://localhost:3001"
  echo "✅ Swagger:  http://localhost:3001/api/docs"
else
  echo "❌ API não respondeu (verifique: tail -f /tmp/api.log)"
fi

if [ "$WEB_STATUS" = "200" ]; then
  echo "✅ Frontend: http://localhost:5173"
else
  echo "❌ Frontend não respondeu (verifique: tail -f /tmp/web.log)"
fi
echo "=============================="
echo ""
echo "Login: admin@fastteam.com / admin123"
