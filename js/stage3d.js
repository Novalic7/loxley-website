/* ==========================================================================
   Loxley Roofing and Construction — 3D build stage
   Renders the reconstructed construction models behind the scroll narrative.
   The same residence is rebuilt stage by stage as the visitor scrolls: each
   model swaps in with a crossfade while one continuous camera orbits and
   pushes in, so the building appears to assemble itself.

   Progressive enhancement: if WebGL is unavailable, the module never
   initialises and the photographic stage remains fully visible.
   ========================================================================== */
import * as THREE from "../vendor/three.module.min.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { DRACOLoader } from "../vendor/DRACOLoader.js";

/* Scene index -> model file. Indexes match the anatomy chapters (0 = scene 02).
   Chapters with no entry keep the photograph — those stages reconstructed as
   isolated objects rather than the building, so the photo is the honest visual. */
const MODEL_BY_INDEX = {
  1:  "03-foundation",
  3:  "05-wall-framing",
  4:  "06-roof-framing",
  5:  "07-roof-decking",
  6:  "08-roof-underlayment",
  8:  "10-shingle-installation",
  10: "12-exterior-envelope",
  15: "17-completed-roofline-detail"
};

const MODEL_DIR = "assets/models/";

/* Per-model camera framing: [azimuth°, polar°, radiusScale, yLift] */
const FRAMING = {
  "03-foundation":                [ 38, 60, 1.05, 0.00 ],
  "05-wall-framing":              [ 30, 62, 1.02, 0.02 ],
  "06-roof-framing":              [ 30, 60, 1.06, 0.02 ],
  "07-roof-decking":              [ 28, 58, 1.02, 0.02 ],
  "08-roof-underlayment":         [ 28, 58, 1.02, 0.02 ],
  "10-shingle-installation":      [ 28, 60, 1.02, 0.01 ],
  "12-exterior-envelope":         [ 25, 64, 1.02, 0.01 ],
  "17-completed-roofline-detail": [ 25, 62, 1.00, 0.00 ]
};

