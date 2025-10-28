import { google } from "googleapis";
import fs from "fs";
import readline from "readline";

const TOKEN_PATH = "./token.json";
const CREDENTIALS_PATH = "./oauth-credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Script para autorizar o aplicativo e gerar o token de acesso
 */
async function authorize() {
  // Verificar se o arquivo de credenciais existe
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(
      `\n❌ Arquivo de credenciais não encontrado: ${CREDENTIALS_PATH}\n`
    );
    console.log("📋 Siga estes passos:");
    console.log("1. Acesse: https://console.cloud.google.com/apis/credentials");
    console.log('2. Clique em "+ CREATE CREDENTIALS" → "OAuth client ID"');
    console.log('3. Tipo de aplicativo: "Desktop app"');
    console.log("4. Baixe o arquivo JSON");
    console.log(`5. Salve como: ${CREDENTIALS_PATH}\n`);
    process.exit(1);
  }

  // Carregar credenciais
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  // Suportar diferentes formatos de credenciais
  let client_id, client_secret, redirect_uris;

  if (credentials.installed) {
    ({ client_id, client_secret, redirect_uris } = credentials.installed);
  } else if (credentials.web) {
    ({ client_id, client_secret } = credentials.web);
    // Para credenciais web sem redirect_uris, usar urn:ietf:wg:oauth:2.0:oob (out-of-band)
    redirect_uris = credentials.web.redirect_uris || [
      "urn:ietf:wg:oauth:2.0:oob",
    ];
  } else {
    console.error("\n❌ Formato de credenciais inválido!");
    console.log("O arquivo deve conter 'installed' ou 'web'");
    console.log("\nFormato esperado:");
    console.log(
      JSON.stringify(
        {
          installed: {
            client_id: "...",
            client_secret: "...",
            redirect_uris: ["http://localhost"],
          },
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Gerar URL de autorização
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n🔐 Autorize este aplicativo visitando a URL abaixo:\n");
  console.log(authUrl);
  console.log("\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Digite o código de autorização: ", async (code) => {
    rl.close();

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      // Salvar o token
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log("\n✅ Token salvo com sucesso em:", TOKEN_PATH);
      console.log("✅ Você já pode usar a API!\n");
    } catch (error) {
      console.error("\n❌ Erro ao obter o token:", error.message);
      process.exit(1);
    }
  });
}

authorize();
