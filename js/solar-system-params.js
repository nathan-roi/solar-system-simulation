// Radii are expressed in Earth-radius units.
const EARTH_RADIUS = 1;
const SUN_RADIUS = 109;
const MOON_RADIUS = 0.273;

// Planetary radii in Earth-radius units.
const MERCURY_RADIUS = 0.383;
const VENUS_RADIUS = 0.949;
const MARS_RADIUS = 0.532;
const JUPITER_RADIUS = 11.21;
const SATURN_RADIUS = 9.45;
const URANUS_RADIUS = 4.01;
const NEPTUNE_RADIUS = 3.88;

// Real center-to-center distances in Earth-radius units.
const EARTH_SUN_DISTANCE_REAL = 23455;
const EARTH_MOON_DISTANCE_REAL = 60.3;

// Mean orbital distance in astronomical units (AU).
const ORBIT_RADIUS_AU = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.07,
};

// Use separate compression factors so local Earth-Moon scale stays readable.
const EARTH_SUN_DISTANCE_COMPRESSION = 0.02;
const EARTH_MOON_DISTANCE_COMPRESSION = 0.08;

export const SOLAR_RADII = {
  mercury: MERCURY_RADIUS,
  venus: VENUS_RADIUS,
  earth: EARTH_RADIUS,
  mars: MARS_RADIUS,
  jupiter: JUPITER_RADIUS,
  saturn: SATURN_RADIUS,
  uranus: URANUS_RADIUS,
  neptune: NEPTUNE_RADIUS,
  sun: SUN_RADIUS,
  moon: MOON_RADIUS,
};

export const ORBIT_DISTANCES = {
  mercuryAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.mercury * EARTH_SUN_DISTANCE_COMPRESSION,
  venusAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.venus * EARTH_SUN_DISTANCE_COMPRESSION,
  earthAroundSun: EARTH_SUN_DISTANCE_REAL * EARTH_SUN_DISTANCE_COMPRESSION,
  marsAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.mars * EARTH_SUN_DISTANCE_COMPRESSION,
  jupiterAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.jupiter * EARTH_SUN_DISTANCE_COMPRESSION,
  saturnAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.saturn * EARTH_SUN_DISTANCE_COMPRESSION,
  uranusAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.uranus * EARTH_SUN_DISTANCE_COMPRESSION,
  neptuneAroundSun: EARTH_SUN_DISTANCE_REAL * ORBIT_RADIUS_AU.neptune * EARTH_SUN_DISTANCE_COMPRESSION,
  moonAroundEarth: EARTH_MOON_DISTANCE_REAL * EARTH_MOON_DISTANCE_COMPRESSION,
};

// Orbital periods in Earth years.
export const ORBITAL_PERIOD_YEARS = {
  mercury: 0.241,
  venus: 0.615,
  earth: 1,
  mars: 1.881,
  jupiter: 11.86,
  saturn: 29.46,
  uranus: 84.01,
  neptune: 164.8,
};

// Sidereal rotation periods in Earth days.
// Negative values represent retrograde rotation.
export const ROTATION_PERIOD_DAYS = {
  mercury: 58.646,
  venus: -243.025,
  earth: 1,
  mars: 1.026,
  jupiter: 0.4135,
  saturn: 0.444,
  uranus: -0.718,
  neptune: 0.671,
  sun: 24.47,
};
