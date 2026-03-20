import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createMars() {
  const marsGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_mars.jpg' );

  const marsGeometry = new THREE.SphereGeometry( SOLAR_RADII.mars, 48, 48 );
  const marsMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const mars = new THREE.Mesh( marsGeometry, marsMaterial );

  mars.position.x = ORBIT_DISTANCES.marsAroundSun;
  mars.rotation.x = THREE.MathUtils.degToRad( 25.2 );
  mars.castShadow = true;
  mars.receiveShadow = true;

  marsGroup.add( mars );

  return { marsGroup, mars };
}
