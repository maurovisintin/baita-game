'use strict';
/* =========================================================
   I PERSONAGGI DELLA BAITA
   Kodo e gli amici, dalle foto: ognuno ha un "look" (capelli,
   barba, occhiali, vestiti) disegnato sullo stesso scheletro
   di Kodo, così cammina, raccoglie e usa la motosega uguale.
   ========================================================= */
const SKINS = {
  light: ['#e9b391', '#c98d6e', '#a46a52'],
  pale: ['#f0c8aa', '#d4a484', '#b07e62'],
  tan: ['#cf9670', '#ad7452', '#88563c'],
};
const PANTS = {
  jeans: ['#2a3a59', '#3b5179', '#4f6795'], black: ['#141418', '#202026', '#30303a'], navy: ['#141a2e', '#1e2640', '#2c3656'],
  grey: ['#26282a', '#363a3e', '#484c52'], olive: ['#26281e', '#34382a', '#44483a'], track: ['#141418', '#202026', '#30303a'],
};
const SHOES = { boot: ['#4a3020', '#26180e'], sneaker: ['#9a9ea4', '#5a5e64'], black: ['#26262a', '#0e0e10'] };

const LOOKS = {
  defi: { skin: 'light', hair: 'receding', hairC: ['#1e1a16', '#2e2822', '#4a4038'], beard: 'stubble', beardC: ['#3a322a', '#4e443a', '#6a5e52'],
    top: 'fleece', topC: ['#a8a8a0', '#cfcfc6', '#e6e6de', '#f6f6f0'], zip: '#1e1e1e', side: '#7a7e84', pants: 'jeans', shoes: 'sneaker' },
  ghiaccio: { skin: 'pale', hair: 'long', hairC: ['#140e0a', '#24180e', '#3a2a1e'], beard: 'long', beardC: ['#140e0a', '#24180e', '#5e5852'],
    top: 'sweater', topC: ['#3a0c12', '#56141e', '#6e1e2a', '#842a36'], pants: 'black', shoes: 'black', nosering: true },
  orka: { skin: 'light', hair: 'bald', hairC: ['#6a6660', '#8a8680', '#a8a49e'], beard: 'big', beardC: ['#7a7670', '#a8a49e', '#d4d0ca'],
    top: 'jacketOpen', topC: ['#123038', '#1c4450', '#285a68', '#36707e'], inner: ['#0e0e10', '#18181c'], print: 'textLines', pants: 'black', shoes: 'black', build: 'big' },
  sprus: { skin: 'tan', hair: 'hood', hairC: ['#140e0a', '#201610', '#30241a'], beard: 'stubble', beardC: ['#140e0a', '#201610', '#30241a'],
    top: 'hoodie', topC: ['#7a0c10', '#a8161a', '#c82822', '#e2443a'], pants: 'navy', shoes: 'sneaker' },
  iron: { skin: 'pale', hair: 'short', hairC: ['#6a6a66', '#8e8e8a', '#b4b4b0'], glasses: 'round',
    top: 'jacket', topC: ['#2e3238', '#3e434a', '#50565e', '#646a74'], zip: '#e8702a', collar: '#e8702a', pants: 'jeans', shoes: 'black' },
  zac: { skin: 'light', hair: 'ponytail', hairC: ['#3a2e24', '#5a4a3a', '#8a7e70'], glasses: 'rect', beard: 'stubble', beardC: ['#5a5048', '#7a7068', '#9a948c'],
    top: 'fleece', topC: ['#7a1a10', '#a8261a', '#cc3624', '#e8543a'], zip: '#3a0e0a', print: 'olympic', pants: 'track', shoes: 'black' },
  gus: { skin: 'light', hair: 'undercut', hairC: ['#140c08', '#24160e', '#3a2618'], beard: 'long', beardC: ['#140c08', '#24160e', '#3a2618'],
    top: 'tshirt', topC: ['#7a0a10', '#a8121a', '#c81c24', '#e03a40'], print: 'face', pants: 'jeans', shoes: 'black', build: 'big' },
  pepi: { skin: 'light', hair: 'short', hairC: ['#3a3028', '#5a4a3c', '#7a6a5a'], beard: 'short', beardC: ['#3a2e24', '#4e4034', '#7a6e64'],
    top: 'hoodie', topC: ['#0c1224', '#141c36', '#1e284a', '#2c385e'], print: 'super', strings: '#e8e8e8', sleeveStripes: '#e8e8e8', pants: 'jeans', shoes: 'sneaker' },
  lele: { skin: 'pale', hair: 'wavy', hairC: ['#5a4028', '#8a6a44', '#b08e62'], beard: 'short', beardC: ['#5a4028', '#7a5a3a', '#9a7a54'],
    top: 'fleece', topC: ['#101012', '#1c1c20', '#2e2e34', '#46464e'], zip: '#c8ec30', side: '#3e3e46', pants: 'black', shoes: 'sneaker' },
  menion: { skin: 'light', hair: 'short', hairC: ['#140e0a', '#241a12', '#3a2c20'], beard: 'stubble', beardC: ['#5a4030', '#6a5040', '#8a7060'],
    top: 'tshirt', topC: ['#0c0c0e', '#16161a', '#222228', '#2e2e36'], earring: true, pants: 'jeans', shoes: 'black' },
  jackal: { skin: 'light', hair: 'short', hairC: ['#3a2618', '#5a3e2a', '#7a5a40'], beard: 'short', beardC: ['#3a2a1e', '#5a4030', '#8a7060'],
    top: 'puffer', topC: ['#0c1224', '#141c34', '#1e2848', '#2a365e'], scarf: ['#3a3a3e', '#5a5a5e'], pants: 'black', shoes: 'black' },
  chino: { skin: 'light', hair: 'buzz', recede: true, hairC: ['#1e1a16', '#2e2822', '#4a4038'], beard: 'goatee', beardC: ['#3a322a', '#4e443a', '#6a5e52'],
    top: 'parka', topC: ['#4a4a3a', '#5e5d4a', '#75735c', '#8c8a70'], inner: ['#141416', '#222226'], scarf: ['#0e0e10', '#26262a'], pants: 'black', shoes: 'black', stein: true },
  biz: { skin: 'light', hair: 'bald', hairC: ['#140c08', '#24160e', '#3a2618'], glasses: 'rect', beard: 'short', beardC: ['#140c08', '#24160e', '#3a2618'],
    top: 'hoodie', topC: ['#0c0c0e', '#16161a', '#222228', '#30303a'], print: 'flag', pants: 'jeans', shoes: 'black' },
  latenar: { skin: 'light', hair: 'ponytail', hairC: ['#3a2e24', '#5a4a3a', '#8a7e70'], glasses: 'rect', beard: 'stubble', beardC: ['#5a5048', '#7a7068', '#9a948c'],
    top: 'fleece', topC: ['#323c38', '#43504a', '#55625c', '#6a7870'], zip: '#14181a', pants: 'black', shoes: 'black' },
};

function lookPal(L) {
  const sk = SKINS[L.skin || 'light'], pa = PANTS[L.pants || 'jeans'], sh = SHOES[L.shoes || 'black'];
  const hc = L.hairC || ['#2a1e16', '#3a2c20', '#5a4634'], bc = L.beardC || hc;
  return {
    skin: sk[0], skinS: sk[1], skinD: sk[2],
    top: L.topC[1], topD: L.topC[0], topL: L.topC[2], topH: L.topC[3],
    pant: pa[1], pantD: pa[0], pantL: pa[2], shoe: sh[0], shoeD: sh[1],
    hair: hc[1], hairD: hc[0], hairL: hc[2], beard: bc[1], beardD: bc[0], beardL: bc[2],
    eye: '#2c3c56', brow: hc[0], lips: '#c27870', mouth: '#5a1e26',
  };
}

