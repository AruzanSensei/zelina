(() => {
  const animalTypes = [
    { name: 'Zebra', color: 0xd9d9d9, accent: 0x2f2f2f, base: 0.95, speed: 7, temperament: 'prey' },
    { name: 'Rusa', color: 0xa76b3c, accent: 0x6b3f1f, base: 0.85, speed: 7, temperament: 'prey' },
    { name: 'Kerbau', color: 0x3f3a3a, accent: 0x1f1d1d, base: 1.25, speed: 5, temperament: 'prey', horn: true },
    { name: 'Hiena', color: 0x8c7b64, accent: 0x6b5a49, base: 0.95, speed: 8, temperament: 'predator' },
    { name: 'Singa Liar', color: 0xc18b4a, accent: 0x9c5c2f, base: 1.3, speed: 8, temperament: 'predator', mane: true }
  ];

  const animals = [];

  const spawnAnimal = (type, level, x, z) => {
    const { buildAnimal, createLabelSprite, storeMaterials } = Game.models;
    const { scene, groundHeight } = Game.env;
    const mesh = buildAnimal(type, level);
    mesh.position.set(x, groundHeight(x, z) + 0.6, z);
    scene.add(mesh);
    const label = createLabelSprite(`${type.name} Lv.${level}`);
    label.position.set(0, 2.6, 0);
    mesh.add(label);

    const animal = {
      type,
      level,
      mesh,
      label,
      speed: type.speed + level * 0.1,
      target: new THREE.Vector3(x, 0, z),
      wanderTimer: 0,
      state: 'alive',
      stamina: 4 + Math.random() * 3,
      restTimer: 0,
      deadTimer: 0,
      hitTimer: 0,
      materials: storeMaterials(mesh)
    };
    animals.push(animal);
    return animal;
  };

  const setupAnimals = () => {
    for (let i = 0; i < 28; i++) {
      const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
      const level = 1 + Math.floor(Math.random() * 9);
      const radius = 30 + Math.random() * 120;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      spawnAnimal(type, level, x, z);
    }
  };

  const findNearby = (pos, radius = 4.4) => animals
    .filter((a) => a.state === 'alive' && a.mesh.position.distanceTo(pos) < radius)
    .sort((a, b) => a.mesh.position.distanceTo(pos) - b.mesh.position.distanceTo(pos))[0] || null;

  const canHunt = (animal) => {
    if (!animal) return false;
    return !(animal.type.temperament === 'predator' && animal.level >= Game.state.level);
  };

  const updateAnimals = (delta) => {
    const { clamp } = Game.utils;
    const { player } = Game;
    const { groundHeight, camera } = Game.env;
    animals.forEach((animal) => {
      if (animal.state === 'dead') {
        animal.deadTimer -= delta;
        animal.mesh.rotation.x = Math.max(animal.mesh.rotation.x - delta * 1.6, -Math.PI / 2);
        animal.mesh.position.y = Math.max(0.1, animal.mesh.position.y - delta * 1.0);
        if (animal.deadTimer <= 0) {
          Game.models.restoreMaterials(animal.materials);
          animal.mesh.rotation.set(0, 0, 0);
          const rx = (Math.random() - 0.5) * 140;
          const rz = (Math.random() - 0.5) * 140;
          animal.mesh.position.set(rx, groundHeight(rx, rz) + 0.6, rz);
          animal.state = 'alive';
          animal.stamina = 4 + Math.random() * 3;
        }
        return;
      }

      if (animal.hitTimer > 0) {
        animal.hitTimer -= delta;
        if (animal.hitTimer <= 0) Game.models.restoreMaterials(animal.materials);
      }

      animal.wanderTimer -= delta;
      if (animal.wanderTimer <= 0) {
        animal.wanderTimer = 2 + Math.random() * 4;
        const radius = 16 + Math.random() * 26;
        const angle = Math.random() * Math.PI * 2;
        animal.target.set(
          animal.mesh.position.x + Math.cos(angle) * radius,
          0,
          animal.mesh.position.z + Math.sin(angle) * radius
        );
      }

      const playerDist = animal.mesh.position.distanceTo(player.mesh.position);
      let desiredSpeed = animal.speed * 0.4;

      if (animal.type.temperament === 'predator') {
        if (playerDist < 18 && animal.level >= Game.state.level && animal.stamina > 0 && animal.restTimer <= 0) {
          animal.target.copy(player.mesh.position);
          desiredSpeed = animal.speed * 0.8;
          animal.stamina -= delta * 0.6;
          if (playerDist > 26) {
            animal.restTimer = 3.5;
          }
        } else {
          animal.restTimer -= delta;
          animal.stamina = Math.min(animal.stamina + delta * 0.4, 6);
        }
      }

      if (animal.type.temperament === 'prey' && playerDist < 10 && Game.state.level >= animal.level - 1) {
        const flee = animal.mesh.position.clone().sub(player.mesh.position).normalize();
        animal.target.copy(animal.mesh.position.clone().add(flee.multiplyScalar(12)));
        desiredSpeed = animal.speed * 0.9;
      }

      const dir = animal.target.clone().sub(animal.mesh.position);
      if (dir.lengthSq() > 1) {
        dir.normalize();
        animal.mesh.position.addScaledVector(dir, desiredSpeed * delta);
        animal.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      }

      animal.mesh.position.x = clamp(animal.mesh.position.x, -155, 155);
      animal.mesh.position.z = clamp(animal.mesh.position.z, -155, 155);
      animal.mesh.position.y = groundHeight(animal.mesh.position.x, animal.mesh.position.z) + 0.6;
      if (animal.label) animal.label.quaternion.copy(camera.quaternion);
    });
  };

  const handleThreats = () => {
    const { clamp } = Game.utils;
    const threat = animals.find((a) => (
      a.state === 'alive' &&
      a.type.temperament === 'predator' &&
      a.level >= Game.state.level &&
      a.mesh.position.distanceTo(Game.player.mesh.position) < 3.2
    ));
    if (threat) {
      Game.state.hunger = clamp(Game.state.hunger - 8, 0, 100);
      Game.state.thirst = clamp(Game.state.thirst - 8, 0, 100);
      Game.state.boredom = clamp(Game.state.boredom + 6, 0, 100);
      Game.state.fatigue = clamp(Game.state.fatigue + 10, 0, 100);
      const push = Game.player.mesh.position.clone().sub(threat.mesh.position).normalize().multiplyScalar(6);
      Game.player.mesh.position.add(push);
      Game.ui.showToast('Kena serangan! Menjauh dulu.', true);
    }
  };

  Game.animals = {
    list: animals,
    types: animalTypes,
    spawn: spawnAnimal,
    setup: setupAnimals,
    update: updateAnimals,
    handleThreats,
    findNearby,
    canHunt
  };
})();
