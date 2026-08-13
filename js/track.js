/* ==========================================================================
   track.js — GA4 conversion tracking. Fires events on the actions that matter
   for a roofing business so you can see what actually drives leads:
     • phone_call_click  — any tel: tap (nav, hero, mobile call bar, footer)
     • email_click       — any mailto: click
     • cta_click         — primary red CTA buttons (Free Inspection, etc.)
     • generate_lead     — a successful contact-form submission
   Safe no-op when gtag isn't present. Loaded on every page.
   ========================================================================== */
(function () {
  "use strict";

  function track(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("a[href^='tel:'], a[href^='mailto:'], a.btn-solid") : null;
    if (!el) return;
    var href = el.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      track("phone_call_click", { link_url: href, page_path: location.pathname });
    } else if (href.indexOf("mailto:") === 0) {
      track("email_click", { link_url: href, page_path: location.pathname });
    } else {
      track("cta_click", { cta_text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50), page_path: location.pathname });
    }
  }, true);

  // Called by the form handlers (form.js / main.js) on a successful submission.
  window.__loxleyLead = function (source) {
    track("generate_lead", { form_source: source || "inspection_form", page_path: location.pathname });
  };
})();
