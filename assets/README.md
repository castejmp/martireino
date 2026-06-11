# Assets

Carpeta para el arte real del juego. La app funciona sin estos archivos
(usa fallbacks) y los levanta automáticamente cuando estén:

- **`logo.png`** — wordmark original "MARTINA FIFTEEN". Se muestra en la
  pantalla de acceso y el onboarding apenas exista el archivo. Mientras
  tanto se usa la recreación vectorial: la "M" de `logo-m.svg` + wordmark
  tipográfico en magenta.
- **`logo-m.svg`** — la "M" del logo recreada en vector (trazo a mano con
  degradé magenta→rosa). Se usa también en el dorso de las cartas y el
  sello del sobre (inline desde `js/app.js`).
- **`figus/`** — ilustraciones de las cartas (formato vertical ~3:4.2,
  como la figu impresa). Para activar una: poner el archivo acá
  (ej. `figus/01.jpg`) y setear la ruta en `js/data.js`:

  ```js
  { id: 1, g: "🐚", nm: "Marti Sirena", fm: "La Sirenita", r: "comun", img: "assets/figus/01.jpg" },
  ```

  Si la imagen falta o falla, la carta muestra el emoji como fallback.
  Comprimir a <100 KB por imagen: en la fiesta van a cargar 100 celus
  con el wifi del salón.
