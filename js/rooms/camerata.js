'use strict';
/* =========================================================
   LA CAMERATA: sottotetto con le travi, letti in fila con
   i sacchi a pelo, il bagno "esploso" e il cuscino con la faccia
   ========================================================= */
const CMW = 416;
const CM_FLOOR = { yb: 106, yh: 20, f: 120, vpx: 208 };
const cmTop = x => 28 + x * 0.065;            // linea del soffitto inclinato
const CM_BEDS = [192, 244, 296, 348], CM_BW = 44;
const cmShear = x => (x - 208) * 0.12;

function paintCamerata(night) {
  const b = new Buf(CMW, SH);
  const pine = pineShader(400, 5);

  /* ---- soffitto inclinato in perlinato con le travi ---- */
  b.rect(0, 0, CMW, 56, (x, y) => {
    if (y >= cmTop(x)) return null;
    const v = (cmTop(x) - y) / 4.5, k = v - Math.floor(v);
    if (k < 0.18) return '#5a3010';
    return ramp(PINE, clamp(0.25 + hash2(Math.floor(v), Math.floor(x / 40), 401) * 0.35 + vnoise(x / 9, v, 402) * 0.3 - y / 200, 0, 0.999), x, y);
  });
  for (const rx of [72, 172, 272, 372]) {
    const y0 = cmTop(rx);
    for (let i = 0; i <= y0 + 2; i++) {
      const x = rx - i * 0.62, y = y0 - i;
      for (let w = -5; w <= 5; w++) {
        const c = w <= -4 ? '#7a5434' : w >= 4 ? '#140a04' : ramp(['#1e1208', '#2a1a0e', '#36220f', '#44301a'], clamp(0.35 + vnoise((x + w) / 3, y / 8, 403) * 0.5 - w * 0.04, 0, 0.999), x + w, y);
        b.set(x + w, y, c);
      }
    }
  }
  /* ---- parete di fondo: intonaco a sinistra, perlinato a destra ---- */
  b.rect(0, 0, CMW, 106, (x, y) => {
    if (y < cmTop(x)) return null;
    if (x < 56) return ramp(['#cfc2aa', '#dacdb6', '#e4d8c4', '#ece2d0'], clamp(0.4 + vnoise(x / 4, y / 4, 404) * 0.4 + hash2(x, y, 405) * 0.15, 0, 0.999), x, y);
    if (x < 58) return '#8a6a46';
    return pine(x, y);
  });
  b.rect(0, 0, CMW, 106, (x, y) => (y >= cmTop(x) && y < cmTop(x) + 2) ? '#1e1208' : null);
  b.rect(0, 102, CMW, 4, (x, y) => y === 102 ? '#8a5a2a' : '#5a3412');

  /* ---- pavimento di assi in prospettiva ---- */
  b.rect(0, 106, CMW, 38, (x, y) => {
    const P = CM_FLOOR, k = (P.yb - P.yh) / (y + 0.5 - P.yh);
    const X = (P.vpx + (x + 0.5 - P.vpx) * k) / 8, X2 = (P.vpx + (x + 1.5 - P.vpx) * k) / 8;
    if (Math.floor(X) !== Math.floor(X2)) return '#3a1e0a';
    const Z = P.f * (1 - k) / 30 + hash2(Math.floor(X), 0, 406) * 3;
    if (Math.floor(Z) !== Math.floor(P.f * (1 - (P.yb - P.yh) / (y + 1.5 - P.yh)) / 30 + hash2(Math.floor(X), 0, 406) * 3)) return '#4a2810';
    return ramp(['#7a4418', '#8e5220', '#a2622a', '#b47234'], clamp(0.3 + hash2(Math.floor(X), Math.floor(Z), 407) * 0.35 + vnoise(x / 2, y / 10, 408) * 0.25, 0, 0.999), x, y);
  });
  b.rect(0, 106, CMW, 2, '#2a1608');

  /* applique, quadretto, giacca rossa, termosifone, zaino */
  b.rect(26, 56, 4, 3, '#6a6a6a');
  b.ellipse(28, 53, 7, 4, (x, y) => y < 52 ? '#fff8e0' : '#f0d8a0'); b.rect(21, 53, 15, 1, '#c8a060'); b.rect(26, 54, 4, 2, '#fffef4');
  picture(b, 8, 66, 13, 15, false, (x0, y0, w, h) => b.rect(x0, y0, w, h, (x, y) => y < y0 + h - 3 - Math.abs(x - x0 - 3) ? '#a8c0d8' : '#6a7a5a'));
  b.rect(44, 60, 2, 2, '#4a4a4a');
  b.poly([[40, 62], [50, 62], [53, 88], [37, 88]], (x, y) => ramp(['#7a1414', '#a01e1e', '#c02a28', '#d84038'], clamp(0.5 + vnoise(x / 2, y / 5, 409) * 0.5 - (x - 37) / 40, 0, 0.999), x, y));
  b.rect(44, 62, 2, 26, '#5a0e0e'); b.rect(41, 62, 8, 3, '#4a4a4a');
  b.rect(6, 90, 30, 13, (x, y) => (x % 3 === 0) ? '#b8b4aa' : '#e8e6de'); b.rect(6, 90, 30, 1, '#f8f6f0'); b.rect(6, 103, 30, 1, '#8a8680');
  b.rect(38, 92, 14, 12, '#3a5a2a'); b.rect(38, 92, 14, 2, '#4e7038'); b.rect(41, 96, 8, 4, '#2e4a20'); b.rect(39, 104, 12, 2, '#2a3a1e');

  /* scale che scendono nel salone */
  b.rect(62, 107, 42, 11, '#120a04');
  for (let i = 0; i < 3; i++) { b.rect(64 + i * 2, 109 + i * 3, 38 - i * 4, 1, '#6a3e18'); b.rect(64 + i * 2, 110 + i * 3, 38 - i * 4, 1, '#3a200c'); }
  b.rect(60, 93, 46, 2, '#8a5424'); b.rect(60, 93, 46, 1, '#b07038');
  for (let x = 60; x <= 104; x += 6) b.rect(x, 95, 2, 13, '#6a3e18');

  /* porta del bagno con la targhetta e l'acqua che esce */
  woodDoor(b, 114, 50, 28, 56, { handleLeft: false });
  b.rect(120, 54, 16, 5, '#f4f0e6'); b.rect(120, 54, 16, 1, '#ffffff');
  for (let x = 122; x < 134; x++) if (x % 3 !== 0) b.set(x, 56, '#2a2a6a');
  b.rect(114, 105, 28, 1, '#8ab0d0');

  /* armadio con il sacco a pelo sopra */
  const ward = (x, y) => ramp(['#9a6a34', '#b07a3e', '#c48c4a', '#d49e5a'], clamp(0.4 + vnoise(x / 2, y / 8, 410) * 0.4, 0, 0.999), x, y);
  b.rect(150, 46, 36, 60, ward);
  b.rect(148, 44, 40, 3, '#6a4220'); b.rect(148, 44, 40, 1, '#9a6a3a');
  b.rect(167, 48, 1, 56, '#5a3414'); b.rect(152, 48, 1, 56, '#e0aa66');
  b.set(164, 76, '#3a2410'); b.set(170, 76, '#3a2410');
  b.rect(150, 102, 36, 4, '#5a3414');
  b.ellipse(168, 40, 14, 3, (x, y) => ((x + y) % 5 === 0) ? '#1e4a2a' : '#2e6a3a');

  /* filo con gli asciugamani */
  for (let x = 192; x <= 340; x++) { const t = (x - 192) / 148; b.set(x, Math.round(47 + t * 9 + Math.sin(t * Math.PI) * 4), '#c8c0a8'); }
  const towel = (x0, w, h, c1, c2) => {
    const t = (x0 + w / 2 - 192) / 148, y0 = Math.round(48 + t * 9 + Math.sin(t * Math.PI) * 4);
    b.rect(x0, y0, w, h, (x, y) => ((x - x0) % 3 === 0) ? c2 : c1);
    b.rect(x0, y0, w, 1, '#ffffff'); for (let x = x0; x < x0 + w; x += 2) b.set(x, y0 + h, c2);
  };
  towel(206, 12, 20, '#3a6ab0', '#2a5090'); towel(228, 20, 28, '#f0d040', '#d0b030'); towel(262, 10, 14, '#f0eee6', '#d0cec6'); towel(290, 12, 16, '#d8c8a8', '#b8a888');

  /* ghirlanda, finestrella con il pizzo, rotolo di filo */
  for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; b.set(320 + Math.cos(t) * 6, 66 + Math.sin(t) * 6, pick(['#e8dcc0', '#c8b890', '#f4ece0', '#a89870'])); b.set(320 + Math.cos(t) * 5, 66 + Math.sin(t) * 5, '#b8a880'); }
  b.rect(354, 58, 36, 26, '#3a2410');
  b.rect(356, 60, 32, 22, glassShader(night, 411));
  b.rect(356, 60, 14, 22, laceShader(412)); b.rect(374, 60, 14, 22, laceShader(413));
  laceHem(b, 356, 369, 82); laceHem(b, 374, 387, 82);
  b.rect(371, 60, 2, 22, '#3a2410');
  for (let a = 0; a < 60; a++) { const t = a / 60 * Math.PI * 2; for (const rr of [6, 7]) b.set(405 + Math.cos(t) * rr, 72 + Math.sin(t) * (rr - 1), (a + rr) % 3 ? '#8a9a7a' : '#5a6a4a'); }
  b.rect(404, 64, 2, 2, '#4a4a4a');

  /* letti in fila con i sacchi a pelo */
  const covers = [
    (x, y) => ramp(['#1e4a2a', '#2a5e36', '#3a7446'], clamp(0.4 + vnoise(x / 3, y / 2, 414) * 0.6, 0, 0.999), x, y),
    (x, y) => y < 112 ? ramp(['#8a1a1a', '#b02a24', '#cc3a2e'], clamp(0.4 + vnoise(x / 3, y / 2, 415) * 0.6, 0, 0.999), x, y) : ramp(['#b8a888', '#d0c0a0', '#e0d4b8'], hash2(x, y, 416), x, y),
    (x, y) => ((((x >> 2) + (y >> 1)) & 1) ? '#8a6a4a' : '#e0d0b0'),
    (x, y) => ramp(['#1a2e22', '#24402e', '#2e523a'], clamp(0.4 + vnoise(x / 3, y / 2, 417) * 0.6, 0, 0.999), x, y),
  ];
  CM_BEDS.forEach((bx, i) => {
    const fl = bx + cmShear(bx), fr = bx + CM_BW + cmShear(bx + CM_BW);
    b.rect(bx, 84, CM_BW, 14, (x, y) => ramp(['#6a3a14', '#7e4a1c', '#925a26'], clamp(0.4 + vnoise(x / 2, y / 6, 418 + i) * 0.4, 0, 0.999), x, y));
    b.rect(bx, 84, CM_BW, 1, '#b07038');
    b.poly([[bx, 98], [bx + CM_BW, 98], [fr, 121], [fl, 121]], '#ece6d6');
    b.poly([[bx + 4, 97], [bx + CM_BW - 4, 97], [bx + CM_BW - 3, 105], [bx + 3, 105]], (x, y) => ramp(['#d8d2c4', '#ece8de', '#f8f6f0'], clamp(0.5 + (y - 97) / 20 - Math.abs(x - bx - CM_BW / 2) / 60, 0, 0.999), x, y));
    b.poly([[bx + 1, 104], [bx + CM_BW - 1, 104], [fr - 1, 121], [fl + 1, 121]], (x, y) => {
      const c = covers[i](x, y);
      const lump = Math.sin((x - bx) / 5 + i) * Math.sin((y - 104) / 4);
      return lump > 0.5 ? hexMix(c, '#ffffff', 0.15) : lump < -0.5 ? hexMix(c, '#000000', 0.2) : c;
    });
    b.poly([[fl, 121], [fr, 121], [fr, 125], [fl, 125]], (x, y) => hexMix(covers[i](x, y), '#000000', 0.3));
    b.rect(Math.round(fl), 125, Math.round(fr - fl), 3, '#5a3412'); b.rect(Math.round(fl), 125, Math.round(fr - fl), 1, '#8a5424');
  });
  // vestiti sul letto 4 e borsa sul letto 2
  b.ellipse(374, 116, 7, 3, '#2a2a3a'); b.ellipse(380, 114, 5, 2, '#3a3a52');
  b.rect(262, 108, 12, 5, '#4a4a4a'); b.rect(262, 108, 12, 1, '#6a6a6a');
  // il cuscino con la faccia (letto 3)
  const px = 318, py = 99;
  b.rect(px - 1, py - 1, 3, 1, '#4a4a52'); b.rect(px - 3, py, 7, 1, '#4a4a52'); b.rect(px - 4, py + 1, 2, 3, '#4a4a52'); b.rect(px + 3, py + 1, 3, 4, '#4a4a52'); b.set(px + 6, py + 4, '#4a4a52');
  b.rect(px - 2, py + 2, 2, 1, '#2a2a30'); b.rect(px + 1, py + 2, 2, 1, '#2a2a30'); b.set(px, py + 2, '#6a6a70');
  b.set(px - 1, py + 5, '#5a5a62'); b.rect(px, py + 4, 2, 1, '#5a5a62'); b.set(px + 2, py + 5, '#5a5a62');
  return b.canvas();
}

