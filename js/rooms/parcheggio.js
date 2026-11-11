'use strict';
/* =========================================================
   STANZA 1: IL PARCHEGGIO DELLA BAITA
   Obiettivo: motosega + benzina (miscela) -> tagliare la legna
   ========================================================= */
const RW = 600;          // larghezza stanza
const PF = 0.35;         // fattore parallasse montagne
const PARA_W = Math.ceil(W + (RW - W) * PF);

/* ---------- attori secondari ---------- */
const gino = makeActor({ name: 'Gino', color: '#9fe0ff', x: 238, y: 117, headPos: () => [238, 68] });
const mag = { x: 86, y: 25, st: 'perch', t: 0, flip: false, hopT: 4, chirpT: 6, from: null, to: null, per: 0 };
const PERCH = [[86, 25], [104, 20]];
const gazza = makeActor({ name: 'Gazza', color: '#ffffff', headPos: () => [mag.x, mag.y - 10] });

/* ---------- palette ---------- */
const PAL = {
  yellow: ['#7a5a12', '#b0861a', '#dcae26', '#f2d04a', '#fae88a'],
  orange: ['#6a2e10', '#a04c18', '#d07222', '#ec9a3a', '#f6c070'],
  rust: ['#4e2210', '#7e3618', '#aa4e24', '#cc7040', '#e09a68'],
  green: ['#1e2c16', '#34461f', '#4e622a', '#6c7c38', '#8c9a4c'],
  fir: ['#0e1e14', '#17301e', '#22432a', '#2f5836', '#41704a'],
  grass: ['#34561f', '#41682a', '#4f7a32', '#5e8a3a', '#6e9a44'],
  leaves: ['#e0b030', '#c87020', '#8a5a20', '#f0d050', '#b84a20'],
};

/* ---------- utilità di disegno ---------- */
function crownBlobs(b, r, cx, cy, w, h, pal, n) {
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r());
    const x = cx + Math.cos(a) * rr * w / 2, y = cy + Math.sin(a) * rr * h / 2;
    const rad = 2 + ((r() * 3) | 0);
    const light = clamp(0.45 + (x - cx) / w * 0.7 - (y - cy) / h * 0.6 + (r() - 0.5) * 0.35, 0.02, 0.98);
    b.ellipse(Math.round(x), Math.round(y), rad, Math.max(1, rad - 1), (px, py) => {
      if (hash2(px, py, 91) < 0.06) return null;
      return ramp(pal, clamp(light + ((px - x) - (py - y)) / (rad * 5), 0, 0.999), px, py);
    });
  }
}
function firTree(b, cx, top, bot, hw, seed = 0) {
  b.rect(cx - 1, top + 10, 3, bot - top - 10, '#2a1e14');
  for (let y = top; y <= bot; y++) {
    const t = (y - top) / (bot - top);
    const tier = ((y - top + seed) % 9) / 9;
    const w = hw * Math.pow(t, 0.9) * (0.5 + 0.5 * tier) + 1;
    for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) {
      const u = (x - cx) / (w + 0.01), n = hash2(x, y, 55 + seed);
      if (Math.abs(u) > 0.8 && n < 0.35) continue;
      const tone = clamp(0.4 + u * 0.38 + (n - 0.5) * 0.35 - tier * 0.2, 0, 0.999);
      b.set(x, y, ramp(PAL.fir, tone, x, y));
    }
  }
}
function stoneShader(seed, cell, cols, mortar, sy = 0.7) {
  return (x, y) => {
    const ch = cell * sy;
    const gx = Math.floor(x / cell), gy = Math.floor(y / ch);
    let d1 = 1e9, d2 = 1e9, id = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const cx = (gx + i + 0.2 + hash2(gx + i, gy + j, seed) * 0.6) * cell;
      const cy = (gy + j + 0.2 + hash2(gx + i, gy + j, seed + 1) * 0.6) * ch;
      const d = Math.hypot(x - cx, (y - cy) / sy);
      if (d < d1) { d2 = d1; d1 = d; id = hash2(gx + i, gy + j, seed + 2); } else if (d < d2) d2 = d;
    }
    if (d2 - d1 < 1.2) return mortar;
    const base = cols[Math.floor(id * cols.length)];
    return hash2(x, y, seed + 9) < 0.08 ? hexMix(base, '#000000', 0.15) : base;
  };
}
function plaster(cols) { return (x, y) => ramp(cols, vnoise(x / 3, y / 3, 17) * 0.8 + hash2(x, y, 4) * 0.2, x, y); }

/* ---------- sfondo lontano (parallasse) ---------- */
function paintParallax() {
  const b = new Buf(PARA_W, SH);
  const sky = ['#2756bc', '#3466c8', '#4478d4', '#5a8ade', '#749ee6', '#8eb4ee', '#a8c8f2'];
  for (let y = 0; y < SH; y++) for (let x = 0; x < PARA_W; x++) b.d[y * PARA_W + x] = col(ramp(sky, y / 104, x, y));
  // montagne calcaree lontane
  const ctrl = [[0, 44], [40, 28], [92, 12], [130, 26], [170, 32], [214, 16], [258, 5], [300, 18], [338, 30], [380, 34], [PARA_W, 46]];
  const ridge = x => {
    let i = 0; while (i < ctrl.length - 2 && x > ctrl[i + 1][0]) i++;
    const [x0, y0] = ctrl[i], [x1, y1] = ctrl[i + 1];
    return lerp(y0, y1, (x - x0) / (x1 - x0)) + (fbm(x / 16, 0.3, 1, 4) - 0.5) * 14;
  };
  const haze = '#a8c4e8';
  const rock = ['#7e8090', '#9a9aa2', '#b4b2ae', '#cac6bc', '#dcd8cc'].map(c => hexMix(c, haze, 0.3));
  const forestG = ['#33452e', '#45573a', '#5a6a40'].map(c => hexMix(c, haze, 0.32));
  const forestA = ['#6a5030', '#8e6434', '#a87a3a', '#7a4a2a'].map(c => hexMix(c, haze, 0.32));
  for (let x = 0; x < PARA_W; x++) {
    const top = Math.round(ridge(x));
    for (let y = Math.max(0, top); y < SH; y++) {
      const depth = y - top;
      const vegT = clamp((y - 34) / 46, 0, 1);
      const isRock = fbm(x / 9, y / 14, 5, 3) > 0.42 + vegT * 0.32 || depth < 2 && y < 30;
      let c;
      if (isRock) {
        const streak = fbm(x / 2.2, y / 22, 9, 3);
        const lit = (ridge(x + 2) - ridge(x - 2)) < 0 ? 0.2 : -0.1;
        c = ramp(rock, clamp(streak * 0.9 + lit + 0.1, 0, 0.999), x, y);
      } else {
        const autumn = fbm(x / 14, y / 10, 13, 2) > 0.52;
        const pal = autumn ? forestA : forestG;
        c = pal[Math.floor(hash2(x >> 1, y >> 1, 3) * pal.length)];
      }
      if (depth === 0) c = hexMix(c, '#ffffff', 0.2);
      b.d[y * PARA_W + x] = col(c);
    }
  }
  // crinale boscoso vicino
  const r = rng(77);
  const near = x => 62 + Math.sin(x / 47) * 7 + Math.sin(x / 19 + 1) * 3 + (fbm(x / 10, 2, 7, 3) - 0.5) * 8;
  for (let x = 0; x < PARA_W; x++) for (let y = Math.round(near(x)); y < SH; y++) b.set(x, y, ramp(['#1c2a18', '#26341e'], hash2(x, y, 8), x, y));
  for (let i = 0; i < 1500; i++) {
    const x = r() * PARA_W, top = near(x), y = top + r() * (SH - top);
    const k = r();
    const pal = k < 0.32 ? PAL.fir : k < 0.55 ? PAL.yellow : k < 0.75 ? PAL.orange : k < 0.88 ? PAL.rust : PAL.green;
    const rad = 2 + (r() * 2 | 0);
    const light = 0.35 + r() * 0.35;
    if (pal === PAL.fir) {
      for (let j = 0; j < rad * 3; j++) { const w = Math.floor(j / 2); b.span(Math.round(x) - w, Math.round(x) + w, Math.round(y) - rad * 3 + j, (px, py) => ramp(PAL.fir, clamp(light + (px - x) / 10, 0, 0.99), px, py)); }
    } else b.ellipse(Math.round(x), Math.round(y), rad, rad - 1, (px, py) => ramp(pal, clamp(light + ((px - x) - (py - y)) / 8, 0, 0.99), px, py));
  }
  return b.canvas();
}

