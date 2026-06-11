/* =====================================================
   Figus del Reino · app
   Pantallas: gate (código de pulsera) → onboarding
   (nombre + avatar/selfie) → app (álbum/cambiar/reino).
   El estado se persiste en localStorage por código de
   pulsera: si el celu se bloquea o recarga, se retoma.
   ===================================================== */

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const view = $("#view"), sheet = $("#sheet"), hdr = $("#hdr"), nav = $("#nav");
const rnd = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const fig = id => FIGS.find(f => f.id === id);

function toast(m) {
  const t = $("#toast"); t.textContent = m; t.classList.add("on");
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2300);
}
function vibrate(p) { if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } }

const logoHTML = `
  <div class="logo nologo">
    <img src="assets/logo.png" alt="Marti XV" onload="this.parentElement.classList.remove('nologo')">
    <div class="mono">M·XV</div>
  </div>`;

/* ---------------- acceso por pulsera ---------------- */
/* Cada pulsera tiene un QR con su código: martixv.com/5s44f2
   Si la URL trae código → directo al onboarding (sin tipear nada).
   Si no → se pide el código impreso en la tarjeta de la pulsera. */
const CODE_RE = /^[a-z0-9]{4,8}$/i;
const RESERVED = new Set(["app", "css", "js", "assets", "docs", "demo"]);
const LS_CODE = "martixv:code";
const saveKey = c => "martixv:save:" + c;

