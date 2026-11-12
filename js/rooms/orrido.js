'use strict';
/* =========================================================
   CAPITOLO 2 - STANZA 2: L'ORRIDO RASCIE (di notte)
   Un ponticello coperto, col tetto di telo verde, sopra la
   fessura dell'orrido. Si accendono le frontali, si mangiano
   le arachidi di Halloween e si parla dei giovani d'oggi
   ========================================================= */
const OW = 400;
const OR_GLYPHS = {
  O: ['111', '101', '101', '101', '111'], R: ['110', '101', '110', '101', '101'], I: ['111', '010', '010', '010', '111'],
  D: ['110', '101', '101', '101', '110'], A: ['010', '101', '111', '101', '101'], S: ['011', '100', '010', '001', '110'],
  C: ['011', '100', '100', '100', '011'], E: ['111', '100', '110', '100', '111'],
};
function orText(b, x, y, str, c) {
  [...str].forEach((ch, i) => (OR_GLYPHS[ch] || []).forEach((row, j) => [...row].forEach((p, k) => { if (p === '1') b.set(x + i * 4 + k, y + j, c); })));
}
const orSlope = x => 16 + x * 0.05 + Math.sin(x / 23) * 3;   // pendio del bosco dietro

function paintOrrido() {
  const b = new Buf(OW, SH);
  const r = rng(4242);
  paintNightSky(b, OW, 70, 21);

  /* ---- pendio boscoso dietro, con la fessura e la cascatella ---- */
  b.rect(0, 0, OW, 118, (x, y) => y < orSlope(x) ? null : (hash2(x >> 1, y >> 1, 509) < 0.25 ? '#141c10' : hexMix(leafLitter(x, y), '#000000', 0.58 + clamp((y - orSlope(x)) / 400, 0, 0.15))));
  const cleft = [[20, orSlope(20)], [118, orSlope(118)], [104, 76], [96, 104], [74, 104], [52, 74]];
  b.poly(cleft, (x, y) => {
    const m = fbm(x / 5, y / 4, 510, 3);
    const edge = Math.min(Math.abs(x - lerp(20, 74, (y - 32) / 72)), Math.abs(x - lerp(118, 96, (y - 46) / 58)));
    if (edge < 5) return m > 0.55 ? ramp(NIGHT.moss, (m - 0.55) * 2.5, x, y) : ramp(NIGHT.rock, clamp(m * 0.8, 0, 0.999), x, y);
    return ramp(['#020304', '#06080a', '#0c0e10'], hash2(x >> 1, y >> 1, 511) * 0.6, x, y);
  });
  for (let y = 46; y < 104; y++) { const x = 86 + Math.round(Math.sin(y / 9) * 1.5); b.set(x, y, y % 3 ? '#b8c4c8' : '#e8eef0'); b.set(x + 1, y, '#7a8a90'); }
  // la fessura continua dietro il ponte
  b.poly([[214, orSlope(214)], [290, orSlope(290)], [270, 92], [262, 118], [232, 118], [222, 92]], (x, y) => {
    const m = fbm(x / 5, y / 4, 512, 3);
    return m > 0.6 ? ramp(NIGHT.rock, m - 0.3, x, y) : ramp(['#020304', '#06080a', '#0c0e10'], hash2(x >> 1, y >> 1, 513) * 0.5, x, y);
  });

  /* ---- faggi sottili sullo sfondo ---- */
  for (let i = 0; i < 64; i++) {
    const x = r() * OW | 0, w = 1 + (r() * 3 | 0), bot = Math.min(112, orSlope(x) + 10 + r() * 70);
    if (x > 20 && x < 118 && bot > 70) continue;
    b.rect(x, 0, w, bot, (px, py) => px === x ? '#1e2022' : ramp(['#2a2c2c', '#383a3a', '#464846'], hash2(px, py >> 2, 514), px, py));
  }
  /* ---- chiome scure con i buchi per le stelle ---- */
  for (let i = 0; i < 260; i++) {
    const x = r() * OW, y = r() * 26, rad = 3 + r() * 7;
    b.ellipse(Math.round(x), Math.round(y), Math.round(rad), Math.round(rad * 0.6), (px, py) => hash2(px, py, 515) < 0.18 ? null : ramp(['#060a06', '#0a100a', '#101810', '#182418'], clamp(hash2(px, py, 516) * 0.7 + (px - x) / 30, 0, 0.999), px, py));
  }

  /* ---- faggi grandi: corteccia liscia e grigia ---- */
  const beech = (cx, w, bot) => {
    b.rect(cx - (w >> 1), 0, w, bot, (x, y) => {
      const u = (x - cx + w / 2) / w;
      if (hash2(x >> 1, y >> 2, cx) < 0.06) return '#2a2c28';
      if (fbm(x / 2, y / 5, cx + 1, 2) > 0.66) return ramp(NIGHT.moss, 0.5, x, y);
      return ramp(['#3a3c3a', '#55585a', '#6e7274', '#8a8e90'], clamp(0.15 + u * 0.8 + vnoise(x, y / 12, cx) * 0.15, 0, 0.999), x, y);
    });
    b.rect(cx - (w >> 1) - 2, bot - 4, w + 4, 4, '#2a241c');
  };
  beech(52, 12, 106); beech(100, 9, 104); beech(372, 11, 112);

  /* ---- terreno: sentiero a sinistra, riva lontana a destra ---- */
  b.poly([[0, 96], [148, 104], [148, 144], [0, 144]], leafLitter);
  b.poly([[0, 120], [60, 117], [140, 115], [150, 115], [150, 122], [120, 132], [60, 140], [0, 142]], (x, y) =>
    hash2(x, y, 517) < 0.22 ? leafLitter(x, y) : ramp(['#4e4236', '#5e5040', '#6e5e4a'], hash2(x, y, 518), x, y));
  for (const [sx, sy, rx, ry] of [[112, 134, 8, 4], [128, 127, 4, 3], [30, 133, 5, 3]]) {
    b.ellipse(sx, sy, rx, ry, (px, py) => ramp(['#8a8a84', '#aeaca6', '#cfccc4', '#e4e2dc'], clamp(0.8 - (py - sy) / (ry * 2) - (px - sx) / (rx * 4), 0, 0.999), px, py));
  }
  b.poly([[340, 112], [400, 106], [400, 144], [350, 144]], leafLitter);
  b.poly([[342, 118], [400, 114], [400, 124], [346, 126]], (x, y) => hash2(x, y, 519) < 0.25 ? leafLitter(x, y) : ramp(['#4e4236', '#5e5040'], hash2(x, y, 520), x, y));

  /* ---- l'orrido sotto il ponte ---- */
  b.rect(146, 118, 198, 26, (x, y) => ramp(['#010203', '#040608', '#080a0c'], hash2(x >> 1, y, 521) * 0.5 + (144 - y) / 80, x, y));
  b.poly([[144, 116], [180, 120], [200, 144], [144, 144]], rockShader(NIGHT.rock, 522));
  b.poly([[310, 120], [346, 114], [350, 144], [292, 144]], rockShader(NIGHT.rock, 523));
  b.line(180, 120, 200, 144, '#a8a69e'); b.line(310, 120, 292, 144, '#5a5850');
  // travi di sostegno piantate nella roccia
  b.thick(176, 126, 190, 142, 3, '#2a1a0e'); b.thick(316, 126, 302, 142, 3, '#2a1a0e');

  /* ---- staccionata di pali lungo il sentiero ---- */
  const pole = (x0, y0, x1, y1) => { b.thick(x0, y0, x1, y1, 2, '#5a4a36'); b.line(x0, y0 - 1, x1, y1 - 1, '#9a8a6a'); };
  for (const px of [6, 58, 108, 146]) { b.rect(px, 92 + px * 0.05, 3, 24, '#4a3a28'); b.rect(px, 92 + px * 0.05, 1, 24, '#7a6a4e'); }
  pole(0, 95, 150, 101); pole(0, 106, 150, 111);

  /* ---- il ponte coperto ---- */
  const wood = (x, y) => ramp(['#3a2414', '#4e321c', '#634228', '#785434'], clamp(0.3 + vnoise(x / 2, y / 7, 524) * 0.6, 0, 0.999), x, y);
  // parete di assi del lato lontano e pavimento
  b.rect(176, 90, 170, 24, (x, y) => ((x - 176) % 4 === 0) ? '#2a1a0e' : hexMix(wood(x, y), '#000000', 0.25));
  b.rect(176, 88, 170, 3, '#5a3e24'); b.rect(176, 88, 170, 1, '#7a5634');
  b.rect(134, 113, 214, 6, (x, y) => ((x - 134) % 6 === 0) ? '#22140a' : ramp(['#4a3220', '#5e4028', '#725034'], hash2(x >> 2, y, 525), x, y));
  for (const px of [222, 266, 310]) b.rect(px, 66, 3, 24, '#3a2414');
  // dentro, sotto il tetto: buio
  b.rect(176, 66, 170, 22, (x, y) => ramp(['#06080a', '#0a0c0e', '#101214'], hash2(x >> 1, y >> 1, 526) * 0.6, x, y));
  // tetto di telo verde (lato lungo)
  b.poly([[154, 40], [346, 40], [356, 67], [176, 67]], (x, y) => {
    const fold = Math.sin((x - y * 0.4) / 7) * 0.5 + 0.5;
    if (((x + Math.round(y * 0.8)) % 23) === 0) return '#142a16';
    return ramp(['#1a321c', '#24442a', '#305634', '#3e6a40', '#527e50'], clamp(0.25 + fold * 0.35 + (y - 40) / 90 + hash2(x, y, 527) * 0.12, 0, 0.999), x, y);
  });
  b.line(154, 40, 346, 40, '#5e8a5a');
  b.poly([[156, 37], [344, 37], [346, 40], [154, 40]], '#142616');
  b.rect(176, 66, 180, 2, '#3a2414'); b.line(176, 68, 356, 68, '#1e3a20');
  // timpano verso il sentiero: capriata a vista e cartello
  b.poly([[132, 67], [154, 40], [176, 67]], (x, y) => ramp(['#06080a', '#0c0e10'], hash2(x, y, 528), x, y));
  b.thick(132, 66, 154, 40, 2, '#5a3a22'); b.thick(176, 66, 154, 40, 2, '#5a3a22');
  b.line(130, 67, 153, 39, '#3e6a40'); b.line(178, 67, 155, 39, '#2a4e2c'); b.line(129, 68, 152, 40, '#527e50');
  b.rect(153, 41, 3, 24, '#5e3e24');
  b.line(154, 56, 140, 64, '#5e3e24'); b.line(155, 56, 168, 64, '#5e3e24');
  b.rect(130, 63, 48, 4, wood); b.rect(130, 63, 48, 1, '#8a6440');
  b.rect(140, 68, 28, 13, '#d8c49a'); b.rect(140, 68, 28, 1, '#f0e0b8'); b.rect(140, 80, 28, 1, '#8a7450');
  b.rect(139, 67, 1, 15, '#5a3e24'); b.rect(168, 67, 1, 15, '#5a3e24');
  orText(b, 143, 70, 'ORRIDO', '#4a2a14'); orText(b, 143, 76, 'RASCIE', '#4a2a14');
  // pali d'angolo dell'ingresso (quello davanti è in primo piano)
  b.rect(133, 66, 3, 52, wood); b.rect(133, 66, 1, 52, '#8a6440');
  return b.canvas();
}

