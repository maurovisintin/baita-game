'use strict';
/* =========================================================
   LA STANZA DEL CAMINETTO: divano a fiori, caminetto in pietra,
   poltrona di vimini, radio antica, tavolo per le partite a carte
   ========================================================= */
const CAW = 320;
const CA_VP = [160, 64];
const CA_FLOOR = { yb: 106, yh: 64, f: 90, vpx: 160 };

function paintCaminetto(night) {
  const b = new Buf(CAW, SH);
  const wallPal = ['#c8b998', '#d4c6a6', '#ded2b4', '#e8dec4', '#f0e8d2'];
  const wall = stuccoShader(wallPal, 300);
  const sideWall = (x, y) => hexMix(wall(x, y), '#3a2a1a', 0.22);

  /* ---- soffitto con due travi ---- */
  b.poly([[0, 0], [320, 0], [320, 29], [296, 34], [24, 34], [0, 29]], (x, y) => ramp(['#bdb3a0', '#cbc2b0', '#d8d0c0'], clamp(0.3 + y / 60 + hash2(x, y, 301) * 0.2, 0, 0.999), x, y));
  beamH(b, 0, 7, 320, 5, ['#2a180a', '#3a2412', '#4e321c', '#62422a']);
  beamH(b, 0, 21, 320, 3, ['#2a180a', '#3a2412', '#4e321c', '#62422a']);
  /* ---- pareti ---- */
  b.poly([[0, 29], [24, 34], [24, 106], [0, 114]], sideWall);
  b.poly([[296, 34], [320, 29], [320, 114], [296, 106]], sideWall);
  b.rect(24, 34, 272, 72, wall);
  b.rect(24, 34, 272, 2, (x, y) => hexMix(wall(x, y), '#000000', 0.2));
  b.line(24, 34, 24, 106, '#a89a7c'); b.line(295, 34, 295, 106, '#a89a7c');
  b.rect(24, 103, 272, 3, '#8a6a46'); b.rect(24, 103, 272, 1, '#a8845a');
  /* ---- pavimento in cotto, in prospettiva ---- */
  b.poly([[24, 106], [296, 106], [320, 114], [320, 144], [0, 144], [0, 114]], cottoShader(CA_FLOOR, 302, 18));
  // tappeto sotto il tavolo
  b.poly([[100, 112], [220, 112], [238, 140], [82, 140]], (x, y) => {
    const t = (y - 112) / 28, l = lerp(100, 82, t), rr = lerp(220, 238, t);
    const u = (x - l) / (rr - l);
    if (u < 0.05 || u > 0.95 || t < 0.08 || t > 0.92) return ((x + y) & 1) ? '#5a1a12' : '#e0c890';
    if (u < 0.1 || u > 0.9 || t < 0.16 || t > 0.84) return '#8a2a1a';
    const m = Math.abs(((u * 8) % 2) - 1) + Math.abs(((t * 5) % 2) - 1);
    return m < 0.5 ? '#d8b070' : m < 0.9 ? '#2a3a5a' : ramp(['#7a1e14', '#962a1a', '#a83420'], hash2(x, y, 303), x, y);
  });

  /* porta del salone */
  woodDoor(b, 30, 48, 26, 58, { handleLeft: false });

  /* quadro sfocato */
  picture(b, 64, 42, 48, 24, true, (x0, y0, w, h) => {
    b.rect(x0, y0, w, h, (x, y) => {
      const t = (y - y0) / h;
      const hill = y0 + h * (0.5 + Math.sin((x - x0) / 6) * 0.08);
      if (y < hill) return ramp(['#c8c0a0', '#d8d0b0', '#b8b898'], clamp(t + hash2(x, y, 304) * 0.3, 0, 0.999), x, y);
      return ramp(['#6a7a4a', '#8a9a5a', '#a8a878', '#c8b888'], clamp((t - 0.5) * 1.6 + hash2(x, y, 305) * 0.35, 0, 0.999), x, y);
    });
  });

  /* divano a fiori */
  const flowers = (x, y) => {
    const h = hash2(x >> 1, y >> 1, 306);
    if (h < 0.1) return '#d88a9a'; if (h < 0.16) return '#b85a6a'; if (h < 0.22) return '#8aa0c8'; if (h < 0.3) return '#7a9a6a';
    return ramp(['#c8b898', '#d8ccb0', '#e6dcc4'], hash2(x, y, 307), x, y);
  };
  b.rect(62, 80, 62, 16, flowers);
  b.rect(58, 88, 7, 18, flowers); b.rect(121, 88, 7, 18, flowers);
  b.rect(58, 88, 7, 1, '#f0e8d4'); b.rect(121, 88, 7, 1, '#f0e8d4');
  b.rect(65, 96, 56, 4, (x, y) => hexMix(flowers(x, y), '#ffffff', 0.12));
  b.rect(62, 100, 62, 6, (x, y) => hexMix(flowers(x, y), '#000000', 0.25));
  b.rect(68, 80, 24, 6, (x, y) => ((x + (y >> 1)) % 4 < 2) ? '#7a5a3a' : '#c8b088'); // coperta di lana
  b.rect(98, 88, 14, 8, '#a83a3a'); b.rect(98, 88, 14, 1, '#c85a5a'); // cuscino

  /* portafinestra con le tende di pizzo */
  b.rect(132, 38, 38, 64, '#2a1a0e');
  b.rect(134, 40, 34, 60, glassShader(night, 308));
  b.rect(134, 46, 15, 50, laceShader(309)); b.rect(152, 46, 16, 50, laceShader(310));
  laceHem(b, 134, 148, 96); laceHem(b, 152, 167, 96);
  b.rect(150, 40, 2, 60, '#2a1a0e'); b.rect(134, 69, 34, 1, '#3a2414');
  b.rect(130, 37, 42, 2, '#6a4a2a'); b.rect(130, 102, 42, 3, '#b8ab90'); b.rect(130, 102, 42, 1, '#d8ccb0');

  /* caminetto in pietra con la mensola */
  const stone = stoneShader(311, 7, ['#4a4642', '#5a5650', '#6a645c', '#3e3a36', '#7a7268', '#5e5048'], '#26221e', 0.7);
  b.rect(192, 34, 52, 34, stone);
  b.rect(186, 72, 64, 34, stone);
  b.rect(198, 84, 40, 22, '#0c0a08');
  b.ellipse(218, 84, 20, 4, '#0c0a08');
  b.rect(198, 80, 40, 1, '#8a8278');
  b.rect(200, 101, 36, 5, (x, y) => ramp(['#3a3632', '#5a5650', '#7a766e'], hash2(x, y, 312), x, y)); // cenere
  b.thick(204, 100, 228, 97, 3, '#2a1a10'); b.thick(208, 98, 232, 101, 3, '#3a2214'); b.set(214, 98, '#c84a14'); // ceppi
  b.rect(182, 106, 72, 4, '#a8a094'); b.rect(182, 106, 72, 1, '#c8c0b4');
  b.rect(180, 68, 76, 4, '#4a2a14'); b.rect(180, 68, 76, 1, '#7a4a26'); b.rect(180, 71, 76, 1, '#2a160a');
  // rose rosse finte, candeliere, foto
  b.rect(195, 58, 7, 10, '#c8a040'); b.rect(196, 59, 2, 8, '#e8d080');
  for (const [rx, ry] of [[194, 50], [199, 48], [203, 52], [197, 54], [201, 55]]) { b.ellipse(rx, ry, 2, 2, '#b81a2a'); b.set(rx - 1, ry - 1, '#e84a5a'); }
  b.line(197, 57, 195, 52, '#3a6a2a'); b.line(200, 57, 202, 53, '#3a6a2a');
  b.rect(212, 59, 9, 9, '#c8a050'); b.rect(213, 60, 7, 7, '#8aa0b0'); b.rect(214, 63, 5, 4, '#c89a7a');
  b.rect(230, 64, 6, 4, '#b8902a'); b.rect(232, 54, 2, 10, '#d8b040'); b.rect(231, 48, 4, 6, '#f4f0e4'); b.set(232, 47, '#3a2a1a');
  b.rect(242, 64, 8, 4, '#2a6a6a'); b.rect(242, 64, 8, 1, '#4a9a9a');

  /* poltrona di vimini */
  const wicker = (x, y) => (((x + y) % 4 === 0) || ((x - y) % 4 === 0)) ? '#8a5e26' : ramp(['#b4843e', '#c89850', '#dab066'], hash2(x, y, 313), x, y);
  b.ellipse(273, 82, 17, 8, wicker);
  b.rect(256, 82, 35, 16, wicker);
  b.rect(254, 92, 5, 14, wicker); b.rect(288, 92, 5, 14, wicker);
  b.rect(259, 96, 29, 4, flowers); b.rect(259, 96, 29, 1, '#f0e8d4');
  b.rect(256, 100, 35, 8, wicker); b.rect(256, 107, 35, 1, '#6a4a1a');
  b.ellipse(273, 76, 17, 2, '#e0bc78');

  /* mobiletto con la radio antica */
  b.rect(294, 84, 24, 24, (x, y) => ramp(['#2e1a0a', '#3e2412', '#4e2e18'], clamp(0.3 + vnoise(x, y / 6, 314) * 0.5, 0, 0.999), x, y));
  b.rect(294, 84, 24, 1, '#6a4422'); b.rect(296, 90, 20, 1, '#22140a'); b.set(306, 96, '#c8a050');
  b.ellipse(306, 66, 10, 6, '#5a2e12');
  b.rect(296, 66, 21, 18, '#5a2e12');
  b.rect(296, 66, 1, 18, '#8a4e22'); b.ellipse(306, 66, 9, 5, '#6e3a18');
  b.ellipse(306, 69, 6, 4, '#c8a060'); b.rect(300, 69, 13, 8, '#c8a060');
  for (let x = 301; x < 313; x += 3) b.rect(x, 64, 1, 13, '#6e3a18');
  b.rect(299, 79, 15, 3, '#3a1e0a'); b.set(302, 80, '#e8d8a8'); b.set(310, 80, '#e8d8a8'); b.rect(305, 80, 3, 1, '#f0e0b0');

  /* lampadario */
  b.rect(160, 0, 1, 14, '#3a3a3a');
  b.poly([[154, 20], [167, 20], [164, 14], [157, 14]], (x, y) => ramp(['#c89a50', '#e8c078', '#f8e0a8'], clamp((x - 154) / 14 + (night ? 0.3 : 0), 0, 0.999), x, y));
  b.rect(154, 20, 14, 1, '#a8783a');
  return b.canvas();
}

