(() => {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const ageLabel = (level) => {
    if (level < 4) return 'Anak';
    if (level < 8) return 'Remaja';
    if (level < 14) return 'Dewasa';
    return 'Legenda';
  };
  const expNeeded = (level) => 50 + level * 30;

  window.Game = {
    utils: { clamp, ageLabel, expNeeded },
    config: { saveKey: 'lion-cub-save-v2' },
    state: {
      level: 1,
      exp: 0,
      hunger: 100,
      thirst: 100,
      boredom: 40,
      fatigue: 20,
      position: { x: 0, y: 0, z: 0 }
    },
    controls: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      moveX: 0,
      moveY: 0,
      rotateX: 0,
      rotateY: 0
    },
    player: {
      mesh: null,
      speed: 9,
      runSpeed: 13,
      direction: new THREE.Vector3(),
      velocity: new THREE.Vector3()
    },
    runtime: {
      started: false,
      showMap: true,
      cameraDistance: 15,
      cameraMin: 9,
      cameraMax: 24
    },
    time: {
      current: 12.0,      // 0-24 hours (start at noon)
      speed: 0.02,        // Time passes slowly (1 real second = ~1.2 game minutes)
      get isDay() { return this.current >= 6 && this.current < 18; },
      get isNight() { return this.current < 6 || this.current >= 18; },
      get isDusk() { return this.current >= 17 && this.current < 19; },
      get isDawn() { return this.current >= 5 && this.current < 7; },
      get timeString() {
        const h = Math.floor(this.current);
        const m = Math.floor((this.current - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
    }
  };
})();
