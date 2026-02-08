'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface MarketOrbProps {
  position: [number, number, number];
  question: string;
  yesPercent: number;
  totalPool: string;
  category: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function MarketOrb({
  position,
  question,
  yesPercent,
  totalPool,
  color,
  isSelected,
  onClick,
}: MarketOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Determine size based on pool
  const poolValue = parseFloat(totalPool);
  const size = useMemo(() => {
    return Math.max(0.5, Math.min(1.5, poolValue / 50));
  }, [poolValue]);

  // Determine color based on YES/NO split
  const orbColor = useMemo(() => {
    return new THREE.Color(color);
  }, [color]);

  const glowColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(1.5);
    return c;
  }, [color]);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;

      // Slow rotation
      meshRef.current.rotation.y += 0.003;

      // Pulse when selected
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }

    if (glowRef.current) {
      glowRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
      const glowScale = 1.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(glowScale);
    }

    if (ringRef.current) {
      ringRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
      ringRef.current.rotation.x += 0.01;
      ringRef.current.rotation.z += 0.005;
    }
  });

  // Truncate question
  const shortQuestion = question.length > 30 ? question.slice(0, 30) + '...' : question;

  return (
    <group>
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[size * 1.3, 16, 16]} position={position}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main orb */}
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial
          color={orbColor}
          emissive={orbColor}
          emissiveIntensity={isSelected ? 0.6 : 0.3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Orbital ring */}
      <mesh ref={ringRef} position={position}>
        <torusGeometry args={[size * 1.6, 0.02, 8, 64]} />
        <meshBasicMaterial color={orbColor} transparent opacity={0.4} />
      </mesh>

      {/* YES percentage text */}
      <Text
        position={[position[0], position[1] + size + 0.5, position[2]]}
        fontSize={0.25}
        color={yesPercent > 50 ? '#00FF88' : '#FF4444'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`${yesPercent}% YES`}
      </Text>

      {/* Question text */}
      <Text
        position={[position[0], position[1] - size - 0.4, position[2]]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        textAlign="center"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {shortQuestion}
      </Text>

      {/* Pool amount */}
      <Text
        position={[position[0], position[1] - size - 0.7, position[2]]}
        fontSize={0.12}
        color="#00F0FF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {`${totalPool} AVAX`}
      </Text>
    </group>
  );
}
