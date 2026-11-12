'use strict';
/* =========================================================
   IL SALONE: perlinato, corna di cervo, tavolone,
   l'angolo della TV con i videogiochi, scale per la camerata
   ========================================================= */
const SAW = 512;
const SA_FLOOR = { yb: 108, yh: 30, f: 110, vpx: null };

function paintSalone(night) {
  const b = new Buf(SAW, SH);
  const r = rng(6262);

  /* ---- soffitto scuro con travi e strisce LED ---- */
  b.rect(0, 0, SAW, 38, (x, y) => (x % 7 === 0) ? '#100a04' : ramp(['#1a1008', '#22160c', '#2c1e12'], clamp(hash2(x >> 2, y >> 3, 1) * 0.6 + y / 80, 0, 0.999), x, y));
  for (const [y, h] of [[2, 5], [14, 4], [24, 3], [31, 2], [35, 1]]) {
    beamH(b, 0, y, SAW, h, ['#140c06', '#22160c', '#30200f', '#40301c']);
    ledStrip(b, 0, SAW - 1, y + h, 3);
  }
  // botola delle scale
  b.rect(452, 0, 60, 38, (x, y) => ramp(['#060402', '#0e0a06', '#16100a'], (x - 452) / 80 + hash2(x, y, 2) * 0.2, x, y));
  b.rect(452, 0, 2, 38, '#4a3020');
  b.rect(0, 37, SAW, 3, '#2a1608'); b.rect(0, 37, SAW, 1, '#4a2e16');

  /* ---- pareti in perlinato ---- */
  b.rect(0, 40, SAW, 64, pineShader(200, 5));
  b.rect(0, 40, SAW, 2, (x, y) => hexMix(pineShader(200, 5)(x, y), '#000000', 0.35));
  b.rect(0, 104, SAW, 4, (x, y) => y === 104 ? '#7a4a20' : '#4a2a10');

  /* ---- pavimento in cotto ---- */
  b.rect(0, 108, SAW, 36, cottoShader(SA_FLOOR, 201));
  b.rect(0, 108, SAW, 2, (x, y) => hexMix(cottoShader(SA_FLOOR, 201)(x, y), '#000000', 0.35));

  /* porta del portico */
  woodDoor(b, 12, 50, 30, 58, { handleLeft: false });
  b.rect(19, 56, 4, 28, '#2a1608'); b.rect(31, 56, 4, 28, '#2a1608');
  b.rect(20, 57, 2, 26, night ? '#1a2238' : '#c8d8e4'); b.rect(32, 57, 2, 26, night ? '#1a2238' : '#c8d8e4');

  /* trofei di cervo con le palline di Natale */
  const trophy = (c, y0, seed) => {
    b.ellipse(c, y0 + 8, 7, 9, '#2a1608'); b.ellipse(c, y0 + 8, 6, 8, (x, y) => ramp(['#4a2a12', '#5e3818', '#74461e'], clamp(0.6 - (x - c) / 14 - (y - y0) / 40, 0, 0.999), x, y));
    // teschio
    b.poly([[c - 3, y0 + 2], [c + 3, y0 + 2], [c + 2, y0 + 12], [c + 1, y0 + 17], [c - 1, y0 + 17], [c - 2, y0 + 12]], (x, y) => x > c ? '#c8bea8' : '#ece4d0');
    b.set(c - 2, y0 + 5, '#3a2a1a'); b.set(c + 2, y0 + 5, '#3a2a1a'); b.rect(c, y0 + 9, 1, 4, '#a89e88');
    // corna
    const side = s => {
      const pts = [[c + 2 * s, y0 + 1], [c + 7 * s, y0 - 5], [c + 11 * s, y0 - 12], [c + 12 * s, y0 - 19], [c + 9 * s, y0 - 24]];
      for (let i = 0; i + 1 < pts.length; i++) b.thick(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], i < 2 ? 2 : 1, '#d8ccb0');
      b.line(c + 6 * s, y0 - 4, c + 4 * s, y0 - 11, '#d8ccb0');
      b.line(c + 10 * s, y0 - 10, c + 15 * s, y0 - 15, '#d8ccb0');
      b.line(c + 12 * s, y0 - 18, c + 16 * s, y0 - 22, '#cfc2a4');
      for (let i = 0; i + 1 < pts.length; i++) b.line(pts[i][0] + s, pts[i][1] + 1, pts[i + 1][0] + s, pts[i + 1][1] + 1, '#a89878');
    };
    side(-1); side(1);
    // palline e festoni
    const ball = (x, y, c1, c2) => { b.rect(x, y - 3, 1, 3, '#c8c8c8'); b.ellipse(x, y + 1, 2, 2, c1); b.set(x - 1, y, c2); };
    if (seed === 0) ball(c - 11, y0 - 8, '#c8202a', '#ff8a8a');
    if (seed === 1) { ball(c + 12, y0 - 12, '#2a5ac8', '#9ac0ff'); ball(c - 7, y0 - 3, '#c8202a', '#ff8a8a'); }
    if (seed === 2) for (let i = 0; i < 12; i++) b.set(c - 6 + i, y0 - 6 + Math.round(Math.sin(i * 0.9) * 2), i % 2 ? '#e83a3a' : '#ff9a6a');
  };
  trophy(62, 66, 0); trophy(98, 64, 1); trophy(134, 66, 2);

  /* quadro del lago al tramonto */
  picture(b, 144, 44, 48, 28, true, (x0, y0, w, h) => {
    b.rect(x0, y0, w, h, (x, y) => {
      const t = (y - y0) / h;
      const ridge = y0 + h * 0.45 + Math.sin((x - x0) / 5) * 2 + Math.sin((x - x0) / 2.3) * 1;
      if (t < 0.5 && y < ridge) return ramp(['#8a7aa8', '#c49ab0', '#f0b890', '#f8d8a0'], clamp(t * 2.2, 0, 0.999), x, y);
      if (y < y0 + h * 0.55) return ramp(['#4a3a6a', '#5e4a7a'], hash2(x, y, 3), x, y);
      return ramp(['#6a5a8a', '#a088a8', '#e0b0a0'], clamp(1 - (y - y0 - h * 0.55) / (h * 0.45) + (((x + y) % 5) === 0 ? 0.2 : 0), 0, 0.999), x, y);
    });
    b.rect(x0 + 26, y0 + 16, 3, 1, '#ffffff'); b.set(x0 + 28, y0 + 15, '#ffffff'); b.set(x0 + 28, y0 + 14, '#ffffff');
    b.line(x0 + 2, y0 + h - 1, x0 + 7, y0 + h - 9, '#2a1e2a'); b.line(x0 + 5, y0 + h - 5, x0 + 10, y0 + h - 8, '#2a1e2a');
  });
  // bocchetta tonda
  b.ellipse(204, 52, 4, 4, '#e8e4dc'); for (let y = 49; y <= 55; y += 2) b.rect(201, y, 7, 1, '#a8a49c');

  /* tavolone con bottiglie e bicchierini */
  const tableTop = (x, y) => ramp(['#8a5424', '#a4682e', '#bc7c3a', '#cc8e48'], clamp(0.4 + vnoise(x / 9, y, 4) * 0.5, 0, 0.999), x, y);
  b.rect(50, 90, 166, 3, tableTop);
  b.rect(50, 93, 166, 3, (x, y) => hexMix(tableTop(x, y), '#000000', 0.35));
  for (const lx of [54, 132, 210]) b.rect(lx, 96, 3, 14, '#5a3416');
  b.rect(56, 101, 150, 3, '#7a4a20'); b.rect(56, 101, 150, 1, '#9a6230'); for (const lx of [60, 130, 200]) b.rect(lx, 104, 2, 6, '#4a2a10');
  const bottle = (x, h, c, label) => { b.rect(x, 91 - h, 4, h, c); b.rect(x + 1, 91 - h - 4, 2, 4, c); b.set(x + 1, 92 - h, hexMix(c, '#ffffff', 0.4)); if (label) b.rect(x, 91 - h + 3, 4, 3, label); };
  bottle(58, 12, '#5a2e10', '#e8dcc0'); bottle(86, 13, '#1e4a1e', '#e8d8a0'); bottle(132, 15, '#1e3a1e', '#c8b070'); bottle(166, 12, '#c8d8d8', '#ffffff');
  b.rect(94, 72, 7, 19, '#3a1a0a'); b.rect(95, 69, 5, 3, '#c8c8c8'); b.rect(94, 78, 7, 5, '#d02a2a'); b.rect(95, 74, 1, 14, '#6a3a1a'); // bottiglione di bibita
  b.rect(72, 74, 8, 17, '#f4f2ec'); b.rect(72, 74, 8, 1, '#ffffff'); for (let y = 77; y < 91; y += 3) b.rect(72, y, 8, 1, '#dedad2'); // rotolo di carta
  b.rect(106, 82, 6, 9, '#a8a49c'); b.rect(106, 82, 6, 1, '#d8d4cc'); b.rect(107, 86, 4, 1, '#3a5a9a'); b.rect(112, 84, 2, 5, '#8a8680');
  b.ellipse(122, 91, 6, 1, '#f4f2ec');
  for (const sx of [66, 116, 142, 147, 186]) { b.rect(sx, 87, 2, 4, '#d8e0e0'); b.set(sx, 89, '#c88a2a'); }
  b.rect(152, 85, 5, 6, '#c8302a'); b.rect(157, 87, 1, 2, '#c8302a');
  b.rect(176, 84, 4, 7, '#2a5aa8'); b.rect(176, 84, 4, 1, '#c8c8c8');
  b.rect(190, 90, 8, 1, '#1a1a1a'); b.rect(200, 86, 8, 5, '#f0ece4');
  // sedia bianca di legno in fondo
  b.rect(212, 76, 2, 34, '#e8e4dc'); b.rect(219, 96, 2, 14, '#c8c4bc'); b.rect(212, 96, 10, 2, '#f4f0e8');
  for (const yy of [80, 86]) b.rect(212, yy, 2, 2, '#d8d4cc');

  /* divano a righe */
  const stripe = (x, y) => {
    const k = (y + ((x >> 2) & 1)) % 9;
    return k < 2 ? '#5a2e12' : k < 4 ? '#c8782a' : k < 6 ? '#e8d4a8' : k < 7 ? '#8a4a1a' : '#a86a30';
  };
  b.rect(224, 82, 42, 16, stripe);
  b.rect(220, 92, 6, 18, stripe); b.rect(264, 92, 6, 18, stripe);
  b.rect(226, 98, 38, 6, (x, y) => hexMix(stripe(x, y), '#ffffff', 0.1));
  b.rect(224, 104, 42, 6, (x, y) => hexMix(stripe(x, y), '#000000', 0.3));
  b.rect(228, 94, 14, 5, '#8a8a90'); b.rect(228, 94, 14, 1, '#a8a8b0');

  /* mobile della TV, casse rosse, televisore, computer */
  const pineLight = (x, y) => ramp(['#a86a2e', '#c0803a', '#d49650', '#e0a862'], clamp(0.35 + vnoise(x / 3, y / 7, 5) * 0.5, 0, 0.999), x, y);
  b.rect(270, 88, 56, 22, pineLight);
  b.rect(270, 88, 56, 1, '#eab878');
  b.rect(273, 91, 50, 8, '#2a1608');
  b.rect(276, 95, 16, 4, '#141414'); b.rect(276, 95, 16, 1, '#2a2a2a'); b.set(289, 97, '#3a8aff');
  b.rect(296, 94, 24, 5, '#7a1e18'); b.rect(296, 94, 24, 1, '#a8342a'); b.rect(298, 92, 20, 2, '#2a5a2a');
  b.rect(273, 100, 24, 9, (x, y) => (x === 284) ? '#7a4a1c' : pineLight(x, y)); b.rect(299, 100, 24, 9, pineLight);
  b.set(282, 104, '#3a2410'); b.set(286, 104, '#3a2410'); b.set(310, 104, '#3a2410');
  for (const sx of [270, 318]) {
    b.rect(sx, 70, 8, 18, (x, y) => ramp(['#8a1410', '#b02018', '#d03028'], clamp(0.6 - (x - sx) / 12, 0, 0.999), x, y));
    b.ellipse(sx + 4, 76, 2, 2, '#1a1a1a'); b.ellipse(sx + 4, 83, 3, 3, '#1a1a1a'); b.set(sx + 4, 83, '#4a4a4a');
  }
  b.rect(280, 60, 36, 26, '#0e0e10'); b.rect(280, 60, 36, 1, '#3a3a3e'); b.rect(294, 86, 8, 2, '#1a1a1c');
  b.rect(330, 80, 14, 30, '#121214'); b.rect(330, 80, 14, 1, '#3a3a40'); b.rect(343, 80, 1, 30, '#2a2a2e');
  for (const fy of [87, 98]) { b.ellipse(337, fy, 4, 4, '#1e4ab8'); b.ellipse(337, fy, 3, 3, '#3a7aff'); b.ellipse(337, fy, 1, 1, '#121214'); }

  /* vetrina con il pizzo e il telo bianco e rosso */
  b.rect(352, 44, 40, 66, '#2a1608'); b.rect(352, 44, 40, 1, '#5a3a1e');
  for (const gx of [355, 373]) {
    b.rect(gx, 47, 16, 38, (x, y) => ((x + y * 2) % 11 === 0) ? '#c8d0d0' : ramp(['#5a4a3a', '#6a5a48', '#7a6a56'], hash2(x >> 1, y >> 2, 6), x, y));
    b.rect(gx + 1, 48, 14, 36, laceShader(7));
    b.rect(gx, 87, 16, 20, (x, y) => ramp(['#2e1a0a', '#3e2412', '#4e2e18'], clamp(0.3 + vnoise(x, y / 6, 8) * 0.5, 0, 0.999), x, y));
    b.rect(gx + 2, 89, 12, 16, '#36200e');
  }
  b.set(370, 66, '#d8c070'); b.set(374, 66, '#d8c070');
  b.poly([[350, 42], [366, 42], [364, 62], [358, 66], [352, 60]], (x, y) => (x + y) % 9 === 0 ? '#dcd6ca' : '#f4f0e6');
  b.line(352, 60, 358, 66, '#c8302a'); b.line(358, 66, 364, 62, '#c8302a');

  /* finestrella in alto con le tendine color crema */
  b.rect(398, 42, 30, 18, '#3a2410');
  b.rect(400, 44, 26, 14, glassShader(night, 9));
  b.rect(400, 44, 9, 14, (x, y) => ((x - 400) % 3 === 0) ? '#c8b888' : '#e8dcb0');
  b.rect(417, 44, 9, 14, (x, y) => ((x - 417) % 3 === 0) ? '#c8b888' : '#e8dcb0');
  b.rect(397, 60, 32, 2, '#6a4422');
  /* cartello scritto a mano */
  b.rect(404, 66, 18, 12, '#f2eee2'); b.rect(404, 66, 18, 1, '#ffffff');
  for (const [yy, c] of [[68, '#c83030'], [70, '#3a4ab0'], [72, '#c83030'], [74, '#3a4ab0']]) for (let x = 406; x < 420; x++) if (hash2(x, yy, 10) < 0.7) b.set(x, yy, c);
  b.rect(404, 66, 2, 1, '#e8e0a0'); b.rect(420, 66, 2, 1, '#e8e0a0');

  /* scale di legno per la camerata */
  const st = pineShader(211, 4, 0.15);
  b.poly([[432, 108], [478, 38], [478, 108]], (x, y) => hexMix(st(x, y), '#000000', 0.3));
  for (let i = 0; i < 9; i++) {
    const x = 432 + i * 5.2, y = 108 - i * 7.8;
    b.rect(Math.round(x), Math.round(y - 8), 50, 2, '#e0a862');
    b.rect(Math.round(x), Math.round(y - 6), 50, 6, (px, py) => ramp(['#8a5424', '#a4682e', '#bc7c3a'], hash2(px >> 3, py, 212), px, py));
    b.rect(Math.round(x), Math.round(y - 6), 1, 6, '#5a3412');
  }
  b.rect(478, 38, 34, 70, (x, y) => hexMix(pineShader(200, 5)(x, y), '#000000', 0.1));
  b.thick(436, 84, 478, 18, 2, '#6a3e18'); b.line(436, 83, 478, 17, '#a86a30');
  for (let i = 0; i < 5; i++) { const x = 440 + i * 9; b.rect(x, 108 - (x - 432) * 1.5 - 22, 1, 22, '#7a4a1e'); }

  /* porta della stanza del caminetto */
  woodDoor(b, 484, 50, 24, 58, { handleLeft: true });
  b.rect(490, 44, 12, 4, '#e8e0c8'); b.rect(491, 45, 10, 2, '#8a2a1a');
  return b.canvas();
}

