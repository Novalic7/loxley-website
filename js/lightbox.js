/* ==========================================================================
   lightbox.js — click a project photo to view it full-size.

   Self-contained, no dependencies. Enhances the .work-item figures in a
   .work-gallery: click (or Enter/Space) opens an overlay with the full image
   and caption; navigate with the on-screen arrows or ←/→; close with the ✕,
   a backdrop click, or Esc. Progressive enhancement — with no JS the gallery
   is still a normal grid of images.
   ========================================================================== */
(function () {
  "use strict";

  var items = Array.prototype.slice.call(document.querySelectorAll(".work-gallery .work-item"));
  if (!items.length) return;

  var slides = items.map(function (fig) {
    var img = fig.querySelector("img");
    var cap = fig.querySelector("figcaption");
    return {
      src: img ? img.getAttribute("src") : "",
      alt: img ? (img.getAttribute("alt") || "") : "",
      caption: cap ? cap.textContent : ""
    };
  });

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Project photo viewer");
  overlay.hidden = true;
  overlay.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">×</button>' +
    '<button class="lb-nav lb-prev" type="button" aria-label="Previous photo">‹</button>' +
    '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button class="lb-nav lb-next" type="button" aria-label="Next photo">›</button>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector(".lb-img");
  var capEl = overlay.querySelector(".lb-cap");
  var closeBtn = overlay.querySelector(".lb-close");
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + slides.length) % slides.length;
    var s = slides[current];
    imgEl.src = s.src;
    imgEl.alt = s.alt;
    capEl.textContent = s.caption;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    overlay.hidden = false;
    document.documentElement.style.overflow = "hidden"; // no background scroll
    closeBtn.focus();
  }
  function close() {
    overlay.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  closeBtn.addEventListener("click", close);
  overlay.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(current - 1); });
  overlay.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(current + 1); });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); }); // backdrop
  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  });

  items.forEach(function (fig, i) {
    fig.classList.add("work-item--zoom");
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    var cap = fig.querySelector("figcaption");
    fig.setAttribute("aria-label", "View larger: " + (cap ? cap.textContent : "project photo " + (i + 1)));
    fig.addEventListener("click", function () { open(i); });
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });
})();
