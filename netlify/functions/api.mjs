import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = getStore({ name: "dre-inscricoes", consistency: "strong" });
const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (statusCode, body) => new Response(JSON.stringify(body), { status: statusCode, headers });
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
function sign(value) { return crypto.createHmac("sha256", secret()).update(value).digest("hex"); }
function makeToken() { const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url"); return payload + "." + sign(payload); }
function validToken(event) {
  const authorization = event.headers?.get
    ? event.headers.get("authorization")
    : event.headers?.authorization;
  const token = (authorization || "").replace(/^Bearer\s+/i, "");
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !secret()) return false;
  const expected = sign(payload);
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now(); } catch { return false; }
}
async function all() { return (await store.get("submissions", { type: "json" })) || []; }
async function save(items) { await store.setJSON("submissions", items); }
const examQuestions = [{"id":1,"question":"O que significa a sigla DRE na Polícia Federal?","options":["Delegacia de Repressão a Entorpecentes","Delegacia de Repressão a Estelionatos","Departamento de Repressão Especial","Divisão de Repressão Estratégica"],"correct":0},{"id":2,"question":"Um indivíduo é flagrado vendendo drogas. Qual artigo se aplica?","options":["Art. 28","Art. 33","Art. 35","Art. 180"],"correct":1},{"id":3,"question":"Um indivíduo é encontrado com drogas para consumo próprio, sem indícios de venda. Qual artigo se aplica?","options":["Art. 28","Art. 33","Art. 35","Art. 157"],"correct":0},{"id":4,"question":"Um indivíduo ameaça uma pessoa com uma arma de fogo e rouba seus pertences. Qual artigo se aplica?","options":["Art. 155","Art. 157","Art. 171","Art. 180"],"correct":1},{"id":5,"question":"Um indivíduo entra em uma loja e furta mercadorias sem utilizar violência ou ameaça. Qual artigo se aplica?","options":["Art. 155","Art. 157","Art. 171","Art. 180"],"correct":0},{"id":6,"question":"Um indivíduo compra e revende objetos sabendo que são provenientes de crime. Qual artigo se aplica?","options":["Art. 147","Art. 155","Art. 171","Art. 180"],"correct":3},{"id":7,"question":"Um indivíduo porta ilegalmente uma arma de fogo de uso permitido, sem autorização. Qual artigo se aplica?","options":["Art. 12","Art. 14","Art. 16","Art. 33"],"correct":1},{"id":8,"question":"A DRE recebe informações sobre um possível ponto de distribuição de drogas, mas ainda não possui provas suficientes. Qual é a melhor conduta inicial?","options":["Realizar uma operação imediata com todos os agentes disponíveis.","Monitorar o local, verificar a credibilidade das informações e reunir elementos antes de definir a operação.","Abordar todos que entrarem no estabelecimento.","Divulgar a localização para outras equipes sem confirmar a denúncia."],"correct":1},{"id":9,"question":"Durante uma investigação, um agente percebe que um suspeito mudou sua rotina após notar a presença policial. Qual deve ser a prioridade da equipe?","options":["Intensificar a aproximação para impedir a fuga imediatamente.","Manter a observação de forma coordenada, avaliar se houve comprometimento da investigação e comunicar a equipe.","Encerrar a investigação sem registrar o ocorrido.","Enviar um único agente para seguir o suspeito sem informar os demais."],"correct":1},{"id":10,"question":"Em uma campana, dois agentes observam informações diferentes sobre a movimentação de suspeitos. Como a equipe deve proceder?","options":["Cada agente deve tomar decisões independentes.","Apenas o agente mais antigo deve registrar as informações.","Centralizar a comunicação, comparar os relatos e registrar horários e acontecimentos relevantes.","Ignorar informações que não confirmem a primeira suspeita."],"correct":2},{"id":11,"question":"Durante uma operação, a equipe encontra materiais que podem estar relacionados a uma investigação, mas não sabe a quem pertencem. Qual é o procedimento mais adequado?","options":["Atribuir os materiais ao suspeito mais próximo.","Registrar a localização, as condições e as circunstâncias da apreensão, preservando a identificação dos itens.","Reunir todos os materiais em um único recipiente sem identificação.","Descartar os itens que não forem imediatamente reconhecidos."],"correct":1},{"id":12,"question":"Um agente encontra informações relevantes em um aparelho celular apreendido. Qual atitude demonstra maior responsabilidade investigativa?","options":["Compartilhar as informações em grupos para acelerar a investigação.","Alterar as configurações do aparelho para facilitar a consulta.","Preservar o aparelho, registrar sua apreensão e encaminhá-lo conforme o procedimento autorizado.","Utilizar as informações para confrontar o suspeito antes de comunicar a equipe."],"correct":2},{"id":13,"question":"Durante uma operação, um integrante da equipe transmite pelo rádio uma informação incorreta sobre a localização do suspeito. Qual deve ser a reação do responsável pela operação?","options":["Ignorar o erro para não interromper a ação.","Corrigir a informação imediatamente, confirmar o entendimento de todos e reorganizar a atuação.","Retirar o agente da operação sem explicar o motivo.","Permitir que cada integrante decida qual informação seguir."],"correct":1},{"id":14,"question":"A equipe recebe duas denúncias sobre o mesmo local, mas elas apresentam horários e descrições diferentes. Qual é a melhor decisão?","options":["Considerar as duas denúncias verdadeiras e agir imediatamente.","Descartar ambas por apresentarem divergências.","Comparar as informações, identificar contradições e buscar confirmação independente.","Utilizar somente a denúncia recebida primeiro."],"correct":2},{"id":15,"question":"Durante uma operação, um suspeito é abordado e outro indivíduo começa a gravar a ação de longe. Qual deve ser a postura dos agentes?","options":["Impedir qualquer gravação, independentemente das circunstâncias.","Manter a atuação profissional, respeitar os limites legais e priorizar a segurança da ocorrência.","Abandonar a abordagem para retirar o celular do indivíduo.","Divulgar informações da investigação para justificar a ação."],"correct":1},{"id":16,"question":"Uma operação envolve diferentes equipes, mas não foi definido quem coordena cada etapa. Qual é o principal risco dessa falha?","options":["Aumento da quantidade de relatórios.","Duplicidade de ações, falhas de comunicação e decisões conflitantes.","Redução da quantidade de agentes disponíveis.","Excesso de informações registradas."],"correct":1},{"id":17,"question":"Após uma apreensão, um agente percebe que um dos itens não foi identificado corretamente no registro. O que deve fazer?","options":["Corrigir informalmente, sem comunicar ninguém.","Excluir o registro e elaborar outro sem mencionar o erro.","Comunicar a divergência e providenciar a correção formal, preservando o histórico do ocorrido.","Manter o registro original para evitar atrasos."],"correct":2},{"id":18,"question":"Durante uma investigação, um agente recebe uma informação sigilosa de outra equipe. Qual conduta é mais adequada?","options":["Compartilhar a informação com todos os integrantes da corporação.","Utilizar a informação apenas dentro da finalidade autorizada e compartilhá-la somente com quem precisa conhecê-la.","Publicar um resumo para solicitar opiniões.","Guardar a informação pessoalmente, sem registrar sua origem."],"correct":1},{"id":19,"question":"Ao planejar uma operação em um local com grande circulação de pessoas, qual fator deve receber maior atenção?","options":["A quantidade de prisões que a equipe pretende realizar.","A velocidade de execução, independentemente dos riscos.","A avaliação de riscos, a proteção de terceiros, a legalidade e a coordenação da equipe.","A quantidade de viaturas utilizadas."],"correct":2},{"id":20,"question":"Após uma operação, os resultados foram positivos, mas houve falhas de comunicação e divergências nos registros. Qual deve ser a atitude da liderança?","options":["Considerar a operação perfeita porque o objetivo foi alcançado.","Ignorar as falhas para preservar a imagem da equipe.","Revisar a operação, identificar as falhas, corrigir os registros cabíveis e orientar a equipe para evitar reincidências.","Responsabilizar automaticamente o agente de menor patente."],"correct":2}];
async function allExams() { return (await store.get("exams", { type: "json" })) || []; }
async function saveExams(items) { await store.setJSON("exams", items); }