function buildPerson(L, o) {
  const b = new Buf(HERO_W, HERO_H);
  const R = (x, y, w, h, c) => b.rect(HERO_CX + x, HERO_TOP + y, w, h, c);
  const S = (x, y, c) => b.set(HERO_CX + x, HERO_TOP + y, c);
  const T = (x0, y0, x1, y1, w, c) => b.thick(HERO_CX + x0, HERO_TOP + y0, HERO_CX + x1, HERO_TOP + y1, w, c);
  const c = { R, S, T, o, L, P: lookPal(L) };
  if (o.view === 'side' && o.pose !== 'sit') personSide(c); else personFront(c);
  return b.canvas();
}

/* ---------- di fronte (e di spalle) ---------- */
function personFront(c) {
  const { R, S, o, P, L } = c;
  const back = o.view === 'back', sit = o.pose === 'sit';
  const w = L.build === 'big' ? 1 : 0;
  let liftL = 0, liftR = 0, B = sit ? 5 : 0, aL = 0, aR = 0;
  if (o.phase != null && !sit) {
    const s = Math.sin(o.phase * Math.PI * 2);
    liftL = s > 0.35 ? (s > 0.8 ? 2 : 1) : 0; liftR = s < -0.35 ? (s < -0.8 ? 2 : 1) : 0;
    B = (liftL || liftR) ? -1 : 0; aL = Math.round(s * 1.6); aR = -aL;
  }
  // gambe
  if (sit && back) {
    // di spalle: il sedere sulla panca, le gambe sono davanti e non si vedono
    R(-8, 41, 16, 4, P.pant); R(-8, 41, 16, 1, P.pantL); R(-8, 44, 16, 1, P.pantD); R(-1, 42, 1, 3, P.pantD);
  } else if (sit) {
    for (const x0 of [-8, 1]) {
      R(x0, 42, 7, 3, P.pantL); R(x0, 45, 7, 1, P.pantD);
      R(x0 + 1, 46, 5, 6, P.pant); R(x0 + (x0 < 0 ? 1 : 5), 46, 1, 6, P.pantD);
      R(x0, 52, 7, 1, P.shoe); R(x0, 53, 7, 1, P.shoeD);
    }
  } else {
    const leg = (x0, lift, left) => {
      const bot = 49 - lift;
      R(x0, 37 + B, 6, bot - 37 - B + 1, P.pant);
      R(left ? x0 : x0 + 5, 38 + B, 1, bot - 38 - B + 1, P.pantD);
      R(left ? x0 + 3 : x0 + 2, 40 + B, 1, bot - 42 - B, P.pantL);
      if (L.pants === 'track') R(left ? x0 : x0 + 5, 38 + B, 1, bot - 39 - B, '#d8d8d8');
      R(x0, bot, 6, 1, P.pantD);
      R(x0 - 1, bot + 1, 8, 3, P.shoe); R(x0 - 1, bot + 4, 8, 1, P.shoeD);
    };
    leg(-7, liftL, true); leg(2, liftR, false);
    R(-2, 37 + B, 4, 3, P.pant);
  }
  // busto
  const tx = -8 - w, tw = 17 + 2 * w;
  R(tx + 1, 20 + B, tw - 2, 1, P.top);
  R(tx, 21 + B, tw, 15, P.top);
  R(tx, 36 + B, tw, 1, P.topD);
  R(tx, 22 + B, 1, 14, P.topD); R(tx + tw - 1, 22 + B, 1, 14, P.topD);
  R(tx + tw - 3, 22 + B, 1, 12, P.topL);
  if (!back) torsoFront(c, B, tx, tw);
  else if (L.top === 'hoodie' && L.hair !== 'hood') { R(-5, 20 + B, 11, 7, P.topL); R(-4, 20 + B, 9, 6, P.top); }
  // braccia
  const arm = (x0, dy, left) => {
    const tee = L.top === 'tshirt';
    R(x0, 21 + B, 3, 13 + dy, P.top);
    R(left ? x0 : x0 + 2, 22 + B, 1, 12 + dy, P.topD);
    R(x0 + 1, 23 + B, 1, 9 + dy, P.topL);
    if (tee) { R(x0, 26 + B, 3, 8 + dy, P.skin); R(left ? x0 : x0 + 2, 26 + B, 1, 8 + dy, P.skinS); }
    if (L.sleeveStripes && !back) R(left ? x0 : x0 + 2, 22 + B, 1, 11 + dy, L.sleeveStripes);
    R(x0, 33 + B + dy, 3, 1, tee ? P.skinS : P.topD);
    R(x0, 34 + B + dy, 3, 3, P.skin); S(left ? x0 : x0 + 2, 36 + B + dy, P.skinS);
  };
  arm(-11 - w, aL, true); arm(9 + w, aR, false);
  if (L.stein && !back && !o.sleep && o.phase == null && o.pose !== 'phone') steinAt(R, S, -13 - w, 30 + B);
  personHeadFront(c, B, back);
  if (o.helmet) helmetFront(R, S, B + 3);
}

function torsoFront(c, B, tx, tw) {
  const { R, S, P, L } = c;
  const t = L.top;
  if (t === 'hoodie') {
    if (L.strings) { R(-2, 21 + B, 1, 4, L.strings); R(2, 21 + B, 1, 4, L.strings); }
    R(-5, 32 + B, 11, 1, P.topD); S(-6, 33 + B, P.topD); S(6, 33 + B, P.topD); R(-6, 34 + B, 1, 2, P.topD); R(6, 34 + B, 1, 2, P.topD);
  }
  if (t === 'fleece' || t === 'jacket' || t === 'parka' || t === 'puffer') R(0, 19 + B, 1, 17, L.zip || P.topD);
  if (t === 'fleece' || t === 'jacket') { R(-3, 19 + B, 3, 2, P.topL); R(1, 19 + B, 3, 2, P.topL); }
  if (L.collar) { R(-3, 19 + B, 3, 1, L.collar); R(1, 19 + B, 3, 1, L.collar); }
  if (L.side) { R(tx, 26 + B, 3, 10, L.side); R(tx + tw - 3, 26 + B, 3, 10, L.side); }
  if (t === 'sweater') { for (let x = tx + 1; x < tx + tw - 1; x += 2) R(x, 22 + B, 1, 13, P.topD); R(-3, 18 + B, 7, 3, P.topL); R(-3, 18 + B, 7, 1, P.topH); }
  if (t === 'tshirt') R(-2, 20 + B, 5, 1, P.skinS);
  if (t === 'puffer') for (const y of [24, 27, 30, 33]) R(tx, y + B, tw, 1, P.topD);
  if (t === 'parka' && L.inner) { R(-2, 20 + B, 5, 16, L.inner[1]); R(-2, 20 + B, 1, 16, L.inner[0]); R(3, 21 + B, 1, 15, P.topD); }
  if (t === 'parka') { R(-6, 29 + B, 4, 1, P.topD); R(3, 29 + B, 4, 1, P.topD); R(-6, 30 + B, 1, 3, P.topD); R(6, 30 + B, 1, 3, P.topD); }
  if (t === 'jacketOpen') { R(-3, 20 + B, 7, 16, L.inner[1]); R(-3, 20 + B, 1, 16, L.inner[0]); }
  if (L.scarf) { R(-4, 18 + B, 9, 3, L.scarf[1]); R(-3, 21 + B, 3, 8, L.scarf[0]); R(-3, 28 + B, 3, 1, L.scarf[1]); }
  const pr = L.print;
  if (pr === 'textLines') {
    for (const y of [23, 25, 32, 34]) for (let x = -2; x <= 3; x++) if (hash2(x, y, 41) < 0.65) S(x, y + B, '#e8e8e8');
    R(-1, 27 + B, 3, 3, '#d8d8d8'); S(0, 28 + B, '#1a1a1a');
  }
  if (pr === 'face') { R(1, 25 + B, 5, 7, '#2a1a14'); R(2, 27 + B, 3, 4, '#f0e8e0'); S(2, 28 + B, '#2a1a14'); S(4, 28 + B, '#2a1a14'); S(3, 30 + B, '#2a1a14'); }
  if (pr === 'super') for (let y = 27; y <= 33; y++) for (let x = -6; x <= 6; x++) if (((x + y) & 1) && (Math.abs(x) > 2 || y === 27 || y === 30 || y === 33)) S(x, y + B, '#b8bcc8');
  if (pr === 'olympic') {
    R(tx + tw - 7, 29 + B, 6, 7, '#e8c020'); R(tx + tw - 7, 29 + B, 6, 1, '#f4d860');
    for (let i = 0; i < 9; i++) S(6 - i, 22 + i + B, '#f0f0f0');
    S(-5, 25 + B, '#f0f0f0'); S(-4, 24 + B, '#f0f0f0'); S(-3, 25 + B, '#f0f0f0');
  }
  if (pr === 'flag') { R(-5, 25 + B, 5, 1, '#c82a2a'); R(-5, 26 + B, 5, 1, '#f0f0f0'); R(-5, 27 + B, 5, 1, '#2a4ab0'); R(-5, 29 + B, 5, 1, '#e8e8e8'); }
}

