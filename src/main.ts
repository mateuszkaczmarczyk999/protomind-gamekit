import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  WebGLRenderer,
  Scene,
  Color,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  Clock,
} from "three";
import { ThreePerf } from "three-perf";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from 'tweakpane';

const container = document.getElementById("viewport") as HTMLCanvasElement;
const widthViewport = window.innerWidth;
const heightViewport = window.innerHeight;

const params = { color: '#66ccff' };
const ui = document.getElementById('ui')!;
const pane = new Pane({ container: ui, title: 'Material' });
const scratchColor = new Color();

const colorBinding = pane.addBinding(params, 'color', { label: 'Color' });

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance" as WebGLPowerPreference,
  precision: "highp",
  canvas: container,
});
renderer.setClearColor(0xffffff, 1);
renderer.setSize(widthViewport, heightViewport, false);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;

const perf = new ThreePerf({
    anchorX: 'left',
    anchorY: 'top',
    domElement: document.body,
    renderer: renderer
});

const scene = new Scene();
scene.background = new Color(0x111111);

const camera = new PerspectiveCamera(60, widthViewport / heightViewport, 0.1, 100);
camera.position.set(2.5, 2, 2.5);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new AmbientLight(0xffffff, 0.5));
const dir = new DirectionalLight(0xffffff, 1.0);
dir.position.set(3, 5, 2);
scene.add(dir);

const geo = new BoxGeometry(1, 1, 1);
const mat = new MeshStandardMaterial({
  color: 0x66ccff,
  roughness: 0.5,
  metalness: 0.1,
});
const cube = new Mesh(geo, mat);
scene.add(cube);

colorBinding.on('change', (ev: any) => {
  scratchColor.set(ev.value as string);
  scratchColor.convertSRGBToLinear();
  mat.color.copy(scratchColor);
});

const clock = new Clock();
function animate() {
  const dt = clock.getDelta();
  perf.begin();

  cube.rotation.y += dt * 0.6;
  controls.update();
  renderer.render(scene, camera);
  
  perf.end();
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
