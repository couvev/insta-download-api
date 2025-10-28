# API de Download de Vídeos do Instagram

Este é um projeto de API simples para realizar o download de vídeos do Instagram. Utiliza o framework Fastify para fornecer endpoints de download.

## Como Usar

### Instalação

Certifique-se de ter o Node.js instalado. Em seguida, execute:

```bash
npm install
```
ou

```bash
yarn
```

### Execução

Para iniciar o servidor, utilize o seguinte comando:

```bash
node index.js
```

O servidor estará disponível em http://localhost:3000 por padrão.

### Endpoint de Download

Para baixar um vídeo do Instagram, acesse o seguinte endpoint:

```
GET /download/?url=Link-do-video-instagram
```

Certifique-se de substituir "Link-do-video-instagram" pela URL do vídeo desejado.

#### Exemplo de Uso

```bash
curl http://localhost:3000/download/?url=https://www.instagram.com/p/1234567890/
```

Isso retornará um JSON com a URL do vídeo disponível para download.

```json
{
  "videoUrl": "..."
}
```

Baseado no projeto [instagram-video-downloader](https://github.com/riad-azz/instagram-video-downloader)
### Endpoint de Integra��o com Google Sheets

Para salvar dados de an�lise de v�deos do Instagram diretamente em uma planilha do Google Sheets:

``n`POST /save-to-sheets/
`Content-Type: application/json
``n
#### Configura��o

Antes de usar este endpoint, voc� precisa configurar as credenciais do Google Sheets API.
Consulte o arquivo [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para instru��es detalhadas.

#### Exemplo de Uso com cURL

``bash
curl -X POST http://localhost:3000/save-to-sheets/ \
  -H "Content-Type: application/json" \
  -d @test-payload.json
``
