'use strict';
/* =========================================================
   OGGETTI DELL'INVENTARIO (icone 22x18 + descrizioni)
   Le azioni usano le funzioni del motore (say, give, flag...)
   ========================================================= */
const ICON_W = 22, ICON_H = 18;

function iconCostine(b) {
  b.rect(1, 6, 20, 9, '#8e9296'); b.rect(2, 5, 18, 9, '#c4c8cc'); b.rect(2, 5, 18, 1, '#e4e8ec');
  b.rect(3, 6, 16, 7, '#9a9ea2');
  for (let i = 0; i < 4; i++) {
    const x = 3 + i * 4;
    b.rect(x, 6, 3, 7, '#9c3a28'); b.rect(x, 6, 3, 1, '#c8603e'); b.set(x + 1, 8, '#e8c0a0'); b.set(x + 1, 11, '#e8c0a0'); b.set(x + 2, 10, '#6e2418');
  }
  b.rect(1, 14, 20, 1, '#6e7276');
}
function iconTelefono(b) {
  b.rect(7, 1, 9, 16, '#1c1c22'); b.rect(8, 3, 7, 11, '#3a6ab0'); b.rect(8, 3, 7, 2, '#6a9ae0');
  b.rect(10, 15, 3, 1, '#555'); b.set(11, 2, '#555');
  b.set(13, 4, '#f2e01c');
}
function iconScala(b) {
  b.line(4, 17, 9, 0, '#8a6a3e'); b.line(5, 17, 10, 0, '#6a4a28');
  b.line(12, 17, 17, 0, '#8a6a3e'); b.line(13, 17, 18, 0, '#6a4a28');
  for (let y = 2; y < 17; y += 4) { const x = 5 + (17 - y) * 5 / 17; b.rect(Math.round(x + 1), y, 7, 1, '#a07e4e'); }
}
function iconChiave(b) {
  b.ellipse(6, 9, 4, 4, '#a8803a'); b.ellipse(6, 9, 2, 2, null); b.ellipse(6, 9, 1, 1, '#2a1a10');
  b.set(4, 7, '#d8b060'); b.rect(10, 8, 9, 2, '#a8803a'); b.rect(10, 8, 9, 1, '#d8b060');
  b.rect(16, 10, 1, 3, '#a8803a'); b.rect(18, 10, 1, 2, '#a8803a'); b.set(13, 9, '#7a4a20');
}
function iconTappo(b) {
  b.ellipse(11, 9, 6, 6, '#c8a028');
  for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; b.set(11 + Math.round(Math.cos(t) * 7), 9 + Math.round(Math.sin(t) * 7), '#8a6a18'); }
  b.ellipse(11, 9, 4, 4, '#e8c040'); b.rect(8, 8, 7, 2, '#b02020'); b.set(9, 6, '#fff4b0');
}
function iconMotosega(b, full) {
  b.rect(1, 6, 9, 8, '#ee6c12'); b.rect(1, 13, 9, 1, '#a8460a'); b.rect(2, 7, 4, 1, '#ffa060');
  b.rect(3, 3, 6, 1, '#1c1c1c'); b.set(3, 4, '#1c1c1c'); b.set(8, 4, '#1c1c1c'); b.set(8, 5, '#1c1c1c');
  b.rect(10, 8, 11, 3, '#c0c4c8'); b.rect(10, 10, 11, 1, '#70747a');
  for (let i = 0; i < 11; i += 2) { b.set(10 + i, 7, '#222'); b.set(11 + i, 11, '#222'); }
  b.rect(5, 9, 3, 2, '#2a2a2a');
  if (full) { b.rect(1, 15, 6, 2, '#e05a9a'); b.rect(1, 15, 6, 1, '#ff8ac0'); }
}
function iconOlio(b) {
  b.rect(7, 4, 8, 13, '#2a5aa8'); b.rect(7, 4, 2, 13, '#3a72c8'); b.rect(9, 1, 4, 3, '#d8d8d8');
  b.rect(7, 8, 8, 5, '#f2e8c8'); b.rect(8, 9, 2, 3, '#c02020'); b.rect(11, 9, 3, 1, '#c02020'); b.rect(13, 9, 1, 3, '#c02020'); b.rect(11, 11, 3, 1, '#c02020'); b.set(11, 10, '#c02020');
}
function iconCasco(b) {
  b.ellipse(11, 9, 8, 7, '#f07414'); b.rect(2, 9, 19, 9, null);
  b.rect(1, 10, 21, 2, '#b84a0c'); b.rect(6, 4, 5, 2, '#ffa050');
  for (let y = 12; y < 17; y++) for (let x = 5; x < 18; x++) if ((x + y) & 1) b.set(x, y, '#a8aeb4');
  b.rect(1, 12, 3, 5, '#1e1e1e'); b.rect(19, 12, 3, 5, '#1e1e1e');
}
function iconTanica(b, kind) {
  b.rect(4, 4, 14, 13, '#c41e1e'); b.rect(4, 4, 14, 1, '#e84a3a'); b.rect(4, 16, 14, 1, '#7a1010');
  b.rect(4, 4, 1, 13, '#9a1414'); b.rect(17, 4, 1, 13, '#7a1010');
  b.rect(7, 1, 7, 2, '#c41e1e'); b.rect(8, 2, 5, 2, '#2a1010'); // maniglia
  b.rect(15, 1, 3, 3, '#e0c020'); // tappo
  b.line(6, 7, 15, 14, '#9a1414'); b.line(6, 14, 15, 7, '#9a1414');
  if (kind === 'benzina') { b.rect(1, 11, 4, 6, '#3aa83a'); b.rect(1, 11, 4, 1, '#7ae07a'); }
  if (kind === 'miscela') { b.rect(1, 11, 4, 6, '#e05a9a'); b.rect(1, 11, 4, 1, '#ff8ac0'); }
}
function iconTubo(b) {
  b.ellipse(11, 9, 8, 7, '#2e8a3a'); b.ellipse(11, 9, 6, 5, null);
  b.ellipse(11, 9, 5, 4, '#3aa848'); b.ellipse(11, 9, 3, 2, null);
  b.rect(16, 13, 6, 2, '#2e8a3a'); b.set(5, 6, '#7ae07a'); b.set(8, 5, '#7ae07a');
}
function iconFrontale(b) {
  b.ellipse(11, 9, 8, 5, '#2a2a30'); b.ellipse(11, 9, 6, 3, null);
  b.rect(8, 9, 7, 6, '#3a3a44'); b.rect(9, 10, 5, 4, Game.flags.lampDead ? '#5a5a50' : '#fff6c0'); b.set(10, 11, '#ffffff');
  b.rect(15, 11, 2, 2, '#c03030');
}
function iconRamo(b) {
  b.thick(2, 16, 19, 2, 2, '#6a4a2a'); b.line(3, 16, 20, 2, '#8a6a40');
  b.line(9, 10, 6, 5, '#6a4a2a'); b.line(14, 6, 17, 9, '#6a4a2a'); b.set(5, 4, '#b07a30'); b.set(18, 10, '#c88a30');
}
function iconTrave(b) {
  b.poly([[1, 13], [17, 2], [21, 5], [5, 16]], (x, y) => ((x + y * 2) % 7 === 0) ? '#6a4626' : '#9a7044');
  b.line(1, 13, 17, 2, '#c0956a'); b.line(5, 16, 21, 5, '#4a2e18');
  b.poly([[1, 13], [5, 16], [4, 17], [0, 14]], '#c8a070');
}
function iconNoce(b) {
  b.ellipse(11, 9, 6, 7, '#8a6a3a');
  b.ellipse(11, 9, 5, 6, (x, y) => (hash2(x, y, 120) < 0.3 || (x + y * 2) % 5 === 0) ? '#6e5228' : '#a07e48');
  b.rect(11, 2, 1, 15, '#5a4220'); b.set(9, 4, '#c8a468'); b.set(8, 6, '#c8a468');
}
function iconChiaviPunto(b) {
  b.ellipse(6, 5, 3, 3, '#b0b0b8'); b.ellipse(6, 5, 1, 1, null);
  b.rect(8, 4, 8, 2, '#c8c8d0'); b.rect(13, 6, 1, 2, '#c8c8d0'); b.rect(15, 6, 1, 1, '#c8c8d0');
  b.rect(4, 8, 2, 4, '#222'); b.rect(3, 11, 4, 3, '#2a2a2a');
  // portachiavi a trota
  b.ellipse(13, 13, 5, 2, '#8aa0a8'); b.rect(8, 12, 1, 3, '#8aa0a8'); b.set(7, 11, '#8aa0a8'); b.set(7, 15, '#8aa0a8');
  b.rect(10, 13, 6, 1, '#d87a8a'); b.set(16, 12, '#111'); for (let x = 10; x < 17; x += 2) b.set(x, 12, '#3a4a50');
}
function iconLegna(b) {
  const log = (x, y) => {
    b.rect(x, y, 12, 4, (px, py) => py === y ? '#d8d0c0' : ((px + py) % 5 === 0 ? '#3a3a36' : '#b8b2a4'));
    b.ellipse(x + 12, y + 2, 2, 2, '#e0b878'); b.set(x + 12, y + 2, '#a87a40');
  };
  log(2, 11); log(6, 7); log(3, 3);
  b.rect(1, 15, 16, 1, '#5a4a36');
}
function iconArachidi(b) {
  b.poly([[4, 3], [18, 3], [20, 17], [2, 17]], '#2a2a32');
  b.rect(4, 2, 14, 2, '#8a8a92'); for (let x = 4; x < 18; x += 2) b.set(x, 1, '#8a8a92');
  b.ellipse(11, 11, 5, 4, '#ec7a14'); b.rect(10, 6, 2, 2, '#3a7a2a');
  b.set(9, 10, '#2a1a0a'); b.set(13, 10, '#2a1a0a'); b.rect(9, 13, 5, 1, '#2a1a0a'); b.set(10, 12, '#ffd060');
  b.rect(3, 4, 4, 2, '#c8302a'); b.ellipse(16, 15, 2, 1, '#d8b070');
}
function iconCacciavite(b) {
  b.thick(3, 15, 12, 6, 3, '#c82a2a'); b.line(3, 14, 11, 6, '#ec5a4a');
  b.thick(12, 6, 19, 1, 1, '#b8bcc0'); b.set(20, 1, '#e8ecf0');
}
function iconSpray(b) {
  b.rect(7, 5, 8, 12, '#2a5ab0'); b.rect(7, 5, 2, 12, '#3a72d0'); b.rect(7, 9, 8, 4, '#f0d040'); b.rect(9, 10, 4, 2, '#c82a2a');
  b.rect(9, 2, 4, 3, '#c8c8c8'); b.rect(12, 2, 4, 1, '#e8e8e8'); b.set(16, 2, '#d0d0d0');
}
function iconCrocifisso(b) {
  b.rect(10, 1, 3, 16, '#8a5a2a'); b.rect(5, 5, 13, 3, '#8a5a2a'); b.rect(10, 1, 1, 16, '#b07a40'); b.rect(5, 5, 13, 1, '#b07a40');
  b.rect(10, 6, 3, 6, '#d8a878'); b.set(11, 5, '#e8c098'); b.set(7, 6, '#d8a878'); b.set(16, 6, '#d8a878');
}
function iconGuanti(b) {
  for (const x0 of [3, 11]) { b.rect(x0, 6, 7, 10, '#e8c820'); b.rect(x0, 2, 2, 5, '#e8c820'); b.rect(x0 + 2, 1, 2, 6, '#e8c820'); b.rect(x0 + 4, 2, 2, 5, '#e8c820'); b.rect(x0 + 6, 8, 2, 3, '#e8c820'); b.rect(x0, 15, 7, 1, '#b89810'); b.rect(x0, 6, 1, 9, '#f8e060'); }
}
function iconSturalavandini(b) {
  b.rect(10, 1, 2, 11, '#8a6a3a'); b.rect(10, 1, 1, 11, '#b08a50');
  b.ellipse(11, 14, 7, 3, '#c8302a'); b.rect(4, 14, 15, 3, '#c8302a'); b.rect(4, 16, 15, 1, '#8a1a14'); b.ellipse(11, 13, 5, 1, '#e85a4a');
}
function iconCarbonella(b) {
  b.poly([[3, 4], [19, 4], [20, 17], [2, 17]], '#c8b890'); b.rect(3, 4, 16, 2, '#a89870');
  b.rect(5, 8, 12, 5, '#1a1a1a'); for (let i = 0; i < 6; i++) b.set(6 + i * 2, 10 + (i & 1), '#5a5a5a');
}
function iconAccendino(b) {
  b.rect(8, 6, 7, 11, '#2a6ac8'); b.rect(8, 6, 2, 11, '#4a8ae8'); b.rect(8, 3, 7, 3, '#c8c8c8'); b.rect(12, 1, 2, 2, '#ffb030'); b.set(12, 0, '#ffe080');
}
function iconGuinness(b) {
  b.rect(1, 6, 20, 11, '#141414'); b.rect(1, 6, 20, 1, '#2a2a2a');
  b.rect(5, 9, 12, 5, '#e8dcb8'); b.rect(9, 10, 4, 3, '#c8a040');
  for (let x = 2; x < 20; x += 4) { b.rect(x, 3, 3, 3, '#1e1e1e'); b.rect(x, 3, 3, 1, '#c8c8c8'); }
}
function iconBicchierini(b) {
  for (const x0 of [3, 10, 16]) { b.poly([[x0, 6], [x0 + 5, 6], [x0 + 4, 15], [x0 + 1, 15]], '#d8e8f0'); b.rect(x0 + 1, 10, 3, 5, '#e8b850'); b.rect(x0, 6, 5, 1, '#ffffff'); b.rect(x0 + 1, 15, 3, 1, '#a8b8c0'); }
  b.set(5, 5, '#f8e080');
}
function iconTappi(b) {
  for (const [x, y] of [[5, 6], [12, 8]]) { b.ellipse(x + 2, y + 4, 3, 4, '#ec7a20'); b.ellipse(x + 2, y + 2, 2, 2, '#f8a050'); b.set(x + 1, y + 1, '#ffd0a0'); }
  b.rect(2, 15, 18, 2, '#c8c8c0'); b.rect(2, 15, 18, 1, '#e8e8e0');
}
function iconBagagli(b) {
  b.rect(1, 7, 9, 10, '#2a5a2a'); b.rect(1, 7, 9, 1, '#3e7a3e'); b.rect(3, 5, 5, 2, '#1e3e1e');
  b.rect(9, 9, 12, 8, '#1e2a4a'); b.rect(9, 9, 12, 1, '#2e3e6a'); b.ellipse(15, 5, 5, 3, '#c83a28');
}

