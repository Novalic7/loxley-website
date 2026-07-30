/* ==========================================================================
   Loxley Roofing and Construction — static site generator (Phase 2 scaffold)

   Zero dependencies. Generates real, crawlable HTML for every route from a
   shared layout + per-page data, plus sitemap.xml. Run after editing PAGES:

       node build.mjs

   The homepage (index.html) is hand-built and NOT generated here.
   Money pages (storm-damage, insurance-claims) carry real educational content;
   others are honest scaffolds — no invented reviews, certifications, or photos.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = "https://loxleyconstruction.com"; // production domain (Hostinger)

/* Content-hash cache-busting. Every local CSS/JS URL gets a ?v=<hash> token
   derived from the file's contents, so a change produces a new URL that
   browsers and the CDN must re-fetch — while unchanged files keep their token
   (and stay cached). This is what stops "I pushed but the old file is stuck". */
const _hashCache = {};
function assetHash(rel) {
  const key = "/" + rel.replace(/^\//, "").split("?")[0];
  if (!(key in _hashCache)) {
    try {
      const buf = fs.readFileSync(path.join(ROOT, key.slice(1)));
      _hashCache[key] = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
    } catch {
      _hashCache[key] = "0";
    }
  }
  return _hashCache[key];
}
function assetVer(rel) {
  const clean = rel.split("?")[0];
  return `${clean}?v=${assetHash(clean)}`;
}

const BIZ = {
  name: "Loxley Roofing and Construction",
  phone: "+13149066915",
  phoneDisplay: "(314) 906-6915",
  email: "nova@theloxleycorp.com",
  street: "524 Clark Ave",
  city: "Kirkwood",
  region: "MO",
  zip: "63122",
  lat: 38.5734941,
  lng: -90.394012,
  gbp: "https://maps.app.goo.gl/i1ZWHzdubEDsrrwT8"
};

/* ---------- shared partials ---------- */
const nav = [
  ["/", "Home"],
  ["#services", "Services"],
  ["/our-work/", "Our Work"],
  ["/service-areas/", "Service Areas"],
  ["/about/", "About"],
  ["/contact/", "Contact"]
];

// Every service line lives under a single "Services" dropdown so the header stays
// clean and future services (e.g. HVAC) can be added by dropping one entry here —
// no new top-level tabs. Each destination stays a full, separately-ranking page.
// SERVICES_PATHS (used for the active-state highlight) is derived from this list,
// so adding a service keeps the highlight working automatically.
const servicesMenu = [
  ["/roofing/", "Residential Roofing"],
  ["/commercial-roofing/", "Commercial Roofing"],
  ["/gutters-and-exteriors/", "Exteriors & Gutters"],
  ["/holiday-lighting/", "Holiday Lighting"],
  ["/construction/", "Construction"],
  ["/renovations/", "Kitchen & Renovation"]
];
const SERVICES_PATHS = servicesMenu.map(([p]) => p);

function header(page) {
  const url = (page && page.url) || "/";
  const isActive = (h) => h === "/" ? url === "/" : url.startsWith(h);
  const servicesActive = SERVICES_PATHS.some((p) => url.startsWith(p));
  const navHtml = nav.map(([h, t]) => {
    if (h === "#services") {
      return `<div class="nav-dd" data-nav-dd>
          <button type="button" class="nav-dd-toggle${servicesActive ? " is-active" : ""}" aria-expanded="false" aria-haspopup="true" aria-controls="nav-services-menu">${t} <span class="nav-caret" aria-hidden="true">▾</span></button>
          <div class="nav-dd-menu" id="nav-services-menu" role="menu">
${servicesMenu.map(([mh, mt]) => `            <a href="${mh}" role="menuitem"${url.startsWith(mh) ? ' class="is-active"' : ""}>${mt}</a>`).join("\n")}
          </div>
        </div>`;
    }
    return `<a href="${h}"${isActive(h) ? ' class="is-active"' : ""}>${t}</a>`;
  }).join("\n        ");
  return `  <header class="site-header is-scrolled" data-header>
    <div class="header-inner">
      <a class="wordmark" href="/" aria-label="${BIZ.name} — home">
        <img class="header-logo" src="/assets/brand/loxley-horizontal-white.webp" width="2219" height="600" alt="${BIZ.name}">
      </a>
      <nav class="nav-desktop" aria-label="Primary">
        ${navHtml}
        <a class="nav-phone" href="tel:${BIZ.phone}" aria-label="Call Loxley Roofing at ${BIZ.phoneDisplay}">
          <svg class="nav-phone-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${BIZ.phoneDisplay}</span>
        </a>
        <a class="btn btn-solid btn-nav" href="/contact/">Free Inspection</a>
      </nav>
      <a class="nav-phone nav-phone-mobile" href="tel:${BIZ.phone}" aria-label="Call ${BIZ.phoneDisplay}">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </a>
    </div>
  </header>`;
}

function trustbar() {
  return `  <section class="trustbar" aria-label="Why St. Louis homeowners choose Loxley">
    <ul class="trustbar-inner">
      <li class="tb-rating"><a href="${BIZ.gbp}" target="_blank" rel="noopener noreferrer"><span class="tb-stars" aria-hidden="true">★★★★★</span> <span><strong>4.9</strong> Google Rating</span></a></li>
      <li>Licensed &amp; Insured</li>
      <li>10-Year Transferable Workmanship Warranty</li>
      <li>Locally Owned · Kirkwood, MO</li>
    </ul>
  </section>`;
}

function ctaBand(heading) {
  return `  <section class="page-cta" aria-label="Get started">
    <div class="page-cta-inner">
      <h2 class="display">${heading || "Ready for a free, no-obligation inspection?"}</h2>
      <p>We'll document your roof, explain your options in plain English, and give you a clear path forward.</p>
      <div class="page-cta-actions">
        <a class="btn btn-solid" href="/contact/">Schedule a Free Inspection</a>
        <a class="btn btn-ghost" href="tel:${BIZ.phone}">Call ${BIZ.phoneDisplay}</a>
      </div>
    </div>
  </section>`;
}

function footer() {
  const y = 2026;
  return `  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="footer-logo" href="/" aria-label="${BIZ.name} — home">
          <img src="/assets/brand/logo-vertical-white.webp" width="500" height="563" alt="${BIZ.name}">
        </a>
        <p class="footer-tag">Built from the ground up.<br>Protected from the top down.</p>
        <address class="footer-nap">
          <p class="footer-nap-name">${BIZ.name}</p>
          <p>${BIZ.street}<br>${BIZ.city}, ${BIZ.region} ${BIZ.zip}</p>
          <p><a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a></p>
          <p><a href="mailto:${BIZ.email}">${BIZ.email}</a></p>
          <p>Mon–Fri: 7:00&nbsp;AM – 5:00&nbsp;PM</p>
          <p>Serving the St.&nbsp;Louis Metro &amp; St.&nbsp;Charles County</p>
        </address>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <div class="footer-col">
          <p class="footer-col-title">Services</p>
          <a href="/roofing/">Residential Roofing</a>
          <a href="/commercial-roofing/">Commercial Roofing</a>
          <a href="/gutters-and-exteriors/">Gutters &amp; Exteriors</a>
          <a href="/holiday-lighting/">Holiday Lighting</a>
          <a href="/construction/">Construction</a>
          <a href="/renovations/">Kitchen &amp; Renovation</a>
        </div>
        <div class="footer-col">
          <p class="footer-col-title">Company</p>
          <a href="/about/">About</a>
          <a href="/our-work/">Our Work</a>
          <a href="/reviews/">Reviews</a>
          <a href="/service-areas/">Service Areas</a>
          <a href="/financing/">Financing</a>
          <a href="/contact/">Contact</a>
          <a href="/privacy-policy.html">Privacy Policy</a>
        </div>
      </nav>
    </div>
    <div class="footer-base">
      <p>© <span data-year>${y}</span> ${BIZ.name}. All rights reserved.</p>
      <p>Serving the greater St. Louis area</p>
    </div>
  </footer>`;
}

function mobileCallbar() {
  return `  <div class="mobile-callbar" aria-label="Quick actions">
    <a class="mcb-btn mcb-call" href="tel:${BIZ.phone}">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      Call Now
    </a>
    <a class="mcb-btn mcb-quote" href="/contact/">Free Inspection</a>
  </div>`;
}

function schema(page) {
  const data = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    "name": BIZ.name,
    "url": SITE + page.url,
    "telephone": BIZ.phone,
    "email": BIZ.email,
    "image": SITE + "/assets/images/01-hero-exterior.webp",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BIZ.street,
      "addressLocality": BIZ.city,
      "addressRegion": BIZ.region,
      "postalCode": BIZ.zip,
      "addressCountry": "US"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": BIZ.lat, "longitude": BIZ.lng },
    "areaServed": page.areaServed || ["St. Louis County, MO", "St. Charles County, MO", "St. Louis, MO", "Kirkwood, MO", "Clayton, MO", "Ladue, MO", "Webster Groves, MO", "Chesterfield, MO", "Ballwin, MO", "Wildwood, MO", "Des Peres, MO", "Town and Country, MO", "O'Fallon, MO", "St. Charles, MO", "St. Peters, MO"],
    "openingHours": "Mo-Fr 07:00-17:00",
    "priceRange": "$$",
    "sameAs": [BIZ.gbp]
    // TODO: add "aggregateRating" once the exact Google review COUNT is confirmed.
  };
  let out = `  <script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
  // Area pages carry a BreadcrumbList (Home › Service Areas › <Area>) for richer
  // local-SEO results.
  if (page.breadcrumb) {
    const bc = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": page.breadcrumb.map((b, i) => ({
        "@type": "ListItem", "position": i + 1, "name": b[0], "item": SITE + b[1]
      }))
    };
    out += `\n  <script type="application/ld+json">\n${JSON.stringify(bc, null, 2)}\n  </script>`;
  }
  return out;
}

/* Optional looping video backdrop for a page hero. Muted + autoplay + loop +
   playsinline so it auto-plays as an ambient background on every browser; the
   poster paints instantly and is the fallback for reduced-motion users. A scrim
   (in CSS) keeps the hero text fully legible over the footage. */
function heroVideo(v) {
  return `      <div class="page-hero-media" aria-hidden="true" style="background-image:url('${assetVer(v.poster)}')">
        <video class="page-hero-video" autoplay muted loop playsinline preload="auto" poster="${assetVer(v.poster)}">
          <source src="${assetVer(v.mp4)}" type="video/mp4">
        </video>
      </div>`;
}

/* Optional static image backdrop for a page hero (e.g. an aerial of a service
   area, so a local visitor recognizes their own town). Uses the same scrim as
   the video hero to keep the eyebrow, headline and lede legible. */
function heroImage(img) {
  return `      <div class="page-hero-media" role="img" aria-label="${img.alt}" style="background-image:url('${assetVer(img.src)}')"></div>`;
}

function layout(page) {
  const title = `${page.title} | ${BIZ.name}`;
  const canonical = SITE + page.url;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${page.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/brand/favicon-dark-96.png" type="image/png">
  <link rel="icon" href="/assets/brand/favicon-white-96.png" type="image/png" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${BIZ.name}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/assets/images/01-hero-exterior.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/assets/images/01-hero-exterior.webp">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${assetVer("/css/main.css")}">
${schema(page)}
</head>
<body class="page">
  <a class="skip-link" href="#main">Skip to main content</a>
${header(page)}
  <main id="main">
    <section class="page-hero${page.heroVideo ? " has-hero-video" : page.heroImage ? " has-hero-image" : ""}" aria-label="${page.title}">
${page.heroVideo ? heroVideo(page.heroVideo) + "\n" : page.heroImage ? heroImage(page.heroImage) + "\n" : ""}      <div class="page-hero-inner">
        <p class="eyebrow">${page.eyebrow || "St. Louis Roofing & Exterior Construction"}</p>
        <h1 class="display">${page.h1}</h1>
        ${page.intro ? `<p class="lede">${page.intro}</p>` : ""}
        <div class="page-hero-actions">
          <a class="btn btn-solid" href="/contact/">Free Inspection</a>
          <a class="btn btn-ghost" href="tel:${BIZ.phone}">Call ${BIZ.phoneDisplay}</a>
        </div>
      </div>
    </section>
${trustbar()}
${page.fullWidth ? page.body : `    <div class="page-body">\n${page.body}\n    </div>`}
${ctaBand(page.ctaHeading)}
  </main>
${footer()}
${mobileCallbar()}
${["/js/nav.js", ...(page.scripts || [])].map(s => `  <script src="${assetVer(s)}" defer></script>`).join("\n")}
</body>
</html>
`;
}

