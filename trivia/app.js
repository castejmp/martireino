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

/* Elige 5 preguntas: una de cada nivel (1→5, fácil a difícil),
   tratando de que sean de películas distintas. */
function elegirPreguntas() {
  const usadas = new Set();
  const elegidas = [];
  for (let nivel = 1; nivel <= N_PREG; nivel++) {
    const pool = shuffle(BANCO.filter(p => p.n === nivel));
    // preferir una película que no se haya usado todavía
    let elegida = pool.find(p => !usadas.has(p.peli)) || pool[0];
    usadas.add(elegida.peli);
    elegidas.push(elegida);
  }
  // barajar opciones de cada una y guardar índice correcto
  return elegidas.map(p => {
    const correctaTexto = p.op[p.ok];
    const ops = shuffle(p.op);
    return { peli: p.peli, n: p.n, q: p.q, op: ops, ok: ops.indexOf(correctaTexto) };
  });
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

  const niv = NIVELES[p.n];
  const estrellas = "★".repeat(niv.estrellas) + "☆".repeat(5 - niv.estrellas);
  const nivelEl = $("#qNivel");
  nivelEl.className = "nivel niv-" + p.n;
  nivelEl.innerHTML = `<span class="stars">${estrellas}</span> ${niv.txt}`;

  const cont = $("#qOpciones");
  cont.className = "opciones";
  cont.innerHTML = "";
  const letras = ["A", "B", "C"];
  p.op.forEach((texto, i) => {
    const b = document.createElement("button");
    b.className = "opcion";
    b.innerHTML = `<span class="letra">${letras[i]}</span><span class="txt">${texto}</span><span class="marca">${i === p.ok ? "✓" : "✕"}</span>`;
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

  // marcar la correcta y la elegida (si erró)
  const botones = cont.querySelectorAll(".opcion");
  botones[p.ok].classList.add("ok");
  if (elegido !== p.ok) botones[elegido].classList.add("bad");

  resultados[idx] = { peli: p.peli, correcta: elegido === p.ok };
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
