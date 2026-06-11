# Figus del Reino · Los XV de Marti

Juego de figuritas coleccionables para la fiesta de XV de Marti. Web app móvil
(prototipo v2) donde cada invitado junta las 15 figus de Marti convertida en
princesa Disney, abriendo sobres y cambiando repetidas con el resto del salón.

## Cómo correrlo

Es un único archivo estático, sin dependencias ni build:

```bash
# opción 1: abrir directo
open index.html

# opción 2: servirlo local
python3 -m http.server 8000
# → http://localhost:8000
```

## Qué incluye el prototipo

- **Onboarding**: nombre + avatar, sin instalar nada (pensado para QR/pulsera).
- **Álbum**: 15 figus (comunes / raras / épicas) + 3 doradas de pura suerte.
- **Sobres**: bienvenida, código sorpresa por micrófono, trivia Disney y carta
  escondida en el salón. Las épicas casi no salen en sobres: el muro que
  obliga a cambiar.
- **Cambiar**: pedidos al salón ("se busca"), ofertas a otros invitados y
  canje directo cara a cara con código de 4 dígitos.
- **El Reino**: feed en vivo de la fiesta (simulado en esta demo).
- **Premios**: primera dorada de la noche → Reloj Disney; primer álbum
  completo → cámara de fotos + carta dorada en el Mercadito del Reino.

> Todo lo multiplayer (feed, pedidos, canjes) está simulado client-side en
> esta versión — es la maqueta de UX/UI para validar el flujo antes de
> conectar un backend real.
