<div align="center">
  <img src="nsi-frontend/public/favicon.ico" alt="NSI" width="120" />
</div>

# Neovero Smart Importer (NSI)

> **Processamento de dados hospitalares com Inteligência Artificial.**

O NSI é um sistema B2B moderno projetado para higienizar, normalizar e padronizar planilhas legadas de inventário hospitalar utilizando a inteligência semântica do Google Gemini 2.5. O sistema elimina dias de trabalho manual, mapeando colunas desconhecidas para o padrão exato exigido pelo ERP Neovero.

[![Deploy Backend](https://img.shields.io/badge/Render-Backend%20Live-blue)](https://render.com)
[![Deploy Frontend](https://img.shields.io/badge/Vercel-Frontend%20Live-black)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/GitHub-Private-black)]()

---

## Problem Statement

Planilhas de inventário de hospitais adquiridos (M&A) chegam com estruturas caóticas: colunas com nomes bizarros, siglas proprietárias e dados concatenados. O processo de "De-Para" manual para importar no ERP Neovero levava semanas e era propenso a erros. O NSI automatiza essa carga semântica usando LLMs, reduzindo o tempo de setup de semanas para segundos.

---

## Features Principais

### Importação Inteligente (AI-Driven)
O usuário faz upload de um Excel caótico. O sistema envia uma amostra para o Gemini 2.5, que infere o significado das colunas e monta um mapeamento semântico automático para o formato padrão do CMMS.

### Gerenciador de Regras Globais (AI Engine)
Painel onde administradores configuram regras fixas de "De-Para" no banco de dados. Essas regras são injetadas diretamente no *System Prompt* do Gemini, garantindo que o modelo aprenda os jargões específicos de grupos hospitalares (ex: "Sempre que ler LOCALIDADE, traduza para Setor").

### Data Grid Avançado e Histórico
Tabela de alta performance (TanStack Table v8) com *Stale-While-Revalidate* cache. Permite visualização e validação das planilhas processadas. 

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 14 + Tailwind CSS v4 (Vercel)                  │
│  React Hook Form · Zustand (Auth) · TanStack Table      │
│  Lucide Icons · SheetJS (XLSX)                          │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
┌────────────────────────▼─────────────────────────────────┐
│  Spring Boot 3 + Java 21 (Render)                       │
│  PostgreSQL via Supabase Pooler                         │
│  Google Vertex AI / Gemini 2.5 SDK                      │
│  Apache POI (Geração Nativa de Excel)                   │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Engine | Google Gemini 2.5 Flash / Flash-8b Pool Fallback |
| Frontend | Next.js 14 · Tailwind CSS v4 · TypeScript |
| Gerência de Estado | Zustand |
| Tabelas e Dados | TanStack Table v8 · SheetJS |
| Backend | Spring Boot 3 · Java 21 · Spring Data JPA |
| Manipulação Excel | Apache POI (SXSSFWorkbook de alta performance) |
| Database | PostgreSQL (Supabase) via IPv4 Pooler |
| Auth | Supabase Auth (pgcrypto backend-seeded) |
| Hosting | Vercel (frontend) · Render (backend) |

---

## AI Engine & Resilience

O coração do sistema é o `GeminiMatcherService`. 

### Pool de Modelos e Fallback Automático
O sistema usa um pool sequencial para contornar limites de uso (Rate Limits) ou indisponibilidade da API do Google:
1. `gemini-2.5-flash` (Padrão, altíssima capacidade de inferência)
2. `gemini-1.5-flash-8b` (Fallback 1, focado em velocidade)
3. `gemini-1.5-flash` (Fallback 2, resiliência extrema)

Se a API retornar erro 429 ou 503, o Java captura, realiza *backoff*, e pula para o próximo modelo do Pool automaticamente.

---

## Fluxo do Usuário

| Ação | Como funciona |
|---|---|
| `Upload` | Recebe arquivo `.xlsx` legado. |
| `Analyze` | Amostra de 20 linhas é extraída pelo Apache POI e enviada ao Gemini. |
| `Mapping` | Retorna JSON padronizado com os índices e nomes reais das colunas. |
| `Export` | Aplica as regras em 100% das linhas e gera arquivo binário formatado. |
| `History` | Cache local e requisição assíncrona exibem as matrizes sanitizadas. |

---

## Production Quality

- **Stale-While-Revalidate** — Cache imediato com LocalStorage para telas instantâneas.
- **Segurança Auth** — Admin criado via *seeding* PL/pgSQL direto no Supabase. Zero telas de registro abertas ao público.
- **Micro-animações** — Interface fluida usando diretivas do Tailwind (animate-in, slide-in, fade-in).
- **Tratamento de Exceções** — Try-catches encadeados impedem que a API caia por arquivos corrompidos.

---

## Local Development

### Prerequisites
- Node.js 20+ · pnpm
- Java 21 · Maven 3.9+
- Chave de API do Google AI Studio (Gemini)
- Projeto Supabase com Auth e PostgreSQL habilitados

### 1. Backend (Spring Boot)
```bash
cd nsi-backend
./mvnw clean spring-boot:run
# API rodará em http://localhost:8080
```

### 2. Frontend (Next.js)
```bash
cd nsi-frontend
pnpm install
pnpm run dev
# App rodará em http://localhost:3000
```

---

## Environment Variables

### Frontend (`nsi-frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

### Backend (`nsi-backend/.env`)
```env
GEMINI_API_KEY=<sua-chave-gemini>
SPRING_DATASOURCE_URL=jdbc:postgresql://<pooler-supabase>:6543/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.<seu-projeto>
SPRING_DATASOURCE_PASSWORD=<sua-senha>
```

---

## Database Schema (JPA Entities)

| Table | Purpose |
|---|---|
| `auth.users` | Supabase auth nativo (com seeding via `pgcrypto`) |
| `import_history` | Log completo das planilhas importadas, status, e BLOB do arquivo |
| `global_rules` | Regras globais injetadas no prompt do Gemini ("De-Para" forçado) |

---

## Repository Structure

```
neovero-smart-importer/
├── nsi-backend/       # Spring Boot REST API
│   ├── src/main/java/com/neovero/nsi/
│   │   ├── controller/ # Endpoints de importação e regras
│   │   ├── service/    # GeminiMatcherService (IA) e POI Excel Service
│   │   └── domain/     # Entidades JPA (GlobalRule, ImportHistory)
│   └── pom.xml
├── nsi-frontend/      # Next.js App
│   ├── src/app/       # Roteamento (Home, Histórico, Dashboard, Regras, Login)
│   ├── src/components/# Componentes reutilizáveis (Navbar, AuthWrapper)
│   └── src/store/     # Zustand Stores (AuthStore)
├── supabase_admin_seed.sql # Script DB para criação segura do Admin
└── README.md          # Documentação
```

---

## License
MIT
