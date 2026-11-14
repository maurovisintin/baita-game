'use strict';
/* =========================================================
   LA STANZA DEL CAMINETTO: una stanzetta piccola e raccolta.
   Divano a fiori sotto la finestra col pizzo, caminetto in pietra
   nell'angolo, divanetto di vimini, radio antica, e in mezzo
   il tavolo con la tovaglia a quadretti verdi
   ========================================================= */
const CAW = 320;
const CA_FLOOR = { yb: 100, yh: 70, f: 60, vpx: 160 };
// pareti laterali in prospettiva (punto di fuga 160,70; muro di fondo 96..224 x 30..100)
const caFloorL = x => 100 + (96 - x) * 44 / 94, caFloorR = x => 100 + (x - 224) * 44 / 94;
const caCeilL = x => 30 - (96 - x) * 30 / 48, caCeilR = x => 30 - (x - 224) * 30 / 48;

function paintCaminetto(night) {
  const b = new Buf(CAW, SH);
  const wallPal = ['#c8b998', '#d4c6a6', '#ded2b4', '#e8dec4', '#f0e8d2'];
  const wall = stuccoShader(wallPal, 300);

  /* ---- soffitto basso con una trave ---- */
  b.poly([[48, 0], [272, 0], [224, 30], [96, 30]], (x, y) => ramp(['#b8ae9a', '#c6bdaa', '#d4ccbc'], clamp(0.3 + y / 50 + hash2(x, y, 301) * 0.2, 0, 0.999), x, y));
  b.poly([[67, 12], [253, 12], [247, 16], [73, 16]], (x, y) => ramp(['#2a180a', '#3a2412', '#4e321c', '#62422a'], clamp(0.2 + vnoise(x / 6, y, 913) * 0.5 + (y === 12 ? 0.4 : 0), 0, 0.999), x, y));

  /* ---- pareti ---- */
  b.poly([[0, 0], [48, 0], [96, 30], [96, 100], [2, 144], [0, 144]], (x, y) => hexMix(wall(x, y), '#3a2a1a', 0.18));
  b.poly([[272, 0], [320, 0], [320, 144], [318, 144], [224, 100], [224, 30]], (x, y) => hexMix(wall(x, y), '#3a2a1a', 0.3));
  b.rect(96, 30, 128, 70, wall);
  b.rect(96, 30, 128, 2, (x, y) => hexMix(wall(x, y), '#000000', 0.2));
  b.line(96, 30, 96, 100, '#a89a7c'); b.line(223, 30, 223, 100, '#9a8c70');
  // battiscopa
  b.rect(96, 97, 128, 3, '#8a6a46'); b.rect(96, 97, 128, 1, '#a8845a');
  b.poly([[2, 138], [96, 97], [96, 100], [2, 144]], '#7a5a3a');
  b.poly([[224, 97], [318, 138], [318, 144], [224, 100]], '#6a4a2e');

  /* ---- pavimento in cotto e tappeto ---- */
  b.poly([[96, 100], [224, 100], [318, 144], [2, 144]], cottoShader(CA_FLOOR, 302, 18));
  b.poly([[108, 106], [212, 106], [232, 140], [88, 140]], (x, y) => {
    const t = (y - 106) / 34, l = lerp(108, 88, t), rr = lerp(212, 232, t);
    const u = (x - l) / (rr - l);
    if (u < 0.04 || u > 0.96 || t < 0.07 || t > 0.94) return ((x + y) & 1) ? '#5a1a12' : '#e0c890';
    if (u < 0.09 || u > 0.91 || t < 0.14 || t > 0.87) return '#8a2a1a';
    const m = Math.abs(((u * 7) % 2) - 1) + Math.abs(((t * 4) % 2) - 1);
    return m < 0.5 ? '#d8b070' : m < 0.9 ? '#2a3a5a' : ramp(['#7a1e14', '#962a1a', '#a83420'], hash2(x, y, 303), x, y);
  });

  /* ---- porta del salone, sulla parete di sinistra (vicina a chi guarda) ---- */
  const doorQ = [[26, 30], [56, 38], [56, 119], [26, 132]];
  b.poly([[22, 26], [60, 35], [60, 120], [22, 134]], '#3a2010');
  b.poly(doorQ, (x, y) => {
    const u = (x - 26) / 30;
    const top = lerp(30, 38, u), bot = lerp(132, 119, u), v = (y - top) / (bot - top);
    if ((u > 0.16 && u < 0.84) && ((v > 0.06 && v < 0.46) || (v > 0.53 && v < 0.94))) {
      if (u < 0.22 || v < 0.09 || (v > 0.53 && v < 0.56)) return '#3e2412';
      return ramp(['#4a2a14', '#5e3820', '#6e4428'], clamp(0.3 + vnoise(x, y / 6, 912) * 0.4, 0, 0.999), x, y);
    }
    return ramp(['#4a2a14', '#5e3820', '#6e4428', '#7e5030'], clamp(0.4 + vnoise(x * 0.9, y / 8, 911) * 0.5, 0, 0.999), x, y);
  });
  b.rect(50, 80, 2, 2, '#d8c070'); b.set(51, 82, '#a88a40');
  /* quadretto sulla parete di sinistra */
  b.poly([[66, 42], [88, 49], [88, 68], [66, 70]], '#a87c2a');
  b.poly([[68, 45], [86, 51], [86, 66], [68, 68]], (x, y) => {
    const v = (y - lerp(45, 51, (x - 68) / 18)) / 18;
    return v < 0.45 ? ramp(['#c8c0a0', '#d8d0b0'], hash2(x, y, 304), x, y) : ramp(['#6a7a4a', '#8a9a5a', '#a8a878'], clamp((v - 0.45) * 1.8 + hash2(x, y, 305) * 0.3, 0, 0.999), x, y);
  });

  /* ---- finestra con le tendine di pizzo, sopra il divano ---- */
  b.rect(114, 38, 38, 30, '#2a1a0e');
  b.rect(116, 40, 34, 26, glassShader(night, 308));
  b.rect(116, 41, 16, 24, laceShader(309)); b.rect(134, 41, 16, 24, laceShader(310));
  laceHem(b, 116, 131, 64); laceHem(b, 134, 149, 64);
  b.rect(132, 40, 2, 26, '#2a1a0e'); b.rect(116, 52, 34, 1, '#3a2414');
  b.rect(112, 37, 42, 2, '#6a4a2a');
  b.rect(111, 68, 44, 3, '#b8ab90'); b.rect(111, 68, 44, 1, '#d8ccb0'); b.rect(111, 70, 44, 1, '#8a7c62');

  /* ---- divano a fiori contro il muro di fondo ---- */
  const flowers = (x, y) => {
    const h = hash2(x >> 1, y >> 1, 306);
    if (h < 0.1) return '#d88a9a'; if (h < 0.16) return '#b85a6a'; if (h < 0.22) return '#8aa0c8'; if (h < 0.3) return '#7a9a6a';
    return ramp(['#c8b898', '#d8ccb0', '#e6dcc4'], hash2(x, y, 307), x, y);
  };
  b.rect(102, 76, 72, 13, flowers);
  b.rect(98, 83, 7, 17, flowers); b.rect(171, 83, 7, 17, flowers);
  b.rect(98, 83, 7, 1, '#f0e8d4'); b.rect(171, 83, 7, 1, '#f0e8d4');
  b.rect(105, 89, 66, 4, (x, y) => hexMix(flowers(x, y), '#ffffff', 0.12));
  b.rect(102, 93, 72, 7, (x, y) => hexMix(flowers(x, y), '#000000', 0.25));
  b.rect(108, 76, 24, 5, (x, y) => ((x + (y >> 1)) % 4 < 2) ? '#7a5a3a' : '#c8b088');
  b.rect(150, 82, 14, 8, '#a83a3a'); b.rect(150, 82, 14, 1, '#c85a5a');

  /* ---- caminetto in pietra nell'angolo, con la mensola ---- */
  const stone = stoneShader(311, 6, ['#4a4642', '#5a5650', '#6a645c', '#3e3a36', '#7a7268', '#5e5048'], '#26221e', 0.7);
  b.rect(188, 30, 30, 32, stone);
  b.ellipse(203, 40, 7, 7, '#5a5a56'); b.ellipse(203, 40, 6, 6, '#141414');
  b.rect(182, 64, 42, 36, stone);
  b.poly([[224, 64], [234, 68], [234, 105], [224, 100]], (x, y) => hexMix(stone(x, y), '#000000', 0.3));
  b.rect(190, 78, 26, 22, '#0c0a08');
  b.ellipse(203, 78, 13, 3, '#0c0a08');
  b.rect(190, 74, 26, 1, '#8a8278');
  b.rect(192, 95, 22, 5, (x, y) => ramp(['#3a3632', '#5a5650', '#7a766e'], hash2(x, y, 312), x, y));
  b.thick(194, 94, 210, 92, 3, '#2a1a10'); b.thick(197, 92, 213, 95, 3, '#3a2214'); b.set(203, 92, '#c84a14');
  b.rect(178, 100, 50, 4, '#a8a094'); b.rect(178, 100, 50, 1, '#c8c0b4');
  b.rect(178, 60, 52, 4, '#4a2a14'); b.rect(178, 60, 52, 1, '#7a4a26'); b.rect(178, 63, 52, 1, '#2a160a');
  // rose rosse finte, foto, candeliere
  b.rect(183, 51, 6, 9, '#c8a040'); b.rect(184, 52, 2, 7, '#e8d080');
  for (const [rx, ry] of [[182, 44], [187, 42], [190, 46], [184, 48], [188, 49]]) { b.ellipse(rx, ry, 2, 2, '#b81a2a'); b.set(rx - 1, ry - 1, '#e84a5a'); }
  b.rect(198, 53, 7, 7, '#c8a050'); b.rect(199, 54, 5, 5, '#8aa0b0'); b.rect(200, 56, 3, 3, '#c89a7a');
  b.rect(214, 56, 6, 4, '#b8902a'); b.rect(216, 48, 2, 8, '#d8b040'); b.rect(215, 42, 4, 6, '#f4f0e4'); b.set(216, 41, '#3a2a1a');
  // bottiglia e scatola vicino al caminetto
  b.rect(180, 88, 4, 12, '#c89a3a'); b.rect(181, 85, 2, 3, '#c89a3a'); b.set(181, 90, '#f0d070');

  /* ---- lampadario sopra il tavolo ---- */
  b.rect(160, 0, 1, 14, '#3a3a3a');
  b.poly([[153, 20], [168, 20], [165, 14], [156, 14]], (x, y) => ramp(['#c89a50', '#e8c078', '#f8e0a8'], clamp((x - 153) / 15 + (night ? 0.3 : 0), 0, 0.999), x, y));
  b.rect(153, 20, 15, 1, '#a8783a');
  return b.canvas();
}