function validCode(c) {
  return !!c && CODE_RE.test(c) && !RESERVED.has(c.toLowerCase()) && !/\./.test(c);
}
function codeFromURL() {
  const u = new URL(location.href);
  const q = u.searchParams.get("c"); if (validCode(q)) return q.toLowerCase();
  const h = u.hash.replace(/^#\/?/, ""); if (validCode(h)) return h.toLowerCase();
  const seg = u.pathname.split("/").filter(Boolean).pop();
  if (validCode(seg)) return seg.toLowerCase();
  return null;
}

/* ---------------- estado ---------------- */
let S, reqTimer = null;

function freshState() {
  return {
    screen: "gate", tab: "album",
    code: null, name: "", avatar: null, selfie: null,
    counts: {}, golds: [false, false, false],
    sources: { start: true, codigo: true, trivia: true, carta: true },
    myReq: null,
    salon: [], feed: [], unread: 0,
    relojWon: false, done: false,
    myCode: String(Math.floor(1000 + Math.random() * 9000)),
  };
}
function save() {
  if (!S.code) return;
  const { screen, tab, ...data } = S;
  try { localStorage.setItem(saveKey(S.code), JSON.stringify(data)); } catch (e) { }
}
function load(code) {
  try {
    const raw = localStorage.getItem(saveKey(code));
    if (!raw) return null;
    return Object.assign(freshState(), JSON.parse(raw), { code });
  } catch (e) { return null; }
}

const owned = id => (S.counts[id] || 0) > 0;
const uniques = () => FIGS.filter(f => owned(f.id)).length;
const missing = () => FIGS.filter(f => !owned(f.id));
const dupes = () => FIGS.filter(f => (S.counts[f.id] || 0) > 1);

/* pool ponderado — épicas casi nunca: el muro que obliga a cambiar */
const POOL = (() => {
  const p = [];
  FIGS.forEach(f => { for (let i = 0; i < RARITY_WEIGHT[f.r]; i++) p.push(f.id); });
  return p;
})();
const drawOne = () => POOL[Math.floor(Math.random() * POOL.length)];

/* pity: un sobre nunca puede ser 100% repetidas mientras el álbum
   esté arrancando — reemplaza repetidas por faltantes no-épicas */
function applyPity(draws, minNew) {
  const isNewInPack = (id, i) => !owned(id) && draws.indexOf(id) === i;
  let newCount = draws.filter(isNewInPack).length;
  const cands = FIGS.filter(f => !owned(f.id) && f.r !== "epica" && !draws.includes(f.id)).map(f => f.id);
  while (newCount < minNew && cands.length) {
    const i = draws.findIndex((id, k) => !isNewInPack(id, k));
    if (i < 0) break;
    draws[i] = cands.splice(Math.floor(Math.random() * cands.length), 1)[0];
    newCount++;
  }
  return draws;
}

/* ---------------- estrellas de fondo ---------------- */
(function () {
  let h = "";
  for (let i = 0; i < 38; i++) {
    const x = Math.random() * 100, y = Math.random() * 68, z = Math.random() * 2 + 1, d = Math.random() * 4;
    h += `<i style="left:${x}%;top:${y}%;width:${z}px;height:${z}px;animation-delay:${d}s"></i>`;
  }
  $("#stars").innerHTML = h;
})();

/* ---------------- feed ---------------- */
function feedPush(html, ic, mine) {
  S.feed.unshift({ html, ic, mine, t: Date.now() });
  if (S.feed.length > 30) S.feed.pop();
  if (S.tab !== "feed" && S.screen === "app") { S.unread++; paintDot(); }
  if (S.tab === "feed" && S.screen === "app") renderTab();
  save();
}
function paintDot() {
  const d = $("#feedDot");
  d.style.display = S.unread ? "flex" : "none"; d.textContent = Math.min(S.unread, 9);
}
function ambient() {
  const r = Math.random(), A = rnd(GUESTS); let B = rnd(GUESTS); while (B === A) B = rnd(GUESTS);
  const f = rnd(FIGS);
  if (r < .3) return feedPush(`<b>${A}</b> y <b>${B}</b> cambiaron figus`, "🔄");
  if (r < .55) return feedPush(`<b>${A}</b> abrió un sobre y encontró a <span class="g">${f.nm} ${f.g}</span>`, "🎁");
  if (r < .72) return feedPush(`<b>${A}</b> le pasó <span class="g">${f.nm}</span> a <b>${B}</b> — ¡genia!`, "🤝");
  if (r < .86) return feedPush(`<b>${A}</b> ya va <span class="g">${10 + Math.floor(Math.random() * 4)}/15</span>`, "🏆");
  return feedPush(`<b>${A}</b> abrió otro sobre y… repetida. Bancá ${A} 🥲`, "🫂");
}
let ambIv = null;
function startAmbient() {
  if (!ambIv) ambIv = setInterval(() => {
    if (S.screen === "app" && !document.hidden) ambient();
  }, 7000);
}

function newSalonReq() { return { who: rnd(GUESTS), figId: rnd(FIGS).id }; }
function seedSalon() { S.salon = [newSalonReq(), newSalonReq(), newSalonReq()]; }

/* ---------------- router ---------------- */
function render() {
  if (S.screen !== "app") {
    hdr.classList.remove("on"); nav.classList.remove("on");
    view.className = "pad intro";
    if (S.screen === "gate") renderGate(); else renderOnboarding();
    return;
  }
  view.className = "pad";
  hdr.classList.add("on"); nav.classList.add("on");
  renderHeader(); renderTab(); paintDot();
}

const avatarHTML = () => S.selfie ? `<img src="${S.selfie}" alt="">` : (S.avatar ? S.avatar.g : "👤");

function renderHeader() {
  const u = uniques(), C = 131.95, off = C * (1 - u / 15);
  hdr.innerHTML = `
    <div class="ringwrap">
      <svg width="52" height="52"><circle cx="26" cy="26" r="21" stroke="rgba(255,255,255,.1)" stroke-width="3.5" fill="none"/>
      <circle cx="26" cy="26" r="21" stroke="url(#hg)" stroke-width="3.5" fill="none" stroke-linecap="round"
        stroke-dasharray="${C}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .7s cubic-bezier(.2,.8,.2,1)"/>
      <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f1a8c6"/><stop offset="1" stop-color="#f6dd99"/></linearGradient></defs></svg>
      <div class="avx">${avatarHTML()}</div>
    </div>
    <div class="hid"><div class="n">${esc(S.name)}</div><div class="s">Reino de Marti · #${esc((S.code || "").toUpperCase())}</div></div>
    <div class="hct"><div class="big">${u}<small>/15</small></div><div class="lbl">figus</div></div>`;
}

nav.querySelectorAll("button").forEach(b => {
  b.addEventListener("click", () => {
    S.tab = b.dataset.tab;
    if (S.tab === "feed") { S.unread = 0; paintDot(); }
    nav.querySelectorAll("button").forEach(x => x.classList.toggle("act", x === b));
    renderTab();
  });
});
function syncNav() { nav.querySelectorAll("button").forEach(x => x.classList.toggle("act", x.dataset.tab === S.tab)); }

function renderTab() {
  syncNav();
  if (S.tab === "album") return renderAlbum();
  if (S.tab === "trade") return renderTrade();
  return renderFeed();
}

/* ---------------- gate: código de pulsera ---------------- */
function renderGate() {
  view.innerHTML = `
    <div class="center">
      ${logoHTML}
      <div class="kicker mt12">Los XV de Marti</div>
      <h1 class="title">Figus<br>del Reino</h1>
      <p class="lead mt16">Escaneá el <b style="color:var(--ink)">QR de tu pulsera</b> y entrás directo.
      ¿Lo tenés a mano en la tarjeta? Escribí tu código:</p>
    </div>
    <div class="mt20">
      <input class="field code" id="codeIn" maxlength="8" autocomplete="off"
        autocapitalize="characters" placeholder="5S44F2">
      <button class="btn mt12" id="goCode">Entrar al Reino</button>
      <button class="btn ghost mt8" id="demoBtn">No tengo pulsera · probar demo</button>
    </div>
    <p class="footnote">Tu pulsera es tu cuenta · sin instalar nada</p>`;
  const input = $("#codeIn");
  const submit = () => {
    const c = input.value.trim().toLowerCase();
    if (!validCode(c)) {
      input.classList.add("bad"); vibrate(60);
      toast("Ese código no parece de pulsera 🤔");
      setTimeout(() => input.classList.remove("bad"), 450);
      return;
    }
    enterWithCode(c);
  };
  input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  $("#goCode").addEventListener("click", submit);
  $("#demoBtn").addEventListener("click", () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let c = ""; for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
    enterWithCode(c);
    toast(`Tu pulsera demo: #${c.toUpperCase()}`);
  });
}
function enterWithCode(code) {
  localStorage.setItem(LS_CODE, code);
  const saved = load(code);
  if (saved && saved.name && (saved.avatar || saved.selfie)) {
    S = saved; S.screen = "app";
    if (!S.salon.length) seedSalon();
    startAmbient(); render();
    toast(`¡Volviste, ${S.name}! ✨`);
    return;
  }
  S = freshState(); S.code = code; S.screen = "onboarding"; render();
}

