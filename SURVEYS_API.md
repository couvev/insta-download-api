# 📊 API de Gerenciamento de Pesquisas de Reels

## Novos Endpoints

### 1. Criar Nova Pesquisa (Planilha)

Cria uma nova planilha no Google Sheets e registra no sistema.

**Endpoint:** `POST /surveys/`

**Request Body:**

```json
{
  "name": "Pesquisa - Pest Control Q4 2025"
}
```

**Response (Sucesso):**

```json
{
  "success": true,
  "message": "Pesquisa criada com sucesso",
  "survey": {
    "id": 1,
    "name": "Pesquisa - Pest Control Q4 2025",
    "sheets_url": "https://docs.google.com/spreadsheets/d/ABC123...",
    "created_at": "2025-10-27T22:30:00.000Z"
  }
}
```

**Exemplo cURL (CMD):**

```cmd
curl -X POST "http://localhost:3000/surveys/" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Minha Pesquisa de Reels\"}"
```

**Exemplo PowerShell:**

```powershell
$body = @{ name = "Pesquisa - Pest Control Q4 2025" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/surveys/" -Method POST -Body $body -ContentType "application/json"
```

---

### 2. Buscar Pesquisas

Busca pesquisas por ID, nome ou URL. Se não fornecer parâmetro de busca, retorna todas.

**Endpoint:** `GET /surveys/`

**Parâmetros de Query:**

- `search` (opcional): Termo de busca (ID, nome ou URL)

**Exemplos:**

**Buscar todas:**

```bash
GET /surveys/
```

**Buscar por ID:**

```bash
GET /surveys/?search=1
```

**Buscar por nome:**

```bash
GET /surveys/?search=pest
```

**Buscar por URL:**

```bash
GET /surveys/?search=ABC123
```

**Response (Sucesso):**

```json
{
  "success": true,
  "total": 2,
  "surveys": [
    {
      "id": 1,
      "name": "Pesquisa - Pest Control Q4 2025",
      "sheets_url": "https://docs.google.com/spreadsheets/d/ABC123...",
      "created_at": "2025-10-27T22:30:00.000Z",
      "total_videos": 5
    },
    {
      "id": 2,
      "name": "Pesquisa - Home Improvement",
      "sheets_url": "https://docs.google.com/spreadsheets/d/XYZ789...",
      "created_at": "2025-10-27T23:00:00.000Z",
      "total_videos": 3
    }
  ]
}
```

**Exemplo cURL:**

```cmd
curl "http://localhost:3000/surveys/"
curl "http://localhost:3000/surveys/?search=pest"
curl "http://localhost:3000/surveys/?search=1"
```

**Exemplo PowerShell:**

```powershell
# Todas as pesquisas
Invoke-RestMethod -Uri "http://localhost:3000/surveys/"

# Buscar por nome
Invoke-RestMethod -Uri "http://localhost:3000/surveys/?search=pest"

# Buscar por ID
Invoke-RestMethod -Uri "http://localhost:3000/surveys/?search=1"
```

---

### 3. Salvar Vídeo em Pesquisa (Atualizado)

O endpoint `/save-to-sheets/` foi atualizado para incrementar automaticamente o contador de vídeos da pesquisa.

**Endpoint:** `POST /save-to-sheets/`

**Request Body:**

```json
{
  "sheets_url": "https://docs.google.com/spreadsheets/d/ABC123...",
  "video_link": "https://www.instagram.com/reel/C4zW7kRuzPT/",
  "hook": {
    "verbal": "Yes! It's just a little snack",
    "written": "It must be Spring",
    "visual": "Ants eating poison"
  },
  "format": ["Talking Form", "Visual Reaction"],
  "content_pillars": ["Educational Videos"],
  "keywords": ["Pest Control", "Home Tips"],
  "views": "19M",
  "used": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dados salvos com sucesso no Google Sheets",
  "details": {
    "success": true,
    "updatedRange": "Videos!A2:J2",
    "updatedRows": 1
  }
}
```

---

## 📁 Estrutura de Dados

### Arquivo `surveys.json`

```json
{
  "surveys": [
    {
      "id": 1,
      "name": "Pesquisa - Pest Control Q4 2025",
      "sheets_url": "https://docs.google.com/spreadsheets/d/ABC123...",
      "created_at": "2025-10-27T22:30:00.000Z",
      "total_videos": 5
    }
  ],
  "nextId": 2
}
```

### Estrutura da Planilha Criada

Cada planilha criada terá:

- **Nome da aba:** "Videos"
- **Cabeçalhos (linha 1):**

  - Video Link
  - Hook Verbal
  - Hook Written
  - Hook Visual
  - Format
  - Content Pillars
  - Keywords
  - Views
  - Used
  - Created At

- **Formatação:**
  - Linha de cabeçalho congelada
  - Cabeçalhos em negrito com fundo cinza

---

## 🔄 Fluxo de Trabalho Completo

### 1. Criar uma nova pesquisa

```bash
POST /surveys/
Body: { "name": "Minha Pesquisa" }
```

### 2. Usar o `sheets_url` retornado para adicionar vídeos

```bash
POST /save-to-sheets/
Body: {
  "sheets_url": "URL_RETORNADA_NO_PASSO_1",
  "video_link": "...",
  "hook": {...},
  ...
}
```

### 3. Consultar todas as pesquisas

```bash
GET /surveys/
```

### 4. Buscar pesquisa específica

```bash
GET /surveys/?search=1
GET /surveys/?search=nome
GET /surveys/?search=url
```

---

## 📝 Notas

- O contador `total_videos` é incrementado automaticamente sempre que um vídeo é adicionado via `/save-to-sheets/`
- O arquivo `surveys.json` é criado automaticamente na primeira execução
- As pesquisas recebem IDs incrementais automaticamente (1, 2, 3, ...)
- A busca por nome e URL é case-insensitive e aceita correspondência parcial
- A busca por ID busca correspondência exata

---

## ⚠️ Requisitos

- OAuth2 configurado (arquivo `token.json` deve existir)
- Execute `node src/authorize-web.js` antes de usar se ainda não tiver o token
