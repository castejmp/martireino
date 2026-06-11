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
  { g: "✨", nm: "Marti Reina" },
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

const CODEWORDS = ["FROZEN", "MOANA", "STITCH", "AURORA", "ENCANTO"];

/* Fuentes de sobres. n = figus por sobre · dor = prob. de dorada.
   En la fiesta real estos eventos los dispara la pantalla grande /
   consola del DJ; acá se simulan con un tap. */
const SRC = {
  start:  { ic: "🎁", t: "Sobre de bienvenida", d: "Tu único sobre al entrar",        n: 5, dor: 0.18 },
  codigo: { ic: "📣", t: "Código sorpresa",     d: "Marti dice una palabra por mic",  n: 4, dor: 0.18 },
  trivia: { ic: "💡", t: "Trivia Disney",       d: "Acertá y entrá al sorteo",        n: 4, dor: 0.18 },
  carta:  { ic: "🃏", t: "Carta escondida",     d: "Buscala por el salón",            n: 4, dor: 0.35 },
};

/* Pesos de rareza para el pool de sobres.
   Épicas casi nunca: son el muro que obliga a cambiar. */
const RARITY_WEIGHT = { comun: 10, rara: 4, epica: 1 };

/* Estrella de rareza (esquina de la carta, como la figu impresa) */
const RARITY_STAR = { comun: "#c9d2e0", rara: "#f1a8c6", epica: "#f6dd99" };
const RARITY_LABEL = { comun: "Común", rara: "Rara", epica: "Épica" };
