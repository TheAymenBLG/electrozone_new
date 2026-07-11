# WebXR Hit-Test AR — Local LAN Setup Guide

Goal: a phone-in-hand demo where you point the camera at the floor/a table, a reticle shows the detected surface, and tapping places a 3D box there — real plane detection, zero training, zero deployed model (ARCore does the SLAM).

**Hard requirements before you start:**
- **Android phone with ARCore support** (most phones from the last ~6 years qualify — check "Google Play Services for AR" exists/updates in the Play Store on the phone; if it's missing and won't install, the phone isn't supported and nothing below will work).
- **Chrome on Android**, reasonably recent. iPhone/Safari will not work for this tier — confirmed unsupported as of 2026, don't lose time debugging it on iOS.
- **Dev laptop and phone on the same LAN**, and — important — not a WiFi network with **client isolation** turned on (common on venue/guest/campus WiFi; if devices can't ping each other, use your laptop's mobile hotspot instead and connect the phone to that).

---

## 1. The gotcha that will block you first: secure context over LAN

WebXR (like camera access generally) only runs in a "secure context" — HTTPS, or `localhost` on the *same device*. Your phone hitting `http://192.168.x.x:5173` over LAN is neither, so `navigator.xr` will simply be `undefined` and nothing will visibly fail — it'll just silently not work. Two ways around it; do the first one, it's faster:

### Option A — Chrome flag (fastest, do this)
On the **phone**, open Chrome and go to:
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```
Enable it, and in the text field enter your dev server's exact LAN origin (you'll get the IP in step 3), e.g.:
```
http://192.168.1.42:5173
```
Tap **Relaunch** when prompted. This tells Chrome to treat that one origin as secure without needing a real certificate — the standard workaround for exactly this situation.

### Option B — real local HTTPS (fallback if A misbehaves)
Use `mkcert` to generate a locally-trusted cert, and `vite-plugin-mkcert` to wire it into the dev server automatically:
```bash
npm install -D vite-plugin-mkcert
```
```js
// vite.config.js
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [mkcert()],
  server: { host: true },
});
```
This serves over `https://` automatically, but you'll additionally need to trust the generated root CA on the phone itself (mkcert prints instructions for this) — more steps, only bother if the flag approach fails.

---

## 2. Project setup

```bash
npm create vite@latest ar-hit-test-demo -- --template vanilla
cd ar-hit-test-demo
npm install three
```

Replace the generated files with the following:

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AR Hit-Test Demo</title>
  <style>
    html, body { margin: 0; overflow: hidden; height: 100%; }
    #info {
      position: absolute; top: 10px; width: 100%; text-align: center;
      color: white; font-family: system-ui, sans-serif; font-size: 14px;
      z-index: 10; pointer-events: none; text-shadow: 0 1px 3px black;
    }
  </style>
</head>
<body>
  <div id="info">Tap "Start AR", point at the floor, tap to place</div>
  <script type="module" src="/main.js"></script>
</body>
</html>
```

**`main.js`**
```js
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let reticle, hitTestSource = null, hitTestSourceRequested = false;

init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // This is the button that requests an 'immersive-ar' session with hit-test.
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] })
  );

  // Reticle: a ring that shows where a surface has been detected.
  const reticleGeo = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2);
  const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  reticle = new THREE.Mesh(reticleGeo, reticleMat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Tap-to-place: on 'select', drop a box at the reticle's current position.
  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);

  window.addEventListener('resize', onWindowResize);

  renderer.setAnimationLoop(render);
}

function onSelect() {
  if (!reticle.visible) return;

  // Swap this box for a glTF model later — same placement logic applies.
  const geometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
  const material = new THREE.MeshStandardMaterial({ color: 0x2563eb });
  const box = new THREE.Mesh(geometry, material);
  box.position.setFromMatrixPosition(reticle.matrix);
  box.quaternion.setFromRotationMatrix(reticle.matrix);
  scene.add(box);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((viewerSpace) => {
        session.requestHitTestSource({ space: viewerSpace }).then((source) => {
          hitTestSource = source;
        });
      });
      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }

  renderer.render(scene, camera);
}
```

---

## 3. Run it and connect from your phone

```bash
npm run dev -- --host
```
The `--host` flag is what exposes the dev server on your LAN IP, not just `localhost`. Vite will print something like:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```
Use the **Network** URL — that's the address to both put in the Chrome flag (step 1) and to type into your phone's Chrome address bar.

On the phone:
1. Confirm you're on the same WiFi as the laptop (or laptop hotspot).
2. Set the Chrome flag from Section 1 with this exact URL (including port).
3. Navigate to `http://192.168.1.42:5173` (your actual IP) in Chrome.
4. Tap **Start AR**, grant camera permission.
5. Slowly pan the phone across the floor or a table — the green ring (reticle) should appear once a surface is detected.
6. Tap the screen anywhere to drop a box at the reticle's position.

---

## 4. Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Start AR" button is greyed out / missing | `navigator.xr` is undefined — check the Chrome flag has the *exact* origin (including port), and that you relaunched Chrome after setting it. |
| Button works, session starts, but nothing but a black camera feed, no reticle ever appears | Move the phone more — ARCore needs a few seconds of camera motion to initialize tracking. Point at a textured, well-lit surface; blank walls or glossy floors are the classic failure case for plane detection. |
| Works on WiFi at home, fails at the venue | Client isolation on venue WiFi — switch to laptop hotspot. |
| "This site can't provide a secure connection" | You're on Option B (mkcert) and haven't trusted the root CA on the phone yet, or mixed up http/https in the URL. |

---

## 5. Once this works: integrating into the real app

- Swap the `BoxGeometry` placeholder for a real glTF model of the product via `GLTFLoader` — placement logic (`reticle.matrix`) stays identical.
- This is a standalone Vite project on purpose — once you've confirmed it works on your actual demo phone, port `main.js`'s logic into a component inside `apps/web` rather than developing it inside the main app from the start, so a broken experiment doesn't destabilize the rest of the site under deadline pressure.
- Given the earlier confirmed lack of iOS support, plan the pitch to explicitly demo this on the Android phone you tested — don't assume it'll "probably work" on whatever phone is closest at hand during the actual presentation.
