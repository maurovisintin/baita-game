'use strict';
/* =========================================================
   STANZA 1: IL PARCHEGGIO DELLA BAITA
   Obiettivo: motosega + benzina (miscela) -> tagliare la legna
   ========================================================= */
const RW = 600;          // larghezza stanza
const PF = 0.35;         // fattore parallasse montagne
const PARA_W = Math.ceil(W + (RW - W) * PF);

/* ---------- attori secondari ---------- */
const luciano = makeActor({
  name: 'Luciano', color: '#9fe0ff', x: 238, y: 117, speed: 40, state: 'seated',
  headPos: () => luciano.state === 'seated' ? [238, 68] : [luciano.x, luciano.y - 51 * actorScale(luciano) - 3],
});
const GHIRO_HOME = [24, 104]; // il ghiro sta nel buco del noce
const ghiro = { x: GHIRO_HOME[0], y: GHIRO_HOME[1], st: 'sit', flip: false };
const ghiroActor = makeActor({ name: 'Ghiro', color: '#efe2c8', headPos: () => [ghiro.x, ghiro.y - 10] });

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
    const light = clamp(0.4 + (x - c[0]) / c[2] * 0.35 - (y - c[1]) / c[3] * 0.35 + (rr() - 0.5) * 0.4, 0, 0.999);
    const cc = ramp(PAL.yellow, light, x, y);
    b.set(x, y, cc); if (rr() < 0.6) b.set(x + 1, y, cc); if (rr() < 0.3) b.set(x, y + 1, hexMix(cc, '#000', 0.2));
  }
  // buco nel tronco (la tana del ghiro)
  b.ellipse(23, 99, 6, 7, '#2e241a');
  b.ellipse(23, 99, 5, 6, (x, y) => ramp(['#0e0a06', '#1a120c', '#2a1e14'], clamp((y - 93) / 14, 0, 0.99), x, y));
  b.rect(18, 105, 11, 1, '#5e4e3e');

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
const NOTIZIE = [
  "In soffitta c'è un nido di vespe grande come una Panda.",
  'La stufa tira al contrario: il fumo va dentro e il caldo va fuori.',
  'Il frigo fa il ghiaccio. Fuori. Sopra al frigo.',
  "Il materasso matrimoniale l'hanno adottato le formiche.",
];
async function lucianoIntro() {
  const L = t => say(luciano, t);
  hero.x = 165; hero.y = 115; hero.dir = 'down';
  await wait(900);
  await say(hero, 'Ahh, che aria! Montagne, bosco, silenzio...');
  await say(hero, "Vent'anni fa qui ci passavamo le vacanze. Da ragazzi, con le morose e tutto.");
  await say(hero, "Poi la baita è diventata un po' sporca e un po' precaria, e ci siamo venuti sempre meno. Ma oggi: rimpatriata!");
  await walkTo(hero, 196, 130);
  hero.dir = 'right';
  await L("Ah, siete arrivati. Era un pezzo che non vi vedevo. Allora, vi aggiorno.");
  await L('I letti sono pieni di cimici.');
  hero.dir = 'down';
  await say(hero, '...Come, scusa?');
  hero.dir = 'right';
  await L('Il bagno della camerata è esploso.');
  await L('E i ghiri hanno preso possesso della dépendance.');
  await say(hero, 'Ottimo. Altro?');
  await L('La legnaia è vuota. Senza legna niente caminetto e niente spargher: stasera si gela e non si cucina.');
  hero.dir = 'down';
  await say(hero, 'Non si cucina?! E la polenta? La polenta si fa sullo spargher, a legna!');
  hero.dir = 'right';
  await say(hero, "Mi servono la motosega... e un po' di benzina.");
  await L("E stasera andate a vedere l'orrido Rascie. Si passa dal guado Pepi.");
  await say(hero, 'Di notte?');
  await L('Di notte è più orrido.');
  let news = 0;
  for (;;) {
    const opts = [];
    if (!Game.flags.askedSaw) opts.push({ id: 'saw', text: "Dov'è la motosega?" });
    else if (!Game.flags.askedGhiro) opts.push({ id: 'ghiro', text: 'Come mando via un ghiro?' });
    if (!Game.flags.askedFuel) opts.push({ id: 'fuel', text: 'E la benzina dove la trovo?' });
    if (news < NOTIZIE.length) opts.push({ id: 'news', text: news ? 'Altre belle notizie?' : 'Ci sono altre belle notizie?' });
    opts.push({ id: 'bye', text: 'Va bene, ci penso io. Grazie Luciano.' });
    const c = await choose(opts);
    await say(hero, c.text);
    if (c.id === 'saw') {
      Game.flags.askedSaw = true;
      await L('In baracca, chiusa col lucchetto.');
      await say(hero, 'E la chiave?');
      await L("Se l'è presa un ghiro. L'ha nascosta nel buco del noce.");
      await L('Te l\'ho detto: i ghiri hanno preso possesso di tutto.');
    } else if (c.id === 'ghiro') {
      Game.flags.askedGhiro = true;
      await L('Con una noce. Per una noce un ghiro venderebbe la madre.');
      await L('Sotto il noce ce ne sono quante vuoi.');
    } else if (c.id === 'fuel') {
      Game.flags.askedFuel = true;
      await L("Nella mia Punto ce n'è. Le chiavi ve le lascio sul tavolo.");
      await L("Un tubo, una tanica, e si succhia. Come nel '78.");
      await say(hero, 'Succhiare... la benzina. Che bello.');
    } else if (c.id === 'news') {
      await L(NOTIZIE[news++]);
      await say(hero, pick(['Fantastico.', 'Sempre meglio.', 'Meraviglioso. Davvero.']));
    } else {
      if (!Game.flags.askedFuel) await L('Le chiavi della Punto ve le lascio sul tavolo. Non si sa mai.');
      await L("L'affitto me lo lasciate sul tavolo, come una volta. Io vado a fare un giro.");
      await L('Mandi.');
      break;
    }
  }
  // Luciano si alza e se ne va a piedi
  Game.flags.lucianoLeft = true;
  luciano.state = 'walk'; luciano.x = 236; luciano.y = 121; luciano.dir = 'left';
  walkStraight(luciano, [[226, 126], [150, 129], [60, 133], [-30, 135]]).then(() => { luciano.state = 'gone'; });
  await wait(1400);
  hero.dir = 'down';
  await say(hero, 'Cimici, ghiri, bagni esplosi... e niente legna. Che vacanza.');
  banner('OBIETTIVO: trova la motosega e la benzina, poi taglia la legna.', 5);
}
async function openShed() {
  if (Game.flags.shedOpen) return say(hero, 'È già aperta.');
  hero.pose = 'reach'; SFX.clack(); await wait(400); SFX.creak();
  Game.flags.shedOpen = true; hero.pose = 'stand';
  await say(hero, 'Clic! Il lucchetto si apre.');
  addScore('baracca', 5);
  await say(hero, 'Ed eccola là dentro... la motosega di Luciano!');
}
async function lureGhiro() {
  const f = Game.flags;
  if (f.ghiroGone) return say(hero, "Il ghiro se n'è già andato.");
  await walkTo(hero, 48, 126); hero.dir = 'left';
  await say(hero, 'Ehi, ghiro... guarda cosa ho qui. Una bella noce!');
  takeItem('noce'); hero.pose = 'reach';
  ROOM_PARCHEGGIO.nut = { x: 40, y: 118 };
  await tween(ROOM_PARCHEGGIO.nut, { x: 74, y: 137 }, 700);
  hero.pose = 'stand'; hero.dir = 'right';
  ghiro.st = 'jump'; ghiro.flip = false; SFX.chirp();
  await tween(ghiro, { x: 70, y: 137 }, 700);
  ROOM_PARCHEGGIO.nut = null; ghiro.st = 'run'; ghiro.flip = true;
  await say(ghiroActor, 'Squit!');
  hero.dir = 'left';
  await tween(ghiro, { x: -20, y: 141 }, 1500);
  ghiro.st = 'gone'; f.ghiroGone = true;
  addScore('ghiro', 15);
  await say(hero, 'E vai! Torna pure alla tua dépendance.');
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  f.keyTaken = true; giveItem('chiave');
  await say(hero, 'E nel buco del noce... la chiave della baracca!');
  addScore('chiave', 10);
}
async function siphon() {
  const f = Game.flags;
  if (f.tanica !== 'vuota') return say(hero, 'La tanica è già piena. Più di così si rovescia.');
  if (!f.tankOpen && !hasItem('chiaviPunto')) return say(hero, f.keysTaken ? 'Il tappo del serbatoio è chiuso a chiave.' : 'Il tappo del serbatoio è chiuso a chiave. Luciano ha detto che le chiavi le lasciava sul tavolo.');
  if (!f.hoseInCar && !hasItem('tubo')) return say(hero, 'Non posso mica rovesciare la Punto. Mi serve un tubo per travasare.');
  if (!f.tankOpen || !f.hoseInCar) { await walkTo(hero, 316, 131); hero.dir = 'up'; }
  if (!f.tankOpen) await ROOM_PARCHEGGIO.openTank();
  if (!f.hoseInCar) await ROOM_PARCHEGGIO.insertHose();
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
  await say(hero, isKodo() ? 'Casco sopra il colbacco. Sicurezza e stile.' : 'Casco in testa. Sicurezza e stile.');
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
  await say(hero, 'Fatto! Il bosco è salvo, e la cena pure.');
  addScore('legna', 10);
  hero.helmet = false;
  await say(hero, 'Legna per il caminetto e per lo spargher: stasera la baita non gela e la polenta si fa.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(1);
}

/* ---------- capitolo 9: bagagli in macchina e saluto di Luciano ---------- */
async function caricaAuto() {
  const f = Game.flags;
  if (Game.chapter !== 10) return say(hero, 'La Ypsilon la carichiamo domattina. Non ancora.');
  if (f.autoCaricata) return say(hero, 'Il bagagliaio è pieno. Se ci metto un altro calzino, esplode come il bagno della camerata.');
  await walkTo(hero, 364, 118); hero.dir = 'up';
  hero.pose = 'reach'; SFX.thud(); await wait(400); SFX.thud(); await wait(400); hero.pose = 'stand';
  takeItem('bagagli'); f.autoCaricata = true; addScore('auto', 25);
  await say(hero, 'Bagagli nella Ypsilon. Il bagagliaio si chiude solo se ci si siede sopra. Ci siamo seduti sopra.');
  await wait(500);
  luciano.state = 'walk'; luciano.dir = 'right'; luciano.x = Game.camX - 20; luciano.y = 131;
  await walkStraight(luciano, [[300, 132]]);
  luciano.state = 'stand'; luciano.dir = 'right';
  f.lucianoArrivato = true;
  await say(hero, 'Guarda chi arriva... Luciano!');
}
async function lucianoSaluto() {
  const f = Game.flags, L = t => say(luciano, t);
  if (f.salutato) return;
  hero.dir = hero.x < luciano.x ? 'right' : 'left';
  luciano.dir = hero.x < luciano.x ? 'left' : 'right';
  await L('Ah, siete ancora qui. Siete stati a camminare?');
  await say(hero, "Sì! Fino all'orrido Rascie. Di notte. Sul guado Pepi abbiamo pure costruito un ponte.");
  await L("Avete visto l'orrido Rascie?");
  await say(hero, "...Luciano, te l'ho appena detto.");
  await L('Bello, eh? Proprio orrido.');
  for (;;) {
    const opts = [];
    if (!f.chiestoGhiri) opts.push({ id: 'ghiri', text: 'E i ghiri della dépendance?' });
    if (!f.chiestoBagno) opts.push({ id: 'bagno', text: 'Il bagno della camerata è ancora esploso.' });
    if (!f.chiestoCimici) opts.push({ id: 'cimici', text: 'Le cimici nei letti non le abbiamo viste.' });
    opts.push({ id: 'ciao', text: 'Grazie di tutto, Luciano.' });
    const c = await choose(opts);
    await say(hero, c.text);
    if (c.id === 'ghiri') { f.chiestoGhiri = true; await L('Restano loro. Pagano l\'affitto in noci.'); }
    else if (c.id === 'bagno') { f.chiestoBagno = true; await L('Lo so. È così dal novantaquattro. Fa parte del fascino.'); }
    else if (c.id === 'cimici') { f.chiestoCimici = true; await L('Perché si nascondono. Sono timide. Come i ghiri, ma più piccole.'); }
    else {
      await L('Tornate quando volete. La legna però tagliatela voi.');
      await L("Era un pezzo che non venivate. Non fate passare altri anni, eh?");
      await say(hero, 'Promesso. La prossima rimpatriata arriva prima.');
      break;
    }
  }
  await L('Mandi.');
  f.salutato = true; addScore('luciano', 35);
  await say(hero, 'Mandi, Luciano!', { big: true, dur: 1400 });
  for (const n of npcsIn('parcheggio').slice(0, 4)) await say(n.actor, pick(['Mandi!', 'Mandi, Luciano!', 'Mandi mandi!']), { dur: 900 });
  luciano.dir = 'left';
  walkStraight(luciano, [[-30, 133]]).then(() => { luciano.state = 'gone'; });
  await wait(1600);
  hero.dir = 'down';
  await say(hero, 'Si torna a casa. Alla prossima, baita della figata del mondo.');
  await wait(700);
  Game.fadeTarget = 1; await wait(1800);
  endChapter(LAST_CHAPTER);
}

async function finaleScene() {
  luciano.state = 'gone'; luciano.path = [];
  hero.helmet = false;
  await wait(700);
  await walkTo(hero, 236, 132);
  hero.dir = 'left';
  await say(hero, isKodo() ? 'Casa! E qualcuno ha acceso il barbecue... le mie costine!' : 'Casa! E Kodo ha acceso il barbecue... le costine!');
  luciano.state = 'walk'; luciano.dir = 'right'; luciano.x = Game.camX - 20; luciano.y = 131;
  await walkStraight(luciano, [[202, 131]]);
  luciano.state = 'stand'; luciano.dir = 'right';
  const L = t => say(luciano, t);
  await L('Siete stati a camminare?');
  await say(hero, "Sì! Fino all'orrido Rascie. E sul guado Pepi abbiamo pure costruito un ponte.");
  await L("Avete visto l'orrido Rascie?");
  await say(hero, "...Luciano, te l'ho appena detto.");
  await L('Bello, eh? Proprio orrido.');
  await say(hero, isKodo() ? 'Una costina? Sono quasi pronte.' : 'Una costina di Kodo? Sono quasi pronte.');
  await L('Mandi.');
  luciano.dir = 'left';
  walkStraight(luciano, [[-30, 133]]).then(() => { luciano.state = 'gone'; });
  await wait(1600);
  hero.dir = 'down';
  await say(hero, '...Più costine per noi.');
  await wait(700);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(LAST_CHAPTER);
}

/* ---------- Luciano e il ghiro: disegno ---------- */
function drawLuciano(g) {
  if (luciano.state === 'gone') return;
  const talking = isTalking(luciano);
  const talk = talking ? (((Game.t * 8) | 0) % 3 !== 0 ? 1 : 0) : 0;
  const blink = ((Game.t + 1.3) % 3.7) < 0.15;
  if (luciano.state === 'seated') {
    const look = hero.x > 238 ? 1 : 0;
    g.drawImage(cached(`lucS|${talk}|${blink}|${look}`, () => buildLucianoSeated({ talk, blink, look })), 238 - GINO_CX, 117 - 45);
    return;
  }
  const s = actorScale(luciano);
  const phase = luciano.path.length ? (Math.floor(luciano.walkDist / (3 * s)) % 8) / 8 : null;
  const flip = luciano.dir === 'left';
  const cv = cached(`lucW|${phase}|${talk}|${blink}|${flip}`, () => { const c = buildLucianoStanding({ phase, talk, blink }); return flip ? flipCanvas(c) : c; });
  const ox = flip ? LUC_W - LUC_CX - 0.5 : LUC_CX + 0.5;
  g.fillStyle = 'rgba(20,16,10,0.35)';
  g.fillRect(Math.round(luciano.x - 6 * s), Math.round(luciano.y) - 1, Math.round(12 * s), 2);
  g.drawImage(cv, Math.round(luciano.x - ox * s), Math.round(luciano.y - LUC_OY * s), Math.round(cv.width * s), Math.round(cv.height * s));
}
function keysOnTableCanvas() {
  return canvasOf('keysTable', 11, 6, b => {
    b.ellipse(2, 2, 1, 1, '#b0b0b8'); b.rect(3, 1, 4, 1, '#d0d0d8'); b.rect(3, 3, 3, 1, '#c0c0c8');
    b.ellipse(7, 4, 3, 1, '#8aa0a8'); b.set(10, 4, '#8aa0a8'); b.set(8, 4, '#d87a8a');
  });
}

/* ---------- la stanza ---------- */
const ROOM_PARCHEGGIO = {
  id: 'parcheggio', title: 'Parcheggio', width: RW,
  links: { portico: 'versoPortico' },
  spawn: [180, 126],
  walk: [[40, 118], [104, 114], [218, 114], [222, 118], [260, 118], [260, 128], [312, 128], [312, 114], [470, 114], [470, 142], [40, 142]],
  scaleAt(y) { return clamp(0.8 + (y - 114) / 28 * 0.2, 0.8, 1); },
  _ready: false,
  nut: null,
  init() {
    if (this._ready) return;
    this.para = paintParallax();
    this.bg = paintRoom();
    this._ready = true;
  },
  enter(isNew) {
    const f = Game.flags;
    ghiro.st = f.ghiroGone ? 'gone' : 'sit'; ghiro.x = GHIRO_HOME[0]; ghiro.y = GHIRO_HOME[1]; ghiro.flip = false; this.nut = null;
    luciano.path = []; luciano.onArrive = null; luciano.x = 238; luciano.y = 117;
    luciano.state = f.lucianoLeft ? 'gone' : 'seated';
    if (Game.chapter === 10 && f.lucianoArrivato && !f.salutato) { luciano.state = 'stand'; luciano.x = 300; luciano.y = 132; luciano.dir = 'right'; }
    if (f.finale) { runScript(finaleScene); return; }
    if (isNew || !f.lucianoLeft) runScript(lucianoIntro);
  },
  drawBack(g, cam) {
    g.drawImage(this.para, -Math.round(cam * PF), 0);
    g.drawImage(this.bg, -cam, 0);
  },
  darkness() { return isNight() ? 0.84 : 0; },
  lights() {
    const fl = Game.flags.finale ? 0.9 + Math.random() * 0.1 : 0;
    return [
      { x: 128, y: 96, r: 86 * fl, tint: 'rgba(255,130,40,0.22)' },
      { x: 148, y: 77, r: 26, tint: 'rgba(255,200,120,0.15)' },
      { x: 192, y: 84, r: 18, a: 0.8, tint: 'rgba(255,190,90,0.18)' },
      { x: 174, y: 38, r: 20, a: 0.8, tint: 'rgba(255,190,90,0.18)' },
      { x: hero.x, y: hero.y - 26, r: 30, a: 0.55 },
      { x: 300, y: 10, r: 90, a: 0.25 },
    ];
  },
  objects() {
    const f = Game.flags;
    const list = [];
    if (f.finale) list.push({ y: 112.2, draw: g => {
      // fuoco nel barbecue e costine sulla griglia
      for (let x = 118; x < 138; x++) {
        const h = 3 + Math.round((Math.sin(x * 1.7 + Game.t * 9) + Math.sin(x * 0.7 - Game.t * 6)) * 1.5 + 2);
        g.fillStyle = '#ff9a28'; g.fillRect(x, 101 - h, 1, h);
        g.fillStyle = '#ffe070'; g.fillRect(x, 101 - Math.max(1, h - 3), 1, Math.max(1, h - 3));
      }
      g.fillStyle = '#ff4a10'; g.fillRect(118, 100, 20, 1);
      for (let i = 0; i < 4; i++) { g.fillStyle = '#7a2a14'; g.fillRect(119 + i * 5, 97, 4, 2); g.fillStyle = '#a8462a'; g.fillRect(119 + i * 5, 97, 4, 1); }
    } });
    for (const px of [104, 178, 256, 336]) list.push({ y: 120, draw: g => g.drawImage(postCanvas(), px - 10, 71) });
    if (!f.hoseTaken) list.push({ y: 113, draw: g => g.drawImage(hoseCanvas(), 86, 89) });
    list.push({ y: 127.5, draw: g => g.drawImage(puntoCanvas(), 262, 88) });
    list.push({ y: 112.6, draw: g => g.drawImage(ypsilonCanvas(), 342, 66) });
    list.push({ y: 113.6, draw: g => g.drawImage(panelsCanvas(), 398, 84) });
    list.push({ y: 112.5, draw: g => g.drawImage(shedDoorCanvas(), 426, 70) });
    list.push({ y: 115.5, draw: g => g.drawImage(signCanvas(), 472, 97) });
    if (f.lucianoLeft && !f.keysTaken) list.push({ y: 114.2, draw: g => g.drawImage(keysOnTableCanvas(), 211, 92) });
    if (luciano.state !== 'seated') list.push({ y: 117, draw: g => g.drawImage(cached('chairEmpty', () => buildLucianoSeated({ chairOnly: true })), 238 - GINO_CX, 117 - 45) });
    list.push({ y: luciano.state === 'seated' ? 117.1 : luciano.y, draw: drawLuciano });
    if (ghiro.st !== 'gone') {
      list.push({ y: ghiro.y, draw: g => {
        const run = ghiro.st === 'run' || ghiro.st === 'jump';
        const frame = run ? ((((Game.t * 12) | 0) % 2) ? 'run1' : 'run2') : ((((Game.t * 1.3) | 0) % 4 === 0) ? 'sit2' : 'sit');
        g.drawImage(ghiroCanvas(frame, ghiro.flip), Math.round(ghiro.x - 6), Math.round(ghiro.y - 8));
        // la chiave che luccica nel buco
        if (ghiro.st === 'sit' && (Game.t % 2.4) < 0.3) { g.fillStyle = '#fff4b0'; g.fillRect(19, 98, 1, 3); g.fillRect(18, 99, 3, 1); }
      } });
    }
    if (this.nut) { const n = this.nut; list.push({ y: n.y, draw: g => { g.fillStyle = '#8a6a3a'; g.fillRect(Math.round(n.x) - 1, Math.round(n.y) - 3, 3, 3); g.fillStyle = '#b08a50'; g.fillRect(Math.round(n.x), Math.round(n.y) - 3, 1, 1); } }); }
    list.push({ y: 143.5, draw: g => g.drawImage(logsCanvas(), 466, 108) });
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
    if (f.finale) {
      if (Math.random() < dt * 8) addParticle({ x: 120 + Math.random() * 16, y: 94, vx: (Math.random() - 0.5) * 10, vy: -18 - Math.random() * 12, life: 0.9, c: Math.random() < 0.5 ? '#ffb040' : '#ff7020', fade: true });
      if (Math.random() < dt * 4) addParticle({ x: 128 + Math.random() * 2, y: 34, vx: 3 + Math.random() * 3, vy: -6 - Math.random() * 3, life: 3, c: Math.random() < 0.5 ? '#6a6a6a' : '#8a8a8a', fade: true });
    }
    // Luciano: camminata e fumo della pipa
    if (luciano.state === 'walk') updateActor(luciano, dt);
    if (luciano.state !== 'gone' && !isTalking(luciano) && Math.random() < dt * 2.5) {
      const s = actorScale(luciano);
      const px = luciano.state === 'seated' ? 244 : luciano.x + (luciano.dir === 'left' ? -10 : 10) * s;
      const py = luciano.state === 'seated' ? 79 : luciano.y - 43 * s;
      addParticle({ x: px + Math.random(), y: py, vx: 2 + Math.random() * 3, vy: -7 - Math.random() * 3, life: 2.2, c: Math.random() < 0.5 ? '#c8c8c8' : '#a8a8a8', fade: true });
    }
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
      guarda: () => say(hero, "Tendine all'uncinetto. C'erano già vent'anni fa, quando venivamo qui in vacanza da ragazzi. Indistruttibili."),
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
      apri: () => say(hero, F().hoseTaken ? "Acqua? Mi serve benzina, non acqua." : 'Se apro, allago il parcheggio. Basta il bagno della camerata.'),
      usa: () => say(hero, 'Acqua? Mi serve benzina, non acqua.'),
    } },
  { id: 'felci', name: 'Felci', rects: [[92, 104, 18, 18]], walk: [100, 121], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Felci. Esistevano già ai tempi dei dinosauri. Come la tettoia.'),
      raccogli: () => say(hero, "Le lascio dove sono. Fanno tanto 'montagna'."),
    } },
  { id: 'barbecue', name: 'Barbecue in pietra', rects: [[111, 70, 35, 42], [122, 34, 12, 24]], walk: [128, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, isKodo() ? 'Il barbecue in pietra. Bello, ma le mie costine le faccio al portico, col barbecue a carbonella.' : 'Il barbecue in pietra. Bello, ma stasera le costine le fa Kodo al portico, col suo barbecue a carbonella.'),
      apri: () => say(hero, 'Dentro solo cenere fredda. La legna non è per lui: è per il caminetto.'),
      usa: () => say(hero, 'La legna non va qui. Serve al caminetto per scaldare, e allo spargher per la polenta.'),
    },
    use: {
      costine: () => say(hero, 'Le costine le faccio al portico, col barbecue a carbonella. Questo è in pensione.'),
      legna: () => say(hero, 'No: la legna va nel caminetto e nello spargher. Per scaldare e per la polenta.'),
      '*': () => say(hero, 'Il barbecue in pietra è in pensione. Stasera lavorano il caminetto e il barbecue di Kodo.'),
    } },
  { id: 'porta', name: 'Porta di casa', rects: [[154, 66, 22, 46]], walk: [165, 116], face: 'up', def: 'apri',
    verbs: {
      guarda: () => say(hero, 'La porta di casa.'),
      apri: () => say(hero, hasItem('legna')
        ? "Ho la legna, ma questa porta è bloccata da dentro dal 1994. Si entra dal portico, girato l'angolo a sinistra."
        : "Regola della baita: da questa porta non si entra senza legna. L'ha scritto Luciano, col coltello. Ma dal portico, girato l'angolo a sinistra, la regola non vale."),
      chiudi: () => say(hero, 'È già chiusa. Come la mia speranza di un pisolino.'),
    } },
  { id: 'finestra2', name: 'Finestra', rects: [[183, 76, 19, 17]], walk: [192, 117], face: 'up',
    verbs: { guarda: () => say(hero, isKodo() ? 'Dentro è buio. Vedo solo il mio riflesso. Bel colbacco.' : 'Dentro è buio. Vedo solo il mio riflesso. Bel tipo.') } },
  { id: 'tavolo', name: 'Tavolo', rects: [[184, 88, 42, 26]], walk: [205, 121], face: 'up',
    verbs: {
      guarda: () => say(hero, "Il tavolo delle grigliate. Tovaglia a quadri d'ordinanza e la bottiglia di Luciano." + (F().lucianoLeft && !F().keysTaken ? ' E le chiavi della sua Punto.' : '')),
      raccogli: () => F().lucianoLeft && !F().keysTaken ? ROOM_PARCHEGGIO.takeKeys() : say(hero, 'La bottiglia è di Luciano. Toccarla è più pericoloso della motosega.'),
    },
    use: { costine: () => say(hero, 'Le appoggio dopo, al portico. Prima la legna per il caminetto.') } },
  { id: 'punto', name: 'Fiat Punto', rects: [[264, 90, 50, 38]], walk: [316, 131], face: 'up',
    verbs: {
      guarda: () => say(hero, 'La Fiat Punto di Luciano. Rossa, ammaccata, immortale.' + (F().tankOpen ? ' Il tappo del serbatoio è aperto.' : '')),
      apri: async () => {
        if (F().tankOpen) return say(hero, 'Il serbatoio è già aperto.');
        if (hasItem('chiaviPunto')) return ROOM_PARCHEGGIO.openTank();
        return say(hero, F().keysTaken ? 'È chiusa a chiave.' : 'È chiusa a chiave. Luciano ha detto che le chiavi le lasciava sul tavolo.');
      },
      chiudi: () => {
        if (F().tankOpen && !F().siphoned) return say(hero, 'Lo lascio aperto: devo ancora prendere la benzina.');
        if (F().tankOpen) { F().tankOpen = false; SFX.clack(); return say(hero, 'Richiudo il tappo. Luciano non se ne accorgerà mai.'); }
        return say(hero, 'È già tutto chiuso.');
      },
      spingi: () => say(hero, 'Spingere una Punto? Ho già dato nel 2009. In salita.'),
    },
    use: {
      chiaviPunto: () => F().tankOpen ? say(hero, 'Il serbatoio è già aperto.') : ROOM_PARCHEGGIO.openTank(),
      tubo: async () => {
        if (!F().tankOpen && !hasItem('chiaviPunto')) return say(hero, 'Il tappo del serbatoio è chiuso a chiave.');
        if (!F().tankOpen) await ROOM_PARCHEGGIO.openTank();
        await ROOM_PARCHEGGIO.insertHose();
        if (hasItem('tanica') && F().tanica === 'vuota') return siphon();
      },
      tanica: () => siphon(),
      motosega: () => say(hero, 'La Punto è indistruttibile. Anche alle motoseghe, scommetto. Ma non provo.'),
      costine: () => say(hero, 'Le costine nella Punto di Luciano? Profumerebbe di grigliata per anni.'),
    } },
  { id: 'ypsilon', name: 'Lancia Ypsilon', rects: [[342, 72, 46, 41]], walk: [364, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "La Lancia Ypsilon. Il bagagliaio è aperto: c'è la spesa" + (F().tanicaTaken ? '.' : ' e una tanica rossa.')),
      chiudi: () => say(hero, 'Se chiudo il bagagliaio poi nessuno trova più le chiavi. Da ragazzi succedeva ogni volta.'),
      apri: () => say(hero, 'È già aperto. In montagna ci si fida.'),
      spingi: () => say(hero, 'La Ypsilon non si spinge. Neanche col pensiero.'),
    },
    use: {
      bagagli: () => caricaAuto(),
      tanica: () => say(hero, 'Benzina dalla Ypsilon? Poi al ritorno la spingiamo noi. Meglio la Punto di Luciano.'),
      tubo: () => say(hero, 'Benzina dalla Ypsilon? Poi al ritorno la spingiamo noi. Meglio la Punto di Luciano.'),
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
      guarda: () => say(hero, "La baracca degli attrezzi di Luciano. Tronchi veri, l'ha costruita lui nel '78." + (F().shedOpen ? '' : ' La porta ha un lucchetto.')),
      apri: () => ROOM_PARCHEGGIO.doorOpen(),
    },
    use: {
      chiave: () => openShed(),
    } },
  { id: 'portaBaracca', name: () => F().shedOpen ? 'Baracca aperta' : 'Porta della baracca', rects: [[432, 72, 24, 40]], walk: [445, 117], face: 'up', def: 'apri',
    verbs: {
      guarda: () => say(hero, F().shedOpen ? "Dentro: attrezzi, ragnatele e odore d'olio." : 'Una porta di assi con un lucchetto robusto.'),
      apri: () => ROOM_PARCHEGGIO.doorOpen(),
      chiudi: () => say(hero, F().shedOpen ? 'La lascio aperta. Non si sa mai.' : 'È già chiusa. Fin troppo.'),
      spingi: () => say(hero, F().shedOpen ? 'È già aperta.' : 'Il lucchetto tiene. Luciano compra solo roba seria.'),
      tira: () => say(hero, F().shedOpen ? 'È già aperta.' : 'Il lucchetto tiene. Luciano compra solo roba seria.'),
    },
    use: { chiave: () => openShed() } },
  { id: 'casco', name: 'Casco forestale', rects: [[434, 82, 12, 9]], walk: [445, 117], face: 'up', def: 'raccogli', show: () => F().shedOpen && !F().cascoTaken,
    verbs: {
      guarda: () => say(hero, 'Un casco forestale con visiera e cuffie.'),
      raccogli: async () => { hero.pose = 'reach'; await wait(350); hero.pose = 'stand'; F().cascoTaken = true; giveItem('casco'); await say(hero, isKodo() ? 'Casco forestale. Perfetto da mettere sopra il colbacco.' : 'Casco forestale. Con la motosega non si scherza.'); addScore('casco', 5); },
    } },
  { id: 'olio', name: 'Olio per miscela', rects: [[447, 80, 9, 11]], walk: [447, 117], face: 'up', def: 'raccogli', show: () => F().shedOpen && !F().olioTaken,
    verbs: {
      guarda: () => say(hero, 'Olio per motori a due tempi. Serve per fare la miscela.'),
      raccogli: async () => { hero.pose = 'reach'; await wait(350); hero.pose = 'stand'; F().olioTaken = true; giveItem('olio'); await say(hero, "Olio 2T. 'Al due per cento', dice l'etichetta."); addScore('olio', 5); },
    } },
  { id: 'motosega', name: 'Motosega', rects: [[434, 98, 22, 11]], walk: [445, 117], face: 'up', def: 'raccogli', show: () => F().shedOpen && !F().sawTaken,
    verbs: {
      guarda: () => say(hero, 'La motosega di Luciano. Arancione, rumorosa, leggendaria.'),
      raccogli: async () => {
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
        F().sawTaken = true; giveItem('motosega');
        await say(hero, 'Eccola! Pesa come un vitello. Ma è mia.');
        addScore('motosega', 10);
        await say(hero, 'Il serbatoio però è vuoto. Serve la miscela: benzina più olio.');
      },
    } },
  { id: 'pannelli', name: 'Pannelli isolanti', rects: [[398, 84, 26, 30]], walk: [410, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "Pannelli isolanti. 'Li monto la settimana prossima', dice Luciano. Da tre anni."),
      raccogli: () => say(hero, 'Sono leggeri, ma enormi. Non mi stanno in tasca.'),
      spingi: () => say(hero, 'Pesano come una nuvola! Li sposto... dietro non c\'è niente. Li rimetto a posto.'),
      tira: () => say(hero, 'Se li tiro verso di me finiscono sulla Ypsilon. E poi chi lo sente, Luciano.'),
    } },
  { id: 'cartello', name: 'Cartello', rects: () => F().signDown ? [[472, 110, 22, 7]] : [[474, 97, 18, 19]], walk: [466, 117], face: 'right',
    verbs: {
      guarda: () => say(hero, F().signDown ? 'Il cartello del dosso, sdraiato. Ora è lui il dosso.' : 'Un cartello di DOSSO. Non ci sono dossi qui. Mistero della montagna.'),
      spingi: () => { if (F().signDown) return say(hero, "È già per terra. Lascialo riposare."); F().signDown = true; SFX.thud(); return say(hero, 'Ops. Adesso anche il cartello si è sdraiato.'); },
      tira: () => { if (!F().signDown) return say(hero, 'Lo tiro... e lui resta lì. Testardo come Luciano.'); F().signDown = false; return say(hero, 'Lo rimetto su. Il dosso immaginario ringrazia.'); },
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
      raccogli: async () => {
        if (!F().logsCut) return say(hero, pesante('Pesano come un frigorifero. Ciascuno.'));
        if (hasItem('legna') || F().caminettoAcceso) return say(hero, 'Ne ho già presa abbastanza. Il caminetto è piccolo.');
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand'; giveItem('legna');
        return say(hero, 'Una bracciata di legna. Al caminetto!');
      },
      spingi: () => say(hero, 'Non si spostano di un millimetro. Sono tronchi seri.'),
    },
    use: {
      motosega: () => cutWood(),
      casco: () => say(hero, 'Il casco va in testa, non sui tronchi.'),
      '*': () => say(hero, 'Per tagliare i tronchi serve qualcosa di più... rumoroso.'),
    } },
  { id: 'sedia', name: 'Sedia di Luciano', rects: [[227, 82, 22, 35]], walk: [222, 123], face: 'right', show: () => F().lucianoLeft,
    verbs: {
      guarda: () => say(hero, 'La sedia di Luciano. È ancora calda e profuma di pipa.'),
      raccogli: () => say(hero, "Se gliela sposto, Luciano se ne accorge. Anche dall'orrido Rascie."),
      spingi: () => say(hero, 'La lascio dov\'è. È la sua da quarant\'anni.'),
      tira: () => say(hero, 'La lascio dov\'è. È la sua da quarant\'anni.'),
    } },
  { id: 'chiaviTavolo', name: 'Chiavi della Punto', rects: [[209, 90, 14, 8]], walk: [210, 121], face: 'up', def: 'raccogli', show: () => F().lucianoLeft && !F().keysTaken,
    verbs: {
      guarda: () => say(hero, 'Le chiavi della Punto che ha lasciato Luciano. Con un portachiavi a forma di trota.'),
      raccogli: () => ROOM_PARCHEGGIO.takeKeys(),
    } },
  { id: 'noce', name: 'Noce', rects: [[8, 28, 26, 116], [0, 0, 118, 24], [0, 24, 60, 20]], walk: [52, 126], face: 'left',
    verbs: {
      guarda: () => say(hero, 'Un vecchio noce. Per terra è pieno di noci, e nel tronco c\'è un buco.'),
      raccogli: async () => {
        if (hasItem('noce')) return say(hero, 'Ne ho già una in tasca. Non sono mica un ghiro.');
        if (F().ghiroGone) return say(hero, 'Basta noci. Non voglio attirare altri ghiri.');
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
        giveItem('noce');
        await say(hero, 'Raccolgo una noce da terra. Bella piena.');
        addScore('noce', 5);
      },
      spingi: () => say(hero, 'È un noce, non un albero di Natale da scuotere.'),
      tira: () => say(hero, 'È un noce, non un albero di Natale da scuotere.'),
    },
    use: {
      noce: () => F().ghiroGone ? say(hero, 'Rimetterla sotto l\'albero? Ne ha già tante.') : lureGhiro(),
      motosega: () => say(hero, 'Il noce no! Fa le noci. E le noci fanno il nocino.'),
    } },
  { id: 'buco', name: 'Buco nel tronco', rects: [[16, 91, 15, 16]], walk: [48, 126], face: 'left',
    verbs: {
      guarda: () => say(hero, F().ghiroGone ? 'La tana del ghiro. Vuota. Adesso.' : 'Un buco nel tronco. Dentro qualcosa luccica... e davanti c\'è un ghiro che mi fissa.'),
      raccogli: async () => {
        if (F().ghiroGone) return say(hero, "Dentro non c'è più niente. Solo gusci di noce.");
        SFX.chirp(); await say(ghiroActor, 'Fffff!');
        return say(hero, 'Il ghiro difende il suo tesoro. Ci tengo alle dita.');
      },
      apri: () => say(hero, 'È un buco. È già aperto. Il problema è chi ci abita.'),
    },
    use: { noce: () => lureGhiro() },
    give: { noce: () => lureGhiro() } },
  { id: 'ghiro', name: 'Ghiro', person: true, rects: () => [[ghiro.x - 7, ghiro.y - 9, 14, 10]], walk: [48, 126], face: 'left', show: () => !F().ghiroGone && ghiro.st === 'sit',
    verbs: {
      guarda: () => say(hero, 'Un ghiro. Occhioni neri, coda a piumino. Ha nascosto la chiave della baracca nella sua tana.'),
      parla: async () => { await say(hero, 'Ridammi la chiave!'); SFX.chirp(); await say(ghiroActor, 'Fffff!'); await say(hero, 'Il dialogo non è il suo forte.'); },
      raccogli: () => say(hero, "Prendere un ghiro a mani nude? È l'inizio di una storia che finisce al pronto soccorso."),
      spingi: () => say(hero, "Spingere un ghiro? È l'inizio di una storia che finisce al pronto soccorso."),
      tira: () => say(hero, 'Tirare la coda a un ghiro? Neanche per idea.'),
    },
    give: {
      noce: () => lureGhiro(),
      costine: () => say(hero, 'I ghiri mangiano noci e frutta, non costine.'),
      '*': () => say(hero, 'Il ghiro annusa... e mi soffia contro. Vuole qualcosa di più... da ghiro.'),
    },
    use: { noce: () => lureGhiro() } },
  { id: 'lucianoHs', name: 'Luciano', person: true, rects: () => [[luciano.x - 8, luciano.y - 46, 16, 46]], show: () => Game.chapter === 10 && Game.flags.lucianoArrivato && luciano.state === 'stand',
    walk: () => [luciano.x + (hero.x < luciano.x ? -20 : 20), luciano.y + 2], face: null,
    verbs: {
      guarda: () => say(hero, 'Luciano. Coppola, pipa e la faccia di chi ne ha viste tante. Soprattutto ghiri.'),
      parla: () => lucianoSaluto(),
    },
    give: { '*': () => say(luciano, 'Tienilo tu. Mandi.') } },
  { id: 'versoPortico', name: 'Verso il portico', rects: [[34, 112, 14, 32]], walk: [44, 128], face: 'left', exit: true,
    verbs: { vai: () => goToRoom(ROOMS.portico, 466, 126, 'left') } },
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

ROOM_PARCHEGGIO.takeKeys = async function () {
  hero.pose = 'reach'; await wait(350); hero.pose = 'stand';
  Game.flags.keysTaken = true; giveItem('chiaviPunto');
  await say(hero, 'Le chiavi della Punto di Luciano. Portachiavi a forma di trota. Classe.');
  addScore('chiavi', 5);
};

ROOMS.parcheggio = ROOM_PARCHEGGIO;

ROOM_PARCHEGGIO.insertHose = async function () {
  if (Game.flags.hoseInCar) return;
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  takeItem('tubo'); Game.flags.hoseInCar = true;
  await say(hero, 'Tubo infilato nel serbatoio.');
};
