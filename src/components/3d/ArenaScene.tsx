'use client';

import { Suspense, useMemo, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import MarketOrb from './MarketOrb';
import AIAgentAvatar from './AIAgentAvatar';
import ParticleField from './ParticleField';
import ArenaFloor from './ArenaFloor';
import { useMarketStore, useAIAgentStore, useAppStore } from '@/store';
import { getCategoryConfig } from '@/lib/utils';
import { MarketDisplay, AIAgentDisplay } from '@/lib/types';

// Error boundary to catch WebGL / Three.js crashes
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

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
        enableDamping={true}
        dampingFactor={0.08}
        zoomSpeed={0.8}
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
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#00F0FF" distance={30} />
      <pointLight position={[-10, 5, -10]} intensity={0.2} color="#FF00E5" distance={20} />
      <pointLight position={[10, 5, 10]} intensity={0.2} color="#7B61FF" distance={20} />

      {/* Environment */}
      <Stars radius={50} depth={50} count={3000} factor={4} fade speed={0.8} />
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

    </>
  );
}

export default function ArenaScene() {
  const fallback = (
    <div className="w-full h-full min-h-[500px] bg-arena-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-sm">3D Arena could not load</p>
        <p className="text-gray-500 text-xs mt-1">WebGL may not be supported in this browser</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <CanvasErrorBoundary fallback={fallback}>
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
      </CanvasErrorBoundary>

      {/* Overlay gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-arena-surface to-transparent pointer-events-none" />
    </div>
  );
}
