/* ==========================================================================
   Loxley Roofing and Construction — "The roof, scrolled on"
   Faithful recreation of the original Claude Design #roof3d section setup
   (sticky full-viewport stage, 10 phase labels, materials legend, replay),
   but rendering the realistic Higgsfield 3D reconstructions of the actual
   house instead of a procedural roof.

   One continuous camera orbits and pushes over the roof while the models
   crossfade through the build phases — trusses -> deck -> underlayment ->
   shingles -> finished roofline. Progressive enhancement: without WebGL or
   with reduced motion, the photographic fallback stack is shown instead.
   ========================================================================== */
import * as THREE from "../vendor/three.module.min.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { DRACOLoader } from "../vendor/DRACOLoader.js";

const MODEL_DIR = "assets/models/";

/* The 10 labelled phases from the original design, each mapped to the
   realistic roof-stage model that best represents it. Several phases share a
   model (label advances while the same structure is on screen), exactly as a
   real roof gains layers on one deck. */
const PHASES = [
  { t: 0.00, model: "06-roof-framing",               material: 0, title: "Bare Trusses",              sub: "The engineered skeleton — ridges, hips and valleys." },
  { t: 0.12, model: "07-roof-decking",               material: 1, title: "Roof-Deck Sheathing",       sub: "Structural panels nailed over the trusses in a staggered pattern." },
  { t: 0.24, model: "08-roof-underlayment",          material: 2, title: "Ice & Water Shield",        sub: "Self-adhered membrane sealing the eaves and valleys." },
  { t: 0.34, model: "08-roof-underlayment",          material: 2, title: "Underlayment + Drip Edge",  sub: "Synthetic underlayment over the field, black drip edge at the perimeter." },
  { t: 0.44, model: "08-roof-underlayment",          material: 3, title: "Flashing",                  sub: "Step, kickout and valley flashing integrating roof to wall." },
  { t: 0.52, model: "10-shingle-installation",       material: 4, title: "Starter Strip",             sub: "Sealed starter course locking down the first row." },
  { t: 0.60, model: "10-shingle-installation",       material: 4, title: "Architectural Shingles",    sub: "Charcoal dimensional shingles climbing eave to ridge." },
  { t: 0.74, model: "17-completed-roofline-detail",  material: 4, title: "Ridge Vent + Caps",         sub: "Continuous exhaust venting, capped with matching ridge shingles." },
  { t: 0.84, model: "17-completed-roofline-detail",  material: 4, title: "Standing-Seam Porch Roof",  sub: "Black metal roofing over the covered entry." },
  { t: 0.93, model: "17-completed-roofline-detail",  material: 4, title: "Final Seal & Inspection",   sub: "Every seam, fastener and penetration checked — sealed and warrantied." }
];

/* Per-model camera framing tuned to sit high and look down over the roof.
   [azimuthDeg, polarDeg, radiusScale, targetY] */
const FRAMING = {
  "06-roof-framing":              [ 26, 52, 1.06, 0.10 ],
  "07-roof-decking":              [ 24, 48, 1.02, 0.12 ],
  "08-roof-underlayment":         [ 22, 46, 1.00, 0.14 ],
  "10-shingle-installation":      [ 26, 46, 1.00, 0.12 ],
  "17-completed-roofline-detail": [ 24, 50, 0.98, 0.10 ]
};

