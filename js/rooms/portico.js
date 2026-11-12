'use strict';
/* =========================================================
   IL PORTICO: la facciata della baita verso il prato,
   girato l'angolo del parcheggio. Per ora solo scenografia.
   ========================================================= */
const POW = 480;
const PO_POSTS = [4, 140, 278, 448];

function paintPortico(night) {
  const b = new Buf(POW, SH);
  const r = rng(5150);

  /* ---- balcone del primo piano ---- */
  b.rect(0, 0, POW, 16, (x, y) => ramp(['#7e786a', '#8e887a', '#9c968a'], clamp(vnoise(x / 4, y / 3, 1) * 0.6 + y / 30, 0, 0.999), x, y));
  for (let x = 30; x < POW; x += 74) b.rect(x, 0, 14, 10, '#2a2420'); // finestre in ombra
  const board = (y0, h) => b.rect(0, y0, POW, h, (x, y) => ramp(['#3e2a1a', '#56402c', '#6e563e', '#86705a'], clamp(0.25 + vnoise(x / 7, y, 3) * 0.5 + (y === y0 ? 0.35 : 0) - (y === y0 + h - 1 ? 0.2 : 0), 0, 0.999), x, y));
  board(1, 4); board(8, 4);
  for (let x = 2; x < POW; x += 37) b.rect(x, 0, 3, 14, (px, py) => px === x ? '#7a644c' : '#4a3424');
  // coperte stese sulla ringhiera
  const blanket = (x0, w, h, shader) => {
    b.rect(x0, 1, w, h, shader);
    b.rect(x0, 1, w, 1, '#fffef4');
    for (let x = x0; x < x0 + w; x++) if (hash2(x, 0, x0) < 0.5) b.set(x, h + 1, shader(x, h));
  };
  blanket(58, 24, 13, (x, y) => ((y >> 1) % 3 === 0) ? '#3a5aa8' : (x % 7 === 0 ? '#c8d0e0' : '#eceef2'));
  blanket(196, 30, 12, (x, y) => ((x + y) % 6 < 2) ? '#a88a5a' : ((x * 3 + y) % 11 === 0 ? '#6a4a2a' : '#d8c8a0'));
  blanket(326, 18, 14, (x, y) => ((x >> 2) + (y >> 2)) & 1 ? '#3e7a4a' : '#e8f0e4');
  blanket(404, 14, 9, (x, y) => y % 4 === 0 ? '#b03838' : '#f0e8dc');
  // trave del balcone e teste dei travetti
  beamH(b, 0, 14, POW, 6);
  for (let x = 6; x < POW; x += 16) { b.rect(x, 20, 6, 3, '#2a1a0e'); b.rect(x, 20, 6, 1, '#5a3c24'); }

  /* ---- soffitto del portico, con le strisce LED ---- */
  b.rect(0, 23, POW, 17, (x, y) => {
    if ((y - 23) % 4 === 0) return '#140c06';
    return ramp(['#1c120a', '#26180e', '#302014'], clamp(hash2(x >> 3, y >> 2, 4) * 0.6 + (40 - y) / 40, 0, 0.999), x, y);
  });
  for (const ly of [27, 34]) {
    if (night) ledStrip(b, 18, 446, ly); else b.rect(18, ly, 429, 1, '#9a968a');
    for (let x = 30; x < 446; x += 60) b.rect(x, ly - 1, 2, 1, '#6a6a62');
  }
  b.rect(0, 39, POW, 1, '#0e0804');

  /* ---- muro bianco ---- */
  const wall = stuccoShader(['#b2ab9a', '#bfb8a7', '#cbc5b5', '#d7d2c4', '#e2ded2'], 51);
  b.rect(0, 40, 452, 64, wall);
  b.rect(0, 40, 452, 3, (x, y) => hexMix(wall(x, y), '#000000', 0.25 - (y - 40) * 0.07));
  // zoccolo
  b.rect(0, 104, 452, 6, stoneShader(52, 5, ['#7e786c', '#8a8478', '#968f82'], '#56514a'));
  // macchie di umido e muschio vicino al pavimento
  b.rect(0, 92, 452, 12, (x, y) => fbm(x / 9, y / 4, 53, 2) > 0.62 ? hexMix(wall(x, y), '#6a7a4a', 0.25) : null);
  // estremità sinistra: parete di assi del portico
  b.rect(0, 40, 16, 70, (x, y) => (x % 5 === 0) ? '#22160c' : ramp(['#3a2616', '#4a3220', '#5a3e28'], hash2(x, y >> 2, 54), x, y));

  /* scaffale con cassette, vasi e il corno di ceramica */
  b.rect(16, 62, 2, 48, '#4a3020'); b.rect(56, 62, 2, 48, '#4a3020');
  for (const sy of [64, 80, 96]) { b.rect(16, sy, 42, 2, '#6a4a30'); b.rect(16, sy, 42, 1, '#8a6a46'); }
  b.rect(20, 56, 14, 8, (x, y) => ((x - 20) % 4 === 0) ? '#5a3a1e' : '#8a6038'); // cassetta di legno
  b.rect(38, 58, 6, 6, '#9a4e2a'); b.rect(37, 57, 8, 2, '#b4623a'); // vaso
  b.poly([[22, 78], [40, 72], [42, 74], [26, 80]], '#e8dcc0'); b.ellipse(41, 73, 2, 2, '#c8b898'); b.line(23, 79, 40, 73, '#c4b494'); // corno
  b.rect(46, 72, 8, 8, '#7a7a74'); b.rect(46, 72, 8, 1, '#9a9a94');
  b.rect(20, 86, 34, 10, (x, y) => ((x + y) % 3 === 0) ? '#8a1a1a' : '#b82a2a'); // cassetta rossa di bottiglie
  for (let x = 22; x < 52; x += 5) b.rect(x, 82, 2, 4, '#2a4a2a');
  b.rect(20, 100, 10, 10, '#9a4e2a'); b.rect(34, 102, 18, 8, '#3a3a3a');
  /* gabbia per uccelli appesa */
  b.rect(38, 40, 1, 6, '#3a3a3a');
  b.ellipse(38, 49, 11, 4, '#4a2e18');
  b.rect(27, 49, 23, 15, (x, y) => (x % 2 === 0) ? '#3a2412' : null);
  b.rect(26, 63, 25, 3, '#5a3a20'); b.rect(26, 63, 25, 1, '#7a5432');
  b.ellipse(33, 59, 4, 3, '#4e7a2e'); b.ellipse(42, 57, 4, 5, '#3e6a26'); b.ellipse(38, 60, 3, 3, '#6a9a3a'); b.set(42, 54, '#c84a6a');
  b.rect(27, 49, 23, 15, (x, y) => (x % 2 === 0) ? (x % 4 ? '#3a2412' : '#5a3a20') : null);

  /* tavolino con la tovaglia a fiori gialli */
  const floral = (x, y) => {
    const h = hash2(x >> 1, y >> 1, 60);
    if (h < 0.18) return '#c8a830'; if (h < 0.3) return '#6a8a3a';
    return ramp(['#c8c8a0', '#d8d8b4', '#e4e4c8'], hash2(x, y, 61), x, y);
  };
  b.rect(70, 88, 66, 3, floral);
  b.rect(70, 91, 66, 12, (x, y) => hexMix(floral(x, y), '#000000', 0.12));
  laceHem(b, 70, 135, 103);
  for (const lx of [74, 130]) b.rect(lx, 105, 2, 7, '#d8d8d0');
  // birre, bottiglia, pentolino
  b.rect(82, 81, 5, 7, '#d89a2a'); b.rect(82, 80, 5, 2, '#f4f0e0'); b.rect(83, 82, 1, 5, '#f0c050');
  b.rect(94, 82, 5, 6, '#2a160c'); b.rect(94, 81, 5, 1, '#d8c8a8'); b.set(95, 83, '#5a3418');
  b.rect(108, 74, 5, 14, '#1e3a1e'); b.rect(109, 70, 3, 4, '#1e3a1e'); b.rect(108, 79, 5, 4, '#e8dcc0'); b.set(109, 75, '#4a7a4a');
  b.rect(118, 83, 10, 5, '#1e1e1e'); b.rect(117, 82, 12, 1, '#3a3a3a'); b.rect(128, 84, 3, 1, '#3a3a3a');
  // sedia impagliata e sedia rossa
  b.rect(60, 78, 2, 34, '#5a3a20'); b.rect(66, 96, 2, 16, '#5a3a20'); b.rect(60, 96, 9, 3, (x, y) => ((x + y) & 1) ? '#b89a50' : '#8a7038');
  for (const yy of [82, 87]) b.rect(60, yy, 2, 2, '#7a5430');
  b.rect(138, 84, 2, 28, '#6a1a14'); b.rect(146, 98, 2, 14, '#6a1a14'); b.rect(138, 96, 11, 3, '#b8302a'); b.rect(138, 84, 2, 12, '#a02a24');

  /* finestre con gli scuri chiusi */
  const shutters = (x0, y0, w, h) => {
    b.rect(x0 - 2, y0 - 2, w + 4, h + 4, '#3a2414');
    b.rect(x0, y0, w, h, (x, y) => ((y - y0) % 3 === 0) ? '#1e1008' : ramp(['#3e2414', '#4e2e18', '#5e3a20'], hash2(x >> 2, y, 62), x, y));
    b.rect(x0 + (w >> 1), y0, 1, h, '#1a0e06');
    b.rect(x0 - 3, y0 + h + 2, w + 6, 2, '#a8a294'); b.rect(x0 - 3, y0 + h + 2, w + 6, 1, '#c8c2b4');
    b.set(x0 + (w >> 1) - 2, y0 + (h >> 1), '#2a2a2a'); b.set(x0 + (w >> 1) + 2, y0 + (h >> 1), '#2a2a2a');
  };
  shutters(152, 56, 26, 36);
  shutters(356, 58, 24, 34);

  /* appendiabiti con la borsa blu */
  b.rect(186, 55, 30, 4, '#5a3a20'); b.rect(186, 55, 30, 1, '#7a5432');
  for (let x = 189; x < 214; x += 7) { b.rect(x, 59, 1, 3, '#8a8a8a'); b.set(x + 1, 61, '#8a8a8a'); }
  b.line(197, 61, 194, 68, '#1a3a8a'); b.line(197, 61, 207, 68, '#1a3a8a');
  b.poly([[192, 68], [210, 68], [212, 90], [190, 90]], (x, y) => ramp(['#132e78', '#1c3e98', '#2a50b4', '#3a64c8'], clamp(0.5 + vnoise(x / 3, y / 5, 63) * 0.5 - (x - 190) / 60, 0, 0.999), x, y));
  b.rect(196, 74, 10, 6, '#e8e4dc'); b.rect(197, 75, 8, 4, '#2a50b4');

  /* porta del salone (doppia, con i vetri stretti) */
  b.rect(226, 48, 38, 62, '#2e1a0c'); b.rect(226, 48, 38, 1, '#5a3c22');
  for (const lx of [228, 245]) {
    b.rect(lx, 50, 17, 60, (x, y) => ramp(['#4a2a14', '#5a3418', '#6a4020', '#7a4c28'], clamp(0.3 + vnoise(x * 0.9, y / 9, 64) * 0.5 + (((x - lx) % 4) === 0 ? -0.25 : 0), 0, 0.999), x, y));
    b.rect(lx, 50, 1, 60, '#3a2010');
    b.rect(lx + 6, 56, 5, 32, '#2a1608');
    b.rect(lx + 7, 57, 3, 30, (x, y) => night ? ramp(['#c08a3a', '#e8b860', '#f8d888'], hash2(x, y, 65) * 0.6 + 0.3, x, y) : ramp(['#5e6a74', '#7a8894', '#98a6b0'], clamp((y - 57) / 40 + hash2(x, y, 66) * 0.3, 0, 0.999), x, y));
    if (!night) b.line(lx + 7, 70, lx + 9, 64, '#c8d4dc');
    b.rect(lx + 3, 94, 11, 12, (x, y) => ((x - lx) % 3 === 0) ? '#3e2210' : '#5a3418');
  }
  b.rect(242, 78, 1, 4, '#d8c070'); b.rect(247, 78, 1, 4, '#d8c070');
  b.rect(224, 110, 42, 2, '#8a857a');
  // lampada sopra la porta
  b.rect(238, 42, 14, 6, night ? '#fff4d0' : '#e8e6de'); b.rect(238, 47, 14, 1, '#a8a49a'); b.rect(244, 41, 2, 1, '#8a8a8a');

  /* mobiletti della cucina da esterno */
  const cab = (x0, y0, w, h, doors) => {
    b.rect(x0, y0, w, h, (x, y) => ramp(['#8e8270', '#a09482', '#b2a692', '#c2b8a4'], clamp(0.35 + vnoise(x / 2, y / 9, 67) * 0.4, 0, 0.999), x, y));
    const dw = w / doors;
    for (let i = 0; i < doors; i++) {
      const dx = Math.round(x0 + i * dw);
      b.rect(dx, y0, 1, h, '#5e5446');
      b.rect(dx + Math.round(dw / 2) + (i % 2 ? -3 : 2), y0 + (h >> 1) - 1, 1, 3, '#4a4036');
    }
    b.rect(x0, y0 + h - 1, w, 1, '#5e5446'); b.rect(x0, y0, w, 1, '#d4cab6');
  };
  cab(274, 54, 72, 22, 4);
  b.rect(274, 76, 72, 2, (x, y) => hexMix(wall(x, y), '#000000', 0.3));
  cab(274, 89, 72, 21, 4);
  b.rect(272, 86, 76, 3, '#d8ccb0'); b.rect(272, 86, 76, 1, '#ece4cc'); b.rect(272, 88, 76, 1, '#a89c84');
  b.rect(330, 78, 12, 8, '#e0b830'); b.rect(330, 78, 12, 1, '#f4d050'); b.rect(333, 81, 6, 2, '#b88a20');
  b.rect(281, 79, 10, 7, '#ece8e0'); b.rect(281, 79, 10, 1, '#fffef8'); b.rect(284, 77, 4, 2, '#d8d4cc');
  b.rect(300, 76, 4, 10, '#a8a02a'); b.rect(301, 73, 2, 3, '#2a5a2a'); b.rect(300, 79, 4, 3, '#f0e8c8');
  b.rect(312, 80, 8, 6, '#c8c8c4'); b.rect(311, 80, 10, 1, '#e8e8e4'); b.rect(320, 82, 2, 2, '#c8c8c4'); // bollitore

  /* tubi elettrici e presa */
  b.rect(386, 44, 2, 44, '#c8c6be'); b.rect(386, 44, 66, 2, '#c8c6be'); b.rect(386, 44, 66, 1, '#e4e2da');
  b.rect(382, 86, 10, 10, '#a8a8a0'); b.rect(382, 86, 10, 1, '#d0d0c8'); b.rect(384, 89, 6, 4, '#c03a2a'); b.rect(384, 89, 6, 1, '#e05a4a');

  /* bidone con le lattine, cassetta gialla e paletto */
  b.poly([[402, 58], [432, 58], [434, 74], [400, 74]], (x, y) => ramp(['#2e3236', '#3a3e42', '#464a4e'], hash2(x, y >> 1, 68) * 0.5 + (y - 58) / 30, x, y));
  b.rect(400, 74, 34, 4, '#1a1c1e');
  const cans = ['#d8b040', '#c8c8c8', '#b83030', '#2a5ab0', '#e8e0c8', '#1e1e1e'];
  for (let i = 0; i < 14; i++) { const cx = 402 + (r() * 30 | 0), cy = 72 + (r() * 4 | 0); b.rect(cx, cy, 3, 2, pickR(cans, r)); }
  b.ellipse(426, 72, 5, 3, '#e8e8e4');
  b.rect(400, 78, 34, 30, (x, y) => ramp(['#3e4246', '#4a4e52', '#565a5e', '#62666a'], clamp(0.3 + (x - 400) / 60 + vnoise(x / 3, y / 8, 69) * 0.2, 0, 0.999), x, y));
  b.rect(400, 78, 34, 2, '#2a2c2e'); b.rect(402, 86, 30, 1, '#36393c');
  b.ellipse(404, 108, 3, 3, '#1a1a1a'); b.ellipse(430, 108, 3, 3, '#1a1a1a');
  b.rect(436, 96, 12, 14, (x, y) => ((x - 436) % 4 === 0 || (y - 96) % 5 === 0) ? '#b88a18' : '#e0b830');
  b.rect(440, 80, 6, 16, (x, y) => (((y - 80) >> 2) & 1) ? '#f0ece4' : '#c8302a');

  /* angolo della casa e vista sul prato (uscita verso il parcheggio) */
  b.rect(450, 20, 4, 90, '#8e887a'); b.rect(450, 20, 1, 90, '#a8a294');
  b.rect(454, 0, 26, 112, (x, y) => {
    if (night) {
      if (y < 60) return hash2(x, y, 70) < 0.02 ? '#a8b8e8' : ramp(['#060a1c', '#0a1230', '#101a40'], y / 60, x, y);
      return ramp(['#060806', '#0a0e0a', '#101610'], hash2(x >> 1, y >> 1, 71), x, y);
    }
    if (y < 70) return fbm(x / 5, y / 5, 72, 3) > 0.42 ? ramp(PAL.grass.concat(['#8aaa54']), fbm(x / 3, y / 3, 73, 2) * 1.2 - 0.1, x, y) : ramp(['#a8c8f0', '#c8dcf4'], hash2(x, y, 74), x, y);
    return ramp(PAL.grass, clamp(vnoise(x / 4, y / 3, 75) * 0.7 + (y - 70) / 80, 0, 0.999), x, y);
  });

  /* ---- pavimento: acciottolato in prospettiva ---- */
  const cob = stoneShader(76, 7, ['#6a665e', '#78736a', '#868176', '#605c54', '#928b80', '#766a5e'], '#363230', 0.75);
  b.rect(0, 110, POW, 28, (x, y) => {
    const d = y - 110, t = d / 28, s = 1.5 - 0.7 * t;
    const wy = 1.5 * d - 0.7 * d * d / 56;
    if (x >= 454) return night ? ramp(['#0e120c', '#141a12'], hash2(x, y, 77), x, y) : ramp(PAL.grass, clamp(0.5 + vnoise(x / 4, y / 3, 78) * 0.4, 0, 0.999), x, y);
    const c = cob(x * s + 3, wy);
    return d < 2 ? hexMix(c, '#000000', 0.3) : c;
  });
  // gradino davanti
  b.rect(0, 138, 454, 1, '#2e2a26');
  b.rect(0, 139, 454, 1, '#c4beb0');
  b.rect(0, 140, 454, 4, (x, y) => (x % 38 === 0) ? '#5e5a52' : ramp(['#8e887a', '#9e988a', '#aea89a'], hash2(x >> 1, y, 79), x, y));
  b.rect(454, 138, 26, 6, night ? '#0e120c' : '#4f7a32');
  return b.canvas();
}
function pickR(arr, r) { return arr[(r() * arr.length) | 0]; }

