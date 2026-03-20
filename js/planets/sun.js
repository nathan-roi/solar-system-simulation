import * as THREE from '../../three.module.js';
import { ORBIT_DISTANCES, SOLAR_RADII } from '../solar-system-params.js';

export function createSun() {
    const sunGroup = new THREE.Group();

    const mapUrl = 'images/planets_texture/2k_sun.jpg';
    const map = new THREE.TextureLoader().load( mapUrl );

    const sunGeometry = new THREE.SphereGeometry( SOLAR_RADII.sun, 64, 64 );
    const sunMaterial = new THREE.MeshBasicMaterial( {
        color: 0xFAE89F,
        map
    } );
    const sun = new THREE.Mesh( sunGeometry, sunMaterial );

    // In space there is no atmospheric attenuation: keep constant irradiance in this scene.
    // decay = 0 removes inverse-square falloff so distant planets stay visible.
    const light = new THREE.PointLight( 0xFAE89F, 2.4, 0, 0 );
    light.position.set( 0, 0, 0 );
    light.castShadow = true;
    light.shadow.mapSize.set( 2048, 2048 );
    light.shadow.camera.near = 1;
    light.shadow.camera.far = ORBIT_DISTANCES.neptuneAroundSun + 120;

    sunGroup.add( sun );
    sunGroup.add( light );

    return { sunGroup, sun, light };
}
