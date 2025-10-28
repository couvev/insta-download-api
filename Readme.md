# API de Download de V√≠deos do Instagram

Este √© um projeto de API simples para realizar o download de v√≠deos do Instagram. Utiliza o framework Fastify para fornecer endpoints de download.

## Como Usar

### Instala√ß√£o

Certifique-se de ter o Node.js instalado. Em seguida, execute:

```bash
npm install
```
ou

```bash
yarn
```

### Execu√ß√£o

Para iniciar o servidor, utilize o seguinte comando:

```bash
node index.js
```

O servidor estar√° dispon√≠vel em http://localhost:3000 por padr√£o.

### Endpoint de Download

Para baixar um v√≠deo do Instagram, acesse o seguinte endpoint:

```
GET /download/?url=Link-do-video-instagram
```

Certifique-se de substituir "Link-do-video-instagram" pela URL do v√≠deo desejado.

#### Exemplo de Uso

```bash
curl http://localhost:3000/download/?url=https://www.instagram.com/p/1234567890/
```

Isso retornar√° um JSON com a URL do v√≠deo dispon√≠vel para download.

```json
{
  "videoUrl": "..."
}
```

Baseado no projeto [instagram-video-downloader](https://github.com/riad-azz/instagram-video-downloader)
### Endpoint de IntegraÁ„o com Google Sheets

Para salvar dados de an·lise de vÌdeos do Instagram diretamente em uma planilha do Google Sheets:

``n`POST /save-to-sheets/
`Content-Type: application/json
``n
#### ConfiguraÁ„o

Antes de usar este endpoint, vocÍ precisa configurar as credenciais do Google Sheets API.
Consulte o arquivo [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para instruÁıes detalhadas.

#### Exemplo de Uso com cURL

``bash
curl -X POST http://localhost:3000/save-to-sheets/ \
  -H "Content-Type: application/json" \
  -d @test-payload.json
``
