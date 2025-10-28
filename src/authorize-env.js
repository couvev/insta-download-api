import { google } from "googleapis";
import http from "http";
import { parse as parseUrl } from "url";
import open from "open";
import "dotenv/config";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Script para autorizar o OAuth2 usando credenciais do .env
 * Gera o refresh token e salva no .env automaticamente
 */
async function authorize() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("❌ Erro: Variáveis de ambiente não configuradas!");
    console.error("Configure no .env:");
    console.error("  - GOOGLE_CLIENT_ID");
    console.error("  - GOOGLE_CLIENT_SECRET");
    console.error("  - GOOGLE_REDIRECT_URI");
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  // Gera a URL de autorização
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Força a geração de um novo refresh token
  });

  console.log("\n🔐 Iniciando fluxo de autorização OAuth2...\n");
  console.log("📝 Abrindo navegador para autorização...");
  console.log("URL:", authUrl);

  // Abre o navegador automaticamente
  await open(authUrl);

  // Cria servidor temporário para receber o callback
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = parseUrl(req.url, true);

        if (url.pathname === "/oauth2callback") {
          const code = url.query.code;

          if (!code) {
            res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
            res.end("<h1>❌ Erro: Código de autorização não encontrado</h1>");
            reject(new Error("Código de autorização não encontrado"));
            return;
          }

          // Troca o código pelo token
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);

          // Salva o refresh token no .env
          if (tokens.refresh_token) {
            await updateEnvFile(tokens.refresh_token);

            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
              <h1>✅ Autorização concluída com sucesso!</h1>
              <p>Refresh token salvo no arquivo .env</p>
              <p>Você pode fechar esta janela.</p>
              <script>setTimeout(() => window.close(), 2000);</script>
            `);

            console.log("\n✅ Autorização concluída!");
            console.log("📝 Refresh token salvo no .env");
            console.log("🚀 Você já pode usar a API normalmente\n");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
              <h1>⚠️ Token recebido, mas sem refresh token</h1>
              <p>Isso pode acontecer se você já autorizou anteriormente.</p>
              <p>Use o refresh token anterior ou revogue o acesso e tente novamente.</p>
            `);

            console.log("\n⚠️ Nenhum refresh token foi retornado");
            console.log(
              "Isso pode acontecer se você já autorizou anteriormente."
            );
            console.log("Soluções:");
            console.log(
              "1. Revogue o acesso em: https://myaccount.google.com/permissions"
            );
            console.log("2. Execute este script novamente\n");
          }

          server.close();
          resolve(tokens);
        }
      } catch (error) {
        console.error("❌ Erro ao processar callback:", error.message);
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>❌ Erro ao processar autorização</h1>");
        server.close();
        reject(error);
      }
    });

    server.listen(3000, () => {
      console.log("🌐 Servidor temporário iniciado em http://localhost:3000");
      console.log("⏳ Aguardando autorização...\n");
    });
  });
}

/**
 * Atualiza o arquivo .env com o refresh token
 */
async function updateEnvFile(refreshToken) {
  const envPath = ".env";
  let envContent = fs.readFileSync(envPath, "utf-8");

  // Atualiza ou adiciona o GOOGLE_REFRESH_TOKEN
  if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
    envContent = envContent.replace(
      /GOOGLE_REFRESH_TOKEN=.*/,
      `GOOGLE_REFRESH_TOKEN=${refreshToken}`
    );
  } else {
    envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
  }

  fs.writeFileSync(envPath, envContent);
}

// Executa a autorização
authorize().catch((error) => {
  console.error("\n❌ Erro fatal:", error.message);
  process.exit(1);
});
