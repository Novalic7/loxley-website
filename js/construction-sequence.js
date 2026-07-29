/* ==========================================================================
   Loxley — whole-house construction sequence scroller (moved from the homepage
   16-stage "Anatomy of a Better Build"; belongs on /construction). Self-contained,
   image-based sticky scroll-through. Reuses the roof section's CSS classes.
   The images are rendered ILLUSTRATIONS of the build process (educational) — not
   presented as a specific completed project. No WebGL. Reduced-motion friendly.
   ========================================================================== */
(function () {
  "use strict";

  var section = document.querySelector("[data-construction]");
  var stage = document.querySelector("[data-construction-stage]");
  var fill = document.querySelector("[data-construction-fill]");
  var numEl = document.querySelector("[data-construction-num]");
  var titleEl = document.querySelector("[data-construction-title]");
  var subEl = document.querySelector("[data-construction-sub]");
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-cfb]"));
  if (!section || !stage || !slides.length) return;

  var STAGES = [
    { title: "Site Preparation",     sub: "Grading, access, drainage and layout establish the conditions for everything that follows." },
    { title: "Foundation",           sub: "Footings, foundation walls, waterproofing and drainage form a dependable base." },
    { title: "Floor System",         sub: "Engineered joists, beams and subfloor create a solid, level platform." },
    { title: "Wall Framing",         sub: "Walls, openings, headers and load paths take shape with deliberate sequencing." },
    { title: "Roof Framing",         sub: "Trusses, hips and valleys build the geometry that carries the roofing system." },
    { title: "Roofing System",       sub: "Deck, underlayment, flashing, shingles and ventilation — the home's weather barrier." },
    { title: "Exterior Envelope",    sub: "Windows, brick and siding close in the shell against Missouri weather." },
    { title: "Mechanical Rough-In",  sub: "Plumbing, electrical and HVAC are run and inspected before they're covered." },
    { title: "Insulation & Drywall", sub: "Insulation and drywall wrap the interior for comfort and efficiency." },
    { title: "Interior Finishes",    sub: "Cabinetry, stone, flooring and trim bring the finished home together." }
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
