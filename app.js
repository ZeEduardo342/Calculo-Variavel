import {
  db,
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "./firebase.js";
const COL = {
  rates: "valores_niveis",
  caps: "configuracoes",
  launches: "lancamentos",
  services: "servicos",
};
const CAP_TYPE = "teto_mensal";
const LEVEL_NAMES = { 1: "Nível 1", 2: "Nível 2", 3: "Nível 3", 4: "Nível 4" };
const LEVELS = [1, 2, 3, 4];
const SERVICE_CATALOG = [
  { id: 1, name: "Ajuste de Arte", level: 1 },
  { id: 2, name: "Ajuste em Arte Pronta", level: 1 },
  { id: 3, name: "Ajuste em Fotos", level: 1 },
  { id: 4, name: "Correção em Arte", level: 1 },
  { id: 5, name: "Criação de Arte para Telegram", level: 3 },
  { id: 6, name: "Criação de Arte para TV Corporativa", level: 3 },
  { id: 7, name: "Criação de Adesivo Grande", level: 4 },
  { id: 8, name: "Criação de Adesivo Pequeno", level: 2 },
  { id: 9, name: "Criação de Arte para E-mail", level: 3 },
  { id: 10, name: "Criação de Arte para Feira", level: 3 },
  { id: 11, name: "Criação de Banner", level: 3 },
  { id: 12, name: "Criação de Banner para Blog", level: 3 },
  { id: 13, name: "Criação de Carta", level: 3 },
  { id: 14, name: "Edição de Cartão de Visita", level: 2 },
  { id: 15, name: "Criação de Convite", level: 3 },
  { id: 16, name: "Criação de Flyer", level: 3 },
  { id: 17, name: "Criação de Landing Page", level: 4 },
  { id: 18, name: "Criação de Layout de Brindes", level: 3 },
  { id: 19, name: "Criação de Logo", level: 3 },
  { id: 20, name: "Criação de Outdoor", level: 3 },
  { id: 21, name: "Criação de Story", level: 3 },
  { id: 22, name: "Criação de Wallpaper", level: 3 },
  { id: 23, name: "Criação de Post", level: 3 },
  { id: 24, name: "Criação de Mockup", level: 4 },
  { id: 25, name: "Diagramação por Página", level: 3 },
  { id: 26, name: "Criação de Foto de Perfil", level: 3 },
  { id: 27, name: "Montagem em Imagem", level: 3 },
  { id: 28, name: "Criação de Formulário", level: 3 },
  { id: 29, name: "Ajuste em Formulário", level: 2 },
  { id: 30, name: "Criação de PDF Preenchível", level: 4 },
  { id: 31, name: "Ajuste em PDF", level: 2 },
  { id: 32, name: "Operação de OBS", level: 1 },
  { id: 33, name: "Criação de Tabela no Excel", level: 1 },
  { id: 34, name: "Post Telegram", level: 2 },
  { id: 35, name: "Criação de Canal no Telegram", level: 1 },
  { id: 36, name: "Fechamento de arquivo", level: 1 },
  {
    id: 37,
    name: "Criação de Texto Curto (Telegram e Redes Sociais) ",
    level: 2,
  },
  {
    id: 38,
    name: "Criação de Texto Médio (Apresentação de Produtos, Lançamentos)",
    level: 3,
  },
  {
    id: 39,
    name: "Criação de Texto Longo (Reportagens, Revistas e Redes sociais)",
    level: 4,
  },
  { id: 40, name: "Gravação de Vídeo Simples", level: 2 },
  { id: 41, name: "Gravação de Vídeo Complexo", level: 4 },
  { id: 42, name: "Correção de Texto ", level: 2 },
  { id: 43, name: "Edição de Vídeo Simples", level: 2 },
  { id: 44, name: "Edição de Vídeo Complexa", level: 3 },
  { id: 45, name: "Roteiro da Live da Semana", level: 4 },
  { id: 46, name: "Ajuste de Arte para o Café com a Direção", level: 1 },
  {
    id: 47,
    name: "Produção de Fotos de Colaboradores no Fundo Branco",
    level: 2,
  },
  {
    id: 48,
    name: "Produção de Fotos de Colaboradores nos Cenários da Loja",
    level: 1,
  },
  {
    id: 49,
    name: "Produção de Fotos Externas (fora de União da Vitória)",
    level: 4,
  },
  { id: 50, name: "Criação de Roteiro para Vídeo e Áudio", level: 3 },
  {
    id: 51,
    name: "Gravação de Vídeo Externo (fora de União da Vitória)",
    level: 4,
  },
  { id: 52, name: "Pormade na Mídia ", level: 1 },
  { id: 53, name: "Criar Programação Rise Vision", level: 3 },
  { id: 54, name: "Alteração de Arte no Rise Vision", level: 1 },
  { id: 55, name: "Roteiro para Gravação de Áudio (Locução)", level: 2 },
  {
    id: 56,
    name: "Montagem de Equipamentos para Gravação de Áudio no estúdio (Locução)",
    level: 1,
  },
  { id: 57, name: "Gravação de Áudio (Locução)", level: 3 },
  { id: 58, name: "Edição de Áudio (Locução) ", level: 3 },
  { id: 59, name: "Teste de Áudio (Transmissão ao vivo)", level: 1 },
  { id: 60, name: "Operação de Áudio (Transmissão ao vivo) ", level: 4 },
  { id: 61, name: "Suporte Técnico (Auditório) ", level: 3 },
  { id: 62, name: "Revisão e Manutenção de Áudio ", level: 2 },
  { id: 63, name: "Captura de imagens (Foto)", level: 2 },
  { id: 64, name: "INUTILIZAR", level: 1 },
  { id: 65, name: "Captura de Imagens (Vídeo) ", level: 2 },
  { id: 66, name: "Criação de Vídeo no After Effects", level: 4 },
  { id: 67, name: "Animação de vídeo ", level: 4 },
  { id: 68, name: "Criação de Imagens (Vídeo) ", level: 1 },
  { id: 69, name: "Manutenção do Estúdio ", level: 2 },
  { id: 70, name: "Organização do Estúdio (Transmissão ao vivo) ", level: 1 },
  { id: 71, name: "Apresentação (Transmissão ao vivo) ", level: 1 },
  { id: 72, name: "Apresentação (Integração) ", level: 1 },
  { id: 73, name: "Apresentação (Gravação) ", level: 1 },
  { id: 74, name: "Suporte Técnico (Transmissão ao vivo)", level: 4 },
  {
    id: 75,
    name: "Revisão e Manutenção de Equipamentos do Estúdio ",
    level: 3,
  },
  { id: 76, name: "Configuração do OBS", level: 1 },
  { id: 77, name: "Leitura de Comentários da Live", level: 1 },
  { id: 78, name: "Impressões", level: 1 },
  { id: 79, name: "Criação de Mapa", level: 1 },
  { id: 80, name: "Edição do Mapa", level: 1 },
  { id: 81, name: "Libras", level: 1 },
  { id: 82, name: "Pagamento de Live", level: 1 },
  { id: 83, name: "Sorteio da Live no Pátio", level: 1 },
  { id: 84, name: "Criação de Slides", level: 3 },
  { id: 85, name: "Manutenção de Slides", level: 2 },
  { id: 86, name: "Criação de Arte para Formulário", level: 3 },
  { id: 87, name: "Criação de arte complexa para apresentação", level: 4 },
  { id: 88, name: "Criação arte para impressão em porta", level: 4 },
  { id: 89, name: "Criação de arte para perfil corporativo", level: 3 },
  { id: 90, name: "Criação de arte para capa do EAD", level: 1 },
  { id: 91, name: "Criação de arte para veículos", level: 4 },
  { id: 92, name: "Escaneamento em PDF", level: 1 },
  { id: 93, name: "Criação de arte para redes sociais", level: 3 },
  { id: 94, name: "Criação de arte para mapa", level: 1 },
  { id: 95, name: "Criação de arte para apresentação", level: 3 },
  { id: 96, name: "Edição de lona", level: 1 },
  { id: 97, name: "Criação de QR Code", level: 1 },
  {
    id: 98,
    name: "Edição de QR Code (essa é para alterar o link quando o QR já está criado)",
    level: 1,
  },
  { id: 99, name: "Criação de catálogo", level: 4 },
  { id: 100, name: "Edição de catálogo", level: 2 },
  { id: 101, name: "Correção de texto curto", level: 2 },
  { id: 102, name: "Correção de texto longo", level: 4 },
  { id: 103, name: "Criação de legenda curta", level: 2 },
  { id: 104, name: "Criação de legenda média", level: 3 },
  { id: 105, name: "Criação de legenda longa", level: 4 },
  { id: 106, name: "Correção de legenda curta", level: 1 },
  { id: 107, name: "Correção de legenda média", level: 2 },
  { id: 108, name: "Correção de legenda longa", level: 3 },
  { id: 109, name: "Inclusão Drive Pormade", level: 2 },
  { id: 110, name: "Alteração Drive Pormade", level: 1 },
  { id: 111, name: "Criação de Banner para Site", level: 3 },
  { id: 112, name: "Criação de Banner para Site Mobile", level: 3 },
  { id: 113, name: "Ajuste de Arte para Campanha Criteo", level: 2 },
  { id: 114, name: "Criação de arte para copo", level: 3 },
  { id: 115, name: "Criação de placa", level: 2 },
  { id: 116, name: "Diagramação (lotes de 1 a 10 folhas)", level: 3 },
  { id: 117, name: "Diagramação (lotes de 11 a 50 folhas)", level: 4 },
  { id: 118, name: "Diagramação (lotes acima de 50 folhas)", level: 4 },
  { id: 119, name: "Fechamento de arquivo (pequeno)", level: 2 },
  { id: 120, name: "Fechamento de arquivo (grande)", level: 4 },
  { id: 121, name: "Aniversariante do dia (lotes de 1 a 5)", level: 1 },
  { id: 122, name: "Aniversariante do dia (lotes de 6 a 15)", level: 2 },
  { id: 123, name: "Aniversariante do dia (lotes de 16 a 30)", level: 3 },
  { id: 124, name: "Aniversariante do dia (lotes acima de 30)", level: 4 },
  { id: 125, name: "Criação campanha promoção do mês", level: 4 },
  { id: 126, name: "Ajuste campanha promoção do mês - google", level: 2 },
  { id: 127, name: "Aniversariante de empresa (lotes de 16 a 30)", level: 3 },
  { id: 128, name: "Aniversariante de empresa (lotes acima de 30)", level: 4 },
  { id: 129, name: "Criação de thumbnail", level: 3 },
  { id: 130, name: "Criação de capa para vídeo", level: 1 },
  { id: 131, name: "Compartilhar link da live", level: 1 },
  { id: 132, name: "Criação de circular", level: 3 },
  { id: 133, name: "Criação de arte para PDF editável", level: 3 },
  { id: 134, name: "Alteração de mockup", level: 3 },
  { id: 135, name: "Criação de anúncio para revista", level: 4 },
  { id: 136, name: "Criação de cartão", level: 3 },
  { id: 137, name: "Upload de vídeo", level: 1 },
  { id: 138, name: "Edição de imagem", level: 3 },
  { id: 139, name: "Refação de vídeo", level: 1 },
  {
    id: 140,
    name: "Ajuste campanha promoção do mês - redes sociais",
    level: 2,
  },
  { id: 141, name: "Ajuste campanha promoção do mês - site", level: 2 },
  { id: 142, name: "Criar link no youtube", level: 2 },
  { id: 143, name: "Criação de crachá", level: 3 },
  { id: 144, name: "Manutenção de crachá", level: 2 },
  { id: 145, name: "Criação de ícone", level: 2 },
  { id: 146, name: "Criação de arte para mini porta", level: 3 },
  { id: 147, name: "Criação de arte para o rise vision", level: 3 },
  { id: 148, name: "Criação de arte para camisas/camisetas", level: 4 },
  { id: 149, name: "Impressão colorida", level: 1 },
  { id: 150, name: "Alteração Caixa de Amostras", level: 3 },
  { id: 151, name: "Foto de produto", level: 4 },
  { id: 152, name: "Entrevista externa (Feiras, eventos)", level: 4 },
  {
    id: 153,
    name: "Inclusão de dados agenda Pormade móvel (de 20 a 30)",
    level: 1,
  },
  {
    id: 154,
    name: "Inclusão de dados agenda Pormade móvel (de 31 a 60)",
    level: 1,
  },
  {
    id: 155,
    name: "Inclusão de dados agenda Pormade móvel (acima de 60)",
    level: 1,
  },
  { id: 156, name: "Adaptação de post para storie", level: 2 },
  { id: 157, name: "Remover fundo de imagens", level: 2 },
  { id: 158, name: "Conversão de formato de arquivos de áudio", level: 1 },
  { id: 159, name: "Inativar formulário", level: 2 },
  { id: 160, name: "Criar formulário | ADVA", level: 2 },
  { id: 161, name: "Criação de arte para slides", level: 2 },
  { id: 162, name: "Criação de arte para evento", level: 3 },
  { id: 163, name: "Criação de moldura (spin 360º)", level: 2 },
  { id: 164, name: "Gravação de vídeo com a GoPro 360º", level: 3 },
  { id: 165, name: "Edição de vídeo complexo com a GoPro 360º", level: 4 },
  { id: 166, name: "Orçar compra de equipamentos", level: 1 },
  { id: 167, name: "Orçar material gráfico", level: 1 },
  { id: 168, name: "Correção de texto médio", level: 3 },
  { id: 169, name: "Edição do Mapa (Entre 1 a 10)", level: 1 },
  { id: 170, name: "Edição do Mapa (Entre 11 a 30)", level: 1 },
  { id: 171, name: "Edição do Mapa (Acima de 30)", level: 1 },
  { id: 172, name: "Criação de apresentação no Prezi", level: 1 },
  { id: 173, name: "Produção de fotos | F2", level: 2 },
  { id: 174, name: "Correção de roteiro", level: 3 },
  { id: 175, name: "Gravação de vídeo | Média complexidade", level: 3 },
  { id: 176, name: "Criação de roteiro | Vídeo complexo", level: 4 },
  { id: 177, name: "Pergunta fácil/média | Papo com a Direção", level: 1 },
  { id: 178, name: "Pergunta difícil | Papo com a Direção", level: 1 },
  { id: 179, name: "Transmissão ao vivo", level: 1 },
  { id: 180, name: "Sorteio ao vivo", level: 1 },
  { id: 181, name: "Criação de certificado", level: 2 },
  { id: 182, name: "Automatização de certificado no Jotform", level: 2 },
  { id: 183, name: "Suporte Técnico (Evento Externo)", level: 4 },
  { id: 184, name: "Edição de vídeo | Feira e eventos externos", level: 4 },
  { id: 185, name: "Arte para porta | Linha HD", level: 4 },
  { id: 186, name: "Criar FlipSnack", level: 3 },
  { id: 187, name: "Link para PDF preenchível", level: 2 },
  { id: 188, name: "Fotos em eventos", level: 3 },
  { id: 189, name: "Vetorização de imagem", level: 3 },
  { id: 190, name: "Criação de Identidade Visual", level: 4 },
  { id: 191, name: "Automatização de arte no InDesign", level: 3 },
  { id: 192, name: "Criação de app no JotForm", level: 4 },
  {
    id: 193,
    name: "Edição de imagem (foto) para vídeo - Baixa complexidade",
    level: 1,
  },
  {
    id: 194,
    name: "Edição de imagem (foto) para vídeo - Média complexidade",
    level: 2,
  },
  {
    id: 195,
    name: "Edição de imagem (foto) para vídeo - Alta complexidade",
    level: 3,
  },
  { id: 196, name: "Cartaz à mão", level: 1 },
  { id: 197, name: "Criação de arte para shaft", level: 3 },
  { id: 198, name: "Ajuste de formulário + QR Code", level: 3 },
  { id: 199, name: "Alteração complexa de formulário", level: 2 },
  { id: 200, name: "Criação eventos Google Agenda", level: 1 },
  {
    id: 201,
    name: "Criação de convite para jurados | Festival da Canção",
    level: 3,
  },
  {
    id: 202,
    name: "Organização do corpo de jurados | Festival da Canção",
    level: 4,
  },
  {
    id: 203,
    name: "Edição de músicas para o Festival da Canção | Alteração de tonalidade",
    level: 3,
  },
  {
    id: 204,
    name: "Organização dos participantes | Festival da Canção",
    level: 1,
  },
  { id: 205, name: "Organização da banda | Festival da Canção", level: 4 },
  {
    id: 206,
    name: "Criação e edição das cédulas de votação para os jurados do Festival da Canção",
    level: 1,
  },
  { id: 207, name: "Foto profissional no estúdio", level: 4 },
  { id: 208, name: "Arte botão Stream Ddeck", level: 1 },
  { id: 209, name: "Arte personalização de Convenção", level: 2 },
  { id: 210, name: "Produção de vídeo", level: 4 },
  { id: 211, name: "Marcar entrevista e acompanhamento", level: 4 },
  { id: 212, name: "Criação de adesivo médio", level: 3 },
  { id: 213, name: "Modelagem 3D", level: 4 },
  { id: 214, name: "Texturização 3D", level: 4 },
  { id: 215, name: "Renderização 3D", level: 4 },
];
const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const monthKey = (value) =>
  (typeof value === "string" ? value : today()).slice(0, 7);
const monthDate = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
};
const shiftMonth = (key, amount) => {
  const d = monthDate(key);
  d.setMonth(d.getMonth() + amount);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = (key) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(monthDate(key))
    .replace(/^./, (x) => x.toUpperCase());
const currency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
const dateTime = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
const initial = () => ({
  launches: [],
  rates: LEVELS.map((level) => ({
    id: `rate-${level}`,
    level,
    value: [1, 2.5, 5, 10][level - 1],
    startDate: "2026-01-01",
  })),
  caps: [{ id: "cap-1", value: 200, startDate: "2026-01-01" }],
});
let state = { launches: [], rates: [], caps: [], services: [] };
const loaded = { rates: false, caps: false, launches: false, services: false },
  fromCache = { rates: false, caps: false, launches: false, services: false },
  seeding = {};
let syncError = false;
const isReady = () =>
  loaded.rates &&
  loaded.caps &&
  loaded.launches &&
  loaded.services &&
  state.rates.length > 0 &&
  state.caps.length > 0 &&
  state.services.length > 0;
const fail = (err) => {
  console.error(err);
  notify(
    err && err.code === "permission-denied"
      ? "Sem permissão no Firestore. Confira as regras."
      : "Não foi possível salvar no Firebase.",
    "error",
  );
};
const rateFromDoc = (d) => {
  const x = d.data();
  return { id: d.id, level: x.nivel, value: x.valor, startDate: x.inicio };
};
const capFromDoc = (d) => {
  const x = d.data();
  return { id: d.id, value: x.valor, startDate: x.inicio };
};
const launchFromDoc = (d) => {
  const x = d.data();
  return {
    id: d.id,
    date: x.data,
    level: x.nivel,
    quantity: x.quantidade,
    unitValue: x.valor_unitario,
    total: x.valor_total,
    serviceId: x.servico_id || null,
    serviceName: x.servico_nome || null,
  };
};
const serviceFromDoc = (d) => {
  const x = d.data();
  return {
    id: d.id,
    serviceId: x.id,
    nome: x.nome,
    nivel: x.nivel,
    ativo: x.ativo !== false,
  };
};
const serviceAtId = (id) =>
  state.services.find(
    (s) => String(s.serviceId) === String(id) && s.ativo !== false,
  );
let selectedMonth = monthKey(new Date());
let registerMode = "level";
let settingsTab = "rates";
const $ = (id) => document.getElementById(id);
function syncServiceOptions() {
  const select = $("service");
  if (!select) return;
  const previous = select.value;
  const services = state.services
    .filter((s) => s.ativo !== false)
    .sort((a, b) => a.serviceId - b.serviceId);
  select.innerHTML = `<option value="">Selecione um serviço…</option>${services.map((s) => `<option value="${s.serviceId}">(${s.serviceId}) ${s.nome}</option>`).join("")}`;
  if (services.some((s) => String(s.serviceId) === previous))
    select.value = previous;
}
const rateAt = (level, date) =>
  state.rates
    .filter((r) => r.level === level && r.startDate <= date)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0]?.value || 0;
