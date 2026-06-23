/* =====================================================
   Generador de tarjetas Martina XV
   Filename esperado: qr-NOMBRE_APELLIDO-MESA_N(.ext)
   Salida: ZIP de PNGs individuales (1086×1448px)
   nombrados Película-NOMBRE_APELLIDO.png
   Todo se procesa en el navegador.
   ===================================================== */

const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, html = "") => {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === "class") e.className = attrs[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  if (html) e.innerHTML = html;
  return e;
};

const PNG_W = 1086, PNG_H = 1448;

const DEFAULT_MAP = `1: Enredados | dorada
2: Moana | comun
3: Ratatouille | comun
4: Rey León | comun
5: Cars | comun
6: Monsters Inc | comun
7: La Princesa y el Sapo | comun
8: Pocahontas | comun
9: Peter Pan | rara
10: Blancanieves | rara
11: Winnie the Pooh | comun
12: Aladdín | comun
13: Cenicienta | rara
14: Coco | epica
15: Dumbo | comun
16: 101 Dálmatas | rara
17: Maléfica | epica
18: La Bella y la Bestia | rara
19: La Sirenita | rara
20: Lilo & Stitch | comun`;

/* ---------------- state ---------------- */
let qrs = [];
let bad = [];
let mesaMap = {};

/* ---------------- parser de filename ---------------- */
function parseFilename(name) {
  const m = name.replace(/\.[^.]+$/, "").match(/^qr-(.+?)-MESA[_-]?(\d+)$/i);
  if (!m) return null;
  const personName = m[1]
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();
  const rawName = m[1].toUpperCase();
  return { name: personName, rawName, mesa: parseInt(m[2], 10) };
}

/* ---------------- mesa map parser ---------------- */
function parseMap(text) {
  const m = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(\d+)\s*[:\-]\s*([^|]+?)(?:\s*\|\s*(\w+))?\s*$/);
    if (!match) continue;
    const num = parseInt(match[1], 10);
    const nombre = match[2].trim();
    const rareza = (match[3] || "comun").toLowerCase();
    m[num] = { nombre, rareza: ["comun", "rara", "epica", "dorada"].includes(rareza) ? rareza : "comun" };
  }
  return m;
}

/* ---------------- file → dataUrl ---------------- */
function readAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ---------------- ingest ---------------- */
async function ingest(fileList) {
  qrs = []; bad = [];
  const list = Array.from(fileList).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f.name));
  for (const f of list) {
    const parsed = parseFilename(f.name);
    if (!parsed) { bad.push({ filename: f.name, reason: "no matchea qr-NOMBRE_APELLIDO-MESA_N" }); continue; }
    const dataUrl = await readAsDataURL(f);
    qrs.push({ filename: f.name, name: parsed.name, rawName: parsed.rawName, mesa: parsed.mesa, dataUrl });
  }
  qrs.sort((a, b) => a.mesa - b.mesa || a.name.localeCompare(b.name, "es"));
  paintCounts();
  paintPreview();
}

function paintCounts() {
  const c = $("#counts");
  if (!qrs.length && !bad.length) { c.textContent = ""; return; }

  const porMesa = {};
  qrs.forEach(q => { porMesa[q.mesa] = (porMesa[q.mesa] || 0) + 1; });
  const mesas = Object.keys(porMesa).map(n => +n).sort((a, b) => a - b);
  const sinMapeoSet = new Set(qrs.filter(q => !mesaMap[q.mesa]).map(q => q.mesa));

  const byName = {};
  qrs.forEach(q => { (byName[q.name] = byName[q.name] || []).push(q); });
  const dupes = Object.entries(byName).filter(([, arr]) => arr.length > 1);

  c.className = "counts" + (qrs.length && !bad.length && !sinMapeoSet.size && !dupes.length ? " ok" : "");
  c.innerHTML = `✓ ${qrs.length} QR cargados · ${mesas.length} mesas distintas` +
    `<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700;color:var(--magenta)">Ver conteo por mesa</summary>` +
    `<table style="margin-top:6px;font-size:12.5px;border-collapse:collapse">` +
    mesas.map(n => {
      const nm = mesaMap[n] ? mesaMap[n].nombre : `(sin nombre)`;
      return `<tr><td style="padding:2px 12px 2px 0;color:var(--muted)">Mesa ${n}</td>
        <td style="padding:2px 12px 2px 0">${nm}</td>
        <td style="padding:2px 0;font-weight:800">${porMesa[n]}</td></tr>`;
    }).join("") + `</table></details>`;

  const e = $("#errors"); e.innerHTML = "";
  if (bad.length) {
    e.innerHTML += `<div>⚠ ${bad.length} archivos con nombre inválido:</div>
      <ul>${bad.slice(0, 6).map(b => `<li><code>${b.filename}</code></li>`).join("")}
      ${bad.length > 6 ? `<li>… y ${bad.length - 6} más</li>` : ""}</ul>`;
  }
  if (sinMapeoSet.size) {
    e.innerHTML += `<div>⚠ Mesas sin nombre en la tabla: ${[...sinMapeoSet].sort((a, b) => a - b).join(", ")}</div>`;
  }
  if (dupes.length) {
    e.innerHTML += `<div>⚠ Nombres duplicados en distintos QR:</div><ul>` +
      dupes.slice(0, 6).map(([nm, arr]) =>
        `<li><b>${nm}</b> en mesa(s) ${[...new Set(arr.map(x => x.mesa))].join(", ")} (${arr.length} QR)</li>`
      ).join("") + `</ul>`;
  }
}

