'use strict';
/* =========================================================
   CAPITOLO 2 - STANZA 1: IL GUADO PEPI (di notte)
   Enigma: trovare due travi e costruire un passaggio sul torrente
   ========================================================= */
const GW = 480;
const NIGHT = {
  leaves: ['#3a2414', '#5a3418', '#7a4a20', '#9a5a24', '#b8702c', '#c89a30'],
  rock: ['#6a6862', '#7e7c76', '#9a9890', '#b4b2aa'],
  conglo: ['#5e564e', '#6e665e', '#7e766c', '#8e867a'],
  pebble: ['#b8b0a4', '#a49a8c', '#c8c0b2', '#8a8074'],
  moss: ['#2e4220', '#3e5228', '#56702e'],
  water: ['#a8a0a8', '#b4aab0', '#c4bab6', '#d2c8c0', '#e0d8d0'],
  wleaf: ['#c8641e', '#9a4a18', '#e09a30', '#6a3414'],
};

function paintNightSky(b, w, h, seed) {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) b.d[y * w + x] = col(ramp(['#060a1c', '#0a1230', '#101a40', '#16224a'], y / h, x, y));
  const r = rng(seed);
  for (let i = 0; i < w * h / 60; i++) { const x = r() * w | 0, y = r() * h | 0; b.set(x, y, r() < 0.2 ? '#ffffff' : r() < 0.5 ? '#a8c0ff' : '#5a6a9a'); }
}
function leafLitter(x, y) {
  const h = hash2(x, y, 300);
  if (h < 0.08) return NIGHT.leaves[5];
  return ramp(NIGHT.leaves, clamp(vnoise(x / 2.5, y / 2, 301) * 0.8 + h * 0.3, 0, 0.999), x, y);
}
function rockShader(pal, seed) {
  return (x, y) => {
    const m = fbm(x / 6, y / 5, seed, 3);
    if (m > 0.62) return ramp(NIGHT.moss, (m - 0.62) * 2.6, x, y);
    return ramp(pal, clamp(vnoise(x / 3, y / 3, seed + 1) * 0.7 + 0.15 + (hash2(x, y, seed) - 0.5) * 0.2, 0, 0.999), x, y);
  };
}

