'use strict';
/* =========================================================
   MOTORE: interfaccia a verbi, inventario, dialoghi,
   camminata con pathfinding, script asincroni, salvataggi
   ========================================================= */
const VERBS = [
  { id: 'dai', label: 'Dai', c: 0, r: 0 }, { id: 'apri', label: 'Apri', c: 0, r: 1 }, { id: 'chiudi', label: 'Chiudi', c: 0, r: 2 },
  { id: 'raccogli', label: 'Raccogli', c: 1, r: 0 }, { id: 'guarda', label: 'Guarda', c: 1, r: 1 }, { id: 'parla', label: 'Parla con', c: 1, r: 2 },
  { id: 'usa', label: 'Usa', c: 2, r: 0 }, { id: 'spingi', label: 'Spingi', c: 2, r: 1 }, { id: 'tira', label: 'Tira', c: 2, r: 2 },
];
const VERB_LABEL = Object.fromEntries(VERBS.map(v => [v.id, v.label]));
VERB_LABEL.vai = 'Vai a';
const VX = [4, 62, 122], VY = [157, 171, 185], VW = 56, VH = 13;
const INV = { x: 198, y: 156, cols: 5, rows: 2, sw: 24, sh: 21 };
const ARROW_UP = [184, 156, 12, 20], ARROW_DN = [184, 177, 12, 20];
const SAVE_KEY = 'baita.cap1.save';
/* i nove capitoli della storia: chi si può giocare (chars) e dove.
   start(pg) fa partire il capitolo; senza start è "in arrivo". */
const CHAPTERS = {
  1: { title: 'La legna', place: 'Il parcheggio', chars: ['defi', 'chino', 'lele', 'kodo', 'menion', 'ghiaccio'], done: ['La legna è tagliata', 'e la baita può respirare.'] },
  2: { title: 'La ventola del caminetto', place: 'Il portico, di giorno', chars: ['defi', 'iron'], done: ['La ventola gira, il fuoco scoppietta:', 'ingegneria alla MacGyver.'] },
  3: { title: 'La postazione retro', place: 'Il salone, nel pomeriggio', chars: ['zac'], done: ['TV, cavi e joypad: funziona tutto.', 'Stasera torneo. Sprus approva.'] },
  4: { title: "La notte dell'orrido", place: "Il guado Pepi e l'orrido Rascie", chars: ['kodo', 'lele', 'menion', 'ghiaccio'], done: ["Il guado è passato, l'orrido è visto", 'e le arachidi sono finite.'] },
  5: { title: 'Il cesso della dépendance', place: 'La dépendance', chars: ['chino'], done: ['Il water è sturato', 'e i ghiri sono tornati nel muro.'] },
  6: { title: 'Il portico delle costine', place: 'Il portico, di sera', chars: ['kodo'], done: ['Costine grigliate e cassa finita.', 'Zac, Chino e Iron approvano.'] },
  7: { title: 'La cena dei sessantaquattro gradi', place: 'Il salone', chars: 'all', done: ['Rum, gin e moonshine a 64 gradi.', 'La lingua tornerà domani.'] },
  8: { title: 'I tappi per le orecchie', place: 'La camerata', chars: 'all', done: ['Chi russa russa ancora,', 'ma con i tappi non si sente.'] },
  9: { title: 'Mandi', place: 'La colazione', chars: 'all' },
};
const LAST_CHAPTER = 9;
const MAX_SCORE = LAST_CHAPTER * 100;   // 100 per capitolo
function chapterReady(n) { return !!(CHAPTERS[n] && CHAPTERS[n].start); }
function chapterChars(n) { const c = CHAPTERS[n].chars; return c === 'all' ? PLAYABLE : c; }
// fa partire un capitolo: se si può scegliere il personaggio, prima la schermata di scelta
function launchChapter(n, pg) {
  const ch = CHAPTERS[n], chars = chapterChars(n);
  if (pg && chars.includes(pg)) return ch.start(pg);
  if (chars.length === 1) return ch.start(chars[0]);
  openSelect(n, id => ch.start(id));
}
const ROOMS = {};               // registro stanze (riempito dai file in js/rooms)

const Game = {
  mode: 'loading', room: null, camX: 0, camXf: 0,
  inv: [], invScroll: 0, flags: {}, score: 0, scored: {},
  verb: null, objA: null, hover: null, hoverUI: null,
  busy: 0, dialog: null, speeches: [], particles: [], t: 0,
  fade: 1, fadeTarget: 0, menu: null, hints: false, toast: null, banner: null,
  shake: 0, titleHover: -1, hasSave: false,
};

/* ---------------- attori ---------------- */
function makeActor(o) {
  return Object.assign({
    x: 0, y: 0, dir: 'down', pose: 'stand', path: [], speed: 58, walkDist: 0, onArrive: null,
    color: '#fff', visible: true, blinkOff: Math.random() * 4, fixedScale: null, helmet: false,
    sawRun: false, climbPhase: 0, headH: 56,
  }, o);
}
const hero = makeActor({ name: 'Kodo', color: '#f6e43a' });

function actorScale(a) { return a.fixedScale != null ? a.fixedScale : (Game.room ? Game.room.scaleAt(a.y) : 1); }
function headPos(a) {
  if (a.headPos) return a.headPos();
  return [a.x, a.y - a.headH * actorScale(a) - 3];
}
function isTalking(a) { return Game.speeches.some(s => s.actor === a); }

/* ---------------- pathfinding ---------------- */
function pointInPoly(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
function closestOnSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = clamp(t, 0, 1);
  return [ax + dx * t, ay + dy * t];
}
const NUDGE = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [-2, -2], [2, -2], [-2, 2]];
function clampToPoly(x, y, poly) {
  if (pointInPoly(x, y, poly)) return [x, y];
  let best = [x, y], bd = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const c = closestOnSeg(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
    const d = Math.hypot(c[0] - x, c[1] - y);
    if (d < bd) { bd = d; best = c; }
  }
  for (const [ox, oy] of NUDGE) if (pointInPoly(best[0] + ox, best[1] + oy, poly)) return [best[0] + ox, best[1] + oy];
  return best;
}
function segClear(a, b, poly) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(2, Math.ceil(d / 1.5));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (!pointInPoly(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, poly)) return false;
  }
  return true;
}
function findPath(poly, s, e) {
  e = clampToPoly(e[0], e[1], poly);
  const s2 = clampToPoly(s[0], s[1], poly);
  if (segClear(s2, e, poly)) return [e];
  const verts = [];
  for (const v of poly) for (const [ox, oy] of NUDGE.slice(1)) {
    const p = [v[0] + ox * 1.5, v[1] + oy * 1.5];
    if (pointInPoly(p[0], p[1], poly)) { verts.push(p); break; }
  }
  const nodes = [s2, e, ...verts], n = nodes.length;
  const dist = new Array(n).fill(Infinity), prev = new Array(n).fill(-1), done = new Array(n).fill(false);
  dist[0] = 0;
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    if (u === 1) break;
    done[u] = true;
    for (let v = 0; v < n; v++) {
      if (done[v] || v === u) continue;
      if (!segClear(nodes[u], nodes[v], poly)) continue;
      const nd = dist[u] + Math.hypot(nodes[v][0] - nodes[u][0], nodes[v][1] - nodes[u][1]);
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; }
    }
  }
  if (prev[1] < 0) return [e];
  const path = [];
  for (let v = 1; v > 0; v = prev[v]) path.unshift(nodes[v]);
  if (s2[0] !== s[0] || s2[1] !== s[1]) path.unshift(s2);
  return path;
}

function roomWalk() { const w = Game.room.walk; return typeof w === 'function' ? w() : w; }
function walkTo(a, x, y) {
  if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(false); }
  a.path = Game.room ? findPath(roomWalk(), [a.x, a.y], [x, y]) : [[x, y]];
  return new Promise(res => {
    if (!a.path.length) return res(true);
    a.onArrive = res;
  });
}
// cammina seguendo i punti dati, senza restare nell'area calpestabile (per entrare/uscire di scena)
function walkStraight(a, pts) {
  if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(false); }
  a.path = pts.map(p => p.slice());
  return new Promise(res => { a.onArrive = res; });
}
function stopWalk(a) {
  a.path = [];
  if (a.pose === 'walk') a.pose = 'stand';
  if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(false); }
}
function updateActor(a, dt) {
  if (!a.path.length) return;
  const [tx, ty] = a.path[0];
  const dx = tx - a.x, dy = ty - a.y;
  const s = actorScale(a), vy = 0.55;
  const ex = dx, ey = dy / vy, ed = Math.hypot(ex, ey);
  const sp = a.speed * s * dt;
  if (Math.abs(dx) > Math.abs(dy) * 1.3 / vy * 0.6) a.dir = dx > 0 ? 'right' : 'left';
  else if (Math.abs(dy) > 0.5) a.dir = dy > 0 ? 'down' : 'up';
  const before = Math.floor(a.walkDist / (3 * s));
  if (ed <= sp) { a.x = tx; a.y = ty; a.path.shift(); a.walkDist += ed; }
  else { a.x += ex / ed * sp; a.y += ey / ed * sp * vy; a.walkDist += sp; }
  const after = Math.floor(a.walkDist / (3 * s));
  if (before !== after && (after % 4 === 0) && a === hero) SFX.step();
  a.pose = 'walk';
  if (!a.path.length) {
    a.pose = 'stand';
    if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(true); }
  }
}

