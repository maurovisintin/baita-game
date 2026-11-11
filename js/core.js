'use strict';
/* =========================================================
   CORE: canvas, pixel buffer, rumore, testo, input
   Risoluzione logica 320x200 (scena 320x144 + interfaccia)
   ========================================================= */
const W = 320, H = 200, SH = 144;

const screenCv = document.getElementById('screen');
const sctx = screenCv.getContext('2d');
const low = document.createElement('canvas');
low.width = W; low.height = H;
const lctx = low.getContext('2d');
lctx.imageSmoothingEnabled = false;
let K = 3; // pixel device per pixel logico

const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const aw = window.innerWidth * dpr, ah = window.innerHeight * dpr;
  let k = Math.min(aw / W, ah / H);
  // scala intera (pixel perfetti) solo se non spreca più del 10% dello schermo
  if (k >= 2 && Math.floor(k) / k > 0.9) k = Math.floor(k);
  K = Math.max(0.5, k);
  screenCv.width = Math.round(W * K);
  screenCv.height = Math.round(H * K);
  screenCv.style.width = (screenCv.width / dpr) + 'px';
  screenCv.style.height = (screenCv.height / dpr) + 'px';
  sctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

/* ---------- utilità ---------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const pick = arr => arr[(Math.random() * arr.length) | 0];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const _colCache = new Map();
function col(c) {
  if (typeof c === 'number') return c;
  let v = _colCache.get(c);
  if (v === undefined) {
    let h = c.replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
    v = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    _colCache.set(c, v);
  }
  return v;
}
function hexMix(c1, c2, t) {
  const a = col(c1), b = col(c2);
  const r = Math.round(lerp(a & 255, b & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  return '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('');
}

/* ---------- rumore deterministico ---------- */
function hash2(x, y, s = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s = 0, oct = 4) {
  let t = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { t += amp * vnoise(x * f, y * f, s + i * 31); n += amp; amp *= 0.5; f *= 2; }
  return t / n;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function dz(x, y, t) { return t * 16 > BAYER4[((y & 3) << 2) | (x & 3)] + 0.5; }
// sceglie un colore da una rampa con dithering ordinato
function ramp(cols, t, x, y) {
  t = clamp(t, 0, 0.9999);
  const f = t * (cols.length - 1), i = Math.floor(f);
  return dz(x, y, f - i) ? cols[i + 1] : cols[i];
}

/* ---------- buffer di pixel ---------- */
class Buf {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.img = new ImageData(w, h);
    this.d = new Uint32Array(this.img.data.buffer);
  }
  set(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const v = typeof c === 'function' ? c(x, y) : c;
    if (v == null) return;
    this.d[y * this.w + x] = col(v);
  }
  get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? 0 : this.d[y * this.w + x]; }
  span(x0, x1, y, c) {
    y = Math.round(y);
    if (y < 0 || y >= this.h) return;
    x0 = Math.max(0, Math.round(x0)); x1 = Math.min(this.w - 1, Math.round(x1));
    // c === null cancella (trasparente); una funzione che ritorna null salta il pixel
    const fn = typeof c === 'function', cv = fn || c == null ? 0 : col(c), row = y * this.w;
    for (let x = x0; x <= x1; x++) {
      if (fn) { const v = c(x, y); if (v != null) this.d[row + x] = col(v); }
      else this.d[row + x] = cv;
    }
  }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) this.span(x, x + w - 1, y + j, c); }
  poly(pts, c) {
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    minY = Math.max(0, Math.floor(minY)); maxY = Math.min(this.h - 1, Math.ceil(maxY));
    for (let y = minY; y <= maxY; y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > yc) !== (yj > yc)) xs.push(xi + (yc - yi) / (yj - yi) * (xj - xi));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) this.span(Math.round(xs[k]), Math.round(xs[k + 1]) - 1, y, c);
    }
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let dy = -ry; dy <= ry; dy++) {
      const t = dy / (ry + 0.5);
      const hw = (rx + 0.5) * Math.sqrt(Math.max(0, 1 - t * t));
      this.span(Math.round(cx - hw + 0.5), Math.round(cx + hw - 0.5), cy + dy, c);
    }
  }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  thick(x0, y0, x1, y1, w, c) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      this.rect(Math.round(x - (w - 1) / 2), Math.round(y - (w - 1) / 2), w, w, c);
    }
  }
  // disegna una mappa di caratteri (sprite piccoli)
  map(x, y, rows, pal, flip = false) {
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const ch = r[i];
        if (ch === '.' || ch === ' ') continue;
        const c = pal[ch];
        if (c) this.set(x + (flip ? r.length - 1 - i : i), y + j, c);
      }
    }
  }
  canvas() {
    const cv = document.createElement('canvas');
    cv.width = this.w; cv.height = this.h;
    cv.getContext('2d').putImageData(this.img, 0, 0);
    return cv;
  }
}

