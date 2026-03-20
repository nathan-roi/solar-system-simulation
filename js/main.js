import * as THREE from 'three';
import { startRenderLoop } from './animation-loop.js';
import { createScene } from './scene-setup.js';
import { createShipControls } from './ship-controls.js';
import { SOLAR_RADII } from './solar-system-params.js';
import { createPlanetHud } from './target-hud.js';
import { getWebGL2Context } from './webgl-support.js';

const canvas = document.getElementById( 'webglcanvas' );

if ( !canvas ) {
  throw new Error( 'Canvas #webglcanvas introuvable.' );
}

const context = getWebGL2Context( canvas );

if ( !context ) {
  const info = document.getElementById( 'info' );
  if ( info ) {
    info.textContent = 'WebGL2 non disponible: essayez un navigateur/GPU compatible.';
  }
  console.error( 'WebGL2 not supported on your browser.' );
} else {
  const renderer = new THREE.WebGLRenderer( {
    canvas,
    context
  } );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setSize( window.innerWidth, window.innerHeight );

  const {
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
  } = createScene();
  const info = document.getElementById( 'info' );

  if ( info ) {
    info.textContent = 'Clique dans la scene pour activer la souris (Pointer Lock). Z: accelerer, S: freiner, Q/D: strafe, Espace: monter, Shift/Ctrl: descendre, E: verrouiller la cible, Entree: approche rapide (30u), R: arreter le suivi, Echap: liberer la souris.';
  }

  window.addEventListener( 'resize', () => {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  } );

  const shipControls = createShipControls( camera, {
    speed: 10,
    maxForwardSpeed: 8,
    strafeSpeed: 0.38,
    verticalSpeed: 0.34,
    forwardAcceleration: 0.95,
    brakeDeceleration: 1.25,
    cruiseDrag: 0.75,
    domElement: canvas,
    lookSensitivity: 0.0012,
    approachMaxSpeed: 320,
    approachMinSpeed: 35,
    approachStopEpsilon: 0.25,
  } );

  const planetHud = createPlanetHud(
    camera,
    [
      { name: 'Soleil', mesh: sun, radius: SOLAR_RADII.sun },
      { name: 'Mercure', mesh: mercury, radius: SOLAR_RADII.mercury },
      { name: 'Venus', mesh: venus, radius: SOLAR_RADII.venus },
      { name: 'Terre', mesh: earth, radius: SOLAR_RADII.earth },
      { name: 'Lune', mesh: moon, radius: SOLAR_RADII.moon },
      { name: 'Mars', mesh: mars, radius: SOLAR_RADII.mars },
      { name: 'Jupiter', mesh: jupiter, radius: SOLAR_RADII.jupiter },
      { name: 'Saturne', mesh: saturn, radius: SOLAR_RADII.saturn },
      { name: 'Uranus', mesh: uranus, radius: SOLAR_RADII.uranus },
      { name: 'Neptune', mesh: neptune, radius: SOLAR_RADII.neptune },
    ],
    {
      maxAngleDegrees: 5.5,
      lockAngleDegrees: 1.7,
      distanceDecimals: 2,
      targetDistance: 0.78,
      panelPosition: { x: 0, y: 0.33, z: 0},
      panelRotationDegrees: { x: 30, y: 0, z: 0 },
    }
  );

  startRenderLoop( {
    renderer,
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
    shipControls,
    planetHud,
  } );

  function shouldIgnoreKeyEvent( event ) {
    const target = event.target;

    if ( !target ) {
      return false;
    }

    const tagName = target.tagName;

    return target.isContentEditable
      || tagName === 'INPUT'
      || tagName === 'TEXTAREA'
      || tagName === 'SELECT';
  }

  function onNavigationKeyDown( event ) {
    if ( shouldIgnoreKeyEvent( event ) ) {
      return;
    }

    if ( event.code === 'KeyE' ) {
      const lockedTarget = planetHud.lockCandidate();

      if ( lockedTarget ) {
        shipControls.setFollowTarget( lockedTarget );
      }

      if ( info ) {
        info.textContent = lockedTarget
          ? `Cible verrouillee: ${ lockedTarget.name }. Suivi actif. Appuyez sur Entree pour l'approche rapide.`
          : 'Aucune cible verrouillable. Centrez une planete dans le reticule.';
      }
      return;
    }

    if ( event.code === 'Enter' ) {
      const lockedTarget = planetHud.getLockedTarget();

      if ( !lockedTarget ) {
        if ( info ) {
          info.textContent = 'Aucune cible verrouillee. Appuyez sur E pour verrouiller une planete.';
        }
        return;
      }

      const started = shipControls.startApproach( lockedTarget, 30 );

      if ( info ) {
        info.textContent = started
          ? `Approche rapide vers ${ lockedTarget.name } en cours (arret a 30u).`
          : 'Impossible de lancer l approche rapide pour cette cible.';
      }
    }

    if ( event.code === 'KeyR' ) {
      shipControls.clearFollowTarget();

      if ( info ) {
        info.textContent = 'Suivi desactive. Le verrouillage de la cible est conserve.';
      }
    }
  }

  window.addEventListener( 'keydown', onNavigationKeyDown );


}
