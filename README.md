# La Leggenda della Baita

Avventura punta-e-clicca in pixel art (stile anni '90, interfaccia a 9 verbi) ambientata in una baita di montagna.
Gioco web in HTML5 Canvas, senza dipendenze né build: gira su desktop e su telefono in orizzontale.

**Capitolo 1 — Il Richiamo della Motosega**: Brum deve trovare motosega e benzina e tagliare la legna, altrimenti niente grigliata.

## Come giocare

Apri `index.html` nel browser, oppure servi la cartella:

```bash
python3 -m http.server 8765
```

poi vai su http://localhost:8765 (dal telefono: `http://<ip-del-mac>:8765`).

| | Desktop | Mobile (orizzontale) |
|---|---|---|
| Camminare | clic sul terreno | tocco sul terreno |
| Azione | scegli un verbo, poi clic sull'oggetto | scegli un verbo, poi tocca l'oggetto |
| Azione rapida | clic destro sull'oggetto | tocco sull'oggetto senza verbo |
| Guardare | clic destro (sugli oggetti dell'inventario) | pressione lunga |
| Mostra oggetti | `H` o pulsante `?` | pulsante `?` |
| Salta dialogo | clic / spazio / `.` | tocco |
| Menu | `Esc` o `☰` | `☰` |
| Audio on/off | `M` | dal menu |

La partita si salva da sola nel browser (localStorage).

## Struttura

```
index.html              pagina + avviso "ruota il telefono"
js/core.js              canvas 320x200, pixel buffer, rumore, testo, input mouse/touch
js/audio.js             effetti e musica sintetizzati (WebAudio)
js/sprites.js           Brum, Gino, la gazza (disegnati pixel per pixel)
js/items.js             oggetti dell'inventario, icone, combinazioni
js/engine.js            verbi, inventario, dialoghi, pathfinding, script, salvataggi, titolo/finale
js/rooms/parcheggio.js  stanza 1: sfondo, oggetti, hotspot, enigmi
js/portrait-data.js     ritratto pixelato del protagonista (titolo)
```

Per aggiungere una stanza: crea `js/rooms/<nome>.js` con lo stesso schema di `ROOM_PARCHEGGIO`
(`walk`, `scaleAt`, `init`, `drawBack`, `objects`, `update`, `hotspots`) e caricala in `index.html`.

## Soluzione (spoiler)

<details>
<summary>Mostra</summary>

1. Spingi i pannelli isolanti → raccogli la scala.
2. Usa la scala con il noce → nel nido della gazza c'è la chiave della baracca.
3. Usa la chiave con la baracca → raccogli motosega, casco e olio.
4. Raccogli la tanica dal bagagliaio della Ypsilon. Tira il tubo dell'acqua.
5. Chiedi la benzina a Gino e dagli le costine → ti dà le chiavi della Punto.
6. Usa le chiavi con la Punto, poi il tubo con la Punto, poi la tanica con la Punto.
7. Usa l'olio con la tanica (miscela), poi la tanica con la motosega.
8. Usa la motosega con i tronchi di betulla.

</details>
