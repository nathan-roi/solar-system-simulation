import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createJupiter() {
  const jupiterGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_jupiter.jpg' );

  const jupiterGeometry = new THREE.SphereGeometry( SOLAR_RADII.jupiter, 64, 64 );
  const jupiterMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const jupiter = new THREE.Mesh( jupiterGeometry, jupiterMaterial );

  jupiter.position.x = ORBIT_DISTANCES.jupiterAroundSun;
  jupiter.rotation.x = THREE.MathUtils.degToRad( 3.1 );
  jupiter.castShadow = true;
  jupiter.receiveShadow = true;

  jupiterGroup.add( jupiter );

  return { jupiterGroup, jupiter };
}