function contactForm() {
  return `      <section class="prose contact-form-wrap">
        <h2>Request a free inspection</h2>
        <form class="contact-form" data-contact-form novalidate>
          <div class="form-row">
            <div class="field">
              <label for="f-name">Name <span aria-hidden="true">*</span></label>
              <input id="f-name" name="name" type="text" autocomplete="name" required>
              <p class="field-error" data-error-for="f-name" role="alert" hidden>Please enter your name.</p>
            </div>
            <div class="field">
              <label for="f-phone">Phone <span aria-hidden="true">*</span></label>
              <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required>
              <p class="field-error" data-error-for="f-phone" role="alert" hidden>Please enter a valid phone number.</p>
            </div>
          </div>
          <div class="field">
            <label for="f-address">Property Address <span aria-hidden="true">*</span></label>
            <input id="f-address" name="address" type="text" autocomplete="street-address" required>
            <p class="field-error" data-error-for="f-address" role="alert" hidden>Please enter the property address.</p>
          </div>
          <div class="field">
            <label for="f-details">What’s going on? <span aria-hidden="true">*</span></label>
            <textarea id="f-details" name="details" rows="4" required placeholder="Leaks, storm damage, age of the roof, upcoming plans — anything that helps us prepare."></textarea>
            <p class="field-error" data-error-for="f-details" role="alert" hidden>Please tell us a little about what’s going on.</p>
          </div>
          <details class="form-optional">
            <summary>Add more details <span class="opt">(optional)</span></summary>
            <div class="form-row">
              <div class="field">
                <label for="f-email">Email <span class="opt">(optional)</span></label>
                <input id="f-email" name="email" type="email" autocomplete="email">
                <p class="field-error" data-error-for="f-email" role="alert" hidden>Please enter a valid email address.</p>
              </div>
              <div class="field">
                <label for="f-service">Service <span class="opt">(optional)</span></label>
                <select id="f-service" name="service">
                  <option value="" selected>Select a service</option>
                  <option>Residential Roofing</option>
                  <option>Commercial Roofing</option>
                  <option>Storm Restoration</option>
                  <option>Gutters &amp; Exterior Systems</option>
                  <option>Construction Services</option>
                  <option>Property Inspection</option>
                  <option>Not sure yet</option>
                </select>
              </div>
            </div>
          </details>
          <div class="hp-field" aria-hidden="true">
            <label for="f-company">Company</label>
            <input id="f-company" name="company" type="text" tabindex="-1" autocomplete="off">
          </div>
          <button class="btn btn-solid btn-submit" type="submit" data-submit-btn>
            <span data-submit-label>Request My Free Inspection</span>
            <span class="btn-spinner" data-submit-spinner hidden aria-hidden="true"></span>
          </button>
          <p class="form-reassure">No pressure, no obligation. We’ll call to schedule a time that works.</p>
          <p class="form-status" data-form-status role="status" aria-live="polite"></p>
        </form>
      </section>`;
}

