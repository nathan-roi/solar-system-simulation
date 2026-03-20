import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createUranus() {
  const uranusGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_uranus.jpg' );

  const uranusGeometry = new THREE.SphereGeometry( SOLAR_RADII.uranus, 56, 56 );
  const uranusMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const uranus = new THREE.Mesh( uranusGeometry, uranusMaterial );

  uranus.position.x = ORBIT_DISTANCES.uranusAroundSun;
  uranus.rotation.x = THREE.MathUtils.degToRad( 97.8 );
  uranus.castShadow = true;
  uranus.receiveShadow = true;

  uranusGroup.add( uranus );

  return { uranusGroup, uranus };
}
