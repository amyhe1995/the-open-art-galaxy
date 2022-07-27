import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(20);

renderer.render(scene, camera);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff, .1);

scene.add(pointLight, ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

// get dir of planets (dev contributions)

async function getRepoDirData() {
  const res = await fetch('https://api.github.com/repos/mattegan111/the-open-art-galaxy/git/trees/4b44901e29a6ebf3849d0d86ec1df787db6a89c7');
  let data = await res.json();
  return data;
}

const repoDirData = await getRepoDirData();

let x = 0;
let y = 0;
let z = 0;
function addStar(planetName){
    const geometryStar = new THREE.SphereGeometry((Math.random()), 24, 24);
    const materialStar = new THREE.MeshStandardMaterial({color: 0xffffff});
    let meshStar = new THREE.Mesh(geometryStar, materialStar);

    meshStar.name = planetName;
    
    const [xEdit, yEdit, zEdit] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(3));

    x = x + xEdit;
    y = y + 3 + yEdit;
    z = z - 3 + zEdit;

    meshStar.position.set(x, y, z);
    scene.add(meshStar);
}

repoDirData.tree.forEach(tree => {
  addStar(tree.path)
});

const raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();
let INTERSECTED;

document.addEventListener('click', onMouseClick);

function onMouseClick() {
  const intersects = raycaster.intersectObjects( scene.children, false );
  window.location = `./planets/${intersects[0].object.name}/index.html`;
}

document.addEventListener( 'mousemove', onPointerMove );

function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( scene.children, false );

  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
    }
  } else {
    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;
  }

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();