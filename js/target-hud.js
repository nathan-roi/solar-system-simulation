import * as THREE from 'three';

const cameraPosition = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();
const targetPosition = new THREE.Vector3();
const targetDirection = new THREE.Vector3();

function createReticleMaterial() {
  return new THREE.ShaderMaterial( {
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uLocked: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uLocked;

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length( p );

        float ring = 1.0 - smoothstep( 0.02, 0.045, abs( r - 0.62 ) );
        float crossH = ( 1.0 - smoothstep( 0.03, 0.05, abs( p.y ) ) )
          * ( 1.0 - smoothstep( 0.78, 0.95, abs( p.x ) ) );
        float crossV = ( 1.0 - smoothstep( 0.03, 0.05, abs( p.x ) ) )
          * ( 1.0 - smoothstep( 0.78, 0.95, abs( p.y ) ) );

        float core = 1.0 - smoothstep( 0.0, 0.06, r );
        float mask = max( ring, max( crossH, max( crossV, core * 0.3 ) ) );

        float scan = 0.86 + 0.14 * sin( vUv.y * 170.0 + uTime * 8.0 );
        float flicker = 0.94 + 0.06 * sin( uTime * 25.0 );

        vec3 unlockedColor = vec3( 0.24, 0.94, 1.0 );
        vec3 lockedColor = vec3( 1.0, 0.32, 0.32 );
        vec3 color = mix( unlockedColor, lockedColor, uLocked ) * scan * flicker;

        gl_FragColor = vec4( color, mask * 0.92 );
      }
    `,
  } );
}

function createPanelMaterial( texture ) {
  return new THREE.ShaderMaterial( {
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uMap: { value: texture },
      uTime: { value: 0 },
      uLocked: { value: 0 },
      uVisible: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uLocked;
      uniform float uVisible;

      void main() {
        vec4 label = texture2D( uMap, vUv );

        float diagonalScan = 0.84 + 0.16 * sin( ( vUv.x * 0.85 + vUv.y + uTime * 0.22 ) * 240.0 );
        float flicker = 0.94 + 0.06 * sin( uTime * 18.0 );
        float edge = smoothstep( 0.0, 0.06, vUv.x )
          * smoothstep( 0.0, 0.06, vUv.y )
          * smoothstep( 0.0, 0.06, 1.0 - vUv.x )
          * smoothstep( 0.0, 0.06, 1.0 - vUv.y );
        float centerGlow = 0.82 + 0.18 * pow( 1.0 - abs( vUv.x * 2.0 - 1.0 ), 0.6 );

        vec3 unlockedColor = vec3( 0.42, 1.0, 1.0 );
        vec3 lockedColor = vec3( 1.0, 0.45, 0.45 );
        vec3 tone = mix( unlockedColor, lockedColor, uLocked );

        float alpha = label.a * uVisible * edge;
        vec3 color = label.rgb * tone * diagonalScan * flicker * centerGlow;

        gl_FragColor = vec4( color, alpha );
      }
    `,
  } );
}

function drawRoundedRect( ctx, x, y, width, height, radius ) {
  ctx.beginPath();
  ctx.moveTo( x + radius, y );
  ctx.lineTo( x + width - radius, y );
  ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
  ctx.lineTo( x + width, y + height - radius );
  ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
  ctx.lineTo( x + radius, y + height );
  ctx.quadraticCurveTo( x, y + height, x, y + height - radius );
  ctx.lineTo( x, y + radius );
  ctx.quadraticCurveTo( x, y, x + radius, y );
  ctx.closePath();
}

function updateTextCanvas( ctx, canvas, labelText, distanceText, locked ) {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  const borderColor = locked ? 'rgba(255, 120, 120, 0.85)' : 'rgba(125, 250, 255, 0.85)';
  const panelColor = locked ? 'rgba(70, 20, 20, 0.14)' : 'rgba(20, 60, 72, 0.12)';
  const glowColor = locked ? 'rgba(255, 120, 120, 0.25)' : 'rgba(125, 250, 255, 0.25)';

  drawRoundedRect( ctx, 14, 14, canvas.width - 28, canvas.height - 28, 16 );
  ctx.fillStyle = panelColor;
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo( 34, 86 );
  ctx.lineTo( canvas.width - 34, 86 );
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 28px monospace';

  ctx.font = 'bold 40px monospace';
  ctx.fillText( labelText, 34, 68 );

  ctx.font = 'bold 30px monospace';
  ctx.fillText( distanceText, 34, 126 );
}

