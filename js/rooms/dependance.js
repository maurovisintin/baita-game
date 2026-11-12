'use strict';
/* =========================================================
   LA DÉPENDANCE: il bagnetto vecchio della dépendance,
   col water intasato e i ghiri che ne hanno preso possesso.
   Capitolo 4: Chino, il crocifisso e lo sturalavandini.
   ========================================================= */
const DPW = 320;
const DP_FLOOR = { yb: 104, yh: 70, f: 70, vpx: 160 };
const dpGhiro = { x: 120, y: 100, st: 'hidden', flip: false };
const dpGhiroActor = makeActor({ name: 'Ghiro', color: '#efe2c8', headPos: () => [dpGhiro.x, dpGhiro.y - 10] });

function paintDependance(night) {
  const b = new Buf(DPW, SH);
  const plasterPal = ['#b8b4a0', '#c6c2ae', '#d2cebc', '#dcd8c8'];
  const plaster = stuccoShader(plasterPal, 600);
  const tile = (x, y) => {
    const tx = ((x - 60) % 8 + 8) % 8, ty = ((y - 68) % 7 + 7) % 7;
    if (tx === 0 || ty === 0) return '#7a8a7a';
    if (hash2(x >> 3, y / 7 | 0, 601) < 0.08) return '#c8d8b8';
    return ramp(['#8aa890', '#9ab8a0', '#a8c4ac'], clamp(0.5 + (tx === 1 || ty === 1 ? 0.3 : 0) - (tx === 7 ? 0.3 : 0) + hash2(x, y, 602) * 0.2, 0, 0.999), x, y);
  };
  /* ---- soffitto ---- */
  b.poly([[0, 0], [320, 0], [320, 12], [260, 34], [60, 34], [0, 12]], (x, y) => ramp(['#9a968a', '#aaa698', '#b8b4a6'], clamp(0.3 + y / 50 + hash2(x, y, 603) * 0.2, 0, 0.999), x, y));
  b.ellipse(232, 18, 14, 5, (x, y) => hash2(x, y, 604) < 0.6 ? '#8a8268' : null); // macchia di umido
  /* ---- pareti laterali ---- */
  b.poly([[0, 12], [60, 34], [60, 104], [0, 124]], (x, y) => y > 70 + (60 - x) * 0.1 ? hexMix(tile(x + 400, y), '#2a2a1a', 0.25) : hexMix(plaster(x, y), '#2a2a1a', 0.25));
  b.poly([[260, 34], [320, 12], [320, 124], [260, 104]], (x, y) => y > 70 + (x - 260) * 0.1 ? hexMix(tile(x + 400, y), '#2a2a1a', 0.32) : hexMix(plaster(x, y), '#2a2a1a', 0.32));
  /* ---- muro di fondo: intonaco sopra, piastrelle sotto ---- */
  b.rect(60, 34, 200, 36, plaster);
  b.rect(60, 34, 200, 36, (x, y) => fbm(x / 9, y / 6, 605, 3) > 0.62 ? hexMix(plaster(x, y), '#5a6040', 0.35) : null); // muffa
  b.rect(60, 68, 200, 36, tile);
  b.rect(60, 68, 200, 1, '#e8eee0');
  b.line(60, 34, 60, 104, '#7a7a6a'); b.line(259, 34, 259, 104, '#6a6a5a');
  /* ---- pavimento a scacchi in prospettiva ---- */
  b.poly([[60, 104], [260, 104], [320, 124], [320, 144], [0, 144], [0, 124]], (x, y) => {
    const P = DP_FLOOR, k = (P.yb - P.yh) / (y + 0.5 - P.yh);
    const X = (P.vpx + (x + 0.5 - P.vpx) * k) / 14, Z = P.f * (1 - k) / 9;
    const c = ((Math.floor(X) + Math.floor(Z)) & 1) ? ['#2a2a2e', '#34343a'] : ['#c8c4b8', '#d8d4c8'];
    return c[hash2(x, y, 606) < 0.5 ? 0 : 1];
  });
  /* ---- porta (parete sinistra) ---- */
  b.poly([[11, 40], [47, 47], [47, 110], [11, 122]], '#3a2410');
  b.poly([[14, 43], [44, 49], [44, 109], [14, 120]], (x, y) => ramp(['#5a3a20', '#6a4628', '#7a5432'], clamp(0.4 + vnoise(x * 0.9, y / 8, 607) * 0.5 + (((x - 14) % 7) === 0 ? -0.3 : 0), 0, 0.999), x, y));
  b.rect(39, 80, 2, 2, '#c8b060');
  /* ---- finestrella in alto ---- */
  b.rect(94, 40, 30, 20, '#3a3a34');
  b.rect(96, 42, 26, 16, (x, y) => night ? ramp(['#0c1228', '#141c38'], hash2(x, y, 608), x, y) : ramp(['#c8d4dc', '#dce4e8'], hash2(x, y, 609), x, y));
  b.rect(96, 42, 26, 16, (x, y) => ((x + y) % 3 === 0) ? (night ? '#26304a' : '#f0f4f4') : null); // vetro smerigliato
  b.rect(108, 42, 2, 16, '#3a3a34');
  /* ---- buco nel muro: i ghiri ---- */
  b.ellipse(242, 48, 7, 5, '#1a140e'); b.ellipse(242, 49, 6, 4, '#0a0806');
  for (let i = 0; i < 8; i++) b.set(234 + i * 2, 43 + (i & 1), '#6a5a40');
  /* ---- specchio, lavandino, mobiletto ---- */
  b.rect(102, 44, 32, 20, '#8a8a84'); b.rect(104, 46, 28, 16, (x, y) => ramp(['#7a8a94', '#9aaab4', '#b8c4cc'], clamp((x - 104) / 40 + (y - 46) / 40, 0, 0.999), x, y));
  b.line(112, 46, 122, 61, '#e8eef0'); b.line(122, 61, 126, 52, '#e8eef0');
  b.ellipse(118, 72, 17, 4, '#e8e8e0'); b.rect(101, 72, 35, 4, '#dcdcd4'); b.ellipse(118, 72, 13, 2, '#a8acaa');
  b.rect(116, 66, 4, 4, '#b8b8b0'); b.rect(117, 65, 2, 1, '#e0e0d8');
  b.rect(102, 76, 33, 2, '#c8c8c0');
  /* ---- water con lo sciacquone a catena ---- */
  b.rect(170, 38, 28, 13, '#e8e8e0'); b.rect(170, 38, 28, 1, '#ffffff'); b.rect(170, 50, 28, 1, '#a8a8a0'); b.rect(196, 39, 2, 11, '#c8c8c0');
  b.rect(181, 51, 3, 30, '#c8c8c0'); b.rect(181, 51, 1, 30, '#e8e8e0');
  b.rect(170, 70, 28, 8, '#f0f0e8'); b.rect(170, 70, 28, 1, '#ffffff'); b.rect(170, 77, 28, 1, '#a8a8a0'); // coperchio alzato
  /* ---- doccia con la tenda a fiori ---- */
  b.rect(214, 68, 44, 36, (x, y) => tile(x, y));
  b.rect(240, 40, 2, 10, '#a8a8a8'); b.ellipse(236, 50, 5, 2, '#c8c8c8');
  b.rect(212, 38, 48, 2, '#8a8a8a');
  b.rect(212, 40, 22, 62, (x, y) => {
    const fold = ((x - 212) % 5);
    const h = hash2(x >> 1, y >> 1, 610);
    const base = fold === 0 ? '#c8b8c0' : fold < 3 ? '#e8dce0' : '#f4ecee';
    return h < 0.08 ? '#c84a6a' : h < 0.12 ? '#6a9a5a' : base;
  });
  for (let x = 212; x < 234; x += 2) b.set(x, 102, '#b8a8b0');
  b.rect(244, 64, 3, 2, '#8a8a8a');
  /* ---- lampadina nuda ---- */
  b.rect(160, 0, 1, 16, '#2a2a2a'); b.rect(158, 16, 5, 3, '#4a4a4a');
  b.ellipse(160, 21, 3, 3, night ? '#fff4c8' : '#e8e0c0');
  return b.canvas();
}