// capitolo 3: la postazione retro
function iconTv(b) {
  b.rect(2, 2, 18, 13, '#1a1a1e'); b.rect(2, 2, 18, 1, '#3a3a40');
  b.rect(4, 4, 14, 9, (x, y) => ramp(['#2a3a5a', '#3a4e72', '#4e6488'], clamp((y - 4) / 12 + (x - 4) / 40, 0, 0.999), x, y));
  b.line(6, 5, 9, 5, '#8aa0c8');
  b.rect(9, 15, 4, 1, '#2a2a2e'); b.rect(6, 16, 10, 1, '#2a2a2e'); b.set(17, 13, '#e83a2a');
}
function iconCavi(b) {
  b.thick(2, 13, 9, 4, 1, '#1a1a1a'); b.thick(9, 4, 15, 13, 1, '#1a1a1a'); b.thick(15, 13, 20, 5, 1, '#1a1a1a');
  b.thick(3, 6, 12, 14, 1, '#e8e8e4'); b.thick(12, 14, 19, 9, 1, '#e8e8e4');
  b.line(4, 10, 18, 11, '#c83a2a');
  b.rect(1, 12, 3, 3, '#3a3a40'); b.rect(19, 4, 2, 3, '#c8c8c8'); b.rect(18, 9, 3, 2, '#3a5aa8');
}
function iconPad(b) {
  b.ellipse(6, 10, 5, 5, '#2e2e36'); b.ellipse(16, 10, 5, 5, '#2e2e36'); b.rect(6, 6, 10, 8, '#2e2e36'); b.rect(6, 6, 10, 1, '#4a4a54');
  b.rect(3, 9, 5, 1, '#14141a'); b.rect(5, 7, 1, 5, '#14141a');
  b.set(16, 7, '#e83a3a'); b.set(18, 9, '#3a8aff'); b.set(14, 9, '#3ac83a'); b.set(16, 11, '#f2e01c');
  b.set(11, 8, '#3a8aff');
}