export function initStage3D(opts) {
  const { canvas, stage, onReady } = opts;
  if (!canvas || !stage) return null;

  // Bail out cleanly when WebGL is unavailable.
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance"
    });
  } catch (e) {
    return null;
  }
  if (!renderer.getContext()) return null;

  const DPR_CAP = 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);

  /* ---- lighting: architectural, warm key + cool fill ---- */
  const key = new THREE.DirectionalLight(0xfff2df, 2.6);
  key.position.set(2.2, 3.4, 1.8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbfd4ea, 1.0);
  fill.position.set(-2.4, 1.4, -1.6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xb88a4a, 0.85);
  rim.position.set(-1.2, 1.0, 2.6);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0xdfe8f2, 0.06));
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  /* ---- loading ---- */
  const draco = new DRACOLoader().setDecoderPath("vendor/draco/");
  const loader = new GLTFLoader().setDRACOLoader(draco);

  const entries = new Map();   // index -> { name, root, box, loaded, loading }
  const indices = Object.keys(MODEL_BY_INDEX).map(Number).sort((a, b) => a - b);

  indices.forEach(i => entries.set(i, {
    name: MODEL_BY_INDEX[i], root: null, loaded: false, loading: false, radius: 1, center: null
  }));

  function load(index) {
    const e = entries.get(index);
    if (!e || e.loaded || e.loading) return;
    e.loading = true;
    loader.load(MODEL_DIR + e.name + ".glb", gltf => {
      const root = gltf.scene;

      // Normalise: centre at origin, scale longest axis to 1 unit.
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
        if (o.isMesh) {
          o.frustumCulled = true;
          if (o.material) {
            o.material.transparent = true;
            o.material.opacity = 0;
            o.material.depthWrite = true;
            // Reconstructed photogrammetry reads better slightly less glossy.
            if ("roughness" in o.material) {
              o.material.roughness = Math.min(1, (o.material.roughness ?? 0.8) * 1.1 + 0.06);
            }
          }
        }
      });

      e.root = holder;
      e.loaded = true;
      e.loading = false;
      e.radius = 0.5 * Math.sqrt(
        (size.x * s) ** 2 + (size.y * s) ** 2 + (size.z * s) ** 2
      );
      scene.add(holder);
      if (onReady) onReady(index);
      requestRender();
    }, undefined, () => { e.loading = false; });
  }

  /* Warm the first model plus its two successors, as the manifest asks. */
  function preloadAround(index) {
    const upcoming = indices.filter(i => i >= index).slice(0, 3);
    upcoming.forEach(load);
  }

  /* ---- sizing ---- */
  let w = 0, h = 0;
  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    w = r.width; h = r.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  /* ---- render loop is scroll-driven, not continuous ---- */
  let pending = false;
  let current = { index: -1, local: 0, nextIndex: -1, blend: 0 };

  function requestRender() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; draw(); });
  }

  function frameCamera(name, life, radius) {
    const f = FRAMING[name] || [28, 62, 1.02, 0];
    const [az, pol, rad, lift] = f;
    // Slow orbital drift and push-in across the life of the scene.
    const azimuth = THREE.MathUtils.degToRad(az + (life - 0.5) * 13);
    const polar = THREE.MathUtils.degToRad(pol - (life - 0.5) * 3.5);
    const dist = radius * 2.55 * rad * (1.075 - life * 0.075);

    const sp = Math.sin(polar), cp = Math.cos(polar);
    camera.position.set(
      dist * sp * Math.sin(azimuth),
      dist * cp + lift,
      dist * sp * Math.cos(azimuth)
    );
    camera.lookAt(0, lift, 0);
  }

  function setOpacity(root, o) {
    root.visible = o > 0.002;
    root.traverse(m => { if (m.isMesh && m.material) m.material.opacity = o; });
  }

  function draw() {
    if (!w || !h) { resize(); if (!w || !h) return; }

    const { index, local, nextIndex, blend } = current;
    const a = entries.get(index);
    const b = nextIndex >= 0 ? entries.get(nextIndex) : null;

    // Hide everything not participating in this frame.
    entries.forEach((e, i) => {
      if (!e.root) return;
      if (i !== index && i !== nextIndex) setOpacity(e.root, 0);
    });

    if (!a || !a.loaded) { renderer.clear(); return; }

    setOpacity(a.root, 1 - blend * 0.85);
    if (b && b.loaded) setOpacity(b.root, blend);

    // One camera for both models so the building appears to grow in place.
    const active = (b && b.loaded && blend > 0.5) ? b : a;
    const life = active === a ? local : blend;
    frameCamera(active.name, life, active.radius);

    renderer.render(scene, camera);
  }

  /* Public API driven by the scroll engine in main.js */
  return {
    hasModel(index) { return entries.has(index); },
    preloadAround,
    resize() { resize(); requestRender(); },
    update(index, local) {
      // Which model is on screen, and is the next one crossfading in?
      let idx = -1;
      for (const i of indices) if (i <= index) idx = i;
      if (idx === -1) { current = { index: -1, local: 0, nextIndex: -1, blend: 0 }; requestRender(); return false; }

      const isOwn = entries.has(index);
      let nextIndex = -1, blend = 0;

      if (isOwn) {
        // Crossfade into the following model over the last part of the chapter.
        const after = indices.find(i => i > index);
        if (after !== undefined && local > 0.72) {
          nextIndex = after;
          blend = (local - 0.72) / 0.28;
          load(after);
        }
        current = { index, local, nextIndex, blend };
      } else {
        // Chapter without a model: hold the previous structure, faded back.
        current = { index: idx, local: 1, nextIndex: -1, blend: 0 };
      }

      preloadAround(idx);
      requestRender();
      return isOwn;
    },
    dispose() {
      entries.forEach(e => { if (e.root) scene.remove(e.root); });
      renderer.dispose();
      draco.dispose();
    }
  };
}
