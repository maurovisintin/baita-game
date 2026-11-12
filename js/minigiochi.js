'use strict';
/* =========================================================
   MINI-GIOCHI
   "TEMPO DI CRISI - La vendetta dei ghiri": sparatoria in
   cooperativa sulla console del salone (parodia originale)
   ========================================================= */

// il ghiro cattivo: occhiali da sole, coda a piumino e pistolina
function ghiroCattivoCanvas(frame) {
  return cached('gcat|' + frame, () => {
    const b = new Buf(26, 22);
    const fur = (x, y) => ramp(['#5a5048', '#7a7068', '#9a9088', '#b8b0a6'], clamp(0.6 - (y - 8) / 20 + (x - 13) / 40 + hash2(x, y, 700) * 0.2, 0, 0.999), x, y);
    // coda
    b.ellipse(22, 8, 4, 7, (x, y) => hash2(x, y, 701) < 0.3 ? '#cfc8bc' : fur(x, y));
    // corpo e testa
    b.ellipse(12, 15, 8, 7, fur);
    b.ellipse(12, 8, 7, 6, fur);
    b.ellipse(7, 3, 2, 3, '#7a7068'); b.ellipse(17, 3, 2, 3, '#7a7068'); b.set(7, 3, '#d8a8a0'); b.set(17, 3, '#d8a8a0');
    b.ellipse(12, 11, 3, 2, '#e8e0d4'); b.set(12, 10, '#2a1a14');
    // occhiali da sole
    b.rect(6, 7, 5, 2, '#0e0e10'); b.rect(13, 7, 5, 2, '#0e0e10'); b.rect(11, 7, 2, 1, '#0e0e10'); b.set(7, 7, '#5a6a8a'); b.set(14, 7, '#5a6a8a');
    // pistolina
    b.rect(2, 14, 6, 2, '#1a1a1a'); b.rect(6, 15, 2, 3, '#1a1a1a'); b.ellipse(8, 16, 2, 2, '#a89a8a');
    if (frame === 'shoot') { b.rect(0, 13, 2, 4, '#ffe080'); b.set(0, 12, '#fff4c0'); }
    if (frame === 'hit') { b.rect(6, 7, 12, 2, '#e8e8e8'); b.line(7, 6, 10, 9, '#2a1a14'); b.line(14, 6, 17, 9, '#2a1a14'); }
    return b.canvas();
  });
}

function crisiBackground() {
  return cached('crisiBg', () => {
    const b = new Buf(W, H);
    // magazzino: muro di mattoni, finestre, pavimento
    b.rect(0, 0, W, 130, (x, y) => {
      const row = Math.floor(y / 6), off = (row & 1) * 6;
      if (y % 6 === 0 || (x + off) % 12 === 0) return '#2a2e3a';
      return ramp(['#3a4256', '#46506a', '#525e7a'], clamp(0.4 + vnoise(x / 8, y / 6, 702) * 0.5, 0, 0.999), x, y);
    });
    for (const wx of [40, 140, 240]) { b.rect(wx, 14, 40, 26, '#1a1e28'); b.rect(wx + 2, 16, 36, 22, (x, y) => ((x + y) % 7 === 0) ? '#8ab0d8' : '#4a6a9a'); b.rect(wx + 19, 16, 2, 22, '#1a1e28'); }
    b.rect(0, 130, W, 70, (x, y) => ramp(['#3a3428', '#4a4232', '#5a523e'], clamp((y - 130) / 70 + hash2(x >> 2, y >> 1, 703) * 0.2, 0, 0.999), x, y));
    // casse e barili (i ripari dei ghiri)
    const crate = (x0, y0, w, h) => {
      b.rect(x0, y0, w, h, (x, y) => ramp(['#6a4626', '#82582e', '#9a6a3a'], clamp(0.4 + vnoise(x, y / 6, 704) * 0.4, 0, 0.999), x, y));
      b.rect(x0, y0, w, 2, '#b07a40'); b.rect(x0, y0 + h - 2, w, 2, '#4a3018'); b.rect(x0, y0, 2, h, '#4a3018'); b.rect(x0 + w - 2, y0, 2, h, '#4a3018');
      b.line(x0 + 2, y0 + 2, x0 + w - 3, y0 + h - 3, '#5a3c20'); b.line(x0 + w - 3, y0 + 2, x0 + 2, y0 + h - 3, '#5a3c20');
    };
    const barrel = (x0, y0) => {
      b.rect(x0, y0, 22, 30, (x, y) => ramp(['#7a1a14', '#a8261c', '#c83a28'], clamp(0.6 - Math.abs(x - x0 - 11) / 14, 0, 0.999), x, y));
      for (const yy of [y0 + 4, y0 + 25]) b.rect(x0, yy, 22, 2, '#3a3a3a');
      b.ellipse(x0 + 11, y0, 11, 2, '#5a1410');
    };
    crate(14, 104, 44, 30); crate(110, 112, 36, 24); barrel(196, 104); crate(250, 98, 52, 36); crate(64, 70, 30, 22); barrel(168, 66);
    return b.canvas();
  });
}
// dove spuntano i ghiri: [x, y del "pavimento" del riparo]
const CRISI_SPOTS = [[36, 104], [128, 112], [207, 104], [276, 98], [79, 70], [179, 66]];