function paintGuado() {
  const b = new Buf(GW, SH);
  const r = rng(777);
  paintNightSky(b, GW, 50, 9);
  // luna
  b.ellipse(62, 12, 5, 5, '#f0ecd8'); b.ellipse(64, 11, 4, 4, '#dcd8c4');
  // bosco scuro sullo sfondo
  b.rect(0, 22, GW, 82, (x, y) => ramp(['#0c100c', '#121810'], hash2(x, y, 5), x, y));
  for (let i = 0; i < 70; i++) {
    const x = r() * GW | 0, w = 2 + (r() * 5 | 0), top = r() * 30 | 0;
    b.rect(x, top, w, 104 - top, (px, py) => px === x ? '#4a423a' : ramp(['#1e1a16', '#2a2620', '#3a332c'], hash2(px, py >> 2, 6), px, py));
  }
  for (let i = 0; i < 160; i++) {
    const x = r() * GW, y = r() * 34, rad = 4 + r() * 8;
    const pal = r() < 0.3 ? ['#2a1a0e', '#4a2a14', '#5a3418'] : ['#0e140c', '#141c12', '#1c2418'];
    b.ellipse(Math.round(x), Math.round(y), Math.round(rad), Math.round(rad * 0.6), (px, py) => hash2(px, py, 7) < 0.15 ? null : ramp(pal, hash2(px, py, 8), px, py));
  }
  // pendii di foglie
  b.poly([[0, 96], [120, 92], [200, 98], [330, 96], [480, 90], [480, 144], [0, 144]], leafLitter);
  // sentiero (riva vicina e riva lontana)
  b.poly([[0, 118], [60, 116], [140, 118], [176, 122], [176, 136], [120, 140], [0, 142]], (x, y) => hash2(x, y, 310) < 0.25 ? leafLitter(x, y) : ramp(['#4e4236', '#5e5040', '#6e5e4a'], hash2(x, y, 311), x, y));
  b.poly([[326, 120], [400, 116], [480, 114], [480, 138], [400, 140], [326, 136]], (x, y) => hash2(x, y, 312) < 0.25 ? leafLitter(x, y) : ramp(['#4e4236', '#5e5040', '#6e5e4a'], hash2(x, y, 313), x, y));
  // masso conglomerato con la cascatella
  const boulder = [[212, 112], [206, 86], [214, 62], [230, 44], [254, 34], [278, 38], [298, 54], [308, 80], [306, 112]];
  b.poly(boulder, (x, y) => {
    const m = fbm(x / 7, y / 6, 320, 3);
    if (m > 0.66 && y > 70) return ramp(NIGHT.moss, (m - 0.66) * 3, x, y);
    return ramp(NIGHT.conglo, clamp(vnoise(x / 4, y / 4, 321) * 0.8 + (x - 210) / 100 * 0.3, 0, 0.999), x, y);
  });
  for (let i = 0; i < 90; i++) {
    const x = 214 + r() * 90, y = 40 + r() * 70;
    if (!pointInPoly(x, y, boulder)) continue;
    const rr = 1 + (r() * 2 | 0);
    b.ellipse(Math.round(x), Math.round(y), rr + 1, rr, pick2(r, NIGHT.pebble));
    b.set(Math.round(x) - 1, Math.round(y) - 1, '#d8d0c4');
  }
  b.line(262, 70, 262, 104, '#3a3430'); b.line(268, 72, 268, 106, '#3a3430'); // solco bagnato
  // sassi grigi intorno al masso
  for (const [x, y, rx, ry] of [[200, 104, 12, 7], [318, 102, 12, 8], [190, 96, 8, 5], [334, 96, 9, 6]]) b.ellipse(x, y, rx, ry, rockShader(NIGHT.rock, 330 + x));
  // pozza d'acqua lattiginosa
  const pool = [[176, 106], [214, 104], [306, 104], [326, 108], [334, 144], [168, 144]];
  b.poly(pool, (x, y) => {
    // acqua lattiginosa: più chiara vicino alla cascatella, più scura ai bordi, con increspature
    const edge = clamp(Math.abs(x - 252) / 90, 0, 1);
    let t = 0.66 + vnoise(x / 9, y / 4, 340) * 0.34 - (y - 104) / 100 - edge * 0.18 + (Math.abs(x - 262) < 22 && y < 118 ? 0.3 : 0);
    if (((y + Math.round(Math.sin(x / 6 + y) * 1.5)) % 6) === 0) t -= 0.16;
    if (((y * 3 + x) % 23) === 0 && y > 110) t += 0.3;
    return ramp(['#5a5660', '#7a7480', ...NIGHT.water], clamp(t, 0, 0.999), x, y);
  });
  // foglie e rametti galleggianti
  for (let i = 0; i < 420; i++) {
    const x = 170 + r() * 166, y = 104 + r() * 40;
    if (!pointInPoly(x, y, pool)) continue;
    const c = pick2(r, NIGHT.wleaf);
    b.set(x, y, c); if (r() < 0.6) b.set(x + 1, y, c); if (r() < 0.3) b.set(x, y + 1, hexMix(c, '#000000', 0.3));
  }
  for (const [x0, y0, x1, y1] of [[180, 118, 214, 112], [290, 130, 320, 122], [196, 136, 226, 140], [300, 112, 316, 116]]) b.line(x0, y0, x1, y1, '#2a2018');
  // masso in mezzo al torrente
  b.ellipse(249, 126, 14, 6, rockShader(NIGHT.rock, 350));
  b.rect(236, 125, 27, 1, '#cfccc4');
  // rocce muschiose sulle rive
  b.ellipse(176, 138, 14, 9, rockShader(NIGHT.rock, 360));
  b.ellipse(330, 134, 14, 10, rockShader(NIGHT.rock, 361));
  b.ellipse(12, 140, 22, 10, rockShader(NIGHT.rock, 362));
  // sassi bianchi sparsi
  for (let i = 0; i < 26; i++) { const x = r() * GW | 0, y = 116 + (r() * 26 | 0); if (pointInPoly(x, y, pool)) continue; b.ellipse(x, y, 2, 1, '#a8a49c'); b.set(x - 1, y - 1, '#cfccc4'); }
  // foglie verdi (rovi e ortiche)
  for (const [cx, cy] of [[150, 112], [340, 112], [420, 104], [96, 108], [470, 120]]) {
    for (let i = 0; i < 18; i++) { const x = cx + (r() - 0.5) * 22, y = cy + (r() - 0.5) * 10; b.ellipse(Math.round(x), Math.round(y), 2, 1, r() < 0.5 ? '#4a8a2a' : '#6aaa3a'); }
  }
  // rami d'abete in alto a destra
  for (let i = 0; i < 6; i++) {
    const y0 = 50 + i * 10;
    for (let x = 400 + i * 4; x < 480; x++) { const yy = y0 + Math.round((x - 400) * 0.25); b.set(x, yy, '#1e3a24'); if ((x + i) % 3 === 0) { b.set(x, yy + 1, '#2a4a2e'); b.set(x - 1, yy + 2, '#2a4a2e'); } }
  }
  // albero a sinistra (dove è appoggiato il ramo)
  b.rect(4, 0, 9, 124, (x, y) => ramp(['#2a2620', '#3a332c', '#4e463c'], (x - 4) / 9 + hash2(x, y >> 2, 370) * 0.3, x, y));
  // cartello del sentiero
  b.rect(57, 86, 3, 34, '#5a3c22'); b.rect(57, 86, 1, 34, '#7a5634');
  b.rect(44, 82, 30, 9, '#c8a878'); b.rect(44, 82, 30, 1, '#e0c898'); b.rect(44, 90, 30, 1, '#8a6a40');
  b.rect(46, 84, 5, 5, '#d02020'); b.rect(47, 85, 3, 3, '#f0f0f0'); b.rect(47, 86, 3, 1, '#d02020');
  for (let x = 53; x < 68; x += 2) b.set(x, 86, '#3a2414');
  b.rect(68, 85, 3, 3, '#3a2414'); b.set(71, 86, '#3a2414');
  // segno di vernice sul masso
  b.rect(226, 92, 6, 2, '#d02020'); b.rect(226, 94, 6, 2, '#e8e8e0'); b.rect(226, 96, 6, 2, '#d02020');
  // tronco marcio
  b.rect(40, 126, 52, 9, (x, y) => {
    if (hash2(x, y, 380) < 0.12) return '#2a1e14';
    return ramp(['#3a2a1c', '#4e3a26', '#5e4630', '#56702e'], clamp((y - 126) / 9 * -1 + 0.8 + (fbm(x / 4, y / 2, 381) > 0.6 ? 0.4 : 0), 0, 0.999), x, y);
  });
  b.ellipse(40, 130, 3, 4, '#8a6a44'); b.ellipse(40, 130, 1, 2, '#5a3e24');
  return b.canvas();
}
function pick2(r, arr) { return arr[(r() * arr.length) | 0]; }

