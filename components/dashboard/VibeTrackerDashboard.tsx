'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Settings, Bell, X, GripHorizontal, Activity, Zap, DollarSign, TrendingUp } from 'lucide-react';

export interface TelemetryMetrics {
  status: 'healthy' | 'warning' | 'critical';
  tier?: string;
  plan?: string;
  subscription?: string;
  monthlyPrice?: number;
  creditBalance?: number;
  spendLimit?: number;
  autoReload?: boolean;
  aiCredits?: {
    used: number;
    total: number;
    resetDate: string;
  };
  meteredUsage?: number;
  includedUsage?: number;
  tokens24h: {
    prompt: number;
    completion: number;
    total: number;
  };
  burnRate: number;
  costMonth: number;
  budgetCap: number;
  latencyMs: number;
  latencyHistory: number[];
  uptimePercent: number;
}

export interface ServiceNode {
  id: string;
  name: string;
  provider: string;
  color: string;
  glowColor: string;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  tilt: [number, number, number];
  speed: number;
  size: number;
  metrics: TelemetryMetrics;
}

interface OpenCard {
  nodeId: string;
  x: number;
  y: number;
  zIndex: number;
}

const INITIAL_SERVICES: ServiceNode[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    provider: 'OPENAI',
    color: '#059669',
    glowColor: '#10b981',
    orbitRadiusX: 4.9,
    orbitRadiusZ: 2.6,
    tilt: [0.15, -0.2, 0.1],
    speed: 0.45,
    size: 0.65,
    metrics: {
      status: 'healthy',
      tier: 'Usage tier 1',
      creditBalance: 2.80,
      spendLimit: 10.00,
      autoReload: false,
      tokens24h: {
        prompt: 1420500,
        completion: 389200,
        total: 1809700
      },
      burnRate: 142.5,
      costMonth: 2.80,
      budgetCap: 10.00,
      latencyMs: 320,
      latencyHistory: [310, 340, 290, 420, 315, 330, 295, 305, 360, 320],
      uptimePercent: 99.98
    }
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'GOOGLE',
    color: '#0284c7',
    glowColor: '#ec4899',
    orbitRadiusX: 6.6,
    orbitRadiusZ: 3.4,
    tilt: [-0.12, -0.3, 0.18],
    speed: 0.35,
    size: 0.72,
    metrics: {
      status: 'healthy',
      tier: 'Developer API',
      tokens24h: {
        prompt: 2840000,
        completion: 820000,
        total: 3660000
      },
      burnRate: 268.0,
      costMonth: 8.40,
      budgetCap: 30.0,
      latencyMs: 245,
      latencyHistory: [260, 250, 240, 270, 230, 245, 238, 255, 240, 245],
      uptimePercent: 99.99
    }
  },
  {
    id: 'vercel',
    name: 'Vercel Edge',
    provider: 'VERCEL',
    color: '#475569',
    glowColor: '#cbd5e1',
    orbitRadiusX: 8.2,
    orbitRadiusZ: 4.2,
    tilt: [0.22, 0.15, -0.12],
    speed: 0.28,
    size: 0.6,
    metrics: {
      status: 'healthy',
      plan: 'Hobby',
      tokens24h: {
        prompt: 620000,
        completion: 140000,
        total: 760000
      },
      burnRate: 48.2,
      costMonth: 0.0,
      budgetCap: 0.0,
      latencyMs: 85,
      latencyHistory: [78, 82, 85, 110, 95, 95, 88, 84, 89, 85],
      uptimePercent: 99.85
    }
  },
  {
    id: 'github',
    name: 'GitHub Copilot',
    provider: 'GITHUB',
    color: '#7c3aed',
    glowColor: '#a855f7',
    orbitRadiusX: 5.6,
    orbitRadiusZ: 3.0,
    tilt: [-0.18, 0.35, -0.05],
    speed: 0.5,
    size: 0.68,
    metrics: {
      status: 'healthy',
      subscription: 'Copilot Max',
      monthlyPrice: 100.0,
      aiCredits: {
        used: 8876,
        total: 20000,
        resetDate: '2026-10-01'
      },
      meteredUsage: 116.29,
      includedUsage: 109.29,
      tokens24h: {
        prompt: 980000,
        completion: 410000,
        total: 1390000
      },
      burnRate: 112.4,
      costMonth: 100.0,
      budgetCap: 100.0,
      latencyMs: 410,
      latencyHistory: [390, 420, 405, 430, 395, 415, 440, 400, 395, 410],
      uptimePercent: 99.94
    }
  }
];