/* ---------- sfondo della stanza ---------- */
function paintRoom() {
  const b = new Buf(RW, SH);
  const r = rng(1234);

  /* alberi sullo sfondo */
  crownBlobs(b, r, 18, 44, 50, 34, PAL.green, 60);
  crownBlobs(b, r, 300, 26, 110, 56, PAL.yellow, 260);
  crownBlobs(b, r, 268, 40, 60, 40, PAL.orange, 90);
  crownBlobs(b, r, 352, 30, 70, 60, PAL.orange, 200);
  crownBlobs(b, r, 384, 52, 60, 40, PAL.rust, 110);
  for (const tx of [292, 318, 356, 378, 398]) b.rect(tx, 56, 2, 46, (x, y) => ramp(['#5a5a52', '#7e7c72', '#9a988c'], hash2(x, y, 2), x, y));
  firTree(b, 430, 4, 100, 20, 3);
  crownBlobs(b, r, 486, 26, 70, 54, PAL.yellow, 220);
  crownBlobs(b, r, 470, 54, 40, 30, PAL.green, 60);
  firTree(b, 548, -6, 98, 30, 5);
  crownBlobs(b, r, 594, 30, 40, 70, PAL.yellow, 120);
  // sottobosco in fondo
  b.rect(0, 92, RW, 8, (x, y) => ramp(['#1e2614', '#2a3418', '#3a4420'], (y - 92) / 8 + hash2(x, y, 6) * 0.3, x, y));

  /* terreno: erba */
  b.rect(0, 98, RW, SH - 98, (x, y) => {
    if (hash2(x, y, 77) < 0.07) return PAL.leaves[Math.floor(hash2(x, y, 78) * PAL.leaves.length)];
    return ramp(PAL.grass, clamp(vnoise(x / 5, y / 3, 3) * 0.6 + (y - 98) / 46 * 0.4, 0, 0.999), x, y);
  });
  // tappeto di foglie sotto il noce
  b.rect(0, 112, 90, 32, (x, y) => {
    const d = Math.hypot((x - 24) / 70, (y - 132) / 22);
    if (d > 1 || hash2(x, y, 40) > 0.75 - d * 0.5) return null;
    return ['#8a6a30', '#a07a34', '#6e5226', '#c49a40'][Math.floor(hash2(x, y, 41) * 4)];
  });
  /* vialetto in ghiaia */
  const gravel = (x, y) => {
    const h = hash2(x, y, 12);
    if (hash2(x, y, 13) < 0.015) return PAL.leaves[Math.floor(hash2(x, y, 14) * 5)];
    return h < 0.15 ? '#857f72' : h < 0.5 ? '#9e988a' : h < 0.85 ? '#b0aa9c' : '#c6c0b2';
  };
  b.poly([[92, 112], [350, 112], [358, 104], [400, 101], [442, 104], [474, 113], [482, 144], [84, 144]], gravel);
  // bordo erboso irregolare
  for (let x = 84; x < 482; x++) { if (hash2(x, 0, 30) < 0.5) b.set(x + 0, 143 - (hash2(x, 1, 30) * 2 | 0), '#4f7a32'); }
  /* lastricato sotto la tettoia */
  b.poly([[98, 112], [346, 112], [350, 125], [94, 125]], stoneShader(21, 9, ['#8e8a80', '#9a958a', '#a6a094', '#868076', '#b0aa9c'], '#5c574e', 0.55));

  /* ala sinistra della casa */
  const roofTopL = x => 63 - (x - 24) * 19 / 86, roofBotL = x => 69 - (x - 24) * 18 / 86;
  b.poly([[36, 68], [108, 52], [108, 112], [36, 112]], plaster(['#cdc7bb', '#dbd6cb', '#e7e3d9', '#efebe2']));
  b.poly([[36, 68], [108, 52], [108, 56], [36, 72]], (x, y) => dz(x, y, 0.5) ? '#a8a296' : '#bcb6aa');
  b.rect(36, 106, 72, 6, stoneShader(5, 5, ['#7e7a70', '#8a867c', '#96928a'], '#5a564e'));
  // finestra con tendine
  b.rect(44, 74, 7, 21, (x, y) => (y % 3 === 0) ? '#4e2e18' : '#6a4226');
  b.rect(73, 74, 7, 21, (x, y) => (y % 3 === 0) ? '#4e2e18' : '#6a4226');
  b.rect(51, 74, 22, 21, '#3a2414');
  b.rect(52, 75, 20, 19, '#283440');
  b.line(53, 92, 66, 76, '#40566a'); b.line(56, 92, 69, 76, '#344858');
  b.rect(52, 75, 20, 11, (x, y) => (hash2(x, y, 60) < 0.25 || ((x + y) % 4 === 0)) ? '#f2f0e8' : (((x * 3 + y) % 5) ? '#dedad0' : null));
  b.rect(52, 86, 20, 1, '#cfcac0');
  b.rect(61, 75, 2, 19, '#3a2414'); b.rect(52, 84, 20, 1, '#3a2414');
  b.rect(49, 95, 26, 2, '#c8c2b6'); b.rect(49, 97, 26, 1, '#8a857a');
  // rubinetto
  b.rect(93, 92, 5, 3, '#8a8a8a'); b.rect(96, 90, 2, 2, '#b03030'); b.rect(97, 95, 2, 2, '#7a7a7a');
  // tetto ala sinistra (coppi)
  b.poly([[22, 63], [112, 44], [112, 50], [22, 69]], (x, y) => {
    const v = y - roofTopL(x);
    const row = Math.floor(v / 2.5);
    if (hash2(x, y, 81) < 0.04) return '#c89a30';
    if (((x + row * 3) % 6) === 0) return '#5c321e';
    return (v % 2.5) < 1 ? '#a8673e' : '#84492c';
  });
  b.poly([[22, 69], [112, 50], [112, 52], [22, 71]], '#3a2214');

  /* corpo principale: piano terra (in ombra sotto la tettoia) */
  b.rect(108, 57, 238, 55, plaster(['#9a958b', '#a6a197', '#b0aba1', '#bab5ab']));
  b.rect(108, 106, 238, 6, stoneShader(6, 5, ['#6a665e', '#76726a', '#827e74'], '#4a463e'));
  // porta di casa
  b.rect(154, 64, 22, 48, '#3a2414');
  b.rect(156, 66, 18, 46, (x, y) => ((x - 156) % 4 === 0) ? '#3e2614' : (hash2(x, y >> 2, 5) < 0.5 ? '#5e3e24' : '#563820'));
  b.rect(156, 82, 18, 2, '#4a2e18'); b.rect(156, 100, 18, 2, '#4a2e18');
  b.rect(171, 89, 2, 3, '#c8b060'); b.rect(152, 112, 26, 2, '#8a867c');
  // finestra sotto la tettoia
  b.rect(183, 76, 19, 17, '#c6c0b4'); b.rect(185, 78, 15, 13, '#1a1e24'); b.line(186, 89, 196, 79, '#30404e');
  b.rect(192, 78, 1, 13, '#c6c0b4'); b.rect(185, 84, 15, 1, '#c6c0b4');
  // lanterna
  b.rect(146, 74, 5, 7, '#2a2a2a'); b.rect(147, 75, 3, 5, '#e8c070'); b.rect(148, 72, 1, 2, '#2a2a2a');
  // deposito dietro la Punto
  b.rect(266, 76, 40, 36, '#3a2414');
  b.rect(268, 78, 36, 34, (x, y) => ((x - 268) % 5 === 0) ? '#2e1c10' : '#4a2f1c');
  // panca
  b.rect(312, 98, 30, 3, '#5a3c22'); b.rect(314, 101, 2, 11, '#3a2414'); b.rect(338, 101, 2, 11, '#3a2414');
  // sedie nere e tavolo con tovaglia a quadri
  for (const cx of [184, 191]) {
    b.rect(cx, 88, 6, 1, '#2a2a2e'); b.rect(cx, 88, 1, 26, '#222226'); b.rect(cx + 5, 88, 1, 16, '#222226');
    b.rect(cx, 93, 6, 1, '#2a2a2e'); b.rect(cx, 103, 7, 2, '#2a2a2e'); b.rect(cx + 6, 105, 1, 9, '#222226');
  }
  const check = (x, y) => (((x >> 1) + (y >> 1)) & 1) ? '#3a8a4a' : '#e8e8de';
  b.rect(200, 102, 2, 12, '#4a3020'); b.rect(221, 102, 2, 12, '#4a3020');
  b.poly([[198, 96], [224, 96], [226, 99], [196, 99]], check);
  b.rect(196, 99, 31, 4, (x, y) => hexMix(check(x, y), '#000000', 0.2));
  b.rect(209, 89, 3, 7, '#2a5a2a'); b.rect(210, 87, 1, 2, '#2a5a2a'); b.set(209, 90, '#5a9a5a');
  b.rect(214, 94, 6, 2, '#e8e0c8');

  /* barbecue in pietra */
  const stone = stoneShader(33, 5, ['#8a8680', '#9a958c', '#7a766e', '#a8a298', '#8e8478'], '#4e4a44');
  b.poly([[118, 70], [138, 70], [145, 86], [111, 86]], stone);
  b.rect(111, 86, 34, 26, stone);
  b.rect(110, 86, 36, 2, '#a8a49a'); b.rect(110, 88, 36, 1, '#6a665e');
  b.rect(117, 91, 22, 12, '#1a120c'); b.rect(118, 90, 20, 1, '#1a120c');
  b.rect(117, 99, 22, 1, '#5a5a5a'); for (let x = 118; x < 139; x += 3) b.set(x, 98, '#4a4a4a');
  b.rect(118, 101, 20, 2, '#6a6460');

  /* piano superiore in legno scuro */
  b.rect(108, 20, 146, 38, (x, y) => {
    const k = (x - 108) % 4;
    if (k === 0) return '#2a1a0e';
    const base = ['#4a2f1e', '#53351f', '#45291a'][Math.floor(hash2((x - 108) >> 2, 0, 8) * 3)];
    return hash2(x, y >> 1, 9) < 0.15 ? hexMix(base, '#000000', 0.25) : (k === 1 ? hexMix(base, '#ffffff', 0.08) : base);
  });
  b.rect(108, 25, 146, 2, '#22140a');
  // finestra con scuri
  b.rect(155, 29, 8, 18, (x, y) => (y % 3 === 0) ? '#4e2e18' : '#6e4628');
  b.rect(185, 29, 8, 18, (x, y) => (y % 3 === 0) ? '#4e2e18' : '#6e4628');
  b.rect(163, 29, 22, 18, '#e8e4dc'); b.rect(165, 31, 18, 14, '#1e242c');
  b.rect(173, 31, 2, 14, '#e8e4dc'); b.rect(165, 37, 18, 1, '#e8e4dc'); b.line(166, 44, 172, 32, '#3a4c5c');
  b.rect(162, 47, 24, 2, '#5a3a22');
  /* tetto principale */
  b.poly([[100, 22], [262, 22], [253, 3], [109, 3]], (x, y) => {
    const v = y - 3, row = Math.floor(v / 3), k = v % 3;
    if (hash2(x, y, 82) < 0.03) return PAL.leaves[Math.floor(hash2(x, y, 83) * 5)];
    if (k === 2) return '#5a2f1e';
    if (((x + (row % 2) * 2) % 5) === 0) return '#6a3a24';
    return k === 0 ? '#a2603c' : '#87492e';
  });
  b.rect(109, 3, 144, 1, '#5a2f1e');
  b.poly([[98, 22], [264, 22], [264, 25], [98, 25]], '#3a2416'); b.rect(98, 22, 166, 1, '#5e3e26');
  // comignolo con parabola
  b.rect(132, 0, 10, 8, (x, y) => x < 135 ? '#b2ac9f' : '#d8d3c8');
  b.rect(130, 0, 14, 2, '#7a766e');
  b.rect(142, 5, 4, 1, '#808080');
  b.ellipse(148, 5, 3, 4, (x, y) => x < 148 ? '#a8a8a8' : '#e2e2e2');
  b.set(147, 5, '#606060');

  /* tettoia */
  b.poly([[104, 57], [340, 57], [346, 68], [96, 68]], (x, y) => {
    const t = (y - 57) / 11, l = lerp(104, 96, t), rr = lerp(340, 346, t);
    const u = (x - l) / (rr - l);
    if (((u * 20) % 1) < 0.07) return '#6c6e62';
    if (hash2(x, y, 84) < 0.04) return PAL.leaves[Math.floor(hash2(x, y, 85) * 5)];
    const m = fbm(x / 7, y / 3, 40, 3);
    if (m > 0.6) return ramp(['#566a2c', '#6c7e38', '#86944a'], (m - 0.6) * 2.5, x, y);
    return ramp(['#7c7e70', '#8a8c7c', '#9a9c8c'], vnoise(x / 4, y / 2, 41), x, y);
  });
  b.rect(96, 68, 251, 1, '#b4b6a6'); b.rect(96, 69, 251, 2, '#4e4e44');
  b.rect(98, 71, 247, 2, '#5a3c22'); b.rect(98, 73, 247, 1, '#2e1c10');
  for (let x = 96; x < 347; x++) {
    const h = hash2(x, 0, 86);
    if (h < 0.4) { const len = 1 + (hash2(x, 1, 86) * 3 | 0); b.rect(x, 71, 1, len, h < 0.2 ? '#5e7a2a' : '#7a9a3a'); }
  }
  // canna fumaria del barbecue
  b.rect(125, 38, 6, 20, (x, y) => ['#e4e4e4', '#c4c4c4', '#b0b0b0', '#9a9a9a', '#868686', '#747474'][x - 125]);
  b.rect(122, 35, 12, 3, '#6a6a6a'); b.rect(123, 34, 10, 1, '#8a8a8a');
  b.rect(124, 57, 8, 2, '#5a5a52');

  /* baracca (pareti di tronchi) */
  b.rect(406, 66, 72, 46, (x, y) => {
    const v = (y - 66) % 4;
    if (v === 3) return '#2a190c';
    const base = v === 0 ? '#80603a' : v === 1 ? '#6a4a2c' : '#583c22';
    return hash2(x >> 1, y, 87) < 0.12 ? hexMix(base, '#000000', 0.2) : base;
  });
  for (let row = 0; row < 11; row++) {
    const cy = 66 + row * 4 + 1;
    for (const cx of row % 2 ? [404, 480] : [406, 478]) {
      b.ellipse(cx, cy + 1, 2, 2, '#b48a58'); b.set(cx, cy + 1, '#7a5a34');
    }
  }
  b.rect(406, 68, 72, 3, (x, y) => dz(x, y, 0.5) ? '#3a2614' : null);
  // sega appesa
  b.rect(462, 80, 12, 3, '#a8a8a8'); for (let x = 462; x < 474; x += 2) b.set(x, 83, '#6a6a6a'); b.rect(459, 79, 4, 5, '#6a4226');
  // tetto baracca
  b.poly([[402, 50], [484, 50], [491, 67], [395, 67]], (x, y) => {
    const v = y - 50, row = Math.floor(v / 3), k = v % 3;
    if (fbm(x / 5, y / 3, 44, 2) > 0.66) return '#5a6a34';
    if (hash2(x, y, 88) < 0.04) return PAL.leaves[Math.floor(hash2(x, y, 89) * 5)];
    if (k === 2) return '#342a24';
    if (((x + (row % 2) * 2) % 4) === 0) return '#3e322c';
    return k === 0 ? '#76665a' : '#5c4e46';
  });
  b.rect(395, 67, 97, 2, '#2e2018'); b.rect(395, 67, 97, 1, '#4a3a2e');

  /* legnaia */
  b.rect(490, 70, 66, 42, (x, y) => ((x - 490) % 6 === 0) ? '#1c140c' : '#2c2016');
  const woodEnd = (cx, cy) => {
    b.ellipse(cx, cy, 3, 2, (x, y) => hash2(x, y, 90) < 0.2 ? '#7a5430' : ramp(['#b8884c', '#c49658', '#d2a870'], hash2(cx, cy, 91), x, y));
    b.set(cx, cy, '#9a7040');
  };
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
    const cx = 494 + i * 7 + (row % 2) * 3 + (hash2(i, row, 92) * 2 | 0), cy = 109 - row * 5;
    if (row === 2 && (i < 2 || i > 6)) continue;
    if (cx < 553) woodEnd(cx, cy);
  }
  for (let row = 0; row < 3; row++) woodEnd(547 + (row % 2) * 3, 94 - row * 5);
  b.rect(488, 66, 3, 46, '#6a4a2c'); b.rect(554, 66, 3, 46, '#6a4a2c'); b.rect(489, 66, 1, 46, '#8a6640');
  b.poly([[482, 58], [562, 58], [567, 68], [477, 68]], (x, y) => {
    if (hash2(x, y, 93) < 0.05) return '#a0684a';
    const c = ((x >> 1) & 1) ? '#c4ccd2' : '#9aa4ae';
    return y < 60 ? hexMix(c, '#ffffff', 0.25) : c;
  });
  b.rect(477, 68, 90, 2, '#6a747c');

  /* noce (in primo piano a sinistra) */
  b.poly([[8, 144], [32, 144], [27, 104], [25, 64], [23, 28], [16, 28], [15, 64], [13, 104]], (x, y) => {
    const s = vnoise(x / 1.4, y / 9, 61);
    return ramp(['#3a2e24', '#4e4034', '#665444', '#7e6c58'], clamp(s * 0.6 + (x - 12) / 22 * 0.5, 0, 0.999), x, y);
  });
  const branch = (pts, w) => { for (let i = 0; i + 1 < pts.length; i++) b.thick(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w[i], '#54443a'); };
  branch([[22, 64], [54, 44], [84, 31], [108, 20]], [5, 4, 3]);
  branch([[20, 40], [6, 22], [0, 16]], [4, 3]);
  branch([[22, 50], [40, 26], [48, 10]], [3, 2]);
  branch([[60, 42], [70, 20]], [2]);
  b.line(24, 62, 54, 42, '#76665a'); b.line(54, 42, 84, 29, '#76665a');
  // chioma gialla, rada
  const rr = rng(4321);
  const clusters = [[42, 14, 26, 12], [78, 12, 26, 12], [106, 14, 16, 10], [12, 18, 18, 14], [56, 30, 14, 8], [92, 36, 12, 6], [28, 6, 20, 6]];
  for (let i = 0; i < 1300; i++) {
    const c = clusters[(rr() * clusters.length) | 0];
    const a = rr() * Math.PI * 2, d = Math.sqrt(rr());
    const x = Math.round(c[0] + Math.cos(a) * d * c[2]), y = Math.round(c[1] + Math.sin(a) * d * c[3]);
    if (Math.hypot(x - 90, y - 27) < 7) continue; // lascia visibile il nido
    const light = clamp(0.4 + (x - c[0]) / c[2] * 0.35 - (y - c[1]) / c[3] * 0.35 + (rr() - 0.5) * 0.4, 0, 0.999);
    const cc = ramp(PAL.yellow, light, x, y);
    b.set(x, y, cc); if (rr() < 0.6) b.set(x + 1, y, cc); if (rr() < 0.3) b.set(x, y + 1, hexMix(cc, '#000', 0.2));
  }
  // nido
  b.ellipse(90, 28, 6, 3, (x, y) => ['#5a3a1e', '#7a5430', '#3e2812', '#6a4626'][Math.floor(hash2(x, y, 95) * 4)]);
  b.rect(86, 26, 9, 1, '#2a1a0c');
  for (const [x, y] of [[83, 27], [97, 29], [84, 30], [96, 26], [89, 31]]) b.set(x, y, '#6a4626');

  /* felci */
  const fern = (bx, by, n, s) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.4;
      const len = 9 + (hash2(i, bx, 70) * 6 | 0);
      for (let j = 0; j < len; j++) {
        const t = j / len, x = bx + Math.cos(a) * j + Math.cos(a + 1.2) * t * t * 4 * Math.sign(Math.cos(a) || 1), y = by + Math.sin(a) * j * 0.8 + t * t * 5;
        const c = hash2(i, s, 71) < 0.25 ? '#9a7a3a' : (j % 2 ? '#4a7a2a' : '#6a9a3a');
        b.set(x, y, c);
        if (j % 2 === 0 && j > 1) { b.set(x - 1, y + 1, c); b.set(x + 1, y + 1, c); }
      }
    }
  };
  fern(100, 122, 7, 1); fern(8, 140, 6, 2); fern(36, 142, 5, 3);
  return b.canvas();
}

