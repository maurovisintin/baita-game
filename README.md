# La Leggenda della Baita della Figata del Mondo

Avventura punta-e-clicca in pixel art (stile anni '90, interfaccia a 9 verbi) ambientata in una baita di montagna.
Gioco web in HTML5 Canvas, senza dipendenze né build: gira su desktop e su telefono in orizzontale.

I protagonisti sono **Kodo e i suoi amici** (Defi, Ghiaccio, Orka, Sprus, Iron, Zac, Gus, Pepi, Lele, Menion, Jackal, Chino, Biz), disegnati in pixel art dalle foto: all'inizio di ogni capitolo si sceglie con chi giocare, gli altri restano in scena.
Alla baita li aspetta **Luciano**, che compare solo all'inizio e alla fine (e chiude ogni conversazione con "Mandi").
In ogni stanza della baita c'è **Latenar** che dorme: se gli chiedi qualcosa, "Sto riposando gli occhi".

La storia, in nove capitoli:

1. **La legna** (parcheggio): Defi, Chino, Lele, Kodo, Menion o Ghiaccio. Motosega, benzina e legna tagliata. *Fatto.*
2. **La ventola del caminetto** (portico, di giorno): solo Defi, con Iron di supporto tecnico. *Fatto.*
3. **La notte dell'orrido** (guado Pepi e orrido Rascie): Kodo, Lele, Menion o Ghiaccio. Travi, frontali, arachidi di Halloween e discorsi sui giovani. *Fatto.*
4. **Il cesso della dépendance**: solo Chino, alle prese col water intasato e coi ghiri. *Fatto.*
5. **Il portico delle costine** (portico, di sera): Kodo, con Zac (accendino) e Chino (musica) di supporto. Barbecue, costine e una cassa di Guinness. *Fatto.*
6. **La cena dei sessantaquattro gradi** (salone): tutti. *In arrivo.*
7. **Tempo di crisi** (salone): videogiochi e giochi da tavolo, tutti. *In arrivo.*
8. **I tappi per le orecchie** (camerata): tutti. *In arrivo.*
9. **Mandi**: colazione, bagagli in macchina e saluto di Luciano, tutti. *In arrivo.*

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
Nel menu dev si cambia anche il personaggio. Da tastiera: tasti `1`–`8` per le stanze, `N` per giorno/notte. In questa modalità la partita salvata non viene toccata.

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
js/rooms/dependance.js  la dépendance (il bagnetto col water intasato)
js/aiuto.js             pulsante aiuto (lampadina) e modalità dev
js/personaggi.js        i 15 personaggi (look dalle foto), comparse, Latenar, scelta del personaggio
js/amici.js             gli amici nelle scene di gruppo (guado e orrido)
js/portrait-data.js     ritratto pixelato del protagonista (titolo)
```

Per aggiungere una stanza: crea `js/rooms/<nome>.js` con lo stesso schema delle altre
(`walk`, `scaleAt`, `init`, `drawBack`, `objects`, `update`, `hotspots`, e per la notte `darkness` e `lights`),
registrala in `ROOMS` e caricala in `index.html`. Con `title`, `spawn` e `links` (stanza vicina → uscita) compare nel menu dev e l'aiuto sa come arrivarci. Per spostarsi da una stanza all'altra: `goToRoom(ROOMS.x, posX, posY, direzione)`.

## Soluzione (spoiler)

<details>
<summary>Mostra</summary>

**Capitolo 1 — La legna**
1. Parla con Luciano (notizie catastrofiche, indizi, "Mandi"). Le chiavi della Punto restano sul tavolo.
2. La chiave della baracca l'ha nascosta un ghiro nel buco del noce: raccogli una noce sotto l'albero e dalla al ghiro.
3. Usa la chiave con la baracca e raccogli motosega, casco e olio.
4. Raccogli la tanica dalla Ypsilon, tira il tubo dell'acqua, prendi le chiavi dal tavolo.
5. Usa la tanica con la Punto (apre il tappo, infila il tubo e travasa da solo).
6. Usa la tanica con la motosega (aggiunge l'olio da solo), poi la motosega con i tronchi.

**Capitolo 2 — La ventola del caminetto**
1. Apri i mobiletti del portico: c'è il cacciavite (lo spray te lo dà Iron).
2. Vai nella stanza del caminetto (portico → salone → caminetto) e usa il cacciavite con la griglia della ventola.
3. Raccogli i gusci di noce del ghiro, poi usa lo spray con la ventola.
4. Usa la legna con il caminetto.

**Capitolo 3 — La notte dell'orrido**
1. Usa la frontale.
2. Tira il mucchio di rami → raccogli la trave. Raccogli il ramo lungo appoggiato all'albero.
3. Usa il ramo con la trave nel torrente → raccogli la trave bagnata.
4. Usa le due travi con il guado → attraversa e prendi il sentiero per l'orrido.
5. All'orrido: usa la frontale (si accendono tutte), poi dai le arachidi di Halloween agli amici.

**Capitolo 4 — Il cesso della dépendance**
1. Raccogli i guanti di gomma appesi alla doccia.
2. Apri il mobiletto sotto il lavandino: c'è un ghiro sopra lo sturalavandini. Usa il crocifisso con il ghiro.
3. Raccogli lo sturalavandini e usalo con il water, poi tira lo sciacquone.

**Capitolo 5 — Il portico delle costine**
1. Usa il barbecue piegato contro il muro per montarlo.
2. Apri i mobiletti (sacco di carbonella) e usa la carbonella con il barbecue.
3. Parla con Zac (ti dà l'accendino) e usa l'accendino con il barbecue.
4. Parla con Chino: mette la musica e la brace si sveglia.
5. Usa le costine con il barbecue, raccogli la cassa di Guinness e usala.

</details>