/* ---------- oggetti in primo piano ---------- */
function porticoPostCanvas() {
  return canvasOf('poPost', 33, 144, b => {
    b.rect(13, 20, 7, 124, (x, y) => x === 13 ? '#7a5a3c' : x === 19 ? '#1e120a' : ramp(['#2e1c10', '#3a2416', '#4a2e1c', '#5a3a24'], clamp(0.3 + vnoise(x, y / 9, 80) * 0.6, 0, 0.999), x, y));
    b.thick(1, 21, 13, 33, 2, '#3a2416'); b.thick(31, 21, 19, 33, 2, '#3a2416');
    b.line(1, 20, 13, 32, '#5a3a24'); b.line(31, 20, 19, 32, '#5a3a24');
    b.rect(12, 138, 9, 6, '#6a645a'); b.rect(12, 138, 9, 1, '#8e887a');
  });
}
function kegsCanvas() {
  return canvasOf('poKegs', 30, 24, b => {
    for (const kx of [1, 15]) {
      b.rect(kx, 4, 13, 19, (x, y) => ramp(['#7a5a12', '#a8801e', '#d0a830', '#ecc850', '#f8e088'], clamp(0.2 + (x - kx) / 13 * 0.9 - ((y % 6) === 0 ? 0.25 : 0), 0, 0.999), x, y));
      b.ellipse(kx + 6, 4, 6, 2, '#e8c860'); b.ellipse(kx + 6, 4, 4, 1, '#b08a28'); b.rect(kx + 5, 2, 3, 2, '#2a2a2a');
      b.rect(kx, 11, 13, 5, '#f4f0e4'); b.rect(kx, 13, 13, 1, '#c03028'); b.rect(kx + 3, 12, 7, 1, '#2a2a2a');
      b.rect(kx, 22, 13, 1, '#5a4210');
    }
  });
}
function plasticChairCanvas() {
  return canvasOf('poChair', 28, 38, b => {
    const w = (x, y) => ramp(['#b8b8b2', '#d4d4ce', '#ecece6', '#fafaf6'], clamp(0.6 + (x - 14) / 40 - (y - 20) / 80, 0, 0.999), x, y);
    b.rect(3, 0, 22, 16, w);
    for (let x = 6; x < 23; x += 4) b.rect(x, 3, 2, 10, '#9a9a94');
    b.rect(1, 16, 26, 4, w); b.rect(1, 19, 26, 1, '#a8a8a2');
    b.thick(3, 20, 1, 37, 2, '#c8c8c2'); b.thick(24, 20, 26, 37, 2, '#c8c8c2');
    b.thick(7, 20, 7, 33, 2, '#a8a8a2'); b.thick(20, 20, 20, 33, 2, '#a8a8a2');
    // sacchetto di patatine
    b.poly([[9, 6], [19, 7], [20, 18], [8, 17]], (x, y) => ((x + y) % 5 === 0) ? '#e8e8e0' : '#fafaf4');
    b.rect(10, 10, 8, 4, '#e88a20'); b.rect(12, 11, 4, 2, '#c84a18');
  });
}
function frontTableCanvas() {
  return canvasOf('poTable', 68, 38, b => {
    const cloth = (x, y) => {
      const h = hash2(x >> 1, y >> 1, 81);
      if (h < 0.15) return '#5a7ac0'; if (h < 0.22) return '#c84a5a';
      return ramp(['#d8d8d0', '#e8e8e0', '#f6f6f0'], hash2(x, y, 82), x, y);
    };
    b.rect(2, 12, 64, 4, cloth);
    b.rect(2, 16, 64, 10, (x, y) => hexMix(cloth(x, y), '#000000', 0.15));
    laceHem(b, 2, 65, 26);
    b.rect(5, 28, 2, 10, '#3a2a1e'); b.rect(61, 28, 2, 10, '#3a2a1e');
    // teglia, lattine, boccale, spray, rotolo dei coltelli, tazza, birra scura
    b.rect(6, 9, 20, 4, '#b8bcc0'); b.rect(6, 9, 20, 1, '#e4e8ec'); b.rect(7, 10, 18, 1, '#8a9096');
    b.rect(18, 1, 4, 11, '#e8eef4'); b.rect(18, 4, 4, 3, '#3a6ac8'); b.rect(19, 0, 2, 1, '#2a2a2a');
    b.rect(28, 4, 5, 9, '#1e1e1e'); b.rect(28, 6, 5, 3, '#c8a030'); b.rect(28, 4, 5, 1, '#8a8a8a');
    b.rect(35, 2, 6, 11, '#8e8c86'); b.rect(35, 2, 6, 1, '#b8b6b0'); b.rect(36, 7, 4, 1, '#3a5a9a'); b.rect(41, 5, 2, 5, '#6e6c66');
    b.poly([[42, 9], [62, 8], [63, 14], [43, 14]], (x, y) => ((x + y) % 4 === 0) ? '#8a1a16' : '#c8302a');
    for (let x = 46; x < 60; x += 3) { b.rect(x, 6, 1, 3, '#d8d8d8'); b.set(x, 5, '#4a2e1a'); }
    b.rect(52, 10, 6, 3, '#f4f4ee'); b.set(58, 11, '#f4f4ee');
    b.rect(60, 3, 4, 10, '#1a0e08'); b.rect(60, 3, 4, 1, '#c8b890');
  });
}