function BrandLogo({ id }: { id: string }) {
  if (id === 'github') {
    return (
      <svg className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" viewBox="0 0 24 24" fill="white">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (id === 'openai') {
    return (
      <svg className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2" />
        <path d="M16 10a4 4 0 0 0-4-4H8" />
        <path d="M12 22a4 4 0 0 0 4-4v-2" />
        <path d="M8 14a4 4 0 0 0 4 4h4" />
        <circle cx="12" cy="12" r="2" fill="white" />
      </svg>
    );
  }
  if (id === 'gemini') {
    return (
      <svg className="w-9 h-9 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    );
  }
  return (
    <svg className="w-7 h-7 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]" viewBox="0 0 24 24" fill="white">
      <path d="M12 3L22 20H2L12 3Z" />
    </svg>
  );
}

function useGlowTexture(colorHex: string) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, colorHex);
    gradient.addColorStop(0.3, colorHex);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [colorHex]);
}

function useCoreGradientTexture() {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#38bdf8');
    gradient.addColorStop(0.5, '#818cf8');
    gradient.addColorStop(1, '#c084fc');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function ShootingStar() {
  const groupRef = useRef<THREE.Group>(null!);
  const [active, setActive] = useState(false);
  const progressRef = useRef(1);
  const timerRef = useRef(0);
  const nextIntervalRef = useRef(4.0 + Math.random() * 2.0);
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!active) {
      timerRef.current += delta;
      if (timerRef.current >= nextIntervalRef.current) {
        timerRef.current = 0;
        nextIntervalRef.current = 4.0 + Math.random() * 2.0;

        const x = 12 + Math.random() * 6;
        const y = 8 + Math.random() * 4;
        const z = -4 - Math.random() * 6;
        startPos.current.set(x, y, z);
        endPos.current.set(x - 28, y - 16, z + 2);
        progressRef.current = 0;
        setActive(true);
      }
    } else {
      progressRef.current += delta * 2.2;
      if (progressRef.current >= 1) {
        setActive(false);
      } else if (groupRef.current) {
        groupRef.current.position.lerpVectors(
          startPos.current,
          endPos.current,
          progressRef.current
        );
      }
    }
  });

  if (!active) return null;

  const opacity = Math.sin(progressRef.current * Math.PI) * 0.9;

  return (
    <group ref={groupRef} rotation={[0, 0, 0.52]}>
      <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.08, 5, 12]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={opacity * 0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function CentralVibeBubble() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowTex = useGlowTexture('#38bdf8');
  const gradientTex = useCoreGradientTexture();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {glowTex && (
        <sprite scale={[5.8, 5.8, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            opacity={0.32}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      )}

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.45, 64, 64]} />
          <meshPhysicalMaterial
            roughness={0.12}
            transmission={0.88}
            thickness={1.6}
            ior={1.48}
            reflectivity={0.9}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            map={gradientTex || undefined}
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Float>

      <Html center className="pointer-events-none">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]">
            SYSTEM CORE
          </span>
          <span className="text-xl font-bold tracking-wider text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
            VIBETRACKER
          </span>
        </div>
      </Html>
    </group>
  );
}

function OrbitRing({
  radiusX,
  radiusZ,
  tilt,
  color
}: {
  radiusX: number;
  radiusZ: number;
  tilt: [number, number, number];
  color: string;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusZ));
    }
    return pts;
  }, [radiusX, radiusZ]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group rotation={tilt}>
      {/* @ts-expect-error Three line primitive */}
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.28} />
      </line>
    </group>
  );
}