/* ---------------- onboarding ---------------- */
function renderOnboarding() {
  view.innerHTML = `
    <div class="center">
      ${logoHTML}
      <div class="kicker mt12">Pulsera #${esc(S.code.toUpperCase())}</div>
      <h1 class="title">¿Quién<br>sos?</h1>
      <p class="lead mt12">Juntá las <b style="color:var(--ink)">15 figuritas</b> de Marti convertida en princesa.
      Con tus sobres no alcanza: el álbum se cierra <b style="color:var(--rose)">cambiando con la gente</b>.</p>
    </div>
    <div class="mt20">
      <label class="hint">Tu nombre</label>
      <input class="field mt8" id="nameIn" maxlength="16" placeholder="¿Cómo te llamás?" value="${esc(S.name)}">
    </div>
    <div class="mt16">
      <label class="hint">Tu cara en el Reino</label>
      <div class="selfiebox mt8 ${S.selfie ? "sel" : ""}" id="selfieBox">
        <div class="ph">${S.selfie ? `<img src="${S.selfie}" alt="">` : "🤳"}</div>
        <div class="tx"><div class="t">${S.selfie ? "¡Esa cara! Tocá para cambiarla" : "Tomate una selfie"}</div>
        <div class="d">Aparece en tu carta dorada si completás el Reino</div></div>
      </div>
      <input type="file" id="selfieIn" accept="image/*" capture="user" hidden>
      <p class="hint center mt12">— o elegí un personaje —</p>
      <div class="avgrid" id="avs">
        ${AVATARS.map((a, i) => `<div class="av ${!S.selfie && S.avatar && S.avatar.n === a.n ? "sel" : ""}" data-i="${i}">${a.g}<small>${a.n}</small></div>`).join("")}
      </div>
    </div>
    <button class="btn mt20" id="go">Entrar al Reino</button>
    <p class="footnote">Tu pulsera es tu cuenta · sin instalar nada</p>`;

  $("#nameIn").addEventListener("input", e => S.name = e.target.value.trim());
  $("#selfieBox").addEventListener("click", () => $("#selfieIn").click());
  $("#selfieIn").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (f) handleSelfie(f);
  });
  view.querySelectorAll(".av").forEach(el => el.addEventListener("click", () => {
    S.avatar = AVATARS[+el.dataset.i]; S.selfie = null; renderOnboarding();
  }));
  $("#go").addEventListener("click", () => {
    if (!S.name) return toast("Poné tu nombre 🙂");
    if (!S.avatar && !S.selfie) return toast("Elegí un personaje o sacate una selfie ✨");
    S.screen = "app"; S.tab = "album";
    seedSalon(); startAmbient(); save(); render();
    feedPush(`<b>Vos</b> entraste al Reino ✦ ¡bienvenida!`, "🏰", true);
    if (S.sources.start) setTimeout(() => openPack("start"), 420);
  });
}

async function handleSelfie(file) {
  const SIZE = 128;
  const c = document.createElement("canvas"); c.width = c.height = SIZE;
  const ctx = c.getContext("2d");
  const finish = () => { S.avatar = null; save(); renderOnboarding(); };
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const m = Math.min(bmp.width, bmp.height);
    ctx.drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, SIZE, SIZE);
    S.selfie = c.toDataURL("image/jpeg", .82); finish();
  } catch (err) {
    const img = new Image();
    img.onload = () => {
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, SIZE, SIZE);
      S.selfie = c.toDataURL("image/jpeg", .82);
      URL.revokeObjectURL(img.src); finish();
    };
    img.src = URL.createObjectURL(file);
  }
}

/* ---------------- álbum ---------------- */
function figCard(f) {
  const q = S.counts[f.id] || 0;
  const no = String(f.id).padStart(2, "0");
  if (!q) return `<div class="fig empty"><span class="no">${no}</span>
    <span class="q">?</span><div class="fm" style="margin-top:6px">${esc(f.fm)}</div></div>`;
  return `<div class="fig have r-${f.r}"><span class="no">${no}</span>
    <span class="st" style="color:${RARITY_STAR[f.r]}">★</span>
    ${f.img ? `<img class="art" src="${f.img}" alt="" onerror="this.remove()">` : ""}
    <span class="glyph">${f.g}</span><div class="fn">${esc(f.nm)}</div><div class="fm">${esc(f.fm)}</div>
    ${q > 1 ? `<span class="dq">x${q}</span>` : ""}</div>`;
}
function renderAlbum() {
  const u = uniques(), left = Object.keys(S.sources).filter(k => S.sources[k]);
  let act = "";
  if (S.done) {
    act = `<div class="wall center mt8"><div class="pill">👑 Reino completo</div>
      <p class="hint mt12">Ya tenés tu carta dorada esperándote en el Mercadito.</p></div>`;
  } else if (left.length) {
    act = `
      <div class="sh"><span>Conseguir sobres</span><div class="ln"></div></div>
      <p class="hint" style="margin-bottom:11px">Los sobres son contados — caen solo en momentos de la noche.
      <em>En la fiesta los dispara la pantalla grande; acá simulalos tocando.</em></p>
      <div class="srcs">
        ${Object.keys(SRC).map(k => `<div class="src ${S.sources[k] ? "" : "spent"}" data-src="${k}">
          <div class="ic">${SRC[k].ic}</div><div class="t">${SRC[k].t}</div><div class="d">${SRC[k].d}</div></div>`).join("")}
      </div>`;
  } else {
    act = `
      <div class="sh"><span>Te faltan ${15 - u}</span><div class="ln"></div></div>
      <div class="wall">
        <div class="pill">🔒 No salen más en sobres</div>
        <p class="hint mt12">Abriste todos tus sobres. Las que faltan son las más raras del Reino —
        la única forma de cerrarlo es <b style="color:var(--rose)">cambiando con alguien</b>.</p>
        <button class="btn rose mt16" id="goTrade">Ir a cambiar</button>
      </div>`;
  }
  view.innerHTML = `
    <div class="grid">${FIGS.map(figCard).join("")}</div>
    ${act}
    <div class="sh"><span>Doradas · pura suerte</span><div class="ln"></div></div>
    <div class="goldrow">
      ${GOLD.map((g, i) => `<div class="gcard ${S.golds[i] ? "won" : "locked"}">
        <span class="lk">${S.golds[i] ? "✨" : "🔒"}</span><span class="glyph">${g.g}</span>
        <div class="fn">${g.nm}</div></div>`).join("")}
    </div>
    <p class="footnote">No hacen falta para ganar · la primera dorada de la noche se lleva el Reloj Disney 🕛</p>`;
  view.querySelectorAll(".src").forEach(el => el.addEventListener("click", () => routeSource(el.dataset.src)));
  const g = $("#goTrade"); if (g) g.addEventListener("click", () => { S.tab = "trade"; renderTab(); });
}