function flipCanvas(cv) {
  const f = document.createElement('canvas');
  f.width = cv.width; f.height = cv.height;
  const g = f.getContext('2d');
  g.translate(cv.width, 0); g.scale(-1, 1); g.drawImage(cv, 0, 0);
  return f;
}

const _cache = new Map();
function cached(key, build) {
  let v = _cache.get(key);
  if (!v) { v = build(); _cache.set(key, v); }
  return v;
}

/* ---------- testo (disegnato ad alta risoluzione sopra i pixel) ---------- */
const FONT_FAMILY = '"VT323", "Courier New", monospace';
const mcv = document.createElement('canvas');
const mctx = mcv.getContext('2d');
function setFont(g, size) { g.font = `${size}px ${FONT_FAMILY}`; }
function measure(str, size) { setFont(mctx, size); return mctx.measureText(str).width; }
function wrapText(str, maxW, size) {
  const out = [];
  for (const para of String(str).split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (measure(t, size) > maxW && line) { out.push(line); line = w; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}
function drawText(str, x, y, color, o = {}) {
  const g = sctx;
  g.save();
  g.setTransform(K, 0, 0, K, 0, 0);
  setFont(g, o.size || 10);
  g.textAlign = o.align || 'center';
  g.textBaseline = 'alphabetic';
  if (o.alpha != null) g.globalAlpha = o.alpha;
  if (o.outline !== false) {
    g.lineJoin = 'round';
    g.lineWidth = o.ow || 2;
    g.strokeStyle = o.oc || '#000';
    g.strokeText(str, x, y);
  }
  g.fillStyle = color;
  g.fillText(str, x, y);
  g.restore();
}

/* ---------- input (mouse + touch) ---------- */
const mouse = { x: -100, y: -100, inside: false, touch: false };
let _lp = null; // long-press timer
function _pos(e) {
  const r = screenCv.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * W / r.width;
  mouse.y = (e.clientY - r.top) * H / r.height;
}
screenCv.addEventListener('pointermove', e => {
  _pos(e); mouse.inside = true;
  if (_lp && Math.hypot(mouse.x - _lp.x, mouse.y - _lp.y) > 6) { clearTimeout(_lp.t); _lp = null; }
});
screenCv.addEventListener('pointerleave', () => { if (!mouse.touch) mouse.inside = false; });
screenCv.addEventListener('pointerdown', e => {
  e.preventDefault();
  _pos(e); mouse.inside = true;
  mouse.touch = e.pointerType === 'touch' || e.pointerType === 'pen';
  if (window.SFX) SFX.init();
  if (mouse.touch) {
    // pressione lunga = tasto destro (azione predefinita)
    const x = mouse.x, y = mouse.y;
    _lp = { x, y, fired: false, t: setTimeout(() => { if (_lp) { _lp.fired = true; Game.click(2, true); } }, 450) };
  } else {
    Game.click(e.button === 2 ? 2 : 0, false);
  }
});
screenCv.addEventListener('pointerup', e => {
  if (mouse.touch && _lp) {
    clearTimeout(_lp.t);
    if (!_lp.fired) Game.click(0, true);
    _lp = null;
  }
});
screenCv.addEventListener('pointercancel', () => { if (_lp) { clearTimeout(_lp.t); _lp = null; } });
screenCv.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => { if (window.Game) Game.key(e); });
document.addEventListener('gesturestart', e => e.preventDefault());