/* ---------------- primitive per gli script ---------------- */
function say(actor, text, o = {}) {
  if (!o.raw && typeof stylize === 'function') text = stylize(actor, text);
  // Kodo: ogni tanto la battutina a doppio senso
  if (actor === hero && Game.pg === 'kodo' && !o.quip && Game.mode === 'play' && Game.t > (Game.kodoCd || 0) && DOPPIO_RE.test(text)) {
    Game.kodoCd = Game.t + 60;
    return sayRaw(actor, text, o).then(() => say(hero, pick(DOPPI_SENSI), { quip: true }));
  }
  return sayRaw(actor, text, o);
}
function sayRaw(actor, text, o = {}) {
  return new Promise(res => {
    endSpeech(actor);
    const dur = o.dur || Math.max(1500, 1000 + text.length * 58);
    Game.speeches.push({ actor, text, until: Game.t + dur / 1000, resolve: res, big: o.big });
  });
}
function endSpeech(actor) {
  Game.speeches = Game.speeches.filter(s => { if (s.actor === actor) { s.resolve(); return false; } return true; });
}
function skipSpeech() {
  const s = Game.speeches.shift();
  if (s) s.resolve();
}
function wait(ms) {
  return new Promise(res => { const t = Game.t + ms / 1000; Game._waits.push({ t, res }); });
}
Game._waits = [];
function face(a, d) { a.dir = d; }
async function pose(p, ms, a = hero) { a.pose = p; await wait(ms); a.pose = 'stand'; }
function tween(obj, props, ms) {
  const from = {}; for (const k in props) from[k] = obj[k];
  const t0 = Game.t, dur = ms / 1000;
  return new Promise(res => Game._tweens.push({ obj, from, props, t0, dur, res }));
}
Game._tweens = [];
async function runScript(fn) {
  Game.busy++;
  try { await fn(); } catch (e) { console.error(e); }
  finally { Game.busy--; if (Game.mode === 'play') saveGame(); }
}

function hasItem(id) { return Game.inv.includes(id); }
function giveItem(id) {
  if (!hasItem(id)) Game.inv.push(id);
  SFX.pick();
  Game.invScroll = Math.max(0, Math.ceil(Game.inv.length / INV.cols) - INV.rows);
}
function takeItem(id) { Game.inv = Game.inv.filter(i => i !== id); clampInvScroll(); if (Game.objA && Game.objA.id === id) Game.objA = null; }
function clampInvScroll() { const pages = Math.max(0, Math.ceil(Game.inv.length / 5) - 2); Game.invScroll = clamp(Game.invScroll, 0, pages); }
function addScore(key, n) {
  if (Game.scored[key]) return;
  Game.scored[key] = true; Game.score += n;
  SFX.score();
  Game.toast = { text: `Punti Montanaro +${n}`, until: Game.t + 2.2 };
}
function banner(text, sec = 4) { Game.banner = { text, until: Game.t + sec }; }
function addParticle(p) {
  Game.particles.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 1, age: 0, c: '#fff', w: 1, h: 1, ground: null, layer: 1 }, p));
}

/* ---------------- risposte predefinite ---------------- */
const DEFAULTS = {
  guarda: ['Niente di speciale.', 'Lo guardo. Lui non guarda me.', 'Sembra proprio... normale.'],
  raccogli: ['Non posso prenderlo.', 'Non mi sta nel colbacco.', 'Meglio di no.'],
  apri: ['Non si apre.', 'Non vedo come aprirlo.'],
  chiudi: ['Non si chiude.', 'Non c\'è niente da chiudere.'],
  parla: ['Non mi risponde. Per fortuna.', 'Parlare con le cose? La montagna fa brutti scherzi.'],
  usa: ['Non funziona.', 'Non saprei come.'],
  spingi: ['Non si muove.', 'Spingo... niente.'],
  tira: ['Non si muove.', 'Tiro... niente.'],
  dai: ['Non credo lo voglia.', 'Non mi sembra il caso.'],
};
function nameOf(t) {
  if (!t) return '';
  if (t.kind === 'item') return itemName(t.id);
  const n = t.hs.name; return typeof n === 'function' ? n() : n;
}

async function dispatch(verb, a, b) {
  if (!b) {
    if (a.kind === 'hs') {
      if (verb === 'parla' && a.hs.talk) return a.hs.talk();
      const h = a.hs.verbs && a.hs.verbs[verb];
      if (h) return h();
    } else {
      const it = ITEMS[a.id];
      const rv = Game.room.itemVerbs && Game.room.itemVerbs[a.id];
      if (rv && rv[verb]) { const r = await rv[verb](); if (r !== false) return r; }
      const h = it.verbs && it.verbs[verb];
      if (h) return h();
      if (verb === 'raccogli') return say(hero, 'Ce l\'ho già.');
      if (verb === 'parla') return say(hero, 'Parlare con un oggetto? Inizio a preoccuparmi.');
      if (verb === 'dai') return say(hero, 'A chi? Devo scegliere qualcuno.');
    }
    if (verb === 'dai') return say(hero, 'Prima devo scegliere cosa dare.');
    if ((verb === 'spingi' || verb === 'tira') && Game.pg === 'kodo') return say(hero, pick(KODO_FORTE_SPINGE));
    return say(hero, pick(DEFAULTS[verb] || DEFAULTS.usa));
  }
  if (b.kind === 'hs') {
    const tbl = verb === 'dai' ? b.hs.give : b.hs.use;
    const h = tbl && (tbl[a.id] || tbl['*']);
    if (h) return h(a.id);
    if (verb === 'dai') return say(hero, b.hs.person ? 'Non credo che gli interessi.' : 'Dare qualcosa a quello? Non mi sembra il caso.');
    return say(hero, pick(['Non funziona.', 'Non credo che c\'entrino qualcosa.', 'Mmm... no.']));
  }
  const h = COMBOS[a.id + '+' + b.id] || COMBOS[b.id + '+' + a.id];
  if (h && verb === 'usa') return h();
  return say(hero, pick(['Non credo che c\'entrino qualcosa.', 'Non funziona.', 'Mmm... no.']));
}

async function execute(verb, a, b) {
  const target = b || a;
  Game.verb = null; Game.objA = null; Game.hint = null; Game.idleT = 0;
  if (target.kind === 'hs') {
    const hs = target.hs;
    const wt = typeof hs.walk === 'function' ? hs.walk() : hs.walk;
    if (wt) { const ok = await walkTo(hero, wt[0], wt[1]); if (!ok) return; }
    if (hs.face) hero.dir = hs.face;
  }
  await runScript(() => dispatch(verb, a, b));
}

/* ---------------- dialoghi ---------------- */
function choose(options) {
  return new Promise(res => { Game.dialog = { options, resolve: res, hover: -1 }; });
}

/* ---------------- input ---------------- */
function inRect(x, y, r) { return x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3]; }
function verbRect(v) { return [VX[v.c], VY[v.r] - 1, VW, VH]; }
function slotRect(i) { return [INV.x + (i % INV.cols) * INV.sw, INV.y + Math.floor(i / INV.cols) * INV.sh, INV.sw - 1, INV.sh - 1]; }
function invAt(x, y) {
  for (let i = 0; i < INV.cols * INV.rows; i++) {
    const id = Game.inv[Game.invScroll * INV.cols + i];
    if (id && inRect(x, y, slotRect(i))) return id;
  }
  return null;
}
function allHotspots() { return Game.room.hotspots.concat(roomExtraHotspots()); }
function hotspotAt(rx, ry) {
  const list = allHotspots();
  for (let i = list.length - 1; i >= 0; i--) {
    const hs = list[i];
    if (hs.show && !hs.show()) continue;
    const rects = typeof hs.rects === 'function' ? hs.rects() : hs.rects;
    for (const r of rects) if (inRect(rx, ry, r)) return hs;
  }
  return null;
}
function dialogLineAt(y) {
  if (!Game.dialog) return -1;
  const i = Math.floor((y - 147) / 10.5);
  return i >= 0 && i < Game.dialog.options.length ? i : -1;
}

