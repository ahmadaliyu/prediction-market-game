'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ArenaFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (gridRef.current) {
      (gridRef.current.material as THREE.Material).opacity =
        0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.002;
    }
  });

  return (
    <group>
      {/* Grid floor */}
      <gridHelper
        ref={gridRef}
        args={[40, 40, '#00F0FF', '#1a1a3e']}
        position={[0, -2, 0]}
      />

      {/* Central ring */}
      <mesh ref={ringRef} position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.05, 8, 64]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.3} />
      </mesh>

      {/* Outer ring */}
      <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[10, 0.03, 8, 64]} />
        <meshBasicMaterial color="#7B61FF" transparent opacity={0.2} />
      </mesh>

      {/* Ambient lighting effects */}
      <pointLight position={[0, 8, 0]} color="#00F0FF" intensity={0.5} distance={20} />
      <pointLight position={[-8, 4, -8]} color="#FF00E5" intensity={0.3} distance={15} />
      <pointLight position={[8, 4, 8]} color="#7B61FF" intensity={0.3} distance={15} />
    </group>
  );
}
