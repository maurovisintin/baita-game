'use strict';
/* =========================================================
   CAPITOLO 2 - STANZA 2: L'ORRIDO RASCIE (di notte)
   La frontale muore: si usa la torcia del telefono e si fa il selfie
   ========================================================= */
const OW = 320;
const SLOT = [[118, 0], [200, 0], [192, 30], [184, 60], [176, 90], [168, 112], [132, 112], [128, 80], [123, 40]];

function paintOrrido() {
  const b = new Buf(OW, SH);
  const r = rng(4242);
  paintNightSky(b, OW, 40, 21);
  // chioma rossa in cima alle rocce
  crownBlobs(b, r, 176, 10, 120, 26, ['#3a140a', '#5a2210', '#7a3416', '#9a4a20', '#b8622c'], 220);
  crownBlobs(b, r, 290, 14, 60, 30, ['#3a2a0e', '#5a4214', '#7a5c1c', '#9a7428', '#b88c34'], 120);
  // parete sinistra: calcare con muschio ed erba secca
  b.poly([[0, 0], [118, 0], [123, 40], [128, 80], [132, 114], [0, 114]], (x, y) => {
    const m = fbm(x / 8, y / 7, 401, 3);
    if (m > 0.6) return ramp(['#26361a', '#34481e', '#4a6028', '#6a7a36'], (m - 0.6) * 2.4, x, y);
    if (fbm(x / 3, y / 9, 402, 2) > 0.66) return ramp(['#6a6440', '#8a8456', '#a49c6a'], hash2(x, y, 403), x, y); // erba secca
    return ramp(NIGHT.rock, clamp(vnoise(x / 3, y / 6, 404) * 0.7 + 0.1 + (x / 130) * 0.2, 0, 0.999), x, y);
  });
  // fessura dell'orrido
  b.poly(SLOT, (x, y) => {
    const t = clamp(1 - Math.min(Math.abs(x - 140), Math.abs(x - 180)) / 14, 0, 1) * 0.6;
    return ramp(['#040506', '#0a0c0e', '#16181a', '#24262a'], clamp(t * (1 - y / 160) + hash2(x, y, 405) * 0.08, 0, 0.999), x, y);
  });
  // parete destra: grande lastra liscia con striature
  b.poly([[200, 0], [OW, 0], [OW, 116], [166, 116], [176, 90], [184, 60], [192, 30]], (x, y) => {
    const streak = vnoise(x / 1.6, y / 30, 410);
    if (fbm(x / 4, y / 10, 411, 2) > 0.7) return ramp(['#3a4a26', '#4e6030'], hash2(x, y, 412), x, y);
    if (streak > 0.78) return '#5e5c56';
    return ramp(['#7a7872', '#8e8c84', '#a4a29a', '#b8b6ae'], clamp(0.35 + streak * 0.5 + (x - 200) / 300 - y / 400, 0, 0.999), x, y);
  });
  // spigolo illuminato dalla luna
  for (let y = 0; y < 112; y++) { const x = Math.round(200 - y * 0.29); b.set(x, y, '#c8c6be'); b.set(x + 1, y, '#a8a69e'); }
  // grotta sotto lo strapiombo a destra
  b.ellipse(296, 100, 22, 12, (x, y) => ramp(['#060606', '#121212', '#1e1e1c'], clamp((y - 88) / 24, 0, 0.99), x, y));
  b.rect(272, 86, 48, 2, '#5a5850');
  // betulle bianche a sinistra
  for (const [bx, bw] of [[16, 5], [40, 4], [96, 3]]) {
    b.rect(bx, 0, bw, 112, (x, y) => {
      if (hash2(x >> 1, y >> 1, bx) < 0.12) return '#1e1e1e';
      return x === bx ? '#a8a49c' : (x === bx + bw - 1 ? '#bcb8b0' : '#e8e4dc');
    });
  }
  // ciuffo d'erba secca pendente
  for (let i = 0; i < 70; i++) { const x0 = 54 + r() * 18; b.line(x0, 38 + r() * 6, x0 + (r() - 0.5) * 8, 70 + r() * 26, r() < 0.5 ? '#a89a6a' : '#c8b884'); }
  // fondo del torrente: foglie, sassi, acqua
  b.rect(0, 106, OW, 38, (x, y) => {
    const h = hash2(x, y, 420);
    if (h < 0.1) return '#3a2410';
    return ramp(['#5a2a10', '#8a3e16', '#b85a1a', '#d07a2a'], clamp(vnoise(x / 3, y / 2, 421) * 0.9 + h * 0.2, 0, 0.999), x, y);
  });
  // ruscello che esce dalla fessura
  const water = [[138, 108], [164, 108], [150, 120], [118, 130], [86, 138], [60, 144], [30, 144], [64, 134], [104, 124], [130, 114]];
  b.poly(water, (x, y) => ramp(['#3a4a5a', '#5a6a7a', '#8a96a2', '#b8c0c8'], clamp(vnoise(x / 4, y / 2, 430) * 0.8 + (y < 112 ? 0.3 : 0), 0, 0.999), x, y));
  b.rect(140, 106, 22, 3, (x, y) => hash2(x, y, 431) < 0.5 ? '#e8ecf0' : '#c8d0d8');
  // sassi tondi bianchi e muschiosi
  for (let i = 0; i < 46; i++) {
    const x = r() * OW | 0, y = 110 + (r() * 32 | 0), rx = 3 + (r() * 6 | 0), ry = Math.max(2, rx - 2 - (r() * 2 | 0));
    if (pointInPoly(x, y, water)) continue;
    const mossy = r() < 0.35;
    b.ellipse(x, y, rx, ry, (px, py) => {
      const light = clamp(0.75 - (py - y) / (ry * 2) - (px - x) / (rx * 4), 0, 0.999);
      if (mossy && py < y) return ramp(['#3e5228', '#56702e', '#6e8a3a'], light, px, py);
      return ramp(['#8a8a84', '#aeaca6', '#cfccc4', '#e4e2dc'], light, px, py);
    });
  }
  // tronchi caduti coperti di muschio
  const log = (x0, y0, x1, y1, w) => {
    b.thick(x0, y0, x1, y1, w, (x, y) => ramp(['#1e1a14', '#2e281e', '#3e5228', '#56702e'], clamp(0.3 + fbm(x / 3, y / 2, 440, 2) * 0.8, 0, 0.999), x, y));
    b.ellipse(x0, y0, Math.max(1, (w >> 1)), w >> 1, '#8a6a44');
  };
  log(18, 120, 108, 114, 5);
  log(210, 138, 300, 130, 6);
  for (let i = 0; i < 18; i++) { const x = 4 + r() * 70, y = 128 + r() * 14; b.line(x, y, x + 10 + r() * 16, y - 4 + r() * 8, r() < 0.5 ? '#4a3a28' : '#2a2018'); }
  return b.canvas();
}

