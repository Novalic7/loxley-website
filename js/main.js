/* ==========================================================================
   Loxley Roofing and Construction — interaction engine
   Zero-dependency scroll-scrub sequencer, staged image loading,
   progress UI, navigation, reveals, layer diagram, contact form.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Site configuration — fill these in when the business lines go live.
     If phone is empty, "Call Our Team" routes to the contact section.
     If formEndpoint is empty, the form falls back to an email hand-off
     (no fake CRM success is ever shown).
  ------------------------------------------------------------------ */
  var CONFIG = {
    phone: "+13149066915",           // click-to-call target (E.164)
    phoneDisplay: "(314) 906-6915",  // human-readable
    email: "nova@theloxleycorp.com", // inspection request inbox
    formEndpoint: "https://api.web3forms.com/submit", // Web3Forms (access_key is a hidden form field)
    stormMode: false,                // set true after a hail event to promote the storm band
    season: "default"                // "default" | "storm" | "holiday" | "hvac" | "winter"
  };

  // Promote the storm-damage band the moment a hail event hits (flip stormMode).
  if (CONFIG.stormMode) {
    var stormBand = document.querySelector("[data-storm-band]");
    if (stormBand) stormBand.classList.add("is-active");
  }

  /* Seasonal hero rotation. The default hero (keyword H1) stays in the HTML for
     SEO; flipping CONFIG.season swaps the hero copy + primary CTA four times a
     year without touching markup. Spring = storm, summer = hvac, fall = holiday,
     winter = ice dams. */
  var HERO_VARIANTS = {
    storm:   { eyebrow: "Storm Response · St. Louis Metro",     headline: "Storm-Damaged Roof in St. Louis?",           tagline: "Free, documented inspection — before you file a claim.",         ctaText: "Free Storm Inspection",   ctaHref: "/roofing/storm-damage/" },
    holiday: { eyebrow: "Loxley Holiday Lighting · St. Louis",   headline: "Holiday Lighting, Installed by Roofers",      tagline: "We warranty your roof. Let us light your home for the holidays.", ctaText: "Book Holiday Lighting",   ctaHref: "/holiday-lighting/" },
    hvac:    { eyebrow: "Home Services · St. Louis Metro",       headline: "More of Your Home, One Trusted Team",         tagline: "Roofing today — HVAC, plumbing and electrical coming soon.",      ctaText: "See What's Coming",       ctaHref: "/home-services/" },
    winter:  { eyebrow: "Winter Roof Protection · St. Louis",    headline: "Ice Dams & Winter Roof Damage in St. Louis",  tagline: "Protect your roof before the freeze — free inspection.",          ctaText: "Free Winter Inspection",  ctaHref: "/contact/" }
  };
  var seasonVariant = HERO_VARIANTS[CONFIG.season];
  if (seasonVariant) {
    var vEb = document.querySelector(".hero-eyebrow");
    var vHl = document.querySelector(".hero-headline");
    var vTg = document.querySelector(".hero-tagline");
    var vCta = document.querySelector(".hero-ctas .btn-solid");
    if (vEb) vEb.textContent = seasonVariant.eyebrow;
    if (vHl) vHl.textContent = seasonVariant.headline;
    if (vTg) vTg.textContent = seasonVariant.tagline;
    if (vCta) { vCta.textContent = seasonVariant.ctaText; vCta.setAttribute("href", seasonVariant.ctaHref); }
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = function () { return reducedMotion.matches; };

  /* ==================================================================
     Header: transparent over hero -> solid after scroll begins
  ================================================================== */
  var header = document.querySelector("[data-header]");
  var lastScrolled = null;
  function updateHeader() {
    var scrolled = window.scrollY > 24;
    if (scrolled !== lastScrolled) {
      header.classList.toggle("is-scrolled", scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ==================================================================
     Mobile navigation drawer — handled site-wide in js/nav.js (loaded on
     every page). Kept there as the single source of truth so generated
     service pages get the same drawer behavior as the homepage.
  ================================================================== */

  /* ==================================================================
     Active nav link highlighting
  ================================================================== */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-navlink]"));
  var sectionsForNav = navLinks
    .map(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var match = sectionsForNav.find(function (s) { return s.el === entry.target; });
      if (!match) return;
      navLinks.forEach(function (a) { a.classList.remove("is-active"); });
      match.link.classList.add("is-active");
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sectionsForNav.forEach(function (s) { navObserver.observe(s.el); });

  /* ==================================================================
     Generic reveal-on-scroll
  ================================================================== */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal], [data-reveal-group]")
  );
  revealEls.forEach(function (el) {
    if (el.hasAttribute("data-reveal-group")) {
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.setProperty("--rd", (i * 0.09) + "s");
      });
    }
  });

  // Reveal anything in OR above the viewport. Because it scans absolute rects,
  // landing at any scroll offset (hash jump, End key, refresh mid-page, scroll
  // restoration, fast fling) reveals the current view and everything before it —
  // there is no reliance on an element having crossed an intersection threshold.
  var revealPending = revealEls.slice();
  function scanReveal() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    for (var i = revealPending.length - 1; i >= 0; i--) {
      if (revealPending[i].getBoundingClientRect().top < vh * 0.92) {
        revealPending[i].classList.add("is-revealed");
        revealPending.splice(i, 1);
      }
    }
  }
  var revealTick = false;
  function requestScanReveal() {
    if (revealTick) return;
    revealTick = true;
    requestAnimationFrame(function () { revealTick = false; scanReveal(); });
  }
  window.addEventListener("scroll", requestScanReveal, { passive: true });
  window.addEventListener("resize", requestScanReveal, { passive: true });
  window.addEventListener("hashchange", function () { requestAnimationFrame(scanReveal); });
  scanReveal(); // resolve the initial viewport (incl. any hash target) immediately

  // Direct /#section loads: the native hash jump fires before dynamic section
  // heights (the scene track, sticky scrollers) are set, so it lands on a stale
  // offset. Re-assert the target once layout has settled, then reveal it — the
  // section is shown in its final state without waiting for a scroll event.
  function revealWithin(el) {
    if (el.hasAttribute("data-reveal") || el.hasAttribute("data-reveal-group")) {
      el.classList.add("is-revealed");
    }
    var inside = el.querySelectorAll("[data-reveal], [data-reveal-group]");
    Array.prototype.forEach.call(inside, function (n) { n.classList.add("is-revealed"); });
  }
  function resolveHashTarget() {
    var h = location.hash;
    if (!h || h.length < 2) return;
    var el;
    try { el = document.querySelector(h); } catch (e) { return; }
    if (!el) return;
    // Reveal the whole target section up front — the visitor asked for it —
    // then land on it instantly (bypassing the smooth-scroll animation).
    revealWithin(el);
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "start" });
    root.style.scrollBehavior = prev;
    scanReveal();
  }
  // Don't let the browser's scroll restoration fight a direct /#section load.
  if (location.hash && location.hash.length > 1 && "scrollRestoration" in history) {
    try { history.scrollRestoration = "manual"; } catch (e) {}
  }
  window.addEventListener("load", function () {
    scanReveal();
    resolveHashTarget();
    // Re-assert after late layout (fonts, dynamic scroller heights) settles.
    [60, 200, 500].forEach(function (t) { setTimeout(function () { resolveHashTarget(); scanReveal(); }, t); });
  });
  window.addEventListener("hashchange", resolveHashTarget);

  /* ==================================================================
     Deferred image loading for sections outside the scene engine
     (completion, quality, finale) — swap data-src -> src near viewport.
  ================================================================== */
  var lazyImgs = document.querySelectorAll("img[data-src]:not([data-scene-managed])");
  var sceneImgs = document.querySelectorAll(".scene-media img");
  sceneImgs.forEach(function (img) { img.setAttribute("data-scene-managed", "1"); });

  var lazyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      lazyObserver.unobserve(img);
    });
  }, { rootMargin: "120% 0px" });
  document.querySelectorAll("img[data-src]").forEach(function (img) {
    if (!img.hasAttribute("data-scene-managed")) lazyObserver.observe(img);
  });

  /* ==================================================================
     Hero: slow settle + gentle scroll-linked drift
  ================================================================== */
  var heroMedia = document.querySelector("[data-hero-media]");
  var hero = document.querySelector(".hero");
  if (heroMedia && !prefersReduced()) {
    heroMedia.classList.add("is-settling");
    heroMedia.addEventListener("animationend", function () {
      heroMedia.classList.remove("is-settling");
    }, { once: true });
  }

  /* ==================================================================
     THE ANATOMY OF A BETTER BUILD — scroll-scrub scene engine
  ================================================================== */
  var SCENES = [
    { title: "Site Preparation" },
    { title: "Foundation" },
    { title: "Floor System" },
    { title: "Wall Framing" },
    { title: "Roof Framing" },
    { title: "Roof Decking" },
    { title: "Underlayment" },
    { title: "Flashing Details" },
    { title: "Shingles" },
    { title: "Ridge & Ventilation" },
    { title: "Exterior Envelope" },
    { title: "Mechanical Rough-In" },
    { title: "Insulation & Drywall" },
    { title: "Interior Finishes" },
    { title: "Quality Inspection" },
    { title: "Roofline Detail" }
  ];
  var SCENE_COUNT = SCENES.length;

  var track = document.querySelector("[data-anatomy-track]");
  var stage = document.querySelector("[data-anatomy-stage]");
  var mediaEls = Array.prototype.slice.call(document.querySelectorAll("[data-scene-media]"));
  var copyEls = Array.prototype.slice.call(document.querySelectorAll("[data-scene-copy]"));
  var railNum = document.querySelector("[data-rail-num]");
  var railFill = document.querySelector("[data-rail-fill]");
  var railPhase = document.querySelector("[data-rail-phase]");
  var mobileFill = document.querySelector("[data-mobile-fill]");

  /* ------------------------------------------------------------------
     Optional WebGL layer. Loaded as a module so a parse error or a
     missing WebGL context can never break the photographic experience.
  ------------------------------------------------------------------ */
  var stage3d = null;
  var stage3dEl = document.querySelector("[data-stage-3d]");
  var stageCanvas = document.querySelector("[data-stage-canvas]");
  var stageHint = document.querySelector("[data-stage-hint]");

  // Dynamic import() inside a classic script resolves against the document
  // base URL, not this file's URL — so derive the path from our own <script>.
  function moduleUrl(file) {
    var self = document.currentScript;
    if (!self) {
      var all = document.querySelectorAll('script[src*="main.js"]');
      self = all[all.length - 1];
    }
    if (self && self.src) return new URL(file, self.src).href;
    return "js/" + file;
  }
  var STAGE3D_URL = moduleUrl("stage3d.js");

  function init3D() {
    if (prefersReduced() || !stage3dEl || !stageCanvas) return;
    if (!window.WebGL2RenderingContext && !window.WebGLRenderingContext) return;
    import(STAGE3D_URL).then(function (mod) {
      stage3d = mod.initStage3D({
        canvas: stageCanvas,
        stage: stage,
        onReady: function () { lastP = -1; renderScenes(); }
      });
      if (!stage3d) return;
      if (stageHint) stageHint.hidden = false;
      stage3d.preloadAround(0);
      lastP = -1;
      renderScenes();
    }).catch(function () { stage3d = null; });
  }

  var loadedUpTo = -1;
  function ensureLoaded(upToIndex) {
    upToIndex = Math.min(upToIndex, SCENE_COUNT - 1);
    while (loadedUpTo < upToIndex) {
      loadedUpTo++;
      var img = mediaEls[loadedUpTo].querySelector("img");
      if (img && img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    }
  }
  // Warm the first scenes only as the section approaches — NOT on initial page
  // load — so the hero stays the sole heavy image competing for the first paint.
  var warmupObserver = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) {
      ensureLoaded(2);
      warmupObserver.disconnect();
    }
  }, { rootMargin: "25% 0px" });
  if (track) warmupObserver.observe(track);

  function setTrackHeight() {
    if (!track) return; // anatomy section removed from this page
    var vh = window.innerHeight;
    if (!vh) return; // keep the CSS fallback until the viewport is measurable
    var perScene = vh * (window.innerWidth <= 760 ? 0.72 : 0.88);
    track.style.height = Math.round(SCENE_COUNT * perScene + vh) + "px";
  }
  setTrackHeight();

  var activeIndex = -1;
  var lastP = -1;

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

  function setActiveCopy(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    copyEls.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
    if (railNum) {
      railNum.textContent = String(index + 2).padStart(2, "0");
      railPhase.textContent = SCENES[index].title;
    }
  }

  function renderScenes() {
    if (!track) return; // anatomy section removed from this page
    var vh = window.innerHeight;
    var rect = track.getBoundingClientRect();
    var total = rect.height - vh;
    var p = clamp(-rect.top / total, 0, 1);
    if (p === lastP) return;
    lastP = p;

    var pos = p * SCENE_COUNT;                 // 0 .. SCENE_COUNT
    var index = clamp(Math.floor(pos), 0, SCENE_COUNT - 1);
    var local = pos - index;                   // 0 .. 1 within scene

    ensureLoaded(index + 2);
    setActiveCopy(index);

    // Hand the scroll position to the 3D stage. It reports back whether this
    // chapter is rendering a model, which decides who owns the viewport.
    var showing3D = false;
    if (stage3d) showing3D = stage3d.update(index, local);
    if (stage3dEl) {
      stage3dEl.classList.toggle("is-live", showing3D);
      stage3dEl.setAttribute("aria-hidden", String(!showing3D));
      stage.classList.toggle("has-3d", showing3D);
    }

    // progress UI
    var progressCss = String(clamp(p, 0, 1));
    if (railFill) railFill.style.setProperty("--p", progressCss);
    if (mobileFill) mobileFill.style.setProperty("--p", progressCss);

    var fadeSpan = 0.22; // portion of a scene used for the crossfade into the next
    var reduce = prefersReduced();

    for (var i = 0; i < SCENE_COUNT; i++) {
      var el = mediaEls[i];
      var opacity = 0;

      if (i === index) {
        // fade out at the very end of this scene while the next fades in
        opacity = index < SCENE_COUNT - 1 && local > 1 - fadeSpan
          ? 1 - (local - (1 - fadeSpan)) / fadeSpan * 0.55
          : 1;
      } else if (i === index + 1 && local > 1 - fadeSpan) {
        opacity = (local - (1 - fadeSpan)) / fadeSpan;
      } else if (i === index - 1 && local < 0.04) {
        opacity = 1; // still fully behind during the first frames
      }

      var visible = opacity > 0.001;
      if (visible !== (el.style.visibility === "visible")) {
        el.style.visibility = visible ? "visible" : "hidden";
      }
      if (!visible) { el.style.opacity = "0"; continue; }
      el.style.opacity = String(opacity);

      if (reduce) {
        el.style.setProperty("--s", "1");
        el.style.setProperty("--ty", "0px");
        el.style.setProperty("--clip", "0%");
        continue;
      }

      // cinematic camera: slow push through the scene's life,
      // slight vertical drift for depth, masked reveal on framed panels
      var life = i === index ? local : (i === index + 1 ? 0 : 1);
      var scale = 1.1 - life * 0.08;         // 1.10 -> 1.02
      var drift = (life - 0.5) * -18;        // +9px -> -9px
      el.style.setProperty("--s", scale.toFixed(4));
      el.style.setProperty("--ty", drift.toFixed(2) + "px");

      if (el.classList.contains("scene-tall")) {
        var entering = i === index + 1 ? opacity : 1;
        var clipAmount = (1 - entering) * 8; // 8% -> 0% inset reveal
        el.style.setProperty("--clip", clipAmount.toFixed(2) + "%");
      }
    }
  }

  // Scroll-driven rendering: no continuous rAF loop, so nothing runs while
  // the user isn't scrolling or the tab is hidden. A timeout fallback keeps
  // the sequence honest even if rAF is throttled.
  var renderPending = false;
  function requestRender() {
    if (renderPending) return;
    renderPending = true;
    var fallback = setTimeout(function () {
      cancelAnimationFrame(raf);
      renderPending = false;
      renderScenes();
    }, 120);
    var raf = requestAnimationFrame(function () {
      clearTimeout(fallback);
      renderPending = false;
      renderScenes();
    });
  }

  var tried3D = false;
  function onAnatomyScroll() {
    if (!track) return; // anatomy section removed from this page
    var vh = window.innerHeight || 1;
    var r = track.getBoundingClientRect();
    // Simplified experience: the anatomy section runs as a high-quality
    // photographic scroll-through only. The optional WebGL overlay (init3D /
    // stage3d.js) is intentionally left uninitialised so the crisp staged
    // images are always the experience. Re-enable by calling init3D() here.
    void init3D; void tried3D;
    // Skip work (and its ensureLoaded image warming) until the section is close.
    if (r.bottom < -vh * 0.5 || r.top > vh * 0.9) return;
    if (!track.style.height || track.style.height === "0px") setTrackHeight();
    requestRender();
  }
  window.addEventListener("scroll", onAnatomyScroll, { passive: true });
  onAnatomyScroll();

  // Ensure a sensible initial state even before the engine runs.
  ensureLoadedInitial();
  function ensureLoadedInitial() {
    setActiveCopy(0);
    if (mediaEls[0]) {
      mediaEls[0].style.visibility = "visible";
      mediaEls[0].style.opacity = "1";
    }
  }

  /* ==================================================================
     Parallax push for completion + finale full-bleed sections
  ================================================================== */
  var parallaxSections = Array.prototype.slice.call(document.querySelectorAll("[data-parallax-media]"))
    .map(function (media) { return { media: media, section: media.parentElement }; });

  var parallaxActive = new Set();
  var parallaxRaf = null;

  function renderParallax() {
    parallaxRaf = null;
    if (prefersReduced()) return;
    var vh = window.innerHeight;
    parallaxActive.forEach(function (item) {
      var rect = item.section.getBoundingClientRect();
      var progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      var scale = 1.1 - progress * 0.08;
      var ty = (progress - 0.5) * rect.height * 0.06;
      item.media.style.setProperty("--pscale", scale.toFixed(4));
      item.media.style.setProperty("--pty", ty.toFixed(1) + "px");
    });
  }
  function onParallaxScroll() {
    if (!parallaxRaf && parallaxActive.size) parallaxRaf = requestAnimationFrame(renderParallax);
  }
  var parallaxObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var item = parallaxSections.find(function (s) { return s.section === entry.target; });
      if (!item) return;
      if (entry.isIntersecting) parallaxActive.add(item);
      else parallaxActive.delete(item);
    });
    onParallaxScroll();
  }, { rootMargin: "10% 0px" });
  parallaxSections.forEach(function (s) { parallaxObserver.observe(s.section); });
  window.addEventListener("scroll", onParallaxScroll, { passive: true });

  /* ==================================================================
     Roofing systems — exploded layer diagram
  ================================================================== */
  var diagram = document.querySelector("[data-layers-diagram]");
  var layerButtons = Array.prototype.slice.call(document.querySelectorAll("[data-layer-btn]"));
  var layerPlanes = Array.prototype.slice.call(document.querySelectorAll("[data-layer-plane]"));
  layerPlanes.forEach(function (plane) {
    plane.style.setProperty("--i", plane.getAttribute("data-layer-plane"));
  });

  if (diagram) {
    var diagramObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        diagram.classList.toggle("is-exploded", entry.isIntersecting);
      });
    }, { threshold: 0.35 });
    diagramObserver.observe(diagram);
  }

  function setActiveLayer(idx) {
    layerButtons.forEach(function (btn) {
      btn.parentElement.classList.toggle("is-active", btn.getAttribute("data-layer-btn") === String(idx));
    });
    layerPlanes.forEach(function (plane) {
      plane.classList.toggle("is-active", plane.getAttribute("data-layer-plane") === String(idx));
    });
  }
  layerButtons.forEach(function (btn) {
    var idx = btn.getAttribute("data-layer-btn");
    btn.addEventListener("mouseenter", function () { setActiveLayer(idx); });
    btn.addEventListener("focus", function () { setActiveLayer(idx); });
    btn.addEventListener("click", function () { setActiveLayer(idx); });
  });
  setActiveLayer(5); // field shingles highlighted by default

  /* ==================================================================
     Call CTA — routes to phone when configured, contact otherwise
  ================================================================== */
  var callCta = document.querySelector("[data-call-cta]");
  if (callCta && CONFIG.phone) {
    callCta.setAttribute("href", "tel:" + CONFIG.phone);
  }

  /* ==================================================================
     Contact form — validation, states, honeypot, honest hand-off
  ================================================================== */
  var form = document.querySelector("[data-contact-form]");
  var statusEl = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector("[data-submit-btn]");
  var submitLabel = form.querySelector("[data-submit-label]");
  var submitSpinner = form.querySelector("[data-submit-spinner]");

  function showError(fieldId, show) {
    var err = form.querySelector('[data-error-for="' + fieldId + '"]');
    if (!err) return;
    err.hidden = !show;
    var field = err.closest(".field, .field-radios");
    if (field) field.classList.toggle("has-error", show);
  }

  function validate() {
    var ok = true;
    var name = form.elements.name;
    var phone = form.elements.phone;
    var address = form.elements.address;
    var details = form.elements.details;
    var email = form.elements.email;
    var emailVal = email.value.trim();
    var emailOk = emailVal === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    // Four required fields; email is optional (validated only when provided).
    var checks = [
      ["f-name", name.value.trim().length >= 2],
      ["f-phone", /^[\d\s()+.\-]{7,}$/.test(phone.value.trim())],
      ["f-address", address.value.trim().length >= 5],
      ["f-details", details.value.trim().length >= 3],
      ["f-email", emailOk]
    ];
    // If the (collapsed) optional email is wrong, open the section so it's seen.
    if (!emailOk) {
      var det = form.querySelector(".form-optional");
      if (det) det.open = true;
    }
    var firstBad = null;
    checks.forEach(function (c) {
      var valid = c[1];
      showError(c[0], !valid);
      if (!valid) {
        ok = false;
        if (!firstBad) firstBad = document.getElementById(c[0]);
      }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function setSubmitting(is) {
    submitBtn.disabled = is;
    submitSpinner.hidden = !is;
    submitLabel.textContent = is ? "Sending…" : "Request My Free Inspection";
  }

  function formSummary(data) {
    return [
      "Inspection request — Loxley Roofing and Construction",
      "",
      "Name: " + data.get("name"),
      "Phone: " + data.get("phone"),
      "Property address: " + data.get("address"),
      "Email: " + (data.get("email") || "(not provided)"),
      "Service: " + (data.get("service") || "(not specified)"),
      "Property type: " + (data.get("propertyType") || "(not specified)"),
      "",
      "What's going on:",
      data.get("details") || "(none provided)"
    ].join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    // Honeypot: silently drop bot submissions.
    if (form.elements.company.value) {
      statusEl.textContent = "Thank you.";
      return;
    }
    if (!validate()) {
      statusEl.textContent = "Please review the highlighted fields.";
      statusEl.classList.add("is-error");
      return;
    }

    var data = new FormData(form);
    data.delete("company");

    if (CONFIG.formEndpoint) {
      setSubmitting(true);
      fetch(CONFIG.formEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        setSubmitting(false);
        form.reset();
        if (window.__loxleyLead) window.__loxleyLead("homepage");
        statusEl.classList.add("is-success");
        statusEl.textContent = "Thank you — your inspection request has been received. The Loxley team will call you shortly to schedule your free inspection.";
      }).catch(function () {
        setSubmitting(false);
        fallbackHandOff(data);
      });
    } else {
      // No live endpoint configured: hand the request off honestly via email
      // instead of pretending a CRM received it.
      fallbackHandOff(data);
    }
  });

  function fallbackHandOff(data) {
    var subject = encodeURIComponent("Free inspection request — " + data.get("name"));
    var body = encodeURIComponent(formSummary(data));
    var href = "mailto:" + CONFIG.email + "?subject=" + subject + "&body=" + body;
    statusEl.className = "form-status is-success";
    statusEl.innerHTML =
      "Your request is ready — an email draft to our team has been opened in your mail app. " +
      'If it didn’t open, email us directly at <a href="' + href + '">' + CONFIG.email + "</a>.";
    window.location.href = href;
  }

  /* ==================================================================
     Misc: current year, privacy link placeholder
  ================================================================== */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ==================================================================
     Resize handling
  ================================================================== */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setTrackHeight();
      if (stage3d) stage3d.resize();
      lastP = -1;
      renderScenes();
    }, 150);
  });
})();