/* ---------- arredi: divanetto di vimini, radio, tavolo al centro ---------- */
function caminettoWickerCanvas() {
  return canvasOf('caWicker', 46, 40, b => {
    const wicker = (x, y) => (((x + y) % 4 === 0) || ((x - y) % 4 === 0)) ? '#8a5e26' : ramp(['#b4843e', '#c89850', '#dab066'], hash2(x, y, 313), x, y);
    b.ellipse(23, 8, 21, 8, wicker);
    for (let x = 4; x < 44; x += 4) b.rect(x, 2, 1, 16, '#8a5e26');
    b.rect(2, 8, 42, 12, wicker);
    b.rect(0, 14, 5, 22, wicker); b.rect(41, 14, 5, 22, wicker);
    b.ellipse(23, 1, 20, 1, '#e0bc78');
    const fl = (x, y) => { const h = hash2(x >> 1, y >> 1, 306); return h < 0.14 ? '#d8826a' : h < 0.22 ? '#7a9a6a' : '#e6d8b0'; };
    b.rect(6, 18, 34, 6, fl); b.rect(6, 18, 34, 1, '#f4ecd8');
    b.rect(10, 9, 14, 9, fl);
    b.rect(2, 24, 42, 10, wicker); b.rect(2, 33, 42, 1, '#6a4a1a');
    b.rect(3, 34, 3, 6, '#7a5220'); b.rect(40, 34, 3, 6, '#7a5220');
  });
}
function caminettoRadioCanvas() {
  return canvasOf('caRadio', 30, 52, b => {
    b.rect(2, 26, 26, 26, (x, y) => ramp(['#2e1a0a', '#3e2412', '#4e2e18'], clamp(0.3 + vnoise(x, y / 6, 314) * 0.5, 0, 0.999), x, y));
    b.rect(2, 26, 26, 1, '#6a4422'); b.rect(4, 33, 22, 1, '#22140a'); b.set(15, 40, '#c8a050');
    b.ellipse(15, 8, 11, 7, '#5a2e12');
    b.rect(4, 8, 23, 18, '#5a2e12');
    b.rect(4, 8, 1, 18, '#8a4e22'); b.ellipse(15, 8, 10, 6, '#6e3a18');
    b.ellipse(15, 11, 7, 4, '#c8a060'); b.rect(8, 11, 15, 8, '#c8a060');
    for (let x = 9; x < 22; x += 3) b.rect(x, 6, 1, 13, '#6e3a18');
    b.rect(7, 21, 17, 3, '#3a1e0a'); b.set(10, 22, '#e8d8a8'); b.set(20, 22, '#e8d8a8'); b.rect(14, 22, 3, 1, '#f0e0b0');
  });
}
function caminettoTableCanvas() {
  return canvasOf('caTable3', 104, 32, b => {
    const gingham = (x, y) => {
      const a = ((x >> 2) & 1), c = ((y >> 1) & 1);
      if (a && c) return '#5a9a5e';
      if (a || c) return ((x + y) % 7 === 0) ? '#5a9a5e' : '#b8d8b4';
      return '#f0f6ec';
    };
    // piano in prospettiva (bordo dietro più stretto) e telo che pende davanti
    b.poly([[12, 2], [92, 2], [102, 14], [2, 14]], gingham);
    b.rect(2, 14, 100, 10, (x, y) => hexMix(gingham(x, y), '#000000', 0.16));
    laceHem(b, 2, 101, 24);
    b.rect(6, 26, 3, 6, '#3a2414'); b.rect(95, 26, 3, 6, '#3a2414');
    // gioco da tavolo, boccale, portatile, telefono, carte
    b.poly([[22, 3], [44, 3], [46, 11], [20, 11]], '#14343e'); b.rect(22, 4, 22, 5, '#3a6a7a'); b.rect(27, 5, 12, 2, '#8ab0b8'); b.rect(20, 11, 26, 2, '#0a1e24');
    b.rect(14, 6, 6, 9, '#a8a49c'); b.rect(14, 6, 6, 1, '#d8d4cc'); b.rect(14, 9, 6, 1, '#2a4a8a'); b.rect(14, 13, 6, 1, '#2a4a8a'); b.rect(20, 8, 2, 5, '#8a8680');
    b.poly([[58, 0], [76, 0], [78, 8], [56, 8]], '#c8ccd0'); b.rect(60, 1, 15, 6, '#3a7ac8'); b.rect(61, 2, 6, 2, '#8ab8f0');
    b.poly([[54, 8], [80, 8], [83, 12], [51, 12]], '#d8dce0'); for (let x = 56; x < 80; x += 2) b.set(x, 10, '#6a6e72');
    b.rect(84, 5, 6, 3, '#141414'); b.rect(85, 6, 4, 1, '#3a5a8a');
    const card = (x, y, red) => { b.rect(x, y, 4, 2, '#f8f6ee'); b.set(x + 1, y, red ? '#c82a2a' : '#1a1a1a'); };
    card(48, 4, true); card(36, 12, false); card(88, 10, true);
  });
}

