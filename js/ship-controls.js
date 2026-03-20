import * as THREE from 'three';

export function createShipControls( camera, options = {} ) {
  const speed = options.speed ?? 6;
  const maxForwardSpeed = options.maxForwardSpeed ?? speed;
  const strafeSpeed = options.strafeSpeed ?? speed * 0.8;
  const verticalSpeed = options.verticalSpeed ?? speed;
  const forwardAcceleration = options.forwardAcceleration ?? maxForwardSpeed * 1.8;
  const brakeDeceleration = options.brakeDeceleration ?? maxForwardSpeed * 2.6;
  const cruiseDrag = options.cruiseDrag ?? maxForwardSpeed * 1.0;
  const accelLiftOffset = options.accelLiftOffset ?? 0.12;
  const liftSmoothing = options.liftSmoothing ?? 8;
  const lookSensitivity = options.lookSensitivity ?? 0.002;
  const domElement = options.domElement ?? document.body;
  const maxPitch = Math.PI / 2 - 0.01;
  const approachMaxSpeed = options.approachMaxSpeed ?? 320;
  const approachMinSpeed = options.approachMinSpeed ?? 35;
  const approachStopEpsilon = options.approachStopEpsilon ?? 0.2;

  const state = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    pointerLocked: false,
  };

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const worldUp = new THREE.Vector3( 0, 1, 0 );
  const lookTarget = new THREE.Vector3();
  const worldLookTarget = new THREE.Vector3();
  const followOffset = new THREE.Vector3();
  let forwardVelocity = 0;
  let liftOffset = 0;
  let approachTarget = null;
  let followTarget = null;

  camera.getWorldDirection( forward );
  let yaw = Math.atan2( forward.x, forward.z );
  let pitch = Math.asin( THREE.MathUtils.clamp( forward.y, -1, 1 ) );

  function setKeyState( code, isPressed ) {
    switch ( code ) {
      case 'KeyZ':
      case 'KeyW':
        state.forward = isPressed;
        break;
      case 'KeyS':
        state.backward = isPressed;
        break;
      case 'KeyQ':
      case 'KeyA':
        state.left = isPressed;
        break;
      case 'KeyD':
        state.right = isPressed;
        break;
      case 'Space':
        state.up = isPressed;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'ControlLeft':
      case 'ControlRight':
        state.down = isPressed;
        break;
      default:
        break;
    }
  }

  function shouldIgnoreKeyEvent( event ) {
    const target = event.target;

    if ( !target ) {
      return false;
    }

    const tagName = target.tagName;

    return target.isContentEditable
      || tagName === 'INPUT'
      || tagName === 'TEXTAREA'
      || tagName === 'SELECT';
  }

  function onKeyDown( event ) {
    if ( shouldIgnoreKeyEvent( event ) ) {
      return;
    }

    setKeyState( event.code, true );
  }

  function onKeyUp( event ) {
    setKeyState( event.code, false );
  }

  function onMouseMove( event ) {
    if ( !state.pointerLocked ) {
      return;
    }

    yaw -= event.movementX * lookSensitivity;
    pitch -= event.movementY * lookSensitivity;
    pitch = THREE.MathUtils.clamp( pitch, -maxPitch, maxPitch );

    const cosPitch = Math.cos( pitch );
    lookTarget.set(
      Math.sin( yaw ) * cosPitch,
      Math.sin( pitch ),
      Math.cos( yaw ) * cosPitch,
    );

    worldLookTarget.copy( camera.position ).add( lookTarget );
    camera.lookAt( worldLookTarget );
  }

  function onPointerLockChange() {
    state.pointerLocked = document.pointerLockElement === domElement;
  }

  function onPointerLockError() {
    console.warn( 'Pointer Lock indisponible sur cet element.' );
  }

  function onMouseDown() {
    if ( !state.pointerLocked ) {
      domElement.requestPointerLock();
    }
  }

  window.addEventListener( 'keydown', onKeyDown );
  window.addEventListener( 'keyup', onKeyUp );
  window.addEventListener( 'mousemove', onMouseMove );
  document.addEventListener( 'pointerlockchange', onPointerLockChange );
  document.addEventListener( 'pointerlockerror', onPointerLockError );
  domElement.addEventListener( 'mousedown', onMouseDown );

  function moveToward( value, target, maxDelta ) {
    if ( value < target ) {
      return Math.min( value + maxDelta, target );
    }

    return Math.max( value - maxDelta, target );
  }

  function startApproach( target, stopDistance = 30 ) {
    if ( !target || !target.mesh ) {
      return false;
    }

    approachTarget = {
      mesh: target.mesh,
      radius: target.radius ?? 0,
      stopDistance,
    };

    return true;
  }

  function setFollowTarget( target ) {
    if ( !target || !target.mesh ) {
      return false;
    }

    target.mesh.getWorldPosition( worldLookTarget );
    followOffset.copy( camera.position ).sub( worldLookTarget );
    followTarget = { mesh: target.mesh };

    return true;
  }

  function clearFollowTarget() {
    followTarget = null;
  }

  function isFollowingTarget() {
    return Boolean( followTarget );
  }

  function updateFollowTarget() {
    if ( !followTarget || !followTarget.mesh ) {
      return false;
    }

    followTarget.mesh.getWorldPosition( worldLookTarget );
    camera.position.copy( worldLookTarget ).add( followOffset );
    camera.lookAt( worldLookTarget );
    forwardVelocity = 0;

    return true;
  }

  function stopApproach() {
    approachTarget = null;
  }

  function isApproachActive() {
    return Boolean( approachTarget );
  }

  function updateApproach( deltaSeconds ) {
    if ( !approachTarget || !approachTarget.mesh ) {
      return false;
    }

    approachTarget.mesh.getWorldPosition( worldLookTarget );
    lookTarget.copy( worldLookTarget ).sub( camera.position );

    const centerDistance = lookTarget.length();
    if ( centerDistance <= 1e-6 ) {
      stopApproach();
      return false;
    }

    const desiredCenterDistance = Math.max( approachTarget.radius + approachTarget.stopDistance, 0 );
    const remainingDistance = centerDistance - desiredCenterDistance;

    lookTarget.divideScalar( centerDistance );
    camera.lookAt( worldLookTarget );

    if ( remainingDistance <= approachStopEpsilon ) {
      camera.position.copy( worldLookTarget ).addScaledVector( lookTarget, -desiredCenterDistance );
      if ( followTarget && followTarget.mesh === approachTarget.mesh ) {
        followOffset.copy( camera.position ).sub( worldLookTarget );
      }
      forwardVelocity = 0;
      liftOffset = 0;
      stopApproach();
      return true;
    }

    const desiredSpeed = THREE.MathUtils.clamp( remainingDistance * 2.4, approachMinSpeed, approachMaxSpeed );
    const step = Math.min( desiredSpeed * deltaSeconds, remainingDistance );
    camera.position.addScaledVector( lookTarget, step );
    forwardVelocity = 0;

    return true;
  }

  function update( deltaSeconds ) {
    if ( updateApproach( deltaSeconds ) ) {
      return;
    }

    if ( updateFollowTarget() ) {
      return;
    }

    camera.getWorldDirection( forward );
    forward.y = 0;

    if ( forward.lengthSq() > 0 ) {
      forward.normalize();
    } else {
      // Fallback when camera direction is nearly vertical.
      forward.set( 0, 0, -1 );
    }

    right.crossVectors( forward, camera.up ).normalize();

    if ( state.forward && !state.backward ) {
      forwardVelocity = Math.min(
        forwardVelocity + forwardAcceleration * deltaSeconds,
        maxForwardSpeed,
      );
    } else if ( state.backward ) {
      // Brake progressively: reduce speed smoothly until full stop.
      forwardVelocity = Math.max( forwardVelocity - brakeDeceleration * deltaSeconds, 0 );
    } else {
      forwardVelocity = moveToward( forwardVelocity, 0, cruiseDrag * deltaSeconds );
    }

    camera.position.addScaledVector( forward, forwardVelocity * deltaSeconds );

    const targetLiftOffset = state.forward && !state.backward
      ? accelLiftOffset
      : ( state.backward ? -accelLiftOffset : 0 );
    const liftLerp = 1 - Math.exp( -liftSmoothing * deltaSeconds );
    const nextLiftOffset = THREE.MathUtils.lerp( liftOffset, targetLiftOffset, liftLerp );
    camera.position.addScaledVector( worldUp, nextLiftOffset - liftOffset );
    liftOffset = nextLiftOffset;

    if ( state.left ) {
      camera.position.addScaledVector( right, -strafeSpeed * deltaSeconds );
    }

    if ( state.right ) {
      camera.position.addScaledVector( right, strafeSpeed * deltaSeconds );
    }

    if ( state.up ) {
      camera.position.addScaledVector( worldUp, verticalSpeed * deltaSeconds );
    }

    if ( state.down ) {
      camera.position.addScaledVector( worldUp, -verticalSpeed * deltaSeconds );
    }
  }

  function dispose() {
    window.removeEventListener( 'keydown', onKeyDown );
    window.removeEventListener( 'keyup', onKeyUp );
    window.removeEventListener( 'mousemove', onMouseMove );
    document.removeEventListener( 'pointerlockchange', onPointerLockChange );
    document.removeEventListener( 'pointerlockerror', onPointerLockError );
    domElement.removeEventListener( 'mousedown', onMouseDown );

    if ( document.pointerLockElement === domElement ) {
      document.exitPointerLock();
    }
  }

  return {
    update,
    dispose,
    startApproach,
    stopApproach,
    isApproachActive,
    setFollowTarget,
    clearFollowTarget,
    isFollowingTarget,
  };
}
