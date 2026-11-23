import * as THREE from 'three';

/**
 * Creates an authentic 3D coffee bean geometry with the signature central curved crease.
 */
export function createCoffeeBeanGeometry(scale = 1): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(0.35 * scale, 24, 20);
  const pos = geom.attributes.position;
  
  // Transform sphere into bean shape: elongate along Z, flatten along Y, indent along central crease on +Y
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Oval elongation
    z *= 1.45;
    x *= 0.95;
    y *= 0.75;

    // Create central groove/crease on the top face
    if (y > 0) {
      const distFromCenterLine = Math.abs(x);
      if (distFromCenterLine < 0.12 * scale) {
        y -= (0.12 * scale - distFromCenterLine) * 1.2;
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Rich roasted coffee bean material with warm chocolate/caramel sheen
 */
export function createCoffeeBeanMaterial(isDark = false): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: isDark ? 0x2A1B14 : 0x4A2E1F,
    roughness: 0.35,
    metalness: 0.1,
    bumpScale: 0.05,
  });
}

/**
 * Procedural particles for rising steam
 */
export function createSteamParticles(count = 45): {
  points: THREE.Points;
  update: (delta: number) => void;
} {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const life = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.4;
    positions[i * 3 + 1] = Math.random() * 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

    velocities[i * 3] = (Math.random() - 0.5) * 0.1;
    velocities[i * 3 + 1] = 0.4 + Math.random() * 0.5;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

    life[i] = Math.random();
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Canvas circle texture for soft round steam puffs
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);

  const mat = new THREE.PointsMaterial({
    size: 0.35,
    map: texture,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geom, mat);

  const update = (delta: number) => {
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      life[i] += delta * 0.6;
      if (life[i] > 1) {
        life[i] = 0;
        posAttr.setXYZ(i, (Math.random() - 0.5) * 0.25, 0, (Math.random() - 0.5) * 0.25);
      } else {
        const x = posAttr.getX(i) + velocities[i * 3] * delta;
        const y = posAttr.getY(i) + velocities[i * 3 + 1] * delta;
        const z = posAttr.getZ(i) + velocities[i * 3 + 2] * delta;
        posAttr.setXYZ(i, x + Math.sin(y * 4) * 0.003, y, z);
      }
    }
    posAttr.needsUpdate = true;
  };

  return { points, update };
}

