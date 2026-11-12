'use strict';
/* =========================================================
   AIUTO (pulsante lampadina): evidenzia la prossima azione
   MODALITÀ DEV (?dev nell'indirizzo): esplora tutte le stanze
   ========================================================= */
const DEV = /[?&#]dev\b/i.test(location.search + location.hash);
const HINT_BTN = [246, 0, 24, 15];
const DEV_ROOMS = ['parcheggio', 'portico', 'salone', 'caminetto', 'camerata', 'guado', 'orrido'];

/* ---------- la prossima mossa della storia ---------- */
function storyHint() {
  const f = Game.flags, has = hasItem;
  if (f.finale) return null;
  if (Game.chapter === 2 || f.ch1Done) {
    if (f.arachidiDone) return null;
    if (!f.beam2) {
      const G = o => Object.assign({ room: 'guado' }, o);
      if (!f.lampOn && !f.lampDead) return G({ verb: 'usa', item: 'frontale' });
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
  if (!f.caminettoAcceso) return hasItem('legna') ? { room: 'caminetto', hs: 'caminetto', verb: 'usa', item: 'legna' } : P({ hs: 'tronchi', verb: 'raccogli' });
  return null;
}

function findHs(id) { return Game.room && Game.room.hotspots.find(h => h.id === id); }
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

/* ---------- modalità dev: esplorare le stanze ---------- */
function devGo(id) {
  const night = !!Game.flags.notte;
  const ch2 = id === 'guado' || id === 'orrido';
  resetState();
  Game.explore = true; Game.chapter = ch2 ? 2 : 1;
  Game.inv = ch2 ? ['frontale', 'telefono', 'arachidi'] : ['costine', 'telefono'];
  Game.flags = ch2 ? Object.assign({}, CH1_FLAGS, { orridoSeen: true, lampOn: true, notte: night }) : { tanica: 'vuota', lucianoLeft: true, notte: night };
  const room = ROOMS[id];
  const sp = room.spawn || [160, 128];
  hero.x = sp[0]; hero.y = sp[1]; hero.dir = 'down';
  enterRoom(room, false);
}
function devStart() { Game.flags = {}; devGo('portico'); Game.menu = { dev: true }; }
function devItems() {
  return DEV_ROOMS.map(id => ({ id, label: () => (Game.room && Game.room.id === id ? '▶ ' : '') + ((ROOMS[id] && ROOMS[id].title) || id) }))
    .concat([{ id: 'notte', label: () => Game.flags.notte ? 'Notte: sì' : 'Notte: no' }, { id: 'chiudi', label: () => 'Chiudi' }]);
}
function devItemRect(i) { return [96, 30 + i * 11, 128, 10]; }
function devMenuClick(mx, my) {
  const items = devItems();
  const i = items.findIndex((_, k) => inRect(mx, my, devItemRect(k)));
  if (i < 0) return;
  const id = items[i].id;
  if (id === 'chiudi') { Game.menu = null; return; }
  if (id === 'notte') { Game.flags.notte = !Game.flags.notte; return; }
  Game.menu = null; devGo(id);
}
function devMenuText() {
  drawText('STANZE (DEV)', W / 2, 26, '#ff9a8a', { size: 11 });
  devItems().forEach((m, i) => {
    const r = devItemRect(i);
    drawText(m.label(), W / 2, r[1] + 8, inRect(mouse.x, mouse.y, r) ? '#fff2b0' : '#d8b878', { size: 10 });
  });
}
function devKey(e) {
  if (!DEV || Game.mode !== 'play') return false;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= DEV_ROOMS.length) { Game.menu = null; devGo(DEV_ROOMS[n - 1]); return true; }
  if (e.key === 'n' || e.key === 'N') { Game.flags.notte = !Game.flags.notte; return true; }
  return false;
}
