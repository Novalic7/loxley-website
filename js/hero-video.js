/* ==========================================================================
   hero-video.js — make muted hero background videos reliably autoplay on
   mobile. iOS/Android and in-app webviews often ignore the `autoplay`/`muted`
   ATTRIBUTES, so the poster shows with a play marker and nothing moves.

   Fixes, in order of how often they matter:
   1. Force `muted` / `playsInline` as PROPERTIES (the attribute alone is a
      known WebKit quirk) and call play() — this alone fixes most phones.
   2. Retry play() on canplay/loadeddata (buffering/timing races).
   3. If the browser still blocked it (Low Power Mode, data saver, some in-app
      webviews — where truly-automatic playback isn't permitted), start on the
      visitor's first interaction, one time.

   Reduced-motion users keep the static poster (CSS hides the video for them).
   Loaded only on pages that have a hero video (see layout() in build.mjs).
   ========================================================================== */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var vids = document.querySelectorAll(".page-hero-video");
  if (!vids.length) return;

  function tryPlay(v) {
    // Properties, not just attributes — iOS requires the muted PROPERTY to be
    // true at play() time for inline autoplay to be allowed.
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    var p;
    try { p = v.play(); } catch (e) { return; }
    if (p && typeof p.catch === "function") p.catch(function () {});
  }

  vids.forEach(function (v) {
    tryPlay(v);
    v.addEventListener("loadeddata", function () { tryPlay(v); });
    v.addEventListener("canplay", function () { tryPlay(v); });
  });

  // Fallback: if autoplay was blocked, the first user gesture unblocks it.
  var kicked = false;
  function kick() {
    if (kicked) return;
    kicked = true;
    vids.forEach(tryPlay);
  }
  ["touchstart", "pointerdown", "click", "scroll", "keydown"].forEach(function (evt) {
    window.addEventListener(evt, kick, { once: true, passive: true });
  });
})();
