const STORAGE_KEY = "bonus-calculator-vanilla-v1";
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
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
const uid = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const initial = () => ({
  launches: [],
  rates: LEVELS.map((level) => ({
    id: `rate-${level}`,
    level,
    value: [1, 2.5, 5, 10][level - 1],
    startDate: "2026-01-01",
  })),
  caps: [{ id: "cap-1", value: 200, startDate: "2026-01-01" }],
  services: SERVICE_CATALOG.map((s) => ({ ...s, active: true })),
});
let state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const base = initial();
    return saved
      ? {
          ...base,
          ...saved,
          services: saved.services?.length ? saved.services : base.services,
        }
      : base;
  } catch {
    return initial();
  }
})();
let selectedMonth = monthKey(new Date());
let settingsTab = "rates";
let launchMode = "level";
const $ = (id) => document.getElementById(id);
const currentMonth = () => monthKey(new Date());
const isLockedMonth = (key) => key !== currentMonth();
const rateAt = (level, date) =>
  state.rates
    .filter((r) => r.level === level && r.startDate <= date)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0]?.value || 0;
const capAt = (date) =>
  state.caps
    .filter((c) => c.startDate <= date)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0]?.value || 0;
const serviceById = (id) =>
  state.services.find((s) => String(s.id) === String(id));
