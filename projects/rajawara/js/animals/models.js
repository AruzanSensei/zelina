(() => {
  // Helper function to create realistic legs with joints
  const makeLeg = (size, color, frontLeg = true) => {
    const legGroup = new THREE.Group();

    // Upper leg (thigh)
    const upper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * size, 0.13 * size, 0.5 * size, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    upper.position.y = -0.25 * size;
    upper.castShadow = true;

    // Lower leg
    const lower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * size, 0.1 * size, 0.45 * size, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    lower.position.y = -0.72 * size;
    lower.castShadow = true;

    // Paw/hoof
    const pawColor = frontLeg ? color * 0.7 : color * 0.8;
    const paw = new THREE.Mesh(
      new THREE.SphereGeometry(0.14 * size, 8, 8),
      new THREE.MeshStandardMaterial({ color: pawColor, roughness: 0.9 })
    );
    paw.scale.set(1, 0.6, 1.1);
    paw.position.y = -0.98 * size;
    paw.castShadow = true;

    legGroup.add(upper, lower, paw);
    return legGroup;
  };

  // REALISTIC LION MODEL
  const buildLion = (level) => {
    const group = new THREE.Group();
    const size = 0.9 + level * 0.08;

    // Color palette
    const bodyColor = 0xd4a574;
    const maneColor = 0x8b5a2b;
    const darkColor = 0x6b4423;
    const noseColor = 0x2d1810;
    const eyeColor = 0x3a5f3a;

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });
    const maneMat = new THREE.MeshStandardMaterial({ color: maneColor, roughness: 0.9 });
    const darkMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.85 });

    // BODY - Elongated torso
    const bodyGeo = new THREE.CapsuleGeometry(0.5 * size, 1.6 * size, 8, 16);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.position.set(0, 0.7 * size, 0);
    body.castShadow = true;

    // CHEST - Broader front
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.55 * size, 12, 12), bodyMat);
    chest.scale.set(1, 1, 1.2);
    chest.position.set(0, 0.65 * size, 0.9 * size);
    chest.castShadow = true;

    // NECK
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * size, 0.4 * size, 0.6 * size, 8), bodyMat);
    neck.position.set(0, 0.95 * size, 1.3 * size);
    neck.rotation.x = 0.3;
    neck.castShadow = true;

    // HEAD - Box-shaped for realism
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65 * size, 0.55 * size, 0.7 * size), bodyMat);
    head.position.set(0, 1.15 * size, 1.7 * size);
    head.userData.originalY = 1.15 * size;
    head.castShadow = true;

    // SNOUT/MUZZLE
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.45 * size, 0.35 * size, 0.5 * size), bodyMat);
    snout.position.set(0, 1.05 * size, 2.05 * size);
    snout.castShadow = true;

    // NOSE
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.25 * size, 0.15 * size, 0.15 * size),
      new THREE.MeshStandardMaterial({ color: noseColor }));
    nose.position.set(0, 1.05 * size, 2.3 * size);

    // EYES
    const eyeGeo = new THREE.SphereGeometry(0.08 * size, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: eyeColor, emissive: 0x1a2f1a });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.22 * size, 1.22 * size, 1.95 * size);
    eyeR.position.set(0.22 * size, 1.22 * size, 1.95 * size);

    // EARS
    const earGeo = new THREE.ConeGeometry(0.18 * size, 0.25 * size, 8);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    const earR = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.28 * size, 1.45 * size, 1.6 * size);
    earR.position.set(0.28 * size, 1.45 * size, 1.6 * size);
    earL.rotation.z = -0.3;
    earR.rotation.z = 0.3;
    earL.castShadow = true;
    earR.castShadow = true;

    // MANE - Large and prominent
    const maneMain = new THREE.Mesh(new THREE.SphereGeometry(0.65 * size, 12, 12), maneMat);
    maneMain.scale.set(1.1, 0.9, 1);
    maneMain.position.set(0, 1.1 * size, 1.4 * size);
    maneMain.castShadow = true;

    const maneBack = new THREE.Mesh(new THREE.SphereGeometry(0.45 * size, 10, 10), maneMat);
    maneBack.scale.set(1, 0.8, 1.2);
    maneBack.position.set(0, 0.95 * size, 1.0 * size);

    // LEGS
    const legFL = makeLeg(size, bodyColor, true);
    const legFR = makeLeg(size, bodyColor, true);
    const legBL = makeLeg(size, bodyColor, false);
    const legBR = makeLeg(size, bodyColor, false);

    legFL.position.set(-0.35 * size, 0.7 * size, 0.75 * size);
    legFR.position.set(0.35 * size, 0.7 * size, 0.75 * size);
    legBL.position.set(-0.35 * size, 0.7 * size, -0.7 * size);
    legBR.position.set(0.35 * size, 0.7 * size, -0.7 * size);

    // TAIL - Long with tuft
    const tailBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1 * size, 0.08 * size, 0.8 * size, 8),
      bodyMat
    );
    tailBase.position.set(0, 0.6 * size, -1.1 * size);
    tailBase.rotation.x = Math.PI / 3;
    tailBase.castShadow = true;

    const tailMid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * size, 0.06 * size, 0.6 * size, 8),
      bodyMat
    );
    tailMid.position.set(0, 0.25 * size, -1.55 * size);
    tailMid.rotation.x = Math.PI / 4;

    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.16 * size, 8, 8), darkMat);
    tailTip.position.set(0, 0.15 * size, -1.9 * size);

    const tail = new THREE.Group();
    tail.add(tailBase, tailMid, tailTip);

    // BELLY
    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.42 * size, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8c9a0, roughness: 0.85 })
    );
    belly.scale.set(1.3, 0.6, 1);
    belly.position.set(0, 0.35 * size, 0.1 * size);

    // Add all parts
    group.add(
      body, chest, neck, head, snout, nose,
      eyeL, eyeR, earL, earR,
      maneMain, maneBack, belly,
      legFL, legFR, legBL, legBR, tail
    );

    // Store references for animation
    group.userData.parts = {
      body, chest, neck, head, snout,
      maneMain, tail, tailBase, tailMid, tailTip,
      legFL, legFR, legBL, legBR,
      eyeL, eyeR
    };

    return group;
  };

  // Label sprite helper
  const createLabelSprite = (text, color = '#fff3c9') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    ctx.fillStyle = color;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 42);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2, 0.5, 1);
    return sprite;
  };

  // REALISTIC GAZELLE MODEL
  const buildGazelle = (level) => {
    const group = new THREE.Group();
    const size = 0.7 + level * 0.05;
    const bodyColor = 0xc8a870;
    const hornColor = 0x4a3828;

    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });

    // Body - slender
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35 * size, 1.2 * size, 8, 12), bodyMat);
    body.rotation.z = Math.PI / 2;
    body.position.set(0, 0.9 * size, 0);
    body.castShadow = true;

    // Neck - long and thin
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * size, 0.22 * size, 0.8 * size, 8), bodyMat);
    neck.position.set(0, 1.2 * size, 0.8 * size);
    neck.rotation.x = 0.4;
    neck.castShadow = true;

    // Head - small
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35 * size, 0.3 * size, 0.45 * size), bodyMat);
    head.position.set(0, 1.65 * size, 1.2 * size);
    head.castShadow = true;

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.25 * size, 0.2 * size, 0.3 * size), bodyMat);
    snout.position.set(0, 1.58 * size, 1.45 * size);

    // Horns - curved
    const hornGeo = new THREE.CylinderGeometry(0.04 * size, 0.06 * size, 0.5 * size, 6);
    const hornMat = new THREE.MeshStandardMaterial({ color: hornColor });
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(-0.12 * size, 1.95 * size, 1.15 * size);
    hornR.position.set(0.12 * size, 1.95 * size, 1.15 * size);
    hornL.rotation.z = -0.2;
    hornR.rotation.z = 0.2;

    // Ears - large
    const earGeo = new THREE.ConeGeometry(0.12 * size, 0.25 * size, 6);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    const earR = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.18 * size, 1.82 * size, 1.1 * size);
    earR.position.set(0.18 * size, 1.82 * size, 1.1 * size);

    // Legs - thin and long
    const legFL = makeLeg(size * 0.9, bodyColor, true);
    const legFR = makeLeg(size * 0.9, bodyColor, true);
    const legBL = makeLeg(size * 0.9, bodyColor, false);
    const legBR = makeLeg(size * 0.9, bodyColor, false);

    legFL.position.set(-0.25 * size, 0.9 * size, 0.6 * size);
    legFR.position.set(0.25 * size, 0.9 * size, 0.6 * size);
    legBL.position.set(-0.25 * size, 0.9 * size, -0.5 * size);
    legBR.position.set(0.25 * size, 0.9 * size, -0.5 * size);

    // Tail - short with tuft
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05 * size, 0.03 * size, 0.6 * size, 6),
      bodyMat
    );
    tail.position.set(0, 0.85 * size, -0.8 * size);
    tail.rotation.x = Math.PI / 4;
    tail.castShadow = true;

    group.add(body, neck, head, snout, hornL, hornR, earL, earR, legFL, legFR, legBL, legBR, tail);

    group.userData.parts = {
      body, neck, head, tail,
      legFL, legFR, legBL, legBR
    };

    return group;
  };

  // REALISTIC ZEBRA MODEL
  const buildZebra = (level) => {
    const group = new THREE.Group();
    const size = 0.8 + level * 0.06;
    const whiteColor = 0xf0f0f0;
    const blackColor = 0x1a1a1a;

    const bodyMat = new THREE.MeshStandardMaterial({ color: whiteColor, roughness: 0.7 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: blackColor, roughness: 0.7 });

    // Body
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45 * size, 1.4 * size, 8, 12), bodyMat);
    body.rotation.z = Math.PI / 2;
    body.position.set(0, 0.95 * size, 0);
    body.castShadow = true;

    // Stripes on body (simplified)
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46 * size, 0.46 * size, 0.15 * size, 12),
        stripeMat
      );
      stripe.rotation.z = Math.PI / 2;
      stripe.position.set(0, 0.95 * size, -0.6 * size + i * 0.35 * size);
      group.add(stripe);
    }

    // Neck - strong
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * size, 0.3 * size, 0.9 * size, 8), bodyMat);
    neck.position.set(0, 1.25 * size, 0.9 * size);
    neck.rotation.x = 0.35;
    neck.castShadow = true;

    // Head - horse-like
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4 * size, 0.45 * size, 0.7 * size), bodyMat);
    head.position.set(0, 1.7 * size, 1.3 * size);
    head.castShadow = true;

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.35 * size, 0.3 * size, 0.5 * size), bodyMat);
    snout.position.set(0, 1.58 * size, 1.65 * size);

    // Mane - spiky
    for (let i = 0; i < 4; i++) {
      const maneSpike = new THREE.Mesh(
        new THREE.BoxGeometry(0.08 * size, 0.25 * size, 0.08 * size),
        stripeMat
      );
      maneSpike.position.set(0, 1.45 * size + i * 0.15 * size, 1.1 * size - i * 0.1 * size);
      maneSpike.rotation.x = 0.3;
      group.add(maneSpike);
    }

    // Ears
    const earGeo = new THREE.ConeGeometry(0.1 * size, 0.22 * size, 6);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    const earR = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.18 * size, 1.88 * size, 1.25 * size);
    earR.position.set(0.18 * size, 1.88 * size, 1.25 * size);

    // Legs - sturdy
    const legFL = makeLeg(size, whiteColor, true);
    const legFR = makeLeg(size, whiteColor, true);
    const legBL = makeLeg(size, whiteColor, false);
    const legBR = makeLeg(size, whiteColor, false);

    legFL.position.set(-0.3 * size, 0.95 * size, 0.7 * size);
    legFR.position.set(0.3 * size, 0.95 * size, 0.7 * size);
    legBL.position.set(-0.3 * size, 0.95 * size, -0.6 * size);
    legBR.position.set(0.3 * size, 0.95 * size, -0.6 * size);

    // Tail - long with tuft
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * size, 0.04 * size, 0.8 * size, 6),
      bodyMat
    );
    tail.position.set(0, 0.85 * size, -0.9 * size);
    tail.rotation.x = Math.PI / 3.5;
    tail.castShadow = true;

    const tailTuft = new THREE.Mesh(new THREE.SphereGeometry(0.12 * size, 8, 8), stripeMat);
    tailTuft.position.set(0, 0.45 * size, -1.4 * size);

    group.add(body, neck, head, snout, earL, earR, legFL, legFR, legBL, legBR, tail, tailTuft);

    group.userData.parts = {
      body, neck, head, tail,
      legFL, legFR, legBL, legBR
    };

    return group;
  };

  // REALISTIC WARTHOG MODEL
  const buildWarthog = (level) => {
    const group = new THREE.Group();
    const size = 0.65 + level * 0.05;
    const bodyColor = 0x8b7355;
    const tuskColor = 0xf5f5dc;

    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.9 });

    // Body - barrel-shaped
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5 * size, 12, 12), bodyMat);
    body.scale.set(1.4, 0.9, 1);
    body.position.set(0, 0.7 * size, 0);
    body.castShadow = true;

    // Head - large and blocky
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55 * size, 0.5 * size, 0.7 * size), bodyMat);
    head.position.set(0, 0.75 * size, 0.9 * size);
    head.castShadow = true;

    // Snout - prominent
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * size, 0.3 * size, 0.4 * size, 8), bodyMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.65 * size, 1.35 * size);

    // Tusks - curved upward
    const tuskMat = new THREE.MeshStandardMaterial({ color: tuskColor });
    const tuskL = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * size, 0.06 * size, 0.4 * size, 6), tuskMat);
    const tuskR = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * size, 0.06 * size, 0.4 * size, 6), tuskMat);
    tuskL.position.set(-0.22 * size, 0.85 * size, 1.3 * size);
    tuskR.position.set(0.22 * size, 0.85 * size, 1.3 * size);
    tuskL.rotation.z = -0.4;
    tuskR.rotation.z = 0.4;

    // Ears - large
    const earGeo = new THREE.BoxGeometry(0.25 * size, 0.35 * size, 0.05 * size);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    const earR = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.35 * size, 0.95 * size, 0.8 * size);
    earR.position.set(0.35 * size, 0.95 * size, 0.8 * size);
    earL.rotation.y = -0.3;
    earR.rotation.y = 0.3;

    // Legs - short and stocky
    const legFL = makeLeg(size * 0.7, bodyColor, true);
    const legFR = makeLeg(size * 0.7, bodyColor, true);
    const legBL = makeLeg(size * 0.7, bodyColor, false);
    const legBR = makeLeg(size * 0.7, bodyColor, false);

    legFL.position.set(-0.35 * size, 0.7 * size, 0.5 * size);
    legFR.position.set(0.35 * size, 0.7 * size, 0.5 * size);
    legBL.position.set(-0.35 * size, 0.7 * size, -0.4 * size);
    legBR.position.set(0.35 * size, 0.7 * size, -0.4 * size);

    // Tail - thin with tuft
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * size, 0.03 * size, 0.5 * size, 6),
      bodyMat
    );
    tail.position.set(0, 0.9 * size, -0.7 * size);
    tail.rotation.x = -Math.PI / 6;
    tail.castShadow = true;

    group.add(body, head, snout, tuskL, tuskR, earL, earR, legFL, legFR, legBL, legBR, tail);

    group.userData.parts = {
      body, head, tail,
      legFL, legFR, legBL, legBR
    };

    return group;
  };

  // Tint mesh helper
  const tintMesh = (mesh, color) => {
    mesh.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = new THREE.Color(color);
        child.material.emissiveIntensity = 0.4;
      }
    });
  };

  // Reset tint helper
  const resetTint = (mesh) => {
    mesh.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
      }
    });
  };

  // Build animal dispatcher
  const buildAnimal = (type, level) => {
    switch (type.name) {
      case 'Singa Liar': return buildLion(level);
      case 'Zebra': return buildZebra(level);
      case 'Rusa': return buildGazelle(level); // Use Gazelle for Rusa
      case 'Kerbau': return buildWarthog(level); // Use Warthog for Kerbau/Buffalo placeholder
      case 'Hiena': return buildLion(level); // Placeholder: use Lion model for Hiena for now
      default: return buildGazelle(level);
    }
  };

  // Helper to store original materials for tinting
  const storeMaterials = (mesh) => {
    const materials = [];
    mesh.traverse((child) => {
      if (child.isMesh && child.material) {
        materials.push({
          mesh: child,
          color: child.material.color.clone(),
          emissive: child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0, 0, 0),
          emissiveIntensity: child.material.emissiveIntensity || 0
        });
      }
    });
    return materials;
  };

  // Helper to restore materials
  const restoreMaterials = (stored) => {
    stored.forEach((data) => {
      if (data.mesh.material) {
        data.mesh.material.color.copy(data.color);
        if (data.mesh.material.emissive) {
          data.mesh.material.emissive.copy(data.emissive);
          data.mesh.material.emissiveIntensity = data.emissiveIntensity;
        }
      }
    });
  };

  // Export
  Game.models = {
    buildLion,
    buildGazelle,
    buildZebra,
    buildWarthog,
    buildAnimal,      // Added
    createLabelSprite,
    tintMesh,
    resetTint,
    storeMaterials,   // Added
    restoreMaterials  // Added
  };
})();