/* ---------------- fuentes de sobres ---------------- */
function routeSource(k) {
  if (k === "start") return openPack("start");
  if (k === "codigo") return codigoFlow();
  if (k === "trivia") return triviaFlow();
  if (k === "carta") return cartaFlow();
}
function showSheet(html) { sheet.innerHTML = html; sheet.classList.add("on"); }
function hideSheet() {
  sheet.classList.remove("on");
  setTimeout(() => { if (!sheet.classList.contains("on")) sheet.innerHTML = ""; }, 260);
}

/* ---------------- sobre + reveal de a una ---------------- */
let RV = null;

function openPack(srcKey) {
  if (!S.sources[srcKey]) return;
  const meta = SRC[srcKey];
  showSheet(`
    <div class="kicker">${srcKey === "start" ? "Tu sobre de bienvenida" : "¡Un sobre más!"}</div>
    <div class="env" id="env"><div class="flapline"></div><div class="seal">✦</div></div>
    <p class="lead" style="max-width:250px">Tocá el sello para abrirlo</p>`);
  const env = $("#env");
  env.addEventListener("click", function once() {
    env.removeEventListener("click", once);
    env.classList.add("opening");
    vibrate([14, 60, 24]);

    const minNew = srcKey === "start" ? 3 : (uniques() < 10 ? 1 : 0);
    const draws = applyPity(Array.from({ length: meta.n }, () => drawOne()), minNew);
    let dorIdx = -1;
    if (GOLD.some((_, i) => !S.golds[i]) && Math.random() < meta.dor) {
      const locked = GOLD.map((_, i) => i).filter(i => !S.golds[i]);
      dorIdx = rnd(locked); S.golds[dorIdx] = true;
    }
    const queue = draws.map(id => {
      const before = S.counts[id] || 0; S.counts[id] = before + 1;
      return { kind: "fig", f: fig(id), nu: before === 0 };
    });
    if (dorIdx >= 0) queue.push({ kind: "gold", idx: dorIdx });
    S.sources[srcKey] = false; save();
    const nNew = queue.filter(c => c.nu).length;
    feedPush(`<b>Vos</b> abriste un sobre — <span class="g">${nNew} nuevas</span>, ${draws.length - nNew} repetidas`, "🎁", true);

    setTimeout(() => { RV = { queue, dorIdx, i: 0 }; revealStep(); }, 560);
  });
}

function bigCardHTML(c) {
  if (c.kind === "gold") {
    const g = GOLD[c.idx];
    return `
      <div class="bigcard r-dorada" id="bc">
        <div class="tagwrap"><span class="tag dor">¡Dorada!</span></div>
        <div class="in">
          <div class="bcface fr"><span class="mono">M</span></div>
          <div class="bcface bk"><div class="bc-in">
            <div class="bc-star">✨</div>
            <div class="bc-art"><span class="glyph">${g.g}</span></div>
            <div class="bc-plate"><div class="nm">${g.nm}</div><div class="fm">Dorada del Reino</div></div>
          </div></div>
        </div>
      </div>`;
  }
  const f = c.f;
  return `
    <div class="bigcard r-${f.r}" id="bc">
      <div class="tagwrap"><span class="tag ${c.nu ? "new" : "rep"}">${c.nu ? "¡Nueva!" : "Repetida"}</span></div>
      <div class="in">
        <div class="bcface fr"><span class="mono">M</span></div>
        <div class="bcface bk"><div class="bc-in">
          <div class="bc-no">${f.id}</div>
          <div class="bc-star" style="color:${RARITY_STAR[f.r]}">★</div>
          <div class="bc-art">${f.img ? `<img src="${f.img}" alt="" onerror="this.remove()">` : ""}<span class="glyph">${f.g}</span></div>
          <div class="bc-plate"><div class="nm">${esc(f.nm)}</div><div class="fm">${esc(f.fm)} · ${RARITY_LABEL[f.r]}</div></div>
        </div></div>
      </div>
    </div>`;
}

function revealStep() {
  const { queue, i } = RV, c = queue[i], total = queue.length;
  const dots = queue.map((_, k) => `<i class="${k < i ? "done" : k === i ? "cur" : ""}"></i>`).join("");
  showSheet(`
    <div class="stage">
      <div class="count">Figu ${i + 1} de ${total}</div>
      <div class="dots">${dots}</div>
      ${bigCardHTML(c)}
      <div class="next" id="next"><span class="nexthint">Tocá la carta para darla vuelta</span></div>
    </div>`);
  const bc = $("#bc");
  let flipped = false;
  bc.addEventListener("click", () => {
    if (flipped) return advance();
    flipped = true;
    bc.classList.add("go");
    const isGold = c.kind === "gold";
    vibrate(isGold || c.nu ? [18, 50, 18] : 12);
    if (isGold) {
      sheet.insertAdjacentHTML("afterbegin", `<div class="rays"></div>`);
      confettiBurst(80);
    } else if (c.nu) {
      confettiBurst(c.f.r === "epica" ? 60 : 26);
    }
    setTimeout(() => {
      const nx = $("#next"); if (!nx) return;
      nx.innerHTML = `<button class="btn sm" id="nx">${i < total - 1 ? "Siguiente ✦" : "Ver resumen"}</button>`;
      $("#nx").addEventListener("click", e => { e.stopPropagation(); advance(); });
    }, 750);
  });
  function advance() {
    if (RV.i !== i) return;
    RV.i++;
    RV.i < total ? revealStep() : revealSummary();
  }
}

