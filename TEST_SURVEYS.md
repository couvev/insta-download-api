# 🧪 Testes dos Novos Endpoints - Surveys

## 1. Criar uma nova pesquisa

```powershell
$body = @{ name = "Pesquisa - Pest Control Q4 2025" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/surveys/" -Method POST -Body $body -ContentType "application/json"
```

**Resultado esperado:**

```json
{
  "success": true,
  "message": "Pesquisa criada com sucesso",
  "survey": {
    "id": 1,
    "name": "Pesquisa - Pest Control Q4 2025",
    "sheets_url": "https://docs.google.com/spreadsheets/d/...",
    "created_at": "2025-10-27T..."
  }
}
```

---

## 2. Criar outra pesquisa

```powershell
$body = @{ name = "Pesquisa - Home Improvement" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/surveys/" -Method POST -Body $body -ContentType "application/json"
```

---

## 3. Listar todas as pesquisas

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/surveys/"
```

**Resultado esperado:**

```json
{
  "success": true,
  "total": 2,
  "surveys": [...]
}
```

---

## 4. Buscar por ID

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/surveys/?search=1"
```

---

## 5. Buscar por nome (parcial)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/surveys/?search=pest"
```

---

## 6. Adicionar vídeo a uma pesquisa

**Primeiro, pegue o `sheets_url` de uma pesquisa:**

```powershell
$surveys = Invoke-RestMethod -Uri "http://localhost:3000/surveys/"
$sheetsUrl = $surveys.surveys[0].sheets_url
```

**Então, adicione um vídeo:**

```powershell
$video = @{
    sheets_url = $sheetsUrl
    video_link = "https://www.instagram.com/reel/C4zW7kRuzPT/"
    hook = @{
        verbal = "Amazing tip!"
        written = "You won't believe this"
        visual = "Before and after transformation"
    }
    format = @("Talking Form", "Visual Reaction")
    content_pillars = @("Educational Videos")
    keywords = @("Pest Control", "Home Tips", "DIY")
    views = "19M"
    used = $true
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/save-to-sheets/" -Method POST -Body $video -ContentType "application/json"
```

---

## 7. Verificar contador de vídeos atualizado

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/surveys/?search=1"
```

O campo `total_videos` deve ter incrementado!

---

## 🎯 Teste Completo (Execute todos de uma vez)

```powershell
# 1. Criar pesquisa
Write-Host "`n=== Criando pesquisa ===" -ForegroundColor Cyan
$body = @{ name = "Teste - Reels Analysis" } | ConvertTo-Json
$survey = Invoke-RestMethod -Uri "http://localhost:3000/surveys/" -Method POST -Body $body -ContentType "application/json"
Write-Host "Pesquisa criada com ID: $($survey.survey.id)" -ForegroundColor Green

# 2. Adicionar vídeo
Write-Host "`n=== Adicionando vídeo ===" -ForegroundColor Cyan
$video = @{
    sheets_url = $survey.survey.sheets_url
    video_link = "https://www.instagram.com/reel/test123/"
    views = "1M"
    used = $false
} | ConvertTo-Json -Depth 5
$result = Invoke-RestMethod -Uri "http://localhost:3000/save-to-sheets/" -Method POST -Body $video -ContentType "application/json"
Write-Host "Vídeo adicionado!" -ForegroundColor Green

# 3. Verificar contador
Write-Host "`n=== Verificando contador ===" -ForegroundColor Cyan
$updated = Invoke-RestMethod -Uri "http://localhost:3000/surveys/?search=$($survey.survey.id)"
Write-Host "Total de vídeos: $($updated.surveys[0].total_videos)" -ForegroundColor Green

# 4. Listar todas
Write-Host "`n=== Listando todas as pesquisas ===" -ForegroundColor Cyan
$all = Invoke-RestMethod -Uri "http://localhost:3000/surveys/"
$all.surveys | Format-Table -Property id, name, total_videos, created_at

Write-Host "`n✅ Testes concluídos!" -ForegroundColor Green
```
