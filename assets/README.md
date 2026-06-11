# Assets

Carpeta para el arte real del juego. La app funciona sin estos archivos
(usa fallbacks) y los levanta automáticamente cuando estén:

- **`logo.png`** — wordmark "MARTINA FIFTEEN" (original, recortado y
  optimizado a 600px / ~27 KB). Se usa en la pantalla de acceso y el
  onboarding. Si no carga, hay un fallback tipográfico.
- **`logo-m.png`** — trazo "M" del logo (original, 400px / ~9 KB). Se usa
  en el dorso de las cartas del reveal.
- **`logo-m.svg`** — la misma "M" en vector; variante sólida usada como
  sello de lacre del sobre (inline desde `js/app.js`).
- **`figus/`** — cartas completas (marco + número + nombre + arte) en
  vertical ~3:4, una por figu: `01.png` … `15.png` y las doradas
  `16.png`, `17.png`, `18.png`. Para activar una: poner el archivo acá
  y setear `img` en `js/data.js`:

  ```js
  { id: 1, g: "🐚", nm: "Marti Sirena", ..., img: "assets/figus/01.png" },
  ```

  La carta PNG cubre todo (el marco CSS queda de fallback si falla).
  Comprimir a <150 KB por imagen: en la fiesta van a cargar 200 celus
  con el wifi del salón.