Game.click = function (btn, touch) {
  const mx = mouse.x, my = mouse.y;
  if (Game.mode === 'title') return titleClick(mx, my);
  if (Game.mode === 'end' && Game.endPhoto) { if (Game.t > Game.endT + 1.5) { Game.endPhoto = false; Game.endT = Game.t; } return; }
  if (Game.mode === 'end') { if (Game.t > Game.endT + 1.5) { const nx = Game.endKind + 1; if (Game.endKind < LAST_CHAPTER && chapterReady(nx)) launchChapter(nx); else toTitle(); } return; }
  if (Game.mode === 'select') return selectClick(mx, my);
  if (Game.mode === 'chapters') return chaptersClick(mx, my);
  if (Game.mode === 'mini') return Game.mini.click(mx, my);
  if (Game.mode !== 'play') return;
  if (inRect(mx, my, [296, 0, 24, 15]) && !Game.dialog) { Game.menu = Game.menu ? null : { hover: -1 }; return; }
  if (inRect(mx, my, [272, 0, 22, 15]) && !Game.dialog && !Game.menu) { Game.hints = !Game.hints; return; }
  if (inRect(mx, my, HINT_BTN) && !Game.menu) { showHint(); return; }
  if (Game.menu) return menuClick(mx, my);
  if (Game.dialog) {
    const i = dialogLineAt(my);
    if (my >= SH && i >= 0) { const d = Game.dialog; Game.dialog = null; d.resolve(d.options[i]); }
    else if (Game.speeches.length) skipSpeech();
    return;
  }
  if (Game.busy) { skipSpeech(); return; }
  if (Game.speeches.length && my < SH) skipSpeech();
  if (my < SH) return sceneClick(btn, touch, mx, my);
  return uiClick(btn, mx, my);
};

// su touch: se il dito è vicino a un oggetto vero, preferiscilo allo sfondo (montagne, bosco...)
function hotspotNear(rx, ry, radius) {
  const exact = hotspotAt(rx, ry);
  if (!radius || (exact && exact.hint !== false)) return exact;
  for (let r = 2; r <= radius; r += 2) {
    for (let a = 0; a < 8; a++) {
      const hs = hotspotAt(rx + Math.cos(a * Math.PI / 4) * r, ry + Math.sin(a * Math.PI / 4) * r);
      if (hs && hs.hint !== false) return hs;
    }
  }
  return exact;
}
function sceneClick(btn, touch, mx, my) {
  const rx = mx + Game.camX, ry = my;
  const hs = hotspotNear(rx, ry, touch ? 6 : 0);
  const tgt = hs ? { kind: 'hs', hs } : null;
  if (tgt && touch) Game.lastTouched = { kind: 'hs', hs, until: Game.t + 2 };
  if (btn === 2) {
    // tasto destro = azione predefinita; su touch la pressione lunga = Guarda
    if (tgt) execute(hs.exit ? 'vai' : touch ? 'guarda' : (hs.def || 'guarda'), tgt);
    else { Game.verb = null; Game.objA = null; }
    return;
  }
  if (!tgt) { walkTo(hero, rx, ry); return; }
  if (!Game.verb) {
    if (hs.exit) { execute('vai', tgt); return; }
    // su touch un tocco su un oggetto senza verbo esegue l'azione predefinita
    if (touch) { execute(hs.def || 'guarda', tgt); return; }
    const wt = typeof hs.walk === 'function' ? hs.walk() : hs.walk;
    walkTo(hero, wt ? wt[0] : rx, wt ? wt[1] : ry).then(ok => { if (ok && hs.face) hero.dir = hs.face; });
    return;
  }
  if (Game.objA) execute(Game.verb, Game.objA, tgt);
  else execute(Game.verb, tgt);
}

function uiClick(btn, mx, my) {
  for (const v of VERBS) if (inRect(mx, my, verbRect(v))) { Game.verb = v.id; Game.objA = null; return; }
  if (Game.inv.length > 10) {
    if (inRect(mx, my, ARROW_UP)) { Game.invScroll--; clampInvScroll(); return; }
    if (inRect(mx, my, ARROW_DN)) { Game.invScroll++; clampInvScroll(); return; }
  }
  const id = invAt(mx, my);
  if (!id) return;
  const it = { kind: 'item', id };
  if (btn === 2) return execute('guarda', it);
  if (Game.objA) {
    // ritoccare lo stesso oggetto = usarlo da solo ("Usa telefono")
    if (Game.objA.id === id) { const v = Game.verb; Game.objA = null; return v === 'usa' ? execute('usa', it) : null; }
    return execute(Game.verb, Game.objA, it);
  }
  const v = Game.verb || 'usa';
  if ((v === 'usa' && !ITEMS[id].useAlone) || v === 'dai') { Game.verb = v; Game.objA = it; return; }
  execute(v, it);
}

Game.key = function (e) {
  if (e.key === 'Escape') {
    if (Game.mode === 'chapters') closeChapters();
    if (Game.mode === 'play') {
      if (Game.verb || Game.objA) { Game.verb = null; Game.objA = null; }
      else Game.menu = Game.menu ? null : { hover: -1 };
    }
    return;
  }
  if (e.key === ' ' || e.key === '.' || e.key === 'Enter') { skipSpeech(); e.preventDefault(); return; }
  if (devKey(e)) return;
  if ((e.key === 'a' || e.key === 'A') && Game.mode === 'play' && !Game.menu) { showHint(); return; }
  if (e.key === 'm' || e.key === 'M') { SFX.toggleMute(); return; }
  if (e.key === 'Tab') { e.preventDefault(); Game.hints = !Game.hints; return; }
  if (e.key === 'h' || e.key === 'H') { Game.hints = !Game.hints; return; }
};

/* ---------------- menu pausa ---------------- */
const MENU_ITEMS = [
  { id: 'riprendi', label: () => 'Riprendi' },
  { id: 'audio', label: () => SFX.muted ? 'Audio: spento' : 'Audio: acceso' },
  { id: 'aiuto', label: () => Game.hints ? 'Mostra oggetti: sì' : 'Mostra oggetti: no' },
  { id: 'schermo', label: () => document.fullscreenElement ? 'Esci da schermo intero' : 'Schermo intero' },
  { id: 'ricomincia', label: () => 'Ricomincia capitolo' },
  { id: 'titolo', label: () => 'Torna al titolo' },
  { id: 'dev', label: () => 'Vai al capitolo…', show: () => DEV },
];
function menuList() { return MENU_ITEMS.filter(m => !m.show || m.show()); }
function menuItemRect(i) { return [100, 36 + i * 14, 120, 13]; }
function menuClick(mx, my) {
  const items = menuList();
  const i = items.findIndex((_, k) => inRect(mx, my, menuItemRect(k)));
  if (i < 0) return;
  const id = items[i].id;
  if (id === 'dev') { openChapters('play'); return; }
  if (id === 'riprendi') Game.menu = null;
  if (id === 'audio') SFX.toggleMute();
  if (id === 'aiuto') Game.hints = !Game.hints;
  if (id === 'schermo') toggleFullscreen();
  if (id === 'ricomincia') { Game.menu = null; restartChapter(); }
  if (id === 'titolo') { Game.menu = null; saveGame(); toTitle(); }
}
function toggleFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement) { document.exitFullscreen && document.exitFullscreen(); return; }
  const p = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen ? el.webkitRequestFullscreen() : null;
  if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
}

/* ---------------- salvataggi ---------------- */
function saveGame() {
  if (Game.devRun) return; // la partita dev non tocca il salvataggio vero
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      inv: Game.inv, flags: Game.flags, score: Game.score, scored: Game.scored, hx: hero.x, hy: hero.y, dir: hero.dir,
      room: Game.room ? Game.room.id : 'parcheggio', chapter: Game.chapter || 1, chStart: Game.chStart, pg: Game.pg, v: SAVE_V,
    }));
    Game.hasSave = true;
  } catch (e) {}
}
function loadSave() {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? migrateSave(JSON.parse(s)) : null; } catch (e) { return null; }
}
/* I salvataggi di quando i capitoli erano nove: il 7 era la serata dei giochi (tolta),
   l'8 e il 9 adesso sono il 7 e l'8. Chi era a metà di un capitolo dal 7 in poi riparte dal suo inizio. */
