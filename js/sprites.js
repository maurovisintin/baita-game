'use strict';
/* =========================================================
   SPRITE: protagonista (colbacco + felpa BRUM), Gino, gazza
   Tutto disegnato proceduralmente pixel per pixel.
   ========================================================= */

/* ---------------- PROTAGONISTA ---------------- */
const HP = {
  furD: '#4e4236', fur: '#857560', furM: '#9c8b72', furL: '#b9a888', furH: '#dcd0b6',
  skin: '#e9b391', skinS: '#c98d6e', skinD: '#a46a52',
  beard: '#6b4a31', beardD: '#4a321f', beardL: '#8a6646',
  lips: '#d97a86', mouth: '#5a1e26', eye: '#2c3c56', brow: '#4f3421',
  hood: '#25252d', hoodD: '#14141a', hoodL: '#3a3a45', hoodH: '#50505d',
  str: '#a8a8a8', strT: '#e0e0e0', yel: '#f2e01c',
  jeans: '#3b5179', jeansD: '#2a3a59', jeansL: '#4f6795',
  boot: '#4a3020', bootD: '#26180e',
  hel: '#f07414', helD: '#b84a0c', helL: '#ffa050', mesh: '#a8aeb4', meshD: '#5a6066', muff: '#1e1e1e',
  sawO: '#ee6c12', sawOD: '#a8460a', sawOL: '#ffa060', sawB: '#c0c4c8', sawBD: '#70747a', sawK: '#1c1c1c',
};
function furAt(x, y) { const h = hash2(x, y, 7); return h < 0.10 ? HP.furH : h < 0.32 ? HP.furL : h < 0.55 ? HP.furM : h < 0.82 ? HP.fur : HP.furD; }
function brimAt(x, y) { const h = hash2(x, y, 11); return h < 0.3 ? HP.furH : h < 0.75 ? HP.furL : HP.furM; }

const LOGO = { // "BRUM" 3x5
  B: ['110', '101', '110', '101', '110'],
  R: ['110', '101', '110', '101', '101'],
  U: ['101', '101', '101', '101', '111'],
  M: ['101', '111', '111', '101', '101'],
};

const HERO_W = 72, HERO_H = 66, HERO_CX = 26, HERO_TOP = 6; // riga 0 = cima colbacco; piedi a riga 53
const HERO_OY = HERO_TOP + 54; // origine (pixel sotto i piedi)

function buildHero(o) {
  const b = new Buf(HERO_W, HERO_H);
  const R = (x, y, w, h, c) => b.rect(HERO_CX + x, HERO_TOP + y, w, h, c);
  const S = (x, y, c) => b.set(HERO_CX + x, HERO_TOP + y, c);
  const T = (x0, y0, x1, y1, w, c) => b.thick(HERO_CX + x0, HERO_TOP + y0, HERO_CX + x1, HERO_TOP + y1, w, c);
  const ctx = { R, S, T, o };
  if (o.view === 'side') heroSide(ctx); else heroFrontBack(ctx);
  return b.canvas();
}

function helmetFront(R, S, hy) {
  for (let r = -4; r <= 4; r++) {
    const hw = r === -4 ? 4 : r === -3 ? 6 : r === -2 ? 7 : 8;
    R(-hw, r + hy, hw * 2 + 1, 1, HP.hel);
  }
  R(-3, -3 + hy, 4, 1, HP.helL); R(-5, -2 + hy, 2, 2, HP.helL);
  R(-10, 5 + hy, 21, 1, HP.helD);
  // visiera a rete
  for (let y = 6; y <= 9; y++) for (let x = -7; x <= 7; x++) if ((x + y) & 1) S(x, y + hy, HP.mesh); else if (y === 6) S(x, y + hy, HP.meshD);
  // cuffie
  for (const sx of [-12, 10]) { R(sx, 9 + hy, 3, 6, HP.hel); R(sx + (sx < 0 ? 2 : 0), 10 + hy, 1, 4, HP.muff); }
  R(-11, 5 + hy, 1, 4, HP.helD); R(11, 5 + hy, 1, 4, HP.helD);
}
function helmetSide(R, S, hy) {
  for (let r = -4; r <= 4; r++) {
    const a = r === -4 ? -3 : r === -3 ? -5 : -7, z = r === -4 ? 2 : r === -3 ? 4 : 6;
    R(a, r + hy, z - a + 1, 1, HP.hel);
  }
  R(-1, -3 + hy, 4, 1, HP.helL); R(2, -2 + hy, 3, 1, HP.helL);
  R(-8, 5 + hy, 18, 1, HP.helD);
  for (let y = 6; y <= 13; y++) for (let x = 6; x <= 9; x++) if ((x + y) & 1) S(x, y + hy, HP.mesh);
  R(6, 6 + hy, 4, 1, HP.meshD);
  R(-4, 9 + hy, 4, 5, HP.hel); R(-3, 10 + hy, 2, 3, HP.muff);
  R(-3, 5 + hy, 1, 4, HP.helD);
}