/* ---------- capitolo 2: la ventola e il fuoco ---------- */
const FC = () => Game.flags;
function drawVentola(g) {
  const f = FC(), cx = 203, cy = 40;
  const ang = f.ventolaOk ? Game.t * 14 : 0.4;
  g.fillStyle = '#8a8a84';
  for (let k = 0; k < 3; k++) {
    const a = ang + k * Math.PI * 2 / 3;
    for (let r = 1; r <= 5; r++) g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 2, 1);
  }
  g.fillStyle = '#c8c8c0'; g.fillRect(cx - 1, cy - 1, 2, 2);
  if (f.ventolaAperta && !f.gusciTolti) {
    for (const [x, y, c] of [[199, 42, '#8a6a3a'], [202, 43, '#a07e48'], [205, 41, '#6e5228'], [201, 38, '#a07e48'], [206, 44, '#8a6a3a'], [198, 39, '#6e5228']]) { g.fillStyle = c; g.fillRect(x, y, 2, 2); }
  }
  if (!f.ventolaAperta) {
    g.fillStyle = '#a8a8a2';
    for (let y = cy - 5; y <= cy + 5; y += 2) { const hw = Math.round(Math.sqrt(36 - (y - cy) * (y - cy))); g.fillRect(cx - hw, y, hw * 2, 1); }
    g.fillStyle = '#e0e0d8'; for (const [x, y] of [[cx - 5, cy - 5], [cx + 4, cy - 5], [cx - 5, cy + 4], [cx + 4, cy + 4]]) g.fillRect(x, y, 1, 1);
  }
}
async function apriVentola() {
  const f = FC();
  if (f.ventolaAperta) return say(hero, 'La griglia è già tolta.');
  await walkTo(hero, 206, 110); hero.dir = 'up';
  hero.pose = 'reach'; for (let i = 0; i < 4; i++) { SFX.clack(); await wait(250); } hero.pose = 'stand';
  f.ventolaAperta = true;
  addScore('ventolaAperta', 15);
  await say(hero, 'Quattro viti, via la griglia... e dentro: gusci di noce! Un ghiro ci aveva fatto la dispensa.');
}
async function togliGusci() {
  const f = FC();
  if (!f.ventolaAperta) return say(hero, "C'è la griglia davanti. Prima la svito.");
  if (f.gusciTolti) return say(hero, 'È già pulita. Pulitissima. Mai stata così pulita.');
  await walkTo(hero, 206, 110); hero.dir = 'up';
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  f.gusciTolti = true;
  for (let i = 0; i < 10; i++) addParticle({ x: 200 + Math.random() * 6, y: 42, vx: (Math.random() - 0.5) * 30, vy: -10, g: 160, life: 1.2, c: pick(['#8a6a3a', '#a07e48', '#6e5228']), ground: 100 + Math.random() * 6 });
  addScore('gusci', 20);
  await say(hero, 'Via i gusci. Le pale adesso si muovono... ma cigolano come la porta di un film horror.');
}
async function sprayVentola() {
  const f = FC();
  if (!f.ventolaAperta) return say(hero, 'Prima tolgo la griglia, sennò spruzzo la griglia.');
  if (!f.gusciTolti) return say(hero, 'Prima tolgo quei gusci, sennò lo spray li incolla per sempre.');
  if (f.ventolaOk) return say(hero, 'Ha già bevuto abbastanza.');
  await walkTo(hero, 206, 110); hero.dir = 'up';
  hero.pose = 'reach'; SFX.pour(); await wait(700); hero.pose = 'stand';
  f.ventolaOk = true; SFX.sawRev(0.3); await wait(400); SFX.sawOff();
  addScore('ventolaOk', 20);
  await say(hero, 'Fssst... vrrrrr! Gira! Supporto tecnico, ti devo una birra.');
}

