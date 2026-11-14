'use strict';
/* =========================================================
   AVVIO
   ========================================================= */
(function boot() {
  portraitImg = new Image();
  portraitImg.src = window.PORTRAIT_SRC;
  fotoFinaleImg = new Image();
  fotoFinaleImg.src = window.FOTO_FINALE_SRC;
  const start = () => {
    ROOM_PARCHEGGIO.init();
    Game.hasSave = !!loadSave();
    Game.mode = 'title'; Game.fade = 1; Game.fadeTarget = 0;
  };
  // aspetta il font pixel (max 2.5 s), poi parte comunque
  const fontReady = document.fonts && document.fonts.load ? Promise.race([document.fonts.load('10px "VT323"'), sleep(2500)]) : Promise.resolve();
  requestAnimationFrame(frame);
  fontReady.then(() => setTimeout(start, 30)).catch(start);
})();