function playTempoDiCrisi(partnerId) {
  return new Promise(resolve => {
    const P = PG[partnerId] || PG.zac;
    const m = {
      t: 0, dur: 30, need: 15, hits: 0, mine: 0, partnerT: 1.5, over: null, overT: 0, marks: [],
      enemies: CRISI_SPOTS.map((s, i) => ({ x: s[0], y: s[1], st: 'hidden', k: 0, wait: 0.4 + i * 0.35 })),
      enemyRect(e) { const up = e.st === 'rising' ? e.k : e.st === 'falling' ? 1 - e.k : e.st === 'up' || e.st === 'hit' ? 1 : 0; return [e.x - 13, Math.round(e.y - 22 * up), 26, Math.round(22 * up)]; },
      hit(e, who) {
        e.st = 'hit'; e.k = 0; this.hits++; if (who === 'p1') this.mine++;
        this.marks.push({ x: e.x, y: e.y - 12, who, t: 0 });
        SFX.clack();
      },
      update(dt) {
        if (this.over) { this.overT += dt; if (this.overT > 2.2) { Game.mode = 'play'; Game.mini = null; resolve(this.over === 'win'); } return; }
        this.t += dt;
        for (const e of this.enemies) {
          e.k += dt / (e.st === 'up' ? 1.3 : e.st === 'hit' ? 0.4 : 0.2);
          if (e.st === 'hidden') { e.wait -= dt; if (e.wait <= 0) { e.st = 'rising'; e.k = 0; } continue; }
          if (e.k < 1) continue;
          e.k = 0;
          if (e.st === 'rising') e.st = 'up';
          else if (e.st === 'up' || e.st === 'hit') e.st = 'falling';
          else if (e.st === 'falling') { e.st = 'hidden'; e.wait = 0.3 + Math.random() * 1.3; }
        }
        // il compagno di squadra spara anche lui
        this.partnerT -= dt;
        if (this.partnerT <= 0) {
          const ups = this.enemies.filter(e => e.st === 'up');
          if (ups.length) this.hit(pick(ups), 'p2');
          this.partnerT = 1.6 + Math.random() * 1.2;
        }
        for (const mk of this.marks) mk.t += dt;
        this.marks = this.marks.filter(mk => mk.t < 0.8);
        if (this.hits >= this.need) { this.over = 'win'; SFX.score(); }
        else if (this.t >= this.dur) { this.over = 'lose'; SFX.thud(); }
      },
      click(mx, my) {
        if (this.over) return;
        this.marks.push({ x: mx, y: my, who: 'shot', t: 0.4 });
        for (const e of this.enemies) {
          if (e.st !== 'up' && e.st !== 'rising') continue;
          if (inRect(mx, my, this.enemyRect(e))) { this.hit(e, 'p1'); return; }
        }
      },
      renderLow() {
        const g = lctx;
        g.drawImage(crisiBackground(), 0, 0);
        // i ghiri dietro ai ripari: si disegna il ghiro, poi si ridisegna il riparo davanti
        for (const e of this.enemies) {
          if (e.st === 'hidden') continue;
          const r = this.enemyRect(e);
          if (r[3] <= 0) continue;
          const fr = e.st === 'hit' ? 'hit' : (e.st === 'up' && ((this.t * 3 + e.x) | 0) % 3 === 0) ? 'shoot' : 'idle';
          g.save(); g.beginPath(); g.rect(e.x - 14, e.y - 24, 28, 24); g.clip();
          g.drawImage(ghiroCattivoCanvas(fr), e.x - 13, r[1]);
          g.restore();
        }
        for (const mk of this.marks) {
          if (mk.who === 'shot') { g.fillStyle = '#fff4c0'; g.fillRect(Math.round(mk.x) - 1, Math.round(mk.y) - 1, 3, 3); continue; }
          g.fillStyle = mk.who === 'p1' ? hero.color : P.color;
          const x = Math.round(mk.x), y = Math.round(mk.y - mk.t * 10);
          for (let i = -3; i <= 3; i++) { g.fillRect(x + i, y + i, 1, 1); g.fillRect(x + i, y - i, 1, 1); }
        }
        // cornice della TV
        g.fillStyle = '#0e0e10'; g.fillRect(0, 0, W, 3); g.fillRect(0, H - 3, W, 3); g.fillRect(0, 0, 3, H); g.fillRect(W - 3, 0, 3, H);
        g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
        if (this.over) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 70, W, 50); }
      },
      renderText() {
        drawText('TEMPO DI CRISI', W / 2, 13, '#ff5a3a', { size: 14, ow: 3 });
        drawText('La vendetta dei ghiri', W / 2, 23, '#ffd070', { size: 8 });
        drawText(`P1 ${hero.name}`, 8, 192, hero.color, { size: 9, align: 'left' });
        drawText(`P2 ${P.name}`, W - 8, 192, P.color, { size: 9, align: 'right' });
        drawText(`Ghiri: ${this.hits}/${this.need}`, W / 2, 192, '#ffffff', { size: 10 });
        drawText(`Tempo: ${Math.max(0, Math.ceil(this.dur - this.t))}`, W - 8, 13, '#ffffff', { size: 10, align: 'right' });
        if (this.over === 'win') { drawText('MISSIONE COMPIUTA!', W / 2, 95, '#f2e01c', { size: 18, ow: 3 }); drawText(`Hai colpito ${this.mine} ghiri. ${P.name} ne ha colpiti ${this.hits - this.mine}.`, W / 2, 110, '#ffffff', { size: 9 }); }
        if (this.over === 'lose') { drawText('GAME OVER', W / 2, 95, '#ff5a3a', { size: 18, ow: 3 }); drawText('I ghiri hanno vinto. Per ora.', W / 2, 110, '#ffffff', { size: 9 }); }
        if (!this.over && this.t < 2.5) drawText(IS_TOUCH ? 'Tocca i ghiri per colpirli!' : 'Clicca sui ghiri per colpirli!', W / 2, 60, '#ffffff', { size: 11 });
      },
    };
    Game.mini = m; Game.mode = 'mini'; Game.fade = 0; Game.fadeTarget = 0;
  });
}
