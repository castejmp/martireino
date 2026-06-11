/* =====================================================
   Figus del Reino · datos del juego
   Para usar arte real en una figu: poné la ruta en `img`
   (ej: img:"assets/figus/01.jpg"). Si la imagen falta o
   no carga, se muestra el emoji como fallback.
   ===================================================== */

const FIGS = [
  { id: 1,  g: "🐚", nm: "Marti Sirena",      fm: "La Sirenita",            r: "comun", img: null },
  { id: 2,  g: "❄️", nm: "Marti de Hielo",    fm: "Frozen",                 r: "comun", img: null },
  { id: 3,  g: "🌺", nm: "Marti Navegante",   fm: "Moana",                  r: "comun", img: null },
  { id: 4,  g: "🗡️", nm: "Marti Guerrera",    fm: "Mulán",                  r: "comun", img: null },
  { id: 5,  g: "🪔", nm: "Marti Jazmín",      fm: "Aladdín",                r: "comun", img: null },
  { id: 6,  g: "🌹", nm: "Marti Bella",       fm: "La Bella y la Bestia",   r: "comun", img: null },
  { id: 7,  g: "👠", nm: "Marti Cenicienta",  fm: "Cenicienta",             r: "comun", img: null },
  { id: 8,  g: "💜", nm: "Marti Rapunzel",    fm: "Enredados",              r: "comun", img: null },
  { id: 9,  g: "🍎", nm: "Marti Blanca",      fm: "Blancanieves",           r: "rara",  img: null },
  { id: 10, g: "🌿", nm: "Marti Aurora",      fm: "La Bella Durmiente",     r: "rara",  img: null },
  { id: 11, g: "🍃", nm: "Marti Pocahontas",  fm: "Pocahontas",             r: "rara",  img: null },
  { id: 12, g: "🏹", nm: "Marti Valiente",    fm: "Brave",                  r: "rara",  img: null },
  { id: 13, g: "🐸", nm: "Marti Tiana",       fm: "La Princesa y el Sapo",  r: "rara",  img: null },
  { id: 14, g: "🦋", nm: "Marti Encanto",     fm: "Encanto",                r: "epica", img: null },
  { id: 15, g: "🖤", nm: "Marti Maléfica",    fm: "Maléfica",               r: "epica", img: null },
];

const GOLD = [
  { g: "👑", nm: "Marti · El Vals" },
  { g: "🤍", nm: "Marti & Papá" },
  { g: "💖", nm: "Marti & Mamá" },
  { g: "✨", nm: "Marti Reina" },
  { g: "🌙", nm: "Marti de Noche" },
];

const AVATARS = [
  { g: "👑", n: "Princesa" }, { g: "🧚", n: "Hada" },     { g: "🦋", n: "Mariposa" }, { g: "🌹", n: "Rosa" },
  { g: "🐉", n: "Dragón" },   { g: "🦢", n: "Cisne" },    { g: "⭐", n: "Estrella" }, { g: "🏰", n: "Castillo" },
];

const GUESTS = ["Sofi", "Tomi", "Juli", "Cande", "Nacho", "Valen", "Mía", "Benja", "Lola", "Fran"];

const TRIVIA = [
  { q: "¿En qué película Marti sería una sirena?", o: ["La Sirenita", "Moana", "Frozen", "Encanto"], a: 0 },
  { q: "¿Quién canta «Libre soy»?", o: ["Moana", "Elsa", "Rapunzel", "Tiana"], a: 1 },
  { q: "¿De qué reino es Moana?", o: ["Arendelle", "Agrabah", "Motunui", "Corona"], a: 2 },
  { q: "¿Cómo se llama el dragón de Mulán?", o: ["Abu", "Mushu", "Pascal", "Sven"], a: 1 },
];

/* Fuentes de sobres. n = figus por sobre · dor = prob. de dorada ·
   once = se usa una sola vez. Pensado para jugar 100% desde el celu;
   la pantalla grande es un extra si está disponible. */
const SRC = {
  start:  { ic: "🎁", t: "Sobre de bienvenida",  d: "Tu sobre al entrar",                   n: 6, dor: 0.12, once: true },
  ig:     { ic: "📸", t: "Seguinos en Instagram", d: "@andro.show · +1 figu",               n: 1, dor: 0,    once: true },
  codigo: { ic: "🎤", t: "Canjear código",        d: "Entrevistas y sorpresas · +1 a +10",  n: 1, dor: 0.15 },
  carta:  { ic: "🃏", t: "Sobres escondidos",     d: "Buscalos por el salón · +2 c/u",      n: 2, dor: 0.2 },
  trivia: { ic: "🎬", t: "Trivia en pantalla",    d: "Extra · si la pantalla está activa",  n: 4, dor: 0.12, once: true },
  gift:   { ic: "🎁", t: "Sobre de regalo",       d: "Cae desde el Reino",                  n: 4, dor: 0.12 },
};
const CARTAS_MAX = 3; /* sobres físicos escondidos canjeables por persona */

/* Premios. Los principales desaparecen de la lista al entregarse;
   los 10 colgantes RGB bajan a medida que salen (5 van seguro con
   las cartas doradas). */
const PRIZES_MAIN = [
  { key: "camara",  g: "📷", nm: "Cámara instantánea", how: "Primer álbum completo de la noche" },
  { key: "reloj",   g: "🕛", nm: "Reloj Disney",       how: "Sorteo entre los álbumes completos" },
  { key: "peluche", g: "🧸", nm: "Peluche Disney",     how: "Ganador de la trivia" },
];
const SEC_TOTAL = 10; /* colgantes RGB Marti Disney */

/* Pesos de rareza para el pool de sobres.
   Épicas casi nunca: son el muro que obliga a cambiar. */
const RARITY_WEIGHT = { comun: 10, rara: 4, epica: 1 };

/* Estrella de rareza (esquina de la carta, como la figu impresa) */
const RARITY_STAR = { comun: "#c9d2e0", rara: "#f1a8c6", epica: "#f6dd99" };
const RARITY_LABEL = { comun: "Común", rara: "Rara", epica: "Épica" };