/* ---------- oggetti dinamici ---------- */
function canvasOf(key, w, h, paint) { return cached(key, () => { const b = new Buf(w, h); paint(b); return b.canvas(); }); }

function postCanvas() {
  return canvasOf('post', 20, 50, b => {
    b.thick(2, 2, 8, 9, 2, '#5a3c22'); b.thick(17, 2, 11, 9, 2, '#5a3c22');
    b.rect(8, 0, 4, 47, '#6a4a2a'); b.rect(8, 0, 1, 47, '#8a6640'); b.rect(11, 0, 1, 47, '#4a3018');
    for (let y = 4; y < 46; y += 7) b.set(9 + (y % 2), y, '#5a3c22');
    b.rect(7, 45, 6, 4, '#8a867c'); b.rect(7, 45, 6, 1, '#a8a49a');
  });
}
function hoseCanvas() {
  return canvasOf('hose', 30, 30, b => {
    // origine stanza (88,90)
    b.ellipse(10, 13, 6, 5, '#2e8a3a'); b.ellipse(10, 13, 4, 3, null);
    b.ellipse(11, 12, 5, 4, (x, y) => (x + y) % 3 ? null : '#3aa848');
    b.ellipse(10, 13, 4, 3, null);
    b.thick(9, 5, 9, 8, 2, '#2e8a3a');
    b.thick(13, 18, 15, 23, 2, '#2e8a3a'); b.thick(15, 23, 27, 27, 2, '#2e8a3a');
    b.set(7, 9, '#7ae07a'); b.set(14, 9, '#7ae07a');
  });
}
function puntoCanvas() {
  const f = Game.flags;
  const key = 'punto|' + !!f.tankOpen + '|' + !!f.hoseInCar + '|' + !!f.siphoning + '|' + !!f.siphoned;
  return canvasOf(key, 70, 42, b => {
    // origine stanza (262,88) ; base auto y=39 -> stanza 127
    b.ellipse(26, 39, 25, 2, (x, y) => dz(x, y, 0.6) ? '#2c2a24' : null);
    b.rect(6, 30, 7, 10, '#141414'); b.rect(39, 30, 7, 10, '#141414'); b.rect(6, 30, 7, 1, '#2a2a2a'); b.rect(39, 30, 7, 1, '#2a2a2a');
    b.poly([[9, 3], [43, 3], [47, 19], [5, 19]], '#c42028');
    b.rect(10, 3, 32, 1, '#e65058');
    b.poly([[11, 5], [41, 5], [44, 16], [8, 16]], '#22303c');
    b.line(13, 15, 20, 6, '#4a6070'); b.line(15, 15, 22, 6, '#3a5060'); b.line(30, 15, 34, 9, '#3a5060');
    b.line(18, 15, 30, 9, '#0e0e0e');
    b.rect(4, 18, 44, 13, '#c42028'); b.rect(4, 18, 44, 1, '#e04048'); b.rect(4, 27, 44, 3, '#9a141c');
    b.rect(4, 6, 4, 18, '#d82020'); b.rect(44, 6, 4, 18, '#d82020');
    b.rect(5, 7, 1, 15, '#ff8a6a'); b.rect(45, 7, 1, 15, '#ff8a6a');
    b.rect(4, 13, 4, 3, '#ffb040'); b.rect(44, 13, 4, 3, '#ffb040');
    b.rect(3, 29, 46, 5, '#3a3a3c'); b.rect(3, 29, 46, 1, '#5a5a5e');
    b.rect(19, 24, 14, 5, '#f0f0f0'); b.rect(19, 24, 1, 5, '#2040a0'); b.rect(32, 24, 1, 5, '#2040a0');
    for (let x = 21; x < 31; x += 2) b.set(x, 26, '#222');
    b.rect(25, 20, 2, 2, '#d0d0d0');
    // tappo serbatoio (lato destro)
    if (f.tankOpen) { b.rect(46, 19, 2, 3, '#141414'); b.rect(48, 17, 2, 5, '#c42028'); b.rect(48, 17, 1, 5, '#e04048'); }
    else { b.rect(46, 19, 2, 3, '#a8161e'); }
    if (f.hoseInCar) {
      b.thick(48, 20, 52, 24, 2, '#2e8a3a'); b.thick(52, 24, 55, 31, 2, '#2e8a3a'); b.thick(55, 31, 58, 38, 2, '#2e8a3a');
      if (f.siphoning) {
        b.rect(54, 30, 12, 10, '#c41e1e'); b.rect(54, 30, 12, 1, '#e84a3a'); b.rect(57, 28, 5, 2, '#c41e1e'); b.rect(64, 28, 2, 2, '#e0c020');
        b.thick(55, 31, 58, 29, 2, '#2e8a3a');
      } else b.thick(58, 38, 68, 39, 2, '#2e8a3a');
    }
    if (f.siphoned && !f.hoseInCar) { b.thick(40, 40, 52, 39, 2, '#2e8a3a'); b.thick(52, 39, 66, 40, 2, '#2e8a3a'); }
  });
}
function ypsilonCanvas() {
  const f = Game.flags;
  return canvasOf('ypsilon|' + !!f.tanicaTaken, 48, 48, b => {
    // origine stanza (342,66); base y=47 -> 113. Vista da dietro, portellone alzato.
    b.ellipse(24, 46, 22, 2, (x, y) => dz(x, y, 0.6) ? '#2c2a24' : null);
    b.rect(5, 41, 7, 6, '#141414'); b.rect(36, 41, 7, 6, '#141414');
    // portellone alzato (lato interno)
    b.thick(8, 15, 6, 22, 1, '#9a9a9a'); b.thick(39, 15, 41, 22, 1, '#9a9a9a');
    b.poly([[10, 7], [37, 7], [40, 16], [7, 16]], '#3a3a3e');
    b.poly([[12, 9], [35, 9], [37, 14], [10, 14]], '#2a3844'); b.line(14, 13, 17, 10, '#4a6070');
    b.rect(10, 7, 27, 1, '#cc2430');
    // tetto arrotondato
    b.rect(6, 16, 36, 3, '#cc2430'); b.rect(8, 16, 32, 1, '#ea5058'); b.set(5, 18, '#cc2430'); b.set(42, 18, '#cc2430');
    // montanti e vano bagagli
    b.rect(3, 19, 5, 22, '#cc2430'); b.rect(40, 19, 5, 22, '#cc2430'); b.rect(3, 19, 1, 22, '#9a1820');
    b.rect(8, 19, 32, 16, '#1c1614');
    b.rect(10, 25, 8, 10, '#e8e8e2'); b.rect(10, 25, 8, 1, '#ffffff'); b.rect(12, 23, 1, 2, '#e8e8e2'); b.rect(15, 23, 1, 2, '#e8e8e2'); b.rect(11, 28, 6, 1, '#d02020');
    b.rect(19, 24, 7, 11, '#c8a070'); b.rect(19, 24, 7, 1, '#d8b888'); b.rect(21, 20, 3, 5, '#d8a860'); b.rect(22, 20, 1, 5, '#b88848');
    if (!f.tanicaTaken) { b.rect(28, 26, 10, 9, '#c41e1e'); b.rect(28, 26, 10, 1, '#e84a3a'); b.rect(30, 24, 5, 2, '#c41e1e'); b.rect(36, 24, 2, 2, '#e0c020'); b.line(29, 28, 36, 34, '#9a1414'); }
    else { b.rect(28, 31, 10, 4, '#3a2e26'); }
    // fanali avvolgenti
    b.rect(3, 26, 4, 7, '#e02a2a'); b.rect(41, 26, 4, 7, '#e02a2a'); b.rect(4, 27, 2, 1, '#ffb0a0'); b.rect(42, 27, 2, 1, '#ffb0a0');
    // paraurti
    b.rect(3, 35, 42, 6, '#cc2430'); b.rect(3, 35, 42, 1, '#ea5058'); b.rect(3, 39, 42, 1, '#9a1820');
    b.rect(2, 40, 44, 3, '#2e2e30'); b.rect(17, 36, 14, 4, '#f0f0f0'); b.rect(17, 36, 1, 4, '#2040a0');
    for (let x = 19; x < 30; x += 2) b.set(x, 38, '#222');
  });
}
let panelsX = 398;
function panelsCanvas() {
  return canvasOf('panels', 26, 30, b => {
    const stack = (x0, w, h) => {
      const top = 29 - h;
      b.rect(x0, top, w, 2, '#dcf2ee');
      for (let y = top + 2; y < 29; y++) for (let x = x0; x < x0 + w; x++) {
        let c = ((y - top) % 3 === 0) ? '#78ada4' : '#9ccfc6';
        if (x === x0 + w - 1) c = '#7aa89f';
        if (hash2(x, 0, 96) < 0.18 && (y + x) % 5) c = '#e8f6f3';
        b.set(x, y, c);
      }
      b.rect(x0 + 2, top + 8, 4, 3, '#e8e040');
    };
    stack(0, 12, 26); stack(13, 12, 21);
    b.rect(0, 29, 26, 1, '#3a4a3a');
  });
}
function ladderLeanCanvas() {
  return canvasOf('ladderLean', 16, 54, b => {
    // origine stanza (410,61)
    b.line(2, 52, 5, 1, '#8a6a3e'); b.line(3, 52, 6, 1, '#6a4a28');
    b.line(10, 52, 13, 1, '#8a6a3e'); b.line(11, 52, 14, 1, '#6a4a28');
    for (let y = 5; y < 52; y += 6) { const o = Math.round((52 - y) * 3 / 51); b.rect(4 + o, y, 7, 1, '#a07e4e'); }
  });
}
function ladderTreeCanvas() {
  return canvasOf('ladderTree', 30, 110, b => {
    // origine stanza (62,30)
    b.line(2, 109, 18, 2, '#8a6a3e'); b.line(3, 109, 19, 2, '#6a4a28');
    b.line(11, 109, 27, 2, '#8a6a3e'); b.line(12, 109, 28, 2, '#6a4a28');
    for (let y = 8; y < 108; y += 7) { const o = (109 - y) * 16 / 107; b.rect(Math.round(19 - o), y, 9, 1, '#a07e4e'); }
  });
}
function shedDoorCanvas() {
  const f = Game.flags;
  const key = 'shed|' + !!f.shedOpen + '|' + hasItem('casco') + !!f.cascoTaken + '|' + !!f.olioTaken + '|' + !!f.sawTaken;
  return canvasOf(key, 32, 44, b => {
    // origine stanza (426,70)
    if (!f.shedOpen) {
      b.rect(8, 2, 22, 42, (x, y) => ((x - 8) % 4 === 0) ? '#3a2414' : (hash2(x >> 2, y, 7) < 0.5 ? '#5e3e24' : '#583a20'));
      b.thick(10, 38, 27, 8, 2, '#4a2e18'); b.rect(8, 6, 22, 2, '#4a2e18'); b.rect(8, 36, 22, 2, '#4a2e18');
      b.rect(8, 9, 4, 2, '#2a2a2a'); b.rect(8, 33, 4, 2, '#2a2a2a');
      b.rect(23, 21, 6, 2, '#7a7a7a'); b.rect(25, 23, 1, 2, '#9a9a9a'); b.rect(27, 23, 1, 2, '#9a9a9a'); b.rect(24, 25, 5, 4, '#b8a060'); b.set(26, 26, '#4a3a10'); b.rect(24, 25, 5, 1, '#d8c080');
    } else {
      b.rect(8, 2, 22, 42, '#120c08');
      b.rect(9, 3, 20, 36, (x, y) => ((x - 9) % 5 === 0) ? '#1a120c' : '#241a12');
      b.rect(9, 20, 20, 2, '#5a3c22'); b.rect(9, 22, 20, 1, '#2a1a0e');
      if (!f.cascoTaken) { b.ellipse(14, 17, 4, 3, '#f07414'); b.rect(10, 18, 9, 2, '#b84a0c'); b.rect(12, 15, 2, 1, '#ffa050'); }
      if (!f.olioTaken) { b.rect(23, 13, 4, 7, '#2a5aa8'); b.rect(24, 11, 2, 2, '#d8d8d8'); b.rect(23, 15, 4, 2, '#f2e8c8'); }
      if (!f.sawTaken) {
        b.rect(10, 32, 8, 6, '#ee6c12'); b.rect(10, 37, 8, 1, '#a8460a'); b.rect(11, 33, 3, 1, '#ffa060');
        b.rect(12, 30, 5, 1, '#1c1c1c'); b.rect(18, 34, 11, 2, '#c0c4c8'); for (let x = 18; x < 29; x += 2) b.set(x, 33, '#222');
      }
      b.rect(9, 39, 20, 5, '#2a2016');
      b.poly([[0, 0], [8, 2], [8, 44], [0, 46]], (x, y) => (x === 0 || x === 7) ? '#3a2414' : ((y % 4) ? '#6a4a2c' : '#5a3c22'));
    }
  });
}
function signCanvas() {
  return canvasOf('sign|' + !!Game.flags.signDown, 22, 20, b => {
    // origine stanza (472,97)
    if (!Game.flags.signDown) {
      b.poly([[12, 1], [3, 18], [20, 18]], '#d02020');
      b.poly([[12, 5], [6, 16], [17, 16]], '#f0f0ea');
      b.rect(9, 13, 6, 1, '#141414'); b.rect(10, 12, 4, 1, '#141414'); b.rect(11, 11, 2, 1, '#141414');
      b.rect(3, 18, 18, 1, '#8a1414');
    } else {
      b.poly([[1, 19], [21, 19], [14, 14]], '#d02020');
      b.poly([[5, 18], [17, 18], [13, 15.5]], '#f0f0ea');
      b.rect(1, 19, 20, 1, '#5a4a3a');
    }
  });
}
function logsCanvas() {
  return canvasOf('logs|' + !!Game.flags.logsCut, 134, 36, b => {
    // origine stanza (466,108)
    const bark = (x, y, cy, rr) => {
      const v = (y - cy) / rr;
      if (hash2(x >> 1, y, 97) < 0.07 && Math.abs(v) < 0.8) return '#2a2a2a';
      if (hash2(x >> 2, y, 98) < 0.05) return '#5a5a52';
      return ramp(['#8a887e', '#b6b4aa', '#d6d4ca', '#e8e6dc', '#f4f2ea'], clamp(0.75 - v * 0.55 + (hash2(x, y, 99) - 0.5) * 0.15, 0, 0.999), x, y);
    };
    const endDisc = (cx, cy, rr) => {
      b.ellipse(cx, cy, Math.max(2, rr - 2), rr, '#e8e6dc');
      b.ellipse(cx, cy, Math.max(1, rr - 3), rr - 1, (x, y) => {
        const d = Math.hypot((x - cx) / Math.max(1, rr - 3), (y - cy) / (rr - 1));
        return (Math.floor(d * 4) % 2) ? '#d8b878' : '#e8cc92';
      });
      b.set(cx, cy, '#9a7040');
    };
    if (!Game.flags.logsCut) {
      const logs = [[28, 9, 5], [22, 18, 5], [34, 18, 5], [16, 28, 6], [29, 28, 6], [42, 28, 6]];
      for (const [x, cy, rr] of logs) b.rect(x, cy - rr, 134 - x, rr * 2 + 1, (px, py) => bark(px, py, cy, rr));
      for (const [x, cy, rr] of logs) endDisc(x, cy, rr);
      b.rect(10, 34, 124, 2, (x, y) => dz(x, y, 0.5) ? '#2c3a1e' : null);
    } else {
      // ciocchi tagliati, impilati a piramide con la faccia del taglio verso di noi
      const rr2 = rng(55);
      for (let i = 0; i < 200; i++) b.set(rr2() * 130 | 0, 31 + (rr2() * 5 | 0), ['#e8d8a8', '#d8c088', '#f4ead0', '#c8a868'][(rr2() * 4) | 0]);
      const round = (cx, cy) => {
        b.ellipse(cx + 2, cy, 4, 4, (x, y) => hash2(x, y, 101) < 0.12 ? '#2a2a2a' : '#c8c6bc');
        b.ellipse(cx, cy, 4, 4, (x, y) => hash2(x, y, 102) < 0.1 ? '#2a2a2a' : '#eeece4');
        b.ellipse(cx, cy, 3, 3, (x, y) => {
          const d = Math.hypot(x - cx, y - cy);
          const shade = (x - cx) + (y - cy) > 2 ? 0.12 : 0;
          return hexMix(Math.floor(d * 1.4) % 2 ? '#d4b072' : '#e8cc92', '#5a3a1a', shade);
        });
        b.set(cx, cy, '#a07a4a');
        if (hash2(cx, cy, 103) < 0.5) b.line(cx, cy, cx + 2, cy - 2, '#b08a54');
      };
      const pile = (x0, base, rows) => rows.forEach((n, r) => { for (let i = 0; i < n; i++) round(x0 + r * 4 + i * 9 + (hash2(i, r, 104) * 2 | 0), base - r * 7); });
      pile(22, 29, [6, 5, 4, 3, 1]);
      pile(80, 30, [5, 4, 2]);
      round(12, 31); round(126, 30);
    }
  });
}

