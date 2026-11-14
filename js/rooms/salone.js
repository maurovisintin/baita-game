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
  // il barattolo azzurro del moonshine Blue Flame (64 gradi): tappo dorato, etichetta di carta
  b.rect(174, 82, 6, 2, '#c8a040'); b.rect(174, 82, 6, 1, '#ecd07a'); b.set(174, 83, '#9a7a2a');
  b.rect(173, 84, 8, 7, '#7cc6e4'); b.rect(173, 84, 8, 1, '#5aaed0'); b.rect(173, 85, 1, 6, '#c8eefc'); b.rect(180, 85, 1, 6, '#4a9cc0');
  b.rect(174, 86, 1, 3, '#e4f8ff');
  b.rect(175, 87, 5, 2, '#cdb48a'); b.rect(176, 87, 2, 2, '#1e1a16'); b.set(179, 87, '#3a8ac8');
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
  fighter(fx1, '#3a6ad8', '#e8b890', 1, hit);
  fighter(fx2, '#d83a3a', '#c89070', -1, !hit && ((t * 3) | 0) % 4 === 2);
  if (hit && sep < 9) { g.fillStyle = '#ffffff'; g.fillRect(x0 + 15, fy - 6, 2, 2); }
  g.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = y0; y < y0 + h; y += 2) g.fillRect(x0, y, w, 1);
}

