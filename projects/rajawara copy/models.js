(() => {
  const makeLeg = (size, color) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14 * size, 0.18 * size, 0.8 * size, 8),
      new THREE.MeshStandardMaterial({ color })
    );
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
    const muzzle = new THREE.Mesh(
      new THREE.SphereGeometry(0.26 * size, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xf1c27a })
    );
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

  Game.models = {
    buildLion,
    buildAnimal,
    createLabelSprite,
    storeMaterials,
    tintMesh,
    restoreMaterials
  };
})();