const SAVE_V = 3;
const PUNTI_GIOCHI = { giochi: 10, crisi: 30, codice: 10, sbloccati: 25, tavolo: 25 };
// v1 (nove capitoli coi giochi) -> v2 (otto capitoli) -> v3 (postazione retro come capitolo 3)
function migrateSave(s) {
  if (!s || s.v === SAVE_V) return s;
  if (!s.v) s = migrateV2(s);
  if (s.v === 2) s = migrateV3(s);
  return s;
}
function migrateV2(s) {
  const senzaGiochi = (score, scored) => {
    const sc = Object.assign({}, scored || {});
    for (const k in PUNTI_GIOCHI) if (sc[k]) { delete sc[k]; score -= PUNTI_GIOCHI[k]; }
    return { score, scored: sc };
  };
  const nuovo = n => n >= 8 ? n - 1 : n;
  if (s.pending) {
    const n = s.pending === 'ch2' ? 2 : s.pending;
    return Object.assign({ v: 2, pending: nuovo(n) }, senzaGiochi(s.score, s.scored));
  }
  const ch = s.chapter || 1;
  if (ch < 7) return Object.assign({}, s, { v: 2 });
  const st = s.chStart || { score: s.score, scored: s.scored };
  return Object.assign({ v: 2, pending: nuovo(ch) }, senzaGiochi(st.score, st.scored));
}
// chi era già oltre il capitolo 2 si ritrova la postazione retro fatta (e i suoi 100 punti)
const PUNTI_RETRO = { retroTv: 15, retroTvMontata: 10, retroCavi: 10, retroHdmi: 15, retroPad: 10, retroBt: 15, retroPadDue: 10, retroTest: 15 };
function migrateV3(s) {
  const conRetro = (score, scored) => {
    const sc = Object.assign({}, scored || {});
    for (const k in PUNTI_RETRO) if (!sc[k]) { sc[k] = true; score += PUNTI_RETRO[k]; }
    return { score, scored: sc };
  };
  if (s.pending) {
    if (s.pending < 3) return Object.assign({}, s, { v: SAVE_V });
    return Object.assign({ v: SAVE_V, pending: s.pending + 1 }, conRetro(s.score, s.scored));
  }
  // partita a metà di un capitolo: resta dov'è, col numero nuovo
  const ch = s.chapter || 1;
  if (ch < 3) return Object.assign({}, s, { v: SAVE_V });
  const ora = conRetro(s.score, s.scored), st = s.chStart || { score: s.score, scored: s.scored };
  return Object.assign({}, s, { v: SAVE_V, chapter: ch + 1, score: ora.score, scored: ora.scored, chStart: conRetro(st.score, st.scored) });
}
function clearSave() { if (Game.devRun) return; try { localStorage.removeItem(SAVE_KEY); } catch (e) {} Game.hasSave = false; }

/* ---------------- flusso di gioco ---------------- */
function resetState() {
  Game.inv = []; Game.flags = {}; Game.score = 0; Game.scored = {}; Game.invScroll = 0;
  Game.verb = null; Game.objA = null; Game.dialog = null; Game.speeches = []; Game.particles = [];
  Game._waits = []; Game._tweens = []; Game.busy = 0; Game.banner = null; Game.toast = null; Game.menu = null;
  hero.helmet = false; hero.sawRun = false; hero.pose = 'stand'; hero.fixedScale = null; hero.path = []; hero.onArrive = null;
  Game.chapter = 1; Game.flash = 0; Game.hint = null; Game.npcs = []; Game.party = []; Game.camFocus = null;
  hero.lamp = undefined;
}
function enterRoom(room, isNew) {
  Game.room = room;
  room.init();
  Game.mode = 'play';
  SFX.music(false); SFX.ambient(true);
  Game.fade = 1; Game.fadeTarget = 0;
  room.enter(isNew);
  Game.camXf = Game.camX = clamp(hero.x - 160, 0, room.width - W);
}
function newGame(pg) {
  clearSave(); resetState();
  setHero(pg || 'kodo'); setupNpcs(1);
  Game.inv = isKodo() ? ['costine', 'telefono'] : ['telefono']; // le costine sono di Kodo
  Game.flags = { tanica: 'vuota' };
  Game.chStart = { score: 0, scored: {} };
  enterRoom(ROOM_PARCHEGGIO, true);
}
function continueGame() {
  const s = loadSave();
  if (!s) return newGame();
  if (s.pending) {
    const n = s.pending === 'ch2' ? 2 : s.pending;
    if (!chapterReady(n)) { Game.titleMsg = { text: `Il capitolo ${n} arriva presto!`, until: Game.t + 3 }; return; }
    Game.score = s.score; Game.scored = s.scored; return launchChapter(n);
  }
  resetState();
  Game.inv = s.inv; Game.flags = s.flags; Game.score = s.score; Game.scored = s.scored; Game.chapter = s.chapter || 1;
  Game.chStart = s.chStart || { score: 0, scored: {} };
  setHero(s.pg || 'kodo'); setupNpcs(Game.chapter);
  hero.x = s.hx; hero.y = s.hy; hero.dir = s.dir || 'down';
  hero.helmet = false;
  enterRoom(ROOMS[s.room] || ROOM_PARCHEGGIO, false);
}
// tutto quello che è successo nel capitolo 1 (serve ai capitoli dopo)
const CH1_FLAGS = { tanica: 'vuota', ch1Done: true, lucianoLeft: true, logsCut: true, keysTaken: true, tankOpen: true, siphoned: true,
  keyTaken: true, shedOpen: true, ghiroGone: true, sawTaken: true, cascoTaken: true, olioTaken: true, tanicaTaken: true, hoseTaken: true,
  sawFuel: true };
