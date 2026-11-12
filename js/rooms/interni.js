'use strict';
/* =========================================================
   STRUMENTI COMUNI PER LE STANZE DELLA BAITA
   perlinato, cotto, stucco, travi, pizzo, porte, quadri,
   giorno/notte
   ========================================================= */

// notte: finale, capitolo 2, oppure forzata (modalità dev o storia futura)
function isNight() { const f = Game.flags; return !!(f.finale || f.notte || (Game.chapter >= 2 && Game.chapter <= 6)); }

// sfondo con versione giorno e notte, disegnate solo quando servono
function dayNightBg(room, paint) {
  const n = isNight();
  if (n) return room._bgN || (room._bgN = paint(true));
  return room._bgD || (room._bgD = paint(false));
}

// perlinato di pino con i nodi (assi verticali larghe bw pixel)
const PINE = ['#7e4418', '#9a5a24', '#b4702e', '#c8843c', '#d8984c', '#e4ac62'];
function pineShader(seed, bw = 5, shade = 0) {
  return (x, y) => {
    const board = Math.floor(x / bw), k = x - board * bw;
    if (k === 0) return shade > 0.3 ? '#3a1e0a' : '#4e2a10';
    const cell = Math.floor(y / 21);
    if (hash2(board, cell, seed + 2) < 0.12) {
      const kx = board * bw + 1.5 + hash2(board, cell, seed) * (bw - 3);
      const ky = cell * 21 + 4 + hash2(board, cell, seed + 1) * 13;
      const d = Math.hypot(x - kx, (y - ky) * 0.6);
      if (d < 0.9) return '#4a220a';
      if (d < 1.8) return '#7a3e14';
    }
    const grain = vnoise(x * 0.8, y / 6 + board * 13, seed + 3);
    const base = hash2(board, 0, seed + 4) * 0.3;
    return ramp(PINE, clamp(0.2 + base + grain * 0.4 + (k === 1 ? 0.12 : 0) - shade, 0, 0.999), x, y);
  };
}

// stucco "a spatola" (muri bianchi o crema)
function stuccoShader(pal, seed) {
  return (x, y) => {
    const n = fbm(x / 6, y / 5, seed, 3);
    const s = vnoise(x / 2.4 + n * 3, y / 1.7, seed + 1);
    return ramp(pal, clamp(0.4 + (n - 0.5) * 0.7 + (s - 0.5) * 0.4, 0, 0.999), x, y);
  };
}

// piastrelle di cotto viste dall'alto in prospettiva (righe sempre più alte verso chi guarda)
// P = { yb: riga del muro di fondo, yh: orizzonte, f: profondità, vpx: punto di fuga (null = colonne verticali) }
function cottoShader(P, seed = 5, tile = 16) {
  const pal = ['#6e2e14', '#84381a', '#96441e', '#a65026', '#b45e30', '#c06c3a'];
  const cell = (x, y) => {
    const k = (P.yb - P.yh) / (y - P.yh);
    const X = P.vpx == null ? x : P.vpx + (x - P.vpx) * k;
    return [X / tile, P.f * (1 - k) / (tile * 0.8)];
  };
  return (x, y) => {
    const [u, v] = cell(x + 0.5, y + 0.5);
    const [u2] = cell(x + 1.5, y + 0.5), [, v2] = cell(x + 0.5, y + 1.5);
    if (Math.floor(u) !== Math.floor(u2) || Math.floor(v) !== Math.floor(v2)) return '#4a1e0c';
    const id = hash2(Math.floor(u), Math.floor(v), seed);
    const t = clamp(0.25 + id * 0.45 + (vnoise(x / 3, y / 2, seed + 1) - 0.5) * 0.3 + (y - P.yb) / 120, 0, 0.999);
    return hash2(x, y, seed + 2) < 0.01 ? '#5a2410' : ramp(pal, t, x, y);
  };
}

// pizzo bianco: buchi a rombo (trasparenti, si vede il vetro dietro)
function laceShader(seed, base = '#f2efe6') {
  return (x, y) => {
    const cx = ((x % 6) + 6) % 6, cy = ((y % 6) + 6) % 6;
    const d = Math.abs(cx - 3) + Math.abs(cy - 3);
    if (d === 0 || d === 2) return null;
    if (d === 4 && ((x + y) & 1)) return '#d8d4c8';
    return hash2(x, y, seed) < 0.08 ? '#dcd8cc' : base;
  };
}
// bordo smerlato in fondo a una tenda
function laceHem(b, x0, x1, y) {
  for (let x = x0; x <= x1; x++) {
    const k = (x - x0) % 6;
    const h = k === 0 || k === 5 ? 1 : k === 1 || k === 4 ? 2 : 3;
    for (let j = 0; j < h; j++) b.set(x, y + j, (j === h - 1) ? '#cfcabd' : '#f2efe6');
  }
}

