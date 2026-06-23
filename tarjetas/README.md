# Generador de tarjetas Martina XV

Sub-app para procesar los 200 QR del Drive y generar las tarjetas para
imprenta — doble cara, frente con nombre/QR/instrucciones, dorso con la
carta de la película de su mesa.

**URL:** `https://castejmp.github.io/martireino/tarjetas/`

## Cómo se usa

1. Descargar la carpeta de QR del Drive como ZIP y descomprimir.
2. Abrir la web → arrastrar los 200 PNG al recuadro.
3. Editar el textarea `Mesa → Película` si los números cambiaron.
4. Vista previa de la primera tarjeta.
5. **Generar para imprenta** → abre el diálogo de impresión del navegador.
   Elegí "Guardar como PDF" (Cmd/Ctrl+P) o mandalo directo a la impresora
   a **doble cara con flip por borde largo**. Cada lote es: 1 hoja de
   frentes + 1 hoja de dorsos, alineados para que casen al imprimir.
6. Opcional: **Descargar PNG individuales (ZIP)** para reimprimir tarjetas
   sueltas o mandar por WhatsApp.

## Formato de filename esperado

```
qr-NOMBRE_APELLIDO-MESA_N.png
```

El parser convierte `qr-ADRIANA_MIGNOLA-MESA_10` → "Adriana Mignola",
mesa 10. Si algún archivo no matchea, queda listado abajo del drop zone.

## Mesa → Película

Una línea por mesa con el formato:

```
numero: Nombre película | rareza
```

`rareza` es opcional, default `comun`. Valores válidos: `comun`, `rara`,
`epica`, `dorada`. La rareza define qué marco se usa en el dorso de la
tarjeta (los mismos 4 marcos que usa la app del juego).

## Privacidad

Todo se procesa **en el navegador**: los QR no suben a ningún servidor,
no quedan registrados, no se mandan a Google. La web es estática (HTML
+ CSS + JS) y funciona offline una vez cargada.