/* ---------- la TV: un picchiaduro qualunque ---------- */
function drawSaloneTv(g) {
  const x0 = 282, y0 = 62, w = 32, h = 20, t = Game.t;
  g.fillStyle = '#3a2a5a'; g.fillRect(x0, y0, w, 8);
  g.fillStyle = '#6a4a6a'; g.fillRect(x0, y0 + 8, w, 6);
  g.fillStyle = '#8a6a4a'; g.fillRect(x0, y0 + 14, w, 6);
  g.fillStyle = '#a8a8a8'; g.fillRect(x0 + 6, y0 + 4, 4, 10); g.fillRect(x0 + 22, y0 + 4, 4, 10);
  const cycle = t % 6;
  const hp1 = 13 - Math.floor(cycle * 1.4) % 13, hp2 = 13 - Math.floor(cycle * 2.1) % 13;
  g.fillStyle = '#2a2a2a'; g.fillRect(x0 + 1, y0 + 1, 13, 2); g.fillRect(x0 + 18, y0 + 1, 13, 2);
  g.fillStyle = '#f0d020'; g.fillRect(x0 + 1, y0 + 1, hp1, 2); g.fillRect(x0 + 31 - hp2, y0 + 1, hp2, 2);
  const sep = 6 + Math.round(Math.abs(Math.sin(t * 1.7)) * 8);
  const hit = ((t * 3) | 0) % 4 === 0;
  const fx1 = x0 + 16 - sep, fx2 = x0 + 15 + sep, fy = y0 + 18;
  const fighter = (fx, c1, c2, dir, kick) => {
    g.fillStyle = c2; g.fillRect(fx - 1, fy - 10, 3, 3);
    g.fillStyle = c1; g.fillRect(fx - 1, fy - 7, 3, 4);
    g.fillRect(fx - 1, fy - 3, 1, 3); g.fillRect(fx + 1, fy - 3, 1, 3);
    if (kick) g.fillRect(fx + dir, fy - 5, 3 * dir, 1); else g.fillRect(fx + 2 * dir, fy - 7, 2 * dir, 1);
  };
  const sb = Game.flags.sbloccati;
  fighter(fx1, sb ? '#3f5a37' : '#3a6ad8', sb ? '#e8e8e2' : '#e8b890', 1, hit);
  fighter(fx2, sb ? '#8a8078' : '#d83a3a', sb ? '#a89a8a' : '#c89070', -1, !hit && ((t * 3) | 0) % 4 === 2);
  if (hit && sep < 9) { g.fillStyle = '#ffffff'; g.fillRect(x0 + 15, fy - 6, 2, 2); }
  g.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = y0; y < y0 + h; y += 2) g.fillRect(x0, y, w, 1);
}

