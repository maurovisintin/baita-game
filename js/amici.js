'use strict';
/* =========================================================
   GLI AMICI NELLE SCENE DI GRUPPO (guado e orrido)
   Sono i personaggi veri (js/personaggi.js) con la frontale
   ========================================================= */
// crea gli attori degli amici che accompagnano il personaggio scelto
function partyActors() {
  return (Game.party || []).map(id => makeActor({ name: PG[id].name, color: PG[id].color, look: id, speed: 50, lamp: false, dir: 'right' }));
}
// luce della frontale di un amico
function amicoLights(a) {
  const s = actorScale(a);
  const hx = a.x, hy = a.y - 46 * s, fx = a.dir === 'left' ? -26 : 26;
  return [{ x: hx, y: hy, r: 16, a: 0.8 }, { x: hx + fx, y: hy + 14, r: 46, a: 0.85, tint: 'rgba(160,180,255,0.07)' }];
}
// voce di un amico che arriva da fuori scena (a sinistra)
const amiciVoce = makeActor({ name: 'Amici', color: '#9fe3d8', headPos: () => [Game.camX + 34, 60] });
function voceAmico() {
  const id = (Game.party || [])[0];
  if (id) { amiciVoce.name = PG[id].name; amiciVoce.color = PG[id].color; }
  return amiciVoce;
}