function personHeadFront(c, hy, back) {
  const { o, P, L } = c;
  const dx = o.sleep ? 1 : 0, dy = hy + (o.sleep ? 2 : 0);
  const R = (x, y, w, h, col) => c.R(x + dx, y + dy, w, h, col), S = (x, y, col) => c.S(x + dx, y + dy, col);
  R(-2, 17, 5, 3, P.skinS);
  const rows = { 3: [-3, 3], 4: [-4, 4], 16: [-4, 4], 17: [-3, 3] };
  for (let y = 3; y <= 17; y++) { const [a, b2] = rows[y] || [-5, 5]; R(a, y, b2 - a + 1, 1, P.skin); }
  const H = L.hair;
  if (back) {
    // nuca: capelli
    const hairBack = (x, y) => hash2(x, y, 42) < 0.15 ? P.hairL : (hash2(x, y, 43) < 0.2 ? P.hairD : P.hair);
    if (H === 'bald') { R(-5, 9, 11, 4, P.hair); S(-1, 5, '#fff0e0'); }
    else if (H === 'buzz') { for (let y = 2; y <= 15; y++) for (let x = -5; x <= 5; x++) S(x, y, hash2(x, y, 48) < 0.5 ? hexMix(P.skinS, P.hairD, 0.55) : hexMix(P.skinS, P.hairD, 0.35)); }
    else if (H === 'hood') { R(-7, 1, 15, 19, P.top); R(0, 2, 1, 16, P.topD); R(-7, 1, 15, 1, P.topL); }
    else {
      const bot = H === 'long' ? 26 : H === 'wavy' ? 17 : H === 'undercut' ? 26 : 15;
      const ww = H === 'wavy' ? 6 : 5;
      for (let y = 1; y <= bot; y++) for (let x = -ww; x <= ww; x++) {
        if (y < 3 && Math.abs(x) > 3) continue;
        if (y > 15 && Math.abs(x) > (H === 'long' ? 5 : 4)) continue;
        S(x, y, hairBack(x, y));
      }
      if (H === 'ponytail') { R(-1, 15, 3, 8, P.hair); R(-1, 15, 3, 1, '#c83a3a'); R(0, 23, 1, 2, P.hairD); }
      if (H === 'undercut') for (let y = 4; y <= 9; y++) for (const x of [-5, -4, 4, 5]) S(x, y, ((x + y) & 1) ? P.skinS : P.hairD);
    }
    if (o.lamp != null) R(-5, 6, 11, 1, '#1a1a1a');
    return;
  }
  R(-5, 6, 1, 9, P.skinS);
  S(-6, 10, P.skinS); S(-6, 11, P.skinS); S(6, 10, P.skin); S(6, 11, P.skinS);
  R(-4, 9, 3, 1, P.brow); R(2, 9, 3, 1, P.brow);
  if (o.blink || o.sleep) { R(-4, 10, 3, 1, P.skinD); R(2, 10, 3, 1, P.skinD); }
  else { S(-3, 10, P.eye); S(3, 10, P.eye); S(-4, 10, '#f4e8dc'); S(4, 10, '#f4e8dc'); }
  S(0, 11, P.skinS); S(0, 12, P.skinD); S(1, 12, P.skinS);
  // barba
  const bd = L.beard;
  const BC = (x, y) => { const h = hash2(x, y, 33); return h < 0.2 ? P.beardL : h > 0.85 ? P.beardD : P.beard; };
  if (bd === 'stubble') { const st = hexMix(P.skinS, P.beard, 0.45); for (let y = 13; y <= 17; y++) for (let x = -5; x <= 5; x++) if ((y >= 15 || Math.abs(x) >= 4) && hash2(x, y, 34) < 0.45) S(x, y, st); }
  else if (bd === 'goatee') {
    const st = hexMix(P.skinS, P.beard, 0.35);
    for (let y = 13; y <= 17; y++) for (let x = -5; x <= 5; x++) if ((y >= 15 || Math.abs(x) >= 4) && hash2(x, y, 34) < 0.3) S(x, y, st);
    R(-2, 13, 5, 1, P.beard); R(-1, 16, 3, 2, P.beard); S(0, 18, P.beardD); // baffetti e pizzetto
  }
  else if (bd) {
    const len = bd === 'long' ? 25 : bd === 'big' ? 22 : 18;
    for (let y = 12; y <= len; y++) {
      const hw = y <= 17 ? 5 + (bd === 'big' ? 1 : 0) : Math.max(1, (bd === 'big' ? 6 : 5) - Math.floor((y - 17) * (bd === 'long' ? 0.55 : 0.8)));
      for (let x = -hw; x <= hw; x++) { if (y < 14 && Math.abs(x) < 4) continue; S(x, y, BC(x, y)); }
    }
    R(-2, 13, 5, 1, P.beard);
  }
  if (o.talk) { R(-1, 14, 3, 1, P.mouth); R(-1, 15, 3, 1, P.lips); }
  else if (o.sleep) R(0, 14, 2, 1, P.mouth);
  else R(-1, 14, 3, 1, P.lips);
  // capelli
  const hx = (x, y) => hash2(x, y, 44) < 0.18 ? P.hairL : P.hair;
  if (H === 'short' || H === 'ponytail') {
    for (let y = 1; y <= 5; y++) { const ww = y === 1 ? 3 : y === 2 ? 4 : 5; for (let x = -ww; x <= ww; x++) S(x, y, hx(x, y)); }
    R(-5, 6, 1, 3, P.hairD); R(5, 6, 1, 3, P.hairD);
    if (H === 'short') { R(-4, 6, 4, 1, P.hair); S(1, 6, P.hairD); }
    if (H === 'ponytail') for (let x = -4; x <= 4; x += 3) S(x, 3, P.hairL);
  }
  if (H === 'receding') {
    for (let x = -2; x <= 2; x++) S(x, 2, P.hairD);
    for (let y = 3; y <= 5; y++) { S(-5, y, P.hair); S(-4, y, P.hair); S(4, y, P.hair); S(5, y, P.hair); }
    R(-5, 6, 1, 4, P.hairD); R(5, 6, 1, 4, P.hairD); S(-1, 3, P.hairD); S(1, 3, P.hairD);
  }
  if (H === 'buzz') {
    const bz = hexMix(P.skinS, P.hairD, 0.55);
    // stempiato: tempie scoperte e solo un ciuffetto in mezzo (fronte alta)
    const nudo = (x, y) => L.recede && (y === 3 ? Math.abs(x) >= 3 : y === 4 ? Math.abs(x) >= 2 && Math.abs(x) <= 4 : y === 5 ? Math.abs(x) >= 1 && Math.abs(x) <= 4 : y === 6 ? Math.abs(x) <= 4 : false);
    for (let y = 2; y <= 6; y++) { const ww = y === 2 ? 3 : y === 3 ? 4 : 5; for (let x = -ww; x <= ww; x++) if (!nudo(x, y)) S(x, y, hash2(x, y, 46) < 0.5 ? bz : hexMix(P.skinS, P.hairD, 0.35)); }
    if (L.recede) { const lucido = hexMix(P.skin, '#ffffff', 0.3); S(-3, 4, lucido); S(3, 4, lucido); S(-2, 5, lucido); }
  }
  if (H === 'long') {
    for (let y = 1; y <= 5; y++) { const ww = y === 1 ? 3 : y === 2 ? 4 : 5; for (let x = -ww; x <= ww; x++) S(x, y, hx(x, y)); }
    S(0, 2, P.skinS); S(0, 3, P.hairD);
    for (let y = 4; y <= 26; y++) { const ln = y < 22 ? 2 : 1; for (let i = 0; i < ln; i++) { S(-6 - i, y, hx(-6 - i, y)); S(6 + i, y, hx(6 + i, y)); } }
    R(-6, 6, 1, 10, P.hairD); R(6, 6, 1, 10, P.hairD);
  }
  if (H === 'wavy') {
    for (let y = 0; y <= 5; y++) { const ww = y === 0 ? 3 : y === 1 ? 5 : 6; for (let x = -ww; x <= ww; x++) S(x, y, hx(x, y)); }
    for (let y = 6; y <= 16; y++) { const wv = (y >> 1) & 1; S(-6 - wv, y, P.hair); S(-7 + wv, y, P.hairD); S(6 + wv, y, P.hair); S(7 - wv, y, P.hairL); }
    R(-5, 6, 4, 1, P.hair); S(-1, 6, P.hairD);
  }
  if (H === 'undercut') {
    for (let y = 0; y <= 4; y++) for (let x = -3; x <= 3; x++) S(x, y, ((x + y) % 3) ? P.hair : P.hairD);
    for (let y = 4; y <= 9; y++) for (const x of [-5, -4, 4, 5]) if ((x + y) & 1) S(x, y, P.hairD);
    R(-7, 12, 2, 12, P.hair); R(6, 12, 2, 12, P.hair); R(-7, 13, 1, 10, P.hairD);
  }
  if (H === 'bald') { S(-2, 4, '#fff0e0'); S(-1, 4, '#fff0e0'); R(-5, 8, 1, 5, P.hair); R(5, 8, 1, 5, P.hair); S(-5, 7, P.hairD); S(5, 7, P.hairD); }
  if (H === 'hood') {
    R(-7, 1, 15, 3, P.top); R(-8, 3, 3, 17, P.top); R(6, 3, 3, 17, P.top); R(-7, 0, 15, 1, P.topL);
    R(-5, 4, 11, 1, P.topD); R(-5, 5, 1, 12, P.topD); R(5, 5, 1, 12, P.topD);
    R(-4, 5, 9, 1, P.hairD); R(-8, 3, 1, 16, P.topD);
  }
  if (L.glasses) {
    const g = L.glasses === 'round' ? '#6a6a72' : '#141414';
    for (const x0 of [-5, 2]) { R(x0, 9, 4, 1, g); R(x0, 11, 4, 1, g); S(x0, 10, g); S(x0 + 3, 10, g); }
    R(-1, 10, 3, 1, g);
  }
  if (L.earring) S(6, 12, '#e8e8e8');
  if (L.nosering) S(1, 13, '#d8d8d8');
  if (o.lamp != null) { R(-5, 6, 11, 1, '#1a1a1a'); R(-1, 5, 3, 2, o.lamp ? '#fffbe0' : '#4a4a48'); }
}