/* ---------- capitolo 6: la cena e la degustazione ---------- */
const FS = () => Game.flags;
const roleActor = r => npcActor((Game.roles || {})[r]);
const DEGUSTAZIONE = {
  rum: { score: 'rum', offer: 'Rum invecchiato. Senti: vaniglia, caramello e un po\' di pirata.', taste: 'Mmm... dolce, caldo. Pericoloso.' },
  moonshine: { score: 'moonshine', offer: 'Moonshine fatto in casa. Dal cugino di un cugino. Non fare domande.', taste: 'Sa di... trattore. Un trattore buono, però.' },
  gin: { score: 'gin', offer: 'Gin a sessantaquattro gradi. Un sorso solo. Fidati.', taste: null },
};
async function ceneIntro() {
  const f = FS();
  f.ch6Intro = true;
  await wait(600);
  await say(hero, 'La cena! Tutti al tavolone. Costine, pane, e... cosa c\'è in quelle bottiglie?');
  await say(roleActor('rum'), 'Degustazione! Rum, moonshine e gin. Il gin è a sessantaquattro gradi.');
  await say(roleActor('gin'), 'Sessantaquattro. Come gli anni della baita. Più o meno.');
  await say(hero, 'Per una degustazione così servono i bicchieri buoni. Quelli della vetrina.');
  banner('OBIETTIVO: prendi i bicchieri buoni e fai la degustazione: rum, moonshine e gin a 64 gradi.', 5);
}
async function prendiBicchieri() {
  const f = FS();
  if (f.bicchieriPresi) return say(hero, "I bicchieri buoni sono già fuori. La nonna se n'è accorta di sicuro.");
  await walkTo(hero, 372, 120); hero.dir = 'up';
  hero.pose = 'reach'; SFX.creak(); await wait(400); hero.pose = 'stand';
  f.bicchieriPresi = true; giveItem('bicchierini');
  addScore('bicchieri', 25);
  await say(hero, "I bicchieri buoni! Finalmente un'occasione. Aspettavano dal 1987.");
}
async function assaggio(kind, a) {
  const f = FS(), d = DEGUSTAZIONE[kind];
  hero.dir = hero.x < a.x ? 'right' : 'left';
  if (f[kind]) return say(a, kind === 'gin' ? 'Ancora? Sei matto. Mi piaci.' : 'Già assaggiato. Un altro giro dopo, magari.');
  if (!hasItem('bicchierini')) return say(a, 'Prima i bicchieri. Mica beviamo dalla bottiglia. Non ancora.');
  await say(a, d.offer);
  hero.pose = 'reach'; SFX.pour(); await wait(500); hero.pose = 'stand';
  SFX.gulp(); await wait(400);
  if (kind === 'gin') {
    Game.shake = 1.2; Game.flash = 0.6;
    await say(hero, 'SESSANTAQUATTRO GRADIIII!', { big: true, dur: 1600 });
    await say(hero, 'Vedo i suoni. Sento i colori. E la lingua non la sento più.');
  } else await say(hero, d.taste);
  f[kind] = true;
  addScore(d.score, 25);
  if (f.rum && f.moonshine && f.gin) await brindisi();
}
async function brindisi() {
  const others = npcsIn('salone').map(n => n.actor);
  await wait(400);
  await say(hero, 'Un brindisi! Alla baita della figata del mondo!', { big: true, dur: 1800 });
  for (const a of others.slice(0, 4)) { await say(a, pick(['Salute!', 'Cin cin!', 'Alla baita!', 'Prosit!'])); }
  await say(npcActor('latenar') || latenar, 'Sto riposando gli occhi.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(6);
}

/* ---------- capitolo 7: videogiochi e gioco da tavolo ---------- */
async function giochiIntro() {
  const f = FS();
  f.ch7Intro = true;
  await wait(600);
  await say(roleActor('partner'), 'Torneo! Prima Tempo di Crisi con la pistola, in coppia. Poi il picchiaduro.');
  await say(roleActor('opponent'), 'E poi il gioco da tavolo. Dove vinco io. Come sempre.');
  banner('OBIETTIVO: vinci a Tempo di Crisi, sblocca i lottatori segreti e gioca la partita a tavolino.', 5);
}
async function prendiGiochi() {
  const f = FS();
  if (f.giochiPresi) return say(hero, 'Ho già preso pistola, joypad e gioco. Il resto sono cavi.');
  await walkTo(hero, 298, 120); hero.dir = 'up';
  hero.pose = 'reach'; SFX.creak(); await wait(400); hero.pose = 'stand';
  f.giochiPresi = true; giveItem('pistola'); giveItem('joypad'); giveItem('giocoTavolo');
  addScore('giochi', 10);
  await say(hero, 'La pistola della console, un joypad e la scatola sfondata del gioco da tavolo. Si comincia.');
}
async function giocaCrisi() {
  const f = FS();
  if (f.crisiVinta) return say(hero, 'Tempo di Crisi già finito. I ghiri cattivi non si rialzano più.');
  await walkTo(hero, 298, 122); hero.dir = 'up';
  const partner = (Game.roles || {}).partner || 'zac';
  await say(roleActor('partner'), 'Io sono il giocatore due. Tu copri a sinistra, io a destra.');
  await wait(300);
  const win = await playTempoDiCrisi(partner);
  hero.dir = 'down';
  if (!win) return say(hero, 'Game over. I ghiri cattivi ci hanno battuto. Rivincita! Riprovo con la pistola.');
  f.crisiVinta = true;
  addScore('crisi', 30);
  await say(roleActor('partner'), 'Missione compiuta! Squadra perfetta.');
  await fineGiochi();
}
async function leggiCodice() {
  const f = FS();
  if (Game.chapter !== 7) return say(hero, "Un cartello scritto a mano: 'SI PREGA DI...'. Il resto è scarabocchiato. Nessuno sa cosa si debba fare. Nel dubbio, nessuno fa niente.");
  await say(hero, "Il cartello 'SI PREGA DI...'. Sul retro, a matita: 'SU, SU, GIÙ, GIÙ, PUGNO, CALCIO'.");
  if (!f.codiceLetto) { f.codiceLetto = true; addScore('codice', 10); await say(hero, 'Il codice per sbloccare i lottatori segreti! Era qui da anni.'); }
}
async function sbloccaLottatori() {
  const f = FS();
  if (f.sbloccati) return say(hero, 'Lottatori già sbloccati. Luciano contro il ghiro: il match del secolo.');
  await walkTo(hero, 298, 122); hero.dir = 'up';
  if (!f.codiceLetto) return say(hero, 'Dicono che nel picchiaduro ci siano lottatori segreti. Serve un codice. Forse è scritto da qualche parte, qui in salone.');
  await say(hero, 'Schermata dei personaggi... e adesso il codice.');
  const c = await choose([
    { id: 'a', text: 'Su, giù, su, giù, pugno, pugno' },
    { id: 'giusto', text: 'Su, su, giù, giù, pugno, calcio' },
    { id: 'b', text: 'Sinistra, destra, calcio, calcio, pausa' },
    { id: 'no', text: 'Lascio perdere' },
  ]);
  if (c.id === 'no') return say(hero, 'Un\'altra volta.');
  if (c.id !== 'giusto') { SFX.thud(); return say(hero, 'Niente. Il televisore mi guarda con compassione.'); }
  SFX.score(); f.sbloccati = true;
  addScore('sbloccati', 25);
  await say(hero, 'SBLOCCATI! Nuovi lottatori: LUCIANO, IL GHIRO e LATENAR, che combatte dormendo.');
  await say(roleActor('partner'), 'Luciano ha la mossa speciale "Mandi". Ti saluta e sei già K.O.');
  await fineGiochi();
}
async function giocoDaTavolo(a) {
  const f = FS();
  hero.dir = hero.x < a.x ? 'right' : 'left';
  if (f.tavoloFatto) return say(a, 'Rivincita domani. Oggi ho già vinto. Cioè, ha vinto Latenar.');
  await say(a, 'Il gioco è semplice: si conquista il mondo. Io parto dalla Kamchatka. Tu?');
  const c = await choose([
    { id: 'att', text: 'Attacco con tutti i carri armati!' },
    { id: 'all', text: 'Facciamo un\'alleanza.' },
    { id: 'dif', text: 'Mi difendo e aspetto.' },
  ]);
  if (c.id === 'att') { await say(hero, 'Tutti all\'attacco!'); SFX.thud(); await say(a, 'Hai tirato tre volte uno. Tre. Volte. Uno.'); }
  if (c.id === 'all') { await say(hero, 'Alleanza?'); await say(a, 'Certo. Fino al prossimo turno.'); }
  if (c.id === 'dif') { await say(hero, 'Io aspetto.'); await say(a, 'Aspetta pure. Io intanto conquisto l\'Australia.'); }
  await wait(500);
  await say(a, 'Un momento. Chi è quello che ha vinto?');
  await say(hero, 'Latenar. Ha messo i carri armati all\'inizio e non li ha più toccati.');
  await say(latenar, 'Sto riposando gli occhi.');
  takeItem('giocoTavolo'); f.tavoloFatto = true;
  addScore('tavolo', 25);
  await fineGiochi();
}
async function fineGiochi() {
  const f = FS();
  if (!(f.crisiVinta && f.sbloccati && f.tavoloFatto)) return;
  await wait(500);
  await say(hero, 'Tempo di Crisi vinto, lottatori sbloccati, partita persa con onore. Che serata.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(7);
}
const telefonoSalone = () => say(hero, 'Il telefono? Stasera no. Stasera si gioca dal vivo.');

/* ---------- la stanza ---------- */
const ROOM_SALONE = {
  id: 'salone', title: 'Salone', width: SAW,
  links: { portico: 'portaPortico', caminetto: 'portaCaminetto', camerata: 'scale' },
  spawn: [200, 124],
  walk: [[6, 112], [506, 112], [506, 142], [6, 142]],
  scaleAt(y) { return clamp(0.84 + (y - 112) / 30 * 0.16, 0.84, 1); },
  init() {},
  enter() {
    if (Game.chapter === 6 && !Game.flags.ch6Intro) runScript(ceneIntro);
    if (Game.chapter === 7 && !Game.flags.ch7Intro) runScript(giochiIntro);
  },
  drawBack(g, cam) { g.drawImage(dayNightBg(this, paintSalone), -cam, 0); },
  darkness() { return isNight() ? 0.3 : 0; },
  darkTint: '20,10,4',
  lights() {
    const L = [];
    for (let x = 30; x < SAW; x += 80) L.push({ x, y: 20, r: 90, a: 0.9 });
    L.push({ x: 298, y: 72, r: 40, a: 0.8, tint: 'rgba(120,140,255,0.10)' });
    L.push({ x: 337, y: 92, r: 14, a: 0.8, tint: 'rgba(60,120,255,0.18)' });
    return L;
  },
  objects() {
    const list = [{ y: 87, draw: drawSaloneTv }];
    if (Game.chapter === 6) list.push({ y: 96, draw: g => {
      // piatti con le costine sul tavolone
      for (let x = 62; x < 210; x += 24) {
        g.fillStyle = '#f0ece4'; g.fillRect(x, 90, 10, 2); g.fillStyle = '#d8d4cc'; g.fillRect(x + 1, 92, 8, 1);
        g.fillStyle = '#8a3a1c'; g.fillRect(x + 2, 89, 6, 2); g.fillStyle = '#b05a2a'; g.fillRect(x + 2, 89, 6, 1);
      }
    } });
    return list;
  },
  itemVerbs: { telefono: { usa: telefonoSalone } },
  update() {},
  hotspots: [],
};
ROOMS.salone = ROOM_SALONE;

ROOM_SALONE.hotspots = [
  { id: 'perlinato', name: 'Perlinato', rects: [[0, 40, 512, 64]], hint: false,
    verbs: { guarda: () => say(hero, 'Perlinato di pino coi nodi. Ogni nodo sembra un occhio. Ti guardano mentre mangi.') } },
  { id: 'soffittoSalone', name: 'Strisce LED', rects: [[0, 0, 452, 38]], hint: false,
    verbs: {
      guarda: () => say(hero, 'Strisce LED su tutto il soffitto. Luciano dice che consumano poco. Le ha accese nel 2019 e non le ha più spente.'),
      usa: () => say(hero, "Non so dov'è l'interruttore. Forse non esiste."),
    } },
  { id: 'cotto', name: 'Pavimento', rects: [[0, 108, 512, 36]], hint: false,
    verbs: { guarda: () => say(hero, "Cotto. Fresco d'estate, gelido d'inverno, appiccicoso dopo ogni festa.") } },
  { id: 'corna', name: 'Trofei di cervo', rects: [[46, 40, 106, 38]], walk: [98, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Tre teschi di cervo con le corna. Qualcuno ci ha appeso le palline di Natale, così sono meno tristi. Credo.'),
      raccogli: () => say(hero, 'Le corna restano al muro. Le palline di Natale anche: sono lì dal 2007.'),
      parla: () => say(hero, 'Buonasera, signori cervi. ...Sono di poche parole.'),
    } },
  { id: 'tavolone', name: 'Tavolone', rects: [[50, 68, 168, 42]], walk: [134, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il tavolone del salone: bottiglie, bicchierini, un rotolo di carta e un bottiglione di bibita. Qui si è giocato, bevuto e discusso di tutto.'),
      raccogli: () => say(hero, 'I bicchierini sono vuoti. Tutti. Il che è sospetto.'),
      usa: () => say(hero, 'Se mi siedo su quella panca, poi non mi rialzo fino a domani.'),
    },
    use: { costine: () => say(hero, 'Le costine si mangiano qui, sì. Ma dopo la brace, non crude.') } },
  { id: 'quadroLago', name: 'Quadro del lago', rects: [[144, 44, 48, 28]], walk: [168, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, "Un lago al tramonto con un cigno. Il quadro più tranquillo della baita. L'unico senza corna."),
      raccogli: () => say(hero, 'Se lo stacco, dietro c\'è di sicuro una macchia più chiara a forma di quadro. Lo lascio.'),
    } },
  { id: 'divano', name: 'Divano a righe', rects: [[220, 82, 50, 28]], walk: [244, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il divano a righe. Ha visto più tornei di picchiaduro di una sala giochi.'),
      usa: () => say(hero, 'Se mi siedo, qualcuno mi mette in mano un joypad e non esco più.'),
    } },
  { id: 'tv', name: 'Televisore', rects: [[280, 60, 36, 28]], walk: [298, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Sul televisore due tizi si menano da ore. Nessuno ricorda chi stava giocando.'),
      usa: () => say(hero, 'È già acceso. Credo sia acceso dal 2009.'),
      parla: () => say(hero, 'Ehi, quello blu! Para! ...Non mi ascolta. Come i miei amici quando giocano.'),
      spingi: () => say(hero, 'Il televisore è sacro quanto il barbecue. Non si tocca.'),
    },
    use: { pistola: () => giocaCrisi(), joypad: () => sbloccaLottatori(), '*': () => say(hero, 'Il televisore accetta solo joypad e pistole. Di plastica.') } },
  { id: 'casse', name: 'Casse rosse', rects: [[270, 70, 8, 18], [318, 70, 8, 18]], walk: [298, 120], face: 'up',
    verbs: { guarda: () => say(hero, 'Due casse rosse. Volume: baita. Cioè si sente fino al guado.') } },
  { id: 'mobileTv', name: 'Mobile della TV', rects: [[270, 88, 56, 22]], walk: [298, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Dentro: una console nera, un groviglio di cavi e giochi da tavolo con le scatole sfondate.'),
      apri: () => Game.chapter === 7 ? prendiGiochi() : say(hero, 'Cavi. Solo cavi. Se ne tiro uno si spegne mezza valle.'),
      tira: () => say(hero, 'Tirare un cavo a caso durante un torneo? Ci tengo alla vita.'),
    } },
  { id: 'computer', name: 'Computer', rects: [[330, 80, 14, 30]], walk: [337, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Un computer con le ventole blu. Fa più luce lui delle strisce LED.'),
      usa: () => say(hero, 'La password è scritta su un post-it attaccato allo schermo. Che non c\'è. Il post-it c\'è.'),
    } },
  { id: 'vetrina', name: 'Vetrina', rects: [[350, 42, 44, 68]], walk: [372, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'La vetrina con le tendine di pizzo. Dentro ci sono i bicchieri buoni, quelli per le occasioni. Le occasioni non sono mai arrivate.'),
      apri: () => Game.chapter === 6 ? prendiBicchieri() : say(hero, 'È la vetrina dei bicchieri buoni. Se la apro, da qualche parte una nonna si sveglia.'),
    } },
  { id: 'finestrella', name: 'Finestrella', rects: [[398, 42, 30, 18]], walk: [412, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, isNight() ? 'Fuori è nero come dentro una tasca.' : 'Una finestrella in alto con le tendine color crema. Da qui si vede un pezzo di cielo e un pezzo di ragnatela.'),
      apri: () => say(hero, "È troppo in alto. E poi entra il freddo. E un ghiro."),
    } },
  { id: 'cartello', name: 'Cartello', rects: [[402, 64, 22, 16]], walk: [412, 120], face: 'up',
    verbs: {
      guarda: () => leggiCodice(),
      raccogli: () => say(hero, 'Il cartello resta lì. Magari un giorno qualcuno capirà cosa si prega di fare.'),
    } },
  { id: 'scale', name: 'Scale per la camerata', rects: [[430, 16, 50, 94]], walk: [444, 118], face: 'right', exit: true,
    verbs: {
      guarda: () => say(hero, 'Le scale per la camerata. Ripide come un sentiero, e scricchiolano come Luciano.'),
      vai: () => goToRoom(ROOMS.camerata, 74, 122, 'right'),
    } },
  { id: 'portaPortico', name: 'Porta del portico', rects: [[10, 48, 34, 60]], walk: [28, 116], face: 'up', exit: true,
    verbs: {
      guarda: () => say(hero, 'La porta che dà sul portico.'),
      vai: () => goToRoom(ROOMS.portico, 245, 120, 'down'),
      apri: () => goToRoom(ROOMS.portico, 245, 120, 'down'),
    } },
  { id: 'portaCaminetto', name: 'Porta del caminetto', rects: [[482, 42, 28, 66]], walk: [496, 116], face: 'up', exit: true,
    verbs: {
      guarda: () => say(hero, 'La porta della stanza del caminetto. È la stanza più calda della baita. Quando il caminetto è acceso.'),
      vai: () => goToRoom(ROOMS.caminetto, 48, 134, 'right'),
      apri: () => goToRoom(ROOMS.caminetto, 48, 134, 'right'),
    } },
];