/* ---------- si accende il caminetto ---------- */
async function lightFire() {
  const f = Game.flags;
  if (f.caminettoAcceso) return say(hero, 'Il fuoco è già acceso. Altra legna e qui si cuociono anche le pareti.');
  if (Game.chapter === 2 && !f.ventolaOk) return say(hero, 'Prima la ventola: senza, il caldo resta nel camino e noi in maglione. Parola di ' + socioNome() + '.');
  await walkTo(hero, 206, 110); hero.dir = 'up';
  hero.pose = 'reach'; SFX.thud(); takeItem('legna'); await wait(500); hero.pose = 'stand';
  await say(hero, "Ciocchi nel caminetto, un po' di giornale sotto...");
  await say(hero, '...e un fiammifero. Uno solo. Come un vero montanaro.');
  SFX.clack(); f.caminettoAcceso = true;
  await wait(900);
  addScore('caminetto', 30);
  await say(hero, 'FUOCO! E la ventola spinge il caldo in tutta la stanza.');
  await say(hero, 'Caldo per tutti e fuoco per cucinare. Stasera polenta.');
  if (Game.chapter !== 2) return;
  await say(hero, "Baita calda. Prima di cena, però... Luciano voleva che vedessimo l'orrido Rascie.");
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(2);
}

/* ---------- la stanza ---------- */
const ROOM_CAMINETTO = {
  id: 'caminetto', title: 'Stanza del caminetto', width: CAW,
  links: { salone: 'portaSaloneC' },
  spawn: [160, 138],
  walk: [[94, 104], [118, 104], [118, 133], [202, 133], [202, 108], [226, 108], [262, 124], [262, 141], [24, 141]],
  scaleAt(y) { return clamp(0.84 + (y - 104) / 37 * 0.16, 0.84, 1); },
  init() {},
  enter() {},
  drawBack(g, cam) { g.drawImage(dayNightBg(this, paintCaminetto), -cam, 0); },
  darkness() { return isNight() ? 0.55 : 0; },
  darkTint: '24,12,4',
  lights() {
    const L = [{ x: 160, y: 22, r: 110, a: 0.85, tint: 'rgba(255,190,110,0.10)' }];
    if (Game.flags.caminettoAcceso) L.push({ x: 203, y: 90, r: 80 * (0.9 + Math.random() * 0.1), a: 0.9, tint: 'rgba(255,120,40,0.20)' });
    L.push({ x: hero.x, y: hero.y - 26, r: 28, a: 0.4 });
    return L;
  },
  objects() {
    const list = [
      { y: 61, draw: drawVentola },
      { y: 107, draw: g => g.drawImage(caminettoWickerCanvas(), 228, 72) },
      { y: 139, draw: g => g.drawImage(caminettoRadioCanvas(), 278, 88) },
      { y: 132, draw: g => g.drawImage(caminettoTableCanvas(), 108, 104) },
    ];
    if (Game.flags.caminettoAcceso) list.push({ y: 101, draw: g => {
      for (let x = 192; x < 214; x++) {
        const h = 4 + Math.round((Math.sin(x * 1.3 + Game.t * 8) + Math.sin(x * 0.6 - Game.t * 5)) * 2 + 3);
        g.fillStyle = '#e8601a'; g.fillRect(x, 96 - h, 1, h);
        g.fillStyle = '#ffc040'; g.fillRect(x, 96 - Math.max(1, h - 4), 1, Math.max(1, h - 4));
      }
    } });
    return list;
  },
  update(dt) {
    if (Game.flags.caminettoAcceso && Math.random() < dt * 5) addParticle({ x: 195 + Math.random() * 16, y: 86, vx: (Math.random() - 0.5) * 8, vy: -14 - Math.random() * 8, life: 0.8, c: Math.random() < 0.5 ? '#ffb040' : '#ff6020', fade: true });
  },
  hotspots: [],
};
ROOMS.caminetto = ROOM_CAMINETTO;

