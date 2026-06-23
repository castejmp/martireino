/* Trivia del Reino · Martina XV
   El entrevistador ingresa el nombre del participante, se sacan 5 preguntas
   al azar de todas las películas y opera tocando la opción elegida.
   Cada correcta = una figu. */

const $ = s => document.querySelector(s);
const N_PREG = 5;

let nombre = "";
let preguntas = [];   // 5 elegidas, con opciones ya barajadas
let idx = 0;          // índice de pregunta actual
let respondida = false;
let resultados = [];  // [{ peli, correcta }]

/* ---------- util ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Baraja las opciones de una pregunta y recalcula el índice correcto.
   Las 'libre' (cualquier opción cuenta) no necesitan ok. */
function prepararOpciones(p) {
  if (p.libre) {
    return { ...p, op: shuffle(p.op), libre: true };
  }
  const correctaTexto = p.op[p.ok];
  const ops = shuffle(p.op);
  return { ...p, op: ops, ok: ops.indexOf(correctaTexto) };
}

/* Arma la ronda de 5: una pregunta de cada nivel (1→5, fácil a difícil),
   de películas distintas, e inyecta 1 (a veces 2) comodines al azar en
   posiciones después de la primera, para generar reacciones a cámara. */
function elegirPreguntas() {
  const usadas = new Set();
  const ronda = [];
  for (let nivel = 1; nivel <= N_PREG; nivel++) {
    const pool = shuffle(BANCO.filter(p => p.n === nivel));
    let elegida = pool.find(p => !usadas.has(p.peli)) || pool[0];
    usadas.add(elegida.peli);
    ronda.push(elegida);
  }

  // ¿cuántos comodines? casi siempre 1, a veces 2
  const nComod = Math.random() < 0.35 ? 2 : 1;
  const comodines = shuffle(COMODINES).slice(0, nComod);
  // posiciones candidatas: cualquiera menos la primera (1..N_PREG-1)
  const posiciones = shuffle([...Array(N_PREG - 1).keys()].map(i => i + 1)).slice(0, nComod);
  comodines.forEach((c, i) => { ronda[posiciones[i]] = c; });

  return ronda.map(prepararOpciones);
}

/* ---------- navegación de pantallas ---------- */
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("show"));
  $("#" + id).classList.add("show");
}

/* ---------- start ---------- */
function empezar() {
  const val = $("#nombre").value.trim();
  if (!val) { $("#nombre").focus(); return; }
  nombre = val;
  preguntas = elegirPreguntas();
  idx = 0;
  resultados = [];
  $("#qNombre").textContent = nombre;
  pintarDots();
  pintarPregunta();
  show("quiz");
}

/* ---------- quiz ---------- */
function pintarDots() {
  const d = $("#dots");
  d.innerHTML = "";
  for (let i = 0; i < N_PREG; i++) {
    const dot = document.createElement("i");
    if (i < resultados.length) dot.className = resultados[i].correcta ? "done" : "fail";
    else if (i === idx) dot.className = "now";
    d.appendChild(dot);
  }
}

function pintarPregunta() {
  respondida = false;
  const p = preguntas[idx];
  $("#qNum").textContent = idx + 1;
  $("#qPeli").textContent = p.peli;
  $("#qTexto").textContent = p.q;

  const tagEl = $("#qNivel");
  if (p.cat) {
    // comodín: badge de categoría
    const c = CATS[p.cat];
    tagEl.className = "nivel comodin cat-" + p.cat;
    tagEl.innerHTML = `<span class="stars">🎲</span> ${c.emoji} ${c.txt}`;
  } else {
    // pregunta de saber: badge de nivel con estrellas
    const niv = NIVELES[p.n];
    const estrellas = "★".repeat(niv.estrellas) + "☆".repeat(5 - niv.estrellas);
    tagEl.className = "nivel niv-" + p.n;
    tagEl.innerHTML = `<span class="stars">${estrellas}</span> ${niv.txt}`;
  }

  const cont = $("#qOpciones");
  cont.className = "opciones";
  cont.innerHTML = "";
  const letras = ["A", "B", "C"];
  p.op.forEach((texto, i) => {
    const b = document.createElement("button");
    b.className = "opcion";
    // en libre cualquier opción es válida → siempre ✓; si no, ✓ en la correcta
    const marca = p.libre ? "✓" : (i === p.ok ? "✓" : "✕");
    b.innerHTML = `<span class="letra">${letras[i]}</span><span class="txt">${texto}</span><span class="marca">${marca}</span>`;
    b.addEventListener("click", () => responder(i, b));
    cont.appendChild(b);
  });

  const sig = $("#siguiente");
  sig.disabled = true;
  sig.textContent = idx === N_PREG - 1 ? "Ver resultado" : "Siguiente";
  pintarDots();
}

function responder(elegido, btn) {
  if (respondida) return;
  respondida = true;
  const p = preguntas[idx];
  const cont = $("#qOpciones");
  cont.classList.add("locked");
  const botones = cont.querySelectorAll(".opcion");

  let correcta;
  if (p.libre) {
    // comodín libre: cualquier opción cuenta, figu asegurada
    botones[elegido].classList.add("ok");
    correcta = true;
  } else {
    // marcar la correcta y la elegida (si erró)
    botones[p.ok].classList.add("ok");
    if (elegido !== p.ok) botones[elegido].classList.add("bad");
    correcta = elegido === p.ok;
  }

  resultados[idx] = { peli: p.peli, correcta, comodin: !!p.cat };
  pintarDots();
  $("#siguiente").disabled = false;
}

function siguiente() {
  if (!respondida) return;
  if (idx < N_PREG - 1) {
    idx++;
    pintarPregunta();
  } else {
    mostrarResultado();
  }
}

/* ---------- result ---------- */
function mostrarResultado() {
  const aciertos = resultados.filter(r => r.correcta).length;
  $("#rNum").textContent = aciertos;
  $("#rFigus").textContent = aciertos;
  $("#rNombre").textContent = nombre;
  $("#rEmoji").textContent = aciertos >= 4 ? "🏆" : aciertos >= 2 ? "🎉" : "💪";

  const list = $("#rList");
  list.innerHTML = "";
  resultados.forEach(r => {
    const item = document.createElement("div");
    item.className = "ritem" + (r.correcta ? "" : " no");
    item.innerHTML = `<span class="ri-ico">${r.correcta ? "✅" : "❌"}</span>
      <span>${r.correcta ? "Correcta" : "Incorrecta"}</span>
      <span class="ri-peli">${r.peli}</span>`;
    list.appendChild(item);
  });

  show("result");
}

/* ---------- reset ---------- */
function nuevo() {
  $("#nombre").value = "";
  nombre = "";
  show("start");
  $("#nombre").focus();
}

/* ---------- wiring ---------- */
$("#empezar").addEventListener("click", empezar);
$("#nombre").addEventListener("keydown", e => { if (e.key === "Enter") empezar(); });
$("#siguiente").addEventListener("click", siguiente);
$("#otro").addEventListener("click", nuevo);
