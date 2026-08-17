/* ==========================================================================
   nav.js — header navigation behavior. Loaded on EVERY page (generated pages
   + the hand-built homepage), so it is the single source of truth for both:

   1. The desktop "Services" dropdown (click to open/close).
   2. The mobile drawer (hamburger → full-screen menu).

   Progressive enhancement for the dropdown:
   • With JS: the toggle BUTTON opens/closes on click. Clicking outside,
     pressing Escape, or tabbing away all close it. ARIA stays in sync.
   • Without JS: CSS falls back to :focus-within. The `nav-js` class below
     switches off that fallback once JS runs, so the click-toggle is authoritative.

   No dependencies.
   ========================================================================== */
(function () {
  document.documentElement.classList.add("nav-js");

  /* ------------------------------------------------------------------ */
  /* 1. Desktop "Services" dropdown                                      */
  /* ------------------------------------------------------------------ */
  var dds = document.querySelectorAll("[data-nav-dd]");

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

  /* ------------------------------------------------------------------ */
  /* 2. Mobile drawer (hamburger)                                        */
  /* ------------------------------------------------------------------ */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    var drawerLinks = mobileNav.querySelectorAll("a");
    // Stagger index for the entrance animation.
    drawerLinks.forEach(function (a, i) { a.style.setProperty("--i", i); });

    var setDrawer = function (open) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.classList.toggle("is-open", open);
      mobileNav.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var first = mobileNav.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      }
    };

    navToggle.addEventListener("click", function () {
      setDrawer(navToggle.getAttribute("aria-expanded") !== "true");
    });
    drawerLinks.forEach(function (a) {
      a.addEventListener("click", function () { setDrawer(false); });
    });

    // Basic focus containment while the drawer is open.
    document.addEventListener("focusin", function (e) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (!mobileNav.contains(e.target) && e.target !== navToggle) {
        var first = mobileNav.querySelector("a");
        if (first) first.focus();
      }
    });

    // Expose so the shared Escape handler below can reach it.
    window.__loxleyCloseDrawer = function () {
      if (mobileNav.classList.contains("is-open")) {
        setDrawer(false);
        navToggle.focus();
      }
    };
  }

  // Escape closes any open dropdown and the drawer.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
      closeAll(null);
      if (window.__loxleyCloseDrawer) window.__loxleyCloseDrawer();
    }
  });
})();
