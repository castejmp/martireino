# Assets

Carpeta para el arte real del juego. La app funciona sin estos archivos
(usa fallbacks) y los levanta automáticamente cuando estén:

- **`logo.png`** — logo de Marti XV. Se muestra en la pantalla de acceso y
  el onboarding apenas exista el archivo (mientras tanto se ve el
  monograma `M·XV`).
- **`figus/`** — ilustraciones de las cartas (formato vertical ~3:4.2,
  como la figu impresa). Para activar una: poner el archivo acá
  (ej. `figus/01.jpg`) y setear la ruta en `js/data.js`:

  ```js
  { id: 1, g: "🐚", nm: "Marti Sirena", fm: "La Sirenita", r: "comun", img: "assets/figus/01.jpg" },
  ```

  Si la imagen falta o falla, la carta muestra el emoji como fallback.
  Comprimir a <100 KB por imagen: en la fiesta van a cargar 100 celus
  con el wifi del salón.