/* ---------- oggetti dinamici ---------- */
const beamWater = { x: 200, y: 112 };
function branchesCanvas() {
  return canvasOf('ramaglia|' + !!Game.flags.branchesMoved, 64, 30, b => {
    const r = rng(Game.flags.branchesMoved ? 92 : 91);
    const n = Game.flags.branchesMoved ? 26 : 44;
    for (let i = 0; i < n; i++) {
      let x0, y0;
      if (Game.flags.branchesMoved) { x0 = 2 + r() * 26; y0 = 18 + r() * 10; }
      else { x0 = 6 + r() * 50; y0 = 6 + r() * 20; }
      const a = r() * Math.PI, len = 8 + r() * 14;
      b.line(x0, y0, x0 + Math.cos(a) * len, y0 - Math.sin(a) * len * 0.5, r() < 0.5 ? '#3a2a1a' : '#5a4228');
      if (r() < 0.5) b.set(x0 + Math.cos(a) * len * 0.5, y0 - Math.sin(a) * len * 0.25 - 1, pick2(r, NIGHT.leaves));
    }
    if (!Game.flags.branchesMoved) { b.rect(48, 21, 8, 4, '#8a6a40'); b.rect(48, 21, 8, 1, '#a8885a'); b.rect(54, 21, 2, 4, '#c8a070'); }
  });
}
function plankCanvas(key, len, slope) {
  return canvasOf('plank|' + key, len + 2, 10, b => {
    for (let i = 0; i <= len; i++) {
      const y = 4 + Math.round(i * slope);
      b.set(i, y, '#c0956a'); b.set(i, y + 1, (i % 7) ? '#9a7044' : '#7a5434'); b.set(i, y + 2, '#6a4626'); b.set(i, y + 3, '#3a2414');
    }
  });
}

