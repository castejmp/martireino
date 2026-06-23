/* =====================================================
   Generador de tarjetas Martina XV
   Filename esperado: qr-NOMBRE_APELLIDO-MESA_N(.ext)
   Salida: PDF imprimible (frente + dorso, double-side
   con flip por borde largo) + ZIP opcional de PNGs.
   Todo se procesa en el navegador: nada sube a un server.
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

/* ---------------- mapa por defecto: 18 mesas (la 18 = mesa principal) ----------------
   El usuario lo edita en vivo en el textarea, así no hace falta deploy
   para cambiar nombres o números. Las rarezas son las que ya usa la app
   del juego (común/especial/legendaria/dorada). */
const DEFAULT_MAP = `1: Rey León | comun
2: La Sirenita | comun
3: Moana | comun
4: Cars | comun
5: Ratatouille | comun
6: La Princesa y el Sapo | comun
7: Pocahontas | comun
8: Maléfica | epica
9: Coco | epica
10: Winnie the Pooh | comun
11: Aladdín | comun
12: Lilo y Stitch | rara
13: Cenicienta | rara
14: Blanca Nieves | rara
15: Dumbo | rara
16: 101 Dálmatas | rara
17: Peter Pan | rara
18: Enredados | dorada`;

const FRAMES = {
  comun:  "../assets/frames/comun.jpg",
  rara:   "../assets/frames/especial.jpg",
  epica:  "../assets/frames/legendaria.jpg",
  dorada: "../assets/frames/oro.jpg",
};

/* ---------------- state ---------------- */
let qrs = [];     // [{ filename, name, mesa, dataUrl }]
let bad = [];     // [{ filename, reason }]
let mesaMap = {}; // { 8: { nombre:"Maléfica", rareza:"epica" } }

/* ---------------- parser de filename ---------------- */
function parseFilename(name) {
  // qr-NOMBRE_APELLIDO[_OTRO]-MESA_N(.ext)
  const m = name.replace(/\.[^.]+$/, "").match(/^qr-(.+?)-MESA[_-]?(\d+)$/i);
  if (!m) return null;
  const personName = m[1]
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();
  return { name: personName, mesa: parseInt(m[2], 10) };
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
    qrs.push({ filename: f.name, name: parsed.name, mesa: parsed.mesa, dataUrl });
  }
  qrs.sort((a, b) => a.mesa - b.mesa || a.name.localeCompare(b.name, "es"));
  paintCounts();
  paintPreview();
}

