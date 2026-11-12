'use strict';
/* =========================================================
   GLI AMICI DI KODO
   Per ora sono sagome (di notte, con la frontale in testa):
   nomi e aspetto arriveranno dalle foto
   ========================================================= */
const AMICI_W = 24, AMICI_CX = 12, AMICI_OY = 54;
const AMICI_LOOK = [
  { jacket: ['#141a24', '#1e2a3a', '#2e3e52'], hat: 'beanie', hatC: '#5a1a1a' },
  { jacket: ['#201616', '#2e1e1e', '#44302c'], hat: 'hood', hatC: '#2e1e1e' },
  { jacket: ['#161e16', '#1e2a1e', '#2e3e2c'], hat: 'hair', hatC: '#24160c' },
];

function buildAmico(v, o) {
  const L = AMICI_LOOK[v];
  const b = new Buf(AMICI_W, 58);
  const cx = AMICI_CX, top = 4;
  const sw = o.phase == null ? 0 : Math.round(Math.sin(o.phase * Math.PI * 2) * 2);
  // gambe
  b.rect(cx - 4 + sw, top + 34, 3, 16, '#121216'); b.rect(cx + 1 - sw, top + 34, 3, 16, '#16161c');
  b.rect(cx - 5 + sw, top + 49, 4, 2, '#0a0a0c'); b.rect(cx + 1 - sw, top + 49, 4, 2, '#0a0a0c');
  // giacca, con un filo di luce sul bordo
  b.rect(cx - 6, top + 14, 12, 21, (x, y) => ramp(L.jacket, clamp(0.4 + (x - cx) / 16 - (y - top - 14) / 60, 0, 0.999), x, y));
  b.rect(cx - 7, top + 15, 2, 15, L.jacket[0]); b.rect(cx + 5, top + 15, 2, 15, L.jacket[1]);
  b.rect(cx + 6, top + 15, 1, 14, L.jacket[2]);
  // testa
  b.ellipse(cx, top + 8, 4, 5, (x, y) => ramp(['#3a2a20', '#5a4232', '#6e5240'], clamp(0.5 + (x - cx) / 10, 0, 0.999), x, y));
  if (L.hat === 'beanie') { b.ellipse(cx, top + 5, 5, 4, L.hatC); b.rect(cx - 5, top + 5, 11, 2, L.hatC); b.ellipse(cx, top, 2, 1, '#8a4a3a'); }
  if (L.hat === 'hood') { b.ellipse(cx, top + 7, 6, 7, L.hatC); b.ellipse(cx, top + 9, 4, 4, (x, y) => ramp(['#3a2a20', '#5a4232'], clamp(0.5 + (x - cx) / 10, 0, 0.999), x, y)); }
  if (L.hat === 'hair') { b.ellipse(cx, top + 5, 5, 4, L.hatC); b.rect(cx - 5, top + 5, 2, 12, L.hatC); b.rect(cx + 3, top + 5, 2, 10, L.hatC); b.rect(cx - 2, top + 11, 5, 3, L.hatC); }
  // frontale
  b.rect(cx - 4, top + 5, 9, 1, '#1a1a1a');
  b.rect(cx + 1, top + 4, 3, 3, o.lamp ? '#fffbe0' : '#4a4a48');
  if (o.lamp) b.set(cx + 2, top + 5, '#ffffff');
  if (o.talk) b.rect(cx, top + 11, 2, 1, '#1a0a06');
  return b.canvas();
}

function makeAmici() {
  return AMICI_LOOK.map((_, i) => {
    const a = makeActor({ name: 'Amico ' + (i + 1), color: ['#8fd3ff', '#ffb38a', '#b8f28a'][i], speed: 50, variant: i, lamp: false, dir: 'right' });
    a.headPos = () => [a.x, a.y - 50 * actorScale(a) - 3];
    return a;
  });
}
function drawAmico(g, a) {
  const s = actorScale(a);
  const phase = a.path.length ? (Math.floor(a.walkDist / (3 * s)) % 8) / 8 : null;
  const talk = isTalking(a) && (((Game.t * 9) | 0) % 3 !== 0);
  const flip = a.dir === 'left';
  const cv = cached(['amico', a.variant, !!a.lamp, phase, talk, flip].join('|'), () => {
    const c = buildAmico(a.variant, { lamp: a.lamp, phase, talk });
    return flip ? flipCanvas(c) : c;
  });
  const w = Math.round(cv.width * s), h = Math.round(cv.height * s);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(Math.round(a.x - 6 * s), Math.round(a.y) - 1, Math.round(12 * s), 2);
  g.drawImage(cv, Math.round(a.x - AMICI_CX * s), Math.round(a.y - AMICI_OY * s), w, h);
}
// luce della frontale di un amico
function amicoLights(a) {
  const s = actorScale(a);
  const hx = a.x, hy = a.y - 46 * s, fx = a.dir === 'left' ? -26 : 26;
  return [{ x: hx, y: hy, r: 16, a: 0.8 }, { x: hx + fx, y: hy + 14, r: 46, a: 0.85, tint: 'rgba(160,180,255,0.07)' }];
}
// voce degli amici che arriva da fuori scena (a sinistra)
const amiciVoce = makeActor({ name: 'Amici', color: '#9fe3d8', headPos: () => [Game.camX + 34, 60] });