/* ---------- script ---------- */
async function orridoIntro() {
  const f = Game.flags;
  await walkTo(hero, 96, 130); hero.dir = 'right';
  await say(hero, "Eccolo... l'orrido Rascie.");
  await say(hero, 'Due pareti di roccia alte come palazzi, e in mezzo una fessura nera da cui esce il torrente.');
  await say(hero, 'È proprio... orrido.');
  if (!f.lampOn) { await say(hero, 'Accendo la frontale, così lo vedo meglio...'); f.lampOn = true; SFX.clack(); await wait(500); }
  f.lampFlicker = true; await wait(500); SFX.clack(); await wait(400); SFX.clack(); await wait(600);
  f.lampFlicker = false; f.lampOn = false; f.lampDead = true;
  await say(hero, 'No no no... la frontale! Proprio adesso!');
  await say(hero, "Buio totale. Sento solo l'acqua. E forse un ghiro.");
  f.orridoSeen = true;
}
async function phoneTorch() {
  const f = Game.flags;
  if (f.phoneDead) return say(hero, 'Il telefono è morto. Zero per cento. Riposa in pace anche lui.');
  if (f.phoneLight) return selfie();
  f.phoneLight = true; SFX.clack();
  await say(hero, 'Torcia del telefono accesa! Due per cento di batteria. Devo fare in fretta.');
  addScore('torcia', 10);
}
async function selfie() {
  const f = Game.flags;
  if (f.selfieDone) return say(hero, "Il selfie c'è già. E il telefono è morto.");
  if (!f.phoneLight) return say(hero, 'Al buio verrebbe una foto nera. Prima accendo la torcia del telefono.');
  await walkTo(hero, 150, 128);
  hero.dir = 'down'; hero.pose = 'phone';
  await say(hero, "Un selfie con l'orrido Rascie. Sorridi, Kodo.");
  await wait(500);
  SFX.clack(); Game.flash = 1;
  await wait(900);
  hero.pose = 'stand';
  f.selfieDone = true; f.phoneLight = false; f.phoneDead = true;
  addScore('selfie', 20);
  await say(hero, 'Fatto! E il telefono... zero per cento. Morto.');
  await say(hero, "Ma la foto c'è. Luciano dovrà crederci.");
  await say(hero, "Adesso si torna alla baita. Al buio. Seguendo l'odore delle costine.");
  f.finale = true;
  await goToRoom(ROOMS.parcheggio, 560, 134, 'left');
}

