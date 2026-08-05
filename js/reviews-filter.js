/* ==========================================================================
   reviews-filter.js — hide any Google review that names the former company
   ("Presidential Construction") from the Featurable widget on /reviews/.

   The business is rebranded to Loxley Roofing and Construction, so per policy no
   public page may reference the old name. The Featurable widget pulls reviews
   live into a shadow DOM and also injects a JSON-LD review schema; a few older
   reviews mention the old name in their text. This script removes them from BOTH
   the visible cards and the structured data, keyword-based, so it also catches
   any future review that mentions it. The widget is held hidden until the first
   clean pass so a flagged review never flashes on screen.

   If Featurable is eventually reconnected to a renamed profile (or those reviews
   are hidden in the Featurable dashboard), this simply finds nothing to do.
   ========================================================================== */
(function () {
  "use strict";

  var HOST_ID = "featurable-e08b874a-ac0b-4d37-b8d7-e96846a84056";
  var BAD = /presidential/i;

  var host = document.getElementById(HOST_ID);
  if (!host) return;

  // Hold the widget hidden until the first clean pass (no flash of a flagged review).
  host.style.transition = "opacity .2s var(--ease-out, ease)";
  host.style.opacity = "0";
  var revealed = false;
  function reveal() { if (!revealed) { revealed = true; host.style.opacity = "1"; } }

  function shadow() {
    var wrap = host.firstElementChild;
    return wrap && wrap.shadowRoot ? wrap.shadowRoot : null;
  }

  // 1) Hide visible review cards that mention the old name. A "reviews list" is an
  //    element whose children each carry a "… ago" date; hide any such child card
  //    whose text matches.
  function hideCards(sh) {
    if (!sh) return;
    var all = sh.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var kids = all[i].children;
      if (kids.length < 3) continue;
      var ago = 0;
      for (var k = 0; k < kids.length; k++) { if (/\bago\b/i.test(kids[k].textContent)) ago++; }
      if (ago < Math.max(3, Math.floor(kids.length * 0.5))) continue;
      for (var c = 0; c < kids.length; c++) {
        var card = kids[c];
        if (card.style.display !== "none" && BAD.test(card.textContent)) card.style.display = "none";
      }
    }
  }

  // 2) Strip flagged reviews from Featurable's JSON-LD (so the old name isn't in
  //    structured data either). Keeps the rest of the schema intact.
  function cleanSchema() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (!BAD.test(s.textContent)) continue;
      var data;
      try { data = JSON.parse(s.textContent); }
      catch (e) { s.parentNode && s.parentNode.removeChild(s); continue; }
      var removed = 0;
      (function walk(node) {
        if (Array.isArray(node)) {
          for (var j = node.length - 1; j >= 0; j--) {
            var it = node[j];
            if (it && typeof it === "object" && typeof it.reviewBody === "string" && BAD.test(it.reviewBody)) {
              node.splice(j, 1); removed++; continue;
            }
            walk(it);
          }
        } else if (node && typeof node === "object") {
          for (var key in node) walk(node[key]);
        }
      })(data);
      if (removed > 0) {
        try { s.textContent = JSON.stringify(data); } catch (e) { s.parentNode && s.parentNode.removeChild(s); }
      } else if (BAD.test(s.textContent)) {
        // matched somewhere we didn't expect — remove the whole block to be safe
        s.parentNode && s.parentNode.removeChild(s);
      }
    }
  }

  function run() { hideCards(shadow()); cleanSchema(); }

  var passes = 0;
  var iv = setInterval(function () {
    var sh = shadow();
    if (sh && sh.textContent && sh.textContent.length > 500) {
      run();
      reveal();
      if (!host.__revObserved) {
        host.__revObserved = true;
        try {
          new MutationObserver(function () { hideCards(sh); }).observe(sh, { childList: true, subtree: true });
          new MutationObserver(cleanSchema).observe(document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
      }
      if (++passes > 8) clearInterval(iv);
    }
  }, 300);

  // Never leave the widget hidden, even if the widget fails to load.
  setTimeout(reveal, 4000);
})();
