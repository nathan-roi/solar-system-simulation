import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createEarth() {
    const earthGroup = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load( 'images/planets_texture/earth_atmos_2048.jpg' );
    const specularMap = textureLoader.load( 'images/planets_texture/earth_specular_2048.jpg' );
    const normalMap = textureLoader.load( 'images/planets_texture/earth_normal_2048.jpg' );

    const earthGeometry = new THREE.SphereGeometry( SOLAR_RADII.earth, 64, 64 );
    const earthMaterial = new THREE.MeshStandardMaterial( {
        map,
        specularMap,
        normalMap,
      normalScale: new THREE.Vector2( 0.7, 0.7 ),
} );
    const earth = new THREE.Mesh( earthGeometry, earthMaterial );

    earth.position.x = ORBIT_DISTANCES.earthAroundSun;
    earth.rotation.x = Math.PI / 5;
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthGroup.add( earth );

    return { earthGroup, earth };
}