(() => {
  Game.createEnvironment = (canvas) => {
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
    const noise = (x, z) => (
      Math.sin(x * 0.06) * 1.4 +
      Math.cos(z * 0.05) * 1.2 +
      Math.sin((x + z) * 0.03) * 1.5
    );
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
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1f6f8a,
      roughness: 0.2,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9
    });
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
    const denEntrance = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.6, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0x3b2416 })
    );
    denEntrance.rotation.x = Math.PI / 2;
    denEntrance.position.set(0, 0.9, 5.2);
    den.add(denRock, denBase, denEntrance);
    den.position.set(8, groundHeight(8, -8) + 1.5, -8);
    scene.add(den);

    const rocks = new THREE.Group();
    for (let i = 0; i < 25; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6 + Math.random() * 1.8, 0),
        new THREE.MeshStandardMaterial({ color: 0x4c4a45, roughness: 0.95 })
      );
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
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, height, 6),
        new THREE.MeshStandardMaterial({ color: 0x2f6e48 })
      );
      stem.position.y = height / 2;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x3fa664 })
      );
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
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 1.2, 6.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x6c4a2d, roughness: 0.9 })
      );
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(3.8, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x2d7f4b })
      );
      crown.position.y = 5;
      const crown2 = new THREE.Mesh(
        new THREE.SphereGeometry(2.6, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x2f8f55 })
      );
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

    // Grass patches scattered around
    const grassGroup = new THREE.Group();
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x7a9b3f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 110;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = groundHeight(x, z);

      const grassBlade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4 + Math.random() * 0.3, 1.2 + Math.random() * 0.8),
        grassMat
      );
      grassBlade.position.set(x, y + 0.6, z);
      grassBlade.rotation.y = Math.random() * Math.PI;
      grassBlade.rotation.x = (Math.random() - 0.5) * 0.2;
      grassGroup.add(grassBlade);
    }
    scene.add(grassGroup);

    // Ambient particles (dust/fireflies)
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = [];
    const particleVelocities = [];
    for (let i = 0; i < 100; i++) {
      particlePositions.push(
        (Math.random() - 0.5) * 200,
        Math.random() * 20 + 2,
        (Math.random() - 0.5) * 200
      );
      particleVelocities.push(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.01,
        (Math.random() - 0.5) * 0.02
      );
    }
    particlesGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    particlesGeo.userData.velocities = particleVelocities;

    const particlesMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.3,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Water wave animation data
    const waterPos = water.geometry.attributes.position;
    const waterOriginalPos = [];
    for (let i = 0; i < waterPos.count; i++) {
      waterOriginalPos.push(waterPos.getX(i), waterPos.getY(i), waterPos.getZ(i));
    }
    water.userData.originalPos = waterOriginalPos;


    // Stars for night sky
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 280;
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Moon
    const moonGeo = new THREE.SphereGeometry(8, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xf4f1e6, transparent: true, opacity: 0 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(100, 80, -100);
    scene.add(moon);

    // Update day/night cycle
    const updateDayNight = (time) => {
      const hour = time.current;

      // Sky color transitions
      if (hour >= 6 && hour < 7) {
        // Dawn (purple to orange)
        const t = (hour - 6);
        sky.material.color.setHSL(0.75 - t * 0.4, 0.5, 0.3 + t * 0.1);
      } else if (hour >= 7 && hour < 12) {
        // Morning to noon (orange to bright blue)
        const t = (hour - 7) / 5;
        sky.material.color.setHSL(0.55, 0.4 - t * 0.1, 0.4 + t * 0.15);
      } else if (hour >= 12 && hour < 17) {
        // Afternoon (bright blue)
        sky.material.color.setHSL(0.55, 0.3, 0.55);
      } else if (hour >= 17 && hour < 19) {
        // Dusk (blue to orange/pink)
        const t = (hour - 17) / 2;
        sky.material.color.setHSL(0.55 - t * 0.5, 0.3 + t * 0.3, 0.55 - t * 0.25);
      } else if (hour >= 19 || hour < 5) {
        // Night (dark blue/purple)
        sky.material.color.setHSL(0.65, 0.4, 0.15);
      } else if (hour >= 5 && hour < 6) {
        // Pre-dawn (dark to purple)
        const t = (hour - 5);
        sky.material.color.setHSL(0.65 + t * 0.1, 0.4 + t * 0.1, 0.15 + t * 0.15);
      }

      // Lighting intensity
      if (hour >= 6 && hour < 18) {
        // Day
        dir.intensity = 1.0;
        hemi.intensity = 0.9;
        dir.color.setHex(0xffe3b3); // Warm sunlight
      } else if (hour >= 18 && hour < 19) {
        // Dusk transition
        const t = (hour - 18);
        dir.intensity = 1.0 - t * 0.5;
        hemi.intensity = 0.9 - t * 0.4;
      } else if (hour >= 5 && hour < 6) {
        // Dawn transition
        const t = (hour - 5);
        dir.intensity = 0.5 + t * 0.5;
        hemi.intensity = 0.5 + t * 0.4;
      } else {
        // Night
        dir.intensity = 0.3;
        hemi.intensity = 0.4;
        dir.color.setHex(0xb3c9ff); // Cool moonlight
      }

      // Stars visibility
      if (hour >= 19 || hour < 5) {
        starsMat.opacity = 1;
      } else if (hour >= 18 && hour < 19) {
        starsMat.opacity = (hour - 18);
      } else if (hour >= 5 && hour < 6) {
        starsMat.opacity = 1 - (hour - 5);
      } else {
        starsMat.opacity = 0;
      }

      // Moon visibility
      if (hour >= 19 || hour < 5) {
        moonMat.opacity = 0.9;
      } else if (hour >= 18 && hour < 19) {
        moonMat.opacity = (hour - 18) * 0.9;
      } else if (hour >= 5 && hour < 6) {
        moonMat.opacity = (1 - (hour - 5)) * 0.9;
      } else {
        moonMat.opacity = 0;
      }

      // Fog color matches sky
      scene.fog.color.copy(sky.material.color);

      // Particle appearance (dust during day, fireflies at night)
      if (hour >= 6 && hour < 18) {
        // Day: dust particles (brown/tan)
        particlesMat.color.setHex(0xd4a574);
        particlesMat.size = 0.2;
        particlesMat.opacity = 0.3;
      } else if (hour >= 18 && hour < 19) {
        // Dusk transition
        const t = (hour - 18);
        particlesMat.opacity = 0.3 + t * 0.4;
      } else if (hour >= 5 && hour < 6) {
        // Dawn transition
        const t = (hour - 5);
        particlesMat.opacity = 0.7 - t * 0.4;
      } else {
        // Night: fireflies (yellow/green glow)
        particlesMat.color.setHex(0xd4ff00);
        particlesMat.size = 0.4;
        particlesMat.opacity = 0.7;
      }
    };

    return {
      renderer,
      scene,
      camera,
      groundHeight,
      water,
      waterBaseY,
      den,
      sky,
      updateDayNight,
      grassGroup,
      particles
    };
  };
})();