/* ---------- capitolo 8: chi russa e i tappi per le orecchie ---------- */
const FK = () => Game.flags;
const roleNpc = r => npcActor((Game.roles || {})[r]);
async function nannaIntro() {
  const f = FK(), snorer = roleNpc('russa');
  f.nannaVista = true;
  await wait(800);
  await say(hero, 'Tutti a nanna. Sacco a pelo, cuscino, silenzio...');
  await say(snorer, 'RRRRRONF!', { big: true, dur: 1400 });
  await say(hero, 'No. Non può essere. Russa come la motosega di Luciano.');
  await say(hero, 'Senza tappi per le orecchie qui non dorme nessuno.');
  banner('OBIETTIVO: trova i tappi per le orecchie e dormi.', 5);
}
async function tappiTalk(a) {
  const f = FK();
  hero.dir = hero.x < a.x ? 'right' : 'left';
  if (f.tappiUsati) return say(a, 'Zzz...');
  if (!f.chiestoTappi) {
    await say(hero, 'Hai dei tappi per le orecchie?');
    await say(a, 'Ne avevo una scatoletta nello zaino verde, quello vicino al termosifone. Prendili pure.');
    f.chiestoTappi = true; addScore('chiesto', 15);
    return;
  }
  if (!f.scatolaVuota) return say(a, 'Lo zaino verde, vicino al termosifone. Vai, prima che ricominci.');
  if (!f.latenarTappi) return say(a, 'Vuota? Allora qualcuno li ha presi. Qualcuno che adesso dorme beato...');
  return say(a, 'Latenar ha sempre una scorta. Sotto quel cuscino con la faccia, credo.');
}
async function apriZaino() {
  const f = FK();
  if (Game.chapter !== 7) return say(hero, 'Il mezzo panino mi ha guardato. Richiudo.');
  if (f.scatolaVuota) return say(hero, 'La scatoletta dei tappi è vuota. La scatoletta lo sa. Io lo so.');
  await walkTo(hero, 44, 124); hero.dir = 'up';
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  f.scatolaVuota = true; addScore('zaino', 20);
  await say(hero, 'Calzini, una torcia scarica, mezzo panino... e la scatoletta dei tappi. VUOTA!');
  await say(hero, 'Qualcuno se li è presi. Qualcuno che adesso dorme come un angelo.');
}
async function camerataLatenarGuarda() {
  const f = FK();
  await say(hero, 'Latenar dorme beato, seduto sul letto... con due tappi arancioni nelle orecchie! Ecco dov\'erano.');
  await say(latenar, 'Sto riposando gli occhi.');
  if (!f.latenarTappi) {
    f.latenarTappi = true; addScore('latenarTappi', 15);
    await say(hero, 'Toglierglieli sarebbe un crimine. Ma Latenar tiene sempre una scorta... sotto il cuscino con la faccia.');
  }
}
async function prendiTappi() {
  const f = FK();
  if (Game.chapter !== 7 || !f.latenarTappi) return say(hero, 'Non lo tocco. Ho paura che mi segua in città.');
  if (hasItem('tappi') || f.tappiUsati) return say(hero, 'I tappi ce li ho già. Il cuscino può tornare a fissare il vuoto.');
  await walkTo(hero, 318, 132); hero.dir = 'up';
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  giveItem('tappi'); addScore('tappi', 25);
  await say(hero, 'Sotto il cuscino con la faccia... una bustina di tappi nuovi! Grazie, faccia.');
}
async function usaTappi() {
  const f = FK();
  if (Game.chapter !== 7) return say(hero, 'Li tengo per la notte.');
  hero.pose = 'reach'; await wait(400); hero.pose = 'stand';
  takeItem('tappi'); f.tappiUsati = true;
  await say(hero, 'Tappi nelle orecchie...');
  await say(roleNpc('russa'), 'rrr...onf...', { dur: 1200 });
  await say(hero, 'Silenzio. Pace. Solo il battito del cuore. E un ghiro, lontano.');
  addScore('nanna', 25);
  await say(hero, 'Buonanotte, baita.');
  await wait(600);
  Game.fadeTarget = 1; await wait(1800);
  endChapter(7);
}