ROOM_CAMINETTO.hotspots = [
  { id: 'muroCaminetto', name: 'Muro', rects: [[0, 0, 320, 100]], hint: false,
    verbs: { guarda: () => say(hero, "Stucco a spatola color crema. L'ha fatto Luciano nel 1983, in un pomeriggio, con grande entusiasmo.") } },
  { id: 'soffittoC', name: 'Soffitto', rects: [[60, 0, 200, 30]], hint: false,
    verbs: { guarda: () => say(hero, 'Il soffitto è così basso che il lampadario quasi ti accarezza la testa. Stanza piccola, stanza calda.') } },
  { id: 'pavimentoC', name: 'Pavimento', rects: [[0, 100, 320, 44]], hint: false,
    verbs: { guarda: () => say(hero, 'Cotto e un tappeto rosso. Il tappeto nasconde una macchia. La macchia nasconde una storia.') } },
  { id: 'lampadario', name: 'Lampadario', rects: [[152, 0, 18, 21]],
    verbs: { guarda: () => say(hero, 'Un lampadario di vetro ambrato, appeso basso sopra il tavolo. Fa una luce da film degli anni settanta.') } },
  { id: 'quadroC', name: 'Quadro', rects: [[64, 40, 26, 32]], walk: [96, 112], face: 'left',
    verbs: { guarda: () => say(hero, "Un paesaggio sfocato. O il pittore lo voleva così, o aveva bevuto quello che c'è nel salone.") } },
  { id: 'finestraC', name: 'Finestra', rects: [[112, 36, 42, 36]], walk: [110, 106], face: 'up',
    verbs: {
      guarda: () => say(hero, isNight() ? 'Una finestra con le tendine di pizzo. Fuori è buio pesto: sembra un film dell\'orrore. Dell\'orrido, anzi.' : 'Una finestra con le tendine di pizzo, sopra il divano. Fuori c\'è il prato, e un ghiro che fa finta di niente.'),
      apri: () => say(hero, 'Per aprirla dovrei salire in piedi sul divano a fiori. Con le scarpe. Luciano non lo saprà mai, ma io sì.'),
    } },
  { id: 'divanoFiori', name: 'Divano a fiori', rects: [[98, 74, 80, 26]], walk: [110, 106], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il divano a fiori, incastrato tra il muro e il tavolo. Così morbido che ti risucchia. Vent\'anni fa ci è sparito Pepi: riemerso a Pasqua.'),
      usa: () => say(hero, 'Se mi siedo mi addormento. E se mi addormento, qualcuno mi disegna una faccia sul cuscino.'),
    } },
  { id: 'caminetto', name: 'Caminetto', rects: [[178, 64, 56, 40], [188, 30, 30, 10]], walk: [212, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, Game.flags.caminettoAcceso ? 'Il fuoco scoppietta. Ci si scalda e ci si cucina. In una stanza così piccola, in dieci minuti si sta in maglietta.' : 'Il caminetto in pietra, nell\'angolo. Spento. Dentro solo cenere, due ceppi neri e un tappo di sughero.'),
      usa: () => say(hero, Game.flags.caminettoAcceso ? 'Mi scaldo le mani. Ahhh. Ora sì che è montagna.' : 'Per accenderlo serve la legna. E io so bene quanto costa la legna, qui.'),
      apri: () => say(hero, 'Non ha uno sportello. È un caminetto vecchia scuola: fuoco, fumo e preghiere.'),
    },
    use: { legna: () => lightFire(), '*': () => say(hero, 'Nel caminetto ci va la legna. Solo la legna.') } },
  { id: 'mensola', name: 'Mensola', rects: [[178, 40, 52, 24]], walk: [212, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, "Rose rosse finte, una foto di gente che ride e un candeliere. Le rose sono finte da trent'anni e non appassiscono mai."),
      raccogli: () => say(hero, 'Le rose finte di Luciano? Mi seguirebbe fino in città.'),
    } },
  { id: 'ventola', name: () => FC().ventolaAperta ? 'Ventola' : 'Griglia della ventola', rects: [[194, 31, 18, 18]], walk: [206, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, !FC().ventolaAperta ? 'Una ventola rotonda sul camino: spinge il caldo nella stanza.' + (FC().ventolaOk ? '' : ' Adesso non gira.')
        : !FC().gusciTolti ? "Dentro la ventola c'è un nido di gusci di noce. Il ghiro è arrivato anche qui."
        : FC().ventolaOk ? 'Gira che è una meraviglia.' : 'Pulita, ma le pale sono dure. Cigolano.'),
      apri: () => FC().ventolaAperta ? say(hero, 'La griglia è già tolta.') : say(hero, hasItem('cacciavite') ? 'Ci vuole il cacciavite: lo uso sulla griglia.' : 'Quattro viti belle strette. Serve un cacciavite.'),
      raccogli: () => togliGusci(),
      tira: () => togliGusci(),
      usa: () => say(hero, FC().ventolaOk ? 'Gira che è una meraviglia.' : 'Premo il pulsante... trrr... e muore. Come diceva ' + socioNome() + '.'),
    },
    use: { cacciavite: () => apriVentola(), spray: () => sprayVentola(), legna: () => say(hero, 'La legna va nel caminetto, non nella ventola.'), '*': () => say(hero, 'Nella ventola? No.') } },
  { id: 'vimini', name: 'Divanetto di vimini', rects: [[228, 70, 46, 40]], walk: [226, 114], face: 'right',
    verbs: {
      guarda: () => say(hero, 'Un divanetto di vimini col cuscino a fiori. Scricchiola anche se lo guardi.'),
      usa: () => say(hero, 'Lo provo... CRAC. Va bene, resto in piedi.'),
    } },
  { id: 'radio', name: 'Radio antica', rects: [[278, 88, 30, 52]], walk: [258, 134], face: 'right',
    verbs: {
      guarda: () => say(hero, 'Una radio a valvole tutta in legno. Prende una stazione sola: le previsioni del tempo del 1962.'),
      usa: () => say(hero, "Brrzzz... '...domani sereno su tutto l'arco alpino...' Clic. Si è spenta da sola."),
      apri: () => say(hero, 'Dentro ci sono valvole, polvere e il nido di qualcosa. Richiudo.'),
    } },
  { id: 'tavoloCarte', name: 'Tavolo', rects: [[108, 100, 104, 32]], walk: [160, 137], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il tavolo in mezzo alla stanza, con la tovaglia a quadretti verdi: un gioco da tavolo, un boccale, un portatile e qualche carta. La partita è sospesa: nessuno ricorda chi stava vincendo.'),
      raccogli: () => say(hero, 'Se tocco le cose di una partita in corso, se ne accorgono. Se ne accorgono sempre.'),
      usa: () => say(hero, 'Giocare da solo? Vincerei, ma non avrebbe gusto.'),
    } },
  { id: 'portaSaloneC', name: 'Porta del salone', rects: [[22, 26, 38, 108]], walk: [44, 134], face: 'left', exit: true,
    verbs: {
      guarda: () => say(hero, 'La porta che torna nel salone.'),
      vai: () => goToRoom(ROOMS.salone, 495, 120, 'left'),
      apri: () => goToRoom(ROOMS.salone, 495, 120, 'left'),
    } },
];