function heroFrontBack({ R, S, o }) {
  const back = o.view === 'back';
  const climb = o.pose === 'climb';
  let liftL = 0, liftR = 0, B = 0, aL = 0, aR = 0;
  if (o.phase != null) {
    const s = Math.sin(o.phase * Math.PI * 2);
    if (climb) { liftL = s > 0 ? Math.round(s * 4) : 0; liftR = s < 0 ? Math.round(-s * 4) : 0; }
    else {
      liftL = s > 0.35 ? (s > 0.8 ? 2 : 1) : 0;
      liftR = s < -0.35 ? (s < -0.8 ? 2 : 1) : 0;
      B = (liftL || liftR) ? -1 : 0;
      aL = Math.round(s * 1.6); aR = -aL;
    }
  }
  // gambe
  const leg = (x0, lift, left) => {
    const bot = 49 - lift;
    R(x0, 37 + B, 6, bot - 37 - B + 1, HP.jeans);
    R(left ? x0 : x0 + 5, 38 + B, 1, bot - 38 - B + 1, HP.jeansD);
    R(left ? x0 + 3 : x0 + 2, 40 + B, 1, bot - 42 - B, HP.jeansL);
    R(x0, bot, 6, 1, HP.jeansD);
    R(x0 - 1, bot + 1, 8, 3, HP.boot);
    R(x0 - 1, bot + 1, 8, 1, '#5e3e28');
    R(x0 - 1, bot + 4, 8, 1, HP.bootD);
  };
  leg(-7, liftL, true); leg(2, liftR, false);
  R(-2, 37 + B, 4, 3, HP.jeans); S(0, 39 + B, HP.jeansD);

  // busto
  R(-7, 20 + B, 15, 1, HP.hood);
  R(-8, 21 + B, 17, 15, HP.hood);
  R(-8, 36 + B, 17, 1, HP.hoodD);
  R(-8, 22 + B, 1, 14, HP.hoodD); R(8, 22 + B, 1, 14, HP.hoodD);
  R(6, 22 + B, 1, 12, HP.hoodL);
  if (!back) {
    R(-2, 21 + B, 1, 3, HP.str); R(2, 21 + B, 1, 3, HP.str);
    S(-2, 24 + B, HP.strT); S(2, 24 + B, HP.strT);
    let lx = -7;
    for (const ch of 'BRUM') {
      LOGO[ch].forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '1') S(lx + i, 26 + j + B, HP.yel); });
      lx += 4;
    }
    R(-5, 32 + B, 11, 1, HP.hoodD); S(-6, 33 + B, HP.hoodD); S(6, 33 + B, HP.hoodD);
    R(-6, 34 + B, 1, 2, HP.hoodD); R(6, 34 + B, 1, 2, HP.hoodD);
  } else {
    R(-5, 20 + B, 11, 8, HP.hoodL); R(-4, 20 + B, 9, 7, HP.hood); R(-3, 28 + B, 7, 1, HP.hoodL);
    R(-1, 29 + B, 3, 1, HP.hoodD);
  }
  // braccia
  const arm = (x0, dy, left) => {
    if (climb) {
      const up = left ? liftR : liftL;
      const top = 3 + (up ? 0 : 3);
      R(x0, top + 3, 3, 21 + B - top - 3, HP.hood);
      R(left ? x0 : x0 + 2, top + 3, 1, 21 + B - top - 3, HP.hoodD);
      R(x0, top, 3, 3, HP.skin); S(left ? x0 : x0 + 2, top, HP.skinS);
      return;
    }
    R(x0, 21 + B, 3, 13 + dy, HP.hood);
    R(left ? x0 : x0 + 2, 22 + B, 1, 12 + dy, HP.hoodD);
    R(left ? x0 + 1 : x0 + 1, 23 + B, 1, 9 + dy, HP.hoodL);
    R(x0, 33 + B + dy, 3, 1, HP.hoodD);
    R(x0, 34 + B + dy, 3, 3, HP.skin); S(left ? x0 : x0 + 2, 36 + B + dy, HP.skinS);
  };
  arm(-11, aL, true); arm(9, aR, false);

  // testa
  const hy = B;
  // paraorecchie (alette del colbacco)
  for (let y = 8; y <= 19; y++) {
    const w = y <= 15 ? 4 : y <= 17 ? 3 : 2;
    for (let i = 0; i < w; i++) {
      S(-9 + i + (4 - w) * 0, y + hy, furAt(-9 + i, y));
      S(9 - i, y + hy, furAt(9 - i, y));
    }
    if (!back) { S(-6, y + hy, y <= 15 ? HP.furD : null); S(6, y + hy, y <= 15 ? HP.furD : null); }
  }
  S(8, 19 + hy, '#c8c8c8'); // gancetto
  if (!back) {
    R(-5, 8 + hy, 11, 8, HP.skin);
    R(-5, 8 + hy, 11, 1, HP.skinS);
    R(-5, 9 + hy, 1, 6, HP.skinS);
    R(-4, 10 + hy, 3, 1, HP.brow); R(2, 10 + hy, 3, 1, HP.brow);
    if (o.blink) { R(-4, 11 + hy, 3, 1, HP.skinS); R(2, 11 + hy, 3, 1, HP.skinS); }
    else { S(-3, 11 + hy, HP.eye); S(3, 11 + hy, HP.eye); S(-4, 11 + hy, '#f4e8dc'); S(4, 11 + hy, '#f4e8dc'); }
    S(0, 12 + hy, HP.skinS); S(0, 13 + hy, HP.skinD); S(1, 13 + hy, HP.skinS);
    R(-5, 12 + hy, 1, 4, HP.beard); R(5, 12 + hy, 1, 4, HP.beard);
    R(-4, 14 + hy, 2, 2, HP.beardL); R(3, 14 + hy, 2, 2, HP.beardL);
    R(-2, 14 + hy, 5, 1, HP.beard);
    R(-5, 16 + hy, 11, 2, HP.beard); R(-4, 18 + hy, 9, 1, HP.beard); R(-2, 19 + hy, 5, 1, HP.beardD);
    for (let y = 16; y <= 18; y++) for (let x = -5; x <= 5; x++) { const h = hash2(x, y, 3); if (h < 0.2) S(x, y + hy, HP.beardL); else if (h > 0.85) S(x, y + hy, HP.beardD); }
    if (o.talk) { R(-1, 15 + hy, 3, 1, HP.mouth); R(-1, 16 + hy, 3, 1, HP.lips); }
    else R(-1, 15 + hy, 3, 1, HP.lips);
    // collo felpa
    R(-8, 19 + hy, 3, 2, HP.hoodL); R(6, 19 + hy, 3, 2, HP.hoodL);
  } else {
    for (let y = 6; y <= 15; y++) for (let x = -8; x <= 8; x++) S(x, y + hy, furAt(x, y));
    R(-8, 15 + hy, 17, 1, HP.furD);
    R(-6, 16 + hy, 13, 4, HP.hoodL); R(-5, 17 + hy, 11, 2, HP.hood);
  }
  if (o.helmet) { helmetFront(R, S, hy); return; }
  // calotta
  const dome = [[-4, 4], [-6, 6], [-7, 7], [-8, 8], [-8, 8], [-9, 9]];
  dome.forEach(([x0, x1], r) => {
    for (let x = x0; x <= x1; x++) S(x, r + hy, furAt(x, r));
    S(x0, r + hy, HP.furD); S(x1, r + hy, HP.furD);
  });
  if (!back) {
    for (let r = 5; r <= 8; r++) for (let x = -9; x <= 9; x++) S(x, r + hy, brimAt(x, r));
    R(-8, 8 + hy, 1, 1, HP.furM); S(-9, 8 + hy, null);
    for (let x = -9; x <= 9; x++) if (hash2(x, 9, 5) < 0.3) S(x, 9 + hy, HP.furL);
  } else {
    for (let r = 5; r <= 7; r++) for (let x = -9; x <= 9; x++) S(x, r + hy, furAt(x, r));
  }
}

