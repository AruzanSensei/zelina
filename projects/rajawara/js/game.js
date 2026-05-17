(() => {
  const dom = {
    canvas: document.getElementById('game'),
    levelEl: document.getElementById('level'),
    ageEl: document.getElementById('age'),
    expFill: document.getElementById('exp-fill'),
    expText: document.getElementById('exp-text'),
    stats: {
      hunger: { ring: document.getElementById('hunger-ring'), value: document.getElementById('hunger-value') },
      thirst: { ring: document.getElementById('thirst-ring'), value: document.getElementById('thirst-value') },
      boredom: { ring: document.getElementById('boredom-ring'), value: document.getElementById('boredom-value') },
      fatigue: { ring: document.getElementById('fatigue-ring'), value: document.getElementById('fatigue-value') }
    },
    toast: document.getElementById('toast'),
    expPop: document.getElementById('exp-pop'),
    menu: document.getElementById('menu'),
    startBtn: document.getElementById('start'),
    btnEat: document.getElementById('btn-eat'),
    btnDrink: document.getElementById('btn-drink'),
    btnSleep: document.getElementById('btn-sleep'),
    btnHunt: document.getElementById('btn-hunt'),
    buttonsWrap: document.querySelector('#mobile-controls .buttons'),
    joystick: document.getElementById('joystick'),
    stick: document.getElementById('stick'),
    minimap: document.getElementById('minimap')
  };
  Game.dom = dom;

  const env = Game.createEnvironment(dom.canvas);
  Game.env = env;

  const setLionMesh = () => {
    if (Game.player.mesh) env.scene.remove(Game.player.mesh);
    Game.player.mesh = Game.models.buildLion(Game.state.level);
    Game.player.mesh.position.set(
      Game.state.position.x,
      env.groundHeight(Game.state.position.x, Game.state.position.z) + 0.6,
      Game.state.position.z
    );
    Game.player.mesh.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    env.scene.add(Game.player.mesh);
  };

  const saveState = () => {
    localStorage.setItem(Game.config.saveKey, JSON.stringify({
      ...Game.state,
      position: Game.player.mesh
        ? { x: Game.player.mesh.position.x, y: 0, z: Game.player.mesh.position.z }
        : Game.state.position
    }));
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(Game.config.saveKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(Game.state, data);
    } catch (err) {
      console.warn('Save load failed', err);
    }
  };

  const gainExp = (amount) => {
    Game.state.exp += amount;
    Game.ui.showExpPop(amount);
    const needed = Game.utils.expNeeded(Game.state.level);
    if (Game.state.exp >= needed) {
      Game.state.exp -= needed;
      Game.state.level += 1;
      Game.ui.showToast('Level naik! Ukuran singa bertambah.');
      Game.audio.playLevelUp();
      setLionMesh();
    }
  };

  const killAnimal = (animal) => {
    animal.state = 'dead';
    animal.deadTimer = 3.5;
    animal.hitTimer = 0;
    Game.models.tintMesh(animal.mesh, 0x7a1c1c);
  };

  const getAvailableActions = () => {
    if (!Game.player.mesh) {
      return { drink: false, sleep: false, hunt: false, animal: null };
    }
    const playerPos = Game.player.mesh.position;
    const distToWater = playerPos.distanceTo(env.water.position);
    const distToDen = playerPos.distanceTo(env.den.position);
    const nearbyAnimal = Game.animals.findNearby(playerPos, 4.4);
    const canHunt = Game.animals.canHunt(nearbyAnimal);
    return {
      drink: distToWater < 6,
      sleep: distToDen < 6,
      hunt: canHunt,
      animal: nearbyAnimal
    };
  };

  const interact = (action) => {
    const actions = getAvailableActions();
    const nearbyAnimal = actions.animal;

    if (action === 'drink' || (!action && actions.drink)) {
      Game.state.thirst = Game.utils.clamp(Game.state.thirst + 30, 0, 100);
      Game.state.boredom = Game.utils.clamp(Game.state.boredom - 6, 0, 100);
      gainExp(6);
      Game.audio.playDrink();
      // Play drink animation
      if (Game.animations && Game.player.mesh) {
        Game.animations.play(Game.player.mesh, 'drink', false);
        setTimeout(() => {
          if (Game.animations && Game.player.mesh) {
            Game.animations.play(Game.player.mesh, 'idle');
          }
        }, 1500);
      }
      Game.ui.showToast('Minum di sumber air.');
      return;
    }

    if (action === 'sleep' || (!action && actions.sleep)) {
      Game.state.fatigue = Game.utils.clamp(Game.state.fatigue + 35, 0, 100);
      Game.state.hunger = Game.utils.clamp(Game.state.hunger - 4, 0, 100);
      Game.state.thirst = Game.utils.clamp(Game.state.thirst - 4, 0, 100);
      gainExp(7);
      Game.audio.playSleep();
      // Play sleep animation
      if (Game.animations && Game.player.mesh) {
        Game.animations.play(Game.player.mesh, 'sleep', false);
        setTimeout(() => {
          if (Game.animations && Game.player.mesh) {
            Game.animations.play(Game.player.mesh, 'idle');
          }
        }, 2000);
      }
      Game.ui.showToast('Beristirahat di sarang.');
      return;
    }

    if (nearbyAnimal && (action === 'hunt' || action === 'eat' || !action)) {
      if (!Game.animals.canHunt(nearbyAnimal)) {
        Game.ui.showToast('Terlalu kuat! Hindari predator.', true);
        return;
      }
      nearbyAnimal.hitTimer = 0.6;
      Game.models.tintMesh(nearbyAnimal.mesh, 0xb32020);
      killAnimal(nearbyAnimal);
      Game.audio.playAttack();
      // Play attack animation then eat
      if (Game.animations && Game.player.mesh) {
        Game.animations.play(Game.player.mesh, 'attack', false);
        setTimeout(() => {
          Game.audio.playEat();
          if (Game.animations && Game.player.mesh) {
            Game.animations.play(Game.player.mesh, 'eat', false);
            setTimeout(() => {
              if (Game.animations && Game.player.mesh) {
                Game.animations.play(Game.player.mesh, 'idle');
              }
            }, 1500);
          }
        }, 500);
      } else {
        setTimeout(() => Game.audio.playEat(), 300);
      }
      Game.state.hunger = Game.utils.clamp(Game.state.hunger + 35, 0, 100);
      Game.state.boredom = Game.utils.clamp(Game.state.boredom - 12, 0, 100);
      gainExp(10 + nearbyAnimal.level * 2);
      Game.ui.showToast(`Berhasil ${nearbyAnimal.type.temperament === 'predator' ? 'melawan' : 'memburu'} ${nearbyAnimal.type.name}.`);
      return;
    }

    Game.ui.showToast('Belum ada yang bisa diinteraksi.');
  };

  Game.actions = {
    interact,
    getAvailableActions,
    gainExp
  };

  let warnTimer = 0;
  const updateStats = (delta) => {
    const drain = 0.9 * delta;
    Game.state.hunger = Game.utils.clamp(Game.state.hunger - drain * 0.9, 0, 100);
    Game.state.thirst = Game.utils.clamp(Game.state.thirst - drain * 1.1, 0, 100);
    Game.state.boredom = Game.utils.clamp(Game.state.boredom + drain * 0.7, 0, 100);
    Game.state.fatigue = Game.utils.clamp(Game.state.fatigue + drain * 0.8, 0, 100);

    warnTimer -= delta;
    if (warnTimer <= 0 && (Game.state.hunger < 15 || Game.state.thirst < 15)) {
      Game.ui.showToast('Tubuhmu melemah. Cari makan/minum!', true);
      warnTimer = 4;
    }
  };

  const loop = (time) => {
    if (!Game.runtime.started) {
      env.renderer.render(env.scene, env.camera);
      requestAnimationFrame(loop);
      return;
    }
    const delta = Math.min(0.033, (time - loop.last) / 1000 || 0.016);
    loop.last = time;

    // Update time and day/night cycle
    Game.time.current += delta * Game.time.speed;
    if (Game.time.current >= 24) Game.time.current -= 24;
    env.updateDayNight(Game.time);

    updateStats(delta);
    Game.controlsApi.updatePlayer(delta);
    Game.animals.update(delta);
    Game.animals.handleThreats();
    Game.controlsApi.updateCamera();
    Game.ui.updateHUD();
    Game.ui.updateInteractionButtons();

    // Update animations
    if (Game.animations) {
      Game.animations.update(delta);
    }

    // Animate water waves
    const waterPos = env.water.geometry.attributes.position;
    const originalPos = env.water.userData.originalPos;
    if (originalPos) {
      for (let i = 0; i < waterPos.count; i++) {
        const x = originalPos[i * 3];
        const z = originalPos[i * 3 + 2];
        const wave = Math.sin(time * 0.001 + x * 0.5) * 0.08 + Math.cos(time * 0.0015 + z * 0.5) * 0.06;
        waterPos.setY(i, wave);
      }
      waterPos.needsUpdate = true;
    }
    env.water.position.y = env.waterBaseY + Math.sin(time * 0.001) * 0.06;

    // Animate particles
    if (env.particles) {
      const particlePos = env.particles.geometry.attributes.position;
      const velocities = env.particles.geometry.userData.velocities;
      for (let i = 0; i < particlePos.count; i++) {
        let x = particlePos.getX(i) + velocities[i * 3];
        let y = particlePos.getY(i) + velocities[i * 3 + 1];
        let z = particlePos.getZ(i) + velocities[i * 3 + 2];

        // Wrap around boundaries
        if (Math.abs(x) > 100) x = -x;
        if (y > 25 || y < 1) velocities[i * 3 + 1] *= -1;
        if (Math.abs(z) > 100) z = -z;

        particlePos.setXYZ(i, x, y, z);
      }
      particlePos.needsUpdate = true;
    }

    // Animate grass sway
    if (env.grassGroup) {
      env.grassGroup.children.forEach((grass, i) => {
        grass.rotation.z = Math.sin(time * 0.001 + i * 0.1) * 0.15;
      });
    }

    env.renderer.render(env.scene, env.camera);
    requestAnimationFrame(loop);
  };

  const setupButtons = () => {
    dom.btnEat.addEventListener('click', () => interact('eat'));
    dom.btnDrink.addEventListener('click', () => interact('drink'));
    dom.btnSleep.addEventListener('click', () => interact('sleep'));
    dom.btnHunt.addEventListener('click', () => interact(dom.btnHunt.dataset.action || null));
  };

  const startGame = () => {
    Game.runtime.started = true;
    dom.menu.style.display = 'none';

    // Initialize audio (requires user interaction)
    Game.audio.init();
    Game.audio.playMusic(Game.time.isDay ? 'day' : 'night');

    loadState();
    setLionMesh();
    Game.animals.setup();
    Game.ui.updateHUD();
    Game.ui.updateInteractionButtons();
    Game.ui.showToast('Jelajahi sabana dan bertumbuh!');
    setInterval(saveState, 8000);
  };

  window.addEventListener('resize', () => {
    env.renderer.setSize(window.innerWidth, window.innerHeight, false);
    env.camera.aspect = window.innerWidth / window.innerHeight;
    env.camera.updateProjectionMatrix();
  });

  dom.startBtn.addEventListener('click', startGame);

  Game.controlsApi.setupInput();
  Game.controlsApi.setupJoystick();
  setupButtons();
  requestAnimationFrame(loop);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js');
    });
  }
})();