function paintCounts() {
  const c = $("#counts");
  if (!qrs.length && !bad.length) { c.textContent = ""; return; }
  const mesas = new Set(qrs.map(q => q.mesa));
  const sinMapeo = qrs.filter(q => !mesaMap[q.mesa]).map(q => q.mesa);
  const sinMapeoSet = new Set(sinMapeo);
  c.className = "counts" + (qrs.length && !bad.length && !sinMapeoSet.size ? " ok" : "");
  c.innerHTML = `✓ ${qrs.length} QR cargados · ${mesas.size} mesas distintas`;

  const e = $("#errors"); e.innerHTML = "";
  if (bad.length) {
    e.innerHTML += `<div>⚠ ${bad.length} archivos descartados (nombre inválido):</div>
      <ul>${bad.slice(0, 6).map(b => `<li><code>${b.filename}</code></li>`).join("")}
      ${bad.length > 6 ? `<li>… y ${bad.length - 6} más</li>` : ""}</ul>`;
  }
  if (sinMapeoSet.size) {
    e.innerHTML += `<div>⚠ Mesas sin nombre en la tabla: ${[...sinMapeoSet].sort((a, b) => a - b).join(", ")}</div>`;
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
    <div class="qrwrap"><img src="${q.dataUrl}" alt="QR ${escapeHTML(q.name)}"></div>
    <div class="inst"><b>Escaneá el QR</b> para entrar a Figus del Reino.<br>
    Tu pulsera es tu cuenta · no hace falta instalar nada.</div>`;
  return c;
}
function cardBack(q) {
  const m = mesaMap[q.mesa] || { nombre: `Mesa ${q.mesa}`, rareza: "comun" };
  const c = el("div", { class: `card back r-${m.rareza}` });
  c.innerHTML = `
    <img class="frame" src="${FRAMES[m.rareza]}" alt="" crossorigin>
    <div class="overlay">
      <div class="kicker">Tu mesa</div>
      <div class="pelicula">${escapeHTML(m.nombre)}</div>
    </div>
    <div class="reino">✦ Reino de Marti ✦</div>`;
  return c;
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function paintPreview() {
  const p = $("#preview");
  p.innerHTML = "";
  const per = +$("#per").value;
  p.parentElement.className = "step size-" + per;
  if (!qrs.length) {
    p.innerHTML = `<div class="empty">Cargá los QR para ver la vista previa de la primera tarjeta.</div>`;
    return;
  }
  const q = qrs[0];
  p.appendChild(cardFront(q));
  p.appendChild(cardBack(q));
}

/* ---------------- preparar sheets para imprenta ---------------- */
function buildSheets() {
  const per = +$("#per").value;
  const cols = 2;
  const rows = per === 4 ? 2 : per === 6 ? 3 : 4;
  const cls = `sheet cols-${cols} rows-${rows} size-${per}`;
  const sheetsRoot = $("#sheets");
  sheetsRoot.innerHTML = "";

  for (let i = 0; i < qrs.length; i += per) {
    const batch = qrs.slice(i, i + per);
    // FRENTE
    const front = el("div", { class: cls });
    batch.forEach(q => {
      const slot = el("div", { class: "slot" });
      slot.appendChild(cardFront(q));
      front.appendChild(slot);
    });
    sheetsRoot.appendChild(front);
    // DORSO con flip por borde largo: invertir columnas dentro de cada fila
    const back = el("div", { class: cls });
    for (let r = 0; r < rows; r++) {
      const row = batch.slice(r * cols, r * cols + cols);
      // espejar el orden de la fila
      for (let k = row.length - 1; k >= 0; k--) {
        const slot = el("div", { class: "slot" });
        slot.appendChild(cardBack(row[k]));
        back.appendChild(slot);
      }
      // si la última fila tiene huecos (último lote incompleto), agregar slots vacíos
      for (let k = row.length; k < cols; k++) {
        back.appendChild(el("div", { class: "slot" }));
      }
    }
    sheetsRoot.appendChild(back);
  }
}

/* ---------------- ZIP de PNGs individuales ----------------
   Render front + back de cada tarjeta a canvas y empaqueta. */
async function buildZip() {
  if (!window.JSZip) return alert("JSZip no cargó");
  const zip = new JSZip();
  const sandbox = el("div", { style: "position:fixed;left:-3000px;top:0" });
  document.body.appendChild(sandbox);
  for (let i = 0; i < qrs.length; i++) {
    const q = qrs[i];
    for (const lado of ["front", "back"]) {
      sandbox.innerHTML = "";
      const card = lado === "front" ? cardFront(q) : cardBack(q);
      sandbox.appendChild(card);
      await new Promise(r => requestAnimationFrame(r));
      const blob = await renderToBlob(card);
      const slug = q.name.replace(/\s+/g, "_") + "_mesa" + q.mesa;
      zip.file(`${String(i + 1).padStart(3, "0")}_${slug}_${lado}.png`, blob);
    }
  }
  sandbox.remove();
  const out = await zip.generateAsync({ type: "blob" });
  downloadBlob(out, "tarjetas_marti_xv.zip");
}

async function renderToBlob(node) {
  // Renderiza el nodo a canvas via SVG foreignObject (sin librerías externas).
  const rect = node.getBoundingClientRect();
  const w = Math.ceil(rect.width), h = Math.ceil(rect.height);
  const clone = node.cloneNode(true);
  await inlineImages(clone);
  const xhtml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px">${xhtml}</div>
    </foreignObject></svg>`;
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const cv = document.createElement("canvas");
  cv.width = w * 2; cv.height = h * 2;
  const ctx = cv.getContext("2d");
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0, w, h);
  return await new Promise(res => cv.toBlob(res, "image/png"));
}
async function inlineImages(root) {
  const imgs = root.querySelectorAll("img");
  await Promise.all([...imgs].map(async img => {
    if (img.src.startsWith("data:")) return;
    try {
      const r = await fetch(img.src);
      const b = await r.blob();
      const d = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
      img.src = d;
    } catch (e) { /* deja el src */ }
  }));
}
function downloadBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
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
  $("#per").addEventListener("change", paintPreview);

  $("#go").addEventListener("click", () => {
    if (!qrs.length) return alert("Cargá los QR primero");
    buildSheets();
    // Esperar un frame para que el browser renderice antes del print
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  });
  $("#goSingles").addEventListener("click", async () => {
    if (!qrs.length) return alert("Cargá los QR primero");
    const btn = $("#goSingles");
    btn.disabled = true; const txt = btn.textContent;
    btn.textContent = "Generando ZIP…";
    try { await buildZip(); } catch (e) { alert("Error: " + e.message); }
    btn.disabled = false; btn.textContent = txt;
  });
  paintPreview();
}
init();
