import "dotenv/config";
import fastify from "fastify";

import { fetchPostJson } from "./src/index.js";
import { downloadVideoAsBase64 } from "./src/utils.js";
import { addRowToSheet, createSurveySheet } from "./src/sheets.js";
import { addSurvey, searchSurveys, getAllSurveys } from "./src/surveys.js";

const app = fastify();

const PORT = process.env.PORT || 3000;

app.get("/", async (request, reply) => {
  reply.send("/download/?url=Link-do-video-instagram");
});

app.get("/download/", async (request, reply) => {
  const { url } = request.query;

  console.log("--> GET /download", url, new Date().toLocaleString());

  if (!url) {
    reply.send({ error: "forneça uma URL do instagram" });
    return;
  }

  try {
    let resultado = await fetchPostJson(url);

    // Baixar o vídeo e converter para base64
    console.log("Baixando vídeo...");
    const videoBase64 = await downloadVideoAsBase64(resultado.videoUrl);

    // Retornar o vídeo em base64 ao invés da URL
    reply.send({
      filename: resultado.filename,
      width: resultado.width,
      height: resultado.height,
      videoBase64: videoBase64,
      mimeType: "video/mp4",
    });
  } catch (error) {
    console.error("Erro ao processar vídeo:", error.message);
    reply
      .status(500)
      .send({ error: error.message || "Erro ao processar o vídeo" });
  }
});

app.post("/save-to-sheets/", async (request, reply) => {
  console.log("--> POST /save-to-sheets", new Date().toLocaleString());

  const data = request.body;

  // Validação dos dados obrigatórios
  if (!data.sheets_url) {
    return reply
      .status(400)
      .send({ error: "O campo 'sheets_url' é obrigatório" });
  }

  if (!data.video_link) {
    return reply
      .status(400)
      .send({ error: "O campo 'video_link' é obrigatório" });
  }

  try {
    const result = await addRowToSheet(data.sheets_url, data);

    reply.send({
      success: true,
      message: "Dados salvos com sucesso no Google Sheets",
      details: result,
    });
  } catch (error) {
    console.error("Erro ao salvar no Google Sheets:", error.message);
    reply.status(500).send({
      error: "Erro ao salvar dados no Google Sheets",
      details: error.message,
    });
  }
});

// Endpoint para criar nova pesquisa (planilha)
app.post("/surveys/", async (request, reply) => {
  console.log("--> POST /surveys/", new Date().toLocaleString());

  const { name } = request.body;

  // Validação
  if (!name || name.trim() === "") {
    return reply.status(400).send({ error: "O campo 'name' é obrigatório" });
  }

  try {
    // Criar planilha no Google Sheets
    const sheet = await createSurveySheet(name);

    // Salvar no JSON local
    const survey = addSurvey(name, sheet.spreadsheetUrl);

    reply.send({
      success: true,
      message: "Pesquisa criada com sucesso",
      survey: {
        id: survey.id,
        name: survey.name,
        sheets_url: survey.sheets_url,
        created_at: survey.created_at,
      },
    });
  } catch (error) {
    console.error("Erro ao criar pesquisa:", error.message);
    reply.status(500).send({
      error: "Erro ao criar pesquisa",
      details: error.message,
    });
  }
});

// Endpoint para buscar pesquisas
app.get("/surveys/", async (request, reply) => {
  console.log("--> GET /surveys/", new Date().toLocaleString());

  const { search } = request.query;

  try {
    let surveys;

    if (search) {
      // Buscar por id, nome ou url
      surveys = searchSurveys(search);
    } else {
      // Retornar todas
      surveys = getAllSurveys();
    }

    reply.send({
      success: true,
      total: surveys.length,
      surveys: surveys,
    });
  } catch (error) {
    console.error("Erro ao buscar pesquisas:", error.message);
    reply.status(500).send({
      error: "Erro ao buscar pesquisas",
      details: error.message,
    });
  }
});

const start = async () => {
  try {
    app.listen({ host: "0.0.0.0", port: PORT });
    console.log("Servidor rodando em http://localhost:3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
