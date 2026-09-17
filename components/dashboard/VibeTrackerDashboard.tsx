'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Settings, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ServiceNode {
  id: string;
  name: string;
  provider: string;
  status: 'LIVE' | 'Okänd' | 'Varning';
  statusDetail: string;
  color: string;
  specularColor: string;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  tilt: [number, number, number];
  speed: number;
  size: number;
  currentCredits: string;
  burnRate: string;
  runway: string;
}

const SERVICES: ServiceNode[] = [
  {
    id: 'github',
    name: 'GitHub Copilot',
    provider: 'GITHUB',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#38bdf8',
    specularColor: '#bae6fd',
    orbitRadiusX: 6.2,
    orbitRadiusZ: 3.4,
    tilt: [-0.35, 0.4, -0.1],
    speed: 0.45,
    size: 0.62,
    currentCredits: '$187.50',
    burnRate: '$0.65/h',
    runway: '14 dagar'
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    provider: 'OPENAI',
    status: 'Okänd',
    statusDetail: 'Ej ansluten',
    color: '#f472b6',
    specularColor: '#fbcfe8',
    orbitRadiusX: 4.8,
    orbitRadiusZ: 2.5,
    tilt: [0.45, -0.3, 0.25],
    speed: 0.6,
    size: 0.48,
    currentCredits: '$205.00',
    burnRate: '$2.45/h',
    runway: '6 dagar'
  },
  {
    id: 'gemini',
    name: 'Gemini 1.5 Pro',
    provider: 'GOOGLE',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#34d399',
    specularColor: '#a7f3d0',
    orbitRadiusX: 5.6,
    orbitRadiusZ: 2.9,
    tilt: [-0.15, -0.4, 0.15],
    speed: 0.35,
    size: 0.52,
    currentCredits: '$76.00',
    burnRate: '$1.15/h',
    runway: '32 dagar'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    provider: 'ANTHROPIC',
    status: 'LIVE',
    statusDetail: 'Live API',
    color: '#c084fc',
    specularColor: '#e9d5ff',
    orbitRadiusX: 3.6,
    orbitRadiusZ: 1.9,
    tilt: [0.3, 0.2, -0.2],
    speed: 0.8,
    size: 0.44,
    currentCredits: '$140.00',
    burnRate: '$0.90/h',
    runway: '21 dagar'
  }
];

function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.12;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.55, 64, 64]} />
        <meshStandardMaterial
          color="#747bf6"
          roughness={0.3}
          metalness={0.05}
          emissive="#4338ca"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

function EllipticalOrbitLine({ radiusX, radiusZ }: { radiusX: number; radiusZ: number }) {
  const linePoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusZ));
    }
    return points;
  }, [radiusX, radiusZ]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    return geometry;
  }, [linePoints]);

  return (
    // @ts-expect-error line geometry type
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#475569" transparent opacity={0.3} />
    </line>
  );
}

function OrbitingBody({
  node,
  isSelected,
  onSelect
}: {
  node: ServiceNode;
  isSelected: boolean;
  onSelect: (node: ServiceNode) => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    angleRef.current += node.speed * delta * 0.5;
    const x = Math.cos(angleRef.current) * node.orbitRadiusX;
    const z = Math.sin(angleRef.current) * node.orbitRadiusZ;

    if (planetRef.current) {
      planetRef.current.position.set(x, 0, z);
      planetRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group rotation={node.tilt}>
      <EllipticalOrbitLine radiusX={node.orbitRadiusX} radiusZ={node.orbitRadiusZ} />

      <mesh
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[node.size, 48, 48]} />
        <meshPhysicalMaterial
          color={node.color}
          roughness={0.18}
          metalness={0.1}
          clearcoat={0.7}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
    </group>
  );
}

export default function VibeTrackerDashboard() {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(SERVICES[0]);

  return (
    <div className="relative w-full h-screen bg-[#07080d] overflow-hidden select-none font-sans text-white">
      {/* Topp-navigering */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-5 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-tight text-white">VibeTracker</span>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium text-slate-300">
          <button className="text-white border-b-2 border-white pb-0.5">Overview</button>
          <button className="hover:text-white transition">Services</button>
          <button className="hover:text-white transition">Usage</button>
          <button className="hover:text-white transition">Budgets</button>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-semibold text-xs shadow-md">
              VT
            </div>
          </div>
          <button className="text-slate-300 hover:text-white transition text-xs">Logga ut</button>
        </div>
      </header>

      {/* Underliggande rubrikrad */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center gap-8 text-xs font-medium text-slate-400">
        <span className="text-slate-200">Overview</span>
        <span>Services</span>
        <span>Usage</span>
        <span>Budgets</span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 4.2, 11], fov: 38 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#07080d']} />
        <Stars radius={60} depth={40} count={2500} factor={3} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[12, 18, 10]} intensity={1.8} />
        <pointLight position={[-10, -5, -8]} intensity={0.4} color="#6366f1" />

        <Float speed={1} rotationIntensity={0.08} floatIntensity={0.15}>
          <CentralStar />
          {SERVICES.map((node) => (
            <OrbitingBody
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={setSelectedNode}
            />
          ))}
        </Float>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 - 0.08}
        />
      </Canvas>

      {/* Textetikett ovanpå centrala stjärnan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-center">
        <div className="text-2xl font-bold tracking-wider text-white drop-shadow-md">1.</div>
        <div className="text-[9px] uppercase tracking-widest text-slate-200/80 font-mono">Live Sources</div>
      </div>

      {/* Vänster panel: Usage Telemetry */}
      <div className="absolute bottom-8 left-10 z-20 w-64 rounded-xl border border-white/10 bg-[#0e111a]/70 p-4 backdrop-blur-xl shadow-2xl text-xs">
        <div className="text-[10px] font-semibold tracking-wider text-teal-400 uppercase mb-2">
          Usage Telemetry
        </div>
        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Provider</span>
            <span className="font-medium text-white">{selectedNode?.name || 'GitHub Copilot'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Source</span>
            <span className="font-medium text-white">{selectedNode?.statusDetail || 'Live API'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Period</span>
            <span className="font-medium text-white">september 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className="font-medium text-emerald-400">Validated</span>
          </div>
        </div>
      </div>

      {/* Höger paneler: Statuskort */}
      <div className="absolute bottom-8 right-12 z-20 flex flex-col gap-3 w-56">
        <div className="rounded-xl border border-white/10 bg-[#0e111a]/70 p-3.5 backdrop-blur-xl shadow-xl">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">OPENAI</div>
          <div className="text-lg font-bold text-white tracking-wide">Okänd</div>
          <div className="text-[11px] text-slate-400">Ej ansluten</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0e111a]/70 p-3.5 backdrop-blur-xl shadow-xl">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">GITHUB</div>
          <div className="text-lg font-bold text-white tracking-wide">LIVE</div>
          <div className="text-[11px] text-slate-400">Live API</div>
        </div>
      </div>

      {/* Inställningsknapp i hörnet */}
      <button 
        onClick={() => alert("Inställningar öppnade.")}
        className="absolute bottom-5 right-5 z-20 text-slate-400 hover:text-white transition"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