const ICONS = {
  costine: iconCostine, telefono: iconTelefono, scala: iconScala, chiave: iconChiave, tappo: iconTappo,
  motosega: b => iconMotosega(b, Game.flags.sawFuel), olio: iconOlio, casco: iconCasco,
  tanica: b => iconTanica(b, Game.flags.tanica), tubo: iconTubo, chiaviPunto: iconChiaviPunto, noce: iconNoce,
  frontale: iconFrontale, ramo: iconRamo, trave1: iconTrave, trave2: iconTrave, legna: iconLegna, arachidi: iconArachidi, cacciavite: iconCacciavite, spray: iconSpray,
  crocifisso: iconCrocifisso, guanti: iconGuanti, sturalavandini: iconSturalavandini, carbonella: iconCarbonella, accendino: iconAccendino, guinness: iconGuinness,
  bicchierini: iconBicchierini, tappi: iconTappi, bagagli: iconBagagli, tv: iconTv, cavi: iconCavi, pad: iconPad,
};
function itemIcon(id) {
  const st = id === 'tanica' ? Game.flags.tanica : id === 'motosega' ? Game.flags.sawFuel : id === 'frontale' ? !!Game.flags.lampDead : '';
  return cached('icon|' + id + '|' + st, () => { const b = new Buf(ICON_W, ICON_H); ICONS[id](b); return b.canvas(); });
}

