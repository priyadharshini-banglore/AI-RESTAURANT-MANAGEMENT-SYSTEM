import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createCoffeeBeanGeometry, createCoffeeBeanMaterial, createSteamParticles } from './threeUtils';

interface BrewingStation3DProps {
  className?: string;
  isWaterPouring?: boolean;
}

export const BrewingStation3D: React.FC<BrewingStation3DProps> = ({
  className = '',
  isWaterPouring = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pouringRef = useRef(isWaterPouring);
  pouringRef.current = isWaterPouring;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.3, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xfff7ed, 1.5);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffecd2, 3.0);
    key.position.set(5, 7, 4);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xb77a4b, 1.7);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc49340, metalness: 0.85, roughness: 0.25 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb8653b, metalness: 0.9, roughness: 0.22 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2518, roughness: 0.6 });
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf5f1e9, roughness: 0.18, metalness: 0.05 });
    const darkCoffeeLiquidMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.12 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.45,
      transparent: true,
      roughness: 0.08,
      ior: 1.5,
    });

    // 1. Wooden Stand Base
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.45, 0.12, 32), woodMat);
    standBase.position.y = -1.15;
    standBase.receiveShadow = true;
    rootGroup.add(standBase);

    // Brass upright support arm
    const uprightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.3, 16), brassMat);
    uprightArm.position.set(-1.05, 0.0, 0);
    rootGroup.add(uprightArm);

    // Brass horizontal ring holding the dripper
    const holderRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 16, 32), brassMat);
    holderRing.rotation.x = Math.PI / 2;
    holderRing.position.set(0, 0.5, 0);
    rootGroup.add(holderRing);

    // Connecting rod from upright to ring
    const connectingRod = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.05), brassMat);
    connectingRod.position.set(-0.52, 0.5, 0);
    rootGroup.add(connectingRod);

    // 2. Ceramic V60 Dripper (Ribbed Cone)
    const dripperGroup = new THREE.Group();
    dripperGroup.position.set(0, 0.52, 0);
    rootGroup.add(dripperGroup);

    const dripperMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.28, 0.85, 32, 1, true), ceramicMat);
    dripperMesh.position.y = 0.42;
    dripperMesh.castShadow = true;
    dripperGroup.add(dripperMesh);

    // Paper filter cone inside
    const filterMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f1, roughness: 0.8 });
    const filterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.26, 0.82, 32, 1, true), filterMat);
    filterMesh.position.y = 0.42;
    dripperGroup.add(filterMesh);

    // Ground coffee bed
    const coffeeGroundsMat = createCoffeeBeanMaterial(true);
    const groundsMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.24, 0.35, 24), coffeeGroundsMat);
    groundsMesh.position.y = 0.35;
    dripperGroup.add(groundsMesh);

    // 3. Glass Server (Carafe) with Spout and Handle
    const serverGroup = new THREE.Group();
    serverGroup.position.set(0, -0.4, 0);
    rootGroup.add(serverGroup);

    const carafeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.05, 1.35, 32, 1, true), glassMat);
    carafeBody.castShadow = true;
    serverGroup.add(carafeBody);

    const serverLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.98, 0.65, 32), darkCoffeeLiquidMat);
    serverLiquid.position.y = -0.32;
    serverGroup.add(serverLiquid);

    // Glass handle
    const handleGeom = new THREE.TorusGeometry(0.45, 0.06, 16, 24, Math.PI * 1.1);
    const handleMesh = new THREE.Mesh(handleGeom, glassMat);
    handleMesh.position.set(1.05, 0.0, 0);
    handleMesh.rotation.z = -Math.PI / 2;
    serverGroup.add(handleMesh);

    // 4. Gooseneck Pouring Kettle
    const kettleGroup = new THREE.Group();
    kettleGroup.position.set(1.55, 1.65, 0.3);
    kettleGroup.rotation.z = 0.45; // Tilted to pour
    rootGroup.add(kettleGroup);

    const kettleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.9, 32), copperMat);
    kettleBody.castShadow = true;
    kettleGroup.add(kettleBody);

    const kettleLid = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.55, 0.12, 24), brassMat);
    kettleLid.position.y = 0.48;
    kettleGroup.add(kettleLid);

    const kettleKnob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), woodMat);
    kettleKnob.position.y = 0.58;
    kettleGroup.add(kettleKnob);

    // Gooseneck spout extending into center
    const spoutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.4, -0.2, 0),
      new THREE.Vector3(-0.8, 0.1, 0),
      new THREE.Vector3(-1.15, -0.35, 0),
    ]);
    const spoutGeom = new THREE.TubeGeometry(spoutCurve, 20, 0.045, 12, false);
    const spoutMesh = new THREE.Mesh(spoutGeom, copperMat);
    kettleGroup.add(spoutMesh);

    // 5. Water Stream pouring from kettle spout
    const waterGeom = new THREE.CylinderGeometry(0.02, 0.015, 0.75, 12);
    const waterMat = new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, transmission: 0.95, transparent: true, opacity: 0.8 });
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.set(0.12, 1.25, 0.3);
    rootGroup.add(waterMesh);

    // Coffee drip droplets from bottom of dripper into carafe
    const dripDroplet = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), darkCoffeeLiquidMat);
    dripDroplet.position.set(0, 0.35, 0);
    rootGroup.add(dripDroplet);

    // 6. Rising Steam
    const steam = createSteamParticles(40);
    steam.points.position.set(0, 0.1, 0);
    rootGroup.add(steam.points);

    // 7. Scattering of decorative 3D roasted beans on the table
    const beanGeom = createCoffeeBeanGeometry(0.8);
    const beanMat = createCoffeeBeanMaterial(false);
    for (let i = 0; i < 9; i++) {
      const bean = new THREE.Mesh(beanGeom, beanMat);
      const angle = (i / 9) * Math.PI * 2;
      const r = 1.1 + (i % 3) * 0.15;
      bean.position.set(Math.cos(angle) * r, -1.05, Math.sin(angle) * r);
      bean.rotation.set(0.2, Math.random() * Math.PI, 0.1);
      bean.castShadow = true;
      rootGroup.add(bean);
    }

    // Mouse parallax
    let mouseX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle wobble of pouring kettle
      kettleGroup.rotation.z = 0.42 + Math.sin(elapsed * 2) * 0.04;
      kettleGroup.position.y = 1.65 + Math.sin(elapsed * 1.5) * 0.03;

      // Water stream thickness breathing
      waterMesh.scale.x = 0.8 + Math.sin(elapsed * 12) * 0.2;
      waterMesh.scale.z = 0.8 + Math.cos(elapsed * 12) * 0.2;

      // Coffee drip falling
      dripDroplet.position.y -= delta * 1.6;
      if (dripDroplet.position.y < -0.3) {
        dripDroplet.position.y = 0.35;
      }

      // Rising steam
      steam.update(delta);

      // Smooth subtle group rotation
      const targetRotY = mouseX * 0.25;
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.05;

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
      window.removeEventListener('mousemove', handleMouseMove);
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
      className={`relative w-full h-[450px] sm:h-[520px] lg:h-[580px] flex items-center justify-center ${className}`}
    />
  );
};