// vetro di una finestra: cielo di giorno o di notte (con stelle)
function glassShader(night, seed) {
  return (x, y) => {
    if (night) return hash2(x, y, seed) < 0.02 ? '#8aa0d0' : ramp(['#070b1e', '#0c1430', '#142040'], hash2(x >> 1, y >> 1, seed + 1) * 0.5 + 0.2, x, y);
    return ramp(['#9cc4e8', '#b4d4f0', '#cce2f4', '#e0eef8'], clamp((y % 40) / 40 * 0.4 + hash2(x, y, seed) * 0.3 + 0.2, 0, 0.999), x, y);
  };
}

// cornice di legno o dorata, con un dipinto dentro
function picture(b, x, y, w, h, gold, paint) {
  const outer = gold ? ['#6a4a18', '#a87c2a', '#d8b050'] : ['#2a160a', '#4a2a14', '#6a4022'];
  b.rect(x, y, w, h, outer[0]);
  b.rect(x + 1, y + 1, w - 2, h - 2, outer[1]);
  b.rect(x + 1, y + 1, w - 2, 1, outer[2]); b.rect(x + 1, y + 1, 1, h - 2, outer[2]);
  b.rect(x + 2, y + 2, w - 4, h - 4, outer[0]);
  paint(x + 3, y + 3, w - 6, h - 6);
}

// porta di legno a pannelli
function woodDoor(b, x, y, w, h, o = {}) {
  const pal = o.pal || ['#4a2a14', '#5e3820', '#6e4428', '#7e5030'];
  b.rect(x - 2, y - 2, w + 4, h + 2, o.frame || '#3a2010');
  b.rect(x - 2, y - 2, w + 4, 1, o.frameHi || '#6a4426');
  b.rect(x, y, w, h, (px, py) => ramp(pal, clamp(0.3 + vnoise(px * 0.9, py / 8, 911) * 0.5 + (((px - x) % 6) === 0 ? -0.3 : 0), 0, 0.999), px, py));
  // pannelli
  const pw = w - 6, ph = Math.floor((h - 10) / 2);
  for (const py of [y + 3, y + 6 + ph]) {
    b.rect(x + 3, py, pw, ph, (px, qy) => ramp(pal, clamp(0.15 + vnoise(px, qy / 6, 912) * 0.4, 0, 0.999), px, qy));
    b.rect(x + 3, py, pw, 1, pal[0]); b.rect(x + 3, py, 1, ph, pal[0]);
    b.rect(x + 3, py + ph - 1, pw, 1, pal[3]); b.rect(x + 2 + pw, py, 1, ph, pal[3]);
  }
  // maniglia
  const hx = o.handleLeft ? x + 3 : x + w - 5;
  b.rect(hx, y + Math.floor(h * 0.52), 3, 1, '#d8c070'); b.set(hx + (o.handleLeft ? 0 : 2), y + Math.floor(h * 0.52) + 1, '#a88a40');
}

// travi orizzontali scure con luce sul bordo
function beamH(b, x, y, w, h, pal = ['#1e120a', '#2a1a0e', '#3a2414', '#4e3220']) {
  b.rect(x, y, w, h, (px, py) => ramp(pal, clamp(0.2 + vnoise(px / 6, py, 913) * 0.5 + (py === y ? 0.4 : 0) - (py === y + h - 1 ? 0.3 : 0), 0, 0.999), px, py));
}

// strisce LED: tanti puntini luminosi
function ledStrip(b, x0, x1, y, step = 2) {
  for (let x = x0; x <= x1; x++) b.set(x, y, (x % step) ? '#fffbe6' : '#d8d2b8');
}

// percorso tra stanze per l'aiuto: ritorna l'hotspot (uscita) da usare per andare verso "to"
function routeExit(from, to) {
  if (from === to) return null;
  const prev = { [from]: null }, q = [from];
  while (q.length) {
    const r = q.shift();
    if (r === to) break;
    const links = (ROOMS[r] && ROOMS[r].links) || {};
    for (const n in links) if (!(n in prev)) { prev[n] = r; q.push(n); }
  }
  if (!(to in prev)) return null;
  let step = to;
  while (prev[step] !== from) step = prev[step];
  return ROOMS[from].links[step];
}