function drawSawAt(R, S, x0, y0, run, ph) {
  // impugnatura posteriore
  R(x0 - 3, y0 + 1, 3, 1, HP.sawK); R(x0 - 3, y0 + 5, 3, 1, HP.sawK); R(x0 - 3, y0 + 1, 1, 5, HP.sawK);
  // corpo
  R(x0, y0, 10, 7, HP.sawO); R(x0, y0 + 6, 10, 1, HP.sawOD); R(x0 + 1, y0 + 1, 5, 1, HP.sawOL);
  R(x0 + 6, y0 + 2, 3, 2, '#2a2a2a');
  // maniglia anteriore
  R(x0 + 3, y0 - 3, 6, 1, HP.sawK); S(x0 + 3, y0 - 2, HP.sawK); S(x0 + 8, y0 - 2, HP.sawK); S(x0 + 8, y0 - 1, HP.sawK);
  // barra
  R(x0 + 10, y0 + 2, 17, 3, HP.sawB); R(x0 + 10, y0 + 4, 17, 1, HP.sawBD); S(x0 + 27, y0 + 3, HP.sawB);
  for (let i = 0; i < 17; i += 2) {
    const k = run ? (ph & 1) : 0;
    S(x0 + 10 + i + k, y0 + 1, HP.sawK); S(x0 + 10 + i + (1 - k), y0 + 5, HP.sawK);
  }
}