/* ---------- oggetti che cambiano ---------- */
function dpWaterCanvas(sturato) {
  return canvasOf('dpWater' + (sturato ? 1 : 0), 32, 30, b => {
    b.ellipse(15, 9, 14, 5, '#f4f4ec');
    b.ellipse(15, 9, 11, 3, sturato ? '#a8c8d8' : '#7a7258');
    if (!sturato) for (let i = 0; i < 6; i++) b.set(8 + i * 3, 9 + (i & 1), '#5a5240');
    b.rect(5, 12, 21, 10, (x, y) => ramp(['#c8c8c0', '#e0e0d8', '#f4f4ec'], clamp(0.8 - Math.abs(x - 15) / 14, 0, 0.999), x, y));
    b.rect(8, 22, 15, 6, '#e8e8e0'); b.rect(8, 27, 15, 1, '#a8a8a0');
    b.ellipse(15, 8, 14, 1, '#ffffff');
  });
}
function dpMobilettoCanvas(open) {
  return canvasOf('dpMob' + (open ? 1 : 0), 34, 28, b => {
    const wood = (x, y) => ramp(['#6a4a2a', '#7e5a34', '#926a40'], clamp(0.4 + vnoise(x, y / 6, 611) * 0.5, 0, 0.999), x, y);
    b.rect(0, 0, 34, 28, wood); b.rect(0, 0, 34, 1, '#a8804a'); b.rect(0, 27, 34, 1, '#3a2614');
    if (!open) { b.rect(16, 2, 1, 24, '#3a2614'); b.set(13, 13, '#d8c070'); b.set(19, 13, '#d8c070'); return; }
    b.rect(2, 2, 30, 24, '#120c06');
    b.rect(0, 2, 3, 24, wood); b.rect(31, 2, 3, 24, wood);
    b.rect(4, 22, 26, 2, '#2a2014');
  });
}