const ITEMS = {
  tv: {
    name: 'Televisore',
    verbs: {
      guarda: () => say(hero, 'La TV della baita. Pesante, con un graffio a forma di Italia. Va sul mobile della TV, nel salone.'),
      usa: () => say(hero, 'Va sul mobile della TV, in salone. Non la uso come scudo contro i ladri, come Luciano.'),
    },
  },
  cavi: {
    name: 'Groviglio di cavi',
    verbs: {
      guarda: () => say(hero, 'HDMI, alimentazione e una prolunga. Annodati tra loro come se fosse una cosa voluta.'),
      usa: () => say(hero, 'Vanno dietro la TV. Tutti. In qualche modo.'),
      apri: () => say(hero, 'Provo a sbrogliarli... ho fatto un nodo nuovo. Li collego così come sono.'),
    },
  },
  pad: {
    name: 'Joypad bluetooth',
    verbs: {
      guarda: () => say(hero, 'Due joypad bluetooth. Il due tira a sinistra da sempre. Fa parte del suo fascino.'),
      usa: () => say(hero, 'Prima vanno abbinati al computer. Col bluetooth.'),
    },
  },
  costine: {
    name: 'Teglia di costine',
    verbs: {
      guarda: () => say(hero, isKodo() ? 'Costine marinate da me. Aglio, rosmarino e un segreto che porterò nella tomba.' : 'Le costine marinate da Kodo. Aglio, rosmarino e un segreto che si porterà nella tomba.'),
      usa: () => say(hero, 'Crude? Neanche per sogno. Prima serve la brace.'),
      apri: () => say(hero, "Le annuso... Aglio e rosmarino. Resisti: vanno sulla brace del portico, non adesso."),
    },
  },
  telefono: {
    name: 'Telefono', useAlone: true,
    verbs: {
      guarda: () => say(hero, 'Il mio telefono. Due per cento di batteria e zero campo. Perfetto.'),
      usa: () => say(hero, "Zero tacche. Qui l'unico segnale è quello del dosso."),
      apri: () => say(hero, 'Apro la galleria: 4000 foto di grigliate. Nessuna di legna tagliata.'),
    },
  },
  scala: {
    name: 'Scala di legno',
    verbs: { guarda: () => say(hero, 'Una scala di legno. Robusta, se non la guardi troppo.') },
  },
  chiave: {
    name: 'Chiave della baracca',
    verbs: { guarda: () => say(hero, "Una vecchia chiave arrugginita. Sa di noce e di ghiro.") },
  },
  tappo: {
    name: 'Tappo di birra',
    verbs: { guarda: () => say(hero, 'Un tappo di birra. Chissà da dove arriva.') },
  },
  motosega: {
    name: () => Game.flags.sawFuel ? 'Motosega (con miscela)' : 'Motosega (a secco)',
    verbs: {
      guarda: () => say(hero, Game.flags.sawFuel
        ? 'La motosega di Luciano. Piena di miscela e pronta a ruggire.'
        : 'La motosega di Luciano. Arancione e leggendaria. Il serbatoio però è vuoto.'),
      tira: () => say(hero, 'La accendo solo davanti ai tronchi. Non sono mica in un film dell\'orrore.'),
      apri: () => say(hero, Game.flags.sawFuel ? 'È già piena.' : 'Il serbatoio è vuoto. Serve la miscela.'),
    },
  },
  olio: {
    name: 'Olio per miscela',
    verbs: { guarda: () => say(hero, "Olio 2T per la miscela. 'Al due per cento', c'è scritto. Luciano dice 'a occhio'.") },
  },
  casco: {
    name: 'Casco forestale',
    verbs: {
      guarda: () => say(hero, isKodo() ? 'Casco con visiera e cuffie. Lo metterò sopra il colbacco. Stile.' : 'Casco con visiera e cuffie. Arancione: il colore della sicurezza.'),
      usa: () => say(hero, 'Lo indosso quando uso la motosega. Prima no: mi schiaccia il pelo.'),
    },
  },
  tanica: {
    name: () => ({ vuota: 'Tanica vuota', benzina: 'Tanica di benzina', miscela: 'Tanica di miscela' })[Game.flags.tanica || 'vuota'],
    verbs: {
      guarda: () => say(hero, ({
        vuota: 'Una tanica rossa. Vuota come il frigo il lunedì.',
        benzina: 'Benzina presa in prestito dalla Punto. In prestito per sempre.',
        miscela: 'Miscela al due per cento. Rosa. Profuma di motosega.',
      })[Game.flags.tanica || 'vuota']),
      apri: () => say(hero, Game.flags.tanica === 'vuota' ? 'Annuso... niente. Vuota.' : 'Annuso... che profumo di distributore!'),
    },
  },
  tubo: {
    name: 'Tubo di gomma',
    verbs: { guarda: () => say(hero, 'Un bel pezzo di tubo di gomma. Ideale per travasi. E per disastri.') },
  },
  frontale: {
    name: 'Frontale', useAlone: true,
    verbs: {
      guarda: () => say(hero, Game.flags.lampDead ? 'La frontale. Morta. Le pile le avevo cambiate... nel 2019.' : 'La mia lampada frontale. Fa una luce bianca da interrogatorio.'),
      usa: async () => {
        const f = Game.flags;
        if (f.lampDead) return say(hero, 'Niente da fare: la frontale è morta. Pace all\'anima sua.');
        if (f.lampOn) return say(hero, 'È già accesa. Se la spengo non vedo più i piedi.');
        f.lampOn = true; SFX.clack();
        await say(hero, 'Clic! Luce! Adesso sì che si vede il guado.');
        addScore('frontale', 5);
      },
    },
  },
  ramo: {
    name: 'Ramo lungo',
    verbs: { guarda: () => say(hero, 'Un ramo lungo e robusto, con un uncino in cima. Perfetto per ripescare cose.') },
  },
  trave1: {
    name: 'Trave di legno',
    verbs: { guarda: () => say(hero, 'Una trave di legno, lunga e solida. Ci si potrebbe camminare sopra.') },
  },
  trave2: {
    name: 'Trave bagnata',
    verbs: { guarda: () => say(hero, 'Una trave ripescata dal torrente. Bagnata, ma robusta.') },
  },
  noce: {
    name: 'Noce',
    verbs: {
      guarda: () => say(hero, 'Una noce bella piena. Cibo da ghiro. O da nocino.'),
      apri: () => say(hero, 'Schiacciarla? Meglio di no: potrebbe servirmi intera.'),
    },
  },
  legna: {
    name: 'Legna tagliata',
    verbs: {
      guarda: () => say(hero, 'Una bracciata di ciocchi di betulla, tagliati da me. Profumano di bosco e di miscela.'),
      usa: () => say(hero, 'Va nel caminetto. Nella stanza del caminetto. Serve per scaldare e per cucinare.'),
    },
  },
  arachidi: {
    name: 'Arachidi di Halloween',
    verbs: {
      guarda: () => say(hero, "Arachidi della Lidl, edizione Halloween. Sul sacchetto c'è una zucca che ride. Io non rido: ho fame."),
      apri: () => say(hero, "Le apro all'orrido, con gli altri. Sono arachidi da grandi occasioni."),
      usa: () => say(hero, "Le tengo per l'orrido. Mangiarle da solo sarebbe un tradimento."),
    },
  },
  cacciavite: {
    name: 'Cacciavite',
    verbs: { guarda: () => say(hero, 'Un cacciavite a croce col manico rosso. Il migliore amico di chi aggiusta le cose.') },
  },
  spray: {
    name: 'Spray sbloccante',
    verbs: {
      guarda: () => say(hero, 'Spray sbloccante, regalo di ' + socioNome() + '. Sblocca viti, ventole e, secondo lui, anche le amicizie.'),
      usa: () => say(hero, 'Spruzzarlo a caso? ' + socioNome() + ' mi ucciderebbe. Va sulla ventola.'),
    },
  },
  crocifisso: {
    name: 'Crocifisso',
    verbs: {
      guarda: () => say(hero, 'Il crocifisso di legno della baita. Chino lo porta sempre con sé. Per sicurezza.'),
      usa: () => say(hero, 'Prego un attimo... Fatto. Mi sento più forte. Anche se il water è ancora intasato.'),
    },
  },
  guanti: {
    name: 'Guanti di gomma',
    verbs: { guarda: () => say(hero, 'Guanti di gomma gialli. Nessuno può fermarmi, adesso.') },
  },
  sturalavandini: {
    name: 'Sturalavandini',
    verbs: { guarda: () => say(hero, 'Ventosa rossa e manico di legno. Lo strumento più nobile del mondo.') },
  },
  carbonella: {
    name: 'Sacco di carbonella',
    verbs: { guarda: () => say(hero, 'Un sacco di carbonella. Nera, polverosa, promettente.') },
  },
  accendino: {
    name: 'Accendino di Zac',
    verbs: { guarda: () => say(hero, "L'accendino di Zac. Blu, con la fiamma regolata al massimo. Come lui.") },
  },
  guinness: {
    name: 'Cassa di Guinness', useAlone: true,
    verbs: {
      guarda: () => say(hero, 'Ventiquattro lattine di birra scura e cremosa.'),
      usa: () => say(hero, 'Qui no. Al portico, davanti alle costine.'),
    },
  },
  bicchierini: {
    name: 'Bicchieri buoni',
    verbs: { guarda: () => say(hero, 'I bicchierini buoni della vetrina, col bordo dorato. Pronti per la degustazione.') },
  },
  tappi: {
    name: 'Tappi per le orecchie', useAlone: true,
    verbs: { guarda: () => say(hero, 'Tappi arancioni di spugna. La salvezza, in formato tascabile.') },
  },
  bagagli: {
    name: 'Bagagli',
    verbs: { guarda: () => say(hero, 'Zaini, borsoni e sacchi a pelo. Vanno nella Ypsilon, nel parcheggio.') },
  },
  chiaviPunto: {
    name: 'Chiavi della Punto',
    verbs: { guarda: () => say(hero, 'Le chiavi della Punto di Luciano. Portachiavi a forma di trota. Classe.') },
  },
};
function itemName(id) { const n = ITEMS[id].name; return typeof n === 'function' ? n() : n; }

