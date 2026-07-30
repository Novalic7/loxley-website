/* ==========================================================================
   Loxley — "The Anatomy of a Better Build" (About page).

   The site's signature walkthrough: sixteen stages from bare site to finished
   roofline, each with a plain-English note on WHY that layer matters. This is
   the brand thesis — we build (and roof) as one complete system.

   Self-contained, image-based sticky scroll-through in the same lightweight
   style as the roofing-systems and construction scrollers (reuses the .roof
   CSS). No WebGL, no dependencies, reduced-motion friendly. The images are
   rendered ILLUSTRATIONS of the process — not presented as a specific project.
   ========================================================================== */
(function () {
  "use strict";

  var section = document.querySelector("[data-abb]");
  var stage = document.querySelector("[data-abb-stage]");
  var fill = document.querySelector("[data-abb-fill]");
  var numEl = document.querySelector("[data-abb-num]");
  var titleEl = document.querySelector("[data-abb-title]");
  var subEl = document.querySelector("[data-abb-sub]");
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-abb-fb]"));
  if (!section || !stage || !slides.length) return;

  var STAGES = [
    { title: "Site Preparation",     sub: "Grading, access and drainage are set first — a dry, stable site is what every later stage depends on." },
    { title: "Foundation",           sub: "Footings, walls, waterproofing and drainage form a base that carries the structure without settling or seepage." },
    { title: "Floor System",         sub: "Engineered joists, beams and subfloor create a level, dependable platform to build on." },
    { title: "Wall Framing",         sub: "Walls, openings and load paths are framed in sequence so every force has a clear route to the foundation." },
    { title: "Roof Framing",         sub: "Trusses, hips and valleys build the geometry that will carry — and shed water from — the roofing system." },
    { title: "Roof Decking",         sub: "A sound, properly fastened deck is the surface the whole roof relies on; we inspect it before anything covers it." },
    { title: "Underlayment",         sub: "Ice-and-water shield and synthetic underlayment are the waterproofing layer if wind ever drives water past the shingles." },
    { title: "Flashing Details",     sub: "Drip edge, valley and penetration flashing seal the transitions where the large majority of roof leaks actually start." },
    { title: "Shingles",             sub: "Architectural field shingles go over a sealed, flashed surface — the visible layer doing its job because of everything beneath it." },
    { title: "Ridge & Ventilation",  sub: "Balanced ridge intake and exhaust let heat and moisture leave the attic — the difference between a roof that lasts and one that ages early." },
    { title: "Exterior Envelope",    sub: "Windows, brick and siding close in the shell, tying the roof's water management into the walls below." },
    { title: "Mechanical Rough-In",  sub: "Plumbing, electrical and HVAC are run and inspected while everything is open — never buried behind drywall unchecked." },
    { title: "Insulation & Drywall", sub: "Insulation and drywall wrap the interior for comfort and efficiency, sealing in the work behind them." },
    { title: "Interior Finishes",    sub: "Cabinetry, stone, flooring and trim finish the space to the same standard as the structure." },
    { title: "Quality Inspection",   sub: "A documented final inspection verifies the work against the plan — the record that backs the warranty and any claim." },
    { title: "Roofline Detail",      sub: "The finished roofline: clean lines, sealed edges and balanced ventilation — a complete system, not just a surface." }
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
