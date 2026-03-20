import * as THREE from '../three.module.js';
import { createEarth } from './planets/earth.js';
import { createSun } from './planets/sun.js';
import { createMoon } from './planets/moon.js';
import { createMercury } from './planets/mercury.js';
import { createVenus } from './planets/venus.js';
import { createMars } from './planets/mars.js';
import { createJupiter } from './planets/jupiter.js';
import { createSaturn } from './planets/saturn.js';
import { createUranus } from './planets/uranus.js';
import { createNeptune } from './planets/neptune.js';
import { ORBIT_DISTANCES } from './solar-system-params.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const COCKPIT_TARGET_MAX_DIMENSION = 0.35;
const COCKPIT_CAMERA_OFFSET = new THREE.Vector3( 0, -0.1, -0.45 );

export function createScene() {
  const scene = new THREE.Scene();

  const skyTexture = new THREE.TextureLoader().load( 'images/tim-barton-skybox-movingcamera-1.jpg' );
  skyTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = skyTexture;

  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.03,
    ORBIT_DISTANCES.neptuneAroundSun + 800
  );

  scene.add(camera);

  // Subtle local light so cockpit interior stays readable without washing the scene.
  const cockpitLight = new THREE.PointLight( 0xdde8ff, 1.2, 3.0, 1.0 );
  cockpitLight.position.set( 0, 0.12, 0.28 );
  cockpitLight.castShadow = false;
  camera.add( cockpitLight );

  const loader = new GLTFLoader();
  loader.load('images/3D_model/cockpit_model_vr.glb', (gltf) => {
    const cockpit = gltf.scene;

    // Centering from the cockpit bounds gives a stable reference independent of source pivot.
    const cockpitBox = new THREE.Box3().setFromObject( cockpit );
    const cockpitSize = new THREE.Vector3();
    const cockpitCenter = new THREE.Vector3();

    cockpitBox.getSize( cockpitSize );
    cockpitBox.getCenter( cockpitCenter );

    // Normalize cockpit dimensions so the ship feels tiny next to planets.
    const maxDimension = Math.max( cockpitSize.x, cockpitSize.y, cockpitSize.z );
    const cockpitScale = maxDimension > 0
      ? COCKPIT_TARGET_MAX_DIMENSION / maxDimension
      : 1;
    cockpit.scale.setScalar( cockpitScale );

    const scaledCenter = cockpitCenter.multiplyScalar( cockpitScale );

    const cockpitOffset = new THREE.Vector3(
      -scaledCenter.x,
      -scaledCenter.y + 0.1,
      -scaledCenter.z + 0.4,
    );

    cockpit.position.copy( cockpitOffset ).add( COCKPIT_CAMERA_OFFSET );
    cockpit.rotation.y = THREE.MathUtils.degToRad( 180.0 );
    camera.add(cockpit); 
  }, undefined, (error) => {
    console.warn('Unable to load cockpit.glb, continuing without cockpit model.', error);
  });

  const { sunGroup, sun } = createSun();
  const { mercuryGroup, mercury } = createMercury();
  const { venusGroup, venus } = createVenus();
  const { earthGroup, earth } = createEarth();
  const { moonGroup, moon } = createMoon();
  const { marsGroup, mars } = createMars();
  const { jupiterGroup, jupiter } = createJupiter();
  const { saturnGroup, saturn } = createSaturn();
  const { uranusGroup, uranus } = createUranus();
  const { neptuneGroup, neptune } = createNeptune();

  // Place the moon pivot at Earth's center so moonGroup rotation creates lunar orbit.
  moonGroup.position.copy( earth.position );
  earthGroup.add( moonGroup );
  sunGroup.add( mercuryGroup );
  sunGroup.add( venusGroup );
  sunGroup.add( earthGroup );
  sunGroup.add( marsGroup );
  sunGroup.add( jupiterGroup );
  sunGroup.add( saturnGroup );
  sunGroup.add( uranusGroup );
  sunGroup.add( neptuneGroup );
  sunGroup.position.z = -8;

  camera.position.set( ORBIT_DISTANCES.earthAroundSun - 4, 1, -8 );
  camera.lookAt( ORBIT_DISTANCES.earthAroundSun, 0, -8 );

  sun.rotation.x = Math.PI / 5;
  sun.rotation.y = Math.PI / 5;

  scene.add( sunGroup );

  sun.castShadow      = false;
  sun.receiveShadow   = false;
  mercury.castShadow  = true;
  mercury.receiveShadow = true;
  venus.castShadow    = true;
  venus.receiveShadow = true;
  earth.castShadow    = true;
  earth.receiveShadow = true;
  moon.castShadow     = true;
  moon.receiveShadow  = true;
  mars.castShadow     = true;
  mars.receiveShadow  = true;
  jupiter.castShadow  = true;
  jupiter.receiveShadow = true;
  saturn.castShadow   = true;
  saturn.receiveShadow = true;
  uranus.castShadow   = true;
  uranus.receiveShadow = true;
  neptune.castShadow  = true;
  neptune.receiveShadow = true;

  return {
    scene,
    camera,
    sunGroup,
    sun,
    mercuryGroup,
    mercury,
    venusGroup,
    venus,
    earthGroup,
    earth,
    moonGroup,
    moon,
    marsGroup,
    mars,
    jupiterGroup,
    jupiter,
    saturnGroup,
    saturn,
    uranusGroup,
    uranus,
    neptuneGroup,
    neptune,
  };
}