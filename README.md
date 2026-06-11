# Figus del Reino · Los XV de Marti

Juego de figuritas coleccionables para la fiesta de XV de Marti. Web app
móvil donde cada invitado entra con el **QR de su pulsera**, junta las 15
figus de Marti convertida en princesa Disney abriendo sobres, y cierra el
álbum **cambiando repetidas** con el resto del salón.

## Cómo correrlo

Estático puro, sin build ni dependencias:

```bash
python3 -m http.server 8000
# → http://localhost:8000           (pide código de pulsera, o botón demo)
# → http://localhost:8000/?c=5s44f2 (simula entrar escaneando el QR)
```

## Estructura

```
index.html        shell de la app
css/styles.css    estilos y animaciones
js/data.js        figus, doradas, trivia, sobres (acá se enchufa el arte real)
js/app.js         pantallas, estado, persistencia y lógica de juego
assets/           logo y arte de cartas (ver assets/README.md)
docs/ANALISIS.md  análisis técnico para el evento real
```

## Flujo de acceso

1. **Con QR de pulsera** (`martixv.com/5s44f2`, `?c=5s44f2` o `#5s44f2`):
   entra directo, sin tipear código.
2. **Sin QR**: pantalla de acceso pidiendo el código impreso en la tarjeta.
3. Onboarding: nombre + avatar **o selfie** (se recorta y comprime en el
   dispositivo).
4. La pulsera es la cuenta: el progreso se guarda por código en
   `localStorage` — recargar, bloquear el celu o re-escanear el QR retoma
   el álbum donde estaba.

## Juego

- **Álbum**: 15 figus (comunes/raras/épicas) + 3 doradas de pura suerte.
- **Sobres**: bienvenida, código sorpresa por micrófono, trivia Disney y
  carta escondida. Reveal **de a una carta** con flip, brillo por rareza y
  confetti. Pity rule: un sobre nunca es todo repetidas al arrancar.
- Las **épicas casi no salen en sobres**: el muro que obliga a cambiar.
- **Cambiar**: pedidos al salón ("se busca"), ofertas, y canje cara a cara
  con código de 4 dígitos.
- **El Reino**: feed en vivo de la fiesta.
- **Premios**: primera dorada → Reloj Disney; primer álbum completo →
  cámara de fotos + carta dorada en el Mercadito del Reino.

> Todo lo multiplayer (feed, canjes, sorteos) está **simulado client-side**:
> es la maqueta para validar UX antes del backend. Qué hace falta para la
> fiesta real (Supabase/Firebase, consola del DJ, pantalla grande, stock
> global de doradas): ver [docs/ANALISIS.md](docs/ANALISIS.md).
