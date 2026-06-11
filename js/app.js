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

/* Marca: trazo "M" recreado en vector del logo de Martina.
   Si existe assets/logo.png (el wordmark original), lo usa en su lugar. */
const M_PATH = "M30 122 C33 62 45 30 58 28 C73 26 86 72 98 100 C106 117 113 115 121 88 C131 53 139 31 149 31 C160 31 165 62 168 126";
function mSVG(opts = {}) {
  const grad = !opts.solid;
  const id = "mg" + (mSVG._n = (mSVG._n || 0) + 1);
  return `<svg viewBox="0 0 200 150" fill="none" aria-hidden="true"${opts.cls ? ` class="${opts.cls}"` : ""}>
    ${grad ? `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d50da2"/><stop offset=".55" stop-color="#d50da2"/>
      <stop offset=".8" stop-color="#ee7d97"/><stop offset="1" stop-color="#e8639a"/></linearGradient></defs>` : ""}
    <path d="${M_PATH}" stroke="${grad ? `url(#${id})` : opts.solid}"
      stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
const logoHTML = `
  <div class="logo nologo">
    <img src="assets/logo.png" alt="Martina Fifteen" onload="this.parentElement.classList.remove('nologo')">
    <div class="mono">
      ${mSVG({ cls: "mm" })}
      <div class="wm">Martina</div>
      <div class="wm2">Fifteen</div>
    </div>
  </div>`;

/* ---------------- acceso por pulsera ---------------- */
/* Cada pulsera tiene un QR con su código: martixv.com/5s44f2
   Si la URL trae código → directo al onboarding (sin tipear nada).
   Si no → se pide el código impreso en la tarjeta de la pulsera. */
const CODE_RE = /^[a-z0-9]{4,8}$/i;
const RESERVED = new Set(["app", "css", "js", "assets", "docs", "demo"]);
const LS_CODE = "martixv:code";
const saveKey = c => "martixv:save2:" + c;

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
    code: null, name: "", avatar: null, selfie: null, entered: false,
    counts: {}, golds: [false, false, false, false, false],
    sources: { start: true, ig: true },
    lastSync: null,
    cartasFound: 0, usedCodes: [],
    gift: null, colgantes: 0, secLeft: SEC_TOTAL,
    prizes: { camara: null, reloj: null, peluche: null },
    board: null, doraLog: [],
    myReq: null,
    salon: [], feed: [], unread: 0,
    done: false,
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
  S.feed.unshift({ html, ic, mine, t: simTime || Date.now() });
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
  /* el tablero simulado avanza de a poco */
  if (S.board && Math.random() < .55) {
    const alive = S.board.filter(b => !b.done);
    if (alive.length) {
      const b = rnd(alive);
      b.n = Math.min(15, b.n + 1);
      if (b.n === 15) {
        b.done = true;
        const p = claimMainPrize(b.who);
        save();
        if (S.tab === "prizes" && S.screen === "app") renderTab();
        return feedPush(`<b>${b.who}</b> completó el Reino 👑${p ? ` — ¡ganó ${p.nm}!` : ""}`, "🎆");
      }
      save();
      if (S.tab === "prizes" && S.screen === "app") renderTab();
    }
  }
  const r = Math.random(), A = rnd(GUESTS); let B = rnd(GUESTS); while (B === A) B = rnd(GUESTS);
  const f = rnd(FIGS);
  if (r < .07 && S.secLeft > 0) {
    S.secLeft--;
    const g = rnd(GOLD);
    logDorada(A, g.nm); save();
    if (S.tab === "prizes" && S.screen === "app") renderTab();
    return feedPush(`<b>${A}</b> sacó una dorada ✨ y se llevó un colgante RGB`, "📿");
  }
  if (r < .3) return feedPush(`<b>${A}</b> y <b>${B}</b> cambiaron figus`, "🔄");
  if (r < .55) return feedPush(`<b>${A}</b> abrió un sobre y encontró a <span class="g">${f.nm} ${f.g}</span>`, "🎁");
  if (r < .72) return feedPush(`<b>${A}</b> le pasó <span class="g">${f.nm}</span> a <b>${B}</b> — ¡genia!`, "🤝");
  if (r < .86) return feedPush(`<b>${A}</b> ya va <span class="g">${10 + Math.floor(Math.random() * 4)}/15</span>`, "🏆");
  return feedPush(`<b>${A}</b> abrió otro sobre y… repetida. Bancá ${A} 🥲`, "🫂");
}
/* Modelo pull para economizar datos: nada corre de fondo.
   Al entrar a Reino o Premios se "sincroniza" lo que pasó desde
   la última visita (en producción: un GET al backend). */
let simTime = null;
function syncWorld() {
  const now = Date.now();
  const last = S.lastSync || now;
  let ticks = Math.min(12, Math.floor((now - last) / 8000));
  if (!S.lastSync) ticks = 3;
  for (let i = 0; i < ticks; i++) {
    simTime = last + ((i + 1) * (now - last)) / (ticks + 1);
    ambient();
  }
  simTime = null;
  S.lastSync = now; save();
}

function newSalonReq() { return { who: rnd(GUESTS), figId: rnd(FIGS).id }; }
function seedSalon() { S.salon = [newSalonReq(), newSalonReq(), newSalonReq()]; }

/* tablero simulado de invitados para el top 8 */
function seedBoard() {
  const names = [...GUESTS].sort(() => Math.random() - .5);
  S.board = names.map(who => ({ who, n: 3 + Math.floor(Math.random() * 5), done: false }));
}
function ensureSim() {
  if (!Array.isArray(S.salon) || !S.salon.length) seedSalon();
  if (!Array.isArray(S.board) || !S.board.length) seedBoard();
}
/* los principales se entregan por orden de llegada: 1º, 2º, 3º */
function claimMainPrize(who) {
  const p = PRIZES_MAIN.find(p => !S.prizes[p.key]);
  if (p) S.prizes[p.key] = who;
  return p || null;
}
function logDorada(who, nm) {
  S.doraLog.unshift({ who, nm, t: Date.now() });
  if (S.doraLog.length > 12) S.doraLog.pop();
}

/* ---------------- router ---------------- */
function render() {
  if (typeof updateGiftBar === "function") updateGiftBar();
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
    if (S.tab === "feed" || S.tab === "prizes") syncWorld();
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
  if (S.tab === "prizes") return renderPrizes();
  if (S.tab === "account") return renderAccount();
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
    ensureSim();
    render();
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
      <p class="hint center mt12 ${S.selfie ? "dim" : ""}">— o elegí un personaje —</p>
      <div class="avgrid ${S.selfie ? "dim" : ""}" id="avs">
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
    ensureSim();
    save(); render();
    if (!S.entered) {
      S.entered = true; save();
      feedPush(`<b>Vos</b> entraste al Reino ✦ ¡bienvenida!`, "🏰", true);
      if (S.sources.start) setTimeout(() => openPack("start"), 420);
    }
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
function srcAvailable(k) {
  if (k === "codigo" || k === "gift") return true;
  if (k === "carta") return S.cartasFound < CARTAS_MAX;
  return !!S.sources[k];
}
function renderAlbum() {
  const u = uniques();
  let act = "";
  if (S.done) {
    act = `<div class="wall center mt8"><div class="pill">👑 Reino completo</div>
      <p class="hint mt12">Ya tenés tu carta dorada esperándote en el Mercadito.</p></div>`;
  } else {
    const order = ["start", "ig", "codigo", "carta"];
    const onceDone = !S.sources.start && !S.sources.ig && S.cartasFound >= CARTAS_MAX;
    act = `
      <div class="sh"><span>Conseguir sobres</span><div class="ln"></div></div>
      <p class="hint" style="margin-bottom:11px">Deberás <b style="color:var(--ink)">encontrar los sobres</b> escondidos,
      <b style="color:var(--ink)">canjear códigos</b> de las entrevistas o
      <b style="color:var(--rose)">cambiar las repetidas</b> por las que te faltan.</p>
      <div class="srcs">
        ${order.map(k => {
          const m = SRC[k], on = srcAvailable(k);
          const extra = k === "carta" && on && S.cartasFound > 0
            ? `<div class="d" style="color:var(--green);font-weight:800">${S.cartasFound}/${CARTAS_MAX} encontrados</div>` : "";
          return `<div class="src ${on ? "" : "spent"}" data-src="${k}">
            <div class="ic">${m.ic}</div><div class="t">${m.t}</div><div class="d">${m.d}</div>${extra}</div>`;
        }).join("")}
      </div>
      ${onceDone && u < 15 ? `
      <div class="wall mt12">
        <div class="pill">🔒 Te faltan ${15 - u}</div>
        <p class="hint mt12">Las que faltan son las más raras del Reino — cerralo
        <b style="color:var(--rose)">cambiando con alguien</b> o canjeando más códigos.</p>
        <button class="btn rose mt16" id="goTrade">Ir a cambiar</button>
      </div>` : ""}`;
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
    <p class="footnote">No hacen falta para ganar · cada dorada se lleva un colgante RGB de Marti 📿</p>`;
  view.querySelectorAll(".src").forEach(el => el.addEventListener("click", () => routeSource(el.dataset.src)));
  const g = $("#goTrade"); if (g) g.addEventListener("click", () => { S.tab = "trade"; renderTab(); });
}

/* ---------------- fuentes de sobres ---------------- */
function routeSource(k) {
  if (k === "start") return openPack("start");
  if (k === "ig") return igFlow();
  if (k === "codigo") return codeRedeemFlow();
  if (k === "carta") return cartaFlow();
}
function showSheet(html) { sheet.innerHTML = html; sheet.classList.add("on"); }
function hideSheet() {
  sheet.classList.remove("on");
  setTimeout(() => { if (!sheet.classList.contains("on")) sheet.innerHTML = ""; }, 260);
}

/* ---------------- sobre + reveal de a una ---------------- */
let RV = null;

function openPack(srcKey, count) {
  if (!srcAvailable(srcKey)) return;
  const meta = SRC[srcKey];
  const n = count || meta.n;
  const kick = srcKey === "start" ? "Tu sobre de bienvenida"
    : srcKey === "gift" ? "¡Regalo del Reino!" : "¡Un sobre más!";
  showSheet(`
    <div class="kicker">${kick}</div>
    <div class="env" id="env"><div class="flapline"></div><div class="seal">${mSVG({ solid: "#2a1c08", cls: "ms" })}</div></div>
    <p class="lead" style="max-width:250px">Tocá el sello para abrirlo</p>
    <p class="hint mt8">${n} figu${n > 1 ? "s" : ""} adentro</p>`);
  const env = $("#env");
  env.addEventListener("click", function once() {
    env.removeEventListener("click", once);
    env.classList.add("opening");
    vibrate([14, 60, 24]);

    if (srcKey === "carta") S.cartasFound++;
    else if (meta.once) S.sources[srcKey] = false;

    const minNew = Math.min(n, srcKey === "start" ? 3 : (uniques() < 10 ? 1 : 0));
    const draws = applyPity(Array.from({ length: n }, () => drawOne()), minNew);
    let dorIdx = -1;
    if (meta.dor && GOLD.some((_, i) => !S.golds[i]) && Math.random() < meta.dor) {
      const locked = GOLD.map((_, i) => i).filter(i => !S.golds[i]);
      dorIdx = rnd(locked); S.golds[dorIdx] = true;
    }
    const queue = draws.map(id => {
      const before = S.counts[id] || 0; S.counts[id] = before + 1;
      return { kind: "fig", f: fig(id), nu: before === 0 };
    });
    if (dorIdx >= 0) queue.push({ kind: "gold", idx: dorIdx });
    save();
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
          <div class="bcface fr"><img class="mfr" src="assets/logo-m.png" alt=""></div>
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
        <div class="bcface fr"><img class="mfr" src="assets/logo-m.png" alt=""></div>
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

/* ---- canjear código (+1 / +3 / +5 / +10) ----
   Los códigos se reparten en entrevistas, sobres físicos y momentos
   de la noche. En producción los valida el backend contra la lista
   emitida; en la demo el sufijo numérico define cuántas figus trae. */
function codeRedeemFlow() {
  showSheet(`
    <div class="mcard">
      <div class="kicker center">🎤 Canjear código</div>
      <p class="hint center mt8">Conseguí códigos en las <b style="color:var(--gold-1)">entrevistas</b> y
      sorpresas de la noche. Valen <b style="color:var(--gold-1)">+1, +3, +5 o +10</b> figus.</p>
      <input class="field mt12" id="cw" placeholder="Ej: ANDRO5" autocomplete="off" maxlength="12"
        style="text-align:center;text-transform:uppercase;letter-spacing:.12em">
      <button class="btn mt12" id="okc">Canjear</button>
      <button class="btn ghost mt8" id="noc">Cerrar</button>
      <p class="hint center mt8" style="opacity:.65">Demo: probá ANDRO1, MARTI3, SHOW5 o REINO10</p>
    </div>`);
  $("#noc").addEventListener("click", hideSheet);
  const bad = msg => {
    const i = $("#cw"); if (!i) return;
    i.classList.add("bad"); toast(msg); vibrate(60);
    setTimeout(() => i.classList.remove("bad"), 450);
  };
  $("#okc").addEventListener("click", () => {
    const v = $("#cw").value.trim().toUpperCase();
    const m = v.match(/^[A-Z]{3,10}(10|[135])$/);
    if (!m) return bad("Ese código no existe 🙈");
    if (S.usedCodes.includes(v)) return bad("Ese código ya lo usaste 😉");
    S.usedCodes.push(v); save();
    hideSheet(); setTimeout(() => openPack("codigo", +m[1]), 200);
  });
}

/* ---- seguinos en instagram ---- */
function igFlow() {
  showSheet(`
    <div class="mcard center">
      <div class="kicker">📸 Seguinos en Instagram</div>
      <div class="codebig mt8" style="font-size:28px;letter-spacing:.04em">@andro.show</div>
      <p class="hint mt8">Seguinos y llevate una figu de regalo.</p>
      <a class="btn mt12" style="display:block;text-decoration:none"
        href="https://instagram.com/andro.show" target="_blank" rel="noopener">Abrir Instagram</a>
      <button class="btn rose mt8" id="igOk">¡Ya los sigo! ✓</button>
      <button class="btn ghost mt8" id="igNo">Ahora no</button>
    </div>`);
  $("#igNo").addEventListener("click", hideSheet);
  $("#igOk").addEventListener("click", () => openPack("ig"));
}

/* ---- sobres escondidos por el salón ---- */
function cartaFlow() {
  showSheet(`
    <div class="mcard center">
      <div class="kicker">🃏 Sobres escondidos</div>
      <p class="lead mt12">Hay sobres físicos escondidos por todo el salón.<br>
      Cada uno trae un código adentro.</p>
      <p class="hint mt8">Encontraste ${S.cartasFound} de ${CARTAS_MAX} posibles</p>
      <button class="btn mt16" id="okk">¡Encontré uno! Canjearlo</button>
      <button class="btn ghost mt8" id="nok">Sigo buscando</button>
    </div>`);
  $("#nok").addEventListener("click", hideSheet);
  $("#okk").addEventListener("click", () => openPack("carta"));
}

/* ---- dorada: cada una se lleva un colgante RGB ---- */
function doradaOverlay(idx) {
  S.colgantes++;
  if (S.secLeft > 0) S.secLeft--;
  logDorada("Vos", GOLD[idx].nm);
  save();
  feedPush(`<span class="r">¡Vos sacaste una dorada!</span> ${GOLD[idx].nm} ${GOLD[idx].g} — colgante RGB 📿`, "✨", true);
  showSheet(`
    <div class="rays"></div>
    <div style="position:relative;z-index:2" class="center">
      <div class="kicker">✨ ¡Figurita dorada! ✨</div>
      <div class="ticket mt16" style="margin-left:auto;margin-right:auto">
        <div class="crown">${GOLD[idx].g}</div>
        <div class="nm">${GOLD[idx].nm}</div>
        <div class="sub">Dorada del Reino</div>
      </div>
      <div class="pill mt16" style="font-size:13px;padding:10px 18px">📿 ¡Te llevás un colgante RGB de Marti!</div>
      <p class="hint mt8">Retiralo en el Mercadito del Reino</p>
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
        <div class="b">Todo el Reino ve tu pedido</div></div>
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
    toast("Tu pedido salió al Reino 🙋");
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

/* ---------------- el Reino (feed + top 8) ----------------
   Se carga al entrar a la sección (y con el botón actualizar):
   nada viaja de fondo, para economizar datos. */
function renderFeed() {
  view.innerHTML = `
    <div class="sh" style="margin-top:4px"><span>Top 8 del Reino</span><div class="ln"></div>
      <button class="btn ghost sm" id="syncBtn" style="padding:7px 12px">⟳ Actualizar</button></div>
    <div class="card" style="padding-top:6px">${top8HTML()}</div>
    <div class="sh"><span>Pasó en el Reino</span><div class="ln"></div></div>
    <div class="feed">${S.feed.map(e => `
      <div class="ev ${e.mine ? "mine" : ""}"><span class="ic">${e.ic}</span>
        <div>${e.html}<span class="t">${new Date(e.t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span></div></div>`).join("")
      || `<p class="hint">Todavía no pasó nada… abrí tu sobre 🎁</p>`}</div>
    <p class="footnote">Se actualiza al entrar · sin gastar datos de fondo</p>`;
  $("#syncBtn").addEventListener("click", () => {
    syncWorld(); S.unread = 0; paintDot(); renderTab();
    toast("Reino actualizado ✨");
  });
}

/* ---------------- top 8 (se muestra en El Reino) ---------------- */
function top8HTML() {
  const rows = [
    ...(S.board || []).map(b => ({ who: b.who, n: b.n, done: b.done, me: false })),
    { who: "Vos", n: uniques(), done: S.done, me: true },
  ].sort((a, b) => b.n - a.n || (a.me ? -1 : 1)).slice(0, 8);
  const prizeOf = who => PRIZES_MAIN.find(p => S.prizes[p.key] === who);
  return rows.map((r, i) => {
    const p = r.done ? prizeOf(r.me ? "Vos" : r.who) : null;
    const right = r.done
      ? `<span class="won">¡Ganó ${p ? p.nm + "! " + p.g : "— Reino completo! 👑"}</span>`
      : `<span class="ct">${r.n}/15</span>`;
    return `<div class="lbrow ${r.done ? "done" : ""} ${r.me ? "me" : ""}">
      <span class="rk">${i + 1}</span>
      <span class="lnm">${esc(r.who)}</span>
      ${right}
      <div class="bar"><i style="width:${Math.round(r.n / 15 * 100)}%"></i></div>
    </div>`;
  }).join("");
}

/* ---------------- premios ---------------- */
function renderPrizes() {
  const prizesHtml = PRIZES_MAIN.map(p => {
    const w = S.prizes[p.key];
    return `<div class="req ${w ? "given" : ""}">
      <div class="fg" style="font-size:24px">${p.g}</div>
      <div class="tx"><div class="a"><b>${p.nm}</b></div>
      <div class="b">${w ? `✓ Entregado a ${esc(String(w === true ? "—" : w))}` : p.how}</div></div>
      ${w ? `<span class="chk">✓</span>` : ""}</div>`;
  }).join("");

  const logHtml = S.doraLog.length
    ? S.doraLog.map(e => `<div class="req"><div class="fg">✨</div>
        <div class="tx"><div class="a"><b>${esc(e.who)}</b> sacó la dorada <b>${esc(e.nm)}</b></div>
        <div class="b">📿 Colgante RGB · ${new Date(e.t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</div></div></div>`).join("")
    : `<p class="hint">Todavía nadie sacó una dorada… puede ser tuya ✨</p>`;

  view.innerHTML = `
    <div class="sh" style="margin-top:4px"><span>Premios principales</span><div class="ln"></div></div>
    <div class="card">${prizesHtml}</div>
    <div class="sh"><span>Colgantes RGB · quedan ${S.secLeft} de ${SEC_TOTAL}</span><div class="ln"></div></div>
    <div class="card center">
      <div style="font-size:25px;letter-spacing:5px;line-height:1.5">${"📿".repeat(S.secLeft) || "✨ ¡Volaron todos! ✨"}</div>
      <p class="hint mt12">${SEC_TOTAL} colgantes RGB de Marti. Las
      <b style="color:var(--gold-1)">${GOLD.length} cartas doradas</b> se llevan uno seguro —
      el resto se sortea durante la noche.</p>
      ${S.colgantes ? `<div class="pill mt12">📿 Vos ya ganaste ${S.colgantes}</div>` : ""}
    </div>
    <div class="sh"><span>Ganadores con carta dorada</span><div class="ln"></div></div>
    <div class="card">${logHtml}</div>
    <p class="footnote">Los premios se retiran en el Mercadito del Reino</p>`;
}

/* ---------------- cuenta ---------------- */
function renderAccount() {
  const u = uniques();
  const reps = FIGS.reduce((a, f) => a + Math.max(0, (S.counts[f.id] || 0) - 1), 0);
  const dor = S.golds.filter(Boolean).length;
  const stat = (n, l) => `<div class="mini" style="flex:1"><div class="g" style="font-size:24px;font-family:'Cormorant Garamond';font-weight:700;color:var(--gold-1)">${n}</div><div class="who">${l}</div></div>`;
  view.innerHTML = `
    <div class="card center" style="margin-top:4px">
      <div style="width:76px;height:76px;border-radius:50%;margin:0 auto;overflow:hidden;background:rgba(227,184,95,.13);display:flex;align-items:center;justify-content:center;font-size:36px">${avatarHTML()}</div>
      <h2 style="font-family:'Cormorant Garamond';font-weight:700;font-size:28px;margin:10px 0 6px;color:#fff">${esc(S.name)}</h2>
      <div class="pill">Pulsera #${esc(S.code.toUpperCase())}</div>
    </div>
    <div class="swap" style="margin:12px 0">
      ${stat(`${u}/15`, "figus")}${stat(reps, "repetidas")}${stat(dor, "doradas")}${stat(S.colgantes, "colgantes")}
    </div>
    <div class="card center">
      <p class="hint">Tu código de canje directo</p>
      <div class="codebig mt8">${S.myCode}</div>
      <p class="hint" style="margin-top:2px">Dáselo a quien quiera cambiar con vos</p>
    </div>
    <div class="sh"><span>Opciones</span><div class="ln"></div></div>
    <button class="btn ghost" id="editP">✏️ Cambiar nombre o foto</button>
    <button class="btn ghost mt8" id="demoGift">🛰️ Simular sobre regalo (backend)</button>
    <button class="btn ghost mt8" id="resetP">🔄 Reiniciar demo</button>
    <button class="btn ghost mt8" id="outP">🚪 Salir · usar otra pulsera</button>
    <p class="footnote">Tu pulsera es tu cuenta · el progreso queda guardado en este celu</p>`;
  $("#editP").addEventListener("click", () => { S.screen = "onboarding"; render(); });
  $("#demoGift").addEventListener("click", () => giftAnnounce());
  $("#resetP").addEventListener("click", () => {
    clearTimeout(reqTimer);
    const code = S.code;
    localStorage.removeItem(saveKey(code));
    S = freshState(); S.code = code; S.screen = "onboarding";
    updateGiftBar(); render();
  });
  $("#outP").addEventListener("click", () => {
    clearTimeout(reqTimer); save();
    localStorage.removeItem(LS_CODE);
    S = freshState(); updateGiftBar(); render();
  });
}

/* ---------------- sobre regalo con contador ----------------
   En la fiesta lo dispara el backend cuando el ritmo decae:
   "recibirás un sobre de regalo en 3 minutos". */
const giftBar = $("#giftbar");
function giftAnnounce(ms = 180000) {
  if (S.gift) return toast("Ya tenés un sobre en camino 🎁");
  showSheet(`
    <div class="mcard center">
      <div class="kicker">🎁 ¡Regalo del Reino!</div>
      <p class="lead mt12">Marti te manda un sobre de regalo.<br>
      Te llega en <b style="color:var(--gold-1)">3 minutos</b>.</p>
      <button class="btn mt16" id="gok">¡Genial!</button>
    </div>`);
  $("#gok").addEventListener("click", () => {
    S.gift = Date.now() + ms; save();
    hideSheet(); updateGiftBar();
    toast("Mirá el contador acá abajo 👇");
  });
}
function updateGiftBar() {
  if (!S || S.screen !== "app" || !S.gift) { giftBar.style.display = "none"; return; }
  const left = S.gift - Date.now();
  giftBar.style.display = "flex";
  if (left <= 0) {
    giftBar.classList.add("ready");
    giftBar.textContent = "🎁 ¡Tu sobre llegó! Tocá para abrirlo";
  } else {
    giftBar.classList.remove("ready");
    const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    giftBar.textContent = `🎁 Sobre de regalo en ${m}:${String(s).padStart(2, "0")}`;
  }
}
setInterval(updateGiftBar, 1000);
giftBar.addEventListener("click", () => {
  if (S && S.gift && S.gift - Date.now() <= 0) {
    S.gift = null; save(); updateGiftBar();
    openPack("gift");
  }
});

/* ---------------- completion ---------------- */
function completion() {
  S.done = true;
  const prize = claimMainPrize("Vos");
  const place = prize ? PRIZES_MAIN.findIndex(x => x.key === prize.key) + 1
    : (S.board || []).filter(b => b.done).length + 1;
  save();
  feedPush(`<span class="r">¡COMPLETASTE EL REINO!</span> Las 15 figus de Marti son tuyas 👑${prize ? ` — ¡ganaste ${prize.nm}!` : ""}`, "🎆", true);
  showSheet(`
    <div class="rays"></div>
    <div style="position:relative;z-index:2" class="center">
      <div class="kicker">¡Completaste el Reino!</div>
      <div class="ticket mt16" style="margin-left:auto;margin-right:auto">
        ${S.selfie ? `<img src="${S.selfie}" alt="" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--gold-1);object-fit:cover">` : `<div class="crown">👑</div>`}
        <div class="nm">${esc(S.name)}</div>
        <div class="sub">Carta dorada de Marti</div>
        <div style="font-size:28px;margin-top:10px">🤍</div>
        <div class="ser">N.º ${String(place).padStart(3, "0")} EN COMPLETAR</div>
      </div>
      ${prize
        ? `<div class="pill mt16" style="font-size:13px;padding:10px 18px">${prize.g} ¡Ganás ${prize.nm}!</div>`
        : `<div class="pill mt16" style="font-size:13px;padding:10px 18px">👑 Reino completo — pasá por el Mercadito</div>`}
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
    ensureSim();
  } else {
    S = freshState(); S.code = code; S.screen = "onboarding";
  }
  render();
})();