// il boccale di gres di Chino: grigio, con le righe blu
function steinAt(R, S, x, y) {
  R(x, y, 5, 7, '#a8a498'); R(x, y, 1, 7, '#8a867a'); R(x + 3, y + 1, 1, 5, '#c4c0b4');
  R(x, y, 5, 1, '#2e4a8a'); R(x, y + 6, 5, 1, '#2e4a8a'); R(x + 1, y + 3, 3, 1, '#4a6aaa');
  S(x + 5, y + 2, '#8a867a'); S(x + 6, y + 3, '#8a867a'); S(x + 5, y + 4, '#8a867a');
}

/* ---------- di profilo ---------- */
function personSide(c) {
  const { R, S, T, o, P, L } = c;
  const walking = o.pose === 'walk' && o.phase != null;
  const ph = walking ? o.phase * Math.PI * 2 : 0;
  const legInfo = phi => { if (!walking) return { fx: 0, lift: 0 }; const s = Math.sin(phi); return { fx: Math.round(5 * Math.cos(phi)), lift: s < 0 ? Math.round(-3 * s) : 0 }; };
  const near = legInfo(ph), far = legInfo(ph + Math.PI);
  if (!walking) { near.fx = 1; far.fx = -2; }
  if (o.pose === 'saw') { near.fx = 3; far.fx = -3; }
  const B = walking && Math.abs(Math.cos(ph)) < 0.45 ? -1 : 0;
  const sw = walking ? -Math.cos(ph) : 0;
  const run = o.sawRun, vib = run ? (o.vib || 0) : 0;
  const tee = L.top === 'tshirt', w = L.build === 'big' ? 1 : 0;
  const drawArm = (s, isFar, hand) => {
    const sx = isFar ? -1 : 0, sy = 22 + B;
    let hx, hy, ex, ey;
    if (hand) { hx = hand[0]; hy = hand[1]; ex = Math.round((sx + hx) / 2 - 1); ey = Math.round((sy + hy) / 2 + 2); }
    else { hx = Math.round(sx + s * 4); hy = 34 + B; ex = Math.round(sx + s * 2); ey = 28 + B; }
    const cc = isFar ? P.topD : P.topL;
    T(sx, sy, ex, ey, 3, cc); T(ex, ey, hx, hy - 1, 3, tee ? (isFar ? P.skinS : P.skin) : cc);
    if (!isFar && !tee) T(sx, sy - 1, ex, ey - 1, 1, P.topH);
    if (L.sleeveStripes && !isFar) T(sx, sy + 1, ex, ey + 1, 1, L.sleeveStripes);
    R(hx - 1, hy, 3, 3, isFar ? P.skinS : P.skin);
  };
  const drawLeg = (Lg, isFar) => {
    const hipX = isFar ? -1 : 1, hipY = 39 + B;
    const ay = 50 - Lg.lift;
    const kx = Math.round((hipX + Lg.fx) / 2 + (Lg.lift > 0 ? 2 : 1)), ky = 45 - (Lg.lift > 0 ? 1 : 0);
    const cc = isFar ? P.pantD : P.pant;
    T(hipX, hipY, kx, ky, 5, cc); T(kx, ky, Lg.fx, ay - 1, 4, cc);
    if (!isFar) T(kx - 2, ky + 1, Lg.fx - 2, ay - 1, 1, L.pants === 'track' ? '#d8d8d8' : P.pantD);
    const bc = isFar ? P.shoeD : P.shoe;
    R(Lg.fx - 2, ay + 1, 6, 2, bc); R(Lg.fx - 2, ay + 3, 7, 1, P.shoeD); S(Lg.fx + 4, ay + 2, bc);
  };
  const handNear = o.pose === 'reach' ? [9, 27 + B] : o.pose === 'saw' ? [7, 31 + B + vib] : null;
  const handFar = o.pose === 'saw' ? [9, 27 + B + vib] : null;
  drawArm(-sw, true, handFar);
  drawLeg(far, true);
  R(-3, 20 + B, 7, 1, P.top);
  R(-5 - w, 21 + B, 10 + w * 2, 15, P.top);
  R(-5 - w, 36 + B, 10 + w * 2, 1, P.topD);
  R(-5 - w, 22 + B, 1, 14, P.topD);
  R(4 + w, 22 + B, 1, 12, P.topL);
  if (L.top === 'hoodie' && L.hair !== 'hood') { R(-6, 17 + B, 5, 4, P.top); R(-6, 17 + B, 5, 1, P.topL); }
  if (L.zip && L.top !== 'puffer') R(4 + w, 21 + B, 1, 15, L.zip);
  if (L.top === 'puffer') for (const y of [24, 27, 30, 33]) R(-5, y + B, 10, 1, P.topD);
  if (L.scarf) { R(-3, 18 + B, 7, 3, L.scarf[1]); R(3, 21 + B, 2, 7, L.scarf[0]); }
  if (L.print === 'olympic') R(-5, 29 + B, 9, 7, '#e8c020');
  drawLeg(near, false);
  if (o.pose === 'saw') drawSawAt(R, S, 7, 27 + B + vib, run, o.sawPh || 0);
  drawArm(sw, false, handNear);
  if (L.stein && !handNear && !walking && !o.sleep) steinAt(R, S, -1, 29 + B);
  personHeadSide(c, B);
  if (o.helmet) helmetSide(R, S, B + 3);
}