/* ---------- primo piano: parapetto, pali e corrimano ---------- */
function orridoFrontCanvas() {
  return canvasOf('orFront', OW, SH, b => {
    const wood = (x, y) => ramp(['#3a2414', '#4e321c', '#634228', '#785434'], clamp(0.3 + vnoise(x / 2, y / 7, 530) * 0.6, 0, 0.999), x, y);
    // assi del parapetto davanti
    b.rect(176, 101, 172, 21, (x, y) => ((x - 176) % 5 === 0) ? '#22140a' : wood(x, y));
    b.rect(174, 98, 176, 4, wood); b.rect(174, 98, 176, 1, '#9a7448');
    // pali del lato lungo
    for (const px of [174, 220, 264, 308, 348]) { b.rect(px, 66, 4, 60, wood); b.rect(px, 66, 1, 60, '#8a6440'); b.rect(px + 3, 66, 1, 60, '#22140a'); }
    // trave del pavimento
    b.rect(130, 122, 222, 4, '#2e1c0e'); b.rect(130, 122, 222, 1, '#6a4a2c');
    // corrimano di tronchetti sulla riva destra
    for (const [px, top, bot] of [[362, 104, 140], [390, 112, 144]]) { b.rect(px, top, 4, bot - top, '#5a4a36'); b.rect(px, top, 1, bot - top, '#9a8a6a'); }
    b.thick(350, 104, 400, 118, 3, '#5a4a36'); b.line(350, 103, 400, 117, '#9a8a6a');
    b.thick(350, 116, 400, 132, 3, '#5a4a36'); b.line(350, 115, 400, 131, '#9a8a6a');
  });
}

