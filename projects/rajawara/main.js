(() => {
  const canvas = document.getElementById('game');
  const levelEl = document.getElementById('level');
  const ageEl = document.getElementById('age');
  const bars = {
    hunger: document.getElementById('hunger'),
    thirst: document.getElementById('thirst'),
    boredom: document.getElementById('boredom'),
    fatigue: document.getElementById('fatigue')
  };
  const toast = document.getElementById('toast');
  const menu = document.getElementById('menu');
  const startBtn = document.getElementById('start');
  const btnEat = document.getElementById('btn-eat');
  const btnDrink = document.getElementById('btn-drink');
  const btnSleep = document.getElementById('btn-sleep');
  const btnHunt = document.getElementById('btn-hunt');

  let started = false;
  let showMap = true;

  const state = {
    level: 1,
    exp: 0,
    hunger: 100,
    thirst: 100,
    boredom: 40,
    fatigue: 20,
    position: { x: 0, y: 0, z: 0 }
  };

  const saveKey = 'lion-cub-save-v2';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const ageLabel = (level) => {
    if (level < 4) return 'Anak';
    if (level < 8) return 'Remaja';
    if (level < 14) return 'Dewasa';
    return 'Legenda';
  };

  const showToast = (msg, danger = false) => {
    toast.textContent = msg;
    toast.style.background = danger ? 'rgba(140, 32, 32, 0.8)' : 'rgba(0,0,0,0.55)';
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const saveState = () => {
    localStorage.setItem(saveKey, JSON.stringify({
      ...state,
      position: player.mesh ? { x: player.mesh.position.x, y: 0, z: player.mesh.position.z } : state.position
    }));
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(saveKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(state, data);
    } catch (err) {
      console.warn('Save load failed', err);
    }
  };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a1a12, 40, 260);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 700);
  camera.position.set(0, 10, 18);

  const hemi = new THREE.HemisphereLight(0xdbeed6, 0x243b2b, 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffe3b3, 1.0);
  dir.position.set(60, 70, -10);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 200;
  scene.add(dir);

  const skyGeo = new THREE.SphereGeometry(320, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x1b3f2f, side: THREE.BackSide });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  const groundGeo = new THREE.PlaneGeometry(320, 320, 80, 80);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position;
  const noise = (x, z) => {
    return (
      Math.sin(x * 0.06) * 1.4 +
      Math.cos(z * 0.05) * 1.2 +
      Math.sin((x + z) * 0.03) * 1.5
    );
  };
  const groundHeight = (x, z) => noise(x, z) * 0.6 + Math.sin(x * 0.12) * 0.3;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = groundHeight(x, z);
    pos.setY(i, y);
  }
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d6f45, roughness: 0.9, metalness: 0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  scene.add(ground);

  const waterGeo = new THREE.CircleGeometry(16, 40);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x1f6f8a, roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.9 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  const waterBaseY = groundHeight(-40, -28) + 0.2;
  water.position.set(-40, waterBaseY, -28);
  scene.add(water);

  const safeZone = new THREE.Mesh(
    new THREE.RingGeometry(12, 20, 40),
    new THREE.MeshBasicMaterial({ color: 0x6bd67e, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  );
  safeZone.rotation.x = -Math.PI / 2;
  safeZone.position.set(0, 0.1, 0);
  scene.add(safeZone);

  const openZone = new THREE.Mesh(
    new THREE.RingGeometry(45, 85, 50),
    new THREE.MeshBasicMaterial({ color: 0xe1a95f, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
  );
  openZone.rotation.x = -Math.PI / 2;
  openZone.position.set(0, 0.08, 0);
  scene.add(openZone);

  const den = new THREE.Group();
  const denMat = new THREE.MeshStandardMaterial({ color: 0x5b3b22, roughness: 0.9 });
  const denRock = new THREE.Mesh(new THREE.DodecahedronGeometry(6, 0), denMat);
  denRock.scale.set(1.4, 0.8, 1.2);
  denRock.position.y = 2.2;
  const denBase = new THREE.Mesh(new THREE.CylinderGeometry(7, 8.5, 2.4, 18), denMat);
  denBase.position.y = 0.8;
  const denEntrance = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.6, 12, 20), new THREE.MeshStandardMaterial({ color: 0x3b2416 }));
  denEntrance.rotation.x = Math.PI / 2;
  denEntrance.position.set(0, 0.9, 5.2);
  den.add(denRock, denBase, denEntrance);
  den.position.set(8, groundHeight(8, -8) + 1.5, -8);
  scene.add(den);

  const rocks = new THREE.Group();
  for (let i = 0; i < 25; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + Math.random() * 1.8, 0), new THREE.MeshStandardMaterial({ color: 0x4c4a45, roughness: 0.95 }));
    const rx = (Math.random() - 0.5) * 260;
    const rz = (Math.random() - 0.5) * 260;
    rock.position.set(rx, groundHeight(rx, rz) + 0.2, rz);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rocks.add(rock);
  }
  scene.add(rocks);

  const plants = new THREE.Group();
  for (let i = 0; i < 120; i++) {
    const height = 1.4 + Math.random() * 3.2;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, height, 6), new THREE.MeshStandardMaterial({ color: 0x2f6e48 }));
    stem.position.y = height / 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 10, 10), new THREE.MeshStandardMaterial({ color: 0x3fa664 }));
    leaf.position.y = height;
    const tuft = new THREE.Group();
    tuft.add(stem, leaf);
    const px = (Math.random() - 0.5) * 280;
    const pz = (Math.random() - 0.5) * 280;
    tuft.position.set(px, groundHeight(px, pz), pz);
    tuft.rotation.y = Math.random() * Math.PI;
    plants.add(tuft);
  }
  scene.add(plants);

  const trees = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.2, 6.5, 8), new THREE.MeshStandardMaterial({ color: 0x6c4a2d, roughness: 0.9 }));
    const crown = new THREE.Mesh(new THREE.SphereGeometry(3.8, 12, 12), new THREE.MeshStandardMaterial({ color: 0x2d7f4b }));
    crown.position.y = 5;
    const crown2 = new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 10), new THREE.MeshStandardMaterial({ color: 0x2f8f55 }));
    crown2.position.set(1.6, 4.2, -1.2);
    const tree = new THREE.Group();
    tree.add(trunk, crown, crown2);
    const tx = (Math.random() - 0.5) * 240;
    const tz = (Math.random() - 0.5) * 240;
    tree.position.set(tx, groundHeight(tx, tz) + 0.5, tz);
    tree.rotation.y = Math.random() * Math.PI * 2;
    trees.add(tree);
  }
  scene.add(trees);

  const player = {
    mesh: null,
    speed: 9,
    runSpeed: 13,
    direction: new THREE.Vector3(),
    velocity: new THREE.Vector3()
  };

  const makeLeg = (size, color) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * size, 0.18 * size, 0.8 * size, 8), new THREE.MeshStandardMaterial({ color }));
    leg.castShadow = true;
    return leg;
  };

  const buildLion = (level) => {
    const group = new THREE.Group();
    const size = 0.9 + level * 0.08;
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd6a063 });
    const maneMat = new THREE.MeshStandardMaterial({ color: 0xa86634 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.65 * size, 1.4 * size, 6, 10), bodyMat);
    body.castShadow = true;
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.6 * size, 12, 12), bodyMat);
    chest.position.set(0, 0.3 * size, 0.7 * size);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.48 * size, 14, 14), bodyMat);
    head.position.set(0, 0.6 * size, 1.4 * size);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.26 * size, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf1c27a }));
    muzzle.position.set(0, 0.46 * size, 1.75 * size);
    const mane = new THREE.Mesh(new THREE.TorusGeometry(0.48 * size, 0.18 * size, 14, 20), maneMat);
    mane.position.set(0, 0.55 * size, 1.33 * size);
    mane.rotation.x = Math.PI / 2;
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.16 * size, 8, 8), bodyMat);
    const earR = earL.clone();
    earL.position.set(-0.28 * size, 0.88 * size, 1.35 * size);
    earR.position.set(0.28 * size, 0.88 * size, 1.35 * size);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * size, 0.1 * size, 1.5 * size, 8), bodyMat);
    tail.position.set(0, 0.35 * size, -1.2 * size);
    tail.rotation.x = Math.PI / 3;
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.14 * size, 8, 8), maneMat);
    tailTip.position.set(0, 0.9 * size, -1.7 * size);

    const legFL = makeLeg(size, bodyMat.color);
    const legFR = makeLeg(size, bodyMat.color);
    const legBL = makeLeg(size, bodyMat.color);
    const legBR = makeLeg(size, bodyMat.color);
    legFL.position.set(-0.4 * size, -0.6 * size, 0.9 * size);
    legFR.position.set(0.4 * size, -0.6 * size, 0.9 * size);
    legBL.position.set(-0.4 * size, -0.6 * size, -0.6 * size);
    legBR.position.set(0.4 * size, -0.6 * size, -0.6 * size);

    group.add(body, chest, head, muzzle, mane, earL, earR, tail, tailTip, legFL, legFR, legBL, legBR);
    return group;
  };

  const animalTypes = [
    { name: 'Zebra', color: 0xd9d9d9, accent: 0x2f2f2f, base: 0.95, speed: 7, temperament: 'prey' },
    { name: 'Rusa', color: 0xa76b3c, accent: 0x6b3f1f, base: 0.85, speed: 7, temperament: 'prey' },
    { name: 'Kerbau', color: 0x3f3a3a, accent: 0x1f1d1d, base: 1.25, speed: 5, temperament: 'prey', horn: true },
    { name: 'Hiena', color: 0x8c7b64, accent: 0x6b5a49, base: 0.95, speed: 8, temperament: 'predator' },
    { name: 'Singa Liar', color: 0xc18b4a, accent: 0x9c5c2f, base: 1.3, speed: 8, temperament: 'predator', mane: true }
  ];

  const animals = [];

  const createLabelSprite = (text, color = '#fff3c9') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 8, canvas.width, 48);
    ctx.font = 'bold 28px Trebuchet MS';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6, 1.6, 1);
    return sprite;
  };

  const buildAnimal = (type, level) => {
    const group = new THREE.Group();
    const size = type.base + level * 0.06;
    const bodyMat = new THREE.MeshStandardMaterial({ color: type.color });
    const accentMat = new THREE.MeshStandardMaterial({ color: type.accent });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55 * size, 1.2 * size, 6, 10), bodyMat);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * size, 0.28 * size, 0.6 * size, 8), bodyMat);
    neck.position.set(0, 0.3 * size, 0.85 * size);
    neck.rotation.x = Math.PI / 4;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38 * size, 12, 12), bodyMat);
    head.position.set(0, 0.58 * size, 1.4 * size);

    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.12 * size, 8, 8), accentMat);
    const earR = earL.clone();
    earL.position.set(-0.22 * size, 0.78 * size, 1.35 * size);
    earR.position.set(0.22 * size, 0.78 * size, 1.35 * size);

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * size, 0.08 * size, 1.1 * size, 8), bodyMat);
    tail.position.set(0, 0.3 * size, -1.0 * size);
    tail.rotation.x = Math.PI / 3;

    const legFL = makeLeg(size, bodyMat.color);
    const legFR = makeLeg(size, bodyMat.color);
    const legBL = makeLeg(size, bodyMat.color);
    const legBR = makeLeg(size, bodyMat.color);
    legFL.position.set(-0.35 * size, -0.65 * size, 0.85 * size);
    legFR.position.set(0.35 * size, -0.65 * size, 0.85 * size);
    legBL.position.set(-0.35 * size, -0.65 * size, -0.6 * size);
    legBR.position.set(0.35 * size, -0.65 * size, -0.6 * size);

    group.add(body, neck, head, earL, earR, tail, legFL, legFR, legBL, legBR);

    if (type.horn) {
      const hornL = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * size, 0.12 * size, 0.7 * size, 8), accentMat);
      const hornR = hornL.clone();
      hornL.position.set(-0.2 * size, 0.8 * size, 1.45 * size);
      hornR.position.set(0.2 * size, 0.8 * size, 1.45 * size);
      hornL.rotation.z = Math.PI / 4;
      hornR.rotation.z = -Math.PI / 4;
      group.add(hornL, hornR);
    }

    if (type.mane) {
      const mane = new THREE.Mesh(new THREE.TorusGeometry(0.45 * size, 0.16 * size, 12, 20), accentMat);
      mane.position.set(0, 0.58 * size, 1.2 * size);
      mane.rotation.x = Math.PI / 2;
      group.add(mane);
    }

    if (type.name === 'Zebra') {
      for (let i = -2; i <= 2; i++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.05 * size, 0.8 * size, 1.1 * size), accentMat);
        stripe.position.set(i * 0.18 * size, 0, 0);
        group.add(stripe);
      }
    }

    group.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });

    return group;
  };

  const storeMaterials = (mesh) => {
    const mats = [];
    mesh.traverse((child) => {
      if (child.isMesh) mats.push({ mesh: child, color: child.material.color.clone() });
    });
    return mats;
  };

  const tintMesh = (mesh, color) => {
    mesh.traverse((child) => {
      if (child.isMesh) child.material.color.set(color);
    });
  };

  const restoreMaterials = (materials) => {
    materials.forEach((item) => item.mesh.material.color.copy(item.color));
  };

  const spawnAnimal = (type, level, x, z) => {
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

  const controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    moveX: 0,
    moveY: 0,
    rotateX: 0,
    rotateY: 0
  };

  let pointerLocked = false;
  let dragging = false;
  let lastTouch = { x: 0, y: 0 };

  const setLionMesh = () => {
    if (player.mesh) scene.remove(player.mesh);
    player.mesh = buildLion(state.level);
    player.mesh.position.set(state.position.x, groundHeight(state.position.x, state.position.z) + 0.6, state.position.z);
    player.mesh.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    scene.add(player.mesh);
  };

  const updateHUD = () => {
    levelEl.textContent = state.level;
    ageEl.textContent = ageLabel(state.level);
    bars.hunger.style.width = `${state.hunger}%`;
    bars.thirst.style.width = `${state.thirst}%`;
    bars.boredom.style.width = `${state.boredom}%`;
    bars.fatigue.style.width = `${state.fatigue}%`;
  };

  const gainExp = (amount) => {
    state.exp += amount;
    const needed = 50 + state.level * 30;
    if (state.exp >= needed) {
      state.exp -= needed;
      state.level += 1;
      showToast('Level naik! Ukuran singa bertambah.');
      setLionMesh();
    }
  };

  const killAnimal = (animal) => {
    animal.state = 'dead';
    animal.deadTimer = 3.5;
    animal.hitTimer = 0;
    tintMesh(animal.mesh, 0x7a1c1c);
  };

  const interact = (action) => {
    const playerPos = player.mesh.position;
    const distToWater = playerPos.distanceTo(water.position);
    const distToDen = playerPos.distanceTo(den.position);
    const nearbyAnimal = animals
      .filter(a => a.state === 'alive' && a.mesh.position.distanceTo(playerPos) < 4.4)
      .sort((a, b) => a.mesh.position.distanceTo(playerPos) - b.mesh.position.distanceTo(playerPos))[0];

    if (action === 'drink' || (!action && distToWater < 6)) {
      state.thirst = clamp(state.thirst + 30, 0, 100);
      state.boredom = clamp(state.boredom - 6, 0, 100);
      gainExp(6);
      showToast('Minum di sumber air.');
      return;
    }

    if (action === 'sleep' || (!action && distToDen < 6)) {
      state.fatigue = clamp(state.fatigue + 35, 0, 100);
      state.hunger = clamp(state.hunger - 4, 0, 100);
      state.thirst = clamp(state.thirst - 4, 0, 100);
      gainExp(7);
      showToast('Beristirahat di sarang.');
      return;
    }

    if (nearbyAnimal && (action === 'hunt' || action === 'eat' || !action)) {
      if (nearbyAnimal.type.temperament === 'predator' && nearbyAnimal.level >= state.level) {
        showToast('Terlalu kuat! Hindari predator.', true);
        return;
      }
      nearbyAnimal.hitTimer = 0.6;
      tintMesh(nearbyAnimal.mesh, 0xb32020);
      killAnimal(nearbyAnimal);
      state.hunger = clamp(state.hunger + 35, 0, 100);
      state.boredom = clamp(state.boredom - 12, 0, 100);
      gainExp(10 + nearbyAnimal.level * 2);
      showToast(`Berhasil ${nearbyAnimal.type.temperament === 'predator' ? 'melawan' : 'memburu'} ${nearbyAnimal.type.name}.`);
      return;
    }

    showToast('Belum ada yang bisa diinteraksi.');
  };

  const handleKey = (down) => (event) => {
    if (!started) return;
    switch (event.code) {
      case 'KeyW': controls.forward = down; break;
      case 'KeyS': controls.backward = down; break;
      case 'KeyA': controls.left = down; break;
      case 'KeyD': controls.right = down; break;
      case 'ShiftLeft':
      case 'ShiftRight': controls.sprint = down; break;
      case 'KeyE': if (down) interact(); break;
      case 'KeyM': if (down) document.getElementById('minimap').style.display = (showMap = !showMap) ? 'flex' : 'none'; break;
      default: break;
    }
  };

  const setupInput = () => {
    window.addEventListener('keydown', handleKey(true));
    window.addEventListener('keyup', handleKey(false));

    canvas.addEventListener('click', () => {
      if (window.innerWidth > 900) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      pointerLocked = document.pointerLockElement === canvas;
    });

    document.addEventListener('mousemove', (event) => {
      if (!started) return;
      if (pointerLocked) {
        controls.rotateY -= event.movementX * 0.0025;
        controls.rotateX -= event.movementY * 0.0025;
      }
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (window.innerWidth > 900) return;
      dragging = true;
      lastTouch = { x: event.clientX, y: event.clientY };
    });

    window.addEventListener('pointerup', () => { dragging = false; });

    window.addEventListener('pointermove', (event) => {
      if (!dragging || window.innerWidth > 900) return;
      const dx = event.clientX - lastTouch.x;
      const dy = event.clientY - lastTouch.y;
      lastTouch = { x: event.clientX, y: event.clientY };
      controls.rotateY -= dx * 0.003;
      controls.rotateX -= dy * 0.003;
    });
  };

  const setupJoystick = () => {
    const joystick = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    let active = false;
    let origin = { x: 0, y: 0 };

    const updateStick = (x, y) => {
      const max = 40;
      const dx = clamp(x - origin.x, -max, max);
      const dy = clamp(y - origin.y, -max, max);
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
      controls.moveX = dx / max;
      controls.moveY = dy / max;
    };

    joystick.addEventListener('pointerdown', (event) => {
      active = true;
      origin = { x: event.clientX, y: event.clientY };
      updateStick(event.clientX, event.clientY);
    });

    window.addEventListener('pointermove', (event) => {
      if (!active) return;
      updateStick(event.clientX, event.clientY);
    });

    window.addEventListener('pointerup', () => {
      active = false;
      controls.moveX = 0;
      controls.moveY = 0;
      stick.style.transform = 'translate(-50%, -50%)';
    });
  };

  const updatePlayer = (delta) => {
    const moveX = controls.moveX || (controls.right ? 1 : 0) + (controls.left ? -1 : 0);
    const moveY = controls.moveY || (controls.forward ? 1 : 0) + (controls.backward ? -1 : 0);
    const forward = new THREE.Vector3(-Math.sin(controls.rotateY), 0, -Math.cos(controls.rotateY));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const speed = (controls.sprint ? player.runSpeed : player.speed) * (0.6 + state.hunger / 200) * (0.6 + state.thirst / 200);

    player.direction.set(0, 0, 0);
    player.direction.addScaledVector(forward, moveY);
    player.direction.addScaledVector(right, moveX);
    if (player.direction.lengthSq() > 0.001) {
      player.direction.normalize();
      player.velocity.copy(player.direction).multiplyScalar(speed * delta);
      player.mesh.position.add(player.velocity);
      player.mesh.rotation.y = Math.atan2(player.direction.x, player.direction.z);
    }

    player.mesh.position.x = clamp(player.mesh.position.x, -150, 150);
    player.mesh.position.z = clamp(player.mesh.position.z, -150, 150);
    player.mesh.position.y = groundHeight(player.mesh.position.x, player.mesh.position.z) + 0.6;
  };

  const updateCamera = () => {
    controls.rotateX = clamp(controls.rotateX, -0.75, 0.6);
    const distance = 15 - state.level * 0.25;
    const target = player.mesh.position.clone();
    const offset = new THREE.Vector3(
      Math.sin(controls.rotateY) * Math.cos(controls.rotateX),
      Math.sin(controls.rotateX),
      Math.cos(controls.rotateY) * Math.cos(controls.rotateX)
    ).multiplyScalar(distance);
    camera.position.copy(target).add(offset);
    camera.lookAt(target.x, target.y + 2, target.z);
  };

  const updateAnimals = (delta) => {
    animals.forEach(animal => {
      if (animal.state === 'dead') {
        animal.deadTimer -= delta;
        animal.mesh.rotation.x = Math.max(animal.mesh.rotation.x - delta * 1.6, -Math.PI / 2);
        animal.mesh.position.y = Math.max(0.1, animal.mesh.position.y - delta * 1.0);
        if (animal.deadTimer <= 0) {
          restoreMaterials(animal.materials);
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
        if (animal.hitTimer <= 0) restoreMaterials(animal.materials);
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
        if (playerDist < 18 && animal.level >= state.level && animal.stamina > 0 && animal.restTimer <= 0) {
          const chase = player.mesh.position.clone().sub(animal.mesh.position).normalize();
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

      if (animal.type.temperament === 'prey' && playerDist < 10 && state.level >= animal.level - 1) {
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

  let warnTimer = 0;
  const updateStats = (delta) => {
    const drain = 0.9 * delta;
    state.hunger = clamp(state.hunger - drain * 0.9, 0, 100);
    state.thirst = clamp(state.thirst - drain * 1.1, 0, 100);
    state.boredom = clamp(state.boredom + drain * 0.7, 0, 100);
    state.fatigue = clamp(state.fatigue + drain * 0.8, 0, 100);

    warnTimer -= delta;
    if (warnTimer <= 0 && (state.hunger < 15 || state.thirst < 15)) {
      showToast('Tubuhmu melemah. Cari makan/minum!', true);
      warnTimer = 4;
    }
  };

  const handleThreats = () => {
    const threat = animals.find(a => a.state === 'alive' && a.type.temperament === 'predator' && a.level >= state.level && a.mesh.position.distanceTo(player.mesh.position) < 3.2);
    if (threat) {
      state.hunger = clamp(state.hunger - 8, 0, 100);
      state.thirst = clamp(state.thirst - 8, 0, 100);
      state.boredom = clamp(state.boredom + 6, 0, 100);
      state.fatigue = clamp(state.fatigue + 10, 0, 100);
      const push = player.mesh.position.clone().sub(threat.mesh.position).normalize().multiplyScalar(6);
      player.mesh.position.add(push);
      showToast('Kena serangan! Menjauh dulu.', true);
    }
  };

  const loop = (time) => {
    if (!started) {
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
      return;
    }
    const delta = Math.min(0.033, (time - loop.last) / 1000 || 0.016);
    loop.last = time;

    updateStats(delta);
    updatePlayer(delta);
    updateAnimals(delta);
    handleThreats();
    updateCamera();
    updateHUD();

    water.position.y = waterBaseY + Math.sin(time * 0.001) * 0.06;
    sky.material.color.setHSL(0.36, 0.4, 0.24 + Math.sin(time * 0.0002) * 0.02);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };

  const setupButtons = () => {
    btnEat.addEventListener('click', () => interact('eat'));
    btnDrink.addEventListener('click', () => interact('drink'));
    btnSleep.addEventListener('click', () => interact('sleep'));
    btnHunt.addEventListener('click', () => interact('hunt'));
  };

  const startGame = () => {
    started = true;
    menu.style.display = 'none';
    loadState();
    setLionMesh();
    setupAnimals();
    updateHUD();
    showToast('Jelajahi sabana dan bertumbuh!');
    setInterval(saveState, 8000);
  };

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  startBtn.addEventListener('click', startGame);

  setupInput();
  setupJoystick();
  setupButtons();
  requestAnimationFrame(loop);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js');
    });
  }
})();
