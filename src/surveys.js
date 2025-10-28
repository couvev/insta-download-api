import fs from "fs";
import path from "path";

const SURVEYS_FILE = "./surveys.json";

/**
 * Inicializa o arquivo de pesquisas se não existir
 */
function initializeSurveysFile() {
  if (!fs.existsSync(SURVEYS_FILE)) {
    fs.writeFileSync(
      SURVEYS_FILE,
      JSON.stringify({ surveys: [], nextId: 1 }, null, 2)
    );
  }
}

/**
 * Lê todas as pesquisas do arquivo
 */
export function getAllSurveys() {
  initializeSurveysFile();
  const data = JSON.parse(fs.readFileSync(SURVEYS_FILE, "utf8"));
  return data.surveys;
}

/**
 * Adiciona uma nova pesquisa
 * @param {string} name - Nome da pesquisa
 * @param {string} sheetsUrl - URL da planilha criada
 * @returns {object} - Dados da pesquisa criada
 */
export function addSurvey(name, sheetsUrl) {
  initializeSurveysFile();
  const data = JSON.parse(fs.readFileSync(SURVEYS_FILE, "utf8"));

  const newSurvey = {
    id: data.nextId,
    name: name,
    sheets_url: sheetsUrl,
    created_at: new Date().toISOString(),
  };

  data.surveys.push(newSurvey);
  data.nextId += 1;

  fs.writeFileSync(SURVEYS_FILE, JSON.stringify(data, null, 2));

  return newSurvey;
}

/**
 * Busca pesquisas por qualquer campo (id, nome ou url)
 * @param {string|number} query - Termo de busca
 * @returns {array} - Lista de pesquisas encontradas
 */
export function searchSurveys(query) {
  const surveys = getAllSurveys();

  // Se query é um número, buscar por ID
  if (!isNaN(query)) {
    const id = parseInt(query);
    const found = surveys.filter((s) => s.id === id);
    return found;
  }

  // Buscar por nome ou URL (case insensitive)
  const queryLower = query.toLowerCase();
  return surveys.filter(
    (s) =>
      s.name.toLowerCase().includes(queryLower) ||
      s.sheets_url.toLowerCase().includes(queryLower)
  );
}

/**
 * Busca uma pesquisa específica por ID
 * @param {number} id - ID da pesquisa
 * @returns {object|null} - Dados da pesquisa ou null
 */
export function getSurveyById(id) {
  const surveys = getAllSurveys();
  return surveys.find((s) => s.id === id) || null;
}
