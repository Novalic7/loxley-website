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
  ["/roofing/", "Roofing"],
  ["/holiday-lighting/", "Holiday Lighting"],
  ["/our-work/", "Our Work"],
  ["/service-areas/", "Service Areas"],
  ["/about/", "About"],
  ["/contact/", "Contact"]
];

// Roofing, commercial roofing and gutters/exteriors are one trade, so they live
// under a single "Roofing" dropdown instead of three top-level tabs. The menu is
// kept deliberately short — three clear choices. Each destination page stays a
// full, separate page (and ranks for its own keyword); the deeper roofing pages
// (repair, storm, insurance, inspection) are reached from the Residential hub.
const roofingMenu = [
  ["/roofing/", "Residential"],
  ["/commercial-roofing/", "Commercial"],
  ["/gutters-and-exteriors/", "Exteriors & Gutters"]
];
const ROOFING_PATHS = ["/roofing/", "/commercial-roofing/", "/gutters-and-exteriors/"];

function header(page) {
  const url = (page && page.url) || "/";
  const isActive = (h) => h === "/" ? url === "/" : url.startsWith(h);
  const roofingActive = ROOFING_PATHS.some((p) => url.startsWith(p));
  const navHtml = nav.map(([h, t]) => {
    if (h === "/roofing/") {
      return `<div class="nav-dd" data-nav-dd>
          <button type="button" class="nav-dd-toggle${roofingActive ? " is-active" : ""}" aria-expanded="false" aria-haspopup="true" aria-controls="nav-roofing-menu">${t} <span class="nav-caret" aria-hidden="true">▾</span></button>
          <div class="nav-dd-menu" id="nav-roofing-menu" role="menu">
${roofingMenu.map(([mh, mt]) => `            <a href="${mh}" role="menuitem"${url.startsWith(mh) ? ' class="is-active"' : ""}>${mt}</a>`).join("\n")}
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
          <p class="footer-col-title">Roofing</p>
          <a href="/roofing/roof-replacement/">Roof Replacement</a>
          <a href="/roofing/roof-repair/">Roof Repair</a>
          <a href="/roofing/storm-damage/">Storm Damage</a>
          <a href="/roofing/insurance-claims/">Insurance Claims</a>
          <a href="/commercial-roofing/">Commercial Roofing</a>
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
      <p>© ${y} ${BIZ.name}. All rights reserved.</p>
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
    "areaServed": ["St. Louis, MO", "St. Charles County, MO", "Kirkwood, MO", "Chesterfield, MO", "Webster Groves, MO", "Ballwin, MO", "Wildwood, MO", "O'Fallon, MO"],
    "openingHours": "Mo-Fr 07:00-17:00",
    "priceRange": "$$",
    "sameAs": [BIZ.gbp]
    // TODO: add "aggregateRating" once the exact Google review COUNT is confirmed.
  };
  return `  <script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
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
    <section class="page-hero${page.heroVideo ? " has-hero-video" : ""}" aria-label="${page.title}">
${page.heroVideo ? heroVideo(page.heroVideo) + "\n" : ""}      <div class="page-hero-inner">
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

/* ---------- pages ---------- */
const PAGES = [
  {
    url: "/roofing/", title: "Roofing & Exteriors in St. Louis, MO",
    description: "Residential and commercial roofing, storm damage, insurance claims, gutters and exteriors across the St. Louis metro — one trade, from a licensed, locally owned contractor.",
    h1: "St. Louis Roofing & Exterior Services",
    intro: "Roofing, storm response, insurance-claim guidance, commercial roofs, and gutters & exteriors — it's all one trade, done as a complete system and documented at every step.",
    body: [
      P("One trade, built as a system", "Your roof, your gutters and your exterior envelope all do the same job: keep water out. We handle the whole assembly — deck, ice-and-water shield, underlayment, drip edge, starter, field shingles, flashing, ventilation, ridge, and the gutters that carry the water away — residential or commercial, so nothing is left as someone else's problem."),
      P("Where to go next", "Use the <strong>Roofing</strong> menu above for Residential, Commercial, and Exteriors &amp; Gutters — or jump straight to <a href=\"/roofing/storm-damage/\">storm damage</a>, <a href=\"/roofing/insurance-claims/\">insurance claims</a>, or a <a href=\"/roofing/free-inspection/\">free inspection</a>.")
    ].join("\n")
  },
  {
    url: "/roofing/roof-replacement/", title: "Roof Replacement in St. Louis, MO",
    description: "Full roof replacement in St. Louis — architectural shingles, proper ventilation and flashing, and a 10-year transferable workmanship warranty.",
    h1: "Roof Replacement in St. Louis",
    intro: "When repair no longer makes sense, a properly installed new roof protects your home for decades.",
    body: skeleton("roof replacement")
  },
  {
    url: "/roofing/roof-repair/", title: "Roof Repair in St. Louis, MO",
    description: "Fast, lasting roof repair in the St. Louis metro — leaks, wind-lifted shingles, flashing, pipe boots and valleys, with a documented inspection first.",
    h1: "Roof Repair in St. Louis",
    intro: "Not every roof needs replacing. We find the real source of the problem and fix it right.",
    body: skeleton("roof repair")
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
    body: skeleton("inspection")
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
    intro: "Low-slope and flat-roof systems installed and maintained to keep your business dry and open.",
    heroVideo: { mp4: "/assets/video/commercial-roofing.mp4", poster: "/assets/video/commercial-roofing-poster.jpg" },
    body: skeleton("commercial roof")
  },
  {
    url: "/gutters-and-exteriors/", title: "Gutters & Exteriors in St. Louis, MO",
    description: "Seamless gutters, downspouts, fascia, soffit and exterior work across the St. Louis metro — protecting your roof system from the edge down.",
    h1: "Gutters & Exteriors",
    intro: "Your roof ends at the edge — gutters, fascia and soffit carry the water the rest of the way.",
    heroVideo: { mp4: "/assets/video/gutters-and-exteriors.mp4", poster: "/assets/video/gutters-and-exteriors-poster.jpg" },
    body: skeleton("gutter and exterior project")
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
  {
    url: "/service-areas/", title: "Service Areas — St. Louis Metro & St. Charles County",
    description: "Loxley Roofing and Construction serves Kirkwood, Webster Groves, Chesterfield, Ballwin, Wildwood, O'Fallon and communities across the St. Louis metro.",
    h1: "Where We Work",
    intro: "Based in Kirkwood, serving the St. Louis metro and St. Charles County.",
    body: [
      LIST("Communities we serve", [
        `<a href="/service-areas/kirkwood/">Kirkwood, MO</a>`,
        `<a href="/service-areas/webster-groves/">Webster Groves, MO</a>`,
        "Chesterfield, MO", "Ballwin, MO", "Wildwood, MO", "Des Peres, MO",
        "Town &amp; Country, MO", "O'Fallon, MO", "St. Charles, MO", "St. Peters, MO"
      ]),
      NOTE("Confirm the exact list of suburbs Loxley services. We build a dedicated page for each area only when there's real local content — a real local job, neighborhood detail, and a photo — rather than thin templated pages.")
    ].join("\n")
  },
  {
    url: "/service-areas/kirkwood/", title: "Roofing in Kirkwood, MO",
    description: "Roof replacement, repair and storm-damage help in Kirkwood, MO — from a locally owned contractor based right in Kirkwood.",
    h1: "Roofing in Kirkwood, MO",
    intro: "We're based in Kirkwood — this is home.",
    body: [
      P("Your Kirkwood roofer", "Loxley Roofing and Construction is headquartered at 524 Clark Ave in Kirkwood. From the historic homes near downtown Kirkwood to newer builds across the 63122 area, we handle roof replacement, repair, storm restoration and gutters with documented, warrantied work."),
      NOTE("Add a real Kirkwood job (before/after photo, roof system, street/neighborhood) to make this page genuinely local.")
    ].join("\n")
  },
  {
    url: "/service-areas/webster-groves/", title: "Roofing in Webster Groves, MO",
    description: "Roof replacement, repair and storm-damage help in Webster Groves, MO from Loxley Roofing and Construction — licensed, insured and local.",
    h1: "Roofing in Webster Groves, MO",
    intro: "Trusted roofing next door in Webster Groves.",
    body: [
      P("Roofing for Webster Groves homes", "From the tree-lined streets and older homes of Webster Groves to its newer construction, we install and repair roofing systems built for Missouri weather — documented, warrantied and done with clean daily site management."),
      NOTE("Add a real Webster Groves job (before/after photo, roof system, neighborhood) to make this page genuinely local.")
    ].join("\n")
  },
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
const indexPath = path.join(ROOT, "index.html");
let patched = 0;
if (fs.existsSync(indexPath)) {
  const before = fs.readFileSync(indexPath, "utf8");
  const after = before.replace(
    /(href|src)="((?:\/)?(?:css|js)\/[^"?#]+\.(?:css|js))(?:\?[^"#]*)?"/g,
    (_m, attr, url) => `${attr}="${url}?v=${assetHash(url)}"`
  );
  if (after !== before) { fs.writeFileSync(indexPath, after); patched = 1; }
}

console.log(`Generated ${written} route pages + sitemap.xml (${urls.length} URLs).${patched ? " Cache-busted index.html." : ""}`);