function revealSummary() {
  const { queue, dorIdx } = RV;
  const small = queue.map((c, i) => {
    if (c.kind === "gold") return `
      <div class="flip dorada go" style="animation-delay:${i * .06}s"><div class="inner">
        <div class="face fr"><span class="mono">✦</span></div>
        <div class="face bk"><span class="g">${GOLD[c.idx].g}</span><div class="nm">${GOLD[c.idx].nm}</div>
          <div class="tag">¡Dorada!</div></div></div></div>`;
    return `
      <div class="flip ${c.nu ? "new" : "rep"} ${c.f.r} go" style="animation-delay:${i * .06}s"><div class="inner">
        <div class="face fr"><span class="mono">✦</span></div>
        <div class="face bk"><span class="g">${c.f.g}</span><div class="nm">${esc(c.f.nm)}</div>
          <div class="tag">${c.nu ? "¡Nueva!" : "Repetida"}</div></div></div></div>`;
  }).join("");
  showSheet(`
    <div class="kicker">Tu sobre</div>
    <div class="reveal mt16">${small}</div>
    <button class="btn mt20" id="cont" style="max-width:240px">Ver mi álbum</button>`);
  $("#cont").addEventListener("click", () => {
    hideSheet(); S.tab = "album"; render();
    if (dorIdx >= 0) setTimeout(() => doradaOverlay(dorIdx), 300);
    else afterGain();
    RV = null;
  });
}

function afterGain() {
  if (uniques() === 15 && !S.done) return setTimeout(completion, 420);
  const left = Object.values(S.sources).some(v => v);
  if (!left && uniques() < 15) toast("Te quedan huecos… ¡toca cambiar! 🔄");
}

/* ---- código sorpresa ---- */
function codigoFlow() {
  const w = rnd(CODEWORDS);
  showSheet(`
    <div class="mcard">
      <div class="kicker center">📣 Código sorpresa</div>
      <p class="hint center mt8">Marti dice por micrófono:</p>
      <div class="codebig" style="font-size:46px;letter-spacing:.14em;margin:8px 0 4px">${w}</div>
      <p class="hint center" style="margin-bottom:14px">Tipealo antes de que se cierre</p>
      <input class="field" id="cw" placeholder="Escribí la palabra" autocomplete="off" style="text-align:center;text-transform:uppercase">
      <button class="btn mt12" id="okc">Enviar</button>
      <button class="btn ghost mt8" id="noc">Cerrar</button>
    </div>`);
  $("#noc").addEventListener("click", hideSheet);
  $("#okc").addEventListener("click", () => {
    if ($("#cw").value.trim().toUpperCase() === w) { hideSheet(); setTimeout(() => openPack("codigo"), 200); }
    else {
      $("#cw").classList.add("bad"); toast("Esa no era 🙈"); vibrate(60);
      setTimeout(() => $("#cw") && $("#cw").classList.remove("bad"), 450);
    }
  });
}

/* ---- trivia ---- */
function triviaFlow() {
  const t = rnd(TRIVIA), K = ["A", "B", "C", "D"], dur = 8000, C = 226;
  showSheet(`
    <div class="mcard">
      <div class="kicker center">💡 Trivia Disney</div>
      <h2 class="center" style="font-family:'Cormorant Garamond';font-weight:700;font-size:24px;line-height:1.1;margin:12px 0 0;color:#fff">${t.q}</h2>
      <div class="opts" id="opts">${t.o.map((o, i) => `<div class="opt" data-i="${i}"><span class="k">${K[i]}</span>${o}</div>`).join("")}</div>
      <div class="ringt"><svg width="74" height="74"><circle cx="37" cy="37" r="32" stroke="rgba(255,255,255,.1)" stroke-width="6" fill="none"/>
        <circle id="trc" cx="37" cy="37" r="32" stroke="#f6dd99" stroke-width="6" fill="none" stroke-linecap="round"
          stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><div class="n" id="trn">8</div></div>
    </div>`);
  let alive = true; const start = performance.now();
  (function anim(now) {
    if (!alive) return;
    const e = Math.min(1, (now - start) / dur);
    const c = $("#trc"); if (!c) { alive = false; return; }
    c.style.strokeDashoffset = (C * e).toFixed(1); $("#trn").textContent = Math.ceil(8 * (1 - e));
    if (e < 1) requestAnimationFrame(anim); else { alive = false; triviaMiss("¡Se cerró la ronda!"); }
  })(start);
  sheet.querySelectorAll(".opt").forEach(el => el.addEventListener("click", () => {
    if (!alive) return;
    if (+el.dataset.i === t.a) { alive = false; triviaWin(); }
    else { el.classList.add("bad"); vibrate(60); setTimeout(() => el.classList.remove("bad"), 420); }
  }));
  function triviaMiss(msg) {
    showSheet(`
      <div class="mcard center"><div class="kicker">💡 Trivia</div>
        <p class="lead mt12">${msg}<br>Habrá más rondas en la noche.</p>
        <button class="btn mt16" id="rt">Probar otra ronda</button>
        <button class="btn ghost mt8" id="cl">Cerrar</button></div>`);
    $("#rt").addEventListener("click", triviaFlow); $("#cl").addEventListener("click", hideSheet);
  }
  function triviaWin() {
    showSheet(`<div class="mcard center"><div class="kicker">💡 Trivia</div>
      <p class="lead mt12">¡Correcta! Sorteando entre los que acertaron…</p>
      <div class="codebig mt12" style="letter-spacing:.04em">✦ ✦ ✦</div></div>`);
    setTimeout(() => {
      feedPush(`<b>Vos</b> ganaste la ronda de trivia 💡`, "🏆", true);
      showSheet(`<div class="mcard center"><div class="kicker">🎉 ¡Saliste sorteada!</div>
        <p class="lead mt12">Te llevás un <b style="color:var(--rose)">peluche Disney 🧸</b><br>y un sobre extra.</p>
        <button class="btn mt16" id="op">Abrir mi sobre</button></div>`);
      $("#op").addEventListener("click", () => openPack("trivia"));
    }, 1500);
  }
}