function heroSide({ R, S, T, o }) {
  const walking = o.pose === 'walk' && o.phase != null;
  const ph = walking ? o.phase * Math.PI * 2 : 0;
  const legInfo = phi => {
    if (!walking) return { fx: 0, lift: 0 };
    const s = Math.sin(phi);
    return { fx: Math.round(5 * Math.cos(phi)), lift: s < 0 ? Math.round(-3 * s) : 0 };
  };
  const near = legInfo(ph), far = legInfo(ph + Math.PI);
  if (!walking) { near.fx = 1; far.fx = -2; }
  if (o.pose === 'saw') { near.fx = 3; far.fx = -3; }
  const B = walking && Math.abs(Math.cos(ph)) < 0.45 ? -1 : 0;
  const sw = walking ? -Math.cos(ph) : 0;
  const run = o.sawRun, vib = run ? (o.vib || 0) : 0;

  const drawArm = (s, isFar, hand) => {
    const sx = isFar ? -1 : 0, sy = 22 + B;
    let hx, hy, ex, ey;
    if (hand) { hx = hand[0]; hy = hand[1]; ex = Math.round((sx + hx) / 2 - 1); ey = Math.round((sy + hy) / 2 + 2); }
    else { hx = Math.round(sx + s * 4); hy = 34 + B; ex = Math.round(sx + s * 2); ey = 28 + B; }
    const c = isFar ? HP.hoodD : HP.hoodL;
    T(sx, sy, ex, ey, 3, c); T(ex, ey, hx, hy - 1, 3, c);
    if (!isFar) { T(sx, sy - 1, ex, ey - 1, 1, HP.hoodH); }
    R(hx - 1, hy, 3, 3, isFar ? HP.skinS : HP.skin);
  };
  const drawLeg = (L, isFar) => {
    const hipX = isFar ? -1 : 1, hipY = 39 + B;
    const ay = 50 - L.lift;
    const kx = Math.round((hipX + L.fx) / 2 + (L.lift > 0 ? 2 : 1)), ky = 45 - (L.lift > 0 ? 1 : 0);
    const c = isFar ? HP.jeansD : HP.jeans;
    T(hipX, hipY, kx, ky, 5, c);
    T(kx, ky, L.fx, ay - 1, 4, c);
    if (!isFar) T(kx - 2, ky + 1, L.fx - 2, ay - 1, 1, HP.jeansD);
    const bc = isFar ? '#3a2416' : HP.boot;
    R(L.fx - 2, ay + 1, 6, 2, bc); R(L.fx - 2, ay + 3, 7, 1, HP.bootD); S(L.fx + 4, ay + 2, bc);
  };

  const handNear = o.pose === 'reach' ? [9, 27 + B] : o.pose === 'saw' ? [7, 31 + B + vib] : null;
  const handFar = o.pose === 'saw' ? [9, 27 + B + vib] : null;

  drawArm(-sw, true, handFar);
  drawLeg(far, true);
  // busto
  R(-3, 20 + B, 7, 1, HP.hood);
  R(-5, 21 + B, 10, 15, HP.hood);
  R(-5, 36 + B, 10, 1, HP.hoodD);
  R(-5, 22 + B, 1, 14, HP.hoodD);
  R(4, 22 + B, 1, 12, HP.hoodL);
  R(5, 30 + B, 1, 5, HP.hood);
  R(4, 26 + B, 1, 4, '#b8a818');
  R(-6, 17 + B, 5, 4, HP.hood); R(-6, 17 + B, 5, 1, HP.hoodL);
  drawLeg(near, false);
  if (o.pose === 'saw') drawSawAt(R, S, 7, 27 + B + vib, run, o.sawPh || 0);
  drawArm(sw, false, handNear);

  // testa
  const hy = B;
  for (let y = 7; y <= 12; y++) for (let x = -8; x <= -5; x++) S(x, y + hy, furAt(x, y));
  R(0, 9 + hy, 7, 6, HP.skin);
  R(0, 9 + hy, 7, 1, HP.skinS);
  S(7, 11 + hy, HP.skin); S(7, 12 + hy, HP.skinS); S(6, 13 + hy, HP.skinS);
  R(3, 10 + hy, 3, 1, HP.brow);
  if (!o.blink) { S(4, 11 + hy, HP.eye); S(5, 11 + hy, '#f4e8dc'); } else R(4, 11 + hy, 2, 1, HP.skinS);
  R(-1, 13 + hy, 2, 3, HP.beard);
  R(1, 14 + hy, 3, 2, HP.beardL);
  R(4, 14 + hy, 3, 1, HP.beard);
  if (o.talk) { R(5, 15 + hy, 2, 1, HP.mouth); S(6, 16 + hy, HP.lips); } else R(5, 15 + hy, 2, 1, HP.lips);
  R(-1, 16 + hy, 7, 2, HP.beard); if (o.talk) S(6, 16 + hy, HP.lips);
  R(0, 18 + hy, 5, 1, HP.beard); R(1, 19 + hy, 3, 1, HP.beardD);
  for (let y = 16; y <= 18; y++) for (let x = -1; x <= 5; x++) { const h = hash2(x, y, 9); if (h < 0.2) S(x, y + hy, HP.beardL); }
  // aletta laterale
  for (let y = 8; y <= 18; y++) {
    const w = y < 16 ? 5 : y < 18 ? 4 : 3;
    for (let i = 0; i < w; i++) S(-4 + i, y + hy, furAt(-4 + i, y + 50));
    if (y < 16) S(0, y + hy, HP.furD);
  }
  if (o.helmet) { helmetSide(R, S, hy); return; }
  const dome = [[-3, 2], [-5, 4], [-6, 5], [-7, 6], [-7, 6], [-7, 6], [-7, 6], [-8, 5]];
  dome.forEach(([x0, x1], r) => { for (let x = x0; x <= x1; x++) S(x, r + hy, furAt(x, r + 30)); S(x0, r + hy, HP.furD); });
  for (let r = 4; r <= 8; r++) for (let x = 0; x <= 7 - (r === 4 ? 2 : 0); x++) S(x, r + hy, brimAt(x, r));
  S(7, 8 + hy, HP.furM);
}