/* ---------- gli amici all'orrido ---------- */
const OR_AMICI = makeAmici();
const OR_SPOTS = [[52, 132], [78, 137], [100, 127]];
function orAmiciPlace() {
  OR_AMICI.forEach((a, i) => { a.path = []; a.onArrive = null; a.x = OR_SPOTS[i][0]; a.y = OR_SPOTS[i][1]; a.dir = 'right'; a.lamp = !!Game.flags.frontaliOn; });
}

/* ---------- script ---------- */
async function orridoIntro() {
  const f = Game.flags, A = OR_AMICI;
  A.forEach((a, i) => { a.x = -18 - i * 18; a.y = 130; a.lamp = false; walkStraight(a, [OR_SPOTS[i]]).then(() => { a.dir = 'right'; }); });
  await walkTo(hero, 124, 124); hero.dir = 'right';
  await say(hero, "Eccolo... l'orrido Rascie.");
  await say(hero, "Un ponticello col tetto di telo verde, sopra una fessura nera. Da sotto sale il rumore dell'acqua.");
  hero.dir = 'left';
  await say(A[0], 'Kodo, spegni la frontale! Guardiamo le stelle.');
  f.lampOn = false; SFX.clack(); await wait(700);
  await say(A[1], 'Ooooh.');
  await say(A[2], 'Non si vede niente.');
  await say(A[0], 'Appunto. Le stelle.');
  await say(A[1], "Sì, ma adesso non vedo neanche l'orrido. E ci sono sopra.");
  await say(A[2], 'Kodo, riaccendi. E accendiamo tutti le frontali.');
  f.orridoSeen = true;
}
async function accendiFrontali() {
  const f = Game.flags, A = OR_AMICI;
  if (f.frontaliOn) return say(hero, 'Sono già tutte accese. Sembriamo un albero di Natale.');
  f.lampOn = true; SFX.clack(); await wait(300);
  for (const a of A) { a.lamp = true; SFX.clack(); await wait(300); }
  f.frontaliOn = true;
  addScore('frontali', 10);
  await say(hero, 'Frontali accese! Quattro fari nella notte.');
  await say(A[1], "Eccolo, l'orrido Rascie. Che orrido.");
  await say(A[0], 'Proprio orrido. Bellissimo.');
  await say(A[2], 'Ho fame.');
}
async function arachidiScene() {
  const f = Game.flags, A = OR_AMICI;
  if (f.arachidiDone) return say(hero, 'Finite. Anche le briciole.');
  if (!f.frontaliOn) return say(hero, 'Al buio? Rischio di mangiare una pigna. Prima accendiamo le frontali.');
  await walkTo(hero, 122, 126); hero.dir = 'left';
  await say(hero, 'Ragazzi... arachidi di Halloween della Lidl!');
  takeItem('arachidi');
  await say(A[2], 'Quelle col sacchetto con la zucca?!');
  await say(hero, 'Edizione limitata. Le ho trovate in offerta a novembre.');
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  for (let k = 0; k < 3; k++) {
    SFX.gulp();
    for (const a of [hero, ...A]) addParticle({ x: a.x + (Math.random() - 0.5) * 4, y: a.y - 40 * actorScale(a), vx: (Math.random() - 0.5) * 20, vy: -10, g: 120, life: 0.7, c: pick(['#c89a5a', '#a87a3a', '#e8c890']), fade: true });
    await wait(450);
  }
  await say(A[0], 'Sanno di arachide. E un po\' di Halloween.');
  await say(A[1], "Lo sapete che i giovani d'oggi le arachidi le comprano già sgusciate?");
  await say(A[0], "I giovani d'oggi non sanno neanche cos'è un guado.");
  await say(hero, "I giovani d'oggi il guado lo attraversano col navigatore.");
  await say(A[2], "I giovani d'oggi l'orrido lo guardano sul telefono. Dal divano.");
  await say(A[1], 'Noi alla loro età venivamo qui a piedi. Di notte. Con le arachidi.');
  await say(A[0], "Noi alla loro età eravamo... i giovani d'oggi.");
  await wait(900);
  await say(hero, '...');
  await say(A[2], 'Quindi siamo vecchi?');
  await say(hero, 'No. Siamo esperti. Abbiamo le frontali.');
  await say(A[1], 'E le arachidi di Halloween.');
  await say(A[0], 'A novembre.');
  addScore('arachidi', 20);
  f.arachidiDone = true;
  await say(hero, 'Si torna alla baita. Le costine non si grigliano da sole.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(2);
}
const telefonoOrrido = () => say(hero, "Zero campo. Neanche l'orrido prende. È proprio un orrido.");

const ROOM_ORRIDO = {
  id: 'orrido', title: 'Orrido Rascie', width: OW,
  links: { guado: 'uscitaOrrido' },
  spawn: [124, 124],
  walk: [[4, 120], [140, 117], [150, 115], [338, 115], [398, 114], [398, 128], [346, 124], [338, 121], [150, 121], [130, 132], [60, 141], [4, 142]],
  scaleAt(y) { return clamp(0.86 + (y - 115) / 27 * 0.14, 0.86, 1); },
  _ready: false,
  init() { if (this._ready) return; this.bg = paintOrrido(); this._ready = true; },
  enter() {
    orAmiciPlace();
    if (!Game.flags.orridoSeen) runScript(orridoIntro);
  },
  darkness() { return Game.flags.lampOn || Game.flags.frontaliOn ? 0.86 : 0.94; },
  lights() {
    const f = Game.flags;
    const L = [{ x: 300, y: 2, r: 60, a: 0.4 }, { x: 86, y: 70, r: 26, a: 0.3, tint: 'rgba(170,190,210,0.06)' }, { x: 154, y: 74, r: 22, a: 0.25 }];
    if (f.lampOn) L.push(...heroLights(74, 'rgba(150,170,255,0.10)'));
    else L.push({ x: hero.x, y: hero.y - 26, r: 22, a: 0.5 });
    for (const a of OR_AMICI) { if (a.lamp) L.push(...amicoLights(a)); else L.push({ x: a.x, y: a.y - 26, r: 16, a: 0.35 }); }
    return L;
  },
  drawBack(g, cam) { g.drawImage(this.bg, -cam, 0); },
  objects() {
    const list = [
      { y: 119.9, draw: g => {
        // l'acqua in fondo all'orrido e la cascatella
        for (let i = 0; i < 12; i++) {
          const x = 206 + ((i * 29 + Game.t * 14) % 84), y = 140 + (i % 3);
          g.fillStyle = i % 3 ? 'rgba(200,214,220,0.35)' : 'rgba(240,248,255,0.55)'; g.fillRect(x | 0, y, 3, 1);
        }
        for (let y = 48; y < 104; y += 3) { const k = ((y + Game.t * 40) | 0) % 9; if (k < 3) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(86 + Math.round(Math.sin(y / 9) * 1.5), y, 1, 2); } }
      } },
      { y: 300, draw: g => g.drawImage(orridoFrontCanvas(), 0, 0) },
    ];
    for (const a of OR_AMICI) list.push({ y: a.y, draw: g => drawAmico(g, a) });
    return list;
  },
  itemVerbs: {
    telefono: { usa: telefonoOrrido },
    frontale: { usa: () => accendiFrontali() },
    arachidi: { usa: () => arachidiScene() },
  },
  update(dt) {
    for (const a of OR_AMICI) if (a.path.length) updateActor(a, dt);
    if (Math.random() < dt * 0.7) addParticle({ x: Math.random() * OW, y: 0, vx: 2, vy: 8, life: 14, c: pick(['#9a4a20', '#b8622c', '#7a3416', '#c89a30']), sway: Math.random() * 6, ground: 110 + Math.random() * 32, fade: true });
  },
  hotspots: [],
};
ROOMS.orrido = ROOM_ORRIDO;

