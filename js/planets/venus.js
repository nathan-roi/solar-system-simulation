import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createVenus() {
  const venusGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load( 'images/planets_texture/2k_venus_surface.jpg' );

  const venusGeometry = new THREE.SphereGeometry( SOLAR_RADII.venus, 48, 48 );
  const venusMaterial = new THREE.MeshStandardMaterial( {
    map,
  } );
  const venus = new THREE.Mesh( venusGeometry, venusMaterial );

  venus.position.x = ORBIT_DISTANCES.venusAroundSun;
  venus.rotation.x = THREE.MathUtils.degToRad( 177.4 );
  venus.castShadow = true;
  venus.receiveShadow = true;

  venusGroup.add( venus );

  return { venusGroup, venus };
}