/* ---------- script ---------- */
async function ginoGivesKeys() {
  await say(gino, 'Tieni, le chiavi della Punto. Ma me le riporti, eh.');
  giveItem('chiaviPunto');
  await say(gino, "Il tappo del serbatoio si apre con la chiave piccola. Poi un tubo, e si succhia. Come nel '78.");
}
async function giveCostine() {
  if (Game.flags.ginoFed) return say(gino, 'Ne ho già messe da parte tre per stasera. Non esageriamo.');
  hero.dir = 'right';
  await say(hero, 'Gino, guarda che costine. Marinate da me.');
  await say(gino, 'Per me? Ma che pensiero gentile!');
  await say(hero, "Ne prende due... poi tre... si ferma solo perché lo guardo male.");
  Game.flags.ginoFed = true; addScore('gino', 10);
  await say(gino, 'Le metto da parte per stasera. Le cuociamo sul TUO fuoco, eh.');
  if (Game.flags.askedFuel) await ginoGivesKeys();
  else await say(gino, 'Se ti serve qualcosa, chiedi pure. Adesso sono di buon umore.');
}
async function talkGino() {
  hero.dir = 'right';
  await say(hero, pick(['Ehi, Gino!', 'Gino, una domanda.', 'Gino!']));
  await say(gino, pick(['Dimmi, Brum.', 'Mmh?', 'Parla, che la pipa si spegne.']));
  for (;;) {
    let opts = [];
    if (!Game.flags.askedSaw) opts.push({ id: 'saw', text: "Dov'è la motosega?" });
    else if (!Game.flags.keyTaken) opts.push({ id: 'nest', text: 'Come arrivo al nido della gazza?' });
    if (!hasItem('chiaviPunto') && !Game.flags.siphoned) opts.push({ id: 'fuel', text: 'Mi serve della benzina.' });
    if (hasItem('chiaviPunto') && !Game.flags.siphoned) opts.push({ id: 'how', text: 'Come si prende la benzina dalla Punto?' });
    if (!Game.flags.askedPanels) opts.push({ id: 'panels', text: 'Cosa sono quei pannelli verdini?' });
    if (Game.flags.sawFuel && !Game.flags.logsCut) opts.push({ id: 'ready', text: 'La motosega è pronta!' });
    if (!Game.flags.askedHat) opts.push({ id: 'hat', text: 'Ti piace il mio colbacco?' });
    opts = opts.slice(0, 4);
    opts.push({ id: 'bye', text: 'Niente, ciao.' });
    const c = await choose(opts);
    await say(hero, c.text);
    if (c.id === 'saw') {
      await say(gino, 'Nella baracca, chiusa col lucchetto. Come sempre.');
      await say(hero, 'E la chiave?');
      await say(gino, "La chiave... se l'è presa la gazza. Quella che sta sul noce.");
      await say(gino, 'Ruba tutto quello che luccica: chiavi, tappi, la dentiera di mia cugina.');
      Game.flags.askedSaw = true;
    } else if (c.id === 'nest') {
      await say(gino, 'Con una scala, genio.');
      await say(gino, "Ce n'era una vicino alla baracca. Dietro i pannelli che tuo zio 'monta la settimana prossima'.");
    } else if (c.id === 'fuel') {
      Game.flags.askedFuel = true;
      if (Game.flags.ginoFed) await ginoGivesKeys();
      else {
        await say(gino, 'La mia Punto ha il serbatoio pieno.');
        await say(gino, 'Ma io a stomaco vuoto non ragiono. E sento un profumino di costine...');
      }
    } else if (c.id === 'how') {
      await say(gino, 'Il tappo si apre con la chiave piccola.');
      await say(gino, "Poi ci infili un tubo, succhi piano, e la benzina scende nella tanica. Come nel '78.");
      await say(hero, 'Succhiare... la benzina. Che bello.');
    } else if (c.id === 'panels') {
      Game.flags.askedPanels = true;
      await say(gino, 'Isolante per il tetto. Sono lì da tre anni.');
      await say(gino, "'Li monto la settimana prossima', dice tuo zio. Ogni settimana.");
    } else if (c.id === 'ready') {
      await say(gino, 'E allora cosa aspetti? I tronchi di betulla sono lì, vicino alla legnaia.');
      await say(gino, 'E mettiti il casco. Sopra quel gatto che hai in testa.');
      await say(hero, 'È un colbacco!');
    } else if (c.id === 'hat') {
      Game.flags.askedHat = true;
      await say(gino, 'Bello. Mio nonno ne aveva uno uguale.');
      await say(gino, "Ci teneva dentro i pulcini d'inverno.");
      await say(hero, '...Vorrei chiedere perché, ma non lo farò.');
    } else {
      await say(gino, 'Vai, vai. E occhio alla gazza.');
      return;
    }
  }
}
async function climbTree() {
  if (!Game.flags.ladderOnTree) {
    await walkTo(hero, 69, 138); hero.dir = 'up';
    takeItem('scala'); Game.flags.ladderOnTree = true; SFX.thud();
    await say(hero, 'Scala appoggiata al ramo. Vediamo cosa nasconde quella ladra.');
  } else { await walkTo(hero, 69, 138); hero.dir = 'up'; }
  if (Game.flags.keyTaken) return say(hero, "Lassù non c'è più niente. Solo ricordi di gazza.");
  Game.flags.climbing = true; hero.pose = 'climb'; hero.fixedScale = 0.96; hero.dir = 'up';
  hero.x = 69; hero.y = 138;
  await tween(hero, { x: 79, y: 86 }, 2200);
  if (mag.st === 'perch' || mag.st === 'hop') { mag.st = 'flee'; mag.t = 0; SFX.magpie(); say(gazza, 'CRA! CRA!'); }
  await wait(500);
  await say(gino, "Occhio a non cadere! Che poi la grigliata chi la fa?");
  await say(hero, 'Vediamo... un cucchiaino, una molletta, un tappo di birra...');
  await say(hero, '...e la chiave della baracca! Lo sapevo!');
  Game.flags.keyTaken = true; giveItem('chiave'); giveItem('tappo');
  addScore('nido', 10);
  await tween(hero, { x: 69, y: 138 }, 1800);
  hero.pose = 'stand'; hero.fixedScale = null; Game.flags.climbing = false; hero.dir = 'down';
  await say(hero, 'Missione gazza: compiuta.');
}
async function openShed() {
  if (Game.flags.shedOpen) return say(hero, 'È già aperta.');
  hero.pose = 'reach'; SFX.clack(); await wait(400); SFX.creak();
  Game.flags.shedOpen = true; hero.pose = 'stand';
  await say(hero, 'Clic! Il lucchetto si apre.');
  addScore('baracca', 5);
  await say(hero, 'Ed eccola là dentro... la motosega del nonno!');
}
async function siphon() {
  const f = Game.flags;
  if (f.tanica !== 'vuota') return say(hero, 'La tanica è già piena. Più di così si rovescia.');
  if (!f.tankOpen) return say(hero, 'Il tappo del serbatoio è chiuso a chiave.');
  if (!f.hoseInCar) return say(hero, 'Non posso mica rovesciare la Punto. Mi serve un tubo.');
  await walkTo(hero, 324, 134); hero.dir = 'left';
  f.siphoning = true;
  await say(hero, 'Tanica a terra, tubo dentro. Adesso... si succhia. Con delicatezza.');
  hero.pose = 'reach'; SFX.gulp(); await wait(1000);
  hero.pose = 'stand'; hero.dir = 'down';
  await say(hero, 'BLEAH! Sa di novantacinque ottani!');
  SFX.spit();
  for (let i = 0; i < 12; i++) addParticle({ x: hero.x, y: hero.y - 40, vx: (Math.random() - 0.5) * 50, vy: -20 - Math.random() * 30, g: 200, life: 0.8, c: '#e8d860', ground: hero.y + 2 });
  hero.dir = 'left'; SFX.pour(); await wait(1800);
  f.siphoning = false; f.siphoned = true; f.hoseInCar = false; f.tanica = 'benzina';
  SFX.pick();
  await say(hero, "Tanica piena. E io ho l'alito di un distributore.");
  addScore('sifone', 10);
}
async function cutWood() {
  if (Game.flags.logsCut) return say(hero, 'Già fatto! Adesso tocca spaccarla... domani.');
  if (!Game.flags.sawFuel) return say(hero, 'Senza miscela la motosega è solo un fermaporta molto costoso.');
  if (!hasItem('casco')) return say(hero, 'Senza casco? Neanche per sogno. Ho visto troppi video su internet.');
  hero.dir = 'right';
  await say(hero, 'Casco sopra il colbacco. Sicurezza e stile.');
  hero.helmet = true; hero.pose = 'saw';
  await wait(500);
  SFX.pull(); await wait(350); await say(hero, 'Uno...');
  SFX.pull(); await wait(250); SFX.sputter(); await say(hero, 'Dai, bella...');
  SFX.pull(); await wait(250); SFX.sawOn(); hero.sawRun = true;
  await say(hero, 'BRRRUUUM!', { big: true, dur: 1500 });
  SFX.sawRev(1); Game.flags.cutting = true; Game.shake = 3.4;
  await tween(hero, { x: hero.x + 5 }, 500);
  await wait(2700);
  Game.flags.logsCut = true; Game.flags.cutting = false;
  SFX.sawRev(0); await wait(500); SFX.sawOff(); hero.sawRun = false;
  await tween(hero, { x: hero.x - 5 }, 400);
  hero.pose = 'stand';
  await say(hero, 'Fatto! Il bosco è salvo, e la grigliata pure.');
  addScore('legna', 10);
  hero.dir = 'left';
  await say(gino, 'BRAVO BRUM! Adesso però va spaccata!');
  await say(gino, 'E accatastata. E portata dentro. E poi...');
  await say(hero, 'Gino.');
  await say(gino, '...e poi si griglia. Va bene, va bene.');
  Game.finalScore = Game.score;
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter();
}

