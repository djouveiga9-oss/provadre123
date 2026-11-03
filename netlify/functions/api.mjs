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
const examQuestions = [{"id":1,"question":"Qual artigo da Lei 11.343/2006 tipifica o crime de tráfico de drogas?","options":["Art. 28","Art. 33","Art. 35","Art. 40"],"correct":1},{"id":2,"question":"Qual artigo da Lei 11.343/2006 trata do porte de drogas para consumo pessoal?","options":["Art. 28","Art. 33","Art. 35","Art. 40"],"correct":0},{"id":3,"question":"Qual artigo da Lei 11.343/2006 trata da associação para o tráfico?","options":["Art. 30","Art. 32","Art. 35","Art. 37"],"correct":2},{"id":4,"question":"Qual artigo do Código Penal tipifica o crime de roubo, como o assalto a uma loja ou joalheria?","options":["Art. 155","Art. 157","Art. 180","Art. 171"],"correct":1},{"id":5,"question":"Qual dispositivo prevê aumento de pena no roubo quando há emprego de arma de fogo?","options":["Art. 157, § 2º-A, inciso I, do Código Penal","Art. 155, § 1º, do Código Penal","Art. 180 do Código Penal","Art. 33 da Lei de Drogas"],"correct":0},{"id":6,"question":"Qual artigo do Código Penal tipifica o furto, quando alguém subtrai um bem sem violência ou grave ameaça?","options":["Art. 157","Art. 171","Art. 155","Art. 180"],"correct":2},{"id":7,"question":"Qual artigo do Código Penal trata da receptação de produto de crime?","options":["Art. 147","Art. 157","Art. 171","Art. 180"],"correct":3},{"id":8,"question":"Qual artigo da Lei 12.850/2013 trata da promoção, constituição, financiamento ou integração de organização criminosa?","options":["Art. 1º","Art. 2º","Art. 5º","Art. 10"],"correct":1},{"id":9,"question":"Na Lei 10.826/2003, qual artigo trata do porte ilegal de arma de fogo de uso permitido?","options":["Art. 12","Art. 14","Art. 16","Art. 18"],"correct":1},{"id":10,"question":"Na Lei 10.826/2003, qual artigo trata da posse ou porte ilegal de arma de fogo de uso restrito?","options":["Art. 10","Art. 12","Art. 14","Art. 16"],"correct":3},{"id":11,"question":"Durante uma ocorrência, a equipe apreende drogas. Qual informação deve constar no registro da apreensão?","options":["Apenas o apelido do suspeito","Somente a quantidade aproximada, sem outros dados","Descrição do material, quantidade, local, horário e responsável pela apreensão","A opinião pessoal dos agentes"],"correct":2},{"id":12,"question":"Após apreender dinheiro possivelmente relacionado ao tráfico, qual é a conduta correta?","options":["Dividir o valor entre os policiais","Registrar o valor e seguir o procedimento de guarda e encaminhamento da cidade","Devolver o dinheiro sem registrar","Guardar o dinheiro para uso da equipe"],"correct":1},{"id":13,"question":"Ao apreender uma arma durante uma operação, o agente deve:","options":["Manuseá-la sem cuidado e entregá-la a qualquer pessoa","Retirar o registro da ocorrência","Esconder a arma para evitar burocracia","Garantir a segurança, registrar a apreensão e encaminhar o item conforme o protocolo"],"correct":3},{"id":14,"question":"Qual é a finalidade de identificar e registrar os objetos apreendidos em uma ocorrência?","options":["Manter controle do material e permitir sua vinculação correta ao caso","Permitir que os agentes escolham o que ficarão","Evitar que a ocorrência seja documentada","Substituir o depoimento dos envolvidos"],"correct":0},{"id":15,"question":"Se forem apreendidos celulares ou outros objetos que possam conter informações relevantes, a equipe deve:","options":["Acessar e divulgar todo o conteúdo sem autorização ou regra","Apagar os dados para liberar espaço","Registrar o objeto e seguir as regras de preservação e análise previstas na cidade","Entregar o aparelho a terceiros"],"correct":2},{"id":16,"question":"Ao apreender um veículo suspeito de estar ligado a uma ocorrência, o que deve ser feito?","options":["Usá-lo como viatura sem autorização","Registrar suas condições e identificação e seguir o procedimento de remoção e guarda","Abandoná-lo em qualquer local","Retirar peças antes do registro"],"correct":1},{"id":17,"question":"Qual cuidado é importante ao transportar materiais apreendidos?","options":["Misturar todos os itens em uma única embalagem","Deixar os itens sem identificação","Permitir acesso livre de pessoas não envolvidas","Manter os itens identificados, preservados e sob responsabilidade definida"],"correct":3},{"id":18,"question":"Qual artigo do Código Penal tipifica o estelionato, quando alguém obtém vantagem ilícita induzindo outra pessoa em erro?","options":["Art. 171","Art. 155","Art. 157","Art. 180"],"correct":0},{"id":19,"question":"Qual artigo do Código Penal tipifica a ameaça?","options":["Art. 129","Art. 147","Art. 163","Art.  crimes 288"],"correct":1},{"id":20,"question":"Qual artigo do Código Penal trata da associação criminosa (três ou mais pessoas associadas para o fim específico de cometer crimes)?","options":["Art. 157","Art. 171","Art. 288","Art. 304"],"correct":2}];
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
    if (!Array.isArray(d.answers) || d.answers.length !== examQuestions.length || d.answers.some((v, i) => !Number.isInteger(v) || v < 0 || v > 3)) return json(400, { error: "Responda às 20 questões antes de enviar a prova." });
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
