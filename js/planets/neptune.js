import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createNeptune() {
  const neptuneGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_neptune.jpg' );

  const neptuneGeometry = new THREE.SphereGeometry( SOLAR_RADII.neptune, 56, 56 );
  const neptuneMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const neptune = new THREE.Mesh( neptuneGeometry, neptuneMaterial );

  neptune.position.x = ORBIT_DISTANCES.neptuneAroundSun;
  neptune.rotation.x = THREE.MathUtils.degToRad( 28.3 );
  neptune.castShadow = true;
  neptune.receiveShadow = true;

  neptuneGroup.add( neptune );

  return { neptuneGroup, neptune };
}