function personHeadSide(c, hy) {
  const { o, P, L } = c;
  const R = (x, y, w, h, col) => c.R(x, y + hy, w, h, col), S = (x, y, col) => c.S(x, y + hy, col);
  R(0, 17, 4, 3, P.skinS);
  const rows = { 3: [0, 4], 4: [-1, 5], 15: [-1, 6], 16: [0, 5], 17: [1, 4] };
  for (let y = 3; y <= 17; y++) { const [a, b2] = rows[y] || [-2, 6]; R(a, y, b2 - a + 1, 1, P.skin); }
  R(-2, 7, 1, 8, P.skinS);
  S(7, 11, P.skin); S(7, 12, P.skinS);
  R(1, 9, 2, 3, P.skinS); S(1, 10, P.skinD);
  R(3, 9, 3, 1, P.brow);
  if (o.blink || o.sleep) R(4, 10, 2, 1, P.skinD); else { S(4, 10, P.eye); S(5, 10, '#f4e8dc'); }
  const bd = L.beard;
  const BC = (x, y) => { const h = hash2(x, y, 35); return h < 0.2 ? P.beardL : h > 0.85 ? P.beardD : P.beard; };
  if (bd === 'stubble') { const st = hexMix(P.skinS, P.beard, 0.45); for (let y = 13; y <= 17; y++) for (let x = 0; x <= 6; x++) if (hash2(x, y, 36) < 0.45 && !(y === 14 && x >= 5)) S(x, y, st); }
  else if (bd === 'goatee') {
    const st = hexMix(P.skinS, P.beard, 0.35);
    for (let y = 13; y <= 17; y++) for (let x = 0; x <= 6; x++) if (hash2(x, y, 36) < 0.3 && !(y === 14 && x >= 5)) S(x, y, st);
    R(4, 13, 3, 1, P.beard); R(3, 16, 3, 2, P.beard); S(4, 18, P.beardD);
  }
  else if (bd) {
    const len = bd === 'long' ? 25 : bd === 'big' ? 22 : 18;
    for (let y = 12; y <= len; y++) {
      const x0 = y <= 17 ? 0 : 1 + Math.floor((y - 17) * 0.3), x1 = y <= 17 ? (bd === 'big' ? 7 : 6) : Math.max(x0, 6 - Math.floor((y - 17) * (bd === 'long' ? 0.5 : 0.8)));
      for (let x = x0 - (bd === 'big' ? 1 : 0); x <= x1; x++) { if (y === 14 && x >= 5) continue; if (y < 13 && x > 3) continue; S(x, y, BC(x, y)); }
    }
    R(4, 13, 3, 1, P.beard);
  }
  if (o.talk) { R(5, 14, 2, 1, P.mouth); S(6, 15, P.lips); } else R(5, 14, 2, 1, P.lips);
  const H = L.hair;
  const hx = (x, y) => hash2(x, y, 45) < 0.18 ? P.hairL : P.hair;
  const cap = (y0, ww) => { for (let y = y0; y <= 5; y++) { const a = y <= 1 ? 0 : y === 2 ? -1 : -2, b2 = y <= 1 ? 4 : 5; for (let x = a; x <= b2 + (ww || 0); x++) S(x, y, hx(x, y)); } };
  if (H === 'short' || H === 'ponytail' || H === 'receding') {
    if (H === 'receding') { for (let y = 3; y <= 6; y++) for (let x = -2; x <= 1; x++) S(x, y, hx(x, y)); S(2, 2, P.hairD); S(1, 2, P.hairD); }
    else cap(1, 0);
    R(-2, 6, 2, 7, P.hair); R(-2, 6, 1, 7, P.hairD);
    if (H === 'ponytail') { c.T(-3, 8 + hy, -6, 18 + hy, 2, P.hair); S(-3, 8, '#c83a3a'); S(-4, 9, '#c83a3a'); }
  }
  if (H === 'buzz') {
    const bz = hexMix(P.skinS, P.hairD, 0.5);
    const davanti = y => L.recede ? (y <= 2 ? 4 : y === 3 ? 2 : y <= 5 ? 0 : -1) : (y < 6 ? 5 : 0);
    for (let y = 2; y <= 12; y++) for (let x = -2; x <= davanti(y); x++) if (y < 7 || x < 1) S(x, y, hash2(x, y, 47) < 0.5 ? bz : hexMix(P.skinS, P.hairD, 0.3));
    if (L.recede) S(3, 4, hexMix(P.skin, '#ffffff', 0.3));
  }
  if (H === 'long') { cap(1, 0); for (let y = 5; y <= 26; y++) for (let x = -4; x <= -1; x++) S(x, y, hx(x, y)); R(-4, 6, 1, 18, P.hairD); }
  if (H === 'wavy') { for (let y = 0; y <= 5; y++) for (let x = -3; x <= 6; x++) if (!(y === 0 && (x < 0 || x > 4))) S(x, y, hx(x, y)); for (let y = 6; y <= 17; y++) { const wv = (y >> 1) & 1; for (let x = -4 - wv; x <= -1; x++) S(x, y, hx(x, y)); } }
  if (H === 'undercut') { for (let y = 0; y <= 4; y++) for (let x = -1; x <= 5; x++) S(x, y, ((x + y) % 3) ? P.hair : P.hairD); for (let y = 5; y <= 10; y++) for (let x = -1; x <= 2; x++) if ((x + y) & 1) S(x, y, P.hairD); for (let y = 6; y <= 25; y++) for (let x = -4; x <= -2; x++) S(x, y, ((x + y) & 1) ? P.hair : P.hairD); }
  if (H === 'bald') { S(2, 4, '#fff0e0'); S(3, 4, '#fff0e0'); R(-2, 8, 3, 5, P.hair); }
  if (H === 'hood') { R(-4, 1, 9, 3, P.top); R(-5, 3, 5, 18, P.top); R(5, 3, 1, 4, P.top); R(-1, 4, 1, 14, P.topD); R(-4, 0, 8, 1, P.topL); R(4, 4, 1, 3, P.hairD); }
  if (L.glasses) { const g = L.glasses === 'round' ? '#6a6a72' : '#141414'; R(3, 9, 4, 1, g); R(3, 11, 4, 1, g); S(3, 10, g); S(6, 10, g); R(0, 10, 3, 1, g); }
  if (L.earring) S(1, 12, '#e8e8e8');
  if (o.lamp != null) { R(-2, 6, 8, 1, '#1a1a1a'); R(5, 5, 2, 2, o.lamp ? '#fffbe0' : '#4a4a48'); }
}

