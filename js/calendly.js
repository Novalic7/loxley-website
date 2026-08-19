/* ==========================================================================
   calendly.js — opens a Calendly scheduling popup from any [data-calendly]
   control (the value is the Calendly URL).

   Lazy by design: Calendly's widget CSS/JS are only fetched the FIRST time
   someone actually clicks a scheduling button, so they never slow down the
   initial page load. If Calendly can't load, we fall back to opening the
   booking page in a new tab so the visitor can still schedule.

   A completed booking is reported to GA4 as a lead conversion.
   Loaded on the contact page (see build.mjs `scripts`). No dependencies.
   ========================================================================== */
(function () {
  var WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
  var WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
  var state = "idle"; // idle | loading | ready
  var pending = [];

  function runPending() {
    var fns = pending;
    pending = [];
    fns.forEach(function (fn) { fn(); });
  }

  function ensureLoaded(cb) {
    if (state === "ready") return cb();
    pending.push(cb);
    if (state === "loading") return;
    state = "loading";

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = WIDGET_CSS;
    document.head.appendChild(link);

    var script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = function () { state = "ready"; runPending(); };
    // On failure, let each queued click fall back (the callback opens the URL
    // directly when window.Calendly is unavailable).
    script.onerror = function () { state = "idle"; runPending(); };
    document.head.appendChild(script);
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-calendly]");
    if (!trigger) return;
    e.preventDefault();
    var url = trigger.getAttribute("data-calendly");
    if (!url) return;

    if (window.gtag) {
      window.gtag("event", "schedule_open", { method: "calendly", page_path: location.pathname });
    }

    ensureLoaded(function () {
      if (window.Calendly && window.Calendly.initPopupWidget) {
        window.Calendly.initPopupWidget({ url: url });
      } else {
        // Calendly didn't load — don't strand the visitor.
        window.open(url, "_blank", "noopener");
      }
    });
  });

  // Calendly posts a message when an appointment is booked; count it as a lead.
  window.addEventListener("message", function (e) {
    if (typeof e.origin !== "string" || e.origin.indexOf("calendly.com") === -1) return;
    if (!e.data || e.data.event !== "calendly.event_scheduled") return;
    if (window.__loxleyLead) window.__loxleyLead("calendly");
    else if (window.gtag) window.gtag("event", "generate_lead", { method: "calendly" });
  });
})();