/* combinazioni oggetto + oggetto */
const COMBOS = {
  'olio+tanica': async () => {
    if (Game.flags.tanica === 'vuota') return say(hero, "Prima la benzina, poi l'olio. Luciano sarebbe fiero di me.");
    if (Game.flags.tanica === 'miscela') return say(hero, "L'olio c'è già. Di più fa fumo come un treno a vapore.");
    hero.pose = 'reach'; SFX.pour(); await wait(900); hero.pose = 'stand';
    Game.flags.tanica = 'miscela'; takeItem('olio');
    await say(hero, "Olio nella benzina, al due per cento. Ok, a occhio. Come fa Luciano.");
    addScore('miscela', 5);
  },
  'motosega+tanica': async () => {
    if (Game.flags.sawFuel) return say(hero, 'È già piena fino al tappo.');
    if (Game.flags.tanica === 'vuota') return say(hero, 'La tanica è vuota. Non posso riempire niente con il niente.');
    if (Game.flags.tanica === 'benzina') {
      if (!hasItem('olio')) {
        await say(hero, "Fermo! È una motosega a due tempi: ci vuole la miscela, benzina più olio.");
        return say(hero, "L'olio dovrebbe essere in baracca.");
      }
      await COMBOS['olio+tanica']();
    }
    hero.pose = 'reach'; SFX.pour(); await wait(1000); hero.pose = 'stand';
    Game.flags.sawFuel = true;
    await say(hero, 'Pieno fatto! Adesso sì che si ragiona.');
  },
  'motosega+olio': () => say(hero, "L'olio va nella benzina, non direttamente nella motosega. Lo so, sono un esperto. Più o meno."),
  'tanica+tubo': () => say(hero, 'Prima devo infilare il tubo nel serbatoio di qualcosa che abbia benzina.'),
  'casco+motosega': () => say(hero, 'Il casco lo indosso al momento di tagliare. Prima no, fa caldo.'),
  'costine+telefono': () => say(hero, "Una foto alle costine? Senza campo non la posso nemmeno postare."),
  'chiave+tappo': () => say(hero, "Una chiave e un tappo. Non c'entrano niente, ma stanno bene insieme."),
};