export default async (request) => {
  if (request.method !== "POST") return json(405, { error: "Método não permitido." });
  let body; try { body = await request.json(); } catch { return json(400, { error: "Requisição inválida." }); }
  const action = body.action;
  if (action === "exam-questions") {
    return json(200, { questions: examQuestions.map(({id, question, options}) => ({id, question, options})) });
  }
  if (action === "exam-submit") {
    const d = body.data || {};
    const name = clean(d.name), discordName = clean(d.discordName), gameId = clean(d.gameId);
    if (!name || !discordName || !gameId) return json(400, { error: "Preencha o nome do candidato, o nome no Discord e o ID no jogo." });
    if (!Array.isArray(d.answers) || d.answers.length !== examQuestions.length || d.answers.some((v, i) => !Number.isInteger(v) || v < 0 || v > 3)) return json(400, { error: "Responda às 21 questões antes de enviar a prova." });
    const correctAnswers = examQuestions.map(q => q.correct);
    const score = d.answers.reduce((sum, answer, i) => sum + (answer === correctAnswers[i] ? 1 : 0), 0);
    const exams = await allExams();
    const exam = { id: "PROVA-" + crypto.randomBytes(3).toString("hex").toUpperCase(), name, discordName, gameId, answers: d.answers, correctAnswers, score, total: examQuestions.length, createdAt: new Date().toISOString() };
    exams.unshift(exam); await saveExams(exams);
    return json(201, { ok: true, id: exam.id, message: "Prova enviada com sucesso." });
  }
  if (action === "login") {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return json(503, { error: "Configure ADMIN_PASSWORD nas variáveis de ambiente do Netlify." });
    const supplied = String(body.password || "");
    const a = Buffer.from(supplied), b = Buffer.from(password);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json(401, { error: "Senha incorreta." });
    return json(200, { token: makeToken() });
  }
  if (!validToken(request)) return json(401, { error: "Sessão inválida ou expirada. Entre novamente." });
  if (action === "exam-list") return json(200, { exams: await allExams() });
  if (action === "list") return json(200, { items: await all() });
  if (action === "status") {
    const allowed = ["Pendente", "Em análise", "Aceita", "Reprovada"];
    if (!allowed.includes(body.status)) return json(400, { error: "Status inválido." });
    const items = await all(), item = items.find(x => x.id === body.id);
    if (!item) return json(404, { error: "Inscrição não encontrada." });
    const previous = item.status; item.status = body.status; item.updatedAt = new Date().toISOString();
    await save(items);
    if (body.status === "Aceita" && previous !== "Aceita") await notifyDiscord(item);
    return json(200, { ok: true, item });
  }
  if (action === "register") {
    const d = body.data || {};
    const required = ["firstName","lastName","city","rg","phone","discordName","discordTag"];
    if (required.some(k => !String(d[k] || "").trim())) return json(400, { error: "Preencha todos os campos obrigatórios." });
    if (!/^\d{6}$/.test(String(d.rg)) || !/^\d{3}-\d{3}$/.test(String(d.phone))) return json(400, { error: "O RG deve ter seis números sem hífen e o telefone deve ter o formato 000-000." });
    if (d.consent !== true) return json(400, { error: "Confirme a declaração antes de enviar." });
    const items = await all();
    if (items.some(x => x.discordId && d.discordId && x.discordId === d.discordId && !["Reprovada"].includes(x.status))) return json(409, { error: "Já existe uma inscrição ativa com este ID do Discord." });
    const id = "DRE-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const item = { id, firstName: clean(d.firstName), lastName: clean(d.lastName), city: clean(d.city), rg: d.rg, phone: d.phone, discordName: clean(d.discordName), discordTag: clean(d.discordTag), discordId: String(d.discordId || "").replace(/\D/g,"").slice(0,22), status: "Pendente", createdAt: new Date().toISOString() };
    items.unshift(item); await save(items);
    return json(201, { ok: true, id, status: item.status });
  }
  return json(400, { error: "Ação desconhecida." });
};
function clean(v) { return String(v || "").trim().replace(/[<>]/g, "").slice(0, 100); }
async function notifyDiscord(item) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const mention = /^\d{17,20}$/.test(item.discordId) ? `<@${item.discordId}>` : item.discordTag;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `✅ **Inscrição aceita — DRE / Nova Capital RP**\nCandidato: **${item.firstName} ${item.lastName}**\nDiscord: ${mention}\nProtocolo: \`${item.id}\`\nO candidato foi aprovado na etapa de inscrição e deve acompanhar as orientações da equipe para os próximos passos.` , allowed_mentions: { parse: [], users: /^\d{17,20}$/.test(item.discordId) ? [item.discordId] : [] } }) });
  } catch (e) { console.error("Falha ao notificar Discord:", e); }
}
