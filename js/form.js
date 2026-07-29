/* ==========================================================================
   Loxley — reusable four-field inspection form handler.
   Self-contained and defensive: no-ops if no [data-contact-form] is present.
   Used on the standalone /contact/ page (the homepage runs its own copy in
   main.js). Keep the two in sync if the validation rules change.
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = {
    email: "nova@theloxleycorp.com", // inspection request inbox
    formEndpoint: ""                 // e.g. a Formspree/Basin POST URL
  };

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

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
    var emailVal = email ? email.value.trim() : "";
    var emailOk = emailVal === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    var checks = [
      ["f-name", name.value.trim().length >= 2],
      ["f-phone", /^[\d\s()+.\-]{7,}$/.test(phone.value.trim())],
      ["f-address", address.value.trim().length >= 5],
      ["f-details", details.value.trim().length >= 3],
      ["f-email", emailOk]
    ];
    if (!emailOk) {
      var det = form.querySelector(".form-optional");
      if (det) det.open = true;
    }
    var firstBad = null;
    checks.forEach(function (c) {
      showError(c[0], !c[1]);
      if (!c[1]) { ok = false; if (!firstBad) firstBad = document.getElementById(c[0]); }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function setSubmitting(is) {
    if (submitBtn) submitBtn.disabled = is;
    if (submitSpinner) submitSpinner.hidden = !is;
    if (submitLabel) submitLabel.textContent = is ? "Sending…" : "Request My Free Inspection";
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

  function fallbackHandOff(data) {
    var subject = encodeURIComponent("Free inspection request — " + data.get("name"));
    var body = encodeURIComponent(formSummary(data));
    var href = "mailto:" + CONFIG.email + "?subject=" + subject + "&body=" + body;
    if (statusEl) {
      statusEl.className = "form-status is-success";
      statusEl.innerHTML =
        "Your request is ready — an email draft to our team has been opened in your mail app. " +
        'If it didn’t open, email us directly at <a href="' + href + '">' + CONFIG.email + "</a>.";
    }
    window.location.href = href;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

    if (form.elements.company && form.elements.company.value) {
      if (statusEl) statusEl.textContent = "Thank you.";
      return;
    }
    if (!validate()) {
      if (statusEl) { statusEl.textContent = "Please review the highlighted fields."; statusEl.classList.add("is-error"); }
      return;
    }

    var data = new FormData(form);
    data.delete("company");

    if (CONFIG.formEndpoint) {
      setSubmitting(true);
      fetch(CONFIG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          setSubmitting(false);
          form.reset();
          if (statusEl) { statusEl.className = "form-status is-success"; statusEl.textContent = "Thank you — your inspection request has been received. The Loxley team will call you shortly to schedule your free inspection."; }
        })
        .catch(function () { setSubmitting(false); fallbackHandOff(data); });
    } else {
      fallbackHandOff(data);
    }
  });
})();
