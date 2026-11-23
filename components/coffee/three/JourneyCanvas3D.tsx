import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createCoffeeBeanGeometry, createCoffeeBeanMaterial, createSteamParticles } from './threeUtils';

interface JourneyCanvas3DProps {
  currentStep: number; // 0: Beans, 1: Grinding, 2: Brewing, 3: Fresh Coffee, 4: Coffee Moment
  className?: string;
}

export const JourneyCanvas3D: React.FC<JourneyCanvas3DProps> = ({ currentStep, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(currentStep);
  stepRef.current = currentStep;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xfff6ed, 1.6);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffedd5, 3.2);
    key.position.set(5, 7, 5);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xc87552, 1.8);
    rim.position.set(-6, 3, -4);
    scene.add(rim);

    // Root groups for each of the 5 scenes
    const sceneGroups = [
      new THREE.Group(), // 0: Beans
      new THREE.Group(), // 1: Grinder
      new THREE.Group(), // 2: Brewing Dripper + Kettle
      new THREE.Group(), // 3: Server + Dripping Coffee
      new THREE.Group(), // 4: Cup Moment
    ];

    sceneGroups.forEach((g) => scene.add(g));

    // Shared Materials
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a359, metalness: 0.85, roughness: 0.25 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1f, roughness: 0.55 });
    const ceramicWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f1e9, roughness: 0.2, metalness: 0.05 });
    const ceramicTerracottaMat = new THREE.MeshStandardMaterial({ color: 0xc87552, roughness: 0.35 });
    const darkCoffeeLiquidMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.15, metalness: 0.1 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.45,
      transparent: true,
      roughness: 0.08,
      ior: 1.5,
      thickness: 0.8,
    });

    // ----------------------------------------------------
    // SCENE 0: Floating Roasted Beans
    // ----------------------------------------------------
    const beanGeom = createCoffeeBeanGeometry(1.2);
    const beanMat = createCoffeeBeanMaterial(false);
    const scene0Beans: THREE.Mesh[] = [];

    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(beanGeom, beanMat);
      const angle = (i / 30) * Math.PI * 2;
      const radius = 1.2 + Math.random() * 1.6;
      mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 2.8, Math.sin(angle) * radius);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      scene0Beans.push(mesh);
      sceneGroups[0].add(mesh);
    }

    // ----------------------------------------------------
    // SCENE 1: Grinding (Grinder + Ground Particles)
    // ----------------------------------------------------
    const grinderBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), woodMat);
    grinderBase.position.y = -0.5;
    sceneGroups[1].add(grinderBase);

    const hopperCone = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.35, 0.7, 24), brassMat);
    hopperCone.position.y = 0.45;
    sceneGroups[1].add(hopperCone);

    const crankHandle = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.12), brassMat);
    crankHandle.position.set(0.45, 0.85, 0);
    sceneGroups[1].add(crankHandle);

    // Ground coffee particle shower
    const groundsGeom = new THREE.BufferGeometry();
    const groundCount = 120;
    const groundPositions = new Float32Array(groundCount * 3);
    for (let i = 0; i < groundCount; i++) {
      groundPositions[i * 3] = (Math.random() - 0.5) * 0.7;
      groundPositions[i * 3 + 1] = -0.2 - Math.random() * 0.9;
      groundPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.7;
    }
    groundsGeom.setAttribute('position', new THREE.BufferAttribute(groundPositions, 3));
    const groundsMat = new THREE.PointsMaterial({ color: 0x3d2314, size: 0.06 });
    const groundsParticles = new THREE.Points(groundsGeom, groundsMat);
    sceneGroups[1].add(groundsParticles);

    // ----------------------------------------------------
    // SCENE 2: Brewing (Pour-over dripper + Kettle stream)
    // ----------------------------------------------------
    // Ceramic V60 Cone
    const dripperCone = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.25, 0.9, 32, 1, true), ceramicWhiteMat);
    dripperCone.position.y = 0.5;
    sceneGroups[2].add(dripperCone);

    // Coffee bed inside dripper
    const coffeeBed = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.22, 0.3, 24), createCoffeeBeanMaterial(true));
    coffeeBed.position.y = 0.45;
    sceneGroups[2].add(coffeeBed);

    // Gooseneck kettle spout
    const kettleSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 1.4, 16), brassMat);
    kettleSpout.position.set(1.4, 1.5, 0);
    kettleSpout.rotation.z = 1.1;
    sceneGroups[2].add(kettleSpout);

    // Water stream pouring into dripper
    const waterStreamGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 12);
    const waterStreamMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transmission: 0.95, transparent: true, opacity: 0.7 });
    const waterStream = new THREE.Mesh(waterStreamGeom, waterStreamMat);
    waterStream.position.set(0.0, 1.05, 0);
    sceneGroups[2].add(waterStream);

    // ----------------------------------------------------
    // SCENE 3: Fresh Coffee (Server Carafe + Dripping droplets)
    // ----------------------------------------------------
    // Glass Carafe Server
    const serverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.15, 1.6, 32, 1, true), glassMat);
    serverBody.position.y = -0.4;
    sceneGroups[3].add(serverBody);

    const serverLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.05, 0.7, 32), darkCoffeeLiquidMat);
    serverLiquid.position.y = -0.8;
    sceneGroups[3].add(serverLiquid);

    // Small dripping droplet
    const droplet = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), darkCoffeeLiquidMat);
    droplet.position.set(0, 0.5, 0);
    sceneGroups[3].add(droplet);

    // Steam for fresh coffee
    const steam3 = createSteamParticles(35);
    steam3.points.position.set(0, -0.2, 0);
    sceneGroups[3].add(steam3.points);

    // ----------------------------------------------------
    // SCENE 4: Coffee Moment (Ceramic Cup & Saucer)
    // ----------------------------------------------------
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.9, 0.12, 32), ceramicTerracottaMat);
    saucer.position.y = -0.9;
    sceneGroups[4].add(saucer);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 1.1, 32, 1, true), ceramicTerracottaMat);
    cup.position.y = -0.3;
    sceneGroups[4].add(cup);

    const cupLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.62, 0.95, 32), darkCoffeeLiquidMat);
    cupLiquid.position.y = -0.35;
    sceneGroups[4].add(cupLiquid);

    // Crema ring
    const cremaGeom = new THREE.RingGeometry(0.1, 0.78, 32);
    const cremaMat = new THREE.MeshStandardMaterial({ color: 0xc89d6e, roughness: 0.6 });
    const crema = new THREE.Mesh(cremaGeom, cremaMat);
    crema.rotation.x = -Math.PI / 2;
    crema.position.y = 0.13;
    sceneGroups[4].add(crema);

    // Cup handle
    const handleGeom = new THREE.TorusGeometry(0.35, 0.08, 16, 24, Math.PI * 1.2);
    const cupHandle = new THREE.Mesh(handleGeom, ceramicTerracottaMat);
    cupHandle.position.set(0.9, -0.3, 0);
    cupHandle.rotation.z = -Math.PI / 2;
    sceneGroups[4].add(cupHandle);

    const steam4 = createSteamParticles(40);
    steam4.points.position.set(0, 0.2, 0);
    sceneGroups[4].add(steam4.points);

    // Initial opacity state: show active step, hide others
    const updateSceneVisibilities = (targetStep: number) => {
      sceneGroups.forEach((group, idx) => {
        const isCurrent = idx === targetStep;
        group.visible = isCurrent;
        group.position.x = isCurrent ? 0 : idx < targetStep ? -4 : 4;
      });
    };

    updateSceneVisibilities(currentStep);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const active = stepRef.current;

      // Update positions with smooth lerp
      sceneGroups.forEach((group, idx) => {
        const targetX = idx === active ? 0 : idx < active ? -3.5 : 3.5;
        const targetScale = idx === active ? 1 : 0.65;
        group.position.x += (targetX - group.position.x) * 0.08;
        const currentScale = group.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.08;
        group.scale.set(newScale, newScale, newScale);
        group.visible = Math.abs(group.position.x) < 3.2;

        // Gentle turn
        group.rotation.y = Math.sin(elapsed * 0.6) * 0.2;
      });

      // Scene 0: swirling beans
      if (active === 0) {
        scene0Beans.forEach((b, i) => {
          b.rotation.x += delta * 0.8;
          b.rotation.y += delta * 1.1;
          b.position.y += Math.sin(elapsed * 2 + i) * 0.003;
        });
      }

      // Scene 1: grinding crank and ground drop
      if (active === 1) {
        crankHandle.rotation.y += delta * 4;
        const pos = groundsGeom.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < groundCount; i++) {
          let y = pos.getY(i) - delta * 0.9;
          if (y < -1.1) y = -0.2;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
      }

      // Scene 2: water stream oscillation
      if (active === 2) {
        waterStream.scale.x = 0.9 + Math.sin(elapsed * 8) * 0.15;
        waterStream.scale.z = 0.9 + Math.cos(elapsed * 8) * 0.15;
      }

      // Scene 3: dripping droplet & steam
      if (active === 3) {
        droplet.position.y -= delta * 1.8;
        if (droplet.position.y < -0.6) droplet.position.y = 0.6;
        steam3.update(delta);
      }

      // Scene 4: steam rising
      if (active === 4) {
        steam4.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full h-[450px] sm:h-[520px] lg:h-[600px] flex items-center justify-center ${className}`}
    />
  );
};