/* ---------- script ---------- */
async function placeBeam(id) {
  const f = Game.flags;
  if (!f.beam1) {
    await walkTo(hero, 166, 127); hero.dir = 'right';
    hero.pose = 'reach'; await wait(300); SFX.thud(); takeItem(id); f.beam1 = true; await wait(300); hero.pose = 'stand';
    await say(hero, 'Prima trave: dalla riva al masso in mezzo. Regge!');
    addScore('posa1', 10);
    if (!hasItem('trave1') && !hasItem('trave2')) await say(hero, "Me ne serve un'altra per arrivare all'altra sponda.");
  } else if (!f.beam2) {
    await walkTo(hero, 246, 127); hero.dir = 'right';
    hero.pose = 'reach'; await wait(300); SFX.thud(); takeItem(id); f.beam2 = true; await wait(300); hero.pose = 'stand';
    await say(hero, 'Seconda trave! Il ponte Kodo è ufficialmente inaugurato.');
    addScore('posa2', 10);
  } else return say(hero, 'Il ponte è già fatto. Due travi bastano e avanzano.');
}
async function hookBeam() {
  const f = Game.flags;
  if (f.beamHooked) return say(hero, "L'ho già ripescata.");
  await walkTo(hero, 166, 127); hero.dir = 'right';
  await say(hero, 'Allungo il ramo... ancora un po\'...');
  hero.pose = 'reach'; ROOM_GUADO.hooking = true; SFX.splash();
  await tween(beamWater, { x: 132, y: 133 }, 1400);
  ROOM_GUADO.hooking = false; hero.pose = 'stand';
  f.beamHooked = true;
  await say(hero, 'Presa! La trave è sulla riva. E io ho solo un piede bagnato.');
  addScore('trave2', 15);
}
async function guadoIntro() {
  hero.x = 24; hero.y = 128; hero.dir = 'right';
  banner("CAPITOLO 2: La notte dell'orrido", 4);
  await wait(1200);
  await walkTo(hero, 74, 128);
  await say(hero, 'Il guado Pepi. Di notte. Bella idea, Luciano.');
  await say(hero, "Non vedo niente. Per fortuna mi sono portato la frontale.");
}

