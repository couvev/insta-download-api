import fastify from "fastify";

import { fetchPostJson } from "./src/index.js";
import { downloadVideoAsBase64 } from "./src/utils.js";

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
