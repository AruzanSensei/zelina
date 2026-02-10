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

    return {
      renderer,
      scene,
      camera,
      groundHeight,
      water,
      waterBaseY,
      den,
      sky
    };
  };
})();