function caminettoTableCanvas() {
  return canvasOf('caTable', 116, 32, b => {
    const cx = 58, cy = 14;
    const gingham = (x, y) => {
      const a = ((x >> 2) & 1), c = ((y >> 1) & 1);
      return a && c ? '#2e7a3e' : (a || c) ? '#8ac094' : '#eef4e8';
    };
    b.ellipse(cx, cy, 55, 7, gingham);
    b.rect(3, cy, 111, 9, (x, y) => hexMix(gingham(x, y), '#000000', 0.18));
    laceHem(b, 3, 113, cy + 9);
    b.rect(20, 25, 3, 7, '#3a2414'); b.rect(93, 25, 3, 7, '#3a2414');
    // carte, mazzi, boccale, gioco da tavolo, telefono
    const card = (x, y, red) => { b.rect(x, y, 4, 2, '#f8f6ee'); b.set(x + 1, y, red ? '#c82a2a' : '#1a1a1a'); };
    card(26, 12, true); card(34, 15, false); card(44, 11, true); card(70, 16, false); card(84, 12, true); card(92, 14, false); card(62, 10, false);
    b.rect(18, 9, 6, 4, '#8a1a1a'); b.rect(18, 9, 6, 1, '#b83a3a');
    b.rect(96, 9, 6, 4, '#1e5a4a'); b.rect(96, 9, 6, 1, '#3a8a7a');
    b.rect(80, 8, 5, 4, '#1a1a1a'); b.rect(80, 8, 5, 1, '#3a3a3a');
    b.rect(48, 2, 20, 9, '#14343e'); b.rect(48, 2, 20, 1, '#2a5a66'); b.rect(50, 4, 16, 5, '#3a6a7a'); b.rect(54, 5, 8, 2, '#8ab0b8'); b.rect(48, 10, 20, 1, '#0a1e24');
    b.rect(30, 0, 7, 12, '#a8a49c'); b.rect(30, 0, 7, 1, '#d8d4cc'); b.rect(30, 4, 7, 1, '#2a4a8a'); b.rect(30, 8, 7, 1, '#2a4a8a'); b.rect(37, 3, 2, 6, '#8a8680');
    b.rect(73, 12, 6, 2, '#141414');
  });
}