/* ---------- la stanza ---------- */
const ROOM_CAMERATA = {
  id: 'camerata', title: 'Camerata', width: CMW,
  links: { salone: 'scaleGiu' },
  spawn: [120, 130],
  walk: [[8, 120], [188, 120], [188, 130], [412, 130], [412, 142], [8, 142]],
  scaleAt(y) { return clamp(0.82 + (y - 120) / 22 * 0.18, 0.82, 1); },
  init() {},
  enter() { if (Game.chapter === 7 && !Game.flags.nannaVista) runScript(nannaIntro); },
  drawBack(g, cam) { g.drawImage(dayNightBg(this, paintCamerata), -cam, 0); },
  darkness() { return isNight() ? 0.55 : 0.28; },
  darkTint: '22,12,4',
  lights() {
    const L = [{ x: 28, y: 56, r: 150, a: 0.95, tint: 'rgba(255,200,120,0.14)' }];
    if (!isNight()) L.push({ x: 372, y: 72, r: 70, a: 0.7, tint: 'rgba(200,220,255,0.06)' });
    L.push({ x: hero.x, y: hero.y - 26, r: 30, a: 0.45 });
    return L;
  },
  objects() {
    return [{ y: 109, draw: g => {
      // la pozza d'acqua che esce dal bagno
      g.fillStyle = '#4a6a8a'; g.fillRect(112, 107, 32, 3); g.fillRect(116, 110, 22, 1); g.fillRect(108, 108, 4, 1);
      g.fillStyle = '#7aa0c0'; g.fillRect(116, 107, 10, 1);
      const k = (Game.t * 0.8) % 1;
      g.fillStyle = `rgba(220,240,255,${0.6 * (1 - k)})`;
      g.fillRect(Math.round(128 - k * 12), 108, Math.round(k * 24) || 1, 1);
    } }];
  },
  itemVerbs: { tappi: { usa: () => usaTappi() } },
  update(dt) {
    // chi russa non smette mai (finché non hai i tappi)
    const f = Game.flags;
    if (Game.chapter !== 7 || f.tappiUsati || !f.nannaVista) return;
    this._ronf = (this._ronf || 4) - dt;
    if (this._ronf <= 0 && !Game.busy && !Game.speeches.length && !Game.dialog) {
      this._ronf = 5 + Math.random() * 4;
      const a = roleNpc('russa'); if (a) say(a, pick(['RONF... RONF...', 'RRRRONF!', 'Zzz... RONF!', 'RONF-FIUUU...']), { dur: 1300 });
    }
  },
  hotspots: [],
};
ROOMS.camerata = ROOM_CAMERATA;

