import {
  db,
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  writeBatch,
} from "./firebase.js";
const COL = {
  rates: "valores_niveis",
  caps: "configuracoes",
  launches: "lancamentos",
};
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
let state = { launches: [], rates: [], caps: [] };
const loaded = { rates: false, caps: false, launches: false },
  fromCache = { rates: false, caps: false, launches: false },
  seeding = {};
let syncError = false;
const isReady = () => loaded.rates && loaded.caps && loaded.launches;
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
  };
};
let selectedMonth = monthKey(new Date());
let settingsTab = "rates";
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
function render() {
  const current = monthKey(new Date());
  const launches = state.launches
    .filter((x) => monthKey(x.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = launches.reduce((s, x) => s + x.total, 0);
  const cap = capAt(`${selectedMonth}-31`);
  const pct = cap ? (total / cap) * 100 : 0;
  const remaining = cap - total;
  const qty = Number($("quantity").value) || 0;
  const level = Number($("level").value);
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
  $("previewText").textContent = `${LEVEL_NAMES[level]} × ${qty || 0}`;
  $("previewTotal").textContent = currency(qty * unit);
  $("registerButton").disabled = selectedMonth !== current || !isReady();
  $("readOnlyHint").classList.toggle("hidden", selectedMonth === current);
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
    ? `<div class="history-table-wrap"><table><thead><tr><th>DATA</th><th>NÍVEL</th><th>QTD.</th><th>UNITÁRIO</th><th class="right">TOTAL</th></tr></thead><tbody>${launches.map((x) => `<tr><td><b>${dateTime(x.date).split(",")[0]}</b><span>${dateTime(x.date).split(",")[1]}</span></td><td><i class="level-chip level-${x.level}">N${x.level}</i>${LEVEL_NAMES[x.level]}</td><td>${x.quantity}</td><td>${currency(x.unitValue)}</td><td class="right total-cell">${currency(x.total)}</td></tr>`).join("")}</tbody></table></div>`
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
  selectedMonth = shiftMonth(selectedMonth, 1);
  render();
};
$("quantity").oninput = render;
$("level").onchange = render;
$("registerButton").onclick = () => {
  const quantity = Number($("quantity").value),
    level = Number($("level").value),
    unit = rateAt(level, today());
  if (selectedMonth !== monthKey(new Date()))
    return notify("Volte ao mês atual para registrar.", "error");
  if (!isReady()) return notify("Aguarde a conexão com o Firebase.", "error");
  if (!unit)
    return notify("Não há valor vigente cadastrado para este nível.", "error");
  if (!Number.isInteger(quantity) || quantity < 1)
    return notify("Informe uma quantidade inteira maior que zero.", "error");
  addDoc(collection(db, COL.launches), {
    data: new Date().toISOString(),
    nivel: level,
    quantidade: quantity,
    valor_unitario: unit,
    valor_total: quantity * unit,
  }).catch(fail);
  $("quantity").value = 1;
  notify(
    `${LEVEL_NAMES[level]} · ${quantity} unidade${quantity === 1 ? "" : "s"} registrado.`,
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
window.addEventListener("online", setStatus);
window.addEventListener("offline", setStatus);
setStatus();