const ROOM_ORRIDO = {
  id: 'orrido', title: 'Orrido Rascie', width: OW,
  links: { guado: 'uscitaOrrido' },
  spawn: [96, 130],
  walk: [[6, 116], [300, 114], [314, 142], [6, 142]],
  scaleAt(y) { return clamp(0.86 + (y - 114) / 28 * 0.14, 0.86, 1); },
  _ready: false,
  init() { if (this._ready) return; this.bg = paintOrrido(); this._ready = true; },
  enter() { if (!Game.flags.orridoSeen) runScript(orridoIntro); },
  darkness() { return Game.flags.lampOn && !Game.flags.lampFlicker ? 0.86 : 0.93; },
  lights() {
    const f = Game.flags;
    const L = [{ x: 160, y: 2, r: 46, a: 0.45 }, { x: 196, y: 40, r: 30, a: 0.25 }];
    if (f.lampOn) L.push(...heroLights(f.lampFlicker ? 30 + Math.random() * 50 : 74, 'rgba(150,170,255,0.10)'));
    else if (f.phoneLight) L.push(...heroLights(50, 'rgba(170,200,255,0.12)'));
    else L.push({ x: hero.x, y: hero.y - 26, r: 22, a: 0.5 });
    return L;
  },
  drawBack(g, cam) { g.drawImage(this.bg, -cam, 0); },
  objects() {
    return [{ y: 110, draw: g => {
      for (let i = 0; i < 16; i++) {
        const t = (i * 0.37 + Game.t * 0.6) % 1;
        const x = lerp(150, 50, t) + Math.sin(i) * 6, y = lerp(110, 142, t);
        g.fillStyle = i % 3 ? 'rgba(230,236,240,0.6)' : 'rgba(255,255,255,0.8)'; g.fillRect(x | 0, y | 0, 2, 1);
      }
    } }];
  },
  itemVerbs: {
    telefono: { usa: () => phoneTorch() },
  },
  update(dt) {
    if (Math.random() < dt * 0.6) addParticle({ x: 120 + Math.random() * 180, y: 0, vx: 2, vy: 8, life: 14, c: pick(['#9a4a20', '#b8622c', '#7a3416']), sway: Math.random() * 6, ground: 108 + Math.random() * 34, fade: true });
  },
  hotspots: [],
};
ROOMS.orrido = ROOM_ORRIDO;