/* ---------- la stanza ---------- */
const ROOM_PARCHEGGIO = {
  id: 'parcheggio', width: RW,
  walk: [[40, 118], [104, 114], [218, 114], [222, 118], [260, 118], [260, 128], [312, 128], [312, 114], [470, 114], [470, 142], [40, 142]],
  scaleAt(y) { return clamp(0.8 + (y - 114) / 28 * 0.2, 0.8, 1); },
  _ready: false,
  init() {
    if (this._ready) return;
    this.para = paintParallax();
    this.bg = paintRoom();
    this._ready = true;
  },
  enter(isNew) {
    panelsX = Game.flags.panelsPushed ? 384 : 398;
    mag.st = 'perch'; mag.x = PERCH[0][0]; mag.y = PERCH[0][1]; mag.per = 0;
    if (isNew) {
      hero.x = 165; hero.y = 115; hero.dir = 'down';
      runScript(async () => {
        await wait(900);
        await say(hero, 'Ahh, che aria! Montagne, bosco, silenzio...');
        await walkTo(hero, 196, 130);
        hero.dir = 'down';
        await say(hero, 'Stasera grigliata. Le costine sono già marinate.');
        hero.dir = 'right';
        await say(gino, "Grigliata? E con cosa, con l'aria fresca?");
        await say(gino, 'La legnaia è vuota, ragazzo. Vuota come le mie tasche.');
        hero.dir = 'down';
        await say(hero, 'Vuota?!');
        await say(gino, 'Senza legna niente brace. Senza brace niente costine.');
        await say(hero, 'Allora mi servono la motosega... e la benzina.');
        await say(gino, "Bravo. Ti chiamo Brum, c'è scritto sulla felpa. I nomi moderni non li ricordo.");
        banner('OBIETTIVO: trova la motosega e la benzina, poi taglia la legna.', 5);
      });
    }
  },
  drawBack(g, cam) {
    g.drawImage(this.para, -Math.round(cam * PF), 0);
    g.drawImage(this.bg, -cam, 0);
  },
  objects() {
    const f = Game.flags;
    const list = [];
    for (const px of [104, 178, 256, 336]) list.push({ y: 120, draw: g => g.drawImage(postCanvas(), px - 10, 71) });
    if (!f.hoseTaken) list.push({ y: 113, draw: g => g.drawImage(hoseCanvas(), 86, 89) });
    list.push({ y: 127.5, draw: g => g.drawImage(puntoCanvas(), 262, 88) });
    list.push({ y: 112.6, draw: g => g.drawImage(ypsilonCanvas(), 342, 66) });
    if (f.panelsPushed && !f.ladderTaken) list.push({ y: 112.7, draw: g => g.drawImage(ladderLeanCanvas(), 410, 61) });
    list.push({ y: 113.6, draw: g => g.drawImage(panelsCanvas(), Math.round(panelsX), 84) });
    list.push({ y: 112.5, draw: g => g.drawImage(shedDoorCanvas(), 426, 70) });
    list.push({ y: 115.5, draw: g => g.drawImage(signCanvas(), 472, 97) });
    list.push({ y: 117, draw: g => {
      const talking = isTalking(gino);
      const talk = talking ? (((Game.t * 8) | 0) % 3 !== 0 ? 1 : 0) : 0;
      const blink = ((Game.t + 1.3) % 3.7) < 0.15;
      const look = hero.x > 238 ? 1 : 0;
      g.drawImage(cached(`gino|${talk}|${blink}|${look}`, () => buildGino({ talk, blink, look })), 238 - GINO_CX, 117 - 45);
    } });
    if (f.ladderOnTree) list.push({ y: f.climbing ? 0 : 139.5, draw: g => g.drawImage(ladderTreeCanvas(), 62, 30) });
    list.push({ y: 143.5, draw: g => g.drawImage(logsCanvas(), 466, 108) });
    list.push({ y: 40, draw: g => {
      if (mag.st === 'gone') return;
      const flying = mag.st === 'flee' || mag.st === 'return';
      const frame = flying ? ((((Game.t * 10) | 0) % 2) ? 'fly1' : 'fly2') : ((((Game.t * 1.5) | 0) % 3 === 0) ? 'perch2' : 'perch');
      g.drawImage(magpieCanvas(frame, mag.flip), Math.round(mag.x - 7), Math.round(mag.y - 8));
      if (!f.keyTaken && ((Game.t % 2.6) < 0.25)) { g.fillStyle = '#ffffff'; g.fillRect(91, 22, 1, 3); g.fillRect(90, 23, 3, 1); }
    } });
    return list;
  },
  ambient(dt) {
    // foglie che cadono
    if (Math.random() < dt * 1.4) {
      const fromWalnut = Math.random() < 0.45;
      const x = fromWalnut ? Math.random() * 110 : 260 + Math.random() * 280;
      const y = fromWalnut ? 10 + Math.random() * 30 : 20 + Math.random() * 40;
      addParticle({ x, y, vx: 4 + Math.random() * 6, vy: 9 + Math.random() * 6, life: 9, c: pick(PAL.leaves), w: Math.random() < 0.5 ? 2 : 1, sway: Math.random() * 6, ground: 104 + Math.random() * 38, fade: true });
    }
  },
  update(dt) {
    this.ambient(dt);
    const f = Game.flags;
    // fumo della pipa di Gino
    if (!isTalking(gino) && Math.random() < dt * 2.5) addParticle({ x: 244 + Math.random(), y: 79, vx: 2 + Math.random() * 3, vy: -7 - Math.random() * 3, life: 2.2, c: Math.random() < 0.5 ? '#c8c8c8' : '#a8a8a8', fade: true });
    // segatura
    if (f.cutting) {
      for (let i = 0; i < 3; i++) addParticle({ x: hero.x + 26, y: hero.y - 24, vx: (Math.random() - 0.3) * 70, vy: -30 - Math.random() * 50, g: 180, life: 1.6, c: pick(['#e8d8a8', '#d8c088', '#f4ead0', '#c8a868']), ground: hero.y + 2 + Math.random() * 6, fade: true });
      SFX.sawRev(0.8 + Math.random() * 0.2);
    }
    // animazione arrampicata
    if (hero.pose === 'climb') {
      if (this._cy != null) hero.climbPhase += Math.abs(hero.y - this._cy) * 0.09;
      this._cy = hero.y;
    } else this._cy = null;
    // gazza
    mag.t += dt;
    if (mag.st === 'perch') {
      mag.hopT -= dt; mag.chirpT -= dt;
      if (mag.chirpT < 0) { mag.chirpT = 5 + Math.random() * 8; if (Math.abs(hero.x - mag.x) < 260) SFX.magpie(); }
      if (mag.hopT < 0) { mag.hopT = 3 + Math.random() * 5; mag.from = [mag.x, mag.y]; mag.per = 1 - mag.per; mag.to = PERCH[mag.per]; mag.st = 'hop'; mag.t = 0; mag.flip = mag.to[0] > mag.x; }
    } else if (mag.st === 'hop') {
      const k = Math.min(1, mag.t * 2.2);
      mag.x = lerp(mag.from[0], mag.to[0], k); mag.y = lerp(mag.from[1], mag.to[1], k) - Math.sin(k * Math.PI) * 5;
      if (k >= 1) { mag.st = 'perch'; mag.flip = Math.random() < 0.5; }
    } else if (mag.st === 'flee') {
      mag.flip = true; mag.x += 90 * dt; mag.y -= 35 * dt;
      if (mag.y < -20) { mag.st = 'gone'; mag.t = 0; }
    } else if (mag.st === 'gone') {
      if (mag.t > 14 && !f.climbing) { mag.st = 'return'; mag.x = 220; mag.y = -12; mag.t = 0; }
    } else if (mag.st === 'return') {
      mag.flip = false;
      const [tx, ty] = PERCH[0], dx = tx - mag.x, dy = ty - mag.y, d = Math.hypot(dx, dy);
      if (d < 2) { mag.st = 'perch'; mag.per = 0; mag.x = tx; mag.y = ty; }
      else { mag.x += dx / d * 70 * dt; mag.y += dy / d * 70 * dt; }
    }
  },
  hotspots: [],
};

