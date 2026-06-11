/* =====================================================
   Figus del Reino · datos del juego
   Cada carta va a ser un PNG completo (marco + número +
   nombre + arte): cuando esté, poné la ruta en `img`
   (ej: img:"assets/figus/01.png") y la app la usa a
   pantalla completa. Si falta, se dibuja el marco en CSS.
   `d` = brief para generar el arte de cada una.
   ===================================================== */

const FIGS = [
  { id: 1,  g: "🐚", nm: "Marti Sirena",            fm: "Océano y perlas",        d: "Inspiración océano, perlas, peces tropicales",        r: "comun", img: null },
  { id: 2,  g: "❄️", nm: "Marti de Nieve",          fm: "Copos y nieve",          d: "Copos flotando, nieve brillante",                     r: "comun", img: null },
  { id: 3,  g: "🌺", nm: "Marti Navegante",         fm: "Mar e islas",            d: "Mar, islas, flores tropicales",                       r: "comun", img: null },
  { id: 4,  g: "🗡️", nm: "Marti Guerrera",          fm: "Viento y pétalos",       d: "Aventura oriental, viento y pétalos",                 r: "comun", img: null },
  { id: 5,  g: "🪔", nm: "Marti del Desierto",      fm: "Lámparas y dunas",       d: "Lámparas, dunas, estrellas",                          r: "comun", img: null },
  { id: 6,  g: "🌹", nm: "Marti Encantada",         fm: "Rosas y castillo",       d: "Rosas, biblioteca, castillo elegante",                r: "comun", img: null },
  { id: 7,  g: "👠", nm: "Marti de Cristal",        fm: "Baile y destellos",      d: "Baile, escalinata, destellos",                        r: "comun", img: null },
  { id: 8,  g: "💜", nm: "Marti de la Torre",       fm: "Flores y linternas",     d: "Flores violetas, linternas, cabello al viento",       r: "comun", img: null },
  { id: 9,  g: "🍎", nm: "Marti del Bosque Encantado", fm: "Bosque encantado",    d: "Bosque encantado, manzanas",                          r: "rara",  img: null },
  { id: 10, g: "🌿", nm: "Marti Aurora",            fm: "Amanecer mágico",        d: "Amanecer en el bosque",                               r: "rara",  img: null },
  { id: 11, g: "🍃", nm: "Marti del Viento",        fm: "Hojas al viento",        d: "Hojas y viento, naturaleza",                          r: "rara",  img: null },
  { id: 12, g: "🏹", nm: "Marti Valiente",          fm: "Arco y aventura",        d: "Arco, aventura, bosque escocés",                      r: "rara",  img: null },
  { id: 13, g: "🐸", nm: "Marti del Pantano Mágico", fm: "Luciérnagas y lirios",  d: "Pantano mágico, luciérnagas, lirios",                 r: "rara",  img: null },
  { id: 14, g: "🦋", nm: "Marti de las Mariposas",  fm: "Mariposas doradas",      d: "Mariposas, flores doradas",                           r: "epica", img: null },
  { id: 15, g: "🖤", nm: "Marti Oscura Glam",       fm: "Glam oscuro",            d: "Glam oscuro, elegancia",                              r: "epica", img: null },
];

/* Doradas: numeradas a continuación del álbum (16, 17, 18) */
const GOLD = [
  { g: "👑", nm: "Marti Marina",      img: null },
  { g: "🤍", nm: "Marti con Amigas",  img: null },
  { g: "✨", nm: "Marti en Bs. As.",  img: null },
];

const AVATARS = [
  { g: "👑", n: "Princesa" }, { g: "🧚", n: "Hada" },     { g: "🦋", n: "Mariposa" }, { g: "🌹", n: "Rosa" },
  { g: "🐉", n: "Dragón" },   { g: "🦢", n: "Cisne" },    { g: "⭐", n: "Estrella" }, { g: "🏰", n: "Castillo" },
];

const GUESTS = ["Sofi", "Tomi", "Juli", "Cande", "Nacho", "Valen", "Mía", "Benja", "Lola", "Fran"];

/* Fuentes de sobres. n = figus por sobre · dor = prob. de dorada ·
   once = se usa una sola vez. Pensado para jugar 100% desde el celu. */
const SRC = {
  start:  { ic: "🎁", t: "Sobre de bienvenida",  d: "Tu sobre al entrar",                   n: 6, dor: 0.12, once: true },
  ig:     { ic: "📸", t: "Seguinos en Instagram", d: "@andro.show · +1 figu",               n: 1, dor: 0,    once: true },
  codigo: { ic: "🎤", t: "Canjear código",        d: "Entrevistas y sorpresas · +1 a +10",  n: 1, dor: 0.15 },
  carta:  { ic: "🃏", t: "Sobres escondidos",     d: "Buscalos por el salón · +2 c/u",      n: 2, dor: 0.2 },
  gift:   { ic: "🎁", t: "Sobre de regalo",       d: "Cae desde el Reino",                  n: 4, dor: 0.12 },
};
const CARTAS_MAX = 3; /* sobres físicos escondidos canjeables por persona */

/* Premios principales: se entregan por orden de álbum completo
   (1º, 2º y 3º). Al entregarse quedan en gris con su ganador.
   Los 10 colgantes RGB bajan a medida que salen (las 5 cartas
   doradas se llevan uno seguro). */
const PRIZES_MAIN = [
  { key: "camara",  g: "📷", nm: "Cámara de fotos", how: "1º en completar el álbum" },
  { key: "reloj",   g: "🕛", nm: "Reloj Disney",    how: "2º en completar el álbum" },
  { key: "peluche", g: "🧸", nm: "Peluche Disney",  how: "3º en completar el álbum" },
];
const SEC_TOTAL = 10; /* colgantes RGB Marti Disney */

/* Pesos de rareza para el pool de sobres.
   Épicas casi nunca: son el muro que obliga a cambiar. */
const RARITY_WEIGHT = { comun: 10, rara: 4, epica: 1 };

/* Rarezas según los marcos impresos:
   Común ★ (marfil+dorado) · Especial ★★ (lila+plata) ·
   Legendaria ★★★ (violeta+oro) · Dorada ★★★★ (foil) */
const RARITY_LABEL = { comun: "Común", rara: "Especial", epica: "Legendaria", dorada: "Dorada" };
const RARITY_STARS = { comun: 1, rara: 2, epica: 3, dorada: 4 };
const RARITY_STAR = { comun: "#e8d8ad", rara: "#bfe6d4", epica: "#c79bff", dorada: "#f6dd99" };

/* Marcos reales escaneados (assets/frames/). El sello de rareza y el
   "Colección de Aventuras" vienen impresos en el marco; la app solo
   superpone número y nombre. Si el archivo falta, cae al marco CSS. */
const RARITY_FRAME = {
  comun:  "assets/frames/comun.jpg",
  rara:   "assets/frames/especial.jpg",
  epica:  "assets/frames/legendaria.jpg",
  dorada: "assets/frames/oro.jpg",
};