export function createPlanetHud( camera, targets, options = {} ) {
  const maxAngleDegrees = options.maxAngleDegrees ?? 5.5;
  const maxAngleCos = Math.cos( THREE.MathUtils.degToRad( maxAngleDegrees ) );
  const lockAngleDegrees = options.lockAngleDegrees ?? 1.7;
  const lockAngleCos = Math.cos( THREE.MathUtils.degToRad( lockAngleDegrees ) );
  const distanceDecimals = options.distanceDecimals ?? 2;
  const targetDistance = options.targetDistance ?? 0.78;
  const panelPosition = options.panelPosition;
  const panelRotationDegrees = options.panelRotationDegrees;

  const hudGroup = new THREE.Group();
  hudGroup.position.set( 0, 0, -targetDistance );

  const reticleMaterial = createReticleMaterial();
  const reticleGeometry = new THREE.PlaneGeometry( 0.05, 0.05);
  const reticleMesh = new THREE.Mesh( reticleGeometry, reticleMaterial );
  reticleMesh.frustumCulled = false;
  hudGroup.add( reticleMesh );

  const textCanvas = document.createElement( 'canvas' );
  textCanvas.width = 512;
  textCanvas.height = 192;
  const textContext = textCanvas.getContext( '2d' );

  if ( !textContext ) {
    throw new Error( 'Impossible de creer le contexte 2D pour le HUD holographique.' );
  }

  const textTexture = new THREE.CanvasTexture( textCanvas );
  textTexture.colorSpace = THREE.SRGBColorSpace;
  textTexture.needsUpdate = true;

  const panelMaterial = createPanelMaterial( textTexture );
  const panelGeometry = new THREE.PlaneGeometry( 0.27, 0.08 );
  const panelMesh = new THREE.Mesh( panelGeometry, panelMaterial );
  panelMesh.position.set( panelPosition.x, panelPosition.y, panelPosition.z );
  panelMesh.rotation.set(
    THREE.MathUtils.degToRad( panelRotationDegrees.x ),
    THREE.MathUtils.degToRad( panelRotationDegrees.y ),
    THREE.MathUtils.degToRad( panelRotationDegrees.z ),
  );
  const panelBasePosition = panelMesh.position.clone();
  panelMesh.renderOrder = 12;
  panelMesh.frustumCulled = false;
  panelMesh.visible = false;
  hudGroup.add( panelMesh );

  let lastLabelText = '';
  let lastDistanceText = '';
  let lastLockState = false;
  let currentLockCandidate = null;
  let lockedTarget = null;

  function clearHud() {
    panelMesh.visible = false;
    panelMaterial.uniforms.uVisible.value = 0;
    panelMaterial.uniforms.uLocked.value = 0;
    reticleMaterial.uniforms.uLocked.value = 0;
  }

  function lockCandidate() {
    if ( !currentLockCandidate || !currentLockCandidate.canLock ) {
      return null;
    }

    lockedTarget = currentLockCandidate.target;
    return lockedTarget;
  }

  function unlockTarget() {
    lockedTarget = null;
  }

  function getLockedTarget() {
    return lockedTarget;
  }

  function update( deltaSeconds = 0 ) {
    const delta = Number.isFinite( deltaSeconds ) ? deltaSeconds : 0;
    reticleMaterial.uniforms.uTime.value += delta;
    panelMaterial.uniforms.uTime.value += delta;

    camera.getWorldPosition( cameraPosition );
    camera.getWorldDirection( cameraDirection ).normalize();

    let bestTarget = null;

    for ( const target of targets ) {
      if ( !target || !target.mesh ) {
        continue;
      }

      target.mesh.getWorldPosition( targetPosition );
      targetDirection.copy( targetPosition ).sub( cameraPosition );

      const centerDistance = targetDirection.length();
      if ( centerDistance <= 0 ) {
        continue;
      }

      targetDirection.divideScalar( centerDistance );

      const alignment = cameraDirection.dot( targetDirection );
      if ( alignment < maxAngleCos ) {
        continue;
      }

      const radius = target.radius ?? 0;
      const surfaceDistance = Math.max( centerDistance - radius, 0 );
      const angularError = 1 - alignment;

      if ( !bestTarget || angularError < bestTarget.angularError ) {
        bestTarget = {
          target,
          name: target.name ?? 'Objet',
          surfaceDistance,
          alignment,
          angularError,
        };
      }
    }

    if ( !bestTarget ) {
      currentLockCandidate = null;
      clearHud();
      return;
    }

    const canLock = bestTarget.alignment >= lockAngleCos;
    currentLockCandidate = {
      target: bestTarget.target,
      canLock,
    };

    const isLocked = Boolean( lockedTarget && lockedTarget.mesh === bestTarget.target.mesh );
    const labelText = bestTarget.name.toUpperCase();
    const distanceText = `DISTANCE: ${ bestTarget.surfaceDistance.toFixed( distanceDecimals ) } u`;

    if (
      labelText !== lastLabelText
      || distanceText !== lastDistanceText
      || isLocked !== lastLockState
    ) {
      updateTextCanvas( textContext, textCanvas, labelText, distanceText, isLocked );
      textTexture.needsUpdate = true;
      lastLabelText = labelText;
      lastDistanceText = distanceText;
      lastLockState = isLocked;
    }

    panelMesh.visible = true;
    const drift = Math.sin( panelMaterial.uniforms.uTime.value * 1.3 ) * 0.002;
    panelMesh.position.set(
      panelBasePosition.x + drift * 0.6,
      panelBasePosition.y + drift,
      panelBasePosition.z,
    );
    panelMaterial.uniforms.uVisible.value = 1;
    panelMaterial.uniforms.uLocked.value = isLocked ? 1 : 0;
    reticleMaterial.uniforms.uLocked.value = isLocked ? 1 : 0;
  }

  function dispose() {
    clearHud();
    camera.remove( hudGroup );

    reticleGeometry.dispose();
    reticleMaterial.dispose();

    panelGeometry.dispose();
    panelMaterial.dispose();
    textTexture.dispose();
  }

  camera.add( hudGroup );
  clearHud();

  return {
    update,
    dispose,
    lockCandidate,
    unlockTarget,
    getLockedTarget,
  };
}