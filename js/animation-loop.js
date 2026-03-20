import { ORBITAL_PERIOD_YEARS, ROTATION_PERIOD_DAYS } from './solar-system-params.js';

export function startRenderLoop( {
  renderer,
  scene,
  camera,
  sunGroup,
  sun,
  mercuryGroup,
  mercury,
  venusGroup,
  venus,
  earthGroup,
  earth,
  moonGroup,
  marsGroup,
  mars,
  jupiterGroup,
  jupiter,
  saturnGroup,
  saturn,
  uranusGroup,
  uranus,
  neptuneGroup,
  neptune,
  shipControls,
  planetHud,
} ) {
  const twoPi = Math.PI * 2;
  const startTime = performance.now();
  let previousFrameTime = startTime;
  // With realistic scale ratios, keep orbital motion slower for readability/gameplay.
  const YEAR_DURATION_SECONDS = 4000;

  const earthYearDurationSeconds = YEAR_DURATION_SECONDS;
  const earthDayDurationSeconds = earthYearDurationSeconds / 365;
  const moonOrbitDurationSeconds = 70;

  const orbitDurationsSeconds = {
    mercury: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.mercury,
    venus: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.venus,
    earth: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.earth,
    mars: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.mars,
    jupiter: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.jupiter,
    saturn: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.saturn,
    uranus: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.uranus,
    neptune: earthYearDurationSeconds * ORBITAL_PERIOD_YEARS.neptune,
  };

  const rotationDurationsSeconds = {
    mercury: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.mercury,
    venus: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.venus,
    earth: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.earth,
    mars: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.mars,
    jupiter: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.jupiter,
    saturn: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.saturn,
    uranus: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.uranus,
    neptune: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.neptune,
    sun: earthDayDurationSeconds * ROTATION_PERIOD_DAYS.sun,
  };

  function computeAngle( elapsedSeconds, durationSeconds ) {
    const direction = Math.sign( durationSeconds ) || 1;
    const absoluteDuration = Math.abs( durationSeconds );

    return direction * ( ( elapsedSeconds % absoluteDuration ) / absoluteDuration ) * twoPi;
  }

  function animate( deltaSeconds, elapsedSeconds ) {
    if ( shipControls ) {
      shipControls.update( deltaSeconds );
    }

    if ( planetHud ) {
      planetHud.update( deltaSeconds );
    }

    mercuryGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.mercury );
    venusGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.venus );
    earthGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.earth );
    moonGroup.rotation.y = computeAngle( elapsedSeconds, moonOrbitDurationSeconds );
    marsGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.mars );
    jupiterGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.jupiter );
    saturnGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.saturn );
    uranusGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.uranus );
    neptuneGroup.rotation.y = computeAngle( elapsedSeconds, orbitDurationsSeconds.neptune );

    mercury.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.mercury );
    venus.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.venus );
    earth.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.earth );
    mars.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.mars );
    jupiter.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.jupiter );
    saturn.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.saturn );
    uranus.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.uranus );
    neptune.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.neptune );
    sun.rotation.y = computeAngle( elapsedSeconds, rotationDurationsSeconds.sun );
  }

  function render() {
    renderer.render( scene, camera );
  }

  function run() {
    requestAnimationFrame( run );

    const currentFrameTime = performance.now();
    const elapsedSeconds = ( currentFrameTime - startTime ) / 1000;
    const deltaSeconds = Math.min( ( currentFrameTime - previousFrameTime ) / 1000, 0.1 );
    previousFrameTime = currentFrameTime;

    animate( deltaSeconds, elapsedSeconds );
    render();
  }

  run();
}
