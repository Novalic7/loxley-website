/* ==========================================================================
   Loxley — "A roof, installed" seven-stage roofing scroller (Phase 3).
   Self-contained, image-based, sticky scroll-through aimed at the actual
   customer: a roof going onto a house that already exists. Reuses the roof
   section's CSS classes. No WebGL. Reduced-motion friendly (images just swap).
   ========================================================================== */
(function () {
  "use strict";

  var section = document.querySelector("[data-systems]");
  var stage = document.querySelector("[data-systems-stage]");
  var fill = document.querySelector("[data-systems-fill]");
  var numEl = document.querySelector("[data-systems-num]");
  var titleEl = document.querySelector("[data-systems-title]");
  var subEl = document.querySelector("[data-systems-sub]");
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-sfb]"));
  if (!section || !stage || !slides.length) return;

  var STAGES = [
    { title: "Inspection & Documentation", sub: "We photograph and document the existing roof — the record that guides the work and backs any insurance claim." },
    { title: "Tear-off & Deck Inspection", sub: "The old roof comes off and we inspect the deck for rot or damage before anything new goes down." },
    { title: "Ice & Water Shield + Underlayment", sub: "Self-adhered membrane seals the eaves and valleys; synthetic underlayment covers the field." },
    { title: "Drip Edge & Starter", sub: "Metal drip edge at the perimeter and a sealed starter course lock down the first row." },
    { title: "Field Shingles & Flashing", sub: "Architectural shingles climb eave to ridge; step, valley and penetration flashing keep water out." },
    { title: "Ridge Vent & Caps", sub: "Continuous exhaust ventilation, capped with matching ridge shingles." },
    { title: "Final Inspection & Cleanup", sub: "Every seam and fastener checked, the site magnet-swept, and your workmanship warranty registered." }
  ];
  var N = STAGES.length;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function progress() {
    var r = section.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  }

  function loadSlide(i) {
    var el = slides[i]; if (!el) return;
    var img = el.querySelector("img[data-src]");
    if (img) { img.src = img.dataset.src; delete img.dataset.src; }
  }
  var warmed = false;
  function warm() {
    if (warmed) return;
    var r = section.getBoundingClientRect();
    if (r.top < window.innerHeight * 1.6 && r.bottom > -window.innerHeight) {
      warmed = true;
      slides.forEach(function (_, i) { loadSlide(i); });
    }
  }

  var last = -1;
  function render(p) {
    if (fill) fill.style.transform = "scaleX(" + clamp(p) + ")";
    var idx = Math.min(N - 1, Math.floor(p * N));
    if (idx === last) return;
    last = idx;
    slides.forEach(function (el, i) { el.style.opacity = i === idx ? "1" : "0"; });
    var s = STAGES[idx];
    if (numEl) numEl.textContent = "Stage " + (idx + 1) + " / " + N;
    if (titleEl) titleEl.textContent = s.title;
    if (subEl) subEl.textContent = s.sub;
  }

  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = null; warm(); render(progress()); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  loadSlide(0);
  render(progress());
  onScroll();
})();
