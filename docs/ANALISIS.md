# Análisis técnico · Figus del Reino en la fiesta real

Cómo funciona (y qué falta) para que esto corra en un salón con 50–150
invitados la noche de los XV.

## 1. Identidad: la pulsera es la cuenta ✅ (implementado)

- Cada pulsera lleva un **QR único** → `martixv.com/5s44f2`. El invitado
  escanea y entra directo: **no se le pide código**, solo nombre y avatar
  o selfie.
- Sin QR a mano: pantalla de acceso pidiendo el **código impreso en la
  tarjeta** de la pulsera (mismo login después).
- El estado vive en `localStorage` **por código**: si el celu se bloquea,
  se cierra el navegador o se recarga, re-escanea el QR y retoma su álbum
  exactamente donde estaba. Sin contraseñas, sin app, sin fricción.
- La app acepta el código por **path** (`/5s44f2`), **query** (`?c=5s44f2`)
  o **hash** (`#5s44f2`), y lo limpia de la URL al entrar.

**Para producción:**
- Códigos **aleatorios no secuenciales** (6 chars base32 ≈ mil millones de
  combinaciones — no se adivinan), generados de antemano e impresos.
- El server valida el código contra la lista emitida; un código inválido
  no crea cuenta (hoy la demo acepta cualquier formato válido).
- Hosting estático: la ruta `/5s44f2` necesita un **rewrite a index.html**
  (Netlify `_redirects`, Vercel `rewrites`, Cloudflare Pages). En GitHub
  Pages, usar el QR con `?c=` o `#` que ya funcionan sin configurar nada.

## 2. Qué es simulación hoy y necesita backend

Todo lo "multiplayer" es teatro client-side: feed, pedidos del salón,
canje por código, sorteo de trivia y doradas. Para la fiesta real:

| Pieza | Por qué server-side |
|---|---|
| Canjes | Transacción atómica entre dos invitados; si no, se duplican figus |
| Doradas | Stock **global** (ver economía abajo) |
| Sobres / codewords / trivia | Los dispara la **consola del DJ** con ventana de tiempo |
| Feed | Eventos reales de todos, broadcast |

**Recomendación:** Supabase (Postgres + Realtime) o Firebase RTDB. 150
conexiones WebSocket simultáneas es carga trivial; el costo es ~cero.
Tablas mínimas: `guests` (code, name, avatar), `albums` (guest, fig, qty),
`trades` (estado de cada canje), `events` (feed), `drops` (sobres
habilitados por la consola).

Falta construir la **consola admin** (celu del DJ u organizador): botón
"soltar sobre a todos", "activar codeword FROZEN por 60s", "ronda de
trivia", "soltar dorada". Y la **vista pantalla grande**: feed gigante +
"SE BUSCA" con los pedidos.

## 3. Economía del juego

- 4 sobres × 4–5 figus ≈ **17 figus por invitado** para 15 necesarias, con
  repetidas → el muro de intercambio funciona (las épicas con peso 1 casi
  no salen: se consiguen cambiando).
- **Pity rule** (implementada): un sobre nunca es 100% repetidas mientras
  el álbum arranca (mínimo 3 nuevas en el de bienvenida, 1 hasta tener 10).
  Sin esto, un sobre todo-repetidas a las 22:30 mata el entusiasmo.
- ⚠️ **Doradas**: con 18–35% por sobre, en 100 invitados salen ~80 doradas
  y "la primera dorada gana el Reloj" se define en los primeros 5 minutos.
  En el evento real el server debe soltar doradas **a horarios elegidos**
  (ej: una por hora) — la probabilidad local es solo para la demo.
- Invitados que llegan tarde o pierden rondas: el DJ debe tener códigos de
  sobre extra para repartir a mano.

## 4. Condiciones reales del salón

- **Conectividad mala** (wifi saturado, 4G en sótano): la app ya es
  offline-first en estado; con backend, encolar mutaciones y sincronizar al
  reconectar. Nunca bloquear la UI esperando red.
- **Picos**: cuando Marti dice el codeword, todos abren a la vez →
  servir estático desde CDN, fuentes con `preconnect` (ya está),
  ilustraciones comprimidas (<100 KB c/u) y precargadas al entrar.
- **Selfies**: se reducen a 128px JPEG en el dispositivo antes de guardar
  (ya implementado) — no subir fotos crudas de 12 MP.

## 5. Próximos pasos sugeridos (en orden)

1. **Assets reales**: logo en `assets/logo.png` y las 15 ilustraciones en
   `assets/figus/` (la app las levanta sola seteando `img` en `js/data.js`).
2. **Backend mínimo** en Supabase + reemplazar el simulador (feed/trades).
3. **Consola DJ + vista pantalla grande.**
4. **QA real**: 10 celulares distintos (iOS Safari sobre todo), wifi malo,
   pantalla bloqueada a mitad de un sobre.