const CH2_FLAGS = Object.assign({}, CH1_FLAGS, { ch2Done: true, ventolaAperta: true, gusciTolti: true, ventolaOk: true, caminettoAcceso: true });
const CH3_FLAGS = Object.assign({}, CH2_FLAGS, { retroDone: true, retroTvSaputa: true, retroTvMontata: true, retroCavi: true, retroHdmi: true, retroPadPresi: true, retroPadUno: true, retroBt: true, retroAcceso: true });
const CH4_FLAGS = Object.assign({}, CH3_FLAGS, { ch3Done: true, orridoSeen: true, frontaliOn: true, arachidiDone: true, beam1: true, beam2: true });
const CH5_FLAGS = Object.assign({}, CH4_FLAGS, { ch4Done: true, mobileAperto: true, ghiroScacciato: true, guantiPresi: true, sturato: true, sciacquone: true });
const CH6_FLAGS = Object.assign({}, CH5_FLAGS, { ch5Done: true, bbqMontato: true, carbonellaMessa: true, bbqAcceso: true, musica: true, costineSu: true, guinnessFinita: true });
const CH7_FLAGS = Object.assign({}, CH6_FLAGS, { ch6Done: true, bicchieriPresi: true, rum: true, moonshine: true, gin: true });
const CH8_FLAGS = Object.assign({}, CH7_FLAGS, { tappiDone: true, chiestoTappi: true, scatolaVuota: true, latenarTappi: true, tappiUsati: true });
function beginChapter(n, pg) {
  const keep = { score: Game.score, scored: Object.assign({}, Game.scored) };
  resetState();
  Game.chapter = n; Game.score = keep.score; Game.scored = keep.scored;
  Game.chStart = { score: keep.score, scored: Object.assign({}, keep.scored) };
  setHero(pg); setupNpcs(n);
}
// chi c'è in scena oltre al personaggio scelto
const NPC_SPOTS = { 1: [[60, 138], [124, 140], [176, 141], [236, 138], [394, 140]] };
function setupNpcs(n) {
  Game.npcs = []; Game.party = [];
  if (n === 1) chapterChars(1).filter(id => id !== Game.pg).forEach((id, i) => Game.npcs.push(makeNpc(id, 'parcheggio', NPC_SPOTS[1][i][0], NPC_SPOTS[1][i][1], i < 2 ? 'right' : 'left')));
  if (n === 2) { const socio = makeNpc(socioCh2(), 'portico', 374, 121, 'left'); socio.talk = socioTalk; Game.npcs.push(socio); }
  if (n === 3) { const sprus = makeNpc('sprus', 'salone', SPRUS3_SPOT[0], SPRUS3_SPOT[1], 'right'); sprus.talk = sprusTalk; Game.npcs.push(sprus); }
  if (n === 4) Game.party = chapterChars(4).filter(id => id !== Game.pg);
  if (n === 6) {
    const zac = makeNpc('zac', 'portico', 170, 124, 'right'); zac.talk = zacTalk; Game.npcs.push(zac);
    const chino = makeNpc('chino', 'portico', 404, 124, 'left'); chino.talk = chinoTalk; Game.npcs.push(chino);
    const iron = makeNpc('iron', 'portico', IRON5_SPOT[0], IRON5_SPOT[1], 'right'); iron.talk = ironTalk5; Game.npcs.push(iron);
  }
  if (n === 7) setupSalone();
  if (n === 8) {
    const used = new Set([Game.pg]);
    const take = prefs => { const id = prefs.find(x => !used.has(x)); used.add(id); return id; };
    Game.roles = { russa: take(['orka', 'gus', 'pepi']), tappi: take(['jackal', 'lele', 'biz']) };
    const rest = PLAYABLE.filter(id => !used.has(id) && id !== 'zac');
    const add = (id, x, y, pose, sleep) => { const nn = makeNpc(id, 'camerata', x, y, 'down'); if (pose) nn.actor.pose = pose; if (sleep) nn.actor.sleep = true; Game.npcs.push(nn); return nn; };
    add(rest[0], 318, 132, 'sit', true); add(rest[1], 370, 132, 'sit', true);
    add(Game.roles.russa, 214, 132, 'sit', true);
    add(Game.roles.tappi, 150, 126, null, false).talk = tappiTalk;
  }
  if (n === 9) {
    const used = new Set([Game.pg]);
    const brioche = ['jackal', 'pepi', 'gus'].find(x => !used.has(x)); used.add(brioche);
    Game.roles = { brioche };
    const rest = PLAYABLE.filter(id => !used.has(id));
    Game.npcs.push(makeNpc(brioche, 'portico', 372, 122, 'left'));
    [[150, 124, 'right'], [262, 124, 'left'], [420, 126, 'left']].forEach((sp, i) => Game.npcs.push(makeNpc(rest[i], 'portico', sp[0], sp[1], sp[2])));
    NPC_SPOTS[1].forEach((sp, i) => { if (rest[3 + i]) Game.npcs.push(makeNpc(rest[3 + i], 'parcheggio', sp[0], sp[1], i < 2 ? 'right' : 'left')); });
  }
}
// salone: tutti seduti. Tavolone (di fronte), divano, panca davanti al tavolo (di spalle), Zac al PC (di spalle)
const ZAC_PC_SPOT = [337, 118, 'sitUp'];
const OSTE_SPOT = [44, 122, 'right'];   // chi offre le bottiglie: in piedi, a capotavola
const SALONE_FRONTE = [[226, 109], [266, 109], [62, 113], [82, 113], [102, 113], [122, 113], [142, 113], [162, 113], [182, 113], [202, 113]];
const SALONE_PANCA = [[136, 124], [96, 124], [176, 124]];
function setupSalone() {
  const roles = { oste: ['iron', 'orka', 'pepi'].find(x => x !== Game.pg) };
  Game.roles = roles;
  const others = PLAYABLE.filter(id => id !== Game.pg);
  // prima Kodo (non ha la posa seduta di spalle), poi gli altri
  const order = others.filter(id => id !== 'zac' && id !== roles.oste).sort((p, q) => (q === 'kodo') - (p === 'kodo'));
  const front = SALONE_FRONTE.slice(), panca = SALONE_PANCA.slice();
  const place = (id, x, y, how) => {
    const npc = makeNpc(id, 'salone', x, y, how === 'sitUp' ? 'up' : how === 'sit' ? 'down' : how);
    if (how === 'sit' || how === 'sitUp') npc.actor.pose = 'sit';
    Game.npcs.push(npc);
    return npc;
  };
  if (others.includes('zac')) place('zac', ...ZAC_PC_SPOT);
  if (roles.oste) place(roles.oste, ...OSTE_SPOT).talk = a => degustazione(a);
  for (const id of order) {
    if (front.length) { const sp = front.shift(); place(id, sp[0], sp[1], 'sit'); }
    else { const sp = panca.shift(); place(id, sp[0], sp[1], 'sitUp'); }
  }
}
function startChapter2(pg) {
  beginChapter(2, pg || 'defi');
  Game.inv = ['legna', 'telefono'];
  Game.flags = Object.assign({}, CH1_FLAGS);
  hero.x = 230; hero.y = 124; hero.dir = 'right';
  enterRoom(ROOMS.portico, true);
  saveGame();
}
function startChapter3(pg) {
  beginChapter(3, pg || 'zac');
  Game.inv = ['telefono'];
  Game.flags = Object.assign({}, CH2_FLAGS);
  hero.x = 120; hero.y = 128; hero.dir = 'right';
  enterRoom(ROOMS.salone, true);
  saveGame();
}
function startChapter4(pg) {
  beginChapter(4, pg || 'kodo');
  Game.inv = ['frontale', 'telefono', 'arachidi'];
  Game.flags = Object.assign({}, CH3_FLAGS);
  enterRoom(ROOMS.guado, true);
  saveGame();
}
function startChapter5(pg) {
  beginChapter(5, pg || 'chino');
  Game.inv = ['crocifisso', 'telefono'];
  Game.flags = Object.assign({}, CH4_FLAGS);
  hero.x = 50; hero.y = 126; hero.dir = 'right';
  enterRoom(ROOMS.dependance, true);
  saveGame();
}
function startChapter6(pg) {
  beginChapter(6, pg || 'kodo');
  Game.inv = ['costine', 'telefono'];
  Game.flags = Object.assign({}, CH5_FLAGS);
  hero.x = 230; hero.y = 124; hero.dir = 'right';
  enterRoom(ROOMS.portico, true);
  saveGame();
}
function startChapter7(pg) {
  beginChapter(7, pg || 'kodo');
  Game.inv = ['telefono'];
  Game.flags = Object.assign({}, CH6_FLAGS);
  hero.x = 300; hero.y = 132; hero.dir = 'left';
  enterRoom(ROOMS.salone, true);
  saveGame();
}
function startChapter8(pg) {
  beginChapter(8, pg || 'kodo');
  Game.inv = ['telefono'];
  Game.flags = Object.assign({}, CH7_FLAGS);
  hero.x = 100; hero.y = 132; hero.dir = 'right';
  enterRoom(ROOMS.camerata, true);
  saveGame();
}
function startChapter9(pg) {
  beginChapter(9, pg || 'kodo');
  Game.inv = ['telefono'];
  Game.flags = Object.assign({}, CH8_FLAGS);
  hero.x = 240; hero.y = 124; hero.dir = 'down';
  enterRoom(ROOMS.portico, true);
  saveGame();
}
CHAPTERS[1].start = newGame;
CHAPTERS[2].start = startChapter2;
CHAPTERS[3].start = startChapter3;
CHAPTERS[4].start = startChapter4;
CHAPTERS[5].start = startChapter5;
CHAPTERS[6].start = startChapter6;
CHAPTERS[7].start = startChapter7;
CHAPTERS[8].start = startChapter8;
CHAPTERS[9].start = startChapter9;
// "Ricomincia capitolo": riparte dall'inizio del capitolo in corso, con i punti di allora e lo stesso personaggio
function restartChapter() {
  const n = Game.chapter || 1;
  if (n === 1) return newGame(Game.pg);
  const st = Game.chStart || { score: Game.score, scored: Game.scored };
  Game.score = st.score; Game.scored = Object.assign({}, st.scored);
  CHAPTERS[n].start(Game.pg);
}
// passaggio da una stanza all'altra (dentro uno script)
async function goToRoom(room, x, y, dir) {
  Game.fadeTarget = 1; await wait(450);
  stopWalk(hero);
  Game.room = room; room.init(); Game.hint = null;
  hero.x = x; hero.y = y; if (dir) hero.dir = dir;
  Game.particles = [];
  Game.camXf = Game.camX = clamp(hero.x - 160, 0, room.width - W);
  room.enter(false);
  Game.fadeTarget = 0;
  saveGame();
}
function toTitle() {
  Game.mode = 'title'; Game.fade = 1; Game.fadeTarget = 0;
  Game.hasSave = !!loadSave();
  SFX.ambient(false); SFX.sawOff(); SFX.music(true);
}
function endChapter(n) {
  Game.mode = 'end'; Game.endKind = n; Game.endT = Game.t; Game.fade = 1; Game.fadeTarget = 0;
  Game.endPhoto = n === LAST_CHAPTER; // fine del gioco: prima la foto finale, poi i punti
  Game.finalScore = Game.score;
  if (n < LAST_CHAPTER) saveChapterStart(n + 1); else clearSave();
  SFX.ambient(false); SFX.sawOff(); SFX.music(true);
}
// salva l'inizio del capitolo successivo, così "Continua" riparte da lì
function saveChapterStart(n) {
  if (Game.devRun) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ pending: n, score: Game.score, scored: Game.scored, v: SAVE_V }));
    Game.hasSave = true;
  } catch (e) {}
}

