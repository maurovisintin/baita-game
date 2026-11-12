# La Leggenda della Baita della Figata del Mondo

Avventura punta-e-clicca in pixel art (stile anni '90, interfaccia a 9 verbi) ambientata in una baita di montagna.
Gioco web in HTML5 Canvas, senza dipendenze né build: gira su desktop e su telefono in orizzontale.

Il protagonista è **Kodo**, con i suoi amici. Alla baita li aspetta **Luciano**, che compare solo all'inizio e alla fine (e chiude ogni conversazione con "Mandi").

La storia, in sette capitoli:

1. **Il Richiamo della Motosega** (parcheggio, di giorno): motosega e benzina, tagliare la legna, portarla dentro e accendere il caminetto. *Fatto.*
2. **La notte dell'orrido**: il guado Pepi (trovare e posare le travi), poi l'orrido Rascie: frontali accese, arachidi di Halloween della Lidl e discorsi sui giovani d'oggi. *Fatto.*
3. **Il portico delle costine** (portico, di sera): preparare il barbecue, accendere la carbonella, mettere le costine, scolarsi una cassa di Guinness. *In arrivo.*
4. **La cena dei sessantaquattro gradi** (salone): cena tutti insieme e degustazione di rum, moonshine e gin a 64 gradi. *In arrivo.*
5. **Tempo di crisi** (salone): il gioco con le pistole in coop e i personaggi da sbloccare nel picchiaduro. *In arrivo.*
6. **Nanna in camerata**. *In arrivo.*
7. **Mandi**: risveglio, colazione e saluto di Luciano. *In arrivo.*

Le stanze della baita (portico, salone, stanza del caminetto, camerata) hanno una versione di giorno e una di notte.

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
| Aiuto (evidenzia la prossima azione) | `A` o la lampadina | la lampadina |
| Salta dialogo | clic / spazio / `.` | tocco |
| Menu | `Esc` o `☰` | `☰` |
| Audio on/off | `M` | dal menu |

La partita si salva da sola nel browser (localStorage).

### Modalità dev (per controllare le stanze)

Aggiungi `?dev` all'indirizzo, ad esempio https://maurovisintin.github.io/baita-game/?dev.
Sul titolo compare **Esplora le stanze (dev)**, e nel menu ☰ la voce **Stanze (dev)…**: si salta in qualsiasi stanza e si alterna giorno/notte.
Da tastiera: tasti `1`–`7` per le stanze, `N` per giorno/notte. In questa modalità la partita salvata non viene toccata.

## Struttura

```
index.html              pagina + avviso "ruota il telefono"
js/core.js              canvas 320x200, pixel buffer, rumore, testo, input mouse/touch
js/audio.js             effetti e musica sintetizzati (WebAudio)
js/sprites.js           Kodo, Luciano, il ghiro (disegnati pixel per pixel)
js/items.js             oggetti dell'inventario, icone, combinazioni
js/engine.js            verbi, inventario, dialoghi, pathfinding, script, salvataggi, titolo/finale
js/rooms/parcheggio.js  capitolo 1 (giorno) + finale notturno alla baita
js/rooms/guado.js       capitolo 2: il guado Pepi (notte)
js/rooms/orrido.js      capitolo 2: l'orrido Rascie (notte)
js/rooms/interni.js     strumenti comuni: perlinato, cotto, stucco, pizzo, porte, giorno/notte
js/rooms/portico.js     il portico della baita (accanto al parcheggio)
js/rooms/salone.js      il salone (corna di cervo, tavolone, angolo TV, scale)
js/rooms/caminetto.js   la stanza del caminetto
js/rooms/camerata.js    la camerata nel sottotetto
js/aiuto.js             pulsante aiuto (lampadina) e modalità dev
js/amici.js             gli amici di Kodo (per ora sagome con la frontale)
js/portrait-data.js     ritratto pixelato del protagonista (titolo)
```

Per aggiungere una stanza: crea `js/rooms/<nome>.js` con lo stesso schema delle altre
(`walk`, `scaleAt`, `init`, `drawBack`, `objects`, `update`, `hotspots`, e per la notte `darkness` e `lights`),
registrala in `ROOMS` e caricala in `index.html`. Con `title`, `spawn` e `links` (stanza vicina → uscita) compare nel menu dev e l'aiuto sa come arrivarci. Per spostarsi da una stanza all'altra: `goToRoom(ROOMS.x, posX, posY, direzione)`.

## Soluzione (spoiler)

<details>
<summary>Mostra</summary>

**Capitolo 1**
1. Parla con Luciano (notizie catastrofiche, indizi, "Mandi"). Le chiavi della Punto restano sul tavolo.
2. La chiave della baracca l'ha nascosta un ghiro nel buco del noce: raccogli una noce sotto l'albero e dalla al ghiro.
3. Usa la chiave con la baracca e raccogli motosega, casco e olio.
4. Raccogli la tanica dalla Ypsilon, tira il tubo dell'acqua, prendi le chiavi dal tavolo.
5. Usa la tanica con la Punto (apre il tappo, infila il tubo e travasa da solo).
6. Usa la tanica con la motosega (aggiunge l'olio da solo), poi la motosega con i tronchi: Kodo prende la legna.
7. Vai al portico (a sinistra del parcheggio), poi salone, poi stanza del caminetto: usa la legna con il caminetto.

**Capitolo 2**
1. Usa la frontale.
2. Tira il mucchio di rami → raccogli la trave. Raccogli il ramo lungo appoggiato all'albero.
3. Usa il ramo con la trave nel torrente → raccogli la trave bagnata.
4. Usa le due travi con il guado → attraversa e prendi il sentiero per l'orrido.
5. All'orrido: usa la frontale (si accendono tutte), poi dai le arachidi di Halloween agli amici.

</details>