/* ---------- script del capitolo 4 ---------- */
const FD = () => Game.flags;
async function dependanceIntro() {
  const f = FD();
  f.ch4Intro = true;
  await walkTo(hero, 92, 124); hero.dir = 'right';
  await say(hero, 'La dépendance. Luciano l\'aveva detto: i ghiri ne hanno preso possesso.');
  await say(hero, 'E il water è intasato. Dalla puzza, dal 2019.');
  hero.dir = 'down';
  await say(hero, 'Signore, dammi la forza. E uno sturalavandini.');
  banner('OBIETTIVO: stura il water della dépendance.', 5);
}
async function apriMobiletto() {
  const f = FD();
  if (f.mobileAperto) return say(hero, 'È già aperto.');
  await walkTo(hero, 118, 112); hero.dir = 'up';
  hero.pose = 'reach'; SFX.creak(); await wait(300); hero.pose = 'stand';
  f.mobileAperto = true;
  if (!f.ghiroScacciato) {
    dpGhiro.st = 'sit'; dpGhiro.x = 118; dpGhiro.y = 99; SFX.chirp();
    await say(dpGhiroActor, 'Fffff!');
    await say(hero, 'Un ghiro! Seduto sopra lo sturalavandini. Ovviamente.');
  } else await say(hero, 'Dentro c\'è lo sturalavandini.');
}
async function scacciaGhiro() {
  const f = FD();
  if (f.ghiroScacciato) return say(hero, 'Il ghiro se n\'è già andato. Pace all\'anima sua. Anzi no, è vivo.');
  if (!f.mobileAperto) return say(hero, 'Non vedo ghiri. Li sento, però.');
  await walkTo(hero, 118, 112); hero.dir = 'up';
  hero.pose = 'reach';
  await say(hero, 'Vade retro, ghiro!', { big: true, dur: 1400 });
  hero.pose = 'stand'; SFX.chirp();
  await say(dpGhiroActor, 'Squiiit!');
  dpGhiro.st = 'run'; dpGhiro.flip = false;
  await tween(dpGhiro, { x: 200, y: 104 }, 500);
  await tween(dpGhiro, { x: 242, y: 50 }, 600);
  dpGhiro.st = 'hidden';
  f.ghiroScacciato = true;
  addScore('ghiroDep', 20);
  await say(hero, 'Funziona! Il crocifisso funziona anche sui ghiri.');
}
async function prendiSturalavandini() {
  const f = FD();
  if (hasItem('sturalavandini') || f.sturato) return say(hero, "Ce l'ho già. Lo tengo stretto come una reliquia.");
  if (!f.mobileAperto) return say(hero, 'Prima apro il mobiletto.');
  if (!f.ghiroScacciato) return say(hero, 'Il ghiro ci sta seduto sopra. E mi guarda male.');
  await walkTo(hero, 118, 112); hero.dir = 'up';
  hero.pose = 'reach'; await wait(350); hero.pose = 'stand';
  giveItem('sturalavandini');
  addScore('sturalavandini', 15);
  await say(hero, 'Lo sturalavandini. Ventosa rossa, manico di legno. L\'arma finale.');
}
async function prendiGuanti() {
  const f = FD();
  if (f.guantiPresi) return say(hero, 'Li ho già. Gialli e bellissimi.');
  await walkTo(hero, 240, 110); hero.dir = 'up';
  hero.pose = 'reach'; await wait(350); hero.pose = 'stand';
  f.guantiPresi = true; giveItem('guanti');
  addScore('guanti', 15);
  await say(hero, "Guanti di gomma gialli. L'armatura del sacerdote dell'idraulica.");
}
async function sturaWater() {
  const f = FD();
  if (f.sturato) return say(hero, 'È già sturato. Non insistiamo con la fortuna.');
  if (!hasItem('guanti')) return say(hero, 'Senza guanti? Neanche col crocifisso.');
  await walkTo(hero, 188, 110); hero.dir = 'up';
  for (let i = 0; i < 3; i++) {
    hero.pose = 'reach'; SFX.gulp(); await wait(350); hero.pose = 'stand'; await wait(250);
    if (i === 0) await say(hero, 'Uno...');
    if (i === 1) await say(hero, 'Due... dai...');
  }
  SFX.splash(); Game.shake = 0.6;
  for (let i = 0; i < 16; i++) addParticle({ x: 184 + Math.random() * 8, y: 84, vx: (Math.random() - 0.5) * 50, vy: -30 - Math.random() * 30, g: 200, life: 1, c: pick(['#8a6a3a', '#a07e48', '#7a7258', '#c8c8c0']), ground: 106 + Math.random() * 8 });
  f.sturato = true; takeItem('sturalavandini');
  addScore('sturato', 30);
  await say(hero, 'PLOF!', { big: true, dur: 1000 });
  await say(hero, "Ne è uscito... un calzino. E un chilo di gusci di noce. I ghiri usavano il water come dispensa.");
}
async function tiraSciacquone() {
  const f = FD();
  if (f.sciacquone) return say(hero, 'Funziona. Non tiro più, che porta male.');
  if (!f.sturato) {
    await walkTo(hero, 188, 110); hero.dir = 'up';
    return say(hero, 'Se tiro adesso, la dépendance diventa una piscina. Prima lo sturo.');
  }
  await walkTo(hero, 188, 110); hero.dir = 'up';
  hero.pose = 'reach'; SFX.clack(); await wait(200); hero.pose = 'stand';
  SFX.pour(); await wait(1200);
  f.sciacquone = true;
  addScore('sciacquone', 20);
  await say(hero, 'Glu glu glu... SHHHHH. Va giù tutto!');
  hero.dir = 'down';
  await say(hero, 'Grazie, Signore. E grazie, gomma.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1600);
  endChapter(4);
}

/* ---------- la stanza ---------- */
const ROOM_DEPENDANCE = {
  id: 'dependance', title: 'Dépendance', width: DPW,
  links: { portico: 'portaDep' },
  spawn: [92, 124],
  walk: [[72, 108], [250, 108], [292, 140], [28, 140]],
  scaleAt(y) { return clamp(0.86 + (y - 108) / 32 * 0.14, 0.86, 1); },
  init() {},
  enter() {
    const f = Game.flags;
    dpGhiro.st = f.mobileAperto && !f.ghiroScacciato ? 'sit' : 'hidden'; dpGhiro.x = 118; dpGhiro.y = 99;
    if (Game.chapter === 4 && !f.ch4Intro) runScript(dependanceIntro);
  },
  drawBack(g, cam) { g.drawImage(dayNightBg(this, paintDependance), -cam, 0); },
  darkness() { return isNight() ? 0.5 : 0.15; },
  darkTint: '20,16,6',
  lights() { return [{ x: 160, y: 22, r: 150, a: 0.95, tint: 'rgba(255,230,160,0.08)' }, { x: hero.x, y: hero.y - 26, r: 26, a: 0.4 }]; },
  objects() {
    const f = Game.flags, list = [];
    list.push({ y: 103, draw: g => g.drawImage(dpMobilettoCanvas(f.mobileAperto), 102, 77) });
    if (f.mobileAperto && !hasItem('sturalavandini') && !f.sturato) list.push({ y: 103.2, draw: g => {
      g.fillStyle = '#c8302a'; g.fillRect(122, 96, 8, 4); g.fillStyle = '#a02018'; g.fillRect(122, 99, 8, 1);
      g.fillStyle = '#8a6a3a'; g.fillRect(125, 82, 2, 14);
    } });
    if (dpGhiro.st !== 'hidden') list.push({ y: 103.4, draw: g => {
      const run = dpGhiro.st === 'run';
      const frame = run ? ((((Game.t * 12) | 0) % 2) ? 'run1' : 'run2') : ((((Game.t * 1.3) | 0) % 4 === 0) ? 'sit2' : 'sit');
      g.drawImage(ghiroCanvas(frame, dpGhiro.flip), Math.round(dpGhiro.x - 6), Math.round(dpGhiro.y - 8));
    } });
    list.push({ y: 104, draw: g => g.drawImage(dpWaterCanvas(f.sturato), 169, 76) });
    // la catena dello sciacquone
    list.push({ y: 104.1, draw: g => { g.fillStyle = '#9a9a9a'; for (let y = 51; y < 66; y += 2) g.fillRect(193, y, 1, 1); g.fillStyle = '#2a2a2a'; g.fillRect(192, 66, 3, 3); } });
    if (!f.guantiPresi) list.push({ y: 104.2, draw: g => { g.fillStyle = '#e8c820'; g.fillRect(243, 66, 3, 8); g.fillRect(246, 66, 2, 7); g.fillStyle = '#c8a810'; g.fillRect(243, 73, 5, 1); } });
    if (!f.sturato) list.push({ y: 105, draw: g => { g.fillStyle = 'rgba(120,110,80,0.6)'; g.fillRect(176, 106, 22, 2); g.fillRect(180, 108, 12, 1); } });
    // occhietti dei ghiri nel buco
    if (((Game.t * 0.7) | 0) % 3 !== 0) list.push({ y: 50, draw: g => { g.fillStyle = '#f0e8a0'; g.fillRect(239, 48, 1, 1); g.fillRect(242, 48, 1, 1); if (FD().ghiroScacciato) { g.fillRect(244, 50, 1, 1); g.fillRect(247, 50, 1, 1); } } });
    return list;
  },
  itemVerbs: {},
  update() {},
  hotspots: [],
};
ROOMS.dependance = ROOM_DEPENDANCE;

ROOM_DEPENDANCE.hotspots = [
  { id: 'muroDep', name: 'Muro', rects: [[0, 0, 320, 104]], hint: false,
    verbs: { guarda: () => say(hero, 'Intonaco, muffa e piastrelle verde ospedale anni settanta. Un museo dell\'umidità.') } },
  { id: 'pavimentoDep', name: 'Pavimento', rects: [[0, 104, 320, 40]], hint: false,
    verbs: { guarda: () => say(hero, 'Piastrelle a scacchi. Bianche e nere. Più nere che bianche.') } },
  { id: 'lampadinaDep', name: 'Lampadina', rects: [[154, 12, 12, 14]],
    verbs: { guarda: () => say(hero, 'Una lampadina nuda appesa al filo. Il lampadario della dépendance.') } },
  { id: 'finestraDep', name: 'Finestrella', rects: [[94, 40, 30, 20]], walk: [110, 112], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Una finestrella col vetro smerigliato. Per la privacy dei ghiri.'),
      apri: () => say(hero, 'Si apre di due dita. Abbastanza per far entrare altri ghiri.'),
    } },
  { id: 'specchio', name: 'Specchio', rects: [[102, 44, 32, 20]], walk: [118, 112], face: 'up',
    verbs: { guarda: () => say(hero, 'Uno specchio crepato. Mi guardo e vedo un uomo di fede. Con la testa rasata.') } },
  { id: 'lavandino', name: 'Lavandino', rects: [[100, 66, 36, 11]], walk: [118, 112], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il lavandino. Il rubinetto gocciola a tempo, come un metronomo.'),
      usa: () => say(hero, 'Mi lavo le mani. Prima e dopo. Soprattutto dopo.'),
    } },
  { id: 'mobiletto', name: 'Mobiletto', rects: [[102, 77, 34, 27]], walk: [118, 112], face: 'up',
    verbs: {
      guarda: () => say(hero, FD().mobileAperto ? (FD().ghiroScacciato ? 'Il mobiletto sotto il lavandino, aperto.' : 'Dentro c\'è un ghiro seduto sullo sturalavandini.') : 'Il mobiletto sotto il lavandino. Da dentro arriva un rumorino.'),
      apri: () => apriMobiletto(),
      chiudi: () => say(hero, 'Lo lascio aperto. Non si sa mai cosa ci entra.'),
      raccogli: () => FD().mobileAperto ? prendiSturalavandini() : say(hero, 'Prima lo apro.'),
    } },
  { id: 'ghiroDep', name: 'Ghiro', person: true, rects: [[110, 90, 16, 12]], walk: [118, 112], face: 'up', show: () => FD().mobileAperto && !FD().ghiroScacciato,
    verbs: {
      guarda: () => say(hero, 'Un ghiro seduto sullo sturalavandini. Mi fissa come se il bagno fosse suo. Forse lo è.'),
      parla: async () => { await say(hero, 'Fratello ghiro, spostati.'); SFX.chirp(); await say(dpGhiroActor, 'Fffff!'); },
      raccogli: () => say(hero, 'Prenderlo a mani nude? Il Signore ci ha dato i guanti per un motivo.'),
      spingi: () => say(hero, 'Non lo tocco. Ma posso convincerlo in un altro modo.'),
    },
    use: { crocifisso: () => scacciaGhiro(), sturalavandini: () => say(hero, 'Non è quel tipo di sturalavandini.'), '*': () => say(hero, 'Il ghiro non è impressionato.') },
    give: { crocifisso: () => scacciaGhiro(), '*': () => say(hero, 'Il ghiro non accetta regali. Accetta solo noci.') } },
  { id: 'sturalavandiniHs', name: 'Sturalavandini', rects: [[120, 82, 12, 18]], walk: [118, 112], face: 'up', def: 'raccogli', show: () => FD().mobileAperto && FD().ghiroScacciato && !hasItem('sturalavandini') && !FD().sturato,
    verbs: { guarda: () => say(hero, 'Lo sturalavandini. Rosso, glorioso.'), raccogli: () => prendiSturalavandini() } },
  { id: 'water', name: 'Water', rects: [[169, 70, 32, 34]], walk: [188, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, FD().sturato ? (FD().sciacquone ? 'Pulito. Quasi brilla.' : 'Sturato. Adesso manca solo lo sciacquone.') : 'Il water è pieno fino all\'orlo. Pieno di cosa, preferisco non saperlo.'),
      usa: () => say(hero, FD().sciacquone ? 'Funziona. Lo lascio agli altri, come un regalo.' : 'Usarlo? In questo stato? Neanche in caso di emergenza.'),
      apri: () => say(hero, "Il coperchio è già alzato. Purtroppo."),
      chiudi: () => say(hero, 'Chiudere il coperchio non risolve il problema. Lo nasconde.'),
    },
    use: { sturalavandini: () => sturaWater(), crocifisso: () => say(hero, 'Ci ho pensato. Ma qui serve lo sturalavandini, non un miracolo.'), guanti: () => say(hero, 'I guanti si mettono. Li metto quando sturo.'), '*': () => say(hero, 'Nel water? Così lo intaso ancora di più.') } },
  { id: 'catena', name: 'Sciacquone', rects: [[168, 36, 32, 34]], walk: [188, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Lo sciacquone vecchio stile, con la catena. Lo tiri e prega.'),
      tira: () => tiraSciacquone(),
      usa: () => tiraSciacquone(),
    } },
  { id: 'doccia', name: 'Doccia', rects: [[212, 38, 46, 64]], walk: [236, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Una doccia con la tenda a fiori. La tenda ha visto cose che io non voglio vedere.'),
      apri: () => say(hero, 'Apro la tenda... e la richiudo. Subito.'),
      usa: () => say(hero, "L'acqua calda nella dépendance è una leggenda. Come i ghiri buoni."),
    } },
  { id: 'guanti', name: 'Guanti di gomma', rects: [[241, 64, 9, 11]], walk: [240, 110], face: 'up', def: 'raccogli', show: () => !FD().guantiPresi,
    verbs: { guarda: () => say(hero, 'Guanti di gomma gialli, appesi al gancio della doccia. Una benedizione.'), raccogli: () => prendiGuanti() } },
  { id: 'bucoGhiri', name: 'Buco nel muro', rects: [[234, 42, 16, 12]], walk: [236, 110], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Un buco nel muro. Dentro, al buio, brillano degli occhietti. Tanti occhietti.'),
      parla: () => say(hero, 'Ragazzi, la dépendance è nostra. ...Silenzio. È un no.'),
      usa: () => say(hero, 'Non ci infilo la mano. Il Signore mi ha dato dieci dita e le voglio tenere.'),
    },
    use: { crocifisso: () => say(hero, 'Sono troppi. Il crocifisso li tiene a bada, ma non fa miracoli di massa.') } },
  { id: 'portaDep', name: 'Porta', rects: [[11, 40, 36, 82]], walk: [44, 124], face: 'left', exit: true,
    verbs: {
      guarda: () => say(hero, 'La porta della dépendance. Fuori: il portico, l\'aria fresca, la salvezza.'),
      vai: () => (Game.chapter === 4 && !FD().sciacquone) ? say(hero, 'Prima il water. Chino non scappa davanti a niente.') : goToRoom(ROOMS.portico, 22, 124, 'right'),
    } },
];