/* ---------- il cast ---------- */
const PG = {
  kodo: { name: 'Kodo', color: '#f6e43a', descr: 'Kodo. Colbacco di pelo in ogni stagione, battutine a doppio senso e una forza sovrumana. Non si sa da dove venga. Nessuna delle due.',
    chat: ['Prendiamo due banane, così una la mangiamo.', "È bella dura, eh? ...That's what she said.", 'Ho spostato la Punto da solo. Per sbaglio.'] },
  defi: { name: 'Defi', color: '#dfe6ee', descr: 'Defi. Super ingegnere tuttofare: pile bianco, motosega facile e un cacciavite sempre in tasca.',
    chat: ['Se si rompe qualcosa, chiamatemi. Se non si rompe, aspettate: lo miglioro.', 'Questo impianto elettrico l\'ha fatto un pazzo. Lo rifaccio io.', 'Questa motosega la tratto meglio della mia macchina.'] },
  ghiaccio: { name: 'Ghiaccio', color: '#bfeaff', descr: 'Ghiaccio. Capelli lunghi, barba lunga, calma glaciale. Creativo, nerd e divertentissimo.',
    chat: ['Mi è venuta un\'idea per un gioco da tavolo sui ghiri. Con le espansioni.', 'Se questa baita fosse un videogioco, saremmo nel livello segreto.', "Fa freddo? Non me n'ero accorto."] },
  orka: { name: 'Orka', color: '#7fd8c8', descr: "Orka. Barba grigia e maglietta 'troppo giovane per la pensione'. Su questo ha ragione.",
    chat: ['Troppo giovane per la pensione, troppo stanco per la legna.', 'Io supervisiono. È un lavoro anche quello.'] },
  sprus: { name: 'Sprus', color: '#ff9a8a', descr: 'Sprus. Cappuccio rosso sempre su, sorriso sempre acceso. Aiutante ufficiale della postazione retro.',
    chat: ['Il cappuccio resta su. È una questione di principio.', 'Ahahah! Scusa, pensavo a una cosa.'] },
  iron: { name: 'Iron', color: '#ffb050', descr: 'Iron. Super ingegnere tuttofare, giacca con la zip arancione. Supporto tecnico ufficiale della baita.',
    chat: ['Hai provato a spegnerla e riaccenderla?', 'Ho calcolato il carico della tettoia: regge. Per ora.', 'Supporto tecnico: piano A, B e C già pronti.'] },
  zac: { name: 'Zac', color: '#ff7a5a', descr: 'Zac. Pile rosso delle Olimpiadi, gasatissimo, sempre a sistemare i pad perché la postazione retro funzioni.',
    chat: ['Dopo cena torneo! Sono carichissimo!', 'Il pad due tira a sinistra. Lo sistemo, giuro.', 'La postazione retro deve funzionare. È una questione d\'onore!'] },
  gus: { name: 'Gus', color: '#ffa0b4', descr: 'Gus. Barba da vichingo e maglietta rossa con una faccia sopra. Sopra le righe, urla sempre, fa ridere tutti.',
    chat: ['Ahahah! Che figata', 'Stasera si mangia come vichinghi', 'Questa baita è leggendaria'] },
  pepi: { name: 'Pepi', color: '#a8b8ff', descr: 'Pepi. Quello del guado. Il guado ha preso il nome da lui, o lui dal guado: nessuno lo sa.',
    chat: ['Il guado Pepi? Lunga storia. Bagnata.', 'Io ci sono passato a piedi. A novembre.'] },
  lele: { name: 'Lele', color: '#d8f070', descr: 'Lele. Capelli da rockstar e zip giallo fluo. Propone sempre un birrino. O una camminatina nel bosco.',
    chat: ['Birrino?', 'Camminatina nel bosco? Dieci minuti. Massimo due ore.', 'Dopo, birrino e camminatina. Nell\'ordine che vuoi.'] },
  menion: { name: 'Menion', color: '#c8a8ff', descr: 'Menion. Perfezionista e gasatissimo: occhi spalancati, orecchino e una lista per ogni cosa.',
    chat: ['Aspetta: quel quadro è storto di due gradi. Ecco. Perfetto. CHE FIGATA!', 'Ho fatto una lista. Con le sottoliste. Sono gasatissimo!', 'Si può fare meglio. Si può SEMPRE fare meglio!'] },
  jackal: { name: 'Jackal', color: '#8ab8ff', descr: 'Jackal. Piumino blu e sciarpa. È quello che porta le brioche. Lo amiamo.',
    chat: ['Domattina porto le brioche. Quelle con la crema.', 'Fa freddo. Io sono già nel piumino.'] },
  chino: { name: 'Chino', color: '#c8d898', descr: 'Chino. Parka cachi, sciarpa nera, testa rasata e boccale di gres in mano. Crocifisso in tasca: uomo di fede e di sturalavandini. Dice sempre "tipo".',
    chat: ['Pregate per me. Mi aspetta il bagno della dépendance.', 'Ho visto cose, in quella dépendance.'] },
  biz: { name: 'Biz', color: '#e8cca0', descr: "Biz. Occhiali, barba e felpa nera. Sa sempre dov'è l'apribottiglie.",
    chat: ["L'apribottiglie ce l'ho io. Chiedete pure.", 'Che serata, eh?'] },
  latenar: { name: 'Latenar', color: '#b8d0b8', descr: 'Latenar. Dorme. Di nuovo. Con gli occhiali ancora su.', chat: ['Sto riposando gli occhi.'] },
};
// caratteri: battute da fermo (idle) per chi gioca
const PG_IDLE = {
  kodo: ['Prendiamo due banane, così una la mangiamo.', 'Ho appena sollevato la Punto con un braccio. Per sbaglio. Non so come.', 'Questa la reggo con un dito. ...That\'s what she said.'],
  defi: ['Questo impianto elettrico l\'ha fatto un pazzo. Dammi un pomeriggio e lo rifaccio.', 'Fascette, nastro americano e un po\' di ingegno: aggiusto tutto.', 'Se avessi il trapano, avrei già migliorato la baita del trenta per cento.', 'Un elastico, una graffetta e il coltellino svizzero. MacGyver mi fa un baffo.'],
  iron: ['Ho calcolato il carico della tettoia: regge. Per ora.', 'Supporto tecnico: ho già un piano A, un piano B e un piano C.', 'Tutto si aggiusta. Tranne Luciano.', 'Dammi una graffetta e dello spray e ti rifaccio la baita. Alla MacGyver.'],
  gus: ['Che figata!', 'Questa baita è leggendaria!', 'Stasera si mangia come vichinghi!'],
  menion: ['Aspetta: quel quadro è storto di due gradi. Ecco. Perfetto. CHE FIGATA!', 'Ho fatto una lista. Con le sottoliste. Sono gasatissimo!', 'Si può fare meglio. Si può SEMPRE fare meglio. Che bello!'],
  zac: ['Il pad due tira a sinistra. Lo sistemo e poi torneo! Sono carichissimo!', 'La postazione retro deve funzionare. È una questione d\'onore!'],
  ghiaccio: ['Mi è venuta un\'idea per un gioco da tavolo sui ghiri. Con le espansioni.', 'Statisticamente, il 73% delle baite ha un ghiro. Questa li ha tutti.', 'Se questa baita fosse un videogioco, saremmo nel livello segreto.'],
  lele: ['Birrino?', 'Camminatina nel bosco? Dieci minuti. Massimo due ore.', 'Dopo, birrino e camminatina. Nell\'ordine che vuoi.'],
  chino: ['Sto bene. Abbastanza. Quasi.', 'Ho ancora davanti agli occhi quel water.'],
};
for (const id in PG_IDLE) PG[id].idle = PG_IDLE[id];
// Kodo: battutine a doppio senso e forza sovrumana senza motivo
const DOPPIO_RE = /\b(dur[oa]|gross[oa]|lung[oa]|entra|infil|spingo|bagnat|strett[oa]|enorme|gonfi|ce l'ho)\w*/i;
const DOPPI_SENSI = ["...That's what she said.", 'Detto tra noi: l\'ha detto anche lei.', '...come ha detto lei ieri sera.'];
const KODO_FORTE = ['Lo sollevo con due dita. Poi lo rimetto giù: non serve. Sono fortissimo, non so perché.', 'Leggerissimo. Potrei lanciarlo fino al guado. Non lo faccio per educazione.', 'Lo alzo sopra la testa, tutti mi guardano, lo rimetto giù. Nessuno capisce come.'];
const KODO_FORTE_SPINGE = ['Si sposta di un metro. Lo rimetto a posto prima che qualcuno se ne accorga. Sono troppo forte.', 'Ops. L\'ho quasi sradicato. Non conosco la mia forza.'];
function pesante(normale) { return Game.pg === 'kodo' ? pick(KODO_FORTE) : normale; }
// la voce di ognuno: Gus urla, Chino dice "tipo", e chi parla a Chino lo ringrazia
function voceDi(actor) { return actor === hero ? Game.pg : actor.look; }
function stylize(actor, text) {
  const v = voceDi(actor);
  if (v === 'chino' && !/\btipo\b/i.test(text) && text.length > 6) {
    text = text.includes(', ') ? text.replace(', ', ', tipo, ') : 'Tipo, ' + text.charAt(0).toLowerCase() + text.slice(1);
  }
  if (v === 'gus' && !/^\.\.\./.test(text)) text = text.toUpperCase().replace(/[.!]*$/, '!!');
  if (Game.pg === 'chino' && actor !== hero && v !== 'chino' && !/^mandi/i.test(text) && !text.includes('Grazie Chino')) text += ' Grazie Chino.';
  return text;
}

const PLAYABLE = ['kodo', 'defi', 'ghiaccio', 'orka', 'sprus', 'iron', 'zac', 'gus', 'pepi', 'lele', 'menion', 'jackal', 'chino', 'biz'];

function setHero(id) {
  const p = PG[id] || PG.kodo;
  Game.pg = PG[id] ? id : 'kodo';
  hero.look = Game.pg; hero.name = p.name; hero.color = p.color;
}
const isKodo = () => (Game.pg || 'kodo') === 'kodo';

/* ---------- comparse: amici presenti nella stanza ---------- */
// Game.npcs = [{ id, room, actor }]
function makeNpc(id, room, x, y, dir) {
  const p = PG[id];
  const a = makeActor({ name: p.name, color: p.color, look: id, x, y, dir: dir || 'down', speed: 50 });
  return { id, room, actor: a };
}
function npcsIn(roomId) { return (Game.npcs || []).filter(n => n.room === roomId); }
function npcHotspot(n) {
  const p = PG[n.id], a = n.actor;
  return {
    id: 'npc_' + n.id, name: p.name, person: true,
    talk: n.talk ? () => n.talk(a) : null,
    rects: () => { const s = actorScale(a); return [[a.x - 8 * s, a.y - 52 * s, 16 * s, 52 * s]]; },
    walk: () => [a.x + (hero.x < a.x ? -18 : 18), a.y + 2], face: null,
    verbs: {
      guarda: () => say(hero, p.descr),
      parla: async () => {
        hero.dir = hero.x < a.x ? 'right' : 'left';
        if (n.id === 'chino') await say(hero, pick(['Chino, come va? Grazie Chino.', 'Ehi, Chino! Grazie Chino.', 'Tutto a posto, Chino? Grazie Chino.']));
        const i = (n.talks = (n.talks || 0) + 1) - 1; await say(a, p.chat[i % p.chat.length]);
      },
      raccogli: () => say(hero, `Prendere in braccio ${p.name}? Non siamo a quel livello di amicizia.`),
      spingi: () => say(a, 'Ehi! Piano!'),
      tira: () => say(a, 'Ehi! Piano!'),
    },
    give: Object.assign({ '*': id2 => say(a, `${itemName(id2)}? No grazie, tienilo tu.`) }, n.give ? Object.fromEntries(Object.entries(n.give).map(([k, fn]) => [k, () => fn(a)])) : {}),
  };
}

/* ---------- Latenar dorme in ogni stanza della baita ---------- */
const latenar = makeActor({ name: 'Latenar', color: PG.latenar.color, look: 'latenar', pose: 'sit', dir: 'down', sleep: true });
const LATENAR_SPOTS = {
  parcheggio: { x: 327, y: 111 }, portico: { x: 94, y: 134, sortY: 141.6 }, salone: { x: 246, y: 109 },
  caminetto: { x: 158, y: 101 }, camerata: { x: 266, y: 133 }, dependance: { x: 282, y: 132 },
};
function latenarObject(roomId) {
  const sp = LATENAR_SPOTS[roomId];
  if (!sp) return null;
  return { y: sp.sortY || sp.y, draw: g => {
    latenar.x = sp.x; latenar.y = sp.y;
    if (roomId === 'dependance') { // dorme su uno sgabello di plastica
      g.fillStyle = '#2a5ab0'; g.fillRect(sp.x - 8, sp.y - 10, 16, 3); g.fillStyle = '#1e4490'; g.fillRect(sp.x - 7, sp.y - 7, 2, 7); g.fillRect(sp.x + 5, sp.y - 7, 2, 7);
    }
    drawHero(latenar);
    // le zeta del sonno
    const s = actorScale(latenar);
    for (let i = 0; i < 2; i++) {
      const k = (Game.t * 0.5 + i * 0.5) % 1;
      const zx = Math.round(sp.x + 6 * s + k * 8), zy = Math.round(sp.y - 46 * s - k * 14);
      g.globalAlpha = 1 - k; g.fillStyle = '#e8eef8';
      g.fillRect(zx, zy, 3, 1); g.fillRect(zx + 1, zy + 1, 1, 1); g.fillRect(zx, zy + 2, 3, 1);
      g.globalAlpha = 1;
    }
  } };
}
function latenarHotspot(roomId) {
  const sp = LATENAR_SPOTS[roomId];
  if (!sp) return null;
  const zzz = () => say(latenar, 'Sto riposando gli occhi.');
  return {
    id: 'latenar', name: 'Latenar', person: true,
    rects: () => { const s = actorScale(latenar); return [[sp.x - 9 * s, sp.y - 46 * s, 18 * s, 46 * s]]; },
    walk: () => [sp.x + (hero.x < sp.x ? -20 : 20), Math.max(sp.y + 4, 0)],
    verbs: { guarda: async () => { if (Game.chapter === 8 && roomId === 'camerata') return camerataLatenarGuarda(); await say(hero, PG.latenar.descr); await zzz(); }, parla: zzz, raccogli: zzz, spingi: zzz, tira: zzz, apri: zzz, chiudi: zzz, usa: zzz },
    give: { '*': zzz }, use: { '*': zzz },
  };
}

/* ---------- Zac è sempre in salone a bugfixare il retrogaming ---------- */
const zacPc = makeActor({ name: 'Zac', color: PG.zac.color, look: 'zac', dir: 'up', x: 337, y: 118, pose: 'sit' });
const ZAC_BUGFIX = [
  'Un attimo, sto bugfixando il retrogaming.',
  "L'emulatore parte, ma il joypad due è al contrario. A sinistra va a destra.",
  'Ho aggiornato i driver. Adesso non va più niente. È un progresso.',
  'Dieci minuti e funziona tutto. Lo dico dal 2019.',
  'Chi ha toccato i cavi? Non rispondete, lo so già.',
];
function zacGagHere(roomId) {
  return roomId === 'salone' && Game.pg !== 'zac' && !(Game.npcs || []).some(n => n.id === 'zac');
}
function zacObject(roomId) {
  if (!zacGagHere(roomId)) return null;
  return { y: zacPc.y, draw: g => {
    drawHero(zacPc);
    // lucine che lampeggiano mentre armeggia col computer
    if (((Game.t * 3) | 0) % 2) { g.fillStyle = '#3a8aff'; g.fillRect(331, 96 + ((Game.t * 7) | 0) % 6, 1, 1); }
  } };
}
function zacHotspot(roomId) {
  if (!zacGagHere(roomId)) return null;
  const busy = () => say(zacPc, 'Non ora, sto compilando.');
  return {
    id: 'zacPc', name: 'Zac', person: true, rects: [[329, 72, 16, 46]], walk: [356, 122], face: 'left',
    verbs: {
      guarda: () => say(hero, 'Zac, seduto sullo sgabello e piegato sul computer dalle ventole blu. Sta bugfixando il retrogaming. Da quando siamo arrivati.'),
      parla: () => { zacPc.talks = (zacPc.talks || 0) + 1; return say(zacPc, ZAC_BUGFIX[(zacPc.talks - 1) % ZAC_BUGFIX.length]); },
      raccogli: busy, spingi: busy, tira: busy, usa: busy, apri: busy, chiudi: busy,
    },
    give: { '*': () => say(zacPc, 'Appoggialo lì. Dopo il bugfix guardo.') },
  };
}

/* oggetti e hotspot "extra" della stanza corrente: amici, Latenar e Zac */
function roomExtraObjects() {
  const id = Game.room && Game.room.id, list = [];
  for (const n of npcsIn(id)) list.push({ y: n.actor.y, draw: () => drawHero(n.actor) });
  const lo = latenarObject(id); if (lo) list.push(lo);
  const zo = zacObject(id); if (zo) list.push(zo);
  return list;
}
function roomExtraHotspots() {
  const id = Game.room && Game.room.id, list = [];
  const lh = latenarHotspot(id); if (lh) list.push(lh);
  const zh = zacHotspot(id); if (zh) list.push(zh);
  for (const n of npcsIn(id).slice().sort((p, q) => p.actor.y - q.actor.y)) list.push(n.hs || (n.hs = npcHotspot(n)));
  return list;
}

/* ---------- schermata di scelta del personaggio ---------- */
function openSelect(n, onPick) {
  const ch = CHAPTERS[n];
  Game.mode = 'select'; Game.fade = 1; Game.fadeTarget = 0;
  Game.select = { n, opts: chapterChars(n).slice(), onPick, hover: -1 };
}
function selectCell(i) {
  const k = Game.select.opts.length, cols = Math.min(k, 7), rows = Math.ceil(k / cols);
  const cw = 300 / cols, ch = rows > 1 ? 62 : 80;
  const r = Math.floor(i / cols), cIdx = i % cols;
  const inRow = r === rows - 1 ? k - r * cols : cols;
  const x0 = 10 + (300 - inRow * cw) / 2 + cIdx * cw;
  return [Math.round(x0), Math.round((rows > 1 ? 44 : 56) + r * ch), Math.round(cw), ch];
}
function selectAt(mx, my) { return Game.select.opts.findIndex((_, i) => inRect(mx, my, selectCell(i))); }
function selectClick(mx, my) {
  const i = selectAt(mx, my);
  if (i < 0) return;
  const s = Game.select; Game.select = null;
  SFX.pick();
  s.onPick(s.opts[i]);
}
function renderSelectLow() {
  const g = lctx;
  g.fillStyle = '#140c06'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 15) { g.fillStyle = '#1c120a'; g.fillRect(0, y, W, 14); g.fillStyle = '#26180e'; g.fillRect(0, y, W, 1); }
  const s = Game.select;
  s.hover = mouse.touch ? -1 : selectAt(mouse.x, mouse.y);
  s.opts.forEach((id, i) => {
    const r = selectCell(i);
    if (i === s.hover) { g.fillStyle = '#3a2814'; g.fillRect(r[0] + 2, r[1], r[2] - 4, r[3] - 12); }
    const blink = ((Game.t + i * 0.7) % 4) < 0.12;
    const cv = cached(['sel', id, blink].join('|'), () => buildHero({ view: 'front', pose: 'stand', phase: null, talk: 0, blink, look: id }));
    const sc = s.opts.length > 7 ? 0.82 : 1;
    g.drawImage(cv, Math.round(r[0] + r[2] / 2 - (HERO_CX + 0.5) * sc), Math.round(r[1] + r[3] - 16 - HERO_OY * sc), Math.round(cv.width * sc), Math.round(cv.height * sc));
  });
}
function renderSelectText() {
  const s = Game.select, ch = CHAPTERS[s.n];
  drawText(`CAPITOLO ${s.n}: ${ch.title}`, W / 2, 16, '#f2e01c', { size: 13 });
  drawText(ch.place ? `${ch.place} — scegli con chi giocare` : 'Scegli con chi giocare', W / 2, 28, '#f4ead0', { size: 9 });
  s.opts.forEach((id, i) => {
    const r = selectCell(i);
    drawText(PG[id].name, r[0] + r[2] / 2, r[1] + r[3] - 5, i === s.hover ? '#fff2b0' : PG[id].color, { size: 9 });
  });
  const hv = s.hover >= 0 ? s.opts[s.hover] : null;
  const txt = hv ? PG[hv].descr : (IS_TOUCH ? 'Tocca un personaggio per cominciare.' : 'Clicca un personaggio per cominciare.');
  wrapText(txt, 280, 9).forEach((l, i) => drawText(l, W / 2, 182 + i * 9, '#c9a35f', { size: 9 }));
}