const ROOM_GUADO = {
  id: 'guado', title: 'Guado Pepi', width: GW,
  links: { orrido: 'sentieroOrrido' },
  spawn: [74, 128],
  walk() {
    const f = Game.flags;
    if (f.beam2) return [[6, 116], [100, 112], [172, 112], [172, 123], [328, 123], [328, 112], [476, 110], [476, 142], [328, 142], [328, 131], [172, 131], [172, 142], [6, 142]];
    if (f.beam1) return [[6, 116], [100, 112], [172, 112], [172, 123], [252, 123], [252, 131], [172, 131], [172, 142], [6, 142]];
    return [[6, 116], [100, 112], [172, 112], [172, 142], [6, 142]];
  },
  scaleAt(y) { return clamp(0.86 + (y - 110) / 32 * 0.14, 0.86, 1); },
  _ready: false, hooking: false,
  init() { if (this._ready) return; this.bg = paintGuado(); this._ready = true; },
  enter(isNew) {
    if (Game.flags.beamHooked) { beamWater.x = 132; beamWater.y = 133; } else { beamWater.x = 200; beamWater.y = 112; }
    if (isNew) runScript(guadoIntro);
  },
  darkness() { return 0.9; },
  lights() {
    const L = [{ x: 62, y: 10, r: 40, a: 0.5 }];
    if (Game.flags.lampOn) L.push(...heroLights(72, 'rgba(150,170,255,0.10)'));
    else L.push({ x: hero.x, y: hero.y - 26, r: 26, a: 0.55 });
    return L;
  },
  drawBack(g, cam) { g.drawImage(this.bg, -cam, 0); },
  objects() {
    const f = Game.flags, list = [];
    // cascatella e acqua animata
    list.push({ y: 104, draw: g => {
      for (let y = 78; y < 112; y++) {
        const k = ((y + Game.t * 30) | 0) % 6;
        g.fillStyle = k < 2 ? '#f0ece8' : k < 4 ? '#d8d2cc' : '#b8b0a8';
        g.fillRect(259 + ((y >> 3) & 1), y, 2, 1); g.fillRect(266, y + 2, 2, 1);
      }
      for (let i = 0; i < 14; i++) {
        const x = 250 + ((i * 37 + Game.t * 9) % 40), y = 108 + (i * 13) % 8;
        g.fillStyle = (i + ((Game.t * 4) | 0)) % 3 ? '#ece8e4' : '#cfc8c0'; g.fillRect(x | 0, y, 2, 1);
      }
      for (let i = 0; i < 10; i++) {
        const x = 180 + ((i * 53 + Game.t * 6) % 150), y = 112 + (i * 17) % 30;
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x | 0, y, 3, 1);
      }
    } });
    if (!f.ramoTaken) list.push({ y: 124, draw: g => { g.fillStyle = '#6a4a2a'; for (let y = 64; y < 124; y++) g.fillRect(15 + Math.round((124 - y) * 0.06), y, 2, 1); g.fillStyle = '#8a6a40'; for (let y = 64; y < 124; y += 3) g.fillRect(15 + Math.round((124 - y) * 0.06), y, 1, 1); g.fillRect(17, 64, 3, 1); g.fillRect(19, 62, 1, 2); } });
    list.push({ y: 123, draw: g => g.drawImage(branchesCanvas(), f.branchesMoved ? 84 : 100, 98) });
    if (f.branchesMoved && !f.trave1Taken) list.push({ y: 122.5, draw: g => g.drawImage(plankCanvas('t1', 46, 0.05), 112, 114) });
    if (!f.trave2Taken) list.push({ y: f.beamHooked ? 134 : 113, draw: g => {
      g.drawImage(plankCanvas(f.beamHooked ? 'w2' : 'w1', 38, f.beamHooked ? 0.02 : -0.12), Math.round(beamWater.x), Math.round(beamWater.y) - 5);
      if (this.hooking) { g.strokeStyle = '#6a4a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(hero.x + 8, hero.y - 28); g.lineTo(beamWater.x + 4, beamWater.y - 2); g.stroke(); }
    } });
    if (f.beam1) list.push({ y: 126.5, draw: g => g.drawImage(plankCanvas('b1', 70, -0.03), 170, 121) });
    if (f.beam2) list.push({ y: 126.6, draw: g => g.drawImage(plankCanvas('b2', 74, 0.03), 256, 120) });
    return list;
  },
  update(dt) {
    const f = Game.flags;
    if (f.beam2 && hero.x > 334 && !Game.scored.guado) {
      addScore('guado', 5);
      runScript(() => say(hero, 'Dall\'altra parte! Asciutto. Quasi.'));
    }
    if (Math.random() < dt * 0.5) addParticle({ x: 160 + Math.random() * 300, y: 0, vx: 3, vy: 8, life: 12, c: pick(NIGHT.wleaf), sway: Math.random() * 6, ground: 104 + Math.random() * 38, fade: true });
  },
  hotspots: [],
};
ROOMS.guado = ROOM_GUADO;

