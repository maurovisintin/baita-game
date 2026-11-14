'use strict';
/* =========================================================
   AIUTO (pulsante lampadina): prima un indizio, poi evidenzia la prossima azione
   MODALITÀ DEV (?dev nell'indirizzo): vai a qualsiasi capitolo
   ========================================================= */
const DEV = /[?&#]dev\b/i.test(location.search + location.hash);
const HINT_BTN = [246, 0, 24, 15];

/* ---------- la prossima mossa della storia ---------- */
function storyHint() {
  const f = Game.flags, has = hasItem, n = Game.chapter || 1;
  if (f.finale) return null;
  if (n === 5) {
    if (f.arachidiDone) return null;
    if (!f.beam2) {
      const G = o => Object.assign({ room: 'guado' }, o);
      if (!f.lampOn && !f.orridoSeen) return G({ verb: 'usa', item: 'frontale', clue: 'È buio pesto. Qualcuno ha portato una luce da mettersi in testa?' });
      if (!f.branchesMoved) return G({ hs: 'ramaglia', verb: 'tira', clue: 'Per passare il guado servono travi. Quel mucchio di rami nasconde qualcosa.' });
      if (!f.trave1Taken) return G({ hs: 'trave1', verb: 'raccogli', clue: 'Sotto i rami c\'era una trave. Portala con te.' });
      if (has('trave1') || has('trave2')) return G({ hs: 'torrente', verb: 'usa', item: has('trave1') ? 'trave1' : 'trave2', clue: 'Una trave in mano e un torrente davanti: mettila dove serve il ponte.' });
      if (!f.ramoTaken) return G({ hs: 'ramo', verb: 'raccogli', clue: 'Una trave è finita in acqua. Per arrivarci serve qualcosa di lungo: guarda vicino agli alberi.' });
      if (!f.beamHooked) return G({ hs: 'traveAcqua', verb: 'usa', item: 'ramo', clue: 'Col ramo lungo arrivi fino alla trave che galleggia.' });
      return G({ hs: 'traveAcqua', verb: 'raccogli', clue: 'La trave è agganciata. Tirala fuori dall\'acqua.' });
    }
    if (!f.frontaliOn) return { room: 'orrido', verb: 'usa', item: 'frontale', clue: 'All\'orrido è buio e siete in tanti. E se si accendessero tutte le frontali?' };
    return { room: 'orrido', hs: 'amici', verb: 'dai', item: 'arachidi', clue: 'Gli amici hanno fame. E tu hai in tasca qualcosa di Halloween.' };
  }
  if (n === 10) {
    if (f.salutato) return null;
    if (!f.briocheMangiata) return { room: 'portico', hs: 'brioche', verb: 'raccogli', clue: 'Prima di partire, colazione. Jackal ha portato qualcosa di buono sul tavolo del portico.' };
    if (!f.autoCaricata) return has('bagagli') ? { room: 'parcheggio', hs: 'ypsilon', verb: 'usa', item: 'bagagli', clue: 'I bagagli vanno in macchina. Quella col bagagliaio più paziente.' } : { room: 'portico', hs: 'bagagli', verb: 'raccogli', clue: 'Si torna a casa: i bagagli sono ammucchiati vicino alla porta del portico.' };
    return { room: 'parcheggio', hs: 'lucianoHs', verb: 'parla', clue: 'Luciano è arrivato al parcheggio. Non si parte senza salutarlo.' };
  }
  if (n === 9) {
    const K = o => Object.assign({ room: 'camerata' }, o), R = Game.roles || {};
    if (f.tappiUsati) return null;
    if (!f.chiestoTappi) return K({ hs: 'npc_' + R.tappi, verb: 'parla', clue: 'Qualcuno russa come una motosega. Chi è ancora sveglio sa dove sono i tappi.' });
    if (!f.scatolaVuota) return K({ hs: 'zaino', verb: 'apri', clue: 'I tappi erano nello zaino verde, vicino al termosifone.' });
    if (!f.latenarTappi) return K({ hs: 'latenar', verb: 'guarda', clue: 'La scatoletta è vuota. Chi è che dorme beato, come se non sentisse niente?' });
    if (!has('tappi')) return K({ hs: 'cuscino', verb: 'raccogli', clue: 'Latenar ha una scorta di tappi. Sotto il cuscino con la faccia, magari.' });
    return K({ verb: 'usa', item: 'tappi', clue: 'Hai i tappi. Sai cosa farne.' });
  }
  if (n === 8) {
    const S = o => Object.assign({ room: 'salone' }, o), R = Game.roles || {};
    if (f.rum && f.moonshine && f.gin) return null;
    if (!f.bicchieriPresi) return S({ hs: 'vetrina', verb: 'apri', clue: 'Una degustazione così merita i bicchieri buoni. Quelli che Luciano tiene in vetrina.' });
    return S({ hs: 'npc_' + R.oste, verb: 'parla', clue: 'Le bottiglie le offre ' + PG[R.oste].name + '. Fatti versare il prossimo assaggio.' });
  }
  if (n === 7) {
    const Q = o => Object.assign({ room: 'portico' }, o);
    if (f.guinnessFinita) return null;
    if (!f.bbqMontato) return Q({ hs: 'bbq', verb: 'usa', clue: 'Il barbecue è piegato contro il muro. Così non griglia niente.' });
    if (!f.carbonellaMessa) return has('carbonella') ? Q({ hs: 'bbq', verb: 'usa', item: 'carbonella', clue: 'Il barbecue è montato ma vuoto. E tu hai un sacco nero in mano.' }) : Q({ hs: 'mobiletti', verb: 'apri', clue: 'Senza carbonella niente brace. Nei mobiletti della cucina da esterno c\'è di tutto.' });
    if (!f.bbqAcceso) return has('accendino') ? Q({ hs: 'bbq', verb: 'usa', item: 'accendino', clue: 'Carbonella pronta, accendino in tasca.' }) : Q({ hs: 'npc_zac', verb: 'parla', clue: 'Per accendere serve una fiamma. Zak ne ha sempre una in tasca.' });
    if (!f.musica) return Q({ hs: 'npc_chino', verb: 'parla', clue: 'La brace è pigra. Chino ha una teoria: le serve la musica.' });
    if (!f.costineSu) return Q({ hs: 'bbq', verb: 'usa', item: 'costine', clue: 'La brace è perfetta. È il momento della teglia.' });
    return has('guinness') ? Q({ verb: 'usa', item: 'guinness', clue: 'Le costine cuociono. E tu hai una cassa intera da finire.' }) : Q({ hs: 'cassaGuinness', verb: 'raccogli', clue: 'Mentre le costine cuociono... per terra c\'è una cassa di Guinness.' });
  }
  if (n === 6) {
    const D = o => Object.assign({ room: 'dependance' }, o);
    if (f.sciacquone) return null;
    if (!f.guantiPresi) return D({ hs: 'guanti', verb: 'raccogli', clue: 'Prima di mettere le mani in quel bagno, proteggile. Guarda vicino alla doccia.' });
    if (!f.mobileAperto) return D({ hs: 'mobiletto', verb: 'apri', clue: 'Lo sturalavandini dev\'essere da qualche parte. Il mobiletto sotto il lavandino?' });
    if (!f.ghiroScacciato) return D({ hs: 'ghiroDep', verb: 'usa', item: 'crocifisso', clue: 'C\'è un ghiro sopra lo sturalavandini. Chino ha in tasca un argomento convincente.' });
    if (!has('sturalavandini') && !f.sturato) return D({ hs: 'sturalavandiniHs', verb: 'raccogli', clue: 'Il ghiro è scappato: lo sturalavandini è libero.' });
    if (!f.sturato) return D({ hs: 'water', verb: 'usa', item: 'sturalavandini', clue: 'Ventosa rossa e water intasato: sono fatti l\'uno per l\'altro.' });
    return D({ hs: 'catena', verb: 'tira', clue: 'Il water è sturato. Resta la prova del nove.' });
  }
  if (n === 4) {
    const C = o => Object.assign({ room: 'caminetto' }, o), R = Game.roles || {};
    if (f.magicVinta) return null;
    if (!f.magicTavolo) return C({ hs: 'npc_' + R.forte, verb: 'parla', clue: 'Il tavolo è incastrato contro il divano. Da solo non lo sposti: serve una mano da ' + PG[R.forte].name + '.' });
    if (!f.magicMazzo) return C({ hs: 'npc_' + R.mazzi, verb: 'parla', clue: 'Senza mazzo non si gioca. La scatola dei mazzi ce l\'ha ' + PG[R.mazzi].name + '.' });
    if (!has('dadi') && !f.magicGiocata) return f.magicDadiSaputi ? C({ hs: 'radio', verb: 'apri', clue: 'I dadi sono nel posto più sicuro della baita, secondo ' + PG[R.dadi].name + '. Quello che dà il meteo del 1962.' }) : C({ hs: 'npc_' + R.dadi, verb: 'parla', clue: 'Servono i dadi per i punti vita. Chi li aveva? Chiedi a ' + PG[R.dadi].name + '.' });
    return C({ hs: 'tavoloCarte', verb: 'usa', item: 'mazzo', clue: 'Tavolo libero, mazzo in mano, dadi pronti: si gioca!' });
  }
  if (n === 3) {
    const S = o => Object.assign({ room: 'salone' }, o);
    if (f.retroAcceso) return null;
    if (!f.retroTvMontata) {
      if (has('tv')) return S({ hs: 'tv', verb: 'usa', item: 'tv', clue: 'Hai la TV in mano. Il suo posto è in mezzo alle casse rosse.' });
      if (!f.retroTvSaputa) return S({ hs: 'npc_sprus', verb: 'parla', clue: 'La TV non c\'è più. Sprus dice che si sta ricordando qualcosa...' });
      return { room: 'caminetto', hs: 'tvPlaid', verb: 'raccogli', clue: 'Luciano nasconde la TV per i ladri: nella stanza del caminetto, sotto qualcosa di morbido.' };
    }
    if (!f.retroHdmi) return has('cavi') ? S({ hs: 'tv', verb: 'usa', item: 'cavi', clue: 'La TV è spenta: le manca qualcosa dietro. E tu hai un groviglio in mano.' }) : S({ hs: 'mobileTv', verb: 'apri', clue: 'Senza cavi la TV è un soprammobile. Nel mobile qui sotto ce n\'è un groviglio.' });
    if (!f.retroPadUno) return has('pad') ? S({ hs: 'computer', verb: 'usa', item: 'pad', clue: 'I joypad si abbinano col bluetooth. A chi? Al computer con le ventole blu.' }) : S({ hs: 'divano', verb: 'raccogli', clue: 'Servono i joypad. Erano sul divano a righe, vicino a chi dorme.' });
    if (!f.retroBt) return S({ hs: 'npc_sprus', verb: 'parla', clue: 'Il pad due non si abbina da solo: serve qualcuno che tenga premuto il tasto mentre cerchi.' });
    return S({ hs: 'computer', verb: 'usa', clue: 'È tutto collegato. Manca solo la partita di prova.' });
  }
  if (n === 2) {
    if (f.caminettoAcceso) return null;
    if (!has('cacciavite') && !f.ventolaAperta) return { room: 'portico', hs: 'mobiletti', verb: 'apri', clue: 'Per smontare la griglia della ventola serve un attrezzo. Nei mobiletti del portico c\'è la cassetta.' };
    if (!f.ventolaAperta) return { room: 'caminetto', hs: 'ventola', verb: 'usa', item: 'cacciavite', clue: 'La ventola è sopra il caminetto, dietro una griglia con quattro viti.' };
    if (!f.gusciTolti) return { room: 'caminetto', hs: 'ventola', verb: 'raccogli', clue: 'Dentro la ventola c\'è qualcosa che non è una ventola. Toglilo.' };
    if (!f.ventolaOk) return { room: 'caminetto', hs: 'ventola', verb: 'usa', item: 'spray', clue: 'La ventola è libera ma dura. Lo spray sbloccante te l\'hanno dato apposta.' };
    return { room: 'caminetto', hs: 'caminetto', verb: 'usa', item: 'legna', clue: 'Ventola a posto: adesso il fuoco. Hai ancora la bracciata di legna.' };
  }
  if (n !== 1) return null;
  const P = o => Object.assign({ room: 'parcheggio' }, o);
  if (!f.ghiroGone) return has('noce') ? P({ hs: 'ghiro', verb: 'dai', item: 'noce', clue: 'Hai una noce in tasca e un ghiro che ti guarda. Fate amicizia.' }) : P({ hs: 'noce', verb: 'raccogli', clue: 'Luciano l\'ha detto: per una noce un ghiro venderebbe la madre. Sotto il noce ce ne sono.' });
  if (!f.shedOpen) return P({ hs: 'portaBaracca', verb: 'usa', item: 'chiave', clue: 'Hai la chiave del ghiro. Cos\'era chiuso col lucchetto?' });
  if (!f.sawTaken) return P({ hs: 'motosega', verb: 'raccogli', clue: 'La baracca è aperta: dentro c\'è quello che serve per tagliare i tronchi.' });
  if (!f.cascoTaken) return P({ hs: 'casco', verb: 'raccogli', clue: 'Motosega sì, ma la testa va protetta. In baracca c\'è dell\'altro.' });
  if (!f.olioTaken) return P({ hs: 'olio', verb: 'raccogli', clue: 'Una motosega a secco non va lontano. In baracca c\'è anche l\'olio.' });
  if (!f.tanicaTaken) return P({ hs: 'tanica', verb: 'raccogli', clue: 'La benzina va messa da qualche parte. Guarda bene dentro le macchine.' });
  if (f.tanica === 'vuota') {
    if (!f.hoseInCar && !has('tubo')) return P({ hs: 'tubo', verb: 'tira', clue: 'Per travasare la benzina ci vuole un tubo. Quello dell\'acqua, magari.' });
    if (!f.tankOpen && !has('chiaviPunto')) return P({ hs: 'chiaviTavolo', verb: 'raccogli', clue: 'Il serbatoio della Punto rossa è chiuso a chiave. Menion lascia sempre le chiavi sul tavolo.' });
    return P({ hs: 'punto', verb: 'usa', item: 'tanica', clue: 'Tanica, tubo e chiavi: la benzina è nella Punto rossa di Menion.' });
  }
  if (!f.sawFuel) return P({ verb: 'usa', item: 'tanica', item2: 'motosega', clue: 'La tanica è piena e la motosega ha sete.' });
  if (!f.logsCut) return P({ hs: 'tronchi', verb: 'usa', item: 'motosega', clue: 'Motosega col pieno, casco in testa: i tronchi di betulla aspettano.' });
  return null;
}

function findHs(id) { return Game.room && allHotspots().find(h => h.id === id); }
function computeHint() {
  if (Game.dialog) return { text: 'Scegli una delle risposte qui sotto.' };
  if (Game.busy) return { text: 'Un attimo: sta succedendo qualcosa.' };
  const h = storyHint();
  if (!h) return { text: Game.flags.finale ? 'Goditi la grigliata!' : 'Niente di urgente: esplora pure.' };
  // il passo della storia (anche se per arrivarci bisogna cambiare stanza)
  const key = [Game.chapter, h.room, h.hs, h.verb, h.item, h.item2].join('|');
  if (Game.room.id !== h.room) {
    const ex = routeExit(Game.room.id, h.room);
    if (!ex) return { text: 'Torna verso: ' + ((ROOMS[h.room] && ROOMS[h.room].title) || h.room) + '.', clue: h.clue, key };
    return { hs: ex, verb: 'vai', clue: h.clue, key };
  }
  return Object.assign({ key }, h);
}
function hintText(h) {
  if (h.text) return h.text;
  const hs = h.hs && findHs(h.hs);
  const tn = hs ? nameOf({ kind: 'hs', hs }) : h.item2 ? itemName(h.item2) : '';
  if (h.verb === 'vai') return `Prendi l'uscita: ${tn}`;
  const v = VERB_LABEL[h.verb] || '';
  if (h.item) return `${v} ${itemName(h.item)}${tn ? (h.verb === 'dai' ? ' a ' : ' con ') + tn : ''}`;
  return `${v} ${tn}`;
}
// la lampadina: la prima volta un indizio a parole, la seconda (sullo stesso passo) evidenzia cosa fare
function showHint() {
  const h = computeHint();
  if (h.clue && !(Game.hintStep && Game.hintStep.key === h.key)) {
    Game.hint = { clue: h.clue, level: 1, until: Game.t + 12 };
    Game.hintStep = { key: h.key };
    SFX.clack();
    return;
  }
  if (h.key) Game.hintStep = { key: h.key };
  h.level = 2;
  h.until = Game.t + 9;
  Game.hint = h;
  // fai vedere l'oggetto dell'inventario, se è in un'altra pagina
  const id = h.item || h.item2;
  if (id && hasItem(id)) {
    const i = Game.inv.indexOf(id);
    const page = Math.floor(i / INV.cols);
    if (page < Game.invScroll || page >= Game.invScroll + INV.rows) { Game.invScroll = page; clampInvScroll(); }
  }
  SFX.clack();
}
function hintActive() { return Game.hint && Game.t < Game.hint.until; }

/* ---------- disegno dell'aiuto ---------- */
function bracket(g, x, y, w, h, c) {
  const L = Math.max(2, Math.min(5, Math.floor(w / 3), Math.floor(h / 3)));
  const seg = (px, py, sw, sh) => { g.fillStyle = '#000'; g.fillRect(px - 1, py - 1, sw + 2, sh + 2); };
  const segs = [[x, y, L, 1], [x, y, 1, L], [x + w - L, y, L, 1], [x + w - 1, y, 1, L], [x, y + h - 1, L, 1], [x, y + h - L, 1, L], [x + w - L, y + h - 1, L, 1], [x + w - 1, y + h - L, 1, L]];
  for (const s of segs) seg(...s);
  g.fillStyle = c; for (const s of segs) g.fillRect(...s);
}
function arrowDown(g, x, y, c) {
  g.fillStyle = '#000'; for (let i = 0; i < 5; i++) g.fillRect(x - 4 + i, y - 1 + i, 9 - i * 2, 2); g.fillRect(x - 2, y - 5, 5, 5);
  g.fillStyle = c; for (let i = 0; i < 4; i++) g.fillRect(x - 3 + i, y + i, 7 - i * 2, 1); g.fillRect(x - 1, y - 4, 3, 4);
}
function arrowSide(g, x, y, dir, c) {
  g.fillStyle = '#000'; for (let i = 0; i < 5; i++) g.fillRect(x + dir * i - 1, y - 4 + i, 3, 9 - i * 2);
  g.fillStyle = c; for (let i = 0; i < 4; i++) g.fillRect(x + dir * i, y - 3 + i, 1, 7 - i * 2);
}
function drawHintScene(cam) {
  if (!hintActive() || Game.hint.level === 1 || !Game.hint.hs) return;
  const hs = findHs(Game.hint.hs);
  if (!hs || (hs.show && !hs.show())) return;
  const rects = typeof hs.rects === 'function' ? hs.rects() : hs.rects;
  const r = rects[0];
  const pulse = (Math.sin(Game.rt * 8) + 1) / 2;
  const c = pulse > 0.5 ? '#fff27a' : '#f2b81c';
  const x = Math.round(r[0] - cam), y = Math.max(1, r[1]), w = r[2], h = Math.min(r[3], SH - 1 - y);
  if (x + w < 0) { arrowSide(lctx, 4, 70, -1, c); return; }
  if (x > W) { arrowSide(lctx, W - 5, 70, 1, c); return; }
  bracket(lctx, x, y, w, h, c);
  arrowDown(lctx, clamp(x + Math.round(w / 2), 6, W - 6), Math.max(7, y - 6 - Math.round(pulse * 3)), c);
}
function drawHintPanel() {
  if (!hintActive() || Game.hint.level === 1 || Game.dialog) return;
  const g = lctx, h = Game.hint;
  const c = ((Game.rt * 4) | 0) % 2 ? '#fff27a' : '#f2b81c';
  const frame = r => { g.fillStyle = c; g.fillRect(r[0] - 1, r[1] - 1, r[2] + 2, 1); g.fillRect(r[0] - 1, r[1] + r[3], r[2] + 2, 1); g.fillRect(r[0] - 1, r[1], 1, r[3]); g.fillRect(r[0] + r[2], r[1], 1, r[3]); };
  const v = VERBS.find(v => v.id === h.verb);
  if (v && !(h.verb === 'usa' && h.item && !h.hs && !h.item2)) frame(verbRect(v));
  for (const id of [h.item, h.item2]) {
    if (!id) continue;
    const i = Game.inv.indexOf(id) - Game.invScroll * INV.cols;
    if (i >= 0 && i < INV.cols * INV.rows) frame(slotRect(i));
  }
}
const BULB = ['..###..', '.#####.', '#######', '#######', '#######', '.#####.', '..###..', '..+++..', '..+++..', '...+...'];
function drawHintButton() {
  const on = hintActive();
  const c = on ? (((Game.rt * 4) | 0) % 2 ? '#fff27a' : '#f2b81c') : '#e8d8b0';
  const x0 = 254, y0 = 2;
  lctx.fillStyle = '#000';
  BULB.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') lctx.fillRect(x0 + i - 1, y0 + j - 1, 3, 3); }));
  BULB.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return;
    lctx.fillStyle = ch === '+' ? '#a8a49a' : c;
    lctx.fillRect(x0 + i, y0 + j, 1, 1);
  }));
  lctx.fillStyle = '#ffffff'; lctx.fillRect(x0 + 2, y0 + 2, 1, 2);
}