/* ---------------- GINO (vicino di casa, seduto) ---------------- */
const GP = {
  cap: '#6a6252', capL: '#8a8270', capD: '#3e3a2c', hair: '#d8d8d2', hairD: '#a8a8a2',
  skin: '#dca282', skinS: '#b98062', nose: '#d0806a', must: '#efefef', mustD: '#bdbdbd',
  glass: '#2e2e2e', lens: '#c8dce4', eye: '#1c1c1c',
  sh1: '#b03a30', sh2: '#e8d8be', vest: '#3f5a37', vestD: '#2a3f25', vestL: '#56764a', btn: '#d8c890',
  pants: '#6a4c32', pantsD: '#4a3322', pantsL: '#84603f', shoe: '#1a1816', shoeL: '#3c3834',
  chair: '#26262a', chairL: '#3e3e46', pipe: '#5a3a20', pipeD: '#36220f',
};
const GINO_W = 34, GINO_H = 46, GINO_CX = 17;
function buildGino(o) {
  const b = new Buf(GINO_W, GINO_H);
  const R = (x, y, w, h, c) => b.rect(GINO_CX + x, y, w, h, c);
  const S = (x, y, c) => b.set(GINO_CX + x, y, c);
  const check = (x, y) => (((x >> 1) + (y >> 1)) & 1) ? GP.sh1 : GP.sh2;
  // sedia (dietro)
  R(-11, 9, 2, 23, GP.chair); R(10, 9, 2, 23, GP.chair);
  R(-11, 10, 23, 2, GP.chair); R(-11, 10, 23, 1, GP.chairL); R(-11, 16, 23, 1, GP.chair);
  // gambe sedia
  R(-11, 32, 2, 13, GP.chair); R(10, 32, 2, 13, GP.chair);
  R(-9, 34, 1, 11, GP.chairL); R(9, 34, 1, 11, GP.chairL);
  R(-11, 30, 23, 2, GP.chair); R(-11, 30, 23, 1, GP.chairL);
  // busto
  for (let y = 16; y <= 30; y++) {
    const hw = y < 18 ? 7 : y < 24 ? 8 : 9;
    for (let x = -hw; x <= hw; x++) S(x, y, check(x + 20, y));
  }
  // gilet
  for (let y = 16; y <= 30; y++) {
    const hw = y < 18 ? 7 : y < 24 ? 8 : 9;
    const open = y < 20 ? 3 : y < 26 ? 2 : 1;
    for (let x = -hw; x <= -open; x++) S(x, y, x === -hw ? GP.vestD : GP.vest);
    for (let x = open; x <= hw; x++) S(x, y, x === hw ? GP.vestD : x === hw - 1 ? GP.vestL : GP.vest);
  }
  S(-2, 21, GP.btn); S(-2, 24, GP.btn); S(-1, 27, GP.btn);
  R(-9, 30, 19, 1, GP.vestD);
  // gambe (cosce verso di noi)
  R(-8, 31, 7, 4, GP.pants); R(1, 31, 7, 4, GP.pants);
  R(-8, 33, 7, 1, GP.pantsL); R(1, 33, 7, 1, GP.pantsL);
  R(-7, 35, 5, 7, GP.pantsD); R(2, 35, 5, 7, GP.pantsD);
  R(-6, 35, 2, 7, GP.pants); R(3, 35, 2, 7, GP.pants);
  R(-8, 42, 7, 3, GP.shoe); R(1, 42, 7, 3, GP.shoe); R(-7, 42, 3, 1, GP.shoeL); R(2, 42, 3, 1, GP.shoeL);
  // braccia
  for (const sx of [-1, 1]) {
    for (let y = 17; y <= 28; y++) {
      const x0 = sx < 0 ? -11 + (y > 24 ? 1 : 0) : 9 - (y > 24 ? 1 : 0);
      for (let i = 0; i < 3; i++) S(x0 + i, y, check(x0 + i + 20, y));
    }
    const hx = sx < 0 ? -9 : 6;
    R(hx, 29, 4, 3, GP.skin); R(hx, 31, 4, 1, GP.skinS);
  }
  // testa
  const ty = 0;
  R(-5, 5 + ty, 11, 11, GP.skin);
  R(-5, 5 + ty, 1, 11, GP.skinS); R(-4, 15 + ty, 9, 1, GP.skinS);
  R(-6, 8 + ty, 1, 3, GP.skinS); R(6, 8 + ty, 1, 3, GP.skin); // orecchie
  R(-6, 5 + ty, 2, 4, GP.hair); R(5, 5 + ty, 2, 4, GP.hair); S(-6, 8 + ty, GP.hairD);
  // occhiali
  const eyeOff = o.look || 0;
  for (const ex of [-4, 1]) {
    R(ex, 8 + ty, 4, 1, GP.glass); R(ex, 11 + ty, 4, 1, GP.glass); S(ex, 9 + ty, GP.glass); S(ex, 10 + ty, GP.glass); S(ex + 3, 9 + ty, GP.glass); S(ex + 3, 10 + ty, GP.glass);
    R(ex + 1, 9 + ty, 2, 2, GP.lens);
    if (o.blink) R(ex + 1, 10 + ty, 2, 1, GP.skinS);
    else S(ex + 1 + (eyeOff > 0 ? 1 : 0), 10 + ty, GP.eye);
  }
  S(0, 9 + ty, GP.glass);
  // naso
  R(-1, 10 + ty, 2, 3, GP.nose); S(1, 12 + ty, GP.skinS); S(-1, 12 + ty, '#e09080');
  // baffi
  R(-3, 13 + ty, 7, 1, GP.must); S(-3, 14 + ty, GP.mustD); S(3, 14 + ty, GP.mustD);
  if (o.talk) { R(-1, 14 + ty, 3, 1, '#4a1e1e'); }
  else R(-1, 14 + ty, 3, 1, GP.skinS);
  // pipa
  if (!o.talk) { R(2, 14 + ty, 4, 1, GP.pipe); R(5, 11 + ty, 3, 4, GP.pipeD); R(5, 11 + ty, 3, 1, '#7a5a3a'); }
  // coppola
  R(-6, 1 + ty, 13, 4, GP.cap);
  R(-5, 0 + ty, 11, 1, GP.cap);
  for (let y = 0; y <= 4; y++) for (let x = -6; x <= 6; x++) if (hash2(x, y, 21) < 0.3) S(x, y + ty, GP.capL);
  R(-7, 5 + ty, 15, 1, GP.capD); R(-6, 6 + ty, 13, 1, GP.capD);
  return b.canvas();
}

