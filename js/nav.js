/* ==========================================================================
   nav.js — click-to-open header dropdown (the "Roofing" menu).

   Progressive enhancement:
   • With JS (this file): the toggle BUTTON opens/closes on click. Clicking
     outside, pressing Escape, or tabbing away all close it. ARIA stays in sync.
   • Without JS: CSS falls back to :focus-within so keyboard users can still
     reach the menu. The `nav-js` class below switches off that fallback once
     JS is running, so the click-toggle is the single source of truth.

   Loaded on every page (generated + homepage). No dependencies.
   ========================================================================== */
(function () {
  document.documentElement.classList.add("nav-js");

  var dds = document.querySelectorAll("[data-nav-dd]");
  if (!dds.length) return;

  function close(dd) {
    dd.classList.remove("open");
    var btn = dd.querySelector(".nav-dd-toggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
  function closeAll(except) {
    for (var i = 0; i < dds.length; i++) {
      if (dds[i] !== except) close(dds[i]);
    }
  }

  dds.forEach(function (dd) {
    var btn = dd.querySelector(".nav-dd-toggle");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var willOpen = !dd.classList.contains("open");
      closeAll(dd);
      dd.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
    });

    // Close when focus leaves the menu entirely (keyboard users tabbing out).
    dd.addEventListener("focusout", function (e) {
      if (!dd.contains(e.relatedTarget)) close(dd);
    });
  });

  // Click anywhere outside an open menu closes it.
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-nav-dd]")) closeAll(null);
  });

  // Escape closes any open menu.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") closeAll(null);
  });
})();