const FO = () => Game.flags;
ROOM_ORRIDO.hotspots = [
  { id: 'cielo3', name: 'Cielo', rects: [[118, 0, 82, 10]], hint: false,
    verbs: { guarda: () => say(hero, 'Uno spicchio di cielo tra le rocce. Le stelle sembrano sbirciare dentro.') } },
  { id: 'albero', name: 'Faggio rosso', rects: [[120, 0, 180, 26]],
    verbs: { guarda: () => say(hero, 'In cima alle rocce c\'è un faggio rosso. Di giorno dev\'essere uno spettacolo.') } },
  { id: 'paretiSx', name: 'Parete di roccia', rects: [[0, 0, 124, 108]], hint: false,
    verbs: {
      guarda: () => say(hero, 'Roccia, muschio ed erba secca. Arrampicarsi? Neanche col casco.'),
      usa: () => say(hero, 'Arrampicarmi di notte su una parete bagnata? Ho visto come finiscono quei video.'),
    } },
  { id: 'betulle', name: 'Betulle', rects: [[14, 0, 32, 110], [94, 0, 6, 110]],
    verbs: { guarda: () => say(hero, 'Betulle bianche. Al buio sembrano fantasmi magri.') } },
  { id: 'paretiDx', name: 'Parete di roccia', rects: [[184, 0, 136, 86]], hint: false,
    verbs: { guarda: () => say(hero, 'Una lastra di roccia liscia, altissima. Sembra il muro di un castello di giganti.') } },
  { id: 'grotta', name: 'Anfratto', rects: [[274, 88, 46, 24]],
    verbs: {
      guarda: () => say(hero, 'Un anfratto buio sotto la roccia. Potrebbe esserci di tutto. Anche un ghiro. Anche dieci.'),
      usa: () => say(hero, 'Infilare la mano lì dentro? Di notte? No grazie.'),
    } },
  { id: 'orrido', name: 'Orrido Rascie', rects: [[124, 0, 72, 108]], walk: [150, 128], face: 'up',
    verbs: {
      guarda: () => say(hero, (FO().lampOn || FO().phoneLight || FO().selfieDone)
        ? "La fessura dell'orrido: due pareti che quasi si toccano, e in mezzo l'acqua che esce dal buio. Fa paura. Fa... orrido."
        : 'Vedo solo nero. Potrebbe essere l\'orrido. O la mia anima.'),
      usa: () => say(hero, "Entrare là dentro? L'orrido si guarda da fuori. Lo dice la parola stessa."),
    },
    use: { telefono: () => FO().phoneLight ? selfie() : phoneTorch(), frontale: () => say(hero, 'La frontale è morta. Anche lei ha visto l\'orrido.') } },
  { id: 'ruscello', name: 'Torrente', rects: [[30, 106, 140, 38]], hint: false,
    verbs: { guarda: () => say(hero, "L'acqua che esce dall'orrido. Fredda, scura, e parla più di Luciano.") } },
  { id: 'tronchi2', name: 'Tronco muschioso', rects: [[16, 110, 96, 12], [206, 126, 98, 14]],
    verbs: {
      guarda: () => say(hero, 'Un tronco caduto, tutto coperto di muschio. Morbido come un divano. Bagnato come una spugna.'),
      raccogli: () => say(hero, 'Pesa come un frigorifero. Di nuovo.'),
    },
    use: { motosega: () => say(hero, 'La motosega è rimasta alla baita. Per fortuna, di notte.') } },
  { id: 'uscitaOrrido', name: 'Sentiero per il guado', rects: [[0, 112, 12, 32]], walk: [10, 130], face: 'left', exit: true,
    verbs: {
      vai: async () => {
        if (!FO().selfieDone) return say(hero, "Sono arrivato fin qui... prima di andare via voglio una prova che l'ho visto.");
        await goToRoom(ROOMS.guado, 466, 126, 'left');
      },
    } },
];