/* ---------- capitolo 3: la postazione retro (Zac, con Sprus) ---------- */
const SPRUS3_SPOT = [200, 126];
const FR = () => Game.flags;
async function retroIntro() {
  const f = FR(), sprus = npcActor('sprus');
  f.retroIntro = true;
  await wait(600);
  await say(hero, "Stasera torneo retro. La postazione deve essere perfetta. È una questione d'onore!");
  hero.dir = 'right';
  await say(hero, "TV, cavi, joypad, bluetooth... Un attimo. Dov'è la TV?!");
  await say(sprus, 'Io ti aiuto. Cioè: ti passo le cose e ti dico "bravo".');
  await say(sprus, 'La TV... mi ricorda qualcosa. Fammi pensare un attimo.');
  banner('OBIETTIVO: prepara la postazione retro: trova la TV, collega cavi e joypad, e controlla che funzioni tutto.', 6);
}
// Sprus: aiutante. Sa dov'è la TV e tiene premuto il tasto del pad due
async function sprusTalk(sprus) {
  const f = FR();
  hero.dir = hero.x < sprus.x ? 'right' : 'left';
  if (!f.retroTvSaputa && !hasItem('tv') && !f.retroTvMontata) {
    f.retroTvSaputa = true;
    await say(sprus, "Ecco! D'inverno Luciano nasconde la TV. Per i ladri.");
    await say(sprus, 'Nella stanza del caminetto, sotto il plaid del divanetto di vimini. Secondo lui i ladri sotto i plaid non guardano.');
    return say(hero, 'Ladri sconfitti da un plaid. Vado!');
  }
  if (f.retroPadUno && !f.retroBt) return padDueSprus(sprus);
  if (!hasItem('tv') && !f.retroTvMontata) return say(sprus, 'Stanza del caminetto, plaid, divanetto di vimini. Io resto qui a fare la guardia al posto vuoto.');
  if (!f.retroTvMontata) return say(sprus, 'Mettila sul mobile, in mezzo alle casse. Piano, che pesa.');
  if (!f.retroHdmi) return say(sprus, hasItem('cavi') ? 'Quel groviglio va dietro la TV. Coraggio.' : 'I cavi sono nel mobile della TV. Tutti. Insieme. Annodati.');
  if (!hasItem('pad') && !f.retroPadUno) return say(sprus, 'I joypad? Sul divano a righe, vicino a Latenar. Non svegliarlo.');
  if (!f.retroPadUno) return say(sprus, 'Joypad e computer: accendi il bluetooth e abbinali.');
  if (!f.retroAcceso) return say(sprus, 'È tutto collegato. Accendi il computer e facciamo una partita di prova.');
  return say(sprus, 'Stasera vi distruggo tutti. Col pad due.');
}
async function padDueSprus(sprus) {
  const f = FR();
  await say(sprus, 'Il pad due? Dammi qua. Tengo premuto il tasto finché non lampeggia.');
  sprus.pose = 'reach'; SFX.clack(); await wait(400);
  await say(sprus, 'Uno... due... tre... quattro...', { dur: 1800 });
  SFX.pick(); sprus.pose = 'stand';
  f.retroBt = true; addScore('retroPadDue', 10);
  await say(hero, 'ABBINATO! Pad due connesso! Sprus, sei un mito!');
  await say(sprus, 'Lo so. Ma tira ancora a sinistra?');
  return say(hero, 'Lo scopriamo con la partita di prova.');
}
async function montaTv() {
  const f = FR();
  if (f.retroTvMontata) return say(hero, 'La TV è già al suo posto. Dritta. Più o meno.');
  await walkTo(hero, 298, 120); hero.dir = 'up';
  hero.pose = 'reach'; SFX.thud(); await wait(500); hero.pose = 'stand';
  takeItem('tv'); f.retroTvMontata = true; addScore('retroTvMontata', 10);
  await say(hero, 'TV sul mobile, in mezzo alle casse. Adesso sembra di nuovo il salone.');
}
async function prendiCavi() {
  const f = FR();
  if (hasItem('cavi') || f.retroHdmi) return say(hero, "Nel mobile restano la console di vent'anni fa e un cavo SCART. Lo SCART non si butta. Mai.");
  hero.pose = 'reach'; SFX.creak(); await wait(400); hero.pose = 'stand';
  giveItem('cavi'); f.retroCavi = true; addScore('retroCavi', 10);
  await say(hero, 'Il groviglio dei cavi: HDMI, alimentazione, una prolunga. Annodati come le cuffie in tasca.');
}
async function collegaCavi() {
  const f = FR();
  if (f.retroHdmi) return say(hero, 'Cavi già collegati. Non toccare niente. Respirare piano.');
  if (!f.retroTvMontata) return say(hero, 'Prima la TV sul mobile. Poi i cavi.');
  await walkTo(hero, 312, 120); hero.dir = 'up';
  await say(hero, "Allora. Questo è l'HDMI... no, è la prolunga. Questo è l'HDMI... no, è lo SCART. Questo... è l'HDMI!");
  hero.pose = 'reach'; SFX.clack(); await wait(400); SFX.clack(); await wait(400); hero.pose = 'stand';
  takeItem('cavi'); f.retroHdmi = true; addScore('retroHdmi', 15);
  await say(hero, 'HDMI dal computer alla TV, corrente a casse e TV, prolunga dietro il mobile. Si accende!');
  const sprus = npcActor('sprus');
  if (sprus) await say(sprus, 'C\'è scritto "BAITA RETRO". Mi sono emozionato.');
}
async function prendiPad() {
  const f = FR();
  if (hasItem('pad') || f.retroPadPresi) return say(hero, 'I joypad li ho già presi. Sul divano è rimasto solo Latenar.');
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  giveItem('pad'); f.retroPadPresi = true; addScore('retroPad', 10);
  await say(hero, 'I due joypad bluetooth. Carichi! Li avevo messi in carica nel 2019 e hanno resistito.');
}
async function abbinaPad() {
  const f = FR();
  if (f.retroPadUno) return say(hero, 'Il pad uno è già abbinato.');
  if (!f.retroHdmi) return say(hero, 'Prima i cavi: se il computer non è collegato alla TV, non vedo neanche il bluetooth.');
  await walkTo(hero, 337, 120); hero.dir = 'up';
  hero.pose = 'reach'; SFX.clack(); await wait(400); hero.pose = 'stand';
  await say(hero, 'Bluetooth acceso... ricerca dispositivi...');
  SFX.pick(); takeItem('pad'); f.retroPadUno = true; addScore('retroBt', 15);
  await say(hero, 'Pad uno: connesso! Pad due: "dispositivo non trovato". Classico.');
  await say(hero, 'Serve qualcuno che tenga premuto il tasto del pad due mentre cerco. SPRUS!');
}
async function avviaRetro() {
  const f = FR(), sprus = npcActor('sprus');
  if (f.retroAcceso) return say(hero, 'È acceso e funziona. Non lo tocco più fino a stasera.');
  if (!f.retroTvMontata) return say(hero, 'Il computer è pronto. Gli manca solo una TV. Che non c\'è.');
  if (!f.retroHdmi) return say(hero, 'Acceso è acceso. Ma senza cavi la TV non lo sa.');
  if (!f.retroPadUno) return say(hero, 'Il computer va. Adesso i joypad: col bluetooth.');
  if (!f.retroBt) return say(hero, 'Il pad due ancora non si vede. Mi serve Sprus che tenga premuto il tasto.');
  await walkTo(hero, 337, 120);
  hero.x = 337; hero.y = 118; hero.dir = 'up'; hero.pose = 'sit';
  await say(hero, 'Emulatore... picchiaduro... partita di prova. Pad uno io, pad due Sprus.');
  f.retroAcceso = true; SFX.score();
  await wait(1400);
  if (sprus) await say(sprus, 'Va a sinistra! Il pad due tira a sinistra!');
  await say(hero, 'Calibrazione al volo... levetta tutta a destra... ancora... ancora...');
  SFX.clack(); await wait(600);
  if (sprus) await say(sprus, 'Va dritto. VA DRITTO!');
  addScore('retroTest', 15);
  await say(hero, 'TV ok, cavi ok, bluetooth ok, audio ok. Funziona tutto. Al primo colpo. Quasi.');
  if (sprus) await say(sprus, 'Stasera torneo, allora.');
  await say(hero, "Stasera torneo! Prima però Luciano ci manda all'orrido. Di notte.");
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(3);
}
// il posto vuoto della TV: un rettangolo di perlinato più chiaro
function postoTvCanvas() {
  const pine = pineShader(200, 5);
  return canvasOf('postoTv', 36, 28, b => b.rect(0, 0, 36, 28, (x, y) => {
    const c = pine(x + 280, y + 60);
    return (x >= 2 && x <= 33 && y >= 1 && y <= 25) ? hexMix(c, '#fff0d8', 0.16) : c;
  }));
}
function tvMenuCanvas() {
  return canvasOf('tvMenu', 32, 20, b => {
    b.rect(0, 0, 32, 20, '#1a2a7a'); b.rect(0, 0, 32, 1, '#2a3e9a');
    pixTextC(b, 16, 2, 'BAITA', '#f2e01c'); pixTextC(b, 16, 8, 'RETRO', '#f2e01c');
    b.rect(5, 15, 22, 1, '#8ab0ff'); b.rect(5, 17, 15, 1, '#6a90df');
  });
}
function drawTvRetro(g, acceso) {
  if (!acceso) { g.fillStyle = (((Game.t * 1.5) | 0) % 2) ? '#e83a2a' : '#7a1a10'; g.fillRect(313, 84, 1, 1); return; } // spia di standby
  g.drawImage(tvMenuCanvas(), 282, 62);
  if (((Game.t * 2) | 0) % 2) { g.fillStyle = '#ffffff'; g.fillRect(285, 77, 1, 3); }
  g.fillStyle = 'rgba(255,255,255,0.07)'; for (let y = 62; y < 82; y += 2) g.fillRect(282, y, 32, 1);
}
function padsCanvas() {
  return canvasOf('padsDivano', 18, 6, b => {
    for (const x0 of [0, 9]) {
      b.rect(x0 + 1, 1, 7, 4, '#2e2e36'); b.rect(x0, 2, 9, 3, '#2e2e36'); b.rect(x0 + 1, 1, 7, 1, '#4a4a54');
      b.set(x0 + 2, 3, '#14141a'); b.set(x0 + 6, 2, '#e83a3a'); b.set(x0 + 7, 3, '#3a8aff');
    }
  });
}

