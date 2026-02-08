'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RaceTrack() {
  const trackRef = useRef<THREE.Group>(null!);

  // Create oval track shape
  const trackShape = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 12;
    const height = 6;
    const r = 3;

    shape.moveTo(-width / 2 + r, -height / 2);
    shape.lineTo(width / 2 - r, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + r);
    shape.lineTo(width / 2, height / 2 - r);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - r, height / 2);
    shape.lineTo(-width / 2 + r, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - r);
    shape.lineTo(-width / 2, -height / 2 + r);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + r, -height / 2);

    // Inner cutout
    const hole = new THREE.Path();
    const iw = 8;
    const ih = 2;
    const ir = 1;
    hole.moveTo(-iw / 2 + ir, -ih / 2);
    hole.lineTo(iw / 2 - ir, -ih / 2);
    hole.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + ir);
    hole.lineTo(iw / 2, ih / 2 - ir);
    hole.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - ir, ih / 2);
    hole.lineTo(-iw / 2 + ir, ih / 2);
    hole.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - ir);
    hole.lineTo(-iw / 2, -ih / 2 + ir);
    hole.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + ir, -ih / 2);

    shape.holes.push(hole);
    return shape;
  }, []);

  // Lane divider points (dashed center line on track)
  const lanePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 60;
    const width = 10;
    const height = 4;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * width * 0.5;
      const z = Math.sin(t) * height * 0.5;
      points.push([x, 0.06, z]);
    }
    return points;
  }, []);

  // Animated glow ring
  const glowRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={trackRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      {/* Track surface */}
      <mesh>
        <shapeGeometry args={[trackShape]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Track border glow */}
      <mesh ref={glowRef} position={[0, 0, 0.01]}>
        <shapeGeometry args={[trackShape]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lane divider dots */}
      {lanePoints.filter((_, i) => i % 3 === 0).map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[2], 0.02]}>
          <circleGeometry args={[0.06, 8]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      ))}

      {/* Start/Finish line */}
      <mesh position={[-6, 0, 0.03]}>
        <planeGeometry args={[0.15, 4]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>

      {/* Checkered pattern on start line */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`checker-${i}`} position={[-6.12, -2 + i * 0.5 + 0.25, 0.04]}>
          <planeGeometry args={[0.12, 0.25]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#ffffff' : '#000000'} />
        </mesh>
      ))}
    </group>
  );
}
