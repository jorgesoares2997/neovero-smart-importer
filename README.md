# Smart Importer (NSI)

O **Smart Importer** é uma solução corporativa de Engenharia Clínica e Manutenção focada em automatizar e higienizar a importação de inventários utilizando a inteligência artificial do Google Gemini.

## Arquitetura

O projeto é dividido em dois módulos principais:

1. **Frontend (`/nsi-frontend`)**
   - Framework: Next.js 14+ (App Router)
   - Linguagem: TypeScript
   - Estilização: Tailwind CSS v4
   - Componentes Visuais: Lucide React, TanStack Table (Data Grid)
   - Objetivo: Interface visual "white-label", reativa, focada na experiência do usuário para upload de planilhas, mapeamento semântico, auditoria visual (Data Grid) e exportação.

2. **Backend (`/nsi-backend`)**
   - Framework: Spring Boot 3.3
   - Linguagem: Java 21
   - Banco de Dados: PostgreSQL (via Spring Data JPA)
   - IA: Integração direta com a API do Google Gemini
   - Objetivo: Receber arquivos, ler cabeçalhos Apache POI, realizar inferência de mapeamento via AI prompt engineering, aplicar regras restritas de validação corporativa e exportar novos binários Excel padronizados. Arquivar históricos no PostgreSQL.

## Funcionalidades Principais

- **Upload Inteligente:** Arraste e solte arquivos `.xlsx`, `.xls` ou `.csv` sujos ou fora de padrão.
- **Inibição de Erros:** O sistema de IA mapeia automaticamente os nomes antigos das colunas para os padrões relacionais do sistema.
- **Data Grid em Tempo Real:** Validação visual antes e depois da higienização, com alertas inteligentes na UI (ex: detecção de números de série duplicados).
- **Banco de Dados Histórico:** Acompanhamento total do que foi processado, armazenando os metadados e permitindo o download a qualquer momento.

## Instruções Locais de Execução

### Banco de Dados
Para rodar a dependência do PostgreSQL localmente via Docker:
```bash
docker-compose up -d
```

### Backend (Spring Boot)
Dentro do diretório `/nsi-backend`:
```bash
mvn clean spring-boot:run
```
O servidor iniciará na porta `8080`.

### Frontend (Next.js)
Dentro do diretório `/nsi-frontend`:
```bash
pnpm install
pnpm run dev
```
Acesse `http://localhost:3000`.

---
*Este é um projeto corporativo utilitário construído para resolver problemas críticos de higienização de inventário e implantação de CMMS/EAM.*
