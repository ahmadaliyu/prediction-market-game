'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { AIAgentDisplay } from '@/lib/types';

interface AIAgentAvatarProps {
  agent: AIAgentDisplay;
  position: [number, number, number];
  onClick: () => void;
}

export default function AIAgentAvatar({ agent, position, onClick }: AIAgentAvatarProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);

  const agentColor = useMemo(() => new THREE.Color(agent.color), [agent.color]);

  // Particle system around agent
  const particles = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (bodyRef.current) {
      // Hovering animation
      bodyRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 2) * 0.2;

      // Slight rotation
      bodyRef.current.rotation.y += 0.005;
    }

    if (coreRef.current) {
      // Pulsing core
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      coreRef.current.scale.setScalar(pulse);
    }

    if (eyeRef.current) {
      // Eye tracking
      const time = state.clock.elapsedTime;
      eyeRef.current.position.x = Math.sin(time * 0.5) * 0.05;
      eyeRef.current.position.y = Math.cos(time * 0.7) * 0.03;
    }

    if (particleRef.current) {
      particleRef.current.rotation.y += 0.003;
      particleRef.current.rotation.x += 0.001;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={bodyRef}
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
        {/* Body - main sphere */}
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial
            color={agentColor}
            emissive={agentColor}
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.85}
          />
        </Sphere>

        {/* Inner core */}
        <Sphere ref={coreRef} args={[0.25, 16, 16]}>
          <meshBasicMaterial color={agentColor} transparent opacity={0.6} />
        </Sphere>

        {/* Eye/Visor */}
        <group position={[0, 0.1, 0.42]}>
          <mesh>
            <planeGeometry args={[0.3, 0.12]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          <mesh ref={eyeRef} position={[0, 0, 0.01]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={agentColor} />
          </mesh>
        </group>

        {/* Orbital particles */}
        <points ref={particleRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particles.length / 3}
              array={particles}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.03}
            color={agentColor}
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>

        {/* Name label */}
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.18}
          color={agent.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {agent.name}
        </Text>

        {/* Accuracy badge */}
        <Text
          position={[0, -1.0, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {`${agent.accuracy}% accuracy`}
        </Text>

        {/* Current bet indicator */}
        {agent.currentBet && (
          <group position={[0, 0.8, 0]}>
            <Sphere args={[0.12, 8, 8]}>
              <meshBasicMaterial
                color={agent.currentBet.outcomeIndex === 0 ? '#00FF88' : '#FF4444'}
              />
            </Sphere>
            <Text
              position={[0, 0.25, 0]}
              fontSize={0.08}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {`#${agent.currentBet.outcomeIndex} (${agent.currentBet.confidence}%)`}
            </Text>
          </group>
        )}
      </group>
    </Float>
  );
}