/* ---------------- preview ---------------- */
function cardFront(q) {
  const m = mesaMap[q.mesa] || { nombre: `Mesa ${q.mesa}`, rareza: "comun" };
  const c = el("div", { class: "card front" });
  c.innerHTML = `
    <img class="lo" src="../assets/logo.png" alt="Martina Fifteen">
    <div class="nombre">${escapeHTML(q.name)}</div>
    <div class="mesa">Mesa ${escapeHTML(m.nombre)}</div>
    <div class="qrwrap"><img src="${q.dataUrl}" alt="QR"></div>`;
  return c;
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function paintPreview() {
  const p = $("#preview");
  p.innerHTML = "";
  if (!qrs.length) {
    p.innerHTML = `<div class="empty">Cargá los QR para ver la vista previa de la primera tarjeta.</div>`;
    return;
  }
  p.appendChild(cardFront(qrs[0]));
}

/* ---------------- PNG filename ---------------- */
function pngName(q) {
  const m = mesaMap[q.mesa];
  const pelicula = m ? m.nombre.replace(/\s+/g, '_') : `Mesa_${q.mesa}`;
  return `${pelicula}-${q.rawName}.png`;
}

/* ---------------- render card to PNG blob at 1086×1448 ---------------- */
async function renderCard(q) {
  const card = cardFront(q);
  card.style.width = PNG_W + "px";
  card.style.height = PNG_H + "px";
  const sandbox = el("div", {
    style: `position:fixed;left:-9999px;top:0;width:${PNG_W}px;height:${PNG_H}px`
  });
  document.body.appendChild(sandbox);
  sandbox.appendChild(card);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const canvas = await html2canvas(card, {
    width: PNG_W,
    height: PNG_H,
    scale: 1,
    useCORS: true,
    backgroundColor: "#ffffff"
  });
  sandbox.remove();
  return new Promise(res => canvas.toBlob(res, "image/png"));
}

/* ---------------- build ZIP ---------------- */
async function buildZip() {
  const zip = new JSZip();
  const prog = $("#progress");
  for (let i = 0; i < qrs.length; i++) {
    prog.textContent = `Generando ${i + 1} de ${qrs.length}…`;
    const blob = await renderCard(qrs[i]);
    zip.file(pngName(qrs[i]), blob);
  }
  prog.textContent = "Comprimiendo ZIP…";
  const out = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(out);
  a.download = "tarjetas_marti_xv.zip";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  prog.textContent = `✓ ${qrs.length} tarjetas generadas`;
}

/* ---------------- wiring ---------------- */
function init() {
  $("#map").value = DEFAULT_MAP;
  mesaMap = parseMap(DEFAULT_MAP);

  const drop = $("#drop"), input = $("#files");
  drop.addEventListener("click", () => input.click());
  input.addEventListener("change", e => ingest(e.target.files));
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => {
    e.preventDefault(); drop.classList.add("over");
  }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => {
    e.preventDefault(); drop.classList.remove("over");
  }));
  drop.addEventListener("drop", e => {
    if (e.dataTransfer.files.length) ingest(e.dataTransfer.files);
  });

  $("#map").addEventListener("input", e => {
    mesaMap = parseMap(e.target.value);
    paintCounts(); paintPreview();
  });

  $("#go").addEventListener("click", async () => {
    if (!qrs.length) return alert("Cargá los QR primero");
    const btn = $("#go");
    btn.disabled = true;
    try { await buildZip(); } catch (e) { alert("Error: " + e.message); }
    btn.disabled = false;
  });
  paintPreview();
}
init();