/* ---------- capitolo 2: Defi e Iron, la ventola del caminetto ---------- */
const ironActor = () => (npcsIn('portico').find(n => n.id === 'iron') || {}).actor;
async function ventolaIntro() {
  const f = Game.flags, iron = ironActor();
  f.ch2Intro = true;
  await wait(700);
  await say(iron, `${hero.name}! La ventola del caminetto si è bloccata. Fa "trrr" e poi muore.`);
  await say(hero, 'E senza ventola?');
  await say(iron, 'Senza ventola il caldo resta nel camino e noi in maglione. Io ti faccio da supporto tecnico.');
  await say(hero, 'Cioè guardi.');
  await say(iron, 'Supporto tecnico. Tieni: spray sbloccante. Gli attrezzi sono nei mobiletti qui del portico.');
  giveItem('spray');
  banner('OBIETTIVO: aggiusta la ventola del caminetto e accendi il fuoco.', 5);
}
// Iron dà sempre il consiglio giusto per il passo in cui sei
async function ironTalk(iron) {
  const f = Game.flags;
  hero.dir = hero.x < iron.x ? 'right' : 'left';
  if (f.caminettoAcceso) return say(iron, 'Fuoco acceso e ventola che gira. Supporto tecnico: missione compiuta.');
  if (!hasItem('cacciavite') && !f.ventolaAperta) return say(iron, 'Il cacciavite è nei mobiletti, qui dietro. Apri e cerca.');
  if (!f.ventolaAperta) return say(iron, 'La ventola è sul camino, sopra la mensola. Svita la griglia col cacciavite.');
  if (!f.gusciTolti) { await say(iron, "Dentro c'è qualcosa? Togli tutto quello che non è una ventola."); return say(hero, 'Detto da te sembra facile.'); }
  if (!f.ventolaOk) return say(iron, 'Se cigola, spray sbloccante. Se non cigola, spray sbloccante lo stesso.');
  return say(iron, 'Adesso la legna nel caminetto e accendi. La ventola farà il resto.');
}

