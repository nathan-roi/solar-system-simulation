import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createMercury() {
  const mercuryGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_mercury.jpg' );

  const mercuryGeometry = new THREE.SphereGeometry( SOLAR_RADII.mercury, 48, 48 );
  const mercuryMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const mercury = new THREE.Mesh( mercuryGeometry, mercuryMaterial );

  mercury.position.x = ORBIT_DISTANCES.mercuryAroundSun;
  mercury.rotation.x = THREE.MathUtils.degToRad( 0.03 );
  mercury.castShadow = true;
  mercury.receiveShadow = true;

  mercuryGroup.add( mercury );

  return { mercuryGroup, mercury };
}
