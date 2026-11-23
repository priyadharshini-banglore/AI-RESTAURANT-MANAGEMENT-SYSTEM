import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createCoffeeBeanGeometry, createCoffeeBeanMaterial } from './threeUtils';

interface HeroGrinder3DProps {
  className?: string;
}

export const HeroGrinder3D: React.FC<HeroGrinder3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 650;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Group for whole grinder setup
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5eb, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 2.8);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb77a4b, 1.6);
    rimLight.position.set(-5, 3, -3);
    scene.add(rimLight);

    const softFill = new THREE.PointLight(0xffd8b4, 1.2, 10);
    softFill.position.set(0, -1, 3);
    scene.add(softFill);

    // 2. Grinder Materials
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc9933b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const darkBrassMat = new THREE.MeshStandardMaterial({
      color: 0x8a6225,
      metalness: 0.9,
      roughness: 0.35,
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e1f,
      roughness: 0.55,
      metalness: 0.05,
    });

    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x2d1c13,
      roughness: 0.6,
      metalness: 0.05,
    });

    const acrylicMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.7,
      ior: 1.45,
    });

    const coffeeGroundsMat = new THREE.MeshStandardMaterial({
      color: 0x331e13,
      roughness: 0.9,
      metalness: 0.0,
    });

    // 3. Grinder Construction
    const grinderGroup = new THREE.Group();
    grinderGroup.position.set(0, -0.4, 0);
    mainGroup.add(grinderGroup);

    // A. Main Wooden Body (Cube with beveled edge effect)
    const baseGeom = new THREE.BoxGeometry(1.6, 1.4, 1.6);
    const baseMesh = new THREE.Mesh(baseGeom, woodMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    grinderGroup.add(baseMesh);

    // Base trim footings
    const footGeom = new THREE.BoxGeometry(1.72, 0.12, 1.72);
    const footMesh = new THREE.Mesh(footGeom, darkWoodMat);
    footMesh.position.y = -0.7;
    footMesh.castShadow = true;
    grinderGroup.add(footMesh);

    // Top trim collar
    const topPlateGeom = new THREE.BoxGeometry(1.7, 0.1, 1.7);
    const topPlateMesh = new THREE.Mesh(topPlateGeom, darkWoodMat);
    topPlateMesh.position.y = 0.72;
    topPlateMesh.castShadow = true;
    grinderGroup.add(topPlateMesh);

    // Front Drawer Compartment
    const drawerFaceGeom = new THREE.BoxGeometry(1.1, 0.65, 0.08);
    const drawerMesh = new THREE.Mesh(drawerFaceGeom, darkWoodMat);
    drawerMesh.position.set(0, -0.2, 0.82);
    grinderGroup.add(drawerMesh);

    const drawerKnobGeom = new THREE.SphereGeometry(0.09, 16, 16);
    const drawerKnob = new THREE.Mesh(drawerKnobGeom, brassMat);
    drawerKnob.position.set(0, -0.2, 0.92);
    drawerKnob.castShadow = true;
    grinderGroup.add(drawerKnob);

    // Acrylic Coffee Chamber window
    const windowGeom = new THREE.BoxGeometry(0.8, 0.35, 0.05);
    const windowMesh = new THREE.Mesh(windowGeom, acrylicMat);
    windowMesh.position.set(0, 0.3, 0.81);
    grinderGroup.add(windowMesh);

    // Coffee grounds inside window
    const groundsGeom = new THREE.BoxGeometry(0.74, 0.22, 0.03);
    const groundsMesh = new THREE.Mesh(groundsGeom, coffeeGroundsMat);
    groundsMesh.position.set(0, 0.24, 0.81);
    grinderGroup.add(groundsMesh);

    // Brass Plaque / Badge
    const plaqueGeom = new THREE.BoxGeometry(0.65, 0.16, 0.02);
    const plaqueMesh = new THREE.Mesh(plaqueGeom, brassMat);
    plaqueMesh.position.set(0, -0.05, 0.82);
    grinderGroup.add(plaqueMesh);

    // B. Upper Hopper (Brass conical bowl)
    const hopperCollar = new THREE.CylinderGeometry(0.68, 0.68, 0.12, 32);
    const collarMesh = new THREE.Mesh(hopperCollar, darkBrassMat);
    collarMesh.position.y = 0.82;
    collarMesh.castShadow = true;
    grinderGroup.add(collarMesh);

    const hopperGeom = new THREE.CylinderGeometry(0.85, 0.45, 0.75, 32, 1, true);
    const hopperMesh = new THREE.Mesh(hopperGeom, brassMat);
    hopperMesh.position.y = 1.25;
    hopperMesh.castShadow = true;
    grinderGroup.add(hopperMesh);

    // Beans piled inside the hopper
    const beanPileGeom = new THREE.SphereGeometry(0.65, 16, 12);
    beanPileGeom.scale(1, 0.45, 1);
    const beanPileMat = createCoffeeBeanMaterial(true);
    const beanPile = new THREE.Mesh(beanPileGeom, beanPileMat);
    beanPile.position.y = 1.28;
    grinderGroup.add(beanPile);

    // C. Central Turning Crank Mechanism
    const centerPinGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.75, 16);
    const centerPin = new THREE.Mesh(centerPinGeom, darkBrassMat);
    centerPin.position.y = 1.7;
    grinderGroup.add(centerPin);

    // Rotating Crank Group
    const crankGroup = new THREE.Group();
    crankGroup.position.set(0, 1.95, 0);
    grinderGroup.add(crankGroup);

    // Curved handle arm
    const handleArmGeom = new THREE.BoxGeometry(1.3, 0.06, 0.14);
    const handleArm = new THREE.Mesh(handleArmGeom, brassMat);
    handleArm.position.x = 0.6;
    handleArm.castShadow = true;
    crankGroup.add(handleArm);

    // Upright handle peg
    const pegGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12);
    const pegMesh = new THREE.Mesh(pegGeom, darkBrassMat);
    pegMesh.position.set(1.15, 0.2, 0);
    crankGroup.add(pegMesh);

    // Wooden handle knob
    const knobGeom = new THREE.CylinderGeometry(0.12, 0.09, 0.45, 16);
    const knobMesh = new THREE.Mesh(knobGeom, darkWoodMat);
    knobMesh.position.set(1.15, 0.38, 0);
    knobMesh.castShadow = true;
    crankGroup.add(knobMesh);

    // 4. Floating 3D Coffee Beans with Orbital Physics
    const beanGeometry = createCoffeeBeanGeometry(1);
    const beanMaterialA = createCoffeeBeanMaterial(false);
    const beanMaterialB = createCoffeeBeanMaterial(true);

    const floatingBeans: {
      mesh: THREE.Mesh;
      speed: number;
      orbitRadius: number;
      orbitAngle: number;
      orbitY: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
    }[] = [];

    const BEAN_COUNT = 24;
    for (let i = 0; i < BEAN_COUNT; i++) {
      const mat = i % 2 === 0 ? beanMaterialA : beanMaterialB;
      const beanMesh = new THREE.Mesh(beanGeometry, mat);
      
      const scale = 0.65 + Math.random() * 0.45;
      beanMesh.scale.set(scale, scale, scale);
      beanMesh.castShadow = true;

      const orbitRadius = 1.4 + Math.random() * 1.6;
      const orbitAngle = (i / BEAN_COUNT) * Math.PI * 2 + Math.random() * 0.5;
      const orbitY = -0.6 + Math.random() * 2.8;

      beanMesh.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        orbitY,
        Math.sin(orbitAngle) * orbitRadius
      );

      beanMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      mainGroup.add(beanMesh);

      floatingBeans.push({
        mesh: beanMesh,
        speed: 0.15 + Math.random() * 0.25,
        orbitRadius,
        orbitAngle,
        orbitY,
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.8,
        rotSpeedZ: (Math.random() - 0.5) * 1.2,
      });
    }

    // 5. Mouse Parallax Easing
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0.35;
    let targetRotX = 0.08;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = normX;
      mouseY = normY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slow crank rotation
      crankGroup.rotation.y += delta * 1.2;

      // Floating beans orbital & bobbing motion
      floatingBeans.forEach((b, idx) => {
        b.orbitAngle += b.speed * delta;
        const currentY = b.orbitY + Math.sin(elapsedTime * 1.5 + idx) * 0.18;
        b.mesh.position.x = Math.cos(b.orbitAngle) * b.orbitRadius;
        b.mesh.position.z = Math.sin(b.orbitAngle) * b.orbitRadius;
        b.mesh.position.y = currentY;

        b.mesh.rotation.x += b.rotSpeedX * delta;
        b.mesh.rotation.y += b.rotSpeedY * delta;
        b.mesh.rotation.z += b.rotSpeedZ * delta;
      });

      // Smooth mouse parallax interpolation
      targetRotY = 0.35 + mouseX * 0.35;
      targetRotX = 0.08 - mouseY * 0.25;

      grinderGroup.rotation.y += (targetRotY - grinderGroup.rotation.y) * 0.05;
      grinderGroup.rotation.x += (targetRotX - grinderGroup.rotation.x) * 0.05;

      // Gentle vertical floating breathing motion
      grinderGroup.position.y = -0.4 + Math.sin(elapsedTime * 0.8) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
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
      className={`relative w-full h-[520px] sm:h-[600px] lg:h-[700px] flex items-center justify-center pointer-events-auto ${className}`}
    />
  );
};

