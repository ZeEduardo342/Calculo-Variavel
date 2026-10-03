import {
  db,
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "./firebase.js";
const COL = {
  rates: "valores_niveis",
  caps: "configuracoes",
  launches: "lancamentos",
  services: "servicos",
};
const SERVICES_SEED = [
  { id: "svc-1", name: "(1) Ajuste de Arte", level: 1 },
  { id: "svc-2", name: "(2) Ajuste em Arte Pronta", level: 1 },
  { id: "svc-3", name: "(3) Ajuste em Fotos", level: 1 },
  { id: "svc-4", name: "(4) Correção em Arte", level: 1 },
  { id: "svc-5", name: "(5) Criação de Arte para Telegram", level: 3 },
  { id: "svc-6", name: "(6) Criação de Arte para TV Corporativa", level: 3 },
  { id: "svc-7", name: "(7) Criação de Adesivo Grande", level: 4 },
  { id: "svc-8", name: "(8) Criação de Adesivo Pequeno", level: 2 },
  { id: "svc-9", name: "(9) Criação de Arte para E-mail", level: 3 },
  { id: "svc-10", name: "(10) Criação de Arte para Feira", level: 3 },
  { id: "svc-11", name: "(11) Criação de Banner", level: 3 },
  { id: "svc-12", name: "(12) Criação de Banner para Blog", level: 3 },
  { id: "svc-13", name: "(13) Criação de Carta", level: 3 },
  { id: "svc-14", name: "(14) Edição de Cartão de Visita", level: 2 },
  { id: "svc-15", name: "(15) Criação de Convite", level: 3 },
  { id: "svc-16", name: "(16) Criação de Flyer", level: 3 },
  { id: "svc-17", name: "(17) Criação de Landing Page", level: 4 },
  { id: "svc-18", name: "(18) Criação de Layout de Brindes", level: 3 },
  { id: "svc-19", name: "(19) Criação de Logo", level: 3 },
  { id: "svc-20", name: "(20) Criação de Outdoor", level: 3 },
  { id: "svc-21", name: "(21) Criação de Story", level: 3 },
  { id: "svc-22", name: "(22) Criação de Wallpaper", level: 3 },
  { id: "svc-23", name: "(23) Criação de Post", level: 3 },
  { id: "svc-24", name: "(24) Criação de Mockup", level: 4 },
  { id: "svc-25", name: "(25) Diagramação por Página", level: 3 },
  { id: "svc-26", name: "(26) Criação de Foto de Perfil", level: 3 },
  { id: "svc-27", name: "(27) Montagem em Imagem", level: 3 },
  { id: "svc-28", name: "(28) Criação de Formulário", level: 3 },
  { id: "svc-29", name: "(29) Ajuste em Formulário", level: 2 },
  { id: "svc-30", name: "(30) Criação de PDF Preenchível", level: 4 },
  { id: "svc-31", name: "(31) Ajuste em PDF", level: 2 },
  { id: "svc-32", name: "(32) Operação de OBS", level: 1 },
  { id: "svc-33", name: "(33) Criação de Tabela no Excel", level: 1 },
  { id: "svc-34", name: "(34) Post Telegram", level: 2 },
  { id: "svc-35", name: "(35) Criação de Canal no Telegram", level: 1 },
  { id: "svc-36", name: "(36) Fechamento de arquivo", level: 1 },
  {
    id: "svc-37",
    name: "(37) Criação de Texto Curto (Telegram e Redes Sociais)",
    level: 2,
  },
  {
    id: "svc-38",
    name: "(38) Criação de Texto Médio (Apresentação de Produtos, Lançamentos)",
    level: 3,
  },
  {
    id: "svc-39",
    name: "(39) Criação de Texto Longo (Reportagens, Revistas e Redes sociais)",
    level: 4,
  },
  { id: "svc-40", name: "(40) Gravação de Vídeo Simples", level: 2 },
  { id: "svc-41", name: "(41) Gravação de Vídeo Complexo", level: 4 },
  { id: "svc-42", name: "(42) Correção de Texto", level: 2 },
  { id: "svc-43", name: "(43) Edição de Vídeo Simples", level: 2 },
  { id: "svc-44", name: "(44) Edição de Vídeo Complexa", level: 3 },
  { id: "svc-45", name: "(45) Roteiro da Live da Semana", level: 4 },
  {
    id: "svc-46",
    name: "(46) Ajuste de Arte para o Café com a Direção",
    level: 1,
  },
  {
    id: "svc-47",
    name: "(47) Produção de Fotos de Colaboradores no Fundo Branco",
    level: 2,
  },
  {
    id: "svc-48",
    name: "(48) Produção de Fotos de Colaboradores nos Cenários da Loja",
    level: 1,
  },
  {
    id: "svc-49",
    name: "(49) Produção de Fotos Externas (fora de União da Vitória)",
    level: 4,
  },
  {
    id: "svc-50",
    name: "(50) Criação de Roteiro para Vídeo e Áudio",
    level: 3,
  },
  {
    id: "svc-51",
    name: "(51) Gravação de Vídeo Externo (fora de União da Vitória)",
    level: 4,
  },
  { id: "svc-52", name: "(52) Pormade na Mídia", level: 1 },
  { id: "svc-53", name: "(53) Criar Programação Rise Vision", level: 3 },
  { id: "svc-54", name: "(54) Alteração de Arte no Rise Vision", level: 1 },
  {
    id: "svc-55",
    name: "(55) Roteiro para Gravação de Áudio (Locução)",
    level: 2,
  },
  {
    id: "svc-56",
    name: "(56) Montagem de Equipamentos para Gravação de Áudio no estúdio (Locução)",
    level: 1,
  },
  { id: "svc-57", name: "(57) Gravação de Áudio (Locução)", level: 3 },
  { id: "svc-58", name: "(58) Edição de Áudio (Locução)", level: 3 },
  { id: "svc-59", name: "(59) Teste de Áudio (Transmissão ao vivo)", level: 1 },
  {
    id: "svc-60",
    name: "(60) Operação de Áudio (Transmissão ao vivo)",
    level: 4,
  },
  { id: "svc-61", name: "(61) Suporte Técnico (Auditório)", level: 3 },
  { id: "svc-62", name: "(62) Revisão e Manutenção de Áudio", level: 2 },
  { id: "svc-63", name: "(63) Captura de imagens (Foto)", level: 2 },
  { id: "svc-64", name: "(64) INUTILIZAR", level: 1 },
  { id: "svc-65", name: "(65) Captura de Imagens (Vídeo)", level: 2 },
  { id: "svc-66", name: "(66) Criação de Vídeo no After Effects", level: 4 },
  { id: "svc-67", name: "(67) Animação de vídeo", level: 4 },
  { id: "svc-68", name: "(68) Criação de Imagens (Vídeo)", level: 1 },
  { id: "svc-69", name: "(69) Manutenção do Estúdio", level: 2 },
  {
    id: "svc-70",
    name: "(70) Organização do Estúdio (Transmissão ao vivo)",
    level: 1,
  },
  { id: "svc-71", name: "(71) Apresentação (Transmissão ao vivo)", level: 1 },
  { id: "svc-72", name: "(72) Apresentação (Integração)", level: 1 },
  { id: "svc-73", name: "(73) Apresentação (Gravação)", level: 1 },
  {
    id: "svc-74",
    name: "(74) Suporte Técnico (Transmissão ao vivo)",
    level: 4,
  },
  {
    id: "svc-75",
    name: "(75) Revisão e Manutenção de Equipamentos do Estúdio",
    level: 3,
  },
  { id: "svc-76", name: "(76) Configuração do OBS", level: 1 },
  { id: "svc-77", name: "(77) Leitura de Comentários da Live", level: 1 },
  { id: "svc-78", name: "(78) Impressões", level: 1 },
  { id: "svc-79", name: "(79) Criação de Mapa", level: 1 },
  { id: "svc-80", name: "(80) Edição do Mapa", level: 1 },
  { id: "svc-81", name: "(81) Libras", level: 1 },
  { id: "svc-82", name: "(82) Pagamento de Live", level: 1 },
  { id: "svc-83", name: "(83) Sorteio da Live no Pátio", level: 1 },
  { id: "svc-84", name: "(84) Criação de Slides", level: 3 },
  { id: "svc-85", name: "(85) Manutenção de Slides", level: 2 },
  { id: "svc-86", name: "(86) Criação de Arte para Formulário", level: 3 },
  {
    id: "svc-87",
    name: "(87) Criação de arte complexa para apresentação",
    level: 4,
  },
  { id: "svc-88", name: "(88) Criação arte para impressão em porta", level: 4 },
  {
    id: "svc-89",
    name: "(89) Criação de arte para perfil corporativo",
    level: 3,
  },
  { id: "svc-90", name: "(90) Criação de arte para capa do EAD", level: 1 },
  { id: "svc-91", name: "(91) Criação de arte para veículos", level: 4 },
  { id: "svc-92", name: "(92) Escaneamento em PDF", level: 1 },
  { id: "svc-93", name: "(93) Criação de arte para redes sociais", level: 3 },
  { id: "svc-94", name: "(94) Criação de arte para mapa", level: 1 },
  { id: "svc-95", name: "(95) Criação de arte para apresentação", level: 3 },
  { id: "svc-96", name: "(96) Edição de lona", level: 1 },
  { id: "svc-97", name: "(97) Criação de QR Code", level: 1 },
  {
    id: "svc-98",
    name: "(98) Edição de QR Code (essa é para alterar o link quando o QR já está criado)",
    level: 1,
  },
  { id: "svc-99", name: "(99) Criação de catálogo", level: 4 },
  { id: "svc-100", name: "(100) Edição de catálogo", level: 2 },
  { id: "svc-101", name: "(101) Correção de texto curto", level: 2 },
  { id: "svc-102", name: "(102) Correção de texto longo", level: 4 },
  { id: "svc-103", name: "(103) Criação de legenda curta", level: 2 },
  { id: "svc-104", name: "(104) Criação de legenda média", level: 3 },
  { id: "svc-105", name: "(105) Criação de legenda longa", level: 4 },
  { id: "svc-106", name: "(106) Correção de legenda curta", level: 1 },
  { id: "svc-107", name: "(107) Correção de legenda média", level: 2 },
  { id: "svc-108", name: "(108) Correção de legenda longa", level: 3 },
  { id: "svc-109", name: "(109) Inclusão Drive Pormade", level: 2 },
  { id: "svc-110", name: "(110) Alteração Drive Pormade", level: 1 },
  { id: "svc-111", name: "(111) Criação de Banner para Site", level: 3 },
  { id: "svc-112", name: "(112) Criação de Banner para Site Mobile", level: 3 },
  {
    id: "svc-113",
    name: "(113) Ajuste de Arte para Campanha Criteo",
    level: 2,
  },
  { id: "svc-114", name: "(114) Criação de arte para copo", level: 3 },
  { id: "svc-115", name: "(115) Criação de placa", level: 2 },
  {
    id: "svc-116",
    name: "(116) Diagramação (lotes de 1 a 10 folhas)",
    level: 3,
  },
  {
    id: "svc-117",
    name: "(117) Diagramação (lotes de 11 a 50 folhas)",
    level: 4,
  },
  {
    id: "svc-118",
    name: "(118) Diagramação (lotes acima de 50 folhas)",
    level: 4,
  },
  { id: "svc-119", name: "(119) Fechamento de arquivo (pequeno)", level: 2 },
  { id: "svc-120", name: "(120) Fechamento de arquivo (grande)", level: 4 },
  {
    id: "svc-121",
    name: "(121) Aniversariante do dia (lotes de 1 a 5)",
    level: 1,
  },
  {
    id: "svc-122",
    name: "(122) Aniversariante do dia (lotes de 6 a 15)",
    level: 2,
  },
  {
    id: "svc-123",
    name: "(123) Aniversariante do dia (lotes de 16 a 30)",
    level: 3,
  },
  {
    id: "svc-124",
    name: "(124) Aniversariante do dia (lotes acima de 30)",
    level: 4,
  },
  { id: "svc-125", name: "(125) Criação campanha promoção do mês", level: 4 },
  {
    id: "svc-126",
    name: "(126) Ajuste campanha promoção do mês - google",
    level: 2,
  },
  {
    id: "svc-127",
    name: "(127) Aniversariante de empresa (lotes de 16 a 30)",
    level: 3,
  },
  {
    id: "svc-128",
    name: "(128) Aniversariante de empresa (lotes acima de 30)",
    level: 4,
  },
  { id: "svc-129", name: "(129) Criação de thumbnail", level: 3 },
  { id: "svc-130", name: "(130) Criação de capa para vídeo", level: 1 },
  { id: "svc-131", name: "(131) Compartilhar link da live", level: 1 },
  { id: "svc-132", name: "(132) Criação de circular", level: 3 },
  { id: "svc-133", name: "(133) Criação de arte para PDF editável", level: 3 },
  { id: "svc-134", name: "(134) Alteração de mockup", level: 3 },
  { id: "svc-135", name: "(135) Criação de anúncio para revista", level: 4 },
  { id: "svc-136", name: "(136) Criação de cartão", level: 3 },
  { id: "svc-137", name: "(137) Upload de vídeo", level: 1 },
  { id: "svc-138", name: "(138) Edição de imagem", level: 3 },
  { id: "svc-139", name: "(139) Refação de vídeo", level: 1 },
  {
    id: "svc-140",
    name: "(140) Ajuste campanha promoção do mês - redes sociais",
    level: 2,
  },
  {
    id: "svc-141",
    name: "(141) Ajuste campanha promoção do mês - site",
    level: 2,
  },
  { id: "svc-142", name: "(142) Criar link no youtube", level: 2 },
  { id: "svc-143", name: "(143) Criação de crachá", level: 3 },
  { id: "svc-144", name: "(144) Manutenção de crachá", level: 2 },
  { id: "svc-145", name: "(145) Criação de ícone", level: 2 },
  { id: "svc-146", name: "(146) Criação de arte para mini porta", level: 3 },
  { id: "svc-147", name: "(147) Criação de arte para o rise vision", level: 3 },
  {
    id: "svc-148",
    name: "(148) Criação de arte para camisas/camisetas",
    level: 4,
  },
  { id: "svc-149", name: "(149) Impressão colorida", level: 1 },
  { id: "svc-150", name: "(150) Alteração Caixa de Amostras", level: 3 },
  { id: "svc-151", name: "(151) Foto de produto", level: 4 },
  {
    id: "svc-152",
    name: "(152) Entrevista externa (Feiras, eventos)",
    level: 4,
  },
  {
    id: "svc-153",
    name: "(153) Inclusão de dados agenda Pormade móvel (de 20 a 30)",
    level: 1,
  },
  {
    id: "svc-154",
    name: "(154) Inclusão de dados agenda Pormade móvel (de 31 a 60)",
    level: 1,
  },
  {
    id: "svc-155",
    name: "(155) Inclusão de dados agenda Pormade móvel (acima de 60)",
    level: 1,
  },
  { id: "svc-156", name: "(156) Adaptação de post para storie", level: 2 },
  { id: "svc-157", name: "(157) Remover fundo de imagens", level: 2 },
  {
    id: "svc-158",
    name: "(158) Conversão de formato de arquivos de áudio",
    level: 1,
  },
  { id: "svc-159", name: "(159) Inativar formulário", level: 2 },
  { id: "svc-160", name: "(160) Criar formulário | ADVA", level: 2 },
  { id: "svc-161", name: "(161) Criação de arte para slides", level: 2 },
  { id: "svc-162", name: "(162) Criação de arte para evento", level: 3 },
  { id: "svc-163", name: "(163) Criação de moldura (spin 360º)", level: 2 },
  { id: "svc-164", name: "(164) Gravação de vídeo com a GoPro 360º", level: 3 },
  {
    id: "svc-165",
    name: "(165) Edição de vídeo complexo com a GoPro 360º",
    level: 4,
  },
  { id: "svc-166", name: "(166) Orçar compra de equipamentos", level: 1 },
  { id: "svc-167", name: "(167) Orçar material gráfico", level: 1 },
  { id: "svc-168", name: "(168) Correção de texto médio", level: 3 },
  { id: "svc-169", name: "(169) Edição do Mapa (Entre 1 a 10)", level: 1 },
  { id: "svc-170", name: "(170) Edição do Mapa (Entre 11 a 30)", level: 1 },
  { id: "svc-171", name: "(171) Edição do Mapa (Acima de 30)", level: 1 },
  { id: "svc-172", name: "(172) Criação de apresentação no Prezi", level: 1 },
  { id: "svc-173", name: "(173) Produção de fotos | F2", level: 2 },
  { id: "svc-174", name: "(174) Correção de roteiro", level: 3 },
  {
    id: "svc-175",
    name: "(175) Gravação de vídeo | Média complexidade",
    level: 3,
  },
  {
    id: "svc-176",
    name: "(176) Criação de roteiro | Vídeo complexo",
    level: 4,
  },
  {
    id: "svc-177",
    name: "(177) Pergunta fácil/média | Papo com a Direção",
    level: 1,
  },
  {
    id: "svc-178",
    name: "(178) Pergunta difícil | Papo com a Direção",
    level: 1,
  },
  { id: "svc-179", name: "(179) Transmissão ao vivo", level: 1 },
  { id: "svc-180", name: "(180) Sorteio ao vivo", level: 1 },
  { id: "svc-181", name: "(181) Criação de certificado", level: 2 },
  {
    id: "svc-182",
    name: "(182) Automatização de certificado no Jotform",
    level: 2,
  },
  { id: "svc-183", name: "(183) Suporte Técnico (Evento Externo)", level: 4 },
  {
    id: "svc-184",
    name: "(184) Edição de vídeo | Feira e eventos externos",
    level: 4,
  },
  { id: "svc-185", name: "(185) Arte para porta | Linha HD", level: 4 },
  { id: "svc-186", name: "(186) Criar FlipSnack", level: 3 },
  { id: "svc-187", name: "(187) Link para PDF preenchível", level: 2 },
  { id: "svc-188", name: "(188) Fotos em eventos", level: 3 },
  { id: "svc-189", name: "(189) Vetorização de imagem", level: 3 },
  { id: "svc-190", name: "(190) Criação de Identidade Visual", level: 4 },
  { id: "svc-191", name: "(191) Automatização de arte no InDesign", level: 3 },
  { id: "svc-192", name: "(192) Criação de app no JotForm", level: 4 },
  {
    id: "svc-193",
    name: "(193) Edição de imagem (foto) para vídeo - Baixa complexidade",
    level: 1,
  },
  {
    id: "svc-194",
    name: "(194) Edição de imagem (foto) para vídeo - Média complexidade",
    level: 2,
  },
  {
    id: "svc-195",
    name: "(195) Edição de imagem (foto) para vídeo - Alta complexidade",
    level: 3,
  },
  { id: "svc-196", name: "(196) Cartaz à mão", level: 1 },
  { id: "svc-197", name: "(197) Criação de arte para shaft", level: 3 },
  { id: "svc-198", name: "(198) Ajuste de formulário + QR Code", level: 3 },
  { id: "svc-199", name: "(199) Alteração complexa de formulário", level: 2 },
  { id: "svc-200", name: "(200) Criação eventos Google Agenda", level: 1 },
  {
    id: "svc-201",
    name: "(201) Criação de convite para jurados | Festival da Canção",
    level: 3,
  },
  {
    id: "svc-202",
    name: "(202) Organização do corpo de jurados | Festival da Canção",
    level: 4,
  },
  {
    id: "svc-203",
    name: "(203) Edição de músicas para o Festival da Canção | Alteração de tonalidade",
    level: 3,
  },
  {
    id: "svc-204",
    name: "Organização dos participantes | Festival da Canção",
    level: 1,
  },
  {
    id: "svc-205",
    name: "Organização da banda | Festival da Canção",
    level: 4,
  },
  {
    id: "svc-206",
    name: "(206) Criação e edição das cédulas de votação para os jurados do Festival da Canção",
    level: 1,
  },
  { id: "svc-207", name: "Foto profissional no estúdio", level: 4 },
  { id: "svc-208", name: "Arte botão Stream Ddeck", level: 1 },
  { id: "svc-209", name: "Arte personalização de Convenção", level: 2 },
  { id: "svc-210", name: "(210) Produção de vídeo", level: 4 },
  { id: "svc-211", name: "(211) Marcar entrevista e acompanhamento", level: 4 },
  { id: "svc-212", name: "Criação de adesivo médio", level: 3 },
  { id: "svc-213", name: "Modelagem 3D", level: 4 },
  { id: "svc-214", name: "Texturização 3D", level: 4 },
  { id: "svc-215", name: "Renderização 3D", level: 4 },
];
const CAP_TYPE = "teto_mensal";
const LEVEL_NAMES = { 1: "Nível 1", 2: "Nível 2", 3: "Nível 3", 4: "Nível 4" };
const LEVELS = [1, 2, 3, 4];
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
  loaded.rates && loaded.caps && loaded.launches && loaded.services;
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
const serviceFromDoc = (d) => {
  const x = d.data();
  return { id: d.id, name: x.nome, level: x.nivel };
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
let selectedMonth = monthKey(new Date());
let settingsTab = "rates";
let registerMode = "nivel";
let servicesFilter = "";
const $ = (id) => document.getElementById(id);
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
const norm = (s) => (s || "").trim().toLowerCase();
const findService = (name) =>
  state.services.find((sv) => norm(sv.name) === norm(name));
const monthStatus = (key) => {
  const cur = monthKey(new Date());
  return key === cur ? "current" : key > cur ? "future" : "past";
};
function render() {
  $("serviceOptions").innerHTML = state.services
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((sv) => `<option value="${sv.name}"></option>`)
    .join("");
  const current = monthKey(new Date());
  const launches = state.launches
    .filter((x) => monthKey(x.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = launches.reduce((s, x) => s + x.total, 0);
  const cap = capAt(`${selectedMonth}-31`);
  const pct = cap ? (total / cap) * 100 : 0;
  const remaining = cap - total;
  const qty =
    registerMode === "nivel"
      ? Number($("quantity").value) || 0
      : Number($("quantityServico").value) || 0;
  const matchedService =
    registerMode === "servico" ? findService($("serviceInput").value) : null;
  const level =
    registerMode === "nivel"
      ? Number($("level").value)
      : matchedService
        ? matchedService.level
        : 0;
  const unit = level ? rateAt(level, today()) : 0;
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
    registerMode === "nivel"
      ? `${LEVEL_NAMES[level]} × ${qty || 0}`
      : matchedService
        ? `${matchedService.name} (${LEVEL_NAMES[level]}) × ${qty || 0}`
        : $("serviceInput").value
          ? "Serviço não encontrado"
          : "Selecione um serviço";
  $("previewTotal").textContent = currency(qty * unit);
  const monthStat = monthStatus(selectedMonth);
  const validEntry = registerMode === "nivel" ? !!level : !!matchedService;
  $("registerButton").disabled =
    monthStat !== "current" || !isReady() || !validEntry;
  $("readOnlyHint").classList.toggle("hidden", monthStat === "current");
  $("readOnlyHint").textContent =
    monthStat === "future"
      ? "◷ Mês futuro ainda não liberado para lançamentos."
      : monthStat === "past"
        ? "◷ Mês encerrado — consulta em modo de leitura."
        : "";
  $("recordCount").textContent =
    `${String(launches.length).padStart(2, "0")} registros`;
  const last = state.launches
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  $("latestLaunch").innerHTML = last
    ? `<div class="last-main"><div class="last-level">N${last.level}</div><div><strong>${LEVEL_NAMES[last.level]}</strong><span>${last.quantity} unidade${last.quantity === 1 ? "" : "s"} · ${dateTime(last.date)}</span></div></div><div class="last-total">+ ${currency(last.total)}</div><button class="undo-button" id="undoButton">↶ Desfazer último lançamento</button>`
    : `<div class="empty-last"><div class="empty-icon">▱</div><strong>Nenhum lançamento ainda</strong><span>O próximo registro aparece aqui.</span></div>`;
  if ($("undoButton"))
    $("undoButton").onclick = () => {
      deleteDoc(doc(db, COL.launches, last.id)).catch(fail);
      notify("Último lançamento desfeito.");
    };
  $("historyContent").innerHTML = launches.length
    ? `<div class="history-table-wrap"><table><thead><tr><th>DATA</th><th>NÍVEL</th><th>SERVIÇO</th><th>QTD.</th><th>UNITÁRIO</th><th class="right">TOTAL</th></tr></thead><tbody>${launches.map((x) => `<tr><td><b>${dateTime(x.date).split(",")[0]}</b><span>${dateTime(x.date).split(",")[1]}</span></td><td><i class="level-chip level-${x.level}">N${x.level}</i>${LEVEL_NAMES[x.level]}</td><td>${x.serviceName || "—"}</td><td>${x.quantity}</td><td>${currency(x.unitValue)}</td><td class="right total-cell">${currency(x.total)}</td></tr>`).join("")}</tbody></table></div>`
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
  } else if (settingsTab === "cap") {
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
  } else {
    const list = state.services
      .filter((sv) => norm(sv.name).includes(norm(servicesFilter)))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    body.innerHTML = `<div class="settings-form"><label>NOME DO SERVIÇO<input id="newServiceName" class="number-input" placeholder="Nome do novo serviço"></label><label>NÍVEL<div class="select-wrap"><select id="newServiceLevel">${LEVELS.map((x) => `<option value="${x}">${LEVEL_NAMES[x]}</option>`).join("")}</select><span>⌄</span></div></label><button id="saveService" class="save-button">Adicionar serviço ＋</button></div><input id="serviceSearch" class="services-search" placeholder="Buscar serviço…" value="${servicesFilter}"><div class="services-count">${list.length} de ${state.services.length} serviços</div><div class="settings-list">${list.map((sv) => `<div class="service-row"><strong>${sv.name}</strong><select data-service-level="${sv.id}">${LEVELS.map((x) => `<option value="${x}" ${x === sv.level ? "selected" : ""}>${LEVEL_NAMES[x]}</option>`).join("")}</select></div>`).join("") || '<div class="empty-state"><strong>Nenhum serviço encontrado</strong></div>'}</div>`;
    $("saveService").onclick = () => {
      const name = $("newServiceName").value.trim();
      if (!name) return notify("Informe o nome do serviço.", "error");
      if (findService(name))
        return notify("Já existe um serviço com esse nome.", "error");
      addDoc(collection(db, COL.services), {
        nome: name,
        nivel: Number($("newServiceLevel").value),
      }).catch(fail);
      $("newServiceName").value = "";
      notify("Serviço adicionado.");
    };
    $("serviceSearch").oninput = () => {
      servicesFilter = $("serviceSearch").value;
      renderSettings();
      setTimeout(() => {
        const el = $("serviceSearch");
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }, 0);
    };
    body.querySelectorAll("[data-service-level]").forEach(
      (sel) =>
        (sel.onchange = () => {
          setDoc(
            doc(db, COL.services, sel.dataset.serviceLevel),
            { nivel: Number(sel.value) },
            { merge: true },
          ).catch(fail);
          notify("Nível do serviço atualizado.");
        }),
    );
  }
}
$("previousMonth").onclick = () => {
  selectedMonth = shiftMonth(selectedMonth, -1);
  render();
};
$("nextMonth").onclick = () => {
  selectedMonth = shiftMonth(selectedMonth, 1);
  render();
};
$("quantity").oninput = render;
$("level").onchange = render;
$("quantityServico").oninput = render;
$("serviceInput").oninput = render;
$("modeNivelTab").onclick = () => {
  registerMode = "nivel";
  $("modeNivelTab").classList.add("active");
  $("modeServicoTab").classList.remove("active");
  $("nivelFields").classList.remove("hidden");
  $("servicoFields").classList.add("hidden");
  render();
};
$("modeServicoTab").onclick = () => {
  registerMode = "servico";
  $("modeServicoTab").classList.add("active");
  $("modeNivelTab").classList.remove("active");
  $("servicoFields").classList.remove("hidden");
  $("nivelFields").classList.add("hidden");
  render();
};
$("registerButton").onclick = () => {
  const quantity =
    registerMode === "nivel"
      ? Number($("quantity").value)
      : Number($("quantityServico").value);
  const service =
    registerMode === "servico" ? findService($("serviceInput").value) : null;
  const level =
    registerMode === "nivel"
      ? Number($("level").value)
      : service
        ? service.level
        : 0;
  const unit = level ? rateAt(level, today()) : 0;
  if (monthStatus(selectedMonth) !== "current")
    return notify("Volte ao mês atual para registrar.", "error");
  if (!isReady()) return notify("Aguarde a conexão com o Firebase.", "error");
  if (registerMode === "servico" && !service)
    return notify("Selecione um serviço válido da lista.", "error");
  if (!unit)
    return notify("Não há valor vigente cadastrado para este nível.", "error");
  if (!Number.isInteger(quantity) || quantity < 1)
    return notify("Informe uma quantidade inteira maior que zero.", "error");
  const payload = {
    data: new Date().toISOString(),
    nivel: level,
    quantidade: quantity,
    valor_unitario: unit,
    valor_total: quantity * unit,
  };
  if (service) {
    payload.servico_id = service.id;
    payload.servico_nome = service.name;
  }
  addDoc(collection(db, COL.launches), payload).catch(fail);
  if (registerMode === "nivel") $("quantity").value = 1;
  else {
    $("quantityServico").value = 1;
    $("serviceInput").value = "";
  }
  notify(
    `${service ? service.name : LEVEL_NAMES[level]} · ${quantity} unidade${quantity === 1 ? "" : "s"} registrado.`,
  );
  render();
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
const settingsTabs = {
  rates: $("ratesTab"),
  cap: $("capTab"),
  services: $("servicesTab"),
};
const selectSettingsTab = (tab) => {
  settingsTab = tab;
  Object.entries(settingsTabs).forEach(([k, btn]) =>
    btn.classList.toggle("active", k === tab),
  );
  renderSettings();
};
$("ratesTab").onclick = () => selectSettingsTab("rates");
$("capTab").onclick = () => selectSettingsTab("cap");
$("servicesTab").onclick = () => selectSettingsTab("services");
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
      for (let i = 0; i < SERVICES_SEED.length; i += 450) {
        const batch = writeBatch(db);
        SERVICES_SEED.slice(i, i + 450).forEach((sv) =>
          batch.set(doc(db, COL.services, sv.id), {
            nome: sv.name,
            nivel: sv.level,
          }),
        );
        await batch.commit();
      }
    } else {
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
    }
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
