import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createCoffeeBeanGeometry, createCoffeeBeanMaterial, createSteamParticles } from './threeUtils';

interface ShowcaseCup3DProps {
  className?: string;
}

export const ShowcaseCup3D: React.FC<ShowcaseCup3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffecd2, 3.2);
    key.position.set(4, 6, 4);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xb77a4b, 1.8);
    rim.position.set(-5, 2, -3);
    scene.add(rim);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Ceramic cup with rich terracotta finish & white inner enamel
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x593a2c,
      roughness: 0.28,
      metalness: 0.05,
    });

    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xfaf5ee,
      roughness: 0.18,
      metalness: 0.05,
    });

    const coffeeLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x1a110b,
      roughness: 0.1,
    });

    // Saucer
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.85, 0.1, 32), outerMat);
    saucer.position.y = -0.7;
    saucer.castShadow = true;
    rootGroup.add(saucer);

    // Cup
    const cupGroup = new THREE.Group();
    cupGroup.position.y = -0.15;
    rootGroup.add(cupGroup);

    const cupOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.62, 1.0, 32, 1, true), outerMat);
    cupOuter.castShadow = true;
    cupGroup.add(cupOuter);

    const cupInner = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.59, 0.96, 32, 1, true), innerMat);
    cupGroup.add(cupInner);

    // Coffee Liquid Surface with Crema art swirl
    const liquidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.81, 0.6, 0.88, 32), coffeeLiquidMat);
    liquidMesh.position.y = -0.05;
    cupGroup.add(liquidMesh);

    // Crema foam ring
    const cremaGeom = new THREE.RingGeometry(0.1, 0.78, 32);
    const cremaMat = new THREE.MeshStandardMaterial({ color: 0xba9264, roughness: 0.55 });
    const crema = new THREE.Mesh(cremaGeom, cremaMat);
    crema.rotation.x = -Math.PI / 2;
    crema.position.y = 0.4;
    cupGroup.add(crema);

    // Cup handle
    const handleGeom = new THREE.TorusGeometry(0.32, 0.07, 16, 24, Math.PI * 1.15);
    const cupHandle = new THREE.Mesh(handleGeom, outerMat);
    cupHandle.position.set(0.88, 0, 0);
    cupHandle.rotation.z = -Math.PI / 2;
    cupGroup.add(cupHandle);

    // Steam particles
    const steam = createSteamParticles(45);
    steam.points.position.set(0, 0.45, 0);
    cupGroup.add(steam.points);

    // Floating Coffee Beans orbiting the cup
    const beanGeom = createCoffeeBeanGeometry(0.9);
    const beanMat = createCoffeeBeanMaterial(false);
    const orbitBeans: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; y: number }[] = [];

    for (let i = 0; i < 14; i++) {
      const bean = new THREE.Mesh(beanGeom, beanMat);
      const angle = (i / 14) * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.8;
      const y = -0.5 + Math.random() * 1.4;
      bean.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      bean.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      rootGroup.add(bean);
      orbitBeans.push({
        mesh: bean,
        angle,
        speed: 0.35 + Math.random() * 0.4,
        radius,
        y,
      });
    }

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle cup floating and rotation
      rootGroup.rotation.y += delta * 0.35;
      rootGroup.position.y = Math.sin(elapsed * 1.4) * 0.08;

      // Orbiting beans
      orbitBeans.forEach((b, idx) => {
        b.angle += b.speed * delta;
        b.mesh.position.x = Math.cos(b.angle) * b.radius;
        b.mesh.position.z = Math.sin(b.angle) * b.radius;
        b.mesh.position.y = b.y + Math.sin(elapsed * 2 + idx) * 0.1;
        b.mesh.rotation.x += delta * 1.2;
        b.mesh.rotation.y += delta * 1.5;
      });

      steam.update(delta);

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
      className={`relative w-full h-[380px] sm:h-[440px] flex items-center justify-center ${className}`}
    />
  );
};

