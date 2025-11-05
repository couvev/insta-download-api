import { google } from "googleapis";
import fs from "fs";
import "dotenv/config";

const TOKEN_PATH = "./token.json";
const CREDENTIALS_PATH = "./oauth-credentials.json";

/**
 * Cria e retorna um cliente OAuth2 autenticado
 * Prioriza variáveis de ambiente (.env) sobre arquivos JSON
 */
async function getAuthClient() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN,
  } = process.env;

  // Método 1: Usar variáveis de ambiente (.env) - PRIORIDADE
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback"
    );

    oAuth2Client.setCredentials({
      refresh_token: GOOGLE_REFRESH_TOKEN,
    });

    return oAuth2Client;
  }

  // Método 2: Fallback para arquivos JSON (compatibilidade)
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Autenticação não configurada!\n\n` +
        `Configure as variáveis no .env:\n` +
        `  - GOOGLE_CLIENT_ID\n` +
        `  - GOOGLE_CLIENT_SECRET\n` +
        `  - GOOGLE_REDIRECT_URI\n` +
        `  - GOOGLE_REFRESH_TOKEN\n\n` +
        `Execute: node src/authorize-env.js`
    );
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  // Suportar diferentes formatos de credenciais
  let client_id, client_secret, redirect_uris;

  if (credentials.installed) {
    ({ client_id, client_secret, redirect_uris } = credentials.installed);
  } else if (credentials.web) {
    ({ client_id, client_secret } = credentials.web);
    redirect_uris = credentials.web.redirect_uris || [
      "urn:ietf:wg:oauth:2.0:oob",
    ];
  } else {
    throw new Error(
      "Formato de credenciais inválido. O arquivo deve conter 'installed' ou 'web'"
    );
  }

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Verificar se já temos um token salvo
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  throw new Error(
    "Token não encontrado. Execute 'node src/authorize-env.js' para autorizar o aplicativo."
  );
}

/**
 * Adiciona uma linha de dados à planilha do Google Sheets
 * @param {string} sheetsUrl - URL da planilha do Google Sheets
 * @param {object} data - Dados a serem adicionados
 */
export async function addRowToSheet(sheetsUrl, data) {
  try {
    // Extrair o ID da planilha da URL
    const spreadsheetId = extractSpreadsheetId(sheetsUrl);

    if (!spreadsheetId) {
      throw new Error("URL da planilha inválida");
    }

    // Obter cliente autenticado
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Preparar os dados para inserção
    const rowData = prepareRowData(data);

    // Adicionar a linha à planilha (aba Videos)
    const range = "Videos!A:J";

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [rowData],
      },
    });

    // Extrair informações da linha inserida
    const updatedRange = response.data.updates.updatedRange;
    const match = updatedRange.match(/Videos!A(\d+):J(\d+)/);

    if (match) {
      const rowIndex = parseInt(match[1]) - 1; // Converter para índice baseado em 0

      // Obter o sheetId da aba "Videos"
      const spreadsheetInfo = await sheets.spreadsheets.get({
        spreadsheetId,
      });

      const videoSheet = spreadsheetInfo.data.sheets.find(
        (sheet) => sheet.properties.title === "Videos"
      );

      if (videoSheet) {
        const sheetId = videoSheet.properties.sheetId;
        const videoLink = data.video_link || data["Video Link"] || "";

        // Preparar formatação para cada célula
        const cellFormats = [
          // Coluna A - Video Link (URL clicável, azul, sublinhado)
          {
            userEnteredValue: videoLink
              ? { formulaValue: `=HYPERLINK("${videoLink}", "Ver Vídeo")` }
              : { stringValue: "" },
            userEnteredFormat: {
              backgroundColor: { red: 1, green: 1, blue: 1 },
              textFormat: {
                bold: false,
                foregroundColor: { red: 0.06, green: 0.46, blue: 0.78 },
                underline: true,
              },
              borders: {
                top: { style: "NONE" },
                bottom: { style: "NONE" },
                left: { style: "NONE" },
                right: { style: "NONE" },
              },
              horizontalAlignment: "LEFT",
              verticalAlignment: "MIDDLE",
              wrapStrategy: "WRAP",
            },
          },
          // Colunas B até J - Formatação padrão agradável
          ...Array(9)
            .fill(null)
            .map(() => ({
              userEnteredFormat: {
                backgroundColor: { red: 1, green: 1, blue: 1 },
                textFormat: {
                  bold: false,
                  foregroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  fontSize: 10,
                },
                borders: {
                  top: { style: "NONE" },
                  bottom: { style: "NONE" },
                  left: { style: "NONE" },
                  right: { style: "NONE" },
                },
                horizontalAlignment: "LEFT",
                verticalAlignment: "TOP",
                wrapStrategy: "WRAP",
              },
            })),
        ];

        // Formatar a linha inserida
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                updateCells: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: rowIndex,
                    endRowIndex: rowIndex + 1,
                    startColumnIndex: 0,
                    endColumnIndex: 10, // A até J (10 colunas)
                  },
                  fields: "userEnteredValue,userEnteredFormat",
                  rows: [
                    {
                      values: cellFormats,
                    },
                  ],
                },
              },
            ],
          },
        });
      }
    }

    return {
      success: true,
      updatedRange: response.data.updates.updatedRange,
      updatedRows: response.data.updates.updatedRows,
    };
  } catch (error) {
    console.error("Erro ao adicionar dados ao Google Sheets:", error);
    throw new Error(
      `Erro ao adicionar dados ao Google Sheets: ${error.message}`
    );
  }
}

/**
 * Extrai o ID da planilha de uma URL do Google Sheets
 * @param {string} url - URL da planilha
 * @returns {string|null} - ID da planilha ou null se inválido
 */
function extractSpreadsheetId(url) {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Prepara os dados para serem inseridos na planilha
 * @param {object} data - Dados recebidos
 * @returns {array} - Array com os valores na ordem correta
 */
function prepareRowData(data) {
  // Suportar ambos os formatos: novo (flat) e antigo (nested)
  const videoLink = data.video_link || data["Video Link"] || "";
  const contextoGeral = data.contexto_geral || data["Contexto Geral"] || "";
  const transcription = data.transcription || data["Transcription"] || "";
  const hookVerbal =
    data.hook_verbal || data["Hook Verbal"] || data.hook?.verbal || "";
  const hookWritten =
    data.hook_written || data["Hook Written"] || data.hook?.written || "";
  const hookVisual =
    data.hook_visual || data["Hook Visual"] || data.hook?.visual || "";

  let format = "";
  if (Array.isArray(data.format)) {
    format = data.format.join(", ");
  } else if (typeof data.format === "string") {
    format = data.format;
  } else if (data.Format) {
    format = data.Format;
  }

  let keywords = "";
  if (Array.isArray(data.keywords)) {
    keywords = data.keywords.join(", ");
  } else if (typeof data.keywords === "string") {
    keywords = data.keywords;
  } else if (data.Keywords) {
    keywords = data.Keywords;
  }

  const obs = data.obs || data["Obs"] || "";

  return [
    videoLink,
    contextoGeral,
    transcription,
    hookVerbal,
    hookWritten,
    hookVisual,
    format,
    keywords,
    obs,
    new Date().toISOString(),
  ];
}

/**
 * Cria uma nova planilha do Google Sheets para pesquisa de reels
 * @param {string} title - Título da planilha
 * @returns {object} - Informações da planilha criada
 */
export async function createSurveySheet(title) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Criar a planilha
    const response = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: title,
        },
        sheets: [
          {
            properties: {
              title: "Videos",
              gridProperties: {
                rowCount: 1000,
                columnCount: 11,
                frozenRowCount: 1, // Congelar linha de cabeçalho
              },
            },
          },
        ],
      },
    });

    const spreadsheetId = response.data.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // Obter o sheetId da primeira aba criada
    const sheetId = response.data.sheets[0].properties.sheetId;

    // Adicionar cabeçalhos
    const headers = [
      "Video Link",
      "Contexto Geral",
      "Transcription",
      "Hook Verbal",
      "Hook Written",
      "Hook Visual",
      "Format",
      "Keywords",
      "Obs",
      "Used",
      "Created At",
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Videos!A1:K1",
      valueInputOption: "RAW",
      resource: {
        values: [headers],
      },
    });

    // Formatar cabeçalhos (negrito e fundo cinza)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9,
                  },
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
        ],
      },
    });

    return {
      spreadsheetId,
      spreadsheetUrl,
      title: response.data.properties.title,
    };
  } catch (error) {
    console.error("Erro ao criar planilha:", error);
    throw new Error(`Erro ao criar planilha: ${error.message}`);
  }
}

/**
 * Obtém todos os dados de uma planilha do Google Sheets
 * @param {string} sheetsUrl - URL da planilha do Google Sheets
 * @returns {object} - Dados da planilha em formato JSON
 */
export async function getSheetData(sheetsUrl) {
  try {
    // Extrair o ID da planilha da URL
    const spreadsheetId = extractSpreadsheetId(sheetsUrl);

    if (!spreadsheetId) {
      throw new Error("URL da planilha inválida");
    }

    // Obter cliente autenticado
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Obter os dados da aba Videos
    const range = "Videos!A:J";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return {
        success: true,
        total: 0,
        data: [],
      };
    }

    // Primeira linha são os cabeçalhos
    const headers = rows[0];

    // Converter as linhas em objetos JSON
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        // Converter nome do cabeçalho para snake_case
        const key = header
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^\w_]/g, "");
        obj[key] = row[index] || "";
      });
      return obj;
    });

    return {
      success: true,
      total: data.length,
      headers: headers,
      data: data,
    };
  } catch (error) {
    console.error("Erro ao obter dados do Google Sheets:", error);
    throw new Error(`Erro ao obter dados do Google Sheets: ${error.message}`);
  }
}