/* ---- carta escondida ---- */
function cartaFlow() {
  showSheet(`
    <div class="mcard center">
      <div class="kicker">🃏 Carta escondida</div>
      <p class="lead mt12">La encontraste atrás del centro de mesa…<br>¡tiene chip y todo!</p>
      <button class="btn mt16" id="okk">Chocarla con el celu</button>
      <button class="btn ghost mt8" id="nok">Dejarla donde estaba</button>
    </div>`);
  $("#nok").addEventListener("click", hideSheet);
  $("#okk").addEventListener("click", () => openPack("carta"));
}

/* ---- dorada: premio ---- */
function doradaOverlay(idx) {
  const first = !S.relojWon; if (first) { S.relojWon = true; save(); }
  feedPush(`<span class="r">¡Vos sacaste una dorada!</span> ${GOLD[idx].nm} ${GOLD[idx].g}`, "✨", true);
  showSheet(`
    <div class="rays"></div>
    <div style="position:relative;z-index:2" class="center">
      <div class="kicker">✨ ¡Figurita dorada! ✨</div>
      <div class="ticket mt16" style="margin-left:auto;margin-right:auto">
        <div class="crown">${GOLD[idx].g}</div>
        <div class="nm">${GOLD[idx].nm}</div>
        <div class="sub">Dorada del Reino</div>
      </div>
      ${first ? `<div class="pill mt16" style="font-size:13px;padding:10px 18px">🕛 Primera dorada de la noche — ¡ganás el Reloj Disney!</div>` : ""}
      <button class="btn mt20" id="dk" style="max-width:220px">¡Vamos!</button>
    </div>`);
  $("#dk").addEventListener("click", () => { hideSheet(); render(); afterGain(); });
}

/* ---------------- cambiar ---------------- */
function renderTrade() {
  if (S.done) {
    view.innerHTML = `<div class="wall center" style="margin-top:8vh">
      <div class="pill">👑 Ya completaste el Reino</div>
      <p class="hint mt12">Tus repetidas ahora valen oro: regalalas y salvá el álbum de alguien.</p></div>`;
    return;
  }
  const myReqHtml = S.myReq
    ? `<div class="req mreq"><div class="fg">${fig(S.myReq).g}</div>
        <div class="tx"><div class="a">Estás buscando <b>${esc(fig(S.myReq).nm)}</b></div>
        <div class="b">Tu pedido se ve en la pantalla grande</div></div>
        <button class="btn ghost sm" id="cancelReq">✕</button></div>`
    : `<button class="btn rose mt8" id="pubReq">🙋 Pedir una figu</button>`;

  const salonHtml = S.salon.map((r, i) => {
    const f = fig(r.figId), can = (S.counts[f.id] || 0) > 1 && missing().length > 0;
    return `<div class="req"><div class="fg">${f.g}</div>
      <div class="tx"><div class="a"><b>${r.who}</b> busca <b>${esc(f.nm)}</b></div>
      <div class="b">${can ? "La tenés repetida" : "No la tenés repetida"}</div></div>
      ${can ? `<button class="btn sm" data-offer="${i}">Ofrecer</button>` : ""}</div>`;
  }).join("");

  view.innerHTML = `
    <div class="sh" style="margin-top:4px"><span>Se busca</span><div class="ln"></div></div>
    <div class="card">
      <p class="hint">Elegí una figu que te falte y tu pedido sale al salón. Sin escribir nada — todo con botones.</p>
      ${myReqHtml}
    </div>
    <div class="sh"><span>Pedidos del salón</span><div class="ln"></div></div>
    <div class="card">${salonHtml || `<p class="hint">Nadie está buscando ahora mismo…</p>`}</div>
    <div class="sh"><span>Canje directo</span><div class="ln"></div></div>
    <div class="card center">
      <p class="hint">¿Están cara a cara? Conéctense con el código.</p>
      <div class="codebig mt8">${S.myCode}</div>
      <p class="hint" style="margin:2px 0 12px">tu código</p>
      <input class="field" id="codeIn" inputmode="numeric" maxlength="4" placeholder="– – – –"
        style="text-align:center;letter-spacing:.4em;font-size:22px">
      <button class="btn mt12" id="conn">Conectar</button>
    </div>`;
  const p = $("#pubReq"); if (p) p.addEventListener("click", pickRequest);
  const c = $("#cancelReq"); if (c) c.addEventListener("click", () => { clearTimeout(reqTimer); S.myReq = null; save(); renderTrade(); });
  view.querySelectorAll("[data-offer]").forEach(b => b.addEventListener("click", () => offerToSalon(+b.dataset.offer)));
  $("#conn").addEventListener("click", () => {
    const v = $("#codeIn").value.trim();
    if (v.length < 4) return toast("Tipeá los 4 números");
    codeSwap();
  });
}