/* Holiday-lighting three guarantees (names are fixed; confirm terms vs the plan). */
function guarantees() {
  const g = [
    ["Stay-Lit Guarantee", "If a bulb or a run goes dark during the season, we come back and fix it — you never chase a burned-out strand on a ladder in December."],
    ["No-Fastener Guarantee", "Nothing is stapled, nailed or screwed into your roof. As roofers, we use clips and methods that protect your shingles and flashing — and we warranty the roof."],
    ["Takedown Guarantee", "After the season we take everything down, label it, and store it — so it's ready to go up again next year with zero hassle for you."]
  ];
  return `      <section class="prose guarantees">
        <h2>Three guarantees, in writing</h2>
        <div class="guarantee-grid">
${g.map(x => `          <div class="guarantee"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join("\n")}
        </div>
        <p class="content-note">Guarantee wording is a working draft — final terms come from the Holiday Lighting Division Plan. Confirm before publishing.</p>
      </section>`;
}

/* ---------- content helpers ---------- */
const P = (h, ...ps) => `      <section class="prose">\n        <h2>${h}</h2>\n        ${ps.map(p => `<p>${p}</p>`).join("\n        ")}\n      </section>`;
const LIST = (h, items) => `      <section class="prose">\n        <h2>${h}</h2>\n        <ul class="prose-list">\n          ${items.map(i => `<li>${i}</li>`).join("\n          ")}\n        </ul>\n      </section>`;
const FAQ = (items) => `      <section class="prose faq" aria-label="Frequently asked questions">\n        <h2>Frequently asked questions</h2>\n        ${items.map(([q, a]) => `<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join("\n        ")}\n      </section>`;
const NOTE = (t) => `      <section class="prose"><p class="content-note">${t}</p></section>`;
const skeleton = (what) => [
  P("What Loxley does", `We approach every ${what} as a complete system — the deck, the water barrier, ventilation, flashing and finish work all matter. You get a documented inspection, clear options, and workmanship backed by our 10-year transferable warranty.`),
  LIST("Our process", ["Free, documented inspection with photos", "A written scope and honest options — repair vs. replace", "Professional installation with clean daily site management", "Final walkthrough, cleanup, and warranty registration"]),
  NOTE("Detailed pricing guidance and project photos for this service are being added. Call us for a straight answer on your specific property."),
  FAQ([
    ["Do you offer free inspections?", "Yes — every inspection is free and no-obligation, with photos you keep."],
    ["Are you licensed and insured?", "Yes. We are licensed and fully insured, and locally owned in Kirkwood, MO."]
  ])
].join("\n");

/* Seven-stage roofing scroller (Phase 3) — reuses the roof section's CSS. */
function systemsScroller() {
  const slides = [
    ["16-roof-quality-inspection", "Documented roof inspection with photos"],
    ["07-roof-decking", "Roof deck inspected after tear-off"],
    ["08-roof-underlayment", "Ice-and-water shield and synthetic underlayment"],
    ["09-flashing-details", "Drip edge and flashing details"],
    ["10-shingle-installation", "Architectural field shingles and flashing"],
    ["11-ridge-ventilation-metal-roof", "Ridge vent and matching ridge caps"],
    ["17-completed-roofline-detail", "Completed, inspected roofline"]
  ];
  return `      <section class="roof" data-systems style="height:750vh" aria-label="A roof, installed — seven stages">
        <div class="roof-stage" data-systems-stage>
          <div class="roof-fallback">
${slides.map((s, i) => `            <div class="fb" data-sfb="${i}"${i === 0 ? ' style="opacity:1"' : ""}><img data-src="/assets/images/${s[0]}.webp" alt="${s[1]}"></div>`).join("\n")}
          </div>
          <div class="roof-head">
            <p class="kicker"><span class="dot" aria-hidden="true"></span> A roof, installed</p>
            <h2 class="display">Seven stages, done right.</h2>
          </div>
          <div class="roof-label" data-systems-label>
            <p class="num" data-systems-num>Stage 1 / 7</p>
            <p class="t" data-systems-title>Inspection &amp; Documentation</p>
            <p class="s" data-systems-sub>We photograph and document the existing roof — the record that guides the work and backs any insurance claim.</p>
          </div>
          <div class="roof-progress" aria-hidden="true"><span data-systems-fill></span></div>
        </div>
      </section>`;
}

/* Ten-stage whole-house construction sequence (moved from the homepage). */
function constructionSequence() {
  const slides = [
    ["02-site-preparation", "Site preparation — grading, access and layout"],
    ["03-foundation", "Foundation — footings and foundation walls"],
    ["04-floor-system", "Floor system — engineered joists and subfloor"],
    ["05-wall-framing", "Wall framing taking shape"],
    ["06-roof-framing", "Roof framing — trusses, hips and valleys"],
    ["10-shingle-installation", "Roofing system — shingles and flashing"],
    ["12-exterior-envelope", "Exterior envelope — windows and brick"],
    ["13-mechanical-rough-in", "Mechanical rough-in — plumbing, electrical, HVAC"],
    ["14-insulation-drywall", "Insulation and drywall"],
    ["15-kitchen-interior-finishes", "Interior finishes — the completed home"]
  ];
  return `      <section class="roof" data-construction style="height:1000vh" aria-label="A home, built — ground to finish">
        <div class="roof-stage" data-construction-stage>
          <div class="roof-fallback">
${slides.map((s, i) => `            <div class="fb" data-cfb="${i}"${i === 0 ? ' style="opacity:1"' : ""}><img data-src="/assets/images/${s[0]}.webp" alt="${s[1]}"></div>`).join("\n")}
          </div>
          <div class="roof-head">
            <p class="kicker"><span class="dot" aria-hidden="true"></span> A home, built</p>
            <h2 class="display">Ground to finish, stage by stage.</h2>
          </div>
          <div class="roof-label" data-construction-label>
            <p class="num" data-construction-num>Stage 1 / 10</p>
            <p class="t" data-construction-title>Site Preparation</p>
            <p class="s" data-construction-sub>Grading, access, drainage and layout establish the conditions for everything that follows.</p>
          </div>
          <div class="roof-progress" aria-hidden="true"><span data-construction-fill></span></div>
        </div>
      </section>`;
}

/* Sixteen-stage "Anatomy of a Better Build" — the signature About-page
   walkthrough. Reuses the roof scroller CSS; driven by js/anatomy.js. */
function anatomyWalkthrough() {
  const slides = [
    ["02-site-preparation", "Site preparation — grading, access and drainage"],
    ["03-foundation", "Foundation — footings and foundation walls"],
    ["04-floor-system", "Floor system — engineered joists and subfloor"],
    ["05-wall-framing", "Wall framing taking shape"],
    ["06-roof-framing", "Roof framing — trusses, hips and valleys"],
    ["07-roof-decking", "Roof deck inspected before the assembly goes on"],
    ["08-roof-underlayment", "Ice-and-water shield and synthetic underlayment"],
    ["09-flashing-details", "Drip edge and flashing details"],
    ["10-shingle-installation", "Architectural field shingles and flashing"],
    ["11-ridge-ventilation-metal-roof", "Ridge vent and matching ridge caps"],
    ["12-exterior-envelope", "Exterior envelope — windows and brick"],
    ["13-mechanical-rough-in", "Mechanical rough-in — plumbing, electrical, HVAC"],
    ["14-insulation-drywall", "Insulation and drywall"],
    ["15-kitchen-interior-finishes", "Interior finishes — the completed home"],
    ["16-roof-quality-inspection", "Documented quality inspection"],
    ["17-completed-roofline-detail", "Completed, inspected roofline"]
  ];
  return `      <section class="roof" data-abb style="height:1500vh" aria-label="The anatomy of a better build — sixteen stages">
        <div class="roof-stage" data-abb-stage>
          <div class="roof-fallback">
${slides.map((s, i) => `            <div class="fb" data-abb-fb="${i}"${i === 0 ? ' style="opacity:1"' : ""}><img data-src="/assets/images/${s[0]}.webp" alt="${s[1]}"></div>`).join("\n")}
          </div>
          <div class="roof-head">
            <p class="kicker"><span class="dot" aria-hidden="true"></span> The anatomy of a better build</p>
            <h2 class="display">Every layer, in order.</h2>
          </div>
          <div class="roof-label" data-abb-label>
            <p class="num" data-abb-num>Stage 1 / 16</p>
            <p class="t" data-abb-title>Site Preparation</p>
            <p class="s" data-abb-sub>Grading, access and drainage are set first — a dry, stable site is what every later stage depends on.</p>
          </div>
          <div class="roof-progress" aria-hidden="true"><span data-abb-fill></span></div>
        </div>
      </section>`;
}

/* ---------- service areas (data-driven) ----------
   One record per community. `homes`/`angle` carry the genuinely local content
   (real housing character — not fabricated jobs), which is what keeps each page
   distinct rather than a thin template. Suburbs have no `kind`; `region` groups
   them (stl = St. Louis County, stc = St. Charles County). Adding a community is
   one entry here — it generates the page, the hub link, nearby-area backlinks
   and structured data automatically. */
const AREAS = [
  { slug: "st-louis-county", name: "St. Louis County", region: "stl", kind: "county",
    intro: "Dozens of communities, one local roofing and exterior contractor.",
    desc: "Loxley Roofing and Construction serves communities across St. Louis County, MO — roofing, storm restoration, gutters, exteriors and construction. Licensed, insured and locally owned in Kirkwood.",
    homes: "St. Louis County stretches from close-in suburbs like Kirkwood, Webster Groves and Clayton to Ladue's estates and the newer subdivisions of Chesterfield, Ballwin and Wildwood — a huge range of home ages, roof types and price points.",
    angle: "Wherever you are in the county, we bring the same documented, warrantied roofing and exterior work." },
  { slug: "st-louis", name: "St. Louis", region: "stl", kind: "city",
    intro: "Roofing for the city's historic brick homes and low-slope roofs.",
    desc: "Roofing, storm restoration and exterior work in the City of St. Louis, MO — from historic brick and century homes to flat and low-slope urban roofs. Licensed, insured, locally owned.",
    homes: "The City of St. Louis is defined by its historic brick and century homes and dense, walkable neighborhoods — the Central West End, Tower Grove, Shaw, South City and beyond. That means everything from steep, detailed rooflines to the flat and low-slope roofs common on older city buildings.",
    angle: "We handle both worlds — steep-slope shingle systems and flat/low-slope roofs — with the flashing and detailing older city homes demand." },
  { slug: "kirkwood", name: "Kirkwood", region: "stl", zips: "63122", hq: true,
    photo: "/assets/images/areas/kirkwood.webp",
    intro: "We're based in Kirkwood — this is home.",
    desc: "Your local Kirkwood, MO roofer. Roof replacement, repair, storm restoration, gutters and construction from a contractor headquartered right in Kirkwood. Licensed, insured, warrantied.",
    homes: "Loxley Roofing and Construction is headquartered right here at 524 Clark Ave. Kirkwood blends Victorian and century-old homes near the historic downtown and train station with established mid-century neighborhoods and newer infill builds across the 63122 area.",
    angle: "Being based in town means fast, accountable service — and a company your neighbors can actually find." },
  { slug: "webster-groves", name: "Webster Groves", region: "stl", zips: "63119",
    photo: "/assets/images/areas/webster-groves.webp",
    intro: "Trusted roofing next door in Webster Groves.",
    desc: "Roof replacement, repair and storm-damage help in Webster Groves, MO — roofing tuned to the area's older and historic homes. Licensed, insured, locally owned, warrantied.",
    homes: "Webster Groves is known for its tree-lined streets and a deep stock of older and historic homes — from turn-of-the-century houses in Old Webster to solid mid-century builds — alongside newer construction.",
    angle: "Older homes reward careful work: proper flashing, ventilation and underlayment matter as much as the shingle itself." },
  { slug: "clayton", name: "Clayton", region: "stl", zips: "63105", premium: true,
    photo: "/assets/images/areas/clayton.webp",
    intro: "High-standard roofing, exteriors and renovation for Clayton.",
    desc: "Roofing, exteriors and full renovation in Clayton, MO — the county seat's stately historic and high-value modern homes, executed cleanly and documented at every step. Licensed and insured.",
    homes: "Clayton — the St. Louis County seat — is one of the region's most prestigious addresses, mixing stately historic homes with modern high-value residences. These are homes where roofing, exteriors and full renovations have to be executed to a high standard, cleanly and on schedule.",
    angle: "Beyond roofing, our construction and renovation team handles additions, kitchens and whole-home remodels to match the caliber of the home." },
  { slug: "ladue", name: "Ladue", region: "stl", zips: "63124", premium: true,
    photo: "/assets/images/areas/ladue.webp",
    intro: "Meticulous roofing, exteriors and renovation for Ladue estates.",
    desc: "Premium roofing, exteriors and renovation in Ladue, MO — large custom estates and high-value homes, handled with meticulous, documented, property-protective work. Licensed and insured.",
    homes: "Ladue is one of the most affluent communities in Missouri, known for large custom estates and high-value homes on generous, wooded lots. Roofs here are often substantial and complex — steep pitches, multiple valleys, dormers, chimneys and metal accents.",
    angle: "Homes like these demand meticulous roofing and exterior work plus a construction and renovation team that documents everything and protects the property throughout — from a new roof to a full kitchen or whole-home remodel." },
  { slug: "des-peres", name: "Des Peres", region: "stl", zips: "63131", premium: true,
    photo: "/assets/images/areas/des-peres.webp",
    intro: "Clean, documented roofing and exteriors in Des Peres.",
    desc: "Roofing, gutters, exteriors and construction in Des Peres, MO — an established community of larger homes where clean, careful, documented work is expected. Licensed, insured, warrantied.",
    homes: "Des Peres is an established, well-kept community of larger single-family homes, many now at the age where an original roof is due for replacement.",
    angle: "We match the standard of the neighborhood: careful, clean, documented, and backed by our workmanship warranty." },
  { slug: "town-and-country", name: "Town & Country", region: "stl", zips: "63017, 63131", premium: true,
    photo: "/assets/images/areas/town-and-country.webp",
    intro: "Roofing and renovation for Town & Country's custom homes.",
    desc: "Roofing, exteriors and renovation in Town & Country, MO — large custom homes and estates on wooded acreage, with substantial, often complex roofs. Licensed, insured, documented.",
    homes: "Town & Country is known for large custom homes and estates set on wooded acreage — properties with substantial, often complex roofs where quality, cleanliness and discretion matter.",
    angle: "From complex re-roofs to additions and full renovations, we bring the documentation and site care these homes deserve." },
  { slug: "chesterfield", name: "Chesterfield", region: "stl", zips: "63017, 63005",
    intro: "Roofing and storm restoration across Chesterfield.",
    desc: "Roof replacement, repair, storm restoration and gutters in Chesterfield, MO — from established neighborhoods to newer estates near Chesterfield Valley. Licensed, insured, warrantied.",
    homes: "Chesterfield spans large subdivisions and newer suburban homes across the 63017 and 63005 areas, from established neighborhoods to newer estates near Chesterfield Valley.",
    angle: "Larger suburban roofs, real hail and wind exposure, and busy homeowners — so we make the process documented and easy." },
  { slug: "ballwin", name: "Ballwin", region: "stl", zips: "63011, 63021",
    intro: "Roof replacement and repair for Ballwin homes.",
    desc: "Roof replacement, repair and storm-damage help in Ballwin, MO — the ranch and two-story homes of a classic family suburb, many now due for a new roof. Licensed, insured, warrantied.",
    homes: "Ballwin is a classic family suburb of ranch and two-story homes built largely from the 1970s through the 1990s — many now reaching the age where the original roof is due for replacement.",
    angle: "That makes honest repair-vs-replace guidance especially valuable, and it's exactly what we lead with." },
  { slug: "wildwood", name: "Wildwood", region: "stl", zips: "63038, 63040",
    intro: "Roofing built for Wildwood's wooded, custom homes.",
    desc: "Roofing, storm restoration and gutters in Wildwood, MO — larger wooded lots and custom homes with steep rooflines, complex valleys and heavy tree cover. Licensed, insured, warrantied.",
    homes: "Wildwood's larger wooded lots and custom homes give far-west county a semi-rural feel, with plenty of homes carrying steep rooflines, complex valleys and heavy tree cover.",
    angle: "Tree cover means debris, gutter load and storm exposure — so flashing, ventilation and gutters get real attention here." },
  { slug: "ofallon", name: "O'Fallon", region: "stc", zips: "63366, 63368",
    intro: "Roofing and storm claims across O'Fallon.",
    desc: "Roof replacement, repair and storm-damage help in O'Fallon, MO — a fast-growing St. Charles County community whose first-generation roofs are now wearing out. Licensed, insured, warrantied.",
    homes: "O'Fallon is one of the fastest-growing communities in the metro, full of newer subdivisions across the 63366 and 63368 areas — homes now old enough that first-generation roofs are wearing out and storm claims are common.",
    angle: "We handle the roof and the paperwork: documented inspections and honest storm-claim support." },
  { slug: "st-charles", name: "St. Charles", region: "stc", zips: "63301, 63303",
    intro: "Roofing for St. Charles, from Main Street to the riverfront.",
    desc: "Roofing, repair, storm restoration and gutters in St. Charles, MO — historic Main Street and Frenchtown homes plus newer riverfront development. Licensed, insured, locally owned.",
    homes: "St. Charles pairs the historic homes of its famous Main Street and Frenchtown districts with newer development along the Missouri River — a wide range of roof types and ages.",
    angle: "Historic or new, we bring the right system and the right flashing details for the home." },
  { slug: "st-peters", name: "St. Peters", region: "stc", zips: "63376",
    photo: "/assets/images/areas/st-peters.webp",
    intro: "Roof replacement and repair for St. Peters.",
    desc: "Roof replacement, repair and storm-damage help in St. Peters, MO — a planned community whose growth-era roofs are now reaching replacement age. Licensed, insured, warrantied.",
    homes: "St. Peters is a planned suburban community of newer homes and subdivisions across the 63376 area, where roofs installed during the community's growth years are now reaching replacement age.",
    angle: "We give you a straight answer on whether it's time — backed by a documented inspection." }
];

// Service backlinks shown on each area page (construction/renovation added on the
// higher-end markets where it's most relevant).
function areaServices(premium) {
  const items = [
    `<a href="/roofing/roof-replacement/">Roof replacement</a> — a full, warrantied new system.`,
    `<a href="/roofing/roof-repair/">Roof repair</a> — leaks, wind damage, flashing and boots.`,
    `<a href="/roofing/storm-damage/">Storm &amp; hail restoration</a> — documented for your insurer.`,
    `<a href="/gutters-and-exteriors/">Gutters &amp; exteriors</a> — seamless gutters, fascia and soffit.`,
    `<a href="/roofing/free-inspection/">Free roof inspection</a> — photos you keep, no obligation.`
  ];
  if (premium) items.splice(4, 0, `<a href="/renovations/">Kitchen &amp; home renovation</a> — additions, kitchens and whole-home remodels.`);
  return items;
}

function countyName(region) { return region === "stc" ? "St. Charles County" : "St. Louis County"; }

function areaPage(a) {
  const url = `/service-areas/${a.slug}/`;
  const peers = AREAS.filter(x => x.region === a.region && x.slug !== a.slug && x.kind !== "county");
  let body;
  if (a.kind === "county") {
    body = [
      P(`Roofing &amp; exterior services across ${a.name}`, `${a.homes} ${a.angle}`),
      LIST(`Cities we serve in ${a.name}`, peers.map(x => `<a href="/service-areas/${x.slug}/">${x.name}, MO</a>`)),
      LIST("What we do", areaServices(true)),
      NOTE(`Don't see your community listed? We serve the greater St. Louis metro — call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> and we'll confirm we cover your neighborhood.`)
    ];
  } else {
    const nearby = peers.slice(0, 6).map(x => `<a href="/service-areas/${x.slug}/">${x.name}</a>`);
    nearby.push(`<a href="/service-areas/">All service areas</a>`);
    body = [
      P(`Roofing &amp; exterior services in ${a.name}`, `${a.homes} ${a.angle}`),
      LIST(`What we bring to ${a.name}`, areaServices(a.premium)),
      P("Local, licensed and documented", `Loxley Roofing and Construction is licensed, insured and locally owned in Kirkwood — minutes from ${a.name}. Every ${a.name} job starts with a free, documented inspection and a written scope in plain English, and every roof is backed by our 10-year transferable workmanship warranty.${a.premium ? " On higher-value homes especially, we protect the property throughout and keep the site orderly from the first day to the final walkthrough." : " We manage the site cleanly day to day and finish with a full magnetic nail-sweep."}`),
      LIST("Nearby areas we serve", nearby),
      FAQ([
        [`Do you offer free roof inspections in ${a.name}?`, "Yes — every inspection is free, documented with photos, and yours to keep with no obligation."],
        [`Can you help with a storm or insurance claim in ${a.name}?`, `Yes. After Missouri hail and wind we document the damage and walk the claim with you — see our <a href="/roofing/insurance-claims/">insurance claims guide</a>.`]
      ]),
      NOTE(`We add real ${a.name} project photos as jobs complete. In the meantime, call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> for a free, documented assessment.`)
    ];
  }
  return {
    url,
    title: `${a.name}, MO Roofing & Exterior Services`,
    description: a.desc,
    h1: `${a.name} Roofing & Exterior Services`,
    intro: a.intro,
    eyebrow: `Loxley Service Area · ${countyName(a.region)}`,
    areaServed: [`${a.name}, MO`],
    breadcrumb: [["Home", "/"], ["Service Areas", "/service-areas/"], [a.name, url]],
    ...(a.photo ? { heroImage: { src: a.photo, alt: `Aerial view of ${a.name}, Missouri` } } : {}),
    body: body.join("\n")
  };
}

function serviceAreasHub() {
  const link = x => `<a href="/service-areas/${x.slug}/">${x.name}, MO</a>`;
  const stlCities = AREAS.filter(x => x.region === "stl" && !x.kind);
  const stcCities = AREAS.filter(x => x.region === "stc" && !x.kind);
  return {
    url: "/service-areas/", title: "Service Areas — St. Louis Metro & St. Charles County",
    description: "Loxley Roofing and Construction serves St. Louis County and St. Charles County — Kirkwood, Clayton, Ladue, Webster Groves, Chesterfield, Ballwin, Wildwood, O'Fallon, St. Charles and more, plus the City of St. Louis.",
    h1: "Where We Work",
    intro: "Based in Kirkwood, serving St. Louis County, the City of St. Louis and St. Charles County — with a dedicated page and documented, warrantied work for each community.",
    breadcrumb: [["Home", "/"], ["Service Areas", "/service-areas/"]],
    body: [
      P("One local contractor, the whole metro", `Loxley Roofing and Construction is licensed, insured and headquartered in Kirkwood. We bring the same documented inspections, honest repair-vs-replace guidance, warrantied roofing, gutters, exteriors and <a href="/construction/">construction &amp; renovation</a> to homeowners across the region. Find your community below.`),
      LIST("St. Louis City &amp; County", [
        `<a href="/service-areas/st-louis-county/">St. Louis County (overview)</a>`,
        `<a href="/service-areas/st-louis/">City of St. Louis</a>`
      ].concat(stlCities.map(link))),
      LIST("St. Charles County", stcCities.map(link)),
      P("Don't see your town?", `We serve the greater St. Louis metro. Call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> or book a <a href="/roofing/free-inspection/">free inspection</a> and we'll confirm we cover your neighborhood.`)
    ].join("\n")
  };
}

/* ---------- pages ---------- */
const PAGES = [
  {
    url: "/roofing/", title: "Residential Roofing in St. Louis, MO",
    description: "Residential roofing across the St. Louis metro — new roofs, repairs and storm restoration installed as a complete system, documented at every step and backed by a 10-year transferable workmanship warranty.",
    h1: "Residential Roofing in St. Louis",
    intro: "New roofs, repairs, storm restoration and everything in between — installed as a complete system and documented at every step, for the home you actually live in.",
    body: [
      P("Your roof is a system, not just shingles", "Most people picture a roof as the shingles they can see. A roof that lasts is really six or seven layers working together — the deck, the ice-and-water shield, the underlayment, the flashing, the starter and field shingles, and the ventilation that lets the whole assembly breathe. We install and repair every one of those layers to spec, because a failure in any single one is what leads to leaks, premature aging and voided manufacturer warranties."),
      LIST("Residential roofing we do", [
        `<a href="/roofing/roof-replacement/">Full roof replacement</a> — a complete new system when repair no longer makes sense.`,
        `<a href="/roofing/roof-repair/">Roof repair</a> — leaks, wind-lifted shingles, flashing, valleys and pipe boots.`,
        `<a href="/roofing/storm-damage/">Storm &amp; hail restoration</a> — a documented response after Missouri weather.`,
        `<a href="/roofing/insurance-claims/">Insurance claim support</a> — we walk the process with you, start to finish.`,
        `<a href="/roofing/free-inspection/">Free roof inspections</a> — photographed, documented, and yours to keep.`
      ]),
      P("Repair or replace? An honest answer.", "Not every roof needs replacing, and we won't tell you it does when it doesn't. A newer roof with isolated damage is usually a repair. A roof near the end of its life — widespread granule loss, brittle or curling shingles, and more than one leak — is usually better replaced than patched again and again. We document the roof's real condition with photos and walk you through both options and their costs, so the decision is yours and it's made on evidence."),
      LIST("Signs it's worth a closer look", [
        "Shingles that are curling, cupping, cracked, or shedding granules (check your gutters for granule buildup)",
        "Ceiling or attic stains, damp insulation, or daylight showing through the roof deck",
        "Shingles lifted, creased or torn after a windstorm",
        "A roof that's 20+ years old, or that you know was layered over an older roof",
        "Rusted or lifting flashing around chimneys, valleys, skylights and vents"
      ]),
      P("Materials and details built for Missouri weather", "For most St. Louis homes we install architectural (dimensional) asphalt shingles — more wind- and impact-resistant, longer-lived and better-looking than the old three-tab style. But the parts that quietly decide how long a roof lasts sit underneath the shingles: a proper ice-and-water barrier at the eaves and valleys, quality synthetic underlayment, correctly detailed flashing at every transition, and balanced intake-and-exhaust ventilation so heat and moisture leave your attic instead of cooking the roof from below."),
      P("How we work — and what stands behind it", "Every job starts with a free, documented inspection and a written scope in plain English. We manage the site cleanly day to day, protect your landscaping, and finish with a full magnetic nail-sweep and a walkthrough with you. Our workmanship is backed by a 10-year transferable warranty on top of the manufacturer's material warranty — and because we're licensed, insured and locally owned in Kirkwood, the company that inspects your roof is the same one that stands behind it years later."),
      FAQ([
        ["How long does a roof replacement take?", "Most residential roofs are torn off and replaced in one to two days, weather permitting. We give you a realistic timeline for your specific home before we start."],
        [`Will insurance pay for my new roof?`, `If the damage is from a covered storm event, often yes. We document the damage and help you navigate the claim — see our <a href="/roofing/insurance-claims/">insurance claims guide</a>.`],
        ["Do you offer free estimates and inspections?", "Yes. Every inspection and estimate is free, documented with photos, and yours to keep with no obligation."],
        ["What warranty do you offer?", "Our workmanship is backed by a 10-year transferable warranty, in addition to the shingle manufacturer's material warranty."],
        ["Are you licensed and insured?", "Yes — licensed and fully insured, and locally owned in Kirkwood, MO."]
      ])
    ].join("\n")
  },
  {
    url: "/roofing/roof-replacement/", title: "Roof Replacement in St. Louis, MO",
    description: "Full roof replacement in St. Louis — architectural shingles, proper ventilation and flashing, and a 10-year transferable workmanship warranty.",
    h1: "Roof Replacement in St. Louis",
    intro: "When repair no longer makes sense, a properly installed new roof protects your home for decades.",
    body: [
      P("When a full replacement is the right call", "Replacement makes sense when repairs would only delay the inevitable — a roof near the end of its lifespan, widespread granule loss and brittleness, multiple leaks, or storm damage across the whole roof. A new roof installed correctly protects your home for decades and resets the clock on both the material and workmanship warranties. If a repair will genuinely get you there, we'll tell you that instead — replacement is a major investment and we only recommend it when it's the honest answer."),
      P("What a Loxley roof replacement actually includes", "A real replacement is a complete system, not just new shingles laid over the old problem. We tear off down to the deck so we can see and correct what's underneath, then rebuild every layer to spec:"),
      LIST("Every layer, rebuilt", [
        `<strong>Tear-off &amp; deck inspection</strong> — we strip the old roof and check the decking for soft spots, rot or damage, replacing what isn't sound.`,
        `<strong>Drip edge &amp; ice-and-water shield</strong> — metal edging plus a waterproof membrane at the eaves and valleys, where ice dams and wind-driven rain attack first.`,
        `<strong>Synthetic underlayment</strong> — a tough secondary water barrier across the entire deck.`,
        `<strong>Flashing</strong> — new or reconditioned flashing at chimneys, walls, valleys and every penetration, because that's where most leaks begin.`,
        `<strong>Starter &amp; architectural shingles</strong> — a sealed perimeter and impact-resistant dimensional shingles as the visible, weatherproof surface.`,
        `<strong>Ridge ventilation &amp; caps</strong> — balanced exhaust at the ridge so your attic breathes and the roof reaches its full lifespan.`
      ]),
      P("Tear-off vs. going over the old roof", "You'll sometimes be offered a cheaper 'overlay' — new shingles installed on top of the existing roof. We generally don't recommend it. An overlay hides deck damage you then can't see, traps heat, adds weight, and usually shortens the life of the new shingles and their warranty. A full tear-off costs a little more up front and gives you a roof that actually performs and lasts."),
      LIST("Our process, start to finish", [
        "Free, documented inspection and a written scope with your material and color options",
        "We schedule around the weather and protect your landscaping, siding and windows",
        "Tear-off, deck inspection and full system installation — usually one to two days",
        "Magnetic nail-sweep of your yard, full cleanup, and a walkthrough with you",
        "Warranty registration, so your coverage is on record"
      ]),
      P("What backs the work", "Your new roof is covered by the shingle manufacturer's material warranty and our 10-year transferable workmanship warranty — transferable, so it adds value if you sell. We're licensed, insured and locally owned in Kirkwood, so the same company that installs your roof is here to stand behind it."),
      FAQ([
        ["How much does a new roof cost?", "It depends on the size and pitch of your roof, the materials you choose, and what we find during tear-off. We give you a clear, itemized written quote after a free inspection — no vague ballparks and no surprises mid-job."],
        ["How long does it take?", "Most homes are done in one to two days, weather permitting. We give you a realistic schedule for your specific roof before we start."],
        ["Can you just go over my existing shingles?", "We generally recommend a full tear-off rather than an overlay, so we can inspect the deck and give you a roof that lasts. We'll explain why for your specific situation."],
        [`Will this be covered by insurance?`, `If the replacement is driven by covered storm damage, often yes. We document everything and can help with the claim — see our <a href="/roofing/insurance-claims/">insurance claims guide</a>.`],
        [`Do you offer financing?`, `We're working on financing options for larger projects — see <a href="/financing/">financing</a> or just ask us.`]
      ])
    ].join("\n")
  },
  {
    url: "/roofing/roof-repair/", title: "Roof Repair in St. Louis, MO",
    description: "Fast, lasting roof repair in the St. Louis metro — leaks, wind-lifted shingles, flashing, pipe boots and valleys, with a documented inspection first.",
    h1: "Roof Repair in St. Louis",
    intro: "Not every roof needs replacing. We find the real source of the problem and fix it right.",
    body: [
      P("Most roofs can be repaired — if you find the real problem", "A leak or a few missing shingles doesn't mean you need a new roof. The hard part usually isn't the fix; it's finding the actual source. Water rarely drips straight down from where it got in — it travels along the deck and rafters and shows up on your ceiling feet away from the real entry point. We track a leak back to its true source and fix that, so it doesn't return the next time it rains."),
      LIST("Common repairs we handle", [
        "Roof leaks and the water stains they leave on ceilings and in attics",
        "Wind-lifted, creased, cracked or missing shingles",
        "Failed or cracked pipe boots around plumbing vents — a very common leak source",
        "Damaged or lifting flashing at chimneys, walls, skylights and valleys",
        "Exposed or backed-out nails and worn, cracked sealant",
        "Storm and hail damage — often insurable, and we document it"
      ]),
      P("How we approach a repair", "We start with a documented inspection — up on the roof and in the attic where the evidence usually is — and photograph what we find. Then we show you the source, explain the fix, and tell you honestly whether a repair will hold or whether you'd be better off putting that money toward replacement. When a repair is the right move, we make it with materials that match your roof and workmanship that lasts."),
      P("When repair is enough — and when it isn't", "A younger roof with an isolated problem — a cracked boot, a wind-damaged section, a flashing failure — is a straightforward repair. But if your roof is near the end of its life, has widespread granule loss, or is leaking in several different spots, patching it again and again usually costs more over time than a replacement. We give you the honest math so you can decide."),
      LIST("What to do if your roof is leaking right now", [
        "Move valuables and put a bucket under any active drip",
        "If it's safe, note where the water is coming in from inside — a photo helps",
        "Don't climb onto a wet or damaged roof yourself",
        "Call us for a prompt, documented inspection — and keep receipts for any emergency steps like tarping"
      ]),
      FAQ([
        ["Do I need a whole new roof, or just a repair?", "Often just a repair. We find the real source, show you the evidence, and only recommend replacement when the roof's overall condition genuinely calls for it."],
        ["Why doesn't my ceiling stain line up with the roof damage?", "Because water travels. It runs along the deck and framing before it drips, so the stain is often well away from the actual entry point. Tracking that path is exactly what a proper inspection does."],
        ["Do you warranty repairs?", "Yes — our workmanship is backed by our warranty. We'll explain what's covered for your specific repair."],
        [`Is my repair covered by insurance?`, `If it's from a covered storm event, it may be. We document the damage so you have what you need — see our <a href="/roofing/insurance-claims/">insurance claims guide</a>.`],
        [`How fast can you come out?`, `Call us at <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> — we prioritize active leaks and get you a documented inspection quickly.`]
      ])
    ].join("\n")
  },
  {
    url: "/roofing/storm-damage/", title: "Storm Damage Roof Repair in St. Louis, MO",
    description: "Hail and wind damage in St. Louis? Get a free, documented storm inspection, know what to do in the first 48 hours, and get the evidence your insurer needs.",
    h1: "Storm Damage Roofing in St. Louis",
    intro: "Missouri storms are hard on roofs. A calm, documented response protects both your home and your claim.",
    ctaHeading: "Hit by a storm? Get a free, documented inspection.",
    body: [
      P("What hail and wind actually do to an asphalt roof",
        "Hail bruises a shingle — it fractures the mat and knocks away the protective granules that shield the asphalt from UV. The damage often isn't obvious from the ground, but those bruises shorten the roof's life and can void manufacturer coverage if left unaddressed.",
        "Wind lifts and creases shingles, breaks their factory seal, and tears at ridges, rakes and flashing. Once the seal is broken, the next storm drives water underneath. That's why a roof can look fine and still be failing."),
      LIST("What to do in the first 48 hours", [
        "Stay safe — don't climb the roof. Document what you can see from the ground.",
        "Photograph any interior water stains, fallen debris, and dented gutters, screens or A/C fins (good hail indicators).",
        "Call for a free, documented roof inspection before you file — so you know what you're dealing with.",
        "Keep receipts for any emergency measures (like tarping) you take to prevent further damage."
      ]),
      P("Why a documented inspection matters",
        "Insurance decisions are made on evidence. We photograph and mark test squares, chalk hail hits, and document wind and flashing damage in a report you keep — whether or not you hire us. That record is what turns a vague claim into an approved one."),
      LIST("What Loxley provides to your adjuster", [
        "A dated, photo-documented damage report with test squares",
        "Clear notes on hail density, wind damage, and code-required items",
        "A professional scope so nothing legitimate gets missed",
        "A meeting on-site with the adjuster when it helps your claim"
      ]),
      FAQ([
        ["Should I file a claim before or after an inspection?", "Get a free inspection first. You'll know whether you have real, claimable damage before you put anything on your record."],
        ["Will you meet my insurance adjuster on the roof?", "Yes. Having a roofer present who can point out and document damage often makes the difference on scope."],
        ["Do I have to use you if you inspect it?", "No. The inspection and the photo report are free and yours to keep, no obligation."]
      ]),
      NOTE("Real St. Louis-area storm photos (before/after) are being added to this page.")
    ].join("\n")
  },
  {
    url: "/roofing/insurance-claims/", title: "Roof Insurance Claims Help in St. Louis, MO",
    description: "A plain-English guide to roof insurance claims in Missouri — filing, the adjuster meeting, scope, supplements, depreciation and your deductible.",
    h1: "Roof Insurance Claims, Explained",
    intro: "The claim process frightens most homeowners. It shouldn't. Here's how it actually works — and how we help.",
    ctaHeading: "Have storm damage? Let's walk the claim together.",
    body: [
      P("The claim, start to finish",
        "Most roof claims follow the same path: you file, an adjuster inspects, the carrier issues a scope and a first check, the work is done, and a final check releases the rest. The two places homeowners lose money are scope disagreements and depreciation — and both are manageable when someone explains them."),
      LIST("The lifecycle in plain English", [
        "<strong>Filing:</strong> report the date of loss and request an inspection. We can document damage first so you file with confidence.",
        "<strong>Adjuster meeting:</strong> the carrier's adjuster inspects. We meet them on-site to point out and document all legitimate damage.",
        "<strong>Scope &amp; disagreements:</strong> if the adjuster misses items, we submit photos and documentation to correct the scope.",
        "<strong>Supplements:</strong> code-required or overlooked items (like proper flashing or ventilation) are added as supplements.",
        "<strong>Depreciation &amp; recoverable depreciation:</strong> carriers hold back 'depreciation' initially and release it after the work is completed and invoiced — that's the recoverable portion.",
        "<strong>Deductible:</strong> you are responsible for your deductible. Be cautious of anyone who offers to 'waive' it — in Missouri that's not something a contractor can legitimately do."
      ]),
      P("How Loxley helps",
        "We don't just install the roof — we make the paperwork make sense. We document the damage, meet the adjuster, prepare supplements for anything legitimate that was missed, and keep the recoverable depreciation on track so you collect what your policy owes."),
      FAQ([
        ["What is recoverable depreciation?", "It's the amount your insurer holds back at first and pays out after the work is finished and invoiced. Done right, you receive it."],
        ["Can a contractor pay or waive my deductible?", "No. Your deductible is your responsibility, and offers to waive it are a red flag. We keep everything above board."],
        ["What if the adjuster's scope is too low?", "We submit photo documentation and a professional scope to request a fair, code-compliant revision."]
      ]),
      NOTE("This page is educational and not legal or insurance advice. Your policy and Missouri law govern your claim.")
    ].join("\n")
  },
  {
    url: "/roofing/free-inspection/", title: "Free Roof Inspection in St. Louis, MO",
    description: "Book a free, no-obligation roof inspection in the St. Louis metro. You get dated photos and an honest assessment you keep — whether or not you hire us.",
    h1: "Free Roof Inspection",
    intro: "A documented look at your roof, with photos you keep and zero pressure.",
    ctaHeading: "Book your free, documented roof inspection",
    body: [
      P("What a free Loxley inspection actually includes", "This isn't a sales visit dressed up as an inspection. We do a genuine, top-to-bottom assessment of your roof and its system, document what we find with photos, and hand you a clear picture of your roof's condition — whether or not you ever hire us. You keep the report either way."),
      LIST("What we check", [
        "Shingles — wear, granule loss, curling, cracking, and wind or hail damage",
        "Flashing at chimneys, walls, valleys, skylights and every penetration",
        "Pipe boots, vents and seals — common, easily-missed leak sources",
        "Gutters, drip edge and the roof-to-edge transition",
        "Attic and decking signs where accessible — stains, daylight, moisture and ventilation",
        "Overall system condition, so you know roughly how much life the roof has left"
      ]),
      P("What you walk away with", "A documented, photo-backed summary of your roof's condition, an honest assessment of whether you need nothing, a repair, or a replacement, and clear answers to your questions. No pressure, no obligation and no scare tactics — just the facts about your roof, so you can make a good decision on your own timeline."),
      P("Why a documented inspection is worth having", "Even if your roof is fine, a dated photo record is valuable. It's the evidence that turns a vague storm claim into an approved one, it helps when you're buying or selling a home, and it gives you a baseline to compare against after the next big Missouri storm. Catching a small issue early — a cracked boot, a lifted shingle — is also far cheaper than repairing the water damage it would otherwise cause."),
      LIST("Good times to get one", [
        "After a hail or wind storm — even if you see no obvious damage from the ground",
        "Before buying or selling a home",
        "If your roof is 15+ years old and has never been assessed",
        "When you spot a stain, a leak, or shingles in the yard",
        "Every couple of years as routine maintenance"
      ]),
      FAQ([
        ["Is the inspection really free?", "Yes — free, with no obligation. You keep the photo report whether or not you hire us."],
        ["Will you pressure me to buy a new roof?", "No. We tell you what your roof actually needs, even when that's 'nothing yet.' Our reputation depends on straight answers, not scare tactics."],
        ["How long does it take?", "Usually under an hour for a typical home, depending on size and access."],
        ["Do I need to be home?", "It helps, so we can walk you through what we find and answer questions — but we can also document the roof and follow up with you."],
        [`What if you find damage?`, `We show you the photos, explain your options — repair or replacement — and if it's storm-related, we help you document it for a possible <a href="/roofing/insurance-claims/">insurance claim</a>. The next step is always your call.`]
      ])
    ].join("\n")
  },
  {
    url: "/roofing/roofing-systems/", title: "How a Roof Is Installed — 7 Stages | St. Louis",
    description: "See how Loxley installs a roof in the St. Louis metro — inspection, tear-off, ice & water shield, drip edge, shingles, ridge vent and final cleanup, stage by stage.",
    h1: "How We Install a Roof",
    intro: "Scroll through the seven stages of a Loxley roof replacement — built for the home you already have.",
    fullWidth: true,
    scripts: ["/js/roofing-systems.js"],
    body: [
      systemsScroller(),
      `      <div class="page-body">
${LIST("What each stage protects", [
        "Inspection &amp; documentation — the record behind every decision",
        "Tear-off &amp; deck inspection — a sound surface to build on",
        "Ice &amp; water shield + underlayment — the waterproofing layer",
        "Drip edge &amp; starter — a locked-down, sealed perimeter",
        "Field shingles &amp; flashing — the visible, weatherproof surface",
        "Ridge vent &amp; caps — balanced ventilation for a longer-lasting roof",
        "Final inspection &amp; cleanup — verified, warrantied, and swept clean"
      ])}
      </div>`
    ].join("\n")
  },
  {
    url: "/commercial-roofing/", title: "Commercial Roofing in St. Louis, MO",
    description: "Commercial and flat-roof systems for St. Louis-area businesses — installation, repair and maintenance from a licensed, locally owned contractor.",
    h1: "Commercial Roofing in St. Louis",
    intro: "Low-slope and flat-roof systems installed, repaired and maintained to keep your business dry, open and on schedule.",
    heroVideo: { mp4: "/assets/video/commercial-roofing.mp4", poster: "/assets/video/commercial-roofing-poster.jpg" },
    body: [
      P("A commercial roof is a different discipline", "A commercial roof is not just a bigger house roof. Most commercial and industrial buildings have low-slope or flat roofs that shed water slowly, carry rooftop equipment and foot traffic, and fail in completely different ways than a steep residential roof. Getting the membrane, the seams, the flashing details and the drainage right is what keeps your business open and your inventory dry — so we approach every commercial roof as a system engineered for that specific building, its traffic and its budget."),
      LIST("Commercial systems we work with", [
        `<strong>TPO</strong> — a single-ply thermoplastic membrane; reflective, energy-efficient and a popular choice for low-slope roofs.`,
        `<strong>EPDM</strong> — a durable synthetic-rubber membrane with a long, proven track record on flat roofs.`,
        `<strong>Modified bitumen</strong> — multi-ply asphalt-based systems well suited to roofs that see regular foot traffic.`,
        `<strong>Standing-seam metal</strong> — long-service-life metal systems for the right slope and building.`,
        `<strong>Coatings &amp; restoration</strong> — restoring a sound existing roof to add years of life without a full tear-off.`
      ]),
      P("The details that decide whether a flat roof lasts", "On a low-slope roof, water doesn't run off — it sits and looks for the weakest point. That makes the parts you can't see from the ground the ones that matter most: adequate slope to the drains, watertight seams, correctly detailed flashing at parapets, curbs and penetrations, and sound edge metal. A commercial leak rarely starts in the open field of the roof; it starts at a detail. We inspect and document all of them, then fix the actual source instead of chasing stains."),
      LIST("What we handle for commercial clients", [
        "New installation and full replacement of low-slope and flat roofs",
        "Leak diagnosis and targeted repair — finding the real source, not just the stain",
        "Preventive maintenance programs that catch small problems before they close your doors",
        "Flashing, drainage, curb and rooftop-penetration detailing",
        "Storm and hail damage assessment, documented for your insurer",
        "Scheduling around your operating hours to minimize disruption"
      ]),
      P("Built around your business, documented for your records", "We know a commercial roof decision usually involves budgets, boards and building managers. So we document what we find with photos, explain repair-versus-restore-versus-replace in plain terms, and hand you a clear scope you can actually act on. Our work is backed by our 10-year transferable workmanship warranty, and we're licensed, insured and locally owned in the St. Louis metro."),
      FAQ([
        ["Can you work around our business hours?", "Yes. We schedule and stage the work to keep your operation running and your entrances safe, and we keep the site clean at the end of each day."],
        ["Do we need a full replacement, or can the roof be repaired or restored?", "It depends on the membrane's age and condition. We inspect and document the roof first, then give you an honest repair, restoration or replacement recommendation — we don't default to the most expensive option."],
        [`Do you handle commercial storm and hail claims?`, `Yes. We document the damage, provide the photos and scope your insurer needs, and can meet the adjuster on site. See our <a href="/roofing/insurance-claims/">insurance claims guide</a>.`],
        ["Are you licensed and insured for commercial work?", "Yes — licensed and fully insured, and locally owned in Kirkwood, MO."]
      ]),
      NOTE(`Commercial project photos and references are being added. Call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> to discuss your building and get a documented assessment.`)
    ].join("\n")
  },
  {
    url: "/gutters-and-exteriors/", title: "Gutters & Exteriors in St. Louis, MO",
    description: "Seamless gutters, downspouts, fascia, soffit and exterior work across the St. Louis metro — protecting your roof system from the edge down.",
    h1: "Gutters & Exteriors",
    intro: "Your roof ends at the edge — seamless gutters, downspouts, fascia and soffit carry the water the rest of the way, away from your home.",
    heroVideo: { mp4: "/assets/video/gutters-and-exteriors.mp4", poster: "/assets/video/gutters-and-exteriors-poster.jpg" },
    body: [
      P("Where your roof ends, your gutters take over", "A roof can be flawless and a home can still take on water damage if that water isn't carried away from the house. Gutters, downspouts, fascia and soffit are the system that moves thousands of gallons of roof runoff away from your foundation, siding and landscaping every year. As roofers, we treat the edge of your roof and your gutter system as one continuous path for water — because that is exactly what it is."),
      LIST("What we install and service", [
        `<strong>Seamless gutters</strong> — custom-formed on site to the exact length of each run, so there are far fewer joints to ever leak.`,
        `<strong>Downspouts &amp; extensions</strong> — sized and placed to carry water well clear of the foundation.`,
        `<strong>Gutter guards</strong> — to cut down on leaf-and-debris clogs and the ladder work that comes with them.`,
        `<strong>Fascia &amp; soffit</strong> — the boards and ventilated panels at the roof edge that protect the structure and keep the attic breathing.`,
        `<strong>Exterior trim &amp; wood repair</strong> — replacing rotted edge boards uncovered during roof and gutter work.`
      ]),
      P("Why seamless — and why sizing matters", "Sectional gutters from a store are joined every few feet, and every joint is a future leak. Seamless gutters are formed from a continuous coil to fit your home, so the only seams are at corners and outlets. Just as important is capacity: undersized gutters, or too few downspouts, overflow in exactly the heavy Missouri downpours when you need them working. We size the whole system to your roof's area and pitch so it actually keeps up."),
      P("The connection most contractors miss", "Fascia and soffit sit right where the roof, the gutters and the attic all meet. Rotted fascia won't hold gutters securely, and blocked or damaged soffit vents choke the attic ventilation that protects your shingles from the inside out. Because we're roofers first, we see these as one system — we won't hang new gutters on failing boards, or seal up soffit that your roof needs for airflow."),
      LIST("Our process", [
        "A free inspection of your gutters, fascia, soffit and roof edge — documented with photos you keep",
        "Honest recommendations: clean and repair where that's genuinely enough, replace where it isn't",
        "On-site forming and installation of seamless gutters sized to your home",
        "Full cleanup and a walkthrough, so you can see the water path works from roof to ground"
      ]),
      FAQ([
        ["What size gutters do I need?", "It depends on your roof's area and pitch and how the runs drain. We size the gutters and downspouts to handle heavy rain for your specific roof, instead of installing a one-size default."],
        ["Are gutter guards worth it?", "For homes under trees, good guards meaningfully cut down on clogs and dangerous ladder work. We'll tell you honestly whether they make sense for your property rather than upselling them by default."],
        ["Can you replace rotted fascia and soffit?", "Yes. We repair or replace damaged fascia and soffit as part of the job, so your new gutters mount on sound wood and your attic keeps the ventilation it needs."],
        ["Do you offer free inspections?", "Yes — every inspection is free, documented with photos, and yours to keep with no obligation."]
      ]),
      NOTE(`Real photos of our gutter and exterior work are being added. Call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> for a free, documented assessment.`)
    ].join("\n")
  },
  {
    url: "/construction/", title: "Construction in St. Louis — Ground to Finish",
    description: "See a St. Louis home come together ground to finish — site prep, foundation, framing, roofing, envelope, mechanicals and interior finishes — the Loxley construction standard.",
    h1: "From the Ground Up",
    intro: "The same planning, documentation and standards we bring to roofing, applied to the whole build. Scroll the sequence, stage by stage.",
    fullWidth: true,
    scripts: ["/js/construction-sequence.js"],
    body: [
      constructionSequence(),
      `      <div class="page-body">
${P("Built as a system, documented at every stage", "From the first survey stake to the final trim, each phase is planned, sequenced and inspected before the next one covers it. That's how you get a home that performs — not just one that looks finished.")}
${LIST("What each phase covers", [
        "Site preparation — grading, access, drainage and layout",
        "Foundation — footings, walls, waterproofing and drainage",
        "Floor system — engineered joists, beams and subfloor",
        "Framing — walls, roof geometry and load paths",
        "Roofing system — deck, underlayment, flashing, shingles and ventilation",
        "Exterior envelope — windows, brick and siding",
        "Mechanical rough-in — plumbing, electrical and HVAC, inspected",
        "Insulation &amp; drywall — comfort and efficiency",
        "Interior finishes — cabinetry, stone, flooring and trim"
      ])}
${NOTE("The images above are rendered illustrations of the construction process, shown to explain how a build progresses — not a specific completed project. Real Loxley project photos live on <a href=\"/our-work/\">Our Work</a>.")}
      </div>`
    ].join("\n")
  },
  {
    url: "/renovations/", title: "Kitchen & Home Renovation in St. Louis, MO",
    description: "Kitchen, bath and whole-home renovation across the St. Louis metro from Loxley Roofing and Construction — one licensed, insured, documented team from design to final walkthrough.",
    h1: "Kitchen & Home Renovation",
    eyebrow: "Loxley Construction & Renovation",
    intro: "Kitchens, baths and whole-home remodels — planned, documented and built to last by the same team that protects your roof.",
    ctaHeading: "Planning a kitchen or home renovation? Let's talk.",
    body: [
      P("Renovation, done like a build — not a gamble", "A great renovation lives or dies on what happens behind the finishes: the framing, the plumbing and electrical, the waterproofing, and the sequencing that keeps it all on schedule. We approach kitchens, baths and whole-home remodels the same way we approach a roof or a new build — as a documented system, planned before the first wall comes down — so you get a beautiful result that's sound underneath, not just on the surface."),
      LIST("What we renovate", [
        `<strong>Kitchens</strong> — layout, cabinetry, countertops, islands, lighting, and the plumbing and electrical behind them.`,
        `<strong>Bathrooms</strong> — from refreshes to full gut renovations with proper waterproofing.`,
        `<strong>Whole-home &amp; rehab</strong> — dated or distressed homes brought back to life, room by room or all at once.`,
        `<strong>Additions &amp; bump-outs</strong> — more space, tied cleanly into the existing structure and roofline.`,
        `<strong>Basements &amp; finished spaces</strong> — turning unused square footage into real living space.`,
        `<strong>Interior &amp; exterior updates</strong> — flooring, trim, doors, windows and the exterior envelope.`
      ]),
      P("One team, from the first drawing to the last coat of paint", "Because we're a construction company, your project isn't handed off between a dozen strangers. We handle the structural work, coordinate the trades, and manage the schedule and the site — so there's one accountable team, one point of contact, and one standard from demolition to the final walkthrough. And when a renovation touches the roof, gutters or exterior, that's already our core trade."),
      LIST("How a Loxley renovation runs", [
        `<strong>Consultation &amp; scope</strong> — we walk the space, learn how you live, and put together a clear, written scope.`,
        `<strong>Design &amp; selections</strong> — layout and finishes decided before work starts, so there are no mid-project surprises.`,
        `<strong>Demolition &amp; the hidden work</strong> — we open things up and address framing, plumbing, electrical and waterproofing properly.`,
        `<strong>Build &amp; finish</strong> — cabinetry, surfaces, tile, trim and paint, installed to a high standard.`,
        `<strong>Walkthrough &amp; punch list</strong> — we review every detail with you, and it isn't done until you say it is.`
      ]),
      P("Built for the homes that expect more", `We renovate across the St. Louis metro, and this work is especially suited to the high-standard homes of <a href="/service-areas/clayton/">Clayton</a>, <a href="/service-areas/ladue/">Ladue</a>, <a href="/service-areas/town-and-country/">Town &amp; Country</a> and <a href="/service-areas/des-peres/">Des Peres</a> — where clean, documented, property-protective work isn't optional. We treat your home like someone's going to live in it the day after we leave, because they are.`),
      FAQ([
        ["Do you handle the whole project, or just part of it?", "The whole project. We manage the structural work, the trades, the schedule and the site as one team, so you have a single point of accountability from start to finish."],
        ["Can you do just a kitchen or bath without a full-home remodel?", "Absolutely — a single kitchen or bathroom is a common project for us, and we handle the plumbing, electrical and waterproofing behind it, not just the visible finishes."],
        [`Do you also handle the roof, gutters and exterior?`, `Yes. A renovation is a natural time to address the <a href="/roofing/">roof</a>, <a href="/gutters-and-exteriors/">gutters and exterior</a> — and that's our core trade, so it's all under one roof.`],
        ["Are you licensed and insured for this work?", "Yes — licensed and fully insured, and locally owned in Kirkwood, MO."],
        ["How do you keep a renovation on schedule and on budget?", "With a written scope and finish selections made up front, plus documented daily management. Deciding the details before demolition is what prevents the delays and change-order surprises renovations are known for."]
      ]),
      NOTE(`We're building out a gallery of completed Loxley renovation projects. In the meantime, call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> or request a <a href="/contact/">consultation</a> to talk through your kitchen or home renovation.`)
    ].join("\n")
  },
  {
    url: "/our-work/", title: "Our Work — St. Louis Roofing Projects",
    description: "Real Loxley Roofing and Construction projects across the St. Louis metro — before and after, by neighborhood and roof system.",
    h1: "Our Work",
    intro: "Real roofs, real neighborhoods. Here's the standard, applied.",
    body: [
      NOTE("This gallery will feature real Loxley job photography — before/after pairs with the suburb, the roof system installed, and the timeframe. We're gathering job photos now; the AI-rendered illustrations used elsewhere on the site are never presented here as completed projects.")
    ].join("\n")
  },
  {
    url: "/reviews/", title: "Reviews — Loxley Roofing and Construction",
    description: "See what St. Louis-area homeowners say about Loxley Roofing and Construction — 4.9 stars on Google.",
    h1: "Reviews",
    intro: "Rated 4.9 on Google by St. Louis-area homeowners.",
    body: [
      `      <section class="prose"><p><a class="btn btn-ghost" href="${BIZ.gbp}" target="_blank" rel="noopener noreferrer">Read our reviews on Google →</a></p></section>`,
      NOTE("Selected review quotes will be featured here. We only publish real reviews — no invented testimonials.")
    ].join("\n")
  },
  {
    url: "/about/", title: "About — Loxley Roofing and Construction",
    description: "Loxley Roofing and Construction is a licensed, locally owned roofing and exterior contractor in Kirkwood, MO. See the anatomy of a better build — how we build and roof as one complete system.",
    h1: "About Loxley",
    intro: "Locally owned in Kirkwood, MO — built on documentation, communication and long-term protection.",
    fullWidth: true,
    scripts: ["/js/anatomy.js"],
    body: [
      `      <div class="page-body">
${P("Who we are", "Loxley Roofing and Construction is a licensed, insured, locally owned contractor based in Kirkwood, Missouri. We serve homeowners and businesses across the St. Louis metro and St. Charles County with roofing, storm restoration, gutters and exterior construction.")}
${P("How we work", "We treat every property as a complete system and we document everything — so you always know what we found, what we recommend, and why. Our construction knowledge informs our roofing, and our roofing precision informs everything else. The walkthrough below is how we think about a build, layer by layer.")}
      </div>`,
      anatomyWalkthrough(),
      `      <div class="page-body">
${P("Why the anatomy matters", "A roof — or a home — is only as good as the layers you can't see once it's finished. Sequencing each stage correctly, inspecting it before the next one covers it, and documenting the whole thing is what separates work that lasts from work that just looks finished on day one. That's the standard we hold on every project.")}
${NOTE("The stages above are rendered illustrations used to explain how a build comes together — not photos of a specific completed project. Real Loxley project photography lives on <a href=\"/our-work/\">Our Work</a>.")}
      </div>`
    ].join("\n")
  },
  serviceAreasHub(),
  ...AREAS.map(areaPage),
  {
    url: "/financing/", title: "Roof Financing in St. Louis, MO",
    description: "Flexible payment options for your roof are coming to Loxley Roofing and Construction. Ask us about financing for your St. Louis-area roofing project.",
    h1: "Roofing & Financing Options",
    intro: "A new roof is a big investment — we're working to make it easier to pay for.",
    body: [
      NOTE("Financing partners are being finalized. Once a lender is signed, this page will show real terms and an application link. In the meantime, call us to discuss options for your project.")
    ].join("\n")
  },
  {
    url: "/contact/", title: "Contact — Free Roof Inspection in St. Louis",
    description: "Contact Loxley Roofing and Construction for a free, no-obligation roof inspection in the St. Louis metro and St. Charles County. Call (314) 906-6915.",
    h1: "Let's take a closer look at your roof.",
    intro: "Free, no-obligation inspections across the St. Louis metro and St. Charles County.",
    scripts: ["/js/form.js"],
    body: [
      `      <section class="prose">
        <h2>Talk to Loxley</h2>
        <p>Call <a href="tel:${BIZ.phone}">${BIZ.phoneDisplay}</a> or email <a href="mailto:${BIZ.email}">${BIZ.email}</a>. We'll document your roof, explain your options in plain English, and give you a clear path forward — no pressure.</p>
        <p><strong>${BIZ.name}</strong><br>${BIZ.street}, ${BIZ.city}, ${BIZ.region} ${BIZ.zip}<br>Mon–Fri: 7:00&nbsp;AM – 5:00&nbsp;PM</p>
      </section>`,
      contactForm()
    ].join("\n")
  },
  {
    url: "/home-services/", title: "Home Services — Coming Soon | St. Louis",
    description: "Loxley Roofing and Construction is expanding into home services for the St. Louis metro. See what's available today and what's coming.",
    h1: "More of Your Home, One Trusted Team",
    intro: "We're expanding beyond the roof — carefully, and only when we can do it to the Loxley standard.",
    body: [
      P("Available today", "Roofing, storm restoration, gutters and exterior construction are fully available now across the St. Louis metro and St. Charles County."),
      P("Coming soon", "We're building out HVAC, plumbing and electrical so more of your home can be handled by one licensed, documented, warranty-backed team. Each trade goes on the site only once we can actually answer the call — an emergency we can't service helps no one."),
      NOTE("Want to know the moment a new trade goes live? Call us or reach out through the contact page."),
      FAQ([
        ["Can I book HVAC, plumbing or electrical now?", "Not yet — those trades are in build-out. Roofing and exteriors are fully available today."],
        ["Will it be the same team?", "Same company, same standards: licensed, insured, documented and warranty-backed."]
      ])
    ].join("\n")
  },
  {
    url: "/holiday-lighting/", title: "Holiday Lighting in St. Louis, Installed by Roofers",
    description: "Professional Christmas & holiday light installation across the St. Louis metro — designed, installed, maintained, taken down and stored by roofers who warranty your roof.",
    h1: "Holiday Lighting, Installed by Roofers",
    eyebrow: "Loxley Holiday Lighting · St. Louis",
    intro: "We're the roofers. We're not going to hurt your roof — we warranty it. Let us light your home for the holidays, start to finish.",
    heroVideo: { mp4: "/assets/video/holiday-lights.mp4", poster: "/assets/video/holiday-lights-poster.jpg" },
    ctaHeading: "Book your holiday lighting design consult",
    body: [
      P("Professional, worry-free holiday lighting", "We design, measure, custom-cut, install, maintain, take down and store your holiday lights — so your home looks incredible and you never touch a ladder. Because we're roofers first, your roof is in the safest possible hands."),
      LIST("What's included", [
        "A free design consult and custom measurement",
        "Commercial-grade lights, custom-cut to your rooflines",
        "Professional installation with no fasteners in your roof",
        "Season-long maintenance (Stay-Lit)",
        "Takedown, labeling and storage after the season"
      ]),
      guarantees(),
      P("Book early — the calendar fills fast", "Installations run on a first-come schedule. Early-bird pricing ends October 15, and the booking window closes in mid-November. Reserve your spot now to guarantee your install date."),
      LIST("Explore holiday lighting", [
        "<a href=\"/holiday-lighting/how-it-works/\">How it works</a>",
        "<a href=\"/holiday-lighting/pricing/\">Pricing &amp; packages</a>",
        "<a href=\"/holiday-lighting/gallery/\">Gallery</a>"
      ])
    ].join("\n")
  },
  {
    url: "/holiday-lighting/how-it-works/", title: "How Our Holiday Lighting Works | St. Louis",
    description: "From free design consult to takedown and storage — here's how Loxley's professional holiday lighting service works in the St. Louis metro.",
    h1: "How It Works",
    eyebrow: "Loxley Holiday Lighting",
    intro: "Five steps, and zero ladders for you.",
    body: [
      LIST("The process", [
        "<strong>Free design consult</strong> — we walk your home and design a display you love.",
        "<strong>Custom measure &amp; cut</strong> — commercial-grade lights cut to your exact rooflines.",
        "<strong>Professional install</strong> — no staples, nails or screws in your roof (No-Fastener Guarantee).",
        "<strong>Season-long maintenance</strong> — a bulb goes out, we fix it (Stay-Lit Guarantee).",
        "<strong>Takedown &amp; storage</strong> — we remove, label and store everything for next year (Takedown Guarantee)."
      ]),
      guarantees(),
      NOTE("Timeline detail and add-ons (trees, bushes, wreaths, garland) will be finalized from the Holiday Lighting Division Plan.")
    ].join("\n")
  },
  {
    url: "/holiday-lighting/pricing/", title: "Holiday Lighting Pricing & Packages | St. Louis",
    description: "Holiday lighting packages for St. Louis-area homes — roofline, roofline plus landscape, and full displays. Early-bird pricing ends October 15.",
    h1: "Pricing & Packages",
    eyebrow: "Loxley Holiday Lighting",
    intro: "Simple packages — all fully installed, maintained, taken down and stored.",
    ctaHeading: "Lock in early-bird pricing before October 15",
    body: [
      `      <section class="prose"><div class="price-grid">
        <div class="price-card"><h3>Roofline</h3><p>Clean, classic lights along your primary rooflines and peaks.</p><p class="price-figure">Custom quote</p></div>
        <div class="price-card price-featured"><h3>Roofline + Landscape</h3><p>Rooflines plus wrapped trees, bushes and walkway accents.</p><p class="price-figure">Custom quote</p></div>
        <div class="price-card"><h3>Full Display</h3><p>The whole home — rooflines, landscape, wreaths, garland and more.</p><p class="price-figure">Custom quote</p></div>
      </div></section>`,
      P("What every package includes", "Design, commercial-grade lights custom-cut to your home, professional installation, season-long maintenance, and takedown with storage — all covered by our three guarantees."),
      guarantees(),
      NOTE("Exact package prices and early-bird amounts come from the Holiday Lighting Division Plan — the structure is built; the figures are left for you to confirm. Early-bird pricing ends October 15; booking closes mid-November.")
    ].join("\n")
  },
  {
    url: "/holiday-lighting/gallery/", title: "Holiday Lighting Gallery | St. Louis",
    description: "See Loxley's professional holiday lighting installations across the St. Louis metro.",
    h1: "Holiday Lighting Gallery",
    eyebrow: "Loxley Holiday Lighting",
    intro: "Real homes, professionally lit.",
    body: [
      NOTE("Photos of completed Loxley holiday lighting installs will be featured here. We only show real work — add photos once the first installs are done.")
    ].join("\n")
  }
];

/* ---------- write ---------- */
let written = 0;
for (const page of PAGES) {
  const dir = path.join(ROOT, page.url.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), layout(page));
  written++;
}

/* sitemap.xml (homepage + all routes + privacy) */
const urls = ["/", ...PAGES.map(p => p.url), "/privacy-policy.html"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><changefreq>monthly</changefreq></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);

/* Apply the same content-hash cache-busting to the hand-built homepage so a
   CSS/JS change is never stuck behind a stale cache there either. Rewrites the
   ?v= token on every local css/js reference (leaves inline scripts and the
   three-module importmap alone). */
// Hand-built standalone pages (not generated from PAGES). We keep them in sync
// with the shared partials: cache-bust their css/js URLs, and regenerate the
// FOOTER:START/END region from footer() so their footer can never drift from
// the generated pages.
let patched = 0;
for (const file of ["index.html", "privacy-policy.html"]) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  const before = fs.readFileSync(p, "utf8");
  let after = before.replace(
    /(href|src)="((?:\/)?(?:css|js)\/[^"?#]+\.(?:css|js))(?:\?[^"#]*)?"/g,
    (_m, attr, url) => `${attr}="${url}?v=${assetHash(url)}"`
  );
  after = after.replace(
    /<!-- FOOTER:START[\s\S]*?FOOTER:END -->/,
    () => `<!-- FOOTER:START — generated from footer() in build.mjs; edit it there, not here -->\n${footer()}\n  <!-- FOOTER:END -->`
  );
  if (after !== before) { fs.writeFileSync(p, after); patched++; }
}

console.log(`Generated ${written} route pages + sitemap.xml (${urls.length} URLs). Synced ${patched} standalone page(s).`);