/* ---------- hotspot (in ordine di priorità crescente) ---------- */
const F = () => Game.flags;
ROOM_PARCHEGGIO.hotspots = [
  { id: 'montagne', name: 'Montagne', rects: [[100, 0, 500, 32]], hint: false,
    verbs: { guarda: () => say(hero, 'Montagne. Rocce, boschi e un silenzio che in città te lo sogni.') } },
  { id: 'bosco', name: 'Bosco', rects: [[250, 22, 300, 70]], hint: false,
    verbs: { guarda: () => say(hero, 'Il bosco in autunno: giallo, arancio e rosso. Sembra un incendio, ma silenzioso.') },
    use: { motosega: () => say(hero, 'Il bosco si rispetta. Taglio solo i tronchi già pronti.') } },
  { id: 'abete', name: 'Abete', rects: [[524, 0, 50, 60]],
    verbs: { guarda: () => say(hero, 'Un abete altissimo. Più vecchio della baita.') },
    use: { motosega: () => say(hero, 'Gli abeti si salutano, non si tagliano.') } },
  { id: 'casa', name: 'Baita', rects: [[36, 48, 72, 50], [108, 3, 154, 54]], walk: [180, 124], face: 'up', hint: false,
    verbs: {
      guarda: () => say(hero, 'La baita: legno scuro sopra, muri bianchi sotto, e dentro il profumo di cento grigliate.'),
      apri: () => say(hero, 'La porta è sotto la tettoia.'),
    } },
  { id: 'parabola', name: 'Parabola', rects: [[128, 0, 22, 10]],
    verbs: { guarda: () => say(hero, 'Una parabola sul comignolo. Così anche il fumo prende i canali satellitari.') } },
  { id: 'tettoia', name: 'Tettoia', rects: [[96, 57, 250, 15]],
    verbs: { guarda: () => say(hero, 'La tettoia. Il muschio sul bordo ha più anni di me.') } },
  { id: 'finestraSx', name: 'Finestra', rects: [[44, 74, 36, 22]], walk: [62, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, "Tendine fatte all'uncinetto dalla nonna. Nel 1971. Indistruttibili."),
      apri: () => say(hero, 'Si apre solo da dentro. E dentro non si entra senza legna.'),
    } },
  { id: 'tubo', name: () => F().hoseTaken ? 'Rubinetto' : "Tubo dell'acqua", rects: [[86, 88, 18, 26]], walk: [96, 119], face: 'up', def: 'guarda',
    verbs: {
      guarda: () => say(hero, F().hoseTaken ? 'Il rubinetto. Senza tubo sembra triste.' : "Il tubo dell'acqua del giardino, avvitato al rubinetto."),
      raccogli: () => F().hoseTaken ? say(hero, 'Il rubinetto resta qui.') : say(hero, 'È avvitato bello stretto al rubinetto. Forse se lo tiro...'),
      tira: async () => {
        if (F().hoseTaken) return say(hero, "Non c'è più niente da tirare.");
        hero.pose = 'reach'; await wait(300); SFX.splash();
        for (let i = 0; i < 26; i++) addParticle({ x: 96, y: 96, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 40, g: 220, life: 1, c: Math.random() < 0.5 ? '#9ad0f0' : '#d8f0ff', ground: 118, fade: true });
        await wait(400); hero.pose = 'stand';
        F().hoseTaken = true; giveItem('tubo');
        await say(hero, 'Si è staccato! E mi sono fatto una doccia gratis.');
        addScore('tubo', 5);
      },
      apri: () => say(hero, F().hoseTaken ? "Acqua? Mi serve benzina, non acqua." : 'Se apro, innaffio Gino. Tentazione forte, ma no.'),
      usa: () => say(hero, 'Acqua? Mi serve benzina, non acqua.'),
    } },
  { id: 'felci', name: 'Felci', rects: [[92, 104, 18, 18]], walk: [100, 121], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Felci. Esistevano già ai tempi dei dinosauri. Come la tettoia.'),
      raccogli: () => say(hero, "Le lascio dove sono. Fanno tanto 'montagna'."),
    } },
  { id: 'barbecue', name: 'Barbecue in pietra', rects: [[111, 70, 35, 42], [122, 34, 12, 24]], walk: [128, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il barbecue in pietra. Il vero cuore della baita.'),
      apri: () => say(hero, 'Dentro solo cenere fredda. Aspetta la legna, come me.'),
      usa: () => say(hero, 'Prima serve la legna. Poi la brace. Poi le costine. In questo ordine.'),
    },
    use: {
      costine: () => say(hero, 'Prima la legna. Senza legna niente brace, senza brace niente costine. È la catena alimentare della montagna.'),
      '*': () => say(hero, 'Il barbecue è sacro. Ci vanno solo legna e costine.'),
    } },
  { id: 'porta', name: 'Porta di casa', rects: [[154, 66, 22, 46]], walk: [165, 116], face: 'up', def: 'apri',
    verbs: {
      guarda: () => say(hero, 'La porta di casa.'),
      apri: () => say(hero, "Regola della baita: non si rientra senza legna. L'ha scritto il nonno. Sulla porta. Col coltello."),
      chiudi: () => say(hero, 'È già chiusa. Come la mia speranza di un pisolino.'),
    } },
  { id: 'finestra2', name: 'Finestra', rects: [[183, 76, 19, 17]], walk: [192, 117], face: 'up',
    verbs: { guarda: () => say(hero, 'Dentro è buio. Vedo solo il mio riflesso. Bel colbacco.') } },
  { id: 'tavolo', name: 'Tavolo', rects: [[184, 88, 42, 26]], walk: [205, 121], face: 'up',
    verbs: {
      guarda: () => say(hero, "Il tavolo delle grigliate. Tovaglia a quadri d'ordinanza e la bottiglia di Gino."),
      raccogli: () => say(hero, 'La bottiglia è di Gino. Toccarla è più pericoloso della motosega.'),
    },
    use: { costine: () => say(hero, 'Le appoggio dopo. Prima la legna.') } },
  { id: 'punto', name: 'Fiat Punto', rects: [[264, 90, 50, 38]], walk: [316, 131], face: 'up',
    verbs: {
      guarda: () => say(hero, 'La Fiat Punto di Gino. Rossa, ammaccata, immortale.' + (F().tankOpen ? ' Il tappo del serbatoio è aperto.' : '')),
      apri: async () => {
        if (F().tankOpen) return say(hero, 'Il serbatoio è già aperto.');
        if (hasItem('chiaviPunto')) return ROOM_PARCHEGGIO.openTank();
        return say(hero, 'È chiusa a chiave. Gino non si fida nemmeno delle marmotte.');
      },
      chiudi: () => {
        if (F().tankOpen && !F().siphoned) return say(hero, 'Lo lascio aperto: devo ancora prendere la benzina.');
        if (F().tankOpen) { F().tankOpen = false; SFX.clack(); return say(hero, 'Richiudo il tappo. Gino non se ne accorgerà mai.'); }
        return say(hero, 'È già tutto chiuso.');
      },
      spingi: () => say(hero, 'Spingere una Punto? Ho già dato nel 2009. In salita.'),
    },
    use: {
      chiaviPunto: () => F().tankOpen ? say(hero, 'Il serbatoio è già aperto.') : ROOM_PARCHEGGIO.openTank(),
      tubo: async () => {
        if (!F().tankOpen) return say(hero, 'Il tappo del serbatoio è chiuso a chiave.');
        hero.pose = 'reach'; await wait(500); hero.pose = 'stand';
        takeItem('tubo'); F().hoseInCar = true;
        await say(hero, 'Tubo infilato nel serbatoio. Ora mi serve qualcosa dove far scendere la benzina.');
      },
      tanica: () => siphon(),
      motosega: () => say(hero, 'La Punto è indistruttibile. Anche alle motoseghe, scommetto. Ma non provo.'),
      costine: () => say(hero, 'Nella Punto di Gino le costine durerebbero dieci secondi.'),
    } },
  { id: 'ypsilon', name: 'Lancia Ypsilon', rects: [[342, 72, 46, 41]], walk: [364, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "La Lancia Ypsilon della zia. Il bagagliaio è aperto: c'è la spesa" + (F().tanicaTaken ? '.' : ' e una tanica rossa.')),
      chiudi: () => say(hero, 'Se chiudo il bagagliaio, la zia lo sente. Lei sente sempre tutto.'),
      apri: () => say(hero, 'È già aperto. La zia si fida della montagna.'),
      spingi: () => say(hero, 'La Ypsilon della zia non si spinge. Neanche col pensiero.'),
    },
    use: {
      tanica: () => say(hero, 'Prendere benzina dalla macchina della zia? La zia lo saprebbe. La zia sa sempre tutto.'),
      tubo: () => say(hero, 'Prendere benzina dalla macchina della zia? La zia lo saprebbe. La zia sa sempre tutto.'),
    } },
  { id: 'spesa', name: 'Spesa', rects: [[350, 88, 18, 14]], walk: [364, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Birra, polenta istantanea e carbonella. La piramide alimentare della montagna.'),
      raccogli: () => say(hero, 'Non è roba mia. Tranne la birra. La birra è di tutti. Però dopo.'),
    } },
  { id: 'tanica', name: 'Tanica', rects: [[369, 89, 12, 13]], walk: [370, 118], face: 'up', def: 'raccogli', show: () => !F().tanicaTaken,
    verbs: {
      guarda: () => say(hero, 'Una tanica rossa per la benzina.'),
      raccogli: async () => {
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
        F().tanicaTaken = true; giveItem('tanica');
        await say(hero, 'Una tanica! Vuota come il frigo il lunedì.');
        addScore('tanica', 5);
      },
    } },
  { id: 'baracca', name: 'Baracca', rects: [[396, 50, 94, 62]], walk: [445, 117], face: 'up',
    verbs: {
      guarda: () => say(hero, "La baracca degli attrezzi. Tronchi veri, l'ha costruita il nonno nel '68." + (F().shedOpen ? '' : ' La porta ha un lucchetto.')),
      apri: () => ROOM_PARCHEGGIO.doorOpen(),
    },
    use: {
      chiave: () => openShed(),
      scala: () => say(hero, 'Salire sul tetto della baracca? Non oggi. Non con questo colbacco.'),
    } },
  { id: 'portaBaracca', name: () => F().shedOpen ? 'Baracca aperta' : 'Porta della baracca', rects: [[432, 72, 24, 40]], walk: [445, 117], face: 'up', def: 'apri',
    verbs: {
      guarda: () => say(hero, F().shedOpen ? "Dentro: attrezzi, ragnatele e odore d'olio." : 'Una porta di assi con un lucchetto robusto.'),
      apri: () => ROOM_PARCHEGGIO.doorOpen(),
      chiudi: () => say(hero, F().shedOpen ? 'La lascio aperta. Non si sa mai.' : 'È già chiusa. Fin troppo.'),
      spingi: () => say(hero, F().shedOpen ? 'È già aperta.' : 'Il lucchetto tiene. Il nonno comprava solo roba seria.'),
      tira: () => say(hero, F().shedOpen ? 'È già aperta.' : 'Il lucchetto tiene. Il nonno comprava solo roba seria.'),
    },
    use: { chiave: () => openShed() } },
  { id: 'casco', name: 'Casco forestale', rects: [[434, 82, 12, 9]], walk: [445, 117], face: 'up', def: 'raccogli', show: () => F().shedOpen && !F().cascoTaken,
    verbs: {
      guarda: () => say(hero, 'Un casco forestale con visiera e cuffie.'),
      raccogli: async () => { hero.pose = 'reach'; await wait(350); hero.pose = 'stand'; F().cascoTaken = true; giveItem('casco'); await say(hero, 'Casco forestale. Perfetto da mettere sopra il colbacco.'); addScore('casco', 5); },
    } },
  { id: 'olio', name: 'Olio per miscela', rects: [[447, 80, 9, 11]], walk: [447, 117], face: 'up', def: 'raccogli', show: () => F().shedOpen && !F().olioTaken,
    verbs: {
      guarda: () => say(hero, 'Olio per motori a due tempi. Serve per fare la miscela.'),
      raccogli: async () => { hero.pose = 'reach'; await wait(350); hero.pose = 'stand'; F().olioTaken = true; giveItem('olio'); await say(hero, "Olio 2T. 'Al due per cento', dice l'etichetta."); addScore('olio', 5); },
    } },
  { id: 'motosega', name: 'Motosega', rects: [[434, 98, 22, 11]], walk: [445, 117], face: 'up', def: 'raccogli', show: () => F().shedOpen && !F().sawTaken,
    verbs: {
      guarda: () => say(hero, 'La motosega del nonno. Arancione, rumorosa, leggendaria.'),
      raccogli: async () => {
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
        F().sawTaken = true; giveItem('motosega');
        await say(hero, 'Eccola! Pesa come un vitello. Ma è mia.');
        addScore('motosega', 10);
        await say(hero, 'Il serbatoio però è vuoto. Serve la miscela: benzina più olio.');
      },
    } },
  { id: 'pannelli', name: 'Pannelli isolanti', rects: () => [[Math.round(panelsX), 84, 26, 30]], walk: () => [Math.round(panelsX) + 12, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "Pannelli isolanti. 'Li monto la settimana prossima', dice lo zio. Da tre anni."),
      raccogli: () => say(hero, 'Sono leggeri, ma enormi. Non mi stanno in tasca.'),
      spingi: async () => {
        if (F().panelsPushed) return say(hero, 'Li ho già spostati. Adesso si riposano.');
        hero.pose = 'reach';
        await tween({ get v() { return panelsX; }, set v(x) { panelsX = x; } }, { v: 384 }, 700);
        hero.pose = 'stand'; F().panelsPushed = true;
        await say(hero, 'Pesano come una nuvola! E dietro... una scala!');
        addScore('pannelli', 5);
      },
      tira: () => say(hero, 'Se li tiro verso di me finiscono sulla Ypsilon. E la zia...'),
    } },
  { id: 'scalaPannelli', name: 'Scala', rects: [[410, 61, 16, 52]], walk: [417, 117], face: 'up', def: 'raccogli', show: () => F().panelsPushed && !F().ladderTaken,
    verbs: {
      guarda: () => say(hero, 'Una scala di legno appoggiata alla baracca. Robusta, se non la guardi troppo.'),
      raccogli: async () => {
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
        F().ladderTaken = true; giveItem('scala');
        await say(hero, "La prendo. Ho già un'idea su dove usarla.");
        addScore('scala', 5);
      },
    } },
  { id: 'cartello', name: 'Cartello', rects: () => F().signDown ? [[472, 110, 22, 7]] : [[474, 97, 18, 19]], walk: [466, 117], face: 'right',
    verbs: {
      guarda: () => say(hero, F().signDown ? 'Il cartello del dosso, sdraiato. Ora è lui il dosso.' : 'Un cartello di DOSSO. Non ci sono dossi qui. Mistero della montagna.'),
      spingi: () => { if (F().signDown) return say(hero, "È già per terra. Lascialo riposare."); F().signDown = true; SFX.thud(); return say(hero, 'Ops. Adesso anche il cartello si è sdraiato.'); },
      tira: () => { if (!F().signDown) return say(hero, 'Lo tiro... e lui resta lì. Testardo come Gino.'); F().signDown = false; return say(hero, 'Lo rimetto su. Il dosso immaginario ringrazia.'); },
      raccogli: () => say(hero, 'Non mi serve. Di dossi nella vita ne ho già abbastanza.'),
    } },
  { id: 'legnaia', name: 'Legnaia', rects: [[478, 58, 90, 54]], walk: [468, 116], face: 'right',
    verbs: {
      guarda: () => say(hero, F().logsCut ? 'Presto sarà piena. Domani. Forse.' : 'La legnaia. Quasi vuota. Ecco perché sono qui.'),
      raccogli: () => say(hero, 'Quei quattro ceppi bastano a malapena per un caffè.'),
    },
    use: { motosega: () => say(hero, 'Quella è già tagliata. Mi servono i tronchi interi.') } },
  { id: 'tronchi', name: () => F().logsCut ? 'Legna tagliata' : 'Tronchi di betulla', rects: [[470, 110, 130, 34]], walk: [458, 134], face: 'right',
    verbs: {
      guarda: () => say(hero, F().logsCut ? 'Ciocchi tagliati. Che soddisfazione.' : 'Tronchi di betulla. Pronti per essere tagliati. Da qualcuno con una motosega.'),
      raccogli: () => say(hero, F().logsCut ? 'Li porto dentro dopo. Prima mi godo il momento.' : 'Pesano come un frigorifero. Ciascuno.'),
      spingi: () => say(hero, 'Non si spostano di un millimetro. Sono tronchi seri.'),
    },
    use: {
      motosega: () => cutWood(),
      casco: () => say(hero, 'Il casco va in testa, non sui tronchi.'),
      '*': () => say(hero, 'Per tagliare i tronchi serve qualcosa di più... rumoroso.'),
    } },
  { id: 'gino', name: 'Gino', person: true, rects: [[226, 70, 26, 47]], walk: [209, 127], face: 'right', def: 'parla',
    verbs: {
      guarda: () => say(hero, 'Gino. Ottantadue anni, pipa e coppola. Sa tutto di tutti in questa valle.'),
      parla: () => talkGino(),
      spingi: () => say(hero, 'Non si spingono gli anziani. Soprattutto quelli con la pipa.'),
      tira: () => say(hero, 'Gino non si tira. Al massimo si accompagna al bar.'),
      raccogli: () => say(hero, 'Gino non si raccoglie. Al massimo si accompagna al bar.'),
    },
    give: {
      costine: () => giveCostine(),
      chiaviPunto: async () => {
        if (!F().siphoned) return say(gino, 'Tienile ancora, ti servono. Ma poi me le ridai.');
        takeItem('chiaviPunto');
        await say(gino, 'Grazie. E non dire a nessuno che hai succhiato la mia Punto.');
      },
      tappo: async () => { await say(gino, "Un tappo della birra del '98! Questa sì che era buona."); await say(gino, 'Tienilo tu, porta fortuna.'); },
      tanica: () => say(gino, 'Mica la riempio io. Ho la schiena di cristallo.'),
      motosega: () => say(gino, "Ah no, io ho già dato. Nel '74 ho tagliato mezzo bosco."),
      telefono: () => say(gino, "Il telefono? Io ho quello col filo. E funziona anche qui."),
      '*': () => say(gino, 'E cosa me ne faccio?'),
    },
    use: {
      motosega: () => say(hero, 'Ehm. No. Assolutamente no.'),
      costine: () => giveCostine(),
    } },
  { id: 'noce', name: 'Noce', rects: [[8, 28, 26, 116], [0, 0, 118, 24], [0, 24, 60, 20]], walk: [52, 126], face: 'left',
    verbs: {
      guarda: () => say(hero, 'Un vecchio noce. Lassù, su un ramo, c\'è un nido di gazza.'),
      raccogli: () => say(hero, 'Raccolgo una noce da terra... vuota. Anche qui è passata la gazza.'),
      spingi: () => say(hero, 'È un noce, non un albero di Natale da scuotere.'),
      tira: () => say(hero, 'È un noce, non un albero di Natale da scuotere.'),
    },
    use: {
      scala: () => climbTree(),
      motosega: () => say(hero, 'Il noce no! Fa le noci. E le noci fanno il nocino.'),
    } },
  { id: 'scalaNoce', name: 'Scala', rects: [[62, 34, 28, 104]], walk: [69, 136], face: 'up', show: () => F().ladderOnTree,
    verbs: {
      guarda: () => say(hero, F().keyTaken ? 'La scala appoggiata al noce. Lassù il nido ormai è vuoto.' : 'La scala appoggiata al noce.'),
      usa: () => climbTree(),
      raccogli: () => say(hero, 'La lascio lì. Il nonno dice che le scale si spostano solo a fine stagione.'),
    } },
  { id: 'nido', name: 'Nido di gazza', rects: [[82, 21, 17, 11]], walk: [69, 132], face: 'up',
    verbs: {
      guarda: () => say(hero, F().keyTaken ? 'Il nido è vuoto. La gazza dovrà ricominciare la collezione.' : 'Un nido di gazza. Qualcosa luccica là dentro...'),
      raccogli: () => {
        if (F().keyTaken) return say(hero, 'Ho già preso quello che mi serviva.');
        if (F().ladderOnTree) return climbTree();
        return say(hero, 'È troppo in alto. Mi servirebbe una scala.');
      },
    },
    use: { scala: () => climbTree() } },
  { id: 'gazza', name: 'Gazza', person: true, rects: () => [[mag.x - 8, mag.y - 9, 16, 11]], walk: [69, 132], face: 'up', show: () => mag.st === 'perch' || mag.st === 'hop',
    verbs: {
      guarda: () => say(hero, 'Una gazza. Bianca e nera come un arbitro. E ladra come pochi.'),
      parla: async () => { await say(hero, 'Ridammi la chiave!'); SFX.magpie(); await say(gazza, 'CRA!'); await say(hero, 'Lo prendo come un no.'); },
      raccogli: () => say(hero, 'È troppo in alto. E poi mi becca.'),
    },
    give: { tappo: () => say(hero, 'Glielo restituisco? No, ormai è mio.'), '*': () => say(hero, 'La gazza vuole solo cose che luccicano. E non dà niente in cambio.') },
    use: { tappo: () => say(hero, 'Glielo restituisco? No, ormai è mio.') } },
];

ROOM_PARCHEGGIO.openTank = async function () {
  hero.pose = 'reach'; await wait(300); SFX.clack(); await wait(200); hero.pose = 'stand';
  Game.flags.tankOpen = true;
  await say(hero, 'Clic! Tappo del serbatoio aperto.');
  addScore('serbatoio', 5);
};
ROOM_PARCHEGGIO.doorOpen = async function () {
  if (Game.flags.shedOpen) return say(hero, 'È già aperta.');
  if (hasItem('chiave')) return openShed();
  return say(hero, 'C\'è un lucchetto. Serve la chiave.');
};
