'use strict';
/* =========================================================
   AUDIO: effetti sintetizzati con WebAudio (nessun file)
   ========================================================= */
const SFX = (() => {
  let ac = null, out = null, noiseBuf = null, saw = null, musicTimer = null, ambTimer = null;
  let muted = false;
  try { muted = localStorage.getItem('baita.muted') === '1'; } catch (e) {}

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      out = ac.createGain(); out.gain.value = muted ? 0 : 0.55; out.connect(ac.destination);
      const len = ac.sampleRate;
      noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
  }
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(f, dur, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.at || 0);
    const osc = ac.createOscillator();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const g = ac.createGain();
    env(g, t, o.attack || 0.005, o.vol || 0.12, dur);
    osc.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + dur + 0.1);
  }
  function noise(dur, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.at || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.f || 1000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const g = ac.createGain();
    env(g, t, o.attack || 0.005, o.vol || 0.2, dur);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.1);
  }
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  const api = {
    init,
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('baita.muted', muted ? '1' : '0'); } catch (e) {}
      if (out) out.gain.setTargetAtTime(muted ? 0 : 0.55, ac.currentTime, 0.05);
      return muted;
    },
    step() { noise(0.06, { f: 1800 + Math.random() * 1200, q: 0.8, vol: 0.05 }); },
    pick() { tone(660, 0.06, { vol: 0.08 }); tone(990, 0.09, { vol: 0.08, at: 0.06 }); },
    score() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, { vol: 0.07, at: i * 0.08 })); },
    creak() { tone(180, 0.5, { type: 'sawtooth', to: 120, vol: 0.05 }); tone(240, 0.3, { type: 'sawtooth', to: 300, vol: 0.03, at: 0.2 }); },
    clack() { noise(0.05, { f: 2500, q: 4, vol: 0.2 }); tone(1400, 0.04, { vol: 0.05 }); },
    thud() { tone(90, 0.2, { type: 'sine', to: 50, vol: 0.25 }); noise(0.12, { f: 400, vol: 0.12 }); },
    splash() { noise(0.8, { f: 3000, to: 1200, type: 'highpass', vol: 0.12 }); },
    chirp() {
      tone(2600, 0.06, { type: 'sine', to: 3400, vol: 0.05 });
      tone(2900, 0.07, { type: 'sine', to: 2100, vol: 0.05, at: 0.09 });
    },
    magpie() { // "cra cra"
      for (let i = 0; i < 2; i++) { noise(0.09, { f: 1500, q: 2, vol: 0.18, at: i * 0.17 }); tone(700, 0.09, { type: 'sawtooth', to: 500, vol: 0.05, at: i * 0.17 }); }
    },
    gulp() { for (let i = 0; i < 4; i++) tone(200 + Math.random() * 200, 0.08, { type: 'sine', to: 600, vol: 0.12, at: i * 0.18 }); },
    pour() { noise(1.8, { f: 700, q: 1.5, vol: 0.08 }); for (let i = 0; i < 6; i++) tone(300 + Math.random() * 300, 0.06, { type: 'sine', to: 700, vol: 0.05, at: i * 0.25 }); },
    spit() { noise(0.2, { f: 2500, to: 800, vol: 0.15 }); },
    pull() { noise(0.25, { f: 800, to: 2500, q: 2, vol: 0.15 }); },
    sputter() { for (let i = 0; i < 4; i++) { tone(70, 0.07, { type: 'sawtooth', vol: 0.12, at: i * 0.11 }); noise(0.06, { f: 600, vol: 0.1, at: i * 0.11 }); } },
    sawOn() {
      if (!ac || saw) return;
      const t = ac.currentTime;
      const o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 60;
      const o2 = ac.createOscillator(); o2.type = 'square'; o2.frequency.value = 121;
      const lfo = ac.createOscillator(); lfo.frequency.value = 26;
      const lg = ac.createGain(); lg.gain.value = 0.35;
      const amp = ac.createGain(); amp.gain.value = 0.6;
      lfo.connect(lg); lg.connect(amp.gain);
      const filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 900;
      const vol = ac.createGain();
      vol.gain.setValueAtTime(0.0001, t); vol.gain.exponentialRampToValueAtTime(0.11, t + 0.15);
      o1.connect(amp); o2.connect(amp); amp.connect(filt); filt.connect(vol); vol.connect(out);
      o1.start(); o2.start(); lfo.start();
      saw = { o1, o2, lfo, filt, vol };
    },
    sawRev(r) {
      if (!saw) return;
      const t = ac.currentTime, f = 60 + r * 80;
      saw.o1.frequency.setTargetAtTime(f, t, 0.08);
      saw.o2.frequency.setTargetAtTime(f * 2.02, t, 0.08);
      saw.lfo.frequency.setTargetAtTime(26 + r * 40, t, 0.08);
      saw.filt.frequency.setTargetAtTime(900 + r * 1800, t, 0.08);
      saw.vol.gain.setTargetAtTime(0.11 + r * 0.06, t, 0.08);
    },
    sawOff() {
      if (!saw) return;
      const s = saw; saw = null;
      s.vol.gain.setTargetAtTime(0.0001, ac.currentTime, 0.12);
      s.o1.frequency.setTargetAtTime(30, ac.currentTime, 0.2);
      setTimeout(() => { [s.o1, s.o2, s.lfo].forEach(o => { try { o.stop(); } catch (e) {} }); }, 700);
    },
    // inno della rimpatriata: marcia marziale originale in 4/4 (re minore),
    // grancassa, rullante e ottoni a 8 bit; nella seconda metà entra il coro
    music(on) {
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      if (!on || !ac) return;
      const beat = 0.28;
      // [nota MIDI, durata in battiti]; 0 = pausa. 16 battute da 4.
      const mel = [
        [62, .75], [62, .25], [69, 1], [69, .75], [67, .25], [65, 1],
        [67, 1], [69, 1], [70, 1.5], [69, .5],
        [69, .75], [69, .25], [74, 1], [72, .75], [70, .25], [69, 1],
        [67, 1], [64, .5], [65, .5], [67, 2],
        [62, .75], [62, .25], [69, 1], [69, .75], [70, .25], [72, 1],
        [74, 1.5], [72, .5], [70, 1], [69, 1],
        [67, .75], [69, .25], [70, 1], [69, .75], [67, .25], [64, 1],
        [62, 3], [0, 1],
        [65, .75], [65, .25], [72, 1], [72, .75], [70, .25], [69, 1],
        [70, 1], [72, 1], [74, 2],
        [72, .75], [72, .25], [77, 1], [76, .75], [74, .25], [72, 1],
        [70, 1], [69, 1], [67, 2],
        [69, .75], [69, .25], [74, 1], [74, .75], [76, .25], [77, 1],
        [76, 1], [74, 1], [72, 1], [69, 1],
        [70, .75], [69, .25], [67, 1], [64, 1], [69, 1],
        [62, 1], [74, .5], [74, .5], [74, 1], [0, 1],
      ];
      const roots = [38, 43, 38, 48, 38, 46, 43, 38, 41, 46, 41, 48, 38, 45, 43, 38];
      const third = r => (r % 12 === 2 || r % 12 === 7) ? 3 : 4; // re e sol minori, il resto maggiore
      const play = () => {
        if (!ac) return;
        let t = 0;
        for (const [n, d] of mel) {
          if (n) {
            tone(midi(n), d * beat * 0.92, { vol: 0.04, at: t, attack: 0.012 });                       // tromba
            tone(midi(n - 12), d * beat * 0.92, { type: 'triangle', vol: 0.05, at: t, attack: 0.02 }); // corno, un'ottava sotto
          }
          t += d * beat;
        }
        roots.forEach((r, bar) => {
          const bt = bar * 4 * beat;
          for (let k = 0; k < 4; k++) {
            const at = bt + k * beat;
            if (k % 2 === 0) {
              tone(midi(r), beat * 0.9, { type: 'triangle', vol: 0.13, at });     // basso
              tone(150, 0.14, { type: 'sine', to: 45, vol: 0.2, at });            // grancassa
            } else {
              [0, third(r), 7].forEach(iv => tone(midi(r + 12 + iv), beat * 0.35, { type: 'square', vol: 0.016, at })); // accordo
              noise(0.09, { f: 2400, q: 0.8, vol: 0.07, at });                     // rullante
            }
            noise(0.03, { f: 6000, type: 'highpass', vol: 0.015, at: at + beat / 2 });
          }
          if (bar >= 8) [0, third(r), 7].forEach(iv => tone(midi(r + 24 + iv), beat * 3.6, { type: 'triangle', vol: 0.014, at: bt, attack: 0.25 })); // coro
          if (bar === 7 || bar === 15) for (let i = 0; i < 6; i++) noise(0.05, { f: 2600, q: 0.8, vol: 0.03 + i * 0.01, at: bt + 3 * beat + i * beat / 6 }); // rullata
        });
      };
      play();
      musicTimer = setInterval(play, 64 * beat * 1000);
    },
    ambient(on) {
      if (ambTimer) { clearTimeout(ambTimer); ambTimer = null; }
      if (!on) return;
      const loop = () => {
        if (ac && Math.random() < 0.8) {
          const n = 1 + (Math.random() * 3 | 0), base = 2200 + Math.random() * 1500;
          for (let i = 0; i < n; i++) tone(base, 0.05, { type: 'sine', to: base * (1.2 + Math.random() * 0.4), vol: 0.02, at: i * 0.11 });
        }
        ambTimer = setTimeout(loop, 3000 + Math.random() * 6000);
      };
      ambTimer = setTimeout(loop, 2000);
    },
  };
  return api;
})();
