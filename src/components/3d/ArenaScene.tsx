'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import MarketOrb from './MarketOrb';
import AIAgentAvatar from './AIAgentAvatar';
import ParticleField from './ParticleField';
import ArenaFloor from './ArenaFloor';
import { useMarketStore, useAIAgentStore, useAppStore } from '@/store';
import { getCategoryConfig } from '@/lib/utils';
import { MarketDisplay, AIAgentDisplay } from '@/lib/types';
import * as THREE from 'three';

function ArenaContent() {
  const markets = useMarketStore((s) => s.filteredMarkets);
  const agents = useAIAgentStore((s) => s.agents);
  const selectedMarketId = useAppStore((s) => s.selectedMarketId);
  const selectMarket = useAppStore((s) => s.selectMarket);
  const selectAgent = useAIAgentStore((s) => s.selectAgent);

  // Position markets in a circle
  const marketPositions = useMemo(() => {
    const radius = 6;
    return markets.slice(0, 8).map((_, i) => {
      const angle = (i / Math.min(markets.length, 8)) * Math.PI * 2;
      return [
        Math.cos(angle) * radius,
        1 + Math.sin(i * 0.5) * 0.5,
        Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, [markets]);

  // Position agents between market orbs
  const agentPositions = useMemo(() => {
    const radius = 3;
    return agents.map((_, i) => {
      const angle = (i / agents.length) * Math.PI * 2 + Math.PI / 4;
      return [
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, [agents]);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 6, 14]} fov={60} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 1, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} color="#ffffff" />

      {/* Environment */}
      <Stars radius={50} depth={50} count={2000} factor={4} fade speed={1} />
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a1a', 15, 40]} />

      {/* Arena Floor */}
      <ArenaFloor />

      {/* Particle Field */}
      <ParticleField />

      {/* Market Orbs */}
      {markets.slice(0, 8).map((market: MarketDisplay, i: number) => (
        <MarketOrb
          key={market.id}
          position={marketPositions[i]}
          question={market.question}
          yesPercent={market.yesPercent}
          totalPool={market.totalPool}
          category={market.category}
          color={getCategoryConfig(market.category).color}
          isSelected={selectedMarketId === market.id}
          onClick={() => selectMarket(market.id)}
        />
      ))}

      {/* AI Agent Avatars */}
      {agents.map((agent: AIAgentDisplay, i: number) => (
        <AIAgentAvatar
          key={agent.name}
          agent={agent}
          position={agentPositions[i]}
          onClick={() => selectAgent(agent)}
        />
      ))}

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
}

export default function ArenaScene() {
  return (
    <div className="w-full h-full min-h-[500px] relative">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#0a0a1a' }}
      >
        <Suspense fallback={null}>
          <ArenaContent />
        </Suspense>
      </Canvas>

      {/* Overlay gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-arena-surface to-transparent pointer-events-none" />
    </div>
  );
}
