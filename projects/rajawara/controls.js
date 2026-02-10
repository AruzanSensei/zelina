(() => {
  let pointerLocked = false;
  let dragging = false;
  let dragPointerId = null;
  let lastTouch = { x: 0, y: 0 };
  let joystickActive = false;
  const pinchState = {
    active: false,
    id1: null,
    id2: null,
    startDist: 0,
    startZoom: 0
  };

  const handleKey = (down) => (event) => {
    if (!Game.runtime.started) return;
    const controls = Game.controls;
    switch (event.code) {
      case 'KeyW': controls.forward = down; break;
      case 'KeyS': controls.backward = down; break;
      case 'KeyA': controls.left = down; break;
      case 'KeyD': controls.right = down; break;
      case 'ShiftLeft':
      case 'ShiftRight': controls.sprint = down; break;
      case 'KeyE': if (down) Game.actions.interact(); break;
      case 'KeyM':
        if (down) Game.dom.minimap.style.display = (Game.runtime.showMap = !Game.runtime.showMap) ? 'flex' : 'none';
        break;
      default: break;
    }
  };

  const setupInput = () => {
    const { canvas } = Game.dom;
    window.addEventListener('keydown', handleKey(true));
    window.addEventListener('keyup', handleKey(false));

    canvas.addEventListener('click', () => {
      if (window.innerWidth > 900) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      pointerLocked = document.pointerLockElement === canvas;
    });

    document.addEventListener('mousemove', (event) => {
      if (!Game.runtime.started) return;
      if (pointerLocked) {
        Game.controls.rotateY -= event.movementX * 0.0025;
        Game.controls.rotateX -= event.movementY * 0.0025;
      }
    });

    const touchPoints = new Map();
    const updatePinch = () => {
      if (pinchState.id1 == null || pinchState.id2 == null) return;
      const p1 = touchPoints.get(pinchState.id1);
      const p2 = touchPoints.get(pinchState.id2);
      if (!p1 || !p2) return;
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const delta = dist - pinchState.startDist;
      Game.runtime.cameraDistance = Game.utils.clamp(
        pinchState.startZoom + delta * 0.02,
        Game.runtime.cameraMin,
        Game.runtime.cameraMax
      );
    };

    canvas.addEventListener('pointerdown', (event) => {
      if (window.innerWidth > 900) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      if (event.pointerType === 'touch') {
        touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (touchPoints.size === 2 && !pinchState.active) {
          const ids = Array.from(touchPoints.keys());
          pinchState.active = true;
          pinchState.id1 = ids[0];
          pinchState.id2 = ids[1];
          const p1 = touchPoints.get(pinchState.id1);
          const p2 = touchPoints.get(pinchState.id2);
          pinchState.startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          pinchState.startZoom = Game.runtime.cameraDistance || (15 - Game.state.level * 0.25);
          dragging = false;
          if (dragPointerId != null && canvas.hasPointerCapture(dragPointerId)) {
            canvas.releasePointerCapture(dragPointerId);
          }
          dragPointerId = null;
          event.preventDefault();
          return;
        }
      }

      dragging = true;
      dragPointerId = event.pointerId;
      lastTouch = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    }, { passive: false });

    canvas.addEventListener('pointermove', (event) => {
      if (window.innerWidth > 900) return;
      if (event.pointerType === 'touch' && touchPoints.has(event.pointerId)) {
        touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pinchState.active) {
          updatePinch();
          event.preventDefault();
          return;
        }
      }
      if (!dragging || event.pointerId !== dragPointerId) return;
      const dx = event.clientX - lastTouch.x;
      const dy = event.clientY - lastTouch.y;
      lastTouch = { x: event.clientX, y: event.clientY };
      Game.controls.rotateY -= dx * 0.003;
      Game.controls.rotateX -= dy * 0.003;
      event.preventDefault();
    }, { passive: false });

    const endPointer = (event) => {
      if (event.pointerType === 'touch') {
        touchPoints.delete(event.pointerId);
        if (pinchState.id1 === event.pointerId || pinchState.id2 === event.pointerId) {
          pinchState.active = false;
          pinchState.id1 = null;
          pinchState.id2 = null;
        }
      }
      if (event.pointerId !== dragPointerId) return;
      dragging = false;
      dragPointerId = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
  };

  const setupJoystick = () => {
    const joystick = Game.dom.joystick;
    const stick = Game.dom.stick;
    let activePointerId = null;
    let origin = { x: 0, y: 0 };
    let max = 40;

    const updateStick = (x, y) => {
      const dx = Game.utils.clamp(x - origin.x, -max, max);
      const dy = Game.utils.clamp(y - origin.y, -max, max);
      stick.style.transform = `translate(${dx}px, ${dy}px)`;

      const nx = dx / max;
      const ny = -dy / max;
      const mag = Math.hypot(nx, ny);
      const deadzone = 0.12;
      if (mag < deadzone) {
        Game.controls.moveX = 0;
        Game.controls.moveY = 0;
        joystickActive = false;
        return;
      }
      const scale = (mag - deadzone) / (1 - deadzone);
      Game.controls.moveX = (nx / mag) * scale;
      Game.controls.moveY = (ny / mag) * scale;
      joystickActive = true;
    };

    joystick.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      activePointerId = event.pointerId;
      const rect = joystick.getBoundingClientRect();
      origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      max = rect.width * 0.42;
      joystick.setPointerCapture(event.pointerId);
      updateStick(event.clientX, event.clientY);
      event.preventDefault();
    }, { passive: false });

    joystick.addEventListener('pointermove', (event) => {
      if (event.pointerId !== activePointerId) return;
      updateStick(event.clientX, event.clientY);
      event.preventDefault();
    }, { passive: false });

    const endStick = (event) => {
      if (event.pointerId !== activePointerId) return;
      activePointerId = null;
      Game.controls.moveX = 0;
      Game.controls.moveY = 0;
      joystickActive = false;
      stick.style.transform = 'translate(-50%, -50%)';
      if (joystick.hasPointerCapture(event.pointerId)) {
        joystick.releasePointerCapture(event.pointerId);
      }
    };

    joystick.addEventListener('pointerup', endStick);
    joystick.addEventListener('pointercancel', endStick);
  };

  const updatePlayer = (delta) => {
    const controls = Game.controls;
    const moveX = controls.moveX || (controls.right ? 1 : 0) + (controls.left ? -1 : 0);
    const moveY = controls.moveY || (controls.forward ? 1 : 0) + (controls.backward ? -1 : 0);
    const forward = new THREE.Vector3(-Math.sin(controls.rotateY), 0, -Math.cos(controls.rotateY));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const speed = (controls.sprint ? Game.player.runSpeed : Game.player.speed) *
      (0.6 + Game.state.hunger / 200) *
      (0.6 + Game.state.thirst / 200);

    Game.player.direction.set(0, 0, 0);
    Game.player.direction.addScaledVector(forward, moveY);
    Game.player.direction.addScaledVector(right, moveX);
    if (Game.player.direction.lengthSq() > 0.001) {
      Game.player.direction.normalize();
      Game.player.velocity.copy(Game.player.direction).multiplyScalar(speed * delta);
      Game.player.mesh.position.add(Game.player.velocity);
      Game.player.mesh.rotation.y = Math.atan2(Game.player.direction.x, Game.player.direction.z);

      if (window.innerWidth <= 900 && joystickActive) {
        const desiredYaw = Math.atan2(Game.player.direction.x, Game.player.direction.z);
        const diff = Math.atan2(Math.sin(desiredYaw - controls.rotateY), Math.cos(desiredYaw - controls.rotateY));
        controls.rotateY += diff * 0.18;
      }
    }

    Game.player.mesh.position.x = Game.utils.clamp(Game.player.mesh.position.x, -150, 150);
    Game.player.mesh.position.z = Game.utils.clamp(Game.player.mesh.position.z, -150, 150);
    Game.player.mesh.position.y = Game.env.groundHeight(Game.player.mesh.position.x, Game.player.mesh.position.z) + 0.6;
  };

  const updateCamera = () => {
    Game.controls.rotateX = Game.utils.clamp(Game.controls.rotateX, -0.75, 0.6);
    if (!Game.runtime.cameraDistance) {
      Game.runtime.cameraDistance = 15 - Game.state.level * 0.25;
    }
    const distance = Game.utils.clamp(
      Game.runtime.cameraDistance,
      Game.runtime.cameraMin,
      Game.runtime.cameraMax
    );
    const target = Game.player.mesh.position.clone();
    const offset = new THREE.Vector3(
      Math.sin(Game.controls.rotateY) * Math.cos(Game.controls.rotateX),
      Math.sin(Game.controls.rotateX),
      Math.cos(Game.controls.rotateY) * Math.cos(Game.controls.rotateX)
    ).multiplyScalar(distance);
    Game.env.camera.position.copy(target).add(offset);
    Game.env.camera.lookAt(target.x, target.y + 2, target.z);
  };

  Game.controlsApi = {
    setupInput,
    setupJoystick,
    updatePlayer,
    updateCamera
  };
})();
