import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createMoon() {
    const moonGroup = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load( 'images/planets_texture/2k_moon.jpg' );

    const moonGeometry = new THREE.SphereGeometry( SOLAR_RADII.moon, 48, 48 );
    const moonMaterial = new THREE.MeshStandardMaterial( {
        map,
    } );
    const moon = new THREE.Mesh( moonGeometry, moonMaterial );

    moon.position.x = ORBIT_DISTANCES.moonAroundEarth;
    moon.castShadow = true;
    moon.receiveShadow = true;
    moonGroup.add( moon );

    return { moonGroup, moon };
}