/* ---------------- update ---------------- */
function update(dt) {
  Game.fade += (Game.fadeTarget - Game.fade) * Math.min(1, dt * 3);
  if (Math.abs(Game.fade - Game.fadeTarget) < 0.01) Game.fade = Game.fadeTarget;
  Game.rt = (Game.rt || 0) + dt; // tempo reale (animazioni UI)
  if (Game.mode === 'mini') { Game.t += dt; Game.mini.update(dt); return; }
  if (Game.mode === 'title' || Game.mode === 'end' || Game.mode === 'select' || Game.mode === 'chapters') {
    Game.t += dt;
    updateParticles(dt);
    ROOM_PARCHEGGIO.ambient(dt);
    return;
  }
  if (Game.mode !== 'play' || Game.menu) return;
  Game.t += dt;
  // timer
  for (let i = Game._waits.length - 1; i >= 0; i--) if (Game.t >= Game._waits[i].t) { const w = Game._waits.splice(i, 1)[0]; w.res(); }
  for (let i = Game._tweens.length - 1; i >= 0; i--) {
    const tw = Game._tweens[i];
    const k = clamp((Game.t - tw.t0) / tw.dur, 0, 1);
    for (const p in tw.props) tw.obj[p] = lerp(tw.from[p], tw.props[p], k);
    if (k >= 1) { Game._tweens.splice(i, 1); tw.res(); }
  }
  for (let i = Game.speeches.length - 1; i >= 0; i--) if (Game.t >= Game.speeches[i].until) { const s = Game.speeches.splice(i, 1)[0]; s.resolve(); }
  updateActor(hero, dt);
  // se resti fermo, il personaggio dice una delle sue
  Game.idleT = (Game.idleT || 0) + dt;
  if (hero.path.length || Game.busy || Game.dialog || Game.speeches.length) Game.idleT = Math.min(Game.idleT, 5);
  if (Game.idleT > 28) { Game.idleT = 0; const p = PG[Game.pg]; if (p && p.idle) say(hero, pick(p.idle)); }
  Game.room.update(dt);
  updateParticles(dt);
  // camera con zona morta
  const room = Game.room, maxX = room.width - W;
  const sx = hero.x - Game.camXf;
  let target = Game.camXf;
  if (sx < 110) target = hero.x - 110; else if (sx > 210) target = hero.x - 210;
  if (Game.camFocus != null) target = Game.camFocus - 160; // uno script inquadra qualcun altro
  target = clamp(target, 0, maxX);
  Game.camXf += (target - Game.camXf) * Math.min(1, dt * 5);
  Game.camX = Math.round(Game.camXf);
  if (Game.shake > 0) Game.shake = Math.max(0, Game.shake - dt);
  if (Game.flash > 0) Game.flash = Math.max(0, Game.flash - dt * 1.6);
  // hover
  Game.hover = null; Game.hoverUI = null;
  if (mouse.inside && !Game.busy && !Game.dialog) {
    if (mouse.y < SH) {
      const hs = hotspotNear(mouse.x + Game.camX, mouse.y, mouse.touch ? 6 : 0);
      if (hs) Game.hover = { kind: 'hs', hs };
    } else {
      const id = invAt(mouse.x, mouse.y);
      if (id) Game.hover = { kind: 'item', id };
      for (const v of VERBS) if (inRect(mouse.x, mouse.y, verbRect(v))) Game.hoverUI = v.id;
    }
  }
  if (Game.dialog) Game.dialog.hover = mouse.y >= SH ? dialogLineAt(mouse.y) : -1;
}
function updateParticles(dt) {
  const ps = Game.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.age += dt;
    if (p.age >= p.life) { ps.splice(i, 1); continue; }
    p.vy += p.g * dt;
    p.x += p.vx * dt + (p.sway ? Math.sin(p.age * 3 + p.sway) * 6 * dt : 0);
    p.y += p.vy * dt;
    if (p.ground != null && p.y >= p.ground) { p.y = p.ground; p.vy = 0; p.vx *= 0.8; p.sway = 0; }
  }
}

/* ---------------- render ---------------- */
function heroCanvas(a) {
  const talking = isTalking(a);
  const talk = talking ? (((Game.t * 9) | 0) % 3 !== 0 ? 1 : 0) : 0;
  const blink = !talking && ((Game.t + a.blinkOff) % 4.3) < 0.13;
  let view = a.dir === 'down' ? 'front' : a.dir === 'up' ? 'back' : 'side';
  let flip = a.dir === 'left';
  let phase = null;
  const s = actorScale(a);
  if (a.pose === 'walk') phase = (Math.floor(a.walkDist / (3 * s)) % 8) / 8;
  if (a.pose === 'climb') { view = 'back'; flip = false; phase = (Math.floor(a.climbPhase * 4) % 4) / 4; }
  if (a.pose === 'saw' || a.pose === 'reach') view = 'side';
  if (a.pose === 'phone' || (a.pose === 'sit' && a.dir !== 'up')) { view = 'front'; flip = false; }
  if (a.pose === 'sit' && a.dir === 'up') { view = 'back'; flip = false; }
  const vib = a.sawRun ? (((Game.t * 30) | 0) % 2) : 0;
  const sawPh = ((Game.t * 20) | 0) % 2;
  const key = ['h', a.look || 'kodo', view, a.pose, phase, talk, blink, a.helmet, a.sawRun, vib, sawPh, flip, a.lamp, a.sleep].join('|');
  const cv = cached(key, () => {
    const c = buildHero({ view, pose: a.pose, phase, talk, blink, helmet: a.helmet, sawRun: a.sawRun, vib, sawPh, look: a.look, lamp: a.lamp, sleep: a.sleep });
    return flip ? flipCanvas(c) : c;
  });
  return { cv, ox: flip ? HERO_W - HERO_CX - 0.5 : HERO_CX + 0.5, oy: HERO_OY };
}
function drawHero(a) {
  if (!a.visible) return;
  const { cv, ox, oy } = heroCanvas(a);
  const s = actorScale(a);
  const w = Math.round(cv.width * s), h = Math.round(cv.height * s);
  const dx = Math.round(a.x - ox * s), dy = Math.round(a.y - oy * s);
  // ombra
  lctx.fillStyle = 'rgba(20,16,10,0.35)';
  const sw = Math.round(14 * s);
  if (a.pose !== 'climb') lctx.fillRect(Math.round(a.x - sw / 2), Math.round(a.y) - 1, sw, 2);
  lctx.drawImage(cv, dx, dy, w, h);
}

function renderScene() {
  const room = Game.room;
  const shakeX = Game.shake > 0 ? Math.round((Math.random() - 0.5) * 2) : 0;
  const cam = Game.camX - shakeX;
  lctx.save();
  lctx.beginPath(); lctx.rect(0, 0, W, SH); lctx.clip();
  room.drawBack(lctx, cam);
  lctx.translate(-cam, 0);
  const objs = room.objects().filter(o => !o.show || o.show()).concat(roomExtraObjects());
  if (hero.visible) objs.push({ y: hero.y + 0.5, draw: () => drawHero(hero) });
  objs.sort((a, b) => a.y - b.y);
  for (const o of objs) o.draw(lctx);
  for (const p of Game.particles) {
    lctx.globalAlpha = p.fade ? clamp(1 - p.age / p.life, 0, 1) : 1;
    lctx.fillStyle = p.c;
    lctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h);
  }
  lctx.globalAlpha = 1;
  if (room.drawFront) room.drawFront(lctx, cam);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  if (room.darkness) drawNight(room, cam);
  if (Game.flash > 0) { lctx.fillStyle = `rgba(255,255,255,${Game.flash})`; lctx.fillRect(0, 0, W, SH); }
  drawHintScene(cam);
  lctx.restore();
}

