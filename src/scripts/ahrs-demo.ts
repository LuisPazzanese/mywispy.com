// AHRS demo: loads ahrs.wasm (Madgwick filter compiled from C), drives a
// Three.js scene with either real DeviceMotion samples (mobile) or
// synthetic pointer-drag input (desktop). All math happens in WASM.

import * as THREE from 'three';

interface AhrsExports {
  memory: WebAssembly.Memory;
  madgwick_init: (beta: number) => void;
  madgwick_update: (
    gx: number,
    gy: number,
    gz: number,
    ax: number,
    ay: number,
    az: number,
    dt: number,
  ) => void;
  q0: () => number;
  q1: () => number;
  q2: () => number;
  q3: () => number;
}

type DeviceMotionEventCtor = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const STATUS_STATES = {
  init: 'init',
  ready: 'ready',
  running: 'running',
  denied: 'denied',
  unsupported: 'unsupported',
} as const;

function setStatus(root: HTMLElement, key: keyof typeof STATUS_STATES): void {
  root.dataset.state = STATUS_STATES[key];
  for (const el of root.querySelectorAll<HTMLElement>('[data-state-text]')) {
    el.hidden = el.dataset.stateText !== STATUS_STATES[key];
  }
}

async function loadAhrs(): Promise<AhrsExports> {
  const res = await fetch('/ahrs.wasm');
  if (!res.ok) throw new Error(`Failed to fetch ahrs.wasm: ${res.status}`);
  const { instance } = await WebAssembly.instantiateStreaming(res, {});
  const ahrs = instance.exports as unknown as AhrsExports;
  ahrs.madgwick_init(0.08);
  return ahrs;
}

function initThree(canvas: HTMLCanvasElement): {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  pcb: THREE.Group;
} {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 1.6, 4.2);
  camera.lookAt(0, 0, 0);

  // Two soft lights so the PCB has depth without being shiny
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  // Group the PCB pieces so we rotate as a rigid body.
  const pcb = new THREE.Group();
  scene.add(pcb);

  // Board: long, thin rectangle in PCB green.
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.08, 1.2),
    new THREE.MeshStandardMaterial({
      color: 0x0e3a2e,
      roughness: 0.85,
      metalness: 0.1,
    }),
  );
  pcb.add(board);

  // Accent traces — thin bright strips on the top face, suggesting copper paths.
  const traceMat = new THREE.MeshBasicMaterial({ color: 0x7ee7c7 });
  const traceY = 0.041; // sits just above the board surface
  const traceCoords: Array<[number, number, number, number]> = [
    // [x, z, width, depth]
    [-0.6, 0.3, 1.4, 0.04],
    [0.4, 0.0, 0.8, 0.04],
    [-0.2, -0.35, 1.6, 0.04],
    [0.85, 0.4, 0.04, 0.5],
    [-0.85, -0.1, 0.04, 0.5],
  ];
  for (const [x, z, w, d] of traceCoords) {
    const trace = new THREE.Mesh(new THREE.BoxGeometry(w, 0.005, d), traceMat);
    trace.position.set(x, traceY, z);
    pcb.add(trace);
  }

  // A few "components" — small cubes scattered on the board for visual interest.
  const chipMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.6,
  });
  const chips: Array<[number, number, number, number, number]> = [
    // [x, z, w, h, d]
    [0.3, 0.1, 0.45, 0.12, 0.3],
    [-0.7, 0.25, 0.2, 0.08, 0.2],
    [0.85, -0.2, 0.18, 0.08, 0.18],
    [-0.3, -0.3, 0.1, 0.06, 0.1],
  ];
  for (const [x, z, w, h, d] of chips) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), chipMat);
    chip.position.set(x, 0.04 + h / 2, z);
    pcb.add(chip);
  }

  // Pin headers — strip along the long edge.
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0x4fa88d,
    roughness: 0.4,
    metalness: 0.5,
  });
  for (let i = 0; i < 12; i++) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.06), pinMat);
    pin.position.set(-1.0 + i * 0.18, 0.065, 0.52);
    pcb.add(pin);
  }

  return { renderer, scene, camera, pcb };
}

// Convert Madgwick's quaternion (w, x, y, z in body frame Z-up) to a
// Three.js-friendly quaternion. The filter assumes NED-ish axes; for a
// visually correct demo, we apply a fixed remap so phone tilt feels natural.
function applyQuaternion(
  pcb: THREE.Group,
  w: number,
  x: number,
  y: number,
  z: number,
): void {
  // Remap so screen-up tilts the board's front edge up.
  pcb.quaternion.set(x, z, -y, w);
}