const FO = () => Game.flags;
const orLit = () => FO().lampOn || FO().frontaliOn;
const AMICI_CHIACCHIERE = [
  ['Secondo me di giorno è meno orrido.', 'Secondo me di giorno è più orrido.'],
  ['Kodo, il colbacco ti dona. Anche al buio.', 'Lo so.'],
  ['Chi ha portato da bere?', 'Le costine e la Guinness ci aspettano alla baita.'],
];
const orUseGroup = {
  frontale: () => accendiFrontali(), arachidi: () => arachidiScene(), telefono: telefonoOrrido,
};
ROOM_ORRIDO.hotspots = [
  { id: 'cielo3', name: 'Cielo', rects: [[0, 0, 400, 12]], hint: false,
    verbs: { guarda: () => say(hero, 'Tra le chiome dei faggi si vede qualche stella. Sembrano sbirciare dentro.') } },
  { id: 'bosco3', name: 'Bosco', rects: [[0, 12, 400, 84]], hint: false,
    verbs: { guarda: () => say(hero, 'Un bosco di faggi, ripido. Di notte ogni tronco sembra una persona ferma che ti guarda.') } },
  { id: 'faggi', name: 'Faggi', rects: [[46, 0, 13, 92], [96, 0, 10, 92], [366, 0, 12, 112]],
    verbs: {
      guarda: () => say(hero, 'Faggi enormi, con la corteccia liscia e grigia. Al buio sembrano colonne di un tempio.'),
      spingi: () => say(hero, 'Spingo un faggio di trecento anni. Lui non se ne accorge nemmeno.'),
    } },
  { id: 'cascatella', name: 'Cascatella', rects: [[70, 44, 34, 48]], walk: [86, 124], face: 'up',
    verbs: { guarda: () => say(hero, "Dietro la staccionata la roccia si spacca, e da lassù scende un filo d'acqua bianca. È l'orrido che comincia.") } },
  { id: 'staccionata', name: 'Staccionata', rects: [[0, 90, 150, 24]], walk: () => [clamp(hero.x, 20, 140), 124], face: 'up',
    verbs: {
      guarda: () => say(hero, "Una staccionata di pali. Di là c'è il vuoto. La tengo stretta e mi sento meno coraggioso."),
      spingi: () => say(hero, 'Spingere la staccionata che mi separa dal burrone? Ottima idea, Kodo. Davvero.'),
      usa: () => say(hero, 'Mi appoggio... scricchiola. Mi stacco.'),
    } },
  { id: 'sassi', name: 'Sassi bianchi', rects: [[104, 124, 30, 14]], walk: [100, 132], face: 'right',
    verbs: {
      guarda: () => say(hero, 'Sassi bianchi di calcare. Al buio sono le uniche cose che si vedono. Utili per non finire nel burrone.'),
      raccogli: () => say(hero, 'Pesano come un frigorifero. Di nuovo.'),
    } },
  { id: 'tettoVerde', name: 'Tetto di telo verde', rects: [[134, 36, 222, 30]],
    verbs: {
      guarda: () => say(hero, 'Il tetto del ponte è un telo verde da camion tirato sulle travi. Quando piove fa un rumore da concerto rock.'),
      tira: () => say(hero, "Se tiro il telo, il tetto vola giù nell'orrido. E io con lui."),
    } },
  { id: 'ponte', name: 'Ponte coperto', rects: [[130, 66, 222, 56]], walk: [200, 119], face: 'right',
    verbs: {
      guarda: () => say(hero, "Una casetta di legno appoggiata sopra l'orrido: un ponte col tetto. Così guardi giù nel vuoto, ma senza bagnarti."),
      usa: () => say(hero, 'Ci cammino sopra piano piano. Le assi scricchiolano a ogni passo. Anche il mio cuore.'),
    },
    use: orUseGroup },
  { id: 'parapetto', name: 'Parapetto', rects: [[176, 98, 172, 24]], walk: [244, 119], face: 'down',
    verbs: {
      guarda: () => say(hero, orLit() ? "Assi di legno alte fino alla pancia. Mi sporgo e guardo giù: roccia, buio e in fondo un filo d'acqua bianca." : 'Assi di legno. Di là, il nero.'),
      spingi: () => say(hero, 'No. Assolutamente no.'),
    } },
  { id: 'cartelloOrrido', name: 'Cartello', rects: [[138, 66, 32, 16]], walk: [150, 119], face: 'up',
    verbs: {
      guarda: () => say(hero, orLit() ? "C'è scritto 'ORRIDO RASCIE', inciso nel legno. Almeno so di essere nel posto giusto." : 'Un cartello sulla trave. Al buio non leggo niente.'),
      raccogli: () => say(hero, 'Il cartello resta qui. Senza, uno arriva e pensa di essere davanti a un ponte qualunque.'),
    } },
  { id: 'orrido', name: 'Orrido Rascie', rects: [[180, 122, 130, 22], [222, 40, 48, 26]], walk: [244, 119], face: 'down',
    verbs: {
      guarda: () => say(hero, orLit()
        ? "Sotto il ponte la roccia si apre in una fessura nera, stretta e profonda. In fondo si sente l'acqua, ma non si vede. Fa paura. Fa... orrido."
        : "Sotto i piedi solo nero. Potrebbe essere l'orrido. O la mia anima."),
      usa: () => say(hero, "Scendere là sotto? L'orrido si guarda dall'alto. Lo dice la parola stessa."),
    },
    use: orUseGroup },
  { id: 'amici', name: 'Amici', person: true, rects: () => OR_AMICI.map(a => [a.x - 8, a.y - 50 * actorScale(a), 16, 50 * actorScale(a)]), walk: [122, 126], face: 'left',
    verbs: {
      guarda: () => say(hero, FO().frontaliOn ? 'I miei amici, con le frontali in testa. Sembrano minatori in gita.' : 'I miei amici. Al buio sono solo sagome, ma li riconosco dal rumore che fanno.'),
      parla: async () => {
        const c = AMICI_CHIACCHIERE[(Game.flags.chiacchiere = ((Game.flags.chiacchiere || 0) + 1)) % AMICI_CHIACCHIERE.length];
        await say(OR_AMICI[Game.flags.chiacchiere % 3], c[0]); await say(hero, c[1]);
      },
    },
    give: Object.assign({ '*': () => say(hero, "Non credo che lo vogliano. Vogliono le arachidi. Lo sento.") }, orUseGroup),
    use: orUseGroup },
  { id: 'rivaLontana', name: 'Sentiero', rects: [[352, 104, 48, 30]], walk: [384, 120], face: 'right',
    verbs: { guarda: () => say(hero, "Il sentiero continua nel bosco, chissà dove. Ma noi siamo venuti per l'orrido, e l'orrido è qui.") } },
  { id: 'uscitaOrrido', name: 'Sentiero per il guado', rects: [[0, 112, 12, 32]], walk: [10, 130], face: 'left', exit: true,
    verbs: { vai: () => say(hero, FO().frontaliOn ? 'Prima le arachidi. Le ho portate fin qui apposta.' : 'Tornare indietro al buio? Prima accendiamo le frontali.') } },
];