const capAt = (date) =>
  state.caps
    .filter((c) => c.startDate <= date)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0]?.value || 0;
const notify = (message, tone = "success") => {
  const el = $("toast");
  el.textContent = message;
  el.className = `toast ${tone === "error" ? "error" : ""}`;
  setTimeout(() => el.classList.add("hidden"), 3000);
};
function render() {
  const current = monthKey(new Date());
  const isCurrentMonth = selectedMonth === current;
  const isFutureMonth = selectedMonth > current;
  syncServiceOptions();
  const launches = state.launches
    .filter((x) => monthKey(x.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = launches.reduce((s, x) => s + x.total, 0);
  const cap = capAt(`${selectedMonth}-31`);
  const pct = cap ? (total / cap) * 100 : 0;
  const remaining = cap - total;
  const qty = Number($("quantity").value) || 0;
  const selectedService =
    registerMode === "service" ? serviceAtId($("service").value) : null;
  const level =
    registerMode === "service"
      ? selectedService?.nivel || 1
      : Number($("level").value);
  const unit = rateAt(level, today());

  $("monthLabel").textContent = monthLabel(selectedMonth);
  $("accumulated").textContent = currency(total);
  $("progressText").textContent = `${currency(total)} / ${currency(cap)}`;
  $("progressPercent").textContent =
    `${pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  $("progressFill").style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
  $("progressCaption").textContent =
    pct >= 100
      ? "Teto ultrapassado. O excedente continua contabilizado."
      : "Progresso em direção ao teto mensal.";
  $("remainingLabel").textContent =
    remaining > 0
      ? "FALTA PARA O TETO"
      : remaining === 0
        ? "STATUS DO TETO"
        : "ACIMA DO TETO";
  $("remaining").textContent =
    remaining > 0
      ? currency(remaining)
      : remaining === 0
        ? "Atingido"
        : `+ ${currency(Math.abs(remaining))}`;
  $("capNote").textContent = `Teto de referência: ${currency(cap)}`;

  $("registerButton").disabled = !isCurrentMonth || !isReady();
  $("previousMonth").disabled = selectedMonth <= monthKey("2020-01-01");
  $("nextMonth").disabled = isFutureMonth || selectedMonth === current;
  $("readOnlyHint").classList.toggle("hidden", isCurrentMonth);
  $("periodStatus").textContent = isCurrentMonth
    ? "MÊS ABERTO"
    : isFutureMonth
      ? "MÊS FUTURO · BLOQUEADO"
      : "MÊS ENCERRADO · SOMENTE LEITURA";
  $("periodStatus").className =
    `period-status ${isCurrentMonth ? "open" : isFutureMonth ? "future" : "closed"}`;

  const totals = {};
  state.launches.forEach(
    (x) =>
      (totals[monthKey(x.date)] = (totals[monthKey(x.date)] || 0) + x.total),
  );
  const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  $("record").textContent = best ? currency(best[1]) : "—";
  $("recordMonth").textContent = best
    ? monthLabel(best[0])
    : "Ainda sem lançamentos";
  $("previewText").textContent =
    registerMode === "service"
      ? selectedService
        ? `${selectedService.nome} · Nível ${selectedService.nivel} × ${qty || 0}`
        : "Selecione um serviço"
      : `${LEVEL_NAMES[level]} × ${qty || 0}`;
  $("previewTotal").textContent = currency(qty * unit);
  $("autoLevel").textContent =
    registerMode === "service"
      ? selectedService
        ? `Nível ${selectedService.nivel} · ${currency(unit)} por unidade`
        : "Selecione um serviço para consultar o nível"
      : `${LEVEL_NAMES[level]} · ${currency(unit)} por unidade`;
  $("serviceLevelDisplay").textContent = selectedService
    ? `Nível ${selectedService.nivel}`
    : "—";
  $("recordCount").textContent =
    `${String(launches.length).padStart(2, "0")} registros`;
  const last = state.launches
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  $("latestLaunch").innerHTML = last
    ? `<div class="last-main"><div class="last-level">N${last.level}</div><div><strong>${last.serviceName || LEVEL_NAMES[last.level]}</strong><span>${last.serviceName ? `Nível ${last.level} · ` : ""}${last.quantity} unidade${last.quantity === 1 ? "" : "s"} · ${dateTime(last.date)}</span></div></div><div class="last-total">+ ${currency(last.total)}</div><button class="undo-button" id="undoButton">↶ Desfazer último lançamento</button>`
    : `<div class="empty-last"><div class="empty-icon">▱</div><strong>Nenhum lançamento ainda</strong><span>O próximo registro aparece aqui.</span></div>`;
  if ($("undoButton"))
    $("undoButton").onclick = () => {
      deleteDoc(doc(db, COL.launches, last.id)).catch(fail);
      notify("Último lançamento desfeito.");
    };
  $("historyContent").innerHTML = launches.length
    ? `<div class="history-table-wrap"><table><thead><tr><th>DATA</th><th>SERVIÇO</th><th>NÍVEL</th><th>QTD.</th><th>UNITÁRIO</th><th class="right">TOTAL</th></tr></thead><tbody>${launches.map((x) => `<tr><td><b>${dateTime(x.date).split(",")[0]}</b><span>${dateTime(x.date).split(",")[1]}</span></td><td>${x.serviceName || "Lançamento por nível"}</td><td><i class="level-chip level-${x.level}">N${x.level}</i>${LEVEL_NAMES[x.level]}</td><td>${x.quantity}</td><td>${currency(x.unitValue)}</td><td class="right total-cell">${currency(x.total)}</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="empty-state"><div class="empty-icon">$</div><strong>Sem movimentação em ${monthLabel(selectedMonth).toLowerCase()}</strong><span>Registre a primeira entrega do período para iniciar o histórico.</span></div>`;
  const months = Array.from({ length: 6 }, (_, i) =>
    shiftMonth(selectedMonth, i - 5),
  );
  const max = Math.max(cap, ...months.map((m) => totals[m] || 0), 1) * 1.15;
  $("chart").innerHTML =
    `<div class="chart-y-labels"><span>${currency(max).replace(",00", "")}</span><span>${currency(max / 2).replace(",00", "")}</span><span>R$ 0</span></div><div class="bars-area"><div class="cap-line" style="bottom:${Math.min((cap / max) * 100, 100)}%"><span>TETO</span></div><div class="chart-grid-lines"><i></i><i></i><i></i></div><div class="bars">${months.map((m) => `<div class="bar-column"><b>${totals[m] ? currency(totals[m]) : ""}</b><div class="bar ${m === selectedMonth ? "active" : ""}" style="height:${Math.max(((totals[m] || 0) / max) * 100, totals[m] ? 4 : 2)}%"></div><span>${new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(monthDate(m)).replace(".", "").slice(0, 3)}</span></div>`).join("")}</div></div>`;
}
function renderSettings() {
  const body = $("settingsBody");
  if (settingsTab === "rates") {
    body.innerHTML = `<div class="settings-form"><label>NÍVEL<div class="select-wrap"><select id="newRateLevel">${LEVELS.map((x) => `<option value="${x}">${LEVEL_NAMES[x]}</option>`).join("")}</select><span>⌄</span></div></label><label>NOVO VALOR<input id="newRateValue" class="number-input" placeholder="0,00"></label><label>INÍCIO DA VIGÊNCIA<input id="newRateDate" class="number-input" type="date" value="${today()}"></label><button id="saveRate" class="save-button">Adicionar vigência ＋</button></div><div class="settings-list"><b>VIGÊNCIAS CADASTRADAS</b>${state.rates
      .slice()
      .sort(
        (a, b) => a.level - b.level || b.startDate.localeCompare(a.startDate),
      )
      .map(
        (r) =>
          `<div class="setting-row"><i class="level-chip level-${r.level}">N${r.level}</i><div><strong>${LEVEL_NAMES[r.level]}</strong><span>Desde ${new Intl.DateTimeFormat("pt-BR").format(new Date(`${r.startDate}T12:00:00`))}</span></div><b>${currency(r.value)}</b><button data-remove-rate="${r.id}">×</button></div>`,
      )
      .join("")}</div>`;
    $("saveRate").onclick = () => {
      const value = Number($("newRateValue").value.replace(",", "."));
      if (!value || value <= 0)
        return notify("Preencha um valor válido.", "error");
      const startDate = $("newRateDate").value;
      if (!startDate) return notify("Informe o início da vigência.", "error");
      addDoc(collection(db, COL.rates), {
        nivel: Number($("newRateLevel").value),
        valor: value,
        inicio: startDate,
      }).catch(fail);
      $("newRateValue").value = "";
      notify("Nova vigência criada.");
    };
    body.querySelectorAll("[data-remove-rate]").forEach(
      (btn) =>
        (btn.onclick = () => {
          const rate = state.rates.find((r) => r.id === btn.dataset.removeRate);
          if (
            !rate ||
            state.rates.filter((r) => r.level === rate.level).length <= 1
          )
            return notify("Mantenha uma vigência por nível.", "error");
          deleteDoc(doc(db, COL.rates, rate.id)).catch(fail);
        }),
    );
  } else {
    body.innerHTML = `<div class="settings-form"><label>NOVO TETO<input id="newCapValue" class="number-input" placeholder="200,00"></label><label>INÍCIO DA VIGÊNCIA<input id="newCapDate" class="number-input" type="date" value="${today()}"></label><button id="saveCap" class="save-button">Adicionar vigência ＋</button></div><div class="settings-list"><b>TETOS CADASTRADOS</b>${state.caps
      .slice()
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map(
        (c) =>
          `<div class="setting-row"><i class="cap-symbol">R$</i><div><strong>Teto mensal</strong><span>Desde ${new Intl.DateTimeFormat("pt-BR").format(new Date(`${c.startDate}T12:00:00`))}</span></div><b>${currency(c.value)}</b></div>`,
      )
      .join("")}</div>`;
    $("saveCap").onclick = () => {
      const value = Number($("newCapValue").value.replace(",", "."));
      if (!value || value <= 0)
        return notify("Preencha um teto válido.", "error");
      const startDate = $("newCapDate").value;
      if (!startDate) return notify("Informe o início da vigência.", "error");
      addDoc(collection(db, COL.caps), {
        tipo: CAP_TYPE,
        valor: value,
        inicio: startDate,
      }).catch(fail);
      $("newCapValue").value = "";
      notify("Nova vigência de teto criada.");
    };
  }
}
$("previousMonth").onclick = () => {
  selectedMonth = shiftMonth(selectedMonth, -1);
  render();
};
$("nextMonth").onclick = () => {
  if (selectedMonth < monthKey(new Date())) {
    selectedMonth = shiftMonth(selectedMonth, 1);
    render();
  }
};
$("quantity").oninput = render;
$("level").onchange = render;
$("service").onchange = render;
$("modeLevel").onclick = () => {
  registerMode = "level";
  $("modeLevel").classList.add("active");
  $("modeService").classList.remove("active");
  $("levelFields").classList.remove("hidden");
  $("serviceFields").classList.add("hidden");
  render();
};
$("modeService").onclick = () => {
  registerMode = "service";
  $("modeService").classList.add("active");
  $("modeLevel").classList.remove("active");
  $("levelFields").classList.add("hidden");
  $("serviceFields").classList.remove("hidden");
  render();
};
$("registerButton").onclick = () => {
  const quantity = Number($("quantity").value);
  const current = monthKey(new Date());
  if (selectedMonth !== current)
    return notify("Este mês está bloqueado para novos lançamentos.", "error");
  if (!isReady()) return notify("Aguarde a conexão com o Firebase.", "error");
  if (!Number.isInteger(quantity) || quantity < 1)
    return notify("Informe uma quantidade inteira maior que zero.", "error");
  const selectedService =
    registerMode === "service" ? serviceAtId($("service").value) : null;
  const level =
    registerMode === "service"
      ? selectedService?.nivel || 0
      : Number($("level").value);
  const unit = rateAt(level, today());
  if (registerMode === "service" && !selectedService)
    return notify("Selecione um serviço válido.", "error");
  if (!unit)
    return notify("Não há valor vigente cadastrado para este nível.", "error");
  const now = new Date();
  const payload = {
    data: now.toISOString(),
    criado_em: serverTimestamp(),
    periodo_ano: now.getFullYear(),
    periodo_mes: now.getMonth() + 1,
    nivel: level,
    quantidade: quantity,
    valor_unitario: unit,
    valor_total: quantity * unit,
  };
  if (selectedService) {
    payload.servico_id = selectedService.serviceId;
    payload.servico_nome = selectedService.nome;
  }
  addDoc(collection(db, COL.launches), payload)
    .then(() => {
      $("quantity").value = 1;
      notify(
        `${selectedService ? selectedService.nome : LEVEL_NAMES[level]} · ${quantity} unidade${quantity === 1 ? "" : "s"} registrado.`,
      );
      render();
    })
    .catch(fail);
};
$("settingsButton").onclick = () => {
  $("settingsModal").classList.remove("hidden");
  renderSettings();
};
$("manageValues").onclick = () => {
  $("settingsModal").classList.remove("hidden");
  renderSettings();
};
$("closeSettings").onclick = () => $("settingsModal").classList.add("hidden");
$("ratesTab").onclick = () => {
  settingsTab = "rates";
  $("ratesTab").classList.add("active");
  $("capTab").classList.remove("active");
  renderSettings();
};
$("capTab").onclick = () => {
  settingsTab = "cap";
  $("capTab").classList.add("active");
  $("ratesTab").classList.remove("active");
  renderSettings();
};
render();

/* ---------- Sincronização com o Firestore ---------- */
function setStatus() {
  const pill = $("connectionPill"),
    cached = Object.values(fromCache).some(Boolean);
  let text = "Conectando…",
    cls = "";
  if (syncError) {
    text = "Erro de conexão";
    cls = "error";
  } else if (isReady() && !cached) {
    text = "Firebase conectado";
    cls = "online";
  } else if (isReady()) {
    text = navigator.onLine ? "Sincronizando…" : "Offline";
    cls = navigator.onLine ? "" : "offline";
  }
  pill.querySelector("span").textContent = text;
  pill.className = `connection-pill ${cls}`.trim();
}
async function seed(key) {
  if (seeding[key]) return;
  seeding[key] = true;
  try {
    if (key === "services") {
      for (let i = 0; i < SERVICE_CATALOG.length; i += 450) {
        const batch = writeBatch(db);
        SERVICE_CATALOG.slice(i, i + 450).forEach((s) =>
          batch.set(doc(db, COL.services, `service-${s.id}`), {
            id: s.id,
            nome: s.name,
            nivel: s.level,
            ativo: true,
          }),
        );
        await batch.commit();
      }
      return;
    }
    const batch = writeBatch(db),
      d = initial();
    if (key === "rates")
      d.rates.forEach((r) =>
        batch.set(doc(db, COL.rates, r.id), {
          nivel: r.level,
          valor: r.value,
          inicio: r.startDate,
        }),
      );
    else
      d.caps.forEach((c) =>
        batch.set(doc(db, COL.caps, c.id), {
          tipo: CAP_TYPE,
          valor: c.value,
          inicio: c.startDate,
        }),
      );
    await batch.commit();
  } catch (err) {
    console.warn("Seed ignorado (provavelmente já existe):", err);
  }
}
function listen(key, map, keep = () => true) {
  onSnapshot(
    collection(db, COL[key]),
    { includeMetadataChanges: true },
    (snap) => {
      state[key] = snap.docs.filter(keep).map(map);
      loaded[key] = true;
      fromCache[key] = snap.metadata.fromCache;
      syncError = false;
      if (key !== "launches" && !state[key].length && !snap.metadata.fromCache)
        seed(key);
      setStatus();
      render();
      if (
        key !== "launches" &&
        snap.docChanges().length &&
        !$("settingsModal").classList.contains("hidden")
      )
        renderSettings();
    },
    (err) => {
      console.error(err);
      syncError = true;
      setStatus();
      notify(
        err.code === "permission-denied"
          ? "Sem permissão no Firestore. Confira as regras."
          : "Erro ao sincronizar com o Firebase.",
        "error",
      );
    },
  );
}
listen("rates", rateFromDoc);
listen("caps", capFromDoc, (d) => d.data().tipo === CAP_TYPE);
listen("launches", launchFromDoc);
listen("services", serviceFromDoc);
window.addEventListener("online", setStatus);
window.addEventListener("offline", setStatus);
setStatus();