export function startAhrsDemo(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-ahrs-canvas]');
  const enableBtn = root.querySelector<HTMLButtonElement>('[data-ahrs-enable]');
  const valuesEl = root.querySelector<HTMLElement>('[data-ahrs-values]');
  if (!canvas) return;

  let ahrs: AhrsExports | null = null;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let pcb: THREE.Group;
  let initialized = false;

  // Synthetic gyro state for desktop drag fallback.
  let dragGyro = { x: 0, y: 0, z: 0 };
  let dragDecay = 0;

  async function ensureInit(): Promise<void> {
    if (initialized) return;
    initialized = true;
    try {
      ahrs = await loadAhrs();
    } catch (err) {
      console.warn('AHRS WASM load failed:', err);
      setStatus(root, 'unsupported');
      return;
    }
    ({ renderer, scene, camera, pcb } = initThree(canvas!));
    fitRenderer();
    new ResizeObserver(fitRenderer).observe(canvas!);
  }

  function fitRenderer(): void {
    if (!renderer || !canvas) return;
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let lastT = performance.now();
  function tick(): void {
    if (!ahrs) {
      requestAnimationFrame(tick);
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // Synthetic input path: decay the drag-supplied gyro, plus a constant
    // gravity reading so the accel term stabilises the filter.
    if (!isMobileMotionActive) {
      dragDecay *= 0.92;
      ahrs.madgwick_update(
        dragGyro.x * dragDecay,
        dragGyro.y * dragDecay,
        dragGyro.z * dragDecay,
        0,
        0,
        1,
        dt,
      );
    }

    const w = ahrs.q0();
    const x = ahrs.q1();
    const y = ahrs.q2();
    const z = ahrs.q3();
    applyQuaternion(pcb, w, x, y, z);

    if (valuesEl) {
      valuesEl.textContent =
        `q = [ ${w.toFixed(3)}  ${x.toFixed(3)}  ${y.toFixed(3)}  ${z.toFixed(3)} ]`;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // --- Mobile path: DeviceMotion ----------------------------------------
  let isMobileMotionActive = false;

  function startMobileMotion(): void {
    isMobileMotionActive = true;
    window.addEventListener('devicemotion', (ev: DeviceMotionEvent) => {
      if (!ahrs) return;
      const r = ev.rotationRate;
      const a = ev.accelerationIncludingGravity;
      if (!r || !a) return;
      // DeviceMotion gives deg/s and m/s²; Madgwick wants rad/s and any
      // consistent accel unit. We normalise inside the filter anyway.
      const DEG = Math.PI / 180;
      const dt = Math.min(0.05, (ev.interval || 16) / 1000);
      ahrs.madgwick_update(
        (r.beta || 0) * DEG,
        (r.gamma || 0) * DEG,
        (r.alpha || 0) * DEG,
        a.x || 0,
        a.y || 0,
        a.z || 0,
        dt,
      );
    });
  }

  async function requestMotion(): Promise<void> {
    await ensureInit();
    const Ctor = (window as unknown as { DeviceMotionEvent?: DeviceMotionEventCtor }).DeviceMotionEvent;
    if (!Ctor) {
      setStatus(root, 'unsupported');
      return;
    }
    // iOS 13+: must request permission from a user gesture.
    if (typeof Ctor.requestPermission === 'function') {
      try {
        const res = await Ctor.requestPermission();
        if (res !== 'granted') {
          setStatus(root, 'denied');
          return;
        }
      } catch {
        setStatus(root, 'denied');
        return;
      }
    }
    startMobileMotion();
    setStatus(root, 'running');
  }

  enableBtn?.addEventListener('click', () => {
    void requestMotion();
  });

  // --- Desktop path: pointer drag --------------------------------------
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('pointerdown', (ev) => {
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
    void ensureInit().then(() => setStatus(root, 'running'));
  });

  canvas.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    const dx = ev.clientX - lastX;
    const dy = ev.clientY - lastY;
    lastX = ev.clientX;
    lastY = ev.clientY;
    // Drag → angular velocity for the next few frames.
    dragGyro.x = -dy * 0.06;
    dragGyro.y = dx * 0.06;
    dragGyro.z = 0;
    dragDecay = 1.0;
  });

  const stopDrag = (ev: PointerEvent) => {
    dragging = false;
    if (canvas.hasPointerCapture(ev.pointerId)) {
      canvas.releasePointerCapture(ev.pointerId);
    }
  };
  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);

  // --- Initial state ----------------------------------------------------
  // Mobile gets the "tap to enable" button; desktop is ready immediately.
  const hasTouch = matchMedia('(pointer: coarse)').matches;
  setStatus(root, hasTouch ? 'ready' : 'running');
  if (!hasTouch) {
    void ensureInit();
  }

  requestAnimationFrame(tick);
}
