'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Settings, Bell } from 'lucide-react';

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
    name: 'OpenAI API',
    provider: 'OPENAI',
    color: '#10b981',
    glowColor: '#34d399',
    orbitRadiusX: 4.8,
    orbitRadiusZ: 2.5,
    tilt: [0.15, -0.2, 0.1],
    speed: 0.45,
    size: 0.62
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'GOOGLE',
    color: '#38bdf8',
    glowColor: '#f43f5e',
    orbitRadiusX: 6.4,
    orbitRadiusZ: 3.3,
    tilt: [-0.12, -0.3, 0.18],
    speed: 0.35,
    size: 0.68
  },
  {
    id: 'vercel',
    name: 'Vercel Edge',
    provider: 'VERCEL',
    color: '#f8fafc',
    glowColor: '#cbd5e1',
    orbitRadiusX: 7.8,
    orbitRadiusZ: 4.1,
    tilt: [0.22, 0.15, -0.12],
    speed: 0.28,
    size: 0.58
  },
  {
    id: 'github',
    name: 'GitHub Copilot',
    provider: 'GITHUB',
    color: '#a855f7',
    glowColor: '#c084fc',
    orbitRadiusX: 5.5,
    orbitRadiusZ: 2.9,
    tilt: [-0.18, 0.35, -0.05],
    speed: 0.5,
    size: 0.64
  }
];

function BrandLogo({ id }: { id: string }) {
  if (id === 'github') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (id === 'openai') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    );
  }
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
      <path d="M12 3L22 20H2L12 3Z" />
    </svg>
  );
}

// Synlig glasbubbla med tydlig kropp och kantreflexer
function FacitGlassBubble({
  size,
  color,
  glowColor,
  children
}: {
  size: number;
  color: string;
  glowColor: string;
  children?: React.ReactNode;
}) {
  return (
    <group>
      {/* 1. Mjuk inre neon-kärna med färg */}
      <mesh>
        <sphereGeometry args={[size * 0.92, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 2. Yttre transparent glasskal med skarp kant */}
      <mesh>
        <sphereGeometry args={[size, 48, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={0.08}
          metalness={0.2}
          transmission={0.6}
          ior={1.4}
          thickness={1.2}
          specularIntensity={2.5}
        />
      </mesh>

      {/* 3. Vit reflexbåge på ovansidan */}
      <mesh position={[0, size * 0.45, size * 0.6]} rotation={[-0.35, 0, 0]}>
        <ringGeometry args={[size * 0.12, size * 0.32, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {children}
    </group>
  );
}

// Central bubbla med integrerad sfärisk gradient och vit våg
function FacitCoreBubble() {
  const [waveOffset, setWaveOffset] = useState(0);

  useFrame((state) => {
    setWaveOffset(state.clock.getElapsedTime() * 3.0);
  });

  const waveD = useMemo(() => {
    let d = "M 20 100 ";
    for (let x = 20; x <= 180; x += 4) {
      const y = 100 + Math.sin(x * 0.08 + waveOffset) * 22 + Math.cos(x * 0.14 - waveOffset * 0.7) * 8;
      d += `L ${x} ${y} `;
    }
    return d;
  }, [waveOffset]);

  return (
    <group position={[0, 0, 0]}>
      {/* Kärnans inre färgade sfär (cyan och lila) */}
      <mesh>
        <sphereGeometry args={[1.95, 48, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#6366f1"
          emissiveIntensity={0.65}
          roughness={0.3}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Yttre glashölje */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          roughness={0.05}
          metalness={0.1}
          transmission={0.7}
          ior={1.4}
          thickness={1.5}
          specularIntensity={3.0}
        />
      </mesh>

      {/* Skarp reflexbåge i överkant */}
      <mesh position={[0, 2.1 * 0.45, 2.1 * 0.6]} rotation={[-0.35, 0, 0]}>
        <ringGeometry args={[2.1 * 0.15, 2.1 * 0.38, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Den lysande vita vågen */}
      <Html center transform distanceFactor={9} className="pointer-events-none select-none">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full relative z-10" viewBox="0 0 200 200">
            <path
              d={waveD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 10px rgba(255,255,255,0.95))"
            />
          </svg>
        </div>
      </Html>
    </group>
  );
}

// Tunna eleganta omloppsbanor
function FacitOrbitRing({
  radiusX,
  radiusZ,
  color,
  active
}: {
  radiusX: number;
  radiusZ: number;
  color: string;
  active: boolean;
}) {
  const lineGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusZ));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radiusX, radiusZ]);

  return (
    // @ts-expect-error Three line
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.7 : 0.25}
      />
    </line>
  );
}

function PlanetBubbleNode({
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

  useFrame((_, delta) => {
    angleRef.current += node.speed * delta * 0.4;
    const x = Math.cos(angleRef.current) * node.orbitRadiusX;
    const z = Math.sin(angleRef.current) * node.orbitRadiusZ;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      const scale = hovered || isSelected ? 1.2 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group rotation={node.tilt}>
      <FacitOrbitRing
        radiusX={node.orbitRadiusX}
        radiusZ={node.orbitRadiusZ}
        color={node.glowColor}
        active={isSelected || hovered}
      />

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
        <FacitGlassBubble
          size={node.size}
          color={node.color}
          glowColor={node.glowColor}
        >
          <Html center transform distanceFactor={10} className="pointer-events-none select-none">
            <div 
              className="flex items-center justify-center p-2 rounded-full"
              style={{
                filter: `drop-shadow(0 0 16px ${node.glowColor})`
              }}
            >
              <BrandLogo id={node.id} />
            </div>
          </Html>
        </FacitGlassBubble>
      </group>
    </group>
  );
}

export default function VibeTrackerDashboard() {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(SERVICES[0]);

  return (
    <div className="relative w-full h-screen bg-[#08090d] overflow-hidden select-none font-sans text-white">
      {/* Bakgrundsglöd i centrum */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(56,189,248,0.15) 35%, transparent 70%)'
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
        camera={{ position: [0, 4.8, 11.5], fov: 38 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#08090d']} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 12]} intensity={2.5} />
        <pointLight position={[-10, -5, -8]} intensity={1.5} color="#818cf8" />
        <pointLight position={[10, -5, 8]} intensity={1.2} color="#38bdf8" />

        <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.1}>
          <FacitCoreBubble />
          {SERVICES.map((node) => (
            <PlanetBubbleNode
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={setSelectedNode}
            />
          ))}
        </Float>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            intensity={0.9}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      {/* Undre text under kärnan (som i facit) */}
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
