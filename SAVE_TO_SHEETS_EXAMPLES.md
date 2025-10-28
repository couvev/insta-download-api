# Exemplos de JSON para /save-to-sheets/

## Formato 1: Campos com espaços (como no Excel/Sheets)

```json
{
  "SheetsURL": "https://docs.google.com/spreadsheets/d/SEU_ID_AQUI",
  "Video Link": "https://www.instagram.com/reel/C4zW7kRuzPT/",
  "Hook Verbal": "Yes! It's just a little snack",
  "Hook Written": "It must be Spring",
  "Hook Visual": "Ants eating poison, thinking it's food",
  "Format": "Talking Form, Visual Reaction",
  "Content Pillars": "Educational Videos, Home Tips",
  "Keywords": "Pest Control, Home Tips, DIY",
  "Views": "19M",
  "Used": true
}
```

## Formato 2: Snake case (programático)

```json
{
  "sheets_url": "https://docs.google.com/spreadsheets/d/SEU_ID_AQUI",
  "video_link": "https://www.instagram.com/reel/C4zW7kRuzPT/",
  "hook_verbal": "Yes! It's just a little snack",
  "hook_written": "It must be Spring",
  "hook_visual": "Ants eating poison, thinking it's food",
  "format": "Talking Form, Visual Reaction",
  "content_pillars": "Educational Videos, Home Tips",
  "keywords": "Pest Control, Home Tips, DIY",
  "views": "19M",
  "used": true
}
```

## Formato 3: Nested (antigo - ainda suportado)

```json
{
  "sheets_url": "https://docs.google.com/spreadsheets/d/SEU_ID_AQUI",
  "video_link": "https://www.instagram.com/reel/C4zW7kRuzPT/",
  "hook": {
    "verbal": "Yes! It's just a little snack",
    "written": "It must be Spring",
    "visual": "Ants eating poison, thinking it's food"
  },
  "format": ["Talking Form", "Visual Reaction"],
  "content_pillars": ["Educational Videos", "Home Tips"],
  "keywords": ["Pest Control", "Home Tips", "DIY"],
  "views": "19M",
  "used": true
}
```

## Teste com cURL (CMD)

### Formato 1:

```cmd
curl -X POST "http://localhost:3000/save-to-sheets/" ^
  -H "Content-Type: application/json" ^
  -d "{\"SheetsURL\": \"https://docs.google.com/spreadsheets/d/1B4fadj5Sq6PMb4_RcCcU5A08-7Msu1WrGqEdKfpyNq0\", \"Video Link\": \"https://www.instagram.com/reel/test123/\", \"Hook Verbal\": \"Amazing!\", \"Hook Written\": \"You won't believe\", \"Hook Visual\": \"Transformation\", \"Format\": \"Talking Form\", \"Content Pillars\": \"Educational\", \"Keywords\": \"Tips\", \"Views\": \"1M\", \"Used\": true}"
```

### Formato 2:

```cmd
curl -X POST "http://localhost:3000/save-to-sheets/" ^
  -H "Content-Type: application/json" ^
  -d "{\"sheets_url\": \"https://docs.google.com/spreadsheets/d/1B4fadj5Sq6PMb4_RcCcU5A08-7Msu1WrGqEdKfpyNq0\", \"video_link\": \"https://www.instagram.com/reel/test123/\", \"hook_verbal\": \"Amazing!\", \"hook_written\": \"You won't believe\", \"hook_visual\": \"Transformation\", \"format\": \"Talking Form\", \"content_pillars\": \"Educational\", \"keywords\": \"Tips\", \"views\": \"1M\", \"used\": true}"
```

## Teste com PowerShell

### Formato 1:

```powershell
$body = @{
    "SheetsURL" = "https://docs.google.com/spreadsheets/d/1B4fadj5Sq6PMb4_RcCcU5A08-7Msu1WrGqEdKfpyNq0"
    "Video Link" = "https://www.instagram.com/reel/test123/"
    "Hook Verbal" = "Amazing tip!"
    "Hook Written" = "You won't believe this"
    "Hook Visual" = "Before and after"
    "Format" = "Talking Form, Visual Reaction"
    "Content Pillars" = "Educational Videos"
    "Keywords" = "Tips, DIY, Home"
    "Views" = "1M"
    "Used" = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/save-to-sheets/" -Method POST -Body $body -ContentType "application/json"
```

### Formato 2:

```powershell
$body = @{
    sheets_url = "https://docs.google.com/spreadsheets/d/1B4fadj5Sq6PMb4_RcCcU5A08-7Msu1WrGqEdKfpyNq0"
    video_link = "https://www.instagram.com/reel/test123/"
    hook_verbal = "Amazing tip!"
    hook_written = "You won't believe this"
    hook_visual = "Before and after"
    format = "Talking Form, Visual Reaction"
    content_pillars = "Educational Videos"
    keywords = "Tips, DIY, Home"
    views = "1M"
    used = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/save-to-sheets/" -Method POST -Body $body -ContentType "application/json"
```

## Notas

- ✅ Todos os 3 formatos são suportados
- ✅ Arrays são automaticamente convertidos para strings separadas por vírgula
- ✅ O campo `Used` aceita boolean (true/false) ou string ("Sim"/"Não")
- ✅ Campos vazios são permitidos (só `SheetsURL`/`sheets_url` e `Video Link`/`video_link` são obrigatórios)
- ✅ A data de criação é adicionada automaticamente
