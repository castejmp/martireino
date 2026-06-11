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

## Juego (pensado 100% desde el celu)

- **Álbum**: 15 figus (Común ★ / Especial ★★ / Legendaria ★★★) + 3
  doradas de pura suerte (cada dorada gana un colgante RGB).
- **Sobres**: bienvenida (6 figus), seguir a Instagram @andro.show (+1),
  canje de códigos de entrevistas (+1/+3/+5/+10) y sobres físicos
  escondidos por el salón (+2 c/u, máx. 3). Reveal **de a una carta**
  con flip, brillo por rareza y confetti. Pity rule: un sobre nunca es
  todo repetidas al arrancar.
- Las **épicas casi no salen en sobres**: el muro que obliga a cambiar.
- **Cambiar**: pedidos al salón ("se busca"), ofertas, y canje cara a cara
  con código de 4 dígitos.
- **Premios** (pestaña dorada): 3 principales (cámara instantánea, reloj
  Disney, peluche) + 10 colgantes RGB que desaparecen al entregarse.
- **El Reino**: top 8 con barra de progreso + feed de la fiesta. Se
  sincroniza **al entrar a la sección** (modelo pull, sin tráfico de
  fondo, para economizar datos en el salón). **Cuenta**: perfil, stats,
  código de canje y opciones.
- **Sobre regalo**: el backend puede lanzar "recibís un sobre en 3:00" —
  aparece un contador sobre la barra y al llegar a cero se abre.

> Todo lo multiplayer (feed, canjes, sorteos) está **simulado client-side**:
> es la maqueta para validar UX antes del backend. Qué hace falta para la
> fiesta real (Supabase/Firebase, consola del DJ, pantalla grande, stock
> global de doradas): ver [docs/ANALISIS.md](docs/ANALISIS.md).
