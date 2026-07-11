import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { X, Ruler, Smartphone } from "lucide-react";

interface ARViewerProps {
  width: number;
  height: number;
  depth: number;
  productName: string;
  onClose: () => void;
}

export default function ARViewer({ width, height, depth, productName, onClose }: ARViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [arActive, setArActive] = useState(false);

  useEffect(() => {
    if ("xr" in navigator && navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setArSupported).catch(() => setArSupported(false));
    } else {
      setArSupported(false);
    }
  }, []);

  useEffect(() => {
    if (arSupported === null || arSupported === false) return;

    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let reticle: THREE.Mesh;
    let hitTestSource: XRHitTestSource | null = null;
    let hitTestSourceRequested = false;
    let placedObjects: THREE.Object3D[] = [];
    let arButtonEl: HTMLElement | null = null;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    mount.appendChild(renderer.domElement);

    arButtonEl = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
    arButtonEl.style.position = "absolute";
    arButtonEl.style.bottom = "80px";
    arButtonEl.style.left = "50%";
    arButtonEl.style.transform = "translateX(-50%)";
    arButtonEl.style.padding = "12px 32px";
    arButtonEl.style.fontSize = "14px";
    arButtonEl.style.fontFamily = "JetBrains Mono, monospace";
    arButtonEl.style.fontWeight = "700";
    arButtonEl.style.borderRadius = "9999px";
    arButtonEl.style.border = "1px solid #3b82f6";
    arButtonEl.style.background = "#3b82f6";
    arButtonEl.style.color = "#0a0a1a";
    arButtonEl.style.cursor = "pointer";
    arButtonEl.style.zIndex = "20";
    arButtonEl.addEventListener("click", () => setArActive(true));
    mount.appendChild(arButtonEl);

    renderer.xr.addEventListener("sessionend", () => setArActive(false));

    const reticleGeo = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    function onSelect() {
      if (!reticle.visible) return;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);

      wireframe.position.setFromMatrixPosition(reticle.matrix);
      wireframe.quaternion.setFromRotationMatrix(reticle.matrix);

      const boxGeo = new THREE.BoxGeometry(width, height, depth);
      const fillMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.08 });
      const fillMesh = new THREE.Mesh(boxGeo, fillMat);
      fillMesh.position.copy(wireframe.position);
      fillMesh.quaternion.copy(wireframe.quaternion);

      const group = new THREE.Group();
      group.add(fillMesh);
      group.add(wireframe);
      group.position.copy(wireframe.position);
      group.quaternion.copy(wireframe.quaternion);

      scene.add(group);
      placedObjects.push(group);
    }

    const controller = renderer.xr.getController(0);
    controller.addEventListener("select", onSelect);
    scene.add(controller);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    function renderLoop(_timestamp: number, frame: XRFrame | undefined) {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (!hitTestSourceRequested && session) {
          const s = session as any;
          s.requestReferenceSpace("viewer").then((viewerSpace: any) => {
            s.requestHitTestSource({ space: viewerSpace }).then((source: any) => {
              hitTestSource = source;
            });
          });
          s.addEventListener("end", () => {
            hitTestSourceRequested = false;
            hitTestSource = null;
          });
          hitTestSourceRequested = true;
        }

        if (hitTestSource && referenceSpace) {
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

    renderer.setAnimationLoop(renderLoop);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      placedObjects.forEach((obj) => {
        scene.remove(obj);
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) child.material.dispose();
          }
          if (child instanceof THREE.LineSegments) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) child.material.dispose();
          }
        });
      });
      if (reticle.geometry) reticle.geometry.dispose();
      if (reticle.material instanceof THREE.Material) reticle.material.dispose();
      if (arButtonEl) arButtonEl.remove();
      if (renderer.xr.getSession()) renderer.xr.getSession()?.end();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [arSupported, width, height, depth]);

  if (arSupported === false) {
    return (
      <div className="fixed inset-0 z-[70] bg-navy flex flex-col items-center justify-center p-6">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-lg text-cloud-muted hover:text-gold hover:bg-cloud/5 transition-colors z-10">
          <X size={24} />
        </button>
        <div className="bg-navy-card border border-edge rounded-2xl p-8 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-5">
            <Smartphone size={28} />
          </div>
          <h2 className="font-head font-bold text-xl text-cloud mb-3">AR non disponible</h2>
          <p className="text-sm text-cloud-muted leading-relaxed mb-4">
            La réalité augmentée nécessite Chrome sur Android avec ARCore.
            Sur desktop ou iOS, l'AR n'est pas supportée par le navigateur.
          </p>
          <p className="font-mono text-xs text-gold mb-6">
            {width} × {height} × {depth} m (W×H×D)
          </p>
          <div className="bg-navy-tile rounded-xl p-4 text-left space-y-2">
            <p className="font-mono text-xs text-cloud-muted uppercase tracking-wider mb-2">Dimensions du produit</p>
            <div className="flex justify-between text-sm">
              <span className="text-cloud-muted">Largeur</span>
              <span className="font-mono text-cloud">{(width * 100).toFixed(0)} cm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cloud-muted">Hauteur</span>
              <span className="font-mono text-cloud">{(height * 100).toFixed(0)} cm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cloud-muted">Profondeur</span>
              <span className="font-mono text-cloud">{(depth * 100).toFixed(0)} cm</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black" ref={mountRef}>
      <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-lg text-white hover:text-gold bg-white/10 hover:bg-white/20 transition-colors z-10">
        <X size={24} />
      </button>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-5 py-2.5 border border-gold/30">
          <Ruler size={16} className="text-gold" />
          <span className="text-white font-mono text-xs">
            {productName} — {(width * 100).toFixed(0)}×{(height * 100).toFixed(0)}×{(depth * 100).toFixed(0)} cm
          </span>
        </div>
      </div>

      {arActive && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <p className="text-white font-mono text-xs bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20" style={{ textShadow: "0 1px 3px black" }}>
            Pointez vers une surface, tapez pour placer le produit
          </p>
        </div>
      )}
    </div>
  );
}