/* ---------- capitolo 5: il portico delle costine ---------- */
const npcActor = id => (npcsIn(Game.room ? Game.room.id : '').find(n => n.id === id) || {}).actor;
const FP = () => Game.flags;
const BBQ_POS = { x: 214, y: 138 };
async function costineIntro() {
  const f = FP(), zac = npcActor('zac'), chino = npcActor('chino');
  f.ch5Intro = true;
  await wait(700);
  await say(zac, `${hero.name}, il barbecue è lì contro il muro, piegato. Montalo!`);
  await say(chino, "Io penso alla musica. È un ministero anche quello.");
  await say(hero, 'Barbecue, carbonella, costine e una cassa di Guinness. Il piano è perfetto.');
  banner('OBIETTIVO: prepara il barbecue, griglia le costine e scolati una cassa di Guinness.', 5);
}
async function montaBbq() {
  const f = FP();
  if (f.bbqMontato) return say(hero, 'È già montato. Tre gambe, una griglia, zero istruzioni.');
  await walkTo(hero, 368, 118); hero.dir = 'up';
  hero.pose = 'reach'; SFX.clack(); await wait(400); hero.pose = 'stand';
  await walkTo(hero, BBQ_POS.x + 18, BBQ_POS.y - 4); hero.dir = 'left';
  hero.pose = 'reach'; SFX.thud(); await wait(400); hero.pose = 'stand';
  f.bbqMontato = true;
  addScore('bbq', 15);
  await say(hero, 'Barbecue montato davanti al portico. Le istruzioni le ho buttate: le avevo già in testa.');
}
async function carbonellaBbq() {
  const f = FP();
  if (!f.bbqMontato) return say(hero, 'Prima monto il barbecue. La carbonella per terra fa solo tristezza.');
  if (f.carbonellaMessa) return say(hero, "La carbonella c'è già. Di più, e si griglia anche il portico.");
  await walkTo(hero, BBQ_POS.x + 18, BBQ_POS.y - 4); hero.dir = 'left';
  hero.pose = 'reach'; SFX.pour(); await wait(700); hero.pose = 'stand';
  takeItem('carbonella'); f.carbonellaMessa = true;
  addScore('carbonella', 15);
  await say(hero, 'Carbonella nel barbecue. Una bella montagnola, come insegna la tradizione.');
}
async function accendiBbq() {
  const f = FP(), chino = npcActor('chino');
  if (!f.bbqMontato) return say(hero, 'Accendere cosa? Il barbecue è ancora piegato.');
  if (!f.carbonellaMessa) return say(hero, 'Accendere il barbecue vuoto? Si scalda solo la griglia.');
  if (f.bbqAcceso) return say(hero, 'È già acceso. Adesso ci vuole pazienza.');
  await walkTo(hero, BBQ_POS.x + 18, BBQ_POS.y - 4); hero.dir = 'left';
  hero.pose = 'reach'; SFX.clack(); await wait(300); SFX.clack(); await wait(500); hero.pose = 'stand';
  f.bbqAcceso = true;
  addScore('bbqAcceso', 20);
  await say(hero, "La carbonella prende... piano piano... fumo, fumo, e un po' di brace.");
  await say(chino, 'Così non va. Alla brace manca la musica.');
}
async function costineBbq() {
  const f = FP();
  if (f.costineSu) return say(hero, 'Le costine sono già sulla griglia. Sfrigolano come una standing ovation.');
  if (!f.bbqAcceso) return say(hero, 'Sulla carbonella fredda? Neanche per sogno.');
  if (!f.musica) return say(hero, 'La brace non è ancora pronta. Chino dice che manca la musica. Chino ha sempre ragione sulla brace.');
  await walkTo(hero, BBQ_POS.x + 18, BBQ_POS.y - 4); hero.dir = 'left';
  hero.pose = 'reach'; SFX.thud(); await wait(400); hero.pose = 'stand';
  takeItem('costine'); f.costineSu = true;
  addScore('costine', 20);
  await say(hero, 'Costine sulla griglia! Sfrigolano. Che profumo.');
  await say(hero, 'Adesso si aspetta. E mentre si aspetta...');
}
async function beviGuinness() {
  const f = FP(), zac = npcActor('zac'), chino = npcActor('chino');
  if (f.guinnessFinita) return say(hero, "Finita. Fino all'ultima lattina.");
  if (!f.costineSu) return say(hero, "Prima le costine sul fuoco. La Guinness è il premio, non l'antipasto.");
  hero.dir = 'down';
  await say(hero, 'Ragazzi... la cassa di Guinness!');
  await say(zac, 'Finalmente.');
  for (let i = 0; i < 4; i++) { hero.pose = 'reach'; SFX.gulp(); await wait(500); hero.pose = 'stand'; await wait(250); }
  takeItem('guinness'); f.guinnessFinita = true;
  addScore('guinness', 15);
  await say(chino, 'Amen.');
  await say(zac, 'Le costine sono pronte. E anche noi.');
  await say(hero, 'Cassa finita, costine pronte. Questo è il portico più bello del mondo.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(5);
}
// Zac e Chino fanno da supporto
async function zacTalk(zac) {
  const f = FP();
  hero.dir = hero.x < zac.x ? 'right' : 'left';
  if (f.bbqMontato && f.carbonellaMessa && !f.bbqAcceso && !hasItem('accendino')) {
    await say(zac, "Ti serve l'accendino? Tieni. Fiamma alta, come piace a me.");
    giveItem('accendino');
    return;
  }
  if (!f.bbqMontato) return say(zac, 'Il barbecue è piegato contro il muro, sotto la finestra. Montalo.');
  if (!f.carbonellaMessa) return say(zac, 'La carbonella è nei mobiletti. Il sacco grosso.');
  if (!f.bbqAcceso) return say(zac, "Hai l'accendino. Usalo. Sul barbecue, non su di me.");
  if (!f.costineSu) return say(zac, 'Senti Chino: lui sa come si fa la brace.');
  return say(zac, 'La cassa di Guinness è lì per terra. Lo dico solo per dire.');
}
async function chinoTalk(chino) {
  const f = FP();
  hero.dir = hero.x < chino.x ? 'right' : 'left';
  if (f.bbqAcceso && !f.musica) {
    await say(chino, 'Ci vuole la musica. Sennò la brace non viene. È scienza.');
    f.musica = true; SFX.music(true);
    addScore('musica', 15);
    await say(chino, 'Ecco. Senti come si sveglia la carbonella?');
    return say(hero, 'La brace è pronta. Incredibile. Avevi ragione. Grazie Chino.');
  }
  if (!f.bbqAcceso) return say(chino, 'Prima accendi, poi metto la musica. Ogni cosa a suo tempo.');
  if (!f.costineSu) return say(chino, 'Brace perfetta. Adesso le costine, figliolo.');
  return say(chino, 'Bevi con moderazione. Cioè tutta la cassa, ma con calma.');
}
function bbqCanvas(st) {
  return canvasOf('bbq' + st, 30, 34, b => {
    // gambe
    b.line(6, 18, 2, 33, '#2a2a2a'); b.line(24, 18, 28, 33, '#2a2a2a'); b.line(15, 20, 15, 33, '#1a1a1a');
    // braciere
    b.ellipse(15, 12, 13, 8, '#1e1e1e'); b.rect(2, 4, 27, 8, null);
    b.ellipse(15, 12, 13, 7, (x, y) => ramp(['#141414', '#262626', '#3a3a3a'], clamp(0.6 - (y - 12) / 14 + (x - 15) / 40, 0, 0.999), x, y));
    b.rect(2, 9, 27, 4, null);
    b.ellipse(15, 10, 13, 3, '#2a2a2a');
    if (st >= 1) b.ellipse(15, 10, 11, 2, (x, y) => st >= 2 ? (hash2(x, y, 620) < 0.5 ? '#ff7020' : '#c83a10') : (hash2(x, y, 621) < 0.5 ? '#3a3a3a' : '#1a1a1a'));
    for (let x = 3; x < 28; x += 2) b.set(x, 9, '#9a9a9a');
    b.rect(2, 9, 27, 1, '#8a8a8a');
    if (st >= 3) for (let i = 0; i < 4; i++) { b.rect(5 + i * 6, 7, 5, 2, '#7a2a14'); b.rect(5 + i * 6, 7, 5, 1, '#a8462a'); }
  });
}
function bbqFoldedCanvas() {
  return canvasOf('bbqFold', 18, 18, b => {
    b.ellipse(9, 6, 8, 6, '#1e1e1e'); b.ellipse(9, 5, 6, 3, '#3a3a3a'); b.rect(8, 0, 3, 1, '#8a8a8a');
    b.line(3, 9, 1, 17, '#2a2a2a'); b.line(15, 9, 17, 17, '#2a2a2a'); b.line(9, 10, 9, 17, '#1a1a1a');
  });
}
function guinnessCanvas() {
  return canvasOf('guinness', 16, 10, b => {
    b.rect(0, 2, 16, 8, '#141414'); b.rect(0, 2, 16, 1, '#2a2a2a');
    b.rect(3, 4, 10, 4, '#e8dcb8'); b.rect(6, 5, 4, 2, '#c8a040');
    for (let x = 1; x < 16; x += 3) { b.rect(x, 0, 2, 2, '#1e1e1e'); b.set(x, 0, '#c8c8c8'); }
  });
}

/* ---------- capitolo 9: la colazione ---------- */
async function colazioneIntro() {
  const f = FP(), jackal = npcActor((Game.roles || {}).brioche);
  f.ch9Intro = true;
  await wait(700);
  await say(hero, 'Mattina. Sole, aria fina, e un mal di testa a sessantaquattro gradi.');
  if (jackal) await say(jackal, 'Brioche per tutti! Quelle con la crema, come promesso.');
  await say(hero, 'Colazione, bagagli in macchina e poi si saluta Luciano.');
  banner('OBIETTIVO: fai colazione, carica i bagagli sulla Ypsilon e saluta Luciano.', 5);
}
async function mangiaBrioche() {
  const f = FP();
  if (f.briocheMangiata) return say(hero, 'Ne ho già mangiata una. Due. Va bene, tre.');
  await walkTo(hero, 320, 128); hero.dir = 'down';
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  SFX.gulp(); f.briocheMangiata = true; addScore('brioche', 25);
  await say(hero, 'Brioche alla crema, ancora tiepida. Il mal di testa si arrende.');
}
async function prendiBagagli() {
  const f = FP();
  if (hasItem('bagagli') || f.autoCaricata) return say(hero, 'I bagagli li ho già presi. Pesano come un ghiro dopo l\'inverno.');
  await walkTo(hero, 206, 128); hero.dir = 'up';
  hero.pose = 'reach'; SFX.thud(); await wait(400); hero.pose = 'stand';
  giveItem('bagagli'); addScore('bagagli', 15);
  await say(hero, 'Zaini, borsoni, sacchi a pelo e la teglia vuota delle costine. Si va alla macchina.');
}
function brioscheCanvas() {
  return canvasOf('brioche', 30, 8, b => {
    b.rect(0, 5, 30, 2, '#b8bcc0'); b.rect(0, 5, 30, 1, '#e4e8ec');
    for (const [x, y] of [[2, 2], [9, 1], [16, 2], [23, 1], [6, 0], [19, 0]]) {
      b.ellipse(x + 3, y + 2, 4, 2, '#c88a3a'); b.set(x + 2, y + 1, '#e8b860'); b.set(x + 4, y + 1, '#f8f0e0');
    }
  });
}
function bagagliCanvas() {
  return canvasOf('bagagli', 26, 16, b => {
    b.rect(0, 6, 12, 10, '#2a5a2a'); b.rect(0, 6, 12, 1, '#3e7a3e'); b.rect(3, 4, 6, 2, '#1e3e1e');
    b.rect(10, 8, 14, 8, '#1e2a4a'); b.rect(10, 8, 14, 1, '#2e3e6a'); b.rect(14, 6, 6, 2, '#141c30');
    b.ellipse(19, 4, 6, 3, '#a8261c'); b.ellipse(19, 4, 5, 2, '#c83a28');
  });
}

/* ---------- la stanza ---------- */
const ROOM_PORTICO = {
  id: 'portico', title: 'Portico', width: POW,
  links: { parcheggio: 'versoParcheggio', salone: 'portaSalone', dependance: 'versoDependance' },
  spawn: [240, 120],
  walk: [[16, 114], [450, 114], [478, 118], [478, 140], [356, 140], [354, 128], [286, 128], [284, 140], [110, 140], [108, 128], [42, 128], [40, 140], [16, 140]],
  scaleAt(y) { return clamp(0.82 + (y - 114) / 26 * 0.18, 0.82, 1); },
  init() {},
  enter() {
    if (Game.chapter === 2 && !Game.flags.ch2Intro) runScript(ventolaIntro);
    if (Game.chapter === 5 && !Game.flags.ch5Intro) runScript(costineIntro);
    if (Game.chapter === 9 && !Game.flags.ch9Intro) runScript(colazioneIntro);
  },
  drawBack(g, cam) { g.drawImage(dayNightBg(this, paintPortico), -cam, 0); },
  darkness() { return isNight() ? 0.8 : 0; },
  lights() {
    const L = [];
    for (let x = 40; x < 450; x += 70) L.push({ x, y: 30, r: 64, a: 0.9, tint: 'rgba(220,232,255,0.05)' });
    L.push({ x: 245, y: 72, r: 30, a: 0.7, tint: 'rgba(255,200,120,0.12)' });
    L.push({ x: 245, y: 44, r: 20, a: 0.9 });
    L.push({ x: hero.x, y: hero.y - 26, r: 26, a: 0.4 });
    if (Game.chapter === 5 && FP().bbqAcceso) L.push({ x: BBQ_POS.x, y: BBQ_POS.y - 26, r: 70 * (0.9 + Math.random() * 0.1), a: 0.9, tint: 'rgba(255,120,40,0.2)' });
    return L;
  },
  objects() {
    const list = [];
    for (const px of PO_POSTS) list.push({ y: 300, draw: g => g.drawImage(porticoPostCanvas(), px - 13, 0) });
    list.push({ y: 141, draw: g => g.drawImage(kegsCanvas(), 44, 119) });
    list.push({ y: 141.5, draw: g => g.drawImage(plasticChairCanvas(), 80, 105) });
    list.push({ y: 140.5, draw: g => g.drawImage(frontTableCanvas(), 286, 102) });
    if (Game.chapter === 9) {
      if (!FP().briocheMangiata) list.push({ y: 140.6, draw: g => g.drawImage(brioscheCanvas(), 305, 104) });
      if (!hasItem('bagagli') && !FP().autoCaricata) list.push({ y: 127, draw: g => g.drawImage(bagagliCanvas(), 194, 112) });
    }
    if (Game.chapter === 5) {
      const f = FP();
      if (!f.bbqMontato) list.push({ y: 111, draw: g => g.drawImage(bbqFoldedCanvas(), 359, 94) });
      else list.push({ y: BBQ_POS.y, draw: g => g.drawImage(bbqCanvas(f.costineSu ? 3 : f.musica ? 2 : f.bbqAcceso ? 2 : f.carbonellaMessa ? 1 : 0), BBQ_POS.x - 15, BBQ_POS.y - 33) });
      if (!hasItem('guinness') && !f.guinnessFinita) list.push({ y: 139.5, draw: g => g.drawImage(guinnessCanvas(), 370, 130) });
      if (f.musica) list.push({ y: 112, draw: g => { g.fillStyle = '#1e1e22'; g.fillRect(124, 82, 8, 6); g.fillStyle = '#3a8aff'; g.fillRect(126, 84, 4, 2); } });
    }
    return list;
  },
  itemVerbs: { guinness: { usa: () => beviGuinness() } },
  update(dt) {
    if (Game.chapter !== 5) return;
    const f = FP();
    if (f.bbqAcceso && Math.random() < dt * 6) addParticle({ x: BBQ_POS.x - 8 + Math.random() * 16, y: BBQ_POS.y - 26, vx: 2 + Math.random() * 4, vy: -10 - Math.random() * 6, life: 2.4, c: Math.random() < 0.5 ? '#8a8a8a' : '#6a6a6a', fade: true });
    if (f.musica && Math.random() < dt * 1.5) addParticle({ x: 128, y: 80, vx: (Math.random() - 0.5) * 8, vy: -8, life: 1.8, c: pick(['#ffe080', '#9fe3d8', '#ff9ab0']), w: 2, h: 2, fade: true });
  },
  hotspots: [],
};
ROOMS.portico = ROOM_PORTICO;

ROOM_PORTICO.hotspots = [
  { id: 'muroPortico', name: 'Muro', rects: [[0, 40, 452, 70]], hint: false,
    verbs: { guarda: () => say(hero, "Intonaco grosso, bianco. Se ti appoggi, ti grattugi la schiena.") } },
  { id: 'pavimentoPortico', name: 'Acciottolato', rects: [[0, 110, 454, 34]], hint: false,
    verbs: { guarda: () => say(hero, 'Sassi tondi del torrente, posati a mano uno per uno. Ogni sasso, un mal di schiena.') } },
  { id: 'balcone', name: 'Balcone', rects: [[0, 0, 450, 20]],
    verbs: {
      guarda: () => say(hero, 'Il balcone del primo piano, con le coperte stese ad arieggiare. Speriamo non siano quelle delle cimici.'),
      raccogli: () => say(hero, 'Non ci arrivo. E comunque non voglio sapere da quale letto vengono.'),
    } },
  { id: 'lucine', name: 'Strisce LED', rects: [[18, 24, 430, 14]],
    verbs: {
      guarda: () => say(hero, isNight() ? 'Le strisce LED sono accese. Il portico sembra una discoteca per montanari.' : 'Strisce LED sotto le travi. Di sera il portico sembra una discoteca per montanari.'),
      usa: () => say(hero, "L'interruttore è dentro. E nessuno sa quale sia: ce ne sono undici."),
    } },
  { id: 'pilastri', name: 'Pilastro', rects: PO_POSTS.map(px => [px - 1, 32, 9, 106]), hint: false,
    verbs: {
      guarda: () => say(hero, 'Pilastri di larice. Reggono il balcone, le coperte e le speranze.'),
      spingi: () => say(hero, 'Spingo un pilastro che regge un balcone. Sì, è proprio una pessima idea.'),
    } },
  { id: 'scaffale', name: 'Scaffale', rects: [[16, 54, 42, 56]], walk: [38, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "Cassette, vasi vuoti, bottiglie e un corno di ceramica. Nessuno sa a cosa serva il corno. Nessuno ha il coraggio di buttarlo."),
      raccogli: () => say(hero, 'Il corno resta qui. Ho paura che sia di qualcuno.'),
    } },
  { id: 'gabbia', name: 'Gabbia per uccelli', rects: [[26, 42, 26, 24]], walk: [38, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Una vecchia gabbia per uccelli. Dentro, al posto del canarino, ci sono le piante grasse. Più facili da nutrire.'),
      apri: () => say(hero, "Non c'è niente da liberare. Le piante grasse non scappano."),
      raccogli: () => say(hero, "È appesa troppo in alto. E poi le piante grasse pungono."),
    } },
  { id: 'tavolino', name: 'Tavolino', rects: [[58, 70, 92, 42]], walk: [104, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "Il tavolino con la tovaglia a fiori gialli. Ci sono ancora le birre di ieri sera. O dell'anno scorso."),
      raccogli: () => say(hero, 'Birra calda di ieri? Neanche Luciano.'),
      usa: () => say(hero, 'Mi siederei, ma la sedia impagliata ha più buchi che paglia.'),
    } },
  { id: 'scuri', name: 'Finestra', rects: [[150, 54, 30, 42], [354, 56, 28, 40]], walk: () => hero.x < 300 ? [165, 118] : [368, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Gli scuri sono chiusi. La baita dorme, anche se io no.'),
      apri: () => say(hero, 'Sono chiusi da dentro. Come metà delle cose qui.'),
    } },
  { id: 'borsa', name: 'Borsa blu', rects: [[186, 54, 30, 38]], walk: [200, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, "Una borsa della spesa blu appesa al gancio. Dentro: un'altra borsa della spesa. È una matrioska di borse."),
      raccogli: () => say(hero, "La lascio lì. È l'archivio ufficiale delle borse della baita."),
      apri: () => say(hero, 'Dentro ci sono altre tre borse. E uno scontrino del 2016.'),
    } },
  { id: 'mobiletti', name: 'Mobiletti', rects: [[272, 54, 76, 56]], walk: [312, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'La cucina da esterno: mobiletti, un bollitore e una scatola gialla. Il quartier generale delle grigliate.'),
      apri: async () => {
        const f = Game.flags;
        if (Game.chapter === 5 && !hasItem('carbonella') && !f.carbonellaMessa) {
          hero.pose = 'reach'; SFX.creak(); await wait(400); hero.pose = 'stand';
          giveItem('carbonella');
          return say(hero, 'Il sacco di carbonella! Pesa come un ghiro ben nutrito.');
        }
        if (Game.chapter === 2 && !hasItem('cacciavite') && !f.ventolaAperta) {
          hero.pose = 'reach'; SFX.creak(); await wait(400); hero.pose = 'stand';
          giveItem('cacciavite');
          await say(hero, 'Carbonella, piatti di plastica... e la cassetta degli attrezzi! Prendo il cacciavite.');
          return addScore('cacciavite', 15);
        }
        return say(hero, 'Piatti di plastica, carbonella, tovaglioli... e un ragno che mi guarda male. Richiudo.');
      },
      chiudi: () => say(hero, 'Sono già chiusi. Il ragno ringrazia.'),
    } },
  { id: 'presa', name: 'Presa elettrica', rects: [[380, 84, 14, 14]], walk: [388, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Una presa esterna. Qui si attaccano frigoriferi, casse e, una volta, una macchina del fumo.'),
      usa: () => say(hero, 'Non ho niente da attaccare. Il mio telefono ha già la tacca della disperazione.'),
    },
    use: { telefono: () => say(hero, 'Ho dimenticato il caricatore. Come sempre. Come tutti.') } },
  { id: 'bidone', name: 'Bidone', rects: [[398, 56, 38, 54]], walk: [418, 118], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il bidone della differenziata. Più lattine che rifiuti. Le lattine raccontano la serata meglio di chiunque.'),
      apri: () => say(hero, "È già aperto. Non ci entra più neanche una lattina."),
      chiudi: () => say(hero, 'Il coperchio non si chiude: troppe lattine. È un bidone soddisfatto.'),
      raccogli: () => say(hero, 'Il bidone resta qui. Le lattine anche.'),
    } },
  { id: 'paletto', name: 'Paletto bianco e rosso', rects: [[436, 80, 12, 30]], walk: [440, 118], face: 'up',
    verbs: { guarda: () => say(hero, 'Un paletto bianco e rosso sopra una cassetta gialla. Segnala qualcosa. Nessuno ricorda cosa.') } },
  { id: 'fusti', name: 'Fusti di birra', rects: [[44, 120, 30, 22]], walk: [58, 126], face: 'down',
    verbs: {
      guarda: () => say(hero, 'Due fusti di birra da cinque litri. Vuoti. Il che spiega le lattine nel bidone.'),
      raccogli: () => say(hero, 'Sono vuoti. Un fusto vuoto è solo una lattina molto triste.'),
      spingi: () => say(hero, 'Rotolano un po\'... e tornano indietro. Anche loro vogliono restare in baita.'),
    } },
  { id: 'sediaBianca', name: 'Sedia di plastica', rects: [[80, 106, 28, 36]], walk: [94, 126], face: 'down',
    verbs: {
      guarda: () => say(hero, "La classica sedia bianca di plastica. Sopra c'è un sacchetto di patatine. Vuoto anche lui. Qui c'è stata una battaglia."),
      usa: () => say(hero, 'Mi siedo... e la sedia fa CRAC. Mi rialzo con dignità.'),
      raccogli: () => say(hero, 'Il sacchetto di patatine è vuoto. Ci sono solo le briciole del dolore.'),
    } },
  { id: 'tavoloPortico', name: 'Tavolo', rects: [[286, 102, 68, 38]], walk: [320, 126], face: 'down',
    verbs: {
      guarda: () => say(hero, 'Il tavolo del portico: teglia, lattine, un boccale, lo spray per le mani e il rotolo rosso dei coltelli. Il kit del grigliatore.'),
      raccogli: () => say(hero, "Sono i coltelli di Luciano. Toccarli porta sette anni di sfortuna e una predica di tre ore."),
      usa: () => say(hero, 'Prima la legna, poi la brace, poi il tavolo. La catena alimentare della montagna.'),
    },
    use: { costine: () => say(hero, 'Le costine vanno sulla brace, non sul tavolo. Il tavolo è per dopo.') } },
  { id: 'lampadaPorta', name: 'Lampada', rects: [[236, 40, 18, 9]], hint: false,
    verbs: { guarda: () => say(hero, isNight() ? 'La lampada sopra la porta. Attira tutte le falene della valle.' : 'La lampada sopra la porta. Di sera attira tutte le falene della valle.') } },
  { id: 'portaSalone', name: 'Porta del salone', rects: [[226, 50, 38, 60]], walk: [245, 116], face: 'up', exit: true,
    verbs: {
      guarda: () => say(hero, "La porta d'ingresso, con i vetri stretti. Di là c'è il salone."),
      vai: () => goToRoom(ROOMS.salone, 28, 120, 'down'),
      apri: () => goToRoom(ROOMS.salone, 28, 120, 'down'),
    } },
  { id: 'bbq', name: 'Barbecue', rects: () => FP().bbqMontato ? [[BBQ_POS.x - 15, BBQ_POS.y - 34, 30, 34]] : [[357, 92, 22, 20]], show: () => Game.chapter === 5,
    walk: () => FP().bbqMontato ? [BBQ_POS.x + 18, BBQ_POS.y - 4] : [368, 118], face: null,
    verbs: {
      guarda: () => say(hero, !FP().bbqMontato ? 'Il barbecue a carbonella, piegato contro il muro. Aspetta solo me.' : FP().costineSu ? 'Le costine sfrigolano. È la colonna sonora più bella.' : FP().bbqAcceso ? 'La carbonella fuma.' : 'Il barbecue montato, pronto.'),
      usa: () => FP().bbqMontato ? (FP().carbonellaMessa ? say(hero, hasItem('accendino') ? 'Lo accendo con l\'accendino.' : 'Per accenderlo mi serve un accendino. Zac ne ha sempre uno.') : say(hero, 'Prima ci vuole la carbonella.')) : montaBbq(),
      apri: () => FP().bbqMontato ? say(hero, 'È già aperto.') : montaBbq(),
      raccogli: () => FP().bbqMontato ? say(hero, 'Ora che è montato non lo sposto più. Neanche col terremoto.') : montaBbq(),
    },
    use: { carbonella: () => carbonellaBbq(), accendino: () => accendiBbq(), costine: () => costineBbq(), guinness: () => say(hero, 'La Guinness sul barbecue? Sacrilegio.'), '*': () => say(hero, 'Sul barbecue vanno carbonella e costine. Il resto no.') } },
  { id: 'cassaGuinness', name: 'Cassa di Guinness', rects: [[368, 128, 20, 12]], walk: [378, 136], face: 'down', def: 'raccogli', show: () => Game.chapter === 5 && !hasItem('guinness') && !FP().guinnessFinita,
    verbs: {
      guarda: () => say(hero, 'Una cassa di Guinness. Ventiquattro lattine di felicità scura.'),
      raccogli: async () => { hero.pose = 'reach'; await wait(350); hero.pose = 'stand'; giveItem('guinness'); await say(hero, 'La cassa è mia. Cioè nostra. Cioè mia.'); },
    } },
  { id: 'brioche', name: 'Brioche', rects: [[303, 102, 34, 12]], walk: [320, 128], face: 'down', def: 'raccogli', show: () => Game.chapter === 9 && !FP().briocheMangiata,
    verbs: {
      guarda: () => say(hero, 'Un vassoio di brioche alla crema, portate da Jackal. Zucchero a velo dappertutto.'),
      raccogli: () => mangiaBrioche(), usa: () => mangiaBrioche(),
    } },
  { id: 'bagagli', name: 'Bagagli', rects: [[192, 110, 30, 18]], walk: [206, 128], face: 'up', def: 'raccogli', show: () => Game.chapter === 9 && !hasItem('bagagli') && !FP().autoCaricata,
    verbs: {
      guarda: () => say(hero, 'La montagna di bagagli: zaini, borsoni, sacchi a pelo. Più di quando siamo arrivati. Non si sa come.'),
      raccogli: () => prendiBagagli(),
    } },
  { id: 'versoDependance', name: 'Verso la dépendance', rects: [[0, 40, 14, 100]], walk: [18, 122], face: 'left', exit: true,
    verbs: { vai: () => goToRoom(ROOMS.dependance, 50, 126, 'right') } },
  { id: 'versoParcheggio', name: 'Verso il parcheggio', rects: [[454, 30, 26, 114]], walk: [472, 128], face: 'right', exit: true,
    verbs: { vai: () => goToRoom(ROOMS.parcheggio, 48, 128, 'right') } },
];