/* ---------- modalità dev: saltare a un capitolo ----------
   La partita fatta così (Game.devRun) non tocca il salvataggio vero. */
function openChapters(back) {
  Game.chapters = { back: back || 'title' };
  Game.menu = null; Game.mode = 'chapters'; Game.fade = 1; Game.fadeTarget = 0;
}
function closeChapters() {
  const back = Game.chapters ? Game.chapters.back : 'title';
  Game.chapters = null; Game.mode = back === 'play' ? 'play' : 'title';
}
function devJump(n) {
  if (!chapterReady(n)) return;
  Game.chapters = null; Game.menu = null; Game.devRun = true;
  Game.score = (n - 1) * 100; Game.scored = {};
  launchChapter(n);
}
function chapterRowRect(i) { return [30, 22 + i * 14.6, 260, 13]; } // 0..9 capitoli, 10 = indietro
function chaptersClick(mx, my) {
  for (let i = 0; i <= LAST_CHAPTER; i++) {
    if (!inRect(mx, my, chapterRowRect(i))) continue;
    SFX.pick();
    return i === LAST_CHAPTER ? closeChapters() : devJump(i + 1);
  }
}
function chapterWho(n) {
  const c = chapterChars(n);
  return CHAPTERS[n].chars === 'all' ? 'tutti' : c.length === 1 ? PG[c[0]].name : c.map(id => PG[id].name).join(', ');
}
function renderChaptersLow() {
  const g = lctx;
  g.fillStyle = '#140c06'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 15) { g.fillStyle = '#1c120a'; g.fillRect(0, y, W, 14); g.fillStyle = '#26180e'; g.fillRect(0, y, W, 1); }
  for (let i = 0; i <= LAST_CHAPTER; i++) {
    const r = chapterRowRect(i);
    if (!mouse.touch && inRect(mouse.x, mouse.y, r)) { g.fillStyle = '#3a2814'; g.fillRect(r[0], r[1], r[2], r[3]); }
  }
}
function renderChaptersText() {
  drawText('VAI AL CAPITOLO', W / 2, 16, '#ff9a8a', { size: 13 });
  const cur = Game.chapters && Game.chapters.back === 'play' ? Game.chapter : 0;
  for (let i = 0; i <= LAST_CHAPTER; i++) {
    const r = chapterRowRect(i), hov = !mouse.touch && inRect(mouse.x, mouse.y, r);
    if (i === LAST_CHAPTER) { drawText('Indietro', W / 2, r[1] + 10, hov ? '#fff2b0' : '#d8b878', { size: 10 }); continue; }
    const n = i + 1;
    drawText(`${n === cur ? '▶ ' : ''}${n}. ${CHAPTERS[n].title}`, r[0] + 4, r[1] + 10, hov ? '#fff2b0' : n === cur ? '#f2e01c' : '#d8b878', { size: 10, align: 'left' });
    drawText(chapterWho(n), r[0] + r[2] - 4, r[1] + 10, '#a89878', { size: 8, align: 'right' });
  }
  drawText('Modalità dev: la partita salvata non viene toccata · tasti 1-9, 0 = 10', W / 2, 193, '#7a6a52', { size: 8 });
}
function devKey(e) {
  if (!DEV || !['play', 'title', 'chapters'].includes(Game.mode)) return false;
  const k = parseInt(e.key, 10), n = k === 0 ? 10 : k;
  if (n >= 1 && n <= LAST_CHAPTER) { devJump(n); return true; }
  if (e.key === 'Escape' && Game.mode === 'chapters') { closeChapters(); return true; }
  return false;
}