function ServiceGlassOrb({
  node,
  onSelect
}: {
  node: ServiceNode;
  onSelect: (node: ServiceNode) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const glowTex = useGlowTexture(node.glowColor);

  useFrame((state) => {
    const t = state.clock.elapsedTime * node.speed;
    const x = Math.cos(t) * node.orbitRadiusX;
    const z = Math.sin(t) * node.orbitRadiusZ;

    const pos = new THREE.Vector3(x, 0, z);
    const euler = new THREE.Euler(...node.tilt);
    pos.applyEuler(euler);

    if (groupRef.current) {
      groupRef.current.position.copy(pos);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {glowTex && (
        <sprite scale={[node.size * 4.2, node.size * 4.2, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            opacity={hovered ? 0.65 : 0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      )}

      <mesh
        ref={meshRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[node.size, 48, 48]} />
        <meshPhysicalMaterial
          roughness={0.15}
          transmission={0.85}
          thickness={1.4}
          ior={1.45}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          color={node.color}
          emissive={node.glowColor}
          emissiveIntensity={hovered ? 0.55 : 0.25}
        />
      </mesh>

      <Html center className="pointer-events-none">
        <div className="flex flex-col items-center justify-center transition-transform duration-200" style={{ transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
          <BrandLogo id={node.id} />
          <span className="mt-2 text-[10px] font-mono tracking-widest uppercase text-slate-300 drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] bg-[#07090e]/75 px-2 py-0.5 rounded border border-white/10">
            {node.provider}
          </span>
        </div>
      </Html>
    </group>
  );
}

function DraggableCard({
  node,
  card,
  onClose,
  onBringToFront,
  onUpdatePosition
}: {
  node: ServiceNode;
  card: OpenCard;
  onClose: () => void;
  onBringToFront: () => void;
  onUpdatePosition: (x: number, y: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, cardX: 0, cardY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    onBringToFront();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardX: card.x,
      cardY: card.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;
    onUpdatePosition(
      dragStartRef.current.cardX + deltaX,
      dragStartRef.current.cardY + deltaY
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const isFreeTier = node.metrics.budgetCap === 0;
  const isFixedPlan = node.id === 'github';

  const budgetUsagePercent = isFreeTier
    ? 0
    : Math.min(100, Math.round((node.metrics.costMonth / node.metrics.budgetCap) * 100));

  const budgetBarColor =
    budgetUsagePercent >= 95
      ? 'bg-rose-500'
      : budgetUsagePercent >= 80
      ? 'bg-amber-400'
      : 'bg-emerald-400';

  const maxLatency = Math.max(...node.metrics.latencyHistory, 1);

  return (
    <div
      onPointerDown={onBringToFront}
      style={{
        left: `${card.x}px`,
        top: `${card.y}px`,
        zIndex: card.zIndex
      }}
      className={`absolute w-[400px] h-[340px] rounded-2xl border border-white/15 bg-[#0b0f17]/85 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] select-none overflow-hidden transition-shadow duration-200 flex flex-col ${
        isDragging ? 'shadow-[0_30px_70px_rgba(0,0,0,0.95)] ring-1 ring-white/20' : ''
      }`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 40%, transparent 100%)'
        }}
      />

      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none opacity-45 filter blur-2xl transition-all duration-500"
        style={{
          backgroundColor: node.glowColor
        }}
      />

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-grab active:cursor-grabbing bg-white/[0.02]"
      >
        <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold text-slate-300">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: node.glowColor }}
          />
          <span>{node.name}</span>
          {(node.metrics.subscription || node.metrics.tier || node.metrics.plan) && (
            <span className="ml-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 lowercase">
              {node.metrics.subscription || node.metrics.tier || node.metrics.plan}
            </span>
          )}
        </div>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 w-full flex-1 p-4 flex flex-col justify-between text-xs">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-400" /> Burn-rate
              </span>
              <span className="text-[10px] text-slate-500">live</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {node.metrics.burnRate.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">tok/s</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                <Activity className="w-3 h-3 text-cyan-400" /> TTFT Latens
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                  node.metrics.status === 'healthy'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : node.metrics.status === 'warning'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                }`}
              >
                {node.metrics.status}
              </span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {node.metrics.latencyMs} <span className="text-[11px] font-normal text-slate-400">ms</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
          {node.metrics.aiCredits ? (
            <>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Copilot Max (${node.metrics.monthlyPrice || 100}/mån)
                </span>
                <span className="font-mono text-[10px] text-slate-300">
                  {node.metrics.aiCredits.used.toLocaleString()} / {node.metrics.aiCredits.total.toLocaleString()} credits
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-purple-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((node.metrics.aiCredits.used / node.metrics.aiCredits.total) * 100)
                    )}%`
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400 font-mono">
                <span>Återställs: {node.metrics.aiCredits.resetDate}</span>
                <span>Inkl: ${node.metrics.includedUsage?.toFixed(2)} | Metered: ${node.metrics.meteredUsage?.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Månadskostnad
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  {isFreeTier
                    ? '$0.00 (Hobby / Fri kvot)'
                    : `$${node.metrics.costMonth.toFixed(2)} / $${node.metrics.budgetCap.toFixed(1)}`}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${budgetBarColor}`}
                  style={{ width: isFreeTier ? '0%' : `${budgetUsagePercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[9px] text-slate-500 font-mono">
                <span>
                  {isFreeTier
                    ? 'Hobby-plan: Inga grundavgifter'
                    : node.metrics.creditBalance !== undefined
                    ? `Förbrukat: ${budgetUsagePercent}% | Saldo: $${node.metrics.creditBalance.toFixed(2)}`
                    : `Förbrukat: ${budgetUsagePercent}%`}
                </span>
                {!isFreeTier && budgetUsagePercent >= 80 && (
                  <span className="text-amber-400 font-semibold tracking-wider uppercase">Tröskelvarning</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 text-indigo-400" /> Latenshistorik (10 anrop)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Uptime: {node.metrics.uptimePercent}%</span>
          </div>
          <div className="h-10 flex items-end justify-between gap-1 pt-1">
            {node.metrics.latencyHistory.map((val, idx) => {
              const heightPercent = Math.max(15, Math.round((val / maxLatency) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-sm bg-indigo-400/50 group-hover:bg-cyan-400 transition-colors"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1 border-t border-white/5 pt-2">
          <span>24H VOLYM: {(node.metrics.tokens24h.total / 1000000).toFixed(2)}M TOKENS</span>
          <span>PROMPT: {(node.metrics.tokens24h.prompt / 1000).toFixed(0)}k | COMPL: {(node.metrics.tokens24h.completion / 1000).toFixed(0)}k</span>
        </div>
      </div>
    </div>
  );
}

export default function VibeTrackerDashboard() {
  const [services, setServices] = useState<ServiceNode[]>(INITIAL_SERVICES);
  const [openCards, setOpenCards] = useState<OpenCard[]>([]);
  const [topZ, setTopZ] = useState(40);

  useEffect(() => {
    fetch('/api/telemetry')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.services)) {
          setServices((prev) =>
            prev.map((s) => {
              const remote = data.services.find((r: { id: string }) => r.id === s.id);
              return remote ? { ...s, metrics: { ...s.metrics, ...remote } } : s;
            })
          );
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((service) => {
          const burnDelta = (Math.random() - 0.48) * 4;
          const currentBurnRate = Math.max(15, service.metrics.burnRate + burnDelta);

          const newTokens = Math.round(currentBurnRate);
          const promptPortion = Math.round(newTokens * 0.72);
          const completionPortion = newTokens - promptPortion;

          // Endast pay-as-you-go (OpenAI och Gemini) ackumulerar löpande token-kostnader
          const costAddition =
            service.id === 'openai'
              ? (newTokens / 1000000) * 3.0
              : service.id === 'gemini'
              ? (newTokens / 1000000) * 1.5
              : 0;

          const nextCost = service.metrics.costMonth + costAddition;

          const latencyDelta = Math.round((Math.random() - 0.5) * 16);
          const nextLatency = Math.max(20, service.metrics.latencyMs + latencyDelta);
          const nextHistory = [...service.metrics.latencyHistory.slice(1), nextLatency];

          const usageRatio =
            service.metrics.budgetCap > 0 ? nextCost / service.metrics.budgetCap : 0;
          const nextStatus: 'healthy' | 'warning' | 'critical' =
            usageRatio >= 0.95 ? 'critical' : usageRatio >= 0.8 ? 'warning' : 'healthy';

          return {
            ...service,
            metrics: {
              ...service.metrics,
              burnRate: currentBurnRate,
              costMonth: nextCost,
              status: nextStatus,
              latencyMs: nextLatency,
              latencyHistory: nextHistory,
              tokens24h: {
                prompt: service.metrics.tokens24h.prompt + promptPortion,
                completion: service.metrics.tokens24h.completion + completionPortion,
                total: service.metrics.tokens24h.total + newTokens
              }
            }
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const alertCount = useMemo(() => {
    return services.filter((s) => s.metrics.status !== 'healthy').length;
  }, [services]);

  const handleSelectNode = (node: ServiceNode) => {
    setOpenCards((prev) => {
      const existing = prev.find((c) => c.nodeId === node.id);
      if (existing) {
        const nextZ = topZ + 1;
        setTopZ(nextZ);
        return prev.map((c) => (c.nodeId === node.id ? { ...c, zIndex: nextZ } : c));
      }

      const offset = prev.length * 30;
      const initialX = typeof window !== 'undefined' ? Math.max(40, window.innerWidth / 2 - 200 + offset) : 100;
      const initialY = 120 + offset;
      const nextZ = topZ + 1;
      setTopZ(nextZ);

      return [...prev, { nodeId: node.id, x: initialX, y: initialY, zIndex: nextZ }];
    });
  };

  const handleBringToFront = (nodeId: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setOpenCards((prev) =>
      prev.map((c) => (c.nodeId === nodeId ? { ...c, zIndex: nextZ } : c))
    );
  };

  const handleUpdatePosition = (nodeId: string, x: number, y: number) => {
    setOpenCards((prev) =>
      prev.map((c) => (c.nodeId === nodeId ? { ...c, x, y } : c))
    );
  };

  const handleCloseCard = (nodeId: string) => {
    setOpenCards((prev) => prev.filter((c) => c.nodeId !== nodeId));
  };

  return (
    <div className="relative w-full h-screen bg-[#07090e] overflow-hidden select-none font-sans text-white">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(168,85,247,0.12) 40%, transparent 70%)'
        }}
      />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-5 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-tight text-white">VibeTracker</span>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium text-slate-300">
          <button className="text-white border-b-2 border-white pb-0.5">Overview</button>
          <button className="hover:text-white transition">Services</button>
          <button className="hover:text-white transition">Usage</button>
          <button className="hover:text-white transition">Budgets</button>
          <button className="hover:text-white transition">Support</button>
        </nav>

        <div className="flex items-center gap-5 text-sm">
          <div className="relative">
            <button className="text-slate-400 hover:text-white transition p-1">
              <Bell className="w-4 h-4" />
            </button>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black ring-2 ring-[#07090e] animate-pulse">
                {alertCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#13151f] flex items-center justify-center font-semibold text-xs text-white">
                RF
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white transition">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <Canvas
        camera={{ position: [0, 8, 17], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#07090e']} />

        <Stars
          radius={65}
          depth={50}
          count={1800}
          factor={2.4}
          saturation={0.3}
          fade
          speed={0}
        />

        <ShootingStar />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 14, 10]} intensity={2.6} />

        <CentralVibeBubble />

        {services.map((node) => (
          <OrbitRing
            key={`orbit-${node.id}`}
            radiusX={node.orbitRadiusX}
            radiusZ={node.orbitRadiusZ}
            tilt={node.tilt}
            color={node.color}
          />
        ))}

        {services.map((node) => (
          <ServiceGlassOrb
            key={node.id}
            node={node}
            onSelect={handleSelectNode}
          />
        ))}

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            intensity={1.2}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={32}
          maxPolarAngle={Math.PI / 2 + 0.15}
          minPolarAngle={0.2}
        />
      </Canvas>

      {openCards.map((card) => {
        const node = services.find((s) => s.id === card.nodeId);
        if (!node) return null;

        return (
          <DraggableCard
            key={card.nodeId}
            node={node}
            card={card}
            onClose={() => handleCloseCard(card.nodeId)}
            onBringToFront={() => handleBringToFront(card.nodeId)}
            onUpdatePosition={(x, y) => handleUpdatePosition(card.nodeId, x, y)}
          />
        );
      })}
    </div>
  );
}