const FG = () => Game.flags;
ROOM_GUADO.hotspots = [
  { id: 'cielo', name: 'Cielo stellato', rects: [[0, 0, 480, 22]], hint: false,
    verbs: { guarda: () => say(hero, 'Un cielo pieno di stelle. In città ne vedo tre, e due sono aerei.') } },
  { id: 'luna', name: 'Luna', rects: [[54, 4, 16, 16]],
    verbs: { guarda: () => say(hero, 'La luna. Fa luce quanto un fiammifero bagnato.') } },
  { id: 'bosco2', name: 'Bosco', rects: [[0, 22, 480, 72]], hint: false,
    verbs: { guarda: () => say(hero, 'Il bosco di notte. Ogni ramo che scricchiola è un orso. O un ghiro. Speriamo un ghiro.') } },
  { id: 'sentieroBaita', name: 'Sentiero per la baita', rects: [[0, 100, 16, 42]], walk: [10, 130], face: 'left', exit: true,
    verbs: { vai: () => say(hero, "Tornare indietro? Senza aver visto l'orrido Rascie Luciano non mi rivolge più la parola.") } },
  { id: 'cartello2', name: 'Cartello', rects: [[42, 80, 34, 40]], walk: [62, 126], face: 'up',
    verbs: {
      guarda: () => say(hero, "C'è scritto: 'Orrido Rascie, 20 minuti'. Sotto, a pennarello: 'se non piove'."),
      raccogli: () => say(hero, 'Il cartello resta qui. Senza, il prossimo si perde.'),
    } },
  { id: 'ramo', name: 'Ramo lungo', rects: [[13, 62, 10, 62]], walk: [26, 128], face: 'left', def: 'raccogli', show: () => !FG().ramoTaken,
    verbs: {
      guarda: () => say(hero, "Un ramo lungo e dritto appoggiato all'albero. Ha pure un uncino in cima."),
      raccogli: async () => { hero.pose = 'reach'; await wait(350); hero.pose = 'stand'; FG().ramoTaken = true; giveItem('ramo'); await say(hero, 'Un ramo con l\'uncino. Prima o poi ripesco qualcosa.'); addScore('ramo', 5); },
    } },
  { id: 'tronco', name: 'Tronco marcio', rects: [[38, 124, 56, 12]], walk: [66, 122], face: 'down',
    verbs: {
      guarda: () => say(hero, 'Un tronco tutto muschio e buchi. Più termiti che legno.'),
      raccogli: () => say(hero, 'Lo sollevo... e mi resta in mano un pezzo spugnoso. Per un ponte non va bene.'),
      spingi: () => say(hero, 'Lo spingo e si sbriciola. Le termiti mi guardano male.'),
    } },
  { id: 'ramaglia', name: () => FG().branchesMoved ? 'Rami spostati' : 'Mucchio di rami', rects: () => FG().branchesMoved ? [[84, 112, 32, 14]] : [[100, 100, 60, 26]], walk: [128, 126], face: 'up',
    verbs: {
      guarda: () => say(hero, FG().branchesMoved ? 'Rami secchi, spostati da me. Ordine e disciplina.' : 'Un mucchio di rami secchi. Da sotto spunta qualcosa di squadrato...'),
      raccogli: () => say(hero, 'Sono rami secchi e spinosi. Al massimo li sposto.'),
      spingi: () => ROOM_GUADO.moveBranches(),
      tira: () => ROOM_GUADO.moveBranches(),
    } },
  { id: 'trave1', name: 'Trave di legno', rects: [[112, 112, 48, 10]], walk: [134, 126], face: 'up', def: 'raccogli', show: () => FG().branchesMoved && !FG().trave1Taken,
    verbs: {
      guarda: () => say(hero, 'Una trave di legno vera, squadrata. Qualcuno ci aveva già pensato, prima di me.'),
      raccogli: async () => { hero.pose = 'reach'; await wait(400); hero.pose = 'stand'; FG().trave1Taken = true; giveItem('trave1'); await say(hero, 'Pesa. Ma per un ponte è perfetta.'); addScore('trave1', 10); },
    } },
  { id: 'masso', name: 'Masso del guado', rects: [[206, 34, 102, 70]], hint: false,
    verbs: { guarda: () => say(hero, "Un masso enorme fatto di sassi incollati insieme. Qualcuno ci ha dipinto il segno del sentiero. E sotto: 'GUADO PEPI'.") } },
  { id: 'cascata', name: 'Cascatella', rects: [[254, 70, 18, 38]],
    verbs: {
      guarda: () => say(hero, 'Una piccola cascata esce dal masso. Di notte sembra latte che bolle.'),
      usa: () => say(hero, "Una doccia gelata a mezzanotte? Ho già dato col tubo dell'acqua."),
    } },
  { id: 'torrente', name: 'Guado Pepi', rects: [[176, 104, 156, 40]], walk: [166, 127], face: 'right', def: 'guarda',
    verbs: {
      guarda: () => say(hero, FG().beam2 ? "Il guado Pepi, ora con il ponte Kodo. Ingegneria di montagna." : "Il guado Pepi. Acqua bianca come il latte e gelida. In mezzo c'è un solo masso. Servirebbero delle travi."),
      usa: () => say(hero, FG().beam2 ? 'Il ponte è pronto: basta camminarci sopra.' : 'Attraversare a piedi? Mi bagno fino alle ginocchia. A tre gradi. No.'),
      raccogli: () => say(hero, 'Raccogliere acqua? Non ho nemmeno una borraccia.'),
    },
    use: {
      trave1: () => placeBeam('trave1'),
      trave2: () => placeBeam('trave2'),
      ramo: () => FG().beamHooked ? say(hero, 'Non c\'è altro da ripescare. Solo foglie.') : hookBeam(),
      '*': () => say(hero, "Buttarlo nel torrente non mi aiuta ad attraversare."),
    } },
  { id: 'massoMezzo', name: 'Masso in mezzo al torrente', rects: [[234, 118, 30, 12]], walk: [166, 127], face: 'right',
    verbs: { guarda: () => say(hero, "Un masso piatto in mezzo al guado. Con due travi diventa il pilone di un ponte.") },
    use: { trave1: () => placeBeam('trave1'), trave2: () => placeBeam('trave2') } },
  { id: 'traveAcqua', name: () => FG().beamHooked ? 'Trave bagnata' : 'Trave nel torrente', rects: () => FG().beamHooked ? [[130, 126, 42, 10]] : [[198, 104, 42, 12]],
    walk: () => FG().beamHooked ? [150, 126] : [166, 127], face: 'right', def: 'raccogli', show: () => !FG().trave2Taken,
    verbs: {
      guarda: () => say(hero, FG().beamHooked ? 'La trave ripescata. Bagnata, ma robusta.' : "Una trave incastrata tra i sassi, in mezzo all'acqua. Troppo lontana per prenderla con le mani."),
      raccogli: async () => {
        if (!FG().beamHooked) return say(hero, "È troppo lontana. Dovrei entrare in acqua, e l'acqua è a tre gradi.");
        hero.pose = 'reach'; await wait(400); hero.pose = 'stand'; FG().trave2Taken = true; giveItem('trave2');
        await say(hero, 'Gocciola, ma regge. Seconda trave!');
      },
      tira: () => FG().beamHooked ? say(hero, 'È già sulla riva.') : say(hero, 'Non ci arrivo. Mi servirebbe qualcosa di lungo.'),
    },
    use: { ramo: () => hookBeam() } },
  { id: 'sentieroOrrido', name: "Sentiero per l'orrido", rects: [[448, 70, 32, 72]], walk: [470, 126], face: 'right', exit: true,
    verbs: {
      vai: async () => {
        if (!FG().beam2) return say(hero, "Il sentiero per l'orrido continua dall'altra parte del guado. Prima devo attraversarlo.");
        await goToRoom(ROOMS.orrido, 16, 130, 'right');
      },
    } },
];

ROOM_GUADO.moveBranches = async function () {
  if (Game.flags.branchesMoved) return say(hero, 'Li ho già spostati. Ora sono in ordine alfabetico.');
  hero.pose = 'reach'; SFX.thud(); await wait(500); hero.pose = 'stand';
  Game.flags.branchesMoved = true;
  await say(hero, 'Sposto la ramaglia... e sotto c\'è una trave di legno!');
  addScore('ramaglia', 10);
};
