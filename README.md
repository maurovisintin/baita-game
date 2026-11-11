# La Leggenda della Baita

Avventura punta-e-clicca in pixel art (stile anni '90, interfaccia a 9 verbi) ambientata in una baita di montagna.
Gioco web in HTML5 Canvas, senza dipendenze né build: gira su desktop e su telefono in orizzontale.

Il protagonista è **Kodo**. Alla baita lo aspetta **Luciano**, che compare solo all'inizio e alla fine (e chiude ogni conversazione con "Mandi").

- **Capitolo 1 — Il Richiamo della Motosega** (giorno, parcheggio della baita): trovare motosega e benzina e tagliare la legna.
- **Capitolo 2 — La notte dell'orrido** (notte): attraversare il guado Pepi costruendo un passaggio con delle travi, arrivare all'orrido Rascie, poi tornare alla baita dove Luciano chiede se siete stati a camminare.

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
js/sprites.js           Kodo, Luciano, la gazza, il ghiro (disegnati pixel per pixel)
js/items.js             oggetti dell'inventario, icone, combinazioni
js/engine.js            verbi, inventario, dialoghi, pathfinding, script, salvataggi, titolo/finale
js/rooms/parcheggio.js  capitolo 1 (giorno) + finale notturno alla baita
js/rooms/guado.js       capitolo 2: il guado Pepi (notte)
js/rooms/orrido.js      capitolo 2: l'orrido Rascie (notte)
js/portrait-data.js     ritratto pixelato del protagonista (titolo)
```

Per aggiungere una stanza: crea `js/rooms/<nome>.js` con lo stesso schema delle altre
(`walk`, `scaleAt`, `init`, `drawBack`, `objects`, `update`, `hotspots`, e per la notte `darkness` e `lights`),
registrala in `ROOMS` e caricala in `index.html`. Per spostarsi da una stanza all'altra: `goToRoom(ROOMS.x, posX, posY, direzione)`.

## Soluzione (spoiler)

<details>
<summary>Mostra</summary>

**Capitolo 1**
1. Parla con Luciano (notizie catastrofiche, indizi, "Mandi"). Le chiavi della Punto restano sul tavolo.
2. Spingi i pannelli isolanti → raccogli la scala → usa la scala con il noce: nel nido della gazza c'è la chiave della baracca.
3. Usa la chiave con la baracca. Sulla motosega c'è un ghiro: raccogli una noce sotto il noce e dagliela.
4. Raccogli motosega, casco e olio. Raccogli la tanica dalla Ypsilon, tira il tubo dell'acqua, prendi le chiavi dal tavolo.
5. Usa le chiavi con la Punto, poi il tubo con la Punto, poi la tanica con la Punto.
6. Usa l'olio con la tanica (miscela), poi la tanica con la motosega, poi la motosega con i tronchi.

**Capitolo 2**
1. Usa la frontale.
2. Tira il mucchio di rami → raccogli la trave. Raccogli il ramo lungo appoggiato all'albero.
3. Usa il ramo con la trave nel torrente → raccogli la trave bagnata.
4. Usa le due travi con il guado → attraversa e prendi il sentiero per l'orrido.
5. All'orrido la frontale muore: usa il telefono (torcia), poi usa il telefono con l'orrido (selfie).

</details>
