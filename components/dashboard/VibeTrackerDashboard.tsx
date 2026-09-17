'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Settings, Bell, X, GripHorizontal } from 'lucide-react';

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
}

interface OpenCard {
  node: ServiceNode;
  x: number;
  y: number;
  zIndex: number;
}

const SERVICES: ServiceNode[] = [
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
    size: 0.65
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
    size: 0.72
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
    size: 0.6
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
    size: 0.68
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
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, colorHex);
      grad.addColorStop(0.35, colorHex + '99');
      grad.addColorStop(0.7, colorHex + '33');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
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
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#818cf8');
      grad.addColorStop(1, '#c026d3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

// 3D Volumetriskt Stjärnfall (syns alltid oavsett kamerarotation)
function ShootingStar() {
  const groupRef = useRef<THREE.Group>(null!);
  const [active, setActive] = useState(false);
  const progressRef = useRef(1);
  const timerRef = useRef(0);
  const nextIntervalRef = useRef(4.0 + Math.random() * 2.0); // 4 till 6 sekunder
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!active) {
      timerRef.current += delta;
      if (timerRef.current >= nextIntervalRef.current) {
        timerRef.current = 0;
        nextIntervalRef.current = 4.0 + Math.random() * 2.0;

        // Skjut snett genom synfältets övre del
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
      {/* Ljusande meteorit-svans (3D-cylinder så den syns i alla vinklar) */}
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

      {/* Skarp vit kärna */}
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
  const coreGrad = useCoreGradientTexture();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {glowTex && (
        <sprite scale={[6.2, 6.2, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      )}

      <pointLight color="#38bdf8" intensity={2.8} distance={8} />

      <mesh ref={meshRef}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshPhysicalMaterial
          map={coreGrad || undefined}
          roughness={0.25}
          metalness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive="#6366f1"
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

function ServiceGlassOrb({
  node,
  isSelected,
  onSelect
}: {
  node: ServiceNode;
  isSelected: boolean;
  onSelect: (node: ServiceNode) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);
  const glowTex = useGlowTexture(node.glowColor);

  useFrame((_, delta) => {
    angleRef.current += node.speed * delta * 0.4;
    const x = Math.cos(angleRef.current) * node.orbitRadiusX;
    const z = Math.sin(angleRef.current) * node.orbitRadiusZ;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      const targetScale = hovered || isSelected ? 1.25 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
    }
  });

  const orbitGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * node.orbitRadiusX, 0, Math.sin(theta) * node.orbitRadiusZ));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [node.orbitRadiusX, node.orbitRadiusZ]);

  return (
    <group rotation={node.tilt}>
      {/* @ts-expect-error Three line */}
      <line geometry={orbitGeometry}>
        <lineBasicMaterial
          color={node.glowColor}
          transparent
          opacity={isSelected || hovered ? 0.75 : 0.35}
        />
      </line>

      <group
        ref={groupRef}
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
        {glowTex && (
          <sprite scale={[node.size * 3.4, node.size * 3.4, 1]}>
            <spriteMaterial
              map={glowTex}
              transparent
              opacity={hovered || isSelected ? 0.75 : 0.45}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        )}

        <mesh>
          <sphereGeometry args={[node.size, 48, 48]} />
          <meshPhysicalMaterial
            color={node.color}
            emissive={node.glowColor}
            emissiveIntensity={hovered || isSelected ? 0.65 : 0.4}
            roughness={0.22}
            metalness={0.08}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
          />
        </mesh>

        <Html center className="pointer-events-none select-none">
          <div className="flex items-center justify-center p-2 rounded-full">
            <BrandLogo id={node.id} />
          </div>
        </Html>
      </group>
    </group>
  );
}

function DraggableCard({
  card,
  onClose,
  onBringToFront,
  onUpdatePosition
}: {
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

  return (
    <div
      onPointerDown={onBringToFront}
      style={{
        left: `${card.x}px`,
        top: `${card.y}px`,
        zIndex: card.zIndex
      }}
      className={`absolute w-[380px] h-[240px] rounded-2xl border border-white/15 bg-[#0b0f17]/85 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] select-none overflow-hidden transition-shadow duration-200 ${
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
          backgroundColor: card.node.glowColor
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
            style={{ backgroundColor: card.node.glowColor }}
          />
          <span>{card.node.name}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 w-full h-[180px] p-4 flex items-center justify-center text-slate-500 text-xs tracking-widest uppercase">
        {/* Tom och ren */}
      </div>
    </div>
  );
}

export default function VibeTrackerDashboard() {
  const [openCards, setOpenCards] = useState<OpenCard[]>([]);
  const [topZ, setTopZ] = useState(40);

  const handleSelectNode = (node: ServiceNode) => {
    setOpenCards((prev) => {
      const existing = prev.find((c) => c.node.id === node.id);
      if (existing) {
        const nextZ = topZ + 1;
        setTopZ(nextZ);
        return prev.map((c) => (c.node.id === node.id ? { ...c, zIndex: nextZ } : c));
      }

      const offset = prev.length * 30;
      const initialX = typeof window !== 'undefined' ? Math.max(40, window.innerWidth / 2 - 190 + offset) : 100;
      const initialY = 120 + offset;
      const nextZ = topZ + 1;
      setTopZ(nextZ);

      return [...prev, { node, x: initialX, y: initialY, zIndex: nextZ }];
    });
  };

  const handleBringToFront = (nodeId: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setOpenCards((prev) =>
      prev.map((c) => (c.node.id === nodeId ? { ...c, zIndex: nextZ } : c))
    );
  };

  const handleUpdatePosition = (nodeId: string, x: number, y: number) => {
    setOpenCards((prev) =>
      prev.map((c) => (c.node.id === nodeId ? { ...c, x, y } : c))
    );
  };

  const handleCloseCard = (nodeId: string) => {
    setOpenCards((prev) => prev.filter((c) => c.node.id !== nodeId));
  };

  return (
    <div className="relative w-full h-screen bg-[#07090e] overflow-hidden select-none font-sans text-white">
      {/* Bakgrundsglöd runt mitten */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(168,85,247,0.12) 40%, transparent 70%)'
        }}
      />

      {/* Header */}
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
          <button className="text-slate-400 hover:text-white transition">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#13151f] flex items-center justify-center font-semibold text-xs text-white">
                RF
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Flikar */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center gap-8 text-xs font-medium text-slate-400">
        <span className="text-slate-200">Overview</span>
        <span>Services</span>
        <span>Usage</span>
        <span>Budgets</span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 4.5, 12], fov: 38 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#07090e']} />

        {/* Lugna stjärnor */}
        <Stars
          radius={65}
          depth={50}
          count={1800}
          factor={2.4}
          saturation={0.3}
          fade
          speed={0}
        />

        {/* 3D Stjärnfall med garanterad synlighet */}
        <ShootingStar />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 14, 10]} intensity={2.6} />

        <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.1}>
          <CentralVibeBubble />
          {SERVICES.map((node) => (
            <ServiceGlassOrb
              key={node.id}
              node={node}
              isSelected={openCards.some((c) => c.node.id === node.id)}
              onSelect={handleSelectNode}
            />
          ))}
        </Float>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.2}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      {/* Draggable Cards */}
      {openCards.map((card) => (
        <DraggableCard
          key={card.node.id}
          card={card}
          onClose={() => handleCloseCard(card.node.id)}
          onBringToFront={() => handleBringToFront(card.node.id)}
          onUpdatePosition={(x, y) => handleUpdatePosition(card.node.id, x, y)}
        />
      ))}

      {/* Text under kärnan */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10 text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-400 font-semibold mb-1">
          Credits Tracking
        </div>
        <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
          VibeTracker
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400 font-medium mt-0.5">
          Usage & Finance Dashboard
        </div>
      </div>

      {/* Telemetri nere till vänster */}
      <div className="absolute bottom-8 left-10 z-20 w-64 rounded-xl border border-white/10 bg-[#0e111a]/75 p-4 backdrop-blur-xl shadow-2xl text-xs">
        <div className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase mb-2">
          Usage Telemetry
        </div>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">API events</span>
            <span className="font-medium text-white font-mono">1200/5hs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">API cash used</span>
            <span className="font-medium text-white font-mono">2999 mts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Recent status</span>
            <span className="font-medium text-emerald-400 font-mono">LIVE API</span>
          </div>
        </div>
      </div>

      {/* Budget nere till höger */}
      <div className="absolute bottom-8 right-12 z-20 flex flex-col gap-3 w-64">
        <div className="rounded-xl border border-white/10 bg-[#0e111a]/75 p-3.5 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">OpenAI Budget</span>
            <span className="font-bold text-white text-sm">80%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 w-[80%]" />
          </div>
        </div>
      </div>

      <button
        onClick={() => alert("Inställningar")}
        className="absolute bottom-5 right-4 z-20 text-slate-500 hover:text-white transition"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