/* ---------------- notte: buio con luci ---------------- */
const nightCv = document.createElement('canvas');
nightCv.width = W; nightCv.height = SH;
const nctx = nightCv.getContext('2d');
function drawNight(room, cam) {
  const dark = room.darkness();
  if (dark <= 0) return;
  const lights = room.lights ? room.lights() : [];
  nctx.globalCompositeOperation = 'source-over';
  nctx.clearRect(0, 0, W, SH);
  nctx.fillStyle = `rgba(${room.darkTint || '3,5,18'},${dark})`;
  nctx.fillRect(0, 0, W, SH);
  nctx.globalCompositeOperation = 'destination-out';
  for (const L of lights) {
    const x = L.x - cam, y = L.y, a = L.a == null ? 1 : L.a;
    const g = nctx.createRadialGradient(x, y, 0, x, y, L.r);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.5, `rgba(0,0,0,${a * 0.85})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    nctx.fillStyle = g; nctx.fillRect(x - L.r, y - L.r, L.r * 2, L.r * 2);
  }
  lctx.drawImage(nightCv, 0, 0);
  // tinta della luce (calda per il fuoco, fredda per la frontale)
  lctx.globalCompositeOperation = 'lighter';
  for (const L of lights) {
    if (!L.tint) continue;
    const x = L.x - cam, y = L.y;
    const g = lctx.createRadialGradient(x, y, 0, x, y, L.r);
    g.addColorStop(0, L.tint); g.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = g; lctx.fillRect(x - L.r, y - L.r, L.r * 2, L.r * 2);
  }
  lctx.globalCompositeOperation = 'source-over';
}
// luce della frontale/torcia di Kodo
function heroLights(r, tint) {
  const s = actorScale(hero);
  const hx = hero.x, hy = hero.y - 44 * s;
  const fx = hero.dir === 'right' ? 34 : hero.dir === 'left' ? -34 : 0;
  const fy = hero.dir === 'down' ? 18 : hero.dir === 'up' ? -10 : 14;
  return [{ x: hx, y: hy + 8, r: r * 0.75 }, { x: hx + fx, y: hy + fy, r, tint }];
}

function drawPanel() {
  const g = lctx;
  g.fillStyle = '#1a1009'; g.fillRect(0, SH, W, H - SH);
  // assi di legno
  for (let y = SH + 11; y < H; y += 15) {
    g.fillStyle = '#2b1c11'; g.fillRect(0, y, W, 14);
    g.fillStyle = '#382517'; g.fillRect(0, y, W, 1);
    g.fillStyle = '#150d07'; g.fillRect(0, y + 13, W, 1);
    for (let x = (y * 7) % 60; x < W; x += 60) { g.fillStyle = '#0f0904'; g.fillRect(x, y + 1, 1, 12); g.fillStyle = '#6a5a4a'; g.fillRect(x + 3, y + 6, 1, 1); }
  }
  g.fillStyle = '#0c0805'; g.fillRect(0, SH, W, 10);
  if (Game.dialog) return;
  // slot inventario
  for (let i = 0; i < INV.cols * INV.rows; i++) {
    const r = slotRect(i);
    g.fillStyle = '#120b06'; g.fillRect(r[0], r[1], r[2], r[3]);
    g.fillStyle = '#4a3220'; g.fillRect(r[0], r[1] + r[3] - 1, r[2], 1); g.fillRect(r[0] + r[2] - 1, r[1], 1, r[3]);
    const id = Game.inv[Game.invScroll * INV.cols + i];
    if (id) {
      const hov = Game.hover && Game.hover.kind === 'item' && Game.hover.id === id;
      const sel = Game.objA && Game.objA.id === id;
      if (hov || sel) { g.fillStyle = sel ? '#6a4a14' : '#3a2814'; g.fillRect(r[0], r[1], r[2], r[3]); }
      g.drawImage(itemIcon(id), r[0] + 1, r[1] + 1);
    }
  }
  if (Game.inv.length > 10) {
    for (const [r, up] of [[ARROW_UP, true], [ARROW_DN, false]]) {
      g.fillStyle = '#2a1a0e'; g.fillRect(r[0], r[1], r[2], r[3]);
      g.fillStyle = '#d8b878';
      for (let i = 0; i < 4; i++) g.fillRect(r[0] + 6 - i, r[1] + (up ? 7 + i : 12 - i), i * 2 + 1, 1);
    }
  }
}

function sentenceText() {
  if (Game.busy && !Game.dialog) return '';
  const hv = Game.hover && !(Game.objA && Game.hover.kind === 'item' && Game.hover.id === Game.objA.id) ? nameOf(Game.hover) : '';
  if (Game.objA) return `${VERB_LABEL[Game.verb]} ${nameOf(Game.objA)} ${Game.verb === 'dai' ? 'a' : 'con'} ${hv}`;
  if (Game.verb) return `${VERB_LABEL[Game.verb]} ${hv}`;
  if (mouse.touch) {
    // su touch un tocco esegue l'azione predefinita: mostrala
    if (!Game.hover) return '';
    const def = Game.hover.kind === 'hs' ? (Game.hover.hs.exit ? 'vai' : Game.hover.hs.def || 'guarda') : 'usa';
    return `${VERB_LABEL[def]} ${hv}`;
  }
  return hv ? `Vai a ${hv}` : 'Vai a';
}

function renderTextPlay() {
  // dialoghi a fumetto
  for (const sp of Game.speeches) {
    const [hx, hy] = headPos(sp.actor);
    const size = sp.big ? 18 : 10;
    const lines = wrapText(sp.text, sp.big ? 200 : 170, size);
    const lh = sp.big ? 16 : 9;
    let w = 0; for (const l of lines) w = Math.max(w, measure(l, size));
    let x = clamp(hx - Game.camX, w / 2 + 4, W - w / 2 - 4);
    let y = hy - (lines.length - 1) * lh;
    y = clamp(y, 10, SH - 4 - (lines.length - 1) * lh);
    lines.forEach((l, i) => drawText(l, x, y + i * lh, sp.actor.color, { size }));
  }
  // nomi oggetti (aiuto)
  if (Game.hints && !Game.busy) {
    for (const hs of allHotspots()) {
      if (hs.hint === false || (hs.show && !hs.show())) continue;
      const rects = typeof hs.rects === 'function' ? hs.rects() : hs.rects;
      const r = rects[0];
      const cx = r[0] + r[2] / 2 - Game.camX, cy = r[1] + r[3] / 2;
      if (cx < -20 || cx > W + 20) continue;
      drawText('•', cx, cy + 2, '#ffe080', { size: 10 });
      drawText(nameOf({ kind: 'hs', hs }), cx, cy - 3, '#fff6c8', { size: 7, ow: 1.5 });
    }
  }
  // frase
  const st = sentenceText();
  if (st) drawText(st, W / 2, SH + 8, '#9fe3d8', { size: 10 });
  if (Game.toast && Game.t < Game.toast.until) drawText(Game.toast.text, W / 2, 12, '#f2e01c', { size: 10 });
  if (hintActive() && !Game.menu) drawText('Aiuto: ' + hintText(Game.hint), W / 2, 24, '#fff27a', { size: 10 });
  if (Game.devRun) drawText('DEV · capitolo ' + Game.chapter + ' · non salva', 4, 9, '#ff9a8a', { size: 8, align: 'left' });
  if (Game.banner && Game.t < Game.banner.until) {
    const lines = wrapText(Game.banner.text, 260, 11);
    lines.forEach((l, i) => drawText(l, W / 2, 56 + i * 11, '#ffffff', { size: 11 }));
  }
  // pulsanti: aiuto (mostra oggetti) e menu
  drawText('?', 283, 11, Game.hints ? '#f2e01c' : '#e8d8b0', { size: 12, ow: 2 });
  drawText('☰', 307, 11, Game.menu ? '#fff' : '#e8d8b0', { size: 11, ow: 2 });
  // verbi o opzioni di dialogo
  if (Game.dialog) {
    Game.dialog.options.forEach((o, i) => {
      const hov = i === Game.dialog.hover;
      drawText(o.text, 6, 155 + i * 10.5, hov ? '#fff2b0' : '#c9a35f', { size: 10, align: 'left' });
    });
  } else {
    const defVerb = Game.hover ? (Game.hover.kind === 'hs' ? (Game.hover.hs.def || 'guarda') : 'guarda') : null;
    for (const v of VERBS) {
      const r = verbRect(v);
      let c = '#c9a35f';
      if (Game.busy) c = '#5e4a2e';
      else if (Game.verb === v.id || Game.hoverUI === v.id) c = '#fff2b0';
      else if (!Game.verb && defVerb === v.id) c = '#f0d48a';
      drawText(v.label, r[0] + r[2] / 2, r[1] + 10, c, { size: 11 });
    }
  }
  // menu pausa
  if (Game.menu) {
    drawText('PAUSA', W / 2, 30, '#f2e01c', { size: 14 });
    menuList().forEach((m, i) => {
      const r = menuItemRect(i);
      const hov = inRect(mouse.x, mouse.y, r);
      drawText(m.label(), W / 2, r[1] + 10, hov ? '#fff2b0' : '#d8b878', { size: 11 });
    });
    drawText(`Punti Montanaro: ${Game.score}/${(Game.chapter || 1) * 100}`, W / 2, 139, '#9fe3d8', { size: 9 });
  }
}

function drawCursor() {
  if (!mouse.inside || mouse.touch) return;
  const g = sctx;
  g.save(); g.setTransform(K, 0, 0, K, 0, 0);
  const x = Math.round(mouse.x), y = Math.round(mouse.y);
  const busy = Game.mode === 'play' && Game.busy && !Game.dialog;
  const c = busy ? '#888' : (((Game.t * 4) | 0) % 2 ? '#ffffff' : '#ffe9a0');
  const hot = Game.mode === 'play' && Game.hover;
  const arm = hot ? 5 : 4;
  g.fillStyle = '#000';
  g.fillRect(x - arm - 1, y - 1, arm, 3); g.fillRect(x + 2, y - 1, arm, 3);
  g.fillRect(x - 1, y - arm - 1, 3, arm); g.fillRect(x - 1, y + 2, 3, arm);
  g.fillStyle = c;
  g.fillRect(x - arm, y, arm - 1, 1); g.fillRect(x + 2, y, arm - 1, 1);
  g.fillRect(x, y - arm, 1, arm - 1); g.fillRect(x, y + 2, 1, arm - 1);
  g.restore();
}

/* ---------------- titolo & finale ---------------- */
let portraitImg = null;
let fotoFinaleImg = null;
const FOTO_W = 256, FOTO_H = 144, FOTO_X = 32, FOTO_Y = 9;
function fotoFinaleCanvas() {
  if (!fotoFinaleImg || !fotoFinaleImg.complete || !fotoFinaleImg.naturalWidth) return null;
  return cached('fotoFinale', () => {
    const b = document.createElement('canvas'); b.width = FOTO_W; b.height = FOTO_H;
    b.getContext('2d').drawImage(fotoFinaleImg, 0, 0, FOTO_W, FOTO_H);
    return b;
  });
}
const COVER_SIZE = 120; // la copertina del titolo, pixel per pixel
function portraitCanvas() {
  if (!portraitImg || !portraitImg.complete || !portraitImg.naturalWidth) return null;
  return cached('portrait', () => {
    const b = document.createElement('canvas'); b.width = COVER_SIZE; b.height = COVER_SIZE;
    b.getContext('2d').drawImage(portraitImg, 0, 0, COVER_SIZE, COVER_SIZE);
    return b;
  });
}
function titleOptions() {
  const o = [{ id: 'new', text: 'Nuova partita' }];
  if (Game.hasSave) o.unshift({ id: 'cont', text: 'Continua' });
  if (DEV) o.push({ id: 'dev', text: 'Vai al capitolo (dev)' });
  return o;
}
function titleOptRect(i) { return [150, (titleOptions().length > 2 ? 94 : 102) + i * 15, 140, 14]; }
function titleClick(mx, my) {
  SFX.init();
  if (!Game.musicStarted) { Game.musicStarted = true; SFX.music(true); }
  if (inRect(mx, my, [286, 182, 34, 18])) { toggleFullscreen(); return; }
  titleOptions().forEach((o, i) => {
    if (inRect(mx, my, titleOptRect(i))) {
      if (IS_TOUCH && !document.fullscreenElement) toggleFullscreen();
      if (o.id === 'dev') return openChapters('title');
      Game.devRun = false;
      if (o.id === 'new') launchChapter(1); else continueGame();
    }
  });
}
function drawFrame(g, x, y, w, h) {
  g.fillStyle = '#2a1a0e'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#6a4626'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  g.fillStyle = '#8a6036'; g.fillRect(x - 3, y - 3, w + 6, 1); g.fillRect(x - 3, y - 3, 1, h + 6);
  g.fillStyle = '#3a2412'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = '#d8c090'; [[x - 2, y - 2], [x + w + 1, y - 2], [x - 2, y + h + 1], [x + w + 1, y + h + 1]].forEach(([a, b]) => g.fillRect(a, b, 1, 1));
}
function renderTitleLow(noPortrait) {
  const room = ROOM_PARCHEGGIO;
  room.init();
  const cam = Math.round(140 + Math.sin(Game.t * 0.1) * 100);
  lctx.save();
  room.drawBack(lctx, cam);
  lctx.translate(-cam, 0);
  room.objects().filter(o => !o.show || o.show()).sort((a, b) => a.y - b.y).forEach(o => o.draw(lctx));
  for (const p of Game.particles) { lctx.fillStyle = p.c; lctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h); }
  lctx.restore();
  lctx.fillStyle = '#0c0805'; lctx.fillRect(0, SH, W, H - SH);
  lctx.fillStyle = 'rgba(10,6,2,0.55)'; lctx.fillRect(0, 0, W, H);
  if (noPortrait) return;
  const pc = portraitCanvas();
  drawFrame(lctx, 16, 30, COVER_SIZE, COVER_SIZE);
  if (pc) lctx.drawImage(pc, 16, 30);
}
function renderTitleText() {
  drawText('LA LEGGENDA', 220, 34, '#f2e01c', { size: 24, ow: 3 });
  drawText('DELLA BAITA', 220, 54, '#f2e01c', { size: 24, ow: 3 });
  drawText('della figata del mondo', 220, 69, '#ffa040', { size: 14, ow: 2.5 });
  drawText('Un\'avventura in nove capitoli', 220, 82, '#f4ead0', { size: 9 });
  if (Game.titleMsg && Game.t < Game.titleMsg.until) drawText(Game.titleMsg.text, 220, 150, '#9fe3d8', { size: 10 });
  titleOptions().forEach((o, i) => {
    const r = titleOptRect(i);
    const hov = inRect(mouse.x, mouse.y, r) && !mouse.touch;
    drawText((hov ? '▶ ' : '') + o.text, r[0] + r[2] / 2, r[1] + 11, hov ? '#fff2b0' : '#d8b878', { size: 13 });
  });
  drawText('Legna, ghiri, guadi, un orrido, costine e moonshine.', 220, 162, '#a89878', { size: 8 });
  drawText(IS_TOUCH ? 'Tocca = azione · Tieni premuto = guarda · ? = nomi · lampadina = aiuto' : 'Clic sinistro = azione · Clic destro = azione rapida · H = nomi · A = aiuto', W / 2, 186, '#7a6a52', { size: 8 });
  drawText('⛶', 302, 195, '#a89878', { size: 12 });
}
function renderEndLow() {
  renderTitleLow(true); // fine capitolo: niente foto, testo al centro
  if (!Game.endPhoto) return;
  // fine del gioco: la foto di gruppo, incorniciata come una stampa
  lctx.fillStyle = 'rgba(6,4,2,0.6)'; lctx.fillRect(0, 0, W, H);
  lctx.fillStyle = 'rgba(0,0,0,0.5)'; lctx.fillRect(FOTO_X - 1, FOTO_Y + 1, FOTO_W + 8, FOTO_H + 8);
  lctx.fillStyle = '#efe8d8'; lctx.fillRect(FOTO_X - 3, FOTO_Y - 3, FOTO_W + 6, FOTO_H + 6);
  lctx.fillStyle = '#c8bfa8'; lctx.fillRect(FOTO_X - 3, FOTO_Y + FOTO_H + 2, FOTO_W + 6, 1);
  const fc = fotoFinaleCanvas();
  if (fc) lctx.drawImage(fc, FOTO_X, FOTO_Y);
}
function renderEndText() {
  const sc = Game.finalScore || 0, n = Game.endKind;
  if (n < LAST_CHAPTER) {
    const ch = CHAPTERS[n], next = CHAPTERS[n + 1], ready = chapterReady(n + 1);
    drawText(`CAPITOLO ${n} COMPLETATO!`, W / 2, 44, '#f2e01c', { size: 18, ow: 3 });
    (ch.done || []).forEach((l, i) => drawText(l, W / 2, 64 + i * 12, '#f4ead0', { size: 11 }));
    drawText(`Punti Montanaro: ${sc} / ${n * 100}`, W / 2, 100, '#9fe3d8', { size: 12 });
    drawText(`Capitolo ${n + 1}: ${next.title}`, W / 2, 128, '#f6e43a', { size: 12 });
    if (!ready) drawText('(in arrivo prossimamente)', W / 2, 141, '#a89878', { size: 9 });
    if (Game.t > Game.endT + 1.5) drawText(ready ? (IS_TOUCH ? 'Tocca per continuare' : 'Clicca per continuare') : (IS_TOUCH ? 'Tocca per tornare al titolo' : 'Clicca per tornare al titolo'), W / 2, 186, '#d8b878', { size: 10 });
  } else if (Game.endPhoto) {
    drawText('La rimpatriata, tutti assieme.', W / 2, 171, '#f4ead0', { size: 11 });
    if (Game.t > Game.endT + 1.5) drawText(IS_TOUCH ? 'Tocca per continuare' : 'Clicca per continuare', W / 2, 188, '#d8b878', { size: 9 });
  } else {
    drawText('FINE', W / 2, 44, '#f2e01c', { size: 22, ow: 3 });
    drawText('Legna, retrogaming, orrido, costine,', W / 2, 64, '#f4ead0', { size: 11 });
    drawText('moonshine a 64 gradi e tappi nelle orecchie.', W / 2, 76, '#f4ead0', { size: 11 });
    drawText('Mandi, baita! Alla prossima rimpatriata, senza far passare anni.', W / 2, 88, '#c9a35f', { size: 9 });
    drawText(`Punti Montanaro: ${sc} / ${MAX_SCORE}`, W / 2, 104, '#9fe3d8', { size: 12 });
    const rank = sc >= MAX_SCORE ? 'Grado: Leggenda della Baita' : sc >= MAX_SCORE * 0.8 ? 'Grado: Montanaro vero' : sc >= MAX_SCORE * 0.5 ? 'Grado: Boscaiolo della domenica' : 'Grado: Turista';
    drawText(rank, W / 2, 118, '#f6e43a', { size: 10 });
    if (Game.t > Game.endT + 1.5) drawText(IS_TOUCH ? 'Tocca per tornare al titolo' : 'Clicca per tornare al titolo', W / 2, 186, '#a89878', { size: 9 });
  }
}

function render() {
  lctx.clearRect(0, 0, W, H);
  if (Game.mode === 'play') {
    renderScene(); drawPanel(); drawHintPanel(); drawHintButton();
    if (Game.menu) { lctx.fillStyle = 'rgba(8,5,2,0.78)'; lctx.fillRect(80, 14, 160, 128); }
  }
  else if (Game.mode === 'title') renderTitleLow();
  else if (Game.mode === 'end') renderEndLow();
  else if (Game.mode === 'select') renderSelectLow();
  else if (Game.mode === 'chapters') renderChaptersLow();
  else if (Game.mode === 'mini') Game.mini.renderLow();
  else { lctx.fillStyle = '#000'; lctx.fillRect(0, 0, W, H); }
  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(low, 0, 0, screenCv.width, screenCv.height);
  if (Game.mode === 'play') renderTextPlay();
  else if (Game.mode === 'title') renderTitleText();
  else if (Game.mode === 'end') renderEndText();
  else if (Game.mode === 'select') renderSelectText();
  else if (Game.mode === 'chapters') renderChaptersText();
  else if (Game.mode === 'mini') Game.mini.renderText();
  else drawText('Caricamento...', W / 2, H / 2, '#d8b878', { size: 12 });
  if (Game.fade > 0.005) {
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.fillStyle = `rgba(0,0,0,${Game.fade})`;
    sctx.fillRect(0, 0, screenCv.width, screenCv.height);
  }
  drawCursor();
}

let _last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - _last) / 1000); _last = now;
  // un errore in un fotogramma non deve bloccare il gioco per sempre
  try { update(dt); render(); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
