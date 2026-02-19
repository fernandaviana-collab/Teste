# FastTeam 🍔⚡

**Plataforma SaaS all-in-one para gestão de pessoas em fast food.**

FastTeam resolve os principais desafios de RH do setor de fast food com:
- Recrutamento inteligente com score de candidatos por IA (OpenAI)
- Banco de trabalhadores intermitentes on-demand com matching automático
- Gamificação com pontos, conquistas e ranking
- Gestão de escalas e ponto digital
- Dashboard executivo multi-loja

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Query |
| Backend | NestJS 10 + TypeScript + Prisma ORM |
| Banco de Dados | PostgreSQL 16 + Redis 7 |
| IA | OpenAI GPT-4 API |
| Infra | Docker + Docker Compose |

---

## Estrutura do Projeto

```
fastteam/
├── apps/
│   ├── web/          # Frontend React (gestor)
│   └── api/          # Backend NestJS
├── packages/
│   ├── database/     # Prisma schema + migrations
│   ├── types/        # TypeScript types compartilhados
│   └── utils/        # Utilitários
├── docker-compose.yml
└── turbo.json
```

---

## 🚀 Como Rodar (Desenvolvimento)

### Pré-requisitos

- Node.js 20+
- pnpm 8+
- Docker + Docker Compose

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd fastteam
pnpm install
```

### 2. Subir infra (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 3. Configurar variáveis de ambiente

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env e adicione sua OPENAI_API_KEY (opcional para MVP)
```

### 4. Rodar migrations e seed

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
cd packages/database
npx ts-node prisma/seed.ts
cd ../..
```

### 5. Rodar a aplicação

```bash
# Terminal 1 - API (http://localhost:3001)
cd apps/api
pnpm dev

# Terminal 2 - Frontend (http://localhost:5173)
cd apps/web
pnpm dev
```

### 6. Acessar

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:3001 |
| **Swagger Docs** | http://localhost:3001/api/docs |
| **pgAdmin** | http://localhost:5050 (admin@fastteam.com / admin) |

---

## 👤 Contas de Demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@fastteam.com | admin123 |
| Gestor | manager@fastteam.com | admin123 |
| Funcionário | funcionario@fastteam.com | admin123 |
| Intermitente | intermitente@fastteam.com | admin123 |

---

## 📋 Módulos Implementados (MVP)

### Backend (NestJS)
- ✅ Auth (JWT login/logout)
- ✅ CRUD Companies, Stores, Users
- ✅ Módulo Jobs (criar, publicar, fechar vagas)
- ✅ Módulo Candidates (pipeline Kanban + score IA)
- ✅ Módulo Employees (cadastro, ponto digital)
- ✅ Módulo Intermittent (workers, gigs, matching por geolocalização)
- ✅ Módulo Gamification (pontos, conquistas, leaderboard)
- ✅ Dashboard (métricas, gráficos)
- ✅ Swagger API Docs

### Frontend (React)
- ✅ Login (com demo credentials)
- ✅ Dashboard com métricas e gráficos (Recharts)
- ✅ Lista de Vagas + criar vaga + gerar descrição com IA
- ✅ Pipeline Kanban de Candidatos + score IA
- ✅ Lista e perfil de Funcionários (com check-in)
- ✅ Lista de Trabalhadores Intermitentes
- ✅ Criação de Oportunidades de Gig
- ✅ Matching Dashboard (recomendação por proximidade + rating)
- ✅ Ranking (Leaderboard)
- ✅ Conquistas (Achievements)

---

## 🔑 Variáveis de Ambiente

### `apps/api/.env`

```env
DATABASE_URL="postgresql://fastteam:password@localhost:5432/fastteam"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="seu-secret-aqui"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-..."  # Opcional (score automático de candidatos)
PORT=3001
NODE_ENV=development
```

---

## 🗄️ Principais Entidades

- **Company** → Franqueadora
- **Store** → Unidade/loja
- **User** → Usuário (Admin, Gestor, Funcionário, Intermitente)
- **Employee** → Funcionário CLT vinculado a uma loja
- **IntermittentWorker** → Banco de talentos intermitentes
- **Job** → Vaga de emprego
- **Candidate** → Candidato em um processo seletivo
- **GigOpportunity** → Vaga temporária/urgente
- **GigMatch** → Vinculação de trabalhador a uma oportunidade
- **PointsLedger** → Ledger de pontos para gamificação
- **Achievement** → Conquistas disponíveis
- **TimeClock** → Registro de ponto

---

## 📌 Roadmap (Fase 2)

- [ ] App Mobile (React Native + Expo)
- [ ] Treinamento gamificado
- [ ] Plano de carreira estruturado
- [ ] Programa de indicações com bonificações
- [ ] Escala inteligente com IA
- [ ] Chatbot WhatsApp
- [ ] Integrações (LinkedIn, Indeed)
- [ ] Analytics avançado
- [ ] Deploy em produção (AWS/GCP)

---

*Desenvolvido com FastTeam MVP — Sprint 1-3*
