import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createSaturn() {
  const saturnGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_saturn.jpg' );

  const saturnGeometry = new THREE.SphereGeometry( SOLAR_RADII.saturn, 64, 64 );
  const saturnMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const saturn = new THREE.Mesh( saturnGeometry, saturnMaterial );

  saturn.position.x = ORBIT_DISTANCES.saturnAroundSun;
  saturn.rotation.x = THREE.MathUtils.degToRad( 26.7 );
  saturn.castShadow = true;
  saturn.receiveShadow = true;

  const ringInnerRadius = SOLAR_RADII.saturn * 1.25;
  const ringOuterRadius = SOLAR_RADII.saturn * 2.3;
  const ringGeometry = new THREE.RingGeometry( ringInnerRadius, ringOuterRadius, 128 );
  const ringMap = textureLoader.load( 'images/planets_texture/2k_saturn_ring_alpha.png' );
  const ringMaterial = new THREE.MeshStandardMaterial( {
    map: ringMap,
    alphaMap: ringMap,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  } );
  const rings = new THREE.Mesh( ringGeometry, ringMaterial );

  rings.position.copy( saturn.position );
  rings.rotation.x = Math.PI / 2;

  saturnGroup.add( saturn );
  saturnGroup.add( rings );

  return { saturnGroup, saturn };
}