/* ---------- capitolo 7: la cena e la degustazione ---------- */
const FS = () => Game.flags;
const roleActor = r => npcActor((Game.roles || {})[r]);
const DEGUSTAZIONE = {
  rum: { score: 'rum', offer: 'Rum invecchiato. Senti: vaniglia, caramello e un po\' di pirata.', taste: 'Mmm... dolce, caldo. Pericoloso.' },
  gin: { score: 'gin', offer: 'Gin di montagna, col ginepro. Senti che profumo di bosco.', taste: 'Fresco. Sa di pino. Come leccare il perlinato, ma buono.' },
  moonshine: { score: 'moonshine', offer: 'Il barattolo azzurro: moonshine Blue Flame, dal Tennessee. Sessantaquattro gradi. Un sorso solo. Fidati.', taste: null },
};
async function ceneIntro() {
  const f = FS();
  f.ch6Intro = true;
  await wait(600);
  await say(hero, isKodo() ? 'La cena! Tutti al tavolone. Le mie costine con la polenta, e... cosa c\'è in quelle bottiglie?' : 'La cena! Tutti al tavolone. Le costine di Kodo con la polenta, e... cosa c\'è in quelle bottiglie?');
  await gusMagnando();
  await costineCommenti();
  await say(roleActor('oste'), 'Degustazione! Rum, gin e moonshine. Le bottiglie le offro io: voi state seduti.');
  await say(roleActor('oste'), 'Il moonshine è il Blue Flame, il barattolo azzurro. Sessantaquattro gradi: se lo accendi fa la fiamma blu.');
  await say(hero, 'Per una degustazione così servono i bicchieri buoni. Quelli della vetrina.');
  banner('OBIETTIVO: prendi i bicchieri buoni e fai la degustazione: rum, gin e moonshine a 64 gradi.', 5);
}
// Gus si alza e urla, tutti in coro: "Grazie Ziba!"
async function gusMagnando() {
  const gus = Game.pg === 'gus' ? hero : npcActor('gus');
  if (!gus) return;
  const seduto = gus !== hero && gus.pose === 'sit', dirPrima = gus.dir;
  try {
    if (gus !== hero) { Game.camFocus = gus.x; await wait(700); }
    if (seduto) { gus.pose = 'stand'; gus.dir = 'down'; await wait(350); }
    await say(gus, 'MULII, STEMO MAGNANDO!!', { raw: true, big: true, dur: 2000 }); // la voce di Gus, senza aggiunte
    // il coro: chi è inquadrato, abbastanza distanti perché le nuvolette non si sovrappongano
    const cam = clamp((Game.camFocus != null ? Game.camFocus : hero.x) - 160, 0, Game.room.width - W);
    const tutti = npcsIn('salone').map(n => n.actor).concat(gus !== hero ? [hero] : [])
      .filter(a => a !== gus && a !== latenar && a.x > cam + 16 && a.x < cam + W - 16).sort((p, q) => p.x - q.x);
    const coro = [];
    for (const a of tutti) if (!coro.length || a.x - coro[coro.length - 1].x >= 50) coro.push(a);
    await Promise.all(coro.map((a, i) => wait(i * 90).then(() => say(a, 'Grazie Ziba!', { raw: true, dur: 1700 }))));
  } finally {
    if (seduto) { gus.pose = 'sit'; gus.dir = dirPrima; }
    Game.camFocus = null;
  }
}
// le costine (la prima volta di Kodo in baita, per quindici persone): Biz e Menion contenti, Kodo no
async function costineCommenti() {
  const chi = id => id === Game.pg ? hero : npcActor(id);
  const oste = (Game.roles || {}).oste;
  const altro = npcsIn('salone').find(n => !['kodo', 'biz', 'menion', 'zac', oste].includes(n.id) && n.actor.dir === 'down');
  if (altro) await say(altro.actor, 'Con la polenta, poi... mi commuovo.');
  if (chi('biz')) await say(chi('biz'), 'Le migliori costine della mia vita.');
  if (chi('menion')) await say(chi('menion'), 'Molto buone.');
  const kodo = chi('kodo');
  if (!kodo) return;
  await say(kodo, "Buone, ma un po' durette. La temperatura non saliva oltre i 75: il collagene non si è sciolto.");
  await say(kodo, 'Dovevo metterle nel foil.');
}
async function prendiBicchieri() {
  const f = FS();
  if (f.bicchieriPresi) return say(hero, "I bicchieri buoni sono già fuori. Luciano se n'è accorto di sicuro, da casa sua.");
  await walkTo(hero, 372, 120); hero.dir = 'up';
  hero.pose = 'reach'; SFX.creak(); await wait(400); hero.pose = 'stand';
  f.bicchieriPresi = true; giveItem('bicchierini');
  addScore('bicchieri', 25);
  await say(hero, "I bicchieri buoni! Finalmente un'occasione. Aspettavano dal 1987.");
}
async function assaggio(kind, a) {
  const f = FS(), d = DEGUSTAZIONE[kind];
  hero.dir = hero.x < a.x ? 'right' : 'left';
  if (f[kind]) return say(a, kind === 'moonshine' ? 'Ancora? Sei matto. Mi piaci.' : 'Già assaggiato. Un altro giro dopo, magari.');
  if (!hasItem('bicchierini')) return say(a, 'Prima i bicchieri. Mica beviamo dalla bottiglia. Non ancora.');
  await say(a, d.offer);
  hero.pose = 'reach'; SFX.pour(); await wait(500); hero.pose = 'stand';
  SFX.gulp(); await wait(400);
  if (kind === 'moonshine') {
    Game.shake = 1.2; Game.flash = 0.6;
    await say(hero, 'SESSANTAQUATTRO GRADIIII!', { big: true, dur: 1600 });
    await say(hero, 'Vedo i suoni. Sento i colori. E la lingua non la sento più.');
  } else await say(hero, d.taste);
  f[kind] = true;
  addScore(d.score, 25);
  if (f.rum && f.moonshine && f.gin) await brindisi();
}
// chi offre le bottiglie: una alla volta, rum, gin e per ultimo il moonshine
function degustazione(a) {
  const next = ['rum', 'gin', 'moonshine'].find(k => !FS()[k]);
  return assaggio(next || 'moonshine', a);
}
async function brindisi() {
  const others = npcsIn('salone').map(n => n.actor);
  await wait(400);
  await say(hero, 'Un brindisi! Alla baita della figata del mondo!', { big: true, dur: 1800 });
  if (others[0]) await say(others[0], 'E alla rimpatriata! Come quando venivamo qui da ragazzi!');
  for (const a of others.slice(1, 5)) { await say(a, pick(['Salute!', 'Cin cin!', 'Alla baita!', 'Prosit!', 'Come la prima volta!'])); }
  await say(npcActor('latenar') || latenar, 'Sto riposando gli occhi.');
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
    if (Game.chapter === 3 && !Game.flags.retroIntro) runScript(retroIntro);
    if (Game.chapter === 7 && !Game.flags.ch6Intro) runScript(ceneIntro);
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
    const f = Game.flags, retro = Game.chapter === 3;
    const list = [];
    // la TV: nel capitolo 3 prima non c'è, poi è spenta, poi mostra il menu, poi il picchiaduro
    if (!retro || f.retroAcceso) list.push({ y: 87, draw: drawSaloneTv });
    else if (!f.retroTvMontata) list.push({ y: 87, draw: g => g.drawImage(postoTvCanvas(), 280, 60) });
    else list.push({ y: 87, draw: g => drawTvRetro(g, f.retroHdmi) });
    // i joypad sul divano
    if (!retro || !f.retroPadPresi) list.push({ y: 99, draw: g => g.drawImage(padsCanvas(), 228, 93) });
    // sgabello di Zac al computer
    if (npcsIn('salone').some(n => n.id === 'zac') || zacGagHere('salone') || (retro && f.retroAcceso)) list.push({ y: 117, draw: g => {
      g.fillStyle = '#3a2410'; g.fillRect(331, 111, 12, 2); g.fillStyle = '#5a3a1c'; g.fillRect(331, 111, 12, 1);
      g.fillStyle = '#2a1a0c'; g.fillRect(332, 113, 1, 5); g.fillRect(341, 113, 1, 5); g.fillRect(336, 113, 2, 4);
    } });
    // panca davanti al tavolone, quando ci si siede qualcuno
    if (npcsIn('salone').some(n => n.actor.y === 124 && n.actor.pose === 'sit')) list.push({ y: 119, draw: g => {
      g.fillStyle = '#7a4a20'; g.fillRect(80, 117, 112, 3); g.fillStyle = '#a4682e'; g.fillRect(80, 117, 112, 1);
      g.fillStyle = '#4a2a10'; for (const lx of [84, 134, 186]) g.fillRect(lx, 120, 3, 5);
    } });
    if (Game.chapter === 7) list.push({ y: 96, draw: g => {
      // piatti con le costine sul tavolone
      for (let x = 60; x < 210; x += 24) {
        g.fillStyle = '#f0ece4'; g.fillRect(x, 90, 12, 2); g.fillStyle = '#d8d4cc'; g.fillRect(x + 1, 92, 10, 1);
        g.fillStyle = '#8a3a1c'; g.fillRect(x + 1, 89, 6, 2); g.fillStyle = '#b05a2a'; g.fillRect(x + 1, 89, 6, 1);
        g.fillStyle = '#e8b83a'; g.fillRect(x + 7, 88, 4, 3); g.fillStyle = '#f8d870'; g.fillRect(x + 7, 88, 4, 1); // polenta
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
      guarda: () => say(hero, 'Il tavolone del salone: bottiglie, il barattolo azzurro del moonshine, bicchierini, un rotolo di carta e un bottiglione di bibita. Qui si è giocato, bevuto e discusso di tutto.'),
      raccogli: () => say(hero, 'I bicchierini sono vuoti. Tutti. Il che è sospetto.'),
      usa: () => say(hero, 'Se mi siedo su quella panca, poi non mi rialzo fino a domani.'),
    },
    use: { costine: () => say(hero, 'Le costine si mangiano qui, sì. Ma dopo la brace, non crude.') } },
  { id: 'quadroLago', name: 'Quadro del lago', rects: [[144, 44, 48, 28]], walk: [168, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, "Un lago al tramonto con un cigno. Il quadro più tranquillo della baita. L'unico senza corna."),
      raccogli: () => say(hero, 'Se lo stacco, dietro c\'è di sicuro una macchia più chiara a forma di quadro. Lo lascio.'),
    } },
  { id: 'divano', name: 'Divano a righe', rects: [[220, 82, 50, 28]], walk: [236, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il divano a righe. Ha visto più tornei di picchiaduro di una sala giochi.' + (Game.chapter === 3 && !FR().retroPadPresi ? ' Sopra ci sono i due joypad.' : '')),
      raccogli: () => Game.chapter === 3 ? prendiPad() : say(hero, 'I joypad restano lì. Sono di Zac: sa sempre dove li ha lasciati.'),
      usa: () => say(hero, 'Se mi siedo, qualcuno mi mette in mano un joypad e non esco più.'),
    } },
  { id: 'tv', name: () => Game.chapter === 3 && !FR().retroTvMontata ? 'Posto della TV' : 'Televisore', rects: [[280, 60, 36, 28]], walk: [298, 120], face: 'up',
    verbs: {
      guarda: () => {
        const f = FR();
        if (Game.chapter === 3 && !f.retroTvMontata) return say(hero, 'Il posto della TV. Vuoto. Resta solo un rettangolo di perlinato più chiaro, a forma di TV.');
        if (Game.chapter === 3 && !f.retroAcceso) return say(hero, f.retroHdmi ? 'Sulla TV c\'è il menu: BAITA RETRO. Bellissimo. Manca la prova coi joypad.' : 'La TV è al suo posto, spenta. Lucina rossa di standby. Mancano i cavi.');
        return say(hero, 'Sul televisore due tizi si menano da ore. Nessuno ricorda chi stava giocando.');
      },
      usa: () => Game.chapter === 3 && !FR().retroAcceso ? say(hero, FR().retroTvMontata ? 'Senza cavi si accende solo la lucina rossa.' : 'Non c\'è niente da usare. C\'è un rettangolo vuoto.') : say(hero, 'È già acceso. Credo sia acceso dal 2009.'),
      parla: () => say(hero, 'Ehi, quello blu! Para! ...Non mi ascolta. Come i miei amici quando giocano.'),
      spingi: () => say(hero, 'Il televisore è sacro quanto il barbecue. Non si tocca.'),
    },
    use: { tv: () => montaTv(), cavi: () => collegaCavi(), pad: () => say(hero, 'I joypad non si collegano alla TV: vanno abbinati al computer, col bluetooth.') } },
  { id: 'casse', name: 'Casse rosse', rects: [[270, 70, 8, 18], [318, 70, 8, 18]], walk: [298, 120], face: 'up',
    verbs: { guarda: () => say(hero, 'Due casse rosse. Volume: baita. Cioè si sente fino al guado.') } },
  { id: 'mobileTv', name: 'Mobile della TV', rects: [[270, 88, 56, 22]], walk: [298, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Dentro: una console nera, un groviglio di cavi e giochi da tavolo con le scatole sfondate. Gli stessi di vent\'anni fa.'),
      apri: () => Game.chapter === 3 ? prendiCavi() : say(hero, 'Cavi. Solo cavi. E la console di vent\'anni fa, che funziona ancora meglio di noi.'),
      tira: () => say(hero, 'Tirare un cavo a caso durante un torneo? Ci tengo alla vita.'),
    },
    use: { tv: () => montaTv(), cavi: () => collegaCavi() } },
  { id: 'computer', name: 'Computer', rects: [[330, 80, 14, 30]], walk: [337, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Un computer con le ventole blu. Fa più luce lui delle strisce LED.'),
      usa: () => Game.chapter === 3 ? avviaRetro() : say(hero, 'La password è scritta su un post-it attaccato allo schermo. Che non c\'è. Il post-it c\'è.'),
    },
    use: { pad: () => abbinaPad(), cavi: () => collegaCavi() } },
  { id: 'vetrina', name: 'Vetrina', rects: [[350, 42, 44, 68]], walk: [372, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, 'La vetrina con le tendine di pizzo. Dentro ci sono i bicchieri buoni, quelli per le occasioni. Le occasioni non sono mai arrivate.'),
      apri: () => Game.chapter === 7 ? prendiBicchieri() : say(hero, 'È la vetrina dei bicchieri buoni di Luciano. Se la apro senza un buon motivo, lui lo sente.'),
    } },
  { id: 'finestrella', name: 'Finestrella', rects: [[398, 42, 30, 18]], walk: [412, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, isNight() ? 'Fuori è nero come dentro una tasca.' : 'Una finestrella in alto con le tendine color crema. Da qui si vede un pezzo di cielo e un pezzo di ragnatela.'),
      apri: () => say(hero, "È troppo in alto. E poi entra il freddo. E un ghiro."),
    } },
  { id: 'cartello', name: 'Cartello', rects: [[402, 64, 22, 16]], walk: [412, 120], face: 'up',
    verbs: {
      guarda: () => say(hero, "Un cartello scritto a mano: 'SI PREGA DI...'. Il resto è scarabocchiato. È lì da quando venivamo qui da ragazzi e nessuno ha mai capito cosa si debba fare. Nel dubbio, nessuno fa niente."),
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
