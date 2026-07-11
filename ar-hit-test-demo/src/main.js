import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

// Product footprint in meters (x = width, y = height, z = depth).
const BOX_SIZE = { x: 0.8, y: 0.3, z: 0.2 };

let camera, scene, renderer;
let reticle,
  hitTestSource = null,
  hitTestSourceRequested = false;

init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20,
  );

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // WebXR AR start button with hit-test feature required.
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }),
  );

  // Green ring reticle that snaps to detected surfaces.
  const reticleGeo = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(
    -Math.PI / 2,
  );
  const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  reticle = new THREE.Mesh(reticleGeo, reticleMat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Controller select = tap/screen-press in AR.
  const controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  window.addEventListener("resize", onWindowResize);

  renderer.setAnimationLoop(render);
}

function onSelect() {
  if (!reticle.visible) return;

  // Place a box at the reticle's current position/orientation.
  const geometry = new THREE.BoxGeometry(BOX_SIZE.x, BOX_SIZE.y, BOX_SIZE.z);
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
      session.requestReferenceSpace("viewer").then((viewerSpace) => {
        session.requestHitTestSource({ space: viewerSpace }).then((source) => {
          hitTestSource = source;
        });
      });
      session.addEventListener("end", () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        if (pose) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          reticle.visible = false;
        }
      } else {
        reticle.visible = false;
      }
    }
  }

  renderer.render(scene, camera);
}
