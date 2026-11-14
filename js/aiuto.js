'use strict';
/* =========================================================
   AIUTO (pulsante lampadina): evidenzia la prossima azione
   MODALITÀ DEV (?dev nell'indirizzo): vai a qualsiasi capitolo
   ========================================================= */
const DEV = /[?&#]dev\b/i.test(location.search + location.hash);
const HINT_BTN = [246, 0, 24, 15];

/* ---------- la prossima mossa della storia ---------- */
function storyHint() {
  const f = Game.flags, has = hasItem, n = Game.chapter || 1;
  if (f.finale) return null;
  if (n === 3) {
    if (f.arachidiDone) return null;
    if (!f.beam2) {
      const G = o => Object.assign({ room: 'guado' }, o);
      if (!f.lampOn && !f.orridoSeen) return G({ verb: 'usa', item: 'frontale' });
      if (!f.branchesMoved) return G({ hs: 'ramaglia', verb: 'tira' });
      if (!f.trave1Taken) return G({ hs: 'trave1', verb: 'raccogli' });
      if (has('trave1') || has('trave2')) return G({ hs: 'torrente', verb: 'usa', item: has('trave1') ? 'trave1' : 'trave2' });
      if (!f.ramoTaken) return G({ hs: 'ramo', verb: 'raccogli' });
      if (!f.beamHooked) return G({ hs: 'traveAcqua', verb: 'usa', item: 'ramo' });
      return G({ hs: 'traveAcqua', verb: 'raccogli' });
    }
    if (!f.frontaliOn) return { room: 'orrido', verb: 'usa', item: 'frontale' };
    return { room: 'orrido', hs: 'amici', verb: 'dai', item: 'arachidi' };
  }
  if (n === 8) {
    if (f.salutato) return null;
    if (!f.briocheMangiata) return { room: 'portico', hs: 'brioche', verb: 'raccogli' };
    if (!f.autoCaricata) return has('bagagli') ? { room: 'parcheggio', hs: 'ypsilon', verb: 'usa', item: 'bagagli' } : { room: 'portico', hs: 'bagagli', verb: 'raccogli' };
    return { room: 'parcheggio', hs: 'lucianoHs', verb: 'parla' };
  }
  if (n === 7) {
    const K = o => Object.assign({ room: 'camerata' }, o), R = Game.roles || {};
    if (f.tappiUsati) return null;
    if (!f.chiestoTappi) return K({ hs: 'npc_' + R.tappi, verb: 'parla' });
    if (!f.scatolaVuota) return K({ hs: 'zaino', verb: 'apri' });
    if (!f.latenarTappi) return K({ hs: 'latenar', verb: 'guarda' });
    if (!has('tappi')) return K({ hs: 'cuscino', verb: 'raccogli' });
    return K({ verb: 'usa', item: 'tappi' });
  }
  if (n === 6) {
    const S = o => Object.assign({ room: 'salone' }, o), R = Game.roles || {};
    if (f.rum && f.moonshine && f.gin) return null;
    if (!f.bicchieriPresi) return S({ hs: 'vetrina', verb: 'apri' });
    return S({ hs: 'npc_' + R.oste, verb: 'parla' });
  }
  if (n === 5) {
    const Q = o => Object.assign({ room: 'portico' }, o);
    if (f.guinnessFinita) return null;
    if (!f.bbqMontato) return Q({ hs: 'bbq', verb: 'usa' });
    if (!f.carbonellaMessa) return has('carbonella') ? Q({ hs: 'bbq', verb: 'usa', item: 'carbonella' }) : Q({ hs: 'mobiletti', verb: 'apri' });
    if (!f.bbqAcceso) return has('accendino') ? Q({ hs: 'bbq', verb: 'usa', item: 'accendino' }) : Q({ hs: 'npc_zac', verb: 'parla' });
    if (!f.musica) return Q({ hs: 'npc_chino', verb: 'parla' });
    if (!f.costineSu) return Q({ hs: 'bbq', verb: 'usa', item: 'costine' });
    return has('guinness') ? Q({ verb: 'usa', item: 'guinness' }) : Q({ hs: 'cassaGuinness', verb: 'raccogli' });
  }
  if (n === 4) {
    const D = o => Object.assign({ room: 'dependance' }, o);
    if (f.sciacquone) return null;
    if (!f.guantiPresi) return D({ hs: 'guanti', verb: 'raccogli' });
    if (!f.mobileAperto) return D({ hs: 'mobiletto', verb: 'apri' });
    if (!f.ghiroScacciato) return D({ hs: 'ghiroDep', verb: 'usa', item: 'crocifisso' });
    if (!has('sturalavandini') && !f.sturato) return D({ hs: 'sturalavandiniHs', verb: 'raccogli' });
    if (!f.sturato) return D({ hs: 'water', verb: 'usa', item: 'sturalavandini' });
    return D({ hs: 'catena', verb: 'tira' });
  }
  if (n === 2) {
    if (f.caminettoAcceso) return null;
    if (!has('cacciavite') && !f.ventolaAperta) return { room: 'portico', hs: 'mobiletti', verb: 'apri' };
    if (!f.ventolaAperta) return { room: 'caminetto', hs: 'ventola', verb: 'usa', item: 'cacciavite' };
    if (!f.gusciTolti) return { room: 'caminetto', hs: 'ventola', verb: 'raccogli' };
    if (!f.ventolaOk) return { room: 'caminetto', hs: 'ventola', verb: 'usa', item: 'spray' };
    return { room: 'caminetto', hs: 'caminetto', verb: 'usa', item: 'legna' };
  }
  if (n !== 1) return null;
  const P = o => Object.assign({ room: 'parcheggio' }, o);
  if (!f.ghiroGone) return has('noce') ? P({ hs: 'ghiro', verb: 'dai', item: 'noce' }) : P({ hs: 'noce', verb: 'raccogli' });
  if (!f.shedOpen) return P({ hs: 'portaBaracca', verb: 'usa', item: 'chiave' });
  if (!f.sawTaken) return P({ hs: 'motosega', verb: 'raccogli' });
  if (!f.cascoTaken) return P({ hs: 'casco', verb: 'raccogli' });
  if (!f.olioTaken) return P({ hs: 'olio', verb: 'raccogli' });
  if (!f.tanicaTaken) return P({ hs: 'tanica', verb: 'raccogli' });
  if (f.tanica === 'vuota') {
    if (!f.hoseInCar && !has('tubo')) return P({ hs: 'tubo', verb: 'tira' });
    if (!f.tankOpen && !has('chiaviPunto')) return P({ hs: 'chiaviTavolo', verb: 'raccogli' });
    return P({ hs: 'punto', verb: 'usa', item: 'tanica' });
  }
  if (!f.sawFuel) return P({ verb: 'usa', item: 'tanica', item2: 'motosega' });
  if (!f.logsCut) return P({ hs: 'tronchi', verb: 'usa', item: 'motosega' });
  return null;
}

function findHs(id) { return Game.room && allHotspots().find(h => h.id === id); }
function computeHint() {
  if (Game.dialog) return { text: 'Scegli una delle risposte qui sotto.' };
  if (Game.busy) return { text: 'Un attimo: sta succedendo qualcosa.' };
  const h = storyHint();
  if (!h) return { text: Game.flags.finale ? 'Goditi la grigliata!' : 'Niente di urgente: esplora pure.' };
  if (Game.room.id !== h.room) {
    const ex = routeExit(Game.room.id, h.room);
    if (!ex) return { text: 'Torna verso: ' + ((ROOMS[h.room] && ROOMS[h.room].title) || h.room) + '.' };
    return { hs: ex, verb: 'vai' };
  }
  return h;
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
function showHint() {
  const h = computeHint();
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
  if (!hintActive() || !Game.hint.hs) return;
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
  if (!hintActive() || Game.dialog) return;
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
function chapterRowRect(i) { return [30, 24 + i * 15.5, 260, 14]; } // 0..8 capitoli, 9 = indietro
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
  drawText('Modalità dev: la partita salvata non viene toccata · tasti 1-' + LAST_CHAPTER, W / 2, 193, '#7a6a52', { size: 8 });
}
function devKey(e) {
  if (!DEV || !['play', 'title', 'chapters'].includes(Game.mode)) return false;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= LAST_CHAPTER) { devJump(n); return true; }
  if (e.key === 'Escape' && Game.mode === 'chapters') { closeChapters(); return true; }
  return false;
}
