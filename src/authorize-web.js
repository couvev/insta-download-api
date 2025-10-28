import { google } from "googleapis";
import fs from "fs";
import http from "http";
import { URL } from "url";
import open from "open";

const TOKEN_PATH = "./token.json";
const CREDENTIALS_PATH = "./oauth-credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

/**
 * Script de autorização usando servidor local (para credenciais Web)
 */
async function authorizeWeb() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(
      `\n❌ Arquivo de credenciais não encontrado: ${CREDENTIALS_PATH}\n`
    );
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = credentials.web || credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n🚀 Abrindo navegador para autorização...\n");
  console.log("Se o navegador não abrir, acesse:\n");
  console.log(authUrl);
  console.log("\n⏳ Aguardando autorização...\n");

  // Criar servidor temporário para receber o callback
  const server = http.createServer(async (req, res) => {
    if (req.url.indexOf("/oauth2callback") > -1) {
      const qs = new URL(req.url, REDIRECT_URI).searchParams;
      const code = qs.get("code");

      res.end("✅ Autorização concluída! Você pode fechar esta janela.");

      server.close();

      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log("✅ Token salvo com sucesso em:", TOKEN_PATH);
        console.log("✅ Você já pode usar a API!\n");
        process.exit(0);
      } catch (error) {
        console.error("\n❌ Erro ao obter o token:", error.message);
        process.exit(1);
      }
    }
  });

  server.listen(3000, () => {
    // Abrir navegador automaticamente
    open(authUrl);
  });
}

authorizeWeb();
