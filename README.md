# ★ Paquete OBS · Arma Reforger — Fuerzas Rusas

Gráficas en HTML para OBS con temática de las Fuerzas Rusas (USSR): stinger, intro, final, pausa, GC, mosca, picture in picture, marcador de Conflict, escuadra, alertas, ticker, contador de bajas con K.I.A. y pop-up de objetivo.

**Vista previa de todo:** https://simonrovi-web.github.io/arma-reforger-obs/

## Usar en OBS desde cualquier PC (sin descargar nada)

1. Abre la vista previa, pulsa **Copiar URL para OBS** en la gráfica que quieras.
2. En OBS: **Fuente → Navegador** → pega la URL. Ancho `1920`, alto `1080`.
3. Marca **"Actualizar navegador cuando la escena se active"** en GC, alerta, objetivo, intro y final para que se animen cada vez.

Los textos se cambian por URL, por ejemplo:

```
https://simonrovi-web.github.io/arma-reforger-obs/gc.html?nombre=ST.%20SGT.%20VOLKOV&tag=БЕРКУТ-1
```

## Panel de control (bajas y objetivos)

En OBS: **Docks → Docks de navegador personalizados** → URL `https://simonrovi-web.github.io/arma-reforger-obs/control.html`.
Desde ahí sumas bajas (K), lanzas el K.I.A. (M) y cambias el objetivo en directo.

## Stinger (transición)

OBS solo acepta vídeo para el Stinger: descarga [`render/stinger.webm`](render/stinger.webm) (con transparencia) y úsalo en **Transiciones → Stinger**, punto de transición **1000 ms**.
Si cambias el diseño, vuelve a generarlo con `render/render-stinger.bat` (necesita Node, ffmpeg y Chrome).

## Personalizar

Edita [`js/config.js`](js/config.js): nombre del canal, lema, redes, color de acento, logo y foto de fondo (`img/fondo.jpg`).

| Archivo | Qué es |
|---|---|
| `stinger.html` | Transición con camuflaje digital y estrella roja |
| `intro.html` / `final.html` / `pausa.html` | Pantallas completas con foto de fondo |
| `gc.html` | Rótulos: persona, ubicación, tema |
| `mosca.html` | Logo de esquina con EN VIVO y reloj |
| `pip.html` | Marco de cámara (`?modo=casco`, `?layout=dual`) |
| `marcador.html` | USSR vs US, puntos y bases (interactivo) |
| `escuadra.html` | Roster del отделение (interactivo) |
| `bajas.html` | Contador de bajas, rachas y pantalla K.I.A. |
| `objetivo.html` | Pop-up de objetivo + tracker en esquina |
| `alerta.html` / `ticker.html` | Alertas y faldón СВОДКА |
| `control.html` | Panel de control para dock de OBS |