/* ---------- la stanza ---------- */
const ROOM_CAMINETTO = {
  id: 'caminetto', title: 'Stanza del caminetto', width: CAW,
  links: { salone: 'portaSaloneC' },
  spawn: [160, 132],
  walk: [[8, 112], [96, 112], [96, 125], [224, 125], [224, 112], [312, 112], [316, 142], [4, 142]],
  scaleAt(y) { return clamp(0.8 + (y - 112) / 30 * 0.2, 0.8, 1); },
  init() {},
  enter() {},
  drawBack(g, cam) { g.drawImage(dayNightBg(this, paintCaminetto), -cam, 0); },
  darkness() { return isNight() ? 0.55 : 0; },
  darkTint: '24,12,4',
  lights() {
    const L = [{ x: 160, y: 22, r: 130, a: 0.85, tint: 'rgba(255,190,110,0.10)' }];
    if (Game.flags.caminettoAcceso) L.push({ x: 218, y: 96, r: 90 * (0.9 + Math.random() * 0.1), a: 0.9, tint: 'rgba(255,120,40,0.20)' });
    L.push({ x: hero.x, y: hero.y - 26, r: 28, a: 0.4 });
    return L;
  },
  objects() {
    const list = [{ y: 124, draw: g => g.drawImage(caminettoTableCanvas(), 102, 98) }];
    if (Game.flags.caminettoAcceso) list.push({ y: 105, draw: g => {
      for (let x = 202; x < 234; x++) {
        const h = 4 + Math.round((Math.sin(x * 1.3 + Game.t * 8) + Math.sin(x * 0.6 - Game.t * 5)) * 2 + 3);
        g.fillStyle = '#e8601a'; g.fillRect(x, 100 - h, 1, h);
        g.fillStyle = '#ffc040'; g.fillRect(x, 100 - Math.max(1, h - 4), 1, Math.max(1, h - 4));
      }
    } });
    return list;
  },
  update(dt) {
    if (Game.flags.caminettoAcceso && Math.random() < dt * 5) addParticle({ x: 210 + Math.random() * 18, y: 92, vx: (Math.random() - 0.5) * 8, vy: -14 - Math.random() * 8, life: 0.8, c: Math.random() < 0.5 ? '#ffb040' : '#ff6020', fade: true });
  },
  hotspots: [],
};
ROOMS.caminetto = ROOM_CAMINETTO;