function pickRequest() {
  const ms = missing();
  if (!ms.length) return;
  showSheet(`
    <div class="mcard">
      <div class="kicker center">¿Cuál te falta?</div>
      <div class="opts mt8">${ms.map(f => `<div class="opt" data-id="${f.id}"><span class="k">${f.g}</span>${esc(f.nm)}
        <span style="margin-left:auto;font-size:10px;color:var(--muted-2);font-weight:800;text-transform:uppercase">${esc(f.fm)}</span></div>`).join("")}</div>
      <button class="btn ghost mt12" id="cl">Cerrar</button>
    </div>`);
  $("#cl").addEventListener("click", hideSheet);
  sheet.querySelectorAll(".opt").forEach(el => el.addEventListener("click", () => {
    S.myReq = +el.dataset.id; save(); hideSheet(); renderTrade();
    feedPush(`<b>Vos</b> publicaste: busco <span class="g">${esc(fig(S.myReq).nm)} ${fig(S.myReq).g}</span>`, "🙋", true);
    toast("Tu pedido salió a la pantalla 🙋");
    scheduleReqOffer(6200);
  }));
}
function scheduleReqOffer(ms) {
  clearTimeout(reqTimer);
  reqTimer = setTimeout(() => { if (S.myReq && !S.done) incomingOffer(); }, ms);
}
function incomingOffer() {
  const want = fig(S.myReq), who = rnd(GUESTS);
  const give = dupes()[0] || null;
  showSheet(`
    <div class="mcard">
      <div class="kicker center">¡Te respondieron!</div>
      <h2 class="center" style="font-family:'Cormorant Garamond';font-weight:700;font-size:30px;color:#fff;margin:6px 0 0">${who}</h2>
      <p class="hint center">tiene tu <b style="color:var(--gold-1)">${esc(want.nm)}</b> ${give ? "y te propone:" : "y te la regala 🤍"}</p>
      ${give ? `<div class="swap">
        <div class="mini"><div class="g">${give.g}</div><div class="nm">${esc(give.nm)}</div><div class="who">vos das</div></div>
        <div class="ar">⇄</div>
        <div class="mini"><div class="g">${want.g}</div><div class="nm">${esc(want.nm)}</div><div class="who">${who} da</div></div>
      </div>` : `<div class="swap"><div class="mini" style="max-width:140px;margin:0 auto">
        <div class="g">${want.g}</div><div class="nm">${esc(want.nm)}</div><div class="who">para vos</div></div></div>`}
      <button class="btn rose" id="ok">Aceptar</button>
      <button class="btn ghost mt8" id="no">Ahora no</button>
    </div>`);
  $("#no").addEventListener("click", () => { hideSheet(); scheduleReqOffer(9000); });
  $("#ok").addEventListener("click", () => {
    if (give && S.counts[give.id] > 1) S.counts[give.id]--;
    S.counts[want.id] = (S.counts[want.id] || 0) + 1;
    feedPush(`<b>Vos</b> y <b>${who}</b> cambiaron — conseguiste <span class="g">${esc(want.nm)} ${want.g}</span>`, "🔄", true);
    S.myReq = null; clearTimeout(reqTimer); save();
    hideSheet(); render();
    if (uniques() === 15 && !S.done) setTimeout(completion, 420);
    else toast(`¡${want.nm} es tuya! Te faltan ${missing().length}`);
  });
}

function offerToSalon(i) {
  const r = S.salon[i], theirs = fig(r.figId);
  const back = rnd(missing());
  showSheet(`
    <div class="mcard">
      <div class="kicker center">Cambio con ${r.who}</div>
      <div class="swap mt12">
        <div class="mini"><div class="g">${theirs.g}</div><div class="nm">${esc(theirs.nm)}</div><div class="who">vos das</div></div>
        <div class="ar">⇄</div>
        <div class="mini"><div class="g">${back.g}</div><div class="nm">${esc(back.nm)}</div><div class="who">${r.who} da</div></div>
      </div>
      <button class="btn rose" id="ok">Cerrar el cambio</button>
      <button class="btn ghost mt8" id="no">Mejor no</button>
    </div>`);
  $("#no").addEventListener("click", hideSheet);
  $("#ok").addEventListener("click", () => {
    if (S.counts[theirs.id] > 1) S.counts[theirs.id]--;
    S.counts[back.id] = (S.counts[back.id] || 0) + 1;
    feedPush(`<b>Vos</b> le pasaste <span class="g">${esc(theirs.nm)}</span> a <b>${r.who}</b> y te llevaste <span class="g">${esc(back.nm)} ${back.g}</span>`, "🤝", true);
    S.salon[i] = newSalonReq(); save();
    hideSheet(); render();
    if (uniques() === 15 && !S.done) setTimeout(completion, 420);
    else toast(`¡${back.nm} es tuya! 🤝`);
  });
}

