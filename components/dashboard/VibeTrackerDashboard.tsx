'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Settings, Bell, X } from 'lucide-react';

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

const SERVICES: ServiceNode[] = [
  {
    id: 'openai',
    name: 'OpenAI',
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
    name: 'GitHub',
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
        onClick={(e) => {
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

export default function VibeTrackerDashboard() {
  const [activeNode, setActiveNode] = useState<ServiceNode | null>(null);

  return (
    <div 
      className="relative w-full h-screen bg-[#07090e] overflow-hidden select-none font-sans text-white"
      onClick={() => setActiveNode(null)}
    >
      {/* Bakgrundsglöd */}
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

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 14, 10]} intensity={2.6} />

        <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.1}>
          <CentralVibeBubble />
          {SERVICES.map((node) => (
            <ServiceGlassOrb
              key={node.id}
              node={node}
              isSelected={activeNode?.id === node.id}
              onSelect={(n) => setActiveNode(n)}
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

      {/* RUTA VID KLICK (Tom glassmorphism-ruta som speglar planetens glow) */}
      {activeNode && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-28 left-1/2 -translate-x-1/2 z-30 w-[360px] h-[220px] rounded-2xl border border-white/15 bg-[#0b0f17]/75 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] p-4 transition-all duration-300 animate-in fade-in zoom-in-95 overflow-hidden"
        >
          {/* Speglande glöd i överkant som skiftar med vald planets färg */}
          <div 
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full pointer-events-none opacity-40 filter blur-xl transition-all duration-500"
            style={{
              backgroundColor: activeNode.glowColor
            }}
          />

          {/* Stängningsknapp */}
          <div className="flex justify-end">
            <button 
              onClick={() => setActiveNode(null)}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