const activeServices = () =>
  state.services
    .filter((s) => s.active !== false)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const notify = (message, tone = "success") => {
  const el = $("toast");
  el.textContent = message;
  el.className = `toast ${tone === "error" ? "error" : ""}`;
  setTimeout(() => el.classList.add("hidden"), 3000);
};
function renderServiceOptions() {
  const select = $("serviceSelect");
  if (!select) return;
  const previous = select.value;
  select.innerHTML = LEVELS.map(
    (level) =>
      `<optgroup label="${LEVEL_NAMES[level]}">${activeServices()
        .filter((s) => s.level === level)
        .map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`)
        .join("")}</optgroup>`,
  ).join("");
  if (activeServices().some((s) => String(s.id) === previous))
    select.value = previous;
  renderServiceHint();
}
function selectedEntry() {
  const quantity =
    launchMode === "service"
      ? Number($("serviceQuantity").value) || 0
      : Number($("quantity").value) || 0;
  const service =
    launchMode === "service" ? serviceById($("serviceSelect").value) : null;
  const level = service ? service.level : Number($("level").value);
  return { quantity, service, level, unit: rateAt(level, today()) };
}
function renderServiceHint() {
  const service = serviceById($("serviceSelect")?.value);
  if ($("serviceLevelHint"))
    $("serviceLevelHint").innerHTML = service
      ? `<span class="level-chip level-${service.level}">N${service.level}</span><span>${LEVEL_NAMES[service.level]} · ${currency(rateAt(service.level, today()))} por unidade</span>`
      : "";
}
function render() {
  save();
  const current = currentMonth();
  const launches = state.launches
    .filter((x) => monthKey(x.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = launches.reduce((s, x) => s + x.total, 0);
  const cap = capAt(`${selectedMonth}-31`);
  const pct = cap ? (total / cap) * 100 : 0;
  const remaining = cap - total;
  const entry = selectedEntry();
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
    launchMode === "service"
      ? `${entry.service ? entry.service.name : "Selecione um serviço"} × ${entry.quantity || 0} · ${LEVEL_NAMES[entry.level]}`
      : `${LEVEL_NAMES[entry.level]} × ${entry.quantity || 0}`;
  $("previewTotal").textContent = currency(entry.quantity * entry.unit);
  $("registerButton").disabled = isLockedMonth(selectedMonth);
  $("readOnlyHint").classList.toggle("hidden", !isLockedMonth(selectedMonth));
  $("readOnlyHint").textContent =
    selectedMonth > current
      ? "◷ Mês futuro bloqueado: aguarde o início do período."
      : "◷ Mês encerrado: lançamentos retroativos estão bloqueados.";
  $("recordCount").textContent =
    `${String(launches.length).padStart(2, "0")} registros`;
  const last = state.launches
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  $("latestLaunch").innerHTML = last
    ? `<div class="last-main"><div class="last-level">N${last.level}</div><div><strong>${escapeHtml(last.serviceName || LEVEL_NAMES[last.level])}</strong><span>${last.quantity} unidade${last.quantity === 1 ? "" : "s"} · ${dateTime(last.date)}</span></div></div><div class="last-total">+ ${currency(last.total)}</div><button class="undo-button" id="undoButton">↶ Desfazer último lançamento</button>`
    : `<div class="empty-last"><div class="empty-icon">▱</div><strong>Nenhum lançamento ainda</strong><span>O próximo registro aparece aqui.</span></div>`;
  if ($("undoButton"))
    $("undoButton").onclick = () => {
      state.launches = state.launches.filter((x) => x.id !== last.id);
      notify("Último lançamento desfeito.");
      render();
    };
  $("historyContent").innerHTML = launches.length
    ? `<div class="history-table-wrap"><table><thead><tr><th>DATA</th><th>SERVIÇO / NÍVEL</th><th>QTD.</th><th>UNITÁRIO</th><th class="right">TOTAL</th></tr></thead><tbody>${launches.map((x) => `<tr><td><b>${dateTime(x.date).split(",")[0]}</b><span>${dateTime(x.date).split(",")[1]}</span></td><td><i class="level-chip level-${x.level}">N${x.level}</i><b>${escapeHtml(x.serviceName || LEVEL_NAMES[x.level])}</b><span>${LEVEL_NAMES[x.level]}</span></td><td>${x.quantity}</td><td>${currency(x.unitValue)}</td><td class="right total-cell">${currency(x.total)}</td></tr>`).join("")}</tbody></table></div>`
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
      state.rates.push({
        id: uid(),
        level: Number($("newRateLevel").value),
        value,
        startDate: $("newRateDate").value,
      });
      notify("Nova vigência criada.");
      renderSettings();
      render();
    };
    body.querySelectorAll("[data-remove-rate]").forEach(
      (btn) =>
        (btn.onclick = () => {
          if (state.rates.length <= 4)
            return notify("Mantenha uma vigência por nível.", "error");
          state.rates = state.rates.filter(
            (r) => r.id !== btn.dataset.removeRate,
          );
          renderSettings();
          render();
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
      state.caps.push({ id: uid(), value, startDate: $("newCapDate").value });
      notify("Nova vigência de teto criada.");
      renderSettings();
      render();
    };
  } else {
    body.innerHTML = `<div class="settings-form service-admin-form"><label>NOVO SERVIÇO<input id="newServiceName" class="number-input" placeholder="Nome do serviço"></label><label>NÍVEL<div class="select-wrap"><select id="newServiceLevel">${LEVELS.map((x) => `<option value="${x}">${LEVEL_NAMES[x]}</option>`).join("")}</select><span>⌄</span></div></label><button id="saveService" class="save-button">Adicionar serviço ＋</button></div><div class="service-search-row"><input id="serviceSearch" class="number-input" placeholder="Buscar serviço por nome ou ID"><span>${state.services.filter((s) => s.active !== false).length} serviços ativos</span></div><div class="settings-list service-admin-list"><b>CATÁLOGO DE SERVIÇOS</b><div id="serviceAdminRows"></div></div>`;
    const drawRows = () => {
      const q = ($("serviceSearch").value || "").toLowerCase();
      $("serviceAdminRows").innerHTML =
        state.services
          .filter(
            (s) =>
              s.active !== false &&
              (!q ||
                String(s.id).includes(q) ||
                s.name.toLowerCase().includes(q)),
          )
          .slice(0, 80)
          .map(
            (s) =>
              `<div class="setting-row service-admin-row"><span class="service-id">#${s.id}</span><div><strong>${escapeHtml(s.name)}</strong><span>ID ${s.id}</span></div><select data-service-level="${s.id}">${LEVELS.map((l) => `<option value="${l}" ${l === s.level ? "selected" : ""}>${LEVEL_NAMES[l]}</option>`).join("")}</select><button data-remove-service="${s.id}" aria-label="Desativar serviço">×</button></div>`,
          )
          .join("") ||
        '<div class="empty-state compact-empty"><strong>Nenhum serviço encontrado</strong></div>';
      body.querySelectorAll("[data-service-level]").forEach(
        (select) =>
          (select.onchange = () => {
            const service = serviceById(select.dataset.serviceLevel);
            service.level = Number(select.value);
            save();
            renderServiceOptions();
            render();
            notify("Nível do serviço atualizado.");
          }),
      );
      body.querySelectorAll("[data-remove-service]").forEach(
        (btn) =>
          (btn.onclick = () => {
            const service = serviceById(btn.dataset.removeService);
            service.active = false;
            save();
            drawRows();
            renderServiceOptions();
            notify("Serviço retirado do catálogo ativo.");
          }),
      );
    };
    $("serviceSearch").oninput = drawRows;
    $("saveService").onclick = () => {
      const name = $("newServiceName").value.trim();
      if (!name) return notify("Informe o nome do serviço.", "error");
      const nextId =
        Math.max(0, ...state.services.map((s) => Number(s.id) || 0)) + 1;
      state.services.push({
        id: nextId,
        name,
        level: Number($("newServiceLevel").value),
        active: true,
      });
      notify("Serviço adicionado ao catálogo.");
      renderSettings();
      renderServiceOptions();
      render();
    };
    drawRows();
  }
}
function setLaunchMode(mode) {
  launchMode = mode;
  $("levelModeButton").classList.toggle("active", mode === "level");
  $("serviceModeButton").classList.toggle("active", mode === "service");
  $("levelModeFields").classList.toggle("hidden", mode !== "level");
  $("serviceModeFields").classList.toggle("hidden", mode !== "service");
  render();
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
$("serviceQuantity").oninput = render;
$("serviceSelect").onchange = () => {
  renderServiceHint();
  render();
};
$("levelModeButton").onclick = () => setLaunchMode("level");
$("serviceModeButton").onclick = () => setLaunchMode("service");
$("registerButton").onclick = () => {
  if (isLockedMonth(selectedMonth))
    return notify(
      selectedMonth > currentMonth()
        ? "Mês futuro bloqueado."
        : "Mês encerrado para novos lançamentos.",
      "error",
    );
  const entry = selectedEntry();
  if (!Number.isInteger(entry.quantity) || entry.quantity < 1)
    return notify("Informe uma quantidade inteira maior que zero.", "error");
  if (launchMode === "service" && !entry.service)
    return notify("Selecione um serviço.", "error");
  state.launches.push({
    id: uid(),
    date: new Date().toISOString(),
    level: entry.level,
    quantity: entry.quantity,
    unitValue: entry.unit,
    total: entry.quantity * entry.unit,
    serviceId: entry.service?.id || null,
    serviceName: entry.service?.name || null,
    entryMode: launchMode,
  });
  if (launchMode === "service") $("serviceQuantity").value = 1;
  else $("quantity").value = 1;
  notify(
    `${entry.service ? entry.service.name : LEVEL_NAMES[entry.level]} · ${entry.quantity} unidade${entry.quantity === 1 ? "" : "s"} registrado.`,
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
  document
    .querySelectorAll(".settings-tabs button")
    .forEach((b) => b.classList.remove("active"));
  $("ratesTab").classList.add("active");
  renderSettings();
};
$("capTab").onclick = () => {
  settingsTab = "cap";
  document
    .querySelectorAll(".settings-tabs button")
    .forEach((b) => b.classList.remove("active"));
  $("capTab").classList.add("active");
  renderSettings();
};
$("servicesTab").onclick = () => {
  settingsTab = "services";
  document
    .querySelectorAll(".settings-tabs button")
    .forEach((b) => b.classList.remove("active"));
  $("servicesTab").classList.add("active");
  renderSettings();
};
$("resetButton").onclick = () => {
  state = initial();
  notify("Configuração inicial restaurada.");
  renderServiceOptions();
  renderSettings();
  render();
};
renderServiceOptions();
render();