ROOM_CAMINETTO.hotspots = [
  { id: 'muroCaminetto', name: 'Muro', rects: [[0, 26, 320, 80]], hint: false,
    verbs: { guarda: () => say(hero, 'Stucco a spatola color crema. Lo ha fatto lo zio nel 1983, in un pomeriggio, con grande entusiasmo.') } },
  { id: 'pavimentoC', name: 'Pavimento', rects: [[0, 106, 320, 38]], hint: false,
    verbs: { guarda: () => say(hero, 'Cotto e un tappeto rosso. Il tappeto nasconde una macchia. La macchia nasconde una storia.') } },
  { id: 'lampadario', name: 'Lampadario', rects: [[150, 0, 22, 22]],
    verbs: { guarda: () => say(hero, 'Un lampadario di vetro ambrato. Fa una luce da film degli anni settanta.') } },
  { id: 'quadroC', name: 'Quadro', rects: [[64, 42, 48, 24]], walk: [88, 116], face: 'up',
    verbs: { guarda: () => say(hero, "Un paesaggio sfocato. O il pittore lo voleva così, o aveva bevuto quello che c'è nel salone.") } },
  { id: 'divanoFiori', name: 'Divano a fiori', rects: [[58, 78, 70, 28]], walk: [92, 116], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il divano a fiori della nonna. Così morbido che ti risucchia. Due cugini ci sono spariti nel 2015.'),
      usa: () => say(hero, 'Se mi siedo mi addormento. E se mi addormento, qualcuno mi disegna una faccia sul cuscino.'),
    } },
  { id: 'portafinestra', name: 'Portafinestra', rects: [[132, 38, 38, 64]], walk: [150, 116], face: 'up',
    verbs: {
      guarda: () => say(hero, isNight() ? 'Fuori è buio pesto. Con le tende di pizzo, sembra un film dell\'orrore. Dell\'orrido, anzi.' : 'Una portafinestra con le tende di pizzo. Fuori c\'è il prato, e un ghiro che fa finta di niente.'),
      apri: () => say(hero, 'Entrerebbe il freddo. E un ghiro. Sicuramente un ghiro.'),
    } },
  { id: 'caminetto', name: 'Caminetto', rects: [[184, 72, 68, 38], [192, 34, 52, 18]], walk: [218, 116], face: 'up',
    verbs: {
      guarda: () => say(hero, Game.flags.caminettoAcceso ? 'Il fuoco scoppietta. Questa è la stanza più calda della baita, e anche dei cuori.' : 'Il caminetto in pietra. Spento. Dentro solo cenere, due ceppi neri e un tappo di sughero.'),
      usa: () => say(hero, Game.flags.caminettoAcceso ? 'Mi scaldo le mani. Ahhh. Ora sì che è montagna.' : 'Per accenderlo serve la legna. E io so bene quanto costa la legna, qui.'),
      apri: () => say(hero, 'Non ha uno sportello. È un caminetto vecchia scuola: fuoco, fumo e preghiere.'),
    } },
  { id: 'mensola', name: 'Mensola', rects: [[180, 44, 76, 28]], walk: [218, 116], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Rose rosse finte, un candeliere, una foto di gente che ride. Le rose sono finte da trent\'anni e non appassiscono mai.'),
      raccogli: () => say(hero, 'Le rose finte della nonna? Mi seguirebbe fino in città.'),
    } },
  { id: 'poltrona', name: 'Poltrona di vimini', rects: [[254, 74, 40, 34]], walk: [272, 116], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Una poltrona di vimini. Scricchiola anche se la guardi.'),
      usa: () => say(hero, 'La provo... CRAC. Va bene, resto in piedi.'),
    } },
  { id: 'radio', name: 'Radio antica', rects: [[294, 58, 26, 50]], walk: [300, 116], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Una radio a valvole tutta in legno. Prende una stazione sola: le previsioni del tempo del 1962.'),
      usa: () => say(hero, "Brrzzz... '...domani sereno su tutto l'arco alpino...' Clic. Si è spenta da sola."),
      apri: () => say(hero, 'Dentro ci sono valvole, polvere e il nido di qualcosa. Richiudo.'),
    } },
  { id: 'tavoloCarte', name: 'Tavolo', rects: [[104, 98, 112, 26]], walk: [160, 130], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Tovaglia a quadretti verdi, carte sparse, mazzi, un boccale e un gioco da tavolo. La partita è sospesa: nessuno ricorda chi stava vincendo.'),
      raccogli: () => say(hero, 'Se tocco le carte di una partita in corso, se ne accorgono. Se ne accorgono sempre.'),
      usa: () => say(hero, 'Giocare da solo? Vincerei, ma non avrebbe gusto.'),
    } },
  { id: 'portaSaloneC', name: 'Porta del salone', rects: [[28, 46, 30, 60]], walk: [44, 116], face: 'up', exit: true,
    verbs: {
      guarda: () => say(hero, 'La porta che torna nel salone.'),
      vai: () => goToRoom(ROOMS.salone, 495, 120, 'left'),
      apri: () => goToRoom(ROOMS.salone, 495, 120, 'left'),
    } },
];
