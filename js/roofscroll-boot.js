/* ==========================================================================
   Loxley Roofing and Construction — "The roof, scrolled on" (simplified)

   A high-quality static-image scroll-through. As the visitor scrolls the tall
   sticky section, the roofing system is shown one clear step at a time using
   the real construction photographs, with the phase label, materials legend
   and progress bar updating in step. No WebGL — crisp, fast and reliable on
   any device. Respects reduced-motion (the browser handles the scroll itself;
   images simply swap).
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var section = document.querySelector("[data-roof]");
  var stage = document.querySelector("[data-roof-stage]");
  var fill = document.querySelector("[data-roof-fill]");
  var num = document.querySelector("[data-roof-num]");
  var titleEl = document.querySelector("[data-roof-title]");
  var subEl = document.querySelector("[data-roof-sub]");
  var legendItems = Array.prototype.slice.call(document.querySelectorAll("[data-lg]"));
  var replay = document.querySelector("[data-roof-replay]");
  var fallback = document.querySelector("[data-roof-fallback]");
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-fb]"));
  if (!section || !stage || !fallback || !slides.length) return;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function sectionProgress() {
    var r = section.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  }

  /* The 10 labelled phases. `fb` selects which photograph is shown; `mat`
     highlights the active materials-legend row. Several phases share one
     photograph while the label refines the detail being pointed out. */
  var PHASES = [
    { t: 0.00, fb: 0, mat: 0, num: "01 / 10", title: "Bare Trusses",             sub: "The engineered skeleton — ridges, hips and valleys." },
    { t: 0.12, fb: 1, mat: 1, num: "02 / 10", title: "Roof-Deck Sheathing",      sub: "Structural panels nailed over the trusses in a staggered pattern." },
    { t: 0.24, fb: 2, mat: 2, num: "03 / 10", title: "Ice & Water Shield",       sub: "Self-adhered membrane sealing the eaves and valleys." },
    { t: 0.34, fb: 2, mat: 2, num: "04 / 10", title: "Underlayment + Drip Edge", sub: "Synthetic underlayment over the field, drip edge at the perimeter." },
    { t: 0.44, fb: 3, mat: 3, num: "05 / 10", title: "Flashing",                 sub: "Step, kickout and valley flashing integrating roof to wall." },
    { t: 0.54, fb: 4, mat: 4, num: "06 / 10", title: "Starter Strip",            sub: "Sealed starter course locking down the first row." },
    { t: 0.62, fb: 4, mat: 4, num: "07 / 10", title: "Architectural Shingles",   sub: "Charcoal dimensional shingles climbing eave to ridge." },
    { t: 0.74, fb: 5, mat: 4, num: "08 / 10", title: "Ridge Vent + Caps",        sub: "Continuous exhaust venting, capped with matching ridge shingles." },
    { t: 0.84, fb: 5, mat: 4, num: "09 / 10", title: "Standing-Seam Porch Roof", sub: "Black metal roofing over the covered entry." },
    { t: 0.93, fb: 6, mat: 4, num: "10 / 10", title: "Final Seal & Inspection",  sub: "Every seam, fastener and penetration checked — sealed and warrantied." }
  ];

  function phaseIndex(p) { var i = 0; for (var k = 0; k < PHASES.length; k++) if (p >= PHASES[k].t) i = k; return i; }

  /* ---------- image loading ---------- */
  function loadSlide(idx) {
    var el = slides[idx];
    if (!el) return;
    var img = el.querySelector("img[data-src]");
    if (img) { img.src = img.dataset.src; delete img.dataset.src; }
  }
  function loadAll() { slides.forEach(function (_, i) { loadSlide(i); }); }

  // Reveal the fallback stack (it starts hidden so no photos load off-screen).
  fallback.hidden = false;
  // Images load only as the section approaches (see warm()), so this section —
  // far below the fold on the homepage — never weighs down the initial paint.

  // Warm the rest once the section is genuinely approaching.
  var warmed = false;
  function warm() {
    if (warmed) return;
    var r = section.getBoundingClientRect();
    if (r.top < window.innerHeight * 1.6 && r.bottom > -window.innerHeight) {
      warmed = true;
      loadAll();
    }
  }

  /* ---------- chrome + active image ---------- */
  var lastPhase = -1;
  function showSlide(fb) {
    slides.forEach(function (el) {
      el.style.opacity = (String(fb) === el.getAttribute("data-fb")) ? "1" : "0";
    });
  }
  function updateChrome(p) {
    if (fill) fill.style.transform = "scaleX(" + clamp(p) + ")";
    var idx = phaseIndex(p);
    if (idx === lastPhase) return;
    lastPhase = idx;
    var ph = PHASES[idx];
    if (num) num.textContent = "Phase " + ph.num;
    if (titleEl) titleEl.textContent = ph.title;
    if (subEl) subEl.textContent = ph.sub;
    legendItems.forEach(function (el, i) { el.classList.toggle("is-active", i === ph.mat); });
    showSlide(ph.fb);
  }

  /* ---------- scroll loop ---------- */
  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      warm();
      updateChrome(sectionProgress());
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  if (replay) replay.addEventListener("click", function () {
    var top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + 2, behavior: reduced.matches ? "auto" : "smooth" });
  });

  // Paint the initial state.
  updateChrome(sectionProgress());
  onScroll();
})();
