import fs from "fs";

const CREDENTIALS_PATH = "./oauth-credentials.json";

console.log("\n🔍 Verificando arquivo de credenciais...\n");

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error("❌ Arquivo não encontrado:", CREDENTIALS_PATH);
  console.log("\n📋 Você precisa:");
  console.log("1. Acessar: https://console.cloud.google.com/apis/credentials");
  console.log('2. Criar OAuth client ID (tipo "Desktop app")');
  console.log("3. Baixar o JSON");
  console.log(`4. Salvar como: ${CREDENTIALS_PATH}\n`);
  process.exit(1);
}

try {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  console.log("✅ Arquivo encontrado!");
  console.log("\n📄 Estrutura do arquivo:");
  console.log(JSON.stringify(credentials, null, 2));

  let client_id, client_secret, redirect_uris;
  let type = null;

  if (credentials.installed) {
    type = "installed (Desktop app)";
    ({ client_id, client_secret, redirect_uris } = credentials.installed);
  } else if (credentials.web) {
    type = "web";
    ({ client_id, client_secret, redirect_uris } = credentials.web);
  }

  console.log("\n📊 Informações:");
  console.log("Tipo:", type || "❌ Não identificado");
  console.log("Client ID:", client_id ? "✅ Presente" : "❌ Ausente");
  console.log("Client Secret:", client_secret ? "✅ Presente" : "❌ Ausente");
  console.log(
    "Redirect URIs:",
    redirect_uris ? `✅ ${redirect_uris.length} URI(s)` : "❌ Ausente"
  );

  if (redirect_uris && redirect_uris.length > 0) {
    console.log("  →", redirect_uris.join(", "));
  }

  if (!type) {
    console.log("\n❌ ERRO: Formato inválido!");
    console.log("O arquivo deve ter uma propriedade 'installed' ou 'web'");
  } else if (!client_id || !client_secret || !redirect_uris) {
    console.log("\n❌ ERRO: Credenciais incompletas!");
  } else {
    console.log("\n✅ Credenciais válidas! Você pode executar:");
    console.log("   node src/authorize.js\n");
  }
} catch (error) {
  console.error("\n❌ Erro ao ler o arquivo:", error.message);
  console.log("Certifique-se de que o arquivo é um JSON válido.\n");
  process.exit(1);
}