ROOM_CAMERATA.hotspots = [
  { id: 'perlinatoCam', name: 'Perlinato', rects: [[56, 28, 360, 78]], hint: false,
    verbs: { guarda: () => say(hero, 'Perlinato anche qui. In questa baita, se stai fermo troppo a lungo, ti perlinano.') } },
  { id: 'travi', name: 'Travi', rects: [[0, 0, 416, 30]], hint: false,
    verbs: { guarda: () => say(hero, "Travi enormi e un soffitto che scende. Ogni volta che mi alzo dal letto ci sbatto la testa. Anche se il letto è dall'altra parte.") } },
  { id: 'pavimentoCam', name: 'Pavimento', rects: [[0, 106, 416, 38]], hint: false,
    verbs: { guarda: () => say(hero, 'Assi di legno che scricchiolano. Impossibile andare in bagno di notte senza svegliare tutti.') } },
  { id: 'applique', name: 'Applique', rects: [[20, 48, 16, 12]], walk: [30, 124], face: 'up',
    verbs: {
      guarda: () => say(hero, "L'applique. Fa la luce di dieci soli ed è l'unica della camerata: o sei abbagliato, o sei al buio."),
      usa: () => say(hero, "Se la spengo, qualcuno inciampa nello zaino. Se la lascio accesa, qualcuno si lamenta. La lascio com'è."),
    } },
  { id: 'quadretto', name: 'Quadretto', rects: [[8, 66, 13, 15]], walk: [16, 124], face: 'up',
    verbs: { guarda: () => say(hero, 'Un quadretto con una montagna. Per chi si sveglia e non si ricorda dove si trova.') } },
  { id: 'giacca', name: 'Giacca rossa', rects: [[36, 60, 18, 30]], walk: [44, 124], face: 'up',
    verbs: {
      guarda: () => say(hero, "Una giacca rossa appesa al chiodo. Non è mia. In camerata niente è di nessuno e tutto è di tutti."),
      raccogli: () => say(hero, 'In camerata le giacche si scambiano da sole durante la notte. Meglio non accelerare il processo.'),
    } },
  { id: 'termosifone', name: 'Termosifone', rects: [[4, 88, 32, 16]], walk: [20, 124], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Il termosifone. Tiepido come un\'opinione.'),
      usa: () => say(hero, 'Giro la manopola... e non cambia niente. Come previsto.'),
    } },
  { id: 'zaino', name: 'Zaino', rects: [[37, 90, 16, 16]], walk: [44, 124], face: 'up',
    verbs: {
      guarda: () => say(hero, "Uno zaino verde. Dentro: calzini, una torcia scarica e mezzo panino del viaggio d'andata."),
      raccogli: () => say(hero, 'Non è il mio. Il mio è quello che puzza meno. Credo.'),
      apri: () => apriZaino(),
    } },
  { id: 'portaBagno', name: 'Porta del bagno', rects: [[112, 48, 32, 58]], walk: [128, 122], face: 'up',
    verbs: {
      guarda: () => say(hero, "Il bagno della camerata. Luciano ha detto che è esploso. Da sotto la porta esce acqua, e si sente un gorgoglio che non mi piace."),
      apri: () => say(hero, 'Apro... GLUGLUGLU. Richiudo. Quel bagno ha bisogno di un idraulico, di un prete e di un esorcista. In quest\'ordine.'),
      chiudi: () => say(hero, 'È chiusa. E deve restare chiusa. Per il bene di tutti.'),
      parla: () => say(hero, 'C\'è qualcuno? ...Glu. Non ho più domande.'),
    } },
  { id: 'pozza', name: "Pozza d'acqua", rects: [[108, 106, 40, 6]], walk: [128, 122], face: 'up',
    verbs: {
      guarda: () => say(hero, "Una pozza che esce da sotto la porta del bagno. Si allarga piano piano. Come le cimici."),
      raccogli: () => say(hero, 'Raccogliere acqua di un bagno esploso? Neanche col casco forestale.'),
    } },
  { id: 'armadio', name: 'Armadio', rects: [[148, 36, 40, 70]], walk: [168, 122], face: 'up',
    verbs: {
      guarda: () => say(hero, "L'armadio della camerata, con un sacco a pelo arrotolato sopra. Profuma di naftalina e di gite scolastiche."),
      apri: () => say(hero, 'Coperte di lana, un sacco a pelo del 1985 e un maglione con una renna. Richiudo prima che la renna mi veda.'),
    } },
  { id: 'asciugamani', name: 'Asciugamani', rects: [[200, 44, 112, 36]], walk: [256, 132], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Asciugamani stesi sul filo. In camerata non si asciugano mai: diventano solo umidi in un altro modo.'),
      raccogli: () => say(hero, 'Sono ancora bagnati. Da tre giorni.'),
    } },
  { id: 'ghirlanda', name: 'Ghirlanda', rects: [[312, 58, 17, 17]], walk: [320, 132], face: 'up',
    verbs: { guarda: () => say(hero, 'Una ghirlanda di fiori secchi. Secchi davvero: se la tocchi diventa polvere.') } },
  { id: 'finestrellaCam', name: 'Finestrella', rects: [[354, 56, 36, 28]], walk: [372, 132], face: 'up',
    verbs: {
      guarda: () => say(hero, isNight() ? 'Fuori è notte fonda. Le tendine di pizzo fanno ombre strane sul soffitto.' : 'Una finestrella con le tendine di pizzo. Da qui si vede il bosco. E il bosco vede te.'),
      apri: () => say(hero, 'Si apre un dito e poi si blocca. Come tutte le finestre di montagna.'),
    } },
  { id: 'filoFerro', name: 'Rotolo di filo', rects: [[396, 62, 18, 20]], walk: [404, 132], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Un rotolo di fil di ferro appeso al muro. In baita il fil di ferro aggiusta tutto. Anche quello che non era rotto.'),
      raccogli: () => say(hero, 'Lo lascio lì. Prima o poi servirà a qualcuno. Servirà a tutti.'),
    } },
  { id: 'letti', name: 'Letti', rects: [[190, 84, 222, 44]], walk: () => [clamp(hero.x, 200, 400), 132], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Luciano ha detto che i letti sono pieni di cimici. Io vedo solo sacchi a pelo, calzini e tanta umanità.'),
      usa: () => say(hero, 'Dormire adesso? Con le cimici? Prima voglio vederle. Anzi no, non voglio vederle.'),
      raccogli: () => say(hero, 'Prendere un sacco a pelo dalla camerata? È così che iniziano le guerre.'),
    } },
  { id: 'cuscino', name: 'Cuscino con la faccia', rects: [[304, 96, 28, 10]], walk: [318, 132], face: 'up',
    verbs: {
      guarda: () => say(hero, 'Qualcuno ha disegnato una faccia sulla federa col pennarello: occhiali da sole, capelli lunghi, muso lungo. Ti fissa. Anche al buio.'),
      raccogli: () => prendiTappi(),
      parla: () => say(hero, '...Ciao. ...Mi guarda male. Credo che quello fosse il suo letto.'),
    } },
  { id: 'scaleGiu', name: 'Scale per il salone', rects: [[58, 90, 50, 28]], walk: [82, 122], face: 'up', exit: true,
    verbs: {
      guarda: () => say(hero, 'Le scale che scendono nel salone. Ripide. Di notte si scendono seduti.'),
      vai: () => goToRoom(ROOMS.salone, 446, 120, 'left'),
    } },
];