/* ---------------- GAZZA ---------------- */
const MAGPIE_PAL = { K: '#141418', W: '#f2f2ec', T: '#24456a', B: '#2e5a8a', b: '#3a3a3a', l: '#3a3a3a', e: '#e8e8e8' };
const MAGPIE_FRAMES = {
  perch: [
    '..KK..........',
    '.KeKK.........',
    'bKKKKK........',
    '..KKKKKK......',
    '..KWWWBKKTT...',
    '...WWWWKKKTTTT',
    '....WWKK....TT',
    '.....l.l......',
  ],
  perch2: [
    '..............',
    '..KK..........',
    '.KeKK.........',
    'bKKKKKK.......',
    '..KWWWBKKTTT..',
    '...WWWWKKKTTTT',
    '....WWKK......',
    '.....l.l......',
  ],
  fly1: [
    '.....WW.......',
    '....WKKW......',
    '..KKKKKK......',
    '.KeKKBKKKTTT..',
    'bKKKWWKKKTTTTT',
    '...WWWW.......',
    '..............',
    '..............',
  ],
  fly2: [
    '..............',
    '..............',
    '..KK..........',
    '.KeKKBKKKTTT..',
    'bKKKWWKKKTTTTT',
    '...WKKKW......',
    '....WKKW......',
    '.....WW.......',
  ],
};
function magpieCanvas(frame, flip) {
  return cached('mag|' + frame + '|' + flip, () => {
    const b = new Buf(14, 8);
    b.map(0, 0, MAGPIE_FRAMES[frame], MAGPIE_PAL, flip);
    return b.canvas();
  });
}