export function initRoofScroll(opts) {
  const { canvas, stage, section, label, legendItems, onActive } = opts;
  if (!canvas || !stage || !section) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);

  const key = new THREE.DirectionalLight(0xfff2df, 2.7); key.position.set(2.4, 3.8, 1.6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfd4ea, 1.0); fill.position.set(-2.4, 1.6, -1.8); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xb88a4a, 0.9); rim.position.set(-1.0, 1.2, 2.8); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdfe8f2, 0x0a0c0b, 0.35));
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const draco = new DRACOLoader().setDecoderPath("vendor/draco/");
  const loader = new GLTFLoader().setDRACOLoader(draco);

  const uniqueModels = Array.from(new Set(PHASES.map(p => p.model)));
  const models = new Map();   // name -> { holder, loaded, loading, radius }

  uniqueModels.forEach(n => models.set(n, { holder: null, loaded: false, loading: false, radius: 1 }));

  function load(name, cb) {
    const e = models.get(name);
    if (!e || e.loaded || e.loading) { if (e && e.loaded && cb) cb(); return; }
    e.loading = true;
    loader.load(MODEL_DIR + name + ".glb", gltf => {
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const longest = Math.max(size.x, size.y, size.z) || 1;
      const s = 1 / longest;
      root.position.sub(center);
      const holder = new THREE.Group();
      holder.add(root);
      holder.scale.setScalar(s);
      holder.visible = false;
      holder.traverse(o => {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          o.material.opacity = 0;
          if ("roughness" in o.material) o.material.roughness = Math.min(1, (o.material.roughness ?? 0.8) * 1.1 + 0.05);
        }
      });
      e.holder = holder; e.loaded = true; e.loading = false;
      e.radius = 0.5 * Math.sqrt((size.x*s)**2 + (size.y*s)**2 + (size.z*s)**2);
      scene.add(holder);
      requestRender();
      if (cb) cb();
    }, undefined, () => { e.loading = false; });
  }

  // Warm the first three distinct models before the section is reached.
  function preload() { uniqueModels.slice(0, 3).forEach(n => load(n)); }

  let w = 0, h = 0;
  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    w = r.width; h = r.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  let pending = false;
  function requestRender() { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; draw(); }); }

  let progress = 0, activePhase = -1;

  function phaseAt(p) {
    let idx = 0;
    for (let i = 0; i < PHASES.length; i++) if (p >= PHASES[i].t) idx = i;
    return idx;
  }

  function frame(name, life, radius, targetY) {
    const f = FRAMING[name] || [24, 50, 1.0, 0.1];
    const az = THREE.MathUtils.degToRad(f[0] + (life - 0.5) * 14);
    const pol = THREE.MathUtils.degToRad(f[1] - (life - 0.5) * 3);
    const dist = radius * 2.5 * f[2] * (1.08 - life * 0.09);
    const ty = targetY !== undefined ? targetY : f[3];
    const sp = Math.sin(pol), cp = Math.cos(pol);
    camera.position.set(dist*sp*Math.sin(az), dist*cp + ty, dist*sp*Math.cos(az));
    camera.lookAt(0, ty, 0);
  }

  function setOpacity(holder, o) {
    holder.visible = o > 0.003;
    holder.traverse(m => { if (m.isMesh && m.material) m.material.opacity = o; });
  }

  function draw() {
    if (!w || !h) { resize(); if (!w || !h) return; }
    const idx = phaseAt(progress);
    const cur = PHASES[idx];
    const nxt = PHASES[idx + 1];
    const span = nxt ? (nxt.t - cur.t) : (1 - cur.t);
    const local = span > 0 ? Math.min(1, Math.max(0, (progress - cur.t) / span)) : 1;

    const curE = models.get(cur.model);
    // Load current + next model on demand.
    if (!curE.loaded) { load(cur.model, requestRender); }
    if (nxt) load(nxt.model);

    // Crossfade only when the model actually changes between phases.
    const changing = nxt && nxt.model !== cur.model;
    const blend = changing ? Math.max(0, (local - 0.62) / 0.38) : 0;

    models.forEach((e, name) => {
      if (!e.holder) return;
      if (name !== cur.model && !(changing && name === nxt.model)) setOpacity(e.holder, 0);
    });
    if (!curE.loaded) { renderer.clear(); return; }

    setOpacity(curE.holder, 1 - blend * 0.9);
    if (changing) { const nE = models.get(nxt.model); if (nE.loaded) setOpacity(nE.holder, blend); }

    const shown = (changing && blend > 0.5 && models.get(nxt.model).loaded) ? models.get(nxt.model) : curE;
    const shownName = shown === curE ? cur.model : nxt.model;
    const life = shown === curE ? local : blend;
    const ty = (FRAMING[shownName] || [0,0,0,0.1])[3];
    frame(shownName, life, shown.radius, ty);
    renderer.render(scene, camera);

    if (idx !== activePhase) {
      activePhase = idx;
      if (label) { label.title.textContent = cur.title; label.sub.textContent = cur.sub; }
      if (legendItems) legendItems.forEach((el, i) => el.classList.toggle("is-active", i === cur.material));
      if (onActive) onActive(idx, cur);
    }
  }

  return {
    preload,
    resize() { resize(); requestRender(); },
    setProgress(p) { progress = Math.min(1, Math.max(0, p)); requestRender(); },
    dispose() { models.forEach(e => e.holder && scene.remove(e.holder)); renderer.dispose(); draco.dispose(); }
  };
}