function codeSwap() {
  const who = rnd(GUESTS);
  const ms = missing();
  if (!ms.length) return toast("No te falta ninguna 👑");
  const want = rnd(ms), give = dupes()[0] || null;
  showSheet(`
    <div class="mcard">
      <div class="kicker center">Conectaste con</div>
      <h2 class="center" style="font-family:'Cormorant Garamond';font-weight:700;font-size:30px;color:#fff;margin:6px 0 0">${who}</h2>
      <p class="hint center">te propone:</p>
      <div class="swap">
        ${give ? `<div class="mini"><div class="g">${give.g}</div><div class="nm">${esc(give.nm)}</div><div class="who">vos das</div></div>
        <div class="ar">⇄</div>` : ""}
        <div class="mini"><div class="g">${want.g}</div><div class="nm">${esc(want.nm)}</div><div class="who">${who} da</div></div>
      </div>
      <button class="btn rose" id="ok">Aceptar cambio</button>
      <button class="btn ghost mt8" id="no">Cancelar</button>
    </div>`);
  $("#no").addEventListener("click", hideSheet);
  $("#ok").addEventListener("click", () => {
    if (give && S.counts[give.id] > 1) S.counts[give.id]--;
    S.counts[want.id] = (S.counts[want.id] || 0) + 1;
    feedPush(`<b>Vos</b> y <b>${who}</b> cambiaron — conseguiste <span class="g">${esc(want.nm)} ${want.g}</span>`, "🔄", true);
    save(); hideSheet(); render();
    if (uniques() === 15 && !S.done) setTimeout(completion, 420);
    else toast(`¡${want.nm} es tuya!`);
  });
}

/* ---------------- el Reino (feed) ---------------- */
function renderFeed() {
  view.innerHTML = `
    <div class="sh" style="margin-top:4px"><span>Pasó en el Reino</span><div class="ln"></div></div>
    <div class="feed">${S.feed.map(e => `
      <div class="ev ${e.mine ? "mine" : ""}"><span class="ic">${e.ic}</span>
        <div>${e.html}<span class="t">${new Date(e.t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span></div></div>`).join("")
      || `<p class="hint">Todavía no pasó nada… abrí tu sobre 🎁</p>`}</div>`;
}

/* ---------------- completion ---------------- */
function completion() {
  S.done = true; save();
  feedPush(`<span class="r">¡COMPLETASTE EL REINO!</span> Las 15 figus de Marti son tuyas 👑`, "🎆", true);
  showSheet(`
    <div class="rays"></div>
    <div style="position:relative;z-index:2" class="center">
      <div class="kicker">¡Completaste el Reino!</div>
      <div class="ticket mt16" style="margin-left:auto;margin-right:auto">
        ${S.selfie ? `<img src="${S.selfie}" alt="" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--gold-1);object-fit:cover">` : `<div class="crown">👑</div>`}
        <div class="nm">${esc(S.name)}</div>
        <div class="sub">Carta dorada de Marti</div>
        <div style="font-size:28px;margin-top:10px">🤍</div>
        <div class="ser">N.º 001 · PRIMERA EN COMPLETAR</div>
      </div>
      <div class="pill mt16" style="font-size:13px;padding:10px 18px">📷 ¡Ganás la cámara de fotos!</div>
      <p class="lead mt12" style="max-width:280px;margin-left:auto;margin-right:auto">Pasá por el
        <b style="color:var(--gold-1)">Mercadito del Reino</b>: Marti te entrega la carta en mano.</p>
      <button class="btn mt16" id="stay" style="max-width:230px">Seguir mirando el Reino</button>
      <button class="btn ghost mt8" id="rst" style="max-width:230px">Reiniciar demo</button>
    </div>`);
  confettiBurst(110);
  $("#stay").addEventListener("click", () => { hideSheet(); S.tab = "feed"; S.unread = 0; render(); });
  $("#rst").addEventListener("click", () => {
    clearTimeout(reqTimer);
    const code = S.code;
    localStorage.removeItem(saveKey(code));
    S = freshState(); S.code = code; S.screen = "onboarding";
    hideSheet(); render();
  });
}

/* ---------------- confetti ---------------- */
const CONF = { parts: [], running: false };
function confettiBurst(count = 110) {
  const cv = $("#confetti");
  cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
  const cols = ["#f6dd99", "#f1a8c6", "#e3b85f", "#ffffff", "#d76a98"];
  for (let i = 0; i < count; i++) CONF.parts.push({
    x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .25,
    vx: (Math.random() - .5) * 2.2, vy: 2 + Math.random() * 3.2,
    s: 4 + Math.random() * 5, c: rnd(cols), r: Math.random() * Math.PI, vr: (Math.random() - .5) * .2
  });
  if (CONF.running) return;
  CONF.running = true;
  const ctx = cv.getContext("2d");
  (function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    CONF.parts = CONF.parts.filter(p => p.y < cv.height + 20);
    CONF.parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .62); ctx.restore();
    });
    if (CONF.parts.length) requestAnimationFrame(loop);
    else { ctx.clearRect(0, 0, cv.width, cv.height); CONF.running = false; }
  })();
}

/* ---------------- boot ---------------- */
(function boot() {
  let code = codeFromURL();
  if (code) {
    localStorage.setItem(LS_CODE, code);
    // limpiamos query/hash para que el código no quede a la vista
    try { history.replaceState(null, "", location.pathname); } catch (e) { }
  } else {
    code = localStorage.getItem(LS_CODE);
  }
  if (!validCode(code)) { S = freshState(); render(); return; }

  const saved = load(code);
  if (saved && saved.name && (saved.avatar || saved.selfie)) {
    S = saved; S.screen = "app";
    if (!Array.isArray(S.salon) || !S.salon.length) seedSalon();
    startAmbient();
  } else {
    S = freshState(); S.code = code; S.screen = "onboarding";
  }
  render();
})();
